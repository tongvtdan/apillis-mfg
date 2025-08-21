import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique RFQ ID in format RFQ-YYMMDD-XX
export function generateRFQId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Generate sequential number (in a real app, this would come from a database)
  const sequentialNumber = Math.floor(Math.random() * 99) + 1; // Random 1-99 for demo
  const formattedNumber = sequentialNumber.toString().padStart(2, '0');
  
  return `RFQ-${year}${month}${day}${formattedNumber}`;
}
