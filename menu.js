const electron = require('electron');
const fs = require('fs');
const menu = require('./menu.js');
const
{
    Menu,
    dialog
} = electron;
const app = require('./main.js').app;
const speed = require('./main.js').speed;

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
        click(item, focusedWindow)
        {
            let file = dialog.showOpenDialog(
            {
                properties: ['openFile']
            });
            if (file)
            {
                gfile = file[0];
                focusedWindow.loadURL('file://' + __dirname + '/index.html?file=' + file[0] + '&speed=' + speed);
            }
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
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
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
            dialog.showMessageBox(mainWindow,
            {
                type: "none",
                title: "Speed",
                message: "" + speed,
                buttons: []
            });
        }
    },
    {
        label: 'Increase Speed',
        click(item, focusedWindow)
        {
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
        click(item, focusedWindow)
        {
            speed--;
            if (speed < 1)
                speed = 1;
            if (gfile)
                focusedWindow.loadURL('file://' + __dirname + '/index.html?file=' + gfile + '&speed=' + speed);
            else
                focusedWindow.loadURL('file://' + __dirname + '/index.html?speed=' + speed);
        }
    }]
}];

if (process.platform === 'darwin')
{
    const name = require('electron').remote.app.getName()
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
module.exports = Menu.buildFromTemplate(template);
