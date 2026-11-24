const express = require('express');
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  updatePassword,
  addAddress,
  getAddresses,
  deleteAddress,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);

// Customer protected routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, updatePassword);
router.post('/addresses', verifyToken, addAddress);
router.get('/addresses', verifyToken, getAddresses);
router.delete('/addresses/:id', verifyToken, deleteAddress);

module.exports = router;
