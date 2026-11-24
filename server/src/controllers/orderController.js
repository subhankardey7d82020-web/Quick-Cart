const prisma = require('../config/prisma');

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `QC-${dateStr}-${randomStr}`;
};

// Create New Order (Guest or Logged In User)
const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingLandmark,
      paymentMethod = 'COD',
      items,
      couponCode,
      notes,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingStreet || !shippingCity || !shippingState || !shippingPincode) {
      return res.status(400).json({ message: 'All required customer contact and address details must be provided.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    // Calculate subtotal from database prices for safety
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} was not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`,
        });
      }

      const activePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const itemTotal = activePrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productImage: item.productImage || null,
        price: activePrice,
        quantity: item.quantity,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        total: itemTotal,
      });
    }

    // Get settings for shipping fee & free shipping threshold
    const settings = await prisma.storeSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    const shippingChargeSetting = parseFloat(settingsMap['shippingCharges'] || '99');
    const freeShippingThreshold = parseFloat(settingsMap['freeShippingThreshold'] || '1499');

    let shippingFee = subtotal >= freeShippingThreshold ? 0 : shippingChargeSetting;

    // Process Coupon if provided
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const underLimit = coupon.usageLimit === null || coupon.timesUsed < coupon.usageLimit;
        const meetsMinSpend = subtotal >= coupon.minSpend;

        if (notExpired && underLimit && meetsMinSpend) {
          appliedCoupon = coupon;
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = Math.min(subtotal, coupon.discountValue);
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount + shippingFee);
    const orderNumber = generateOrderNumber();

    // Determine initial payment status
    const paymentStatus = paymentMethod === 'DEMO_INSTANT' ? 'Paid' : 'Pending';

    // Create Order with Items transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user ? req.user.id : null,
          customerName: customerName.trim(),
          customerEmail: customerEmail.toLowerCase().trim(),
          customerPhone: customerPhone.trim(),
          shippingStreet: shippingStreet.trim(),
          shippingCity: shippingCity.trim(),
          shippingState: shippingState.trim(),
          shippingPincode: shippingPincode.trim(),
          shippingLandmark: shippingLandmark ? shippingLandmark.trim() : null,
          paymentMethod,
          paymentStatus,
          orderStatus: 'Confirmed',
          subtotal,
          shippingFee,
          discount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          total,
          notes: notes ? notes.trim() : null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Deduct inventory
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Increment coupon usage if used
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Track Order by Order Number & Optional Phone Check
const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber) {
      return res.status(400).json({ message: 'Order number is required.' });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found with this tracking ID.' });
    }

    // If phone is provided, verify matching digits
    if (phone && phone.trim()) {
      const cleanedQueryPhone = phone.trim().replace(/\D/g, '');
      const cleanedOrderPhone = order.customerPhone.replace(/\D/g, '');
      if (!cleanedOrderPhone.endsWith(cleanedQueryPhone) && !cleanedQueryPhone.endsWith(cleanedOrderPhone)) {
        return res.status(400).json({ message: 'Phone number does not match this order.' });
      }
    }

    // Status timeline mapping
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(order.orderStatus);

    res.json({
      order,
      timeline: statuses.map((status, index) => ({
        status,
        isCompleted: order.orderStatus === 'Cancelled' ? false : index <= currentStatusIndex,
        isCurrent: order.orderStatus === status,
      })),
      isCancelled: order.orderStatus === 'Cancelled',
    });
  } catch (error) {
    next(error);
  }
};

// Customer: Get My Orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

// Customer / Admin: Cancel Order
const cancelOrder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled.' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled.' });
    }

    // Update status and restore product stocks
    const updated = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id },
        data: { orderStatus: 'Cancelled' },
      });

      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return cancelled;
    });

    res.json({ message: 'Order cancelled successfully.', order: updated });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Orders with Search & Filter
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const take = parseInt(limit) || 20;
    const skip = (pageNum - 1) * take;

    const where = {};
    if (status && status !== 'All') {
      where.orderStatus = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({
      orders,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { orderStatus, paymentStatus } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status value.' });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    if (orderStatus === 'Delivered' && !paymentStatus) {
      updateData.paymentStatus = 'Paid';
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    res.json({ message: 'Order status updated successfully.', order: updated });
  } catch (error) {
    next(error);
  }
};

// Admin: Export Orders to CSV
const exportOrdersCsv = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Shipping Address',
      'City',
      'State',
      'Pincode',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Subtotal',
      'Shipping Fee',
      'Discount',
      'Total',
      'Item Count',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toISOString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.shippingStreet.replace(/"/g, '""')}"`,
      `"${o.shippingCity}"`,
      `"${o.shippingState}"`,
      `"${o.shippingPincode}"`,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      o.subtotal.toFixed(2),
      o.shippingFee.toFixed(2),
      o.discount.toFixed(2),
      o.total.toFixed(2),
      o.items.reduce((s, i) => s + i.quantity, 0),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-export.csv"');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  trackOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  exportOrdersCsv,
};
