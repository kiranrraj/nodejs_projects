require("dotenv/config");

const { verify } = require("jsonwebtoken");
const {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken,
} = require("./token");
const isAuthorized = require("./auth");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const bcrypt = require("bcryptjs");

const express = require("express");
const server = express();

// Mongo Client
const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PSWD}@cluster0.zxusy.mongodb.net/userAuth/auth?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const ObjectId = require('mongodb').ObjectId;

server.use(cookieParser());
server.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

function checkInput(data) {
    if (data == undefined || data.trim() == "") {
        return null;
    } else {
        return data.charAt(0).toUpperCase() + data.slice(1);
    }
}

function checkPswd(pswd) {
    if (pswd === undefined || pswd.trim() === "") {
        return null;
    } else {
        return pswd;
    }
}

async function hashedPswd(password) {
    const salt = await bcrypt.genSalt();
    const encryptPswd = await bcrypt.hash(password, salt);
    return encryptPswd;
}

async function createUser(name, email, pswd) {
    try {
        let cleanName = checkInput(name);
        let cleanEmail = checkInput(email);
        let cleanPswd = checkPswd(pswd);

        if (cleanName !== null && cleanEmail !== null && cleanPswd !== null) {
            let hashedPassword = await hashedPswd(pswd);
            const user = {
                name: cleanName,
                email: cleanEmail,
                password: hashedPassword,
            };
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log("Error occured", err.message);
    }
}

async function addOneDocument(client, document) {
    try {
        const result = await client
            .db("userAuth")
            .collection("auth")
            .insertOne(document);
        return `Document inserted with id ${result.insertedId}.\n User created with email: ${document.email}`;
    } catch (err) {
        return `Error ocured ${err.message}`;
    }
}

async function ifEmailExists(email) {
    try {
        let emailToSearch = checkInput(email);
        const user = await client
            .db("userAuth")
            .collection("auth")
            .findOne({ email: emailToSearch });
        if (user == null) return null;
        return user;
    } catch (err) {
        console.err(err.message);
    }
}

async function updateDocument(client, data, refreshToken) {
    try {
        const result = await client
            .db("userAuth")
            .collection("auth")
            .updateOne({ email: data }, { $set: { refreshToken: refreshToken } });
        return `Documents Matched: ${result.matchedCount}.\nDocuments modified: ${result.modifiedCount}.`;
    } catch (err) {
        return `Error ocured ${err.message}`;
    }
}

function createTokens(val){
    let accessToken = createAccessToken(val);
    let refreshToken = createRefreshToken(val);
    return[accessToken, refreshToken];
}

server.post("/users/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        await client.connect();
        let user = await ifEmailExists(email);
        let hashedDetails = await createUser(name, email, password);

        if (!user && hashedDetails) {
            const output = await addOneDocument(client, hashedDetails);
            res.status(201).send(output);
        } else if (!user && !hashedDetails) {
            if (!checkPswd(password)) {
                res.status(500).send(`Password Required: Please provide a password`);
            } else {
                res
                    .status(500)
                    .send(
                        `Details Required: ${name ? "" : "Name Required"} ${email ? "" : "Email Required"
                        }`
                    );
            }
        } else {
            res.status(500).send(`User with email "${user.email}" already exists.`);
        }
    } catch (err) {
        console.error(`Error occured on login route: ${err.message}`);
    } finally {
        await client.close();
    }
});




// Enter email and password to authenticate
server.post("/users/login", async (req, res) => {
    try {
        await client.connect();
        let { email, password } = req.body;
        let cleanEmail = checkInput(email);
        let user = await ifEmailExists(cleanEmail);

        // if (user) {
        //     let accessToken = createAccessToken(user._id);
        //     let refreshToken = createRefreshToken(user._id);
        //     const result = await updateDocument(client, cleanEmail, refreshToken);
        //     sendRefreshToken(res, refreshToken);
        //     sendAccessToken(req, res, accessToken);
        // }

        if (!user) {
            res.status(500).send(`User with email id ${cleanEmail} not found`);
        } else if (await bcrypt.compare(password, user.password)) {
           
            let [accessToken, refreshToken] =  createTokens(user._id);
            const result = await updateDocument(client, cleanEmail, refreshToken);
            sendRefreshToken(res, refreshToken);
            sendAccessToken(req, res, accessToken);

            res.status(200).send(`User authenticated, Access Token: ${accessToken}`);
        } else {
            res.status(500).send("User authentication failed");
        }
    } catch (err) {
        res.status(500).send(`Error occured on login route: ${err.message}`);
    } finally {
        await client.close();
    }
});

server.post("/users/logout", (req, res) => {
    res.clearCookie("retk");
    return res.send({
        message: "Logged Out",
    });
});

server.post("/users/protected", async (req, res) => {
    try {
        const id = await isAuthorized(req);
        if (id !== null) {
            res.send({
                data: 'This is a protected data'
            });
        }
    } catch (err) {
        res.status(500).send(`Error from protected route: ${err.message}`);
    }
});

server.post('/users/refresh_token', async (req, res) => {
    await client.connect();
    const token = req.cookies.retk;

    // If there is no token in the cookie
    if (!token) return res.send({ accessToken: "" });
    
    let payload = null;

    try {
        // Verifying with the secret code
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
        
        // To search with objectID
        let object_id = ObjectId(payload.userId);

        // To get the user from the db with userID from the refresh token
        const user = await client
            .db("userAuth")
            .collection("auth")
            .findOne({ "_id": object_id });
        let id = JSON.stringify(user._id).split("\"")[1];


        // If the user does not exists in the db
        if(!(payload.userId === id)) return res.send({accessToken: ""});


        // If user have a refresh token in db and it is not equal to token in the cookie ??
        // console.log(user.refreshToken !== token);
        if(user.refreshToken !== token) return res.send({accessToken: ""});

        // Create new tokens if token exists
        let [accessToken, refreshToken] =  createTokens(id);

        // Update the refresh token in the db
        const result = await updateDocument(client, user.email, refreshToken);
        console.log(result);
        sendRefreshToken(res, refreshToken);
        return res.send({accessToken});

    } catch (err) {
        res.status(500).send(`Error in verifying token: ${err.message}`);
    } finally {
        await client.close();
    }



})

server.listen(process.env.PORT, () => {
    console.log(`Server running on 127.0.0.1:${process.env.PORT}`);
});
