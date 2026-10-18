import { useEffect, useState, type FormEvent } from 'react'
import { Check, CirclePlus, Pencil, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAuthSession } from '@/features/auth/session'
import { mapCourt, type Court } from '@/features/courts/data'
import {
  createCourt,
  deactivateCourt,
  getApiErrorMessage,
  listAdminCourts,
  updateCourt,
} from '@/services/api/client'
import './AdminCourtsPage.css'

export default function AdminCourtsPage() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const isAdmin = session?.perfil === 'Admin'
  const [courts, setCourts] = useState<Court[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate(`/acesso?perfil=admin&returnTo=${encodeURIComponent('/admin')}`, { replace: true })
    }
  }, [isAdmin, navigate])

  const loadCourts = async () => {
    setLoading(true)
    setError('')
    try {
      setCourts((await listAdminCourts()).map(mapCourt))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar as quadras.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return

    let active = true
    listAdminCourts()
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
  }, [isAdmin])

  const resetForm = () => {
    setName('')
    setEditingId(null)
    setError('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (editingId) {
        await updateCourt(editingId, name.trim())
        setNotice('Quadra atualizada.')
      } else {
        await createCourt(name.trim())
        setNotice('Quadra cadastrada.')
      }
      resetForm()
      await loadCourts()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível salvar a quadra.'))
    } finally {
      setSaving(false)
    }
  }

  const deactivate = async (court: Court) => {
    if (!window.confirm(`Desativar ${court.name}? Ela deixará de aparecer para novas reservas.`)) return
    setError('')
    setNotice('')
    try {
      await deactivateCourt(court.id)
      setNotice('Quadra desativada.')
      await loadCourts()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível desativar a quadra.'))
    }
  }

  if (!isAdmin) return null

  return (
    <div className="admin-courts-page">
      <header className="admin-courts-heading">
        <div>
          <p className="eyebrow"><ShieldCheck size={14} /> ADMINISTRAÇÃO</p>
          <h1>Gerenciar quadras</h1>
          <p className="page-description">Cadastre, edite ou desative as quadras disponíveis na arena.</p>
        </div>
        <button className="admin-refresh" onClick={() => void loadCourts()} type="button"><RefreshCw size={15} /> Atualizar</button>
      </header>

      <div className="admin-courts-layout">
        <form className="admin-court-form" onSubmit={(event) => void submit(event)}>
          <span className="admin-form-icon">{editingId ? <Pencil size={18} /> : <CirclePlus size={18} />}</span>
          <h2>{editingId ? 'Editar quadra' : 'Cadastrar quadra'}</h2>
          <p>O nome informado será exibido no catálogo e nas reservas.</p>
          <label htmlFor="court-name">Nome da quadra</label>
          <input autoFocus={Boolean(editingId)} id="court-name" maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Quadra 01 — Central" required value={name} />
          {error && <p className="admin-error" role="alert">{error}</p>}
          {notice && <p className="admin-notice" role="status">{notice}</p>}
          <div className="admin-form-actions">
            {editingId && <button className="admin-cancel" onClick={resetForm} type="button"><X size={14} /> Cancelar</button>}
            <button className="admin-save" disabled={saving} type="submit">{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar quadra'}</button>
          </div>
        </form>

        <section className="admin-court-list" aria-label="Quadras cadastradas">
          <div className="admin-list-heading"><div><h2>Quadras da arena</h2><p>{courts.length} registros</p></div></div>
          {loading ? <p className="admin-list-empty" role="status">Carregando quadras...</p> : courts.length ? (
            <div className="admin-court-rows">
              {courts.map((court) => (
                <article className={`admin-court-row${court.active ? '' : ' is-inactive'}`} key={court.id}>
                  <span className="admin-court-mark"><Check size={16} /></span>
                  <div className="admin-court-copy"><strong>{court.name}</strong><small>{court.active ? 'Ativa para reservas' : 'Desativada'}</small></div>
                  <button aria-label={`Editar ${court.name}`} className="admin-edit-button" onClick={() => { setEditingId(court.id); setName(court.name); setNotice(''); setError('') }} type="button"><Pencil size={15} /></button>
                  {court.active && <button className="admin-deactivate-button" onClick={() => void deactivate(court)} type="button">Desativar</button>}
                </article>
              ))}
            </div>
          ) : <p className="admin-list-empty">Nenhuma quadra cadastrada. Use o formulário para adicionar a primeira.</p>}
        </section>
      </div>
    </div>
  )
}
