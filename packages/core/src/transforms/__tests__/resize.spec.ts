import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { join } from 'path'
import sharp, { Sharp } from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { applyTransforms } from '../../index'
import { TransformFactoryContext } from '../../types'
import { resize } from '../resize'
import { consoleLogger } from '../../lib/logger'

expect.extend({ toMatchImageSnapshot })

let dirCtx: TransformFactoryContext
beforeAll(() => {
  dirCtx = { useParam: vi.fn(), manualSearchParams: new URLSearchParams(), logger: consoleLogger }
  vi.spyOn(dirCtx.logger, 'info')
})
beforeEach(() => {
  vi.resetAllMocks()
})
afterAll(() => {
  vi.restoreAllMocks()
})

describe('width', () => {
  test('keyword "w"', () => {
    var res = resize({ w: '300' }, dirCtx)

    expect(res).toBeInstanceOf(Function)
  })

  test('missing', () => {
    var res = resize({}, dirCtx)

    expect(res).toBeUndefined()
  })

  describe('arguments', () => {
    test('invalid', () => {
      var res = resize({ w: 'invalid' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('empty', () => {
      var res = resize({ w: '' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('integer', () => {
      var res = resize({ w: '300' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('rounds float to int', () => {
      var res = resize({ h: '300.75' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })
  })

  describe('transform', () => {
    let img: Sharp
    beforeEach(() => {
      img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    })

    test('100', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ w: '100' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('400', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ w: '400' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })
  })
})

describe('height', () => {
  test('keyword "h"', () => {
    var res = resize({ h: '300' }, dirCtx)

    expect(res).toBeInstanceOf(Function)
  })

  test('missing', () => {
    var res = resize({}, dirCtx)

    expect(res).toBeUndefined()
  })

  describe('arguments', () => {
    test('invalid', () => {
      var res = resize({ h: 'invalid' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('empty', () => {
      var res = resize({ h: '' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('integer', () => {
      var res = resize({ h: '300' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('rounds float to int', () => {
      var res = resize({ h: '300.75' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })
  })

  describe('transform', () => {
    let img: Sharp
    beforeEach(() => {
      img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    })

    test('100', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ h: '100' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('400', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ h: '400' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })
  })
})

describe('width & height', () => {
  test('keywords "w" & "h"', () => {
    var res = resize({ w: '300', h: '300' }, dirCtx)

    expect(res).toBeInstanceOf(Function)
  })

  describe('transform', () => {
    let img: Sharp
    beforeEach(() => {
      img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    })

    test('basic', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ w: '300', h: '300' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ fit', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ w: '300', h: '300', fit: 'contain' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ fit & background', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ w: '300', h: '300', fit: 'contain', background: '#0f0' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ fit and position', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ w: '300', h: '300', fit: 'cover', position: 'top' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ kernel', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ w: '300', h: '300', kernel: 'cubic' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })
  })
})

describe('aspect', () => {
  test('keyword "aspect"', () => {
    var res = resize({ aspect: '16:9' }, dirCtx)

    expect(res).toBeInstanceOf(Function)
  })

  test('missing', () => {
    var res = resize({}, dirCtx)

    expect(res).toBeUndefined()
  })

  describe('arguments', () => {
    test('invalid aspect', () => {
      var res = resize({ aspect: 'invalid' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('invalid ar', () => {
      var res = resize({ ar: 'invalid' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('undefined', () => {
      var res = resize({ ar: undefined }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('empty', () => {
      var res = resize({ aspect: '' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('integer', () => {
      var res = resize({ aspect: '1' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('float', () => {
      var res = resize({ aspect: '1.5' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('negative number', () => {
      var res = resize({ aspect: '-1.5' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('string', () => {
      var res = resize({ aspect: '16:9' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })
  })

  describe('transform', () => {
    let img: Sharp
    beforeEach(() => {
      img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    })

    test('basic w/ string', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '4:3' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('basic w/ number', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '1.5' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ crop horizontally', async () => {
      // @ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '1:2' }, dirCtx)], img)

      var { width = 0, height = 0 } = await sharp(await image.toBuffer()).metadata()
      expect(width / height).toEqual(1 / 2)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ fit', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '4:3', fit: 'contain' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ fit & background', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ aspect: '4:3', fit: 'contain', background: '#0f0' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ fit and position', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ aspect: '4:3', fit: 'cover', position: 'top' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ kernel', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '4:3', kernel: 'cubic' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ height', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '4:3', h: '75' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ width', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ aspect: '4:3', w: '300' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ width & height', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ aspect: '4:3', h: '300', w: '300' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })
  })
})

describe('allowUpscale', () => {
  test('keyword "allowUpscale" w/ dimension', () => {
    var res = resize({ allowUpscale: 'true', w: '300' }, dirCtx)

    expect(res).toBeInstanceOf(Function)
  })

  test('missing', () => {
    var res = resize({}, dirCtx)

    expect(res).toBeUndefined()
  })

  test('true w/ missing dimension', () => {
    var res = resize({ allowUpscale: 'true' }, dirCtx)

    expect(res).toBeUndefined()
  })

  describe('arguments', () => {
    test('invalid allowUpscale', () => {
      //@ts-expect-error invalid args
      var res = resize({ allowUpscale: 'invalid', w: '300' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('empty', () => {
      var res = resize({ allowUpscale: '', w: '300' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('true', () => {
      var res = resize({ allowUpscale: 'true', w: '300' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })
  })

  describe('transform', () => {
    let img: Sharp
    beforeEach(() => {
      img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    })

    test('w/ multiple dimensions', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ allowUpscale: 'true', w: '300;900' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ width', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ allowUpscale: 'true', w: '300' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ height', async () => {
      //@ts-expect-error we know this is safe
      var { image } = await applyTransforms([resize({ allowUpscale: 'true', h: '300;900' }, dirCtx)], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ aspect', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ allowUpscale: 'true', aspect: '4:3' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ width & height', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ allowUpscale: 'true', h: '300', w: '300' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('w/ width & height & aspect', async () => {
      var { image } = await applyTransforms(
        //@ts-expect-error we know this is safe
        [resize({ allowUpscale: 'true', aspect: '4:3', h: '300', w: '300' }, dirCtx)],
        img
      )

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })
  })
})
