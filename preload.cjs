const { contextBridge, ipcRenderer, ipcMain } = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//   ipcRenderer,
// });
console.log("hello preload")
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // we can also expose variables, not just functions
})

