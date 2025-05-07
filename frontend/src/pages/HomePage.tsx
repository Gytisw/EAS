import React from 'react';
import { useAuth } from '../auth/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to the Application</h1>
      {isAuthenticated ? (
        <div>
          <p>You are logged in!</p>
          {user && <p>User: {JSON.stringify(user)}</p>}
          <button onClick={logout} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            Logout
          </button>
        </div>
      ) : (
        <p>Please log in to access the application features.</p>
      )}
    </div>
  );
};

export default HomePage;