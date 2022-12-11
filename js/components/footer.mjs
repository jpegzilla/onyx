import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva, env } from './../main.mjs'
import { footerCopy } from './../data/copy.mjs'

class Footer extends Component {
  static name = 'onyx-footer'

  constructor() {
    super()

    this.id = Footer.name
  }

  setStatus(status) {
    this.querySelector('.status-indicator')
  }

  connectedCallback() {
    minerva.workspaceName = 'onyx'

    const currentStatus = 'idle'

    this.innerHTML = html`
      <b class="border-top"></b>
      <footer>
        <div class="footer-controls">
          <div class="options-selector">
            <span class="fade">data</span>
            <button title="${footerCopy.export}">export</button>
            <button title="${footerCopy.import}">import</button>
          </div>

          <div class="options-selector">
            <span class="fade">workspace</span>
            <button title="${footerCopy.save}">save</button>
            <button title="${footerCopy.switch}">switch</button>
          </div>
        </div>
        <b></b>
        <div class="status-indicator">
          <span class="status-indicator-label">status</span>
          <span class="status-indicator-message">${currentStatus}</span>
        </div>
        <b></b>
        <div class="footer-attribution">
          <span>
            made by
            <a
              href="https://jpegzilla.com"
              target="_blank"
              rel="noreferrer noopener"
              >jpegzilla</a
            >
          </span>
          <span>&middot;</span>
          <a
            href="https://github.com/jpegzilla/onyx"
            target="_blank"
            rel="noreferrer noopener"
            >source code</a
          >
          <span>&middot;</span>
          ver. ${env.ONYX_VERSION}
        </div>
      </footer>
    `
  }
}

export default { name: Footer.name, element: Footer }
