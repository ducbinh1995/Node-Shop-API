const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator')

const Product = require('../models/product')
const User = require('../models/user')

exports.getProducts = async (req, res, next) => {
    let isAdmin = true
    const userId = req.query.userId
    const currentPage = req.query.page || 1
    const perPage = 3
    try {
        const user = await User.findById(userId)
        if (!user || user.role !== 'admin') {
            isAdmin = false
        }
        let totalItems = await Product.find({ isAvailable: true }).countDocuments()
        if (isAdmin) {
            totalItems = await Product.find().countDocuments()
        }
        let hasNextPage = true
        if (currentPage * perPage >= totalItems) {
            hasNextPage = false
        }
        let products = await Product.find({ isAvailable: true })
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
        if (isAdmin) {
            products = await Product.find()
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
        }
        const transformedProducts = products.map(product => {
            return {
                _id: product._id,
                title: product.title,
                content: product.content,
                image: product.image,
                price: product.price,
                isAvailable: product.isAvailable
            }
        })

        res.status(200).json({
            products: transformedProducts,
            totalItems: totalItems,
            hasNextPage: hasNextPage
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.createProduct = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const err = new Error('Validation failed')
        err.statusCode = 422
        err.message = errors.array()[0].msg
        return next(err);
    }
    if (!req.file) {
        const err = new Error('No image provided')
        err.statusCode = 422
        return next(err);
    }
    const image = req.file.path
    const title = req.body.title
    const price = req.body.price
    const content = req.body.content
    const product = new Product({
        title: title,
        content: content,
        image: image,
        price: parseFloat(price),
        isAvailable: true
    })
    const userId = req.body.userId
    try {
        const user = await User.findById(userId)
        if (!user || user.role !== 'admin') {
            const err = new Error('User not allowed to create product')
            err.statusCode = 403
            throw err;
        }
        await product.save()
        res.status(200).json({
            message: 'Product created successfully',
            product: {
                _id: product._id,
                title: product.title,
                content: product.content,
                image: product.image,
                price: product.price,
                isAvailable: product.isAvailable
            }
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId
    try {
        const product = await Product.findById(productId)
        if (!product) {
            const err = new Error('Product not found')
            err.statusCode = 404
            throw err;
        }
        res.status(200).json({
            product: {
                _id: product._id,
                title: product.title,
                content: product.content,
                image: product.image,
                price: product.price,
                isAvailable: product.isAvailable
            }
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.editProduct = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const err = new Error('Validation failed')
        err.statusCode = 422
        err.message = errors.array()[0].msg
        return next(err);
    }
    let image
    if (req.file) {
        image = req.file.path
    }
    const title = req.body.title
    const price = req.body.price
    const content = req.body.content
    const productId = req.params.productId
    const userId = req.body.userId
    try {
        const user = await User.findById(userId)
        if (!user || user.role !== 'admin') {
            const err = new Error('User not allowed to edit product')
            err.statusCode = 403
            throw err;
        }
        const product = await Product.findById(productId)
        if (!product) {
            const err = new Error('Product not found')
            err.statusCode = 404
            throw err;
        }
        if (image !== product.image && image !== null && image !== undefined) {
            clearImage(product.image)
        }
        product.title = title
        product.content = content
        product.price = parseFloat(price)
        if (image !== null && image !== undefined) {
            product.image = image
        }
        await product.save()
        res.status(200).json({
            message: 'Product edit successfully',
            product: {
                _id: product._id,
                title: product.title,
                content: product.content,
                image: product.image,
                price: product.price,
                isAvailable: product.isAvailable
            }
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.availableProduct = async (req, res, next) => {
    const isAvailable = req.body.isAvailable
    const productId = req.params.productId
    const userId = req.body.userId
    try {
        const user = await User.findById(userId)
        if (!user || user.role !== 'admin') {
            const err = new Error('User not allowed to edit product')
            err.statusCode = 403
            throw err;
        }
        const product = await Product.findById(productId)
        if (!product) {
            const err = new Error('Product not found')
            err.statusCode = 404
            throw err;
        }
        product.isAvailable = isAvailable
        await product.save()
        res.status(200).json({
            message: 'Product change available successfully',
            product: {
                _id: product._id,
                title: product.title,
                content: product.content,
                image: product.image,
                price: product.price,
                isAvailable: product.isAvailable
            }
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err))
}