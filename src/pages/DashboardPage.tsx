import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays, CircleDot, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage, listCourts, listReservationsForWeek } from '@/services/api/client'

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export default function DashboardPage() {
  const [courtCount, setCourtCount] = useState<string>('—')
  const [busyCount, setBusyCount] = useState<string>('—')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const start = startOfToday()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    Promise.all([
      listCourts(),
      listReservationsForWeek(start.toISOString()),
    ])
      .then(([courts, reservations]) => {
        if (!active) return
        setCourtCount(String(courts.length))
        setBusyCount(String(reservations.filter((reservation) =>
          reservation.status.toLocaleLowerCase('pt-BR').includes('confirm')
          && new Date(reservation.inicio) < end
          && new Date(reservation.fim) > start,
        ).length))
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, 'Não foi possível carregar o resumo da arena.'))
      })

    return () => { active = false }
  }, [])

  const overview = [
    { label: 'Quadras disponíveis', value: courtCount, icon: CircleDot, note: 'Ver estrutura', to: '/quadras' },
    { label: 'Reservas de hoje', value: busyCount, icon: CalendarDays, note: 'Horários ocupados', to: '/reservas' },
    { label: 'Quer jogar hoje?', value: 'Reservar', icon: CalendarDays, note: 'Escolha um horário', to: '/reservas' },
  ]

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SUA ARENA, EM UM SÓ LUGAR</p>
          <h1>Visão geral</h1>
          <p className="page-description">Consulte quadras e horários ou entre na sua conta para reservar.</p>
        </div>
        <Link className="date-label" to="/admin">ACESSO DA ARENA</Link>
      </div>

      {error && <p className="dashboard-error" role="alert">{error}</p>}

      <section className="metric-grid" aria-label="Resumo da arena">
        {overview.map(({ label, value, icon: Icon, note, to }, index) => (
          <Link className={`metric-card metric-card-${index + 1}`} key={label} to={to}>
            <div className="metric-topline">
              <span>{label}</span>
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <strong className="metric-value">{value}</strong>
            <span className="metric-note">{note}</span>
          </Link>
        ))}
      </section>

      <section className="setup-panel">
        <div className="setup-icon"><ShieldCheck size={19} /></div>
        <div>
          <p className="eyebrow">GESTÃO DA ARENA</p>
          <h2>Você administra as quadras?</h2>
          <p>Entre com a conta administrativa para cadastrar, editar ou desativar quadras.</p>
          <Link className="dashboard-admin-link" to="/admin">Abrir administração <ArrowUpRight size={14} /></Link>
        </div>
      </section>
    </>
  )
}
