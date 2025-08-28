import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Updated UserProfile interface to match the actual users table schema
export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: 'customer' | 'sales' | 'procurement' | 'engineering' | 'qa' | 'production' | 'management' | 'supplier' | 'admin';
  department?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'dismiss';
  description?: string;
  employee_id?: string;
  direct_manager_id?: string;
  direct_reports?: string[];
  last_login_at?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleFailedLogin = async (email: string) => {
    try {
      // Since we can't look up users by email directly, we'll handle this differently
      // We'll track failed attempts in a separate way or use client-side tracking
      toast({
        variant: "destructive",
        title: "Invalid Credentials",
        description: "Invalid email or password. Please check your credentials and try again.",
      });
    } catch (error) {
      console.error('Error handling failed login:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      // Get the user's ID from the auth session
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser?.id) {
        console.error('No user ID found in auth user');
        return;
      }

      // Directly fetch user profile from users table by ID
      // Since the migration was completed, auth users.id should match public users.id
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Set profile data directly since it matches the UserProfile interface
      if (data) {
        setProfile(data);
      } else {
        console.log('No user data found in database for ID:', authUser.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createUserProfile = async (userId: string, email: string, displayName: string) => {
    try {
      // Get the default organization (or create one if none exists)
      let { data: organization } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'factory-pulse-vietnam')
        .maybeSingle();

      // If no organization exists, create a default one
      if (!organization) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: 'Factory Pulse Vietnam Co., Ltd.',
            slug: 'factory-pulse-vietnam',
            domain: 'factorypulse.vn',
            is_active: true
          })
          .select('id')
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          throw orgError;
        }
        organization = newOrg;
      }

      // Create user profile in users table with the auth user ID
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId, // Use the auth user ID directly
          organization_id: organization.id,
          email: email,
          name: displayName,
          role: 'customer', // Default role for new users
          status: 'active'
        });

      if (userError) {
        console.error('Error creating user profile:', userError);
        throw userError;
      }

      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const logAuditEvent = async (
    eventType: 'login_success' | 'login_failure' | 'logout' | 'role_change' | 'password_change' | 'account_locked' | 'account_unlocked' | 'profile_update',
    success: boolean,
    details?: any
  ) => {
    try {
      const userAgent = navigator.userAgent;

      // Use audit_logs table instead of activity_log
      await supabase.from('audit_logs').insert({
        event_type: eventType,
        user_id: user?.id || null,
        success: success,
        details: { success, details: details || {} },
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        session_id: session?.access_token || null
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetching to avoid blocking auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);

          // Log successful login
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              logAuditEvent('login_success', true);
            }, 0);
          }
        } else {
          setProfile(null);
          // Log logout
          if (event === 'SIGNED_OUT') {
            setTimeout(() => {
              logAuditEvent('logout', true);
            }, 0);
          }
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle failed login
        await handleFailedLogin(email);
        await logAuditEvent('login_failure', false, { error: error.message });
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message,
        });
        throw error;
      }

      // If user was created successfully, create the user record in users table
      if (data.user) {
        await createUserProfile(data.user.id, email, displayName);

        if (!data.user.email_confirmed_at) {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Account Created!",
            description: "You can now sign in with your credentials.",
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Out Failed",
          description: error.message,
        });
        throw error;
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          role: updates.role,
          department: updates.department,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          status: updates.status,
          description: updates.description,
          employee_id: updates.employee_id,
          direct_manager_id: updates.direct_manager_id,
          direct_reports: updates.direct_reports,
          preferences: updates.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id); // Use the auth user ID directly

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      // Refresh the profile data
      await fetchProfile(user.id);

      // Log the profile update
      await logAuditEvent('profile_update', true, { updates });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Password Reset Failed",
          description: error.message,
        });
        throw error;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}