const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin
router.get('/admin/all', verifyToken, requireAdmin, getAdminCategories);
router.post('/admin', verifyToken, requireAdmin, createCategory);
router.put('/admin/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteCategory);

module.exports = router;
