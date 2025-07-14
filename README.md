# LFD Playground - Multi-Game Platform

A real-time multiplayer game platform built with React, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Realtime + Edge Functions)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Turborepo
- **Package Manager**: pnpm

## Project Structure

```
lfd-playground/
├── apps/
│   ├── web/                 # Main web application
│   └── liar-game/          # Liar game application
├── packages/
│   ├── game-core/          # Core game engine
│   ├── ui-kit/             # Shared UI components
│   ├── supabase-client/    # Supabase wrapper
│   └── shared-utils/       # Common utilities
└── supabase/               # Supabase functions and migrations
```

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Run development servers**
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and applications
- `pnpm lint` - Run linting across all packages
- `pnpm test` - Run tests
- `pnpm clean` - Clean all build artifacts

## Development

Each game is developed as a separate application in the `apps/` directory, allowing multiple developers to work independently while sharing common functionality through the packages.

### Adding a New Game

1. Create a new app in `apps/[game-name]`
2. Use the shared packages for common functionality
3. Implement game-specific features in the app

## Deployment

The platform can be deployed to any static hosting service. Each game can be deployed independently or as part of the main application.