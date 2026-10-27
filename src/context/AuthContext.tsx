import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ message: string; email: string }>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cris_beauty_token');
  });
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage and verify session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cris_beauty_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Invalid session
            localStorage.removeItem('cris_beauty_token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('Session check failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao realizar login.');
    }

    localStorage.setItem('cris_beauty_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao criar conta.');
    }

    return data;
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await credential.user.getIdToken();

      // Verify token with backend
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar com Google.');
      }

      localStorage.setItem('cris_beauty_token', idToken);
      setToken(idToken);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      console.error('Google auth error:', err);
      throw new Error(err.message || 'Erro ao conectar conta Google.');
    }
  };

  const logout = () => {
    localStorage.removeItem('cris_beauty_token');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
    if (!token) throw new Error('Não autenticado.');

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Erro ao atualizar perfil.');
    }

    setUser(resData.user);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
