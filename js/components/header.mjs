// ♪音楽 → GRAPHIQSGROOVE - DEEPSKYBLUE : https://www.youtube.com/watch?v=rcVFtuxx-YA

import Component from './component.mjs'
import { html, handleClock, handleGreeting } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

class Header extends Component {
  static name = 'onyx-header'

  constructor() {
    super()

    this.id = Header.name
    this.twelveHourTime = false
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
        <div class="easteregg"></div>
        <b></b>
        <div class="header-status-info">
          <span
            class="clock"
            title="click to switch between 12 and 24 hour time."
            >xxx. 00:00 &mdash;
            <span class="time-division">dead of night.</span></span
          >
          <span class="greeting"></span>
        </div>
        <b class="chronocolorimeter"></b>
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

      handleClock(this.qs('.clock'), minerva)
    })

    handleClock(this.qs('.clock'), minerva)
    handleGreeting(this.qs('.greeting'), minerva)

    minerva.on('headerEasterEgg', egg => {
      this.qs('.easteregg').textContent = egg
    })
  }
}

export default { name: 'onyx-header', element: Header }
