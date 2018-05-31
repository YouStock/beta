const { app, shell } = require('electron');
const { createWindow, setMenu } = require('./electron.shared.js');

const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

const finalWindow = (_win) => {
    win = _win;

    // set timeout to render the window not until the Angular 
    // compiler is ready to show the project
    setTimeout(() => {
        // and load the app.
        win.loadURL(url.format({
            pathname: 'localhost:4200',
            protocol: 'http:',
            slashes: true
        }));

        win.webContents.openDevTools();

        win.webContents.on('new-window', function(event, url){
            event.preventDefault();
            shell.openExternal(url);
        });

        setMenu();

    }, 10000);

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => createWindow(finalWindow));

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow(finalWindow);
    }
});
