I now have the exact engine facts confirmed. The key buildability finding: `onLevel()` (game.svelte.ts:104) calls `finishOutcome()` the instant `s.zone === 'critical_low'` while `game.phase` is in `PLAY_PHASES` (line 97-100), and the only target call is fire-and-forget `api.setTarget(level, rate?)` (api.ts:43, no per-tick loop). This grounds every fix. Now I'll write the improved spec, applying all valid fixes while preserving the full structure.

# Story spec — „Das Teeküchen-Regal: Stopp das Leck" (FDI · Johanniskraut × Ciclosporin)

> Per-story flow + **torso movement** + kid/adult copy + star logic + loss rules.
> Built on the **§19 story template** (see story 1, `fruehstuecks-falle.md`). Engine model =
> §18/§19 in `game-design.md`. Status: **DESIGN — ready to implement.**
> This story is the **deliberate inverse of story 1**: where grapefruit *inhibits* and pushes
> the level **up**, Johanniskraut *induces* and pulls the level **down**. The unique mechanic is a
> **real-time drag-to-block defense** („Stop the Leak"): the player seals leaks in a shelf-sign
> before the protective drug level drains out. **No overdose path** — an inducer only lowers.

## Meta
- **Patient:** Frau Berger, 54 — nach **Nierentransplantation**; nimmt täglich **Ciclosporin**,
  damit der Körper das neue Organ nicht abstößt. Gegen trübe Stimmung trinkt sie seit Neuestem
  jeden Morgen **selbst gekauften Johanniskraut-Tee + Kapseln** („ist ja nur eine Pflanze").
- **Interaction:** **Hyperforin** im Johanniskraut (Hypericum perforatum) ist ein potenter
  **PXR-Agonist** und **INDUZIERT CYP3A4** sowie das Efflux-Transportprotein **P-Glykoprotein
  (P-gp)**. Ciclosporin wird dadurch **schneller abgebaut und ausgeschleust** → der **Talspiegel
  sinkt** → das Transplantat steht **ungeschützt** da → **akute Abstoßung**. Aufbau über
  **~1–2 Wochen**, langsame Reversibilität. Real fix: **Johanniskraut absetzen** + ärztlich
  gegensteuern (Spiegel messen, Transplant-Ambulanz). „Mehr Tee" oder „heimlich höher dosieren"
  sind **echte Fehltritte** — das ist die Lektion: *natürlich ≠ harmlos, und mehr Naturmittel
  macht es schlimmer.*
- **Direction of the lesson:** **Induktor → senkt → Unterdosis.** Es gibt **keine Überdosis** in
  dieser Story (sauber bleibt: *„ein Induktor wirkt nur in eine Richtung — nach unten"*).
- **Engine numbers** (normalized 0–100, all tunable): band `[55,70]`, baseline `40`,
  critical-high `80` (hier **nie erreicht**), critical-low `35`, dose `standard = 62`,
  Johanniskraut induction expressed as a **falling factor** `< 1`. **The interactive leak round
  is the one place where the live level would otherwise cross `35` mid-interaction — see
  „Buildability: avoiding the auto-trip" below for how this is handled (soft floor + explicit
  win/lose), because the engine's `onLevel()` auto-ends the round the instant `zone ===
  'critical_low'`.** Reuses the existing `factors`/`moveTo`/`api.setTarget` path; the leak round
  drives the factor down, the win removes it.

## End states (the game only ends here — three distinct endings)
| Outcome | Reached by | Torso | Message |
|---|---|---|---|
| **WIN** | „Leck-Runde": **alle drei echten** Risse rechtzeitig versiegelt (für den Basis-Sieg reicht **🌿 „absetzen"** — siehe „Fun/Clarity" unten) | green, steigt zurück `~62` | „Transplantat geschützt! 🎉 Spiegel wieder im grünen Fenster." |
| **LOSE — Unterdosiert (Abstoßung)** | Pegel erreicht den **Soft-Floor (`38`)** und ein Riss bleibt offen → committed **timeout** schiebt auf `→ 35` | drains `→ 35` (unter Band) | „Der Ciclosporin-Spiegel ist zu tief gefallen — der Körper greift das neue Organ an (Abstoßung)." |
| **(kein Überdosis-Ende)** | — | — | Ein Induktor senkt nur — es gibt hier kein „zu viel". |

> Es gibt nur **eine** Verlust-Art (Unterdosis), aber **zwei** Auslöser: Zeit (Riss zu lange offen,
> Pegel sackt bis zum Soft-Floor) oder ein gezogener **Köder** (beschleunigt den Abfall zum
> Soft-Floor hin). Beide enden in derselben Abstoßungs-Lose — aber **erst nach** dem committed
> timeout, nie als versehentlicher Sofort-Abbruch durch die Engine.

## Buildability: avoiding the engine auto-trip (decided — option **(a)**, soft floor)
> **Problem (confirmed in code):** `onLevel()` in `frontend/src/lib/game.svelte.ts` (≈ L102–108)
> calls `finishOutcome()` **immediately** when `s.zone === 'critical_high' || s.zone ===
> 'critical_low'` **and** `PLAY_PHASES.includes(game.phase)`. The leak-round phase will be a
> play phase, so a naïve „drift the live level down to 35 while the player seals leaks" would
> trip `finishOutcome()` **mid-interaction** the instant the level touched `35`, ending the round
> before the player could react. We must prevent that.
>
> **Decision — option (a), a soft floor strictly above `35`:** during the leak round the level
> target is **clamped to a soft floor `LEAK_FLOOR = 38`** (tunable, `> 35` so `zone` stays `under`,
> never `critical_low`). The interactive drift can sink the live level **down to ~`38` but never
> to `35`**, so the engine **never auto-trips** during the round. The level only crosses `35`
> on a **committed timeout**:
> - When the level **settles at/near the soft floor while ≥ 1 real leak is still open**, the
>   component starts a short **grace timer** (`LEAK_TIMEOUT_SECS`, default `2.5 s`, tunable) and
>   shows the „kritisch!" HUD pulse.
> - If the player seals the remaining real leak(s) before the timer fires → recover (target rises).
> - If the timer fires with a real leak still open → **committed lose:** the component calls
>   `api.setTarget(33)` (just below `35`) so the engine's `onLevel()` **then** legitimately sees
>   `zone === 'critical_low'` and runs `finishOutcome()` for us — i.e. we let the existing
>   auto-trip fire the abstoßungs-LOSE **on our terms**, not by accident.
>
> **WIN is evaluated explicitly by the component**, not by the engine: when the last real leak is
> sealed, `JkLeak.svelte` calls `api.setTarget(62)` and signals the store to advance to the
> outcome (`won = true`), exactly as story 1's fruit finale signals its result. No new engine
> phase flag is required for option (a); we only add the leak-round phase name to `PLAY_PHASES`
> (so an *accidental* `35` is still caught) and rely on the soft floor to keep us off it until the
> deliberate timeout. *(Option (b) — a `suppressAutoTrip` phase flag in the engine — was considered
> and rejected as more invasive; option (a) needs no change to `onLevel()`'s condition.)*

## Engine primitive: event-driven `setTarget`, not a per-tick loop (decided)
> **Confirmed in code:** the frontend has **no continuous „recompute factor each tick" loop**;
> the only outbound call is **fire-and-forget `api.setTarget(level, rate?)`** (`frontend/src/lib/api.ts`),
> with the slow „torso twin" in the backend chasing whatever target it last received. The leak
> round therefore works **event-driven**, not per-tick:
> - `JkLeak.svelte` keeps a running **`openLeakSum`** = sum of `dripRate` of all currently-open
>   **real** leaks.
> - On **every seal event** and **every köder event**, the component **recomputes the target
>   level** from `openLeakSum` and calls **`api.setTarget(targetLevel, rate)`** once. Between
>   events it sends nothing — the slow pump keeps drifting toward the last target on its own.
> - Mapping: `factorTarget = 1 − normalize(openLeakSum)` such that **all 3 real leaks open ⇒
>   target ≈ `LEAK_FLOOR` (38)** and **all real leaks sealed ⇒ target = `62`**; intermediate
>   states interpolate. `targetLevel = clamp(standardDose(62) × factorTarget, LEAK_FLOOR, 62)`.
> - This is why the descent feels **gentle and relentless**: each open leak just lowers the target
>   the slow pump is chasing; sealing one raises the target again. No transient overshoot is
>   expected from a plain `setTarget`.

## Loss / retry rule (decided)
- **Jede Aktion wird erklärt** — richtiger Riss versiegelt: *„genau, weil…"*; Köder gezogen:
  *„nein, das macht's schlimmer, weil…"* (Mikro-Feedback **während** der Runde, kurz, nicht blockierend).
- **Köder-Karte gezogen → Mikro-Feedback + kurzer Schub nach unten.** Implementiert als **Zwei-Schritt-
  `setTarget`** (kein Single-target+rate kann einen einmaligen Burst, der danach von selbst zurückgeht):
  1. `api.setTarget(LEAK_FLOOR, fastRate)` für den Schreck (Pegel beschleunigt Richtung Soft-Floor),
  2. nach `koederBurstSecs` (~2 s, per `setTimeout`) `api.setTarget(currentOpenLeakTarget, normalRate)` —
     der Pegel kehrt zum aktuellen Offene-Lecks-Ziel zurück.
  **Kein sofortiges Game-Over** — durch den Soft-Floor bleibt der Pegel `> 35`; du kannst dich noch
  retten, solange du vor Ablauf des Grace-Timers versiegelst.
- **Echter Riss versiegelt → sein Tropfen stoppt** (`openLeakSum` sinkt, neuer höherer `setTarget`).
- **Alle echten Risse rechtzeitig versiegelt → WIN** (Faktor entfällt, `setTarget(62)`, Pegel steigt zurück ins Band).
- **Pegel am Soft-Floor + Riss offen → Grace-Timer → committed `setTarget(33)` → Engine-Auto-Trip →
  LOSE (Unterdosiert / Abstoßung).** **Retry** auf jeder Lose angeboten (die Leck-Runde startet neu,
  Risse neu gemischt).
- **Detektiv-Beat:** harmlos-falsch → erklären + **retry** (kein Level-Verlust, wie in Story 1).

## Star logic (decided) — summed, shown N/3 (0 on any loss)
- ⭐ **Gerettet** — die Leck-Runde gewonnen (Pegel zurück im grünen Band).
- ⭐ **Schlau** — Detektiv korrekt **beim ersten Versuch** (keine falschen Taps).
- ⭐ **Profi** — Leck-Runde **ohne einen einzigen Köder zu ziehen** **und** **alle drei** echten Risse
  versiegelt **und** der Pegel fiel nie unter `45` (sauber & souverän verteidigt). *(Tunable Schwelle,
  siehe Tunables.)*

## Fun / clarity: one dominant action carries the WIN (decided)
> **Decision:** sealing **🌿 „Johanniskraut absetzen" alone visibly halts the drain** — the moment
> it's sealed, `openLeakSum` drops by its (dominant ~60 %) share, the new `setTarget` is well above
> the soft floor, and the descent **stops and begins to reverse** (instant felt relief). This keeps
> the **one-concept rule clean**: the lesson is *„remove the inducer."* The other two real leaks
> (🩸 Spiegel messen, 📞 Ambulanz anrufen) are **not required for the basic WIN** — they are the
> *good clinical follow-up* and are only needed for the **Profi ⭐ (3rd star)**. So:
> - **Basic WIN** = seal 🌿 „absetzen" before the committed timeout (drain halts, level recovers to band).
> - **3rd star (Profi)** = additionally seal 🩸 + 📞, draw zero köders, level never below `45`.
>
> Rationale: requiring all three to even survive muddied the dominant „absetzen" lesson; making
> „absetzen" the single load-bearing action and folding the other two into the star reward keeps the
> teaching crisp while still rewarding thorough play.

## Flow & torso movement
| # | Beat | Player action | Torso (from→to) | Branch |
|---|---|---|---|---|
| 0 | Briefing | — | `40` (below band) | → 1 |
| 1 | Standarddosis | tap „Standarddosis geben" | `40 → 62` (into green) | → 2 |
| 2 | Der neue Tee | „Weiter" (interaction fires) | `62 → 58` (beginnt zu sinken, kurz vor/an Bandkante) | → 3 |
| 3 | Detektiv | pick the culprit | — | right → 4 · wrong → explain+retry |
| 4 | Mechanismus | „Weiter" | — | → 5 |
| 5 | **Leck-Runde** (unique mechanic) | drag patches onto leaks (real-time) | sinkt Richtung Soft-Floor `38`; 🌿 versiegelt = Abfall stoppt | win → 6 · Soft-Floor+offen+Timeout → committed `33` → LOSE |
| 6 | Outcome | — | win: `→ 62` (zurück ins Band) | end |

**Torso during the Leck-Runde (beat 5):** the level **drifts steadily downward toward the soft
floor `38`** (never to `35` during interaction). The **sum of open real leaks (`openLeakSum`) sets
the target** the slow pump chases (event-driven `setTarget`, recomputed on each seal/köder). Sealing
**🌿 „absetzen"** removes most of `openLeakSum` → the descent **halts and reverses** (felt relief);
sealing the other real leaks raises the target further. When **all real leaks are sealed**, the
component sends `setTarget(62)` and the level **rises back into the green band** for the WIN. If the
level **settles at the soft floor with a real leak still open**, a short **grace timer** runs; on
timeout the component commits `setTarget(33)` → the engine's `onLevel()` legitimately sees
`critical_low` and fires the abstoßungs-LOSE. A **Köder** triggers the **two-step burst** (fast dip
to the floor, then return to the open-leak target after ~2 s). *The slow pump is the suspense here —
the descent is gentle but relentless; every second a real leak is open, the protection ebbs.*

**Why there is no „Strategie"-branch screen (unlike story 1):** in story 1 the strategy decision is
a static multiple-choice; here the **strategy IS the real-time mechanic** — sealing „Johanniskraut
absetzen / Spiegel messen / Ambulanz anrufen" *is* choosing the correct interventions, and ignoring
them or grabbing „mehr Tee" *is* the wrong choice. The decision and the mini-game are fused into one
defense round (the §19 „STRATEGY decision that drives the torso" + „UNIQUE FINALE MINI-GAME" collapse
into a single signature beat for this story).

---

## Copy — kid (`young`) / adult (`adult`)
> Every option, feedback line and instruction has both registers. Kids = warm/concrete;
> adults = precise + real terms. The Köder/real-leak set is **identical** in both registers
> (only wording differs); no option is hidden by age in this story.

### 0 · Briefing
- **Patient** — young: „Frau Berger, 54. Sie hat eine neue Niere bekommen! Damit ihr Körper die
  neue Niere nicht wegschiebt, nimmt sie jeden Tag ein Schutz-Medikament." · adult: „Frau Berger,
  54, nach Nierentransplantation. Zum Schutz des Transplantats vor Abstoßung nimmt sie täglich
  **Ciclosporin** (Immunsuppressivum)."
- **Ziel** — young: „Halte den Schutz im grünen Bereich! Wenn er zu tief fällt, ist die neue Niere
  in Gefahr." · adult: „Halte den **Ciclosporin-Talspiegel** im grünen Fenster — fällt er zu tief,
  droht **Abstoßung**."

### 1 · Standarddosis (tutorial fill)
- **Prompt** — young: „Gib Frau Berger ihre normale Dosis. Schau, wie der Schutz langsam in den
  grünen Bereich steigt!" · adult: „Frau Berger wird auf die Standarddosis Ciclosporin eingestellt."
- **Button:** „Standarddosis geben"
- **Reveal (🟢):** young: „Genau richtig — im grünen Bereich! Die neue Niere ist geschützt." ·
  adult: „Im therapeutischen Fenster — Transplantat sicher immunsupprimiert."

### 2 · Der neue Tee (the trap)
- **Story** — young: „Wochenlang läuft alles super! 🎉 Doch Frau Berger ist oft traurig. Sie kauft
  sich **Johanniskraut** — Tee am Morgen **und** Kapseln. „Ist ja nur eine Pflanze", denkt sie.
  Und **nach einer Weile** beginnt der Schutz zu sinken …" · adult: „Über Wochen stabil eingestellt.
  Wegen gedrückter Stimmung nimmt Frau Berger nun **eigenmächtig Johanniskraut** (Tee + Kapseln).
  Über **Tage bis Wochen** beginnt der **Talspiegel langsam zu sinken**."
  > *(Accuracy fix: induction takes ~1–2 weeks to build — the young line no longer implies same-day
  > onset („nach einer Weile" instead of „plötzlich"); the adult line keeps „über Tage bis Wochen".)*
- **Reveal (⚠️):** young: „Oh — der Schutz fällt! Irgendetwas zieht ihn nach unten." · adult: „Der
  Spiegel sinkt Richtung Bandunterkante — etwas senkt die Wirkung."

### 3 · Detektiv
- **Prompt** — young: „Detektiv-Frage: Was lässt den Schutz **sinken**?" · adult: „Was senkt den
  Ciclosporin-Spiegel?"
- **Options:** 🌿 Johanniskraut ✓ · 🍵 Kamillentee · 🥗 gesundes Essen · 🚶 Spaziergang · 😴 wenig
  Schlaf · 💧 viel Wasser trinken
- **Feedback**
  - Johanniskraut ✓ — young: „Richtig erkannt — das Johanniskraut war's!" · adult: „Korrekt — das
    Johanniskraut (Hypericum perforatum)."
  - Kamillentee — young: „Nein — Kamille ist hier harmlos." · adult: „Nein — Kamille beeinflusst den
    Ciclosporin-Abbau nicht relevant."
  - Gesundes Essen — young: „Nein — gesund essen schadet hier nicht." · adult: „Nein — eine
    ausgewogene Ernährung senkt den Spiegel nicht."
  - Spaziergang — young: „Nein — Bewegung tut gut!" · adult: „Nein — körperliche Aktivität ist nicht
    die Ursache."
  - Wenig Schlaf — young: „Nein — müde sein verändert den Schutz nicht." · adult: „Nein — Schlafmangel
    hat keinen Einfluss auf den Spiegel."
  - Viel Wasser — young: „Nein — Wasser trinken ist okay." · adult: „Nein — Flüssigkeitszufuhr senkt
    den Ciclosporin-Spiegel nicht."

### 4 · Mechanismus (lesson)
- young: „Johanniskraut **kurbelt das Aufräum-Enzym an** (es heißt CYP3A4) und schiebt das
  Medikament schneller wieder raus. Dann ist **zu wenig** Schutz da — und „mehr Pflanze" macht es nur
  **schlimmer**. Natürlich heißt **nicht** harmlos!" · adult: „**Hyperforin** im Johanniskraut
  aktiviert **PXR** und **induziert CYP3A4 + P-Glykoprotein** → Ciclosporin wird **schneller
  metabolisiert und effluxiert** → **Talspiegel ↓**. Mehr Johanniskraut = stärkere Induktion = noch
  tiefer. Die Lösung ist **Absetzen**, nicht Höher-Dosieren."

### 5 · Leck-Runde (the unique mechanic — strategy + finale fused; torso reacts live)
- **Intro prompt** — young: „Schnell! Das Pflanzen-Mittel macht **Löcher** in den Schutz — durch
  jedes Loch tropft er weg. **Flick die echten Löcher**, bevor der Schutz ausläuft! Finger weg von
  den falschen Karten — die machen das Loch nur größer." · adult: „**Stopp das Leck:** Die Induktion
  reißt **Lecks** in den Schutz — pro offenem Leck **sinkt der Spiegel**. **Versiegle die richtigen
  Maßnahmen** rechtzeitig. Falsche Karten (Köder) **beschleunigen** den Abfall."
- **Ongoing HUD line** — young: „Der Schutz läuft aus — beeil dich!" · adult: „Talspiegel fällt —
  jedes offene Leck zählt."
- **Soft-floor / grace HUD pulse** — young: „Gleich ist es zu spät — flick das Loch JETZT!" ·
  adult: „Kritisch — Spiegel am Limit, letzte Sekunden zum Versiegeln."
- **The leaks / cards** (drag a **patch 🩹** onto a leak to seal it). **Per run: alle 3 echten Risse
  + genau 2 (von 3) zufällig gewählte Köder** — siehe „Scoping" in Tunables (hält die Runde < ~25 s):

  **✅ Echte Risse (versiegeln — stoppen je ein Tropfen):**
  - 🌿 **„Johanniskraut absetzen"** *(dominant — Basis-WIN)* — young: „Geschafft — ohne die Pflanze
    hört das größte Loch auf zu tropfen, der Schutz steigt wieder!" · adult: „Richtig — Johanniskraut
    absetzen beendet die Induktion (Schlüsselmaßnahme; Erholung von CYP3A4/P-gp über Tage). Der Abfall
    stoppt sofort."
  - 🩸 **„Spiegel messen lassen"** *(für Profi-Stern)* — young: „Gut — jetzt sieht man, wie viel
    Schutz wirklich da ist." · adult: „Richtig — **Talspiegel-Monitoring**, um die Unterdosierung
    früh zu erkennen."
  - 📞 **„Transplant-Ambulanz anrufen"** *(für Profi-Stern)* — young: „Stark — die Fachleute können
    sofort gegensteuern." · adult: „Richtig — **Rücksprache mit dem Transplantationszentrum**;
    ärztliche Dosisanpassung nur dort."

  **❌ Köder (NICHT ziehen — beschleunigen den Abfall):**
  - 🍵 **„Mehr Tee trinken"** — young: „Nein! Noch mehr Pflanze macht das Loch **größer**." · adult:
    „Falsch — stärkere Induktion → der Spiegel fällt **schneller**."
  - 💊 **„Heimlich Dosis verdoppeln"** — young: „Nein — einfach mehr nehmen ist gefährlich und
    unkontrolliert." · adult: „Falsch — eigenmächtige Dosisverdopplung bei schwankender Induktion ist
    unkontrolliert und gefährlich; **nie ohne Spiegel & Arzt**."
  - 🌼 **„Noch ein Naturmittel dazu"** — young: „Nein — noch ein Kraut hilft nicht, es verwirrt nur." ·
    adult: „Falsch — ein weiteres pflanzliches Präparat löst die Interaktion nicht (Risiko weiterer
    Wechselwirkungen)."

- **Win reveal (🟢):** young: „Alle echten Löcher geflickt — der Schutz steigt wieder in den grünen
  Bereich! Die neue Niere ist sicher. 🎉" · adult: „Alle Maßnahmen rechtzeitig — Induktion gestoppt,
  Talspiegel steigt zurück ins Fenster. Transplantat geschützt."
- **Lose reveal (🔻):** young: „Zu spät — der Schutz ist ausgelaufen. Der Körper greift die neue
  Niere an." · adult: „Spiegel unter die kritische Linie gefallen — **subtherapeutisch → akute
  Abstoßung**."

### 6 · Outcome / Debrief
- **WIN** — young: „Gerettet! 🎉 Frau Berger ist wieder im grünen Bereich — die neue Niere ist
  geschützt." · adult: „Transplantat geschützt — Talspiegel wieder im therapeutischen Fenster."
- **LOSE — Unterdosiert (Abstoßung)** — young: „Der Schutz ist zu tief gefallen — die neue Niere ist
  in Gefahr. Probier's nochmal!" · adult: „Subtherapeutischer Ciclosporin-Spiegel → **akute
  Transplantatabstoßung**. Deshalb: **Johanniskraut absetzen, Spiegel messen, ärztlich
  gegensteuern.**"
- **Debrief facts (both shown):**
  1. young: „Johanniskraut **kurbelt das Aufräum-Enzym an** — dann ist **zu wenig** Schutz-Medikament
     da." · adult: „**Hyperforin** induziert über **PXR** **CYP3A4 + P-Glykoprotein** →
     Ciclosporin-Spiegel ↓ → Abstoßungsgefahr."
  2. young: „**Natürlich heißt nicht harmlos** — und **mehr** Naturmittel macht es **schlimmer**." ·
     adult: „**„Pflanzlich" ≠ unbedenklich.** Der bekannteste Fallbericht akuter Abstoßung unter
     Johanniskraut betrifft **Herztransplantationen** (**Ruschitzka et al., Lancet 2000** — zwei
     Herztransplantierte mit subtherapeutischem Ciclosporin und akuter Abstoßung nach
     Johanniskraut-Einnahme); **akute Abstoßungen bei Nierentransplantierten unter Johanniskraut
     sind separat dokumentiert** (spätere Fallberichte/Reviews). Mehr Naturmittel = stärkere
     Induktion."
     > *(Accuracy fix: the Lancet 2000 Ruschitzka case is **heart** transplants, but our patient is
     > a **kidney** transplant. The debrief now states the famous citation is heart-transplant and
     > that **renal** cases are documented separately — so a pharmacist in the audience can't catch
     > a drug/organ mismatch.)*

---

## Unique mechanic — „Das Teeküchen-Regal: Stopp das Leck" (full implementable detail)
> Archetype: **real-time drag-to-block defense**. New component: **`JkLeak.svelte`** (pointer-drag).
> Reuses the existing **`api.setTarget`** path (no per-tick loop in the frontend) — the leak round
> recomputes the target **on each seal/köder event** and sends one `setTarget`. More open real
> leaks → lower target (down to the soft floor) → faster downward drift; sealing leaks → higher
> target. The backend stays dumb (it only chases the last target the frontend sent).

### Visual
A **shelf-sign / Schild** (CSS+SVG overlay) styled like a hospital tea-kitchen board, with a
**Johanniskraut tea jar** on it. As the round starts, **cracks (Risse)** appear in the sign and
**drops (💧) drip** out of each open crack — visually mirroring the torso draining. A **tray of
patch cards 🩹** sits at the bottom; the player **drags a patch onto a leak** to seal it. Big touch
targets (≥ 96 px), touch-only (pointer events, no hover state).

### Data shape (proposed, lives in `frontend/src/lib/events.ts` alongside grapefruit/apfel)
```ts
// one leak round for the johanniskraut story
export interface JkLeak {
  id: string;
  kind: 'real' | 'koeder';      // real = seal it; koeder = drawing it accelerates the drain
  dominant?: boolean;           // 🌿 absetzen = true → sealing it alone halts the drain (basic WIN)
  emoji: string;                // 🌿 🩸 📞 🍵 💊 🌼
  label: { young: string; adult: string };
  feedback: { young: string; adult: string };
  dripRate: number;             // units/sec contribution to openLeakSum while OPEN (real leaks only)
  spawnAt: number;              // seconds into the round this crack appears (staggered)
}

export interface JkRound {
  durationGuide: number;        // ~ soft cap on round length for tuning (s) — target ~20–25 s
  leakFloor: number;            // soft floor the live level is clamped to during the round (e.g. 38, > 35)
  baseFactor: number;           // factor with all 3 real leaks open → level target ≈ leakFloor
  realLeaks: JkLeak[];          // exactly 3 (🌿 dominant + 🩸 + 📞), shuffled per run
  koederPool: JkLeak[];         // 3 köders; pick exactly 2 at random per run (scoping decision)
  koederBurst: number;          // extra downward push a köder adds during its burst
  koederBurstSecs: number;      // burst duration (~2 s) before the level returns to the open-leak target
  graceTimeoutSecs: number;     // grace timer once level settles at leakFloor with a real leak open (e.g. 2.5)
}
```

### What's correct
- **Basic WIN:** seal **🌿 „Johanniskraut absetzen"** (`dominant: true`) before the committed
  timeout. Sealing it removes the dominant share of `openLeakSum` → new `setTarget` well above the
  floor → drain **halts and reverses** to the band.
- **3rd star (Profi):** additionally seal **🩸 messen** and **📞 anrufen**, draw **zero köders**,
  and keep the level **≥ 45** throughout.
- **Never drag a `kind: 'koeder'`** (🍵 mehr Tee, 💊 verdoppeln, 🌼 noch ein Naturmittel). Dragging a
  köder onto the sign triggers the **two-step burst** (see below), a short red flash + the köder's
  feedback line; the köder card then **bounces back** (it cannot be used as a patch).

### Live level model (how the torso reacts) — event-driven, soft-floored
> Reframed per the engine reality (no per-tick loop; soft floor to dodge the auto-trip):
- On **each seal/köder event** the component recomputes:
  `factorTarget = 1 − normalize(openLeakSum)`, mapped so **all 3 real leaks open ⇒ target ≈
  `leakFloor` (38)** and **all real leaks sealed ⇒ target = `62`**.
  `levelTarget = clamp(62 × factorTarget, leakFloor, 62)` → one **`api.setTarget(levelTarget, normalRate)`**.
- Between events the component sends nothing; the **slow pump drifts** toward the last target.
- **Sealing the dominant real leak (🌿)** raises `factorTarget` enough that the target jumps above
  the floor → descent halts/reverses (felt relief).
- **A köder** is a **two-step `setTarget`** (a single target+rate cannot produce a transient
  overshoot): `setTarget(leakFloor, fastRate)` for the ~2 s burst, then after `koederBurstSecs`
  (via `setTimeout`) `setTarget(currentOpenLeakTarget, normalRate)`. *The implementer should not
  expect an automatic bounce-back from one call — the timer does it.*
- **Soft floor protects the round:** because `levelTarget` is clamped to `leakFloor (38) > 35`, the
  live level never enters `critical_low` during interaction, so `onLevel()` never auto-trips.
- **WIN** (explicit, component-driven): all real leaks sealed → component sends `setTarget(62)` and
  signals the store (`won = true`) → advance to outcome; level rises to band.
- **LOSE** (committed, then engine-driven): level settles at `leakFloor` with a real leak open →
  `graceTimeoutSecs` timer → on expiry the component sends **`setTarget(33)`**; the engine's
  `onLevel()` then sees `zone === 'critical_low'` during the (PLAY-phase) leak round and runs
  `finishOutcome()` for the abstoßungs-LOSE. *(The leak-round phase is added to `PLAY_PHASES` so
  this deliberate trip is honored.)*

### Scoring (feeds the stars)
- **Gerettet ⭐** — round won (🌿 sealed in time, level returned to band).
- **Schlau ⭐** — detective correct first try (set at beat 3).
- **Profi ⭐** — won with **all 3 real leaks sealed**, **zero köders drawn**, and **min level never
  below `45`** (tunable).
- Track per-run: `koedersDrawn`, `minLevelReached`, `realLeaksSealed`, `detectiveFirstTry`, `won`.

### Timing & feel
- Leaks **spawn staggered** (`spawnAt`) so the player isn't hit with all of them at once — the
  pressure ramps. The **slow pump** means the player has a few seconds per leak; the tension is
  „can I reach them before the floor + grace timer?", not twitch reflex (honours the SLOW-torso
  constraint).
- With **3 real + 2 köders** the round stays **< ~25 s** and is readable for kids (scoping decision).
- Big drag targets, generous hit-boxes, snap-to-leak on release within a tolerance radius.
- A subtle **green rise animation** on win sells the „protection refills" payoff.

---

## Pharmacological accuracy (real drug + real interaction — no invention)
- **Drug:** **Ciclosporin** (ciclosporin / cyclosporine A) — a **calcineurin-inhibitor
  immunosuppressant**, standard maintenance therapy after solid-organ (incl. renal) transplantation;
  it has a **narrow therapeutic index** and is routinely **trough-level (Talspiegel) monitored** — so
  „Spiegel messen" is a genuine real-world intervention, not a game contrivance.
- **Interactant:** **St. John's Wort / Johanniskraut (Hypericum perforatum)**, OTC herbal
  antidepressant. Its constituent **hyperforin** is a potent **agonist of the pregnane-X-receptor
  (PXR)**, which **upregulates CYP3A4 and P-glycoprotein (P-gp/ABCB1)** — a well-characterised
  **enzyme/transporter induction** (the inverse of grapefruit's CYP3A4 *inhibition* in story 1).
- **Direction & consequence:** Induction → **increased metabolism + efflux of ciclosporin** →
  **lower trough concentrations** → **loss of immunosuppression** → **acute transplant rejection.**
  This is **documented in real case reports**. The most cited is **Ruschitzka F, Meier PJ, Turina M,
  et al. „Acute heart transplant rejection due to Saint John's wort." *Lancet*
  2000;355(9203):548–549** — note this concerns **two HEART-transplant patients** (subtherapeutic
  ciclosporin + acute rejection after starting St. John's Wort). **Our patient is a KIDNEY
  transplant;** acute rejection in **renal** transplant recipients under St. John's Wort is
  **separately documented** in subsequent case reports and pharmacology reviews. The debrief copy
  is written to state this distinction explicitly so the citation and the patient's organ match up
  for an expert in the audience.
- **Onset realism:** the real induction **builds over ~1–2 weeks** (and reverses similarly slowly);
  the story copy keeps the truthful framing — young: „nach einer Weile", adult: „über Tage bis
  Wochen" — while the **mechanic** compresses this into a single tense „leak round" for playability.
- **No invention:** every „real leak" is an actual clinical action (stop the herb, monitor the
  trough, contact the transplant clinic). Every „köder" is a **real-world pitfall** (more herb =
  stronger induction; self-doubling the dose without monitoring is unsafe; adding another herbal does
  not fix it). **No fictional antidote, no fictional effect.**
- **One concept only:** *an enzyme/transporter **inducer** makes a drug work **too little** — and the
  fix is to **remove the inducer**, not to chase the dose.* The **absence of an overdose path** is
  intentional and accurate: induction lowers exposure; it does not create toxicity here. The
  **dominant „absetzen" leak** carrying the WIN reinforces this single lesson.

## Assets
- **Briefing photo:** *Hypericum perforatum* (St. John's Wort) — **Wikimedia Commons, CC** (flowering
  plant; pick a clean CC-BY/CC0/public-domain image and record the attribution next to the file).
  Store under `frontend/public/img/stories/johanniskraut/` (match story-1 asset layout). Optional
  second image: a **tea jar / capsules** still-life (CC) to sell „Tee + Kapseln".
- **Cards:** text + emoji only (no photos needed) — 🌿 (absetzen) · 🩸 (Spiegel messen) · 📞 (Ambulanz)
  · 🍵 (mehr Tee) · 💊 (verdoppeln) · 🌼 (noch ein Naturmittel) · 🩹 (patch). Emoji already render on
  the Pi (fonts-noto-color-emoji installed — see deploy notes).
- **Shelf-sign / leak overlay:** pure **CSS/SVG** (the „Schild mit Riss", drip drops, snap targets) —
  no raster assets required; lives in `JkLeak.svelte`.
- **Story card** (StorySelect): reuse the existing Johanniskraut placeholder card in
  `frontend/src/lib/stories.ts`; swap its art to the Hypericum photo / a 🌿 motif.
- **i18n:** all strings go through `t()` in `frontend/src/lib/locale.svelte.ts` (German first;
  EN/NL/AR fall back to German per project convention). RTL (AR) must work for the drag round —
  mirror the tray/sign layout with logical CSS.

## Tunables (for feel)
- **`leakFloor`** (default `38`, **must stay `> 35`**) — the soft floor the live level is clamped to
  during the round; this is what keeps the engine from auto-tripping mid-interaction. Lower it
  (toward `36`) for a scarier round, but never to `35`.
- **`graceTimeoutSecs`** (default `2.5`) — how long the player has once the level settles at the floor
  with a real leak still open before the committed `setTarget(33)` lose fires.
- **`baseFactor`** (all 3 real leaks open) sets how *deep/fast* the drain goes — start so the
  full-leak target ≈ `leakFloor` over a few seconds (raise it to make the drain gentler/slower).
- **Per-leak `dripRate`** — make 🌿 „absetzen" the **dominant** drip (~60 % of total) so sealing it
  alone visibly halts the drain (basic WIN); 🩸 and 📞 smaller and only needed for Profi.
- **`spawnAt` stagger** — controls the pressure ramp (all-at-once = harder; spread out = friendlier
  for kids). Tune so the whole round lands **~20–25 s** with 3 real + 2 köders.
- **`koederBurst` / `koederBurstSecs`** (~2 s) — how punishing a wrong card is; implemented as the
  two-step `setTarget` (fast dip to floor → return to open-leak target). Keep recoverable.
- **`fastRate` / `normalRate`** — the `rate` args passed to `api.setTarget` for the köder burst vs.
  normal drift (the slow-pump rate also lives in `backend/app/game/controller.py`).
- **Köder count per run** — **decided: exactly 2 of the 3-köder pool, shuffled** (replay variety while
  keeping the round short/readable). Raise to 3 only if play-testing shows the round is too easy.
- **Profi-star thresholds** — `minLevel` floor (default `45`), `koedersDrawn == 0`, all 3 real leaks
  sealed.
- **Crit-low line** (`35`, in `backend/app/game/controller.py`) = the abstoßungs-LOSE threshold the
  committed `setTarget(33)` crosses; raise it for a tighter, scarier window (keep `leakFloor` above it).