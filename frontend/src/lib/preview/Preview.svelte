<script lang="ts">
  // DEV-ONLY preview shell (mounted at /preview by main.ts, never in prod). Two tabs:
  //   • Copy-Korrekturbogen — every UI string, both age registers, all locales (typo hunt)
  //   • Live-Screens        — the real story components in the 1280×720 frame
  // The Live tab is lazy-loaded on first open so the copy sheet never imports the story
  // components (which may be mid-edit) — a broken story file only breaks the Live tab.
  import CopySheet from './CopySheet.svelte'

  type Tab = 'copy' | 'live'
  const startLive = location.hash.includes('live')
  let tab = $state<Tab>(startLive ? 'live' : 'copy')
  let LiveComp = $state<typeof import('./LivePreview.svelte').default | null>(null)
  let liveErr = $state<string | null>(null)

  async function go(t: Tab) {
    tab = t
    if (t === 'live' && !LiveComp && !liveErr) {
      try {
        LiveComp = (await import('./LivePreview.svelte')).default
      } catch (e) {
        liveErr = e instanceof Error ? e.message : String(e)
      }
    }
  }
  if (startLive) go('live')
</script>

<div class="shell">
  <nav class="tabbar">
    <div class="tabs">
      <button class:on={tab === 'copy'} onclick={() => go('copy')}>📋 Copy-Korrekturbogen</button>
      <button class:on={tab === 'live'} onclick={() => go('live')}>▶ Live-Screens</button>
    </div>
    <a class="home" href="/">← zum Spiel</a>
  </nav>

  <div class="pane">
    {#if tab === 'copy'}
      <CopySheet />
    {:else if LiveComp}
      <LiveComp />
    {:else if liveErr}
      <p class="msg err">Live-Tab konnte nicht geladen werden:<br /><code>{liveErr}</code></p>
    {:else}
      <p class="msg">Lade Live-Screens…</p>
    {/if}
  </div>
</div>

<style>
  .shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #05060c;
    color: var(--text, #e8edff);
    font-family: 'Inter', 'Noto Sans Arabic', system-ui, sans-serif;
  }
  .tabbar {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 46px;
    padding: 0 16px;
    background: #080c18;
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.12));
  }
  .tabs { display: flex; gap: 6px; height: 100%; }
  .tabs button {
    border: none;
    background: transparent;
    color: var(--dim, #9aa6c9);
    font-size: 14px;
    font-weight: 700;
    padding: 0 14px;
    border-bottom: 2px solid transparent;
  }
  .tabs button.on { color: var(--spm-cyan-bright, #28e6e0); border-bottom-color: var(--spm-cyan, #00beca); }
  .home {
    color: var(--dim, #9aa6c9); text-decoration: none; font-size: 13px; font-weight: 600;
    padding: 7px 13px; border: 1px solid var(--border, rgba(255, 255, 255, 0.12)); border-radius: 9px;
  }
  .home:hover { color: var(--text, #e8edff); border-color: var(--spm-cyan, #00beca); }

  /* the scroll parent: CopySheet's sticky headers stick relative to this box */
  .pane { flex: 1; min-height: 0; overflow-y: auto; }

  .msg { padding: 40px 24px; color: var(--dim, #9aa6c9); font-size: 15px; line-height: 1.5; }
  .msg.err { color: var(--toxic, #ff6b7a); }
  .msg code { font-family: ui-monospace, monospace; }
</style>
