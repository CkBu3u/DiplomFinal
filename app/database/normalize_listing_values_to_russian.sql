-- ============================================
-- Нормализация полей объявлений для корректного отображения на русском
-- ============================================
-- В приложении значения body_type, engine_type, transmission, drive_type
-- отображаются по-русски через словари (lib/utils.ts).
-- Если в БД попали значения на английском или с другой раскладкой,
-- этот скрипт приводит их к стандартным латинским ключам в нижнем регистре.
-- После этого интерфейс будет показывать: Автомат, Седан, Бензин и т.д.
-- ============================================

-- Коробка передач (transmission)
UPDATE listings SET transmission = 'manual'   WHERE LOWER(TRIM(transmission)) IN ('manual', 'механика', 'mechanic');
UPDATE listings SET transmission = 'automatic' WHERE LOWER(TRIM(transmission)) IN ('automatic', 'автомат', 'автоматическая');
UPDATE listings SET transmission = 'cvt'      WHERE LOWER(TRIM(transmission)) IN ('cvt', 'вариатор');
UPDATE listings SET transmission = 'robot'    WHERE LOWER(TRIM(transmission)) IN ('robot', 'робот', 'роботизированная');

-- Тип двигателя (engine_type)
UPDATE listings SET engine_type = 'gasoline' WHERE LOWER(TRIM(engine_type)) IN ('gasoline', 'бензин', 'petrol');
UPDATE listings SET engine_type = 'diesel'   WHERE LOWER(TRIM(engine_type)) IN ('diesel', 'дизель');
UPDATE listings SET engine_type = 'electric' WHERE LOWER(TRIM(engine_type)) IN ('electric', 'электро', 'electro');
UPDATE listings SET engine_type = 'hybrid'   WHERE LOWER(TRIM(engine_type)) IN ('hybrid', 'гибрид');

-- Тип кузова (body_type)
UPDATE listings SET body_type = 'sedan'       WHERE LOWER(TRIM(body_type)) IN ('sedan', 'седан');
UPDATE listings SET body_type = 'suv'         WHERE LOWER(TRIM(body_type)) IN ('suv', 'внедорожник');
UPDATE listings SET body_type = 'hatchback'   WHERE LOWER(TRIM(body_type)) IN ('hatchback', 'хэтчбек', 'хетчбек');
UPDATE listings SET body_type = 'wagon'      WHERE LOWER(TRIM(body_type)) IN ('wagon', 'универсал');
UPDATE listings SET body_type = 'coupe'      WHERE LOWER(TRIM(body_type)) IN ('coupe', 'купе');
UPDATE listings SET body_type = 'minivan'    WHERE LOWER(TRIM(body_type)) IN ('minivan', 'минивэн');
UPDATE listings SET body_type = 'pickup'     WHERE LOWER(TRIM(body_type)) IN ('pickup', 'пикап');
UPDATE listings SET body_type = 'convertible' WHERE LOWER(TRIM(body_type)) IN ('convertible', 'кабриолет');

-- Привод (drive_type)
UPDATE listings SET drive_type = 'front' WHERE LOWER(TRIM(drive_type)) IN ('front', 'передний', 'fwd');
UPDATE listings SET drive_type = 'rear'  WHERE LOWER(TRIM(drive_type)) IN ('rear', 'задний', 'rwd');
UPDATE listings SET drive_type = 'full'  WHERE LOWER(TRIM(drive_type)) IN ('full', 'полный', '4wd', 'awd');
UPDATE listings SET drive_type = 'part'  WHERE LOWER(TRIM(drive_type)) IN ('part', 'подключаемый');

-- Проверка после выполнения (опционально):
-- SELECT transmission, engine_type, body_type, drive_type, COUNT(*) FROM listings GROUP BY 1,2,3,4;
