import { notify } from './notifier.js'

// Reminder
let interval;
export const startReminder = (remindedInterval) => {
    const sentences = [
        "It's time to take a drink!",
        "Go get a glass of water!",
        "Hey! Drink some water!",
        "Drink now to reach your goal!",
        "Drinking reminder! Get some water!"
    ]

    if (remindedInterval) clearInterval(interval) // Make sure only one interval is running
    if (remindedInterval < 1) remindedInterval = 1; // Min 1 minute
    interval = setInterval(() => {
        let current = document.getElementById('progressml').textContent
        let total = document.getElementById('goalml').textContent
        if (current >= total) return // If goal is reached dont notify
        notify(`${sentences[Math.floor(Math.random() * sentences.length)]}`, `${current}ml/${total}ml`)
    }, remindedInterval * 60 * 1000);
}