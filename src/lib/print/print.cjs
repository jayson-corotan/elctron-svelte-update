// @ts-nocheck
const { ipcRenderer } = require('electron')

  const args=[{
    "name": "electron" ,
    "description":"Build cross platform desktop apps with JavaScript, HTML, and CSS"
  }, {
    "name": "jsreport",
    "description": "Innovative and unlimited reporting based on javascript templating engines and web technologies"
  }]

  const generateBtn = document.getElementById('generateReport')
  const detailsEl = document.getElementById('details')

  generateBtn.addEventListener('click', () => {
    detailsEl.innerText = ''

    generateBtn.disabled = true
    generateBtn.innerText = 'Rendering..'

    ipcRenderer.send('render-start', args)
  })

  ipcRenderer.on('render-finish', (ev, data) => {
    generateBtn.disabled = false
    generateBtn.innerText = 'Generate Report'

    if (data && data.errorText) {
      detailsEl.innerText = data.errorText
    }
  })