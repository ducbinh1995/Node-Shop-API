const express = require('express')

const isAuth = require('../middleware/is-auth')
const orderController = require('../controllers/order')

const router = express.Router()

router.get("/", isAuth, orderController.getOrders)

router.post("/add", isAuth, orderController.postOrders)

module.exports = router