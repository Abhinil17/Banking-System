const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const emailService = require('../services/email.service');
const blacklistModel = require('../models/blacklist.model');


async function registerController(req, res) {
    const { username, email, password } = req.body;

    const emailExists = await userModel.findOne({ email });
    if (emailExists) {
        return res.status(422).json({
            message: 'Email already exists',
            status: 'failed',
        });
    }

    const user = await userModel.create({ username, email, password });

    const token = jwt.sign({ 
        userId: user._id }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' 

        });

        res.cookie('token', token)
        res.status(201).json({
            message: 'User registered successfully',
            status: 'success',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
        await emailService.sendRegistrationEmail(user.username, user.email);
}
    
async function loginController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            message: 'Invalid email or password',
            status: 'failed',
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            message: 'Invalid email or password',
            status: 'failed',
        });
    }

    const token = jwt.sign({ 
        userId: user._id }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h'
        });

    res.cookie('token', token)
    res.status(200).json({
        message: 'User logged in successfully',
        status: 'success',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
        token,
    });
}

async function logoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(400).json({
            message: 'User is not logged in',
            status: 'failed',
        });
    } 
    res.clearCookie('token');

    await blacklistModel.create({ token: token });
    
    res.status(200).json({
        message: 'User logged out successfully',
        status: 'success',
    });
}

module.exports = {
    register: registerController,
    login: loginController,
    logout: logoutController,
};