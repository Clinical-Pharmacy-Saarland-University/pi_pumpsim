<script lang="ts">
  import { onMount } from 'svelte'
  import { game, init, start, toDose } from './lib/game.svelte'
  import Attract from './lib/screens/Attract.svelte'
  import Briefing from './lib/screens/Briefing.svelte'
  import Play from './lib/screens/Play.svelte'
  import Outcome from './lib/screens/Outcome.svelte'
  import Admin from './lib/screens/Admin.svelte'

  let showAdmin = $state(false)
  onMount(() => init())

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
