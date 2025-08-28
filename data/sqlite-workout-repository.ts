import { Exercise } from "@/models/exercise";
import { ExerciseSet } from "@/models/exercise-set";
import { Workout } from "@/models/workout";
import { WorkoutExercise } from "@/models/workout-exercise";
import { WorkoutPlan } from "@/models/workout-plan";
import { WorkoutRepository } from "./workout-repository";
import DBManager from "@/db/DBManager";
import { OneRepMax } from "@/models/one-rep-max";
import { Settings } from "@/models/settings";

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

  async selectExercises(): Promise<Exercise[]> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getAllAsync("SELECT id, name FROM exercise");
    return result as Exercise[];
  }

  async insertOneRepMax(exerciseId: number, weight: number): Promise<number> {
    try {
      const db = (await DBManager.getInstance()).getDB();
      const result = await db.runAsync(
        "INSERT INTO one_rep_max (eid, weight) VALUES (?, ?)",
        [exerciseId, weight]
      );
      return result.lastInsertRowId!;
    } catch (err) {
      console.error("SQLite insertOneRepMax failed", err);
      throw new Error("Failed to insert one-rep max");
    }
  }

  async selectOneRepMaxes(): Promise<OneRepMax[]> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getAllAsync("SELECT * FROM one_rep_max");
    return result as OneRepMax[];
  }

  async selectExerciseOneRepMax(exerciseId: number): Promise<OneRepMax> {
    const db = (await DBManager.getInstance()).getDB();
    const result = await db.getFirstAsync(
      `SELECT weight FROM one_rep_max WHERE eid = ?`,
      [exerciseId]
    );
    return result as OneRepMax;
  }

  async deleteExercise(exerciseId: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `DELETE
       FROM exercise
       WHERE id = ?`,
      [exerciseId]
    );
  }

  async selectSettings(): Promise<Settings> {
    const db = (await DBManager.getInstance()).getDB();

    type RawSettingsRow = {
      id: number;
      deload_enabled: number;           // 0/1 in DB
      deload_every_sessions: number;    // int in DB
    };

    const row: RawSettingsRow = await db.getFirstAsync(
      `SELECT *
      FROM settings
      WHERE id = 1
      LIMIT 1`
    ) as RawSettingsRow; // can do, cause its always there

    const result: Settings = {
      id: row.id,
      deloadEnabled: !!row.deload_enabled, // the !! converts 0/1 to boolean false/true
      deloadEverySessions: row.deload_every_sessions,
    };

    return result;
  }

  async updateSettings(settings: Settings): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `UPDATE settings
       SET deload_enabled = ?, deload_every_sessions = ?
       WHERE id = 1`,
      [settings.deloadEnabled, settings.deloadEverySessions]
    );
  }

  // Update a single field of an exercise set (weight, reps, rir, percentage)
  async updateExerciseSetField(setId: number, field: 'weight'|'reps'|'rir'|'percentage', value: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();

    const allowed: Record<typeof field, string> = { // whitelist allowed columns, prevent SQL injection
      weight: 'weight',
      reps: 'reps',
      rir: 'rir',
      percentage: 'percentage',
    };

    const column = allowed[field];

    await db.runAsync(
      `UPDATE exercise_set
       SET ${column} = ?
       WHERE id = ?`,
      [value, setId]
    );
  }

  // increment the workout's counter by 1
  async updateWorkoutCounter(workoutId: number): Promise<void> {
    const db = (await DBManager.getInstance()).getDB();
    await db.runAsync(
      `UPDATE workout
       SET counter = counter + 1
       WHERE id = ?`,
      [workoutId]
    );
  }
}