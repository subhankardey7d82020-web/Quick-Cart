const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyToken, requireAdmin, getDashboardStats);

module.exports = router;
