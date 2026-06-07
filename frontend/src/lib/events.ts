// The authored event pool + patient(s) + dose options. A play draws & shuffles
// events from here (see game.svelte.ts). All user text is locale keys.

export const DOSE = { low: 50, standard: 62, high: 74 } as const
export type DoseKey = keyof typeof DOSE

export type Apply =
  | { kind: 'setBase'; base: number }
  | { kind: 'removeFactor'; factorId: string }
  | { kind: 'none' }

export interface Choice {
  id: string
  labelKey: string
  apply: Apply
  correct: boolean
}

export interface Knowledge {
  promptKey: string
  options: { id: string; labelKey: string; correct: boolean }[]
  lessonKey: string
}

export interface GameEvent {
  id: string
  type: 'FDI' | 'DDI' | 'DGI' | 'distractor'
  icon: string
  storyKey: string
  factorId?: string // multiplier this event adds when it fires
  factor?: number
  knowledge: Knowledge
  decisionPromptKey: string
  choices: Choice[]
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

const upDownNone = (correct: 'up' | 'down' | 'none') => [
  { id: 'up', labelKey: 'opt.up', correct: correct === 'up' },
  { id: 'down', labelKey: 'opt.down', correct: correct === 'down' },
  { id: 'none', labelKey: 'opt.none', correct: correct === 'none' },
]

export const EVENTS: Record<string, GameEvent> = {
  grapefruit: {
    id: 'grapefruit',
    type: 'FDI',
    icon: '🍊',
    storyKey: 'ev.grapefruit.story',
    factorId: 'cyp3a4',
    factor: 1.22,
    knowledge: {
      promptKey: 'ev.grapefruit.q',
      options: upDownNone('up'),
      lessonKey: 'ev.grapefruit.lesson',
    },
    decisionPromptKey: 'dec.prompt',
    choices: [
      { id: 'reduce', labelKey: 'dec.reduce', apply: { kind: 'setBase', base: DOSE.low }, correct: true },
      { id: 'stopgf', labelKey: 'dec.stopGrapefruit', apply: { kind: 'removeFactor', factorId: 'cyp3a4' }, correct: true },
      { id: 'nothing', labelKey: 'dec.nothing', apply: { kind: 'none' }, correct: false },
      { id: 'increase', labelKey: 'dec.increase', apply: { kind: 'setBase', base: DOSE.high }, correct: false },
    ],
  },
  apfel: {
    id: 'apfel',
    type: 'distractor',
    icon: '🍎',
    storyKey: 'ev.apfel.story',
    knowledge: {
      promptKey: 'ev.apfel.q',
      options: upDownNone('none'),
      lessonKey: 'ev.apfel.lesson',
    },
    decisionPromptKey: 'dec.prompt',
    choices: [
      { id: 'nothing', labelKey: 'dec.nothing', apply: { kind: 'none' }, correct: true },
      { id: 'reduce', labelKey: 'dec.reduce', apply: { kind: 'setBase', base: DOSE.low }, correct: false },
    ],
  },
}
