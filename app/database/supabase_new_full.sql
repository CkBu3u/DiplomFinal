-- ============================================
-- AutoHub — полная схема и тестовые данные
-- Проект Supabase: xkqddgpkuuuafkowfoft
-- Выполнить в SQL Editor целиком
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ПОЛЬЗОВАТЕЛИ (профили; авторизация в auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  user_type VARCHAR(20) DEFAULT 'private' CHECK (user_type IN ('private', 'dealer', 'company')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  city VARCHAR(100),
  region VARCHAR(100)
);

-- Триггер: создание профиля при регистрации через Supabase Auth
-- (id в public.users совпадает с auth.uid() для залогиненных пользователей)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. МАРКИ АВТО
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  country VARCHAR(100),
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. МОДЕЛИ
-- ============================================
CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  body_type VARCHAR(50),
  year_from INTEGER,
  year_to INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ОБЪЯВЛЕНИЯ
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES brands(id),
  model_id INTEGER REFERENCES models(id),
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  body_type VARCHAR(50),
  engine_type VARCHAR(50),
  engine_volume DECIMAL(3,1),
  engine_power INTEGER,
  transmission VARCHAR(50),
  drive_type VARCHAR(50),
  mileage INTEGER,
  condition VARCHAR(50) DEFAULT 'used' CHECK (condition IN ('new', 'used')),
  owners_count INTEGER DEFAULT 1,
  color VARCHAR(50),
  color_metallic BOOLEAN DEFAULT FALSE,
  city VARCHAR(100),
  region VARCHAR(100),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'moderated', 'rejected')),
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  contact_phone VARCHAR(20),
  contact_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT valid_price CHECK (price > 0),
  CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1)
);

-- ============================================
-- 5. ФОТО ОБЪЯВЛЕНИЙ
-- ============================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ИЗБРАННОЕ
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- 7. СООБЩЕНИЯ
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. ПРОСМОТРЫ (опционально)
-- ============================================
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. КОМПЛЕКТАЦИЯ
-- ============================================
CREATE TABLE IF NOT EXISTS features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  icon_url TEXT
);

CREATE TABLE IF NOT EXISTS listing_features (
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, feature_id)
);

-- ============================================
-- 10. ОТЗЫВЫ (опционально)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand_id);
CREATE INDEX IF NOT EXISTS idx_listings_model ON listings(model_id);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_premium ON listings(is_premium) WHERE is_premium = TRUE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- brands, models — чтение всем
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands_select_all" ON brands FOR SELECT USING (true);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "models_select_all" ON models FOR SELECT USING (true);

-- listings — активные видят все; свои может менять владелец
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_select_active" ON listings FOR SELECT USING (status = 'active');
CREATE POLICY "listings_insert_own" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_update_own" ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings_delete_own" ON listings FOR DELETE USING (auth.uid() = user_id);

-- users — свой профиль
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- listing_images — видят все (для карточек)
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listing_images_select_all" ON listing_images FOR SELECT USING (true);
CREATE POLICY "listing_images_insert_own" ON listing_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND user_id = auth.uid())
);

-- favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_own" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================
-- ФУНКЦИЯ ПРОСМОТРОВ
-- ============================================
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings SET views_count = views_count + 1 WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ: МАРКИ
-- ============================================
INSERT INTO brands (name, country, is_popular, logo_url) VALUES
('Toyota', 'Япония', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/120px-Toyota_carlogo.svg.png'),
('Honda', 'Япония', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/120px-Honda.svg.png'),
('BMW', 'Германия', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/120px-BMW.svg.png'),
('Mercedes-Benz', 'Германия', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/120px-Mercedes-Logo.svg.png'),
('Audi', 'Германия', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi_logo.svg/120px-Audi_logo.svg.png'),
('Volkswagen', 'Германия', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/120px-Volkswagen_logo_2019.svg.png'),
('Ford', 'США', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/120px-Ford_logo_flat.svg.png'),
('Hyundai', 'Южная Корея', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hyundai_Motor_Company_logo.svg/120px-Hyundai_Motor_Company_logo.svg.png'),
('Kia', 'Южная Корея', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_Motors.svg/120px-Kia_Motors.svg.png'),
('Nissan', 'Япония', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/120px-Nissan_logo.png'),
('Mazda', 'Япония', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mazda_logo.svg/120px-Mazda_logo.svg.png'),
('Lexus', 'Япония', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Lexus_logo.svg/120px-Lexus_logo.svg.png'),
('Volvo', 'Швеция', false, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Volvo_logo.svg/120px-Volvo_logo.svg.png'),
('Skoda', 'Чехия', false, NULL),
('Renault', 'Франция', false, NULL),
('Peugeot', 'Франция', false, NULL),
('Subaru', 'Япония', false, NULL),
('Mitsubishi', 'Япония', false, NULL)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ: МОДЕЛИ
-- ============================================
INSERT INTO models (brand_id, name, body_type, year_from, year_to) VALUES
((SELECT id FROM brands WHERE name = 'Toyota'), 'Camry', 'sedan', 1982, 2025),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Corolla', 'sedan', 1966, 2025),
((SELECT id FROM brands WHERE name = 'Toyota'), 'RAV4', 'suv', 1994, 2025),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Land Cruiser', 'suv', 1951, 2025),
((SELECT id FROM brands WHERE name = 'BMW'), '3 Series', 'sedan', 1975, 2025),
((SELECT id FROM brands WHERE name = 'BMW'), '5 Series', 'sedan', 1972, 2025),
((SELECT id FROM brands WHERE name = 'BMW'), 'X5', 'suv', 1999, 2025),
((SELECT id FROM brands WHERE name = 'BMW'), 'X3', 'suv', 2003, 2025),
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'C-Class', 'sedan', 1993, 2025),
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'E-Class', 'sedan', 1993, 2025),
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLC', 'suv', 2015, 2025),
((SELECT id FROM brands WHERE name = 'Audi'), 'A4', 'sedan', 1994, 2025),
((SELECT id FROM brands WHERE name = 'Audi'), 'A6', 'sedan', 1994, 2025),
((SELECT id FROM brands WHERE name = 'Audi'), 'Q5', 'suv', 2008, 2025),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Golf', 'hatchback', 1974, 2025),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Passat', 'sedan', 1973, 2025),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Tiguan', 'suv', 2007, 2025),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Solaris', 'sedan', 2010, 2025),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Creta', 'suv', 2014, 2025),
((SELECT id FROM brands WHERE name = 'Kia'), 'Rio', 'sedan', 1999, 2025),
((SELECT id FROM brands WHERE name = 'Kia'), 'Sportage', 'suv', 1993, 2025),
((SELECT id FROM brands WHERE name = 'Nissan'), 'Qashqai', 'suv', 2006, 2025),
((SELECT id FROM brands WHERE name = 'Nissan'), 'X-Trail', 'suv', 2000, 2025);

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ: ПРОФИЛИ (для объявлений)
-- В реальности создаются триггером при регистрации.
-- Эти UUID — заглушки для тестовых объявлений (без входа в аккаунт).
-- ============================================
INSERT INTO users (id, email, first_name, last_name, user_type, city) VALUES
('a0000001-0000-4000-8000-000000000001'::uuid, 'seller1@example.com', 'Алексей', 'Иванов', 'private', 'Москва'),
('a0000002-0000-4000-8000-000000000002'::uuid, 'seller2@example.com', 'Мария', 'Петрова', 'private', 'Санкт-Петербург'),
('a0000003-0000-4000-8000-000000000003'::uuid, 'dealer@example.com', 'АвтоМир', 'ООО', 'dealer', 'Москва')
ON CONFLICT (id) DO NOTHING;

-- ТЕСТОВЫЕ ОБЪЯВЛЕНИЯ (картинки — Unsplash)
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, transmission, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name) 
SELECT 'a0000001-0000-4000-8000-000000000001'::uuid, b.id, (SELECT id FROM models WHERE name = 'Camry' AND brand_id = b.id LIMIT 1), 2022, 2850000, 'sedan', 'gasoline', 2.5, 'automatic', 35000, 'Москва', 'Toyota Camry 2022', 'Полная комплектация, один владелец, сервис у дилера.', 'active', true, 120, '+7 999 111-22-33', 'Алексей' FROM brands b WHERE b.name = 'Toyota' LIMIT 1;
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, transmission, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name) 
SELECT 'a0000001-0000-4000-8000-000000000001'::uuid, b.id, (SELECT id FROM models WHERE name = '3 Series' AND brand_id = b.id LIMIT 1), 2020, 3200000, 'sedan', 'gasoline', 2.0, 'automatic', 42000, 'Москва', 'BMW 3 Series 2020', 'M-пакет, кожа, подогревы.', 'active', false, 89, '+7 999 111-22-33', 'Алексей' FROM brands b WHERE b.name = 'BMW' LIMIT 1;
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, transmission, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name) 
SELECT 'a0000002-0000-4000-8000-000000000002'::uuid, b.id, (SELECT id FROM models WHERE name = 'C-Class' AND brand_id = b.id LIMIT 1), 2021, 4100000, 'sedan', 'gasoline', 2.0, 'automatic', 28000, 'Санкт-Петербург', 'Mercedes-Benz C-Class 2021', 'AMG Line, панорама.', 'active', true, 210, '+7 912 333-44-55', 'Мария' FROM brands b WHERE b.name = 'Mercedes-Benz' LIMIT 1;
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, transmission, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name) 
SELECT 'a0000002-0000-4000-8000-000000000002'::uuid, b.id, (SELECT id FROM models WHERE name = 'Creta' AND brand_id = b.id LIMIT 1), 2023, 1850000, 'suv', 'gasoline', 2.0, 'automatic', 15000, 'Санкт-Петербург', 'Hyundai Creta 2023', 'В топе, гарантия.', 'active', false, 56, '+7 912 333-44-55', 'Мария' FROM brands b WHERE b.name = 'Hyundai' LIMIT 1;
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, transmission, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name) 
SELECT 'a0000003-0000-4000-8000-000000000003'::uuid, b.id, (SELECT id FROM models WHERE name = 'A4' AND brand_id = b.id LIMIT 1), 2019, 2650000, 'sedan', 'gasoline', 2.0, 'automatic', 65000, 'Москва', 'Audi A4 2019', 'Дилерский автомобиль, полная история.', 'active', true, 178, '+7 495 000-00-00', 'АвтоМир' FROM brands b WHERE b.name = 'Audi' LIMIT 1;

-- Фото к объявлениям (Unsplash)
INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=800', true, 0 FROM listings WHERE title = 'Toyota Camry 2022' LIMIT 1;
INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1555215695-3004980adade?w=800', true, 0 FROM listings WHERE title = 'BMW 3 Series 2020' LIMIT 1;
INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', true, 0 FROM listings WHERE title = 'Mercedes-Benz C-Class 2021' LIMIT 1;
INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', true, 0 FROM listings WHERE title = 'Hyundai Creta 2023' LIMIT 1;
INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800', true, 0 FROM listings WHERE title = 'Audi A4 2019' LIMIT 1;

-- ============================================
-- КОМПЛЕКТАЦИЯ (справочник)
-- ============================================
INSERT INTO features (name, category) VALUES
('Кондиционер', 'comfort'), ('Климат-контроль', 'comfort'), ('Подогрев сидений', 'comfort'),
('Круиз-контроль', 'comfort'), ('Парктроники', 'safety'), ('Камера заднего вида', 'safety'),
('ABS', 'safety'), ('ESP', 'safety'), ('Bluetooth', 'multimedia'), ('Навигация', 'multimedia')
ON CONFLICT (name) DO NOTHING;
