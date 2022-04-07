const { app, BrowserWindow, ipcMain, screen, dialog, Menu } = require('electron')

var win_global;
function createWindow () {
    var screen_width = screen.getPrimaryDisplay().workAreaSize.width;
    var window_width = 320;
    const win = new BrowserWindow({
        width: window_width,
        height: 350,
        minWidth: 300,
        minHeight: 233,
        maxWidth: window_width + 128,
        maxHeight: 1040,
        x: screen_width - window_width,
        y: 0,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: "./icon.ico",
    })

    win.loadFile('./src/index.html');
    win_global = win;
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('close', e=> {
    app.quit();
});
ipcMain.on('minimize', e=> win_global.minimize());

ipcMain.on('set_top', e=> win_global.setAlwaysOnTop(true, "pop-up-menu"));
ipcMain.on('unset_top', e=> win_global.setAlwaysOnTop(false));

ipcMain.on('password_window_open', e=>{
    const password_window = new BrowserWindow({
        width: 300,
        height: 80,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: "./icon.ico",
    })
    password_window.loadFile("./src/password.html");
    password_window.setMenu(null);
})
var manage_window_global;
ipcMain.on('manage_window_open', e=>{
    const manage_window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: "./icon.ico",
    })
    manage_window.loadFile("./src/manage.html");

    const manage_window_menu = Menu.buildFromTemplate([
        {
            label: "窗口",
            submenu: [
                { label: "重新加载管理页面", click: () => { manage_window.reload(); } },
                { label: "重新加载主页面", click: () => { win_global.reload(); } },
                { label: "重新启动程序", click: () => { app.relaunch(); app.quit(); } },
                { type: 'separator' },
                { label: "退出管理页面", click: () => { manage_window.close(); } },
                { label: "退出程序", click: () => { app.quit(); } },
            ]
        }
    ])
    manage_window.setMenu(manage_window_menu);
    manage_window_global = manage_window;
})
ipcMain.on('open_new_window', function(e, arg) {
    const new_window = new BrowserWindow(arg[0]);
    new_window.loadFile(arg[1]);
    new_window.setMenu(null);
})

ipcMain.on('reload', e=>{
    win_global.reload();
})
ipcMain.on('toggle_devtools', e=>{
    manage_window_global.webContents.toggleDevTools();
})
ipcMain.on('open_dialog', function(e, arg){
    dialog.showMessageBoxSync(win_global, arg);
})

ipcMain.on('relaunch_app', function(e, arg){
    app.relaunch();
    app.quit();
})