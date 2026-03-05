-- Biz-IGen Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (linked to Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('entrepreneur', 'consultant')) DEFAULT 'entrepreneur',
  subscription_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{"lang": "fr", "secteur": ""}'
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'generated')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_data JSONB DEFAULT '{}'
);

-- Form inputs table (for detailed tracking)
CREATE TABLE form_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer TEXT,
  conditional_logic JSONB DEFAULT '{}',
  uploaded_files TEXT[] DEFAULT '{}'
);

-- Generated documents table
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('bmc', 'lc', 'bp')) NOT NULL,
  content JSONB NOT NULL,
  ai_metadata JSONB DEFAULT '{"prompt_used": "", "tokens": 0}',
  exported_at TIMESTAMP WITH TIME ZONE
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('basic', 'pro')) DEFAULT 'basic',
  stripe_id TEXT,
  flutterwave_ref TEXT,
  quota_used INTEGER DEFAULT 0,
  renewal_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  chatbot_responses TEXT[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own projects" ON projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own form inputs" ON form_inputs FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

CREATE POLICY "Users can CRUD own documents" ON generated_documents FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
