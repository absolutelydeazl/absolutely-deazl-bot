# NEOXR-BOT 5.0 (Base)

## Overview
A modular and lightweight WhatsApp bot built on Node.js using the Baileys library (via a custom fork). It supports social media downloading, group management, AI utilities, and a plugin-based extension system.

## Tech Stack
- **Runtime**: Node.js 20+
- **WhatsApp Library**: `@neoxr/wb` (wraps a custom Baileys fork)
- **Package Manager**: npm
- **Module System**: ESM (ES Modules)
- **Media Processing**: `sharp`, `ffmpeg` (system), `node-gtts`

## Project Structure
- `index.js` — Master process: spawns `client.js`, manages restarts and temp file cleanup
- `client.js` — Worker process: WhatsApp connection and bot initialization
- `handler.js` — Central message routing logic
- `plugins/` — All bot commands and event handlers (grouped by category)
- `lib/` — Core libraries: config, adapter (DB), models, helpers
- `media/` — Static assets (thumbnails, etc.)
- `temp/` — Runtime temp files (auto-cleaned)

## Configuration
- `config.json` — Bot settings (owner, limits, pairing, etc.)
- `.env` — Environment secrets: `API_KEY`, `DATABASE_URL`, `TZ`

### Key config.json fields
- `owner`: Bot owner's WhatsApp number
- `pairing.state`: `true` = pairing code, `false` = QR scan
- `pairing.number`: Bot's WhatsApp number
- `database`: Local data file name (when no DATABASE_URL is set)

### .env fields
- `API_KEY`: Key for https://api.neoxr.my.id
- `DATABASE_URL`: MongoDB/PostgreSQL/MySQL URL (leave empty for local JSON)
- `TZ`: Timezone (e.g., `Asia/Jakarta`)

## Running
```
npm start
```

## Deployment
Configured as a **VM** deployment target (always-running process).
Run command: `node --no-warnings ./index.js`

## Notes
- The bot uses pairing code authentication by default (set in config.json)
- Local JSON database is used when `DATABASE_URL` is empty
- Plugins are auto-loaded from the `plugins/` directory
