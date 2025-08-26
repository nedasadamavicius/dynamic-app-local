// app/exercises.tsx
import React, { useCallback, useLayoutEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutService } from "@/contexts/WorkoutServiceContext";
import { useManagementMode } from "@/contexts/ManagementModeContext";
import { Exercise } from "@/models/exercise";

export default function ExercisesScreen() {
  const navigation = useNavigation();
  const workoutService = useWorkoutService();
  const { isManaging, toggleManaging, setManaging } = useManagementMode();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Exercise Library",
      headerRight: () => (
        <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
          <Ionicons name="ellipsis-vertical" size={24} />
        </Pressable>
      ),
    });
  }, [navigation, toggleManaging]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workoutService.getExercises();
      setExercises(data);
    } finally {
      setLoading(false);
    }
  }, [workoutService]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await load();
      })();
      return () => {
        alive = false;
        setManaging(false);
      };
    }, [load, setManaging])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const handleRemove = (exercise: Exercise) => {
    Alert.alert(
      "Remove exercise",
      `Remove “${exercise.name}” from the library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await workoutService.removeExercise((exercise as any).id ?? (exercise as any).eid);
            await load();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => String((item as any).id ?? (item as any).eid)}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={[styles.row, isManaging && { opacity: 0.6 }]}>
            <Text style={styles.name}>{(item as any).name}</Text>

            {isManaging && (
              <Pressable
                onPress={() => handleRemove(item)}
                style={styles.iconBtn}
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <Ionicons name="trash-outline" size={18} />
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8 }}>Loading exercises…</Text>
            </View>
          ) : (
            <Text>No exercises found.</Text>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  name: { fontSize: 16 },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
});