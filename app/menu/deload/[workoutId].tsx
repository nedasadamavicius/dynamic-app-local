          //   // load temporary deload adjusted workout NEXT
          //   await workoutService.resetWorkoutCounter(numericWorkoutId); // this would go to DeloadScreen
          //   navigation.goBack(); // exit session for now... this would also go to DeloadScreen, i assume twice?
// app/menu/deload/[workoutId].tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import type { SessionExercise } from '@/models/session-exercise';
import type { Workout } from '@/models/workout';

type EditableSet = {
  id: number;
  setNumber: number;
  weid: number;
  weight: string;      // editable if NOT % mode
  reps: string;        // editable
  rir: string;         // read-only (from service: 4)
  percentage: string;  // read-only (from service: reduced % or 0)
};

type EditableExercise = {
  weid: number;
  eid: number;
  name: string;
  sets: EditableSet[];
};

export default function DeloadScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const wid = Number(workoutId);
  const router = useRouter();
  const navigation = useNavigation();
  const workoutService = useWorkoutService();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [edited, setEdited] = useState<EditableExercise[]>([]);
  const [ormByEid, setOrmByEid] = useState<Map<number, number>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [w, deloadSets, orms] = await Promise.all([
        workoutService.getWorkout(wid),
        workoutService.getDeloadedExercises(wid), // returns SessionExercise[] (already adjusted)
        workoutService.getOneRepMaxes(),          // [{ eid, weight }]
      ]);
      if (!mounted) return;
      setWorkout(w);

      const m = new Map<number, number>();
      for (const o of orms) m.set(o.eid, Number(o.weight) || 0);
      setOrmByEid(m);

      const e: EditableExercise[] = deloadSets.map(ex => ({
        weid: ex.weid,
        eid: ex.exercise.id,
        name: ex.exercise.name,
        sets: ex.sets.map(s => ({
          id: s.id,
          setNumber: s.setNumber,
          weid: s.weid,
          weight: s.weight != null ? String(s.weight) : '',
          reps: s.reps != null ? String(s.reps) : '',
          rir: s.rir != null ? String(s.rir) : '',
          percentage: s.percentage != null ? String(s.percentage) : '',
        })),
      }));
      setEdited(e);
    })();
    return () => { mounted = false; };
  }, [wid, workoutService]);

  useEffect(() => {
    navigation.setOptions({ title: workout?.name ? `Deload · ${workout.name}` : 'Deload' });
  }, [navigation, workout?.name]);

  const parseNum = (raw: string) => {
    const t = String(raw ?? '').replace(',', '.').trim();
    if (!t) return 0;
    const n = Number(t);
    return Number.isFinite(n) ? n : 0;
  };

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const finishDeload = async () => {
    if (!workout || saving) return;
    Alert.alert(
      'Finish Deload Session',
      'This will NOT save any set edits. It only resets the counter for this workout.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await workoutService.resetWorkoutCounter(workout.id);
              router.back();
              setTimeout(() => router.back(), 0);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const title = useMemo(() => workout?.name ?? 'Deload', [workout]);

return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Deload mode — nothing will be saved</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <ScrollView style={styles.main}>
        {edited.map((ex: EditableExercise, exIdx: number) => (
          <View key={ex.weid} style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{ex.name}</Text>

            <View style={styles.exerciseHeader}>
              <Text style={styles.headerItem}>Sets</Text>
              <Text style={styles.headerItem}>Weight</Text>
              <Text style={styles.headerItem}>Reps</Text>
              <Text style={styles.headerItem}>RIR</Text>
              <Text style={styles.headerItem}>%</Text>
            </View>

            {ex.sets.map((s: EditableSet, setIdx: number) => {
              const pct = parseNum(s.percentage);
              const usesPct = pct > 0;
              const orm = ormByEid.get(ex.eid) ?? 0;
              const locked = usesPct && orm > 0;

              const derivedWeight =
                locked ? workoutService.calculateWeight(orm, pct) : undefined;

              return (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set #{s.setNumber}</Text>

                  {/* Weight: editable only when NOT % mode with ORM; otherwise read-only */}
                  {locked ? (
                    <View style={[styles.readCell, styles.readCellLocked]}>
                      <Text style={styles.readText}>
                        {derivedWeight != null ? String(round2(derivedWeight)) : '—'}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      editable // allowed in deload
                      value={edited[exIdx].sets[setIdx].weight}
                      onChangeText={(v) =>
                        setEdited(prev => {
                          const copy = [...prev];
                          const sets = [...copy[exIdx].sets];
                          sets[setIdx] = { ...sets[setIdx], weight: v };
                          copy[exIdx] = { ...copy[exIdx], sets };
                          return copy;
                        })
                      }
                    />
                  )}

                  {/* Reps: editable */}
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    editable
                    value={edited[exIdx].sets[setIdx].reps}
                    onChangeText={(v) =>
                      setEdited(prev => {
                        const copy = [...prev];
                        const sets = [...copy[exIdx].sets];
                        sets[setIdx] = { ...sets[setIdx], reps: v };
                        copy[exIdx] = { ...copy[exIdx], sets };
                        return copy;
                      })
                    }
                  />

                  {/* RIR: read-only */}
                  <View style={styles.readCell}>
                    <Text style={styles.readText}>{s.rir || '0'}</Text>
                  </View>

                  {/* %: read-only */}
                  <View style={styles.readCell}>
                    <Text style={styles.readText}>{pct > 0 ? String(pct) : ''}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.finishButton, saving && { opacity: 0.6 }]}
        disabled={saving}
        onPress={finishDeload}
      >
        <Text style={styles.finishText}>{saving ? 'Finishing…' : 'Finish Deload Session'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  banner: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff7e6' },
  bannerText: { fontWeight: '600', color: '#8a5200' },

  title: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 10 },

  main: { flex: 1, padding: 16 },

  exerciseCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },

  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  headerItem: { width: '18%', fontWeight: '600', fontSize: 12, textAlign: 'left' },

  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  setLabel: { width: '18%', fontSize: 14 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    width: '18%',
    marginLeft: 4,
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: '#fff',
  },

  readCell: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    width: '18%',
    marginLeft: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  readCellLocked: { backgroundColor: '#eee' },
  readText: { fontSize: 14 },

  finishButton: { padding: 16, backgroundColor: '#007bff', alignItems: 'center' },
  finishText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
