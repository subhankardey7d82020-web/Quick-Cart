const express = require('express');
const router = express.Router();
const {
  createOrder,
  trackOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  exportOrdersCsv,
} = require('../controllers/orderController');
const { verifyToken, optionalAuth, requireAdmin } = require('../middleware/auth');

// Public / Guest / Customer
router.post('/', optionalAuth, createOrder);
router.get('/track', trackOrder);

// Customer protected
router.get('/my-orders', verifyToken, getMyOrders);
router.patch('/:id/cancel', verifyToken, cancelOrder);

// Admin protected
router.get('/admin/all', verifyToken, requireAdmin, getAllOrders);
router.get('/admin/export-csv', verifyToken, requireAdmin, exportOrdersCsv);
router.patch('/admin/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
