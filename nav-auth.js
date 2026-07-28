// nav-auth.js — injeta dinamicamente o estado de login na nav
import { auth, db, doc, collection, query, where, getDocs, onSnapshot } from './firebase.js';
import { getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Nota: a limpeza de contas convidado é feita de forma "preguiçosa" (lazy) —
// ver login.html — em vez de apagar no pagehide, que disparava também ao navegar
// dentro do próprio site e apagava a conta a meio da visita.

onAuthStateChanged(auth, async function (user) {
  const area = document.getElementById('nav-user-area');
  if (!area) return;

  if (!user) {
    area.innerHTML = '<a href="login.html">Entrar</a>';
    return;
  }

  let nick = user.isAnonymous ? 'Convidado' : (user.displayName || 'Jogador');
  let avatarUrl = 'https://api.dicebear.com/8.x/pixel-art/svg?seed=' + encodeURIComponent(nick);
  let isAdmin = false;
  let tag = '';

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      nick = data.nickname || nick;
      avatarUrl = data.avatarUrl || avatarUrl;
      isAdmin = data.role === 'admin';
      tag = data.tag || '';
      if (!tag) {
        // conta antiga sem tag (ex: Google criada antes da funcionalidade existir) — gera uma agora
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        tag = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
        updateDoc(doc(db, 'users', user.uid), { tag }).catch(()=>{});
      }
    }
  } catch (e) { /* falha silenciosa */ }

  let pendingCount = 0;
  try {
    const notifQ = query(collection(db, 'notifications'), where('toUid', '==', user.uid));
    const notifSnap = await getDocs(notifQ);
    pendingCount = notifSnap.docs.filter(d => d.data().status === 'pending').length;
  } catch (e) { /* falha silenciosa */ }

  setupNotifToast(user.uid);

  area.innerHTML =
    '<div class="nav-user-dd" id="nav-user-dd">' +
      '<button class="nav-user-btn" type="button" id="nav-user-toggle">' +
        '<img class="nav-user-avatar" src="' + avatarUrl + '" alt=""/>' +
        '<span>' + nick + (pendingCount > 0 ? '<span style="background:var(--accent);color:#fff;border-radius:9px;padding:1px 7px;font-size:0.7rem;margin-left:6px;">' + pendingCount + '</span>' : '') + '</span>' +
      '</button>' +
      '<div class="nav-user-menu">' +
        '<a href="perfil.html">O meu perfil</a>' +
        '<a href="notificacoes.html">Notificações' + (pendingCount > 0 ? ' (' + pendingCount + ')' : '') + '</a>' +
        '<a href="os-meus-torneios.html">Os meus torneios</a>' +
        '<a href="clube.html">O meu clube</a>' +
        '<a href="clan.html">O meu clã</a>' +
        '<a href="definicoes.html">Definições</a>' +
        (isAdmin ? '<a href="admin.html">Painel de admin</a>' : '') +
        '<button id="nav-logout-btn">Terminar sessão</button>' +
      '</div>' +
    '</div>';

  document.getElementById('nav-user-toggle').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('nav-user-dd').classList.toggle('open');
  });
  document.getElementById('nav-logout-btn').addEventListener('click', function () {
    signOut(auth).then(function () { window.location.href = 'login.html'; });
  });
  document.addEventListener('click', function (e) {
    var dd = document.getElementById('nav-user-dd');
    if (dd && !dd.contains(e.target)) dd.classList.remove('open');
  });
});

// ── Toast de notificação em tempo real (novos convites) ──────────
let notifToastArmed = false;
let notifKnownIds = new Set();
function setupNotifToast(uid){
  if (window.__klNotifWatching) return; // evita duplicar o listener em SPA-like navegação
  window.__klNotifWatching = true;
  const q = query(collection(db, 'notifications'), where('toUid', '==', uid));
  onSnapshot(q, function (snap) {
    snap.docChanges().forEach(function (change) {
      const d = change.doc.data();
      if (change.type === 'added' && d.status === 'pending') {
        if (!notifToastArmed) { notifKnownIds.add(change.doc.id); return; } // ignora o carregamento inicial
        if (notifKnownIds.has(change.doc.id)) return;
        notifKnownIds.add(change.doc.id);
        showNotifToast(d);
      }
    });
    notifToastArmed = true;
  });
}

function showNotifToast(notif){
  const kind = notif.type === 'club_invite' ? 'clube' : (notif.type === 'clan_invite' ? 'clã' : '');
  const el = document.createElement('a');
  el.href = 'notificacoes.html';
  el.textContent = '🔔 Novo convite para o ' + kind + ' "' + notif.refName + '" — ver notificações';
  el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--ink);color:var(--bg);padding:14px 20px;font-family:Inter,sans-serif;font-size:0.85rem;font-weight:600;text-decoration:none;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,0.3);max-width:320px;';
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 8000);
}
