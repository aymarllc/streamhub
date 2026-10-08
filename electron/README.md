`web-services.json` lists the services the desktop app opens in their own window. Keep it in sync with the `playback: 'web'` entries in `src/services.ts`; `src/services.test.ts` fails if they drift.
