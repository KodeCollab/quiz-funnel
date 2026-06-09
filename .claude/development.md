# Development — Common Tasks & Debugging

Practical guide for developing features and fixing issues.

## Common Tasks

### Create a New Funnel

**Via Admin Dashboard:**
1. Run `npm run dev`
2. Visit `http://localhost:3000/admin`
3. Click "New Funnel"
4. Enter:
   - **Name:** e.g., "Solar Savings Quiz"
   - **Slug:** e.g., "solar" (used in URL: `/quiz/solar`)
5. Click "Create"
6. Add steps (see below)
7. Click "Publish"
8. Test at `/quiz/solar`

**Via Code (JSON):**
Create a funnel config JSON and POST to `/api/funnels`:
```json
{
  "slug": "solar",
  "name": "Solar Savings Quiz",
  "startStepId": "q1",
  "steps": [
    {
      "id": "q1",
      "type": "single_select",
      "question": "Are you a homeowner?",
      "answers": [
        { "label": "Yes", "value": "yes", "next": "email" },
        { "label": "No", "value": "no", "next": "end" }
      ]
    },
    {
      "id": "email",
      "type": "email_capture",
      "question": "Your email?",
      "next": "end"
    },
    {
      "id": "end",
      "type": "results_page",
      "question": "Thanks!"
    }
  ]
}
```

### Add a New Step Type

1. **Create component** `components/quiz/steps/CustomStep.tsx`:
```typescript
import { QuizStep } from '@/lib/quiz-engine/types'

interface CustomStepProps {
  step: QuizStep
  onAnswer: (stepId: string, value: any) => void
  onNext: () => void
}

export function CustomStep({ step, onAnswer, onNext }: CustomStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{step.question}</h2>
      <button
        onClick={() => {
          onAnswer(step.id, 'value')
          onNext()
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Continue
      </button>
    </div>
  )
}
```

2. **Add to types** `lib/quiz-engine/types.ts`:
```typescript
type StepType = 
  | 'single_select'
  | 'email_capture'
  | 'custom_type'  // ← Add here
  | ...other types
```

3. **Register in QuizRenderer** `components/quiz/QuizRenderer.tsx`:
```typescript
{currentStep.type === 'custom_type' && (
  <CustomStep step={currentStep} onAnswer={onAnswer} onNext={onNext} />
)}
```

4. **Use in funnel config:**
```json
{
  "id": "custom",
  "type": "custom_type",
  "question": "Your question?",
  "next": "next_step"
}
```

### Add Branching Logic

**Example: Route based on energy bill amount**

```json
{
  "id": "bill",
  "type": "slider",
  "question": "Monthly energy bill?",
  "min": 0,
  "max": 500,
  "next": [
    {
      "condition": {
        "field": "bill",
        "operator": "gt",
        "value": 100
      },
      "next": "high_intent"
    },
    {
      "condition": {
        "field": "bill",
        "operator": "lt",
        "value": 50
      },
      "next": "low_intent"
    }
  ]
}
```

**Operators available:**
- `eq` — Equals
- `gt` — Greater than
- `lt` — Less than
- `gte` — Greater than or equal
- `lte` — Less than or equal
- `contains` — String contains (for text fields)

### Add Lead Scoring

In funnel config, add a `scoring` array:

```json
{
  "slug": "solar",
  "name": "Solar Quiz",
  ...
  "scoring": [
    {
      "stepId": "homeowner",
      "value": "yes",
      "points": 10
    },
    {
      "stepId": "timeline",
      "value": "now",
      "points": 15
    },
    {
      "stepId": "bill",
      "value": null,  // Any answer to this step
      "condition": { "operator": "gt", "value": 150 },
      "points": 10
    }
  ]
}
```

Scoring rules:
- Match on exact `stepId` + `value`
- Calculate in `/api/submit` (server-side)
- Store with submission
- Visible in admin submissions table

### Customize Theme

In funnel config, add a `theme` object:

```json
{
  "slug": "solar",
  "name": "Solar Quiz",
  "theme": {
    "primaryColor": "#FF9332",
    "backgroundColor": "#FFFFFF",
    "textColor": "#333333",
    "buttonStyle": "rounded",
    "fontFamily": "sans-serif"
  },
  ...
}
```

Then in step components, access via context or props and apply Tailwind classes dynamically.

### Test a Funnel

**Manual Testing:**
1. Create funnel in `/admin`
2. Visit `/quiz/[slug]`
3. Answer all questions
4. Verify:
   - Progress bar advances
   - Transitions are smooth
   - Branching logic works
   - Loading screen appears
   - Results page displays
   - Email received (if integrated)

**TypeScript Check:**
```bash
npm run lint
# Should have zero errors
```

**Database Verification:**
1. Go to Supabase dashboard
2. Navigate to `submissions` table
3. Verify new row exists with correct data

## Debugging

### Browser Console

Check Zustand store state:
```javascript
// In browser console
useQuizStore()

// Example output:
{
  currentStepId: "email",
  answers: { homeowner: "yes", timeline: "now" },
  history: ["q1"],
  sessionId: "123e4567-e89b-12d3-a456-426614174000"
}
```

### Debug Quiz Flow

**Step 1: Check current step**
```javascript
const store = useQuizStore()
console.log('Current step:', store.currentStepId)
console.log('All answers:', store.answers)
```

**Step 2: Manually call goNext()**
```javascript
useQuizStore.getState().goNext()
```

**Step 3: Check Supabase submissions**
```javascript
// In /api/submit endpoint, add logging
console.log('Submission data:', { funnelId, answers, leadScore })
```

### Common Issues

#### Quiz Shows "Not Found"

**Problem:** `/quiz/solar` returns 404, but funnel exists in admin

**Causes:**
1. Slug mismatch (case-sensitive)
2. Funnel not published
3. Supabase RLS policy blocking public read

**Fix:**
1. Double-check slug: `useQuizStore()` → check against config
2. Verify funnel `published: true` in database
3. Check Supabase RLS: ensure public can read active funnels

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'funnels'
```

#### Submission Not Saving

**Problem:** User completes quiz but submission doesn't appear

**Causes:**
1. `/api/submit` endpoint error
2. Supabase RLS blocking insert
3. Network error during POST

**Fix:**
1. Check browser Network tab:
   - Look for `POST /api/submit` request
   - Check response status (should be 200)
   - Check response body for errors

2. Check server logs:
   ```bash
   npm run dev
   # Watch for errors in terminal
   ```

3. Verify RLS policies:
   ```sql
   -- Should allow insert for anon users
   SELECT * FROM pg_policies WHERE tablename = 'submissions'
   ```

4. Check Supabase dashboard:
   - Verify `submissions` table exists
   - Check for INSERT permissions

#### Google Sheets Not Updating

**Problem:** Submissions save to Supabase but not Google Sheet

**Causes:**
1. Google API key invalid or expired
2. Sheet ID incorrect
3. Google Sheets API not enabled
4. Missing `GOOGLE_SHEETS_API_KEY` env var

**Fix:**
1. Verify API key:
   ```bash
   grep GOOGLE_SHEETS_API_KEY .env.local
   ```

2. Verify Sheet ID (from URL):
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```

3. Check Google Cloud Console:
   - Enable Sheets API
   - Create Service Account
   - Download JSON credentials

4. Test manually:
   ```typescript
   // In /api/submit
   const result = await appendToSheet({
     sheetId: process.env.GOOGLE_SHEETS_ID,
     values: [email, name, phone, ...]
   })
   console.log('Sheet result:', result)
   ```

#### Performance Slow

**Problem:** Quiz loads slowly or animations lag

**Causes:**
1. Large bundle size
2. Unoptimized images
3. Too many re-renders

**Fix:**
1. Check bundle size:
   ```bash
   npm run build
   # Check terminal output for bundle analysis
   ```

2. Profile React:
   ```javascript
   // In component
   console.time('render')
   // ...component code
   console.timeEnd('render')
   ```

3. Optimize animations:
   - Use `shouldReduceMotion` for accessibility
   - Limit animation duration to <300ms
   - Use GPU-accelerated properties (transform, opacity)

#### TypeScript Errors

**Problem:** `npm run lint` shows errors

**Fix:**
1. Read error message carefully
2. Check type definitions in `lib/quiz-engine/types.ts`
3. Use `as const` for literal types
4. Ensure imports use absolute paths: `@/lib/...`

Example error:
```
Type 'string' is not assignable to type 'StepType'
```

Fix:
```typescript
// Wrong
const stepType = "custom"

// Right
const stepType: StepType = "custom_type"  // Must match StepType union
```

## Development Workflow

### Setup Once
```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials
```

### Daily Development
```bash
npm run dev
# Visit http://localhost:3000
# Changes auto-reload
```

### Before Pushing
```bash
# Type check
npm run lint

# Build (catches errors)
npm run build

# Test locally
npm start
```

### Testing Checklist

- [ ] Quiz loads without errors
- [ ] Progress bar appears
- [ ] Questions display correctly
- [ ] Answers are captured
- [ ] Branching logic works
- [ ] Loading screen shows
- [ ] Results page displays
- [ ] Submission appears in Supabase
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

## State Management Patterns

### Read State
```typescript
const { currentStepId, answers } = useQuizStore()
```

### Write State
```typescript
const { setAnswer, goNext } = useQuizStore()

// Record answer
setAnswer('email', 'user@example.com')

// Navigate
goNext()
```

### Complex Updates
```typescript
const store = useQuizStore.getState()

// Get all data
const allAnswers = store.answers

// Batch updates
store.setAnswer('step1', 'value1')
store.setAnswer('step2', 'value2')
store.goNext()
```

### Persist to LocalStorage
```typescript
// Zustand auto-persists store
// Survives page refresh

// Clear on exit
window.addEventListener('beforeunload', () => {
  useQuizStore.getState().reset()
})
```

## Performance Tips

### Optimize Component Renders
```typescript
// Bad: Recreates function on every render
<SingleSelectStep onChange={(val) => setAnswer(val)} />

// Good: Memoize callback
const handleAnswer = useCallback((val) => setAnswer(val), [])
<SingleSelectStep onChange={handleAnswer} />
```

### Optimize Images
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.png"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"  // Lazy-load off-screen images
/>
```

### Optimize Animations
```typescript
// Use translate instead of margin/position
<motion.div style={{ transform: 'translateY(20px)' }}>
  {/* Cheaper animation */}
</motion.div>
```

## Database Migrations

If you need to modify the schema:

1. Create new migration file: `supabase/migrations/002_your_change.sql`
2. Write SQL:
   ```sql
   ALTER TABLE submissions ADD COLUMN custom_field TEXT;
   ```
3. Test locally
4. Push to production via Supabase CLI

---

**Last Updated:** 2026-06-09
