/* ============================================================
   Camada de dados (Data Layer)
   - Cloud-first: Supabase por padrão, localStorage como fallback
   - Isolamento por empresa: company_id em todas as queries
   - Mesma API em qualquer PC/dispositivo
   ============================================================ */
(function () {
  let _company = localStorage.getItem('dsr.activeCompany') || null;
  let _companyCfg = {};          // cache em memória — carregado do Supabase no startup
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
        const r = await req(`${base}/${tbl(col)}?select=*&company_id=eq.${cid()}&order=created_at.desc&limit=10000`);
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
      return _companyCfg;
    },
    async setCompanyConfig(patch) {
      if (!_company) return;
      _companyCfg = { ..._companyCfg, ...patch };
      // Salva localStorage como cache local
      localStorage.setItem('dsr.' + _company + '.meta', JSON.stringify(_companyCfg));
      // Persiste na nuvem
      try {
        const SBU = activeUrl(), SBK = activeKey();
        const base = SBU.replace(/\/$/, '') + '/rest/v1';
        const h = { apikey: SBK, Authorization: 'Bearer ' + SBK, 'Content-Type': 'application/json', Prefer: 'return=minimal,resolution=merge-duplicates' };
        await fetch(`${base}/social_config`, {
          method: 'POST',
          headers: h,
          body: JSON.stringify({
            company_id:     _company,
            meta_token:     _companyCfg.metaToken     || null,
            ig_account_id:  _companyCfg.igAccountId   || null,
            ad_account_id:  _companyCfg.metaAdAccount || null,
            last_sync:      _companyCfg.lastSync       || null,
            updated_at:     new Date().toISOString(),
          }),
        });
      } catch (e) { /* falha silenciosa — cache local mantém o dado */ }
    },
    // Carrega credenciais do Supabase para o cache em memória (chama no startup e ao trocar empresa)
    async loadCompanyConfig() {
      if (!_company) { _companyCfg = {}; return; }
      // Lê localStorage como fallback rápido
      try { _companyCfg = JSON.parse(localStorage.getItem('dsr.' + _company + '.meta') || '{}'); } catch { _companyCfg = {}; }
      // Substitui pelo valor da nuvem (mais atualizado)
      try {
        const SBU = activeUrl(), SBK = activeKey();
        const base = SBU.replace(/\/$/, '') + '/rest/v1';
        const h = { apikey: SBK, Authorization: 'Bearer ' + SBK };
        const r = await fetch(`${base}/social_config?company_id=eq.${_company}&select=*`, { headers: h });
        if (r.ok) {
          const rows = await r.json();
          if (rows.length) {
            const row = rows[0];
            _companyCfg = {
              metaToken:     row.meta_token     || _companyCfg.metaToken     || '',
              igAccountId:   row.ig_account_id  || _companyCfg.igAccountId  || '',
              metaAdAccount: row.ad_account_id  || _companyCfg.metaAdAccount || '',
              lastSync:      row.last_sync       || _companyCfg.lastSync      || null,
            };
            // Mantém localStorage em sincronia
            localStorage.setItem('dsr.' + _company + '.meta', JSON.stringify(_companyCfg));
          }
        }
      } catch { /* mantém cache local */ }
    },
    getCompany()  { return _company; },
    setCompany(id){ _company = id; _companyCfg = {}; localStorage.setItem('dsr.activeCompany', id); },
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
