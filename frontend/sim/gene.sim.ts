// Headless "play via code" for „Drei Körper, eine Pille" (gene). Run: npx tsx sim/gene.sim.ts
// Torso-first v2: predict-then-pour ×3 (same pill, three bodies) → scanner reveal → mechanism
// → treatA (stillness trap) → treatC (live over-the-window) → finale cabinet. Asserts the
// data model + decision→torso→outcome→stars.
import {
  GENE_BASELINE, GENE_A_LOW, GENE_B_DOSE, GENE_C_HIGH, GENE_C_SURGE, GENE_A_STILL,
  GENE_FINALE_OK, GENE_FINALE_WARN, GENE_BODIES, GENE_BINS, GENE_PK_CURVES,
  GENE_TREAT_A, GENE_TREAT_C, GENE_CABINET,
  genePredictGrade, geneBetCorrect, geneProGrade,
} from '../src/lib/stories/gene'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG

// --- torso levels legal vs LEVELS / window ---
ok('baseline 40 sits below the window, above crit-low', GENE_BASELINE < c.band_low && GENE_BASELINE > c.critical_low)
ok('PM pour 46 is below the window (zu wenig), not a loss-floor', GENE_A_LOW < c.band_low && GENE_A_LOW > c.critical_low)
ok('NM pour 62 lands in the green band', GENE_B_DOSE >= c.band_low && GENE_B_DOSE <= c.band_high)
ok('UM live rise 78 is over the window, readable (<80)', GENE_C_HIGH > c.band_high && GENE_C_HIGH < c.critical_high)
ok('UM pour-twist 90 is honestly over critical-high', GENE_C_SURGE > c.critical_high)
ok('finale-ok settles in the band', GENE_FINALE_OK >= c.band_low && GENE_FINALE_OK <= c.band_high)
ok('finale-warn 74 nudges over the window, no trip', GENE_FINALE_WARN > c.band_high && GENE_FINALE_WARN < c.critical_high)
// the dead-still trap MUST be delta 0 (46==46), not 47 (delta 1 takes the moving path)
ok('GENE_A_STILL === GENE_A_LOW (delta 0 → dead-still early-branch)', GENE_A_STILL === GENE_A_LOW && Math.abs(GENE_A_STILL - GENE_A_LOW) < 1)
ok('the still trap rests under the window → under', outcomeForLevel(GENE_A_STILL) === 'under')

// --- three bodies; truths low/mid/high; pour matches truth's zone ---
ok('exactly three bodies', GENE_BODIES.length === 3)
ok('truths are low/mid/high for A/B/C', GENE_BODIES[0].truth === 'low' && GENE_BODIES[1].truth === 'mid' && GENE_BODIES[2].truth === 'high')
ok('A.pour reads under', outcomeForLevel(GENE_BODIES[0].pour) === 'under')
ok('B.pour reads win', outcomeForLevel(GENE_BODIES[1].pour) === 'win')
ok('C.pour reads over', outcomeForLevel(GENE_BODIES[2].pour) === 'over')
ok('three bins low/mid/high', GENE_BINS.length === 3)
ok('three PK curves with non-empty paths', GENE_PK_CURVES.length === 3 && GENE_PK_CURVES.every((k) => k.d.length > 0))

// --- treat A: read 'zu tief' → switch ---
const aById = (id: string) => GENE_TREAT_A.find((o) => o.id === id)!
ok('treatA switch = win (62 in band)', aById('switch').result === 'win' && outcomeForLevel(62) === 'win')
ok('treatA more/wait/samepill all under', ['more', 'wait', 'samepill'].every((id) => aById(id).result === 'under'))
ok('treatA more.target === GENE_A_STILL (dead still)', aById('more').target === GENE_A_STILL && outcomeForLevel(aById('more').target!) === 'under')
ok('treatA tramadol = retry, adult-only', aById('tramadol').result === 'retry' && aById('tramadol').adultOnly === true)
ok('treatA has exactly one win', GENE_TREAT_A.filter((o) => o.result === 'win').length === 1)

// --- treat C: read 'zu viel' (live) → switch ---
const cById = (id: string) => GENE_TREAT_C.find((o) => o.id === id)!
ok('treatC switch = win (62 in band)', cById('switch').result === 'win' && outcomeForLevel(62) === 'win')
ok('treatC more = over, crosses critical-high', cById('more').result === 'over' && cById('more').target! >= c.critical_high)
ok('treatC keep = over, above the window', cById('keep').result === 'over' && cById('keep').target! > c.band_high)
ok('treatC tramadol = retry, adult-only', cById('tramadol').result === 'retry' && cById('tramadol').adultOnly === true)
ok('treatC has exactly one win', GENE_TREAT_C.filter((o) => o.result === 'win').length === 1)

// --- finale cabinet ---
ok('exactly two safe cards (ibuprofen/paracetamol)', GENE_CABINET.filter((c) => c.safe).length === 2)
ok('codein cards are unsafe', GENE_CABINET.filter((c) => c.id.startsWith('codein')).every((c) => !c.safe))
ok('tramadol unsafe + adult profi-trap', GENE_CABINET.find((c) => c.id === 'tramadol')!.safe === false && GENE_CABINET.find((c) => c.id === 'tramadol')!.adultOnly === true)

// --- wager correctness + grades ---
ok('geneBetCorrect A/low true, A/high false', geneBetCorrect(GENE_BODIES[0], 'low') === true && geneBetCorrect(GENE_BODIES[0], 'high') === false)
ok('predictGrade 0/1/2/3 → 1/0.5/0/0', genePredictGrade(0) === 1 && genePredictGrade(1) === 0.5 && genePredictGrade(2) === 0 && genePredictGrade(3) === 0)
ok('proGrade 0/1/2 → 1/0.5/0', geneProGrade(0) === 1 && geneProGrade(1) === 0.5 && geneProGrade(2) === 0)

// --- scoring traces ---
ok('flawless win = 3★', stars(true, genePredictGrade(0), geneProGrade(0)) === 3)
ok('one wrong bet = 2.5★', stars(true, genePredictGrade(1), geneProGrade(0)) === 2.5)
ok('one stumble = 2.5★', stars(true, genePredictGrade(0), geneProGrade(1)) === 2.5)
ok('scraped win (2 wrong bets, 2 stumbles) = 1★', stars(true, genePredictGrade(2), geneProGrade(2)) === 1)
ok('any loss = 0★', stars(false, 1, 1) === 0)

// --- full playthrough traces ---
function play(treatAId: string, treatCId: string, betMisses: number, stumbles: number) {
  const a = aById(treatAId), cc = cById(treatCId)
  // the run is a win only if BOTH treatments are the winning switch
  const aOut = a.result === 'win' ? 'win' : a.result === 'retry' ? 'win' : outcomeForLevel(a.target ?? GENE_A_STILL)
  const cOut = cc.result === 'win' ? 'win' : cc.result === 'retry' ? 'win' : outcomeForLevel(cc.target ?? GENE_C_HIGH)
  const win = aOut === 'win' && cOut === 'win'
  const outcome = win ? 'win' : aOut !== 'win' ? aOut : cOut
  return { outcome, stars: stars(win, genePredictGrade(betMisses), geneProGrade(stumbles)) }
}
const win = play('switch', 'switch', 0, 0)
ok('WIN path: switch+switch, flawless → win, 3★', win.outcome === 'win' && win.stars === 3)
const over = play('switch', 'more', 0, 0)
ok('OVER path: more codeine at C → over, 0★', over.outcome === 'over' && over.stars === 0)
const under = play('more', 'switch', 0, 0)
ok('UNDER path: more codeine at A → under (dead still 46), 0★', under.outcome === 'under' && under.stars === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
