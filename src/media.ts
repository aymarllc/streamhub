/** Services StreamHub can play inside its own player. */
export type EmbedService = 'youtube' | 'spotify' | 'applemusic' | 'soundcloud' | 'twitch'

/** Something playable from one service, identified the way that service's embed expects. */
export interface MediaItem {
  service: EmbedService
  /**
   * youtube: video, playlist
   * spotify: track, album, playlist, episode, show, artist
   * applemusic: album, playlist, song, music-video, station
   * soundcloud: track, playlist, artist
   * twitch: channel, video, clip
   */
  type: string
  /** For applemusic and soundcloud this is the URL path, since their embeds are keyed by it. */
  id: string
  title: string
  sourceUrl: string
}

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'episode', 'show', 'artist']
const APPLE_TYPES = ['album', 'playlist', 'song', 'music-video', 'station']
// First path segments on twitch.tv that are site pages, not channels.
const TWITCH_RESERVED = ['directory', 'downloads', 'jobs', 'p', 'search', 'settings', 'subscriptions', 'turbo', 'wallet', 'inventory', 'drops']

/** Turns a pasted link (or Spotify URI) into a playable item, or null if we can't play it yet. */
export function parseMediaLink(input: string): MediaItem | null {
  const text = input.trim()

  const uri = text.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/)
  if (uri && SPOTIFY_TYPES.includes(uri[1])) {
    return item('spotify', uri[1], uri[2], text)
  }

  let url: URL
  try {
    url = new URL(text.includes('://') ? text : `https://${text}`)
  } catch {
    return null
  }
  const fullHost = url.hostname.toLowerCase()
  const host = fullHost.replace(/^(www|m)\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be' && parts[0]) {
    return item('youtube', 'video', parts[0], text)
  }
  if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v')
    if (v) return item('youtube', 'video', v, text)
    const list = url.searchParams.get('list')
    if (list) return item('youtube', 'playlist', list, text)
    if (['shorts', 'embed', 'live'].includes(parts[0]) && parts[1]) {
      return item('youtube', 'video', parts[1], text)
    }
    return null
  }

  if (host === 'open.spotify.com') {
    // Links may carry a locale prefix such as /intl-de/track/...
    const rest = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts
    const [type, id] = rest[0] === 'embed' ? rest.slice(1) : rest
    if (type && id && SPOTIFY_TYPES.includes(type)) return item('spotify', type, id, text)
    return null
  }

  if (host === 'music.apple.com' || host === 'embed.music.apple.com') {
    // /{country}/{type}/{slug}/{id}, e.g. /us/album/abbey-road/1441164426?i=1441164430
    const [, type] = parts
    if (parts.length >= 3 && APPLE_TYPES.includes(type)) {
      const songInAlbum = type === 'album' && url.searchParams.get('i')
      return item('applemusic', songInAlbum ? 'song' : type, url.pathname + url.search, text)
    }
    return null
  }

  if (host === 'soundcloud.com') {
    if (parts.length === 0 || ['discover', 'search', 'stream', 'you', 'upload', 'charts'].includes(parts[0])) return null
    const type = parts.length === 1 ? 'artist' : parts[1] === 'sets' ? 'playlist' : 'track'
    return item('soundcloud', type, `/${parts.join('/')}`, text)
  }

  if (host === 'clips.twitch.tv' && parts[0]) {
    return item('twitch', 'clip', parts[0], text)
  }
  if (host === 'twitch.tv') {
    if (parts[0] === 'videos' && /^\d+$/.test(parts[1] ?? '')) return item('twitch', 'video', parts[1], text)
    if (parts[1] === 'clip' && parts[2]) return item('twitch', 'clip', parts[2], text)
    if (parts.length >= 1 && !TWITCH_RESERVED.includes(parts[0])) return item('twitch', 'channel', parts[0].toLowerCase(), text)
    return null
  }

  return null
}

const TYPE_LABEL: Record<string, string> = { 'music-video': 'music video' }

function item(service: EmbedService, type: string, id: string, sourceUrl: string): MediaItem {
  return { service, type, id, title: TYPE_LABEL[type] ?? type, sourceUrl }
}

/**
 * The embed address for an item. `parentHost` is the hostname StreamHub is served from;
 * Twitch refuses to play unless it is told this.
 */
export function embedUrl(item: MediaItem, parentHost?: string): string {
  switch (item.service) {
    case 'youtube':
      return item.type === 'playlist'
        ? `https://www.youtube-nocookie.com/embed/videoseries?list=${item.id}&autoplay=1`
        : `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1`
    case 'spotify':
      return `https://open.spotify.com/embed/${item.type}/${item.id}`
    case 'applemusic':
      return `https://embed.music.apple.com${item.id}`
    case 'soundcloud':
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com${item.id}`)}&auto_play=true&visual=true`
    case 'twitch': {
      const parent = `parent=${encodeURIComponent(parentHost ?? location.hostname)}`
      if (item.type === 'clip') return `https://clips.twitch.tv/embed?clip=${item.id}&${parent}`
      const target = item.type === 'video' ? `video=v${item.id}` : `channel=${item.id}`
      return `https://player.twitch.tv/?${target}&${parent}`
    }
  }
}

/** Whether the item plays as a video (16:9 frame) or an audio card. */
export function isVideo(item: MediaItem): boolean {
  if (item.service === 'youtube' || item.service === 'twitch') return true
  return item.service === 'applemusic' && item.type === 'music-video'
}

/** Height in pixels for audio embeds. */
export function audioHeight(item: MediaItem): number {
  if (item.service === 'applemusic') return item.type === 'song' ? 175 : 450
  if (item.service === 'soundcloud') return item.type === 'track' ? 300 : 450
  return 352
}

export function itemKey(item: MediaItem): string {
  return `${item.service}:${item.type}:${item.id}`
}
