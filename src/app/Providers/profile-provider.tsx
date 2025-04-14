import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMyProfile, upsertMyProfile } from '../api/api'; // adjust path as needed
import { useAuth } from './auth-provider';

// Define the Profile type
type Profile = {
  user_id: string;
  first_name: string | null;
  phone_number: string | null;
  address: string | null;
  wallet_balance: number | null; // wallet balance is included here
};

type ProfileContextType = {
  profile: Profile | null;
  walletBalance: number | null;
  loading: boolean;
  error: any;
  refetch: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateWalletBalance: (newBalance: number) => Promise<void>; // Method to update wallet balance
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const { user } = useAuth();
  const { mutateAsync: upsertProfileMutation } = upsertMyProfile(); // ✅ This gives you mutateAsync

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await getMyProfile();
    if (error) {
      setError(error);
    } else if (data) {
      const profileData: Profile = {
        ...data,
        user_id: String(data.user_id),
      };
      setProfile(profileData);
      setError(null);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      // Convert nulls to undefined to match mutation input type
      const sanitizedUpdates = Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [key, value === null ? undefined : value])
      ) as {
        wallet_balance?: number;
        address?: string;
        first_name?: string;
        phone_number?: string;
      };
  
      const data = await upsertProfileMutation(sanitizedUpdates);
      const updatedProfile: Profile = {
        ...data,
        user_id: String(data.user_id),
      };
      setProfile(updatedProfile);
    } catch (err) {
      setError(err);
    }
  };

  const updateWalletBalance = async (newBalance: number) => {
    // Call API or logic to update the wallet balance
    if (profile) {
      try {
        await updateProfile({ wallet_balance: newBalance });
        setProfile({ ...profile, wallet_balance: newBalance });
      } catch (err) {
        setError(err);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]); // Re-fetch when the user changes

  return (
    <ProfileContext.Provider
      value={{
        profile,
        walletBalance: profile?.wallet_balance ?? null, // Provide wallet balance from profile
        loading,
        error,
        refetch: fetchProfile,
        updateProfile,
        updateWalletBalance,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};
