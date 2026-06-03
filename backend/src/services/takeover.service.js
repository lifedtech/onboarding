const takeoverRequests = []; // Array of { id, healthmateId, healthmateName, requesterId, requesterName, assigneeId, status, createdAt }

function createRequest(healthmateId, healthmateName, requesterId, requesterName, assigneeId) {
  // Prune existing pending requests for this healthmate
  const cleanList = takeoverRequests.filter(
    (r) => !(r.healthmateId === healthmateId && r.status === 'PENDING')
  );
  takeoverRequests.length = 0;
  takeoverRequests.push(...cleanList);

  const request = {
    id: Math.random().toString(36).substring(2, 11).toUpperCase(),
    healthmateId,
    healthmateName,
    requesterId,
    requesterName,
    assigneeId,
    status: 'PENDING',
    createdAt: Date.now()
  };
  takeoverRequests.push(request);
  return request;
}

function getRequestsForUser(userId) {
  return takeoverRequests.filter((r) => r.assigneeId === userId && r.status === 'PENDING');
}

function getRequestsSentByUser(userId) {
  return takeoverRequests.filter((r) => r.requesterId === userId && r.status === 'PENDING');
}

function handleRequestDecision(requestId, decision) {
  const req = takeoverRequests.find((r) => r.id === requestId);
  if (!req) return null;
  req.status = decision;
  return req;
}

module.exports = {
  createRequest,
  getRequestsForUser,
  getRequestsSentByUser,
  handleRequestDecision,
  takeoverRequests
};
