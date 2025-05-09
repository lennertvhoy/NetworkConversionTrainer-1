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
  } else if (fromType === "hex" && toType === "binary") {
    // Convert each hex digit to 4 binary digits and pad if needed
    return value.split('').map(digit => {
      const binary = parseInt(digit, 16).toString(2);
      return binary.padStart(4, '0');
    }).join('');
  }
  return value; // Default fallback
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
  let result;
  // Avoid numbers that are powers of 2 or very close to them
  // as they're too simple for learning binary conversion
  do {
    result = Math.floor(Math.random() * (max - min + 1)) + min;
    // Check if it's a power of 2 (has exactly one bit set to 1)
    const isPowerOf2 = (result & (result - 1)) === 0;
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
        ? `The binary number <span class="font-mono font-bold">${binValue}</span> equals <span class="font-mono font-bold">${answer}</span> in decimal.<br/><br/>`
        : `Het binaire getal <span class="font-mono font-bold">${binValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in decimaal.<br/><br/>`;
      
      explanation = bin2decExplanation;
      
      // Add power of 2 method visual explanation (similar to the image shared)
      const powerMethodBin2Dec = language === 'en'
        ? 'Using the powers of 2 method:<br/>'
        : 'Met de machten van 2 methode:<br/>';
      
      explanation += powerMethodBin2Dec;
      
      // Create table for powers of 2 in binary to decimal conversion (matching the example image)
      const binaryArray = binValue.split('').reverse(); // Reverse for LSB to MSB
      
      let bin2decTableHtml = '<div class="overflow-x-auto mt-2 mb-4">';
      bin2decTableHtml += '<table class="min-w-full border-collapse">';
      
      // First row - powers of 2
      bin2decTableHtml += '<tr class="bg-slate-50 dark:bg-slate-800">';
      for (let i = binaryArray.length - 1; i >= 0; i--) {
        bin2decTableHtml += `<th class="py-1 px-2 text-center text-sm font-medium border">${Math.pow(2, i)}</th>`;
      }
      bin2decTableHtml += '</tr>';
      
      // Second row - binary digits (in correct order)
      bin2decTableHtml += '<tr>';
      for (let i = binaryArray.length - 1; i >= 0; i--) {
        bin2decTableHtml += `<td class="py-1 px-2 text-center font-mono font-bold border">${binaryArray[binaryArray.length - 1 - i]}</td>`;
      }
      bin2decTableHtml += '</tr>';
      
      // Third row - values where binary digit is 1
      bin2decTableHtml += '<tr>';
      for (let i = binaryArray.length - 1; i >= 0; i--) {
        const digit = binaryArray[binaryArray.length - 1 - i];
        if (digit === '1') {
          bin2decTableHtml += `<td class="py-1 px-2 text-center border">${Math.pow(2, i)}</td>`;
        } else {
          bin2decTableHtml += '<td class="py-1 px-2 text-center border">0</td>';
        }
      }
      bin2decTableHtml += '</tr>';
      bin2decTableHtml += '</table></div>';
      
      // Add calculation details
      const calculationInWords = language === 'en'
        ? 'To convert from binary to decimal, add up the powers of 2 where the binary digit is 1:<br/>'
        : 'Om van binair naar decimaal te gaan, tel je de machten van 2 op waar het binaire cijfer 1 is:<br/>';
        
      explanation += bin2decTableHtml + calculationInWords;
      
      // Create calculation string showing detailed steps as before
      const calcText = language === 'en' ? ' = ' : ' = ';
      explanation += binValue.split('').reverse().map((bit, index) => {
        return bit === '1' ? `1×2<sup>${index}</sup> (${Math.pow(2, index)})` : `0×2<sup>${index}</sup> (0)`;
      }).reverse().join(' + ') + calcText + answer;
      break;
      
    case 'bin2hex':
      const binHexValue = generateRandomBinary(binaryLength);
      question = questionTextBinary + hexWord;
      answer = parseInt(binHexValue, 2).toString(16).toUpperCase();
      
      // Translation-aware explanations
      const bin2hexExplanation = language === 'en'
        ? `The binary number <span class="font-mono font-bold">${binHexValue}</span> equals <span class="font-mono font-bold">${answer}</span> in hexadecimal.<br/><br/>`
        : `Het binaire getal <span class="font-mono font-bold">${binHexValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in hexadecimaal.<br/><br/>`;
      
      explanation = bin2hexExplanation;
      
      // Add grouped conversion for explanation
      let groupedBinary = '';
      let paddedBinary = binHexValue.padStart(Math.ceil(binHexValue.length / 4) * 4, '0');
      for (let i = 0; i < paddedBinary.length; i += 4) {
        let group = paddedBinary.slice(i, i + 4);
        let hexValue = parseInt(group, 2).toString(16).toUpperCase();
        groupedBinary += `${group} (${hexValue}) `;
      }
      
      const groupingText = language === 'en'
        ? `Group the binary into sets of 4 bits (padding with leading zeros if needed):<br/>${groupedBinary}`
        : `Groepeer het binaire getal in sets van 4 bits (met voorloopnullen indien nodig):<br/>${groupedBinary}`;
      
      explanation += groupingText;
      break;
      
    case 'hex2bin':
      const hexValue = generateRandomHex(hexLength);
      question = questionTextHex + binaryWord;
      answer = '';
      
      // Translation-aware explanations
      const hex2binStart = language === 'en'
        ? `The hexadecimal number <span class="font-mono font-bold">${hexValue}</span> equals <span class="font-mono font-bold">`
        : `Het hexadecimale getal <span class="font-mono font-bold">${hexValue}</span> is gelijk aan <span class="font-mono font-bold">`;
      
      explanation = hex2binStart;
      
      // Convert each hex digit and build explanation
      for (let i = 0; i < hexValue.length; i++) {
        const digit = hexValue[i];
        const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');
        answer += binaryGroup;
        explanation += `${binaryGroup}`;
        if (i < hexValue.length - 1) explanation += ' ';
      }
      
      const hex2binMiddle = language === 'en'
        ? `</span> in binary.<br/><br/>Convert each hex digit to 4 binary digits:<br/>`
        : `</span> in binair.<br/><br/>Zet elk hexadecimaal cijfer om naar 4 binaire cijfers:<br/>`;
        
      explanation += hex2binMiddle;
      
      for (let i = 0; i < hexValue.length; i++) {
        const digit = hexValue[i];
        const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');
        
        const arrowSymbol = language === 'en' ? '→' : '→';
        const hexLabel = language === 'en' ? 'Hex' : 'Hex';
        const binaryLabel = language === 'en' ? 'Binary' : 'Binair';
        
        explanation += `${hexLabel} ${digit} ${arrowSymbol} ${binaryLabel} ${binaryGroup}<br/>`;
      }
      break;
      
    case 'dec2bin':
      const decimalValue = generateRandomDecimal(decMin, decMax);
      question = questionTextDecimal + binaryWord;
      answer = decimalValue.toString(2);
      
      // Translation-aware explanations
      const dec2binExplanation = language === 'en'
        ? `The decimal number <span class="font-mono font-bold">${decimalValue}</span> equals <span class="font-mono font-bold">${answer}</span> in binary.<br/><br/>`
        : `Het decimale getal <span class="font-mono font-bold">${decimalValue}</span> is gelijk aan <span class="font-mono font-bold">${answer}</span> in binair.<br/><br/>`;
      
      explanation = dec2binExplanation;
      
      // Add power of 2 method visual explanation (similar to the image shared)
      const powerMethod = language === 'en'
        ? 'Using the powers of 2 method:<br/>'
        : 'Met de machten van 2 methode:<br/>';
      
      explanation += powerMethod;
      
      // Create table for powers of 2
      const binaryDigits = answer.split('').reverse(); // Reverse to start from LSB
      let dec2binTableHtml = '<div class="overflow-x-auto mt-2 mb-4">';
      dec2binTableHtml += '<table class="min-w-full border-collapse">';
      
      // Table headers - powers of 2
      dec2binTableHtml += '<tr class="bg-slate-50 dark:bg-slate-800">';
      const powerLabel = language === 'en' ? 'Power' : 'Macht';
      
      // Calculate required columns based on binary length
      const columns = binaryDigits.length;
      for (let i = 0; i < columns; i++) {
        dec2binTableHtml += `<th class="py-2 px-3 text-center text-sm font-medium border">${Math.pow(2, i)}</th>`;
      }
      dec2binTableHtml += '</tr>';
      
      // Row for binary representation (0/1)
      dec2binTableHtml += '<tr>';
      for (let i = 0; i < columns; i++) {
        dec2binTableHtml += `<td class="py-2 px-3 text-center font-mono font-bold border">${binaryDigits[i] || '0'}</td>`;
      }
      dec2binTableHtml += '</tr>';
      
      // Row for calculation results
      dec2binTableHtml += '<tr>';
      let sum = 0;
      for (let i = 0; i < columns; i++) {
        const digit = parseInt(binaryDigits[i] || '0');
        const value = digit * Math.pow(2, i);
        sum += value;
        
        let cellContent = '';
        if (digit === 1) {
          cellContent = `${Math.pow(2, i)}`;
        } else {
          cellContent = '0';
        }
        
        dec2binTableHtml += `<td class="py-2 px-3 text-center border">${cellContent}</td>`;
      }
      dec2binTableHtml += '</tr>';
      dec2binTableHtml += '</table></div>';
      
      // Add calculation details
      let calculationText = language === 'en' 
        ? 'To convert from binary to decimal, add up the powers of 2 where the binary digit is 1:<br/>'
        : 'Om van binair naar decimaal te gaan, tel je de machten van 2 op waar het binaire cijfer 1 is:<br/>';
      
      let calculationSteps = [];
      for (let i = 0; i < columns; i++) {
        const digit = parseInt(binaryDigits[i] || '0');
        if (digit === 1) {
          calculationSteps.push(`2<sup>${i}</sup> = ${Math.pow(2, i)}`);
        }
      }
      
      calculationText += calculationSteps.join(' + ');
      calculationText += ` = ${decimalValue}`;
      
      explanation += dec2binTableHtml + '<br/>' + calculationText + '<br/><br/>';
      
      // Add division method explanation
      const divisionIntro = language === 'en' 
        ? 'Alternatively, using the division method:<br/>'
        : 'Als alternatief, met de delingsmethode:<br/>';
        
      explanation += divisionIntro;
      
      let tempValue = decimalValue;
      let steps = [];
      
      while (tempValue > 0) {
        const remainder = tempValue % 2;
        const remainderText = language === 'en' ? 'remainder' : 'rest';
        steps.push(`${tempValue} ÷ 2 = ${Math.floor(tempValue / 2)} ${remainderText} ${remainder}`);
        tempValue = Math.floor(tempValue / 2);
      }
      
      explanation += steps.join('<br/>');
      
      const bottomToTop = language === 'en'
        ? '<br/><br/>Reading the remainders from bottom to top gives the binary result.'
        : '<br/><br/>De restwaarden van onder naar boven lezen geeft het binaire resultaat.';
        
      explanation += bottomToTop;
      break;
      
    default:
      question = 'Invalid conversion type';
      answer = '';
      explanation = '';
  }
  
  // All translations are now handled directly in the relevant switch case sections
  
  return { question, answer, explanation };
}
