import { supabase } from '../lib/supabase';

export interface StoreSettings {
  id: number;
  site_name?: string;
  contact_email?: string;
  contact_number?: string;
  whatsapp_number?: string;
  business_address?: string;
  currency_symbol?: string;
  currency_code?: string;
  
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  
  footer_text?: string;
  facebook_url?: string;
  instagram_url?: string;
  instagram_avatar_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  google_maps_url?: string;
  
  gst_number?: string;
  store_timing?: string;
  enable_cod?: boolean;
  base_shipping_charge?: number;
  free_shipping_threshold?: number;
  delivery_time_text?: string;

  // Customizable Full-Screen Hero Landing Banner
  hero_image_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_button_text?: string;
  hero_button_link?: string;

  // 4 Editable Storefront Perks
  perk1_title?: string;
  perk1_subtitle?: string;
  perk2_title?: string;
  perk2_subtitle?: string;
  perk3_title?: string;
  perk3_subtitle?: string;
  perk4_title?: string;
  perk4_subtitle?: string;

  // Editable About Us Fields
  about_subtitle?: string;
  about_title?: string;
  about_story?: string;
  about_perk1_title?: string;
  about_perk1_desc?: string;
  about_perk2_title?: string;
  about_perk2_desc?: string;
  about_perk3_title?: string;
  about_perk3_desc?: string;
  
  announcement_bar_active?: boolean;
  announcement_text?: string;
  announcement_link?: string;
  maintenance_mode?: boolean;
  show_craftsmanship_section?: boolean;

  // Editable Category Showcase
  category_section_title?: string;
  category_section_subtitle?: string;

  // Editable Top Picks & Trending Section Below Categories
  show_top_picks_section?: boolean;
  top_picks_title?: string;
  top_picks_subtitle?: string;
  top_picks_tab1_label?: string;
  top_picks_tab2_label?: string;
  top_picks_tab3_label?: string;
  top_picks_tab4_label?: string;
  top_picks_default_tab?: 'top_picks' | 'trending' | 'new_arrivals' | 'best_sellers';
  
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  google_analytics_id?: string;
  google_site_verification?: string;
}

const LOCAL_SETTINGS_KEY = 'store_settings_fallback';

export const storeSettingsService = {
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1);
        
      if (!error && data && data.length > 0) {
        return data[0] as StoreSettings;
      }
    } catch (e) {
      console.warn('Error fetching store_settings from DB (using local fallback):', e);
    }
    
    const savedLocal = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (savedLocal) {
      try {
        return JSON.parse(savedLocal) as StoreSettings;
      } catch (err) {}
    }

    return {
      id: 1,
      site_name: import.meta.env.VITE_APP_NAME || 'Store',
      contact_email: 'royalwebcreations28@gmail.com',
      contact_number: '+91 9421776463',
      whatsapp_number: (import.meta.env.VITE_WHATSAPP_NUMBER || '919421776463').replace(/[^0-9]/g, ''),
      instagram_url: 'https://instagram.com/royal_web_creations',
      instagram_avatar_url: '',
      currency_symbol: '₹',
      currency_code: 'INR',
      hero_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920',
      hero_title: 'Elevate Your Everyday',
      hero_subtitle: 'LUXURY FINE JEWELRY & ACCESSORIES',
      hero_button_text: 'Explore Collection',
      hero_button_link: '#categories',
      perk1_title: 'Express Shipping',
      perk1_subtitle: 'Free shipping across India',
      perk2_title: '100% Certified',
      perk2_subtitle: 'Authentic quality guaranteed',
      perk3_title: 'WhatsApp Assistance',
      perk3_subtitle: 'Direct seller chat & sizing help',
      perk4_title: 'Easy Returns',
      perk4_subtitle: 'Hassle-free replacement policy',
      show_craftsmanship_section: true,
      category_section_title: 'Shop by Category',
      category_section_subtitle: 'CURATED COLLECTIONS',
      show_top_picks_section: true,
      top_picks_title: 'Shop Our Top Picks',
      top_picks_subtitle: 'HANDPICKED FAVORITES',
      top_picks_tab1_label: 'Top Picks',
      top_picks_tab2_label: 'Trending',
      top_picks_tab3_label: 'New Arrivals',
      top_picks_tab4_label: 'Best Sellers',
      top_picks_default_tab: 'top_picks'
    } as StoreSettings;
  },

  async updateSettings(updates: Partial<StoreSettings>) {
    let payload: any = { id: 1, ...updates };

    // Backup to local storage instantly
    try {
      const currentLocal = localStorage.getItem(LOCAL_SETTINGS_KEY);
      const prevObj = currentLocal ? JSON.parse(currentLocal) : {};
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify({ ...prevObj, ...payload }));
    } catch (err) {}

    // Retry loop stripping unmapped columns if schema cache lacks them
    for (let attempt = 0; attempt < 10; attempt++) {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert(payload)
        .select()
        .single();

      if (!error && data) {
        return data as StoreSettings;
      }

      if (error && error.message && error.message.includes("Could not find the '")) {
        const match = error.message.match(/Could not find the '([^']+)' column/);
        const missingColumn = match ? match[1] : null;
        if (missingColumn && missingColumn in payload) {
          console.warn(`Stripping unmapped column '${missingColumn}' from store_settings payload and retrying...`);
          delete payload[missingColumn];
          continue;
        }
      }

      console.warn('Error updating store_settings DB (saved to LocalStorage fallback):', error?.message);
      return payload as StoreSettings;
    }

    return payload as StoreSettings;
  }
};
