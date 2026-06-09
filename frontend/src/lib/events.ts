// The authored content for a story (§19 / per-story spec): patient, the interaction
// event (loaded story → detective → mechanism → strategy), and the fruit finale.
// All user text is locale keys (each resolves a kid/adult register via t()).
// The strategy DECISION drives the torso directly (no needle): each choice has a
// `result` that the engine turns into a torso movement + ending.

export const DOSE = { low: 50, standard: 62, high: 74 } as const
export type DoseKey = keyof typeof DOSE

export type DecisionResult = 'win' | 'overdose' | 'underdose' | 'retry'

export interface Choice {
  id: string
  labelKey: string
  feedbackKey: string // shown after picking (always say why)
  correct: boolean
  result: DecisionResult
  adultOnly?: boolean // hidden for the `young` register
}

/** One option in a tap-to-find beat (detective / Medikamenten-Check); the correct
 *  one(s) `interacts`. `register` limits an item to one age mode (else: both). */
export interface PlanItem {
  id: string
  labelKey: string
  interacts: boolean
  feedbackKey: string // per-item explanation (why it is / isn't the cause)
  register?: 'young' | 'adult'
}
export interface PlanCheck {
  promptKey: string
  items: PlanItem[]
}

/** One fruit tile in the finale; furanocoumarin-containing citrus `interacts`. */
export interface Fruit {
  id: string
  img: string
  labelKey: string
  interacts: boolean
}
/** The finale (after a winning fix): pick every fruit that interacts like grapefruit. */
export interface FruitGame {
  promptKey: string
  fruits: Fruit[]
  lessonKey: string
}

export interface GameEvent {
  id: string
  type: 'FDI' | 'DDI' | 'DGI' | 'distractor'
  icon: string
  storyKey: string
  factorId?: string // multiplier this event adds when it fires
  factor?: number
  planCheck?: PlanCheck // detective: which item caused it?
  // bridge beat (after the detective): name the culprit + lead into the med-check
  bridgeTitleKey?: string
  mechanismLessonKey: string // the bridge body text
  bridgeButtonKey?: string // CTA on the bridge → med-check
  medCheck?: PlanCheck // which drug is actually affected (specificity lesson)
  decisionPromptKey: string
  choices: Choice[]
  fruitGame?: FruitGame
}

export interface Patient {
  id: string
  nameKey: string
  lineKey: string
  drugKey: string
}

export const PATIENTS: Patient[] = [
  { id: 'schmidt', nameKey: 'p.schmidt.name', lineKey: 'p.schmidt.line', drugKey: 'd.simvastatin' },
]

export const EVENTS: Record<string, GameEvent> = {
  grapefruit: {
    id: 'grapefruit',
    type: 'FDI',
    icon: '🥣',
    storyKey: 'ev.grapefruit.story',
    factorId: 'cyp3a4',
    factor: 1.22,
    // detective: all items were mentioned in the breakfast; only grapefruit interacts
    planCheck: {
      promptKey: 'detect.prompt',
      items: [
        { id: 'apfel', labelKey: 'detect.apfel', interacts: false, feedbackKey: 'detect.fb.apfel' },
        { id: 'birne', labelKey: 'detect.birne', interacts: false, feedbackKey: 'detect.fb.birne' },
        { id: 'kaffee', labelKey: 'detect.kaffee', interacts: false, feedbackKey: 'detect.fb.kaffee' },
        { id: 'grapefruit', labelKey: 'detect.grapefruit', interacts: true, feedbackKey: 'detect.fb.grapefruit' },
        { id: 'jog', labelKey: 'detect.jog', interacts: false, feedbackKey: 'detect.fb.jog' },
        { id: 'tired', labelKey: 'detect.tired', interacts: false, feedbackKey: 'detect.fb.tired' },
      ],
    },
    // bridge: confirm grapefruit, explain it only matters for drugs on this route
    bridgeTitleKey: 'ev.grapefruit.bridge.title',
    mechanismLessonKey: 'ev.grapefruit.lesson',
    bridgeButtonKey: 'ev.grapefruit.bridge.btn',
    // Medikamenten-Check: which drug actually gets stuck? (specificity — Simvastatin)
    medCheck: {
      promptKey: 'medcheck.prompt',
      items: [
        { id: 'simvastatin', labelKey: 'medcheck.simvastatin', interacts: true, feedbackKey: 'medcheck.fb.simvastatin' },
        // young-only decoys: not drugs / not gut-metabolised
        { id: 'pflaster', labelKey: 'medcheck.pflaster', interacts: false, feedbackKey: 'medcheck.fb.pflaster', register: 'young' },
        { id: 'zahnpasta', labelKey: 'medcheck.zahnpasta', interacts: false, feedbackKey: 'medcheck.fb.zahnpasta', register: 'young' },
        // adult-only decoy: other statins are far less CYP3A4-dependent
        { id: 'otherstatin', labelKey: 'medcheck.otherStatin', interacts: false, feedbackKey: 'medcheck.fb.otherStatin', register: 'adult' },
        // shown in both registers
        { id: 'vitc', labelKey: 'medcheck.vitc', interacts: false, feedbackKey: 'medcheck.fb.vitc' },
        // adult-only decoy: not a relevant CYP3A4 substrate here
        { id: 'paracetamol', labelKey: 'medcheck.paracetamol', interacts: false, feedbackKey: 'medcheck.fb.paracetamol', register: 'adult' },
      ],
    },
    decisionPromptKey: 'dec.prompt',
    choices: [
      // ✅ the real fix → torso back into band → WIN (→ fruit finale)
      { id: 'stopgf', labelKey: 'dec.stopGrapefruit', feedbackKey: 'dec.fb.stopGrapefruit', correct: true, result: 'win' },
      // ✅ ask the pharmacy/doctor (adults only) → the safe professional path → WIN
      { id: 'askpro', labelKey: 'dec.askPro', feedbackKey: 'dec.fb.askPro', correct: true, result: 'win', adultOnly: true },
      // ⚠️ workaround (adults only) → looks fixed, then variability → UNDERDOSE loss
      { id: 'reduce', labelKey: 'dec.reduce', feedbackKey: 'dec.fb.reduce', correct: false, result: 'underdose', adultOnly: true },
      // ❌ trap → explain + retry (CYP3A4 block lasts days)
      { id: 'spaceout', labelKey: 'dec.spaceOut', feedbackKey: 'dec.fb.spaceOut', correct: false, result: 'retry' },
      // ❌❌ dangerous → over the critical line → OVERDOSE loss
      { id: 'increase', labelKey: 'dec.increase', feedbackKey: 'dec.fb.increase', correct: false, result: 'overdose' },
    ],
    // finale: which other fruits cause the same CYP3A4 trouble? (not "all citrus")
    fruitGame: {
      promptKey: 'fruits.prompt',
      lessonKey: 'fruits.lesson',
      fruits: [
        { id: 'grapefruit', img: '/fruits/grapefruit.jpg', labelKey: 'fruit.grapefruit', interacts: true },
        { id: 'pomelo', img: '/fruits/pomelo.jpg', labelKey: 'fruit.pomelo', interacts: true },
        { id: 'bitterorange', img: '/fruits/bitterorange.jpg', labelKey: 'fruit.bitterorange', interacts: true },
        { id: 'orange', img: '/fruits/orange.jpg', labelKey: 'fruit.orange', interacts: false },
        { id: 'mandarine', img: '/fruits/mandarine.jpg', labelKey: 'fruit.mandarine', interacts: false },
        { id: 'zitrone', img: '/fruits/zitrone.jpg', labelKey: 'fruit.zitrone', interacts: false },
      ],
    },
  },
}
