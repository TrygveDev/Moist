const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const notifier = require('node-notifier');

let dailyGoal;
let remindToDrink;
let remindedInterval;
let startMinimized;
let startWhenPcStarts;

ipcRenderer.invoke('getSettings', "wow").then((result) => {
    console.log(result)
    dailyGoal = result.goal
    remindToDrink = result.remindToDrink
    remindedInterval = result.remindToDrinkInterval
    startMinimized = result.startMinimized
    startWhenPcStarts = result.startOnStartup

    document.getElementById('dailyGoalSetting').value = dailyGoal
    document.getElementById('remindToDrinkSetting').checked = remindToDrink
    document.getElementById('remindedIntervalSetting').value = remindedInterval
    document.getElementById('startMinimizedSetting').checked = startMinimized
    document.getElementById('startWhenPcStartsSetting').checked = startWhenPcStarts
    document.getElementById('goalml').textContent = dailyGoal
    updateProgress()
    console.log("settings loaded!")
})

// Settings
function saveSettings() {
    let dailyGoalSetting = document.getElementById('dailyGoalSetting').value
    let remindToDrinkSetting = document.getElementById('remindToDrinkSetting').checked
    let remindedIntervalSetting = document.getElementById('remindedIntervalSetting').value
    let startMinimizedSetting = document.getElementById('startMinimizedSetting').checked
    let startWhenPcStartsSetting = document.getElementById('startWhenPcStartsSetting').checked
    document.getElementById('goalml').textContent = dailyGoalSetting

    ipc.send('saveSettings', [dailyGoalSetting, remindToDrinkSetting, remindedIntervalSetting, startMinimizedSetting, startWhenPcStartsSetting])
}

// Menu Events
document.getElementById('xmark').addEventListener('click', () => {
    ipc.send('hideMainWindow')
    notify('Moist will continue to run in the background!', 'You can access it by clicking the tray icon.')
})

document.getElementById('gear').onclick = () => {
    document.getElementById('settings').classList.toggle('hidden')
    document.getElementById('home').classList.toggle('hidden')
    document.getElementById('homemark').classList.toggle('hidden')
    document.getElementById('settingsmark').classList.toggle('hidden')
    saveSettings()
}

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

// Update progress
function updateProgress() {
    let current = document.getElementById('progressml').textContent
    let total = document.getElementById('goalml').textContent
    let progressPercentage = (current / total) * 100;
    if (progressPercentage > 9999) {
        progressPercentage = 9999
    }
    document.getElementById('progress-percent').textContent = progressPercentage.toFixed(0) + '%'
    document.getElementById('progress').style.setProperty("--percent", `${progressPercentage}%`);
}
updateProgress()

// Add drink
function addDrink(amount) {
    let current = document.getElementById('progressml').textContent
    let newProgress = parseInt(current) + amount
    document.getElementById('progressml').textContent = newProgress
    updateProgress()
}

document.getElementById('drop').onclick = () => {
    addDrink(250)
}
document.getElementById('glass').onclick = () => {
    addDrink(500)
}
document.getElementById('bottle').onclick = () => {
    addDrink(750)
}
document.getElementById('bucket').onclick = () => {
    addDrink(1000)
}

// Notifcation loop
// Reset the notification timer if water has been changed

const sentences = [
    "It's time to take a drink!",
    "Go get a glass of water!",
    "Hey! Drink some water!",
    "Drink now to reach your goal!",
    "Drinking reminder! Get some water!"
]
setInterval(() => {
    let current = document.getElementById('progressml').textContent
    let total = document.getElementById('goalml').textContent
    notify(`${sentences[Math.floor(Math.random() * sentences.length)]} ${current}ml/${total}ml`, `${current}ml/${total}ml`)
}, 90 * 60 * 1000);