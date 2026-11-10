import React from "react";
import { CircularTestimonials } from '@/components/ui/circular-testimonials';

const testimonials = [
  {
    quote:
      "The diamond pendant and bespoke craftsmanship exceeded all my expectations. Direct WhatsApp order assistance made customization effortless!",
    name: "Aanya Mehta",
    designation: "Verified Buyer, Mumbai",
    src:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
  },
  {
    quote:
      "Stunning gold finish and authentic hallmark quality. Delivered within 48 hours in insured tamper-proof packaging.",
    name: "Rohit Singhania",
    designation: "Collector & VIP Client",
    src:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
  },
  {
    quote:
      "Exceptional attention to detail. Every piece feels like an heirloom milestone. The concierge customer service was truly second to none.",
    name: "Meera Kapoor",
    designation: "Loyal Customer, Delhi",
    src:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
  },
];

export const CircularTestimonialsDemo = () => (
  <section className="py-12 bg-secondary/20">
    <div className="container mx-auto px-4 text-center">
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">CLIENT PRIVILEGE</span>
      <h2 className="text-3xl font-bold font-serif mt-1 mb-8">What Connoisseurs Say</h2>
      <CircularTestimonials
        testimonials={testimonials}
        autoplay={true}
        colors={{
          name: "currentColor",
          designation: "#6b7280",
          testimony: "currentColor",
          arrowBackground: "#141414",
          arrowForeground: "#ffffff",
          arrowHoverBackground: "#d4af37",
        }}
        fontSizes={{
          name: "1.75rem",
          designation: "0.875rem",
          quote: "1.125rem",
        }}
      />
    </div>
  </section>
);

export default CircularTestimonialsDemo;

