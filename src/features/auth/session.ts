export type AuthSession = {
  token: string
  expiraEm: string
  usuario: {
    id: string
    nome: string
    email: string
  }
  perfil: 'Admin' | 'Athlete'
}

const sessionKey = 'beachtennis.session'

export function getAuthSession(): AuthSession | null {
  const stored = localStorage.getItem(sessionKey)
  if (!stored) return null

  try {
    const session: unknown = JSON.parse(stored)
    if (
      typeof session !== 'object'
      || session === null
      || !('token' in session)
      || typeof session.token !== 'string'
      || !('expiraEm' in session)
      || typeof session.expiraEm !== 'string'
      || !('perfil' in session)
      || (session.perfil !== 'Admin' && session.perfil !== 'Athlete')
      || !('usuario' in session)
      || typeof session.usuario !== 'object'
      || session.usuario === null
      || !('id' in session.usuario)
      || typeof session.usuario.id !== 'string'
      || !('nome' in session.usuario)
      || typeof session.usuario.nome !== 'string'
      || !('email' in session.usuario)
      || typeof session.usuario.email !== 'string'
    ) {
      localStorage.removeItem(sessionKey)
      return null
    }

    const validSession = session as AuthSession
    const expirationTime = new Date(validSession.expiraEm).getTime()
    if (!Number.isFinite(expirationTime) || expirationTime <= Date.now()) {
      localStorage.removeItem(sessionKey)
      return null
    }

    return validSession
  } catch {
    localStorage.removeItem(sessionKey)
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(sessionKey)
}
