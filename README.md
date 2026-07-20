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

## Atualização — bugs de convidado corrigidos + sala redesenhada
- **Bug raiz encontrado e corrigido**: o `pagehide` (usado para limpar contas convidado) disparava em qualquer navegação dentro do site — não só ao fechar o browser — apagando a conta a meio da visita. Isso causava três sintomas em simultâneo: nickname a aparecer como "Convidado"/"Jogador" em vez do nome escolhido, e a conta a "desaparecer" ao voltar ao perfil. Removido o `pagehide`; a limpeza de convidados volta a ser só "preguiçosa" (contas com mais de 1h, feita em `login.html`). Convidados passam também a usar sessão persistente local em vez de só-de-sessão, para não se perderem ao navegar.
- **Sala da partida redesenhada**:
  - Cabeçalho único: nomes das equipas, estado, formato, BOx e o placar de jogos da série, tudo junto no topo.
  - Layout de 3 colunas: equipa A | fase "quem começa" + banimento de mapas (ao centro, entre as equipas) | equipa B.
  - Banir mapas agora é uma lista (nome do mapa + link "Banir" ao lado), não pills clicáveis inteiras.
  - Pontuação e servidor lado a lado, depois dos mapas.
  - As opções do organizador ("Configurar sala") só aparecem mesmo para quem gere o torneio — deixaram de aparecer (só desativadas) aos jogadores normais.
  - **Pedra, papel, tesoura a sério**: quando o método escolhido é RPS, os dois capitães jogam um contra o outro (cada um escolhe pedra/papel/tesoura sem ver a escolha do outro até ambos terem escolhido); em empate, repetem automaticamente.

## Atualização — colocar equipas tardias na bracket, séries BO automáticas, tag privada
- **Equipas adicionadas depois do torneio já ter começado** — se o organizador criar uma equipa nova (ou uma já formada não tiver entrado a tempo), aparece uma caixa "Equipas por colocar na bracket" na aba Bracket, com um botão para escolher em que vaga livre a colocar (só mostra partidas ainda por decidir, com um lugar por preencher).
- **Séries BO totalmente automáticas** — se o torneio tem "pontos para vencer" definidos, o jogo termina sozinho assim que uma equipa lá chega (sem precisar de clicar em "Finalizar partida") e avança logo para o jogo seguinte da série, ou para a próxima ronda da bracket se a série já estiver decidida.
- **Tag privada** — o `#XXXX` de cada jogador só aparece para ele próprio (no seu perfil e no canto da nav); deixou de aparecer nas equipas, no pool, na sala da partida e no admin.

## Atualização — fim do jogo automático, gestão de equipas a qualquer momento, convite por tag
- **Sala da partida**: removido o botão "Finalizar este jogo" do lado dos jogadores (o jogo já termina sozinho). No mesmo lugar, quando o confronto acaba, aparece "Ir para a próxima sala" (se houver) ou "Voltar à bracket" (se for a final). O organizador mantém, na sua área de configurações, um botão "Forçar fim do jogo" para os casos em que não haja pontos-alvo definidos ou seja preciso destrancar algo manualmente.
- **Gestão de jogadores/equipas liberta da fase de inscrições** — atribuir um jogador do pool a uma equipa, tirar um jogador de uma equipa para o pool, adicionar jogador manual/bot, e adicionar um jogador já registado (por nickname + tag) já funcionam a qualquer momento, mesmo com o torneio a decorrer ou com as inscrições fechadas. "Eliminar equipa" continua só disponível antes da bracket ser gerada, para não desfazer partidas já em curso.
- **"+ Adicionar jogador (atraso na inscrição)" simplificado** — desapareceu o atalho direto para dentro da equipa; agora todo o jogador tardio entra primeiro no pool e o organizador usa o campo "Atribuir a..." para o colocar na equipa certa.
- **"+ Jogador registado"** — novo botão para convidar alguém que já tem conta na plataforma mas não se inscreveu a tempo: o organizador pede-lhe o nickname e a tag (`nickname#XXXX`, que só o próprio jogador vê no perfil dele) e a app procura e adiciona-o ao pool.

## Atualização — regenerar bracket e substituir equipas colocadas
- **Regenerar bracket** — se ainda não houver nenhuma partida decidida, aparece na aba Bracket um botão para apagar a bracket atual e gerar uma nova já com todas as equipas prontas nesse momento (resolve o caso de teres começado o torneio cedo demais e faltarem equipas).
- **Substituir equipa já colocada** — se não houver vagas livres (bracket já preenchida por completo) mas ainda houver partidas por decidir, "Colocar na bracket" passa a permitir escolher uma equipa já colocada num desses jogos e substituí-la — a equipa substituída volta automaticamente à lista de "por colocar".

## Atualização — regenerar bracket corrigido (byes já não bloqueiam)
- **Bug corrigido**: uma "bye" (equipa que passa sozinha à ronda seguinte por falta de adversário) ficava marcada como "partida terminada", o que bloqueava o botão de regenerar mesmo sem nenhum resultado real. Agora só contam partidas verdadeiras (com as duas equipas definidas).
- **Botão sempre visível ao organizador** — em vez de desaparecer assim que há qualquer resultado, o botão "Regenerar/Reiniciar bracket" fica sempre disponível; muda de texto e cor (aviso a vermelho) quando já existem resultados reais que se vão perder, com uma confirmação extra nesse caso.

## Atualização — modo manual de posicionamento na bracket
- **Novo modo de sorteio "Manual"** (ao lado de Aleatório e Por seed) — o organizador define a posição de cada equipa (1, 2, 3, 4...) e a bracket usa-a diretamente: posição 1 joga contra a 2, a 3 contra a 4, etc. Dá controlo total sobre quem enfrenta quem na 1ª ronda.
- O campo de posição/seed nas equipas passou a poder ser editado mesmo depois da bracket já ter sido gerada (só o organizador o vê) — ajusta-se e depois usa-se "Regenerar bracket" na aba Bracket para aplicar.

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
