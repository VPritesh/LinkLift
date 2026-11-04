import React, { useState, useMemo } from 'react';
import { 
  Link2, 
  Search, 
  Filter, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  ExternalLink, 
  Trash2, 
  BarChart3, 
  Download, 
  Clock, 
  Compass, 
  Plus
} from 'lucide-react';
import { ShortLink, DomainMapping } from '../types';

interface LinksListViewProps {
  links: ShortLink[];
  domains: DomainMapping[];
  onOpenCreateDrawer: () => void;
  onOpenQRCode: (link: ShortLink) => void;
  onViewAnalytics: (slug: string) => void;
  onDeleteLink: (id: number) => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const LinksListView: React.FC<LinksListViewProps> = ({
  links,
  domains,
  onOpenCreateDrawer,
  onOpenQRCode,
  onViewAnalytics,
  onDeleteLink,
  searchQuery,
  onSearchChange
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    links.forEach(l => l.tags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [links]);

  // Filter links
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSlug = link.slug.toLowerCase().includes(q);
        const matchesOriginal = link.originalUrl.toLowerCase().includes(q);
        const matchesTitle = link.title?.toLowerCase().includes(q) ?? false;
        if (!matchesSlug && !matchesOriginal && !matchesTitle) return false;
      }

      // Tag filter
      if (selectedTag && !link.tags?.includes(selectedTag)) {
        return false;
      }

      // Domain filter
      if (selectedDomain) {
        if (selectedDomain === 'apex' && link.domainHostname) return false;
        if (selectedDomain !== 'apex' && link.domainHostname !== selectedDomain) return false;
      }

      return true;
    });
  }, [links, searchQuery, selectedTag, selectedDomain]);

  const handleCopy = (text: string, slug: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Id', 'Slug', 'ShortUrl', 'OriginalUrl', 'Clicks', 'Domain', 'Tags', 'CreatedAt'];
    const rows = filteredLinks.map(l => [
      l.id,
      l.slug,
      l.shortUrl,
      `"${l.originalUrl.replace(/"/g, '""')}"`,
      l.clickCount,
      l.domainHostname || 'Apex',
      `"${l.tags?.join(',') || ''}"`,
      l.createdAtUtc
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linklift-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Control / Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by slug, title, or destination..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#377495] focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#377495]"
          >
            <option value="">All Domains</option>
            <option value="apex">Apex / Default Host</option>
            {domains.map(d => (
              <option key={d.id} value={d.hostname}>{d.hostname}</option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#377495]"
          >
            <option value="">All Tags ({allTags.length})</option>
            {allTags.map(t => (
              <option key={t} value={t}>#{t}</option>
            ))}
          </select>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            disabled={filteredLinks.length === 0}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition border border-slate-200 disabled:opacity-50"
            title="Export to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Create CTA */}
          <button
            onClick={onOpenCreateDrawer}
            className="bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Link</span>
          </button>
        </div>
      </div>

      {/* Links Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLinks.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Link2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <h4 className="text-base font-bold text-slate-700">No Shortlinks Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedTag || selectedDomain 
                ? 'Try adjusting your search query or clear active filters.' 
                : 'Get started by creating your first shortened URL.'}
            </p>
            <button
              onClick={onOpenCreateDrawer}
              className="mt-4 bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition inline-flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create Shortlink</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Short Link & Slug</th>
                  <th className="py-3.5 px-6">Target Destination</th>
                  <th className="py-3.5 px-4 text-center">Protocol</th>
                  <th className="py-3.5 px-4 text-center">Clicks</th>
                  <th className="py-3.5 px-4 text-center">Routing</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLinks.map((link) => {
                  const isExpired = link.expiresAtUtc && new Date(link.expiresAtUtc) <= new Date();

                  return (
                    <tr key={link.id} className="hover:bg-slate-50/70 transition group">
                      {/* Shortlink Column */}
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center space-x-2">
                          <span 
                            onClick={() => onViewAnalytics(link.slug)}
                            className="font-bold text-sm text-[#377495] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            /{link.slug}
                          </span>
                          {isExpired && (
                            <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> Expired
                            </span>
                          )}
                        </div>

                        {link.title && (
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">{link.title}</p>
                        )}

                        <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                          {link.domainHostname && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono border border-purple-200">
                              {link.domainHostname}
                            </span>
                          )}
                          {link.tags?.map(t => (
                            <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Destination Column */}
                      <td className="py-4 px-6 align-top max-w-xs">
                        <p className="text-slate-600 truncate text-xs" title={link.originalUrl}>
                          {link.originalUrl}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Created {new Date(link.createdAtUtc).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Protocol */}
                      <td className="py-4 px-4 text-center align-top">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono font-bold">
                          HTTP {link.redirectType}
                        </span>
                      </td>

                      {/* Clicks */}
                      <td className="py-4 px-4 text-center align-top">
                        <span className="text-sm font-black text-slate-900 block">{link.clickCount}</span>
                        <span className="text-[10px] text-slate-400">visits</span>
                      </td>

                      {/* Rules */}
                      <td className="py-4 px-4 text-center align-top">
                        {link.rules && link.rules.length > 0 ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1 rounded-full font-semibold">
                            <Compass className="h-3 w-3" />
                            <span>{link.rules.length} rule{link.rules.length > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right align-top">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Copy URL */}
                          <button
                            onClick={() => handleCopy(link.shortUrl, link.slug)}
                            title="Copy Short URL"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            {copiedSlug === link.slug ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>

                          {/* QR Code */}
                          <button
                            onClick={() => onOpenQRCode(link)}
                            title="Generate QR Code"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          {/* Analytics Drill-down */}
                          <button
                            onClick={() => onViewAnalytics(link.slug)}
                            title="View Detailed Analytics"
                            className="p-1.5 text-slate-500 hover:text-[#377495] hover:bg-slate-100 rounded-lg transition"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>

                          {/* Test Redirection */}
                          <a
                            href={link.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Test Redirection Link"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          {/* Delete Link */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete shortlink '/${link.slug}'?`)) {
                                onDeleteLink(link.id);
                              }
                            }}
                            title="Delete Shortlink"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

