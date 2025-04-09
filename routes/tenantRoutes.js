const router = require('express').Router();
const { authenticateUser, authorizeRoles } = require('../middlewares/auth');
const { createTenant, getAllTenants, getTenantById, updateTenant, deleteTenant, reactivateTenant, getAllActiveTenants } = require('../controllers/tenantController');

router.post('/', authenticateUser, authorizeRoles('superadmin'), createTenant);
router.get('/', authenticateUser, authorizeRoles('superadmin'), getAllTenants);
router.get('/active', authenticateUser, authorizeRoles('superadmin'), getAllActiveTenants);
router.get('/:id', authenticateUser, authorizeRoles('superadmin'), getTenantById);
router.put('/:id', authenticateUser, authorizeRoles('superadmin'), updateTenant);
router.put('/deactivate/:id', authenticateUser, authorizeRoles('superadmin'), deleteTenant)
router.put('/reactivate/:id', authenticateUser, authorizeRoles('superadmin'), reactivateTenant);

module.exports = router;