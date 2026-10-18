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

Copie `.env.example` para `.env.local`. O valor padrão aponta para `http://localhost:5030`, conforme o perfil HTTP do back-end. Em produção, configure `VITE_API_URL` no Vercel com a URL pública da API ASP.NET.

O catálogo, a consulta de horários, o cadastro/login do atleta, a criação/cancelamento e a consulta das próprias reservas usam a API autenticada. Tokens JWT são mantidos neste navegador. A área de administração exige o perfil administrativo provisionado no back-end. A API não processa pagamentos.

Para usar as novas contas localmente, configure também `Auth:SigningKey`, `Admin:Email` e `Admin:Password` nos User Secrets da API e aplique as migrations; as instruções estão no [README do back-end](../BeachTennis/README.md).

O projeto de back-end e as instruções para usar Supabase estão em `../BeachTennis/README.md`.

## Publicação no Vercel

Configure `BeachT-Front` como diretório raiz do projeto e `VITE_API_URL` como a URL HTTPS base da API ASP.NET publicada no Render (sem o sufixo `/api`). Defina a variável para o ambiente Production e publique novamente após alterá-la. O `vercel.json` mantém as rotas do React Router acessíveis ao atualizar ou abrir uma página diretamente.

A API precisa estar publicada separadamente e permitir a origem exata do domínio Vercel em CORS. Consulte as etapas de publicação no [README do back-end](../BeachTennis/README.md#publicação-render-supabase-e-vercel).

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

Fotos, cobertura e comodidades são conteúdo visual do front e não vêm da API. O valor e a duração efetivos da reserva continuam sendo definidos pelas regras existentes no back-end.
