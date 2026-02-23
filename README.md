# Cortex

**Persistent memory for AI agents. Cross-project intelligence that compounds.**

![Cortex Topics Overview — 9 active projects with threads, decisions, and tasks tracked across domains](docs/images/topics-overview.png)

## Get Started in 5 Minutes

### What you need first

- [Node.js 20+](https://nodejs.org/) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- An [OpenAI API key](https://platform.openai.com/api-keys) (for AI research features)
- A [Tavily API key](https://tavily.com/) (for web search — free tier works)

### Install Cortex

Open a terminal and run:

```powershell
git clone https://github.com/gorfein/cortex.git
cd cortex
.\setup.ps1
```

When it finishes, edit `cortex\.env` and paste in your API keys:
```
OPENAI_KEY=sk-your-actual-key
TAVILY_API_KEY=tvly-your-actual-key
```

Then start Cortex (**leave this terminal open** — Cortex runs as a background service):
```powershell
pnpm dev
```

### Connect a project to Cortex

Now go to any project you want to give persistent memory to:

```powershell
cd C:\path\to\your-project
C:\path\to\cortex\integrate.ps1
```

**Done.** Open Claude Code in that project directory. The agent automatically has access to Cortex.

> Repeat `integrate.ps1` for every project you want connected. It takes seconds.

### Give this to your Claude Code agent

If you want your Claude Code agent to handle the entire setup for you, open Claude Code in any directory and paste this (fill in the blanks):

```
Clone and install Cortex from https://github.com/gorfein/cortex.git

1. Clone the repo to C:\Users\me\cortex (or wherever you prefer)
2. Run .\setup.ps1 in the cloned directory
3. Edit .env and set:
   OPENAI_KEY=__paste_your_openai_key__
   TAVILY_API_KEY=__paste_your_tavily_key__
4. Run `pnpm dev` in the background to start the Cortex server
5. Run .\integrate.ps1 -TargetDir __paste_this_project_path__ to connect this project
6. Verify by calling cortex_get_context

Prerequisites: Node.js 20+, Docker Desktop (must be running), pnpm.
Login: admin@cortex.local / admin123
```

### Verify it works

In Claude Code (in your integrated project), say:
```
Call cortex_get_context to see the knowledge base.
```

If you see a workspace overview with topics — you're done.

| Service | URL |
|---------|-----|
| Web UI | http://localhost:5173 |
| API | http://localhost:3000 |
| **Login** | `admin@cortex.local` / `admin123` |

---

## Why Cortex?

Every time you start a Claude Code session, your agent starts from zero. It doesn't know what you tried last week, what failed, what worked, or what another agent discovered in a different project. You re-explain context. It re-derives conclusions. You both waste time. Cortex fixes that.

It's a self-hosted platform that connects to [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (and any MCP-compatible client) via the [Model Context Protocol](https://modelcontextprotocol.io/). Agents document their work as they go — decisions, dead ends, results, open questions — and the next agent inherits all of it.

### Cross-project pollination creates genuinely new ideas

This is the part most people miss. When your trading strategy agent can search research from your recommendation system project — when your data pipeline agent can read architecture decisions from your web app — unexpected connections happen. A matrix decomposition technique from one project becomes a feature engineering approach in another. A failure mode documented in Project A prevents a week of wasted work in Project B. **Cortex doesn't just remember. It cross-pollinates.**

### Built-in contrarian thinking

Cortex's AI research pipeline doesn't just summarize the consensus. It includes a **critic persona** that automatically challenges every research synthesis and project plan. Dead ends are tagged `negative-result` so future agents know what NOT to try — and more importantly, *why* it failed and under what conditions it might be worth revisiting.

### First Principles that actually work

Most project documentation is aspirational fluff. Cortex forces testable, pass/fail success criteria with real numbers. Not "improve performance" but "achieve R@50 > 20% on cold-start users." **Progress Scorecards** automatically evaluate how close you are — surfacing practical wins you can use *right now*.

![Progress Scorecard with colored status badges and practical wins](docs/images/topic-scorecard.png)

### The compound effect

Each session makes the next one better. Agents document as they work (not after). Observations accumulate. Dead ends get tagged. Over weeks, Cortex becomes institutional memory that makes your AI workflow qualitatively different from vanilla sessions. The 10th session on a topic is dramatically more productive than the 1st.

![AI Pipeline with scorecard badges, research status, and thread list](docs/images/topic-pipeline.png)

## Features

- **Threads & Observations** -- Agents document their work in real time. The next agent picks up where the last one left off.
- **Artifacts** -- Polished knowledge assets (decisions, procedures, glossaries) that persist across sessions and projects.
- **AI Research Pipeline** -- Research, planning, critique, and scoring powered by GPT-5.2 with web search.
- **First Principles** -- Testable success criteria with an AI wizard. Not aspirations — pass/fail tests with numbers.
- **Progress Scorecards** -- Automated evaluation with practical wins highlighted.
- **Cross-Project Memory** -- One instance serves all projects. Agents in Project A search decisions from Project B.
- **Negative Result Tracking** -- Dead ends are first-class citizens. Tagged, searchable, never re-explored.
- **Session Audit** -- Automated quality check at session end.

## Setup Reference

<details>
<summary><b>What setup.ps1 does</b> (click to expand)</summary>

1. Checks Node.js 20+ and pnpm (installs pnpm if missing)
2. Starts PostgreSQL via Docker Compose
3. Creates `.env` with auto-generated JWT secret
4. Runs `pnpm install`
5. Runs database migrations and seed
6. Builds the MCP server
7. Creates an API key and generates `.mcp.json`

</details>

<details>
<summary><b>Manual setup</b> (without setup.ps1)</summary>

```powershell
docker compose up -d
copy .env.example .env
# Edit .env: add OPENAI_KEY, TAVILY_API_KEY, change JWT_SECRET
pnpm install
pnpm migrate
pnpm seed
pnpm build:mcp
pnpm dev
# Then create API key: POST /v1/auth/api-keys { "name": "mcp-agent" }
# Copy the key into .mcp.json
```

</details>

### How it fits together

```
┌─────────────────────┐     ┌─────────────────────────────────────────┐
│  Cortex (this repo) │     │  Your Project (where you actually work) │
│                     │     │                                         │
│  1. setup.ps1       │     │  3. integrate.ps1 ← run this here      │
│  2. pnpm dev        │────>│  4. Open Claude Code here               │
│     (keep running)  │     │  5. Agent auto-connects to Cortex       │
└─────────────────────┘     └─────────────────────────────────────────┘
```

Cortex is a background service. You install it once, leave `pnpm dev` running, then work in your project directories. The `integrate.ps1` script creates two files in each project:
- **`.mcp.json`** — Tells Claude Code how to connect to Cortex (paths + API key, auto-detected)
- **`CLAUDE.md`** — Tells agents how to use Cortex (documentation protocols, session workflow, 22+ tools)

> Add `.mcp.json` to your project's `.gitignore` — it contains an API key and machine-specific paths.

### integrate.ps1 reference

```powershell
# From your project directory:
C:\path\to\cortex\integrate.ps1

# Or from the Cortex directory:
.\integrate.ps1 -TargetDir C:\path\to\your-project
```

Merges cleanly with existing `.mcp.json` and `CLAUDE.md`. Safe to run multiple times.

### What your agents get (22+ tools)

| Tool | Purpose |
|------|---------|
| `cortex_get_context` | Workspace overview, topic details, first principles, active plan |
| `cortex_briefing` | Narrative briefing with "what NOT to retry" |
| `cortex_search` | Full-text search across all threads, artifacts, and comments |
| `cortex_observe` | Post observations (results, decisions, dead ends) |
| `cortex_draft_artifact` | Create persistent knowledge assets |
| `cortex_create_thread` | Start a documented work session |
| `cortex_update_thread` | Resolve threads with summaries |
| `cortex_create_task` | Track follow-up work |
| `cortex_checkpoint` | Record progress during long sessions |
| `cortex_session_complete` | Audit session documentation quality |

## Architecture

```
cortex/
├── packages/
│   ├── shared/      # TypeScript types, Zod schemas, shared constants
│   ├── ai/          # AI provider (OpenAI/GPT-5.2), agentic runner, persona system
│   ├── api/         # Fastify REST API, PostgreSQL, JWT auth, AI orchestration
│   ├── mcp/         # MCP server (22+ tools), stdio transport
│   └── web/         # React 18 SPA, TailwindCSS, React Query, Zustand
├── scripts/         # Database migration & seed scripts
├── docs/            # Internal documentation
└── docker-compose.yml  # PostgreSQL container
```

### API Layer

Fastify 4 REST API with:
- **Auth**: JWT tokens (human users) + API keys (agents), with trust tiers (Reader / Contributor / Admin)
- **Data**: PostgreSQL 15 with raw SQL (no ORM), full-text search, JSONB settings
- **AI**: Research pipeline (web search via Tavily, synthesis, planning, critique, scoring), conclusion generation, first principles wizard
- **Routes**: auth, topics, threads, comments, artifacts, tasks, search, AI endpoints

### MCP Server

Model Context Protocol server over stdio. Connects to the API via HTTP with API key auth. Designed for Claude Code but works with any MCP-compatible client.

### Web UI

React 18 SPA with Vite:
- Topic pages with lifecycle management (Exploring → Converging → Concluded)
- Pipeline card for research/planning/scoring workflows
- First Principles editor with AI wizard
- Progress scorecards with practical wins
- Artifact viewer with markdown rendering
- Thread and task management

## Development

```powershell
pnpm dev          # Start API + Web in parallel
pnpm dev:api      # API only (port 3000)
pnpm dev:web      # Web only (port 5173)
pnpm build        # Build all packages
pnpm build:mcp    # Build MCP server only
pnpm test         # Run all tests
pnpm migrate      # Run database migrations
pnpm seed         # Seed initial data
```

## Trust Tiers

| Tier | Role | Permissions |
|------|------|-------------|
| 0 | Reader | View all content |
| 1 | Contributor | Create/edit own threads, artifacts, tasks, observations |
| 2 | Admin | Accept artifacts, manage users, trigger AI features, edit first principles |

API keys created for MCP agents are Contributor (tier 1) by default.

## License

MIT
