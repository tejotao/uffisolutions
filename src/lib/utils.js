import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getInitials(fullName, email) {
  const source = (fullName || '').trim() || (email || '').trim();
  return source ? source.slice(0, 2).toUpperCase() : '?';
}