const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerDetails,
  toggleCustomerStatus,
} = require('../controllers/customerController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/admin/all', verifyToken, requireAdmin, getAllCustomers);
router.get('/admin/:id', verifyToken, requireAdmin, getCustomerDetails);
router.patch('/admin/:id/toggle', verifyToken, requireAdmin, toggleCustomerStatus);

module.exports = router;
