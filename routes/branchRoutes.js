const router = require('express').Router();
const { authenticateUser, authorizeRoles } = require('../middlewares/auth');
const {
    getAllBranches,
    createAnotherBranch,
    getAllActiveBranches,
    getBranchesByTenant,
    getBranchById
} = require('../controllers/branchController');


router.get('/', authenticateUser, authorizeRoles('superadmin', 'owner'), getAllBranches);
router.post('/', authenticateUser, authorizeRoles('superadmin', 'owner'), createAnotherBranch);
router.get('/active', authenticateUser, authorizeRoles('superadmin', 'owner'), getAllActiveBranches);
router.get('/tenant/:tenantID', authenticateUser, authorizeRoles('superadmin', 'owner'), getBranchesByTenant);
router.get('/tenant/:tenantID/branch/:branchID', authenticateUser, authorizeRoles('superadmin', 'owner'), getBranchById);

module.exports = router;