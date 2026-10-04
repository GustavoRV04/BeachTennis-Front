# BeachTennis Frontend

Interface web de gestão de quadras e reservas, construída com React, TypeScript e Vite para consumir a API ASP.NET Core.

## Requisitos

- Node.js LTS e npm
- API BeachTennis em execução para integrar dados reais

## Instalação e execução

```sh
npm install
npm run dev
```

Validação de produção: `npm run build`. Verificação de lint: `npm run lint`.

## Configuração da API

Copie `.env.example` para `.env.local` e ajuste `VITE_API_URL` para o endereço da API indicado em `launchSettings.json`. O cliente Axios fica em `src/services/api/client.ts`.

## Organização

- `src/app`: aplicação e configuração das rotas
- `src/layouts`: estrutura compartilhada e navegação
- `src/pages`: telas associadas às rotas
- `src/components`: componentes reutilizáveis entre módulos
- `src/features/courts`: componentes, hooks e lógica da gestão de quadras
- `src/features/reservations`: componentes, hooks e lógica de reservas
- `src/services/api`: cliente HTTP e integrações com a API
- `src/types`: tipos compartilhados; os tipos específicos ficam junto da feature após alinharmos o contrato da API
- `src/styles`: estilos globais e tokens visuais

O alias `@/` aponta para `src/`. As dependências iniciais são React Router para navegação, Axios para HTTP e Lucide React para ícones; Vite, React e TypeScript completam a base do projeto.

As telas de reserva, catálogo e minhas reservas usam dados de demonstração. Seleções, filtros, resumo de preço, abas, prévia de confirmação e cancelamento local funcionam no navegador; disponibilidade, pagamento, criação/cancelamento persistente e condições reais dependem da integração com a API.
