const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema(
    {
        tenant: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Tenant',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Branch', BranchSchema);