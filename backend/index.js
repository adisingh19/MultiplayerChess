import express from "express";
import { Server } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import http from "http"

const app=express()

const server=http.createServer(app)

const port=process.env.port||8080

const io=new Server(server,{
    cors:'*',//allow connection from any origin
})

//io.connection

server.listen(port,()=>{
    console.log(`Listening on port ${port}`)

})

const rooms=new Map()


io.on('connection',(socket)=>{
    console.log(socket.id,'connected')

    socket.on('username',(username)=>{
        console.log('username:',username)
        socket.data.username=username
    })

    //create room

    socket.on('createRoom',async(callback)=>{//here callback refers to the callback function from the client passed as data
        const roomId=uuidV4();//1 create a new uuid

        await socket.join(roomId)//make creating user join the room

        //set room id as the key and roomdata including players as value in the map

        rooms.set(roomId,{//<-3
            roomId,
            players:[{id:socket.id,username:socket.data?.username}]

        })

         // returns Map(1){'2b5b51a9-707b-42d6-9da8-dc19f863c0d0' => [{id: 'socketid', username: 'username1'}]}

         callback(roomId)// 4 respond with roomid to client by calling the callback from the client

    })

    socket.on('joinRoom',async(args,callback)=>{
        //check if the room exists and has player waiting
        const room=rooms.get(args.roomId)

        let error,message

        if(!room){
            error=true
            message="Room does not exist"
        }
        else if(room.length<=0){
            error=true
            message="Room is empty"
        }
        else if(room.length>=2){
            error=true
            message="Room is full"
        }

        if(error){
            //call the callback if it exists with an error object
            if(callback){
                callback({
                    error,
                    message
                })
            }
            return
        }

        await socket.join(args.roomId)//make the joining client join the room

        //add the player to the room
        const roomUpdate={
            ...room,
            players:[
                ...room.players,
                {id:socket.id,username:socket.data?.username}
            ]
        }

        rooms.set(args.roomId,roomUpdate)
        callback(roomUpdate)


        //emit an opponent joint event yo the room to tell other players that an opponent has joined

        socket.to(args.roomId).emit('opponentJoined',roomUpdate)
    })

    socket.on("move",(data)=>{

        //emit to all sockets in room except the emitting socket
        socket.to(data.room).emit('move',data.move)
    })

    socket.on("disconnect",()=>{
        const gameRooms=Array.from(rooms.values())

        gameRooms.forEach((room)=>{
            const userInRoom=room.players.find((player)=>player.id===socket.id)

            if (userInRoom) {
                if (room.players.length < 2) {
                  // if there's only 1 player in the room, close it and exit.
                  rooms.delete(room.roomId);
                  return;
                }
        
                socket.to(room.roomId).emit("playerDisconnected", userInRoom); // <- 4
              }
        })
    })

    socket.on("closeRoom",async(data)=>{
        socket.to(data.roomId).emit("closeRoom",data)//inform other in the room that the room is closing

        const clientSockets=await io.in(data.roomId).fetchSockets()//get all sockets in a room

        //loop over each socket client

        clientSockets.forEach((s)=>{

            s.leave(data.roomId)//make them leave the room 
        })

        rooms.delete(data.roomId)
    })
})