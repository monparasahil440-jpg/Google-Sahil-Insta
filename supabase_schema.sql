-- ==========================================
-- INSTAGRAM CLONE SUPABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    image_url TEXT NOT NULL,
    caption TEXT,
    filter_effect TEXT DEFAULT 'none',
    location TEXT,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STORIES TABLE
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours') NOT NULL
);

-- 6. REELS TABLE
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    avatar_url TEXT,
    video_url TEXT NOT NULL,
    caption TEXT,
    audio_title TEXT DEFAULT 'Original Audio',
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tables
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public read access on stories" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on reels" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Allow public read access on messages" ON public.messages FOR SELECT USING (true);

-- Allow public write access for demo simplicity
CREATE POLICY "Allow all insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow all insert on posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete on posts" ON public.posts FOR DELETE USING (true);
CREATE POLICY "Allow all insert on likes" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete on likes" ON public.likes FOR DELETE USING (true);
CREATE POLICY "Allow all insert on comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert on stories" ON public.stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert on reels" ON public.reels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert on messages" ON public.messages FOR INSERT WITH CHECK (true);

-- CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public storage select" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Allow public storage insert" ON storage.objects FOR INSERT WITH CHECK (true);
