# Настройка избранного в Supabase

## RPC (рекомендуется) — один скрипт

Приложение использует **RPC-функции**: клиент передаёт только `listing_id`, а `user_id` в БД подставляется из `auth.uid()`. Так не бывает 403 из‑за лишней логики на клиенте.

**Что сделать:** в Supabase → **SQL Editor** выполните скрипт **`app/database/favorites_rpc.sql`** (скопируйте его содержимое и выполните). После этого добавление/удаление из избранного работает через вызовы `add_to_favorites` и `remove_from_favorites`.

Таблица `favorites` и RLS должны быть уже созданы (см. вариант А ниже). У таблицы желательно ограничение **UNIQUE(user_id, listing_id)** — оно есть в варианте А.

---

Если объявления не добавляются в избранное, чаще всего причина одна из двух:

1. **Нет таблицы `favorites` или нет политик RLS** — вставка/чтение блокируются.
2. **`favorites.user_id` ссылается на `public.users(id)`**, а в `public.users` нет строки для текущего пользователя (он есть только в `auth.users`) — вставка падает по внешнему ключу.

Ниже два варианта: пересоздать избранное с ссылкой на **auth.users** (рекомендуется) или оставить ссылку на **public.users** и синхронизировать пользователей.

---

## Вариант А (рекомендуется): таблица `favorites` с ссылкой на auth.users

Так избранное не зависит от `public.users`. В **Supabase Dashboard** → **SQL Editor** выполните:

```sql
-- Удалить старую таблицу (если есть; данные избранного будут потеряны)
DROP TABLE IF EXISTS favorites;

-- Таблица избранного: user_id ссылается на auth.users
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_own" ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);
```

После выполнения добавление в избранное и вкладка «Избранное» должны работать без настроек в `public.users`.

---

## Вариант Б: оставить ссылку на public.users и синхронизировать пользователей

Если таблица `favorites` уже есть и в ней `user_id` ссылается на **`public.users(id)`**, при вставке в `favorites` должен существовать такой же `id` в `public.users`. Иначе вставка падает по FK.

### Шаг 1. Проверка

Подставьте свой email и выполните в SQL Editor:

```sql
SELECT u.id, u.email FROM public.users u
WHERE u.email = 'ВАШ_EMAIL@example.com';
```

Если запрос ничего не вернул — в `public.users` нет этого пользователя, из‑за этого вставка в `favorites` и не проходит.

### Шаг 2. Синхронизация auth.users → public.users

Выполните один раз (подставьте свои столбцы таблицы `public.users`, если они отличаются):

```sql
INSERT INTO public.users (id, email, first_name, last_name, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO NOTHING;
```

После этого снова попробуйте добавить объявление в избранное.

### Шаг 3. RLS для favorites

Если таблица `favorites` уже есть, проверьте, что включён RLS и есть политика «только свои записи»:

```sql
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_own" ON favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

CREATE POLICY "favorites_own" ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

После переустановки политики снова попробуйте добавить объявление в избранное. В приложении при ошибке теперь показывается сообщение и оно дублируется в консоли браузера (F12 → Console) — по тексту ошибки можно понять, блокирует ли RLS или, например, срабатывает ограничение внешнего ключа.

---

## Как посмотреть политики RLS для таблицы favorites

### В интерфейсе Supabase

1. Откройте **Dashboard** → **Database** → **Tables**.
2. В списке таблиц найдите **favorites** и откройте её.
3. Перейдите на вкладку **Policies** (или **RLS Policies**). Там будут названия политик и условия (USING / WITH CHECK).

Если вкладки Policies нет — откройте **SQL Editor** и выполните запрос ниже.

### Через SQL: список политик

В **SQL Editor** выполните:

```sql
-- Показать все политики для таблицы favorites
SELECT
  policyname AS "Имя политики",
  cmd         AS "Команда (SELECT/INSERT/...)",
  qual        AS "USING (условие для чтения/удаления)",
  with_check  AS "WITH CHECK (условие для вставки/обновления)"
FROM pg_policies
WHERE tablename = 'favorites';
```

Так вы увидите, какие политики есть и какие у них условия. Для «только свои записи» должно быть что-то вроде `(auth.uid() = user_id)` в USING и в WITH CHECK.

---

## Полная переустановка политики (если избранное всё ещё не работает)

Выполните в **SQL Editor** один раз. Это удалит все текущие политики на `favorites` и создаст одну правильную:

```sql
-- 1. Включить RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 2. Удалить ВСЕ политики с таблицы favorites (подставьте свои имена, если в списке выше они другие)
DROP POLICY IF EXISTS "favorites_own" ON favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
DROP POLICY IF EXISTS "favorites_select" ON favorites;
DROP POLICY IF EXISTS "favorites_insert" ON favorites;
DROP POLICY IF EXISTS "favorites_delete" ON favorites;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON favorites;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON favorites;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON favorites;

-- 3. Создать одну политику: пользователь видит и меняет только свои строки
CREATE POLICY "favorites_own" ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Важно: в конце указано **TO authenticated** — политика действует только для авторизованных пользователей. Гости не смогут ни читать, ни писать в `favorites`, что и нужно.
