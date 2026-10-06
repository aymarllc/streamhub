import { audioHeight, embedUrl, isVideo, type MediaItem } from './media'
import { getService } from './services'

const SIGN_IN_HINT: Partial<Record<MediaItem['service'], string>> = {
  spotify: 'Sign in to Spotify in this browser to hear full tracks; otherwise Spotify plays 30-second previews.',
  applemusic: 'Sign in to Apple Music in this browser to hear full songs; otherwise Apple Music plays previews.',
}

export function Player({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const service = getService(item.service)!
  const video = isVideo(item)
  const hint = SIGN_IN_HINT[item.service]

  return (
    <section className="player" aria-label="Now playing">
      <header className="player-bar">
        <span className="dot" style={{ background: service.color }} />
        <strong>{service.name}</strong>
        <span className="muted">{item.title}</span>
        <a className="muted" href={item.sourceUrl} target="_blank" rel="noreferrer">
          Open in {service.name}
        </a>
        <button className="ghost" onClick={onClose} aria-label="Close player">
          Close
        </button>
      </header>
      <div className={video ? 'frame video' : 'frame audio'} style={video ? undefined : { height: audioHeight(item) }}>
        <iframe
          key={embedUrl(item)}
          src={embedUrl(item)}
          title={`${service.name} player`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </section>
  )
}
