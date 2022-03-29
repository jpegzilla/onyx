// ♪音楽 → GRAPHIQSGROOVE - DEEPSKYBLUE : https://www.youtube.com/watch?v=rcVFtuxx-YA

import Component from './component.mjs'
import { html, handleClock } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

class Header extends Component {
  constructor() {
    super()

    this.name = 'onyx-header'
    this.id = 'onyx-header'
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
          <span class="clock">00:00:00 &mdash; dead of night.</span>
          <span class="greeting">${this.greeting}</span>
        </div>
      </header>
    `

    handleClock(this.querySelector('.clock'))
  }
}

export default { name: 'onyx-header', element: Header }
