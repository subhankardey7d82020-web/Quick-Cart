import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
} from 'lucide-react';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'materials' | 'shipping' | 'reviews'>('desc');

  // Review submission state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useSettings();
  const { success, error, info } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.getProductBySlug(slug);
        if (res && res.product) {
          setProduct(res.product);
          setRelatedProducts(res.relatedProducts || []);
          setReviews(res.product.reviews || []);
          setActiveImage(res.product.images?.[0]?.url || '');
          setSelectedSize(res.product.sizes?.[0] || '');
          setSelectedColor(res.product.colors?.[0]?.name || '');
          setQuantity(1);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-noir-900 border-t-transparent rounded-full mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
          Loading bespoke atelier details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-noir-900">Product Not Found</h2>
        <p className="text-xs text-neutral-500">The requested article could not be retrieved from the catalog.</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const activePrice = hasSale ? product.salePrice! : product.price;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      error('Please select an available size.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      error('Please select a color option.');
      return;
    }
    addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      error('Please select an available size.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      error('Please select a color option.');
      return;
    }
    addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      error('Please provide your review feedback.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.addReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
        authorName: reviewName || undefined,
      });

      if (res && res.review) {
        setReviews([res.review, ...reviews]);
        setReviewComment('');
        setReviewName('');
        success('Thank you! Your client review has been published.');
      }
    } catch (err: any) {
      error(err.message || 'Could not post review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    info('Product link copied to clipboard.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs uppercase tracking-widest text-neutral-400 flex items-center space-x-2">
        <Link to="/" className="hover:text-noir-900 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-noir-900 transition-colors">Shop</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-noir-900 transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-noir-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Layout: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery (Thumbs + Big Photo with Zoom) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails Column */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[640px] flex-shrink-0">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-22 sm:w-20 sm:h-26 border-2 overflow-hidden flex-shrink-0 bg-sand-100 transition-all ${
                    activeImage === img.url ? 'border-noir-900' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}

          {/* Main Zoom Frame */}
          <div
            className="relative flex-1 aspect-[3/4] bg-sand-100/70 overflow-hidden cursor-crosshair group shadow-xs"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={activeImage}
              alt={product.name}
              className={`w-full h-full object-cover object-center transition-transform duration-200 ${
                isZoomed ? 'scale-150 origin-center' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              {hasSale && (
                <span className="bg-noir-900 text-cream-50 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
                  Sale
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="bg-amber-800 text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1">
                  Low Stock ({product.stock})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                {product.category?.name || 'Quick Cart Atelier'}
              </p>
              <button
                onClick={handleShare}
                className="text-neutral-400 hover:text-noir-900 p-1"
                title="Share product link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-600 font-medium">
                {product.rating} ({reviews.length} reviews)
              </span>
              <span className="text-neutral-300">|</span>
              <span className="text-xs text-neutral-500 font-mono tracking-wider">SKU: {product.sku}</span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline space-x-3 mb-6 pb-6 border-b border-sand-200">
              <span className="text-3xl font-semibold text-noir-900">
                {formatPrice(activePrice)}
              </span>
              {hasSale && (
                <span className="text-base text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              {hasSale && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  Save {formatPrice(product.price - product.salePrice!)}
                </span>
              )}
            </div>

            {/* Short Narrative */}
            <p className="text-xs sm:text-sm text-noir-700 leading-relaxed font-light mb-8">
              {product.description}
            </p>

            {/* Color Variant Picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-noir-900 font-semibold mb-2.5">
                  Color: <span className="font-normal text-neutral-600">{selectedColor}</span>
                </label>
                <div className="flex items-center space-x-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedColor === c.name
                          ? 'border-noir-900 scale-110 shadow-md ring-2 ring-accent/30'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Variant Picker */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs uppercase tracking-widest text-noir-900 font-semibold">
                    Size: <span className="font-normal text-neutral-600">{selectedSize || 'Please select'}</span>
                  </label>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className="text-[11px] uppercase tracking-wider text-accent underline hover:text-accent-hover"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 px-4 py-2 text-xs font-semibold uppercase border transition-all ${
                        selectedSize === size
                          ? 'bg-noir-900 text-cream-50 border-noir-900 shadow-sm'
                          : 'bg-white text-noir-800 border-sand-300 hover:border-noir-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Status */}
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-xs uppercase tracking-widest text-noir-900 font-semibold">Quantity</span>
              <div className="flex items-center border border-sand-300 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm hover:bg-cream-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-semibold min-w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-1.5 text-sm hover:bg-cream-100 transition-colors"
                >
                  +
                </button>
              </div>

              <div className="text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    <span>In Stock ({product.stock} available)</span>
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    <span>Currently Out of Stock</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <div className="flex space-x-3">
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 bg-noir-900 hover:bg-noir-800 disabled:bg-neutral-300 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-all shadow-md group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{product.stock > 0 ? 'Add to Shopping Bag' : 'Sold Out'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 border transition-colors ${
                    isFavorited
                      ? 'text-red-500 border-red-300 bg-red-50'
                      : 'text-noir-800 border-sand-300 hover:text-red-500 hover:bg-cream-100'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.stock > 0 && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-accent hover:bg-accent-hover text-noir-900 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              )}
            </div>

            {/* Value Guarantees Banner */}
            <div className="mt-8 pt-6 border-t border-sand-200 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-1">
                <Truck className="w-4 h-4 text-accent" />
                <span className="text-[10px] uppercase font-semibold text-noir-800">Free Express</span>
                <span className="text-[9px] text-neutral-400">Above ₹1,499</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-[10px] uppercase font-semibold text-noir-800">Doorstep COD</span>
                <span className="text-[9px] text-neutral-400">Zero surcharge</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <RotateCcw className="w-4 h-4 text-accent" />
                <span className="text-[10px] uppercase font-semibold text-noir-800">14-Day Returns</span>
                <span className="text-[9px] text-neutral-400">Doorstep pickup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Care & Materials, Shipping & Returns, Reviews */}
      <div className="pt-12 border-t border-sand-200">
        <div className="flex border-b border-sand-200 space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-4 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'desc' ? 'border-noir-900 text-noir-900' : 'border-transparent text-neutral-400 hover:text-noir-800'
            }`}
          >
            Description & Cut
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-4 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'materials' ? 'border-noir-900 text-noir-900' : 'border-transparent text-neutral-400 hover:text-noir-800'
            }`}
          >
            Materials & Sustainability
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'shipping' ? 'border-noir-900 text-noir-900' : 'border-transparent text-neutral-400 hover:text-noir-800'
            }`}
          >
            Delivery & COD Returns
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reviews' ? 'border-noir-900 text-noir-900' : 'border-transparent text-neutral-400 hover:text-noir-800'
            }`}
          >
            Client Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'desc' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-noir-700 leading-relaxed font-light">
              <p>{product.description}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Bespoke European craftsmanship with clean architectural stitching.</li>
                <li>Tailored for a relaxed, contemporary silhouette that transitions effortlessly from day into evening.</li>
                <li>Finished with bespoke natural horn buttons and breathable cupro lining.</li>
                <li>Pre-washed to preserve tactile softness and prevent distortion over time.</li>
              </ul>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-noir-700 leading-relaxed font-light">
              <h4 className="font-semibold uppercase tracking-wider text-noir-900">Sustainable Origin</h4>
              <p>
                Our raw fibers are sourced exclusively from certified organic farmers and low-impact mills in Northern Italy and Normandy. We prohibit harsh chemical dyes, utilizing water-saving pigment baths that preserve fabric integrity.
              </p>
              <h4 className="font-semibold uppercase tracking-wider text-noir-900 pt-2">Garment Care</h4>
              <p>
                Dry clean gently with hydrocarbon solvent or hand wash in cold water with pH-neutral detergent. Dry flat in shade. Do not tumble dry. Warm steam iron on reverse.
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-noir-700 leading-relaxed font-light">
              <h4 className="font-semibold uppercase tracking-wider text-noir-900">Complimentary Shipping</h4>
              <p>
                Orders above ₹1,499 qualify for complimentary express delivery across India (typically 2-4 business days). Standard shipping of ₹99 applies on smaller orders.
              </p>
              <h4 className="font-semibold uppercase tracking-wider text-noir-900 pt-2">Cash on Delivery (COD)</h4>
              <p>
                We offer verified Cash on Delivery across 19,000+ PIN codes with zero surcharge. You may examine the outer parcel packaging before disbursing payment.
              </p>
              <h4 className="font-semibold uppercase tracking-wider text-noir-900 pt-2">Effortless Returns</h4>
              <p>
                If the fit does not exceed your expectations, initiate a complimentary doorstep pickup within 14 days of delivery through our concierge or account portal.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-10 max-w-3xl">
              {/* Submission Form */}
              <div className="p-6 bg-cream-50 border border-sand-200">
                <h4 className="font-serif text-lg font-normal text-noir-900 mb-4">
                  Leave a Client Review
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-noir-900 font-semibold mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya M."
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-noir-900 font-semibold mb-1">
                        Rating
                      </label>
                      <div className="flex items-center space-x-1 py-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating ? 'fill-current' : 'text-neutral-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-noir-900 font-semibold mb-1">
                      Your Comments
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share your thoughts on the craftsmanship, fit, fabric weight, and styling..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-2.5 bg-white border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 disabled:opacity-50 transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-6 divide-y divide-sand-200">
                {reviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">Be the first to review this atelier piece.</p>
                ) : (
                  reviews.map((r, i) => (
                    <div key={r.id || i} className="pt-6 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-noir-900">
                            {r.user?.name || r.authorName || 'Verified Buyer'}
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            Verified Purchase
                          </span>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < r.rating ? 'fill-current' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-noir-700 leading-relaxed font-light">{r.comment}</p>
                      <span className="text-[10px] text-neutral-400 block">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent review'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-sand-200">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
              Complementary Pieces
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-noir-900 font-normal">
              You May Also Admire
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
