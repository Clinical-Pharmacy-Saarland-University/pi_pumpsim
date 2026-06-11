<script lang="ts">
  // DEV-ONLY "Live-Screens" tab of /preview (never in prod). Mounts the REAL story
  // play-components inside the exact 1280×720 Pi frame so you can click through the
  // actual screens and check layout/overflow/RTL — with age + language switches that
  // update the current screen IN PLACE (t() is reactive), so you can park on a screen
  // and flip DE→EN→AR / Kinder↔Erwachsene without restarting.
  //
  // It needs the (mock) backend: the story beats advance when the pump settles, so
  // this calls init() to open the WS — start `just dev` for it to move. Lazy-loaded
  // by Preview.svelte only when this tab is opened, so the copy sheet never imports
  // the story components (which may be mid-edit).
  import { onMount } from 'svelte'
  import { STORIES } from '../stories'
  import { game, init, selectStory, setAge } from '../game.svelte'
  import { LOCALES, setLocale, i18n, t, type Locale } from '../locale.svelte'
  import FruehstueckPlay from '../screens/FruehstueckPlay.svelte'
  import DdiPlay from '../screens/DdiPlay.svelte'
  import OrganPlay from '../screens/OrganPlay.svelte'
  import GenePlay from '../screens/GenePlay.svelte'
  import WochePlay from '../screens/WochePlay.svelte'
  import JkPlay from '../screens/JkPlay.svelte'

  const playable = STORIES.filter((s) => s.available)
  let storyId = $state(playable[0]?.id ?? 'grapefruit')
  let nonce = $state(0) // bump → remount the current story from its first beat
  let dir = $derived<'ltr' | 'rtl'>(i18n.locale === 'ar' ? 'rtl' : 'ltr')

  // scale the fixed 1280×720 frame to fit the area under the toolbar
  let frameWrap: HTMLDivElement | undefined
  let scale = $state(1)
  function fit() {
    if (!frameWrap) return
    scale = Math.max(0.2, Math.min(1, frameWrap.clientWidth / 1280, frameWrap.clientHeight / 720))
  }

  function pick(id: string) {
    const s = STORIES.find((x) => x.id === id)
    if (!s) return
    storyId = id
    selectStory(s) // sets game.story/patient so the component has its context
  }
  function replay() {
    const s = STORIES.find((x) => x.id === storyId)
    if (s) selectStory(s)
    nonce++
  }

  onMount(() => {
    const dispose = init() // connect to the (mock) backend → the pump drives the beats
    pick(storyId)
    fit()
    const ro = new ResizeObserver(fit)
    if (frameWrap) ro.observe(frameWrap)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
      dispose()
    }
  })
</script>

<div class="live">
  <div class="bar">
    <div class="stories">
      {#each playable as s}
        <button class="schip" class:on={storyId === s.id} style="--c:{s.color}" onclick={() => pick(s.id)}>
          <span class="ico">{s.icon}</span>
          {t(s.titleKey)}
        </button>
      {/each}
    </div>

    <div class="right">
      <div class="seg">
        <button class:on={game.ageGroup === 'young'} onclick={() => setAge('young')}>🧒 Kinder</button>
        <button class:on={game.ageGroup === 'adult'} onclick={() => setAge('adult')}>🧑 Erwachsene</button>
      </div>
      <div class="seg">
        {#each LOCALES as l}
          <button class:on={i18n.locale === l.id} onclick={() => setLocale(l.id)}>{l.id.toUpperCase()}</button>
        {/each}
      </div>
      <button class="replay" title="Geschichte neu starten" onclick={replay}>↻</button>
      <span class="conn" class:ok={game.connected}>{game.connected ? '● verbunden' : '○ Backend offline'}</span>
    </div>
  </div>

  <div class="frameWrap" bind:this={frameWrap}>
    <div class="fitbox" style="width:{Math.round(1280 * scale)}px; height:{Math.round(720 * scale)}px">
      <div class="pi framed" {dir} style="transform: scale({scale})">
        {#key storyId + '#' + nonce}
          {#if storyId === 'grapefruit'}<FruehstueckPlay />
          {:else if storyId === 'ddi'}<DdiPlay />
          {:else if storyId === 'organ'}<OrganPlay />
          {:else if storyId === 'gene'}<GenePlay />
          {:else if storyId === 'adherence'}<WochePlay />
          {:else if storyId === 'johanniskraut'}<JkPlay />{/if}
        {/key}
      </div>
    </div>
  </div>

  {#if !game.connected}
    <div class="hint">
      Kein Backend verbunden — starte <code>just dev</code> (Mock-Backend auf :8000), damit sich die Screens
      bewegen. Texte/Layout sind trotzdem sichtbar, aber Beats, die auf die Pumpe warten, kommen nicht weiter.
    </div>
  {/if}
</div>

<style>
  .live {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #05060c;
    color: var(--text, #e8edff);
    font-family: 'Inter', 'Noto Sans Arabic', system-ui, sans-serif;
  }

  .bar {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    background: rgba(6, 9, 18, 0.9);
  }
  .stories { display: flex; flex-wrap: wrap; gap: 6px; }
  .schip {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--surface, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 999px; padding: 6px 13px; font-size: 13px; font-weight: 700; color: var(--dim, #9aa6c9);
  }
  .schip .ico { font-size: 15px; }
  .schip.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 18%, transparent); color: var(--text, #e8edff); }

  .right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .seg {
    display: inline-flex; border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 10px; overflow: hidden;
  }
  .seg button {
    padding: 7px 11px; font-size: 12px; font-weight: 700; color: var(--dim, #9aa6c9);
    background: transparent; border-inline-start: 1px solid var(--border, rgba(255, 255, 255, 0.12));
  }
  .seg button:first-child { border-inline-start: none; }
  .seg button.on { background: rgba(0, 190, 202, 0.18); color: var(--spm-cyan-bright, #28e6e0); }

  .replay {
    width: 34px; height: 34px; border-radius: 9px; font-size: 16px;
    background: var(--surface, rgba(255, 255, 255, 0.05)); border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
  }
  .replay:active { transform: rotate(-90deg); }
  .conn { font-size: 12px; font-weight: 700; color: var(--toxic, #ff6b7a); }
  .conn.ok { color: var(--green, #38e0a0); }

  .frameWrap {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow: hidden;
  }
  .fitbox { flex: none; }

  .hint {
    flex: none;
    text-align: center;
    padding: 9px 16px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--grape, #ffb703);
    background: rgba(255, 183, 3, 0.08);
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.12));
  }
  .hint code {
    font-family: ui-monospace, monospace;
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 5px;
    border-radius: 4px;
  }
</style>
