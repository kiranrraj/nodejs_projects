const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
    .exec()
    .then(data => {
        let formattedData = {
            count: data.length,
            orders: data.map(item => {
                return {
                    product: {
                        product: item.product,
                        type: "GET",
                        url: `http://127.0.0.1:3000/products/${item.product}`
                    },
                    quantity: item.quantity,
                    id: item._id,
                    request: {
                        type: "GET",
                        url: `http://127.0.0.1:3000/orders/${item._id}`
                    }
                }
            })
        }
        res.status(200).json(formattedData);
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
    // res.status(200).json({
    //     message: "Handling GET requests to /orders"
    // });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Order.findById(id)
        .populate('product', 'name price')
        .exec()
        .then(data => {
            let formattedData = {
                product: data.product,
                quantity: data.quantity,
                id: data._id,
                request: {
                    type: "GET",
                    url: `http://127.0.0.1:3000/orders/${data._id}`
                }
            }
            res.status(200).json(formattedData);
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
})

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Order.remove({ _id: id }).exec().then(result => {
        res.status(200).json({
            message: `Order with id ${id} deleted!!`,
            result
        })
    }).catch(err => {
        res.status(500).json({
            message: "Error occured during deletion",
            error: err
        })
    })
});


router.post('/', (req, res, next) => {
    Product.findById(req.body.product)
        .then(data => {
            // console.log(data)
            if (!data) {
                return res.status(404).json({
                    message: "Product not found"
                })
            } else {
                const order = new Order({
                    _id: mongoose.Types.ObjectId(),
                    quantity: req.body.quantity,
                    product: req.body.product
                });

                return order.save()
            }

        }).then(result => {
            res.status(200).json({
                message: "Order saved",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                }
            });
        })

        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;