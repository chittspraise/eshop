import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from './lib/supabase';
import { Toast } from 'react-native-toast-notifications';
import { useAuth } from './Providers/auth-provider';
import { Link, Redirect } from 'expo-router';

const signInSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const signUpSchema = signInSchema.extend({
  first_name: zod.string().min(1, { message: 'First name is required' }),
  last_name: zod.string().min(1, { message: 'Last name is required' }),
  phone_number: zod.string().min(10, { message: 'Phone number must be at least 10 characters' }),
});

type SignInData = zod.infer<typeof signInSchema>;
type SignUpData = zod.infer<typeof signUpSchema>;

export default function Auth() {
  const { session } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [redirect, setRedirect] = useState(false);

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

  useEffect(() => {
    if (session) {
      setRedirect(true);
    }
  }, [session]);

  if (redirect) {
    return <Redirect href="/" />;
  }

  const signIn = async (data: SignInData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

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

  const createProfile = async (userId: string, data: SignUpData) => {
    const { error } = await supabase
      .from('profile')
      .insert({
        user_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        email: data.email,
      });

    if (error) {
      alert(`Error creating profile: ${error.message}`);
    } else {
      Toast.show('Profile created successfully', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  const signUp = async (data: SignUpData) => {
    const { data: signUpResponse, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      alert(error.message);
    } else if (signUpResponse.user?.id) {
      await createProfile(signUpResponse.user.id, data);
      Toast.show('Signed up successfully', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    } else {
      alert('User creation succeeded but user ID not returned.');
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://www.blinkco.io/wp-content/uploads/2022/01/shopping-cart-full-of-food-on-yellow-background-g-2021-09-02-09-26-59-utc-1.jpg',
      }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Please create an account' : 'Please authenticate to continue'}
        </Text>

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
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

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
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

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
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(isSignUp ? signUp : signIn)}
          disabled={formState.isSubmitting}
        >
          <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.toggleButton]}
          onPress={() => setIsSignUp((prev) => !prev)}
        >
          <Text style={styles.buttonText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </Text>
        </TouchableOpacity>

        <Link href="/passwordreset" asChild>
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.buttonText}>Forgot your password?</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover', justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, width: '100%' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#ddd', marginBottom: 32 },
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
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '90%',
    alignItems: 'center',
  },
  toggleButton: { backgroundColor: 'transparent', borderColor: '#fff', borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  error: { color: 'red', fontSize: 12, marginTop: 4 },
  forgotButton: { marginTop: 16 },
});
