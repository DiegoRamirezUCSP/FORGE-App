import { Exercise, MuscleGroup } from '../types';

// Los ids son estables: no renombrar una vez que haya datos guardados.
export const EXERCISES: Exercise[] = [
  { id: 'press_banca', name: 'Press banca', group: 'Pecho' },
  { id: 'press_inclinado', name: 'Press inclinado con mancuernas', group: 'Pecho' },
  { id: 'aperturas', name: 'Aperturas', group: 'Pecho' },
  { id: 'peso_muerto', name: 'Peso muerto', group: 'Espalda' },
  { id: 'remo_barra', name: 'Remo con barra', group: 'Espalda' },
  { id: 'jalon_pecho', name: 'Jalón al pecho', group: 'Espalda' },
  { id: 'sentadilla', name: 'Sentadilla', group: 'Piernas' },
  { id: 'prensa', name: 'Prensa de piernas', group: 'Piernas' },
  { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', group: 'Piernas' },
  { id: 'zancadas', name: 'Zancadas con mancuernas', group: 'Piernas' },
  { id: 'press_militar', name: 'Press militar', group: 'Hombros' },
  { id: 'elevaciones_laterales', name: 'Elevaciones laterales', group: 'Hombros' },
  { id: 'curl_biceps', name: 'Curl de bíceps', group: 'Brazos' },
  { id: 'triceps_polea', name: 'Tríceps en polea', group: 'Brazos' },
  { id: 'crunch_polea', name: 'Crunch en polea', group: 'Core' },
  { id: 'rueda_abdominal', name: 'Rueda abdominal', group: 'Core' },
];

export const GROUPS: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

/** Los tres básicos del onboarding. */
export const BASE_LIFTS = ['press_banca', 'sentadilla', 'peso_muerto'];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
