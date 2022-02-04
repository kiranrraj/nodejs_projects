// Initialize user array
let users = [];

// Function to capitalize the user name
function capitalizeName(name){
    let username = name.toLowerCase();
    username = name.charAt(0).toUpperCase() + name.slice(1);
    return username;
}

// Inser user in the user list
function userList(id, username, chatroom){
    username = capitalizeName(username);
    const user = {id, username, chatroom};
    users.push(user);
    return user;
}

// Get current user
function getCurrentUser(id) {
    console.log(users.find(user => user.id === id));
    return users.find(user => user.id === id);
}

// Get users in a room
function getUsersInRoom(chatroom){
    return users.filter(user => user.chatroom === chatroom);
}

// Remove User from the list
function removeCurrentUser(id) {
    const userIndex =  users.findIndex(user => user.id === id);

    if(userIndex !== -1) {
        return users.splice(userIndex, 1)[0];
    }
}



module.exports = {
    userList,
    getCurrentUser,
    getUsersInRoom,
    removeCurrentUser
};