# StreamHub

One app to watch and listen to all your streaming services.

## Run it

```sh
npm install
npm run dev     # open the printed local address
npm test        # link parser tests
npm run build   # production build in dist/
```

## What works now

- Paste a YouTube link (video or playlist) or a Spotify link (track, album, playlist, episode, show, artist) and it plays inside the app.
- "Continue" keeps your recent items across services.
- The service list shows every planned service and how it will play: inside the app, in a desktop window, or by opening its own app.

Spotify plays full tracks when you're signed in to Spotify in the same browser; otherwise it plays 30-second previews.

## Roadmap

1. Stack: React + TypeScript web app, packaged with Electron (desktop) and Capacitor (phone, Android-based TVs).
2. Core shell with YouTube and Spotify. **(this)**
3. More services: Apple Music, SoundCloud, Twitch, Plex, Jellyfin in-app; Netflix, Disney+ and others in desktop windows; deep links on phone and TV.
4. Unified search, continue watching and favorites across services.
