# @mirrormedia/lilith-google-auth

Google Workspace sign-in for Lilith Keystone CMS packages, delivered as an Express mini-app. It issues Keystone's own session cookie, so access control, `session.data`, and the Admin UI behave exactly as they do after a password login.

- Custom `/signin` page with a "使用 Google 帳號登入" button. Password login stays reachable via `/signin?password=1` unless disabled.
- `/auth/google` starts the OAuth code flow; `/auth/google/callback` verifies the ID token (`hd` domain allow-list, `email_verified`, nonce) and signs in the matching `User` row. No user is ever created.
- Optional password-login kill switch: hides the password page and rejects the `authenticateUserWithPassword` mutation with 403.

No dependency on `@keystone-6/core`: Keystone is typed structurally, so any package can adopt it without changing its `@mirrormedia/lilith-core` version line.

## Usage

`withGoogleAuth` is the recommended integration: one wrapper around the exported config. Name the existing config and wrap it on the way out, so adopting the feature leaves the config body untouched and its indentation unchanged.

```ts
import { withGoogleAuth } from '@mirrormedia/lilith-google-auth'

const keystoneConfig = withAuth(
  config({
    /* unchanged */
  })
)

export default withGoogleAuth(keystoneConfig, {
  ...envVar.googleAuth,
  stateSecret: envVar.session.secret,
})
```

What it does:

- `options.isEnabled === false` returns the same `config` object, untouched. An env block whose `isEnabled` is derived from `GOOGLE_AUTH_CLIENT_ID` therefore turns the feature off without a conditional at the call site.
- Otherwise it rebuilds `server.extendExpressApp` so the mini-app is mounted **first**, then awaits the host's original hook. Mounting first is what lets `/signin` be answered before Keystone's Admin UI middleware claims it.
- With `passwordLoginEnabled: false` it also prepends `createPasswordLoginBlockPlugin()` to `graphql.apolloConfig.plugins`, preserving every other `graphql` and `apolloConfig` key (`cache`, existing plugins, ...). With password login enabled, `graphql` is left exactly as it was.

`WithGoogleAuthOptions` is `GoogleAuthOptions` without `keystoneContext` (the wrapper passes `extendExpressApp`'s own `context`) plus the optional `isEnabled`. The Keystone config is typed structurally (`KeystoneConfigLike`), so the wrapper still imports nothing from `@keystone-6/core` and returns the config type it was given.

Because the mini-app runs before the host's middleware, it sets `X-Robots-Tag: noindex, nofollow, noimageindex` on the pages it serves itself (`/signin`, `/auth/google`, and the callback, on every outcome) instead of relying on a host-side header middleware. Requests it passes through are left to the host.

The mini-app is constructed when Keystone calls `extendExpressApp`, and throws there (prefix `[google-auth]`) when the options cannot produce a working flow: an empty `clientId`, `clientSecret` or `stateSecret`, a `stateSecret` shorter than 32 characters, an empty `allowedDomains`, or a `callbackUrl` that is not an absolute http(s) URL whose path is usable as an Express route.

### Low-level API

`createGoogleAuthMiniApp` and `createPasswordLoginBlockPlugin` stay exported for hosts that need to control the mount point themselves. Both edits are required; the wrapper exists so they cannot drift apart. If the host also sets `passwordLoginAllowListField`, the matching `allowListField` on `createPasswordLoginBlockPlugin` is not optional: see the warning in [Allowing service accounts to keep password login](#allowing-service-accounts-to-keep-password-login).

```ts
import {
  createGoogleAuthMiniApp,
  createPasswordLoginBlockPlugin,
} from '@mirrormedia/lilith-google-auth'
import type { KeystoneContext } from '@mirrormedia/lilith-google-auth'

// inside config.server.extendExpressApp(app, context):
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
      passwordLoginAllowListField: 'isPasswordLoginAllowed',
      stateSecret: envVar.session.secret,
    })
  )
}

// graphql.apolloConfig.plugins, wherever the host builds it. The
// allowListField here must be the exact same value passed above.
createPasswordLoginBlockPlugin({
  allowListField: 'isPasswordLoginAllowed',
})
```

Mounting it after the host's own `X-Robots-Tag` middleware is harmless: the mini-app overwrites the header with the same value.

## Options

| Option                  | Required | Default                            | Meaning                                                                                                                                                |
| ----------------------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `keystoneContext`       | yes      |                                    | Keystone's context, cast to the package's `KeystoneContext`. Supplied by `withGoogleAuth`.                                                             |
| `clientId`              | yes      |                                    | OAuth 2.0 Web client ID.                                                                                                                               |
| `clientSecret`          | yes      |                                    | OAuth 2.0 client secret.                                                                                                                               |
| `callbackUrl`           | yes      |                                    | Absolute http(s) URL of the callback. Its path becomes the callback route and the state cookie's `Path`; `https` also makes the state cookie `Secure`. |
| `allowedDomains`        | yes      |                                    | Google `hd` allow-list. At least one entry.                                                                                                            |
| `stateSecret`           | yes      |                                    | HMAC key for the short-lived state cookie. Reuse `SESSION_SECRET`; at least 32 characters.                                                             |
| `passwordLoginEnabled`  | no       | `true`                             | `false` hides the password page and turns on the kill switch.                                                                                          |
| `passwordLoginAllowListField` | no | none (block all)                  | With `passwordLoginEnabled: false`, name of a `User` boolean field that lets that account keep logging in with a password. See [Allowing service accounts to keep password login](#allowing-service-accounts-to-keep-password-login). |
| `graphqlPath`           | no       | `/api/graphql`                     | Where the HTTP guard is mounted. Must equal the host's `config.graphql.path`.                                                                          |
| `signinRedirectDefault` | no       | `/`                                | Where to send the user after login when no `from` is present.                                                                                          |
| `logger`                | no       | single-line JSON to stdout/stderr  | Receives a `GoogleAuthLogEvent`. A throwing logger never blocks the redirect. See [Log events](#log-events).                                           |
| `isEnabled`             | no       | `true`                             | `withGoogleAuth` only. `false` returns the host config untouched.                                                                                      |

## Password-login kill switch: two layers

Turning `passwordLoginEnabled` off needs **both** layers. Registering only one leaves the mutation reachable.

1. **HTTP guard** (automatic). The mini-app mounts an Express guard on `graphqlPath` that answers 403 to any JSON body selecting `authenticateUserWithPassword`.
2. **Apollo plugin** (automatic with `withGoogleAuth`; a low-level host must add it). Keystone core mounts `graphqlUploadExpress` _after_ `extendExpressApp`, so a multipart request reaches the guard with `req.body` still `{}` and passes; `graphql-upload` then fills `req.body` from the `operations` field and Apollo executes the mutation. `createPasswordLoginBlockPlugin()` inspects the parsed `DocumentNode` inside Apollo, after that rewrite, and is therefore immune:

`withGoogleAuth` registers this plugin for you. A low-level host does it by hand:

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

## Allowing service accounts to keep password login

`passwordLoginEnabled: false` blocks every `authenticateUserWithPassword`
call, including programs that log in with a service account's password
(e.g. an internal tool authenticating as a dedicated CMS account). Setting
`passwordLoginAllowListField` lets specific accounts keep working without
turning password login back on for everyone.

Add a boolean field to the package's `User` list:

```ts
isPasswordLoginAllowed: checkbox({
  label: '允許 API 登入',
  defaultValue: false,
  access: {
    read: () => true,
    create: ({ session }) => session?.data?.role === 'admin',
    update: ({ session }) => session?.data?.role === 'admin',
  },
  ui: {
    description:
      '警告：勾選後此帳號可用帳號密碼透過 GraphQL 登入，等於繞過 Google 登入。僅限程式用的服務帳號，不要給一般使用者。',
    itemView: {
      fieldMode: ({ session }) =>
        envVar.googleAuth.isEnabled && session?.data?.role === 'admin' ? 'edit' : 'read',
    },
    createView: {
      fieldMode: ({ session }) =>
        envVar.googleAuth.isEnabled && session?.data?.role === 'admin' ? 'edit' : 'hidden',
    },
  },
}),
```

Then pass the field name to `withGoogleAuth`:

```ts
export default withGoogleAuth(keystoneConfig, {
  ...envVar.googleAuth,
  stateSecret: envVar.session.secret,
  passwordLoginAllowListField: 'isPasswordLoginAllowed',
})
```

**Warning:** a `true` flag on this field lets that account sign in with a
password over GraphQL, bypassing Google sign-in entirely. Only ever set it on
service accounts used by programs, never on accounts a person can log into.

What changes in allow-list mode:

- The sign-in page is unchanged: with `passwordLoginEnabled: false` the
  password option stays hidden and `?password=1` is still ignored. Allow-listed
  accounts are for programs calling GraphQL, not for people using `/signin`.
- The mini-app's HTTP guard (step 1 above) is **not mounted**. It can only
  reject every password mutation or none; it cannot resolve which user is
  logging in. The Apollo plugin becomes the single enforcement point (it
  already has to be, since it is the only layer that sees a multipart
  request).
- The plugin resolves the mutation's `email` argument and looks the user up
  with `contextValue.sudo().query.User.findOne({ where: { email }, query: passwordLoginAllowListField })`,
  allowing the request only when that field is strictly `true`.
- A variable `email` must be supplied in the request's `variables`. A default
  value declared on the operation (`mutation ($email: String = "bot@x.com")`)
  is **not** honoured: the plugin reads `variables` only, and rejects the
  request when the variable is absent.
- One request may select only **one** distinct email. A document selecting two
  different emails is rejected before any lookup (aliases repeating the same
  email still cost a single lookup), so a single request cannot be turned into
  a bulk probe of the allow-list.
- The lookup uses the email **exactly as sent in the mutation** (no trimming,
  no case-folding), matching Keystone's own `validateSecret`, which looks the
  user up with the same raw string. `User.email` is a case-sensitive unique
  `text()` field, so `bot@x.com` and `Bot@X.com` can be two different rows;
  normalizing here could let the plugin approve one row while Keystone goes
  on to authenticate a different one.

**A host using the low-level API (not `withGoogleAuth`) must register the
Apollo plugin itself:** pass `passwordLoginAllowListField` to
`createGoogleAuthMiniApp` and, separately, add
`createPasswordLoginBlockPlugin({ allowListField: <the same field> })` to
`graphql.apolloConfig.plugins`. Skipping the plugin degrades very differently
here than in block-all mode. In block-all mode a skipped plugin still leaves
the mini-app's HTTP guard rejecting every plain JSON mutation, so only the
multipart path bypasses it (see
[Password-login kill switch: two layers](#password-login-kill-switch-two-layers)).
In allow-list mode the HTTP guard is not mounted at all, so a skipped plugin
leaves `authenticateUserWithPassword` completely unguarded, JSON included:
every request succeeds regardless of the allow-list field. `withGoogleAuth`
registers the plugin for you and cannot be misconfigured this way; this
warning applies only to the low-level API.

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

The `GoogleAuthLogEvent` field names match `@mirrormedia/lilith-core`'s login-logging plugin, so one log query covers password and Google logins:

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

### Structured JSON output

The default logger, and the two places an unexpected error is logged (the callback's catch-all, and a caller-supplied `logger` that throws), all print a single-line JSON object with a `severity` field, so Cloud Logging parses `jsonPayload` instead of a multi-line `textPayload`, and an `ERROR` entry (whose `message` is the stack trace) is picked up by Error Reporting. No dependency on `@twreporter/errors`; the shape is a hand-rolled envelope shared with the equivalent change in `@mirrormedia/lilith-core`.

```ts
type LogEntry = {
  severity: 'INFO' | 'WARNING' | 'ERROR'
  message: string
} & Record<string, unknown>
```

Severity mapping:

- `outcome: 'success'` → `severity: 'INFO'`, `message: 'google-login success'`, every `GoogleAuthLogEvent` field top-level (no nesting).
- `outcome: 'failure'` → `severity: 'WARNING'`, `message: 'google-login failure: <reason>'`, every `GoogleAuthLogEvent` field top-level.
- An unexpected throw (callback catch-all, or a `logger` that throws) → `severity: 'ERROR'`, `message` is the `Error`'s stack trace (or `String(err)` for a non-`Error`), plus `type: 'google-login'`, `stage: 'callback' | 'logger'`, `email`, `timestamp`.

`formatLogEntry` and the `LogEntry` type are exported for a caller that wants the same envelope from a custom `logger`:

```ts
import { formatLogEntry } from '@mirrormedia/lilith-google-auth'
import type { LogEntry } from '@mirrormedia/lilith-google-auth'

const logger = (event: GoogleAuthLogEvent) => {
  const entry: LogEntry = formatLogEntry(event)
  const line = JSON.stringify(entry)
  entry.severity === 'ERROR' ? console.error(line) : console.log(line)
}
```

Example Logs Explorer query, scoped to failed and errored Google logins in a given service:

```
resource.type="cloud_run_revision"
jsonPayload.type="google-login"
severity>=WARNING
```

Add `jsonPayload.stage="callback"` to isolate unexpected errors raised during the OAuth callback, or `severity="ERROR"` to see only entries Error Reporting also tracks.

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
