import { CalendarDays, CalendarRange, CircleDot, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import arenaLogo from '@/assets/logo.png'
import { clearAuthSession, getAuthSession } from '@/features/auth/session'

const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/reservas', label: 'Reservar quadra', icon: CalendarDays },
  { to: '/minhas-reservas', label: 'Minhas reservas', icon: CalendarRange },
  { to: '/quadras', label: 'Conhecer quadras', icon: CircleDot },
  { to: '/admin', label: 'Área administrativa', icon: ShieldCheck },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = getAuthSession()

  const signOut = () => {
    clearAuthSession()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="BeachTennis, página inicial">
          <span className="brand-logo-plate"><img alt="Arena BT - Gestão de quadras" src={arenaLogo} /></span>
        </Link>

        <p className="nav-caption">MENU</p>
        <nav className="primary-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="venue-avatar">BT</span>
          <span className="venue-copy">
            <strong>Minha arena</strong>
            <small>Plano de gestão</small>
          </span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="topbar-label">ARENA BEACH TENNIS</span>
          <div className="topbar-account">
            <span className="connection-status"><span />{session ? `Olá, ${session.usuario.nome}` : 'Acesso público'}</span>
            {session
              ? <button className="account-action" onClick={signOut} type="button">Sair</button>
              : location.pathname !== '/acesso' && <Link className="account-action" to={`/acesso?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}>Entrar</Link>}
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}