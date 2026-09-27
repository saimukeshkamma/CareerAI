import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { FloatingAssistant } from './components/assistant/FloatingAssistant';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumesPage } from './pages/ResumesPage';
import { JobsPage } from './pages/JobsPage';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { LearningHubPage } from './pages/LearningHubPage';
import { InterviewPage } from './pages/InterviewPage';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedContextId, setSelectedContextId] = useState<any>(null);

  // Sync route on login state
  useEffect(() => {
    if (!isLoading) {
      if (user && (currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup')) {
        setCurrentTab('dashboard');
      } else if (!user && currentTab !== 'landing' && currentTab !== 'login' && currentTab !== 'signup') {
        setCurrentTab('landing');
      }
    }
  }, [user, isLoading]);

  const handleNavigate = (tab: string, contextId?: any) => {
    setCurrentTab(tab);
    if (contextId !== undefined) {
      setSelectedContextId(contextId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicPage = currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup';

  return (
    <div className="min-h-screen flex flex-col bg-[#080c17] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Global Navbar */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Layout Area */}
      {isPublicPage ? (
        <main className="flex-1">
          {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {currentTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
          {currentTab === 'signup' && <SignupPage onNavigate={handleNavigate} />}
        </main>
      ) : (
        <div className="flex-1 flex w-full max-w-7xl mx-auto">
          {/* Dashboard Sidebar */}
          <Sidebar currentTab={currentTab} onNavigate={handleNavigate} />

          {/* Core Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
            {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
            {currentTab === 'resumes' && <ResumesPage />}
            {currentTab === 'jobs' && <JobsPage />}
            {currentTab === 'saved-jobs' && <SavedJobsPage onNavigate={handleNavigate} />}
            {currentTab === 'skills' && <SkillGapPage onNavigate={handleNavigate} />}
            {currentTab === 'learning-hub' && <LearningHubPage onNavigate={handleNavigate} initialTopic={selectedContextId} />}
            {currentTab === 'interview' && <InterviewPage onNavigate={handleNavigate} initialInterviewId={selectedContextId} />}
            {currentTab === 'interview-history' && <InterviewHistoryPage onNavigate={handleNavigate} />}
            {currentTab === 'analytics' && <AnalyticsPage />}
            {currentTab === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
            {currentTab === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
          </main>
        </div>
      )}

      {/* Persistent Floating AI Career Assistant */}
      <FloatingAssistant onNavigate={handleNavigate} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
