/**
 * Camada de dados do catálogo.
 *
 * A planilha do Google é a fonte inicial, consumida pelo endpoint público
 * `gviz` (JSON, somente leitura, sem chave de API). A interface nunca toca
 * a estrutura física da planilha: tudo passa pelo modelo `Perfume` abaixo,
 * o que permite trocar a fonte por um banco ou API própria no futuro sem
 * reconstruir o frontend.
 *
 * Modelo:
 *   Perfume {
 *     id: string
 *     slug: string            // chave de junção com o perfil olfativo
 *     brand: string
 *     name: string            // nome sem marca nem volumetria
 *     fullName: string        // linha original da planilha
 *     volume?: string         // ex.: "100ml"
 *     concentration?: string  // ex.: "EDP", "Extrait" (quando presente no nome)
 *     isTester?: boolean
 *     price?: number          // em reais
 *     priceFormatted?: string
 *     status?: string         // ex.: "NOVO"
 *     // vindos de fragrances.js (perfil olfativo apurado nos sites oficiais):
 *     image?: string
 *     family?: string
 *     perfumer?: string
 *     source?: string
 *     notes?: { top: string[], heart: string[], base: string[] }
 *     mainNotes?: string[]    // quando a marca não divulga pirâmide
 *   }
 *
 * Nenhum campo é inventado: só existe no modelo o que existe na fonte.
 */
import { CONFIG } from "./config.js";
import { FRAGRANCES } from "./fragrances.js";

const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${CONFIG.sheet.id}/gviz/tq?tqx=out:json&gid=${CONFIG.sheet.gid}`;
const CACHE_KEY = "jgg-catalog-v2";

/** Snapshot local usado como fallback quando a planilha está inacessível. */
const FALLBACK_ROWS = [
  ["Boadicea The Victorious - Rose Sapphire 100ml", "R$ 2.790,00", "NOVO"],
  ["Boadicea The Victorious - Knight of Love 100ml", "R$ 2.090,00", "NOVO"],
  ["Boadicea The Victorious - Amber Sapphire 100ml", "R$ 2.790,00", "NOVO"],
  ["Cirque du Soleil - L’eau Parfum 100ml", "R$ 1.080,00", "NOVO"],
  ["Gritti - Chantilly EDP 100ml", "R$ 940,00", "NOVO"],
  ["Gritti - Mango Aoud Extrait 100ml", "R$ 1.100,00", "NOVO"],
  ["Histoires De Parfums - 1740 120ml", "R$ 850,00", "NOVO"],
  ["Initio - Oud for Greatness Neo 90ml", "R$ 1.430,00", "NOVO"],
  ["Initio - Wild Rush tester 90ml", "R$ 1.650,00", "NOVO"],
  ["Mizensir - For Your Love EDP 100ml", "R$ 880,00", "NOVO"],
  ["Mizensir - Tonic Water EDP 100ml", "R$ 850,00", "NOVO"],
  ["Omanluxury - Dejan 100ml", "R$ 1.690,00", "NOVO"],
  ["Parfums d’Elmar - Zaya 60ml", "R$ 1.380,00", "NOVO"],
  ["Ramon Monegal - Matador 50ml", "R$ 1.150,00", "NOVO"],
  ["Sospiro - Farsa 75ml", "R$ 950,00", "NOVO"],
  ["Unique’E Luxury - Chocolate Makes Me Happy 100ml", "R$ 1.090,00", "NOVO"],
];

/**
 * Somente marcadores inequívocos de concentração. "Parfum" sozinho fica de
 * fora de propósito: em nomes como "L’eau Parfum" ele faz parte do nome da
 * fragrância, e removê-lo inventaria uma informação que a fonte não dá.
 */
const CONCENTRATIONS = [
  ["extrait de parfum", "Extrait"],
  ["extrait", "Extrait"],
  ["eau de parfum", "EDP"],
  ["edp", "EDP"],
  ["eau de toilette", "EDT"],
  ["edt", "EDT"],
  ["elixir", "Elixir"],
];

function parsePrice(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return undefined;
  const digits = raw.replace(/[^\d,\.]/g, "");
  if (!digits) return undefined;
  const value = parseFloat(digits.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

/** Normaliza texto em slug: sem acentos, apóstrofos curvos ou pontuação. */
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Converte uma linha da planilha ("Marca - Nome Volume", valor, status) no modelo Perfume. */
function toPerfume(rawName, rawPrice, rawStatus, index) {
  if (typeof rawName !== "string") return null;
  const fullName = rawName.trim();
  const price = parsePrice(rawPrice);
  // Linhas sem preço são notas informativas da planilha, não produtos.
  if (!fullName || price === undefined) return null;

  const sep = fullName.indexOf(" - ");
  const brand = sep > 0 ? fullName.slice(0, sep).trim() : "";
  let name = sep > 0 ? fullName.slice(sep + 3).trim() : fullName;

  let volume;
  const volMatch = name.match(/(\d+(?:[.,]\d+)?\s?ml)\s*$/i);
  if (volMatch) {
    volume = volMatch[1].replace(/\s+/g, "").toLowerCase();
    name = name.slice(0, volMatch.index).trim();
  }

  let concentration;
  const lower = ` ${name.toLowerCase()} `;
  for (const [token, label] of CONCENTRATIONS) {
    const re = new RegExp(`\\b${token}\\b`, "i");
    if (re.test(lower)) {
      concentration = label;
      name = name.replace(re, "").replace(/\s{2,}/g, " ").trim();
      break;
    }
  }

  let isTester = false;
  if (/\btester\b/i.test(name)) {
    isTester = true;
    name = name.replace(/\btester\b/i, "").replace(/\s{2,}/g, " ").trim();
  }

  const status =
    typeof rawStatus === "string" && rawStatus.trim() ? rawStatus.trim() : undefined;

  // Junção com o perfil olfativo apurado nos sites oficiais das marcas.
  const slug = slugify(`${brand} ${name}`);
  const profile = FRAGRANCES[slug];
  if (!profile) {
    console.info(
      `Perfil olfativo ausente para "${fullName}". ` +
        `Adicione a chave "${slug}" em js/fragrances.js.`
    );
  }

  return {
    id: `p${index}-${slug}`,
    slug,
    brand,
    name,
    fullName,
    volume,
    concentration,
    isTester,
    price,
    priceFormatted: brl.format(price),
    status,
    ...profile,
  };
}

function parseRows(rows) {
  return rows
    .map((r, i) => toPerfume(r[0], r[1], r[2], i))
    .filter(Boolean);
}

function parseGviz(text) {
  // Resposta no formato: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Resposta inesperada da planilha");
  const payload = JSON.parse(text.slice(start, end + 1));
  const rows = (payload.table?.rows ?? []).map((row) =>
    (row.c ?? []).map((cell) => (cell ? cell.f ?? cell.v : null))
  );
  return parseRows(rows);
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, perfumes } = JSON.parse(raw);
    if (Date.now() - at > CONFIG.sheet.cacheTtl) return null;
    return perfumes;
  } catch {
    return null;
  }
}

function writeCache(perfumes) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), perfumes }));
  } catch {
    /* armazenamento indisponível — segue sem cache */
  }
}

/**
 * Carrega o catálogo: cache → planilha ao vivo → snapshot local.
 * Retorna { perfumes, source } com source em "cache" | "live" | "fallback".
 */
export async function loadCatalog() {
  const cached = readCache();
  if (cached?.length) return { perfumes: cached, source: "cache" };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(GVIZ_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const perfumes = parseGviz(await res.text());
    if (!perfumes.length) throw new Error("Planilha sem produtos reconhecíveis");
    writeCache(perfumes);
    return { perfumes, source: "live" };
  } catch (err) {
    console.warn("Catálogo: usando snapshot local.", err);
    return { perfumes: parseRows(FALLBACK_ROWS), source: "fallback" };
  }
}
