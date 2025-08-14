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

    type RawExerciseSetRow = {
      id: number;
      set_number: number;
      weight: number;
      reps: number;
      rir: number;
      percentage: number;
      weid: number;
    };

    const rows: RawExerciseSetRow[] = await db.getAllAsync(
      `SELECT *
       FROM exercise_set es
       WHERE es.weid = ?`,
      [workoutExerciseId]
    );
    
    const result: ExerciseSet[] = rows.map((row): ExerciseSet => ({
      id: row.id,
      setNumber: row.set_number,
      weight: row.weight,
      reps: row.reps,
      rir: row.rir,
      percentage: row.percentage,
      weid: row.weid,
    }));

    return result;
  }

  async insertWorkoutPlan(workoutPlanName: string): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO workout_plan (name) VALUES (?)",
      [workoutPlanName]
    );
    return result.lastInsertRowId!;
  }

  async insertWorkout(workoutName: string, workoutPlanId: number): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO workout (name, wpid) VALUES (?, ?)",
      [workoutName, workoutPlanId]
    );
    return result.lastInsertRowId!;
  }

  async insertExercise(exerciseName: string): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO exercise (name) VALUES (?)",
      [exerciseName]
    );
    return result.lastInsertRowId!;
  }

  async insertWorkoutExercise(exerciseId: number, workoutId: number): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO workout_exercise (eid, wid) VALUES (?, ?)",
      [exerciseId, workoutId]
    );
    return result.lastInsertRowId!;
  }

  async insertExerciseSet(setNumber: number, workoutExerciseId: number): Promise<number> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.runAsync(
      "INSERT INTO exercise_set (set_number, weid) VALUES (?, ?)",
      [setNumber, workoutExerciseId]
    );
    return result.lastInsertRowId!;
  }

  async updateExerciseSet(exerciseSet: ExerciseSet): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `UPDATE exercise_set
       SET weight = ?, reps = ?, rir = ?, percentage = ?
       WHERE id = ?`,
      [exerciseSet.weight, exerciseSet.reps, exerciseSet.rir, exerciseSet.percentage, exerciseSet.id]
    );
  }

  async deleteExerciseSet(setId: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `DELETE 
       FROM exercise_set
       WHERE id = ?`,
      [setId]
    );
  }

  async deleteWorkoutExercise(workoutExerciseId: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `DELETE
       FROM workout_exercise
       WHERE id = ?`,
       [workoutExerciseId]
    );
  }

  async deleteWorkout(workoutId: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `DELETE
       FROM workout
       WHERE id = ?`,
      [workoutId]
    );
  }
  
  async deleteWorkoutPlan(workoutPlanId: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `DELETE
       FROM workout_plan
       WHERE id = ?`,
       [workoutPlanId]
    );
  }

  async updateExerciseName(exerciseId: number, newExerciseName: string): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `UPDATE exercise
       SET "name" = ?
       WHERE id = ?`,
      [newExerciseName, exerciseId]
    );
  }

  async updateWorkoutName(workoutId: number, newWorkoutName: string): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `UPDATE workout
       SET "name" = ?
       WHERE id = ?`,
      [newWorkoutName, workoutId]
    );
  }

  async updateWorkoutPlanName(workoutPlanId: number, newWorkoutPlanName: string): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `UPDATE workout_plan
       SET "name" = ?
       WHERE id = ?`,
      [newWorkoutPlanName, workoutPlanId]
    );
  }

  
}