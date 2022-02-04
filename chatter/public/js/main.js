// Get form from message window
const msgForm = document.querySelector('.msgform');
const msgData = document.querySelector('.msg--data');
const chatDiv = document.querySelector('.messenger--right');
const roomName = document.querySelector('.top--roomName');
const userDiv = document.querySelector('.bottom--usersBlock');
const leaveBtn = document.querySelector('.nav--btn');


function getTime(today){
    let date = `${today.getDate()}/${(today.getMonth()+1)}/${today.getFullYear()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return date+' '+time;
}

let createElement = (type, className, msg) => {
    const element = document.createElement(type);
    element.classList.add(className);
    element.innerText = msg;
    return element
}

function outputMsg(chatMsg){

    let wrapper = createElement('div', 'right--msg', null);
    let wrapperData = createElement('p', 'msg--data', chatMsg.text);
    wrapper.appendChild(wrapperData);
    let wrapperMeta = createElement('div', 'msg--meta', null);
    wrapper.appendChild(wrapperMeta);
    let wrapperMetaName = createElement('p', 'msg--name', chatMsg.from);
    let wrapperMetaTime = createElement('p', 'msg--date', chatMsg.time);
    wrapperMeta.appendChild(wrapperMetaName);
    wrapperMeta.appendChild(wrapperMetaTime);
    chatDiv.appendChild(wrapper);
}

function outFromServer(msg){
    let wrapper = createElement('div', 'right--serverMsg', null);
    let wrapperMeta = createElement('div', 'serverMsg--meta', null);
    let wrapperData = createElement('p', 'serverMsg--text', msg.text);
    let wrapperMetaName = createElement('p', 'serverMsg--name', msg.from);
    let wrapperMetaTime = createElement('p', 'serverMsg--date', msg.time);
    wrapper.appendChild(wrapperData);
    wrapper.appendChild(wrapperMeta);
    wrapperMeta.appendChild(wrapperMetaName);
    wrapperMeta.appendChild(wrapperMetaTime);
    chatDiv.appendChild(wrapper);
}

function autoScroll(){
    chatDiv.scrollTop = chatDiv.scrollHeight
    console.log("Connected to the server");
}

// Get user name, user email and chatroom from uri string
let {username, useremail, chatroom } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// Add room name to web page
function updateRoomName(chatroom){
    roomName.textContent = chatroom;
}

// Display users in web page .bottom--users
function displayUsers(users){
    userDiv.innerHTML = "";
    users.forEach((user) => {
        let userList =  createElement('p', 'bottom--users', user.username);
        userDiv.appendChild(userList);
    });
}

let socket = io();

// Send details to server
socket.emit('joinRoom', {username, chatroom});

socket.on('usersInRoom', ({ chatroom, users }) => {
    displayUsers(users);
    updateRoomName(chatroom)
});

socket.on('connectionMsgFromServer', function(connectionMsg){
    outFromServer(connectionMsg);
    autoScroll();
});

socket.on('greetingsFromServer', function(greetMsg){
    outputMsg(greetMsg);
    autoScroll();
});

socket.on('disconnect', () =>{
    console.log("Disconnect from the server");
});

msgForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get the message from the input
    let chat = e.target.elements[0].value;
    chat = chat.trim();

    if(!chat) return false;

    // Send message to the server
    socket.emit('chatMessage', chat);
    e.target.elements[0].value = "";
    e.target.elements[0].focus();
});

socket.on('chatMessage', msg => {
    console.log(msg);
    outputMsg(msg);
    autoScroll();
});

leaveBtn.addEventListener('click', () => {
    const confimLeave = confirm('Do you want to leave the room?');
    if(confimLeave) {
        window.location = '../index.html';
    }else{
        return false;
    }
})