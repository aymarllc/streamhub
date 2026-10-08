import { describe, expect, it } from 'vitest'
import { embedUrl, parseMediaLink, thumbnailUrl } from './media'

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
    ['https://music.apple.com/us/album/abbey-road-remastered/1441164426', 'applemusic', 'album', '/us/album/abbey-road-remastered/1441164426'],
    ['https://music.apple.com/us/album/come-together/1441164426?i=1441164430', 'applemusic', 'song', '/us/album/come-together/1441164426?i=1441164430'],
    ['https://music.apple.com/gb/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb', 'applemusic', 'playlist', '/gb/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb'],
    ['https://soundcloud.com/forss/flickermood', 'soundcloud', 'track', '/forss/flickermood'],
    ['https://soundcloud.com/forss/sets/soulhack', 'soundcloud', 'playlist', '/forss/sets/soulhack'],
    ['https://m.soundcloud.com/forss', 'soundcloud', 'artist', '/forss'],
    ['https://www.twitch.tv/Monstercat', 'twitch', 'channel', 'monstercat'],
    ['https://www.twitch.tv/videos/123456789', 'twitch', 'video', '123456789'],
    ['https://www.twitch.tv/monstercat/clip/FunnyClipSlug-abc', 'twitch', 'clip', 'FunnyClipSlug-abc'],
    ['https://clips.twitch.tv/OtherClip', 'twitch', 'clip', 'OtherClip'],
  ])('parses %s', (input, service, type, id) => {
    expect(parseMediaLink(input)).toMatchObject({ service, type, id })
  })

  it.each([
    '',
    'hello world',
    'https://www.netflix.com/watch/123',
    'https://www.youtube.com/',
    'spotify:user:abc',
    'https://music.apple.com/us/browse',
    'https://soundcloud.com/discover',
    'https://www.twitch.tv/directory',
  ])('rejects %s', (input) => {
    expect(parseMediaLink(input)).toBeNull()
  })
})

describe('embedUrl', () => {
  it('builds embed links', () => {
    expect(embedUrl(parseMediaLink('https://youtu.be/abc')!)).toBe('https://www.youtube-nocookie.com/embed/abc?autoplay=1')
    expect(embedUrl(parseMediaLink('spotify:album:xyz')!)).toBe('https://open.spotify.com/embed/album/xyz')
    expect(embedUrl(parseMediaLink('https://music.apple.com/us/album/x/1?i=2')!)).toBe('https://embed.music.apple.com/us/album/x/1?i=2')
    expect(embedUrl(parseMediaLink('https://soundcloud.com/forss/flickermood')!)).toBe(
      'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fforss%2Fflickermood&auto_play=true&visual=true',
    )
  })

  it('tells Twitch which site is embedding it', () => {
    expect(embedUrl(parseMediaLink('twitch.tv/monstercat')!, 'localhost')).toBe('https://player.twitch.tv/?channel=monstercat&parent=localhost')
    expect(embedUrl(parseMediaLink('twitch.tv/videos/42')!, 'example.com')).toBe('https://player.twitch.tv/?video=v42&parent=example.com')
    expect(embedUrl(parseMediaLink('clips.twitch.tv/Abc')!, 'localhost')).toBe('https://clips.twitch.tv/embed?clip=Abc&parent=localhost')
  })
})

describe('thumbnailUrl', () => {
  it('uses YouTube video stills and nothing else', () => {
    expect(thumbnailUrl(parseMediaLink('https://youtu.be/abc')!)).toBe('https://i.ytimg.com/vi/abc/hqdefault.jpg')
    expect(thumbnailUrl(parseMediaLink('https://www.youtube.com/playlist?list=PLx')!)).toBeNull()
    expect(thumbnailUrl(parseMediaLink('spotify:track:xyz')!)).toBeNull()
  })
})
