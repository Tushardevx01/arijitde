# OTP Email Not Receiving — Fix Plan

> **Status:** 🔴 Blocked — OTP emails not being delivered  
> **Priority:** High  
> **email.ts:** ⏸️ Deferred — will fix in a later session

---

## Root Cause (Suspected)

The backend server's IP address is **not whitelisted** in the email/SMTP provider's settings, causing outbound emails to be silently blocked or rejected before they even reach the user's inbox.

---

## Steps to Fix

### Step 1 — Get the Backend Server IP

Find the **public IP** of the server where the backend is running.

```bash
# On the backend server, run:
curl https://api.ipify.org
# or
curl ifconfig.me
```

Copy that IP address. You'll need it in the next steps.

---

### Step 2 — Whitelist the IP in the Email Service Provider

Depending on which email/SMTP service is being used (Resend, SendGrid, Brevo, Nodemailer + SMTP, etc.), go to the provider dashboard and add the backend IP to the **allowed senders / IP whitelist**.

#### If using **Resend**
- Go to [resend.com/domains](https://resend.com/domains)
- Open your domain → **DNS Settings**
- Make sure SPF record includes your server IP: `v=spf1 ip4:<YOUR_IP> include:... ~all`

#### If using **SendGrid**
- Dashboard → Settings → **IP Access Management**
- Add the backend server's public IP

#### If using **Brevo (Sendinblue)**
- Account → Settings → **Authorized IPs**
- Add the backend IP

#### If using **Custom SMTP (e.g., Gmail, Zoho, etc.)**
- Check if the SMTP host is blocking the IP
- Enable "Less Secure Apps" or use App Passwords if Gmail
- Make sure the sending IP is not flagged/blocked by the SMTP relay

---

### Step 3 — Check Environment Variables on Backend

Make sure these are correctly set in `.env` / hosting platform (e.g., Railway, Render, Vercel):

```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_password_or_api_key
EMAIL_FROM=no-reply@yourdomain.com
```

> WARNING: If any of these are empty or wrong, OTP will silently fail with no error shown to the user.

---

### Step 4 — Check Firewall / Port Rules on the Server

Outbound SMTP ports might be blocked at the server/cloud level.

```bash
# Test if SMTP port is reachable from the server
telnet smtp.your-provider.com 587
# or
nc -zv smtp.your-provider.com 587
```

If blocked:
- Open port **587** (TLS) or **465** (SSL) in the server firewall / security group (AWS, GCP, DigitalOcean, etc.)
- On **AWS EC2** specifically, port 25 is blocked by default — use port 587 instead and request AWS to unblock if needed

---

### Step 5 — Test OTP Email Manually

Once IP is whitelisted and env vars are confirmed, trigger an OTP request and:

1. Check the backend **logs** — does it show a success response from the email service?
2. Check the user inbox **spam/junk folder**
3. If still failing, check the email provider's **sending logs / activity feed** in the dashboard

---

### Step 6 — Fix email.ts (Deferred)

> NOTE: `email.ts` will be revisited in a separate session.
> Current issues in email.ts are known and parked intentionally. Do not modify it until the IP/SMTP issue above is resolved first.

---

## Quick Checklist

- [ ] Got the backend server's public IP
- [ ] Added IP to email provider's whitelist / SPF record
- [ ] Verified all email-related env vars are set correctly
- [ ] Confirmed outbound SMTP ports (587/465) are open
- [ ] Tested OTP flow end-to-end
- [ ] Checked email provider sending logs
- [ ] Checked spam folder

---

## Notes

- If the project is deployed on **Railway / Render / Fly.io**, the IP can change on every redeploy. Consider using the provider's **API key auth** instead of IP-based auth for stability.
- Always test in staging before pushing to production.
