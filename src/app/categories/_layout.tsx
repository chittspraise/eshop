import React from 'react';
import { Stack, useNavigation } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryLayout() {
  const navigation = useNavigation();
  return (
    <Stack>
      <Stack.Screen
        name='[slug]'
        options={{
          headerShown: true,
          headerLeft: (props: any) => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name='arrow-back' size={24} color='black' />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}