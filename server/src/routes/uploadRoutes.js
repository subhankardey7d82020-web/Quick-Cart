const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const isProduction = process.env.NODE_ENV === 'production';

// In production (Render), the disk is ephemeral — uploaded files are wiped on redeploy.
// Block direct file uploads and require image URLs instead.
const blockInProduction = (req, res, next) => {
  if (isProduction) {
    return res.status(400).json({
      message:
        'Direct file upload is not supported in production. ' +
        'Please provide an image URL (e.g. from Unsplash, Imgur, or any CDN) in the image URL field instead.',
    });
  }
  next();
};

// Upload single image (local dev only)
router.post('/single', verifyToken, requireAdmin, blockInProduction, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'Image uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
  });
});

// Upload multiple images (local dev only)
router.post('/multiple', verifyToken, requireAdmin, blockInProduction, upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No image files uploaded.' });
  }

  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({
    message: 'Images uploaded successfully.',
    urls,
  });
});

module.exports = router;
