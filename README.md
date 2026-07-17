# Knockout League — estado do projeto

## Modelo de papéis
- **Admin (dono do site, tu)** — `role: "admin"` no documento em `users/`. Acede a `admin.html` (link discreto no rodapé do `login.html`, "KNOCKOUTLEAGUE"). Gere utilizadores (promove/remove admins), vê e elimina qualquer torneio, lê as mensagens de contacto.
- **Organizador** — qualquer utilizador registado que cria um torneio (`creatorUid`). Gere a sua sala por completo.
- **Moderador** — adicionado pelo organizador (por nickname) na aba "Moderadores" da sala. Mesmas permissões do organizador nessa sala, exceto gerir moderadores.
- **Jogador** — qualquer conta (registada, Google ou convidado) que entra num torneio.

## Feito nesta versão
- `firebase.js`, `shared.css`/`shared.js`, `login.html` (email/password + Google + convidado), `nav-auth.js`
- `index.html`, `torneios.html`, `criar-torneio.html`, `torneio.html` (motor de bracket completo)
- `perfil.html`, `definicoes.html`
- `admin.html` — painel do dono do site (utilizadores, torneios, mensagens de contacto)
- `faq.html`, `contacto.html` (mensagens guardadas na coleção `contactos`)
- `firestore.rules`, `DATA-MODEL.md`

## Por fazer a seguir
1. **Eliminação dupla** — falta o bracket de perdedores automático.
2. Regras do Firestore mais finas para `matches`.
3. Notificação de "é a tua vez" para o capitão certo no modo de draft.
4. Standings para o modo todos-contra-todos.

## Antes de publicar
1. Cria um projeto novo em https://console.firebase.google.com
2. Ativa Authentication → Email/Password e Anónimo
3. Ativa Firestore Database
4. Copia a config para `firebase.js`
5. Cola as regras (ajustadas) de `firestore.rules`
6. O teu primeiro admin: regista-te normalmente e depois muda `role` para `"admin"` no teu documento em `users/` na consola do Firestore
