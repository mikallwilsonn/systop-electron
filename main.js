// ----
// Dependencies
const { app, BrowserWindow, Menu, ipcMain } = require( 'electron' );
const log = require( 'electron-log' );


// ----
// Set environment
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;


// ----
// Store
const Store = require( './Store' );
const store = new Store ({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5
    }
  }
});


// ----
// Window
let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'SysTop',
    width: isDev ? 800 : 355,
    height: 600,
    icon: './assets/icons/icon.png',
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if ( isDev ) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile( './app/index.html' );
}


app.on( 'ready', () => {
  createMainWindow();

  mainWindow.webContents.on( 'dom-ready', () => {
    mainWindow.webContents.send( 'settings:get', store.get( 'settings' ));
  });

  const mainMenu = Menu.buildFromTemplate( menu );
  Menu.setApplicationMenu( mainMenu );
});


const menu = [
  ...( isMac ? [{ role: 'appMenu' }] : [] ),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];


// Set Settings
ipcMain.on( 'settings:set', ( event, value ) => {
  store.set( 'settings', value );

  mainWindow.webContents.send( 'settings:get', store.get( 'settings' ));
});


// When all windows are closed
app.on( 'window-all-closed', () => {
  if ( !isMac ) {
    app.quit();
  }
});


// On Activate
app.on( 'activate', () => {
  if ( BrowserWindow.getAllWindows().length === 0 ) {
    createMainWindow();
  }
});


app.allowRendererProcessReuse = true;
