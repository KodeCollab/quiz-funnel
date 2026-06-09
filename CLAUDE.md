# Quiz Funnel Platform — Developer Guide

Quick reference for developers. For detailed guides, see [.claude/](./.claude/).

## Setup (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase
#    - Create project at supabase.com
#    - Run: supabase/migrations/001_initial.sql
#    - Copy URL and Anon Key

# 3. Configure environment
cp .env.local.example .env.local
# Edit with: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Run dev server
npm run dev
# → http://localhost:3000/admin
```

See **[SETUP.md](./SETUP.md)** for detailed setup.

## Key Files at a Glance

| File | Purpose |
|------|---------|
| `lib/quiz-engine/types.ts` | All TypeScript types (`StepType`, `FunnelConfig`, etc.) |
| `lib/quiz-engine/resolver.ts` | Branching logic, condition evaluation, lead scoring |
| `lib/store/quiz-store.ts` | Zustand state management |
| `lib/supabase/queries.ts` | Database CRUD operations |
| `components/quiz/QuizRenderer.tsx` | Master quiz component |
| `app/(admin)/page.tsx` | Admin dashboard |
| `app/api/submit/route.ts` | Submission API endpoint |
| `supabase/migrations/001_initial.sql` | Database schema |

See **[.claude/architecture.md](./.claude/architecture.md)** for full structure.

## Common Tasks

### Create a New Funnel
1. Visit `/admin`
2. Click "New Funnel"
3. Fill in name and slug
4. Add steps (questions, email capture, etc.)
5. Publish
6. Test at `/quiz/[slug]`

### Add a New Step Type
1. Create `components/quiz/steps/NewStep.tsx`
2. Add to `StepType` union in `lib/quiz-engine/types.ts`
3. Register in `QuizRenderer.tsx` switch statement:
```tsx
{currentStep.type === 'new_type' && (
  <NewStep {...props} />
)}
```

### Debug Quiz Flow
```typescript
// In browser console:
useQuizStore()  // Check answers, currentStepId, history
```

Then check Supabase dashboard for submissions.

See **[.claude/development.md](./.claude/development.md)** for more tasks.

## Core Concepts

### Branching Logic
```json
{
  "id": "step_id",
  "type": "single_select",
  "question": "...",
  "answers": [
    { "label": "Option A", "value": "a", "next": "next_step" }
  ],
  // OR conditional branching:
  "next": [
    { "condition": { "field": "step_id", "operator": "eq", "value": "a" }, "next": "step_a" }
  ]
}
```

Operators: `eq`, `gt`, `lt`, `gte`, `lte`, `contains`

### Lead Scoring
```json
{
  "scoring": [
    { "stepId": "homeowner", "value": "yes", "points": 10 },
    { "stepId": "timeline", "value": "now", "points": 10 }
  ]
}
```

Calculated server-side in `/api/submit`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
GOOGLE_SHEETS_API_KEY=xxxxx (optional)
```

**Local:** `.env.local`  
**Production:** Vercel Project Settings → Environment Variables

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # TypeScript check
npm start        # Run production build locally
```

## Deployment

### Vercel (Recommended)
```bash
git push origin main
# Auto-deploys via GitHub integration
```

1. Go to https://vercel.com/new
2. Import `quiz-funnel` repo
3. Add environment variables
4. Deploy

### Self-Hosted
```bash
npm run build
npm start
```

## Project Structure

```
quiz-funnel/
├── app/
│   ├── (public)/quiz/[slug]/    ← Public quiz pages
│   ├── (admin)/                 ← Admin dashboard
│   └── api/submit/              ← Submission API
├── components/
│   ├── quiz/                    ← Quiz components
│   │   ├── QuizRenderer.tsx
│   │   ├── QuestionStep.tsx
│   │   ├── ProgressBar.tsx
│   │   └── steps/               ← Individual step components
│   └── admin/                   ← Admin UI components
├── lib/
│   ├── quiz-engine/
│   │   ├── types.ts             ← All TypeScript types
│   │   ├── resolver.ts          ← Branching & scoring logic
│   │   └── validator.ts
│   ├── store/
│   │   └── quiz-store.ts        ← Zustand state
│   ├── supabase/
│   │   ├── client.ts
│   │   └── queries.ts           ← Database queries
│   └── integrations/
│       └── google-sheets.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql      ← Database schema
├── .claude/                     ← Detailed developer docs
│   ├── architecture.md
│   ├── development.md
│   ├── api.md
│   └── database.md
├── SETUP.md                     ← First-time setup
├── QUIZ_PLATFORM.md             ← Feature overview
└── README.md                    ← Project overview
```

See **[.claude/architecture.md](./.claude/architecture.md)** for detailed structure.

## Testing Workflow

1. **Local:** `npm run dev` → `/admin` → create funnel → test `/quiz/[slug]`
2. **TypeScript:** `npm run build` (catches errors)
3. **Vercel:** Push to GitHub → auto-deploy → test live
4. **Database:** Check Supabase dashboard for submissions

## State Management (Zustand)

```typescript
import { useQuizStore } from '@/lib/store/quiz-store'

const { answers, currentStepId, goNext, setAnswer, goBack } = useQuizStore()
```

Store structure:
- `currentStepId` — Current step ID
- `answers` — Map of step ID → user answer
- `history` — Previous step IDs (for back button)
- `sessionId` — Unique session identifier

## API Reference

### POST `/api/submit`
Submit a completed quiz.

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

Response:
```json
{
  "success": true,
  "submissionId": "uuid",
  "leadScore": 30
}
```

See **[.claude/api.md](./.claude/api.md)** for full API reference.

## Step Types

| Type | Input | Use |
|------|-------|-----|
| `single_select` | Radio buttons | "Choose one" |
| `multi_select` | Checkboxes | "Choose multiple" |
| `image_select` | Image cards | "Pick an image" |
| `text_input` | Text field | Short text |
| `textarea` | Large text | Long text |
| `email_capture` | Email field | Email (validated) |
| `phone_capture` | Phone field | Phone (validated) |
| `name_capture` | Name field | Name |
| `slider` | Range slider | Numeric range |
| `loading_screen` | Spinner | Loading page |
| `results_page` | Static content | Thank you page |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing Supabase URL or key" | Check `.env.local`, restart `npm run dev` |
| "Quiz shows 'not found'" | Verify slug matches exactly (case-sensitive) |
| "Submissions not saving" | Check Supabase RLS policies and tables exist |
| "Google Sheets not updating" | Verify Sheet ID and API key |

See **[.claude/development.md](./.claude/development.md)** for debugging tips.

## Documentation Map

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Project overview |
| [SETUP.md](./SETUP.md) | First-time setup & testing |
| [QUIZ_PLATFORM.md](./QUIZ_PLATFORM.md) | Feature overview & examples |
| [.claude/architecture.md](./.claude/architecture.md) | Deep dive: project structure |
| [.claude/development.md](./.claude/development.md) | Common tasks & debugging |
| [.claude/api.md](./.claude/api.md) | Types, functions, endpoints |
| [.claude/database.md](./.claude/database.md) | Schema, queries, RLS |

## Code Style

- **TypeScript:** Strict mode enabled
- **Components:** Functional, React hooks
- **Naming:** camelCase (functions), PascalCase (components)
- **Imports:** Absolute paths via `@/` alias
- **Styling:** Tailwind utility classes
- **Comments:** Minimal (self-documenting code)

## Useful Links

- **GitHub:** https://github.com/KodeCollab/quiz-funnel
- **Supabase:** https://supabase.com
- **Vercel:** https://vercel.com
- **Next.js Docs:** https://nextjs.org/docs

---

**Last Updated:** 2026-06-09  
**Status:** Production-ready MVP  
**Built with:** Claude Code + Next.js 15 + TypeScript
