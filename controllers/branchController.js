const Branch = require('../models/BranchModel');
const Tenant = require('../models/TenantModel');
const User = require('../models/UserModel');


// Get all branches
const getAllBranches = async (req, res, next) => {
    try {
        let branches;

        // Validate the role.
        if (req.user.role === 'superadmin') {
            branches = await Branch.find();
        } else {
            branches = await Branch.find({ tenant: req.user.tenantID })
        }

        return res.status(200).json(branches);
    } catch (error) {
        next(error);
    }
}


// Create a new branch.
const createAnotherBranch = async (req, res, next) => {
    try {
        const { tenantID, name, address, phone, managerID } = req.body;

        // Check if all required fields are provided.
        if (!tenantID || !name || !address) {
            return res.status(400).json({ error: 'Missing fields!' });
        }

        // Check if the tenant exists.
        const tenantExists = await Tenant.findById(tenantID);
        if (!tenantExists) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if the manager_id is indeed a manager.
        const manager = await User.findById(managerID);
        if (manager.role !== 'manager') {
            return res.status(400).json({ error: 'Not a manager' });
        }

        // Create a new branch instance.
        const newBranch = new Branch({
            tenant: tenantID,
            name,
            address,
            phone,
            manager: manager?._id || ''
        });

        // Save the branch to the database.
        await newBranch.save();
        
        // Send a success response.
        res.status(201).json({ message: 'New branch created successfully', branch: newBranch });
    } catch (error) {
        next(error);
    }
}


// Get all active branches
const getAllActiveBranches = async (req, res, next) => {
    try {
        let branches;

        // Validate the role.
        if (req.user.role === 'superadmin') {
            branches = await Branch.find({ isActive: true });
        } else {
            branches = await Branch.find({ tenant: req.user.tenantID, isActive: true });
        }

        // If no branches are found, return a custom message.
        if (branches.length === 0) {
            return res.status(404).json({ message: 'No active branches found' });
        }

        res.status(200).json(branches);
    } catch (error) {
        next(error);
    }
}

// Get all branches for a specific tenant
const getBranchesByTenant = async (req, res, next) => {
    try {
        const { tenantID } = req.params;

        // Check if the tenant exists.
        const tenantExists = await Tenant.findById(tenantID);
        if (!tenantExists) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Fetch branches for the specified tenant.
        const branches = await Branch.find({ tenant: tenantID });

        // If no branches are found, return a custom message.
        if (branches.length === 0) {
            return res.status(404).json({ message: 'No branches found for this tenant' });
        }

        res.status(200).json(branches);
    } catch (error) {
        next(error);
    }
}

// Get speific branch by ID
const getBranchById = async (req, res, next) => {
    try {
        const { branchID } = req.params;

        // Validate ID Format (MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(branchID)) {
            return res.status(400).json({ error: 'Invalid branch ID format' });
        }

        // Check if the branch exists.
        const branch = await Branch.findById(branchID);
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        res.status(200).json(branch);
    } catch (error) {
        next(error);
    }
}

// Update specific branch by tenantID and branchID

module.exports = {
    getAllBranches,
    createAnotherBranch,
    getAllActiveBranches,
    getBranchesByTenant,
    getBranchById
}