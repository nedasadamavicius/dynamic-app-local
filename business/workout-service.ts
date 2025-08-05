import { WorkoutPlan } from '@/models/workout-plan';
import { Workout } from '@/models/workout';
import { SessionExercise } from '@/models/session-exercise';

export interface WorkoutService {

  getWorkoutPlans(): Promise<WorkoutPlan[]>;

  getWorkoutsOfWorkoutPlan(planId: number): Promise<Workout[]>;

  getWorkout(workoutId: number): Promise<Workout>

  getExercisesOfWorkout(workoutId: number): Promise<SessionExercise[]>;

  createWorkoutPlan(name: string): Promise<void>;

  createWorkout(name: string, workoutPlanId: number): Promise<void>;
  
  createExercise(name: string): Promise<void>;
  
  linkWorkoutToExercise(exerciseId: number, workoutId: number): Promise<void>;
  
  addSetsToExercise(workoutExerciseId: number, numberOfSets: number): Promise<void>;
}