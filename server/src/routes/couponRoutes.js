const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/validate', validateCoupon);

// Admin
router.get('/admin/all', verifyToken, requireAdmin, getCoupons);
router.post('/admin', verifyToken, requireAdmin, createCoupon);
router.put('/admin/:id', verifyToken, requireAdmin, updateCoupon);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteCoupon);

module.exports = router;
