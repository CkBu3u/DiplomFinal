-- ============================================
-- AutoHub Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  user_type VARCHAR(20) DEFAULT 'private',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  city VARCHAR(100),
  region VARCHAR(100)
);

-- ============================================
-- 2. ТАБЛИЦА МАРОК АВТО (brands)
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  country VARCHAR(100),
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. ТАБЛИЦА МОДЕЛЕЙ (models)
-- ============================================
CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  body_type VARCHAR(50),
  year_from INTEGER,
  year_to INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. ТАБЛИЦА ОБЪЯВЛЕНИЙ (listings) - ГЛАВНАЯ
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  brand_id INTEGER REFERENCES brands(id),
  model_id INTEGER REFERENCES models(id),
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  
  -- Технические характеристики
  body_type VARCHAR(50),
  engine_type VARCHAR(50),
  engine_volume DECIMAL(3,1),
  engine_power INTEGER,
  transmission VARCHAR(50),
  drive_type VARCHAR(50),
  
  -- Состояние и пробег
  mileage INTEGER,
  condition VARCHAR(50) DEFAULT 'used',
  owners_count INTEGER DEFAULT 1,
  
  -- Внешний вид
  color VARCHAR(50),
  color_metallic BOOLEAN DEFAULT FALSE,
  
  -- Расположение
  city VARCHAR(100),
  region VARCHAR(100),
  
  -- Описание и медиа
  title VARCHAR(255),
  description TEXT,
  
  -- Статус и модерация
  status VARCHAR(50) DEFAULT 'active',
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  
  -- Контакты
  contact_phone VARCHAR(20),
  contact_name VARCHAR(100),
  
  -- Метаданные
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  -- Индексы для поиска
  CONSTRAINT valid_price CHECK (price > 0),
  CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1)
);

-- ============================================
-- 5. ТАБЛИЦА ФОТОГРАФИЙ (listing_images)
-- ============================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. ТАБЛИЦА ИЗБРАННОГО (favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- 7. ТАБЛИЦА СООБЩЕНИЙ/ЧАТА (messages)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. ТАБЛИЦА ПРОСМОТРОВ (listing_views)
-- ============================================
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. ТАБЛИЦА КОМПЛЕКТАЦИИ (features)
-- ============================================
CREATE TABLE IF NOT EXISTS features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  icon_url TEXT
);

-- ============================================
-- 10. ТАБЛИЦА СВЯЗИ ОБЪЯВЛЕНИЙ И КОМПЛЕКТАЦИИ
-- ============================================
CREATE TABLE IF NOT EXISTS listing_features (
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, feature_id)
);

-- ============================================
-- 11. ТАБЛИЦА ОТЗЫВОВ О ПРОДАВЦАХ (reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ ПОИСКА
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
-- ПОЛНОТЕКСТОВЫЙ ПОИСК
-- ============================================
ALTER TABLE listings DROP COLUMN IF EXISTS search_vector;
ALTER TABLE listings ADD COLUMN search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN(search_vector);

-- Триггер для обновления поискового вектора
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('russian', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('russian', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('russian', COALESCE(NEW.city, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_search_vector ON listings;
CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- ============================================
-- RLS ПОЛИТИКИ БЕЗОПАСНОСТИ
-- ============================================
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Политики для listings
DROP POLICY IF EXISTS "Active listings visible to all" ON listings;
CREATE POLICY "Active listings visible to all" ON listings
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can edit own listings" ON listings;
CREATE POLICY "Users can edit own listings" ON listings
  FOR ALL USING (user_id = auth.uid());

-- Политики для users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Политики для favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- Политики для messages
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ============================================
-- ФУНКЦИЯ ДЛЯ УВЕЛИЧЕНИЯ ПРОСМОТРОВ
-- ============================================
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings 
  SET views_count = views_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ - МАРКИ АВТО
-- ============================================
INSERT INTO brands (name, country, is_popular) VALUES
('Toyota', 'Япония', true),
('Honda', 'Япония', true),
('BMW', 'Германия', true),
('Mercedes-Benz', 'Германия', true),
('Audi', 'Германия', true),
('Volkswagen', 'Германия', true),
('Ford', 'США', true),
('Chevrolet', 'США', true),
('Hyundai', 'Южная Корея', true),
('Kia', 'Южная Корея', true),
('Nissan', 'Япония', true),
('Mazda', 'Япония', true),
('Lexus', 'Япония', true),
('Volvo', 'Швеция', false),
('Skoda', 'Чехия', false),
('Renault', 'Франция', false),
('Peugeot', 'Франция', false),
('Citroen', 'Франция', false),
('Subaru', 'Япония', false),
('Mitsubishi', 'Япония', false)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ - МОДЕЛИ
-- ============================================
INSERT INTO models (brand_id, name, body_type, year_from, year_to) VALUES
-- Toyota
((SELECT id FROM brands WHERE name = 'Toyota'), 'Camry', 'sedan', 1982, 2024),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Corolla', 'sedan', 1966, 2024),
((SELECT id FROM brands WHERE name = 'Toyota'), 'RAV4', 'suv', 1994, 2024),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Land Cruiser', 'suv', 1951, 2024),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Hilux', 'pickup', 1968, 2024),
-- BMW
((SELECT id FROM brands WHERE name = 'BMW'), '3 Series', 'sedan', 1975, 2024),
((SELECT id FROM brands WHERE name = 'BMW'), '5 Series', 'sedan', 1972, 2024),
((SELECT id FROM brands WHERE name = 'BMW'), 'X5', 'suv', 1999, 2024),
((SELECT id FROM brands WHERE name = 'BMW'), 'X3', 'suv', 2003, 2024),
-- Mercedes
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'C-Class', 'sedan', 1993, 2024),
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'E-Class', 'sedan', 1993, 2024),
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLC', 'suv', 2015, 2024),
((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLE', 'suv', 2015, 2024),
-- Audi
((SELECT id FROM brands WHERE name = 'Audi'), 'A4', 'sedan', 1994, 2024),
((SELECT id FROM brands WHERE name = 'Audi'), 'A6', 'sedan', 1994, 2024),
((SELECT id FROM brands WHERE name = 'Audi'), 'Q5', 'suv', 2008, 2024),
((SELECT id FROM brands WHERE name = 'Audi'), 'Q7', 'suv', 2005, 2024),
-- Volkswagen
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Golf', 'hatchback', 1974, 2024),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Passat', 'sedan', 1973, 2024),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Tiguan', 'suv', 2007, 2024),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Polo', 'hatchback', 1975, 2024),
-- Hyundai
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Solaris', 'sedan', 2010, 2024),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Creta', 'suv', 2014, 2024),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Tucson', 'suv', 2004, 2024),
-- Kia
((SELECT id FROM brands WHERE name = 'Kia'), 'Rio', 'sedan', 1999, 2024),
((SELECT id FROM brands WHERE name = 'Kia'), 'Sportage', 'suv', 1993, 2024),
((SELECT id FROM brands WHERE name = 'Kia'), 'Seltos', 'suv', 2019, 2024),
-- Nissan
((SELECT id FROM brands WHERE name = 'Nissan'), 'Qashqai', 'suv', 2006, 2024),
((SELECT id FROM brands WHERE name = 'Nissan'), 'X-Trail', 'suv', 2000, 2024),
((SELECT id FROM brands WHERE name = 'Nissan'), 'Teana', 'sedan', 2003, 2024);

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ - КОМПЛЕКТАЦИЯ
-- ============================================
INSERT INTO features (name, category) VALUES
-- Комфорт
('Кондиционер', 'comfort'),
('Климат-контроль', 'comfort'),
('Кожаный салон', 'comfort'),
('Подогрев сидений', 'comfort'),
('Вентиляция сидений', 'comfort'),
('Панорамная крыша', 'comfort'),
('Электропривод сидений', 'comfort'),
('Круиз-контроль', 'comfort'),
('Адаптивный круиз-контроль', 'comfort'),
('Бесключевой доступ', 'comfort'),
-- Безопасность
('ABS', 'safety'),
('ESP', 'safety'),
('Подушки безопасности', 'safety'),
('Боковые подушки', 'safety'),
('Шторки безопасности', 'safety'),
('Датчик давления в шинах', 'safety'),
('Камера заднего вида', 'safety'),
('Парктроники', 'safety'),
('Система контроля полосы', 'safety'),
('Автоматическое торможение', 'safety'),
-- Мультимедиа
('Bluetooth', 'multimedia'),
('Apple CarPlay', 'multimedia'),
('Android Auto', 'multimedia'),
('Навигация', 'multimedia'),
('Premium аудио', 'multimedia'),
('Беспроводная зарядка', 'multimedia'),
('USB-порты', 'multimedia'),
-- Свет
('Светодиодные фары', 'lighting'),
('Адаптивные фары', 'lighting'),
('Противотуманные фары', 'lighting'),
('Дневные ходовые огни', 'lighting'),
-- Другое
('Алюминиевые диски', 'wheels'),
('Зимняя резина', 'wheels'),
('Фаркоп', 'other'),
('Рейлинги на крыше', 'other')
ON CONFLICT DO NOTHING;
