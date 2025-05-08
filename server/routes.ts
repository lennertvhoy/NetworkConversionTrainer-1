import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { progressSummarySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Binary conversion question generation endpoint
  app.post("/api/binary/generate", async (req, res) => {
    try {
      const { type, difficulty } = req.body;
      
      // Validate parameters
      if (!type || !["bin2dec", "bin2hex", "hex2bin", "dec2bin"].includes(type)) {
        return res.status(400).json({ message: "Invalid conversion type" });
      }

      if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      // Generate question based on type and difficulty
      let question, answer, explanation;

      switch (type) {
        case "bin2dec": {
          // Generate random binary number based on difficulty
          const length = difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 12;
          question = generateRandomBinary(length);
          answer = parseInt(question, 2).toString();
          explanation = generateBinaryToDecimalExplanation(question, answer);
          break;
        }
        case "bin2hex": {
          const length = difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 12;
          question = generateRandomBinary(length);
          answer = parseInt(question, 2).toString(16).toUpperCase();
          explanation = generateBinaryToHexExplanation(question, answer);
          break;
        }
        case "hex2bin": {
          const length = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
          const hexChars = "0123456789ABCDEF";
          question = Array(length).fill(0).map(() => hexChars[Math.floor(Math.random() * 16)]).join("");
          answer = "";
          for (let i = 0; i < question.length; i++) {
            answer += parseInt(question[i], 16).toString(2).padStart(4, "0");
          }
          explanation = generateHexToBinaryExplanation(question, answer);
          break;
        }
        case "dec2bin": {
          // Generate random decimal within range based on difficulty
          const max = difficulty === "easy" ? 15 : difficulty === "medium" ? 255 : 4095;
          const value = Math.floor(Math.random() * max) + 1;
          question = value.toString();
          answer = value.toString(2);
          explanation = generateDecimalToBinaryExplanation(question, answer);
          break;
        }
      }

      res.json({
        question,
        answer,
        explanation
      });
    } catch (error) {
      console.error("Error generating binary question:", error);
      res.status(500).json({ message: "Error generating question" });
    }
  });

  // Subnetting question generation endpoint
  app.post("/api/subnetting/generate", async (req, res) => {
    try {
      const { type, difficulty } = req.body;
      
      // Validate parameters
      if (!type || !["basic", "vlsm", "wildcard", "network"].includes(type)) {
        return res.status(400).json({ message: "Invalid subnet type" });
      }

      if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      // Generate question based on type and difficulty
      const question = generateSubnettingQuestion(type, difficulty);

      res.json(question);
    } catch (error) {
      console.error("Error generating subnetting question:", error);
      res.status(500).json({ message: "Error generating question" });
    }
  });

  // Store practice session results
  app.post("/api/practice-sessions", async (req, res) => {
    try {
      const { topic, subtype, score, totalQuestions, difficulty, timeSpent } = req.body;
      
      // Validate required fields
      if (!topic || !subtype || typeof score !== "number" || 
          typeof totalQuestions !== "number" || !difficulty || 
          typeof timeSpent !== "number") {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Store the practice session
      const session = await storage.createPracticeSession({
        userId: null, // We're not implementing authentication, so userId is null
        topic,
        subtype,
        score,
        totalQuestions,
        difficulty,
        timeSpent
      });

      res.status(201).json(session);
    } catch (error) {
      console.error("Error saving practice session:", error);
      res.status(500).json({ message: "Error saving practice session" });
    }
  });

  // Get user progress summary
  app.get("/api/progress", async (req, res) => {
    try {
      // Get practice sessions from storage
      const sessions = await storage.getAllPracticeSessions();
      
      // Calculate progress metrics
      const binaryTotal = sessions.filter(s => s.topic === "binary").reduce((sum, s) => sum + s.totalQuestions, 0);
      const binaryCorrect = sessions.filter(s => s.topic === "binary").reduce((sum, s) => sum + s.score, 0);
      const binaryMastery = binaryTotal > 0 ? Math.round((binaryCorrect / binaryTotal) * 100) : 0;
      
      const subnettingTotal = sessions.filter(s => s.topic === "subnet" && s.subtype !== "vlsm").reduce((sum, s) => sum + s.totalQuestions, 0);
      const subnettingCorrect = sessions.filter(s => s.topic === "subnet" && s.subtype !== "vlsm").reduce((sum, s) => sum + s.score, 0);
      const subnettingMastery = subnettingTotal > 0 ? Math.round((subnettingCorrect / subnettingTotal) * 100) : 0;
      
      const vlsmTotal = sessions.filter(s => s.topic === "subnet" && s.subtype === "vlsm").reduce((sum, s) => sum + s.totalQuestions, 0);
      const vlsmCorrect = sessions.filter(s => s.topic === "subnet" && s.subtype === "vlsm").reduce((sum, s) => sum + s.score, 0);
      const vlsmMastery = vlsmTotal > 0 ? Math.round((vlsmCorrect / vlsmTotal) * 100) : 0;
      
      // Get recent activity (last 10 sessions)
      const recentActivity = sessions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
      
      const progressSummary: z.infer<typeof progressSummarySchema> = {
        binaryProgress: {
          mastery: binaryMastery,
          correct: binaryCorrect,
          total: binaryTotal > 0 ? binaryTotal : 50, // Default to 50 if no sessions yet
        },
        subnettingProgress: {
          mastery: subnettingMastery,
          correct: subnettingCorrect,
          total: subnettingTotal > 0 ? subnettingTotal : 50,
        },
        vlsmProgress: {
          mastery: vlsmMastery,
          correct: vlsmCorrect,
          total: vlsmTotal > 0 ? vlsmTotal : 50,
        },
        recentActivity
      };
      
      res.json(progressSummary);
    } catch (error) {
      console.error("Error getting progress:", error);
      res.status(500).json({ message: "Error getting progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for binary question generation
function generateRandomBinary(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 2).toString();
  }
  // Ensure we don't start with 0 for most conversions unless it's a single digit
  if (result[0] === '0' && length > 1) {
    result = '1' + result.substring(1);
  }
  return result;
}

function generateBinaryToDecimalExplanation(binary: string, decimal: string): string {
  let explanation = `The binary number <span class="font-mono font-bold">${binary}</span> equals <span class="font-mono font-bold">${decimal}</span> in decimal.<br/><br/>`;
  
  explanation += binary.split('').reverse().map((bit, index) => {
    return bit === '1' ? `1×2<sup>${index}</sup> (${Math.pow(2, index)})` : `0×2<sup>${index}</sup> (0)`;
  }).reverse().join(' + ') + ' = ' + decimal;
  
  return explanation;
}

function generateBinaryToHexExplanation(binary: string, hex: string): string {
  let explanation = `The binary number <span class="font-mono font-bold">${binary}</span> equals <span class="font-mono font-bold">${hex}</span> in hexadecimal.<br/><br/>`;
  
  // Add grouped conversion for explanation
  let groupedBinary = '';
  let paddedBinary = binary.padStart(Math.ceil(binary.length / 4) * 4, '0');
  for (let i = 0; i < paddedBinary.length; i += 4) {
    let group = paddedBinary.slice(i, i + 4);
    let hexValue = parseInt(group, 2).toString(16).toUpperCase();
    groupedBinary += `${group} (${hexValue}) `;
  }
  explanation += `Group the binary into sets of 4 bits (padding with leading zeros if needed):<br/>${groupedBinary}`;
  
  return explanation;
}

function generateHexToBinaryExplanation(hex: string, binary: string): string {
  let explanation = `The hexadecimal number <span class="font-mono font-bold">${hex}</span> equals <span class="font-mono font-bold">${binary}</span> in binary.<br/><br/>`;
  
  explanation += `Convert each hex digit to 4 binary digits:<br/>`;
  
  for (let i = 0; i < hex.length; i++) {
    const digit = hex[i];
    const binaryGroup = parseInt(digit, 16).toString(2).padStart(4, '0');
    explanation += `Hex ${digit} → Binary ${binaryGroup}<br/>`;
  }
  
  return explanation;
}

function generateDecimalToBinaryExplanation(decimal: string, binary: string): string {
  const decimalValue = parseInt(decimal);
  let explanation = `The decimal number <span class="font-mono font-bold">${decimal}</span> equals <span class="font-mono font-bold">${binary}</span> in binary.<br/><br/>`;
  
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
  
  return explanation;
}

// Function to generate a subnetting question - this is a simple implementation
// The client-side has a more detailed implementation that will be used as fallback
function generateSubnettingQuestion(type: string, difficulty: string): any {
  // Basic implementation of subnetting question generation
  // The client has a more comprehensive version for fallback
  
  if (type === "basic") {
    // Generate a basic subnetting question
    const ip = generateRandomIP();
    const prefix = difficulty === "easy" ? 24 : difficulty === "medium" ? 27 : 29;
    const mask = prefixToSubnetMask(prefix);
    
    return {
      questionText: `<p>Given the IP address <span class="font-mono font-medium">${ip}</span> with subnet mask <span class="font-mono font-medium">${mask}</span>:</p><p>What is the network address?</p>`,
      answerFields: [
        { id: "network-address", label: "Network Address", answer: calculateNetworkAddress(ip, mask) }
      ],
      explanation: `<p>To find the network address, perform a bitwise AND operation between the IP address and the subnet mask:</p><p class="mt-2 font-mono">IP: ${ip}<br>Mask: ${mask}<br>Network: ${calculateNetworkAddress(ip, mask)}</p>`
    };
  } else if (type === "vlsm") {
    // Generate a VLSM question
    const baseNetwork = "192.168.10.0";
    const basePrefix = 24;
    
    return {
      questionText: `<p>You are designing a network with the following requirements:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Network address allocated: <span class="font-mono font-medium">${baseNetwork}/${basePrefix}</span></li>
          <li>Department A needs 100 hosts</li>
          <li>Department B needs 40 hosts</li>
          <li>Department C needs 20 hosts</li>
          <li>Department D needs 10 hosts</li>
        </ul>
        <p>What subnet address and mask would you assign to Department B?</p>`,
      answerFields: [
        { id: "subnet-address", label: "Subnet Network Address", answer: "192.168.10.128" },
        { id: "subnet-mask", label: "Subnet Mask", answer: "255.255.255.192" }
      ],
      explanation: `<p>The subnet <span class="font-mono font-bold">192.168.10.128/26</span> is correct for Department B.</p>
        <p class="mt-2">Working through the VLSM process:</p>
        <ol class="list-decimal ml-5 mt-1 space-y-1">
          <li>Order departments by host count: A (100), B (40), C (20), D (10)</li>
          <li>Department A needs 100 hosts, requiring 7 host bits (2<sup>7</sup>-2 = 126 > 100), so a /25 subnet (192.168.10.0/25)</li>
          <li>Department B needs 40 hosts, requiring 6 host bits (2<sup>6</sup>-2 = 62 > 40), so a /26 subnet (192.168.10.128/26)</li>
          <li>Continuing for the other departments: C gets 192.168.10.192/27, D gets 192.168.10.224/28</li>
        </ol>`
    };
  } else {
    // Generate a placeholder for other types
    return {
      questionText: `<p>Subnetting ${type} question with ${difficulty} difficulty.</p>`,
      answerFields: [
        { id: "placeholder", label: "Answer", answer: "answer" }
      ],
      explanation: "<p>Explanation would go here.</p>"
    };
  }
}

// Helper functions for IP calculations
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

function calculateNetworkAddress(ip: string, mask: string): string {
  const ipParts = ip.split('.').map(p => parseInt(p));
  const maskParts = mask.split('.').map(p => parseInt(p));
  
  return ipParts.map((part, i) => part & maskParts[i]).join('.');
}
