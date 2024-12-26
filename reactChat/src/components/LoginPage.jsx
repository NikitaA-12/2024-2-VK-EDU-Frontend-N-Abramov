import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { $api } from './api';
import { useChatData } from './ChatContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchChats } = useChatData();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await $api.post('/auth/', { username: email, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('isAuthenticated', 'true');

      await fetchChats();

      navigate('/');
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
