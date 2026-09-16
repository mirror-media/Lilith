import test from 'node:test'
import assert from 'node:assert/strict'
import { GraphQLError, parse } from 'graphql'
import type { DocumentNode } from 'graphql'
import {
  createPasswordLoginBlockPlugin,
  documentSelectsPasswordLogin,
  extractPasswordLoginEmails,
} from './password-plugin'

const PASSWORD_MUTATION = `
  mutation ($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      __typename
    }
  }
`

const ALIASED_MUTATION = `
  mutation {
    login: authenticateUserWithPassword(email: "a", password: "b") {
      __typename
    }
  }
`

const FRAGMENT_MUTATION = `
  mutation Login {
    ...LoginFields
  }
  fragment LoginFields on Mutation {
    authenticateUserWithPassword(email: "a", password: "b") {
      __typename
    }
  }
`

const STRING_LITERAL_QUERY = `
  query {
    __type(name: "authenticateUserWithPassword") {
      name
    }
  }
`

const CREATE_INITIAL_USER = `
  mutation {
    createInitialUser(data: { email: "a", password: "b" }) {
      __typename
    }
  }
`

const AUTHENTICATED_ITEM = `
  query {
    authenticatedItem {
      __typename
    }
  }
`

async function runPlugin(query: string): Promise<void> {
  const plugin = createPasswordLoginBlockPlugin()
  const listener = await plugin.requestDidStart()
  await listener.didResolveOperation({ document: parse(query) })
}

function assertBlocked(err: unknown): true {
  assert.ok(err instanceof GraphQLError)
  assert.equal(err.message, 'Password login is disabled. Sign in with Google.')
  assert.equal(err.extensions.code, 'PASSWORD_LOGIN_DISABLED')
  assert.deepEqual(err.extensions.http, { status: 403 })
  return true
}

test('documentSelectsPasswordLogin detects a plain password mutation', () => {
  assert.equal(documentSelectsPasswordLogin(parse(PASSWORD_MUTATION)), true)
})

test('documentSelectsPasswordLogin detects an aliased password mutation', () => {
  assert.equal(documentSelectsPasswordLogin(parse(ALIASED_MUTATION)), true)
})

test('documentSelectsPasswordLogin follows a top-level fragment spread', () => {
  assert.equal(documentSelectsPasswordLogin(parse(FRAGMENT_MUTATION)), true)
})

test('documentSelectsPasswordLogin ignores the name in a string literal', () => {
  assert.equal(documentSelectsPasswordLogin(parse(STRING_LITERAL_QUERY)), false)
})

test('documentSelectsPasswordLogin ignores createInitialUser', () => {
  assert.equal(documentSelectsPasswordLogin(parse(CREATE_INITIAL_USER)), false)
})

test('documentSelectsPasswordLogin ignores the authenticatedItem query', () => {
  assert.equal(documentSelectsPasswordLogin(parse(AUTHENTICATED_ITEM)), false)
})

test('plugin throws PASSWORD_LOGIN_DISABLED for the password mutation', async () => {
  await assert.rejects(runPlugin(PASSWORD_MUTATION), assertBlocked)
})

test('plugin throws for an aliased password mutation', async () => {
  await assert.rejects(runPlugin(ALIASED_MUTATION), assertBlocked)
})

test('plugin throws for a password mutation behind a fragment', async () => {
  await assert.rejects(runPlugin(FRAGMENT_MUTATION), assertBlocked)
})

test('plugin allows a query that only names the mutation in a string', async () => {
  await runPlugin(STRING_LITERAL_QUERY)
})

test('plugin allows createInitialUser', async () => {
  await runPlugin(CREATE_INITIAL_USER)
})

test('plugin allows the authenticatedItem query', async () => {
  await runPlugin(AUTHENTICATED_ITEM)
})

const q = (s: string) => parse(s)

test('extract: literal email', () => {
  assert.deepEqual(
    extractPasswordLoginEmails(
      q(
        'mutation { authenticateUserWithPassword(email: "A@x.com", password: "p") { __typename } }'
      )
    ),
    { selected: true, emails: ['A@x.com'] }
  )
})

test('extract: variable email resolves from variables', () => {
  assert.deepEqual(
    extractPasswordLoginEmails(
      q(
        'mutation L($e: String!, $p: String!) { authenticateUserWithPassword(email: $e, password: $p) { __typename } }'
      ),
      { e: 'bot@x.com', p: 'p' }
    ),
    { selected: true, emails: ['bot@x.com'] }
  )
})

test('extract: alias, fragment, and multiple fields', () => {
  const doc = q(`
    mutation { a: authenticateUserWithPassword(email: "a@x.com", password: "p") { __typename } ...F }
    fragment F on Mutation { authenticateUserWithPassword(email: "b@x.com", password: "p") { __typename } }
  `)
  assert.deepEqual(extractPasswordLoginEmails(doc), {
    selected: true,
    emails: ['a@x.com', 'b@x.com'],
  })
})

test('extract: missing or unresolvable email yields null', () => {
  assert.deepEqual(
    extractPasswordLoginEmails(
      q(
        'mutation($e: String!) { authenticateUserWithPassword(email: $e, password: "p") { __typename } }'
      ),
      {}
    ),
    { selected: true, emails: [null] }
  )
  assert.deepEqual(
    extractPasswordLoginEmails(
      q(
        'mutation { authenticateUserWithPassword(password: "p") { __typename } }'
      )
    ),
    { selected: true, emails: [null] }
  )
})

test('extract: not selected for queries', () => {
  assert.deepEqual(
    extractPasswordLoginEmails(q('{ authenticatedItem { __typename } }')),
    { selected: false, emails: [] }
  )
})

function fakeContext(
  rows: Record<string, Record<string, unknown> | null>,
  opts: { throws?: boolean } = {}
) {
  const calls: unknown[] = []
  return {
    calls,
    contextValue: {
      sudo: () => ({
        query: {
          User: {
            async findOne(args: {
              where: Record<string, unknown>
              query?: string
            }) {
              calls.push(args)
              if (opts.throws) throw new Error('db down')
              return rows[String(args.where.email)] ?? null
            },
          },
        },
      }),
    },
  }
}

async function run(
  plugin: ReturnType<typeof createPasswordLoginBlockPlugin>,
  document: DocumentNode,
  contextValue: unknown,
  variables?: Record<string, unknown>
) {
  const hooks = await plugin.requestDidStart()
  return hooks.didResolveOperation({
    document,
    request: { variables },
    contextValue,
  })
}

const PW = q(
  'mutation { authenticateUserWithPassword(email: " Bot@X.com ", password: "p") { __typename } }'
)

// Same mutation as PW, but with the email exactly matching fakeContext's
// 'bot@x.com' row key, for cases that must reach the row lookup rather than
// short-circuit on a lookup miss.
const PW_EXACT = q(
  'mutation { authenticateUserWithPassword(email: "bot@x.com", password: "p") { __typename } }'
)

test('allow-list: allowed user passes and the lookup uses the exact email from the mutation', async () => {
  const ctx = fakeContext({ 'bot@x.com': { isPasswordLoginAllowed: true } })
  const doc = q(
    'mutation { authenticateUserWithPassword(email: "bot@x.com", password: "p") { __typename } }'
  )
  const plugin = createPasswordLoginBlockPlugin({
    allowListField: 'isPasswordLoginAllowed',
  })
  await run(plugin, doc, ctx.contextValue)
  assert.deepEqual(ctx.calls, [
    { where: { email: 'bot@x.com' }, query: 'isPasswordLoginAllowed' },
  ])
})

test('allow-list: lookup is exact, not normalized, so a near-miss is rejected', async () => {
  const ctx = fakeContext({ 'bot@x.com': { isPasswordLoginAllowed: true } })
  const plugin = createPasswordLoginBlockPlugin({
    allowListField: 'isPasswordLoginAllowed',
  })
  await assert.rejects(run(plugin, PW, ctx.contextValue))
  assert.deepEqual(ctx.calls, [
    { where: { email: ' Bot@X.com ' }, query: 'isPasswordLoginAllowed' },
  ])
})

test('allow-list: flag false, unknown user, non-boolean flag, throwing lookup, missing context all reject', async () => {
  const plugin = createPasswordLoginBlockPlugin({
    allowListField: 'isPasswordLoginAllowed',
  })
  // Exact-match fixtures for the cases that must reach the row: with the
  // lookup now exact (see the near-miss test above), driving these through
  // the mismatched PW email would make them reject on `!row` before ever
  // reading the flag, duplicating the 'unknown user' case.
  const truthyNotTrue = fakeContext({
    'bot@x.com': { isPasswordLoginAllowed: 1 },
  })
  const cases: Array<[string, DocumentNode, unknown]> = [
    [
      'flag false',
      PW_EXACT,
      fakeContext({ 'bot@x.com': { isPasswordLoginAllowed: false } })
        .contextValue,
    ],
    ['unknown user', PW, fakeContext({}).contextValue],
    ['flag truthy but not true', PW_EXACT, truthyNotTrue.contextValue],
    [
      'lookup throws',
      PW_EXACT,
      fakeContext(
        { 'bot@x.com': { isPasswordLoginAllowed: true } },
        { throws: true }
      ).contextValue,
    ],
    ['no context', PW, undefined],
    ['context without sudo', PW, {}],
  ]
  for (const [name, document, contextValue] of cases) {
    await assert.rejects(
      run(plugin, document, contextValue),
      (e: GraphQLError) => e.extensions.code === 'PASSWORD_LOGIN_DISABLED',
      name
    )
  }
  // Proves the 'flag truthy but not true' case actually reached the row
  // (rejected via `row[allowListField] !== true`) rather than missing it.
  assert.equal(
    truthyNotTrue.calls.length,
    1,
    'flag truthy but not true should reach the row lookup exactly once'
  )
})

test('allow-list: every selected field must be allowed', async () => {
  const doc = q(
    'mutation { a: authenticateUserWithPassword(email: "ok@x.com", password: "p") { __typename } b: authenticateUserWithPassword(email: "no@x.com", password: "p") { __typename } }'
  )
  const ctx = fakeContext({
    'ok@x.com': { isPasswordLoginAllowed: true },
    'no@x.com': { isPasswordLoginAllowed: false },
  })
  await assert.rejects(
    run(
      createPasswordLoginBlockPlugin({
        allowListField: 'isPasswordLoginAllowed',
      }),
      doc,
      ctx.contextValue
    )
  )
})

test('allow-list: every mutation operation in the document is inspected, regardless of operationName', async () => {
  const doc = q(`
    mutation A { authenticateUserWithPassword(email: "ok@x.com", password: "p") { __typename } }
    mutation B { authenticateUserWithPassword(email: "no@x.com", password: "p") { __typename } }
  `)
  const ctx = fakeContext({
    'ok@x.com': { isPasswordLoginAllowed: true },
    'no@x.com': { isPasswordLoginAllowed: false },
  })
  await assert.rejects(
    run(
      createPasswordLoginBlockPlugin({
        allowListField: 'isPasswordLoginAllowed',
      }),
      doc,
      ctx.contextValue
    )
  )
})

test('allow-list: a password field under @skip(if: true) is still checked', async () => {
  const doc = q(
    'mutation { authenticateUserWithPassword(email: "no@x.com", password: "p") @skip(if: true) { __typename } }'
  )
  const ctx = fakeContext({ 'no@x.com': { isPasswordLoginAllowed: false } })
  await assert.rejects(
    run(
      createPasswordLoginBlockPlugin({
        allowListField: 'isPasswordLoginAllowed',
      }),
      doc,
      ctx.contextValue
    )
  )
})

test('allow-list: an email inside an inline fragment on Mutation is collected', async () => {
  const doc = q(
    'mutation { ... on Mutation { authenticateUserWithPassword(email: "no@x.com", password: "p") { __typename } } }'
  )
  const ctx = fakeContext({ 'no@x.com': { isPasswordLoginAllowed: false } })
  await assert.rejects(
    run(
      createPasswordLoginBlockPlugin({
        allowListField: 'isPasswordLoginAllowed',
      }),
      doc,
      ctx.contextValue
    )
  )
})

test('allow-list: unresolvable email rejects without a lookup', async () => {
  const ctx = fakeContext({ 'bot@x.com': { isPasswordLoginAllowed: true } })
  const doc = q(
    'mutation($e: String!) { authenticateUserWithPassword(email: $e, password: "p") { __typename } }'
  )
  await assert.rejects(
    run(
      createPasswordLoginBlockPlugin({
        allowListField: 'isPasswordLoginAllowed',
      }),
      doc,
      ctx.contextValue,
      {}
    )
  )
  assert.equal(ctx.calls.length, 0)
})

test('allow-list: custom listKey is used', async () => {
  const calls: unknown[] = []
  const contextValue = {
    sudo: () => ({
      query: {
        Account: {
          async findOne(a: unknown) {
            calls.push(a)
            return { ok: true }
          },
        },
      },
    }),
  }
  await run(
    createPasswordLoginBlockPlugin({
      allowListField: 'ok',
      listKey: 'Account',
    }),
    PW,
    contextValue
  )
  assert.equal(calls.length, 1)
})

test('block-all mode (no allowListField) still rejects regardless of context', async () => {
  const ctx = fakeContext({ 'bot@x.com': { isPasswordLoginAllowed: true } })
  await assert.rejects(
    run(createPasswordLoginBlockPlugin(), PW, ctx.contextValue)
  )
  assert.equal(ctx.calls.length, 0)
})

test('non-password operations never touch the context', async () => {
  const ctx = fakeContext({})
  await run(
    createPasswordLoginBlockPlugin({ allowListField: 'x' }),
    q('{ authenticatedItem { __typename } }'),
    ctx.contextValue
  )
  assert.equal(ctx.calls.length, 0)
})
