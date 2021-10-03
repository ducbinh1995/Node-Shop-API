const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const err = new Error('Validation failed')
        err.statusCode = 422
        err.message = errors.array()[0].msg
        return next(err);
    }
    const email = req.body.email
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword
    if (email === 'admin@admin.com') {
        const err = new Error('Email is invalid')
        err.statusCode = 422
        return next(err);
    }
    if (confirmpassword !== password) {
        const err = new Error('Password is different')
        err.statusCode = 422
        return next(err);
    }
    try {
        const userDoc = await User.findOne({ email: email })
        if (userDoc) {
            const err = new Error('Email is already exist')
            err.statusCode = 409
            throw err;
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const token = jwt.sign(
            {
                email: email,
                password: hashedPassword
            },
            'somesupersecretsecret',
            {
                expiresIn: '1h'
            })
        const user = new User({
            email: email,
            password: hashedPassword,
            role: "user",
            token: token,
            orders: [],
            carts: []
        })
        const result = await user.save()
        res.status(200).json({
            message: 'User signup successfully',
            userId: result._id
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const authorization = req.headers.authorization
    let token
    if (authorization !== null && authorization !== undefined) {
        token = authorization.split(' ')[1]
    }
    let loadedUser;
    if (token !== null && token !== undefined) {
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, 'somesupersecretsecret')
        } catch (err) {
            err.statusCode = 401
            throw err
        }
        if (!decodedToken) {
            const err = new Error('Not authenticated')
            err.statusCode = 401
            throw err
        }
        try {
            const user = await User.findOne({ token: token })
            if (!user) {
                const err = new Error('User not found')
                err.statusCode = 401
                throw err;
            }
            loadedUser = user;
            const hashedPassword = await bcrypt.hash(user.password, 12)
            const newToken = jwt.sign(
                {
                    email: user.email,
                    password: hashedPassword
                },
                'somesupersecretsecret',
                {
                    expiresIn: '1h'
                })
            loadedUser.token = newToken
            await loadedUser.save()
            res.status(200).json({
                message: 'User login successfully',
                token: newToken,
                userId: loadedUser._id.toString(),
                role: loadedUser.role
            })
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        }
    }
    else {
        try {
            const user = await User.findOne({ email: email })
            if (!user) {
                const err = new Error('Email not found')
                err.statusCode = 401
                throw err;
            }
            loadedUser = user;
            const isEqual = await bcrypt.compare(password, user.password)
            if (!isEqual) {
                const err = new Error('Wrong password')
                err.statusCode = 401
                throw err;
            }
            const hashedPassword = await bcrypt.hash(password, 12)
            const newToken = jwt.sign(
                {
                    email: email,
                    password: hashedPassword
                },
                'somesupersecretsecret',
                {
                    expiresIn: '1h'
                })
            loadedUser.token = newToken
            await loadedUser.save()
            res.status(200).json({
                message: 'User login successfully',
                token: loadedUser.token,
                userId: loadedUser._id.toString(),
                role: loadedUser.role
            })
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        }
    }
}

exports.refreshToken = async (req, res, next) => {
    const token = req.body.token
    let loadedUser;
    try {
        const user = await User.findOne({ token: token })
        if (!user) {
            const err = new Error('User not found')
            err.statusCode = 401
            throw err;
        }
        loadedUser = user;
        const newToken = jwt.sign(
            {
                email: user.email,
                password: user.hashedPassword
            },
            'somesupersecretsecret',
            {
                expiresIn: '1h'
            })
        loadedUser.token = newToken
        await loadedUser.save()
        res.status(200).json({
            message: 'Token has renewed',
            token: loadedUser.token,
            userId: loadedUser._id.toString()
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}