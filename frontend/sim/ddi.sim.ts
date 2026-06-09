// Headless "play via code" for the DDI story. Run: npx tsx sim/ddi.sim.ts
import {
  isDdiCorrectPair, ddiPairFeedback, DDI_OPTIONS, DDI_FINALE, ddiFinaleCorrect, DDI_CARDS,
} from '../src/lib/stories/ddi'
import { outcomeForLevel, stars } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

// --- pairing ---
ok('correct pair = clarithromycin↔phenprocoumon', isDdiCorrectPair('clarithromycin', 'phenprocoumon'))
ok('pair order-independent', isDdiCorrectPair('phenprocoumon', 'clarithromycin'))
ok('clarithromycin↔pantoprazol is NOT the clash', !isDdiCorrectPair('clarithromycin', 'pantoprazol'))
ok('feedback: correct', ddiPairFeedback('clarithromycin', 'phenprocoumon') === 'ddi.pair.correct')
ok('feedback: pair without the new drug → notnew', ddiPairFeedback('metoprolol', 'ramipril') === 'ddi.pair.notnew')
ok('feedback: clarithromycin+pantoprazol → ok.pantoprazol', ddiPairFeedback('clarithromycin', 'pantoprazol') === 'ddi.pair.ok.pantoprazol')
ok('exactly one card flagged isNew (clarithromycin)', DDI_CARDS.filter((c) => c.isNew).length === 1 && DDI_CARDS.find((c) => c.isNew)!.id === 'clarithromycin')

// --- decision → torso target → outcome consistency ---
for (const o of DDI_OPTIONS) {
  ok(`option ${o.id}: result '${o.result}' matches torso target ${o.target}`, outcomeForLevel(o.target) === o.result)
}
ok('exactly one winning option (safe)', DDI_OPTIONS.filter((o) => o.result === 'win').length === 1)
ok('one underdose option (stop)', DDI_OPTIONS.filter((o) => o.result === 'under').length === 1)
ok('three overdose options', DDI_OPTIONS.filter((o) => o.result === 'over').length === 3)
ok('„double" is adult-only', DDI_OPTIONS.find((o) => o.id === 'double')!.adultOnly === true)

// --- finale bin-sort scoring ---
const perfect: Record<string, boolean> = {}
for (const it of DDI_FINALE) perfect[it.id] = it.check
ok('finale: all-correct assignment scores true', ddiFinaleCorrect(perfect))
const oneWrong = { ...perfect, metformin: true }
ok('finale: one wrong → false', !ddiFinaleCorrect(oneWrong))
ok('finale has 3 prüfen + 3 unbedenklich', DDI_FINALE.filter((i) => i.check).length === 3 && DDI_FINALE.filter((i) => !i.check).length === 3)

// --- stars (half-star: clever full=1/stumble=0.5, pro finale full=1/missed=0) ---
ok('win + pair-first-try + finale-perfect = 3★', stars(true, 1, 1) === 3)
ok('win + sloppy pair + perfect finale = 2.5★', stars(true, 0.5, 1) === 2.5)
ok('win + first-try pair, missed finale = 2★', stars(true, 1, 0) === 2)
ok('loss = 0★', stars(false, 1, 1) === 0)

// --- full playthrough traces ---
function play(optId: string, pairFirst: boolean, finaleOk: boolean) {
  const o = DDI_OPTIONS.find((x) => x.id === optId)!
  const out = outcomeForLevel(o.target)
  const s = stars(out === 'win', pairFirst ? 1 : 0.5, out === 'win' && finaleOk ? 1 : 0)
  return { torso: o.target, outcome: out, stars: s }
}
const win = play('safe', true, true)
ok('WIN path: torso 62, win, 3★', win.torso === 62 && win.outcome === 'win' && win.stars === 3)
const over = play('ignore', true, true)
ok('OVERDOSE path: torso 88, over, 0★', over.torso === 88 && over.outcome === 'over' && over.stars === 0)
const under = play('stop', true, true)
ok('UNDERDOSE path: torso 28, under, 0★', under.torso === 28 && under.outcome === 'under' && under.stars === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
