// Get form from message window
const msgForm = document.querySelector('.msgform');
const msgData = document.querySelector('.msg--data');
const chatDiv = document.querySelector('.messenger--right');

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
    let wrapper = createElement('div', 'right--serverMsg', null, chatDiv);
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
    console.log(chatDiv.scrollTop, chatDiv.scrollHeight)
}


let socket = io();

socket.on('connect', () =>{
    console.log("Connected to the server");
    // autoScroll();
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
    const chat = e.target.elements[0].value;
    let userMsg = {
        text: chat,
        from: "user",
        time: getTime(new Date())
    }
    
    // Send message to the server
    socket.emit('chatMessage', userMsg);
    e.target.elements[0].value = "";
});

socket.on('message', msg => {
    console.log(msg);
    outputMsg(msg);
    autoScroll();
})