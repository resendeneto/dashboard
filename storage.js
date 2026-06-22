/* ============================================================
   Camada de dados (Data Layer)
   - Suporta múltiplas empresas: cada empresa tem seu próprio
     namespace no localStorage (dsr.{empresa}.{coleção}).
   - Pronto para Supabase: preencha URL + Key em Configurações.
   - Toda a UI fala SÓ com window.DB — trocar a fonte de dados
     não exige mexer no resto do app.
   ============================================================ */
(function () {
  let _company = localStorage.getItem('dsr.activeCompany') || null;
  const CFG_KEY = 'dsr.config'; // config global (não por empresa)

  const COLLECTIONS = {
    ig_daily:  'social_ig_daily',
    ig_posts:  'social_ig_posts',
    ads:       'social_ads',
    goals:     'social_goals',
    notes:     'social_notes',
    revenues:  'social_revenues',
  };

  function ns() { return 'dsr.' + (_company || 'default') + '.'; }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Backend: localStorage ---------- */
  const Local = {
    read(col) {
      try { return JSON.parse(localStorage.getItem(ns() + col) || '[]'); }
      catch { return []; }
    },
    write(col, rows) {
      localStorage.setItem(ns() + col, JSON.stringify(rows));
    },
    list(col) { return Promise.resolve(this.read(col)); },
    insert(col, row) {
      const rows = this.read(col);
      const rec = { id: uid(), created_at: new Date().toISOString(), ...row };
      rows.push(rec);
      this.write(col, rows);
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
  };

  /* ---------- Backend: Supabase (opcional) ---------- */
  function makeSupabase(url, key) {
    const base = url.replace(/\/$/, '') + '/rest/v1';
    const headers = {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    };
    const table = (col) => COLLECTIONS[col] || col;
    return {
      async list(col) {
        const r = await fetch(`${base}/${table(col)}?select=*&order=created_at.desc`, { headers });
        if (!r.ok) throw new Error('Supabase list ' + r.status);
        return r.json();
      },
      async insert(col, row) {
        const r = await fetch(`${base}/${table(col)}`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify(row),
        });
        if (!r.ok) throw new Error('Supabase insert ' + r.status);
        return (await r.json())[0];
      },
      async update(col, id, patch) {
        const r = await fetch(`${base}/${table(col)}?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify(patch),
        });
        if (!r.ok) throw new Error('Supabase update ' + r.status);
        return (await r.json())[0];
      },
      async remove(col, id) {
        const r = await fetch(`${base}/${table(col)}?id=eq.${id}`, { method: 'DELETE', headers });
        if (!r.ok) throw new Error('Supabase delete ' + r.status);
        return true;
      },
    };
  }

  /* ---------- Seletor de backend ---------- */
  function getConfig() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); }
    catch { return {}; }
  }
  function setConfig(cfg) {
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  }
  function backend() {
    const c = getConfig();
    if (c.supabaseUrl && c.supabaseKey) {
      try { return makeSupabase(c.supabaseUrl, c.supabaseKey); }
      catch { return Local; }
    }
    return Local;
  }

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
    // Gestão de empresa ativa
    getCompany() { return _company; },
    setCompany(id) { _company = id; localStorage.setItem('dsr.activeCompany', id); },
    clearCompany() { _company = null; localStorage.removeItem('dsr.activeCompany'); },
    mode() { const c = getConfig(); return c.supabaseUrl && c.supabaseKey ? 'supabase' : 'local'; },
    list: (col) => backend().list(col),
    insert: (col, row) => backend().insert(col, row),
    update: (col, id, patch) => backend().update(col, id, patch),
    remove: (col, id) => backend().remove(col, id),
    // Exporta / importa / apaga dados da empresa atual
    exportAll() {
      const out = {};
      Object.keys(COLLECTIONS).forEach((c) => (out[c] = Local.read(c)));
      return out;
    },
    importAll(data) {
      Object.keys(COLLECTIONS).forEach((c) => {
        if (Array.isArray(data[c])) Local.write(c, data[c]);
      });
    },
    clearAll() {
      Object.keys(COLLECTIONS).forEach((c) => Local.write(c, []));
    },
  };
})();
