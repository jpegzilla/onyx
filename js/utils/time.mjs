export const handleClock = (clockElement, minerva) => {
  setInterval(() => {
    let hour = new Date().getHours().toString()
    const minute = new Date().getMinutes().toString()

    if (minerva.get('timeFormat') === '12hr') {
      hour = (((parseInt(hour) + 11) % 12) + 1).toString()
    }

    const timeString = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

    const hours = new Date().getHours()
    const isEarlyMorning = hours > 5 && hours < 8
    const isMorning = hours >= 8 && hours < 12
    const isNoon = hours === 12
    const isAfterNoon = hours > 12 && hours < 16
    const isLateAfterNoon = hours >= 16 && hours < 17
    const isEarlyEvening = hours >= 17 && hours < 18
    const isEvening = hours >= 18 && hours < 20
    const isNight = hours >= 20 && hours < 23
    const isMidNight = hours === 0
    const isVeryLate = hours > 0 && hours < 5
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

    clockElement.innerHTML = `${day}. ${timeString} &mdash; ${timeDivision}`
  }, 500)
}
