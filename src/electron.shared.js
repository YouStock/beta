const { app, BrowserWindow, Menu, shell } = require('electron');
const { execFile, execFileSync, spawn } = require('child_process');

const path = require('path');
const url = require('url');
const fs = require('fs');

const untildify = require('untildify');
const net = require('net');
const defaultMenu = require('electron-default-menu');

const Web3 = require('web3');

let __YouStockTesting = true;

var gethIpc;
var bootnodes;
var genesis;
var chaindir;
var gethDir;
var gethPort = 47283; //TODO: make configurable

var gethNode;

const createWindow = (finalWindow) => {
    // Create the browser window.
    var win = new BrowserWindow({
        width: 1368,
        height: 800,
        icon: path.join(__dirname, 'favicon.ico'),
        title: "youstock"
    });

    global.__YouStockTesting = __YouStockTesting;

    gethDir = getGethDataDir();
    gethIpc = getGethIpc();
    global.ipcPath = gethIpc;
    bootnodes = getBootNodes();
    genesis = getGenesisFile();
    chaindir = path.join(gethDir, 'geth', 'chaindata');

    fs.access(chaindir, (err) => {
        if(err) { //chain dir doesn't exist, init genesis
            console.log('initializing geth');
            console.log(path.join(__dirname, 'assets', 'exe', 'geth'));
            console.log(execFileSync(
                getGethExe(), 
                ['--datadir', gethDir, 'init', genesis], 
                { windowsHide: true }
            ));
        } 
        finishWindow(finalWindow, win);

    });
};

const checkIpc = (_ipcPath, retry, time, cb) => {
    fs.access(_ipcPath, (err) => {
        if(!err)
            cb();
        else {
            if(retry < 6) {
                console.log('looking for geth ipc: retry #' + retry.toString());
                setTimeout(() => checkIpc(_ipcPath, retry + 1, (retry + 1) * 1000, cb), time);
            }
            else
                cb('Unable to find geth ipc at ' + _ipcPath);
        }
    });
};

const startGeth = (finalWindow, win) => {
    console.log('starting geth');
    //gethNode = execFile(
    console.log(getGethExe());
    gethNode = spawn(
        getGethExe(), 
        ['--datadir', gethDir, '--bootnodes',  bootnodes, '--ipcpath', gethIpc, '--port', '30301'], 
        { 
            windowsHide: true, 
            //maxBuffer: 1024 * 50000 // 50 MB bufferv
        } 
        //    ,(ex, out, er) => { if (ex) throw ex; console.log(out); console.error(err); }
    );

    //handle geth output
    gethNode.stdout.pipe(process.stdout);
    gethNode.stderr.pipe(process.stderr);

    //wait until geth ipc is found
    checkIpc(gethIpc, 1, 2000, (err) => {
        if(err)
            console.error(err);
        else
            finalWindow(win);
    });
}

const finishWindow = (finalWindow, win) => {
    fs.access(gethIpc, (err) => {
        if(err) { //ipc file doesn't exist, start a node
            startGeth(finalWindow, win); 
        } else {
            //try to connect to geth.ipc, if it fails, delete it and try to start a geth node
            var web3 = new Web3(new Web3.providers.IpcProvider(gethIpc, net));
            web3.eth.getBlockNumber((e,r) => {
                if(e)
                {
                    console.log(e);
                    console.log('could not connect to existing geth ipc, delete it and start a new node');
                    fs.unlink(gethIpc, e => {
                        if(e) console.log(e);
                        else startGeth(finalWindow, win);
                    });
                } else {
                    console.log('connected to existing geth.ipc file');
                    finalWindow(win);
                }
            });
        }
    });
};

const setMenu = () => {
    const menu = defaultMenu(app, shell);
    menu[0].label = 'YouStock';
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

//TODO: might need to be platform specific, might need to change for packaging
//TODO: look for common geth locations?
const getGethExe = () => {
    return path.join(__dirname, 'assets', 'exe', 'geth');
}

const getGethDataDir = () => {
    function __innerFunc() {
        if(process.platform == 'darwin')
            return untildify('~/Library/Aura');
        if(process.platform == 'win32')
            return untildify('~/AppData/Roaming/Aura');
        return untildify('~/.aura'); 
    }

    if(__YouStockTesting)
        return path.join(__innerFunc(), 'test');
    else
        return __innerFunc();
}

const getGethIpc = () => {
    if(process.platform == 'win32') {
        if(__YouStockTesting) {
            return '\\\\.\\pipe\\auratest';
        } else {
            return '\\\\.\\pipe\\aura';
        }
    } else {
        return path.join(gethDir, 'aura.ipc');
    }
}

const getBootNodes = () => {
    if(__YouStockTesting)
        return testbootnodes;
    else
        throw 'mainnet bootnodes Not implemented!!!';
}

const getGenesisFile = () => {
    if(__YouStockTesting)
        return path.join(__dirname, 'assets', 'test_genesis.json');
    return path.join(__dirname, 'assets', 'genesis.json');
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if(gethNode) {
        gethNode.kill();
        console.log('killing geth');
    }
});

const testbootnodes = 'enode://bc44cc7123bbf01d265ee0350ce240394a2ca5dfb54c36de747b949317e1bedd6ad17b5caa8d8f26f7ebcbcb092e97ea23cf05c45b8a3d4b96e0ead522350d6b@13.78.132.188:30303';

module.exports = {
    createWindow: createWindow,
    setMenu: setMenu
};
