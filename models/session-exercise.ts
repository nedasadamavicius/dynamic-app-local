import { Exercise } from './exercise';
import { ExerciseSet } from './exercise-set';

export interface SessionExercise {
  weid: number;
  exercise: Exercise;
  sets: ExerciseSet[];
}