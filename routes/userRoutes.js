const router = require('express').Router();
const { authenticateUser, authorizeRoles } = require('../middlewares/auth');
const { 
    loginUser,
    createUser, 
    getAllUser,
    getTenantById,
    updateUser,
    deactivateUser,
    reactivateUser
} = require('../controllers/userController');


router.post('/login', loginUser)
router.post('/', authenticateUser, authorizeRoles('superadmin', 'owner', 'manager'), createUser);
router.get('/', authenticateUser, authorizeRoles('superadmin', 'owner', 'manager'), getAllUser);
router.get('/:id', getTenantById);
router.put('/:id', updateUser),
router.put('/deactivate/:id', deactivateUser);
router.put('/reactivate/:id', reactivateUser);

module.exports = router