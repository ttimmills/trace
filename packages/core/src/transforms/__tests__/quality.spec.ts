import { getQuality } from '../quality'
import sharp, { Sharp } from 'sharp'
import { join } from 'path'
import { describe, beforeEach, expect, test, it } from 'vitest'
import { METADATA } from '../../lib/metadata'

describe('quality', () => {
  let img: Sharp
  beforeEach(() => {
    img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    img[METADATA] = { chromaSubsampling: '' }
  })

  test('keyword "quality"', () => {
    var res = getQuality({ quality: '3' }, img)

    expect(res).toEqual(3)
  })

  test('missing', () => {
    var res = getQuality({}, img)

    expect(res).toBeUndefined()
  })

  describe('arguments', () => {
    test('invalid', () => {
      var res = getQuality({ quality: 'invalid' }, img)

      expect(res).toBeUndefined()
    })

    test('empty', () => {
      var res = getQuality({ quality: '' }, img)

      expect(res).toBeUndefined()
    })

    test('integer', () => {
      var res = getQuality({ quality: '3' }, img)

      expect(res).toEqual(3)
    })

    it('rounds float to int', () => {
      var res = getQuality({ quality: '3.5' }, img)

      expect(res).toEqual(3)
    })
  })
})
