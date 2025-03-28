import type { Logger } from '../types.js'

export let consoleLogger: Logger = {
  info(msg) {
    console.info(msg)
  },
  warn(msg) {
    console.warn(msg)
  },
  error(msg) {
    console.error(msg)
  }
}
