require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl')

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}));

mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true, useUnifiedTopology: true 
});


app.get('/', async (req, res) => {
    let sUrls = await ShortUrl.find();
    res.render('index', {shortUrls: sUrls});
});

app.post('/shortUrls', async (req, res) => {
    const isAvailable = await ShortUrl.findOne({ full: req.body.url });

    if(!isAvailable){
        await ShortUrl.create({
            full: req.body.url
        })
        res.redirect('/');
    }else{
        res.redirect('/');
    }
    
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)
  
    shortUrl.clicks++
    shortUrl.save()
  
    res.redirect(shortUrl.full)
  });

app.listen(process.env.PORT || 3000);