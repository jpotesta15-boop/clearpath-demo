// Database helpers to ensure client_id is set on all inserts/updates
import { getClientId } from './config'

/**
 * Ensures client_id is set on data before database operations
 */
export function withClientId<T extends Record<string, any>>(data: T): T & { client_id: string } {
  const clientId = getClientId()
  return {
    ...data,
    client_id: clientId,
  }
}

/**
 * Helper for Supabase inserts - automatically adds client_id
 */
export async function insertWithClientId<T extends Record<string, any>>(
  supabase: any,
  table: string,
  data: T
) {
  const dataWithClientId = withClientId(data)
  return supabase.from(table).insert(dataWithClientId)
}

/**
 * Helper for Supabase updates - ensures client_id filter is applied
 */
export async function updateWithClientId<T extends Record<string, any>>(
  supabase: any,
  table: string,
  data: T,
  filter: Record<string, any>
) {
  const clientId = getClientId()
  return supabase
    .from(table)
    .update(data)
    .match({ ...filter, client_id: clientId })
}

