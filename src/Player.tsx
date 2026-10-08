import { Icon } from './Icon'
import { audioHeight, embedUrl, isVideo, type MediaItem } from './media'
import { getService } from './services'

const SIGN_IN_HINT: Partial<Record<MediaItem['service'], string>> = {
  spotify: 'Sign in to Spotify in this browser to hear full tracks. Otherwise Spotify plays 30-second previews.',
  applemusic: 'Sign in to Apple Music in this browser to hear full songs. Otherwise Apple Music plays previews.',
}

export function Player({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const service = getService(item.service)!
  const video = isVideo(item)
  const hint = SIGN_IN_HINT[item.service]

  return (
    <section className="player" aria-label="Now playing">
      <div className={video ? 'frame video' : 'frame audio'} style={video ? undefined : { height: audioHeight(item) }}>
        <iframe
          key={embedUrl(item)}
          src={embedUrl(item)}
          title={`${service.name} player`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="player-bar">
        <div className="now">
          <span className="now-label">Now Playing</span>
          <span className="now-title">
            {service.name} <span className="secondary">· {item.title}</span>
          </span>
        </div>
        <a className="round-button" href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open in ${service.name}`} title={`Open in ${service.name}`}>
          <Icon name="external" size={16} />
        </a>
        <button className="round-button" onClick={onClose} aria-label="Close player" title="Close">
          <Icon name="close" size={16} />
        </button>
      </div>
      {hint && <p className="hint">{hint}</p>}
    </section>
  )
}
