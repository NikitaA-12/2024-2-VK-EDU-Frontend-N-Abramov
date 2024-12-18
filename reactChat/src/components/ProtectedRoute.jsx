import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true'); // Проверяем статус аутентификации
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Если пользователь аутентифицирован, показываем дочерние компоненты, иначе перенаправляем на страницу логина
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
