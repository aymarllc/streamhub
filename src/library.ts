import { useCallback, useState } from 'react'
import { itemKey, type MediaItem } from './media'

const STORAGE_KEY = 'streamhub.recent'
const MAX_RECENT = 24

function load(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MediaItem[]) : []
  } catch {
    return []
  }
}

function save(items: MediaItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage can be unavailable (private mode); recents just won't persist.
  }
}

/** Recently played items across all services, newest first. */
export function useRecent() {
  const [recent, setRecent] = useState<MediaItem[]>(load)

  const add = useCallback((item: MediaItem) => {
    setRecent((prev) => {
      const next = [item, ...prev.filter((i) => itemKey(i) !== itemKey(item))].slice(0, MAX_RECENT)
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((item: MediaItem) => {
    setRecent((prev) => {
      const next = prev.filter((i) => itemKey(i) !== itemKey(item))
      save(next)
      return next
    })
  }, [])

  return { recent, add, remove }
}
