const ipc = require('electron').ipcRenderer;
const alertify = require('./vendor/alertify.js/js/alertify.js');
const fs = require('fs');
var $ = require('jquery');

let settings = ipc.sendSync("get-settings");
let alertOpen = false;

ipc.on('show-set-speed', function(event)
{
    alertOpen = true;
    alertify.defaultValue("" + Typer.speed).prompt("",
        function(val, ev)
        {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
            if (isNaN(val))
            {
                alertify.closeLogOnClick(true).error("Please enter a number");
            }
            else
            {
                let speed = parseInt(val);
                alertify.closeLogOnClick(true).success("Speed set to " + speed);
                Typer.speed = speed;
                ipc.send("set-speed", speed);
            }
            alertOpen = false;
        },
        function(ev)
        {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
            alertOpen = false;
        });
});

ipc.on('show-speed', function(event)
{
    alertify.closeLogOnClick(true).success("Speed: " + Typer.speed);
});

ipc.on('set-speed', function(event, speed)
{
    Typer.speed = parseInt(speed);
});

ipc.on('show-preset-file-selector', function(event, files)
{
    alertOpen = true;
    let options = files.slice(0);
    for (let key in files)
    {
        let sep = Typer.file.includes("/") ? "/" : "\\"; //determine seperator
        options[key] = files[key].substring(0, files[key].lastIndexOf(".")); //format file
        options[key] = options[key].substring(options[key].lastIndexOf(sep) + 1, options[key].length); //finish formatting
    }
    alertify.okBtn("Open").select("", options,
        function(val, ev)
        {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
            ipc.send('open', "./txt/" + files[val]);
            alertOpen = false;
        },
        function(ev)
        {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
            alertOpen = false;
        });
});

ipc.on('settings-changed', function(event, setting)
{
    settings = setting;
});

/*
 *(c) Copyright 2011 Simone Masiero. Some Rights Reserved.
 *This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 License
 */

$(
    function()
    {
        $("body").keydown(
            function(event)
            {
                Typer.addText(event); //Capture the keydown event and call the addText, this is executed on page load
            }
        );
    }
);

var Typer = {
    text: null,
    accessCountimer: null,
    index: 0, // current cursor position
    speed: 2, // speed of the Typer
    file: "", //file, must be set
    accessCount: 0, //times alt is pressed for Access Granted
    deniedCount: 0, //times caps is pressed for Access Denied
    init: function()
    { // inizialize Hacker Typer
        if (Typer.file === "@default@")
            Typer.file = settings.defaultFile;
        accessCountimer = setInterval(function()
        {
            Typer.updLstChr();
        }, 500); // inizialize timer for blinking cursor
        $.get(Typer.file, function(data)
        { // get the text file
            Typer.text = data; // save the textfile in Typer.text
        });
        let sep = Typer.file.includes("/") ? "/" : "\\"; //determine seperator
        let title = Typer.file.substring(0, Typer.file.lastIndexOf(".")); //format title
        title = title.substring(Typer.file.lastIndexOf(sep) + 1, title.length); //finish formatting
        document.title = title + " - Complier++"; //set title
    },

    content: function()
    {
        return $("#console").html(); // get console content
    },

    write: function(str)
    { // append to console content
        $("#console").append(str);
        return false;
    },

    makeAccess: function()
    { //create Access Granted popUp      FIXME: popup is on top of the page and doesn't show if the page is scrolled
        Typer.hidepop(); // hide all popups
        Typer.accessCount = 0; //reset count
        var ddiv = $("<div id='gran'>").html(""); // create new blank div and id "gran"
        ddiv.addClass("accessGranted"); // add class to the div
        ddiv.html("<h1>ACCESS GRANTED</h1>"); // set content of div
        $(document.body).prepend(ddiv); // prepend div to body
        return false;
    },

    makeDenied: function()
    { //create Access Denied popUp      FIXME: popup is on top of the page and doesn't show if the page is scrolled
        Typer.hidepop(); // hide all popups
        Typer.deniedCount = 0; //reset count
        var ddiv = $("<div id='deni'>").html(""); // create new blank div and id "deni"
        ddiv.addClass("accessDenied"); // add class to the div
        ddiv.html("<h1>ACCESS DENIED</h1>"); // set content of div
        $(document.body).prepend(ddiv); // prepend div to body
        return false;
    },

    hidepop: function()
    { // remove all existing popups
        $("#deni").remove();
        $("#gran").remove();
    },

    addText: function(key)
    { //Main function to add the code
        if (key.keyCode == 18)
        { // key 18 = alt key
            Typer.accessCount++; //increase counter
            if (Typer.accessCount >= 3)
            { // if it's presed 3 times
                Typer.makeAccess(); // make access popup
            }
        }
        else if (key.keyCode == 20)
        { // key 20 = caps lock
            Typer.deniedCount++; // increase counter
            if (Typer.deniedCount >= 3)
            { // if it's pressed 3 times
                Typer.makeDenied(); // make denied popup
            }
        }
        else if (key.keyCode == 27)
        { // key 27 = esc key
            Typer.hidepop(); // hide all popups
        }
        else if (key.metaKey || key.shiftKey || key.ctrlKey || key.altKey)
        {
            //do nothing
        }
        else if (key.keyCode == 17)
        { //key 17 = ctrl key
            //do nothing
        }
        else if (key.keyCode == 91 || key.keyCode == 93 || key.keyCode == 224)
        { //keys 91, 93, 224 = cmd key
            //do nothing
        }
        else if (key.keyCode >= 112 && key.keyCode <= 123)
        { //key 112-123 = F* keys
            //do nothing
        }
        else if (Typer.text && !alertOpen)
        { // otherway if text is loaded
            var cont = Typer.content(); // get the console content
            if (cont.substring(cont.length - 1, cont.length) == "|") // if the last char is the blinking cursor
                $("#console").html($("#console").html().substring(0, cont.length - 1)); // remove it before adding the text
            if (key.keyCode != 8)
            { // if key is not backspace
                if (Typer.index < Typer.text.length) //prevent typing after end of file
                    Typer.index += Typer.speed; // add to the index the speed
                if (Typer.index > Typer.text.length) // make sure index isn't bigger than file text size
                    Typer.index = Typer.text.length;
            }
            else
            {
                if (Typer.index > 0) // else if index is not less than 0
                    Typer.index -= 1; // remove 1 for deleting text
            }
            var text = $("<div/>").text(Typer.text.substring(0, Typer.index)).html(); // parse the text for stripping html enities
            var rtn = new RegExp("\n", "g"); // newline regex
            var rts = new RegExp("\\s", "g"); // whitespace regex
            var rtt = new RegExp("\\t", "g"); // tab regex
            $("#console").html(text.replace(rtn, "<br/>").replace(rtt, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts, "&nbsp;")); // replace newline chars with br, tabs with 4 space and blanks with an html blank
            window.scrollBy(0, 50); // scroll to make sure bottom is always visible

            if (key.preventDefault && key.keyCode != 122)
            { // prevent F11(fullscreen) from being blocked
                key.preventDefault();
            };
            if (key.keyCode != 122)
            { // otherway prevent keys default behavior
                key.returnValue = false;
            }
        }
    },

    updLstChr: function()
    { // blinking cursor
        var cont = this.content(); // get console
        if (cont.substring(cont.length - 1, cont.length) == "|") // if last char is the cursor
            $("#console").html($("#console").html().substring(0, cont.length - 1)); // remove it
        else
            this.write("|"); // else write it
    }
}

function getQuery(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++)
    {
        var pair = vars[i].split("=");
        if (pair[0] == variable)
        {
            return pair[1];
        }
    }
    return (false);
}
