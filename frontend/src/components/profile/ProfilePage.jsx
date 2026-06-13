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
    <div style={{ flex: 1, overflowY: 'auto', background: '#0d1117', color: '#e2e8f0', fontFamily: 'inherit' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', background: '#0f1419', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={onClose}
          title="Back (Esc)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 6, borderRadius: 8 }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.3px' }}>My Profile</h1>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px' }}>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Status ring */}
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              boxShadow: `0 0 0 3px ${currentStatus.color}, 0 0 20px ${currentStatus.ring}`,
              pointerEvents: 'none', transition: 'box-shadow 0.3s',
            }} />

            {/* Avatar image or initials */}
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                style={{ width: 108, height: 108, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid #0d1117' }}
              />
            ) : (
              <div style={{
                width: 108, height: 108, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 38, fontWeight: 700, color: 'white', border: '3px solid #0d1117',
              }}>
                {getInitials(name || profile?.name)}
              </div>
            )}

            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 32, height: 32, borderRadius: '50%',
                background: uploading ? '#334155' : '#0d9488',
                border: '2px solid #0d1117',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              title="Change profile picture"
            >
              {uploading
                ? <span style={{ width: 12, height: 12, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                : <Camera size={14} color="white" />
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          <p style={{ marginTop: 16, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{profile?.name}</p>
          <p style={{ fontSize: 12, color: currentStatus.color, fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: currentStatus.color, display: 'inline-block' }} />
            {currentStatus.label}
          </p>
        </div>

        {/* Name — read-only */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Display Name
          </label>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#475569' }}>
            {profile?.name || '—'}
          </div>
        </div>

        {/* Role (read-only) */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Job Role
          </label>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#475569' }}>
            {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '—'}
          </div>
        </div>

        {/* Status selector */}
        <div style={{ marginBottom: 36 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            Status
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setStatus(opt.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                    background: isSelected ? `${opt.color}15` : 'rgba(255,255,255,0.04)',
                    border: isSelected ? `1px solid ${opt.color}50` : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: opt.color, display: 'block', boxShadow: isSelected ? `0 0 8px ${opt.color}` : 'none' }} />
                    {opt.key === 'dnd' && (
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 1.5, background: 'white', borderRadius: 1, display: 'block' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: isSelected ? opt.color : '#94a3b8', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: 10, color: '#475569', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.desc}</p>
                  </div>
                  {isSelected && <Check size={14} color={opt.color} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: saving ? '#0f766e' : 'linear-gradient(135deg, #0f766e, #0d9488)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, transition: 'all 0.2s', letterSpacing: '0.02em',
          }}
        >
          {saving ? 'Saving…' : 'Set Status'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
