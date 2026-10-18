import type { CourtDto } from '@/services/api/client'

export type Court = {
  id: string
  name: string
  active: boolean
  description: string
  covering: string
  image: string
  imageAlt: string
  features: string[]
}

const presentation = [
  {
    match: 'central',
    description: 'Areia tratada e cobertura termoacústica',
    covering: 'Coberta',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXmzzb63uvS2aAvwWGSHPoTjRWppnJQEm5V16xyiiBtF0JbICt4A0tKDpMuVQzAxlV09HF1FxU_dXs5L-GeOCgfmTYi13lfQgmIVQ5rMpuVUzcfNy1k9-7-0pdDm1AWzu1IALwHfwnlSd_9zoWu1NEZuTiecMN18oOMn5F7hDV3m9jPD36QbL99wMImZqME1hYywiEovPXlS8nsSFpFIy6vUrMuE4BkhbYL2C6hbZ7AMoezcItYnhd',
    imageAlt: 'Quadra de beach tennis com espaço de convivência ao lado',
    features: ['Iluminação LED', 'Areia fina tipo A'],
  },
  {
    match: 'sunset',
    description: 'Vista aberta com brisa suave',
    covering: 'Ao ar livre',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaA1uaVbhSVoK6qxscd4LIuTYJ-Tcq24EecdidbA_lyRxXukzZkpsS726FupGaVlCdHDqiOCsAG9jHWHy20R_drvD2IPhIrArLNl369LJlhEAknulF0i-yieZriHTmFGbnjotVgabF8i2HEvBbiw6pkQZbIqGw9HFAby7C05X50fIKGNumG_6mpINC0Fut6k2ce1HB7RizsUeBWYDB62RGayDzFCe9SxWYjv8kFBpg-9ozLmt0xxZd',
    imageAlt: 'Quadra de beach tennis ao ar livre no fim da tarde',
    features: ['Refletores Pro', 'Ducha externa'],
  },
  {
    match: 'prime',
    description: 'Perfeita para jogos e resenha',
    covering: 'Semi-coberta',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXmzzb63uvS2aAvwWGSHPoTjRWppnJQEm5V16xyiiBtF0JbICt4A0tKDpMuVQzAxlV09HF1FxU_dXs5L-GeOCgfmTYi13lfQgmIVQ5rMpuVUzcfNy1k9-7-0pdDm1AWzu1IALwHfwnlSd_9zoWu1NEZuTiecMN18oOMn5F7hDV3m9jPD36QbL99wMImZqME1hYywiEovPXlS8nsSFpFIy6vUrMuE4BkhbYL2C6hbZ7AMoezcItYnhd',
    imageAlt: 'Quadra de areia com espaço de convivência ao lado',
    features: ['Bebedouro próximo', 'Banco na sombra'],
  },
]

const defaultPresentation = {
  description: 'Quadra disponível para reservas na arena',
  covering: 'Arena',
  image: presentation[0].image,
  imageAlt: 'Quadra de beach tennis',
  features: ['Beach tennis'],
}

export function mapCourt(dto: CourtDto): Court {
  const normalizedName = dto.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  const details = presentation.find(({ match }) => normalizedName.includes(match)) ?? defaultPresentation

  return {
    id: dto.id,
    name: dto.nome,
    active: dto.ativa,
    description: details.description,
    covering: details.covering,
    image: details.image,
    imageAlt: details.imageAlt,
    features: details.features,
  }
}
