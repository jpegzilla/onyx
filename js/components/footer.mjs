import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import { footerCopy } from './../data/copy.mjs'

class Footer extends Component {
  static name = 'onyx-footer'

  constructor() {
    super()

    this.id = Footer.name
  }

  connectedCallback() {
    minerva.workspaceName = 'onyx'

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
        <div class="footer-attribution">
          made by
          <a
            href="https://jpegzilla.com"
            target="_blank"
            rel="noreferrer noopener"
            >jpegzilla</a
          >
          <span>&middot;</span>
          <a
            href="https://github.com/jpegzilla/onyx"
            target="_blank"
            rel="noreferrer noopener"
            >source code</a
          >
          <span>&middot;</span>
          <b></b>
        </div>
      </footer>
    `
  }
}

export default { name: Footer.name, element: Footer }
