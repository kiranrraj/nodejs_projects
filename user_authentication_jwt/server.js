require('dotenv').config();

// Express
const express = require('express');
const app = express();
const port = 3000;

// MongoDB Client
const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PSWD}@cluster0.zxusy.mongodb.net/userAuth/auth?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// Bcrypt
const bcrypt = require('bcrypt');

const users = [];

async function createUser(name, password){
    let hashedPassword = await hashedPswd(password);
    const user = {
        name: name,
        password: hashedPassword
    };
    return user;
}

async function hashedPswd(password){
    const salt = await bcrypt.genSalt();
    const encryptPswd = await bcrypt.hash(password, salt);
    return encryptPswd;
}

async function addOneDocument(client, document){
    const result = await client.db("userAuth").collection("auth").insertOne(document);
    console.log(`Document inserted with id ${result.insertedId}`);
}

async function getData(name){
    const user =  await client.db("userAuth").collection("auth").findOne({name:name});

        if(user == null){
            return res.status(400).send("Could not find the user");
        }
    return user;
}

app.use(express.json())

// Will show current username and password
app.get('/', async (req, res) =>{
    try{
        await client.connect();
        const users =  await client.db("userAuth").collection("auth").find().toArray();
        res.json(users);
    }finally{
        await client.close();
    }
});

// Enter username and password to store
app.post('/users', async (req, res) =>{
    try{
        await client.connect();
        let hashedDetails = await createUser(req.body.name, req.body.password);
        await addOneDocument(client, hashedDetails);
        res.status(201).send();

    }catch{
        res.status(500).send();
    }finally{
        await client.close();
    }
});

// Enter username and password to authenticate
app.post('/users/login', async (req, res) =>{

    try{
        await client.connect();
        let user = await getData(req.body.name);

        if(await bcrypt.compare(req.body.password, user.password)){
            res.send("User authenticated");
        } else{
            res.send("User authentication failed");
        }
    } catch{
        res.status(500).send();
    } finally{
        await client.close();
    }
});


app.listen(port, ()=>{
    console.log("Server running on http://localhost:3000");
});