const questions = [
  [
    "Votre matière",
    "Comment vos cheveux sèchent-ils à l’air libre ?",
    "Observez une mèche sans brushing ni produit coiffant.",
    ["Lisses", "Ondulés", "Bouclés", "Crépus"],
  ],
  [
    "Votre matière",
    "Entre deux doigts, comment sentez-vous une mèche ?",
    "On parle ici de l’épaisseur du cheveu, pas du volume de la chevelure.",
    [
      "À peine : elle est fine",
      "Légèrement : elle est moyenne",
      "Nettement : elle est épaisse",
    ],
  ],
  [
    "Vos racines",
    "Comment évoluent vos racines entre deux lavages ?",
    "Pensez à une semaine ordinaire plutôt qu’au lendemain d’une séance de sport.",
    [
      "Elles regraissent vite",
      "Elles restent confortables",
      "Elles tiraillent facilement",
    ],
  ],
  [
    "Vos longueurs",
    "Que remarquez-vous en démêlant vos pointes ?",
    "Le comportement des longueurs peut être différent de celui des racines.",
    [
      "Elles glissent facilement",
      "Elles font des nœuds",
      "Elles sont rêches ou cassantes",
    ],
  ],
  [
    "Votre rythme",
    "À quel rythme faites-vous votre shampoing ?",
    "Votre routine doit s’adapter à votre agenda, pas l’inverse.",
    [
      "Tous les jours ou presque",
      "Deux à trois fois par semaine",
      "Une fois par semaine ou moins",
    ],
  ],
  [
    "Vos habitudes",
    "Quelle technique fait partie de votre routine ?",
    "Si vous en utilisez plusieurs, choisissez la plus fréquente.",
    [
      "Brushing ou plaques",
      "Coloration ou décoloration",
      "Tresses ou coiffure protectrice",
      "Aucune de ces techniques",
    ],
  ],
  [
    "Vos soirées",
    "Comment portez-vous vos cheveux pour dormir ?",
    "Le geste du soir prépare aussi le coiffage du lendemain.",
    ["Détachés", "Attachés ou tressés", "Sous un bonnet ou un foulard"],
  ],
  [
    "Votre priorité",
    "Quel résultat aimeriez-vous retrouver le matin ?",
    "Choisissez le changement qui vous ferait le plus plaisir.",
    [
      "Des longueurs souples",
      "Du volume en racines",
      "Des boucles mieux définies",
      "Moins de frisottis",
    ],
  ],
  [
    "Votre temps",
    "Combien de temps avez-vous pour le soin après le lavage ?",
    "Nous ajusterons les étapes à votre disponibilité.",
    [
      "Express : 5 minutes",
      "Classique : 10 minutes",
      "Rituel : 20 minutes ou plus",
    ],
  ],
];
questions.push(
  [
    "Votre longueur",
    "Où arrivent vos pointes aujourd’hui ?",
    "Observez vos cheveux tels que vous les portez le plus souvent.",
    [
      "Au-dessus du menton",
      "Entre le menton et les épaules",
      "Sous les épaules",
    ],
  ],
  [
    "Votre densité",
    "Quand vous tracez une raie, que voyez-vous ?",
    "La densité décrit le nombre de cheveux, pas leur épaisseur.",
    [
      "Mon cuir chevelu est bien visible",
      "Une raie fine et régulière",
      "La raie se dessine difficilement",
    ],
  ],
  [
    "Votre séchage",
    "Après la douche, comment séchez-vous vos cheveux ?",
    "Choisissez la méthode que vous utilisez le plus.",
    ["À l’air libre", "Au diffuseur", "À la brosse et au sèche-cheveux"],
  ],
  [
    "Votre rendez-vous",
    "Qu’aimeriez-vous demander au salon ?",
    "Rien ne vous engage : cette envie nous aide à choisir une inspiration.",
    [
      "Raccourcir franchement",
      "Garder ma longueur",
      "Changer le mouvement autour du visage",
      "Découvrir une coiffure tressée",
    ],
  ],
  [
    "Votre style",
    "Quelle finition vous ressemble le plus ?",
    "Imaginez votre coiffure un matin ordinaire, sans occasion particulière.",
    [
      "Une ligne nette et graphique",
      "Un mouvement souple et naturel",
      "Un volume rond et affirmé",
    ],
  ],
);
const countQuestions = questions.length;
function restoreQuiz() {
  let raw;
  try {
    raw = JSON.parse(load("nhAnswers") || "[]");
  } catch {
    raw = [];
  }
  const valid = [];
  if (Array.isArray(raw))
    for (const [i, q] of questions.entries()) {
      if (!Number.isInteger(raw[i]) || raw[i] < 0 || raw[i] >= q[3].length)
        break;
      valid.push(raw[i]);
    }
  const pos = Number(load("nhStep"));
  return [
    valid,
    Number.isInteger(pos)
      ? Math.min(Math.max(0, pos), valid.length)
      : valid.length,
  ];
}
let [answers, step] = restoreQuiz();
function openQuiz() {
  step === countQuestions ? routine() : quiz();
}
function quizView() {
  return document.getElementById("quiz");
}
function persistQuiz() {
  store("nhAnswers", JSON.stringify(answers));
  store("nhStep", String(step));
}
function quiz() {
  const [theme, title, hint, opts] = questions[step],
    chapter = step < 4 ? 0 : step < 9 ? 1 : 2;
  const chapters = [
    "Observer sa matière",
    "Décrire ses gestes",
    "Dessiner son style",
  ];
  quizView().innerHTML = `<div class="quizside"><span class="tag">NEW H’AIR · CONSULTATION</span><div><span class="tag">LE CARNET PERSONNEL</span><h3>Le portrait<br><em>de vos cheveux.</em></h3><p>De la racine aux pointes, un parcours pour composer votre routine et préparer votre prochain rendez-vous.</p></div><ul>${chapters.map((c, i) => `<li class="${chapter === i ? "current" : ""}">${i < chapter ? "✓" : "•"} ${c}</li>`).join("")}</ul></div><form class="quizbody" id="questionForm"><div class="quizmeta"><span class="eyebrow">${theme.toUpperCase()}</span><strong>Question ${step + 1} sur ${countQuestions}</strong></div><progress aria-label="Question en cours" value="${step + 1}" max="${countQuestions}"></progress><fieldset><legend tabindex="-1">${title}</legend><p>${hint}</p><div class="choices">${opts.map((x, i) => `<label class="option"><input type="radio" name="response" value="${i}" ${answers[step] === i ? "checked" : ""} required><span>${x}</span></label>`).join("")}</div></fieldset><div class="quizcontrols"><button type="button" class="back" ${step ? "" : "disabled"} onclick="moveQuiz(-1)">← Retour</button><button class="cta" type="submit">${step === countQuestions - 1 ? "Voir mon carnet" : "Continuer"} →</button></div><small>Votre progression est enregistrée sur cet appareil.</small></form>`;
  const form = document.getElementById("questionForm");
  form.onchange = () => {
    answers[step] = Number(form.elements.response.value);
    persistQuiz();
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    if (form.elements.response.value !== "") {
      answers[step] = Number(form.elements.response.value);
      moveQuiz(1);
    }
  };
}
function moveQuiz(delta) {
  step = Math.min(countQuestions, Math.max(0, step + delta));
  persistQuiz();
  openQuiz();
  const el = quizView().querySelector("legend,.results h2");
  if (el) {
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
    if (el.getBoundingClientRect().top < 0)
      el.scrollIntoView({ block: "center" });
  }
}
function styleNotes() {
  const [len, density, dry, wish, finish] = answers.slice(9),
    look =
      wish === 3
        ? 2
        : wish === 2
          ? 4
          : wish === 0
            ? finish === 2
              ? 5
              : 3
            : finish === 0 && len < 2
              ? 1
              : answers[0] >= 2
                ? 0
                : 4;
  return `<div class="salonnote"><span class="eyebrow">À EMPORTER AU SALON</span><h3>Votre piste : ${styles[look][0]}</h3><p>${styles[look][2]} ${["Sur une coupe courte, montrez la nuque que vous souhaitez dégager.", "À mi-longueur, précisez si vous voulez encore pouvoir attacher vos cheveux.", "Sur cheveux longs, indiquez la longueur que vous voulez conserver."][len]}</p><p>${["Travaillez par petites touches pour ne pas alourdir les racines.", "Répartissez le soin uniformément sur les longueurs.", "Séparez votre chevelure en plusieurs sections pour répartir le soin."][density]} ${["Pour le séchage naturel, pressez les longueurs dans une serviette sans frotter.", "Au diffuseur, choisissez un souffle doux.", "Pour le brushing, gardez le sèche-cheveux en mouvement."][dry]}</p>${A("Feuilleter le carnet des styles", "inspiration", "link")}</div>`;
}
function routine() {
  const [texture, width, root, ends, freq, tech, night, goal, time] = answers;
  const care = ends && time ? 0 : 3,
    finish = goal === 1 ? 6 : goal === 2 ? 4 : 2,
    kit = [1, care, finish];
  const steps = [
    [
      "01 · LE LAVAGE",
      "Nettoyer les racines",
      [
        "Concentrez le shampoing sur les racines plutôt que de frotter les longueurs.",
        "Massez doucement le cuir chevelu avec la pulpe des doigts.",
        "Préférez un massage léger et un rinçage à l’eau tiède.",
      ][root] +
        " " +
        [
          "Pour vos lavages fréquents, gardez une petite quantité de produit.",
          "Répartissez vos deux ou trois lavages selon vos besoins.",
          "Le jour du lavage, travaillez par sections pour bien répartir le shampoing.",
        ][freq],
    ],
    [
      "02 · LE SOIN",
      "Assouplir les longueurs",
      `${care === 0 ? "Appliquez le masque nutritif" : "Répartissez l’après-shampoing"} ${width === 0 ? "sur les pointes uniquement" : "sur les demi-longueurs et les pointes"}. ${ends ? "Démêlez en remontant progressivement depuis les pointes." : "Lissez doucement les mèches avec les doigts."} ${time === 0 ? "Gardez un rituel court." : "Respectez le temps de pose indiqué sur le soin."}`,
    ],
    [
      "03 · LA FINITION",
      "Coiffer sans brusquer",
      [
        "Lissez une petite goutte d’huile sur les pointes.",
        "Appliquez une touche de poudre sur les racines sèches.",
        "Froissez vos mèches humides avec un peu de gel.",
        "Répartissez une touche d’huile sur les frisottis.",
      ][goal] +
        " " +
        (texture > 1
          ? "Manipulez les boucles le moins possible pendant le séchage."
          : "Épongez vos cheveux sans frotter."),
    ],
    [
      "04 · LE SOIR",
      "Préparer le lendemain",
      [
        "Si vos longueurs s’emmêlent, essayez une tresse souple.",
        "Gardez votre attache souple et sans traction.",
        "Choisissez un bonnet confortable, sans serrer les tempes.",
      ][night] +
        " " +
        [
          "Avant le prochain brushing, pensez à la protection thermique.",
          "Espacez les retouches de couleur si vos pointes sont fragiles.",
          "Alternez les raies et évitez les tresses trop serrées.",
          "Au réveil, replacez les mèches avec les doigts.",
        ][tech],
    ],
  ];
  quizView().innerHTML = `<div class="results">${head("VOTRE ORDONNANCE BEAUTÉ · 4 GESTES", "Votre routine sur mesure")}<p>${questions[0][3][texture]} · ${questions[7][3][goal]} · ${questions[8][3][time]}</p><div class="steps">${steps.map(([k, t, p]) => `<article><span class="eyebrow">${k}</span><h3>${t}</h3><p>${p}</p></article>`).join("")}</div>${styleNotes()}<h2>Votre sélection de soins</h2><div class="grid">${cards(kit.map((n) => products[n]))}</div><button class="cta" onclick="cart.push(${kit.join(",")});save();bag()">Ajouter les 3 soins au panier</button> <button onclick="step=0;answers=[];persistQuiz();quiz()">Refaire le diagnostic</button></div>`;
  draw();
}
function readOrders() {
  return list(
    "nhOrders",
    (o) =>
      o &&
      typeof o.owner === "string" &&
      /^NH-[A-Z0-9]+$/.test(o.ref) &&
      Number.isInteger(o.qty) &&
      o.qty > 0 &&
      Number.isFinite(o.amount),
  );
}
const price = (n) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
  total = () => cart.reduce((s, n) => s + products[n][3], 0);
let alias = load("nhAlias") || "";
function accountLabel() {
  accountBtn.textContent = alias || "Mon compte";
}
function account() {
  if (!alias) {
    pop(
      `${head("ESPACE DÉMO", "Mon compte")}<p>Choisissez un pseudo fictif pour retrouver vos commandes simulées sur cet appareil. Aucun mot de passe nécessaire.</p><form id="profileForm"><label>Pseudo fictif <input id="pseudo" required maxlength="24" autocomplete="off"></label><button class="cta">Ouvrir mon espace</button></form>`,
    );
    profileForm.onsubmit = (e) => {
      e.preventDefault();
      const v = pseudo.value.trim();
      if (!v) return;
      alias = v;
      store("nhAlias", v);
      accountLabel();
      account();
    };
    return;
  }
  let orders = readOrders().filter((o) => o.owner === alias);
  pop(
    `${head("PROFIL LOCAL · DÉMONSTRATION", "Mon carnet beauté")}<p id="welcome"></p><h3>Mes commandes simulées</h3>${orders.length ? orders.map((o) => `<div class="row"><span>${o.ref} · ${o.qty} article(s)</span><b>${price(o.amount)}</b></div>`).join("") : "<p>Aucune commande pour le moment.</p>"}<button onclick="alias='';store('nhAlias',null);accountLabel();modal.close()">Se déconnecter</button>`,
  );
  welcome.textContent = "Bienvenue, " + alias + " !";
}
function quantity(n, d) {
  if (d > 0) cart.push(n);
  else cart.splice(cart.indexOf(n), 1);
  save();
  bag();
}
function bag() {
  pop(
    head("MA SÉLECTION", "Mon panier") +
      (cart.length
        ? [...new Set(cart)]
            .map(
              (n) =>
                `<div class="row"><div><b>${products[n][0]}</b><small class="sub">${price(products[n][3])} / unité</small></div><div><button aria-label="Retirer une unité" onclick="quantity(${n},-1)">−</button> ${cart.filter((i) => i === n).length} <button aria-label="Ajouter une unité" onclick="quantity(${n},1)">+</button></div></div>`,
            )
            .join("") +
          `<div class="row">Total <b>${price(total())}</b></div><button class="cta" onclick="checkout()">Passer au paiement →</button>`
        : "<p>Votre sélection est encore vide.</p><button onclick=\"modal.close();location.hash='boutique'\">Explorer les soins</button>"),
  );
}
function checkout() {
  if (!cart.length) return bag();
  pop(
    `${head("CAISSE · SIMULATION", "Finaliser ma commande")}<p>Aucun débit, aucune livraison. N’entrez pas de coordonnées bancaires.</p><div class="testcard">CARTE DE DÉMONSTRATION<br><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4242</strong></div><div class="row">${cart.length} article(s) · Total <b>${price(total())}</b></div><button class="cta" onclick="pay()">Simuler le paiement de ${price(total())}</button> <button onclick="bag()">Retour</button>`,
  );
}
function pay() {
  if (!cart.length) return bag();
  let o = {
    owner: alias,
    ref: "NH-" + Date.now().toString(36).toUpperCase(),
    qty: cart.length,
    amount: total(),
  };
  if (alias) store("nhOrders", JSON.stringify([o, ...readOrders()]));
  cart = [];
  save();
  pop(
    `${head("PAIEMENT SIMULÉ", "Merci pour votre commande !")}<p>Référence <b>${o.ref}</b><br>${o.qty} article(s) · ${price(o.amount)}<br>Aucun montant n’a été débité.</p><button onclick="modal.close()">Continuer ma visite</button>`,
  );
}
accountLabel();
render();
