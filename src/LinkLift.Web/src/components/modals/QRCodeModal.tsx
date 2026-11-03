import React, { useState } from 'react';
import { X, QrCode, Copy, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { ShortLink } from '../../types';

interface QRCodeModalProps {
  link: ShortLink | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ link, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!link) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link.shortUrl)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-sm p-6 text-center border border-slate-200">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="p-2 rounded-lg bg-[#035392]/10 text-[#035392]">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">QR Code</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6 truncate font-mono">/{link.slug}</p>

          {/* QR Code Container */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner mb-6">
            <img 
              src={qrImageUrl} 
              alt={`QR Code for ${link.shortUrl}`}
              className="w-48 h-48 mx-auto rounded-lg shadow-sm"
            />
          </div>

          {/* URL Pill */}
          <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 mb-4">
            <span className="truncate mr-2 font-semibold text-[#035392]">{link.shortUrl}</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-sans font-medium text-xs rounded border border-slate-200 shadow-sm flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={qrImageUrl}
              download={`linklift-qr-${link.slug}.png`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 bg-[#035392] hover:bg-[#024275] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 shadow"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </a>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center"
              title="Test Redirection"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

