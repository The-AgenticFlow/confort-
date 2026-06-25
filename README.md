# Confort+ — Anti-Fraud Payment & Session Management System

Confort+ is a modern, production-grade payment and session management system designed for secure, fraud-resistant customer interactions. Built with React (frontend) and Rust/Actix-web (backend), it integrates with Fapshi and Binance Pay for flexible payment options.

## 🎯 Key Features

- **Payment Processing**: Secure integration with Fapshi (mobile money) and Binance Pay (cryptocurrency)
- **Anti-Fraud Protection**: Multi-layered security including unique codes, screenshot-resistant hologram effects, and webhook signature verification
- **Manager Portal**: Secure code verification interface with PIN authentication
- **PWA Support**: Offline-capable Progressive Web App with service worker caching
- **Multi-Language Support**: French as primary language with English fallback (powered by react-i18next)
- **Production Ready**: Comprehensive deployment documentation, security audits, and QA procedures

## 🌐 Language Support

The application is fully localized in French, with English available as a fallback. All UI text, buttons, labels, and messages display in French by default. The localization system uses [react-i18next](https://react.i18next.com/) for easy maintenance and potential future language additions.

Supported languages:
- 🇫🇷 Français (Primary)
- 🇬🇧 English (Fallback)

## 📋 Project Structure

```
├── frontend/                    # React-based customer app
│   ├── src/
│   │   ├── components/         # UI components (Payment, SuccessScreen, Manager Portal)
│   │   ├── lib/                # API client functions
│   │   ├── __tests__/          # Frontend unit tests
│   │   └── main.jsx            # App entry point
│   ├── package.json
│   └── vite.config.js
│
├── src/                        # Rust backend (Actix-web)
│   ├── main.rs                 # HTTP server, routes, middleware
│   ├── config.rs               # Environment variable loading
│   ├── handlers.rs             # API endpoints (payment, verification, webhooks)
│   ├── db.rs                   # Supabase HTTP REST API client
│   ├── models.rs               # Request/Response schemas
│   ├── crypto.rs               # HMAC-SHA256 signature verification
│   ├── code_gen.rs             # 4-char unique code generation
│   └── lib.rs                  # Library module exports
│
├── tests/                      # Integration & crypto tests
├── Cargo.toml                  # Rust project manifest
└── DEPLOYMENT.md              # Production deployment guide
```

## 🚀 Local Development

### Prerequisites

- Node.js 18+ (frontend)
- Rust 1.70+ (backend)
- npm or yarn (frontend package manager)
- Cargo (Rust build system)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

**Environment Variables** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:8000
VITE_MANAGER_PIN=1234
```

### Backend Setup

**Create .env file in project root**:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
FAPSHI_API_USER=your_fapshi_api_user
FAPSHI_API_KEY=your_fapshi_api_key
FAPSHI_WEBHOOK_SECRET=your_fapshi_webhook_secret
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
CORS_ORIGIN=http://localhost:5173
```

**Build and run the backend**:
```bash
# Build dependencies and server
cargo build --release

# Run the server
cargo run --release
```

The backend API will be available at `http://localhost:8000`. The release build produces a single deployable binary in `target/release/confort` (~7.3MB) with no Python runtime required.

### Testing

**Frontend**:
```bash
cd frontend
npm test
```

**Backend** (38 tests):
```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test suite
cargo test crypto
cargo test integration
```

**Frontend Linting**:
```bash
cd frontend && npm run lint
```

## 🌐 Deployment

### Production Deployment Overview

Confort+ is designed for production deployment with:
- **Frontend**: Vercel hosting (PWA with automatic builds)
- **Backend**: Compiled Rust binary (AWS, Railway, Render, DigitalOcean, or similar)
- **Database**: Supabase PostgreSQL
- **Payment Processing**: CinetPay and Binance Pay webhooks

### Quick Start Deployment

1. **Frontend Deployment (Vercel)**:
   - Fork/push to GitHub
   - Connect to Vercel project
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

2. **Backend Deployment**:
   - Build release binary: `cargo build --release`
   - Deploy `target/release/confort` binary to your hosting platform
   - Set production environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, API keys, etc.)
   - Configure webhooks with CinetPay and Binance Pay
   - Run binary: `./confort` (listens on 0.0.0.0:8000)

3. **Complete Setup**:
   See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive step-by-step instructions.

### Environment Variables for Production

**Frontend** (set in Vercel):
- `VITE_API_BASE_URL`: Production API URL
- `VITE_MANAGER_PIN`: Manager authentication PIN

**Backend** (set on server):
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Service Role Key
- `CINETPAY_API_KEY`: CinetPay API key
- `CINETPAY_SECRET_KEY`: CinetPay secret key
- `BINANCE_API_KEY`: Binance API key
- `BINANCE_SECRET_KEY`: Binance secret key
- `CORS_ORIGIN`: Production frontend URL

## 🔒 Security Features

- **HTTPS/TLS**: All endpoints require HTTPS in production
- **Webhook Verification**: SHA256 HMAC signature verification for payment webhooks
- **Database Security**: Service Role Key isolation, no hardcoded secrets
- **API Security**: CORS configured for production domain only, rate limiting on sensitive endpoints
- **Code Security**: Unique 4-character codes, one-time use validation
- **Screenshot Prevention**: Animated hologram effects that appear different in screenshots
- **PIN Protection**: Manager portal secured with configurable PIN

## 📱 API Endpoints

### Customer App
- `POST /api/initiate` — Initiate payment, create transaction
- `GET /api/transaction/{id}` — Get transaction details and generated code
- `POST /api/webhook/cinetpay` — CinetPay payment confirmation webhook
- `POST /api/webhook/crypto` — Binance Pay payment confirmation webhook

### Manager Portal
- `POST /api/verify-code` — Verify code and transition from PAID to USED

## 🧪 Testing & QA

Complete QA testing guide available in [QA_TEST_GUIDE.md](./QA_TEST_GUIDE.md).

Key test scenarios:
1. Payment flow (initiation → confirmation → code display)
2. Code verification (valid, already-used, invalid)
3. Fraud prevention (code reuse rejection, screenshot resistance)
4. Network isolation (Wi-Fi whitelist validation)
5. Error handling (network failures, timeout scenarios)

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Comprehensive deployment guide
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) — Environment variable reference
- [PRODUCTION_SECURITY.md](./PRODUCTION_SECURITY.md) — Security audit checklist
- [FRAUD_PREVENTION.md](./FRAUD_PREVENTION.md) — Fraud vectors and prevention strategies
- [QA_TEST_GUIDE.md](./QA_TEST_GUIDE.md) — Complete QA testing procedures
- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) — Acceptance criteria verification

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Push to branch: `git push origin feature/your-feature`
4. Create a pull request

## 📄 License

MIT
