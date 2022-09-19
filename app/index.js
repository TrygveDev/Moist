const { ipcRenderer, app } = require('electron')
const ipc = ipcRenderer
const notifier = require('node-notifier');
const path = require('path')

// Menu Events
document.getElementById('xmark').addEventListener('click', () => {
    ipc.send('hideMainWindow')
})

document.getElementById('settings').addEventListener('click', () => {

})

// Notification
function notify(title, message) {
    notifier.notify(
        {
            title: title,
            message: message,
            icon: __dirname + `/app/images/icon.png`, // Absolute path (doesn't work on balloons)
            appID: 'Moist',
            sound: true, // Only Notification Center or Windows Toasters
            wait: false // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        },
        (err) => { if (err) console.log(err) }
    );
}
notifier.on('click', () => {
    ipc.send('showMainWindow')
});
// notify('Moist', 'I will remind you when to drink!')

