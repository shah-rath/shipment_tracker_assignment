import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for the user object in localStorage instead of the old flag.
  const user = localStorage.getItem('user');

  // If a user object exists, the user is authenticated.
  // Otherwise, redirect them to the login page.
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
