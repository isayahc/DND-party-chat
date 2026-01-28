# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Party Chat

A real-time voice and text chat application for D&D parties, enabling players to communicate during their gaming sessions.

### Features

#### Voice Call
- **WebRTC-based voice communication**: Real-time peer-to-peer audio communication
- **Join/Leave calls**: Easily connect and disconnect from voice channels
- **Mute/Unmute**: Control your microphone with a single click
- **Participant list**: See who's currently in the voice call
- **Error handling**: Clear feedback when microphone access is not available

#### Text Chat
- **Real-time messaging**: Instant message delivery using WebSocket (Socket.IO)
- **Room-based chat**: Organize conversations by room
- **System notifications**: Get notified when users join or leave
- **Message history**: See all messages in the current session
- **Timestamps**: Track when messages were sent
- **Auto-scroll**: Automatically scroll to the latest messages

### Technical Stack

**Frontend:**
- React 19 with TypeScript
- Socket.IO Client for WebSocket communication
- WebRTC for peer-to-peer voice calls
- Vite for build tooling

**Backend:**
- Express server
- Socket.IO for real-time communication
- WebRTC signaling server for establishing peer connections

### Architecture

The application uses a client-server architecture:
- **Frontend**: React application running on port 5173 (development)
- **Backend**: Express/Socket.IO server running on port 3001

The voice calls use WebRTC for direct peer-to-peer communication, with the server acting as a signaling server to exchange connection information (offers, answers, and ICE candidates).







## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

## Running the project

### Prerequisites
This project uses [Bun](https://bun.sh) as the JavaScript runtime and package manager.

### Installation
1. Install Bun (if not already installed):
```bash
curl -fsSL https://bun.sh/install | bash
```

2. Install dependencies:
```bash
cd dnd-party-chat
bun install
```

3. (Optional) Configure environment variables:
```bash
cp .env.example .env
# Edit .env to customize server URL and port if needed
```

### Development
Start the development server:
```bash
bun run dev
```

### Build
Build the project for production:
```bash
bun run build
```

### Linting
Run the linter:
```bash
bun run lint
```

### Preview
Preview the production build:
```bash
bun run preview
```

### Storybook
Storybook is set up for isolated component development and testing.

#### Start Storybook
Run Storybook in development mode:
```bash
npm run storybook
```

The Storybook UI will be available at `http://localhost:6006`.

#### Build Storybook
Build a static version of Storybook:
```bash
npm run build-storybook
```

#### Available Components
- **ChatMessage**: Display chat messages with sender, character name, and timestamp
- **VoiceCallControls**: Voice call controls with mute, call, and speaker buttons

#### Testing Components
Storybook includes several addons:
- **Accessibility (a11y)**: Automatically checks components for accessibility issues
- **Docs**: Auto-generated documentation for components
- **Vitest**: Test integration for components

To run component tests:
```bash
npx vitest --project=storybook
```

## Deploying to Railway

Railway is a cloud platform that makes deploying applications simple. This project is configured for deployment on Railway.

### Prerequisites

1. A [Railway](https://railway.app) account
2. The Railway CLI (optional, for local testing)
3. Your GitHub repository connected to Railway

### Deployment Steps

#### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Create a New Project**
   - Log in to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `isayahc/DND-party-chat`

2. **Configure the Backend Service**
   - Railway will automatically detect the configuration from `railway.json` and `Procfile`
   - Go to your project's backend service settings
   - Add the following environment variables:
     ```
     PORT=(leave empty, Railway will auto-assign)
     CLIENT_URL=https://your-frontend-url.railway.app
     NODE_ENV=production
     ```
   - Set the **Start Command**: `bun run start`
   - Set the **Build Command**: `bun install && bun run build`

3. **Configure the Frontend Service (Separate Deployment)**
   - For the frontend, you'll need a separate deployment
   - You can either:
     - Deploy a static version using `railway.json` build configuration
     - Or host the frontend on a service like Vercel/Netlify and point `VITE_SOCKET_URL` to Railway backend
   
4. **Update Environment Variables**
   - Once both services are deployed, update the environment variables with actual URLs:
   - Backend `CLIENT_URL`: Your frontend URL (e.g., `https://your-frontend.railway.app`)
   - Frontend `VITE_SOCKET_URL`: Your backend URL (e.g., `https://your-backend.railway.app`)

5. **Deploy**
   - Railway will automatically deploy when you push changes to your connected branch
   - The backend will be accessible at the Railway-provided URL
   - WebSocket and WebRTC will work automatically with the deployed URLs

#### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway Project**
   ```bash
   railway init
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set PORT=
   railway variables set CLIENT_URL=https://your-frontend-url.railway.app
   railway variables set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Environment Variables for Railway

For the **backend service**, configure these variables in Railway:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `PORT` | Server port (auto-assigned by Railway, leave empty) | - |
| `CLIENT_URL` | Frontend URL(s), comma-separated for multiple origins | `https://your-app.railway.app` |
| `NODE_ENV` | Environment mode | `production` |

For the **frontend service** (if hosted separately), configure:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_SOCKET_URL` | Backend WebSocket server URL | `https://your-backend.railway.app` |

### WebSocket and WebRTC Configuration

The application is configured to automatically work with Railway's dynamic URLs:

- **WebSocket**: The backend server uses the `PORT` environment variable provided by Railway
- **WebRTC Signaling**: The signaling server runs on the same backend port and handles peer connections
- **CORS**: The backend accepts connections from the `CLIENT_URL` environment variable

### Post-Deployment Verification

1. **Check Backend Health**
   - Visit: `https://your-backend.railway.app/health`
   - Should return: `{"status":"ok"}`

2. **Test WebSocket Connection**
   - Open your frontend URL
   - Open browser console
   - You should see successful WebSocket connection logs

3. **Test Voice and Text Chat**
   - Join a room with a username
   - Send test messages
   - Try voice call functionality with another device/browser

### Troubleshooting

**WebSocket Connection Failed**
- Verify `VITE_SOCKET_URL` points to your Railway backend URL
- Check Railway backend logs for errors
- Ensure `CLIENT_URL` includes your frontend URL

**CORS Errors**
- Add your frontend URL to `CLIENT_URL` environment variable
- For multiple origins, use comma-separated list: `https://app1.com,https://app2.com`

**WebRTC Not Working**
- WebRTC uses the signaling server to establish connections
- Check browser console for WebRTC errors
- Ensure microphone permissions are granted
- Test in an incognito window to rule out extension conflicts

**Build Failures**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally: `bun run build`

### Continuous Deployment

Railway automatically deploys when you push to your connected GitHub branch:
1. Make changes locally
2. Commit and push to GitHub
3. Railway detects changes and redeploys automatically
4. Monitor deployment in Railway dashboard

### Cost Considerations

- Railway offers a free tier with limitations
- Backend runs continuously to handle WebSocket connections
- Monitor usage in Railway dashboard
- Consider using Railway's sleep feature for development deployments
