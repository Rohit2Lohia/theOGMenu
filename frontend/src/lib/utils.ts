import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility functions
 */

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in Indian Rupees */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Generate a URL-friendly slug from text */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Generate WhatsApp order link */
export function generateWhatsAppLink(
  phoneNumber: string,
  restaurantName: string,
  items?: Array<{ name: string; quantity: number; price: number }>
): string {
  let message = `Hi! I'd like to place an order from ${restaurantName}.\n\n`;

  if (items && items.length > 0) {
    message += 'Order:\n';
    let total = 0;
    items.forEach((item) => {
      const lineTotal = item.quantity * item.price;
      message += `• ${item.name} x${item.quantity} - ${formatPrice(lineTotal)}\n`;
      total += lineTotal;
    });
    message += `\nTotal: ${formatPrice(total)}`;
  }

  const encodedMessage = encodeURIComponent(message);
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/** Get food type badge class */
export function getFoodTypeClass(foodType: string): string {
  const map: Record<string, string> = {
    veg: 'veg',
    'non-veg': 'non-veg',
    egg: 'egg',
    vegan: 'vegan',
  };
  return map[foodType] || 'veg';
}

/** Debounce function */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
