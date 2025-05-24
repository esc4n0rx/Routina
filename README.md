# 📱 Routina

## Visão Geral

O **Routina** é um aplicativo web moderno de gerenciamento de tarefas com elementos de gamificação, desenvolvido com **Next.js 15**, **TypeScript** e **Tailwind CSS**. O objetivo é transformar rotinas diárias em experiências envolventes por meio de pontos de experiência (XP), níveis, sequências e conquistas.

---

## 🎯 Objetivo

Aumentar a produtividade e a motivação dos usuários ao gamificar tarefas cotidianas, transformando atividades simples em conquistas significativas por meio de um sistema de recompensas e progressão.

---

## 🏗️ Arquitetura Técnica

### Stack Principal

* **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
* **UI Components**: Shadcn/UI + Radix UI
* **Animações**: Framer Motion
* **Validação**: Zod + React Hook Form
* **Estado**: Context API + Hooks customizados
* **Backend**: API REST externa - [https://api.routina.fun](https://api.routina.fun)

### Estrutura de Pastas

```
src/
├── app/
│   ├── (dashboard)/        # Rotas protegidas
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Login/Registro
├── components/
│   ├── dashboard/          # Componentes do dashboard
│   ├── tasks/              # Tarefas
│   ├── ui/                 # Componentes base
│   ├── auth/               # Autenticação
│   ├── settings/           # Configurações
│   └── notifications/      # Notificações IA
├── context/                # Contextos React
├── hooks/                  # Hooks customizados
├── lib/                    # Utilitários
├── services/               # Serviços de API
└── types/                  # Tipagens
```

---

## 🔐 Autenticação

* Login/Registro com validação
* JWT armazenado em cookies seguros
* Middleware de rotas protegidas
* Contexto global de autenticação

---

## 📋 Funcionalidades

### 1. Gerenciamento de Tarefas

* Criação, edição, exclusão e duplicação de tarefas
* Pontuação XP de 1 a 20 por tarefa
* Conclusão com XP, adiamento com penalidade (30%)
* Filtros avançados por status, categoria e tags
* Busca por nome ou descrição

### 2. Gamificação

* **XP**: 1-20 por tarefa
* **Níveis**: 10 níveis (Iniciante → Iluminado)
* **Sequência**: Dias consecutivos de produtividade
* **Penalidades**: Redução de XP
* **Level Up**: Popup animado

### 3. Categorias e Tags

* Categorias e tags padrão e personalizadas
* Sistema de cores para organização visual
* Filtros rápidos

### 4. Dashboard

* Estatísticas em tempo real
* Progresso visual com barras de XP
* Visualização de tarefas recentes
* Métricas diárias

### 5. PWA

* Instalação nativa em dispositivos móveis
* Funcionalidades offline via Service Worker
* Interface otimizada para mobile

### 6. Notificações IA (NeuroLink)

* Alertas, lembretes, motivação, conquistas, progresso, dicas
* Personalização com 4 personalidades
* Horários e tipos configuráveis
* Notificações push nativas com feedback

---

## 🎨 Design e Experiência

* Tema escuro com gradientes roxo/azul
* Animações suaves com Framer Motion
* Interface responsiva mobile-first
* Safe Areas para dispositivos com notch
* Sistema de design com componentes reutilizáveis (Shadcn/UI)

---

## 🔧 Funcionalidades Técnicas Avançadas

### Optimistic Updates

* Atualização instantânea com reversão em erro
* Feedback visual imediato

### Gerenciamento de Estado

* Context API + Hooks customizados
* Cache inteligente

### Tratamento de Erros

* Try/catch com toasts informativos
* Fallbacks visuais e logs para debugging

### Performance

* Lazy loading, memoização, otimização de re-renders
* Bundle splitting

---

## 📱 Páginas e Rotas

### Rotas Públicas

* `/` - Login e registro

### Rotas Protegidas

* `/dashboard` - Painel principal
* `/tasks` - Lista de tarefas
* `/calendar` - Calendário (em desenvolvimento)
* `/settings` - Configurações e notificações

---

## 🔔 Notificações Inteligentes

### Tipos

* **ALERT** - Urgências
* **REMINDER** - Lembretes
* **MOTIVATION** - Incentivos
* **ACHIEVEMENT** - Conquistas
* **PROGRESS** - Relatórios
* **INSIGHT** - Dicas personalizadas

### Configurações

* Estilo da IA: Formal, Casual, Motivacional, Amigável
* Horário, frequência e tipos configuráveis
* Feedback adaptativo

---

## 🚀 Funcionalidades em Desenvolvimento

* Visualização de prazos em calendário
* Relatórios detalhados de produtividade
* Conquistas e badges
* Compartilhamento de tarefas
* Exportação de dados
* Temas personalizados

---

## 🛠️ APIs e Integrações

### Endpoints

* **Autenticação**: `/api/usuarios/login`, `/api/usuarios/registro`
* **Tarefas**: `/api/tarefas`
* **Categorias**: `/api/categorias`
* **Tags**: `/api/tags`
* **Notificações**: `/api/neurolink/*`

### Estrutura de Dados

```ts
interface Task {
  id: string;
  nome: string;
  descricao?: string;
  pontos: number;
  data_vencimento?: string;
  hora_vencimento?: string;
  concluida: boolean;
  vencida: boolean;
  categorias?: Category[];
  tags?: Tag[];
}

interface User {
  id: string;
  nome: string;
  email: string;
  nivel: number;
  pontos_xp: number;
  sequencia: number;
}
```

---

## 🎯 Diferenciais

* Gamificação real com níveis e XP
* Notificações inteligentes com IA
* Interface responsiva com sensação de app nativo
* Atualização otimista para melhor UX
* PWA completo com suporte offline
* Sistema de penalidades motivacional

---

## 📊 Métricas

* Taxa de conclusão de tarefas
* Produtividade diária/semanal
* Progresso de nível
* Sequências mantidas
* Engajamento com notificações

---

## 🧠 Considerações Finais

O **Routina** combina produtividade, gamificação e inteligência artificial para criar uma experiência de gerenciamento de tarefas verdadeiramente envolvente, com foco especial em usuários com TDAH e pessoas que enfrentam dificuldades com procrastinação. É mais do que um app de tarefas: é uma ferramenta de evolução pessoal.
