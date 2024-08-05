import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  mode: 'production',
  entry: './js/main.mjs',
  output: {
    filename: 'main.min.js',
    path: path.resolve(__dirname, 'js'),
  },
  watch: true,
  watchOptions: {
    stdin: true,
    ignored: /node_modules/,
  },
}
