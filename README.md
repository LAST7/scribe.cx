# Scribe.cx

Cross-browser web extension (Chrome + Firefox) for summarizing/extracting information from the current page via an LLM.

This project is "BYOK" (bring your own key): it talks to an OpenAI-compatible endpoint using the `openai` JS SDK.

## What Works Today

- Side panel UI (Svelte 5) with a chat-style prompt + streaming assistant responses.
- Conversation state stored in extension local storage.
- Cross-browser side panel open behavior when clicking the extension action.

Note: page extraction is not wired up yet; the content script is currently a stub.

## Tech Stack

- WXT (build tooling + cross-browser packaging)
- Svelte 5
- Tailwind CSS v4 + Skeleton UI
- `@wxt-dev/webextension-polyfill`
- `openai` (OpenAI-compatible API client)

## Development

Prereqs: Node.js + pnpm.

Install:

```bash
pnpm install
```

Run (Chromium):

```bash
pnpm dev
```

Run (Firefox):

```bash
pnpm dev:firefox
```

Build / Zip:

```bash
pnpm build
pnpm zip

pnpm build:firefox
pnpm zip:firefox
```

## Loading The Extension

WXT writes browser builds into `.output/`.

- Chrome/Chromium: open `chrome://extensions` -> enable Developer Mode -> Load unpacked -> select `.output/chrome-mv3/`.
- Firefox: open `about:debugging#/runtime/this-firefox` -> Load Temporary Add-on -> select `.output/firefox-mv2/manifest.json` (or whichever `.output/firefox-*` folder WXT produced).

## Configuration (BYOK)

The extension reads these values from WXT storage:

- LLM endpoint: `local:llm_endpoint` (default is set in `src/utils/storage.ts`)
- API key: `local:llm_api_key` (default is set in `src/utils/storage.ts`)

There is no settings UI yet. For now you can set them by:

1. Running the extension once.
2. Opening the extension's background/sidepanel DevTools.
3. Editing extension storage values for the keys above.

Implementation details:

- LLM client: `src/utils/llm.ts` (currently streams chat completions; model is hard-coded).
- Storage keys: `src/utils/storage.ts`.

## Permissions

Declared in `wxt.config.ts`:

- `sidePanel` (Chrome side panel API)
- `storage` (persist endpoint/key + conversation)
- `activeTab` (intended for reading the current tab when page extraction is implemented)

## Project Layout

- Side panel UI: `src/entrypoints/sidepanel/`
- Background entry: `src/entrypoints/background.ts`
- Content script (currently stub): `src/entrypoints/content.ts`
- Cross-browser panel abstraction: `src/utils/sidepanel.ts`

## Next Steps (Ideas)

- [ ] Add an options page to edit endpoint/key/model.
- [ ] Implement page text extraction in `src/entrypoints/content.ts` + message passing to the side panel.
- [ ] Add prompt templates for summarize/extract modes.
