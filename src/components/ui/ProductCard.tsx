import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye, X } from 'lucide-react';
import { Product } from '../../services/productService';
import { useCart } from '../../hooks/useCart';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewQty, setQuickViewQty] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('Item is currently out of stock');
      return;
    }
    addItem(product);
    const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : (e.clientX || window.innerWidth / 2);
    const y = rect ? rect.top + rect.height / 2 : (e.clientY || window.innerHeight / 2);
    window.dispatchEvent(new CustomEvent('cart-item-added', {
      detail: { x, y, image: displayImage }
    }));
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? `Removed from wishlist` : `Added to wishlist`);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const displayImage = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].image_url : '');
  
  const discountPercent = product.mrp && product.mrp > product.selling_price
    ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group relative"
      >
        <Link to={`/product/${product.slug || product.id}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary mb-4 border border-border/40 group-hover:border-[#a31d58]/40 group-hover:shadow-[0_12px_32px_rgba(163,29,88,0.14)] transition-all duration-500">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-sm">No Image</div>
            )}
            
            {/* Professional Luxury Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 max-w-[80%] items-start">
              {isOutOfStock ? (
                <span className="bg-[#12261b]/90 text-[#faf7f2]/80 text-[9px] font-medium tracking-widest uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10 shadow-xs">
                  Sold Out
                </span>
              ) : (
                <>
                  {discountPercent > 0 && (
                    <span className="bg-[#a31d58] text-[#faf7f2] text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs border border-[#a31d58]/40">
                      -{discountPercent}%
                    </span>
                  )}
                  {product.is_trending && (
                    <span className="bg-[#1c3829] text-[#faf7f2] text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md border border-[#1c3829]/60 shadow-xs">
                      Trending
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="bg-[#fdfbf7] text-[#1c3829] text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full backdrop-blur-md border border-[#1c3829]/25 shadow-xs">
                      Curated
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Quick View & Wishlist Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              <button 
                onClick={handleToggleWishlist}
                className="p-2 rounded-full glass-luxury border border-white/80 dark:border-white/10 text-foreground hover:text-[#a31d58] hover:border-[#a31d58]/40 transition-all shadow-sm hover:scale-110 active:scale-95"
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#a31d58] text-[#a31d58]' : 'text-foreground'}`} />
              </button>

              <button 
                onClick={handleQuickViewClick}
                className="p-2 rounded-full glass-luxury border border-white/80 dark:border-white/10 text-foreground hover:text-[#a31d58] hover:border-[#a31d58]/40 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110 active:scale-95"
                title="Quick View"
              >
                <Eye className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Quick Add to Cart overlay (Desktop hover) */}
            {!isOutOfStock && (
              <div className="hidden md:flex absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 justify-center translate-y-3 group-hover:translate-y-0 z-10">
                <button 
                  onClick={handleAddToCart}
                  className="bg-[#1c3829] hover:bg-[#a31d58] text-[#faf7f2] transition-all text-xs font-semibold py-3 px-5 rounded-full w-full flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_8px_25px_rgba(163,29,88,0.35)] shine-sheen active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center text-center px-2">
            {product.category && (
               <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">{product.category.name}</span>
            )}
            <h3 className="font-semibold text-sm mb-1.5 group-hover:text-[#a31d58] transition-colors line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">₹{product.selling_price.toFixed(2)}</span>
              {product.mrp && product.mrp > product.selling_price && (
                <span className="text-muted-foreground line-through text-xs">₹{product.mrp.toFixed(2)}</span>
              )}
            </div>

            {/* Dedicated Mobile Add to Cart Option Button */}
            {!isOutOfStock && (
              <button 
                onClick={handleAddToCart}
                className="md:hidden mt-2.5 w-full bg-[#1c3829] hover:bg-[#a31d58] text-[#faf7f2] text-[11px] font-bold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Quick View Dialog Modal */}
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="aspect-[4/5] bg-secondary rounded-xl overflow-hidden border">
              <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              {product.category && (
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{product.category.name}</span>
              )}
              <h2 className="text-2xl font-serif font-bold">{product.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">₹{product.selling_price.toFixed(2)}</span>
                {product.mrp && product.mrp > product.selling_price && (
                  <span className="text-muted-foreground line-through text-sm">₹{product.mrp.toFixed(2)}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{product.description}</p>
              
              <div className="pt-2 flex gap-3">
                <button
                  onClick={(e) => {
                    addItem(product, quickViewQty);
                    const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
                    const x = rect ? rect.left + rect.width / 2 : (e.clientX || window.innerWidth / 2);
                    const y = rect ? rect.top + rect.height / 2 : (e.clientY || window.innerHeight / 2);
                    window.dispatchEvent(new CustomEvent('cart-item-added', {
                      detail: { x, y, image: displayImage }
                    }));
                    toast.success(`${quickViewQty > 1 ? `${quickViewQty}x ` : ''}${product.name} added to cart`);
                    setIsQuickViewOpen(false);
                  }}
                  disabled={isOutOfStock}
                  className="flex-1 bg-foreground text-background py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <Link
                  to={`/product/${product.slug || product.id}`}
                  onClick={() => setIsQuickViewOpen(false)}
                  className="px-4 py-3 rounded-full border border-border text-xs font-bold uppercase tracking-wider hover:bg-secondary flex items-center justify-center"
                >
                  Full Details
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
