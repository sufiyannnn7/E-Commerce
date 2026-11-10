import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageSquare, RefreshCw, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CraftsmanshipSectionProps {
  settings?: any;
}

export function CraftsmanshipSection({ settings }: CraftsmanshipSectionProps) {
  const mergedPillars = [
    {
      icon: Truck,
      title: settings?.perk1_title || 'Express Insured Dispatch',
      desc: settings?.perk1_subtitle || 'Fast doorstep delivery with tamper-proof sealed packaging and live transit tracking across India.',
      tag: 'Verified Transit'
    },
    {
      icon: ShieldCheck,
      title: settings?.perk2_title || '100% Certified Hallmark',
      desc: settings?.perk2_subtitle || 'Every masterwork is rigorously tested & stamped with authentic purity certification, guaranteeing genuine luxury.',
      tag: 'Certified Purity'
    },
    {
      icon: MessageSquare,
      title: settings?.perk3_title || 'Direct WhatsApp Concierge',
      desc: settings?.perk3_subtitle || 'Enjoy one-on-one styling guidance, live video calls, and instant order tracking with our master stylists.',
      tag: 'Direct Stylist'
    },
    {
      icon: RefreshCw,
      title: settings?.perk4_title || 'Hassle-Free Easy Returns',
      desc: settings?.perk4_subtitle || 'Effortless exchange and transparent replacement policy, backed by our dedicated customer care team.',
      tag: 'Guaranteed Care'
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#faf7f2] via-[#f7f2e8] to-[#faf7f2] dark:from-[#08120d] dark:via-[#0c1a12] dark:to-[#08120d] border-t border-[#eae4d8] dark:border-border/40 relative overflow-hidden">
      {/* Decorative ambient magenta & green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-gradient-to-r from-[#a31d58]/10 via-[#1c3829]/10 to-[#a31d58]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          
          {/* Beautified EXCELLENCE & HERITAGE Overline */}
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#a31d58]/50" />
            <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#a31d58] dark:text-[#f472b6] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#a31d58] dark:text-[#f472b6]" /> EXCELLENCE &amp; HERITAGE
            </span>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#a31d58]/50" />
          </div>

          {/* Headline with Rich Luxury Gradient */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground tracking-tight leading-[1.2]">
            The Art of{' '}
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#1c3829] via-[#a31d58] to-[#1c3829] dark:from-[#fce8f0] dark:via-[#f472b6] dark:to-[#fce8f0] bg-clip-text text-transparent drop-shadow-xs">
              Fine Craftsmanship
            </span>
          </h2>

          {/* Beautified Description Paragraph */}
          <p className="text-sm md:text-base text-muted-foreground/90 max-w-xl mx-auto leading-relaxed font-sans font-normal">
            We hold ourselves to an uncompromising standard of elegance, durability, and dedicated customer care across every creation.
          </p>
        </div>

        {/* 4 Merged Unified Cards (Replaces duplicate perks banner) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mergedPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative p-7 rounded-3xl glass-luxury border border-white/80 dark:border-white/10 hover:border-[#a31d58]/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_35px_rgba(163,29,88,0.14)] transition-all duration-300 flex flex-col items-start text-left shine-sheen"
              >
                {/* Icon with interactive hover background */}
                <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-[#edf3ee] dark:bg-[#12261b] border border-[#eae4d8] dark:border-border/50 flex items-center justify-center text-[#1c3829] dark:text-[#faf7f2] mb-6 group-hover:scale-110 group-hover:bg-[#a31d58] group-hover:text-[#faf7f2] group-hover:shadow-[0_6px_20px_rgba(163,29,88,0.35)] transition-all duration-300 shrink-0">
                  <Icon className="w-6 h-6 transition-transform group-hover:rotate-3" />
                </div>

                {/* Card Title */}
                <h3 className="text-lg font-bold text-foreground font-serif mb-2.5 tracking-tight group-hover:text-[#a31d58] transition-colors">
                  {pillar.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {pillar.desc}
                </p>

                {/* Footer Tag */}
                <div className="mt-5 pt-3.5 border-t border-[#eae4d8]/80 dark:border-border/40 w-full flex items-center justify-between text-[11px] font-semibold text-[#1c3829] dark:text-[#a31d58]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Promise</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#1c3829]/10 dark:bg-[#a31d58]/20 text-[#1c3829] dark:text-[#f472b6]">
                    {pillar.tag}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Discover Our Story & Heritage Pill Button */}
        <div className="mt-14 text-center">
          <Link
            to="/page/about-us"
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#1c3829]/30 bg-[#fdfbf7] dark:bg-[#12261b] hover:bg-[#a31d58] hover:text-[#faf7f2] hover:border-[#a31d58] text-[#1c3829] dark:text-[#faf7f2] transition-all duration-300 shadow-sm hover:shadow-[0_8px_25px_rgba(163,29,88,0.3)] text-xs font-semibold uppercase tracking-[0.2em] shine-sheen"
          >
            <span>Discover Our Story &amp; Heritage</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default CraftsmanshipSection;
