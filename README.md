# Knockout League — estado do projeto

## Feito nesta primeira versão
- `firebase.js` — liga a um projeto Firebase novo (**preencher com a tua config**)
- `shared.css` / `shared.js` — tema simples e moderno (sem animação de fundo), tipografia Anton + Inter + IBM Plex Mono
- `login.html` — mesma base de autenticação do ManyGames (email/palavra-passe, registo, convidado), adaptada à marca
- `nav-auth.js` — estado de sessão na nav, com link de "Painel de admin" só para `role: admin`
- `index.html` — landing page com torneios públicos em destaque
- `torneios.html` — lista de torneios públicos + entrar por código privado
- `criar-torneio.html` — wizard completo: jogo, formato 1v1–6v6, tipo de bracket, visibilidade, modo de atribuição (roleta/manual), modo de escolha com vários capitães, mapas, banimento de mapas, moeda/dado
- `torneio.html` — motor principal:
  - pool de jogadores (da plataforma + adicionados manualmente)
  - definir capitães, atribuir jogadores por roleta ou manualmente
  - modo "capitães escolhem" com indicador de turno
  - geração de bracket (eliminação simples e todos-contra-todos, com resolução automática de byes)
  - vista de bracket clicável
  - lobby por partida: banir mapas, lançar moeda/dado, o admin insere a info do servidor, declarar vencedor avança a bracket automaticamente
- `firestore.rules` — regras de segurança de base (afinar antes de publicar)
- `DATA-MODEL.md` — estrutura completa das coleções Firestore

## Por fazer a seguir (não incluído nesta versão)
1. **Eliminação dupla** — agora gera só o bracket de vencedores; falta o bracket de perdedores automático.
2. **`perfil.html` / `definicoes.html` / `admin.html`** — podes reaproveitar quase 1:1 os do ManyGames, só trocar o texto e as stats para "torneios/vitórias".
3. Regras do Firestore mais finas para `matches` (agora qualquer utilizador autenticado pode escrever; devia restringir-se aos jogadores desse match + admin).
4. Notificação/destaque de "é a tua vez" para o capitão certo no modo de draft.
5. Ecrã de resultados/standings para o modo todos-contra-todos.

## Antes de publicar
1. Cria um projeto novo em https://console.firebase.google.com
2. Ativa Authentication → Email/Password e Anónimo
3. Ativa Firestore Database
4. Copia a config para `firebase.js`
5. Cola as regras (ajustadas) de `firestore.rules`
6. O teu primeiro admin: regista-te normalmente e depois muda `role` para `"admin"` no teu documento em `users/` na consola do Firestore
