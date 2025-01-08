import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticated, clearAuthData } from '../store/userSlice';
import api from '../api/api';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await api.checkAuthStatus();

      if (isAuth) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
        dispatch(clearAuthData());
      }

      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
