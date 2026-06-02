# Security Policy

## Supported Versions

| Version | Supported |
|:--------|:----------|
| >= 1.0.x | ✅ |
| < 1.0.0 | ❌ |

## Security Architecture

### Data Protection

| Aspect | Implementation |
|:-------|:---------------|
| API Key Storage | LocalStorage (encrypted) |
| Request Signing | Token-based verification |
| Rate Limiting | 10 RPS default |
| XSS Prevention | React built-in escaping |
| Cache Busting | Version-based auto-cleanup |

### Environment Variables

- All secrets must use environment variables (`.env` files)
- `.env` is excluded from version control via `.gitignore`
- `VITE_` prefixed variables are embedded at build time — **never place secrets in them**
- Production API keys must be served through a backend proxy

### Production Deployment

When deploying to production:

1. **Use a backend proxy** for AI API calls (see `edge-proxy-server.ts`)
2. **Enable HTTPS** on your reverse proxy (Nginx / Caddy / Cloudflare)
3. **Configure CSP headers** to restrict resource loading
4. **Set appropriate CORS policies**
5. **Use environment-specific API keys**, never development keys

## Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub Issues.**

Instead, please report them via:

- **Email**: admin@0379.email

Please include:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

### Response Timeline

| Stage | Timeline |
|:------|:---------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 5 business days |
| Fix Development | Depends on severity |
| Disclosure | After fix is released |

### Severity Levels

| Level | Description | Response |
|:------|:------------|:---------|
| **Critical** | Remote code execution, data breach | Immediate hotfix |
| **High** | Auth bypass, significant data leak | Patch within 48 hours |
| **Medium** | XSS, CSRF, limited data exposure | Next release |
| **Low** | Information disclosure, minor issues | Scheduled fix |

## Security Best Practices for Contributors

- Never commit API keys, tokens, or passwords
- Use `process.env` / `import.meta.env` for all configuration
- Validate and sanitize all user inputs
- Keep dependencies updated (`pnpm audit`)
- Report any security concerns immediately

---

*Last updated: 2026-06-02*
