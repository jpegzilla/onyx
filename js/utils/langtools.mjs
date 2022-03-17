export const getLang = () => {
  if (navigator.languages)
    return navigator.languages[0].toLowerCase().split('-')[0]

  return navigator.language
}

export const supportedLangs = {
  en: 'en',
  ja: 'ja',
}

export const translationToUse = supportedLangs[getLang()] || supportedLangs.en
