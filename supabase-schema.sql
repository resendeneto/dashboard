-- ============================================================
-- Schema do Dashboard Social (rode no SQL Editor do Supabase
-- quando for migrar do modo local para a nuvem).
-- Todas as tabelas com prefixo social_ para não colidir.
-- ============================================================

create table if not exists social_ig_daily (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz default now(),
  date date not null,
  followers integer,
  reach integer,
  impressions integer,
  profile_views integer,
  website_clicks integer
);

create table if not exists social_ig_posts (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz default now(),
  date date,
  type text,
  caption text,
  reach integer,
  likes integer,
  comments integer,
  saves integer,
  shares integer
);

create table if not exists social_ads (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz default now(),
  date date,
  campaign text,
  spend numeric,
  impressions integer,
  clicks integer,
  conversions integer,
  revenue numeric
);

create table if not exists social_goals (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz default now(),
  name text not null,
  period text,
  target numeric,
  current numeric
);

create table if not exists social_notes (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz default now(),
  icon text,
  title text not null,
  body text
);

-- Row Level Security: libere leitura/escrita com a publishable key.
-- (Ajuste conforme sua necessidade de segurança.)
alter table social_ig_daily enable row level security;
alter table social_ig_posts enable row level security;
alter table social_ads      enable row level security;
alter table social_goals    enable row level security;
alter table social_notes    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['social_ig_daily','social_ig_posts','social_ads','social_goals','social_notes']
  loop
    execute format('create policy "anon all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;
