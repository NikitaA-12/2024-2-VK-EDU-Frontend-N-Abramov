import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { $api } from '../api/api';
import LazyImage from './LazyImage';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = () => {
      const profileData = localStorage.getItem('profile');
      if (profileData) {
        const { avatar, username, first_name, last_name, bio } = JSON.parse(profileData);
        setAvatar(avatar || null);
        setUsername(username || '');
        setFullName(`${first_name || ''} ${last_name || ''}`.trim());
        setBio(bio || '');
      } else {
        fetchProfile();
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token is missing');
        return;
      }

      try {
        const response = await $api.get('https://vkedu-fullstack-div2.ru/api/user/current/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { avatar, username, first_name, last_name, bio } = response.data;

        setAvatar(avatar || null);
        setUsername(username || '');
        setFullName(`${first_name || ''} ${last_name || ''}`.trim());
        setBio(bio || '');

        localStorage.setItem('profile', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setError('Failed to load profile. Please try again later.');
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (username.length > 150) {
      setError('Username cannot be longer than 150 characters');
      return;
    }

    const [firstName, lastName] = fullName.split(' ');

    if (!lastName) {
      setError('Last name is required');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('bio', bio);

    if (avatar && avatar instanceof File) {
      formData.append('avatar', avatar);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing');
        return;
      }

      const response = await $api.patch(
        'https://vkedu-fullstack-div2.ru/api/user/current/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Profile updated:', response.data);
      localStorage.setItem('profile', JSON.stringify(response.data));
      navigate('/');
    } catch (error) {
      console.error('Error saving profile:', error.response?.data || error.message);
      setError('Failed to save profile. Please try again later.');
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setAvatar(file);
    } else {
      setError('Please upload a JPEG or PNG image');
    }
  };

  const handleAvatarContainerClick = () => {
    document.getElementById('avatar-upload').click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    navigate('/login');
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

      {error && <div className="error-message">{error}</div>}

      <div className="profile-content">
        <div className="avatar-container" onClick={handleAvatarContainerClick}>
          {avatar ? (
            avatar instanceof File ? (
              <LazyImage src={URL.createObjectURL(avatar)} alt="User Avatar" className="avatar" />
            ) : (
              <LazyImage src={avatar} alt="User Avatar" className="avatar" />
            )
          ) : (
            <div className="avatar-placeholder">+</div>
          )}
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg, image/png"
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

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

ProfilePage.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default ProfilePage;
