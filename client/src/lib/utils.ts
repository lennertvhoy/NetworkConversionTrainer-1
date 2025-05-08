import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// IP address validation
export function isValidIPv4(ip: string): boolean {
  const pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!pattern.test(ip)) return false;
  
  return ip.split('.').map(Number).every(octet => octet >= 0 && octet <= 255);
}

// Subnet mask validation
export function isValidSubnetMask(mask: string): boolean {
  // Check CIDR notation
  if (mask.startsWith('/')) {
    const prefix = parseInt(mask.substring(1));
    return prefix >= 0 && prefix <= 32;
  }
  
  // Check dotted decimal notation
  if (!isValidIPv4(mask)) return false;
  
  // Verify it's a valid subnet mask (continuous 1s followed by continuous 0s)
  const binary = mask.split('.').map(octet => 
    parseInt(octet).toString(2).padStart(8, '0')
  ).join('');
  
  return /^1*0*$/.test(binary);
}

// Format time in seconds to minutes and seconds
export function formatTimeSpent(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} sec`;
  } else if (remainingSeconds === 0) {
    return `${minutes} min`;
  } else {
    return `${minutes} min ${remainingSeconds} sec`;
  }
}

// Format correct/total as percentage
export function formatMastery(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
