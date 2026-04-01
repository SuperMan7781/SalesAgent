# MVP Flow — Autonomous SDR for American Screening Corporation

**Volume**: 2,500 leads/month (~115/day × 22 working days)
**Goal**: CEO uploads a CSV → gets hyper-personalized emails → approves → emails go out → everything logged in HubSpot

---

## Step 1: Login & Onboarding

**What happens**: CEO logs in via Google OAuth (Supabase Auth). First-time setup wizard collects 3 things:

1. **Value Proposition** — "What does American Screening sell?" → text input, AI refines it into a tight 2-line pitch
2. **ICP Definition** — Who to target: industry tags, company size range, target roles (HR Directors, Compliance Officers, etc.)
3. **Tone Selection** — Pick from 3 sample email styles (Professional, Direct, Casual) or paste 2–3 past emails they liked

**One-time. Takes 90 seconds. Never shown again unless they want to edit in Settings.**

---

## Step 2: Upload Leads

**What happens**: CEO drags a CSV file onto the upload zone.

**Required columns**: Name, Email, Company, LinkedIn URL
**Optional columns**: Title, Phone, Company Website

**Features**:
- Auto-detects column mapping (smart header matching)
- Shows row count: "2,500 leads found. 12 rows missing email — will be skipped."
- Validates emails format (not verification — that comes later)
- Deduplicates against previously uploaded leads
- Stores all leads in DB with status: `pending`

**What CEO sees**: A clean upload confirmation with lead count and any flagged rows.

---

## Step 3: Research Agent (Enrichment)

**What happens**: System processes each lead through 3 data sources in parallel:

| Source | Data Pulled |
|---|---|
| **Proxycurl** | LinkedIn headline, current role, tenure, recent posts, career moves |
| **Apollo.io** | Company size, industry, funding status, tech stack, open job postings |
| **Exa.ai** | Recent company news — press releases, funding announcements, product launches |

**Output per lead**: A structured research dossier — all facts organized and ready for the AI agents.

**What CEO sees**: Real-time progress bar — "Researching lead 847 of 2,500" updating live via WebSocket. Each lead's status flips from `pending` → `researched`. If a source returns nothing, lead is marked `thin_data` (not blocked — proceeds with whatever data exists).

**Thin data fallback**: If LinkedIn is empty and no news found, system uses company-level data only (industry, size, hiring signals). The Strategist adapts its hook accordingly.

---

## Step 4: Gatekeeper Agent (ICP Filter)

**What happens**: Each researched lead is checked against the ICP criteria set in onboarding.

**Checks**:
- Does the company match target industry/size?
- Is the person's role relevant (HR, Compliance, Operations)?
- Is the company in the right geography?
- Is there enough data to write a quality email?

**Decision**: Pass ✅ or Fail ❌ with a one-line reason.

**What CEO sees**: "2,100 of 2,500 leads qualified. 400 filtered out." They can click any filtered lead to see the exact rejection reason (e.g., "Company is a 2-person startup — below minimum size of 50"). Filtered leads are visible but greyed out. CEO can manually override and force-approve any filtered lead.

**LLM used**: Llama 3 via Groq (free, fast — binary decision doesn't need Claude).

---

## Step 5: Strategist Agent (Hook Selection)

**What happens**: For each qualified lead, AI picks the single strongest email angle by cross-referencing the research dossier with ASC's value proposition.

**Example hooks it might choose**:
- "They just posted 3 HR roles → scaling team → need background checks at scale"
- "Recent expansion to Texas office → new state compliance requirements"
- "CEO posted about workplace safety on LinkedIn → align with screening"

**Output per lead**: The selected hook + a one-line reasoning why this angle will resonate.

**What CEO sees**: Per lead — the chosen angle with reasoning. This is visible in the review queue so the CEO understands *why* each email says what it says.

**LLM used**: Claude Sonnet (needs high reasoning quality to pick the best angle).

---

## Step 6: Drafter Agent (Email Writing)

**What happens**: Writes one hyper-personalized email per lead.

**Rules enforced**:
- First sentence = a real fact about the prospect or their company → bridges to ASC's value
- Maximum 100 words (optimized for mobile/C-suite readability)
- No spam trigger words (free, guarantee, act now, etc.)
- Ends with a soft CTA (e.g., "Worth a 10-min call this week?")
- Uses the tone selected during onboarding

**Output per lead**: One email draft (subject line + body).

**LLM used**: Claude Sonnet.

---

## Step 7: Critic Agent (Quality Gate)

**What happens**: Reviews each draft against the original research dossier.

**Checks**:
- **Factual accuracy** — does the email reference real data from the dossier, not hallucinated facts?
- **Tone match** — does it match the selected tone?
- **Length** — under 100 words?
- **Spam score** — any trigger words or patterns?
- **Relevance** — does the hook actually connect to ASC's offering?

**Decision**:
- ✅ **Approved** → moves to Review Queue
- ❌ **Rejected** → sent back to Drafter with specific fix instructions (max 2 retries → then flagged for human review)

**What CEO sees**: Each email has a quality score (1–10) and spam score (low/medium/high) visible in the review queue.

**LLM used**: Claude Sonnet.

---

## Step 8: Review Queue (CEO's Main Screen)

**This is where the CEO spends 80% of their time.**

**Layout**: Left panel = scrollable lead list with status indicators. Right panel = full email preview for the selected lead.

**Per lead, CEO sees**:
- The email draft (subject + body)
- Research context (collapsible — what was found about this person/company)
- The hook reasoning (why this angle was chosen)
- Quality score + spam score
- Lead status indicator

**Actions per lead**:
| Action | What It Does |
|---|---|
| **Approve** | Email queued for sending via Smartlead |
| **Edit** | Email becomes editable inline — CEO tweaks wording, then approves |
| **Regenerate** | Sends back through Drafter + Critic with same research, produces a fresh draft |
| **Skip** | Moves to bottom of queue — revisit later |
| **Discard** | Permanently removes from queue |

**Bulk actions**:
- "Approve All" — approves every email in queue (with confirmation)
- "Send All Approved" — pushes all approved emails to Smartlead

**Keyboard shortcuts**: A (approve), E (edit), R (regenerate), S (skip), D (discard), ← → (navigate). Power user can clear 100 emails in under 5 minutes.

**Target**: CEO should be able to review and approve 100 emails in a single sitting without friction.

---

## Step 9: Send via Smartlead

**What happens**: All approved emails are pushed to Smartlead via API.

**Smartlead handles**:
- **Inbox rotation** — distributes sends across 3–5 connected email accounts
- **Warmup** — maintains domain reputation with automated warmup conversations
- **Throttling** — random 45–180s gaps between sends, mimics human behavior
- **Timezone delivery** — sends during prospect's business hours (8–11 AM, 2–4 PM their time)
- **Bounce detection** — identifies hard/soft bounces, auto-removes bad emails

**What CEO sees**: Real-time send counter — "67 of 100 emails delivered today" updating live. Each lead's status updates: `approved` → `sending` → `sent` or `bounced`.

**Smartlead webhooks fire back to your app**:
- `email_sent` → status = sent, timestamp logged
- `email_opened` → open tracked
- `email_replied` → reply detected, lead flagged
- `email_bounced` → lead marked bounced with reason

---

## Step 10: HubSpot Sync (Automatic, Background)

**What syncs and when**:

| Event | What Gets Pushed to HubSpot |
|---|---|
| Lead qualifies (Step 4) | Contact created/updated in HubSpot (name, email, company, title, LinkedIn) |
| Email sent (Step 9) | Email activity logged on contact's timeline (subject, body, timestamp) |
| Email opened | Engagement event on contact |
| Reply detected | Contact updated, engagement status changed |
| Positive reply | Deal created in HubSpot pipeline (stage: "Meeting Requested") |

**What CEO sees**: Per lead — "Synced to HubSpot ✅" or "Sync pending ⏳". A small HubSpot icon next to each lead confirms the data is there. CEO never has to manually enter anything into HubSpot.

**All sync operations run through a retry queue** — if HubSpot API fails, it retries 3x before flagging.

---

## Step 11: Dashboard (Command Center)

**What CEO sees when they log in**:

**4 metric cards at the top** (with animated count-up on load):
- Total Emails Sent (this month)
- Open Rate (%)
- Reply Rate (%)
- Leads in Queue (pending review)

**Campaign table below**:
- Each upload = one campaign row
- Columns: Campaign name, date, leads uploaded, qualified, drafted, approved, sent, opened, replied, bounced
- Status pill: 🟢 Active, 🟡 Processing, ✅ Complete

**Activity feed** (right sidebar):
- Real-time ticker: "Sarah at Acme Corp opened your email — 2 min ago"
- "New reply from John at TechCo — positive sentiment"

**Everything is clickable** — click any metric to drill into the underlying lead data.

---

## Step 12: Settings

**What's configurable**:
- Edit value proposition and ICP criteria
- Change email tone
- Connect/disconnect email accounts (for Smartlead)
- Connect/disconnect HubSpot
- View API usage and costs
- Team member management (future)

---

## Monthly Cost at 2,500 Leads/Month

| Service | What It Does | Monthly Cost |
|---|---|---|
| **Smartlead Basic** | Sending, inbox rotation, warmup, webhooks | $39 |
| **Apollo.io Basic** | Company + people enrichment | $49 |
| **Proxycurl** | LinkedIn profiles (2,500 × $0.01) | $25 |
| **Exa.ai Starter** | Company news search | $10 |
| **Claude Sonnet API** | Strategist + Drafter + Critic (2,500 × 3 calls × ~800 tokens) | $25–35 |
| **Groq (Llama 3)** | Gatekeeper agent | $0 (free) |
| **Supabase Pro** | Database, auth, row-level security | $25 |
| **HubSpot Free CRM** | Contact sync, activity logging, deals | $0 |
| **Vercel** | Frontend hosting | $0 |
| **Railway** | Backend + background workers | $10 |
| **Sending domains (5)** | Amortized annual cost | $5 |

| | |
|---|---|
| **Total Monthly Operating Cost** | **$188–198** |
| **Round figure** | **~$200/month (₹16,600)** |

---

## What "Production-Grade" Means in This MVP

| Quality Marker | How We Hit It |
|---|---|
| **Never shows a blank screen** | Every page has a designed empty state with a clear CTA |
| **Never loses data** | Every lead state change is persisted to DB immediately |
| **Never silently fails** | Failed enrichment, rejected drafts, bounce events — all visible to the CEO with reasons |
| **Feels fast** | WebSocket real-time updates, skeleton loaders during data fetch, instant UI response on every action |
| **Looks premium** | Dark mode, glassmorphism cards, smooth animations, professional typography (Inter font), no default browser styling anywhere |
| **Full audit trail** | CEO can click any lead and see its complete journey: uploaded → researched → qualified → hook chosen → drafted → critic score → approved → sent → opened/replied |
| **HubSpot is always in sync** | Retry queue ensures zero data loss between your app and HubSpot |
| **Mobile-readable emails** | ≤100 words, no heavy HTML, clean plain-text-first design |

---

## What Is NOT in the MVP (Phase 2)

- Multi-step follow-up sequences (Day 3, Day 7 auto-follow-ups)
- Reply management inside the app (replies go to CEO's inbox directly)
- A/B testing between email angles
- Tone learning from past winning emails
- LinkedIn outreach (connect + comment before emailing)
- Full autopilot mode (zero human review)
- Team seats / multi-user access
- API access for external integrations
