# Dashboard Social · Instagram + Meta Ads

Painel para acompanhar **crescimento orgânico do Instagram**, **performance de Meta Ads**,
**metas** e **ideias/sugestões automáticas** — com entrada manual e (futuramente)
sincronização automática via Meta API.

## Como usar agora (sem instalar nada)

1. Abra o arquivo **`index.html`** com duplo clique (ou arraste para o navegador).
2. Vá em **Configurações → Carregar dados de exemplo** para ver o painel cheio.
3. Use **Entrada de Dados** para registrar suas métricas reais.

> Os dados ficam salvos **neste navegador** (localStorage). Faça *Exportar (JSON)*
> em Configurações de vez em quando como backup.

## Abas

- **Visão Geral** — KPIs principais, crescimento, investimento × receita, top sugestões.
- **Instagram** — alcance, engajamento por post, tabela de posts/reels.
- **Meta Ads** — investimento, ROAS, CTR, CPC, CPA, campanhas.
- **Metas** — objetivos com barra de progresso.
- **Ideias & Dados** — sugestões automáticas + anotações importantes.
- **Entrada de Dados** — formulários rápidos.
- **Configurações** — conexão Supabase, backup, Meta API.

## Subir para a nuvem (Supabase)

1. No Supabase, rode **`supabase-schema.sql`** no SQL Editor.
2. Copie *Project URL* e *Publishable key*.
3. Cole em **Configurações → Conexão de dados** no dashboard.
4. Pronto: os dados passam a sincronizar e ficam acessíveis de qualquer lugar.

## Publicar online (Vercel)

Esta pasta é um site estático — basta fazer deploy dela na Vercel (já tem `vercel.json`).
Você ganha uma URL pública para acessar do celular/computador.

## Integração automática (Meta API)

Veja **`GUIA-META-API.md`** para criar o app Meta e gerar o token. Depois disso
a sincronização automática de Instagram + Ads pode ser ativada.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página |
| `app.js` | Interface, KPIs, gráficos, formulários |
| `storage.js` | Camada de dados (localStorage ↔ Supabase) |
| `insights.js` | Motor de ideias e sugestões |
| `supabase-schema.sql` | Schema do banco na nuvem |
| `GUIA-META-API.md` | Passo a passo da Meta API |
