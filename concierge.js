(() => {
  const docs = [
    ...helpTopics,
    ...products.map(([name, type, , cost, profile]) => [
      name + " " + type,
      `${name} coûte ${price(cost)} dans la boutique de démonstration. Il figure dans la sélection « ${profile} ».`,
      "boutique",
    ]),
    ...styles.map(([name, , desc, brief]) => [
      name,
      `${name} : ${desc} ${brief}`,
      "inspiration",
    ]),
  ];
  const stop = new Set(
    "de des du le la les l je j un une mon ma mes a au aux en pour avec est ce que qui quoi comment vous me moi quel quelle quels quelles sur il elle ai puis et plus cheveux voudrais besoin sont fait cest combien coute prix".split(
      " ",
    ),
  );
  const words = (t) =>
    [
      ...new Set(
        t
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .match(/[a-z0-9]+/g) || [],
      ),
    ]
      .filter((x) => !stop.has(x))
      .map((x) => x.replace(/s$/, ""));
  const index = docs.map((d) => words(d[0]));
  // Session-only context: resolve « il coûte combien ? » without storing messages.
  let lastProduct = null,
    pending = null;
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/g, "oe")
      .replace(/[’'-]/g, " ")
      .replace(
        /\b(?:shampoo?ing|shampoin|shampouin|shampoin[gq]s?)\b/g,
        "shampoing",
      )
      .replace(/\b(?:cheuveux|cheveuxx|cheveuxs)\b/g, "cheveux")
      .replace(/\b(?:combient|cmb)\b/g, "combien")
      .replace(/\b(?:masqe|mask)\b/g, "masque")
      .replace(/\b(?:bjr|slt|cc)\b/g, "salut")
      .replace(/[^a-z0-9€,\. ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const intentOf = (q) =>
    /combien de temps|temps de pose/.test(q)
      ? "use"
      : /prix|tarif|coute|combien|cher|vaut/.test(q)
        ? "price"
        : /utilis|appliqu|mettre|emploi|mode d|quand|comment (on |je )?(le |la |l )?(met|fait|utilis)|sert|rinc/.test(
              q,
            )
          ? "use"
          : /pour qui|convient|quel profil/.test(q)
            ? "profile"
            : null;
  function productAnswer(i, intent) {
    lastProduct = i;
    pending = null;
    const [name, , , cost, profile] = products[i];
    return [
      intent === "use"
        ? `${name} : ${productNotes[i][1]}`
        : intent === "profile"
          ? `${name} figure dans la sélection « ${profile} ». ${productNotes[i][0]}`
          : intent === "price"
            ? `${name} coûte ${price(cost)}.`
            : `${name} : ${productNotes[i][0]} Son prix est de ${price(cost)}.`,
      "boutique",
    ];
  }
  function direct(text) {
    const q = normalize(text).replace(/[.,]+$/, "");
    const faq = (i, product = null) => {
      pending = null;
      lastProduct = product;
      return helpTopics[i].slice(1);
    };
    if (
      /\b(allerg|ingredient|composition|inci|parfum|sulfate|silicone|vegan|bio\b)/.test(
        q,
      )
    )
      return faq(11);
    if (
      /\b(plaie|eczema|douleur|chute|demange|pelade|perds mes cheveux)/.test(q)
    )
      return faq(12);
    if (
      /^(salut|bonjour|hello|bonsoir|coucou|hey)( (toi|a vous|ca va))*$/.test(
        q,
      ) ||
      /^ca va$/.test(q)
    )
      return [
        "Bonjour ! Vous pouvez me demander un prix, un geste de soin ou comment utiliser la boutique.",
        null,
      ];
    if (
      /^(merci|cool merci|super merci|merci beaucoup|merci bien|merci a toi)$/.test(
        q,
      )
    )
      return ["Avec plaisir !", null];
    if (
      /qui (a |vous a )?(cree|creer|fait|fonde)|qui etes vous|qui se cache|c est quoi new h|qu est ce que new h/.test(
        q,
      )
    )
      return faq(0);
    if (
      /\b(aide|aider)\b|que (peux|sais) tu faire/.test(q) &&
      q.split(" ").length < 9
    )
      return [
        "Je peux comparer les prix, expliquer comment appliquer un soin ou vous guider dans le diagnostic. Par exemple : « Quel soin à moins de 20 € ? »",
        null,
      ];
    if (/favori|petit coeur/.test(q))
      return [
        "Touchez le cœur sur une fiche produit. Retrouvez ensuite votre sélection dans « Mes favoris » sur ce navigateur.",
        "favoris",
      ];
    if (/panier/.test(q) && !/payer|paiement/.test(q))
      return [
        `Votre panier contient ${cart.length} article(s), pour ${price(total())}. Ouvrez « Mon panier » pour changer une quantité. Pour ajouter un soin, ouvrez sa fiche dans la boutique.`,
        "boutique",
      ];
    if (/livr|expedi|colis|delai|rembours|payer|paiement|paye/.test(q))
      return faq(8);
    if (/connect|inscri|mot de passe|historique|mon compte/.test(q))
      return faq(9);
    if (/diagnostic|questionnaire|test capillaire/.test(q)) {
      if (/prix|payant|gratuit|coute/.test(q))
        return [
          "Le diagnostic est gratuit : vous pouvez répondre aux questions sans payer ni créer de compte.",
          "diagnostic",
        ];
      return faq(1);
    }
    if (/est ce (un |une )?(vrai|vraie)|vraiment debite|carte bancaire/.test(q))
      return faq(8);
    if (/horaires?|ouvert|adresse du magasin/.test(q))
      return [
        "New H’air est un site de démonstration. Je n’ai pas de boutique physique ni d’horaires confirmés à vous indiquer.",
        "accueil",
      ];
    if (/combien de (produits|soins)|nombre de produits/.test(q))
      return [
        `La boutique présente ${products.length} soins, du shampoing aux produits coiffants.`,
        "boutique",
      ];
    if (/combien de questions/.test(q)) return faq(1);
    const amount =
      q.match(
        /(?:moins de|sous|jusqu a|budget(?: de)?|maximum(?: de)?|max(?: de)?)\s*(\d+(?:[.,]\d+)?)/,
      ) ||
      q.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?)\s*(?:max|maximum|de budget)/);
    if (amount || /moins cher|petit prix|pas cher/.test(q)) {
      const sorted = products.slice().sort((a, b) => a[3] - b[3]);
      const limit = amount ? Number(amount[1].replace(",", ".")) : sorted[0][3];
      const matches = sorted.filter((p) =>
        /moins de|sous /.test(q) ? p[3] < limit : p[3] <= limit,
      );
      return [
        matches.length
          ? matches
              .map((p) => `${p[0]} : ${price(p[3])} (${p[4]})`)
              .join(" ; ") + "."
          : "Aucun soin du catalogue ne correspond à ce budget. Le premier prix est " +
            price(sorted[0][3]) +
            ".",
        "boutique",
      ];
    }
    const intent = intentOf(q);
    let candidates = products.map((p, i) => ({
      i,
      name: normalize(p[0]),
      type: normalize(p[1]),
    }));
    const contains = (s) => (" " + q + " ").includes(" " + s + " ");
    let hit = candidates.find((p) => contains(p.name));
    if (!hit) {
      const matches = candidates
        .filter((p) => contains(p.type))
        .sort((a, b) => b.type.length - a.type.length);
      if (matches.length) {
        const same = matches.filter((x) => x.type === matches[0].type);
        if (same.length > 1) {
          const chosen = same.find(
            (x) =>
              contains(normalize(products[x.i][0]).split(" ").pop()) ||
              contains(normalize(products[x.i][4])),
          );
          if (chosen) hit = chosen;
          else {
            pending = { ids: same.map((x) => x.i), intent: intent || "info" };
            lastProduct = null;
            return [
              "Lequel vous intéresse : " +
                same.map((x) => products[x.i][0]).join(" ou ") +
                " ?",
              "boutique",
            ];
          }
        } else hit = matches[0];
      }
    }
    if (!hit && pending?.ids) {
      const i = pending.ids.find(
        (i) =>
          contains(normalize(products[i][0]).split(" ").pop()) ||
          contains(normalize(products[i][4])),
      );
      if (i !== undefined) hit = candidates[i];
    }
    if (hit) return productAnswer(hit.i, intent || pending?.intent || "info");
    if (
      intent &&
      lastProduct !== null &&
      /^(et |il |elle |son |ca |comment |combien |pour qui|a quoi|le prix|quel est son)/.test(
        q,
      )
    )
      return productAnswer(lastProduct, intent);
    if (
      intent &&
      /prix|tarif|ca coute combien|combien ca coute|combien coute/.test(q)
    ) {
      pending = { intent };
      lastProduct = null;
      return [
        "De quel soin souhaitez-vous connaître le prix ? Par exemple : masque nutritif, huile sublime ou gel définition.",
        "boutique",
      ];
    }
    if (/vendez|vos produits|catalogue|proposez|quoi acheter/.test(q))
      return [
        "Notre catalogue comprend " +
          products.map((p) => p[0]).join(", ") +
          ". De quel soin voulez-vous parler ?",
        "boutique",
      ];
    if (/\b(secs?|seches?|abimes?|cassants?|deshydrates?)\b/.test(q)) {
      lastProduct = 0;
      return [
        helpTopics[2][1] + " Une piste du catalogue : le Masque nutritif.",
        "diagnostic",
      ];
    }
    if (/\b(gras|grasses?|regraiss\w*)\b/.test(q)) return faq(3);
    if (/boucl|frisott|ondule/.test(q)) {
      return faq(4, 4);
    }
    if (/\b(fins?|plats?|volume)\b/.test(q)) return faq(5);
    if (/conseill|recommand|quel soin|mes cheveux|besoin d aide/.test(q))
      return [
        "Pour vous orienter, quel est votre besoin principal : des pointes sèches, des racines grasses, du volume ou des boucles mieux définies ? Vous pouvez aussi faire le diagnostic complet.",
        "diagnostic",
      ];
    return null;
  }
  function reply(text) {
    const handled = direct(text);
    if (handled) return handled;
    pending = null;
    lastProduct = null;
    const query = words(text);
    let best = -1,
      score = 0;
    index.forEach((keys, i) => {
      const hit = query.filter((k) => keys.includes(k));
      const value =
        (hit.reduce(
          (v, k) =>
            v +
            Math.log(
              1 + docs.length / index.filter((d) => d.includes(k)).length,
            ),
          0,
        ) /
          Math.pow(keys.length, 0.18)) *
        Math.sqrt(hit.length / Math.max(1, query.length));
      if (value > score) {
        score = value;
        best = i;
      }
    });
    return best < 0 || score < 1.1
      ? [
          "Je réponds aux questions sur New H’air. Essayez « Mes pointes sont sèches », « Prix du masque nutritif » ou « Comment payer ? ».",
          null,
        ]
      : docs[best].slice(1);
  }
  const box = document.querySelector("#chatbox"),
    trigger = document.querySelector("#chatTrigger"),
    form = document.querySelector("#askChat"),
    field = form.elements.question,
    log = document.querySelector("#chatlog");
  function bubble(text, role, target) {
    const div = document.createElement("div");
    div.className = "bubble " + role;
    div.textContent = text;
    if (target) {
      const a = document.createElement("a");
      a.textContent = "Ouvrir : " + pages[ids.indexOf(target)] + " →";
      a.href = "#" + target;
      a.onclick = () => toggle(false);
      div.append(a);
    }
    log.append(div);
    log.scrollTop = log.scrollHeight;
  }
  function send(text) {
    if (!text.trim()) return;
    bubble(text, "client");
    const [msg, target] = reply(text);
    bubble(msg, "guide", target);
    field.value = "";
    field.focus();
  }
  function toggle(show) {
    box.hidden = !show;
    trigger.setAttribute("aria-expanded", show);
    (show ? field : trigger).focus();
  }
  const compact = () =>
    trigger.classList.toggle("compact", window.scrollY > 48);
  compact();
  window.addEventListener("scroll", compact, { passive: true });
  trigger.onclick = () => toggle(box.hidden);
  document.querySelector("#closeChat").onclick = () => toggle(false);
  box.onkeydown = (e) => {
    if (e.key === "Escape") toggle(false);
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    send(field.value.trim());
  };
  box
    .querySelectorAll("[data-prompt]")
    .forEach((btn) => (btn.onclick = () => send(btn.textContent)));
  // Reveal each new section as it enters the viewport, including after hash navigation.
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && Element.prototype.animate) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          io.unobserve(target);
          if (!motion.matches)
            target.animate(
              [
                { opacity: 0.4, transform: "translateY(16px)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 470, easing: "cubic-bezier(.2,.75,.2,1)" },
            );
        }),
      { threshold: 0.03 },
    );
    const watch = () => {
      io.disconnect();
      content
        .querySelectorAll(
          ":scope > .sectionhead,:scope > .looks,:scope > .promo,:scope > .grid,.hero > div",
        )
        .forEach((el) => io.observe(el));
    };
    watch();
    new MutationObserver(watch).observe(content, { childList: true });
  }
})();
