/* ============================================================
   Dashboard Social — App v3
   Novidades: cores atualizadas · receita manual · Meta API auto-sync
   ============================================================ */

const COMPANIES = [
  {
    id: 'oasis',
    name: 'Oásis',
    desc: 'Hub & espaço de coworking',
    initial: 'O',
    accent:   '#18181B',
    light:    '#F4F4F5',
    dark:     '#09090B',
    rgb:      '24,24,27',
    gradient: 'linear-gradient(135deg,#3F3F46,#18181B)',
    sample: {
      posts: [['Reel','Tour pelo espaço Oásis'],['Carrossel','5 razões para coworcar'],['Reel','Evento networking'],['Foto','Espaço reformado'],['Reel','Depoimento de membro'],['Carrossel','Como alugar uma sala']],
      camps: ['Captação de membros','Evento de inauguração','Remarketing cowork'],
    },
  },
  {
    id: 'family',
    name: 'Family Experience',
    desc: 'Experiências inesquecíveis em família',
    initial: 'F',
    accent:   '#0891B2',
    light:    '#CFFAFE',
    dark:     '#164E63',
    rgb:      '8,145,178',
    gradient: 'linear-gradient(135deg,#0EA5E9,#0891B2)',
    sample: {
      posts: [['Reel','Aventura em família'],['Carrossel','10 atividades fim de semana'],['Reel','Acampamento kids'],['Foto','Família feliz no parque'],['Reel','Bastidores do evento'],['Carrossel','Como reservar']],
      camps: ['Captação famílias','Promoção férias','Remarketing experiências'],
    },
  },
  {
    id: 'resende',
    name: 'Resende Neto',
    desc: 'Marca pessoal · Fé & Finanças',
    initial: 'R',
    accent:   '#15803D',
    light:    '#DCFCE7',
    dark:     '#14532D',
    rgb:      '21,128,61',
    gradient: 'linear-gradient(135deg,#16A34A,#15803D)',
    sample: {
      posts: [['Reel','Como sair das dívidas'],['Carrossel','5 erros com cartão'],['Reel','Fé e finanças'],['Foto','Reflexão do dia'],['Reel','Orçamento familiar'],['Carrossel','Reserva de emergência']],
      camps: ['Seguidores - Frio','Conversão - Curso','Remarketing'],
    },
  },
];

/* ── Dicionário de tooltips para cada métrica ── */
const METRIC_TIPS = {
  followers:    'Total acumulado de seguidores da conta. A Meta Insights API fornece este dado diariamente. Quanto mais cresce, maior o alcance orgânico potencial.',
  reach:        'Número de contas únicas que viram pelo menos um conteúdo no período. Diferente de impressões — cada pessoa é contada uma só vez, mesmo vendo vários posts.',
  profile_views:'Quantidade de vezes que o perfil foi acessado. Alta visita com poucos seguidores novos indica que o perfil não está convertindo bem.',
  engagement:   'Média de (curtidas + comentários + salvamentos + compartilhamentos) ÷ alcance × 100, calculada nos posts do período. Acima de 3% é considerado excelente.',
  ads_spend:    'Valor total investido em campanhas de anúncios no Meta Ads Manager no período selecionado.',
  ads_revenue:  'Receita atribuída pelo Meta Ads às campanhas com base em conversões rastreadas pelo pixel ou API de Conversões. Pode ter defasagem de até 28 dias.',
  total_revenue:'Soma de todas as fontes: receita atribuída às campanhas pelo Meta Ads + receitas lançadas manualmente (vendas, consultorias, etc.).',
  roas:         'Return on Ad Spend — Retorno sobre Investimento em Anúncios. Fórmula: Receita Ads ÷ Investimento. ROAS 2x = cada R$ 1 gasto gerou R$ 2 de receita. Abaixo de 1x significa prejuízo.',
  cpa:          'Custo por Aquisição. Fórmula: Investimento ÷ Conversões. Indica quanto você paga em média para cada conversão. Quanto menor, mais eficiente a campanha.',
  profit:       'Receita Total menos Investimento em Ads. Estimativa simples — não inclui outros custos operacionais como equipe, ferramentas ou produção de conteúdo.',
  impressions:  'Número total de vezes que os anúncios foram exibidos, incluindo múltiplas exibições para o mesmo usuário. Sempre maior que o alcance.',
  clicks:       'Quantidade de cliques nos anúncios. Inclui cliques no link, na imagem, no perfil e outros tipos de interação com o anúncio.',
  ctr:          'Click-Through Rate (Taxa de Cliques). Fórmula: Cliques ÷ Impressões × 100. Uma CTR acima de 1% é considerada boa para a maioria dos nichos.',
  cpc:          'Custo por Clique. Fórmula: Investimento ÷ Cliques. Indica quanto você paga por cada pessoa que clicou no anúncio. Varia muito por nicho e público.',
  conversions:  'Ações de objetivo completadas após o usuário ver ou clicar no anúncio: compras, cadastros, mensagens, etc. Definidas na campanha do Meta Ads.',
  manual_rev:   'Receitas lançadas manualmente: vendas diretas, consultorias, produtos físicos ou qualquer entrada que não passe pelo rastreamento do Meta Ads.',
  video_views:  'Número total de vezes que vídeos (Reels e Stories) foram reproduzidos na conta no período. A Meta considera uma visualização a partir de 3 segundos de reprodução.',
  post_views:   'Visualizações registradas em um post ou Reel específico. Para Reels, é o dado mais importante de alcance — uma pessoa pode ver o vídeo várias vezes.',
};

/* ── Mapa de KPIs disponíveis para conectar às metas ── */
const KPI_MAP = {
  followers:   { label: 'Seguidores',            fmt: (v) => fmt(v) },
  reach:       { label: 'Alcance (período)',      fmt: (v) => fmt(v) },
  video_views: { label: 'Visualizações de vídeo', fmt: (v) => fmt(v) },
  post_views:  { label: 'Views em posts',         fmt: (v) => fmt(v) },
  engagement:  { label: 'Engajamento médio',      fmt: (v) => v.toFixed(1) + '%' },
  posts:       { label: 'Posts publicados',       fmt: (v) => fmt(v) },
  spend:       { label: 'Investimento Ads',       fmt: (v) => money(v) },
  revenue:     { label: 'Receita total',          fmt: (v) => money(v) },
  conversions: { label: 'Conversões',             fmt: (v) => fmt(v) },
  roas:        { label: 'ROAS',                   fmt: (v) => v.toFixed(2) + 'x' },
};

/* ── Estado ── */
const State = {
  tab: 'overview', range: 30, company: null,
  dateFrom: null, dateTo: null,
  igDaily: [], posts: [], ads: [], goals: [], notes: [], revenues: [],
  charts: {},
};

/* ── Utils ── */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const nf  = new Intl.NumberFormat('pt-BR');
const cf  = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt   = (n) => nf.format(Math.round(+n || 0));
const money = (n) => cf.format(+n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const esc   = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function co() { return COMPANIES.find((c) => c.id === State.company) || COMPANIES[2]; }

function applyTheme(c) {
  const r = document.documentElement.style;
  r.setProperty('--accent',       c.accent);
  r.setProperty('--accent-light', c.light);
  r.setProperty('--accent-dark',  c.dark);
  r.setProperty('--accent-rgb',   c.rgb);
}

function withinRange(dateStr) {
  if (!dateStr) return true;
  if (State.dateFrom && State.dateTo) return dateStr >= State.dateFrom && dateStr <= State.dateTo;
  if (State.range === 1) return dateStr === today();
  const d = new Date(dateStr + 'T12:00:00');
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - State.range);
  return d >= cutoff;
}

/* ── Toast ── */
function toast(msg, type = 'ok') {
  const icon  = { ok:'✓', err:'✕', warn:'!' }[type];
  const color = { ok:'#111827', err:'#DC2626', warn:'#D97706' }[type];
  const el = document.createElement('div');
  el.className = 'toast-item pointer-events-auto flex items-center gap-2.5 text-sm text-white px-4 py-3 rounded-2xl shadow-2xl';
  el.style.cssText = `background:${color};min-width:180px;max-width:320px`;
  el.innerHTML = `<span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">${icon}</span>${esc(msg)}`;
  $('#toast-root').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s,transform .3s';
    el.style.opacity = '0'; el.style.transform = 'translateX(16px)';
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

/* ── Carrega dados ── */
async function loadAll() {
  const [igDaily, posts, ads, goals, notes, revenues] = await Promise.all([
    DB.list('ig_daily'), DB.list('ig_posts'), DB.list('ads'),
    DB.list('goals'), DB.list('notes'), DB.list('revenues'),
  ]);
  Object.assign(State, { igDaily, posts, ads, goals, notes, revenues });
}

/* ── KPIs ── */
function computeKPIs() {
  const ig  = State.igDaily.filter((r) => withinRange(r.date)).sort((a, b) => a.date < b.date ? -1 : 1);
  const ps  = State.posts.filter((r) => withinRange(r.date));
  const ad  = State.ads.filter((r) => withinRange(r.date));
  const rev = State.revenues.filter((r) => withinRange(r.date));

  const followersNow   = ig.length ? +ig[ig.length - 1].followers || 0 : 0;
  const followersStart = ig.length ? +ig[0].followers || 0 : 0;
  const followersDelta = followersNow - followersStart;
  const reach        = ig.reduce((s, r) => s + (+r.reach || 0), 0);
  const profileViews = ig.reduce((s, r) => s + (+r.profile_views || 0), 0);

  let engSum = 0, engCount = 0;
  ps.forEach((p) => { const e = Insights.postEngagement(p); if (p.reach) { engSum += e; engCount++; } });
  const engRate = engCount ? engSum / engCount : 0;

  const adsSpend   = ad.reduce((s, a) => s + (+a.spend || 0), 0);
  const adsRevenue = ad.reduce((s, a) => s + (+a.revenue || 0), 0);
  const conv       = ad.reduce((s, a) => s + (+a.conversions || 0), 0);
  const clicks     = ad.reduce((s, a) => s + (+a.clicks || 0), 0);
  const impr       = ad.reduce((s, a) => s + (+a.impressions || 0), 0);
  const manualRev  = rev.reduce((s, r) => s + (+r.amount || 0), 0);
  const totalRev   = adsRevenue + manualRev;

  const roas = adsSpend > 0 ? totalRev / adsSpend : 0;
  const cpa  = conv > 0 ? adsSpend / conv : 0;
  const ctr  = impr > 0 ? (clicks / impr) * 100 : 0;
  const cpc  = clicks > 0 ? adsSpend / clicks : 0;

  return {
    followersNow, followersDelta, reach, profileViews, engRate,
    adsSpend, adsRevenue, manualRev, totalRev, conv, roas, cpa,
    postCount: ps.length, clicks, impr, ctr, cpc,
    profit: totalRev - adsSpend,
  };
}

/* ══════════════════════════════════════════════
   META API AUTO-SYNC
══════════════════════════════════════════════ */
const META_BASE = 'https://graph.facebook.com/v19.0';

async function metaGet(path, params = {}) {
  const cfg = DB.getCompanyConfig();
  const qs  = new URLSearchParams({ ...params, access_token: cfg.metaToken }).toString();
  const res = await fetch(`${META_BASE}${path}?${qs}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

async function syncInstagram(cfg) {
  const since = Math.floor((Date.now() - State.range * 24 * 3600000) / 1000);
  const until = Math.floor(Date.now() / 1000);

  // Followers total (today)
  const igUser = await metaGet(`/${cfg.igAccountId}`, { fields: 'followers_count' });

  // Daily insights
  const insights = await metaGet(`/${cfg.igAccountId}/insights`, {
    metric: 'reach,impressions,profile_views,website_clicks,video_views',
    period: 'day', since, until,
  });

  const byDate = {};
  (insights.data || []).forEach((metric) => {
    (metric.values || []).forEach((v) => {
      const d = v.end_time.slice(0, 10);
      if (!byDate[d]) byDate[d] = { date: d };
      const map = { reach: 'reach', impressions: 'impressions', profile_views: 'profile_views', website_clicks: 'website_clicks', video_views: 'video_views' };
      if (map[metric.name]) byDate[d][map[metric.name]] = v.value;
    });
  });

  const todayStr = today();
  if (!byDate[todayStr]) byDate[todayStr] = { date: todayStr };
  byDate[todayStr].followers = igUser.followers_count;

  for (const [date, row] of Object.entries(byDate)) {
    const existing = State.igDaily.find((r) => r.date === date);
    if (existing) await DB.update('ig_daily', existing.id, row);
    else await DB.insert('ig_daily', row);
  }
  return Object.keys(byDate).length;
}

async function syncAds(cfg) {
  const sinceDate = new Date(Date.now() - State.range * 24 * 3600000).toISOString().slice(0, 10);
  const untilDate = today();

  const adsData = await metaGet(`/act_${cfg.metaAdAccount}/insights`, {
    fields: 'campaign_name,spend,impressions,clicks,actions,action_values,date_start',
    time_range: JSON.stringify({ since: sinceDate, until: untilDate }),
    time_increment: 1,
    level: 'campaign',
  });

  let count = 0;
  for (const row of (adsData.data || [])) {
    const convTypes = ['purchase', 'lead', 'complete_registration', 'subscribe'];
    const convAction = (row.actions || []).find((a) => convTypes.includes(a.action_type));
    const revAction  = (row.action_values || []).find((a) => a.action_type === 'purchase');

    const record = {
      date:        row.date_start,
      campaign:    row.campaign_name,
      spend:       +(row.spend) || 0,
      impressions: +(row.impressions) || 0,
      clicks:      +(row.clicks) || 0,
      conversions: convAction ? +convAction.value : 0,
      revenue:     revAction  ? +revAction.value  : 0,
    };

    const existing = State.ads.find((a) => a.date === row.date_start && a.campaign === row.campaign_name);
    if (existing) await DB.update('ads', existing.id, record);
    else await DB.insert('ads', record);
    count++;
  }
  return count;
}

async function syncMeta(manual = true) {
  const cfg = DB.getCompanyConfig();
  if (!cfg.metaToken) { if (manual) toast('Configure o token Meta em Configurações.', 'warn'); return; }

  const btnEl = $('#sync-meta-btn');
  if (btnEl) { btnEl.textContent = 'Sincronizando…'; btnEl.disabled = true; }

  const synced = [], errors = [];

  if (cfg.igAccountId) {
    try { const n = await syncInstagram(cfg); synced.push(`IG (${n} dias)`); }
    catch (e) { errors.push('Instagram: ' + e.message); }
  }
  if (cfg.metaAdAccount) {
    try { const n = await syncAds(cfg); synced.push(`Ads (${n} registros)`); }
    catch (e) { errors.push('Ads: ' + e.message); }
  }

  await DB.setCompanyConfig({ lastSync: new Date().toISOString() });
  await loadAll();
  render();

  if (manual) {
    if (errors.length) errors.forEach((e) => toast(e, 'err'));
    else if (synced.length) toast('Sincronizado: ' + synced.join(' · '));
    else toast('Configure as credenciais da Meta em Configurações.', 'warn');
  } else if (synced.length) {
    toast('Sincronizado: ' + synced.join(' · '));
  }
}

async function autoSyncIfNeeded() {
  const cfg = DB.getCompanyConfig();
  if (!cfg.metaToken || !cfg.igAccountId) return;
  const last = cfg.lastSync ? new Date(cfg.lastSync) : null;
  const sixHoursAgo = new Date(Date.now() - 6 * 3600000);
  if (!last || last < sixHoursAgo) {
    toast('Sincronizando Meta API automaticamente…');
    await syncMeta(false);
  }
}

/* ══════════════════════════════════════════════
   SELETOR DE EMPRESA
══════════════════════════════════════════════ */
function renderSelector() {
  $('#app').innerHTML = `
  <div id="selector-bg" class="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div style="position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(8,145,178,.15) 0%,transparent 70%);top:-120px;left:-80px"></div>
      <div style="position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(21,128,61,.12) 0%,transparent 70%);bottom:-80px;right:-60px"></div>
    </div>
    <div class="relative z-10 w-full max-w-3xl">
      <div class="text-center mb-14 anim-fade-up">
        <div class="inline-flex items-center gap-2.5 mb-5">
          <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span class="text-white/60 text-sm font-medium tracking-wide">Dashboard Social</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">Qual empresa<br/>vamos analisar?</h1>
        <p class="text-white/40 text-base">Dados isolados e sincronização automática por empresa</p>
      </div>
      <div class="grid sm:grid-cols-3 gap-4">
        ${COMPANIES.map((c, i) => `
          <button onclick="selectCompany('${c.id}')" class="selector-card p-7 text-left anim-fade-up anim-d${i + 1}">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 text-white"
              style="background:${c.gradient};box-shadow:0 8px 24px rgba(${c.rgb},.4)">${c.initial}</div>
            <p class="font-bold text-lg text-white mb-1">${c.name}</p>
            <p class="text-sm text-white/50 leading-relaxed mb-6">${c.desc}</p>
            <div class="flex items-center gap-1.5 text-sm font-semibold" style="color:rgba(${c.rgb},1)">
              Entrar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </button>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
const TABS = [
  { id: 'overview',  label: 'Visão Geral',  icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
  { id: 'instagram', label: 'Instagram',    icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>' },
  { id: 'ads',       label: 'Meta Ads',     icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
  { id: 'revenue',   label: 'Receita',      icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>' },
  { id: 'goals',     label: 'Metas',        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
  { id: 'ideas',     label: 'Sugestões',    icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
  { id: 'data',      label: 'Dados',        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
  { id: 'comparative', label: 'Comparativo', icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>' },
  { id: 'settings',  label: 'Config',       icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
];

/* ══════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════ */
function render() {
  if (!State.company) { renderSelector(); return; }
  const c = co(), mode = DB.mode(), cfg = DB.getCompanyConfig();
  const hasMeta = !!(cfg.metaToken && cfg.igAccountId);
  const lastSync = cfg.lastSync ? new Date(cfg.lastSync).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : null;

  $('#app').innerHTML = `
  <header class="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center gap-4 py-3">
        <button onclick="showSelector()" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg transition-transform group-hover:scale-105"
            style="background:${c.gradient};box-shadow:0 4px 12px rgba(${c.rgb},.35)">${c.initial}</div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-bold text-gray-900 leading-none">${c.name}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">trocar empresa</p>
          </div>
        </button>
        <div class="flex-1"></div>
        <button onclick="syncAll()" id="sync-all-btn" title="${hasMeta ? `Sincronizar Meta API — última sync${lastSync ? ': ' + lastSync : ': nunca'}` : 'Atualizar dados'}"
          class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:opacity-80"
          style="border-color:${c.accent};color:${c.accent}">
          <svg id="sync-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span id="sync-label">${hasMeta ? 'Sincronizar' : 'Atualizar'}</span>
        </button>
        <div class="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full ${mode==='supabase'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}">
          <span class="w-1.5 h-1.5 rounded-full dot-live ${mode==='supabase'?'bg-emerald-500':'bg-amber-500'}"></span>
          ${mode==='supabase'?'Nuvem':'Local'}
        </div>
        <div class="flex items-center gap-0.5 border border-gray-200 rounded-xl overflow-hidden text-xs font-medium bg-white">
          ${[{v:1,l:'Hoje'},{v:7,l:'7D'},{v:30,l:'30D'},{v:90,l:'90D'},{v:3650,l:'Tudo'}].map(({v,l})=>{
            const active = !State.dateFrom && State.range===v;
            return `<button data-range="${v}" class="px-2.5 py-1.5 transition-colors ${active?'text-white':'text-gray-500 hover:bg-gray-50'}" style="${active?'background:var(--accent)':''}">${l}</button>`;
          }).join('')}
          <button id="btn-cal" title="Período personalizado" class="px-2.5 py-1.5 transition-colors ${State.dateFrom?'text-white':'text-gray-500 hover:bg-gray-50'}" style="${State.dateFrom?'background:var(--accent)':''}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </button>
        </div>
        <div id="cal-panel" class="${State.dateFrom?'flex':'hidden'} items-center gap-1.5 text-xs bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          <input type="date" id="date-from" value="${State.dateFrom||''}" class="border-0 bg-transparent text-xs text-gray-700 outline-none cursor-pointer" />
          <span class="text-gray-300">→</span>
          <input type="date" id="date-to" value="${State.dateTo||''}" class="border-0 bg-transparent text-xs text-gray-700 outline-none cursor-pointer" />
          <button onclick="applyCustomRange()" class="ml-1 px-2 py-0.5 rounded-lg text-white text-xs" style="background:var(--accent)">OK</button>
          <button onclick="clearCustomRange()" class="text-gray-400 hover:text-red-500 ml-0.5">✕</button>
        </div>
      </div>
      <nav class="flex gap-1 overflow-x-auto scrollbar-thin pb-2">
        ${TABS.map((t) => `
          <button data-tab="${t.id}" class="nav-btn ${State.tab===t.id?'active':''} flex items-center gap-1.5">
            ${t.icon}${t.label}
          </button>`).join('')}
      </nav>
    </div>
  </header>
  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1" id="view"></main>
  <footer class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between text-xs text-gray-400">
    <span>Dashboard Social · <span class="font-semibold" style="color:${c.accent}">${c.name}</span></span>
    <span>${hasMeta&&lastSync ? '⟳ Meta sync '+lastSync : 'dados '+( mode==='supabase'?'na nuvem':'locais')}</span>
  </footer>`;

  $$('[data-range]').forEach((b) => (b.onclick = () => {
    State.range = +b.dataset.range; State.dateFrom = null; State.dateTo = null; render();
  }));
  $('#btn-cal').onclick = () => {
    const p = $('#cal-panel');
    if (p.classList.contains('hidden')) { p.classList.remove('hidden'); p.classList.add('flex'); }
    else { p.classList.add('hidden'); p.classList.remove('flex'); }
  };
  $$('[data-tab]').forEach((b) => (b.onclick = () => { State.tab = b.dataset.tab; render(); }));
  renderView();
}

function renderView() {
  Object.values(State.charts).forEach((c) => { try { c.destroy(); } catch {} });
  State.charts = {};
  const fn = { overview: viewOverview, instagram: viewInstagram, ads: viewAds, revenue: viewRevenue, goals: viewGoals, ideas: viewIdeas, data: viewData, settings: viewSettings, comparative: viewComparative }[State.tab];
  const view = $('#view');
  view.innerHTML = fn();
  view.style.animation = 'none'; view.offsetHeight;
  view.style.animation = 'fadeUp .3s cubic-bezier(.22,1,.36,1) both';
  if (fn.after) fn.after();
}

/* ══════════════════════════════════════════════
   COMPONENTES
══════════════════════════════════════════════ */
function kpiCard({ label, value, sub, color = '', delay = '', tip = '' }) {
  const tipHtml = tip ? `<span class="tip-wrap"><button class="tip-icon" tabindex="-1" onclick="return false">i</button><span class="tip-pop">${tip}</span></span>` : '';
  return `<div class="card p-5 ${delay}">
    <p class="text-xs font-medium text-gray-400 mb-2 flex items-center">${label}${tipHtml}</p>
    <p class="text-2xl font-black tracking-tight ${color} kpi-num">${value}</p>
    <p class="text-xs text-gray-400 mt-1.5">${sub || '&nbsp;'}</p>
  </div>`;
}

function sectionTitle(title, action = '') {
  return `<div class="flex items-center justify-between mb-4"><h2 class="font-bold text-gray-900 text-sm">${title}</h2>${action}</div>`;
}

function emptyState(text, btn = '') {
  return `<div class="flex flex-col items-center justify-center py-14 text-gray-400">
    <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <p class="text-sm text-center max-w-[220px] leading-relaxed">${text}</p>${btn}
  </div>`;
}

function addBtn(label, onclick) {
  return `<button onclick="${onclick}" class="btn-accent">${label}</button>`;
}

function typeBadge(type) {
  const map = { Reel:'bg-pink-50 text-pink-700', Carrossel:'bg-blue-50 text-blue-700', Foto:'bg-amber-50 text-amber-700', Story:'bg-purple-50 text-purple-700' };
  return `<span class="tag ${map[type]||'bg-gray-100 text-gray-600'}">${esc(type||'—')}</span>`;
}

function gradientFill(ctx, color) {
  const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  g.addColorStop(0, color + '40'); g.addColorStop(1, color + '00');
  return g;
}

function baseChartOpts() {
  return {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, labels: { boxWidth: 8, boxHeight: 8, borderRadius: 4, font: { size: 11, family:'Inter' }, color:'#6B7280' } },
      tooltip: { backgroundColor:'#111827', titleColor:'#F9FAFB', bodyColor:'#D1D5DB', cornerRadius:12, padding:10, titleFont:{ size:11,weight:'600' }, bodyFont:{ size:11 } },
    },
    scales: {
      x: { grid:{ display:false }, border:{ display:false }, ticks:{ font:{size:10,family:'Inter'}, color:'#9CA3AF', maxRotation:0, autoSkip:true, maxTicksLimit:7 } },
      y: { grid:{ color:'#F3F4F6' }, border:{ display:false }, ticks:{ font:{size:10,family:'Inter'}, color:'#9CA3AF' }, beginAtZero:true },
    },
  };
}

/* ══════════════════════════════════════════════
   VIEW: VISÃO GERAL
══════════════════════════════════════════════ */
function viewOverview() {
  const k = computeKPIs();
  const ideas = Insights.generate({ igDaily: State.igDaily, posts: State.posts, ads: State.ads, goals: State.goals }).slice(0, 4);
  setTimeout(drawOverviewCharts, 0);

  return `
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
    ${kpiCard({ label:'Seguidores', value:fmt(k.followersNow), sub:`${k.followersDelta>=0?'+':''}${fmt(k.followersDelta)} no período`, color:'text-gradient', delay:'anim-fade-up anim-d1', tip:METRIC_TIPS.followers })}
    ${kpiCard({ label:'Alcance total', value:fmt(k.reach), sub:`${fmt(k.profileViews)} visitas ao perfil`, delay:'anim-fade-up anim-d2', tip:METRIC_TIPS.reach })}
    ${kpiCard({ label:'Engajamento médio', value:k.engRate.toFixed(1)+'%', sub:`${k.postCount} posts no período`, color:k.engRate>=3?'text-emerald-600':'', delay:'anim-fade-up anim-d3', tip:METRIC_TIPS.engagement })}
    ${kpiCard({ label:'Investimento Ads', value:money(k.adsSpend), sub:`${fmt(k.conv)} conversões`, color:'text-blue-600', delay:'anim-fade-up anim-d4', tip:METRIC_TIPS.ads_spend })}
  </div>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
    ${kpiCard({ label:'Receita Total', value:money(k.totalRev), sub:`Ads ${money(k.adsRevenue)} + Manual ${money(k.manualRev)}`, color:'text-emerald-600', delay:'anim-fade-up anim-d1', tip:METRIC_TIPS.total_revenue })}
    ${kpiCard({ label:'ROAS', value:k.roas?k.roas.toFixed(2)+'x':'—', sub:'retorno sobre investimento', color:k.roas>=2?'text-emerald-600':k.roas>0&&k.roas<1?'text-red-600':'', delay:'anim-fade-up anim-d2', tip:METRIC_TIPS.roas })}
    ${kpiCard({ label:'CPA', value:k.cpa?money(k.cpa):'—', sub:'custo por conversão', delay:'anim-fade-up anim-d3', tip:METRIC_TIPS.cpa })}
    ${kpiCard({ label:'Lucro estimado', value:money(k.profit), sub:'receita total − investimento', color:k.profit>=0?'text-emerald-600':'text-red-600', delay:'anim-fade-up anim-d4', tip:METRIC_TIPS.profit })}
  </div>
  <div class="grid lg:grid-cols-3 gap-4 mb-5">
    <div class="card p-5 lg:col-span-2 anim-fade-up anim-d1">
      ${sectionTitle('Crescimento de seguidores')}
      <div style="height:220px"><canvas id="ch-followers"></canvas></div>
    </div>
    <div class="card p-5 anim-fade-up anim-d2">
      ${sectionTitle('Invest. × Receita')}
      <div style="height:220px"><canvas id="ch-adsmix"></canvas></div>
    </div>
  </div>
  <div class="card p-5 anim-fade-up anim-d2">
    ${sectionTitle('Sugestões automáticas', `<button data-tab-jump="ideas" class="text-xs font-semibold" style="color:var(--accent)">Ver todas →</button>`)}
    <div class="grid sm:grid-cols-2 gap-2">
      ${ideas.length ? ideas.map(insightCard).join('') : emptyState('Adicione dados para ver sugestões automáticas.')}
    </div>
  </div>`;
}
viewOverview.after = () => {
  $$('[data-tab-jump]').forEach((b) => (b.onclick = () => { State.tab = b.dataset.tabJump; render(); }));
};

function insightCard(i) {
  const cfg = { good:{ bg:'bg-emerald-50', border:'border-emerald-100', title:'text-emerald-800', icon:'✅' }, warn:{ bg:'bg-amber-50', border:'border-amber-100', title:'text-amber-800', icon:'⚠️' }, bad:{ bg:'bg-red-50', border:'border-red-100', title:'text-red-800', icon:'🔻' }, tip:{ bg:'bg-blue-50', border:'border-blue-100', title:'text-blue-800', icon:'💡' } }[i.level] || { bg:'bg-gray-50', border:'border-gray-100', title:'text-gray-800', icon:'•' };
  return `<div class="${cfg.bg} border ${cfg.border} rounded-2xl p-4">
    <p class="font-bold text-sm ${cfg.title} flex items-center gap-2">${cfg.icon} ${esc(i.title)}</p>
    <p class="text-xs text-gray-600 mt-1 leading-relaxed">${esc(i.text)}</p>
  </div>`;
}

function drawOverviewCharts() {
  const c = co();
  const ig = State.igDaily.filter((r) => withinRange(r.date)).sort((a, b) => a.date < b.date ? -1 : 1);
  const fEl = $('#ch-followers');
  if (fEl) {
    const ctx = fEl.getContext('2d');
    State.charts.followers = new Chart(fEl, {
      type: 'line',
      data: { labels: ig.map((r) => r.date.slice(5)), datasets: [{ label:'Seguidores', data:ig.map((r)=>+r.followers||0), borderColor:c.accent, backgroundColor:gradientFill(ctx,c.accent), fill:true, tension:.4, pointRadius:0, pointHoverRadius:5, borderWidth:2.5 }] },
      options: baseChartOpts(),
    });
  }
  const ad = State.ads.filter((r) => withinRange(r.date));
  const byDate = {};
  ad.forEach((a) => { byDate[a.date]=byDate[a.date]||{spend:0,rev:0}; byDate[a.date].spend+=+a.spend||0; byDate[a.date].rev+=+a.revenue||0; });
  const rvByDate = {};
  State.revenues.filter((r) => withinRange(r.date)).forEach((r) => { rvByDate[r.date]=(rvByDate[r.date]||0)+(+r.amount||0); });
  const dates = [...new Set([...Object.keys(byDate), ...Object.keys(rvByDate)])].sort();
  const mEl = $('#ch-adsmix');
  if (mEl) {
    State.charts.adsmix = new Chart(mEl, {
      type: 'bar',
      data: {
        labels: dates.map((d) => d.slice(5)),
        datasets: [
          { label:'Investido',      data:dates.map((d)=>byDate[d]?.spend||0),  backgroundColor:'#60A5FA', borderRadius:6, borderSkipped:false },
          { label:'Receita Ads',    data:dates.map((d)=>byDate[d]?.rev||0),    backgroundColor:'#34D399', borderRadius:6, borderSkipped:false },
          { label:'Receita Manual', data:dates.map((d)=>rvByDate[d]||0),       backgroundColor:c.accent+'BB', borderRadius:6, borderSkipped:false },
        ],
      },
      options: baseChartOpts(),
    });
  }
}

/* ══════════════════════════════════════════════
   VIEW: INSTAGRAM
══════════════════════════════════════════════ */
function viewInstagram() {
  const ig  = State.igDaily.filter((r) => withinRange(r.date));
  const ps  = State.posts.filter((r) => withinRange(r.date)).map((p) => ({ ...p, eng:Insights.postEngagement(p) })).sort((a, b) => a.date < b.date ? 1 : -1);
  const totalVideoViews = ig.reduce((s, r) => s + (+r.video_views || 0), 0);
  const totalPostViews  = ps.reduce((s, p) => s + (+p.views || 0), 0);
  const topByViews = [...ps].sort((a, b) => (+b.views||0) - (+a.views||0)).slice(0, 1)[0];
  setTimeout(drawIgCharts, 0);

  return `
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
    ${kpiCard({ label:'Visualizações de vídeo', value:fmt(totalVideoViews), sub:'soma do período na conta', color:totalVideoViews>0?'text-violet-600':'', delay:'anim-fade-up anim-d1', tip:METRIC_TIPS.video_views })}
    ${kpiCard({ label:'Views em posts', value:fmt(totalPostViews), sub:topByViews?'melhor: '+esc((topByViews.caption||topByViews.type||'').slice(0,20)):'sem posts no período', delay:'anim-fade-up anim-d2', tip:METRIC_TIPS.post_views })}
    ${kpiCard({ label:'Alcance total', value:fmt(ig.reduce((s,r)=>s+(+r.reach||0),0)), sub:'contas únicas alcançadas', delay:'anim-fade-up anim-d3', tip:METRIC_TIPS.reach })}
    ${kpiCard({ label:'Engajamento médio', value:ps.length?(ps.reduce((s,p)=>s+p.eng,0)/ps.length).toFixed(1)+'%':'—', sub:`${ps.length} posts no período`, color:ps.length&&(ps.reduce((s,p)=>s+p.eng,0)/ps.length)>=3?'text-emerald-600':'', delay:'anim-fade-up anim-d4', tip:METRIC_TIPS.engagement })}
  </div>
  <div class="grid lg:grid-cols-3 gap-4 mb-4">
    <div class="card p-5 lg:col-span-2">${sectionTitle('Alcance diário')}<div style="height:200px"><canvas id="ch-reach"></canvas></div></div>
    <div class="card p-5">${sectionTitle('Views por post')}<div style="height:200px"><canvas id="ch-views"></canvas></div></div>
  </div>
  <div class="card p-5">
    ${sectionTitle('Posts & Reels', addBtn('+ Novo post', "openForm('post')"))}
    ${ps.length ? `<div class="overflow-x-auto scrollbar-thin -mx-1"><table class="w-full text-xs">
      <thead><tr class="text-gray-400 border-b border-gray-100">
        <th class="py-2.5 px-2 text-left font-medium">Data</th>
        <th class="py-2.5 px-2 text-left font-medium">Tipo</th>
        <th class="py-2.5 px-2 text-left font-medium">Conteúdo</th>
        <th class="py-2.5 px-2 text-right font-medium">Views</th>
        <th class="py-2.5 px-2 text-right font-medium">Alcance</th>
        <th class="py-2.5 px-2 text-right font-medium">Likes</th>
        <th class="py-2.5 px-2 text-right font-medium">Coment.</th>
        <th class="py-2.5 px-2 text-right font-medium">Salvos</th>
        <th class="py-2.5 px-2 text-right font-medium">Eng%</th>
        <th class="w-8"></th>
      </tr></thead>
      <tbody class="divide-y divide-gray-50">
        ${ps.map((p) => `<tr class="hover:bg-gray-50/80 transition-colors">
          <td class="py-2.5 px-2 text-gray-500 whitespace-nowrap">${esc(p.date||'')}</td>
          <td class="py-2.5 px-2">${typeBadge(p.type)}</td>
          <td class="py-2.5 px-2 max-w-[160px] truncate font-medium text-gray-700">${esc(p.caption||'—')}</td>
          <td class="py-2.5 px-2 text-right font-bold ${+p.views>0?'text-violet-600':'text-gray-400'}">${p.views?fmt(p.views):'—'}</td>
          <td class="py-2.5 px-2 text-right">${fmt(p.reach)}</td>
          <td class="py-2.5 px-2 text-right">${fmt(p.likes)}</td>
          <td class="py-2.5 px-2 text-right">${fmt(p.comments)}</td>
          <td class="py-2.5 px-2 text-right">${fmt(p.saves)}</td>
          <td class="py-2.5 px-2 text-right font-bold ${p.eng>=5?'text-emerald-600':p.eng>=2?'text-blue-600':'text-gray-600'}">${p.eng.toFixed(1)}%</td>
          <td class="py-2.5 px-2 text-right"><button onclick="delRow('ig_posts','${p.id}')" class="text-gray-300 hover:text-red-500">✕</button></td>
        </tr>`).join('')}
      </tbody>
    </table></div>` : emptyState('Nenhum post cadastrado.', `<button onclick="openForm('post')" class="btn-accent mt-3">Adicionar primeiro post</button>`)}
  </div>`;
}
function drawIgCharts() {
  const c  = co();
  const ig = State.igDaily.filter((r) => withinRange(r.date)).sort((a, b) => a.date < b.date ? -1 : 1);
  const ps = State.posts.filter((r) => withinRange(r.date)).sort((a, b) => a.date < b.date ? -1 : 1);

  const rEl = $('#ch-reach');
  if (rEl) {
    const ctx = rEl.getContext('2d');
    State.charts.reach = new Chart(rEl, {
      type: 'line',
      data: {
        labels: ig.map((r) => r.date.slice(5)),
        datasets: [
          { label:'Alcance', data:ig.map((r)=>+r.reach||0), borderColor:c.accent, backgroundColor:gradientFill(ctx,c.accent), fill:true, tension:.4, pointRadius:0, pointHoverRadius:5, borderWidth:2.5 },
          { label:'Visualizações', data:ig.map((r)=>+r.video_views||0), borderColor:'#7C3AED', backgroundColor:'transparent', tension:.4, pointRadius:0, pointHoverRadius:5, borderWidth:2, borderDash:[4,3] },
        ],
      },
      options: baseChartOpts(),
    });
  }

  const vEl = $('#ch-views');
  if (vEl) {
    const hasViews = ps.some((p) => +p.views > 0);
    State.charts.views = new Chart(vEl, {
      type: 'bar',
      data: {
        labels: ps.map((p) => (p.caption || p.type || '').slice(0, 10)),
        datasets: hasViews
          ? [{ label:'Views', data:ps.map((p)=>+p.views||0), backgroundColor:'#7C3AED99', borderRadius:6, borderSkipped:false }]
          : [{ label:'Eng %', data:ps.map((p)=>+Insights.postEngagement(p).toFixed(1)), backgroundColor:c.accent+'CC', borderRadius:6, borderSkipped:false }],
      },
      options: baseChartOpts(),
    });
  }
}

/* ══════════════════════════════════════════════
   VIEW: META ADS
══════════════════════════════════════════════ */
function viewAds() {
  const ad = State.ads.filter((r) => withinRange(r.date)).sort((a, b) => a.date < b.date ? 1 : -1);
  const spend=ad.reduce((s,a)=>s+(+a.spend||0),0), revenue=ad.reduce((s,a)=>s+(+a.revenue||0),0),
        conv=ad.reduce((s,a)=>s+(+a.conversions||0),0), clicks=ad.reduce((s,a)=>s+(+a.clicks||0),0),
        impr=ad.reduce((s,a)=>s+(+a.impressions||0),0);
  const roas=spend>0?revenue/spend:0, ctr=impr>0?(clicks/impr)*100:0, cpc=clicks>0?spend/clicks:0, cpa=conv>0?spend/conv:0;
  const c = co();

  // Agrupa por campanha
  const byCamp = {};
  ad.forEach((a) => {
    const k = a.campaign || 'Sem nome';
    if (!byCamp[k]) byCamp[k] = { campaign:k, spend:0, revenue:0, conv:0, clicks:0, impressions:0, days:0 };
    byCamp[k].spend       += +a.spend       || 0;
    byCamp[k].revenue     += +a.revenue     || 0;
    byCamp[k].conv        += +a.conversions || 0;
    byCamp[k].clicks      += +a.clicks      || 0;
    byCamp[k].impressions += +a.impressions || 0;
    byCamp[k].days++;
  });
  const camps = Object.values(byCamp).sort((a, b) => b.spend - a.spend);
  const maxSpend = camps.length ? camps[0].spend : 1;

  return `
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
    ${kpiCard({ label:'Investimento', value:money(spend), sub:'no período', color:'text-blue-600', delay:'anim-fade-up anim-d1', tip:METRIC_TIPS.ads_spend })}
    ${kpiCard({ label:'Receita Ads', value:money(revenue), sub:'atribuída diretamente', color:'text-emerald-600', delay:'anim-fade-up anim-d2', tip:METRIC_TIPS.ads_revenue })}
    ${kpiCard({ label:'ROAS', value:roas?roas.toFixed(2)+'x':'—', sub:'retorno', color:roas>=2?'text-emerald-600':roas>0&&roas<1?'text-red-600':'', delay:'anim-fade-up anim-d3', tip:METRIC_TIPS.roas })}
    ${kpiCard({ label:'Conversões', value:fmt(conv), sub:cpa?'CPA '+money(cpa):'', delay:'anim-fade-up anim-d4', tip:METRIC_TIPS.conversions })}
  </div>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
    ${kpiCard({ label:'Impressões', value:fmt(impr), delay:'anim-fade-up anim-d1', tip:METRIC_TIPS.impressions })}
    ${kpiCard({ label:'Cliques', value:fmt(clicks), delay:'anim-fade-up anim-d2', tip:METRIC_TIPS.clicks })}
    ${kpiCard({ label:'CTR', value:ctr?ctr.toFixed(2)+'%':'—', color:ctr>0&&ctr<1?'text-amber-600':'', delay:'anim-fade-up anim-d3', tip:METRIC_TIPS.ctr })}
    ${kpiCard({ label:'CPC', value:cpc?money(cpc):'—', sub:'custo por clique', delay:'anim-fade-up anim-d4', tip:METRIC_TIPS.cpc })}
  </div>

  ${camps.length ? `
  <div class="card p-5 mb-4">
    ${sectionTitle('Desempenho por campanha')}
    <div class="space-y-3">
      ${camps.map((camp) => {
        const cr = camp.spend>0 ? camp.revenue/camp.spend : 0;
        const cctr = camp.impressions>0 ? (camp.clicks/camp.impressions)*100 : 0;
        const ccpa = camp.conv>0 ? camp.spend/camp.conv : 0;
        const barW = Math.round((camp.spend/maxSpend)*100);
        const roasColor = cr>=2?'text-emerald-600':cr>0&&cr<1?'text-red-500':'text-gray-700';
        return `<div class="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
          <div class="flex items-start justify-between gap-3 mb-2.5">
            <p class="text-sm font-semibold text-gray-900 leading-tight">${esc(camp.campaign)}</p>
            <span class="text-xs font-bold ${roasColor} shrink-0">${cr?'ROAS '+cr.toFixed(2)+'x':'Sem receita'}</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-1.5 mb-3">
            <div class="h-1.5 rounded-full transition-all" style="width:${barW}%;background:var(--accent)"></div>
          </div>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div><p class="text-[10px] text-gray-400 mb-0.5">Invest.</p><p class="text-xs font-bold text-blue-700">${money(camp.spend)}</p></div>
            <div><p class="text-[10px] text-gray-400 mb-0.5">Receita</p><p class="text-xs font-bold text-emerald-700">${money(camp.revenue)}</p></div>
            <div><p class="text-[10px] text-gray-400 mb-0.5">Conv.</p><p class="text-xs font-semibold text-gray-700">${fmt(camp.conv)}${ccpa?'<span class="text-[9px] text-gray-400 font-normal block">'+money(ccpa)+'/conv</span>':''}</p></div>
            <div><p class="text-[10px] text-gray-400 mb-0.5">CTR</p><p class="text-xs font-semibold text-gray-700">${cctr?cctr.toFixed(2)+'%':'—'}</p></div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  <div class="card p-5">
    ${sectionTitle('Histórico diário', addBtn('+ Nova entrada', "openForm('ad')"))}
    ${ad.length ? `<div class="overflow-x-auto scrollbar-thin -mx-1"><table class="w-full text-xs">
      <thead><tr class="text-gray-400 border-b border-gray-100">
        <th class="py-2.5 px-2 text-left font-medium">Data</th><th class="py-2.5 px-2 text-left font-medium">Campanha</th>
        <th class="py-2.5 px-2 text-right font-medium">Invest.</th><th class="py-2.5 px-2 text-right font-medium">Impr.</th>
        <th class="py-2.5 px-2 text-right font-medium">Cliques</th><th class="py-2.5 px-2 text-right font-medium">Conv.</th>
        <th class="py-2.5 px-2 text-right font-medium">Receita</th><th class="py-2.5 px-2 text-right font-medium">ROAS</th><th class="w-8"></th>
      </tr></thead>
      <tbody class="divide-y divide-gray-50">
        ${ad.map((a) => { const r=(+a.spend>0)?(+a.revenue||0)/+a.spend:0; return `<tr class="hover:bg-gray-50/80 transition-colors">
          <td class="py-2.5 px-2 text-gray-500 whitespace-nowrap">${esc(a.date||'')}</td>
          <td class="py-2.5 px-2 font-medium text-gray-800">${esc(a.campaign||'—')}</td>
          <td class="py-2.5 px-2 text-right text-blue-700 font-semibold">${money(a.spend)}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(a.impressions)}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(a.clicks)}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(a.conversions)}</td>
          <td class="py-2.5 px-2 text-right text-emerald-700 font-semibold">${money(a.revenue)}</td>
          <td class="py-2.5 px-2 text-right font-bold ${r>=2?'text-emerald-600':r>0&&r<1?'text-red-600':'text-gray-700'}">${r?r.toFixed(2)+'x':'—'}</td>
          <td class="py-2.5 px-2 text-right"><button onclick="delRow('ads','${a.id}')" class="text-gray-300 hover:text-red-500">✕</button></td>
        </tr>`; }).join('')}
      </tbody>
    </table></div>` : emptyState('Nenhuma entrada cadastrada.', `<button onclick="openForm('ad')" class="btn-accent mt-3">Adicionar entrada</button>`)}
  </div>`;
}

/* ══════════════════════════════════════════════
   VIEW: RECEITA MANUAL
══════════════════════════════════════════════ */
function viewRevenue() {
  const rev = State.revenues.filter((r) => withinRange(r.date)).sort((a, b) => a.date < b.date ? 1 : -1);
  const total = rev.reduce((s, r) => s + (+r.amount || 0), 0);
  const adsTotal = State.ads.filter((r) => withinRange(r.date)).reduce((s, a) => s + (+a.revenue || 0), 0);
  const c = co();

  // Agrupar por fonte
  const bySource = {};
  rev.forEach((r) => { bySource[r.source||'Outros'] = (bySource[r.source||'Outros']||0) + (+r.amount||0); });
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  setTimeout(() => {
    const el = $('#ch-revenue-pie');
    if (el && sources.length) {
      State.charts.revpie = new Chart(el, {
        type: 'doughnut',
        data: { labels: sources.map((s) => s[0]), datasets: [{ data: sources.map((s) => s[1]), backgroundColor: [c.accent, c.accent+'AA', c.accent+'66', '#60A5FA', '#34D399', '#F59E0B'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, boxHeight:10, borderRadius:3, font:{size:11,family:'Inter'}, color:'#6B7280', padding:12 } }, tooltip:{ backgroundColor:'#111827', cornerRadius:12, padding:10, callbacks:{ label: (ctx) => ' '+money(ctx.parsed) } } }, cutout:'62%' },
      });
    }
  }, 0);

  return `
  <!-- KPIs -->
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
    ${kpiCard({ label:'Receita Manual', value:money(total), sub:`${rev.length} lançamentos no período`, color:'text-emerald-600', delay:'anim-fade-up anim-d1', tip:METRIC_TIPS.manual_rev })}
    ${kpiCard({ label:'Receita via Ads', value:money(adsTotal), sub:'atribuída às campanhas', color:'text-blue-600', delay:'anim-fade-up anim-d2', tip:METRIC_TIPS.ads_revenue })}
    ${kpiCard({ label:'Receita Total', value:money(total+adsTotal), sub:'manual + atribuída', color:'text-gradient', delay:'anim-fade-up anim-d3', tip:METRIC_TIPS.total_revenue })}
  </div>

  <div class="grid lg:grid-cols-3 gap-4 mb-5">
    <!-- Lista de lançamentos -->
    <div class="card p-5 lg:col-span-2">
      ${sectionTitle('Lançamentos de receita', addBtn('+ Registrar receita', "openForm('revenue')"))}
      ${rev.length ? `<div class="overflow-x-auto scrollbar-thin -mx-1"><table class="w-full text-xs">
        <thead><tr class="text-gray-400 border-b border-gray-100">
          <th class="py-2.5 px-2 text-left font-medium">Data</th>
          <th class="py-2.5 px-2 text-left font-medium">Fonte</th>
          <th class="py-2.5 px-2 text-left font-medium">Campanha</th>
          <th class="py-2.5 px-2 text-left font-medium">Descrição</th>
          <th class="py-2.5 px-2 text-right font-medium">Valor</th>
          <th class="w-8"></th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
          ${rev.map((r) => `<tr class="hover:bg-gray-50/80 transition-colors">
            <td class="py-2.5 px-2 text-gray-500 whitespace-nowrap">${esc(r.date||'')}</td>
            <td class="py-2.5 px-2"><span class="tag bg-emerald-50 text-emerald-700">${esc(r.source||'Outros')}</span></td>
            <td class="py-2.5 px-2 text-gray-500 text-[11px]">${r.campaign?`<span class="tag bg-blue-50 text-blue-700">${esc(r.campaign)}</span>`:'—'}</td>
            <td class="py-2.5 px-2 text-gray-600 max-w-[200px] truncate">${esc(r.description||'—')}</td>
            <td class="py-2.5 px-2 text-right font-bold text-emerald-700">${money(r.amount)}</td>
            <td class="py-2.5 px-2 text-right"><button onclick="delRow('revenues','${r.id}')" class="text-gray-300 hover:text-red-500">✕</button></td>
          </tr>`).join('')}
        </tbody>
      </table></div>` : emptyState('Nenhuma receita lançada neste período.', `<button onclick="openForm('revenue')" class="btn-accent mt-3">Registrar primeira receita</button>`)}
    </div>

    <!-- Gráfico por fonte -->
    <div class="card p-5">
      ${sectionTitle('Por fonte')}
      ${sources.length ? `
      <div style="height:180px" class="mb-4"><canvas id="ch-revenue-pie"></canvas></div>
      <div class="space-y-2">
        ${sources.map(([src, val]) => `
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-600 font-medium truncate">${esc(src)}</span>
          <span class="font-bold text-gray-900 ml-2">${money(val)}</span>
        </div>`).join('')}
      </div>` : emptyState('Adicione receitas para ver a distribuição.')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   KPI HELPERS — usados pelas metas conectadas
══════════════════════════════════════════════ */
function getKpiValue(kpiKey) {
  const ig = State.igDaily.filter((r) => withinRange(r.date));
  const ps = State.posts.filter((r) => withinRange(r.date));
  const ad = State.ads.filter((r) => withinRange(r.date));
  const rv = State.revenues.filter((r) => withinRange(r.date));
  switch (kpiKey) {
    case 'followers':   return ig.length ? Math.max(...ig.map((r) => +r.followers || 0)) : 0;
    case 'reach':       return ig.reduce((s, r) => s + (+r.reach || 0), 0);
    case 'video_views': return ig.reduce((s, r) => s + (+r.video_views || 0), 0);
    case 'post_views':  return ps.reduce((s, p) => s + (+p.views || 0), 0);
    case 'engagement':  return ps.length ? ps.reduce((s, p) => s + Insights.postEngagement(p), 0) / ps.length : 0;
    case 'posts':       return ps.length;
    case 'spend':       return ad.reduce((s, a) => s + (+a.spend || 0), 0);
    case 'revenue':     return ad.reduce((s, a) => s + (+a.revenue || 0), 0) + rv.reduce((s, r) => s + (+r.amount || 0), 0);
    case 'conversions': return ad.reduce((s, a) => s + (+a.conversions || 0), 0);
    case 'roas': {
      const sp = ad.reduce((s, a) => s + (+a.spend || 0), 0);
      const r2 = ad.reduce((s, a) => s + (+a.revenue || 0), 0) + rv.reduce((s, r) => s + (+r.amount || 0), 0);
      return sp > 0 ? r2 / sp : 0;
    }
    default: return 0;
  }
}
function goalSuggestion(kpiKey, cur, target) {
  const rem = target - cur;
  const suggestions = {
    followers:   `Faltam ${fmt(rem)} seguidores. Publique Reels diários e responda todos os comentários para aumentar o alcance orgânico.`,
    reach:       `Faltam ${fmt(rem)} de alcance. Aumente frequência de posts e use hashtags estratégicas nos Reels.`,
    video_views: `Faltam ${fmt(rem)} visualizações. Crie hooks nos primeiros 3 segundos — isso reduz a taxa de saída e aumenta a distribuição.`,
    post_views:  `Faltam ${fmt(rem)} views nos posts. Reels têm até 3× mais views que fotos; experimente esse formato.`,
    engagement:  `Taxa ${(target - cur).toFixed(1)}pp abaixo. Faça perguntas nos posts, use enquetes nos Stories e responda comentários.`,
    posts:       `Faltam ${fmt(rem)} posts. Monte um calendário editorial para manter consistência.`,
    spend:       `Orçamento com ${money(rem)} disponível. Considere escalar campanhas com ROAS acima de 2×.`,
    revenue:     `Faltam ${money(rem)} para a meta. Teste novos criativos de conversão e otimize o público.`,
    conversions: `Faltam ${fmt(rem)} conversões. Revise públicos-alvo e tempo de carregamento da landing page.`,
    roas:        `ROAS ${(target - cur).toFixed(2)}x abaixo da meta. Pause criativos com CTR baixo e redistribua o orçamento.`,
  };
  return suggestions[kpiKey] || `${Math.round((1 - cur / target) * 100)}% restante para a meta.`;
}

/* ══════════════════════════════════════════════
   VIEW: METAS
══════════════════════════════════════════════ */
function viewGoals() {
  const hasKpi = State.goals.some((g) => g.kpiKey);
  const achieved = State.goals.filter((g) => { const t=+g.target||0; const c=g.kpiKey?getKpiValue(g.kpiKey):(+g.current_val||0); return t>0&&c>=t; });
  return `
  ${achieved.length ? `<div class="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-4 flex items-center gap-3">
    <span class="text-2xl">🎉</span>
    <div><p class="font-bold text-sm text-emerald-800">${achieved.length === 1 ? `Meta "${esc(achieved[0].name)}" alcançada!` : `${achieved.length} metas alcançadas!`}</p>
    <p class="text-xs text-emerald-600 mt-0.5">Continue assim — o crescimento é resultado de consistência.</p></div>
  </div>` : ''}
  <div class="card p-5">
    ${sectionTitle('Metas', addBtn('+ Nova meta', "openForm('goal')"))}
    ${hasKpi ? `<p class="text-xs text-gray-400 mb-4">Metas com <span class="text-violet-500 font-semibold">● ao vivo</span> são atualizadas automaticamente com os dados do período selecionado.</p>` : ''}
    ${State.goals.length
      ? `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${State.goals.map(goalCard).join('')}</div>`
      : emptyState('Defina metas para acompanhar o progresso.', `<button onclick="openForm('goal')" class="btn-accent mt-3">Criar primeira meta</button>`)}
  </div>`;
}
function goalCard(g) {
  const c = co();
  const hasKpi = !!g.kpiKey;
  const kpiDef = hasKpi ? KPI_MAP[g.kpiKey] : null;
  const cur = hasKpi ? getKpiValue(g.kpiKey) : (+g.current_val || 0);
  const target = +g.target || 0;
  const ratio = target > 0 ? clamp(cur / target, 0, 1) : 0;
  const pct = Math.round(ratio * 100);
  const achieved = target > 0 && cur >= target;
  const barColor = achieved ? '#10B981' : ratio >= .7 ? c.accent : ratio >= .4 ? '#F59E0B' : '#EF4444';
  const dispVal = kpiDef ? kpiDef.fmt(cur) : fmt(cur);
  const dispTgt = kpiDef ? kpiDef.fmt(target) : fmt(target);
  return `<div class="border ${achieved ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-100'} rounded-2xl p-4 hover:shadow-md transition-all">
    <div class="flex items-start justify-between mb-2">
      <div class="min-w-0 flex-1 pr-2">
        <p class="font-bold text-sm text-gray-900 truncate">${esc(g.name)}</p>
        <p class="text-[11px] text-gray-400 mt-0.5">${esc(g.period || 'meta')}${kpiDef ? ` · <span class="text-violet-500 font-semibold">${kpiDef.label}</span>` : ''}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        ${hasKpi ? `<span class="text-[10px] text-violet-500 font-bold">● ao vivo</span>` : ''}
        <button onclick="delRow('goals','${g.id}')" class="text-gray-200 hover:text-red-500 text-sm">✕</button>
      </div>
    </div>
    ${achieved ? `<div class="bg-emerald-100 text-emerald-700 rounded-xl px-3 py-1.5 text-xs font-bold text-center mb-3">🎉 Meta alcançada!</div>` : ''}
    <div class="flex items-baseline justify-between mb-1.5">
      <span class="text-2xl font-black" style="color:${barColor}">${dispVal}</span>
      <span class="text-xs text-gray-400 font-medium">de ${dispTgt}</span>
    </div>
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
      <div class="h-full rounded-full prog-bar" style="width:${pct}%;background:linear-gradient(90deg,${barColor},${barColor}AA)"></div>
    </div>
    <div class="flex items-center justify-between ${!achieved && hasKpi ? 'mb-3' : ''}">
      <span class="text-xs font-bold" style="color:${barColor}">${pct}% concluído</span>
      ${!hasKpi ? `<button onclick="openForm('goal','${g.id}')" class="text-xs font-semibold" style="color:var(--accent)">Atualizar →</button>` : ''}
    </div>
    ${!achieved && hasKpi && target > 0 ? `<div class="border-t border-gray-100 pt-2.5">
      <p class="text-[11px] text-gray-500 leading-relaxed">💡 ${goalSuggestion(g.kpiKey, cur, target)}</p>
    </div>` : ''}
  </div>`;
}

/* ══════════════════════════════════════════════
   VIEW: SUGESTÕES
══════════════════════════════════════════════ */
function viewIdeas() {
  const ideas = Insights.generate({ igDaily: State.igDaily, posts: State.posts, ads: State.ads, goals: State.goals });
  const notes = State.notes.sort((a, b) => a.created_at < b.created_at ? 1 : -1);
  return `<div class="grid lg:grid-cols-2 gap-4">
    <div class="card p-5">
      ${sectionTitle('Sugestões automáticas')}
      <div class="space-y-2">${ideas.length ? ideas.map(insightCard).join('') : emptyState('Adicione dados para ver sugestões.')}</div>
    </div>
    <div class="card p-5">
      ${sectionTitle('Anotações & insights', addBtn('+ Anotar', "openForm('note')"))}
      ${notes.length ? `<div class="space-y-2">${notes.map((n) => `
        <div class="border border-gray-100 rounded-2xl p-3.5 flex gap-3 hover:border-gray-200 transition-colors">
          <span class="text-xl leading-none mt-0.5">${esc(n.icon||'📝')}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm text-gray-900">${esc(n.title)}</p>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed whitespace-pre-wrap">${esc(n.body||'')}</p>
          </div>
          <button onclick="delRow('notes','${n.id}')" class="text-gray-200 hover:text-red-500 text-sm self-start">✕</button>
        </div>`).join('')}</div>`
        : emptyState('Guarde ideias de conteúdo, briefings, aprendizados...')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   VIEW: DADOS
══════════════════════════════════════════════ */
function viewData() {
  const ig = State.igDaily.sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 14);
  const quickCards = [
    { icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>', label:'Métrica diária IG', desc:'Seguidores, alcance, visitas', form:'daily', color:'text-blue-600 bg-blue-50' },
    { icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>', label:'Post / Reel', desc:'Likes, comentários, salvos', form:'post', color:'text-pink-600 bg-pink-50' },
    { icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', label:'Campanha de Ads', desc:'Investimento, conversões', form:'ad', color:'text-sky-600 bg-sky-50' },
    { icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>', label:'Receita Manual', desc:'Vendas, consultoria, outros', form:'revenue', color:'text-emerald-600 bg-emerald-50' },
    { icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', label:'Meta', desc:'Objetivo + progresso', form:'goal', color:'text-violet-600 bg-violet-50' },
    { icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', label:'Anotação', desc:'Ideias, briefings, insights', form:'note', color:'text-amber-600 bg-amber-50' },
  ];
  return `
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
    ${quickCards.map((q) => `<button onclick="openForm('${q.form}')" class="card p-4 text-left hover:shadow-lg transition-all duration-200 group">
      <div class="w-10 h-10 rounded-xl ${q.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-105">${q.icon}</div>
      <p class="font-bold text-sm text-gray-900">${q.label}</p>
      <p class="text-xs text-gray-400 mt-0.5">${q.desc}</p>
    </button>`).join('')}
  </div>
  <div class="card p-5 mb-5">
    ${sectionTitle('Gerenciar dados · ' + co().name, `<button onclick="wipeData()" class="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl transition-colors">Apagar tudo</button>`)}
    <p class="text-xs text-gray-400 mb-4">Apague dados de uma categoria específica ou exporte para fazer backup antes.</p>
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
      ${[
        { col:'ig_daily',  label:'Métricas diárias IG', count:State.igDaily.length,  color:'text-blue-600 border-blue-100 hover:border-blue-300' },
        { col:'ig_posts',  label:'Posts / Reels',       count:State.posts.length,    color:'text-pink-600 border-pink-100 hover:border-pink-300' },
        { col:'ads',       label:'Dados de Ads',        count:State.ads.length,      color:'text-sky-600 border-sky-100 hover:border-sky-300' },
        { col:'revenues',  label:'Receitas manuais',    count:State.revenues.length, color:'text-emerald-600 border-emerald-100 hover:border-emerald-300' },
        { col:'goals',     label:'Metas',               count:State.goals.length,    color:'text-violet-600 border-violet-100 hover:border-violet-300' },
        { col:'notes',     label:'Anotações',           count:State.notes.length,    color:'text-amber-600 border-amber-100 hover:border-amber-300' },
      ].map((item) => `
        <div class="border ${item.color} rounded-xl p-3 transition-colors">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold text-gray-800">${item.label}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">${fmt(item.count)} registro${item.count !== 1 ? 's' : ''}</p>
            </div>
            <button onclick="clearCollection('${item.col}')" class="text-[10px] text-red-400 hover:text-red-600 font-semibold mt-0.5 whitespace-nowrap">Limpar</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="card p-5">
    ${sectionTitle('Histórico · Métricas diárias Instagram')}
    ${ig.length ? `<div class="overflow-x-auto scrollbar-thin -mx-1"><table class="w-full text-xs">
      <thead><tr class="text-gray-400 border-b border-gray-100">
        <th class="py-2.5 px-2 text-left font-medium">Data</th>
        <th class="py-2.5 px-2 text-right font-medium">Seguidores</th>
        <th class="py-2.5 px-2 text-right font-medium">Alcance</th>
        <th class="py-2.5 px-2 text-right font-medium">Impressões</th>
        <th class="py-2.5 px-2 text-right font-medium">Visualizações</th>
        <th class="py-2.5 px-2 text-right font-medium">Visitas perfil</th>
        <th class="py-2.5 px-2 text-right font-medium">Cliques site</th>
        <th class="w-8"></th>
      </tr></thead>
      <tbody class="divide-y divide-gray-50">
        ${ig.map((r) => `<tr class="hover:bg-gray-50/80 transition-colors">
          <td class="py-2.5 px-2 text-gray-500 whitespace-nowrap">${esc(r.date)}</td>
          <td class="py-2.5 px-2 text-right font-bold text-gray-900">${fmt(r.followers)}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(r.reach)}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(r.impressions)}</td>
          <td class="py-2.5 px-2 text-right font-semibold text-violet-600">${r.video_views?fmt(r.video_views):'—'}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(r.profile_views)}</td>
          <td class="py-2.5 px-2 text-right text-gray-600">${fmt(r.website_clicks)}</td>
          <td class="py-2.5 px-2 text-right"><button onclick="delRow('ig_daily','${r.id}')" class="text-gray-300 hover:text-red-500">✕</button></td>
        </tr>`).join('')}
      </tbody>
    </table></div>` : emptyState('Comece registrando a métrica de hoje.', `<button onclick="openForm('daily')" class="btn-accent mt-3">Registrar métrica diária</button>`)}
  </div>`;
}

/* ══════════════════════════════════════════════
   VIEW: CONFIGURAÇÕES
══════════════════════════════════════════════ */
function viewSettings() {
  const cfg = DB.getCompanyConfig(), globalCfg = DB.getConfig(), c = co(), mode = DB.mode();
  const lastSync = cfg.lastSync ? new Date(cfg.lastSync).toLocaleString('pt-BR') : 'Nunca';
  return `
  <div class="grid lg:grid-cols-2 gap-4">
    <!-- Supabase -->
    <div class="card p-5">
      <div class="flex items-center gap-3 p-3 rounded-xl mb-5" style="background:${c.light}">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style="background:${c.gradient}">${c.initial}</div>
        <div>
          <p class="font-bold text-sm text-gray-900">${c.name}</p>
          <button onclick="showSelector()" class="text-xs font-medium" style="color:${c.accent}">⇄ Trocar empresa</button>
        </div>
      </div>
      ${sectionTitle('Armazenamento · Supabase')}
      <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-4">
        <span class="w-2 h-2 rounded-full bg-emerald-500 dot-live shrink-0"></span>
        <p class="text-xs text-emerald-700 font-medium">Banco de dados na nuvem ativo — dados sincronizados em qualquer PC ou dispositivo.</p>
      </div>
      <p class="text-xs text-gray-400 mb-3">Opcional: use credenciais próprias do Supabase para ter seu próprio banco isolado.</p>
      <label class="block text-xs font-semibold text-gray-600 mb-1">Supabase URL (opcional)</label>
      <input id="cfg-url" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 bg-gray-50" placeholder="https://xxxx.supabase.co" value="${esc(globalCfg.supabaseUrl||'')}" />
      <label class="block text-xs font-semibold text-gray-600 mb-1">Supabase Key (opcional)</label>
      <input id="cfg-key" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 bg-gray-50" placeholder="eyJ..." value="${esc(globalCfg.supabaseKey||'')}" />
      <button onclick="saveConfig()" class="btn-accent w-full py-2.5 text-center">Salvar conexão personalizada</button>
    </div>

    <!-- Meta API -->
    <div class="space-y-4">
      <div class="card p-5">
        ${sectionTitle(`Integração automática · Meta API <span class="text-[10px] font-normal px-2 py-0.5 rounded-full ml-1" style="background:${c.light};color:${c.accent}">${c.name}</span>`)}
        <p class="text-xs text-gray-500 mb-4 leading-relaxed">Credenciais exclusivas para <strong>${c.name}</strong>. Cada empresa tem sua própria conta Meta — configure aqui e o dashboard sincroniza a cada 6 horas.</p>

        <label class="block text-xs font-semibold text-gray-600 mb-1">Access Token da Meta</label>
        <input id="cfg-meta-token" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 bg-gray-50 font-mono" placeholder="EAAxxxxxxxxx..." value="${esc(cfg.metaToken||'')}" />

        <label class="block text-xs font-semibold text-gray-600 mb-1">Instagram Account ID</label>
        <input id="cfg-ig-id" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 bg-gray-50 font-mono" placeholder="17841400000000000" value="${esc(cfg.igAccountId||'')}" />

        <label class="block text-xs font-semibold text-gray-600 mb-1">Ad Account ID</label>
        <input id="cfg-ad-account" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-1 bg-gray-50 font-mono" placeholder="123456789" value="${esc(cfg.metaAdAccount||'')}" />
        <p class="text-[10px] text-gray-400 mb-4">Sem o "act_" — somente os números</p>

        <div class="flex gap-2">
          <button onclick="saveMetaConfig()" class="btn-accent flex-1 py-2.5 text-center">Salvar credenciais</button>
          <button id="sync-meta-btn" onclick="syncMeta()" class="text-sm px-4 py-2.5 rounded-xl border font-semibold transition-all hover:opacity-80" style="border-color:${c.accent};color:${c.accent}">
            ⟳ Sincronizar agora
          </button>
        </div>
        <p class="text-[10px] text-gray-400 mt-2">Última sincronização: ${lastSync}</p>
      </div>

      <!-- Backup -->
      <div class="card p-5">
        ${sectionTitle('Backup de dados · ' + c.name)}
        <div class="grid grid-cols-2 gap-2">
          <button onclick="exportData()" class="text-xs py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium">↓ Exportar JSON</button>
          <label class="text-xs py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium cursor-pointer text-center">↑ Importar JSON<input type="file" accept="application/json" class="hidden" onchange="importData(event)" /></label>
          <button onclick="loadSample()" class="text-xs py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium">Carregar exemplo</button>
          <button onclick="wipeData()" class="text-xs py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium">Apagar tudo</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   VIEW: COMPARATIVO HISTÓRICO
══════════════════════════════════════════════ */
function viewComparative() {
  const compCfg = JSON.parse(localStorage.getItem('dsr.comparative') || '{}');
  const now = new Date();
  const isoDay = (d) => d.toISOString().slice(0, 10);
  const defAFrom = isoDay(new Date(now - 30 * 864e5));
  const defATo   = isoDay(now);
  const defBFrom = isoDay(new Date(now - 60 * 864e5));
  const defBTo   = isoDay(new Date(now - 31 * 864e5));

  const aFrom = compCfg.aFrom || defAFrom, aTo = compCfg.aTo || defATo;
  const bFrom = compCfg.bFrom || defBFrom, bTo = compCfg.bTo || defBTo;

  function inP(d, f, t) { return d >= f && d <= t; }

  function periodKPIs(f, t) {
    const ig = State.igDaily.filter((r) => inP(r.date, f, t));
    const ps = State.posts.filter((r) => inP(r.date, f, t));
    const ad = State.ads.filter((r) => inP(r.date, f, t));
    const rv = State.revenues.filter((r) => inP(r.date, f, t));
    const followers    = ig.length ? Math.max(...ig.map((r) => +r.followers || 0)) : 0;
    const reach        = ig.reduce((s, r) => s + (+r.reach || 0), 0);
    const profileViews = ig.reduce((s, r) => s + (+r.profile_views || 0), 0);
    const videoViews   = ig.reduce((s, r) => s + (+r.video_views || 0), 0);
    const postViews    = ps.reduce((s, p) => s + (+p.views || 0), 0);
    const engRate      = ps.length ? ps.reduce((s, p) => s + Insights.postEngagement(p), 0) / ps.length : 0;
    const spend        = ad.reduce((s, a) => s + (+a.spend || 0), 0);
    const adsRevenue   = ad.reduce((s, a) => s + (+a.revenue || 0), 0);
    const conv         = ad.reduce((s, a) => s + (+a.conversions || 0), 0);
    const clicks       = ad.reduce((s, a) => s + (+a.clicks || 0), 0);
    const impr         = ad.reduce((s, a) => s + (+a.impressions || 0), 0);
    const manualRev    = rv.reduce((s, r) => s + (+r.amount || 0), 0);
    const totalRev     = adsRevenue + manualRev;
    const roas         = spend > 0 ? adsRevenue / spend : 0;
    const cpa          = conv > 0 ? spend / conv : 0;
    const ctr          = impr > 0 ? (clicks / impr) * 100 : 0;
    return { followers, reach, profileViews, videoViews, postViews, engRate, postCount:ps.length, spend, adsRevenue, conv, clicks, impr, manualRev, totalRev, roas, cpa, ctr, profit:totalRev - spend };
  }

  const A = periodKPIs(aFrom, aTo), B = periodKPIs(bFrom, bTo);

  function delta(va, vb) {
    if (vb === 0 && va === 0) return '—';
    if (vb === 0) return va > 0 ? '▲ novo' : '—';
    const p = ((va - vb) / Math.abs(vb)) * 100;
    return (p >= 0 ? '▲ +' : '▼ ') + p.toFixed(1) + '%';
  }
  function dCls(va, vb, inv = false) {
    if (va === vb) return 'text-gray-400';
    return (inv ? va < vb : va > vb) ? 'text-emerald-600' : 'text-red-500';
  }

  function tip(key) {
    return key ? `<span class="tip-wrap"><button class="tip-icon" onclick="return false">i</button><span class="tip-pop">${METRIC_TIPS[key]||''}</span></span>` : '';
  }

  const rows = [
    { l:'Seguidores',        t:'followers',    va:A.followers,    vb:B.followers,    f:fmt,                        inv:false },
    { l:'Alcance',           t:'reach',        va:A.reach,        vb:B.reach,        f:fmt,                        inv:false },
    { l:'Visualizações vídeo',t:'video_views', va:A.videoViews,   vb:B.videoViews,   f:fmt,                        inv:false },
    { l:'Views em posts',    t:'post_views',   va:A.postViews,    vb:B.postViews,    f:fmt,                        inv:false },
    { l:'Visitas ao perfil', t:'profile_views',va:A.profileViews, vb:B.profileViews, f:fmt,                        inv:false },
    { l:'Engajamento médio', t:'engagement',   va:A.engRate,      vb:B.engRate,      f:(v)=>v.toFixed(1)+'%',      inv:false },
    { l:'Posts publicados',  t:'',             va:A.postCount,    vb:B.postCount,    f:fmt,                        inv:false },
    { l:'Investimento Ads',  t:'ads_spend',    va:A.spend,        vb:B.spend,        f:money,                      inv:true  },
    { l:'Receita Ads',       t:'ads_revenue',  va:A.adsRevenue,   vb:B.adsRevenue,   f:money,                      inv:false },
    { l:'ROAS',              t:'roas',         va:A.roas,         vb:B.roas,         f:(v)=>v?v.toFixed(2)+'x':'—',inv:false },
    { l:'Conversões',        t:'conversions',  va:A.conv,         vb:B.conv,         f:fmt,                        inv:false },
    { l:'CPA',               t:'cpa',          va:A.cpa,          vb:B.cpa,          f:(v)=>v?money(v):'—',        inv:true  },
    { l:'CTR',               t:'ctr',          va:A.ctr,          vb:B.ctr,          f:(v)=>v?v.toFixed(2)+'%':'—',inv:false },
    { l:'Receita Manual',    t:'manual_rev',   va:A.manualRev,    vb:B.manualRev,    f:money,                      inv:false },
    { l:'Receita Total',     t:'total_revenue',va:A.totalRev,     vb:B.totalRev,     f:money,                      inv:false },
    { l:'Lucro estimado',    t:'profit',       va:A.profit,       vb:B.profit,       f:money,                      inv:false },
  ];

  function campMap(f, t) {
    const out = {};
    State.ads.filter((r) => inP(r.date, f, t)).forEach((a) => {
      const k = a.campaign || 'Sem nome';
      if (!out[k]) out[k] = { spend:0, revenue:0, conv:0, clicks:0 };
      out[k].spend += +a.spend||0; out[k].revenue += +a.revenue||0;
      out[k].conv += +a.conversions||0; out[k].clicks += +a.clicks||0;
    });
    return out;
  }
  const cA = campMap(aFrom, aTo), cB = campMap(bFrom, bTo);
  const allCamps = [...new Set([...Object.keys(cA), ...Object.keys(cB)])].sort();

  return `
  <div class="card p-5 mb-4">
    ${sectionTitle('Selecionar períodos para comparar')}
    <div class="grid lg:grid-cols-2 gap-4 mb-4">
      <div>
        <p class="text-xs font-bold text-blue-600 mb-2">Período A</p>
        <div class="flex gap-2 items-center">
          <input id="comp-a-from" type="date" value="${aFrom}" class="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm bg-blue-50/60" />
          <span class="text-gray-400 text-xs font-medium">até</span>
          <input id="comp-a-to"   type="date" value="${aTo}"   class="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm bg-blue-50/60" />
        </div>
      </div>
      <div>
        <p class="text-xs font-bold text-violet-600 mb-2">Período B</p>
        <div class="flex gap-2 items-center">
          <input id="comp-b-from" type="date" value="${bFrom}" class="flex-1 border border-violet-200 rounded-xl px-3 py-2 text-sm bg-violet-50/60" />
          <span class="text-gray-400 text-xs font-medium">até</span>
          <input id="comp-b-to"   type="date" value="${bTo}"   class="flex-1 border border-violet-200 rounded-xl px-3 py-2 text-sm bg-violet-50/60" />
        </div>
      </div>
    </div>
    <button onclick="applyComparative()" class="btn-accent w-full py-2.5">Comparar períodos</button>
  </div>

  <div class="card p-5 mb-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-gray-900 text-sm">Métricas comparadas</h2>
      <div class="flex items-center gap-4 text-xs font-bold">
        <span class="text-blue-600">A · ${aFrom} → ${aTo}</span>
        <span class="text-violet-600">B · ${bFrom} → ${bTo}</span>
      </div>
    </div>
    <div class="overflow-x-auto -mx-1 scrollbar-thin">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-gray-100">
          <th class="py-2 px-3 text-left text-xs font-medium text-gray-400">Métrica</th>
          <th class="py-2 px-3 text-center text-xs font-bold text-blue-600">Período A</th>
          <th class="py-2 px-3 text-center text-xs font-bold text-violet-600">Período B</th>
          <th class="py-2 px-3 text-center text-xs font-medium text-gray-400">Variação A→B</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
          ${rows.map((r) => `<tr class="hover:bg-gray-50/60 transition-colors">
            <td class="py-2.5 px-3 text-xs text-gray-700 font-medium">
              <span class="flex items-center">${esc(r.l)}${tip(r.t)}</span>
            </td>
            <td class="py-2.5 px-3 text-center text-sm font-bold text-blue-700">${r.f(r.va)}</td>
            <td class="py-2.5 px-3 text-center text-sm font-bold text-violet-700">${r.f(r.vb)}</td>
            <td class="py-2.5 px-3 text-center text-xs font-bold ${dCls(r.va, r.vb, r.inv)}">${delta(r.va, r.vb)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  ${allCamps.length ? `
  <div class="card p-5">
    ${sectionTitle('Campanhas · comparativo')}
    <div class="overflow-x-auto -mx-1 scrollbar-thin">
      <table class="w-full text-xs">
        <thead><tr class="border-b border-gray-100">
          <th class="py-2 px-3 text-left text-xs font-medium text-gray-400">Campanha</th>
          <th class="py-2 px-3 text-center text-[10px] font-bold text-blue-600" colspan="3">Período A · Invest. / Receita / ROAS</th>
          <th class="py-2 px-3 text-center text-[10px] font-bold text-violet-600" colspan="3">Período B · Invest. / Receita / ROAS</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
          ${allCamps.map((camp) => {
            const ca = cA[camp]||{spend:0,revenue:0,conv:0}, cb = cB[camp]||{spend:0,revenue:0,conv:0};
            const ra = ca.spend>0?ca.revenue/ca.spend:0, rb = cb.spend>0?cb.revenue/cb.spend:0;
            return `<tr class="hover:bg-gray-50/60">
              <td class="py-2.5 px-3 font-semibold text-gray-900 max-w-[140px] truncate">${esc(camp)}</td>
              <td class="py-2.5 px-3 text-center text-blue-700 font-semibold">${money(ca.spend)}</td>
              <td class="py-2.5 px-3 text-center text-emerald-700 font-semibold">${money(ca.revenue)}</td>
              <td class="py-2.5 px-3 text-center font-bold ${ra>=2?'text-emerald-600':ra>0&&ra<1?'text-red-500':'text-gray-600'}">${ra?ra.toFixed(2)+'x':'—'}</td>
              <td class="py-2.5 px-3 text-center text-violet-700 font-semibold">${money(cb.spend)}</td>
              <td class="py-2.5 px-3 text-center text-emerald-600 font-semibold">${money(cb.revenue)}</td>
              <td class="py-2.5 px-3 text-center font-bold ${rb>=2?'text-emerald-600':rb>0&&rb<1?'text-red-500':'text-gray-600'}">${rb?rb.toFixed(2)+'x':'—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>` : emptyState('Adicione dados de Ads para ver comparativo de campanhas.')}
  `;
}
function applyComparative() {
  const aFrom = $('#comp-a-from')?.value, aTo = $('#comp-a-to')?.value;
  const bFrom = $('#comp-b-from')?.value, bTo = $('#comp-b-to')?.value;
  if (!aFrom || !aTo || !bFrom || !bTo) { toast('Preencha todas as datas.', 'warn'); return; }
  localStorage.setItem('dsr.comparative', JSON.stringify({ aFrom, aTo, bFrom, bTo }));
  renderView();
}
window.applyComparative = applyComparative;

async function clearCollection(col) {
  const label = { ig_daily:'métricas diárias do Instagram', ig_posts:'posts', ads:'dados de Ads', goals:'metas', notes:'anotações', revenues:'receitas' }[col] || col;
  if (!confirm(`Apagar todos os ${label}? Esta ação remove da nuvem também.`)) return;
  toast('Apagando…');
  await DB.clearCollection(col);
  await loadAll(); renderView();
  toast(`${label.charAt(0).toUpperCase() + label.slice(1)} apagados.`);
}
window.clearCollection = clearCollection;

/* ══════════════════════════════════════════════
   FORMULÁRIOS
══════════════════════════════════════════════ */
const FORMS = {
  daily:   { title:'Métrica diária · Instagram', col:'ig_daily', fields:[
    { k:'date', label:'Data', type:'date', def:today, required:true },
    { k:'followers', label:'Seguidores (total)', type:'number' },
    { k:'reach', label:'Alcance', type:'number' },
    { k:'impressions', label:'Impressões', type:'number' },
    { k:'profile_views', label:'Visitas ao perfil', type:'number' },
    { k:'website_clicks', label:'Cliques no site', type:'number' },
    { k:'video_views', label:'Visualizações de vídeo (total)', type:'number' },
  ]},
  post:    { title:'Post / Reel', col:'ig_posts', fields:[
    { k:'date', label:'Data', type:'date', def:today, required:true },
    { k:'type', label:'Tipo', type:'select', options:['Reel','Carrossel','Foto','Story'] },
    { k:'caption', label:'Tema / legenda', type:'text' },
    { k:'views', label:'Visualizações', type:'number' },
    { k:'reach', label:'Alcance', type:'number' },
    { k:'likes', label:'Curtidas', type:'number' },
    { k:'comments', label:'Comentários', type:'number' },
    { k:'saves', label:'Salvamentos', type:'number' },
    { k:'shares', label:'Compartilhamentos', type:'number' },
  ]},
  ad:      { title:'Campanha Meta Ads', col:'ads', fields:[
    { k:'date', label:'Data', type:'date', def:today, required:true },
    { k:'campaign', label:'Nome da campanha', type:'text' },
    { k:'spend', label:'Investimento (R$)', type:'number', step:'0.01' },
    { k:'impressions', label:'Impressões', type:'number' },
    { k:'clicks', label:'Cliques', type:'number' },
    { k:'conversions', label:'Conversões', type:'number' },
    { k:'revenue', label:'Receita atribuída (R$)', type:'number', step:'0.01' },
  ]},
  revenue: { title:'Receita Manual', col:'revenues', fields:[
    { k:'date', label:'Data', type:'date', def:today, required:true },
    { k:'source', label:'Fonte', type:'text', required:true, placeholder:'Ex.: Venda consultoria, Produto digital...' },
    { k:'campaign', label:'Campanha de origem (opcional)', type:'text', placeholder:'Ex.: Funil de vendas, Criativos de março...' },
    { k:'amount', label:'Valor (R$)', type:'number', step:'0.01', required:true },
    { k:'description', label:'Descrição (opcional)', type:'textarea' },
  ]},
  goal:    { title:'Meta', col:'goals', fields:[
    { k:'name', label:'Nome da meta', type:'text', required:true, placeholder:'Ex.: 10.000 seguidores em junho' },
    { k:'period', label:'Período', type:'text', placeholder:'Ex.: Junho/2026' },
    { k:'kpiKey', label:'Conectar a KPI (atualização automática)', type:'select', options:[
      { value:'', label:'Manual — vou atualizar o progresso' },
      { value:'followers',   label:'Seguidores' },
      { value:'reach',       label:'Alcance (período)' },
      { value:'video_views', label:'Visualizações de vídeo' },
      { value:'post_views',  label:'Views em posts' },
      { value:'engagement',  label:'Engajamento médio (%)' },
      { value:'posts',       label:'Posts publicados' },
      { value:'spend',       label:'Investimento Ads (R$)' },
      { value:'revenue',     label:'Receita total (R$)' },
      { value:'conversions', label:'Conversões' },
      { value:'roas',        label:'ROAS' },
    ]},
    { k:'target', label:'Objetivo (número)', type:'number', required:true },
    { k:'current_val', label:'Progresso atual (só se manual)', type:'number' },
  ]},
  note:    { title:'Anotação', col:'notes', fields:[
    { k:'icon', label:'Ícone', type:'select', options:['📝','💡','📌','🔑','🎯','⭐','📣','🔥'] },
    { k:'title', label:'Título', type:'text', required:true },
    { k:'body', label:'Detalhe', type:'textarea' },
  ]},
};

function openForm(type, id) {
  const def = FORMS[type]; if (!def) return;
  const existing = id ? (State[colToState(def.col)]||[]).find((r) => r.id === id) : null;
  const c = co();
  $('#modal-root').innerHTML = `
  <div class="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-0 sm:p-6" onclick="if(event.target===this)closeForm()">
    <div class="modal-sheet bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto scrollbar-thin shadow-2xl">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-3xl">
        <h3 class="font-bold text-sm">${existing?'Editar':'Novo'} · ${def.title}</h3>
        <button onclick="closeForm()" class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs transition-colors">✕</button>
      </div>
      <form id="entry-form" class="px-5 py-4 space-y-3">
        ${def.fields.map((f) => fieldHtml(f, existing)).join('')}
        <div class="flex gap-2 pt-2">
          <button type="submit" class="btn-accent flex-1 py-3">Salvar</button>
          <button type="button" onclick="closeForm()" class="text-sm px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  </div>`;
  $('#entry-form').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), row = {};
    def.fields.forEach((f) => { let v = fd.get(f.k); if (f.type==='number') v=v===''?null:+v; row[f.k]=v; });
    submitForm(def.col, id, row);
  };
}

function fieldHtml(f, existing) {
  const val = existing ? (existing[f.k]??'') : (typeof f.def==='function' ? f.def() : (f.def??''));
  const base = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 transition-all';
  let input;
  if (f.type==='select') {
    const opts = (f.options||[]).map((o) => {
      const v = typeof o === 'object' ? o.value : o;
      const l = typeof o === 'object' ? o.label  : o;
      return `<option value="${esc(v)}" ${String(val)===v?'selected':''}>${esc(l)}</option>`;
    });
    input = `<select name="${f.k}" class="${base} cursor-pointer">${opts.join('')}</select>`;
  }
  else if (f.type==='textarea') input = `<textarea name="${f.k}" rows="3" class="${base}" placeholder="${f.placeholder||''}">${esc(val)}</textarea>`;
  else input = `<input name="${f.k}" type="${f.type}" ${f.step?`step="${f.step}"`:''}  ${f.required?'required':''} class="${base}" placeholder="${f.placeholder||''}" value="${esc(val)}" />`;
  return `<div><label class="block text-xs font-semibold text-gray-600 mb-1.5">${f.label}${f.required?' <span class="text-red-400">*</span>':''}</label>${input}</div>`;
}

function colToState(col) {
  return { ig_daily:'igDaily', ig_posts:'posts', ads:'ads', goals:'goals', notes:'notes', revenues:'revenues' }[col];
}
async function submitForm(col, id, row) {
  try {
    if (id) await DB.update(col, id, row); else await DB.insert(col, row);
    closeForm(); await loadAll(); renderView(); toast(id?'Atualizado!':'Adicionado!');
  } catch(e) { toast('Erro ao salvar: '+e.message, 'err'); }
}
function closeForm() { $('#modal-root').innerHTML = ''; }
async function delRow(col, id) {
  if (!confirm('Remover este registro?')) return;
  try { await DB.remove(col, id); await loadAll(); renderView(); toast('Removido.'); }
  catch(e) { toast('Erro: '+e.message, 'err'); }
}

/* ── Config ── */
function saveConfig() {
  const url = $('#cfg-url').value.trim(), key = $('#cfg-key').value.trim();
  if (url && !/^https:\/\/.+\.supabase\.co/.test(url)) { toast('URL do Supabase parece inválida.','warn'); return; }
  DB.setConfig({ ...DB.getConfig(), supabaseUrl:url, supabaseKey:key });
  toast('Conexão salva. Recarregando...'); setTimeout(()=>location.reload(), 800);
}
function clearConfig() { DB.setConfig({}); toast('Voltando ao modo local...'); setTimeout(()=>location.reload(),600); }
async function saveMetaConfig() {
  const token = $('#cfg-meta-token').value.trim();
  const igId  = $('#cfg-ig-id').value.trim();
  const adAcc = $('#cfg-ad-account').value.trim();
  await DB.setCompanyConfig({ metaToken: token, igAccountId: igId, metaAdAccount: adAcc });
  toast('Credenciais Meta salvas na nuvem para ' + co().name + '!');
  if (token && igId) { setTimeout(syncMeta, 500); }
}

/* ── Backup ── */
async function exportData() {
  const c = co();
  toast('Exportando…');
  const data = await DB.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dashboard-${c.id}-${today()}.json`; a.click();
}
function importData(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      toast('Importando para a nuvem…');
      await DB.importAll(JSON.parse(reader.result));
      await loadAll(); render(); toast('Backup importado!');
    } catch (err) { toast('Arquivo inválido: ' + err.message, 'err'); }
  };
  reader.readAsText(file);
}
async function wipeData() {
  const c = co(); if (!confirm(`Apagar TODOS os dados de "${c.name}"? Esta ação remove da nuvem também.`)) return;
  toast('Apagando dados…');
  await DB.clearAll(); await loadAll(); render(); toast('Dados apagados.');
}

/* ── Dados de exemplo ── */
async function loadSample() {
  if (State.igDaily.length && !confirm('Adicionar dados de exemplo?')) return;
  const c=co(), base=12000;
  for (let i=29;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i);
    await DB.insert('ig_daily',{ date:d.toISOString().slice(0,10), followers:base+(29-i)*35+Math.round(Math.random()*20), reach:3000+Math.round(Math.random()*4000), impressions:5000+Math.round(Math.random()*6000), profile_views:200+Math.round(Math.random()*300), website_clicks:20+Math.round(Math.random()*60), video_views:8000+Math.round(Math.random()*12000) });
  }
  for (let i=0;i<c.sample.posts.length;i++) {
    const d=new Date(); d.setDate(d.getDate()-i*4);
    await DB.insert('ig_posts',{ date:d.toISOString().slice(0,10), type:c.sample.posts[i][0], caption:c.sample.posts[i][1], views:5000+Math.round(Math.random()*25000), reach:4000+Math.round(Math.random()*8000), likes:300+Math.round(Math.random()*900), comments:20+Math.round(Math.random()*120), saves:50+Math.round(Math.random()*400), shares:30+Math.round(Math.random()*200) });
  }
  for (let i=13;i>=0;i-=2) {
    const d=new Date(); d.setDate(d.getDate()-i);
    const spend=50+Math.round(Math.random()*150);
    await DB.insert('ads',{ date:d.toISOString().slice(0,10), campaign:c.sample.camps[i%3], spend, impressions:spend*(80+Math.round(Math.random()*60)), clicks:Math.round(spend*(1.5+Math.random()*2)), conversions:Math.round(Math.random()*6), revenue:Math.round(spend*(0.8+Math.random()*2.5)) });
  }
  // Receitas manuais de exemplo
  const revSources = ['Consultoria','Produto digital','Workshop','Mentoria'];
  for (let i=0;i<5;i++) {
    const d=new Date(); d.setDate(d.getDate()-i*5);
    await DB.insert('revenues',{ date:d.toISOString().slice(0,10), source:revSources[i%revSources.length], amount:300+Math.round(Math.random()*2000), description:`Lançamento de exemplo para ${c.name}` });
  }
  await DB.insert('goals',{name:'Seguidores no mês',period:'Junho/2026',target:14000,current:base+1000});
  await DB.insert('goals',{name:'ROAS médio',period:'Junho/2026',target:3,current:2});
  await DB.insert('notes',{icon:'💡',title:'Ideia de série',body:`Conteúdo educativo semanal para ${c.name}.`});
  await loadAll(); render(); toast('Dados de exemplo carregados!');
}

/* ── Empresa ── */
async function selectCompany(id) {
  DB.setCompany(id); State.company=id; State.tab='overview';
  applyTheme(co());
  await DB.loadCompanyConfig();
  await loadAll(); render();
  autoSyncIfNeeded();
}
function showSelector() { State.company=null; DB.clearCompany(); render(); }

/* ── Boot ── */
(async function init() {
  const companyId = DB.getCompany();
  if (companyId) {
    State.company = companyId;
    applyTheme(co());
    await DB.loadCompanyConfig();
    await loadAll();
  }
  render();
  if (State.company) autoSyncIfNeeded();
})();

function applyCustomRange() {
  const f = $('#date-from'), t = $('#date-to');
  if (!f || !t || !f.value || !t.value) return;
  State.dateFrom = f.value; State.dateTo = t.value; State.range = -1;
  renderView();
}
function clearCustomRange() {
  State.dateFrom = null; State.dateTo = null; State.range = 30; render();
}

window.openForm=openForm; window.closeForm=closeForm; window.delRow=delRow;
window.saveConfig=saveConfig; window.clearConfig=clearConfig; window.saveMetaConfig=saveMetaConfig;
window.exportData=exportData; window.importData=importData; window.wipeData=wipeData;
window.loadSample=loadSample; window.selectCompany=selectCompany; window.showSelector=showSelector;
window.syncMeta=syncMeta; window.applyCustomRange=applyCustomRange; window.clearCustomRange=clearCustomRange;

async function syncAll() {
  const btn = $('#sync-all-btn'), label = $('#sync-label'), icon = $('#sync-icon');
  if (btn) { btn.disabled = true; if (label) label.textContent = 'Atualizando…'; if (icon) icon.style.animation = 'spin 1s linear infinite'; }
  try {
    const cfg = DB.getCompanyConfig();
    if (cfg.metaToken && cfg.igAccountId) {
      await syncMeta();
    } else {
      await loadAll();
      render();
      toast('Dados atualizados!');
    }
  } finally {
    if (btn) { btn.disabled = false; if (icon) icon.style.animation = ''; }
  }
}
window.syncAll = syncAll;

function initTooltips() {
  if (window._tipInit) return;
  window._tipInit = true;
  document.addEventListener('mouseenter', (e) => {
    if (!e.target?.classList?.contains('tip-icon')) return;
    const pop = e.target.nextElementSibling;
    if (!pop?.classList?.contains('tip-pop')) return;
    pop.style.left = ''; pop.style.right = ''; pop.style.transform = '';
    const iconRect = e.target.getBoundingClientRect();
    const popW = 220;
    const centered = iconRect.left + iconRect.width / 2 - popW / 2;
    if (centered < 8) {
      pop.style.left = '0'; pop.style.transform = 'none';
    } else if (centered + popW > window.innerWidth - 8) {
      pop.style.left = 'auto'; pop.style.right = '0'; pop.style.transform = 'none';
    }
  }, true);
}
initTooltips();
