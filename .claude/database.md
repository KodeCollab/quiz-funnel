# Database — Schema, Queries, and RLS Policies

Complete guide to the Supabase PostgreSQL database.

## Database Schema

Location: `supabase/migrations/001_initial.sql`

Three main tables:

### funnels

Stores quiz funnel configurations.

```sql
CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,  -- Full FunnelConfig as JSON
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_funnels_slug ON funnels(slug);
CREATE INDEX idx_funnels_published ON funnels(published);
```

**Fields:**
- `id` — UUID primary key
- `slug` — URL slug (unique, lowercase alphanumeric + hyphens)
- `name` — Display name
- `description` — Admin notes (optional)
- `config` — Full FunnelConfig object as JSONB
  ```json
  {
    "slug": "solar",
    "name": "Solar Quiz",
    "startStepId": "q1",
    "steps": [...],
    "theme": {...},
    "scoring": [...]
  }
  ```
- `published` — Is funnel active/visible
- `created_at`, `updated_at` — Timestamps

**Indexes:**
- `slug` — Fast lookup by slug
- `published` — Fast lookup of active funnels

### submissions

Stores user submissions (leads).

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  answers JSONB NOT NULL,  -- { stepId: value }
  lead_score INTEGER,
  email TEXT,
  phone TEXT,
  name TEXT,
  address TEXT,
  custom_data JSONB,       -- Extra fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT email_format CHECK (email IS NULL OR email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

CREATE INDEX idx_submissions_funnel_id ON submissions(funnel_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_email ON submissions(email);
```

**Fields:**
- `id` — UUID primary key
- `funnel_id` — Reference to funnels table
- `session_id` — Session identifier
- `answers` — All user answers as JSONB
  ```json
  {
    "homeowner": "yes",
    "email": "user@example.com",
    "timeline": "now"
  }
  ```
- `lead_score` — Calculated lead quality score
- `email`, `phone`, `name`, `address` — Captured fields
- `custom_data` — Extra fields (JSONB)
- `created_at` — Submission timestamp

**Indexes:**
- `funnel_id` — List submissions by funnel
- `created_at` — Sort submissions by date
- `email` — Quick email lookup

### step_events (Future Analytics)

Tracks user interactions for analytics.

```sql
CREATE TABLE step_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  step_id TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'view', 'answer', 'abandon'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_event CHECK (event_type IN ('view', 'answer', 'abandon'))
);

CREATE INDEX idx_step_events_funnel ON step_events(funnel_id);
CREATE INDEX idx_step_events_session ON step_events(session_id);
CREATE INDEX idx_step_events_timestamp ON step_events(timestamp DESC);
```

**Fields:**
- `id` — UUID primary key
- `funnel_id` — Reference to funnels
- `session_id` — Session identifier
- `step_id` — Which step
- `event_type` — 'view', 'answer', 'abandon'
- `timestamp` — When event occurred

**Note:** Not yet used in MVP. Available for future analytics dashboard.

## Row Level Security (RLS)

Policies control who can access what data.

### funnels Table Policies

```sql
-- Allow public to read only published funnels
CREATE POLICY "public_read_published"
  ON funnels
  FOR SELECT
  TO public
  USING (published = true);

-- Authenticated users can read all funnels
CREATE POLICY "auth_read_all"
  ON funnels
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete
GRANT SELECT ON funnels TO anon;
GRANT ALL ON funnels TO service_role;
```

**Result:**
- Anon users: Can see published funnels only
- Authenticated: Can see all funnels
- Service role: Can read/write/delete

### submissions Table Policies

```sql
-- Allow public to insert submissions
CREATE POLICY "public_insert_submissions"
  ON submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only service role can read submissions
CREATE POLICY "service_read_submissions"
  ON submissions
  FOR SELECT
  TO service_role
  USING (true);

GRANT INSERT ON submissions TO anon;
GRANT SELECT ON submissions TO service_role;
```

**Result:**
- Anon users: Can submit (INSERT only)
- Service role: Can read all submissions

## Common Queries

### Find a Funnel

```sql
-- By slug (most common)
SELECT config FROM funnels WHERE slug = 'solar' AND published = true;

-- By ID
SELECT config FROM funnels WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- All published
SELECT slug, name FROM funnels WHERE published = true ORDER BY created_at DESC;
```

### List Submissions

```sql
-- All submissions for a funnel
SELECT * FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC
LIMIT 100;

-- Recent high-scoring leads
SELECT email, lead_score, created_at FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
  AND lead_score >= 50
ORDER BY created_at DESC
LIMIT 20;

-- By date range
SELECT * FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
  AND created_at >= '2026-06-01'
  AND created_at < '2026-06-10'
ORDER BY created_at DESC;
```

### Search Submissions

```sql
-- By email
SELECT * FROM submissions
WHERE email = 'user@example.com';

-- By JSONB field (answers)
SELECT * FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
  AND answers->>'homeowner' = 'yes'
ORDER BY created_at DESC;

-- Multiple conditions
SELECT * FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
  AND answers->>'homeowner' = 'yes'
  AND answers->>'timeline' = 'now'
  AND lead_score >= 50;
```

### Analytics Queries

```sql
-- Count submissions by day
SELECT DATE(created_at) as date, COUNT(*) as count
FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Average lead score by day
SELECT DATE(created_at) as date, AVG(lead_score) as avg_score
FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY DATE(created_at);

-- Distribution by answer value
SELECT answers->>'homeowner' as answer, COUNT(*) as count
FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY answers->>'homeowner';

-- High-quality leads (score >= 50)
SELECT COUNT(*) as high_quality_leads
FROM submissions
WHERE funnel_id = '123e4567-e89b-12d3-a456-426614174000'
  AND lead_score >= 50;
```

### JSONB Operations

Working with JSON data in PostgreSQL:

```sql
-- Access nested field
WHERE answers->>'email' = 'user@example.com'

-- Array contains
WHERE answers->>'interests' @> '"solar"'

-- Check key exists
WHERE answers ? 'homeowner'

-- Pretty-print JSON
SELECT jsonb_pretty(config) FROM funnels WHERE slug = 'solar';

-- Update nested field
UPDATE funnels
SET config = jsonb_set(config, '{theme,primaryColor}', '"#FF0000"')
WHERE slug = 'solar';
```

## Data Backup & Export

### Backup via Supabase CLI

```bash
# Dump database (all tables)
supabase db dump --db-url "postgresql://..." > backup.sql

# Restore from backup
psql --file backup.sql
```

### Export CSV from Dashboard

1. Go to Supabase dashboard
2. Navigate to `submissions` table
3. Click "Download" → CSV
4. Save locally

### Export via SQL

```sql
-- Create CSV export query
COPY submissions(id, funnel_id, email, lead_score, created_at)
TO STDOUT WITH CSV HEADER;

-- In psql:
psql -c "COPY submissions(...) TO STDOUT WITH CSV HEADER" > export.csv
```

### Export to Google Sheets

Submissions auto-export via the `/api/submit` endpoint (see `lib/integrations/google-sheets.ts`).

Manual export:
```typescript
import { appendToSheet } from '@/lib/integrations/google-sheets'

const submissions = await getSubmissions(funnelId)

// Format for Sheets
const rows = submissions.map(s => [
  s.createdAt,
  s.name,
  s.email,
  s.phone,
  s.address,
  JSON.stringify(s.answers),
  s.leadScore
])

// Append to sheet
await appendToSheet({
  sheetId: process.env.GOOGLE_SHEETS_ID,
  worksheetName: 'Submissions',
  values: rows
})
```

## Database Maintenance

### Monitor Database Size

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index sizes
SELECT indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE tablename IN ('funnels', 'submissions', 'step_events')
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### Vacuum & Analyze

PostgreSQL maintenance (automatic, but can be manual):

```sql
-- Reclaim space from deleted rows
VACUUM submissions;

-- Update table statistics for query optimizer
ANALYZE submissions;

-- Both
VACUUM ANALYZE submissions;
```

### Connection Limits

Check current connections:

```sql
SELECT count(*) FROM pg_stat_activity;

-- By database
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

-- Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE duration > interval '1 hour';
```

## Performance Optimization

### Add Indexes for Common Queries

```sql
-- For filtering by answer value
CREATE INDEX idx_submissions_answers_homeowner ON submissions
  USING GIN (answers);

-- For date range queries
CREATE INDEX idx_submissions_date_range ON submissions
  (created_at DESC, funnel_id);

-- For email lookups
CREATE INDEX idx_submissions_email_lower ON submissions
  (LOWER(email));
```

### Query Optimization

```sql
-- Slow query (AVOID)
SELECT * FROM submissions WHERE answers->>'homeowner' = 'yes';

-- Better (with index)
CREATE INDEX idx_homeowner ON submissions
  ((answers->>'homeowner'));
SELECT * FROM submissions WHERE answers->>'homeowner' = 'yes';

-- Best (denormalize if queried often)
ALTER TABLE submissions ADD COLUMN homeowner TEXT;
CREATE INDEX idx_homeowner_simple ON submissions(homeowner);
```

## Disaster Recovery

### Restore from Backup

If something goes wrong:

```bash
# 1. Export current database (just in case)
supabase db dump > current_state.sql

# 2. Restore from backup
psql < backup.sql

# 3. Verify restoration
SELECT COUNT(*) FROM funnels;
SELECT COUNT(*) FROM submissions;
```

### Point-in-Time Recovery

Supabase keeps backups for 7 days (Pro plan).

1. Go to Supabase dashboard
2. Settings → Backups
3. Click "Restore" on desired backup
4. Choose restore point (date/time)

### Data Integrity Checks

```sql
-- Check for orphaned submissions
SELECT COUNT(*) FROM submissions
WHERE funnel_id NOT IN (SELECT id FROM funnels);

-- Check for missing required fields
SELECT COUNT(*) FROM submissions
WHERE answers IS NULL OR answers = '{}';

-- Verify constraints
SELECT * FROM submissions WHERE email != NULL AND email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$';
```

## Troubleshooting

### "Connection refused"
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify firewall isn't blocking database
- Check Supabase project is running

### "Permission denied"
- Verify RLS policies allow the operation
- Check user role (anon vs authenticated vs service role)
- Check table grant permissions

### "JSONB query is slow"
- Add GIN index on JSONB column
- Denormalize frequently-queried fields
- Use query explain: `EXPLAIN ANALYZE SELECT ...`

### "Submissions table too large"
- Archive old submissions to separate table
- Implement data retention policy (delete after 90 days)
- Partition by date range

---

**Last Updated:** 2026-06-09
