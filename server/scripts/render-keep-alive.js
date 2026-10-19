#!/usr/bin/env node

/**
 * Onbuggy Standalone Anti-Sleep Ping Script for Render.com
 *
 * Usage:
 *   node scripts/render-keep-alive.js [OPTIONAL_RENDER_URL]
 *   npm run keep-alive
 *
 * Can be run on any external server, machine, local terminal, or cron job.
 */

const https = require('https');
const http = require('http');

const targetUrl =
  process.argv[2] ||
  process.env.KEEP_ALIVE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  'https://onbuggy-server.onrender.com';

const intervalMinutes = Number(process.env.KEEP_ALIVE_INTERVAL_MINS) || 10;
const intervalMs = intervalMinutes * 60 * 1000;

const pingUrl = targetUrl.endsWith('/')
  ? `${targetUrl}api/health`
  : `${targetUrl}/api/health`;

console.log('====================================================');
console.log('  ONBUGGY RENDER ANTI-SLEEP KEEP-ALIVE DAEMON');
console.log('====================================================');
console.log(`Target URL : ${pingUrl}`);
console.log(`Interval   : Every ${intervalMinutes} minutes (Render sleeps at 15m)`);
console.log('Started at :', new Date().toLocaleString());
console.log('----------------------------------------------------');

function sendPing() {
  const startTime = Date.now();
  const protocol = pingUrl.startsWith('https') ? https : http;

  const req = protocol.get(pingUrl, (res) => {
    const latency = Date.now() - startTime;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ PING SUCCESS (${res.statusCode}) - Latency: ${latency}ms - Render is AWAKE`);
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] ⚠️ PING STATUS (${res.statusCode}) - Latency: ${latency}ms`);
    }
  });

  req.on('error', (err) => {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ PING FAILED: ${err.message}`);
  });

  req.setTimeout(25000, () => {
    req.destroy();
    console.warn(`[${new Date().toLocaleTimeString()}] ⏱️ PING TIMEOUT (25s)`);
  });
}

// Send immediate initial ping
sendPing();

// Schedule recurring pings
setInterval(sendPing, intervalMs);

