const { contextBridge, ipcRenderer } = require('electron')

// The only things the web app can ask of the desktop shell.
contextBridge.exposeInMainWorld('streamhubDesktop', {
  openWebPlayer: (serviceId) => ipcRenderer.invoke('open-web-player', serviceId),
})
