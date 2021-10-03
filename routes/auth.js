const express = require('express')
const { body } = require('express-validator')

const authController = require('../controllers/auth')

const User = require('../models/user')

const router = express.Router()

// POST auth/signup
router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password is at least 6 character'),
], authController.signup)

// POST auth/login
router.post('/login', authController.login)

// POST auth/refreshtoken
router.post('/refreshtoken', authController.refreshToken)

module.exports = router