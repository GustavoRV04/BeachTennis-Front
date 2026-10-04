export type Court = {
  id: string
  name: string
  description: string
  covering: string
  price: number
  image: string
  imageAlt: string
  features: string[]
}

export const courts: Court[] = [
  {
    id: 'central',
    name: 'Quadra 01 — Central',
    description: 'Areia tratada e cobertura termoacústica',
    covering: 'Coberta',
    price: 140,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXmzzb63uvS2aAvwWGSHPoTjRWppnJQEm5V16xyiiBtF0JbICt4A0tKDpMuVQzAxlV09HF1FxU_dXs5L-GeOCgfmTYi13lfQgmIVQ5rMpuVUzcfNy1k9-7-0pdDm1AWzu1IALwHfwnlSd_9zoWu1NEZuTiecMN18oOMn5F7hDV3m9jPD36QbL99wMImZqME1hYywiEovPXlS8nsSFpFIy6vUrMuE4BkhbYL2C6hbZ7AMoezcItYnhd',
    imageAlt: 'Quadra de beach tennis com espaço de convivência ao lado',
    features: ['Iluminação LED', 'Areia fina tipo A'],
  },
  {
    id: 'sunset',
    name: 'Quadra 02 — Sunset',
    description: 'Vista aberta com brisa suave',
    covering: 'Ao ar livre',
    price: 120,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaA1uaVbhSVoK6qxscd4LIuTYJ-Tcq24EecdidbA_lyRxXukzZkpsS726FupGaVlCdHDqiOCsAG9jHWHy20R_drvD2IPhIrArLNl369LJlhEAknulF0i-yieZriHTmFGbnjotVgabF8i2HEvBbiw6pkQZbIqGw9HFAby7C05X50fIKGNumG_6mpINC0Fut6k2ce1HB7RizsUeBWYDB62RGayDzFCe9SxWYjv8kFBpg-9ozLmt0xxZd',
    imageAlt: 'Quadra de beach tennis ao ar livre no fim da tarde',
    features: ['Refletores Pro', 'Ducha externa'],
  },
  {
    id: 'prime',
    name: 'Quadra 03 — Prime',
    description: 'Perfeita para jogos e resenha',
    covering: 'Semi-coberta',
    price: 130,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXmzzb63uvS2aAvwWGSHPoTjRWppnJQEm5V16xyiiBtF0JbICt4A0tKDpMuVQzAxlV09HF1FxU_dXs5L-GeOCgfmTYi13lfQgmIVQ5rMpuVUzcfNy1k9-7-0pdDm1AWzu1IALwHfwnlSd_9zoWu1NEZuTiecMN18oOMn5F7hDV3m9jPD36QbL99wMImZqME1hYywiEovPXlS8nsSFpFIy6vUrMuE4BkhbYL2C6hbZ7AMoezcItYnhd',
    imageAlt: 'Quadra de areia com espaço de convivência ao lado',
    features: ['Bebedouro próximo', 'Banco na sombra'],
  },
]