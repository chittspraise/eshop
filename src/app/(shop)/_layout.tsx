import React from 'react';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../Providers/auth-provider';
import { Colors } from '../../../constants/Colors';
// Correct the import path for Colors

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} {...props} style={{ color: '#1BC464' }} />;
}

const TabsLayout = () => {
  const { session, mounting } = useAuth();
  const router = useRouter();

  if (mounting) return <ActivityIndicator />;
  if (!session) return <Redirect href='/auth' />;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1BC464',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 16 },
          tabBarStyle: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 10,
            height: 70,
          },
          headerShown: false,
        }}
      >
        {/* Shop Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Shop',
            tabBarIcon(props) {
              return <TabBarIcon {...props} name="shopping-cart" />;
            },
          }}
        />
        
        {/* Orders Tab */}
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon(props) {
              return <TabBarIcon {...props} name="book" />;
            },
          }}
        />

        <Tabs.Screen
          name='search'
          options={{
            title: 'Search',
            tabBarIcon(props) {
              return <TabBarIcon {...props} name='search' />;
            },
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
