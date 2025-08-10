import { app, BrowserWindow } from 'electron'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  // Correctly resolve file path with file://
  win.loadURL('http://localhost:5173')
}

app.whenReady().then(() => {
  exec('npm run dev')
  createWindow()
})
