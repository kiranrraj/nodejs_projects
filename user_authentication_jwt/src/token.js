const {sign} = require('jsonwebtoken');

const createAccessToken = userId => {
    return sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
};


const createRefreshToken = userId => {
    return sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
};

const sendAccessToken = (req, res, accessToken) =>{
    // res.status(200).send({
    //     accessToken, 
    //     email: req.body.email
    // });
    console.log({
        accessToken, 
        email: req.body.email
    });
};

const sendRefreshToken = (res, refreshToken) =>{
    res.cookie('retk', refreshToken, {
        httpOnly: true,
        path:'/users/refresh_token'
    });
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken
};