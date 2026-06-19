const activeUsers = new Map(); // Maps userId -> lastActiveTimestamp (Date.now())

/**
 * Updates or registers a user's presence.
 */
function updatePresence(userId) {
  if (!userId) return;
  activeUsers.set(userId, Date.now());
}

/**
 * Checks if a user is online based on their last active heartbeat timestamp.
 * Inactive users (older than 15s) are automatically pruned from memory.
 */
function isUserOnline(userId) {
  if (!userId) return false;
  if (!activeUsers.has(userId)) return false;

  const lastActive = activeUsers.get(userId);
  const isOnline = Date.now() - lastActive < 15000; // 15s threshold

  if (!isOnline) {
    activeUsers.delete(userId); // clean memory
  }
  return isOnline;
}

function removePresence(userId) {
  if (!userId) return;
  activeUsers.delete(userId);
}

module.exports = {
  updatePresence,
  isUserOnline,
  removePresence
};
