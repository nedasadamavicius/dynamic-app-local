import { WorkoutPlan } from '@/models/workout-plan';
import { Workout } from '@/models/workout';
import { SessionExercise } from '@/models/session-exercise';
import { Exercise } from '@/models/exercise';
import { OneRepMax } from '@/models/one-rep-max';

export interface WorkoutService {

  getWorkoutPlans(): Promise<WorkoutPlan[]>;

  getWorkoutsOfWorkoutPlan(planId: number): Promise<Workout[]>;

  getWorkout(workoutId: number): Promise<Workout>

  getExercisesOfWorkout(workoutId: number): Promise<SessionExercise[]>;

  createWorkoutPlan(workoutPlanName: string): Promise<number>;

  createWorkout(workoutName: string, workoutPlanId: number): Promise<number>;
  
  createExercise(exerciceName: string): Promise<number>
  
  linkWorkoutToExercise(exerciseId: number, workoutId: number): Promise<number>;
  
  addSetsToExercise(workoutExerciseId: number, numberOfSets: number): Promise<void>;

  addSetToExercise(setNumber: number, workoutExerciseId: number): Promise<void>;

  createExerciseForWorkout(
    exerciseName: string,
    workoutId: number,
    numberOfSets: number
  ): Promise<void>;

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

  removeWorkoutExercise(workoutExerciseId: number): Promise<void>;

  removeExercise(exerciseId: number): Promise<void>;

  removeWorkout(workoutId: number): Promise<void>;

  removeWorkoutPlan(workoutPlanId: number): Promise<void>;

  changeExerciseName(exerciseId: number, newExerciseName: string): Promise<void>;

  changeWorkoutName(workoutId: number, newWorkoutName: string): Promise<void>;

  changeWorkoutPlanName(workoutPlanId: number, newWorkoutPlanName: string): Promise<void>;

  getExercises(): Promise<Exercise[]>;

  createOneRepMax(exerciseId: number, weight: number): Promise<void>;

  getOneRepMaxes(): Promise<OneRepMax[]>;
}