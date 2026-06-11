// German-first i18n. Reactive current locale; t() falls back to German for any
// key (and for whole locales) that isn't translated yet.
// Per-story copy lives in stories/<id>.locale.ts and is spread into `de` below
// (last-spread-wins → these OVERRIDE any older inline <id>.* block left above).
import { ddiLocale } from './stories/ddi.locale'
import { geneLocale } from './stories/gene.locale'
import { adherenceLocale } from './stories/adherence.locale'
import { organLocale } from './stories/organ.locale'
import { johanniskrautLocale } from './stories/johanniskraut.locale'

type Params = Record<string, string | number>

export type Locale = 'de' | 'en' | 'fr' | 'nl' | 'ar'

// `hello` is the greeting each language tile shouts on the start screen — it is
// per-language (the German tile always says „Hallo!"), so it lives here and not
// in the t() dictionaries.
export const LOCALES: { id: Locale; name: string; hello: string }[] = [
  { id: 'de', name: 'Deutsch', hello: 'Hallo!' },
  { id: 'en', name: 'English', hello: 'Hello!' },
  { id: 'fr', name: 'Français', hello: 'Salut !' },
  { id: 'nl', name: 'Nederlands', hello: 'Hoi!' },
  { id: 'ar', name: 'العربية', hello: 'مرحباً!' },
]

export type Age = 'young' | 'adult'

// `age` lets a single key carry two registers: t('foo') prefers 'foo.{age}'
// (warm/simple for kids, precise/clinical for adults) and falls back to 'foo'.
export const i18n = $state({ locale: 'de' as Locale, age: 'young' as Age })

export function setLocale(l: Locale): void {
  i18n.locale = l
}
export function setAgeLocale(a: Age): void {
  i18n.age = a
}

const de: Record<string, string> = {
  'app.title': 'SafePolyMed',
  'app.subtitle': 'Bring deinen Patienten sicher durch!',

  // start screen
  'start.lang': 'Sprache',
  'start.age': 'Wer spielt?',
  'age.young': 'Kinder & Jugendliche',
  'age.adult': 'Erwachsene',
  'start.go': "Los geht's",
  'start.credit': 'SafePolyMed · EU-Forschungsprojekt · Klinische Pharmazie, Universität des Saarlandes',

  // story select
  'stories.title': 'Wähle eine Geschichte',
  'stories.soon': 'bald verfügbar',
  'common.back': 'Zurück',
  'common.next': 'Weiter',
  'common.retry': 'Nochmal',
  'common.cancel': 'Abbrechen',

  // story cards (title + short blurb)
  'story.grapefruit.title': 'Die Frühstücks-Falle',
  'story.grapefruit.desc': 'Cholesterin senken – aber Vorsicht beim Frühstück. (Nahrung)',
  'story.johanniskraut.title': 'Das pflanzliche Leck',
  'story.johanniskraut.desc': 'Johanniskraut lässt den Transplantat-Schutz auslaufen. (Pflanze/Arznei)',
  'story.gene.title': 'Drei Körper, eine Pille',
  'story.gene.desc': 'Gleiche Pille, drei Körper – das Gen entscheidet. (Gen-Wechselwirkung)',
  'story.ddi.title': 'Die Blut-Balance',
  'story.ddi.desc': 'Neues Antibiotikum trifft auf Blutverdünner. (Wechselwirkung)',
  'story.organ.title': 'Der müde Filter',
  'story.organ.desc': 'Die Niere wäscht die Medizin langsamer aus – dieselbe Dosis staut sich höher.',
  'story.organ.desc.adult': 'Sinkt die eGFR, sinkt die renale Clearance – dieselbe Dosis kumuliert.',
  'story.adherence.title': 'Der Wochen-Pillenplan',
  'story.adherence.desc': 'Bau Lenas Woche – halt den Rhythmus. (Regelmäßigkeit als Therapie)',

  // reset / prepare
  'reset.title': 'Patient wird vorbereitet …',
  'reset.sub': 'Der Spiegel wird zurückgesetzt.',
  'reset.eta': 'noch etwa {s} s',
  'reset.almost': 'gleich fertig …',

  // band + bar
  'band.explain': 'Grüner Bereich = sicher · zu wenig wirkt nicht · zu viel ist gefährlich',
  'bar.title': 'Spiegel',

  // patient + drug
  'p.schmidt.name': 'Herr Schmidt',
  'p.schmidt.line': 'Herr Schmidt, 68 – zu hohes Cholesterin',
  'p.schmidt.line.young': 'Herr Schmidt, 68 – sein Blut hat zu viel Fett (Cholesterin).',
  'p.schmidt.line.adult': 'Herr Schmidt, 68 – erhöhtes Cholesterin (Hypercholesterinämie).',
  'd.simvastatin': 'Simvastatin',
  'briefing.goal': 'Stell {name} mit {drug} sicher ein – bring den Spiegel in den grünen Bereich.',
  'briefing.goal.young':
    'Hilf {name}! Gib ihm sein Medikament {drug} so, dass der Spiegel genau im grünen Bereich landet – nicht zu wenig und nicht zu viel.',
  'briefing.goal.adult':
    'Stell {name} mit {drug} therapeutisch sicher ein: Der Wirkstoff-Spiegel soll im grünen Fenster liegen – darunter wirkt es nicht, darüber drohen Nebenwirkungen.',

  // dose — the opening is a guided tutorial: give the standard dose, watch the
  // torso rise into the green window (teaches the window; not a graded choice).
  'dose.startTitle': 'Erste Einstellung',
  'dose.startPrompt': '{name} bekommt die Standarddosis {drug}.',
  'dose.startPrompt.young':
    '{name} bekommt sein Medikament {drug}. Schau, wie der Spiegel langsam in den grünen Bereich steigt!',
  'dose.startPrompt.adult':
    '{name} wird neu auf {drug} eingestellt – mit der üblichen Standarddosis.',
  'dose.give': 'Standarddosis geben',
  'dose.rising': 'Der Spiegel steigt …',
  'timejump': 'Eine Woche später …',

  // knowledge
  'opt.up': 'steigt ⬆',
  'opt.down': 'sinkt ⬇',
  'opt.none': 'bleibt gleich',
  'q.correct': 'Richtig!',
  'q.wrong': 'Nicht ganz …',

  // 5-band reveal („die Überraschung")
  'reveal.way_low': 'Viel zu wenig',
  'reveal.low': 'Zu wenig',
  'reveal.in': 'Genau richtig 🟢',
  'reveal.high': 'Zu viel ⚠️',
  'reveal.way_high': 'Viel zu viel 🛑',
  'reveal.way_low.sub': 'Der Spiegel ist viel zu niedrig – das Medikament wirkt nicht.',
  'reveal.low.sub': 'Knapp unter dem grünen Bereich – es wirkt noch zu schwach.',
  'reveal.in.sub': 'Im grünen Bereich – {name} ist gut eingestellt!',
  'reveal.high.sub': 'Über dem grünen Bereich – jetzt drohen Nebenwirkungen.',
  'reveal.way_high.sub': 'Gefährlich hoch – so wird es giftig!',
  'reveal.redose': 'Nochmal dosieren',

  // detective: which of the morning's items raised the level?
  'detect.prompt': 'Was hat den Wirkstoff-Spiegel steigen lassen?',
  'detect.prompt.young': 'Detektiv-Frage: Was hat den Spiegel steigen lassen?',
  'detect.apfel': '🍎 Der Apfel',
  'detect.birne': '🍐 Die Birne',
  'detect.kaffee': '☕ Der Kaffee',
  'detect.grapefruit': '🍊 Der Grapefruitsaft',
  'detect.jog': '🏃 Das Joggen',
  'detect.tired': '😴 Müde von der Arbeit',
  // per-item feedback (always say why)
  'detect.fb.grapefruit': 'Richtig erkannt – die Grapefruit war’s!',
  'detect.fb.grapefruit.adult': 'Korrekt – der Grapefruitsaft.',
  'detect.fb.apfel': 'Nein – ein Apfel ist harmlos. Denk an die Grapefruit!',
  'detect.fb.apfel.adult': 'Nein – Apfel beeinflusst den Abbau nicht.',
  'detect.fb.birne': 'Nein – eine Birne ist harmlos. Denk an die Grapefruit!',
  'detect.fb.birne.adult': 'Nein – Birne beeinflusst den Abbau nicht.',
  'detect.fb.kaffee': 'Nein – Kaffee macht hier keinen Ärger.',
  'detect.fb.kaffee.adult': 'Nein – Kaffee ist hier unkritisch.',
  'detect.fb.jog': 'Nein – Joggen ist sogar gut fürs Herz!',
  'detect.fb.jog.adult': 'Nein – körperliche Aktivität ist nicht das Problem.',
  'detect.fb.tired': 'Nein – Müdigkeit verändert den Spiegel nicht.',
  'detect.fb.tired.adult': 'Nein – Müdigkeit hat keinen Einfluss auf den Spiegel.',

  // decision / strategy
  'dec.prompt': 'Wie reagierst du?',
  'dec.prompt.young': 'Was tust du jetzt?',
  'dec.reduce': 'Dosis senken',
  'dec.stopGrapefruit': 'Grapefruit weglassen',
  'dec.askPro': 'Apotheke/Arztpraxis fragen',
  'dec.spaceOut': 'Grapefruit & Tablette zeitversetzt einnehmen',
  'dec.increase': 'Dosis erhöhen',
  // per-choice feedback (always say why)
  'dec.fb.stopGrapefruit': 'Genau – ohne Grapefruit sinkt der Spiegel wieder. Der sauberste Weg!',
  'dec.fb.stopGrapefruit.adult':
    'Richtig – Grapefruit absetzen; das Enzym erholt sich, der Spiegel normalisiert sich. Bevorzugte Lösung.',
  'dec.fb.askPro':
    'Sehr gut – bei einer möglichen Wechselwirkung nicht selbst an der Dosis drehen. Apotheke oder Arztpraxis prüfen die Medikation. In diesem Fall lautet die sichere Lösung: Grapefruit weglassen; alternativ kann ärztlich ein weniger CYP3A4-abhängiges Statin geprüft werden.',
  'dec.fb.reduce': 'Mal sehen … aber Vorsicht: die Grapefruit-Menge schwankt von Tag zu Tag.',
  'dec.fb.reduce.adult':
    'Senkt den Spiegel zwar – aber bei schwankender Grapefruit-Menge ist die Hemmung unberechenbar. Riskant.',
  'dec.fb.spaceOut': 'Bringt leider nichts – die Grapefruit wirkt noch tagelang nach. Versuch’s nochmal.',
  'dec.fb.spaceOut.adult':
    'Wirkungslos – die CYP3A4-Hemmung hält Tage an; zeitlicher Abstand hilft nicht. Nochmal.',
  'dec.fb.increase': 'Gefährlich! Noch mehr Wirkstoff – jetzt wird es giftig für die Muskeln.',
  'dec.fb.increase.adult':
    'Gefährlich – mehr Substrat bei gehemmtem Abbau → toxischer Spiegel, Rhabdomyolyse-Risiko.',

  // 5b — variability (only after „Dosis senken")
  'var.story': 'Mal trinkt Herr Schmidt ein großes Glas Grapefruit, mal ein kleines – mal gar keins. Die Menge schwankt …',
  'var.story.adult':
    'Im Wochenverlauf schwankt die getrunkene Grapefruit-Menge – und damit die Stärke der CYP3A4-Hemmung. Bei fest gesenkter Dosis schwankt der Spiegel mit.',

  // event — a loaded breakfast (the culprit is hidden among harmless items)
  'ev.grapefruit.story':
    'Wochenlang läuft alles super! Doch eines Morgens, nach dem Joggen, frühstückt Herr Schmidt kräftig: Müsli mit Apfel und Birne, dazu ein Kaffee und ein großes Glas Grapefruitsaft.',
  'ev.grapefruit.story.young':
    'Wochenlang läuft alles super! 🎉 Doch eines Morgens, nach dem Joggen, frühstückt Herr Schmidt so richtig: Müsli mit Apfel und Birne, dazu ein Kaffee und ein großes Glas Grapefruitsaft.',
  'ev.grapefruit.story.adult':
    'Über Wochen ist Herr Schmidt stabil eingestellt. Eines Morgens – nach dem Joggen – frühstückt er ausgiebig: Müsli mit Apfel und Birne, ein Kaffee und ein großes Glas Grapefruitsaft.',
  // bridge (after the detective reveals the grapefruit): name it + set up the med-check
  'ev.grapefruit.bridge.title': 'Grapefruit gefunden!',
  'ev.grapefruit.bridge.title.adult': 'Grapefruit identifiziert',
  'ev.grapefruit.lesson':
    'Genau – Grapefruit! 🍊 Aber wichtig: Grapefruit macht nicht jedes Medikament gefährlich. Sie blockiert eine bestimmte Abbau-Route im Darm. Simvastatin benutzt genau diese Route – deshalb staut es sich.',
  'ev.grapefruit.lesson.adult':
    'Korrekt – Grapefruit. Die Interaktion betrifft nicht alle Arzneistoffe, sondern vor allem Wirkstoffe, die stark von intestinalem CYP3A4 abhängen. Simvastatin ist hier ein gutes Beispiel: Wird CYP3A4 gehemmt, steigt die Wirkstoffexposition.',
  'ev.grapefruit.bridge.btn': 'Welche Medizin ist betroffen?',
  'ev.grapefruit.bridge.btn.adult': 'Medikamenten-Check',

  // Medikamenten-Check: grapefruit only matters for drugs on the affected route
  'medcheck.prompt':
    'Grapefruit blockiert eine Medikamenten-Tür im Darm. Aber nicht alles benutzt diese Tür. Was bleibt hier hängen?',
  'medcheck.prompt.adult': 'Welche Arzneistoffe wären bei Grapefruit besonders kritisch?',
  'medcheck.simvastatin': 'Simvastatin',
  'medcheck.vitc': 'Vitamin C',
  'medcheck.pflaster': 'Pflaster',
  'medcheck.zahnpasta': 'Zahnpasta',
  'medcheck.otherStatin': 'Pravastatin oder Rosuvastatin',
  'medcheck.paracetamol': 'Paracetamol',
  'medcheck.fb.simvastatin':
    'Genau! Simvastatin benutzt diese Tür. Wenn Grapefruit sie blockiert, bleibt zu viel davon im Körper.',
  'medcheck.fb.simvastatin.adult':
    'Richtig. Simvastatin ist ein CYP3A4-Substrat. Wird CYP3A4 im Darm gehemmt, steigt die Exposition.',
  'medcheck.fb.vitc':
    'Nein – Vitamin C ist hier nicht das Problem. Nicht alles, was man schluckt, nutzt diese Medikamenten-Tür.',
  'medcheck.fb.vitc.adult':
    'Nein. Die Grapefruit-Interaktion betrifft nicht beliebige Stoffe, sondern bestimmte Arzneistoffe mit passendem Abbauweg.',
  'medcheck.fb.pflaster':
    'Nein – ein Pflaster geht gar nicht durch den Darm. Es kann hier also nicht an dieser Tür hängen bleiben.',
  'medcheck.fb.zahnpasta': 'Nein – Zahnpasta ist kein Medikament, das hier im Körper gestaut wird.',
  'medcheck.fb.otherStatin':
    'Nicht hier der Haupttreffer: Diese Statine sind deutlich weniger von CYP3A4 abhängig. Deshalb ist die Grapefruit-Problematik nicht für alle Statine gleich.',
  'medcheck.fb.paracetamol':
    'Nein. In dieser Geschichte geht es um CYP3A4-sensitive Arzneistoffe wie Simvastatin.',

  // finale: fruit-identification game (which fruits interact like grapefruit?)
  'fruits.prompt': 'Bei welchen Früchten musst du aufpassen? Wähle alle aus.',
  'fruits.prompt.young': 'Welche dieser Früchte sind tricky fürs Medikament? Tippe alle an.',
  'fruits.prompt.adult': 'Welche dieser Früchte hemmen den Abbau (CYP3A4)? Wähle alle aus.',
  'fruits.confirm': 'Bestätigen',
  'fruits.correct': 'Perfekt – alle richtig erkannt!',
  'fruits.close': 'Fast – nur eine Frucht daneben.',
  'fruits.wrong': 'Nicht ganz – schau dir die Auflösung an.',
  'fruits.badge': 'Wechselwirkung',
  'fruits.credit': 'Fotos: Wikimedia Commons',
  'fruits.lesson':
    'Grapefruit, Pomelo und Bitterorange bremsen CYP3A4 – Orange, Mandarine und Zitrone nicht. „Zitrusfrucht" allein ist also noch kein Problem.',
  'fruits.lesson.young':
    'Grapefruit, Pomelo und Bitterorange bremsen das Enzym (CYP3A4) – Orange, Mandarine und Zitrone nicht. Es ist also nicht „jede Zitrusfrucht"!',
  'fruits.lesson.adult':
    'Grapefruit, Pomelo und Bitterorange enthalten die Furanocumarine Bergamottin und 6′,7′-Dihydroxybergamottin, die CYP3A4 hemmen. Süßorange, Mandarine und Zitrone praktisch nicht – „Zitrus" allein sagt also nichts.',
  'fruit.grapefruit': 'Grapefruit',
  'fruit.pomelo': 'Pomelo',
  'fruit.bitterorange': 'Bitterorange',
  'fruit.orange': 'Orange',
  'fruit.mandarine': 'Mandarine',
  'fruit.zitrone': 'Zitrone',

  // outcome
  'out.win.title': 'Sicher eingestellt! 🎉',
  'out.win.sub': '{name} ist im grünen Bereich.',
  'out.over.title': 'Überdosis! ⚠️',
  'out.over.sub': 'Zu viel Simvastatin → Muskelschäden (Rhabdomyolyse).',
  'out.over.sub.young': 'Zu viel! Das kann die Muskeln schädigen.',
  'out.over.sub.adult': 'Überdosis → Muskelschäden (Rhabdomyolyse).',
  'out.under.title': 'Unterdosiert …',
  'out.under.sub': 'Zu wenig Wirkstoff → das Cholesterin bleibt zu hoch.',
  'out.under.sub.young':
    'Mal mehr, mal weniger Grapefruit – mit der kleineren Dosis ist jetzt zu wenig Wirkstoff da. Das Cholesterin bleibt hoch.',
  'out.under.sub.adult':
    'Schwankende Grapefruit-Menge → schwankende Hemmung → mit gesenkter Dosis fällt der Spiegel unter das Fenster. Cholesterin bleibt unkontrolliert. Deshalb: Grapefruit weglassen.',
  'out.stars': '{n} von 3 Sternen',
  // rank TITLE shown next to the stars (Apotheken-Karriere). Plain = kid register;
  // .adult = a real pharmacy-career ladder (PTA → Apotheker:in → klinisch).
  'out.rankLabel': 'Dein Rang',
  'rank.0': 'Noch in Ausbildung',
  'rank.0.adult': 'In Einarbeitung',
  'rank.10': 'Apotheken-Azubi',
  'rank.10.adult': 'Pharmazie-Azubi',
  'rank.15': 'Rezept-Profi',
  'rank.15.adult': 'PTA (Assistenz)',
  'rank.20': 'Dosis-Detektiv',
  'rank.20.adult': 'Apotheker:in',
  'rank.25': 'Interaktions-Profi',
  'rank.25.adult': 'Fachapotheker:in',
  'rank.30': 'SafePolyMed-Meister',
  'rank.30.adult': 'Klinische:r Pharmazeut:in',
  'out.dyk': 'Wusstest du?',
  // lesson 1: grapefruit slows the breakdown
  'out.dyk.text':
    'Grapefruit bremst den Abbau – dann kann von manchen Medikamenten zu viel im Körper bleiben.',
  'out.dyk.text.young':
    'Grapefruit bremst den Abbau – dann kann von manchen Medikamenten zu viel im Körper bleiben.',
  'out.dyk.text.adult':
    'Grapefruit hemmt intestinales CYP3A4 → Simvastatin-Exposition steigt → Risiko für Muskelschäden.',
  // lesson 2: not every fruit (fruit specificity)
  'out.dyk2.text':
    'Nicht jede Frucht macht das: Grapefruit, Pomelo und Bitterorange sind tricky; Orange, Mandarine und Zitrone nicht.',
  'out.dyk2.text.young':
    'Nicht jede Frucht macht das: Grapefruit, Pomelo und Bitterorange sind tricky; Orange, Mandarine und Zitrone nicht.',
  'out.dyk2.text.adult':
    'Nicht jede Zitrusfrucht ist relevant: Grapefruit, Pomelo und Bitterorange enthalten problematische Furanocumarine; Süßorange, Mandarine und Zitrone praktisch nicht.',
  // lesson 3: not every drug (drug specificity) — the new med-check takeaway
  'out.dyk3.text':
    'Und nicht jedes Medikament ist betroffen. Es kommt darauf an, welchen Weg das Medikament im Körper nimmt.',
  'out.dyk3.text.young':
    'Und nicht jedes Medikament ist betroffen. Es kommt darauf an, welchen Weg das Medikament im Körper nimmt.',
  'out.dyk3.text.adult':
    'Nicht jeder Arzneistoff ist betroffen: Entscheidend ist, ob der Wirkstoff ein relevantes CYP3A4-Substrat ist und wie stark die orale Exposition von diesem Abbauweg abhängt.',

  // end-screen idle timeout (kiosk): if nobody touches the outcome screen for a
  // while, ask first, then auto-return to story select (any tap = stay)
  'out.idle.title': 'Bist du noch da?',
  'out.idle.sub': 'In {s} Sekunden geht es zurück zum Anfang.',
  'out.idle.stay': 'Ich bin noch da!',

  // ===== Story „Die Frühstücks-Falle" (FDI · Grapefruit × Simvastatin) =====
  // Torso-first v2: LIFT-TO-TEST — remove breakfast items, read the Spiegel (still vs fall).
  // CONVENTION: the torso's level = „der Spiegel" (wie viel Wirkstoff im Blut ist) — NEVER
  // „Wasser". The enzyme = „Abbau-Enzym in Darm und Leber" (young) / CYP3A4 (adult) — NOT „Bauch".
  'fr.case': 'Herr Schmidt, 68 · Simvastatin',
  'fr.brief.patient': 'Herr Schmidt, 68, hat zu viel Cholesterin (Blutfett). Jeden Tag nimmt er eine Tablette dagegen.',
  'fr.brief.patient.adult': 'Herr Schmidt, 68, mit Hypercholesterinämie – seit Wochen stabil auf Simvastatin (Standarddosis).',
  'fr.brief.goal': 'Sorg dafür, dass immer die richtige Menge im Blut ist – nicht zu wenig, nicht zu viel.',
  'fr.brief.goal.adult': 'Halte den Simvastatin-Spiegel im therapeutischen Fenster – nicht zu niedrig, nicht zu hoch.',

  'fr.dose.prompt': 'Der Körper zeigt den Spiegel – wie viel Medikament in Herrn Schmidts Blut ist. Gib ihm seine normale Tablette.',
  'fr.dose.prompt.adult': 'Der Torso zeigt den Wirkstoffspiegel im Blut. Stelle Herrn Schmidt auf die Standarddosis Simvastatin ein.',
  'fr.dose.btn': 'Standarddosis geben',
  'fr.cue.fill': 'Schau auf den Körper – die Dosis läuft ein, der Spiegel steigt ins Grüne.',
  'fr.cue.fill.adult': 'Schau auf den Körper – der Wirkstoffspiegel steigt in den Zielbereich.',
  'fr.cue.filled': 'Geschafft – die Dosis ist eingelaufen.',
  'fr.cue.filled.adult': 'Dosis vollständig eingelaufen.',
  'fr.dose.reveal': 'Genau richtig – der Spiegel ist im grünen Bereich!',
  'fr.dose.reveal.adult': 'Im therapeutischen Fenster – gut eingestellt.',

  // „Wusstest du?"-Karten, die während des (langsamen) Dosis-Einlaufs rotieren
  'fr.fact.kicker': 'Wusstest du?',
  'fr.fact.disease': 'Zu viel Cholesterin (Blutfett) kann mit der Zeit die Adern verstopfen.',
  'fr.fact.disease.adult': 'Erhöhtes LDL-Cholesterin fördert Arteriosklerose – Risiko für Herzinfarkt und Schlaganfall.',
  'fr.fact.drug': 'Simvastatin ist ein „Statin“. Es hilft der Leber, weniger Cholesterin zu bilden.',
  'fr.fact.drug.adult': 'Simvastatin (ein Statin) hemmt in der Leber die HMG-CoA-Reduktase – die Cholesterin-Bildung sinkt.',
  'fr.fact.window': 'Wichtig ist die richtige Menge im Blut: zu wenig wirkt nicht, zu viel schadet den Muskeln.',
  'fr.fact.window.adult': 'Der Spiegel muss im therapeutischen Fenster bleiben – zu hoch belastet die Muskulatur (Myopathie).',
  'fr.fact.timing': 'Viele nehmen das Statin abends – nachts bildet der Körper am meisten Cholesterin.',
  'fr.fact.timing.adult': 'Statine werden oft abends gegeben: die körpereigene Cholesterinsynthese ist nachts am höchsten.',

  'fr.breakfast.story': 'Wochenlang läuft alles super. Doch eines Morgens, nach dem Joggen, frühstückt Herr Schmidt richtig: Müsli mit Apfel und Birne, ein Kaffee – und ein großes Glas Grapefruitsaft.',
  'fr.breakfast.story.adult': 'Über Wochen stabil. Eines Morgens, nach dem Joggen, frühstückt er ausgiebig: Müsli mit Apfel und Birne, Kaffee und ein großes Glas Grapefruitsaft.',
  'fr.morning.label': 'An diesem Morgen',
  'fr.morning.drift': 'Nach diesem Morgen – schau auf den Körper:',
  'fr.drift.cue': 'Im Blut ist plötzlich immer mehr Medikament! Der Spiegel klettert von allein nach oben.',
  'fr.drift.cue.adult': 'Der Wirkstoffspiegel steigt von allein – weit über den grünen Bereich.',

  'fr.detective.prompt': 'Detektiv-Frage: Was treibt den Spiegel hoch? Nimm das Frühstück Stück für Stück weg – und schau, wann der Spiegel fällt.',
  'fr.detective.prompt.adult': 'Eliminations-Test: nimm die Frühstücks-Komponenten einzeln heraus und beobachte, wann der Spiegel fällt.',
  'fr.detective.watch': 'Schau auf den Körper – bewegt sich der Spiegel, wenn du etwas wegnimmst?',
  'fr.detective.still': 'Der Spiegel rührt sich nicht – das war\'s nicht. Weiter suchen.',
  'fr.detective.found': 'Da! Ohne den Grapefruitsaft fällt der Spiegel zurück ins Grüne.',
  'fr.detective.foundPeek': 'Übeltäter gefunden. Aber warum genau? Schauen wir es uns am Körper an.',
  'fr.detective.foundPeek.adult': 'Auslöser identifiziert. Klären wir den Mechanismus am Spiegel.',

  'fr.item.apfel': 'Apfel',
  'fr.item.birne': 'Birne',
  'fr.item.kaffee': 'Kaffee',
  'fr.item.jog': 'Joggen',
  'fr.item.grapefruit': 'Grapefruitsaft',
  'fr.item.tap': 'wegnehmen',
  'fr.item.removed': 'weggenommen',

  'fr.mech.prompt': 'Warum steigt der Spiegel? Leg den Grapefruitsaft testweise zurück und schau.',
  'fr.mech.prompt.adult': 'Mechanismus am Körper: lege die Grapefruit zurück und beobachte den Spiegel.',
  'fr.mech.btn': 'Grapefruitsaft zurücklegen',
  'fr.mech.stack': 'Grapefruit bremst das Abbau-Enzym in Darm und Leber – die Helfer, die das Medikament zerlegen. So wird langsamer abgebaut, und der Spiegel staut sich.',
  'fr.mech.stack.adult': 'Grapefruit hemmt CYP3A4 (Darmwand/Leber) – Simvastatin wird langsamer abgebaut und kumuliert, der Spiegel steigt.',
  'fr.mech.next': 'Verstanden – und jetzt?',

  'fr.strat.prompt': 'Der Spiegel ist zu hoch. Was sollte Herr Schmidt jetzt tun?',
  'fr.strat.prompt.adult': 'Der Spiegel ist zu hoch. Wie sollte Herr Schmidt reagieren?',
  'fr.opt.drop': 'Den Grapefruitsaft weglassen',
  'fr.opt.space': 'Erst die Tablette, später den Saft trinken',
  'fr.opt.space.adult': 'Tablette und Grapefruitsaft zeitlich versetzt einnehmen',
  'fr.opt.raise': 'Mehr Tabletten nehmen',
  'fr.opt.raise.adult': 'Die Dosis erhöhen',
  'fr.opt.lower': 'Die Dosis selbst senken',
  'fr.fb.drop': 'Genau – ohne Grapefruit erholt sich das Enzym, und der Spiegel bleibt von allein im Grünen.',
  'fr.fb.drop.adult': 'Richtig – Grapefruit absetzen; das Enzym erholt sich, der Spiegel normalisiert sich. Bevorzugte Lösung.',
  'fr.fb.space': 'Bringt nichts – die Grapefruit wirkt noch tagelang nach. Ein zeitlicher Abstand löst das nicht.',
  'fr.fb.space.adult': 'Wirkungslos – die CYP3A4-Hemmung hält Tage an; ein zeitlicher Abstand löst sie nicht.',
  'fr.fb.raise': 'Gefährlich! Das Enzym ist gebremst – noch mehr Tabletten machen den Spiegel giftig für die Muskeln.',
  'fr.fb.raise.adult': 'Gefährlich – mehr Substrat bei gehemmtem Abbau → toxischer Spiegel, Rhabdomyolyse-Risiko.',
  'fr.fb.lower': 'Mal mehr, mal weniger Grapefruit – der Spiegel kommt nicht zur Ruhe.',
  'fr.fb.lower.adult': 'Unzuverlässig – bei schwankender Hemmung kippt der Spiegel; Titration ersetzt nicht das Absetzen.',
  'fr.move.win': 'Schau – der Spiegel sinkt zurück und ruht im grünen Bereich.',
  'fr.move.over': 'Schau auf den Körper – der Spiegel schießt viel zu hoch, weit über den grünen Bereich!',
  'fr.move.under': 'Schau auf den Körper – der Spiegel kommt nicht zur Ruhe …',

  // win → kurzes „weiter" mit Ausblick auf das Frucht-Assay
  'fr.won.title': 'Übeltäter gestoppt! 🎉',
  'fr.won.peek': 'Aber ist die Grapefruit der einzige Übeltäter? Schauen wir uns andere Früchte an.',
  'fr.won.peek.adult': 'Aber ist die Grapefruit die einzige kritische Frucht? Prüfen wir weitere.',

  'fr.assay.prompt': 'Welche dieser Früchte bremsen das Enzym auch – so wie die Grapefruit? Tippe sie an.',
  'fr.assay.prompt.adult': 'Welche dieser Früchte hemmen CYP3A4 wie die Grapefruit? Wähle alle aus.',
  'fr.assay.btn': 'Beweisen',
  'fr.assay.cue': 'Schau – drei davon treiben den Spiegel weit über den grünen Bereich. Die anderen nicht.',
  'fr.assay.cue.adult': 'Drei davon treiben den Spiegel hoch (CYP3A4-Hemmung) – die anderen nicht.',
  'fr.assay.correct': 'Perfekt – alle richtig erkannt!',
  'fr.assay.close': 'Fast – eine stimmt nicht ganz.',
  'fr.assay.wrong': 'Nicht ganz – schau dir die Auflösung an.',

  'fr.out.win.title': 'Sicher eingestellt! 🎉',
  'fr.out.win.sub': 'Du hast am Körper erkannt, was den Spiegel hochtreibt – Herr Schmidt ist im grünen Bereich.',
  'fr.out.win.sub.adult': 'Spiegel im therapeutischen Fenster – die Ursache (Grapefruit) wurde eliminiert.',
  'fr.out.over.title': 'Zu viel! ⚠️',
  'fr.out.over.sub': 'Der Spiegel ist viel zu hoch gestiegen – weit über den grünen Bereich. Das kann die Muskeln schädigen.',
  'fr.out.over.sub.adult': 'Toxischer Simvastatin-Spiegel → Muskelschäden (Rhabdomyolyse). Mehr Dosis löst die Hemmung nicht.',
  'fr.out.under.title': 'Nicht im Griff …',
  'fr.out.under.sub': 'Mal mehr, mal weniger Grapefruit – jetzt ist der Spiegel nicht mehr kontrolliert.',
  'fr.out.under.sub.adult': 'Schwankende Hemmung + gesenkte Dosis → unkontrollierbarer Spiegel. Deshalb: Grapefruit absetzen.',
  'fr.out.dyk1': 'Grapefruit bremst das Abbau-Enzym in Darm und Leber – dann bleibt zu viel Medikament im Blut, und der Spiegel klettert von allein.',
  'fr.out.dyk1.adult': 'Grapefruit hemmt intestinales CYP3A4 → Simvastatin kumuliert → Spiegel und Myopathie-/Rhabdomyolyse-Risiko steigen, obwohl die Dosis gleich bleibt.',
  'fr.out.dyk2': 'Nicht jede saure Frucht macht das! Nur Grapefruit, Pomelo und Bitterorange bremsen das Enzym – Apfel, Birne, Orange, Mandarine, Zitrone und auch Kaffee verändern den Spiegel nicht.',
  'fr.out.dyk2.adult': 'Wirkstoffe sind Furanocumarine (Bergamottin, 6′,7′-Dihydroxybergamottin) – in Grapefruit, Pomelo, Bitterorange, nicht in Süßorange/Mandarine/Zitrone. Kaffee (CYP1A2) ist hier ohne Einfluss.',
  'fr.out.dyk.over': 'Mehr Tabletten sind hier keine Lösung – bei gebremstem Enzym wird der Spiegel nur giftiger. Besser die Grapefruit weglassen.',
  'fr.out.dyk.over.adult': 'Bei gehemmtem Abbau eskaliert eine Dosiserhöhung den Spiegel. Kausal die Ursache eliminieren, nicht den Spiegel jagen.',
  'fr.out.dyk.under': 'Die Grapefruit-Menge schwankt – an der Dosis zu drehen macht den Spiegel unkontrollierbar. Besser die Grapefruit ganz weglassen.',
  'fr.out.dyk.under.adult': 'Die Hemmung hält Tage an und schwankt pro Glas → Dosis-Titration ist unzuverlässig. Realer Fix: Grapefruit absetzen oder Nicht-CYP3A4-Statin.',

  // ===== Story „Die Blut-Balance" (DDI · Clarithromycin × Phenprocoumon) =====
  // Torso-first: SCAN-A-PAIRING → the real pump answers (still vs surge).
  'ddi.new': 'NEU',
  'ddi.brief.patient': 'Herr Schmidt, 72, hat ein zitterndes Herz (Vorhofflimmern) und nimmt einen Blutverdünner. Damit ist sein Blut genau richtig „dünn“ – seit Jahren stabil.',
  'ddi.brief.patient.adult': 'Herr Schmidt, 72, mit Vorhofflimmern – seit Jahren stabil auf Phenprocoumon (Marcumar). Der Gerinnungsschutz liegt im Zielbereich.',
  'ddi.brief.goal': 'Halte seine Blut-Balance im grünen Bereich: nicht zu dünn (Blutung) und nicht zu dick (Klumpen).',
  'ddi.brief.goal.adult': 'Halte die Antikoagulation im Zielfenster: zu hoch = Blutung, zu niedrig = Thrombose/Schlaganfall.',
  'ddi.cue.fill': 'Schau auf den Körper – das Wasser steigt in den grünen Bereich.',

  // card / role names (shared with the scanner tiles)
  'ddi.card.phenprocoumon': 'Blutverdünner', 'ddi.role.phenprocoumon': 'schützt vor Klumpen',
  'ddi.card.phenprocoumon.adult': 'Phenprocoumon', 'ddi.role.phenprocoumon.adult': 'Blutverdünner (VKA)',
  'ddi.card.metoprolol': 'Herz-Mittel', 'ddi.role.metoprolol': 'beruhigt das Herz',
  'ddi.card.metoprolol.adult': 'Metoprolol', 'ddi.role.metoprolol.adult': 'Herzfrequenz',
  'ddi.card.ramipril': 'Blutdruck-Mittel', 'ddi.role.ramipril': 'senkt den Druck',
  'ddi.card.ramipril.adult': 'Ramipril', 'ddi.role.ramipril.adult': 'Blutdruck',
  'ddi.card.metformin': 'Zucker-Mittel', 'ddi.role.metformin': 'gegen Zucker',
  'ddi.card.metformin.adult': 'Metformin', 'ddi.role.metformin.adult': 'Zucker',
  'ddi.card.pantoprazol': 'Magenschutz', 'ddi.role.pantoprazol': 'schützt den Magen',
  'ddi.card.pantoprazol.adult': 'Pantoprazol', 'ddi.role.pantoprazol.adult': 'Magenschutz (PPI)',
  'ddi.card.clarithromycin': 'Neues Antibiotikum', 'ddi.role.clarithromycin': 'gegen die Bronchitis',
  'ddi.card.clarithromycin.adult': 'Clarithromycin', 'ddi.role.clarithromycin.adult': 'Makrolid-Antibiotikum',

  // 1 · what the two red lines mean (the pump teaches it)
  'ddi.lines.prompt': 'Bevor es losgeht: Schau, was am Körper zu hoch und zu tief bedeutet.',
  'ddi.lines.prompt.adult': 'Zur Eichung: die beiden roten Grenzen am Torso.',
  'ddi.lines.btn': 'Zeig mir die Grenzen',
  'ddi.lines.high': 'Zu viel Verdünner = zu dünnes Blut = Blutungsgefahr.',
  'ddi.lines.high.adult': 'Zu hohe Antikoagulation = Blutungsrisiko.',
  'ddi.lines.low': 'Zu wenig = das Blut klumpt – Gefahr durch Blutklumpen.',
  'ddi.lines.low.adult': 'Zu niedrig = kein Schlaganfallschutz, Thrombosegefahr.',
  'ddi.lines.mid': 'Genau richtig – im grünen Bereich.',
  'ddi.lines.mid.adult': 'Im Zielfenster – balanciert.',

  // 2 · drop the new pill into the plan (seed the stillness)
  'ddi.newcard.prompt': 'Das ist Herrn Schmidts Plan. Leg das neue Antibiotikum dazu.',
  'ddi.newcard.prompt.adult': 'Neue Verordnung: Clarithromycin kommt in den Plan.',
  'ddi.newcard.btn': 'Antibiotikum dazulegen',
  'ddi.newcard.still': 'Schau – nichts bewegt sich. Allein im Plan ist noch nichts kombiniert.',
  'ddi.newcard.still.adult': 'Noch keine Reaktion – die neue Substanz allein verändert nichts.',

  // 3 · the interaction scanner (signature beat)
  'ddi.scan.prompt': 'Prüfe das neue Antibiotikum mit jeder alten Tablette. Tippe eine an – und schau auf den Körper.',
  'ddi.scan.prompt.adult': 'Cross-Check: prüfe Clarithromycin gegen jede bestehende Medikation. Schau auf den Körper.',
  'ddi.scan.probe': 'Neues Antibiotikum',
  'ddi.scan.watch': 'Schau auf den Körper – bewegt sich das Wasser?',
  'ddi.scan.still': 'Nichts bewegt sich. Die zwei vertragen sich.',
  'ddi.scan.still.adult': 'Keine relevante Reaktion – verträglich.',
  'ddi.scan.surge': 'Alarm! Das Wasser steigt von allein – das Antibiotikum macht den Blutverdünner stärker.',
  'ddi.scan.surge.adult': 'Kritische Kombination: Clarithromycin erhöht die Blutverdünner-Wirkung – der Spiegel steigt.',
  'ddi.scan.locked': 'Erst die anderen vier prüfen.',
  'ddi.scan.tag.still': 'vertragen sich',
  'ddi.scan.tag.alarm': '⚠ Alarm',

  // 4 · the Magenschutz twist (unavoidable demo)
  'ddi.demo.prompt': 'Herr Schmidt hat Angst um seinen Magen und gibt aus Vorsicht nur den Magenschutz dazu. Hilft das gegen das zu dünne Blut?',
  'ddi.demo.prompt.adult': 'Vorsichts-Reflex: nur einen PPI/Magenschutz ergänzen. Senkt das die zu hohe Antikoagulation?',
  'ddi.demo.btn': 'Ausprobieren',
  'ddi.demo.rising': 'Der Magenschutz ändert nichts – das Wasser steigt trotzdem Richtung roter Linie.',
  'ddi.demo.rising.adult': 'Der PPI senkt den Spiegel nicht – das Wasser steigt weiter Richtung Grenze.',
  'ddi.demo.q': 'Schau auf den Körper: Was hat das Wasser gemacht?',
  'ddi.demo.up': '↑ Es ist gestiegen',
  'ddi.demo.down': '↓ Es ist gefallen',
  'ddi.demo.right': 'Genau – der Magenschutz löst das eigentliche Problem nicht.',
  'ddi.demo.right.adult': 'Korrekt – Symptomschutz ersetzt kein Interaktionsmanagement.',
  'ddi.demo.wrong': 'Schau nochmal auf den Körper – das Wasser ist gestiegen, nicht gefallen.',

  // 5 · strategy — read off the high water (no number shown)
  'ddi.strat.prompt': 'Schau auf den Körper. Was ist jetzt sicher?',
  'ddi.strat.prompt.adult': 'Schau auf den Körper. Wie reagierst du sicher auf die Wechselwirkung?',
  'ddi.opt.safe': 'Ganzen Plan prüfen – Apotheke/Arztpraxis fragen',
  'ddi.opt.safe.adult': 'Gesamtplan prüfen – interaktionsärmere Antibiose oder engmaschige Kontrolle',
  'ddi.opt.both': 'Einfach beides nehmen',
  'ddi.opt.both.adult': 'Clarithromycin ohne Kontrolle dazugeben',
  'ddi.opt.ppi': 'Nur Magenschutz dazu',
  'ddi.opt.ppi.adult': 'Nur einen PPI/Magenschutz ergänzen',
  'ddi.opt.reduce': 'Antibiotikum-Dosis selbst kleiner machen',
  'ddi.opt.reduce.adult': 'Antibiotikum-Dosis eigenmächtig reduzieren',
  'ddi.opt.stop': 'Blutverdünner aus Angst weglassen',
  'ddi.opt.stop.adult': 'Phenprocoumon eigenmächtig absetzen',
  'ddi.fb.safe': 'Genau – den ganzen Plan prüfen und Fachleute fragen. So bleibt die Blut-Balance sicher.',
  'ddi.fb.safe.adult': 'Richtig – interaktionsärmere Antibiose prüfen oder engmaschige Kontrolle mit ärztlicher Dosisanpassung.',
  'ddi.fb.both': 'Gefährlich – der Blutverdünner wird zu stark, das Blut zu dünn.',
  'ddi.fb.both.adult': 'Gefährlich – unkontrollierte Erhöhung der Antikoagulation, Blutungsrisiko.',
  'ddi.fb.ppi': 'Der Magenschutz löst es nicht – das Wasser steigt trotzdem über die rote Linie.',
  'ddi.fb.ppi.adult': 'Ein PPI senkt den Spiegel nicht – die unbehandelte Wechselwirkung treibt weiter nach oben.',
  'ddi.fb.reduce': 'Reicht nicht – die Wirkung ist schon zu hoch und sinkt nicht schnell genug.',
  'ddi.fb.reduce.adult': 'Unzureichend – die bereits erhöhte Wirkung fällt nicht rasch genug; eigenmächtig riskant.',
  'ddi.fb.stop': 'Vorsicht – ohne Blutverdünner ist sein Herz nicht mehr geschützt.',
  'ddi.fb.stop.adult': 'Gefährlich – Absetzen nimmt den Schlaganfallschutz, Thrombose-/Embolierisiko.',
  'ddi.move.win': 'Schau – das Wasser sinkt zurück in den grünen Bereich.',
  'ddi.move.over': 'Schau auf den Körper – das Wasser steigt über die rote Linie!',
  'ddi.move.under': 'Schau auf den Körper – das Wasser fällt unter die rote Linie!',

  // 6 · build the safe plan (win-path finale, one sort)
  'ddi.plan.prompt': 'Bau den sicheren Plan für Herrn Schmidt. Welche Karten gehören dazu?',
  'ddi.plan.prompt.adult': 'Stelle den sicheren Managementplan zusammen.',
  'ddi.plan.safebin': 'gehört in den sicheren Plan',
  'ddi.plan.unsafebin': 'nicht sicher',
  'ddi.plan.showall': 'Alle Medikamente zeigen',
  'ddi.plan.showall.adult': 'Vollständigen Medikationsplan abgleichen',
  'ddi.plan.pharmacy': 'Apotheke/Arztpraxis fragen',
  'ddi.plan.pharmacy.adult': 'Interaktionscheck mit Apotheke/Arzt',
  'ddi.plan.bloodvalue': 'Blutwert kontrollieren lassen',
  'ddi.plan.bloodvalue.adult': 'INR engmaschig kontrollieren',
  'ddi.plan.otherab': 'Besser passendes Antibiotikum besprechen',
  'ddi.plan.otherab.adult': 'Interaktionsärmere Antibiose besprechen',
  'ddi.plan.signs': 'Auf Blutungszeichen achten (Nasenbluten, blaue Flecken)',
  'ddi.plan.signs.adult': 'Auf Blutungszeichen achten (Hämatome, Epistaxis)',
  'ddi.plan.hide': 'Blutverdünner heimlich weglassen',
  'ddi.plan.selfdouble': 'Allein die Dosis verdoppeln',
  'ddi.plan.onlystomach': 'Nur Magenschutz und weiter so',
  'ddi.plan.saynothing': 'Nichts sagen',
  'ddi.plan.confirm': 'Plan prüfen',
  'ddi.plan.correct': 'Perfekt – so bleibt Herr Schmidt geschützt und die Blut-Balance im Grünen.',
  'ddi.plan.correct.adult': 'Korrekt – vollständiger Cross-Check, Monitoring und kontrolliertes Management.',
  'ddi.plan.retry': 'Ein paar Karten gehören woanders hin – schau nochmal.',

  // 7 · outcome / debrief
  'ddi.out.win.title': 'Sicher kombiniert! 🎉',
  'ddi.out.win.sub': 'Du hast die Wechselwirkung am Körper erkannt – Herr Schmidt bleibt geschützt.',
  'ddi.out.win.sub.adult': 'Gerinnungsschutz erhalten, Blutungsrisiko kontrolliert, Plan geprüft.',
  'ddi.out.over.title': 'Zu dünn! ⚠️',
  'ddi.out.over.sub': 'Die Blut-Balance ist zu hoch gestiegen – das Blut ist zu dünn, Blutungen werden gefährlich.',
  'ddi.out.over.sub.adult': 'Antikoagulation/INR zu hoch → Blutungsrisiko. Die Wechselwirkung wurde nicht behandelt.',
  'ddi.out.under.title': 'Ungeschützt …',
  'ddi.out.under.sub': 'Zu wenig Schutz – jetzt können gefährliche Blutklumpen entstehen.',
  'ddi.out.under.sub.adult': 'VKA eigenmächtig abgesetzt → Verlust des Schlaganfallschutzes → Thrombose-/Embolierisiko.',
  'ddi.out.dyk1': 'Eine Wechselwirkung entsteht, wenn zwei Mittel zusammenkommen – hier neues Antibiotikum + Blutverdünner. Das Antibiotikum macht den Verdünner STÄRKER.',
  'ddi.out.dyk1.adult': 'Clarithromycin kann über mehrere Abbau-/Transportwege die Phenprocoumon-Wirkung erhöhen → Spiegel/INR steigt über Tage → Blutungsrisiko.',
  'ddi.out.dyk2': 'Darum: immer den GANZEN Plan zeigen und Apotheke/Arztpraxis fragen – und den Blutverdünner nie allein absetzen.',
  'ddi.out.dyk2.adult': 'Apotheken-Cross-Check jeder neuen Verordnung gegen den Bestand. Zwei-seitige Gefahr: zu hoch = Blutung, Absetzen = Thrombose.',
  'ddi.out.dyk.over': 'Magenschutz schützt den Magen, senkt aber die Blut-Balance nicht. Das Problem ist die unbehandelte Wechselwirkung – nicht der Magenschutz.',
  'ddi.out.dyk.over.adult': 'Ein PPI senkt den INR nicht; mehr Hemmstoff oder Ignorieren verschärft die Antikoagulation. Symptomschutz ≠ Interaktionsmanagement.',
  'ddi.out.dyk.under': 'Den Blutverdünner einfach wegzulassen ist auch gefährlich – dann fehlt der Schutz vor Blutklumpen.',
  'ddi.out.dyk.under.adult': 'Eigenmächtiges Absetzen des VKA entzieht den Schlaganfallschutz. Lösung ist das Antibiotikum-Management, nicht das Absetzen.',

  // ===== Story „Die Nieren-Skala" (Organ · eGFR × Metformin) =====
  'organ.brief.patient': 'Frau Yilmaz, 74, hat Zucker-Krankheit (Diabetes) und nimmt jeden Tag dieselbe Medizin dagegen.',
  'organ.brief.patient.adult': 'Frau Yilmaz, 74 – Typ-2-Diabetes, seit Jahren stabil auf Metformin in gewohnter Dosis.',
  'organ.brief.goal': 'Hilf Frau Yilmaz! Bring den Spiegel in den grünen Bereich – nicht zu wenig, nicht zu viel.',
  'organ.brief.goal.adult': 'Stell Frau Yilmaz mit Metformin sicher ein – der Spiegel soll im grünen Fenster bleiben, auch wenn sich etwas ändert.',
  'organ.dose.prompt': 'Gib Frau Yilmaz ihre normale Dosis.',
  'organ.dose.prompt.adult': 'Frau Yilmaz wird auf ihre Standarddosis Metformin eingestellt.',
  'organ.dose.reveal': 'Im grünen Bereich – gut eingestellt.',
  'organ.event.story': 'Monatelang läuft alles gut. Doch beim Arzt-Check zeigt das Blut: Frau Yilmaz’ Nieren sind müder geworden. Langsam steigt der Spiegel …',
  'organ.event.story.adult': 'Über Monate stabil. Bei der Routinekontrolle ist die Nierenfunktion gefallen: eGFR 35 ml/min (vorher normal). Der Spiegel beginnt zu steigen.',
  'organ.event.reveal': 'Oh – zu viel! Irgendetwas staut sich an.',
  'organ.event.reveal.adult': 'Zu viel – der Spiegel ist über das Fenster gestiegen, Metformin kumuliert.',
  'organ.det.prompt': 'Detektiv-Frage: Warum staut sich die Medizin jetzt an?',
  'organ.det.prompt.adult': 'Warum steigt der Metformin-Spiegel, obwohl die Dosis gleich blieb?',
  'organ.det.kidney': '🫘 Die Nieren sind schwächer geworden',
  'organ.det.carbs': '🍞 Sie isst zu viele Kohlenhydrate',
  'organ.det.strong': '💊 Die Tabletten sind zu stark',
  'organ.det.move': '🏃 Zu wenig Bewegung',
  'organ.det.drink': '💧 Sie trinkt zu wenig',
  'organ.det.fever': '🌡️ Sie hat Fieber',
  'organ.dfb.kidney': 'Richtig! Die Nieren waschen die Medizin aus dem Körper. Sind sie müde, bleibt mehr drin.',
  'organ.dfb.kidney.adult': 'Korrekt – die renale Clearance ist gesunken (eGFR ↓), Metformin wird langsamer ausgeschieden und kumuliert.',
  'organ.dfb.carbs': 'Nein – Essen verändert nicht, wie viel Medizin im Körper bleibt.',
  'organ.dfb.strong': 'Nein – es sind dieselben Tabletten wie immer.',
  'organ.dfb.move': 'Nein – Bewegung ist gut, aber nicht der Grund.',
  'organ.dfb.drink': 'Nein – mehr trinken macht müde Nieren nicht wieder jung.',
  'organ.dfb.fever': 'Nein – Fieber ist hier nicht das Problem.',
  'organ.mech': 'Stell dir die Niere wie eine Pumpe vor, die die Medizin wieder rauswäscht. Ist die Pumpe müde, schafft sie weniger – dann muss weniger rein. Schwache Niere = kleinere Dosis.',
  'organ.mech.adult': 'Metformin wird unverändert über die Nieren ausgeschieden. Sinkt die eGFR, sinkt die Clearance → Metformin kumuliert → Risiko der Laktatazidose. Konsequenz: Dosis an die eGFR anpassen.',
  'organ.dial.prompt': 'Der Tacho ist im gelben Bereich – nur halbe Kraft. Stell den Regler auf die passende Dosis!',
  'organ.dial.prompt.adult': 'Der eGFR-Tacho steht bei 35 ml/min (gelbe Zone, 30–44). Stell den Dosis-Regler passend ein.',
  'organ.notch.low': 'sehr niedrig', 'organ.mg.low': '≈ 250 mg',
  'organ.notch.reduced': 'reduziert', 'organ.mg.reduced': '≈ 1000 mg/Tag',
  'organ.notch.standard': 'Standard', 'organ.mg.standard': '2× 1000 mg',
  'organ.fb.reduced': 'Genau – weniger Medizin, weil die Niere weniger schafft. Der Spiegel kommt zurück in den grünen Bereich!',
  'organ.fb.reduced.adult': 'Richtig – bei eGFR 30–44 wird die Dosis reduziert/gedeckelt UND die Niere überwacht. Der Spiegel normalisiert sich. Leitliniengetreu.',
  'organ.fb.standard': 'Gefährlich! Die müde Niere schafft die volle Menge nicht – jetzt staut es sich richtig an.',
  'organ.fb.standard.adult': 'Gefährlich – volle Dosis bei reduzierter Clearance → Kumulation → toxischer Spiegel, Laktatazidose-Risiko.',
  'organ.fb.low': 'Zu stark gesenkt – jetzt ist zu wenig da, der Blutzucker steigt.',
  'organ.fb.low.adult': 'Zu stark gesenkt bzw. abgesetzt – der Blutzucker entgleist. (Absetzen wäre erst bei eGFR < 30 nötig.)',
  'organ.trap': 'Dosis lassen, mehr trinken – die Niere erholt sich schon',
  'organ.fb.trap': 'Bringt nichts – müde Nieren werden vom Trinken nicht wieder jung. Die Dosis muss runter. Versuch’s nochmal.',
  'organ.fb.trap.adult': 'Wirkungslos – eine chronisch reduzierte eGFR kommt nicht von allein zurück; mehr Flüssigkeit ersetzt keine Dosisanpassung. Nochmal.',
  'organ.fin.prompt': 'Letzte Aufgabe: Welche Dosis passt zu welcher Niere?',
  'organ.fin.prompt.adult': 'Ordne jeder eGFR-Stufe die korrekte Metformin-Maßnahme zu.',
  'organ.fin.high': '🟢 eGFR ≥ 60 (starke Niere)',
  'organ.fin.mid': '🟡 eGFR 30–44 (halbe Kraft)',
  'organ.fin.low': '🔴 eGFR < 30 (sehr schwach)',
  'organ.measure.standard': 'Standard', 'organ.measure.reduce': 'reduzieren', 'organ.measure.stop': 'absetzen',
  'organ.fin.correct': 'Perfekt – alle richtig zugeordnet!',
  'organ.fin.wrong': 'Nicht ganz – schau dir die Auflösung an.',
  'organ.fin.lesson': 'Je müder die Niere, desto weniger Dosis – und ganz schwach heißt: Pause und mit dem Arzt eine andere Medizin finden.',
  'organ.fin.lesson.adult': 'eGFR ≥ 60 Standard · 45–59 möglich mit Überwachung · 30–44 reduzieren/deckeln · < 30 kontraindiziert. Die Niere steuert die Dosis.',
  'organ.out.win.title': 'Sicher dosiert! 🎉',
  'organ.out.win.sub': 'Du hast die Dosis an die müde Niere angepasst.',
  'organ.out.win.sub.adult': 'Dosis an die eGFR angepasst (reduziert + überwacht) – Frau Yilmaz liegt im Fenster.',
  'organ.out.over.title': 'Angestaut! ⚠️',
  'organ.out.over.sub': 'Zu viel! Die müde Niere konnte die volle Menge nicht ausscheiden.',
  'organ.out.over.sub.adult': 'Überdosis: volle Dosis bei reduzierter renaler Clearance → Kumulation → Laktatazidose-Risiko.',
  'organ.out.under.title': 'Zu wenig …',
  'organ.out.under.sub': 'Jetzt zu wenig – der Zucker im Blut steigt wieder.',
  'organ.out.under.sub.adult': 'Unterdosiert: zu stark reduziert/abgesetzt → Wirkspiegel zu niedrig → Blutzucker entgleist. Absetzen erst bei eGFR < 30.',
  'organ.out.dyk1': 'Die Nieren waschen die Medizin aus dem Körper. Müde Nieren = weniger Dosis.',
  'organ.out.dyk1.adult': 'Metformin wird unverändert renal eliminiert; sinkt die eGFR, muss die Dosis sinken (sonst Kumulation → Laktatazidose).',
  'organ.out.dyk2': 'Bei jeder Medizin gilt: erst die Niere checken, dann die Dosis wählen.',
  'organ.out.dyk2.adult': 'eGFR ist eine reale Steuergröße der Dosierung: ≥ 60 Standard · 30–44 reduzieren + überwachen · < 30 absetzen.',

  // ===== Story „Drei Zwillinge, eine Pille" (Gen · Codein/CYP2D6) =====
  'gene.brief.patient': 'Drei Geschwister mit Zahnschmerzen sehen gleich aus – aber jeder baut Medikamente anders ab. Alle bekommen genau dieselbe Codein-Tablette.',
  'gene.brief.patient.adult': 'Drei Geschwister nach kleinem Eingriff, alle mit identischer Codein-Dosis – aber unterschiedlichem CYP2D6-Genotyp (langsam / normal / ultraschnell).',
  'gene.brief.goal': 'Codein wirkt erst, wenn der Körper es umbaut. Rate: Wie wirkt dieselbe Pille bei jedem der drei?',
  'gene.brief.goal.adult': 'Codein ist ein Prodrug – CYP2D6 wandelt es in Morphin um. Sag voraus, wie dieselbe Dosis bei jedem Genotyp wirkt.',
  'gene.predict.prompt': 'Wie wirkt die gleiche Pille bei jedem? Tippe für jeden: zu wenig, genau richtig oder zu viel.',
  'gene.predict.prompt.adult': 'Vorhersage: Ordne jedem Genotyp das erwartete Ergebnis zu (zu wenig / genau richtig / zu viel).',
  'gene.predict.confirm': 'Vorhersage prüfen',
  'gene.twin.slow': '🐢 Baut langsam ab',
  'gene.twin.slow.adult': 'Langsam (poor metabolizer)',
  'gene.twin.normal': '✅ Baut normal ab',
  'gene.twin.normal.adult': 'Normal (extensive)',
  'gene.twin.ultra': '🐇 Baut ultraschnell ab',
  'gene.twin.ultra.adult': 'Ultraschnell (ultra-rapid)',
  'gene.bin.low': 'zu wenig', 'gene.bin.mid': 'genau richtig', 'gene.bin.high': 'zu viel',
  'gene.reveal.title': 'Gleiche Dosis – drei völlig verschiedene Ergebnisse!',
  'gene.reveal.sub': 'Der Langsame bildet kaum Morphin (wirkt nicht), der Normale liegt im grünen Bereich, der Ultraschnelle bildet zu viel – gefährlich!',
  'gene.reveal.sub.adult': 'Poor metabolizer: kaum Morphin → keine Wirkung. Normal: im Fenster. Ultra-rapid: Morphin-Überschuss → Atemdepressions-Risiko.',
  'gene.mech': 'Im Körper gibt es eine „Umbau-Maschine" (das Enzym CYP2D6). Sie macht aus Codein erst das wirksame Morphin. Manche haben wenig davon (es wirkt nicht), manche zu viel (es wird gefährlich) – das steckt in den Genen.',
  'gene.mech.adult': 'CYP2D6 aktiviert das Prodrug Codein zu Morphin. Poor metabolizer bilden kaum Morphin (keine Analgesie), ultra-rapid metabolizer zu viel (Atemdepression). Der Genotyp – nicht die Dosis – entscheidet.',
  'gene.strat.prompt': 'Der ultraschnelle Zwilling hat zu viel Morphin gebildet. Was tust du?',
  'gene.strat.prompt.adult': 'Beim ultra-rapid metabolizer drohen toxische Morphinspiegel. Wie reagierst du?',
  'gene.opt.switch': 'Ein anderes Schmerzmittel geben (kein CYP2D6, z. B. Ibuprofen)',
  'gene.opt.keep': 'Einfach beim Codein bleiben',
  'gene.opt.tramadol': 'Stattdessen Tramadol geben',
  'gene.opt.increase': 'Beim Langsamen die Codein-Dosis erhöhen',
  'gene.fb.switch': 'Genau – ein Schmerzmittel, das nicht über CYP2D6 läuft, wirkt bei allen sicher und vorhersehbar.',
  'gene.fb.switch.adult': 'Richtig – bei PM/UM auf ein nicht-CYP2D6-aktiviertes Analgetikum ausweichen (CPIC-Empfehlung). Sicher und vorhersehbar.',
  'gene.fb.keep': 'Gefährlich! Der ultraschnelle Zwilling bildet weiter zu viel Morphin.',
  'gene.fb.keep.adult': 'Gefährlich – beim ultra-rapid metabolizer drohen toxische Morphinspiegel (Atemdepression).',
  'gene.fb.tramadol': 'Vorsicht – Tramadol wird AUCH über CYP2D6 aktiviert, dasselbe Problem. Versuch’s nochmal.',
  'gene.fb.tramadol.adult': 'Falle – Tramadol ist ebenfalls CYP2D6-abhängig; dasselbe genetische Problem. Nochmal.',
  'gene.fb.increase': 'Falsch – dem Langsamen fehlt das Enzym, nicht die Dosis. Mehr Codein hilft nicht, macht es nur riskanter.',
  'gene.fb.increase.adult': 'Falsch – beim poor metabolizer fehlt das aktivierende Enzym; Dosissteigerung bringt keine Analgesie, erhöht aber das Risiko.',
  'gene.out.win.title': 'Sicher behandelt! 🎉',
  'gene.out.win.sub': 'Du hast das richtige Schmerzmittel gewählt – für jeden Körper sicher.',
  'gene.out.win.sub.adult': 'Nicht-CYP2D6-Analgetikum gewählt – wirksam und sicher unabhängig vom Genotyp.',
  'gene.out.over.title': 'Zu viel Morphin! ⚠️',
  'gene.out.over.sub': 'Der ultraschnelle Körper hat zu viel daraus gemacht – das kann die Atmung gefährden.',
  'gene.out.over.sub.adult': 'Ultra-rapid metabolizer + Codein → Morphin-Überschuss → Atemdepression (reale FDA-Boxed-Warning, u. a. Kinder).',
  'gene.out.dyk1': 'Gleiches Medikament, gleiche Dosis, andere Gene – ganz anderes Ergebnis.',
  'gene.out.dyk1.adult': 'Codein ist ein Prodrug; der CYP2D6-Metabolisierertyp bestimmt Wirkung und Risiko – gleiche Dosis, anderer Effekt.',
  'gene.out.dyk2': 'Darum hilft es, die Gene zu kennen – und im Zweifel ein Mittel zu wählen, das bei allen gleich wirkt.',
  'gene.out.dyk2.adult': 'Pharmakogenetik: bei bekanntem PM/UM-Status das Analgetikum danach wählen (nicht Tramadol – auch CYP2D6).',

  // ===== Story „Der Wochen-Pillenplan" (Adhärenz · Lamotrigin) =====
  'adh.brief.patient': 'Das ist Lena, 22. Sie studiert und hat Epilepsie. Eine kleine Tablette jeden Tag sorgt dafür, dass keine Anfälle kommen.',
  'adh.brief.patient.adult': 'Lena, 22, Studentin mit Epilepsie. Sie nimmt Lamotrigin (Antiepileptikum) zum Anfallsschutz – eine Tablette täglich.',
  'adh.brief.goal': 'Hilf Lena, ihren Rhythmus zu halten: jeden Tag genau eine Tablette. Dann bleibt der Spiegel im grünen Bereich.',
  'adh.brief.goal.adult': 'Halte Lenas Wirkspiegel konstant im grünen Fenster – durch eine regelmäßige tägliche Einnahme.',
  'adh.steady.prompt': 'Gib Lena ihre Tablette. Eine pro Tag hält den Spiegel ruhig im Grünen.',
  'adh.steady.prompt.adult': 'Eine Tablette täglich hält Lena im Steady State – der Spiegel bleibt im therapeutischen Fenster.',
  'adh.steady.btn': 'Eine Tablette geben',
  'adh.steady.reveal': 'Genau so! Gleichmäßig im Grünen. Wichtig: jeden Tag dran denken.',
  'adh.steady.reveal.adult': 'Stabil im Fenster. Der Schutz hängt an der Gleichmäßigkeit – nicht an der einzelnen Dosis.',
  'adh.event.story': 'Es ist Prüfungswoche! 📚 Lena lernt bis spät und an einem Morgen vergisst sie ihre Tablette. Am nächsten Tag denkt sie: „Dann nehme ich heute eben zwei, um es nachzuholen."',
  'adh.event.story.adult': 'Prüfungswoche, viel Stress. An einem Tag vergisst Lena ihre Dosis. Am Folgetag erwägt sie, die doppelte Menge zu nehmen, um die verpasste „nachzuholen".',
  'adh.event.reveal': 'Ist „zwei auf einmal" wirklich eine gute Idee? Plane Lenas Woche und probier es aus!',
  'adh.event.reveal.adult': 'Ist „Nachholen durch Verdoppeln" korrekt? Plane die Woche und beobachte den Spiegelverlauf.',
  'adh.build.prompt': 'Bau Lenas Woche: in jedes Kästchen genau eine Tablette. Tippe ein Kästchen, um zu wechseln: leer = vergessen, zwei = doppelt.',
  'adh.build.prompt.adult': 'Erstelle Lenas 7-Tage-Plan (Mo–So): pro Tag eine Tablette. Tippen wechselt: leer = vergessene Dosis, doppelt = „Nachholen".',
  'adh.build.hint': 'Tipp: jeden Tag genau eine 💊. Dann auf „Woche abspielen".',
  'adh.build.play': 'Woche abspielen',
  'adh.play.watch': 'Schau auf den Spiegel – dein Plan wird zur Kurve …',
  'adh.play.watch.adult': 'Tagesweise Wiedergabe – der Spiegel folgt deinem Plan.',
  'adh.quiz.prompt': 'Letzte Frage: Lena hat eine Tablette vergessen. Was ist richtig?',
  'adh.quiz.prompt.adult': 'Lena hat eine Dosis ausgelassen. Wie ist korrekt fortzufahren?',
  'adh.q.normal': 'Einfach normal mit einer Tablette weitermachen',
  'adh.q.double': 'Am nächsten Tag zwei nehmen, um es nachzuholen',
  'adh.q.stop': 'Lieber ganz aufhören, ist eh stressig',
  'adh.q.retitrate': 'Nach einer längeren Pause die Dosis langsam neu aufbauen',
  'adh.qfb.normal': 'Genau! Eine vergessene Tablette holt man nicht durch zwei nach – einfach normal weiter.',
  'adh.qfb.normal.adult': 'Korrekt – vergessene Dosis nicht verdoppeln; mit der üblichen Einzeldosis fortfahren.',
  'adh.qfb.double': 'Nein – zwei auf einmal ist zu viel. Der Spiegel schießt über, das wird gefährlich.',
  'adh.qfb.double.adult': 'Falsch – Verdopplung führt zu dosisabhängiger Toxizität (Ataxie, Doppelbilder, Sedierung).',
  'adh.qfb.stop': 'Nein – ohne Tabletten fehlt der Schutz, dann können Anfälle kommen.',
  'adh.qfb.stop.adult': 'Falsch – Absetzen entzieht den Anfallsschutz → Durchbruchsanfälle; AED nie eigenmächtig abbrechen.',
  'adh.qfb.retitrate': 'Das gilt für eine längere Pause – hier war nur ein Tag. Da reicht: einfach normal weitermachen.',
  'adh.qfb.retitrate.adult': 'Richtig nur für eine längere Pause (dann neu eintitrieren – sonst Risiko schwerer Hautreaktionen, SJS/TEN). Für eine einzelne vergessene Dosis genügt: normal weitermachen.',
  'adh.out.win.title': 'Rhythmus gehalten! 🎉',
  'adh.out.win.sub': 'Jeden Tag genau eine – Lena ist die ganze Woche sicher geschützt.',
  'adh.out.win.sub.adult': 'Konstanter Spiegel über die Woche – durchgehender Anfallsschutz.',
  'adh.out.over.title': 'Überschossen! ⚠️',
  'adh.out.over.sub': 'Zwei auf einmal lassen den Spiegel überschießen – das macht müde und schwindelig.',
  'adh.out.over.sub.adult': 'Überdosis durch „Nachholen" → dosisabhängige Toxizität. Verpasste Dosis niemals verdoppeln.',
  'adh.out.under.title': 'Schutz weg …',
  'adh.out.under.sub': 'Zu oft vergessen – ohne genug Wirkstoff bricht der Schutz weg, ein Anfall kann kommen.',
  'adh.out.under.sub.adult': 'Unterdosiert durch wiederholte Auslassungen → Spiegel unter dem Fenster → Durchbruchsanfall.',
  'adh.out.dyk1': 'Jeden Tag genau eine Tablette hält den Schutz gleichmäßig.',
  'adh.out.dyk1.adult': 'Lamotrigin schützt nur bei konstantem Wirkspiegel – Regelmäßigkeit ist die Therapie.',
  'adh.out.dyk2': 'Eine vergessene Tablette nicht mit zwei nachholen – einfach normal weitermachen.',
  'adh.out.dyk2.adult': 'Verpasste Dosis nicht verdoppeln. Nach einer längeren Pause zudem neu eintitrieren (sonst Risiko SJS/TEN).',

  // ===== Story „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin) =====
  'jk.brief.patient': 'Frau Berger, 54, hat eine neue Niere bekommen. Damit ihr Körper die neue Niere nicht wegschiebt, nimmt sie jeden Tag ein Schutz-Medikament.',
  'jk.brief.patient.adult': 'Frau Berger, 54, nach Nierentransplantation. Zum Schutz des Transplantats vor Abstoßung nimmt sie täglich Ciclosporin.',
  'jk.brief.goal': 'Halte den Schutz im grünen Bereich. Wenn er zu tief fällt, ist die neue Niere in Gefahr.',
  'jk.brief.goal.adult': 'Halte den Ciclosporin-Talspiegel im therapeutischen Fenster. Fällt er zu tief, droht Abstoßung.',
  'jk.dose.title': 'Standarddosis',
  'jk.dose.prompt': 'Zuerst bekommt Frau Berger ihr Schutz-Medikament wie immer.',
  'jk.dose.prompt.adult': 'Initiale Standardgabe Ciclosporin: der Talspiegel soll ins therapeutische Fenster.',
  'jk.dose.btn': 'Standarddosis geben',
  'jk.dose.moving': 'Der Schutz steigt in den grünen Bereich …',
  'jk.dose.reveal': 'Genau richtig — im grünen Bereich! Die neue Niere ist geschützt.',
  'jk.dose.reveal.adult': 'Im therapeutischen Fenster — Transplantat sicher immunsupprimiert.',
  'jk.week.start': 'Routine prüfen',
  'jk.week.kicker': 'Eine Woche später',
  'jk.week.title': 'Finde das versteckte Leck',
  'jk.week.prompt': 'Gehe Tag für Tag durch Frau Bergers Routine. Tippe nur neue Mittel, Kapseln oder Pflanzenprodukte in den Medikationscheck.',
  'jk.week.prompt.adult': 'Rekonstruiere die Arzneimittelanamnese. Markiere neue Arznei-, Supplement- oder Pflanzenprodukt-Expositionen.',
  'jk.week.checklist': 'Check',
  'jk.week.checked': 'im Medikationscheck',
  'jk.week.tapCheck': 'antippen = prüfen',
  'jk.week.inspect': 'Etikett / Hinweis',
  'jk.week.falseFlag': 'Kann man fragen — aber das erklärt den fallenden Ciclosporin-Schutz nicht.',
  'jk.week.nextDay': 'Nächster Tag',
  'jk.week.toFinale': 'Leck schließen',
  'jk.week.pumpReady': 'Bereit für den nächsten Tag.',
  'jk.week.pumpMoving': 'Der Schutz driftet — warte kurz auf den Torso.',
  'jk.week.mo.short': 'Mo',
  'jk.week.di.short': 'Di',
  'jk.week.mi.short': 'Mi',
  'jk.week.do.short': 'Do',
  'jk.week.fr.short': 'Fr',
  'jk.week.sa.short': 'Sa',
  'jk.week.so.short': 'So',
  'jk.week.mo.title': 'Alles wie immer',
  'jk.week.mo.note': 'Ciclosporin ist bekannt und der Schutz liegt grün.',
  'jk.week.di.title': 'Neuer Tee',
  'jk.week.di.note': 'Im Schrank steht plötzlich ein Stimmungstee.',
  'jk.week.mi.title': 'Neue Kapseln',
  'jk.week.mi.note': 'Neben dem Tee tauchen pflanzliche Stimmungskapseln auf.',
  'jk.week.do.title': 'Nichts Auffälliges',
  'jk.week.do.note': 'Spaziergang und Apfel sehen gesund aus — der Schutz sinkt trotzdem langsam.',
  'jk.week.fr.title': 'Der Effekt wächst',
  'jk.week.fr.note': 'Nicht ein einzelner Schluck: die Körper-Aufräumer werden jeden Tag aktiver.',
  'jk.week.sa.title': 'Unter dem Fenster',
  'jk.week.sa.note': 'Gesundes Essen ist nicht das Problem. Der Schutz rutscht weiter.',
  'jk.week.so.title': 'Alarm',
  'jk.week.so.note': 'Ciclosporin wurde genommen wie immer — aber der Schutz ist zu tief.',
  'jk.card.ciclosporin': 'Ciclosporin wie immer',
  'jk.card.ciclosporin.detail': 'Bekanntes Schutz-Medikament. Es gehört zum Plan, ist aber nicht neu.',
  'jk.card.breakfast': 'Frühstück',
  'jk.card.breakfast.detail': 'Keine neue Arznei und kein Pflanzenpräparat.',
  'jk.card.tea': 'Stimmungstee',
  'jk.card.tea.detail': 'Vorderseite: „Pflanzlich. Für gute Stimmung." Das sollte in den Medikationscheck.',
  'jk.card.caps': 'Stimmungskapseln',
  'jk.card.caps.detail': 'Auch frei verkäufliche Kapseln können ein Wirkstoff sein.',
  'jk.card.camomile': 'Kamillentee',
  'jk.card.camomile.detail': 'Ein harmloser Tee in dieser Geschichte, nicht der sinkende Schutz.',
  'jk.card.water': 'Wasserflasche',
  'jk.card.water.detail': 'Trinken ist wichtig, aber es induziert keinen Ciclosporin-Abbau.',
  'jk.card.walk': 'Spaziergang',
  'jk.card.walk.detail': 'Bewegung ist gut, aber nicht die Wechselwirkung.',
  'jk.card.apple': 'Apfel',
  'jk.card.apple.detail': 'Der Apfel ist ein Ablenker.',
  'jk.card.sleep': 'Schlecht geschlafen',
  'jk.card.sleep.detail': 'Müde sein erklärt den Talspiegel nicht.',
  'jk.card.teaRepeat': 'Tee weiter getrunken',
  'jk.card.teaRepeat.detail': 'Der neue Tee läuft weiter — dadurch kann Induktion stärker werden.',
  'jk.card.food': 'Gesund gegessen',
  'jk.card.food.detail': 'Gesundes Essen ist gut, aber nicht die Ursache.',
  'jk.card.mask': 'Schlafmaske',
  'jk.card.mask.detail': 'Hilft beim Schlafen, ist aber kein Arzneimittel.',
  'jk.card.low': 'Schutz fällt sichtbar',
  'jk.card.low.detail': 'Jetzt sieht man die Folge: zu wenig Ciclosporin-Schutz.',
  'jk.card.ciclosporinSame': 'Ciclosporin unverändert',
  'jk.card.ciclosporinSame.detail': 'Die Dosis blieb gleich. Etwas anderes hat den Abbau beschleunigt.',
  'jk.label.front': 'Rückseite gelesen:',
  'jk.label.back': 'Enthält Johanniskraut / Hypericum perforatum',
  'jk.ind.title': 'Induktion über Tage',
  'jk.ind.herbDays': 'Johanniskraut-Tage',
  'jk.ind.cleanup': 'CYP3A4 / P-gp aktiver',
  'jk.ind.protection': 'Ciclosporin-Schutz',
  'jk.ind.trendPrompt': 'Was zeigt der Trend?',
  'jk.ind.delayed': 'Baut sich über Tage auf',
  'jk.ind.instant': 'Sofort-Effekt',
  'jk.ind.delayedFb': 'Genau: Induktion wird Tag für Tag stärker.',
  'jk.ind.instantFb': 'Fast — hier ist nicht der erste Schluck das Problem, sondern der Aufbau über Tage.',
  'jk.leak.prompt': 'Stopp das Leck',
  'jk.leak.prompt.adult': 'Leck-Finale: sichere Maßnahmen schließen',
  'jk.leak.sub': 'Der Schutz fällt weiter. Zieh die Maßnahmen in die passenden Schlösser oder tippe Karte und Schloss.',
  'jk.leak.sub.adult': 'Der Spiegel driftet subtherapeutisch. Ursache stoppen, Monitoring sichern, Transplantationsstelle einbeziehen.',
  'jk.leak.tapSlot': 'Jetzt ein passendes Schloss antippen.',
  'jk.slot.cause': 'Ursache stoppen',
  'jk.slot.monitor': 'Sicherheit prüfen',
  'jk.slot.contact': 'Hilfe holen',
  'jk.slot.empty': 'Maßnahme hier ablegen',
  'jk.act.absetzen': '🌿 Johanniskraut absetzen',
  'jk.act.ambulanz': '📞 Transplant-Ambulanz anrufen',
  'jk.act.spiegel': '🩸 Talspiegel messen lassen',
  'jk.act.tee': '🍵 Mehr Tee trinken',
  'jk.act.verdoppeln': '💊 Heimlich Dosis verdoppeln',
  'jk.act.naturmittel': '🌼 Noch ein Naturmittel dazu',
  'jk.fb.absetzen': 'Ursache gestoppt. Der Schutz kann sich wieder erholen.',
  'jk.fb.absetzen.adult': 'Johanniskraut abgesetzt: die Ursache der Induktion ist entfernt.',
  'jk.fb.ambulanz': 'Richtig — die Transplant-Ambulanz muss mitsteuern.',
  'jk.fb.ambulanz.adult': 'Richtig — Transplantationszentrum/ärztliche Stelle einbeziehen.',
  'jk.fb.spiegel': 'Richtig — der Spiegel muss kontrolliert werden.',
  'jk.fb.spiegel.adult': 'Richtig — Talspiegelkontrolle ist zur Steuerung erforderlich.',
  'jk.fb.wrongSlot': 'Gute Maßnahme, aber sie gehört in ein anderes Schloss.',
  'jk.fb.tee': 'Nein — mehr Johanniskraut lässt das Leck schneller laufen.',
  'jk.fb.tee.adult': 'Falsch — mehr Johanniskraut verstärkt die Induktion; der Spiegel fällt schneller.',
  'jk.fb.verdoppeln': 'Gefährlich: nicht heimlich an Ciclosporin drehen.',
  'jk.fb.verdoppeln.adult': 'Gefährlich — eigenmächtiges Hochdosieren bei veränderlicher Induktion ist unberechenbar.',
  'jk.fb.naturmittel': 'Nein — noch ein Naturmittel kann wieder neue Wechselwirkungen machen.',
  'jk.fb.naturmittel.adult': 'Falsch — zusätzliche Phytotherapeutika/Supplements erhöhen das Interaktionsrisiko.',
  'jk.out.win.title': 'Schutz gerettet! 🎉',
  'jk.out.win.sub': 'Du hast das Leck gestoppt — die neue Niere bleibt geschützt.',
  'jk.out.win.sub.adult': 'Johanniskraut abgesetzt, Talspiegelkontrolle und Rücksprache gesichert — Transplantat geschützt.',
  'jk.out.under.title': 'Abstoßung! ⚠️',
  'jk.out.under.sub': 'Der Schutz ist zu tief gefallen — die neue Niere ist in Gefahr. Probier’s nochmal!',
  'jk.out.under.sub.adult': 'Subtherapeutischer Ciclosporin-Spiegel → Abstoßungsgefahr. Deshalb: Johanniskraut absetzen, Talspiegel kontrollieren und ärztlich gegensteuern.',
  'jk.out.dyk1': 'Johanniskraut kurbelt CYP3A4 und P-gp an — dann kann zu wenig Ciclosporin da sein.',
  'jk.out.dyk1.adult': 'Hyperforin induziert über PXR CYP3A4 und P-Glykoprotein.',
  'jk.out.dyk2': 'Das baut sich über Tage auf, nicht sofort nach dem ersten Schluck.',
  'jk.out.dyk2.adult': 'Ciclosporin-Exposition sinkt → subtherapeutischer Talspiegel → Abstoßungsgefahr.',
  'jk.out.dyk3': 'Tee, Kapseln und Pflanzenmittel gehören auch in den Medikationscheck.',
  'jk.out.dyk3.adult': 'Pflanzliche Präparate und Supplements sind Teil der Arzneimittelanamnese.',
  'jk.out.dyk4': 'Nicht selbst die Dosis ändern — Fachleute fragen.',
  'jk.out.dyk4.adult': 'Management: Johanniskraut absetzen, Talspiegel kontrollieren, Transplantationszentrum/ärztliche Stelle einbeziehen.',

  // admin
  'admin.title': 'Admin / Kalibrierung',
  'admin.pumpIn': '▲ Pumpe REIN',
  'admin.pumpOut': '▼ Pumpe RAUS',
  'admin.stop': '■ Stopp',
  'admin.reset': 'Auf Basislinie',
  'admin.close': 'Schließen',
  'admin.hold': 'gedrückt halten = pumpen',
  'admin.speed': 'Geschwindigkeit',
  'admin.timed': 'Zeitlauf (automatisch stoppen)',
  'admin.calib': 'Kalibrierung',
  'admin.state': 'Live-Status',
  'admin.flow': 'Fluss',
  'admin.dir': 'Richtung',
  'admin.running': 'Pumpe',
  'admin.mockNote': 'MOCK-Modus: keine echte Pumpe – nur Simulation.',
  'admin.resetSection': 'Entleeren / Reset',
  'admin.emptyTime': 'Leer-Pumpzeit (s)',
  'admin.primeMl': 'Vorfüllen (ml)',
  'admin.volumeMl': 'Torso-Volumen (ml)',
  'admin.saveParams': 'Werte speichern',
  'admin.empty': '⏏ Entleeren (überpumpen)',
  'admin.calibReset': 'Kalibrierter Reset',
  'admin.resetHint':
    'Entleeren pumpt OUT über die Torso-Menge hinaus (zieht am Ende Luft – für eine Peristaltikpumpe unkritisch). „Kalibrierter Reset" entleert und füllt dann „Vorfüllen" ml wieder ein.',

  // system: clean shutdown / reboot + read-only-overlay (power-cut protection) status
  'admin.system': 'System',
  'admin.shutdown': '⏻ Herunterfahren',
  'admin.reboot': '↻ Neustart',
  'admin.shutdownConfirm': 'Wirklich ausschalten? Zum Bestätigen erneut tippen.',
  'admin.rebootConfirm': 'Wirklich neu starten? Zum Bestätigen erneut tippen.',
  'admin.shuttingDown': 'Fährt herunter … Strom erst trennen, wenn der Bildschirm aus ist.',
  'admin.rebooting': 'Startet neu …',
  'admin.locked': '🔒 GESPERRT',
  'admin.unlocked': '🔓 OFFEN',
  'admin.lockedHint':
    'Schreibgeschützt – übersteht Stromausfälle. Änderungen an Kalibrierung/Einstellungen gehen beim Neustart verloren. Zum dauerhaften Ändern per SSH: deploy/overlay.sh off → neu starten.',
  'admin.unlockedHint':
    'Beschreibbar – Änderungen bleiben erhalten. Für den Dauerbetrieb per SSH sperren: deploy/overlay.sh on → neu starten (schützt vor Stromausfall-Schäden).',

  // virtual torso — dev-only twin panel outside the Pi frame
  'twin.title': 'Virtueller Torso',
  'twin.volume': 'Volumen',
  'twin.target': 'Ziel',
  'twin.flow': 'Fluss',
  'twin.idle': 'Pumpe aus',
  'twin.offline': 'keine Verbindung',

  // guided calibration wizard
  'cal.startGuided': 'Geführte Kalibrierung starten',
  'cal.title': 'Geführte Kalibrierung',
  'cal.step': 'Schritt',
  'cal.intro':
    'Wir messen das Totband (Mindest-Tastgrad) und den Durchfluss. Bereithalten: Waage + Behälter (1 g ≈ 1 ml).',
  'cal.start': 'Starten',
  'cal.prime': 'Schläuche füllen — gedrückt halten',
  'cal.deadband': 'Totband',
  'cal.deadbandHelp':
    'Tastgrad einstellen, „Testen" halten, bis sich der Rotor gerade dreht – dann übernehmen.',
  'cal.test': 'Testen (halten)',
  'cal.capture': 'Übernehmen',
  'cal.skip': 'Überspringen',
  'cal.flowTitle': 'Durchfluss messen',
  'cal.flowHelp':
    'Behälter auf die Waage, Messlauf starten, dann die gewogene Menge eintragen (1 g ≈ 1 ml).',
  'cal.pickSecs': 'Messdauer',
  'cal.running': 'Messlauf läuft …',
  'cal.startRun': 'Messlauf starten',
  'cal.grams': 'Gewogene Menge (g ≈ ml)',
  'cal.apply': 'Übernehmen',
  'cal.review': 'Überprüfen & Speichern',
  'cal.rate': 'Rate @100 %',
  'cal.save': 'Kalibrierung speichern',
  'cal.discard': 'Verwerfen',
  'cal.savedMsg': 'Kalibrierung gespeichert ✓',
  'cal.savedWhere': 'Gespeichert in backend/calibration.json (überlebt Neustarts, beim Booten geladen).',
  'cal.close': 'Schließen',

  // ── per-story copy (spread last → overrides any older inline <id>.* block) ──
  ...ddiLocale,
  ...geneLocale,
  ...adherenceLocale,
  ...organLocale,
  ...johanniskrautLocale,
}

// Start-screen translations (test of the t() mechanism). Everything else still
// falls back to German until the rest of each dictionary is written.
const en: Record<string, string> = {
  'app.subtitle': 'Get your patient through safely!',
  'start.lang': 'Language',
  'start.age': "Who's playing?",
  'age.young': 'Kids & teens',
  'age.adult': 'Adults',
  'start.go': "Let's go",
  'start.credit': 'SafePolyMed · EU research project · Clinical Pharmacy, Saarland University',
  // story select
  'stories.title': 'Choose a story',
  'common.back': 'Back',
  'story.grapefruit.title': 'The Breakfast Trap',
  'story.grapefruit.desc': 'Lower cholesterol — but watch out at breakfast. (Food)',
  'story.johanniskraut.title': 'The Herbal Leak',
  'story.johanniskraut.desc': 'St. John’s wort drains transplant protection. (Herb/drug)',
  'story.gene.title': 'Everyone is different',
  'story.gene.desc': 'Same dose, different genes. (Gene interaction)',
  'story.ddi.title': 'When pills clash',
  'story.ddi.desc': 'Two medicines, one problem. (Interaction)',
  'story.organ.title': 'Weak organs',
  'story.organ.desc': 'Kidney and liver work more slowly.',
  'story.adherence.title': 'Double by accident',
  'story.adherence.desc': 'One pill too many … or too few?',
}

const fr: Record<string, string> = {
  'app.subtitle': 'Amène ton patient à bon port, en toute sécurité !',
  'start.lang': 'Langue',
  'start.age': 'Qui joue ?',
  'age.young': 'Enfants & ados',
  'age.adult': 'Adultes',
  'start.go': "C'est parti !",
  'start.credit':
    "SafePolyMed · Projet de recherche de l'UE · Pharmacie clinique, Université de la Sarre",
  // story select
  'stories.title': 'Choisis une histoire',
  'common.back': 'Retour',
  'story.grapefruit.title': 'Le piège du petit-déjeuner',
  'story.grapefruit.desc': 'Faire baisser le cholestérol – mais attention au petit-déjeuner. (Alimentation)',
  'story.johanniskraut.title': 'La fuite végétale',
  'story.johanniskraut.desc': 'Le millepertuis fait baisser la protection du greffon. (Plante/médicament)',
  'story.gene.title': 'Chacun est différent',
  'story.gene.desc': 'Même dose, gènes différents. (Interaction génétique)',
  'story.ddi.title': 'Quand les pilules se disputent',
  'story.ddi.desc': 'Deux médicaments, un problème. (Interaction)',
  'story.organ.title': 'Organes affaiblis',
  'story.organ.desc': 'Les reins et le foie travaillent plus lentement.',
  'story.adherence.title': 'Le double par erreur',
  'story.adherence.desc': 'Un comprimé de trop … ou pas assez ?',
}

const nl: Record<string, string> = {
  'app.subtitle': 'Loods je patiënt veilig erdoorheen!',
  'start.lang': 'Taal',
  'start.age': 'Wie speelt er?',
  'age.young': 'Kinderen & jongeren',
  'age.adult': 'Volwassenen',
  'start.go': 'Aan de slag',
  'start.credit':
    'SafePolyMed · EU-onderzoeksproject · Klinische Farmacie, Universiteit van Saarland',
  // story select
  'stories.title': 'Kies een verhaal',
  'common.back': 'Terug',
  'story.grapefruit.title': 'De ontbijtval',
  'story.grapefruit.desc': 'Cholesterol verlagen – maar pas op bij het ontbijt. (Voeding)',
  'story.johanniskraut.title': 'Het plantaardige lek',
  'story.johanniskraut.desc': 'Sint-janskruid laat de transplantaatbescherming dalen. (Plant/geneesmiddel)',
  'story.gene.title': 'Iedereen is anders',
  'story.gene.desc': 'Zelfde dosis, andere genen. (Gen-interactie)',
  'story.ddi.title': 'Als pillen ruziën',
  'story.ddi.desc': 'Twee medicijnen, één probleem. (Interactie)',
  'story.organ.title': 'Zwakke organen',
  'story.organ.desc': 'Nieren en lever werken trager.',
  'story.adherence.title': 'Per ongeluk dubbel',
  'story.adherence.desc': 'Eén tablet te veel … of te weinig?',
}

const ar: Record<string, string> = {
  'app.subtitle': 'اجتَز بمريضك بأمان!',
  'start.lang': 'اللغة',
  'start.age': 'مَن يلعب؟',
  'age.young': 'الأطفال والمراهقون',
  'age.adult': 'البالغون',
  'start.go': 'هيا نبدأ',
  'start.credit': 'SafePolyMed · مشروع بحثي من الاتحاد الأوروبي · الصيدلة السريرية، جامعة زارلاند',
  // story select
  'stories.title': 'اختر قصة',
  'common.back': 'رجوع',
  'story.grapefruit.title': 'فخ الفطور',
  'story.grapefruit.desc': 'خفض الكوليسترول – لكن انتبه عند الفطور. (غذاء)',
  'story.johanniskraut.title': 'التسرّب النباتي',
  'story.johanniskraut.desc': 'نبتة سانت جون تُنقص حماية الزرع. (نبات/دواء)',
  'story.gene.title': 'كل شخص مختلف',
  'story.gene.desc': 'نفس الجرعة، جينات مختلفة. (تفاعل جيني)',
  'story.ddi.title': 'عندما تتعارض الأدوية',
  'story.ddi.desc': 'دواءان، مشكلة واحدة. (تفاعل دوائي)',
  'story.organ.title': 'أعضاء ضعيفة',
  'story.organ.desc': 'الكلى والكبد يعملان ببطء أكبر.',
  'story.adherence.title': 'جرعة مضاعفة عن طريق الخطأ',
  'story.adherence.desc': 'حبة زائدة … أم ناقصة؟',
}

const dicts: Record<Locale, Record<string, string>> = { de, en, fr, nl, ar }

// Dev-only: the raw dictionaries, exposed for the /preview copy proof-sheet
// (read every screen's text across ages/locales to hunt typos). The only importer
// is gated behind import.meta.env.DEV in main.ts, so this is tree-shaken out of
// production builds. `de` is the complete dictionary (the others fall back to it).
export const DICTS = dicts

export function t(key: string, params?: Params): string {
  const dict = dicts[i18n.locale]
  const aged = `${key}.${i18n.age}`
  // age-specific → age-specific(de) → plain → plain(de) → key
  let s = dict[aged] ?? de[aged] ?? dict[key] ?? de[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
