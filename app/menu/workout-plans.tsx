import React, { useCallback, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, TextInput, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutPlan } from '@/models/workout-plan';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';
import { useManagementMode } from '@/contexts/ManagementModeContext';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/themes/theme';

export default function WorkoutPlansScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const workoutService = useWorkoutService();
  const router = useRouter();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  // for the pop up window user gets once he presses new plan
  const [isModalVisible, setIsModalVisible] = useState(false); // for "create plan"
  const [newPlanName, setNewPlanName] = useState('');
  
  // for renaming workout plan
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ id: number; name: string } | null>(null);

  // the header with 3 dots i.e. management mode
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Workout Plans',
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.text,
      headerRight: () => (
        <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
          <Ionicons name="ellipsis-vertical" size={24} color={ theme.text } />
        </Pressable>
      ),
    });
  }, [navigation, toggleManaging]);

  // sort of refreshes workout plans view
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

  const confirmRemovePlan = (planId: number, name: string) => {
    Alert.alert(
      'Remove plan',
      `Remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await workoutService.removeWorkoutPlan(planId);
            const updated = await workoutService.getWorkoutPlans();
            setPlans(updated);
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    setNewPlanName('');
    setIsModalVisible(true);
  };

  const openRenamePlan = (id: number, name: string) => {
    setRenameTarget({ id, name });
    setRenameText(name);
    setIsRenameVisible(true);
  };

  const saveRenamePlan = async () => {
    if (!renameTarget) return;
    const name = renameText.trim();
    if (!name || name === renameTarget.name) { setIsRenameVisible(false); setRenameTarget(null); return; }
    await workoutService.changeWorkoutPlanName(renameTarget.id, name);
    const updated = await workoutService.getWorkoutPlans();
    setPlans(updated);
    setIsRenameVisible(false);
    setRenameTarget(null);
  };

return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>

      {/* Add New Plan card (only in management mode) */}
      {isManaging && (
        <View style={styles.cardWrapper}>
          <TouchableOpacity 
            style={[
              styles.newPlanCard,
              { borderColor: theme.dashedBorder }
            ]} 
            onPress={handleAddNew}
          >
            <Text style={[styles.planName, { color: theme.muted }]}>New Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <View style={[
              styles.card, 
              { backgroundColor: theme.buttonSecondary, borderColor: theme.border }, 
              isManaging && { opacity: 0.6 }]}
            >
              <TouchableOpacity
                style={styles.cardMain}
                disabled={isManaging}
                onPress={() => router.push(`/menu/workouts/${item.id}`)}
              >
                <Text style={[
                  styles.planName, 
                  { color: theme.text }
                  ]}
                >{item.name}</Text>
              </TouchableOpacity>

              {isManaging && (
                <View style={styles.actionsRight}>
                  <Pressable
                    onPress={() => openRenamePlan(item.id, item.name)}
                    style={styles.headerIconBtn}
                    hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  >
                    <Ionicons name="create-outline" size={16} />
                  </Pressable>
                  <Pressable
                    onPress={() => confirmRemovePlan(item.id, item.name)}
                    style={[styles.headerIconBtn, styles.iconSpacing]}
                    hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  >
                    <Ionicons name="trash-outline" size={16} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* create new workout modal */}
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

      {/* rename workout plan modal */}
      {isRenameVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Rename workout plan</Text>
            <TextInput
              style={styles.input}
              placeholder="Plan name"
              value={renameText}
              onChangeText={setRenameText}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => { setIsRenameVisible(false); setRenameTarget(null); }} style={styles.modalButtonCancel}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveRenamePlan} style={styles.modalButtonConfirm}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
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
    overflow: 'hidden',
  },

  cardMain: {
    flex: 1
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