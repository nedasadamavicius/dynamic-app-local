import React, { useEffect, useState }  from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Workout } from '@/models/workout';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';

export default function WorkoutsScreen() {
  const workoutService = useWorkoutService();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { planId } = useLocalSearchParams();
  const numericPlanId = Number(planId);

  useEffect(() => {
    if (!isNaN(numericPlanId)) {
      workoutService.getWorkoutsOfWorkoutPlan(numericPlanId).then(setWorkouts);
    }
  }, [numericPlanId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/menu/workout/${item.id}`)} // pass workout ID
          >
            <Text style={styles.planName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export const options = {
  title: 'Workouts',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    padding: 16,
    backgroundColor: '#eee',
    marginBottom: 12,
    borderRadius: 8,
  },
  planName: {
    fontSize: 16,
  },
});
