# Cortex

Workspace-scoped knowledge management for AI-augmented teams.

Cortex is a self-hosted platform that gives your AI agents persistent memory across projects. It connects to [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (and any MCP-compatible client) via the [Model Context Protocol](https://modelcontextprotocol.io/), letting agents create threads, document decisions, track tasks, and build institutional knowledge that compounds over time.

## What It Does

- **Threads & Observations** -- Agents document their work in real time: what they tried, what worked, what failed. The next agent picks up where the last one left off.
- **Artifacts** -- Polished knowledge assets (architecture decisions, procedures, glossaries) that persist across sessions and projects.
- **AI Research Pipeline** -- Built-in research, planning, critique, and scoring powered by GPT-5.2. Generate project plans, run automated research with web search, and track progress against success criteria.
- **First Principles** -- Define guiding beliefs and testable success criteria for each topic. AI-assisted wizard helps you articulate what "done" looks like.
- **Progress Scorecards** -- Automated evaluation of how close each topic is to meeting its success criteria, with practical wins highlighted.
- **Cross-Project Memory** -- One Cortex instance serves all your projects. Agents in Project A can search for decisions made in Project B.

## Quick Start (Windows)

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- [pnpm](https://pnpm.io/) (installed automatically if missing)

### Automated Setup

```powershell
git clone https://github.com/gorfein/cortex.git
cd cortex
.\setup.ps1
```

The setup script will:
1. Verify Node.js and pnpm are installed
2. Start PostgreSQL in Docker
3. Create `.env` with a generated JWT secret
4. Install dependencies
5. Run database migrations and seed data
6. Build the MCP server
7. Generate `.mcp.json` with a fresh API key

After setup, edit `.env` to add your API keys:
```
OPENAI_KEY=sk-your-key-here          # Required for AI features
TAVILY_API_KEY=tvly-your-key-here    # Required for web research
```

Then start the dev servers:
```powershell
pnpm dev
```

### Access

| Service | URL |
|---------|-----|
| Web UI | http://localhost:5173 |
| API | http://localhost:3000 |
| **Login** | `admin@cortex.local` / `admin123` |

### Manual Setup

If you prefer not to use the setup script:

```powershell
# 1. Start PostgreSQL
docker compose up -d

# 2. Create .env
copy .env.example .env
# Edit .env: add your OPENAI_KEY, TAVILY_API_KEY, and change JWT_SECRET

# 3. Install & build
pnpm install

# 4. Database
pnpm migrate
pnpm seed

# 5. Build MCP server
pnpm build:mcp

# 6. Create API key for MCP (after starting the API)
#    Login at http://localhost:5173, then use the API:
#    POST /v1/auth/api-keys  { "handle": "mcp-agent", "display_name": "MCP Agent" }
#    Copy the returned api_key into .mcp.json

# 7. Start
pnpm dev
```

## Connecting to Claude Code

Cortex integrates with Claude Code through MCP. After setup, your `.mcp.json` is ready.

**For your Cortex project:**
The `.mcp.json` in the repo root is already configured.

**For other projects:**
Copy the `cortex` server entry from `.mcp.json` into your other project's `.mcp.json`, and add the CLAUDE.md integration snippet (see `cortex-claude-snippet.md`).

**What agents get:**
- `cortex_get_context` -- Workspace overview, topic details, first principles, open threads, active plan
- `cortex_search` -- Full-text search across all threads, artifacts, and comments
- `cortex_observe` -- Post observations (results, decisions, dead ends)
- `cortex_draft_artifact` -- Create persistent knowledge assets
- `cortex_create_thread` / `cortex_update_thread` -- Manage work sessions
- `cortex_create_task` / `cortex_update_task` -- Track work items
- `cortex_checkpoint` -- Record progress during long sessions
- `cortex_briefing` -- Get a narrative briefing with "what NOT to retry"
- `cortex_session_complete` -- Audit session documentation quality
- And more (22+ tools total)

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
