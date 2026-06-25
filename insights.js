/* ============================================================
   Motor de Ideias & Sugestões
   Gera recomendações automáticas a partir dos números.
   Cada insight: { level: 'good'|'warn'|'bad'|'tip', title, text }
   ============================================================ */
(function () {
  const fmt = (n) => new Intl.NumberFormat('pt-BR').format(Math.round(n || 0));
  const pct = (n) => (n == null ? '—' : (n >= 0 ? '+' : '') + n.toFixed(1) + '%');

  // Taxa de engajamento de um post = (likes+comments+saves+shares)/reach
  function postEngagement(p) {
    const inter = (+p.likes || 0) + (+p.comments || 0) + (+p.saves || 0) + (+p.shares || 0);
    const reach = +p.reach || 0;
    return reach > 0 ? (inter / reach) * 100 : 0;
  }

  function generate({ igDaily, posts, ads, goals }) {
    const out = [];
    const sorted = [...igDaily].sort((a, b) => (a.date < b.date ? -1 : 1));

    /* ---- Crescimento de seguidores ---- */
    if (sorted.length >= 2) {
      const first = sorted[0], last = sorted[sorted.length - 1];
      const diff = (+last.followers || 0) - (+first.followers || 0);
      const days = Math.max(1, sorted.length);
      const perDay = diff / days;
      if (diff > 0) {
        out.push({ level: 'good', title: 'Seguidores em alta',
          text: `Você ganhou ${fmt(diff)} seguidores no período (~${fmt(perDay)}/dia). Mantenha a frequência de postagem que está trazendo esse resultado.` });
      } else if (diff < 0) {
        out.push({ level: 'bad', title: 'Queda de seguidores',
          text: `Perda de ${fmt(Math.abs(diff))} seguidores. Reveja se houve mudança brusca de tema/tom ou excesso de conteúdo promocional nos últimos dias.` });
      }
    }

    /* ---- Melhor e pior post ---- */
    if (posts.length >= 2) {
      const ranked = [...posts].map((p) => ({ ...p, eng: postEngagement(p) }))
        .sort((a, b) => b.eng - a.eng);
      const best = ranked[0], worst = ranked[ranked.length - 1];
      if (best.eng > 0) {
        out.push({ level: 'tip', title: 'Replique o formato campeão',
          text: `Seu melhor conteúdo ("${(best.caption || best.type || 'post').slice(0, 40)}") teve ${best.eng.toFixed(1)}% de engajamento. Produza variações desse mesmo tema/formato (${best.type || 'post'}) na próxima semana.` });
      }
      // Saves como sinal de valor
      const topSave = [...posts].sort((a, b) => (+b.saves || 0) - (+a.saves || 0))[0];
      if (topSave && +topSave.saves > 0) {
        out.push({ level: 'tip', title: 'Conteúdo que as pessoas salvam',
          text: `"${(topSave.caption || topSave.type || 'post').slice(0, 40)}" teve ${fmt(topSave.saves)} salvamentos — sinal de alto valor percebido. Faça um carrossel ou guia aprofundando esse assunto.` });
      }
    }

    /* ---- Melhor dia da semana ---- */
    if (posts.length >= 4) {
      const byDow = {};
      posts.forEach((p) => {
        if (!p.date) return;
        const d = new Date(p.date + 'T12:00:00');
        const dow = d.getDay();
        (byDow[dow] = byDow[dow] || []).push(postEngagement(p));
      });
      const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      let bestDow = null, bestAvg = -1;
      Object.entries(byDow).forEach(([dow, arr]) => {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        if (avg > bestAvg) { bestAvg = avg; bestDow = +dow; }
      });
      if (bestDow != null) {
        out.push({ level: 'tip', title: 'Melhor dia para postar',
          text: `Seus posts de ${dias[bestDow]} têm o maior engajamento médio (${bestAvg.toFixed(1)}%). Priorize lançar os conteúdos mais importantes nesse dia.` });
      }
    }

    /* ---- Meta Ads: ROAS / CPA ---- */
    if (ads.length) {
      const spend = ads.reduce((s, a) => s + (+a.spend || 0), 0);
      const revenue = ads.reduce((s, a) => s + (+a.revenue || 0), 0);
      const conv = ads.reduce((s, a) => s + (+a.conversions || 0), 0);
      const clicks = ads.reduce((s, a) => s + (+a.clicks || 0), 0);
      const impressions = ads.reduce((s, a) => s + (+a.impressions || 0), 0);
      const roas = spend > 0 ? revenue / spend : 0;
      const cpa = conv > 0 ? spend / conv : 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

      if (spend > 0 && roas >= 2) {
        out.push({ level: 'good', title: 'ROAS saudável',
          text: `Retorno de ${roas.toFixed(2)}x sobre o investido (R$ ${fmt(revenue)} de R$ ${fmt(spend)}). Considere escalar gradualmente o orçamento das campanhas vencedoras (10–20% a cada 2–3 dias).` });
      } else if (spend > 0 && roas > 0 && roas < 1) {
        out.push({ level: 'bad', title: 'ROAS abaixo de 1x',
          text: `Você está gastando mais do que retornando (ROAS ${roas.toFixed(2)}x). Pause os anúncios com pior desempenho, teste novos criativos e refine o público.` });
      }
      if (ctr > 0 && ctr < 1) {
        out.push({ level: 'warn', title: 'CTR baixo nos anúncios',
          text: `CTR de ${ctr.toFixed(2)}% (ideal acima de 1%). O criativo ou a copy não estão prendendo atenção — teste novos ganchos nos primeiros 3 segundos.` });
      }
      if (cpa > 0) {
        out.push({ level: 'tip', title: 'Custo por aquisição',
          text: `Seu CPA médio está em R$ ${cpa.toFixed(2)}. Compare com o ticket médio do produto: se o CPA passar de ~30% do ticket, otimize antes de escalar.` });
      }
    }

    /* ---- Metas em risco ---- */
    goals.forEach((g) => {
      const cur = +g.current_val || +g.current || 0, target = +g.target || 0;
      if (target <= 0) return;
      const ratio = cur / target;
      if (ratio >= 1) {
        out.push({ level: 'good', title: `Meta atingida: ${g.name}`,
          text: `Você bateu a meta de ${g.name} (${fmt(cur)}/${fmt(target)}). Defina o próximo patamar para manter o ritmo.` });
      } else if (ratio < 0.5) {
        out.push({ level: 'warn', title: `Meta atrasada: ${g.name}`,
          text: `A meta de ${g.name} está em ${(ratio * 100).toFixed(0)}% (${fmt(cur)}/${fmt(target)}). Aumente a frequência ou o investimento na alavanca que move esse número.` });
      }
    });

    /* ---- Consistência de postagem ---- */
    if (posts.length) {
      const last = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      if (last.date) {
        const days = Math.floor((Date.now() - new Date(last.date + 'T12:00:00')) / 86400000);
        if (days >= 3) {
          out.push({ level: 'warn', title: 'Você sumiu do feed',
            text: `Faz ${days} dias desde o último post registrado. O algoritmo premia consistência — agende ao menos 3–4 conteúdos por semana.` });
        }
      }
    }

    /* ---- Vazio: orientação inicial ---- */
    if (!out.length) {
      out.push({ level: 'tip', title: 'Comece a alimentar o painel',
        text: 'Cadastre métricas diárias do Instagram, alguns posts e campanhas em "Entrada de Dados". Conforme os números entram, as sugestões aqui ficam mais precisas e personalizadas.' });
    }

    return out;
  }

  window.Insights = { generate, postEngagement, fmt, pct };
})();
