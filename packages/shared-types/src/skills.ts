export interface SkillCategory {
  id: string;
  code: string;
  name: {
    en: string;
    hi: string;
    gu: string;
    mr: string;
  };
  description: {
    en: string;
    hi: string;
  };
  icon: string;
  isPopular?: boolean;
}

export const MASTER_SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'skill-mason',
    code: 'MASON',
    name: {
      en: 'Mason',
      hi: 'राजमिस्त्री',
      gu: 'કડીયો (રાજમિસ્ત્રી)',
      mr: 'गवंडी (राजमिस्त्री)',
    },
    description: {
      en: 'Brickwork, concrete foundation, plastering, stone masonry',
      hi: 'ईंट की चिनाई, नींव, प्लास्टर और कंक्रीट का कार्य',
    },
    icon: 'wall',
    isPopular: true,
  },
  {
    id: 'skill-labour',
    code: 'LABOUR',
    name: {
      en: 'Construction Labour',
      hi: 'मजदूर',
      gu: 'મજૂર',
      mr: 'मजूर',
    },
    description: {
      en: 'Material handling, earthwork excavation, mixing assistance',
      hi: 'सामग्री ढोना, मिट्टी खुदाई, मसाला तैयार करना',
    },
    icon: 'hard-hat',
    isPopular: true,
  },
  {
    id: 'skill-carpenter',
    code: 'CARPENTER',
    name: {
      en: 'Carpenter / Furniture Maker',
      hi: 'बढ़ई / फर्नीचर',
      gu: 'સુથાર',
      mr: 'सुतार / फर्निचर',
    },
    description: {
      en: 'Doors, windows, custom woodwork, modular furniture and repair',
      hi: 'दरवाजे, खिड़कियां, लकड़ी का काम और फर्नीचर निर्माण',
    },
    icon: 'hammer',
    isPopular: true,
  },
  {
    id: 'skill-plumber',
    code: 'PLUMBER',
    name: {
      en: 'Plumber',
      hi: 'प्लंबर',
      gu: 'પ્લમ્બર',
      mr: 'प्लंबर',
    },
    description: {
      en: 'Sanitary fittings, pipeline laying, tank installation, leak fixes',
      hi: 'पाइपलाइन, सैनिटरी फिटिंग, वाटर टैंक और लीकेज मरम्मत',
    },
    icon: 'wrench',
    isPopular: true,
  },
  {
    id: 'skill-electrician',
    code: 'ELECTRICIAN',
    name: {
      en: 'Electrician',
      hi: 'इलेक्ट्रीशियन',
      gu: 'ઇલેક્ટ્રિશિયન',
      mr: 'इलेक्ट्रिशियन',
    },
    description: {
      en: 'Wiring, conduit installation, MCB boxes, fixtures and appliances',
      hi: 'वायरिंग, स्विच बोर्ड, एमसीबी बॉक्स और लाइट फिटिंग',
    },
    icon: 'zap',
    isPopular: true,
  },
  {
    id: 'skill-tile-flooring',
    code: 'TILE_FLOORING',
    name: {
      en: 'Tile & Flooring Installer',
      hi: 'टाइल और फ्लोरिंग मिस्त्री',
      gu: 'ટાઇલ્સ અને ફ્લોરિંગ',
      mr: 'टाईल्स आणि फ्लोअरिंग',
    },
    description: {
      en: 'Vitrified tiles, granite laying, wooden flooring, skirting',
      hi: 'विट्रिफाइड टाइल्स, ग्रेनाइट फ्लोरिंग और स्कर्टिंग फिटिंग',
    },
    icon: 'grid',
    isPopular: true,
  },
  {
    id: 'skill-painter',
    code: 'PAINTER',
    name: {
      en: 'Painter',
      hi: 'पेंटर',
      gu: 'કલર કામ (પેઇન્ટર)',
      mr: 'रंगारी (पेंटर)',
    },
    description: {
      en: 'Interior & exterior wall putty, primer, emulsion, texture, enamel',
      hi: 'दीवार पुट्टी, डिस्टेंपर, इमल्शन पेंट और टेक्सचर डिजाइन',
    },
    icon: 'paint-roller',
    isPopular: true,
  },
  {
    id: 'skill-pop-ceiling',
    code: 'POP_CEILING',
    name: {
      en: 'POP & False Ceiling Worker',
      hi: 'पीओपी और फॉल्स सीलिंग',
      gu: 'પીઓપી અને ફોલ્સ સિલિંગ',
      mr: 'पीओपी आणि फॉल्स सिलिंग',
    },
    description: {
      en: 'Gypsum ceiling, grid ceilings, wall mouldings, POP punning',
      hi: 'जिप्सम बोर्ड सीलिंग, पीओपी मोल्डिंग और कॉर्निस डिजाइन',
    },
    icon: 'layout',
  },
  {
    id: 'skill-welder',
    code: 'WELDER',
    name: {
      en: 'Welder / Fabricator',
      hi: 'वेल्डर / फैब्रिकेटर',
      gu: 'વેલ્ડર / ફેબ્રિકેટર',
      mr: 'वेल्डर / फॅब्रिकेटर',
    },
    description: {
      en: 'Iron gates, safety grills, railings, steel sheds, structural welding',
      hi: 'लोहे के गेट, ग्रिल, रेलिंग, शेड और फेब्रिकेशन कार्य',
    },
    icon: 'shield',
  },
  {
    id: 'skill-glass-aluminium',
    code: 'GLASS_ALUMINIUM',
    name: {
      en: 'Glass & Aluminium Worker',
      hi: 'ग्लास और एल्युमिनियम वर्कर',
      gu: 'ગ્લાસ અને એલ્યુમિનિયમ',
      mr: 'काच आणि ॲल्युमिनियम',
    },
    description: {
      en: 'Aluminium sliding windows, toughened glass partitions, ACP panels',
      hi: 'एल्युमिनियम स्लाइडिंग खिड़की, टफन्ड ग्लास पार्टिशन',
    },
    icon: 'maximize',
  },
  {
    id: 'skill-waterproofing',
    code: 'WATERPROOFING',
    name: {
      en: 'Waterproofing Specialist',
      hi: 'वाटरप्रूफिंग विशेषज्ञ',
      gu: 'વોટરપ્રૂફિંગ સ્પેશિયાલિસ્ટ',
      mr: 'वॉटरप्रूफिंग तज्ज्ञ',
    },
    description: {
      en: 'Terrace coating, basement waterproofing, bathroom dampness treatment',
      hi: 'छत व बेसमेंट वाटरप्रूफिंग, सीलन और लीकेज का उपचार',
    },
    icon: 'droplet',
  },
  {
    id: 'skill-roofer',
    code: 'ROOFER',
    name: {
      en: 'Roofer',
      hi: 'छत निर्माण (रूफर)',
      gu: 'ધાબા અને છાપરાં કારીગર',
      mr: 'छप्पर कारागीर',
    },
    description: {
      en: 'Roof tiling, metal sheet roofing, truss structures',
      hi: 'रूफ टाइल, टीन शेड और ट्रस फ्रेमिंग कार्य',
    },
    icon: 'home',
  },
  {
    id: 'skill-interior-designer',
    code: 'INTERIOR_DESIGNER',
    name: {
      en: 'Interior Designer',
      hi: 'इंटीरियर डिजाइनर',
      gu: 'ઇન્ટિરિયર ડિઝાઇનર',
      mr: 'इंटेरियर डिझायनर',
    },
    description: {
      en: 'Space planning, 3D visualizations, aesthetic styling',
      hi: 'स्थान नियोजन, 3डी डिजाइन और साज-सज्जा',
    },
    icon: 'pen-tool',
  },
  {
    id: 'skill-architect',
    code: 'ARCHITECT',
    name: {
      en: 'Architect',
      hi: 'वास्तुकार (आर्किटेक्ट)',
      gu: 'વાસ્તુકાર (આર્કિટેક્ટ)',
      mr: 'वास्तुविशारद (आर्किटेक्ट)',
    },
    description: {
      en: 'Building maps, elevation designs, structural drawings',
      hi: 'नक्शा, एलिवेशन और भवन अनुमोदन ड्राइंग',
    },
    icon: 'compass',
  },
  {
    id: 'skill-civil-engineer',
    code: 'CIVIL_ENGINEER',
    name: {
      en: 'Civil Engineer',
      hi: 'सिविल इंजीनियर',
      gu: 'સિવિલ એન્જિનિયર',
      mr: 'सिव्हिल इंजिनिअर',
    },
    description: {
      en: 'Site supervision, quality inspection, BOQ estimation',
      hi: 'साइट सुपरविजन, सामग्री गुणवत्ता जांच और एस्टीमेशन',
    },
    icon: 'briefcase',
  },
  {
    id: 'skill-contractor',
    code: 'CONTRACTOR',
    name: {
      en: 'Contractor',
      hi: 'ठेकेदार (कॉन्ट्रैक्टर)',
      gu: 'કોન્ટ્રાક્ટર',
      mr: 'ठेकेदार (कॉन्ट्रॅक्टर)',
    },
    description: {
      en: 'Turnkey building execution with labour, materials or labour rate',
      hi: 'विद मटीरियल या लेबर रेट पर संपूर्ण निर्माण ठेका',
    },
    icon: 'users',
  },
  {
    id: 'skill-modular-kitchen',
    code: 'MODULAR_KITCHEN',
    name: {
      en: 'Modular Kitchen Specialist',
      hi: 'मॉड्यूलर किचन विशेषज्ञ',
      gu: 'મોડ્યુલર કિચન સ્પેશિયાલિસ્ટ',
      mr: 'मॉड्युलर किचन तज्ज्ञ',
    },
    description: {
      en: 'Trolley baskets, acrylic/membrane shutters, chimney setup',
      hi: 'मॉड्यूलर कैबिनेट्स, चिमनी व ट्रॉली बास्केट इंस्टॉलेशन',
    },
    icon: 'box',
  },
  {
    id: 'skill-stone-marble',
    code: 'STONE_MARBLE',
    name: {
      en: 'Stone & Marble Worker',
      hi: 'पत्थर और मार्बल कारीगर',
      gu: 'માર્બલ અને પથ્થર કારીગર',
      mr: 'दगड आणि मार्बल कारागीर',
    },
    description: {
      en: 'Italian marble fitting, diamond polishing, stone carving, granite counter',
      hi: 'मार्बल कटिंग, फिटिंग, मोल्डिंग और डायमंड पॉलिशिंग',
    },
    icon: 'layers',
  },
  {
    id: 'skill-demolition',
    code: 'DEMOLITION',
    name: {
      en: 'Demolition Worker',
      hi: 'तोड़फोड़ (डिमोलिशन)',
      gu: 'તોડફોડ કામદાર',
      mr: 'पाडकाम कामगार',
    },
    description: {
      en: 'Wall breaking, RCC slab cutting, debris and malba disposal',
      hi: 'दीवार व छत तोड़फोड़, मलबा निस्तारण कार्य',
    },
    icon: 'trash-2',
  },
  {
    id: 'skill-gardener',
    code: 'GARDENER',
    name: {
      en: 'Gardener / Landscaping',
      hi: 'माली / लैंडस्केपिंग',
      gu: 'માળી / લેન્ડસ્કેપિંગ',
      mr: 'माळी / लँडस्केपिंग',
    },
    description: {
      en: 'Lawn plantation, garden maintenance, soil preparation',
      hi: 'बगीचे की देखभाल, लॉन लगाना और पौधे लगाना',
    },
    icon: 'sun',
  },
  {
    id: 'skill-other',
    code: 'OTHER_SKILLED',
    name: {
      en: 'Other Skilled Work',
      hi: 'अन्य कुशल कार्य',
      gu: 'અન્ય કુશળ કામ',
      mr: 'इतर कुशल काम',
    },
    description: {
      en: 'Specialized niche construction and repair craft',
      hi: 'अन्य विशेष निर्माण एवं मरम्मत कार्य',
    },
    icon: 'more-horizontal',
  },
];
