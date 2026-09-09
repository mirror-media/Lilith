import test from 'node:test'
import assert from 'node:assert/strict'
import { GraphQLError, parse } from 'graphql'
import {
  createPasswordLoginBlockPlugin,
  documentSelectsPasswordLogin,
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
