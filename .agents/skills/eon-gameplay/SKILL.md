---
name: eon-gameplay
description: Guidelines for expanding EON WORLD without sacrificing playable agency or narrative consistency.
---

# EON Gameplay Principles

- Prefer controllable scenes and meaningful interactions over one-button yearly advancement.
- Preserve start-from-birth design; 14-year-old prototype is a test harness, not a replacement.
- Use PixiJS v8 for the 2D stage, React for accessible UI overlays, TypeScript for domain logic.
- Keep game logic deterministic, independent of rendering, and testable without a browser.
- Separate canonical events, what a citizen believes, and what the player is permitted to know.
- Avoid exposing omniscient NPC emotion or relationship scores.
- Never claim a dependency installed, a build passing, or a game running without checking.
- Tests first for every domain behavior; no unreviewed changes directly on main.
