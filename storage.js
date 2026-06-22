/* ============================================================
   Camada de dados (Data Layer)
   - Cloud-first: Supabase por padrão, localStorage como fallback
   - Isolamento por empresa: company_id em todas as queries
   - Mesma API em qualquer PC/dispositivo
   ============================================================ */
(function () {
  let _company = localStorage.getItem('dsr.activeCompany') || null;
  const CFG_KEY = 'dsr.config';

  // Credenciais padrão do projeto Supabase (anon key — seguro no client)
  const SB_URL = 'https://vjgqsoejejiexevmcoff.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZ3Fzb2VqZWppZXhldm1jb2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjMyMTUsImV4cCI6MjA5MzA5OTIxNX0.jUvSiouCMtnumeb1hmYQ5XeBlmb07UmKef_ysW9BOlw';

  const COLLECTIONS = {
    ig_daily:  'social_ig_daily',
    ig_posts:  'social_ig_posts',
    ads:       'social_ads',
    goals:     'social_goals',
    notes:     'social_notes',
    revenues:  'social_revenues',
  };

  function ns()  { return 'dsr.' + (_company || 'default') + '.'; }
  function cid() { return _company || 'default'; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------- Backend: localStorage (fallback offline) ---------- */
  const Local = {
    read(col) {
      try { return JSON.parse(localStorage.getItem(ns() + col) || '[]'); }
      catch { return []; }
    },
    write(col, rows) { localStorage.setItem(ns() + col, JSON.stringify(rows)); },
    list(col)          { return Promise.resolve(this.read(col)); },
    insert(col, row)   {
      const rows = this.read(col);
      const rec = { id: uid(), created_at: new Date().toISOString(), ...row };
      rows.push(rec); this.write(col, rows);
      return Promise.resolve(rec);
    },
    update(col, id, patch) {
      const rows = this.read(col).map((r) => (r.id === id ? { ...r, ...patch } : r));
      this.write(col, rows);
      return Promise.resolve(rows.find((r) => r.id === id));
    },
    remove(col, id) {
      this.write(col, this.read(col).filter((r) => r.id !== id));
      return Promise.resolve(true);
    },
    clearCol(col)  { this.write(col, []); return Promise.resolve(true); },
  };

  /* ---------- Backend: Supabase (cloud, padrão) ---------- */
  function makeSupabase(url, key) {
    const base = url.replace(/\/$/, '') + '/rest/v1';
    const h = {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    };
    const tbl = (col) => COLLECTIONS[col] || col;

    async function req(url, opts = {}) {
      const r = await fetch(url, { ...opts, headers: { ...h, ...opts.headers } });
      if (!r.ok) {
        const msg = await r.text().catch(() => r.status);
        throw new Error(msg);
      }
      return r;
    }

    return {
      async list(col) {
        const r = await req(`${base}/${tbl(col)}?select=*&company_id=eq.${cid()}&order=created_at.desc`);
        return r.json();
      },
      async insert(col, row) {
        const r = await req(`${base}/${tbl(col)}`, {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ ...row, company_id: cid() }),
        });
        return (await r.json())[0];
      },
      async update(col, id, patch) {
        const r = await req(`${base}/${tbl(col)}?id=eq.${id}&company_id=eq.${cid()}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(patch),
        });
        const data = await r.json();
        return Array.isArray(data) ? data[0] : data;
      },
      async remove(col, id) {
        await req(`${base}/${tbl(col)}?id=eq.${id}&company_id=eq.${cid()}`, { method: 'DELETE' });
        return true;
      },
      async clearCol(col) {
        await req(`${base}/${tbl(col)}?company_id=eq.${cid()}`, { method: 'DELETE' });
        return true;
      },
    };
  }

  /* ---------- Seletor de backend ---------- */
  function getConfig() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); }
    catch { return {}; }
  }
  function setConfig(cfg) { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }

  function activeUrl() { const c = getConfig(); return c.supabaseUrl  || SB_URL; }
  function activeKey() { const c = getConfig(); return c.supabaseKey  || SB_KEY; }

  function backend() {
    try { return makeSupabase(activeUrl(), activeKey()); }
    catch { return Local; }
  }

  /* ---------- API pública: window.DB ---------- */
  window.DB = {
    COLLECTIONS,
    uid,
    getConfig,
    setConfig,
    getCompanyConfig() {
      if (!_company) return {};
      try { return JSON.parse(localStorage.getItem('dsr.' + _company + '.meta') || '{}'); }
      catch { return {}; }
    },
    setCompanyConfig(patch) {
      if (!_company) return;
      const cur = this.getCompanyConfig();
      localStorage.setItem('dsr.' + _company + '.meta', JSON.stringify({ ...cur, ...patch }));
    },
    getCompany()  { return _company; },
    setCompany(id){ _company = id; localStorage.setItem('dsr.activeCompany', id); },
    clearCompany(){ _company = null; localStorage.removeItem('dsr.activeCompany'); },
    mode()        { return 'supabase'; }, // sempre cloud após configuração
    list:   (col)       => backend().list(col),
    insert: (col, row)  => backend().insert(col, row),
    update: (col, id, p)=> backend().update(col, id, p),
    remove: (col, id)   => backend().remove(col, id),
    // Exporta estado atual (para backup)
    async exportAll() {
      const out = {};
      for (const col of Object.keys(COLLECTIONS)) {
        try { out[col] = await this.list(col); }
        catch { out[col] = Local.read(col); }
      }
      return out;
    },
    // Importa de arquivo JSON (insere no backend ativo)
    async importAll(data) {
      for (const col of Object.keys(COLLECTIONS)) {
        if (!Array.isArray(data[col])) continue;
        for (const row of data[col]) {
          const { id, created_at, company_id, ...fields } = row;
          await this.insert(col, fields).catch(() => {});
        }
      }
    },
    async clearAll() {
      const be = backend();
      await Promise.all(Object.keys(COLLECTIONS).map((c) => be.clearCol(c).catch(() => Local.clearCol(c))));
    },
    async clearCollection(col) {
      await backend().clearCol(col).catch(() => Local.clearCol(col));
    },
  };
})();
