import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  ChevronDown, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Check, 
  Search, 
  Sparkles, 
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/ui/ProductCard';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'newest';

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ['public_categories'],
    queryFn: categoryService.getCategories
  });

  if (categoriesError) console.error("Error loading categories:", categoriesError);

  const { data: products = [], isLoading, error: productsError } = useQuery({
    queryKey: ['public_products', categoryParam],
    queryFn: () => productService.getProducts({ 
      status: 'active',
      categorySlug: categoryParam
    })
  });

  if (productsError) console.error("Error loading products:", productsError);

  const activeCategories = useMemo(() => {
    return categories.filter(c => c.is_active);
  }, [categories]);

  const selectedCategory = useMemo(() => {
    if (!categoryParam) return null;
    return activeCategories.find(c => c.slug === categoryParam || c.name.toLowerCase() === categoryParam.toLowerCase());
  }, [activeCategories, categoryParam]);

  const handleCategorySelect = (slug: string | null) => {
    const params: Record<string, string> = {};
    if (slug) params.category = slug;
    if (sortParam && sortParam !== 'newest') params.sort = sortParam;
    setSearchParams(params);
  };

  const handleSortSelect = (sortValue: string) => {
    const params: Record<string, string> = {};
    if (categoryParam) params.category = categoryParam;
    if (sortValue !== 'newest') params.sort = sortValue;
    setSearchParams(params);
    setIsSortOpen(false);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchQuery('');
    setInStockOnly(false);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortParam)?.label || 'Newest Arrivals';

  // Client-Side Search & Stock Filtering Engine
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // In-stock filter
      if (inStockOnly && p.stock <= 0) return false;

      // In-page search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name?.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        const matchesCategory = p.category?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    });
  }, [products, inStockOnly, searchQuery]);

  // Client-Side Sorting Engine
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortParam === 'price_low') {
        return Number(a.selling_price || 0) - Number(b.selling_price || 0);
      }
      if (sortParam === 'price_high') {
        return Number(b.selling_price || 0) - Number(a.selling_price || 0);
      }
      if (sortParam === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortParam === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      // 'newest' default (created_at descending)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [filteredProducts, sortParam]);

  const hasActiveFilters = !!categoryParam || searchQuery.trim().length > 0 || inStockOnly || sortParam !== 'newest';

  return (
    <div className="pt-2 sm:pt-3 min-h-screen bg-background pb-16 text-foreground font-sans">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* 1. Breadcrumbs Trail (Compact & Refined) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-widest mb-1.5 sm:mb-2">
          <Link to="/" className="hover:text-[#a31d58] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <Link to="/shop" className={`${!categoryParam ? 'text-[#1c3829] dark:text-[#faf7f2] font-semibold' : 'hover:text-[#a31d58] transition-colors'}`}>
            The Collection
          </Link>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[#a31d58] dark:text-[#f472b6] font-semibold">{selectedCategory.name}</span>
            </>
          )}
        </div>

        {/* 2. Editorial Page Header (Centered & Compact Luxury Styling) */}
        <div className="text-center max-w-xl mx-auto mb-3 sm:mb-3.5 space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-r from-transparent to-[#a31d58]/50" />
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-[#a31d58] dark:text-[#f472b6]">
              HAUTE JEWELRY &amp; FINE OBJECTS
            </span>
            <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-l from-transparent to-[#a31d58]/50" />
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-foreground tracking-tight leading-tight">
            {selectedCategory ? (
              <>
                {selectedCategory.name}{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] dark:from-[#faf7f2] dark:via-[#f472b6] dark:to-[#faf7f2] bg-clip-text text-transparent">
                  Edition
                </span>
              </>
            ) : (
              <>
                The{' '}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] dark:from-[#faf7f2] dark:via-[#f472b6] dark:to-[#faf7f2] bg-clip-text text-transparent">
                  Collection
                </span>
              </>
            )}
          </h1>

          <p className="text-[11px] sm:text-xs text-muted-foreground max-w-md mx-auto font-sans font-light leading-snug">
            Curated fine jewelry, bespoke handcrafted creations, and luxury accessories built for timeless elegance.
          </p>
        </div>

        {/* 3. Luxury Category Circles Navigation Strip */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-start md:justify-center gap-3.5 sm:gap-5 overflow-x-auto pb-2 pt-1 hide-scrollbar snap-x">
            {/* All Creations Circle */}
            <button
              onClick={() => handleCategorySelect(null)}
              className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
            >
              <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full p-1 ring-2 transition-all flex items-center justify-center font-bold font-serif shadow-xs ${
                !categoryParam 
                  ? 'ring-[#a31d58] bg-[#1c3829] text-[#faf7f2] scale-105 shadow-md' 
                  : 'ring-[#1c3829]/30 bg-[#fdfbf7] dark:bg-[#12261b] text-foreground hover:ring-[#a31d58]'
              }`}>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider">ALL</span>
              </div>
              <span className={`text-[10px] sm:text-[11px] font-semibold transition-colors ${!categoryParam ? 'text-[#a31d58] font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                All Pieces
              </span>
            </button>

            {/* Individual Category Circles */}
            {activeCategories.map((cat) => {
              const isSelected = categoryParam === cat.slug || categoryParam === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
                >
                  <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full p-0.5 ring-2 transition-all overflow-hidden shadow-xs ${
                    isSelected 
                      ? 'ring-[#a31d58] scale-105 shadow-md' 
                      : 'ring-[#1c3829]/30 hover:ring-[#a31d58]'
                  }`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <span className="font-serif font-bold text-xs sm:text-sm text-foreground">
                          {cat.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-semibold max-w-[70px] sm:max-w-[85px] truncate transition-colors ${
                    isSelected ? 'text-[#a31d58] font-bold' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Filter, Search & Sort Control Bar (Snug & Modern) */}
        <div className="mb-2.5 sm:mb-3 p-1.5 sm:p-2 rounded-xl bg-[#fdfbf7] dark:bg-card border border-[#eae4d8] dark:border-border/70 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
          
          {/* Search Within Catalog */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces, styles, gems..."
              className="w-full h-8 pl-8 pr-7 text-xs rounded-full bg-[#edf3ee]/60 dark:bg-secondary/50 border border-[#eae4d8] dark:border-border/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#1c3829]/30 transition-all placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#a31d58] p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions (In Stock Toggle, Sort Dropdown & Product Count) */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-2.5">
            
            {/* In-Stock Filter Pill */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                inStockOnly
                  ? 'bg-[#1c3829] text-[#faf7f2] border-[#1c3829] shadow-2xs'
                  : 'bg-[#edf3ee] dark:bg-secondary/40 border-[#eae4d8] dark:border-border/60 text-[#1c3829] dark:text-muted-foreground hover:text-[#a31d58]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${inStockOnly ? 'bg-[#a31d58]' : 'bg-muted-foreground'}`} />
              In Stock Only
            </button>

            {/* Mobile Filter Button */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 border border-[#eae4d8] dark:border-border px-2.5 py-1 sm:py-1.5 rounded-full hover:bg-secondary transition-colors md:hidden text-[11px] sm:text-xs font-semibold text-[#1c3829] dark:text-foreground"
            >
              <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>

            {/* Interactive Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 bg-[#edf3ee] dark:bg-secondary/60 hover:bg-[#edf3ee]/80 border border-[#eae4d8] dark:border-border/80 px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-[#1c3829] dark:text-foreground transition-all shadow-2xs"
              >
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider hidden sm:inline">Sort:</span>
                <span>{currentSortLabel}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Menu Overlay */}
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-30 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50">
                      Sort Collections By
                    </div>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortSelect(opt.value)}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-secondary/70 transition-colors ${
                          sortParam === opt.value ? 'text-[#1c3829] dark:text-[#faf7f2] font-bold bg-[#edf3ee] dark:bg-secondary/40' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortParam === opt.value && <Check className="w-3.5 h-3.5 text-[#a31d58]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 5. Active Filter Status & Reset Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 text-xs">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Active:</span>
            
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fce8f0] dark:bg-[#1c3829]/30 border border-[#a31d58]/30 text-[#891547] dark:text-[#f472b6] font-medium text-[10.5px]">
                {selectedCategory.name}
                <button onClick={() => handleCategorySelect(null)} className="hover:text-[#a31d58]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fce8f0] dark:bg-[#1c3829]/30 border border-[#a31d58]/30 text-[#891547] dark:text-[#f472b6] font-medium text-[10.5px]">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-[#a31d58]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fce8f0] dark:bg-[#1c3829]/30 border border-[#a31d58]/30 text-[#891547] dark:text-[#f472b6] font-medium text-[10.5px]">
                In Stock
                <button onClick={() => setInStockOnly(false)} className="hover:text-[#a31d58]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#a31d58] dark:text-[#f472b6] hover:underline ml-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>
        )}

        {/* 6. Product Count Status */}
        <div className="mb-2 sm:mb-2.5 flex justify-between items-center text-[11px] sm:text-xs text-muted-foreground font-medium">
          <span>
            {isLoading ? 'Scanning catalog...' : `Displaying ${sortedProducts.length} handcrafted piece(s)`}
          </span>
        </div>

        {/* 7. Product Catalog Grid */}
        {isLoading ? (
          /* Shimmering Luxury Skeleton Placeholders */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-secondary/70 border border-border/40" />
                <div className="h-2.5 w-1/3 bg-secondary/80 rounded" />
                <div className="h-3.5 w-3/4 bg-secondary/80 rounded" />
                <div className="h-3.5 w-1/4 bg-secondary/60 rounded" />
              </div>
            ))}
          </div>
        ) : (
          /* Full 4-Column Luxury Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 gap-y-10">
            <AnimatePresence mode="popLayout">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 8. Luxury Empty State */}
        {!isLoading && sortedProducts.length === 0 && (
          <div className="py-24 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground border border-border/80 shadow-xs">
              <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-serif text-2xl font-light text-foreground">No pieces found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We couldn't locate any products matching your active filters. Try clearing your search or switching categories.
            </p>
            <div className="pt-2">
              <button 
                onClick={clearAllFilters}
                className="px-7 py-3 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 9. Mobile Filter & Sort Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-background z-50 rounded-t-3xl shadow-2xl p-6 md:hidden overflow-y-auto space-y-6 border-t border-border/60"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-serif font-light text-2xl">Filter &amp; Sort</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-secondary rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Sort Options */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { handleSortSelect(opt.value); setIsFilterOpen(false); }}
                      className={`px-4 py-3 rounded-2xl border text-xs font-semibold text-left flex justify-between items-center transition-colors ${
                        sortParam === opt.value ? 'bg-foreground text-background border-foreground shadow-xs' : 'border-border text-foreground hover:bg-secondary/40'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortParam === opt.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Categories */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => { handleCategorySelect(null); setIsFilterOpen(false); }}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold ${!categoryParam ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground'}`}
                  >
                    All Creations
                  </button>
                  {activeCategories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => { handleCategorySelect(cat.slug); setIsFilterOpen(false); }}
                      className={`px-4 py-2 rounded-full border text-xs font-semibold ${categoryParam === cat.slug ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-foreground text-background py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Apply &amp; View Creations ({sortedProducts.length})
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Shop;
