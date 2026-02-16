-- ============================================
-- Заполнение БД тестовыми объявлениями (10 шт.)
-- ============================================
-- Требуется: таблицы brands, models, users уже заполнены
-- (например, выполнены разделы «ТЕСТОВЫЕ ДАННЫЕ» из supabase_new_full.sql).
-- user_id: для всех объявлений используется первый пользователь из users.
-- ============================================

-- 1. Toyota RAV4 2023
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'RAV4' AND brand_id = b.id LIMIT 1), 2023, 3450000, 'suv', 'gasoline', 2.5, 249, 'automatic', 'full', 12000, 'Москва', 'Toyota RAV4 2023', 'Полный привод, премиум-комплектация, один владелец, гарантия до 2026.', 'active', true, 0, '+7 999 111-22-33', 'Алексей', 'Белый'
FROM brands b WHERE b.name = 'Toyota' LIMIT 1;

-- 2. Volkswagen Golf 2021
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'Golf' AND brand_id = b.id LIMIT 1), 2021, 1890000, 'hatchback', 'gasoline', 1.4, 150, 'robot', 'front', 38000, 'Санкт-Петербург', 'Volkswagen Golf 2021', 'Роботизированная КПП, климат, круиз, парктроник.', 'active', false, 0, '+7 912 333-44-55', 'Мария', 'Серый'
FROM brands b WHERE b.name = 'Volkswagen' LIMIT 1;

-- 3. Kia Sportage 2022
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'Sportage' AND brand_id = b.id LIMIT 1), 2022, 2650000, 'suv', 'diesel', 2.0, 186, 'automatic', 'full', 22000, 'Москва', 'Kia Sportage 2022 дизель', 'Дизель, полный привод, панорама, подогревы, один владелец.', 'active', true, 0, '+7 495 000-00-00', 'АвтоМир', 'Чёрный'
FROM brands b WHERE b.name = 'Kia' LIMIT 1;

-- 4. Nissan X-Trail 2020
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'X-Trail' AND brand_id = b.id LIMIT 1), 2020, 2150000, 'suv', 'gasoline', 2.5, 171, 'cvt', 'part', 54000, 'Казань', 'Nissan X-Trail 2020', 'Подключаемый полный привод, вариатор, климат, камера.', 'active', false, 0, '+7 843 111-22-33', 'Дмитрий', 'Серебристый'
FROM brands b WHERE b.name = 'Nissan' LIMIT 1;

-- 5. Hyundai Solaris 2024
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'Solaris' AND brand_id = b.id LIMIT 1), 2024, 1450000, 'sedan', 'gasoline', 1.6, 123, 'automatic', 'front', 5000, 'Москва', 'Hyundai Solaris 2024', 'Почти новый, гарантия, полная комплектация.', 'active', false, 0, '+7 999 111-22-33', 'Алексей', 'Белый'
FROM brands b WHERE b.name = 'Hyundai' LIMIT 1;

-- 6. BMW X5 2021
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'X5' AND brand_id = b.id LIMIT 1), 2021, 5890000, 'suv', 'gasoline', 3.0, 340, 'automatic', 'full', 31000, 'Санкт-Петербург', 'BMW X5 2021 xDrive30d', 'M Sport, пакет комфорта, панорамная крыша, кожа.', 'active', true, 0, '+7 912 333-44-55', 'Мария', 'Синий'
FROM brands b WHERE b.name = 'BMW' LIMIT 1;

-- 7. Audi Q5 2019
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'Q5' AND brand_id = b.id LIMIT 1), 2019, 3290000, 'suv', 'gasoline', 2.0, 249, 'automatic', 'full', 72000, 'Москва', 'Audi Q5 2019', 'Quattro, полная история обслуживания у дилера.', 'active', false, 0, '+7 495 000-00-00', 'АвтоМир', 'Серый'
FROM brands b WHERE b.name = 'Audi' LIMIT 1;

-- 8. Mercedes-Benz E-Class 2020
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'E-Class' AND brand_id = b.id LIMIT 1), 2020, 4250000, 'sedan', 'gasoline', 2.0, 258, 'automatic', 'rear', 45000, 'Москва', 'Mercedes-Benz E 200 2020', 'AMG Line, мультимедиа, подогревы, без ДТП.', 'active', true, 0, '+7 999 111-22-33', 'Алексей', 'Чёрный'
FROM brands b WHERE b.name = 'Mercedes-Benz' LIMIT 1;

-- 9. Toyota Corolla 2022
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'Corolla' AND brand_id = b.id LIMIT 1), 2022, 1680000, 'sedan', 'gasoline', 1.6, 122, 'cvt', 'front', 28000, 'Новосибирск', 'Toyota Corolla 2022', 'Надёжный седан, экономичный, один владелец.', 'active', false, 0, '+7 913 444-55-66', 'Ольга', 'Красный'
FROM brands b WHERE b.name = 'Toyota' LIMIT 1;

-- 10. Volkswagen Passat 2019
INSERT INTO listings (user_id, brand_id, model_id, year, price, body_type, engine_type, engine_volume, engine_power, transmission, drive_type, mileage, city, title, description, status, is_premium, views_count, contact_phone, contact_name, color)
SELECT (SELECT id FROM users ORDER BY id LIMIT 1), b.id, (SELECT id FROM models WHERE name = 'Passat' AND brand_id = b.id LIMIT 1), 2019, 1650000, 'sedan', 'gasoline', 1.8, 180, 'automatic', 'front', 89000, 'Екатеринбург', 'Volkswagen Passat 2019', 'Комфортный седан для семьи, полная комплектация.', 'active', false, 0, '+7 343 777-88-99', 'Сервис Авто', 'Бежевый'
FROM brands b WHERE b.name = 'Volkswagen' LIMIT 1;

-- ============================================
-- Фото к объявлениям (по одному главному на каждое)
-- ============================================
INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', true, 0 FROM listings WHERE title = 'Toyota RAV4 2023' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', true, 0 FROM listings WHERE title = 'Volkswagen Golf 2021' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', true, 0 FROM listings WHERE title = 'Kia Sportage 2022 дизель' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', true, 0 FROM listings WHERE title = 'Nissan X-Trail 2020' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800', true, 0 FROM listings WHERE title = 'Hyundai Solaris 2024' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1555215695-3004980adade?w=800', true, 0 FROM listings WHERE title = 'BMW X5 2021 xDrive30d' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800', true, 0 FROM listings WHERE title = 'Audi Q5 2019' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', true, 0 FROM listings WHERE title = 'Mercedes-Benz E 200 2020' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=800', true, 0 FROM listings WHERE title = 'Toyota Corolla 2022' ORDER BY created_at DESC LIMIT 1;

INSERT INTO listing_images (listing_id, image_url, is_main, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800', true, 0 FROM listings WHERE title = 'Volkswagen Passat 2019' ORDER BY created_at DESC LIMIT 1;
