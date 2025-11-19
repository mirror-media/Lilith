import { utils } from '@mirrormedia/lilith-core'
import { ListAccessControl } from '@keystone-6/core/types'

const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

type Role = 'admin' | 'moderator' | 'editor' | 'contributor'

const accessControlStrategy = process.env.ACCESS_CONTROL_STRATEGY || 'cms'

export const customAllowRoles = (
  roles: Role[]
): ListAccessControl<any> => {
  if (accessControlStrategy === 'gql') {
    return {
      filter: {},
      item: {
        create: () => true,
        update: () => true,
        delete: () => true,
      },
    }
  }

  return allowRoles(...roles)
}

export const gqlReadOnly = () => {
  if (accessControlStrategy === 'gql') {
    return true
  }
  return allowRoles(admin, moderator, editor, contributor)
}

export const gqlReadAndCreate = () => {
  if (accessControlStrategy === 'gql') {
    return {
      query: () => true,
      create: () => true,
      update: () => true,
      delete: allowRoles(admin, moderator),
    }
  }

  return {
    query: allowRoles(admin, moderator, editor, contributor),
    create: allowRoles(admin, moderator),
    update: allowRoles(admin, moderator),
    delete: allowRoles(admin, moderator),
  }
}

export const User = {
  query: allowRoles(admin, moderator, editor),
  update: allowRoles(admin, moderator, editor),
  create: allowRoles(admin, moderator),
  delete: allowRoles(admin),
}
