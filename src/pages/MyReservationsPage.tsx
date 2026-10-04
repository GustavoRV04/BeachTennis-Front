import { useState } from 'react'
import { CalendarCheck, Check, Clock3, Copy, Share2, ShieldCheck, X } from 'lucide-react'
import { courts } from '@/features/courts/data'
import './MyReservationsPage.css'

type BookingStatus = 'confirmed' | 'cancelled'
type Booking = {
  id: string
  courtId: string
  date: string
  dateLabel: string
  startTime: string
  duration: number
  payment: string
  players: string
  status: BookingStatus
}

const initialBookings: Booking[] = [
  { id: 'BT-8841', courtId: 'central', date: '2026-10-04', dateLabel: 'Hoje', startTime: '18:30', duration: 90, payment: 'PIX aprovado', players: '3/4 vagas', status: 'confirmed' },
  { id: 'BT-8890', courtId: 'sunset', date: '2026-10-10', dateLabel: 'Sáb', startTime: '09:00', duration: 90, payment: 'Bolas inclusas', players: 'Grupo fechado', status: 'confirmed' },
]

const history = [
  { id: 'BT-8712', courtId: 'prime', dateLabel: '28 de setembro', startTime: '19:00', duration: 90 },
  { id: 'BT-8660', courtId: 'central', dateLabel: '21 de setembro', startTime: '08:00', duration: 90 },
]

function endTime(startTime: string, duration: number) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const total = hours * 60 + minutes + duration
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function MyReservationsPage() {
  const [bookings, setBookings] = useState(initialBookings)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [notice, setNotice] = useState('')
  const upcoming = bookings.filter((booking) => booking.status === 'confirmed')
  const cancelled = bookings.filter((booking) => booking.status === 'cancelled')

  const shareBooking = async (booking: Pick<Booking, 'courtId' | 'dateLabel' | 'startTime' | 'duration'>) => {
    const court = courts.find((item) => item.id === booking.courtId) ?? courts[0]
    const message = `${court.name} • ${booking.dateLabel}, ${booking.startTime} - ${endTime(booking.startTime, booking.duration)}`
    try {
      await navigator.clipboard.writeText(message)
      setNotice('Detalhes da reserva copiados.')
    } catch {
      setNotice(message)
    }
    window.setTimeout(() => setNotice(''), 3000)
  }

  const confirmCancel = () => {
    if (!cancelTarget) return
    setBookings((current) => current.map((booking) =>
      booking.id === cancelTarget.id ? { ...booking, status: 'cancelled' } : booking,
    ))
    setCancelTarget(null)
    setNotice('Reserva removida da lista de próximos jogos. A alteração ainda não foi enviada à API.')
    window.setTimeout(() => setNotice(''), 4000)
  }

  return (
    <div className="my-bookings-page">
      <header className="my-bookings-heading">
        <div>
          <p className="my-bookings-eyebrow"><CalendarCheck size={15} /> ÁREA DO ATLETA</p>
          <h1>Minhas reservas</h1>
          <p>Acompanhe seus próximos jogos e consulte o histórico da arena.</p>
        </div>
        <div className="booking-status-note"><Clock3 size={16} /><span>Horários locais da arena</span></div>
      </header>

      <div className="booking-tabs" role="tablist" aria-label="Reservas por período">
        <button aria-selected={activeTab === 'upcoming'} className={activeTab === 'upcoming' ? 'is-active' : ''} onClick={() => setActiveTab('upcoming')} role="tab" type="button">Próximos jogos <span>{upcoming.length}</span></button>
        <button aria-selected={activeTab === 'history'} className={activeTab === 'history' ? 'is-active' : ''} onClick={() => setActiveTab('history')} role="tab" type="button">Histórico <span>{history.length + cancelled.length}</span></button>
      </div>

      {activeTab === 'upcoming' ? (
        <section aria-label="Próximos jogos" className="booking-list">
          {upcoming.length ? upcoming.map((booking, index) => {
            const court = courts.find((item) => item.id === booking.courtId) ?? courts[0]
            return (
              <article className="my-booking-card" key={booking.id}>
                <div className={`booking-color-bar booking-color-${index}`} />
                <div className="my-booking-photo"><img alt={court.imageAlt} loading="lazy" src={court.image} /><span>{court.covering}</span></div>
                <div className="my-booking-content">
                  <div className="my-booking-title-row">
                    <div><p className="booking-reference">RESERVA #{booking.id} <span>•</span> Beach tennis</p><h2>{court.name}</h2></div>
                    <span className="booking-confirmed"><i /> Confirmada</span>
                  </div>
                  <div className="booking-facts">
                    <div><small>DATA E HORÁRIO</small><strong>{booking.dateLabel}, {booking.startTime}</strong></div>
                    <div><small>DURAÇÃO</small><strong>{booking.duration} min</strong></div>
                    <div><small>PAGAMENTO</small><strong>{booking.payment}</strong></div>
                    <div><small>JOGADORES</small><strong>{booking.players}</strong></div>
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
          <div className="history-heading"><h2>Partidas anteriores</h2><span>REGISTROS RECENTES</span></div>
          {[...cancelled.map((booking) => ({ ...booking, isCancelled: true })), ...history.map((booking) => ({ ...booking, isCancelled: false }))].map((booking) => {
            const court = courts.find((item) => item.id === booking.courtId) ?? courts[0]
            return (
              <article className="history-row" key={booking.id}>
                <span className="history-icon"><Check size={17} /></span>
                <div><strong>{court.name}</strong><p>{booking.dateLabel} · {booking.startTime} - {endTime(booking.startTime, booking.duration)}</p></div>
                <span className={booking.isCancelled ? 'history-cancelled' : 'history-complete'}>{booking.isCancelled ? 'Cancelada' : 'Concluída'}</span>
                {!booking.isCancelled && <button aria-label="Copiar detalhes da reserva" className="history-share" onClick={() => void shareBooking(booking)} type="button"><Copy size={16} /></button>}
              </article>
            )
          })}
        </section>
      )}

      <section className="booking-policy">
        <span><ShieldCheck size={21} /></span>
        <div><h2>Política de cancelamento</h2><p>Confira as condições de cancelamento com a recepção antes de confirmar. A política definitiva será exibida quando a reserva estiver integrada à API.</p></div>
      </section>

      {notice && <div aria-live="polite" className="booking-toast">{notice}</div>}

      {cancelTarget && (
        <div className="booking-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelTarget(null) }}>
          <section aria-labelledby="cancel-title" aria-modal="true" className="cancel-dialog" role="dialog">
            <button aria-label="Fechar" className="cancel-close" onClick={() => setCancelTarget(null)} type="button"><X size={18} /></button>
            <span className="cancel-dialog-icon"><ShieldCheck size={22} /></span>
            <p className="my-bookings-eyebrow">CONFIRMAÇÃO</p>
            <h2 id="cancel-title">Remover esta reserva?</h2>
            <p>Esta ação altera apenas a demonstração local. Nenhum cancelamento ou reembolso será enviado ao servidor.</p>
            <div className="cancel-dialog-actions"><button onClick={() => setCancelTarget(null)} type="button">Manter reserva</button><button onClick={confirmCancel} type="button">Remover da lista</button></div>
          </section>
        </div>
      )}
    </div>
  )
}