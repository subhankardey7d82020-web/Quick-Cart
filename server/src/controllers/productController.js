const prisma = require('../config/prisma');

// Generate unique slug from title
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
};

// Public Get All Products with Search, Filter, Sort, Pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sizes,
      colors,
      inStock,
      isFeatured,
      isBestSeller,
      isNewArrival,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit) || 12));
    const skip = (pageNum - 1) * take;

    const where = {
      isActive: true,
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (category) {
      if (!isNaN(category)) {
        where.categoryId = parseInt(category);
      } else {
        where.category = { slug: category };
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (isBestSeller === 'true') {
      where.isBestSeller = true;
    }

    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }

    // Determine sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popularity' || sort === 'bestseller') {
      orderBy = { isBestSeller: 'desc' };
    } else if (sort === 'featured') {
      orderBy = { isFeatured: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const [total, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
    ]);

    // Parse sizes and colors JSON strings & calculate review stats
    let products = rawProducts.map((p) => {
      let parsedSizes = [];
      let parsedColors = [];
      try {
        parsedSizes = JSON.parse(p.sizes || '[]');
      } catch (e) {
        parsedSizes = p.sizes ? p.sizes.split(',').map((s) => s.trim()) : [];
      }
      try {
        parsedColors = JSON.parse(p.colors || '[]');
      } catch (e) {
        parsedColors = [];
      }

      const reviewCount = p.reviews.length;
      const avgRating =
        reviewCount > 0
          ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
          : 5.0;

      return {
        ...p,
        sizes: parsedSizes,
        colors: parsedColors,
        rating: avgRating,
        reviewCount,
      };
    });

    // In-memory filter for sizes and colors if requested
    if (sizes) {
      const sizeList = sizes.split(',').map((s) => s.trim().toUpperCase());
      products = products.filter((p) =>
        p.sizes.some((s) => sizeList.includes(s.toUpperCase()))
      );
    }

    if (colors) {
      const colorList = colors.split(',').map((c) => c.trim().toLowerCase());
      products = products.filter((p) =>
        p.colors.some((c) => colorList.includes(c.name.toLowerCase()))
      );
    }

    res.json({
      products,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// Public Get Single Product by Slug or ID
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const isNumeric = !isNaN(slug);
    const whereCondition = isNumeric ? { id: parseInt(slug) } : { slug };

    const product = await prisma.product.findFirst({
      where: whereCondition,
      include: {
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let parsedSizes = [];
    let parsedColors = [];
    try {
      parsedSizes = JSON.parse(product.sizes || '[]');
    } catch (e) {
      parsedSizes = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : [];
    }
    try {
      parsedColors = JSON.parse(product.colors || '[]');
    } catch (e) {
      parsedColors = [];
    }

    const reviewCount = product.reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 5.0;

    // Fetch related products from same category
    const relatedProductsRaw = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }] },
      },
    });

    const relatedProducts = relatedProductsRaw.map((rp) => ({
      ...rp,
      sizes: JSON.parse(rp.sizes || '[]'),
      colors: JSON.parse(rp.colors || '[]'),
    }));

    res.json({
      product: {
        ...product,
        sizes: parsedSizes,
        colors: parsedColors,
        rating: avgRating,
        reviewCount,
      },
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all products (including inactive)
const getAdminProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const take = parseInt(limit) || 50;
    const skip = (pageNum - 1) * take;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (category) {
      where.categoryId = parseInt(category);
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: [{ isPrimary: 'desc' }] },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = products.map((p) => {
      let sizes = [];
      let colors = [];
      try { sizes = JSON.parse(p.sizes || '[]'); } catch (e) {}
      try { colors = JSON.parse(p.colors || '[]'); } catch (e) {}
      return { ...p, sizes, colors };
    });

    res.json({ products: formatted, total, totalPages: Math.ceil(total / take) });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Product
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      sku,
      stock,
      categoryId,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isActive,
      sizes,
      colors,
      images,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const slug = generateSlug(name);
    const generatedSku = sku || 'QC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        sku: generatedSku,
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes || ['S', 'M', 'L', 'XL']),
        colors: typeof colors === 'string' ? colors : JSON.stringify(colors || []),
      },
    });

    // Handle images array of URLs
    if (images && Array.isArray(images) && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((imgUrl, idx) => ({
          productId: product.id,
          url: imgUrl,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
      },
    });

    res.status(201).json({ message: 'Product created successfully.', product: fullProduct });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Product
const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name,
      description,
      price,
      salePrice,
      sku,
      stock,
      categoryId,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isActive,
      sizes,
      colors,
      images,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        salePrice: salePrice !== undefined ? (salePrice ? parseFloat(salePrice) : null) : undefined,
        sku: sku !== undefined ? sku : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sizes: sizes !== undefined ? (typeof sizes === 'string' ? sizes : JSON.stringify(sizes)) : undefined,
        colors: colors !== undefined ? (typeof colors === 'string' ? colors : JSON.stringify(colors)) : undefined,
      },
    });

    // If new images provided, replace or update
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((url, idx) => ({
            productId: id,
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        });
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });

    res.json({ message: 'Product updated successfully.', product: fullProduct });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Product
const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle Product Active Status
const toggleProductStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    res.json({
      message: `Product ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      isActive: updated.isActive,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
};
