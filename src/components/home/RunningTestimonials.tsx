import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

interface ReviewItem {
  name: string;
  location: string;
  rating: number;
  comment: string;
  product: string;
}

const reviewsList: ReviewItem[] = [
  {
    name: 'Pooja Kulkarni',
    location: 'Pune',
    rating: 5,
    comment: 'The craftsmanship is breathtaking! Hallmarked purity and delivered on WhatsApp request so promptly.',
    product: 'Handcrafted Gold Pendant'
  },
  {
    name: 'Sameer Sheikh',
    location: 'Mumbai',
    rating: 5,
    comment: 'Super fast WhatsApp ordering and excellent packaging. My wife loved the custom anniversary bracelet.',
    product: 'Diamond Tennis Bracelet'
  },
  {
    name: 'Ritu Aggarwal',
    location: 'Delhi',
    rating: 5,
    comment: '100% authentic hallmark. Highly recommend their bespoke concierge team. Will order again!',
    product: 'Solitaire Statement Ring'
  },
  {
    name: 'Ananya Roy',
    location: 'Kolkata',
    rating: 5,
    comment: 'Exquisite finish and beautiful shine. The photos do not do it justice, it looks even more stunning in person.',
    product: 'Artisan Choker Set'
  },
  {
    name: 'Vikram Joshi',
    location: 'Bengaluru',
    rating: 5,
    comment: 'Hassle-free checkout and instant order confirmation on WhatsApp. Truly top-tier luxury service.',
    product: 'Classic Cufflink Set'
  }
];

export function RunningTestimonials() {
  return (
    <section className="py-8 bg-[#162e21] text-[#faf7f2] overflow-hidden relative border-y border-[#2d5339]">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#162e21] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#162e21] to-transparent z-10 pointer-events-none" />

      {/* Ticker Row */}
      <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
        {[...reviewsList, ...reviewsList].map((rev, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-3 bg-[#faf7f2]/10 border border-[#faf7f2]/15 px-5 py-3 rounded-2xl backdrop-blur-md shrink-0 max-w-sm hover:border-[#a31d58] transition-colors"
          >
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-[#a31d58] gap-0.5">
                  {[...Array(rev.rating)].map((_, s) => (
                    <Star key={s} className="w-3 h-3 fill-[#a31d58] text-[#a31d58]" />
                  ))}
                </div>
                <span className="text-[10px] text-[#faf7f2]/85 flex items-center gap-0.5 font-medium">
                  <CheckCircle className="w-3 h-3 text-[#a31d58]" /> Verified Buyer
                </span>
              </div>
              <p className="text-xs text-[#faf7f2]/95 line-clamp-1 italic whitespace-normal">
                "{rev.comment}"
              </p>
              <div className="flex items-center justify-between gap-4 mt-1 text-[11px] text-[#faf7f2]/75">
                <span className="font-semibold text-[#faf7f2]">{rev.name} ({rev.location})</span>
                <span className="text-[10px] text-[#faf7f2]/60">{rev.product}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RunningTestimonials;

