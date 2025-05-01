import { Stack } from 'expo-router';
import{ View, Text } from 'react-native';

export default function AccountLayout() {
  
  return (
    <Stack>
        <Stack.Screen
        name='index'
    
        options={{
            headerShown: false,
            }}
        />
    </Stack>
  );
}