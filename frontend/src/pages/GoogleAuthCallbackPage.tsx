import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom
import { useAuth } from '../auth/AuthContext';

const GoogleAuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    // console.log('Callback params:', params.toString());
    // console.log('Access Token:', accessToken);
    // console.log('Refresh Token:', refreshToken);

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken)
        .then(() => {
          // Redirect to a protected route or home page after successful login
          navigate('/'); // Or '/dashboard', etc.
        })
        .catch(error => {
          console.error('Login failed after callback:', error);
          // Handle login failure, e.g., redirect to login page with an error message
          navigate('/login?error=auth_failed');
        });
    } else {
      console.error('Access token or refresh token not found in callback URL.');
      // Redirect to login page with an error message
      navigate('/login?error=token_missing');
    }
  }, [location, login, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Authenticating with Google...</p>
    </div>
  );
};

export default GoogleAuthCallbackPage;