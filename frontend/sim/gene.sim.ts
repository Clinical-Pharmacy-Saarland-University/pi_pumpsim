// Headless "play via code" for „Drei Körper, eine Pille" (gene) — overhaul v2.1.
// Run: npx tsx sim/gene.sim.ts
// Flow: dose three kids ×1 (same pill, distinct bodies) → observe Q → assign genotype machines
// (the inversion) → animated curves → treatA (stillness trap) → treatC (live over-window) →
// finale cabinet. Asserts the data model + decision→torso→outcome→stars.
import {
  GENE_BASELINE, GENE_A_LOW, GENE_B_DOSE, GENE_C_HIGH, GENE_C_OVER, GENE_C_KEEP, GENE_A_STILL,
  GENE_FINALE_OK, GENE_FINALE_WARN, GENE_BODIES, GENE_BINS, GENE_MACHINES, GENE_PK_CURVES,
  GENE_OBSERVE, GENE_TREAT_A, GENE_TREAT_C, GENE_CABINET,
  geneAssignCorrect, geneCleverGrade, geneProGrade,
} from '../src/lib/stories/gene'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG
const mara = GENE_BODIES.find((b) => b.id === 'A')!
const jonas = GENE_BODIES.find((b) => b.id === 'B')!
const emil = GENE_BODIES.find((b) => b.id === 'C')!

// --- torso levels legal vs LEVELS / window ---
ok('baseline 40 sits below the window, above crit-low', GENE_BASELINE < c.band_low && GENE_BASELINE > c.critical_low)
ok('Mara pour 46 is below the window (zu wenig), above crit-low', GENE_A_LOW < c.band_low && GENE_A_LOW > c.critical_low)
ok('Jonas pour 62 lands in the green band', GENE_B_DOSE >= c.band_low && GENE_B_DOSE <= c.band_high)
ok('Emil live rise 76 is over the window, readable (<80, no slam)', GENE_C_HIGH > c.band_high && GENE_C_HIGH < c.critical_high)
ok('Emil "mehr Codein" 84 is honestly over critical-high', GENE_C_OVER > c.critical_high)
ok('Emil "bei Codein bleiben" 82 stays over the window', GENE_C_KEEP > c.band_high)
ok('finale-ok settles in the band', GENE_FINALE_OK >= c.band_low && GENE_FINALE_OK <= c.band_high)
ok('finale-warn 74 nudges over the window, no trip', GENE_FINALE_WARN > c.band_high && GENE_FINALE_WARN < c.critical_high)
// the dead-still trap MUST be delta 0 (46==46), not 47 (delta 1 takes the moving path)
ok('GENE_A_STILL === GENE_A_LOW (delta 0 → dead-still early-branch)', GENE_A_STILL === GENE_A_LOW && Math.abs(GENE_A_STILL - GENE_A_LOW) < 1)
ok('the still trap rests under the window → under', outcomeForLevel(GENE_A_STILL) === 'under')

// --- three distinct kids; truths low/mid/high; level outcome matches; machine ⇔ truth ---
ok('exactly three bodies', GENE_BODIES.length === 3)
ok('truths: Mara low, Jonas mid, Emil high', mara.truth === 'low' && jonas.truth === 'mid' && emil.truth === 'high')
ok('display order is mixed (not the obvious low→mid→high)', !(GENE_BODIES[0].truth === 'low' && GENE_BODIES[1].truth === 'mid' && GENE_BODIES[2].truth === 'high'))
ok('three distinct avatars', new Set(GENE_BODIES.map((b) => b.emoji)).size === 3)
ok('Mara level reads under', outcomeForLevel(mara.level) === 'under')
ok('Jonas level reads win', outcomeForLevel(jonas.level) === 'win')
ok('Emil level reads over', outcomeForLevel(emil.level) === 'over')
ok('three bins low/mid/high', GENE_BINS.length === 3)

// --- genotype machines + the inversion (assign) ---
ok('three machines slow/normal/fast', GENE_MACHINES.length === 3 && GENE_MACHINES.map((m) => m.id).join() === 'slow,normal,fast')
ok('each machine bin matches its kid (slow↔low, normal↔mid, fast↔high)', GENE_BODIES.every((b) => GENE_MACHINES.find((m) => m.id === b.machine)!.bin === b.truth))
ok('assign correct: slow→Mara true, fast→Mara false', geneAssignCorrect(mara, 'slow') === true && geneAssignCorrect(mara, 'fast') === false)
ok('assign correct: fast→Emil true, slow→Emil false (the inversion)', geneAssignCorrect(emil, 'fast') === true && geneAssignCorrect(emil, 'slow') === false)
ok('three PK curves with non-empty paths + emoji', GENE_PK_CURVES.length === 3 && GENE_PK_CURVES.every((k) => k.d.length > 0 && k.emoji.length > 0))

// --- observe: exactly one truth, sensible distractors ---
ok('observe has exactly one correct option', GENE_OBSERVE.filter((o) => o.correct).length === 1)
ok('observe has 4 options', GENE_OBSERVE.length === 4)

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
ok('exactly two safe cards (ibuprofen/paracetamol)', GENE_CABINET.filter((x) => x.safe).length === 2)
ok('codein cards are unsafe', GENE_CABINET.filter((x) => x.id.startsWith('codein')).every((x) => !x.safe))
ok('tramadol unsafe + adult profi-trap', GENE_CABINET.find((x) => x.id === 'tramadol')!.safe === false && GENE_CABINET.find((x) => x.id === 'tramadol')!.adultOnly === true)

// --- grades ---
ok('cleverGrade 0/1/2 → 1/0.5/0', geneCleverGrade(0) === 1 && geneCleverGrade(1) === 0.5 && geneCleverGrade(2) === 0)
ok('proGrade 0/1/2 → 1/0.5/0', geneProGrade(0) === 1 && geneProGrade(1) === 0.5 && geneProGrade(2) === 0)

// --- scoring traces ---
ok('flawless win = 3★', stars(true, geneCleverGrade(0), geneProGrade(0)) === 3)
ok('one clever miss = 2.5★', stars(true, geneCleverGrade(1), geneProGrade(0)) === 2.5)
ok('one pro stumble = 2.5★', stars(true, geneCleverGrade(0), geneProGrade(1)) === 2.5)
ok('scraped win (2 clever misses, 2 pro stumbles) = 1★', stars(true, geneCleverGrade(2), geneProGrade(2)) === 1)
ok('any loss = 0★', stars(false, 1, 1) === 0)

// --- full playthrough traces ---
function play(treatAId: string, treatCId: string, cleverMisses: number, proStumbles: number) {
  const a = aById(treatAId), cc = cById(treatCId)
  const aOut = a.result === 'win' ? 'win' : a.result === 'retry' ? 'win' : outcomeForLevel(a.target ?? GENE_A_STILL)
  const cOut = cc.result === 'win' ? 'win' : cc.result === 'retry' ? 'win' : outcomeForLevel(cc.target ?? GENE_C_HIGH)
  const win = aOut === 'win' && cOut === 'win'
  const outcome = win ? 'win' : aOut !== 'win' ? aOut : cOut
  return { outcome, stars: stars(win, geneCleverGrade(cleverMisses), geneProGrade(proStumbles)) }
}
const win = play('switch', 'switch', 0, 0)
ok('WIN path: switch+switch, flawless → win, 3★', win.outcome === 'win' && win.stars === 3)
const over = play('switch', 'more', 0, 0)
ok('OVER path: more codeine at Emil → over, 0★', over.outcome === 'over' && over.stars === 0)
const under = play('more', 'switch', 0, 0)
ok('UNDER path: more codeine at Mara → under (dead still 46), 0★', under.outcome === 'under' && under.stars === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
