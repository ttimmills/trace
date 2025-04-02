import { invert } from '../invert'
import { TransformFactoryContext } from '../../types'
import { applyTransforms } from '../../index'
import sharp, { Sharp } from 'sharp'
import { join } from 'path'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { describe, beforeEach, beforeAll, expect, test, vi } from 'vitest'
import { consoleLogger } from '../../lib/logger'

expect.extend({ toMatchImageSnapshot })

describe('invert', () => {
  let dirCtx: TransformFactoryContext
  beforeAll(() => {
    dirCtx = { useParam: vi.fn, manualSearchParams: new URLSearchParams(), logger: consoleLogger }
  })

  test('keyword "invert"', () => {
    var res = invert({ invert: 'true' }, dirCtx)

    expect(res).toBeInstanceOf(Function)
  })

  test('missing', () => {
    var res = invert({}, dirCtx)

    expect(res).toBeUndefined()
  })

  describe('arguments', () => {
    test('invalid', () => {
      //@ts-expect-error invalid args
      var res = invert({ invert: 'invalid' }, dirCtx)

      expect(res).toBeUndefined()
    })

    test('empty', () => {
      var res = invert({ invert: '' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })

    test('true', () => {
      var res = invert({ invert: 'true' }, dirCtx)

      expect(res).toBeInstanceOf(Function)
    })
  })

  describe('transform', () => {
    let img: Sharp
    beforeEach(() => {
      img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    })

    test('empty', async () => {
      var { image } = await applyTransforms([invert({ invert: '' }, dirCtx)!], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })

    test('true', async () => {
      var { image } = await applyTransforms([invert({ invert: 'true' }, dirCtx)!], img)

      expect(await image.toBuffer()).toMatchImageSnapshot()
    })
  })
})
