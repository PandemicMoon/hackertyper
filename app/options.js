const ipc = require('electron').ipcRenderer;
const alertify = require('./vendor/alertify.js/js/alertify.js');
var $ = require('jquery');

let settings = ipc.sendSync("get-settings");
let rawSettings = ipc.sendSync("get-raw-settings");
let alertOpen = false;

ipc.on('settings-changed', function(event, setting)
{
    settings = setting;
});

ipc.on('raw-settings-changed', function(event, setting)
{
    rawSettings = setting;
});

document.getElementById("default-file").value = rawSettings.defaultFile;
document.getElementById("default-speed").value = rawSettings.defaultSpeed;

function saveOptions(scope)
{
    if (isNaN(document.getElementById("default-speed").value))
    {
        alertify.closeLogOnClick(true).error("Default Speed must be a number.");
        return false;
    }
    rawSettings.defaultFile = document.getElementById("default-file").value;
    rawSettings.defaultSpeed = parseInt(document.getElementById("default-speed").value);
    ipc.send("save-settings", rawSettings);
    alertify.closeLogOnClick(true).success("Options saved.");

    return false;
}

String.prototype.replaceAll = function(search, replacement)
{
    var target = this;
    return target.split(search).join(replacement);
};
