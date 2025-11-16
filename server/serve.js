const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// TikTok Live connection (will be initialized when username is configured)
let tiktokConnection = null;
let currentUsername = null;

// Like tracking
let userLikes = new Map(); // username -> {username, nickname, likeCount}
let currentTop3 = []; // Array of top 3 likers

// MIME types para servir archivos correctamente
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  // Habilitar CORS para OBS Browser Sources
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Construir ruta del archivo (eliminar query params)
  const urlWithoutQuery = req.url.split('?')[0];
  let filePath = path.join(__dirname, '..', urlWithoutQuery === '/' ? 'index.html' : urlWithoutQuery);

  // Prevenir directory traversal attacks
  const normalizedPath = path.normalize(filePath);
  const projectRoot = path.join(__dirname, '..');
  if (!normalizedPath.startsWith(projectRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Determinar MIME type
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  // Leer y servir archivo
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 - Error del servidor: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,      // 60 segundos antes de considerar desconectado
  pingInterval: 25000,     // Envía ping cada 25 segundos
  connectTimeout: 45000,   // 45 segundos para conectar
  transports: ['websocket', 'polling'], // Usa websocket primero, polling como fallback
  allowEIO3: true          // Compatibilidad con versiones antiguas
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado via Socket.io');

  // Send current TikTok connection status
  socket.emit('tiktok:status', {
    connected: tiktokConnection?.isConnected || false,
    username: currentUsername
  });

  // Handle TikTok username configuration
  socket.on('tiktok:configure', async (data) => {
    const { username } = data;

    if (!username || username.trim() === '') {
      socket.emit('tiktok:error', { message: 'Username is required' });
      return;
    }

    try {
      await connectToTikTok(username);
      socket.emit('tiktok:connected', { username });
    } catch (error) {
      console.error('❌ Error connecting to TikTok:', error);
      socket.emit('tiktok:error', { message: error.message });
    }
  });

  // Handle disconnect
  socket.on('tiktok:disconnect', () => {
    disconnectFromTikTok();
    socket.emit('tiktok:disconnected');
  });

  // TEST EVENTS - For development/testing without TikTok Live
  socket.on('test:member', (data) => {
    console.log('🧪 TEST - Nuevo espectador:', data.username);
    io.emit('tiktok:member', data);
  });

  socket.on('test:follow', (data) => {
    console.log('🧪 TEST - Nuevo seguidor:', data.username);
    io.emit('tiktok:follow', data);
  });

  socket.on('test:chat', (data) => {
    console.log('🧪 TEST - Mensaje:', data.username, '-', data.comment);
    io.emit('tiktok:chat', data);
  });

  socket.on('test:gift', (data) => {
    console.log('🧪 TEST - Regalo:', data.username, '-', data.giftName, 'x', data.repeatCount);
    io.emit('tiktok:gift', data);
  });

  socket.on('test:share', (data) => {
    console.log('🧪 TEST - Compartir:', data.username);
    io.emit('tiktok:share', data);
  });

  socket.on('test:like', (data) => {
    const username = data.username;
    const likeCount = data.likeCount || 1;

    // Update user like count (for testing top 3)
    const userData = userLikes.get(username) || { username, nickname: data.nickname || username, likeCount: 0 };
    userData.likeCount += likeCount;
    userData.nickname = data.nickname || username;
    userLikes.set(username, userData);

    console.log(`🧪 TEST - Likes: ${username} (${likeCount} likes, total: ${userData.likeCount})`);

    // Calculate new top 3
    const newTop3 = calculateTop3();
    const top3Changed = hasTop3Changed(currentTop3, newTop3);

    if (top3Changed) {
      currentTop3 = newTop3;
      console.log('🧪 TEST - Top 3 actualizado:', currentTop3.map(u => `@${u.username} (${u.likeCount})`).join(', '));

      // Emit top 3 ranking event
      io.emit('tiktok:topliker', {
        top3: currentTop3,
        timestamp: Date.now()
      });
    }

    // Emit regular like event
    io.emit('tiktok:like', data);
  });

  socket.on('test:topliker', (data) => {
    console.log('🧪 TEST - Top 3 ranking manual');
    io.emit('tiktok:topliker', data);
  });

  socket.on('disconnect', () => {
    console.log('👋 Cliente desconectado');
  });
});

// Connect to TikTok Live
async function connectToTikTok(username) {
  // Disconnect previous connection if exists
  disconnectFromTikTok();

  console.log(`🔄 Conectando a TikTok Live: @${username}`);

  // Create new connection
  tiktokConnection = new WebcastPushConnection(username, {
    processInitialData: true,
    enableExtendedGiftInfo: true,
    requestPollingIntervalMs: 1000
  });

  currentUsername = username;

  // Connect to TikTok
  await tiktokConnection.connect();

  console.log(`✅ Conectado a TikTok Live: @${username}`);

  // Event: New viewer joins
  tiktokConnection.on('member', (data) => {
    console.log(`👤 Nuevo espectador: @${data.uniqueId}`);
    io.emit('tiktok:member', {
      username: data.uniqueId,
      nickname: data.nickname,
      profilePictureUrl: data.profilePictureUrl,
      timestamp: Date.now()
    });
  });

  // Event: Chat message
  tiktokConnection.on('chat', (data) => {
    console.log(`💬 ${data.uniqueId}: ${data.comment}`);
    io.emit('tiktok:chat', {
      username: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      profilePictureUrl: data.profilePictureUrl,
      timestamp: Date.now()
    });
  });

  // Event: Gift
  tiktokConnection.on('gift', (data) => {
    console.log(`🎁 ${data.uniqueId} envió ${data.giftName} (x${data.repeatCount})`);
    io.emit('tiktok:gift', {
      username: data.uniqueId,
      nickname: data.nickname,
      giftName: data.giftName,
      giftId: data.giftId,
      repeatCount: data.repeatCount,
      repeatEnd: data.repeatEnd,
      profilePictureUrl: data.profilePictureUrl,
      timestamp: Date.now()
    });
  });

  // Event: Follow
  tiktokConnection.on('follow', (data) => {
    console.log(`❤️ ${data.uniqueId} te siguió`);
    io.emit('tiktok:follow', {
      username: data.uniqueId,
      nickname: data.nickname,
      profilePictureUrl: data.profilePictureUrl,
      timestamp: Date.now()
    });
  });

  // Event: Share
  tiktokConnection.on('share', (data) => {
    console.log(`🔗 ${data.uniqueId} compartió el live`);
    io.emit('tiktok:share', {
      username: data.uniqueId,
      nickname: data.nickname,
      profilePictureUrl: data.profilePictureUrl,
      timestamp: Date.now()
    });
  });

  // Event: Like
  tiktokConnection.on('like', (data) => {
    const username = data.uniqueId;
    const likeCount = data.likeCount || 1;

    // Update user like count
    const userData = userLikes.get(username) || { username, nickname: data.nickname, likeCount: 0 };
    userData.likeCount += likeCount;
    userData.nickname = data.nickname; // Update nickname in case it changed
    userLikes.set(username, userData);

    // Calculate new top 3
    const newTop3 = calculateTop3();
    const top3Changed = hasTop3Changed(currentTop3, newTop3);

    if (top3Changed) {
      currentTop3 = newTop3;
      console.log('🏆 Top 3 actualizado:', currentTop3.map(u => `@${u.username} (${u.likeCount})`).join(', '));

      // Emit top 3 ranking event
      io.emit('tiktok:topliker', {
        top3: currentTop3,
        timestamp: Date.now()
      });
    }

    // Emit regular like event
    io.emit('tiktok:like', {
      username: username,
      nickname: data.nickname,
      likeCount: likeCount,
      totalLikeCount: data.totalLikeCount,
      timestamp: Date.now()
    });
  });

  // Event: Disconnected
  tiktokConnection.on('disconnected', () => {
    console.log('❌ Desconectado de TikTok Live');
    io.emit('tiktok:disconnected');
  });

  // Event: Error
  tiktokConnection.on('error', (err) => {
    console.error('❌ Error de TikTok Live:', err);
    io.emit('tiktok:error', { message: err.message });
  });
}

// Calculate top 3 likers
function calculateTop3() {
  const users = Array.from(userLikes.values());
  return users
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);
}

// Check if top 3 has changed
function hasTop3Changed(oldTop3, newTop3) {
  if (oldTop3.length !== newTop3.length) return true;

  for (let i = 0; i < newTop3.length; i++) {
    if (!oldTop3[i] ||
        oldTop3[i].username !== newTop3[i].username ||
        oldTop3[i].likeCount !== newTop3[i].likeCount) {
      return true;
    }
  }

  return false;
}

// Disconnect from TikTok Live
function disconnectFromTikTok() {
  if (tiktokConnection) {
    tiktokConnection.disconnect();
    tiktokConnection = null;
    currentUsername = null;

    // Reset like tracking
    userLikes.clear();
    currentTop3 = [];

    console.log('🛑 Desconectado de TikTok Live');
  }
}

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎙️  EL RINCÓN DEL CHE CARLITOS - OBS STUDIO SERVER          ║
║                                                                ║
║   Servidor corriendo en:                                      ║
║   → http://localhost:${PORT}                                      ║
║   → http://${HOST}:${PORT}                                   ║
║                                                                ║
║   Socket.io WebSocket:                                        ║
║   → ws://localhost:${PORT}                                       ║
║                                                                ║
║   Para OBS Browser Source usa:                                ║
║   → http://localhost:${PORT}/widgets/overlays/<overlay>.html     ║
║                                                                ║
║   TikTok Live: ⏸️  No conectado                                ║
║   Configura tu username en el controller                      ║
║                                                                ║
║   Presiona Ctrl+C para detener el servidor                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Manejo de errores del servidor
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Puerto ${PORT} ya está en uso`);
    console.error(`   Intenta cerrar otras aplicaciones o usar otro puerto:\n`);
    console.error(`   PORT=8081 npm start\n`);
    process.exit(1);
  } else {
    console.error('\n❌ Error del servidor:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Señal SIGTERM recibida, cerrando servidor...');
  disconnectFromTikTok();
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Servidor detenido por el usuario');
  disconnectFromTikTok();
  server.close(() => {
    console.log('✅ Hasta luego! 👋');
    process.exit(0);
  });
});
