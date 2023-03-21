const { ipcRenderer } = require('electron')

// Notifier
const notifier = require('node-notifier');
export const notify = (title, message) => {
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
    notifier.on('click', () => {
        ipcRenderer.send('showMainWindow')
    });
}