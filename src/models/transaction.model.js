const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'account', 
        required: true,
        index: true
    },
    toAccount: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'account', 
        required: true,
        index: true
    },
    status: { 
        type: String, 
        enum: ['PENDING','COMPLETED','FAILED','REVERSED'],
        default: 'PENDING',
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0
    },
    idempotencyKey: {
        type: String,
        required: true,
        index: true,
        unique: true
    }
},{ 
    timestamps: true 
});

transactionSchema.index({ fromAccount: 1, toAccount: 1, status: 1 });

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;