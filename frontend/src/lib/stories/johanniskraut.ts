// Story „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin) — pure data.
// Torso-first v2 (docs/stories/overhaul/build-johanniskraut.md). Signature mechanic:
// READ-A-DELAYED-LEAK & BACK-DATE — investigate a fixed week, read the delayed fall on
// the body, blame the QUIET day the tea started (Di = a true no-move), then stop the
// leak live. DOWN only: induction lowers the Spiegel; there is no overdose path. No
// on-screen vessel/meter. No Svelte runes → headless-testable.
import { LEVELS, type Outcome } from '../flow'

// ── levels (from the single source of truth; down-only story) ──────────────────
export const JK_BASELINE = 40 // prime: below the band, ungeschützt (a watchable fill to dose)
export const JK_DOSE = LEVELS.dose // 62 — standard dose lands in the green window
export const JK_READ_LEVEL = 49 // read-the-body hold: clearly UNDER the band, near its lower edge
export const JK_FINALE_START = 47 // where the live leak begins to fall from
export const JK_FLOOR = 38 // component loss trip (invisible on torso; engine auto-trip OFF for play2)
export const JK_DRAIN_TARGET = 33 // drive target UNDER the floor — guarantees the fall reaches JK_FLOOR
export const JK_PRO_MIN = 45 // pro half-star: the Spiegel never dipped below this in the finale
export const JK_TICK_INDUCER = 5 // a LATE-day inducer tick (>=4 so it is visible on the slow pump)
export const JK_TICK_DELAY = 0 // the Dienstag delay is a TRUE NO-MOVE (driveTo NOT called); MUST-FIX #1
export const JK_TICK_PENALTY = 4 // read-the-body / mechanism stumble tick (visible, clamps > JK_FLOOR)
export const JK_BAIT_BURST = 7 // finale bait downward burst (clamped >= JK_DRAIN_TARGET)

// ── dose-fill „Wusstest du?" rotation (young/adult via t()) ────────────────────
export const JK_FACTS = ['jk.fact.disease', 'jk.fact.drug', 'jk.fact.window', 'jk.fact.timing']

// ── the fixed week the player investigates (history, NOT authored) ─────────────
export type JkCardKind = 'known' | 'herb' | 'routine' | 'symptom'
export interface JkWeekCard {
  id: string
  labelKey: string
  detailKey: string
  icon: string
  kind: JkCardKind // 'herb' = an inducer (the culprit class); everything else is innocent
}
export interface JkWeekDay {
  id: string
  shortKey: string // 'jk.day.mo' … flat label, NO height
  titleKey: string
  noteKey: string
  level: number // the baseline-carry target after this day (drifts down only; > JK_FLOOR)
  inducerTick: number // Di = JK_TICK_DELAY (0 → no-move delay); Mi/Fr = JK_TICK_INDUCER (5)
  cards: JkWeekCard[]
}
export const JK_WEEK_DAYS: JkWeekDay[] = [
  { id: 'mo', shortKey: 'jk.day.mo', titleKey: 'jk.week.mo.title', noteKey: 'jk.week.mo.note', level: 62, inducerTick: 0, cards: [
    { id: 'ciclosporin', labelKey: 'jk.card.ciclosporin', detailKey: 'jk.card.ciclosporin.detail', icon: '💊', kind: 'known' },
    { id: 'breakfast', labelKey: 'jk.card.breakfast', detailKey: 'jk.card.breakfast.detail', icon: '🥐', kind: 'routine' },
  ] },
  { id: 'di', shortKey: 'jk.day.di', titleKey: 'jk.week.di.title', noteKey: 'jk.week.di.note', level: 62, inducerTick: JK_TICK_DELAY, cards: [
    { id: 'tea', labelKey: 'jk.card.tea', detailKey: 'jk.card.tea.detail', icon: '🍵', kind: 'herb' },
    { id: 'water', labelKey: 'jk.card.water', detailKey: 'jk.card.water.detail', icon: '💧', kind: 'routine' },
  ] },
  { id: 'mi', shortKey: 'jk.day.mi', titleKey: 'jk.week.mi.title', noteKey: 'jk.week.mi.note', level: 57, inducerTick: JK_TICK_INDUCER, cards: [
    { id: 'caps', labelKey: 'jk.card.caps', detailKey: 'jk.card.caps.detail', icon: '💊', kind: 'herb' },
    { id: 'camomile', labelKey: 'jk.card.camomile', detailKey: 'jk.card.camomile.detail', icon: '🌼', kind: 'routine' },
  ] },
  { id: 'do', shortKey: 'jk.day.do', titleKey: 'jk.week.do.title', noteKey: 'jk.week.do.note', level: 54, inducerTick: 0, cards: [
    { id: 'walk', labelKey: 'jk.card.walk', detailKey: 'jk.card.walk.detail', icon: '🚶', kind: 'routine' },
    { id: 'apple', labelKey: 'jk.card.apple', detailKey: 'jk.card.apple.detail', icon: '🍎', kind: 'routine' },
  ] },
  { id: 'fr', shortKey: 'jk.day.fr', titleKey: 'jk.week.fr.title', noteKey: 'jk.week.fr.note', level: 51, inducerTick: JK_TICK_INDUCER, cards: [
    { id: 'teaRepeat', labelKey: 'jk.card.teaRepeat', detailKey: 'jk.card.teaRepeat.detail', icon: '🍵', kind: 'herb' },
    { id: 'sleep', labelKey: 'jk.card.sleep', detailKey: 'jk.card.sleep.detail', icon: '😴', kind: 'symptom' },
  ] },
  { id: 'sa', shortKey: 'jk.day.sa', titleKey: 'jk.week.sa.title', noteKey: 'jk.week.sa.note', level: 50, inducerTick: 0, cards: [
    { id: 'food', labelKey: 'jk.card.food', detailKey: 'jk.card.food.detail', icon: '🥗', kind: 'routine' },
    { id: 'mask', labelKey: 'jk.card.mask', detailKey: 'jk.card.mask.detail', icon: '🌙', kind: 'routine' },
  ] },
  { id: 'so', shortKey: 'jk.day.so', titleKey: 'jk.week.so.title', noteKey: 'jk.week.so.note', level: 50, inducerTick: 0, cards: [
    { id: 'low', labelKey: 'jk.card.low', detailKey: 'jk.card.low.detail', icon: '📉', kind: 'symptom' },
    { id: 'ciclosporinSame', labelKey: 'jk.card.ciclosporinSame', detailKey: 'jk.card.ciclosporinSame.detail', icon: '💊', kind: 'known' },
  ] },
]

// ── finale actions: 3 real (cause + monitor + contact) + 3 baits ───────────────
export type JkSlot = 'cause' | 'contact' | 'monitor'
export interface JkFinaleAction {
  id: string
  labelKey: string
  feedbackKey: string
  kind: 'mandatory' | 'bonus' | 'bait'
  slot?: JkSlot // 'cause'+'contact' = MANDATORY to win; 'monitor' = bonus
}
export const JK_FINALE_ACTIONS: JkFinaleAction[] = [
  { id: 'absetzen', labelKey: 'jk.act.absetzen', feedbackKey: 'jk.fb.absetzen', kind: 'mandatory', slot: 'cause' },
  { id: 'fachstelle', labelKey: 'jk.act.fachstelle', feedbackKey: 'jk.fb.fachstelle', kind: 'mandatory', slot: 'contact' },
  { id: 'spiegel', labelKey: 'jk.act.spiegel', feedbackKey: 'jk.fb.spiegel', kind: 'bonus', slot: 'monitor' },
  { id: 'tee', labelKey: 'jk.act.tee', feedbackKey: 'jk.fb.tee', kind: 'bait' },
  { id: 'verdoppeln', labelKey: 'jk.act.verdoppeln', feedbackKey: 'jk.fb.verdoppeln', kind: 'bait' },
  { id: 'naturmittel', labelKey: 'jk.act.naturmittel', feedbackKey: 'jk.fb.naturmittel', kind: 'bait' },
]
export const JK_MANDATORY = JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').map((a) => a.id) // ['absetzen','fachstelle']
/** the rescue arms ONLY when BOTH mandatory actions are applied (the leak keeps falling until then). */
export function jkArmsRescue(applied: string[]): boolean {
  return JK_MANDATORY.every((id) => applied.includes(id))
}

// ── back-dating: the correct day is Dienstag, the visible-crash decoy is Sonntag ─
export const JK_CAUSE_DAY = 'di'
export const JK_DECOY_DAY = 'so'
// the mechanism leiste only exposes the days the player placed a card on + the decoy,
// so back-dating is an inference (quiet tea-day vs loud crash-day), not a 7-day sweep.
export const JK_MECH_CANDIDATES = ['di', 'mi', 'fr', 'so'] // cause + late inducers + decoy

// ── scoring helpers (headless-pure; the component derives win/clever/pro inputs) ─
/** clever (0/0.5/1): (a) found a herb with <=1 false flag in the week; (b) read-the-body AND
 *  back-date both first-try clean. Each worth 0.5. */
export function jkClever(herbTaken: number, falseFlags: number, readClean: boolean, mechClean: boolean): number {
  const detective = herbTaken > 0 && falseFlags <= 1 ? 0.5 : 0
  const backdate = readClean && mechClean ? 0.5 : 0
  return detective + backdate
}
/** pro (0/0.5/1): (a) the bonus leak (Talspiegel) also stopped; (b) zero baits AND minLevel >= JK_PRO_MIN. */
export function jkPro(monitorStopped: boolean, baitCount: number, minLevel: number): number {
  return (monitorStopped ? 0.5 : 0) + (baitCount === 0 && minLevel >= JK_PRO_MIN ? 0.5 : 0)
}

// (the `Outcome` import documents the down-only win/under model used by the component + sim)
export type JkOutcome = Extract<Outcome, 'win' | 'under'>
