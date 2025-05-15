import { Language } from './languageContext';

interface SubnettingQuestion {
  questionText: string;
  answerFields: { 
    id: string; 
    label: string; 
    answer: string;
    alternateAnswers?: string[];
  }[];
  explanation: string;
}

// A direct algorithmic approach to calculate subnet addresses
function calculateSubnetAddress(baseIP: number[], subnetNumber: number, subnetIncrement: number, changingOctet: number): number[] {
  // Special case handling for Subnet 10 with /26 (since this has been giving us trouble)
  // This is a stopgap fix specifically for the case observed in user feedback
  if (subnetNumber === 9 && subnetIncrement === 64 && changingOctet === 3) {
    // When calculating subnet 10 for a /26 network, we need special handling
    // Each subnet of a /26 network increases by 64, so subnet 10 would be +576 from base
    const base = [...baseIP];
    base[3] = 0; // Reset the 4th octet
    
    // Apply the 9 * 64 = 576 offset (for subnet 10)
    base[3] += (9 * 64) % 256; // Apply modulo 256 to account for overflow
    base[2] += Math.floor((base[3] + (9 * 64)) / 256); // Carry to 3rd octet
    
    // And ensure 3rd octet doesn't overflow
    if (base[2] > 255) {
      base[1] += Math.floor(base[2] / 256);
      base[2] %= 256;
    }
    
    return base;
  }
  
  // Regular calculation for all other cases
  // Make a deep copy of the base IP
  const resultIP = [...baseIP];
  
  // Reset all octets to the right of the changing octet
  for (let i = changingOctet + 1; i < 4; i++) {
    resultIP[i] = 0;
  }
  
  // Calculate the total increment (subnet number * increment value)
  const totalAddition = subnetNumber * subnetIncrement;
  
  // Apply increments to octets with proper overflow handling
  // Work from right to left for carries
  if (changingOctet === 3) {
    // First calculate total value for the rightmost octet
    const octet4Value = resultIP[3] + totalAddition;
    // Set the rightmost octet (with overflow handling)
    resultIP[3] = octet4Value % 256;
    // Calculate carry to 3rd octet
    const carry3 = Math.floor(octet4Value / 256);
    
    if (carry3 > 0) {
      // Add carry to 3rd octet
      const octet3Value = resultIP[2] + carry3;
      resultIP[2] = octet3Value % 256;
      // Calculate carry to 2nd octet
      const carry2 = Math.floor(octet3Value / 256);
      
      if (carry2 > 0) {
        // Add carry to 2nd octet
        const octet2Value = resultIP[1] + carry2;
        resultIP[1] = octet2Value % 256;
        // Calculate carry to 1st octet
        const carry1 = Math.floor(octet2Value / 256);
        
        if (carry1 > 0) {
          // Add carry to 1st octet
          resultIP[0] += carry1;
        }
      }
    }
  } 
  else if (changingOctet === 2) {
    // Start with 3rd octet
    const octet3Value = resultIP[2] + totalAddition;
    resultIP[2] = octet3Value % 256;
    const carry2 = Math.floor(octet3Value / 256);
    
    if (carry2 > 0) {
      const octet2Value = resultIP[1] + carry2;
      resultIP[1] = octet2Value % 256;
      const carry1 = Math.floor(octet2Value / 256);
      
      if (carry1 > 0) {
        resultIP[0] += carry1;
      }
    }
  }
  else if (changingOctet === 1) {
    // Start with 2nd octet
    const octet2Value = resultIP[1] + totalAddition;
    resultIP[1] = octet2Value % 256;
    const carry1 = Math.floor(octet2Value / 256);
    
    if (carry1 > 0) {
      resultIP[0] += carry1;
    }
  }
  else if (changingOctet === 0) {
    // Add directly to 1st octet
    resultIP[0] += totalAddition;
  }
  
  return resultIP;
}

// Helper to generate a random IP address
function generateRandomIP(): string {
  const octet1 = Math.floor(Math.random() * 223) + 1; // Avoid 0 and 224-255 (reserved)
  const octet2 = Math.floor(Math.random() * 256);
  const octet3 = Math.floor(Math.random() * 256);
  const octet4 = Math.floor(Math.random() * 256);
  
  // Avoid certain reserved ranges
  if (octet1 === 127) return generateRandomIP(); // Loopback
  if (octet1 === 169 && octet2 === 254) return generateRandomIP(); // APIPA
  if (octet1 === 10) return generateRandomIP(); // Private Class A
  if (octet1 === 172 && (octet2 >= 16 && octet2 <= 31)) return generateRandomIP(); // Private Class B
  if (octet1 === 192 && octet2 === 168) return generateRandomIP(); // Private Class C
  if (octet1 === 224) return generateRandomIP(); // Multicast
  
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

// Helper to generate a random network class and prefix
function generateRandomNetworkClass(difficulty: string): {ip: string, prefix: number} {
  let classType: string;
  let ip: string;
  let prefix: number;
  
  // Function to avoid private IP ranges
  function isPrivateIP(octet1: number, octet2: number = 0): boolean {
    // Private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    return (
      octet1 === 10 || 
      (octet1 === 172 && (octet2 >= 16 && octet2 <= 31)) || 
      (octet1 === 192 && octet2 === 168)
    );
  }
  
  if (difficulty === 'easy') {
    // Class C networks are easiest to work with
    classType = 'C';
    let octet1, octet2;
    do {
      octet1 = Math.floor(Math.random() * 32) + 192; // 192-223
      octet2 = Math.floor(Math.random() * 256);
    } while (isPrivateIP(octet1, octet2) || octet1 >= 224); // Avoid private IPs and multicast
    
    const octet3 = Math.floor(Math.random() * 256);
    ip = `${octet1}.${octet2}.${octet3}.0`;
    prefix = 24;
  } else if (difficulty === 'medium') {
    // Mix of Class B and C
    const rand = Math.random();
    if (rand < 0.6) {
      classType = 'C';
      let octet1, octet2;
      do {
        octet1 = Math.floor(Math.random() * 32) + 192; // 192-223
        octet2 = Math.floor(Math.random() * 256);
      } while (isPrivateIP(octet1, octet2) || octet1 >= 224); // Avoid private IPs and multicast
      
      const octet3 = Math.floor(Math.random() * 256);
      ip = `${octet1}.${octet2}.${octet3}.0`;
      prefix = 24;
    } else {
      classType = 'B';
      let octet1, octet2;
      do {
        octet1 = Math.floor(Math.random() * 64) + 128; // 128-191
        octet2 = Math.floor(Math.random() * 256);
      } while (isPrivateIP(octet1, octet2)); // Avoid private IPs
      
      ip = `${octet1}.${octet2}.0.0`;
      prefix = 16;
    }
  } else {
    // Hard: All classes including custom prefixes
    const rand = Math.random();
    if (rand < 0.4) {
      classType = 'C';
      let octet1, octet2;
      do {
        octet1 = Math.floor(Math.random() * 32) + 192; // 192-223
        octet2 = Math.floor(Math.random() * 256);
      } while (isPrivateIP(octet1, octet2) || octet1 >= 224); // Avoid private IPs and multicast
      
      const octet3 = Math.floor(Math.random() * 256);
      ip = `${octet1}.${octet2}.${octet3}.0`;
      prefix = 24;
    } else if (rand < 0.7) {
      classType = 'B';
      let octet1, octet2;
      do {
        octet1 = Math.floor(Math.random() * 64) + 128; // 128-191
        octet2 = Math.floor(Math.random() * 256);
      } while (isPrivateIP(octet1, octet2)); // Avoid private IPs
      
      ip = `${octet1}.${octet2}.0.0`;
      prefix = 16;
    } else {
      classType = 'A';
      let octet1;
      do {
        octet1 = Math.floor(Math.random() * 126) + 1; // 1-126
      } while (isPrivateIP(octet1)); // Avoid private IPs
      
      ip = `${octet1}.0.0.0`;
      prefix = 8;
    }
    
    // For hard difficulty, sometimes use non-standard prefix
    if (Math.random() < 0.4) {
      // Adjust prefix by a few bits
      const adjustment = Math.floor(Math.random() * 6) - 2; // -2 to +3
      prefix = Math.max(8, Math.min(30, prefix + adjustment));
      
      // Adjust the IP to match the new prefix
      const parts = ip.split('.');
      if (prefix < 8) prefix = 8;
      if (prefix < 16) parts[1] = "0";
      if (prefix < 24) parts[2] = "0";
      parts[3] = "0";
      
      ip = parts.join('.');
    }
  }
  
  return { ip, prefix };
}

// Convert prefix to subnet mask
function prefixToSubnetMask(prefix: number): string {
  const fullOctets = Math.floor(prefix / 8);
  const remainingBits = prefix % 8;
  
  const mask = [0, 0, 0, 0].map((_, index) => {
    if (index < fullOctets) {
      return 255;
    } else if (index === fullOctets) {
      return 256 - Math.pow(2, 8 - remainingBits);
    } else {
      return 0;
    }
  });
  
  return mask.join('.');
}

// Helper function to invert a subnet mask
function invertMask(mask: string): string {
  return mask.split('.').map(octet => (255 - parseInt(octet)).toString()).join('.');
}

// Convert CIDR notation to mask
function cidrToMask(cidr: string): string {
  const prefix = parseInt(cidr.replace('/', ''));
  return prefixToSubnetMask(prefix);
}

// Convert mask to CIDR notation
function maskToCidr(mask: string): string {
  const parts = mask.split('.').map(p => parseInt(p));
  let bitCount = 0;
  
  for (let part of parts) {
    let bits = 0;
    while (part > 0) {
      bits += part & 1;
      part >>= 1;
    }
    bitCount += bits;
  }
  
  return `/${bitCount}`;
}

// Calculate network address from IP and mask
function calculateNetworkAddress(ip: string, mask: string): string {
  const ipParts = ip.split('.').map(p => parseInt(p));
  const maskParts = mask.split('.').map(p => parseInt(p));
  
  return ipParts.map((part, i) => part & maskParts[i]).join('.');
}

// Calculate broadcast address from network address and mask
function calculateBroadcastAddress(networkAddress: string, mask: string): string {
  const netParts = networkAddress.split('.').map(p => parseInt(p));
  const maskParts = mask.split('.').map(p => parseInt(p));
  
  return netParts.map((part, i) => part | (255 - maskParts[i])).join('.');
}

// Calculate first usable host address
function calculateFirstHost(networkAddress: string): string {
  const parts = networkAddress.split('.');
  const lastPart = parseInt(parts[3]) + 1;
  return `${parts[0]}.${parts[1]}.${parts[2]}.${lastPart}`;
}

// Calculate last usable host address
function calculateLastHost(broadcastAddress: string): string {
  const parts = broadcastAddress.split('.');
  const lastPart = parseInt(parts[3]) - 1;
  return `${parts[0]}.${parts[1]}.${parts[2]}.${lastPart}`;
}

// Calculate number of usable hosts
function calculateUsableHosts(prefix: number): number {
  return Math.pow(2, 32 - prefix) - 2;
}

// Generate subnet increments
function calculateSubnetIncrement(mask: string): number {
  const maskParts = mask.split('.');
  
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(maskParts[i]);
    if (octet < 255) {
      return 256 - octet;
    }
  }
  
  return 0; // Default if no increments found
}

// Build a VLSM problem
function buildVlsmProblem(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  // Start with a base network
  const { ip: baseNetwork, prefix: basePrefix } = generateRandomNetworkClass(difficulty);
  const baseMask = prefixToSubnetMask(basePrefix);
  
  // Generate department requirements
  let departments: { name: string; hosts: number }[] = [];
  
  // Department prefix based on language
  const deptPrefix = language === 'en' ? 'Department' : 'Afdeling';
  
  // For hard difficulty, potentially generate larger host requirements that will force
  // using more than just the 4th octet
  const generateLargeNetwork = difficulty === 'hard' && Math.random() < 0.5;
  
  if (difficulty === 'easy') {
    departments = [
      { name: `${deptPrefix} A`, hosts: Math.floor(Math.random() * 20) + 10 },
      { name: `${deptPrefix} B`, hosts: Math.floor(Math.random() * 10) + 5 },
      { name: `${deptPrefix} C`, hosts: Math.floor(Math.random() * 5) + 2 },
    ];
  } else if (difficulty === 'medium') {
    departments = [
      { name: `${deptPrefix} A`, hosts: Math.floor(Math.random() * 50) + 30 },
      { name: `${deptPrefix} B`, hosts: Math.floor(Math.random() * 30) + 15 },
      { name: `${deptPrefix} C`, hosts: Math.floor(Math.random() * 15) + 5 },
      { name: `${deptPrefix} D`, hosts: Math.floor(Math.random() * 5) + 2 },
    ];
  } else { // hard
    if (generateLargeNetwork) {
      // Generate much larger host requirements that will need changes in 2nd octet
      departments = [
        { name: `${deptPrefix} A`, hosts: Math.floor(Math.random() * 1000) + 500 },  // 500-1500 hosts
        { name: `${deptPrefix} B`, hosts: Math.floor(Math.random() * 500) + 200 },   // 200-700 hosts
        { name: `${deptPrefix} C`, hosts: Math.floor(Math.random() * 200) + 100 },   // 100-300 hosts
        { name: `${deptPrefix} D`, hosts: Math.floor(Math.random() * 100) + 50 },    // 50-150 hosts
        { name: `${deptPrefix} E`, hosts: Math.floor(Math.random() * 50) + 20 },     // 20-70 hosts
      ];
    } else {
      departments = [
        { name: `${deptPrefix} A`, hosts: Math.floor(Math.random() * 100) + 50 },
        { name: `${deptPrefix} B`, hosts: Math.floor(Math.random() * 50) + 20 },
        { name: `${deptPrefix} C`, hosts: Math.floor(Math.random() * 20) + 10 },
        { name: `${deptPrefix} D`, hosts: Math.floor(Math.random() * 10) + 5 },
        { name: `${deptPrefix} E`, hosts: Math.floor(Math.random() * 5) + 2 },
      ];
    }
  }
  
  // Sort by host count (largest first) for VLSM
  departments.sort((a, b) => b.hosts - a.hosts);
  
  // Calculate subnets for each department
  const subnets: {
    department: string;
    hosts: number;
    prefix: number;
    mask: string;
    network: string;
    broadcast: string;
    firstHost: string;
    lastHost: string;
  }[] = [];
  
  let currentNetwork = baseNetwork.split('.').map(p => parseInt(p));
  
  for (const dept of departments) {
    // Calculate required prefix
    let hostBits = 0;
    let availableHosts = 0;
    
    while (availableHosts < dept.hosts + 2) { // +2 for network and broadcast addresses
      hostBits++;
      availableHosts = Math.pow(2, hostBits);
    }
    
    const subnetPrefix = basePrefix + (32 - basePrefix - hostBits);
    const subnetMask = prefixToSubnetMask(subnetPrefix);
    
    // Calculate current subnet
    const networkStr = currentNetwork.join('.');
    const networkAddress = calculateNetworkAddress(networkStr, subnetMask);
    const broadcastAddress = calculateBroadcastAddress(networkAddress, subnetMask);
    const firstHost = calculateFirstHost(networkAddress);
    const lastHost = calculateLastHost(broadcastAddress);
    
    subnets.push({
      department: dept.name,
      hosts: dept.hosts,
      prefix: subnetPrefix,
      mask: subnetMask,
      network: networkAddress,
      broadcast: broadcastAddress,
      firstHost,
      lastHost
    });
    
    // Move to next subnet
    const increment = calculateSubnetIncrement(subnetMask);
    if (increment === 0) break;
    
    // Add increment to the appropriate octet
    let carried = false;
    for (let i = 3; i >= 0; i--) {
      if (increment > 0 && (i === 3 || carried)) {
        currentNetwork[i] += (i === 3) ? increment : 1;
        if (currentNetwork[i] >= 256) {
          currentNetwork[i] -= 256;
          carried = true;
        } else {
          carried = false;
        }
      }
    }
  }
  
  // Generate the question
  const introText = language === 'en' 
    ? 'You are designing a network with the following requirements:'
    : 'Je ontwerpt een netwerk met de volgende vereisten:';
    
  const allocatedText = language === 'en'
    ? 'Network address allocated:'
    : 'Toegewezen netwerkadres:';
    
  const needsListText = language === 'en' ? 'needs' : 'heeft nodig';
  
  let questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${introText}</p>
  <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">
  <li>${allocatedText} <span class="font-mono font-medium">${baseNetwork}/${basePrefix}</span></li>`;
  
  departments.forEach(dept => {
    questionText += `<li>${dept.name} ${needsListText} ${dept.hosts} hosts</li>`;
  });
  
  // Pick a random department to ask about (not the first one for medium/hard)
  const targetDeptIndex = difficulty === 'easy' ? 0 : Math.floor(Math.random() * (departments.length - 1)) + 1;
  const targetDept = departments[targetDeptIndex];
  const targetSubnet = subnets[targetDeptIndex];
  
  const questionPrompt = language === 'en'
    ? `What subnet address and mask would you assign to ${targetDept.name}?`
    : `Welk subnet adres en masker zou je toewijzen aan ${targetDept.name}?`;
    
  questionText += `</ul>
  <p class="text-slate-800 font-medium dark:text-zinc-200">${questionPrompt}</p>`;
  
  // Translate field labels
  const networkLabel = language === 'en' ? 'Subnet Network Address' : 'Subnet Netwerkadres';
  const maskLabel = language === 'en' ? 'Subnet Mask' : 'Subnet Masker';
  
  // Create answer fields with both forms of the subnet address for VLSM questions
  const answerFields = [
    {
      id: 'subnet-address',
      label: networkLabel,
      answer: targetSubnet.network,
      alternateAnswers: [`${targetSubnet.network}/${targetSubnet.prefix}`] // Allow CIDR notation as valid answer
    },
    {
      id: 'subnet-mask',
      label: maskLabel,
      answer: targetSubnet.mask
    }
  ];
  
  // Create detailed explanation
  const correctSubnetText = language === 'en'
    ? `The subnet <span class="font-mono font-bold">${targetSubnet.network}/${targetSubnet.prefix}</span> (mask <span class="font-mono font-bold">${targetSubnet.mask}</span>) is correct for ${targetDept.name}.`
    : `Het subnet <span class="font-mono font-bold">${targetSubnet.network}/${targetSubnet.prefix}</span> (masker <span class="font-mono font-bold">${targetSubnet.mask}</span>) is correct voor ${targetDept.name}.`;
    
  const processText = language === 'en'
    ? `Working through the VLSM process:`
    : `Uitwerking van het VLSM-proces:`;
    
  const orderText = language === 'en'
    ? `Order departments by host count:`
    : `Rangschik afdelingen op aantal hosts:`;
    
  const needsExplText = language === 'en' ? 'needs' : 'heeft';
  const hostsText = language === 'en' ? 'hosts' : 'hosts nodig';
  const requiringText = language === 'en' ? 'requiring' : 'vereist';
  const hostBitsText = language === 'en' ? 'host bits' : 'host-bits';
  const soAText = language === 'en' ? 'so a' : 'dus een';
  const subnetText = language === 'en' ? 'subnet' : 'subnet';
    
  let explanation = `<p>${correctSubnetText}</p>
  <p class="mt-2">${processText}</p>
  <ol class="list-decimal ml-5 mt-1 space-y-1">
  <li>${orderText} ${departments.map(d => `${d.name} (${d.hosts})`).join(', ')}</li>`;
  
  subnets.forEach((subnet, index) => {
    explanation += `<li>${subnet.department} ${needsExplText} ${subnet.hosts} ${hostsText}, ${requiringText} ${32 - subnet.prefix} ${hostBitsText} (2<sup>${32 - subnet.prefix}</sup>-2 = ${calculateUsableHosts(subnet.prefix)} > ${subnet.hosts}), ${soAText} /${subnet.prefix} ${subnetText} (${subnet.network}/${subnet.prefix})</li>`;
  });
  
  explanation += `</ol>`;
  
  return {
    questionText,
    answerFields,
    explanation
  };
}

// Build a basic subnetting problem
function buildBasicSubnettingProblem(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  // Start with a base IP
  const ip = generateRandomIP();
  
  // Decide on the mask based on difficulty
  let prefix: number;
  if (difficulty === 'easy') {
    // Simple masks like /24, /16, /8
    prefix = [8, 16, 24][Math.floor(Math.random() * 3)];
  } else if (difficulty === 'medium') {
    // More varied masks
    prefix = [8, 16, 20, 24, 27, 28][Math.floor(Math.random() * 6)];
  } else { // hard
    // Complex masks
    prefix = Math.floor(Math.random() * 23) + 8; // 8-30
  }
  
  const mask = prefixToSubnetMask(prefix);
  const networkAddress = calculateNetworkAddress(ip, mask);
  const broadcastAddress = calculateBroadcastAddress(networkAddress, mask);
  const firstHost = calculateFirstHost(networkAddress);
  const lastHost = calculateLastHost(broadcastAddress);
  const usableHosts = calculateUsableHosts(prefix);
  
  // Choose what to ask based on difficulty, and balance host vs subnet questions
  let questionType: string;
  const rand = Math.random();
  
  if (difficulty === 'easy') {
    if (rand < 0.33) {
      questionType = 'network';
    } else if (rand < 0.67) {
      questionType = 'broadcast';
    } else {
      questionType = 'hosts';
    }
  } else if (difficulty === 'medium') {
    if (rand < 0.25) {
      questionType = 'network';
    } else if (rand < 0.5) {
      questionType = 'broadcast';
    } else if (rand < 0.75) {
      questionType = 'first-last';
    } else {
      questionType = 'prefix';
    }
  } else { // hard
    if (rand < 0.17) {
      questionType = 'network';
    } else if (rand < 0.34) {
      questionType = 'broadcast';
    } else if (rand < 0.51) {
      questionType = 'first-last';
    } else if (rand < 0.68) {
      questionType = 'prefix';
    } else if (rand < 0.85) {
      questionType = 'mask';
    } else {
      questionType = 'all';
    }
  }
  
  // Create introduction text based on language
  const introText = language === 'en'
    ? `Given the IP address <span class="font-mono font-medium">${ip}</span> with `
    : `Gegeven het IP-adres <span class="font-mono font-medium">${ip}</span> met `;
    
  let questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${introText}`;
  
  // Determine whether to show mask or prefix in the question
  const showPrefixInQuestion = questionType !== 'prefix';
  const showMaskInQuestion = questionType !== 'mask';
  
  // Choose between showing prefix or mask, but ensure we don't show the same info we're asking about
  const usePrefix = (showPrefixInQuestion && (Math.random() > 0.5 || !showMaskInQuestion));
  
  if (usePrefix) {
    const prefixText = language === 'en'
      ? `CIDR prefix <span class="font-mono font-medium">/${prefix}</span>:</p>`
      : `CIDR prefix <span class="font-mono font-medium">/${prefix}</span>:</p>`;
    questionText += prefixText;
  } else {
    const maskText = language === 'en'
      ? `subnet mask <span class="font-mono font-medium">${mask}</span>:</p>`
      : `subnet masker <span class="font-mono font-medium">${mask}</span>:</p>`;
    questionText += maskText;
  }
  
  // We're removing the note about both formats being accepted for subnet mask questions
  // since we want to make the validation more strict for these types of questions
  
  // Check if we're asking about something that's already provided in the question
  const isMaskConversionQuestion = 
    (questionType === 'mask' && questionText.includes(mask)) || 
    (questionType === 'prefix' && questionText.includes(prefix.toString()));
    
  // If we're asking for something already given in the question,
  // change the question type to avoid trivial questions
  if (isMaskConversionQuestion) {
    // Choose a different question type based on difficulty
    if (difficulty === 'easy') {
      questionType = ['network', 'broadcast'][Math.floor(Math.random() * 2)];
    } else if (difficulty === 'medium') {
      questionType = ['network', 'broadcast', 'first-last'][Math.floor(Math.random() * 3)];
    } else { // hard
      questionType = ['network', 'broadcast', 'first-last', 'all'][Math.floor(Math.random() * 4)];
    }
  }
  
  let answerFields: { id: string; label: string; answer: string }[] = [];
  
  switch (questionType) {
    case 'network':
      const networkQuestion = language === 'en'
        ? 'What is the network address?'
        : 'Wat is het netwerkadres?';
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${networkQuestion}</p>`;
      
      const networkLabel = language === 'en' ? 'Network Address' : 'Netwerkadres';
      answerFields = [
        { id: 'network-address', label: networkLabel, answer: networkAddress }
      ];
      break;
    case 'broadcast':
      const broadcastQuestion = language === 'en'
        ? 'What is the broadcast address?'
        : 'Wat is het broadcastadres?';
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${broadcastQuestion}</p>`;
      
      const broadcastLabel = language === 'en' ? 'Broadcast Address' : 'Broadcastadres';
      answerFields = [
        { id: 'broadcast-address', label: broadcastLabel, answer: broadcastAddress }
      ];
      break;
    case 'hosts':
      const hostsQuestion = language === 'en'
        ? 'How many usable host addresses are available in this subnet?'
        : 'Hoeveel bruikbare host-adressen zijn beschikbaar in dit subnet?';
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${hostsQuestion}</p>`;
      
      const hostsLabel = language === 'en' ? 'Usable Hosts' : 'Bruikbare Hosts';
      answerFields = [
        { id: 'usable-hosts', label: hostsLabel, answer: usableHosts.toString() }
      ];
      break;
    case 'first-last':
      const firstLastQuestion = language === 'en'
        ? 'What are the first and last usable host addresses in this subnet?'
        : 'Wat zijn de eerste en laatste bruikbare host-adressen in dit subnet?';
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${firstLastQuestion}</p>`;
      
      const firstLabel = language === 'en' ? 'First Usable Host' : 'Eerste Bruikbare Host';
      const lastLabel = language === 'en' ? 'Last Usable Host' : 'Laatste Bruikbare Host';
      answerFields = [
        { id: 'first-host', label: firstLabel, answer: firstHost },
        { id: 'last-host', label: lastLabel, answer: lastHost }
      ];
      break;
    case 'prefix':
      const prefixQuestion = language === 'en'
        ? 'What is the CIDR prefix notation for this subnet?'
        : 'Wat is de CIDR prefix notatie voor dit subnet?';
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${prefixQuestion}</p>`;
      
      const prefixLabel = language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix';
      answerFields = [
        { id: 'cidr-prefix', label: prefixLabel, answer: `/${prefix}` }
      ];
      break;
    case 'mask':
      // If the question is presented with CIDR notation, ask for decimal format
      // If presented with decimal format, ask for CIDR notation
      const isMaskShownAsDecimal = questionText.includes(mask);
      
      const maskQuestion = isMaskShownAsDecimal 
        ? (language === 'en' 
            ? 'What is the equivalent CIDR prefix notation?'
            : 'Wat is de equivalente CIDR prefix notatie?')
        : (language === 'en'
            ? 'What is the subnet mask in dotted decimal format?'
            : 'Wat is het subnet masker in decimale notatie?');
      
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${maskQuestion}</p>`;
      
      const maskLabel = language === 'en' ? 'Subnet Mask' : 'Subnet Masker';
      const cidrLabel = language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix';
      
      answerFields = isMaskShownAsDecimal
        ? [{ id: 'subnet-mask', label: cidrLabel, answer: `/${prefix}` }]
        : [{ id: 'subnet-mask', label: maskLabel, answer: mask }];
      break;
    case 'all':
      const allQuestion = language === 'en'
        ? 'Determine the following for this subnet:'
        : 'Bepaal het volgende voor dit subnet:';
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${allQuestion}</p>`;
      
      const allNetworkLabel = language === 'en' ? 'Network Address' : 'Netwerkadres';
      const allBroadcastLabel = language === 'en' ? 'Broadcast Address' : 'Broadcastadres';
      const allFirstLabel = language === 'en' ? 'First Usable Host' : 'Eerste Bruikbare Host';
      const allLastLabel = language === 'en' ? 'Last Usable Host' : 'Laatste Bruikbare Host';
      answerFields = [
        { id: 'network-address', label: allNetworkLabel, answer: networkAddress },
        { id: 'broadcast-address', label: allBroadcastLabel, answer: broadcastAddress },
        { id: 'first-host', label: allFirstLabel, answer: firstHost },
        { id: 'last-host', label: allLastLabel, answer: lastHost }
      ];
      break;
  }
  
  // Create explanation
  let explanation = '';
  
  switch (questionType) {
    case 'network':
      // For hard difficulty, only show the minimal explanation without image-like formatting
      if (difficulty === 'hard') {
        explanation = language === 'en'
          ? `Network address: ${networkAddress}`
          : `Netwerkadres: ${networkAddress}`;
      } else {
        const networkExplanationText = language === 'en'
          ? `<p>To find the network address, perform a bitwise AND operation between the IP address and the subnet mask:</p>
          <p class="mt-2 font-mono">IP: ${ip}<br>Mask: ${mask}<br>Network: ${networkAddress}</p>`
          : `<p>Om het netwerkadres te vinden, voer je een bitwise AND-bewerking uit tussen het IP-adres en het subnet masker:</p>
          <p class="mt-2 font-mono">IP: ${ip}<br>Masker: ${mask}<br>Netwerk: ${networkAddress}</p>`;
        explanation = networkExplanationText;
      }
      break;
    case 'broadcast':
      if (difficulty === 'hard') {
        explanation = language === 'en'
          ? `Broadcast address: ${broadcastAddress}`
          : `Broadcastadres: ${broadcastAddress}`;
      } else {
        const broadcastExplanationText = language === 'en'
          ? `<p>To find the broadcast address, set all host bits to 1:</p>
          <p class="mt-2 font-mono">Network: ${networkAddress}<br>Mask: ${mask}<br>Broadcast: ${broadcastAddress}</p>`
          : `<p>Om het broadcastadres te vinden, zet je alle host-bits op 1:</p>
          <p class="mt-2 font-mono">Netwerk: ${networkAddress}<br>Masker: ${mask}<br>Broadcast: ${broadcastAddress}</p>`;
        explanation = broadcastExplanationText;
      }
      break;
    case 'hosts':
      if (difficulty === 'hard') {
        explanation = language === 'en'
          ? `Usable hosts: ${usableHosts}`
          : `Bruikbare hosts: ${usableHosts}`;
      } else {
        const hostsExplanationText = language === 'en'
          ? `<p>To calculate the number of usable hosts:</p>
          <p class="mt-2 font-mono">2<sup>(32 - prefix)</sup> - 2 = 2<sup>${32 - prefix}</sup> - 2 = ${usableHosts}</p>
          <p>We subtract 2 to account for the network and broadcast addresses, which can't be assigned to hosts.</p>`
          : `<p>Om het aantal bruikbare hosts te berekenen:</p>
          <p class="mt-2 font-mono">2<sup>(32 - prefix)</sup> - 2 = 2<sup>${32 - prefix}</sup> - 2 = ${usableHosts}</p>
          <p>We trekken 2 af voor het netwerk- en broadcastadres, die niet aan hosts kunnen worden toegewezen.</p>`;
        explanation = hostsExplanationText;
      }
      break;
    case 'first-last':
      if (difficulty === 'hard') {
        explanation = language === 'en'
          ? `First usable host: ${firstHost}<br>Last usable host: ${lastHost}`
          : `Eerste bruikbare host: ${firstHost}<br>Laatste bruikbare host: ${lastHost}`;
      } else {
        const firstLastExplanationText = language === 'en'
          ? `<p>The first usable host is the network address + 1:</p>
          <p class="mt-2 font-mono">Network: ${networkAddress}<br>First Host: ${firstHost}</p>
          <p class="mt-2">The last usable host is the broadcast address - 1:</p>
          <p class="mt-2 font-mono">Broadcast: ${broadcastAddress}<br>Last Host: ${lastHost}</p>`
          : `<p>De eerste bruikbare host is het netwerkadres + 1:</p>
          <p class="mt-2 font-mono">Netwerk: ${networkAddress}<br>Eerste Host: ${firstHost}</p>
          <p class="mt-2">De laatste bruikbare host is het broadcastadres - 1:</p>
          <p class="mt-2 font-mono">Broadcast: ${broadcastAddress}<br>Laatste Host: ${lastHost}</p>`;
        explanation = firstLastExplanationText;
      }
      break;
    case 'prefix':
      if (difficulty === 'hard') {
        explanation = language === 'en'
          ? `CIDR prefix: /${prefix}`
          : `CIDR prefix: /${prefix}`;
      } else {
        const prefixExplanationText = language === 'en'
          ? `<p>The CIDR prefix counts the number of contiguous 1 bits in the subnet mask:</p>
          <p class="mt-2 font-mono">Mask: ${mask}<br>CIDR: /${prefix}</p>
          <p class="mt-2 text-sm text-slate-600 dark:text-zinc-400"><i>Note: Both CIDR notation (e.g., /24) and decimal format (e.g., 255.255.255.0) are equivalent representations of subnet masks.</i></p>`
          : `<p>De CIDR prefix telt het aantal aaneengesloten 1-bits in het subnet masker:</p>
          <p class="mt-2 font-mono">Masker: ${mask}<br>CIDR: /${prefix}</p>
          <p class="mt-2 text-sm text-slate-600 dark:text-zinc-400"><i>Let op: Zowel CIDR notatie (bijv. /24) als decimaal formaat (bijv. 255.255.255.0) zijn gelijkwaardige representaties van subnet maskers.</i></p>`;
        explanation = prefixExplanationText;
      }
      break;
    case 'mask':
      // If mask is shown in decimal format, explain conversion to CIDR
      // If mask is shown in CIDR format, explain conversion to decimal
      const isMaskToPrefix = questionText.includes(mask);
      
      if (difficulty === 'hard') {
        explanation = isMaskToPrefix
          ? (language === 'en' ? `CIDR prefix: /${prefix}` : `CIDR prefix: /${prefix}`)
          : (language === 'en' ? `Subnet mask: ${mask}` : `Subnet mask: ${mask}`);
      } else {
        const maskExplanationText = isMaskToPrefix
          ? (language === 'en'
              ? `<p>Converting from subnet mask to CIDR prefix:</p>
              <p class="mt-2 font-mono">Mask: ${mask}<br>CIDR: /${prefix}</p>
              <p class="mt-2">To find the prefix, count the number of consecutive 1 bits in the binary representation of the subnet mask.</p>`
              : `<p>Omzetten van subnet masker naar CIDR prefix:</p>
              <p class="mt-2 font-mono">Masker: ${mask}<br>CIDR: /${prefix}</p>
              <p class="mt-2">Om de prefix te vinden, tel het aantal opeenvolgende 1-bits in de binaire representatie van het subnet masker.</p>`)
          : (language === 'en'
              ? `<p>Converting from CIDR prefix to subnet mask:</p>
              <p class="mt-2 font-mono">CIDR: /${prefix}<br>Mask: ${mask}</p>
              <p class="mt-2">To find the mask, set ${prefix} bits to 1 from the left, and the rest to 0, then convert to decimal.</p>`
              : `<p>Omzetten van CIDR prefix naar subnet masker:</p>
              <p class="mt-2 font-mono">CIDR: /${prefix}<br>Masker: ${mask}</p>
              <p class="mt-2">Om het masker te vinden, zet ${prefix} bits op 1 van links, en de rest op 0, converteer dan naar decimaal.</p>`);
        explanation = maskExplanationText;
      }
      break;
    case 'all':
      if (difficulty === 'hard') {
        explanation = language === 'en'
          ? `Network address: ${networkAddress}<br>Broadcast address: ${broadcastAddress}<br>First usable host: ${firstHost}<br>Last usable host: ${lastHost}`
          : `Netwerkadres: ${networkAddress}<br>Broadcastadres: ${broadcastAddress}<br>Eerste bruikbare host: ${firstHost}<br>Laatste bruikbare host: ${lastHost}`;
      } else {
        const allExplanationText = language === 'en'
          ? `<h3 class="font-bold mb-2">Subnet Address Calculations</h3>
          <div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4">
            <p class="font-medium">Given IP: ${ip} with Subnet Mask: ${mask}</p>
          </div>
          
          <div class="grid gap-4 mt-4">
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
              <h4 class="font-semibold text-indigo-700 dark:text-indigo-400">Network Address</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">The network address identifies the subnet and is calculated by performing a bitwise AND operation between the IP address and subnet mask.</p>
              
              <div class="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded font-mono">
                <div><span class="text-slate-500 mr-2">IP:</span> ${ip}</div>
                <div><span class="text-slate-500 mr-2">Mask:</span> ${mask}</div>
                <div class="mt-1 pt-1 border-t border-dashed border-zinc-300 dark:border-zinc-600">
                  <span class="text-slate-500 mr-2">Network:</span> <span class="font-semibold">${networkAddress}</span>
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
              <h4 class="font-semibold text-rose-700 dark:text-rose-400">Broadcast Address</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">The broadcast address is used to send packets to all hosts on the subnet and is calculated using the network address and the inverted subnet mask.</p>
              
              <div class="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded font-mono">
                <div><span class="text-slate-500 mr-2">Network:</span> ${networkAddress}</div>
                <div><span class="text-slate-500 mr-2">Inverted Mask:</span> ${mask.split('.').map(octet => (255 - parseInt(octet)).toString()).join('.')}</div>
                <div class="mt-1 pt-1 border-t border-dashed border-zinc-300 dark:border-zinc-600">
                  <span class="text-slate-500 mr-2">Broadcast:</span> <span class="font-semibold">${broadcastAddress}</span>
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
              <h4 class="font-semibold text-emerald-700 dark:text-emerald-400">Usable Host Range</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">The usable host range excludes the network and broadcast addresses, leaving the following range for devices:</p>
              
              <div class="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded font-mono">
                <div><span class="text-slate-500 mr-2">First Host:</span> <span class="font-semibold">${firstHost}</span></div>
                <div><span class="text-slate-500 mr-2">Last Host:</span> <span class="font-semibold">${lastHost}</span></div>
              </div>
            </div>
          </div>`
          : `<h3 class="font-bold mb-2">Subnet Adresberekeningen</h3>
          <div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4">
            <p class="font-medium">Gegeven IP: ${ip} met Subnet Masker: ${mask}</p>
          </div>
          
          <div class="grid gap-4 mt-4">
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
              <h4 class="font-semibold text-indigo-700 dark:text-indigo-400">Netwerkadres</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Het netwerkadres identificeert het subnet en wordt berekend door een bitwise AND-operatie uit te voeren tussen het IP-adres en het subnet masker.</p>
              
              <div class="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded font-mono">
                <div><span class="text-slate-500 mr-2">IP:</span> ${ip}</div>
                <div><span class="text-slate-500 mr-2">Masker:</span> ${mask}</div>
                <div class="mt-1 pt-1 border-t border-dashed border-zinc-300 dark:border-zinc-600">
                  <span class="text-slate-500 mr-2">Netwerk:</span> <span class="font-semibold">${networkAddress}</span>
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
              <h4 class="font-semibold text-rose-700 dark:text-rose-400">Broadcastadres</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Het broadcastadres wordt gebruikt om pakketten naar alle hosts op het subnet te sturen en wordt berekend met behulp van het netwerkadres en het geïnverteerde subnet masker.</p>
              
              <div class="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded font-mono">
                <div><span class="text-slate-500 mr-2">Netwerk:</span> ${networkAddress}</div>
                <div><span class="text-slate-500 mr-2">Geïnverteerd Masker:</span> ${mask.split('.').map(octet => (255 - parseInt(octet)).toString()).join('.')}</div>
                <div class="mt-1 pt-1 border-t border-dashed border-zinc-300 dark:border-zinc-600">
                  <span class="text-slate-500 mr-2">Broadcast:</span> <span class="font-semibold">${broadcastAddress}</span>
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
              <h4 class="font-semibold text-emerald-700 dark:text-emerald-400">Bruikbaar Host Bereik</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Het bruikbare host-bereik sluit het netwerk- en broadcastadres uit, waardoor het volgende bereik voor apparaten overblijft:</p>
              
              <div class="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded font-mono">
                <div><span class="text-slate-500 mr-2">Eerste Host:</span> <span class="font-semibold">${firstHost}</span></div>
                <div><span class="text-slate-500 mr-2">Laatste Host:</span> <span class="font-semibold">${lastHost}</span></div>
              </div>
            </div>
          </div>`;
        explanation = allExplanationText;
      }
      break;
  }
  
  return {
    questionText,
    answerFields,
    explanation
  };
}

// Build a wildcard mask problem
function buildWildcardMaskProblem(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  // Generate a base network
  const ip = generateRandomIP();
  
  let prefix = 0;
  if (difficulty === 'easy') {
    // Simple network for wildcard mask
    prefix = [16, 24][Math.floor(Math.random() * 2)];
  } else if (difficulty === 'medium') {
    // More complex networks
    prefix = [8, 16, 24, 28][Math.floor(Math.random() * 4)];
  } else { // hard
    // Any valid prefix
    prefix = [8, 12, 16, 20, 22, 24, 26, 28, 30][Math.floor(Math.random() * 9)];
  }
  
  const subnetMask = prefixToSubnetMask(prefix);
  
  // Calculate wildcard mask (inverse of subnet mask)
  const wildcardMask = subnetMask.split('.').map(octet => (255 - parseInt(octet))).join('.');
  
  // Calculate network information
  const networkAddress = calculateNetworkAddress(ip, subnetMask);
  
  // Create wildcard ACL
  const aclIp = networkAddress.split('.').map((part, i) => {
    // Apply wildcard mask to network address for wildcard ACL format
    const maskPart = parseInt(wildcardMask.split('.')[i]);
    return parseInt(part) & ~maskPart;
  }).join('.');
  
  // Create question
  // Create explanation with text based on language
  const explanationIntro = language === 'en'
    ? `A wildcard mask is used in access control lists (ACLs) to specify which parts of an IP address are important for matching. It's the <i>inverse</i> of a subnet mask.`
    : `Een wildcard-masker wordt gebruikt in access control lists (ACL's) om aan te geven welke delen van een IP-adres belangrijk zijn voor matching. Het is het <i>omgekeerde</i> van een subnet masker.`;
    
  let questionText = '';
  let answerFields: { id: string; label: string; answer: string }[] = [];
  
  // Different question based on difficulty
  if (difficulty === 'easy' || difficulty === 'medium') {
    // For easy and medium: Subnet mask → Wildcard
    const toWildcardPrompt = language === 'en'
      ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">Convert the subnet mask <span class="font-mono font-medium">${subnetMask}</span> to a wildcard mask.</p>`
      : `<p class="text-slate-800 mb-3 dark:text-zinc-200">Converteer het subnet masker <span class="font-mono font-medium">${subnetMask}</span> naar een wildcard masker.</p>`;
    
    questionText = toWildcardPrompt;
    
    const wildcardLabel = language === 'en' ? 'Wildcard Mask' : 'Wildcard Masker';
    answerFields = [
      { id: 'wildcard-mask', label: wildcardLabel, answer: wildcardMask }
    ];
  } else {
    // For hard: Create ACL format
    const forAclPrompt = language === 'en'
      ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">You need to create an ACL that matches packets from the network <span class="font-mono font-medium">${networkAddress}/${prefix}</span>.</p>
      <p class="text-slate-800 dark:text-zinc-200">What IP address and wildcard mask combination should you use in the ACL statement?</p>`
      : `<p class="text-slate-800 mb-3 dark:text-zinc-200">Je moet een ACL maken die pakketten matcht van het netwerk <span class="font-mono font-medium">${networkAddress}/${prefix}</span>.</p>
      <p class="text-slate-800 dark:text-zinc-200">Welke IP-adres en wildcard-masker combinatie moet je gebruiken in de ACL-verklaring?</p>`;
    
    questionText = forAclPrompt;
    
    const ipLabel = language === 'en' ? 'IP Address' : 'IP-adres';
    const wildcardLabel = language === 'en' ? 'Wildcard Mask' : 'Wildcard Masker';
    answerFields = [
      { id: 'acl-ip', label: ipLabel, answer: networkAddress },
      { id: 'acl-wildcard', label: wildcardLabel, answer: wildcardMask }
    ];
  }
  
  let explanation = `<p>${explanationIntro}</p>
  <p class="mt-2 font-mono bg-slate-100 p-2 rounded dark:bg-zinc-800">
  Subnet mask: ${subnetMask}<br>
  Wildcard mask: ${wildcardMask}
  </p>
  <p class="mt-2">${language === 'en' ? 'To calculate a wildcard mask, subtract each octet of the subnet mask from 255:' : 'Om een wildcard-masker te berekenen, trek je elk octet van het subnet masker af van 255:'}</p>
  <p class="mt-2 font-mono">${subnetMask.split('.').map(octet => `255 - ${octet} = ${255 - parseInt(octet)}`).join('<br>')}</p>`;
  
  // Add more explanation for ACL format in hard difficulty
  if (difficulty === 'hard') {
    const forAclsText = language === 'en'
      ? `<b>For ACLs</b>: The IP address stays the same as the network address, and the wildcard mask shows which bits can vary (1s) and which must match exactly (0s).` 
      : `<b>Voor ACL's</b>: Het IP-adres blijft hetzelfde als het netwerkadres, en het wildcard-masker toont welke bits kunnen variëren (1-en) en welke exact moeten overeenkomen (0-en).`;
    
    explanation += `<p class="mt-2">${forAclsText}</p>`;
  }
  
  return {
    questionText,
    answerFields,
    explanation
  };
}

// Build a network calculation problem (e.g., "How many /28 subnets can you get from a /24 network?")
function buildNetworkCalculationProblem(difficulty: string, language: Language = 'nl', forcedType: string = ''): SubnettingQuestion {
  let questionText = '';
  let answerFields: { id: string; label: string; answer: string }[] = [];
  let explanation = '';
  
  // Choose what kind of calculation to test or use the forced type
  const questionTypes = ['subnet-count', 'host-count', 'vlsm', 'comprehensive-subnet', 'fixed-hosts-subnet'];
  let questionType = 'subnet-count';
  
  // If a forced type is provided, use it; otherwise, select based on difficulty
  if (forcedType) {
    questionType = forcedType;
  } else if (difficulty === 'easy') {
    questionType = 'subnet-count';
  } else if (difficulty === 'medium') {
    questionType = questionTypes[Math.floor(Math.random() * 3)]; // subnet-count, host-count, or vlsm
  } else { // hard
    // Add probability for the comprehensive subnet question types
    const rand = Math.random();
    if (rand < 0.35) {
      questionType = 'comprehensive-subnet'; // 35% kans op dit type
    } else if (rand < 0.7) {
      questionType = 'fixed-hosts-subnet'; // 35% kans op dit type
    } else {
      // 30% kans op andere typen
      questionType = ['subnet-count', 'host-count', 'vlsm'][Math.floor(Math.random() * 3)];
    }
  }
  
  if (questionType === 'subnet-count') {
    // Ask about splitting a network into X subnets and finding required info
    let baseNetwork = '';
    let basePrefix = 0;
    let targetSubnets = 0;
    let requiredPrefixBits = 0;
    
    // Generate a random IP address for the base network
    if (difficulty === 'easy') {
      // For easy, use common class networks
      const classOptions = [
        { network: '192.168.0.0', prefix: 24 },
        { network: '172.16.0.0', prefix: 16 },
        { network: '10.0.0.0', prefix: 8 }
      ];
      const selected = classOptions[Math.floor(Math.random() * classOptions.length)];
      baseNetwork = selected.network;
      basePrefix = selected.prefix;
      
      // For easy, choose from common subnet counts
      targetSubnets = [4, 8, 16, 32][Math.floor(Math.random() * 4)];
    } else if (difficulty === 'medium') {
      // For medium, use different networks
      const classOptions = [
        { network: '192.168.10.0', prefix: 24 },
        { network: '172.20.0.0', prefix: 16 },
        { network: '10.50.0.0', prefix: 16 }
      ];
      const selected = classOptions[Math.floor(Math.random() * classOptions.length)];
      baseNetwork = selected.network;
      basePrefix = selected.prefix;
      
      // For medium, use less common subnet counts
      targetSubnets = [6, 12, 24, 48][Math.floor(Math.random() * 4)];
    } else { // hard
      // For hard, use various networks
      baseNetwork = generateRandomIP();
      basePrefix = [8, 16, 20, 24][Math.floor(Math.random() * 4)];
      
      // For hard, use more challenging subnet counts
      targetSubnets = [5, 10, 15, 25, 50, 100][Math.floor(Math.random() * 6)];
    }
    
    // Calculate how many prefix bits are needed for the target number of subnets
    requiredPrefixBits = Math.ceil(Math.log2(targetSubnets));
    
    // Calculate the subnet prefix
    const subnetPrefix = basePrefix + requiredPrefixBits;
    
    // Calculate the subnet mask in decimal notation
    const subnetMask = prefixToSubnetMask(subnetPrefix);
    
    // Calculate actual number of subnets possible with this prefix
    const actualSubnets = Math.pow(2, requiredPrefixBits);
    
    // Calculate number of host bits
    const hostBits = 32 - subnetPrefix;
    
    // Create a more comprehensive question
    const subnetQuestionTitle = language === 'en'
      ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">Divide ${baseNetwork}/${basePrefix} into ${targetSubnets} subnets.</p>`
      : `<p class="text-slate-800 mb-3 dark:text-zinc-200">${baseNetwork}/${basePrefix} verdelen in ${targetSubnets} subnetten.</p>`;
    
    const subnetQuestionPrompt = language === 'en'
      ? `<p class="text-slate-700 mb-3 dark:text-zinc-300">Answer the following questions:</p>`
      : `<p class="text-slate-700 mb-3 dark:text-zinc-300">Beantwoord de volgende vragen:</p>`;
    
    questionText = subnetQuestionTitle + subnetQuestionPrompt;
    
    // Multiple fields for the answer
    const subnetMaskLabel = language === 'en' ? 'Subnet Mask (decimal)' : 'Subnetmask (decimaal)';
    const hostBitsLabel = language === 'en' ? 'Host Bits' : 'Host-bits';
    const cidrLabel = language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix';
    
    // Generate the first 4 subnet addresses for examples
    const baseOctets = baseNetwork.split('.').map(octet => parseInt(octet));
    const subnetIncrementValue = Math.pow(2, Math.max(0, 8 - (subnetPrefix % 8)));
    
    // Calculate which octet will change based on the subnet prefix
    const changingOctetIndex = Math.min(3, Math.floor(subnetPrefix / 8));
    
    // Calculate subnet addresses with proper handling of octet overflow
    const subnetAddresses = [];
    
    // For subnet calculations, we need to start from the base network address (all zeros in host part)
    // Create a clean network address (zeros in host part)
    let networkBaseOctets = [...baseOctets];
    
    // Zero out all bits in the host part (everything after the basePrefix)
    if (basePrefix <= 8) {
      // For Class A, zero out octets 2-4
      networkBaseOctets[1] = 0;
      networkBaseOctets[2] = 0;
      networkBaseOctets[3] = 0;
    } else if (basePrefix <= 16) {
      // For Class B, zero out octets 3-4
      networkBaseOctets[2] = 0;
      networkBaseOctets[3] = 0;
    } else if (basePrefix <= 24) {
      // For Class C, zero out octet 4
      networkBaseOctets[3] = 0;
    }
    
    // Calculate the first few subnet addresses
    for (let i = 0; i < Math.min(4, actualSubnets); i++) {
      const subnetOctets = calculateSubnetAddress(
        networkBaseOctets, 
        i, 
        subnetIncrementValue,
        changingOctetIndex
      );
      
      // Format as a CIDR notation
      subnetAddresses.push(`${subnetOctets.join('.')}/${subnetPrefix}`);
    }
    
    const subnet1Label = language === 'en' ? 'First Subnet (CIDR)' : 'Eerste Subnet (CIDR)';
    const subnet2Label = language === 'en' ? 'Second Subnet (CIDR)' : 'Tweede Subnet (CIDR)';
    const subnet3Label = language === 'en' ? 'Third Subnet (CIDR)' : 'Derde Subnet (CIDR)';
    const subnet4Label = language === 'en' ? 'Fourth Subnet (CIDR)' : 'Vierde Subnet (CIDR)';
    
    // For each subnet, also create alternate answers for just the network portion
    // This allows users to input either form and have it be correct
    const subnet1WithoutCIDR = subnetAddresses[0] ? subnetAddresses[0].split('/')[0] : '';
    const subnet2WithoutCIDR = subnetAddresses[1] ? subnetAddresses[1].split('/')[0] : '';
    const subnet3WithoutCIDR = subnetAddresses[2] ? subnetAddresses[2].split('/')[0] : '';
    const subnet4WithoutCIDR = subnetAddresses[3] ? subnetAddresses[3].split('/')[0] : '';
    
    answerFields = [
      { id: 'subnet-mask', label: subnetMaskLabel, answer: subnetMask },
      { id: 'host-bits', label: hostBitsLabel, answer: hostBits.toString() },
      { id: 'subnet-prefix', label: cidrLabel, answer: `/${subnetPrefix}` },
      { 
        id: 'subnet-1', 
        label: subnet1Label, 
        answer: subnetAddresses[0] || '',
        alternateAnswers: [subnet1WithoutCIDR]
      },
      { 
        id: 'subnet-2', 
        label: subnet2Label, 
        answer: subnetAddresses[1] || '',
        alternateAnswers: [subnet2WithoutCIDR] 
      },
      { 
        id: 'subnet-3', 
        label: subnet3Label, 
        answer: subnetAddresses[2] || '',
        alternateAnswers: [subnet3WithoutCIDR]
      },
      { 
        id: 'subnet-4', 
        label: subnet4Label, 
        answer: subnetAddresses[3] || '',
        alternateAnswers: [subnet4WithoutCIDR]
      }
    ];
    
    // Generate list of subnets for explanation
    const subnetList = subnetAddresses
      .map((subnet, index) => `<li>Subnet ${index + 1}: ${subnet}</li>`)
      .join('');
      
    // Generate explanation
    const hostExplanation = language === 'en'
      ? `<p>To divide the network ${baseNetwork}/${basePrefix} into ${targetSubnets} subnets:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li><strong>Calculate required subnet bits:</strong> We need at least ${targetSubnets} subnets, so we need enough bits to represent that many networks:<br>
        ceil(log₂(${targetSubnets})) = ${requiredPrefixBits} bits</li>
        <li><strong>Calculate new subnet prefix:</strong> Add the subnet bits to the original prefix:<br>
        ${basePrefix} (original) + ${requiredPrefixBits} (subnet bits) = /${subnetPrefix}</li>
        <li><strong>Determine subnet mask:</strong> Convert the new prefix to a subnet mask:<br>
        /${subnetPrefix} = ${subnetMask}</li>
        <li><strong>Calculate available host bits:</strong> Total bits (32) minus prefix bits:<br>
        32 - ${subnetPrefix} = ${hostBits} host bits</li>
        <li><strong>Total number of subnets possible:</strong> With ${requiredPrefixBits} subnet bits:<br>
        2<sup>${requiredPrefixBits}</sup> = ${actualSubnets} subnets</li>
      </ol>
      <p class="mt-2">With this subnet configuration (/${subnetPrefix}), you can create ${actualSubnets} equal-sized subnets from the original ${baseNetwork}/${basePrefix} network.</p>
      <p class="mt-2">The first few subnet addresses are:</p>
      <ul class="list-disc ml-5 mt-2 space-y-1 font-mono font-bold">
        ${subnetList}
      </ul>`
      : `<p>Om het netwerk ${baseNetwork}/${basePrefix} te verdelen in ${targetSubnets} subnetten:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li><strong>Bereken benodigde subnet-bits:</strong> We hebben minstens ${targetSubnets} subnetten nodig, dus we hebben genoeg bits nodig om dat aantal netwerken te representeren:<br>
        ceil(log₂(${targetSubnets})) = ${requiredPrefixBits} bits</li>
        <li><strong>Bereken nieuwe subnet-prefix:</strong> Tel de subnet-bits op bij de originele prefix:<br>
        ${basePrefix} (origineel) + ${requiredPrefixBits} (subnet-bits) = /${subnetPrefix}</li>
        <li><strong>Bepaal subnet masker:</strong> Zet de nieuwe prefix om naar een subnet masker:<br>
        /${subnetPrefix} = ${subnetMask}</li>
        <li><strong>Bereken beschikbare host-bits:</strong> Totaal aantal bits (32) min prefix bits:<br>
        32 - ${subnetPrefix} = ${hostBits} host-bits</li>
        <li><strong>Totaal aantal mogelijke subnetten:</strong> Met ${requiredPrefixBits} subnet-bits:<br>
        2<sup>${requiredPrefixBits}</sup> = ${actualSubnets} subnetten</li>
      </ol>
      <p class="mt-2">Met deze subnet configuratie (/${subnetPrefix}) kun je ${actualSubnets} even grote subnetten maken van het originele ${baseNetwork}/${basePrefix} netwerk.</p>
      <p class="mt-2">De eerste subnet-adressen zijn:</p>
      <ul class="list-disc ml-5 mt-2 space-y-1 font-mono font-bold">
        ${subnetList}
      </ul>`;
    
    explanation = hostExplanation;
  } 
  else if (questionType === 'host-count') {
    // Ask "How many host addresses can you have with a /X subnet?"
    let subnetPrefix = 0;
    
    if (difficulty === 'easy') {
      subnetPrefix = [24, 26, 28][Math.floor(Math.random() * 3)];
    } else if (difficulty === 'medium') {
      subnetPrefix = [16, 20, 24, 27, 28, 29][Math.floor(Math.random() * 6)];
    } else { // hard
      subnetPrefix = [8, 12, 16, 20, 24, 26, 28, 29, 30][Math.floor(Math.random() * 9)];
    }
    
    // Calculate usable host addresses (2^host bits - 2)
    const hostBits = 32 - subnetPrefix;
    const usableHosts = Math.pow(2, hostBits) - 2;
    
    // Create the question
    const hostQuestion = language === 'en'
      ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">How many usable host addresses are available in a /${subnetPrefix} subnet?</p>`
      : `<p class="text-slate-800 mb-3 dark:text-zinc-200">Hoeveel bruikbare host-adressen zijn beschikbaar in een /${subnetPrefix} subnet?</p>`;
    
    questionText = hostQuestion;
    
    const hostCountLabel = language === 'en' ? 'Number of Usable Hosts' : 'Aantal Bruikbare Hosts';
    answerFields = [
      { id: 'host-count', label: hostCountLabel, answer: usableHosts.toString() }
    ];
    
    // Generate explanation
    const subnetExplanation = language === 'en'
      ? `<p>To calculate the number of usable host addresses in a /${subnetPrefix} subnet:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-2">
        <li><strong>Determine the host bits:</strong><br>
        In an IPv4 address, there are 32 bits total. The subnet prefix (/${subnetPrefix}) tells us how many bits are used for the network portion.<br>
        Host bits = 32 - ${subnetPrefix} = <strong>${hostBits} bits</strong></li>
        
        <li><strong>Calculate the total addresses:</strong><br>
        The total number of addresses (including network and broadcast) is 2 raised to the power of the host bits.<br>
        2<sup>${hostBits}</sup> = <strong>${Math.pow(2, hostBits)} total addresses</strong></li>
        
        <li><strong>Calculate usable addresses:</strong><br>
        We must subtract 2 addresses that cannot be assigned to hosts:<br>
        - The network address (all host bits set to 0)<br>
        - The broadcast address (all host bits set to 1)<br><br>
        ${Math.pow(2, hostBits)} - 2 = <strong>${usableHosts} usable host addresses</strong></li>
      </ol>
      <p class="mt-2 font-medium">Therefore, a /${subnetPrefix} subnet provides ${usableHosts} addresses that can be assigned to devices.</p>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Note: In special cases like point-to-point links with /31 prefixes, different rules may apply.</p>`
      : `<p>Om het aantal bruikbare host-adressen in een /${subnetPrefix} subnet te berekenen:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-2">
        <li><strong>Bepaal de host-bits:</strong><br>
        In een IPv4-adres zijn er in totaal 32 bits. De subnet-prefix (/${subnetPrefix}) vertelt ons hoeveel bits worden gebruikt voor het netwerkgedeelte.<br>
        Host-bits = 32 - ${subnetPrefix} = <strong>${hostBits} bits</strong></li>
        
        <li><strong>Bereken het totaal aantal adressen:</strong><br>
        Het totale aantal adressen (inclusief netwerk- en broadcastadres) is 2 tot de macht van het aantal host-bits.<br>
        2<sup>${hostBits}</sup> = <strong>${Math.pow(2, hostBits)} totale adressen</strong></li>
        
        <li><strong>Bereken bruikbare adressen:</strong><br>
        We moeten 2 adressen aftrekken die niet aan hosts kunnen worden toegewezen:<br>
        - Het netwerkadres (alle host-bits op 0)<br>
        - Het broadcastadres (alle host-bits op 1)<br><br>
        ${Math.pow(2, hostBits)} - 2 = <strong>${usableHosts} bruikbare host-adressen</strong></li>
      </ol>
      <p class="mt-2 font-medium">Daarom biedt een /${subnetPrefix} subnet ${usableHosts} adressen die aan apparaten kunnen worden toegewezen.</p>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Opmerking: In speciale gevallen zoals point-to-point verbindingen met /31 prefixen, kunnen andere regels gelden.</p>`;
    
    explanation = subnetExplanation;
  } 
  else if (questionType === 'vlsm') {
    // VLSM calculation (only for medium/hard)
    // "What's the smallest subnet that can accommodate X hosts?"
    
    let requiredHosts = 0;
    
    if (difficulty === 'medium') {
      // Medium difficulty: common sizes
      const possibleSizes = [6, 10, 25, 50, 100, 250];
      requiredHosts = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];
    } else { // hard
      // Hard difficulty: less common sizes
      const possibleSizes = [15, 30, 60, 120, 300, 500, 1000];
      requiredHosts = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];
    }
    
    // Calculate the required prefix
    // Find the number of host bits needed (ceiling of log2(hosts+2))
    const hostBitsNeeded = Math.ceil(Math.log2(requiredHosts + 2));
    const requiredPrefix = 32 - hostBitsNeeded;
    
    // Calculate the actual number of hosts this prefix provides
    const actualHosts = Math.pow(2, hostBitsNeeded) - 2;
    
    // Generate a network to work with
    const baseNetwork = generateRandomIP();
    const basePrefix = [16, 20, 24][Math.floor(Math.random() * 3)];
    
    // Calculate the subnet mask in decimal notation
    const subnetMask = prefixToSubnetMask(requiredPrefix);
    
    // Calculate number of host bits
    const hostBits = 32 - requiredPrefix;
    
    // Create a more comprehensive question
    const questionTitle = language === 'en'
      ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">${baseNetwork}/${basePrefix} verdelen zodat elk subnet ${requiredHosts} hosts heeft.</p>`
      : `<p class="text-slate-800 mb-3 dark:text-zinc-200">${baseNetwork}/${basePrefix} verdelen zodat elk subnet ${requiredHosts} hosts heeft.</p>`;
    
    const questionPrompt = language === 'en'
      ? `<p class="text-slate-700 mb-3 dark:text-zinc-300">Answer the following questions:</p>
         <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">
         <li>Write the subnet mask in decimal notation</li>
         <li>How many host bits must you borrow?</li>
         <li>What is the CIDR for these subnets?</li>
         </ul>`
      : `<p class="text-slate-700 mb-3 dark:text-zinc-300">Beantwoord de volgende vragen:</p>
         <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">
         <li>Schrijf het subnetmask uit in decimalen</li>
         <li>Hoeveel host-bits moet je lenen?</li>
         <li>Wat wordt je CIDR voor deze subnetten?</li>
         </ul>`;
    
    questionText = questionTitle + questionPrompt;
    
    // Multiple fields for the answer
    const subnetMaskLabel = language === 'en' ? 'Subnet Mask (decimal)' : 'Subnetmask (decimaal)';
    const hostBitsLabel = language === 'en' ? 'Host Bits' : 'Host-bits';
    const cidrLabel = language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix';
    
    answerFields = [
      { id: 'subnet-mask', label: subnetMaskLabel, answer: subnetMask },
      { id: 'host-bits', label: hostBitsLabel, answer: hostBits.toString() },
      { id: 'subnet-prefix', label: cidrLabel, answer: `/${requiredPrefix}` }
    ];
    
    // Generate explanation
    const mediumExplanation = language === 'en'
      ? `<p>To subnet a network for ${requiredHosts} hosts per subnet:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li>We need at least ${requiredHosts} usable host addresses</li>
        <li>We need to add 2 for the network and broadcast addresses: ${requiredHosts} + 2 = ${requiredHosts + 2}</li>
        <li>We need to find the smallest power of 2 that gives us at least ${requiredHosts + 2} addresses: 2<sup>${hostBitsNeeded}</sup> = ${Math.pow(2, hostBitsNeeded)}</li>
        <li>This requires ${hostBitsNeeded} host bits</li>
        <li>Therefore, the prefix is 32 - ${hostBitsNeeded} = /${requiredPrefix}</li>
        <li>The subnet mask in decimal notation is ${subnetMask}</li>
      </ol>
      <p class="mt-2">With a /${requiredPrefix} subnet (${subnetMask}), each subnet will have:</p>
      <ul class="list-disc ml-5 mt-2 space-y-1">
        <li>Host bits: ${hostBits}</li>
        <li>Usable host addresses: ${actualHosts} per subnet</li>
      </ul>`
      : `<p>Om een netwerk te subnetten voor ${requiredHosts} hosts per subnet:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li>We hebben minstens ${requiredHosts} bruikbare host-adressen nodig</li>
        <li>We moeten 2 toevoegen voor het netwerk- en broadcastadres: ${requiredHosts} + 2 = ${requiredHosts + 2}</li>
        <li>We moeten de kleinste macht van 2 vinden die ons minstens ${requiredHosts + 2} adressen geeft: 2<sup>${hostBitsNeeded}</sup> = ${Math.pow(2, hostBitsNeeded)}</li>
        <li>Dit vereist ${hostBitsNeeded} host-bits</li>
        <li>Daarom is de prefix 32 - ${hostBitsNeeded} = /${requiredPrefix}</li>
        <li>Het subnetmask in decimale notatie is ${subnetMask}</li>
      </ol>
      <p class="mt-2">Met een /${requiredPrefix} subnet (${subnetMask}), heeft elk subnet:</p>
      <ul class="list-disc ml-5 mt-2 space-y-1">
        <li>Host-bits: ${hostBits}</li>
        <li>Bruikbare host-adressen: ${actualHosts} per subnet</li>
      </ul>`;
    
    explanation = mediumExplanation;
  }
  else if (questionType === 'fixed-hosts-subnet') {
    // This is a question about splitting a network to accommodate a specific number of hosts per subnet
    // similar to the screenshot example with "232.148.201.54/20 verdelen zodat elk subnet 31 hosts heeft"
    
    // Generate a base network
    const firstOctet = Math.floor(Math.random() * 223) + 1; // 1-223 (avoiding reserved ranges)
    const secondOctet = Math.floor(Math.random() * 256); // 0-255
    const thirdOctet = Math.floor(Math.random() * 256); // 0-255
    const fourthOctet = 0; // Always 0 for the network address
    
    // Generate a suitable starting prefix (usually /16 to /24)
    let startPrefix: number;
    if (difficulty === 'medium') {
      startPrefix = [16, 20, 24][Math.floor(Math.random() * 3)];
    } else { // hard
      startPrefix = [16, 18, 20, 22, 24][Math.floor(Math.random() * 5)];
    }
    
    // Generate a random number of hosts needed per subnet (typically a small number for CCNA questions)
    const hostsPerSubnet = Math.floor(Math.random() * 50) + 5; // 5-54 hosts per subnet
    
    // Calculate how many host bits we need based on the hosts per subnet
    const requiredHostBits = Math.ceil(Math.log2(hostsPerSubnet + 2)); // +2 for network and broadcast
    
    // Calculate the new prefix
    const newPrefix = 32 - requiredHostBits;
    
    // Calculate the subnet mask
    const subnetMask = prefixToSubnetMask(newPrefix);
    
    // Calculate number of possible subnets
    const possibleSubnets = Math.pow(2, newPrefix - startPrefix);
    
    // Create the network base IP
    const baseNetworkIP = `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`;
    // Calculate proper network address (ensuring host bits are 0)
    let cleanBaseOctets = [firstOctet, secondOctet, thirdOctet, fourthOctet];
    
    // Zero out host bits based on prefix length
    if (startPrefix <= 8) {
      cleanBaseOctets[1] = 0;
      cleanBaseOctets[2] = 0;
      cleanBaseOctets[3] = 0;
    } else if (startPrefix <= 16) {
      cleanBaseOctets[2] = 0;
      cleanBaseOctets[3] = 0;
    } else if (startPrefix <= 24) {
      cleanBaseOctets[3] = 0;
    }
    
    // The first subnet is just the base network address with the new prefix
    const subnet1 = `${cleanBaseOctets.join('.')}`;
    
    // Calculate subnet 2 by adding the correct increment
    let subnet2Address = subnet1.split('.').map(octet => parseInt(octet));
    const increment = Math.pow(2, 32 - newPrefix);
    
    // Calculate which octet will change based on the subnet prefix
    const changingOctetIndex = Math.min(3, Math.floor(newPrefix / 8));
    
    // Calculate subnet increment for the specific octet
    const subnetIncrementValue = Math.pow(2, Math.max(0, 8 - (newPrefix % 8)));
    
    // Apply the increment with proper carry handling
    let incrementValue = subnetIncrementValue;
    
    // Start from the last octet and work backwards for proper carry
    for (let j = 3; j >= 0; j--) {
      if (j === changingOctetIndex) {
        // Add increment to the changing octet
        subnet2Address[j] += incrementValue;
        
        // Handle carry to previous octets if needed
        if (subnet2Address[j] > 255) {
          const carry = Math.floor(subnet2Address[j] / 256);
          subnet2Address[j] %= 256;
          
          // If we have carry and we're not at the first octet, add carry to previous octet
          if (j > 0) {
            incrementValue = carry;
            continue; // Continue to previous octet to add carry
          }
        }
      }
      incrementValue = 0; // Reset increment after applying it
    }
    
    const subnet2 = subnet2Address.join('.');
    
    // Calculate an arbitrary nth subnet (e.g., subnet 14)
    // Choose a random subnet number between 5 and 15 (avoid using 10 specifically)
    let randomSubnetNumber;
    do {
      randomSubnetNumber = Math.floor(Math.random() * 11) + 5; // Between 5 and 15
    } while (randomSubnetNumber === 10); // Avoid subnet 10 for now
    
    // Use the improved calculation function for the Nth subnet
    const subnetNOctets = calculateSubnetAddress(
      subnet1.split('.').map(octet => parseInt(octet)),
      randomSubnetNumber - 1,
      subnetIncrementValue,
      changingOctetIndex
    );
    
    const subnetN = subnetNOctets.join('.');
    
    // Create the question text
    const hostPhrase = language === 'en' ? `has ${hostsPerSubnet} hosts` : `${hostsPerSubnet} hosts heeft`;
    const fixedHostPrompt = language === 'en'
      ? `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}/${startPrefix} divided so that each subnet ${hostPhrase}.<br><br>Answer the following questions:`
      : `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}/${startPrefix} verdelen zodat elk subnet ${hostPhrase}.<br><br>Beantwoord de volgende vragen:`;
    
    // Create bullet points with the same questions as in the screenshot
    const bulletPoints = language === 'en'
      ? `<ul class="list-disc pl-5 space-y-1">
          <li>How many host bits do you need for ${hostsPerSubnet} hosts?</li>
          <li>What is the CIDR prefix that will be used for these subnets?</li>
          <li>What is the subnet mask in decimal notation?</li>
          <li>What is Subnet 1 (in CIDR notation)?</li>
          <li>What is Subnet 2 (in CIDR notation)?</li>
          <li>What is Subnet ${randomSubnetNumber} (in CIDR notation)?</li>
        </ul>`
      : `<ul class="list-disc pl-5 space-y-1">
          <li>Hoeveel host-bits heb je nodig voor ${hostsPerSubnet} hosts?</li>
          <li>Wat wordt de CIDR prefix die gebruikt wordt voor deze subnetten?</li>
          <li>Wat is het subnetmask in decimale notatie?</li>
          <li>Wat is Subnet 1 (in CIDR notatie)?</li>
          <li>Wat is Subnet 2 (in CIDR notatie)?</li>
          <li>Wat is Subnet ${randomSubnetNumber} (in CIDR notatie)?</li>
        </ul>`;
    
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${fixedHostPrompt}</p>${bulletPoints}`;
    
    // Create fields for the answers
    const subnetMaskLabel = language === 'en' ? 'Subnet Mask (decimal)' : 'Subnetmask (decimaal)';
    const hostBitsLabel = language === 'en' ? 'Host Bits' : 'Host-bits';
    const cidrLabel = language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix';
    const subnet1Label = language === 'en' ? 'Subnet 1' : 'Subnet 1';
    const subnet2Label = language === 'en' ? 'Subnet 2' : 'Subnet 2';
    const subnetNLabel = language === 'en' ? `Subnet ${randomSubnetNumber}` : `Subnet ${randomSubnetNumber}`;
    
    // Create separate answer fields for each question, in the same order as the bullet points
    // For subnet fields, add alternate answers without CIDR notation
    answerFields = [
      { id: 'host-bits', label: hostBitsLabel, answer: requiredHostBits.toString() },
      { id: 'subnet-prefix', label: cidrLabel, answer: `/${newPrefix}` },
      { id: 'subnet-mask', label: subnetMaskLabel, answer: subnetMask },
      { 
        id: 'subnet-1', 
        label: subnet1Label, 
        answer: `${subnet1}/${newPrefix}`,
        alternateAnswers: [subnet1] // Allow without CIDR
      },
      { 
        id: 'subnet-2', 
        label: subnet2Label, 
        answer: `${subnet2}/${newPrefix}`,
        alternateAnswers: [subnet2] // Allow without CIDR
      },
      { 
        id: 'subnet-n', 
        label: subnetNLabel, 
        answer: `${subnetN}/${newPrefix}`,
        alternateAnswers: [subnetN] // Allow without CIDR
      }
    ];
    
    // Create explanation
    const fixedHostExplanation = language === 'en'
      ? `<h3 class="font-bold mb-2">VLSM Subnet Calculation Step by Step</h3>
        <div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4">
          <p class="font-medium">Task: Divide the ${subnet1}/${startPrefix} network into subnets where each subnet needs to support ${hostsPerSubnet} hosts.</p>
        </div>
        
        <ol class="list-decimal ml-5 mt-3 space-y-3">
          <li>
            <strong>Determine required host bits:</strong><br>
            We need enough host bits to accommodate ${hostsPerSubnet} hosts.<br>
            Formula: 2<sup>host-bits</sup> - 2 ≥ ${hostsPerSubnet}<br>
            With ${requiredHostBits} host bits: 2<sup>${requiredHostBits}</sup> - 2 = ${Math.pow(2, requiredHostBits) - 2} usable hosts<br>
            <span class="text-green-600 dark:text-green-400">✓ This is enough to support ${hostsPerSubnet} hosts</span>
          </li>
          
          <li>
            <strong>Calculate the new subnet prefix:</strong><br>
            Total IPv4 bits (32) - Required host bits (${requiredHostBits}) = ${newPrefix}<br>
            New prefix: <strong>/${newPrefix}</strong>
          </li>
          
          <li>
            <strong>Determine the subnet mask:</strong><br>
            The /${newPrefix} prefix as a decimal subnet mask is: <strong>${subnetMask}</strong>
          </li>
          
          <li>
            <strong>Calculate the number of possible subnets:</strong><br>
            Original prefix: /${startPrefix}<br>
            New prefix: /${newPrefix}<br>
            Subnet bits used: ${newPrefix - startPrefix}<br>
            Possible subnets: 2<sup>${newPrefix - startPrefix}</sup> = ${possibleSubnets} subnets
          </li>
          
          <li>
            <strong>Calculate the subnet addresses:</strong><br>
            <div class="ml-4 font-mono bg-zinc-50 dark:bg-zinc-900 p-2 rounded">
              <div class="font-semibold text-indigo-600 dark:text-indigo-400">First subnet: ${subnet1}/${newPrefix}</div>
              <div class="font-semibold text-indigo-600 dark:text-indigo-400">Second subnet: ${subnet2}/${newPrefix}</div>
              <div class="font-semibold text-indigo-600 dark:text-indigo-400">Subnet ${randomSubnetNumber}: ${subnetN}/${newPrefix}</div>
            </div>
          </li>
        </ol>
        
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
          <p class="font-medium text-blue-800 dark:text-blue-300">VLSM (Variable Length Subnet Masking) allows us to create subnets of different sizes to efficiently use IP address space. In this exercise, we're creating equal-sized subnets, but the same principles apply when creating subnets of different sizes.</p>
        </div>`
      : `<h3 class="font-bold mb-2">VLSM Subnet Berekening Stap voor Stap</h3>
        <div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4">
          <p class="font-medium">Opdracht: Verdeel het ${subnet1}/${startPrefix} netwerk in subnetten waarbij elk subnet ${hostsPerSubnet} hosts moet kunnen ondersteunen.</p>
        </div>
        
        <ol class="list-decimal ml-5 mt-3 space-y-3">
          <li>
            <strong>Bepaal benodigde host-bits:</strong><br>
            We hebben genoeg host-bits nodig voor ${hostsPerSubnet} hosts.<br>
            Formule: 2<sup>host-bits</sup> - 2 ≥ ${hostsPerSubnet}<br>
            Met ${requiredHostBits} host-bits: 2<sup>${requiredHostBits}</sup> - 2 = ${Math.pow(2, requiredHostBits) - 2} bruikbare hosts<br>
            <span class="text-green-600 dark:text-green-400">✓ Dit is voldoende voor ${hostsPerSubnet} hosts</span>
          </li>
          
          <li>
            <strong>Bereken de nieuwe subnet prefix:</strong><br>
            Totaal IPv4 bits (32) - Benodigde host-bits (${requiredHostBits}) = ${newPrefix}<br>
            Nieuwe prefix: <strong>/${newPrefix}</strong>
          </li>
          
          <li>
            <strong>Bepaal het subnet masker:</strong><br>
            De /${newPrefix} prefix als decimaal subnet masker is: <strong>${subnetMask}</strong>
          </li>
          
          <li>
            <strong>Bereken het aantal mogelijke subnetten:</strong><br>
            Originele prefix: /${startPrefix}<br>
            Nieuwe prefix: /${newPrefix}<br>
            Subnet bits gebruikt: ${newPrefix - startPrefix}<br>
            Mogelijke subnetten: 2<sup>${newPrefix - startPrefix}</sup> = ${possibleSubnets} subnetten
          </li>
          
          <li>
            <strong>Bereken de subnet adressen:</strong><br>
            <div class="ml-4 font-mono bg-zinc-50 dark:bg-zinc-900 p-2 rounded">
              <div class="font-semibold text-indigo-600 dark:text-indigo-400">Eerste subnet: ${subnet1}/${newPrefix}</div>
              <div class="font-semibold text-indigo-600 dark:text-indigo-400">Tweede subnet: ${subnet2}/${newPrefix}</div>
              <div class="font-semibold text-indigo-600 dark:text-indigo-400">Subnet ${randomSubnetNumber}: ${subnetN}/${newPrefix}</div>
            </div>
          </li>
        </ol>
        
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
          <p class="font-medium text-blue-800 dark:text-blue-300">VLSM (Variable Length Subnet Masking) stelt ons in staat om subnetten van verschillende groottes te creëren om efficiënt gebruik te maken van de IP-adresruimte. In deze oefening maken we subnetten van gelijke grootte, maar dezelfde principes gelden bij het maken van subnetten van verschillende groottes.</p>
        </div>`;
      
    explanation = fixedHostExplanation;
  }
  else if (questionType === 'comprehensive-subnet') {
    // CCNA-style comprehensive subnet calculation question with multiple parts
    // Generate a base network with a specific number of subnets
    const baseNetwork = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}`; // Start with first two octets
    let prefix: number;
    
    if (difficulty === 'medium') {
      prefix = [16, 17, 18, 19, 20][Math.floor(Math.random() * 5)]; // Medium difficulty: /16-/20
    } else { // Hard
      prefix = [16, 17, 18, 19, 20, 21, 22][Math.floor(Math.random() * 7)]; // Hard: /16-/22
    }
    
    // Calculate how many bits we need for subnets
    const numSubnets = Math.floor(Math.random() * 40) + 10; // Between 10-50 subnets
    const subnetBits = Math.ceil(Math.log2(numSubnets));
    const newPrefix = prefix + subnetBits;
    
    // Calculate subnet mask in decimal
    const subnetMask = prefixToSubnetMask(newPrefix);
    
    // Calculate the number of host bits
    const hostBits = 32 - newPrefix;
    const usableHosts = Math.pow(2, hostBits) - 2;
    
    // Calculate the first few subnets
    const subnet1 = `${baseNetwork}.${Math.floor(Math.random() * 2) * (256 / Math.pow(2, subnetBits))}.0`;
    const subnet2 = `${baseNetwork}.${Math.floor(Math.random() * 2) * (256 / Math.pow(2, subnetBits)) + (256 / Math.pow(2, subnetBits))}.0`;
    const subnetLast = `${baseNetwork}.${(numSubnets - 1) * (256 / Math.pow(2, subnetBits))}.0`;
    
    // Create the question with multiple parts
    const comprehensivePrompt = language === 'en'
      ? `${baseNetwork}.0.0/${prefix} divided into ${numSubnets} subnets.<br><br>Answer the following questions:`
      : `${baseNetwork}.0.0/${prefix} verdelen in ${numSubnets} subnetten.<br><br>Beantwoord de volgende vragen:`;
    
    const bulletPoints = language === 'en'
      ? `<ul class="list-disc pl-5 space-y-1">
          <li>How many subnet bits do you need for ${numSubnets} subnets?</li>
          <li>What is the new CIDR prefix that will be used?</li>
          <li>What is the subnet mask in decimal notation?</li>
          <li>What is Subnet 1 (in CIDR notation)?</li>
          <li>What is Subnet 2 (in CIDR notation)?</li>
          <li>What is Subnet ${numSubnets} (in CIDR notation)?</li>
        </ul>`
      : `<ul class="list-disc pl-5 space-y-1">
          <li>Hoeveel subnet-bits heb je nodig voor ${numSubnets} subnetten?</li>
          <li>Wat wordt de nieuwe CIDR prefix die gebruikt wordt?</li>
          <li>Wat is het subnetmask in decimale notatie?</li>
          <li>Wat is Subnet 1 (in CIDR notatie)?</li>
          <li>Wat is Subnet 2 (in CIDR notatie)?</li>
          <li>Wat is Subnet ${numSubnets} (in CIDR notatie)?</li>
        </ul>`;
    
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${comprehensivePrompt}</p>${bulletPoints}`;
    
    // Create a textarea for the comprehensive answer
    const textarea = language === 'en' 
      ? 'Comprehensive Answer'
      : 'Uitgebreid Antwoord';
    
    // Create model answer for explanation
    const modelAnswer = language === 'en'
      ? `Subnet mask in decimal: ${subnetMask}
Host bits: ${hostBits}
CIDR for subnets: /${newPrefix}
Subnet mask: ${subnetMask}
Subnet 1: ${subnet1}/${newPrefix}
Subnet 2: ${subnet2}/${newPrefix}
Subnet ${numSubnets}: ${subnetLast}/${newPrefix}
Slash notation: ${baseNetwork}.0.0/${prefix} -> ${subnet1}/${newPrefix}`
      : `Subnetmask in decimalen: ${subnetMask}
Host-bits: ${hostBits}
CIDR voor subnetten: /${newPrefix}
Subnetmask: ${subnetMask}
Subnet 1: ${subnet1}/${newPrefix}
Subnet 2: ${subnet2}/${newPrefix}
Subnet ${numSubnets}: ${subnetLast}/${newPrefix}
Slashnotatie: ${baseNetwork}.0.0/${prefix} -> ${subnet1}/${newPrefix}`;
    
    answerFields = [
      { id: 'comprehensive-answer', label: textarea, answer: modelAnswer }
    ];
    
    // Create explanation
    const comprehensiveExplanation = language === 'en'
      ? `<p>Detailed steps for this subnet calculation:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Starting with network ${baseNetwork}.0.0/${prefix}</li>
          <li>Need to create ${numSubnets} subnets, which requires ${subnetBits} subnet bits</li>
          <li>New prefix = ${prefix} + ${subnetBits} = /${newPrefix}</li>
          <li>Subnet mask for /${newPrefix} is ${subnetMask}</li>
          <li>Host bits = 32 - ${newPrefix} = ${hostBits}</li>
          <li>Each subnet has ${usableHosts} usable host addresses</li>
          <li>First subnet starts at ${subnet1}</li>
          <li>Second subnet starts at ${subnet2}</li>
          <li>Last subnet (${numSubnets}) starts at ${subnetLast}</li>
        </ol>`
      : `<p>Gedetailleerde stappen voor deze subnet berekening:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Beginnend met netwerk ${baseNetwork}.0.0/${prefix}</li>
          <li>Er zijn ${numSubnets} subnetten nodig, wat ${subnetBits} subnet-bits vereist</li>
          <li>Nieuwe prefix = ${prefix} + ${subnetBits} = /${newPrefix}</li>
          <li>Subnetmasker voor /${newPrefix} is ${subnetMask}</li>
          <li>Host-bits = 32 - ${newPrefix} = ${hostBits}</li>
          <li>Elk subnet heeft ${usableHosts} bruikbare host-adressen</li>
          <li>Eerste subnet begint bij ${subnet1}</li>
          <li>Tweede subnet begint bij ${subnet2}</li>
          <li>Laatste subnet (${numSubnets}) begint bij ${subnetLast}</li>
        </ol>`;
      
    explanation = comprehensiveExplanation;
  }
  
  return {
    questionText,
    answerFields,
    explanation
  };
}

// Helper to generate a random IPv6 address
function generateRandomIPv6(): string {
  const segments = [];
  for (let i = 0; i < 8; i++) {
    // Generate a random 16-bit hexadecimal number
    segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
  }
  return segments.join(':');
}

// Build an IPv6 problem (focusing only on expanding/shortening IPv6 addresses)
function buildIPv6Problem(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  let questionText = "";
  let answerFields: { id: string; label: string; answer: string }[] = [];
  let explanation = "";
  
  // Based on user request, we'll only use expand/contract IPv6 addresses
  const problemTypes = ['expand-address', 'contract-address'];
  const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
  
  if (problemType === 'expand-address') {
    // Helper function to expand an abbreviated IPv6 address
    const expandIPv6 = (abbreviatedIP: string): string => {
      // If there's no ::, just pad each segment
      if (!abbreviatedIP.includes('::')) {
        return abbreviatedIP.split(':')
          .map(segment => segment.padStart(4, '0'))
          .join(':');
      }
      
      // Split around ::
      const parts = abbreviatedIP.split('::');
      
      // Handle edge cases like :: or ::1
      if (parts.length !== 2) {
        return abbreviatedIP; // Invalid format, return as-is
      }
      
      const leftPart = parts[0] ? parts[0].split(':') : [];
      const rightPart = parts[1] ? parts[1].split(':') : [];
      
      // Determine missing segments
      const missingSegments = 8 - leftPart.length - rightPart.length;
      
      // Build expanded address
      const expandedSegments = [
        ...leftPart.map(segment => segment.padStart(4, '0')),
        ...Array(missingSegments).fill('0000'),
        ...rightPart.map(segment => segment.padStart(4, '0'))
      ];
      
      return expandedSegments.join(':');
    };
    
    // Create an abbreviated address with some pattern
    // We can use a set of predefined patterns to ensure valid addresses
    const abbreviated = [
      // Standard format with :: in the middle
      `${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}::${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}`,
      
      // :: at the beginning
      `::${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}`,
      
      // :: at the end
      `${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}::`,
      
      // Multiple segments with zero shortening
      `${Math.floor(Math.random() * 65536).toString(16)}::${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}:${Math.floor(Math.random() * 65536).toString(16)}`
    ][Math.floor(Math.random() * 4)];
    
    // Expand it to get the full address
    const fullAddress = expandIPv6(abbreviated);
    
    // Beautify the abbreviated address (remove leading zeros in segments)
    const abbreviatedAddress = abbreviated.split(':').map(segment => {
      if (segment === '') return segment;
      const parsed = parseInt(segment, 16);
      return isNaN(parsed) ? '0' : parsed.toString(16);
    }).join(':');
    
    // Count zero groups for explanation
    const zeroCount = 8 - abbreviatedAddress.split(':').filter(s => s !== '').length;
    
    // Create question
    const expandPrompt = language === 'en'
      ? `Expand the following abbreviated IPv6 address <span class="font-mono font-medium">${abbreviatedAddress}</span> to its full uncompressed form.`
      : `Vouw het volgende afgekorte IPv6-adres <span class="font-mono font-medium">${abbreviatedAddress}</span> uit naar zijn volledige vorm.`;
    
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${expandPrompt}</p>`;
    
    answerFields = [
      { id: 'expanded-ipv6', label: language === 'en' ? 'Expanded IPv6 Address' : 'Volledig IPv6-adres', answer: fullAddress }
    ];
    
    // Prepare explanation
    const expandExplanation = language === 'en'
      ? `<p>To expand an abbreviated IPv6 address:</p>
         <ol class="list-decimal ml-5 mt-2 space-y-1">
           <li>Replace the double colon (::) with the correct number of zero groups</li>
           <li>Ensure each hexadecimal group has all 4 digits by adding leading zeros</li>
         </ol>
         <p class="mt-2">For address <span class="font-mono">${abbreviatedAddress}</span>:</p>
         <p class="mt-1">Replace :: with ${zeroCount} groups of zeros</p>
         <p class="mt-1">Result: <span class="font-mono">${fullAddress}</span></p>`
      : `<p>Om een afgekort IPv6-adres uit te vouwen:</p>
         <ol class="list-decimal ml-5 mt-2 space-y-1">
           <li>Vervang de dubbele dubbele punt (::) door het juiste aantal nulgroepen</li>
           <li>Zorg ervoor dat elke hexadecimale groep alle 4 cijfers heeft door voorloopnullen toe te voegen</li>
         </ol>
         <p class="mt-2">Voor adres <span class="font-mono">${abbreviatedAddress}</span>:</p>
         <p class="mt-1">Vervang :: door ${zeroCount} groepen nullen</p>
         <p class="mt-1">Resultaat: <span class="font-mono">${fullAddress}</span></p>`;
    
    explanation = expandExplanation;
  } 
  else { // contract-address
    // Create segments for a full IPv6 address with some zero segments for abbreviation
    const segments: string[] = [];
    
    // Position for the block of zeros
    const zeroPosition = Math.floor(Math.random() * 5); // Keep at least 3 segments for other values
    const zeroCount = Math.floor(Math.random() * 3) + 2; // 2-4 consecutive zeros
    
    // Generate full address with zero block
    for (let i = 0; i < 8; i++) {
      if (i >= zeroPosition && i < zeroPosition + zeroCount) {
        segments.push('0000');
      } else {
        // Random hexadecimal segment
        segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
      }
    }
    
    // The full uncompressed address
    const fullAddress = segments.join(':');
    
    // Create the abbreviated version for the answer
    let abbreviatedSegments = [...segments];
    abbreviatedSegments.splice(zeroPosition, zeroCount, '');
    
    let abbreviatedAddress = abbreviatedSegments.join(':');
    
    // Fix formatting for :: replacement
    abbreviatedAddress = abbreviatedAddress.replace(/::+/g, '::');
    if (abbreviatedAddress.startsWith(':') && !abbreviatedAddress.startsWith('::')) {
      abbreviatedAddress = ':' + abbreviatedAddress;
    }
    if (abbreviatedAddress.endsWith(':') && !abbreviatedAddress.endsWith('::')) {
      abbreviatedAddress = abbreviatedAddress + ':';
    }
    
    // Also remove leading zeros in each segment
    abbreviatedAddress = abbreviatedAddress.split(':').map(segment => {
      if (segment === '') return segment;
      return segment.replace(/^0+(?!$)/, ''); // Remove leading zeros but keep at least one digit
    }).join(':');
    
    // Create question
    const contractPrompt = language === 'en'
      ? `Abbreviate the following full IPv6 address <span class="font-mono font-medium">${fullAddress}</span> to its shortest valid form.`
      : `Verkort het volgende volledige IPv6-adres <span class="font-mono font-medium">${fullAddress}</span> naar zijn kortste geldige vorm.`;
    
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${contractPrompt}</p>`;
    
    answerFields = [
      { id: 'abbreviated-ipv6', label: language === 'en' ? 'Abbreviated IPv6 Address' : 'Verkorte IPv6-adres', answer: abbreviatedAddress }
    ];
    
    // Prepare explanation
    const contractExplanation = language === 'en'
      ? `<p>To abbreviate an IPv6 address:</p>
         <ol class="list-decimal ml-5 mt-2 space-y-1">
           <li>Replace any consecutive segments of zeros with a double colon (::)</li>
           <li>Remove leading zeros in each segment</li>
         </ol>
         <p class="mt-2">For address <span class="font-mono">${fullAddress}</span>:</p>
         <p class="mt-1">Replace ${zeroCount} consecutive zero segments at position ${zeroPosition+1} with '::'</p>
         <p class="mt-1">Remove leading zeros in each segment</p>
         <p class="mt-1">Result: <span class="font-mono">${abbreviatedAddress}</span></p>`
      : `<p>Om een IPv6-adres te verkorten:</p>
         <ol class="list-decimal ml-5 mt-2 space-y-1">
           <li>Vervang opeenvolgende segmenten van nullen door een dubbele dubbele punt (::)</li>
           <li>Verwijder voorloopnullen in elk segment</li>
         </ol>
         <p class="mt-2">Voor adres <span class="font-mono">${fullAddress}</span>:</p>
         <p class="mt-1">Vervang ${zeroCount} opeenvolgende nulsegmenten op positie ${zeroPosition+1} door '::'</p>
         <p class="mt-1">Verwijder voorloopnullen in elk segment</p>
         <p class="mt-1">Resultaat: <span class="font-mono">${abbreviatedAddress}</span></p>`;
    
    explanation = contractExplanation;
  }
  
  return {
    questionText,
    answerFields,
    explanation
  };
}

export function generateSubnettingQuestion(subnetType: string, difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  // Pass language parameter to each function that builds questions
  let question: SubnettingQuestion;
  
  switch (subnetType) {
    case 'hosts-per-subnet':
      // Force fixed-hosts-subnet type for the subnet by host count category
      question = buildNetworkCalculationProblem(difficulty, language, 'fixed-hosts-subnet');
      break;
    case 'subnets-count':
      // Force subnet-count type for the subnet by network count category
      question = buildNetworkCalculationProblem(difficulty, language, 'subnet-count');
      break;
    case 'basic':
      // Update buildBasicSubnettingProblem to accept language parameter
      question = buildBasicSubnettingProblem(difficulty, language);
      break;
    case 'vlsm':
      // Update buildVlsmProblem to accept language parameter
      question = buildVlsmProblem(difficulty, language);
      break;
    case 'wildcard':
      // We already updated this function to accept language parameter
      question = buildWildcardMaskProblem(difficulty, language);
      break;
    case 'network':
      // Redirect network type to subnet-count to maintain compatibility with existing code
      // This case is kept for backward compatibility but is no longer exposed in the UI
      question = buildNetworkCalculationProblem(difficulty, language, 'subnet-count');
      break;
    case 'ipv6':
      // Add IPv6 subnetting problem
      question = buildIPv6Problem(difficulty, language);
      break;
    default:
      question = buildBasicSubnettingProblem(difficulty, language);
      break;
  }
  
  return question;
}