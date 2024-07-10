const http=require("http");
const express =require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const path = require("path");
const dotenv=require("dotenv");
const app=express();
const port=4500|| process.env.PORT ;
dotenv.config();

const users=[{}];

app.use(cors());

const __dirname1=path.resolve();
if(process.env.NODE_ENV==='production')
{
    app.use(express.static(path.join(__dirname1,'/ccat/build')));
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname1,'ccat','build','index.html'));
    })
}
else{
    app.get("/",(req,res)=>{
        res.send("HELL ITS WORKING");
    })
}
const server=http.createServer(app);

const io=socketIO(server);

io.on("connection",(socket)=>{
console.log("New Connection");
 socket.on('joined',({user})=>{
          users[socket.id]=user;
          console.log(`${user} has joined `);
          socket.broadcast.emit('userJoined',{user:"Admin",message:`${users[socket.id]} has  joined`});
          socket.emit('welcome',{user:"Admin",message:`Welcome to the chat ${users[socket.id]}`});
         })
      socket.on('message',({message,id})=>
    {
          io.emit('sendmessage',{user:users[id],message,id})
    })
    socket.on('disconnect',()=>
    {
        socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]} has  left`})
         console.log('User left')
    })
});


server.listen(port,()=>{
    console.log(`Working`);
}) 