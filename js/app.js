/**
 * Orquestração da interface: catálogo, busca, filtros, drawer de detalhes,
 * vídeos, navegação e microinterações. Todo conteúdo dinâmico é inserido
 * via textContent / createElement — nunca innerHTML com dados externos.
 */
import { CONFIG } from "./config.js";
import { loadCatalog } from "./data.js";
import { FEATURED_VIDEOS } from "./videos.js";

const $ = (sel, root = document) => root.querySelector(sel);

/* ── Links de contato ─────────────────────────────────────── */

function waUrl(message) {
  return `https://wa.me/${CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

function productMessage(perfume) {
  const nome = [perfume.brand, perfume.name].filter(Boolean).join(" ");
  return CONFIG.whatsapp.productMessage
    .replace("[NOME]", nome)
    .replace("[VOLUME]", perfume.volume ?? "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function wireStaticLinks() {
  const generic = waUrl(CONFIG.whatsapp.genericMessage);
  $("#contact-whatsapp").href = generic;
  $("#footer-whatsapp").href = generic;
  $("#shipping-cta").href = waUrl(
    "Olá! Gostaria de consultar as opções de envio disponíveis."
  );
  $("#channel-link").href = CONFIG.youtube.channelUrl;
  $("#footer-youtube").href = CONFIG.youtube.channelUrl;
  $("#simulator-link").href = CONFIG.simulator.url;
}

/* ── Header e navegação mobile ────────────────────────────── */

function initHeader() {
  const header = $("#site-header");
  const toggle = $("#nav-toggle");
  const menu = $("#nav-menu");

  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("is-open", !open);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.matches("a")) closeMenu();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* ── Revelação por scroll ─────────────────────────────────── */

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
);

function observeReveals(root = document) {
  root.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    // Elementos já em viewport entram imediatamente (com a transição),
    // sem depender do timing do IntersectionObserver.
    if (el.getBoundingClientRect().top < innerHeight * 0.95) {
      setTimeout(() => el.classList.add("is-visible"), 60);
    } else {
      revealObserver.observe(el);
    }
  });
}

/* ── Visual editorial por perfume ─────────────────────────── */

/** Gradiente mineral determinístico por marca — discreto, nunca chamativo. */
const BRAND_TONES = [
  ["#ece5d8", "#dfd4bf"], // areia
  ["#e9e4dd", "#d8d0c4"], // pedra
  ["#eae3d9", "#d9c9b2"], // âmbar claro
  ["#e6e4e0", "#d2cfc9"], // grafite claro
  ["#ece7dc", "#ddd2bd"], // marfim
  ["#e8e2da", "#d5c8b8"], // castanho suave
];

function toneFor(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.codePointAt(0)) % 997;
  return BRAND_TONES[h % BRAND_TONES.length];
}

function buildVisual(perfume, className) {
  const visual = document.createElement("div");
  visual.className = className;
  const [a, b] = toneFor(perfume.brand || perfume.name);
  visual.style.background = `linear-gradient(150deg, ${a}, ${b})`;
  const initial = document.createElement("span");
  initial.className = "perfume-initial";
  initial.setAttribute("aria-hidden", "true");
  initial.textContent = (perfume.brand || perfume.name).charAt(0).toUpperCase();
  visual.appendChild(initial);
  return visual;
}

/* ── Catálogo ─────────────────────────────────────────────── */

const state = {
  perfumes: [],
  query: "",
  brand: "",
  price: "",
};

function metaLine(p) {
  return [p.volume, p.concentration, p.isTester ? "Tester" : null]
    .filter(Boolean)
    .join(" · ");
}

function buildCard(perfume, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "perfume-card reveal";
  card.style.setProperty("--reveal-delay", `${Math.min(index % 6, 4) * 0.06}s`);
  card.setAttribute(
    "aria-label",
    `Ver detalhes de ${perfume.brand} ${perfume.name}`
  );

  const visual = buildVisual(perfume, "perfume-visual");
  if (perfume.status) {
    const badge = document.createElement("span");
    badge.className = "perfume-status";
    badge.textContent = perfume.status;
    visual.appendChild(badge);
  }
  card.appendChild(visual);

  const info = document.createElement("div");
  info.className = "perfume-info";

  const brand = document.createElement("span");
  brand.className = "perfume-brand";
  brand.textContent = perfume.brand;

  const name = document.createElement("span");
  name.className = "perfume-name";
  name.textContent = perfume.name;

  const meta = document.createElement("span");
  meta.className = "perfume-meta";
  meta.textContent = metaLine(perfume);

  const price = document.createElement("span");
  price.className = "perfume-price";
  price.textContent = perfume.priceFormatted ?? "";
  const priceNote = document.createElement("small");
  priceNote.textContent = "à vista · PIX ou TED";
  price.appendChild(priceNote);

  info.append(brand, name, meta, price);
  card.appendChild(info);

  card.addEventListener("click", () => openDrawer(perfume));
  return card;
}

function renderSkeletons(grid, count = 8) {
  grid.replaceChildren();
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "skeleton-card";
    sk.setAttribute("aria-hidden", "true");
    sk.innerHTML =
      '<div class="skeleton-block skeleton-visual"></div>' +
      '<div class="skeleton-block skeleton-line"></div>' +
      '<div class="skeleton-block skeleton-line"></div>';
    grid.appendChild(sk);
  }
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  return state.perfumes.filter((p) => {
    if (q) {
      const haystack = `${p.brand} ${p.name} ${p.concentration ?? ""} ${p.volume ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (state.brand && p.brand !== state.brand) return false;
    if (state.price) {
      const [min, max] = state.price.split("-").map(Number);
      if (p.price === undefined || p.price < min || p.price >= max) return false;
    }
    return true;
  });
}

function renderCatalog() {
  const grid = $("#catalog-grid");
  const empty = $("#catalog-empty");
  const count = $("#catalog-count");
  const results = applyFilters();

  grid.replaceChildren(...results.map((p, i) => buildCard(p, i)));
  observeReveals(grid);

  const filtering = state.query || state.brand || state.price;
  empty.hidden = results.length > 0;
  grid.hidden = results.length === 0;
  $("#filter-clear").hidden = !filtering;

  count.textContent =
    results.length === 0
      ? ""
      : filtering
        ? `${results.length} de ${state.perfumes.length} fragrâncias`
        : `${state.perfumes.length} fragrâncias a pronta entrega`;
}

function initCatalogTools() {
  const search = $("#search-input");
  const brandSel = $("#filter-brand");
  const priceSel = $("#filter-price");

  let debounce;
  search.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.query = search.value;
      renderCatalog();
    }, 120);
  });

  brandSel.addEventListener("change", () => {
    state.brand = brandSel.value;
    renderCatalog();
  });
  priceSel.addEventListener("change", () => {
    state.price = priceSel.value;
    renderCatalog();
  });

  const clear = () => {
    state.query = state.brand = state.price = "";
    search.value = "";
    brandSel.value = "";
    priceSel.value = "";
    renderCatalog();
  };
  $("#filter-clear").addEventListener("click", clear);
  $("#empty-clear").addEventListener("click", clear);
}

function populateBrandFilter() {
  const brandSel = $("#filter-brand");
  const brands = [...new Set(state.perfumes.map((p) => p.brand).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR")
  );
  for (const b of brands) {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    brandSel.appendChild(opt);
  }
}

async function initCatalog() {
  const grid = $("#catalog-grid");
  renderSkeletons(grid);
  const { perfumes, source } = await loadCatalog();
  state.perfumes = perfumes;
  populateBrandFilter();
  renderCatalog();

  if (source === "fallback") {
    const note = document.createElement("p");
    note.className = "catalog-note";
    note.textContent =
      "Exibindo a última seleção conhecida — valores e disponibilidade são confirmados no atendimento.";
    grid.insertAdjacentElement("afterend", note);
  }
}

/* ── Drawer de detalhes ───────────────────────────────────── */

let lastFocused = null;

function openDrawer(perfume) {
  const drawer = $("#drawer");
  const overlay = $("#drawer-overlay");
  const body = $("#drawer-body");
  lastFocused = document.activeElement;

  body.replaceChildren();

  body.appendChild(buildVisual(perfume, "drawer-visual"));

  const brand = document.createElement("p");
  brand.className = "drawer-brand";
  brand.textContent = perfume.brand;

  const title = document.createElement("h2");
  title.className = "drawer-title";
  title.id = "drawer-title";
  title.textContent = perfume.name;

  body.append(brand, title);

  const specs = document.createElement("div");
  specs.className = "drawer-specs";
  const chips = [
    perfume.volume,
    perfume.concentration,
    perfume.isTester ? "Tester" : null,
    perfume.status,
  ].filter(Boolean);
  for (const c of chips) {
    const chip = document.createElement("span");
    chip.className = "spec-chip";
    chip.textContent = c;
    specs.appendChild(chip);
  }
  if (chips.length) body.appendChild(specs);

  if (perfume.priceFormatted) {
    const price = document.createElement("p");
    price.className = "drawer-price";
    price.textContent = perfume.priceFormatted;
    const note = document.createElement("p");
    note.className = "drawer-price-note";
    note.textContent = "Valor para pagamento à vista (PIX e TED)";
    body.append(price, note);
  }

  body.appendChild(document.createElement("hr")).className = "drawer-divider";

  const payLabel = document.createElement("p");
  payLabel.className = "drawer-section-label";
  payLabel.textContent = "Pagamento";
  const payText = document.createElement("p");
  payText.className = "drawer-text";
  payText.textContent =
    "PIX, TED ou cartão de crédito — à vista ou parcelado via Mercado Pago, NuvemShop e Infinity Pay, com taxas e juros da plataforma.";
  body.append(payLabel, payText);

  body.appendChild(document.createElement("hr")).className = "drawer-divider";

  const shipLabel = document.createElement("p");
  shipLabel.className = "drawer-section-label";
  shipLabel.textContent = "Envio";
  const shipText = document.createElement("p");
  shipText.className = "drawer-text";
  shipText.textContent =
    "Envio para todo o Brasil com modalidades seguradas — Sedex, PAC, JadLog, Loggi e outras. Frete com seguro por conta do cliente.";
  body.append(shipLabel, shipText);

  const ctas = document.createElement("div");
  ctas.className = "drawer-ctas";

  const waBtn = document.createElement("a");
  waBtn.className = "btn btn--solid";
  waBtn.href = waUrl(productMessage(perfume));
  waBtn.target = "_blank";
  waBtn.rel = "noopener noreferrer";
  waBtn.textContent = "Tenho interesse";

  const simBtn = document.createElement("a");
  simBtn.className = "btn btn--ghost";
  simBtn.href = CONFIG.simulator.url;
  simBtn.target = "_blank";
  simBtn.rel = "noopener noreferrer";
  simBtn.textContent = "Simular pagamento";

  ctas.append(waBtn, simBtn);
  body.appendChild(ctas);

  drawer.hidden = false;
  overlay.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
  });
  document.body.classList.add("drawer-locked");
  $("#drawer-close").focus();
  drawer.scrollTop = 0;
}

function closeDrawer() {
  const drawer = $("#drawer");
  const overlay = $("#drawer-overlay");
  if (drawer.hidden) return;
  drawer.classList.remove("is-open");
  overlay.classList.remove("is-open");
  document.body.classList.remove("drawer-locked");
  const done = () => {
    drawer.hidden = true;
    overlay.hidden = true;
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  reduced ? done() : setTimeout(done, 560);
  lastFocused?.focus?.();
}

function initDrawer() {
  $("#drawer-close").addEventListener("click", closeDrawer);
  $("#drawer-overlay").addEventListener("click", closeDrawer);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
    // foco contido no drawer enquanto aberto
    if (e.key === "Tab" && !$("#drawer").hidden) {
      const focusables = $("#drawer").querySelectorAll(
        "button, a[href], [tabindex]:not([tabindex='-1'])"
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/* ── Vídeos ───────────────────────────────────────────────── */

function initVideos() {
  const grid = $("#videos-grid");
  FEATURED_VIDEOS.forEach((video, i) => {
    // aceita somente IDs válidos do YouTube — proteção contra dados malformados
    if (!/^[\w-]{11}$/.test(video.id)) return;

    const card = document.createElement("a");
    card.className = "video-card reveal";
    card.style.setProperty("--reveal-delay", `${(i % 3) * 0.08}s`);
    card.href = `https://www.youtube.com/watch?v=${video.id}`;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const thumb = document.createElement("div");
    thumb.className = "video-thumb";
    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 480;
    img.height = 270;
    const play = document.createElement("span");
    play.className = "video-play";
    play.setAttribute("aria-hidden", "true");
    play.innerHTML =
      '<svg viewBox="0 0 12 14"><path d="M0 0l12 7-12 7z" fill="#17161a"/></svg>';
    thumb.append(img, play);

    const info = document.createElement("div");
    info.className = "video-info";
    const cat = document.createElement("span");
    cat.className = "video-category";
    cat.textContent = video.category;
    const title = document.createElement("h3");
    title.className = "video-title";
    title.textContent = video.title;
    const desc = document.createElement("p");
    desc.className = "video-desc";
    desc.textContent = video.description;
    info.append(cat, title, desc);

    card.append(thumb, info);
    grid.appendChild(card);
  });
}

/* ── Parallax sutil no hero ───────────────────────────────── */

function initHeroParallax() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const content = $(".hero-content");
  const glows = document.querySelectorAll(".hero-glow");
  let ticking = false;
  addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight);
        content.style.transform = `translateY(${y * 0.18}px)`;
        content.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.85)));
        glows.forEach((g, i) => {
          g.style.translate = `0 ${y * (i ? 0.06 : 0.1)}px`;
        });
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* ── Bootstrap ────────────────────────────────────────────── */

wireStaticLinks();
initHeader();
initDrawer();
initVideos();
initCatalogTools();
initHeroParallax();
observeReveals();
initCatalog();
