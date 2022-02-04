// Initialize user array
let users = [];

// Inser user in the user list
function userList(id, username, chatroom){
    const user = {id, username, chatroom}
    users.push(user);
    return user;
}

console.log(users);

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// Remove User from the list
function removeCurrentUser(id) {
    const userIndex =  users.findIndex(user => user.id === id);

    if(userIndex !== -1) {
        return users.splice(userIndex, 1)[0];
    }
}

// Get users in a room
function getUsersInRoom(chatroom){
    return users.filter(user => user.chatroom === chatroom);
}

module.exports = {
    userList,
    getCurrentUser,
    removeCurrentUser,
    getUsersInRoom
};