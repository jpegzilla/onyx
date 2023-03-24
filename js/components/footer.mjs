import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva, env, arachne } from './../main.mjs'
import { footerCopy } from './../data/copy.mjs'

const STATUS = 'status'
const EXTERNAL_UPDATE = 'externalUpdate'
const HOTKEY_MODE = 'hotkeyMode'

class Footer extends Component {
  static name = 'onyx-footer'

  constructor() {
    super()

    this.id = Footer.name
  }

  setStatus(status) {
    const statusIndicator = this.qs('.status-indicator-message')

    statusIndicator.textContent = status
  }

  connectedCallback() {
    minerva.workspaceName = 'onyx'

    const currentStatus = minerva.get(STATUS)

    minerva.on(STATUS, s => this.setStatus(s))

    this.innerHTML = html`
      <b class="border-top"></b>
      <footer>
        <div class="footer-controls">
          <div class="options-selector">
            <span class="fade">data</span>
            <button title="${footerCopy.export}" class="export-config">
              export
            </button>
            <label for="configuration-upload" title="${footerCopy.import}"
              >import</label
            >

            <input
              type="file"
              id="configuration-upload"
              class="import-config-input"
              accept=".json"
            />
          </div>

          <!-- <div class="options-selector">
            <span class="fade">workspace</span>
            <button title="${footerCopy.save}">save</button>
            <button title="${footerCopy.switch}">switch</button>
          </div> -->

          <div class="options-selector">
            <span class="fade">show</span>
            <button title="${footerCopy.controls}" class="show-controls">
              controls
            </button>
          </div>

          <div class="options-selector noselect">
            <span class="fade">mode</span>
            <span class="hotkey-mode">${minerva.get(HOTKEY_MODE)}</span>
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

    const exportButton = this.qs('.export-config')
    const importButton = this.qs('.import-config-input')
    const hotkeyMode = this.qs('.hotkey-mode')

    minerva.on(HOTKEY_MODE, e => {
      hotkeyMode.textContent = e
    })

    exportButton.addEventListener('click', () => {
      minerva.set(STATUS, 'working')

      const config = minerva.exportConfig()

      const data = new Blob([config], {
        type: 'application/json;charset=utf-8',
      })
      const link = document.createElement('a')

      link.style = 'display: none'
      document.body.appendChild(link)
      link.download = `onyx-configuration-${new Date()
        .toLocaleString()
        .toLowerCase()}.json`
      link.href = URL.createObjectURL(data)

      link.click()

      URL.revokeObjectURL(data)
      link.remove()

      minerva.set(STATUS, 'idle')
    })

    importButton.addEventListener('change', e => {
      minerva.set(STATUS, 'waiting')

      let file

      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader()

        reader.onload = e => {
          file = e.target.result

          minerva.set(STATUS, 'idle')

          try {
            minerva.importConfig(file)
            minerva.set(EXTERNAL_UPDATE, 'import')
          } catch (e) {
            arachne.error('error reading uploaded configuration file.')
          }
        }

        reader.readAsText(e.target.files[0])
      }
    })
  }
}

export default { name: Footer.name, element: Footer }
