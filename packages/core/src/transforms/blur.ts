import type { TransformFactory } from '../types.js'
import { METADATA } from '../lib/metadata.js'

export interface BlurOptions {
  blur: string
}

export var blur: TransformFactory<BlurOptions> = (config) => {
  const blur: number | boolean | undefined = undefined

  blur = config.blur ? parseFloat(config.blur) : undefined
  blur ||= config.blur === 'true'
  blur ||= config.blur === ''

  if (!blur) return

  return function blurTransform(image) {
    image[METADATA].blur = blur

    return image.blur(blur)
  }
}
