import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutService } from '@/contexts/WorkoutServiceContext';

export default function SettingsScreen() {
  const workoutService = useWorkoutService();

  // DB-loaded only (no UI defaults)
  const [deloadEnabled, setDeloadEnabled] = useState<boolean | undefined>(undefined);
  const [deloadEvery, setDeloadEvery] = useState<string | undefined>(undefined);
  const [initial, setInitial] = useState<{ enabled: boolean; every: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await workoutService.getSettings(); // { deloadEnabled: boolean, deloadEverySessions: number }
        if (!mounted) return;
        const enabled = !!s.deloadEnabled;
        const everyStr = s.deloadEverySessions != null ? String(s.deloadEverySessions) : '';
        setDeloadEnabled(enabled);
        setDeloadEvery(everyStr);
        setInitial({ enabled, every: everyStr });
      } catch {
        Alert.alert('Error', 'Failed to load settings.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [workoutService]);

  const saveNow = async (nextEnabled: boolean, nextEveryStr: string) => {
    if (saving) return;
    const n = parseInt(nextEveryStr, 10);
    if (nextEnabled && (isNaN(n) || n < 1)) {
      Alert.alert('Invalid value', 'Enter a positive number for sessions.');
      return;
    }
    try {
      setSaving(true);
      await workoutService.updateSettings(nextEnabled, nextEnabled ? n : 0);
      setInitial({ enabled: nextEnabled, every: nextEnabled ? String(n) : nextEveryStr });
    } catch {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (val: boolean) => {
    setDeloadEnabled(val);
    // If enabling and no number yet, focus field and wait for commit
    if (val && (!deloadEvery || deloadEvery === '')) {
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    // If disabling or enabling with a value, save immediately
    await saveNow(val, deloadEvery ?? '');
  };

  const onChangeEvery = (val: string) => {
    const sanitized = val.replace(/[^\d]/g, '');
    setDeloadEvery(sanitized);
  };

  const commitIfChanged = async () => {
    if (deloadEnabled === undefined || deloadEvery === undefined || !initial) return;
    const changed = initial.enabled !== deloadEnabled || initial.every !== deloadEvery;
    if (!changed) return;
    await saveNow(deloadEnabled, deloadEvery);
  };

  if (loading || deloadEnabled === undefined || deloadEvery === undefined) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      <View style={styles.row}>
        <Text>Deloads</Text>
        <Switch value={deloadEnabled} onValueChange={onToggle} />
      </View>

      {deloadEnabled && (
        <View style={styles.row}>
          <Text>Deload every</Text>
          <View style={styles.inline}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              keyboardType="numeric"
              value={deloadEvery}
              onChangeText={onChangeEvery}
              onSubmitEditing={async () => { Keyboard.dismiss(); await commitIfChanged(); }}
              onEndEditing={commitIfChanged}
              returnKeyType="done"
              maxLength={3}
              blurOnSubmit
            />
            <Text style={styles.suffix}>sessions</Text>
          </View>
        </View>
      )}

      {/* <View style={styles.footer}>
        <Text style={saving ? styles.saving : styles.saved}>
          {saving ? 'Saving…' : 'All changes saved'}
        </Text>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, width: 90, textAlign: 'center', borderRadius: 6 },
  suffix: { fontSize: 16 },
  // footer: { marginTop: 'auto', alignItems: 'flex-start' },
  // saving: { color: '#b25c00' },
  // saved: { color: '#4caf50' },
});
