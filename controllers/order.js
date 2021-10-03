const User = require('../models/user')
const Product = require('../models/product')

exports.getOrders = async (req, res, next) => {
    const userId = req.query.userId
    try {
        const user = await User.findById(userId).populate({
            path: 'orders',
            populate: {
                path: 'products',
                populate: 'product'
            }
        })
        if (!user) {
            const err = new Error('User not found')
            err.statusCode = 401
            throw err;
        }
        res.status(200).json({
            message: 'Orders fetched successfully',
            orders: user.orders
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.postOrders = async (req, res, next) => {
    const userId = req.body.userId
    try {
        const user = await User.findById(userId).populate({
            path: 'carts',
            populate: 'product'
        })
        if (!user) {
            const err = new Error('User not found')
            err.statusCode = 401
            throw err;
        }
        const carts = user.carts
        let totalAmount = 0
        carts.forEach(cart => {
            totalAmount += cart.product.price * cart.quantity
        });
        const order = {
            date: new Date(),
            products: carts.map(cart => {
                return {
                    product: cart.product._id,
                    quantity: cart.quantity
                }
            }),
            total: totalAmount
        }
        user.orders = [order, ...user.orders]
        user.carts = []
        await user.save()
        res.status(200).json({
            message: 'Orders add successfully',
            success: true
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}