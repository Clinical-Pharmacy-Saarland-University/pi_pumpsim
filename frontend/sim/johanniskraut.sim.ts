// Headless "play via code" for johanniskraut. Run: npx tsx sim/johanniskraut.sim.ts
// (The real-time race lives in JkPlay; here we assert the config + scoring rules.)
import { JK_ACTIONS, JK_HELP_IDS, JK_FLOOR, JK_DRAIN_TARGET, JK_START } from '../src/lib/stories/johanniskraut'
import { stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

ok('exactly one fix action (absetzen)', JK_ACTIONS.filter((a) => a.kind === 'fix').length === 1 && JK_ACTIONS.find((a) => a.kind === 'fix')!.id === 'absetzen')
ok('two helper actions', JK_ACTIONS.filter((a) => a.kind === 'help').length === 2)
ok('two koeder (decoy) actions', JK_ACTIONS.filter((a) => a.kind === 'koeder').length === 2)
ok('JK_HELP_IDS matches the helpers', JK_HELP_IDS.length === 2 && JK_HELP_IDS.includes('ambulanz') && JK_HELP_IDS.includes('spiegel'))

// floor sits ABOVE the engine's critical_low so WE decide the rejection (no engine auto-trip needed anyway)
ok('start in band', JK_START >= DEFAULT_CFG.band_low && JK_START <= DEFAULT_CFG.band_high)
ok('rejection floor is above critical_low', JK_FLOOR > DEFAULT_CFG.critical_low)
ok('floor is below the band (clearly a loss zone)', JK_FLOOR < DEFAULT_CFG.band_low)
ok('drain target heads below the floor', JK_DRAIN_TARGET < JK_FLOOR)

// induction only lowers — there is NO overdose ending in this story
ok('no overdose path (only down)', JK_DRAIN_TARGET < JK_START && JK_FLOOR < JK_START)

// stars: win + no-koeder + both-helps = 3
ok('clean rescue = 3★', stars(true, true, true) === 3)
ok('rescue but tapped a koeder = 2★', stars(true, false, true) === 2)
ok('rejection = 0★', stars(false, true, true) === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
