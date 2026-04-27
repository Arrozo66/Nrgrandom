import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchAllCharacters,
  insertCharacter,
  updateCharacter,
  deleteCharacter,
  supabase,
} from '../lib/supabase';
import { createDefaultCharacter } from '../lib/characterFactory';
import type { CharacterData } from '../types/character';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseCharactersReturn {
  characters: CharacterData[];
  selectedId: string | null;
  selectedCharacter: CharacterData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isConnected: boolean;
  selectCharacter: (id: string | null) => void;
  createCharacter: () => Promise<void>;
  duplicateCharacter: (id: string) => Promise<void>;
  saveCharacter: (character: CharacterData) => Promise<void>;
  removeCharacter: (id: string) => Promise<void>;
  clearError: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCharacters(): UseCharactersReturn {
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Track pending local updates to avoid overwriting them with realtime events
  const pendingIds = useRef<Set<string>>(new Set());

  // ── Initial Load ────────────────────────────────────────────────────────────

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCharacters();
      setCharacters(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load characters';
      setError(msg);
      console.error('[useCharacters] load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // ── Realtime Subscription ───────────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel('characters-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'characters' },
        (payload) => {
          const newCharacter = (payload.new as { id: string; data: CharacterData }).data;
          if (!newCharacter) return;
          // Skip if we initiated this change (already in state)
          if (pendingIds.current.has(newCharacter.id)) return;
          setCharacters((prev) => {
            if (prev.find((c) => c.id === newCharacter.id)) return prev;
            return [...prev, newCharacter];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'characters' },
        (payload) => {
          const updated = (payload.new as { id: string; data: CharacterData }).data;
          if (!updated) return;
          // Skip if we're currently saving this character
          if (pendingIds.current.has(updated.id)) return;
          setCharacters((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'characters' },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          if (!deletedId) return;
          setCharacters((prev) => prev.filter((c) => c.id !== deletedId));
          setSelectedId((prev) => (prev === deletedId ? null : prev));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Selected Character ──────────────────────────────────────────────────────

  const selectedCharacter = characters.find((c) => c.id === selectedId) ?? null;

  const selectCharacter = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  // ── Create ──────────────────────────────────────────────────────────────────

  const createCharacter = useCallback(async () => {
    const newChar = createDefaultCharacter();
    pendingIds.current.add(newChar.id);
    try {
      setSaving(true);
      setError(null);
      // Optimistic update
      setCharacters((prev) => [...prev, newChar]);
      setSelectedId(newChar.id);
      await insertCharacter(newChar);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create character';
      setError(msg);
      // Rollback
      setCharacters((prev) => prev.filter((c) => c.id !== newChar.id));
      setSelectedId(null);
      console.error('[useCharacters] create error:', err);
    } finally {
      setSaving(false);
      pendingIds.current.delete(newChar.id);
    }
  }, []);

  // ── Duplicate ───────────────────────────────────────────────────────────────

  const duplicateCharacter = useCallback(
    async (id: string) => {
      const original = characters.find((c) => c.id === id);
      if (!original) return;

      const now = new Date().toISOString();
      const duplicated: CharacterData = {
        ...original,
        id: uuidv4(),
        name: `${original.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      pendingIds.current.add(duplicated.id);
      try {
        setSaving(true);
        setError(null);
        setCharacters((prev) => [...prev, duplicated]);
        setSelectedId(duplicated.id);
        await insertCharacter(duplicated);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to duplicate character';
        setError(msg);
        setCharacters((prev) => prev.filter((c) => c.id !== duplicated.id));
        console.error('[useCharacters] duplicate error:', err);
      } finally {
        setSaving(false);
        pendingIds.current.delete(duplicated.id);
      }
    },
    [characters]
  );

  // ── Save (Update) ────────────────────────────────────────────────────────────

  const saveCharacter = useCallback(async (character: CharacterData) => {
    const updated: CharacterData = {
      ...character,
      updatedAt: new Date().toISOString(),
    };

    pendingIds.current.add(updated.id);
    try {
      setSaving(true);
      setError(null);
      // Optimistic update
      setCharacters((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      await updateCharacter(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save character';
      setError(msg);
      console.error('[useCharacters] save error:', err);
    } finally {
      setSaving(false);
      pendingIds.current.delete(updated.id);
    }
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────

  const removeCharacter = useCallback(
    async (id: string) => {
      const backup = characters.find((c) => c.id === id);
      pendingIds.current.add(id);
      try {
        setSaving(true);
        setError(null);
        // Optimistic update
        setCharacters((prev) => prev.filter((c) => c.id !== id));
        if (selectedId === id) {
          const remaining = characters.filter((c) => c.id !== id);
          setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        }
        await deleteCharacter(id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete character';
        setError(msg);
        // Rollback
        if (backup) {
          setCharacters((prev) => [...prev, backup]);
        }
        console.error('[useCharacters] delete error:', err);
      } finally {
        setSaving(false);
        pendingIds.current.delete(id);
      }
    },
    [characters, selectedId]
  );

  // ── Clear Error ─────────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  return {
    characters,
    selectedId,
    selectedCharacter,
    loading,
    saving,
    error,
    isConnected,
    selectCharacter,
    createCharacter,
    duplicateCharacter,
    saveCharacter,
    removeCharacter,
    clearError,
  };
}
