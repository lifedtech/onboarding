import React, { useState, useEffect } from 'react';
import { 
  Send, Copy, CheckCircle2, Search, MessageSquare, Mail, 
  Camera, Trash2, User, Phone, Clock, PhoneCall, Link2, Eye, X, ExternalLink, ChevronDown, Check
} from 'lucide-react';
import { sopAssets } from '../../data/sopAssets';

export default function CommunicationAssets({ initialTab = 'all' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Custom edited copies state
  const [editedCopies, setEditedCopies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifed-comm-copies') || '{}'); } catch { return {}; }
  });

  // Sent Messages Tracker state
  const [sentLog, setSentLog] = useState(() => {
    try { 
      const saved = localStorage.getItem('lifed-sent-communication-log');
      if (saved) return JSON.parse(saved);
      // Sample initial entries if empty
      return [
        {
          id: 'LOG-101',
          clientName: 'Ananya Sharma',
          contact: '+91 98765 43210',
          channel: 'WhatsApp',
          templateId: 'SA-WA1',
          templateName: 'WhatsApp: Client Program Invite',
          sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          status: 'Replied',
          messageContent: "Hi Ananya Sharma\n\nBased on what you were looking for, I thought this program on Lifed would be a great fit for you: Kerala Recovery Retreat.\n\nIt's a curated session hosted by Ananya focusing on deep recovery & functional movement.\n\nYou can check out the full itinerary and reserve your spot here: https://lifed.wellbeing/kerala-retreat\n\nLet me know if you have any questions or need help booking!",
          notes: 'Interested in Saturday breathwork session.'
        },
        {
          id: 'LOG-102',
          clientName: 'Rahul Verma',
          contact: 'rahul.v@gmail.com',
          channel: 'Email',
          templateId: 'SA-EM1',
          templateName: 'Email: Program Brochure',
          sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          status: 'Converted',
          messageContent: "Subject: Curated Wellbeing Experience: Kerala Recovery Retreat\n\nHi Rahul Verma,\n\nWe are delighted to share details on an upcoming signature experience: Kerala Recovery Retreat, hosted by renowned practitioner Ananya on Lifed.\n\nProgram Highlights:\n• Guided Breathwork & Sound Bath\n• Small group setting with personalized attention\n\nDetails & Schedule:\n📅 Date: Saturday, Aug 16\n🕒 Time: 09:00 AM - 12:00 PM\n📍 Location: Kochi Wellbeing Centre",
          notes: 'Booked Kerala Recovery Retreat.'
        }
      ];
    } catch { return []; }
  });

  // Modal State for Tracking Sent Message
  const [trackingModalAsset, setTrackingModalAsset] = useState(null);
  const [modalClientName, setModalClientName] = useState('');
  const [modalContact, setModalContact] = useState('');
  const [modalStatus, setModalStatus] = useState('Sent');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [modalNotes, setModalNotes] = useState('');

  // Auto-fill placeholders state
  const [modalPlaceholders, setModalPlaceholders] = useState([]);
  const [modalVars, setModalVars] = useState({});
  const [modalCopied, setModalCopied] = useState(false);

  // View Log Detail State
  const [viewingLogDetail, setViewingLogDetail] = useState(null);
  const [detailCopied, setDetailCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('lifed-sent-communication-log', JSON.stringify(sentLog));
  }, [sentLog]);

  const handleCopyChange = (id, newCopy) => {
    setEditedCopies(prev => {
      const next = { ...prev, [id]: newCopy };
      localStorage.setItem('lifed-comm-copies', JSON.stringify(next));
      return next;
    });
  };

  const handleCopy = (asset) => {
    const textToCopy = editedCopies[asset.id] ?? asset.copy;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenTrackModal = (asset) => {
    setTrackingModalAsset(asset);
    setModalClientName('');
    setModalContact('');
    setModalStatus('Sent');
    setStatusDropdownOpen(false);
    setModalNotes('');
    setModalCopied(false);

    const templateText = editedCopies[asset.id] ?? asset.copy;
    const matches = Array.from(templateText.matchAll(/\[([^\]]+)\]/g)).map(m => m[1]);
    const uniqueMatches = Array.from(new Set(matches));
    setModalPlaceholders(uniqueMatches);

    const initVars = {};
    uniqueMatches.forEach(p => {
      initVars[p] = '';
    });
    setModalVars(initVars);
  };

  const handleVarChange = (placeholder, val) => {
    setModalVars(prev => ({ ...prev, [placeholder]: val }));
  };

  const getCompiledMessage = () => {
    if (!trackingModalAsset) return '';
    let text = editedCopies[trackingModalAsset.id] ?? trackingModalAsset.copy;
    modalPlaceholders.forEach(p => {
      const pLower = p.toLowerCase();
      let val = modalVars[p] || '';
      if (!val && (pLower.includes('first name') || pLower.includes('client name') || pLower === 'name')) {
        val = modalClientName;
      }
      if (val) {
        text = text.replaceAll(`[${p}]`, val);
      }
    });
    return text;
  };

  const handleCopyFinished = () => {
    const finalMsg = getCompiledMessage();
    navigator.clipboard.writeText(finalMsg);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const finalMsg = getCompiledMessage();
    const cleanPhone = modalContact.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(finalMsg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(finalMsg)}`;
    window.open(url, '_blank');
  };

  const handleSaveSentLog = (e) => {
    e.preventDefault();
    if (!trackingModalAsset || !modalClientName.trim()) return;

    const finalCompiledMsg = getCompiledMessage();

    const newLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      clientName: modalClientName.trim(),
      contact: modalContact.trim() || 'N/A',
      channel: trackingModalAsset.channel || 'Direct',
      templateId: trackingModalAsset.id,
      templateName: trackingModalAsset.name,
      sentAt: new Date().toISOString(),
      status: modalStatus,
      notes: modalNotes.trim() || `Sent: "${finalCompiledMsg.slice(0, 60)}..."`
    };

    setSentLog(prev => [newLogEntry, ...prev]);
    setTrackingModalAsset(null);
    setActiveTab('tracker');
  };

  const handleDeleteLog = (logId) => {
    setSentLog(prev => prev.filter(item => item.id !== logId));
  };

  const handleUpdateLogStatus = (logId, newStatus) => {
    setSentLog(prev => prev.map(item => item.id === logId ? { ...item, status: newStatus } : item));
  };

  const [selectedStage, setSelectedStage] = useState('ALL');

  const sopStages = [
    { key: 'REACH', num: 0, name: 'Reach', when: 'BEFORE DAY 0', sub: 'They have not heard of Lifed', prefix: 'R' },
    { key: 'APPLY', num: 1, name: 'Apply', when: 'DAY 0', sub: 'Register, about ten minutes', prefix: 'A' },
    { key: 'VALIDATE', num: 2, name: 'Validate', when: 'WITHIN A DAY', sub: 'Verified, dashboard opens', prefix: 'V' },
    { key: 'CO-CREATE', num: 3, name: 'Co-create', when: 'DAYS 2 TO 5', sub: 'Build the program together', prefix: 'C' },
    { key: 'CURATE', num: 4, name: 'Curate', when: 'DAYS 5 TO 6', sub: 'Validated to the standard', prefix: 'K' },
    { key: 'GO LIVE', num: 5, name: 'Go live', when: 'ABOUT A WEEK', sub: 'Bookable, and announced', prefix: 'L' },
    { key: 'GROW', num: 6, name: 'Grow', when: 'ONGOING', sub: 'Bookings, payouts, next program', prefix: 'G' },
  ];

  const getNormalizedPlaceholderInfo = (ph) => {
    const phLower = ph.toLowerCase();
    
    if (phLower.includes('specific true detail') || phLower.includes('true detail')) {
      return {
        label: 'Specific Work Detail',
        hint: 'e.g. morning posture sessions at Kochi'
      };
    }
    if (phLower.includes('video link')) {
      return {
        label: 'Video Link',
        hint: 'e.g. https://lifed.wellbeing/watch'
      };
    }
    if (phLower.includes('first name') || phLower.includes('client name') || phLower === 'name') {
      return {
        label: 'Client Name',
        hint: 'e.g. Priya Nair'
      };
    }
    if (phLower.includes('you') || phLower === 'your name') {
      return {
        label: 'Your Name / Sender',
        hint: 'e.g. Alex'
      };
    }
    if (phLower.includes('link') || phLower.includes('url')) {
      return {
        label: 'Link / URL',
        hint: 'e.g. https://lifed.wellbeing/retreat'
      };
    }
    if (phLower.includes('date') || phLower.includes('time')) {
      return {
        label: 'Date & Time',
        hint: 'e.g. Saturday, Aug 16 at 10 AM'
      };
    }
    if (phLower.includes('venue') || phLower.includes('place') || phLower.includes('location')) {
      return {
        label: 'Venue / Location',
        hint: 'e.g. Wellbeing Centre, Kochi'
      };
    }
    if (phLower.includes('program') || phLower.includes('retreat') || phLower.includes('session')) {
      return {
        label: 'Program Name',
        hint: 'e.g. Kerala Recovery Retreat'
      };
    }
    
    if (ph.length > 25) {
      const parts = ph.split(':');
      const cleanLabel = parts[0].trim();
      return {
        label: cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1),
        hint: `Enter ${cleanLabel.toLowerCase()}...`
      };
    }

    return {
      label: ph.charAt(0).toUpperCase() + ph.slice(1),
      hint: `Enter ${ph.toLowerCase()}...`
    };
  };

  const socialAssetsList = sopAssets;

  const filteredAssets = socialAssetsList.filter(asset => {
    let matchesTab = false;
    if (activeTab === 'all') {
      matchesTab = true;
    } else if (activeTab === 'WhatsApp') {
      matchesTab = asset.channel.toLowerCase().includes('whatsapp');
    } else if (activeTab === 'Email') {
      matchesTab = asset.channel.toLowerCase().includes('email');
    } else if (activeTab === 'Instagram') {
      matchesTab = asset.channel.toLowerCase().includes('instagram') || asset.id.startsWith('SA-IG') || asset.id === 'R6';
    } else if (activeTab === 'CallScripts') {
      matchesTab = asset.channel.toLowerCase().includes('call') || asset.channel === 'CallScripts' || asset.id.startsWith('CS-');
    } else if (activeTab === 'MediaAssets') {
      matchesTab = asset.channel.toLowerCase().includes('media') || asset.channel === 'MediaAssets' || asset.id.startsWith('MA-');
    } else {
      matchesTab = asset.channel === activeTab;
    }

    let matchesStage = true;
    if (selectedStage !== 'ALL') {
      const targetStage = sopStages.find(s => s.key === selectedStage);
      if (targetStage) {
        matchesStage = asset.id.startsWith(targetStage.prefix);
      }
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      asset.name.toLowerCase().includes(searchLower) ||
      (asset.purpose && asset.purpose.toLowerCase().includes(searchLower)) ||
      (asset.copy && asset.copy.toLowerCase().includes(searchLower)) ||
      asset.id.toLowerCase().includes(searchLower);

    return matchesTab && matchesStage && matchesSearch;
  });

  const filteredSentLog = sentLog.filter(log => {
    const searchLower = searchQuery.toLowerCase().trim();
    return !searchLower ||
      log.clientName.toLowerCase().includes(searchLower) ||
      log.contact.toLowerCase().includes(searchLower) ||
      log.templateName.toLowerCase().includes(searchLower) ||
      log.status.toLowerCase().includes(searchLower);
  });

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'WhatsApp':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800"><MessageSquare className="w-3 h-3" /> WhatsApp</span>;
      case 'Email':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-sky-100 text-sky-800"><Mail className="w-3 h-3" /> Email</span>;
      case 'Instagram':
      case 'Instagram DM':
      case 'Instagram Post':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-pink-100 text-pink-800"><Camera className="w-3 h-3" /> Instagram</span>;
      case 'CallScripts':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-amber-100 text-amber-800"><PhoneCall className="w-3 h-3" /> Call Script</span>;
      case 'MediaAssets':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-purple-100 text-purple-800"><Link2 className="w-3 h-3" /> Media & Link</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-slate-100 text-slate-700">{channel}</span>;
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-50/50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-20">
        
        {/* Top Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-brand-teal mb-2">
              <span className="w-6 h-0.5 bg-brand-teal"></span>
              {activeTab === 'tracker' ? 'SENT MESSAGES TRACKER' : 'COMMUNICATION & TRACKING SECTION'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              {activeTab === 'tracker' ? 'Sent Client Messages Log' : 'Communication & Media Assets'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'tracker' 
                ? 'Track and view all messages sent to clients across WhatsApp, Email, and Instagram.' 
                : 'WhatsApp, Email, Instagram copy, call talking points, and media links.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Sent Logs</span>
              <span className="text-lg font-extrabold text-brand-teal">{sentLog.length}</span>
            </div>
          </div>
        </div>

        {/* Controls Bar: Tabs & Search */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center ${activeTab === 'tracker' ? 'justify-end' : 'justify-between'} gap-4 mb-8`}>
          {/* Category Tabs (Hidden on Sent Tracker view) */}
          {activeTab !== 'tracker' && (
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Assets ({socialAssetsList.length})
              </button>
              <button
                onClick={() => setActiveTab('WhatsApp')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'WhatsApp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('Email')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'Email' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                onClick={() => setActiveTab('Instagram')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'Instagram' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Instagram
              </button>
              <button
                onClick={() => setActiveTab('CallScripts')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'CallScripts' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Scripts
              </button>
              <button
                onClick={() => setActiveTab('MediaAssets')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'MediaAssets' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" /> Media & Links
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'tracker' ? "Search client or status..." : "Search templates..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
            />
          </div>
        </div>

        {/* OPERATIONAL SOP STAGES STEPPER & STAGE FILTER BAR */}
        {activeTab !== 'tracker' && (
          <div className="mb-8 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            
            {/* Interactive Stepper Nodes (pt-3 gives headroom for ring-4 focus halo) */}
            <div className="relative max-w-5xl mx-auto mb-8 pt-3">
              {/* Perfectly Centered Connecting Line (30px = 12px pt-3 + 18px node center) */}
              <div className="absolute left-8 right-8 top-[30px] h-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>

              <div className="flex items-start justify-between relative z-10 overflow-visible pb-2 gap-2">
                {sopStages.map((st) => {
                  const isSelected = selectedStage === st.key;
                  return (
                    <div 
                      key={st.key} 
                      className="flex flex-col items-center cursor-pointer group min-w-[100px] flex-1 text-center"
                      onClick={() => setSelectedStage(isSelected ? 'ALL' : st.key)}
                    >
                      {/* Node Circle */}
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                        isSelected 
                          ? 'bg-brand-teal text-white border-brand-teal ring-4 ring-brand-teal/20 scale-110 shadow-md' 
                          : 'bg-white text-slate-500 border-slate-300 group-hover:border-brand-teal group-hover:text-brand-teal'
                      }`}>
                        {st.num}
                      </div>
                      
                      {/* Text Stack */}
                      <div className="mt-3 space-y-0.5">
                        <h4 className={`text-xs font-bold transition-colors ${isSelected ? 'text-brand-teal font-extrabold' : 'text-slate-800 group-hover:text-brand-teal'}`}>
                          {st.name}
                        </h4>
                        <span className={`block text-[9px] font-extrabold tracking-wider uppercase ${isSelected ? 'text-brand-teal font-extrabold' : 'text-slate-400'}`}>
                          {st.when}
                        </span>
                        <p className="hidden md:block text-[11px] text-slate-400 font-medium max-w-[120px] mx-auto leading-snug pt-1">
                          {st.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Filter Buttons Strip */}
            <div className="pt-5 border-t border-slate-100 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setSelectedStage('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                  selectedStage === 'ALL' 
                    ? 'bg-brand-teal text-white shadow-sm ring-2 ring-brand-teal/20' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                ALL
              </button>

                {sopStages.map(st => {
                  const isSelected = selectedStage === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setSelectedStage(st.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider whitespace-nowrap ${
                        isSelected 
                          ? 'bg-brand-teal text-white shadow-sm ring-2 ring-brand-teal/20' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.name}
                    </button>
                  );
                })}
              </div>

          </div>
        )}

        {/* Content Section */}
        {activeTab !== 'tracker' ? (
          /* TEMPLATES GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssets.map((asset) => {
              const currentCopy = editedCopies[asset.id] ?? asset.copy;
              const isCopied = copiedId === asset.id;

              return (
                <div key={asset.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded text-[11px] font-extrabold">
                            {asset.id}
                          </span>
                          {getChannelBadge(asset.channel)}
                        </div>
                        <h3 className="text-base font-bold text-slate-800 leading-snug">
                          {asset.name}
                        </h3>
                      </div>
                    </div>

                    {/* Purpose / Trigger */}
                    {asset.purpose && (
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                        <strong className="text-slate-700 font-semibold">Purpose:</strong> {asset.purpose}
                      </p>
                    )}

                    {/* Editable Message Box */}
                    <div className="relative mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                        <span>Template Copy</span>
                        {editedCopies[asset.id] && editedCopies[asset.id] !== asset.copy && (
                          <button 
                            onClick={() => handleCopyChange(asset.id, asset.copy)} 
                            className="text-rose-500 hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <textarea
                        value={currentCopy}
                        onChange={(e) => handleCopyChange(asset.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 whitespace-pre-wrap font-medium outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal resize-y min-h-[140px]"
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenTrackModal(asset)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send & Track Log
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredAssets.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No templates found</h4>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or switching categories.</p>
              </div>
            )}
          </div>
        ) : (
          /* SENT MESSAGES TRACKER LOG TABLE */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 bg-slate-800 text-white flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-extrabold">Client Communication Sent History</h3>
                <p className="text-xs text-slate-300">Track all messages sent to clients across WhatsApp, Email, and Instagram.</p>
              </div>
              <span className="text-xs text-teal-400 font-bold bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600">
                {filteredSentLog.length} Logged Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-200">
                    <th className="py-3.5 px-4">Client Name & Contact</th>
                    <th className="py-3.5 px-4">Channel</th>
                    <th className="py-3.5 px-4">Template Sent</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSentLog.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{log.clientName}</div>
                        <div className="text-[11px] text-slate-400">{log.contact}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getChannelBadge(log.channel)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{log.templateName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.templateId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={log.status}
                          onChange={(e) => handleUpdateLogStatus(log.id, e.target.value)}
                          className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-700 outline-none cursor-pointer focus:border-brand-teal"
                        >
                          <option value="Sent">Sent</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Replied">Replied</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setViewingLogDetail(log);
                              setDetailCopied(false);
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-teal hover:bg-teal-50 rounded-lg transition-colors"
                            title="View Sent Message Log Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Log Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSentLog.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No sent message logs found. Click "Send & Track Log" on any asset card to log client outreach.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* DYNAMIC AUTO-FILL SEND & TRACK MODAL */}
      {trackingModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setTrackingModalAsset(null)}>
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-slate-800 text-white px-6 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-teal-400">Auto-fill & Log Outreach</span>
                <h3 className="text-base font-bold leading-tight">{trackingModalAsset.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                {getChannelBadge(trackingModalAsset.channel)}
                <button 
                  onClick={() => setTrackingModalAsset(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSentLog} className="p-5 overflow-y-auto space-y-3.5">
              
              {/* Primary Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Nair"
                      value={modalClientName}
                      onChange={e => setModalClientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Phone / Contact
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={modalContact}
                      onChange={e => setModalContact(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic detected placeholder inputs */}
              {modalPlaceholders.length > 0 && (
                <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
                    <Send className="w-3 h-3" /> Fill Message Variables
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {modalPlaceholders.map((ph) => {
                      const phLower = ph.toLowerCase();
                      if (phLower.includes('first name') || phLower.includes('client name') || phLower === 'name') {
                        return null; // Auto-bound to modalClientName
                      }
                      const info = getNormalizedPlaceholderInfo(ph);
                      return (
                        <div key={ph}>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 truncate" title={ph}>
                            {info.label} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={info.hint}
                            value={modalVars[ph] || ''}
                            onChange={e => handleVarChange(ph, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Real-time Finished Message Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Finished Message Preview
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Auto-Filled Ready to Send
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[110px] overflow-y-auto border border-slate-800 shadow-inner">
                  {getCompiledMessage()}
                </div>
              </div>

              {/* Custom Status Dropdown & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Outreach Status
                  </label>
                  
                  {/* Custom Styled Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 flex items-center justify-between transition-all outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                  >
                    <div className="flex items-center gap-2">
                      {modalStatus === 'Sent' && <span className="flex items-center gap-1.5 text-slate-700"><Send className="w-3.5 h-3.5" /> Sent</span>}
                      {modalStatus === 'Delivered' && <span className="flex items-center gap-1.5 text-sky-600"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>}
                      {modalStatus === 'Replied' && <span className="flex items-center gap-1.5 text-brand-teal"><MessageSquare className="w-3.5 h-3.5" /> Replied</span>}
                      {modalStatus === 'Converted' && <span className="flex items-center gap-1.5 text-emerald-600"><ExternalLink className="w-3.5 h-3.5" /> Converted</span>}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180 text-brand-teal' : ''}`} />
                  </button>

                  {/* Custom Styled Dropdown Popover Menu (Opens Upward to prevent scrollbar) */}
                  {statusDropdownOpen && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { id: 'Sent', label: 'Sent', icon: Send, color: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700' },
                        { id: 'Delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40' },
                        { id: 'Replied', label: 'Replied', icon: MessageSquare, color: 'text-brand-teal hover:bg-teal-50 dark:hover:bg-teal-950/40' },
                        { id: 'Converted', label: 'Converted', icon: ExternalLink, color: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' }
                      ].map(item => {
                        const Icon = item.icon;
                        const isSelected = modalStatus === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setModalStatus(item.id);
                              setStatusDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${item.color} ${
                              isSelected ? 'bg-slate-100 dark:bg-slate-700/80 font-extrabold' : ''
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              {item.label}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-teal" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Optional Notes / Context
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sent via WhatsApp for Saturday retreat"
                    value={modalNotes}
                    onChange={e => setModalNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {(() => {
                const isFormComplete = Boolean(modalClientName && modalClientName.trim() && modalPlaceholders.every(ph => {
                  const phLower = ph.toLowerCase();
                  if (phLower.includes('first name') || phLower.includes('client name') || phLower === 'name') {
                    return true;
                  }
                  return Boolean(modalVars[ph] && modalVars[ph].trim());
                }));

                return (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!isFormComplete}
                        onClick={handleCopyFinished}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          !isFormComplete
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                            : modalCopied 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'
                        }`}
                      >
                        {modalCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {modalCopied ? 'Copied Finished Message!' : 'Copy Finished Message'}
                      </button>

                      {!isFormComplete && (
                        <span className="text-[10px] font-semibold text-amber-600">
                          Fill placeholders to activate copy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!isFormComplete}
                        onClick={handleSendWhatsApp}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                          !isFormComplete
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Send on WhatsApp
                      </button>

                      <button
                        type="submit"
                        disabled={!isFormComplete}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                          !isFormComplete
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-brand-teal hover:bg-brand-teal/90 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save to Sent Log
                      </button>
                    </div>
                  </div>
                );
              })()}

            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL CLIENT COMMUNICATION HISTORY TIMELINE MODAL */}
      {viewingLogDetail && (() => {
        const clientLogs = sentLog.filter(item => 
          item.clientName.toLowerCase().trim() === viewingLogDetail.clientName.toLowerCase().trim() ||
          (item.contact && item.contact !== 'N/A' && item.contact === viewingLogDetail.contact)
        ).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingLogDetail(null)}>
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="bg-slate-800 text-white p-5 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-teal-400 mb-0.5">
                    <User className="w-3.5 h-3.5" /> Client Communication History Log
                  </div>
                  <h3 className="text-lg font-bold">{viewingLogDetail.clientName}</h3>
                  <div className="text-xs text-slate-300 font-medium">
                    Contact: <span className="font-bold text-white">{viewingLogDetail.contact}</span> · <span className="text-teal-400 font-bold">{clientLogs.length} Messages Logged</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setViewingLogDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Timeline List of Sent Messages */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span>Message History Timeline ({clientLogs.length})</span>
                  <span>Newest First</span>
                </div>

                <div className="space-y-6">
                  {clientLogs.map((logItem, idx) => {
                    const isCopied = copiedId === logItem.id;
                    return (
                      <div key={logItem.id} className="relative pl-6 border-l-2 border-slate-200 space-y-3">
                        
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-teal flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div>
                        </div>

                        {/* Log Item Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {getChannelBadge(logItem.channel)}
                            <span className="text-xs font-bold text-slate-800">{logItem.templateName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({logItem.templateId})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {new Date(logItem.sentAt).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-brand-teal border border-teal-200">
                              {logItem.status}
                            </span>
                          </div>
                        </div>

                        {/* Sent Message Content Box */}
                        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto border border-slate-800 shadow-inner">
                          {logItem.messageContent || `Sent template ${logItem.templateName} (${logItem.templateId})`}
                        </div>

                        {/* Notes if present */}
                        {logItem.notes && (
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium">
                            <strong className="text-slate-800 font-semibold">Notes:</strong> {logItem.notes}
                          </div>
                        )}

                        {/* Item Footer Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const textToCopy = logItem.messageContent || logItem.templateName;
                              navigator.clipboard.writeText(textToCopy);
                              setCopiedId(logItem.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isCopied 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {isCopied ? 'Copied Message!' : 'Copy Sent Text'}
                          </button>

                          {logItem.contact && logItem.contact !== 'N/A' && logItem.contact.match(/[0-9]{8,}/) && (
                            <button
                              type="button"
                              onClick={() => {
                                const cleanPhone = logItem.contact.replace(/[^0-9]/g, '');
                                const msg = logItem.messageContent || '';
                                window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}

                  {clientLogs.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No sent message history logged for this client yet.
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {clientLogs.length} historical message entries for {viewingLogDetail.clientName}
                </span>
                <button
                  type="button"
                  onClick={() => setViewingLogDetail(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Close History
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
