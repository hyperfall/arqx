-- TOOLFORGE Supabase Schema
-- This schema supports dual-layer storage with proper RLS

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create toolspecs table
CREATE TABLE IF NOT EXISTS toolspecs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  spec_hash TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT TRUE,
  is_seed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(owner, spec_hash)
);

-- Create toolspec_versions table
CREATE TABLE IF NOT EXISTS toolspec_versions (
  id BIGSERIAL PRIMARY KEY,
  toolspec_id UUID REFERENCES toolspecs(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  spec JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(toolspec_id, version)
);

-- Create favorites table  
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  toolspec_id UUID REFERENCES toolspecs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY(user_id, toolspec_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_toolspecs_owner ON toolspecs(owner);
CREATE INDEX IF NOT EXISTS idx_toolspecs_public ON toolspecs(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_toolspecs_updated_at ON toolspecs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_toolspec_versions_toolspec_id ON toolspec_versions(toolspec_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolspecs ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolspec_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for toolspecs
CREATE POLICY "Public toolspecs are viewable by everyone" ON toolspecs
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own toolspecs" ON toolspecs
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Users can insert their own toolspecs" ON toolspecs
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own toolspecs" ON toolspecs
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own toolspecs" ON toolspecs
  FOR DELETE USING (auth.uid() = owner);

-- RLS Policies for toolspec_versions
CREATE POLICY "Versions visible for public toolspecs" ON toolspec_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM toolspecs 
      WHERE toolspecs.id = toolspec_versions.toolspec_id 
      AND toolspecs.is_public = TRUE
    )
  );

CREATE POLICY "Users can view versions of their own toolspecs" ON toolspec_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM toolspecs 
      WHERE toolspecs.id = toolspec_versions.toolspec_id 
      AND toolspecs.owner = auth.uid()
    )
  );

CREATE POLICY "Users can insert versions for their own toolspecs" ON toolspec_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM toolspecs 
      WHERE toolspecs.id = toolspec_versions.toolspec_id 
      AND toolspecs.owner = auth.uid()
    )
  );

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_toolspecs_updated_at 
  BEFORE UPDATE ON toolspecs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();