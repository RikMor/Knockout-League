# Knockout League — estado do projeto

## Modelo de papéis
- **Admin (dono do site, tu)** — `role: "admin"` no documento em `users/`. Acede a `admin.html` (link discreto no rodapé do `login.html`, "KNOCKOUTLEAGUE"). Gere utilizadores (promove/remove admins), vê e elimina qualquer torneio, lê as mensagens de contacto.
- **Organizador** — qualquer utilizador registado que cria um torneio (`creatorUid`). Gere a sua sala por completo.
- **Moderador** — adicionado pelo organizador (por nickname) na aba "Moderadores" da sala. Mesmas permissões do organizador nessa sala, exceto gerir moderadores.
- **Jogador** — qualquer conta (registada, Google ou convidado) que entra num torneio.

## Atualização — fluxo de equipas e torneio
- **admin.html**: já não promove a admin por ali (isso continua a fazer-se manualmente no Firestore); em vez disso tens "Ver perfil" e "Eliminar" por utilizador, e um filtro Registados/Google/Convidados.
- **Contas convidado**: agora apagam-se sozinhas do Firestore assim que a pessoa fecha a aba/o browser (via `pagehide` + pedido `keepalive` direto à API REST do Firestore, em `nav-auth.js`). Continuam a existir docs "presos" de convidados apagados só na Authentication antigamente — usa o botão Eliminar no admin para limpar esses.
- **Tag do jogador**: toda a conta nova (registo, Google, convidado) recebe uma tag curta tipo `#A1B2`, guardada em `users/{uid}.tag`. Aparece junto ao nickname na nav, no perfil, nas equipas/pool da sala e no admin.
- **Criar torneio**: além do tipo de bracket, escolhes agora o **modo de sorteio** — Aleatório (posições ao acaso) ou Por seed (tu ordenas as equipas antes e a bracket segue o padrão oficial 1-vs-16, 2-vs-15, etc., para os melhores só se encontrarem mais tarde).
- **Equipas auto-organizadas**: durante as inscrições, qualquer jogador no pool pode "Criar a minha equipa" (fica capitão automaticamente) e outros jogadores do pool podem clicar "Juntar-me a esta equipa" diretamente — não depende só do organizador.
- **Começar torneio** (antigo "Gerar bracket"): quando o organizador clica, o que sobrar por atribuir no pool é distribuído automaticamente (roleta/pedra-papel-tesoura) pelas equipas em falta — exceto em modo manual, que exige tudo atribuído à mão antes. Só depois gera a bracket (com seed, se escolhido) e muda o estado para "em-curso".
- **Remover jogadores/equipas**: o organizador (ou moderador) pode remover um jogador do pool, remover um membro de uma equipa (volta ao pool), ou eliminar a equipa toda (membros voltam ao pool) — sempre antes da bracket ser gerada.
- **"Os meus torneios"** (`os-meus-torneios.html`, novo link no menu do utilizador): mostra os torneios em que a pessoa está inscrita como jogadora, e os que organiza ou modera.

## Feito nesta versão
- `firebase.js`, `shared.css`/`shared.js`, `login.html` (email/password + Google + convidado), `nav-auth.js`
- `index.html`, `torneios.html`, `criar-torneio.html`, `torneio.html` (motor de bracket completo)
- `perfil.html`, `definicoes.html`
- `admin.html` — painel do dono do site (utilizadores, torneios, mensagens de contacto)
- `faq.html`, `contacto.html` (mensagens guardadas na coleção `contactos`)
- `firestore.rules`, `DATA-MODEL.md`

## Por fazer a seguir
1. **Eliminação dupla** — falta o bracket de perdedores automático (o sorteio/seed já funciona igual ao da eliminação simples para a bracket de vencedores).
2. Regras do Firestore mais finas para `matches` e `teams` (agora qualquer utilizador autenticado pode escrever — está solto de propósito para o auto-serviço de equipas funcionar; convém restringir mais tarde).
3. Standings para o modo todos-contra-todos.
4. O "modo de escolha com vários capitães" (`draftMode`) já funciona durante as inscrições (capitães escolhem à vez do pool); ainda não há um aviso/notificação fora da aba Equipas a dizer "é a tua vez".

## Antes de publicar
1. Cria um projeto novo em https://console.firebase.google.com
2. Ativa Authentication → Email/Password e Anónimo
3. Ativa Firestore Database
4. Copia a config para `firebase.js`
5. Cola as regras (ajustadas) de `firestore.rules`
6. O teu primeiro admin: regista-te normalmente e depois muda `role` para `"admin"` no teu documento em `users/` na consola do Firestore
