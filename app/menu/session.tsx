import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function SessionScreen() {
    const router = useRouter();
    
    // Sample data for exercises
    const exercises = [
        { name: 'Weighted Dips', sets: 2 },
        { name: 'Wide-grip Pull Ups', sets: 2 },
        { name: 'Smith Incline Bench', sets: 3 },
        { name: 'Seated Machine Row', sets: 3 },
        { name: 'Cable Overhead Tricep Extension', sets: 3 },
        { name: 'Dumbbell Alternate Curls', sets: 3 },
    ];
    // TODO: Replace hardcoded `exercises` with a SQLite query like:
    // "SELECT * FROM exercises WHERE workout_id = ?"
    // Use `useLocalSearchParams()` to read `workoutId` passed from workouts screen
    // Fetch matching exercises + their `sets` count
    // Later: read `exercise_inputs` to preload last-used weights per set

    const [openExercise, setOpenExercise] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/menu/workout-plans')}>
          <Text>Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>[ Session Name ]</Text>
      </View>

      {/* Main content */}
      <ScrollView style={styles.main}>
        {exercises.map((exercise, idx) => {
            const isOpen = openExercise === exercise.name;

            return (
                <View key={idx} style={styles.exerciseCard}>
                <TouchableOpacity onPress={() =>
                    setOpenExercise(isOpen ? null : exercise.name)
                }>
                    <Text style={styles.exerciseTitle}>
                    {exercise.name} {isOpen ? '▲' : '▼'}
                    </Text>
                </TouchableOpacity>

                {isOpen && (
                    <>
                    <View style={styles.exerciseHeader}>
                        <Text style={styles.headerItem}>Set</Text>
                        <Text style={styles.headerItem}>Weight</Text>
                        <Text style={styles.headerItem}>Reps</Text>
                        <Text style={styles.headerItem}>Intensity</Text>
                        <Text style={styles.headerItem}>Effort</Text>
                    </View>

                    {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                        <View key={setIdx} style={styles.setRow}>
                        <Text style={styles.setLabel}>Set {setIdx + 1}</Text>
                        <TextInput style={styles.input} placeholder="kg" />
                        <TextInput style={styles.input} placeholder="reps" />
                        <TextInput style={styles.input} placeholder="%" />
                        <TextInput style={styles.input} placeholder="RPE" />
                        </View>
                    ))}
                    </>
                )}
                </View>
            );
        })}
      </ScrollView>

      {/* Finish session button */}
      <TouchableOpacity style={styles.finishButton}>
        <Text style={styles.finishText}>Finish Session</Text>
      </TouchableOpacity>
    </View>
  );
}

export const options = {
  title: 'Session',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#eee',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  exerciseTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerItem: {
    width: '18%',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setLabel: {
    width: '18%',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    width: '18%',
    marginLeft: 4,
    borderRadius: 4,
    fontSize: 14,
  },
  finishButton: {
    padding: 16,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  finishText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
