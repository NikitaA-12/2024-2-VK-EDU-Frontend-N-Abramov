import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const handleAvatarClick = () => {
    const newAvatar = prompt('Выберите изображение для аватарки (введите URL):');
    setAvatar(newAvatar);
  };

  const handleBackClick = () => {
    navigate('/'); // Переход на главную страницу с чатами
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button onClick={handleBackClick} className="back-btn">
          <ArrowBackIcon />
        </button>
        <h1>Edit Profile</h1>
        <button className="save-btn">
          <CheckIcon />
        </button>
      </header>

      <div className="profile-content">
        <div className="avatar-container" onClick={handleAvatarClick}>
          {avatar ? (
            <img src={avatar} alt="User Avatar" className="avatar" />
          ) : (
            <div className="avatar-placeholder">+</div>
          )}
        </div>

        <div className="form-field">
          <label>Full name</label>
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
            placeholder="Any details about you"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
