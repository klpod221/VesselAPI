# VesselAPI

A minimalist, local-first API client built with Tauri, React, and Rust.

## Project Structure

This is a monorepo managed by **pnpm workspaces** and **TurboRepo**.

- `apps/desktop`: Tauri v2 Desktop Application (Rust + React)
- `apps/web`: Web-based Client (React SPA)
- `apps/extension`: Chrome/Firefox Extension (Manifest V3) for CORS bypass
- `packages/core`: Shared business logic, stores (Zustand), and types
- `packages/network`: Abstract Network Client (Tauri, Fetch, Extension)
- `packages/ui`: Shared UI components (React + Tailwind + Shadcn)

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Development**
   ```bash
   # Run Desktop App
   pnpm dev:desktop

   # Run Web App
   pnpm dev:web

   # Build Extensions (Chrome & Firefox)
   pnpm --filter @vessel/extension dev
   ```

## Architecture

VesselAPI uses a unique **Abstract Network Layer** (`packages/network`) to handle requests differently based on the environment:

- **Desktop**: Uses **Rust (reqwest)** via Tauri Commands to bypass CORS natively.
- **Web (Direct)**: Uses native `fetch` (restricted by CORS).
- **Web (Extension)**: Uses the **Browser Extension** as a proxy to bypass CORS.

The application automatically checks for the extension and upgrades the client if available.
