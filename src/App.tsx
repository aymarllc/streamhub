import { useState, type FormEvent } from 'react'
import { useRecent } from './library'
import { itemKey, parseMediaLink, type MediaItem } from './media'
import { Player } from './Player'
import { SERVICES, getService, type MediaKind, type PlaybackMode, type Service } from './services'

const MODE_LABEL: Record<PlaybackMode, string> = {
  embed: 'Plays here',
  web: 'Desktop window',
  link: 'Opens app',
}

type Filter = 'all' | MediaKind

export default function App() {
  const { recent, add, remove } = useRecent()
  const [playing, setPlaying] = useState<MediaItem | null>(null)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  function play(item: MediaItem) {
    setPlaying(item)
    add(item)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const item = parseMediaLink(link)
    if (!item) {
      setError('Paste a YouTube or Spotify link. More services are coming.')
      return
    }
    setError('')
    setLink('')
    play(item)
  }

  function openService(service: Service) {
    window.open(service.homeUrl, '_blank', 'noreferrer')
  }

  const services = SERVICES.filter((s) => filter === 'all' || s.kinds.includes(filter))

  return (
    <div className="app">
      <header className="top">
        <h1>StreamHub</h1>
        <form className="paste" onSubmit={onSubmit}>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste a YouTube or Spotify link"
            aria-label="Media link"
          />
          <button type="submit">Play</button>
        </form>
        {error && <p className="error">{error}</p>}
      </header>

      {playing && <Player item={playing} onClose={() => setPlaying(null)} />}

      {recent.length > 0 && (
        <section>
          <h2>Continue</h2>
          <ul className="recent">
            {recent.map((item) => {
              const service = getService(item.service)!
              return (
                <li key={itemKey(item)}>
                  <button className="recent-card" onClick={() => play(item)} style={{ borderColor: service.color }}>
                    <span className="dot" style={{ background: service.color }} />
                    <span>
                      <strong>{service.name}</strong>
                      <span className="muted"> {item.type}</span>
                    </span>
                  </button>
                  <button className="ghost small" onClick={() => remove(item)} aria-label="Remove from Continue">
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>Services</h2>
          <div className="tabs" role="tablist">
            {(['all', 'video', 'music'] as Filter[]).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'tab on' : 'tab'} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'video' ? 'Video' : 'Music'}
              </button>
            ))}
          </div>
        </div>
        <ul className="grid">
          {services.map((s) => (
            <li key={s.id}>
              <button className="service" onClick={() => openService(s)} style={{ ['--brand' as string]: s.color }}>
                <span className="service-name">{s.name}</span>
                <span className={`badge ${s.playback}`}>{MODE_LABEL[s.playback]}</span>
                {!s.ready && <span className="soon">Coming soon</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
