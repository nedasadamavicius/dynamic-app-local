import React from 'react';
import { WorkoutServiceContext } from '@/contexts/WorkoutServiceContext';
import { WorkoutServiceImplementation } from '@/business/workout-service-implementation';
import { SQLiteWorkoutRepository } from '@/data/sqlite-workout-repository';

const workoutService = new WorkoutServiceImplementation(new SQLiteWorkoutRepository());

export const WorkoutServiceProvider = ({ children }: { children: React.ReactNode }) => (
  <WorkoutServiceContext.Provider value={workoutService}>
    {children}
  </WorkoutServiceContext.Provider>
);