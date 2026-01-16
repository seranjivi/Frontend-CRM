export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const setAuthUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getAuthUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};