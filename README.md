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

## Atualização — configurações da sala, bots e terminar torneio
- **Correção crítica**: o erro "Missing or insufficient permissions" em "Os meus torneios" era falta de uma regra de `collectionGroup` no Firestore — corrigido em `firestore.rules` (precisa de ser republicada na consola).
- **RPS também em "Como decidir quem começa"** — já não é só moeda/dado.
- **Bracket com um ou dois lados** — nova opção ao criar o torneio (e editável depois em Configurações): "dois lados" mostra a bracket espelhada, a convergir ao centro, como nos brackets oficiais.
- **Bots** — o organizador pode adicionar jogadores fictícios ("+ Bot") tal como já podia adicionar jogadores externos.
- **Adicionar jogador a uma equipa já na bracket** — se alguém não se inscreveu a tempo, o organizador pode adicionar um jogador diretamente a uma equipa mesmo depois do torneio já ter começado.
- **Aba "Configurações"** (organizador + moderadores) — editar nome, jogo, visibilidade, método de decidir quem começa, layout da bracket e banimento de mapas depois de a sala já existir; e uma "zona perigosa" só do organizador para **terminar e eliminar** o torneio por completo (equipas, jogadores e partidas incluídos).
- **"A tua partida"** — quando o torneio está em curso, aparece um destaque no topo da aba Bracket com a partida ativa do jogador e um atalho direto para o lobby dela.

## Atualização — sala de partida dedicada
- **`sala-partida.html`** (nova página, `?t=<id-torneio>&m=<id-partida>`) — sala própria de cada confronto, com as duas equipas lado a lado (avatar, nickname#tag, coroa no capitão) e o estado ao centro, inspirada em plataformas como a FACEIT. Reúne tudo o que já existia no modal antigo: quem bane primeiro, banir mapas, quem começa a jogar (moeda/dado/RPS), servidor, pontuação e declarar vencedor.
- Os cartões da bracket e o destaque "A tua partida" já levam diretamente a esta sala em vez de abrirem um popup — assim que o organizador clica em "Começar torneio", as salas de todas as partidas já existem e são navegáveis de imediato.

## Atualização — sequência da sala, séries BO1/BO3/BO5 e pontuação a duas confirmações
- **Correção**: convidados já mostram o nickname escolhido (não mais "Convidado" fixo) em toda a plataforma — o bug estava em vários sítios a saltar a leitura do Firestore para contas anónimas.
- **Redireccionamento automático** — assim que o organizador clica em "Começar torneio", cada jogador que já esteja na página do torneio é levado automaticamente para a sala da sua partida.
- **Fluxo por fases na sala** (`sala-partida.html`), já não aparece tudo de uma vez:
  1. **Quem começa** — um único botão, conforme o método escolhido pelo organizador (moeda/dado/pedra-papel-tesoura); o vencedor bane primeiro.
  2. **Banir mapas** — só aparece depois da fase 1, um mapa de cada vez, à vez (só a equipa da vez consegue clicar).
  3. **Servidor** — o organizador cola o IP/senha assim que o mapa estiver definido.
  4. **Pontuação ao vivo** — dois botões grandes ("+1 ponto"), um por equipa, só visíveis aos capitães (ou ao organizador); **cada ponto só conta depois de os dois capitães confirmarem** (um propõe, o outro confirma clicando no mesmo botão).
  5. **Finalizar partida** — os capitães (ou o organizador) fecham o jogo atual; se for um BO3/BO5 e a série ainda não estiver decidida, começa o jogo seguinte automaticamente, com a equipa que perdeu a decisão da fase 1 anterior a ganhar a vez de banir primeiro desta vez (sem repetir moeda/RPS). Em BO1, termina logo o confronto todo e avança a bracket.
- **BO1/BO3/BO5 e pontos por jogo** — novas opções ao criar o torneio.
- **"Configurar sala" do organizador** — dentro da própria sala da partida, secção só para quem gere o torneio, para forçar manualmente "quem começa" se a decisão automática falhar.
- Os cartões da bracket voltaram a mostrar os **jogos ganhos da série** (2-0, 2-1, etc.) em vez da pontuação de um único jogo.

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
