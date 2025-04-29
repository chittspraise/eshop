import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { Toast } from 'react-native-toast-notifications';
import { supabase } from './lib/supabase';

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      console.log('Initial URL:', url);

      if (url) {
        const parsed = Linking.parse(url);
        console.log('Parsed URL:', parsed);

        if (parsed.queryParams?.access_token && parsed.queryParams?.refresh_token) {
          setAccessToken(parsed.queryParams.access_token as string);
          setRefreshToken(parsed.queryParams.refresh_token as string);

          // Set session immediately
          await supabase.auth.setSession({
            access_token: parsed.queryParams.access_token as string,
            refresh_token: parsed.queryParams.refresh_token as string,
          });
        } else {
          Toast.show('Missing reset access token!', { type: 'danger', placement: 'top' });
        }
      } else {
        Toast.show('No URL detected', { type: 'danger', placement: 'top' });
      }
      setLoading(false);
    };

    handleInitialUrl();
  }, []);

  const handleSubmit = async () => {
    if (!newPassword.trim()) {
      Toast.show('Enter a new password', { type: 'danger', placement: 'top' });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Password update error:', error.message);
      Toast.show(error.message || 'Failed to update password', { type: 'danger', placement: 'top' });
    } else {
      Toast.show('Password updated successfully!', { type: 'success', placement: 'top' });
      // Optionally navigate to login screen
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a New Password</Text>

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor="#999"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    padding: 14,
    marginBottom: 20,
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a84ff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
