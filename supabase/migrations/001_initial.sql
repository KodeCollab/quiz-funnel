-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Funnels table
CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  active BOOLEAN DEFAULT false,
  google_sheets_id TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  lead_score INT DEFAULT 0,
  email TEXT,
  phone TEXT,
  name TEXT,
  address JSONB,
  completed BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Step events table (optional analytics)
CREATE TABLE step_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  step_id TEXT,
  event TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_funnels_slug ON funnels(slug);
CREATE INDEX idx_funnels_active ON funnels(active);
CREATE INDEX idx_submissions_funnel_id ON submissions(funnel_id);
CREATE INDEX idx_submissions_session_id ON submissions(session_id);
CREATE INDEX idx_step_events_submission_id ON step_events(submission_id);
CREATE INDEX idx_step_events_funnel_id ON step_events(funnel_id);

-- Row Level Security (optional - for production)
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_events ENABLE ROW LEVEL SECURITY;

-- For MVP, allow public read on active funnels, private submissions
CREATE POLICY "Allow public read active funnels" ON funnels
  FOR SELECT USING (active = true);

CREATE POLICY "Allow service role all operations" ON funnels
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all operations" ON submissions
  FOR ALL USING (true) WITH CHECK (true);
