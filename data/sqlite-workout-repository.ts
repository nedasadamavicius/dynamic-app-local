import { Exercise } from "@/models/exercise";
import { ExerciseSet } from "@/models/exercise-set";
import { Workout } from "@/models/workout";
import { WorkoutExercise } from "@/models/workout-exercise";
import { WorkoutPlan } from "@/models/workout-plan";
import { WorkoutRepository } from "./workout-repository";
import DBManager from "@/db/DBManager";

export class SQLiteWorkoutRepository implements WorkoutRepository {
  async selectWorkoutPlans(): Promise<WorkoutPlan[]> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getAllAsync("SELECT id, name FROM workout_plan");
    return result as WorkoutPlan[];
  }

  async selectWorkoutsPerWorkoutPlan(workoutPlanId: number): Promise<Workout[]> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getAllAsync(
      "SELECT id, name, wpid FROM workout WHERE wpid = ?",
      [workoutPlanId]
    );
    return result as Workout[];
  }

  async selectWorkout(workoutId: number): Promise<Workout> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getFirstAsync(
      `SELECT *
       FROM workout w
       WHERE w.id = ?`,
      [workoutId]
    );
    return result as Workout;
  }

  async selectWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getAllAsync(
      `SELECT we.*
       FROM workout_exercise we
       JOIN workout w ON w.id = we.wid
       WHERE w.id = ?`,
      [workoutId]
    );
    return result as WorkoutExercise[];
  }

  async selectExercise(exerciseId: number): Promise<Exercise> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getFirstAsync(
      `SELECT *
       FROM exercise e
       WHERE e.id = ?`,
      [exerciseId]
    );
    return result as Exercise;
  }

  async selectExerciseSets(workoutExerciseId: number): Promise<ExerciseSet[]> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getAllAsync(
      `SELECT *
       FROM exercise_set es
       WHERE es.weid = ?`,
      [workoutExerciseId]
    );
    return result as ExerciseSet[];
  }

  async insertWorkoutPlan(workoutPlanName: string): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO workout_plan (name) VALUES (?)",
      [workoutPlanName]
    );
    return result.lastInsertRowId!;
  }

  async insertWorkout(workout: Workout): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO workout (name, wpid) VALUES (?, ?)",
      workout.name,
      workout.wpid
    );
    return result.lastInsertRowId!;
  }

  async insertExercise(exercise: Exercise): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO exercise (name) VALUES (?)",
      exercise.name
    );
    return result.lastInsertRowId!;
  }

  async insertWorkoutExercise(workoutExercise: WorkoutExercise): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO workout_exercise (eid, wid) VALUES (?, ?)",
      workoutExercise.eid,
      workoutExercise.wid
    );
    return result.lastInsertRowId!;
  }

  async insertExerciseSet(setNumber: number, workoutExerciseId: number): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO exercise_set (set_number, weid) VALUES (?, ?)",
      setNumber,
      workoutExerciseId
    );
    return result.lastInsertRowId!;
  }
}