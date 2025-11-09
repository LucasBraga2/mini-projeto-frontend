import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api'; // Nosso fetch wrapper
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// 1. Definimos os tipos para o nosso contexto
interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 2. Definimos os tipos para as props do Provedor
interface AuthProviderProps {
  children: ReactNode;
}

// 3. Criamos o contexto
const AuthContext = createContext<AuthContextType | null>(null);

// 4. Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// 5. O componente Provedor
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Inicializa o estado lendo o token do localStorage
    return localStorage.getItem('token');
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  // Função de Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Chama a API
      const data = await apiService.post('/login', { email, password });
      
      // 2. Armazena o token
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      // 3. Feedback de sucesso e redirecionamento
      toast.success('Login bem-sucedido!');
      navigate('/dashboard'); // Redireciona para a área logada
      
    } catch (error: any) {
      toast.error(`Falha no login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de Registro
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Chama a API
      const data = await apiService.post('/register', { name, email, password });
      
      // 2. Feedback de sucesso e redirecionamento
      toast.success(data.message || 'Cadastro realizado com sucesso!');
      navigate('/login'); // Envia para o login após o cadastro
      
    } catch (error: any) {
      toast.error(`Falha no cadastro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de Logout
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    toast.info('Você foi desconectado.');
    // O 'useEffect' lá em cima vai cuidar do redirecionamento
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