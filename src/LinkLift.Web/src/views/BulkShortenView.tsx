import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  RefreshCw, 
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { BulkShortenResultItem } from '../types';

interface BulkShortenViewProps {
  onReloadLinks: () => void;
}

type ImportFormat = 'standard' | 'shortUrlExport' | 'tinyurl' | 'plain';

export const BulkShortenView: React.FC<BulkShortenViewProps> = ({ onReloadLinks }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('standard');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkShortenResultItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets: Record<ImportFormat, string> = {
    standard: `DestinationUrl, CustomSlug, Title\nhttps://github.com/dotnet/aspnetcore, dotnet-repo, Official .NET Repo\nhttps://react.dev, react-docs, React Documentation\nhttps://tailwindcss.com,, Tailwind CSS Official`,
    shortUrlExport: `ShortUrl, Long URL, Title\nhttps://short.internal/dotnet-rocks, https://dotnet.microsoft.com, .NET Homepage\nhttps://short.internal/react-hooks, https://react.dev/reference/react, React Hooks Guide\nhttps://short.internal/promo-launch, https://vitejs.dev, Vite Build Tool`,
    tinyurl: `Alias, Target URL, Created At\ntiny-aspnet, https://asp.net, 2026-01-15\ntiny-vite, https://vitejs.dev, 2026-02-01\ntiny-cloud, https://cloud.google.com, 2026-03-10`,
    plain: `https://github.com/dotnet/runtime\nhttps://developer.mozilla.org/en-US\nhttps://hub.docker.com/_/nginx\nhttps://hub.docker.com/_/redis`
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Auto-detect format from header
        const firstLine = text.split('\n')[0].toLowerCase();
        if (firstLine.includes('shorturl') || firstLine.includes('short_url')) {
          setSelectedFormat('shortUrlExport');
        } else if (firstLine.includes('alias') && (firstLine.includes('target') || firstLine.includes('tinyurl'))) {
          setSelectedFormat('tinyurl');
        } else if (firstLine.includes(',') && (firstLine.includes('http') || firstLine.includes('url') || firstLine.includes('slug'))) {
          setSelectedFormat('standard');
        }
        setInputText(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to parse CSV lines safely
  const parseCSVLine = (text: string): string[] => {
    const p = ['', ''];
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const rawLines = inputText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      // Filter out potential header rows
      const lines = rawLines.filter((line, idx) => {
        if (idx === 0) {
          const lower = line.toLowerCase();
          if (lower.startsWith('destinationurl') || 
              lower.startsWith('url') || 
              lower.startsWith('bitlink') || 
              lower.startsWith('alias') ||
              lower.includes('long url')) {
            return false;
          }
        }
        return true;
      });

      const items = lines.map(line => {
        if (selectedFormat === 'plain') {
          return {
            originalUrl: line.trim(),
            customSlug: null,
            title: null
          };
        }

        const cols = parseCSVLine(line);

        if (selectedFormat === 'shortUrlExport') {
          // Short URL export: ShortUrl/Slug (col 0), Long URL (col 1), Title (col 2)
          let rawUrl = cols[0] || '';
          let slug = rawUrl.replace(/^https?:\/\/[^\/]+\//i, '').replace(/^\/+/, '');
          const destination = cols[1] || '';
          const title = cols[2] || null;

          return {
            originalUrl: destination,
            customSlug: slug || null,
            title: title || null
          };
        }

        if (selectedFormat === 'tinyurl') {
          // TinyURL export: Alias (col 0), Target URL (col 1), Title or Timestamp (col 2)
          let alias = cols[0] || '';
          let slug = alias.replace(/^https?:\/\//i, '').replace(/^tinyurl\.com\//i, '').replace(/^\/+/, '');
          const destination = cols[1] || '';
          const title = cols[2] && !cols[2].match(/^\d{4}-\d{2}-\d{2}/) ? cols[2] : null;

          return {
            originalUrl: destination,
            customSlug: slug || null,
            title: title || null
          };
        }

        // Standard LinkLift CSV: DestinationUrl, CustomSlug, Title
        return {
          originalUrl: cols[0] || '',
          customSlug: cols[1] || null,
          title: cols[2] || null
        };
      }).filter(item => item.originalUrl && item.originalUrl.startsWith('http'));

      if (items.length === 0) {
        alert('No valid destination URLs detected. Please ensure lines start with http:// or https://');
        setLoading(false);
        return;
      }

      const response = await api.bulkShorten({ links: items });
      setResults(response.results);
      onReloadLinks();
    } catch (err: any) {
      alert(`Error during bulk shorten: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadCsv = () => {
    if (results.length === 0) return;
    const headers = ['OriginalUrl', 'ShortUrl', 'Slug', 'Success', 'ErrorMessage'];
    const rows = results.map(r => [
      `"${r.originalUrl.replace(/"/g, '""')}"`,
      r.shortUrl || '',
      r.slug || '',
      r.success,
      `"${r.errorMessage || ''}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linklift-bulk-results-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-[#377495]/10 text-[#377495]">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">High-Throughput Bulk Shortener</h2>
              <p className="text-xs text-slate-500">
                Batch import and migrate URLs from CSV or legacy databases with enterprise rate-limiting protection.
              </p>
            </div>
          </div>

          {/* Hidden File Input & Upload Trigger */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            accept=".csv,.txt"
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition border border-slate-200 shadow-sm self-start sm:self-auto"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#377495]" />
            <span>Upload CSV File</span>
          </button>
        </div>

        {/* Format Preset Selector */}
        <div className="border-t border-slate-100 pt-4 mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Import Format Preset
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'standard', name: 'Standard CSV', desc: 'Destination, Slug, Title' },
              { id: 'shortUrlExport', name: 'Short URL Export', desc: 'Short URL/Slug, Destination' },
              { id: 'tinyurl', name: 'Alias Table', desc: 'Alias, Target URL' },
              { id: 'plain', name: 'Plain URL List', desc: 'One URL per line' },
            ].map(fmt => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => {
                  setSelectedFormat(fmt.id as ImportFormat);
                  setInputText(samplePresets[fmt.id as ImportFormat]);
                }}
                className={`p-2.5 rounded-lg border text-left transition ${
                  selectedFormat === fmt.id
                    ? 'border-[#377495] bg-[#377495]/5 ring-1 ring-[#377495]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-800">{fmt.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{fmt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preset Info Banner */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
          <Info className="h-4 w-4 text-[#377495] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">
              {selectedFormat === 'standard' && 'Standard LinkLift Format: DestinationUrl, CustomSlug, Title'}
              {selectedFormat === 'shortUrlExport' && 'Short URL Export: Automatically extracts original custom slugs and maps target destinations'}
              {selectedFormat === 'tinyurl' && 'Alias Migration: Preserves custom aliases and maps target destinations'}
              {selectedFormat === 'plain' && 'Raw List: Auto-generates high-entropy Base62 slugs for all destinations'}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={() => setInputText(samplePresets[selectedFormat])}
                className="text-[11px] text-[#377495] font-semibold hover:underline"
              >
                Populate with {selectedFormat} sample data
              </button>
              <span className="text-slate-300">|</span>
              <button 
                type="button" 
                onClick={() => setInputText('')}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                Clear input
              </button>
            </div>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="mt-4 space-y-2">
          <textarea
            rows={8}
            placeholder={`Paste CSV content or list of links here...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900 shadow-inner"
          />
        </div>

        {/* Action Button & Status */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {inputText.split('\n').filter(l => l.trim()).length} line(s) ready to process
          </span>

          <button
            onClick={handleProcess}
            disabled={loading || !inputText.trim()}
            className="bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing Bulk Batch...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Execute Bulk Shorten</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Batch Import Summary: {results.filter(r => r.success).length} of {results.length} Succeeded
              </h3>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Export (.csv)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Generated Short URL</th>
                  <th className="py-3 px-4">Resolved Slug</th>
                  <th className="py-3 px-4">Original Target Destination</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      {item.success ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max">
                          <CheckCircle2 className="h-3 w-3" /> Success
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max" title={item.errorMessage || ''}>
                          <AlertCircle className="h-3 w-3" /> Failed: {item.errorMessage}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#377495]">
                      {item.shortUrl || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {item.slug || '—'}
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate text-slate-600 font-mono text-[11px]" title={item.originalUrl}>
                      {item.originalUrl}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.shortUrl && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopy(item.shortUrl!, idx)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded"
                            title="Copy Short URL"
                          >
                            {copiedIndex === idx ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-500 hover:text-slate-800 rounded"
                            title="Open Link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
