// All 25 Labour Categories with group tags and multilingual translations (EN, HI, GU, MR)
export const CATEGORIES = [
  {
    id: '1',
    name: 'Mason (Raj Mistri)',
    nameHi: 'राजमिस्त्री (Raj Mistri)',
    nameGu: 'કડિયાકામ (Raj Mistri)',
    nameMr: 'गवंडी (Raj Mistri)',
    icon: '🧱',
    workers: 142,
    group: 'construction',
  },
  {
    id: '2',
    name: 'Mason Helper (Beldar)',
    nameHi: 'मिस्त्री हेल्पर (बेलदार)',
    nameGu: 'મિસ્ત્રી હેલ્પર (બેલદાર)',
    nameMr: 'मिस्त्री हेल्पर (बेलदार)',
    icon: '👷',
    workers: 198,
    group: 'construction',
  },
  {
    id: '3',
    name: 'Construction Labour',
    nameHi: 'निर्माण मजदूर (Labour)',
    nameGu: 'બાંધકામ મજૂર (Labour)',
    nameMr: 'बांधकाम मजूर (Labour)',
    icon: '🏗️',
    workers: 240,
    group: 'construction',
  },
  {
    id: '4',
    name: 'Shuttering Carpenter',
    nameHi: 'शटरिंग बढ़ई',
    nameGu: 'શટરિંગ સુથાર',
    nameMr: 'शटरिंग सुतार',
    icon: '🪵',
    workers: 84,
    group: 'construction',
  },
  {
    id: '5',
    name: 'Steel Fixer / Bar Bender',
    nameHi: 'स्टील फिक्सर (सरिया कारीगर)',
    nameGu: 'સ્ટીલ ફિક્સર (સળિયા કામ)',
    nameMr: 'स्टील फिक्सर (बार बेंडर)',
    icon: '⛓️',
    workers: 65,
    group: 'construction',
  },
  {
    id: '6',
    name: 'Concrete Worker',
    nameHi: 'कंक्रीट कारीगर',
    nameGu: 'કોંક્રિટ કામદાર',
    nameMr: 'काँक्रीट कामगार',
    icon: '🪨',
    workers: 72,
    group: 'construction',
  },
  {
    id: '7',
    name: 'Tile & Marble',
    nameHi: 'टाइल और मार्बल कारीगर',
    nameGu: 'ટાઇલ્સ અને માર્બલ કારીગર',
    nameMr: 'टाइल आणि मार्बल कारागीर',
    icon: '🏛️',
    workers: 95,
    group: 'construction',
  },
  {
    id: '8',
    name: 'Plastering Worker',
    nameHi: 'प्लास्टर कारीगर',
    nameGu: 'પ્લાસ્ટર કામદાર',
    nameMr: 'प्लास्टर कामगार',
    icon: '🖌️',
    workers: 58,
    group: 'construction',
  },
  {
    id: '9',
    name: 'Waterproofing',
    nameHi: 'वाटरप्रूफिंग कारीगर',
    nameGu: 'વોટરપ્રૂફિંગ કામદાર',
    nameMr: 'वॉटरप्रूफिंग कामगार',
    icon: '💧',
    workers: 46,
    group: 'construction',
  },
  {
    id: '10',
    name: 'Electrician',
    nameHi: 'इलेक्ट्रीशियन (बिजली मिस्त्री)',
    nameGu: 'ઇલેક્ટ્રિશિયન (વીજળી મિસ્ત્રી)',
    nameMr: 'इलेक्ट्रिशियन (वीज मिस्त्री)',
    icon: '⚡',
    workers: 128,
    group: 'technical',
  },
  {
    id: '11',
    name: 'Plumber',
    nameHi: 'प्लंबर (नल मिस्त्री)',
    nameGu: 'પ્લમ્બર (નળ મિસ્ત્રી)',
    nameMr: 'प्लंबर (नळ मिस्त्री)',
    icon: '🔧',
    workers: 110,
    group: 'technical',
  },
  {
    id: '12',
    name: 'Furniture Carpenter',
    nameHi: 'फर्नीचर बढ़ई (सुथार)',
    nameGu: 'ફર્નિચર સુથાર',
    nameMr: 'फर्निचर सुतार',
    icon: '🪚',
    workers: 88,
    group: 'construction',
  },
  {
    id: '13',
    name: 'Welder',
    nameHi: 'वेल्डर (फैब्रिकेशन)',
    nameGu: 'વેલ્ડર (ફેબ્રિકેશન)',
    nameMr: 'वेल्डर (फॅब्रिकेशन)',
    icon: '🔥',
    workers: 54,
    group: 'technical',
  },
  {
    id: '14',
    name: 'Wall Painter',
    nameHi: 'दीवार पेंटर (रंगाई)',
    nameGu: 'દિવાલ પેઇન્ટર (કલર કામ)',
    nameMr: 'वॉल पेंटर (रंगकाम)',
    icon: '🎨',
    workers: 92,
    group: 'other',
  },
  {
    id: '15',
    name: 'POP & False Ceiling',
    nameHi: 'पीओपी और फॉल्स सीलिंग',
    nameGu: 'પીઓપી અને ફોલ્સ સીલિંગ',
    nameMr: 'पीओपी आणि फॉल्स सिलिंग',
    icon: '📐',
    workers: 64,
    group: 'construction',
  },
  {
    id: '16',
    name: 'Metal Fabricator',
    nameHi: 'मेटल फैब्रिकेटर',
    nameGu: 'મેટલ ફેબ્રિકેટર',
    nameMr: 'मेटल फॅब्रिकेटर',
    icon: '⚙️',
    workers: 42,
    group: 'technical',
  },
  {
    id: '17',
    name: 'AC Technician',
    nameHi: 'एसी तकनीशियन',
    nameGu: 'એસી ટેકનિશિયન',
    nameMr: 'एसी तंत्रज्ञ',
    icon: '❄️',
    workers: 52,
    group: 'technical',
  },
  {
    id: '18',
    name: 'Cleaning & Housekeeping',
    nameHi: 'सफाई और हाउसकीपिंग',
    nameGu: 'સફાઈ અને હાઉસકીપિંગ',
    nameMr: 'स्वच्छता आणि हाउसकीपिंग',
    icon: '🧹',
    workers: 115,
    group: 'other',
  },
  {
    id: '19',
    name: 'Loading Labour',
    nameHi: 'लोडिंग / अनलोडिंग मजदूर',
    nameGu: 'લોડિંગ / અનલોડિંગ મજૂર',
    nameMr: 'लोडिंग / अनलोडिंग मजूर',
    icon: '📦',
    workers: 80,
    group: 'other',
  },
  {
    id: '20',
    name: 'Gardening (Mali)',
    nameHi: 'माली (बागवानी)',
    nameGu: 'માળી (બગીચો કામ)',
    nameMr: 'माळी (बागकाम)',
    icon: '🌱',
    workers: 38,
    group: 'other',
  },
  {
    id: '21',
    name: 'Demolition Worker',
    nameHi: 'तोड़फोड़ मजदूर',
    nameGu: 'તોડફોડ કામદાર',
    nameMr: 'तोडफोड कामगार',
    icon: '🔨',
    workers: 49,
    group: 'construction',
  },
  {
    id: '22',
    name: 'RCC Worker',
    nameHi: 'आरसीसी कारीगर',
    nameGu: 'આરસીસી કામદાર',
    nameMr: 'आरसीसी कामगार',
    icon: '🏢',
    workers: 56,
    group: 'construction',
  },
  {
    id: '23',
    name: 'Glass & Aluminium',
    nameHi: 'कांच और एल्युमीनियम',
    nameGu: 'કાચ અને એલ્યુમિનિયમ',
    nameMr: 'काच आणि ॲल्युमिनियम',
    icon: '🪟',
    workers: 34,
    group: 'technical',
  },
  {
    id: '24',
    name: 'CCTV & Security',
    nameHi: 'सीसीटीवी और सुरक्षा',
    nameGu: 'સીસીટીવી અને સુરક્ષા',
    nameMr: 'सीसीटीव्ही आणि सुरक्षा',
    icon: '📹',
    workers: 41,
    group: 'technical',
  },
  {
    id: '25',
    name: 'Earth/Soil Worker',
    nameHi: 'मिट्टी / खुदाई मजदूर',
    nameGu: 'માટી / ખોદકામ મજૂર',
    nameMr: 'माती / खोदकाम कामगार',
    icon: '⛏️',
    workers: 68,
    group: 'construction',
  },
];

export const CATEGORY_GROUPS = [
  { key: 'all',          label: 'All',          labelHi: 'सभी',      labelGu: 'બધું',     labelMr: 'सर्व' },
  { key: 'construction', label: 'Construction', labelHi: 'निर्माण',  labelGu: 'બાંધકામ',  labelMr: 'बांधकाम' },
  { key: 'technical',    label: 'Technical',    labelHi: 'तकनीकी',   labelGu: 'ટેકનિકલ',  labelMr: 'तांत्रिक' },
  { key: 'other',        label: 'Other',        labelHi: 'अन्य',     labelGu: 'અન્ય',     labelMr: 'इतर' },
];

/**
 * Returns translated Category Name according to the active language
 */
export function getCategoryDisplayName(category, lang = 'en') {
  if (!category) return '';
  if (lang === 'hi') return category.nameHi || category.name;
  if (lang === 'gu') return category.nameGu || category.name;
  if (lang === 'mr') return category.nameMr || category.name;
  return category.name;
}

/**
 * Returns translated Group Label
 */
export function getCategoryGroupLabel(group, lang = 'en') {
  if (!group) return '';
  if (lang === 'hi') return group.labelHi || group.label;
  if (lang === 'gu') return group.labelGu || group.label;
  if (lang === 'mr') return group.labelMr || group.label;
  return group.label;
}

/**
 * Translates raw worker skill/trade title (e.g. "Mason (Raj Mistri)", "Plumber", etc.)
 */
export function translateWorkerSkill(skill, lang = 'en') {
  if (!skill || typeof skill !== 'string') return '';
  if (lang === 'en') {
    // Strip any Devanagari / regional scripts so English mode is 100% pure English
    const cleaned = skill
      .replace(/\s*\([\u0900-\u097F\s/,-]+\)/g, '')
      .replace(/[\u0900-\u097F]+/g, '')
      .trim();
    return cleaned || skill;
  }

  const s = skill.toLowerCase();
  if (s.includes('mason helper') || s.includes('beldar')) {
    if (lang === 'hi') return 'मिस्त्री हेल्पर (बेलदार)';
    if (lang === 'gu') return 'મિસ્ત્રી હેલ્પર (બેલદાર)';
    if (lang === 'mr') return 'गवंडी मदतनीस (बेलदार)';
  }
  if (s.includes('mason') || s.includes('raj mistri')) {
    if (lang === 'hi') return 'राजमिस्त्री';
    if (lang === 'gu') return 'કડિયાકામ (મિસ્ત્રી)';
    if (lang === 'mr') return 'गवंडी (कारागीर)';
  }
  if (s.includes('plumber')) {
    if (lang === 'hi') return 'प्लंबर (नल मिस्त्री)';
    if (lang === 'gu') return 'પ્લમ્બર (નળ કારીગર)';
    if (lang === 'mr') return 'प्लंबर (नळ कारागीर)';
  }
  if (s.includes('electrician')) {
    if (lang === 'hi') return 'इलेक्ट्रीशियन (बिजली मिस्त्री)';
    if (lang === 'gu') return 'ઇલેક્ટ્રિશિયન (વીજળી કારીગર)';
    if (lang === 'mr') return 'इलेक्ट्रिशियन (वीज कारागीर)';
  }
  if (s.includes('carpenter') || s.includes('shuttering')) {
    if (lang === 'hi') return 'बढ़ई / सुथार';
    if (lang === 'gu') return 'સુથાર કામદાર';
    if (lang === 'mr') return 'सुतार कारागीर';
  }
  if (s.includes('painter') || s.includes('paint')) {
    if (lang === 'hi') return 'पेंटर (रंग-रोगन)';
    if (lang === 'gu') return 'પેઇન્ટર (કલર કામ)';
    if (lang === 'mr') return 'पेंटर (रंगकाम)';
  }
  if (s.includes('welder')) {
    if (lang === 'hi') return 'वेल्डर (लोहा मिस्त्री)';
    if (lang === 'gu') return 'વેલ્ડર (લોખંડ કામ)';
    if (lang === 'mr') return 'वेल्डर (लोखंड काम)';
  }
  if (s.includes('tile') || s.includes('marble')) {
    if (lang === 'hi') return 'टाइल और मार्बल कारीगर';
    if (lang === 'gu') return 'ટાઇલ્સ અને માર્બલ કારીગર';
    if (lang === 'mr') return 'टाइल आणि मार्बल कारागीर';
  }
  if (s.includes('labour') || s.includes('construction')) {
    if (lang === 'hi') return 'निर्माण मजदूर';
    if (lang === 'gu') return 'બાંધકામ મજૂર';
    if (lang === 'mr') return 'बांधकाम मजूर';
  }
  if (s.includes('contractor') || s.includes('crew')) {
    if (lang === 'hi') return 'ठेकेदार क्रू';
    if (lang === 'gu') return 'કોન્ટ્રાક્ટર ક્રૂ';
    if (lang === 'mr') return 'कंत्राटदार क्रू';
  }
  return skill;
}

/**
 * Translates city and location names (e.g. Sawai Madhopur, Rajasthan)
 */
export function translateLocationName(location, lang = 'en') {
  if (!location || typeof location !== 'string') {
    if (lang === 'hi') return 'सवाई माधोपुर, राजस्थान';
    if (lang === 'gu') return 'સવાઈ માધોપુર, રાજસ્થાન';
    if (lang === 'mr') return 'सवाई माधोपूर, राजस्थान';
    return 'Sawai Madhopur, Rajasthan';
  }
  if (lang === 'en') return location;

  let res = location;
  if (lang === 'hi') {
    res = res
      .replace(/Sawai Madhopur/gi, 'सवाई माधोपुर')
      .replace(/Rajasthan/gi, 'राजस्थान')
      .replace(/Jaipur/gi, 'जयपुर')
      .replace(/Delhi/gi, 'दिल्ली')
      .replace(/Mumbai/gi, 'मुंबई')
      .replace(/India/gi, 'भारत');
  } else if (lang === 'gu') {
    res = res
      .replace(/Sawai Madhopur/gi, 'સવાઈ માધોપુર')
      .replace(/Rajasthan/gi, 'રાજસ્થાન')
      .replace(/Jaipur/gi, 'જયપુર')
      .replace(/Delhi/gi, 'દિલ્હી')
      .replace(/Mumbai/gi, 'મુંબઈ')
      .replace(/India/gi, 'ભારત');
  } else if (lang === 'mr') {
    res = res
      .replace(/Sawai Madhopur/gi, 'सवाई माधोपूर')
      .replace(/Rajasthan/gi, 'राजस्थान')
      .replace(/Jaipur/gi, 'जयपूर')
      .replace(/Delhi/gi, 'दिल्ली')
      .replace(/Mumbai/gi, 'मुंबई')
      .replace(/India/gi, 'भारत');
  }
  return res;
}
