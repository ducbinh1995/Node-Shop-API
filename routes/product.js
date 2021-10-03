const express = require('express')
const { body } = require('express-validator')

const productController = require('../controllers/product')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

// GET /products
router.get('/', isAuth, productController.getProducts)

// POST /products/create
router.post('/create', [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is invalid'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is invalid'),
    body('price')
        .notEmpty()
        .isNumeric()
        .withMessage('Price is invalid')
],isAuth, productController.createProduct)

// GET /products/{id}
router.get('/:productId', isAuth, productController.getProduct)

// POST /products/edit/{id}
router.post('/edit/:productId', [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is invalid'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is invalid'),
    body('price')
        .notEmpty()
        .isNumeric()
        .withMessage('Price is invalid')
],isAuth, productController.editProduct)

// POST /products/isAvailable({id})
router.post('/isAvailable/:productId', isAuth, productController.availableProduct)

module.exports = router