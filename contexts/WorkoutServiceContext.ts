import { createContext, useContext } from 'react';
import { WorkoutService } from '@/business/workout-service';

export const WorkoutServiceContext = createContext<WorkoutService | null>(null);

export const useWorkoutService = () => {
  const ctx = useContext(WorkoutServiceContext);
  if (!ctx) throw new Error('WorkoutServiceContext not provided');
  return ctx;
};