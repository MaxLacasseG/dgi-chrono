const electron = require ('electron');
const url = require ('url');
const path = require ('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;
const Chrono = require ('./assets/js/chrono');

//SET node env
process.env.NODE_ENV = 'production';

let mainWindow, editTimeWindow;

// Listen for app to be ready
app.on ('ready', () => {
  const {width, height} = electron.screen.getPrimaryDisplay ().workAreaSize;
  //config inside
  mainWindow = new BrowserWindow ({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.isMinimizable (true);
  mainWindow.isMaximizable (true);

  if (process.platform === 'darwin') {
    mainWindow.setFullScreen (true);
  }

  mainWindow.show ();

  mainWindow.loadURL (
    url.format ({
      pathname: path.join (__dirname, 'components', 'mainWindow.html'),
      protocol: 'file',
      slashes: true,
    })
  );

  //Quit app
  mainWindow.on ('closed', () => {
    app.quit ();
  });

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate (mainMenuTemplate);
  //Insert menu
  Menu.setApplicationMenu (mainMenu);

  //EVENTS
  ipcMain.on ('chrono:init', (event, time) => {
    mainWindow.webContents.send ('chrono:set-time', time);
  });
  ipcMain.on ('chrono:update', (event, time) => {
    mainWindow.webContents.send ('chrono:set-time', time);
  });
  ipcMain.on ('chrono:reset', (event, time) => {
    mainWindow.webContents.send ('chrono:set-time', time);
  });
  ipcMain.on ('chrono:time-ended', (event, time) => {
    mainWindow.webContents.send ('chrono:time-ended', time);
  });
  ipcMain.on ('chrono:edit-time', (event, newTime) => {
    let constainsPositiveNumbers = true;
    newTime.values.forEach (value => {
      if (isNaN (parseInt (value)) || parseInt (value) < 0) {
        constainsPositiveNumbers = false;
      }
    });

    if (constainsPositiveNumbers) {
      mainWindow.webContents.send ('chrono:edit-time', newTime);
    }
    editTimeWindow.close ();
  });
});

function editTimer () {
  const {width, height} = electron.screen.getPrimaryDisplay ().workAreaSize;
  editTimeWindow = new BrowserWindow ({
    height,
    width,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  editTimeWindow.loadURL (
    url.format ({
      pathname: path.join (__dirname, 'components', 'editTimeWindow.html'),
      protocol: 'file',
      slashes: true,
    })
  );
  editTimeWindow.on ('close', () => {
    editTimeWindow = null;
  });
}

const mainMenuTemplate = [
  {
    label: 'Fichier',
    submenu: [
      {
        label: 'Quitter',
        accelerator: 'CommandOrControl+Q',
        click () {
          app.quit ();
        },
      },
      {
        label: 'Activer/Désactiver plein écran',
        role: 'togglefullscreen',
      },
    ],
  },
  {
    label: 'Contrôles',
    submenu: [
      {
        label: 'Démarrer/Pause',
        accelerator: 'Space',
        click () {
          mainWindow.webContents.send ('controls:toggle');
        },
      },
      {
        label: 'Réinitialiser',
        accelerator: 'R',
        click () {
          mainWindow.webContents.send ('controls:reset');
        },
      },
      {
        label: 'Modifier le temps',
        accelerator: 'E',
        click () {
          editTimer ();
        },
      },
      {
        label: 'Séquence 1',
        accelerator: '1',
        click () {
          mainWindow.webContents.send ('controls:switchIndex', 1);
        },
      },
      {
        label: 'Séquence 2',
        accelerator: '2',
        click () {
          mainWindow.webContents.send ('controls:switchIndex', 2);
        },
      },
    ],
  },
];

//If mac, add empty object in menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift ({label: 'Electron'});
}

if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push ({
    label: 'Dev tools',
    submenu: [
      {
        label: 'Toggled',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click (item, focussedWindow) {
          focussedWindow.toggleDevTools ();
        },
      },
      {
        role: 'reload',
        accelerator: process.platform == 'darwin' ? 'Command+R' : 'Ctrl+R',
      },
    ],
  });
}
