# Environment Variables Configuration

This document defines all environment variables required for Confort+ production deployment.

## Frontend Variables (Vercel)

Set these in **Vercel Project Settings → Environment Variables**:

### Required

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL for payment endpoints | `https://api.confort-pay.com` or `https://confort-api.vercel.app` | Yes |
| `VITE_MANAGER_PIN` | 4-digit PIN for manager portal access | `1234` | Yes |

### Optional

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `VITE_LOG_LEVEL` | Logging level for frontend | `debug`, `info`, `warn`, `error` | `info` |

## Backend Variables (API Service)

Set these in your backend deployment service (Vercel Functions, Render, Railway, etc.):

### Database (Supabase)

| Variable | Description | Source | Required |
|----------|-------------|--------|----------|
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for admin access | Supabase Dashboard → Project Settings → API | Yes |

**⚠️ Important:** Use **Service Role Key**, not the public anon key. The service role key allows direct database write access needed for transaction management.

### Payment Processing

#### CinetPay (Mobile Money - MTN, Orange)

| Variable | Description | Source | Required |
|----------|-------------|--------|----------|
| `CINETPAY_API_KEY` | CinetPay API key | CinetPay Dashboard → Settings → API Credentials | Yes |
| `CINETPAY_SITE_ID` | CinetPay Site ID | CinetPay Dashboard → Settings → Site Configuration | Yes |
| `CINETPAY_SECRET_KEY` | CinetPay secret key for webhook verification | CinetPay Dashboard → Settings → Security | Yes |

#### Binance Pay (Crypto Payments)

| Variable | Description | Source | Optional |
|----------|-------------|--------|----------|
| `BINANCE_API_KEY` | Binance Pay API key | Binance Merchant Dashboard → API Management | Optional |
| `BINANCE_SECRET_KEY` | Binance Pay secret key for webhook verification | Binance Merchant Dashboard → API Management | Optional |

### Application Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MANAGER_PIN` | Backend-side PIN for manager portal (should match VITE_MANAGER_PIN) | `1234` | Yes |
| `PRODUCTION_URL` | Production application URL | `https://confort-pay.com` | For QA testing |

### Optional Backend Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `ENVIRONMENT` | Deployment environment | `production`, `staging`, `development` | `production` |
| `LOG_LEVEL` | Backend logging level | `debug`, `info`, `warn`, `error` | `info` |
| `CORS_ORIGIN` | CORS allowed origin for frontend | `https://confort-pay.com` | All origins (*)  |
| `WEBHOOK_TIMEOUT` | Webhook timeout in seconds | `30` | `30` |
| `MAX_TRANSACTION_AMOUNT` | Maximum transaction amount in FCFA | `100000` | No limit |
| `MIN_TRANSACTION_AMOUNT` | Minimum transaction amount in FCFA | `100` | `100` |

## Getting Values for Each Service

### Step 1: Supabase Configuration

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Never use the anon key** — it has limited permissions. Always use Service Role key for backend.

### Step 2: CinetPay Configuration

1. Go to https://dashboard.cinetpay.com
2. Log in with merchant account
3. Navigate to **Settings** → **API Credentials** or **Integration**
4. Copy:
   - **API Key** → `CINETPAY_API_KEY`
   - **Site ID** → `CINETPAY_SITE_ID`
   - **API Secret** → `CINETPAY_SECRET_KEY`

### Step 3: Binance Pay Configuration (Optional)

1. Go to https://merchants.binance.com
2. Log in with merchant account
3. Navigate to **API Management**
4. Create or select an API key
5. Copy:
   - **API Key** → `BINANCE_API_KEY`
   - **Secret Key** → `BINANCE_SECRET_KEY`

## Frontend Local Development

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_MANAGER_PIN=1234
```

Run backend locally:
```bash
python -m uvicorn src.confort.api:app --host 0.0.0.0 --port 8000 --reload
```

Run frontend locally:
```bash
cd frontend
npm install
npm run dev
```

## Backend Local Development

Create `.env` in project root:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CINETPAY_API_KEY=your-api-key
CINETPAY_SITE_ID=your-site-id
CINETPAY_SECRET_KEY=your-secret-key
MANAGER_PIN=1234
```

## Environment Variable Validation

Before deploying, verify all variables:

### For Frontend
```bash
# Check Vercel environment variables
vercel env pull  # Downloads to .env.local

# Verify values are set
test -n "$VITE_API_BASE_URL" && echo "✓ VITE_API_BASE_URL" || echo "✗ Missing VITE_API_BASE_URL"
test -n "$VITE_MANAGER_PIN" && echo "✓ VITE_MANAGER_PIN" || echo "✗ Missing VITE_MANAGER_PIN"
```

### For Backend
```bash
# Check all required variables
for var in SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY CINETPAY_API_KEY CINETPAY_SITE_ID CINETPAY_SECRET_KEY MANAGER_PIN; do
  if [ -z "${!var}" ]; then
    echo "✗ Missing $var"
  else
    echo "✓ $var is set"
  fi
done
```

## Security Best Practices

1. **Never commit secrets to Git**
   - Add `.env` files to `.gitignore`
   - Vercel and other services auto-encrypt environment variables

2. **Use separate credentials for each environment**
   - Development: Test CinetPay account
   - Production: Live CinetPay account with different API keys

3. **Rotate secrets regularly**
   - Update CinetPay API keys quarterly
   - Update Supabase service role key if compromised

4. **Audit variable access**
   - Only team members who need deployment access should see environment variables
   - Vercel shows masked variables in logs for security

5. **Monitor API usage**
   - CinetPay: Check dashboard for unauthorized API calls
   - Supabase: Monitor database activity logs
   - Binance: Review transaction logs regularly

## Troubleshooting

### "SUPABASE_URL not found"
- Verify you've set the environment variable in your deployment service
- Check the value is exactly the project URL (starts with https://)
- Verify it matches the Supabase Dashboard → Project Settings → API

### "Invalid CinetPay credentials"
- Verify API key and secret key match (not reversed)
- Ensure you're using **API credentials**, not merchant account password
- Check credentials are from the correct CinetPay environment (test vs. live)

### "CORS error when calling backend API"
- Verify `VITE_API_BASE_URL` matches your actual backend domain
- Check backend CORS configuration includes frontend domain
- Verify HTTPS is used (not HTTP) in production

### "Webhook signature verification failed"
- Verify `CINETPAY_SECRET_KEY` matches the one in CinetPay dashboard
- Ensure webhook URL in CinetPay points to correct endpoint
- Check backend logs for signature calculation errors

---

**Environment Variables Guide Version**: 1.0
**Last Updated**: 2026-06-25
