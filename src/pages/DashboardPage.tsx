import { ArrowUpRight, CalendarDays, CircleDot, Users } from 'lucide-react'

const overview = [
  { label: 'Quadras cadastradas', value: '—', icon: CircleDot, note: 'Aguardando integração' },
  { label: 'Reservas de hoje', value: '—', icon: CalendarDays, note: 'Aguardando integração' },
  { label: 'Atletas cadastrados', value: '—', icon: Users, note: 'Aguardando integração' },
]

export default function DashboardPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SUA ARENA, EM UM SÓ LUGAR</p>
          <h1>Visão geral</h1>
          <p className="page-description">Acompanhe quadras, reservas e atletas da sua arena.</p>
        </div>
        <span className="date-label">PAINEL INICIAL</span>
      </div>

      <section className="metric-grid" aria-label="Resumo da arena">
        {overview.map(({ label, value, icon: Icon, note }, index) => (
          <article className={`metric-card metric-card-${index + 1}`} key={label}>
            <div className="metric-topline">
              <span>{label}</span>
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <strong className="metric-value">{value}</strong>
            <span className="metric-note">{note}</span>
          </article>
        ))}
      </section>

      <section className="setup-panel">
        <div className="setup-icon"><ArrowUpRight size={19} /></div>
        <div>
          <p className="eyebrow">PRÓXIMO PASSO</p>
          <h2>Conectar à API BeachTennis</h2>
          <p>Configure o endereço da API no arquivo <code>.env.local</code> para começar a carregar os dados.</p>
        </div>
      </section>
    </>
  )
}