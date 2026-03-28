-- MYPODCAST SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Profile Table (Sync with auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Subscription Plans Table
create table subscription_plans (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  price numeric not null,
  period text default 'monthly' not null,
  features text[] not null,
  icon text,
  gradient text[],
  is_best boolean default false
);

-- 3. Create User Subscriptions Table
create table user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan_id uuid references subscription_plans not null,
  status text default 'active' not null,
  start_date timestamp with time zone default now() not null,
  end_date timestamp with time zone,
  unique(user_id)
);

-- NEW: 3.1 Create Subscription History Table
create table subscription_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan_name text not null,
  plan_price numeric not null,
  status text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- 4. Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table subscription_plans enable row level security;
alter table user_subscriptions enable row level security;
alter table subscription_history enable row level security;

-- 5. Create RLS Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Plans are viewable by everyone." on subscription_plans for select using (true);

create policy "Users can view their own subscription." on user_subscriptions for select using (auth.uid() = user_id);
create policy "Users can view their own subscription history." on subscription_history for select using (auth.uid() = user_id);

-- 6. Insert Default Plans
insert into subscription_plans (name, price, period, features, icon, gradient, is_best)
values 
  ('Basic', 20.00, '/month', 
   array['5 AI Podcast Generations', '30 Days Library History', 'High Quality Audio'], 
   'bicycle-outline', 
   array['#4ade80', '#2dd4bf'], 
   false),
  ('Premium', 40.00, '/month', 
   array['20 AI Podcast Generations', 'Full Library History Access', 'Ultra High Quality Audio', 'Priority Support'], 
   'car-outline', 
   array['#fbbf24', '#f59e0b'], 
   true);

-- 7. Trigger to create profile when auth.user created
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- NEW: 8. Trigger to ARCHIVE old subscription to history when updated/deleted
create or replace function public.archive_subscription_history()
returns trigger as $$
declare
    old_plan_name text;
    old_plan_price numeric;
begin
    -- Get old plan details before archiving
    select name, price into old_plan_name, old_plan_price 
    from subscription_plans where id = OLD.plan_id;

    insert into public.subscription_history (user_id, plan_name, plan_price, status, start_date, end_date)
    values (OLD.user_id, old_plan_name, old_plan_price, OLD.status, OLD.start_date, now());
    
    return OLD;
end;
$$ language plpgsql security definer;

create trigger on_subscription_updated
  before update or delete on public.user_subscriptions
  for each row execute procedure public.archive_subscription_history();
