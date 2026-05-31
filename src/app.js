const express = require('express');
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({'Welcome to the Banking System'});
});

app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

module.exports = app;