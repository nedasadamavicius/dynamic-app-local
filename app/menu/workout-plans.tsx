import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutPlan } from '@/models/workout-plan';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { useFocusEffect } from '@react-navigation/native';

export default function WorkoutPlansScreen() {
  const navigation = useNavigation();
  const workoutService = useWorkoutService();
  const router = useRouter();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false); // for "create plan"
  const [newPlanName, setNewPlanName] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Workout Plans',
      headerRight: () => (
        <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
          <Ionicons name="ellipsis-vertical" size={24} />
        </Pressable>
      ),
    });
  }, [navigation, toggleManaging]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      workoutService.getWorkoutPlans().then((plans) => {
        if (isMounted) setPlans(plans);
      });

      return () => {
        isMounted = false;
        setManaging(false);
      };
    }, [])
  );

  // for MVP2
  const handleDelete = async (planId: number) => {
    // await workoutService.deleteWorkoutPlan(planId); // Assuming this exists
    // const updated = await workoutService.getWorkoutPlans();
    // setPlans(updated);
  };

  const handleAddNew = () => {
    setNewPlanName('');
    setIsModalVisible(true);
  };

return (
    <View style={styles.container}>

      {/* Add New Plan card (only in management mode) */}
      {isManaging && (
        <View style={styles.cardWrapper}>
          <TouchableOpacity style={styles.newPlanCard} onPress={handleAddNew}>
            <Text style={styles.planName}>New Plan</Text>
            {/* <View style={styles.addCircleButton}>
              <Ionicons name="add" size={14} color="#fff" />
            </View> */}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TouchableOpacity
              style={[styles.card, isManaging && {opacity: 0.6}]}
              onPress={() => {
                if (!isManaging) {
                  router.push(`/menu/workouts/${item.id}`);
                }
              }}
            >
              <Text style={styles.planName}>{item.name}</Text>
              
              {/* for MVP2 */}
              {/* {isManaging && (
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              )} */}
            </TouchableOpacity>
          </View>
        )}
      />

      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create a new workout plan</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter plan name"
              value={newPlanName}
              onChangeText={setNewPlanName}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setIsModalVisible(false)} style={styles.modalButtonCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={async () => {
                if (!newPlanName.trim()) return;
                const insertedId = await workoutService.createWorkoutPlan(newPlanName.trim());
                setIsModalVisible(false);
                router.push(`/menu/workouts/${insertedId}`);
              }} style={styles.modalButtonConfirm}>
                <Text>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

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
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  newPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    // backgroundColor: 'rgba(0, 128, 0, 0.05)', // very light green tint
    borderWidth: 1,
    // borderColor: 'green',
    borderColor: 'black',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  planName: {
    fontSize: 16,
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
});