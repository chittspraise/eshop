import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from './lib/supabase'; // Your Supabase initialization
import { Toast } from 'react-native-toast-notifications';
import { useAuth } from './Providers/auth-provider'; // Your AuthProvider for session management
import { Redirect } from 'expo-router';

// Define the schema for sign-in
const signInSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

// Define the schema for sign-up (with additional fields)
const signUpSchema = signInSchema.extend({
  first_name: zod.string().min(1, { message: 'First name is required' }),
  last_name: zod.string().min(1, { message: 'Last name is required' }),
  phone_number: zod
    .string()
    .min(10, { message: 'Phone number must be at least 10 characters' }),
});

export default function Auth() {
  const { session } = useAuth(); // Assuming you're using a custom Auth provider
  const [isSignUp, setIsSignUp] = useState(false); // Track whether user is signing up or signing in
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Track whether user agreed to terms and conditions
  const [redirect, setRedirect] = useState(false);

  // Initialize form with either sign-in or sign-up schema
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
    },
  });

  React.useEffect(() => {
    if (session) {
      setRedirect(true);
    }
  }, [session]);

  if (redirect) {
    return <Redirect href="/" />;
  }

  // Handle sign-in
  const signIn = async (data: zod.infer<typeof signInSchema>) => {
    const { error, data: signInData } = await supabase.auth.signInWithPassword(data);

    if (error) {
      alert(error.message);
    } else {
      Toast.show('Signed in successfully', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
      
    }
  };

  // Handle sign-up
  const signUp = async (data: zod.infer<typeof signUpSchema>) => {
    const { error, data: signUpData } = await supabase.auth.signUp(data);

    if (error) {
      alert(error.message);
    } else {
      Toast.show('Signed up successfully', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
      if (signUpData?.user?.id) {
        await createProfile(signUpData.user.id, data);
      } else {
        alert('User ID is missing in sign-up response.');
      }
    }
  };

  // Create a profile in the profile table after sign-up
  const createProfile = async (userId: string, data: any) => {
    const { error } = await supabase
      .from('profile')
      .insert({
        user_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        created_at: new Date().toISOString(),
      });

    if (error) {
      alert('Error creating profile: ' + error.message);
    } else {
      Toast.show('Profile created successfully', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Please create an account' : 'Please authenticate to continue'}
        </Text>

        {/* Email input */}
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <>
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

        {/* Password input */}
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <>
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

        {/* Sign-up specific fields */}
        {isSignUp && (
          <>
            <Controller
              control={control}
              name="first_name"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <>
                  <TextInput
                    placeholder="First Name"
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#aaa"
                    autoCapitalize="words"
                    editable={!formState.isSubmitting}
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />

            <Controller
              control={control}
              name="last_name"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <>
                  <TextInput
                    placeholder="Last Name"
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#aaa"
                    autoCapitalize="words"
                    editable={!formState.isSubmitting}
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />

            <Controller
              control={control}
              name="phone_number"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <>
                  <TextInput
                    placeholder="Phone Number"
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                    editable={!formState.isSubmitting}
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />
          </>
        )}

        {/* Submit button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(isSignUp ? signUp : signIn)}
          disabled={formState.isSubmitting}
        >
          <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Toggle between Sign-in and Sign-up */}
        <TouchableOpacity
          style={[styles.button, styles.toggleButton]}
          onPress={() => setIsSignUp((prev) => !prev)}
        >
          <Text style={styles.buttonText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ddd',
    marginBottom: 32,
  },
  input: {
    width: '90%',
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#6a1b9a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '90%',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
