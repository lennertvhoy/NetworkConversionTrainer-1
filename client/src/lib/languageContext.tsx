import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define supported languages
export type Language = 'en' | 'nl';

// Define the shape of our language context
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Define translation data
const translations: Record<string, Record<string, string>> = {
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
  
  // Binary conversion questions
  'binary.questions.bin2dec': {
    en: 'Convert this binary number to decimal',
    nl: 'Zet dit binaire getal om naar decimaal',
  },
  'binary.questions.bin2hex': {
    en: 'Convert this binary number to hexadecimal',
    nl: 'Zet dit binaire getal om naar hexadecimaal',
  },
  'binary.questions.hex2bin': {
    en: 'Convert this hexadecimal number to binary',
    nl: 'Zet dit hexadecimale getal om naar binair',
  },
  'binary.questions.dec2bin': {
    en: 'Convert this decimal number to binary',
    nl: 'Zet dit decimale getal om naar binair',
  },
  'binary.questions.default': {
    en: 'Convert this number',
    nl: 'Zet dit getal om',
  },
  
  // Binary tips section
  'binary.tips.title': {
    en: 'Conversion Tips',
    nl: 'Conversie Tips',
  },
  'binary.tips.bin2dec.title': {
    en: 'Binary to Decimal',
    nl: 'Binair naar Decimaal',
  },
  'binary.tips.bin2dec.description': {
    en: 'Each binary digit position represents a power of 2:',
    nl: 'Elke binaire digitpositie vertegenwoordigt een macht van 2:',
  },
  'binary.tips.hex2bin.title': {
    en: 'Hexadecimal to Binary',
    nl: 'Hexadecimaal naar Binair',
  },
  'binary.tips.hex2bin.description': {
    en: 'Each hex digit converts to 4 binary digits:',
    nl: 'Elk hexadecimaal cijfer zet om naar 4 binaire cijfers:',
  },
  'binary.tips.bin2hex.title': {
    en: 'Binary to Hexadecimal',
    nl: 'Binair naar Hexadecimaal',
  },
  'binary.tips.bin2hex.description': {
    en: 'Group binary digits into sets of 4, then convert each group:',
    nl: 'Groepeer binaire cijfers in sets van 4, en zet elke groep om:',
  },
  'binary.tips.position': {
    en: 'Position',
    nl: 'Positie',
  },
  'binary.tips.value': {
    en: 'Value',
    nl: 'Waarde',
  },
  'binary.tips.hex': {
    en: 'Hex',
    nl: 'Hex',
  },
  'binary.tips.binary': {
    en: 'Binary',
    nl: 'Binair',
  },
  'binary.tips.example': {
    en: 'Example',
    nl: 'Voorbeeld',
  },
  'binary.tips.bin2hex.step1': {
    en: 'Group',
    nl: 'Groepeer',
  },
  'binary.tips.bin2hex.step2': {
    en: 'Convert',
    nl: 'Converteer',
  },
  'binary.tips.bin2hex.step3': {
    en: 'Result',
    nl: 'Resultaat',
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
  'subnetting.type.hosts-per-subnet': {
    en: 'Subnet by Host Count',
    nl: 'Subnetten op Basis van Hosts',
  },
  'subnetting.type.subnets-count': {
    en: 'Subnet by Network Count',
    nl: 'Subnetten op Basis van Aantal',
  },
  'subnetting.type.vlsm': {
    en: 'VLSM Subnetting',
    nl: 'VLSM Subnetting',
  },
  'subnetting.type.wildcard': {
    en: 'Wildcard Masks',
    nl: 'Wildcard Masks',
  },
  'subnetting.type.network': {
    en: 'Network Calculations',
    nl: 'Netwerkberekeningen',
  },
  'subnetting.type.ipv6': {
    en: 'IPv6 Subnetting',
    nl: 'IPv6 Subnetting',
  },
  'subnetting.calculateSubnet': {
    en: 'Calculate subnet information',
    nl: 'Bereken subnet informatie',
  },
  'subnetting.calculateInfo': {
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
  'subnetting.placeholder.mask': {
    en: 'Enter answer in requested format',
    nl: 'Geef antwoord in gevraagd formaat',
  },
  'subnetting.placeholder.cidr': {
    en: 'e.g., /24',
    nl: 'bijv. /24',
  },
  'subnetting.placeholder.decimal': {
    en: 'e.g., 255.255.255.0',
    nl: 'bijv. 255.255.255.0',
  },
  'subnetting.placeholder.ip': {
    en: 'e.g., 192.168.1.0',
    nl: 'bijv. 192.168.1.0',
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
  
  // Reference formulas section
  'subnetting.reference.formula.title': {
    en: 'Subnetting Formulas',
    nl: 'Subnetting Formules',
  },
  'subnetting.reference.formula.hosts': {
    en: 'Number of Usable Hosts',
    nl: 'Aantal Bruikbare Hosts',
  },
  'subnetting.reference.formula.hosts.desc': {
    en: 'Where n is the number of host bits (bits set to 0 in the subnet mask)',
    nl: 'Waarbij n het aantal host-bits is (bits ingesteld op 0 in het subnetmasker)',
  },
  'subnetting.reference.formula.subnets': {
    en: 'Number of Subnets',
    nl: 'Aantal Subnetten',
  },
  'subnetting.reference.formula.subnets.desc': {
    en: 'Where m is the number of subnet bits (borrowed from host bits)',
    nl: 'Waarbij m het aantal subnet-bits is (geleend van host-bits)',
  },
  'subnetting.reference.formula.subnet.formula': {
    en: 'Subnet Increment Calculation',
    nl: 'Subnet Increment Berekening',
  },
  'subnetting.reference.formula.subnet.desc': {
    en: 'Calculate the increment between subnets in the octet where the subnet boundary falls',
    nl: 'Bereken de increment tussen subnetten in het octet waar de subnetgrens valt',
  },
  
  // Reference process section
  'subnetting.reference.process.title': {
    en: 'Subnetting Process',
    nl: 'Subnetting Proces',
  },
  'subnetting.reference.process.comprehensive.title': {
    en: 'Comprehensive Subnet Calculation',
    nl: 'Uitgebreide Subnet Berekening',
  },
  'subnetting.reference.process.comprehensive.step1': {
    en: 'Identify how many subnets are needed',
    nl: 'Identificeer hoeveel subnetten nodig zijn',
  },
  'subnetting.reference.process.comprehensive.step2': {
    en: 'Calculate how many subnet bits are required',
    nl: 'Bereken hoeveel subnet-bits vereist zijn',
  },
  'subnetting.reference.process.comprehensive.step3': {
    en: 'Determine the new subnet mask and CIDR',
    nl: 'Bepaal het nieuwe subnetmasker en CIDR',
  },
  'subnetting.reference.process.comprehensive.step4': {
    en: 'Calculate the subnet address range for each subnet',
    nl: 'Bereken het subnetadresbereik voor elk subnet',
  },
  'subnetting.reference.process.comprehensive.step5': {
    en: 'Calculate the usable host range for each subnet',
    nl: 'Bereken het bruikbare hostbereik voor elk subnet',
  },
  
  // Wildcards section
  'subnetting.reference.wildcards.title': {
    en: 'Wildcard Masks',
    nl: 'Wildcard Maskers',
  },
  'subnetting.reference.wildcards.desc': {
    en: 'Wildcard masks are the inverse of subnet masks, typically used in ACLs. Invert each bit of the subnet mask to get the wildcard mask.',
    nl: 'Wildcard-maskers zijn het omgekeerde van subnetmaskers, meestal gebruikt in ACLs. Inverteer elk bit van het subnetmasker om het wildcard-masker te krijgen.',
  },
  
  // IPv6 section
  'subnetting.reference.ipv6.title': {
    en: 'IPv6 Notation',
    nl: 'IPv6 Notatie',
  },
  'subnetting.reference.ipv6.desc': {
    en: 'IPv6 addresses can be abbreviated by removing leading zeros in each hextet and replacing consecutive groups of zeros with a double colon (::).',
    nl: 'IPv6-adressen kunnen worden afgekort door voorloopnullen in elk hextet te verwijderen en opeenvolgende groepen nullen te vervangen door een dubbele dubbele punt (::).',
  },
  
  // Subnetting field labels
  'subnetting.fields.networkAddress': {
    en: 'Network Address',
    nl: 'Netwerkadres',
  },
  'subnetting.fields.broadcastAddress': {
    en: 'Broadcast Address',
    nl: 'Broadcastadres',
  },
  'subnetting.fields.firstHost': {
    en: 'First Host',
    nl: 'Eerste Host',
  },
  'subnetting.fields.lastHost': {
    en: 'Last Host',
    nl: 'Laatste Host',
  },
  'subnetting.fields.subnetMask': {
    en: 'Subnet Mask',
    nl: 'Subnet Masker',
  },
  'subnetting.fields.numberOfHosts': {
    en: 'Number of Hosts',
    nl: 'Aantal Hosts',
  },
  'subnetting.fields.wildcardMask': {
    en: 'Wildcard Mask',
    nl: 'Wildcard Masker',
  },
  'subnetting.fields.summaryNetwork': {
    en: 'Summary Network',
    nl: 'Samenvattingsnetwerk',
  },
  'subnetting.fields.summaryMask': {
    en: 'Summary Mask',
    nl: 'Samenvattingsmasker',
  },
  'subnetting.fields.requiredPrefix': {
    en: 'Required Prefix',
    nl: 'Vereiste Prefix',
  },
  'subnetting.fields.prefixLength': {
    en: 'Prefix Length',
    nl: 'Prefix Lengte',
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

// Create default context state
const defaultState: LanguageContextType = {
  language: 'nl', // Nederlands is the default language
  setLanguage: () => {},
  t: (key: string) => key,
};

// Create the context
const LanguageContext = createContext<LanguageContextType>(defaultState);

// Create a hook to use the context
export const useLanguage = () => {
  return useContext(LanguageContext);
}

// Define provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Create the provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Set the default language to Nederlands
  const [language, setLanguage] = useState<Language>('nl');

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    return translations[key][language] || key;
  };

  // Create context value
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