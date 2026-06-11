// Patient roster for the stories. (The old v1 engine's event/choice/fruit data
// model was retired when every story moved to a self-contained v2 play component;
// each story now owns its own data in src/lib/stories/<id>.ts.)

export interface Patient {
  id: string
  nameKey: string
  lineKey: string
  drugKey: string
}

export const PATIENTS: Patient[] = [
  { id: 'schmidt', nameKey: 'p.schmidt.name', lineKey: 'p.schmidt.line', drugKey: 'd.simvastatin' },
]
