import type { Service } from './services'

interface DesktopBridge {
  openWebPlayer(serviceId: string): Promise<boolean>
}

declare global {
  interface Window {
    streamhubDesktop?: DesktopBridge
  }
}

/** True when running inside the StreamHub desktop app rather than a browser. */
export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && window.streamhubDesktop !== undefined
}

/**
 * Opens a service from the service list.
 * - Desktop app, web-only service: the service's real site in a StreamHub window (with DRM support).
 * - Everywhere else: the service's https address. On phones and TVs that address is a universal/app
 *   link, so it opens the service's own app when installed and its website otherwise.
 */
export async function openService(service: Service): Promise<void> {
  if (service.playback === 'web' && window.streamhubDesktop) {
    if (await window.streamhubDesktop.openWebPlayer(service.id)) return
  }
  window.open(service.homeUrl, '_blank', 'noreferrer')
}
