const Branch = require('../models/BranchModel');
const Tenant = require('../models/TenantModel');
const User = require('../models/UserModel');

// Create a new branch.
const createAnotherBranch = async (req, res, next) => {
    try {
        const { tenant_id, name, address, phone, manager_id } = req.body;

        // Check if all required fields are provided.
        if (!tenant || !name || !address) {
            return res.status(400).json({ error: 'Missing fields!' });
        }

        // Check if the tenant exists.
        const tenantExists = await Tenant.findById(tenant_id);
        if (!tenantExists) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if the manager_id is indeed a manager.
        const manager = await User.findById(manager_id);
        if (manager.role !== 'manager') {
            return res.status(400).json({ error: 'Not a manager' });
        }

        // Create a new branch instance.
        const newBranch = new Branch({
            tenant: tenant_id,
            name,
            address,
            phone,
            manager: manager?._id || ''
        });

        // Save the branch to the database.
        await newBranch.save();
        
        // Send a success response.
        res.status(201).json({ message: 'Branch created successfully', branch: newBranch });
    } catch (error) {
        next(error);
    }
}


// Get all branches
const getAllBranches = async (req, res, next) => {
    try {
        let branches;

        // Validate the role.
        if (req.user.role === 'superadmin') {
            branches = await Branch.find();
        } else {
            branches = await Branch.find({ tenant: req.user.tenant })
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBranches
}