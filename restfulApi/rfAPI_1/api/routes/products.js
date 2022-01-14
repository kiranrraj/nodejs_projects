const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id')
        .exec()
        .then(
            data => {
                console.log(data);
                let formattedData = {
                    count: data.length,
                    products: data.map(item =>{
                        return {
                            Name: item.name,
                            Price: item.price,
                            id: item._id,
                            request: {
                                type: "GET",
                                url: `http://127.0.0.1:3000/products/${item._id}`
                            }
                        }
                    })
                }
                res.status(200).json(formattedData)
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
    // res.status(200).json({
    //     message: "Handling GET requests to /products"
    // });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Product.findById(id).exec().then(data => {
        console.log(`From database ${data}`);
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({
                message: "No valid entry found"
            });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            error: err,
            message: "Error with object id"
        });
    });
    // res.status(200).json({
    //     message: `Handling GET requests to product ${id}`
    // });
});

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;

    const updateFiels = {}
    for (const field of req.body) {
        updateFiels[field.prop] = field.value;
    }

    console.log(updateFiels);

    Product.updateMany({ _id: id }, {
        $set: updateFiels
        // { 
        // // name: req.body.newName,
        // // price: req.body.newPrice
        // }
    }).exec().then(result => {
        res.status(200).json(result)
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })

    // res.status(200).json({
    //     message: `Handling PATCH requests to products ${id}`
    // });
});


router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Product.remove({ _id: id }).exec().then(result => {
        res.status(200).json(result)
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
    res.status(200).json({
        message: `Handling DELETE requests to products ${id}`
    });
});


router.post('/', (req, res, next) => {
    // const product = {
    //     name: req.body.name,
    //     price: req.body.price
    // }
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });

    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: `Handling POST requests to /products`,
            createdProduct: result
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            error: err
        });
    })

    // res.status(200).json({
    //     message: "Handling Post requests to /products",
    //     createdProduct : product
    // });
});

module.exports = router;