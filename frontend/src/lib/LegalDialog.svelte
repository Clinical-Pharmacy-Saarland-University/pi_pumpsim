<script lang="ts">
  // Web demo only: the Impressum / Datenschutzerklärung (texts in legal.ts) as an overlay
  // over the whole window. German is authoritative; every other locale gets the English
  // translation. Esc, the ✕ or a click on the backdrop closes it.
  import { i18n, t } from './locale.svelte'
  import { imprint, privacy } from './legal'

  let { doc, onclose }: { doc: 'imprint' | 'privacy'; onclose: () => void } = $props()
  let d = $derived((doc === 'imprint' ? imprint : privacy)[i18n.locale === 'de' ? 'de' : 'en'])
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => e.target === e.currentTarget && onclose()}>
  <div class="legal" role="dialog" aria-modal="true" aria-labelledby="legal-title" dir="ltr">
    <header>
      <h1 id="legal-title">{d.title}</h1>
      <button class="close" onclick={onclose} aria-label={t('web.close')}>✕</button>
    </header>
    {#if d.intro}<p class="intro">{d.intro}</p>{/if}
    {#each d.sections as sec}
      <section>
        {#if sec.heading}<h2>{sec.heading}</h2>{/if}
        {#each sec.blocks as b}
          {#if b.kind === 'p'}
            <p>{b.text}</p>
          {:else if b.kind === 'address'}
            <address>{b.text}</address>
          {:else if b.kind === 'ul'}
            <ul>{#each b.items as item}<li>{item}</li>{/each}</ul>
          {:else if b.kind === 'link'}
            <p><a href={b.href} target="_blank" rel="noopener noreferrer">{b.text} ↗</a></p>
          {/if}
        {/each}
      </section>
    {/each}
    <p class="updated">{d.updatedLabel}</p>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: rgba(4, 7, 14, 0.82);
    backdrop-filter: blur(3px);
    -webkit-user-select: text;
    user-select: text;
  }
  .legal {
    width: min(760px, 100%);
    max-height: 100%;
    overflow-y: auto;
    padding: 28px 32px 24px;
    background: #121a2e;
    border: 1px solid var(--border);
    border-top: 4px solid var(--spm-cyan);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
    font-size: 15px;
    line-height: 1.55;
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 26px;
    font-weight: 800;
  }
  .close {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--surface2);
    font-size: 18px;
  }
  .close:hover {
    background: var(--border);
  }
  h2 {
    margin: 20px 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: var(--spm-cyan-bright);
  }
  p,
  address,
  li {
    color: var(--text);
  }
  p + p,
  address + p {
    margin-top: 8px;
  }
  address {
    font-style: normal;
    white-space: pre-line;
  }
  ul {
    padding-inline-start: 20px;
  }
  li + li {
    margin-top: 6px;
  }
  a {
    color: var(--spm-cyan-bright);
  }
  .intro,
  .updated {
    color: var(--dim);
    font-size: 13px;
  }
  .updated {
    margin-top: 22px;
  }
</style>
