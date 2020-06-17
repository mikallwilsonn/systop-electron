// ----
// Dependencies
const { app, Menu, ipcMain, Tray } = require( 'electron' );
const log = require( 'electron-log' );
const path = require( 'path' );


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
const MainWindow = require( './MainWindow' ); 
let mainWindow;
let tray;

function createMainWindow() {
  mainWindow = new MainWindow( './app/index.html', isDev );

}


app.on( 'ready', () => {
  createMainWindow();

  mainWindow.webContents.on( 'dom-ready', () => {
    mainWindow.webContents.send( 'settings:get', store.get( 'settings' ));
  });

  const mainMenu = Menu.buildFromTemplate( menu );
  Menu.setApplicationMenu( mainMenu );

  mainWindow.on( 'close', ( event ) => {
    if ( !app.isQuitting ) {
      event.preventDefault();
      mainWindow.hide()
    } else {
      return true;
    }
  });

  // ----
  // Create tray
  const icon = path.join( __dirname, 'assets', 'icons', 'tray_icon.png' );
  tray = new Tray( icon );

  tray.on( 'click', () => {
    if ( mainWindow.isVisible() === true ) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  tray.on( 'right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.popUpContextMenu( contextMenu );
  });

  mainWindow.on( 'ready', () => ( mainWindow = null ));
});


const menu = [
  ...( isMac ? [{ role: 'appMenu' }] : [] ),
  {
    role: 'fileMenu',
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => {
          mainWindow.webContents.send( 'nav:toggle' );
        }
      }
    ]
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
