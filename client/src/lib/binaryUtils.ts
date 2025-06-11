import { Language } from './languageContext';

interface BinaryQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export function convertBinary(value: string, fromType: string, toType: string): string {
  if (fromType === "binary" && toType === "decimal") {
    return parseInt(value, 2).toString();
  } else if (fromType === "binary" && toType === "hex") {
    return parseInt(value, 2).toString(16).toUpperCase();
  } else if (fromType === "decimal" && toType === "binary") {
    return parseInt(value).toString(2);
  } else if (fromType === "decimal" && toType === "hex") {
    return parseInt(value).toString(16).toUpperCase();
  } else if (fromType === "hex" && toType === "binary") {
    // Convert each hex digit to 4 binary digits and pad if needed
    return value.split('').map(digit => {
      const binary = parseInt(digit, 16).toString(2);
      return binary.padStart(4, '0');
    }).join('');
  }
  return value; // Default fallback
}

// Helper functions for explanation generation
function buildBinaryToDecimalExplanationHtml(binValue: string, decimalValue: string, language: Language): string {
  const powerMethodTitle = language === 'en'
    ? 'Using the powers of 2 method:'
    : 'Met de machten van 2 methode:';

  let html = `<p>${powerMethodTitle}</p>`;
  html += '<div class="overflow-x-auto mt-2 mb-4">';
  html += '<table class="min-w-full border-collapse"><thead>';

  // First row - powers of 2 (from MSB to LSB)
  html += '<tr class="bg-slate-50 dark:bg-slate-800">';
  for (let i = binValue.length - 1; i >= 0; i--) {
    html += `<th class="py-1 px-2 text-center text-sm font-medium border">2<sup>${i}</sup> (${Math.pow(2, i)})</th>`;
  }
  html += '</tr></thead><tbody>';

  // Second row - binary digits (in correct order, MSB to LSB)
  html += '<tr>';
  for (let i = 0; i < binValue.length; i++) {
    html += `<td class="py-1 px-2 text-center font-mono font-bold border">${binValue[i]}</td>`;
  }
  html += '</tr>';

  // Third row - values where binary digit is 1
  html += '<tr>';
  let calculationSteps: string[] = [];
  for (let i = 0; i < binValue.length; i++) {
    const digit = binValue[i];
    const power = binValue.length - 1 - i; // Correct power for current bit position
    if (digit === '1') {
      html += `<td class="py-1 px-2 text-center border">${Math.pow(2, power)}</td>`;
      calculationSteps.push(`1×2<sup>${power}</sup> (${Math.pow(2, power)})`);
    } else {
      html += '<td class="py-1 px-2 text-center border">0</td>';
      calculationSteps.push(`0×2<sup>${power}</sup> (0)`);
    }
  }
  html += '</tr></tbody>';
  html += '</table></div>';

  const calculationIntro = language === 'en'
    ? 'To convert from binary to decimal, add up the powers of 2 where the binary digit is 1:'
    : 'Om van binair naar decimaal te gaan, tel je de machten van 2 op waar het binaire cijfer 1 is:';

  html += `<p class="mt-2">${calculationIntro}<br/>`;
  html += `${calculationSteps.join(' + ')} = ${decimalValue}</p>`;
  return html;
}

function buildDecimalToBinaryExplanationHtml(decimalValue: number, binaryValue: string, language: Language): string {
  let html = '';

  // Powers of 2 method explanation
  const powerMethodTitle = language === 'en'
    ? 'Using the powers of 2 method:'
    : 'Met de machten van 2 methode:';
  html += `<p>${powerMethodTitle}</p>`;

  html += '<div class="overflow-x-auto mt-2 mb-4">';
  html += '<table class="min-w-full border-collapse"><thead>';

  // First row - powers of 2 (from MSB to LSB based on final binary length)
  html += '<tr class="bg-slate-50 dark:bg-slate-800">';
  for (let i = binaryValue.length - 1; i >= 0; i--) {
    html += `<th class="py-1 px-2 text-center text-sm font-medium border">2<sup>${i}</sup> (${Math.pow(2, i)})</th>`;
  }
  html += '</tr></thead><tbody>';

  // Second row - binary digits (in correct order, MSB to LSB)
  html += '<tr>';
  for (let i = 0; i < binaryValue.length; i++) {
    html += `<td class="py-1 px-2 text-center font-mono font-bold border">${binaryValue[i]}</td>`;
  }
  html += '</tr>';

  // Third row - values where binary digit is 1
  html += '<tr>';
  let calculationSteps: string[] = [];
  for (let i = 0; i < binaryValue.length; i++) {
    const digit = binaryValue[i];
    const power = binaryValue.length - 1 - i; // Correct power for current bit position
    if (digit === '1') {
      html += `<td class="py-1 px-2 text-center border">${Math.pow(2, power)}</td>`;
      calculationSteps.push(`1×2<sup>${power}</sup> (${Math.pow(2, power)})`);
    } else {
      html += '<td class="py-1 px-2 text-center border">0</td>';
      calculationSteps.push(`0×2<sup>${power}</sup> (0)`);
    }
  }
  html += '</tr></tbody>';
  html += '</table></div>';

  const calculationIntro = language === 'en'
    ? 'To convert from binary to decimal, add up the powers of 2 where the binary digit is 1:'
    : 'Om van binair naar decimaal te gaan, tel je de machten van 2 op waar het binaire cijfer 1 is:';

  html += `<p class="mt-2">${calculationIntro}<br/>`;
  html += `${calculationSteps.join(' + ')} = ${decimalValue}</p>`;


  // Division method explanation
  const divisionIntro = language === 'en'
    ? 'Alternatively, using the division method:'
    : 'Als alternatief, met de delingsmethode:';

  html += `<p class="mt-4">${divisionIntro}</p>`;

  let tempValue = decimalValue;
  let steps = [];

  while (tempValue > 0) {
    const remainder = tempValue % 2;
    const remainderText = language === 'en' ? 'remainder' : 'rest';
    steps.push(`${tempValue} ÷ 2 = ${Math.floor(tempValue / 2)} ${remainderText} ${remainder}`);
    tempValue = Math.floor(tempValue / 2);
  }

  html += `<p class="mt-2">${steps.join('<br/>')}</p>`;

  const bottomToTop = language === 'en'
    ? 'Reading the remainders from bottom to top gives the binary result.'
    : 'De restwaarden van onder naar boven lezen geeft het binaire resultaat.';

  html += `<p class="mt-2">${bottomToTop}</p>`;
  return html;
}

// Helper to build Hex to Binary explanation
function buildHexToBinaryExplanationHtml(hexValue: string, binaryValue: string, language: Language): string {
  const explanationIntro = language === 'en'
    ? `Convert each hex digit to 4 binary digits:<br/>`
    : `Zet elk hexadecimaal cijfer om naar 4 binaire cijfers:<br/>`;

  let html = `<p class="mt-2">${explanationIntro}</p>`;

  for (let i = 0; i < hexValue.length; i++) {
    const digit = hexValue[i];
    const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');

    const arrowSymbol = language === 'en' ? '→' : '→';
    const hexLabel = language === 'en' ? 'Hex' : 'Hex';
    const binaryLabel = language === 'en' ? 'Binary' : 'Binair';

    html += `<p>${hexLabel} ${digit} ${arrowSymbol} ${binaryLabel} ${binaryGroup}</p>`;
  }
  return html;
}

// Helper to build Binary to Hex explanation
function buildBinaryToHexExplanationHtml(binValue: string, hexValue: string, language: Language): string {
  let html = '';
  const groupingText = language === 'en'
    ? `Group the binary into sets of 4 bits (padding with leading zeros if needed) and convert each group to its hexadecimal equivalent:`
    : `Groepeer het binaire getal in sets van 4 bits (met voorloopnullen indien nodig) en converteer elke groep naar zijn hexadecimale equivalent:`;

  html += `<p>${groupingText}</p><div class="font-mono mt-2">`;

  let paddedBinary = binValue.padStart(Math.ceil(binValue.length / 4) * 4, '0');
  for (let i = 0; i < paddedBinary.length; i += 4) {
    let group = paddedBinary.slice(i, i + 4);
    let hexDigit = parseInt(group, 2).toString(16).toUpperCase();
    html += `<p>${group} → ${hexDigit}</p>`;
  }
  html += `</div>`;
  return html;
}

// Helper to build Decimal to Hex explanation
function buildDecimalToHexExplanationHtml(decimalValue: number, hexValue: string, language: Language): string {
  let html = '';

  const divisionIntro = language === 'en'
    ? 'Using the division method (divide by 16 and record remainders):'
    : 'Met de delingsmethode (deel door 16 en noteer de restwaarden):';

  html += `<p>${divisionIntro}</p>`;

  let tempValue = decimalValue;
  let steps = [];
  const hexChars = '0123456789ABCDEF';

  while (tempValue > 0) {
    const remainder = tempValue % 16;
    const quotient = Math.floor(tempValue / 16);
    const remainderHex = hexChars[remainder];
    
    const remainderText = language === 'en' ? 'remainder' : 'rest';
    steps.push(`${tempValue} ÷ 16 = ${quotient} ${remainderText} ${remainder} (${remainderHex})`);
    tempValue = quotient;
  }
  
  html += `<p class="mt-2">${steps.reverse().join('<br/>')}</p>`; // Steps are built in reverse order, reverse them back

  const bottomToTop = language === 'en'
    ? 'Reading the remainders from bottom to top gives the hexadecimal result.'
    : 'De restwaarden van onder naar boven lezen geeft het hexadecimale resultaat.';

  html += `<p class="mt-2">${bottomToTop}</p>`;
  return html;
}

// Helper to build Hex to Decimal explanation
function buildHexToDecimalExplanationHtml(hexValue: string, decimalValue: string, language: Language): string {
  let html = '';

  const explanationIntro = language === 'en'
    ? `Multiply each hexadecimal digit by the corresponding power of 16 and sum the results:`
    : `Vermenigvuldig elk hexadecimaal cijfer met de corresponderende macht van 16 en tel de resultaten op:`;

  html += `<p>${explanationIntro}</p>`;

  let calculationSteps: string[] = [];
  const hexChars = '0123456789ABCDEF';

  for (let i = 0; i < hexValue.length; i++) {
    const digit = hexValue[i].toUpperCase();
    const value = hexChars.indexOf(digit);
    const power = hexValue.length - 1 - i;
    const term = `${value}×16<sup>${power}</sup>`;
    calculationSteps.push(term);
  }

  html += `<p class="mt-2">${calculationSteps.join(' + ')} = ${decimalValue}</p>`;
  return html;
}

// Helper to generate a random binary number of a given length
function generateRandomBinary(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 2).toString();
  }
  // Ensure we don't have all zeros (which isn't useful for learning)
  if (result.split('').every(bit => bit === '0')) {
    // Set at least one bit to 1 (randomly)
    const randomPosition = Math.floor(Math.random() * length);
    result = result.substring(0, randomPosition) + '1' + result.substring(randomPosition + 1);
  }
  // Ensure we don't start with 0 for most conversions
  if (result[0] === '0' && length > 1) {
    result = '1' + result.substring(1);
  }
  return result;
}

// Helper to generate a random hex number of a given length
function generateRandomHex(length: number): string {
  const hexChars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
  }
  
  // Ensure we don't have all zeros (which isn't useful for learning)
  if (result.split('').every(char => char === '0')) {
    // Set at least one character to a non-zero value (randomly)
    const randomPosition = Math.floor(Math.random() * length);
    const randomHexChar = hexChars[1 + Math.floor(Math.random() * 15)]; // Avoid '0'
    result = result.substring(0, randomPosition) + randomHexChar + result.substring(randomPosition + 1);
  }
  
  // Ensure we don't start with 0 for most conversions
  if (result[0] === '0' && length > 1) {
    result = hexChars[1 + Math.floor(Math.random() * 15)] + result.substring(1);
  }
  return result;
}

// Helper to generate a random decimal number in a given range
function generateRandomDecimal(min: number, max: number): number {
  // Generate a random number that isn't too trivial to convert
  let result: number;
  let isPowerOf2: boolean;

  // Avoid numbers that are powers of 2 or very close to them
  // as they're too simple for learning binary conversion
  do {
    result = Math.floor(Math.random() * (max - min + 1)) + min;
    // Check if it's a power of 2 (has exactly one bit set to 1)
    isPowerOf2 = (result > 0) && ((result & (result - 1)) === 0);
    // Also avoid 0 as it's too trivial
  } while (result === 0 || isPowerOf2);
  
  return result;
}

export function generateBinaryQuestion(conversionType: string, difficulty: string, language: Language = 'nl'): BinaryQuestion {
  let question = '';
  let answer = '';
  let explanation = '';
  
  // Determine the appropriate length/complexity based on difficulty
  let binaryLength = 4;
  let hexLength = 1;
  let decMin = 0;
  let decMax = 15;
  
  if (difficulty === 'medium') {
    binaryLength = 8;
    hexLength = 2;
    decMin = 16;
    decMax = 255;
  } else if (difficulty === 'hard') {
    binaryLength = 12;
    hexLength = 3;
    decMin = 256;
    decMax = 4095;
  }
  
  // Prepare question texts based on language
  const questionTextBinary = language === 'en' 
    ? 'Convert this binary number to '
    : 'Zet dit binaire getal om naar ';
    
  const questionTextHex = language === 'en'
    ? 'Convert this hexadecimal number to '
    : 'Zet dit hexadecimale getal om naar ';
    
  const questionTextDecimal = language === 'en'
    ? 'Convert this decimal number to '
    : 'Zet dit decimale getal om naar ';
    
  const decimalWord = language === 'en' ? 'decimal' : 'decimaal';
  const binaryWord = language === 'en' ? 'binary' : 'binair';
  const hexWord = language === 'en' ? 'hexadecimal' : 'hexadecimaal';
  
  switch (conversionType) {
    case 'bin2dec':
      const binValue = generateRandomBinary(binaryLength);
      question = questionTextBinary + decimalWord;
      answer = parseInt(binValue, 2).toString();
      
      // Translation-aware explanations
      const bin2decExplanation = language === 'en'
        ? `The binary number <span class="font-mono font-bold">${binValue}</span> equals <span class="font-mono font-bold">${answer}</span> in decimal.`
        : `Het binaire getal <span class="font-mono font-bold">${binValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in decimaal.`;
      
      explanation = bin2decExplanation;
      
      // Use the new helper function for explanation HTML
      explanation += buildBinaryToDecimalExplanationHtml(binValue, answer, language);
      break;
      
    case 'bin2hex':
      const binHexValue = generateRandomBinary(binaryLength);
      question = questionTextBinary + hexWord;
      answer = parseInt(binHexValue, 2).toString(16).toUpperCase();
      
      // Translation-aware explanations
      const bin2hexExplanation = language === 'en'
        ? `The binary number <span class="font-mono font-bold">${binHexValue}</span> equals <span class="font-mono font-bold">${answer}</span> in hexadecimal.`
        : `Het binaire getal <span class="font-mono font-bold">${binHexValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in hexadecimaal.`;
      
      explanation = bin2hexExplanation;
      explanation += buildBinaryToHexExplanationHtml(binHexValue, answer, language);
      break;
      
    case 'hex2bin':
      const hexValue = generateRandomHex(hexLength);
      question = questionTextHex + binaryWord;
      answer = '';
      
      // Convert each hex digit and build explanation
      for (let i = 0; i < hexValue.length; i++) {
        const digit = hexValue[i];
        const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');
        answer += binaryGroup;
      }

      // Translation-aware explanations
      const hex2binIntro = language === 'en'
        ? `The hexadecimal number <span class="font-mono font-bold">${hexValue}</span> equals <span class="font-mono font-bold">${answer}</span> in binary.`
        : `Het hexadecimale getal <span class="font-mono font-bold">${hexValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in binair.`;
      
      explanation = hex2binIntro;
      explanation += buildHexToBinaryExplanationHtml(hexValue, answer, language);
      break;
      
    case 'dec2bin':
      const decimalValue = generateRandomDecimal(decMin, decMax);
      question = questionTextDecimal + binaryWord;
      answer = decimalValue.toString(2);
      
      // Translation-aware explanations
      const dec2binExplanation = language === 'en'
        ? `The decimal number <span class="font-mono font-bold">${decimalValue}</span> equals <span class="font-mono font-bold">${answer}</span> in binary.`
        : `Het decimale getal <span class="font-mono font-bold">${decimalValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in binair.`;
      
      explanation = dec2binExplanation;
      explanation += buildDecimalToBinaryExplanationHtml(decimalValue, answer, language);
      break;

    case 'dec2hex':
      const decHexValue = generateRandomDecimal(decMin, decMax);
      question = questionTextDecimal + hexWord;
      answer = decHexValue.toString(16).toUpperCase();

      const dec2hexExplanation = language === 'en'
        ? `The decimal number <span class="font-mono font-bold">${decHexValue}</span> equals <span class="font-mono font-bold">${answer}</span> in hexadecimal.`
        : `Het decimale getal <span class="font-mono font-bold">${decHexValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in hexadecimaal.`;

      explanation = dec2hexExplanation;
      explanation += buildDecimalToHexExplanationHtml(decHexValue, answer, language);
      break;
      
    case 'hex2dec':
      const hexDecValue = generateRandomHex(hexLength);
      question = questionTextHex + decimalWord;
      answer = parseInt(hexDecValue, 16).toString();

      const hex2decExplanation = language === 'en'
        ? `The hexadecimal number <span class="font-mono font-bold">${hexDecValue}</span> equals <span class="font-mono font-bold">${answer}</span> in decimal.`
        : `Het hexadecimale getal <span class="font-mono font-bold">${hexDecValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in decimaal.`;

      explanation = hex2decExplanation;
      explanation += buildHexToDecimalExplanationHtml(hexDecValue, answer, language);
      break;

    default:
      question = 'Invalid conversion type';
      answer = '';
      explanation = '';
  }
  
  // All translations are now handled directly in the relevant switch case sections
  
  return { question, answer, explanation };
}
