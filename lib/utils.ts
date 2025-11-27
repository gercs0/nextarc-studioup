
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Creator, League } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
};

export const parseJwt = (token: string) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Replace non-url compatible chars
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

    const jsonPayload = decodeURIComponent(window.atob(padded).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT', e);
    return null;
  }
};

export const calculateLeague = (creator: Partial<Creator>): League => {
    // Logic for League System
    // All-Star: 50+ jobs, > 4.8 rating (or specific flag)
    // Pro: Verified (manual) or 20+ jobs
    // Varsity: 5+ jobs, > 4.0 rating
    // Rookie: < 5 jobs

    const completed = creator.ratingsCount || 0; // Using ratings count as proxy for completed jobs for now
    const rating = creator.rating || 0;

    if (completed >= 50 && rating >= 4.8) return 'All-Star';
    if (creator.isPro) return 'Pro';
    if (completed >= 5 && rating >= 4.0) return 'Varsity';
    return 'Rookie';
};