require('dotenv/config');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const {verify} = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const express = require('express');
const server = express();

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PSWD}@cluster0.zxusy.mongodb.net/userAuth/auth?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

server.use(cookieParser());
server.use(cors({
    origin:'http://localhost:3000',
    credentials: true
}));

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.get('/', (req,res) =>{
    res.send("Hello World");
});


function checkInput(data){
    if(data == undefined || data.trim() == ""){
       return null;
    } else{
        return (data.charAt(0).toUpperCase() + data.slice(1));
    }
}

function checkPswd(pswd){
    if(pswd === undefined || pswd.trim() === ""){
        return null;
    } else{
        console.log("Password",pswd);
        return pswd;
    }
}

async function hashedPswd(password){
    const salt = await bcrypt.genSalt();
    const encryptPswd = await bcrypt.hash(password, salt);
    return encryptPswd;
}

async function createUser(name, email, pswd){
    try{
        let cleanName = checkInput(name);
        let cleanEmail = checkInput(email);
        let cleanPswd = checkPswd(pswd);

        if(cleanName !== null && cleanEmail !== null && cleanPswd !==null){
            let hashedPassword = await hashedPswd(pswd);
            const user = {
                name: cleanName,
                email: cleanEmail,
                password: hashedPassword
            };
            return user;
        } else{
            return null;
        }
             
    }catch(err){
        console.log("Error occured");
    }
}

async function addOneDocument(client, document){
    try{
        const result = await client.db("userAuth").collection("auth").insertOne(document);
        return `Document inserted with id ${result.insertedId}.\n User created with email: ${document.email}`;
    }catch(err){
        return `Error ocured ${err}`;
    }
};

async function ifEmailExists(email){
    try{
        let emailToSearch = checkInput(email);
        const user =  await client.db("userAuth").collection("auth").findOne({email:emailToSearch});
        if(user == null) return null;
        return user;
    }catch(err){
        console.err(err);
    }
}

server.post('/register', async (req, res) =>{
    const {name, email, password} = req.body;

    try{
        await client.connect();
        let user = await ifEmailExists(email);
        let hashedDetails = await createUser(name, email, password);

        if(!user && hashedDetails){

            const output = await addOneDocument(client, hashedDetails);
            res.status(201).send(output);

        }else if(!user && !hashedDetails){

            if(!checkPswd(password)){
                res.status(500).send(`Password Required: Please provide a password`);
            }else{
                res.status(500).send(`Details Required: ${name?"":"Name Required"} ${email?"":"Email Required"}`);
            }

        } else{
            res.status(500).send(`User with email "${user.email}" already exists.`);
        }
        
    }catch(err){
        console.error({message:err});
    }finally{
        await client.close();
    }
})

server.listen(process.env.PORT, ()=>{
    console.log(`Server running on 127.0.0.1:${process.env.PORT}`);
});