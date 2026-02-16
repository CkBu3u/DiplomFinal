import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic server config
const PORT = process.env.PORT || 3000;

// Supabase: проект fojtrxrurpqyeqfdfyew (новый)
const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://fojtrxrurpqyeqfdfyew.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvanRyeHJ1cnBxeWVxZmRmeWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjU3OTgsImV4cCI6MjA4NjgwMTc5OH0.SGneB4E_dDNwEaYFz_u8tED9dzEUb-z3bZAVyjzvixs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// --------- API ---------

// Список объявлений (активные)
app.get('/api/listings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        id,
        year,
        price,
        mileage,
        engine_type,
        engine_volume,
        transmission,
        city,
        is_premium,
        views_count,
        created_at,
        brand:brands(name),
        model:models(name),
        images:listing_images(image_url, is_main)
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to load listings' });
    }

    const DEFAULT_IMAGE =
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80';

    const normalized =
      data?.map((item) => {
        const mainImage =
          item.images?.find((img) => img.is_main) || item.images?.[0];

        return {
          id: item.id,
          brand: item.brand?.name || 'Неизвестно',
          model: item.model?.name || '',
          year: item.year,
          price: item.price,
          mileage: item.mileage || 0,
          engine_type: item.engine_type || 'Бензин',
          engine_volume: Number(item.engine_volume) || 2.0,
          transmission: item.transmission || 'Автомат',
          city: item.city || 'Москва',
          image: mainImage?.image_url || DEFAULT_IMAGE,
          is_premium: item.is_premium || false,
          views_count: item.views_count || 0,
          created_at: item.created_at,
        };
      }) ?? [];

    res.json(normalized);
  } catch (err) {
    console.error('API /api/listings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------- Статические файлы: React build (app/dist) или autohub-static ---------
const distPath = path.resolve(__dirname, '../dist');
const staticFallback = path.resolve(__dirname, '../../autohub-static');
const staticRoot = fs.existsSync(distPath) ? distPath : staticFallback;
const indexPath = path.join(staticRoot, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('WARN: index.html not found at', indexPath);
  console.warn('Run from app folder: npm run build');
}

// Сначала раздаём статику (JS, CSS, assets)
app.use(express.static(staticRoot, { index: false }));

// Главная и все SPA-маршруты — index.html
app.get('/', (req, res) => {
  res.sendFile(indexPath);
});
app.get('*', (req, res, next) => {
  // Не перехватываем API
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Static: ${staticRoot}`);
});


