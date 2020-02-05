'use strict'

import { app,protocol, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import getPort from 'get-port';
import { format as formatUrl } from 'url'
import settings from '../../settings/globals.json';
import makeServe, { Serve } from './serve';

const isDevelopment = process.env.NODE_ENV !== 'production'


// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow:BrowserWindow|null;
let serve:Serve|null;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1280, height: 768,
    title:'Cardmaker Studio',
    darkTheme: true,
    backgroundColor: '#2C2828',
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.setMenu(null);

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`).then(() => {
      window.webContents.openDevTools()
    })

  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    })) 
  }

  window.on('closed', () => {
    mainWindow = null
    //serve?.close();
    serve = null;
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  
  protocol.registerStringProtocol(settings.customScheme, function(request:any,callback:any) {
    // do nothing : just force Windows to associate the scheme with this app
  })
  const port = await getPort();

  global.sharedVars = {
    servePort: port
  }

  serve = await makeServe(port);
  mainWindow = createMainWindow();

  ipcMain.handle('html-to-pdf', async (event, id: string, html: string, base: string) => {
    return await serve?.convertToPdf(id,html,base)
  })

  ipcMain.handle('serve', (event, id: string, html: string, base: string) => {
    return serve?.serve(id,html,base)
  })

  ipcMain.handle('unserve', (event, id: string) => {
    return serve?.unserve(id)
  })
 
})
