import { WorkoutPlan } from '@/models/workout-plan';
import { Workout } from '@/models/workout';
import { SessionExercise } from '@/models/session-exercise';
import { Exercise } from '@/models/exercise';
import { OneRepMax } from '@/models/one-rep-max';
import { Settings } from '@/models/settings';

export interface WorkoutService {

  // workout plan related methods
  getWorkoutPlans(): Promise<WorkoutPlan[]>;

  getWorkoutsOfWorkoutPlan(planId: number): Promise<Workout[]>;

  createWorkoutPlan(workoutPlanName: string): Promise<number>;

  removeWorkoutPlan(workoutPlanId: number): Promise<void>;

  changeWorkoutPlanName(workoutPlanId: number, newWorkoutPlanName: string): Promise<void>;

  // workout related methods
  getWorkout(workoutId: number): Promise<Workout>

  createWorkout(workoutName: string, workoutPlanId: number): Promise<number>;

  removeWorkout(workoutId: number): Promise<void>;

  changeWorkoutName(workoutId: number, newWorkoutName: string): Promise<void>;

  // exercise related methods
  createExercise(exerciceName: string): Promise<number>
  
  addSetsToExercise(workoutExerciseId: number, numberOfSets: number): Promise<void>;

  addSetToExercise(setNumber: number, workoutExerciseId: number): Promise<void>;

  updateExerciseSet(
    id: number, 
    setNumber: number, 
    weight: number, 
    reps: number, 
    rir: number, 
    percentage: number, 
    weid: number
  ): Promise<void>;

  removeExerciseSet(setId: number): Promise<void>;

  removeExercise(exerciseId: number): Promise<void>;

  changeExerciseName(exerciseId: number, newExerciseName: string): Promise<void>;

  getExercises(): Promise<Exercise[]>;

  updateExerciseSetField(
    setId: number, 
    field: 'weight' | 'reps' | 'rir' | 'percentage', 
    value: number
  ): Promise<void>;

  // workout & exercise related methods
  getExercisesOfWorkout(workoutId: number): Promise<SessionExercise[]>;

  linkWorkoutToExercise(exerciseId: number, workoutId: number): Promise<number>;

  createExerciseForWorkout(exerciseName: string, workoutId: number, numberOfSets: number): Promise<void>;

  removeWorkoutExercise(workoutExerciseId: number): Promise<void>;

  // one rep max & exercise related methods
  getExerciseOneRepMax(exerciseId: number): Promise<OneRepMax>;

  calculateWeight(oneRepMax: number, percentage: number): number;

  // one rep max related methods
  createOneRepMax(exerciseId: number, weight: number): Promise<void>;

  getOneRepMaxes(): Promise<OneRepMax[]>;

  // settings related methods
  getSettings(): Promise<Settings>;

  updateSettings(deloadEnabled: boolean, deloadEverySessions: number): Promise<void>;

  incrementWorkoutCounter(workoutId: number, currentValue: number): Promise<void>;

  resetWorkoutCounter(workoutId: number): Promise<void>;

  getDeloadedExercises(workoutId: number): Promise<SessionExercise[]>;
}