import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import components
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
import UserManagement from './components/UserManagement';
import PublicComplaintForm from './components/PublicComplaintForm';
import ComplaintSuccess from './pages/ComplaintSuccess';
import NavbarComponent from './components/Navbar';

// Import services
import authService from './services/authService';

/**
 * Main App component with routing and authentication
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <NavbarComponent user={user} onLogout={handleLogout} />}
        
        <Routes>
          {/* Public routes */}
          <Route path="/complaint" element={<PublicComplaintForm />} />
          <Route path="/complaint/success" element={<ComplaintSuccess />} />
          
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to={user.role === 'ROLE_ADMIN' ? "/admin/dashboard" : "/staff/dashboard"} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              user && user.role === 'ROLE_ADMIN' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          <Route 
            path="/staff/dashboard" 
            element={
              user && user.role === 'ROLE_STAFF' ? (
                <StaffDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          <Route 
            path="/complaints" 
            element={
              user ? (
                <ComplaintList />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          <Route 
            path="/complaints/new" 
            element={
              user ? (
                <ComplaintForm />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          <Route 
            path="/complaints/edit/:id" 
            element={
              user ? (
                <ComplaintForm />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          <Route 
            path="/users" 
            element={
              user && user.role === 'ROLE_ADMIN' ? (
                <UserManagement />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Default route */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={user.role === 'ROLE_ADMIN' ? "/admin/dashboard" : "/staff/dashboard"} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
