import { useState } from 'react'; // Импортируем useState
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для навигации
import { $api } from './api'; // Импортируем настроенный $api

const LoginPage = () => {
  const [email, setEmail] = useState(''); // Состояние для email
  const [password, setPassword] = useState(''); // Состояние для пароля
  const [loading, setLoading] = useState(false); // Состояние для отображения загрузки
  const [error, setError] = useState(''); // Состояние для отображения ошибок
  const navigate = useNavigate(); // Хук для навигации

  const handleLogin = async () => {
    setLoading(true); // Включаем индикатор загрузки
    setError(''); // Сбрасываем предыдущую ошибку
    try {
      // Используем 'username' вместо 'email' в запросе
      const response = await $api.post('/auth/', { username: email, password }); // Запрос к API
      // Сохраняем токен и refresh токен в localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('isAuthenticated', 'true'); // Сохраняем статус аутентификации
      navigate('/'); // Перенаправляем на главную страницу
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed'); // Устанавливаем сообщение об ошибке
    } finally {
      setLoading(false); // Выключаем индикатор загрузки
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>} {/* Отображаем ошибку, если есть */}
      <input
        type="text"
        placeholder="Username"
        value={email} // Оставляем это поле для ввода username
        onChange={(e) => setEmail(e.target.value)} // Обновляем состояние username
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Обновляем состояние пароля
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
      </p>
    </div>
  );
};

export default LoginPage;
