# Security Configuration Checklist

This checklist helps you configure all recommended security settings for production deployment.

## ✅ Pre-Deployment Security Checklist

### 1. Environment Configuration

- [ ] **JWT Secret**
  ```bash
  # Generate a strong secret (32+ bytes)
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  # Add to .env: JWT_SECRET=<generated-value>
  ```
  - ✅ **CONFIGURED** - Run `./setup-security.sh` to auto-configure
  - ⚠️ Never use default value in production
  - 🔄 Rotate periodically (every 90 days recommended)

- [ ] **Node Environment**
  ```bash
  NODE_ENV=production
  ```
  - Enables production optimizations
  - Disables detailed error messages
  - Optimizes logging

- [ ] **Client URL**
  ```bash
  CLIENT_URL=https://yourdomain.com
  ```
  - Must match your actual frontend URL
  - Required for CORS configuration
  - Include protocol (https://)

### 2. Security Headers (Helmet.js)

- [x] **Helmet installed and configured**
  - ✅ Content Security Policy (CSP)
  - ✅ HTTP Strict Transport Security (HSTS)
  - ✅ X-Content-Type-Options
  - ✅ X-Frame-Options
  - ✅ Referrer-Policy
  - All configured in `server/index.js`

### 3. Input Validation

- [x] **Express-validator configured**
  - ✅ Email validation on auth endpoints
  - ✅ Password strength requirements
  - ✅ Prompt length validation
  - ✅ XSS protection via input sanitization
  - All validators in `server/middleware/validation.js`

### 4. Rate Limiting

- [x] **Rate limiting configured**
  - ✅ Auth endpoints: 10 req/15min
  - ✅ Generation: 10 req/hour (anonymous)
  - ✅ Troubleshooting: 30 req/15min
  - Custom middleware in `server/middleware/rateLimit.js`

### 5. Request Logging

- [x] **Morgan logging configured**
  - ✅ Production: Errors only
  - ✅ Development: All requests
  - Configured in `server/index.js`

### 6. CORS Configuration

- [x] **CORS properly configured**
  - ✅ Origin restricted to CLIENT_URL
  - ✅ Credentials enabled
  - ✅ Specific methods allowed
  - ✅ Specific headers allowed
  - Configured in `server/index.js`

### 7. Database Security

- [ ] **MongoDB connection secured**
  ```bash
  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
  ```
  - Use MongoDB Atlas with IP whitelist
  - Enable authentication
  - Use strong passwords (16+ characters)
  - Enable network encryption

- [ ] **Database backups configured**
  - Automated daily backups
  - Test restore procedures
  - Off-site backup storage

### 8. Payment Security (Stripe)

- [ ] **Stripe keys configured**
  ```bash
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
  - Use live keys for production
  - Test webhook signatures
  - Monitor webhook failures

### 9. SSL/TLS Configuration

- [ ] **HTTPS enabled**
  - Use SSL certificate (Let's Encrypt, Cloudflare)
  - Redirect HTTP to HTTPS
  - Enable HSTS (already configured via Helmet)

- [ ] **SSL certificate validity**
  - Valid certificate installed
  - Auto-renewal configured
  - Monitor expiration dates

### 10. Password Policy

- [x] **Password requirements enforced**
  - ✅ Minimum 6 characters (consider increasing to 8-12)
  - ✅ Must contain uppercase
  - ✅ Must contain lowercase
  - ✅ Must contain number
  - Configured in `server/middleware/validation.js`

## 🚀 Quick Setup

Run the automated security setup:

```bash
./setup-security.sh
```

This script will:
- ✅ Create .env from template
- ✅ Generate secure JWT_SECRET
- ✅ Install security packages
- ✅ Provide configuration checklist

## 🔍 Verification

### Test Security Headers

```bash
# Check headers are properly set
curl -I https://yourdomain.com/api/health

# Should include:
# - strict-transport-security
# - x-content-type-options
# - x-frame-options
# - content-security-policy
```

### Test Rate Limiting

```bash
# Attempt multiple rapid requests
for i in {1..15}; do
  curl -X POST https://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done

# Should return 429 after 10 requests
```

### Test Input Validation

```bash
# Test with invalid email
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"Test123","name":"Test"}'

# Should return 400 with validation error
```

### Test CORS

```bash
# Test from different origin
curl -H "Origin: https://malicious.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  --head https://yourdomain.com/api/generate

# Should not include Access-Control-Allow-Origin for unauthorized origin
```

## 📊 Monitoring

### Set Up Monitoring

1. **Application Performance Monitoring (APM)**
   - New Relic, DataDog, or Sentry
   - Monitor response times
   - Track error rates

2. **Security Monitoring**
   - Monitor failed authentication attempts
   - Track rate limit violations
   - Alert on unusual patterns

3. **Log Monitoring**
   - Centralized logging (e.g., Papertrail, Loggly)
   - Alert on error spikes
   - Retain logs for 30+ days

### Key Metrics to Monitor

- Authentication failure rate
- Rate limit hits
- Average response time
- Error rate (4xx, 5xx)
- Database query performance
- Memory usage
- CPU usage

## 🔄 Maintenance

### Regular Tasks

- [ ] **Weekly**
  - Review error logs
  - Check monitoring alerts
  - Verify backup success

- [ ] **Monthly**
  - Update dependencies (`npm audit`)
  - Review security advisories
  - Test backup restore

- [ ] **Quarterly**
  - Rotate JWT_SECRET
  - Review access logs
  - Penetration testing
  - Security audit

## 🆘 Incident Response

If security issue detected:

1. **Immediate**
   - Rotate JWT_SECRET (invalidates all sessions)
   - Change database credentials
   - Review recent access logs

2. **Investigation**
   - Identify attack vector
   - Check for data breaches
   - Document timeline

3. **Communication**
   - Notify affected users (if applicable)
   - Report to authorities (if required)
   - Update security documentation

4. **Prevention**
   - Implement additional controls
   - Update monitoring
   - Run security scan

## 📚 Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **Helmet.js Docs**: https://helmetjs.github.io/
- **NIST Guidelines**: https://www.nist.gov/cybersecurity

## ✅ Sign-Off

Before going to production:

- [ ] All items in this checklist completed
- [ ] Security review performed
- [ ] Penetration testing completed
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Team trained on security procedures

**Reviewed by**: ________________  
**Date**: ________________  
**Approved for production**: ☐ Yes ☐ No
