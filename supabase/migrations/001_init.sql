-- ユーザープロフィール（Supabase Authと紐づく）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles: 全スタッフ閲覧可" on public.profiles for select using (auth.uid() is not null);
create policy "profiles: 本人のみ更新可" on public.profiles for update using (auth.uid() = id);

-- 顧客テーブル
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.customers enable row level security;
create policy "customers: 全スタッフ操作可" on public.customers using (auth.uid() is not null);

-- 見積もりテーブル
create table public.estimates (
  id uuid default gen_random_uuid() primary key,
  estimate_number text not null unique,
  customer_id uuid references public.customers(id),
  title text not null,
  status text not null default 'draft'
    check (status in ('draft','sent','approved','rejected','expired')),
  issue_date date not null default current_date,
  expiry_date date not null,
  notes text,
  subtotal numeric(12,0) not null default 0,
  tax_rate numeric(4,2) not null default 0.10,
  tax_amount numeric(12,0) not null default 0,
  total_amount numeric(12,0) not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.estimates enable row level security;
create policy "estimates: 全スタッフ操作可" on public.estimates using (auth.uid() is not null);

-- 見積もり明細テーブル
create table public.estimate_items (
  id uuid default gen_random_uuid() primary key,
  estimate_id uuid references public.estimates(id) on delete cascade not null,
  sort_order int not null default 0,
  category text not null default 'other',
  item_name text not null,
  spec text,
  unit text not null default '式',
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,0) not null default 0,
  amount numeric(12,0) generated always as (quantity * unit_price) stored,
  notes text
);

alter table public.estimate_items enable row level security;
create policy "estimate_items: 全スタッフ操作可" on public.estimate_items using (auth.uid() is not null);

-- 見積もり番号自動採番関数
create or replace function generate_estimate_number()
returns text language plpgsql as $$
declare
  year_str text := to_char(current_date, 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq
  from public.estimates
  where estimate_number like year_str || '-%';
  return year_str || '-' || lpad(seq::text, 4, '0');
end;
$$;

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger estimates_updated_at before update on public.estimates
  for each row execute function update_updated_at();

create trigger customers_updated_at before update on public.customers
  for each row execute function update_updated_at();
