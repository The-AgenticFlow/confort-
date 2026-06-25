# Troubleshooting Guide

## Node Version Compatibility

**Error**: `npm WARN EBADENGINE Unsupported engine`

**Solution**: This project requires Node.js 20 or later. Install a compatible Node version:

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download directly from nodejs.org
```

Verify installation:
```bash
node --version  # Should be v20.x.x or higher
```

---

## ENOSPC: System limit for file watchers

**Error**: `ENOSPC: System limit for number of file watchers reached`

This error occurs on Linux systems when the number of open file watches exceeds the system limit.

### Quick Fix

**On Linux**, increase the inotify limit:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

To verify:
```bash
cat /proc/sys/fs/inotify/max_user_watches
```

### Why It Happens

- Vite watches project files for hot reload during development
- Large node_modules directories create many files to watch
- Linux systems have a default limit (usually 8192)

### What We Fixed

The `frontend/vite.config.js` now excludes directories from watching:
- `node_modules/**` - dependencies (largest source of files)
- `.git/**` - version control
- `dist/**` - build output
- `.venv/**` - Python virtual environments

These directories are ignored during development, reducing file watcher pressure.

---

## npm Audit Warnings

**Message**: `3 vulnerabilities (1 moderate, 2 high)`

**Context**: These are in development dependencies and ecosystem packages. The project builds and runs safely.

**Note**: Do not run `npm audit fix --force` as it may break dependencies. The vulnerabilities have been reviewed and are acceptable for this development setup.

---

## Common Solutions

| Issue | Solution |
|-------|----------|
| `npm install` hangs | Clear npm cache: `npm cache clean --force` |
| Port 5173 already in use | Kill process: `lsof -i :5173 \| grep LISTEN \| awk '{print $2}' \| xargs kill` |
| Git merge conflicts | Review `.gitignore` changes and resolve conflicts |
| Build fails locally but works in CI | Check Node version matches (≥20.0.0) |

---

## Development Setup

```bash
# 1. Verify Node version
node --version

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. In another terminal, run backend (from root directory)
cd ..
python -m uvicorn src.confort.api:app --reload

# 5. Open browser to http://localhost:5173
```

If you encounter issues, ensure:
1. Node 20+ is installed and active
2. Linux inotify limit is increased (524288+)
3. Port 5173 is available
4. Backend API is running on port 8000

---

## Still Having Issues?

1. Check `git log --oneline` to see recent changes
2. Review error messages carefully - they usually indicate the root cause
3. Clean reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Check system resources: `free -h` and `df -h`
