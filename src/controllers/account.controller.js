const accountModel = require('../models/account.model');

async function createAccount(req, res) {

    const user = req.user;
    const account = await accountModel.create({ user: user._id });
    return res.status(201).json({ message: 'Account created successfully', account });
}

async function getAccounts(req, res) {
    const user = req.user;
    const accounts = await accountModel.find({ user: user._id });
    return res.status(200).json({ message: 'Accounts retrieved successfully', accounts });
}

async function getBalance(req, res) {
    const user = req.user;
    const accountId = req.params.accountId;

    const account = await accountModel.findOne({ _id: accountId, user: user._id });
    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }

    const balance = await account.getAccountBalance();
    return res.status(200).json({ message: 'Account balance retrieved successfully', balance });
}

module.exports = { createAccount, getAccounts, getBalance };