import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import CustomDialog from "./components/CustomDialog";
import socket from "./socket";

const InitGame = ({setRoom,setOrientation,setPlayers}) => {
    const [roomDialogOpen, setRoomDialogOpen] = useState(false)
    const [roomInput, setRoomInput] = useState('')//input state
    const [roomError, setRoomError] = useState('')

  return (
    <Stack
    justifyContent="center"
    alignItems="center"
    sx={{py:1,height:"100vh"}}
    >

        <CustomDialog
            open={roomDialogOpen}
            handleClose={()=>setRoomDialogOpen(false)}
            title="Select room to join"
            contentText="Enter room code"
            handleContinue={()=>{
                //join room
                if(!roomInput){
                    return
                }

                socket.emit("joinRoom",{roomId:roomInput},(r)=>{
                    //r is the response from the server

                    if(r.error){
                        return setRoomError(r.message)
                    }
                    console.log("response:",r)

                    setRoom(r?.roomId)//set room to the room id
                    setPlayers(r?.players)//set players array ro the array of players in the room
                    setOrientation("black");//set the orientation as black
                    setRoomDialogOpen(false);//close dialog
                })
            }}

        >
            <TextField
                autoFocus
                margin="dense"
                id="room"
                label="Room code"
                name="room"
                value={roomInput}
                required
                onChange={(e)=>setRoomInput(e.target.value)}
                type="text"
                fullWidth
                variant="standard"
                error={Boolean(roomError)}
                helperText={!roomError ? 'Enter a room ID' : `Invalid room ID: ${roomError}` }
            />
        </CustomDialog>

        {/*button for starting a game */}
        <Button
        variant="contained"
        onClick={()=>{
            //create a room
            socket.emit("createRoom",(r/*room id argument */)=>{
                console.log(r)
                setRoom(r)
                setOrientation('white')
            })
        }}
        >
            Create a Game
        </Button>

        {/*button to join a game */}
        <Button
        onClick={()=>{
            setRoomDialogOpen(true)
        }}
        >
            Join a Game
        </Button>
    </Stack>
  )
}
export default InitGame