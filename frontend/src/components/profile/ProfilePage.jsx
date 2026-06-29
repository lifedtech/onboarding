import { useState, useEffect, useRef } from 'react';
import { Camera, Check, ChevronLeft } from 'lucide-react';
import api from '../../lib/axios';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

// ─── Status config (Discord-style) ───────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    key: 'online',
    label: 'Online',
    desc: 'Active and available',
    color: '#22c55e',
    ring: 'rgba(34,197,94,0.35)',
  },
  {
    key: 'busy',
    label: 'Busy',
    desc: 'In a meeting or focused',
    color: '#f59e0b',
    ring: 'rgba(245,158,11,0.35)',
  },
  {
    key: 'dnd',
    label: 'Do Not Disturb',
    desc: 'Silence all notifications',
    color: '#ef4444',
    ring: 'rgba(239,68,68,0.35)',
  },
  {
    key: 'offline',
    label: 'Appear Offline',
    desc: 'Hide your active status',
    color: '#64748b',
    ring: 'rgba(100,116,139,0.25)',
  },
];

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const AVATAR_COLORS = [
  ['#7c3aed', '#6d28d9'],
  ['#0891b2', '#0e7490'],
  ['#059669', '#047857'],
  ['#d97706', '#b45309'],
  ['#db2777', '#be185d'],
  ['#2563eb', '#1d4ed8'],
];

const getAvatarGradient = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const UPLOADS_BASE = API_BASE.replace('/api', '');

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage({ onClose }) {
  const storeUser = useOpsStore((s) => s.user);
  const setUser   = (u) => useOpsStore.setState({ user: u });

  const [profile, setProfile]     = useState(null);
  const [status, setStatus]       = useState('online');
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch full profile on mount
  useEffect(() => {
    api.get('/users/me').then(({ data }) => {
      setProfile(data);
      setStatus(data.statusMode || 'online');
      if (data.avatar) setAvatarPreview(UPLOADS_BASE + data.avatar);
    }).catch(() => {
      setProfile(storeUser);
      setStatus(storeUser?.statusMode || 'online');
    });
  }, []);

  // ESC to go back
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Save status only
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', { statusMode: status });
      setProfile(data);
      setUser({ ...storeUser, statusMode: data.statusMode });
      toast.success('Status updated!');
    } catch (err) {
      console.error('[Profile] save failed:', err);
      toast.error('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview instantly
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const { data } = await api.post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(data);
      setAvatarPreview(UPLOADS_BASE + data.avatar);
      setUser({ ...storeUser, avatar: data.avatar });
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload picture.');
    } finally {
      setUploading(false);
    }
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.key === status) || STATUS_OPTIONS[0];
  const [c1, c2] = getAvatarGradient(profile?.name);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 text-text-main font-sans min-h-full">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-border-leaf sticky top-0 z-10 shadow-sm">
        <button
          onClick={onClose}
          title="Back (Esc)"
          className="text-slate-400 hover:text-text-main bg-slate-50 hover:bg-slate-100 p-2 rounded-[12px] transition-all border border-border-leaf shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black text-text-main tracking-tight m-0">My Profile</h1>
      </div>

      {/* Content */}
      <div className="max-w-[520px] mx-auto py-10 px-6">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative inline-block">
            {/* Status ring */}
            <div 
              className="absolute -inset-1.5 rounded-full transition-shadow duration-300 pointer-events-none"
              style={{
                boxShadow: `0 0 0 3px ${currentStatus.color}, 0 0 20px ${currentStatus.ring}`,
              }} 
            />

            {/* Avatar image or initials */}
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-[108px] h-[108px] rounded-full object-cover block border-4 border-white shadow-sm"
              />
            ) : (
              <div 
                className="w-[108px] h-[108px] rounded-full flex items-center justify-center text-[38px] font-black text-white border-4 border-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                }}
              >
                {getInitials(name || profile?.name)}
              </div>
            )}

            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center transition-all shadow-sm ${
                uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-teal hover:bg-brand-teal-hover cursor-pointer'
              }`}
              title="Change profile picture"
            >
              {uploading
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-white" />
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <p className="mt-5 text-xl font-black text-text-main tracking-tight">{profile?.name}</p>
          <p className="text-xs font-bold mt-1 flex items-center gap-1.5" style={{ color: currentStatus.color }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block shadow-sm" style={{ background: currentStatus.color }} />
            {currentStatus.label}
          </p>
        </div>

        {/* Name — read-only */}
        <div className="mb-7">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Display Name
          </label>
          <div className="bg-white border border-border-leaf rounded-[16px] px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
            {profile?.name || '—'}
          </div>
        </div>

        {/* Role (read-only) */}
        <div className="mb-9">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Job Role
          </label>
          <div className="bg-white border border-border-leaf rounded-[16px] px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
            {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '—'}
          </div>
        </div>

        {/* Status selector */}
        <div className="mb-10">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setStatus(opt.key)}
                  className={`flex items-center gap-3 p-3 rounded-[16px] text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-white shadow-sm border border-transparent ring-1 ring-brand-teal/30' 
                      : 'bg-white border border-border-leaf shadow-sm hover:border-slate-300'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${opt.color}10` : '#ffffff',
                    borderColor: isSelected ? `${opt.color}40` : '',
                  }}
                >
                  <div className="relative shrink-0">
                    <span 
                      className="w-3 h-3 rounded-full block"
                      style={{ 
                        background: opt.color,
                        boxShadow: isSelected ? `0 0 8px ${opt.color}` : 'none'
                      }} 
                    />
                    {opt.key === 'dnd' && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[2px] bg-white rounded-sm block" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black m-0 ${isSelected ? 'text-text-main' : 'text-slate-500'}`} style={{ color: isSelected ? opt.color : '' }}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      {opt.desc}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0" color={opt.color} />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full p-3.5 rounded-[16px] border-none text-sm font-black text-white shadow-sm transition-all tracking-wide flex items-center justify-center gap-2 ${
            saving ? 'bg-brand-teal/70 cursor-not-allowed' : 'bg-brand-teal hover:bg-brand-teal-hover cursor-pointer hover:shadow-md'
          }`}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block animate-spin" />
              Saving…
            </>
          ) : 'Set Status'}
        </button>
      </div>
    </div>
  );
}
