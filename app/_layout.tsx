import { useEffect } from 'react';
import { Stack } from "expo-router";
import { WorkoutServiceProvider } from '@/providers/WorkoutServiceProvider';
import DBManager from '@/db/DBManager';

export default function RootLayout() {
  useEffect(() => {
    DBManager.initializeIfNeeded();
  }, []);

  return (
    <WorkoutServiceProvider>
      <Stack />
    </WorkoutServiceProvider>
  );
}
