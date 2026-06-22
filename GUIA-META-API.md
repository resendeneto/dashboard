# 📖 Guia: conectar Instagram + Meta Ads (em tempo real)

Este guia leva você do zero até gerar o **token** que permite o dashboard puxar
métricas automaticamente. Reserve ~30 min. Não precisa saber programar.

> Enquanto você não terminar isto, o dashboard funciona 100% no modo manual.
> A integração automática é um "plugar e usar" depois.

---

## Pré-requisitos (o que você precisa ter)

1. **Conta do Instagram Profissional ou Criador de Conteúdo**
   - No app do Instagram → Configurações → Conta → *Mudar para conta profissional*.
2. **Página do Facebook vinculada** a esse Instagram.
   - Instagram → Configurações → *Compartilhamento em outros apps* → conectar Página.
3. **Conta no Meta Business Suite** (business.facebook.com) — gratuita.
4. Para **Meta Ads**: uma conta de anúncios dentro do Business Suite.

---

## Passo 1 — Criar o app de desenvolvedor

1. Acesse **https://developers.facebook.com/** e clique em *Get Started* / *Começar*.
2. *Meus Apps* → **Criar app**.
3. Caso de uso: escolha **"Outro"** → tipo **"Empresa" (Business)**.
4. Dê um nome (ex.: `Dashboard Resende`) e vincule ao seu Business.

## Passo 2 — Adicionar os produtos

No painel do app, adicione:
- **Instagram Graph API** (métricas do Instagram)
- **Marketing API** (métricas do Meta Ads)

## Passo 3 — Permissões necessárias

Em *App Review → Permissions and Features*, solicite:
- `instagram_basic`
- `instagram_manage_insights`
- `pages_read_engagement`
- `pages_show_list`
- `ads_read`  *(para Meta Ads)*
- `business_management`

> Para uso só seu (sem publicar o app para outros usuários), você consegue testar
> com seu próprio usuário **sem App Review completo**, usando o modo de desenvolvimento.

## Passo 4 — Gerar o token de acesso

1. Vá em **https://developers.facebook.com/tools/explorer/** (Graph API Explorer).
2. Selecione seu app no topo.
3. Em *Permissions*, marque as permissões do Passo 3.
4. Clique **Generate Access Token** e autorize com sua conta.
5. Copie o token (começa com `EAA...`).

### Tornar o token de longa duração (60 dias)
O token do Explorer dura ~1h. Para estender, troque por um *long-lived token*:

```
https://graph.facebook.com/v21.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=SEU_APP_ID&
  client_secret=SEU_APP_SECRET&
  fb_exchange_token=TOKEN_CURTO
```

Cole no navegador (sem quebras de linha). A resposta traz o token de 60 dias.

## Passo 5 — Descobrir seus IDs

- **Instagram Business Account ID** — no Graph Explorer rode:
  `GET /me/accounts` → pegue o `id` da Página → depois
  `GET /{page-id}?fields=instagram_business_account`
- **Ad Account ID** — em business.facebook.com → Configurações → Contas de anúncios
  (formato `act_XXXXXXXX`).

## Passo 6 — Endpoints que o dashboard vai usar

**Instagram — seguidores, alcance, visitas:**
```
GET /{ig-user-id}/insights
    ?metric=reach,impressions,profile_views,follower_count
    &period=day
    &access_token=TOKEN
```

**Instagram — seguidores totais:**
```
GET /{ig-user-id}?fields=followers_count,media_count&access_token=TOKEN
```

**Posts e métricas por post:**
```
GET /{ig-user-id}/media?fields=caption,media_type,timestamp,
    insights.metric(reach,likes,comments,saved,shares)&access_token=TOKEN
```

**Meta Ads — investimento, ROAS, conversões:**
```
GET /act_{ad-account-id}/insights
    ?fields=campaign_name,spend,impressions,clicks,actions,action_values,
    purchase_roas&date_preset=last_30d&level=campaign&access_token=TOKEN
```

---

## Passo 7 — Plugar no dashboard

Quando tiver **token + IG ID + Ad Account ID**, me mande aqui no chat:
> "Já tenho o token da Meta" + os 3 valores

Eu ativo o módulo de **sincronização automática** (uma função que chama esses
endpoints e grava nas mesmas tabelas que a entrada manual usa). A partir daí o
painel atualiza sozinho e você pode definir a frequência (ex.: a cada hora).

> ⚠️ **Segurança:** o token dá acesso às suas contas. Nunca poste em local público.
> No dashboard ele fica guardado só no seu navegador / no seu Supabase privado.
