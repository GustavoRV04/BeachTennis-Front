import { useEffect, useState } from 'react'
import { CalendarCheck, Check, Clock3, Copy, Share2, ShieldCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAuthSession } from '@/features/auth/session'
import { mapCourt, type Court } from '@/features/courts/data'
import {
  cancelReservation,
  getApiErrorMessage,
  listCourts,
  listMyReservations,
  type Reservation,
} from '@/services/api/client'
import './MyReservationsPage.css'

type Booking = Reservation & {
  dateLabel: string
  startTime: string
  duration: number
  isCancelled: boolean
}

function toBooking(reservation: Reservation, today: Date): Booking {
  const start = new Date(reservation.inicio)
  const end = new Date(reservation.fim)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dateLabel = start.toDateString() === today.toDateString()
    ? 'Hoje'
    : start.toDateString() === tomorrow.toDateString()
      ? 'Amanhã'
      : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(start)

  return {
    ...reservation,
    dateLabel,
    startTime: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(start),
    duration: Math.round((end.getTime() - start.getTime()) / 60000),
    isCancelled: reservation.status.toLocaleLowerCase('pt-BR').includes('cancel'),
  }
}

function endTime(startTime: string, duration: number) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const total = hours * 60 + minutes + duration
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const hasSession = session !== null
  const isAthlete = session?.perfil === 'Athlete'
  const [now] = useState(() => new Date())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const bookings = reservations.map((reservation) => toBooking(reservation, now))
  const upcoming = bookings.filter((booking) => !booking.isCancelled && new Date(booking.fim) > now)
  const history = bookings.filter((booking) => booking.isCancelled || new Date(booking.fim) <= now)

  useEffect(() => {
    if (!hasSession) {
      navigate(`/acesso?returnTo=${encodeURIComponent('/minhas-reservas')}`, { replace: true })
      return
    }
    if (!isAthlete) {
      navigate('/admin', { replace: true })
      return
    }

    let active = true
    Promise.all([listCourts(), listMyReservations()])
      .then(([courtDtos, athleteReservations]) => {
        if (!active) return
        setCourts(courtDtos.map(mapCourt))
        setReservations(athleteReservations)
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, 'Não foi possível carregar suas reservas.'))
      })

    return () => { active = false }
  }, [hasSession, isAthlete, navigate])

  const getCourt = (booking: Booking) =>
    courts.find((item) => item.id === booking.quadraId)
    ?? mapCourt({ id: booking.quadraId, nome: 'Quadra da arena', ativa: true })

  const shareBooking = async (booking: Booking) => {
    const court = getCourt(booking)
    const message = `${court.name} • ${booking.dateLabel}, ${booking.startTime} - ${endTime(booking.startTime, booking.duration)}`
    try {
      await navigator.clipboard.writeText(message)
      setNotice('Detalhes da reserva copiados.')
    } catch {
      setNotice(`Não foi possível copiar. ${message}`)
    }
    window.setTimeout(() => setNotice(''), 4000)
  }

  const confirmCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    setError('')
    try {
      await cancelReservation(cancelTarget.id)
      setReservations((current) => current.map((reservation) =>
        reservation.id === cancelTarget.id ? { ...reservation, status: 'Cancelada' } : reservation,
      ))
      setCancelTarget(null)
      setNotice('Reserva cancelada.')
      window.setTimeout(() => setNotice(''), 3000)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível cancelar a reserva.'))
    } finally {
      setCancelling(false)
    }
  }

  if (!isAthlete) return null

  return (
    <div className="my-bookings-page">
      <header className="my-bookings-heading">
        <div>
          <p className="my-bookings-eyebrow"><CalendarCheck size={15} /> ÁREA DO ATLETA</p>
          <h1>Minhas reservas</h1>
          <p>Acompanhe os horários vinculados à sua conta.</p>
        </div>
        <div className="booking-status-note"><Clock3 size={16} /><span>Horários locais da arena</span></div>
      </header>

      {error && <p className="booking-toast" role="alert">{error}</p>}

      <div className="booking-tabs" role="tablist" aria-label="Reservas por período">
        <button aria-selected={activeTab === 'upcoming'} className={activeTab === 'upcoming' ? 'is-active' : ''} onClick={() => setActiveTab('upcoming')} role="tab" type="button">Próximos jogos <span>{upcoming.length}</span></button>
        <button aria-selected={activeTab === 'history'} className={activeTab === 'history' ? 'is-active' : ''} onClick={() => setActiveTab('history')} role="tab" type="button">Histórico <span>{history.length}</span></button>
      </div>

      {activeTab === 'upcoming' ? (
        <section aria-label="Próximos jogos" className="booking-list">
          {upcoming.length ? upcoming.map((booking, index) => {
            const court = getCourt(booking)
            return (
              <article className="my-booking-card" key={booking.id}>
                <div className={`booking-color-bar booking-color-${index % 2}`} />
                <div className="my-booking-photo"><img alt={court.imageAlt} loading="lazy" src={court.image} /><span>{court.covering}</span></div>
                <div className="my-booking-content">
                  <div className="my-booking-title-row">
                    <div><p className="booking-reference">RESERVA #{booking.id} <span>•</span> Beach tennis</p><h2>{court.name}</h2></div>
                    <span className="booking-confirmed"><i /> Confirmada</span>
                  </div>
                  <div className="booking-facts">
                    <div><small>DATA E HORÁRIO</small><strong>{booking.dateLabel}, {booking.startTime}</strong></div>
                    <div><small>DURAÇÃO</small><strong>{booking.duration} min</strong></div>
                    <div><small>VALOR (NA ARENA)</small><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.valor)}</strong></div>
                    <div><small>STATUS</small><strong>{booking.status}</strong></div>
                  </div>
                  <div className="booking-actions">
                    <button className="booking-share" onClick={() => void shareBooking(booking)} type="button"><Share2 size={14} /> Compartilhar detalhes</button>
                    <button className="booking-cancel" onClick={() => setCancelTarget(booking)} type="button"><X size={14} /> Cancelar reserva</button>
                  </div>
                </div>
              </article>
            )
          }) : <div className="booking-empty"><CalendarCheck size={24} /><strong>Nenhum jogo agendado</strong><span>Suas próximas reservas vão aparecer aqui.</span></div>}
        </section>
      ) : (
        <section aria-label="Histórico de jogos" className="history-panel">
          <div className="history-heading"><h2>Partidas anteriores</h2><span>RESERVAS DA SUA CONTA</span></div>
          {history.length ? history.map((booking) => {
            const court = getCourt(booking)
            return (
              <article className="history-row" key={booking.id}>
                <span className="history-icon"><Check size={17} /></span>
                <div><strong>{court.name}</strong><p>{booking.dateLabel} · {booking.startTime} - {endTime(booking.startTime, booking.duration)}</p></div>
                <span className={booking.isCancelled ? 'history-cancelled' : 'history-complete'}>{booking.isCancelled ? 'Cancelada' : 'Concluída'}</span>
                {!booking.isCancelled && <button aria-label="Copiar detalhes da reserva" className="history-share" onClick={() => void shareBooking(booking)} type="button"><Copy size={16} /></button>}
              </article>
            )
          }) : <p>Nenhuma reserva no histórico.</p>}
        </section>
      )}

      <section className="booking-policy">
        <span><ShieldCheck size={21} /></span>
        <div><h2>Cancelamento</h2><p>O cancelamento é enviado à API. O pagamento deve ser combinado com a arena.</p></div>
      </section>

      {notice && <div aria-live="polite" className="booking-toast">{notice}</div>}

      {cancelTarget && (
        <div className="booking-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelTarget(null) }}>
          <section aria-labelledby="cancel-title" aria-modal="true" className="cancel-dialog" role="dialog">
            <button aria-label="Fechar" className="cancel-close" onClick={() => setCancelTarget(null)} type="button"><X size={18} /></button>
            <span className="cancel-dialog-icon"><ShieldCheck size={22} /></span>
            <p className="my-bookings-eyebrow">CONFIRMAÇÃO</p>
            <h2 id="cancel-title">Cancelar esta reserva?</h2>
            <p>Esta ação será enviada à API e não poderá ser desfeita.</p>
            <div className="cancel-dialog-actions"><button disabled={cancelling} onClick={() => setCancelTarget(null)} type="button">Manter reserva</button><button disabled={cancelling} onClick={() => void confirmCancel()} type="button">{cancelling ? 'Cancelando...' : 'Confirmar cancelamento'}</button></div>
          </section>
        </div>
      )}
    </div>
  )
}
