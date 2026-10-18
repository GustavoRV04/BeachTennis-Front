import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Info,
  MapPin,
  ShieldCheck,
  Sun,
  Waves,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuthSession } from '@/features/auth/session'
import { mapCourt, type Court } from '@/features/courts/data'
import {
  createReservation,
  getApiErrorMessage,
  listCourts,
  listReservationsForWeek,
  type Availability,
} from '@/services/api/client'
import './ReservationsPage.css'

const timeSlots = [
  { time: '07:00', period: 'Manhã' },
  { time: '08:30', period: 'Manhã' },
  { time: '10:00', period: 'Manhã' },
  { time: '11:30', period: 'Manhã' },
  { time: '14:00', period: 'Manhã' },
  { time: '15:30', period: 'Manhã' },
  { time: '17:00', period: 'Noite' },
  { time: '18:30', period: 'Noite' },
  { time: '20:00', period: 'Noite' },
  { time: '21:30', period: 'Noite' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDateLong = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)

function getDateParts(date: Date, today: Date) {
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date)
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '')
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '')

  return {
    day,
    month,
    weekday,
    label: date.toDateString() === today.toDateString()
      ? 'Hoje'
      : date.toDateString() === tomorrow.toDateString()
        ? 'Amanhã'
        : weekday,
    iso: [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'),
  }
}

function getEndTime(start: string) {
  const [hours, minutes] = start.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + 90
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

function localDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

function startOfLocalDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result.toISOString()
}

export default function ReservationsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [today] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => {
    const requestedDate = searchParams.get('data')
    const parsedDate = requestedDate ? new Date(`${requestedDate}T12:00:00`) : today
    return Number.isNaN(parsedDate.getTime()) || parsedDate < new Date(today.toDateString()) ? today : parsedDate
  })
  const [courts, setCourts] = useState<Court[]>([])
  const [selectedCourtId, setSelectedCourtId] = useState(searchParams.get('quadra') ?? '')
  const [selectedTime, setSelectedTime] = useState(() => {
    const requestedTime = searchParams.get('hora')
    return timeSlots.some((slot) => slot.time === requestedTime) ? requestedTime ?? '' : '08:30'
  })
  const [showCheckout, setShowCheckout] = useState(false)
  const [reservations, setReservations] = useState<Availability[]>([])
  const [loadingCourts, setLoadingCourts] = useState(true)
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [currentTime, setCurrentTime] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [availabilityError, setAvailabilityError] = useState('')
  const court = courts.find((item) => item.id === selectedCourtId)
  const hourlyPrice = selectedTime && Number(selectedTime.slice(0, 2)) >= 18 ? 120 : 100
  const totalPrice = hourlyPrice * 1.5
  const dateOptions = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return date
  })
  const dateParts = getDateParts(selectedDate, today)

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now())
    updateCurrentTime()
    const interval = window.setInterval(updateCurrentTime, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let active = true
    listCourts()
      .then((items) => {
        if (!active) return
        const loadedCourts = items.map(mapCourt)
        setCourts(loadedCourts)
        setSelectedCourtId((current) =>
          loadedCourts.some((item) => item.id === current) ? current : loadedCourts[0]?.id ?? '',
        )
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, 'Não foi possível carregar as quadras.'))
      })
      .finally(() => {
        if (active) setLoadingCourts(false)
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    listReservationsForWeek(startOfLocalDay(selectedDate))
      .then((items) => {
        if (active) setReservations(items)
      })
      .catch((requestError: unknown) => {
        if (active) setAvailabilityError(getApiErrorMessage(requestError, 'Não foi possível consultar os horários.'))
      })
      .finally(() => {
        if (active) setLoadingReservations(false)
      })

    return () => { active = false }
  }, [selectedDate])

  const isOccupied = (time: string) => {
    if (!court) return false
    const slotStart = localDateTime(selectedDate, time)
    const slotEnd = new Date(slotStart.getTime() + 90 * 60 * 1000)
    return reservations.some((reservation) =>
      reservation.quadraId === court.id
      && reservation.status.toLocaleLowerCase('pt-BR').includes('confirm')
      && new Date(reservation.inicio) < slotEnd
      && slotStart < new Date(reservation.fim),
    )
  }

  const isPast = (time: string) => currentTime === null
    || localDateTime(selectedDate, time).getTime() <= currentTime

  const selectDate = (date: Date) => {
    setAvailabilityError('')
    setLoadingReservations(true)
    setSelectedDate(date)
    setSelectedTime('')
  }

  const continueToReservation = () => {
    const session = getAuthSession()
    if (!session) {
      const returnTo = `/reservas?quadra=${encodeURIComponent(selectedCourtId)}&data=${dateParts.iso}&hora=${selectedTime}`
      navigate(`/acesso?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }
    if (session.perfil !== 'Athlete') {
      setError('Saia da conta administrativa para reservar como atleta.')
      return
    }

    setError('')
    setShowCheckout(true)
  }

  const submitReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!court || !selectedTime || isOccupied(selectedTime) || isPast(selectedTime) || getAuthSession()?.perfil !== 'Athlete') return

    setSubmitting(true)
    setError('')
    try {
      const inicio = localDateTime(selectedDate, selectedTime)
      const fim = new Date(inicio.getTime() + 90 * 60 * 1000)
      await createReservation({
        quadraId: court.id,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      })
      setReservations((current) => [...current, {
        quadraId: court.id,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
        status: 'Confirmada',
      }])
      setShowCheckout(false)
      setSelectedTime('')
      setNotice('Reserva confirmada e salva.')
      window.setTimeout(() => setNotice(''), 3500)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível criar a reserva.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="booking-page">
      <div className="booking-heading">
        <div>
          <p className="booking-eyebrow"><span>RESERVA DE QUADRA</span><Sun size={14} /> Dia de jogo, do seu jeito</p>
          <h1>Reserve sua quadra</h1>
          <p className="booking-intro">Escolha o dia, a quadra e o horário. O resumo acompanha suas escolhas.</p>
          {error && <p className="booking-error" role="alert">{error}</p>}
          {availabilityError && <p className="booking-error" role="alert">{availabilityError}</p>}
        </div>
        <div className="booking-promise">
          <ShieldCheck size={20} />
          <span><strong>Reserva simples</strong><small>Confira os detalhes antes de continuar</small></span>
        </div>
      </div>

      <div className="booking-layout">
        <div className="booking-steps">
          <section className="booking-section">
            <div className="booking-section-title">
              <span className="step-number">1</span>
              <div><h2>Escolha o dia</h2><p>Selecione uma data para consultar horários</p></div>
              <label className="calendar-control" title="Escolher outra data">
                <CalendarDays size={16} />
                <span>Calendário</span>
                <input
                  aria-label="Escolher data da reserva"
                  type="date"
                  min={getDateParts(today, today).iso}
                  value={dateParts.iso}
                  onChange={(event) => {
                    if (event.target.value) selectDate(new Date(`${event.target.value}T12:00:00`))
                  }}
                />
              </label>
            </div>
            <div className="date-strip" aria-label="Próximos sete dias">
              {dateOptions.map((date) => {
                const parts = getDateParts(date, today)
                const isSelected = parts.iso === dateParts.iso
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`date-option${isSelected ? ' is-selected' : ''}`}
                    key={parts.iso}
                    onClick={() => selectDate(date)}
                    type="button"
                  >
                    <span>{parts.label}</span><strong>{parts.day}</strong><small>{parts.weekday}</small>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-title">
              <span className="step-number">2</span>
              <div><h2>Selecione a quadra</h2><p>Consulte as quadras cadastradas na arena</p></div>
              <span className="section-meta">{loadingCourts ? 'Carregando...' : `${courts.length} opções`}</span>
            </div>
            <div className="court-options">
              {courts.map((item) => {
                const isSelected = item.id === selectedCourtId
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`court-option${isSelected ? ' is-selected' : ''}`}
                    key={item.id}
                    onClick={() => setSelectedCourtId(item.id)}
                    type="button"
                  >
                    <span className="court-photo-wrap">
                      <img alt={item.imageAlt} className="court-photo" loading="lazy" src={item.image} />
                      <span className="court-cover-tag">{item.covering}</span>
                      {isSelected && <span className="court-selected-tag"><Check size={13} /> Selecionada</span>}
                    </span>
                    <span className="court-copy">
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                      <span className="court-features">{item.features.map((feature) => <em key={feature}>{feature}</em>)}</span>
                    </span>
                    <span className="court-price"><small>Valor por hora</small><strong>R$ 100–120<span>/h</span></strong></span>
                  </button>
                )
              })}
              {loadingCourts && <p role="status">Carregando quadras...</p>}
              {!loadingCourts && !error && courts.length === 0 && <p>Nenhuma quadra ativa foi cadastrada na API.</p>}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-title slot-title">
              <span className="step-number">3</span>
              <div><h2>Horários disponíveis</h2><p>Slots de 1 hora e 30 minutos</p></div>
              <div className="slot-legend"><span><i className="legend-free" />Livre</span><span><i className="legend-selected" />Escolhido</span><span><i className="legend-busy" />Ocupado</span></div>
            </div>
            <div className="slots-panel">
              {loadingReservations && <p role="status">Consultando disponibilidade...</p>}
              {['Manhã e tarde', 'Noite e refletores'].map((period, index) => (
                <div className="slot-period" key={period}>
                  <h3>{period}</h3>
                  <div className="slot-grid">
                    {timeSlots.filter((slot) => slot.period === (index === 0 ? 'Manhã' : 'Noite')).map((slot) => (
                      (() => {
                        const occupied = isOccupied(slot.time)
                        const past = isPast(slot.time)
                        return (
                          <button
                            aria-pressed={selectedTime === slot.time}
                            className={`time-option${occupied || past ? ' is-occupied' : ''}${selectedTime === slot.time ? ' is-selected' : ''}`}
                            disabled={loadingReservations || Boolean(availabilityError) || !court || occupied || past}
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            type="button"
                          >
                            <strong>{slot.time}</strong>
                            <small>{occupied ? 'Ocupado' : past ? 'Encerrado' : selectedTime === slot.time ? 'Escolhido' : 'Livre'}</small>
                          </button>
                        )
                      })()
                    ))}
                  </div>
                </div>
              ))}
              <p className="booking-note"><Info size={15} /> Disponibilidade consultada na API. Cada reserva ocupa 90 minutos.</p>
            </div>
          </section>
        </div>

        <aside className="booking-summary" aria-label="Resumo da reserva">
          <div className="summary-heading">
            <span className="summary-icon"><Waves size={19} /></span>
            <div><p>RESUMO DA RESERVA</p><h2>Seu jogo</h2></div>
          </div>
          <div className="summary-court">
            <div className="summary-label">QUADRA SELECIONADA</div>
            <h3>{court?.name ?? (loadingCourts ? 'Carregando quadras...' : 'Selecione uma quadra')}</h3>
            <p>{court?.description}</p>
            <div className="summary-divider" />
            <div className="summary-details">
              <div><span>Data</span><strong>{formatDateLong(selectedDate)}</strong></div>
              <div><span>Horário</span><strong>{selectedTime ? `${selectedTime} - ${getEndTime(selectedTime)}` : 'Escolha um horário'}</strong></div>
            </div>
          </div>
          <div className="summary-costs">
            <div><span>Subtotal (90 min)</span><strong>{formatCurrency(totalPrice)}</strong></div>
            <div><span>Tarifa por hora</span><strong>{formatCurrency(hourlyPrice)}</strong></div>
            <div className="summary-total"><span><small>VALOR TOTAL</small><strong>Pagamento na arena</strong></span><b>{formatCurrency(totalPrice)}</b></div>
          </div>
          <button className="checkout-button" disabled={!selectedTime || !court || loadingReservations || Boolean(availabilityError) || isOccupied(selectedTime) || isPast(selectedTime)} onClick={continueToReservation} type="button">
            <span>Continuar</span><ArrowRight size={17} />
          </button>
          <p className="summary-footnote"><CircleAlert size={15} /> O sistema registra a reserva; o pagamento não é processado pela API.</p>
        </aside>
      </div>

      <div className="booking-help">
        <span className="help-icon"><MapPin size={19} /></span>
        <div><strong>Precisa de raquete emprestada?</strong><p>Consulte a recepção sobre equipamentos disponíveis na arena.</p></div>
        <span className="help-link">Informações da arena <ChevronRight size={15} /></span>
      </div>

      {notice && <div aria-live="polite" className="booking-toast">{notice}</div>}

      {showCheckout && (
        <div className="checkout-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCheckout(false) }}>
          <form aria-labelledby="checkout-title" aria-modal="true" className="checkout-dialog" onSubmit={(event) => void submitReservation(event)} role="dialog">
            <button aria-label="Fechar" className="dialog-close" onClick={() => setShowCheckout(false)} type="button"><X size={19} /></button>
            <span className="dialog-icon"><Check size={22} /></span>
            <p className="booking-eyebrow">CONFIRMAR RESERVA</p>
            <h2 id="checkout-title">Confira sua escolha</h2>
            <p className="dialog-copy">{court?.name} em {formatDateLong(selectedDate)}, das {selectedTime} às {getEndTime(selectedTime)}.</p>
            <div className="dialog-total"><span>Total da reserva</span><strong>{formatCurrency(totalPrice)}</strong></div>
            <p className="dialog-note">A reserva será registrada para {getAuthSession()?.usuario.nome}. O pagamento é feito diretamente com a arena.</p>
            {error && <p className="booking-error" role="alert">{error}</p>}
            <button className="checkout-button" disabled={submitting || !court || !selectedTime} type="submit">
              <span>{submitting ? 'Enviando...' : 'Confirmar reserva'}</span><ArrowRight size={17} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}