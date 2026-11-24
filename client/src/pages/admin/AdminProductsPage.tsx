import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { Product, Category } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    sku: '',
    stock: '',
    categoryId: '',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    sizes: 'XS, S, M, L, XL',
    colors: 'Ivory:#FFFFF0, Onyx:#1A1A1A, Camel:#C19A6B',
    images: [] as string[],
  });

  const { formatPrice } = useSettings();
  const { success, error } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.adminGetProducts({ search, category: selectedCategory }),
        api.adminGetCategories(),
      ]);
      if (prodRes?.products) setProducts(prodRes.products);
      if (catRes?.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      sku: '',
      stock: '15',
      categoryId: categories[0]?.id ? String(categories[0].id) : '1',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isActive: true,
      sizes: 'XS, S, M, L, XL',
      colors: 'Ivory:#FFFFF0, Onyx:#1A1A1A, Camel:#C19A6B',
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    const sizeStr = Array.isArray(p.sizes) ? p.sizes.join(', ') : '';
    const colorStr = Array.isArray(p.colors)
      ? p.colors.map((c: any) => `${c.name}:${c.hex}`).join(', ')
      : '';
    const imgUrls = p.images?.map((img: any) => img.url) || [];

    setFormData({
      name: p.name,
      description: p.description,
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : '',
      sku: p.sku,
      stock: String(p.stock),
      categoryId: String(p.categoryId),
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isActive: p.isActive,
      sizes: sizeStr,
      colors: colorStr,
      images: imgUrls,
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploadingImage(true);
    try {
      const res = await api.adminUploadImage(file);
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.url],
        }));
        success('Image uploaded to server.');
      }
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrlPrompt = () => {
    const url = window.prompt('Enter direct image URL:');
    if (url && url.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      error('Name, price, and category are required.');
      return;
    }

    // Parse sizes
    const parsedSizes = formData.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Parse colors e.g. "Ivory:#FFFFF0, Onyx:#1A1A1A"
    const parsedColors = formData.colors
      .split(',')
      .map((item) => {
        const parts = item.split(':');
        if (parts.length === 2) {
          return { name: parts[0].trim(), hex: parts[1].trim() };
        }
        return { name: item.trim(), hex: '#111111' };
      })
      .filter((c) => c.name);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      sku: formData.sku.trim() || undefined,
      stock: parseInt(formData.stock) || 0,
      categoryId: parseInt(formData.categoryId),
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isNewArrival: formData.isNewArrival,
      isActive: formData.isActive,
      sizes: parsedSizes,
      colors: parsedColors,
      images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'],
    };

    try {
      if (editingProduct) {
        await api.adminUpdateProduct(editingProduct.id, payload);
        success('Product updated successfully.');
      } else {
        await api.adminCreateProduct(payload);
        success('Product created successfully.');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.adminToggleProduct(id);
      setProducts(products.map((p) => (p.id === id ? { ...p, isActive: res.isActive } : p)));
      success(res.message || 'Status updated.');
    } catch (err: any) {
      error(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await api.adminDeleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      success('Product deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-sand-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Inventory Management
          </p>
          <h1 className="font-serif text-3xl text-noir-900 font-normal">
            Atelier Products
          </h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 border border-sand-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-sand-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-sand-200 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">Loading catalog articles...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">No products found matching criteria.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';
                  return (
                    <tr key={p.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img src={img} alt="" className="w-10 h-14 object-cover bg-sand-100 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-noir-900 line-clamp-1">{p.name}</p>
                          <span className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 font-medium">
                        {p.category?.name || 'Unassigned'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-noir-900">{formatPrice(p.salePrice || p.price)}</span>
                        {p.salePrice && (
                          <span className="text-[10px] text-neutral-400 line-through block">{formatPrice(p.price)}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          p.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-noir-800'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {p.isFeatured && <span className="bg-accent text-noir-900 text-[9px] px-1.5 py-0.5 font-bold uppercase">Featured</span>}
                          {p.isBestSeller && <span className="bg-noir-900 text-cream-50 text-[9px] px-1.5 py-0.5 font-bold uppercase">Best</span>}
                          {p.isNewArrival && <span className="bg-sand-200 text-noir-900 text-[9px] px-1.5 py-0.5 font-bold uppercase">New</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded flex items-center space-x-1 ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{p.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-neutral-500 hover:text-noir-900 hover:bg-cream-100 rounded"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-sand-200">
              <h3 className="font-serif text-2xl font-normal text-noir-900">
                {editingProduct ? 'Edit Atelier Product' : 'Add New Atelier Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Céline Double-Breasted Trench"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QC-TR-001 (auto-generated if blank)"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="8499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="6999 (Optional)"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                  Description & Tailoring Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the fabric weave, fit, silhouette, and origins..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Available Sizes (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="XS, S, M, L, XL"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Colors (Name:Hex, comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Ivory:#FFFFF0, Onyx:#1A1A1A"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
                  />
                </div>
              </div>

              {/* Image Uploader & Gallery */}
              <div className="space-y-2 pt-2 border-t border-sand-200">
                <div className="flex justify-between items-center">
                  <label className="uppercase tracking-wider font-semibold text-noir-800">
                    Product Photography
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={handleAddImageUrlPrompt}
                      className="px-2.5 py-1 bg-cream-100 hover:bg-cream-200 border border-sand-300 text-[10px] uppercase font-semibold"
                    >
                      + Image Link
                    </button>
                    <label className="px-2.5 py-1 bg-noir-900 hover:bg-noir-800 text-cream-50 text-[10px] uppercase font-semibold cursor-pointer inline-flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingImage ? 'Uploading...' : 'Local Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {formData.images.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 italic">No images attached. A default luxury editorial image will be assigned if left empty.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-16 h-20 bg-sand-100 flex-shrink-0 border border-sand-300">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Boolean Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-sand-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">Featured</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">Best Seller</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">New Arrival</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">Active in Store</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-sand-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors shadow-md"
                >
                  {editingProduct ? 'Save Modifications' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
