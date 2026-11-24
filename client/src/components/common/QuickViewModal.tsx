import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d'
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useSettings();

  const isFavorited = isInWishlist(product.id);
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const activePrice = hasSale ? product.salePrice! : product.price;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-noir-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white max-w-4xl w-full rounded-none shadow-2xl overflow-hidden border border-sand-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-noir-800 hover:text-black bg-white/80 rounded-full hover:bg-cream-100 transition-colors"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery View */}
          <div className="p-6 bg-cream-50 flex flex-col justify-between">
            <div className="aspect-[3/4] w-full overflow-hidden bg-white mb-4 shadow-sm">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-14 h-18 border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === img.url ? 'border-noir-900' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Variant Selectors */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                {product.category?.name || 'Quick Cart Atelier'}
              </p>
              <h3 className="font-serif text-2xl font-normal text-noir-900 leading-snug mb-2">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">
                  {product.rating} ({product.reviewCount || 1} verified reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-6 pb-4 border-b border-sand-200">
                <span className="text-2xl font-semibold text-noir-900">
                  {formatPrice(activePrice)}
                </span>
                {hasSale && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-xs text-neutral-500 tracking-wider">SKU: {product.sku}</span>
              </div>

              {/* Short Description */}
              <p className="text-xs text-noir-700 leading-relaxed line-clamp-3 mb-6">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-2">
                    Color: <span className="text-neutral-500 font-normal">{selectedColor}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                          selectedColor === c.name ? 'border-noir-900 scale-110 shadow-sm' : 'border-neutral-200'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.name && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-widest text-noir-800 font-semibold">
                      Size: <span className="text-neutral-500 font-normal">{selectedSize}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 px-3 py-1.5 text-xs font-medium uppercase border transition-all ${
                          selectedSize === size
                            ? 'bg-noir-900 text-cream-50 border-noir-900'
                            : 'bg-white text-noir-800 border-sand-300 hover:border-noir-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-xs uppercase tracking-widest text-noir-800 font-semibold">Quantity</span>
                <div className="flex items-center border border-sand-300 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm hover:bg-cream-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 text-sm hover:bg-cream-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-neutral-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Actions: Add to Bag + Wishlist */}
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <div className="flex space-x-3">
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 bg-noir-900 hover:bg-noir-800 disabled:bg-neutral-300 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-colors shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 border border-sand-300 transition-colors ${
                    isFavorited ? 'text-red-500 border-red-300 bg-red-50' : 'text-noir-800 hover:text-red-500 hover:bg-cream-100'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs uppercase tracking-widest text-neutral-500 hover:text-noir-900 underline underline-offset-4 transition-colors pt-1"
              >
                View Full Product Details & Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
