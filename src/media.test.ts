import { describe, expect, it } from 'vitest'
import { embedUrl, parseMediaLink } from './media'

describe('parseMediaLink', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'video', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=42', 'youtube', 'video', 'dQw4w9WgXcQ'],
    ['youtube.com/shorts/abc123XYZ', 'youtube', 'video', 'abc123XYZ'],
    ['https://music.youtube.com/watch?v=xyz789&list=PL1', 'youtube', 'video', 'xyz789'],
    ['https://www.youtube.com/playlist?list=PLabc', 'youtube', 'playlist', 'PLabc'],
    ['https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x', 'spotify', 'track', '4uLU6hMCjMI75M1A2tKUQC'],
    ['https://open.spotify.com/intl-de/album/1DFixLWuPkv3KT3TnV35m3', 'spotify', 'album', '1DFixLWuPkv3KT3TnV35m3'],
    ['spotify:playlist:37i9dQZF1DXcBWIGoYBM5M', 'spotify', 'playlist', '37i9dQZF1DXcBWIGoYBM5M'],
  ])('parses %s', (input, service, type, id) => {
    expect(parseMediaLink(input)).toMatchObject({ service, type, id })
  })

  it.each(['', 'hello world', 'https://www.netflix.com/watch/123', 'https://www.youtube.com/', 'spotify:user:abc'])(
    'rejects %s',
    (input) => {
      expect(parseMediaLink(input)).toBeNull()
    },
  )
})

describe('embedUrl', () => {
  it('builds embed links', () => {
    expect(embedUrl(parseMediaLink('https://youtu.be/abc')!)).toBe('https://www.youtube-nocookie.com/embed/abc?autoplay=1')
    expect(embedUrl(parseMediaLink('spotify:album:xyz')!)).toBe('https://open.spotify.com/embed/album/xyz')
  })
})
