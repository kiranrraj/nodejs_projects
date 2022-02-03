// Get form from message window
const msgForm = document.querySelector('.msgform');

let socket = io();

socket.on('connect', () =>{
    console.log("Connected to the server");
});

socket.on('msgFromServer', function(message){
    console.log(`Message Received From "${message.From}". Message: "${message.Text}"`);
});

socket.on('disconnect', () =>{
    console.log("Disconnect from the server");
});

msgForm.addEventListener('submit', e => {
    e.preventDefault();
    const userMessage = e.target.elements[0].value;
    console.log(userMessage);
    socket.emit('chatMessage', userMessage);
});