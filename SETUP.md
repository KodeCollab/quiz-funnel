# Quiz Funnel Platform — Setup Guide

Your quiz funnel platform is ready to launch. Here's what you need to do next.

## Step 1: Create Supabase Project (5 mins)

1. Go to https://supabase.com and sign up
2. Create a new project (free tier is fine)
3. Copy your **Project URL** and **Anon Key** from Settings → API
4. In the SQL Editor, paste the contents of `supabase/migrations/001_initial.sql` and run it

## Step 2: Configure Environment Variables (2 mins)

1. Copy your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

2. Test locally:
```bash
npm run dev
# Visit http://localhost:3000/admin
```

## Step 3: Create Your First Funnel (10 mins)

1. Visit `/admin`
2. Click "New Funnel"
3. Fill in:
   - **Name:** "Solar Savings Quiz"
   - **Slug:** "solar" (used in URL)
4. Click "Create"
5. Add steps (example configuration below)
6. Publish and test at `/quiz/solar`

## Example: Solar Quiz Steps

### Step 1: Homeowner Question
```json
{
  "id": "homeowner",
  "type": "single_select",
  "question": "Which best describes you?",
  "answers": [
    { "label": "Homeowner", "value": "yes", "next": "timeline" },
    { "label": "Renter", "value": "no", "next": "disqualified" }
  ]
}
```

### Step 2: Timeline
```json
{
  "id": "timeline",
  "type": "single_select",
  "question": "When are you looking to install solar?",
  "answers": [
    { "label": "Right now", "value": "now", "next": "email" },
    { "label": "Within 3 months", "value": "3mo", "next": "email" },
    { "label": "Just exploring", "value": "exploring", "next": "email" }
  ]
}
```

### Step 3: Email
```json
{
  "id": "email",
  "type": "email_capture",
  "question": "Where should we send your personalized estimate?",
  "next": "name"
}
```

### Step 4: Name
```json
{
  "id": "name",
  "type": "name_capture",
  "question": "What's your name?",
  "next": "phone"
}
```

### Step 5: Phone
```json
{
  "id": "phone",
  "type": "phone_capture",
  "question": "What's your phone number? We'll call with your results.",
  "next": "loading"
}
```

### Step 6: Loading
```json
{
  "id": "loading",
  "type": "loading_screen",
  "question": "Calculating your savings...",
  "next": "results"
}
```

### Step 7: Results
```json
{
  "id": "results",
  "type": "results_page",
  "question": "Your personalized solar report is ready!",
  "description": "Check your email for full details."
}
```

### Step 8: Disqualified (Optional)
```json
{
  "id": "disqualified",
  "type": "results_page",
  "question": "Sorry, you're not eligible right now.",
  "description": "Only homeowners can install solar panels."
}
```

## Step 4: Google Sheets Integration (Optional, 10 mins)

To auto-send submissions to Google Sheets:

1. Create a Google Sheet
2. Copy the **Sheet ID** from the URL: `...docs.google.com/spreadsheets/d/{SHEET_ID}/...`
3. In `/admin`, go to Settings
4. Paste the Sheet ID
5. Set up Google Sheets API (advanced setup) or use Zapier webhook

### Google Sheets Column Headers
When you first submit, create headers in your sheet:
```
Timestamp | Name | Email | Phone | Address | Answers | Lead Score
```

## Step 5: Deploy to Vercel (5 mins)

1. Vercel auto-detects Next.js. Just push to GitHub:
```bash
git push origin main
```

2. Go to https://vercel.com/new
3. Import the `quiz-funnel` repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

Your quiz will be live at: `https://quiz-funnel-kean.vercel.app/admin`

## Testing

### Public Quiz
Visit `/quiz/solar` and answer all questions. You should see:
1. Progress bar at top
2. One question per screen
3. Smooth transitions
4. Loading screen after phone number
5. Success page with checkmark

### Admin Dashboard
Visit `/admin` and:
1. See your funnel listed
2. Click "Submissions" to see all responses
3. Check Supabase console for database entries
4. (If connected) Check Google Sheet for auto-appended row

## Troubleshooting

**"Missing Supabase URL or key"**
- Add values to `.env.local` and restart `npm run dev`

**Quiz shows "not found"**
- Make sure slug matches exactly (case-sensitive)
- Check funnel is marked as "active" in Supabase dashboard

**Submissions not saving**
- Check browser console for errors
- Verify Supabase tables exist (run migration)
- Check Supabase RLS policies allow inserts

**Google Sheets not updating**
- Sheet ID must be correct
- Google API key must be valid (if using API)
- Check `/api/sheets` endpoint exists

## Next Steps

### Add More Funnels
- Create new funnels via `/admin`
- Each gets its own URL: `/quiz/[slug]`
- Duplicate existing funnels to reuse structure

### Customize Theme
In funnel config, add:
```json
"theme": {
  "primaryColor": "#FF9332",
  "backgroundColor": "#FFFFFF",
  "fontFamily": "sans-serif",
  "buttonStyle": "rounded"
}
```

### Add Lead Scoring
In funnel config:
```json
"scoring": [
  { "stepId": "homeowner", "value": "yes", "points": 10 },
  { "stepId": "timeline", "value": "now", "points": 10 }
]
```

Scores appear in submissions and Google Sheet.

### Use Webhooks
For custom integrations (Slack, CRM, etc.):
```json
"webhookUrl": "https://your-webhook-url.com/quiz"
```

We'll add this to the API next.

## Support

- **Platform docs:** `QUIZ_PLATFORM.md`
- **GitHub repo:** https://github.com/KodeCollab/quiz-funnel
- **TypeScript types:** `lib/quiz-engine/types.ts`
- **Example config:** Solar quiz in `/admin`

## What's Included

✅ Full quiz engine (JSON-driven, no hardcoding)
✅ Admin dashboard (form-based builder)
✅ Supabase integration (database + RLS)
✅ Google Sheets API support
✅ Mobile-first responsive design
✅ Lead scoring + submission tracking
✅ Production-ready TypeScript
✅ Deploy-ready for Vercel

## What's Next (Future Enhancements)

- [ ] Visual drag-drop builder
- [ ] Multi-step form validation
- [ ] A/B testing framework
- [ ] Funnel analytics dashboard
- [ ] Email autoresponder
- [ ] Slack notifications
- [ ] HubSpot / Pipedrive integration
- [ ] Custom CSS theming UI
- [ ] Form prefill from URL params

---

**You're ready to launch!** 🚀

Any questions? Check the code comments or reach out.
