// To set the path of the public folder 
const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '/../public');

// socket.io
const socketIO = require('socket.io');

// Express
const express = require('express');
let app = express();
const PORT = process.env.PORT || 3000;

let server = http.createServer(app);
let io = socketIO(server);

// Set static folder
app.use(express.static(publicPath));

// Listen for events
io.on('connection', (socket) =>{
    console.log("A new user just connected");
    
    socket.emit('msgFromServer', {From: 'Bot', Text: "Welcome to the chat", createdAt: new Date().getTime()});

    socket.broadcast.emit('msgFromServer', {From: 'Bot', Text: "New User joined the chat", createdAt: new Date().getTime()});

    socket.on('disconnect', ()=>{
        console.log("A user disconnected from the server");
        io.emit('msgFromServer', {From: 'Bot', Text: "A user left the chat", createdAt: new Date().getTime()});
    });

    socket.on('msgFromClient', function(message){
        console.log(`Message Received From "${message.From}". Message: "${message.Text}"`);
    });
})

// Set port to listen
server.listen(PORT, ()=>{
    console.log('Server running on localhost:3000');
});

