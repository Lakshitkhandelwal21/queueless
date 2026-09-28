import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KioskPage from './pages/KioskPage';
import PublicTVDisplay from './pages/PublicTVDisplay';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/kiosk" element={<KioskPage />} />
            <Route path="/tv" element={<PublicTVDisplay />} />

            {/* Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/customer" element={<CustomerDashboard />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<RoleGuard allowedRoles={['staff', 'admin']} />}>
              <Route path="/staff" element={<StaffDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
