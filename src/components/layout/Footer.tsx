import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { storeSettingsService } from '@/services/storeSettingsService';
import { InstagramIcon, WhatsAppIcon, PhoneCallIcon, MailEnvelopeIcon } from '@/components/ui/BrandIcons';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['store_settings'],
    queryFn: storeSettingsService.getSettings
  });

  const rawSiteName = settings?.site_name || '';
  const siteName = (rawSiteName && rawSiteName !== 'SnapGem Store') 
    ? rawSiteName 
    : (import.meta.env.VITE_APP_NAME && import.meta.env.VITE_APP_NAME !== 'SnapGem Store' ? import.meta.env.VITE_APP_NAME : 'STORE');

  const cleanWaNumber = (settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '919421776463').replace(/[^0-9]/g, '');
  const cleanPhoneNumber = (settings?.contact_number || import.meta.env.VITE_WHATSAPP_NUMBER || '+91 9421776463').replace(/[^0-9+]/g, '');
  const supportEmail = settings?.contact_email && !settings.contact_email.includes('snapgem') && !settings.contact_email.includes('example.com')
    ? settings.contact_email 
    : 'royalwebcreations28@gmail.com';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/royal_web_creations';

  const rawFooter = settings?.footer_text || '';
  const cleanFooterText = rawFooter.includes('SnapGem')
    ? rawFooter.replace(/SnapGem\s*(Store)?/gi, siteName)
    : (rawFooter || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`);

  return (
    <footer className="bg-card text-card-foreground pt-16 pb-8 border-t border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 flex flex-col items-start space-y-4 pr-0 lg:pr-6">
            <Link to="/" className="text-2xl font-bold tracking-tight font-serif text-foreground">
              {siteName.toUpperCase()}
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              Curated fine jewelry, bespoke artisanal creations, and luxury accessories. Handcrafted designs with direct WhatsApp concierge fulfillment and insured nationwide dispatch.
            </p>

            {/* Direct Contact Badges */}
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-muted-foreground">
              <a href={`tel:${cleanPhoneNumber}`} className="flex items-center gap-2 hover:text-foreground transition-colors font-medium">
                <PhoneCallIcon className="w-4 h-4 text-primary shrink-0" /> {settings?.contact_number || import.meta.env.VITE_WHATSAPP_NUMBER || '+91 0000000000'}
              </a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-foreground transition-colors font-medium">
                <MailEnvelopeIcon className="w-4 h-4 text-primary shrink-0" /> {supportEmail}
              </a>
            </div>

            {/* Trust Seal */}
            <div className="pt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-[#1c3829] dark:text-[#a31d58]" /> 100% Certified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Lock className="w-4 h-4 text-[#1c3829] dark:text-[#a31d58]" /> Encrypted Checkout
              </span>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs font-serif text-foreground">Collections</h4>
            <ul className="flex flex-col gap-3 text-xs text-muted-foreground">
              <li><Link to="/shop" className="hover:text-foreground transition-colors">Shop All Collections</Link></li>
              <li><Link to="/shop?sort=newest" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?sort=price_high" className="hover:text-foreground transition-colors">Bestsellers & High Jewelry</Link></li>
              <li><Link to="/shop?sort=price_low" className="hover:text-foreground transition-colors">Everyday Fine Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs font-serif text-foreground">Concierge Care</h4>
            <ul className="flex flex-col gap-3 text-xs text-muted-foreground">
              <li><Link to="/page/contact" className="hover:text-foreground transition-colors">Contact Concierge</Link></li>
              <li><Link to="/page/about-us" className="hover:text-foreground transition-colors">About {siteName}</Link></li>
              <li><Link to="/page/shipping-returns" className="hover:text-foreground transition-colors">Shipping & Insured Delivery</Link></li>
              <li>
                <a 
                  href={`https://wa.me/${cleanWaNumber}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-[#a31d58] transition-colors text-[#1c3829] dark:text-[#faf7f2] font-bold inline-flex items-center gap-1.5"
                >
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp VIP Care
                </a>
              </li>
            </ul>
          </div>

          {/* Social Channels & Legal */}
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs font-serif text-foreground">Follow Our Story</h4>
            <div className="flex items-center gap-2.5 mb-6">
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-secondary hover:bg-[#a31d58] hover:text-[#faf7f2] flex items-center justify-center transition-all shadow-xs"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href={`mailto:${supportEmail}`}
                className="w-10 h-10 rounded-full bg-secondary hover:bg-[#1c3829] hover:text-[#faf7f2] flex items-center justify-center transition-all shadow-xs"
                title="Email Support"
                aria-label="Email"
              >
                <MailEnvelopeIcon className="w-4 h-4" />
              </a>
              <a 
                href={`tel:${cleanPhoneNumber}`}
                className="w-10 h-10 rounded-full bg-secondary hover:bg-[#1c3829] hover:text-[#faf7f2] flex items-center justify-center transition-all shadow-xs"
                title="Call Phone"
                aria-label="Phone"
              >
                <PhoneCallIcon className="w-4 h-4" />
              </a>
              <a 
                href={`https://wa.me/${cleanWaNumber}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-secondary hover:bg-[#1c3829] hover:text-[#faf7f2] flex items-center justify-center transition-all shadow-xs"
                title="WhatsApp Support"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>

            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li><Link to="/page/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/page/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{cleanFooterText}</p>

          {/* Payment Trust Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold mr-1">Accepted Payments:</span>
            <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-bold">UPI / GPay</span>
            <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-bold">PhonePe</span>
            <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-bold">Cards / NetBanking</span>
            <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-bold">COD</span>
          </div>

          <div className="flex items-center gap-3 font-medium text-[11px]">
            <span>Currency: INR (₹)</span>
            <span>|</span>
            <span>Region: India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
