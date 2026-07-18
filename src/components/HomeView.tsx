/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Heart, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  AlertTriangle,
  Flame,
  Globe,
  Trees,
  Volume2,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { emailService } from '../services/EmailService';
import { SpamProtection } from './SpamProtection';

interface HomeViewProps {
  setTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setTab }) => {
  const { reports, campaigns, makeDonation } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactCaptcha, setContactCaptcha] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  // Volunteer RSVP State
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerCaptcha, setVolunteerCaptcha] = useState<string | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      setContactError('Please complete all fields.');
      return;
    }

    if (!contactCaptcha) {
      setContactError('Spam Protection: Please complete the verification.');
      return;
    }

    setContactLoading(true);
    try {
      await emailService.sendEmail(contactEmail, 'contact_form', {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      setContactCaptcha(null);
    } catch (err: any) {
      setContactError(err.message || 'Failed to dispatch your contact message.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName || !volunteerEmail) return;

    if (!volunteerCaptcha) {
      alert('Spam Protection: Please complete the verification.');
      return;
    }

    setRsvpLoading(true);
    try {
      await emailService.sendEmail(volunteerEmail, 'volunteer', {
        name: volunteerName,
        activity: 'Puri Beach Sand Dune Cleaning & Restoration',
        date: 'Next Sunday, 06:00 AM'
      });
      setRsvpSuccess(true);
      setVolunteerName('');
      setVolunteerEmail('');
      setVolunteerCaptcha(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  // Stats Counters Simulation
  const stats = [
    { label: 'Injured Animals Healed', value: '1,420+', desc: 'Stray dogs and street cows' },
    { label: 'Beaches Cleaned of Plastic', value: '124+', desc: 'Weekly plastic cleanup runs' },
    { label: 'Active Coastal Guardians', value: '850+', desc: 'Registered local volunteers' },
    { label: 'Medical Treatment Vehicles', value: '3', desc: 'Fully equipped mobile clinics' },
  ];

  const successStories = [
    {
      title: 'Balaram: From Temple Stray to Health Sanctuary',
      category: 'Street Cow Welfare',
      desc: 'Balaram was found bleeding near Puri Jagannath Temple road with a deep iron-rod laceration. Within hours, our Mobile Veterinary Van arrived, performed local suturing, and transported him to our central shelter. Today, Balaram is fully recovered and living happily at our cow sanctuary in Puri.',
      img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600',
      tag: 'Cows'
    },
    {
      title: 'Sheru: Recovery of a Severely Sick Beach Pup',
      category: 'Stray Dog Welfare',
      desc: 'Sheru was found collapsed on Puri beach near Lighthouse road suffering from parvo and severe exhaustion. Volunteers alertly dispatched our rescue vehicle. After 3 weeks of dedicated IV fluids, veterinary medication, and safe rehabilitation, Sheru has fully recovered and is now the beloved guard pup of our volunteer beach camp.',
      img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      tag: 'Stray Dogs'
    }
  ];

  const faqItems = [
    {
      q: 'What should I do if I find an injured street cow or dog in Puri?',
      a: 'Go to our "Rescue Alerts" tab immediately. Fill out the emergency form with the exact location description, select the injury severity, and upload a clear photo. Community volunteers monitor this feed to coordinate help and local veterinary care where possible.'
    },
    {
      q: 'Are contributions going to a registered charity?',
      a: 'No, this platform is an independent community-driven initiative started by a local resident. All funds are managed completely transparently to buy food, medical supplies, and trash bins, but we do not have an NGO registration and cannot offer tax exemptions.'
    },
    {
      q: 'How can I participate in the weekend beach cleaning drives?',
      a: 'We host weekly cleanups every Sunday at 6:00 AM, starting near the Puri Beach Lighthouse. You can register an account, check our volunteer notification thread, and just show up! We provide biodegradable trash bags, gloves, and coastal safety gear.'
    }
  ];

  return (
    <div className="space-y-24 pb-20" id="homepage-root">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-20 md:py-32" id="hero-section">
        {/* Animated Beach Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 -z-10" />
        
        {/* Particle/Wave details */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/10 dark:bg-brand-emerald/5 rounded-full filter blur-3xl animate-float -z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full filter blur-3xl animate-drift -z-10" />

        {/* Gliding herons animation */}
        <div className="absolute top-12 left-10 opacity-30 select-none hidden md:block">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="currentColor" className="text-brand-teal animate-pulse">
            <path d="M0,20 Q25,0 50,20 Q75,40 100,20" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-text-content">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-teal dark:text-brand-mint px-4 py-1.5 rounded-full text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>COMMUNITY COEXISTENCE IN PURI, ODISHA</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]"
            >
              Helping Puri’s <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-emerald dark:from-brand-mint dark:to-brand-blue">
                Street Animals &amp; Beaches
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-md sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-2xl"
            >
              An independent community initiative to help street dogs, friendly temple cows, and keep our beautiful Puri beaches clean. Report an injured animal, join our next cleanup, or support us with food and medicines.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
              id="hero-cta-buttons"
            >
              <button
                onClick={() => setTab('reports')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-4 rounded-2xl shadow-xl shadow-red-600/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                Report Injured Animal
              </button>
              <button
                onClick={() => setTab('campaigns')}
                className="flex items-center gap-2 bg-brand-emerald hover:bg-brand-teal text-white font-semibold px-7 py-4 rounded-2xl shadow-xl shadow-brand-emerald/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Heart className="w-5 h-5 fill-white/10" />
                Donate to Campaigns
              </button>
            </motion.div>

            {/* Micro-Trust Banner */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 flex items-center gap-8 text-xs text-gray-400 dark:text-slate-400 font-mono"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-emerald" />
                <span>100% Volunteer Driven</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-blue" />
                <span>Working with Local Helpers</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Graphic / Bento Card */}
          <div className="lg:col-span-5 relative" id="hero-graphic-grid">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-square w-full max-w-[440px] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800"
            >
              {/* Dynamic Image Slideshow Simulation */}
              <img 
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" 
                alt="Injured fauna rescue puri" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Glass Info Card Overlays */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel shadow-lg border text-left">
                <p className="text-xs font-bold text-brand-teal dark:text-brand-mint font-mono uppercase tracking-wider">Beach Guardians</p>
                <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white mt-1">Puri Lighthouse Waste Cleanup</h4>
                <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">Removing plastic traps, general litter, and feeding street animals daily.</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. STATS OVERVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="stats-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl border hover:border-brand-emerald/30 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all text-left group"
            >
              <h3 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white group-hover:text-brand-emerald transition-colors">{stat.value}</h3>
              <p className="font-semibold text-sm text-gray-700 dark:text-slate-200 mt-2">{stat.label}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. MISSION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="mission-section">
        <div className="glass-panel p-8 md:p-14 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-emerald/10 to-transparent rounded-full filter blur-2xl" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-6">
              <span className="text-xs font-bold uppercase text-brand-emerald tracking-widest">ABOUT OUR WORK</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Ordinary Citizens Coming Together for Puri
              </h2>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-sm md:text-md">
                Puri is a beautiful place, but our street cows, stray dogs, and beautiful beaches need our care. This platform is not an NGO or government office—it is a community initiative started by a local resident to connect volunteers, vets, and kind citizens who want to feed stray animals, report emergencies, and clean plastic from the beaches.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  'Easy Injury Reporting (Under 1 Minute)',
                  'Weekly Beach Cleanups with Friends',
                  '100% Transparent Food & Medical Purchases',
                  'A Friendly Community of Animal Lovers'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                    <CheckCircle className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-4" id="mission-illus-card">
              <div className="p-6 rounded-2xl bg-brand-teal text-white space-y-4 shadow-xl">
                <Trees className="w-10 h-10 stroke-[1.5]" />
                <h3 className="font-display font-bold text-lg">Our Beach Commitment</h3>
                <p className="text-xs leading-relaxed opacity-90">
                  Every animal emergency that is successfully resolved helps motivate more locals to clear plastic waste from Puri's beautiful beach dunes.
                </p>
                <div className="text-xs font-bold bg-white/10 p-2 rounded-lg text-center">
                  Clean beaches for dogs, cows, and tourists!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUCCESS CHRONICLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="success-stories-section">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase text-brand-emerald tracking-widest">REAL SUCCESS STORIES</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Animals We Have Helped
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Read how simple everyday people and local helpers work together to save street animals in Puri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {successStories.map((story, i) => (
            <div key={i} className="glass-panel rounded-3xl overflow-hidden border flex flex-col h-full hover:shadow-xl transition-all group">
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={story.img} 
                  alt={story.title} 
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-teal text-white text-xs font-mono font-bold px-3 py-1 rounded-full uppercase">
                  {story.tag}
                </span>
              </div>
              <div className="p-6 md:p-8 flex-grow space-y-4">
                <span className="text-xs font-bold text-brand-emerald font-mono uppercase tracking-widest">{story.category}</span>
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white leading-tight">{story.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-slate-300 leading-relaxed">{story.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LIVE REPORTS MONITOR PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="live-reports-feed-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-red-500 tracking-widest">EMERGENCY ALERTS</span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Recent Emergency Reports
            </h2>
          </div>
          <button
            onClick={() => setTab('reports')}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-emerald hover:text-brand-teal hover:underline transition-all"
          >
            Open Live Alert Board
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.slice(0, 3).map((report) => (
            <div key={report.id} className="glass-card rounded-2xl border overflow-hidden p-5 flex flex-col justify-between hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-700 transition-all text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase font-extrabold px-2.5 py-1 rounded-full ${
                    report.severity === 'critical' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {report.severity} Priority
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>

                <div className="relative h-40 rounded-xl overflow-hidden">
                  <img 
                    src={report.images[0]} 
                    alt={report.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">
                    {report.animal_type}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-md text-gray-900 dark:text-white leading-snug line-clamp-1">{report.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">{report.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                  <span className="truncate max-w-[130px]">{report.location}</span>
                </span>
                <span className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-lg ${
                  report.status === 'resolved' 
                    ? 'text-brand-emerald bg-brand-emerald/10'
                    : 'text-brand-blue bg-brand-blue/10'
                }`}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CAMPAIGNS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="campaigns-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-brand-emerald tracking-widest">HELP OUR CAMPAIGNS</span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Urgent Support Needs
            </h2>
          </div>
          <button
            onClick={() => setTab('campaigns')}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-emerald hover:text-brand-teal hover:underline transition-all"
          >
            View All Campaigns
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((camp) => {
            const percent = Math.min(100, Math.floor((camp.raised_amount / camp.goal_amount) * 100));
            return (
              <div key={camp.id} className="glass-panel rounded-3xl border overflow-hidden flex flex-col justify-between h-full hover:shadow-xl hover:border-brand-emerald/20 transition-all">
                <div>
                  <div className="relative h-48">
                    <img 
                      src={camp.image} 
                      alt={camp.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {camp.category}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-display font-bold text-md text-gray-900 dark:text-white leading-snug line-clamp-2">{camp.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed line-clamp-3">{camp.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-brand-teal dark:text-brand-mint">{percent}% Raised</span>
                      <span className="text-gray-400">Goal: ₹{camp.goal_amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 font-mono">CONTRIBUTIONS</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₹{camp.raised_amount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setTab('campaigns')}
                      className="text-xs font-semibold bg-brand-emerald text-white px-4 py-2.5 rounded-xl hover:bg-brand-teal transition-all"
                    >
                      Support Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. VOLUNTEER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="volunteer-section">
        <div className="bg-gradient-to-tr from-brand-teal to-emerald-950 text-white rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase text-brand-mint tracking-wider">BECOME A VOLUNTEER</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Join Us to Clean Beaches &amp; Help Street Animals
              </h2>
              <p className="opacity-90 leading-relaxed text-sm md:text-md">
                We are actively looking for local residents, students, and visitors to join us. You can help by sweeping plastic waste from beaches or feeding street dogs. No special skills or experience are needed—just a kind heart!
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => setTab('forum')}
                  className="bg-white hover:bg-slate-50 text-brand-teal font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:scale-101"
                >
                  Join the Volunteer Hub
                </button>
                <button
                  onClick={() => setShowRsvpForm(!showRsvpForm)}
                  className="bg-brand-mint hover:bg-brand-mint/90 text-slate-900 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:scale-101 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  RSVP for Next Event
                </button>
              </div>

              <AnimatePresence>
                {showRsvpForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-4 overflow-hidden mt-4 text-left"
                  >
                    <h3 className="font-display font-bold text-sm text-white">Event RSVP: Sunday Beach Cleanup</h3>
                    {rsvpSuccess ? (
                      <p className="text-xs text-brand-mint font-semibold flex items-center gap-1.5 bg-black/20 p-3 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-mint" />
                        Thank you! We have sent your cleanup rsvp details directly to your email.
                      </p>
                    ) : (
                      <form onSubmit={handleRsvpSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-900">
                          <input 
                            type="text" 
                            placeholder="Volunteer Full Name" 
                            required
                            value={volunteerName}
                            onChange={e => setVolunteerName(e.target.value)}
                            className="bg-white/90 border-0 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-brand-mint"
                          />
                          <input 
                            type="email" 
                            placeholder="Volunteer Email" 
                            required
                            value={volunteerEmail}
                            onChange={e => setVolunteerEmail(e.target.value)}
                            className="bg-white/90 border-0 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-brand-mint"
                          />
                        </div>

                        <SpamProtection onVerify={setVolunteerCaptcha} className="my-2 border-white/10 bg-slate-900/40 text-white" />

                        <button 
                          type="submit"
                          disabled={rsvpLoading}
                          className="w-full py-2.5 bg-brand-mint hover:bg-brand-mint/95 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          {rsvpLoading ? 'Dispatching RSVP...' : 'Confirm Secure RSVP'}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5" id="volunteer-bento-widget">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4">
                <h4 className="font-display font-semibold text-sm tracking-wider uppercase text-brand-mint">Weekly Cleanup Meetings</h4>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-center gap-2.5 bg-black/15 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-brand-mint" />
                    <span>Every Sunday, 06:00 AM — Puri Lighthouse Beach Cleanup</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-black/15 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-brand-mint" />
                    <span>Every Wednesday, 05:00 PM — Street Animal Feeding &amp; Checkups</span>
                  </div>
                </div>
                <p className="text-[11px] opacity-80 leading-normal">Meet-up point: Swargadwar beach entry.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-left" id="faq-section">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold uppercase text-brand-emerald tracking-widest">COMMON QUESTIONS</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            Common Questions &amp; Answers
          </h2>
        </div>

        <div className="space-y-4" id="faq-accordions">
          {faqItems.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-2xl border overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 dark:text-white text-sm md:text-md hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4.5 h-4.5 text-brand-emerald" />
                  {item.q}
                </span>
                <span className="text-brand-emerald text-lg font-bold">{faqOpen === idx ? '−' : '+'}</span>
              </button>
              
              {faqOpen === idx && (
                <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-500 dark:text-slate-300 leading-relaxed border-t border-gray-100 dark:border-slate-800">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONTACT US SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-left pt-6" id="contact-section">
        <div className="glass-panel rounded-3xl border p-8 shadow-xl relative overflow-hidden bg-white/50 dark:bg-slate-950/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full translate-x-20 -translate-y-20 filter blur-3xl" />
          <div className="space-y-2 mb-6">
            <span className="text-xs font-bold uppercase text-brand-teal tracking-widest">CITIZEN FEEDBACK</span>
            <h2 className="font-display text-2xl font-black text-gray-950 dark:text-white">Contact Our Team</h2>
            <p className="text-xs text-gray-500 dark:text-slate-300">Have a question or suggestion about animal welfare or coastal bins? Get in touch.</p>
          </div>

          {contactSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-md text-gray-950 dark:text-white">Message Dispatched Successfully!</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                Thank you for reaching out. We have sent a copy of this message to our admin team. We typically respond within 24-48 business hours.
              </p>
              <button 
                onClick={() => setContactSuccess(false)}
                className="text-xs font-semibold text-brand-emerald hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-500 text-xs font-semibold">
                  {contactError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. Satyajit Ray"
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-emerald dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Email Address</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="e.g. satyajit@gmail.com"
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-emerald dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Subject</label>
                <input 
                  type="text" 
                  value={contactSubject}
                  onChange={e => setContactSubject(e.target.value)}
                  placeholder="e.g. Suggestion for Beach Trash Bins"
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-emerald dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Message Content</label>
                <textarea 
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="Write your suggestions or inquiries here..."
                  required
                  rows={4}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-emerald dark:text-white resize-none"
                />
              </div>

              <SpamProtection onVerify={setContactCaptcha} className="my-2" />

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full py-3 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {contactLoading ? 'Dispatched message secure...' : 'Send Message Securely'}
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
