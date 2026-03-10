# Byte Invoice Desktop

A Tauri 2 desktop application for invoicing, built with React and Rust.

Licensed under [GPL-3.0](LICENSE).

## Tech Stack

- **Desktop:** Tauri 2
- **Frontend:** React 19, TypeScript, Vite, Chakra UI
- **Backend:** Rust, SQLite (rusqlite)

## Prerequisites

- Node.js (v18+)
- Rust (1.77+)
- npm or pnpm

## Getting Started

```bash
npm install
npm run dev
```

## Commands

| Command | Description |
|--------|-------------|
| `npm run dev` | Start development server with Tauri |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint on TypeScript/React code |
| `npm run tauri` | Run Tauri CLI commands |

## Project Structure

```
invoice-desktop/
├── src/           # React frontend (pages, components, hooks, services)
├── src-tauri/     # Rust backend (commands, db, models)
├── public/        # Static assets
└── dist/          # Vite build output
```
