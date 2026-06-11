# Die Frühstücks-Falle — Torso-first redesign

_Story id: `fruehstuecks-falle`_

> **Herrn Schmidts Spiegel klettert von selbst Richtung roter Marke — und du findest den Schuldigen, indem du das Frühstück Stück für Stück WEGNIMMST und am Wasser abliest: nur die Grapefruit lässt den Spiegel zurückfallen, alles andere lässt den Torso eiskalt stehen.**

## Signature mechanic

WEGNEHMEN-UND-DAS-WASSER-LESEN. Eine Hypothese pro Hub: der Spieler hebt Frühstücks-Teile EINZELN vom Tablett — bei einem Unschuldigen rührt sich die Pumpe bewusst NICHT (sofort „harmlos, weiter suchen"), nur beim Wegnehmen der Grapefruit reist das Wasser langsam zurück ins Grün. Subtraktion als Diagnose, gelesen an Stillstand vs. Bewegung. Es gibt KEIN Sortier-, Verbinde- oder Multiple-Choice-Quiz; der einzige Verb ist Herausnehmen und das echte Wasser deuten.

## The torso is the star

Jeder Erkenntnisschritt ist eine Wasserbewegung, nie ein Textfeld. (1) Standarddosis: Wasser steigt 40->62 ins Grün — der Spieler lernt das Band am echten Tank lesen. (2) Drift: das Wasser KRIECHT von selbst 62->76 Richtung roter Marke, der Screen sagt nur „Schau auf den Körper" — die Drift IST die Bedrohung, kein Reveal-Kasten. (3) Detektiv: falsches Teil weg = Pumpe STEHT (Stillstand = unschuldig), Grapefruit weg = Wasser reist 76->62 zurück (Täter überführt). (4) Mechanismus als Tank-Demo: eine Grapefruit zurück aufs Tablett -> Wasser staut sich wieder 62->72 hoch („das Aufräum-Enzym ist blockiert, schau, es staut sich"), wieder weg -> es sinkt. Das „Warum" ist ein Körper-Ereignis. (5) Strategie: die Wahl SELBST bewegt das Wasser — „erhöhen" jagt es über die rote Marke (Verlust im onSettle), „weglassen" lässt es sanft ruhen, „zeitversetzt" lässt den Torso demonstrativ STEHEN. (6) Assay-Finale: ein einziger dramatischer Beweis-Hub — die drei markierten Inhibitoren treiben das Wasser hart Richtung Rot, sichere Früchte lassen es ruhen.

## Stillness moment (stillness = information)

Zwei Stillstände tragen je eine Lektion. (A) Detektiv: nimmt der Spieler Apfel, Birne, Kaffee oder das Joggen weg, ruft die App KEIN driveTo auf — das Wasser bleibt stur bei ~76, dazu sofort der feste Cue „Wasser rührt sich nicht — war's nicht, weiter suchen". Nicht-Bewegung IST die Antwort: Stillstand = unschuldig. (B) Strategie „zeitversetzt einnehmen": die Pumpe fährt bewusst NICHT (kein driveTo, Feedback erscheint an Ort und Stelle wie GenePlays retry-pick) — der ruhige Torso sagt „bringt nichts, die Hemmung hält tagelang an", ohne dass eine Zahl fällt. In beiden Fällen ist das Ausbleiben der Bewegung die eigentliche Botschaft.

## Read-the-body decision

Im Detektiv-Beat trifft der Spieler die Diagnose AUSSCHLIESSLICH durch Lesen des Wassers: gleiche Bildschirmaktion (ein Teil antippen = wegnehmen), aber je nach Teil bleibt der Torso still (harmlos) oder reist sichtbar nach unten (Täter). Es steht keine Zahl auf dem Schirm — nur „rührt sich das Wasser oder nicht?". Erst wenn der Spieler am fallenden Wasser erkennt, dass die Grapefruit der Auslöser ist, schaltet der Beat weiter. Die Antwort wohnt am Körper, nicht im Screen.

## The twist

Der „Mehr hilft mehr"-Reflex ist hier rückwärts gefährlich: bei gehemmtem Abbau treibt schon die GLEICHE Dosis den Spiegel weiter, und „Dosis erhöhen" schießt das Wasser über die rote Marke (Verlust). Die RETTENDE Handlung bewegt das Wasser gar nicht nach oben — sie lässt es von selbst FALLEN bzw. ruhig im Band ruhen (Grapefruit weg). Plus der Assay-Twist am Finale: nicht jede Zitrusfrucht zuckt — Orange, Mandarine und Zitrone lassen den Torso eiskalt stehen, obwohl sie zitrusartig aussehen; nur Grapefruit, Pomelo und Bitterorange treiben das Wasser über die Marke.

## Stages

| # | Stage | Player action | Torso (pump) | Scored |
|---|---|---|---|:--:|
| 0 | 0 · Briefing | Liest Herrn Schmidts Fall (Simvastatin gegen Cholesterin), tippt „Los geht's“ | STILL bei baseline ~40 (unter dem Band) — Startzustand, kein Move. onMount setzt nur den Ausgangspegel. |  |
| 1 | 1 · Standarddosis (Tutorial-Füllung) | Tippt „Standarddosis geben“ und schaut auf den Torso | driveTo 40->62, rate ~5 — Wasser steigt sichtbar in den grünen Streifen, settle bei ~62. Echter Move, kein No-op. |  |
| 2 | 2 · Das Frühstück (die Drift) | Liest die kurze Frühstücksszene, tippt „Weiter“ — Screen zeigt nur „Schau auf den Körper!“ | driveTo 62->76, rate ~4 langsam-suspense — Wasser KRIECHT hoch Richtung roter Marke, cappt bei 76 (unter 80, kein Trip). Die Drift läuft von selbst. |  |
| 3 | 3 · Detektiv — Lift-to-test (Teller abräumen) | Hebt Frühstücks-Teile einzeln weg (Apfel, Birne, Kaffee, Joggen, Grapefruit) und liest den Tank; bei jedem Tap entscheidet Stillstand vs. Bewegung | Unschuldiges Teil: KEIN driveTo — Wasser bleibt bei ~76, fester Screen-Cue „Wasser rührt sich nicht — war's nicht“ (in-place, Beat bleibt offen, wie GenePlays retry-pick). Grapefruit weg: driveTo 76->62, rate ~4 — Wasser reist langsam zurück in Grün, Beat schaltet weiter. | ★ |
| 4 | 4 · Mechanismus als Tank-Demo (statt Lesetext) | Tippt „Was hat die Grapefruit gemacht?“; legt die Grapefruit testweise zurück, beobachtet, nimmt sie wieder weg | Grapefruit zurück: driveTo 62->72, rate ~4 — Wasser staut sich wieder hoch, Copy „das Aufräum-Enzym ist blockiert — schau, es staut sich“. Wieder weg: driveTo 72->62 — Wasser ebbt zurück. Caps bei 72 (kein Trip). |  |
| 5 | 5 · Strategie — die Wahl bewegt das Wasser (Tank antwortet sofort) | Wählt direkt: Grapefruit weglassen / zeitversetzt einnehmen / Dosis erhöhen / Dosis senken (nur adult). Der Tap startet sofort die Wasserantwort, die kurze „genau/nein, weil…“-Zeile läuft WÄHREND der Bewegung | Start des Beats bei ~62 (kein Drift-zurück-Round-Trip). Pro Wahl ein direkter Move bzw. Nicht-Move: siehe Beats 6a–6d. Grammatik Regel 4: Hypothese antippen -> der Tank antwortet, kein Zwischen-Screen. |  |
| 6 | 6a · zeitversetzt einnehmen (Stillstand-Falle → Retry) | Hat „zeitversetzt“ getippt; sieht den ruhigen Torso, tippt „andere Idee“ | KEIN driveTo — Wasser rührt sich NICHT, bleibt auf ~62. In-place Cue „Pumpe steht — Timing löst die Hemmung nicht (sie hält tagelang an)“. Beat kehrt zur Strategie zurück. |  |
| 7 | 6b · Dosis erhöhen (Twist → LOSS Überdosis) | Hat „Dosis erhöhen“ getippt; schaut auf den Torso | driveTo Richtung ~88 (overTarget, > critical_high 80), rate ~4 — Wasser steigt über die rote Marke. KEINE Engine-Auto-Trip-Annahme: der Verlust wird im onSettle gesetzt (outcome='over'), exakt wie GenePlay/DdiPlay/WochePlay den 'over'-Fall behandeln. |  |
| 8 | 6c · Dosis senken (adult → ehrlicher Unsicherheits-Drift, KEIN garantierter Unter-Loss-Wochenlauf) | Hat „Dosis senken“ getippt; schaut auf den Torso, der NICHT sauber zur Ruhe kommt | EIN einzelner unruhiger Drift (kein Tag-für-Tag-Wochenlauf): driveTo 62->58 dann ->67 dann ->54, settle außerhalb des Bands. Caps zwischen ~50 und ~72 (kein Trip in beide Richtungen). |  |
| 9 | 6d · Grapefruit weglassen (WIN-Pfad) | Hat „Grapefruit weglassen“ getippt und schaut auf den Torso | Wasser kommt vom Detektiv schon aus ~62; ein sanfter Bestätigungs-Move (z.B. 62->63->62, rate ~4) zeigt, dass es stabil im Band ruht. Kein Hochtreiben. |  |
| 10 | 7 · Furanocumarin-Assay — EIN Beweis-Hub (nur WIN-Pfad) | Markiert auf dem Screen, welche der 6 Früchte er für gefährlich hält (Grapefruit/Pomelo/Bitterorange vs. Orange/Mandarine/Zitrone); tippt dann „Beweisen“ | Wasser ruht stabil in Grün ~62. EIN einziger dramatischer Hub statt 6 Twitches: nach dem Commit fährt die Pumpe das Wasser hart Richtung rote Marke (driveTo ~62->78, rate ~4) und cappt knapp unter 80 — „diese drei würden dich über die Marke treiben“. Sichere Früchte tragen nichts bei. Der Beweis lebt am Wasser, nicht an der Screen-Liste. | ★ |
| 11 | 8 · Outcome / Debrief | Liest Ergebnis + 2 Merksätze; „Nochmal“ oder „Geschichten“ | Hält den Endzustand: WIN ~62 im Grün · Überdosis ~88 über der roten Marke · (adult) Senken-Unsicherheit irgendwo außerhalb des Bands. |  |

## End states

- **win** — „Grapefruit weglassen“ → Wasser ruht stabil im grünen Band; danach Furanocumarin-Assay mit einem Beweis-Hub. Stars: 1 (win) + clever (Detektiv ohne Fehlhub = +1, mit einem stillen Fehlgriff = +0,5) + pro (Assay alle 3 Inhibitoren richtig markiert = +1, ein Fehler = +0,5).
  - _Torso:_ settle ~62 in Grün — Spiegel im therapeutischen Fenster, ruhig
- **over** — „Dosis erhöhen“ → mehr Substrat bei gehemmtem Abbau treibt das Wasser über die rote Marke. Verlust = 0 Sterne.
  - _Torso:_ driveTo Richtung ~88 (over critical_high 80); outcome='over' im onSettle gesetzt (NICHT per Engine-Auto-Trip, der in play2 nicht feuert)
- **under** — „Dosis senken“ (nur adult) → bei schwankender Hemmung kommt das Wasser nicht stabil zur Ruhe und settled außerhalb des Bands. Verlust = 0 Sterne. Ein einzelner unsicherer Drift, KEIN Wochen-Tageslauf.
  - _Torso:_ wackelt 62->58->67->54 und settled außerhalb des Bands (z.B. ~54 unter band_low, über crit-low 35, kein Trip) — Titration unzuverlässig, Spiegel nicht kontrolliert

## Learnings — young

- Grapefruit bremst das „Aufräum-Enzym“ im Bauch — dann bleibt zu viel von der Tablette im Körper, und der Wasserstand klettert von selbst zu hoch.
- Nicht jede saure Frucht macht das! Nur Grapefruit, Pomelo und Bitterorange. Apfel, Birne, Kaffee, Orange, Mandarine und Zitrone sind harmlos.
- Mehr Tablette ist hier keine Lösung — sie wird gefährlich. Das Beste: einfach die Grapefruit weglassen, dann bleibt der Spiegel von allein im Grünen.
- Steht das Wasser still, wenn du etwas wegnimmst, war's das nicht. Bewegt es sich, hast du den Übeltäter gefunden.

## Learnings — adult

- Grapefruit hemmt intestinales CYP3A4 → Simvastatin kumuliert → Spiegel und Myopathie-/Rhabdomyolyse-Risiko steigen, obwohl die Dosis gleich bleibt.
- Wirkstoffe sind Furanocumarine (z. B. Bergamottin, 6',7'-Dihydroxybergamottin); enthalten in Grapefruit, Pomelo, Bitterorange — nicht in Süßorange, Mandarine, Zitrone. „Zitrus“ allein sagt nichts.
- Die Hemmung hält Tage an und die Menge pro Glas schwankt → zeitlicher Abstand hilft nicht, und Dosis-Titration ist unzuverlässig (kann nach oben ODER unten kippen). Realer Fix: Grapefruit absetzen oder auf ein Nicht-CYP3A4-Statin wechseln.
- Dosis erhöhen bei gehemmtem Abbau = toxischer Spiegel; Dosis senken bei schwankender Hemmung = unkontrollierbarer Spiegel. Kausal-Ursache eliminieren, nicht den Spiegel jagen.

## Scoring

0–3 Sterne in 0,5-Schritten via stars(win, clever, pro) — identisch zur flow.ts-Signatur. Jeder Verlust (Überdosis/Senken-Unsicherheit) = 0 Sterne. Win = 1,0 Basis-Stern (Spiegel im grünen Band über den „weglassen“-Pfad). CLEVER-Bonus (0/0,5/1): Detektiv-Lift-to-test ohne Fehlhub gelöst → +1; mit genau einem stillen Fehlgriff (ein unschuldiges Teil zuerst weggenommen) → +0,5; mehrere Fehlgriffe → +0. PRO-Bonus (0/0,5/1): Furanocumarin-Assay vor dem Beweis-Hub korrekt markiert (alle 3 Inhibitoren, keine sichere Frucht falsch) → +1; genau ein Fehler → +0,5; zwei+ Fehler → +0. So: makellos = 3,0 „SafePolyMed-Meister/Klinische:r Pharmazeut:in“; ein kleiner Patzer = 2,5; knapper Win = 1,0 „Apotheken-Azubi/Pharmazie-Azubi“. Die „zeitversetzt“-Falle ist reiner Retry und kostet keinen Stern. Implementierung: die v2-Komponente führt clever/pro lokal als $state wie GenePlay/DdiPlay, statt sich auf das v1-game.svelte.ts-score-Objekt zu verlassen.

## Distinctness

Der Signatur-Verb ist WEGNEHMEN-UND-DAS-WASSER-LESEN (Lift-to-test-Elimination am Tablett, Diagnose per Stillstand vs. Bewegung). Beide alten Kollisionen sind aufgelöst: (1) Der „Variabilitäts-Woche“-Tagesablauf ist GESTRICHEN — der Senken-Pfad ist jetzt ein EINZELNER unsicherer Wackel-Drift, kein Tag-für-Tag-Wochenlauf, der Johanniskrauts Lane (THE SLOW LEAK OVER A WEEK, 62->47 über 7 Tage) nachgeahmt hätte. (2) Das Finale ist KEIN select-and-confirm-Sort mehr (das wäre DDIs Bin-Sort / Genes Predict-and-Sort): das Markieren ist nur Vorstufe; die eigentliche Mechanik und Pointe ist der EINE physische Beweis-Hub am Körper. Kein Verschieben/Sortieren (DDI), kein Verbinden (PairLink), kein Multiple-Choice-Emoji-Quiz, kein Wochenplan-Sägezahn (Adhärenz), kein Wochen-Leck (Johanniskraut), keine Gen-Triptychon-Vorhersage (Gene). Alleinstellung: physisches HERAUSNEHMEN einzelner Verdächtiger und Diagnose per Stillstand-vs.-Bewegung des realen Wassers — Subtraktion als Mechanik.

## Buildability

Baut 1:1 auf dem v2-Muster (DdiPlay/GenePlay/WochePlay): eigenes beat-State-Machine in play2, driveTo(target, rate, onSettle) pro Move, EndScreen + stars(win, clever, pro). KRITISCH GEFIXT: (1) AUTO-TRIP feuert in play2 NICHT — onLevel triggert nur für PLAY_PHASES (game.svelte.ts Z.114-125), und v2-Komponenten laufen in play2. Der Überdosis-Verlust wird NICHT der Engine überlassen, sondern im onSettle gesetzt (driveTo ~88 → im then outcome='over'), genau wie GenePlay/DdiPlay den 'over'-Fall selbst routen (GenePlay Z.53-57). (2) STILLNESS-No-op: driveTo(target) mit |target-cur|<1 feuert den Callback nach 450ms OHNE Bewegung (Z.75-79) — würde den Beat still weiterschalten. Daher rufen unschuldige Detektiv-Taps und die „zeitversetzt“-Falle GAR KEIN driveTo auf; sie setzen nur in-place-Feedback und lassen den Beat offen, exakt wie GenePlays pick()-retry (Z.44-52). (3) ASSAY-PACING: statt 6 langsamer +3/-3-Twitches (~18 s zähes Gekrieche auf ~4 u/s) genau EIN dramatischer Beweis-Hub (driveTo ~62->78) — die schon in der alten buildability angedeutete Escape-Hatch, jetzt verbindlich. (4) SEQUENZ-DRAG entschärft: der „drift zurück auf 76 vor der Strategie“-Round-Trip ist gestrichen — die Strategie startet bei ~62, die Wahl bewegt das Wasser direkt. Konkrete Moves passen zu den Engine-Zahlen (band 55–70, crit_high 80, crit_low 35, baseline 40): 40->62, 62->76, 76->62, 62->72->62 (Demo), 62->88 (over, im onSettle), 62->78 (Assay-Beweis). Reset zwischen Runs zieht den Tank via backToStories/retry auf baseline 40 (auf echter Hardware langsam, vorhanden). KEIN On-Screen-Mini-Tank — GenePlays reveal-Minibar (Z.90-103) wird hier bewusst NICHT kopiert. Keine zwei gleichzeitigen Pumpenmoves.

## Copy tone

DE-Copy in zwei Registern. young: warm/konkret, kurze Sätze, Bilder statt Fachbegriffe („Aufräum-Enzym im Bauch“, „der Wasserstand klettert“), Emojis sparsam, die „Dosis senken“-Option ist für Kinder versteckt (nur 3 Wahlmöglichkeiten, wie GenePlay/DdiPlay adultOnly-Optionen filtern). adult: präzise mit echten Begriffen (CYP3A4, Furanocumarine, Bergamottin/DHB, Rhabdomyolyse, therapeutisches Fenster), alle 4 Optionen sichtbar. Jede Strategie-Wahl wird WÄHREND der Wasserbewegung mit einer kurzen „genau, weil…“ / „nein, weil…“-Zeile begleitet — nicht als separater Screen davor. ENTSCHEIDEND: der Screen zeigt KEINEN Mini-Tank und KEINE Zahl, sondern schickt die Augen aktiv zur Hardware — feste Sätze wie „Schau auf den Körper / den Torso!“ in Drift-, Detektiv-, Mechanismus- und Assay-Beats; im Detektiv zusätzlich der sofort-lesbare Stillstand-Cue „Wasser rührt sich nicht — war's nicht, weiter suchen“, damit der langsame Nicht-Move nicht als hängendes Spiel missverstanden wird. Texte kurz halten, damit der Blick am Wasser bleibt.

## Open questions

- Soll der Mechanismus-Demo-Hub (62->72->62) für einen schnelleren Open-Day-Durchlauf optional überspringbar sein, oder ist die langsame Pumpe (~4 u/s, ~5 s) als bewusster Aha-Moment akzeptabel?
- Beim adult-Senken-Pfad: settled der unsichere Drift bevorzugt knapp UNTER dem Band (deterministischer 'under'-Outcome fürs EndScreen) oder soll der Ausgang selbst über/unter kippen können? Determinismus ist fürs Scoring/EndScreen einfacher, aber 'kann beides' ist medizinisch ehrlicher.
- Reicht ein einzelner Wackel-Drift im Senken-Pfad visuell, um 'unzuverlässig' zu vermitteln, ohne einen Wochen-Tageslauf vorzutäuschen?
- Soll der 'over'-Pfad knapp unter 80 anhalten und erst ein finaler Settle-Move über 80 schießen (dramatischeres rotes Überfahren), oder direkt auf ~88 zielen?
