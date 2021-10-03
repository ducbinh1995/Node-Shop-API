const User = require('../models/user')
const Product = require('../models/product')

exports.getCarts = async (req, res, next) => {
    const userId = req.query.userId
    try {
        const user = await User.findById(userId).populate({
            path: 'carts',
            populate: 'product'
        })
        if (!user) {
            const err = new Error('User not found')
            err.statusCode = 404
            throw err;
        }
        res.status(200).json({
            message: 'Cart fetched successfully',
            carts: user.carts
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.addToCart = async (req, res, next) => {
    const userId = req.body.userId
    const productId = req.body.productId
    try {
        const user = await User.findById(userId)
        if (!user) {
            const err = new Error('User not found')
            err.statusCode = 401
            throw err;
        }
        const product = await Product.findById(productId)
        if (!product) {
            const err = new Error('Product not found')
            err.statusCode = 404
            throw err;
        }
        let updatedCarts = user.carts
        const existProductIndex = updatedCarts.findIndex(cart => cart.product.toString() === product._id.toString())
        if (existProductIndex > -1) {
            let updatedProduct = updatedCarts[existProductIndex]
            updatedProduct.quantity = updatedProduct.quantity + 1
            updatedCarts[existProductIndex] = updatedProduct
        }
        else {
            let updatedProduct = {
                product: product._id,
                quantity: 1
            }
            updatedCarts = [...updatedCarts, updatedProduct]
        }
        user.carts = updatedCarts
        await user.save()
        res.status(200).json({
            message: 'Cart add successfully',
            success: true
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.deleteCart = async (req, res, next) => {
    const userId = req.body.userId
    const productId = req.body.productId
    try {
        const user = await User.findById(userId)
        if (!user) {
            const err = new Error('User not found')
            err.statusCode = 401
            throw err;
        }
        const product = await Product.findById(productId)
        if (!product) {
            const err = new Error('Product not found')
            err.statusCode = 404
            throw err;
        }
        let updatedCarts = user.carts
        const existProductIndex = updatedCarts.findIndex(cart => cart.product.toString() === product._id.toString())
        if (existProductIndex > -1) {
            let updatedProduct = updatedCarts[existProductIndex]
            if (updatedProduct.quantity > 1) {
                updatedProduct.quantity = updatedProduct.quantity - 1
                updatedCarts[existProductIndex] = updatedProduct
            }
            else {
                updatedCarts.splice(existProductIndex, 1)
            }
        }
        else {
            const err = new Error('Product not found')
            err.statusCode = 404
            throw err;
        }
        user.carts = updatedCarts
        await user.save()
        res.status(200).json({
            message: 'Cart delete successfully',
            success: true
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}