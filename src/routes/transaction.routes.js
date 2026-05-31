const {Router} = require('express')
const authMiddleware = require('../middlewares/auth.middleware');
const transactionController = require('../controllers/transaction.controller');


const transactionsRoutes = Router();

transactionsRoutes.post('/', authMiddleware.authUser, transactionController.createTransaction);
transactionsRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.getInitialFunds);

module.exports = transactionsRoutes;