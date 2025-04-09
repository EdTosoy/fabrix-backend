const { default: mongoose } = require('mongoose');
const User = require('../models/UserModel.js');
const Tenant = require('../models/TenantModel.js');
const Branch = require('../models/BranchModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists.
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare passwords.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT Token.
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        
        res.status(200).json({ message: 'Login successful', token, user })
    } catch (error) {
        next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const { tenantID, branchID, name, email, phone, role, password } = req.body;
        const rolesWithBranchRequirement = ["manager", "staff", "rider", "customer"];
        let branch = null; // Default to null, will be assigned if applicable.

        // Validate required fields.
        if (!tenantID || !name || !email || !phone || !role || !password) {
            return res.status(400).json({ error: 'All fields (tenantID, name, email, phone, role, password) are required' });
        }

        // Check if the tenant exists.
        const tenant = await Tenant.findById(tenantID);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found!' });
        }

        // Check if the email is already registered.
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered!' });
        }

        // Hash password before storing.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Validate branch association for roles that require it.
        if (!branchID && rolesWithBranchRequirement.includes(role)) {
            return res.status(400).json({ error: 'Branch is required for this role!' });
        } else if (branchID) {
            // If branchID is provided, check if it exists.
            branch = await Branch.findById(branchID);
            if (!branch) {
                return res.status(404).json({ error: 'Branch not found!' });
            }

            // Ensure the branch belongs to the specified tenant.
            if (branch.tenantID.toString() !== tenant._id.toString()) {
                return res.status(400).json({ error: 'Branch does not belong to the specified tenant.' });
            }
        }

        // Create and save the new user.
        const newUser = new User({
            tenantID: tenantID,
            branchID: branch ? branch._id : null, // Assign branch only if applicable.
            name,
            email,
            phone,
            role,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        next(error); // Pass error to global error handler.
    }
};

const getAllUser = async (req, res) => {
    try {
        let users;

        switch (req.user.role) {
            case 'superadmin':
                users = await User.find();
                break;
            case 'owner':
                users = await User.find({ tenantID: req.user.tenantID }); 
                break;
            case 'manager':
                users = await User.find({ role: {$ne: 'owner'}, tenantID: req.user.tenantID, branchID: req.user.branchID })
                break;
            default:
                break;
        }

        if (users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
}

const getTenantById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        };

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
}

const updateUser = async (req, res) => {
    try {   
        const { id } = req.params;
        const { name, email, phone, role, password } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        };

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.password = password || user.password;

        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
}

const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isActive == false) {
            return res.status(400).json({ error: 'User is already deactivated' });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
}

const reactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isActive == true) {
            return res.status(400).json({ error: 'User is already reactivated' });
        }

        user.isActive = true;
        await user.save();

        res.status(200).json({ message: 'User reactivated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
}

module.exports = {
    loginUser,
    createUser,
    getAllUser,
    getTenantById,
    updateUser,
    deactivateUser,
    reactivateUser
}