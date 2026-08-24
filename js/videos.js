/**
 * Curadoria editorial de vídeos do canal.
 *
 * Lista mantida manualmente por decisão de arquitetura: o feed do YouTube
 * não permite leitura direta pelo navegador (CORS) e o briefing pede uma
 * seleção editorial, não uma grade automática. Para atualizar, basta trocar
 * os IDs e títulos abaixo — a thumbnail é obtida automaticamente do YouTube.
 *
 * Futuramente, esta lista pode ser substituída por um endpoint próprio que
 * consulte a YouTube Data API no servidor (nunca no frontend).
 */
export const FEATURED_VIDEOS = [
  {
    id: "pcmQggCS_mk",
    title:
      "Quer saber qual é o problema do Ombre Nomade? Você não consegue passar despercebido usando ele.",
    category: "Resenha",
    description: "Uma análise sincera de um dos ouds mais comentados da alta perfumaria.",
  },
  {
    id: "Cw2zYy4NhDk",
    title: "Baccarat Rouge 540 Eau de Parfum vs Extrait: qual vale mais a pena?",
    category: "Comparativo",
    description: "As duas concentrações do ícone da Maison Francis Kurkdjian, lado a lado.",
  },
  {
    id: "hhcWh87UgS4",
    title: "Lótus: a nota rara da perfumaria!",
    category: "Educacional",
    description: "Um mergulho em uma das notas mais raras e delicadas da perfumaria.",
  },
  {
    id: "8EKWx77e0SY",
    title: "Esse perfume é simplesmente nuclear.",
    category: "Resenha",
    description: "Quando projeção e fixação passam de qualquer expectativa.",
  },
  {
    id: "mr4_Aos9MBY",
    title: "Erba Pura Mágica é o melhor?",
    category: "Resenha",
    description: "O lançamento da Xerjoff à prova: evolução ou apenas variação?",
  },
  {
    id: "6UH7ZLn3_fI",
    title: "Você provavelmente venderia mais decants se soubesse disso...",
    category: "Educacional",
    description: "Bastidores e estratégia para quem vive a perfumaria além do frasco.",
  },
];
