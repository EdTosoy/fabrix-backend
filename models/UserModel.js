const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        tenantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true
        },
        branchID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch'
        },
        name: {
            type: String,
        },
        email: {
            type: String,
            unique: true
        },
        phone: {
            type: String
        },
        role: {
            type: String,
            enum: ['superadmin', 'owner', 'manager', 'staff', 'rider', 'customer'],
            default: 'staff'
        },
        password: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', UserSchema);