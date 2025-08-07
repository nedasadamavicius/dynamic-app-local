import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SessionExercise } from '@/models/session-exercise';
import { Workout } from '@/models/workout';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { Ionicons } from '@expo/vector-icons';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionScreen() {
  const workoutService = useWorkoutService();
  
  // convert string ID to numeric ID
  const { workoutId } = useLocalSearchParams();
  const numericWorkoutId = Number(workoutId);

  // load the actual workout
  const [workout, setWorkout] = useState<Workout | null>(null);
  // get all exercises of a workout via workout ID
  const [exercises, setExercises] = useState<SessionExercise[]>([]);

  // sort of refreshes workouts view
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!isNaN(numericWorkoutId)) {
        workoutService.getWorkout(numericWorkoutId).then((w) => {
          if (isMounted) setWorkout(w);
        });

        workoutService.getExercisesOfWorkout(numericWorkoutId).then((ex) => {
          if (isMounted) setExercises(ex);
        });
      }

      return () => {
        isMounted = false;
        setManaging(false); // reset management mode when navigating away
      };
    }, [numericWorkoutId])
  );

  // for management mode
  const navigation = useNavigation();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();
  // the header with 3 dots i.e. management mode
  useLayoutEffect(() => {
    navigation.setOptions({
      title: workout?.name ?? '[ Session Name ]',
      headerRight: () => (
       <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
        <Ionicons name="ellipsis-vertical" size={24} />
       </Pressable>
      ),
    });
  }, [navigation, toggleManaging, workout]);

  // to make the state of exercise button (open/close)
  const [openExercise, setOpenExercise] = useState<string | null>(null);

   // for "create exercise"
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newExerciseName, setNewWorkoutName] = useState('');
  const [numberOfSets, setNumberOfSets] = useState('');

  const handleAddNew = () => {
    setNewWorkoutName('');
    setIsModalVisible(true);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      {/* Main content */}
      <ScrollView style={styles.main}>

      {/* Add New Exercise card (only in management mode) */}
      {isManaging && (
        <TouchableOpacity style={styles.newExerciseCard} onPress={handleAddNew}>
          <Text style={styles.exerciseName}>New Exercise</Text>
        </TouchableOpacity>
      )}

        {exercises.map((exercise, idx) => {
          const isOpen = openExercise === exercise.exercise.name;

          return (
            <View
              key={idx}
              style={[
                styles.exerciseCard,
                isManaging && { opacity: 0.6 } // apply dim effect in management mode
              ]}
            >
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
                    <Text style={styles.headerItem}>Sets</Text>
                    <Text style={styles.headerItem}>Weight</Text>
                    <Text style={styles.headerItem}>Reps</Text>
                    <Text style={styles.headerItem}>RIR</Text>
                    <Text style={styles.headerItem}>%</Text>
                  </View>

                  {exercise.sets.map((set, setIdx) => (
                    <View key={set.id} style={styles.setRow}>
                      <Text style={styles.setLabel}>Set #{set.setNumber}</Text>
                      <TextInput style={styles.input} defaultValue={String(set.weight)} editable={!isManaging} />
                      <TextInput style={styles.input} defaultValue={String(set.reps)} editable={!isManaging} />
                      <TextInput style={styles.input} defaultValue={String(set.rir)} editable={!isManaging} />
                      <TextInput style={styles.input} defaultValue={String(set.percentage)} editable={!isManaging} />
                    </View>
                  ))}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create a new exercise</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter exercise name"
              value={newExerciseName}
              onChangeText={setNewWorkoutName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Number of sets"
              keyboardType="number-pad"
              value={numberOfSets}
              onChangeText={setNumberOfSets}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={styles.modalButtonCancel}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const name = newExerciseName.trim();
                  const sets = parseInt(numberOfSets, 10);

                  if (!name || isNaN(sets) || sets <= 0) return;

                  await workoutService.createExerciseForWorkout(name, numericWorkoutId, sets);

                  const updatedExercises = await workoutService.getExercisesOfWorkout(numericWorkoutId);
                  setExercises(updatedExercises);

                  setIsModalVisible(false);
                }}
                style={styles.modalButtonConfirm}
              >
                <Text>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Finish session button */}
      <TouchableOpacity style={styles.finishButton}>
        <Text style={styles.finishText}>Finish Session</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    textAlign: 'left',
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
  cardWrapper: {
  marginBottom: 16,
},
newExerciseCard: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 16,
  borderWidth: 1,
  borderColor: 'black',
  borderStyle: 'dashed',
  borderRadius: 8,
  marginBottom: 16,
},

exerciseName: {
  fontSize: 16,
},

modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},

modal: {
  width: '90%',
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
},

modalButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 12, // fallback to marginRight if needed
},

modalButtonCancel: {
  padding: 10,
},

modalButtonConfirm: {
  padding: 10,
  backgroundColor: '#ccc',
  borderRadius: 6,
},
modalInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginBottom: 12,
  fontSize: 14,
},
});