import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompanySearch from './pages/CompanySearch';
import CompanyDetails from './pages/CompanyDetails';
import ReportScam from './pages/ReportScam';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Root Application Routing (`App.jsx`) mapping all 8 required pages.
 * Enforces protected route boundary on `Dashboard`, `ReportScam`, and `AdminDashboard`.
 */
const App = () => {
  return (
    <div className="min-h-screen bg-[#f2f2ef] text-[#0d0d0d] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<CompanySearch />} />
          <Route path="/company/:id" element={<CompanyDetails />} />

          {/* Protected Routes (JWT Bearer Token Required) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-scam"
            element={
              <ProtectedRoute>
                <ReportScam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
