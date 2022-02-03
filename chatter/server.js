const http = require('http');

// socket.io
const socketIO = require('socket.io');

// Express
const express = require('express');
let app = express();
const PORT = process.env.PORT || 3000;

let server = http.createServer(app);
let io = socketIO(server);

function getTime(today){
    let date = `${today.getDate()}/${(today.getMonth()+1)}/${today.getFullYear()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return date+' '+time;
}

// Set static folder
app.use(express.static('public'));

// Listen for events
io.on('connection', (socket) =>{
    console.log("A new user just connected");
    
    // Emitting greetings to client when the client join the room
    socket.emit('greetingsFromServer', {from: 'Bot', text: "Welcome to the chat", time: getTime(new Date())});

    socket.broadcast.emit('connectionMsgFromServer', {from: 'Bot', text: "New User joined the chat", time: getTime(new Date())});

    socket.on('disconnect', ()=>{
        console.log("A user disconnected from the server");
        io.emit('connectionMsgFromServer', {from: 'Bot', text: "A user left the chat", time: getTime(new Date())});
    });

    // Listen for chat message
    socket.on('chatMessage', (msg) => {
        console.log(msg);
        io.emit('message', msg);
    })
})

// Set port to listen
server.listen(PORT, ()=>{
    console.log('Server running on localhost:3000');
});

