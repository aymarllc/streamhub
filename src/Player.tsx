import { embedUrl, type MediaItem } from './media'
import { getService } from './services'

export function Player({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const service = getService(item.service)!
  const isAudio = item.service === 'spotify'

  return (
    <section className="player" aria-label="Now playing">
      <header className="player-bar">
        <span className="dot" style={{ background: service.color }} />
        <strong>{service.name}</strong>
        <span className="muted">{item.type}</span>
        <a className="muted" href={item.sourceUrl} target="_blank" rel="noreferrer">
          Open in {service.name}
        </a>
        <button className="ghost" onClick={onClose} aria-label="Close player">
          Close
        </button>
      </header>
      <div className={isAudio ? 'frame audio' : 'frame video'}>
        <iframe
          key={embedUrl(item)}
          src={embedUrl(item)}
          title={`${service.name} player`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      {isAudio && (
        <p className="hint">
          Sign in to Spotify in this browser to hear full tracks; otherwise Spotify plays 30-second previews.
        </p>
      )}
    </section>
  )
}
