import React, { createContext, PropsWithChildren, useEffect, useState, useContext } from "react"
import { Session } from '@supabase/supabase-js'
import { supabase } from "../lib/supabase";


type AuthData = {
  session: Session | null;
  mounting: boolean;
  user: any;
};

export const AuthContext = createContext<AuthData>({
  session: null,
  mounting: true,
  user: null,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<{ avatar_url: string; created_at: string | null; email: string; id: string; type: string | null; } | null>(null);
  const [mounting, setMounting] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session) {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('error', error.message);
        } else {
          setUser(user);
        }
      }
      setMounting(false);
    };

    fetchSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    
  }, []);

  return (
    <AuthContext.Provider value={{ session, mounting, user }}>

    {children}
  </AuthContext.Provider>
);
  
}
export const useAuth = () => useContext(AuthContext);

     


