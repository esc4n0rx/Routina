# Routina - App de Produtividade Gamificada

Routina é uma aplicação web moderna para gerenciamento de tarefas e produtividade com elementos de gamificação. Com o Routina, você pode organizar suas tarefas, ganhar pontos de experiência (XP) ao concluí-las e avançar de nível enquanto mantém sua produtividade.

## Tecnologias Utilizadas

- **Next.js**: Framework React para renderização do lado do servidor
- **TypeScript**: Tipagem estática para melhor qualidade de código
- **Tailwind CSS**: Framework CSS utilitário
- **ShadcnUI**: Componentes de UI reutilizáveis
- **Framer Motion**: Biblioteca de animações
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas
- **Jest**: Framework de testes

## Funcionalidades Principais

- 🔐 Sistema de autenticação (login/registro)
- 📋 Gerenciamento de tarefas
- 📊 Dashboard de produtividade
- 📅 Calendário de eventos
- 🎮 Sistema de gamificação (níveis, XP, conquistas)
- 🌓 Tema escuro/claro
- 📱 Design responsivo para dispositivos móveis

## Começando

### Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm (recomendado) ou npm

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/routina.git
   cd routina
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:
   ```
   NEXT_PUBLIC_API_URL=https://api.streamhivex.icu
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```

5. Acesse a aplicação em http://localhost:3000

## Estrutura do Projeto

```
routina/
├── app/                   # Estrutura de roteamento Next.js
│   ├── (dashboard)/       # Layout e páginas do dashboard
│   ├── api/               # Rotas da API (caso necessário)
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz da aplicação
│   └── page.tsx           # Página inicial (login)
├── components/            # Componentes React reutilizáveis
│   ├── ui/                # Componentes de UI
│   ├── dashboard/         # Componentes do dashboard
│   ├── tasks/             # Componentes relacionados a tarefas
│   └── ...
├── contexts/              # Contextos React
│   └── auth-context.tsx   # Contexto de autenticação
├── hooks/                 # Hooks personalizados
├── lib/                   # Funções utilitárias e validações
├── public/                # Arquivos estáticos
├── services/              # Serviços de API
│   └── api.ts             # Cliente de API
├── styles/                # Estilos e temas
└── types/                 # Definições de tipos TypeScript
```

## Testes

Para executar os testes:

```bash
pnpm test
# ou
npm run test
```

Para executar os testes com cobertura:

```bash
pnpm test:coverage
# ou
npm run test:coverage
```

## Deploy

Esta aplicação pode ser facilmente implantada na Vercel ou em outra plataforma de sua escolha que suporte Next.js.

Para criar uma build de produção:

```bash
pnpm build
# ou
npm run build
```

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.