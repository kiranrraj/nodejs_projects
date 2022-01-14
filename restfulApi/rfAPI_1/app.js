const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const mongoDB_string = `mongodb+srv://m001-student:${process.env.MONGODB_PSWD}@cluster0.zxusy.mongodb.net`;


mongoose.connect(mongoDB_string,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
let db = mongoose.connection;
db.addListener('error', console.error.bind(console, "MongoDB connection errors"));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Origin, Accept");
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
})



app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
    const error = new Error("Page not found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: "It works"
//     });
// });

module.exports = app;