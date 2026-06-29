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
    <div className="flex h-full bg-slate-50/50 text-text-main font-sans overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="w-[300px] flex flex-col bg-white border-r border-border-leaf shrink-0">

        {/* Header */}
        <div className="p-5 border-b border-border-leaf/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[15px] font-black text-text-main tracking-tight m-0">Messages</p>
              <p className="text-[11px] text-text-muted mt-0.5 font-semibold">
                {contactList.length} contacts{totalUnread > 0 && <span className="text-red-500 ml-1.5">· {totalUnread} unread</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-brand-teal font-extrabold uppercase tracking-wider bg-brand-teal/10 px-2 py-1 rounded-full border border-brand-teal/20">
              <Lock size={10} />
              E2EE
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teammates…"
              className="w-full bg-slate-50 border border-border-leaf rounded-[12px] py-2 pl-8 pr-3 text-xs font-semibold text-text-main outline-none focus:border-brand-teal/50 transition-colors"
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 mt-3">
            {[['all', 'All'], ['unread', 'Unread'], ['groups', 'Groups']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all border ${
                  selectedFilter === key 
                    ? 'bg-brand-teal text-white border-brand-teal shadow-sm' 
                    : 'bg-slate-50 text-slate-500 border-border-leaf hover:bg-slate-100 hover:text-text-main'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts scroll */}
        <div className="flex-1 overflow-y-auto p-2">
          {contactList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
              <Search size={24} className="opacity-30" />
              <p className="text-xs font-semibold m-0">No contacts found</p>
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
                className={`w-full flex items-center gap-3 p-2.5 rounded-[16px] text-left border cursor-pointer transition-all mb-0.5 group ${
                  isSelected 
                    ? 'border-brand-teal/30 bg-brand-teal/5 shadow-sm' 
                    : 'border-transparent bg-transparent hover:bg-slate-50 hover:border-border-leaf/50'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {item.type === 'group' ? (
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
                      <Users size={17} className="text-white" />
                    </div>
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[13px] font-extrabold text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    >
                      {getInitials(item.name)}
                    </div>
                  )}
                  {item.type === 'contact' && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${item.isOnline ? 'bg-brand-green' : 'bg-slate-400'}`} />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <p className={`text-[13px] font-black m-0 truncate ${isSelected ? 'text-brand-teal' : 'text-text-main group-hover:text-brand-teal transition-colors'}`}>
                      {item.name}
                    </p>
                    {item.lastTime && (
                      <span className="text-[9px] font-bold text-slate-400 shrink-0">{formatPreviewTime(item.lastTime)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-[11px] font-semibold text-slate-500 m-0 truncate max-w-[170px]">
                      {item.preview || <span className="italic text-slate-400">{item.role?.toLowerCase() || 'Group'}</span>}
                    </p>
                    {item.unread > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] bg-brand-teal text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
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
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-border-leaf shrink-0 shadow-sm z-10">
              <button
                onClick={() => { setActiveChat(null); setMessages([]); }}
                title="Back (Esc)"
                className="p-1 rounded-lg text-slate-400 hover:text-text-main hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              {activeChat.type === 'DIRECT' ? (() => {
                const partner = getChatPartner(activeChat);
                const [c1, c2] = getAvatarGradient(partner?.name);
                return (
                  <>
                    <div className="relative shrink-0">
                      <div 
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-xs font-black text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                      >
                        {getInitials(partner?.name)}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${partner?.isOnline ? 'bg-brand-green' : 'bg-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-text-main m-0 truncate">{partner?.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500 m-0 mt-0.5">
                        {partner?.isOnline ? <span className="text-brand-green">Online</span> : 'Offline'}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {partner?.role}
                      </p>
                    </div>
                  </>
                );
              })() : (
                <>
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-main m-0 truncate">{activeChat.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500 m-0 mt-0.5">Group · {activeChat.participants?.length} members</p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-brand-teal uppercase tracking-wider bg-brand-teal/10 px-2.5 py-1 rounded-full border border-brand-teal/20 shrink-0">
                <Shield size={10} />
                Encrypted
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-[16px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
                    <Shield size={26} className="text-brand-teal/50" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-400 m-0 mb-1">Start a secure conversation</p>
                    <p className="text-xs font-semibold text-slate-500 m-0">Messages are end-to-end encrypted</p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([dateStr, msgs]) => (
                  <div key={dateStr}>
                    {/* Date divider */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border-leaf/50" />
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">
                        {formatDateDivider(dateStr)}
                      </span>
                      <div className="flex-1 h-px bg-border-leaf/50" />
                    </div>

                    {/* Message bubbles */}
                    <div className="flex flex-col gap-1.5">
                      {msgs.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        const text = decryptedMessages[msg.id];
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                              max-w-[66%] px-3.5 py-2.5 text-[13px] font-semibold leading-relaxed break-words shadow-sm
                              ${isMe 
                                ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-[16px] rounded-br-[4px]' 
                                : 'bg-white border border-border-leaf text-text-main rounded-[16px] rounded-bl-[4px]'
                              }
                            `}>
                              {text || <span className="opacity-50 text-[11px] italic">Decrypting…</span>}
                              <div className={`text-[9px] font-extrabold mt-1 text-right ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
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
              className="flex items-center gap-3 px-5 py-3.5 bg-white border-t border-border-leaf shrink-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.02)]"
            >
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-slate-50 border border-border-leaf rounded-[16px] px-4 py-2.5 text-[13px] font-semibold text-text-main outline-none focus:border-brand-teal/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`
                  w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-all shadow-sm
                  ${newMessage.trim() 
                    ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white cursor-pointer hover:shadow-md hover:scale-105' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-border-leaf'
                  }
                `}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          /* Empty / welcome state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50/50 text-center p-8">
            <div className="w-16 h-16 rounded-[20px] bg-brand-teal/5 border border-brand-teal/20 flex items-center justify-center shadow-sm">
              <Shield size={30} className="text-brand-teal/40" />
            </div>
            <div>
              <p className="text-base font-black text-slate-400 m-0 mb-1.5 tracking-tight">Select a conversation</p>
              <p className="text-[13px] font-semibold text-slate-500 m-0 max-w-[280px] leading-relaxed">
                Choose a teammate from the left to start an end-to-end encrypted conversation.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-2">
              <Lock size={11} />
              RSA-OAEP · AES-GCM encrypted
            </div>
            <p className="text-[10px] font-semibold text-slate-400 m-0 mt-4">
              Press <kbd className="bg-white border border-border-leaf rounded-[6px] px-1.5 py-0.5 font-bold shadow-sm">Esc</kbd> to close
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
