// ── MODO DE MANUTENÇÃO ───────────────────────────────────────────────
// Importado em todas as páginas do site EXCETO admin.html (o backoffice
// tem de continuar sempre acessível ao admin, para ele poder desligar a
// manutenção). Lê tournaments-config/site em tempo real: se maintenanceMode
// estiver ativo, tapa a página inteira com um ecrã de manutenção — exceto
// para quem tiver sessão iniciada com role "admin".
import { auth, db, doc, getDoc, onSnapshot } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const overlay = document.createElement('div');
overlay.id = 'maintenance-overlay';
overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0E0D10;color:#F3F1EA;display:none;align-items:center;justify-content:center;text-align:center;padding:32px;font-family:Inter,sans-serif;';
overlay.innerHTML = `
  <div style="max-width:440px;">
    <div style="font-family:'Anton',sans-serif;letter-spacing:2px;font-size:1.3rem;margin-bottom:18px;">KNOCKOUT<span style="color:#E85A36;">LEAGUE</span></div>
    <div style="font-size:2.4rem;margin-bottom:14px;">🛠️</div>
    <h1 style="font-family:'Anton',sans-serif;font-size:1.5rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Site em manutenção</h1>
    <p id="maintenance-msg" style="color:#8E8B97;font-size:0.95rem;line-height:1.5;">Estamos a fazer alguns ajustes. Volta a tentar dentro de momentos.</p>
  </div>`;

function mount(){ if(!document.body.contains(overlay)) document.body.appendChild(overlay); }
if(document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

let maintenanceOn = false;
let isSiteAdmin = false;

function applyState(){
  mount();
  const block = maintenanceOn && !isSiteAdmin;
  overlay.style.display = block ? 'flex' : 'none';
  document.documentElement.style.overflow = block ? 'hidden' : '';
}

onSnapshot(doc(db, 'config', 'site'), function(snap){
  const d = snap.exists() ? snap.data() : {};
  maintenanceOn = !!d.maintenanceMode;
  const msgEl = document.getElementById('maintenance-msg');
  if(msgEl) msgEl.textContent = d.maintenanceMessage || 'Estamos a fazer alguns ajustes. Volta a tentar dentro de momentos.';
  applyState();
}, function(){ /* sem permissão de leitura ou doc inexistente — assume site normal */ maintenanceOn = false; applyState(); });

onAuthStateChanged(auth, async function(user){
  isSiteAdmin = false;
  if(user && !user.isAnonymous){
    try{
      const snap = await getDoc(doc(db, 'users', user.uid));
      isSiteAdmin = snap.exists() && snap.data().role === 'admin';
    }catch(e){ isSiteAdmin = false; }
  }
  applyState();
});
