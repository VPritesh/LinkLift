import React, { useState, useMemo } from 'react';
import { Tag, Link2, MousePointerClick, ChevronRight, Search } from 'lucide-react';
import { ShortLink } from '../types';

interface TagsViewProps {
  links: ShortLink[];
  onSelectTag: (tag: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({ links, onSelectTag }) => {
  const [search, setSearch] = useState('');

  // Group links by tag
  const tagStats = useMemo(() => {
    const map = new Map<string, { count: number; clicks: number; links: ShortLink[] }>();

    links.forEach(link => {
      link.tags?.forEach(tag => {
        const existing = map.get(tag) || { count: 0, clicks: 0, links: [] };
        existing.count += 1;
        existing.clicks += link.clickCount;
        existing.links.push(link);
        map.set(tag, existing);
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [links]);

  const filtered = tagStats.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <Tag className="h-5 w-5 text-[#377495]" />
            <span>Campaigns & Tags Directory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Organize links by marketing initiatives, internal teams, clients, and promotional campaigns.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#377495]"
          />
        </div>
      </div>

      {/* Tags Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
          <Tag className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No Tags Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            When creating or editing shortlinks, add comma-separated tags to automatically organize them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(tag => (
            <div
              key={tag.name}
              onClick={() => onSelectTag(tag.name)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#377495]/40 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-[#377495] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5 group-hover:bg-[#377495] group-hover:text-white transition">
                    <Tag className="h-3.5 w-3.5" />
                    <span>#{tag.name}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#377495] transition-transform group-hover:translate-x-1" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Shortlinks</span>
                    <span className="text-base font-extrabold text-slate-900">{tag.count}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Aggregated Clicks</span>
                    <span className="text-base font-extrabold text-emerald-600">{tag.clicks}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#377495] font-semibold flex items-center justify-between">
                <span>View Filtered Links</span>
                <span className="font-mono text-slate-400">/{tag.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

