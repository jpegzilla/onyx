import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'
import { footerCopy } from './../data/copy.mjs'

class Footer extends Component {
  constructor() {
    super()

    this.name = 'onyx-footer'
    this.id = 'onyx-footer'
  }

  connectedCallback() {
    minerva.workspaceName = 'onyx'

    this.innerHTML = html`
      <b class="border-top"></b>
      <footer>
        <div class="workspace-info">
          <button
            class="workspace-name workspace-attr"
            aria-description="${footerCopy.workspace}"
          >
            workspace: ${minerva.workspaceName}
          </button>
          <button
            class="workspace-type workspace-attr"
            aria-description="${footerCopy.workspaceType}"
          >
            type: ${minerva.workspaceType}
          </button>
        </div>

        <button aria-description="${footerCopy.export}">export</button>
        <button aria-description="${footerCopy.import}">import</button>
        <button aria-description="${footerCopy.save}">save</button>
        <button aria-description="${footerCopy.switch}">switch</button>
        <b></b>
        <div class="footer-attribution">
          made by
          <a
            href="https://jpegzilla.com"
            target="_blank"
            rel="noreferrer noopener"
            >jpegzilla</a
          >
        </div>
      </footer>
    `
  }
}

export default { name: 'onyx-footer', element: Footer }