const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin
router.get('/admin/all', verifyToken, requireAdmin, getAdminProducts);
router.post('/admin', verifyToken, requireAdmin, createProduct);
router.put('/admin/:id', verifyToken, requireAdmin, updateProduct);
router.patch('/admin/:id/toggle', verifyToken, requireAdmin, toggleProductStatus);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
