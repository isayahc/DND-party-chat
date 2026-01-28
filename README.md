# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Party Chat







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

## Prerequisites

This project uses [Bun](https://bun.sh) as its JavaScript runtime and package manager.

### Why Bun?

Bun is an all-in-one JavaScript runtime & toolkit designed for speed:
- **Fast package installation** - significantly faster than npm/yarn/pnpm
- **Built-in TypeScript support** - no need for ts-node
- **Native bundler** - built-in bundler, transpiler, and task runner
- **Drop-in replacement** - compatible with Node.js and npm packages

### Installing Bun

To install Bun, run:

```bash
curl -fsSL https://bun.sh/install | bash
```

Or on Windows:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

For more installation options, visit [https://bun.sh](https://bun.sh)

## Running the project

```bash
cd dnd-party-chat
bun install
bun run dev
```

## Available Scripts

- `bun run dev` - Start development server with HMR
- `bun run build` - Build for production (includes type checking)
- `bun run typecheck` - Run TypeScript type checking
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

## Dependency Compatibility

All dependencies in this project are fully compatible with Bun:

### Runtime Dependencies
- **react** (^19.0.0) - ✅ Fully supported
- **react-dom** (^19.0.0) - ✅ Fully supported

### Development Dependencies
- **vite** (^6.2.0) - ✅ Fully supported, runs natively with Bun
- **typescript** (~5.7.2) - ✅ Fully supported, Bun has built-in TS transpiler
- **eslint** (^9.21.0) - ✅ Fully supported
- All other dev dependencies - ✅ Fully supported
