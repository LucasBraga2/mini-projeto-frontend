import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    // Se não há token, redireciona para a página de login
    // 'replace' impede que o usuário volte para a página protegida
    return <Navigate to="/login" replace />;
  }

  // Se há token, renderiza a página filha (no nosso caso, o Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;