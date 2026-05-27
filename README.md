# kommo-mcp-server

Servidor MCP (Model Context Protocol) que integra los agentes de **Laburen.com** con **Kommo CRM**. Expone herramientas para gestionar leads (mover, pausar agente, notas, tags, presupuesto, escalado a humano) y contactos. Corre en **Cloudflare Workers** con **Durable Objects** para el estado de las conexiones MCP.

## Arquitectura

- **`src/index.ts`** — Entry point del Worker. Lee la config de los headers HTTP (prioridad) o las env vars, la inyecta en `ctx.props` y enruta a `/sse`, `/sse/message` (SSE) o `/mcp` (HTTP).
- **`src/mcp.ts`** — `MyMCP extends McpAgent`. Registra dinámicamente solo las tools habilitadas en `TOOLS_TO_USE`.
- **`src/tools/leads.ts`** — Funciones contra la API de Kommo para leads.
- **`src/tools/contacts.ts`** — Funciones contra la API de Kommo para contactos.
- **`src/utils/`** — `canUseTools.ts` (chequea si una tool está habilitada) y `parseTools.ts` (parsea `TOOLS_TO_USE` desde JSON array o CSV).

```
src/
├── index.ts            # Worker fetch handler + routing
├── mcp.ts              # Servidor MCP y registro de tools
├── types.ts            # Tipos (Env, etc.)
├── tools/
│   ├── leads.ts        # API de leads
│   └── contacts.ts     # API de contactos
└── utils/
    ├── canUseTools.ts
    └── parseTools.ts
```

## Configuración

La config se toma de los **headers HTTP** (prioridad) o de las **env vars** (`wrangler.jsonc` / dashboard de Cloudflare):

| Clave | Descripción |
|-------|-------------|
| `KOMMO_LONG_DURATION_TOKEN` | Bearer token de larga duración de Kommo |
| `KOMMO_ACCOUNT_SUBDOMAIN` | Subdominio de la cuenta (`https://{subdominio}.kommo.com`) |
| `TOOLS_TO_USE` | Tools habilitadas — JSON array `["move_lead","add_note"]` o CSV `move_lead,add_note` |

Solo las tools listadas en `TOOLS_TO_USE` se registran en el servidor.

## Tools

Todas las tools de lead validan que el lead exista (`getLead`) antes de operar. Devuelven un mensaje de texto con el resultado.

| Tool | Parámetros | Descripción |
|------|-----------|-------------|
| `move_lead` | `lead_id`, `pipeline_id`, `status_id` | Mueve el lead a otro pipeline/estado |
| `pause_agent` | `lead_id`, `switch_field_id`, `switch_field_value` | Pausa el agente IA seteando un campo switch del lead |
| `add_note` | `lead_id`, `note` | Agrega una nota al historial del lead |
| `add_tag` | `lead_id`, `tag_id` | Agrega un tag al lead |
| `add_budget` | `lead_id`, `budget_field_value` | Setea el presupuesto (`price`) del lead |
| `request_human` | `lead_id`, `pipeline_id`, `status_id`, `switch_field_id`, `switch_field_value`, `note` | Escala a humano: mueve el lead + pausa el agente + agrega nota, en una sola llamada |
| `update_contact_field` | `contact_id`, `field_id`, `enum_id` | Actualiza un campo custom enum/select de un contacto |

**`request_human`** corre best-effort: si un paso falla, los demás igual se ejecutan. Devuelve un JSON con `status` (`success` / `partial` / `error`) y el detalle de cada paso (`steps`, `failed_steps`).

## Endpoints

| Ruta | Uso |
|------|-----|
| `/mcp` | Transporte MCP sobre HTTP |
| `/sse`, `/sse/message` | Transporte MCP sobre Server-Sent Events |

## Desarrollo

```bash
npm install
npm run dev          # wrangler dev (local)
npm run type-check   # tsc --noEmit
npm run format       # Biome
npm run lint:fix     # Biome lint --fix
```

> El proyecto requiere `legacy-peer-deps=true` (ver `.npmrc`): el paquete `agents` declara `react` como peer dependency.

## Deploy (CI/CD)

El deploy es automático vía **GitHub Actions** (`.github/workflows/deploy.yml`): cada push a `main` corre `type-check` y, si pasa, deploya a Cloudflare con `wrangler-action`.

- Secret requerido en el repo: **`CLOUDFLARE_API_TOKEN`** (permiso *Workers Scripts → Edit*).
- El `account_id` está en `wrangler.jsonc`, no hace falta como secret.

Deploy manual:

```bash
npm run deploy   # wrangler deploy
```

## Notas

- Logs: errores de API con prefijo `❌`, excepciones de tools con `💥`. Observabilidad habilitada en `wrangler.jsonc`.
- Proyecto privado del ecosistema Laburen.com.
