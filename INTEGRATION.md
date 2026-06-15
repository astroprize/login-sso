# SSO Integration Guide

`login.dparmar.com` is the single auth service for all `*.dparmar.com` apps.
This document is the cookie contract for downstream app authors.

## How it works

1. Unauthenticated user hits your app
2. Your middleware redirects to `https://login.dparmar.com/sign-in?next=https://yourapp.dparmar.com`
3. User completes magic link flow at `login.dparmar.com`
4. `login.dparmar.com` sets a shared cookie and redirects back to your app
5. Your middleware reads and validates the cookie on every request

## The cookie

| Field | Value |
|---|---|
| Name | `sb-access-token` |
| Format | Plain Supabase JWT (no chunking, no base64 wrapper, no JSON envelope) |
| Domain | `.dparmar.com` |
| SameSite | `Lax` |
| Secure | Yes |

## Validating in your app

### Option A — Supabase SDK (Python/FastAPI, simplest)

```python
token = request.cookies.get("sb-access-token")
if not token:
    # redirect to login
resp = supabase.auth.get_user(token)
if not resp or not resp.user:
    # redirect to login
```

### Option B — Direct JWT validation (Next.js, no network call)

```ts
import { jwtVerify } from "jose";

const token = request.cookies.get("sb-access-token")?.value;
if (!token) redirect to login;
await jwtVerify(token, new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));
```

Add `SUPABASE_JWT_SECRET` from Supabase dashboard → Settings → API → JWT Secret.

## Unauthenticated redirect

Always redirect to:
```
https://login.dparmar.com/sign-in?next=https://yourapp.dparmar.com
```

## Sign-out

Redirect users to:
```
https://login.dparmar.com/sign-out
```

This clears the `.dparmar.com` cookie and calls `supabase.auth.signOut()`.

## Test fixture JWT

For unit tests in your app, generate a test JWT signed with `SUPABASE_JWT_SECRET`:

```ts
import { SignJWT } from "jose";

const testJwt = await new SignJWT({ sub: "test-user-id", email: "test@example.com" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));
```

## Apps currently using SSO

- `login.dparmar.com` — this service
- `socal.dparmar.com` — pending migration (see SoCal repo notes)
- `apps.dparmar.com` — pending migration (see portfolio repo notes)
- `pods.dparmar.com` — pending migration
