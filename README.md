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
| Fotos e pirâmide olfativa | [`js/fragrances.js`](js/fragrances.js) |
| Snapshot de fallback do catálogo | [`js/data.js`](js/data.js) (`FALLBACK_ROWS`) |
| Modalidades de envio e seguros | [`index.html`](index.html), seção "Entrega & Segurança" |

**Não há variáveis de ambiente nem chaves de API.** A planilha é lida pelo
endpoint público somente-leitura `gviz` do Google Sheets — nenhuma credencial
existe no frontend, por decisão de segurança.

## Arquitetura

```
index.html         — estrutura semântica de todas as seções
css/styles.css     — design system (paleta mineral, Fraunces + Inter, reveals)
js/config.js       — contatos, fontes de dados e links
js/data.js         — camada de dados: planilha → modelo Perfume (+ cache + fallback)
js/fragrances.js   — perfil olfativo e foto de cada fragrância
js/videos.js       — curadoria editorial de vídeos (mantida manualmente)
js/app.js          — renderização, busca, filtros, drawer, microinterações
assets/perfumes/   — fotos oficiais normalizadas (WebP 900×900)
.claude/serve.mjs  — servidor estático de desenvolvimento
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

### Perfil olfativo e fotos

A planilha traz preço e disponibilidade; a foto e a composição de cada
fragrância vivem em [`js/fragrances.js`](js/fragrances.js), apuradas nos
**sites oficiais das marcas** (o campo `source` de cada item registra a
fonte, e ela aparece creditada no rodapé do painel de detalhes). A junção
entre as duas fontes é feita por um slug de "marca + nome", o que mantém a
planilha livre para mudar volumetria ou preço sem quebrar o vínculo.

Regras que o arquivo segue, alinhadas ao briefing:

- Quando a marca divulga a pirâmide, usamos `notes` (saída/coração/fundo).
- Quando ela publica só uma lista de notas — caso da Initio — usamos
  `mainNotes`, em vez de forjar uma pirâmide que a marca não declarou.
- Percentuais de acordes **não** são exibidos: nenhuma marca oficial publica
  esses números, e estimá-los seria inventar dado.
- Campo ausente simplesmente não aparece na interface.

**Para adicionar um perfume novo à planilha:** abra o site com o console
aberto. Se faltar o perfil, o console informa exatamente qual chave criar
em `fragrances.js`. As fotos ficam em `assets/perfumes/` como WebP 900×900
(as originais das marcas somam 4,8 MB; normalizadas, 384 KB no total).

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
