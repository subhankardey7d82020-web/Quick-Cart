const prisma = require('../config/prisma');

// Public: Add review for product
const addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, authorName } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and review text are required.' });
    }

    const numericRating = Math.max(1, Math.min(5, parseInt(rating) || 5));
    const name = req.user ? req.user.name : (authorName || 'Verified Buyer');

    const review = await prisma.review.create({
      data: {
        productId: parseInt(productId),
        userId: req.user ? req.user.id : null,
        authorName: name,
        rating: numericRating,
        comment: comment.trim(),
      },
      include: {
        user: { select: { name: true } },
      },
    });

    res.status(201).json({ message: 'Thank you! Your review has been submitted.', review });
  } catch (error) {
    next(error);
  }
};

// Public: Get reviews for a product
const getProductReviews = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    const total = reviews.length;
    const average =
      total > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
        : 5.0;

    res.json({ reviews, total, average });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getProductReviews,
};
