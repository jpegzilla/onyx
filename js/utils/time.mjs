// ♪音楽 → ZOC - A INNOCENCE PvP : https://www.youtube.com/watch?v=Ugc40x47JkA
import { html } from './../utils/index.mjs'

/**
 * outputs current time and flavor text based on the date / time
 * @param  {HTMLElement} clockElement element to print text in
 * @param  {Minerva}     minerva      an instance of minerva
 * @returns void
 */
export const handleClock = (clockElement, minerva) => {
  const setTime = () => {
    let hour = new Date().getHours().toString()
    const minute = new Date().getMinutes().toString()

    if (minerva.get('timeFormat') === '12hr') {
      hour = (((parseInt(hour) + 11) % 12) + 1).toString()
    }

    const timeString = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

    const hours = new Date().getHours()
    const isEarlyMorning = hours.between(5, 8, false, true)
    const isMorning = hours.between(8, 12, false, true)
    const isNoon = hours === 12
    const isAfterNoon = hours.between(12, 16, false, true)
    const isLateAfterNoon = hours.between(16, 18, false, true)
    const isEarlyEvening = hours.between(18, 19, false, true)
    const isEvening = hours.between(19, 20, false, true)
    const isNight = hours.between(20, 23, false, true)
    const isMidNight = hours === 0
    const isVeryLate = hours.between(0, 5, false, true)
    const dayIndex = new Date().getDay()
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const day = days[dayIndex]

    let timeDivision = ''

    switch (true) {
      case isEarlyMorning:
        timeDivision = 'early morning.'
        break

      case isMorning:
        timeDivision = 'morning.'
        break

      case isNoon:
        timeDivision = 'midday.'
        break

      case isAfterNoon:
        timeDivision = 'afternoon.'
        break

      case isLateAfterNoon:
        timeDivision = 'late afternoon.'
        break

      case isEarlyEvening:
        timeDivision = 'early evening.'
        break

      case isEvening:
        timeDivision = 'evening.'
        break

      case isNight:
        timeDivision = 'night.'
        break

      case isMidNight:
        timeDivision = 'dead of night.'
        break

      case isVeryLate:
        timeDivision = 'quite late.'
        break
    }

    clockElement.innerHTML = html`${day}. ${timeString} &mdash;
      <span class="time-division">${timeDivision}</span>`
  }

  setTime(), setInterval(() => setTime(), 500)
}

/**
 * outputs greeting flavor text based on the date / time
 * @param  {HTMLElement} greetingElement element to print text in
 * @param  {Minerva}     minerva         an instance of minerva
 * @returns void
 */
export const handleGreeting = (greetingElement, minerva) => {
  const setGreeting = () => {
    const timesArrived = minerva.get('arrivals')
    const month = new Date().getMonth() + 1
    const day = new Date().getDate()
    let greeting

    switch (true) {
      case month === 10 && day.between(30, 31, true):
        greeting = 'happy halloween!'
        break

      case month === 12 && day.between(25, 26, true):
        greeting = 'merry christmas!'
        break

      case month === 5 && day === 1:
        greeting = "today is jpegzilla's birthday!"
        break

      case month === 4 && day === 6:
        greeting = "today is my wife's birthday!"
        break

      case month === 3 && day.between(19, 21, true):
        greeting = 'happy spring equinox!'
        break

      case month === 6 && day.between(20, 22, true):
        greeting = 'happy summer solstice!'
        break

      case month === 9 && day.between(22, 24, true):
        greeting = 'happy autumn equinox!'
        break

      case month === 12 && day.between(20, 22, true):
        greeting = 'happy winter solstice!'
        break

      case month === 1 && day.between(1, 3, true):
        greeting = 'happy new year!'
        break

      case timesArrived <= 1:
        greeting = 'welcome to onyx.'
        break

      case timesArrived.between(1, 10):
        greeting = 'welcome back.'
        break

      case timesArrived.between(10, 30, false, true):
        greeting = "it's good to see you."
        break

      // TODO: write more flavor text for this
      case timesArrived > 30:
        greeting = "it's good to see you."
        break

      default:
        greeting = 'hello!'
    }

    greetingElement.textContent = greeting
  }

  setGreeting(), setInterval(() => setGreeting(), 60000)
}
