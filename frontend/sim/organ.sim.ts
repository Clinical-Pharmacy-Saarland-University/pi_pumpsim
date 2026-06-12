// Headless "play via code" for „Der müde Filter" (organ). Run: npx tsx sim/organ.sim.ts
// v3 two-exits: cold-start twist (same dose now rises) → discover the single renal exit (liver
// is the plausible-wrong) → adjust the dose to the tired kidney → sort which drugs lean on the
// kidney. Asserts the data model + decision→torso→outcome→stars and the two earnable bonuses
// (clever = clean exit discovery, pro = perfect drug sort) so 3★ requires real skill (no auto-3★).
import {
  ORGAN_BASE, ORGAN_DOSE, ORGAN_DRIFT, ORGAN_CONFIRM, ORGAN_OVER, ORGAN_UNDER,
  ORGAN_EXITS, ORGAN_TAPS, ORGAN_DRUGS, organClever, organSortGrade,
} from '../src/lib/stories/organ'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG

// --- data model legal vs LEVELS ---
ok('dose 62 lands in the green band (win target)', ORGAN_DOSE >= c.band_low && ORGAN_DOSE <= c.band_high)
ok('demo caps stay below the top tape (no trip)', ORGAN_DRIFT < c.critical_high && ORGAN_CONFIRM < c.critical_high)
ok('drift is clearly over the window but moderate', ORGAN_DRIFT > c.band_high && ORGAN_DRIFT <= 78)
ok('the stau-confirmation rises ABOVE the drift', ORGAN_CONFIRM > ORGAN_DRIFT)
ok('over-loss crosses the top tape (>=80)', ORGAN_OVER >= c.critical_high)
ok('under-loss under green w/ ≥5 margin, on/over baseline, above crit-low', ORGAN_UNDER < c.band_low && c.band_low - ORGAN_UNDER >= 5 && ORGAN_UNDER > ORGAN_BASE && ORGAN_UNDER > c.critical_low)
ok('baseline is the live engine baseline (42)', ORGAN_BASE === 42)

// --- the two exits (liver = plausible-wrong, kidney = the renal cause) ---
ok('exactly one correct exit', ORGAN_EXITS.filter((e) => e.correct).length === 1)
ok('the correct exit is the kidney', ORGAN_EXITS.find((e) => e.correct)!.id === 'kidney')
ok('the liver is the plausible-wrong exit', ORGAN_EXITS.find((e) => !e.correct)!.id === 'liver')

// --- taps: decision → torso target → outcome consistency ---
for (const tap of ORGAN_TAPS) {
  ok(`tap ${tap.id}: result '${tap.result}' matches torso target ${tap.target}`, outcomeForLevel(tap.target) === tap.result)
}
ok('exactly one win/under/over tap', ORGAN_TAPS.filter((t) => t.result === 'win').length === 1 && ORGAN_TAPS.filter((t) => t.result === 'under').length === 1 && ORGAN_TAPS.filter((t) => t.result === 'over').length === 1)
ok('reduce→62 (in band); full→86 (over); pause→46 (under)', ORGAN_TAPS.find((t) => t.id === 'reduce')!.target === ORGAN_DOSE && ORGAN_TAPS.find((t) => t.id === 'full')!.target === ORGAN_OVER && ORGAN_TAPS.find((t) => t.id === 'pause')!.target === ORGAN_UNDER)
ok('pause (absetzen) is adult-only; reduce/full are not', ORGAN_TAPS.find((t) => t.id === 'pause')!.adultOnly === true && !ORGAN_TAPS.find((t) => t.id === 'reduce')!.adultOnly && !ORGAN_TAPS.find((t) => t.id === 'full')!.adultOnly)
ok('young set still has a win and an over (kids can win AND lose)', (() => { const y = ORGAN_TAPS.filter((t) => !t.adultOnly); return y.some((t) => t.result === 'win') && y.some((t) => t.result === 'over') })())

// --- the drug sort (which drugs lean on the kidney) ---
ok('two renal drugs, two hepatic', ORGAN_DRUGS.filter((d) => d.renal).length === 2 && ORGAN_DRUGS.filter((d) => !d.renal).length === 2)
ok('Metformin is renal (the hero)', ORGAN_DRUGS.find((d) => d.id === 'metformin')!.renal === true)
ok('Simvastatin is hepatic (story-1 callback)', ORGAN_DRUGS.find((d) => d.id === 'simvastatin')!.renal === false)
ok('every drug carries a precise elimination tag', ORGAN_DRUGS.every((d) => !!d.tagKey))
ok('Metformin (only renal) and Penicillin (primarily renal) have distinct tags', ORGAN_DRUGS.find((d) => d.id === 'metformin')!.tagKey !== ORGAN_DRUGS.find((d) => d.id === 'penicillin')!.tagKey)

// --- scoring grades ---
ok('organClever 0/1/2 → 1/0.5/0', organClever(0) === 1 && organClever(1) === 0.5 && organClever(2) === 0)
const renalSet = new Set(ORGAN_DRUGS.filter((d) => d.renal).map((d) => d.id))
ok('organSortGrade perfect → 1', organSortGrade(renalSet) === 1)
ok('organSortGrade one mistake → 0.5', organSortGrade(new Set([...renalSet, 'paracetamol'])) === 0.5)
ok('organSortGrade two mistakes → 0', organSortGrade(new Set(['paracetamol', 'simvastatin'])) === 0)
ok('organSortGrade empty → 0 (both renal missed)', organSortGrade(new Set()) === 0)

// --- full playthrough traces (3★ needs a clean discovery AND a perfect sort — no auto-3★) ---
function play(tapId: string, wrongGuesses: number, sortSel: Set<string>) {
  const tap = ORGAN_TAPS.find((t) => t.id === tapId)!
  const out = outcomeForLevel(tap.target)
  return { out, target: tap.target, stars: stars(out === 'win', organClever(wrongGuesses), organSortGrade(sortSel)) }
}
ok('WIN flawless (kidney-first, perfect sort) → 62, win, 3.0★', (() => { const r = play('reduce', 0, renalSet); return r.target === 62 && r.out === 'win' && r.stars === 3 })())
ok('WIN one exit stumble (liver first) → 2.5★', play('reduce', 1, renalSet).stars === 2.5)
ok('WIN clean exit + one sort mistake → 2.5★', play('reduce', 0, new Set([...renalSet, 'paracetamol'])).stars === 2.5)
ok('WIN exit stumble + sort mistake → 2.0★', play('reduce', 1, new Set([...renalSet, 'paracetamol'])).stars === 2)
ok('WIN scraped (2 wrong exits + 2 sort mistakes) → 1.0★', play('reduce', 2, new Set(['paracetamol', 'simvastatin'])).stars === 1)
ok('OVER (gewohnte Menge weiter) → 86, over, 0★', (() => { const r = play('full', 0, renalSet); return r.target === 86 && r.out === 'over' && r.stars === 0 })())
ok('UNDER (ganz weglassen) → 46, under, 0★', (() => { const r = play('pause', 0, renalSet); return r.target === 46 && r.out === 'under' && r.stars === 0 })())
ok('any loss = 0★', stars(false, 1, 1) === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
