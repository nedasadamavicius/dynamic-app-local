import { Exercise } from "@/models/exercise";
import { ExerciseSet } from "@/models/exercise-set";
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

    insertWorkoutPlan(workoutPlan: WorkoutPlan): Promise<number>;

    insertWorkout(workout: Workout): Promise<number>;

    insertExercise(exercise: Exercise): Promise<number>;

    insertWorkoutExercise(workoutExercise: WorkoutExercise): Promise<number>;

    insertExerciseSet(setNumber: number, workoutExerciseId: number): Promise<number>;
}