// ♪音楽 → GRAPHIQSGROOVE - DEEPSKYBLUE : https://www.youtube.com/watch?v=rcVFtuxx-YA

import Component from './component.mjs'
import { html, handleClock } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

class Header extends Component {
  constructor() {
    super()

    this.name = 'onyx-header'
    this.id = 'onyx-header'
    this.twelveHourTime = false
  }

  get greeting() {
    const timesArrived = minerva.get('arrivals')

    switch (true) {
      case timesArrived <= 1:
        return 'welcome to onyx.'

      case timesArrived > 1:
        return 'welcome back.'

      case timesArrived > 10:
        return "it's good to see you."

      // TODO: write more flavor text for this
      case timesArrived > 30:
        return "it's good to see you."
    }

    return 'hello!'
  }

  connectedCallback() {
    this.innerHTML = html`
      <header>
        <div class="header-logo">
          <onyx-logo />
        </div>
        <div class="header-wordmark">
          onyx <span class="fade">chromatics research system</span>
        </div>
        <b></b>
        <div class="header-status-info">
          <span class="clock"
            >00:00:00 &mdash;
            <span class="time-division">dead of night.</span></span
          >
          <span class="greeting">${this.greeting}</span>
        </div>
      </header>
      <b class="border-bottom"></b>
    `

    this.querySelector('.clock').addEventListener('click', () => {
      if (this.twelveHourTime) {
        minerva.set('timeFormat', '24hr')
        this.twelveHourTime = false
      } else {
        minerva.set('timeFormat', '12hr')
        this.twelveHourTime = true
      }

      handleClock(this.querySelector('.clock'), minerva)
    })

    handleClock(this.querySelector('.clock'), minerva)
  }
}

export default { name: 'onyx-header', element: Header }
