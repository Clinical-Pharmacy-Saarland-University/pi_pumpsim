// Headless "play via code" for the organ story. Run: npx tsx sim/organ.sim.ts
import { ORGAN_NOTCHES, ORGAN_DETECT, ORGAN_FINALE, organFinaleCorrect } from '../src/lib/stories/organ'
import { outcomeForLevel, stars } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

// dial notch result must match where its torso target lands
for (const n of ORGAN_NOTCHES) {
  ok(`notch ${n.id}: result '${n.result}' matches target ${n.target}`, outcomeForLevel(n.target) === n.result)
}
ok('reduced = the only win', ORGAN_NOTCHES.filter((n) => n.result === 'win').length === 1 && ORGAN_NOTCHES.find((n) => n.result === 'win')!.id === 'reduced')
ok('standard = overdose', ORGAN_NOTCHES.find((n) => n.id === 'standard')!.result === 'over')
ok('low = underdose, adult-only', ORGAN_NOTCHES.find((n) => n.id === 'low')!.result === 'under' && ORGAN_NOTCHES.find((n) => n.id === 'low')!.adultOnly === true)

// detective: exactly one correct (kidney)
ok('detective: exactly one correct = kidney', ORGAN_DETECT.filter((d) => d.correct).length === 1 && ORGAN_DETECT.find((d) => d.correct)!.id === 'kidney')

// finale mapping
const perfect: Record<string, string> = {}
for (const r of ORGAN_FINALE) perfect[r.id] = r.correct
ok('finale: correct mapping scores true', organFinaleCorrect(perfect))
ok('finale: mid→reduce is required', ORGAN_FINALE.find((r) => r.id === 'mid')!.correct === 'reduce')
ok('finale: wrong mapping → false', !organFinaleCorrect({ ...perfect, mid: 'standard' }))

// stars
ok('win + detective-first + dial-clean+finale = 3★', stars(true, true, true) === 3)
ok('loss = 0★', stars(false, true, true) === 0)

// full traces
const trace = (notchId: string) => {
  const n = ORGAN_NOTCHES.find((x) => x.id === notchId)!
  return { torso: n.target, outcome: outcomeForLevel(n.target) }
}
ok('WIN: reduced → 62 in band', trace('reduced').torso === 62 && trace('reduced').outcome === 'win')
ok('OVER: standard → 88 over', trace('standard').torso === 88 && trace('standard').outcome === 'over')
ok('UNDER: low → 41 under', trace('low').torso === 41 && trace('low').outcome === 'under')

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
