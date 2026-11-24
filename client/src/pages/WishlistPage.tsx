import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-neutral-400 mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-normal text-noir-900">Your Wishlist is Empty</h1>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Save your favorite luxury coats, silk evening slip dresses, and bespoke loafers as you browse.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors shadow-sm"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="border-b border-sand-200 pb-4">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Saved Atelier Pieces
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
          Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {wishlist.map((product) => {
          const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';
          const activePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

          return (
            <div key={product.id} className="group flex flex-col bg-white border border-sand-200 overflow-hidden shadow-xs">
              <div className="relative aspect-[3/4] bg-sand-100">
                <Link to={`/product/${product.slug}`}>
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-neutral-500 hover:text-red-600 transition-colors shadow-sm"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                    {product.category?.name}
                  </p>
                  <Link
                    to={`/product/${product.slug}`}
                    className="text-xs font-semibold text-noir-900 hover:text-accent line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs font-bold text-noir-900 mt-1">
                    {formatPrice(activePrice)}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Standard', 1)}
                  className="w-full py-2 bg-noir-900 hover:bg-noir-800 text-cream-50 text-[11px] uppercase tracking-wider font-semibold transition-colors"
                >
                  Move to Bag
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
