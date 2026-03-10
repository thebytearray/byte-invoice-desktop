# Byte Invoice

A cross-platform invoicing app built with Tauri 2, React, and Rust. Runs on **Android**, **macOS**, **Windows**, and **Linux**.

**Repository:** [https://github.com/thebytearray/byte-invoice](https://github.com/thebytearray/byte-invoice)

Licensed under [GPL-3.0](LICENSE).

## Tech Stack

- **Framework:** Tauri 2 (cross-platform)
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
