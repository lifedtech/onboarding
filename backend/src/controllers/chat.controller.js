const prisma = require('../lib/prisma');

// Store active SSE connections mapping: userId -> Express response object
const activeChatStreams = new Map();

/**
 * Broadcasts real-time events to connected participants over SSE.
 */
function broadcastToParticipants(userIds, eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  userIds.forEach((id) => {
    const res = activeChatStreams.get(id);
    if (res) {
      try {
        res.write(payload);
      } catch (err) {
        console.warn(`[SSE] Failed to write to user ${id}, cleaning connection:`, err.message);
        activeChatStreams.delete(id);
      }
    }
  });
}

/**
 * GET /api/chat/stream
 * Establishes a real-time Server-Sent Events (SSE) connection for the authenticated user.
 */
const stream = (req, res) => {
  const userId = req.user.id;

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Store stream response connection
  activeChatStreams.set(userId, res);

  // Send initial keep-alive ping
  res.write(': keep-alive\n\n');

  // Keep-alive heartbeat (every 20 seconds to prevent connection timeouts)
  const pingInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(pingInterval);
      activeChatStreams.delete(userId);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(pingInterval);
    activeChatStreams.delete(userId);
  });
};

/**
 * GET /api/chat/conversations
 * Retrieves all conversations that the current user participates in.
 */
const getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(conversations);
  } catch (error) {
    console.error('[getConversations]', error);
    return res.status(500).json({ message: 'Internal server error fetching conversations.' });
  }
};

/**
 * POST /api/chat/conversations
 * Creates a new conversation (either DIRECT 1-on-1 or GROUP).
 */
const createConversation = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role?.toLowerCase();
  const { type, name, participants } = req.body; // participants: [{ userId, encryptedKey }]

  if (!type || !['DIRECT', 'GROUP'].includes(type)) {
    return res.status(400).json({ message: 'Invalid conversation type. Must be DIRECT or GROUP.' });
  }

  // PRD Gating: Role-restricted group chat creation (Admins only)
  if (type === 'GROUP' && userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Only Admins can create official group chats.' });
  }

  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ message: 'Participants array with encrypted keys is required.' });
  }

  try {
    // For DIRECT chats, avoid creating duplicate conversations if one already exists
    if (type === 'DIRECT') {
      const recipientId = participants.find((p) => p.userId !== userId)?.userId;
      if (recipientId) {
        const existing = await prisma.conversation.findFirst({
          where: {
            type: 'DIRECT',
            AND: [
              { participants: { some: { userId } } },
              { participants: { some: { userId: recipientId } } },
            ],
          },
          include: {
            participants: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            messages: { orderBy: { createdAt: 'asc' } },
          },
        });
        if (existing) {
          return res.status(200).json(existing);
        }
      }
    }

    // Create new conversation and add participants
    const conversation = await prisma.conversation.create({
      data: {
        type,
        name: type === 'GROUP' ? name || 'Official Group' : null,
        createdBy: type === 'GROUP' ? userId : null,
        participants: {
          create: participants.map((p) => ({
            userId: p.userId,
            encryptedKey: p.encryptedKey,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        messages: true,
      },
    });

    // Notify all participants about the new conversation via SSE stream
    const targetUserIds = participants.map((p) => p.userId);
    broadcastToParticipants(targetUserIds, 'conversation', conversation);

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('[createConversation]', error);
    return res.status(500).json({ message: 'Internal server error creating conversation.' });
  }
};

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Sends a message in a conversation.
 */
const sendMessage = async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;
  const { encryptedText } = req.body;

  if (!encryptedText) {
    return res.status(400).json({ message: 'Encrypted message text is required.' });
  }

  try {
    // Check if the user is a participant of the conversation
    const isParticipant = await prisma.participant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation.' });
    }

    // Save the encrypted message
    const message = await prisma.opsMessage.create({
      data: {
        conversationId,
        senderId: userId,
        encryptedText,
      },
    });

    // Fetch all participant userIds to broadcast the event
    const participants = await prisma.participant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    const targetUserIds = participants.map((p) => p.userId);

    // Broadcast message via SSE
    broadcastToParticipants(targetUserIds, 'message', message);

    return res.status(201).json(message);
  } catch (error) {
    console.error('[sendMessage]', error);
    return res.status(500).json({ message: 'Internal server error sending message.' });
  }
};

module.exports = {
  stream,
  getConversations,
  createConversation,
  sendMessage,
  broadcastToParticipants,
};
