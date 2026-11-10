import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  date: string;
  location?: string;
}

interface InstagramSectionProps {
  handle?: string;
  instagramUrl?: string;
  avatarUrl?: string;
  posts?: InstagramPost[];
}

export function InstagramSection({
  handle,
  instagramUrl,
  avatarUrl,
  posts
}: InstagramSectionProps) {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const displayHandle = handle || '@royal_web_creations';
  const cleanHandle = displayHandle.replace(/^@/, '');
  const profileUrl = instagramUrl || `https://instagram.com/${cleanHandle}`;

  const defaultPosts: InstagramPost[] = [
    {
      id: 'ig-1',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
      caption: 'Elegance is not about being noticed, it is about being remembered ✨ Handcrafted with 100% certified hallmarked purity.',
      likes: 1248,
      comments: 64,
      date: '2 DAYS AGO',
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 'ig-2',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      caption: 'Grace in every thread, precision in every curve. Order directly via WhatsApp concierge in bio! 🤍',
      likes: 892,
      comments: 41,
      date: '3 DAYS AGO',
      location: 'Bandra West, Mumbai'
    },
    {
      id: 'ig-3',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
      caption: 'Timeless luxury meets everyday comfort. Step into our boutique experience or explore our catalog online. ✨',
      likes: 2154,
      comments: 112,
      date: '5 DAYS AGO',
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 'ig-4',
      imageUrl: 'https://images.unsplash.com/photo-1611591475165-da255c4d0089?auto=format&fit=crop&q=80&w=800',
      caption: 'Shine brighter with pieces that tell your unique story. Direct express insured dispatch across India! 📦✨',
      likes: 1430,
      comments: 78,
      date: '1 WEEK AGO',
      location: 'Colaba, Mumbai'
    },
    {
      id: 'ig-5',
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
      caption: 'Pure artisan magic. Every facet cut to capture the morning light. DM or WhatsApp for custom sizing 💎',
      likes: 1876,
      comments: 95,
      date: '1 WEEK AGO',
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 'ig-6',
      imageUrl: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=80&w=800',
      caption: 'Engineered for lifetime durability. Premium EDC accessories handcrafted with laser precision. 🤍',
      likes: 960,
      comments: 52,
      date: '2 WEEKS AGO',
      location: 'Mumbai, Maharashtra'
    }
  ];

  const displayPosts = posts && posts.length > 0 ? posts : defaultPosts;

  // Track responsive viewport items: Desktop = strictly 3, Tablet = 2, Mobile = 1
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, displayPosts.length - itemsPerView);

  // Keep index within bounds on resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const toggleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#faf7f2] via-[#f7f2e8] to-[#faf7f2] dark:from-[#08120d] dark:via-[#0c1a12] dark:to-[#08120d] border-t border-[#eae4d8] dark:border-border/40 overflow-hidden relative">
      {/* Background ambient luxury glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#a31d58]/10 via-[#c2185b]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Brand & Follow Callout with Official Instagram Styling */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Pill Badge with Instagram Gradient */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 border border-[#dc2743]/30 backdrop-blur-md shadow-xs">
              <FaInstagram className="w-4 h-4 text-[#dc2743]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
                INSTAGRAM FEED
              </span>
            </div>

            {/* Heading with Authentic Instagram Script Font & Color */}
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-foreground leading-[1.15]">
                Follow Us on
              </h2>
              <div className="pt-0.5 overflow-visible">
                <span
                  style={{ 
                    fontFamily: "'Grand Hotel', 'Satisfy', cursive",
                    display: 'inline-block',
                    paddingBottom: '0.45em',
                    paddingTop: '0.08em',
                    paddingRight: '0.15em',
                    lineHeight: '1.25'
                  }}
                  className="text-5xl sm:text-6xl md:text-7xl font-normal bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] bg-clip-text text-transparent drop-shadow-sm tracking-wide select-none transform hover:scale-105 transition-transform"
                >
                  Instagram
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-sm">
              Discover style inspirations, live artisan craftsmanship, and exclusive previews directly on our daily feed.
            </p>

            {/* Elevated Luxury Instagram Channel Card */}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-white dark:border-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_35px_rgba(220,39,67,0.18)] hover:border-[#dc2743]/40 transition-all duration-300 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Authentic Instagram Story Gradient Ring Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm group-hover:scale-105 transition-transform">
                    <div className="w-full h-full bg-[#faf7f2] dark:bg-neutral-800 rounded-full overflow-hidden flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayHandle} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-sm font-extrabold text-[#a31d58]">
                          {cleanHandle.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Glowing active indicator dot */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 shadow-xs" />
                </div>

                {/* Handle & Verified Badge */}
                <div className="flex flex-col text-left min-w-0 truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#a31d58] transition-colors truncate">
                      {displayHandle}
                    </span>
                    {/* Official Instagram Verified Blue Rosette Badge */}
                    <svg className="w-4 h-4 shrink-0 drop-shadow-xs" viewBox="0 0 24 24" aria-label="Verified channel">
                      <path fill="#0095f6" d="M12 2.25l1.83 2.5 3.09-.34.82 2.99 3.01.81-.35 3.09 2.5 1.83-1.83 2.5.35 3.09-3.01.81-.82 2.99-3.09-.34-1.83 2.5-1.83-2.5-3.09.34-.82-2.99-3.01-.81.35-3.09-2.5-1.83 1.83-2.5-.35-3.09 3.01-.81.82-2.99 3.09.34L12 2.25z"/>
                      <path fill="#ffffff" d="M10.25 15.5l-3.25-3.25 1.4-1.4 1.85 1.85 5.35-5.35 1.4 1.4-6.75 6.75z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                    Official Brand • Daily Drops & Inspo
                  </span>
                </div>
              </div>

              {/* Instagram Style Follow Pill */}
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#dc2743] via-[#cc2366] to-[#bc1888] text-white text-[11px] font-bold shadow-sm group-hover:shadow-[0_4px_12px_rgba(220,39,67,0.35)] group-hover:scale-105 active:scale-95 transition-all">
                <span>Follow</span>
                <ExternalLink className="w-3 h-3 opacity-90" />
              </div>
            </a>

            {/* Action Bar: View Profile Button + Carousel Arrows */}
            <div className="pt-2 flex items-center justify-between gap-3 max-w-sm">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#a31d58] via-[#c2185b] to-[#a31d58] hover:from-[#891547] hover:to-[#891547] text-[#faf7f2] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-[0_8px_25px_rgba(163,29,88,0.3)] hover:shadow-[0_12px_30px_rgba(163,29,88,0.45)] transition-all shine-sheen hover:scale-[1.02] active:scale-95"
              >
                <FaInstagram className="w-4 h-4" />
                <span>View Profile</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {/* Slider Arrow Controls: Slide Next / Slide Prev */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-[#1c3829] hover:bg-[#a31d58] text-[#faf7f2] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shine-sheen border border-white/20"
                  aria-label="Previous Instagram post (slides left)"
                  title="Previous post"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-[#1c3829] hover:bg-[#a31d58] text-[#faf7f2] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shine-sheen border border-white/20"
                  aria-label="Next Instagram post (slides right, hides 1st and reveals next)"
                  title="Next post"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active post indicator badge */}
            <div className="flex items-center gap-1.5 pt-1">
              {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === dotIdx
                      ? 'w-6 bg-gradient-to-r from-[#dc2743] to-[#bc1888]'
                      : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Right Column: Strict 3-Post Visible Sliding Window Carousel */}
          <div className="lg:col-span-8 overflow-hidden relative">
            <div className="overflow-hidden w-full py-2">
              <motion.div
                className="flex"
                animate={{
                  x: `-${currentIndex * (100 / itemsPerView)}%`
                }}
                transition={{
                  type: 'spring',
                  stiffness: 220,
                  damping: 26,
                  mass: 0.8
                }}
              >
                {displayPosts.map((post) => {
                  const isLiked = !!likedPosts[post.id];
                  const likeCount = post.likes + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={post.id}
                      className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-2 sm:px-2.5"
                    >
                      <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/80 dark:border-white/10 hover:border-[#a31d58]/40 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_35px_rgba(163,29,88,0.16)] transition-all duration-300 group flex flex-col h-full text-left">
                        
                        {/* IG Post Header with Customizable Avatar */}
                        <div className="p-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/50">
                          <div className="flex items-center gap-2.5 truncate">
                            {/* Instagram Colorful Gradient Avatar Ring */}
                            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0 shadow-xs">
                              <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={displayHandle}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span>{cleanHandle.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-left leading-tight truncate">
                              <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
                                {displayHandle}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                                {post.location || 'Mumbai, Maharashtra'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors shrink-0"
                            aria-label="Post options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* IG Post Image */}
                        <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt="Instagram post"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium text-xs backdrop-blur-[2px]"
                          >
                            <FaInstagram className="w-5 h-5 text-[#faf7f2]" />
                            <span className="font-semibold text-sm">View on Instagram</span>
                          </a>
                        </div>

                        {/* IG Post Action Bar & Interactions */}
                        <div className="p-3.5 space-y-2 text-left flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-foreground mb-2">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleLike(post.id)}
                                  className="transition-transform active:scale-125 focus:outline-none"
                                  aria-label={isLiked ? "Unlike post" : "Like post"}
                                >
                                  <Heart
                                    className={`w-5 h-5 transition-colors ${
                                      isLiked
                                        ? 'fill-[#a31d58] text-[#a31d58] scale-110'
                                        : 'hover:text-[#a31d58]'
                                    }`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  className="hover:text-[#a31d58] transition-colors focus:outline-none"
                                  aria-label="Comment"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  className="hover:text-[#a31d58] transition-colors focus:outline-none"
                                  aria-label="Share"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                className="hover:text-[#a31d58] transition-colors focus:outline-none"
                                aria-label="Save post"
                              >
                                <Bookmark className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Likes count */}
                            <p className="text-xs font-bold text-foreground">
                              {likeCount.toLocaleString()} likes
                            </p>

                            {/* Caption with Handle */}
                            <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed mt-1">
                              <span className="font-bold mr-1.5 text-foreground">{displayHandle}</span>
                              {post.caption}
                            </p>
                          </div>

                          {/* Post Date */}
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            {post.date}
                          </p>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default InstagramSection;
