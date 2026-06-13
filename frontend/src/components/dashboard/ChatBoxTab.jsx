import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Shield,
  Send,
  Users,
  ChevronLeft,
  Lock,
} from 'lucide-react';
import api from '../../lib/axios';
import useOpsStore from '../../store/useOpsStore';
import { playNotificationSound } from '../../lib/audio';
import {
  generateE2EEKeypair,
  importPublicKey,
  importPrivateKey,
  generateAESKey,
  wrapAESKey,
  unwrapAESKey,
  encryptText,
  decryptText,
} from '../../lib/crypto';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatPreviewTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatDateDivider = (dateStr) => {
  const d = new Date(dateStr);
  if (d.toDateString() === new Date().toDateString()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

const AVATAR_GRADIENTS = [
  ['#7c3aed', '#6d28d9'], // violet
  ['#0891b2', '#0e7490'], // cyan
  ['#059669', '#047857'], // emerald
  ['#d97706', '#b45309'], // amber
  ['#db2777', '#be185d'], // pink
  ['#2563eb', '#1d4ed8'], // blue
  ['#dc2626', '#b91c1c'], // red
  ['#7c3aed', '#4f46e5'], // indigo
];

const getAvatarGradient = (name) => {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

// ─── Avatar Component ─────────────────────────────────────────────────────────

function Avatar({ name, size = 10, rounded = 'xl', isOnline, ringColor = '#0f1419' }) {
  const [c1, c2] = getAvatarGradient(name);
  const px = size * 4;
  return (
    <div className="relative shrink-0" style={{ width: px, height: px }}>
      <div
        className={`w-full h-full rounded-${rounded} flex items-center justify-center text-white font-bold select-none`}
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, fontSize: px * 0.32 }}
      >
        {getInitials(name)}
      </div>
      {isOnline !== undefined && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2"
          style={{
            width: 12, height: 12,
            background: isOnline ? '#10b981' : '#475569',
            borderColor: ringColor,
          }}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatBoxTab({ onClose }) {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // E2EE state
  const [myKeys, setMyKeys] = useState(null);
  const [aesKeys, setAesKeys] = useState({});
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const currentUser = useOpsStore((s) => s.user);
  const token = useOpsStore((s) => s.token);
  const setChatHasUnread = useOpsStore((s) => s.setChatHasUnread);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Clear unread on mount ────────────────────────────────────────────────────
  useEffect(() => {
    setChatHasUnread(false);
  }, []);

  // ── ESC key handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (activeChat) {
        setActiveChat(null);
        setMessages([]);
      } else {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeChat, onClose]);

  // ── 1. E2EE key init ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    async function initE2EE() {
      try {
        let privKeyJwkStr = localStorage.getItem(`ops_chat_priv_key_${currentUser.id}`);
        let pubKeyJwkStr = localStorage.getItem(`ops_chat_pub_key_${currentUser.id}`);
        let pubKeyJwk, privKeyJwk;
        if (!privKeyJwkStr || !pubKeyJwkStr) {
          const keys = await generateE2EEKeypair();
          pubKeyJwk = keys.publicKeyJwk;
          privKeyJwk = keys.privateKeyJwk;
          localStorage.setItem(`ops_chat_priv_key_${currentUser.id}`, JSON.stringify(privKeyJwk));
          localStorage.setItem(`ops_chat_pub_key_${currentUser.id}`, JSON.stringify(pubKeyJwk));
          await api.put('/users/public-key', { publicKey: JSON.stringify(pubKeyJwk) });
        } else {
          pubKeyJwk = JSON.parse(pubKeyJwkStr);
          privKeyJwk = JSON.parse(privKeyJwkStr);
          if (!currentUser.publicKey)
            await api.put('/users/public-key', { publicKey: JSON.stringify(pubKeyJwk) });
        }
        setMyKeys({
          publicKey: await importPublicKey(pubKeyJwk),
          privateKey: await importPrivateKey(privKeyJwk),
        });
      } catch (err) {
        console.error('[ChatBox E2EE] init failed:', err);
        toast.error('Failed to initialize encryption keys.');
      }
    }
    initE2EE();
  }, [currentUser]);

  // ── 2. Fetch conversations + directory ──────────────────────────────────────
  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [convRes, userRes] = await Promise.all([
        api.get('/chat/conversations'),
        api.get('/users'),
      ]);
      setConversations(convRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('[ChatBox] fetch failed:', err);
    }
  };
  useEffect(() => { fetchData(); }, [currentUser]);

  // ── 3. Decrypt conversation AES keys ────────────────────────────────────────
  useEffect(() => {
    if (!myKeys || !conversations.length) return;
    async function decryptKeys() {
      const next = { ...aesKeys };
      let changed = false;
      for (const conv of conversations) {
        if (next[conv.id]) continue;
        const p = conv.participants.find((x) => x.userId === currentUser.id);
        if (p?.encryptedKey) {
          try {
            next[conv.id] = await unwrapAESKey(p.encryptedKey, myKeys.privateKey);
            changed = true;
          } catch (e) {
            console.error('[E2EE] unwrap failed for', conv.id, e);
          }
        }
      }
      if (changed) setAesKeys(next);
    }
    decryptKeys();
  }, [conversations, myKeys]);

  // ── 4. Decrypt active chat messages ─────────────────────────────────────────
  useEffect(() => {
    if (!messages.length) return;
    async function decryptHistory() {
      const key = aesKeys[activeChat?.id];
      if (!key) return;
      const next = { ...decryptedMessages };
      let changed = false;
      for (const msg of messages) {
        if (next[msg.id]) continue;
        try {
          next[msg.id] = await decryptText(msg.encryptedText, key);
        } catch {
          next[msg.id] = '[Decryption error]';
        }
        changed = true;
      }
      if (changed) setDecryptedMessages(next);
    }
    decryptHistory();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [messages, aesKeys, activeChat]);

  // ── 5. SSE stream ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !myKeys) return;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/stream?token=${token}`;
    const es = new EventSource(url);

    es.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (activeChat && msg.conversationId === activeChat.id) {
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      } else {
        setUnreadCounts((prev) => ({ ...prev, [msg.conversationId]: (prev[msg.conversationId] || 0) + 1 }));
        setChatHasUnread(true);
        playNotificationSound();
        fetchData();
      }
    });

    es.addEventListener('conversation', (event) => {
      const conv = JSON.parse(event.data);
      setConversations((prev) => prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]);
      setUnreadCounts((prev) => ({ ...prev, [conv.id]: (prev[conv.id] || 0) + 1 }));
      setChatHasUnread(true);
      playNotificationSound();
    });

    return () => es.close();
  }, [token, myKeys, activeChat]);

  // ── 6. Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const key = aesKeys[activeChat.id];
    if (!key) { toast.error('Encryption key unavailable.'); return; }
    try {
      const text = newMessage.trim();
      setNewMessage('');
      const cipher = await encryptText(text, key);
      await api.post(`/chat/conversations/${activeChat.id}/messages`, { encryptedText: cipher });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('[ChatBox] send failed:', err);
      toast.error('Failed to send message.');
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getChatPartner = (conv) => conv.participants.find((p) => p.userId !== currentUser.id)?.user;

  const openOrCreateChat = async (partner) => {
    if (!partner.publicKey) {
      toast.error(`${partner.name} hasn't set up encryption keys yet.`);
      return;
    }
    const existing = conversations.find(
      (c) => c.type === 'DIRECT' && c.participants.some((p) => p.userId === partner.id)
    );
    if (existing) {
      setActiveChat(existing);
      setMessages(existing.messages || []);
      setUnreadCounts((prev) => ({ ...prev, [existing.id]: 0 }));
      setTimeout(() => inputRef.current?.focus(), 80);
      return;
    }
    try {
      const aesKey = await generateAESKey();
      const partnerPub = await importPublicKey(JSON.parse(partner.publicKey));
      const myPubJwk = JSON.parse(localStorage.getItem(`ops_chat_pub_key_${currentUser.id}`));
      const myPub = await importPublicKey(myPubJwk);
      const res = await api.post('/chat/conversations', {
        type: 'DIRECT',
        participants: [
          { userId: currentUser.id, encryptedKey: await wrapAESKey(aesKey, myPub) },
          { userId: partner.id, encryptedKey: await wrapAESKey(aesKey, partnerPub) },
        ],
      });
      const conv = res.data;
      setConversations((prev) => [conv, ...prev]);
      setAesKeys((prev) => ({ ...prev, [conv.id]: aesKey }));
      setActiveChat(conv);
      setMessages(conv.messages || []);
      setUnreadCounts((prev) => ({ ...prev, [conv.id]: 0 }));
      setTimeout(() => inputRef.current?.focus(), 80);
    } catch (err) {
      console.error('[ChatBox] create conv failed:', err);
      toast.error('Could not start secure chat.');
    }
  };

  // ── Contact list ─────────────────────────────────────────────────────────────
  const getContactList = () => {
    const teammates = users.filter((u) => u.id !== currentUser.id);

    const contacts = teammates.map((u) => {
      const conv = conversations.find(
        (c) => c.type === 'DIRECT' && c.participants.some((p) => p.userId === u.id)
      );
      const last = conv?.messages?.at(-1) ?? null;
      const preview = last
        ? (decryptedMessages[last.id] || '···')
        : null;
      return {
        type: 'contact', id: u.id, name: u.name, role: u.role,
        isOnline: u.isOnline, publicKey: u.publicKey, conversation: conv,
        lastTime: last ? new Date(last.createdAt) : null,
        preview,
        unread: conv ? (unreadCounts[conv.id] || 0) : 0,
      };
    });

    const groups = conversations.filter((c) => c.type === 'GROUP').map((g) => {
      const last = g.messages?.at(-1) ?? null;
      return {
        type: 'group', id: g.id, name: g.name, conversation: g,
        lastTime: last ? new Date(last.createdAt) : null,
        preview: last ? (decryptedMessages[last.id] || '···') : null,
        unread: unreadCounts[g.id] || 0,
      };
    });

    let list = [...contacts, ...groups];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (selectedFilter === 'unread') list = list.filter((i) => i.unread > 0);
    if (selectedFilter === 'groups') list = list.filter((i) => i.type === 'group');
    list.sort((a, b) => {
      if (!a.lastTime) return 1;
      if (!b.lastTime) return -1;
      return b.lastTime - a.lastTime;
    });
    return list;
  };

  const contactList = getContactList();
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Group messages by date for dividers
  const groupedMessages = messages.reduce((acc, msg) => {
    const key = new Date(msg.createdAt).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', background: '#0d1117', color: '#e2e8f0', fontFamily: 'inherit', overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', background: '#0f1117', borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px', margin: 0 }}>Messages</p>
              <p style={{ fontSize: 11, color: '#475569', margin: '2px 0 0', fontWeight: 500 }}>
                {contactList.length} contacts{totalUnread > 0 && <span style={{ color: '#f87171', marginLeft: 6 }}>· {totalUnread} unread</span>}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Lock size={10} />
              E2EE
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teammates…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 10px 8px 30px', fontSize: 12, color: '#e2e8f0', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {[['all', 'All'], ['unread', 'Unread'], ['groups', 'Groups']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: selectedFilter === key ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.05)',
                  color: selectedFilter === key ? '#2dd4bf' : '#64748b',
                  outline: selectedFilter === key ? '1px solid rgba(20,184,166,0.3)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {contactList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 8, color: '#334155' }}>
              <Search size={24} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>No contacts found</p>
            </div>
          ) : contactList.map((item) => {
            const isSelected = activeChat && (
              (item.type === 'contact' && activeChat.type === 'DIRECT' && activeChat.participants.some(p => p.userId === item.id)) ||
              (item.type === 'group' && activeChat.type === 'GROUP' && activeChat.id === item.id)
            );
            const [c1, c2] = getAvatarGradient(item.name);
            return (
              <button
                key={item.id}
                onClick={() => item.type === 'contact' ? openOrCreateChat(item) : (() => { setActiveChat(item.conversation); setMessages(item.conversation.messages || []); setUnreadCounts(p => ({ ...p, [item.id]: 0 })); })()}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 12, textAlign: 'left',
                  border: isSelected ? '1px solid rgba(20,184,166,0.25)' : '1px solid transparent',
                  background: isSelected ? 'rgba(20,184,166,0.08)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s', marginBottom: 1,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {item.type === 'group' ? (
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0d9488, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={17} color="white" />
                    </div>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${c1}, ${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                      {getInitials(item.name)}
                    </div>
                  )}
                  {item.type === 'contact' && (
                    <span style={{ position: 'absolute', bottom: -1, right: -1, width: 11, height: 11, borderRadius: '50%', background: item.isOnline ? '#10b981' : '#475569', border: '2px solid #0f1117' }} />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#5eead4' : '#e2e8f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    {item.lastTime && (
                      <span style={{ fontSize: 9, color: '#475569', flexShrink: 0 }}>{formatPreviewTime(item.lastTime)}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <p style={{ fontSize: 11, color: '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                      {item.preview || <span style={{ fontStyle: 'italic', color: '#334155' }}>{item.role?.toLowerCase() || 'Group'}</span>}
                    </p>
                    {item.unread > 0 && (
                      <span style={{ flexShrink: 0, minWidth: 18, height: 18, background: '#14b8a6', color: '#0f1117', fontSize: 9, fontWeight: 800, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                        {item.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#0f1117', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <button
                onClick={() => { setActiveChat(null); setMessages([]); }}
                title="Back (Esc)"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 4, borderRadius: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                <ChevronLeft size={20} />
              </button>

              {activeChat.type === 'DIRECT' ? (() => {
                const partner = getChatPartner(activeChat);
                const [c1, c2] = getAvatarGradient(partner?.name);
                return (
                  <>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${c1}, ${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                        {getInitials(partner?.name)}
                      </div>
                      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: partner?.isOnline ? '#10b981' : '#475569', border: '2px solid #0f1117' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partner?.name}</p>
                      <p style={{ fontSize: 11, color: '#475569', margin: '1px 0 0', fontWeight: 500 }}>
                        {partner?.isOnline
                          ? <span style={{ color: '#34d399' }}>Online</span>
                          : 'Offline'
                        }
                        <span style={{ margin: '0 6px', color: '#1e293b' }}>·</span>
                        {partner?.role}
                      </p>
                    </div>
                  </>
                );
              })() : (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0d9488, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={16} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{activeChat.name}</p>
                    <p style={{ fontSize: 11, color: '#475569', margin: '1px 0 0' }}>Group · {activeChat.participants?.length} members</p>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#2dd4bf', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(20,184,166,0.08)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(20,184,166,0.2)', flexShrink: 0 }}>
                <Shield size={10} />
                Encrypted
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#0d1117' }}>
              {messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={26} color="rgba(20,184,166,0.5)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', margin: '0 0 4px' }}>Start a secure conversation</p>
                    <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>Messages are end-to-end encrypted</p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([dateStr, msgs]) => (
                  <div key={dateStr}>
                    {/* Date divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                      <span style={{ fontSize: 10, color: '#334155', fontWeight: 600, letterSpacing: '0.04em' }}>
                        {formatDateDivider(dateStr)}
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    </div>

                    {/* Message bubbles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {msgs.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        const text = decryptedMessages[msg.id];
                        return (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '66%',
                              padding: '9px 13px',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: isMe ? 'linear-gradient(135deg, #0f766e, #0d9488)' : 'rgba(255,255,255,0.06)',
                              border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: isMe ? '#f0fdfa' : '#cbd5e1',
                              wordBreak: 'break-word',
                            }}>
                              {text || <span style={{ opacity: 0.4, fontSize: 11, fontStyle: 'italic' }}>Decrypting…</span>}
                              <div style={{ fontSize: 9, color: isMe ? 'rgba(240,253,250,0.5)' : '#334155', marginTop: 4, textAlign: 'right' }}>
                                {formatTime(msg.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleSendMessage}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#0f1117', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  background: newMessage.trim() ? 'linear-gradient(135deg, #0f766e, #0d9488)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
                  opacity: newMessage.trim() ? 1 : 0.4,
                }}
              >
                <Send size={16} color="white" />
              </button>
            </form>
          </>
        ) : (
          /* Empty / welcome state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#0d1117', textAlign: 'center', padding: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={30} color="rgba(20,184,166,0.45)" />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: '0 0 6px', letterSpacing: '-0.3px' }}>Select a conversation</p>
              <p style={{ fontSize: 13, color: '#334155', margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
                Choose a teammate from the left to start an end-to-end encrypted conversation.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#1e293b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 8 }}>
              <Lock size={11} />
              RSA-OAEP · AES-GCM encrypted
            </div>
            <p style={{ fontSize: 10, color: '#1e293b', margin: 0 }}>Press <kbd style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'monospace' }}>Esc</kbd> to close</p>
          </div>
        )}
      </div>
    </div>
  );
}
