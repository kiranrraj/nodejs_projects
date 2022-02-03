const {userList,
    getCurrentUser,
    removeCurrentUser,
    getUsersInRoom} = require('./utils/user');

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
io.on('connection', socket =>{

    socket.on('joinRoom', ({username, chatroom}) => {

        const user = userList(socket.id, username, chatroom);
        socket.join(user.chatroom);

        // Emitting greetings to client when the client join the room
        socket.emit('greetingsFromServer', {
            from: 'Bot', 
            text: `Welcome ${username} to the ${chatroom}'s chat room.`, 
            time: getTime(new Date())
        });

        // Broadcast the message of a new user joining the chat to other
        // memebers in the group.
        socket.broadcast
        .to(user.chatroom)
        .emit('connectionMsgFromServer', {
            from: 'Bot', 
            text: `${username} has joined the ${chatroom}'s chat room.`, 
            time: getTime(new Date())
        });

    });

    console.log("A new user just connected");
    

    // Listen for chat message
    socket.on('chatMessage', (msg) => {
        console.log(msg);
        const user = getCurrentUser(socket.id);
        console.log(user);
        io.emit('message', msg);
    });


    socket.on('disconnect', ()=>{

        // Get the user using the socked id which is created when
        // the user left the chat.
        const user = removeCurrentUser(socket.id);

        // Send message to users in the room about the user's exit
        // from the room
        if(user) {
            io.to(user.chatroom).emit('connectionMsgFromServer', {
                from: 'Bot', 
                text: `${user.username} left the chat.`, 
                time: getTime(new Date())
            });

            // Send users in the room to the page
            io.to(user.room).emit('roomUsers', {
                chatroom: user.chatroom,
                users: getUsersInRoom(user.chatroom)
            });
        }
        
    });
    
})

// Set port to listen
server.listen(PORT, ()=>{
    console.log(`Server running on localhost:${PORT}`);
});

