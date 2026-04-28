# ReviewLoop — Continuous Customer Feedback for SaaS Teams

> **Status:** MVP shipped · Active development  
> **Type:** B2B SaaS · Feedback intelligence platform

---

## 1. Product Overview

ReviewLoop is a lightweight feedback collection and triage tool built for early-stage SaaS teams that are past their first 50 customers but not yet ready for a full VoC platform. It embeds a single-question pulse survey directly inside the product, routes responses to the right team member based on topic classification, and surfaces actionable signal in a shared dashboard — without requiring a data analyst to interpret the results. The goal is to close the gap between "we have feedback" and "we know what to build next." It is not a replacement for qualitative research — it is the bridge between ad-hoc conversations and structured product decisions.

---

## 2. Problem Statement

**Who has the problem:**  
Product managers and founders at B2B SaaS companies with 50–500 customers who are moving from founder-led sales into a scalable growth phase.

**How it is solved today:**  
Feedback arrives through a mix of Intercom conversations, NPS tools, sales call notes in Notion, and Slack messages from customer success. Each team member holds a fragment of the picture. Synthesis happens manually, usually once a quarter, usually by one overworked PM.

**Why that is not optimal:**  
- Signal decays fast. A complaint in January is irrelevant by March if the sprint already passed.  
- No single source of truth means different teams prioritize based on the loudest voice, not the clearest data.  
- Manual synthesis is a bottleneck — it does not scale, and it introduces recency and confirmation bias.

---

## 3. Proposed Solution

ReviewLoop embeds a non-intrusive in-app survey triggered by behavioral events (e.g., after a user completes a key workflow for the third time). Responses are classified by topic using a rules-based tagger (with an ML upgrade planned), then routed to a team-specific inbox — product gets feature requests, CS gets churn signals, engineering gets bug reports.

**Core user behaviors / use cases:**

| Actor | Use Case |
|---|---|
| PM | Reviews weekly digest of top themes; links feedback to active roadmap items |
| CS Manager | Sees real-time churn-risk signals and triggers follow-up workflow |
| Founder | Checks North Star movement on the executive dashboard |
| Customer | Answers one contextual question in under 20 seconds; feels heard |

---

## 4. Key Product Decisions

### Decision 1 — Single question per trigger, not a form
**Why:** Completion rates for multi-question in-app surveys drop by ~60% after the second question (based on Hotjar and Typeform benchmarks). The value is in volume and consistency, not depth. Depth comes from follow-up interviews triggered by the data.

### Decision 2 — Rules-based classifier first, ML later
**Why:** An ML model needs labeled training data. We do not have that at MVP. A well-maintained rules-based tagger (keyword + intent matching) gets us to ~80% accuracy fast, lets us ship, and generates the labeled dataset we need to train a real model later. Starting with ML would have added 6–8 weeks and introduced unpredictable latency.

### Decision 3 — Monolithic architecture for MVP
**Why:** We are a team of two engineers. Microservices introduce operational overhead (service discovery, inter-service auth, distributed tracing) that we cannot absorb at this stage without slowing velocity to a halt. A well-structured monolith with clear module boundaries ships faster, is easier to debug, and can be decomposed later when we have a clear scaling bottleneck — not before.

### Decision 4 — No custom dashboard builder
**Why:** The temptation was to make dashboards configurable. We resisted. Every team we spoke to wanted the same three views: theme trends, response volume, and churn-risk signals. Custom dashboards are a distraction at this stage — they shift effort from insight to infrastructure and delay the moment we learn whether the core value prop works.

---

## 5. Alternatives & Trade-offs

### Alternative A — Build on top of an existing NPS tool (Delighted, AskNicely)
**Why we considered it:** Fast to launch, no infrastructure to maintain, familiar format for customers.  
**Why we did not choose it:** NPS is a single metric optimized for benchmarking, not for actionable product decisions. It tells you sentiment, not cause. Routing and triage features are either absent or locked behind expensive enterprise tiers. We would be constrained by their data model, unable to build the classification layer that is core to our value.

### Alternative B — Async video feedback (Loom-style)
**Why we considered it:** Rich qualitative signal, customers love the format, high emotional fidelity.  
**Why we did not choose it:** Video is high friction for the respondent and high cost for the analyst. Transcription and synthesis are not solved problems at MVP scale. It works well as a research tool — not as a continuous feedback loop. We may revisit this as a premium add-on for customer discovery sessions.

### Alternative C — Slack-native feedback bot
**Why we considered it:** Zero onboarding friction for teams already in Slack, meets users where they are.  
**Why we did not choose it:** Feedback collected in Slack stays in Slack. It does not integrate naturally with in-product behavioral triggers, and it excludes the customer entirely from the loop. It is a tool for internal discussion, not structured signal collection. We built a Slack notification layer instead — the best of both worlds.

---

## 6. MVP Scope

### Included
- In-app survey widget (embeds via script tag, one JS file)
- Behavioral trigger engine (3 trigger types: event-based, time-based, session milestone)
- Rules-based topic classifier (15 categories, configurable per workspace)
- Team inbox with read/unread state and basic filtering
- Weekly digest email (auto-generated, no configuration needed)
- Churn-risk flag (triggered when sentiment score drops below threshold 2x in 14 days)
- Basic dashboard: theme trends (7/30/90 day), response volume, average sentiment

### Intentionally excluded from MVP
- Custom dashboard builder — adds complexity, delays validation of core loop
- ML-based classifier — needs labeled data we do not yet have
- Integrations (Jira, Linear, Salesforce) — valuable, but they extend the workflow, they do not validate it
- Multi-language support — English-only until we have non-English customers asking for it
- Mobile SDK — our initial customers are desktop-first SaaS tools
- Admin roles and permissions — one workspace, one team for now; RBAC adds auth complexity without MVP-stage value

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT PRODUCT                    │
│         (customer's web app, script tag embed)       │
└─────────────────────┬────────────────────────────────┘
                      │ HTTPS / REST
┌─────────────────────▼────────────────────────────────┐
│              REVIEWLOOP MONOLITH (Node.js)           │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Trigger    │  │  Classifier  │  │  Digest     │ │
│  │  Engine     │  │  (rules)     │  │  Generator  │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │              REST API layer (Express)           │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────┬────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼──────┐           ┌─────────▼──────┐
│  PostgreSQL  │           │     Redis       │
│  (primary    │           │  (session cache │
│   data store)│           │   + rate limit) │
└──────────────┘           └────────────────┘
```

**Frontend:** Vanilla JS widget (embed) + React dashboard (internal team UI)  
**Backend:** Node.js / Express monolith — chosen for team familiarity and fast iteration  
**Data:** PostgreSQL for all persistent data; Redis for caching and rate limiting  
**Architecture:** Monolith with modular internal structure (trigger, classifier, digest, API modules)  
**Hosting:** Railway (MVP) — zero-config deploys, Postgres and Redis add-ons built in

---

## Metrics & Success

### North Star Metric
**Weekly Active Workspaces** — the number of distinct customer workspaces that received at least one classified and routed feedback response in a given week.

*Why this metric:* It captures the full value chain — a workspace is "active" only if a customer responded (adoption), the classifier worked (product quality), and routing fired (workflow integration). A workspace that signed up but never collected feedback is not receiving value. This metric cannot be gamed by internal activity.

### Supporting KPIs

| KPI | What it measures | Why it matters |
|---|---|---|
| Survey completion rate | % of triggered surveys answered | Validates widget UX and trigger timing |
| Classifier accuracy rate | % of responses correctly categorized (sampled weekly) | Signals when rules-based model needs expansion or ML upgrade |
| Time-to-route (p50, p95) | Time from response submission to inbox delivery | Ensures feedback is actionable before it decays |
| Weekly digest open rate | % of digest emails opened by team members | Measures whether feedback is reaching decision-makers |
| Churn-risk-to-action rate | % of churn-risk flags that triggered a CS follow-up | The ultimate proof that the loop is closed, not just monitored |

**How these metrics drive decisions:**  
- If completion rate drops below 35%, we revisit trigger timing and question wording before anything else.  
- If classifier accuracy drops below 75%, we pause new category additions and focus on data quality.  
- If churn-risk-to-action rate stagnates, the problem is workflow integration, not the product — we invest in CS onboarding, not features.

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/reviewloop.git
cd reviewloop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Postgres and Redis connection strings

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
# → API running at http://localhost:3000
# → Dashboard at http://localhost:3001
```

**Embed the widget in your product:**
```html
<script>
  window.ReviewLoop = { workspaceId: 'YOUR_WORKSPACE_ID' };
</script>
<script src="https://cdn.reviewloop.io/widget.js" async></script>
```

---

## Repository Structure

```
reviewloop/
├── src/
│   ├── api/          # Express routes and middleware
│   ├── classifier/   # Rules-based topic classification engine
│   ├── triggers/     # Behavioral trigger evaluation logic
│   ├── digest/       # Weekly email generation
│   └── db/           # Migrations, models, query helpers
├── dashboard/        # React frontend (team inbox + analytics)
├── widget/           # Embeddable JS survey widget
├── docs/
│   └── decisions/    # Architecture decision records (ADRs)
├── roadmap.md
├── .env.example
└── README.md
```

---

*Built by [Your Name] · Open to feedback and collaboration*
