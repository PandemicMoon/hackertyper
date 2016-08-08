const electron = require('electron');
const {Menu, dialog} = electron;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//set default speed
let speed = 3;

//store file
let gfile = false;

const template = [
  {
    label: 'File',
    submenu: [
      {
        role: 'open',
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click (item, focusedWindow) {
          let file = dialog.showOpenDialog({properties: ['openFile']});
          if (file)
          {
            gfile = file[0];
            focusedWindow.loadURL('file://' + __dirname + '/index.html?file=' + file[0] + '&speed=' + speed);
          }
        }
      },
      {
        label: 'Exit',
        role: 'exit',
        click (item, focusedWindow)
        {
          focusedWindow.close();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'togglefullscreen'
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'options',
    label: 'Options',
    submenu:[
      {
        label: 'Show Speed',
        click (item, focusedWindow) {
          dialog.showMessageBox(mainWindow, {type: "none", title: "Speed", message: "" + speed, buttons: []});
        }
      },
      {
        label: 'Increase Speed',
        click (item, focusedWindow) {
          speed++;
          if (speed > 10)
            speed = 1;
          if (gfile)
            focusedWindow.loadURL('file://' + __dirname + '/index.html?file=' + gfile + '&speed=' + speed);
          else
            focusedWindow.loadURL('file://' + __dirname + '/index.html?speed=' + speed);
        }
      },
      {
        label: 'Decrease Speed',
        click (item, focusedWindow) {
          speed--;
          if (speed < 1)
            speed = 1;
          if (gfile)
            focusedWindow.loadURL('file://' + __dirname + '/index.html?file=' + gfile + '&speed=' + speed);
          else
            focusedWindow.loadURL('file://' + __dirname + '/index.html?speed=' + speed);
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = require('electron').remote.app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Window menu.
  template[template.length-1].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow () {
  //get icon based on OS
  let icon = "";
  if (process.platform === 'win32') //windows
    icon = 'img/logo.ico';
  else //most likely linux, setting icon doesn't affect OSX
    icon = 'img/512x512.png';
    
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, icon: icon, backgroundColor: '#000'});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html?speed=' + speed);

  mainWindow.maximize();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
