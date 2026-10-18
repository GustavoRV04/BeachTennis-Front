import { useState, type FormEvent } from 'react'
import { ArrowLeft, KeyRound, ShieldCheck, UserRoundPlus } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { saveAuthSession } from '@/features/auth/session'
import { getApiErrorMessage, login, registerAthlete } from '@/services/api/client'
import './AuthPage.css'

type AuthMode = 'login' | 'register'

function safeReturnPath(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/'
}

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isAdminLogin = searchParams.get('perfil') === 'admin'
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const session = mode === 'register'
        ? await registerAthlete({ nome: name.trim(), email: email.trim(), senha: password })
        : await login({ email: email.trim(), senha: password })

      if (isAdminLogin && session.perfil !== 'Admin') {
        setError('Esta conta não tem acesso administrativo.')
        return
      }
      if (!isAdminLogin && session.perfil === 'Admin') {
        setError('Use a entrada da área administrativa.')
        return
      }

      saveAuthSession(session)
      navigate(safeReturnPath(searchParams.get('returnTo')), { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível autenticar. Verifique os dados e tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-back" to="/"><ArrowLeft size={16} /> Voltar ao início</Link>
        <span className="auth-icon">{isAdminLogin ? <ShieldCheck size={23} /> : mode === 'register' ? <UserRoundPlus size={23} /> : <KeyRound size={23} />}</span>
        <p className="auth-eyebrow">{isAdminLogin ? 'ÁREA ADMINISTRATIVA' : 'ÁREA DO ATLETA'}</p>
        <h1 id="auth-title">{isAdminLogin ? 'Acesso da arena' : mode === 'register' ? 'Criar conta de atleta' : 'Entre na sua conta'}</h1>
        <p className="auth-description">
          {isAdminLogin
            ? 'Entre com a conta administrativa configurada pela arena.'
            : mode === 'register'
              ? 'Cadastre-se para reservar quadras e acompanhar seus horários.'
              : 'Entre ou crie uma conta para confirmar sua reserva.'}
        </p>

        {!isAdminLogin && (
          <div className="auth-tabs" role="tablist" aria-label="Tipo de acesso">
            <button aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setError('') }} role="tab" type="button">Entrar</button>
            <button aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setError('') }} role="tab" type="button">Criar conta</button>
          </div>
        )}

        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          {mode === 'register' && !isAdminLogin && (
            <label>Nome completo
              <input autoComplete="name" maxLength={120} onChange={(event) => setName(event.target.value)} required value={name} />
            </label>
          )}
          <label>E-mail
            <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label>Senha
            <input autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : undefined} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            {mode === 'register' && !isAdminLogin && <small>Use pelo menos 8 caracteres.</small>}
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={submitting} type="submit">
            {submitting ? 'Aguarde...' : isAdminLogin ? 'Entrar como administrador' : mode === 'register' ? 'Criar conta e continuar' : 'Entrar e continuar'}
          </button>
        </form>

        {!isAdminLogin && <Link className="auth-admin-link" to="/acesso?perfil=admin&returnTo=%2Fadmin">Acesso administrativo</Link>}
      </section>
    </div>
  )
}
