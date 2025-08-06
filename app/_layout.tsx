import { useEffect } from 'react';
import { Stack } from "expo-router";
import { WorkoutServiceProvider } from '@/providers/WorkoutServiceProvider'; // injecting service implementations
import { ManagementModeProvider } from '@/providers/ManagementModeProvider'; // 
import DBManager from '@/db/DBManager';

export default function RootLayout() {
  useEffect(() => {
    DBManager.initializeIfNeeded();
  }, []);

  return (
    <WorkoutServiceProvider>
      <ManagementModeProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false, // hide (tabs) header
            }}
          />
        </Stack>
      </ManagementModeProvider>
    </WorkoutServiceProvider>
  );
}
