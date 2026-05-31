const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');

// -- Create a new transaction step(10)
// -Validate request body
// -Validate idempotency key
// -Check acc. status
// -Derive Sender balance from ledger
// -Create transaction (pending)
// -Create debit ledger entry
// Create credit ledger entry
// -Update transaction status to completed
// -Commit Mongodb session
// -Notify users via email


async function createTransaction(req, res) {

    //Validate request body
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'From account, to account, amount and idempotency key are required',
            status: 'failed',
        });
    }

    const fromAcc = await accountModel.findOne({ _id: fromAccount});
    const toAcc = await accountModel.findOne({ _id: toAccount});

    if (!fromAcc || !toAcc) {
        return res.status(404).json({
            message: 'From account or to account not found',
            status: 'failed',
        });
    }

    //Validate idempotency key
    const isTransactionExists = await transactionModel.findOne({ idempotencyKey });
    if(isTransactionExists) {
        if(isTransactionExists.status === 'COMPLETED') {
            return res.status(200).json({
                message: 'Transaction already completed',
                status: 'success',
                transaction: isTransactionExists,
            });
        }
        if (isTransactionExists.status === 'PENDING') {
            return res.status(200).json({
                message: 'Transaction is still in progress',
            });
        }
        if (isTransactionExists.status === 'FAILED') {
            return res.status(500).json({
                message: 'Transaction failed',
                status: 'failed',
                transaction: isTransactionExists,
            });
        }
        if (isTransactionExists.status === 'REVERSED') {
            return res.status(500).json({
                message: 'Transaction was reversed, please retry',
                status: 'failed',
                transaction: isTransactionExists,
            });
        }
    }

    //Check acc. status
    if (fromAcc.status !== 'ACTIVE' || toAcc.status !== 'ACTIVE') {
        return res.status(400).json({
            message: 'From account and to account must be active',
            status: 'failed',
        });
    }

    //Derive Sender balance from ledger
    const balance = await fromAcc.getAccountBalance();
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance} and attempted transaction amount is ${amount}`,
            status: 'failed',
        });
    }

    let transaction;
    try{
    //Create transaction (pending)
    const session = await transactionModel.startSession();
    session.startTransaction();

    const transaction = (await transactionModel.create([{
        fromAccount: fromAcc._id,
        toAccount: toAcc._id,
        amount,
        idempotencyKey,
        status: 'PENDING'
    }], { session }))[0];

    // -Create debit ledger entry
    const debitEntry = await ledgerModel.create([{
        account: fromAcc._id,
        amount: amount,
        transaction: transaction._id,
        type: 'DEBIT'
    }],{ session });

    await (()=> {
        return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })(); // Simulate some processing time

    // Create credit ledger entry
    const creditEntry = await ledgerModel.create([{
        account: toAcc._id,
        amount: amount,
        transaction: transaction._id,
        type: 'CREDIT'
    }],{ session });

    //-Update transaction status to completed
    await transactionModel.findOneAndUpdate(
        {_id: transaction._id},
        { status: 'COMPLETED' }, 
        { session }
    );
    
    // -Commit Mongodb session
    await session.commitTransaction();
    session.endSession();
} catch (error) {
    return res.status(500).json({
        message: 'Transaction is pending due to some issue, plesae retry after some time',
        status: 'failed'
    });
}

    // -Notify users via email
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAcc._id, );

    res.status(201).json({
        message: 'Transaction completed successfully',
        status: 'success',
        transaction,
    });
}

async function getInitialFunds(req, res) {
    const {toAccount, amount, idempotencyKey} = req.body;
    
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'To account, amount and idempotency key are required',
            status: 'failed',
        });
    }

    const toAcc = await accountModel.findOne({ _id: toAccount});
    if (!toAcc) {
        return res.status(404).json({
            message: 'To account not found',
            status: 'failed',
        });
    }
    const fromAcc = await accountModel.findOne({ user:req.user._id }); 

    if (!fromAcc) {
        return res.status(404).json({
            message: 'System account not found',
            status: 'failed',
        });
    }

    const session = await transactionModel.startSession();
    session.startTransaction(); 

    const transaction = new transactionModel({
        fromAccount: fromAcc._id,
        toAccount: toAcc._id,
        amount,
        idempotencyKey,
        status: 'PENDING'
    });

    await transaction.save({ session });

    const debitledgerEntry = await ledgerModel.create([{
        account: fromAcc._id,
        amount: amount,
        transaction: transaction._id,
        type: 'DEBIT'
    }],{ session });

    const creditledgerEntry = await ledgerModel.create([{
        account: toAcc._id,
        amount: amount,
        transaction: transaction._id,
        type: 'CREDIT'
    }],{ session });

    transaction.status = 'COMPLETED';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: 'Initial funds added successfully',
        status: 'success',
        transaction,
    });
}


module.exports = {
    createTransaction,
    getInitialFunds
}