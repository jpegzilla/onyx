// ♪音楽 → SREZCAT - BOOK OF LAW : https://www.youtube.com/watch?v=_lPJvlCz9i4

const prefersDarkMode = () => {
  let dark = false

  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
    dark = true

  return dark
}

export const colorSchemeToUse = prefersDarkMode() ? 'dark' : 'light'
