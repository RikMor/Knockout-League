# Knockout League — Modelo de Dados (Firestore)

Base de dados Firebase **nova e separada** da do ManyGames (mesma estrutura de auth, config diferente).
Substitui os valores em `firebase.js` pelos do teu novo projeto Firebase antes de publicar.

## Coleções

### `users/{uid}`
Igual ao ManyGames, com um campo extra `role`.
```
{
  name, nickname, nicknameLower, email, country, avatarUrl,
  role: "admin" | "player",       // novo — define quem vê o painel de admin
  stats: { torneios, vitorias, derrotas, mvp },
  createdAt
}
```
O primeiro admin define-se manualmente no Firestore (muda `role` para `"admin"` no teu doc).

### `tournaments/{tournamentId}`
```
{
  name, game,                      // ex: "Counter-Strike 2"
  teamSize: 1-6,                   // 1v1 até 6v6
  bracketType: "single" | "double" | "round-robin",  // decidido pelo criador
  visibility: "public" | "private",
  inviteCode,                      // só se privado
  creatorUid, creatorParticipates: bool,
  maxTeams, maxPlayers,             // maxPlayers é opcional — limite de pessoas na pool, sem limite se null
  assignMode: "roulette" | "manual",     // como os jogadores vão para as equipas
  draftMode: "random" | "captains" | "organizer",  // quando há >2 capitães
  maps: [ "Mirage", "Inferno", ... ],    // definidos pelo criador
  mapBanEnabled: bool,
  coinMethod: "coin" | "rps",       // "coin" = aleatório; rps = pedra/papel/tesoura
  joinMode: "both" | "solo" | "clan",   // como as pessoas podem entrar no torneio
  participantUids: [uid, ...],      // todos os uids que já estiveram/estão inscritos (pool ou equipa) — usado por "Os meus torneios" → "A jogar", sem precisar de índice collectionGroup
  regOpensAt, regClosesAt,          // datetime-local strings, opcionais
  status: "inscricoes" | "fechado" | "em-curso" | "terminado",  // "fechado" = inscrições fechadas, à espera de check-in da pool
  createdAt
}
```

### `tournaments/{id}/players/{playerId}`
Pool de jogadores antes (ou fora) de terem equipa.
```
{
  uid: string | null,       // null = jogador manual/bot (fora da plataforma)
  name, source: "platform" | "manual" | "bot",
  isCaptain: bool,
  teamId: string | null,
  checkedIn: bool            // só relevante enquanto o jogador está na pool e o torneio está "fechado";
                              // bots/manuais ficam automaticamente true (não conseguem fazer check-in sozinhos)
}
```

### `tournaments/{id}/teams/{teamId}`
```
{
  name, captainPlayerId, seed,
  players: [playerId, ...]   // referências à subcoleção players
}
```

### `tournaments/{id}/matches/{matchId}`
```
{
  round, matchIndex,
  teamAId, teamBId, winnerId,
  bracketSide: "winners" | "losers",  // só para double elimination
  mapsBanned: [ "Mirage", ... ],
  mapPicked,
  coinResult: { method, teamAId },    // quem ganhou a moeda/dado
  serverInfo: { method, value },      // ex: "IP + password" ou "Sala + código"
  status: "por-jogar" | "lobby" | "em-curso" | "terminado"
}
```

### `config/site`
Documento único (singleton) que controla o modo de manutenção do site inteiro, gerido a partir de admin.html.
```
{
  maintenanceMode: bool,       // true = site inteiro bloqueado (exceto para admins com sessão iniciada)
  maintenanceMessage: string   // opcional, mostrado aos visitantes no ecrã de manutenção
}
```
Lido por `manutencao.js`, importado em todas as páginas do site exceto `admin.html`. Precisa de regra no `firestore.rules`: leitura pública (`allow read: if true`), escrita só para quem tiver `role == "admin"` em `users/{uid}`.

## Fluxo resumido
1. Criador cria o torneio (`criar-torneio.html`) → escolhe jogo, formato NvN, tipo de bracket, mapas, visibilidade, modo de atribuição.
2. Jogadores entram na sala (pública ou por código privado) → entram no pool de jogadores.
3. Criador define capitães (ou aleatório) e atribui jogadores às equipas — roleta ou manual. Com >2 capitães, o modo de escolha (`draftMode`) decide quem escolhe.
4. Criador gera a bracket a partir das equipas.
5. Por cada match: lobby → banir mapas → moeda/dado para saber quem começa → admin do torneio insere a info do servidor → jogo decorre → resultado regista o vencedor e avança a bracket.
