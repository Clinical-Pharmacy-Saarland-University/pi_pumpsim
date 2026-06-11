<script lang="ts">
  import { onMount } from 'svelte'
  import { game, init } from './lib/game.svelte'
  import { i18n } from './lib/locale.svelte'
  import Start from './lib/screens/Start.svelte'
  import StorySelect from './lib/screens/StorySelect.svelte'
  import DdiPlay from './lib/screens/DdiPlay.svelte'
  import OrganPlay from './lib/screens/OrganPlay.svelte'
  import GenePlay from './lib/screens/GenePlay.svelte'
  import WochePlay from './lib/screens/WochePlay.svelte'
  import JkPlay from './lib/screens/JkPlay.svelte'
  import FruehstueckPlay from './lib/screens/FruehstueckPlay.svelte'
  import Resetting from './lib/screens/Resetting.svelte'
  import Admin from './lib/screens/Admin.svelte'
  import VirtualTorso from './lib/VirtualTorso.svelte'

  let showAdmin = $state(false)
  // boot warning: nag once per boot, on the Start screen, if the torso isn't
  // initialised (not homed) — with a big jump to the admin Setup page. Cleared by
  // initialising (homed) or dismissing.
  let bootAck = $state(false)
  let needInit = $derived(
    !showAdmin && game.phase === 'start' && !!game.level && !game.level.homed && !bootAck,
  )
  let scale = $state(1)
  let vw = $state(1280)
  let vh = $state(720)
  let framed = $derived(!(vw === 1280 && vh === 720))
  // Arabic reads right-to-left; flip the whole game frame for the ar locale.
  let dir = $derived<'ltr' | 'rtl'>(i18n.locale === 'ar' ? 'rtl' : 'ltr')

  // dev chrome around the Pi frame: the virtual-torso panel + its gap
  const TWIN_W = 300 + 28

  function fit() {
    vw = window.innerWidth
    vh = window.innerHeight
    if (vw === 1280 && vh === 720) {
      scale = 1 // the real Pi screen: exact fit, no dev chrome
      return
    }
    scale = Math.max(0.25, Math.min(1, (vw - TWIN_W - 24) / 1280, (vh - 60) / 720))
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
  <div class="stage">
  {#if framed}<div class="label">Raspberry Pi · Touch Display 2 · 1280 × 720</div>{/if}
  <!-- .fit reserves the SCALED footprint so the twin panel can sit beside the frame;
       no transform at 1:1 (Pi): a scaled/transformed container can offset touch
       hit-testing; only scale in the dev frame where scale < 1 -->
  <div class="fit" style={scale === 1 ? '' : `width:${1280 * scale}px; height:${720 * scale}px`}>
  <div class="pi" class:framed {dir} style={scale === 1 ? '' : `transform: scale(${scale})`}>
    {#if showAdmin}
      <!-- render admin INSTEAD of the screen so the animated Backdrop underneath
           stops (it's a big GPU drain on the Pi → draggy scroll / laggy taps) -->
      <Admin onclose={() => (showAdmin = false)} />
    {:else if game.phase === 'start'}
      <Start onadmin={() => (showAdmin = true)} />
    {:else if game.phase === 'storyselect'}
      <StorySelect />
    {:else if game.phase === 'resetting'}
      <Resetting />
    {:else if game.phase === 'play2'}
      <!-- key on runNonce so a same-story retry (phase stays 'play2') still fully
           remounts the play component, resetting its internal beat/state -->
      {#key game.runNonce}
        {#if game.story?.id === 'grapefruit'}<FruehstueckPlay />
        {:else if game.story?.id === 'ddi'}<DdiPlay />
        {:else if game.story?.id === 'organ'}<OrganPlay />
        {:else if game.story?.id === 'gene'}<GenePlay />
        {:else if game.story?.id === 'adherence'}<WochePlay />
        {:else if game.story?.id === 'johanniskraut'}<JkPlay />{/if}
      {/key}
    {/if}

    {#if needInit}
      <div class="bootwarn">
        <div class="card">
          <div class="ico">⚠</div>
          <h2>System not initialized</h2>
          <p>
            The torso state is unknown — it may still hold water from before. Initialize it before
            the first game so the level is correct.
          </p>
          <button class="go" onclick={() => { showAdmin = true; bootAck = true }}>
            ⚙ Open Setup &amp; initialize
          </button>
          <button class="later" onclick={() => (bootAck = true)}>Dismiss</button>
        </div>
      </div>
    {/if}
  </div>
  </div>
  </div>
  {#if framed}
    <!-- dev-only: the virtual twin of the physical torso, outside the Pi frame -->
    <aside class="twin-panel">
      <VirtualTorso s={game.level} connected={game.connected} />
    </aside>
  {/if}
</div>

<style>
  /* boot warning: shown over the Start screen until the torso is initialised */
  .bootwarn {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4, 7, 14, 0.86);
    backdrop-filter: blur(3px);
  }
  .bootwarn .card {
    width: min(560px, 86%);
    background: var(--surface, #121a2e);
    border: 1px solid var(--border, #2a3656);
    border-top: 4px solid #e0a23a;
    border-radius: 20px;
    padding: 28px 32px 24px;
    text-align: center;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  }
  .bootwarn .ico {
    font-size: 44px;
    line-height: 1;
  }
  .bootwarn h2 {
    margin: 10px 0 8px;
    font-size: 26px;
    color: var(--text, #e8edff);
  }
  .bootwarn p {
    margin: 0 0 22px;
    font-size: 16px;
    line-height: 1.5;
    color: var(--dim, #9aa6c4);
  }
  .bootwarn .go {
    display: block;
    width: 100%;
    border: none;
    border-radius: 14px;
    padding: 20px;
    font-size: 20px;
    font-weight: 800;
    color: #04222a;
    background: linear-gradient(120deg, var(--spm-cyan, #00beca), var(--green, #1f9d6b));
    touch-action: manipulation;
  }
  .bootwarn .go:active {
    transform: scale(0.98);
  }
  .bootwarn .later {
    margin-top: 12px;
    background: none;
    border: none;
    color: var(--dim, #9aa6c4);
    font-size: 14px;
    text-decoration: underline;
    touch-action: manipulation;
  }
</style>
