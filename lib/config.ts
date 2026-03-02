// Client configuration loader
// Reads client-config.json from the project root

export interface ClientConfig {
  clientName: string
  businessName: string
  brandColors: {
    primary: string
    secondary: string
  }
  logo?: string
  supabaseClientId: string
  features: {
    groupSessions: boolean
    videoLibrary: boolean
  }
}

let cachedConfig: ClientConfig | null = null

export async function getClientConfig(): Promise<ClientConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  // In server components, read from filesystem
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const configPath = path.join(process.cwd(), 'client-config.json')
      const configData = await fs.readFile(configPath, 'utf-8')
      cachedConfig = JSON.parse(configData) as ClientConfig
      return cachedConfig
    } catch (error) {
      // Fallback to environment variables if config file doesn't exist
      return getDefaultConfig()
    }
  }

  // In client components, use environment variables
  return getDefaultConfig()
}

function getDefaultConfig(): ClientConfig {
  return {
    clientName: process.env.NEXT_PUBLIC_CLIENT_NAME || 'ClearPath',
    businessName: process.env.NEXT_PUBLIC_CLIENT_NAME || 'ClearPath',
    brandColors: {
      primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY || '#0284c7',
      secondary: process.env.NEXT_PUBLIC_BRAND_SECONDARY || '#0369a1',
    },
    supabaseClientId: process.env.NEXT_PUBLIC_CLIENT_ID || 'default',
    features: {
      groupSessions: true,
      videoLibrary: true,
    },
  }
}

export function getClientId(): string {
  return process.env.NEXT_PUBLIC_CLIENT_ID || 'default'
}

