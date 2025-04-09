const router = require('express').Router();
const { authenticateUser, authorizeRoles } = require('../middlewares/auth');
const {
    getAllBranches
} = require('../controllers/branchController');


router.get('/', authenticateUser, authorizeRoles('superadmin', 'owner'), getAllBranches);


module.exports = router;