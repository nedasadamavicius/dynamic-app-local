import { Workout } from "@/models/workout";
import { WorkoutPlan } from "@/models/workout-plan";
import { SessionExercise } from "@/models/session-exercise";
import { WorkoutService } from "./workout-service";
import { WorkoutRepository } from "@/data/workout-repository";
import { ExerciseSet } from "@/models/exercise-set";

export class WorkoutServiceImplementation implements WorkoutService {
    constructor(private repository: WorkoutRepository) {}
    
    // might want to add 'async' and 'await' in the actual implementations... another thing to study...
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
}