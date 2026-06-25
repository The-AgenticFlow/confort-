# Confort+ — Anti-Fraud Payment & Session Management System

Confort+ is a modern, production-grade payment and session management system designed for secure, fraud-resistant customer interactions. Built with React (frontend) and FastAPI (backend), it integrates with CinetPay and Binance Pay for flexible payment options.

## 🎯 Key Features

- **Payment Processing**: Secure integration with CinetPay (mobile money) and Binance Pay (cryptocurrency)
- **Anti-Fraud Protection**: Multi-layered security including unique codes, screenshot-resistant hologram effects, and webhook signature verification
- **Manager Portal**: Secure code verification interface with PIN authentication
- **PWA Support**: Offline-capable Progressive Web App with service worker caching
- **Production Ready**: Comprehensive deployment documentation, security audits, and QA procedures

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
├── src/                        # FastAPI backend (Python)
│   └── confort/
│       ├── api.py              # API endpoints (payment, verification, webhooks)
│       ├── db.py               # Supabase database client
│       ├── code_generator.py    # Unique code generation
│       └── qr_generator.py      # QR code utility
│
├── tests/                      # Backend unit tests
└── DEPLOYMENT.md              # Production deployment guide
```

## 🚀 Local Development

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.9+ (backend)
- npm or yarn (frontend package manager)

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

```bash
# Install Python dependencies
pip install -r pyproject.toml

# Create .env file in project root
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_service_role_key
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SECRET_KEY=your_cinetpay_secret_key
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
```

**Start the backend**:
```bash
uvicorn src.confort.api:app --reload
```

The backend API will be available at `http://localhost:8000`.

### Testing

**Frontend**:
```bash
cd frontend
npm test
```

**Backend**:
```bash
pytest tests/
```

**Linting**:
```bash
cd frontend && npm run lint
ruff check src tests
ruff format --check src tests
```

## 🌐 Deployment

### Production Deployment Overview

Confort+ is designed for production deployment with:
- **Frontend**: Vercel hosting (PWA with automatic builds)
- **Backend**: FastAPI server (AWS, Railway, Render, or similar)
- **Database**: Supabase PostgreSQL
- **Payment Processing**: CinetPay and Binance Pay webhooks

### Quick Start Deployment

1. **Frontend Deployment (Vercel)**:
   - Fork/push to GitHub
   - Connect to Vercel project
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

2. **Backend Deployment**:
   - Deploy Python app to your preferred hosting (AWS, Railway, Render)
   - Set production environment variables
   - Configure webhooks with CinetPay and Binance Pay

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
