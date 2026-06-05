<script lang="ts">
  interface Props {
    level: number
    capacity: number
    targetLow: number
    targetHigh: number
    inTarget: boolean
  }
  let { level, capacity, targetLow, targetHigh, inTarget }: Props = $props()

  // Vessel geometry (SVG user units)
  const TOP = 60
  const BOTTOM = 330
  const H = BOTTOM - TOP
  const LEFT = 40
  const W = 160

  const frac = (v: number) => Math.max(0, Math.min(1, v / capacity))

  let waterY = $derived(BOTTOM - frac(level) * H)
  let bandTopY = $derived(BOTTOM - frac(targetHigh) * H)
  let bandBotY = $derived(BOTTOM - frac(targetLow) * H)

  // Pre-built tiling wave path (repeats every WL so it loops seamlessly)
  const WL = 80
  const AMP = 7
  function buildWave(): string {
    let d = 'M 0 0'
    for (let x = 0; x < 240 * 2; x += WL) {
      d += ` q ${WL / 4} ${-AMP} ${WL / 2} 0 q ${WL / 4} ${AMP} ${WL / 2} 0`
    }
    return d + ' L 480 400 L 0 400 Z'
  }
  const waveD = buildWave()
</script>

<svg
  class="avatar"
  class:in-target={inTarget}
  viewBox="0 0 240 360"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4cc9f0" />
      <stop offset="100%" stop-color="#7c5cff" />
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.14)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.03)" />
    </linearGradient>
    <clipPath id="bodyClip">
      <rect x={LEFT} y={TOP} width={W} height={H} rx="56" />
    </clipPath>
  </defs>

  <!-- glass body fill -->
  <rect x={LEFT} y={TOP} width={W} height={H} rx="56" fill="url(#glass)" />

  <!-- clipped contents: target band + water -->
  <g clip-path="url(#bodyClip)">
    <!-- therapeutic target window -->
    <rect
      x={LEFT}
      y={bandTopY}
      width={W}
      height={Math.max(0, bandBotY - bandTopY)}
      fill="rgba(56,224,160,0.16)"
    />
    <line x1={LEFT} x2={LEFT + W} y1={bandTopY} y2={bandTopY}
      stroke="rgba(56,224,160,0.7)" stroke-width="2" stroke-dasharray="6 5" />
    <line x1={LEFT} x2={LEFT + W} y1={bandBotY} y2={bandBotY}
      stroke="rgba(56,224,160,0.7)" stroke-width="2" stroke-dasharray="6 5" />

    <!-- water with two animated wave layers -->
    <g transform={`translate(0 ${waterY})`}>
      <g class="wave wave-back">
        <path d={waveD} fill="url(#water)" opacity="0.5" />
      </g>
      <g class="wave wave-front">
        <path d={waveD} fill="url(#water)" />
      </g>
    </g>
  </g>

  <!-- glass rim -->
  <rect
    x={LEFT}
    y={TOP}
    width={W}
    height={H}
    rx="56"
    fill="none"
    stroke="rgba(255,255,255,0.35)"
    stroke-width="2.5"
  />
  <!-- highlight streak -->
  <rect x={LEFT + 16} y={TOP + 20} width="10" height={H - 60} rx="5"
    fill="rgba(255,255,255,0.18)" />

  <!-- friendly face (always above the water) -->
  <g class="face">
    <circle cx="98" cy="120" r="9" fill="#0b1020" />
    <circle cx="142" cy="120" r="9" fill="#0b1020" />
    <circle cx="101" cy="117" r="3" fill="#fff" />
    <circle cx="145" cy="117" r="3" fill="#fff" />
    <path d="M 100 142 q 20 16 40 0" fill="none" stroke="#0b1020"
      stroke-width="4" stroke-linecap="round" />
  </g>
</svg>

<style>
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
    filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.45));
    transition: filter 0.4s ease;
  }
  .avatar.in-target {
    filter: drop-shadow(0 0 22px rgba(56, 224, 160, 0.65));
  }
  .wave {
    animation: drift linear infinite;
  }
  .wave-front {
    animation-duration: 2.2s;
  }
  .wave-back {
    animation-duration: 3.4s;
    transform: translateY(3px);
  }
  @keyframes drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-80px);
    }
  }
  .face {
    transition: opacity 0.3s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .wave {
      animation: none;
    }
  }
</style>
