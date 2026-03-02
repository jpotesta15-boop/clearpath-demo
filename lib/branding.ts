// Branding utilities for client-specific theming

import { getClientConfig } from './config'

export async function getBrandColors() {
  const config = await getClientConfig()
  return config.brandColors
}

export async function getClientName() {
  const config = await getClientConfig()
  return config.clientName
}

export async function getBusinessName() {
  const config = await getClientConfig()
  return config.businessName
}

export async function getLogo() {
  const config = await getClientConfig()
  return config.logo
}

// Helper to generate Tailwind-compatible color classes
export function getPrimaryColorClass(): string {
  // This will be used with CSS variables in Tailwind config
  return 'text-primary-600'
}

export function getPrimaryBgClass(): string {
  return 'bg-primary-600'
}

