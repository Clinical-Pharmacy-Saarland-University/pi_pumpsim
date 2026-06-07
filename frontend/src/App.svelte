<script lang="ts">
  import { onMount } from 'svelte'
  import { game, init } from './lib/game.svelte'
  import MiniBar from './lib/MiniBar.svelte'
  import Start from './lib/screens/Start.svelte'
  import StorySelect from './lib/screens/StorySelect.svelte'
  import Briefing from './lib/screens/Briefing.svelte'
  import Play from './lib/screens/Play.svelte'
  import Resetting from './lib/screens/Resetting.svelte'
  import Outcome from './lib/screens/Outcome.svelte'
  import Admin from './lib/screens/Admin.svelte'

  let showAdmin = $state(false)
  let scale = $state(1)
  let vw = $state(1280)
  let vh = $state(720)
  let framed = $derived(!(vw === 1280 && vh === 720))

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

  const playPhases = ['dose', 'dosing', 'doseDone', 'story', 'knowledge', 'lesson', 'decision', 'settling']
  // the torso mock is relevant once we're handling a patient
  let showBar = $derived(
    !!game.level &&
      (game.phase === 'briefing' ||
        game.phase === 'resetting' ||
        game.phase === 'outcome' ||
        playPhases.includes(game.phase)),
  )

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
    {#if game.phase === 'start'}
      <Start onadmin={() => (showAdmin = true)} />
    {:else if game.phase === 'storyselect'}
      <StorySelect />
    {:else if game.phase === 'briefing'}
      <Briefing />
    {:else if game.phase === 'resetting'}
      <Resetting />
    {:else if game.phase === 'outcome'}
      <Outcome />
    {:else if playPhases.includes(game.phase)}
      <Play />
    {/if}

    {#if showBar && game.level}<MiniBar s={game.level} />{/if}
    {#if showAdmin}<Admin onclose={() => (showAdmin = false)} />{/if}
  </div>
</div>
