// app/exercises.tsx

import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useWorkoutService } from "@/contexts/WorkoutServiceContext";
import { Exercise } from "@/models/exercise";

export default function ExercisesScreen() {
  const workoutService = useWorkoutService();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await workoutService.getExercises();
      setExercises(data);
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Exercise Library" }} />
      <FlatList
        data={exercises}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No exercises found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  row: { padding: 16, borderRadius: 8, backgroundColor: "#eee" },
  name: { fontSize: 16 },
});