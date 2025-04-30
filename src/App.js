import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [recordData, setRecordData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(null);

  // Get base URL from environment variables
  const base_url = process.env.REACT_APP_NODE_ENV === 'development' 
    ? process.env.REACT_APP_LOCAL_BASE_URL 
    : process.env.REACT_APP_SERVER_BASE_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${base_url}/getUsers`);
      // Ensure we're handling the response data correctly
      if (res.data && Array.isArray(res.data)) {
        setRecordData(res.data);
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        // If the API returns an object with a data property that's an array
        if (Array.isArray(res.data.data)) {
          setRecordData(res.data.data);
        } else {
          // If it's an object but not in the expected format, convert to array
          const dataArray = Object.values(res.data).filter(item => typeof item === 'object');
          setRecordData(dataArray.length > 0 ? dataArray : []);
        }
      } else {
        // Fallback to empty array if data is not in expected format
        setRecordData([]);
        console.error("Unexpected data format:", res.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast('error', `Error fetching users: ${err.message || 'Something went wrong'}`);
      setRecordData([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('error', 'Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${base_url}/addUser`, formData);
      setFormData({ name: "", email: "" });
      showToast('success', 'User created successfully');
      fetchUsers(); // Refresh the user list
    } catch (err) {
      showToast('error', `Error creating user: ${err.message || 'Something went wrong'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  // Generate initials from name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a deterministic color based on the name
  const getAvatarColor = (name) => {
    const colors = [
      "#FF6B6B", // coral red
      "#4ECDC4", // turquoise
      "#FFD166", // yellow
      "#6A0572", // purple
      "#1A535C", // dark teal
      "#F72585", // pink
      "#4361EE", // blue
      "#7209B7", // violet
    ];
    
    const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  // Filter users based on search term
  const filteredUsers = searchTerm 
    ? recordData.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recordData;

  return (
    <div className="app-container">
      {/* Toast notification */}
      {toast.show && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* User details modal */}
      {showUserDetails && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUserDetails(null)}>×</button>
            <div className="modal-header" style={{ backgroundColor: getAvatarColor(showUserDetails.name || 'User') }}>
              <div className="modal-avatar">
                {getInitials(showUserDetails.name || 'User')}
              </div>
            </div>
            <div className="modal-body">
              <h2>{showUserDetails.name || 'Unknown User'}</h2>
              <p className="modal-email">{showUserDetails.email || 'No email'}</p>
              <div className="modal-details">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">User ID</span>
                  <span className="modal-detail-value">{showUserDetails.id || 'N/A'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Status</span>
                  <span className="modal-detail-value status-active">Active</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Joined</span>
                  <span className="modal-detail-value">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>UserHub</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Users</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Add User</span>
          </button>
        </nav>
      </div>

      <main className="app-main">
        <header className="main-header">
          <h1>{activeTab === 'users' ? 'User Management' : 'Add New User'}</h1>
          {activeTab === 'users' && (
            <div className="search-container">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search users..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
              )}
            </div>
          )}
        </header>

        <div className="main-content">
          {/* Users List Tab */}
          {activeTab === 'users' && (
            <div className="users-container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="users-grid">
                  {filteredUsers.map((user, index) => (
                    <div 
                      key={index} 
                      className="user-card"
                      onClick={() => setShowUserDetails(user)}
                    >
                      <div className="user-card-banner" style={{ backgroundColor: getAvatarColor(user.name || 'User') }}></div>
                      <div className="user-card-avatar" style={{ backgroundColor: getAvatarColor(user.name || 'User') }}>
                        {getInitials(user.name || 'User')}
                      </div>
                      <div className="user-card-content">
                        <h3 className="user-name">{user.name || 'Unknown'}</h3>
                        <p className="user-email">{user.email || 'No email'}</p>
                        <div className="user-status">
                          <span className="status-dot"></span>
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3>No users found</h3>
                  <p>{searchTerm ? 'Try a different search term' : 'Add your first user to get started'}</p>
                  {searchTerm && (
                    <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>Clear Search</button>
                  )}
                  {!searchTerm && (
                    <button className="btn btn-primary" onClick={() => setActiveTab('add')}>Add User</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add User Tab */}
          {activeTab === 'add' && (
            <div className="add-user-container">
              <div className="form-card">
                <form onSubmit={handleSubmit} className="add-user-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-container">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input
                        id="name"
                        name="name"
                        className="form-input"
                        placeholder="Enter user name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" x2="20" y1="8" y2="14"></line>
                          <line x1="23" x2="17" y1="11" y2="11"></line>
                        </svg>
                        Create User
                      </>
                    )}
                  </button>
                </form>
                <div className="form-illustration">
                  <svg viewBox="0 0 24 24" width="120" height="120" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" x2="20" y1="8" y2="14"></line>
                    <line x1="23" x2="17" y1="11" y2="11"></line>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        /* Modern UI Styles */
        :root {
          --primary: #7C3AED;
          --primary-light: #8B5CF6;
          --primary-dark: #6D28D9;
          --secondary: #10B981;
          --danger: #EF4444;
          --success: #10B981;
          --warning: #F59E0B;
          --info: #3B82F6;
          --background: #F9FAFB;
          --card-bg: #FFFFFF;
          --text: #1F2937;
          --text-light: #6B7280;
          --border: #E5E7EB;
          --border-light: #F3F4F6;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius: 0.5rem;
          --radius-lg: 1rem;
          --transition: all 0.2s ease;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          color: var(--text);
          background-color: var(--background);
        }

        /* App Layout */
        .app-container {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        /* Sidebar */
        .app-sidebar {
          width: 240px;
          background: var(--card-bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 10;
          box-shadow: var(--shadow);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary);
        }

        .logo svg {
          stroke: var(--primary);
        }

        .sidebar-nav {
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: var(--text-light);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 1rem;
          transition: var(--transition);
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background-color: var(--border-light);
          color: var(--text);
        }

        .nav-item.active {
          color: var(--primary);
          background-color: rgba(124, 58, 237, 0.1);
          border-left: 3px solid var(--primary);
        }

        .nav-item.active svg {
          stroke: var(--primary);
        }

        /* Main Content */
        .app-main {
          flex: 1;
          margin-left: 240px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .main-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
        }

        .search-container {
          position: relative;
          width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.875rem;
          transition: var(--transition);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
        }

        .search-clear {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 1.25rem;
          cursor: pointer;
          line-height: 1;
        }

        /* Users Grid */
        .users-container {
          flex: 1;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .user-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: var(--transition);
          cursor: pointer;
          position: relative;
          border: 1px solid var(--border);
        }

        .user-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .user-card-banner {
          height: 80px;
          width: 100%;
        }

        .user-card-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          position: absolute;
          top: 45px;
          left: 20px;
          border: 4px solid white;
        }

        .user-card-content {
          padding: 3rem 1.5rem 1.5rem;
        }

        .user-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-email {
          color: var(--text-light);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--success);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--success);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-light);
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-light);
          margin-bottom: 1.5rem;
        }

        /* Add User Form */
        .add-user-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-card {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          padding: 2rem;
          display: flex;
          border: 1px solid var(--border);
        }

        .add-user-form {
          flex: 1;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .input-container {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 1rem;
          transition: var(--transition);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
        }

        .form-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 2rem;
          color: var(--primary-light);
          opacity: 0.7;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background-color: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--primary-dark);
        }

        .btn-secondary {
          background-color: var(--border-light);
          color: var(--text);
        }

        .btn-secondary:hover {
          background-color: var(--border);
        }

        .btn-submit {
          width: 100%;
          margin-top: 1rem;
          padding: 0.875rem;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Loading States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(124, 58, 237, 0.3);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Toast Notifications */
        .toast {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: var(--radius);
          color: white;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          animation: slideIn 0.3s ease forwards;
        }

        .toast-success {
          background-color: var(--success);
        }

        .toast-error {
          background-color: var(--danger);
        }

        .toast-icon {
          display: flex;
        }

        .toast-message {
          font-weight: 500;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 500px;
          position: relative;
          overflow: hidden;
          animation: scaleIn 0.3s ease;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
          z-index: 10;
        }

        .modal-header {
          height: 150px;
          position: relative;
        }

        .modal-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid white;
        }

        .modal-body {
          padding: 4rem 2rem 2rem;
          text-align: center;
        }

        .modal-body h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .modal-email {
          color: var(--text-light);
          margin-bottom: 1.5rem;
        }

        .modal-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
          border-top: 1px solid var(--border-light);
          padding-top: 1.5rem;
        }

        .modal-detail-item {
          display: flex;
          justify-content: space-between;
        }

        .modal-detail-label {
          color: var(--text-light);
          font-size: 0.875rem;
        }

        .modal-detail-value {
          font-weight: 500;
        }

        .status-active {
          color: var(--success);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .app-sidebar {
            width: 80px;
          }
          
          .logo span,
          .nav-item span {
            display: none;
          }
          
          .nav-item {
            justify-content: center;
            padding: 0.75rem;
          }
          
          .app-main {
            margin-left: 80px;
            padding: 1.5rem;
          }
          
          .form-card {
            flex-direction: column;
          }
          
          .form-illustration {
            display: none;
          }
          
          .search-container {
            width: 200px;
          }
        }

        @media (max-width: 576px) {
          .app-sidebar {
            width: 100%;
            height: 60px;
            flex-direction: row;
            bottom: 0;
            top: auto;
            border-top: 1px solid var(--border);
            border-right: none;
          }
          
          .sidebar-header {
            display: none;
          }
          
          .sidebar-nav {
            flex-direction: row;
            padding: 0;
            width: 100%;
          }
          
          .nav-item {
            flex: 1;
            justify-content: center;
            border-left: none;
            border-top: 3px solid transparent;
          }
          
          .nav-item.active {
            border-left: none;
            border-top: 3px solid var(--primary);
          }
          
          .app-main {
            margin-left: 0;
            margin-bottom: 60px;
            padding: 1rem;
          }
          
          .main-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .search-container {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
