<script lang="ts">
  // DEV-ONLY copy proof-sheet (the "Copy-Korrekturbogen" tab of /preview, never in
  // prod). Renders every UI string from the locale dictionaries so you can read all
  // the screens at a glance — both age registers side by side, switchable per locale
  // — to catch typos and odd phrasing. Pure: reads DICTS directly, no backend, no WS,
  // no game store, and it never mutates the global i18n state.
  import { onMount } from 'svelte'
  import { DICTS, LOCALES, type Locale } from '../locale.svelte'

  // ── resolution mirrors t() in locale.svelte.ts exactly ──────────────────────
  // age-specific → age-specific(de) → plain → plain(de) → key
  function resolve(base: string, loc: Locale, age: 'young' | 'adult'): string {
    const d = DICTS[loc]
    const de = DICTS.de
    const aged = `${base}.${age}`
    return d[aged] ?? de[aged] ?? d[base] ?? de[base] ?? base
  }
  // does THIS locale carry its own copy for the base (vs. falling back to German)?
  function localeHas(base: string, loc: Locale): boolean {
    const d = DICTS[loc]
    return d[`${base}.young`] !== undefined || d[`${base}.adult`] !== undefined || d[base] !== undefined
  }

  // German is the complete dictionary authored in screen/beat order → using its key
  // order gives a faithful reading flow. Strip .young/.adult to get unique "bases".
  const AGE = /\.(young|adult)$/
  const bases: string[] = (() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const k of Object.keys(DICTS.de)) {
      const base = k.replace(AGE, '')
      if (!seen.has(base)) {
        seen.add(base)
        out.push(base)
      }
    }
    return out
  })()

  // Top-level key prefix → story bucket (for section headers + the filter chips).
  type Bucket = { id: string; name: string; icon: string; prefixes: string[] }
  const BUCKETS: Bucket[] = [
    { id: 'ui', name: 'Rahmen & geteilte UI', icon: '🧩', prefixes: ['app', 'start', 'stories', 'common', 'reset', 'band', 'bar', 'p', 'd', 'timejump'] },
    { id: 'grapefruit', name: 'Frühstücks-Falle (FDI · v2)', icon: '🥣', prefixes: ['fr'] },
    { id: 'grapefruit-v1', name: 'Frühstück — Legacy v1-Engine', icon: '🗂️', prefixes: ['briefing', 'dose', 'opt', 'q', 'reveal', 'detect', 'dec', 'var', 'ev', 'medcheck', 'fruits', 'fruit', 'out', 'rank'] },
    { id: 'ddi', name: 'Blut-Balance (DDI)', icon: '💊', prefixes: ['ddi'] },
    { id: 'organ', name: 'Nieren-Skala (Organ)', icon: '🫘', prefixes: ['organ'] },
    { id: 'gene', name: 'Drei Zwillinge (Gen)', icon: '🧬', prefixes: ['gene'] },
    { id: 'adherence', name: 'Wochen-Pillenplan (Adhärenz)', icon: '⏰', prefixes: ['adh'] },
    { id: 'johanniskraut', name: 'Pflanzliches Leck (Induktion)', icon: '🌿', prefixes: ['jk'] },
    { id: 'admin', name: 'Admin · Kalibrierung · Twin', icon: '⚙️', prefixes: ['admin', 'twin', 'cal'] },
  ]
  const OTHER: Bucket = { id: 'other', name: 'Sonstige', icon: '❓', prefixes: [] }
  const P2B: Record<string, string> = {}
  for (const bk of BUCKETS) for (const p of bk.prefixes) P2B[p] = bk.id
  const bucketId = (prefix: string) => P2B[prefix] ?? 'other'

  // ── controls (all local — zero side effects on the game's i18n store) ────────
  let locale = $state<Locale>('de')
  let query = $state('')
  let activeBucket = $state<string>('all')
  let onlyUntranslated = $state(false)

  type Row = { base: string; prefix: string; beat: string; young: string; adult: string; same: boolean; translated: boolean }
  let rows = $derived.by((): Row[] =>
    bases.map((base) => {
      const young = resolve(base, locale, 'young')
      const adult = resolve(base, locale, 'adult')
      return {
        base,
        prefix: base.split('.')[0],
        beat: base.split('.').slice(0, 2).join('.'),
        young,
        adult,
        same: young === adult,
        translated: localeHas(base, locale),
      }
    }),
  )

  let groups = $derived.by(() => {
    const q = query.trim().toLowerCase()
    const passes = (r: Row) =>
      (activeBucket === 'all' || bucketId(r.prefix) === activeBucket) &&
      (!onlyUntranslated || !r.translated) &&
      (!q || r.base.toLowerCase().includes(q) || r.young.toLowerCase().includes(q) || r.adult.toLowerCase().includes(q))

    const out: { bk: Bucket; rows: Row[]; beats: { beat: string; key: string; rows: Row[] }[] }[] = []
    for (const bk of [...BUCKETS, OTHER]) {
      const rws = rows.filter((r) => bucketId(r.prefix) === bk.id && passes(r))
      if (!rws.length) continue
      // a 2-seg "beat" can recur non-contiguously (a story may add keys in passes),
      // so key each group by its position, not by the beat string.
      const beats: { beat: string; key: string; rows: Row[] }[] = []
      let cur: { beat: string; key: string; rows: Row[] } | null = null
      for (const r of rws) {
        if (!cur || cur.beat !== r.beat) {
          cur = { beat: r.beat, key: `${bk.id}#${beats.length}`, rows: [] }
          beats.push(cur)
        }
        cur.rows.push(r)
      }
      out.push({ bk, rows: rws, beats })
    }
    return out
  })

  let visibleCount = $derived(groups.reduce((n, g) => n + g.rows.length, 0))

  // buckets that actually have keys, for the filter chips
  let bucketCounts = $derived.by(() => {
    const m: Record<string, number> = {}
    for (const r of rows) m[bucketId(r.prefix)] = (m[bucketId(r.prefix)] ?? 0) + 1
    return m
  })

  const coverage = (loc: Locale) => bases.filter((b) => localeHas(b, loc)).length
  const pct = (loc: Locale) => Math.round((coverage(loc) / bases.length) * 100)

  // split a string into text + {placeholder} segments so {name}/{n} stand out
  function segs(s: string): { t: string; ph: boolean }[] {
    const res: { t: string; ph: boolean }[] = []
    const re = /\{[^}]+\}/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(s))) {
      if (m.index > last) res.push({ t: s.slice(last, m.index), ph: false })
      res.push({ t: m[0], ph: true })
      last = m.index + m[0].length
    }
    if (last < s.length) res.push({ t: s.slice(last), ph: false })
    return res.length ? res : [{ t: s, ph: false }]
  }

  let searchEl: HTMLInputElement | undefined
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchEl) {
        e.preventDefault()
        searchEl?.focus()
      } else if (e.key === 'Escape' && document.activeElement === searchEl) {
        query = ''
        searchEl?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

<div class="sheet">
  <header class="top">
    <div class="brand">
      <span class="dot"></span>
      <div>
        <h1>Copy-Korrekturbogen</h1>
        <p>Alle Bildschirm-Texte · {bases.length} Schlüssel · nur DEV</p>
      </div>
    </div>
  </header>

  <div class="toolbar">
    <div class="ctl langs">
      {#each LOCALES as l}
        <button class="lang" class:on={locale === l.id} onclick={() => (locale = l.id)}>
          {l.name}
          <em class:full={pct(l.id) === 100}>{pct(l.id)}%</em>
        </button>
      {/each}
    </div>

    <div class="ctl">
      <input
        bind:this={searchEl}
        bind:value={query}
        class="search"
        type="search"
        placeholder="Suchen (Taste /) – Schlüssel oder Text…"
      />
      <label class="toggle">
        <input type="checkbox" bind:checked={onlyUntranslated} />
        nur ohne {locale.toUpperCase()}-Übersetzung
      </label>
    </div>

    <div class="ctl chips">
      <button class="chip" class:on={activeBucket === 'all'} onclick={() => (activeBucket = 'all')}>
        Alle <em>{bases.length}</em>
      </button>
      {#each BUCKETS as bk}
        {#if bucketCounts[bk.id]}
          <button class="chip" class:on={activeBucket === bk.id} onclick={() => (activeBucket = bk.id)}>
            {bk.icon} {bk.name} <em>{bucketCounts[bk.id]}</em>
          </button>
        {/if}
      {/each}
      {#if bucketCounts['other']}
        <button class="chip" class:on={activeBucket === 'other'} onclick={() => (activeBucket = 'other')}>
          {OTHER.icon} {OTHER.name} <em>{bucketCounts['other']}</em>
        </button>
      {/if}
    </div>
  </div>

  <main class="body">
    <div class="colhead">
      <span class="khead">Schlüssel</span>
      <span class="vhead">🧒 Kinder &amp; Jugendliche</span>
      <span class="vhead">🧑 Erwachsene</span>
    </div>

    {#if !visibleCount}
      <p class="empty">Keine Treffer.</p>
    {/if}

    {#each groups as g (g.bk.id)}
      <section class="bucket">
        <h2>{g.bk.icon} {g.bk.name} <span class="n">{g.rows.length}</span></h2>
        {#each g.beats as bt (bt.key)}
          <div class="beat">
            <div class="beatlabel">{bt.beat}</div>
            {#each bt.rows as r (r.base)}
              <div class="row" class:fallback={!r.translated}>
                <code class="key">
                  {r.base}{#if !r.translated}<span class="fb" title="kein {locale.toUpperCase()} – zeigt DE">DE</span>{/if}
                </code>
                {#if r.same}
                  <div class="val both" dir="auto">
                    {#each segs(r.young) as s}{#if s.ph}<span class="ph">{s.t}</span>{:else}{s.t}{/if}{/each}
                  </div>
                {:else}
                  <div class="val" dir="auto">
                    {#each segs(r.young) as s}{#if s.ph}<span class="ph">{s.t}</span>{:else}{s.t}{/if}{/each}
                  </div>
                  <div class="val" dir="auto">
                    {#each segs(r.adult) as s}{#if s.ph}<span class="ph">{s.t}</span>{:else}{s.t}{/if}{/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </section>
    {/each}
    <div class="foot">DEV-Vorschau · {visibleCount} sichtbar von {bases.length} · Texte sind markierbar (zum Kopieren)</div>
  </main>
</div>

<style>
  .sheet {
    min-height: 100%;
    background: #05060c;
    color: var(--text, #e8edff);
    -webkit-user-select: text;
    user-select: text;
    font-family: 'Inter', 'Noto Sans Arabic', system-ui, sans-serif;
  }

  .top {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 24px;
    background: rgba(8, 12, 24, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.12));
  }
  .brand { display: flex; align-items: center; gap: 14px; }
  .dot {
    width: 14px; height: 14px; border-radius: 50%; flex: none;
    background: linear-gradient(135deg, var(--spm-cyan, #00beca), var(--water-bot, #7c5cff));
    box-shadow: 0 0 16px var(--spm-cyan, #00beca);
  }
  .brand h1 { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }
  .brand p { font-size: 12px; color: var(--dim, #9aa6c9); margin-top: 2px; }

  .toolbar {
    position: sticky;
    top: 55px;
    z-index: 4;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 18px;
    align-items: center;
    padding: 12px 24px;
    background: rgba(6, 9, 18, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  }
  .ctl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .chips { flex-basis: 100%; }

  .lang {
    display: inline-flex; align-items: baseline; gap: 6px;
    background: var(--surface, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 10px; padding: 8px 12px; font-size: 14px; font-weight: 700;
  }
  .lang em { font-style: normal; font-size: 11px; color: var(--dim, #9aa6c9); }
  .lang em.full { color: var(--green, #38e0a0); }
  .lang.on { border-color: var(--spm-cyan, #00beca); background: rgba(0, 190, 202, 0.16); color: var(--spm-cyan-bright, #28e6e0); }

  .search {
    width: 360px; max-width: 60vw;
    background: var(--surface, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 10px; padding: 9px 14px; color: var(--text, #e8edff); font: inherit; font-size: 14px;
  }
  .search:focus { outline: none; border-color: var(--spm-cyan, #00beca); }
  .toggle { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--dim, #9aa6c9); }

  .chip {
    background: var(--surface, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 999px; padding: 6px 13px; font-size: 13px; font-weight: 600; color: var(--dim, #9aa6c9);
  }
  .chip em { font-style: normal; opacity: 0.6; margin-inline-start: 4px; }
  .chip.on { border-color: var(--spm-cyan, #00beca); background: rgba(0, 190, 202, 0.16); color: var(--spm-cyan-bright, #28e6e0); }

  .body { max-width: 1180px; margin: 0 auto; padding: 8px 24px 80px; }

  .colhead {
    display: grid; grid-template-columns: 280px 1fr 1fr; gap: 0 18px;
    position: sticky; top: 106px; z-index: 3;
    padding: 10px 0; margin-bottom: 4px;
    background: #05060c;
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    font-size: 12px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--dim, #9aa6c9);
  }
  .khead { padding-inline-start: 4px; }

  .bucket { margin-top: 26px; }
  .bucket > h2 {
    font-size: 20px; font-weight: 800; letter-spacing: -0.3px;
    padding-bottom: 8px; border-bottom: 2px solid var(--spm-cyan, #00beca);
  }
  .bucket > h2 .n { font-size: 13px; font-weight: 600; color: var(--dim, #9aa6c9); margin-inline-start: 6px; }

  .beat { margin-top: 14px; }
  .beatlabel {
    font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--spm-cyan-bright, #28e6e0); opacity: 0.75; margin: 10px 0 4px;
    font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  }

  .row {
    display: grid; grid-template-columns: 280px 1fr 1fr; gap: 0 18px; align-items: start;
    padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .row.fallback { opacity: 0.62; }
  .key {
    font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
    font-size: 12px; color: var(--dim, #9aa6c9); line-height: 1.5; word-break: break-all;
    padding-inline-start: 4px;
  }
  .key .fb {
    display: inline-block; margin-inline-start: 6px; padding: 0 5px; border-radius: 5px;
    font-size: 10px; font-weight: 800; color: #04222a; background: var(--grape, #ffb703);
  }
  .val {
    font-size: 16px; line-height: 1.5; color: var(--text, #e8edff);
    white-space: pre-wrap; overflow-wrap: anywhere;
  }
  .val.both { grid-column: 2 / 4; color: #c5cde6; }
  .ph {
    font-family: ui-monospace, monospace; font-size: 0.85em;
    color: var(--grape, #ffb703); background: rgba(255, 183, 3, 0.12);
    padding: 0 3px; border-radius: 4px;
  }

  .empty { color: var(--dim, #9aa6c9); padding: 40px 4px; font-size: 16px; }
  .foot { margin-top: 40px; color: var(--dim, #9aa6c9); font-size: 12px; text-align: center; opacity: 0.7; }
</style>
