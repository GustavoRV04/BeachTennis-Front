import { CalendarDays, CalendarRange, CircleDot, LayoutDashboard } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import arenaLogo from '@/assets/logo.png'

const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/reservas', label: 'Reservar quadra', icon: CalendarDays },
  { to: '/minhas-reservas', label: 'Minhas reservas', icon: CalendarRange },
  { to: '/quadras', label: 'Conhecer quadras', icon: CircleDot },
]

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="BeachTennis, página inicial">
          <span className="brand-logo-plate"><img alt="Arena BT - Gestão de quadras" src={arenaLogo} /></span>
        </Link>

        <p className="nav-caption">GESTÃO</p>
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
          <span className="topbar-label">PAINEL DE GESTÃO</span>
          <span className="connection-status"><span /> Dados demonstrativos</span>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}