const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

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

  // Construir ruta del archivo
  let filePath = path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url);

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
║   Para OBS Browser Source usa:                                ║
║   → http://localhost:${PORT}/widgets/overlays/<overlay>.html     ║
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
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Servidor detenido por el usuario');
  server.close(() => {
    console.log('✅ Hasta luego! 👋');
    process.exit(0);
  });
});
