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