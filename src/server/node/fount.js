import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createHash } from 'node:crypto';
import { 
  putUser, 
  getUserByUUID, 
  getUserByPublicKey, 
  getNineum, 
  grantNineum, 
  grantGalacticNineum,
  grantAdminNineum,
  deleteUser 
} from './src/routes/user.js';
import { resolve } from './src/routes/magic.js';
import { grant } from './src/routes/grant.js';
import { transfer } from './src/routes/transfer.js';
import db from './src/persistence/db.js';
import nineum from './src/nineum/nineum.js';
import experience from './src/experience/experience.js';
import sessionless from 'sessionless-node';
import bdo from 'bdo-js';
import addie from 'addie-js';
import spellbook from './spellbooks/spellbook.js';
import MAGIC from './src/magic/magic.js';

console.log('spellbook:', JSON.stringify(spellbook));

const allowedTimeDifference = 300000; // keep this relaxed for now

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory with proper MIME types
app.use(express.static(path.join(__dirname, '../../../public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use((req, res, next) => {
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.use((req, res, next) => {
  console.log('\n\n', req.body, '\n\n');
  console.log(req.path);
  next();
});

const SUBDOMAIN = process.env.SUBDOMAIN || 'dev';
bdo.baseURL = process.env.LOCALHOST ? 'http://localhost:3003/' : `${SUBDOMAIN}.bdo.allyabase.com/`;
addie.baseURL = process.env.LOCALHOST ? 'http://localhost:3005/' : `${SUBDOMAIN}.addie.allyabase.com/`;

const JULIA_URL = process.env.LOCALHOST ? 'http://localhost:3000/' : `https://${SUBDOMAIN}.julia.allyabase.com/`;

const bdoHashInput = `${SUBDOMAIN}fount`;

const bdoHash = createHash('sha256').update(bdoHashInput).digest('hex');

const repeat = (func) => {
  setTimeout(func, 2000);
};

const bootstrap = async () => {
  try {
    const bdoUUID = await bdo.createUser(bdoHash, spellbook, db.saveKeys, db.getKeys);
console.log('BDO UUID:', bdoUUID);
    const spellbooks = await bdo.putSpellbook(bdoUUID, bdoHash, spellbook);
    const addieUUID = await addie.createUser(db.saveKeys, db.getKeys);
console.log('Addie UUID:', addieUUID);

    // Create Julia user for Nexus authentication
    const keys = await db.getKeys();
    const timestamp = new Date().getTime().toString();
    const message = timestamp + keys.pubKey;
    const signature = await sessionless.sign(message, keys.privateKey);

    const juliaUserResponse = await fetch(`${JULIA_URL}user/create`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp,
        pubKey: keys.pubKey,
        signature,
        user: {
          pubKey: keys.pubKey,
          keys: { interactingKeys: {}, coordinatingKeys: {} }
        }
      })
    });

    const juliaUser = await juliaUserResponse.json();
console.log('Julia response:', juliaUser);
    const juliaUUID = juliaUser.uuid;
console.log('Julia UUID:', juliaUUID);

    const fount = {
      uuid: 'fount',
      bdoUUID,
      addieUUID,
      juliaUUID,
      pubKey: keys.pubKey,
      spellbook
    };

    if(!fount.bdoUUID || !fount.addieUUID || !fount.juliaUUID || spellbooks.length < 1) {
      throw new Error('bootstrap failed');
    }

    await db.saveUser(fount);
console.log('✅ Fount bootstrap complete with Nexus Julia user');
  } catch(err) {
console.warn('Bootstrap error:', err);
    repeat(bootstrap);
  }
};

repeat(bootstrap);

app.put('/user/create', putUser);
app.get('/user/:uuid', getUserByUUID);
app.get('/user/pubKey/:pubKey', getUserByPublicKey);
app.get('/user/:uuid/nineum', getNineum);
app.put('/user/:uuid/nineum', grantNineum);
app.put('/user/:uuid/nineum/admin', grantAdminNineum);
app.put('/user/:uuid/nineum/galactic', grantGalacticNineum);
app.delete('/user/:uuid', deleteUser);

app.post('/resolve/:spellName', resolve);

app.post('/user/:uuid/transfer', transfer);

app.post('/user/:uuid/grant', grant);

// MAGIC spell endpoint for Fount's internal operations
app.post('/magic/spell/:spellName', async (req, res) => {
  try {
    const spellName = req.params.spellName;
    const spell = req.body;

    if (!MAGIC[spellName]) {
      res.status(404);
      return res.send({ error: 'Spell not found' });
    }

    const spellResp = await MAGIC[spellName](spell);
    res.status(spellResp.success === false ? 400 : 200);
    return res.send(spellResp);
  } catch (err) {
    console.error('MAGIC spell error:', err);
    res.status(500);
    res.send({ error: 'Spell execution failed' });
  }
});

// ============================================================================
// Nexus Portal API Routes
// ============================================================================

const NEXUS_SERVICES = {
  julia: process.env.LOCALHOST ? 'http://localhost:3000/' : `https://${SUBDOMAIN}.julia.allyabase.com/`,
  continuebee: process.env.LOCALHOST ? 'http://localhost:3002/' : `https://${SUBDOMAIN}.continuebee.allyabase.com/`,
  bdo: process.env.LOCALHOST ? 'http://localhost:3003/' : `https://${SUBDOMAIN}.bdo.allyabase.com/`,
  fount: process.env.LOCALHOST ? 'http://localhost:3006/' : `https://${SUBDOMAIN}.fount.allyabase.com/`,
  addie: process.env.LOCALHOST ? 'http://localhost:3005/' : `https://${SUBDOMAIN}.addie.allyabase.com/`,
  dolores: process.env.LOCALHOST ? 'http://localhost:3007/' : `https://${SUBDOMAIN}.dolores.allyabase.com/`,
  sanora: process.env.LOCALHOST ? 'http://localhost:7243/' : `https://${SUBDOMAIN}.sanora.allyabase.com/`,
  covenant: process.env.LOCALHOST ? 'http://localhost:3004/' : `https://${SUBDOMAIN}.covenant.allyabase.com/`
};

// Nexus health check
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Nexus Portal (via Fount) is running'
  });
});

// Nexus server info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Nexus Portal via Fount',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: Object.keys(NEXUS_SERVICES),
    uptime: process.uptime()
  });
});

// Service health check
app.post('/api/services/health', async (req, res) => {
  const { services = [] } = req.body;
  const results = {};

  for (const service of services) {
    if (NEXUS_SERVICES[service]) {
      try {
        const response = await fetch(NEXUS_SERVICES[service], {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        results[service] = {
          available: response.ok,
          status: response.status,
          url: NEXUS_SERVICES[service]
        };
      } catch (error) {
        results[service] = {
          available: false,
          error: error.message,
          url: NEXUS_SERVICES[service]
        };
      }
    } else {
      results[service] = {
        available: false,
        error: 'Service not configured'
      };
    }
  }

  const allAvailable = Object.values(results).every(r => r.available);

  res.json({
    allAvailable,
    services: results,
    timestamp: new Date().toISOString()
  });
});

// General service status
app.get('/api/services/status', async (req, res) => {
  const results = {};

  for (const [name, url] of Object.entries(NEXUS_SERVICES)) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      results[name] = {
        available: response.ok,
        status: response.status,
        responseTime: Date.now()
      };
    } catch (error) {
      results[name] = {
        available: false,
        error: error.message
      };
    }
  }

  const availableCount = Object.values(results).filter(r => r.available).length;
  const totalCount = Object.keys(results).length;

  res.json({
    summary: {
      available: availableCount,
      total: totalCount,
      percentage: Math.round((availableCount / totalCount) * 100)
    },
    services: results,
    timestamp: new Date().toISOString()
  });
});

// Base management (mock implementation)
app.get('/api/bases/status', (req, res) => {
  res.json({
    connected: true,
    bases: [SUBDOMAIN],
    total: 1,
    details: [
      {
        id: SUBDOMAIN,
        name: `${SUBDOMAIN} Base`,
        url: `https://${SUBDOMAIN}.allyabase.com`,
        status: 'connected'
      }
    ]
  });
});

app.get('/api/bases/available', (req, res) => {
  res.json({
    bases: [
      {
        id: 'dev',
        name: 'Development Base',
        url: 'https://dev.allyabase.com',
        description: 'Development environment',
        members: 50,
        posts: 500,
        joinable: true
      },
      {
        id: 'test',
        name: 'Test Base',
        url: 'https://test.allyabase.com',
        description: 'Testing environment',
        members: 25,
        posts: 250,
        joinable: true
      }
    ]
  });
});

// Content aggregation (mock implementation)
app.get('/api/content/feed', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const mockContent = [
    {
      id: '1',
      type: 'blog',
      app: 'rhapsold',
      title: 'Welcome to Planet Nine',
      content: 'Exploring the decentralized future of social media...',
      author: 'Alice Dev',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      base: SUBDOMAIN,
      likes: 15,
      comments: 3
    },
    {
      id: '2',
      type: 'microblog',
      app: 'lexary',
      content: 'Just deployed a new feature! The decentralized web is getting better every day 🚀',
      author: 'Charlie Engineer',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      base: SUBDOMAIN,
      likes: 7,
      comments: 1
    }
  ];

  res.json({
    content: mockContent.slice(offset, offset + parseInt(limit)),
    total: mockContent.length,
    hasMore: offset + parseInt(limit) < mockContent.length
  });
});

// Shopping API (mock implementation)
app.get('/api/shopping/products', (req, res) => {
  const { limit = 20, offset = 0, category = '' } = req.query;

  const mockProducts = [
    {
      id: 'ebook-1',
      title: 'The Complete JavaScript Handbook',
      price: 4999,
      category: 'ebooks',
      description: 'Comprehensive guide to modern JavaScript development',
      author: 'Tech Writer',
      base: SUBDOMAIN,
      downloads: 150,
      rating: 4.8
    },
    {
      id: 'music-1',
      title: 'Ambient Focus - Productivity Soundtrack',
      price: 1999,
      category: 'music',
      description: 'Perfect background music for coding and focus work',
      author: 'Sound Designer',
      base: SUBDOMAIN,
      downloads: 89,
      rating: 4.6
    }
  ];

  let filteredProducts = mockProducts;
  if (category) {
    filteredProducts = mockProducts.filter(p => p.category === category);
  }

  res.json({
    products: filteredProducts.slice(offset, offset + parseInt(limit)),
    total: filteredProducts.length,
    hasMore: offset + parseInt(limit) < filteredProducts.length
  });
});

app.get('/api/shopping/categories', (req, res) => {
  res.json({
    categories: [
      { id: 'ebooks', name: 'E-Books', count: 25 },
      { id: 'music', name: 'Music', count: 18 },
      { id: 'software', name: 'Software', count: 12 },
      { id: 'courses', name: 'Courses', count: 8 }
    ]
  });
});

// Communications API (mock implementation)
app.get('/api/communications/conversations', (req, res) => {
  res.json({
    conversations: [
      {
        id: 'conv-1',
        participants: ['Alice', 'Bob'],
        lastMessage: 'Hey, how\'s the Planet Nine development going?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        unread: 2,
        base: SUBDOMAIN
      }
    ]
  });
});

// Nexus login verification - check if pubKey is a coordinating key
app.post('/nexus/login', async (req, res) => {
  try {
    const { pubKey, signature, timestamp } = req.body;

    if (!pubKey || !signature || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: pubKey, signature, timestamp'
      });
    }

    // Verify signature first (before fetching Julia user)
    const message = timestamp + 'nexus-login';
    if (!sessionless.verifySignature(signature, message, pubKey)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Get Nexus Julia user from Fount
    const fountUser = await db.getUser('fount');
    const nexusJuliaUUID = fountUser.juliaUUID;

    // Fetch Nexus Julia user to check coordinating keys
    // Use Fount's keys to authenticate with Julia
    const keys = await db.getKeys();
    const juliaTimestamp = new Date().getTime().toString();
    const juliaMessage = juliaTimestamp + nexusJuliaUUID;
    const juliaSignature = await sessionless.sign(juliaMessage, keys.privateKey);

    const juliaUserResponse = await fetch(`${JULIA_URL}user/${nexusJuliaUUID}?timestamp=${juliaTimestamp}&signature=${juliaSignature}`);

    if (!juliaUserResponse.ok) {
      return res.status(403).json({
        success: false,
        error: 'Failed to verify with Julia'
      });
    }

    const juliaUser = await juliaUserResponse.json();

    // Check if pubKey is in coordinating keys
    const isCoordinating = Object.values(juliaUser.keys?.coordinatingKeys || {}).some(
      key => key === pubKey || key.pubKey === pubKey
    );

    if (!isCoordinating) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized - pubKey not found in coordinating keys',
        hint: 'Complete /authteam to add your phone'
      });
    }

    // Success - user is authenticated
    res.json({
      success: true,
      message: 'Logged in successfully',
      nexusUUID: nexusJuliaUUID,
      coordinatingKeys: Object.keys(juliaUser.keys?.coordinatingKeys || {}).length
    });

  } catch (err) {
    console.error('Nexus login error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// AuthTeam game for adding coordinating keys to Nexus
app.get('/authteam', async (req, res) => {
  try {
    // Get Nexus Julia UUID from saved fount user
    const fountUser = await db.getUser('fount');
    const nexusJuliaUUID = fountUser.juliaUUID;

    // Generate random colored button sequence for authteam game
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const sequenceLength = 5;
    const sequence = [];

    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    // Return authteam game HTML with working coordinate endpoint call
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Nexus AuthTeam - Add Your Phone</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    h1 {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 40px;
    }
    .instruction {
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      font-size: 20px;
      font-weight: bold;
    }
    .button-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .color-button {
      width: 100%;
      aspect-ratio: 1;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      color: white;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    .color-button:hover {
      transform: scale(1.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .color-button:active {
      transform: scale(0.95);
    }
    .color-button.red { background: #e74c3c; }
    .color-button.blue { background: #3498db; }
    .color-button.green { background: #2ecc71; }
    .color-button.yellow { background: #f1c40f; color: #333; }
    .color-button.purple { background: #9b59b6; }
    .color-button.orange { background: #e67e22; }
    .sequence-display {
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 20px;
      font-family: monospace;
      font-size: 18px;
    }
    .status {
      font-size: 24px;
      font-weight: bold;
      min-height: 40px;
    }
    .info-box {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 15px;
      margin-top: 30px;
      font-size: 14px;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 Nexus AuthTeam</h1>
    <div class="subtitle">Link Your Phone to Nexus</div>

    <div class="instruction">
      Press the colored buttons in the correct sequence to add your phone as a coordinating key!
    </div>

    <div class="sequence-display">
      Target: <span id="targetSequence">${sequence.join(' → ')}</span>
    </div>

    <div class="sequence-display">
      Your Input: <span id="playerSequence">-</span>
    </div>

    <div class="button-grid">
      ${colors.map(color => `
        <button class="color-button ${color}" onclick="pressButton('${color}')">
          ${color.toUpperCase()}
        </button>
      `).join('')}
    </div>

    <div class="status" id="status">Ready to begin!</div>

    <div class="info-box">
      <strong>How it works:</strong><br>
      1. Your phone will sign a message with its private key<br>
      2. Send signature + public key to Nexus<br>
      3. Complete the sequence challenge<br>
      4. Your phone becomes a "coordinating key" for Nexus login
    </div>
  </div>

  <script>
    const targetSequence = ${JSON.stringify(sequence)};
    const nexusJuliaUUID = '${nexusJuliaUUID}';
    let playerInput = [];

    function pressButton(color) {
      playerInput.push(color);
      document.getElementById('playerSequence').textContent = playerInput.join(' → ');

      // Check if input matches so far
      for (let i = 0; i < playerInput.length; i++) {
        if (playerInput[i] !== targetSequence[i]) {
          document.getElementById('status').textContent = '❌ Wrong sequence! Try again.';
          document.getElementById('status').style.color = '#e74c3c';
          setTimeout(() => {
            playerInput = [];
            document.getElementById('playerSequence').textContent = '-';
            document.getElementById('status').textContent = 'Ready to begin!';
            document.getElementById('status').style.color = 'white';
          }, 1500);
          return;
        }
      }

      // Check if complete
      if (playerInput.length === targetSequence.length) {
        document.getElementById('status').textContent = '✅ Calling Nexus to add your phone...';
        document.getElementById('status').style.color = '#f1c40f';

        // This is where we call the coordinate endpoint
        // For now, we need phone credentials from The Advancement app
        // This would typically come from a WebView postMessage or similar
        addCoordinatingKey();
      }
    }

    async function addCoordinatingKey() {
      // This function will be called from The Advancement app with real credentials
      // For testing, we'll show a message
      console.log('Ready to add coordinating key for Nexus UUID:', nexusJuliaUUID);

      // Check if running in The Advancement WebView
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.authteamController) {
        // Request credentials from iOS app
        window.webkit.messageHandlers.authteamController.postMessage({
          type: 'requestCredentials',
          nexusUUID: nexusJuliaUUID
        });
      } else {
        // Not in app - show instructions
        document.getElementById('status').textContent = '📱 Open this in The Advancement app to continue';
        document.getElementById('status').style.color = '#3498db';

        setTimeout(() => {
          playerInput = [];
          document.getElementById('playerSequence').textContent = '-';
          document.getElementById('status').textContent = 'Ready to begin!';
          document.getElementById('status').style.color = 'white';
        }, 3000);
      }
    }

    // Function that will be called by The Advancement app with credentials
    window.submitCoordinatingKey = async function(credentials) {
      try {
        const response = await fetch('${JULIA_URL}user/' + nexusJuliaUUID + '/coordinate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: credentials.timestamp,
            pubKey: credentials.pubKey,
            uuid: credentials.uuid,
            signature: credentials.signature
          })
        });

        const result = await response.json();

        if (result.success) {
          document.getElementById('status').textContent = '🎉 Success! Your phone is now linked to Nexus!';
          document.getElementById('status').style.color = '#2ecc71';

          setTimeout(() => {
            window.location.href = '/nexus';
          }, 2000);
        } else {
          throw new Error(result.error || 'Failed to add coordinating key');
        }
      } catch (error) {
        console.error('Error adding coordinating key:', error);
        document.getElementById('status').textContent = '❌ Error: ' + error.message;
        document.getElementById('status').style.color = '#e74c3c';

        setTimeout(() => {
          playerInput = [];
          document.getElementById('playerSequence').textContent = '-';
          document.getElementById('status').textContent = 'Ready to begin!';
          document.getElementById('status').style.color = 'white';
        }, 3000);
      }
    };
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('AuthTeam error:', err);
    res.status(500);
    res.send({ error: 'authteam generation failed' });
  }
});

// SPA fallback for Nexus portal - serve nexus/index.html for /nexus and /nexus/*
app.get('/nexus*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/nexus/index.html'));
});

// ============================================================================

app.listen(3006);
console.log('🚀 Fount server running on port 3006');
console.log('📁 Serving static files from public directory');
console.log('🪄 castSpell.js available at: http://localhost:3006/castSpell.js');
console.log('🌍 Nexus portal available at: http://localhost:3006/nexus');
