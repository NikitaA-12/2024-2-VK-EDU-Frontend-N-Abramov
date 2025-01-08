import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchChats } from '../store/chatsSlice';
import { api } from '../api/api';
import { setAuthenticated, setUserDetails } from '../store/userSlice';

interface LoginPageProps {
  onLogin: () => void;
}

const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('isAuthenticated');
};

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const apiInstance = api.getApiInstance();
      const response = await apiInstance.post('/auth/', { username: email, password });

      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('isAuthenticated', 'true');

      dispatch(setAuthenticated(true));
      dispatch(setUserDetails(response.data.user));

      await dispatch(fetchChats({ page: 1, pageSize: 10, searchTerm: '' }) as any);

      onLogin();
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Login failed');
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <input type="text" placeholder="Username" value={email} onChange={handleEmailChange} />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        Don’t have an account?{' '}
        <span onClick={() => navigate('/register')} style={{ color: 'blue', cursor: 'pointer' }}>
          Register
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
