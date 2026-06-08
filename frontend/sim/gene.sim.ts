// Headless "play via code" for the gene story. Run: npx tsx sim/gene.sim.ts
import { GENE_TWINS, genePredictCorrect, GENE_OPTIONS } from '../src/lib/stories/gene'
import { outcomeForLevel, stars } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

// the same dose lands in 3 different zones by genotype
ok('slow → under band (no morphine)', outcomeForLevel(GENE_TWINS.find((t) => t.id === 'slow')!.level) === 'under')
ok('normal → in band', outcomeForLevel(GENE_TWINS.find((t) => t.id === 'normal')!.level) === 'win')
ok('ultra → over band (too much morphine)', outcomeForLevel(GENE_TWINS.find((t) => t.id === 'ultra')!.level) === 'over')
ok('predicted bins match the zones', GENE_TWINS.every((t) => (t.bin === 'low' ? 'under' : t.bin === 'mid' ? 'win' : 'over') === outcomeForLevel(t.level)))

// predict scoring
const perfect = { slow: 'low', normal: 'mid', ultra: 'high' }
ok('predict: correct sort scores true', genePredictCorrect(perfect))
ok('predict: a swap → false', !genePredictCorrect({ ...perfect, slow: 'high', ultra: 'low' }))

// strategy: only switching to a non-CYP2D6 drug wins
ok('switch = win (62)', (() => { const o = GENE_OPTIONS.find((x) => x.id === 'switch')!; return o.result === 'win' && outcomeForLevel(o.target) === 'win' })())
ok('keep codeine = overdose', (() => { const o = GENE_OPTIONS.find((x) => x.id === 'keep')!; return o.result === 'over' && outcomeForLevel(o.target) === 'over' })())
ok('tramadol = retry trap (also CYP2D6)', GENE_OPTIONS.find((x) => x.id === 'tramadol')!.result === 'retry')
ok('increase codeine = adult-only overdose', (() => { const o = GENE_OPTIONS.find((x) => x.id === 'increase')!; return o.result === 'over' && o.adultOnly === true })())

// stars
ok('win + predict-perfect + no-tramadol = 3★', stars(true, true, true) === 3)
ok('win + sloppy predict = 2★', stars(true, false, true) === 2)
ok('loss = 0★', stars(false, true, true) === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
