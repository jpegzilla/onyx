import Component from './component.mjs'
import { html } from './../utils/index.mjs'
import { minerva, arachne } from './../main.mjs'
import { STATUS, EXTERNAL_UPDATE } from './../utils/state/minervaActions.mjs'

class DropTarget extends Component {
  static name = 'onyx-drop-target'

  constructor() {
    super()

    this.id = DropTarget.name
  }

  connectedCallback() {
    this.innerHTML = html`<section class="drop-target-container">
      drop configuration json files here. this will overwrite all your data.
    </section>`

    const main = document.querySelector('main')

    main.addEventListener('dragover', e => {
      e.preventDefault()

      this.addClass('drag-over')
    })

    const removeDragoverClass = e => {
      e.stopPropagation()
      e.preventDefault()

      if (!main.contains(e.target)) this.removeClass('drag-over')
    }

    main.addEventListener('dragleave', removeDragoverClass)
    main.addEventListener('dragend', removeDragoverClass)

    const handleFileDrop = async e => {
      e.preventDefault()
      e.stopPropagation()
      this.removeClass('drag-over')

      try {
        let file

        if (e.dataTransfer.items.length) {
          const item = e.dataTransfer.items[0]

          if (item.kind === 'file') {
            file = item.getAsFile()
          }
        } else {
          file = e.dataTransfer.files[0]
        }

        if (!file) {
          arachne.warn('no file available in DropTarget.')
          return
        }

        minerva.set(STATUS, 'working')

        const text = await file.text()

        minerva.set(STATUS, 'idle')

        minerva.importConfig(text)
        minerva.set(EXTERNAL_UPDATE, 'import')
      } catch {
        this.removeClass('drag-over')
      }
    }

    main.addEventListener('drop', handleFileDrop)
  }
}

export default { name: DropTarget.name, element: DropTarget }
