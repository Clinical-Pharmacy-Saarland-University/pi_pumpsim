// Story „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin) — pure data.
// v2 torso-first, REWORKED flow (2026-06): dose → „eine Woche später" leak reveal →
// magnifier investigation (find the herbal culprit among Frau Bergers neue Tees) →
// a plain-language mechanism explanation (induction + the lag) → a calm live leak-stop
// finale. DOWN only: induction lowers the Spiegel; there is NO overdose path. No
// on-screen vessel/meter — the real pump is the readout. No Svelte runes → headless-testable.
import { LEVELS, type Outcome } from '../flow'

// ── levels (single source of truth; down-only story) ───────────────────────────
export const JK_BASELINE = LEVELS.start // 20 — prime = the reset-home level, so the DOSE is the only pre-game rise
export const JK_DOSE = LEVELS.dose // 62 — standard dose lands in the green window
export const JK_LEAK_LEVEL = 49 // „eine Woche später": the protection has leaked to just UNDER the band
export const JK_FINALE_START = JK_LEAK_LEVEL // the live finale fall resumes from where the week left it (49)
export const JK_FLOOR = 38 // the torso bottoms out near here as the clock runs out (down-only marker)
export const JK_DRAIN_TARGET = 33 // visual drain target for the finale fall (under the band)
export const JK_PRO_MIN = 43 // „pro" fast-save half-star: the Spiegel never dipped below this before the rescue
export const JK_BAIT_BURST = 6 // finale bait downward lurch (clamped >= JK_DRAIN_TARGET)

// pacing. The finale is a RACE: a visible countdown (JK_FINALE_SECONDS) is the deadline, the torso
// drains the whole time, and it is only rescued once BOTH fixes are in. A bait burns time + lurches.
export const JK_LEAK_RATE = 1.6 // the „eine Woche später" reveal fall (62 → 49): visible but unhurried
export const JK_FINALE_RATE = 0.9 // the live finale drain (49 → 33): visibly falling under the countdown
export const JK_RESCUE_RATE = 5 // the rescue rise back into the green once BOTH fixes are in
export const JK_FINALE_SECONDS = 12 // the on-screen countdown — run out before both fixes → Abstoßung
export const JK_BAIT_TIME_COST = 3 // a tempting wrong fix burns this many seconds off the clock

// ── dose-fill „Wusstest du?" rotation (young/adult via t()) ─────────────────────
export const JK_FACTS = ['jk.fact.disease', 'jk.fact.drug', 'jk.fact.window', 'jk.fact.monitor']

// ── investigation: Frau Bergers neue Tees this week (magnifier reveal) ──────────
// All four look like harmless „natural" teas; only Johanniskraut is the CYP3A4/P-gp
// inducer. The lesson is exactly „pflanzlich ≠ harmlos — du musst jeden EINZELN prüfen".
export interface JkItem {
  id: string
  labelKey: string // the everyday name on the shelf („Stimmungstee")
  revealKey: string // the magnifier ID line (real plant + what it does)
  img: string // /johanniskraut/<id>.jpg (Wikimedia photo; emoji fallback in the component)
  emoji: string // graceful fallback / chip while the photo loads
  culprit: boolean // true = the inducer (Johanniskraut)
}
export const JK_ITEMS: JkItem[] = [
  { id: 'johanniskraut', labelKey: 'jk.item.tea', revealKey: 'jk.reveal.tea', img: '/johanniskraut/johanniskraut.jpg', emoji: '🌼', culprit: true },
  { id: 'kamille', labelKey: 'jk.item.kamille', revealKey: 'jk.reveal.kamille', img: '/johanniskraut/kamille.jpg', emoji: '🌼', culprit: false },
  { id: 'pfefferminze', labelKey: 'jk.item.pfeff', revealKey: 'jk.reveal.pfeff', img: '/johanniskraut/pfefferminze.jpg', emoji: '🌿', culprit: false },
  { id: 'ingwer', labelKey: 'jk.item.ingwer', revealKey: 'jk.reveal.ingwer', img: '/johanniskraut/ingwer.jpg', emoji: '🫚', culprit: false },
]
export const JK_CULPRIT = 'johanniskraut'

// ── finale actions: 2 mandatory (cause + contact) + 2 baits ──────────────────────
export type JkSlot = 'cause' | 'contact'
export interface JkFinaleAction {
  id: string
  labelKey: string
  feedbackKey: string
  kind: 'mandatory' | 'bait'
  slot?: JkSlot // 'cause'+'contact' = both MANDATORY to win
}
export const JK_FINALE_ACTIONS: JkFinaleAction[] = [
  { id: 'absetzen', labelKey: 'jk.act.absetzen', feedbackKey: 'jk.fb.absetzen', kind: 'mandatory', slot: 'cause' },
  { id: 'fachstelle', labelKey: 'jk.act.fachstelle', feedbackKey: 'jk.fb.fachstelle', kind: 'mandatory', slot: 'contact' },
  { id: 'verdoppeln', labelKey: 'jk.act.verdoppeln', feedbackKey: 'jk.fb.verdoppeln', kind: 'bait' },
  { id: 'naturmittel', labelKey: 'jk.act.naturmittel', feedbackKey: 'jk.fb.naturmittel', kind: 'bait' },
]
export const JK_MANDATORY = JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').map((a) => a.id) // ['absetzen','fachstelle']
/** The rescue arms only when BOTH mandatory actions are applied (stop the cause AND involve
 *  the clinic) — stopping just one keeps the protection leaking. */
export function jkArmsRescue(applied: string[]): boolean {
  return JK_MANDATORY.every((id) => applied.includes(id))
}

// ── scoring helpers (headless-pure; the component derives the inputs) ───────────
/** clever (0/0.5/1) = the investigation: how cleanly the player accused the culprit.
 *  0 wrong accusations → 1, exactly 1 → 0.5, 2+ → 0. (Mirrors Frühstücks wrong-lift grade.) */
export function jkClever(wrongAccuse: number): number {
  return wrongAccuse === 0 ? 1 : wrongAccuse === 1 ? 0.5 : 0
}
/** pro (0/0.5/1) = the finale race: (a) pulled zero baits; (b) saved fast — the Spiegel never
 *  dipped below JK_PRO_MIN before the rescue. */
export function jkPro(baitCount: number, minLevel: number): number {
  return (baitCount === 0 ? 0.5 : 0) + (minLevel >= JK_PRO_MIN ? 0.5 : 0)
}

// (the `Outcome` import documents the down-only win/under model used by the component + sim)
export type JkOutcome = Extract<Outcome, 'win' | 'under'>
