const electron = require('electron');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const
{
    Menu,
    dialog
} = electron;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const optionsFile = app.getPath("userData") + "\\options.json";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let optionsWindow;

try
{
    fs.accessSync(optionsFile, fs.F_OK);
}
catch (e)
{
    fs.writeFileSync(optionsFile, JSON.stringify(
    {
        defaultFile: "./txt/kernel.txt",
        defaultSpeed: 3
    }), 'utf-8');
}
let settings = JSON.parse(fs.readFileSync(optionsFile, 'utf8'));
let rawSettings = JSON.parse(fs.readFileSync(optionsFile, 'utf8'));

for (var key in settings)
{
    if (typeof settings[key] === "string" || settings[key] instanceof String)
    {
        settings[key] = replaceAll(settings[key], "@dirname@", __dirname);
    }
}

//set default speed
let speed = settings.defaultSpeed;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function()
{
    //set menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function()
{
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
});

app.on('activate', function()
{
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null)
    {
        createWindow();
    }
});

ipc.on('set-speed', function(event, arg)
{
    speed = parseInt(arg);
});

ipc.on('open', function(event, file)
{
    mainWindow.loadURL('file://' + __dirname + '/index.html?file=' + file + '&speed=' + speed);
});

ipc.on('get-settings', function(event)
{
    event.returnValue = settings;
});

ipc.on('get-raw-settings', function(event)
{
    event.returnValue = rawSettings;
});

ipc.on('save-settings', function(event, setting)
{
    fs.writeFileSync(optionsFile, JSON.stringify(setting), 'utf-8');
    settings = JSON.parse(fs.readFileSync(optionsFile, 'utf8'));
    rawSettings = JSON.parse(fs.readFileSync(optionsFile, 'utf8'));

    for (var key in settings)
    {
        if (typeof settings[key] === "string" || settings[key] instanceof String)
        {
            settings[key] = replaceAll(settings[key], "@dirname@", __dirname);
        }
    }

    mainWindow.webContents.send("settings-changed", settings);
    optionsWindow.webContents.send("settings-changed", settings);
    optionsWindow.webContents.send("raw-settings-changed", rawSettings);
});

function createWindow()
{
    //get icon based on OS
    let icon = "";
    if (process.platform === 'win32') //windows
        icon = 'img/logo.ico';
    else //most likely linux, setting icon doesn't affect OSX
        icon = 'img/512x512.png';

    // Create the browser window.
    mainWindow = new BrowserWindow(
    {
        width: 800,
        height: 600,
        icon: icon,
        backgroundColor: '#000'
    });

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html?speed=' + speed);

    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', function()
    {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.on('enter-full-screen', function()
    {
        mainWindow.setMenuBarVisibility(false);
    });

    mainWindow.on('leave-full-screen', function()
    {
        mainWindow.setMenuBarVisibility(true);
    });

    mainWindow.on('enter-html-full-screen', function()
    {
        mainWindow.setMenuBarVisibility(false);
    });

    mainWindow.on('leave-html-full-screen', function()
    {
        mainWindow.setMenuBarVisibility(true);
    });
}

function showOptionsWindow(window)
{
    //get icon based on OS
    let icon = "";
    if (process.platform === 'win32') //windows
        icon = 'img/logo.ico';
    else //most likely linux, setting icon doesn't affect OSX
        icon = 'img/512x512.png';

    optionsWindow = new BrowserWindow(
    {
        parent: window,
        width: 800,
        height: 600,
        icon: icon,
        backgroundColor: '#fff',
        fullscreenable: false
    });

    optionsWindow.setMenuBarVisibility(false);
    optionsWindow.loadURL('file://' + __dirname + '/options.html');

    // Emitted when the window is closed.
    optionsWindow.on('closed', function()
    {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        optionsWindow = null;
    });
}

const template = [
{
    label: 'File',
    submenu: [
    {
        role: 'open',
        label: 'Open',
        click(item, focusedWindow)
        {
            let file = dialog.showOpenDialog(
            {
                properties: ['openFile']
            });
            if (file)
            {
                focusedWindow.loadURL('file://' + __dirname + '/index.html?file=' + file[0] + '&speed=' + speed);
            }
        }
    },
    {
        label: 'Open Preset',
        click(item, focusedWindow)
        {
            let files = fs.readdirSync(__dirname + "\\txt");
            focusedWindow.webContents.send("show-preset-file-selector", files);
        }
    },
    {
        label: 'Take Screenshot',
        click(item, focusedWindow)
        {
            let file = dialog.showSaveDialog(
            {
                defaultPath: "screenshot.png",
                filters: [
                {
                    name: 'PNG',
                    extensions: ['png']
                }]
            });
            if (file)
            {
                focusedWindow.capturePage(function(image)
                {
                    var wstream = fs.createWriteStream(file);
                    wstream.write(image.toPNG());
                    wstream.end();
                });
            }
        }
    },
    {
        label: 'Exit',
        role: 'exit',
        click(item, focusedWindow)
        {
            focusedWindow.close();
        }
    }]
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
    }]
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
        click(item, focusedWindow)
        {
            if (focusedWindow)
                focusedWindow.webContents.toggleDevTools();
        }
    }]
},
{
    role: 'window',
    submenu: [
    {
        role: 'minimize'
    },
    {
        role: 'close'
    }]
},
{
    role: 'options',
    label: 'Options',
    submenu: [
    {
        label: 'Show Speed',
        click(item, focusedWindow)
        {
            focusedWindow.webContents.send("show-speed");
        }
    },
    {
        label: 'Set Speed',
        click(item, focusedWindow)
        {
            focusedWindow.webContents.send("show-set-speed");
        }
    },
    {
        label: 'More Options',
        click(item, focusedWindow)
        {
            showOptionsWindow(focusedWindow);
        }
    }]
}];

if (process.platform === 'darwin')
{
    const name = require('electron').remote.app.getName();
    template.unshift(
        {
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
            }]
        })
        // Window menu.
    template[template.length - 1].submenu = [
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
    }];
}

String.prototype.replaceAll = function(search, replacement)
{
    var target = this;
    return target.split(search).join(replacement);
};

function replaceAll(string, search, replacement)
{
    return string.split(search).join(replacement);
};
