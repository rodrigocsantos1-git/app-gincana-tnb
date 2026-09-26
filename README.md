# 🏕️ App Acampa TNB — Gincana em Tempo Real

Aplicação web completa, moderna e em tempo real para gerenciamento e pontuação de gincanas do acampamento do **Ministério Infantil Tô na Bênção (TNB)** — **Igreja Bíblica da Paz (IBP)**.

Construída para os líderes e coordenadores pontuarem provas diretamente de seus smartphones no campo da gincana, com sincronização instantânea em um **Modo Telão** projetado no telão principal ou TV do acampamento.

---

## 🎨 Identidade Visual TNB

O projeto replica rigorosamente a identidade visual e padrão do **Tarefas TNB**:
- **Cores Oficiais:**
  - Azul Céu TNB: `#78c8fb`
  - Lilás TNB: `#bb94ff`
  - Roxo Profundo: `#5b21b6`
  - Gradiente radial e linear com efeito *glassmorphism*
- **Logotipo Oficial:** Incluído em `public/Logo_TNB.jpg`
- **Dark Mode:** Suporte completo com alternância com um clique no cabeçalho ou adaptação automática ao sistema.

---

## 🚀 Stack Tecnológica

- **Front-end / Framework:** [Next.js](https://nextjs.org/) (App Router), React 19, TypeScript
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com paleta TNB e modo noturno
- **Ícones & Efeitos:** [Lucide Icons](https://lucide.dev/) e [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Banco de Dados & Realtime:** [Supabase](https://supabase.com/) (PostgreSQL Gratuito + WebSockets)
- **Hospedagem & Deploy:** [Vercel](https://vercel.com/) (otimizado com suporte nativo a Next.js)

---

## ⚡ Funcionalidades

1. **🏆 Pódio da Vitória (Top 3):**
   - 1º Lugar com troféu dourado, coroa flutuante e celebração com confetes.
   - 2º Lugar com medalha prateada.
   - 3º Lugar com medalha de bronze.
2. **📊 Placar Geral:**
   - Classificação ordenada por pontuação acumulada decrescente.
   - Barras visuais proporcionais à liderança com as cores oficiais de cada equipe.
   - Botão rápido de lançamento de pontos em cada linha.
3. **📺 Modo Telão / Apresentação (`/telao`):**
   - Rota dedicada de tela cheia sem distrações de formulários administrativos.
   - Tipografia gigante de alto contraste para projetar em datashow ou telão de LED.
   - Atualização em tempo real sem precisar atualizar a página (F5).
4. **⚡ Lançamento Rápido de Pontos (Mobile-First):**
   - Otimizado para celulares de líderes no campo:
   - Seletor de equipe e prova.
   - Atalhos rápidos: `+10`, `+20`, `+50`, `+100`, `+500` e penalidades `-10`, `-20`, `-50`.
   - Campo para registrar o motivo ou observação do ponto.
5. **🛡️ Gestão de Equipes (CRUD):**
   - Cadastro, edição e exclusão de equipes com paleta de cores vibrantes.
6. **🎯 Gestão de Provas / Atividades (CRUD):**
   - Cadastro de provas com regras, dinâmica e pontuação máxima sugerida.
7. **📋 Histórico de Lançamentos:**
   - Log em tempo real com data, hora, motivo e opção de desfazer/excluir lançamentos incorretos.

---

## 🛠️ Passo a Passo: Configuração do Supabase

O projeto utiliza o Supabase para armazenar as equipes, atividades e pontuações, além de fornecer sincronização em tempo real via WebSockets.

### 1. Crie seu projeto no Supabase
1. Acesse [supabase.com](https://supabase.com/) e faça login (ou crie sua conta gratuita).
2. Clique em **"New Project"**.
3. Escolha um nome (ex: `Acampa-TNB`), defina uma senha segura para o banco de dados e selecione a região mais próxima (ex: `São Paulo / Brazil`).

### 2. Execute o Script SQL
1. No painel do seu projeto Supabase, clique no menu lateral **SQL Editor**.
2. Clique em **"New query"**.
3. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste repositório, copie todo o seu conteúdo e cole no SQL Editor.
4. Clique em **"Run"** (ou aperte `Ctrl + Enter`).
5. As tabelas `teams`, `activities` e `scores` serão criadas com as regras de acesso (RLS) e a publicação do Supabase Realtime configurada!

### 3. Obtenha as Credenciais da API
1. No menu lateral do Supabase, clique na engrenagem **Project Settings** -> **API**.
2. Copie:
   - **Project URL**
   - **anon / public key**
3. Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Nota:** Se você não configurar as chaves do Supabase, o app automaticamente entrará em **Modo Demonstração Local**, persistindo os dados no seu navegador para que você possa testar tudo imediatamente!

---

## 💻 Como Rodar Localmente

1. Clone ou abra a pasta do projeto:
```bash
cd "d:\Projetos\App Acampa"
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador:
- Painel Administrativo / Placar: [http://localhost:3000](http://localhost:3000)
- Modo Telão de Projeção: [http://localhost:3000/telao](http://localhost:3000/telao)

---

## ☁️ Deploy na Vercel

O projeto está 100% configurado para deploy gratuito na **Vercel**.

### Opção A: Deploy pelo Painel da Vercel (Recomendado via GitHub)
1. Suba o código para o seu repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com/) e clique em **"Add New..."** -> **"Project"**.
3. Importe o repositório `App Acampa`.
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`: sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: sua Anon Key do Supabase
5. Clique em **"Deploy"**.

## 🌐 Acesso ao Projeto

- **Painel Geral:** [https://gincana-tnb.vercel.app](https://gincana-tnb.vercel.app)
- **Modo Telão:** [https://gincana-tnb.vercel.app/telao](https://gincana-tnb.vercel.app/telao)
- **Repositório GitHub:** [https://github.com/rodrigocsantos1-git/app-gincana-tnb](https://github.com/rodrigocsantos1-git/app-gincana-tnb)


---

## 📜 Licença e Créditos

Desenvolvido para o **Ministério Infantil Tô na Bênção (TNB)** da **Igreja Bíblica da Paz (IBP)**.
*"Crianças com os olhos fixos em Jesus!"*
