import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useSettings();

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const discountPercent = hasSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;
  const activePrice = hasSale ? product.salePrice! : product.price;

  return (
    <div
      className="group relative flex flex-col bg-transparent transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand-100/60">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasSale && (
            <span className="bg-noir-900 text-cream-50 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && !hasSale && (
            <span className="bg-cream-100 text-noir-900 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-sand-300">
              New
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-red-800 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              Sold Out
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="bg-amber-800 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
              Only {product.stock} Left
            </span>
          )}
        </div>

        {/* Action Buttons (Wishlist & Quick View) */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
          <button
            onClick={() => toggleWishlist(product)}
            aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorited
                ? 'bg-noir-900 text-red-500 shadow-md'
                : 'bg-white/90 text-noir-800 hover:bg-white hover:text-red-500 shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              aria-label="Quick View"
              className="p-2 rounded-full bg-white/90 text-noir-800 hover:bg-white hover:text-noir-900 shadow-sm transition-all duration-200 opacity-90 sm:opacity-0 group-hover:opacity-100"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick View Strip on Desktop Bottom Hover */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-noir-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            <button
              onClick={() => onQuickView(product)}
              className="w-full py-2.5 bg-white/95 hover:bg-white text-noir-900 text-xs font-semibold uppercase tracking-luxury shadow-lg transition-colors backdrop-blur-sm"
            >
              Quick Preview
            </button>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-4 pb-2 flex flex-col flex-grow">
        {product.category && (
          <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-medium mb-1">
            {product.category.name}
          </p>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-medium text-noir-900 hover:text-accent transition-colors line-clamp-1 mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Ratings */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 5)
                    ? 'fill-current'
                    : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-neutral-500 font-light">
            ({product.reviewCount || 1})
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto flex items-baseline space-x-2">
          <span className="text-sm font-semibold text-noir-900 tracking-tight">
            {formatPrice(activePrice)}
          </span>
          {hasSale && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Available Colors Dot Preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2.5">
            {product.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-xs"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] text-neutral-400">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
