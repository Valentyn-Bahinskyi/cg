// Valentyn Bahinskyi — данные витрины
const DEFAULT_DATA = {
  name: "Valentyn Bahinskyi",
  role: "3D Artist · Hard Surface · Game-Ready Assets",
  about: "Creating detailed PBR 3D models for games, visualization and digital environments.",
  avatar: "img/avatar.jpg",
  links: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    art3d: "https://artstation.com/",
    art2d: "https://artstation.com/",
    fab: "https://fab.com/",
    unity: "https://assetstore.unity.com/",
    cgtrader: "https://cgtrader.com/",
    turbosquid: "https://turbosquid.com/"
  },
  works: [
    {
      title: "Sci-Fi Generator Unit",
      tags: "Hard Surface · PBR · Game-Ready · 4K",
      images: [
        "img/work1_1.jpg",
        "img/work1_2.jpg",
        "img/work1_3.jpg"
      ],
      stores: [
        { label: "FAB", url: "https://fab.com/" },
        { label: "CGTrader", url: "https://cgtrader.com/" },
        { label: "Unity Asset Store", url: "https://assetstore.unity.com/" }
      ]
    },
    {
      title: "Tactical Drone MK-II",
      tags: "Hard Surface · Low-poly + High-poly · Rigged",
      images: [
        "img/work2_1.jpg",
        "img/work2_2.jpg",
        "img/work2_3.jpg"
      ],
      stores: [
        { label: "FAB", url: "https://fab.com/" },
        { label: "CGTrader", url: "https://cgtrader.com/" },
        { label: "Unity Asset Store", url: "https://assetstore.unity.com/" }
      ]
    },
    {
      title: "Industrial Environment Pack",
      tags: "Environment · Modular · Unreal + Unity",
      images: [
        "img/work3_1.jpg",
        "img/work3_2.jpg",
        "img/work3_3.jpg"
      ],
      stores: [
        { label: "FAB", url: "https://fab.com/" },
        { label: "CGTrader", url: "https://cgtrader.com/" },
        { label: "Unity Asset Store", url: "https://assetstore.unity.com/" }
      ]
    }
  ]
};

const KEY = "vb_site_v1";

function getBase() {
  try {
    if (typeof window !== "undefined" && window.SITE_CONFIG) return structuredClone(window.SITE_CONFIG);
  } catch {}
  return structuredClone(DEFAULT_DATA);
}

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

function loadData() {
  const base = getBase();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = safeParse(raw);
    if (!saved) return base;
    // глубокий мерж для links
    const merged = base;
    Object.assign(merged, saved);
    if (saved.links) merged.links = { ...base.links, ...saved.links };
    if (Array.isArray(saved.works)) merged.works = saved.works;
    return merged;
  } catch (e) {
    console.warn("localStorage недоступен:", e);
    return base;
  }
}

function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn("Не могу сохранить:", e);
    return false;
  }
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function cleanUrl(u) {
  u = String(u || "").trim();
  if (!u) return "";
  // убираем переносы строк внутри (если вставили несколько ссылок без запятой)
  u = u.replace(/\s+/g, "");
  if (!u) return "";
  return u;
}

function parseList(str) {
  // делим по переносам строк; по запятой делим только обычные URL,
  // data:image/... трогать нельзя — там запятая часть формата
  const out = [];
  String(str || "").split(/\n+/).forEach((line) => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith("data:")) { const u = cleanUrl(line); if (u) out.push(u); return; }
    line.split(/,+/).forEach((part) => { const u = cleanUrl(part); if (u) out.push(u); });
  });
  return out;
}

// --- карусель: одно большое фото + стрелки ---
function initCarousels(root) {
  (root || document).querySelectorAll(".carousel").forEach((car) => {
    if (car.dataset.ready === "1") return;
    car.dataset.ready = "1";
    let imgs = [];
    try { imgs = JSON.parse(car.dataset.images || "[]"); } catch { imgs = []; }
    if (!imgs.length) {
      const im = car.querySelector("img");
      if (im && im.src) imgs = [im.src];
    }
    if (!imgs.length) return;
    let idx = 0;
    const imgEl = car.querySelector("img");
    const prev = car.querySelector(".prev");
    const next = car.querySelector(".next");
    const counter = car.querySelector(".counter");
    const dotsBox = car.querySelector(".dots");

    function renderDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = "";
      if (imgs.length <= 1) { dotsBox.style.display = "none"; return; }
      dotsBox.style.display = "";
      imgs.forEach((_, i) => {
        const d = document.createElement("i");
        if (i === idx) d.className = "active";
        d.addEventListener("click", () => { idx = i; update(); });
        dotsBox.appendChild(d);
      });
    }
    function update() {
      imgEl.src = imgs[idx];
      if (counter) counter.style.display = imgs.length <= 1 ? "none" : "";
      if (counter) counter.textContent = (idx + 1) + " / " + imgs.length;
      if (dotsBox) dotsBox.querySelectorAll("i").forEach((d, i) => d.classList.toggle("active", i === idx));
      // стрелок нет если фото одно; на первом нет "назад", на последнем нет "вперёд"
      if (prev) prev.style.display = (imgs.length <= 1 || idx === 0) ? "none" : "";
      if (next) next.style.display = (imgs.length <= 1 || idx === imgs.length - 1) ? "none" : "";
    }
    if (prev) prev.onclick = (e) => { e.preventDefault(); if (idx > 0) { idx--; update(); } };
    if (next) next.onclick = (e) => { e.preventDefault(); if (idx < imgs.length - 1) { idx++; update(); } };

    // свайп пальцем (без зацикливания)
    let sx = 0;
    car.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    car.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) {
        if (dx < 0 && idx < imgs.length - 1) idx++;
        else if (dx > 0 && idx > 0) idx--;
        update();
      }
    }, { passive: true });

    renderDots();
    update();
  });
}

function applyLinks(data) {
  const get = (key, oldSel) =>
    document.querySelector(`[data-link='${key}']`) || document.querySelector(oldSel);
  const pairs = [
    ["instagram", "#socialRow a[title='Instagram']"],
    ["youtube", "#socialRow a[title='YouTube']"],
    ["art3d", "#socialRow a[data-key='art3d']"],
    ["art2d", "#socialRow a[data-key='art2d']"],
    ["fab", "#storesRow a[title='Fab']"],
    ["unity", "#storesRow a[title='Unity Asset Store']"],
    ["cgtrader", "#storesRow a[title='CGTrader']"],
    ["turbosquid", "#storesRow a[title='TurboSquid']"],
  ];
  pairs.forEach(([key, oldSel]) => {
    const a = get(key, oldSel);
    if (a && data.links[key]) a.href = data.links[key];
  });
}

function renderWorks(data) {
  const wrap = document.getElementById("works");
  const fallback = document.getElementById("worksFallback");
  if (!wrap) return;

  // чистим и проверяем работы — битые картинки не должны убивать всю витрину
  const valid = (data.works || []).map((w) => ({
    title: w.title || "Untitled",
    images: (w.images || []).map(cleanUrl).filter(Boolean),
    stores: (w.stores || []).filter((s) => s && (s.label || s.url)),
  })).filter((w) => w.images.length || w.title);

  // если после сохранения всё пустое/битое — показываем фолбэк, а не пустоту
  if (!valid.length || !valid.some((w) => w.images.length)) {
    if (fallback) fallback.style.display = "";
    wrap.innerHTML = "";
    initCarousels(document);
    return;
  }

  if (fallback) fallback.style.display = "none";
  wrap.innerHTML = "";

  valid.forEach((w) => {
    const imgs = w.images.length ? w.images : ["img/placeholder.svg"];
    const stores = w.stores.map((s) => `<a href="${esc(s.url)}" target="_blank">${esc(s.label)}</a>`).join("");
    const art = document.createElement("article");
    art.className = "work-flat";
    art.innerHTML = `
      <div class="carousel">
        <button class="car-btn prev" type="button" aria-label="Previous">‹</button>
        <img src="${esc(imgs[0])}" alt="${esc(w.title)}" />
        <button class="car-btn next" type="button" aria-label="Next">›</button>
        <div class="counter">1 / ${imgs.length}</div>
        <div class="dots"></div>
      </div>
      <div class="work-info">
        <h3>${esc(w.title)}</h3>
        <div class="buy-links"><span>Buy on:</span>${stores}</div>
      </div>`;
    wrap.appendChild(art);

    // карусель через замыкание — не зависит от data-images, не ломается от кавычек
    let idx = 0;
    const imgEl = art.querySelector("img");
    const prev = art.querySelector(".prev");
    const next = art.querySelector(".next");
    const counter = art.querySelector(".counter");
    const dotsBox = art.querySelector(".dots");
    function paint() {
      imgEl.src = imgs[idx];
      if (counter) counter.style.display = imgs.length <= 1 ? "none" : "";
      if (counter) counter.textContent = (idx + 1) + " / " + imgs.length;
      if (dotsBox) dotsBox.querySelectorAll("i").forEach((d, i) => d.classList.toggle("active", i === idx));
      if (prev) prev.style.display = (imgs.length <= 1 || idx === 0) ? "none" : "";
      if (next) next.style.display = (imgs.length <= 1 || idx === imgs.length - 1) ? "none" : "";
    }
    if (dotsBox) {
      dotsBox.innerHTML = "";
      if (imgs.length <= 1) dotsBox.style.display = "none";
      else imgs.forEach((_, i) => {
        const d = document.createElement("i");
        if (i === 0) d.className = "active";
        d.addEventListener("click", () => { idx = i; paint(); });
        dotsBox.appendChild(d);
      });
    }
    if (prev) prev.onclick = (e) => { e.preventDefault(); if (idx > 0) { idx--; paint(); } };
    if (next) next.onclick = (e) => { e.preventDefault(); if (idx < imgs.length - 1) { idx++; paint(); } };
    let sx = 0;
    const car = art.querySelector(".carousel");
    car.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    car.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) {
        if (dx < 0 && idx < imgs.length - 1) idx++;
        else if (dx > 0 && idx > 0) idx--;
        paint();
      }
    }, { passive: true });
    car.dataset.ready = "1"; // чтобы общий initCarousels ниже не перетирал эту карусель в режим "1 фото"
    paint();
  });
}

// запуск на главной
(function main() {
  if (!document.getElementById("works")) return; // мы в admin.html
  const data = loadData();
  document.title = (data.name || "3D Artist") + " — 3D Artist";
  const nameEl = document.getElementById("artistName");
  const roleEl = document.getElementById("artistRole");
  const aboutEl = document.getElementById("artistAbout");
  const avatarEl = document.getElementById("avatar");
  if (nameEl && data.name) nameEl.textContent = data.name;
  if (roleEl && data.role) roleEl.textContent = data.role;
  if (aboutEl && data.about) aboutEl.textContent = data.about;
  if (avatarEl && data.avatar) avatarEl.src = data.avatar;
  applyLinks(data);
  renderWorks(data);
  // на случай если работ нет в #works (старый кэш) — инициализируем фолбэк-карусели
  initCarousels(document);
})();
