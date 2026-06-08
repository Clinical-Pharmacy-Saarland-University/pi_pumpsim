// The story catalogue shown on the selection screen. A story = a patient + an
// event pool (drawn/shuffled per play). We aim for six; one is playable now,
// the rest are placeholders ("bald verfügbar").
import { EVENTS, PATIENTS, type GameEvent, type Patient } from './events'

export interface Story {
  id: string
  titleKey: string
  descKey: string
  icon: string
  color: string
  available: boolean
  patient: Patient
  events: GameEvent[]
  engine?: 'v1' | 'v2' // v2 = self-contained play component (routed by id)
}

export const STORIES: Story[] = [
  {
    id: 'grapefruit',
    titleKey: 'story.grapefruit.title',
    descKey: 'story.grapefruit.desc',
    icon: '🥣',
    color: '#ffb703',
    available: true,
    patient: PATIENTS[0],
    events: [EVENTS.grapefruit],
  },
  { id: 'johanniskraut', titleKey: 'story.johanniskraut.title', descKey: 'story.johanniskraut.desc', icon: '🌿', color: '#38e0a0', available: false, patient: PATIENTS[0], events: [] },
  { id: 'gene', titleKey: 'story.gene.title', descKey: 'story.gene.desc', icon: '🧬', color: '#b794ff', available: true, engine: 'v2', patient: PATIENTS[0], events: [] },
  { id: 'ddi', titleKey: 'story.ddi.title', descKey: 'story.ddi.desc', icon: '💊', color: '#4cc9f0', available: true, engine: 'v2', patient: PATIENTS[0], events: [] },
  { id: 'organ', titleKey: 'story.organ.title', descKey: 'story.organ.desc', icon: '🫘', color: '#ff6b7a', available: true, engine: 'v2', patient: PATIENTS[0], events: [] },
  { id: 'adherence', titleKey: 'story.adherence.title', descKey: 'story.adherence.desc', icon: '⏰', color: '#9aa6c9', available: true, engine: 'v2', patient: PATIENTS[0], events: [] },
]
