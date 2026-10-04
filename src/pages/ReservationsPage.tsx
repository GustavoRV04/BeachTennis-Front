import { useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Info,
  MapPin,
  ShieldCheck,
  Sun,
  Waves,
  X,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { courts } from '@/features/courts/data'
import './ReservationsPage.css'

const timeSlots = [
  { time: '07:00', period: 'Manhã' },
  { time: '08:30', period: 'Manhã' },
  { time: '10:00', period: 'Manhã', occupied: true },
  { time: '11:30', period: 'Manhã' },
  { time: '14:00', period: 'Manhã' },
  { time: '15:30', period: 'Manhã', occupied: true },
  { time: '17:00', period: 'Noite' },
  { time: '18:30', period: 'Noite', occupied: true },
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

export default function ReservationsPage() {
  const [searchParams] = useSearchParams()
  const [today] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedCourtId, setSelectedCourtId] = useState(() =>
    courts.some((court) => court.id === searchParams.get('quadra'))
      ? searchParams.get('quadra') ?? courts[0].id
      : courts[0].id,
  )
  const [selectedTime, setSelectedTime] = useState('08:30')
  const [showCheckout, setShowCheckout] = useState(false)
  const court = courts.find((item) => item.id === selectedCourtId) ?? courts[0]
  const dateOptions = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return date
  })
  const dateParts = getDateParts(selectedDate, today)

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  return (
    <div className="booking-page">
      <div className="booking-heading">
        <div>
          <p className="booking-eyebrow"><span>RESERVA DE QUADRA</span><Sun size={14} /> Dia de jogo, do seu jeito</p>
          <h1>Reserve sua quadra</h1>
          <p className="booking-intro">Escolha o dia, a quadra e o horário. O resumo acompanha suas escolhas.</p>
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
              <div><h2>Selecione a quadra</h2><p>Compare estrutura e valor por hora</p></div>
              <span className="section-meta">{courts.length} opções</span>
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
                    <span className="court-price"><small>Valor por hora</small><strong>{formatCurrency(item.price)}<span>/h</span></strong></span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-title slot-title">
              <span className="step-number">3</span>
              <div><h2>Horários disponíveis</h2><p>Slots de 1 hora e 30 minutos</p></div>
              <div className="slot-legend"><span><i className="legend-free" />Livre</span><span><i className="legend-selected" />Escolhido</span><span><i className="legend-busy" />Ocupado</span></div>
            </div>
            <div className="slots-panel">
              {['Manhã e tarde', 'Noite e refletores'].map((period, index) => (
                <div className="slot-period" key={period}>
                  <h3>{period}</h3>
                  <div className="slot-grid">
                    {timeSlots.filter((slot) => slot.period === (index === 0 ? 'Manhã' : 'Noite')).map((slot) => (
                      <button
                        aria-pressed={selectedTime === slot.time}
                        className={`time-option${slot.occupied ? ' is-occupied' : ''}${selectedTime === slot.time ? ' is-selected' : ''}`}
                        disabled={slot.occupied}
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        type="button"
                      >
                        <strong>{slot.time}</strong>
                        <small>{slot.occupied ? 'Ocupado' : selectedTime === slot.time ? 'Escolhido' : 'Livre'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="booking-note"><Info size={15} /> Bolinhas inclusas no aluguel. A disponibilidade exibida é demonstrativa.</p>
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
            <h3>{court.name}</h3>
            <p>{court.description}</p>
            <div className="summary-divider" />
            <div className="summary-details">
              <div><span>Data</span><strong>{formatDateLong(selectedDate)}</strong></div>
              <div><span>Horário</span><strong>{selectedTime ? `${selectedTime} - ${getEndTime(selectedTime)}` : 'Escolha um horário'}</strong></div>
            </div>
          </div>
          <div className="summary-costs">
            <div><span>Subtotal (90 min)</span><strong>{formatCurrency(court.price * 1.5)}</strong></div>
            <div><span>Taxa de iluminação</span><strong className="cost-free">Grátis</strong></div>
            <div className="summary-total"><span><small>VALOR TOTAL</small><strong>Sem cobranças adicionais</strong></span><b>{formatCurrency(court.price * 1.5)}</b></div>
          </div>
          <button className="checkout-button" disabled={!selectedTime} onClick={() => setShowCheckout(true)} type="button">
            <span>Continuar</span><ArrowRight size={17} />
          </button>
          <div className="payment-options"><span><span className="payment-dot pix-dot" /> PIX</span><span><CreditCard size={14} /> Cartão</span></div>
          <p className="summary-footnote"><CircleAlert size={15} /> O pagamento será conectado na próxima etapa do projeto.</p>
        </aside>
      </div>

      <div className="booking-help">
        <span className="help-icon"><MapPin size={19} /></span>
        <div><strong>Precisa de raquete emprestada?</strong><p>Consulte a recepção sobre equipamentos disponíveis na arena.</p></div>
        <span className="help-link">Informações da arena <ChevronRight size={15} /></span>
      </div>

      {showCheckout && (
        <div className="checkout-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCheckout(false) }}>
          <section aria-labelledby="checkout-title" aria-modal="true" className="checkout-dialog" role="dialog">
            <button aria-label="Fechar" className="dialog-close" onClick={() => setShowCheckout(false)} type="button"><X size={19} /></button>
            <span className="dialog-icon"><Check size={22} /></span>
            <p className="booking-eyebrow">PRÉ-RESERVA</p>
            <h2 id="checkout-title">Sua escolha está pronta</h2>
            <p className="dialog-copy">{court.name} em {formatDateLong(selectedDate)}, das {selectedTime} às {getEndTime(selectedTime)}.</p>
            <div className="dialog-total"><span>Total demonstrativo</span><strong>{formatCurrency(court.price * 1.5)}</strong></div>
            <p className="dialog-note">A confirmação e o pagamento ainda não são enviados à API. Esta etapa é apenas uma prévia do fluxo.</p>
            <button className="checkout-button" onClick={() => setShowCheckout(false)} type="button">Voltar à reserva <ChevronLeft size={16} /></button>
          </section>
        </div>
      )}
    </div>
  )
}