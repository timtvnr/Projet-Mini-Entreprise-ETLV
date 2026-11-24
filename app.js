const pages = [
    "Notre histoire",
    "Boutique",
    "Mon diagnostic",
    "Coiffeurs spécialisés",
    "Photo inspi",
    "Partenaires",
    "Application mobile",
    "Mes favoris",
  ],
  ids = [
    "accueil",
    "boutique",
    "diagnostic",
    "coiffeurs",
    "inspiration",
    "partenaires",
    "application",
    "favoris",
  ],
  ico = [
    "house",
    "store",
    "clipboard-list",
    "map-pin",
    "images",
    "handshake",
    "smartphone",
    "heart",
  ],
  I = (n) => `<i data-i="${n}"></i>`,
  draw = () =>
    document
      .querySelectorAll("[data-i]")
      .forEach((e) => (e.innerHTML = icons[e.dataset.i] || "")),
  A = (t, id, c = "cta") =>
    `<a class="${c}" href="#${id}">${t} ${I("arrow-right")}</a>`;
const products = [
  ["Masque nutritif", "Masque", "masque", 24, "Cheveux bouclés", "€€"],
  ["Shampoing douceur", "Shampoing", "shampoing", 16, "Cheveux lisses", "€"],
  ["Huile sublime", "Huile", "huile", 29, "Cheveux colorés", "€€€"],
  [
    "Après-shampoing soyeux",
    "Après-shampoing",
    "conditioner",
    19,
    "Senior",
    "€€",
  ],
  ["Gel définition", "Gel", "gel", 14, "Cheveux bouclés", "€"],
  ["Cire modelante", "Cire", "cire", 18, "Homme", "€€"],
  ["Poudre volume", "Poudre", "poudre", 17, "Homme", "€"],
  ["Shampoing délicat", "Shampoing", "bebe", 12, "Bébé", "€"],
]; // Keep the demo usable when browser storage is blocked or contains stale values.
const memoryData = new Map();
function load(key) {
  if (memoryData.has(key)) return memoryData.get(key);
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function store(key, value) {
  memoryData.set(key, value);
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* session fallback */
  }
}
function list(key, valid) {
  try {
    const a = JSON.parse(load(key));
    return Array.isArray(a) ? a.filter(valid) : [];
  } catch {
    return [];
  }
}
const validProduct = (n) => Number.isInteger(n) && !!products[n];
let cart = list("cart", validProduct),
  fav = list("fav", validProduct);
const profiles = [
  "Cheveux bouclés",
  "Cheveux lisses",
  "Cheveux colorés",
  "Homme",
  "Bébé",
  "Senior",
];
const productNotes = [
  [
    "Un masque pour envelopper les longueurs en manque de souplesse.",
    "Après le lavage, répartissez sur les longueurs, laissez poser selon la notice puis rincez.",
  ],
  [
    "Une base lavante pour le rituel du quotidien.",
    "Massez le cuir chevelu mouillé avec la pulpe des doigts, puis rincez.",
  ],
  [
    "Une huile de finition pour lisser visuellement les pointes.",
    "Chauffez une goutte entre les mains et effleurez les longueurs.",
  ],
  [
    "Un soin à rincer pour faciliter le démêlage.",
    "Distribuez sur les demi-longueurs humides, démêlez puis rincez.",
  ],
  [
    "Un gel coiffant pour dessiner les mèches.",
    "Sur cheveux humides, froissez les boucles puis laissez sécher.",
  ],
  [
    "Une cire pour modeler une coupe courte.",
    "Travaillez une noisette entre les doigts puis modelez les mèches sèches.",
  ],
  [
    "Une poudre coiffante pour donner du relief en racines.",
    "Déposez une touche à la racine sur cheveux secs et répartissez du bout des doigts.",
  ],
  [
    "Un shampoing présenté dans la gamme bébé de démonstration.",
    "Un adulte applique et rince le produit en suivant les indications de la notice.",
  ],
];
// Intrinsic dimensions reserve space before lazy-loaded photos arrive.
function photoSize(key) {
  const portrait = ["afro", "carre", "poudre", "rideau", "tresses"].includes(
    key,
  );
  return portrait
    ? 'width="667" height="1000"'
    : `width="1100" height="${["hero", "pixie", "cire", "bebe"].includes(key) ? 733 : 825}"`;
}
function cards(arr) {
  return (
    arr
      .map((p) => {
        let n = products.indexOf(p);
        return `<article class="card"><div class="photo"><img loading="lazy" ${photoSize(p[2])} src="assets/${p[2]}.webp" alt="${p[0]}" onclick="detail(${n})">${[0, 2].includes(n) ? '<span class="badge">Nouveauté</span>' : ""}<button aria-label="Favori : ${p[0]}" aria-pressed="${fav.includes(n)}" class="fav ${fav.includes(n) ? "on" : ""}" onclick="favorite(${n},this)">${I("heart")}</button></div><div class="info"><span class="eyebrow">${p[1].toUpperCase()}</span><h3><a href="#" onclick="detail(${n});return false">${p[0]}</a></h3><span class="muted">${price(p[3])}</span></div></article>`;
      })
      .join("") || "<p>Aucun soin ne correspond à ces filtres.</p>"
  );
}
function favorite(n, b) {
  fav = fav.includes(n) ? fav.filter((i) => i !== n) : [...fav, n];
  store("fav", JSON.stringify(fav));
  b.classList.toggle("on", fav.includes(n));
  b.setAttribute("aria-pressed", String(fav.includes(n)));
  if (location.hash === "#favoris") render();
}
const head = (k, t) => `<div class="eyebrow">${k}</div><h2>${t}</h2>`,
  banner = `<div class="promo appbanner"><span class="symbol">${I("smartphone")}</span><div>${head("NEW H’AIR MOBILE", "Votre routine à portée de main")}</div>${A("Découvrir l’application", "application", "link")}</div>`,
  select = (a, t) =>
    `<select aria-label="${t}" onchange="filter()"><option value="">${t}</option>${a.map((x) => `<option>${x}</option>`).join("")}</select>`;
const portraits = [["hero","Les boucles libres"],["rideau","Le mouvement rideau"],["afro","Le volume naturel"]];
function portraitMarkup(){return `<div class="portrait" role="region" aria-label="Carnet de textures"><div class="portrait-images">${portraits.map(([img,label],i)=>`<img src="assets/${img}.webp" alt="${label}" width="720" height="540" aria-hidden="${i!==0}" class="${i===0?"shown":""}">`).join("")}</div><div class="portrait-bar"><div><small>CARNET DE TEXTURES</small><strong data-caption>01 / 03 · ${portraits[0][1]}</strong></div><div class="portrait-controls"><button data-play aria-label="Mettre le diaporama en pause">Ⅱ</button><button data-next aria-label="Portrait suivant">→</button></div></div></div>`;}
function home() {
  return `<section class="origin-cover"><div class="origin-copy"><span class="eyebrow">NEW H’AIR &nbsp; / &nbsp; NOTRE HISTOIRE</span><h1>Quatre prénoms,<br><em>une même idée.</em></h1><p>Et si choisir un soin commençait par comprendre ses cheveux, plutôt que par remplir son panier ? C’est la question qui nous a réunis.</p><div class="byline">Pauline · Cameron · Louise · Timothée</div></div>${portraitMarkup()}</section>
<section class="letter"><div>${head("LE MOT DE L’ÉQUIPE", "Pourquoi New H’air ?")}</div><div><p>Entre deux shampoings qui se ressemblent et des conseils qui se contredisent, il n’est pas toujours facile de savoir par où commencer. Nous avons créé cette mini-entreprise pour rendre ce choix plus simple.</p><p>Notre point de départ, ce sont les gestes du quotidien : démêler ses pointes, préserver une boucle ou se coiffer avant de partir. Nous voulons que chacun puisse trouver une routine adaptée à ses cheveux, à son temps et à son budget.</p></div></section>
<section class="intentions">${head("NOTRE FEUILLE DE ROUTE", "Ce que nous voulons changer")}<div class="grid">${[
    [
      "01",
      "Comprendre avant d’acheter",
      "Des questions concrètes sur vos habitudes, pour expliquer chaque geste conseillé.",
      "Découvrir le diagnostic",
      "diagnostic",
    ],
    [
      "02",
      "Choisir sans se perdre",
      "Un catalogue lisible, avec des filtres par soin, par profil et par prix.",
      "Parcourir les soins",
      "boutique",
    ],
    [
      "03",
      "Oser en parler au salon",
      "Des photos de coupes et les mots pour expliquer à un coiffeur ce que vous imaginez.",
      "Feuilleter le carnet",
      "inspiration",
    ],
  ]
    .map(
      ([n, t, p, l, id]) =>
        `<article><span class="folio">${n} /</span><h3>${t}</h3><p>${p}</p>${A(l, id, "link")}</article>`,
    )
    .join(
      "",
    )}</div></section><div class="team-sign"><span class="eyebrow">LES CRÉATEURS DE NEW H’AIR</span><p>Pauline, Cameron, Louise <em>&</em> Timothée</p></div>`;
}
function filter() {
  let [t, p, v] = [...document.querySelectorAll("select")].map((x) => x.value);
  catalog.innerHTML = cards(
    products.filter(
      (x) => (!t || x[1] === t) && (!p || x[4] === p) && (!v || x[5] === v),
    ),
  );
  draw();
}
function pop(s) {
  inside.innerHTML = s;
  inside.querySelector("h2").id = "modalTitle";
  if (!modal.open) modal.showModal();
  draw();
}
function detail(n) {
  let p = products[n];
  pop(
    `<span class="eyebrow">${p[1]}</span><h2>${p[0]}</h2><img class="detailphoto" ${photoSize(p[2])} src="assets/${p[2]}.webp" alt="${p[0]}"><p>${productNotes[n][0]}</p><p><strong>Pour qui ?</strong> ${p[4]}.</p><p><strong>Le geste :</strong> ${productNotes[n][1]}</p><b>${price(p[3])}</b><br><button class="cta" onclick="cart.push(${n});save();bag()">Ajouter au panier</button>`,
  );
}
function save() {
  store("cart", JSON.stringify(cart));
  if (count.textContent !== String(cart.length)) {
    count.textContent = cart.length;
    if (count.animate && matchMedia('(prefers-reduced-motion: no-preference)').matches)
      count.animate([{ transform:'scale(.85)' },{ transform:'scale(1.22)',offset:.45 },{ transform:'scale(1)' }],{duration:350});
  }
}
function locate(lat, lon) {
  map.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.02}%2C${lon + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lon}`;
}
function findPosition() {
  const note = document.getElementById("msg");
  const fail = () => {
    if (note.isConnected)
      note.textContent =
        "Localisation indisponible. Vous pouvez déplacer la carte manuellement.";
  };
  if (!navigator.geolocation) return fail();
  navigator.geolocation.getCurrentPosition(
    (p) => {
      if (note.isConnected) {
        locate(p.coords.latitude, p.coords.longitude);
        note.textContent = "Carte centrée sur votre position.";
      }
    },
    fail,
    { timeout: 10000 },
  );
}
function render() {
  let n = Math.max(0, ids.indexOf(location.hash.slice(1)));
  if (modal.open) modal.close();
  crumb.textContent = pages[n];
  document.title = pages[n] + " · New H’air";
  nav.innerHTML = pages
    .map((p, i) =>
      [5, 6].includes(i)
        ? ""
        : `<a ${i === n ? 'aria-current="page"' : ""} class="${i === n ? "active" : ""}" href="#${ids[i]}">${I(ico[i])}${p}</a>`,
    )
    .join("");
  content.innerHTML = [
    home,
    () =>
      head("NOS SOINS", "La boutique") +
      `<div class="filters">${select([...new Set(products.map((x) => x[1]))], "Types de soins")}${select(profiles, "Tous les profils")}${select(["€", "€€", "€€€"], "Tous les prix")}</div><div class="grid" id="catalog">${cards(products)}</div>`,
    () =>
      head("CONSEIL PERSONNALISÉ", "Mon diagnostic") +
      '<div class="panel" id="quiz"></div>',
    () =>
      head("AUTOUR DE VOUS", "Coiffeurs spécialisés") +
      `<div class="panel"><iframe title="Carte des environs" id="map"></iframe><button class="cta" onclick="findPosition()">Me localiser</button><p id="msg">Carte centrée sur Lyon. Découvrez les <a href="https://www.google.com/maps/search/coiffeur+spécialisé+cheveux+bouclés+Lyon" target="_blank" rel="noopener">salons pour cheveux bouclés à Lyon ↗</a>.</p></div>`,
    styleGallery,
    () =>
      head("COLLABORATIONS", "Espace partenaires") +
      '<div class="panel"><span class="eyebrow">ESPACE PUBLICITAIRE</span><h2>À la rencontre des professionnels</h2><p>Cet espace est réservé aux futures collaborations avec les salons et les marques de soins capillaires.</p></div>',
    () =>
      head("FOR YOUR HAIR", "L’application New H’air") +
      '<div class="panel"><span class="eyebrow">BIENTÔT DISPONIBLE</span><h2>Vos soins vous suivent partout.</h2><p>L’application mobile sera prochainement disponible au téléchargement. En attendant, découvrez votre routine sur le site.</p>' +
      A("Découvrir ma routine", "diagnostic") +
      "</div>",
    () =>
      head("MON CARNET", "Mes favoris") +
      (fav.length
        ? `<div class="grid">${cards(fav.map((i) => products[i]))}</div>`
        : `<p class="guideintro">Touchez le cœur sur une fiche pour garder vos soins ici.</p>${A("Explorer la boutique", "boutique")}`),
  ][n]();
  if (n === 2) openQuiz();
  if (n === 3) locate(45.76, 4.835);
  draw();
  window.scrollTo(0, 0);
  content.dispatchEvent(new Event("nh:page"));
}
window.onhashchange = () => {
  render();
  if (crumb.animate && matchMedia('(prefers-reduced-motion: no-preference)').matches)
    crumb.animate([{opacity:.3,transform:'translateX(10px)'},{opacity:1,transform:'none'}],{duration:280,easing:'ease-out'});
};
save();

const styles = [
  [
    "Boucles au naturel",
    "hero",
    "Des boucles libres dont on conserve le ressort.",
    "Demandez une forme qui respecte le retrait de vos boucles au séchage.",
    "coiffeur boucles",
  ],
  [
    "Le carré graphique",
    "carre",
    "Une ligne de coupe nette qui souligne la mâchoire.",
    "Montrez où vous voulez que la ligne du carré arrive une fois sèche.",
    "coupe carré",
  ],
  [
    "Les tresses sculptées",
    "tresses",
    "Des mèches entrelacées pour dessiner un motif.",
    "Précisez la taille des tresses et demandez une tension confortable.",
    "tresses afro",
  ],
  [
    "La coupe pixie",
    "pixie",
    "Une coupe courte à la nuque, avec du relief sur le dessus.",
    "Choisissez la longueur que vous voulez garder sur le front et autour des oreilles.",
    "coupe pixie",
  ],
  [
    "Le dégradé à frange rideau",
    "rideau",
    "Des mèches de différentes longueurs et une frange qui s’ouvre autour du visage.",
    "Indiquez où vous voulez que la mèche la plus courte tombe.",
    "frange rideau dégradé",
  ],
  [
    "L’afro arrondi",
    "afro",
    "Une silhouette ronde qui met en valeur le volume des cheveux crépus.",
    "Discutez de la hauteur et du volume à conserver sur les côtés.",
    "coupe afro naturelle",
  ],
];
function styleGallery() {
  return (
    head("LE GUIDE DES FORMES", "Le carnet des coupes & coiffures") +
    '<p class="guideintro">Une coupe change la forme des cheveux ; une coiffure change la façon de les porter. Explorez les deux et gardez les bons mots pour votre prochain rendez-vous.</p><div class="grid stylegrid">' +
    styles
      .map(
        ([t, img, desc, brief, key]) =>
          `<article class="card"><div class="photo"><img loading="lazy" ${photoSize(img)} src="assets/${img}.webp" alt="${t}"></div><div class="info"><span class="eyebrow">${img === "tresses" ? "COIFFURE TRESSÉE" : "FORME & TEXTURE"}</span><h3>${t}</h3><p>${desc}</p><details><summary>Les mots à dire au salon</summary><p>${brief}</p></details><a class="cta" target="_blank" rel="noopener" href="https://www.google.com/maps/search/${encodeURIComponent(key + " Lyon")}">Trouver un spécialiste ↗</a></div></article>`,
      )
      .join("") +
    '</div><p class="guideintro">Pour aller plus loin : quelle frange selon la forme du visage ? <a href="https://www.franckprovost-expert.com/le-mag-expert/coiffure/quelle-frange-selon-la-forme-de-mon-visage_a1086">Lire le guide Franck Provost</a></p>'
  );
}

// A disclosure menu avoids horizontal navigation on handheld screens.
const mobileMenuButton = document.getElementById("mobileMenu");
function setMobileMenu(open) {
  mobileMenuButton.setAttribute("aria-expanded", String(open));
}
mobileMenuButton.addEventListener("click", () =>
  setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") === "false"),
);
document.querySelector("aside").addEventListener("click", (event) => {
  if (event.target.closest("a")) setMobileMenu(false);
});
window.addEventListener("hashchange", () => setMobileMenu(false));
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    mobileMenuButton.offsetWidth &&
    mobileMenuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMobileMenu(false);
    mobileMenuButton.focus();
  }
});
// Soft keyboards can resize only the visual viewport, notably in Safari.
if (window.visualViewport) {
  function syncViewport() {
    const view = window.visualViewport;
    document.documentElement.style.setProperty(
      "--visible-height",
      `${view.height}px`,
    );
    document.documentElement.style.setProperty(
      "--keyboard-gap",
      `${Math.max(0, window.innerHeight - view.height - view.offsetTop)}px`,
    );
  }
  visualViewport.addEventListener("resize", syncViewport);
  visualViewport.addEventListener("scroll", syncViewport);
  syncViewport();
}
