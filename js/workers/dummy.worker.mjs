try {
  import('./dummy.mjs')
    .then(() => self.postMessage('no error'))
    .catch(() => {
      self.postMessage('error')
    })
} catch {}
