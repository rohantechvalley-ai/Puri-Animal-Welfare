/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { HomeView } from './components/HomeView';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { ReportsView } from './components/ReportsView';
import { CampaignsView } from './components/CampaignsView';
import { ForumView } from './components/ForumView';
import { DeveloperDocsView } from './components/DeveloperDocsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EnterpriseSuiteView } from './components/EnterpriseSuiteView';

function AppContent() {
  const [currentTab, setTab] = useState<string>('home');
  const { currentUser } = useApp();

  const renderActiveView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView setTab={setTab} />;
      case 'reports':
        return <ReportsView setTab={setTab} />;
      case 'campaigns':
        return <CampaignsView />;
      case 'forum':
        return <ForumView />;
      case 'developer-docs':
        return <DeveloperDocsView />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'enterprise':
        return <EnterpriseSuiteView />;
      case 'profile':
        return <ProfileView />;
      case 'profile-settings':
        return <ProfileSettingsView />;
      case 'auth-login':
        return <AuthView onSuccess={() => setTab('profile')} initialMode="login" />;
      case 'auth-signup':
        return <AuthView onSuccess={() => setTab('profile')} initialMode="signup" />;
      default:
        return <HomeView setTab={setTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300" id="applet-viewport">
      {/* Dynamic Ambient Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none -z-10" />

      {/* Global Navigation */}
      <Navbar currentTab={currentTab} setTab={setTab} />

      {/* Primary Page Layout View Container with smooth Framer Motion Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            id="view-transition-wrapper"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Shared Footer block */}
      <Footer setTab={setTab} />

      {/* Tactical Toast Overlay Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
