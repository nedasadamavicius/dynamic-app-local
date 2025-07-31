import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Sample workout plans data
const plans = [
  { id: '1', name: 'Upper A' },
  { id: '2', name: 'Lower A' },
  { id: '3', name: 'Lower B' },
  { id: '4', name: 'Upper B' },
  { id: '5', name: 'Upper C' },
];
// TODO: Replace `plans` with result of:
// "SELECT * FROM workouts WHERE plan_id = ?"
// Use `useLocalSearchParams()` to receive `planId` from WorkoutPlansScreen
// Navigate to /menu/session with workoutId as param

export default function WorkoutsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/menu/session`)} // later: pass plan id
              // onPress={() => router.push({ pathname: '/menu/session', params: { workoutId: item.id } })}
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
