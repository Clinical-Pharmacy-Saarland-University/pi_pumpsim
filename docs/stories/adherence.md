Now I have the exact API surface confirmed. Key facts verified against the real code:

- `api.setTarget(level, rate?)` exists (api.ts:43) — no `moveTo(target, ms)`.
- `game.svelte.ts` has internal `moveTo(target, then)` (line 86) — no duration arg; calls `api.setTarget(target)` with no rate.
- `onLevel` (line 102) auto-ends via `finishOutcome()` the instant `zone` is `critical_high`/`critical_low` during any `PLAY_PHASES` phase — confirms the abrupt-end behavior and the settle mechanism (`wait.armed` flips on `moving`→`!moving`).
- `finishOutcome` reads `game.level.zone` for win/over/under.

I can now rewrite the spec to use the real primitives (`setTarget` with a computed `rate`, chained via the `wait`/armed settle), document exact crossing arithmetic, retune `deltaPerSlot`, fix the SJS/TEN and "double dose not fatal" accuracy points, and make per-day rate explicit for the slow pump. Here is the improved full markdown.

```markdown
# Story spec — „Der Wochen-Pillenplan: Halt den Rhythmus" (Adhärenz · vergessene/verdoppelte Dosis × Lamotrigin)

> Per-story flow + **torso movement** + kid/adult copy + star logic + loss rules.
> Story 5 of 6 (archetype = **Adhärenz / Einnahme-Interaktion**). Engine model = §18/§19
> in `game-design.md`; structure mirrors the sign-off template
> [`fruehstuecks-falle.md`](fruehstuecks-falle.md). Status: **DESIGN — not yet implemented**.
> Unique mechanic = **„Build-a-Week" Wochen-Pillenplan**: the player *authors* a 7-day
> plan (one slot per day; empty = vergessen, double = nachholen are physically possible),
> taps **„Woche abspielen"**, and watches the torso **saw-tooth day by day** — their own
> input becomes the curve. This is the only **time-axis authoring** archetype in the set,
> and it is **purely turn-based: zero time pressure in the authoring phase** (deliberately the
> opposite of Johanniskrauts reaktiver Echtzeit-Leck-Abwehr — *compose-then-watch* vs.
> *react-under-pressure*; see Distinctness note).

## ⚠️ Pre-build TODOs (must close before the open day)
1. **ACCURACY — FI-Gegencheck (hart, nicht optional):** Die zwei Lehrsätze dieser Story
   — **„eine vergessene Dosis nicht verdoppeln"** und **„nach einer Einnahmepause neu
   eintitrieren, sonst Risiko schwerer Hautreaktionen (SJS/TEN)"** — sind real und
   korrekt, aber **vor dem TdoT 1:1 gegen die aktuelle deutsche Fachinformation des
   konkret verwendeten Lamotrigin-Präparats** zu prüfen und in der Wortwahl zu übernehmen.
   **SJS/TEN ist eine ernste Aussage, die öffentlich angezeigt wird** — die FI ist die
   verbindliche Quelle. (Verschoben aus einer Fußnote in eine harte Vorab-Aufgabe.)
2. **TUNING — Crossing-Arithmetik testen:** `deltaPerSlot` so verifizieren, dass **nur die
   beabsichtigten Pläne** die kritischen Linien reißen (exakte Rechnung unten in
   *Crossing-Arithmetik*).
3. **HARDWARE — Tempo auf dem echten Torso messen:** der reale Pumpenfluss (~4 u/s) muss die
   per-Tag-Bewegungen in der gewünschten Zeit schaffen — **per-Tag-`rate` ist daher Pflicht-
   Parameter** (siehe *Playback* + *Scoping*), sonst läuft die Wiedergabe auf Hardware viel
   langsamer als am PC.

## Meta
- **Patient:** Lena, 22, Studentin mit **Epilepsie** → **Lamotrigin** (Antiepileptikum),
  **eine Tablette täglich, immer zur gleichen Zeit**. In einer stressigen Prüfungswoche
  vergisst sie eine Tablette — und überlegt, am nächsten Tag „zum Nachholen" einfach zwei zu
  nehmen.
- **Interaction:** **Adhärenz-/Einnahme-Interaktion** — keine Fremdsubstanz, sondern der
  **Einnahme-Rhythmus selbst**. Lamotrigin schützt nur bei **konstantem Wirkspiegel** vor
  Anfällen. **Vergessene Dosen senken** den Spiegel → **Durchbruchsanfälle** (Non-Adhärenz
  ist eine dokumentierte Hauptursache für Anfälle unter AED-Therapie). **Verdoppeln
  („Nachholen") überschießt** den Spiegel → **dosisabhängige** Toxizität (Ataxie,
  Doppelbilder, Müdigkeit/Sedierung) — *nicht* akut lebensbedrohlich bei einer einzelnen
  Verdopplung, aber das falsche Vorgehen. Lamotrigin hat zusätzlich eine **reale, in der
  Fachinformation festgehaltene Regel:** nach einer **Einnahmepause** darf **nicht** mit der
  alten Erhaltungsdosis fortgesetzt werden, sondern muss **langsam neu eintitriert** werden —
  rascher Dosisanstieg trägt das Risiko **schwerer Hautreaktionen (Stevens-Johnson-Syndrom /
  TEN)**. Real fix: **jeden Tag genau eine Dosis** — und **eine vergessene Dosis niemals
  verdoppeln**, sondern normal weitermachen.
- **Engine numbers** (normalized 0–100, all tunable): band `[55,70]`, baseline `40`,
  critical-high `80`, critical-low `35`, **steady-state start `62`** (Lena ist eingestellt).
  Per simulated day (**retuned for clean crossing arithmetic, see below**):
  **1-Pille-Tag → hält** (kleiner kosmetischer Puls `±2` um den aktuellen Stand);
  **0-Tag (vergessen) → fällt `−8`**; **2-Tage (verdoppelt) → spitzt `+10`**.

## End states (the game only ends here — three distinct endings)
| Outcome | Reached by | Torso | Message |
|---|---|---|---|
| **WIN** | saubere Woche, **genau eine** Pille pro Tag → settled im Band | green `~62` | „Rhythmus gehalten! 🎉 Lena ist die ganze Woche sicher geschützt." |
| **LOSE — Überdosis** | ein **„Doppeldosis-Nachholen"-Tag** aus hohem Spiegel → Kamm reißt kritisch-hoch `80` | critical `≥80` | „Zwei auf einmal → der Spiegel schießt über. Verpasste Dosis **niemals** verdoppeln." |
| **LOSE — Unterdosiert** | **zu viele vergessene Tage** → unter kritisch-niedrig `35` | drops `<35` | „Zu oft vergessen → der Schutz bricht weg → Durchbruchsanfall." |

## Loss / retry rule (decided)
- **Plan-Phase ist gestaltbar, nicht vorgegeben** — der Spieler *baut* die Woche selbst;
  vergessene (leere) und doppelte Slots sind **physisch möglich**. Das ist der ganze Witz.
  **Kein Zeitdruck** in der Plan-Phase — reines turn-based Authoring.
- **Abspielen ist Konsequenz, nicht Strafe** — beim **„Woche abspielen"** läuft der Torso
  Tag für Tag (jeweils ein `api.setTarget(target, rate)` mit Settle-Warten). Die Engine
  **trippt bereits von selbst** auf `critical_high` / `critical_low` **mitten in der
  Bewegung** (gleiche `onLevel`-Logik wie der Grapefruit-Drift in `game.svelte.ts`).
- **Abruptes Ende ist akzeptiert (bestätigt):** sobald eine kritische Linie *während* eines
  Tages-Moves gerissen wird, ruft `onLevel` sofort `finishOutcome()` → die Wiedergabe stoppt
  **mitten im Sägezahn an genau diesem Tag**, restliche Tage werden **nicht** mehr gespielt.
  Das ist gewollt („playback stops at the tripping day → outcome"): die Kurve hält sichtbar
  am Kipp-Tag, der Tag-Ticker bleibt auf diesem Tag stehen. **Wichtig:** weil das Ende abrupt
  ist und auf einem **transienten Überschwingen** auslösen kann, ist die Crossing-Arithmetik
  unten so getunt, dass **nur die beabsichtigten Pläne** reißen (kein versehentlicher Trip).
- **Jeder Verlust wird erklärt** und nennt die **echte Regel** — bei Überdosis: *„verpasste
  Dosis nicht verdoppeln"*; bei Unterdosis: *„konstanter Spiegel schützt — Lücken brechen den
  Schutz"*.
- **Retry wird auf jedem Verlust angeboten** — zurück zur Plan-Phase mit **demselben** (zur
  Korrektur sichtbaren) Plan, damit der Spieler den Fehler gezielt fixt.
- **Der klassische Trap-Plan** (eine Lücke an Tag _n_, dann später ein Doppel zum „Nachholen")
  **dipt erst und spitzt dann** — die **Spitze** löst den Überdosis-Verlust aus; das Feedback
  benennt die Regel. Genau der Fehler, den Menschen real machen.
- **„Vergessen ist kein sofortiger Verlust":** ein einzelner vergessener Tag dipt nur
  (`62→54`, knapp unter Band) und **erholt sich** mit der nächsten korrekten Pille — so lernt
  man, dass *normal weitermachen* die richtige Reaktion ist (nicht verdoppeln). Erst **mehrere**
  Lücken kumulieren in die Unterdosis. **Tuning-Entscheidung (Open-Question geklärt): JA — eine
  einzelne Lücke soll dippen und vollständig zurückfedern.** Dafür gibt der erste korrekte Tag
  **nach** einem 0-Tag einen **Erholungs-Boost `+8`** (statt Delta `0`), damit `54→62`. So sind
  die einzigen echten Verluste *wiederholte* Lücken (Unter) oder ein Doppel (Über).

## Crossing-Arithmetik (exakt — damit nur die gewollten Pläne reißen)
> Engine: jeder Tag ist `setTarget(level + delta)`; der langsame Chase **kreuzt** auf dem Weg
> alle Zwischenwerte. `onLevel` trippt, sobald `zone` `critical_high`(≥80) oder
> `critical_low`(≤35) ist — also **schon beim Überschreiten der Linie**, nicht erst am Zielwert.
> Daher zählt für einen Trip, ob das **Ziel** die Linie erreicht/überschreitet.

Mit `deltaPerSlot = {0: −8, 1: 0 (bzw. +8 Erholung nach einem 0-Tag), 2: +10}`, Start `62`:

- **2-Doppel aus dem Steady State:** `62 + 10 = 72` → bleibt **im/knapp über Band**, **kein
  Trip** (72 < 80). *Sichtbares Überschießen, aber noch nicht tödlich-Linie* — lehrt „zu viel"
  ohne sofortigen Verlust, falls es ein Einzel-Doppel im Band ist.
- **2-Doppel aus bereits hohem Spiegel** (z. B. nach einem Erholungs-Boost auf `70`, dann
  Doppel): `70 + 10 = 80` → **reißt genau `80`** → **LOSE Überdosis** (gewollt).
- **Zwei Doppel-Tage** (`62 → 72 → 82`): zweites Ziel `82 > 80` → **LOSE Überdosis** (gewollt).
- **Trap-Plan** Lücke→später Doppel: `62 →(−8)→ 54 →(+8 Erholung)→ 62 …` — wenn das Doppel auf
  einen **vollen** Spiegel trifft (`70 + 10 = 80`), reißt es; trifft es den Steady State
  (`62 + 10 = 72`), reißt es nicht. **Tuning-Hebel:** Damit der *typische* Nachhol-Trap
  deterministisch verliert, den Trap-Tag so anlegen, dass der Doppel-Tag **direkt auf einen
  erholten/vollen Tag** folgt (Plan-Vorlage in der Demo so setzen) — oder `+10`→`+12` erhöhen,
  dann reißt **jedes** Doppel aus dem Band (`62+12=74` knapp, `70+12=82` sicher). **Empfehlung:
  deterministischer Trap-Verlust** für die klare Lehraussage.
- **Einzelne Lücke:** `62 →(−8)→ 54` (>35, **kein** Trip), dann Erholung `+8 → 62`. Knapper WIN.
- **Unterdosis-Schwelle:** aufeinanderfolgende 0-Tage **ohne** dazwischenliegende Pille
  (Erholungs-Boost greift nur auf einen `1`-Tag *nach* einem `0`-Tag, nicht auf einen weiteren
  `0`-Tag): `62 → 54 → 46 → 38 → 30`. **Vier Lücken in Folge** reißen `30 ≤ 35` an Tag 4 →
  **LOSE Unterdosiert** (Ziel `38` an Tag 3 ist noch >35, Ziel `30` an Tag 4 trippt). **Drei
  Lücken in Folge** (`62→54→46→38`) reißen **nicht** (38 > 35) → bleibt knapp, aber lebt; bei
  schärferem Tuning (`−9`/Tag) reißen schon **3** Lücken. **Default: 4 Lücken in Folge = Verlust.**

> **Surprise-Trip vermeiden:** Der Review-Hinweis „+13 aus 69 → 82 trippt überraschend" ist mit
> `+10`/`−8` entschärft, weil Doppel aus dem Steady State (`72`) bewusst **unter** `80` bleibt
> und nur *kumulierte* oder *aus-hohem-Spiegel*-Doppel reißen. **Diese Zahlen vor dem TdoT auf
> dem echten Torso gegen-spielen** (TODO 2), da der langsame Chase je nach Rate minimal
> überschwingen kann.

## Star logic (decided) — summed, shown N/3 (0 on any loss)
- ⭐ **Geschützt** — Woche endet im grünen Band (nur der saubere 7×1-Plan, bzw. ein Plan mit
  einer einzelnen, erholten Lücke endet zwar grün → *siehe knapper WIN*).
- ⭐ **Sauberer Plan** — **genau eine** Pille in **jedem** der 7 Slots, **beim ersten Abspielen**
  (keine leeren, keine doppelten Slots, kein Retry).
- ⭐ **Verstanden** — im abschließenden Mini-Quiz die echte Regel („nicht verdoppeln")
  **beim ersten Versuch** richtig.

> Mapping auf den vorhandenen `game.score`-Mechanismus (`game.svelte.ts`): „Sauberer Plan" →
> `pcCorrect/pcTotal` (erstes Abspielen ohne Fehler-Slot, kein Retry), „Verstanden" →
> `kCorrect/kTotal` (Quiz first-try). Das bestehende `finishOutcome()` summiert dann
> `1 + planClean + quizClean` exakt wie beim Grapefruit-Finale — **keine neue Scoring-Engine
> nötig**.

## Flow & torso movement
| # | Beat | Player action | Torso (from→to) | Branch |
|---|---|---|---|---|
| 0 | Briefing | — | `62` (steady state, in band) | → 1 |
| 1 | Steady-State erklären | tap „Eine Tablette geben" | `62 → 62` (kleiner Tagespuls `±2`, bleibt grün) | → 2 |
| 2 | Das Ereignis (Prüfungsstress) | „Weiter" (Lena vergisst eine Pille → überlegt nachzuholen) | `62` (hält, noch ohne Folge) | → 3 |
| 3 | Wochenplan bauen | drag/tap Pillen in **Mo–So** | — (kein Move; nur Authoring) | → 4 |
| 4 | **Woche abspielen** | tap „Woche abspielen" | **Tag-für-Tag Sägezahn** (siehe unten) | branches by plan |
| 5 | Lern-Quiz (win path only) | tap die richtige Regel | **steady green** (Lena sicher) | → 6 |
| 6 | Outcome | — | (bleibt / hält am Kipp-Tag) | end |

**Beat 4 — wie der Torso pro simuliertem Tag steppt (Wiedergabe, slow pump liest den Kamm):**
| Tages-Slot | Bedeutung | Torso pro Tag | Folge |
|---|---|---|---|
| **1 Pille** ✅ | korrekt | hält (`±2`-Puls), bleibt grün; **nach einem 0-Tag: +8 Erholung** | weiter |
| **leer (0)** ⚠️ | vergessen | fällt `−8` (z. B. `62→54`), **unter `55`** | weiter; erholt sich mit nächster Pille |
| **2 Pillen (Doppel)** ❌❌ | „Nachholen" | spitzt `+10` (Steady `62→72`; aus vollem Spiegel `70→80`) | kann **`≥80`** reißen → **LOSE Überdosis** |
| **mehrere leere kumuliert** ❌ | wiederholt vergessen | jeder Dip `−8` tiefer, ohne Erholung | **4 in Folge** reißen **`≤35`** → **LOSE Unterdosiert** |

**Beat 4 branches (Plan-Beispiele, Torso reagiert):**
| Plan | Sägezahn-Verlauf | Result |
|---|---|---|
| ✅ 7×1 (jeden Tag genau eine) | sauberer flacher Kamm, hält `~62` | → Lern-Quiz → **WIN** (3★ möglich) |
| ❌❌ Lücke + späteres Doppel (Trap) | dipt `62→54`, Erholung `→62`/`→70`, dann Doppel reißt `≥80` | „Nachholen"-Spitze → **LOSE (Überdosis)** |
| ❌ 4+ Lücken, kein Nachholen | treppt abwärts `62→54→46→38→30`, reißt `≤35` an Tag 4 | → **LOSE (Unterdosiert)** |
| ⚠️ eine einzelne Lücke, sonst 1×1 | dipt einmal `62→54` (unter Band), Erholung `+8 → 62`, endet `~62` | endet grün, aber **kein „Sauberer Plan"-Stern** → **knapper WIN** |

> **Design-Hinweis zur Spannung:** Der Sägezahn **muss langsam** laufen — die slow pump ist
> hier das Feature. Jeder „Tag" ist ein eigener `setTarget(target, rate)`-Aufruf mit einer
> kurzen Tages-Pause (Tag-Label „Mo… Di… Mi…" blendet ein), damit der Zuschauer **sieht, wie
> sein eigener Plan zur Kurve wird**. Empfohlen `~1.0 s` Bewegung + `~0.4 s` Halt pro Tag
> (tunable über `rate`), Gesamtdauer der Wiedergabe `~10–12 s` für 7 Tage.

---

## Copy — kid (`young`) / adult (`adult`)
> Every option, feedback line and instruction has both registers. Kids = warm/concrete;
> adults = precise + real terms. In `young` werden **medizinische Begriffe** (Wirkspiegel,
> Eintitrieren, SJS) **vermieden**; das Quiz (Beat 5) zeigt im `young`-Register **3** Optionen
> statt **4** (die nuancierte „neu eintitrieren"-Antwort ist nur für `adult` sichtbar).

### 0 · Briefing
- **Patient** — young: „Das ist Lena, 22. Sie studiert und hat **Epilepsie**. Eine kleine
  Tablette jeden Tag sorgt dafür, dass keine Anfälle kommen." · adult: „Lena, 22, Studentin
  mit **Epilepsie**. Sie nimmt **Lamotrigin**, ein Antiepileptikum, zum Anfallsschutz."
- **Ziel** — young: „Hilf Lena, ihren **Rhythmus** zu halten: jeden Tag genau **eine**
  Tablette. Dann bleibt der Spiegel schön im grünen Bereich." · adult: „Halte Lenas
  **Wirkspiegel** konstant im grünen Fenster — durch eine **regelmäßige** tägliche Einnahme."

### 1 · Steady-State (tutorial: warum täglich)
- **Prompt** — young: „Gib Lena ihre Tablette. Schau: Eine pro Tag hält den Spiegel ruhig im
  Grünen — wie ein gleichmäßiger Herzschlag." · adult: „Eine Tablette täglich hält Lena im
  **Steady State** — der Spiegel pulsiert nur leicht und bleibt im therapeutischen Fenster."
- **Button:** „Eine Tablette geben"
- **Reveal (🟢):** young: „Genau so! Gleichmäßig im Grünen. Wichtig ist: **jeden Tag** dran
  denken." · adult: „Stabil im Fenster. Der Schutz hängt an der **Gleichmäßigkeit** — nicht an
  der einzelnen Dosis."

### 2 · Das Ereignis (Prüfungsstress)
- **Story** — young: „Es ist Prüfungswoche! 📚 Lena lernt bis spät, schläft wenig — und an
  einem Morgen **vergisst sie ihre Tablette**. Am nächsten Tag denkt sie: ‚Dann nehme ich
  heute eben **zwei**, um es nachzuholen.'" · adult: „Prüfungswoche, viel Stress, wenig Schlaf.
  An einem Tag **vergisst** Lena ihre Dosis. Am Folgetag erwägt sie, **die doppelte Menge** zu
  nehmen, um die verpasste ‚nachzuholen'."
- **Reveal (🤔):** young: „Hmm — ist ‚zwei auf einmal' wirklich eine gute Idee? Plane Lenas
  Woche und probier es aus!" · adult: „Ist ‚Nachholen durch Verdoppeln' korrekt? Plane die
  Woche und beobachte den Spiegelverlauf."

### 3 · Wochenplan bauen (die UNIQUE-Mechanik)
- **Prompt** — young: „Bau Lenas Woche: Zieh in **jedes Kästchen genau eine Tablette** — von
  Montag bis Sonntag. Leer lassen = vergessen. Zwei reinlegen = doppelt. Dann auf **‚Woche
  abspielen'** tippen!" · adult: „Erstelle Lenas **7-Tage-Plan** (Mo–So): platziere pro Tag
  eine Tablette. Ein **leerer** Slot = vergessene Dosis; ein **doppelter** Slot = ‚Nachholen'.
  Dann **‚Woche abspielen'**."
- **Hint (erscheint, wenn ein Slot leer ist):** young: „Mo ist noch leer — vergisst Lena hier
  ihre Tablette?" · adult: „Slot Mo unbesetzt — als ausgelassene Dosis gewertet."
- **Hint (erscheint, wenn ein Slot doppelt ist):** young: „Zwei in einem Kästchen — das ist
  ‚Nachholen'. Mal sehen, was passiert …" · adult: „Doppelbelegung erkannt — wird als
  Verdopplung gewertet."
- **Button:** „Woche abspielen"

### 4 · Woche abspielen (Wiedergabe — Torso saw-tooth)
- **Während des Abspielens** (Tages-Ticker, einblendend): young: „**Montag** … **Dienstag** …
  schau auf den Spiegel!" · adult: „Tagesweise Wiedergabe — Spiegel folgt dem Plan."
- **Tages-Reaktionen (kleine Sprechblase am Torso):**
  - 1 Pille — young: „Schön gleichmäßig. 🙂" · adult: „Spiegel gehalten."
  - leer — young: „Oh — heute keine Tablette. Der Spiegel sackt ab. 🔻" · adult: „Dosis fehlt
    — Spiegel fällt unter das Fenster."
  - doppelt — young: „Uff — zwei auf einmal! Der Spiegel schießt hoch. 🔺" · adult:
    „Verdopplung — Spiegel überschießt."

### 5 · Lern-Quiz (win path only — torso steady green)
- **Prompt** — young: „Letzte Frage: Lena hat **eine** Tablette vergessen. Was ist richtig?" ·
  adult: „Lena hat **eine** Dosis ausgelassen. Wie ist korrekt fortzufahren?"
- **Optionen & Feedback:**
  - ✅ **„Einfach normal mit einer Tablette weitermachen."** — young: „Genau! Eine vergessene
    Tablette holt man **nicht** durch zwei nach — einfach normal weiter." · adult: „Korrekt —
    vergessene Dosis **nicht** verdoppeln; mit der üblichen Einzeldosis fortfahren."
  - ❌❌ **„Am nächsten Tag zwei nehmen, um es nachzuholen."** — young: „Nein — zwei auf einmal
    ist **zu viel**. Der Spiegel schießt über und das wird gefährlich." · adult: „Falsch —
    Verdopplung führt zu **dosisabhängiger Toxizität** (Ataxie, Doppelbilder, Sedierung);
    ‚Nachholen' ist **kein** korrektes Vorgehen." *(Hinweis: eine einzelne Verdopplung ist
    i. d. R. nicht akut lebensbedrohlich, aber das falsche Vorgehen — daher im `young`-Text
    bewusst „gefährlich", nicht „tödlich".)*
  - ❌ **„Lieber gleich ganz aufhören, ist eh stressig."** — young: „Nein — ohne Tabletten
    fehlt der Schutz, dann können Anfälle kommen." · adult: „Falsch — Absetzen entzieht den
    Anfallsschutz → Durchbruchsanfälle; AED nie eigenmächtig abbrechen."
  - ⚠️ **„Nach einer längeren Pause die alte Dosis langsam neu aufbauen."** *(adults only)* —
    young: *(hidden)* · adult: „Differenziert richtig für eine **längere Pause**: nach einer
    Unterbrechung **neu eintitrieren** statt sofort die volle Erhaltungsdosis — rascher
    Wiederanstieg erhöht das Risiko **schwerer Hautreaktionen (SJS/TEN)**. Für **eine** einzelne
    vergessene Dosis genügt aber: normal weitermachen." *(Wortlaut FI-pflichtig — siehe
    Pre-build TODO 1.)*

### 6 · Outcome / Debrief (three endings)
- **WIN** — young: „**Rhythmus gehalten!** 🎉 Jeden Tag genau eine — Lena ist die ganze Woche
  sicher geschützt." · adult: „**Konstanter Spiegel** über die Woche — Lena bleibt im
  therapeutischen Fenster, durchgehender Anfallsschutz."
- **LOSE — Überdosis** — young: „**Zu viel!** Zwei auf einmal lassen den Spiegel überschießen —
  das macht müde, schwindelig und kann schaden." · adult: „**Überdosis** durch ‚Nachholen' →
  dosisabhängige Toxizität (Ataxie, Doppelbilder, Sedierung). **Verpasste Dosis niemals
  verdoppeln.**"
- **LOSE — Unterdosiert** — young: „**Zu oft vergessen.** Ohne genug Wirkstoff bricht der
  Schutz weg — ein Anfall kann kommen." · adult: „**Unterdosiert** durch wiederholte
  Auslassungen → Spiegel unter dem Fenster → **Durchbruchsanfall**. Non-Adhärenz ist eine
  Hauptursache."
- **Debrief facts (both shown):**
  1. young: „**Jeden Tag genau eine** Tablette hält den Schutz gleichmäßig." · adult:
     „Lamotrigin schützt nur bei **konstantem Wirkspiegel** — Regelmäßigkeit ist die Therapie."
  2. young: „Eine vergessene Tablette **nicht** mit zwei nachholen — einfach normal
     weitermachen." · adult: „**Verpasste Dosis nicht verdoppeln.** Nach einer **längeren
     Pause** zudem **neu eintitrieren** (sonst Risiko **SJS/TEN**), nicht sofort die volle
     Erhaltungsdosis."

---

## UNIQUE mechanic — „Der Wochen-Pillenplan" (Build-a-Week, dann abspielen) — full spec

### Was es ist
Ein **Authoring-Mini-Spiel auf der Zeitachse, ohne Zeitdruck.** Der Spieler legt für
**7 Tage (Mo–So)** selbst fest, wie viele Tabletten Lena nimmt, indem er **Pillen-Token** auf
einen **Dispenser-Strip** zieht (Drag) oder per **Tap** platziert. Danach **„Woche abspielen"**
→ die 7 Slots werden nacheinander in **Torso-Bewegungen** übersetzt; der Plan **ist** die Kurve.
Das ist bewusst das Gegenteil von Johanniskrauts Echtzeit-Leck-Abwehr (eine reaktive Störung
unter Zeitdruck): hier wird **eine Sequenz absichtlich komponiert und dann passiv abgespielt**
(*compose-then-watch* vs. *react-under-pressure*).

### Data shape (vorgeschlagen, `frontend/src/lib/events.ts` / story config)
```ts
// Slot count per day; the plan IS the player's authored array.
type DaySlot = 0 | 1 | 2;            // 0 = vergessen, 1 = korrekt, 2 = Doppel/„Nachholen"
type WeekPlan = DaySlot[];           // length 7, index 0..6 = Mo..So

interface AdherenceConfig {
  days: 7;
  dayLabels: ['Mo','Di','Mi','Do','Fr','Sa','So'];   // i18n keys
  startLevel: 62;                    // steady state, in band
  // per-day torso deltas (RETUNED for clean crossing arithmetic):
  deltaPerSlot: { 0: -8, 1: 0, 2: +10 };   // tunable
  recoveryBoost: 8;                  // a `1`-day immediately AFTER a `0`-day adds +8 (full rebound)
  dailyPulse: 2;                     // small ±wobble on a correct day (cosmetic)
  band: [55, 70];
  criticalHigh: 80;                  // mid-move trip → LOSE Überdosis
  criticalLow: 35;                   // mid-move trip → LOSE Unterdosiert
  // playback timing — rate is PER-DAY and MANDATORY (slow pump needs it; see below):
  dayMoveMs: 1000;                   // intended on-screen crest/decay duration per day
  dayHoldMs: 400;                    // pause on the day label
  // rate is computed per day from distance/dayMoveMs (NOT a fixed default) — see playback.
}
```
- **Token-Palette:** eine **„1× Pille"** (neutral) und ein **rot getöntes „2× Doppel"**-Token
  (oder: zweimal die 1×-Pille in denselben Slot ziehen = automatisch Slot-Wert `2`). Ein Slot
  leer lassen = `0`.
- **Interaktion:** primär **Drag-onto-Slot**; **Tap-to-Place-Fallback** (Token antippen → Slot
  antippen) ist Pflicht, weil Touchscreen. Jeder Slot hat einen **Mülleimer/Tap-to-clear**, um
  einen Fehlplatz zurückzunehmen. **Touch-only, kein :hover** (siehe Repo-Konvention).

### Playback (wie der Torso reagiert) — REAL api, kein fiktives `moveTo(target,ms)`
> **Engine-Realität (verifiziert in `frontend/src/lib/api.ts` + `game.svelte.ts`):** Es gibt
> **nur** `api.setTarget(level, rate?)` (+ `api.reset()`). Das interne `moveTo(target, then)`
> in `game.svelte.ts` hat **keinen** Dauer-Parameter und ruft `api.setTarget(target)` **ohne
> Rate**. Per-Tag-Timing wird daher über die **`rate`** von `setTarget` erreicht
> (`rate = |delta| / dayMoveMs_in_seconds`), und das Warten auf das Settle nutzt den
> **bestehenden `wait`/armed-Mechanismus** (`onLevel` flippt `armed` bei `moving→!moving`).
> Die Wiedergabe ist also eine **Kette von `setTarget(target, rate)` + await-settle**, kein
> neues Engine-Primitive. Die Engine **trippt bereits selbst** in `onLevel` auf
> `critical_high`/`critical_low` während eines Moves und ruft `finishOutcome()` (abruptes Ende).

```ts
// Pattern A (empfohlen): pro Tag ein setTarget(target, rate) + auf Settle warten.
// `moveAt` ist eine kleine Erweiterung des bestehenden moveTo, die eine RATE durchreicht
// und denselben wait/armed-Settle-Mechanismus nutzt (KEIN moveTo(target, ms)!):
function moveAt(target: number, rate: number, then: () => void) {
  const cur = game.level?.level ?? target
  api.setTarget(target, rate)            // <-- echte api: rate steuert das Tempo
  if (Math.abs(target - cur) < 1) { wait = null; setTimeout(then, 650) }
  else { wait = { next: then, armed: false } }   // onLevel ruft `then` beim Settle
}

let level = cfg.startLevel               // 62
let prevWasGap = false
function playDay(d: number) {
  if (d >= cfg.days) {                    // alle 7 Tage ohne Trip durchlaufen:
    return inBand(level) ? finishOutcome() /* win */
         : finishOutcome() /* finishOutcome liest zone → over/under automatisch */
  }
  showDayLabel(cfg.dayLabels[d])
  const slot = plan[d]
  let delta = cfg.deltaPerSlot[slot]                 // -8 | 0 | +10
  if (slot === 1 && prevWasGap) delta += cfg.recoveryBoost   // 0 -> +8 rebound
  const target = clamp(level + delta, 0, 100)
  const dist = Math.abs(target - level)
  const rate = Math.max(MIN_RATE, dist / (cfg.dayMoveMs / 1000))  // units per second
  prevWasGap = slot === 0
  level = target                                       // bookkeeping; engine is source of truth
  // moveAt awaits the settle; if onLevel trips on critical_high/low DURING the move,
  // it calls finishOutcome() itself and `then` never runs — playback stops at this day.
  moveAt(target, rate, () => {
    if (slot === 1 && !prevWasGap) pulse(cfg.dailyPulse)   // cosmetic ±2 (optional)
    setTimeout(() => playDay(d + 1), cfg.dayHoldMs)
  })
}
playDay(0)
```
- **Warum `rate` zwingend ist (Scoping/Hardware):** Default-Rate ≈ **4 u/s** (echte Pumpe).
  Ein `+10`-Move bei 4 u/s dauert `10/4 = 2.5 s`, ein `−8`-Move `2.0 s` — **nicht** die im
  Spec gewünschte `~1.0 s`. Für `dayMoveMs = 1000` braucht ein `+10`-Move
  `rate = 10 / 1.0 = 10 u/s`; ein `−8`-Move `rate = 8 u/s`. **Diese erhöhte Rate muss explizit
  per `setTarget(target, rate)` übergeben werden**, sonst läuft die Wiedergabe auf dem echten
  Torso 2–3× langsamer als am PC. **`MIN_RATE`** verhindert eine Null-Rate bei `delta = 0`
  (1-Pille-Tag: kein echter Move → kurzes `setTimeout`-Settle wie im bestehenden `moveTo`).
  **TODO 3:** auf der echten Pumpe messen, ob `10 u/s` mechanisch erreichbar ist; falls nicht,
  `dayMoveMs` erhöhen (z. B. `1500`) statt eine unerreichbare Rate zu fordern.
- **Abruptes Ende ist eingebaut, nicht zusätzlich zu coden:** `onLevel` (Zeile 102–108 in
  `game.svelte.ts`) ruft `finishOutcome()` selbst, sobald die Zone kritisch wird und die Phase
  in `PLAY_PHASES` ist — der `then`-Callback des Tages läuft dann nicht mehr, die Kette stoppt.
  Eine neue Play-Phase (z. B. `'playback'`) muss zu `PLAY_PHASES` hinzugefügt werden, damit der
  Auto-Trip greift.

### Was „korrekt" ist (Scoring der Authoring-Phase)
- **Perfekt (Stern „Sauberer Plan"):** `plan === [1,1,1,1,1,1,1]`, **erstes** Abspielen, **kein**
  Retry.
- **WIN, aber kein Plan-Stern:** Endlevel im Band `[55,70]` **und** während der Wiedergabe nie
  `≥80`/`≤35` gerissen — z. B. **eine** einzelne Lücke (dipt `−8`, erholt sich via `+8`).
- **LOSE Überdosis:** **irgendein** `2`-Tag, der den Kamm `≥80` treibt — insbesondere der
  **Trap-Plan** (Lücke + späteres Doppel; das Doppel aus einem erholten/vollen Spiegel
  `70 → 80` reißt; zwei Doppel `62→72→82` reißt). *Tuning so, dass ein **einzelnes** Doppel aus
  dem Steady State (`62 → 72`) bewusst **knapp unter** `80` bleibt (zeigt „zu viel" ohne Trip),
  aber Doppel-aus-vollem-Spiegel und Doppel-Doppel sicher reißen — siehe Crossing-Arithmetik &
  Tunables. Für deterministischen Trap-Verlust den Trap-Plan so anlegen, dass das Doppel auf
  einen vollen Tag folgt, oder `+10→+12`.*
- **LOSE Unterdosiert:** **so viele aufeinanderfolgende `0`-Tage**, dass der kumulierte
  Treppen-Abstieg `≤35` fällt — bei `−8`/Tag **ohne** Erholung ≈ **4 aufeinanderfolgende**
  Lücken (`62→54→46→38→30`, Trip an Tag 4).

### Wie sich das anfühlt
Der Spannungsbogen ist **„watch your own plan play out"** (der originellste Hook der fünf
Stories und der beste Fit zum *slow-pump-as-suspense*-Thema): man hat die Woche selbstbewusst
gebaut, drückt Play, und der **langsame** Torso enthüllt Tag für Tag die Folge — der „Nachhol"-
Doppel-Tag spitzt **sichtbar** hoch, der Zuschauer ahnt schon vor dem `80`-Riss, dass es kippt.
Die Langsamkeit der Pumpe ist hier kein Hindernis, sondern **erzeugt die Spannung** und macht
den Sägezahn lesbar.

---

## Accuracy (real drug + real interaction — no invention)
- **Wirkstoff:** **Lamotrigin** (Antiepileptikum / Stimmungsstabilisator), real als
  **einmal/zweimal tägliche** Dauertherapie mit dem Ziel eines **konstanten Wirkspiegels**.
- **Vergessene Dosen → Durchbruchsanfälle:** Non-Adhärenz bei Antiepileptika (AED) ist eine
  **dokumentierte Hauptursache** für Anfallsrezidive; ein konstanter Spiegel ist der
  Schutzmechanismus. (Konzept, kein erfundener Effekt.)
- **„Verpasste Dosis nicht verdoppeln":** **etikettierte, reale Anweisung** in der
  Fachinformation/Patienteninformation für Lamotrigin (und generell für AED) — eine ausgelassene
  Dosis wird **nicht** durch eine doppelte ersetzt; mit der üblichen Dosis weiterfahren.
  **→ Wortlaut FI-pflichtig, siehe Pre-build TODO 1.**
- **Re-Eskalation nach Pause → SJS/TEN-Risiko:** Lamotrigin trägt eine **reale Warnung**, dass
  nach einer **Einnahmeunterbrechung** die Erhaltungsdosis **nicht sofort** wieder aufgenommen,
  sondern **neu eintitriert** werden soll, weil ein **rascher Dosisanstieg** das Risiko
  **schwerer Hautreaktionen (Stevens-Johnson-Syndrom / toxische epidermale Nekrolyse)** erhöht.
  Dies ist die adult-only Differenzierung im Quiz. **→ ernste öffentliche Aussage; Wortlaut vor
  dem TdoT gegen die aktuelle FI prüfen (Pre-build TODO 1).**
- **Verdopplung → dosisabhängige Toxizität:** überhöhte Lamotrigin-Spiegel äußern sich real in
  **Ataxie, Doppelbildern (Diplopie), Schwindel, Sedierung** — die im Spiel als „zu viel"
  gezeigte Überdosis. **Eine einzelne Verdopplung ist dosisabhängig toxisch, aber i. d. R. nicht
  akut lebensbedrohlich** — das Spiel eskaliert daher **nicht** zu „tödlich" (junges Register
  sagt „gefährlich"/„kann schaden").
- **Keine Erfindung:** Es gibt keine Fremdsubstanz und keinen fiktiven Antidot; die „falschen"
  Antworten (verdoppeln, absetzen) sind **reale Patienten-Fehler**, nicht Fiktion. Die
  Engine-Zahlen sind eine **normalisierte Abstraktion** des Spiegels, kein klinischer mg-Wert.

---

## Distinctness (note — passes, but the closest pair in the set)
- **Verb:** *compose-then-watch* (turn-based authoring einer 7-Tage-Sequenz, **zero time
  pressure**) — distinkt von **Johanniskrauts** *react-under-pressure* (Echtzeit-Leck-Abwehr).
  Beide sind „zeit-aromatisiert", aber unterschiedliche Interaktions-Verben → **passt**.
- **Schutz-Empfehlung:** Falls aus Scope-Gründen ein Mechanik-Paar weiter differenziert werden
  muss, ist *dieses* + Johanniskraut das nächstliegende Paar. **Adhärenz daher bewusst rein
  turn-based halten** (keinerlei Timer/Drängen in der Plan-Phase — nur die *Wiedergabe* läuft
  zeitlich ab, und das ist passives Zuschauen, kein Spieler-Input) → maximaler Kontrast. Das
  ist bereits der Stand dieses Specs; **so beibehalten.**

---

## Assets
- **7-Tage-Dispenser-Strip (Mo–So):** als **CSS/SVG** (keine Bilddatei nötig) — sieben
  beschriftete Slots in einer Reihe, touch-große Drop-Zonen.
- **Pillen-Token:** **„1× Pille"** (neutral/weiß-blau) und **„2× Doppel"** (rot getönt) — als
  SVG-Komponente; alternativ zweimal das 1×-Token = Slot `2`.
- **Tag-Ticker / Sprechblase:** Label „Mo … So" + kleine Status-Blase am Torso während der
  Wiedergabe (CSS).
- **Optional (nice-to-have):** ein **Wochendosierer-Foto** (echte Pillen-Wochenbox) von
  **Wikimedia Commons (CC)** für die Briefing-Karte — Lizenz + Urheber in `docs/assets/CREDITS`
  vermerken (wie bei den Frucht-Fotos).
- **Kein Audio/keine neuen Fonts erforderlich.**
- **i18n:** alle Strings über `t('key')` in `frontend/src/lib/locale.svelte.ts` (DE-first,
  Fallback DE); Tag-Labels Mo–So sind ebenfalls i18n-Keys (für EN/NL/AR später; AR = RTL, der
  Strip muss in `dir=rtl` **von rechts nach links** laufen → logische CSS-Properties verwenden).

---

## Tunables (for feel)
- **`deltaPerSlot`** `{0:-8, 1:0, 2:+10}` — Kernregler (retuned). **`+10`** so gewählt, dass ein
  Einzel-Doppel aus dem Band (`62 → 72`) **sichtbar überschießt, aber knapp unter `80` bleibt**
  (kein Trip), während Doppel-aus-vollem-Spiegel (`70 → 80`) und Doppel-Doppel (`62→72→82`)
  sicher `≥80` reißen. Höher (`+12`) = jedes Doppel aus dem Band reißt → leichter zu verlieren /
  schärferer Trap.
- **`-8`/Tag** + **kein Erholungs-Boost zwischen zwei `0`-Tagen** bestimmt, nach wie vielen
  Lücken die Unterdosis (`≤35`) greift: bei `−8` ≈ **4 in Folge** (`62→54→46→38→30`). `−9`/Tag =
  schon **3** in Folge. Tiefer = schneller verloren.
- **`recoveryBoost`** `+8` auf einem `1`-Tag **direkt nach** einem `0`-Tag → eine *einzelne*
  Lücke federt vollständig zurück (`54 → 62`). **Open-Question geklärt: AN** — damit die Lektion
  „eine Lücke? einfach normal weitermachen" sauber ankommt und die einzigen Verluste *wiederholte*
  Lücken (Unter) oder ein Doppel (Über) sind. Auf `0` setzen, wenn schon eine einzelne Lücke ein
  Beinahe-Verlust sein soll (nicht empfohlen).
- **Wiedergabe-Tempo** `dayMoveMs`/`dayHoldMs` → die per-Tag-`rate` wird daraus berechnet
  (`rate = |delta| / (dayMoveMs/1000)`, units/s). `~1.0 s` Move + `~0.4 s` Halt; Gesamtdauer
  ≤ `~12 s` für 7 Tage. **Auf dem echten Torso messen** (TODO 3): erfordert bis `~10 u/s`; falls
  die Pumpe das nicht schafft, `dayMoveMs` erhöhen statt eine unerreichbare Rate zu fordern.
- **`dailyPulse`** `±2` rein kosmetisch (zeigt „lebendigen" Steady State); auf `0` setzbar.
- **Trap-Schärfe:** ob der **Trap-Plan** (Lücke + späteres Doppel) garantiert `≥80` reißt, hängt
  am Startniveau des Doppel-Tags. **Geklärt:** Trap **deterministisch** verlieren lassen (klare
  Lektion) — entweder Plan-Vorlage so legen, dass das Doppel auf einen erholten/vollen Tag folgt,
  oder `+10→+12`. Empfehlung: deterministisch für die Lehraussage.
- **Slot-Anzahl:** `7` (eine Woche) ist die natürliche Einheit; auf `5` (Schulwoche) kürzbar,
  falls die Wiedergabe zu lang wirkt.
```