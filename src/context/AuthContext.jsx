import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('prathy_token');
    const savedUser = localStorage.getItem('prathy_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      if (parsedUser?.email) {
        fetch(`http://localhost:5000/api/profile?email=${parsedUser.email}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const freshData = { ...parsedUser, ...data.data };
              setUser(freshData);
              localStorage.setItem('prathy_user', JSON.stringify(freshData));
            }
          })
          .catch(err => console.error('Failed to sync profile', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('prathy_token', authToken);
    localStorage.setItem('prathy_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('prathy_token');
    localStorage.removeItem('prathy_user');
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('prathy_user', JSON.stringify(merged));
  };

  const updateProfile = (newData) => {
    updateUser(newData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
