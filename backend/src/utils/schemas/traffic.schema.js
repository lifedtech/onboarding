const { z } = require('zod');

// Public, unauthenticated ingestion endpoint (Laravel site + JS tracker —
// see LARAVEL_TRAFFIC_INTEGRATION_GUIDE.md). Both camelCase and snake_case
// variants are genuinely sent by different integrations, so both are
// accepted; every field is analytics text, so it's typed and length-bounded
// rather than format-validated.
const boundedText = (max) => z.string().trim().max(max).optional();

const trafficPingSchema = z.object({
  path: boundedText(2000),
  url: boundedText(2000),
  sessionId: boundedText(200),
  session_id: boundedText(200),
  referrer: boundedText(500),
  userAgent: boundedText(500),
  user_agent: boundedText(500),
  ip: boundedText(45), // longest valid textual IPv6 representation
  device: boundedText(30),
  timestamp: boundedText(50),
}).strict();

module.exports = { trafficPingSchema };
