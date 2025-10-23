import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    const user = localStorage.getItem('loggedUser');
    
    setIsLoggedIn(loggedInStatus);
    setIsAdmin(adminStatus);
    setLoggedUser(user ? JSON.parse(user) : null);
  }, []);

  const login = (userData, admin = false) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', admin.toString());
    localStorage.setItem('loggedUser', JSON.stringify(userData));
    setIsLoggedIn(true);
    setIsAdmin(admin);
    setLoggedUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('loggedUser');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setLoggedUser(null);
  };

  return { isLoggedIn, isAdmin, loggedUser, login, logout };
};