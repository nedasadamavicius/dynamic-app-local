import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useManagementMode } from '@/contexts/ManagementModeContext';

export const useManagementHeader = () => {
  const { toggleManaging } = useManagementMode();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={toggleManaging} style={{ paddingRight: 16 }}>
          <Ionicons name="ellipsis-vertical" size={24} />
        </Pressable>
      ),
    });
  }, []);
};