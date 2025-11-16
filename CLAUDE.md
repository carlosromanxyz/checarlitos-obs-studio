# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**El Rincón del Che Carlitos** - OBS Studio overlay system optimized for vertical streaming (9:16) on TikTok, Instagram Reels, and YouTube Shorts. Built with vanilla JavaScript and Tailwind CSS, emphasizing zero build tools and maximum portability.

## Common Commands

### Development
```bash
# Start development server (required for all overlays to function)
npm start

# Server runs on http://localhost:8080
# Socket.io WebSocket: ws://localhost:8080
```

### Changing Port
```bash
# If port 8080 is in use
PORT=8081 npm start
```

### Killing Port Conflicts
```bash
# Find process using port 8080
lsof -ti:8080

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

## Architecture Overview

### Server Architecture (server/serve.js)

The Node.js server serves three critical functions:

1. **Static File Server**: Serves HTML overlays, assets, and widgets with proper MIME types
2. **Socket.io WebSocket Server**: Provides real-time bidirectional communication between overlays and TikTok Live events
3. **TikTok Live Connector**: Manages TikTok Live API connection via `tiktok-live-connector` package

**Key Features**:
- CORS enabled for OBS Browser Sources
- Path traversal protection
- Graceful shutdown handling (SIGTERM/SIGINT)
- Port conflict detection and helpful error messages
- Top 3 likers ranking system (tracks and broadcasts when top 3 changes)

**Socket.io Events**:
- **Server emits**: `tiktok:member`, `tiktok:chat`, `tiktok:gift`, `tiktok:follow`, `tiktok:share`, `tiktok:like`, `tiktok:topliker`, `tiktok:status`, `tiktok:error`, `tiktok:connected`, `tiktok:disconnected`
- **Server listens**: `tiktok:configure`, `tiktok:disconnect`, `test:*` (for testing without live connection)

**Test Events**: The server supports `test:member`, `test:follow`, `test:chat`, `test:gift`, `test:share`, `test:like`, `test:topliker` for development/testing without TikTok Live connection. These emit the same events as real TikTok data.

### Widget System

Three-tier widget architecture:

1. **Overlays** (`widgets/overlays/`): Browser Source overlays for OBS
   - `tiktok-events-overlay.html` - Displays TikTok Live events (followers, gifts, shares, top likers)
   - `greetings-overlay.html` - Welcome messages for new viewers
   - `followers-overlay.html` - Follower count display
   - `logo-overlay.html` - Animated brand logo
   - `quotes-overlay.html` - Rotating quotes
   - `youtube-carousel-overlay.html` - YouTube video carousel

2. **Controllers** (`widgets/controllers/`):
   - `overlays-controller.html` - Dashboard for TikTok Live connection management and testing events

3. **Testing Tools** (`widgets/testing/`):
   - `tiktok-simulator.html` - Simulates TikTok Live events for development

**Overlay Pattern**:
All overlays follow this structure:
- Connect to Socket.io server on load
- Listen for TikTok events via Socket.io
- Display events with branded animations (slideDownBounce, slideUpFade)
- Auto-dismiss after configured duration
- Use event queue system to prevent overlapping displays

### Design System (tailwind.config.js)

**Radio-Themed Color Palette**:
- `radio-red` (#FF3B3B) - Primary accent, "ON AIR" indicators
- `radio-gold` (#FFD700) - Vintage radio aesthetic, highlights
- `radio-charcoal` (#2C2C2C) - Dark backgrounds
- `radio-wave` (#00D9FF) - Neon cyan, sound waves, modern accents
- `radio-silver` (#C0C0C0) - Equipment metallic tones
- `radio-amber` (#FFBF00) - Studio lights
- `radio-slate` (#4A4A4A) - Secondary backgrounds
- `radio-cream` (#F5F5DC) - Soft details

**Typography**: Poppins (via Google Fonts) - all weights 300-900

**Layout Safe Zones** (for TikTok UI):
- `safe-top`: 80px - Avoids TikTok top UI
- `safe-bottom`: 120px - Avoids TikTok controls
- `safe-side`: 20px - Side margins

**Custom Animations**:
- `pulse-slow`, `bounce-subtle`, `fade-in`, `slide-up`, `glow`
- Overlays use `slideDownBounce` (entrance) and `slideUpFade` (exit)

**Resolution**: 1080x1920 (9:16 vertical)

### Technology Stack

**Frontend**:
- Vanilla JavaScript (ES6+) - No frameworks
- Tailwind CSS v4 via CDN - No build process
- Socket.io client via CDN
- Font Awesome 6.7.1 via CDN
- Google Fonts (Poppins)

**Backend**:
- Node.js (>=14.0.0)
- Socket.io server (^4.8.1)
- tiktok-live-connector (^2.1.0)
- Native `http` module (no Express)

**Philosophy**: Zero build tools, maximum portability, CDN-first approach

## Project Structure

```
checarlitos-obs-studio/
├── server/
│   └── serve.js           # Node.js server (static + Socket.io + TikTok)
├── config/                # JSON configuration files for overlays
│   ├── youtube-carousel.json  # YouTube carousel config
│   └── logo.json          # Logo overlay config
├── widgets/
│   ├── overlays/          # OBS Browser Source overlays
│   ├── controllers/       # Management dashboard (TikTok, Quotes)
│   ├── testing/           # Development testing tools
│   └── js/                # Shared JavaScript (quotes)
├── assets/
│   └── images/            # Static images
├── docs/                  # Documentation
├── index.html             # Landing page
├── tailwind.config.js     # Design system configuration
└── package.json
```

## OBS Studio Integration

### Adding a Browser Source

1. Start the server: `npm start`
2. In OBS: Add Source → Browser
3. URL: `http://localhost:8080/widgets/overlays/<overlay-name>.html`
4. Width: 1080
5. Height: 1920
6. Check "Shutdown source when not visible" (recommended)
7. Check "Refresh browser when scene becomes active" (optional)

### Recommended Overlays Setup

Layer from top to bottom:
1. `tiktok-events-overlay.html` - Interactive events (top layer)
2. `greetings-overlay.html` - Welcome messages
3. Video source (main content)
4. `logo-overlay.html` - Branding
5. Background

## TikTok Live Integration

### Configuration Flow

1. Open `http://localhost:8080/widgets/controllers/overlays-controller.html`
2. Enter TikTok username (without @)
3. Click "Conectar"
4. Server connects via `tiktok-live-connector`
5. All overlays automatically receive events

### Event Flow

```
TikTok Live → tiktok-live-connector → server/serve.js → Socket.io → Overlays
```

### Testing Without TikTok Live

Use the controller or simulator to emit test events:
```javascript
socket.emit('test:follow', { username: 'testuser', nickname: 'Test User' });
socket.emit('test:gift', { username: 'testuser', giftName: 'Rose', repeatCount: 5 });
socket.emit('test:topliker', { top3: [{username: 'user1', nickname: 'User 1', likeCount: 100}, ...] });
```

## State Management

**Server-Side**:
- `userLikes` Map - Tracks cumulative likes per user (username → {username, nickname, likeCount})
- `currentTop3` Array - Current top 3 likers, only emits `tiktok:topliker` when ranking changes
- TikTok connection state (`tiktokConnection`, `currentUsername`)

**Client-Side**:
- **JSON-based configuration** for overlays (YouTube, Logo) - stored in `config/` directory
- localStorage for some widget settings (Quotes - legacy support)
- No global state management library
- Event-driven architecture via Socket.io

### JSON-Based Overlay Configuration

#### YouTube Carousel

**Location**: `config/youtube-carousel.json`

**Structure**:
```json
{
  "isVisible": true,
  "intervalSeconds": 30,
  "videos": [
    {
      "videoId": "dQw4w9WgXcQ",
      "location": "CANCÚN",
      "isEnabled": true
    }
  ]
}
```

**Properties**:
- `isVisible`: Show/hide the entire overlay
- `intervalSeconds`: Time between video transitions (5-60 seconds)
- `videoId`: YouTube video ID (11 characters)
- `location`: Text shown in "DESDE" badge
- `isEnabled`: Skip video if false

#### Logo

**Location**: `config/logo.json`

**Structure**:
```json
{
  "isVisible": true,
  "showText": false
}
```

**Properties**:
- `isVisible`: Show/hide the logo overlay
- `showText`: Show/hide "El Rincón del Che Carlitos" text

### How JSON Configuration Works

1. Edit JSON file directly in your text editor
2. Save the file
3. Overlay fetches the JSON every 5 seconds via HTTP
4. Updates automatically when changes are detected

**No controller needed** - Manual JSON editing provides full control

## Development Patterns

### Adding a New Overlay

1. Create `widgets/overlays/new-overlay.html`
2. Include Tailwind config inline (copy from existing overlay)
3. Include Socket.io client: `<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>`
4. Connect to Socket.io: `const socket = io('http://localhost:8080');`
5. Listen for events: `socket.on('tiktok:eventname', handleEvent);`
6. Use radio color palette and Poppins font
7. Implement animations with slideDownBounce/slideUpFade pattern
8. Test resolution at 1080x1920

### Adding a New TikTok Event

1. Add event listener in `server/serve.js` on `tiktokConnection`
2. Emit to all clients: `io.emit('tiktok:eventname', data);`
3. Add test event handler: `socket.on('test:eventname', ...)`
4. Update overlay to listen for new event
5. Add test button to controller/simulator

### Modifying Design System

Edit `tailwind.config.js` to add:
- Colors in `theme.extend.colors`
- Spacing in `theme.extend.spacing`
- Animations in `theme.extend.animation` and `theme.extend.keyframes`

Changes apply immediately (CDN Tailwind reads config inline in each HTML file).

## Important Notes

- **Server must be running** for overlays to work (Socket.io dependency)
- **TikTok username**: Must be exact username (without @), account must be live
- **Port conflicts**: Use `lsof -ti:8080 | xargs kill -9` to clear port
- **CORS**: Server enables CORS for OBS Browser Source compatibility
- **No npm dependencies in overlays**: Everything via CDN
- **Testing**: Use controller's test buttons or simulator before going live
- **Top 3 ranking**: Only updates when actual ranking positions/counts change (prevents spam)

### Managing JSON-Based Overlays

#### YouTube Carousel

```bash
# Edit YouTube configuration
code config/youtube-carousel.json
```

Example configuration:
```json
{
  "isVisible": true,
  "intervalSeconds": 30,
  "videos": [
    {
      "videoId": "dQw4w9WgXcQ",
      "location": "CANCÚN",
      "isEnabled": true
    },
    {
      "videoId": "jNQXAC9IVRw",
      "location": "PLAYA DEL CARMEN",
      "isEnabled": true
    }
  ]
}
```

Save the file - changes apply automatically within 5 seconds.

#### Logo

```bash
# Edit logo configuration
code config/logo.json
```

Example configuration:
```json
{
  "isVisible": true,
  "showText": true
}
```

**Common use cases**:
- `{"isVisible": true, "showText": false}` - Logo only (just the microphone icon)
- `{"isVisible": true, "showText": true}` - Logo with text
- `{"isVisible": false, "showText": false}` - Hidden

**No controller needed** - all overlays read directly from JSON files via HTTP fetch
