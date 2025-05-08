import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const defaultState: LanguageContextType = {
  language: 'nl', // Nederlands is the default language
  setLanguage: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultState);

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('nl'); // Nederlands is the default language
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load translations
  useEffect(() => {
    // In a real app, we would fetch translations from an API or a separate file
    // For this example, we'll include them inline
    const loadedTranslations: Record<string, Record<string, string>> = {
      // Common UI elements
      'app.title': {
        en: 'Network Practice',
        nl: 'Netwerkoefeningen',
      },
      'app.darkMode': {
        en: 'Dark Mode',
        nl: 'Donkere Modus',
      },
      'app.lightMode': {
        en: 'Light Mode',
        nl: 'Lichte Modus',
      },
      'app.language': {
        en: 'Language',
        nl: 'Taal',
      },
      
      // Navigation
      'nav.home': {
        en: 'Home',
        nl: 'Start',
      },
      'nav.binary': {
        en: 'Binary Conversion',
        nl: 'Binaire Conversie',
      },
      'nav.subnetting': {
        en: 'Subnetting',
        nl: 'Subnetting',
      },
      
      // Home page
      'home.title': {
        en: 'Network Practice Tools',
        nl: 'Netwerk Oefentools',
      },
      'home.subtitle': {
        en: 'Learn and practice essential networking concepts',
        nl: 'Leer en oefen essentiële netwerktechnieken',
      },
      'home.binarySection.title': {
        en: 'Binary Conversion',
        nl: 'Binaire Conversie',
      },
      'home.binarySection.description': {
        en: 'Practice converting between binary, decimal, and hexadecimal',
        nl: 'Oefen met het converteren tussen binair, decimaal en hexadecimaal',
      },
      'home.binarySection.button': {
        en: 'Start Binary Practice',
        nl: 'Start Binaire Oefeningen',
      },
      'home.subnettingSection.title': {
        en: 'IP Subnetting',
        nl: 'IP Subnetting',
      },
      'home.subnettingSection.description': {
        en: 'Master IP addressing, subnetting, and VLSM concepts',
        nl: 'Beheers IP-adressering, subnetting en VLSM-concepten',
      },
      'home.subnettingSection.button': {
        en: 'Start Subnetting Practice',
        nl: 'Start Subnetting Oefeningen',
      },
      'home.about.title': {
        en: 'About This Application',
        nl: 'Over Deze Applicatie',
      },
      'home.about.description': {
        en: 'This application helps you practice binary conversions and subnetting concepts that are essential for networking professionals and students preparing for certifications like CCNA.',
        nl: 'Deze applicatie helpt je bij het oefenen van binaire conversies en subnetting-concepten die essentieel zijn voor netwerkprofessionals en studenten die zich voorbereiden op certificeringen zoals CCNA.',
      },
      'home.about.practiceExercises': {
        en: 'The practice exercises include:',
        nl: 'De oefenopdrachten omvatten:',
      },
      'home.about.exercise1': {
        en: 'Binary to decimal, hexadecimal, and reverse conversions',
        nl: 'Binair naar decimaal, hexadecimaal en omgekeerde conversies',
      },
      'home.about.exercise2': {
        en: 'Basic subnetting (network address, broadcast address, host range)',
        nl: 'Basis subnetting (netwerkadres, broadcastadres, hostbereik)',
      },
      'home.about.exercise3': {
        en: 'VLSM (Variable Length Subnet Masking) for efficient network design',
        nl: 'VLSM (Variable Length Subnet Masking) voor efficiënt netwerkontwerp',
      },
      'home.about.exercise4': {
        en: 'Wildcard mask calculations for access control lists',
        nl: 'Wildcard-maskerberekeningen voor toegangscontrolelijsten',
      },
      'home.about.exercise5': {
        en: 'Network calculations with realistic scenarios',
        nl: 'Netwerkberekeningen met realistische scenario\'s',
      },
      'home.about.chooseArea': {
        en: 'Choose your practice area and difficulty level to get started. Each exercise provides detailed explanations to help you understand the concepts better.',
        nl: 'Kies je oefengebied en moeilijkheidsgraad om te beginnen. Elke oefening biedt gedetailleerde uitleg om de concepten beter te begrijpen.',
      },
      
      // Binary Conversion page
      'binary.title': {
        en: 'Binary Conversion Practice',
        nl: 'Binaire Conversie Oefening',
      },
      'binary.subtitle': {
        en: 'Convert between binary, decimal, and hexadecimal number systems',
        nl: 'Converteer tussen binaire, decimale en hexadecimale getallenstelsels',
      },
      'binary.type.bin2dec': {
        en: 'Binary to Decimal',
        nl: 'Binair naar Decimaal',
      },
      'binary.type.bin2hex': {
        en: 'Binary to Hexadecimal',
        nl: 'Binair naar Hexadecimaal',
      },
      'binary.type.hex2bin': {
        en: 'Hexadecimal to Binary',
        nl: 'Hexadecimaal naar Binair',
      },
      'binary.type.dec2bin': {
        en: 'Decimal to Binary',
        nl: 'Decimaal naar Binair',
      },
      'binary.difficulty': {
        en: 'Difficulty',
        nl: 'Moeilijkheidsgraad',
      },
      'binary.difficulty.easy': {
        en: 'Easy',
        nl: 'Makkelijk',
      },
      'binary.difficulty.medium': {
        en: 'Medium',
        nl: 'Gemiddeld',
      },
      'binary.difficulty.hard': {
        en: 'Hard',
        nl: 'Moeilijk',
      },
      'binary.yourAnswer': {
        en: 'Your Answer',
        nl: 'Jouw Antwoord',
      },
      'binary.check': {
        en: 'Check',
        nl: 'Controleren',
      },
      'binary.skip': {
        en: 'Skip',
        nl: 'Overslaan',
      },
      'binary.nextQuestion': {
        en: 'Next Question',
        nl: 'Volgende Vraag',
      },
      'binary.newQuestion': {
        en: 'New Question',
        nl: 'Nieuwe Vraag',
      },
      'binary.correct': {
        en: 'Correct!',
        nl: 'Correct!',
      },
      'binary.incorrect': {
        en: 'Incorrect',
        nl: 'Onjuist',
      },
      'binary.correctAnswerIs': {
        en: 'The correct answer is',
        nl: 'Het juiste antwoord is',
      },
      'binary.emptyAnswer': {
        en: 'Empty answer',
        nl: 'Leeg antwoord',
      },
      'binary.pleaseEnterAnswer': {
        en: 'Please enter your answer before checking.',
        nl: 'Voer je antwoord in voordat je controleert.',
      },
      
      // Subnetting page
      'subnetting.title': {
        en: 'IP Subnetting Practice',
        nl: 'IP Subnetting Oefening',
      },
      'subnetting.subtitle': {
        en: 'Master IP addressing, subnetting, and VLSM concepts',
        nl: 'Beheers IP-adressering, subnetting en VLSM-concepten',
      },
      'subnetting.type': {
        en: 'Subnet Type',
        nl: 'Subnet Type',
      },
      'subnetting.type.basic': {
        en: 'Basic Subnetting',
        nl: 'Basis Subnetting',
      },
      'subnetting.type.vlsm': {
        en: 'VLSM Subnetting',
        nl: 'VLSM Subnetting',
      },
      'subnetting.type.wildcard': {
        en: 'Wildcard Masks',
        nl: 'Wildcard Maskers',
      },
      'subnetting.type.network': {
        en: 'Network Calculations',
        nl: 'Netwerkberekeningen',
      },
      'subnetting.calculateSubnet': {
        en: 'Calculate subnet information',
        nl: 'Bereken subnet informatie',
      },
      'subnetting.checkAnswer': {
        en: 'Check Answer',
        nl: 'Controleer Antwoord',
      },
      'subnetting.skip': {
        en: 'Skip',
        nl: 'Overslaan',
      },
      'subnetting.nextQuestion': {
        en: 'Next Question',
        nl: 'Volgende Vraag',
      },
      'subnetting.newQuestion': {
        en: 'New Question',
        nl: 'Nieuwe Vraag',
      },
      'subnetting.correct': {
        en: 'Correct!',
        nl: 'Correct!',
      },
      'subnetting.incorrect': {
        en: 'Incorrect',
        nl: 'Onjuist',
      },
      'subnetting.correctAnswersAre': {
        en: 'The correct answers are:',
        nl: 'De juiste antwoorden zijn:',
      },
      'subnetting.incompleteAnswer': {
        en: 'Incomplete answer',
        nl: 'Onvolledig antwoord',
      },
      'subnetting.fillAllFields': {
        en: 'Please fill in all fields before checking your answer.',
        nl: 'Vul alle velden in voordat je je antwoord controleert.',
      },
      'subnetting.reference.title': {
        en: 'Subnetting Reference',
        nl: 'Subnetting Referentie',
      },
      'subnetting.reference.table.title': {
        en: 'Subnet Mask Reference Table',
        nl: 'Subnet Masker Referentietabel',
      },
      'subnetting.reference.table.cidr': {
        en: 'CIDR',
        nl: 'CIDR',
      },
      'subnetting.reference.table.mask': {
        en: 'Subnet Mask',
        nl: 'Subnet Masker',
      },
      'subnetting.reference.table.hosts': {
        en: 'Hosts Per Subnet',
        nl: 'Hosts Per Subnet',
      },
      'subnetting.reference.table.bits': {
        en: 'Subnet Bits',
        nl: 'Subnet Bits',
      },
      'subnetting.reference.vlsm.title': {
        en: 'VLSM Steps',
        nl: 'VLSM Stappen',
      },
      'subnetting.reference.vlsm.step1.title': {
        en: 'Sort requirements by size',
        nl: 'Sorteer vereisten op grootte',
      },
      'subnetting.reference.vlsm.step1.desc': {
        en: 'Arrange networks from largest to smallest based on host requirements.',
        nl: 'Rangschik netwerken van grootste naar kleinste op basis van hostvereisten.',
      },
      'subnetting.reference.vlsm.step2.title': {
        en: 'Calculate subnet sizes',
        nl: 'Bereken subnet-groottes',
      },
      'subnetting.reference.vlsm.step2.desc': {
        en: 'For each network, find the appropriate subnet mask using the formula 2^n - 2 ≥ hosts needed, where n is the number of host bits.',
        nl: 'Voor elk netwerk, vind het juiste subnet masker met de formule 2^n - 2 ≥ benodigde hosts, waar n het aantal hostbits is.',
      },
      'subnetting.reference.vlsm.step3.title': {
        en: 'Allocate address space',
        nl: 'Wijs adresruimte toe',
      },
      'subnetting.reference.vlsm.step3.desc': {
        en: 'Start with the largest subnet and assign addresses sequentially.',
        nl: 'Begin met het grootste subnet en wijs adressen opeenvolgend toe.',
      },
      'subnetting.reference.vlsm.step4.title': {
        en: 'Document assignments',
        nl: 'Documenteer toewijzingen',
      },
      'subnetting.reference.vlsm.step4.desc': {
        en: 'Record each network address, subnet mask, range of usable addresses, and broadcast address.',
        nl: 'Registreer elk netwerkadres, subnet masker, bereik van bruikbare adressen en broadcastadres.',
      },
      'subnetting.reference.vlsm.example.title': {
        en: 'Example VLSM Calculation',
        nl: 'Voorbeeld VLSM Berekening',
      },
      
      // Not found page
      'notFound.title': {
        en: 'Page Not Found',
        nl: 'Pagina Niet Gevonden',
      },
      'notFound.message': {
        en: 'The page you are looking for does not exist.',
        nl: 'De pagina die je zoekt bestaat niet.',
      },
      'notFound.return': {
        en: 'Return to Home',
        nl: 'Terug naar Start',
      },
    };

    setTranslations(loadedTranslations);
  }, []);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    return translations[key][language] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};