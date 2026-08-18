export const LANGUAGES = ["en", "hi", "gu"] as const;
export type Lang = (typeof LANGUAGES)[number];

export type Localized = Record<Lang, string>;

export const LANGUAGE_META: {
  code: Lang;
  label: string;
  native: string;
  sample: string;
}[] = [
  { code: "en", label: "English", native: "English", sample: "Know your spine" },
  { code: "hi", label: "Hindi", native: "हिन्दी", sample: "अपनी रीढ़ को जानें" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", sample: "તમારી કરોડરજ્જુ જાણો" },
];

type Dict = Record<string, Localized>;

export const ui: Dict = {
  brand: {
    en: "Stavya Spine Hospital",
    hi: "स्तव्य स्पाइन हॉस्पिटल",
    gu: "સ્તવ્ય સ્પાઇન હોસ્પિટલ",
  },
  awarenessProgram: {
    en: "Spine Awareness Quiz",
    hi: "स्पाइन जागरूकता क्विज़",
    gu: "સ્પાઇન જાગૃતિ ક્વિઝ",
  },
  heroTitle: {
    en: "Every Spine Has a Story",
    hi: "हर रीढ़ की एक कहानी होती है",
    gu: "દરેક કરોડરજ્જુની એક વાર્તા હોય છે",
  },
  heroSubtitle: {
    en: "Know yours.",
    hi: "अपनी जानें।",
    gu: "તમારી જાણો.",
  },
  heroNote: {
    en: "A calm, guided journey for you and your family while you wait.",
    hi: "प्रतीक्षा के दौरान आपके और आपके परिवार के लिए एक शांत, मार्गदर्शित यात्रा।",
    gu: "રાહ જોતી વખતે તમારા અને પરિવાર માટે એક શાંત, માર્ગદર્શિત યાત્રા.",
  },
  start: {
    en: "Start My Spine Journey",
    hi: "मेरी स्पाइन यात्रा शुरू करें",
    gu: "મારી સ્પાઇન યાત્રા શરૂ કરો",
  },
  minutes: { en: "Hardly 5 min", hi: "सिर्फ 5 मिनट", gu: "માત્ર 5 મિનિટ" },
  questionsCount: { en: "Just 6 questions", hi: "केवल 6 सवाल", gu: "માત્ર 6 પ્રશ્નો" },
  freeAnonymous: { en: "Free & anonymous", hi: "निःशुल्क और गुमनाम", gu: "મફત અને અનામી" },
  detailsTitle: { en: "Tell us about you", hi: "अपने बारे में बताएं", gu: "તમારા વિશે જણાવો" },
  detailsSubtitle: {
    en: "This helps us personalise your awareness report.",
    hi: "इससे हम आपकी जागरूकता रिपोर्ट को व्यक्तिगत बना पाते हैं।",
    gu: "આથી અમે તમારો જાગૃતિ રિપોર્ટ વ્યક્તિગત બનાવી શકીએ.",
  },
  name: { en: "Full name", hi: "पूरा नाम", gu: "પૂરું નામ" },
  namePlaceholder: { en: "e.g. Ramesh Patel", hi: "जैसे रमेश पटेल", gu: "દા.ત. રમેશ પટેલ" },
  age: { en: "Age", hi: "आयु", gu: "ઉંમર" },
  gender: { en: "Gender", hi: "लिंग", gu: "લિંગ" },
  male: { en: "Male", hi: "पुरुष", gu: "પુરુષ" },
  female: { en: "Female", hi: "महिला", gu: "સ્ત્રી" },
  other: { en: "Other", hi: "अन्य", gu: "અન્ય" },
  mobile: {
    en: "Mobile number",
    hi: "मोबाइल नंबर",
    gu: "મોબાઇલ નંબર",
  },
  consent: {
    en: "I agree that my responses may be used for improving spine health awareness.",
    hi: "मैं सहमत हूँ कि मेरी प्रतिक्रियाएँ स्पाइन जागरूकता सुधारने हेतु उपयोग की जा सकती हैं।",
    gu: "હું સંમત છું કે મારા પ્રતિસાદ સ્પાઇન જાગૃતિ સુધારવા માટે વપરાય શકે છે.",
  },
  continue: { en: "Continue", hi: "आगे बढ़ें", gu: "આગળ વધો" },
  back: { en: "Back", hi: "वापस", gu: "પાછળ" },
  languageTitle: { en: "Choose your language", hi: "अपनी भाषा चुनें", gu: "તમારી ભાષા પસંદ કરો" },
  languageSubtitle: {
    en: "You can learn in the language you are most comfortable with.",
    hi: "आप उस भाषा में सीख सकते हैं जिसमें आप सहज हैं।",
    gu: "તમે જે ભાષામાં સહજ છો તેમાં શીખી શકો છો.",
  },
  journeyTitle: {
    en: "Your spine story",
    hi: "आपकी रीढ़ की कहानी",
    gu: "તમારી કરોડરજ્જુની વાર્તા",
  },
  beginJourney: { en: "Begin Journey", hi: "यात्रा शुरू करें", gu: "યાત્રા શરૂ કરો" },
  skip: { en: "Skip", hi: "छोड़ें", gu: "છોડો" },
  question: { en: "Question", hi: "प्रश्न", gu: "પ્રશ્ન" },
  of: { en: "of", hi: "में से", gu: "માંથી" },
  seconds: { en: "s", hi: "से", gu: "સે" },
  complete: { en: "complete", hi: "पूर्ण", gu: "પૂર્ણ" },
  timesUp: {
    en: "Time's up — here's the answer",
    hi: "समय समाप्त — उत्तर देखें",
    gu: "સમય પૂરો — જવાબ જુઓ",
  },
  correct: { en: "Correct", hi: "सही", gu: "સાચું" },
  goodTry: { en: "Good try", hi: "अच्छा प्रयास", gu: "સારો પ્રયાસ" },
  nextIn: { en: "Next in", hi: "अगला", gu: "આગળ" },
  preparingReport: {
    en: "Preparing your spine report",
    hi: "आपकी स्पाइन रिपोर्ट तैयार हो रही है",
    gu: "તમારો સ્પાઇન રિપોર્ટ તૈયાર થઈ રહ્યો છે",
  },
  reportTitle: {
    en: "Your Spine Awareness Score",
    hi: "आपका स्पाइन जागरूकता स्कोर",
    gu: "તમારો સ્પાઇન જાગૃતિ સ્કોર",
  },
  levelExcellent: { en: "Excellent", hi: "उत्कृष्ट", gu: "ઉત્તમ" },
  levelGood: { en: "Good", hi: "अच्छा", gu: "सारूं" },
  levelNeedsAttention: { en: "Needs Attention", hi: "ध्यान देने योग्य", gu: "ધ્યાન જરૂરી" },
  topicsLearned: { en: "Topics you learned", hi: "आपने जो विषय सीखे", gu: "તમે શીખેલા વિષયો" },
  recommendations: { en: "Three simple improvements", hi: "तीन आसान सुधार", gu: "ત્રણ સરળ સુધારા" },
  achievement: { en: "Achievement unlocked", hi: "उपलब्धि प्राप्त", gu: "સિદ્ધિ મેળવી" },
  restart: { en: "Restart Journey", hi: "फिर से शुरू करें", gu: "ફરી શરૂ કરો" },
  share: { en: "Share", hi: "साझा करें", gu: "શેર કરો" },
  finish: { en: "Finish", hi: "समाप्त", gu: "સમાપ્ત" },
  thankYou: { en: "Thank you", hi: "धन्यवाद", gu: "આભાર" },
  thankYouBody: {
    en: "Your awareness matters. Our spine specialists are happy to answer any question during your consultation.",
    hi: "आपकी जागरूकता महत्वपूर्ण है। हमारे स्पाइन विशेषज्ञ परामर्श के दौरान आपके प्रश्नों का उत्तर देंगे।",
    gu: "તમારી જાગૃતિ મહત્વની છે. અમારા સ્પાઇન નિષ્ણાતો પરામર્શ દરમિયાન તમારા પ્રશ્નોના જવાબ આપશે.",
  },
  shareText: {
    en: "I scored {score}% on the Stavya Spine Hospital awareness journey!",
    hi: "मैंने स्तव्य स्पाइन हॉस्पिटल जागरूकता यात्रा में {score}% प्राप्त किया!",
    gu: "મેં સ્તવ્ય સ્પાઇન હોસ્પિટલ જાગૃતિ યાત્રામાં {score}% મેળવ્યા!",
  },
  copied: {
    en: "Copied to clipboard",
    hi: "क्लिपबोर्ड पर कॉपी हुआ",
    gu: "ક્લિપબોર્ડ પર કૉપિ થયું",
  },
  nameRequired: {
    en: "Please enter your name",
    hi: "कृपया अपना नाम दर्ज करें",
    gu: "કૃપા કરી તમારું નામ લખો",
  },
  ageRequired: {
    en: "Please enter a valid age",
    hi: "कृपया सही आयु दर्ज करें",
    gu: "કૃપા કરી સાચી ઉંમર લખો",
  },
  consentRequired: {
    en: "Please accept to continue",
    hi: "जारी रखने के लिए सहमति दें",
    gu: "આગળ વધવા સંમતિ આપો",
  },
  claimPrizeTitle: {
    en: "Claim Your Spine Prize!",
    hi: "अपना स्पाइन पुरस्कार प्राप्त करें!",
    gu: "તમારી સ્પાઇન ભેટ મેળવો!",
  },
  claimPrizeSubtitle: {
    en: "Scratch your card below to reveal your spine health prize!",
    hi: "अपना पुरस्कार देखने के लिए नीचे कार्ड स्क्रैच करें!",
    gu: "તમારી ભેટ જોવા માટે નીચે આપેલ કાર્ડ સ્ક્રેચ કરો!",
  },
  skipForNow: {
    en: "Skip for now",
    hi: "अभी छोड़ें",
    gu: "હમણાં છોડો",
  },
  scratchCardTitle: {
    en: "Scratch & Win!",
    hi: "स्क्रैच करें और जीतें!",
    gu: "સ્ક્રેચ કરો અને જીતો!",
  },
  scratchCardSubtitle: {
    en: "Scratch the card below to reveal your prize",
    hi: "अपना पुरस्कार देखने के लिए नीचे दिए गए कार्ड को स्क्रैच करें",
    gu: "તમારી ભેટ જોવા માટે નીચે આપેલ કાર્ડ સ્ક્રેચ કરો",
  },
  scratchedEnough: {
    en: "Congratulations! You won:",
    hi: "बधाई हो! आपने जीता:",
    gu: "અભિનંદન! તમે જીત્યા:",
  },
  claimCode: {
    en: "Show this code at reception to claim your prize:",
    hi: "अपना पुरस्कार पाने के लिए रिसेप्शन पर यह कोड दिखाएं:",
    gu: "તમારી ભેટ મેળવવા માટે રિસેપ્શન પર આ કોડ બતાવો:",
  },
  collectPrize: {
    en: "Collect Prize",
    hi: "पुरस्कार प्राप्त करें",
    gu: "ભેટ મેળવો",
  },
  spinePrizeGold: {
    en: "Free Spine Consultation + Health Kit",
    hi: "मुफ़्त स्पाइन परामर्श + स्वास्थ्य किट",
    gu: "મફત સ્પાઇન કન્સલ્ટેશન + હેલ્થ કીટ",
  },
  spinePrizeSilver: {
    en: "Spine Health Guide & Stress Ball",
    hi: "स्पाइन स्वास्थ्य गाइड और स्ट्रेस बॉल",
    gu: "સ્પાઇન હેલ્થ ગાઇડ અને સ્ટ્રેસ બોલ",
  },
  spinePrizeParticipation: {
    en: "Spine Health Booklet & Bookmark",
    hi: "स्पाइन स्वास्थ्य पुस्तिका और बुकमार्क",
    gu: "સ્પાઇન હેલ્થ બુકલેટ અને બુકમાર્ક",
  },
};

export function t(key: keyof typeof ui | string, lang: Lang): string {
  const entry = ui[key as string];
  return entry ? entry[lang] ?? entry.en : (key as string);
}

export function L(value: Localized | string | undefined, lang: Lang): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? "";
}
