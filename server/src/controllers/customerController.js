const prisma = require('../config/prisma');

// Admin: Get all customers with search & order summary
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const take = parseInt(limit) || 20;
    const skip = (pageNum - 1) * take;

    const where = { role: 'customer' };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      isActive: c.isActive,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
    }));

    res.json({
      customers: formatted,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Single Customer Details & History
const getCustomerDetails = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        addresses: true,
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      customer: {
        ...customer,
        totalSpent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle Customer Active Status
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await prisma.user.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    if (customer.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin accounts from here.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !customer.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    res.json({
      message: `Customer account ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      customer: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerDetails,
  toggleCustomerStatus,
};
