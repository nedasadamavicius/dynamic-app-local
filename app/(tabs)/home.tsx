import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/themes/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonSecondary }]}
        onPress={() => router.push('/menu/workout-plans')}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Workout Plans</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonSecondary }]}
        onPress={() => router.push('/menu/one-rep-maxes')}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>One Rep Maxes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonSecondary }]}
        onPress={() => router.push('/menu/exercise-library')}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Exercise Library</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { fontSize: 16 },
});
