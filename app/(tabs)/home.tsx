import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/menu/workout-plans')}
      >
        <Text style={styles.buttonText}>Workout Plans</Text>
      </TouchableOpacity>
    </View>
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
