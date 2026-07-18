/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Mail, Phone, MapPin, ShieldCheck, Globe } from 'lucide-react';

interface FooterProps {
  setTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setTab }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900" id="global-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4" id="footer-brand-col">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setTab('home')}>
              <div className="w-9 h-9 rounded-lg bg-brand-emerald flex items-center justify-center text-white">
                <Heart className="w-4.5 h-4.5 fill-white/10" />
              </div>
              <h2 className="font-display font-bold text-white text-md">
                Puri Animal &amp; Nature Support
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              An independent community-driven initiative started by a local resident to help protect stray dogs, temple cows, and clean our beautiful beaches in Puri, Odisha.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              Community Initiative
            </div>
          </div>

          {/* Quick Links */}
          <div id="footer-links-col">
            <h3 className="font-display font-semibold text-white text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'home', label: 'Home Page' },
                { id: 'reports', label: 'Report an Injured Animal' },
                { id: 'campaigns', label: 'Support Campaigns' },
                { id: 'forum', label: 'Community Forum' }
              ].map(link => (
                <li key={link.id}>
                  <button 
                    onClick={() => setTab(link.id)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3 text-sm" id="footer-contact-col">
            <h3 className="font-display font-semibold text-white text-sm tracking-wider uppercase mb-4">Contact Us</h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-brand-emerald mt-0.5" />
              <span>Swargadwar Beach Road, Puri, Odisha, 752001, India</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-brand-emerald" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-brand-emerald" />
              <span>puri.animal.friend@gmail.com</span>
            </div>
          </div>

          {/* Community Support */}
          <div className="space-y-4" id="footer-trust-col">
            <h3 className="font-display font-semibold text-white text-sm tracking-wider uppercase">Community Support</h3>
            <p className="text-xs leading-relaxed">
              This platform is an independent community initiative. All contributions directly support approved local welfare activities like dog feeding, cow fodder, and beach trash bins.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-brand-amber">Puri Environment &amp; Stray Care</p>
              <p className="mt-1 opacity-80 text-[11px]">Started as an individual effort, now building a trusted community of local volunteers and nature supporters.</p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4" id="footer-copyright">
          <p>© {new Date().getFullYear()} Puri Animal &amp; Nature Support. Built with the support of local volunteers.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Community Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
