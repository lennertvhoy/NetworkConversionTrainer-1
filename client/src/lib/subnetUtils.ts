import { Language } from './languageContext';

interface SubnettingQuestion {
  questionText: string;
  answerFields: { id: string; label: string; answer: string }[];
  explanation: string;
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
  
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

// Helper to generate a random network class and prefix
function generateRandomNetworkClass(difficulty: string): {ip: string, prefix: number} {
  let classType: string;
  let ip: string;
  let prefix: number;
  
  if (difficulty === 'easy') {
    // Class C networks are easiest to work with
    classType = 'C';
    const octet1 = Math.floor(Math.random() * 32) + 192; // 192-223
    const octet2 = Math.floor(Math.random() * 256);
    const octet3 = Math.floor(Math.random() * 256);
    ip = `${octet1}.${octet2}.${octet3}.0`;
    prefix = 24;
  } else if (difficulty === 'medium') {
    // Mix of Class B and C
    const rand = Math.random();
    if (rand < 0.6) {
      classType = 'C';
      const octet1 = Math.floor(Math.random() * 32) + 192; // 192-223
      const octet2 = Math.floor(Math.random() * 256);
      const octet3 = Math.floor(Math.random() * 256);
      ip = `${octet1}.${octet2}.${octet3}.0`;
      prefix = 24;
    } else {
      classType = 'B';
      const octet1 = Math.floor(Math.random() * 64) + 128; // 128-191
      const octet2 = Math.floor(Math.random() * 256);
      ip = `${octet1}.${octet2}.0.0`;
      prefix = 16;
    }
  } else {
    // Hard: All classes including custom prefixes
    const rand = Math.random();
    if (rand < 0.4) {
      classType = 'C';
      const octet1 = Math.floor(Math.random() * 32) + 192; // 192-223
      const octet2 = Math.floor(Math.random() * 256);
      const octet3 = Math.floor(Math.random() * 256);
      ip = `${octet1}.${octet2}.${octet3}.0`;
      prefix = 24;
    } else if (rand < 0.7) {
      classType = 'B';
      const octet1 = Math.floor(Math.random() * 64) + 128; // 128-191
      const octet2 = Math.floor(Math.random() * 256);
      ip = `${octet1}.${octet2}.0.0`;
      prefix = 16;
    } else {
      classType = 'A';
      const octet1 = Math.floor(Math.random() * 126) + 1; // 1-126
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
  
  if (difficulty === 'easy') {
    departments = [
      { name: 'Department A', hosts: Math.floor(Math.random() * 20) + 10 },
      { name: 'Department B', hosts: Math.floor(Math.random() * 10) + 5 },
      { name: 'Department C', hosts: Math.floor(Math.random() * 5) + 2 },
    ];
  } else if (difficulty === 'medium') {
    departments = [
      { name: 'Department A', hosts: Math.floor(Math.random() * 50) + 30 },
      { name: 'Department B', hosts: Math.floor(Math.random() * 30) + 15 },
      { name: 'Department C', hosts: Math.floor(Math.random() * 15) + 5 },
      { name: 'Department D', hosts: Math.floor(Math.random() * 5) + 2 },
    ];
  } else { // hard
    departments = [
      { name: 'Department A', hosts: Math.floor(Math.random() * 100) + 50 },
      { name: 'Department B', hosts: Math.floor(Math.random() * 50) + 20 },
      { name: 'Department C', hosts: Math.floor(Math.random() * 20) + 10 },
      { name: 'Department D', hosts: Math.floor(Math.random() * 10) + 5 },
      { name: 'Department E', hosts: Math.floor(Math.random() * 5) + 2 },
    ];
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
  let questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">You are designing a network with the following requirements:</p>
  <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">
  <li>Network address allocated: <span class="font-mono font-medium">${baseNetwork}/${basePrefix}</span></li>`;
  
  departments.forEach(dept => {
    questionText += `<li>${dept.name} needs ${dept.hosts} hosts</li>`;
  });
  
  // Pick a random department to ask about (not the first one for medium/hard)
  const targetDeptIndex = difficulty === 'easy' ? 0 : Math.floor(Math.random() * (departments.length - 1)) + 1;
  const targetDept = departments[targetDeptIndex];
  const targetSubnet = subnets[targetDeptIndex];
  
  questionText += `</ul>
  <p class="text-slate-800 font-medium dark:text-zinc-200">What subnet address and mask would you assign to ${targetDept.name}?</p>`;
  
  const answerFields = [
    {
      id: 'subnet-address',
      label: 'Subnet Network Address',
      answer: targetSubnet.network
    },
    {
      id: 'subnet-mask',
      label: 'Subnet Mask',
      answer: targetSubnet.mask
    }
  ];
  
  // Create detailed explanation
  let explanation = `<p>The subnet <span class="font-mono font-bold">${targetSubnet.network}/${targetSubnet.prefix}</span> (mask <span class="font-mono font-bold">${targetSubnet.mask}</span>) is correct for ${targetDept.name}.</p>
  <p class="mt-2">Working through the VLSM process:</p>
  <ol class="list-decimal ml-5 mt-1 space-y-1">
  <li>Order departments by host count: ${departments.map(d => `${d.name} (${d.hosts})`).join(', ')}</li>`;
  
  subnets.forEach((subnet, index) => {
    explanation += `<li>${subnet.department} needs ${subnet.hosts} hosts, requiring ${32 - subnet.prefix} host bits (2<sup>${32 - subnet.prefix}</sup>-2 = ${calculateUsableHosts(subnet.prefix)} > ${subnet.hosts}), so a /${subnet.prefix} subnet (${subnet.network}/${subnet.prefix})</li>`;
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
  
  // Choose what to ask based on difficulty
  let questionType: string;
  if (difficulty === 'easy') {
    questionType = ['network', 'broadcast', 'hosts'][Math.floor(Math.random() * 3)];
  } else if (difficulty === 'medium') {
    questionType = ['network', 'broadcast', 'first-last', 'prefix'][Math.floor(Math.random() * 4)];
  } else { // hard
    questionType = ['network', 'broadcast', 'first-last', 'prefix', 'mask', 'all'][Math.floor(Math.random() * 6)];
  }
  
  let questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">Given the IP address <span class="font-mono font-medium">${ip}</span> with `;
  
  if (Math.random() > 0.5 || questionType === 'mask') {
    questionText += `subnet mask <span class="font-mono font-medium">${mask}</span>:</p>`;
  } else {
    questionText += `CIDR prefix <span class="font-mono font-medium">/${prefix}</span>:</p>`;
  }
  
  // Add a note about subnet mask formats being accepted
  if (questionType === 'mask' || questionType === 'prefix') {
    questionText += `<p class="text-slate-600 text-sm italic mb-3 dark:text-zinc-400">Note: Both decimal format (e.g., 255.255.255.0) and CIDR notation (e.g., /24) are accepted for subnet masks.</p>`;
  }
  
  let answerFields: { id: string; label: string; answer: string }[] = [];
  
  switch (questionType) {
    case 'network':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">What is the network address?</p>`;
      answerFields = [
        { id: 'network-address', label: 'Network Address', answer: networkAddress }
      ];
      break;
    case 'broadcast':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">What is the broadcast address?</p>`;
      answerFields = [
        { id: 'broadcast-address', label: 'Broadcast Address', answer: broadcastAddress }
      ];
      break;
    case 'hosts':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">How many usable host addresses are available in this subnet?</p>`;
      answerFields = [
        { id: 'usable-hosts', label: 'Usable Hosts', answer: usableHosts.toString() }
      ];
      break;
    case 'first-last':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">What are the first and last usable host addresses in this subnet?</p>`;
      answerFields = [
        { id: 'first-host', label: 'First Usable Host', answer: firstHost },
        { id: 'last-host', label: 'Last Usable Host', answer: lastHost }
      ];
      break;
    case 'prefix':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">What is the CIDR prefix notation for this subnet?</p>`;
      answerFields = [
        { id: 'cidr-prefix', label: 'CIDR Prefix', answer: `/${prefix}` }
      ];
      break;
    case 'mask':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">What is the subnet mask in dotted decimal format?</p>`;
      answerFields = [
        { id: 'subnet-mask', label: 'Subnet Mask', answer: mask }
      ];
      break;
    case 'all':
      questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">Determine the following for this subnet:</p>`;
      answerFields = [
        { id: 'network-address', label: 'Network Address', answer: networkAddress },
        { id: 'broadcast-address', label: 'Broadcast Address', answer: broadcastAddress },
        { id: 'first-host', label: 'First Usable Host', answer: firstHost },
        { id: 'last-host', label: 'Last Usable Host', answer: lastHost }
      ];
      break;
  }
  
  // Create explanation
  let explanation = '';
  
  switch (questionType) {
    case 'network':
      explanation = `<p>To find the network address, perform a bitwise AND operation between the IP address and the subnet mask:</p>
      <p class="mt-2 font-mono">IP: ${ip}<br>Mask: ${mask}<br>Network: ${networkAddress}</p>`;
      break;
    case 'broadcast':
      explanation = `<p>To find the broadcast address, set all host bits to 1:</p>
      <p class="mt-2 font-mono">Network: ${networkAddress}<br>Mask: ${mask}<br>Broadcast: ${broadcastAddress}</p>`;
      break;
    case 'hosts':
      explanation = `<p>To calculate the number of usable hosts:</p>
      <p class="mt-2 font-mono">2<sup>(32 - prefix)</sup> - 2 = 2<sup>${32 - prefix}</sup> - 2 = ${usableHosts}</p>
      <p>We subtract 2 to account for the network and broadcast addresses, which can't be assigned to hosts.</p>`;
      break;
    case 'first-last':
      explanation = `<p>The first usable host is the network address + 1:</p>
      <p class="mt-2 font-mono">Network: ${networkAddress}<br>First Host: ${firstHost}</p>
      <p class="mt-2">The last usable host is the broadcast address - 1:</p>
      <p class="mt-2 font-mono">Broadcast: ${broadcastAddress}<br>Last Host: ${lastHost}</p>`;
      break;
    case 'prefix':
      explanation = `<p>The CIDR prefix counts the number of contiguous 1 bits in the subnet mask:</p>
      <p class="mt-2 font-mono">Mask: ${mask}<br>CIDR: /${prefix}</p>
      <p class="mt-2 text-sm text-slate-600 dark:text-zinc-400"><i>Note: Both CIDR notation (e.g., /24) and decimal format (e.g., 255.255.255.0) are equivalent representations of subnet masks.</i></p>`;
      break;
    case 'mask':
      explanation = `<p>Converting from CIDR prefix to subnet mask:</p>
      <p class="mt-2 font-mono">CIDR: /${prefix}<br>Mask: ${mask}</p>
      <p class="mt-2 text-sm text-slate-600 dark:text-zinc-400"><i>Note: Both CIDR notation (e.g., /24) and decimal format (e.g., 255.255.255.0) are equivalent representations of subnet masks.</i></p>`;
      break;
    case 'all':
      explanation = `<p>Given IP ${ip} with mask ${mask} (/${prefix}):</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li>Network address: ${networkAddress} (bitwise AND of IP and mask)</li>
        <li>Broadcast address: ${broadcastAddress} (network with host bits set to 1)</li>
        <li>First usable host: ${firstHost} (network address + 1)</li>
        <li>Last usable host: ${lastHost} (broadcast address - 1)</li>
        <li>Total usable hosts: ${usableHosts} (2<sup>${32 - prefix}</sup> - 2)</li>
      </ol>`;
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
  const ip = generateRandomIP();
  
  // Choose a prefix based on difficulty
  let prefix: number;
  if (difficulty === 'easy') {
    prefix = [8, 16, 24][Math.floor(Math.random() * 3)];
  } else if (difficulty === 'medium') {
    prefix = [16, 20, 24, 28][Math.floor(Math.random() * 4)];
  } else { // hard
    prefix = Math.floor(Math.random() * 23) + 8; // 8-30
  }
  
  const mask = prefixToSubnetMask(prefix);
  
  // Calculate wildcard mask (inverse of subnet mask)
  const wildcardMask = mask.split('.').map(octet => 255 - parseInt(octet)).join('.');
  
  // Prepare text based on language
  const introText = language === 'en' 
    ? `Access control lists (ACLs) and routing protocols often use wildcard masks, which are the inverse of subnet masks.`
    : `Accesscontrolelijsten (ACLs) en routeringsprotocollen maken vaak gebruik van wildcard maskers, welke het omgekeerde zijn van subnet maskers.`;
    
  const maskText = language === 'en'
    ? `Given the subnet mask <span class="font-mono font-medium">${mask}</span> (/${prefix}):`
    : `Gegeven het subnet masker <span class="font-mono font-medium">${mask}</span> (/${prefix}):`;
  
  // Generate question
  let questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${introText}</p>
  <p class="text-slate-800 mb-3 dark:text-zinc-200">${maskText}</p>`;
  
  let answerFields: { id: string; label: string; answer: string }[] = [];
  
  if (difficulty === 'easy') {
    const whatIsText = language === 'en' ? 'What is the wildcard mask?' : 'Wat is het wildcard masker?';
    questionText += `<p class="text-slate-800 font-medium dark:text-zinc-200">${whatIsText}</p>`;
    
    const labelText = language === 'en' ? 'Wildcard Mask' : 'Wildcard Masker';
    answerFields = [
      { id: 'wildcard-mask', label: labelText, answer: wildcardMask }
    ];
  } else {
    // For medium and hard, ask about ACL application
    const networkAddress = calculateNetworkAddress(ip, mask);
    
    const aclText = language === 'en'
      ? `For a router ACL that should match exactly the network <span class="font-mono font-medium">${networkAddress}/${prefix}</span>:`
      : `Voor een router ACL die exact moet overeenkomen met het netwerk <span class="font-mono font-medium">${networkAddress}/${prefix}</span>:`;
      
    const whatIpText = language === 'en'
      ? 'What IP and wildcard mask should be used in the ACL?'
      : 'Welk IP en wildcard masker moet worden gebruikt in de ACL?';
    
    questionText += `<p class="text-slate-800 mb-3 dark:text-zinc-200">${aclText}</p>
    <p class="text-slate-800 font-medium dark:text-zinc-200">${whatIpText}</p>`;
    
    const ipLabel = language === 'en' ? 'IP Address' : 'IP-Adres';
    const maskLabel = language === 'en' ? 'Wildcard Mask' : 'Wildcard Masker';
    
    answerFields = [
      { id: 'acl-ip', label: ipLabel, answer: networkAddress },
      { id: 'wildcard-mask', label: maskLabel, answer: wildcardMask }
    ];
  }
  
  // Create explanation with text based on language
  const explanationIntro = language === 'en'
    ? 'A wildcard mask is the inverse of a subnet mask. To calculate it, subtract each octet of the subnet mask from 255:'
    : 'Een wildcard masker is het omgekeerde van een subnet masker. Om het te berekenen, trek je elk octet van het subnet masker af van 255:';
    
  const subnetText = language === 'en' ? 'Subnet mask' : 'Subnet masker';
  const wildcardText = language === 'en' ? 'Wildcard mask' : 'Wildcard masker';
  
  const inWildcardText = language === 'en' ? 'In a wildcard mask:' : 'In een wildcard masker:';
  const matchExactly = language === 'en' ? '0 bits mean "match exactly"' : '0 bits betekenen "exacte overeenkomst"';
  const ignoreValue = language === 'en' ? '1 bits mean "ignore" (can be any value)' : '1 bits betekenen "negeren" (kan elke waarde zijn)';
  
  let explanation = `<p>${explanationIntro}</p>
  <p class="mt-2 font-mono">${subnetText}: ${mask}<br>${wildcardText}: ${wildcardMask}</p>
  <p class="mt-2">${inWildcardText}</p>
  <ul class="list-disc ml-5 mt-1 space-y-1">
    <li>${matchExactly}</li>
    <li>${ignoreValue}</li>
  </ul>`;
  
  if (difficulty !== 'easy') {
    // Calculate the network address for the example
    const networkAddr = ip.split('.').map((part, i) => {
      const maskPart = parseInt(mask.split('.')[i]);
      return parseInt(part) & maskPart;
    }).join('.');
    
    const forAclsText = language === 'en' 
      ? 'For ACLs, you typically use the network address with the wildcard mask:'
      : 'Voor ACLs gebruik je meestal het netwerkadres met het wildcard masker:';
      
    const matchText = language === 'en'
      ? `This would match all addresses in the ${networkAddr}/${prefix} network.`
      : `Dit zou overeenkomen met alle adressen in het ${networkAddr}/${prefix} netwerk.`;
      
    explanation += `<p class="mt-2">${forAclsText}</p>
    <p class="mt-2 font-mono">permit ip ${answerFields[0].answer} ${answerFields[1].answer} any</p>
    <p>${matchText}</p>`;
  }
  
  return {
    questionText,
    answerFields,
    explanation
  };
}

// Build a network calculation problem
function buildNetworkCalculationProblem(difficulty: string, language: Language = 'nl'): SubnettingQuestion {
  // Choose the type of calculation problem
  const problemType = difficulty === 'easy' 
    ? 'required-prefix'
    : ['required-prefix', 'subnetting', 'supernetting'][Math.floor(Math.random() * 3)];
  
  let questionText = '';
  let answerFields: { id: string; label: string; answer: string }[] = [];
  let explanation = '';
  
  if (problemType === 'required-prefix') {
    // Ask for the required prefix to support a number of hosts or subnets
    const isHostQuestion = Math.random() > 0.5;
    
    let requiredNumber: number;
    if (difficulty === 'easy') {
      requiredNumber = Math.pow(2, Math.floor(Math.random() * 4) + 2) - 1; // 3 to 63
    } else if (difficulty === 'medium') {
      requiredNumber = Math.pow(2, Math.floor(Math.random() * 6) + 4) - 1; // 15 to 1023
    } else { // hard
      // Use non-power-of-2 numbers for hard difficulty
      requiredNumber = Math.floor(Math.random() * 2000) + 50;
    }
    
    if (isHostQuestion) {
      const designText = language === 'en' 
      ? `You need to design a subnet that can support <span class="font-medium">${requiredNumber}</span> hosts.`
      : `Je moet een subnet ontwerpen dat ondersteuning biedt voor <span class="font-medium">${requiredNumber}</span> hosts.`;
      
    const prefixQuestion = language === 'en'
      ? `What is the minimum subnet prefix length (CIDR notation) required?`
      : `Wat is de minimale subnet prefix lengte (CIDR notatie) benodigd?`;
      
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${designText}</p>
      <p class="text-slate-800 font-medium dark:text-zinc-200">${prefixQuestion}</p>`;
      
      // Calculate required host bits
      let hostBits = 0;
      while (Math.pow(2, hostBits) - 2 < requiredNumber) {
        hostBits++;
      }
      
      const requiredPrefix = 32 - hostBits;
      
      answerFields = [
        { id: 'required-prefix', label: 'Required Prefix Length', answer: `/${requiredPrefix}` }
      ];
      
      const hostExplanation = language === 'en'
        ? `<p>To find the required prefix length for ${requiredNumber} hosts:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Calculate how many host bits you need using the formula: 2<sup>host bits</sup> - 2 ≥ ${requiredNumber}</li>
          <li>We need at least ${hostBits} host bits because 2<sup>${hostBits}</sup> - 2 = ${Math.pow(2, hostBits) - 2} ≥ ${requiredNumber}</li>
          <li>The prefix length is 32 - (host bits) = 32 - ${hostBits} = /${requiredPrefix}</li>
        </ol>
        <p class="mt-2">A /${requiredPrefix} subnet has ${Math.pow(2, hostBits) - 2} usable host addresses.</p>`
        : `<p>Om de vereiste prefix lengte te vinden voor ${requiredNumber} hosts:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Bereken hoeveel host-bits je nodig hebt met de formule: 2<sup>host bits</sup> - 2 ≥ ${requiredNumber}</li>
          <li>We hebben minstens ${hostBits} host-bits nodig omdat 2<sup>${hostBits}</sup> - 2 = ${Math.pow(2, hostBits) - 2} ≥ ${requiredNumber}</li>
          <li>De prefix lengte is 32 - (host bits) = 32 - ${hostBits} = /${requiredPrefix}</li>
        </ol>
        <p class="mt-2">Een /${requiredPrefix} subnet heeft ${Math.pow(2, hostBits) - 2} bruikbare host-adressen.</p>`;
      
      explanation = hostExplanation;
      
    } else {
      // Ask for required prefix to support a number of subnets
      const baseNetwork = generateRandomNetworkClass(difficulty);
      const baseMask = prefixToSubnetMask(baseNetwork.prefix);
      
      const allocatedText = language === 'en'
        ? `You have been allocated the network <span class="font-mono font-medium">${baseNetwork.ip}/${baseNetwork.prefix}</span> and need to create <span class="font-medium">${requiredNumber}</span> equal-sized subnets.`
        : `Je hebt toegewezen gekregen het netwerk <span class="font-mono font-medium">${baseNetwork.ip}/${baseNetwork.prefix}</span> en moet <span class="font-medium">${requiredNumber}</span> subnetten van gelijke grootte maken.`;
        
      const maskQuestion = language === 'en'
        ? `What subnet mask should you use for each subnet?`
        : `Welk subnet masker moet je gebruiken voor elk subnet?`;
      
      questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${allocatedText}</p>
      <p class="text-slate-800 font-medium dark:text-zinc-200">${maskQuestion}</p>`;
      
      // Calculate required subnet bits
      let subnetBits = 0;
      while (Math.pow(2, subnetBits) < requiredNumber) {
        subnetBits++;
      }
      
      const newPrefix = baseNetwork.prefix + subnetBits;
      const newMask = prefixToSubnetMask(newPrefix);
      
      answerFields = [
        { id: 'subnet-mask', label: 'Subnet Mask', answer: newMask }
      ];
      
      const subnetExplanation = language === 'en'
        ? `<p>To find the subnet mask for ${requiredNumber} equal-sized subnets from a /${baseNetwork.prefix} network:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Calculate how many subnet bits you need using the formula: 2<sup>subnet bits</sup> ≥ ${requiredNumber}</li>
          <li>We need at least ${subnetBits} subnet bits because 2<sup>${subnetBits}</sup> = ${Math.pow(2, subnetBits)} ≥ ${requiredNumber}</li>
          <li>The new prefix length is ${baseNetwork.prefix} + ${subnetBits} = /${newPrefix}</li>
          <li>The subnet mask for a /${newPrefix} prefix is ${newMask}</li>
        </ol>
        <p class="mt-2">This creates ${Math.pow(2, subnetBits)} subnets, each with ${Math.pow(2, 32 - newPrefix) - 2} usable hosts.</p>`
        : `<p>Om het subnet masker te vinden voor ${requiredNumber} subnetten van gelijke grootte vanuit een /${baseNetwork.prefix} netwerk:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Bereken hoeveel subnet-bits je nodig hebt met de formule: 2<sup>subnet bits</sup> ≥ ${requiredNumber}</li>
          <li>We hebben minstens ${subnetBits} subnet-bits nodig omdat 2<sup>${subnetBits}</sup> = ${Math.pow(2, subnetBits)} ≥ ${requiredNumber}</li>
          <li>De nieuwe prefix lengte is ${baseNetwork.prefix} + ${subnetBits} = /${newPrefix}</li>
          <li>Het subnet masker voor een /${newPrefix} prefix is ${newMask}</li>
        </ol>
        <p class="mt-2">Dit creëert ${Math.pow(2, subnetBits)} subnetten, elk met ${Math.pow(2, 32 - newPrefix) - 2} bruikbare hosts.</p>`;
        
      explanation = subnetExplanation;
    }
  } else if (problemType === 'subnetting') {
    // Create a problem to divide a network into subnets
    const baseNetwork = generateRandomNetworkClass(difficulty);
    
    let subnets: number[];
    if (difficulty === 'medium') {
      // Equal-sized subnets for medium difficulty
      const numSubnets = Math.pow(2, Math.floor(Math.random() * 3) + 2); // 4, 8, or 16
      subnets = Array(numSubnets).fill(Math.pow(2, 32 - baseNetwork.prefix - Math.log2(numSubnets)) - 2);
    } else { // hard
      // Variably-sized subnets for hard
      subnets = [
        Math.floor(Math.random() * 50) + 50,
        Math.floor(Math.random() * 30) + 20,
        Math.floor(Math.random() * 20) + 10,
        Math.floor(Math.random() * 10) + 5
      ];
    }
    
    const allocatedText = language === 'en'
      ? `You have been allocated the network <span class="font-mono font-medium">${baseNetwork.ip}/${baseNetwork.prefix}</span> and need to create the following subnets:`
      : `Je hebt toegewezen gekregen het netwerk <span class="font-mono font-medium">${baseNetwork.ip}/${baseNetwork.prefix}</span> en moet de volgende subnets maken:`;
    
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${allocatedText}</p>
    <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300">`;
    
    for (let i = 0; i < subnets.length; i++) {
      questionText += `<li>Subnet ${i+1}: ${subnets[i]} hosts</li>`;
    }
    
    // Pick a random subnet to ask about (not the first one for hard)
    const targetSubnetIndex = difficulty === 'medium' ? 0 : Math.floor(Math.random() * (subnets.length - 1)) + 1;
    
    const subnetMaskQuestion = language === 'en'
      ? `What is the subnet mask for Subnet ${targetSubnetIndex+1}?`
      : `Wat is het subnet masker voor Subnet ${targetSubnetIndex+1}?`;
      
    questionText += `</ul>
    <p class="text-slate-800 font-medium dark:text-zinc-200">${subnetMaskQuestion}</p>`;
    
    // Calculate answer
    let hostBits = 0;
    while (Math.pow(2, hostBits) - 2 < subnets[targetSubnetIndex]) {
      hostBits++;
    }
    
    const requiredPrefix = 32 - hostBits;
    const requiredMask = prefixToSubnetMask(requiredPrefix);
    
    answerFields = [
      { id: 'subnet-mask', label: 'Subnet Mask', answer: requiredMask }
    ];
    
    // For equally sized subnets
    if (difficulty === 'medium') {
      const mediumExplanation = language === 'en'
        ? `<p>When dividing a network into ${subnets.length} equal-sized subnets:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Add ${Math.log2(subnets.length)} bits to the original prefix: ${baseNetwork.prefix} + ${Math.log2(subnets.length)} = /${requiredPrefix}</li>
          <li>The subnet mask for a /${requiredPrefix} prefix is ${requiredMask}</li>
        </ol>
        <p class="mt-2">Each subnet will have ${Math.pow(2, 32 - requiredPrefix) - 2} usable hosts.</p>`
        : `<p>Bij het verdelen van een netwerk in ${subnets.length} subnetten van gelijke grootte:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Voeg ${Math.log2(subnets.length)} bits toe aan de originele prefix: ${baseNetwork.prefix} + ${Math.log2(subnets.length)} = /${requiredPrefix}</li>
          <li>Het subnet masker voor een /${requiredPrefix} prefix is ${requiredMask}</li>
        </ol>
        <p class="mt-2">Elk subnet zal ${Math.pow(2, 32 - requiredPrefix) - 2} bruikbare hosts hebben.</p>`;
        
      explanation = mediumExplanation;
    } else { // For variably sized subnets (VLSM)
      const vlsmExplanation = language === 'en'
        ? `<p>For Subnet ${targetSubnetIndex+1} which needs ${subnets[targetSubnetIndex]} hosts:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Calculate required host bits: 2<sup>host bits</sup> - 2 ≥ ${subnets[targetSubnetIndex]}</li>
          <li>We need ${hostBits} host bits (2<sup>${hostBits}</sup> - 2 = ${Math.pow(2, hostBits) - 2} hosts)</li>
          <li>The prefix length is 32 - ${hostBits} = /${requiredPrefix}</li>
          <li>The subnet mask is ${requiredMask}</li>
        </ol>
        <p class="mt-2">This allows for ${Math.pow(2, hostBits) - 2} usable hosts in Subnet ${targetSubnetIndex+1}.</p>`
        : `<p>Voor Subnet ${targetSubnetIndex+1} dat ${subnets[targetSubnetIndex]} hosts nodig heeft:</p>
        <ol class="list-decimal ml-5 mt-2 space-y-1">
          <li>Bereken benodigde host-bits: 2<sup>host bits</sup> - 2 ≥ ${subnets[targetSubnetIndex]}</li>
          <li>We hebben ${hostBits} host-bits nodig (2<sup>${hostBits}</sup> - 2 = ${Math.pow(2, hostBits) - 2} hosts)</li>
          <li>De prefix lengte is 32 - ${hostBits} = /${requiredPrefix}</li>
          <li>Het subnet masker is ${requiredMask}</li>
        </ol>
        <p class="mt-2">Dit biedt ruimte voor ${Math.pow(2, hostBits) - 2} bruikbare hosts in Subnet ${targetSubnetIndex+1}.</p>`;
        
      explanation = vlsmExplanation;
    }
  } else if (problemType === 'supernetting') {
    // Supernetting/route summarization problem (hard only)
    const baseOctet1 = Math.floor(Math.random() * 192) + 1; // Avoid reserved ranges
    const baseOctet2 = Math.floor(Math.random() * 256);
    
    // Create a series of contiguous networks
    const networkBase = `${baseOctet1}.${baseOctet2}`;
    const startThirdOctet = Math.floor(Math.random() * 250); // Leave room for multiple subnets
    
    // Number of networks to summarize (power of 2 for easy summarization)
    const networkCount = Math.pow(2, Math.floor(Math.random() * 3) + 2); // 4, 8, or 16
    
    const networks: string[] = [];
    for (let i = 0; i < networkCount; i++) {
      networks.push(`${networkBase}.${startThirdOctet + i}.0/24`);
    }
    
    const summaryText = language === 'en'
      ? `You need to create a summary route for the following networks:`
      : `Je moet een samenvattingsroute maken voor de volgende netwerken:`;
    
    questionText = `<p class="text-slate-800 mb-3 dark:text-zinc-200">${summaryText}</p>
    <ul class="list-disc pl-5 space-y-1 text-slate-700 mb-3 font-mono dark:text-zinc-300">`;
    
    for (const network of networks) {
      questionText += `<li>${network}</li>`;
    }
    
    const summaryQuestion = language === 'en'
      ? `What is the most efficient summary route (network and mask)?`
      : `Wat is de meest efficiënte samenvattingsroute (netwerk en masker)?`;
    
    questionText += `</ul>
    <p class="text-slate-800 font-medium dark:text-zinc-200">${summaryQuestion}</p>`;
    
    // Calculate the summary route
    // Find common bits
    let commonBits = 24 - Math.log2(networkCount);
    let summaryPrefix = Math.floor(commonBits);
    
    // Create the summary network
    const summaryNetwork = `${networkBase}.${startThirdOctet & (256 - networkCount)}.0`;
    const summaryMask = prefixToSubnetMask(summaryPrefix);
    
    answerFields = [
      { id: 'summary-network', label: 'Summary Network', answer: summaryNetwork },
      { id: 'summary-mask', label: 'Summary Mask', answer: summaryMask }
    ];
    
    const summaryExplanation = language === 'en'
      ? `<p>To find the most efficient summary route for ${networkCount} consecutive /24 networks:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li>Identify the first network: ${networks[0]}</li>
        <li>Determine how many networks we're summarizing: ${networkCount}</li>
        <li>Calculate how many bits are needed to represent ${networkCount} networks: log₂(${networkCount}) = ${Math.log2(networkCount)} bits</li>
        <li>Subtract from the original prefix: 24 - ${Math.log2(networkCount)} = ${summaryPrefix}</li>
        <li>The summary network is: ${summaryNetwork}/${summaryPrefix}</li>
        <li>The subnet mask for /${summaryPrefix} is ${summaryMask}</li>
      </ol>
      <p class="mt-2">This summary route encompasses all ${networkCount} networks efficiently.</p>`
      : `<p>Om de meest efficiënte samenvattingsroute te vinden voor ${networkCount} opeenvolgende /24 netwerken:</p>
      <ol class="list-decimal ml-5 mt-2 space-y-1">
        <li>Identificeer het eerste netwerk: ${networks[0]}</li>
        <li>Bepaal hoeveel netwerken we samenvatten: ${networkCount}</li>
        <li>Bereken hoeveel bits er nodig zijn om ${networkCount} netwerken weer te geven: log₂(${networkCount}) = ${Math.log2(networkCount)} bits</li>
        <li>Trek af van de originele prefix: 24 - ${Math.log2(networkCount)} = ${summaryPrefix}</li>
        <li>Het samenvattingsnetwerk is: ${summaryNetwork}/${summaryPrefix}</li>
        <li>Het subnet masker voor /${summaryPrefix} is ${summaryMask}</li>
      </ol>
      <p class="mt-2">Deze samenvattingsroute omvat alle ${networkCount} netwerken op efficiënte wijze.</p>`;
      
    explanation = summaryExplanation;
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
      // Update buildNetworkCalculationProblem to accept language parameter
      question = buildNetworkCalculationProblem(difficulty, language);
      break;
    default:
      question = buildBasicSubnettingProblem(difficulty, language);
      break;
  }
  
  // Replace common text patterns based on language
  if (language === 'en') {
    // More comprehensive word and phrase replacements for questionText
    question.questionText = question.questionText
      // Translate section headers and structural elements
      .replace(/class="text-slate-800 mb-3 dark:text-zinc-200"/g, 'class="text-slate-800 mb-3 dark:text-zinc-200"')
      .replace(/class="text-slate-800 font-medium dark:text-zinc-200"/g, 'class="text-slate-800 font-medium dark:text-zinc-200"')
      .replace(/class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300"/g, 'class="list-disc pl-5 space-y-1 text-slate-700 mb-3 dark:text-zinc-300"')
      
      // Common phrases in questions
      .replace(/Accesscontrolelijsten \(ACLs\)/g, "Access control lists (ACLs)")
      .replace(/routeringsprotocollen/g, "routing protocols")
      .replace(/maken vaak gebruik van/g, "often use")
      .replace(/wildcard maskers/g, "wildcard masks")
      .replace(/welke het omgekeerde zijn van/g, "which are the inverse of")
      .replace(/subnet maskers/g, "subnet masks")
      .replace(/Gegeven het subnet masker/g, "Given the subnet mask")
      .replace(/Gegeven/g, "Given")
      .replace(/Bereken/g, "Calculate")
      .replace(/de volgende informatie/g, "the following information")
      .replace(/Voor een router ACL/g, "For a router ACL")
      .replace(/die exact moet overeenkomen met/g, "that should match exactly")
      .replace(/het netwerk/g, "the network")
      .replace(/Welk IP en wildcard masker/g, "What IP and wildcard mask")
      .replace(/moet worden gebruikt/g, "should be used")
      .replace(/in de ACL/g, "in the ACL")
      .replace(/Je hebt/g, "You have")
      .replace(/toegewezen gekregen/g, "been allocated")
      .replace(/en moet/g, "and need to")
      .replace(/maken/g, "create")
      .replace(/de volgende subnets/g, "the following subnets")
      .replace(/Subnet \d+: (\d+) hosts/g, "Subnet $1: $2 hosts")
      .replace(/Wat is het subnet masker/g, "What is the subnet mask")
      .replace(/voor Subnet/g, "for Subnet")
      .replace(/Je moet een subnet ontwerpen/g, "You need to design a subnet")
      .replace(/dat ondersteuning biedt voor/g, "that can support")
      .replace(/hosts/g, "hosts")
      .replace(/Wat is de minimale subnet prefix lengte/g, "What is the minimum subnet prefix length")
      .replace(/\(CIDR notatie\) benodigd/g, "(CIDR notation) required")
      .replace(/Je moet een samenvattingsroute maken/g, "You need to create a summary route")
      .replace(/voor de volgende netwerken/g, "for the following networks")
      .replace(/Wat is de meest efficiënte samenvattingsroute/g, "What is the most efficient summary route")
      .replace(/\(netwerk en masker\)/g, "(network and mask)")
      .replace(/subnetten/g, "subnets")
      .replace(/van gelijke grootte/g, "of equal size")
      .replace(/Welk subnet masker/g, "What subnet mask")
      .replace(/gebruik je/g, "should you use")
      .replace(/voor elk subnet/g, "for each subnet")
      
      // Common network terms
      .replace(/netwerk/g, "network")
      .replace(/host bereik/g, "host range")
      .replace(/adress/g, "address")
      .replace(/masker/g, "mask")
      .replace(/welke/g, "which")
      .replace(/nodig/g, "needed")
      .replace(/Wat is/g, "What is")
      .replace(/gelijke/g, "equal")
      .replace(/gebruiken/g, "use")
      .replace(/voor elk/g, "for each")
      .replace(/voor/g, "for")
      .replace(/volgende/g, "following")
      .replace(/moeten maken/g, "need to create")
      .replace(/om te maken/g, "to create")
      .replace(/moet je/g, "you need to")
      .replace(/subnet prefix lengte/g, "subnet prefix length")
      .replace(/het meest efficiënte/g, "the most efficient")
      .replace(/maak een samenvatting/g, "create a summary");
      
    // Comprehensive replacements for the explanation
    question.explanation = question.explanation
      // HTML formatting elements
      .replace(/<p>/g, '<p>')
      .replace(/<\/p>/g, '</p>')
      .replace(/<br\/>/g, '<br/>')
      .replace(/<ol class="list-decimal ml-5 mt-2 space-y-1">/g, '<ol class="list-decimal ml-5 mt-2 space-y-1">')
      .replace(/<ul class="list-disc ml-5 mt-1 space-y-1">/g, '<ul class="list-disc ml-5 mt-1 space-y-1">')
      
      // Common explanation phrases
      .replace(/Een wildcard masker is het omgekeerde van een subnet masker/g, "A wildcard mask is the inverse of a subnet mask")
      .replace(/Om het te berekenen/g, "To calculate it")
      .replace(/trek je elk octet van het subnet masker af van 255/g, "subtract each octet of the subnet mask from 255")
      .replace(/Subnet masker/g, "Subnet mask")
      .replace(/Wildcard masker/g, "Wildcard mask")
      .replace(/In een wildcard masker/g, "In a wildcard mask")
      .replace(/0 bits betekenen "exacte overeenkomst"/g, "0 bits mean \"match exactly\"")
      .replace(/1 bits betekenen "negeren"/g, "1 bits mean \"ignore\"")
      .replace(/\(kan elke waarde zijn\)/g, "(can be any value)")
      .replace(/Voor ACLs/g, "For ACLs")
      .replace(/gebruik je meestal/g, "you typically use")
      .replace(/het netwerkadres met het wildcard masker/g, "the network address with the wildcard mask")
      .replace(/Dit zou overeenkomen met alle adressen in het/g, "This would match all addresses in the")
      .replace(/netwerk/g, "network")
      
      // Common subnet calculation terms
      .replace(/Het netwerkadres is/g, "The network address is")
      .replace(/Het broadcastadres is/g, "The broadcast address is")
      .replace(/De eerste bruikbare host is/g, "The first usable host is")
      .replace(/De laatste bruikbare host is/g, "The last usable host is")
      .replace(/Het aantal bruikbare hosts is/g, "The number of usable hosts is")
      .replace(/Om het netwerkadres te vinden/g, "To find the network address")
      .replace(/voer je een bitwise AND-bewerking uit/g, "perform a bitwise AND operation")
      .replace(/tussen het IP-adres en het subnet masker/g, "between the IP address and the subnet mask")
      .replace(/Het broadcastadres is het netwerkadres met alle hostbits op 1 gezet/g, "The broadcast address is the network address with all host bits set to 1")
      .replace(/De eerste host is het netwerkadres plus 1/g, "The first host is the network address plus 1")
      .replace(/De laatste host is het broadcastadres min 1/g, "The last host is the broadcast address minus 1")
      .replace(/Het aantal bruikbare hosts is 2 tot de macht van het aantal hostbits, min 2/g, "The number of usable hosts is 2 to the power of the number of host bits, minus 2")
      
      // More explanation text translations
      .replace(/Voor/g, "For")
      .replace(/berekeneningen/g, "calculations")
      .replace(/Om de/g, "To find the")
      .replace(/te vinden/g, "")
      .replace(/nodig hebt/g, "you need")
      .replace(/Bereken/g, "Calculate") 
      .replace(/bereik/g, "range")
      .replace(/adres/g, "address")
      .replace(/Dit geeft/g, "This gives")
      .replace(/bruikbare hosts/g, "usable hosts")
      .replace(/Het broadcast/g, "The broadcast")
      .replace(/Het netwerk/g, "The network")
      .replace(/gebruik de formule/g, "use the formula") 
      .replace(/We hebben/g, "We need")
      .replace(/De nieuwe/g, "The new")
      .replace(/Het subnet/g, "The subnet")
      .replace(/Dit maakt/g, "This creates")
      .replace(/elk met/g, "each with")
      .replace(/elke subnet/g, "each subnet")
      .replace(/Deze samenvattingsroute/g, "This summary route");
      
    // Update label texts
    for (let i = 0; i < question.answerFields.length; i++) {
      const field = question.answerFields[i];
      
      // Complete translation of common field labels
      field.label = field.label
        .replace(/Netwerkadres/g, "Network Address")
        .replace(/Broadcastadres/g, "Broadcast Address")
        .replace(/Eerste Host/g, "First Host")
        .replace(/Laatste Host/g, "Last Host")
        .replace(/Subnet Masker/g, "Subnet Mask")
        .replace(/Aantal Hosts/g, "Number of Hosts")
        .replace(/Wildcard Masker/g, "Wildcard Mask")
        .replace(/Samenvattingsnetwerk/g, "Summary Network")
        .replace(/Samenvattingsmasker/g, "Summary Mask")
        .replace(/Vereiste Prefix/g, "Required Prefix")
        .replace(/Prefix Lengte/g, "Prefix Length");
    }
  }
  
  return question;
}
