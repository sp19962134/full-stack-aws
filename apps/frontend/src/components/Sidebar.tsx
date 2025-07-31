import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Task Manager</h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Serverless Course</p>
      </div>

      <nav style={{ marginBottom: '2rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <a 
              href="#" 
              style={{ 
                display: 'block', 
                padding: '0.5rem', 
                color: '#3b82f6', 
                textDecoration: 'none',
                borderRadius: '0.375rem',
                backgroundColor: '#eff6ff'
              }}
            >
              📋 Dashboard
            </a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a 
              href="#" 
              style={{ 
                display: 'block', 
                padding: '0.5rem', 
                color: '#6b7280', 
                textDecoration: 'none',
                borderRadius: '0.375rem'
              }}
            >
              📊 Analytics
            </a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a 
              href="#" 
              style={{ 
                display: 'block', 
                padding: '0.5rem', 
                color: '#6b7280', 
                textDecoration: 'none',
                borderRadius: '0.375rem'
              }}
            >
              ⚙️ Settings
            </a>
          </li>
        </ul>
      </nav>

      {user && (
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '1rem',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <img 
              src={user.avatar} 
              alt={user.name}
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                marginRight: '0.5rem' 
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '0.25rem',
                color: '#6b7280',
                fontSize: '0.75rem'
              }}
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 