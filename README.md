# João Gabriel Gomes — Landing Page de Perfumaria

Boutique digital de perfumaria de nicho: catálogo a pronta entrega carregado
da planilha do Google, curadoria de vídeos do canal, simulação de pagamento,
informações de entrega e atendimento pelo WhatsApp — em uma única experiência.

## Como rodar

É um site 100% estático, sem build e sem dependências. Basta servir a pasta
por qualquer servidor HTTP (módulos ES não funcionam abrindo o arquivo direto):

```bash
node .claude/serve.mjs
```

e abrir <http://127.0.0.1:8734>. Qualquer outro servidor estático também serve.

## Publicação

Hospede a pasta inteira em qualquer serviço de site estático — Netlify,
Vercel, Cloudflare Pages ou GitHub Pages (arraste a pasta ou aponte o repo).
Nada precisa ser compilado. Após publicar:

1. Defina a tag `<link rel="canonical">` em `index.html` com o domínio final.
2. Se quiser, gere `sitemap.xml`/`robots.txt` apontando para o domínio.

## Onde cada coisa é configurada

| O que | Onde |
|---|---|
| Número do WhatsApp e mensagens | [`js/config.js`](js/config.js) |
| Planilha do catálogo (ID/aba) | [`js/config.js`](js/config.js) |
| Link do canal e do simulador | [`js/config.js`](js/config.js) |
| Vídeos em destaque | [`js/videos.js`](js/videos.js) |
| Snapshot de fallback do catálogo | [`js/data.js`](js/data.js) (`FALLBACK_ROWS`) |
| Modalidades de envio e seguros | [`index.html`](index.html), seção "Entrega & Segurança" |

**Não há variáveis de ambiente nem chaves de API.** A planilha é lida pelo
endpoint público somente-leitura `gviz` do Google Sheets — nenhuma credencial
existe no frontend, por decisão de segurança.

## Arquitetura

```
index.html        — estrutura semântica de todas as seções
css/styles.css    — design system (paleta mineral, Fraunces + Inter, reveals)
js/config.js      — contatos, fontes de dados e links
js/data.js        — camada de dados: planilha → modelo Perfume (+ cache + fallback)
js/videos.js      — curadoria editorial de vídeos (mantida manualmente)
js/app.js         — renderização, busca, filtros, drawer, microinterações
.claude/serve.mjs — servidor estático de desenvolvimento
```

### Fluxo de dados do catálogo

1. `loadCatalog()` tenta o cache de sessão (10 min), depois a planilha ao
   vivo, depois o snapshot local — nesta ordem. A interface nunca quebra se a
   planilha estiver fora do ar; apenas exibe a última seleção conhecida com um
   aviso discreto.
2. Cada linha `"Marca - Nome Volume" | valor | status` vira um objeto
   `Perfume` (`brand`, `name`, `volume`, `concentration?`, `isTester?`,
   `price`, `status`). Campos ausentes na planilha simplesmente não são
   exibidos — nada é inventado (por isso não há perfil olfativo hoje: a
   planilha não traz esses dados; quando trouxer, o modelo já comporta).
3. Para migrar para um banco/API no futuro, basta trocar a implementação de
   `loadCatalog()` — nenhum componente depende da estrutura da planilha.

### Vídeos

O feed do YouTube não permite leitura direta pelo navegador (CORS) e o
briefing pede curadoria editorial, não uma grade automática. A lista vive em
`js/videos.js` (ID + título + categoria + descrição); a thumbnail vem do
próprio YouTube. Evolução natural: um endpoint de servidor consultando a
YouTube Data API (a chave ficaria no servidor, nunca no frontend).

### Segurança

- Nenhuma credencial no frontend; planilha acessada em modo somente leitura.
- Todo dado externo entra no DOM via `textContent` — nunca `innerHTML`.
- IDs de vídeo validados por regex antes de montar URLs.
- Links externos com `rel="noopener noreferrer"`; WhatsApp via
  `wa.me` + `encodeURIComponent`, sem dados do usuário na URL.

### Acessibilidade e performance

HTML semântico, navegação por teclado (drawer com foco contido e Esc),
`aria-live` nos resultados de busca, `prefers-reduced-motion` respeitado em
todas as animações, imagens `loading="lazy"`, fontes com `display=swap`,
zero dependências de JavaScript de terceiros.
