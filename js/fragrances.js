/**
 * Enriquecimento editorial das fragrâncias: imagem, família olfativa,
 * pirâmide e perfumista.
 *
 * A planilha é a fonte de preço e disponibilidade; este arquivo é a fonte
 * do perfil olfativo. Todos os dados foram apurados nos sites oficiais das
 * marcas — nada aqui é inventado. Quando a marca divulga apenas uma lista
 * de notas, sem separar em saída/coração/fundo (caso da Initio), usamos
 * `mainNotes` em vez de forjar uma pirâmide.
 *
 * A chave de cada item é o slug de "marca + nome" gerado por `slugify()`
 * em data.js. Para adicionar um perfume novo: rode o site, abra o console
 * e veja o aviso com o slug esperado.
 */
export const FRAGRANCES = {
  "boadicea-the-victorious-rose-sapphire": {
    image: "assets/perfumes/rose-sapphire.webp",
    family: "Floral Especiado",
    source: "boadiceaperfume.com",
    notes: {
      top: ["Cardamomo", "Cúrcuma", "Gerânio", "Açafrão"],
      heart: ["Rosa Turca", "Helicriso", "Neroli", "Hedione"],
      base: ["Benjoim", "Cedro", "Labdanum", "Mirra", "Cypriol", "Patchouli", "Almíscares"],
    },
  },

  "boadicea-the-victorious-knight-of-love": {
    image: "assets/perfumes/knight-of-love.webp",
    family: "Amadeirado",
    perfumer: "Christian Provenzano",
    source: "boadiceaperfume.com",
    notes: {
      top: ["Cardamomo", "Zimbro", "Pimenta Rosa", "Frutas Vermelhas", "Bergamota"],
      heart: ["Cashmeran", "Magnólia", "Violeta", "Rosa Damascena"],
      base: ["Âmbar", "Couro", "Musgo", "Tabaco", "Baunilha", "Sândalo", "Benjoim"],
    },
  },

  "boadicea-the-victorious-amber-sapphire": {
    image: "assets/perfumes/amber-sapphire.webp",
    family: "Ambarado",
    source: "boadiceaperfume.com",
    notes: {
      top: ["Bergamota", "Cassis", "Canela", "Madeira Cítrica", "Rum"],
      heart: ["Rosa", "Jasmim Indiano", "Magnólia", "Lentisco"],
      base: ["Cedro", "Cashmeran", "Oud do Camboja", "Fava Tonka", "Baunilha"],
    },
  },

  "cirque-du-soleil-l-eau-parfum": {
    image: "assets/perfumes/leau-de-parfum.webp",
    family: "Floral Frutado Gourmand",
    perfumer: "Alexis Grugeon",
    source: "parfumcirquedusoleil.com",
    notes: {
      top: ["Algodão-doce", "Maçã Vermelha", "Bergamota"],
      heart: ["Pipoca", "Manteiga", "Frésia", "Pétalas de Íris"],
      base: ["Caramelo", "Fava de Baunilha", "Âmbar", "Sândalo"],
    },
  },

  "gritti-chantilly": {
    image: "assets/perfumes/chantilly.webp",
    family: "Gourmand Frutado",
    perfumer: "Luca Gritti",
    source: "grittifragrances.com",
    notes: {
      top: ["Melão", "Morango", "Bergamota"],
      heart: ["Maçã", "Coco", "Flor de Cassis"],
      base: ["Baunilha", "Notas Pudradas", "Almíscar"],
    },
  },

  "gritti-mango-aoud": {
    image: "assets/perfumes/mango-aoud.webp",
    family: "Frutado Amadeirado",
    perfumer: "Luca Gritti",
    source: "grittifragrances.com",
    notes: {
      top: ["Manga", "Goiaba", "Neroli"],
      heart: ["Leite de Coco", "Osmanthus", "Ylang-Ylang"],
      base: ["Oud", "Âmbar", "Baunilha"],
    },
  },

  "histoires-de-parfums-1740": {
    image: "assets/perfumes/1740.webp",
    family: "Amadeirado Especiado · Couro",
    source: "histoiresdeparfums.com",
    notes: {
      top: ["Bergamota", "Davana"],
      heart: ["Patchouli", "Coentro", "Cardamomo"],
      base: ["Cedro", "Bétula", "Labdanum", "Couro", "Baunilha", "Elemi", "Imortelle"],
    },
  },

  "initio-oud-for-greatness-neo": {
    image: "assets/perfumes/oud-for-greatness-neo.webp",
    family: "Amadeirado Aromático",
    source: "initioparfums.com",
    // A Initio divulga as notas sem separar em pirâmide.
    mainNotes: ["Oud", "Bergamota", "Lavanda Orpur®", "Açafrão", "Bálsamo de Abeto", "Almíscar"],
  },

  "initio-wild-rush": {
    image: "assets/perfumes/wild-rush.webp",
    family: "Fougère Aromático",
    source: "initioparfums.com",
    mainNotes: ["Bergamota", "Lavanda", "Baunilha", "Caramelo", "Frutas Vermelhas", "Sândalo", "Patchouli"],
  },

  "mizensir-for-your-love": {
    image: "assets/perfumes/for-your-love.webp",
    family: "Almiscarado Frutado",
    perfumer: "Alberto Morillas",
    source: "mizensirparfums.com",
    notes: {
      top: ["Framboesa", "Exaltone® (almíscar)"],
      heart: ["Cachalox® (acorde âmbar-amadeirado)"],
      base: ["Essência de Benjoim", "Coração de Patchouli"],
    },
  },

  "mizensir-tonic-water": {
    image: "assets/perfumes/tonic-water.webp",
    family: "Fresco Marinho",
    source: "mizensirparfums.com",
    notes: {
      top: ["Calone", "Essência de Pimenta de Sichuan", "Essência de Cardamomo"],
      heart: ["Ambrox", "Cetalox", "Cachalox"],
      base: ["Resinoide de Incenso", "Cypriol", "Absoluto de Baunilha", "Norlimbanol"],
    },
  },

  "omanluxury-dejan": {
    image: "assets/perfumes/dejan.webp",
    family: "Amadeirado",
    perfumer: "Dominique Ropion",
    source: "omanluxury.store",
    notes: {
      top: ["Acorde de Água de Rosas de Jabal Akhdar"],
      heart: ["Cypriol", "Cisto", "Labdanum"],
      base: ["Almíscar", "Âmbar", "Oud"],
    },
  },

  "parfums-d-elmar-zaya": {
    image: "assets/perfumes/zaya.webp",
    family: "Ambarado Gourmand",
    perfumer: "Christian Carbonnel",
    source: "parfumsdelmar.com",
    notes: {
      top: ["Bergamota", "Conhaque", "Mel", "Maçã", "Noz-moscada"],
      heart: ["Canela", "Absoluto de Carvalho", "Âmbar", "Absoluto de Fava Tonka", "Tâmara"],
      base: ["Baunilha", "Praliné", "Benjoim Siam", "Sândalo"],
    },
  },

  "ramon-monegal-matador": {
    image: "assets/perfumes/matador.webp",
    family: "Couro",
    source: "ramonmonegal.com",
    notes: {
      top: ["Cominho", "Pera", "Olíbano"],
      heart: ["Rosa", "Maracujá", "Magnólia", "Jasmim"],
      base: ["Couro", "Coco", "Sândalo", "Almíscar"],
    },
  },

  "sospiro-farsa": {
    image: "assets/perfumes/farsa.webp",
    family: "Amadeirado Oriental",
    perfumer: "Anne-Louise Gautier",
    source: "sospirointernational.com",
    notes: {
      top: ["Açafrão", "Pimenta Rosa", "Rum", "Cassis"],
      heart: ["Âmbar", "Cedro", "Cacau", "Gerânio"],
      base: ["Patchouli", "Oud", "Âmbar Cinzento", "Almíscar"],
    },
  },

  "unique-e-luxury-chocolate-makes-me-happy": {
    image: "assets/perfumes/chocolate-makes-me-happy.webp",
    family: "Gourmand Cítrico",
    source: "uniqueeluxury.com",
    notes: {
      top: ["Cacau", "Chocolate Amargo", "Lavanda", "Tangerina", "Toranja"],
      heart: ["Gengibre", "Benjoim", "Canela", "Labdanum", "Olíbano"],
      base: ["Cacau", "Caramelo", "Âmbar", "Vetiver", "Sândalo", "Almíscar"],
    },
  },
};
