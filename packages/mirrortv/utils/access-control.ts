import { UserRole } from '../type'

type AuthArgs = {
  session?: {
    data?: {
      role?: string
    }
  }
}

// mirrortv-specific role, intentionally NOT added to lilith-core's ROLES:
// a bare allowAllRoles() must never grant it, so every list opts in explicitly.
// Pass this checker to allowRoles()/allowAllRoles() alongside the core ones.
export const reporter = (auth: AuthArgs): boolean =>
  auth?.session?.data?.role === UserRole.Reporter
