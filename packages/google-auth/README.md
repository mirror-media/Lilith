# @mirrormedia/lilith-google-auth

Google Workspace sign-in for Lilith Keystone CMS packages, delivered as an Express mini-app. It issues Keystone's own session cookie, so access control, `session.data`, and the Admin UI behave exactly as they do after a password login.

- Custom `/signin` page with a "使用 Google 帳號登入" button. Password login stays reachable via `/signin?password=1` unless disabled.
- `/auth/google` starts the OAuth code flow; `/auth/google/callback` verifies the ID token (`hd` domain allow-list, `email_verified`, nonce) and signs in the matching `User` row. No user is ever created.
- Optional password-login kill switch: hides the password page and rejects the `authenticateUserWithPassword` mutation with 403.

No dependency on `@keystone-6/core`: Keystone is typed structurally, so any package can adopt it without changing its `@mirrormedia/lilith-core` version line.

## Usage

```ts
import { createGoogleAuthMiniApp } from '@mirrormedia/lilith-google-auth'

// inside config.server.extendExpressApp(app, context), after the JSON body parser:
if (envVar.googleAuth.isEnabled) {
  app.use(
    createGoogleAuthMiniApp({
      // Keystone's generated context is structurally compatible with the
      // narrow interface this package declares.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keystoneContext: context as any,
      clientId: envVar.googleAuth.clientId,
      clientSecret: envVar.googleAuth.clientSecret,
      callbackUrl: envVar.googleAuth.callbackUrl,
      allowedDomains: envVar.googleAuth.allowedDomains,
      passwordLoginEnabled: envVar.googleAuth.passwordLoginEnabled,
      stateSecret: envVar.session.secret,
    })
  )
}
```

## Environment variables (consumer side)

| Variable | Meaning |
|---|---|
| `GOOGLE_AUTH_CLIENT_ID` | OAuth 2.0 Web client ID. Unset means the mini-app is not mounted. |
| `GOOGLE_AUTH_CLIENT_SECRET` | Client secret, from Secret Manager. |
| `GOOGLE_AUTH_CALLBACK_URL` | Absolute URL of `/auth/google/callback` for this deployment. |
| `GOOGLE_AUTH_ALLOWED_DOMAINS` | Comma-separated Workspace domains, e.g. `mirrormedia.mg,readr.tw`. |
| `GOOGLE_AUTH_PASSWORD_LOGIN_ENABLED` | `false` disables password login. Default `true`. |

## Google Cloud setup

1. In the GCP project that owns the Workspace domain, create an OAuth 2.0 Web client.
2. Register every environment's callback URL (dev, staging, prod, plus `http://localhost:<port>/auth/google/callback` for local dev).
3. Set the consent screen to Internal so only Workspace accounts can complete the flow. The `hd` check in this package is the second layer.

## Error codes

`/signin?error=<code>` where code is one of `state`, `token`, `domain`, `unverified_email`, `no_user`, `session`. Messages live in `ERROR_MESSAGES`.

## Build and test

```
yarn test    # tsx + node:test
make build   # babel -> lib/, tsc -> @types/
```
