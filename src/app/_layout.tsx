import { Stack } from 'expo-router';
import { ToastProvider } from 'react-native-toast-notifications';
import AuthProvider from './Providers/auth-provider';
import QueryProvider from './Providers/query-provider'; // Adjust the import path as necessary
import { StripeProvider } from '@stripe/stripe-react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';

import { useBackHandler } from '@react-native-community/hooks';

export default function RootLayout() {
  useBackHandler(() => {
    // Handle the back button press
    // Return true to prevent default behavior (system back)
    return false;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Prevent screen from sliding under the status bar */}
      <StatusBar style="auto" translucent={false} backgroundColor="transparent" />
      {Platform.OS === 'ios' && <View style={{ height: 20, backgroundColor: 'transparent' }} />}
      <ToastProvider>
        <AuthProvider>
          <QueryProvider>
            <StripeProvider publishableKey={process.env.EXPO_STRIPE_PUBLISHABLE_KEY!}>
              <Stack>
              <Stack.Screen
                name='(shop)'
                options={{ headerShown: false, title: 'Shop' }}
              />
              <Stack.Screen
                name='categories'
                options={{ headerShown: false, title: 'Categories' }}
              />
              <Stack.Screen
                name='product'
                options={{ headerShown: false, title: 'Product' }}
              />
              <Stack.Screen
                name='cart'
                options={{
                presentation: 'modal',
                title: 'Shopping Cart',
                }}
              />
              <Stack.Screen name='auth' options={{ headerShown: false }} />
              </Stack>
            </StripeProvider>
          </QueryProvider>
        </AuthProvider>
      </ToastProvider>
    </View>
  );
}
