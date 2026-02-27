# TOOLFORGE

> Build and use powerful tools with natural language — describe what you want, and TOOLFORGE generates it instantly.

TOOLFORGE is a full-stack web application that lets users create, customize, and share file-processing tools by describing their functionality in plain English. It combines a FastLane pattern-matching engine, a browser-native capability registry, and a hybrid local/cloud storage architecture to deliver a privacy-first, offline-capable tool platform.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running in Development](#running-in-development)
  - [Building for Production](#building-for-production)
- [Architecture Overview](#architecture-overview)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
  - [Storage & Sync](#storage--sync)
  - [Capability System](#capability-system)
  - [ToolSpec Format](#toolspec-format)
  - [Theme System](#theme-system)
- [API Reference](#api-reference)
- [Feature Flags](#feature-flags)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Natural Language Tool Generation** — Describe a file operation in plain text; the FastLane engine produces a fully-configured `ToolSpec` immediately.
- **Browser-Native Processing** — Image conversion, PDF manipulation, CSV↔JSON, and text formatting all run client-side via Canvas, WebCodecs, and WebAssembly — no data leaves the browser.
- **Batch File Processing** — Drag-and-drop multiple files at once, track progress in real time, and download outputs as a ZIP archive.
- **Hybrid Local/Cloud Storage** — Tools are persisted in IndexedDB for offline access and optionally synced to Supabase for cross-device availability.
- **Tool Gallery** — Browse, search, filter, and favourite community tools. Toggle between All, My Tools, and Community views.
- **Real-Time Refinement** — A bottom-dock Composer lets you iteratively prompt to update any live tool without leaving the page.
- **Modular Theming** — Ships with Pastel Glass, Neo Noir, and High Contrast themes; add your own in a single TypeScript file.
- **Command Palette** — Keyboard-driven quick navigation (`⌘K` / `Ctrl+K`).
- **Telemetry & Analytics** — Optional usage tracking for tool runs and views.
- **Privacy-First** — All processing defaults to local mode; cloud features are opt-in via feature flags.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Routing | Wouter |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Component Primitives | Radix UI |
| State Management | Zustand |
| Server State / Caching | TanStack Query v5 |
| Animation | Framer Motion |
| Local Database | Dexie (IndexedDB) |
| Cloud Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Schema Validation | Zod |
| Forms | React Hook Form + @hookform/resolvers |
| Icons | Lucide React + React Icons |
| Server | Express.js (TypeScript, ESM) |
| PDF Rendering | pdfjs-dist |
| Runtime | Node.js (tsx / esbuild) |

---

## Project Structure

```
arqx-main/
├── client/                     # Vite + React frontend
│   ├── index.html
│   └── src/
│       ├── App.tsx             # Root component & router
│       ├── main.tsx
│       ├── capabilities/       # Browser capability registry & handshake
│       │   ├── registry.ts     # Static capability definitions (image, pdf, csv, text ops)
│       │   └── handshake.ts    # Runtime capability detection
│       ├── components/
│       │   ├── analytics/      # Analytics dashboard components
│       │   ├── auth/           # Login / signup forms
│       │   ├── composer/       # Natural language input (Composer.tsx)
│       │   ├── gallery/        # Gallery toolbar & grid
│       │   ├── layout/         # TopBar, LeftRail, MainCard, BottomDock, CommandPalette
│       │   ├── settings/       # Settings panels
│       │   ├── sync/           # Sync status indicator
│       │   ├── system/         # CapabilityBanner
│       │   ├── tool/           # ToolRunner and tool-specific widgets
│       │   └── ui/             # shadcn/ui component library (48 components)
│       ├── hooks/              # use-debounce, use-toast, use-mobile
│       ├── lib/
│       │   ├── fastlane.ts     # NL → ToolSpec generation engine
│       │   ├── keyboard.ts     # Global keyboard shortcuts
│       │   ├── seeds.ts        # Static gallery seed data
│       │   └── queryClient.ts  # TanStack Query client setup
│       ├── pages/
│       │   ├── Home.tsx        # Landing / composer page
│       │   ├── Gallery.tsx     # Tool discovery & search
│       │   ├── Tool.tsx        # Tool runner page (/t/:id)
│       │   ├── Settings.tsx
│       │   ├── Profile.tsx
│       │   ├── About.tsx
│       │   ├── PlannerDemo.tsx # LLM planner demo page
│       │   └── not-found.tsx
│       ├── planner/            # LLM-powered planning module
│       ├── store/
│       │   ├── useAuthStore.ts # Auth state (Supabase session)
│       │   ├── useRecentStore.ts # Recently used tools
│       │   └── useUIStore.ts   # UI state (dock, sidebar, etc.)
│       ├── themes/
│       │   ├── ThemeProvider.tsx
│       │   ├── ThemeSwitcher.tsx
│       │   ├── loader.ts       # Dynamic theme loading
│       │   ├── types.ts
│       │   └── definitions/    # Individual theme files
│       └── widgets/            # UI widget primitives (17 widgets)
├── server/                     # Express.js backend
│   ├── index.ts                # Entry point, middleware, port binding
│   ├── routes.ts               # REST API route definitions
│   ├── storage.ts              # In-memory storage interface
│   └── vite.ts                 # Vite dev-server integration
├── shared/                     # Code shared between client & server
│   ├── schema.ts               # Drizzle ORM table definitions + Zod schemas
│   ├── types.ts                # ToolSpec, ToolMeta, ToolRepo interfaces
│   └── canonicalize.ts         # Spec canonicalization utilities
├── src/                        # Shared non-UI logic
│   ├── config.ts               # Feature flags manager
│   └── repositories/
│       ├── CompositeRepo.ts    # Cloud-first, local-fallback repository
│       ├── local/              # Dexie (IndexedDB) repository
│       └── supabase/           # Supabase repository
├── drizzle.config.ts           # Drizzle Kit configuration
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **PostgreSQL** database (or a [Neon](https://neon.tech) / [Supabase](https://supabase.com) project) — required only if using cloud features

### Installation

```bash
git clone https://github.com/your-org/toolforge.git
cd toolforge
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for database migrations and server-side DB access
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Optional — enables Supabase cloud sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional — enables the LLM-powered planner
VITE_PLANNER_LLM=true

# Server port (default: 5000)
PORT=5000
```

> If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set, the app runs in **local-only mode** using IndexedDB — no database connection required.

### Running in Development

```bash
npm run dev
```

This starts the Express server with Vite's dev middleware on `http://localhost:5000`. Hot module replacement (HMR) is enabled for the frontend.

### Building for Production

```bash
npm run build
```

Outputs:
- `dist/public/` — compiled frontend assets (served by Express)
- `dist/index.js` — bundled server entry point

```bash
npm run start
```

Starts the production server at the port defined by `$PORT` (default `5000`).

### Database Migrations

Push the Drizzle schema to your PostgreSQL database:

```bash
npm run db:push
```

### Type Checking

```bash
npm run check
```

---

## Architecture Overview

### Frontend

The frontend is a single-page React application served from `client/`. Routing is handled by **Wouter** — a lightweight alternative to React Router.

**App shell layout:**
```
┌─────────────────── TopBar ───────────────────────┐
│  ┌── LeftRail (260px) ──┬──── MainCard ────────┐  │
│  │  Navigation links   │  <Page content>       │  │
│  │  Recent tools       │                       │  │
│  └─────────────────────┴───────────────────────┘  │
└──────────────────────────────────────────────────┘
         CommandPalette (overlay, ⌘K)
```

Global state is split across three **Zustand** stores:
- `useAuthStore` — Supabase session, user profile, sign-in/out
- `useRecentStore` — last 10 used tools (persisted to `localStorage`)
- `useUIStore` — sidebar collapsed state, dock visibility

### Backend

The Express server (`server/`) handles:
- **API routing** — RESTful endpoints under `/api/*`
- **Static asset serving** — serves `dist/public/` in production
- **Vite middleware** — proxies HMR and asset requests in development
- **Request logging** — all `/api` requests are timed and logged

### Database

Drizzle ORM manages the PostgreSQL schema defined in `shared/schema.ts`:

| Table | Description |
|---|---|
| `users` | Username + hashed password (local auth) |
| `profiles` | Email-based profiles (Supabase auth) |
| `toolspecs` | Tool definitions with JSON spec payload |
| `favorites` | User ↔ tool many-to-many relationship |
| `telemetry_events` | Tool run/view analytics events |

### Storage & Sync

TOOLFORGE uses a **CompositeRepo** pattern (`src/repositories/CompositeRepo.ts`) that abstracts over two storage backends:

```
CompositeRepo
  ├── SupabaseRepo   (cloud — used when VITE_SUPABASE_* env vars present)
  └── LocalRepo      (Dexie / IndexedDB — always available)
```

**Read strategy:** Cloud-first with local fallback. Cloud results are automatically cached locally for offline access.

**Write strategy:** Writes go to both backends when cloud is available; local-only otherwise.

Feature flags control which backends are active at runtime:

| Flag | Default | Effect |
|---|---|---|
| `supabaseOn` | `true` if env vars present | Enable Supabase backend |
| `localOnlyMode` | `false` | Force local-only, ignore Supabase |
| `serverFallback` | `false` | Fall back to Express API |
| `plannerLLM` | `false` | Enable LLM-powered tool planning |

Flags persist in `localStorage` and can be toggled at runtime via the Settings page.

### Capability System

The **capability registry** (`client/src/capabilities/registry.ts`) defines what file operations are available in the user's browser environment. Each capability declares:

- `accepts` / `produces` — MIME types
- `env` — where it can run (`browser` | `server`)
- `requires` — browser APIs or WASM modules needed
- `limits` — max file size / count / duration
- `argsSchema` — Zod schema for operation arguments

**Built-in capabilities:**

| Category | Capabilities |
|---|---|
| Image | `image.decode`, `image.resize`, `image.to_jpeg`, `image.to_png`, `image.to_webp` |
| GIF | `gif.decode`, `frames.sample` |
| PDF | `pdf.merge`, `pdf.split`, `pdf.compress` |
| Data | `csv.to_json`, `json.to_csv` |
| Text | `text.format` |

The **handshake** module (`handshake.ts`) probes the environment at startup and marks which capabilities are actually available, enabling the `CapabilityBanner` to surface any missing browser support to the user.

### ToolSpec Format

A `ToolSpec` is the JSON contract that describes a tool's inputs, processing pipeline, and output. Version `1.1` also supports a `ui` field for widget-based layouts.

```typescript
type ToolSpec = {
  version: "1";
  name: string;
  summary: string;
  inputs: any[];                           // Input field definitions
  pipeline: Array<{
    op: string;                            // Capability ID (e.g. "image.to_jpeg")
    args?: Record<string, any>;
  }>;
  output: {
    type: "file" | "file[]" | "text" | "json" | "none";
    naming?: string;                       // Output filename template
    zip?: boolean;                         // Wrap multiple outputs in a ZIP
  };
  suggested_extras?: string[];
  ui?: ToolSpecUI;                         // v1.1: widget layout extension
};
```

The **FastLane engine** (`client/src/lib/fastlane.ts`) uses pattern matching on the user's natural language prompt to produce a `ToolSpec` without requiring an LLM API call. When `plannerLLM` is enabled, an LLM-powered planner can generate more complex specs.

### Theme System

Themes live in `client/src/themes/definitions/`. Each theme is a TypeScript object with HSL color tokens, border radii, shadows, and glass-effect parameters.

**Adding a custom theme:**

1. Create `client/src/themes/definitions/my-theme.ts`:

```typescript
export const myTheme = {
  id: 'my-theme',
  name: 'My Theme',
  type: 'dark',          // 'light' | 'dark'
  colors: {
    bg: 'hsl(220, 20%, 10%)',
    surface: 'hsl(220, 20%, 14%)',
    card: 'hsl(220, 20%, 12%)',
    rail: 'hsl(220, 20%, 8%)',
    border: 'hsl(220, 20%, 20%)',
    text: 'hsl(0, 0%, 95%)',
    textDim: 'hsl(0, 0%, 55%)',
    accent: 'hsl(260, 80%, 65%)',
    accentSoft: 'hsl(260, 80%, 15%)',
    success: 'hsl(120, 60%, 50%)',
    warn: 'hsl(45, 100%, 50%)',
    danger: 'hsl(0, 70%, 50%)',
  },
  radii: { sm: 4, md: 8, lg: 12, card: 16, rail: 16 },
  shadows: { card: '0 4px 12px rgba(0,0,0,0.4)', soft: '0 2px 4px rgba(0,0,0,0.3)' },
  effects: { gradientFrom: 'hsl(220, 50%, 10%)', gradientTo: 'hsl(260, 50%, 10%)', blur: 10 },
};
```

2. Register it in `client/src/themes/loader.ts`:

```typescript
import { myTheme } from './definitions/my-theme';

const themeModules = {
  pastelGlass,
  neoNoir,
  highContrast,
  myTheme,   // ← add here
};
```

---

## API Reference

All endpoints are under the `/api` prefix.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/tools` | List tools |
| `GET` | `/api/tools/:id` | Get tool by ID |
| `POST` | `/api/tools` | Create a new tool |
| `GET` | `/api/favorites` | List user favorites |
| `POST` | `/api/favorites` | Add tool to favorites |
| `DELETE` | `/api/favorites/:toolId` | Remove tool from favorites |
| `GET` | `/api/search?q=&category=&sort=` | Search tools |
| `POST` | `/api/analytics/tool-run` | Record a tool run event |
| `POST` | `/api/analytics/tool-view` | Record a tool view event |

> The primary data path for most clients uses the **CompositeRepo** (IndexedDB + Supabase) directly rather than the Express API. The Express routes serve as a server-side fallback when `serverFallback` is enabled.

---

## Feature Flags

Feature flags are managed by `FeatureFlagManager` in `src/config.ts`. They are persisted in `localStorage` under the key `toolforge-feature-flags`.

```typescript
// Read current flags
import { featureFlags } from './src/config';
const flags = featureFlags.get();

// Update a flag at runtime
featureFlags.set({ localOnlyMode: true });

// Subscribe to changes
const unsubscribe = featureFlags.subscribe((flags) => {
  console.log('Flags updated:', flags);
});
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `supabaseOn` | `boolean` | Auto-detected | Enable Supabase cloud backend |
| `serverFallback` | `boolean` | `false` | Use Express API as storage fallback |
| `plannerLLM` | `boolean` | `false` | Enable LLM planner (`VITE_PLANNER_LLM=true`) |
| `localOnlyMode` | `boolean` | `false` | Disable all cloud features |

---

## Roadmap

| Feature | Status | Target |
|---|---|---|
| AI-Powered Tool Generation | Planned | Q2 2024 |
| Cloud Processing Pipeline | Planned | Q3 2024 |
| Collaborative Tool Sharing | Planned | Q3 2024 |
| Advanced Analytics Dashboard | Planned | Q4 2024 |
| Mobile App | Planned | Q1 2025 |

---

## Contributing

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes, ensuring `npm run check` passes with no TypeScript errors.
3. Follow the existing code style — no new comments or documentation unless explicitly needed.
4. **Open a pull request** against `main` with a clear description of the change.

For bug reports or feature requests, please open a GitHub Issue.

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

---

*© 2024 TOOLFORGE. Built for makers and creators.*
