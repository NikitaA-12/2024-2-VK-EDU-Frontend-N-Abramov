import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthenticated } from '../store/userSlice';
import { checkAuthStatus, clearAuthData } from '../api/api';

const ProtectedRoute = ({ children }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isAuthenticated = useSelector((state) => state.users.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuthStatus();

      if (isAuth) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
        clearAuthData();
      }

      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
