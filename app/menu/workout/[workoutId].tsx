import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SessionExercise } from '@/models/session-exercise';
import { Workout } from '@/models/workout';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';

export default function SessionScreen() {
  const workoutService = useWorkoutService();
  
  const router = useRouter();
  
  const { workoutId } = useLocalSearchParams();
  const numericWorkoutId = Number(workoutId);
  
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  useEffect(() => {
    if (!isNaN(numericWorkoutId)) {
      workoutService.getExercisesOfWorkout(numericWorkoutId).then(setExercises);
    }
  }, [numericWorkoutId]);

  const [workout, setWorkout] = useState<Workout | null>(null);
  useEffect(() => {
    if (!isNaN(numericWorkoutId)) {
      workoutService.getWorkout(numericWorkoutId).then(setWorkout);
    }
  }, [numericWorkoutId]);

  const [openExercise, setOpenExercise] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/menu/workout-plans')}>
          <Text>Menu</Text>
        </TouchableOpacity> */}
        <Text style={styles.title}>{workout?.name ?? '[ Session Name ]'}</Text>
      </View>

      {/* Main content */}
      <ScrollView style={styles.main}>
        {exercises.map((exercise, idx) => {
          const isOpen = openExercise === exercise.exercise.name;

          return (
            <View key={idx} style={styles.exerciseCard}>
              <TouchableOpacity onPress={() =>
                setOpenExercise(isOpen ? null : exercise.exercise.name)
              }>
                <Text style={styles.exerciseTitle}>
                  {exercise.exercise.name} {isOpen ? '▲' : '▼'}
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

                  {exercise.sets.map((set, setIdx) => (
                    <View key={set.id} style={styles.setRow}>
                      <Text style={styles.setLabel}>Set {set.setNumber}</Text>
                      <TextInput style={styles.input} defaultValue={String(set.weight)} />
                      <TextInput style={styles.input} defaultValue={String(set.reps)} />
                      <TextInput style={styles.input} defaultValue={String(set.percentage)} />
                      <TextInput style={styles.input} defaultValue={String(set.rir)} />
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
