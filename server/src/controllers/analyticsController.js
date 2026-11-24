const prisma = require('../config/prisma');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      ordersByStatus,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      recentOrders,
      allOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: { id: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, name: true, stock: true, sku: true, price: true },
        take: 10,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          orderStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Calculate total revenue (excluding cancelled orders)
    const validOrders = allOrders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    ordersByStatus.forEach((item) => {
      if (statusCounts[item.orderStatus] !== undefined) {
        statusCounts[item.orderStatus] = item._count.id;
      }
    });

    // Group revenue by last 7 days or recent dates
    const salesByDate = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(5, 10); // MM-DD
      salesByDate[dateKey] = 0;
    }

    validOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().slice(5, 10);
      if (salesByDate[dateKey] !== undefined) {
        salesByDate[dateKey] += Math.round(o.total);
      }
    });

    const salesChart = Object.keys(salesByDate).map((date) => ({
      date,
      revenue: salesByDate[date],
    }));

    // Top selling products by order items count
    const topItems = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    res.json({
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders: statusCounts['Pending'] + statusCounts['Confirmed'],
        deliveredOrders: statusCounts['Delivered'],
        lowStockCount: lowStockProducts.length,
      },
      statusCounts,
      salesChart,
      recentOrders,
      lowStockProducts,
      topSellingProducts: topItems.map((item) => ({
        productId: item.productId,
        name: item.productName,
        soldCount: item._sum.quantity || 0,
        revenue: item._sum.total || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
