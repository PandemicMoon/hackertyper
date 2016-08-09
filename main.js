const electron = require('electron');
const fs = require('fs');
const path = require('path');
const menu = require('./menu.js');
const
{
    Menu,
    dialog
} = electron;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const spawn = require('child_process').spawn;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//set default speed
let speed = 3;

if (!handleStartupEvent())
{
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', function()
    {
        //set menu
        Menu.setApplicationMenu(menu);
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
}

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
}

//handle Squirrel Startup Events
function handleStartupEvent()
{
    if (process.platform !== "win32")
    {
        return false;
    }

    const cmd = process.argv[1]
    const target = path.basename(process.execPath)
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated")
    {
        run(['--createShortcut=' + target + ''], app.quit)
        return true;
    }
    else if (cmd === "--squirrel-uninstall")
    {
        run(['--removeShortcut=' + target + ''], app.quit)
        return true;
    }
    else if (cmd === "--squirrel-obsolete")
    {
        app.quit();
        return true;
    }
    else
    {
        return false;
    }
}

function run(args, done)
{
    const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe")
    spawn(updateExe, args,
        {
            detached: true
        })
        .on("close", done);
}

module.exports.app = app;
module.exports.speed = speed;
