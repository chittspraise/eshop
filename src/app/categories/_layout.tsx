import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='[slug]'
        options={({ navigation }) => ({
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 10 }}>
              <Ionicons name='arrow-back' size={24} color='black' />
            </TouchableOpacity>
          ),
          headerTitle: 'Category',
        })}
      />
    </Stack>
  );
}
