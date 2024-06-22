import{io} from "socket.io-client"
const socket=io('localhost:8080')

export default socket

//io function is collected with server address as function argument which initiates socket connection

