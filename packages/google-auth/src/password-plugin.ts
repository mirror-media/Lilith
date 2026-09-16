import { GraphQLError, Kind } from 'graphql'
import type {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  SelectionNode,
} from 'graphql'
import type { KeystoneListQuery } from './types'

/** Field name of Keystone's password mutation for listKey 'User'. */
export const PASSWORD_MUTATION_FIELD = 'authenticateUserWithPassword'

const BLOCKED_MESSAGE = 'Password login is disabled. Sign in with Google.'

/**
 * True when any mutation operation in the document selects the password
 * mutation at top level, directly or through a fragment spread. Working on the
 * parsed document instead of the raw query string is what makes this immune to
 * the multipart bypass: Keystone mounts `graphqlUploadExpress` after
 * `extendExpressApp`, so an HTTP-layer guard never sees the operation carried
 * in a multipart `operations` field.
 */
export function documentSelectsPasswordLogin(document: DocumentNode): boolean {
  return extractPasswordLoginEmails(document).selected
}

/**
 * Collects the `email` argument of every top-level `authenticateUserWithPassword`
 * field selected by a mutation operation in the document (aliases and
 * fragments included), one entry per selected field, in document order. An
 * entry is `null` when the `email` argument is missing, is not a string
 * literal, or is a variable that does not resolve to a string in `variables`.
 * `selected` is false (and `emails` empty) when the document selects no
 * password mutation field at all.
 */
export function extractPasswordLoginEmails(
  document: DocumentNode,
  variables?: Record<string, unknown> | null
): { selected: boolean; emails: Array<string | null> } {
  const fragments = new Map<string, FragmentDefinitionNode>()
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragments.set(definition.name.value, definition)
    }
  }

  const emails: Array<string | null> = []
  const visit = (
    selections: readonly SelectionNode[],
    visited: Set<string>
  ) => {
    for (const selection of selections) {
      if (selection.kind === Kind.FIELD) {
        if (selection.name.value === PASSWORD_MUTATION_FIELD) {
          emails.push(emailArgument(selection, variables))
        }
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        visit(selection.selectionSet.selections, visited)
      } else {
        const name = selection.name.value
        // A self-referential fragment would otherwise recurse forever.
        if (visited.has(name)) continue
        visited.add(name)
        const fragment = fragments.get(name)
        if (fragment) visit(fragment.selectionSet.selections, visited)
      }
    }
  }

  // Every mutation operation in the document is inspected, not just the one
  // Apollo would execute for a given `operationName`, and `visit` above does
  // not look at `@skip`/`@include` directives on the field. That makes this a
  // superset of what will actually run: a denial decision can never be
  // bypassed by naming a different operation or attaching an execution-time
  // directive, since both are irrelevant to what gets inspected here.
  for (const definition of document.definitions) {
    if (
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === 'mutation'
    ) {
      visit(definition.selectionSet.selections, new Set())
    }
  }

  return { selected: emails.length > 0, emails }
}

function emailArgument(
  field: FieldNode,
  variables?: Record<string, unknown> | null
): string | null {
  const arg: ArgumentNode | undefined = field.arguments?.find(
    (a) => a.name.value === 'email'
  )
  if (!arg) return null
  if (arg.value.kind === Kind.STRING) return arg.value.value
  if (arg.value.kind === Kind.VARIABLE) {
    const v = variables?.[arg.value.name.value]
    return typeof v === 'string' ? v : null
  }
  return null
}

function blocked(): GraphQLError {
  return new GraphQLError(BLOCKED_MESSAGE, {
    extensions: { code: 'PASSWORD_LOGIN_DISABLED', http: { status: 403 } },
  })
}

/** Options for {@link createPasswordLoginBlockPlugin}. */
export type PasswordLoginBlockPluginOptions = {
  /**
   * User field name that permits password login when strictly `true`.
   * Absent = block every password login (unchanged default behaviour).
   */
  allowListField?: string
  /** Keystone list holding the field. Default `'User'`. */
  listKey?: string
}

/**
 * Structural view of the slice of a Keystone `sudo` context this package
 * needs to look up the allow-list field, built from the same
 * `KeystoneListQuery` shape `KeystoneContext` uses (`./types`) so the two
 * cannot drift; still typed by hand so the package does not depend on
 * @keystone-6/core.
 */
export type SudoQueryContext = {
  sudo(): { query: Record<string, KeystoneListQuery> }
}

/**
 * The slice of Apollo Server 4's `GraphQLRequestContext` this plugin reads:
 * the parsed document, the request's variables (for a variable `email`
 * argument), and the request's `contextValue` (a `KeystoneContext` at
 * runtime, consulted only in allow-list mode).
 */
export type PasswordLoginRequestContext = {
  document: DocumentNode
  request?: { variables?: Record<string, unknown> | null }
  contextValue?: unknown
}

/**
 * Structural view of the slice of Apollo Server 4's plugin API this package
 * uses. Typed by hand so the package does not depend on @apollo/server; the
 * shape is assignable to `ApolloServerPlugin` where the host needs it.
 */
export type PasswordLoginBlockPlugin = {
  requestDidStart(): Promise<{
    didResolveOperation(
      requestContext: PasswordLoginRequestContext
    ): Promise<void>
  }>
}

/**
 * Apollo Server plugin that guards the password mutation. With no
 * `allowListField` it rejects every password login with 403, unchanged from
 * block-all mode. With `allowListField` set, it instead resolves the
 * mutation's `email` argument(s), looks each user up via
 * `contextValue.sudo().query[listKey].findOne(...)`, and allows the request
 * only when every selected password login's email resolves and that user's
 * `allowListField` is strictly `true`. The lookup uses the email exactly as
 * given in the mutation, with no trimming or case-folding: Keystone's own
 * `validateSecret` looks the user up the same way
 * (`findOne({ where: { email: identity } })` on the raw string), and
 * `User.email` is a case-sensitive unique `text()`, so `bot@x.com` and
 * `Bot@X.com` can be two different rows. Normalizing here would let this
 * plugin approve one row while Keystone goes on to authenticate a different
 * one. Add it to `config.graphql.apolloConfig.plugins` whenever the password
 * kill switch is on; the mini-app's HTTP guard alone cannot see multipart
 * requests.
 */
export function createPasswordLoginBlockPlugin(
  options: PasswordLoginBlockPluginOptions = {}
): PasswordLoginBlockPlugin {
  const { allowListField, listKey = 'User' } = options
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const { selected, emails } = extractPasswordLoginEmails(
            requestContext.document,
            requestContext.request?.variables
          )
          if (!selected) return
          if (!allowListField) throw blocked()
          if (emails.some((e) => e === null)) throw blocked()

          const context = requestContext.contextValue as
            | Partial<SudoQueryContext>
            | undefined
          if (!context || typeof context.sudo !== 'function') throw blocked()

          const resolvedEmails = emails.filter((e): e is string => e !== null)
          const listQuery = context.sudo().query[listKey]
          for (const email of resolvedEmails) {
            let row: Record<string, unknown> | null
            try {
              row = await listQuery.findOne({
                where: { email },
                query: allowListField,
              })
            } catch {
              throw blocked()
            }
            if (!row || row[allowListField] !== true) throw blocked()
          }
        },
      }
    },
  }
}
