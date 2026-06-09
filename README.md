# Quiz Funnel Platform

A modern, JSON-driven quiz funnel platform for lead generation. Build interactive quizzes without code, capture leads, and integrate with Google Sheets—no hardcoding required.

**[Get Started →](./SETUP.md)** | **[Features & Architecture →](./QUIZ_PLATFORM.md)** | **[Developer Guide →](./CLAUDE.md)**

## ✨ What It Does

- 🎯 **JSON-Driven Quizzes** — Configure funnels entirely in JSON, no code changes needed
- 🔀 **Smart Branching** — Route users based on their answers using conditional logic
- 📱 **Mobile-First** — Full-screen, responsive UX with Framer Motion animations
- 📊 **Lead Capture** — Email, phone, name, address, custom questions
- 🏆 **Lead Scoring** — Automatically score and qualify leads
- 📈 **Admin Dashboard** — Form-based builder, submission tracking, live preview
- 🔗 **Google Sheets Integration** — Auto-append submissions to a spreadsheet
- ⚡ **Production Ready** — TypeScript, Next.js 15, Supabase, deployed on Vercel

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/KodeCollab/quiz-funnel.git
cd quiz-funnel
npm install
```

### 2. Set Up Supabase (Free)
- Create a project at [supabase.com](https://supabase.com)
- Run the migration: `supabase/migrations/001_initial.sql`
- Copy your URL and Anon Key to `.env.local`

```bash
cp .env.local.example .env.local
# Edit with your Supabase credentials
```

### 3. Run Locally
```bash
npm run dev
# Visit http://localhost:3000/admin
```

### 4. Create Your First Quiz
- Click "New Funnel"
- Add steps (questions, email capture, etc.)
- Publish and test at `/quiz/[slug]`

**Full instructions:** [SETUP.md](./SETUP.md)

## Tech Stack

- **Framework:** Next.js 15 + React + TypeScript
- **Database:** Supabase (PostgreSQL)
- **State:** Zustand
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS
- **Deployed:** Vercel

## Step Types Supported

| Type | Use Case |
|------|----------|
| `single_select` | Radio button questions |
| `multi_select` | Checkboxes |
| `image_select` | Cards with images |
| `text_input` | Short text fields |
| `textarea` | Long text |
| `email_capture` | Email with validation |
| `phone_capture` | Phone with validation |
| `name_capture` | Name input |
| `slider` | Range selector |
| `loading_screen` | Spinner page |
| `results_page` | Thank you / results |

## Example: Solar Quiz

```json
{
  "slug": "solar",
  "name": "Solar Savings Quiz",
  "startStepId": "homeowner",
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
    {
      "id": "email",
      "type": "email_capture",
      "question": "Where should we send your estimate?",
      "next": "loading"
    },
    {
      "id": "loading",
      "type": "loading_screen",
      "question": "Calculating savings...",
      "next": "results"
    },
    {
      "id": "results",
      "type": "results_page",
      "question": "Check your email!"
    },
    {
      "id": "ineligible",
      "type": "results_page",
      "question": "Only homeowners qualify."
    }
  ]
}
```

## Smart Branching

Route users based on their answers:

```json
{
  "id": "budget",
  "type": "slider",
  "question": "Monthly energy bill?",
  "next": [
    {
      "condition": { "field": "bill", "operator": "gt", "value": 100 },
      "next": "high_intent"
    },
    {
      "condition": { "field": "bill", "operator": "lt", "value": 50 },
      "next": "low_intent"
    }
  ]
}
```

Operators: `eq`, `gt`, `lt`, `gte`, `lte`, `contains`

## Lead Scoring

Automatically qualify leads:

```json
{
  "scoring": [
    { "stepId": "homeowner", "value": "yes", "points": 10 },
    { "stepId": "timeline", "value": "now", "points": 10 },
    { "stepId": "budget", "value": "high", "points": 10 }
  ]
}
```

Scores calculated server-side and stored with every submission.

## Integrations

### Google Sheets (Built-in)
Auto-append submissions to a Google Sheet with timestamps, names, emails, scores, and full responses.

### Webhooks (Ready)
Send submissions to custom endpoints for CRM, Slack, email, or other integrations.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # TypeScript check
npm start        # Run production build
```

## Deployment

### Vercel (Recommended)
```bash
git push origin main
# → Auto-deploys via GitHub integration
```

[Full deployment guide →](./SETUP.md#step-5-deploy-to-vercel-5-mins)

### Self-Hosted
```bash
npm run build
npm start
```

## Documentation

- **[SETUP.md](./SETUP.md)** — First-time setup, environment config, testing
- **[QUIZ_PLATFORM.md](./QUIZ_PLATFORM.md)** — Full feature overview, API reference
- **[CLAUDE.md](./CLAUDE.md)** — Developer quick-reference, architecture, common tasks
- **[.claude/](./\_claude/)** — Detailed technical docs (architecture, development, API, database)

## Project Structure

```
quiz-funnel/
├── app/
│   ├── (public)/quiz/[slug]/    ← Public quiz pages
│   ├── (admin)/                 ← Admin dashboard
│   └── api/submit/              ← Submission API
├── components/
│   ├── quiz/                    ← Quiz components
│   └── admin/                   ← Admin components
├── lib/
│   ├── quiz-engine/             ← Core logic (types, resolver)
│   ├── store/                   ← Zustand store
│   ├── supabase/                ← Database queries
│   └── integrations/            ← Google Sheets, webhooks
├── supabase/
│   └── migrations/              ← Database schema
└── .claude/
    ├── architecture.md          ← Project structure
    ├── development.md           ← Common tasks
    ├── api.md                   ← Types & functions
    └── database.md              ← Schema & queries
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS 14+, Android 90+

## Performance

- Dev startup: ~400ms
- Build time: ~2.2s
- TypeScript: Zero errors
- Bundle: ~70KB gzipped
- Lighthouse: 90+

## Known Limitations (MVP)

- No visual drag-drop builder yet (form-based only)
- No A/B testing
- No email autoresponder
- No built-in Slack integration (webhooks ready)

## Roadmap

- [ ] Visual drag-drop builder
- [ ] A/B testing framework
- [ ] Funnel templates
- [ ] Analytics dashboard
- [ ] Email autoresponder
- [ ] Slack notifications
- [ ] CRM integrations (HubSpot, Pipedrive)
- [ ] Form prefill from URL params
- [ ] Multi-language support

## Support

- 📖 Read [SETUP.md](./SETUP.md) for first-time setup
- 🏗️ See [.claude/](./\.claude/) for detailed technical docs
- 🐛 Check the admin dashboard or database logs for debugging
- 💬 GitHub: [KodeCollab/quiz-funnel](https://github.com/KodeCollab/quiz-funnel)

## License

Private project for WaveTen Solar UK.

---

**Last Updated:** 2026-06-09  
**Built with:** Claude Code + Next.js 15 + TypeScript
