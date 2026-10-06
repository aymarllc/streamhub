export type MediaKind = 'video' | 'music'

/**
 * How a service plays inside StreamHub:
 * - embed: plays in our own player through the service's official embed or SDK
 * - web:   no public player; on desktop it plays in a built-in window of the real site
 * - link:  opens the service's own app or site
 */
export type PlaybackMode = 'embed' | 'web' | 'link'

export interface Service {
  id: string
  name: string
  kinds: MediaKind[]
  color: string
  homeUrl: string
  playback: PlaybackMode
  /** True once StreamHub supports it; false shows "Coming soon". */
  ready: boolean
}

export const SERVICES: Service[] = [
  { id: 'youtube', name: 'YouTube', kinds: ['video', 'music'], color: '#ff0033', homeUrl: 'https://www.youtube.com', playback: 'embed', ready: true },
  { id: 'spotify', name: 'Spotify', kinds: ['music'], color: '#1db954', homeUrl: 'https://open.spotify.com', playback: 'embed', ready: true },
  { id: 'applemusic', name: 'Apple Music', kinds: ['music'], color: '#fa2d48', homeUrl: 'https://music.apple.com', playback: 'embed', ready: true },
  { id: 'soundcloud', name: 'SoundCloud', kinds: ['music'], color: '#ff5500', homeUrl: 'https://soundcloud.com', playback: 'embed', ready: true },
  { id: 'twitch', name: 'Twitch', kinds: ['video'], color: '#9146ff', homeUrl: 'https://www.twitch.tv', playback: 'embed', ready: true },
  { id: 'plex', name: 'Plex', kinds: ['video', 'music'], color: '#e5a00d', homeUrl: 'https://app.plex.tv', playback: 'embed', ready: false },
  { id: 'jellyfin', name: 'Jellyfin', kinds: ['video', 'music'], color: '#aa5cc3', homeUrl: 'https://jellyfin.org', playback: 'embed', ready: false },
  { id: 'netflix', name: 'Netflix', kinds: ['video'], color: '#e50914', homeUrl: 'https://www.netflix.com', playback: 'web', ready: true },
  { id: 'disneyplus', name: 'Disney+', kinds: ['video'], color: '#113ccf', homeUrl: 'https://www.disneyplus.com', playback: 'web', ready: true },
  { id: 'max', name: 'Max', kinds: ['video'], color: '#002be7', homeUrl: 'https://www.max.com', playback: 'web', ready: true },
  { id: 'primevideo', name: 'Prime Video', kinds: ['video'], color: '#00a8e1', homeUrl: 'https://www.primevideo.com', playback: 'web', ready: true },
  { id: 'hulu', name: 'Hulu', kinds: ['video'], color: '#1ce783', homeUrl: 'https://www.hulu.com', playback: 'web', ready: true },
  { id: 'appletv', name: 'Apple TV+', kinds: ['video'], color: '#555555', homeUrl: 'https://tv.apple.com', playback: 'web', ready: true },
  { id: 'paramountplus', name: 'Paramount+', kinds: ['video'], color: '#0064ff', homeUrl: 'https://www.paramountplus.com', playback: 'web', ready: true },
  { id: 'peacock', name: 'Peacock', kinds: ['video'], color: '#f5b400', homeUrl: 'https://www.peacocktv.com', playback: 'web', ready: true },
  { id: 'tidal', name: 'Tidal', kinds: ['music'], color: '#33ffee', homeUrl: 'https://listen.tidal.com', playback: 'web', ready: true },
  { id: 'amazonmusic', name: 'Amazon Music', kinds: ['music'], color: '#25d1da', homeUrl: 'https://music.amazon.com', playback: 'web', ready: true },
]

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id)
}
