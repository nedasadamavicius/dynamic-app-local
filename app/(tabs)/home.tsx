import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/menu/workout-plans')}
      >
        <Text style={styles.buttonText}>Workout Plans</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/menu/one-rep-maxes')}
      >
        <Text style={styles.buttonText}>One Rep Maxes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/menu/exercise-library')}
      >
        <Text style={styles.buttonText}>Exercise Library</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { fontSize: 16 },
});
