/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ShieldAlert, 
  Database,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead, logOut, updateProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Helping Puri’s Street Animals & Beaches',
      reports: 'Report an Injured Animal in Puri',
      campaigns: 'Support Animals & Beach Cleanups',
      forum: 'Community Forum for Animal Lovers',
      profile: 'My Account',
      'profile-settings': 'Settings'
    };

    const descriptions: Record<string, string> = {
      home: 'Independent community initiative to help street dogs, temple cows, and keep beaches clean in Puri, Odisha.',
      reports: 'Report injured street dogs, sick cows, or litter on Puri beach in under 1 minute.',
      campaigns: 'Help buy food, medicines, and waste bins for our animal welfare and beach cleanup efforts in Puri.',
      forum: 'Connect with other volunteers and animal lovers in Puri.',
      profile: 'View your reports, discussions, and settings.',
      'profile-settings': 'Update your name, bio, and settings.'
    };

    const activeTitle = titles[currentTab] || 'Puri Stray Dog, Cow & Nature Welfare Platform';
    const activeDesc = descriptions[currentTab] || 'Rescuing stray dogs, street cows, and protecting the natural environment in Puri.';

    document.title = activeTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', activeDesc);

    const ogTags = {
      'og:title': activeTitle,
      'og:description': activeDesc,
      'og:url': window.location.href,
      'og:type': 'website',
      'twitter:title': activeTitle,
      'twitter:description': activeDesc
    };

    Object.entries(ogTags).forEach(([property, value]) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(property.startsWith('og:') ? 'property' : 'name', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    });
  }, [currentTab]);

  const handleTabChange = (tab: string) => {
    if (tab === 'volunteer' || tab === 'about' || tab === 'contact') {
      setTab('home');
      setMobileMenuOpen(false);
      setTimeout(() => {
        const idMap: Record<string, string> = {
          volunteer: 'volunteer-section',
          about: 'mission-section',
          contact: 'global-footer'
        };
        const element = document.getElementById(idMap[tab]);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    setTab(tab);
    setMobileMenuOpen(false);
  };



  return (
    <header className="sticky top-0 z-40 w-full" id="global-header">
      <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => handleTabChange('home')}
            id="brand-logo-trigger"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-emerald flex items-center justify-center text-white shadow-lg shadow-brand-emerald/20 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 fill-white/10" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">
                Puri Animal <span className="text-brand-emerald">&amp; Nature</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-gray-400 dark:text-slate-400 uppercase">
                Welfare Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" id="desktop-navigation">
            {[
              { id: 'home', label: 'Home' },
              { id: 'reports', label: 'Report' },
              { id: 'forum', label: 'Community' },
              { id: 'campaigns', label: 'Campaigns' },
              { id: 'volunteer', label: 'Volunteer' },
              { id: 'about', label: 'About' },
              { id: 'contact', label: 'Contact' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  currentTab === tab.id 
                    ? 'text-brand-emerald' 
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
                }`}
                id={`nav-link-${tab.id}`}
              >
                {tab.label}
                {currentTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-emerald rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Actions Bar */}
          <div className="hidden md:flex items-center gap-4" id="desktop-actions">


            {/* Notifications Bell */}
            <div className="relative" id="notifications-dropdown-root">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors relative"
                id="bell-icon-trigger"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel shadow-2xl border p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                      <span className="font-display font-semibold text-sm text-gray-900 dark:text-white">Inbox</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-medium text-brand-emerald hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center text-gray-400 dark:text-slate-400 py-6">Your inbox is empty.</p>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              setNotifDropdownOpen(false);
                              if (notif.type === 'report') handleTabChange('profile');
                            }}
                            className={`p-2.5 rounded-xl transition-all text-left cursor-pointer border ${
                              notif.read 
                                ? 'bg-transparent border-transparent text-gray-500 dark:text-slate-400' 
                                : 'bg-brand-emerald/5 border-brand-emerald/10 text-gray-800 dark:text-slate-200 hover:bg-brand-emerald/10'
                            }`}
                          >
                            <h4 className="font-semibold text-xs flex items-center justify-between">
                              {notif.title}
                              {!notif.read && <span className="w-1.5 h-1.5 bg-brand-emerald rounded-full" />}
                            </h4>
                            <p className="text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] font-mono opacity-60 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            {currentUser ? (
              <div className="relative" id="profile-dropdown-root">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors border border-gray-200/50 dark:border-slate-800/50"
                  id="profile-dropdown-trigger"
                >
                  <img 
                    src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                    alt={currentUser.name} 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-emerald/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase leading-none mt-0.5">{currentUser.role}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel shadow-2xl border p-2 z-50"
                    >
                      <button
                        onClick={() => {
                          handleTabChange('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/55 rounded-xl transition-all"
                      >
                        <User className="w-4 h-4 text-brand-emerald" />
                        My Account
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => {
                            handleTabChange('admin-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/55 rounded-xl transition-all"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleTabChange('profile-settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/55 rounded-xl transition-all"
                      >
                        <Settings className="w-4 h-4 text-brand-blue" />
                        Settings
                      </button>
                      <hr className="my-1 border-gray-100 dark:border-slate-800" />
                      <button
                        onClick={() => {
                          logOut();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => handleTabChange('auth-login')}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-emerald hover:bg-brand-teal transition-all shadow-lg shadow-brand-emerald/10 hover:shadow-brand-emerald/25"
                id="sign-in-btn"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3" id="mobile-actions">

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors"
              id="mobile-drawer-trigger"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 overflow-hidden relative z-50"
            id="mobile-drawer-content"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'reports', label: 'Report' },
                { id: 'forum', label: 'Community' },
                { id: 'campaigns', label: 'Campaigns' },
                { id: 'volunteer', label: 'Volunteer' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentTab === tab.id 
                      ? 'bg-brand-emerald/10 text-brand-emerald' 
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <hr className="my-2 border-gray-100 dark:border-slate-800" />

              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img 
                      src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                      alt={currentUser.name} 
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 uppercase font-mono">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTabChange('profile')}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </button>
                  <button
                    onClick={() => handleTabChange('profile-settings')}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      logOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleTabChange('auth-login')}
                  className="w-full text-center py-3 bg-brand-emerald text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-emerald/10"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
