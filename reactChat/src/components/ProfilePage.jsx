import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // Загрузка данных профиля из localStorage при загрузке страницы
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('profile')) || {};
    setAvatar(savedProfile.avatar || '');
    setFullName(savedProfile.fullName || '');
    setUsername(savedProfile.username || '');
    setBio(savedProfile.bio || '');
  }, []);

  // Сохранение данных профиля
  const handleSave = () => {
    const profileData = {
      avatar,
      fullName,
      username,
      bio,
    };

    try {
      localStorage.setItem('profile', JSON.stringify(profileData));
      navigate('/'); // Переход на главную страницу (список чатов)
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
    }
  };

  // Возврат на главную страницу без сохранения
  const handleBackClick = () => {
    navigate('/');
  };

  // Обработчик выбора файла для аватарки
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result); // Устанавливаем аватарку как Base64 строку
      };
      reader.readAsDataURL(file);
    }
  };

  // Имитируем клик по скрытому input при нажатии на контейнер
  const handleAvatarContainerClick = () => {
    document.getElementById('avatar-upload').click();
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button onClick={handleBackClick} className="back-btn">
          <ArrowBackIcon />
        </button>
        <h1>Edit Profile</h1>
        <button onClick={handleSave} className="save-btn">
          <CheckIcon />
        </button>
      </header>

      <div className="profile-content">
        <div className="avatar-container" onClick={handleAvatarContainerClick}>
          {avatar ? (
            <img src={avatar} alt="User Avatar" className="avatar" />
          ) : (
            <div className="avatar-placeholder">+</div>
          )}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-field">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-field">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div className="form-field">
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
