# Cris_Beauty — Sistema Profissional de Salão de Beleza

Sistema web completo, elegante e responsivo para gestão e agendamento de salão de beleza e estética de alto padrão, desenvolvido com arquitetura full-stack moderna, banco de dados relacional PostgreSQL e autenticação robusta.

---

## 1. Visão Geral e Arquitetura

- **Frontend**: React 19 com TypeScript, Tailwind CSS v4, ícones Lucide e tipografia premium (Cormorant Garamond + Plus Jakarta Sans).
- **Backend**: Node.js com Express e TypeScript, estruturado em rotas de API (`/api/*`), middlewares de autenticação e proteção baseada em papéis (RBAC).
- **Banco de Dados**: PostgreSQL com Drizzle ORM e Drizzle Kit, garantindo integridade referencial, queries tipadas e migrações estruturadas.
- **Autenticação**:
  - Cadastro e Login com e-mail e senha com hash seguro (`bcryptjs`).
  - Integração com Google Sign-In via Firebase Auth.
  - Sessões gerenciadas via tokens JWT seguros.
  - Recuperação de senha em 2 etapas com tokens criptográficos temporários de uso único.
- **Segurança**:
  - Verificação de autorização no servidor em todas as rotas restritas.
  - Validação estrita de preços e durações no servidor (evitando adulterações no cliente).
  - Verificação de disponibilidade de horários em tempo real para prevenir reservas duplicadas.
  - Registro de auditoria (`audit_logs`) para ações administrativas sensíveis.

---

## 2. Estrutura do Projeto

```
cris_beauty/
├── index.html                   # Entry point com SEO tags e Google Fonts
├── metadata.json                # Metadados e capacidades da aplicação
├── package.json                 # Dependências e scripts
├── tsconfig.json                # Configuração do TypeScript
├── vite.config.ts               # Configuração do Vite com middleware Express
├── server.ts                    # Entry point de produção full-stack (Express + SPA)
├── .env.example                 # Modelo de variáveis de ambiente sem segredos
├── src/
│   ├── main.tsx                 # Bootstrap do React
│   ├── App.tsx                  # Componente principal e roteamento interno
│   ├── index.css                # Variáveis de cor, tipografia e Tailwind
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript (User, Service, Appointment, etc.)
│   ├── context/
│   │   └── AuthContext.tsx      # Provedor de autenticação e sessão do usuário
│   ├── components/
│   │   ├── Navbar.tsx           # Cabeçalho com logo, navegação e menu de usuário
│   │   └── Footer.tsx           # Rodapé elegante com horários, contato e LGPD
│   ├── pages/
│   │   ├── Home.tsx             # Página inicial com vídeo de fundo e destaques
│   │   ├── ServicesPage.tsx     # Catálogo com filtros e seleção múltipla
│   │   ├── BookingPage.tsx      # Fluxo de agendamento com disponibilidade real
│   │   ├── LoginPage.tsx        # Login com e-mail/senha e Google OAuth
│   │   ├── RegisterPage.tsx     # Cadastro de clientes com validações
│   │   ├── ForgotPasswordPage.tsx # Recuperação de senha com token seguro
│   │   ├── ClientDashboard.tsx  # Área exclusiva com histórico e dados
│   │   ├── AdminDashboard.tsx   # Painel administrativo com KPIs, serviços e auditoria
│   │   └── AboutAndContactPage.tsx # Sobre o salão, WhatsApp e localização
│   ├── db/
│   │   ├── schema.ts            # Esquema relacional das tabelas Drizzle ORM
│   │   ├── drizzle.config.ts    # Configuração de migração do Drizzle Kit
│   │   ├── index.ts             # Pool de conexão PostgreSQL (Object Method)
│   │   └── seed.ts              # Seeder inicial de serviços, configurações e admin
│   ├── server/
│   │   ├── app.ts               # Instância do Express com middlewares e seed
│   │   ├── authMiddleware.ts    # Middlewares requireAuth e requireAdmin
│   │   └── routes.ts            # Rotas da API (/api/auth, /api/services, etc.)
│   └── lib/
│       ├── firebase.ts          # Inicialização do Firebase Client SDK
│       └── firebase-admin.ts    # Inicialização do Firebase Admin SDK
```

---

## 3. Serviços Iniciais Cadastrados

| Serviço | Categoria | Preço Inicial | Duração Estimada |
|---|---|---:|:---:|
| Corte feminino | Cabelo | R$ 60,00 | 45 min |
| Escova | Cabelo | R$ 45,00 | 40 min |
| Hidratação capilar | Cabelo | R$ 70,00 | 50 min |
| Coloração | Cabelo | R$ 150,00 | 120 min |
| Manicure | Unhas | R$ 30,00 | 35 min |
| Pedicure | Unhas | R$ 35,00 | 40 min |
| Manicure e pedicure | Unhas | R$ 60,00 | 70 min |
| Maquiagem | Maquiagem & Sobrancelhas | R$ 120,00 | 60 min |
| Design de sobrancelhas | Maquiagem & Sobrancelhas | R$ 35,00 | 30 min |
| Limpeza de pele | Estética & Pele | R$ 100,00 | 75 min |
| Penteado | Cabelo | R$ 90,00 | 60 min |
| Tratamento capilar | Cabelo | R$ 110,00 | 60 min |

*Nota: Todos os preços, durações e descrições podem ser alterados pelo administrador no painel.*

---

## 4. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js versão 20 ou superior.
- Instância PostgreSQL ativa (ou Cloud SQL no AI Studio).

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Configurar variáveis de ambiente
Crie um arquivo `.env` a partir do modelo `.env.example`:
```bash
cp .env.example .env
```
Preencha as variáveis de conexão com o banco de dados e segredos da sessão:
```env
SQL_HOST="/cloudsql/YOUR_PROJECT:REGION:INSTANCE" # ou host localhost/IP
SQL_DB_NAME="ai_studio_db"
SQL_USER="ai_studio_user"
SQL_PASSWORD="sua_senha_aqui"
SQL_ADMIN_USER="ai_studio_admin"
SQL_ADMIN_PASSWORD="sua_senha_admin"
JWT_SECRET="chave_secreta_jwt_minimo_32_caracteres"
ADMIN_EMAIL="admin@crisbeauty.com.br"
ADMIN_INITIAL_PASSWORD="CrisBeauty2026!Admin"
```

### Passo 3: Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor de desenvolvimento subirá na porta `3000` (http://localhost:3000), atendendo simultaneamente a aplicação React e as rotas da API em `/api/*`.

### Passo 4: Build e Execução em Produção
```bash
npm run build
npm start
```

---

## 5. Procedimento Seguro para o Primeiro Administrador

Para garantir que nenhuma senha padrão fique exposta:
1. Configure as variáveis `ADMIN_EMAIL` e `ADMIN_INITIAL_PASSWORD` no seu `.env` seguro.
2. Na primeira inicialização, o seeder (`src/db/seed.ts`) verifica se a conta existe; caso não exista, cria o usuário com papel `admin` e hash bcrypt.
3. Acesse a tela de Login com o e-mail administrativo configurado.
4. Imediatamente após o primeiro acesso, o administrador pode alterar sua senha na aba de configurações.

---

## 6. Configuração de Vídeo, Imagens e Envio de E-mails

- **Vídeo de Fundo**: O vídeo de fundo da página inicial está configurado em `src/pages/Home.tsx` com loop automático, mudo (`muted`), adaptável à tela (`object-cover`) e com camada semitransparente. Em caso de restrição de rede ou falha de carregamento, o sistema faz fallback instantâneo e gracioso para uma imagem de alta resolução do salão.
- **Imagens**: Os serviços e galerias utilizam imagens com parâmetros de otimização de largura e qualidade (`auto=format&fit=crop&q=80`). No painel administrativo, o administrador pode fornecer URLs de novas fotos para cada serviço.
- **Envio de E-mail**: Para ativar o envio de e-mails de recuperação de senha por SMTP, configure as variáveis `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS` no `.env`. Na ausência de credenciais SMTP, o sistema exibe o aviso explicativo e fornece o token de segurança na interface para que o fluxo possa ser testado e auditado de ponta a ponta.

---

## 7. Roteiro de Verificação e Testes Obrigatórios

1. **Cadastro de Novo Cliente**: Acesse "Criar Conta", preencha nome, e-mail, telefone e senha. O sistema valida os campos e salva no PostgreSQL com papel `client`.
2. **E-mail Duplicado**: Tente cadastrar o mesmo e-mail novamente. O sistema bloqueia e exibe a mensagem: *"Esta conta já está cadastrada. Acesse sua conta."*
3. **Não Autenticação Automática**: Após cadastrar, o sistema exibe mensagem de sucesso e aguarda o login explícito pelo usuário.
4. **Senha Incorreta**: Tente logar com senha errada. O sistema exibe: *"Senha incorreta. Tente novamente."*
5. **Conta Inexistente**: Tente logar com um e-mail não cadastrado. O sistema orienta: *"Conta não encontrada. Faça seu cadastro primeiro."*
6. **Recuperação de Senha**: Teste o fluxo em duas etapas no link "Esqueci minha senha" validando nome, e-mail e aplicando o token seguro de uso único.
7. **Proteção de Rotas Administrativas**: Tente acessar o painel administrativo logado como cliente comum. O acesso é bloqueado tanto no frontend quanto no backend com HTTP 403.
8. **Isolamento de Dados do Cliente**: O cliente só tem acesso aos seus próprios agendamentos e histórico retornado pela rota `/api/appointments/my`.
9. **Seleção Múltipla de Serviços**: Na página "Serviços & Preços", selecione 2 ou mais serviços. O resumo inferior calcula o total e a duração combinada.
10. **Validação do Preço no Servidor**: O backend calcula os valores somando os preços diretamente do banco, ignorando valores enviados pelo navegador.
11. **Bloqueio de Horário Ocupado**: Ao escolher uma data e horário já reservado, o sistema indica como ocupado e rejeita tentativas concorrentes de reserva (HTTP 409).
12. **Persistência**: Ao deslogar e logar novamente, todos os agendamentos continuam preservados no banco de dados.
13. **Painel do Administrador**: O administrador pode alterar preços, adicionar serviços, consultar todos os agendamentos, alterar status e visualizar logs de auditoria.
14. **Validação de Pagamentos**: O faturamento apresentado no painel considera estritamente pagamentos marcados como `confirmado`.
15. **Responsividade**: Layout testado e adaptado para telas mobile, tablet e desktop.
16. **Links e Contatos**: Botão WhatsApp oficial direciona com mensagem pronta e telefone configurável.
