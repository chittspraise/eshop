import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

function CustomBackButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
  );
}

export default function ProductLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='[slug]'
        options={{
          headerShown: false,
          headerLeft: () => <CustomBackButton />,
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
