<div align="center">

# ⚡ AutonomousSDR

### *The AI Sales Development Representative that outperforms humans — on Day 1.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Anthropic](https://img.shields.io/badge/Claude-Sonnet-D4A017?style=for-the-badge)](https://anthropic.com)

<br/>

> **Upload a CSV. Get 1,000 deeply researched, hyper-personalized emails drafted in 3 minutes. Send. Book meetings.**

<br/>

</div>

---

## 🎯 The Problem This Solves

Standard cold emails have a **<1% reply rate** because they look automated. SDR agencies charge ₹1–3 Lakhs/month and still produce templated slop. Both fail for the same reason: **zero real-time context on the prospect.**

AutonomousSDR acts like a rigorous human researcher for every single lead. It deep-dives across 5+ data sources in real-time, cross-references findings with your value proposition, and generates emails where **the first sentence is always a real-time fact about that specific prospect** — the way the best human SDRs operate, but at machine speed.

| Metric | Industry Average | AutonomousSDR |
|--------|-----------------|---------------|
| Cold email reply rate | <1% | **10–15%+** |
| Time to draft 1,000 emails | 2–4 weeks (human SDR) | **2–4 minutes** |
| Cost per lead (researched + drafted) | ₹500–2,000/lead | **₹3.20/lead** |
| Emails per day | 50 (human SDR) | **50–300** |

---

## 🧠 Architecture — The 5-Agent Pipeline

AutonomousSDR uses a **sequential, multi-agent pipeline** where each agent has a narrow mandate and structured I/O. No monolithic prompts. No hallucination cascades. Full auditability.

```
CSV Upload → [Agent 1: Researcher] → [Agent 2: Gatekeeper] → [Agent 3: Strategist] → [Agent 4: Drafter] → [Agent 5: Critic] → Review Queue
```

| # | Agent | Role | Model |
|---|-------|------|-------|
| 1 | 🔬 **Researcher** | Enriches each lead across 5 data sources (Apollo, Proxycurl, Exa.ai, job boards, tech stack) | N/A — API orchestration |
| 2 | 🚦 **Gatekeeper** | Qualifies/disqualifies leads against your Ideal Customer Profile (ICP) rules | Llama 3 via Groq *(fast, cheap)* |
| 3 | 🎯 **Strategist** | Selects the highest-converting email hook from the research dossier | Claude Sonnet |
| 4 | ✍️ **Drafter** | Writes 3 variant emails (≤100 words each). First sentence = real-time fact → value prop bridge | Claude Sonnet |
| 5 | 🔍 **Critic** | Quality gates for tone, accuracy, spam triggers, hallucination detection | Claude Sonnet |

**Why 5 agents instead of 1 prompt?**
- **Auditability** — Every decision is traceable. See exactly *why* a lead was rejected and *which hook* was chosen.
- **Resilience** — A failure in Agent 1 doesn't corrupt Agent 4's output.
- **Tunability** — Swap Agent 5's critique rubric without touching any drafting logic.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 + TailwindCSS | SSR, edge rendering, ultra-fast dashboard |
| **Backend** | FastAPI (Python 3.11+) | Async I/O, Pydantic validation, OpenAPI docs |
| **Orchestration** | LangGraph | Stateful multi-agent routing with structured I/O |
| **Database & Auth** | Supabase (PostgreSQL + pgvector + RLS) | Multi-tenant isolation, vector embeddings, native auth |
| **LLMs** | Claude Sonnet + Llama 3/Groq | Best-in-class copy quality + ultra-fast binary decisions |
| **LLM Gateway** | LiteLLM / Portkey | Auto-failover, semantic caching, per-client cost tracking |
| **Data Enrichment** | Apollo.io + Proxycurl + Exa.ai | Company data, LinkedIn profiles, real-time news |
| **Email Delivery** | Smartlead.ai | Multi-inbox rotation, warmup, deliverability monitoring |
| **Email Verification** | ZeroBounce / NeverBounce | Pre-send validation, catch-all detection |
| **Queue & Rate Limiting** | Upstash (Serverless Redis) + Celery | API rate compliance, job orchestration at scale |
| **Infrastructure** | AWS ECS Fargate (auto-scaling) | Scales 2→50 containers in 90s for burst workloads |
| **Secrets** | AWS Secrets Manager | Encrypted OAuth tokens and API keys |

---

## ✨ Key Features

### 🔬 Deep-Dive Lead Enricher
Extracts intelligence from **5 data sources per lead** simultaneously:
- **Company website** — product focus, messaging, announcements *(Exa.ai)*
- **LinkedIn profile** — role tenure, career trajectory, recent activity *(Proxycurl)*
- **Press & news** — funding rounds, product launches, leadership changes *(Exa.ai)*
- **Job postings** — hiring signals (scaling engineering? hiring SDRs?) *(Apollo.io)*
- **Tech stack** — current tools in use (identify displacement opportunities) *(Apollo.io)*

### 🎯 Hyper-Personalized Drafting
- **3 variant angles per lead** — Casual/peer tone, Direct ROI, Congratulatory/trigger-based
- **Strict ≤100 words** — optimized for C-suite mobile readability
- **Spam score pre-check** — Critic agent flags trigger words before any email reaches the queue
- **Hook reasoning visible** — Users see *why* the AI wrote what it wrote

### ⚡ Keyboard-First Review Queue
Clear 100 deeply researched emails in **under 5 minutes**:
| Key | Action |
|-----|--------|
| `A` | Approve — swooshes left with green flash |
| `R` | Regenerate — new draft slides in from right |
| `E` | Edit inline — cursor auto-focuses on draft |
| `S` | Skip — card fades, moves to queue end |
| `D` | Discard — red flash + 5s undo toast |
| `← →` | Navigate between leads |
| `1 2 3` | Switch email variant tabs |
| `Cmd+K` | Command palette |

### 📊 Analytics & ROI Tracking
- **Funnel visualization**: Sent → Opened → Replied → Positive → Meeting Booked
- **Angle A/B heatmap**: Which tone × industry × seniority combo converts best
- **Self-improving feedback loop**: Reply data feeds back into Agent 3's hook selection
- **ROI Calculator widget** — always visible, stakeholder-exportable as PDF

---

## 📁 Project Structure

```
SalesAgent/
├── backend/
│   ├── app/
│   │   ├── agents/          # The 5-agent pipeline (researcher, gatekeeper, strategist, drafter, critic)
│   │   ├── api/             # FastAPI route handlers
│   │   ├── core/            # Config, database, auth
│   │   ├── models/          # Pydantic schemas & DB models
│   │   └── services/        # Business logic layer
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── (app)/       # Authenticated app routes
│   │       │   ├── campaigns/
│   │       │   ├── review/
│   │       │   ├── analytics/
│   │       │   └── settings/
│   │       └── page.tsx     # Landing / onboarding
│   └── package.json
├── docs/                    # Architecture diagrams, API specs
└── autonomous_sdr_plan.md   # Full product blueprint
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project
- API keys: Anthropic (Claude), Groq, Apollo.io, Proxycurl, Exa.ai

### 1. Clone & configure

```bash
git clone https://github.com/your-username/SalesAgent.git
cd SalesAgent
```

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your API keys in backend/.env
```

```bash
# Frontend
cp frontend/.env.local.example frontend/.env.local
# Fill in your Supabase URL and anon key
```

### 2. Run the backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the onboarding wizard will guide you through setup.

### 4. (Optional) Run with Docker

```bash
cd backend
docker build -t autonomous-sdr-backend .
docker run -p 8000:8000 --env-file .env autonomous-sdr-backend
```

---

## 💰 Unit Economics

**Per client, per month (2,400 leads/month):**

| Cost | Per Lead | Monthly |
|------|----------|---------|
| Apollo.io enrichment | $0.012 | $28.80 |
| Exa.ai news/web research | $0.008 | $19.20 |
| Claude Sonnet (3 agents) | $0.015 | $36.00 |
| Llama 3/Groq (filter) | $0.001 | $2.40 |
| Email verification | $0.004 | $9.60 |
| **Total variable cost** | **$0.04** | **$96.00** |

**Pricing tiers:**

| Tier | Leads/Day | Monthly Price | Gross Margin |
|------|-----------|--------------|-------------|
| Growth | 50 | ₹25,000 | ~73% |
| Pro | 100 | ₹45,000 | ~78% |
| Enterprise | 300 | ₹1,00,000+ | ~80% |

---

## 🏗️ Infrastructure Architecture

```
              ┌──────────────────────┐
              │    Vercel (CDN)       │
              │   Next.js Frontend    │
              └──────────┬───────────┘
                         │ API Calls
                         ▼
              ┌──────────────────────┐
              │   AWS API Gateway     │
              │   + Rate Limiting     │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   FastAPI Backend     │
              │   (AWS ECS Fargate)   │
              │   Auto-scaling 1–50   │
              └──────────┬───────────┘
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │   Upstash    │  │   LiteLLM    │
│ (PostgreSQL  │  │ (Redis Queue │  │   Gateway    │
│  + pgvector) │  │  + Rate Lim) │  │ (LLM Router) │
└──────────────┘  └──────────────┘  └──────────────┘
                                            │
                          ┌─────────────────┼──────────────────┐
                          ▼                 ▼                  ▼
                   Claude Sonnet       Llama 3/Groq        GPT-4o
                   (Primary)           (Filter Agent)      (Failover)
```

**Auto-scaling in action:** When 5 clients upload 1,000 leads simultaneously, AWS ECS sees 5,000 pending Redis jobs and scales from 2 idle containers to 50 workers in ~90 seconds — burning through the backlog and scaling back down, paying only for compute used.

---

## 🔒 Security & Compliance

- **Multi-tenant isolation** — Row-Level Security (RLS) in Supabase; no Client A can ever access Client B's data
- **Encryption** — AES-256 at rest, TLS 1.3 in transit
- **Secrets** — All OAuth tokens and API keys stored in AWS Secrets Manager (never logged, never UI-exposed)
- **CAN-SPAM** — Unsubscribe links auto-appended; honored within 24 hours
- **GDPR** — Prospect data auto-purged after 90 days; erasure requests processed within 72 hours
- **LinkedIn data** — Sourced exclusively via **Proxycurl** (licensed LinkedIn data partner). Zero direct scraping.

---

## 🗺️ Roadmap

**Phase 1 (Weeks 1–5) — Complete Product Launch** ✅
- Full 5-agent pipeline, CSV upload, real-time WebSocket progress
- Command Center, Review Queue, Campaign Builder, Analytics Dashboard
- Dark mode, keyboard shortcuts, skeleton loaders, empty states, Cmd+K palette

**Phase 2 (Weeks 6–10) — Activate Locked Features**
- [ ] Multi-step follow-up sequences (Day 3, 7 auto-follow-ups)
- [ ] Domain warmup automation & timezone-aware send windows
- [ ] A/B testing engine (angle × industry × seniority heatmap)
- [ ] HubSpot CRM two-way sync
- [ ] Tone learning via pgvector (embed winning emails for style matching)

**Phase 3 (Weeks 11–16) — Scale & Moat**
- [ ] Full Autopilot Mode (zero-intervention research → send)
- [ ] Omnichannel: LinkedIn connect + post engagement before emailing
- [ ] Salesforce integration + Zapier/Webhook layer
- [ ] Self-improving Strategist: reply data → hook selection optimization
- [ ] White-label branding for agencies

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change. For significant changes, reference the [architecture blueprint](autonomous_sdr_plan.md) to ensure alignment with the platform's design philosophy.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

*This platform doesn't compete with email tools. It competes with human SDRs — and wins on speed, consistency, cost, and scale.*

*Built to be bootstrapped. Designed to scale. Ready to charge for on Day 1.*

</div>
