// Local directory. These are independent businesses, not partners or live availability.
const salonDirectory = {
  family: ['Le Petit Salon', '1 rue Charles Péguy, 38100 Grenoble', 'Coupes enfant', 'https://www.pagesjaunes.fr/pros/06147389',4],
  curls: ['Coif’fleur', '37 rue Nicolas Chorier, 38000 Grenoble', 'Cheveux bouclés, frisés et crépus', 'https://www.mon-coiffeur-boucles.fr/grenoble/coif-fleur-grenoble',5],
  color: ['Lil’Cut Coiffure', '5 place Saint-André, 38000 Grenoble', 'Coupes mixtes, coloration et balayage', 'https://www.lilcutcoiffure.com/',2],
  braids: ['JM Braids Coiffure', '88 rue Anatole France, 38100 Grenoble', 'Coiffure afro', 'https://www.planity.com/coiffeur/coiffure-afro/38000-grenoble',1]
};
function salonSuggestions(product=null){
  const picks=new Map();const add=(key,why)=>{if(!picks.has(key))picks.set(key,why)};
  const complete=audience && step>=routeLength();
  if(product===7 || audience==='Bébé')add('family','Pour une première coupe : ce salon propose des coupes enfant. Demandez à partir de quel âge il accueille les tout-petits.');
  else {
    if(audience==='Enfant')add('family','Vous préparez un rendez-vous pour un enfant : la coupe enfant figure parmi les prestations.');
    if(complete){
      if(answers[12]===3)add('braids','Vous envisagez une coiffure tressée. Précisez le modèle souhaité avant de réserver.');
      if(answers[0]>=2 || answers[7]===2)add('curls','Votre réponse sur la texture ou la définition des boucles correspond à cette spécialité.');
      if([1,2].includes(answers[14]))add('color','Vous avez indiqué une coloration ou des mèches : ce salon propose un service couleur.');
    }
    if(product===4 || product===8)add('curls','Pour accompagner le travail des boucles et de leur mouvement entre deux lavages.');
    if(!picks.size)add('color','Une adresse mixte pour discuter de votre coupe et de vos gestes de coiffage, quelle que soit votre identité.');
  }
  return `<section class="local-guide"><span class="eyebrow">LE CARNET GRENOBLOIS</span><h3>${complete?'Vos adresses conseillées':'Une adresse pour vous orienter'}</h3>${[...picks].slice(0,2).map(([key,why])=>{const [name,addr,spec,url,id]=salonDirectory[key];return `<article><strong>${name}</strong><p>${addr}</p><p>${spec} <a href="${url}" target="_blank" rel="noopener" aria-label="Source : ${name}">[${id}]</a></p><p>${why}</p><a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+' '+addr)}">Voir l’adresse sur la carte ↗</a></article>`}).join('')}<small>Sélection indicative, sans partenariat. Confirmez les prestations, tarifs et conditions d’accueil auprès du salon.</small></section>`;
}
