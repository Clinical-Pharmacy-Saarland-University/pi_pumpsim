# SafePolyMed stories — build status

_Autonomous session, 2026-06-08._

## Playable now — ALL 6 ✅
| # | Story | Drug × interaction | Unique mechanic | Engine |
|---|---|---|---|---|
| 1 | **Die Frühstücks-Falle** | Grapefruit × Simvastatin (CYP3A4) | multi-select photo grid | v1 (template) |
| 2 | **Das Teeküchen-Regal** | Ciclosporin × Johanniskraut (induction) | **real-time leak-defense** (race the drain) | v2 |
| 3 | **Drei Zwillinge, eine Pille** | Codein / CYP2D6 (gene) | same-dose **triptych** (predict 3 genotypes) | v2 |
| 4 | **Der Funken-Plan** | Clarithromycin × Phenprocoumon (DDI) | tap-tap **pairing** (connect the clash) | v2 |
| 5 | **Die Nieren-Skala** | Metformin × low eGFR (organ) | read **gauge → set dose dial** | v2 |
| 6 | **Der Wochen-Pillenplan** | Lamotrigin (adherence) | **build-a-week timeline**, play it back | v2 |

All six: distinct mechanics + endings, DE young+adult copy, **headless sim (`npx tsx sim/<id>.sim.ts`) + browser smoke** verified, `svelte-check` clean. All cards `available: true`.

> Note: the v2 stories live in `game.phase === 'play2'`, which is **outside** story-1's `PLAY_PHASES`, so the critical-line auto-trip never fires for them — each v2 story owns its own win/lose (johanniskraut's drain + adherence's saw-tooth use a local `$effect`/precomputed trajectory). No engine change to the auto-trip was needed.

Their story cards are `available: false` in `stories.ts` (tapping them is a no-op — the app stays fully working).

## The v2 architecture (how to add the remaining 3 — ~1 file each)
A "v2" story is a **self-contained play component** that owns its own beat flow and never touches story 1's engine. Recipe (see `ddi`/`organ` as copy-paste templates):
1. **Pure logic + data** → `src/lib/stories/<id>.ts` (no Svelte runes): cards/options/finale + scorers. Reuse `flow.ts` (`outcomeForLevel`, `stars`).
2. **Play component** → `src/lib/screens/<Id>Play.svelte`: a local `beat` state machine; move the torso with **`driveTo(target, rate, onSettle)`** (exported from `game.svelte.ts`); read `game.level` for the `<Torso>`; use `<Backdrop>`; end by reading `chosen.result` → outcome + `stars(...)`; buttons call `retry()` / `backToStories()`.
3. **Unique mechanic** → its own component (e.g. `PairLink.svelte`) or inline.
4. **Copy** → `locale.svelte.ts` under `<id>.*` (DE; `young` base + `.adult` variant via `t()`).
5. **Wire** → `stories.ts`: `available: true, engine: 'v2'`; `App.svelte`: add `{:else if game.story?.id === '<id>'}<XPlay/>` in the `play2` branch.
6. **Headless test** → `sim/<id>.sim.ts`, run `npx tsx sim/<id>.sim.ts` ("play via code" — asserts mechanic scoring + decision→torso→outcome before the browser).

Recommended order (audit): gene → johanniskraut → adherence.

## Notes
- Engine constraint: `onLevel()` auto-ends the run at a critical line **only during story-1 play phases**; v2 stories drive the torso via `driveTo` (no auto-trip), so they decide their own win/lose from `result`.
- No translations yet (DE only) — locked until the design is signed off, per the user.
- The big brainstorm (27-agent workflow) lives in the per-story specs; this is the implementation tracker.
