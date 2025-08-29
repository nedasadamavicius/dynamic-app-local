import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useLocalSearchParams, useNavigation, useFocusEffect, useRouter, type Href } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  FlatList
} from 'react-native';
import { SessionExercise } from '@/models/session-exercise';
import { Workout } from '@/models/workout';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { Ionicons } from '@expo/vector-icons';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from '@/models/settings';

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
type ExerciseLite = {
  id: number;
  name: string;
};

type CellField = 'weight' | 'reps' | 'rir' | 'percentage';

export default function SessionScreen() {
  const router = useRouter();
  const workoutService = useWorkoutService();

  const { workoutId } = useLocalSearchParams();
  const numericWorkoutId = Number(workoutId);

  const navigation = useNavigation();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();

  // STATEs
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [edited, setEdited] = useState<EditableSessionExercise[]>([]);
  const [saving, setSaving] = useState(false);

  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ weid: number; oldName: string } | null>(null);

  const [openExercise, setOpenExercise] = useState<string | null>(null);

  // picker: select existing or create new
  const [pickerVisible, setPickerVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<ExerciseLite[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ id: number | null; name: string } | null>(null);
  const [numberOfSets, setNumberOfSets] = useState('');

  const [ormByEid, setOrmByEid] = useState<Map<number, number>>(new Map());
  const [ormModal, setOrmModal] = useState<{ visible: boolean; eid: number | null; name: string; weight: string }>({
    visible: false, eid: null, name: '', weight: ''
  });

  // derive once-only counter for sessions since last deload
  const sessionsSinceDeload = workout?.counter?? 0;

  // settings state
  const [settings, setSettings] = useState<Settings | null>(null);
  const deloadPromptedRef = useRef(false);

  // EFFECTs
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const load = async () => {
        if (!isNaN(numericWorkoutId)) {
          const [w, ex, s] = await Promise.all([
            workoutService.getWorkout(numericWorkoutId),
            workoutService.getExercisesOfWorkout(numericWorkoutId),
            workoutService.getSettings()
          ]);
          if (isMounted) {
            setWorkout(w);
            setExercises(ex);
            setSettings(s);
          }
        }

        const orms = await workoutService.getOneRepMaxes(); // [{ eid, weight }]
        const m = new Map<number, number>();
        for (const o of orms) m.set(o.eid, Number(o.weight) || 0);
        setOrmByEid(m);

        // preload existing exercises for picker
        const list = await workoutService.getExercises();
        setAllExercises(list?.map(({ id, name }) => ({ id, name })) ?? []);
      };
      load();

      return () => {
        isMounted = false;
        setManaging(false);
      };
    }, [numericWorkoutId])
  );

  // when both workout & settings are ready, check and prompt once
  useEffect(() => {
    if (!workout || !settings || deloadPromptedRef.current) return;

    const counter = workout.counter ?? 0;
    const N = settings.deloadEverySessions ?? 0;
    const due = settings.deloadEnabled && N > 0 && counter >= N;

    if (!due) return;

    deloadPromptedRef.current = true;


    Alert.alert(
      'Deload suggested',
      'You completed the last cycle. Deload this session? (counter will reset)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deload now',
          style: 'destructive',
          onPress: () => {
            router.push((`/menu/deload/${workoutId}` as Href)); // use the string param directly
          },
        },
      ]
    );
  }, [workout, settings, router, workoutId]);

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

  // cache last-saved numeric values per cell to skip no-op writes
  const savedValuesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const map = new Map<string, number>();
    exercises.forEach(ex => ex.sets.forEach(s => {
      if (s.weight != null)      map.set(`${s.id}:weight`, Number(s.weight));
      if (s.reps != null)        map.set(`${s.id}:reps`, Number(s.reps));
      if (s.rir != null)         map.set(`${s.id}:rir`, Number(s.rir));
      if (s.percentage != null)  map.set(`${s.id}:percentage`, Number(s.percentage));
    }));
    savedValuesRef.current = map;
  }, [exercises]);

  const parseField = (field: CellField, raw: string): number => {
    const t = String(raw ?? '').replace(',', '.').trim();
    if (t === '') return 0;
    let n = Number(t);
    if (!Number.isFinite(n)) n = 0;
    if (field === 'reps' || field === 'rir') return Math.max(0, Math.trunc(n));
    if (field === 'percentage') return Math.min(100, Math.max(0, Math.round(n * 100) / 100));
    // weight
    return Math.max(0, Math.round(n * 100) / 100);
  };

  const saveCell = async (exIdx: number, setIdx: number, field: CellField) => {
    try {
      const set = edited[exIdx].sets[setIdx];
      const setId = set.id;
      const numeric = parseField(field, (set as any)[field]);

      // skip if unchanged vs last saved
      const key = `${setId}:${field}`;
      const prev = savedValuesRef.current.get(key);
      if (prev !== undefined && prev === numeric) return;

      // don't persist weight when locked by % + ORM
      if (field === 'weight') {
        const exerciseId = edited[exIdx].exercise?.id as number | undefined;
        const pct = parseField('percentage', edited[exIdx].sets[setIdx].percentage);
        const orm = exerciseId ? (ormByEid.get(exerciseId) ?? 0) : 0;
        if (pct > 0 && orm > 0) return;
      }

      await workoutService.updateExerciseSetField(setId, field, numeric);
      savedValuesRef.current.set(key, numeric);
    } catch {
      Alert.alert('Save failed', 'Could not save this change. Try again.');
    }
  };

  // HANDLERs
  const handleAddNew = async () => {
    setSearch('');
    setSelected(null);
    setNumberOfSets('');
    const list = await workoutService.getExercises();
    setAllExercises(list?.map(({ id, name }) => ({ id, name })) ?? []);
    setPickerVisible(true);
  };

  const promptCreateOrm = (eid: number, name: string) =>
  Alert.alert(
    '1RM missing',
    `1RM for "${name}" does not exist. Create it now?`,
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Create', onPress: () => setOrmModal({ visible: true, eid, name, weight: '' }) },
    ]
  );

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

      if (field === 'percentage') {
        const pct = Number(String(value ?? '').replace(',', '.')) || 0;

        // update % immediately
        sets[setIdx] = { ...sets[setIdx], percentage: value };
        ex.sets = sets;
        copy[exIdx] = ex;

        // if % > 0 and no ORM → ask first, then maybe open modal
        if (pct > 0) {
          const eid = ex.exercise?.id as number | undefined;
          const hasOrm = !!(eid && (ormByEid.get(eid) ?? 0) > 0);
          if (!hasOrm && eid) {
            promptCreateOrm(eid, ex.exercise.name);
          }
        }

        return copy;
      }

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

  const openRenameExercise = (exIdx: number) => {
    const weid = edited[exIdx].weid;
    const oldName = edited[exIdx].exercise.name;
    setRenameTarget({ weid, oldName });
    setRenameText(oldName);
    setIsRenameVisible(true);
  };

  const saveRenameExercise = async () => {
    if (!renameTarget) return;
    const newName = renameText.trim();
    if (!newName || newName === renameTarget.oldName) {
      setIsRenameVisible(false);
      setRenameTarget(null);
      return;
    }
    await workoutService.changeExerciseName(renameTarget.weid, newName);
    const refreshed = await workoutService.getExercisesOfWorkout(numericWorkoutId);
    setExercises(refreshed);
    if (openExercise === renameTarget.oldName) setOpenExercise(newName);
    setIsRenameVisible(false);
    setRenameTarget(null);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allExercises;
    return allExercises.filter(e => e.name.toLowerCase().includes(q));
  }, [search, allExercises]);

  const exactExists = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return false;
    return allExercises.some(e => e.name.toLowerCase() === q);
  }, [search, allExercises]);

  const parseOr = (raw: string, fallback: number) => {
    const t = String(raw ?? '').replace(',', '.').trim();
    if (t === '') return fallback;
    const n = Number(t);
    return Number.isFinite(n) ? n : fallback;
  };

  const attachExercise = async (choice: { id: number | null; name: string }, sets: number) => {
    if (choice.id && (workoutService as any).addExerciseToWorkout) {
      await (workoutService as any).addExerciseToWorkout(choice.id, numericWorkoutId, sets);
    } else {
      await workoutService.createExerciseForWorkout(choice.name, numericWorkoutId, sets);
    }
  };

  const finishSession = async () => {
    if (saving) return;

    setSaving(true);
    
    try {
      const tasks: Promise<void>[] = [];
    
      edited.forEach(ex =>
        ex.sets.forEach((s) => {
          const orig = originalById.get(s.id) ?? {};
          const reps = parseOr(s.reps, Number(orig.reps ?? 0));
          const rir = parseOr(s.rir, Number(orig.rir ?? 0));
          const weid = Number(s.weid ?? orig.weid ?? 0);

          const percentage = parseOr(s.percentage, Number(orig.percentage ?? 0));
          const exerciseId = ex.exercise?.id as number | undefined;
          const orm = exerciseId ? (ormByEid.get(exerciseId) ?? 0) : 0;

          const weight =
            percentage > 0 && orm > 0
              ? workoutService.calculateWeight(orm, percentage)
              : parseOr(s.weight, Number(orig.weight ?? 0));

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

      await workoutService.incrementWorkoutCounter(numericWorkoutId, sessionsSinceDeload);

      router.back();
    
    } catch {
      Alert.alert('Error', 'Could not finish session. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      
      {settings?.deloadEnabled && (
        <View style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ fontWeight: '600' }}>
            Sessions since deload: {sessionsSinceDeload}
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.main}>
        {isManaging && (
          <TouchableOpacity style={styles.addExerciseCard} onPress={handleAddNew}>
            <Text style={styles.exerciseName}>Add Exercise</Text>
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
                  onPress={() => setOpenExercise(isOpen ? null : exercise.exercise.name)}
                >
                  <Text style={styles.exerciseTitle}>
                    {exercise.exercise.name} {isOpen ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {isManaging && (
                  <View style={styles.actionsRight}>
                    <Pressable
                      onPress={() => openRenameExercise(idx)}
                      style={styles.headerIconBtn}
                      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                    >
                      <Ionicons name="create-outline" size={16} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveExercise(idx)}
                      style={[styles.headerIconBtn, styles.iconSpacing]}
                      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                    >
                      <Ionicons name="trash-outline" size={16} />
                    </Pressable>
                  </View>
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

                      {(() => {
                        const exerciseId = exercise.exercise?.id as number | undefined;
                        const pct = Number(String(edited[idx].sets[setIdx].percentage ?? '').replace(',', '.')) || 0;
                        const orm = exerciseId ? (ormByEid.get(exerciseId) ?? 0) : 0;
                        const locked = pct > 0 && orm > 0; // lock only if ORM exists
                        const derived = locked ? workoutService.calculateWeight(orm, pct) : undefined;

                        return (
                          <TextInput
                            style={[
                              styles.input,
                              isManaging && styles.inputCompact,
                              locked && { backgroundColor: '#eee' }
                            ]}
                            keyboardType="numeric"
                            editable={!isManaging && !locked}
                            value={locked ? String(derived ?? '') : edited[idx].sets[setIdx].weight}
                            onChangeText={(v) => handleChange(idx, setIdx, 'weight', v)}
                            onEndEditing={() => saveCell(idx, setIdx, 'weight')}
                            onSubmitEditing={() => saveCell(idx, setIdx, 'weight')}
                          />
                        );
                      })()}

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].reps}
                        onChangeText={(v) => handleChange(idx, setIdx, 'reps', v)}
                        onEndEditing={() => saveCell(idx, setIdx, 'reps')}
                        onSubmitEditing={() => saveCell(idx, setIdx, 'reps')}
                      />

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].rir}
                        onChangeText={(v) => handleChange(idx, setIdx, 'rir', v)}
                        onEndEditing={() => saveCell(idx, setIdx, 'rir')}
                        onSubmitEditing={() => saveCell(idx, setIdx, 'rir')}
                      />

                      <TextInput
                        style={[styles.input, isManaging && styles.inputCompact]}
                        keyboardType="numeric"
                        editable={!isManaging}
                        value={edited[idx].sets[setIdx].percentage}
                        onChangeText={(v) => handleChange(idx, setIdx, 'percentage', v)}
                        onEndEditing={() => saveCell(idx, setIdx, 'percentage')}
                        onSubmitEditing={() => saveCell(idx, setIdx, 'percentage')}
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

      {pickerVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add exercise</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Search or type a new exercise"
              value={search}
              onChangeText={(t) => { setSearch(t); setSelected(null); }}
            />

            {/* quick create when no exact match */}
            {search.trim().length > 0 && !exactExists && (
              <Pressable
                style={[styles.listRow, styles.createRow]}
                onPress={() => setSelected({ id: null, name: search.trim() })}
              >
                <Ionicons name="add" size={16} />
                <Text style={styles.listRowText}>Create “{search.trim()}”</Text>
              </Pressable>
            )}

            <View style={{ maxHeight: 240, marginBottom: 12 }}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const isSel = selected?.id === item.id;
                  return (
                    <Pressable
                      onPress={() => setSelected({ id: item.id, name: item.name })}
                      style={[styles.listRow, isSel && styles.listRowSelected]}
                    >
                      <Text style={styles.listRowText}>{item.name}</Text>
                      {isSel && <Ionicons name="checkmark" size={16} />}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  search.trim().length === 0
                    ? <Text style={styles.emptyList}>No exercises.</Text>
                    : <Text style={styles.emptyList}>No matches.</Text>
                }
              />
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Number of sets"
              keyboardType="number-pad"
              value={numberOfSets}
              onChangeText={setNumberOfSets}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setPickerVisible(false)} style={styles.modalButtonCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const sets = parseInt(numberOfSets, 10);
                  const choice = selected ?? { id: null, name: search.trim() };
                  if (!choice.name || isNaN(sets) || sets <= 0) return;

                  await attachExercise(choice, sets);

                  const updated = await workoutService.getExercisesOfWorkout(numericWorkoutId);
                  setExercises(updated);
                  setPickerVisible(false);
                }}
                style={styles.modalButtonConfirm}
              >
                <Text>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {isRenameVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Rename exercise</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name"
              value={renameText}
              onChangeText={setRenameText}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => { setIsRenameVisible(false); setRenameTarget(null); }} style={styles.modalButtonCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveRenameExercise} style={styles.modalButtonConfirm}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {ormModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set 1RM for {ormModal.name}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter 1RM weight"
              keyboardType="numeric"
              value={ormModal.weight}
              onChangeText={(t) => setOrmModal(s => ({ ...s, weight: t }))}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setOrmModal({ visible: false, eid: null, name: '', weight: '' })}
                style={styles.modalButtonCancel}
              >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const eid = ormModal.eid!;
                  const w = Number(String(ormModal.weight).replace(',', '.')) || 0;
                  if (eid && w > 0) {
                    await workoutService.createOneRepMax(eid, w);
                    setOrmByEid(prev => {
                      const next = new Map(prev);
                      next.set(eid, w);
                      return next;
                    });
                  }
                  setOrmModal({ visible: false, eid: null, name: '', weight: '' });
                }}
                style={styles.modalButtonConfirm}
              >
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.finishButton, saving && { opacity: 0.6 }]}
        disabled={saving}
        onPress={() => {
          Alert.alert(
            'End Session',
            'Finish this session?\n\nThis will save all changes and increment days since last deload.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Finish', style: 'destructive', onPress: finishSession },
            ]
          );
        }}
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
  addExerciseCard: { 
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

  actionsRight: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  iconSpacing: { 
    marginLeft: 8 
  },

listRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: '#eee',
  borderRadius: 8,
  marginBottom: 8,
},
listRowSelected: {
  borderColor: '#007bff',
  backgroundColor: '#eef4ff',
},
listRowText: { fontSize: 14 },
createRow: { backgroundColor: '#f7f7f7' },
emptyList: { textAlign: 'center', color: '#666', paddingVertical: 12 },
});
