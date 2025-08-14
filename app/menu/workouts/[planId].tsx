import React, { useCallback, useLayoutEffect, useState }  from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Workout } from '@/models/workout';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutsScreen() {
  const workoutService = useWorkoutService();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { planId } = useLocalSearchParams();
  const numericPlanId = Number(planId);
  const { isManaging, toggleManaging, setManaging } = useManagementMode();
  const navigation = useNavigation();

  const [isModalVisible, setIsModalVisible] = useState(false); // for "create plan"
  const [newWorkoutName, setNewWorkoutName] = useState('');

  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ id: number; name: string } | null>(null);

  // the header with 3 dots i.e. management mode
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Workouts',
      headerRight: () => (
       <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
        <Ionicons name="ellipsis-vertical" size={24} />
       </Pressable>
      ),
    });
  }, [navigation, toggleManaging]);

  // sort of refreshes workouts view
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      workoutService.getWorkoutsOfWorkoutPlan(numericPlanId).then((workouts) => {
        if (isMounted) setWorkouts(workouts);
      });
      return () => {
        isMounted = false;
        setManaging(false);
      };
    }, [numericPlanId])
  );

  const handleAddNew = () => {
    setNewWorkoutName('');
    setIsModalVisible(true);
  };

  const openRenameWorkout = (id: number, name: string) => {
    setRenameTarget({ id, name });
    setRenameText(name);
    setIsRenameVisible(true);
  };

  const saveRenameWorkout = async () => {
    if (!renameTarget) return;
    const name = renameText.trim();
    if (!name || name === renameTarget.name) { setIsRenameVisible(false); setRenameTarget(null); return; }
    await workoutService.changeWorkoutName(renameTarget.id, name);
    const list = await workoutService.getWorkoutsOfWorkoutPlan(numericPlanId);
    setWorkouts(list);
    setIsRenameVisible(false);
    setRenameTarget(null);
  };

  const confirmRemoveWorkout = (workoutId: number, name: string) => {
    Alert.alert(
      'Remove workout',
      `Remove "${name}" from this plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await workoutService.removeWorkout(workoutId);
            const list = await workoutService.getWorkoutsOfWorkoutPlan(numericPlanId);
            setWorkouts(list);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      {/* Add New Workout card (only in management mode) */}
      {isManaging && (
        <View style={styles.cardWrapper}>
          <TouchableOpacity style={styles.newPlanCard} onPress={handleAddNew}>
            <Text style={styles.workoutName}>New Workout</Text>
            {/* <View style={styles.addCircleButton}>
              <Ionicons name="add" size={14} color="#fff" />
            </View> */}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, isManaging && { opacity: 0.6 }]}>
            <TouchableOpacity
              style={styles.cardMain}
              disabled={isManaging}
              onPress={() => router.push(`/menu/workout/${item.id}`)}
            >
              <Text style={styles.workoutName}>{item.name}</Text>
            </TouchableOpacity>

            {isManaging && (
              <View style={styles.actionsRight}>
                <Pressable
                  onPress={() => openRenameWorkout(item.id, item.name)}
                  style={styles.headerIconBtn}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Ionicons name="create-outline" size={16} />
                </Pressable>
                <Pressable
                  onPress={() => confirmRemoveWorkout(item.id, item.name)}
                  style={[styles.headerIconBtn, styles.iconSpacing]}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Ionicons name="trash-outline" size={16} />
                </Pressable>
              </View>
            )}
          </View>
        )}
      />

      {/* create new workout modal */}
            {isModalVisible && (
              <View style={styles.modalOverlay}>
                <View style={styles.modal}>
                  <Text style={styles.modalTitle}>Create a new workout</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter workout name"
                    value={newWorkoutName}
                    onChangeText={setNewWorkoutName}
                  />
                  <View style={styles.modalButtons}>
                    <Pressable onPress={() => setIsModalVisible(false)} style={styles.modalButtonCancel}>
                      <Text>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={async () => {
                      if (!newWorkoutName.trim()) return;
                      const insertedId = await workoutService.createWorkout(newWorkoutName.trim(), numericPlanId);
                      setIsModalVisible(false);
                      router.push(`/menu/workout/${insertedId}`);
                    }} style={styles.modalButtonConfirm}>
                      <Text>Create</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

      {/* rename workout plan modal */}
      {isRenameVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Rename workout</Text>
            <TextInput
              style={styles.input}
              placeholder="Workout name"
              value={renameText}
              onChangeText={setRenameText}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => { setIsRenameVisible(false); setRenameTarget(null); }} style={styles.modalButtonCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveRenameWorkout} style={styles.modalButtonConfirm}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
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
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  newPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    // backgroundColor: 'rgba(0, 128, 0, 0.05)', // very light green tint
    borderWidth: 1,
    // borderColor: 'green',
    borderColor: 'black',
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
  },
  workoutName: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCircleButton: {
    backgroundColor: 'green',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12, // if gap unsupported, use marginRight manually
  },
  modalButtonCancel: {
    padding: 10,
  },
  modalButtonConfirm: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },

  cardMain: { 
    flex: 1 
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
});
