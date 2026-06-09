# API Reference

Complete reference for types, functions, and endpoints.

## TypeScript Types

All types defined in `lib/quiz-engine/types.ts`.

### Step Types (Union)

```typescript
type StepType =
  | 'single_select'     // Radio buttons
  | 'multi_select'      // Checkboxes
  | 'image_select'      // Image cards
  | 'text_input'        // Text field
  | 'textarea'          // Long text
  | 'email_capture'     // Email input
  | 'phone_capture'     // Phone input
  | 'name_capture'      // Name input
  | 'slider'            // Range slider
  | 'loading_screen'    // Loading page
  | 'results_page'      // Thank you page
```

### Quiz Step Interface

Base interface for all quiz steps:

```typescript
interface QuizStep {
  id: string                    // Unique within funnel
  type: StepType               // Step type
  question: string             // Question/prompt text
  description?: string         // Optional helper text
  answers?: Answer[]           // For select-type steps
  next: string | Condition[]   // Next step ID(s)
  validation?: Validation      // Optional validation rules
  placeholder?: string         // Input placeholder
  required?: boolean           // Is answer required
}

interface Answer {
  label: string                // Display text
  value: any                   // User's answer value
  description?: string         // Optional tooltip
}

interface Validation {
  pattern?: string            // Regex pattern
  minLength?: number
  maxLength?: number
  min?: number               // For numeric
  max?: number               // For numeric
  required?: boolean
}
```

### Condition Interface

For conditional branching:

```typescript
interface Condition {
  field: string                // Step ID to check
  operator: ConditionOperator  // How to compare
  value: any                   // Value to compare against
  next: string                 // Next step if true
}

type ConditionOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'

// Examples:
const condition: Condition = {
  field: 'homeowner',
  operator: 'eq',
  value: 'yes',
  next: 'email_step'
}

const conditionNumeric: Condition = {
  field: 'bill',
  operator: 'gt',
  value: 100,
  next: 'high_intent'
}

const conditionString: Condition = {
  field: 'city',
  operator: 'contains',
  value: 'New York',
  next: 'local_offer'
}
```

### Funnel Config Interface

Complete funnel configuration:

```typescript
interface FunnelConfig {
  id?: string                      // UUID (auto-generated)
  slug: string                     // URL slug (unique)
  name: string                     // Display name
  description?: string             // Admin notes
  startStepId: string             // First step ID
  steps: QuizStep[]               // All steps
  theme?: Theme                   // Styling
  scoring?: ScoringRule[]         // Lead scoring
  integrations?: Integrations     // External integrations
  published?: boolean             // Is active
  createdAt?: string              // ISO timestamp
  updatedAt?: string              // ISO timestamp
}

interface Theme {
  primaryColor?: string           // Button, progress color
  backgroundColor?: string        // Page background
  textColor?: string             // Text color
  buttonStyle?: 'rounded' | 'sharp' | 'pill'
  fontFamily?: string            // Font name
  logo?: string                  // Logo URL
}

interface ScoringRule {
  stepId: string                 // Step to check
  value?: any                    // Exact value match (optional)
  condition?: Condition          // Complex condition (optional)
  points: number                 // Points to award
}

interface Integrations {
  googleSheets?: {
    sheetId: string
    worksheetName?: string
  }
  webhook?: {
    url: string
    events: ('submit' | 'abandon')[]
  }
}
```

### Submission Interface

User submission data:

```typescript
interface Submission {
  id: string                    // UUID
  funnelId: string             // Which funnel
  sessionId: string            // Session ID
  answers: Record<string, any> // All user answers
  leadScore?: number           // Calculated score
  email?: string               // Captured email
  phone?: string               // Captured phone
  name?: string                // Captured name
  address?: string             // Captured address
  customData?: Record<string, any> // Extra fields
  createdAt: string            // ISO timestamp
}
```

## Quiz Store (Zustand)

State management via `lib/store/quiz-store.ts`.

### Store State

```typescript
interface QuizStore {
  // State
  currentStepId: string
  answers: Record<string, any>  // { stepId: value }
  history: string[]             // Stack of previous step IDs
  sessionId: string
  loading: boolean
  error?: string

  // Actions
  setAnswer: (stepId: string, value: any) => void
  goNext: () => void
  goBack: () => void
  reset: () => void
  setLoading: (loading: boolean) => void
  setError: (error?: string) => void
}
```

### Usage Examples

```typescript
import { useQuizStore } from '@/lib/store/quiz-store'

// Read state
const { currentStepId, answers } = useQuizStore()

// Write state
const { setAnswer, goNext } = useQuizStore()
setAnswer('email', 'user@example.com')
goNext()

// Get all state
const store = useQuizStore.getState()
console.log(store.answers)

// Subscribe to changes
useQuizStore.subscribe(
  (state) => state.currentStepId,
  (stepId) => console.log('Step changed:', stepId)
)
```

## Quiz Engine Functions

Core logic in `lib/quiz-engine/resolver.ts`.

### resolveNextStep()

Determine next step based on current step and user answer.

```typescript
function resolveNextStep(
  currentStep: QuizStep,
  userAnswer: any,
  allAnswers: Record<string, any>
): string | null

// Example
const nextStepId = resolveNextStep(
  { id: 'q1', type: 'single_select', next: 'q2' },
  'yes',
  { q1: 'yes' }
)
// Returns: 'q2'

// With conditional logic
const nextStepId = resolveNextStep(
  {
    id: 'budget',
    type: 'slider',
    next: [
      { condition: { field: 'budget', operator: 'gt', value: 100 }, next: 'high' },
      { condition: { field: 'budget', operator: 'lt', value: 50 }, next: 'low' }
    ]
  },
  150,
  { budget: 150 }
)
// Returns: 'high'
```

### evaluateCondition()

Check if a condition is met.

```typescript
function evaluateCondition(
  condition: Condition,
  answers: Record<string, any>
): boolean

// Example
const meets = evaluateCondition(
  { field: 'homeowner', operator: 'eq', value: 'yes' },
  { homeowner: 'yes' }
)
// Returns: true

// Numeric comparison
const meetsNumeric = evaluateCondition(
  { field: 'bill', operator: 'gt', value: 100 },
  { bill: 150 }
)
// Returns: true

// String contains
const meetsString = evaluateCondition(
  { field: 'city', operator: 'contains', value: 'New' },
  { city: 'New York' }
)
// Returns: true
```

### calculateLeadScore()

Calculate lead quality score.

```typescript
function calculateLeadScore(
  answers: Record<string, any>,
  scoring: ScoringRule[]
): number

// Example
const score = calculateLeadScore(
  { homeowner: 'yes', timeline: 'now', bill: 150 },
  [
    { stepId: 'homeowner', value: 'yes', points: 10 },
    { stepId: 'timeline', value: 'now', points: 15 },
    {
      stepId: 'bill',
      condition: { field: 'bill', operator: 'gt', value: 100 },
      points: 10
    }
  ]
)
// Returns: 35 (10 + 15 + 10)
```

### validateAnswer()

Validate user input against step rules.

```typescript
function validateAnswer(
  answer: any,
  step: QuizStep
): { valid: boolean, error?: string }

// Example
const result = validateAnswer(
  'invalid@',
  { id: 'email', type: 'email_capture', required: true }
)
// Returns: { valid: false, error: 'Invalid email format' }

const result2 = validateAnswer(
  'user@example.com',
  { id: 'email', type: 'email_capture', required: true }
)
// Returns: { valid: true }
```

## Database Queries

CRUD operations in `lib/supabase/queries.ts`.

### Funnel Queries

#### getFunnelBySlug()

```typescript
async function getFunnelBySlug(slug: string): Promise<FunnelConfig>

// Example
const config = await getFunnelBySlug('solar')
// Returns: { id: '...', slug: 'solar', name: 'Solar Quiz', steps: [...] }

// In component
const [config, setConfig] = useState<FunnelConfig | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string>()

useEffect(() => {
  getFunnelBySlug('solar')
    .then(setConfig)
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

#### getAllFunnels()

```typescript
async function getAllFunnels(
  filter?: { published?: boolean }
): Promise<FunnelConfig[]>

// Example
const funnels = await getAllFunnels({ published: true })
// Returns: [{ slug: 'solar', ... }, { slug: 'wind', ... }]

// List all (even unpublished)
const allFunnels = await getAllFunnels()
```

#### createFunnel()

```typescript
async function createFunnel(config: FunnelConfig): Promise<string>

// Returns: funnel ID (UUID)
const funnelId = await createFunnel({
  slug: 'solar',
  name: 'Solar Quiz',
  startStepId: 'q1',
  steps: [...]
})
```

#### updateFunnel()

```typescript
async function updateFunnel(
  id: string,
  config: Partial<FunnelConfig>
): Promise<void>

// Example: Update just the steps
await updateFunnel(funnelId, {
  steps: [...newSteps]
})

// Example: Publish a funnel
await updateFunnel(funnelId, {
  published: true
})
```

#### deleteFunnel()

```typescript
async function deleteFunnel(id: string): Promise<void>

await deleteFunnel(funnelId)
```

### Submission Queries

#### createSubmission()

```typescript
async function createSubmission(data: {
  funnelId: string
  sessionId: string
  answers: Record<string, any>
  leadScore: number
  email?: string
  phone?: string
  name?: string
}): Promise<string>

// Returns: submission ID (UUID)
const submissionId = await createSubmission({
  funnelId: '123e4567-e89b-12d3-a456-426614174000',
  sessionId: 'abc-123',
  answers: { q1: 'yes', email: 'user@example.com' },
  leadScore: 25,
  email: 'user@example.com'
})
```

#### getSubmissions()

```typescript
async function getSubmissions(
  funnelId: string,
  options?: { limit?: number, offset?: number }
): Promise<Submission[]>

// Example
const submissions = await getSubmissions(funnelId)

// With pagination
const page1 = await getSubmissions(funnelId, { limit: 20, offset: 0 })
const page2 = await getSubmissions(funnelId, { limit: 20, offset: 20 })
```

#### getSubmissionById()

```typescript
async function getSubmissionById(id: string): Promise<Submission>

const submission = await getSubmissionById(submissionId)
```

#### deleteSubmission()

```typescript
async function deleteSubmission(id: string): Promise<void>

await deleteSubmission(submissionId)
```

## HTTP API Routes

### POST /api/submit

Submit a completed quiz.

**Request:**
```json
{
  "funnelId": "uuid",
  "sessionId": "uuid",
  "answers": {
    "homeowner": "yes",
    "email": "user@example.com",
    "timeline": "now"
  },
  "email": "user@example.com",
  "phone": "+1-555-0123",
  "name": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "submissionId": "uuid",
  "leadScore": 30
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Funnel not found"
}
```

**Handler location:** `app/api/submit/route.ts`

**Handler logic:**
1. Validate request body
2. Fetch funnel config from database
3. Validate answers against step types
4. Calculate lead score
5. Save submission to Supabase
6. Send to Google Sheets (if configured)
7. Send to webhook (if configured)
8. Return success response

### Future Routes (TBD)

- `GET /api/funnels/[slug]` — Get funnel config
- `POST /api/funnels` — Create funnel
- `PUT /api/funnels/[id]` — Update funnel
- `DELETE /api/funnels/[id]` — Delete funnel
- `GET /api/submissions/[funnelId]` — List submissions

## Integration Functions

### Google Sheets Integration

Location: `lib/integrations/google-sheets.ts`

```typescript
async function appendToSheet(options: {
  sheetId: string
  worksheetName?: string
  values: any[]
}): Promise<{ spreadsheetId: string, updatedRows: number }>

// Example
const result = await appendToSheet({
  sheetId: '1BxiMVs0XRA5nFMXT5GpYUqb2ZdMqGfePR123',
  worksheetName: 'Submissions',
  values: [
    new Date().toISOString(),
    'John Doe',
    'user@example.com',
    '+1-555-0123',
    '123 Main St',
    JSON.stringify({ q1: 'yes', q2: 'solar' }),
    '30'
  ]
})
// Returns: { spreadsheetId: '...', updatedRows: 1 }
```

### Webhook Integration

```typescript
async function sendToWebhook(options: {
  url: string
  event: 'submit' | 'abandon'
  data: Submission
}): Promise<{ status: number, body: any }>

// Example
const result = await sendToWebhook({
  url: 'https://webhook.example.com/quiz',
  event: 'submit',
  data: submission
})
// Returns: { status: 200, body: { ... } }
```

## Component Props

### QuizRenderer

```typescript
interface QuizRendererProps {
  funnelConfig: FunnelConfig
  onSubmit?: (submission: Submission) => void
  onError?: (error: string) => void
}

// Example
<QuizRenderer
  funnelConfig={config}
  onSubmit={(submission) => console.log('Submitted:', submission)}
  onError={(error) => alert(error)}
/>
```

### SingleSelectStep

```typescript
interface SingleSelectStepProps {
  step: QuizStep & { type: 'single_select' }
  answers: Record<string, any>
  onAnswer: (stepId: string, value: any) => void
  onNext: () => void
}

// Example
<SingleSelectStep
  step={currentStep}
  answers={store.answers}
  onAnswer={store.setAnswer}
  onNext={store.goNext}
/>
```

## Environment Variables

### Public (accessible in browser)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### Private (server-only)

```
SUPABASE_SERVICE_ROLE_KEY=xxxxx
GOOGLE_SHEETS_API_KEY=xxxxx
WEBHOOK_SECRET=xxxxx
```

---

**Last Updated:** 2026-06-09
