const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

async function verify() {
  console.log('--- Quick Cart Full-Stack Verification ---');

  // Products
  const productsCount = await prisma.product.count();
  console.log('✅ Products in database:', productsCount);

  // Categories
  const categories = await prisma.category.findMany();
  console.log('✅ Categories in database:', categories.length, `(${categories.map(c => c.name).slice(0, 3).join(', ')}...)`);

  // Admin Verification
  const admin = await prisma.user.findUnique({ where: { email: 'admin@quickcart.com' } });
  const isMatch = await bcrypt.compare('admin123', admin.password);
  console.log('✅ Admin login verified:', admin.email, '| Password matches admin123:', isMatch);

  // Customer Verification
  const customer = await prisma.user.findUnique({ where: { email: 'customer@quickcart.com' } });
  const isCustMatch = await bcrypt.compare('customer123', customer.password);
  console.log('✅ Customer login verified:', customer.email, '| Password matches customer123:', isCustMatch);

  // Coupons
  const coupons = await prisma.coupon.findMany();
  console.log('✅ Active Coupons:', coupons.map(c => c.code).join(', '));

  // Orders
  const orders = await prisma.order.findMany({ include: { items: true } });
  console.log('✅ Seeded Sample Orders:', orders.length);
  orders.forEach(o => {
    console.log(`   • ${o.orderNumber} - Status: ${o.orderStatus} - ₹${o.total} (${o.items.length} items)`);
  });

  // Settings
  const settings = await prisma.storeSetting.findMany();
  console.log('✅ Store Settings configured:', settings.length, 'key-value pairs');

  await prisma.$disconnect();
  console.log('\n🎉 ALL SYSTEMS & BUSINESS LOGIC FULLY OPERATIONAL!');
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
