<script lang="ts">
  import { t } from './locale'

  let { drugId, size = 70 }: { drugId: string; size?: number } = $props()
  const colors: Record<string, string> = {
    para: 'var(--para)',
    sim: 'var(--sim)',
    meto: 'var(--meto)',
  }
  let color = $derived(colors[drugId] ?? 'var(--water-top)')
</script>

<div class="mascot">
  <svg viewBox="0 0 100 60" style="width:{size}px;height:{(size * 60) / 100}px">
    <rect x="6" y="14" width="88" height="34" rx="17" fill={color} />
    <rect x="6" y="14" width="44" height="34" rx="17" fill="rgba(255,255,255,0.28)" />
    <circle cx="33" cy="31" r="4.5" fill="#0b1020" />
    <circle cx="58" cy="31" r="4.5" fill="#0b1020" />
    <path d="M39 39 q8 6 16 0" fill="none" stroke="#0b1020" stroke-width="3" stroke-linecap="round" />
  </svg>
  <div class="names">
    <b>{t('d.' + drugId + '.short')}</b>
    <span>{t('d.' + drugId + '.full')}</span>
  </div>
</div>

<style>
  .mascot {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .names {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .names b {
    font-size: 17px;
    font-weight: 800;
  }
  .names span {
    font-size: 12px;
    color: var(--dim);
  }
</style>
