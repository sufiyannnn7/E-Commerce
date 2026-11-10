-- =============================================================================
-- MASTER COMPLETE SUPABASE SETUP SCRIPT FOR E-COMMERCE & WHATSAPP PLATFORM
-- Instructions: Run this entire script ONCE in your new Supabase SQL Editor.
-- It creates all extensions, tables, security policies (RLS), storage buckets,
-- auth triggers, and default seed data (settings, categories, sections, pages).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Custom Enum Types
DO $$ BEGIN
    CREATE TYPE public.admin_role AS ENUM ('admin', 'manager', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 2. CORE DATABASE TABLES
-- -----------------------------------------------------------------------------

-- PROFILES (Syncs with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ADMIN USERS (Controls admin panel authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- STORE SETTINGS (Single-row configuration table)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT DEFAULT 'Store',
  contact_email TEXT DEFAULT 'royalwebcreations28@gmail.com',
  contact_number TEXT DEFAULT '+91 9421776463',
  whatsapp_number TEXT DEFAULT '919421776463',
  business_address TEXT DEFAULT 'Mumbai, Maharashtra, India',
  currency_symbol TEXT DEFAULT '₹',
  currency_code TEXT DEFAULT 'INR',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#1c3829',
  secondary_color TEXT DEFAULT '#faf7f2',
  accent_color TEXT DEFAULT '#a31d58',
  footer_text TEXT DEFAULT '© 2026 Store. Handcrafted Excellence. All rights reserved.',
  facebook_url TEXT,
  instagram_url TEXT DEFAULT 'https://instagram.com/royal_web_creations',
  instagram_avatar_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  google_maps_url TEXT,
  gst_number TEXT,
  store_timing TEXT DEFAULT 'Mon-Sat: 10:00 AM - 8:00 PM',
  enable_cod BOOLEAN DEFAULT true,
  base_shipping_charge DECIMAL(10,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 1000,
  delivery_time_text TEXT DEFAULT '2-4 Business Days',

  -- Full-Screen Hero Landing Banner
  hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920',
  hero_title TEXT DEFAULT 'Elevate Your Everyday',
  hero_subtitle TEXT DEFAULT 'LUXURY FINE JEWELRY & ACCESSORIES',
  hero_button_text TEXT DEFAULT 'Explore Collection',
  hero_button_link TEXT DEFAULT '#categories',

  -- Storefront Perks (4 Cards)
  perk1_title TEXT DEFAULT 'Express Shipping',
  perk1_subtitle TEXT DEFAULT 'Free shipping across India',
  perk2_title TEXT DEFAULT '100% Certified',
  perk2_subtitle TEXT DEFAULT 'Authentic quality guaranteed',
  perk3_title TEXT DEFAULT 'WhatsApp Assistance',
  perk3_subtitle TEXT DEFAULT 'Direct seller chat & sizing help',
  perk4_title TEXT DEFAULT 'Easy Returns',
  perk4_subtitle TEXT DEFAULT 'Hassle-free replacement policy',

  -- About Us Story & Perks
  about_subtitle TEXT DEFAULT 'OUR STORY & HERITAGE',
  about_title TEXT DEFAULT 'The Art of Fine Craftsmanship',
  about_story TEXT DEFAULT 'We hold ourselves to an uncompromising standard of elegance, durability, and customer care. Each masterwork is thoughtfully curated for timeless beauty.',
  about_perk1_title TEXT DEFAULT 'Hallmark & Purity Guaranteed',
  about_perk1_desc TEXT DEFAULT 'Each masterwork is rigorously tested and stamped with authentic certification.',
  about_perk2_title TEXT DEFAULT 'Direct WhatsApp Concierge',
  about_perk2_desc TEXT DEFAULT 'Enjoy one-on-one styling guidance, live inventory video calls, and instant order tracking with our master stylists.',
  about_perk3_title TEXT DEFAULT 'Insured White-Glove Dispatch',
  about_perk3_desc TEXT DEFAULT 'Every precious parcel travels in sealed, tamper-evident insured packaging with real-time transit telemetry.',

  -- Announcement & Sections Toggles
  announcement_bar_active BOOLEAN DEFAULT true,
  announcement_text TEXT DEFAULT '✦ FREE EXPRESS SHIPPING ACROSS INDIA ON ORDERS OVER ₹1000 ✦ 100% CERTIFIED LUXURY ✦ DIRECT WHATSAPP ORDERING ✦ DISPATCH WITHIN 24 HOURS ✦',
  announcement_link TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  show_craftsmanship_section BOOLEAN DEFAULT true,

  -- Category Showcase
  category_section_title TEXT DEFAULT 'Shop by Category',
  category_section_subtitle TEXT DEFAULT 'CURATED COLLECTIONS',

  -- Top Picks & Trending Showcase
  show_top_picks_section BOOLEAN DEFAULT true,
  top_picks_title TEXT DEFAULT 'Shop Our Top Picks',
  top_picks_subtitle TEXT DEFAULT 'HANDPICKED FAVORITES',
  top_picks_tab1_label TEXT DEFAULT 'Top Picks',
  top_picks_tab2_label TEXT DEFAULT 'Trending',
  top_picks_tab3_label TEXT DEFAULT 'New Arrivals',
  top_picks_tab4_label TEXT DEFAULT 'Best Sellers',
  top_picks_default_tab TEXT DEFAULT 'top_picks',

  -- SEO & Analytics
  seo_title TEXT DEFAULT 'Store | Luxury Collections & Direct WhatsApp Ordering',
  seo_description TEXT DEFAULT 'Discover premium bespoke handcrafted creations, fine jewelry and luxury fashion with direct WhatsApp concierge.',
  seo_keywords TEXT DEFAULT 'luxury, jewelry, hijab, accessories, online store',
  google_analytics_id TEXT,
  google_site_verification TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- HOMEPAGE SECTIONS (For Drag-and-Drop Homepage Builder)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CMS PAGES (About Us, Terms, Privacy Policy, etc.)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  mrp DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  thumbnail TEXT,
  stock INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PRODUCT IMAGES GALLERY
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ATTRIBUTES & PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.attributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attribute_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  meta_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(attribute_id, value)
);

CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2),
  mrp DECIMAL(10,2),
  stock INTEGER DEFAULT 0 NOT NULL,
  image_url TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.variant_attribute_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  attribute_value_id UUID NOT NULL REFERENCES public.attribute_values(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(variant_id, attribute_value_id)
);

-- ORDERS (WhatsApp & Store Checkout)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notes TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0 NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0 NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total DECIMAL(10,2) DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_status TEXT DEFAULT 'pending' NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price DECIMAL(10,2) DEFAULT 0 NOT NULL,
  mrp DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ORDER STATUS TIMELINE
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- COUPONS & DISCOUNTS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- EXPENSES (Store Operations & Bookkeeping)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'general' NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- MEDIA LIBRARY (Uploaded Media Asset Tracker)
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  url TEXT NOT NULL,
  folder TEXT DEFAULT 'products' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India' NOT NULL,
  is_default BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CUSTOMER CART (Logged-in User Persistence)
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id, variant_id)
);

-- CUSTOMER WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. TRIGGERS & TIMESTAMP AUTOMATION
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_sections_updated_at ON public.homepage_sections;
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON public.banners;
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_updated_at ON public.cart;
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auth user signup trigger: auto-creates a profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current authenticated user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view own profile" ON public.profiles;
CREATE POLICY "Public can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Admin Users Policies (Allows login role verification & initial admin auto-provisioning)
DROP POLICY IF EXISTS "Read admin_users" ON public.admin_users;
CREATE POLICY "Read admin_users" ON public.admin_users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert admin_users" ON public.admin_users;
CREATE POLICY "Insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Modify admin_users" ON public.admin_users;
CREATE POLICY "Modify admin_users" ON public.admin_users FOR ALL TO authenticated USING (public.is_admin());

-- Store Settings (Public Read, Admin/Authenticated Write)
DROP POLICY IF EXISTS "Public read store_settings" ON public.store_settings;
CREATE POLICY "Public read store_settings" ON public.store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify store_settings" ON public.store_settings;
CREATE POLICY "Admin modify store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Homepage Sections (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read homepage_sections" ON public.homepage_sections;
CREATE POLICY "Public read homepage_sections" ON public.homepage_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify homepage_sections" ON public.homepage_sections;
CREATE POLICY "Admin modify homepage_sections" ON public.homepage_sections FOR ALL USING (true) WITH CHECK (true);

-- Categories (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify categories" ON public.categories;
CREATE POLICY "Admin modify categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Products & Product Images (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify products" ON public.products;
CREATE POLICY "Admin modify products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_images" ON public.product_images;
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify product_images" ON public.product_images;
CREATE POLICY "Admin modify product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- Product Variants & Attributes
DROP POLICY IF EXISTS "Public read attributes" ON public.attributes;
CREATE POLICY "Public read attributes" ON public.attributes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify attributes" ON public.attributes;
CREATE POLICY "Admin modify attributes" ON public.attributes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read attribute_values" ON public.attribute_values;
CREATE POLICY "Public read attribute_values" ON public.attribute_values FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify attribute_values" ON public.attribute_values;
CREATE POLICY "Admin modify attribute_values" ON public.attribute_values FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_attributes" ON public.product_attributes;
CREATE POLICY "Public read product_attributes" ON public.product_attributes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify product_attributes" ON public.product_attributes;
CREATE POLICY "Admin modify product_attributes" ON public.product_attributes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_variants" ON public.product_variants;
CREATE POLICY "Public read product_variants" ON public.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify product_variants" ON public.product_variants;
CREATE POLICY "Admin modify product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read variant_attribute_values" ON public.variant_attribute_values;
CREATE POLICY "Public read variant_attribute_values" ON public.variant_attribute_values FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify variant_attribute_values" ON public.variant_attribute_values;
CREATE POLICY "Admin modify variant_attribute_values" ON public.variant_attribute_values FOR ALL USING (true) WITH CHECK (true);

-- Orders & Order Items (Supports Guest WhatsApp Checkout + Admin Management)
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify orders" ON public.orders;
CREATE POLICY "Admin modify orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify order_items" ON public.order_items;
CREATE POLICY "Admin modify order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read order_timeline" ON public.order_timeline;
CREATE POLICY "Public read order_timeline" ON public.order_timeline FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify order_timeline" ON public.order_timeline;
CREATE POLICY "Admin modify order_timeline" ON public.order_timeline FOR ALL USING (true) WITH CHECK (true);

-- Pages & Banners
DROP POLICY IF EXISTS "Public read pages" ON public.pages;
CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify pages" ON public.pages;
CREATE POLICY "Admin modify pages" ON public.pages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read banners" ON public.banners;
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify banners" ON public.banners;
CREATE POLICY "Admin modify banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- Reviews
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert reviews" ON public.reviews;
CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin modify reviews" ON public.reviews;
CREATE POLICY "Admin modify reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- Coupons
DROP POLICY IF EXISTS "Public read coupons" ON public.coupons;
CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify coupons" ON public.coupons;
CREATE POLICY "Admin modify coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- Expenses & Media Library
DROP POLICY IF EXISTS "Admin read expenses" ON public.expenses;
CREATE POLICY "Admin read expenses" ON public.expenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify expenses" ON public.expenses;
CREATE POLICY "Admin modify expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read media_library" ON public.media_library;
CREATE POLICY "Public read media_library" ON public.media_library FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin modify media_library" ON public.media_library;
CREATE POLICY "Admin modify media_library" ON public.media_library FOR ALL USING (true) WITH CHECK (true);

-- Addresses, Cart, Wishlist, Notifications
DROP POLICY IF EXISTS "Users manage addresses" ON public.addresses;
CREATE POLICY "Users manage addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users manage cart" ON public.cart;
CREATE POLICY "Users manage cart" ON public.cart FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage wishlist" ON public.wishlist;
CREATE POLICY "Users manage wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage notifications" ON public.notifications;
CREATE POLICY "Users manage notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. STORAGE BUCKETS & STORAGE POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('banners', 'banners', true),
  ('logos', 'logos', true),
  ('cms', 'cms', true),
  ('media', 'media', true),
  ('avatars', 'avatars', true),
  ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects FOR SELECT 
USING (bucket_id IN ('products', 'categories', 'banners', 'logos', 'cms', 'media', 'avatars', 'product-images'));

DROP POLICY IF EXISTS "Public storage upload" ON storage.objects;
CREATE POLICY "Public storage upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id IN ('products', 'categories', 'banners', 'logos', 'cms', 'media', 'avatars', 'product-images'));

DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
CREATE POLICY "Public storage update" ON storage.objects FOR UPDATE 
USING (bucket_id IN ('products', 'categories', 'banners', 'logos', 'cms', 'media', 'avatars', 'product-images'));

DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;
CREATE POLICY "Public storage delete" ON storage.objects FOR DELETE 
USING (bucket_id IN ('products', 'categories', 'banners', 'logos', 'cms', 'media', 'avatars', 'product-images'));

-- -----------------------------------------------------------------------------
-- 6. DEFAULT SEED DATA
-- -----------------------------------------------------------------------------

-- 6.1 Store Settings
INSERT INTO public.store_settings (
  id,
  site_name,
  contact_email,
  contact_number,
  whatsapp_number,
  business_address,
  currency_symbol,
  currency_code,
  primary_color,
  secondary_color,
  accent_color,
  footer_text,
  instagram_url,
  hero_image_url,
  hero_title,
  hero_subtitle,
  hero_button_text,
  hero_button_link,
  perk1_title,
  perk1_subtitle,
  perk2_title,
  perk2_subtitle,
  perk3_title,
  perk3_subtitle,
  perk4_title,
  perk4_subtitle,
  category_section_title,
  category_section_subtitle,
  show_top_picks_section,
  top_picks_title,
  top_picks_subtitle,
  top_picks_tab1_label,
  top_picks_tab2_label,
  top_picks_tab3_label,
  top_picks_tab4_label,
  top_picks_default_tab,
  show_craftsmanship_section
) VALUES (
  1,
  'Store',
  'royalwebcreations28@gmail.com',
  '+91 9421776463',
  '919421776463',
  'Mumbai, Maharashtra, India',
  '₹',
  'INR',
  '#1c3829',
  '#faf7f2',
  '#a31d58',
  '© 2026 Store. Handcrafted with bespoke excellence. All rights reserved.',
  'https://instagram.com/royal_web_creations',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920',
  'Elevate Your Everyday',
  'LUXURY FINE JEWELRY & ACCESSORIES',
  'Explore Collection',
  '#categories',
  'Express Shipping',
  'Free shipping across India',
  '100% Certified',
  'Authentic quality guaranteed',
  'WhatsApp Assistance',
  'Direct seller chat & sizing help',
  'Easy Returns',
  'Hassle-free replacement policy',
  'Shop by Category',
  'CURATED COLLECTIONS',
  true,
  'Shop Our Top Picks',
  'HANDPICKED FAVORITES',
  'Top Picks',
  'Trending',
  'New Arrivals',
  'Best Sellers',
  'top_picks',
  true
) ON CONFLICT (id) DO UPDATE SET
  contact_email = EXCLUDED.contact_email,
  contact_number = EXCLUDED.contact_number,
  whatsapp_number = EXCLUDED.whatsapp_number,
  instagram_url = EXCLUDED.instagram_url;

-- 6.2 Default Homepage Sections (Drag-and-Drop Order)
INSERT INTO public.homepage_sections (section_type, display_order, is_enabled, settings)
SELECT 'hero', 0, true, '{"title": "Elevate Your Everyday", "subtitle": "LUXURY FINE JEWELRY & ACCESSORIES", "button_text": "Explore Collection", "button_link": "#categories"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_type = 'hero');

INSERT INTO public.homepage_sections (section_type, display_order, is_enabled, settings)
SELECT 'categories', 1, true, '{"title": "Shop by Category", "subtitle": "CURATED COLLECTIONS"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_type = 'categories');

INSERT INTO public.homepage_sections (section_type, display_order, is_enabled, settings)
SELECT 'trending_products', 2, true, '{"title": "Shop Our Top Picks", "subtitle": "HANDPICKED FAVORITES"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_type = 'trending_products');

INSERT INTO public.homepage_sections (section_type, display_order, is_enabled, settings)
SELECT 'featured_products', 3, true, '{"title": "Featured Masterpieces", "subtitle": "TIMELUXE CREATIONS"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_type = 'featured_products');

INSERT INTO public.homepage_sections (section_type, display_order, is_enabled, settings)
SELECT 'testimonials', 4, true, '{"title": "Client Stories", "subtitle": "VERIFIED BUYERS"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_type = 'testimonials');

INSERT INTO public.homepage_sections (section_type, display_order, is_enabled, settings)
SELECT 'newsletter', 5, true, '{"title": "Join the Inner Circle", "subtitle": "VIP EXCLUSIVE PRIVILEGES"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_type = 'newsletter');

-- 6.3 Default Categories (Curated with User's Categories)
INSERT INTO public.categories (name, slug, description, image_url, display_order, is_active, is_featured)
VALUES 
  ('Turkish Cord Sets', 'turkish-cord-sets', 'Comfortable, stylish, and premium Turkish cord set collections', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', 1, true, true),
  ('Party Wear Hijab Caps', 'party-wear-hijab-caps', 'Intricately embellished and stone-studded luxury hijab caps', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', 2, true, true),
  ('Premium Jersey Hijab', 'premium-jersey-hijab', 'Breathable 4-way stretch premium jersey hijabs for everyday elegance', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80', 3, true, true),
  ('New Arrivals', 'new-arrivals', 'Fresh designer drops and newest handcrafted seasonal arrivals', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', 4, true, true),
  ('Abayas', 'abayas', 'Flowing Dubai and Turkish cut bespoke luxury abayas', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80', 5, true, true),
  ('Clothing', 'clothing', 'Curated modish dresses, tunics, and co-ord ensembles', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', 6, true, true),
  ('Hijabs & Accessories', 'hijabs-accessories', 'Magnetic hijab pins, scrunchies, and chiffon stoles', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', 7, true, true),
  ('Skincare & Personal Care', 'skincare-personal-care', 'Organic, halal-certified essential oils, mists, and luxury perfumes', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', 8, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 6.4 Starter Products
INSERT INTO public.products (
  name, slug, description, selling_price, price, mrp, stock, status, is_featured, is_trending, is_new_arrival, is_best_seller, thumbnail, tags
) VALUES 
  (
    'Eternal Bond Personalized Couples Bracelet Set',
    'eternal-bond-personalized-couples-bracelet-set',
    'Handcrafted stainless steel engraved luxury cuff with magnetic clasp and custom lettering. 100% hypoallergenic and water-resistant.',
    1496.97, 1496.97, 2397.00, 24, 'active', true, true, false, true,
    'https://images.unsplash.com/photo-1611591475816-787627447432?auto=format&fit=crop&q=80&w=800',
    ARRAY['bracelet', 'bestseller', 'couples', 'gift']
  ),
  (
    'The Apex Bar Link Chain',
    'the-apex-bar-link-chain',
    'Italian mirror-finish geometric bar link chain in surgical grade stainless steel. Does not fade or tarnish.',
    148.99, 148.99, 219.00, 38, 'active', true, true, true, false,
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    ARRAY['chain', 'necklace', 'trending', 'mens', 'unisex']
  ),
  (
    'Urban Snake Chain for Men',
    'urban-snake-chain-for-men',
    'High-polish flexible 4mm snake weave chain designed for heavy-duty daily wear and timeless luxury.',
    148.99, 148.99, 219.00, 42, 'active', true, false, true, false,
    'https://images.unsplash.com/photo-1611591475165-da255c4d0089?auto=format&fit=crop&q=80&w=800',
    ARRAY['chain', 'snake-chain', 'stainless-steel']
  ),
  (
    'A Woven Dream Catcher 3"',
    'a-woven-dream-catcher-3-inch',
    'Hand-knotted feather and turquoise bead talisman. Perfectly suited for car mirrors, rooms, and accessories.',
    198.00, 198.00, 297.00, 15, 'active', false, false, false, false,
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    ARRAY['hanger', 'accessory', 'dreamcatcher']
  ),
  (
    'Pure Pearl Floral Pendant Necklace',
    'pure-pearl-floral-pendant-necklace',
    'Natural cultured freshwater pearl with 18k rose gold-plated floral filigree setting. Includes adjustable chain.',
    899.00, 899.00, 1499.00, 18, 'active', true, true, true, true,
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    ARRAY['pearl', 'necklace', 'floral', 'luxury']
  ),
  (
    'Crescent Moon Celestial Gold Choker',
    'crescent-moon-celestial-gold-choker',
    'Delicate starburst engraved crescent moon charm in rich 22k gold PVD finish.',
    649.00, 649.00, 999.00, 29, 'active', true, false, true, true,
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    ARRAY['gold', 'choker', 'moon', 'celestial']
  )
ON CONFLICT (slug) DO UPDATE SET
  selling_price = EXCLUDED.selling_price,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  stock = EXCLUDED.stock,
  thumbnail = EXCLUDED.thumbnail;

-- 6.5 Default CMS Pages
INSERT INTO public.pages (slug, title, content, is_published, seo_title, seo_description)
VALUES 
  (
    'about-us',
    'About Us',
    '<h2>The Royal Standard of Excellence</h2><p>Welcome to our boutique. We curate bespoke handcrafted masterworks, luxury jewelry, and fine accessories with uncompromising attention to detail.</p><p>Every order is handled with white-glove packaging, direct WhatsApp support, and fast insured dispatch.</p>',
    true,
    'About Us | Royal Heritage & Fine Craftsmanship',
    'Discover our heritage, master artisan craftsmanship, and direct concierge service.'
  ),
  (
    'contact',
    'Contact Us',
    '<h2>We are here to assist you</h2><p>Have sizing questions, custom bespoke requests, or want live video assistance? Reach out to our concierge:</p><p><strong>WhatsApp:</strong> +91 9421776463<br><strong>Email:</strong> royalwebcreations28@gmail.com<br><strong>Location:</strong> Mumbai, Maharashtra, India</p>',
    true,
    'Contact Us | Royal Concierge Support',
    'Connect directly with our support team via WhatsApp and email.'
  ),
  (
    'privacy-policy',
    'Privacy Policy',
    '<h2>Your Privacy Matters</h2><p>We respect your privacy and never sell or share your personal information. Customer details are securely encrypted and used strictly for fulfilling and delivering your orders.</p>',
    true,
    'Privacy Policy',
    'Our commitment to data protection, encryption, and customer privacy.'
  ),
  (
    'terms-of-service',
    'Terms of Service',
    '<h2>Terms & Conditions</h2><p>By browsing our catalog or placing orders, you agree to our standard terms of purchase, authentic quality warranties, and dispatch guidelines.</p>',
    true,
    'Terms of Service',
    'Terms of service, warranty, and customer purchase conditions.'
  ),
  (
    'shipping-returns',
    'Shipping & Returns Policy',
    '<h2>Insured Express Dispatch & Easy Replacements</h2><p>We provide insured delivery across India. Orders above ₹1,000 qualify for 100% Free Express Shipping. In the rare event of damaged transit, we offer a hassle-free 7-day replacement policy.</p>',
    true,
    'Shipping & Returns Policy',
    'Delivery timelines, express tracking, and replacement policies.'
  )
ON CONFLICT (slug) DO NOTHING;

-- 6.6 Starter Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active, usage_limit)
VALUES 
  ('WELCOME10', 'percentage', 10, 500, true, 1000),
  ('ROYAL50', 'fixed', 50, 499, true, 500),
  ('FESTIVE20', 'percentage', 20, 1200, true, 200)
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. RELOAD SCHEMA CACHE
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- Done! Your Supabase database is now completely initialized and ready for production.
