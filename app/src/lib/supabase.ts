import { createClient } from '@supabase/supabase-js';

// Supabase: проект fojtrxrurpqyeqfdfyew (новый)
const SUPABASE_URL = 'https://fojtrxrurpqyeqfdfyew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvanRyeHJ1cnBxeWVxZmRmeWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjU3OTgsImV4cCI6MjA4NjgwMTc5OH0.SGneB4E_dDNwEaYFz_u8tED9dzEUb-z3bZAVyjzvixs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types
export type User = {
  id: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  user_type: 'private' | 'dealer' | 'company';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  city?: string;
  region?: string;
};

export type Brand = {
  id: number;
  name: string;
  logo_url?: string;
  country?: string;
  is_popular: boolean;
  created_at: string;
};

export type Model = {
  id: number;
  brand_id: number;
  name: string;
  body_type?: string;
  year_from?: number;
  year_to?: number;
  created_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  brand_id?: number;
  model_id?: number;
  year: number;
  price: number;
  currency: string;
  body_type?: string;
  engine_type?: string;
  engine_volume?: number;
  engine_power?: number;
  transmission?: string;
  drive_type?: string;
  mileage?: number;
  condition: 'new' | 'used';
  owners_count?: number;
  color?: string;
  color_metallic: boolean;
  city?: string;
  region?: string;
  title?: string;
  description?: string;
  status: 'active' | 'inactive' | 'sold' | 'moderated' | 'rejected';
  is_premium: boolean;
  is_featured: boolean;
  views_count: number;
  contact_phone?: string;
  contact_name?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  // Joined fields
  brand?: Brand;
  model?: Model;
  images?: ListingImage[];
  user?: User;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

// Auth functions
export async function signUp(email: string, password: string, userData: Partial<User>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Обновить профиль в public.users (телефон, имя и т.д.) */
export async function updateUserProfile(userId: string, data: { phone?: string; first_name?: string; last_name?: string; city?: string }) {
  const { error } = await supabase
    .from('users')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  return { error };
}

// Listings functions
export async function getListings(filters: {
  brand_id?: number | number[];
  model_id?: number | number[];
  price_min?: number;
  price_max?: number;
  year_min?: number;
  year_max?: number;
  city?: string;
  body_type?: string | string[];
  engine_type?: string | string[];
  transmission?: string | string[];
  drive_type?: string | string[];
  search?: string;
  searchBrandIds?: number[];
  searchModelIds?: number[];
  sortBy?: string;
  page?: number;
  limit?: number;
} = {}) {
  let query = supabase
    .from('listings')
    .select(`
      *,
      brand:brands(name, logo_url),
      model:models(name),
      images:listing_images(*),
      user:users(first_name, avatar_url)
    `)
    .eq('status', 'active');

  // Одна или несколько марок
  if (Array.isArray(filters.brand_id) && filters.brand_id.length > 0) {
    query = query.in('brand_id', filters.brand_id);
  } else if (typeof filters.brand_id === 'number') {
    query = query.eq('brand_id', filters.brand_id);
  }
  // Одна или несколько моделей
  if (Array.isArray(filters.model_id) && filters.model_id.length > 0) {
    query = query.in('model_id', filters.model_id);
  } else if (typeof filters.model_id === 'number') {
    query = query.eq('model_id', filters.model_id);
  }

  if (filters.price_min) query = query.gte('price', filters.price_min);
  if (filters.price_max) query = query.lte('price', filters.price_max);
  if (filters.year_min) query = query.gte('year', filters.year_min);
  if (filters.year_max) query = query.lte('year', filters.year_max);
  if (filters.city) query = query.eq('city', filters.city);

  // Один или несколько типов кузова / двигателя / КПП / привода
  if (Array.isArray(filters.body_type) && filters.body_type.length > 0) {
    query = query.in('body_type', filters.body_type);
  } else if (typeof filters.body_type === 'string' && filters.body_type) {
    query = query.eq('body_type', filters.body_type);
  }
  if (Array.isArray(filters.engine_type) && filters.engine_type.length > 0) {
    query = query.in('engine_type', filters.engine_type);
  } else if (typeof filters.engine_type === 'string' && filters.engine_type) {
    query = query.eq('engine_type', filters.engine_type);
  }
  if (Array.isArray(filters.transmission) && filters.transmission.length > 0) {
    query = query.in('transmission', filters.transmission);
  } else if (typeof filters.transmission === 'string' && filters.transmission) {
    query = query.eq('transmission', filters.transmission);
  }
  if (Array.isArray(filters.drive_type) && filters.drive_type.length > 0) {
    query = query.in('drive_type', filters.drive_type);
  } else if (typeof filters.drive_type === 'string' && filters.drive_type) {
    query = query.eq('drive_type', filters.drive_type);
  }

  // Поиск по названию/описанию и по имени марки/модели
  const searchTerm = filters.search?.trim();
  if (searchTerm) {
    const orParts: string[] = [
      `title.ilike.%${searchTerm}%`,
      `description.ilike.%${searchTerm}%`,
    ];
    if (filters.searchBrandIds?.length) {
      orParts.push(`brand_id.in.(${filters.searchBrandIds.join(',')})`);
    }
    if (filters.searchModelIds?.length) {
      orParts.push(`model_id.in.(${filters.searchModelIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  query = query.order(filters.sortBy || 'created_at', { ascending: false });
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  const { data, error } = await query;
  return { data: data as Listing[] | null, error };
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      brand:brands(*),
      model:models(*),
      images:listing_images(*),
      user:users(*)
    `)
    .eq('id', id)
    .single();
  
  return { data: data as Listing | null, error };
}

export async function createListing(listingData: Partial<Listing>) {
  const { data, error } = await supabase
    .from('listings')
    .insert([listingData])
    .select()
    .single();
  
  return { data: data as Listing | null, error };
}

export async function updateListing(id: string, listingData: Partial<Listing>) {
  const { data, error } = await supabase
    .from('listings')
    .update(listingData)
    .eq('id', id)
    .select()
    .single();
  
  return { data: data as Listing | null, error };
}

export async function deleteListing(id: string) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Brands functions
export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');
  return { data: data as Brand[] | null, error };
}

export async function getPopularBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_popular', true)
    .order('name');
  return { data: data as Brand[] | null, error };
}

// Models functions
export async function getModelsByBrand(brandId: number) {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('brand_id', brandId)
    .order('name');
  
  return { data: data as Model[] | null, error };
}

/** Возвращает id моделей, у которых имя содержит строку поиска (для поиска по названию). */
export async function getModelIdsBySearch(search: string): Promise<number[]> {
  const term = search.trim();
  if (!term) return [];
  const { data } = await supabase
    .from('models')
    .select('id')
    .ilike('name', `%${term}%`);
  return (data || []).map((r: { id: number }) => r.id);
}

// Избранное: один вызов RPC, user_id подставляется в БД из auth.uid()
// Перед использованием выполните в Supabase SQL Editor скрипт: app/database/favorites_rpc.sql
export async function addToFavorites(listingId: string) {
  const { data, error } = await supabase
    .rpc('add_to_favorites', { p_listing_id: listingId })
    .maybeSingle();
  return { data: data as Favorite | null, error };
}

export async function removeFromFavorites(listingId: string) {
  const { error } = await supabase.rpc('remove_from_favorites', { p_listing_id: listingId });
  return { error };
}

export async function getFavorites() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: null, error: new Error('Сессия истекла. Войдите в аккаунт снова.') };

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      listing:listings(*, brand:brands(name), model:models(name), images:listing_images(*))
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return { data: data as Favorite[] | null, error };
}

// Image upload
export async function uploadImage(file: File, listingId: string) {
  const fileName = `${listingId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file);
  
  if (error) return { error };
  
  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(fileName);
  
  await supabase.from('listing_images').insert([{
    listing_id: listingId,
    image_url: publicUrl,
    is_main: false
  }]);
  
  return { publicUrl };
}

// Messages functions
export async function sendMessage(receiverId: string, content: string, listingId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      listing_id: listingId ?? null,
      content,
    }])
    .select()
    .single();
  return { data, error };
}

/** Сообщения между текущим пользователем и другим */
export async function getMessagesWithUser(otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] as Message[], error: null };
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
  return { data: (data as Message[]) ?? [], error };
}

/** Список диалогов (уникальные собеседники) */
export async function getConversations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] as { userId: string; userName: string; lastMessage: string; lastMessageTime: string; unreadCount: number }[], error: null };
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, created_at, is_read')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  if (error) return { data: [], error };
  const seen = new Set<string>();
  const conversations: { userId: string; userName: string; lastMessage: string; lastMessageTime: string; unreadCount: number }[] = [];
  for (const m of (data ?? [])) {
    const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
    if (seen.has(other)) continue;
    seen.add(other);
    conversations.push({
      userId: other,
      userName: 'Пользователь', // можно подгрузить из users
      lastMessage: m.content?.slice(0, 50) ?? '',
      lastMessageTime: new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      unreadCount: m.receiver_id === user.id && !m.is_read ? 1 : 0,
    });
  }
  return { data: conversations, error: null };
}

// Increment views (если в БД есть функция increment_listing_views)
export async function incrementListingViews(listingId: string) {
  try {
    const { error } = await supabase.rpc('increment_listing_views', { listing_uuid: listingId });
    return { error };
  } catch {
    return { error: null };
  }
}

// Reviews
export async function getReviewsForListing(listingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, reviewer_id, rating, comment, created_at')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function createReview(sellerId: string, listingId: string, rating: number, comment: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ reviewer_id: user.id, seller_id: sellerId, listing_id: listingId, rating, comment }])
    .select()
    .single();
  return { data, error };
}
