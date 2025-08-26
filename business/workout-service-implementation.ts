import { Workout } from "@/models/workout";
import { WorkoutPlan } from "@/models/workout-plan";
import { SessionExercise } from "@/models/session-exercise";
import { WorkoutService } from "./workout-service";
import { WorkoutRepository } from "@/data/workout-repository";
import { ExerciseSet } from "@/models/exercise-set";
import { Exercise } from "@/models/exercise";
import { OneRepMax } from "@/models/one-rep-max";
import { ExerciseOneRepMax } from "@/models/exercise-one-rep-max";

export class WorkoutServiceImplementation implements WorkoutService {
    constructor(private repository: WorkoutRepository) {}
    
    async getWorkoutPlans(): Promise<WorkoutPlan[]> {
        return await this.repository.selectWorkoutPlans();
    }

    async getWorkoutsOfWorkoutPlan(planId: number): Promise<Workout[]> {
        return await this.repository.selectWorkoutsPerWorkoutPlan(planId);
    }

    async getWorkout(workoutId: number): Promise<Workout> {
        return this.repository.selectWorkout(workoutId);
    }

    async getExercisesOfWorkout(workoutId: number): Promise<SessionExercise[]> {
        const workoutExercises = await this.repository.selectWorkoutExercises(workoutId);

        const result = [];

        for (const we of workoutExercises) {
            const exercise = await this.repository.selectExercise(we.eid);
            const sets = await this.repository.selectExerciseSets(we.id);

            result.push({
            weid: we.id,
            exercise,
            sets,
            });
        }

        return result;
    }

    async createWorkoutPlan(workoutPlanName: string): Promise<number> {
        return this.repository.insertWorkoutPlan(workoutPlanName);
    }

    async createWorkout(workoutName: string, workoutPlanId: number): Promise<number> {
        return this.repository.insertWorkout(workoutName, workoutPlanId);
    }

    async createExercise(exerciceName: string): Promise<number> {
        return this.repository.insertExercise(exerciceName);
    }

    async linkWorkoutToExercise(exerciseId: number, workoutId: number): Promise<number> {
        return this.repository.insertWorkoutExercise(exerciseId, workoutId);
    }

    async addSetToExercise(setNumber: number, workoutExerciseId: number): Promise<void> {
        await this.repository.insertExerciseSet(setNumber, workoutExerciseId);
    }

    async addSetsToExercise(workoutExerciseId: number, numberOfSets: number): Promise<void> {
        for (let setNumber = 1; setNumber <= numberOfSets; setNumber++) {
            this.addSetToExercise(setNumber, workoutExerciseId);
        }
    }

    async createExerciseForWorkout(
        exerciseName: string,
        workoutId: number,
        numberOfSets: number
    ): Promise<void> {
        const exerciseId = await this.createExercise(exerciseName);

        const workoutExerciseId = await this.linkWorkoutToExercise(exerciseId, workoutId);

        await this.addSetsToExercise(workoutExerciseId, numberOfSets);
    }

    async addExerciseToWorkout(
        exerciseId: number,
        workoutId: number,
        numberOfSets: number
    ): Promise<void> {
        const workoutExerciseId = await this.linkWorkoutToExercise(exerciseId, workoutId);

        await this.addSetsToExercise(workoutExerciseId, numberOfSets);
    }

    async updateExerciseSet(id: number, setNumber: number, weight: number, reps: number, rir: number, percentage: number, weid: number): Promise<void> {
        const exerciseSet: ExerciseSet = {
            id,
            setNumber,
            weight,
            reps,
            rir,
            percentage,
            weid
        };

        await this.repository.updateExerciseSet(exerciseSet);
    }

    async removeExerciseSet(setId: number): Promise<void> {
        await this.repository.deleteExerciseSet(setId);
    }

    async removeWorkoutExercise(workoutExerciseId: number): Promise<void> {
        await this.repository.deleteWorkoutExercise(workoutExerciseId);
    }
    
    async removeExercise(exerciseId: number): Promise<void> {
        await this.repository.deleteExerciseSet(exerciseId);
    }
    
    async removeWorkout(workoutId: number): Promise<void> {
        await this.repository.deleteWorkout(workoutId);
    }
    
    async removeWorkoutPlan(workoutPlanId: number): Promise<void> {
        await this.repository.deleteWorkoutPlan(workoutPlanId);
    }

    async changeExerciseName(exerciseId: number, newExerciseName: string): Promise<void> {
        await this.repository.updateExerciseName(exerciseId, newExerciseName);
    }

    async changeWorkoutName(workoutId: number, newWorkoutName: string): Promise<void> {
        await this.repository.updateWorkoutName(workoutId, newWorkoutName);
    }

    async changeWorkoutPlanName(workoutPlanId: number, newWorkoutPlanName: string): Promise<void> {
        await this.repository.updateWorkoutPlanName(workoutPlanId, newWorkoutPlanName);
    }

    async getExercises(): Promise<Exercise[]> {
        return await this.repository.selectExercises();
    }

    async createOneRepMax(exerciseId: number, weight: number): Promise<void> {
        await this.repository.insertOneRepMax(exerciseId, weight);
    }

    async getOneRepMaxes(): Promise<ExerciseOneRepMax[]> {
        const oneRepMaxes: OneRepMax[] = await this.repository.selectOneRepMaxes();

        const result: ExerciseOneRepMax[] = [];
        
        for (const orm of oneRepMaxes) {
            const exercise: Exercise | null = await this.repository.selectExercise(orm.eid);
            result.push({
            id: orm.id,
            eid: orm.eid,
            name: exercise?.name ?? "Unknown exercise",
            weight: orm.weight,
            });
        }

        return result;
    }

    async getExerciseOneRepMax(exerciseId: number): Promise<OneRepMax> {
        return this.repository.selectExerciseOneRepMax(exerciseId);
    }

    calculateWeight(oneRepMax: number, percentage: number): number {
        if (!oneRepMax) return 0;
        const raw = oneRepMax * (percentage / 100);

        return Math.round(raw * 100) / 100; // round to 2 decimals
    }
}