# Routina - Sistema de Gerenciamento de Tarefas Gamificado

Um aplicativo web moderno para gerenciamento de tarefas com elementos de gamificação, construído com Next.js, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### ✅ Gerenciamento de Tarefas
- **Criar tarefas** com nome, descrição, pontos XP (1-20), data/hora de vencimento
- **Editar e excluir** tarefas existentes
- **Concluir tarefas** e ganhar pontos de experiência
- **Adiar tarefas** com penalidade de pontos (30% de desconto)
- **Duplicar tarefas** para criação rápida
- **Filtrar tarefas** por status, categorias e tags
- **Buscar tarefas** por nome ou descrição

### 🏷️ Categorias e Tags
- **Categorias padrão** do sistema (Trabalho, Estudos, Pessoal, etc.)
- **Categorias personalizadas** criadas pelo usuário
- **Tags padrão** para organização (Urgente, Importante, etc.)
- **Tags personalizadas** para melhor organização
- **Seleção rápida** de tags populares nos filtros

### 🎮 Sistema de Gamificação
- **Pontos de experiência (XP)** por completar tarefas
- **Sistema de níveis** com progressão
- **Sequência de dias consecutivos** completando tarefas
- **Popup de level up** com animações
- **Penalidades por adiamento** de tarefas

### 📊 Dashboard
- **Estatísticas em tempo real** (nível, XP, sequência, produtividade)
- **Tarefas recentes** com visualização rápida
- **Progresso visual** com barras de XP animadas
- **Métricas de produtividade** baseadas em tarefas concluídas

### 🔐 Autenticação
- **Login/Registro** com validação
- **Tokens JWT** para autenticação segura
- **Cookies seguros** para persistência de sessão
- **Validação de formulários** com mensagens de erro claras

### 🎨 Interface Moderna
- **Design responsivo** que funciona em desktop e mobile
- **Tema escuro** com cores vibrantes
- **Animações suaves** com Framer Motion
- **Feedback visual** com toasts e loaders
- **Componentes reutilizáveis** com Shadcn/UI

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com SSR/SSG
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações e transições
- **Shadcn/UI** - Componentes de interface
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend/API
- **API REST** - Documentada no arquivo `API.md`
- **Autenticação JWT** - Tokens seguros
- **Cookies HTTP** - Armazenamento seguro de tokens

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (dashboard)/        # Rotas protegidas do dashboard
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   ├── middleware.ts       # Middleware de autenticação
│   └── page.tsx            # Página inicial (login)
├── components/             # Componentes React
│   ├── dashboard/          # Componentes do dashboard
│   ├── tasks/              # Componentes de tarefas
│   ├── ui/                 # Componentes base (Shadcn/UI)
│   └── ...
├── context/                # Contextos React
│   ├── auth-context.tsx    # Contexto de autenticação
│   └── task-context.tsx    # Contexto de tarefas
├── hooks/                  # Hooks customizados
├── lib/                    # Utilitários e configurações
│   ├── cookie-utils.ts     # Utilitários para cookies
│   ├── utils.ts            # Utilitários gerais
│   └── validations/        # Schemas de validação
├── services/               # Serviços de API
│   └── api/                # Serviços organizados por domínio
└── types/                  # Definições de tipos TypeScript
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd routina

# Instale as dependências
npm install
# ou
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### Configuração
Edite o arquivo `.env.local` com as configurações da API:

```env
NEXT_PUBLIC_API_URL=https://api.streamhivex.icu
```

### Executar em desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📱 Como Usar

### 1. Primeiro Acesso
1. Acesse a aplicação
2. **Registre-se** com nome, email e senha
3. **Faça login** com suas credenciais

### 2. Dashboard
- Visualize suas **estatísticas** (nível, XP, sequência)
- Veja suas **tarefas recentes**
- Acompanhe sua **produtividade**

### 3. Gerenciar Tarefas
1. Vá para a seção **"Tarefas"**
2. Use os **filtros** para organizar (status, categorias, tags)
3. **Crie nova tarefa** com o botão "+"
4. **Configure** nome, descrição, pontos XP, prazo, categorias e tags
5. **Marque como concluída** para ganhar XP
6. **Adie tarefas** se necessário (com penalidade)

### 4. Sistema de Pontos
- **Ganhe XP** completando tarefas
- **Suba de nível** acumulando XP
- **Mantenha sequências** completando tarefas todos os dias
- **Cuidado com penalidades** ao adiar tarefas

### 5. Organização
- Use **categorias** para agrupar tarefas por tipo
- Use **tags** para marcação rápida
- **Filtre e busque** tarefas facilmente
- **Categorize** suas tarefas por prioridade e contexto

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Linting
npm run lint

# Testes
npm run test
npm run test:watch
npm run test:coverage
```

## 📚 Documentação da API

A documentação completa da API está disponível no arquivo `API.md`, incluindo:
- Endpoints de autenticação
- Endpoints de tarefas
- Endpoints de categorias e tags
- Exemplos de payloads e respostas
- Códigos de erro

## 🎯 Funcionalidades Futuras

- [ ] **Calendário integrado** com visualização de prazos
- [ ] **Notificações push** para lembretes
- [ ] **Relatórios** de produtividade
- [ ] **Conquistas e badges** para gamificação
- [ ] **Compartilhamento** de tarefas entre usuários
- [ ] **Modo offline** com sincronização
- [ ] **Exportação** de dados para CSV/PDF
- [ ] **Temas personalizáveis**

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Shadcn/UI](https://ui.shadcn.com/) - Componentes de interface
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Framer Motion](https://www.framer.com/motion/) - Animações
- [Lucide React](https://lucide.dev/) - Ícones