const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }
)

module.exports = mongoose.model('Tenant', TenantSchema);