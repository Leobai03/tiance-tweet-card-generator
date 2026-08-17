# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable product decisions

- Keep the primary workflow extremely simple: select a tweet, select a publishing style/background, and download a finished image.
- Keep two output modes: the original standalone tweet card and a Douyin-ready 3:4 portrait image combining a background with the tweet card.
- Backgrounds must support built-in presets, local image upload, and a pasted online image URL. The preview should match the downloaded PNG.
- The poster editor must let mouse and touch users drag the tweet card, scale it, and reset it to a centered default.
- Optimize the controls and copy for matrix-account operators who should not need design or editing experience.
- Treat a finished post as two deliverables: a downloadable image and a one-line Douyin description with exactly three relevant hashtags that can be copied directly.
