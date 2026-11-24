const prisma = require('../config/prisma');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// Public: Get all active categories with product counts
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    res.json({ categories: formatted });
  } catch (error) {
    next(error);
  }
};

// Public: Get category by slug with its products
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: { orderBy: [{ isPrimary: 'desc' }] },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json({ category });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all categories (including inactive)
const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    res.json({ categories: formatted });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, isFeatured, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    let slug = generateSlug(name);
    // ensure unique slug
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description || '',
        image: image || null,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Category
const updateCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, image, isFeatured, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      slug = generateSlug(name);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        slug,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    res.json({ message: 'Category updated successfully.', category: updated });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Category
const deleteCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
