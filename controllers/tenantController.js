const { default: mongoose } = require('mongoose');
const Tenant = require('../models/TenantModel');
const Branch = require('../models/BranchModel');

// Create a new tenant.
const createTenant = async (req, res, next) => {
    try {
        const { name, email, phone, address } = req.body;

        // Ensures all required fields are provided and trimmed.
        if (!name?.trim || !email?.trim || !phone?.trim ) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email is already been used.
        const existingTenant = await Tenant.findOne({ email });
        if (existingTenant) {
            return res.status(400).json({ error: 'Already registered' });
        }

        // Create and save a new tenant instance.
        // test github
        const newTenant = new Tenant({ 
            name, 
            email, 
            phone 
        });
        await newTenant.save();

        // Create the main branch.
        const newBranch = new Branch({
            tenant: newTenant._id,
            name: "Main",
            address: address,
            phone
        })
        await newBranch.save();

        res.status(201).json({ message: 'Tenant created successfully', tenant: newTenant });
    } catch (error) {
        next(error); 
    }
}

// Retrieve all tenants both active and inactive.
const getAllTenants = async (req, res, next) => {
    try {
        // Fetch all tenants from the database.
        const tenants = await Tenant.find();
        
        // If no tenants are found, return a custom message.
        if (tenants.length === 0) {
            return res.status(404).json({ message: 'No tenants found' });
        }

        res.status(200).json(tenants);
    } catch (error) {
        next(error); 
    }
}

// Retrieve only active tenants from the database.
const getAllActiveTenants = async (req, res, next) => {
    try {
        // Fetch only active tenants from the database.
        const tenants = await Tenant.find({ isActive: true });

        if (tenants.length === 0) {
            return res.status(404).json({ message: 'No active tenants found' });
        }

        res.status(200).json(tenants);
    } catch (error) {
        next(error); 
    }
}

// Retrieve a single tenant by ID
const getTenantById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID Format (MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tenant ID format' });
        }

        // Check if the tenant exists.
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.status(200).json(tenant);
    } catch (error) {
        next(error); 
    }
}

// Update tenant details
const updateTenant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        // Validate ID Format (MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tenant ID format' });
        }

        // Check if the tenant exists.
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if the new email is already taken by another tenant.
        if (email && email !== tenant.email) {
            const emailExists = await Tenant.findOne({ email })
            if (emailExists) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Update tenant fields.
        tenant.name = name || tenant.name;
        tenant.email = email || tenant.email;
        tenant.phone = phone || tenant.phone;

        // Save the update tenant.
        await tenant.save();

        res.status(200).json({ message: 'Tenant updated succcessfully', tenant })
    } catch (error) {
        next(error); 
    }
}

// Deactivate a tenant.
const deleteTenant = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID Format (MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tenant ID format' });
        }

        // Check if the tenant exists.
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // If already deactivated, return an error.
        if (tenant.isActive == false) {
            return res.status(400).json({ error: 'Tenant is already deactivated' });
        }

        // Set isActive to false and save.
        tenant.isActive = false
        await tenant.save();

        res.status(200).json({ message: 'Tenant deactivated successfully.' })
    } catch (error) {
        next(error); 
    }
}

// Reactivate a tenant.
const reactivateTenant = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID Format (MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tenant ID format' });
        }

        // Check if the tenant exists.
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // If already active, return an error.
        if (tenant.isActive == true) {
            return res.status(200).json({ error: 'Tenant is already active' });
        }

        // Reactivate tenant
        tenant.isActive = true
        await tenant.save();

        res.status(200).json({ message: 'Tenant reactivated successfully.', tenant })
    } catch (error) {
        next(error); 
    }
}


module.exports = {
    createTenant,
    getAllTenants,
    getAllActiveTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    reactivateTenant
}