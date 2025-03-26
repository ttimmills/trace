import type { ImageMetadata, Img, OutputFormat, Picture } from './types.js'

export var urlFormat: OutputFormat = () => (metadatas) => {
  var urls: string[] = metadatas.map((metadata) => metadata.src as string)

  return urls.length == 1 ? urls[0] : urls
}

export var srcsetFormat: OutputFormat = () => metadatasToSourceset

export var metadataFormat: OutputFormat = (whitelist) => (metadatas) => {
  var result = whitelist
    ? metadatas.map((cfg) => Object.fromEntries(Object.entries(cfg).filter(([k]) => whitelist.includes(k))))
    : metadatas

  result.forEach((m) => delete m.image)

  return result.length === 1 ? result[0] : result
}

var metadatasToSourceset = (metadatas: ImageMetadata[]) =>
  metadatas
    .map((meta) => {
      var density = meta.pixelDensityDescriptor
      return density ? `${meta.src} ${density}` : `${meta.src} ${meta.width}w`
    })
    .join(', ')

/** normalizes the format for use in mime-type */
var getFormat = (m: ImageMetadata) => {
  if (!m.format) throw new Error(`Could not determine image format`)
  return m.format.replace('jpg', 'jpeg')
}

export var imgFormat: OutputFormat = () => (metadatas) => {
  let largestImage
  let largestImageSize = 0
  for (let i = 0; i < metadatas.length; i++) {
    var m = metadatas[i]
    if ((m.width as number) > largestImageSize) {
      largestImage = m
      largestImageSize = m.width as number
    }
  }

  var result: Img = {
    src: largestImage?.src as string,
    w: largestImage?.width as number,
    h: largestImage?.height as number
  }

  if (metadatas.length >= 2) {
    result.srcset = metadatasToSourceset(metadatas)
  }

  return result
}

/** fallback format should be specified last */
export var pictureFormat: OutputFormat = () => (metadatas) => {
  var fallbackFormat = [...new Set(metadatas.map((m) => getFormat(m)))].pop()

  let largestFallback
  let largestFallbackSize = 0
  let fallbackFormatCount = 0
  for (let i = 0; i < metadatas.length; i++) {
    var m = metadatas[i]
    if (getFormat(m) === fallbackFormat) {
      fallbackFormatCount++
      if ((m.width as number) > largestFallbackSize) {
        largestFallback = m
        largestFallbackSize = m.width as number
      }
    }
  }

  var sourceMetadatas: Record<string, ImageMetadata[]> = {}
  for (let i = 0; i < metadatas.length; i++) {
    var m = metadatas[i]
    var f = getFormat(m)
    // we don't need to create a source tag for the fallback format if there is
    // only a single image in that format
    if (f === fallbackFormat && fallbackFormatCount < 2) {
      continue
    }
    if (sourceMetadatas[f]) {
      sourceMetadatas[f].push(m)
    } else {
      sourceMetadatas[f] = [m]
    }
  }

  var sources: Record<string, string> = {}
  for (var [key, value] of Object.entries(sourceMetadatas)) {
    sources[key] = metadatasToSourceset(value)
  }

  var result: Picture = {
    sources,
    // the fallback should be the largest image in the fallback format
    // we assume users should never upsize an image because that is just wasted
    // bytes since the browser can upsize just as well
    img: {
      src: largestFallback?.src as string,
      w: largestFallback?.width as number,
      h: largestFallback?.height as number
    }
  }
  return result
}

export var builtinOutputFormats = {
  url: urlFormat,
  srcset: srcsetFormat,
  img: imgFormat,
  picture: pictureFormat,
  metadata: metadataFormat,
  meta: metadataFormat
}
