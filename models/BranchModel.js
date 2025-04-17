const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema(
    {
        tenantID: {
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
        managerID: {
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