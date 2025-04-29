import { Stack, useRouter } from 'expo-router';
import { ToastProvider } from 'react-native-toast-notifications';
import AuthProvider from './Providers/auth-provider';
import QueryProvider from './Providers/query-provider';
import { StripeProvider } from '@stripe/stripe-react-native';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, SafeAreaView } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks';
import NotificationProvider from './Providers/notification-provider';
import { WalletProvider } from './Providers/Wallet-provider';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const router = useRouter();

  useBackHandler(() => {
    return false;
  });

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (!url) return;
    
      let parsedUrl = Linking.parse(url);
      let path = parsedUrl.path;
      let queryParams = parsedUrl.queryParams ?? {};
    
      // Manually extract params from the hash if present
      if (url.includes('#')) {
        const hashParams = url.split('#')[1];
        const pairs = hashParams.split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            queryParams[key] = decodeURIComponent(value);
          }
        });
      }
    
      console.log('Deep link received:', url, 'Parsed path:', path, queryParams);
    
      if (path === 'new-password') {
        router.push({
          pathname: '/new-password',
          params: queryParams,
        });
      }
    };
    
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink({ url });
      } else {
        console.log('No initial URL');
      }
    };
  
    checkInitialUrl();
  
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);
  

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar style="light" backgroundColor="#000000" />
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
        <ToastProvider>
          <AuthProvider>
            <WalletProvider>
              <QueryProvider>
                <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
                  <NotificationProvider>
                    <Stack
                      screenOptions={{
                        contentStyle: { backgroundColor: '#f5f5f5' },
                        headerStyle: { backgroundColor: '#f5f5f5' },
                        headerTitleStyle: { color: '#000' },
                        headerTintColor: '#000',
                      }}
                    >
                      <Stack.Screen
                        name='(shop)'
                        options={{
                          headerShown: false,
                          title: 'Shop',
                        }}
                      />
                      {/* Other screens */}
                     
                      <Stack.Screen
                        name='passwordreset'
                        options={{
                          headerShown: false,
                          title: 'passwordreset',
                        }}
                      />
                       <Stack.Screen
                        name='new-password'
                        options={{
                          headerShown: false,
                          title: 'New Password',
                        }}
                      />
                       <Stack.Screen
                        name='auth'
                        options={{
                          headerShown: false,
                          title: 'Auth',
                        }}
                      />
                    </Stack>
                  </NotificationProvider>
                </StripeProvider>
              </QueryProvider>
            </WalletProvider>
          </AuthProvider>
        </ToastProvider>
      </SafeAreaView>
    </View>
  );
}
