import { HOTKEY_MODE } from './../state/minervaActions.mjs'

// keymap
// ctrl+z: undo
// ctrl+shift+z / ctrl+y: redo

export const setupHotkeys = minerva => {
  window.addEventListener('keydown', e => {
    const letter = e?.key.toLowerCase()

    if (e.repeat) return

    if (
      [...document.activeElement.classList].some(e =>
        ['color-display-input'].includes(e)
      )
    ) {
      return
    }

    if (!e.ctrlKey && !e.shiftKey) {
      if (letter === 'escape') {
        const modalContainer = document.querySelector(
          '.palette-modal-container'
        )

        modalContainer.classList.remove('palette-open')
      }
    }

    if (e.ctrlKey) {
      if (letter === 'z' && !e.shiftKey) {
        document.querySelector('.undo-color').focus()
        document.querySelector('.undo-color').click()
      }

      if (letter === 'y' || (letter === 'z' && e.shiftKey)) {
        document.querySelector('.redo-color').focus()
        document.querySelector('.redo-color').click()
      }
    }

    if (e.shiftKey && !e.ctrlKey) {
      if (letter === 'f') {
        if (minerva.get(HOTKEY_MODE) === 'foreground') {
          document.querySelector('.display-text-color').focus()
          document.querySelector('.display-text-color').click()
        }

        minerva.set(HOTKEY_MODE, 'foreground')
      }

      if (letter === 'r') {
        document.querySelector('.randomize-colors').focus()
        document.querySelector('.randomize-colors').click()
      }

      if (letter === 't') {
        document.querySelector('.clock').focus()
        document.querySelector('.clock').click()
      }

      if (letter === 's') {
        document.querySelector('.swap-colors').focus()
        document.querySelector('.swap-colors').click()
      }

      if (letter === 'e') {
        document.querySelector('.export-config').focus()
        document.querySelector('.export-config').click()
      }

      if (letter === 'b') {
        if (minerva.get(HOTKEY_MODE) === 'background') {
          document.querySelector('.display-background-color').focus()
          document.querySelector('.display-background-color').click()
        }

        minerva.set(HOTKEY_MODE, 'background')
      }

      if (letter === 'p') {
        minerva.set(HOTKEY_MODE, 'palette')
      }

      if (letter === 'd') {
        document.activeElement.blur()
        minerva.set(HOTKEY_MODE, 'default')
      }

      if (letter === '!') {
        const mode = minerva.get(HOTKEY_MODE)

        switch (mode) {
          case 'foreground':
            document.activeElement.blur()
            document.querySelector('.fg-hue').focus()
            break
          case 'background':
            document.activeElement.blur()
            document.querySelector('.bg-hue').focus()
            break
          default:
            return
        }
      }

      if (letter === '@') {
        const mode = minerva.get(HOTKEY_MODE)

        switch (mode) {
          case 'foreground':
            document.activeElement.blur()
            document.querySelector('.fg-saturation').focus()
            break
          case 'background':
            document.activeElement.blur()
            document.querySelector('.bg-saturation').focus()
            break
          default:
            return
        }
      }

      if (letter === '#') {
        const mode = minerva.get(HOTKEY_MODE)

        switch (mode) {
          case 'foreground':
            document.activeElement.blur()
            document.querySelector('.fg-lightness').focus()
            break
          case 'background':
            document.activeElement.blur()
            document.querySelector('.bg-lightness').focus()
            break
          default:
            return
        }
      }

      if (letter === 'x') {
        const mode = minerva.get(HOTKEY_MODE)

        switch (mode) {
          case 'foreground':
            document.querySelector('.lock-colors-fg').focus()
            document.querySelector('.lock-colors-fg').click()
            break
          case 'background':
            document.querySelector('.lock-colors-bg').focus()
            document.querySelector('.lock-colors-bg').click()
            break
          default:
            return
        }
      }

      if (letter === 'a') {
        const mode = minerva.get(HOTKEY_MODE)

        switch (mode) {
          case 'foreground':
            document.querySelector('.controls-add-to-palette-fg').focus()
            document.querySelector('.controls-add-to-palette-fg').click()
            break
          case 'background':
            document.querySelector('.controls-add-to-palette-bg').focus()
            document.querySelector('.controls-add-to-palette-bg').click()
            break
          default:
            return
        }
      }
    }
  })
}
