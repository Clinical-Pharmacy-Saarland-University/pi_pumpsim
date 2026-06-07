<script lang="ts">
  import { onMount } from 'svelte'
  import { game, init, start, toDose } from './lib/game.svelte'
  import Attract from './lib/screens/Attract.svelte'
  import Briefing from './lib/screens/Briefing.svelte'
  import Play from './lib/screens/Play.svelte'
  import Outcome from './lib/screens/Outcome.svelte'
  import Admin from './lib/screens/Admin.svelte'

  let showAdmin = $state(false)
  let scale = $state(1)
  let vw = $state(1280)
  let vh = $state(720)
  // exact Pi size when the window is bigger; scale down only if smaller. Never scale up.
  let framed = $derived(!(vw === 1280 && vh === 720)) // bezel everywhere except a real 1280×720 screen

  function fit() {
    vw = window.innerWidth
    vh = window.innerHeight
    scale = Math.min(1, vw / 1280, vh / 720)
  }

  onMount(() => {
    const dispose = init()
    fit()
    window.addEventListener('resize', fit)
    return () => {
      dispose()
      window.removeEventListener('resize', fit)
    }
  })

  const inPlay = ['dose', 'dosing', 'doseDone', 'story', 'knowledge', 'lesson', 'decision', 'settling']

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

<div class="device">
  {#if framed}<div class="label">Raspberry Pi · Touch Display 2 · 1280 × 720</div>{/if}
  <div class="pi" class:framed style="transform: scale({scale})">
    {#if game.phase === 'attract'}
      <Attract onstart={start} />
    {:else if game.phase === 'briefing' && game.level}
      <Briefing patient={game.patient} level={game.level} onnext={toDose} />
    {:else if inPlay.includes(game.phase)}
      <Play />
    {:else if game.phase === 'outcome'}
      <Outcome />
    {/if}

    {#if showAdmin}
      <Admin onclose={() => (showAdmin = false)} />
    {/if}
  </div>
</div>
