# Architecture & Project Structure

Deep dive into how the quiz funnel platform is structured and how components interact.

## High-Level Data Flow

```
┌─────────────────────────────────────────┐
│         PUBLIC QUIZ (/quiz/[slug])      │
│  ┌─────────────────────────────────┐    │
│  │ QuizRenderer (dynamic rendering)│    │
│  │ ├─ QuestionStep (Framer Motion) │    │
│  │ ├─ SingleSelectStep             │    │
│  │ ├─ EmailStep                    │    │
│  │ ├─ NameStep                     │    │
│  │ ├─ PhoneStep                    │    │
│  │ ├─ LoadingStep                  │    │
│  │ └─ ResultsStep                  │    │
│  └─────────────────────────────────┘    │
│            ↓ Zustand Store              │
│    (answers, step history, session)     │
└─────────────────────────────────────────┘
           ↓ POST /api/submit
┌─────────────────────────────────────────┐
│            API / Backend                │
│  ├─ Save → Supabase                     │
│  ├─ Score → calculateLeadScore()        │
│  └─ Integrate → Google Sheets           │
└─────────────────────────────────────────┘
           ↓ Database
┌─────────────────────────────────────────┐
│        SUPABASE (PostgreSQL)            │
│  ├─ funnels (config, theme, scoring)   │
│  ├─ submissions (answers, leads)        │
│  └─ step_events (analytics)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       ADMIN DASHBOARD (/admin)          │
│  ├─ Funnel list                         │
│  ├─ Funnel editor (form-based)          │
│  ├─ Submissions viewer                  │
│  └─ Settings (Sheets, webhooks)         │
└─────────────────────────────────────────┘
```

## Directory Structure

```
quiz-funnel/
│
├── app/                              ← Next.js App Router
│   ├── (public)/
│   │   └── quiz/[slug]/
│   │       └── page.tsx              ← Dynamic quiz page (fetches funnel config)
│   │
│   ├── (admin)/
│   │   ├── layout.tsx                ← Admin nav/layout
│   │   ├── page.tsx                  ← Funnel list & new button
│   │   ├── [funnelId]/edit/page.tsx  ← Funnel editor
│   │   └── [funnelId]/submissions/page.tsx
│   │
│   └── api/
│       └── submit/route.ts           ← POST endpoint for submissions
│
├── components/
│   ├── quiz/
│   │   ├── QuizRenderer.tsx          ← Master component (routes to steps)
│   │   ├── QuestionStep.tsx          ← Wrapper with Framer Motion
│   │   ├── ProgressBar.tsx           ← Step counter
│   │   └── steps/
│   │       ├── SingleSelectStep.tsx
│   │       ├── MultiSelectStep.tsx
│   │       ├── ImageSelectStep.tsx
│   │       ├── TextInputStep.tsx
│   │       ├── TextAreaStep.tsx
│   │       ├── EmailStep.tsx
│   │       ├── PhoneStep.tsx
│   │       ├── NameStep.tsx
│   │       ├── SliderStep.tsx
│   │       ├── LoadingStep.tsx
│   │       └── ResultsStep.tsx
│   │
│   └── admin/
│       ├── FunnelForm.tsx            ← Form-based funnel builder
│       ├── StepBuilder.tsx           ← Add/edit steps
│       ├── SubmissionsTable.tsx      ← View submissions
│       └── SettingsPanel.tsx         ← Google Sheets, webhooks
│
├── lib/
│   ├── quiz-engine/
│   │   ├── types.ts                  ← All TypeScript interfaces
│   │   │   ├── StepType (union)
│   │   │   ├── QuizStep (base interface)
│   │   │   ├── FunnelConfig
│   │   │   ├── Submission
│   │   │   └── Condition
│   │   │
│   │   ├── resolver.ts               ← Core logic
│   │   │   ├── resolveNextStep()     ← Navigate quiz
│   │   │   ├── evaluateCondition()   ← Check branching
│   │   │   └── calculateLeadScore()  ← Score leads
│   │   │
│   │   └── validator.ts              ← Input validation
│   │
│   ├── store/
│   │   └── quiz-store.ts             ← Zustand store
│   │       ├── currentStepId
│   │       ├── answers (map)
│   │       ├── history (stack)
│   │       ├── sessionId
│   │       ├── setAnswer()
│   │       ├── goNext()
│   │       ├── goBack()
│   │       └── reset()
│   │
│   ├── supabase/
│   │   ├── client.ts                 ← Lazy-init Supabase client
│   │   └── queries.ts                ← Database CRUD
│   │       ├── getFunnelBySlug()
│   │       ├── getAllFunnels()
│   │       ├── createFunnel()
│   │       ├── updateFunnel()
│   │       ├── createSubmission()
│   │       └── getSubmissions()
│   │
│   └── integrations/
│       └── google-sheets.ts          ← Google Sheets API
│
├── supabase/
│   └── migrations/
│       └── 001_initial.sql           ← Database schema & RLS
│
└── public/
    └── (static assets)
```

## Core Modules

### Quiz Engine (`lib/quiz-engine/`)

Handles all quiz logic independently of UI or database.

**types.ts** — TypeScript definitions
```typescript
type StepType = 
  | 'single_select'
  | 'multi_select'
  | 'image_select'
  | 'text_input'
  | 'textarea'
  | 'email_capture'
  | 'phone_capture'
  | 'name_capture'
  | 'slider'
  | 'loading_screen'
  | 'results_page'

interface QuizStep {
  id: string
  type: StepType
  question: string
  answers?: Answer[]
  next: string | Condition[]  // Simple or conditional branching
}

interface FunnelConfig {
  id: string
  slug: string
  name: string
  startStepId: string
  steps: QuizStep[]
  theme?: Theme
  scoring?: ScoringRule[]
}

interface Condition {
  field: string
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
  value: any
}
```

**resolver.ts** — Navigation & branching logic
```typescript
// Given current step and user's answer, determine next step
resolveNextStep(currentStep, answer): string

// Check if condition is met given user's answers
evaluateCondition(condition, answers): boolean

// Calculate lead quality score
calculateLeadScore(answers, scoring): number
```

**validator.ts** — Input validation
```typescript
validateEmail(value): boolean
validatePhone(value): boolean
validateRequired(value, step): boolean
```

### State Management (`lib/store/quiz-store.ts`)

Zustand store for quiz state, survives page refreshes.

```typescript
{
  currentStepId: string        // Current step being displayed
  answers: Record<string, any> // All user answers: { stepId: value }
  history: string[]            // Stack of previous step IDs (for back button)
  sessionId: string            // Unique per quiz session
  
  // Actions
  setAnswer(stepId, value)     // Record user's answer
  goNext()                     // Navigate to next step (uses resolver)
  goBack()                     // Pop history stack
  reset()                      // Clear all state
}
```

### Database (`lib/supabase/`)

**client.ts** — Lazy-initialized Supabase client
```typescript
export const getSupabaseClient = () => {
  // Initializes once, reuses thereafter
}
```

**queries.ts** — Database operations
```typescript
// Funnel queries
getFunnelBySlug(slug): Promise<FunnelConfig>
getAllFunnels(): Promise<FunnelConfig[]>
createFunnel(config): Promise<string>  // Returns ID
updateFunnel(id, config): Promise<void>
deleteFunnel(id): Promise<void>

// Submission queries
createSubmission(funnelId, sessionId, answers, score): Promise<string>
getSubmissions(funnelId): Promise<Submission[]>
getSubmissionById(id): Promise<Submission>
```

### Components

**QuizRenderer.tsx** — Master component
```typescript
export default function QuizRenderer({ funnelConfig }) {
  const { currentStepId, goNext, answers } = useQuizStore()
  const currentStep = funnelConfig.steps.find(s => s.id === currentStepId)
  
  // Dynamic rendering based on step type
  return (
    <>
      <ProgressBar current={stepIndex} total={total} />
      {currentStep.type === 'single_select' && <SingleSelectStep ... />}
      {currentStep.type === 'email_capture' && <EmailStep ... />}
      ...
    </>
  )
}
```

**QuestionStep.tsx** — Wrapper with animations
```typescript
// Handles Framer Motion transitions for step entry/exit
export function QuestionStep({ children, stepId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {children}
    </motion.div>
  )
}
```

**Step Components** — Individual step types
```typescript
// Each step component:
// - Receives current step config
// - Gets answers from store
// - Calls setAnswer() on change
// - Calls goNext() when complete

export function SingleSelectStep({ step, answers, onAnswer, onNext }) {
  return (
    <div>
      <h2>{step.question}</h2>
      {step.answers.map(answer => (
        <button onClick={() => {
          onAnswer(step.id, answer.value)
          onNext()
        }}>
          {answer.label}
        </button>
      ))}
    </div>
  )
}
```

## Branching Logic

### Simple Branching
Each answer points to the next step directly:
```json
{
  "id": "q1",
  "type": "single_select",
  "question": "Are you a homeowner?",
  "answers": [
    { "label": "Yes", "value": "yes", "next": "email_step" },
    { "label": "No", "value": "no", "next": "ineligible" }
  ]
}
```

### Conditional Branching
Multiple conditions determine the next step:
```json
{
  "id": "budget",
  "type": "slider",
  "question": "Monthly energy bill?",
  "next": [
    {
      "condition": { "field": "budget", "operator": "gt", "value": 100 },
      "next": "high_intent"
    },
    {
      "condition": { "field": "budget", "operator": "lt", "value": 50 },
      "next": "low_intent"
    }
  ]
}
```

How it works:
1. User answers step
2. `goNext()` is called
3. `resolveNextStep()` checks:
   - If `next` is a string → go there
   - If `next` is a Condition[] → evaluate each, use first match
4. Navigate to resolved step

## Lead Scoring

Scoring configuration stored in `FunnelConfig`:
```json
{
  "scoring": [
    { "stepId": "homeowner", "value": "yes", "points": 10 },
    { "stepId": "timeline", "value": "now", "points": 10 },
    { "stepId": "budget", "value": "high", "points": 10 }
  ]
}
```

Calculation in `/api/submit`:
```typescript
function calculateLeadScore(answers, scoring) {
  return scoring.reduce((score, rule) => {
    if (answers[rule.stepId] === rule.value) {
      score += rule.points
    }
    return score
  }, 0)
}
```

## Database Schema

Three main tables (see `supabase/migrations/001_initial.sql`):

**funnels**
```sql
CREATE TABLE funnels (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  config JSONB,  -- Full FunnelConfig as JSON
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**submissions**
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  funnel_id UUID REFERENCES funnels,
  session_id UUID,
  answers JSONB,  -- { stepId: value }
  lead_score INTEGER,
  email TEXT,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMP
)
```

**step_events** (future analytics)
```sql
CREATE TABLE step_events (
  id UUID PRIMARY KEY,
  funnel_id UUID,
  session_id UUID,
  step_id TEXT,
  timestamp TIMESTAMP
)
```

## API Routes

### POST `/api/submit`

Endpoint for quiz submissions.

**Request:**
```json
{
  "funnelId": "uuid",
  "sessionId": "uuid",
  "answers": { "stepId": "value" },
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe"
}
```

**Handler logic:**
1. Validate submission (check funnel exists, answers are valid)
2. Calculate lead score
3. Save to Supabase `submissions` table
4. Send to Google Sheets (if configured)
5. Send to webhooks (if configured)
6. Return success + submission ID

**Response:**
```json
{
  "success": true,
  "submissionId": "uuid",
  "leadScore": 30
}
```

## Admin Dashboard

**Routes:**
- `/admin` — Funnel list, new funnel button
- `/admin/[funnelId]/edit` — Funnel editor (form-based)
- `/admin/[funnelId]/submissions` — View all submissions

**Data flow:**
1. Fetch funnel config from Supabase
2. Render form with current steps
3. User edits (add, remove, reorder steps)
4. Save to Supabase on submit
5. Cache invalidated, changes live immediately

## Environment & Configuration

### Development vs Production

**Development (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # Local Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Production (Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co  # Hosted Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### TypeScript Configuration

Strict mode enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

All code must pass `npm run lint` (TypeScript check).

## Performance Considerations

### Bundle Size
- Next.js App Router: Tree-shaking unused components
- Dynamic imports for step components (only load what's needed)
- Framer Motion: Minimal animations, no easing libraries
- Total bundle: ~70KB gzipped

### Loading Performance
- ISR (Incremental Static Regeneration) for funnels (cache 1 hour)
- Lazy-load Supabase client (only when needed)
- Zustand persists to localStorage (survives page refresh)

### Database Performance
- Funnel config stored as JSONB (queryable, indexable)
- RLS policies restrict access (public can only read published funnels)
- Submissions indexed by `funnel_id` and `created_at`

---

**Last Updated:** 2026-06-09
