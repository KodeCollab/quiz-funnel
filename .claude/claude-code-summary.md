# Quiz Funnel Platform — Claude Code Summary

## Quick Reference

**Project:** JSON-driven quiz funnel platform for lead generation  
**Framework:** Next.js 15 + React + TypeScript + Tailwind CSS  
**Database:** Supabase PostgreSQL  
**State:** Zustand  
**Animations:** Framer Motion  
**Deployed:** Vercel  
**Repo:** https://github.com/KodeCollab/quiz-funnel

---

## Setup (First Time)

```bash
cd quiz-funnel

# 1. Create Supabase project at https://supabase.com
# 2. Run SQL migration from supabase/migrations/001_initial.sql
# 3. Copy credentials to .env.local:
cp .env.local.example .env.local

# 4. Edit .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 5. Install & dev
npm install
npm run dev
# → http://localhost:3000/admin
```

---

## Project Structure

### **Core Quiz Engine** (`lib/quiz-engine/`)
- **types.ts** — `StepType`, `QuizStep`, `FunnelConfig`, `Submission`, branching conditions
- **resolver.ts** — `resolveNextStep()`, `evaluateCondition()`, `calculateLeadScore()`
- Branching operators: `eq`, `gt`, `lt`, `gte`, `lte`, `contains`

### **State Management** (`lib/store/`)
- **quiz-store.ts** — Zustand store
  - `currentStepId`, `answers`, `history` (for back button), `sessionId`
  - Methods: `setAnswer()`, `goNext()`, `goBack()`, `reset()`

### **Database** (`lib/supabase/`)
- **client.ts** — `getSupabaseClient()` (lazy init)
- **queries.ts** — CRUD operations
  - `getFunnelBySlug()`, `getAllFunnels()`, `createFunnel()`, `updateFunnel()`
  - `createSubmission()`, `getSubmissions()`

### **Public Quiz** (`components/quiz/`)
- **QuizRenderer.tsx** — Master component (routes to step components)
- **QuestionStep.tsx** — Wrapper with Framer Motion transitions
- **ProgressBar.tsx** — Step counter
- **steps/** — Individual step components
  - `SingleSelectStep.tsx`, `EmailStep.tsx`, `NameStep.tsx`, `PhoneStep.tsx`
  - `LoadingStep.tsx`, `ResultsStep.tsx`

### **Admin** (`components/admin/` + `app/(admin)/`)
- **app/(admin)/page.tsx** — Dashboard (funnel list, new button)
- **app/(admin)/layout.tsx** — Admin nav bar
- Submissions viewer, settings (future)

### **API Routes** (`app/api/`)
- **POST /api/submit** — Save submission → Supabase + Google Sheets

### **Database Schema** (`supabase/migrations/`)
- **001_initial.sql** — Tables: `funnels`, `submissions`, `step_events`
  - RLS policies for public read (active funnels), service role all-access

---

## Common Tasks

### Create a New Funnel
1. Visit `/admin`
2. Click "New Funnel"
3. Add steps via form
4. Publish
5. Live at `/quiz/[slug]`

### JSON Configuration Example
```json
{
  "slug": "solar",
  "name": "Solar Savings Quiz",
  "startStepId": "homeowner",
  "theme": { "primaryColor": "#FF9332" },
  "steps": [
    {
      "id": "homeowner",
      "type": "single_select",
      "question": "Are you a homeowner?",
      "answers": [
        { "label": "Yes", "value": "yes", "next": "email" },
        { "label": "No", "value": "no", "next": "ineligible" }
      ]
    },
    { "id": "email", "type": "email_capture", "question": "Your email?", "next": "loading" },
    { "id": "loading", "type": "loading_screen", "question": "Calculating...", "next": "results" },
    { "id": "results", "type": "results_page", "question": "Check your email!" },
    { "id": "ineligible", "type": "results_page", "question": "Not eligible." }
  ],
  "scoring": [
    { "stepId": "homeowner", "value": "yes", "points": 10 }
  ]
}
```

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
1. Open browser DevTools → Application tab
2. Check Zustand store: `useQuizStore()` in console
3. Inspect `answers`, `currentStepId`, `history`
4. Check Supabase dashboard for submissions table

---

## Key Concepts

### **Branching Logic**
```typescript
// Simple: always go to next step
"next": "email_step"

// Conditional: evaluate conditions
"next": [
  { "condition": { "field": "homeowner", "operator": "eq", "value": "yes" }, "next": "email" },
  { "condition": { "field": "homeowner", "operator": "eq", "value": "no" }, "next": "ineligible" }
]
```

### **Lead Scoring**
Configured per funnel in JSON:
```json
"scoring": [
  { "stepId": "ownership", "value": "homeowner", "points": 10 },
  { "stepId": "timeline", "value": "now", "points": 10 }
]
```
Calculated server-side in `/api/submit`.

### **Step Types**
- `single_select` — Radio buttons
- `multi_select` — Checkboxes
- `image_select` — Image cards
- `text_input` — Short text
- `textarea` — Long text
- `email_capture` — Email input (validated)
- `phone_capture` — Phone input (validated)
- `name_capture` — Name input
- `slider` — Range slider
- `loading_screen` — Animated spinner
- `results_page` — Thank you page

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
GOOGLE_SHEETS_API_KEY=xxxxx (optional)
```

Store in:
- **Local:** `.env.local`
- **Vercel:** Project Settings → Environment Variables

---

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # TypeScript check
npm start        # Run prod build locally
```

---

## File Navigation

| File | Purpose | Location |
|---|---|---|
| Types | All TypeScript interfaces | `lib/quiz-engine/types.ts` |
| Branching | Condition resolver | `lib/quiz-engine/resolver.ts` |
| State | Zustand store | `lib/store/quiz-store.ts` |
| Database | Supabase queries | `lib/supabase/queries.ts` |
| Quiz Renderer | Master component | `components/quiz/QuizRenderer.tsx` |
| Admin Dashboard | Funnel list | `app/(admin)/page.tsx` |
| Public Quiz | Dynamic page | `app/(public)/quiz/[slug]/page.tsx` |
| Submit API | Lead capture | `app/api/submit/route.ts` |
| Schema | Database tables | `supabase/migrations/001_initial.sql` |

---

## Deployment

### Vercel (Recommended)
```bash
# GitHub already connected
# Push to main → auto-deploys
git push origin main
```

1. Go to https://vercel.com/new
2. Import `quiz-funnel` repo
3. Add env vars
4. Deploy

### Self-Hosted
```bash
npm run build
npm start
```

---

## Performance Metrics

- **Dev startup:** 379ms
- **Build time:** 2.2s
- **TypeScript:** Zero errors
- **Bundle:** ~70KB gzipped
- **Target:** Lighthouse 90+

---

## Known Limitations (MVP)

- ⚠️ No visual drag-drop builder (form-based only)
- ⚠️ No A/B testing
- ⚠️ No email autoresponder
- ⚠️ No Slack/CRM integration (webhooks ready)
- ⚠️ No analytics dashboard yet

---

## Troubleshooting

**"Missing Supabase URL or key"**
→ Check `.env.local`, restart dev server

**"Quiz shows 'not found'"**
→ Verify slug matches exactly (case-sensitive)

**"Submissions not saving"**
→ Check Supabase RLS policies, verify tables exist

**"Google Sheets not updating"**
→ Verify Sheet ID is correct, check API key

---

## Testing Workflow

1. **Local:** `npm run dev` → `/admin` → create funnel → test `/quiz/[slug]`
2. **TypeScript:** `npm run build` (catches errors)
3. **Vercel:** Push to GitHub → auto-deploy → test live
4. **Supabase:** Check submissions table in dashboard

---

## Useful Links

- **GitHub:** https://github.com/KodeCollab/quiz-funnel
- **Supabase:** https://supabase.com
- **Vercel:** https://vercel.com
- **Docs:** `SETUP.md`, `QUIZ_PLATFORM.md`, `QUIZ_PLATFORM_LAUNCH.md`

---

## Architecture Diagram

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

---

## Code Style Notes

- **TypeScript:** Strict mode enabled
- **Components:** Functional, React hooks
- **Naming:** camelCase for functions, PascalCase for components
- **Imports:** Absolute paths via `@/` alias
- **Types:** Centralized in `lib/quiz-engine/types.ts`
- **Styling:** Tailwind utility classes
- **Comments:** Minimal (self-documenting code)

---

## Next Steps for Expansion

1. **Visual Builder** — Drag-drop step reordering
2. **Analytics Dashboard** — Conversion rates, dropoff by step
3. **A/B Testing** — Split test different flows
4. **Email Autoresponder** — Send results automatically
5. **Slack Notifications** — Alert on high-intent leads
6. **CRM Sync** — HubSpot, Pipedrive, Close integration
7. **Webhooks** — Custom integrations
8. **Multi-language** — i18n support

---

**Last Updated:** 2026-06-08  
**Status:** Production-ready MVP  
**Built With:** Claude Code + Next.js 15 + TypeScript
