import https from 'https';
import http from 'http';

/**
 * Onbuggy Anti-Sleep Keep-Alive Service for Render.com
 *
 * Render.com free-tier web services spin down and sleep after 15 minutes of HTTP inactivity.
 * This service automatically pings the public health check endpoint every 10 minutes to
 * generate inbound HTTP traffic through Render's proxy, keeping the container permanently awake 24/7.
 */
export const startKeepAlive = () => {
  // Render automatically populates process.env.RENDER_EXTERNAL_URL in production
  const targetUrl =
    process.env.KEEP_ALIVE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://onbuggy-server.onrender.com' : null);

  if (!targetUrl) {
    console.log('[Keep-Alive]: No public URL configured. Keep-alive service will activate in production on Render.');
    return;
  }

  // Ping interval: 10 minutes (600,000 ms) by default (Render sleeps at 15 minutes)
  const intervalMinutes = Number(process.env.KEEP_ALIVE_INTERVAL_MINS) || 10;
  const intervalMs = intervalMinutes * 60 * 1000;

  const pingUrl = targetUrl.endsWith('/')
    ? `${targetUrl}api/health`
    : `${targetUrl}/api/health`;

  console.log(`[Keep-Alive]: 🚀 Anti-Sleep Engine activated. Pinging ${pingUrl} every ${intervalMinutes} minutes.`);

  const ping = () => {
    const protocol = pingUrl.startsWith('https') ? https : http;
    const req = protocol.get(pingUrl, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[Keep-Alive]: ✅ Ping successful (${res.statusCode} OK) at ${new Date().toISOString()} — Render container kept awake.`);
      } else {
        console.warn(`[Keep-Alive]: ⚠️ Ping response status: ${res.statusCode} at ${new Date().toISOString()}`);
      }
    });

    req.on('error', (err) => {
      console.warn(`[Keep-Alive]: ⚠️ Ping connection warning: ${err.message}`);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      console.warn('[Keep-Alive]: ⚠️ Ping timed out after 15s');
    });
  };

  // First ping after 45 seconds of server startup
  const initialTimeout = setTimeout(ping, 45 * 1000);

  // Recurring ping every intervalMinutes
  const intervalTimer = setInterval(ping, intervalMs);

  return () => {
    clearTimeout(initialTimeout);
    clearInterval(intervalTimer);
  };
};

