require('dotenv/config');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const {verify} = require('jsonwebtoken');
const {hash, compare} = require('bcryptjs');

const express = require('express');
const server = express();

server.use(cookieParser());
server.use(cors({
    origin:'http://localhost:3000',
    credentials: true
}));

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.get('/', (req,res) =>{
    res.send("Hello World");
})

server.listen(process.env.PORT, ()=>{
    console.log(`Server running on 127.0.0.1:${process.env.PORT}`);
});