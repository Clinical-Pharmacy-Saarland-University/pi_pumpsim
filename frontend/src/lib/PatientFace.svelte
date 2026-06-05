<script lang="ts">
  let { mood = 'happy' }: { mood?: 'happy' | 'low' | 'high' } = $props()
  let ring = $derived(
    mood === 'happy' ? 'var(--green)' : mood === 'low' ? 'var(--grape)' : 'var(--toxic)',
  )
  let fill = $derived(
    mood === 'happy'
      ? 'rgba(56,224,160,.14)'
      : mood === 'low'
        ? 'rgba(255,183,3,.14)'
        : 'rgba(255,107,122,.14)',
  )
</script>

<svg class="face" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="46" {fill} stroke={ring} stroke-width="3" />
  <circle cx="37" cy="44" r="6" fill="var(--text)" />
  <circle cx="63" cy="44" r="6" fill="var(--text)" />
  {#if mood === 'happy'}
    <path d="M34 60 q16 16 32 0" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" />
  {:else if mood === 'low'}
    <path d="M34 66 q16 -13 32 0" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" />
  {:else}
    <path d="M34 63 q8 -10 16 0 q8 10 16 0" fill="none" stroke="var(--text)" stroke-width="5" stroke-linecap="round" />
  {/if}
</svg>

<style>
  .face {
    width: 100%;
    height: 100%;
    transition: filter 0.3s ease;
  }
</style>
