import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Toast } from 'react-native-toast-notifications';
import { supabase } from './lib/supabase'; // Adjust if your supabase client path differs

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Toast.show('Please enter your email', {
        type: 'danger',
        placement: 'top',
        duration: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'eshop://new-password', // must match your mobile app linking!
      });

      if (error) {
        console.error('Reset password error:', error.message);
        Toast.show(error.message || 'Error sending reset link', {
          type: 'danger',
          placement: 'top',
          duration: 2000,
        });
      } else {
        Toast.show('Check your email for reset link', {
          type: 'success',
          placement: 'top',
          duration: 2000,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Toast.show('An unexpected error occurred. Try again.', {
        type: 'danger',
        placement: 'top',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
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
