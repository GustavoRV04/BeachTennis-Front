import { useEffect, useState } from 'react'
import { ArrowRight, Search, Sun, Trees, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mapCourt, type Court } from '@/features/courts/data'
import { getApiErrorMessage, listCourts } from '@/services/api/client'
import './CourtsPage.css'

type CourtFilter = 'Todas' | 'Cobertas' | 'Ao ar livre'

const filters: CourtFilter[] = ['Todas', 'Cobertas', 'Ao ar livre']

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')

export default function CourtsPage() {
  const [filter, setFilter] = useState<CourtFilter>('Todas')
  const [query, setQuery] = useState('')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listCourts()
      .then((items) => {
        if (active) setCourts(items.map(mapCourt))
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, 'Não foi possível carregar as quadras.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const visibleCourts = courts.filter((court) => {
    const matchesFilter = filter === 'Todas'
      || (filter === 'Cobertas' ? court.covering !== 'Ao ar livre' : court.covering === 'Ao ar livre')
    const matchesQuery = normalize(`${court.name} ${court.description} ${court.features.join(' ')}`).includes(normalize(query))
    return matchesFilter && matchesQuery
  })

  return (
    <div className="courts-page">
      <header className="courts-heading">
        <div>
          <p className="courts-eyebrow">ESTRUTURA DA ARENA</p>
          <h1>Nossas quadras <span>&amp; estrutura</span></h1>
          <p>Encontre o piso ideal para o seu jogo. Compare coberturas, comodidades e valores.</p>
        </div>
        <div className="court-stats" aria-label="Resumo das quadras">
          <span><strong>{courts.length}</strong><small>quadras</small></span>
          <span><strong>90<em>min</em></strong><small>por horário</small></span>
          <span><strong>100<em>%</em></strong><small>areia esportiva</small></span>
        </div>
      </header>

      <div className="court-toolbar">
        <div aria-label="Filtrar quadras por cobertura" className="court-filters" role="group">
          {filters.map((item) => (
            <button aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)} type="button">{item}</button>
          ))}
        </div>
        <label className="court-search"><Search size={16} /><input aria-label="Buscar quadra ou comodidade" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar quadra ou comodidade" value={query} /></label>
      </div>

      {loading ? (
        <div className="courts-empty" role="status">Carregando quadras...</div>
      ) : error ? (
        <div className="courts-empty" role="alert">{error}</div>
      ) : visibleCourts.length > 0 ? (
        <section aria-label="Quadras disponíveis" className="court-catalog">
          {visibleCourts.map((court, index) => (
            <article className="catalog-card" key={court.id}>
              <div className="catalog-photo-wrap">
                <img alt={court.imageAlt} className="catalog-photo" loading="lazy" src={court.image} />
                <span className="catalog-badge"><span>{court.covering === 'Ao ar livre' ? <Sun size={13} /> : <Waves size={13} />}</span>{court.covering}</span>
                <div className="catalog-photo-caption"><small>QUADRA OFICIAL {String(index + 1).padStart(2, '0')}</small><strong>{court.name.split('—')[1]?.trim() ?? court.name}</strong></div>
                <span className="catalog-photo-price"><strong>Consultar horários</strong></span>
              </div>
              <div className="catalog-card-content">
                <div><h2>{court.name}</h2><p>{court.description}. Preparada para treinos, aulas e partidas entre amigos.</p></div>
                <div className="catalog-features">
                  {court.features.map((feature, featureIndex) => (
                    <span key={feature}><i>{featureIndex === 0 ? <Sun size={13} /> : <Trees size={13} />}</i>{feature}</span>
                  ))}
                </div>
                <Link className="catalog-book-link" to={`/reservas?quadra=${court.id}`}>Ver horários e reservar <ArrowRight size={15} /></Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="courts-empty"><Search size={22} /><strong>Nenhuma quadra encontrada</strong><span>Tente outro nome, comodidade ou filtro.</span></div>
      )}
    </div>
  )
}