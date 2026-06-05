<script lang="ts">
  import { onMount } from 'svelte'
  import {
    game,
    init,
    begin,
    startRound,
    setHold,
    next,
    restart,
    jumpTo,
  } from './lib/game.svelte'
  import Attract from './lib/screens/Attract.svelte'
  import Intro from './lib/screens/Intro.svelte'
  import Play from './lib/screens/Play.svelte'
  import Result from './lib/screens/Result.svelte'
  import Summary from './lib/screens/Summary.svelte'
  import Admin from './lib/screens/Admin.svelte'

  let showAdmin = $state(false)

  onMount(() => init())

  let total = $derived(game.scenarios.length || 3)
  let scenario = $derived(game.scenarios[game.index])

  function onKey(e: KeyboardEvent) {
    const tg = e.target as HTMLElement | null
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return
    if (e.key === 'Escape') {
      showAdmin = false
      return
    }
    if (e.key.toLowerCase() === 'a') showAdmin = !showAdmin
  }
</script>

<svelte:window on:keydown={onKey} />

{#if game.screen === 'attract'}
  <Attract onstart={begin} />
{:else if game.screen === 'intro' && scenario}
  <Intro {scenario} index={game.index} {total} ongo={startRound} />
{:else if game.screen === 'play' && game.state && scenario}
  <Play state={game.state} {scenario} index={game.index} {total} onhold={setHold} />
{:else if game.screen === 'result' && scenario}
  <Result
    {scenario}
    stars={game.starsPerRound[game.index] ?? 0}
    greenPct={game.state?.green_pct ?? 0}
    onnext={next}
  />
{:else if game.screen === 'summary'}
  <Summary scenarios={game.scenarios} starsPerRound={game.starsPerRound} onrestart={restart} />
{/if}

{#if showAdmin}
  <Admin
    state={game.state}
    scenarios={game.scenarios}
    onjump={(id) => {
      showAdmin = false
      jumpTo(id)
    }}
    onclose={() => (showAdmin = false)}
  />
{/if}
