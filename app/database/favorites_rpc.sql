-- Избранное через RPC: user_id подставляется в БД из auth.uid(), клиент только передаёт listing_id.
-- Выполните этот скрипт в Supabase → SQL Editor один раз.

-- Добавить в избранное (повторный вызов просто вернёт запись, без ошибки)
CREATE OR REPLACE FUNCTION add_to_favorites(p_listing_id UUID)
RETURNS SETOF favorites
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  INSERT INTO public.favorites (user_id, listing_id)
  VALUES (auth.uid(), p_listing_id)
  ON CONFLICT (user_id, listing_id) DO NOTHING;
  RETURN QUERY SELECT * FROM public.favorites
  WHERE user_id = auth.uid() AND listing_id = p_listing_id;
END;
$$;

-- Удалить из избранного
CREATE OR REPLACE FUNCTION remove_from_favorites(p_listing_id UUID)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
AS $$
  DELETE FROM public.favorites
  WHERE user_id = auth.uid() AND listing_id = p_listing_id;
$$;

-- Права для авторизованных пользователей
GRANT EXECUTE ON FUNCTION add_to_favorites(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_from_favorites(UUID) TO authenticated;
