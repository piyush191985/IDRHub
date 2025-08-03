import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/common/Layout';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { SearchPage } from './pages/SearchPage';
import { AgentsPage } from './pages/AgentsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { MessagesPage } from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';
import AdminAdvancedControls from './pages/AdminAdvancedControls';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AgentDetailsPage from './pages/AgentDetailsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { BlogPage } from './pages/BlogPage';
import AgentDashboardLayout from './components/common/AgentDashboardLayout';
import AgentDashboardHome from './pages/AgentDashboardHome';
import AgentMyPropertiesPage from './pages/AgentMyPropertiesPage';
import AddProperty from './pages/AddProperty';
import AgentStatsPage from './pages/AgentStatsPage';
import { TourManagement } from './components/tours/TourManagement';
import { useUserActivity } from './hooks/useUserActivity';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';
import AgentBookingsPage from './pages/AgentBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import { processUploadQueue } from './utils/fileUpload';
import { TestSocialSharing } from './pages/TestSocialSharing';

// Admin-only route protection
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/signin" />;
  }
  
  return <>{children}</>;
};

// Agent-only route protection
const RequireAgent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || user.role !== 'agent') {
    return <Navigate to="/signin" />;
  }
  
  return <>{children}</>;
};

// Component to track user activity
const ActivityTracker: React.FC = () => {
  useUserActivity();
  return null;
};

// Component to process upload queue on app startup
const UploadQueueProcessor: React.FC = () => {
  React.useEffect(() => {
    // Process upload queue when app starts
    const processQueue = async () => {
      try {
        await processUploadQueue();
      } catch (error) {
        console.warn('Failed to process upload queue on startup:', error);
      }
    };
    
    // Process queue after a short delay to ensure auth is loaded
    const timer = setTimeout(processQueue, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ActivityTracker />
        <UploadQueueProcessor />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/:id" element={<PropertyDetailsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/:id" element={<AgentDetailsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
            <Route path="admin/advanced" element={<RequireAdmin><AdminAdvancedControls /></RequireAdmin>} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:id" element={<TransactionDetailsPage />} />
          </Route>
          {/* Agent Dashboard Routes */}
          <Route path="/agent" element={<RequireAgent><AgentDashboardLayout /></RequireAgent>}>
            <Route path="dashboard" element={<AgentDashboardHome />} />
            <Route path="properties" element={<AgentMyPropertiesPage />} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="stats" element={<AgentStatsPage />} />
            <Route path="tours" element={<TourManagement />} />
            <Route path="bookings" element={<AgentBookingsPage />} />
          </Route>
          <Route path="/admin/bookings" element={<RequireAdmin><AdminBookingsPage /></RequireAdmin>} />
          {/* Test Routes */}
          <Route path="/test-social-sharing" element={<TestSocialSharing />} />
          {/* Auth Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;