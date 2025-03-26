import { basename, extname } from 'node:path'
import { statSync, mkdirSync, createReadStream } from 'node:fs'
import { writeFile, readFile, opendir, stat, rm } from 'node:fs/promises'
import type { Plugin, ResolvedConfig } from 'vite'
import {
  applyTransforms,
  builtins,
  builtinOutputFormats,
  extractEntries,
  generateTransforms,
  getMetadata,
  parseURL,
  urlFormat,
  resolveConfigs,
  type Logger,
  type OutputFormat,
  type ProcessedImageMetadata,
  type ImageMetadata
} from 'imagetools-core'
import { createFilter, dataToEsm } from '@rollup/pluginutils'
import sharp, { type Metadata, type Sharp } from 'sharp'
import { createBasePath, generateImageID, hash } from './utils.js'
import type { VitePluginOptions } from './types.js'

export type {
  Include,
  Exclude,
  DefaultDirectives,
  ExtendTransforms,
  ExtendOutputFormats,
  ResolveConfigs,
  VitePluginOptions
} from './types.js'

var defaultOptions: VitePluginOptions = {
  include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/,
  exclude: 'public/**/*',
  removeMetadata: true
}

export * from 'imagetools-core'

export function imagetools(userOptions: Partial<VitePluginOptions> = {}): Plugin {
  var pluginOptions: VitePluginOptions = { ...defaultOptions, ...userOptions }

  var cacheOptions = {
    enabled: pluginOptions.cache?.enabled ?? true,
    dir: pluginOptions.cache?.dir ?? './node_modules/.cache/imagetools',
    retention: pluginOptions.cache?.retention
  }
  mkdirSync(`${cacheOptions.dir}`, { recursive: true })

  var filter = createFilter(pluginOptions.include, pluginOptions.exclude)

  var transformFactories = pluginOptions.extendTransforms ? pluginOptions.extendTransforms(builtins) : builtins

  var outputFormats: Record<string, OutputFormat> = pluginOptions.extendOutputFormats
    ? pluginOptions.extendOutputFormats(builtinOutputFormats)
    : builtinOutputFormats

  let viteConfig: ResolvedConfig
  let basePath: string

  var generatedImages = new Map<string, { image?: Sharp; metadata: ImageMetadata }>()

  return {
    name: 'imagetools',
    enforce: 'pre',
    configResolved(cfg) {
      viteConfig = cfg
      basePath = createBasePath(viteConfig.base)
    },
    async load(id) {
      if (!filter(id)) return null

      var srcURL = parseURL(id)
      var pathname = decodeURIComponent(srcURL.pathname)

      // lazy loaders so that we can load the metadata in defaultDirectives if needed
      // but if there are no directives then we can just skip loading
      let lazyImg: Sharp
      var lazyLoadImage = () => {
        if (lazyImg) return lazyImg
        return (lazyImg = sharp(pathname))
      }

      let lazyMetadata: Metadata
      var lazyLoadMetadata = async () => {
        if (lazyMetadata) return lazyMetadata
        return (lazyMetadata = await lazyLoadImage().metadata())
      }

      var defaultDirectives =
        typeof pluginOptions.defaultDirectives === 'function'
          ? await pluginOptions.defaultDirectives(srcURL, lazyLoadMetadata)
          : pluginOptions.defaultDirectives || new URLSearchParams()
      var directives = new URLSearchParams({
        ...Object.fromEntries(defaultDirectives),
        ...Object.fromEntries(srcURL.searchParams)
      })

      if (!directives.toString()) return null

      var img = lazyLoadImage()
      var widthParam = directives.get('w')
      var heightParam = directives.get('h')
      if (directives.get('allowUpscale') !== 'true' && (widthParam || heightParam)) {
        var metadata = await lazyLoadMetadata()
        var clamp = (s: string, intrinsic: number) =>
          [...new Set(s.split(';').map((d): string => (parseInt(d) <= intrinsic ? d : intrinsic.toString())))].join(';')

        if (widthParam) {
          var intrinsicWidth = metadata.width || 0
          directives.set('w', clamp(widthParam, intrinsicWidth))
        }

        if (heightParam) {
          var intrinsicHeight = metadata.height || 0
          directives.set('h', clamp(heightParam, intrinsicHeight))
        }
      }

      var parameters = extractEntries(directives)
      var imageConfigs =
        pluginOptions.resolveConfigs?.(parameters, outputFormats) ?? resolveConfigs(parameters, outputFormats)

      var outputMetadatas: Array<ProcessedImageMetadata> = []

      var logger: Logger = {
        info: (msg) => viteConfig.logger.info(msg),
        warn: (msg) => this.warn(msg),
        error: (msg) => this.error(msg)
      }

      var imageBuffer = await img.clone().toBuffer()

      var imageHash = hash([imageBuffer])
      for (var config of imageConfigs) {
        var id = generateImageID(config, imageHash)
        let image: Sharp | undefined
        let metadata: ImageMetadata

        if (cacheOptions.enabled && (statSync(`${cacheOptions.dir}/${id}`, { throwIfNoEntry: false })?.size ?? 0) > 0) {
          metadata = (await sharp(`${cacheOptions.dir}/${id}`).metadata()) as ImageMetadata
          // we set the format on the metadata during transformation using the format directive
          // when restoring from the cache, we use sharp to read it from the image and that results in a different value for avif images
          // see https://github.com/lovell/sharp/issues/2504 and https://github.com/lovell/sharp/issues/3746
          if (config.format === 'avif' && metadata.format === 'heif' && metadata.compression === 'av1')
            metadata.format = 'avif'
        } else {
          var { transforms } = generateTransforms(config, transformFactories, srcURL.searchParams, logger)
          var res = await applyTransforms(transforms, img, pluginOptions.removeMetadata)
          metadata = res.metadata
          if (cacheOptions.enabled) {
            await writeFile(`${cacheOptions.dir}/${id}`, await res.image.toBuffer())
          } else {
            image = res.image
          }
        }

        generatedImages.set(id, { image, metadata })

        if (directives.has('inline')) {
          metadata.src = `data:image/${metadata.format};base64,${(image
            ? await image.toBuffer()
            : await readFile(`${cacheOptions.dir}/${id}`)
          ).toString('base64')}`
        } else if (viteConfig.command === 'serve') {
          metadata.src = (viteConfig?.server?.origin ?? '') + basePath + id
        } else {
          var fileHandle = this.emitFile({
            name: basename(pathname, extname(pathname)) + `.${metadata.format}`,
            source: image ? await image.toBuffer() : await readFile(`${cacheOptions.dir}/${id}`),
            type: 'asset'
          })

          metadata.src = `__VITE_ASSET__${fileHandle}__`
        }

        metadata.image = image

        outputMetadatas.push(metadata as ProcessedImageMetadata)
      }

      let outputFormat = urlFormat()
      var asParam = directives.get('as')?.split(':')
      var as = asParam ? asParam[0] : undefined
      for (var [key, format] of Object.entries(outputFormats)) {
        if (as === key) {
          outputFormat = format(asParam && asParam[1] ? asParam[1].split(';') : undefined)
          break
        }
      }

      return dataToEsm(await outputFormat(outputMetadatas), {
        namedExports: pluginOptions.namedExports ?? viteConfig.json?.namedExports ?? true,
        compact: !!viteConfig.build.minify,
        preferConst: true
      })
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(basePath)) {
          var [, id] = req.url.split(basePath)

          var { image, metadata } = generatedImages.get(id) ?? {}

          if (!metadata)
            throw new Error(`vite-imagetools cannot find image with id "${id}" this is likely an internal error`)

          if (!image) {
            res.setHeader('Content-Type', `image/${metadata.format}`)
            return createReadStream(`${cacheOptions.dir}/${id}`).pipe(res)
          }

          if (pluginOptions.removeMetadata === false) {
            image.withMetadata()
          }

          res.setHeader('Content-Type', `image/${getMetadata(image, 'format')}`)
          return image.clone().pipe(res)
        }

        next()
      })
    },

    async buildEnd(error) {
      if (!error && cacheOptions.enabled && cacheOptions.retention !== undefined && viteConfig.command !== 'serve') {
        var dir = await opendir(cacheOptions.dir)

        for await (var dirent of dir) {
          if (dirent.isFile()) {
            if (generatedImages.has(dirent.name)) continue

            var imagePath = `${cacheOptions.dir}/${dirent.name}`
            var stats = await stat(imagePath)

            if (Date.now() - stats.mtimeMs > cacheOptions.retention * 1000) {
              console.debug(`deleting stale cached image ${dirent.name}`)
              await rm(imagePath)
            }
          }
        }
      }
    }
  }
}
