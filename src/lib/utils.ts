// ============================================
// Tapresente - Utility Functions
// ============================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// CLASS NAME UTILITY
// ============================================
// Merge Tailwind classes with clsx

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// FORMAT DATE
// ============================================
// Format date for Brazilian locale

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

// ============================================
// FORMAT DATE ONLY
// ============================================

export function formatDateOnly(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(date));
}

// ============================================
// FORMAT TIME ONLY
// ============================================

export function formatTimeOnly(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
  }).format(new Date(date));
}

// ============================================
// FORMAT CURRENCY
// ============================================
// Format cents to Brazilian Real

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// ============================================
// SLUGIFY
// ============================================
// Convert string to URL-safe slug

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

// ============================================
// TRUNCATE
// ============================================
// Truncate text to specified length

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// ============================================
// GET INITIALS
// ============================================
// Get initials from name

export function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// DELAY
// ============================================
// Promise-based delay

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// GENERATE CODE
// ============================================
// Generate a random gift card code

export function generateCode(prefix = 'GIFT'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// ============================================
// VALIDATE CODE FORMAT
// ============================================
// Check if code matches expected format

export function isValidCodeFormat(code: string): boolean {
  // Format: PREFIX-XXXXXXXX (4 chars + hyphen + 8 chars)
  const codeRegex = /^[A-Z]{4}-[A-Z0-9]{8}$/;
  return codeRegex.test(code.toUpperCase());
}

// ============================================
// PARSE ERROR
// ============================================
// Extract error message from various error types

export function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}
