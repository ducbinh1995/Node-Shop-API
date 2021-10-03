const path = require('path')

const bodyParser = require('body-parser');
const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('./models/user')

const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')

const app = express()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '_images.' + file.mimetype.split('/')[1])
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

app.use(bodyParser.json()) // application/json
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    next()
})

app.use('/auth', authRouter)
app.use('/products', productRouter)
app.use('/carts', cartRouter)
app.use('/orders', orderRouter)

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500
    const message = error.message
    res.status(statusCode).json({
        message: message,
        code: statusCode
    })
})

mongoose.connect('mongodb+srv://admin:1234@cluster0.akn24.mongodb.net/shop?authSource=admin&replicaSet=atlas-hrn9cv-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true')
    .then(() => {
        User.findOne({ email: "admin@admin.com" })
            .then(async (user) => {
                const hashedPassword = await bcrypt.hash("admin12345", 12)
                const token = jwt.sign(
                    {
                        email: "admin@admin.com",
                        password: hashedPassword
                    },
                    'somesupersecretsecret',
                    {
                        expiresIn: '1h'
                    })
                if (!user) {
                    const user = new User({
                        _id: '61547aef239829da7e28ebeb',
                        email: "admin@admin.com",
                        password: hashedPassword,
                        orders: [],
                        token: token,
                        role: "admin",
                        carts: []
                    })
                    await user.save()
                    return app.listen(8080)
                }
                app.listen(8080)
            })
    })
    .catch(err => console.log(err))
