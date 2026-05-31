const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');

async function authUser(req, res, next) {

    const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }
        const isBlacklisted = await blacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        req.user = user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized Access' });
    }
}

async function authSystemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }
        const isBlacklisted = await blacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select('+systemUser');

        if (!user.systemUser) {
            return res.status(403).json({ message: 'Forbidden: Access denied 1' });
        }
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized Access' });
    }
}

module.exports = {
    authUser,
    authSystemUserMiddleware
};