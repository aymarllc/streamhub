/** Something playable from one service, identified the way that service's embed expects. */
export interface MediaItem {
  service: 'youtube' | 'spotify'
  /** youtube: video, playlist; spotify: track, album, playlist, episode, show, artist */
  type: string
  id: string
  title: string
  sourceUrl: string
}

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'episode', 'show', 'artist']

/** Turns a pasted link (or Spotify URI) into a playable item, or null if we can't play it yet. */
export function parseMediaLink(input: string): MediaItem | null {
  const text = input.trim()

  const uri = text.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/)
  if (uri && SPOTIFY_TYPES.includes(uri[1])) {
    return spotify(uri[1], uri[2], text)
  }

  let url: URL
  try {
    url = new URL(text.includes('://') ? text : `https://${text}`)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be' && parts[0]) {
    return youtube('video', parts[0], text)
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v')
    if (v) return youtube('video', v, text)
    const list = url.searchParams.get('list')
    if (list) return youtube('playlist', list, text)
    if (['shorts', 'embed', 'live'].includes(parts[0]) && parts[1]) {
      return youtube('video', parts[1], text)
    }
    return null
  }

  if (host === 'open.spotify.com') {
    // Links may carry a locale prefix such as /intl-de/track/...
    const rest = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts
    const [type, id] = rest[0] === 'embed' ? rest.slice(1) : rest
    if (type && id && SPOTIFY_TYPES.includes(type)) return spotify(type, id, text)
  }

  return null
}

function youtube(type: string, id: string, sourceUrl: string): MediaItem {
  return { service: 'youtube', type, id, title: `YouTube ${type}`, sourceUrl }
}

function spotify(type: string, id: string, sourceUrl: string): MediaItem {
  return { service: 'spotify', type, id, title: `Spotify ${type}`, sourceUrl }
}

export function embedUrl(item: MediaItem): string {
  if (item.service === 'youtube') {
    return item.type === 'playlist'
      ? `https://www.youtube-nocookie.com/embed/videoseries?list=${item.id}&autoplay=1`
      : `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1`
  }
  return `https://open.spotify.com/embed/${item.type}/${item.id}`
}

export function itemKey(item: MediaItem): string {
  return `${item.service}:${item.type}:${item.id}`
}
