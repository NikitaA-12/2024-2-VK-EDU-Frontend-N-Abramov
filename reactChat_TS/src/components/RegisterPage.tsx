import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

const RegisterPage = () => {
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    if (!username || !firstName || !lastName || !bio || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (avatar && avatar.type !== 'image/jpeg' && avatar.type !== 'image/png') {
      setError('Avatar must be in jpg or png format');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('bio', bio);
      formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);

      const apiInstance = api.getApiInstance();
      const response = await apiInstance.post('/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.access && response.data.refresh) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        setError('Server did not return valid tokens');
      }

      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAvatar(e.target.files[0]);
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
      <input type="file" placeholder="Avatar" onChange={handleAvatarChange} />
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
