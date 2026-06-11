// The story catalogue shown on the selection screen. Every story is a patient +
// a self-contained v2 play component, routed by id in App.svelte.
import { PATIENTS, type Patient } from './events'

export interface Story {
  id: string
  titleKey: string
  descKey: string
  icon: string
  color: string
  available: boolean
  patient: Patient
  engine?: 'v2'
}

export const STORIES: Story[] = [
  { id: 'grapefruit', titleKey: 'story.grapefruit.title', descKey: 'story.grapefruit.desc', icon: '🥣', color: '#ffb703', available: true, engine: 'v2', patient: PATIENTS[0] },
  // only the first story is playable for now; the rest show a „coming soon" stamp
  // and are non-clickable (available:false → selectStory early-returns + the card is disabled).
  { id: 'johanniskraut', titleKey: 'story.johanniskraut.title', descKey: 'story.johanniskraut.desc', icon: '🌿', color: '#38e0a0', available: false, engine: 'v2', patient: PATIENTS[0] },
  { id: 'gene', titleKey: 'story.gene.title', descKey: 'story.gene.desc', icon: '🧬', color: '#b794ff', available: false, engine: 'v2', patient: PATIENTS[0] },
  { id: 'ddi', titleKey: 'story.ddi.title', descKey: 'story.ddi.desc', icon: '💊', color: '#4cc9f0', available: false, engine: 'v2', patient: PATIENTS[0] },
  { id: 'organ', titleKey: 'story.organ.title', descKey: 'story.organ.desc', icon: '🫘', color: '#ff6b7a', available: false, engine: 'v2', patient: PATIENTS[0] },
  { id: 'adherence', titleKey: 'story.adherence.title', descKey: 'story.adherence.desc', icon: '⏰', color: '#9aa6c9', available: false, engine: 'v2', patient: PATIENTS[0] },
]
