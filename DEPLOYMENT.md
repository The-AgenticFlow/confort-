# Confort+ Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Confort+ application to production on Vercel with CinetPay payment processing integration.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository access (https://github.com/The-AgenticFlow/confort-)
- CinetPay merchant account with API credentials
- Supabase project with production database
- Domain name (optional but recommended)

## Part 1: Vercel Setup

### Step 1.1: Create Vercel Project

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Select the GitHub repository: `The-AgenticFlow/confort-`
4. Vercel will auto-detect the project as a Vite application
5. Click "Deploy"

### Step 1.2: Configure Environment Variables

After deployment, go to **Project Settings** → **Environment Variables** and add the following:

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `VITE_API_BASE_URL` | `https://your-api-domain.com` or `https://your-vercel-domain.vercel.app` | Yes | Must match your backend API deployment |
| `VITE_MANAGER_PIN` | `1234` (or your chosen PIN) | Yes | 4-digit PIN for manager portal |

**Important:** These variables must be added to all environments (Production, Preview, Development).

### Step 1.3: Configure Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `confort-pay.com`)
3. Update DNS records according to Vercel's instructions
4. Enable auto-renewal for SSL certificate

## Part 2: Backend API Deployment

The backend Python API can be deployed using:
- **Option A**: Vercel Functions (serverless Python)
- **Option B**: Separate service (Render, Railway, PythonAnywhere)
- **Option C**: Docker container on cloud service

### Recommended: Option A - Vercel Functions

1. Create `api/` directory in root:
   ```bash
   mkdir -p api
   ```

2. Move your Python API to `api/webhooks/`:
   ```bash
   # Copy core modules to serverless functions
   cp src/confort/api.py api/webhooks/index.py
   ```

3. Create `api/webhooks/requirements.txt`:
   ```
   fastapi==0.104.1
   uvicorn==0.24.0
   supabase-py==2.0.0
   python-dotenv==1.0.0
   pydantic==2.5.0
   httpx==0.25.2
   ```

4. Update `api/webhooks/index.py` for Vercel:
   - Import `vercel_wsgi` handler
   - Remove development server code
   - Configure CORS for your domain

### Recommended: Option B - Separate Service

If you prefer a separate service for the Python backend:

1. Deploy to Render.com:
   - Create new Web Service
   - Connect GitHub repository
   - Set environment variables (see Section 3)
   - Render will build and deploy automatically

2. Or deploy to Railway.app:
   - Connect GitHub repository
   - Add environment variables
   - Railway will auto-deploy

## Part 3: Environment Variables Configuration

### Required Environment Variables

For both Vercel Frontend and Backend, configure these environment variables:

#### Supabase (Database)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### CinetPay (Payment Processing)
```
CINETPAY_API_KEY=your-api-key-here
CINETPAY_SITE_ID=your-site-id-here
CINETPAY_SECRET_KEY=your-secret-key-here
```

#### Binance Pay (Crypto Payments - Optional)
```
BINANCE_API_KEY=your-api-key-here
BINANCE_SECRET_KEY=your-secret-key-here
```

#### Application Configuration
```
VITE_API_BASE_URL=https://your-api-domain.com
VITE_MANAGER_PIN=1234
MANAGER_PIN=1234
```

**Security:** Use Vercel's environment variable encryption. Never commit secrets to Git.

## Part 4: CinetPay Webhook Configuration

### Step 4.1: Configure Production Webhook URL

1. Log into your CinetPay merchant dashboard: https://dashboard.cinetpay.com
2. Navigate to **Settings** → **Webhook Configuration**
3. Set **Production Webhook URL**:
   ```
   https://your-vercel-domain.vercel.app/api/webhook/cinetpay
   ```
   or your custom domain:
   ```
   https://your-domain.com/api/webhook/cinetpay
   ```

4. Leave webhook events as:
   - Transaction status change
   - Payment confirmed

5. **Save** the configuration

### Step 4.2: Test Webhook Connectivity

1. From CinetPay dashboard, click "Test Webhook"
2. Verify you receive HTTP 200 response
3. Check backend logs for the test webhook message

## Part 5: QR Code Generation & Printing

### Step 5.1: Generate QR Code

Run the QR code generator locally:
```bash
python src/confort/qr_generator.py https://your-vercel-domain.vercel.app
```

This will create `confort-qr-code.png` in the current directory.

### Step 5.2: Print & Display

1. Print the QR code on standard A4 paper
2. Size: at least 100mm × 100mm (4" × 4") for reliable scanning
3. Place at Confort+ lounge entrance or reception desk
4. Protect with glass or laminate to prevent damage

### Step 5.3: Verify QR Code Links to Production

Scan the printed QR code with a phone:
- Should open your production Confort+ app
- Should load without errors
- Should allow time slot selection

## Part 6: Network Configuration

### For Confort+ Lounge Owner: Configure Wi-Fi Router

Configure the lounge Wi-Fi with a "Walled Garden" / Domain Whitelist:

1. Log into your Wi-Fi router admin panel
2. Enable "Walled Garden" mode or "Captive Portal with Whitelist"
3. Add these domains to the whitelist:
   ```
   *.vercel.app (or your custom domain)
   *.cinetpay.com
   *.supabase.co
   *.binance.com
   api.vercel.com (optional, for analytics)
   ```

4. For edge cases, also whitelist:
   ```
   accounts.google.com (if using Google DNS)
   1.1.1.1 (Cloudflare DNS)
   8.8.8.8 (Google DNS)
   ```

5. **Save and apply** the configuration
6. Restart the Wi-Fi network
7. Test connectivity with a test device (see Part 7)

### Wi-Fi Network Settings

- **SSID**: `Confort+_Pay`
- **Security**: WPA2 or WPA3
- **Password**: Strong, 15+ characters
- **Bandwidth**: 5GHz recommended for better performance

## Part 7: End-to-End QA Testing

### Pre-Test Checklist

- [ ] Production app loads in browser at `https://your-domain`
- [ ] Manager portal accessible at `/manager` route
- [ ] Test phone connected to `Confort+_Pay` Wi-Fi
- [ ] CinetPay test account has MTN MoMo enabled
- [ ] 100 FCFA available for test payment
- [ ] Screenshots and documentation tools ready

### QA Test Flow

**Test 1: Welcome Screen Load**
1. Open `https://your-domain` on test phone
2. Verify welcome screen displays
3. Verify time slots load correctly
4. ✓ PASS if: Page loads in < 3 seconds

**Test 2: Time Selection & Slot Booking**
1. Select a time slot
2. Verify slot information displays (time, price: 500 FCFA)
3. ✓ PASS if: Smooth animation to next screen

**Test 3: Payment Initiation**
1. Click "Pay with MTN/Orange" button
2. Verify loading state with cyan spinner
3. Wait for transaction to be created
4. ✓ PASS if: Transaction ID received from backend

**Test 4: Receive Payment Code**
1. Make test payment of 100 FCFA via MTN MoMo
2. Wait for payment confirmation (up to 60 seconds)
3. Verify success screen displays
4. Verify hologram animation is visible (gradient + opacity changes)
5. Screenshot the code for fraud test
6. ✓ PASS if: Unique 4-digit code displayed

**Test 5: Manager Verification (First Attempt - Should Succeed)**
1. Go to manager portal: `https://your-domain/manager`
2. Enter PIN: `1234`
3. Enter the 4-digit code from test
4. Click "Verify"
5. Verify green screen flash animation
6. Verify "Code Verified!" message displays
7. ✓ PASS if: Success animation plays and code marked as USED

**Test 6: Manager Verification (Second Attempt - Should Fail)**
1. Click "Verify Next" button
2. Enter the same 4-digit code again
3. Click "Verify"
4. Verify red screen flash animation
5. Verify error message: "Code already used"
6. ✓ PASS if: Error animation plays, code rejection confirmed

**Test 7: Screenshot Fraud Check**
1. Compare live screenshot (from Test 4) with screenshot of running app
2. Verify they look visibly different
3. ✓ PASS if: Hologram animation makes static screenshot look different

**Test 8: Network Isolation Test**
1. Try visiting a non-whitelisted domain: `https://google.com`
2. Verify Wi-Fi captive portal blocks access or shows error
3. ✓ PASS if: Non-whitelisted domains are blocked

## Part 8: Troubleshooting

### Issue: "Cannot reach backend API"
- Verify `VITE_API_BASE_URL` is set correctly in Vercel
- Verify backend service is running and accessible
- Check CORS configuration in backend
- Verify firewall allows HTTPS traffic on port 443

### Issue: "CinetPay webhook not being called"
- Verify webhook URL in CinetPay dashboard is correct
- Test webhook from CinetPay dashboard ("Test Webhook" button)
- Check backend logs for webhook signature verification errors
- Verify `CINETPAY_API_KEY` and `CINETPAY_SECRET_KEY` are correct

### Issue: "Transaction not appearing in success screen"
- Verify Supabase connection is working
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Verify transaction table exists in Supabase
- Check backend logs for database errors

### Issue: "QR Code doesn't link to app"
- Verify URL in QR code is correct production domain
- Verify QR code was printed at sufficient size (100mm × 100mm minimum)
- Regenerate QR code if URL changed

### Issue: "Wi-Fi blocked valid domains"
- Verify whitelist includes all required domains
- Add wildcard entries (*.vercel.app) instead of specific domains
- Test whitelist with router manufacturer's tools

## Part 9: Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics**: Built-in, no configuration needed
2. **Error Tracking**: Configure in Vercel Dashboard
3. **Backend Logs**: Check service logs (Render, Railway, etc.)
4. **Database Monitoring**: Monitor Supabase query performance

### Regular Checks

- [ ] Daily: Review payment transactions in Supabase
- [ ] Weekly: Check error logs and fix issues
- [ ] Weekly: Verify Wi-Fi network is stable
- [ ] Monthly: Review payment processing fees with CinetPay
- [ ] Monthly: Update dependencies for security patches

### Backup & Recovery

- [ ] Enable automatic backups in Supabase
- [ ] Keep CinetPay and Binance API keys in secure vault
- [ ] Document all configuration in team wiki
- [ ] Test recovery procedures quarterly

## Support & Next Steps

For issues during deployment:
1. Check the troubleshooting section above
2. Review backend logs for error details
3. Contact Vercel support for infrastructure issues
4. Contact CinetPay support for payment processing issues

For enhancement requests:
1. Add custom domain branding
2. Configure email notifications for payments
3. Add SMS notifications for codes
4. Implement multi-language support

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2026-06-25
**Status**: Production Ready
