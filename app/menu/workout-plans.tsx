import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Sample workout plans data
const plans = [
  { id: 'ul5x', name: 'Upper/Lower 5x' },
  { id: 'ul4x', name: 'Upper/Lower 4x' },
  { id: 'ulfb', name: 'Upper/Lower/Full Body' },
];
// Replace with a dynamic DB query like "SELECT * FROM workout_plans;"
// Required changes:
// 1. Create a table: workout_plans(id TEXT PRIMARY KEY, name TEXT)
// 2. Use `useEffect` + SQLite query to fetch all plans
// 3. Replace static `plans` with fetched data


export default function WorkoutPlansScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/menu/workouts`)} // later: pass plan id
            // onPress={() => router.push({ pathname: '/menu/workouts', params: { planId: item.id } })}
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
