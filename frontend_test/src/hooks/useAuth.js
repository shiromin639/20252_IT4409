import { useState } from 'react';
import { USER_ID } from '../constants/shop';

const demoUser = {
  id: USER_ID,
  fullName: 'Nguyễn Minh Long',
  username: 'long_demo',
  email: 'long@example.com',
  phone: '0987654321',
};

export function useAuth() {
  const [user, setUser] = useState(demoUser);

  function login(credentials) {
    setUser({
      ...demoUser,
      username: credentials.username,
      fullName: credentials.fullName || demoUser.fullName,
    });
  }

  function register(account) {
    setUser({
      id: USER_ID,
      fullName: account.fullName,
      username: account.username,
      email: account.email,
      phone: account.phone,
    });
  }

  function logout() {
    setUser(null);
  }

  function updateProfile(profile) {
    setUser((current) => ({
      ...current,
      ...profile,
    }));
  }

  return {
    login,
    logout,
    register,
    updateProfile,
    user,
  };
}
