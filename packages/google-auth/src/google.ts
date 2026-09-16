import { OAuth2Client } from 'google-auth-library'

export type GoogleIdentity = {
  email: string | null
  emailVerified: boolean
  hd: string | null
  nonce: string | null
}

export type GoogleClient = {
  buildAuthUrl(args: { state: string; nonce: string; hdHint?: string }): string
  /** Exchanges the code and verifies the ID token. Throws on any failure. */
  exchangeCode(code: string): Promise<GoogleIdentity>
}

export type GoogleClientConfig = {
  clientId: string
  clientSecret: string
  callbackUrl: string
}

export function createGoogleClient(config: GoogleClientConfig): GoogleClient {
  const oauth2 = new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.callbackUrl,
  })

  return {
    buildAuthUrl({ state, nonce, hdHint }) {
      const url = new URL(
        oauth2.generateAuthUrl({
          scope: ['openid', 'email', 'profile'],
          state,
          prompt: 'select_account',
          ...(hdHint ? { hd: hdHint } : {}),
        })
      )
      // generateAuthUrl has no nonce option; OIDC nonce is added by hand.
      url.searchParams.set('nonce', nonce)
      return url.toString()
    },

    async exchangeCode(code) {
      const { tokens } = await oauth2.getToken(code)
      if (!tokens.id_token) {
        throw new Error('Google token response did not include an id_token')
      }
      const ticket = await oauth2.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.clientId,
      })
      const payload = ticket.getPayload()
      if (!payload) throw new Error('Google ID token has no payload')
      return {
        email: payload.email ? payload.email.toLowerCase() : null,
        emailVerified: payload.email_verified === true,
        hd: payload.hd ?? null,
        nonce: payload.nonce ?? null,
      }
    },
  }
}
