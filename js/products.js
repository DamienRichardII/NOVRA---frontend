/* =========================================================================
   NOVRA — CATALOGUE PRODUITS
   Source unique de vérité du site. Modifier les prix / stocks / textes ici.
   Les prix sont provisoires et exprimés en euros TTC.
   ========================================================================= */

const IMG = 'assets/web/';

const SIZES_APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SIZES_ONE = ['TU'];

/* Palette de référence des couleurs produits (hex = pastille affichée) */
const COLOR_SWATCHES = {
  'Noir': '#111111',
  'Blanc': '#f2f2f2',
  'Gris': '#8a8d90',
  'Anthracite': '#33363a',
  'Beige': '#e4dfcd',
  'Kaki': '#5a6046',
  'Orange': '#e8481c',
  'Menthe': '#57e0c0',
  'Corail': '#ff5a5f',
  'Rose': '#c9a1a6'
};

const products = [
  {
    id: 'tshirt-performance-noir',
    name: 'T-shirt Performance Noir',
    slug: 'tshirt-performance-noir',
    category: 't-shirts',
    categoryLabel: 'T-shirts',
    gender: 'homme',
    price: 45,
    description: "Le T-shirt Performance est la base du vestiaire NOVRA. Maille technique respirante, coupe droite légèrement oversize et détails réfléchissants sur la manche et le dos. Conçu pour l'entraînement comme pour le quotidien.",
    images: [
      IMG + 'tshirt-noir/dsc02335.jpg',
      IMG + 'tshirt-noir/dsc02436.jpg',
      IMG + 'tshirt-noir/dsc02339.jpg',
      IMG + 'tshirt-noir/dsc02341.jpg',
      IMG + 'tshirt-noir/dsc02342.jpg',
      IMG + 'tshirt-noir/dsc02439.jpg',
      IMG + 'tshirt-noir/dsc02441.jpg'
    ],
    colors: ['Noir'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: true,
    stock: true,
    rating: 4.8,
    reviews: 126,
    technicalDetails: [
      'Maille technique à séchage rapide',
      'Détails réfléchissants manche et dos',
      'Coutures plates anti-frottement',
      'Coupe droite, tombé légèrement oversize'
    ],
    composition: '88 % polyester recyclé, 12 % élasthanne',
    care: 'Lavage machine 30 °C. Ne pas sécher en machine. Ne pas repasser les impressions.'
  },

  {
    id: 'tshirt-performance-blanc',
    name: 'T-shirt Performance Blanc',
    slug: 'tshirt-performance-blanc',
    category: 't-shirts',
    categoryLabel: 'T-shirts',
    gender: 'homme',
    price: 45,
    description: "Version claire du T-shirt Performance. Même maille technique, même exigence, avec un logo NOVRA discret à l'épaule et une base arrondie qui accompagne le mouvement.",
    images: [
      IMG + 'tshirt-blanc/dsc02413.jpg',
      IMG + 'tshirt-blanc/dsc02416.jpg',
      IMG + 'tshirt-blanc/dsc02414.jpg',
      IMG + 'tshirt-blanc/dsc02418.jpg',
      IMG + 'tshirt-blanc/dsc02419.jpg'
    ],
    colors: ['Blanc'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: true,
    stock: true,
    rating: 4.7,
    reviews: 84,
    technicalDetails: [
      'Maille technique à séchage rapide',
      'Base arrondie allongée dans le dos',
      'Logo NOVRA imprimé épaule',
      'Traitement anti-odeur'
    ],
    composition: '88 % polyester recyclé, 12 % élasthanne',
    care: 'Lavage machine 30 °C. Ne pas sécher en machine.'
  },

  {
    id: 'polo-tech',
    name: 'Polo Tech',
    slug: 'polo-tech',
    category: 'polos',
    categoryLabel: 'Polos',
    gender: 'unisexe',
    price: 60,
    description: "Un polo pensé pour la performance et porté partout. Maille jacquard légère, col structuré qui ne se déforme pas et signature NOVRA brodée sur la poitrine. Disponible en trois coloris.",
    images: [
      IMG + 'polo/dsc02307.jpg',
      IMG + 'polo/dsc02313.jpg',
      IMG + 'polo/dsc02311.jpg',
      IMG + 'polo/dsc02308.jpg',
      IMG + 'polo/dsc02312.jpg',
      IMG + 'polo/dsc02314.jpg',
      IMG + 'polo/dsc02315.jpg',
      IMG + 'polo/dsc02382.jpg',
      IMG + 'polo/dsc02379.jpg',
      IMG + 'polo/dsc02383.jpg'
    ],
    colors: ['Blanc', 'Beige', 'Noir'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: true,
    stock: true,
    rating: 4.9,
    reviews: 61,
    technicalDetails: [
      'Maille jacquard légère et respirante',
      'Col structuré tenue durable',
      'Signature NOVRA poitrine',
      'Coupe régulière unisexe'
    ],
    composition: '95 % polyester, 5 % élasthanne',
    care: 'Lavage machine 30 °C, cycle délicat. Séchage à plat.'
  },

  {
    id: 'casquette-performance',
    name: 'Casquette Performance',
    slug: 'casquette-performance',
    category: 'accessoires',
    categoryLabel: 'Accessoires',
    gender: 'unisexe',
    price: 35,
    description: "Casquette running ultra légère à panneaux mesh. Bandeau intérieur absorbant, visière souple et fermeture arrière réglable. Quatre coloris, une seule exigence.",
    images: [
      IMG + 'casquette/dsc02336.jpg',
      IMG + 'casquette/dsc02346.jpg',
      IMG + 'casquette/dsc02337.jpg',
      IMG + 'casquette/dsc02343.jpg',
      IMG + 'casquette/dsc02352.jpg',
      IMG + 'casquette/dsc02353.jpg',
      IMG + 'casquette/dsc02356.jpg',
      IMG + 'casquette/dsc02359.jpg',
      IMG + 'casquette/dsc02348.jpg',
      IMG + 'casquette/dsc02351.jpg'
    ],
    colors: ['Noir', 'Gris', 'Kaki', 'Orange'],
    sizes: SIZES_ONE,
    featured: true,
    newProduct: false,
    stock: true,
    rating: 4.6,
    reviews: 98,
    technicalDetails: [
      'Panneaux mesh haute ventilation',
      'Bandeau intérieur absorbant',
      'Visière souple pliable',
      'Fermeture arrière réglable'
    ],
    composition: '100 % polyester',
    care: 'Lavage à la main, eau froide. Séchage à l’air libre.'
  },

  {
    id: 'pantalon-tech',
    name: 'Pantalon Tech',
    slug: 'pantalon-tech',
    category: 'pantalons',
    categoryLabel: 'Pantalons',
    gender: 'homme',
    price: 75,
    description: "Pantalon technique à coupe fuselée. Tissu extensible déperlant, poches zippées et bas ajustable. Il passe de l'échauffement à la ville sans changer de registre.",
    images: [
      IMG + 'pantalon/dsc02384.jpg',
      IMG + 'pantalon/dsc02297.jpg',
      IMG + 'pantalon/dsc02385.jpg',
      IMG + 'pantalon/dsc02387.jpg',
      IMG + 'pantalon/dsc02298.jpg',
      IMG + 'pantalon/dsc02299.jpg',
      IMG + 'pantalon/dsc02407.jpg',
      IMG + 'pantalon/dsc02409.jpg',
      IMG + 'pantalon/dsc02411.jpg'
    ],
    colors: ['Noir', 'Kaki', 'Anthracite'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: false,
    stock: true,
    rating: 4.8,
    reviews: 73,
    technicalDetails: [
      'Tissu extensible 4 directions',
      'Traitement déperlant',
      'Poches latérales zippées',
      'Bas de jambe ajustable'
    ],
    composition: '92 % polyamide, 8 % élasthanne',
    care: 'Lavage machine 30 °C. Ne pas utiliser d’adoucissant.'
  },

  {
    id: 'veste-coupe-vent-noire',
    name: 'Veste Coupe-Vent Noire',
    slug: 'veste-coupe-vent-noire',
    category: 'vestes',
    categoryLabel: 'Vestes',
    gender: 'homme',
    price: 120,
    description: "Coupe-vent technique à capuche ajustée. Tissu ripstop ultra léger, protection contre le vent et la pluie fine, empiècements ventilés dans le dos. La pièce qui supprime les excuses.",
    images: [
      IMG + 'veste-noir/dsc02364.jpg',
      IMG + 'veste-noir/dsc02365.jpg',
      IMG + 'veste-noir/dsc02361.jpg',
      IMG + 'veste-noir/dsc02362.jpg',
      IMG + 'veste-noir/dsc02366.jpg',
      IMG + 'veste-noir/dsc02369.jpg',
      IMG + 'veste-noir/dsc02370.jpg'
    ],
    colors: ['Noir'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: true,
    stock: true,
    rating: 4.9,
    reviews: 47,
    technicalDetails: [
      'Tissu ripstop ultra léger',
      'Déperlant, coupe-vent',
      'Capuche ajustable',
      'Empiècements ventilés dos',
      'Détails réfléchissants'
    ],
    composition: '100 % polyamide recyclé',
    care: 'Lavage machine 30 °C, cycle délicat. Ne pas sécher en machine.'
  },

  {
    id: 'veste-coupe-vent-corail',
    name: 'Veste Coupe-Vent Corail',
    slug: 'veste-coupe-vent-corail',
    category: 'vestes',
    categoryLabel: 'Vestes',
    gender: 'unisexe',
    price: 120,
    description: "Le coupe-vent NOVRA en coloris corail haute visibilité. Même construction ripstop, même capuche ajustée, une présence qui ne passe pas inaperçue sur la route.",
    images: [
      IMG + 'veste-corail/dsc02391.jpg',
      IMG + 'veste-corail/dsc02421.jpg',
      IMG + 'veste-corail/dsc02393.jpg',
      IMG + 'veste-corail/dsc02394.jpg',
      IMG + 'veste-corail/dsc02396.jpg',
      IMG + 'veste-corail/dsc02420.jpg',
      IMG + 'veste-corail/dsc02430.jpg',
      IMG + 'veste-corail/dsc02431.jpg'
    ],
    colors: ['Corail'],
    sizes: SIZES_APPAREL,
    featured: false,
    newProduct: true,
    stock: true,
    rating: 4.7,
    reviews: 32,
    technicalDetails: [
      'Tissu ripstop ultra léger',
      'Coloris haute visibilité',
      'Capuche ajustable',
      'Poche poitrine zippée'
    ],
    composition: '100 % polyamide recyclé',
    care: 'Lavage machine 30 °C, cycle délicat. Ne pas sécher en machine.'
  },

  {
    id: 'ensemble-training-menthe',
    name: 'Ensemble Training Menthe',
    slug: 'ensemble-training-menthe',
    category: 'ensembles',
    categoryLabel: 'Ensembles',
    gender: 'homme',
    price: 85,
    description: "T-shirt et short assortis en maille technique dégradée. Un ensemble complet, taillé pour la salle, le terrain et les séances qui comptent.",
    images: [
      IMG + 'ensemble-menthe/dsc02317.jpg',
      IMG + 'ensemble-menthe/dsc02319.jpg',
      IMG + 'ensemble-menthe/dsc02320.jpg',
      IMG + 'ensemble-menthe/dsc02321.jpg',
      IMG + 'ensemble-menthe/dsc02322.jpg',
      IMG + 'ensemble-menthe/dsc02323.jpg',
      IMG + 'ensemble-menthe/dsc02325.jpg'
    ],
    colors: ['Menthe'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: true,
    stock: true,
    rating: 4.8,
    reviews: 54,
    technicalDetails: [
      'Ensemble t-shirt + short',
      'Maille technique dégradée',
      'Short avec cordon de serrage',
      'Séchage rapide'
    ],
    composition: '90 % polyester recyclé, 10 % élasthanne',
    care: 'Lavage machine 30 °C. Ne pas sécher en machine.'
  },

  {
    id: 'ensemble-training-anthracite',
    name: 'Ensemble Training Anthracite',
    slug: 'ensemble-training-anthracite',
    category: 'ensembles',
    categoryLabel: 'Ensembles',
    gender: 'homme',
    price: 85,
    description: "La version la plus sobre de l'ensemble Training. Maille chinée anthracite, bandes contrastées mates et poches latérales sur le short. Discret, technique, redoutable.",
    images: [
      IMG + 'ensemble-anthracite/dsc02397.jpg',
      IMG + 'ensemble-anthracite/dsc02404.jpg',
      IMG + 'ensemble-anthracite/dsc02398.jpg',
      IMG + 'ensemble-anthracite/dsc02399.jpg',
      IMG + 'ensemble-anthracite/dsc02400.jpg',
      IMG + 'ensemble-anthracite/dsc02402.jpg',
      IMG + 'ensemble-anthracite/dsc02403.jpg'
    ],
    colors: ['Anthracite'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: false,
    stock: true,
    rating: 4.9,
    reviews: 88,
    technicalDetails: [
      'Ensemble t-shirt + short',
      'Maille chinée anthracite',
      'Poches latérales sur le short',
      'Bandes contrastées mates'
    ],
    composition: '90 % polyester recyclé, 10 % élasthanne',
    care: 'Lavage machine 30 °C. Ne pas sécher en machine.'
  },

  {
    id: 'ensemble-training-corail',
    name: 'Ensemble Training Corail',
    slug: 'ensemble-training-corail',
    category: 'ensembles',
    categoryLabel: 'Ensembles',
    gender: 'homme',
    price: 85,
    description: "L'ensemble Training en corail. Bande réfléchissante sur la manche, maille aérée et short assorti. Pour ceux qui s'entraînent quand les autres dorment encore.",
    images: [
      IMG + 'ensemble-corail/dsc02371.jpg',
      IMG + 'ensemble-corail/dsc02373.jpg',
      IMG + 'ensemble-corail/dsc02374.jpg',
      IMG + 'ensemble-corail/dsc02375.jpg',
      IMG + 'ensemble-corail/dsc02376.jpg',
      IMG + 'ensemble-corail/dsc02377.jpg'
    ],
    colors: ['Corail'],
    sizes: SIZES_APPAREL,
    featured: false,
    newProduct: true,
    stock: true,
    rating: 4.6,
    reviews: 29,
    technicalDetails: [
      'Ensemble t-shirt + short',
      'Bande réfléchissante manche',
      'Maille aérée haute ventilation',
      'Short avec cordon de serrage'
    ],
    composition: '90 % polyester recyclé, 10 % élasthanne',
    care: 'Lavage machine 30 °C. Ne pas sécher en machine.'
  },

  {
    id: 'ensemble-jogging-rose',
    name: 'Ensemble Jogging Rose',
    slug: 'ensemble-jogging-rose',
    category: 'ensembles',
    categoryLabel: 'Ensembles',
    gender: 'femme',
    price: 110,
    description: "Ensemble veste et pantalon en tissu léger bi-matière. Capuche, taille élastiquée et coupe fluide. Une pièce d'échauffement pensée pour être portée bien au-delà de la séance.",
    images: [
      IMG + 'ensemble-rose/dsc02331.jpg',
      IMG + 'ensemble-rose/dsc02332.jpg',
      IMG + 'ensemble-rose/dsc02334.jpg'
    ],
    colors: ['Rose'],
    sizes: SIZES_APPAREL,
    featured: true,
    newProduct: true,
    stock: true,
    rating: 4.7,
    reviews: 41,
    technicalDetails: [
      'Ensemble veste + pantalon',
      'Tissu léger bi-matière',
      'Capuche et taille élastiquée',
      'Coupe fluide'
    ],
    composition: '100 % polyamide',
    care: 'Lavage machine 30 °C, cycle délicat. Séchage à plat.'
  }
];

/* ---------------------------------------------------------------------
   Visuels éditoriaux réutilisés dans les pages (hors fiches produits)
   --------------------------------------------------------------------- */
const MEDIA = {
  heroVideo: IMG + 'video/novra-hero.mp4',
  heroPoster: IMG + 'video/novra-hero-poster.jpg',
  logo: IMG + 'logo/novra-wordmark.png',
  logoSmall: IMG + 'logo/novra-wordmark-sm.png',
  mark: IMG + 'logo/novra-mark.png',
  editorial: {
    tshirtGris: IMG + 'vitrine/4o8a0049.jpg',
    casquetteKaki: IMG + 'vitrine/4o8a0110.jpg',
    vesteNoire: IMG + 'vitrine/4o8a0158.jpg',
    duoVestes: IMG + 'vitrine/4o8a9733.jpg',
    bobNoir: IMG + 'vitrine/4o8a9879.jpg',
    bobDetail: IMG + 'vitrine/4o8a9882.jpg',
    boutique1: IMG + 'boutique/img_9463.jpg',
    boutique2: IMG + 'boutique/img_9464.jpg',
    boutique3: IMG + 'boutique/img_9465.jpg'
  },
  collections: {
    homme: IMG + 'tshirt-noir/dsc02335.jpg',
    femme: IMG + 'ensemble-rose/dsc02332.jpg',
    accessoires: IMG + 'casquette/dsc02352.jpg'
  }
};

/* Catégories affichées dans la marketplace (aucune catégorie vide) */
const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 't-shirts', label: 'T-shirts' },
  { key: 'polos', label: 'Polos' },
  { key: 'ensembles', label: 'Ensembles' },
  { key: 'pantalons', label: 'Pantalons' },
  { key: 'vestes', label: 'Vestes' },
  { key: 'accessoires', label: 'Accessoires' }
];

/* --------------------------- Helpers catalogue --------------------------- */

function getProductById(id) {
  return products.find(function (p) { return p.id === id; }) || null;
}

function getFeaturedProducts(limit) {
  const list = products.filter(function (p) { return p.featured; });
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

function getRelatedProducts(product, limit) {
  if (!product) return [];
  const same = products.filter(function (p) {
    return p.id !== product.id && p.category === product.category;
  });
  const sameGender = products.filter(function (p) {
    return p.id !== product.id && p.category !== product.category && p.gender === product.gender;
  });
  const rest = products.filter(function (p) {
    return p.id !== product.id && same.indexOf(p) === -1 && sameGender.indexOf(p) === -1;
  });
  return same.concat(sameGender, rest).slice(0, limit || 4);
}

function formatPrice(value) {
  return value.toFixed(2).replace('.', ',') + ' €';
}

function colorSwatch(name) {
  return COLOR_SWATCHES[name] || '#888888';
}
