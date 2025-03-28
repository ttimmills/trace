import type { TransformFactory } from '../types.js'
import { METADATA } from '../lib/metadata.js'
import { getBackground } from './background.js'

export interface RotateOptions {
  rotate: string
}

export let rotate: TransformFactory<RotateOptions> = (config) => {
  let rotate = config.rotate && parseInt(config.rotate)

  if (!rotate) return

  return function rotateTransform(image) {
    image[METADATA].rotate = rotate

    return image.rotate(rotate, {
      background: getBackground(config, image)
    })
  }
}
