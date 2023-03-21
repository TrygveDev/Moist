const { ipcRenderer } = require('electron')
import { notify } from "./functions/notifier.js";
import { startReminder } from "./functions/reminder.js";

// notify('Moist', 'I will remind you when to drink!')

let dailyGoal;
let remindToDrink;
let remindedInterval;
let startMinimized;
let startWhenPcStarts;
let drinked;
let interval;

function loadSettings() {
    ipcRenderer.invoke('getSettings', "wow").then((result) => {
        if (remindedInterval != result.remindToDrinkInterval) startReminder(result.remindToDrinkInterval) // If interval changed, restart reminder

        dailyGoal = result.goal
        remindToDrink = result.remindToDrink
        remindedInterval = result.remindToDrinkInterval
        startMinimized = result.startMinimized
        startWhenPcStarts = result.startOnStartup

        if (result.lastDrinked === new Date().toLocaleDateString().toString()) {
            drinked = result.drinked
            console.log(result.drinked)
        } else {
            ipcRenderer.send('resetDrinked')
            drinked = 0
        }


        console.log(result.goal)
        console.log(dailyGoal)
        document.getElementById('dailyGoalSetting').value = dailyGoal
        document.getElementById('remindToDrinkSetting').checked = remindToDrink
        document.getElementById('remindedIntervalSetting').value = remindedInterval
        document.getElementById('startMinimizedSetting').checked = startMinimized
        document.getElementById('startWhenPcStartsSetting').checked = startWhenPcStarts
        document.getElementById('goalml').textContent = dailyGoal
        document.getElementById('progressml').textContent = drinked

        console.log("Loaded!")
        updateProgress()
    })
}
loadSettings()



// Settings
function saveSettings() {
    let dailyGoalSetting = document.getElementById('dailyGoalSetting').value
    let remindToDrinkSetting = document.getElementById('remindToDrinkSetting').checked
    let remindedIntervalSetting = document.getElementById('remindedIntervalSetting').value
    let startMinimizedSetting = document.getElementById('startMinimizedSetting').checked
    let startWhenPcStartsSetting = document.getElementById('startWhenPcStartsSetting').checked

    dailyGoal = dailyGoalSetting
    remindToDrink = remindToDrinkSetting
    remindedInterval = remindedIntervalSetting
    startMinimized = startMinimizedSetting
    startWhenPcStarts = startWhenPcStartsSetting

    ipcRenderer.send('saveSettings', [dailyGoalSetting, remindToDrinkSetting, remindedIntervalSetting, startMinimizedSetting, startWhenPcStartsSetting])
    if (interval) clearInterval(interval)
    loadSettings()
}

// Menu Events
// Close Button
document.getElementById('xmark').addEventListener('click', () => {
    ipcRenderer.send('hideMainWindow')
    notify('Moist will continue to run in the background!', 'You can access it by clicking the tray icon.')
})
document.getElementById('gear').onclick = () => {
    document.getElementById('settings').classList.toggle('hidden')
    document.getElementById('home').classList.toggle('hidden')
    document.getElementById('homemark').classList.toggle('hidden')
    document.getElementById('settingsmark').classList.toggle('hidden')
    saveSettings()
}


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
// TODO: remove drinks
function addDrink(amount) {
    let current = document.getElementById('progressml').textContent
    let newProgress = parseInt(current) + amount
    document.getElementById('progressml').textContent = newProgress
    ipcRenderer.send('setLastDrinked', new Date().toLocaleDateString().toString())
    ipcRenderer.send('drinked', amount)
    updateProgress()
}
function removeDrink(amount) {
    let current = document.getElementById('progressml').textContent
    let newProgress = parseInt(current) - amount
    document.getElementById('progressml').textContent = newProgress
    ipcRenderer.send('removeDrinked', amount)
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
document.getElementById('minus').onclick = () => {
    if (document.getElementById('progressml').textContent <= 0) return
    removeDrink(250)
}

