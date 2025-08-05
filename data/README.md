# This directory serves as a DATA ACCESS LAYER

The conventions of interfaces for anything in this layer end with "Repository".

Think, direct storage interaction.

```
export interface WorkoutRepository {
  getWorkoutPlans(): Promise<WorkoutPlan[]>;
  // ...
}
```
for ***local use*** (SQLite)

This interface is aligned with:

    SRP: Repository only does data I/O

    Clean Architecture: BL calls DA, DA talks to DB

    Testability: easy to mock

    Clarity: no hidden logic

```
export interface WorkoutSyncRepository {
  uploadWorkoutPlans(plans: WorkoutPlan[]): Promise<void>;
  fetchWorkoutPlans(): Promise<WorkoutPlan[]>;
}
```
for (future) ***cloud syncing*** feature