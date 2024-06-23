const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 4500; // Use environment variable PORT or default to 4500

const users = {};

app.use(cors({
    origin: "*", // Adjust this for your frontend URL in production
    methods: ["GET", "POST"],
}));

app.get("/", (req, res) => {
    res.send("HELLO, IT'S WORKING");
});

const server = createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        console.log(`${user} has joined`);
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat ${users[socket.id]}` });
    });

    socket.on('message', ({ message, id }) => {
        io.emit('sendMessage', { user: users[id], message, id });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` });
            console.log(`${users[socket.id]} has left`);
            delete users[socket.id];
        }
    });
});

// Export server to be used in Vercel
module.exports = server;
