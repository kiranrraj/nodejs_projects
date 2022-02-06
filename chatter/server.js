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

    // Add the user to the room selected by the user
    socket.on('joinRoom', ({username, chatroom}) => {

        const user = userList(socket.id, username, chatroom);

        // User joins the room
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

        // Send user's list to the chat page.
        io.to(user.chatroom).emit('usersInRoom', {
            chatroom: user.chatroom,
            users: getUsersInRoom(user.chatroom)
        });

    });

    // Listen for chat message
    socket.on('chatMessage', (msg) => {
        // console.log(msg, socket.id);
        const user = getCurrentUser(socket.id);
        console.log("From server" ,user, socket.id)
        let formatMsg = {
            from: `${user.username}`, 
            text: msg, 
            time: getTime(new Date())
        };
        io.to(user.chatroom).emit('chatMessage', formatMsg);
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

            // Update users in the room to the page
            io.to(user.chatroom).emit('usersInRoom', {
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

