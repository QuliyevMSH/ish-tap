import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; surname: string; username: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error in setData:", error);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
        } catch (error) {
          console.error("Error in auth state change:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      toast({
        title: "Giriş edildi",
        description: "Xoş gəldiniz!",
      });
      navigate('/jobs');
    } catch (error: any) {
      toast({
        title: "Xəta baş verdi",
        description: error.message || "Giriş zamanı xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; surname: string; username: string }) => {
    try {
      setLoading(true);
      
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userData.username)
        .maybeSingle();
      
      if (checkError) {
        throw new Error("İstifadəçi adını yoxlayarkən xəta baş verdi");
      }
      
      if (existingUsers) {
        throw new Error("Bu istifadəçi adı artıq istifadə olunur");
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            surname: userData.surname,
            username: userData.username,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Qeydiyyat tamamlandı",
        description: "Hesabınız uğurla yaradıldı",
      });
      navigate('/jobs');
    } catch (error: any) {
      toast({
        title: "Xəta baş verdi",
        description: error.message || "Qeydiyyat zamanı xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Çıxış edildi",
        description: "Hesabınızdan uğurla çıxış edildi.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Xəta baş verdi",
        description: error.message || "Çıxış zamanı xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
