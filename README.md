# THIS PROJECT IS CURRENTLY IN AN EARLY STAGE OF DEVELOPMENT

# Scribe.cx

Cross-browser web extension for summarizing the current page with an LLM in a side panel.

This project is BYOK (bring your own key): it connects to an OpenAI-compatible endpoint using the `openai` JS SDK.

## What It Does

- Opens a side panel from the extension action in Chrome and Firefox.
- Sends chat prompts to an OpenAI-compatible API and streams assistant responses.
- Extracts the active page content with Mozilla Readability when possible.
- Stores conversations and LLM config in extension local storage.

## Tech Stack

- WXT for cross-browser extension builds
- Svelte 5
- Tailwind CSS v4 + Skeleton
- `@wxt-dev/webextension-polyfill`
- `openai` (OpenAI-compatible API client)
- `@mozilla/readability` for page extraction

## Project Layout

- `src/entrypoints/sidepanel/` - side panel app
- `src/entrypoints/background.ts` - action button behavior and side panel setup
- `src/entrypoints/content.ts` - page extraction content script
- `src/stores/` - conversation and extracted tab state
- `src/storage/` - persistent extension storage helpers
- `src/utils/llm.ts` - LLM streaming client

## Development

Prereqs: Node.js and `pnpm`.

Install dependencies:

```bash
pnpm install
```

Run locally for Chromium:

```bash
pnpm dev
```

Run locally for Firefox:

```bash
pnpm dev:firefox
```

Build and package:

```bash
pnpm build
pnpm zip

pnpm build:firefox
pnpm zip:firefox
```

## Loading The Extension

WXT writes browser builds into `.output/`.

- Chrome or Chromium: open `chrome://extensions`, enable Developer mode, then load the unpacked extension from `.output/chrome-mv3/`.
- Firefox: open `about:debugging#/runtime/this-firefox`, then load the temporary add-on from `.output/firefox-mv2/manifest.json` or the generated `.output/firefox-*` folder.

## Configuration (BYOK)

The extension reads these values from WXT storage:

- LLM config: `local:llm_config`
- Conversation list: `local:conversation_list`
- Conversation messages: `local:conversation:<sessionId>`

The LLM config currently includes:

- provider
- endpoint
- apiKey
- modelName

There is no settings UI yet. For now, set storage values through the extension DevTools.

## Permissions

Declared in `wxt.config.ts`:

- `sidePanel` for the side panel API
- `storage` for persistence
- `activeTab` for reading the active tab during extraction

## Notes

- The content script uses Readability and falls back to a failure message when extraction is not possible.
- The side panel currently submits prompts directly to the configured LLM endpoint and streams tokens into the chat UI.
