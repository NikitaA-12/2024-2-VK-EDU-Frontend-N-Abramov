import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { $api } from './api'; // Использование axios с базовым URL

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null); // Для аватара
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    // Проверка обязательных полей
    if (!username || !firstName || !lastName || !bio || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Проверка формата аватара
    if (avatar && avatar.type !== 'image/jpeg' && avatar.type !== 'image/png') {
      setError('Avatar must be in jpg or png format');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData(); // Используем FormData для отправки файла
      formData.append('username', username);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('bio', bio);
      formData.append('password', password);
      if (avatar) formData.append('avatar', avatar); // Добавляем аватар

      const response = await $api.post('/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Устанавливаем тип контента для файлов
        },
      });

      // Логирование для отладки
      console.log('Response:', response.data);

      // Проверка наличия токенов в ответе
      if (response.data && response.data.access && response.data.refresh) {
        // Сохраняем токен и refresh токен в localStorage
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('isAuthenticated', 'true'); // Устанавливаем статус аутентификации
      } else {
        setError('Server did not return valid tokens');
      }

      navigate('/'); // Перенаправляем на главную страницу
    } catch (error) {
      // Логируем ошибку
      console.error('Error:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input type="text" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="file"
        placeholder="Avatar"
        onChange={(e) => setAvatar(e.target.files[0])} // Убираем аватар
      />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p>
        Already have an account? <span onClick={() => navigate('/login')}>Login</span>
      </p>
    </div>
  );
};

export default RegisterPage;
