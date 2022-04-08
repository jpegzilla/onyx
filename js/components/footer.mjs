import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva } from './../main.mjs'

const copy = {
  export:
    'exports all your palettes, and settings as a .json file for you to download.',
  import:
    'allows you to upload a json file containing palettes and settings you (or someone else) previously exported',
  save: 'allows you to locally save all current palettes and settings to your color workspace library.',
  switch: 'allows you to switch between your saved color workspaces.',
  workspace: 'the name of the current color workspace.',
  workspaceType: 'the type of the current color workspace.',
}

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
          <div
            class="workspace-name workspace-attr"
            aria-description="${copy.workspace}"
          >
            workspace: ${minerva.workspaceName}
          </div>
          <div
            class="workspace-type workspace-attr"
            aria-description="${copy.workspaceType}"
          >
            type: ${minerva.workspaceType}
          </div>
        </div>

        <button aria-description="${copy.export}">export</button>
        <button aria-description="${copy.import}">import</button>
        <button aria-description="${copy.save}">save</button>
        <button aria-description="${copy.switch}">switch</button>
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
