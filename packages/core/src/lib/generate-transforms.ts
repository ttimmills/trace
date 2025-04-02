import type { ImageTransformation, ImageConfig, TransformFactory, TransformFactoryContext, Logger } from '../types.js'
import { consoleLogger } from './logger.js'

export function generateTransforms(
  config: ImageConfig,
  factories: TransformFactory[],
  manualSearchParams: URLSearchParams,
  logger?: Logger
) {
  if (logger === undefined) {
    logger = consoleLogger
  }

  let transforms: ImageTransformation[] = []
  let parametersUsed = new Set<string>()

  let context: TransformFactoryContext = {
    useParam: (k) => parametersUsed.add(k),
    manualSearchParams,
    logger
  }

  for (let directive of factories) {
    let transform = directive(config, context)

    if (typeof transform === 'function') transforms.push(transform)
  }

  return {
    transforms,
    parametersUsed
  }
}
