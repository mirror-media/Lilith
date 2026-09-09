import { GraphQLError, Kind } from 'graphql'
import type {
  DocumentNode,
  FragmentDefinitionNode,
  SelectionNode,
} from 'graphql'

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
  const fragments = new Map<string, FragmentDefinitionNode>()
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragments.set(definition.name.value, definition)
    }
  }

  const selectsPasswordLogin = (
    selections: readonly SelectionNode[],
    visited: Set<string>
  ): boolean =>
    selections.some((selection) => {
      if (selection.kind === Kind.FIELD) {
        return selection.name.value === PASSWORD_MUTATION_FIELD
      }
      if (selection.kind === Kind.INLINE_FRAGMENT) {
        return selectsPasswordLogin(selection.selectionSet.selections, visited)
      }
      const name = selection.name.value
      // A self-referential fragment would otherwise recurse forever.
      if (visited.has(name)) return false
      visited.add(name)
      const fragment = fragments.get(name)
      return fragment
        ? selectsPasswordLogin(fragment.selectionSet.selections, visited)
        : false
    })

  return document.definitions.some(
    (definition) =>
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === 'mutation' &&
      selectsPasswordLogin(definition.selectionSet.selections, new Set())
  )
}

/**
 * Structural view of the slice of Apollo Server 4's plugin API this package
 * uses. Typed by hand so the package does not depend on @apollo/server; the
 * shape is assignable to `ApolloServerPlugin` where the host needs it.
 */
export type PasswordLoginBlockPlugin = {
  requestDidStart(): Promise<{
    didResolveOperation(requestContext: {
      document: DocumentNode
    }): Promise<void>
  }>
}

/**
 * Apollo Server plugin that rejects the password mutation with 403. Add it to
 * `config.graphql.apolloConfig.plugins` whenever the password kill switch is
 * on; the mini-app's HTTP guard alone cannot see multipart requests.
 */
export function createPasswordLoginBlockPlugin(): PasswordLoginBlockPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          if (documentSelectsPasswordLogin(requestContext.document)) {
            throw new GraphQLError(BLOCKED_MESSAGE, {
              extensions: {
                code: 'PASSWORD_LOGIN_DISABLED',
                http: { status: 403 },
              },
            })
          }
        },
      }
    },
  }
}
