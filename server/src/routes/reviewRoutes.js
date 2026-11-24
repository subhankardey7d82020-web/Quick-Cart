const express = require('express');
const router = express.Router();
const { addReview, getProductReviews } = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, addReview);
router.get('/product/:productId', getProductReviews);

module.exports = router;
