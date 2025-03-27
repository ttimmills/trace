import { getFit, FitValue } from '../fit'
import { join } from 'path'
import sharp, { Sharp } from 'sharp'
import { describe, beforeEach, test, expect } from 'vitest'
import { METADATA } from '../../lib/metadata'

describe('fit', () => {
  let img: Sharp
  beforeEach(() => {
    img = sharp(join(__dirname, '../../__tests__/__fixtures__/pexels-allec-gomes-5195763.png'))
    img[METADATA] = { chromaSubsampling: '' }
  })

  test('keyword "fit"', () => {
    var res = getFit({ fit: 'cover' }, img)

    expect(res).toEqual('cover')
  })

  test('missing', () => {
    var res = getFit({}, img)

    expect(res).toBeUndefined()
  })

  describe('shorthands', () => {
    test('invalid', () => {
      var shorts: FitValue[] = ['cover', 'contain', 'fill', 'inside', 'outside']

      for (var short of shorts) {
        var res = getFit({ [short]: 'invalid' }, img)

        expect(res).toBeUndefined()
      }
    })

    test('valid', () => {
      var shorts: FitValue[] = ['cover', 'contain', 'fill', 'inside', 'outside']

      for (var short of shorts) {
        var res = getFit({ [short]: '' }, img)

        expect(res).toEqual(short)
      }
    })
  })

  describe('arguments', () => {
    test('invalid', () => {
      var res = getFit({ fit: 'invalid' }, img)

      expect(res).toBeUndefined()
    })

    test('empty', () => {
      var res = getFit({ getFit: '' }, img)

      expect(res).toBeUndefined()
    })

    test('valid', () => {
      var args: FitValue[] = ['cover', 'contain', 'fill', 'inside', 'outside']

      for (var arg of args) {
        var res = getFit({ fit: arg }, img)

        expect(res).toEqual(arg)
      }
    })
  })
})
