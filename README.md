# StreamHub

One app to watch and listen to all your streaming services.

## Run it

```sh
npm install
npm run dev     # open the printed local address
npm test        # link parser tests
npm run build   # production build in dist/
npm run desktop # build, then open the desktop app
```

For desktop development, run `npm run dev` in one terminal and `npm run desktop:dev` in another.

## What works now

- Paste a link from YouTube, Spotify, Apple Music, SoundCloud or Twitch and it plays inside the app.
- "Continue" keeps your recent items across services.
- The service list shows every planned service and how it will play: inside the app, in a desktop window, or by opening its own app.
- In the desktop app, Netflix, Disney+, Max, Prime Video, Hulu, Apple TV+, Paramount+, Peacock, Tidal and Amazon Music open in their own StreamHub window. You sign in once per service and stay signed in.
- On phones and TVs, those tiles open the service's own app when it's installed.

Spotify and Apple Music play full tracks when you're signed in to them in the same browser; otherwise they play previews.

### Desktop DRM

The desktop app runs on [castlabs' Electron build](https://github.com/castlabs/electron-releases), which downloads Google's Widevine module on first launch so protected video can play. Before shipping installers to other people, the app must be signed with castlabs' free VMP signing service, or some services (Netflix in particular) will refuse to play or cap quality.

## Roadmap

1. Stack: React + TypeScript web app, packaged with Electron (desktop) and Capacitor (phone, Android-based TVs).
2. Core shell with YouTube and Spotify. **(done)**
3. More services: Apple Music, SoundCloud, Twitch in-app; Netflix, Disney+ and others in desktop windows; service apps on phone and TV. **(done)** Plex and Jellyfin next.
4. Unified search, continue watching and favorites across services.
