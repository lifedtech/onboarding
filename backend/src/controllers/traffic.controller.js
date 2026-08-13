const TrafficService = require('../services/traffic.service');

/**
 * POST /api/webhooks/traffic/ping
 * Ingests live traffic ping events from Laravel (lifedhealth.com) or client JS tracker.
 */
const handleTrafficPing = async (req, res) => {
  try {
    const { path, url, sessionId, session_id, referrer, userAgent, user_agent, ip, device } = req.body;

    const event = TrafficService.recordEvent({
      path: path || url || '/',
      sessionId: sessionId || session_id,
      referrer,
      userAgent: userAgent || user_agent,
      ip: ip || req.ip || req.headers['x-forwarded-for'],
      device
    });

    return res.status(200).json({
      success: true,
      message: 'Traffic event logged successfully',
      eventId: event.id
    });
  } catch (error) {
    console.error('[handleTrafficPing]', error);
    return res.status(500).json({ message: 'Failed to record traffic ping' });
  }
};

/**
 * GET /api/analytics/traffic
 * Returns summary website traffic metrics for God View Analytics.
 */
const getLiveTraffic = async (req, res) => {
  try {
    const summary = TrafficService.getTrafficSummary();
    return res.status(200).json({
      success: true,
      traffic: summary
    });
  } catch (error) {
    console.error('[getLiveTraffic]', error);
    return res.status(500).json({ message: 'Failed to fetch traffic summary' });
  }
};

module.exports = {
  handleTrafficPing,
  getLiveTraffic
};
