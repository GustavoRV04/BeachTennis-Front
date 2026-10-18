import axios from 'axios'
import { getAuthSession, type AuthSession } from '@/features/auth/session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const session = getAuthSession()
  if (session) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

export type CourtDto = {
  id: string
  nome: string
  ativa: boolean
}

export type ReservationDto = {
  id: string
  quadraId: string
  atletaId: string
  inicio?: string
  fim?: string
  valor?: number
  dataHoraInicio?: string
  dataHoraFim?: string
  valorCobrado?: number
  status: string | number
}

export type Reservation = {
  id: string
  quadraId: string
  atletaId: string
  inicio: string
  fim: string
  valor: number
  status: string
}

export type Availability = {
  quadraId: string
  inicio: string
  fim: string
  status: string
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`A API retornou ${label} em formato inesperado.`)
  }
  return value as Record<string, unknown>
}

function parseArray<T>(value: unknown, label: string, parseItem: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new Error(`A API retornou ${label} em formato inesperado.`)
  return value.map(parseItem)
}

function parseCourt(value: unknown): CourtDto {
  const record = asRecord(value, 'uma quadra')
  if (typeof record.id !== 'string' || typeof record.nome !== 'string' || typeof record.ativa !== 'boolean') {
    throw new Error('A API retornou uma quadra em formato inesperado.')
  }
  return { id: record.id, nome: record.nome, ativa: record.ativa }
}

function parseAvailability(value: unknown): Availability {
  const record = asRecord(value, 'um horário')
  if (
    typeof record.quadraId !== 'string'
    || typeof record.inicio !== 'string'
    || typeof record.fim !== 'string'
    || typeof record.status !== 'string'
  ) {
    throw new Error('A API retornou um horário em formato inesperado.')
  }
  return { quadraId: record.quadraId, inicio: record.inicio, fim: record.fim, status: record.status }
}

function parseReservationDto(value: unknown): ReservationDto {
  const record = asRecord(value, 'uma reserva')
  if (
    typeof record.id !== 'string'
    || typeof record.quadraId !== 'string'
    || typeof record.atletaId !== 'string'
    || (typeof record.status !== 'string' && typeof record.status !== 'number')
  ) {
    throw new Error('A API retornou uma reserva em formato inesperado.')
  }

  return {
    id: record.id,
    quadraId: record.quadraId,
    atletaId: record.atletaId,
    inicio: typeof record.inicio === 'string' ? record.inicio : undefined,
    fim: typeof record.fim === 'string' ? record.fim : undefined,
    valor: typeof record.valor === 'number' ? record.valor : undefined,
    dataHoraInicio: typeof record.dataHoraInicio === 'string' ? record.dataHoraInicio : undefined,
    dataHoraFim: typeof record.dataHoraFim === 'string' ? record.dataHoraFim : undefined,
    valorCobrado: typeof record.valorCobrado === 'number' ? record.valorCobrado : undefined,
    status: record.status,
  }
}

function normalizeReservation(dto: ReservationDto): Reservation {
  const inicio = dto.inicio ?? dto.dataHoraInicio
  const fim = dto.fim ?? dto.dataHoraFim
  const valor = dto.valor ?? dto.valorCobrado
  if (!inicio || !fim || valor === undefined) {
    throw new Error('A API retornou uma reserva em formato inesperado.')
  }

  const status = dto.status === 1
    ? 'Confirmada'
    : dto.status === 2
      ? 'Cancelada'
      : dto.status

  return { ...dto, inicio, fim, valor, status: String(status) }
}

function parseAuthSession(value: unknown): AuthSession {
  const record = asRecord(value, 'uma sessão')
  const user = asRecord(record.usuario, 'o perfil da sessão')
  if (
    typeof record.token !== 'string'
    || typeof record.expiraEm !== 'string'
    || (record.perfil !== 'Admin' && record.perfil !== 'Athlete')
    || typeof user.id !== 'string'
    || typeof user.nome !== 'string'
    || typeof user.email !== 'string'
  ) {
    throw new Error('A API retornou uma sessão em formato inesperado.')
  }
  return {
    token: record.token,
    expiraEm: record.expiraEm,
    perfil: record.perfil,
    usuario: { id: user.id, nome: user.nome, email: user.email },
  }
}

export async function listCourts() {
  const response = await api.get<unknown>('/api/quadras')
  return parseArray(response.data, 'a lista de quadras', parseCourt)
}

export async function listReservationsForWeek(start: string) {
  const response = await api.get<unknown>('/api/reservas/semana', {
    params: { inicio: start },
  })
  return parseArray(response.data, 'a lista de horários', parseAvailability)
}

export async function registerAthlete(input: { nome: string; email: string; senha: string }) {
  const response = await api.post<unknown>('/api/auth/registro', input)
  return parseAuthSession(response.data)
}

export async function login(input: { email: string; senha: string }) {
  const response = await api.post<unknown>('/api/auth/login', input)
  return parseAuthSession(response.data)
}

export async function listAdminCourts() {
  const response = await api.get<unknown>('/api/admin/quadras')
  return parseArray(response.data, 'a lista administrativa de quadras', parseCourt)
}

export async function createCourt(nome: string) {
  const response = await api.post<unknown>('/api/quadras', { nome })
  return parseCourt(response.data)
}

export async function updateCourt(id: string, nome: string) {
  await api.put(`/api/quadras/${id}`, { nome })
}

export async function deactivateCourt(id: string) {
  await api.delete(`/api/quadras/${id}`)
}

export async function listMyReservations() {
  const response = await api.get<unknown>('/api/reservas/minhas')
  return parseArray(response.data, 'a lista de reservas', parseReservationDto).map(normalizeReservation)
}

export async function createReservation(input: {
  quadraId: string
  inicio: string
  fim: string
}) {
  const response = await api.post<unknown>('/api/reservas', input)
  return normalizeReservation(parseReservationDto(response.data))
}

export async function cancelReservation(id: string) {
  await api.delete(`/api/reservas/${id}`)
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ mensagem?: string }>(error)) {
    return error.response?.data?.mensagem ?? error.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}