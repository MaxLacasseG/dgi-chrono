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
  //Pour voir la console
  //mainWindow.webContents.openDevTools ();
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
  ipcMain.on ('chrono:update-points', (event, points) => {
    mainWindow.webContents.send ('chrono:set-points', points);
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
        label: 'Cycle 1',
        accelerator: '1',
        click () {
          mainWindow.webContents.send ('controls:switchCycle', 1);
        },
      },
      {
        label: 'Cycle 2',
        accelerator: '2',
        click () {
          mainWindow.webContents.send ('controls:switchCycle', 2);
        },
      },
      {
        label: 'Son 1',
        accelerator: '3',
        click () {
          mainWindow.webContents.send ('controls:switchSound', 1);
        },
      },
      {
        label: 'Son 2',
        accelerator: '4',
        click () {
          mainWindow.webContents.send ('controls:switchSound', 2);
        },
      },
      {
        label: 'Ajouter un objet bleu (10 pts)',
        accelerator: 'Left',
        click () {
          mainWindow.webContents.send ('controls:addPoints', 10);
        },
      },
      {
        label: 'Ajouter un objet jaune (20 pts)',
        accelerator: 'Down',
        click () {
          mainWindow.webContents.send ('controls:addPoints', 20);
        },
      },
      {
        label: 'Ajouter un objet rouge (30 pts)',
        accelerator: 'Right',
        click () {
          mainWindow.webContents.send ('controls:addPoints', 30);
        },
      },
      {
        label: 'Ajouter un objet vert (50 pts)',
        accelerator: 'Up',
        click () {
          mainWindow.webContents.send ('controls:addPoints', 50);
        },
      },
      {
        label: 'Ajouter un objet mystère (40 pts)',
        accelerator: 'Enter',
        click () {
          mainWindow.webContents.send ('controls:addPoints', 40);
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
