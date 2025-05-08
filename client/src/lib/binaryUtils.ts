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
  // Ensure we don't start with 0 for most conversions
  if (result[0] === '0' && length > 1) {
    result = hexChars[1 + Math.floor(Math.random() * 15)] + result.substring(1);
  }
  return result;
}

// Helper to generate a random decimal number in a given range
function generateRandomDecimal(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  
  switch (conversionType) {
    case 'bin2dec':
      question = generateRandomBinary(binaryLength);
      answer = parseInt(question, 2).toString();
      // Always generate English explanations by default
      explanation = `The binary number <span class="font-mono font-bold">${question}</span> equals <span class="font-mono font-bold">${answer}</span> in decimal.<br/><br/>`;
      
      // Add detailed calculation for explanation
      explanation += question.split('').reverse().map((bit, index) => {
        return bit === '1' ? `1×2<sup>${index}</sup> (${Math.pow(2, index)})` : `0×2<sup>${index}</sup> (0)`;
      }).reverse().join(' + ') + ' = ' + answer;
      break;
      
    case 'bin2hex':
      question = generateRandomBinary(binaryLength);
      answer = parseInt(question, 2).toString(16).toUpperCase();
      // Always generate English explanations by default
      explanation = `The binary number <span class="font-mono font-bold">${question}</span> equals <span class="font-mono font-bold">${answer}</span> in hexadecimal.<br/><br/>`;
      
      // Add grouped conversion for explanation
      let groupedBinary = '';
      let paddedBinary = question.padStart(Math.ceil(question.length / 4) * 4, '0');
      for (let i = 0; i < paddedBinary.length; i += 4) {
        let group = paddedBinary.slice(i, i + 4);
        let hexValue = parseInt(group, 2).toString(16).toUpperCase();
        groupedBinary += `${group} (${hexValue}) `;
      }
      explanation += `Group the binary into sets of 4 bits (padding with leading zeros if needed):<br/>${groupedBinary}`;
      break;
      
    case 'hex2bin':
      question = generateRandomHex(hexLength);
      answer = '';
      // Always generate English explanations by default
      explanation = `The hexadecimal number <span class="font-mono font-bold">${question}</span> equals <span class="font-mono font-bold">`;
      
      // Convert each hex digit and build explanation
      for (let i = 0; i < question.length; i++) {
        const digit = question[i];
        const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');
        answer += binaryGroup;
        explanation += `${binaryGroup}`;
        if (i < question.length - 1) explanation += ' ';
      }
      explanation += `</span> in binary.<br/><br/>Convert each hex digit to 4 binary digits:<br/>`;
      
      for (let i = 0; i < question.length; i++) {
        const digit = question[i];
        const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');
        explanation += `Hex ${digit} → Binary ${binaryGroup}<br/>`;
      }
      break;
      
    case 'dec2bin':
      const decimalValue = generateRandomDecimal(decMin, decMax);
      question = decimalValue.toString();
      answer = decimalValue.toString(2);
      // Always generate English explanations by default
      explanation = `The decimal number <span class="font-mono font-bold">${question}</span> equals <span class="font-mono font-bold">${answer}</span> in binary.<br/><br/>`;
      
      // Add division method explanation
      explanation += 'Using the division method:<br/>';
      let divisionExplanation = '';
      let tempValue = decimalValue;
      let steps = [];
      
      while (tempValue > 0) {
        const remainder = tempValue % 2;
        steps.push(`${tempValue} ÷ 2 = ${Math.floor(tempValue / 2)} remainder ${remainder}`);
        tempValue = Math.floor(tempValue / 2);
      }
      
      explanation += steps.join('<br/>') + '<br/><br/>Reading the remainders from bottom to top gives the binary result.';
      break;
      
    default:
      question = 'Invalid conversion type';
      answer = '';
      explanation = '';
  }
  
  // English is the default language for explanations in this code
  // For Dutch (nl), we need to translate to Dutch
  if (language === 'nl') {
    // For Dutch language, replace English text with Dutch equivalents
    if (conversionType === 'bin2dec') {
      explanation = explanation
        .replace(/The binary number/g, "Het binaire getal")
        .replace(/equals/g, "is gelijk aan")
        .replace(/in decimal/g, "in decimaal");
    }
    else if (conversionType === 'bin2hex') {
      explanation = explanation
        .replace(/The binary number/g, "Het binaire getal")
        .replace(/equals/g, "is gelijk aan")
        .replace(/in hexadecimal/g, "in hexadecimaal")
        .replace(/Group the binary into sets of 4 bits/g, "Groepeer de binaire cijfers in sets van 4")
        .replace(/padding with leading zeros if needed/g, "aanvullen met voorloopnullen indien nodig");
    }
    else if (conversionType === 'hex2bin') {
      explanation = explanation
        .replace(/The hexadecimal number/g, "Het hexadecimale getal")
        .replace(/equals/g, "is gelijk aan")
        .replace(/in binary/g, "in binair")
        .replace(/Convert each hex digit to 4 binary digits/g, "Zet elk hexadecimaal cijfer om naar 4 binaire cijfers")
        .replace(/Hex/g, "Hex")
        .replace(/Binary/g, "Binair");
    }
    else if (conversionType === 'dec2bin') {
      explanation = explanation
        .replace(/The decimal number/g, "Het decimale getal")
        .replace(/equals/g, "is gelijk aan")
        .replace(/in binary/g, "in binair")
        .replace(/Using the division method/g, "Met de delingsmethode")
        .replace(/remainder/g, "rest")
        .replace(/Reading the remainders from bottom to top gives the binary result/g, "De restwaarden van onder naar boven lezen geeft het binaire resultaat");
    }
  }
  
  return { question, answer, explanation };
}
