import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Upload, Eye, EyeOff, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { success, error } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetCategories();
      if (res?.categories) setCategories(res.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('');
    setIsFeatured(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsFeatured(cat.isFeatured);
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploadingImage(true);
    try {
      const res = await api.adminUploadImage(file);
      if (res?.url) {
        setImage(res.url);
        success('Category image uploaded.');
      }
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Category name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      image: image || undefined,
      isFeatured,
      isActive,
    };

    try {
      if (editingCategory) {
        await api.adminUpdateCategory(editingCategory.id, payload);
        success('Category updated successfully.');
      } else {
        await api.adminCreateCategory(payload);
        success('Category created successfully.');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      error(err.message || 'Category action failed.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will need reassignment.')) return;
    try {
      await api.adminDeleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      success('Category deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-sand-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Taxonomy & Navigation
          </p>
          <h1 className="font-serif text-3xl text-noir-900 font-normal">
            Boutique Categories
          </h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full py-12 text-center text-xs text-neutral-400">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="col-span-full py-12 text-center text-xs text-neutral-400">No categories found.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-sand-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="relative aspect-[16/9] bg-sand-100 overflow-hidden">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  {cat.isFeatured && (
                    <span className="bg-accent text-noir-900 text-[10px] font-bold px-2 py-0.5 uppercase">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-serif text-lg font-normal text-noir-900">{cat.name}</h3>
                    <span className="text-[11px] text-neutral-400 font-mono">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1 font-light">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    <strong className="text-noir-900 font-bold">{cat.productCount || 0}</strong> products
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-1.5 text-neutral-500 hover:text-noir-900 hover:bg-cream-100 rounded"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sand-200">
            <div className="flex justify-between items-center pb-4 border-b border-sand-200">
              <h3 className="font-serif text-xl font-normal text-noir-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Women's Couture"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                  Category Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Sophisticated silhouettes, fluid evening dresses, and contemporary tailoring..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                  Category Image
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="flex-1 p-2 bg-cream-50/50 border border-sand-300 text-xs"
                    />
                    <label className="px-3 py-2 bg-noir-900 text-cream-50 text-[10px] uppercase font-semibold cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingImage ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {image && (
                    <img src={image} alt="" className="w-24 h-16 object-cover border border-sand-200" />
                  )}
                </div>
              </div>

              <div className="flex space-x-6 pt-2 border-t border-sand-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">Featured on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">Active in Navigation</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-sand-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors shadow-sm"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
