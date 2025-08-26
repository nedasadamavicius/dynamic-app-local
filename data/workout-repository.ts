import { Exercise } from "@/models/exercise";
import { ExerciseSet } from "@/models/exercise-set";
import { OneRepMax } from "@/models/one-rep-max";
import { Workout } from "@/models/workout";
import { WorkoutExercise } from "@/models/workout-exercise";
import { WorkoutPlan } from "@/models/workout-plan";

export interface WorkoutRepository {

    selectWorkoutPlans(): Promise<WorkoutPlan[]>;

    selectWorkoutsPerWorkoutPlan(workoutPlanId: number): Promise<Workout[]>;

    selectWorkout(workoutId: number): Promise<Workout>;

    selectWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]>;

    selectExercise(exerciseId: number): Promise<Exercise>;

    selectExerciseSets(workoutExerciseId: number): Promise<ExerciseSet[]>;

    insertWorkoutPlan(workoutPlanName: string): Promise<number>;

    insertWorkout(workoutName: string, workoutPlanId: number): Promise<number>;

    insertExercise(exerciseName: string): Promise<number>;

    insertWorkoutExercise(exerciseId: number, workoutId: number): Promise<number>;

    insertExerciseSet(setNumber: number, workoutExerciseId: number): Promise<number>;

    updateExerciseSet(exerciseSet: ExerciseSet): Promise<void>;

    deleteExerciseSet(setId: number): Promise<void>;

    deleteWorkoutExercise(workoutExerciseId: number): Promise<void>;

    deleteWorkout(workoutId: number): Promise<void>;

    deleteWorkoutPlan(workoutPlanId: number): Promise<void>;

    updateExerciseName(exerciseId: number, newExerciseName: string): Promise<void>;

    updateWorkoutName(workoutId: number, newWorkoutName: string): Promise<void>;

    updateWorkoutPlanName(workoutPlanId: number, newWorkoutPlanName: string): Promise<void>;

    selectExercises(): Promise<Exercise[]>;

    insertOneRepMax(exerciseId: number, weight: number): Promise<number>;

    selectOneRepMaxes(): Promise<OneRepMax[]>;

    selectExerciseOneRepMax(exerciseId: number): Promise<OneRepMax>;

    deleteExercise(exerciseId: number): Promise<void>;
}