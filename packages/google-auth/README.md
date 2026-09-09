# @mirrormedia/lilith-google-auth

Google Workspace sign-in for Lilith Keystone CMS packages, delivered as an Express mini-app. It issues Keystone's own session cookie, so access control, `session.data`, and the Admin UI behave exactly as they do after a password login.

- Custom `/signin` page with a "使用 Google 帳號登入" button. Password login stays reachable via `/signin?password=1` unless disabled.
- `/auth/google` starts the OAuth code flow; `/auth/google/callback` verifies the ID token (`hd` domain allow-list, `email_verified`, nonce) and signs in the matching `User` row. No user is ever created.
- Optional password-login kill switch: hides the password page and rejects the `authenticateUserWithPassword` mutation with 403.

No dependency on `@keystone-6/core`: Keystone is typed structurally, so any package can adopt it without changing its `@mirrormedia/lilith-core` version line.

## Usage

```ts
import {
  createGoogleAuthMiniApp,
  createPasswordLoginBlockPlugin,
} from '@mirrormedia/lilith-google-auth'
import type { KeystoneContext } from '@mirrormedia/lilith-google-auth'

// inside config.server.extendExpressApp(app, context), after the JSON body parser:
if (envVar.googleAuth.isEnabled) {
  app.use(
    createGoogleAuthMiniApp({
      // Keystone's generated context is structurally compatible with the
      // narrow interface this package declares.
      keystoneContext: context as unknown as KeystoneContext,
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

`createGoogleAuthMiniApp` throws at construction (prefix `[google-auth]`) when the options cannot produce a working flow: an empty `clientId`, `clientSecret` or `stateSecret`, a `stateSecret` shorter than 32 characters, an empty `allowedDomains`, or a `callbackUrl` that is not an absolute http(s) URL whose path is usable as an Express route.

## Options

| Option                  | Required | Default                            | Meaning                                                                                                                                                |
| ----------------------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `keystoneContext`       | yes      |                                    | Keystone's context, cast to the package's `KeystoneContext`.                                                                                           |
| `clientId`              | yes      |                                    | OAuth 2.0 Web client ID.                                                                                                                               |
| `clientSecret`          | yes      |                                    | OAuth 2.0 client secret.                                                                                                                               |
| `callbackUrl`           | yes      |                                    | Absolute http(s) URL of the callback. Its path becomes the callback route and the state cookie's `Path`; `https` also makes the state cookie `Secure`. |
| `allowedDomains`        | yes      |                                    | Google `hd` allow-list. At least one entry.                                                                                                            |
| `stateSecret`           | yes      |                                    | HMAC key for the short-lived state cookie. Reuse `SESSION_SECRET`; at least 32 characters.                                                             |
| `passwordLoginEnabled`  | no       | `true`                             | `false` hides the password page and turns on the kill switch.                                                                                          |
| `graphqlPath`           | no       | `/api/graphql`                     | Where the HTTP guard is mounted. Must equal the host's `config.graphql.path`.                                                                          |
| `signinRedirectDefault` | no       | `/`                                | Where to send the user after login when no `from` is present.                                                                                          |
| `logger`                | no       | `console.log('[登入日誌]', event)` | Receives a `GoogleAuthLogEvent`. A throwing logger never blocks the redirect.                                                                          |

## Password-login kill switch: two layers

Turning `passwordLoginEnabled` off needs **both** layers. Registering only one leaves the mutation reachable.

1. **HTTP guard** (automatic). The mini-app mounts an Express guard on `graphqlPath` that answers 403 to any JSON body selecting `authenticateUserWithPassword`.
2. **Apollo plugin** (the consumer must add it). Keystone core mounts `graphqlUploadExpress` _after_ `extendExpressApp`, so a multipart request reaches the guard with `req.body` still `{}` and passes; `graphql-upload` then fills `req.body` from the `operations` field and Apollo executes the mutation. `createPasswordLoginBlockPlugin()` inspects the parsed `DocumentNode` inside Apollo, after that rewrite, and is therefore immune:

```ts
import { createPasswordLoginBlockPlugin } from '@mirrormedia/lilith-google-auth'

const apolloPlugins = [
  ...(envVar.googleAuth.isEnabled && !envVar.googleAuth.passwordLoginEnabled
    ? [createPasswordLoginBlockPlugin()]
    : []),
  // ...any cache plugins the package already registers
]

const graphqlConfig: GraphQLConfig = {
  apolloConfig:
    apolloPlugins.length > 0 ? { plugins: apolloPlugins } : undefined,
}
```

The plugin throws a `GraphQLError` with `extensions.code = 'PASSWORD_LOGIN_DISABLED'` and `extensions.http.status = 403`. It walks every `mutation` operation, including fields reached through a top-level fragment spread, so aliases and fragments cannot hide the field; a query that merely names it inside a string literal is not blocked.

`graphql` is a peer dependency (`^16`) because the plugin works on the host's own `DocumentNode`.

### Verifying the toggle

With `GOOGLE_AUTH_PASSWORD_LOGIN_ENABLED=false`, all three must return 403:

```sh
# 1. plain JSON: stopped by the HTTP guard
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3003/api/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"mutation { authenticateUserWithPassword(email:\"a\",password:\"b\") { __typename } }"}'

# 2. multipart: slips past the HTTP guard, stopped by the Apollo plugin.
#    The apollo-require-preflight header is what a real multipart client sends;
#    without it Apollo's CSRF prevention answers 400 before any plugin runs, so
#    a 400 here proves nothing about the kill switch.
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3003/api/graphql \
  -H 'apollo-require-preflight: true' \
  -F 'operations={"query":"mutation { authenticateUserWithPassword(email:\"a\",password:\"b\") { __typename } }","variables":{}}' \
  -F 'map={}'

# 3. aliased mutation
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3003/api/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"mutation { login: authenticateUserWithPassword(email:\"a\",password:\"b\") { __typename } }"}'
```

If step 2 returns 200, the Apollo plugin is not registered.

## Environment variables (consumer side)

| Variable                             | Meaning                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_AUTH_CLIENT_ID`              | OAuth 2.0 Web client ID. Unset (or blank) means the mini-app is not mounted.                                         |
| `GOOGLE_AUTH_CLIENT_SECRET`          | Client secret, from Secret Manager.                                                                                  |
| `GOOGLE_AUTH_CALLBACK_URL`           | Absolute URL of `/auth/google/callback` for this deployment.                                                         |
| `GOOGLE_AUTH_ALLOWED_DOMAINS`        | Required. Comma-separated Workspace domains, e.g. `mirrormedia.mg,readr.tw`. An empty list makes construction throw. |
| `GOOGLE_AUTH_PASSWORD_LOGIN_ENABLED` | `false` disables password login. Default `true`.                                                                     |

`stateSecret` has no variable of its own: consumers pass `SESSION_SECRET` (already required to be at least 32 characters).

## User matching

The callback looks the `User` row up by the Google account's email, lower-cased. `User.email` must therefore be stored lower-case, otherwise the lookup returns `no_user` for an account that does exist.

## Log events

The default logger prints `[登入日誌]` with the same field names as `@mirrormedia/lilith-core`'s login-logging plugin, so one log query covers password and Google logins:

```ts
type GoogleAuthLogEvent = {
  type: 'google-login'
  outcome: 'success' | 'failure'
  reason?: GoogleAuthErrorCode
  timestamp: string // ISO 8601
  userId: string | null
  email: string | null
  name: string | null
  role: string | null
  ipAddress: string | null // x-forwarded-for[0], else x-real-ip, else socket
  userAgent: string | null
}
```

`::1` and `::ffff:127.0.0.1` are normalised to `127.0.0.1`.

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
