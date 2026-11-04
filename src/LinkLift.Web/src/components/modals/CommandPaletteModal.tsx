import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Link2, 
  LayoutDashboard, 
  Layers, 
  Activity, 
  Globe, 
  Key, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCircle2,
  Server,
  Settings,
  X
} from 'lucide-react';
import { ShortLink } from '../../types';
import { NavItemKey } from '../layout/Sidebar';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: ShortLink[];
  onNavigate: (view: NavItemKey) => void;
  onOpenCreateDrawer: () => void;
  onViewAnalytics: (slug: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  links,
  onNavigate,
  onOpenCreateDrawer,
  onViewAnalytics
}) => {
  const [query, setQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPages: { key: NavItemKey; label: string; icon: any; category: string }[] = [
    { key: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, category: 'Pages' },
    { key: 'links', label: 'All Short Links', icon: Link2, category: 'Pages' },
    { key: 'bulk', label: 'Bulk Shortener Wizard', icon: Layers, category: 'Pages' },
    { key: 'live', label: 'Live Telemetry Radar', icon: Activity, category: 'Pages' },
    { key: 'domains', label: 'Custom Domains', icon: Globe, category: 'Pages' },
    { key: 'apikeys', label: 'API Keys & RBAC', icon: Key, category: 'Pages' },
    { key: 'botshield', label: 'Bot Shield & Compliance', icon: ShieldCheck, category: 'Pages' },
    { key: 'servers', label: 'Manage Servers & Fleet', icon: Server, category: 'Pages' },
    { key: 'settings', label: 'Settings & Defaults', icon: Settings, category: 'Pages' },
  ];

  const matchingPages = quickPages.filter(p => 
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchingLinks = links.filter(l => 
    l.slug.toLowerCase().includes(query.toLowerCase()) ||
    l.originalUrl.toLowerCase().includes(query.toLowerCase()) ||
    (l.title && l.title.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5);

  const handleCopy = (e: React.MouseEvent, text: string, slug: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative mx-auto max-w-xl transform rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all overflow-hidden border border-slate-200">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 px-4 py-3.5 flex items-center">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search links... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Action: Create Link */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Quick Actions
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCreateDrawer();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#377495]/10 text-slate-800 hover:text-[#377495] transition group text-left"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-md bg-[#377495] text-white">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold block text-xs">Create New Shortlink</span>
                  <span className="text-[11px] text-slate-400">Generate a new URL with custom slug or dynamic rules</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#377495] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Matching Links */}
          {matchingLinks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Matching Links ({matchingLinks.length})
              </div>
              <div className="space-y-1">
                {matchingLinks.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => {
                      onClose();
                      onViewAnalytics(link.slug);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-blue-50 text-[#377495]">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#377495]">/{link.slug}</span>
                          {link.title && (
                            <span className="text-slate-700 font-medium truncate">
                              • {link.title}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {link.originalUrl}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={(e) => handleCopy(e, link.shortUrl, link.slug)}
                        title="Copy Short URL"
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded border border-transparent hover:border-slate-200 transition"
                      >
                        {copiedSlug === link.slug ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded border border-transparent hover:border-slate-200 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Page Navigation */}
          {matchingPages.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Navigate Pages
              </div>
              <div className="space-y-1">
                {matchingPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.key}
                      onClick={() => {
                        onClose();
                        onNavigate(page.key);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition group text-left"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="h-4 w-4 text-slate-500 group-hover:text-[#377495]" />
                        <span className="font-medium">{page.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-mono">Jump</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>Navigation: <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">↑</kbd> <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">↓</kbd></span>
            <span>Close: <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">Esc</kbd></span>
          </div>
          <span className="font-mono text-[#377495] font-semibold">LinkLift v1.0</span>
        </div>
      </div>
    </div>
  );
};

