import { createClient } from '@supabase/supabase-js'
import type { CharacterData, CharacterRow } from '../types/character'

// ─── Environment Variables ────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

// ─── Validate ENV ─────────────────────────────────────────────────────────────

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[Supabase] Missing environment variables.\n' +
    'Create a .env file with:\n' +
    'VITE_SUPABASE_URL=...\n' +
    'VITE_SUPABASE_KEY=...'
  )
}

// ─── Supabase Client ──────────────────────────────────────────────────────────

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function fetchAllCharacters(): Promise<CharacterData[]> {
  const { data, error } = await supabase
  .from('characters')
  .select('*')
  .order('created_at', { ascending: true })

  if (error) {
    console.error('[Supabase] fetchAllCharacters error:', error.message)
    throw new Error(error.message)
  }

  return (data as CharacterRow[]).map((row) => row.data)
}

export async function insertCharacter(character: CharacterData): Promise<CharacterData> {
  const { data, error } = await supabase
  .from('characters')
  .insert({
    id: character.id,
    data: character,
  })
  .select()
  .maybesingle()

  if (error) {
    console.error('[Supabase] insertCharacter error:', error.message)
    throw new Error(error.message)
  }

  return (data as CharacterRow).data
}

export async function updateCharacter(character: CharacterData): Promise<CharacterData> {
  const { data, error } = await supabase
  .from('characters')
  .update({ data: character })
  .eq('id', character.id)
  .select()
  .single()

  if (error) {
    console.error('[Supabase] updateCharacter error:', error.message)
    throw new Error(error.message)
  }

  return (data as CharacterRow).data
}

export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase
  .from('characters')
  .delete()
  .eq('id', id)

  if (error) {
    console.error('[Supabase] deleteCharacter error:', error.message)
    throw new Error(error.message)
  }
}
