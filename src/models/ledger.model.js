const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'account', 
        required: true,
        index: true,
        immutable: true
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0,
        immutable: true
    },
    transaction: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'transaction', 
        required: true,
        index: true,
        immutable: true
    },
    type: { 
        type: String, 
        enum: ['DEBIT','CREDIT'],
        required: true,
        immutable: true
    }
},{ 
    timestamps: true 
});

function prevevntLedgerModification(next) {
   throw new Error('Ledger entries are immutable and cannot be modified or deleted');
}

ledgerSchema.pre('remove', prevevntLedgerModification);
ledgerSchema.pre('updateOne', prevevntLedgerModification);
ledgerSchema.pre('deleteOne', prevevntLedgerModification);
ledgerSchema.pre('findOneAndUpdate', prevevntLedgerModification);
ledgerSchema.pre('deleteMany', prevevntLedgerModification);
ledgerSchema.pre('updateMany', prevevntLedgerModification);
ledgerSchema.pre('findOneAndRemove', prevevntLedgerModification);
ledgerSchema.pre('findOneAndDelete', prevevntLedgerModification);
ledgerSchema.pre('findOneAndReplace', prevevntLedgerModification);

ledgerSchema.index({ account: 1, transaction: 1 });

const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;