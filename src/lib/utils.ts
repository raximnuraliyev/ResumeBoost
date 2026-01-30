import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('cv-session-id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('cv-session-id', sessionId)
  }
  return sessionId
}
