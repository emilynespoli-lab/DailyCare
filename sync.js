/* Sincronização na nuvem (opcional, veja o README).
   Preencha com os dados do seu projeto Supabase. */
const SUPABASE_URL = https://shstgohdqbgkejolplcg.supabase.co;
const SUPABASE_ANON_KEY = sb_publishable_zAtkOK033rUc-bFRu3OBXA_E1_OUpMM;

/* ---------- nuvem (Supabase) ---------- */
const cloudOn = !!(SUPABASE_URL && SUPABASE_ANON_KEY && typeof supabase !== 'undefined');
const sb = cloudOn ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let session = null, syncMsg = '', syncTimer = null, syncing = false, forceNext = false;

function safeRender() {
  const a = document.activeElement;
  if (a && ['INPUT', 'TEXTAREA', 'SELECT'].includes(a.tagName)) return;
  render();
}
function setMsg(m) { syncMsg = m; if (view === 'ajustes') safeRender(); }

function merge(local, remote) {
  const rc = remote.cfgTs || remote.habitsTs || 0;
  const out = {cfgTs: local.cfgTs || 0, habits: local.habits, plan: local.plan, goal: local.goal, entries: {}};
  if (rc > out.cfgTs) {
    ['habits', 'plan', 'goal'].forEach(k => { if (remote[k] !== undefined) out[k] = remote[k]; });
    out.cfgTs = rc;
  }
  const re = remote.entries || {};
  new Set([...Object.keys(local.entries), ...Object.keys(re)]).forEach(k => {
    const x = local.entries[k], y = re[k];
    out.entries[k] = !x ? y : !y ? x : ((y.ts || 0) > (x.ts || 0) ? y : x);
  });
  return out;
}

function scheduleSync(force) {
  if (!sb || !session) return;
  if (force) forceNext = true;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(sync, 1500);
}

async function sync() {
  if (!sb || !session) return;
  if (syncing) { scheduleSync(); return; }
  syncing = true;
  const force = forceNext; forceNext = false;
  try {
    if (!force) {
      const {data, error} = await sb.from('care_data').select('data').eq('user_id', session.user.id).maybeSingle();
      if (error) throw error;
      if (data && data.data) { state = merge(state, data.data); saveLocal(); }
    }
    const {error} = await sb.from('care_data').upsert({
      user_id: session.user.id, data: state, updated_at: new Date().toISOString()
    });
    if (error) throw error;
    syncMsg = 'Sincronizado às ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) + '.';
  } catch (e) {
    syncMsg = 'Não foi possível sincronizar. Seus dados continuam salvos neste aparelho.';
  } finally {
    syncing = false;
    safeRender();
  }
}

async function login() {
  const email = document.getElementById('email').value.trim();
  if (!email) return;
  const {error} = await sb.auth.signInWithOtp({email, options: {emailRedirectTo: location.origin + location.pathname}});
  setMsg(error ? 'Não foi possível enviar o link: ' + error.message : 'Link enviado. Abra o e-mail neste aparelho e toque no link.');
}
async function logout() {
  await sb.auth.signOut();
  setMsg('Você saiu. Os dados continuam neste aparelho.');
}

function accountHtml() {
  const msg = syncMsg ? `<p class="empty">${esc(syncMsg)}</p>` : '';
  if (!cloudOn) return `
    <div class="label">Sincronização</div>
    <p class="empty" style="margin-top:0">Desativada: os dados ficam só neste navegador. Para salvar na nuvem e usar em vários aparelhos, configure o Supabase (veja o README).</p>`;
  if (!session) return `
    <div class="label">Conta</div>
    <p class="empty" style="margin-top:0">Entre com seu e-mail para salvar seus registros na nuvem. Você recebe um link, sem senha.</p>
    <div class="add"><input type="email" id="email" placeholder="seu@email.com" autocomplete="email" aria-label="E-mail">
    <button class="btn" data-login>Enviar link</button></div>${msg}`;
  return `
    <div class="label">Conta</div>
    <p class="empty" style="margin-top:0">Conectada como <b>${esc(session.user.email)}</b>. Seus registros são salvos na nuvem automaticamente.</p>
    <div class="actions"><button class="btn" data-sync>Sincronizar agora</button>
    <button class="btn ghost" data-logout>Sair</button></div>${msg}`;
}

if (sb) {
  sb.auth.onAuthStateChange((event, s) => {
    session = s;
    if (s && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) setTimeout(sync, 0);
    else safeRender();
  });
}
