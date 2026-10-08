// StreamHub desktop shell.
//
// Runs on castlabs' Electron build, which adds the Widevine DRM module that Netflix, Disney+ and
// similar sites need. The web app is served from http://localhost because YouTube and Twitch
// embeds refuse to play from file:// pages.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const electron = require('electron')
const WEB_SERVICES = require('./web-services.json')

const { app, BrowserWindow, ipcMain, nativeTheme, shell, session } = electron

const DIST = path.join(__dirname, '..', 'dist')
const DEV_URL = process.env.STREAMHUB_DEV_URL // set by `npm run desktop:dev`

// Streaming sites block browsers they don't recognise, so present as regular Chrome.
const CHROME_VERSION = process.versions.chrome
const USER_AGENT_BY_PLATFORM = {
  darwin: 'Macintosh; Intel Mac OS X 10_15_7',
  win32: 'Windows NT 10.0; Win64; x64',
  linux: 'X11; Linux x86_64',
}
const USER_AGENT = `Mozilla/5.0 (${USER_AGENT_BY_PLATFORM[process.platform] ?? USER_AGENT_BY_PLATFORM.linux}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

/** Serves the built web app on a random localhost port and resolves to its address. */
function serveDist() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let file = path.normalize(path.join(DIST, urlPath))
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, 'index.html')
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(`http://localhost:${server.address().port}`))
  })
}

// castlabs builds download the Widevine module on first launch. The main window doesn't need it,
// so only the DRM windows wait for it.
let widevineReady = Promise.resolve()

const webPlayers = new Map()

/** Opens (or focuses) a service's real website in its own window, keeping its sign-in between launches. */
async function openWebPlayer(serviceId) {
  const service = WEB_SERVICES[serviceId]
  if (!service) return false

  await widevineReady
  const existing = webPlayers.get(serviceId)
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) existing.restore()
    existing.focus()
    return true
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: service.name,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      partition: `persist:service-${serviceId}`,
      contextIsolation: true,
      sandbox: true,
    },
  })
  win.webContents.setUserAgent(USER_AGENT)
  win.loadURL(service.url)
  webPlayers.set(serviceId, win)
  win.on('closed', () => webPlayers.delete(serviceId))
  return true
}

async function createMainWindow() {
  const url = DEV_URL ?? (await serveDist())
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 720,
    minHeight: 520,
    title: 'StreamHub',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : '#ffffff',
    // On macOS the traffic lights sit over the app's own sidebar, like Apple's apps.
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 20, y: 18 },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
    },
  })

  // Links that leave StreamHub (e.g. "Open in YouTube") go to the user's normal browser.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (target.startsWith('https://')) shell.openExternal(target)
    return { action: 'deny' }
  })
  win.loadURL(url)
}

ipcMain.handle('open-web-player', (_event, serviceId) => openWebPlayer(String(serviceId)))

app.whenReady().then(async () => {
  if (electron.components) {
    widevineReady = electron.components.whenReady().catch((err) => {
      console.error('Widevine is unavailable; Netflix and similar services will not play.', err)
    })
  }
  session.defaultSession.setUserAgent(USER_AGENT)
  await createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
