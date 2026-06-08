# Quiz Funnel Platform

A modern, JSON-driven quiz funnel platform for lead generation. Build interactive quizzes without code, capture leads, and integrate with Google Sheets.

## Features

✨ **Quiz Engine**
- JSON-driven quiz configuration (no hardcoding)
- Branching logic based on user answers
- Full-screen, mobile-native UX
- Smooth Framer Motion transitions
- Progress tracking

👤 **Lead Capture**
- Address, name, email, phone capture steps
- Single/multiple select questions
- Text inputs, sliders, image selection
- Validation and error handling

📊 **Admin Dashboard**
- Form-based funnel builder
- Real-time preview
- Submissions tracker
- Lead scoring
- Export capabilities

🔗 **Integrations**
- Google Sheets (auto-append submissions)
- Webhooks (for custom integrations)
- Slack notifications (coming soon)

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Google Sheets API key (optional)

### Installation

1. **Clone and install**
```bash
cd quiz-funnel
npm install
```

2. **Set up Supabase**
   - Create a Supabase project at https://supabase.com
   - Run the migration in `supabase/migrations/001_initial.sql`
   - Get your URL and anon key

3. **Configure environment**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Run dev server**
```bash
npm run dev
# Visit http://localhost:3000/admin
```

## Architecture

```
quiz-funnel/
├── app/
│   ├── (public)/quiz/[slug]     ← Public quiz pages
│   ├── (admin)/                 ← Admin dashboard
│   └── api/submit               ← Submission API
├── components/
│   ├── quiz/                    ← Quiz UI components
│   └── admin/                   ← Admin UI components
├── lib/
│   ├── quiz-engine/            ← Core logic (types, resolver, validator)
│   ├── store/                  ← Zustand state management
│   ├── supabase/               ← Database queries
│   └── integrations/           ← Google Sheets, webhooks
└── supabase/
    └── migrations/             ← Database schema
```

## Creating a Quiz Funnel

### 1. Via Admin Dashboard
```
/admin → New Funnel → Configure steps → Publish
```

### 2. Via JSON Config

```json
{
  "slug": "solar",
  "name": "Solar Savings Quiz",
  "startStepId": "address",
  "theme": {
    "primaryColor": "#FF9332",
    "backgroundColor": "#FFFFFF",
    "fontFamily": "sans-serif"
  },
  "steps": [
    {
      "id": "ownership",
      "type": "single_select",
      "question": "Which best describes you?",
      "answers": [
        { "label": "Homeowner", "value": "homeowner", "next": "timeline" },
        { "label": "Renter", "value": "renter", "next": "disqualified" }
      ]
    },
    {
      "id": "email",
      "type": "email_capture",
      "question": "Where can we send your results?",
      "next": "results"
    },
    {
      "id": "results",
      "type": "results_page",
      "question": "Check your email for your personalized report!"
    }
  ]
}
```

## Step Types

- `single_select` — Radio button questions
- `multi_select` — Checkboxes
- `image_select` — Cards with images
- `text_input` — Short text
- `textarea` — Long text
- `email_capture` — Email input with validation
- `phone_capture` — Phone with validation
- `name_capture` — Name input
- `slider` — Range selector
- `loading_screen` — Animated loading page
- `results_page` — Thank you / results page

## Branching Logic

Control quiz flow with conditions:

```json
{
  "id": "bill",
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

## Lead Scoring

Configure scoring in your funnel JSON:

```json
{
  "scoring": [
    { "stepId": "ownership", "value": "homeowner", "points": 10 },
    { "stepId": "timeline", "value": "now", "points": 10 },
    { "stepId": "bill", "value": "high", "points": 10 }
  ]
}
```

Scores are calculated server-side and stored with submissions.

## Google Sheets Integration

1. Create a Google Service Account with Sheets API enabled
2. Add `GOOGLE_SERVICE_ACCOUNT_JSON` to `.env.local`
3. Enter Sheet ID in admin dashboard
4. Submissions auto-append to the sheet

Columns created: Timestamp | Name | Email | Phone | Address | Answers | Score

## API Routes

### POST `/api/submit`
Submit a completed quiz.

```json
{
  "funnelId": "uuid",
  "sessionId": "uuid",
  "answers": { "stepId": "value" },
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe",
  "leadScore": 30
}
```

Response:
```json
{
  "success": true,
  "submissionId": "uuid"
}
```

## State Management

Uses Zustand for quiz state:

```typescript
import { useQuizStore } from '@/lib/store/quiz-store'

const { answers, currentStepId, goNext, setAnswer } = useQuizStore()
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add env vars
4. Deploy

### Self-hosted

```bash
npm run build
npm run start
```

## Performance

- TypeScript strict mode
- Zero unused dependencies
- Dynamic imports for step components
- ISR (Incremental Static Regeneration) for funnels
- Optimized Framer Motion transitions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 90+)

## Future Features

- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Funnel templates library
- [ ] Multi-step webhook retries
- [ ] Custom CSS theming
- [ ] Slack notifications
- [ ] CRM integrations (HubSpot, Pipedrive)
- [ ] Form prefill via URL params
- [ ] Conditional step visibility
- [ ] Calculator steps

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build

# Type check
npm run lint
```

## Example Solar Funnel

Visit `/quiz/solar` after publishing the example template.

## License

Private project for WaveTen Solar UK.

## Support

For questions or issues, check the admin dashboard or database logs.
