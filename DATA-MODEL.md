# Knockout League — Modelo de Dados (Firestore)

Base de dados Firebase **nova e separada** da do ManyGames (mesma estrutura de auth, config diferente).
Substitui os valores em `firebase.js` pelos do teu novo projeto Firebase antes de publicar.

## Coleções

### `users/{uid}`
Igual ao ManyGames, com um campo extra `role`.
```
{
  name, nickname, nicknameLower, email, country, avatarUrl,
  isGuest: bool,
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
  maxTeams,
  assignMode: "roulette" | "manual",     // como os jogadores vão para as equipas
  draftMode: "random" | "captains" | "organizer",  // quando há >2 capitães
  maps: [ "Mirage", "Inferno", ... ],    // definidos pelo criador
  mapBanEnabled: bool,
  coinMethod: "coin" | "dice",
  status: "inscricoes" | "draft" | "em-curso" | "terminado",
  createdAt
}
```

### `tournaments/{id}/players/{playerId}`
Pool de jogadores antes (ou fora) de terem equipa.
```
{
  uid: string | null,       // null = jogador manual (fora da plataforma)
  name, source: "platform" | "manual",
  isCaptain: bool,
  teamId: string | null
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

## Fluxo resumido
1. Criador cria o torneio (`criar-torneio.html`) → escolhe jogo, formato NvN, tipo de bracket, mapas, visibilidade, modo de atribuição.
2. Jogadores entram na sala (pública ou por código privado) → entram no pool de jogadores.
3. Criador define capitães (ou aleatório) e atribui jogadores às equipas — roleta ou manual. Com >2 capitães, o modo de escolha (`draftMode`) decide quem escolhe.
4. Criador gera a bracket a partir das equipas.
5. Por cada match: lobby → banir mapas → moeda/dado para saber quem começa → admin do torneio insere a info do servidor → jogo decorre → resultado regista o vencedor e avança a bracket.
