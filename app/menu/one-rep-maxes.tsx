// app/one-rep-maxes.tsx
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, TextInput,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { Exercise } from '@/models/exercise';

type OneRepMax = { id: number; eid: number; weight: number };

export default function OneRepMaxesScreen() {
  const navigation = useNavigation();
  const workoutService = useWorkoutService();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();

  const [orms, setOrms] = useState<OneRepMax[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [weight, setWeight] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'One-Rep Maxes',
      headerRight: () => (
        <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
          <Ionicons name="ellipsis-vertical" size={24} />
        </Pressable>
      ),
    });
  }, [navigation, toggleManaging]);

    const loadAll = useCallback(async () => {
    setLoading(true);
    setExercisesLoading(true);
    try {
        const [ormList, exList] = await Promise.all([
        workoutService.getOneRepMaxes().catch(() => []), // w/o catch, if one fails then both will be empty
        workoutService.getExercises().catch(() => []),
        ]);
        setOrms(ormList);
        setExercises(exList);
    } finally {
        setLoading(false);
        setExercisesLoading(false);
    }
    }, [workoutService]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await loadAll();
      })();
      return () => {
        alive = false;
        setManaging(false);
      };
    }, [loadAll, setManaging])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  const handleAddNew = () => {
    setSelectedExerciseId(null);
    setWeight('');
    setIsModalVisible(true); // exercises already loaded on focus/refresh
  };

  const createOrm = async () => {
    if (!selectedExerciseId) return Alert.alert('Pick an exercise');
    const w = Number(weight);
    if (!weight.trim() || Number.isNaN(w) || w <= 0) return Alert.alert('Enter a valid weight');
    await workoutService.createOneRepMax(selectedExerciseId, w);
    setIsModalVisible(false);
    await loadAll();
  };

  // join ORMs with exercise names for display
  const exerciseMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const e of exercises) m.set((e as any).id ?? (e as any).eid, (e as any).name);
    return m;
  }, [exercises]);

  const displayItems = useMemo(
    () => orms.map(o => ({
      id: o.id,
      name: exerciseMap.get(o.eid) ?? 'Unknown exercise',
      weight: o.weight,
    })),
    [orms, exerciseMap]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={displayItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <View style={[styles.card, isManaging && { opacity: 0.6 }]}>
              <View style={styles.cardMain}>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.weight}>{item.weight}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? <Text>Loading…</Text> : <Text>No one-rep maxes yet.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          isManaging ? (
            <View style={styles.cardWrapper}>
              <TouchableOpacity style={styles.newCard} onPress={handleAddNew}>
                <Text style={styles.itemName}>New One-Rep Max</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create a new one-rep max</Text>

            <Text style={{ marginBottom: 8 }}>Pick exercise</Text>
            {exercisesLoading ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>Loading exercises…</Text>
              </View>
            ) : (
              <FlatList
                data={exercises}
                keyExtractor={(e) => String((e as any).id ?? (e as any).eid)}
                style={{ maxHeight: 150, marginBottom: 12 }}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                renderItem={({ item }) => {
                  const id = (item as any).id ?? (item as any).eid;
                  const active = selectedExerciseId === id;
                  return (
                    <Pressable
                      onPress={() => setSelectedExerciseId(id)}
                      style={[styles.option, active && styles.optionActive]}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {(item as any).name}
                      </Text>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={<Text>No exercises found.</Text>}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Enter weight"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setIsModalVisible(false)} style={styles.modalButtonCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={createOrm} style={styles.modalButtonConfirm}>
                <Text>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },

  cardWrapper: { marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden',
  },
  cardMain: { flex: 1 },
  newCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderWidth: 1, borderColor: 'black', borderStyle: 'dashed', borderRadius: 8,
  },
  itemName: { fontSize: 16 },
  weight: { fontSize: 16, fontWeight: '600' },

  // modal
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  modal: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },

  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginTop: 8, marginBottom: 16 },

  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalButtonCancel: { padding: 10 },
  modalButtonConfirm: { padding: 10, backgroundColor: '#ccc', borderRadius: 6 },

  option: { padding: 10, borderRadius: 6, backgroundColor: '#f5f5f5' },
  optionActive: { backgroundColor: '#e0e0e0' },
  optionText: { fontSize: 14 },
  optionTextActive: { fontWeight: '600' },
});
