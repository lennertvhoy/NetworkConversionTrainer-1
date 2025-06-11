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

// A more robust approach to calculate subnet addresses
function calculateSubnetAddress(
  baseNetworkOctets: number[], // This is the network ID of the SUPERNET (e.g., 120.62.88.0 for 120.62.90.0/22)
  subnetIndex: number,          // The index of the subnet (0 for first, 1 for second, etc.)
  newSubnetPrefix: number       // The prefix of the NEW subnets (e.g., /27 for 26 hosts)
): number[] {
  // Convert baseNetworkOctets (supernet ID) to a 32-bit integer
  let baseNetworkInteger = (
    (baseNetworkOctets[0] << 24) |
    (baseNetworkOctets[1] << 16) |
    (baseNetworkOctets[2] << 8) |
    baseNetworkOctets[3]
  ) >>> 0; // Use unsigned right shift to handle negative numbers in JavaScript bitwise operations

  // Calculate the block size (number of addresses) of each new subnet
  // This is 2^(32 - newSubnetPrefix)
  const subnetBlockSize = Math.pow(2, (32 - newSubnetPrefix));

  // Calculate the network address for the specific subnetIndex
  let currentSubnetInteger = baseNetworkInteger + (subnetIndex * subnetBlockSize);

  // Convert the 32-bit integer back to octets
  const newIP = [
    (currentSubnetInteger >>> 24) & 0xFF, // Use unsigned right shift here too
    (currentSubnetInteger >>> 16) & 0xFF,
    (currentSubnetInteger >>> 8) & 0xFF,
    currentSubnetInteger & 0xFF
  ];

  // Re-apply the new subnet mask to ensure host bits are correctly zeroed out
  // This provides robustness against potential floating point inaccuracies or edge cases.
  const newSubnetMaskStr = prefixToSubnetMask(newSubnetPrefix);
  const newSubnetMaskParts = newSubnetMaskStr.split('.').map(p => parseInt(p));
  for (let i = 0; i < 4; i++) {
      newIP[i] = newIP[i] & newSubnetMaskParts[i];
  }

  return newIP;
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

  let ipAsBinary = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  let maskAsBinary = (maskParts[0] << 24) | (maskParts[1] << 16) | (maskParts[2] << 8) | maskParts[3];

  const networkAddressAsBinary = ipAsBinary & maskAsBinary;

  const newIP = [
    (networkAddressAsBinary >> 24) & 0xFF,
    (networkAddressAsBinary >> 16) & 0xFF,
    (networkAddressAsBinary >> 8) & 0xFF,
    networkAddressAsBinary & 0xFF
  ];
  
  return newIP.join('.');
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
  // Convert baseNetwork to its true network ID based on its basePrefix
  const baseNetworkTrueOctets = calculateNetworkAddress(baseNetwork, prefixToSubnetMask(basePrefix)).split('.').map(Number);

  // Generate department requirements
  let departments: { name: string; hosts: number }[] = [];
  const deptPrefix = language === 'en' ? 'Department' : 'Afdeling';

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
      departments = [
        { name: `${deptPrefix} A`, hosts: Math.floor(Math.random() * 1000) + 500 },
        { name: `${deptPrefix} B`, hosts: Math.floor(Math.random() * 500) + 200 },
        { name: `${deptPrefix} C`, hosts: Math.floor(Math.random() * 200) + 100 },
        { name: `${deptPrefix} D`, hosts: Math.floor(Math.random() * 100) + 50 },
        { name: `${deptPrefix} E`, hosts: Math.floor(Math.random() * 50) + 20 },
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

  // Determine the network address for the *first* VLSM subnet based on the baseNetwork and the first department's required prefix
  let firstSubnetHostBits = 0;
  let firstSubnetAvailableHosts = 0;
  while (firstSubnetAvailableHosts < departments[0].hosts + 2) {
    firstSubnetHostBits++;
    firstSubnetAvailableHosts = Math.pow(2, firstSubnetHostBits);
  }
  const firstSubnetPrefix = 32 - firstSubnetHostBits;
  const firstSubnetMask = prefixToSubnetMask(firstSubnetPrefix);

  // The true network address for the first department, aligned to its new subnet mask, but based on the provided baseNetwork IP.
  // This is the crucial change to match the user's expected behavior.
  let currentNetwork = calculateNetworkAddress(baseNetwork, firstSubnetMask).split('.').map(Number);

  for (const dept of departments) {
    let hostBits = 0;
    let availableHosts = 0;

    while (availableHosts < dept.hosts + 2) {
      hostBits++;
      availableHosts = Math.pow(2, hostBits);
    }

    const subnetPrefix = 32 - hostBits; // New prefix for this department's subnet
    const subnetMask = prefixToSubnetMask(subnetPrefix);

    // Use calculateNetworkAddress to get the network address for the current segment
    const networkAddress = calculateNetworkAddress(currentNetwork.join('.'), subnetMask);
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

    // Advance currentNetwork to the start of the next available subnet block
    let currentNetworkInteger = (
      (currentNetwork[0] << 24) |
      (currentNetwork[1] << 16) |
      (currentNetwork[2] << 8) |
      currentNetwork[3]
    ) >>> 0;

    const allocatedSubnetBlockSize = Math.pow(2, (32 - subnetPrefix));

    currentNetworkInteger += allocatedSubnetBlockSize;

    currentNetwork = [
      (currentNetworkInteger >>> 24) & 0xFF,
      (currentNetworkInteger >>> 16) & 0xFF,
      (currentNetworkInteger >>> 8) & 0xFF,
      currentNetworkInteger & 0xFF
    ];

    if (currentNetworkInteger > 0xFFFFFFFF) {
      break;
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
      alternateAnswers: [`${targetSubnet.network}/${targetSubnet.prefix}`]
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
  
  let answerFields: { id: string; label: string; answer: string; alternateAnswers?: string[] }[] = [];
  
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
  let answerFields: { id: string; label: string; answer: string; alternateAnswers?: string[] }[] = [];
  
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
  // This function will be refactored into smaller, dedicated functions.
  // For now, it will act as a dispatcher for backward compatibility during the transition.
  switch (forcedType) {
    case 'subnet-count':
      return generateSubnetCountQuestion(difficulty, language);
    case 'host-count':
      return generateHostCountQuestion(difficulty, language);
    case 'fixed-hosts-subnet':
      return generateFixedHostsSubnetQuestion(difficulty, language);
    case 'vlsm':
      return buildVlsmProblem(difficulty, language); // VLSM is already a separate function
    case 'comprehensive-subnet':
      return generateComprehensiveSubnetQuestion(difficulty, language); // New function
    default:
      // Fallback for types not yet refactored or unknown types
      return buildBasicSubnettingProblem(difficulty, language);
  }
}

// New dedicated function for 'subnet-count' question type
function generateSubnetCountQuestion(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  let baseNetwork = '';
  let basePrefix = 0;
  let targetSubnets = 0;

  // Generate a random IP address for the base network
  if (difficulty === 'easy') {
    const classOptions = [
      { network: '192.168.0.0', prefix: 24 },
      { network: '172.16.0.0', prefix: 16 },
      { network: '10.0.0.0', prefix: 8 }
    ];
    const selected = classOptions[Math.floor(Math.random() * classOptions.length)];
    baseNetwork = selected.network;
    basePrefix = selected.prefix;
    targetSubnets = [4, 8, 16, 32][Math.floor(Math.random() * 4)];
  } else if (difficulty === 'medium') {
    const classOptions = [
      { network: '192.168.10.0', prefix: 24 },
      { network: '172.20.0.0', prefix: 16 },
      { network: '10.50.0.0', prefix: 16 }
    ];
    const selected = classOptions[Math.floor(Math.random() * classOptions.length)];
    baseNetwork = selected.network;
    basePrefix = selected.prefix;
    targetSubnets = [6, 12, 24, 48][Math.floor(Math.random() * 4)];
  } else { // hard
    // Always generate random for hard difficulty, remove hardcoded 215.0.0.0 case
    baseNetwork = generateRandomIP();
    basePrefix = [8, 16, 20, 24][Math.floor(Math.random() * 4)];
    targetSubnets = [5, 10, 15, 25, 50, 100][Math.floor(Math.random() * 6)];
  }

  const requiredSubnetBits = Math.ceil(Math.log2(targetSubnets));
  const newSubnetPrefix = basePrefix + requiredSubnetBits;
  const newSubnetMask = prefixToSubnetMask(newSubnetPrefix);
  const actualSubnetsPossible = Math.pow(2, requiredSubnetBits);
  const hostBitsPerSubnet = 32 - newSubnetPrefix;

  // Calculate the true network address for the first subnet, aligning the base network
  // to the new subnet prefix.
  const alignedBaseNetworkString = calculateNetworkAddress(baseNetwork, newSubnetMask);
  const alignedBaseOctets = alignedBaseNetworkString.split('.').map(octet => parseInt(octet));

  const subnetAddresses: string[] = [];
  for (let i = 0; i < Math.min(4, actualSubnetsPossible); i++) {
    const subnetOctets = calculateSubnetAddress(
      alignedBaseOctets,
      i,
      newSubnetPrefix
    );
    subnetAddresses.push(`${subnetOctets.join('.')}/${newSubnetPrefix}`);
  }

  const questionText = language === 'en'
    ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">Divide ${baseNetwork}/${basePrefix} into ${targetSubnets} subnets.</p>
       <p class="text-slate-700 mb-3 dark:text-zinc-300">Answer the following questions:</p>
       <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">
         <li>How many subnet bits do you borrow?</li>
         <li>How many host bits are available per subnet?</li>
         <li>What is the CIDR prefix for these subnets?</li>
         <li>What is the subnet mask in decimal notation?</li>
         <li>What is Subnet 1 (in CIDR notation)?</li>
         <li>What is Subnet 2 (in CIDR notation)?</li>
         <li>What is Subnet 3 (in CIDR notation)?</li>
         <li>What is Subnet 4 (in CIDR notation)?</li>
       </ul>`
    : `<p class="text-slate-800 mb-3 dark:text-zinc-200">${baseNetwork}/${basePrefix} verdelen in ${targetSubnets} subnetten.</p>
       <p class="text-slate-700 mb-3 dark:text-zinc-300">Beantwoord de volgende vragen:</p>
       <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">
         <li>Hoeveel subnet-bits leen je?</li>
         <li>Hoeveel host-bits zijn er beschikbaar per subnet?</li>
         <li>Wat wordt de CIDR prefix voor deze subnetten?</li>
         <li>Wat is het subnetmask in decimale notatie?</li>
         <li>Wat is Subnet 1 (in CIDR notatie)?</li>
         <li>Wat is Subnet 2 (in CIDR notatie)?</li>
         <li>Wat is Subnet 3 (in CIDR notatie)?</li>
         <li>Wat is Subnet 4 (in CIDR notatie)?</li>
       </ul>`;

  const answerFields = [
    { id: 'subnet-bits-borrowed', label: language === 'en' ? 'Subnet Bits (Borrowed)' : 'Subnet-bits (Geleend)', answer: requiredSubnetBits.toString() },
    { id: 'host-bits', label: language === 'en' ? 'Host Bits (per subnet)' : 'Host-bits (per subnet)', answer: hostBitsPerSubnet.toString() },
    { id: 'subnet-prefix', label: language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix', answer: `/${newSubnetPrefix}`, alternateAnswers: [newSubnetPrefix.toString()] },
    { id: 'subnet-mask', label: language === 'en' ? 'Subnet Mask (decimal)' : 'Subnetmask (decimaal)', answer: newSubnetMask },
    { id: 'subnet-1', label: language === 'en' ? 'Subnet 1 (CIDR)' : 'Eerste Subnet (CIDR)', answer: subnetAddresses[0] || '', alternateAnswers: [subnetAddresses[0]?.split('/')[0] || ''] },
    { id: 'subnet-2', label: language === 'en' ? 'Subnet 2 (CIDR)' : 'Tweede Subnet (CIDR)', answer: subnetAddresses[1] || '', alternateAnswers: [subnetAddresses[1]?.split('/')[0] || ''] },
    { id: 'subnet-3', label: language === 'en' ? 'Subnet 3 (CIDR)' : 'Derde Subnet (CIDR)', answer: subnetAddresses[2] || '', alternateAnswers: [subnetAddresses[2]?.split('/')[0] || ''] },
    { id: 'subnet-4', label: language === 'en' ? 'Subnet 4 (CIDR)' : 'Vierde Subnet (CIDR)', answer: subnetAddresses[3] || '', alternateAnswers: [subnetAddresses[3]?.split('/')[0] || ''] }
  ];

  const subnetList = subnetAddresses.map((subnet, index) => `<li>Subnet ${index + 1}: ${subnet}</li>`).join('');

  const explanation = language === 'en'
    ? `<p>To divide the network ${baseNetwork}/${basePrefix} into ${targetSubnets} subnets:</p>
       <ol class="list-decimal ml-5 mt-2 space-y-1">
         <li><strong>Calculate required subnet bits (borrowed):</strong> To create at least ${targetSubnets} subnets, we must borrow bits from the original host portion. The number of bits needed is determined by:<br>
         ceil(log₂(${targetSubnets})) = <strong>${requiredSubnetBits} bits borrowed</strong></li>
         <li><strong>Calculate new subnet prefix:</strong> Add the borrowed subnet bits to the original prefix:<br>
         ${basePrefix} (original) + ${requiredSubnetBits} (borrowed subnet bits) = <strong>/${newSubnetPrefix}</strong></li>
         <li><strong>Determine subnet mask:</strong> Convert the new prefix to a subnet mask:<br>
         /${newSubnetPrefix} = <strong>${newSubnetMask}</strong></li>
         <li><strong>Calculate available host bits (per subnet):</strong> Total bits (32) minus prefix bits:<br>
         32 - ${newSubnetPrefix} = <strong>${hostBitsPerSubnet} host bits</strong></li>
         <li><strong>Total number of subnets possible:</strong> With ${requiredSubnetBits} borrowed subnet bits:<br>
         2<sup>${requiredSubnetBits}</sup> = <strong>${actualSubnetsPossible} subnets</strong></li>
       </ol>
       <p class="mt-2">With this subnet configuration (/${newSubnetPrefix}), you can create ${actualSubnetsPossible} equal-sized subnets from the original ${baseNetwork}/${basePrefix} network.</p>
       <p class="mt-2">The first few subnet addresses are:</p>
       <ul class="list-disc ml-5 mt-2 space-y-1 font-mono font-bold">
         ${subnetList}
       </ul>`
    : `<p>Om het netwerk ${baseNetwork}/${basePrefix} te verdelen in ${targetSubnets} subnetten:</p>
       <ol class="list-decimal ml-5 mt-2 space-y-1">
         <li><strong>Bereken benodigde subnet-bits (geleend):</strong> We hebben minstens ${targetSubnets} subnetten nodig, dus we hebben genoeg bits nodig om dat aantal netwerken te representeren:<br>
         ceil(log₂(${targetSubnets})) = <strong>${requiredSubnetBits} bits</strong></li>
         <li><strong>Bereken nieuwe subnet-prefix:</strong> Tel de geleende subnet-bits op bij de originele prefix:<br>
         ${basePrefix} (origineel) + ${requiredSubnetBits} (geleende subnet-bits) = <strong>/${newSubnetPrefix}</strong></li>
         <li><strong>Bepaal subnet masker:</strong> Zet de nieuwe prefix om naar een subnet masker:<br>
         /${newSubnetPrefix} = <strong>${newSubnetMask}</strong></li>
         <li><strong>Bereken beschikbare host-bits (per subnet):</strong> Totaal aantal bits (32) min prefix bits:<br>
         32 - ${newSubnetPrefix} = <strong>${hostBitsPerSubnet} host-bits</strong></li>
         <li><strong>Totaal aantal mogelijke subnetten:</strong> Met ${requiredSubnetBits} geleende subnet-bits:<br>
         2<sup>${requiredSubnetBits}</sup> = <strong>${actualSubnetsPossible} subnetten</strong></li>
       </ol>
       <p class="mt-2">Met deze subnet configuratie (/${newSubnetPrefix}) kun je ${actualSubnetsPossible} even grote subnetten maken van het originele ${baseNetwork}/${basePrefix} netwerk.</p>
       <p class="mt-2">De eerste subnet-adressen zijn:</p>
       <ul class="list-disc ml-5 mt-2 space-y-1 font-mono font-bold">
         ${subnetList}
       </ul>`;

  return { questionText, answerFields, explanation };
}

// New dedicated function for 'host-count' question type
function generateHostCountQuestion(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  let subnetPrefix = 0;

  if (difficulty === 'easy') {
    subnetPrefix = [24, 26, 28][Math.floor(Math.random() * 3)];
  } else if (difficulty === 'medium') {
    subnetPrefix = [16, 20, 24, 27, 28, 29][Math.floor(Math.random() * 6)];
  } else { // hard
    subnetPrefix = [8, 12, 16, 20, 24, 26, 28, 29, 30][Math.floor(Math.random() * 9)];
  }

  const hostBits = 32 - subnetPrefix;
  const usableHosts = calculateUsableHosts(subnetPrefix);

  const questionText = language === 'en'
    ? `<p class="text-slate-800 mb-3 dark:text-zinc-200">How many usable host addresses are available in a /${subnetPrefix} subnet?</p>`
    : `<p class="text-slate-800 mb-3 dark:text-zinc-200">Hoeveel bruikbare host-adressen zijn beschikbaar in een /${subnetPrefix} subnet?</p>`;

  const answerFields = [
    { id: 'usable-hosts', label: language === 'en' ? 'Usable Hosts' : 'Bruikbare Hosts', answer: usableHosts.toString() }
  ];

  const explanation = language === 'en'
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
       <p class="mt-2 font-medium">Daarom biedt een /${subnetPrefix} subnet ${usableHosts} adressen die aan apparaten kunnen worden toegeweamend.</p>
       <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Opmerking: In speciale gevallen zoals point-to-point verbindingen met /31 prefixen, kunnen andere regels gelden.</p>`;

  return { questionText, answerFields, explanation };
}

// New dedicated function for 'fixed-hosts-subnet' question type
function generateFixedHostsSubnetQuestion(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  // Generate a base network
  const firstOctet = Math.floor(Math.random() * 223) + 1;
  const secondOctet = Math.floor(Math.random() * 256);
  const thirdOctet = Math.floor(Math.random() * 256);
  const fourthOctet = 0;

  let startPrefix: number;
  if (difficulty === 'medium') {
    startPrefix = [16, 20, 24][Math.floor(Math.random() * 3)];
  } else { // hard
    startPrefix = [16, 18, 20, 22, 24][Math.floor(Math.random() * 5)];
  }

  const hostsPerSubnet = Math.floor(Math.random() * 50) + 5;

  const requiredHostBits = Math.ceil(Math.log2(hostsPerSubnet + 2));
  const newPrefix = 32 - requiredHostBits;
  const subnetMask = prefixToSubnetMask(newPrefix);
  const possibleSubnets = Math.pow(2, newPrefix - startPrefix);

  const baseNetworkIP = `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`;
  const initialBaseNetworkMask = prefixToSubnetMask(startPrefix);
  const initialNetworkAddressString = calculateNetworkAddress(baseNetworkIP, initialBaseNetworkMask);
  const cleanBaseOctets = initialNetworkAddressString.split('.').map(octet => parseInt(octet));

  const subnet1NetworkAddress = calculateNetworkAddress(baseNetworkIP, prefixToSubnetMask(newPrefix));
  const subnet1Octets = subnet1NetworkAddress.split('.').map(Number);
  const subnet1 = subnet1NetworkAddress;

  const subnet2Octets = calculateSubnetAddress(
    subnet1Octets,
    1,
    newPrefix
  );
  const subnet2 = subnet2Octets.join('.');

  let randomSubnetNumber;
  do {
    randomSubnetNumber = Math.floor(Math.random() * 11) + 5;
  } while (randomSubnetNumber === 10);

  const subnetNOctets = calculateSubnetAddress(
    subnet1Octets,
    randomSubnetNumber - 1,
    newPrefix
  );
  const subnetN = subnetNOctets.join('.');

  const hostPhrase = language === 'en' ? `has ${hostsPerSubnet} hosts` : `${hostsPerSubnet} hosts heeft`;
  const fixedHostPrompt = language === 'en'
    ? `${baseNetworkIP}/${startPrefix} divided so that each subnet ${hostPhrase}.<br><br>Answer the following questions:`
    : `${baseNetworkIP}/${startPrefix} verdelen zodat elk subnet ${hostPhrase}.<br><br>Beantwoord de volgende vragen:`;

  const bulletPoints = language === 'en'
    ? `<ul class="list-disc pl-5 space-y-1">
        <li>How many host bits do you need for ${hostsPerSubnet} hosts?</li>
        <li>How many subnet bits do you borrow?</li>
        <li>What is the CIDR prefix that will be used for these subnets?</li>
        <li>What is the subnet mask in decimal notation?</li>
        <li>What is Subnet 1 (in CIDR notation)?</li>
        <li>What is Subnet 2 (in CIDR notation)?</li>
        <li>What is Subnet ${randomSubnetNumber} (in CIDR notation)?</li>
      </ul>`
    : `<ul class="list-disc pl-5 space-y-1">
        <li>Hoeveel host-bits heb je nodig voor ${hostsPerSubnet} hosts?</li>
        <li>Hoeveel subnet-bits leen je?</li>
        <li>Wat wordt de CIDR prefix die gebruikt wordt voor deze subnetten?</li>
        <li>Wat is het subnetmask in decimale notatie?</li>
        <li>Wat is Subnet 1 (in CIDR notatie)?</li>
        <li>Wat is Subnet 2 (in CIDR notatie)?</li>
        <li>Wat is Subnet ${randomSubnetNumber} (in CIDR notatie)?</li>
      </ul>`;

  const questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${fixedHostPrompt}</p>${bulletPoints}`;

  const subnetMaskLabel = language === 'en' ? 'Subnet Mask (decimal)' : 'Subnetmask (decimaal)';
  const hostBitsLabel = language === 'en' ? 'Host Bits' : 'Host-bits';
  const cidrLabel = language === 'en' ? 'CIDR Prefix' : 'CIDR Prefix';
  const subnetBitsBorrowedLabel = language === 'en' ? 'Subnet Bits (Borrowed)' : 'Subnet-bits (Geleend)';
  const subnet1Label = language === 'en' ? 'Subnet 1' : 'Subnet 1';
  const subnet2Label = language === 'en' ? 'Subnet 2' : 'Subnet 2';
  const subnetNLabel = language === 'en' ? `Subnet ${randomSubnetNumber}` : `Subnet ${randomSubnetNumber}`;

  const answerFields = [
    { id: 'host-bits', label: hostBitsLabel, answer: requiredHostBits.toString(), alternateAnswers: [`${requiredHostBits} bits`] },
    { id: 'subnet-bits-borrowed', label: subnetBitsBorrowedLabel, answer: (newPrefix - startPrefix).toString() },
    { id: 'subnet-prefix', label: cidrLabel, answer: `/${newPrefix}`, alternateAnswers: [newPrefix.toString()] },
    { id: 'subnet-mask', label: subnetMaskLabel, answer: subnetMask },
    { id: 'subnet-1', label: subnet1Label, answer: `${subnet1}/${newPrefix}`, alternateAnswers: [subnet1] },
    { id: 'subnet-2', label: subnet2Label, answer: `${subnet2}/${newPrefix}`, alternateAnswers: [subnet2] },
    { id: 'subnet-n', label: subnetNLabel, answer: `${subnetN}/${newPrefix}`, alternateAnswers: [subnetN] }
  ];

  const fixedHostExplanation = language === 'en'
    ? `<h3 class="font-bold mb-2">VLSM Subnet Calculation Step by Step</h3>
      <div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4">
        <p class="font-medium">Task: Divide the ${baseNetworkIP}/${startPrefix} network into subnets where each subnet needs to support ${hostsPerSubnet} hosts.</p>
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
          <strong>Calculate borrowed bits:</strong><br>
          To accommodate ${hostsPerSubnet} hosts per subnet, we determine a new prefix. The number of bits borrowed from the original host portion to achieve this new prefix is:<br>
          ${newPrefix} (new prefix) - ${startPrefix} (original prefix) = <strong>${newPrefix - startPrefix} bits borrowed</strong>
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
          With ${newPrefix - startPrefix} borrowed bits: 2<sup>${newPrefix - startPrefix}</sup> = ${possibleSubnets} subnets
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
        <p class="font-medium">Opdracht: Verdeel het ${baseNetworkIP}/${startPrefix} netwerk in subnetten waarbij elk subnet ${hostsPerSubnet} hosts moet kunnen ondersteunen.</p>
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
          <strong>Bereken geleende subnet-bits:</strong><br>
          Dit is het verschil tussen de nieuwe prefix en de originele prefix:<br>
          ${newPrefix} (nieuwe prefix) - ${startPrefix} (originele prefix) = <strong>${newPrefix - startPrefix} bits geleend</strong>
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
          Met ${newPrefix - startPrefix} geleende bits: 2<sup>${newPrefix - startPrefix}</sup> = ${possibleSubnets} subnetten
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

  return { questionText, answerFields, explanation };
}

// New dedicated function for 'comprehensive-subnet' question type
function generateComprehensiveSubnetQuestion(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  const baseNetwork = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}`; // Start with first two octets
  let prefix: number;
  let explanation = ''; // Declare and initialize explanation here

  if (difficulty === 'medium') {
    prefix = [16, 17, 18, 19, 20][Math.floor(Math.random() * 5)]; // Medium difficulty: /16-/20
  } else { // Hard
    prefix = [16, 17, 18, 19, 20, 21, 22][Math.floor(Math.random() * 7)]; // Hard: /16-/22
  }

  const numSubnets = Math.floor(Math.random() * 40) + 10; // Between 10-50 subnets
  const subnetBits = Math.ceil(Math.log2(numSubnets));
  const newPrefix = prefix + subnetBits;

  const subnetMask = prefixToSubnetMask(newPrefix);
  const hostBits = 32 - newPrefix;
  const usableHosts = calculateUsableHosts(newPrefix);

  // Calculate the true network address for the first subnet, aligning the base network
  // to the new subnet prefix.
  const alignedBaseNetworkString = calculateNetworkAddress(`${baseNetwork}.0.0`, prefixToSubnetMask(prefix)); // Use 'prefix' instead of 'startPrefix'
  const alignedBaseOctets = alignedBaseNetworkString.split('.').map(octet => parseInt(octet));

  const subnet1 = calculateSubnetAddress(alignedBaseOctets, 0, newPrefix).join('.');
  const subnet2 = calculateSubnetAddress(alignedBaseOctets, 1, newPrefix).join('.');
  const subnetN = calculateSubnetAddress(alignedBaseOctets, numSubnets - 1, newPrefix).join('.');


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

  const questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${comprehensivePrompt}</p>${bulletPoints}`;

  const answerFields = [
    { id: 'subnet-bits', label: language === 'en' ? 'Subnet Bits' : 'Subnet-bits', answer: subnetBits.toString() },
    { id: 'new-cidr-prefix', label: language === 'en' ? 'New CIDR Prefix' : 'Nieuwe CIDR Prefix', answer: `/${newPrefix}`, alternateAnswers: [newPrefix.toString()] },
    { id: 'subnet-mask', label: language === 'en' ? 'Subnet Mask (decimal)' : 'Subnetmask (decimaal)', answer: subnetMask },
    { id: 'subnet-1', label: language === 'en' ? 'Subnet 1 (CIDR)' : 'Subnet 1 (CIDR)', answer: `${subnet1}/${newPrefix}`, alternateAnswers: [subnet1] },
    { id: 'subnet-2', label: language === 'en' ? 'Subnet 2 (CIDR)' : 'Subnet 2 (CIDR)', answer: `${subnet2}/${newPrefix}`, alternateAnswers: [subnet2] },
    { id: 'subnet-n', label: language === 'en' ? `Subnet ${numSubnets} (CIDR)` : `Subnet ${numSubnets} (CIDR)`, answer: `${subnetN}/${newPrefix}`, alternateAnswers: [subnetN] }
  ];

  explanation = language === 'en'
    ? `<p>Detailed steps for this subnet calculation:</p>
       <ol class="list-decimal ml-5 mt-2 space-y-1">
         <li>Starting with network ${baseNetwork}.0.0/${prefix}</li>
         <li>Need to create ${numSubnets} subnets, which requires <strong>${subnetBits} subnet bits</strong></li>
         <li>New prefix = ${prefix} (original) + ${subnetBits} (borrowed) = <strong>/${newPrefix}</strong></li>
         <li>Subnet mask for /${newPrefix} is <strong>${subnetMask}</strong></li>
         <li>Host bits = 32 - ${newPrefix} = <strong>${hostBits}</strong></li>
         <li>Each subnet has <strong>${usableHosts} usable host addresses</strong></li>
         <li>First subnet starts at <strong>${subnet1}</strong></li>
         <li>Second subnet starts at <strong>${subnet2}</strong></li>
         <li>Last subnet (${numSubnets}) starts at <strong>${subnetN}</strong></li>
       </ol>`
    : `<p>Gedetailleerde stappen voor deze subnet berekening:</p>
       <ol class="list-decimal ml-5 mt-2 space-y-1">
         <li>Beginnend met netwerk ${baseNetwork}.0.0/${prefix}</li>
         <li>Er zijn ${numSubnets} subnetten nodig, wat <strong>${subnetBits} subnet-bits</strong> vereist</li>
         <li>Nieuwe prefix = ${prefix} (origineel) + ${subnetBits} (geleend) = <strong>/${newPrefix}</strong></li>
         <li>Subnetmasker voor /${newPrefix} is <strong>${subnetMask}</strong></li>
         <li>Host-bits = 32 - ${newPrefix} = <strong>${hostBits}</strong></li>
         <li>Elk subnet heeft <strong>${usableHosts} bruikbare host-adressen</strong></li>
         <li>Eerste subnet begint bij <strong>${subnet1}</strong></li>
         <li>Tweede subnet begint bij <strong>${subnet2}</strong></li>
         <li>Laatste subnet (${numSubnets}) begint bij <strong>${subnetN}</strong></li>
       </ol>`;

  return { questionText, answerFields, explanation };
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
  let answerFields: { id: string; label: string; answer: string; alternateAnswers?: string[] }[] = [];
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
  let question: SubnettingQuestion;

  switch (subnetType) {
    case 'hosts-per-subnet':
      question = generateFixedHostsSubnetQuestion(difficulty, language);
      break;
    case 'subnets-count':
      question = generateSubnetCountQuestion(difficulty, language);
      break;
    case 'basic':
      question = buildBasicSubnettingProblem(difficulty, language);
      break;
    case 'vlsm':
      question = buildVlsmProblem(difficulty, language);
      break;
    case 'wildcard':
      question = buildWildcardMaskProblem(difficulty, language);
      break;
    case 'network':
      // Redirect network type to subnet-count for backward compatibility
      question = generateSubnetCountQuestion(difficulty, language);
      break;
    case 'comprehensive-subnet': // Handle the new comprehensive type
      question = generateComprehensiveSubnetQuestion(difficulty, language);
      break;
    case 'ipv6':
      question = buildIPv6Problem(difficulty, language);
      break;
    default:
      question = buildBasicSubnettingProblem(difficulty, language);
      break;
  }
  return question;
}