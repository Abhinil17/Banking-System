const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();

router.post('/', authMiddleware.authUser, accountController.createAccount);
router.get('/', authMiddleware.authUser, accountController.getAccounts);
router.get('/balance/:accountId', authMiddleware.authUser, accountController.getBalance);


module.exports = router;