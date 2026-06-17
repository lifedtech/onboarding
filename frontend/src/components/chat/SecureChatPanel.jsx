import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Users, Plus, Shield, User, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/axios';
import useOpsStore from '../../store/useOpsStore';
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

export default function SecureChatPanel() {
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('ops_chat_expanded') === 'true';
  });
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'groups'
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Full conversation object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]); // Team directory
  const [isCreatingChat, setIsCreatingChat] = useState(false); // Directory list open
  const [isCreatingGroup, setIsCreatingGroup] = useState(false); // Admin group creation
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // E2EE state
  const [myKeys, setMyKeys] = useState(null); // { publicKey, privateKey } CryptoKey objects
  const [aesKeys, setAesKeys] = useState({}); // conversationId -> CryptoKey object
  const [decryptedMessages, setDecryptedMessages] = useState({}); // messageId -> plain string

  const currentUser = useOpsStore((s) => s.user);
  const token = useOpsStore((s) => s.token);
  const messagesEndRef = useRef(null);

  // 1. Initialize E2EE Keys on Mount
  useEffect(() => {
    if (!currentUser) return;

    async function initE2EE() {
      try {
        let privKeyJwkStr = localStorage.getItem(`ops_chat_priv_key_${currentUser.id}`);
        let pubKeyJwkStr = localStorage.getItem(`ops_chat_pub_key_${currentUser.id}`);
        let pubKeyJwk, privKeyJwk;

        if (!privKeyJwkStr || !pubKeyJwkStr) {
          // Generate new keypair
          const keys = await generateE2EEKeypair();
          pubKeyJwk = keys.publicKeyJwk;
          privKeyJwk = keys.privateKeyJwk;

          localStorage.setItem(`ops_chat_priv_key_${currentUser.id}`, JSON.stringify(privKeyJwk));
          localStorage.setItem(`ops_chat_pub_key_${currentUser.id}`, JSON.stringify(pubKeyJwk));

          // Upload public key to backend
          await api.put('/users/public-key', { publicKey: JSON.stringify(pubKeyJwk) });
        } else {
          pubKeyJwk = JSON.parse(pubKeyJwkStr);
          privKeyJwk = JSON.parse(privKeyJwkStr);

          // Make sure public key is synced with backend (e.g. if database reset)
          if (!currentUser.publicKey) {
            await api.put('/users/public-key', { publicKey: JSON.stringify(pubKeyJwk) });
          }
        }

        // Import keys to CryptoKey objects
        const importedPubKey = await importPublicKey(pubKeyJwk);
        const importedPrivKey = await importPrivateKey(privKeyJwk);

        setMyKeys({ publicKey: importedPubKey, privateKey: importedPrivKey });
      } catch (err) {
        console.error('[E2EE] Initialisation failed:', err);
        toast.error('Failed to initialise end-to-end encryption.');
      }
    }

    initE2EE();
  }, [currentUser]);

  // 2. Fetch Conversations & User Directory
  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [convRes, userRes] = await Promise.all([
        api.get('/chat/conversations'),
        api.get('/users'),
      ]);
      setConversations(convRes.data);
      setUsers(userRes.data.filter((u) => u.id !== currentUser.id));
    } catch (err) {
      console.error('[Chat] Failed to fetch chat data:', err);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchData();
    }
  }, [isExpanded]);

  // Decrypt conversation keys when conversations load
  useEffect(() => {
    if (!myKeys || conversations.length === 0) return;

    async function decryptConversationKeys() {
      const newAesKeys = { ...aesKeys };
      let updated = false;

      for (const conv of conversations) {
        if (newAesKeys[conv.id]) continue;

        // Find current user's participant entry
        const participant = conv.participants.find((p) => p.userId === currentUser.id);
        if (participant && participant.encryptedKey) {
          try {
            const aesKey = await unwrapAESKey(participant.encryptedKey, myKeys.privateKey);
            newAesKeys[conv.id] = aesKey;
            updated = true;
          } catch (err) {
            console.error(`[E2EE] Failed to decrypt AES key for conv ${conv.id}:`, err);
          }
        }
      }

      if (updated) {
        setAesKeys(newAesKeys);
      }
    }

    decryptConversationKeys();
  }, [conversations, myKeys]);

  // 3. Decrypt Message History
  useEffect(() => {
    if (messages.length === 0) return;

    async function decryptHistory() {
      const activeAesKey = aesKeys[activeChat?.id];
      if (!activeAesKey) return;

      const newDecrypted = { ...decryptedMessages };
      let updated = false;

      for (const msg of messages) {
        if (newDecrypted[msg.id]) continue;
        try {
          const plain = await decryptText(msg.encryptedText, activeAesKey);
          newDecrypted[msg.id] = plain;
          updated = true;
        } catch (err) {
          newDecrypted[msg.id] = '[Decryption error: key mismatch]';
          updated = true;
        }
      }

      if (updated) {
        setDecryptedMessages(newDecrypted);
      }
    }

    decryptHistory();
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aesKeys, activeChat]);

  // 4. SSE Real-Time Stream Integration
  useEffect(() => {
    if (!token || !myKeys) return;

    const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/stream?token=${token}`;
    const eventSource = new EventSource(streamUrl);

    // Listen for new messages
    eventSource.addEventListener('message', async (event) => {
      const newMsg = JSON.parse(event.data);

      // If it is for the currently open chat, append to messages state
      if (activeChat && newMsg.conversationId === activeChat.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } else {
        // Increment unread count & trigger visual updates
        setUnreadCount((c) => c + 1);
        fetchData(); // reload conversations list to show preview
      }
    });

    // Listen for new conversations
    eventSource.addEventListener('conversation', (event) => {
      const newConv = JSON.parse(event.data);
      setConversations((prev) => {
        if (prev.some((c) => c.id === newConv.id)) return prev;
        return [newConv, ...prev];
      });
      setUnreadCount((c) => c + 1);
    });

    eventSource.onerror = (err) => {
      console.warn('[SSE] EventSource connection closed or error. Reconnecting...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [token, myKeys, activeChat]);

  // 5. Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const chatAesKey = aesKeys[activeChat.id];
    if (!chatAesKey) {
      toast.error('Encryption key unavailable. Cannot send message.');
      return;
    }

    try {
      const textToEncrypt = newMessage.trim();
      setNewMessage('');
      const ciphertext = await encryptText(textToEncrypt, chatAesKey);

      await api.post(`/chat/conversations/${activeChat.id}/messages`, {
        encryptedText: ciphertext,
      });
    } catch (err) {
      console.error('[Chat] Failed to send message:', err);
      toast.error('Failed to send encrypted message.');
    }
  };

  // 6. Start 1-on-1 Direct Chat
  const handleStartDirectChat = async (recipient) => {
    if (!recipient.publicKey) {
      toast.error(`${recipient.name} has not registered E2EE keys yet. They must log in once first.`);
      return;
    }

    try {
      // Generate clean AES key for this direct chat
      const chatAesKey = await generateAESKey();

      // Wrap key for recipient
      const recipientPubKeyObj = await importPublicKey(JSON.parse(recipient.publicKey));
      const wrappedForRecipient = await wrapAESKey(chatAesKey, recipientPubKeyObj);

      // Wrap key for me
      const myPubKeyJwk = JSON.parse(localStorage.getItem(`ops_chat_pub_key_${currentUser.id}`));
      const myPubKeyObj = await importPublicKey(myPubKeyJwk);
      const wrappedForMe = await wrapAESKey(chatAesKey, myPubKeyObj);

      const payload = {
        type: 'DIRECT',
        participants: [
          { userId: currentUser.id, encryptedKey: wrappedForMe },
          { userId: recipient.id, encryptedKey: wrappedForRecipient },
        ],
      };

      const res = await api.post('/chat/conversations', payload);
      const newConv = res.data;

      // Update state
      setConversations((prev) => {
        if (prev.some((c) => c.id === newConv.id)) return prev;
        return [newConv, ...prev];
      });

      // Save imported AES key
      setAesKeys((prev) => ({ ...prev, [newConv.id]: chatAesKey }));

      // Open conversation
      setActiveChat(newConv);
      setMessages(newConv.messages || []);
      setIsCreatingChat(false);
    } catch (err) {
      console.error('[Chat] Direct chat initiation failed:', err);
      toast.error('Could not initialize direct chat.');
    }
  };

  // 7. Create Group Chat (Admin only)
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupUsers.length === 0) {
      toast.error('Group name and at least one member are required.');
      return;
    }

    try {
      const groupAesKey = await generateAESKey();
      const wrappedParticipants = [];

      // Wrap key for all selected members
      for (const u of selectedGroupUsers) {
        if (!u.publicKey) continue; // Skip if no key
        const userPubKeyObj = await importPublicKey(JSON.parse(u.publicKey));
        const wrappedKey = await wrapAESKey(groupAesKey, userPubKeyObj);
        wrappedParticipants.push({ userId: u.id, encryptedKey: wrappedKey });
      }

      // Wrap key for me (creator)
      const myPubKeyJwk = JSON.parse(localStorage.getItem(`ops_chat_pub_key_${currentUser.id}`));
      const myPubKeyObj = await importPublicKey(myPubKeyJwk);
      const wrappedForMe = await wrapAESKey(groupAesKey, myPubKeyObj);
      wrappedParticipants.push({ userId: currentUser.id, encryptedKey: wrappedForMe });

      const payload = {
        type: 'GROUP',
        name: groupName.trim(),
        participants: wrappedParticipants,
      };

      const res = await api.post('/chat/conversations', payload);
      const newConv = res.data;

      setConversations((prev) => [newConv, ...prev]);
      setAesKeys((prev) => ({ ...prev, [newConv.id]: groupAesKey }));

      // Clean form and navigate
      setGroupName('');
      setSelectedGroupUsers([]);
      setIsCreatingGroup(false);
      setActiveChat(newConv);
      setMessages(newConv.messages || []);
      toast.success('Official group created!');
    } catch (err) {
      console.error('[Chat] Group creation failed:', err);
      toast.error('Could not create official group.');
    }
  };

  const selectConversation = (conv) => {
    setActiveChat(conv);
    setMessages(conv.messages || []);
  };

  const getChatPartner = (conv) => {
    return conv.participants.find((p) => p.userId !== currentUser.id)?.user;
  };

  // Toggle expanded state or close chat conversation
  const toggleExpanded = () => {
    const nextVal = !isExpanded;
    setIsExpanded(nextVal);
    localStorage.setItem('ops_chat_expanded', nextVal.toString());
    if (!nextVal) {
      setActiveChat(null);
    }
  };

  // Filter conversations based on selected tab
  const filteredConversations = conversations.filter((c) =>
    activeTab === 'direct' ? c.type === 'DIRECT' : c.type === 'GROUP'
  );

  return (
    <div className="mx-3 mb-4 mt-auto rounded-xl border border-white/10 bg-white/5 flex flex-col overflow-hidden shrink-0 shadow-inner">
      {/* Header */}
      <div
        onClick={toggleExpanded}
        className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/5 hover:bg-white/10 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1 rounded-lg ${isExpanded ? 'bg-brand-teal/20 text-brand-teal' : 'bg-slate-400/10 text-slate-400'}`}>
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-extrabold text-slate-200 leading-none">Secure Chat</h3>
            {isExpanded && (
              <span className="text-[8px] text-brand-teal/90 font-bold uppercase tracking-wide mt-0.5 inline-block">
                E2EE Secured
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Body when expanded */}
      {isExpanded && (
        <div className="h-72 flex flex-col min-h-0 bg-black/10">
          {activeChat ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Chat partner details */}
              <div className="p-2 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="text-[10px] text-brand-teal font-extrabold hover:underline mr-1 shrink-0"
                  >
                    ← Back
                  </button>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-bold text-slate-200 truncate">
                      {activeChat.type === 'DIRECT'
                        ? getChatPartner(activeChat)?.name || 'Direct Chat'
                        : activeChat.name}
                    </h4>
                  </div>
                </div>
                {activeChat.type === 'DIRECT' && (
                  <Circle
                    className={`w-1.5 h-1.5 fill-current shrink-0 ${
                      getChatPartner(activeChat)?.isOnline ? 'text-green-500' : 'text-slate-500'
                    }`}
                  />
                )}
              </div>

              {/* Messages log */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black/10">
                {messages.length === 0 ? (
                  <div className="text-center py-4">
                    <Shield className="w-6 h-6 text-white/10 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 font-bold">No messages.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    const plainText = decryptedMessages[msg.id];
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div
                          className={`px-2 py-1.5 rounded-xl text-[10px] font-medium leading-tight ${
                            isMe
                              ? 'bg-brand-teal text-white rounded-br-none'
                              : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                          }`}
                        >
                          {plainText || <span className="opacity-50 animate-pulse">Decrypting…</span>}
                        </div>
                        <span className="text-[7px] text-slate-400/80 mt-0.5 font-semibold px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input form */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-white/5 flex gap-1.5 bg-white/5">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send message…"
                  className="flex-1 bg-white/5 border border-white/10 text-[10px] font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-teal text-white placeholder-slate-400/60"
                />
                <button
                  type="submit"
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          ) : isCreatingGroup ? (
            /* CREATE GROUP VIEW */
            <div className="flex-1 flex flex-col min-h-0 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">New Group</h4>
                <button
                  onClick={() => setIsCreatingGroup(false)}
                  className="text-[9px] text-brand-teal font-extrabold hover:underline"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col min-h-0 space-y-2">
                <div>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group Name"
                    required
                    className="w-full bg-white/5 border border-white/10 text-[10px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-teal text-white placeholder-slate-400/60"
                  />
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto border border-white/5 rounded-lg p-1.5 space-y-1.5 bg-black/15">
                    {users.map((u) => (
                      <label key={u.id} className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded-md cursor-pointer select-none">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedGroupUsers.some((x) => x.id === u.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroupUsers([...selectedGroupUsers, u]);
                              } else {
                                setSelectedGroupUsers(selectedGroupUsers.filter((x) => x.id !== u.id));
                              }
                            }}
                            className="rounded text-brand-teal focus:ring-brand-teal w-3 h-3"
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-200 truncate">{u.name}</p>
                            <p className="text-[7px] text-slate-400 uppercase font-extrabold leading-none">{u.role}</p>
                          </div>
                        </div>
                        {!u.publicKey && (
                          <span className="text-[6px] text-red-400 font-extrabold uppercase bg-red-500/10 px-1 py-0.5 rounded">
                            No Key
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-bold rounded-lg py-1.5 text-[10px] transition-colors cursor-pointer"
                >
                  Create Group
                </button>
              </form>
            </div>
          ) : isCreatingChat ? (
            /* START DIRECT CHAT DIRECTORY */
            <div className="flex-1 flex flex-col min-h-0 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">New Direct Chat</h4>
                <button
                  onClick={() => setIsCreatingChat(false)}
                  className="text-[9px] text-brand-teal font-extrabold hover:underline"
                >
                  Cancel
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {users.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-2">No teammates found.</p>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleStartDirectChat(u)}
                      className="w-full flex items-center justify-between p-2 hover:bg-white/5 border border-white/5 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5 relative shrink-0">
                          <User className="w-3 h-3 text-slate-300" />
                          <Circle
                            className={`w-1.5 h-1.5 fill-current absolute -bottom-0.5 -right-0.5 ring-1 ring-[#22313F] ${
                              u.isOnline ? 'text-green-500' : 'text-slate-500'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-200 truncate">{u.name}</p>
                          <p className="text-[7px] text-slate-400 uppercase font-extrabold leading-none">{u.role}</p>
                        </div>
                      </div>
                      {!u.publicKey && (
                        <span className="text-[6px] text-red-400 font-extrabold uppercase bg-red-500/10 px-1 py-0.5 rounded shrink-0">
                          No Key
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* CONVERSATION LIST (DEFAULT VIEW) */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tabs */}
              <div className="flex border-b border-white/5 bg-white/5 shrink-0">
                <button
                  onClick={() => setActiveTab('direct')}
                  className={`flex-1 py-1.5 text-center text-[9px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'direct' ? 'border-b border-brand-teal text-brand-teal bg-white/5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`flex-1 py-1.5 text-center text-[9px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'groups' ? 'border-b border-brand-teal text-brand-teal bg-white/5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Groups
                </button>
              </div>

              {/* List Container */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    {activeTab === 'direct' ? 'Chats' : 'Channels'}
                  </span>
                  {activeTab === 'direct' ? (
                    <button
                      onClick={() => setIsCreatingChat(true)}
                      className="text-[9px] text-brand-teal font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  ) : (
                    currentUser?.role?.toLowerCase() === 'admin' && (
                      <button
                        onClick={() => setIsCreatingGroup(true)}
                        className="text-[9px] text-brand-teal font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> New
                      </button>
                    )
                  )}
                </div>

                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-6 h-6 mx-auto opacity-10 mb-1" />
                    <p className="text-[10px] font-bold">No active chats.</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const partner = conv.type === 'DIRECT' ? getChatPartner(conv) : null;
                    const hasKey = !!aesKeys[conv.id];

                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className="w-full flex items-center justify-between p-2 hover:bg-white/5 border border-white/5 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5 relative shrink-0">
                            {conv.type === 'DIRECT' ? (
                              <>
                                <User className="w-3 h-3 text-slate-300" />
                                <Circle
                                  className={`w-1.5 h-1.5 fill-current absolute -bottom-0.5 -right-0.5 ring-1 ring-[#22313F] ${
                                    partner?.isOnline ? 'text-green-500' : 'text-slate-500'
                                  }`}
                                />
                              </>
                            ) : (
                              <Users className="w-3 h-3 text-brand-teal" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-200 truncate">
                              {conv.type === 'DIRECT' ? partner?.name || 'Direct Chat' : conv.name}
                            </p>
                            <p className="text-[8px] text-slate-400 truncate mt-0.5 leading-none">
                              {!hasKey
                                ? '🔐 Key decrypting…'
                                : conv.messages && conv.messages.length > 0
                                ? decryptedMessages[conv.messages[conv.messages.length - 1].id] || 'Encrypted message'
                                : 'No messages'}
                            </p>
                          </div>
                        </div>
                        {conv.messages && conv.messages.length > 0 && (
                          <span className="text-[7px] text-slate-400 shrink-0 ml-1.5 font-semibold">
                            {new Date(conv.messages[conv.messages.length - 1].createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
