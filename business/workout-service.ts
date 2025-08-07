import { WorkoutPlan } from '@/models/workout-plan';
import { Workout } from '@/models/workout';
import { SessionExercise } from '@/models/session-exercise';

export interface WorkoutService {

  getWorkoutPlans(): Promise<WorkoutPlan[]>;

  getWorkoutsOfWorkoutPlan(planId: number): Promise<Workout[]>;

  getWorkout(workoutId: number): Promise<Workout>

  getExercisesOfWorkout(workoutId: number): Promise<SessionExercise[]>;

  createWorkoutPlan(workoutPlanName: string): Promise<number>;

  createWorkout(workoutName: string, workoutPlanId: number): Promise<number>;
  
  createExercise(name: string): Promise<void>;
  
  linkWorkoutToExercise(exerciseId: number, workoutId: number): Promise<void>;
  
  addSetsToExercise(workoutExerciseId: number, numberOfSets: number): Promise<void>;

  createExerciseForWorkout(
    exerciseName: string,
    workoutId: number,
    numberOfSets: number
  ): Promise<void>
}