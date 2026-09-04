import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      mfaVerified: boolean
    } & DefaultSession['user']
  }
  interface User {
    mfaVerified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    mfaVerified?: boolean
    app?: 'web' | 'lms'
  }
}
