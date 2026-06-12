<script lang="ts">
  // The enzyme „Werkstatt" — the throttle instrument for „Die Blut-Balance" (DDI).
  // Presentational only: given a `mode`, it shows the body's Helfer (the metabolising
  // enzyme) clearing the blood thinner that keeps flowing in. Normal = balanced; Bremse
  // (inhibitor) = the helper is jammed and the thinner piles up in a „Stau"; Turbo
  // (inducer) = the helper races and clears it too fast. The LEVEL consequence is the
  // real pump in the torso, NOT shown here — this only teaches the mechanism. Touch-only,
  // reduced-motion safe. Reused for the Act-1 teach and the Act-2 carbamazepin reveal.
  import { t } from '../locale.svelte'
  import type { Throttle } from '../stories/ddi'

  let { mode = 'normal' }: { mode?: Throttle } = $props()

  // the thinner backs up against a jammed helper; nothing piles otherwise
  let pile = $derived(mode === 'bremse' ? 6 : 0)
</script>

<div class="werk {mode}" role="img" aria-label={t(`ddi.werk.aria.${mode}`)}>
  <div class="cell src">
    <span class="ic">💧</span>
    <small>{t('ddi.werk.in')}</small>
  </div>

  <div class="lane">
    <span class="flow" style="--i:0"></span>
    <span class="flow" style="--i:1"></span>
    <span class="flow" style="--i:2"></span>
    <span class="flow" style="--i:3"></span>
    <div class="pile">
      {#each Array(pile) as _, i (i)}<span style="--p:{i}"></span>{/each}
    </div>
  </div>

  <div class="cell enz">
    <div class="ball">
      <span class="eye l"></span>
      <span class="eye r"></span>
      <span class="mouth"></span>
      {#if mode === 'bremse'}<span class="badge bremse">🛑</span>{/if}
      {#if mode === 'turbo'}<span class="badge turbo">⚡</span>{/if}
    </div>
    <small>{t('ddi.werk.helper')}</small>
  </div>

  <div class="cell out">
    <span class="ic ok">✓</span>
    <small>{t('ddi.werk.out')}</small>
  </div>
</div>

<style>
  .werk {
    --flow: 2.4s;
    --chomp: 1.1s;
    --thin: var(--spm-cyan);
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 720px;
    padding: 18px 16px;
    border: 1.5px solid var(--border);
    border-radius: var(--r-card);
    background: var(--surface);
  }
  .werk.bremse { --flow: 3.6s; }
  .werk.turbo { --flow: 1.05s; --chomp: 0.32s; }

  .cell { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: none; }
  .cell .ic { font-size: 30px; line-height: 1; }
  .cell .ic.ok { color: var(--green); font-weight: 900; }
  .cell small { font-size: 12px; color: var(--dim); text-align: center; max-width: 90px; line-height: 1.25; }
  .src { width: 72px; }
  .out { width: 64px; }

  /* conveyor: thinner blobs flowing toward the helper */
  .lane { position: relative; flex: 1; height: 92px; min-width: 90px; }
  .flow {
    position: absolute; top: 50%; margin-top: -7px;
    width: 14px; height: 14px; border-radius: 50%; background: var(--thin);
    left: 0; animation: flow var(--flow) linear infinite; animation-delay: calc(var(--i) * (var(--flow) / 4));
  }
  @keyframes flow {
    from { left: 0%; opacity: 0; }
    12% { opacity: 1; }
    86% { opacity: 1; }
    to { left: 88%; opacity: 0.12; }
  }

  /* Stau: thinner backed up against the jammed helper (Bremse only) */
  .pile {
    position: absolute; right: 0; bottom: 50%; transform: translateY(50%);
    display: flex; flex-direction: column-reverse; flex-wrap: wrap-reverse;
    align-content: flex-end; gap: 3px; height: 84px; width: 32px;
  }
  .pile span {
    width: 13px; height: 13px; border-radius: 50%; background: var(--thin);
    animation: pop 0.3s ease both; animation-delay: calc(var(--p) * 0.05s);
  }
  @keyframes pop { from { transform: scale(0); opacity: 0; } }

  /* the helper enzyme — a little chomping character */
  .enz { width: 88px; position: relative; }
  .ball {
    position: relative; width: 64px; height: 64px; border-radius: 50%;
    background: var(--surface2); border: 2px solid var(--spm-cyan);
    animation: chomp var(--chomp) ease-in-out infinite;
  }
  .werk.bremse .ball { animation-play-state: paused; border-color: var(--toxic); opacity: 0.9; }
  .werk.turbo .ball { border-color: var(--grape); }
  .eye { position: absolute; top: 20px; width: 8px; height: 8px; border-radius: 50%; background: var(--text); }
  .eye.l { left: 18px; }
  .eye.r { right: 18px; }
  .mouth {
    position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%);
    width: 22px; height: 11px; border-radius: 0 0 22px 22px; background: var(--text); opacity: 0.85;
  }
  .badge {
    position: absolute; top: -10px; right: -10px;
    width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
    font-size: 16px; background: var(--bg, var(--surface)); border: 1.5px solid var(--border);
  }
  .badge.bremse { border-color: var(--toxic); background: color-mix(in srgb, var(--toxic) 22%, var(--surface)); }
  .badge.turbo { border-color: var(--grape); background: color-mix(in srgb, var(--grape) 22%, var(--surface)); }

  @keyframes chomp { 50% { transform: scale(0.9); } }

  @media (max-width: 900px) { .werk { max-width: 100%; } }
  @media (prefers-reduced-motion: reduce) {
    .flow, .ball, .pile span { animation: none; }
    .flow { opacity: 0.6; }
    .flow:nth-child(1) { left: 18%; }
    .flow:nth-child(2) { left: 40%; }
    .flow:nth-child(3) { left: 62%; }
    .flow:nth-child(4) { left: 80%; }
  }
</style>
