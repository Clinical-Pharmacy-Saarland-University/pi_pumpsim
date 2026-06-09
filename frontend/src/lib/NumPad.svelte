<script lang="ts">
  // On-screen numeric keypad (the kiosk has no OS virtual keyboard).
  let {
    label = '',
    unit = '',
    onsubmit,
    oncancel,
  }: { label?: string; unit?: string; onsubmit: (v: number) => void; oncancel: () => void } =
    $props()

  let buf = $state('') // entered fresh each time

  function tap(d: string) {
    if (d === '.' && buf.includes('.')) return
    buf = buf === '0' && d !== '.' ? d : buf + d
  }
  const back = () => (buf = buf.slice(0, -1))
  const clear = () => (buf = '')
  const ok = () => onsubmit(parseFloat(buf) || 0)
</script>

<div class="pad">
  <div class="label">{label}</div>
  <div class="disp">{buf || '0'}<small>{unit}</small></div>
  <div class="keys">
    {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as k}
      <button onclick={() => tap(k)}>{k}</button>
    {/each}
    <button onclick={() => tap('.')}>.</button>
    <button onclick={() => tap('0')}>0</button>
    <button class="bk" onclick={back}>⌫</button>
  </div>
  <div class="row">
    <button class="cancel" onclick={oncancel}>Abbrechen</button>
    <button class="clear" onclick={clear}>C</button>
    <button class="ok" onclick={ok}>OK</button>
  </div>
</div>

<style>
  .pad {
    position: absolute;
    inset: 0;
    z-index: 80;
    background: rgba(6, 9, 18, 0.99);
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px clamp(16px, 12vw, 200px);
    justify-content: center;
  }
  .label {
    font-size: 16px;
    color: var(--dim);
    text-align: center;
  }
  .disp {
    font-size: 56px;
    font-weight: 900;
    text-align: center;
    color: var(--spm-cyan, #00beca);
    min-height: 64px;
  }
  .disp small {
    font-size: 22px;
    color: var(--dim);
    margin-inline-start: 8px;
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1.4fr;
    gap: 10px;
  }
  button {
    border: none;
    border-radius: 14px;
    padding: 18px 0;
    font-size: 26px;
    font-weight: 800;
    background: #1b2440;
    color: #e8edff;
    touch-action: manipulation;
  }
  button:active {
    transform: scale(0.97);
  }
  .bk {
    background: #2a3556;
  }
  .cancel {
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 18px;
  }
  .clear {
    background: #2a3556;
    font-size: 20px;
  }
  .ok {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
    font-size: 20px;
  }
</style>
