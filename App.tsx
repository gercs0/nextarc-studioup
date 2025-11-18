
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProjectsProvider } from './context/ProjectsContext';
import { ToastProvider } from './context/ToastContext';
import { CreatorsProvider } from './context/CreatorsContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import PostProjectPage from './pages/PostProjectPage';
import DashboardPage from './pages/DashboardPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';
import StripeSuccessPage from './pages/StripeSuccessPage';
import StripeCancelPage from './pages/StripeCancelPage';
import NotFoundPage from './pages/NotFoundPage';
import ToastContainer from './components/ui/ToastContainer';
import CreatorProfilePage from './pages/CreatorProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminPage from './pages/AdminPage';
import EditProfilePage from './pages/EditProfilePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BrowseCreatorsPage from './pages/BrowseCreatorsPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import BlogPage from './pages/BlogPage';
import ProPage from './pages/ProPage';
import MockStripeCheckout from './pages/MockStripeCheckout';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login?admin=true" replace />;
  }
  return <>{children}</>;
};

const MainLayout = () => (
  <div className="flex flex-col min-h-screen bg-[#050810] text-gray-200 noise-bg">
    <Header />
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Outlet />
    </main>
    <Footer />
    <ToastContainer />
  </div>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <CreatorsProvider>
        <AuthProvider>
          <ProjectsProvider>
            <NotificationsProvider>
              <HashRouter>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="/creators" element={<BrowseCreatorsPage />} />
                    <Route path="/project/:projectId" element={<ProjectDetailPage />} />
                    <Route path="/post-project" element={<PostProjectPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/creator/:creatorId" element={<CreatorProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="/edit-profile" element={<EditProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/leaderboards" element={<LeaderboardsPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/pro" element={<ProPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                  <Route path="/success" element={<StripeSuccessPage />} />
                  <Route path="/cancel" element={<StripeCancelPage />} />
                  <Route path="/mock-checkout" element={<MockStripeCheckout />} />
                </Routes>
              </HashRouter>
            </NotificationsProvider>
          </ProjectsProvider>
        </AuthProvider>
      </CreatorsProvider>
    </ToastProvider>
  );
};

export default App;
