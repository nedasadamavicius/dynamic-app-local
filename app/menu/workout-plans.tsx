import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { WorkoutPlan } from '@/models/workout-plan';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';

export default function WorkoutPlansScreen() {
  const workoutService = useWorkoutService();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    workoutService.getWorkoutPlans().then(setPlans);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/menu/workouts/${item.id}`)} // pass plan ID
          >
            <Text style={styles.planName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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
