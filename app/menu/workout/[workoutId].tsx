import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert
} from 'react-native';
import { SessionExercise } from '@/models/session-exercise';
import { Workout } from '@/models/workout';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { Ionicons } from '@expo/vector-icons';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// editable types (string fields for numeric inputs)
type EditableSet = {
  id: number;
  setNumber: number;
  weid: number;
  weight: string;
  reps: string;
  rir: string;
  percentage: string;
};
type EditableSessionExercise = {
  weid: number;
  exercise: SessionExercise['exercise'];
  sets: EditableSet[];
};

export default function SessionScreen() {
  const workoutService = useWorkoutService();

  const { workoutId } = useLocalSearchParams();
  const numericWorkoutId = Number(workoutId);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [edited, setEdited] = useState<EditableSessionExercise[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const load = async () => {
        if (!isNaN(numericWorkoutId)) {
          const [w, ex] = await Promise.all([
            workoutService.getWorkout(numericWorkoutId),
            workoutService.getExercisesOfWorkout(numericWorkoutId),
          ]);
          if (isMounted) {
            setWorkout(w);
            setExercises(ex);
          }
        }
      };
      load();

      return () => {
        isMounted = false;
        setManaging(false);
      };
    }, [numericWorkoutId])
  );

  // keep local editable copy in sync (numeric -> string)
  useEffect(() => {
    const stringified: EditableSessionExercise[] = exercises.map(ex => ({
      weid: ex.weid as any,
      exercise: ex.exercise,
      sets: ex.sets.map(s => ({
        id: s.id,
        setNumber: s.setNumber,
        weid: (s as any).weid ?? ex.weid,
        weight: s.weight == null ? '' : String(s.weight),
        reps: s.reps == null ? '' : String(s.reps),
        rir: s.rir == null ? '' : String(s.rir),
        percentage: s.percentage == null ? '' : String(s.percentage),
      })),
    }));
    setEdited(stringified);
  }, [exercises]);

  const navigation = useNavigation();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();

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

  const [openExercise, setOpenExercise] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newExerciseName, setNewWorkoutName] = useState('');
  const [numberOfSets, setNumberOfSets] = useState('');

  const handleAddNew = () => {
    setNewWorkoutName('');
    setIsModalVisible(true);
  };

  const handleChange = (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps' | 'rir' | 'percentage',
    value: string
  ) => {
    setEdited(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      ex.sets = sets;
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleAddSet = async (exIdx: number) => {
    const ex = edited[exIdx];
    const nextSetNumber = ex.sets.length + 1;
    await workoutService.addSetToExercise(
      nextSetNumber, ex.weid
    );
    const refreshed = await workoutService.getExercisesOfWorkout(numericWorkoutId);
    setExercises(refreshed);
  };

  const handleRemoveSet = async (exIdx: number, setIdx: number) => {
    const setId = edited[exIdx].sets[setIdx].id;
    await workoutService.removeExerciseSet(setId);
    const refreshed = await workoutService.getExercisesOfWorkout(numericWorkoutId);
    setExercises(refreshed);
  };

  const handleRemoveExercise = (exIdx: number) => {
    const weid = edited[exIdx].weid;
    const name = edited[exIdx].exercise.name;

    Alert.alert(
      'Remove exercise',
      `Remove "${name}" from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await workoutService.removeWorkoutExercise(weid);
            const refreshed = await workoutService.getExercisesOfWorkout(numericWorkoutId);
            setExercises(refreshed);
            if (openExercise === name) setOpenExercise(null);
          },
        },
      ]
    );
  };

  // original numeric values by set id for fallbacks
  const originalById = useMemo(() => {
    const m = new Map<number, { weight?: number; reps?: number; rir?: number; percentage?: number; weid?: number }>();
    exercises.forEach(ex => ex.sets.forEach(s => m.set(s.id, {
      weight: s.weight as any,
      reps: s.reps as any,
      rir: s.rir as any,
      percentage: s.percentage as any,
      weid: (s as any).weid ?? ex.weid,
    })));
    return m;
  }, [exercises]);

  const parseOr = (raw: string, fallback: number) => {
    const t = String(raw ?? '').replace(',', '.').trim();
    if (t === '') return fallback;
    const n = Number(t);
    return Number.isFinite(n) ? n : fallback;
  };

  const finishSession = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const tasks: Promise<void>[] = [];
      edited.forEach(ex =>
        ex.sets.forEach((s) => {
          const orig = originalById.get(s.id) ?? {};
          const weight = parseOr(s.weight, Number(orig.weight ?? 0));
          const reps = parseOr(s.reps, Number(orig.reps ?? 0));
          const rir = parseOr(s.rir, Number(orig.rir ?? 0));
          const percentage = parseOr(s.percentage, Number(orig.percentage ?? 0));
          const weid = Number(s.weid ?? orig.weid ?? 0);

          tasks.push(
            workoutService.updateExerciseSet(
              s.id,
              s.setNumber,
              weight,
              reps,
              rir,
              percentage,
              weid
            )
          );
        })
      );
      await Promise.all(tasks);
      const updated = await workoutService.getExercisesOfWorkout(numericWorkoutId);
      setExercises(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.main}>
        {isManaging && (
          <TouchableOpacity style={styles.newExerciseCard} onPress={handleAddNew}>
            <Text style={styles.exerciseName}>New Exercise</Text>
          </TouchableOpacity>
        )}

        {edited.map((exercise, idx) => {
          const isOpen = openExercise === exercise.exercise.name;

          return (
            <View
              key={exercise.exercise.id ?? idx}
              style={[styles.exerciseCard, isManaging && { opacity: 0.6 }]}
            >

              <View style={styles.exerciseTitleRow}>
                <TouchableOpacity
                  onPress={() =>
                    setOpenExercise(isOpen ? null : exercise.exercise.name)
                  }
                >
                  <Text style={styles.exerciseTitle}>
                    {exercise.exercise.name} {isOpen ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {isManaging && (
                  <Pressable
                    onPress={() => handleRemoveExercise(idx)}
                    style={styles.headerIconBtn}
                    hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  >
                    <Ionicons name="trash-outline" size={16} />
                  </Pressable>
                )}
              </View>

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

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].weight}
                        onChangeText={(v) => handleChange(idx, setIdx, 'weight', v)}
                      />

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].reps}
                        onChangeText={(v) => handleChange(idx, setIdx, 'reps', v)}
                      />

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].rir}
                        onChangeText={(v) => handleChange(idx, setIdx, 'rir', v)}
                      />

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].percentage}
                        onChangeText={(v) => handleChange(idx, setIdx, 'percentage', v)}
                      />

                      {isManaging && (
                        <View style={styles.actionsCell}>
                          <Pressable
                            onPress={() => handleRemoveSet(idx, setIdx)}
                            style={styles.iconBtn}
                            hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                          >
                            <Ionicons name="trash-outline" size={16} />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  ))}

                  {isManaging && (
                    <View style={[styles.setRow, styles.addSetRow]}>
                      {/* column under "Set #" */}
                      <View style={styles.setLabelCol}>
                        <Pressable onPress={() => handleAddSet(idx)} style={styles.addSetBtn}>
                          <Ionicons name="add" size={16} />
                        </Pressable>
                      </View>

                      {/* keep grid alignment; empty columns */}
                      <View style={styles.col} />
                      <View style={styles.col} />
                      <View style={styles.col} />
                      <View style={styles.col} />
                      <View style={styles.actionsCol} />
                    </View>
                  )}
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

      <TouchableOpacity
        style={[styles.finishButton, saving && { opacity: 0.6 }]}
        onPress={finishSession}
        disabled={saving}
      >
        <Text style={styles.finishText}>{saving ? 'Saving…' : 'Finish Session'}</Text>
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
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    padding: 16, 
    alignItems: 'center', 
    backgroundColor: '#eee', 
    justifyContent: 'space-between' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  main: { 
    flex: 1, 
    padding: 16 
  },
  exerciseCard: { 
    backgroundColor: '#f2f2f2', 
    padding: 12, 
    marginBottom: 20, 
    borderRadius: 8,
    overflow: 'hidden',              // keep icons inside rounded box
  },
  exerciseTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginBottom: 10 
  },
  exerciseHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  headerItem: { 
    width: '18%', 
    fontWeight: '600', 
    fontSize: 12, 
    textAlign: 'left' 
  },
  setRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  setLabel: { 
    width: '18%', 
    fontSize: 14 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 6, 
    width: '18%', 
    marginLeft: 4, 
    borderRadius: 4, 
    fontSize: 14
  },
  // narrower inputs while managing to make room for actions column
  inputCompact: { width: '17%', marginLeft: 2 },

  finishButton: { 
    padding: 16, 
    backgroundColor: '#007bff', 
    alignItems: 'center' 
  },
  finishText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  cardWrapper: { 
    marginBottom: 16 
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
    marginBottom: 16 
  },
  exerciseName: { 
    fontSize: 16 
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
    zIndex: 10 
  },
  modal: { 
    width: '90%', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 12 
  },
  modalButtonCancel: { 
    padding: 10 
  },
  modalButtonConfirm: { 
    padding: 10, 
    backgroundColor: '#ccc', 
    borderRadius: 6 
  },
  modalInput: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    paddingVertical: 10,
    paddingHorizontal: 12, 
    marginBottom: 12, 
    fontSize: 14 
  },

  // actions / icons
  actionsHeader: { width: '10%', textAlign: 'right' },
  actionsCell: { width: '10%', alignItems: 'flex-end', paddingRight: 2 },
  iconBtn: {
    width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, backgroundColor: '#fff',
  },

  // add set (icon only) under "Set #"
  addSetRow: { marginTop: 6, paddingRight: 0 },
  setLabelCol: { width: '18%', justifyContent: 'center' },
  col: { width: '18%' },
  actionsCol: { width: '10%' },
  addSetBtn: {
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, backgroundColor: '#fff',
  },

  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  headerIconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
