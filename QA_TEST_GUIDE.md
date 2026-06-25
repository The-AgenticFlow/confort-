# Confort+ Production QA Testing Guide

## Overview

This guide provides comprehensive procedures for testing the Confort+ application in production, with emphasis on end-to-end payment flows, fraud prevention validation, and network isolation verification.

## Pre-Test Setup

### Prerequisites

- **Test Phone**: Android or iOS device (WiFi-only for testing)
- **MTN or Orange Account**: With mobile money (MoMo) enabled
- **Test Funds**: 100 FCFA minimum (actual payment to test)
- **Manager Device**: Separate device with access to manager portal
- **Printers & Lamination**: For QR code testing (if applicable)
- **Network Access**: To lounge Wi-Fi and backend services
- **Documentation Tools**: Phone/camera for screenshots, notepad for timing

### Test Environment

| Component | URL | Notes |
|-----------|-----|-------|
| Production App | https://your-domain.com | Main customer-facing app |
| Manager Portal | https://your-domain.com/manager | PIN-protected |
| CinetPay Dashboard | https://dashboard.cinetpay.com | Monitor transactions |
| Supabase Dashboard | https://app.supabase.com | View transaction records |
| Wi-Fi Network | Confort+_Pay | Whitelist-restricted |

## Test Procedures

### Test Group 1: App Loading & Basic Navigation

#### Test 1.1: App Loads Under Restricted Wi-Fi
**Objective**: Verify the PWA loads correctly on restricted lounge Wi-Fi

1. Connect test phone to `Confort+_Pay` Wi-Fi
2. Open browser (Chrome, Safari, or WebView)
3. Navigate to https://your-domain.com
4. Record load time from first request to fully interactive
5. Verify all UI elements render correctly:
   - Welcome screen displays
   - Time slots load from backend
   - "Pay" button is clickable
6. Check browser console for any JavaScript errors

**Expected Results**:
- ✓ Page loads in < 3 seconds
- ✓ No JavaScript errors in console
- ✓ All UI elements visible and styled correctly
- ✓ Welcome screen displays "Select a time slot"

**Pass Criteria**: All above criteria met

---

#### Test 1.2: Time Slot Selection & Display
**Objective**: Verify time slots render and can be selected

1. On welcome screen, tap/click a time slot (e.g., "2:00 PM")
2. Observe animation and transition to payment screen
3. Verify payment screen displays:
   - Selected time slot (e.g., "2:00 PM - 3:00 PM")
   - Amount in FCFA (e.g., "500 FCFA")
   - "Mobile Money" tab (selected by default)
   - "Crypto" tab

**Expected Results**:
- ✓ Time slot displays correctly
- ✓ Amount displays (500 FCFA standard)
- ✓ Smooth animation to next screen
- ✓ Payment tabs are interactive

**Pass Criteria**: All above criteria met

---

### Test Group 2: Payment Processing & Code Generation

#### Test 2.1: Mobile Money Payment Initiation
**Objective**: Verify payment initiation and code generation

**Prerequisites**:
- MTN or Orange mobile money account active
- 100 FCFA available for test payment
- Connected to Confort+_Pay Wi-Fi

**Procedure**:
1. On payment screen, click "Pay with MTN/Orange"
2. Observe:
   - Loading spinner displays with "Waiting for payment confirmation..."
   - Spinner animation (cyan color, smooth rotation)
   - Loading text is visible
3. Time the payment confirmation wait (should be < 60 seconds for immediate payment)
4. Receive payment request on phone
5. Complete payment via MTN/Orange app (100 FCFA)
6. Return to Confort+ app

**Expected Results**:
- ✓ Loading spinner displays after clicking "Pay"
- ✓ Loading state shows "Waiting for payment confirmation..."
- ✓ Loading persists until payment is confirmed (< 60 seconds for successful payment)
- ✓ Success screen appears after payment confirmation

**Pass Criteria**: All above criteria met

---

#### Test 2.2: Code Display & Verification
**Objective**: Verify 4-digit code is generated and displayed correctly

**Procedure**:
1. After payment success, observe success screen:
   - Cyan flash animation on entry
   - SVG checkmark drawn/animated
   - 4-digit code displayed in large text
   - Code should be uppercase (e.g., "AB2D")
   - Hologram animation: gradient scanning + opacity oscillation
   - Text below code: "Show this code to the Manager to start your session."
2. **Screenshot the code on phone screen** (will be used for fraud test)
3. Record the exact code value (note it down)

**Expected Results**:
- ✓ Cyan flash animation visible on entry
- ✓ Checkmark animation plays (SVG path animation, ~0.8s)
- ✓ 4-digit code displays in large, bold font (7rem)
- ✓ Code is exactly 4 alphanumeric characters, uppercase
- ✓ Code excludes O, I, 0, 1 (only letters/numbers: 2-9, A-H, J-N, P-Z)
- ✓ Hologram animation visible (gradient + opacity changes)
- ✓ Screenshot differs visibly from live animation

**Pass Criteria**: All above criteria met. Code value recorded.

---

### Test Group 3: Manager Portal Verification

#### Test 3.1: Manager Portal Access (First Attempt - Should Succeed)
**Objective**: Verify manager can access portal and verify codes

**Prerequisites**:
- Manager device with browser access
- PIN: 1234 (or configured PIN)
- Code from Test 2.2

**Procedure**:
1. On manager device, open https://your-domain.com/manager
2. Enter PIN: 1234
3. Observe:
   - PIN entry field (dots/asterisks, not plaintext)
   - Submit button
4. Click Submit or press Enter
5. Verify manager screen appears with code input field
6. Enter the 4-digit code from Test 2.2 (e.g., "AB2D")
7. Code should auto-convert to uppercase as typed
8. Click "Verify" or press Enter
9. Observe success animation:
   - Green screen flash
   - Bouncing checkmark SVG
   - "Code Verified!" message in green
   - "Verify Next" button

**Expected Results**:
- ✓ PIN screen displays with asterisked input
- ✓ Correct PIN grants access to manager screen
- ✓ Code input field is visible
- ✓ Code input auto-converts to uppercase
- ✓ Green flash animation plays on successful verification
- ✓ "Code Verified!" message displays in green
- ✓ Checkmark bounces (Framer Motion animation)
- ✓ "Verify Next" button appears

**Pass Criteria**: All above criteria met. Code successfully verified.

---

#### Test 3.2: Fraud Test - Code Reuse Prevention (Second Attempt - Should Fail)
**Objective**: Verify code cannot be reused (fraud prevention)

**Procedure** (immediately after Test 3.1):
1. Click "Verify Next" button on manager screen
2. Code input field clears, ready for next code
3. Enter the **same code from Test 2.2** again
4. Click "Verify"
5. Observe error animation:
   - Red screen flash
   - Horizontal shake animation on input field
   - Error message: "Code already used" in red text
   - Error message remains visible for ~2 seconds

**Expected Results**:
- ✓ Form clears after "Verify Next"
- ✓ Same code is entered again
- ✓ Red screen flash appears
- ✓ Input field shakes (horizontal animation)
- ✓ Error message displays: "Code already used"
- ✓ Error is in red text color
- ✓ Error message auto-clears or can be dismissed

**Pass Criteria**: All above criteria met. Fraud prevention confirmed - same code cannot be verified twice.

---

### Test Group 4: Anti-Fraud Screenshot Validation

#### Test 4.1: Screenshot Comparison (Live vs. Screenshot)
**Objective**: Verify screenshot looks different from live hologram animation

**Prerequisites**:
- Screenshot from Test 2.2 on hand
- Live app still running success screen with hologram animation

**Procedure**:
1. Take screenshot of live success screen (code still displayed with animation)
2. Compare live animation with screenshot from Test 2.2:
   - **Gradient Animation**: Live screen should show vertical gradient moving up/down
   - **Opacity Animation**: Live code should oscillate between bright and slightly dim
   - **Screenshot**: Should be static - no animation visible
3. Observe differences:
   - Live: Gradient position should be different from screenshot gradient position
   - Live: Code opacity should change (oscillate)
   - Screenshot: No gradient movement, static opacity

**Expected Results**:
- ✓ Live animation shows visible gradient movement
- ✓ Live animation shows opacity oscillation
- ✓ Screenshot appears static by comparison
- ✓ Side-by-side comparison clearly shows difference

**Pass Criteria**: Observer can clearly distinguish live animation from static screenshot.

---

### Test Group 5: Network Isolation & Security

#### Test 5.1: Wi-Fi Domain Whitelist Verification
**Objective**: Verify Wi-Fi restricts access to whitelisted domains only

**Procedure**:
1. On test phone connected to Confort+_Pay Wi-Fi:
2. Try accessing a non-whitelisted domain:
   ```
   https://google.com
   https://facebook.com
   https://example.com
   ```
3. Observe result (should NOT load or show blocked message)
4. Try accessing whitelisted domains:
   ```
   https://your-domain.com (app domain)
   https://your-project.supabase.co (backend)
   https://api.cinetpay.com (payment processor)
   ```
5. Observe result (should load successfully)

**Expected Results**:
- ✓ Non-whitelisted domains are blocked or show error page
- ✓ Whitelisted domains load successfully
- ✓ Error/blocked message appears for unauthorized domains
- ✓ No direct "forbidden" error leaks information

**Pass Criteria**: Whitelist is working - only approved domains accessible.

---

#### Test 5.2: Network Isolation (No Direct Internet Access)
**Objective**: Verify lounge clients cannot access unrestricted internet

**Procedure**:
1. On test phone connected to Confort+_Pay Wi-Fi
2. Try to open browser home page (usually shows ISP redirect or portal)
3. Observe captive portal or whitelist restriction message
4. Verify only whitelisted services are accessible

**Expected Results**:
- ✓ Unrestricted internet not accessible
- ✓ Captive portal or whitelist message displays
- ✓ Users must explicitly visit Confort+ app URL
- ✓ Cannot browse arbitrary websites

**Pass Criteria**: Network isolation confirmed - clients restricted to whitelisted domains.

---

### Test Group 6: Error Handling & Edge Cases

#### Test 6.1: Invalid Code Entry
**Objective**: Verify manager portal rejects invalid codes

**Procedure**:
1. Go to manager portal, enter correct PIN
2. Enter a non-existent code (e.g., "XXXX")
3. Click "Verify"

**Expected Results**:
- ✓ Red screen flash animation
- ✓ Error message displays: "Invalid code"
- ✓ Input field becomes ready for next attempt
- ✓ Error clears automatically or on new input

**Pass Criteria**: Invalid code rejected with appropriate error.

---

#### Test 6.2: Wrong Manager PIN
**Objective**: Verify PIN authentication prevents unauthorized access

**Procedure**:
1. Go to manager portal
2. Enter wrong PIN (e.g., "9999" instead of "1234")
3. Click Submit or press Enter

**Expected Results**:
- ✓ Input field shakes (horizontal animation)
- ✓ Red flash animation (optional)
- ✓ Error message displays: "Incorrect PIN" or similar
- ✓ PIN entry field remains (doesn't proceed to code screen)
- ✓ Can try again with correct PIN

**Pass Criteria**: Wrong PIN blocked, can retry with correct PIN.

---

#### Test 6.3: Payment Timeout (Negative Case)
**Objective**: Verify app handles payment timeout gracefully

**Procedure**:
1. Start payment process ("Pay with MTN/Orange")
2. DO NOT complete the payment within 60 seconds
3. Observe app behavior after timeout

**Expected Results**:
- ✓ Loading spinner eventually stops or shows error
- ✓ Error message displays (e.g., "Payment timeout. Please try again.")
- ✓ User can click "Try Again" or go back
- ✓ No stuck loading state
- ✓ App remains responsive

**Pass Criteria**: Timeout handled gracefully, not stuck indefinitely.

---

### Test Group 7: Performance & UX

#### Test 7.1: App Performance Metrics
**Objective**: Verify app meets performance requirements

**Procedure** (use browser dev tools):
1. Open browser DevTools (F12 or Cmd+Opt+I)
2. Go to Network tab
3. Reload app (Ctrl+Shift+R or Cmd+Shift+R for hard reload)
4. Measure:
   - **Initial Load Time**: Time to interactive (should be < 3s)
   - **Asset Size**: Total transferred (should be < 1MB)
   - **Gzip Compression**: CSS/JS should show gzipped size
5. Perform payment flow, measure:
   - **API Response Time**: /api/initiate response time (should be < 1s)
   - **Polling Latency**: /api/transaction/{id} polling (should be < 500ms)

**Expected Results**:
- ✓ Initial load time < 3 seconds on 4G
- ✓ Total asset size < 1 MB
- ✓ Assets are gzip-compressed
- ✓ API responses < 1 second
- ✓ Polling response < 500ms
- ✓ Smooth animations (no jank)

**Pass Criteria**: All performance metrics met.

---

#### Test 7.2: Offline Behavior
**Objective**: Verify Service Worker caches UI shell

**Procedure**:
1. Load app fully (online)
2. Go to DevTools → Application → Service Workers
3. Verify Service Worker is registered and activated
4. Go to Cache Storage, verify SW cache contents
5. Disconnect from network (airplane mode or disable Wi-Fi)
6. Reload app

**Expected Results**:
- ✓ Service Worker is active and registered
- ✓ Cache Storage shows static assets
- ✓ Offline app loads static shell (welcome screen, UI)
- ✓ API calls fail gracefully (no white screen)
- ✓ Reconnecting restores functionality

**Pass Criteria**: Service Worker properly caches UI shell for offline access.

---

## Test Results Summary

Use this table to record test results:

| Test | Result | Notes |
|------|--------|-------|
| 1.1 - App loads on restricted Wi-Fi | ✓ PASS / ✗ FAIL | |
| 1.2 - Time slot selection | ✓ PASS / ✗ FAIL | |
| 2.1 - Mobile money initiation | ✓ PASS / ✗ FAIL | Time: __ seconds |
| 2.2 - Code display & generation | ✓ PASS / ✗ FAIL | Code: __ |
| 3.1 - Manager verification (first) | ✓ PASS / ✗ FAIL | |
| 3.2 - Fraud test (code reuse) | ✓ PASS / ✗ FAIL | |
| 4.1 - Screenshot validation | ✓ PASS / ✗ FAIL | |
| 5.1 - Domain whitelist | ✓ PASS / ✗ FAIL | |
| 5.2 - Network isolation | ✓ PASS / ✗ FAIL | |
| 6.1 - Invalid code error | ✓ PASS / ✗ FAIL | |
| 6.2 - Wrong PIN error | ✓ PASS / ✗ FAIL | |
| 6.3 - Payment timeout | ✓ PASS / ✗ FAIL | |
| 7.1 - Performance metrics | ✓ PASS / ✗ FAIL | |
| 7.2 - Offline behavior | ✓ PASS / ✗ FAIL | |

**Overall Result**: _____ (All Pass / Some Failures)

---

## Failure Handling

If any test fails:

1. **Document the failure**:
   - Exact test name and step number
   - What was expected vs. what happened
   - Error message or screenshot
   - Timestamp of failure

2. **Investigate root cause**:
   - Check Vercel deployment logs
   - Check Supabase transaction logs
   - Check CinetPay dashboard for webhook status
   - Review browser console errors

3. **Report to development**:
   - Create issue in GitHub
   - Include test results, screenshots, and error logs
   - Note environment and device used

4. **Retest after fix**:
   - Run full test suite again after fix deployed
   - Document re-test results

---

## Sign-Off

**Test Conducted By**: _________________ **Date**: _________

**Environment**: Production URL: ________________

**Test Phone**: _________________ **OS**: _________

**Manager Device**: _________________ **OS**: _________

**Network**: _________________ **Signal**: _________

**Overall Status**: ✓ PASS / ✗ FAIL

**Sign-Off**: _________________ (Tester) _________________ (Manager)

---

**QA Test Guide Version**: 1.0
**Last Updated**: 2026-06-25
**Status**: Ready for Production Testing
