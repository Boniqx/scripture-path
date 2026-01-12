-- Create Enums
create type public.study_difficulty as enum ('INTRO', 'INTERMEDIATE', 'ADVANCED');
create type public.study_length as enum ('SHORT', 'MEDIUM', 'LONG');
create type public.user_tier as enum ('SEEKER', 'SCRIBE');

-- Create Profiles Table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  tier public.user_tier default 'SEEKER'::public.user_tier,
  created_at timestamptz default now(),
  last_generation_at timestamptz,
  primary key (id)
);

-- Create Studies Table
create table public.studies (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  theme text,
  passage_refs text,
  content jsonb, -- Stores the rigid 14-point structure + quiz
  difficulty public.study_difficulty default 'INTERMEDIATE'::public.study_difficulty,
  length public.study_length default 'MEDIUM'::public.study_length,
  visual_url text, -- For AI generated images
  is_public boolean default false,
  views_count integer default 0,
  likes_count integer default 0,
  shares_count integer default 0,
  clones_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.studies enable row level security;
