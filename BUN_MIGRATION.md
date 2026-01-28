# Migration Guide: PNPM to Bun

This document provides guidance for developers migrating from PNPM (or other package managers) to Bun.

## What Changed

This project has been migrated from PNPM to Bun as its package manager and JavaScript runtime.

### Removed Files
- `pnpm-lock.yaml` - replaced with `bun.lockb`

### New Files
- `bunfig.toml` - Bun configuration file
- `bun.lockb` - Bun's lockfile (binary format, **committed to git**)

### Updated Files
- `.gitignore` - no Bun-specific entries needed (bun.lockb is committed)
- `README.md` - updated with Bun instructions
- `package.json` - added `typecheck` script

## Command Mapping

| Old Command (PNPM)    | New Command (Bun)     | Description                    |
|-----------------------|-----------------------|--------------------------------|
| `pnpm install`        | `bun install`         | Install dependencies           |
| `pnpm add <package>`  | `bun add <package>`   | Add a package                  |
| `pnpm remove <pkg>`   | `bun remove <pkg>`    | Remove a package               |
| `pnpm run dev`        | `bun run dev`         | Run development server         |
| `pnpm run build`      | `bun run build`       | Build for production           |
| `pnpm run lint`       | `bun run lint`        | Run linter                     |
| `pnpm run preview`    | `bun run preview`     | Preview production build       |

## Key Differences

### 1. **Installation Speed**
Bun is significantly faster at installing packages compared to PNPM, NPM, or Yarn.

### 2. **Lockfile Format**
- Bun uses a binary lockfile (`bun.lockb`) which is more compact and faster to read
- The lockfile should be committed to version control

### 3. **Built-in TypeScript Support**
- Bun can run TypeScript files directly without compilation
- Example: `bun run script.ts`

### 4. **Native ESM Support**
- Bun has first-class ESM support
- No need for special configuration for ES modules

### 5. **Compatibility**
- Bun is designed to be a drop-in replacement for Node.js
- Most npm packages work without modification
- All dependencies in this project have been verified for Bun compatibility

## Getting Started

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install project dependencies**:
   ```bash
   bun install
   ```

3. **Start development**:
   ```bash
   bun run dev
   ```

## Troubleshooting

### Issue: "command not found: bun"
**Solution**: Restart your terminal or run `source ~/.bashrc` (or `~/.zshrc`) to refresh your PATH.

### Issue: Dependencies not installing
**Solution**: 
1. Remove `node_modules`: `rm -rf node_modules`
2. Remove lockfile: `rm bun.lockb`
3. Reinstall: `bun install`

### Issue: Package not compatible with Bun
**Solution**: Check the [Bun compatibility tracker](https://github.com/oven-sh/bun/issues) or file an issue.

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun GitHub Repository](https://github.com/oven-sh/bun)
- [Bun Discord Community](https://bun.sh/discord)
