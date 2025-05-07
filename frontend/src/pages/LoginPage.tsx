import React from 'react';
// import { useAuth } from '../auth/AuthContext'; // Potentially needed later for showing auth state

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const LoginPage: React.FC = () => {
  // const { isAuthenticated } = useAuth(); // Example if you want to show different UI based on auth state

  const handleGoogleLogin = () => {
    // The backend URL that initiates the Google OAuth flow
    // This URL should redirect the user to Google's authentication page
    // and then Google will redirect back to your backend's callback URL.
    // Finally, your backend will redirect to the frontend callback URL.
    window.location.href = `${API_BASE_URL}/api/auth/google/login/`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Login</h1>
      {/* {isAuthenticated ? (
        <p>You are already logged in.</p>
      ) : ( */}
        <button onClick={handleGoogleLogin} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Login with Google
        </button>
      {/* )} */}
    </div>
  );
};

export default LoginPage;