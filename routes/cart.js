const express = require('express')
const { body } = require('express-validator')

const isAuth = require('../middleware/is-auth')
const cartController = require('../controllers/cart')

const router = express.Router()

router.get("/", isAuth, cartController.getCarts)

router.post("/add", isAuth, cartController.addToCart)

router.post("/delete", isAuth, cartController.deleteCart)

module.exports = router