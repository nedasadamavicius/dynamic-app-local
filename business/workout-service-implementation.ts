import { Workout } from "@/models/workout";
import { WorkoutPlan } from "@/models/workout-plan";
import { SessionExercise } from "@/models/session-exercise";
import { WorkoutService } from "./workout-service";
import { WorkoutRepository } from "@/data/workout-repository";

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

    createWorkoutPlan(name: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createWorkout(name: string, workoutPlanId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createExercise(name: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    linkWorkoutToExercise(exerciseId: number, workoutId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    addSetsToExercise(workoutExerciseId: number, numberOfSets: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}