import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.post('/login', { email, password });
      
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      toast.success('Login bem-sucedido!');
      navigate('/dashboard'); 
      
    } catch (error: any) {
      toast.error(`Falha no login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.post('/register', { name, email, password });
    
      toast.success(data.message || 'Cadastro realizado com sucesso!');
      navigate('/login'); 
    } 
    catch (error: any) {
      toast.error(`Falha no cadastro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    toast.info('Você foi desconectado.');
  };

  const value = {
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};