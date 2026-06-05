<script lang="ts">
  import { t } from './locale'

  let { onhold }: { onhold: (on: boolean) => void } = $props()
  let pressed = $state(false)

  function down(e: PointerEvent) {
    e.preventDefault()
    if (pressed) return
    pressed = true
    onhold(true)
  }
  function up() {
    if (!pressed) return
    pressed = false
    onhold(false)
  }
</script>

<button
  class="hold"
  class:pressed
  onpointerdown={down}
  onpointerup={up}
  onpointerleave={up}
  onpointercancel={up}
>
  <span class="dot"></span>
  <span class="label">{t('play.hold')}<small>{t('play.holdSub')}</small></span>
</button>

<style>
  .hold {
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(135deg, var(--water-top), var(--water-bot));
    border-radius: 22px;
    padding: 22px 56px;
    color: #fff;
    font-size: 24px;
    font-weight: 800;
    box-shadow: 0 14px 40px rgba(76, 201, 240, 0.35);
    transition: transform 0.07s ease, box-shadow 0.15s ease;
    touch-action: none;
  }
  .hold.pressed {
    transform: scale(0.96);
    box-shadow: 0 0 0 6px rgba(76, 201, 240, 0.25), 0 8px 24px rgba(76, 201, 240, 0.4);
  }
  .dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.18);
    transition: box-shadow 0.15s ease;
  }
  .hold.pressed .dot {
    box-shadow: 0 0 0 12px rgba(255, 255, 255, 0.28);
  }
  .label {
    display: flex;
    flex-direction: column;
    line-height: 1.05;
  }
  small {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.85;
    letter-spacing: 0.3px;
  }
</style>
