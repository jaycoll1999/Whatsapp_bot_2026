import http from 'http';
import QRCode from 'qrcode';

// In-memory web server state
let state = {
  isConnected: false,
  connectedNumber: null,
  qrDataUrl: null,
  pairingCode: null,
  sessionBase64: null,
  lastError: null
};

let pairingHandler = null;
let resetHandler = null;

/**
 * Update state from bot.js
 */
export async function updateWebState(updates) {
  if (updates.qr) {
    try {
      state.qrDataUrl = await QRCode.toDataURL(updates.qr, {
        scale: 8,
        margin: 2,
        color: { dark: '#0b0c10', light: '#ffffff' }
      });
    } catch (e) {
      console.error("Failed to generate QR data URL:", e);
    }
  } else if (updates.qr === null) {
    state.qrDataUrl = null;
  }

  if (updates.isConnected !== undefined) {
    state.isConnected = updates.isConnected;
    if (updates.isConnected) {
      state.qrDataUrl = null;
      state.pairingCode = null;
    }
  }

  if (updates.connectedNumber !== undefined) state.connectedNumber = updates.connectedNumber;
  if (updates.sessionBase64 !== undefined) state.sessionBase64 = updates.sessionBase64;
  if (updates.pairingCode !== undefined) state.pairingCode = updates.pairingCode;
}

/**
 * Generate luxury branded HTML UI
 */
function getHtmlPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sidography Photography - WhatsApp AI Bot Portal</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body {
      background: radial-gradient(circle at top, #161f30 0%, #0b0f19 100%);
      color: #f3f4f6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: rgba(19, 26, 42, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
      border-radius: 24px;
      max-width: 540px;
      width: 100%;
      padding: 36px 28px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, transparent, #d4af37, transparent);
    }
    .brand-title {
      color: #d4af37;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .brand-sub {
      color: #9ca3af;
      font-size: 12px;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .status-waiting {
      background: rgba(234, 179, 8, 0.12);
      color: #facc15;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }
    .status-connected {
      background: rgba(34, 197, 94, 0.12);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    .qr-container {
      background: #ffffff;
      padding: 16px;
      border-radius: 18px;
      display: inline-block;
      margin: 0 auto 12px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      min-width: 250px;
      min-height: 250px;
    }
    .qr-container img {
      width: 240px;
      height: 240px;
      display: block;
      border-radius: 8px;
    }
    .qr-loading {
      width: 240px;
      height: 240px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #4b5563;
      font-size: 13px;
      gap: 12px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(212, 175, 55, 0.2);
      border-top-color: #d4af37;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-reset-qr {
      background: rgba(255, 255, 255, 0.06);
      color: #d1d5db;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 20px;
      transition: 0.2s;
    }
    .btn-reset-qr:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
    .instructions {
      text-align: left;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.7;
      color: #d1d5db;
    }
    .instructions ol { padding-left: 18px; }
    .instructions li { margin-bottom: 4px; }
    .instructions strong { color: #d4af37; }
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 24px 0 20px;
      position: relative;
    }
    .divider span {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #131a2a;
      padding: 0 12px;
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .pairing-section { margin-top: 10px; }
    .pairing-label { font-size: 12px; color: #9ca3af; margin-bottom: 8px; display: block; text-align: left; }
    .input-group { display: flex; gap: 8px; }
    input[type="text"] {
      flex: 1;
      background: #0b0f19;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 11px 14px;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: 0.2s;
    }
    input[type="text"]:focus { border-color: #d4af37; box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2); }
    .btn {
      background: #d4af37;
      color: #0b0f19;
      border: none;
      font-weight: 700;
      padding: 11px 18px;
      border-radius: 10px;
      cursor: pointer;
      transition: 0.2s;
      font-size: 13px;
    }
    .btn:hover { background: #e5c158; transform: translateY(-1px); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .pairing-result {
      margin-top: 14px;
      padding: 16px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px dashed rgba(212, 175, 55, 0.5);
      border-radius: 12px;
      text-align: center;
    }
    .pairing-code {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 5px;
      color: #d4af37;
      margin: 8px 0;
      font-family: monospace;
    }
    .pairing-hint { font-size: 12px; color: #d1d5db; line-height: 1.5; }
    .connected-view { display: none; padding: 10px 0; }
    .check-icon {
      width: 64px;
      height: 64px;
      background: rgba(34, 197, 94, 0.15);
      border: 2px solid rgba(34, 197, 94, 0.4);
      color: #22c55e;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin-bottom: 16px;
    }
    .connected-title { font-size: 22px; font-weight: 700; color: #22c55e; margin-bottom: 6px; }
    .connected-sub { color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .info-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 12px;
      text-align: left;
    }
    .info-box span { display: block; font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
    .info-box strong { color: #fff; font-size: 14px; }
    .backup-box {
      background: #0b0f19;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 14px;
      padding: 16px;
      text-align: left;
      margin-top: 16px;
    }
    .backup-box h4 { color: #d4af37; font-size: 13px; margin-bottom: 6px; }
    .backup-box p { font-size: 11px; color: #9ca3af; line-height: 1.5; margin-bottom: 10px; }
    .code-scroll {
      background: #131a2a;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      color: #e5e7eb;
      word-break: break-all;
      max-height: 70px;
      overflow-y: auto;
      border: 1px solid rgba(255,255,255,0.08);
      user-select: all;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      margin-top: 10px;
      width: 100%;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
    .footer { margin-top: 24px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-title">📸 SIDOGRAPHY PHOTOGRAPHY</div>
    <div class="brand-sub">WhatsApp AI Assistant • Render Free Connector</div>

    <!-- NOT CONNECTED VIEW -->
    <div id="not-connected-view">
      <div class="status-badge status-waiting">
        <span class="pulse-dot"></span> Waiting for WhatsApp Scan / Link
      </div>

      <div class="qr-container">
        <img id="qr-img" src="" alt="WhatsApp QR Code" style="display: none;" />
        <div id="qr-loading" class="qr-loading">
          <div class="spinner"></div>
          <span id="qr-loading-text">Generating QR Code...</span>
        </div>
      </div>

      <div>
        <button id="reset-qr-btn" class="btn-reset-qr" onclick="resetQR()">🔄 Generate Fresh QR Code</button>
      </div>

      <div class="instructions">
        <ol>
          <li>Open <strong>WhatsApp</strong> on your mobile phone.</li>
          <li>Tap <strong>Settings</strong> (or 3 dots in top right).</li>
          <li>Select <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong>.</li>
          <li>Point your camera at this screen to scan the QR code.</li>
        </ol>
      </div>

      <div class="divider"><span>OR PAIR WITH PHONE NUMBER</span></div>

      <div class="pairing-section">
        <label class="pairing-label">Enter WhatsApp phone number with country code (e.g. 919637577691):</label>
        <div class="input-group">
          <input type="text" id="phone-input" placeholder="91XXXXXXXXXX" />
          <button class="btn" id="pair-btn" onclick="requestPairingCode()">Get Code</button>
        </div>
        <div id="pairing-result-box" class="pairing-result" style="display: none;">
          <div class="pairing-hint">📱 Enter this 8-digit Pairing Code on your WhatsApp:</div>
          <div class="pairing-code" id="pairing-code-text">----</div>
          <div class="pairing-hint">Steps: WhatsApp ➔ Linked Devices ➔ Link with phone number instead ➔ Enter code above</div>
        </div>
      </div>
    </div>

    <!-- CONNECTED VIEW -->
    <div id="connected-view" class="connected-view">
      <div class="check-icon">✓</div>
      <div class="connected-title">Connected to WhatsApp!</div>
      <div class="connected-sub">AI Assistant is active and listening for customer inquiries.</div>

      <div class="info-grid">
        <div class="info-box">
          <span>Connected Account</span>
          <strong id="connected-phone">+--</strong>
        </div>
        <div class="info-box">
          <span>Status</span>
          <strong style="color: #4ade80;">Active & Online</strong>
        </div>
      </div>

      <!-- Render Free 24/7 Keep-Alive Tip -->
      <div class="instructions" style="background: rgba(212, 175, 55, 0.05); border-color: rgba(212, 175, 55, 0.25);">
        <strong>⏰ Render Free 24/7 Setup (स्लीप होऊ नये म्हणून):</strong><br>
        Create a free monitor on <a href="https://uptimerobot.com" target="_blank" style="color: #d4af37; font-weight: bold;">UptimeRobot.com</a> with URL:<br>
        <code id="health-url" style="color: #facc15; font-size: 11px; word-break: break-all;"></code><br>
        Ping interval: <strong>10 minutes</strong>.
      </div>

      <!-- Render Session Persistence Backup -->
      <div class="backup-box" id="session-box" style="display: none;">
        <h4>🔑 Render Session Backup (Permanent Login)</h4>
        <p>Copy this session key and add it in Render Dashboard ➔ <strong>Environment Variables</strong> as <strong>WHATSAPP_SESSION</strong> so you never need to re-scan even if Render restarts!</p>
        <div class="code-scroll" id="session-str"></div>
        <button class="btn btn-secondary" onclick="copySession()">📋 Copy WHATSAPP_SESSION Key</button>
      </div>
    </div>

    <div class="footer">
      Sidography Photography & Films © 2026 • Made with ❤️ by Sudarshan Tupare
    </div>
  </div>

  <script>
    let isConnected = false;

    // Display current URL for health check
    document.getElementById('health-url').innerText = window.location.origin + '/health';

    async function checkStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();

        const isConn = data.isConnected || data.connected;
        const qrUrl = data.qrDataUrl || data.qr;
        const pCode = data.pairingCode || data.pairing_code;
        const phone = data.connectedNumber || data.connected_number;
        const session = data.sessionBase64 || data.session_base64;

        if (isConn && !isConnected) {
          isConnected = true;
          document.getElementById('not-connected-view').style.display = 'none';
          document.getElementById('connected-view').style.display = 'block';
          document.getElementById('connected-phone').innerText = '+' + (phone || '');
          
          if (session) {
            document.getElementById('session-str').innerText = session;
            document.getElementById('session-box').style.display = 'block';
          }
          return;
        }

        if (!isConn) {
          const qrImg = document.getElementById('qr-img');
          const qrLoading = document.getElementById('qr-loading');

          if (qrUrl) {
            if (qrImg.src !== qrUrl) {
              qrImg.src = qrUrl;
            }
            qrImg.style.display = 'block';
            qrLoading.style.display = 'none';
          }

          if (pCode) {
            const formatted = pCode.match(/.{1,4}/g)?.join('-') || pCode;
            document.getElementById('pairing-code-text').innerText = formatted;
            document.getElementById('pairing-result-box').style.display = 'block';
          }
        }
      } catch (err) {
        console.error("Status check failed:", err);
      }
    }

    async function requestPairingCode() {
      const phoneInput = document.getElementById('phone-input');
      const phone = phoneInput.value.trim().replace(/[^0-9]/g, '');
      if (!phone || phone.length < 10) {
        alert('कृपया 10 किंवा 12 अंकांचा फोन नंबर कंट्री कोडसह टाका (उदा. 919637577691)');
        return;
      }

      const btn = document.getElementById('pair-btn');
      btn.innerText = 'Generating...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/pair?phone=' + encodeURIComponent(phone));
        const data = await res.json();
        const code = data.code || data.pairingCode || data.pairing_code;
        if (data.success && code) {
          const formatted = code.match(/.{1,4}/g)?.join('-') || code;
          document.getElementById('pairing-code-text').innerText = formatted;
          document.getElementById('pairing-result-box').style.display = 'block';
        } else {
          alert(data.error || 'Pairing code generation failed');
        }
      } catch (err) {
        alert('Failed to contact server for pairing code.');
      } finally {
        btn.innerText = 'Get Code';
        btn.disabled = false;
      }
    }

    async function resetQR() {
      const btn = document.getElementById('reset-qr-btn');
      btn.innerText = 'Resetting...';
      btn.disabled = true;

      try {
        await fetch('/api/reset', { method: 'POST' });
        document.getElementById('pairing-result-box').style.display = 'none';
        document.getElementById('qr-img').style.display = 'none';
        document.getElementById('qr-loading').style.display = 'flex';
        document.getElementById('qr-loading-text').innerText = 'Generating fresh QR code...';
      } catch (e) {
        console.error("Reset error:", e);
      } finally {
        setTimeout(() => {
          btn.innerText = '🔄 Generate Fresh QR Code';
          btn.disabled = false;
        }, 3000);
      }
    }

    function copySession() {
      const text = document.getElementById('session-str').innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert('Session Key Copied! Now paste this into Render Dashboard -> Environment Variables as WHATSAPP_SESSION.');
      });
    }

    setInterval(checkStatus, 2000);
    checkStatus();
  </script>
</body>
</html>`;
}

/**
 * Start minimal HTTP Server
 */
export function startWebServer(options = {}) {
  const PORT = process.env.PORT || 5000;
  pairingHandler = options.onRequestPairingCode || null;
  resetHandler = options.onReset || null;

  const server = http.createServer(async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, 'http://' + host);

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health / Ping for Render & UptimeRobot
    if (url.pathname === '/health' || url.pathname === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        bot: 'Sidography Photography WhatsApp AI Bot',
        whatsapp_connected: state.isConnected,
        connected_number: state.connectedNumber,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // API: Live Status (returns both camelCase and snake_case properties for compatibility)
    if (url.pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        connected: state.isConnected,
        isConnected: state.isConnected,
        has_qr: !!state.qrDataUrl,
        qr: state.qrDataUrl,
        qrDataUrl: state.qrDataUrl,
        connected_number: state.connectedNumber,
        connectedNumber: state.connectedNumber,
        pairing_code: state.pairingCode,
        pairingCode: state.pairingCode,
        session_base64: state.sessionBase64,
        sessionBase64: state.sessionBase64,
        lastError: state.lastError
      }));
      return;
    }

    // API: Reset Session & Regenerate Fresh QR
    if (url.pathname === '/api/reset') {
      if (resetHandler) {
        try {
          await resetHandler();
          state.pairingCode = null;
          state.qrDataUrl = null;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Session reset. Generating fresh QR code...' }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      } else {
        res.writeHead(501, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Reset handler not implemented' }));
      }
      return;
    }

    // API: Request Pairing Code
    if (url.pathname === '/api/pair') {
      const phoneParam = url.searchParams.get('phone') || '';
      const cleanPhone = phoneParam.replace(/[^0-9]/g, '');

      if (!cleanPhone || cleanPhone.length < 10) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Please enter a valid phone number with country code (e.g. 919637577691)' }));
        return;
      }

      if (!pairingHandler) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'WhatsApp client is initializing. Please wait a few seconds and try again.' }));
        return;
      }

      try {
        console.log(`📱 Requesting 8-digit Pairing Code for +${cleanPhone}...`);
        const code = await pairingHandler(cleanPhone);
        state.pairingCode = code;
        console.log(`🔑 Pairing Code generated: ${code}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, code, pairingCode: code }));
      } catch (err) {
        console.error("Pairing code error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message || 'Failed to generate pairing code' }));
      }
      return;
    }

    // Web UI: Main Portal
    if (url.pathname === '/' || url.pathname === '/qr') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getHtmlPage());
      return;
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`======================================================`);
    console.log(`🌐 Web UI & Health Server active on port ${PORT}`);
    console.log(`👉 Browser URL: http://localhost:${PORT}`);
    console.log(`👉 Health Check: http://localhost:${PORT}/health`);
    console.log(`======================================================\n`);
  });

  return server;
}
