import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const COMMON_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Grey', hex: '#9E9E9E' },
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Active filters from URL query
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sizes = searchParams.get('sizes') ? searchParams.get('sizes')!.split(',') : [];
  const colors = searchParams.get('colors') ? searchParams.get('colors')!.split(',') : [];
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const isNewArrival = searchParams.get('isNewArrival') === 'true';
  const isBestSeller = searchParams.get('isBestSeller') === 'true';

  // Load Categories once
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res?.categories) setCategories(res.categories);
    }).catch(console.error);
  }, []);

  // Fetch products whenever filters or page change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        search,
        category,
        minPrice,
        maxPrice,
        sizes: sizes.join(','),
        colors: colors.join(','),
        inStock,
        sort,
        page,
        limit: 12,
        isNewArrival: isNewArrival ? 'true' : undefined,
        isBestSeller: isBestSeller ? 'true' : undefined,
      });

      if (res) {
        setProducts(res.products || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sizes.join(','), colors.join(','), inStock, sort, page, isNewArrival, isBestSeller]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    // Reset page to 1 on filter changes
    if (!newParams.page) {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  const handleSizeToggle = (size: string) => {
    let nextSizes = [...sizes];
    if (nextSizes.includes(size)) {
      nextSizes = nextSizes.filter((s) => s !== size);
    } else {
      nextSizes.push(size);
    }
    updateFilters({ sizes: nextSizes.length ? nextSizes.join(',') : null });
  };

  const handleColorToggle = (colorName: string) => {
    let nextColors = [...colors];
    if (nextColors.includes(colorName)) {
      nextColors = nextColors.filter((c) => c !== colorName);
    } else {
      nextColors.push(colorName);
    }
    updateFilters({ colors: nextColors.length ? nextColors.join(',') : null });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    search || category || minPrice || maxPrice || sizes.length || colors.length || inStock || isNewArrival || isBestSeller
  );

  // Render Filter Content (reused on Desktop sidebar and Mobile drawer)
  const FilterContent = (
    <div className="space-y-8">
      {/* Search Input */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-noir-900 font-semibold mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value || null })}
            className="w-full pl-9 pr-3 py-2 bg-white border border-sand-300 text-xs text-noir-900 placeholder-neutral-400 focus:outline-none focus:border-noir-900"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-noir-900 font-semibold mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 text-xs">
          <button
            onClick={() => updateFilters({ category: null })}
            className={`block w-full text-left py-1 tracking-wider transition-colors ${
              !category ? 'font-bold text-accent' : 'text-neutral-600 hover:text-noir-900'
            }`}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilters({ category: cat.slug })}
              className={`block w-full text-left py-1 tracking-wider transition-colors ${
                category === cat.slug ? 'font-bold text-accent' : 'text-neutral-600 hover:text-noir-900'
              }`}
            >
              {cat.name} {cat.productCount !== undefined && `(${cat.productCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-noir-900 font-semibold mb-3">
          Price Range
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase">Min (₹)</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value || null })}
              className="w-full p-2 bg-white border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase">Max (₹)</span>
            <input
              type="number"
              placeholder="15000"
              value={maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value || null })}
              className="w-full p-2 bg-white border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
            />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-noir-900 font-semibold mb-3">
          Sizes
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-3 py-1.5 text-xs uppercase border transition-colors ${
                  isSelected
                    ? 'bg-noir-900 text-cream-50 border-noir-900'
                    : 'bg-white text-noir-800 border-sand-300 hover:border-noir-900'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-noir-900 font-semibold mb-3">
          Colors
        </h4>
        <div className="flex flex-wrap gap-2">
          {COMMON_COLORS.map((col) => {
            const isSelected = colors.includes(col.name);
            return (
              <button
                key={col.name}
                onClick={() => handleColorToggle(col.name)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-noir-900 scale-110 shadow-sm' : 'border-neutral-200'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / In-Stock Toggle */}
      <div className="pt-2 border-t border-sand-200">
        <label className="flex items-center space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : null })}
            className="w-4 h-4 text-noir-900 focus:ring-0 rounded-none border-sand-300"
          />
          <span className="text-xs uppercase tracking-wider text-noir-800 font-medium">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Reset Filters CTA */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 bg-cream-100 hover:bg-cream-200 text-noir-900 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-colors border border-sand-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Breadcrumb */}
      <div className="mb-8 pb-6 border-b border-sand-200">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Atelier Catalog
        </p>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
            {category
              ? categories.find((c) => c.slug === category)?.name || 'Collection'
              : isNewArrival
              ? 'New Seasonal Arrivals'
              : isBestSeller
              ? 'Best Selling Pieces'
              : 'All Ready-To-Wear'}
          </h1>
          <p className="text-xs text-neutral-500 tracking-wider">
            Showing <strong className="text-noir-900">{total}</strong> bespoke items
          </p>
        </div>
      </div>

      {/* Action Bar (Mobile Filter Toggle + Sort Dropdown) */}
      <div className="flex justify-between items-center mb-8 bg-cream-100/60 p-3 sm:p-4 border border-sand-200">
        {/* Mobile Filter Trigger Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-noir-900 bg-white px-4 py-2 border border-sand-300 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters {hasActiveFilters && '•'}</span>
        </button>

        {/* Desktop Active Filter Chips Preview */}
        <div className="hidden lg:flex items-center space-x-2 flex-wrap">
          {hasActiveFilters && (
            <span className="text-xs text-neutral-500 mr-2">Active filters:</span>
          )}
          {category && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-sand-300 text-[11px] font-medium text-noir-900">
              <span>Category: {category}</span>
              <button onClick={() => updateFilters({ category: null })} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-sand-300 text-[11px] font-medium text-noir-900">
              <span>"{search}"</span>
              <button onClick={() => updateFilters({ search: null })} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-3 ml-auto">
          <span className="text-xs uppercase tracking-wider text-neutral-500 hidden sm:inline">Sort By:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="appearance-none bg-white border border-sand-300 px-4 py-2 pr-8 text-xs font-medium uppercase tracking-wider text-noir-900 focus:outline-none focus:border-noir-900 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Popularity / Best Sellers</option>
              <option value="featured">Featured Curations</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 p-6 bg-white border border-sand-200">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-sand-200">
              <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900">
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] uppercase tracking-wider text-accent hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
            {FilterContent}
          </div>
        </div>

        {/* Products Grid Section */}
        <div className="lg:col-span-3">
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white border border-sand-200 space-y-4">
              <h3 className="font-serif text-2xl font-normal text-noir-900">No items match your criteria</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Try loosening your filters, adjusting the price range, or searching for other tailoring terms.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-8 border-t border-sand-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateFilters({ page: String(page - 1) })}
                    className="px-4 py-2 border border-sand-300 text-xs uppercase tracking-wider font-semibold disabled:opacity-40 hover:bg-cream-100 transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilters({ page: String(pageNum) })}
                        className={`w-9 h-9 text-xs font-semibold uppercase transition-colors ${
                          page === pageNum
                            ? 'bg-noir-900 text-cream-50'
                            : 'border border-sand-300 hover:bg-cream-100 text-noir-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateFilters({ page: String(page + 1) })}
                    className="px-4 py-2 border border-sand-300 text-xs uppercase tracking-wider font-semibold disabled:opacity-40 hover:bg-cream-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-noir-900/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-sand-200">
                <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900">
                  Filter Catalog
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-neutral-600 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterContent}
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-8 w-full py-3 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors shadow-md"
            >
              Show {total} Results
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
