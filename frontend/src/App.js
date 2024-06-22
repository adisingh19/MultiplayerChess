
import { Container, TextField } from "@mui/material"
import Game from "./Game"
import { useCallback, useEffect, useState } from "react"
import CustomDialog from "./components/CustomDialog"
import socket from "./socket"
import InitGame from "./InitGame"


const App = () => {
  const [username, setUsername] = useState('')
  //indicates if the username has been submitted
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)

  const [room, setRoom] = useState("")
  const [orientation, setOrientation] = useState("")
  const [players, setPlayers] = useState([])


  //resets the states responsible for initializing the game

  const cleanup=useCallback(()=>{
    setRoom("")
    setOrientation("")
    setPlayers([])

  },[])


  useEffect(()=>{
    //const username=prompt("Username")
    //setUsername(username)
    //socket.emit("username",username)

    socket.on("opponentJoined",(roomData)=>{
      console.log("roomData",roomData)
      setPlayers(roomData.players)
    })
  },[])

  return (
    <Container>
      <CustomDialog 
      open={!usernameSubmitted}//leave open if the username has not been selected
      title="Enter username"//title of dialog
      contentText="Please enter a username"//content text of dialog
      handleContinue={()=>{//fired when continue is clicked
        if(!username){
          return
        }
        socket.emit("username",username)//emit a websocket event called username with username as data
        setUsernameSubmitted(true)//indicate that the username has been submitted
      }}
      >

        <TextField //input
          autoFocus//automatically set focus on input(make it active)
          margin="dense"
          id="username"
          label="Username"
          name="username"
          value={username}
          required
          onChange={(e)=>setUsername(e.target.value)}
          type="text"
          fullWidth
          variant="standard"
        />
      </CustomDialog>
      
      {
        room?(
          <Game
          room={room}
          orientation={orientation}
          username={username}
          players={players}
          cleanup={cleanup}//it will be used by game to reset the state when a game is over
          ></Game>
        ):(
          <InitGame
            setRoom={setRoom}
            setOrientation={setOrientation}
            setPlayers={setPlayers} />
        )
      }
      
    </Container>
  )
}
export default App