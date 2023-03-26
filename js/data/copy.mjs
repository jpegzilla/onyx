export const footerCopy = {
  export:
    'export all your palettes and settings as a .json file for you to download. (ctrl+e)',
  import:
    'upload a .json file containing palettes and settings that you (or someone else) previously exported.',
  save: 'locally save all current palettes and settings to your color workspace library.',
  switch: 'switch between your saved color workspaces.',
  workspace: 'the name of the current color workspace.',
  workspaceType: 'the type of the current color workspace.',
  dark: "set onyx's interface theme to darker colors.",
  light: "set onyx's interface theme to lighter colors.",
  controls: "show a list of onyx's hotkeys.",
}

export const colorDisplayCopy = {
  conversionsHeader: 'conversions to other formats',
  analoguesHeader: 'close analogues from external color systems',
  contrastInformationHeader: 'contrast information',
  colorReadoutHeader: 'select color readout',
  backgroundReadoutButton: {
    title:
      'switches the color readout to the background color. (shift+b shift+b)',
    text: 'background',
  },
  foregroundReadoutButton: {
    title:
      'switches the color readout to the foreground color. (shift+f shift+f)',
    text: 'foreground',
  },
  colorConfigHeader: 'color config controls',
  randomizeButton: {
    text: 'randomize colors',
    title: 'changes the unlocked colors to random colors. (shift+r)',
    disabledTitle: 'both colors are locked. randomization disabled.',
  },
  swapButton: {
    text: 'swap colors',
    title: 'swaps foreground color with background color. (shift+s)',
    disabledTitle: 'at least one color is locked. swapping disabled.',
  },
  undoButton: {
    text: 'undo',
    title: 'undo a color operation. (ctrl+z)',
    disabledTitle: 'both colors are locked. undo disabled.',
    disabledTitleAlternate: 'undo would change a locked color. undo disabled.',
    disabledTitleAlternate2: 'no colors in history. undo disabled.',
  },
  redoButton: {
    text: 'redo',
    title: 'redo a color operation. (ctrl+shift+z)',
    disabledTitle: 'both colors are locked. redo disabled.',
    disabledTitleAlternate: 'nothing to redo. redo disabled.',
  },
}
