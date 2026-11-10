import React, { useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Star, Truck, ShieldCheck, RefreshCw, MessageSquare, Sparkles, Check, Mail, Flame, Clock, Award, ChevronDown } from 'lucide-react';
import { cmsService } from '@/services/cmsService';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { storeSettingsService } from '@/services/storeSettingsService';
import { ProductCard } from '@/components/ui/ProductCard';
import { CircularTestimonials, Testimonial } from '@/components/ui/circular-testimonials';
import { RunningTestimonials } from '@/components/home/RunningTestimonials';
import { InstagramSection } from '@/components/home/InstagramSection';
import { CraftsmanshipSection } from '@/components/home/CraftsmanshipSection';
import { toast } from 'sonner';

export function Home() {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['public_homepage_sections'],
    queryFn: async () => {
      try {
        return await cmsService.getHomepageSections();
      } catch (e) {
        console.warn('Error fetching homepage sections:', e);
        return [];
      }
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['store_settings'],
    queryFn: storeSettingsService.getSettings
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest font-semibold">Loading Store...</p>
        </div>
      </div>
    );
  }

  // Ensure sections always put Hero 1st and Categories 2nd (top of 1st page)
  const orderedSections = [...sections];
  
  const heroSec = orderedSections.find(s => s.section_type === 'hero') || { id: 'hero-default', section_type: 'hero', display_order: 0, is_enabled: true, settings: {} };
  const categoriesSec = orderedSections.find(s => s.section_type === 'categories') || { id: 'cat-default', section_type: 'categories', display_order: 1, is_enabled: true, settings: { title: 'Shop by Category', subtitle: 'COLLECTIONS' } };
  
  const remainingSections = orderedSections.filter(s => s.section_type !== 'hero' && s.section_type !== 'categories');
  if (remainingSections.length === 0) {
    remainingSections.push(
      { id: '3', section_type: 'featured_products', display_order: 2, is_enabled: true, settings: { title: 'Featured Creations', subtitle: 'CURATED LUXURY' } },
      { id: '4', section_type: 'trending_products', display_order: 3, is_enabled: true, settings: { title: 'Trending Right Now', subtitle: 'HANDPICKED FAVORITES' } },
      { id: '5', section_type: 'testimonials', display_order: 4, is_enabled: true, settings: {} }
    );
  }

  const finalSections = [heroSec, categoriesSec, ...remainingSections];

  // Derive Instagram handle from settings or default
  const rawInsta = settings?.instagram_url || '';
  const instaHandle = rawInsta 
    ? '@' + rawInsta.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/^@/, '').replace(/\/$/, '')
    : '@royal_web_creations';
  const instaUrl = rawInsta && rawInsta.startsWith('http') ? rawInsta : `https://instagram.com/${instaHandle.replace(/^@/, '')}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {finalSections.map((section: any) => {
        if (!section.is_enabled) return null;

        switch (section.section_type) {
          case 'hero':
            return <HeroSection key={section.id} section={section} settings={settings} />;
          case 'categories':
            return (
              <React.Fragment key={section.id}>
                <CategoriesSection section={section} settings={settings} />
                {settings?.show_top_picks_section !== false && (
                  <TopPicksShowcaseSection settings={settings} />
                )}
              </React.Fragment>
            );
          case 'featured_products':
            if (settings?.show_top_picks_section !== false) return null;
            return <ProductsGridSection key={section.id} section={section} filter="featured" />;
          case 'trending_products':
            if (settings?.show_top_picks_section !== false) return null;
            return <ProductsGridSection key={section.id} section={section} filter="trending" />;
          case 'flash_sale':
            return <FlashSaleSection key={section.id} section={section} />;
          case 'testimonials':
            // Rendered explicitly below right before Instagram
            return null;
          case 'newsletter':
            // Suppress duplicate 1st newsletter; the dedicated VIP Club is rendered once near the bottom
            return null;
          default:
            return null;
        }
      })}

      {/* Testimonials Showcase Section: 3D Perspective Circular Testimonials + Running Flowing Testimonials Marquee (Explicitly BEFORE the Insta) */}
      {settings?.show_testimonials_section !== false && (
        <TestimonialsSection section={{}} />
      )}

      {/* Instagram Post Showcase Section (Customizable by Admin) */}
      <InstagramSection
        handle={instaHandle}
        instagramUrl={instaUrl}
        avatarUrl={settings?.instagram_avatar_url || settings?.logo_url}
      />

      {/* EXCELLENCE & HERITAGE / The Art of Fine Craftsmanship (Merged Single Luxury Section) */}
      {settings?.show_craftsmanship_section !== false && (
        <CraftsmanshipSection settings={settings} />
      )}
    </div>
  );
}

function HeroSection({ section, settings }: { section: any; settings: any }) {
  const title = settings?.hero_title || section.settings?.title || 'Elevate Your Everyday';
  const subtitle = settings?.hero_subtitle || section.settings?.subtitle || 'LUXURY FINE JEWELRY & ACCESSORIES';
  const buttonText = settings?.hero_button_text || section.settings?.button_text || 'Explore Collection';
  const buttonLink = settings?.hero_button_link || section.settings?.button_link || '#categories';
  const imageUrl = settings?.hero_image_url || section.settings?.bg_image || section.settings?.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920';

  const handleScrollToCategories = (e: React.MouseEvent) => {
    if (buttonLink.startsWith('#')) {
      e.preventDefault();
      const targetId = buttonLink.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-44px)] h-[calc(100vh-44px)] flex items-center justify-center overflow-hidden border-b border-border/40 select-none">
      {/* 1. Full-Screen Landing Background Photo (Admin Customizable) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover object-center scale-102 transition-transform duration-1000 ease-out" 
        />
        {/* Luxury Vignette & Dark Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/45 dark:from-background dark:via-black/55 dark:to-black/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/15 to-black/60 pointer-events-none" />
      </div>

      {/* 2. Hero Center Content */}
      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-5"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-[10px] sm:text-xs font-bold tracking-[0.28em] uppercase text-[#fce8f0] shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#f472b6]" />
            <span>{subtitle}</span>
          </div>

          {/* Majestic Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-white tracking-tight leading-[1.1] drop-shadow-md">
            {title.includes(' ') ? (
              <>
                {title.substring(0, title.lastIndexOf(' '))}{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
                  {title.substring(title.lastIndexOf(' ') + 1)}
                </span>
              </>
            ) : (
              title
            )}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-200/90 max-w-xl mx-auto font-sans font-light leading-relaxed drop-shadow-xs">
            Handcrafted with uncompromising perfection, authentic hallmarked purity, and bespoke styling privileges.
          </p>
          
          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href={buttonLink}
              onClick={handleScrollToCategories}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] hover:from-[#a31d58] hover:to-[#891547] text-[#faf7f2] px-8 sm:px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_10px_30px_rgba(163,29,88,0.4)] hover:shadow-[0_14px_40px_rgba(163,29,88,0.6)] shine-sheen hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 px-7 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <span>View All Catalog</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 3. Bouncing Scroll Down Indicator to 2nd Screen */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10">
        <a
          href="#categories"
          onClick={handleScrollToCategories}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.28em] text-neutral-300 group-hover:text-white transition-colors drop-shadow-xs">
            Scroll to Discover
          </span>
          <ChevronDown className="w-5 h-5 animate-bounce text-neutral-300 group-hover:text-white transition-colors" />
        </a>
      </div>
    </section>
  );
}

function CategoriesSection({ section, settings }: { section: any; settings: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: categories = [] } = useQuery({
    queryKey: ['public_categories'],
    queryFn: categoryService.getCategories
  });

  const selectedCategoryIds: string[] = section.settings?.selected_categories || [];
  
  let activeCategories = categories.filter(c => c.is_active);
  if (selectedCategoryIds.length > 0) {
    activeCategories = activeCategories.filter(c => selectedCategoryIds.includes(c.id));
  }

  // Fallbacks matching user's inspiration screenshot and store's style
  const defaultFallbackCategories = [
    { id: 'cat-inspo-1', name: 'Turkish Cord Sets', slug: 'turkish-cord-sets', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-2', name: 'Party Wear Hijab Caps', slug: 'party-wear-hijab-caps', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-3', name: 'Premium Jersey Hijab', slug: 'premium-jersey-hijab', image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-4', name: 'New Arrivals', slug: 'new-arrivals', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-5', name: 'Abayas', slug: 'abayas', image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-6', name: 'Clothing', slug: 'clothing', image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-7', name: 'Hijabs & Accessories', slug: 'hijabs-accessories', image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-8', name: 'Skincare & Personal Care', slug: 'skincare-personal-care', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-9', name: 'Fine Jewelry & Rings', slug: 'rings', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-10', name: 'Handcrafted Necklaces', slug: 'necklaces', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-11', name: 'Royal Bracelets', slug: 'bracelets', image_url: 'https://images.unsplash.com/photo-1611591475165-da255c4d0089?auto=format&fit=crop&q=80&w=800' },
    { id: 'cat-inspo-12', name: 'Keychains & Charms', slug: 'keychains', image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800' }
  ];

  let combinedCategories = [...activeCategories];
  defaultFallbackCategories.forEach(def => {
    if (!combinedCategories.some(c => c.slug === def.slug || c.name.toLowerCase() === def.name.toLowerCase())) {
      combinedCategories.push(def as any);
    }
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const title = settings?.category_section_title || section.settings?.title || 'Shop by Category';
  const subtitle = settings?.category_section_subtitle || section.settings?.subtitle || 'CURATED COLLECTIONS';

  return (
    <section id="categories" className="py-20 sm:py-24 bg-[#faf7f2] dark:bg-[#0c1a12] border-b border-[#eae4d8] dark:border-border/40 relative z-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header with Title and Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 pb-4 border-b border-[#eae4d8] dark:border-border/50 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-[1px] w-6 bg-[#a31d58]" />
              <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6]">
                {subtitle}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-foreground tracking-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/shop" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-[#a31d58] transition-colors mr-2">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            {/* Carousel navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full bg-[#fdfbf7] dark:bg-[#12261b] border border-[#eae4d8] dark:border-border flex items-center justify-center text-[#1c3829] dark:text-[#faf7f2] hover:bg-[#1c3829] hover:text-[#faf7f2] dark:hover:bg-[#a31d58] transition-all shadow-xs active:scale-95"
                aria-label="Previous categories"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full bg-[#fdfbf7] dark:bg-[#12261b] border border-[#eae4d8] dark:border-border flex items-center justify-center text-[#1c3829] dark:text-[#faf7f2] hover:bg-[#1c3829] hover:text-[#faf7f2] dark:hover:bg-[#a31d58] transition-all shadow-xs active:scale-95"
                aria-label="Next categories"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Large Prominent Category Circles with Bottle Olive Green & Magenta Rim */}
        <div 
          ref={scrollRef}
          className="flex items-start justify-start gap-6 sm:gap-8 md:gap-9 overflow-x-auto pb-8 pt-3 hide-scrollbar snap-x scroll-smooth"
        >
          {combinedCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.02 }}
              className="flex-shrink-0 text-center snap-center flex flex-col items-center"
            >
              <Link 
                to={`/shop?category=${category.slug || category.name.toLowerCase()}`} 
                className="group flex flex-col items-center gap-3"
              >
                {/* Prominent Circle Rim */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 p-1 sm:p-1.5 rounded-full ring-[3px] ring-[#1c3829] dark:ring-[#2d5339] bg-white dark:bg-[#12261b] shadow-[0_10px_28px_rgba(28,56,41,0.18)] hover:shadow-[0_16px_36px_rgba(163,29,88,0.28)] hover:ring-[#a31d58] group-hover:scale-105 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-100 dark:bg-neutral-800">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-3xl font-serif text-muted-foreground">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Label */}
                <span className="text-xs sm:text-sm font-bold font-sans tracking-tight text-[#1c3829] dark:text-[#faf7f2] group-hover:text-[#a31d58] dark:group-hover:text-[#f472b6] transition-colors max-w-[130px] sm:max-w-[160px] md:max-w-[180px] leading-snug line-clamp-2">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

{/* Shop Our Top Picks & Trending Tabbed Showcase (Directly Below Categories) */}
function TopPicksShowcaseSection({ settings }: { settings: any }) {
  const [activeTab, setActiveTab] = useState<'top_picks' | 'trending' | 'new_arrivals' | 'best_sellers' | 'all'>('top_picks');

  const { data: products = [] } = useQuery({
    queryKey: ['public_products_all_showcase'],
    queryFn: () => productService.getProducts({ status: 'active' })
  });

  const tab1Label = settings?.top_picks_tab1_label || 'Top Picks';
  const tab2Label = settings?.top_picks_tab2_label || 'Trending';
  const tab3Label = settings?.top_picks_tab3_label || 'New Arrivals';
  const tab4Label = settings?.top_picks_tab4_label || 'Best Sellers';

  const title = settings?.top_picks_title || 'Shop Our Top Picks';
  const subtitle = settings?.top_picks_subtitle || 'HANDPICKED FAVORITES';

  // Filter products based on active tab
  const displayProducts = useMemo(() => {
    let list = [...products];
    if (activeTab === 'top_picks') {
      const featured = list.filter(p => p.is_featured);
      return (featured.length > 0 ? featured : list).slice(0, 8);
    }
    if (activeTab === 'trending') {
      const trending = list.filter(p => p.is_trending);
      return (trending.length > 0 ? trending : list).slice(0, 8);
    }
    if (activeTab === 'new_arrivals') {
      const newItems = list.filter(p => p.is_new_arrival);
      return (newItems.length > 0 ? newItems : list).slice(0, 8);
    }
    if (activeTab === 'best_sellers') {
      const best = list.filter(p => p.is_best_seller);
      return (best.length > 0 ? best : list).slice(0, 8);
    }
    return list.slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="py-16 sm:py-20 bg-background border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Centered Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#a31d58]/50" />
            <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6]">
              {subtitle}
            </span>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#a31d58]/50" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground tracking-tight leading-[1.2]">
            {title}
          </h2>
        </div>

        {/* Tab Switcher Pills with Glass & Magenta Aesthetic */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-1 mb-10 hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('top_picks')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shadow-2xs ${
              activeTab === 'top_picks'
                ? 'bg-gradient-to-r from-[#a31d58] to-[#c2185b] text-[#faf7f2] shadow-[0_6px_22px_rgba(163,29,88,0.35)] scale-105 shine-sheen border border-[#a31d58]'
                : 'glass-luxury border border-[#eae4d8] dark:border-white/10 text-[#1c3829] dark:text-[#faf7f2] hover:border-[#a31d58]/60 hover:text-[#a31d58] hover:shadow-[0_4px_16px_rgba(163,29,88,0.12)]'
            }`}
          >
            {tab1Label}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shadow-2xs ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-[#a31d58] to-[#c2185b] text-[#faf7f2] shadow-[0_6px_22px_rgba(163,29,88,0.35)] scale-105 shine-sheen border border-[#a31d58]'
                : 'glass-luxury border border-[#eae4d8] dark:border-white/10 text-[#1c3829] dark:text-[#faf7f2] hover:border-[#a31d58]/60 hover:text-[#a31d58] hover:shadow-[0_4px_16px_rgba(163,29,88,0.12)]'
            }`}
          >
            {tab2Label}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new_arrivals')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shadow-2xs ${
              activeTab === 'new_arrivals'
                ? 'bg-gradient-to-r from-[#a31d58] to-[#c2185b] text-[#faf7f2] shadow-[0_6px_22px_rgba(163,29,88,0.35)] scale-105 shine-sheen border border-[#a31d58]'
                : 'glass-luxury border border-[#eae4d8] dark:border-white/10 text-[#1c3829] dark:text-[#faf7f2] hover:border-[#a31d58]/60 hover:text-[#a31d58] hover:shadow-[0_4px_16px_rgba(163,29,88,0.12)]'
            }`}
          >
            {tab3Label}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('best_sellers')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shadow-2xs ${
              activeTab === 'best_sellers'
                ? 'bg-gradient-to-r from-[#a31d58] to-[#c2185b] text-[#faf7f2] shadow-[0_6px_22px_rgba(163,29,88,0.35)] scale-105 shine-sheen border border-[#a31d58]'
                : 'glass-luxury border border-[#eae4d8] dark:border-white/10 text-[#1c3829] dark:text-[#faf7f2] hover:border-[#a31d58]/60 hover:text-[#a31d58] hover:shadow-[0_4px_16px_rgba(163,29,88,0.12)]'
            }`}
          >
            {tab4Label}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shadow-2xs ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#a31d58] to-[#c2185b] text-[#faf7f2] shadow-[0_6px_22px_rgba(163,29,88,0.35)] scale-105 shine-sheen border border-[#a31d58]'
                : 'glass-luxury border border-[#eae4d8] dark:border-white/10 text-[#1c3829] dark:text-[#faf7f2] hover:border-[#a31d58]/60 hover:text-[#a31d58] hover:shadow-[0_4px_16px_rgba(163,29,88,0.12)]'
            }`}
          >
            All Pieces
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 gap-y-10">
          <AnimatePresence mode="popLayout">
            {displayProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <ProductCard product={p} index={idx} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Explore Collection Link */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-border bg-background hover:bg-foreground hover:text-background text-foreground transition-all duration-300 text-xs font-bold uppercase tracking-[0.2em] shadow-xs hover:shadow-lg"
          >
            <span>Explore Full Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>

      </div>
    </section>
  );
}

function ProductsGridSection({ section, filter }: { section: any; filter: 'featured' | 'trending' }) {
  const { data: products = [] } = useQuery({
    queryKey: ['public_products_grid', filter],
    queryFn: () => productService.getProducts({
      status: 'active',
      isFeatured: filter === 'featured' ? true : undefined
    })
  });

  const displayProducts = filter === 'trending'
    ? products.filter(p => p.is_trending).slice(0, 6)
    : products.slice(0, 6);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-14 bg-background border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        {/* Centered Luxury Editorial Heading as requested */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#a31d58]/50" />
            <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6]">
              {section.settings?.subtitle || (filter === 'featured' ? 'CURATED LUXURY' : 'HANDPICKED FAVORITES')}
            </span>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#a31d58]/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground tracking-tight leading-[1.2]">
            {filter === 'featured' ? (
              <>Featured <span className="font-serif italic font-normal text-[#a31d58]">Creations</span></>
            ) : (
              <>Trending <span className="font-serif italic font-normal text-[#a31d58]">Right Now</span></>
            )}
          </h2>
          <div className="pt-1 flex items-center justify-center">
            <Link to="/shop" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-[#a31d58] transition-colors">
              <span>Explore All Pieces</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {displayProducts.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlashSaleSection({ section }: { section: any }) {
  return (
    <section className="py-14 bg-[#1c3829] text-[#faf7f2]">
      <div className="container mx-auto px-4 md:px-6 text-center space-y-4 max-w-xl">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#a31d58] bg-[#faf7f2]/10 px-3 py-1 rounded-full border border-[#faf7f2]/15">LIMITED TIME OFFER</span>
        <h2 className="text-3xl md:text-4xl font-bold font-serif">{section.settings?.title || 'Exclusive Flash Event'}</h2>
        <p className="text-xs text-[#faf7f2]/80 leading-relaxed">
          {section.settings?.subtitle || 'Enjoy special pricing on handcrafted fine pieces for a limited time.'}
        </p>
        <div className="pt-2">
          <Link to="/shop" className="inline-flex items-center gap-2 bg-[#faf7f2] hover:bg-[#a31d58] hover:text-[#faf7f2] text-[#1c3829] px-7 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-md">
            Shop Flash Event <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ section }: { section: any }) {
  const luxuryTestimonials: Testimonial[] = [
    {
      name: "Tamar Mendelson",
      designation: "Fine Jewelry Collector, Mumbai",
      quote: "The quality and hallmarking of every item is simply exquisite. Ordering through WhatsApp was effortless and personalized!",
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Joe Charlescraft",
      designation: "VIP Client, Delhi",
      quote: "Exceeded all expectations! The attention to detail, secure express courier, and concierge styling made it an unforgettable purchase.",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Martina Edelweist",
      designation: "Satisfied Customer, Bengaluru",
      quote: "A true gem of a store. The craftsmanship is pristine and each design feels custom-tailored to perfection. Highly recommended!",
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#faf7f2] via-[#f7f2e8] to-[#faf7f2] dark:from-[#08120d] dark:via-[#0c1a12] dark:to-[#08120d] border-b border-[#eae4d8] dark:border-border/40 overflow-hidden relative">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-gradient-to-r from-[#a31d58]/10 via-[#1c3829]/10 to-[#a31d58]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-[1px] w-8 bg-[#a31d58]/50" />
          <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6]">
            CLIENT PRAISE
          </span>
          <span className="h-[1px] w-8 bg-[#a31d58]/50" />
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-foreground tracking-tight mb-3">
          What Connoisseurs{' '}
          <span className="font-serif italic font-normal bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] dark:from-[#faf7f2] dark:via-[#f472b6] dark:to-[#faf7f2] bg-clip-text text-transparent drop-shadow-xs">
            Say
          </span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-12 font-sans font-light">
          Discover why discerning clients across India trust our direct WhatsApp ordering experience.
        </p>

        {/* 1. Interactive 3D Perspective Circular Testimonials */}
        <div className="max-w-5xl mx-auto mb-12">
          <CircularTestimonials
            testimonials={luxuryTestimonials}
            autoplay={true}
            colors={{
              name: "currentColor",
              designation: "#888888",
              testimony: "currentColor",
              arrowBackground: "#1c3829",
              arrowForeground: "#faf7f2",
              arrowHoverBackground: "#a31d58",
            }}
            fontSizes={{
              name: "1.75rem",
              designation: "0.85rem",
              quote: "1.1rem",
            }}
          />
        </div>

        {/* 2. Running Testimonials Marquee Ribbon */}
        <div className="mt-8 -mx-4 md:-mx-6">
          <RunningTestimonials />
        </div>
      </div>
    </section>
  );
}

function NewsletterSection({ section }: { section: any }) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubscribed(true);
    toast.success('Welcome to the VIP Club! Check your inbox for exclusive access.');
  };

  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto rounded-3xl bg-neutral-950/95 text-white p-8 md:p-14 text-center relative overflow-hidden shadow-2xl border border-white/15 backdrop-blur-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#a31d58]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#1c3829]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#a31d58]/20 border border-[#a31d58]/40 text-[10px] font-bold uppercase tracking-widest text-[#f472b6] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#f472b6]" /> PRIVATE CIRCLE
            </span>

            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Join Our VIP Club
            </h3>

            <p className="text-xs md:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Subscribe to receive private sale access, preview unreleased collections, and enjoy bespoke concierge styling privileges.
            </p>

            {isSubscribed ? (
              <div className="pt-4 flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                <Check className="w-5 h-5" /> You're on the exclusive VIP guest list.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-2 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-full bg-white/10 border border-white/20 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#a31d58] backdrop-blur-md" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="h-11 px-7 rounded-full bg-gradient-to-r from-[#a31d58] via-[#c2185b] to-[#a31d58] text-[#faf7f2] font-bold text-xs uppercase tracking-wider hover:from-[#891547] hover:to-[#891547] transition-all shadow-[0_8px_25px_rgba(163,29,88,0.4)] hover:shadow-[0_12px_30px_rgba(163,29,88,0.6)] shine-sheen shrink-0 active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            )}

            <p className="text-[10px] text-neutral-400 pt-2">
              We respect your privacy. No spam, only timeless elegance. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
