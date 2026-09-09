import test from 'node:test'
import assert from 'node:assert/strict'
import type { Request, Response } from 'express'
import { signInByEmail } from './session'
import type { KeystoneContext, KeystoneRequestContext } from './types'

type StartArgs = Parameters<
  NonNullable<KeystoneRequestContext['sessionStrategy']>['start']
>[0]

function makeContext(options: {
  user: Record<string, unknown> | null
  startResult?: string | undefined
  withSessionStrategy?: boolean
}) {
  const calls: {
    findOne: unknown[]
    withRequest: unknown[]
    start: StartArgs[]
  } = {
    findOne: [],
    withRequest: [],
    start: [],
  }
  const requestContext: KeystoneRequestContext = {
    sessionStrategy:
      options.withSessionStrategy === false
        ? undefined
        : {
            async start(args) {
              calls.start.push(args)
              return options.startResult === undefined
                ? 'sealed-token'
                : options.startResult
            },
          },
  }
  const context: KeystoneContext = {
    sudo: () => ({
      query: {
        User: {
          async findOne(args) {
            calls.findOne.push(args)
            return options.user
          },
        },
      },
    }),
    async withRequest(req, res) {
      calls.withRequest.push([req, res])
      return requestContext
    },
  }
  return { context, calls, requestContext }
}

const req = { id: 'req' } as unknown as Request
const res = { id: 'res' } as unknown as Response

test('starts a session for an existing user', async () => {
  const { context, calls, requestContext } = makeContext({
    user: { id: 42, email: 'a@mirrormedia.mg', name: 'A', role: 'editor' },
  })
  const result = await signInByEmail(context, req, res, 'a@mirrormedia.mg')
  assert.deepEqual(result, {
    ok: true,
    user: { id: '42', email: 'a@mirrormedia.mg', name: 'A', role: 'editor' },
  })
  assert.deepEqual(calls.findOne[0], {
    where: { email: 'a@mirrormedia.mg' },
    query: 'id email name role',
  })
  assert.deepEqual(calls.withRequest[0], [req, res])
  assert.equal(calls.start.length, 1)
  assert.deepEqual(calls.start[0].data, { listKey: 'User', itemId: '42' })
  assert.equal(calls.start[0].context, requestContext)
})

test('returns no_user and never touches the session when the email is unknown', async () => {
  const { context, calls } = makeContext({ user: null })
  const result = await signInByEmail(context, req, res, 'x@mirrormedia.mg')
  assert.deepEqual(result, { ok: false, reason: 'no_user' })
  assert.equal(calls.withRequest.length, 0)
  assert.equal(calls.start.length, 0)
})

test('returns session when start yields no token', async () => {
  const { context } = makeContext({ user: { id: 1 }, startResult: '' })
  const result = await signInByEmail(context, req, res, 'a@mirrormedia.mg')
  assert.deepEqual(result, { ok: false, reason: 'session' })
})

test('returns session when the context has no sessionStrategy', async () => {
  const { context } = makeContext({
    user: { id: 1 },
    withSessionStrategy: false,
  })
  const result = await signInByEmail(context, req, res, 'a@mirrormedia.mg')
  assert.deepEqual(result, { ok: false, reason: 'session' })
})
