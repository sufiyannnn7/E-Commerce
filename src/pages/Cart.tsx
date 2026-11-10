import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Lock, 
  Check, 
  Heart,
  MessageCircle,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCart, getCartSubtotal } from '../hooks/useCart';
import { storeSettingsService } from '../services/storeSettingsService';

export function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percent' | 'flat' } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Fetch store settings for shipping threshold and perks
  const { data: settings } = useQuery({
    queryKey: ['store_settings'],
    queryFn: storeSettingsService.getSettings,
    staleTime: 1000 * 60 * 5,
  });

  const subtotal = getCartSubtotal(items);
  const freeShippingThreshold = settings?.free_shipping_threshold ?? 1000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const totalMRP = items.reduce((acc, item) => {
    const selling = Number(item.selling_price || 0);
    const price = Number(item.price || 0);
    const mrp = Number(item.mrp || 0);
    const effectiveMRP = mrp > 0 ? mrp : (selling > 0 ? selling : price);
    return acc + (effectiveMRP * item.quantity);
  }, 0);
  
  const originalSavings = totalMRP > subtotal ? totalMRP - subtotal : 0;

  // Coupon Calculation
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;

  const finalGrandTotal = Math.max(0, subtotal - couponDiscount);
  const combinedTotalSavings = originalSavings + couponDiscount;
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a coupon or promo code');
      return;
    }

    setIsApplyingCoupon(true);
    setTimeout(() => {
      setIsApplyingCoupon(false);
      if (cleanCode === 'ROYAL10' || cleanCode === 'WELCOME10') {
        setAppliedCoupon({ code: cleanCode, discount: 10, type: 'percent' });
        toast.success(`Coupon ${cleanCode} applied! 10% instant discount added.`);
        setCouponCode('');
      } else if (cleanCode === 'VIP20' || cleanCode === 'FESTIVE20') {
        setAppliedCoupon({ code: cleanCode, discount: 20, type: 'percent' });
        toast.success(`VIP Coupon ${cleanCode} applied! 20% privilege discount added.`);
        setCouponCode('');
      } else if (cleanCode === 'SAVE100') {
        setAppliedCoupon({ code: cleanCode, discount: 100, type: 'flat' });
        toast.success(`Coupon ${cleanCode} applied! ₹100 instant discount deducted.`);
        setCouponCode('');
      } else {
        toast.error('Invalid coupon code. Try code "ROYAL10" or "VIP20"');
      }
    }, 400);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  // EMPTY CART STATE
  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-[75vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#faf7f2] via-[#f7f2e8] to-[#faf7f2] dark:from-[#08120d] dark:via-[#0c1a12] dark:to-[#08120d] relative overflow-hidden px-4">
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-[#a31d58]/15 via-[#1c3829]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-md mx-auto relative z-10 glass-luxury p-8 sm:p-12 rounded-3xl border border-white/80 dark:border-white/10 shadow-[0_12px_40px_rgba(163,29,88,0.08)]"
        >
          {/* Floating Bag Icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1c3829] to-[#a31d58] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_25px_rgba(163,29,88,0.3)] text-[#faf7f2] border border-white/20"
          >
            <ShoppingBag className="w-11 h-11" />
          </motion.div>

          <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6] flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> CURATED LUXURY
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-light text-foreground mb-3">
            Your Bag is Empty
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground mb-8 leading-relaxed font-sans">
            Explore our handcrafted collections of fine jewelry, authentic hijabs, and signature luxury accessories.
          </p>

          <Link 
            to="/shop"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] hover:from-[#a31d58] hover:to-[#891547] text-[#faf7f2] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-[0_8px_25px_rgba(163,29,88,0.3)] hover:shadow-[0_12px_32px_rgba(163,29,88,0.45)] shine-sheen hover:scale-[1.02] active:scale-95"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Quick jump pills */}
          <div className="mt-8 pt-6 border-t border-[#eae4d8] dark:border-white/10">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Turkish Cord Sets', 'Abayas', 'Hijabs', 'Bracelets', 'Necklaces'].map((item) => (
                <Link
                  key={item}
                  to={`/shop?search=${encodeURIComponent(item)}`}
                  className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#edf3ee] dark:bg-[#12261b] hover:bg-[#a31d58] hover:text-[#faf7f2] text-[#1c3829] dark:text-[#faf7f2] transition-colors border border-[#eae4d8] dark:border-white/10"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ACTIVE CART STATE
  return (
    <div className="pt-24 pb-20 md:pt-28 md:pb-24 min-h-screen bg-gradient-to-b from-[#faf7f2] via-[#f7f2e8] to-[#faf7f2] dark:from-[#08120d] dark:via-[#0c1a12] dark:to-[#08120d] relative overflow-hidden">
      {/* Decorative ambient backdrop glow */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[350px] bg-gradient-to-tr from-[#a31d58]/10 via-[#c2185b]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[350px] bg-gradient-to-tr from-[#1c3829]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        
        {/* Navigation Breadcrumb & Page Header */}
        <div className="mb-8 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-[#a31d58] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Shopping Bag</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-b border-[#eae4d8] dark:border-border/40 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-[1px] w-6 bg-[#a31d58]" />
                <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#a31d58]" /> YOUR CURATED SELECTION
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground tracking-tight leading-tight">
                Shopping{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] dark:from-[#faf7f2] dark:via-[#f472b6] dark:to-[#faf7f2] bg-clip-text text-transparent">
                  Bag
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-luxury border border-[#a31d58]/30 text-xs font-bold text-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}</span>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-[#a31d58] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                title="Empty shopping bag"
              >
                <Trash2 className="w-3.5 h-3.5" /> Empty Bag
              </button>
            </div>
          </div>
        </div>

        {/* Free Express Shipping Dynamic Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 sm:p-5 rounded-2xl glass-luxury border border-[#a31d58]/25 shadow-[0_6px_25px_rgba(163,29,88,0.06)] relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isFreeShipping ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-[#a31d58] text-[#faf7f2]'
              }`}>
                {isFreeShipping ? <Check className="w-4 h-4 stroke-[3]" /> : <Truck className="w-4 h-4" />}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground text-left">
                {isFreeShipping ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    🎉 Congratulations! You have unlocked FREE Express Insured Shipping!
                  </span>
                ) : (
                  <>
                    Add <span className="text-[#a31d58] font-bold">₹{amountNeededForFreeShipping.toFixed(2)}</span> more to unlock <span className="font-bold">FREE Express Insured Dispatch</span>
                  </>
                )}
              </p>
            </div>
            {!isFreeShipping && (
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left sm:text-right">
                Threshold: ₹{freeShippingThreshold}
              </span>
            )}
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full ${
                isFreeShipping
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400'
                  : 'bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#c2185b]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${freeShippingProgress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Main Content: Left Column Items, Right Column Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const selling = Number(item.selling_price || 0);
                const price = Number(item.price || 0);
                const mrp = Number(item.mrp || 0);
                const itemPrice = selling > 0 ? selling : (price > 0 ? price : mrp);
                const itemMRP = mrp > 0 ? mrp : itemPrice;
                const hasDiscount = itemMRP > itemPrice;
                const itemDiscountPercent = hasDiscount 
                  ? Math.round(((itemMRP - itemPrice) / itemMRP) * 100) 
                  : 0;

                const productImage = item.thumbnail || (item.images && item.images.length > 0 ? item.images[0].image_url : '');

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      x: -50, 
                      scale: 0.95,
                      transition: { duration: 0.25, ease: 'easeInOut' } 
                    }}
                    className="glass-luxury rounded-3xl p-4 sm:p-5 border border-white/80 dark:border-white/10 hover:border-[#a31d58]/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(163,29,88,0.12)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center text-left relative group shine-sheen"
                  >
                    {/* Product Image Thumbnail */}
                    <Link
                      to={`/product/${item.slug || item.id}`}
                      className="w-20 h-24 sm:w-28 sm:h-32 aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 relative block border border-white/60 dark:border-white/10 shadow-xs group-hover:scale-102 transition-transform"
                    >
                      {productImage ? (
                        <img 
                          src={productImage} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-serif">
                          No Image
                        </div>
                      )}

                      {/* Discount percentage badge on image */}
                      {hasDiscount && itemDiscountPercent > 0 && (
                        <span className="absolute top-2 left-2 bg-[#a31d58] text-[#faf7f2] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-md">
                          -{itemDiscountPercent}%
                        </span>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2 w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {item.category && (
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#a31d58] dark:text-[#f472b6] block mb-0.5">
                              {item.category.name}
                            </span>
                          )}
                          <Link 
                            to={`/product/${item.slug || item.id}`}
                            className="font-serif text-base sm:text-lg font-medium text-foreground hover:text-[#a31d58] transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          
                          {/* Stock & Guarantee status */}
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>In Stock • Ready for Insured Dispatch</span>
                          </p>
                        </div>

                        {/* Line Total Price Display */}
                        <div className="text-right shrink-0">
                          <span className="text-base sm:text-xl font-bold font-serif text-foreground block">
                            ₹{(itemPrice * item.quantity).toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
                                ₹{(itemMRP * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                Save ₹{((itemMRP - itemPrice) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Interactive Stepper & Remove Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                        {/* Quantity Stepper Capsule */}
                        <div className="flex items-center bg-[#edf3ee] dark:bg-[#12261b] rounded-full p-1 border border-[#eae4d8] dark:border-border/60 shadow-xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeItem(item.id);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-foreground hover:bg-[#a31d58] hover:text-[#faf7f2] transition-colors shadow-2xs active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="w-9 sm:w-11 text-center font-bold text-xs sm:text-sm text-foreground">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-foreground hover:bg-[#a31d58] hover:text-[#faf7f2] transition-colors shadow-2xs active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove Button with Hover Shake */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#a31d58] transition-colors px-3 py-1.5 rounded-full hover:bg-[#a31d58]/10 group/btn"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                          <span>Remove</span>
                        </button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Quick Guarantees Strip */}
            <div className="p-4 rounded-2xl glass-luxury border border-[#eae4d8] dark:border-white/10 flex flex-wrap items-center justify-around gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Genuine Certified
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#a31d58]" /> Express Sealed Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#1c3829]" /> Bank-Grade Encryption
              </span>
            </div>
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="glass-luxury rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden text-left">
              
              {/* Subtle Ambient Decorative Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#a31d58]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-[#eae4d8] dark:border-neutral-800">
                <h3 className="text-xl sm:text-2xl font-serif font-light text-foreground">
                  Order Summary
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1c3829] text-[#faf7f2]">
                  Secure Cart
                </span>
              </div>

              {/* Promo Code Input Accordion */}
              <div className="py-4 border-b border-[#eae4d8] dark:border-neutral-800">
                {appliedCoupon ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {appliedCoupon.code} Applied
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}% Off` : `₹${appliedCoupon.discount} Off`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 rounded-full hover:bg-emerald-500/20 text-muted-foreground hover:text-foreground transition-colors"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#a31d58]" /> Have a Promo Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. ROYAL10, VIP20"
                        className="flex-1 h-10 px-3.5 rounded-full text-xs bg-white/80 dark:bg-neutral-800/80 border border-[#eae4d8] dark:border-neutral-700 focus:outline-none focus:border-[#a31d58] transition-colors uppercase font-mono"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon}
                        className="px-5 h-10 rounded-full bg-[#1c3829] hover:bg-[#a31d58] text-[#faf7f2] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-3 text-xs sm:text-sm border-b border-[#eae4d8] dark:border-neutral-800">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total MRP</span>
                  <span className="font-mono">₹{totalMRP.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-foreground">
                  <span>Selling Price Subtotal</span>
                  <span className="font-medium font-mono">₹{subtotal.toFixed(2)}</span>
                </div>

                {originalSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Retail Catalog Savings</span>
                    <span className="font-mono">-₹{originalSavings.toFixed(2)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#a31d58] dark:text-[#f472b6] font-semibold">
                    <span>Promo Coupon Discount</span>
                    <span className="font-mono">-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-foreground">
                  <span className="text-muted-foreground">Express Insured Shipping</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded-full bg-emerald-500/10">
                    {isFreeShipping ? 'FREE' : `₹${settings?.base_shipping_charge || 100}`}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="py-5 flex items-end justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block">
                    Grand Total
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Inclusive of GST &amp; all charges
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-[#1c3829] dark:text-[#faf7f2] block">
                    ₹{finalGrandTotal.toFixed(2)}
                  </span>
                  {combinedTotalSavings > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Total Saved: ₹{combinedTotalSavings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Checkout CTA Button with Specular Shine */}
              <button 
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] hover:from-[#a31d58] hover:to-[#891547] text-[#faf7f2] py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-[0.2em] text-xs sm:text-sm shadow-[0_8px_25px_rgba(163,29,88,0.3)] hover:shadow-[0_12px_32px_rgba(163,29,88,0.5)] shine-sheen hover:scale-[1.02] active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-[#eae4d8]/80 dark:border-neutral-800/80 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>256-Bit Bank-Grade Secure Payment Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#a31d58] shrink-0" />
                  <span>Tamper-Proof Insured Transit with Live Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-[#1c3829] shrink-0" />
                  <span>WhatsApp Concierge Assistance Available</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Cart;