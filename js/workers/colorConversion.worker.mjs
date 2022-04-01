self.onmessage = message => {
  const { data } = message

  console.log(data)

  self.postMessage({})
}
