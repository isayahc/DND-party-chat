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
