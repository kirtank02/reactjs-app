import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [recordData, setRecordData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

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
      "#10b981", // emerald-500
      "#3b82f6", // blue-500
      "#8b5cf6", // purple-500
      "#ec4899", // pink-500
      "#f59e0b", // amber-500
      "#6366f1", // indigo-500
      "#f43f5e", // rose-500
      "#06b6d4", // cyan-500
    ];
    
    const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Toast notification */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <h1 className="text-xl font-bold">User Management</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Users List
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'add'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('add')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" x2="20" y1="8" y2="14"></line>
                  <line x1="23" x2="17" y1="11" y2="11"></line>
                </svg>
                Add User
              </div>
            </button>
          </div>
        </div>

        {/* Users List Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Users List</h2>
              <p className="text-sm text-gray-500">View all registered users in the system</p>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : Array.isArray(recordData) && recordData.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recordData.map((user, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 bg-gray-50 p-4">
                        <div 
                          className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: getAvatarColor(user.name || 'User') }}
                        >
                          {getInitials(user.name || 'User')}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">User #{index + 1}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                          </svg>
                          <span>{user.email || 'No email'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p className="text-sm text-gray-500">Add your first user to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add User Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Add New User</h2>
              <p className="text-sm text-gray-500">Enter the details to create a new user</p>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter user name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Add some basic styles */}
      <style jsx>{`
        /* Basic reset and styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          color: #333;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .min-h-screen {
          min-height: 100vh;
        }
        
        .bg-gradient-to-b {
          background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
        }
        
        .from-gray-50 {
          --tw-gradient-from: #f9fafb;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(249, 250, 251, 0));
        }
        
        .to-gray-100 {
          --tw-gradient-to: #f3f4f6;
        }
        
        .bg-white {
          background-color: white;
        }
        
        .rounded-lg {
          border-radius: 0.5rem;
        }
        
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .border {
          border: 1px solid #e5e7eb;
        }
        
        .border-b {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .overflow-hidden {
          overflow: hidden;
        }
        
        .p-4 {
          padding: 1rem;
        }
        
        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        
        .mb-4 {
          margin-bottom: 1rem;
        }
        
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        
        .mr-2 {
          margin-right: 0.5rem;
        }
        
        .flex {
          display: flex;
        }
        
        .items-center {
          align-items: center;
        }
        
        .justify-center {
          justify-content: center;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .gap-2 {
          gap: 0.5rem;
        }
        
        .gap-4 {
          gap: 1rem;
        }
        
        .text-xl {
          font-size: 1.25rem;
        }
        
        .text-lg {
          font-size: 1.125rem;
        }
        
        .text-sm {
          font-size: 0.875rem;
        }
        
        .text-xs {
          font-size: 0.75rem;
        }
        
        .font-bold {
          font-weight: 700;
        }
        
        .font-semibold {
          font-weight: 600;
        }
        
        .font-medium {
          font-weight: 500;
        }
        
        .text-emerald-500 {
          color: #10b981;
        }
        
        .text-emerald-600 {
          color: #059669;
        }
        
        .text-gray-500 {
          color: #6b7280;
        }
        
        .text-gray-600 {
          color: #4b5563;
        }
        
        .text-gray-700 {
          color: #374151;
        }
        
        .text-white {
          color: white;
        }
        
        .bg-emerald-500 {
          background-color: #10b981;
        }
        
        .hover\\:bg-emerald-600:hover {
          background-color: #059669;
        }
        
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        
        .hover\\:shadow-md:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .transition-colors {
          transition-property: color, background-color, border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .rounded-md {
          border-radius: 0.375rem;
        }
        
        .rounded-full {
          border-radius: 9999px;
        }
        
        .h-16 {
          height: 4rem;
        }
        
        .h-12 {
          height: 3rem;
        }
        
        .h-8 {
          height: 2rem;
        }
        
        .h-4 {
          height: 1rem;
        }
        
        .w-12 {
          width: 3rem;
        }
        
        .w-8 {
          width: 2rem;
        }
        
        .w-4 {
          width: 1rem;
        }
        
        .w-full {
          width: 100%;
        }
        
        .space-y-4 > * + * {
          margin-top: 1rem;
        }
        
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        
        .grid {
          display: grid;
        }
        
        .grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .border-emerald-500 {
          border-color: #10b981;
        }
        
        .border-t-transparent {
          border-top-color: transparent;
        }
        
        .focus\\:outline-none:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        
        .focus\\:ring-2:focus {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }
        
        .focus\\:ring-emerald-500:focus {
          --tw-ring-color: #10b981;
        }
        
        .fixed {
          position: fixed;
        }
        
        .sticky {
          position: sticky;
        }
        
        .top-0 {
          top: 0;
        }
        
        .top-4 {
          top: 1rem;
        }
        
        .right-4 {
          right: 1rem;
        }
        
        .z-10 {
          z-index: 10;
        }
        
        .z-50 {
          z-index: 50;
        }
        
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .bg-green-500 {
          background-color: #10b981;
        }
        
        .bg-red-500 {
          background-color: #ef4444;
        }
        
        .text-center {
          text-align: center;
        }
        
        .flex-col {
          flex-direction: column;
        }
        
        .block {
          display: block;
        }
        
        .inline-block {
          display: inline-block;
        }
        
        /* Media queries for responsive design */
        @media (min-width: 640px) {
          .sm\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

export default App;
