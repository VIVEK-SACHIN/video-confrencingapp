const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
// const cors = require('cors');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(express.static(join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public','index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
        // io.emit('chat message', msg);
        console.log(msg)
    });
    socket.on("Sdp-offer", (msg) => {
        socket.broadcast.emit("Sdp-offer", msg);
    });
    socket.on("Sdp-answer", (msg) => {

        socket.broadcast.emit("Sdp-answer", msg);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
