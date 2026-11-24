const prisma = require('../config/prisma');

// Public: Validate coupon during cart / checkout
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active.' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit.' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < coupon.minSpend) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minSpend.toLocaleString('en-IN')} required for this coupon.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(orderSubtotal, coupon.discountValue);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      calculatedDiscount: Math.round(discount),
      message: `Coupon applied! You saved ₹${Math.round(discount).toLocaleString('en-IN')}`,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Coupon
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minSpend, maxDiscount, usageLimit, expiresAt, isActive } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ message: 'Code and discount value are required.' });
    }

    const upperCode = code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: upperCode } });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: upperCode,
        discountType: discountType || 'percentage',
        discountValue: parseFloat(discountValue),
        minSpend: minSpend ? parseFloat(minSpend) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json({ message: 'Coupon created successfully.', coupon });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Coupon
const updateCoupon = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { code, discountType, discountValue, minSpend, maxDiscount, usageLimit, expiresAt, isActive } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        discountType: discountType !== undefined ? discountType : undefined,
        discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
        minSpend: minSpend !== undefined ? parseFloat(minSpend) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? parseFloat(maxDiscount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit) : null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    res.json({ message: 'Coupon updated successfully.', coupon: updated });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Coupon
const deleteCoupon = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
