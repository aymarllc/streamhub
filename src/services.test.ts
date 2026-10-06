import { describe, expect, it } from 'vitest'
import desktopWebServices from '../electron/web-services.json'
import { SERVICES } from './services'

describe('desktop web-player list', () => {
  it('matches the web-only services in the app', () => {
    const expected = Object.fromEntries(
      SERVICES.filter((s) => s.playback === 'web').map((s) => [s.id, { name: s.name, url: s.homeUrl }]),
    )
    expect(desktopWebServices).toEqual(expected)
  })
})
