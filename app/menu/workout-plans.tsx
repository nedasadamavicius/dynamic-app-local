import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutPlan } from '@/models/workout-plan';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { useManagementMode } from '@/contexts/ManagementModeContext';

export default function WorkoutPlansScreen() {
  const navigation = useNavigation();
  const workoutService = useWorkoutService();
  const router = useRouter();
  const { isManaging, toggleManaging } = useManagementMode();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // for "create plan"

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

  useEffect(() => {
    workoutService.getWorkoutPlans().then(setPlans);
  }, []);

  const handleDelete = async (planId: number) => {
    // await workoutService.deleteWorkoutPlan(planId); // Assuming this exists
    // const updated = await workoutService.getWorkoutPlans();
    // setPlans(updated);
  };

  const handleAddNew = () => {
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

      {/* Modal to create new plan would go here */}
      {/* {isModalVisible && <NewPlanModal ... />} */}

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
});