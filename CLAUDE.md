# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server that integrates with the Kommo CRM API. Runs on Cloudflare Workers with Durable Objects for connection state. Part of the Laburen.com ecosystem.

## Commands

```bash
npm run dev           # Local dev server (wrangler dev)
npm run deploy        # Deploy to Cloudflare Workers
npm run format        # Format with Biome (4-space indent, 100 char width)
npm run lint:fix      # Fix linting issues
npm run type-check    # TypeScript type checking (tsc --noEmit)
npm run cf-typegen    # Generate Cloudflare Worker types
```

## Architecture

**Entry point** (`src/index.ts`): Cloudflare Worker fetch handler. Extracts configuration from HTTP headers (priority) or environment variables, injects into `ctx.props`, routes to `/sse`, `/sse/message` (SSE), or `/mcp` (HTTP MCP).

**MCP server** (`src/mcp.ts`): `MyMCP extends McpAgent` (from `agents/mcp`). Tools are dynamically registered based on the `TOOLS_TO_USE` configuration — only enabled tools get registered. Configuration comes from `this.props`.

**Tools** (`src/tools/leads.ts`): API functions for Kommo lead operations (move_lead, pause_agent, add_note, add_tag, add_budget). All tools validate lead existence via `getLead()` before operating. Tool parameters use Zod schemas.

**Utils** (`src/utils/`): `canUseTools.ts` checks if a tool is enabled; `parseTools.ts` parses `TOOLS_TO_USE` from JSON array or CSV string.

## Configuration System

Header-first priority: HTTP headers > environment variables (wrangler.jsonc vars).

Key config values: `KOMMO_LONG_DURATION_TOKEN` (Bearer token), `KOMMO_ACCOUNT_SUBDOMAIN`, `TOOLS_TO_USE` (JSON array or CSV of enabled tool names).

## Kommo API Patterns

All API calls follow: build URL `https://{subdomain}.kommo.com/api/v4/{endpoint}` → set Bearer auth → request → check status → return JSON or null on failure. Error logging uses `❌` for API errors and `💥` for caught exceptions.

## Adding a New Tool

1. Add the API function in `src/tools/leads.ts` following the existing pattern (validate lead, call API, handle errors)
2. Register the tool in `src/mcp.ts` inside `init()`, guarded by `canUseTools("tool_name", tools)`
3. The tool becomes available when included in `TOOLS_TO_USE` config

## Tech Stack

TypeScript (strict) on Cloudflare Workers with Durable Objects. Dependencies: `@modelcontextprotocol/sdk`, `agents` (McpAgent base), `zod`. Linting/formatting: Biome.
