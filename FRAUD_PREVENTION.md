# Fraud Prevention & Recovery Procedures

This document outlines fraud prevention mechanisms built into Confort+ and procedures for handling edge cases and fraud attempts.

## Anti-Fraud Architecture

### Layer 1: Payment Verification

**Mechanism**: Signature Verification on Webhooks
- **How it works**: CinetPay and Binance webhooks include cryptographic signatures
- **Verification**: SHA256 HMAC with timing-attack-resistant comparison (hmac.compare_digest)
- **Impact**: Prevents spoofed payment notifications
- **Test coverage**: test_webhook_cinetpay_invalid_signature, test_webhook_crypto_invalid_signature

**Fraud Risk Addressed**:
- ✓ Fake payment webhooks
- ✓ Webhook replay attacks
- ✓ Payment notification spoofing

### Layer 2: Code-Based Fraud Prevention

**Mechanism**: One-Time-Use Code System
- **How it works**: 
  1. Customer completes payment → receives unique 4-digit code
  2. Manager scans/enters code to verify payment
  3. Code transitions from PAID → USED status
  4. Second verification of same code is rejected
- **Code Format**: 4 alphanumeric characters, excludes O/I/0/1 (54^4 = 8.4M combinations)
- **Test coverage**: test_verify_code_already_used, test_verify_code_transitions_paid_to_used

**Fraud Risk Addressed**:
- ✓ Code reuse attacks
- ✓ Sharing codes between sessions
- ✓ Manager fraud (marking unauthorized sessions as paid)

### Layer 3: Screenshot-Resistant Display

**Mechanism**: Hologram Animation
- **How it works**:
  1. **Gradient Animation**: Vertical gradient (cyan color) scans up/down continuously (3s cycle)
  2. **Opacity Oscillation**: Code text oscillates between 0.8 and 1.0 opacity (2s cycle)
  3. **Combined Effect**: Static screenshot looks different from live animation
- **Purpose**: Makes screenshot invalid as proof of payment
- **Test coverage**: Test 4.1 in QA_TEST_GUIDE.md

**Fraud Risk Addressed**:
- ✓ Sharing screenshots as fake proof
- ✓ Screenshot → Photoshop → fake code presentation
- ✓ Offline code generation

### Layer 4: Manager Authentication

**Mechanism**: PIN-Protected Manager Portal
- **How it works**: 
  1. Manager enters 4-digit PIN to access verification portal
  2. PIN must match configured value in environment
  3. Only authenticated manager can verify codes
- **Configuration**: VITE_MANAGER_PIN and MANAGER_PIN environment variables
- **Test coverage**: Test 3.1 in QA_TEST_GUIDE.md

**Fraud Risk Addressed**:
- ✓ Unauthorized code verification
- ✓ Anyone accessing manager features
- ✓ Shared device code verification

## Known Fraud Vectors & Mitigations

### Vector 1: Code Reuse
**Attack**: Customer gets code, presents it twice for two sessions

**Mitigation**:
- Code status tracked in database (PAID → USED transition)
- Second verification returns error: "Code already used"
- Code state is authoritative (verified server-side)

**Test**: Test 3.2 (Fraud Test - Code Reuse Prevention)

---

### Vector 2: Screenshot Sharing
**Attack**: Customer takes screenshot of hologram code, shares with friend

**Mitigation**:
- Hologram animation (gradient + opacity) changes every ~2 seconds
- Screenshot captures static image, looks different from live
- Without live animation, screenshot is visually distinct
- Manager can verify screenshot is not live by watching for animation

**Test**: Test 4.1 (Screenshot Comparison)

**Manager Verification Tip**: Watch the code on customer's phone for animation. If it's not moving/changing, it's likely a screenshot.

---

### Vector 3: Fake Webhooks
**Attack**: Attacker sends fake CinetPay webhook saying payment succeeded

**Mitigation**:
- Webhook signature verification (SHA256 HMAC)
- Invalid signatures return 401 Unauthorized
- Signature uses secret key only CinetPay knows
- Prevents both spoofed and modified webhooks

**Test**: test_webhook_cinetpay_invalid_signature

---

### Vector 4: Unauthorized Manager Access
**Attack**: Non-manager employee accesses /manager route, verifies codes

**Mitigation**:
- PIN-protected manager portal
- Wrong PIN triggers red shake animation, no access granted
- Each verification logged (optional, recommended for audit)

**Test**: Test 6.2 (Wrong Manager PIN)

---

### Vector 5: Database Manipulation
**Attack**: Attacker directly modifies code status in database

**Mitigation**:
- Supabase Service Role Key has strict permissions
- Database read/write only for transactions table
- No direct SQL access (using ORM)
- Database backups and audit trails (Supabase feature)

**Defense**: Regular database backups, access control

---

### Vector 6: Man-in-the-Middle (MITM)
**Attack**: Attacker intercepts payment request or response

**Mitigation**:
- HTTPS only (TLS encryption in transit)
- Certificate pinning (optional, not currently implemented)
- Signature verification on webhooks

**Defense**: Production HTTPS enforcement, consider certificate pinning for mobile app

---

## Fraud Detection Procedures

### Red Flags for Manager

If you observe any of these, potential fraud is occurring:

1. **Customer presents screenshot instead of live app**
   - Screenshot will appear static (no animation)
   - Live app shows gradient and opacity changes
   - Action: Require live device/animation verification

2. **Code verification succeeds, then fails immediately after**
   - First verification: Success (code marked USED)
   - Second verification: "Code already used" error
   - Action: This is normal (anti-fraud feature), expected behavior

3. **Customer's code looks different from live app code**
   - Code format should be exactly 4 alphanumeric characters
   - No O, I, 0, or 1 characters
   - Action: Reject code, ask customer to check their screen

4. **Manager portal shows "Invalid signature" in logs**
   - Possible webhook spoofing attempt
   - Action: Check CinetPay dashboard for matching transaction
   - Action: Check transaction logs in Supabase

5. **Multiple failed code verifications from same customer**
   - Customer might be trying to use same code repeatedly
   - Or trying different codes to guess valid codes
   - Action: Limit verification attempts after N failures (optional feature)

6. **Wi-Fi connection drops, code verification still works**
   - Indicates app might be cached or offline
   - Code should still verify correctly (database is source of truth)
   - Action: Verify with backup online check if needed

### Logging for Fraud Investigation

**Recommended**: Enable structured logging to track:

```json
{
  "timestamp": "2026-06-25T14:30:45Z",
  "event": "code_verification",
  "transaction_id": "trans_123",
  "code": "AB2D",
  "result": "success | already_used | invalid",
  "manager_ip": "192.168.1.100",
  "response_time_ms": 245
}
```

This allows you to:
- Track who verified which codes
- Identify patterns of abuse
- Audit fraud accusations
- Monitor verification latency

---

## Failure Recovery Procedures

### Scenario 1: Customer Completes Payment, Never Receives Code

**Signs**:
- Customer paid (money deducted from account)
- Customer doesn't see success screen / code
- Transaction exists but status is not PAID

**Root Causes**:
- Webhook delivery delayed (CinetPay issue)
- App crashed after payment
- Network disconnection during polling

**Recovery**:

1. **Verify Payment in CinetPay**:
   - Log into CinetPay dashboard
   - Search transaction by amount and date
   - Verify status is "SUCCESS" or "PAID"

2. **Check Supabase Transaction**:
   - Log into Supabase dashboard
   - Query transactions table
   - Find transaction by approximate time and amount
   - Check status field

3. **If Status is Still PENDING**:
   - Wait 60 seconds (webhook may still arrive)
   - If still PENDING after 60 seconds:
     - Manually create a record update (or contact support)
     - Mark transaction as PAID and generate code
     - Provide code to customer

4. **If Status is Already PAID**:
   - Transaction has code already generated
   - Query database by status=PAID for that transaction
   - Provide the code to customer
   - Proceed with normal manager verification

**Prevention**:
- Increase webhook timeout in DEPLOYMENT.md
- Implement webhook retry logic
- Add customer support email for this case

---

### Scenario 2: Code Marked as USED, But Customer Never Verified With Manager

**Signs**:
- Customer has code
- Manager tries to verify code, gets "Code already used"
- But manager never verified this code before

**Root Causes**:
- Code was auto-marked as USED (shouldn't happen - bug)
- Different customer used same code (collision)
- Database was corrupted or rolled back

**Recovery**:

1. **Check Transaction Log**:
   - Query Supabase for this code
   - Check when it was marked as USED
   - Check if there's another transaction with same code (collision)

2. **If No Collision (Unique Code)**:
   - This is a bug - code should only transition PAID → USED after verification
   - Code might have been marked USED without verification
   - Action: Contact support/development

3. **If Collision (Same Code Twice)**:
   - Code collision occurred (extremely rare with 8.4M combinations)
   - Action: Verify both transactions, issue new code to customer
   - Action: Log this incident for analysis

4. **Recovery Steps**:
   - Generate new unique code for customer
   - Transition customer's transaction to PAID with new code
   - Provide new code to customer
   - Proceed with normal manager verification

**Prevention**:
- Monitor collision rate in logs
- If collisions > 0 in first month, increase code length to 5 characters (54^5 = 459M)

---

### Scenario 3: Manager PIN Forgotten

**Signs**:
- Manager tries to access /manager route
- Wrong PIN entered
- Manager locked out

**Recovery**:

1. **Temporary Access**:
   - Change VITE_MANAGER_PIN environment variable in Vercel
   - Redeploy app (30 seconds downtime)
   - Manager now has access with new PIN

2. **Permanent Solution**:
   - Document PIN in secure location (password manager)
   - Email PIN to manager in secure channel
   - Never share PIN in plain text or logs

**Prevention**:
- Document PIN at setup time
- Use password manager (1Password, LastPass, Bitwarden)
- Test PIN works before relying on it

---

### Scenario 4: Wi-Fi Network Down, Can't Access App

**Signs**:
- Lounge Wi-Fi is offline
- Customers can't load payment app
- Manager can't access manager portal

**Recovery**:

1. **Temporary Solution**:
   - Restart Wi-Fi router (power cycle 30 seconds)
   - Check router logs for configuration issues
   - Verify Vercel DNS is resolving (ask router admin)

2. **Longer Outage**:
   - Use mobile hotspot as temporary replacement
   - Create temporary SSID "Confort+_Backup"
   - Whitelist same domains (or all domains as fallback)
   - Customers connect to backup network

3. **App Offline Access** (if Service Worker cached):
   - App should load from cache if network was previously accessible
   - Payments cannot be processed (need internet)
   - Can take screenshots or record codes for later

**Prevention**:
- Redundant Wi-Fi: Primary + backup network
- Monitor Wi-Fi uptime
- Automatic alerting for network failures

---

### Scenario 5: CinetPay API Key Expired or Revoked

**Signs**:
- Webhook signature verification fails
- Payment initiated but webhook never arrives
- Error logs show "Invalid signature" for valid transactions

**Recovery**:

1. **Verify Issue**:
   - Check CinetPay dashboard for API key status
   - Verify API key hasn't been rotated
   - Check webhook URL is still correct

2. **Immediate Fix**:
   - Generate new API key in CinetPay dashboard
   - Update CINETPAY_API_KEY environment variable in Vercel
   - Redeploy app (30 seconds downtime)
   - Test webhook by making test payment

3. **Prevent Future Issues**:
   - Set calendar reminder for quarterly key rotation
   - Document API key rotation procedure
   - Have backup API key (if supported by CinetPay)

**Prevention**:
- Quarterly API key rotation
- Store API keys in password manager
- Monitor CinetPay emails for key expiration notices

---

## Audit & Compliance Procedures

### Monthly Audit Checklist

- [ ] Review transaction logs for fraud patterns
- [ ] Verify code collision rate (should be 0)
- [ ] Check webhook signature verification failures
- [ ] Review manager PIN access logs
- [ ] Verify Wi-Fi network whitelist is still correct
- [ ] Test QR code scanning (code not expired)
- [ ] Verify Supabase backups are running
- [ ] Check API response times (no degradation)
- [ ] Review error logs for new patterns
- [ ] Test full payment flow end-to-end

### Quarterly Procedures

- [ ] Rotate CinetPay API key
- [ ] Rotate Supabase service role key (if supported)
- [ ] Update manager PIN (if needed)
- [ ] Review and update this document
- [ ] Conduct security audit (manual)
- [ ] Test disaster recovery procedures

### Annual Procedures

- [ ] Comprehensive security review
- [ ] Penetration testing (hire external firm)
- [ ] Code audit (review all changes)
- [ ] Update threat model
- [ ] Plan infrastructure improvements

---

## Support Escalation

If fraud or security issue is suspected:

1. **Immediate** (< 1 hour):
   - Document exactly what happened
   - Take screenshots/logs
   - Note timestamps and transaction IDs
   - Stop processing codes from affected customer

2. **Alert** (< 4 hours):
   - Email support@confort.local with incident report
   - Include all documentation
   - Include affected transaction IDs and codes

3. **Investigation** (24 hours):
   - Technical team reviews logs and code
   - Identifies root cause
   - Implements fix if needed

4. **Recovery** (48 hours):
   - Fix deployed to production
   - Affected transactions resolved
   - Customers notified if needed

---

**Fraud Prevention Guide Version**: 1.0
**Last Updated**: 2026-06-25
**Status**: Production Ready
