import { useCallback, useEffect, useMemo, useState } from "react";
import {Chessboard} from "react-chessboard"
import {Chess} from "chess.js"
import CustomDialog from "./components/CustomDialog";
import socket from "./socket";
import { Box, Card, CardContent, List, ListItem, ListItemText, ListSubheader, Stack, Typography } from "@mui/material";


const Game = ({ players, room, orientation, cleanup }) => {
    const chess=useMemo(()=> new Chess(),[])//1 //we created memoized chess intstance with 0 dependencies 
    //the use memeo hook let us cache the chess instance between re renders so that the instance is not created every render
    //this chess instance will be used for move validation
    const [fen, setFen] = useState(chess.fen())//2
    const [over, setOver] = useState("")


    const makeAMove=useCallback(//we used callback hook as a dependency in order to cache the function definiton between re renders and avoid creating the function //on every re render
        (move)=>{
            try {
                const result=chess.move(move)//update the chess instance
                setFen(chess.fen())//update fen to re render

                console.log("over,checkmate",chess.isGameOver(),chess.isCheckmate())

                if(chess.isGameOver()){//check if the move led to game over
                    if(chess.isCheckmate()){//if the reason of game over is checkmate
                        //set message to checkmate

                        setOver(`Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins!`);

                        //the winner is determined buy checking which side made the last move
                    }
                    else if(chess.isDraw()){
                        //if it is draw
                        setOver("Draw")
                    }
                    else{
                        setOver("Game over")
                    }
                }

                return result
            } catch (e) {
                return  null
            }//null if the move was illegal the move object if the move was legal
        },[chess]
    )
    
    function onDrop(sourceSquare,targetSquare){//it takes in inital and final square makes the object based on info and then 

        //orientation is either white or black game.turn() returs w or b

        if(chess.turn()!==orientation[0]){
            return false
        }

        if(players.length<2){
            return false;
        }
        
        //initialized the make move function
        const moveData={
            from:sourceSquare,
            to:targetSquare,
            color:chess.turn(),
            promotion:"q",//promote to queen where possible
        }

        const move=makeAMove(moveData);

        //illegal move
        if(move===null){
            return false
        }

        socket.emit("move",{
            move,
            room,
        })//this event will be transmitted to the opponent via the server
        return true
    }//<-3

    useEffect(()=>{
        socket.on("move",(move)=>{
            makeAMove(move)//
        })
    },[makeAMove])

    useEffect(()=>{
        socket.on("playerDisconnected",(player)=>{
            setOver(`${player.username} has disconnected`); // set game over
            
        })
    },[])


    useEffect(()=>{
        socket.on('closeRoom',({roomId})=>{
            if(roomId===room){
                cleanup()
            }
        })
    },[room,cleanup])


  return (
    <>
    <Stack>
        <Card>
            <CardContent>
                <Typography variant="h5">Room ID:{room}</Typography>
            </CardContent>
        </Card>
        <Stack flexDirection="row" sx={{pt:2}}>
            <div className="board" 
            style={{
                maxWidth:600,
                maxHeight:600,
                flexGrow:1,
            }}>
                <Chessboard 
                position={fen} 
                onPieceDrop={onDrop}
                boardOrientation={orientation} /> {/*4 */}
            </div>

            {players.length>0&&(
                <Box>
                    <List>
                        <ListSubheader>Players</ListSubheader>
                        {players.map((p)=>(
                            <ListItem key={p.id}>
                                <ListItemText primary={p.username}/>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Stack>

        <CustomDialog // Game Over CustomDialog
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleContinue={() => {
            setOver("");
        }}
         />

         <CustomDialog //game over
          open={Boolean(over)}
          title={over}
          handleContinue={() => {
            socket.emit("closeRoom", { roomId: room });
            cleanup();
          }}></CustomDialog>
    </Stack>
    
    </>
  )
}
export default Game