# Step 1: Configure Email Verification

## Goal
Get Supabase to send verification emails when users sign up.

## Steps

### 1.1 Check Supabase Email Settings
Go to: https://supabase.com/dashboard/project/jtzagpbdrqfifdisxipr/auth/settings

Look for:
- ✅ "Confirm email" should be ON
- ⚠️ "Enable email confirmations" should be ON

### 1.2 Configure Resend (your email provider)
You already have Resend API key in your .env:
```
VITE_RESEND_API_KEY=re_LL3ybLoE_FJ6jAuqAV7uWZSbKWasevWFh
```

In Supabase Dashboard → Authentication → Providers → Email:
- Provider: Resend
- API Key: (paste your Resend key)
- Domain: (optional - verify your domain for higher limits)

### 1.3 Test
Try signing up a new user at http://localhost:8096/
- Click "Get Started"
- Enter a fresh email + password
- Click "Create Admin Account"
- Check inbox for verification email

---

## If emails still don't work
We can switch to a fallback: auto-confirm users (skip email verification) for testing.

Let me know what you find in the Supabase settings!