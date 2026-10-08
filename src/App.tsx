import { useState, type FormEvent } from 'react'
import { Icon, type IconName } from './Icon'
import { useRecent } from './library'
import { itemKey, parseMediaLink, thumbnailUrl, type MediaItem } from './media'
import { Player } from './Player'
import { isDesktopApp, openService } from './platform'
import { SERVICES, getService, type MediaKind, type PlaybackMode, type Service } from './services'

const MODE_LABEL: Record<PlaybackMode, string> = {
  embed: 'Plays in StreamHub',
  web: isDesktopApp() ? 'Opens in a window' : 'Plays in the desktop app',
  link: 'Opens its app',
}

type Section = 'home' | MediaKind

const SECTIONS: { id: Section; label: string; title: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', title: 'Home', icon: 'home' },
  { id: 'video', label: 'Watch', title: 'Watch', icon: 'tv' },
  { id: 'music', label: 'Listen', title: 'Listen', icon: 'music' },
]

export default function App() {
  const { recent, add, remove } = useRecent()
  const [playing, setPlaying] = useState<MediaItem | null>(null)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [section, setSection] = useState<Section>('home')

  function play(item: MediaItem) {
    setPlaying(item)
    add(item)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!link.trim()) return
    const item = parseMediaLink(link)
    if (!item) {
      setError("StreamHub can't play that link yet. Try one from YouTube, Spotify, Apple Music, SoundCloud or Twitch.")
      return
    }
    setError('')
    setLink('')
    play(item)
  }

  const current = SECTIONS.find((s) => s.id === section)!
  const services = SERVICES.filter((s) => section === 'home' || s.kinds.includes(section))
  const shelf = recent.filter((item) => section === 'home' || getService(item.service)!.kinds.includes(section))

  return (
    <div className={isDesktopApp() ? 'shell desktop' : 'shell'}>
      <nav className="sidebar" aria-label="Sections">
        <div className="brand">StreamHub</div>
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button className={section === s.id ? 'nav-item on' : 'nav-item'} aria-current={section === s.id} onClick={() => setSection(s.id)}>
                <Icon name={s.icon} />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="content">
        <header className="page-head">
          <h1>{current.title}</h1>
          <form className="link-field" onSubmit={onSubmit} role="search">
            <Icon name="link" size={17} />
            <input
              value={link}
              onChange={(e) => {
                setLink(e.target.value)
                if (error) setError('')
              }}
              placeholder="Paste a link to play"
              aria-label="Paste a link from YouTube, Spotify, Apple Music, SoundCloud or Twitch"
            />
            {link && (
              <button type="submit" className="link-go" aria-label="Play">
                <Icon name="play" size={14} />
              </button>
            )}
          </form>
          {error && <p className="error" role="alert">{error}</p>}
        </header>

        {playing && <Player item={playing} onClose={() => setPlaying(null)} />}

        {shelf.length > 0 && (
          <section className="block">
            <h2>Continue</h2>
            <ul className="shelf">
              {shelf.map((item) => (
                <ShelfCard key={itemKey(item)} item={item} onPlay={() => play(item)} onRemove={() => remove(item)} />
              ))}
            </ul>
          </section>
        )}

        {shelf.length === 0 && !playing && (
          <section className="empty">
            <p className="empty-title">Everything you stream, in one place.</p>
            <p className="empty-body">Paste a link from YouTube, Spotify, Apple Music, SoundCloud or Twitch above, or open one of your services below.</p>
          </section>
        )}

        <section className="block">
          <h2>{section === 'home' ? 'Your Services' : section === 'video' ? 'Video Services' : 'Music Services'}</h2>
          <ul className="apps">
            {services.map((s) => (
              <ServiceIcon key={s.id} service={s} />
            ))}
          </ul>
        </section>
      </main>

      <nav className="tabbar" aria-label="Sections">
        {SECTIONS.map((s) => (
          <button key={s.id} className={section === s.id ? 'tab on' : 'tab'} aria-current={section === s.id} onClick={() => setSection(s.id)}>
            <Icon name={s.icon} size={24} />
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function ShelfCard({ item, onPlay, onRemove }: { item: MediaItem; onPlay: () => void; onRemove: () => void }) {
  const service = getService(item.service)!
  const [thumbFailed, setThumbFailed] = useState(false)
  const thumb = thumbFailed ? null : thumbnailUrl(item)
  return (
    <li className="shelf-item">
      <button className="artwork" onClick={onPlay} style={{ ['--brand' as string]: service.color }} aria-label={`Play ${service.name} ${item.title}`}>
        {thumb ? <img src={thumb} alt="" loading="lazy" onError={() => setThumbFailed(true)} /> : <span className="artwork-mark">{service.name}</span>}
        <span className="artwork-play">
          <Icon name="play" size={18} />
        </span>
      </button>
      <button className="remove" onClick={onRemove} aria-label={`Remove ${service.name} ${item.title} from Continue`}>
        <Icon name="close" size={12} />
      </button>
      <p className="shelf-title">{capitalize(item.title)}</p>
      <p className="shelf-sub">{service.name}</p>
    </li>
  )
}

function ServiceIcon({ service }: { service: Service }) {
  return (
    <li>
      <button className="app" onClick={() => openService(service)} style={{ ['--brand' as string]: service.color }}>
        <span className="app-icon" aria-hidden="true">
          {monogram(service.name)}
        </span>
        <span className="app-name">{service.name}</span>
        <span className="app-note">{service.ready ? MODE_LABEL[service.playback] : 'Coming soon'}</span>
      </button>
    </li>
  )
}

function monogram(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  return words.length > 1 ? words[0][0] + words[1][0] : name[0]
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
