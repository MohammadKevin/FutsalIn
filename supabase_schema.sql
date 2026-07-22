-- ========================================================
-- FutsalIn Database Schema for Supabase
-- Copy and run this script in Supabase SQL Editor
-- ========================================================

-- 1. Table: Courts
CREATE TABLE IF NOT EXISTS public.courts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  floor TEXT NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  recommended_for TEXT,
  lighting TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Courts Data
INSERT INTO public.courts (name, floor, size, price, image, tagline, description, features, recommended_for, lighting)
VALUES
(
  'Lapangan Standar Interlock',
  'Polypropylene Interlock',
  '25m x 15m',
  150000,
  '/img/13c3423cd3d2e12a6087d33e14093615.jpg',
  'Permukaan Anti-Slip & Shock Absorption',
  'Lapangan modular Interlock berstandar nasional. Sangat nyaman untuk permainan cepat dengan traksi tinggi.',
  ARRAY['Matras Interlock Premium', 'Pencahayaan LED 400 Lux', 'Jaring Pengaman High Density', 'Garis Batas Standar VNL'],
  'Latihan Rutin, Sparring Kasual, Komunitas',
  'LED Day-bright 400 Lux'
),
(
  'Lapangan Vinyl Deluxe',
  'Vinyl Premium 8mm',
  '25m x 15m',
  200000,
  '/img/sintetis.jpg',
  'Empuk & Pantulan Bola Lebih Stabil',
  'Lantai Vinyl multilayer kualitas terbaik dengan bantalan empuk. Ideal untuk gaya permainan teknikal.',
  ARRAY['Vinyl Multilayer 8mm', 'Shock Absorption System', 'Digital Scoreboard Display', 'Sound System Surround'],
  'Turnamen Komunitas, Sparring Resmi, Akademi',
  'LED Pro Stadium 600 Lux'
),
(
  'Lapangan Premier International',
  'Parquet Kayu Hard Maple',
  '30m x 20m',
  250000,
  '/img/outdor.jpg',
  'Spesifikasi Kelas Dunia Futsal Profesional',
  'Lapangan Parquet Kayu standar FIFA dengan ukuran terluas 30m x 20m. Menyajikan estetika arena kelas profesional.',
  ARRAY['Lantai Parquet Hard Maple FIFA', 'Tribun Penonton VIP', 'Broadcasting LED Lighting 800 Lux', 'Ruang Ganti Ber-AC & Shower Hot/Cold'],
  'Turnamen Profesional, Event Resmi, Liga Futsal',
  'Broadcast LED Stadium 800 Lux'
)
ON CONFLICT DO NOTHING;

-- 2. Table: Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  court_id BIGINT REFERENCES public.courts(id),
  court_name TEXT NOT NULL,
  date DATE NOT NULL,
  slots TEXT[] NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  addons TEXT[] DEFAULT '{}',
  subtotal_court NUMERIC NOT NULL,
  subtotal_addons NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  voucher_code TEXT,
  status TEXT DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Demo Booking
INSERT INTO public.bookings (
  booking_code, court_id, court_name, date, slots, customer_name, customer_phone, customer_email, addons, subtotal_court, subtotal_addons, discount_amount, total_price, voucher_code, status
)
VALUES
(
  'FSI-DEMO01', 1, 'Lapangan Standar Interlock', CURRENT_DATE, ARRAY['19:00', '20:00'], 'Rizky Pratama', '081298765432', 'rizky@example.com', ARRAY['Rompi Tanding (2 Warna)'], 300000, 0, 30000, 270000, 'FUTSALIN10', 'PAID'
)
ON CONFLICT DO NOTHING;

-- 3. Enable RLS and Public Read Access
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public courts selection policy" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Public courts insertion policy" ON public.courts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public courts update policy" ON public.courts FOR UPDATE USING (true);
CREATE POLICY "Public bookings insertion policy" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public bookings selection policy" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public bookings update policy" ON public.bookings FOR UPDATE USING (true);
