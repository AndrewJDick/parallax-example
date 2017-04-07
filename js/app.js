(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"buffer":2,"rH1JPG":4}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/buffer/index.js","/../../node_modules/buffer")
},{"base64-js":1,"buffer":2,"ieee754":3,"rH1JPG":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"buffer":2,"rH1JPG":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/process/browser.js","/../../node_modules/process")
},{"buffer":2,"rH1JPG":4}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParallaxGrid = function () {
  function ParallaxGrid() {
    _classCallCheck(this, ParallaxGrid);

    this.scrollAttr = {
      previous: 0,
      current: 0,
      direction: false,
      ticking: false
    };

    this.gridClasses = {
      row: 'c-grid__row',
      upper: 'u-positioning--upper',
      lower: 'u-positioning--lower'
    };

    this.gridElements = {
      quadrants: document.querySelectorAll('.c-grid__quadrant'),
      rows: document.querySelectorAll('.c-grid__row'),
      panels: document.querySelectorAll('.c-grid__panel')
    };

    this.listeners();
  }

  _createClass(ParallaxGrid, [{
    key: 'listeners',
    value: function listeners() {
      var _this = this;

      window.addEventListener('scroll', function () {
        return _this.onScroll();
      }, false);
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {
      this.scrollAttr.current = window.pageYOffset || document.documentElement.scrollTop;

      // Determine which way the user is scrolling
      this.scrollDirection();

      // Debounce & Update
      this.requestTick();

      this.scrollAttr.previous = this.scrollAttr.current;
    }
  }, {
    key: 'scrollDirection',
    value: function scrollDirection() {
      if (this.scrollAttr.current > this.scrollAttr.previous) {
        // Scroll Down
        this.scrollAttr.direction = true;
      } else {
        // Scroll Up
        this.scrollAttr.direction = false;
      }
    }
  }, {
    key: 'requestTick',
    value: function requestTick() {
      var _this2 = this;

      if (!this.scrollAttr.ticking) {
        window.requestAnimationFrame(function () {
          return _this2.update();
        });
      }
      this.scrollAttr.ticking = true;
    }
  }, {
    key: 'configureElem',
    value: function configureElem(elem, z1, z2) {
      var position = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "relative";


      switch (position) {
        case "fixed":
          elem.firstElementChild.classList.add(this.gridClasses.upper);
          elem.firstElementChild.style.zIndex = z1;

          elem.lastElementChild.classList.add(this.gridClasses.lower);
          elem.lastElementChild.style.zIndex = z2;
          break;

        case "relative":
          elem.firstElementChild.classList.remove(this.gridClasses.upper);
          elem.firstElementChild.style.zIndex = z1;

          elem.lastElementChild.classList.remove(this.gridClasses.lower);
          elem.lastElementChild.style.zIndex = z2;
          break;
      }
    }
  }, {
    key: 'clearClasses',
    value: function clearClasses(elem) {
      for (var e = 0; e < elem.length; e++) {
        elem[e].classList.remove(this.gridClasses.upper);
        elem[e].classList.remove(this.gridClasses.lower);
      }
    }
  }, {
    key: 'isMobileLayout',
    value: function isMobileLayout(panel) {
      var gridStyle = window.getComputedStyle(panel, null);
      var gridWidth = parseInt(gridStyle.width);

      if (gridWidth === window.innerWidth) {
        return true;
      }

      return false;
    }
  }, {
    key: 'getPosition',
    value: function getPosition(elem) {
      var position = {
        currentTop: elem.getAttribute('data-cT'),
        currentBot: elem.getAttribute('data-cB'),
        previousTop: elem.getAttribute('data-pT'),
        previousBot: elem.getAttribute('data-pB')
      };

      return position;
    }
  }, {
    key: 'update',
    value: function update() {
      this.scrollAttr.ticking = false;

      var viewportHeight = window.innerHeight;
      var isMobile = this.isMobileLayout(this.gridElements.panels[0]);

      for (var r = 0; r < this.gridElements.rows.length; r++) {

        var row = this.gridElements.rows[r];

        var quadrant = {
          current: row.parentElement,
          next: row.parentElement.nextElementSibling,
          previous: row.parentElement.previousElementSibling
        };

        // Single Column (Mobile)
        if (isMobile === true) {

          var rowPosition = this.getPosition(row);

          // Set Current Position
          row.setAttribute('data-cT', row.getBoundingClientRect().top);
          row.setAttribute('data-cB', row.getBoundingClientRect().bottom);

          // Scroll Down
          if (rowPosition.previousTop > 0 && rowPosition.currentTop <= 0 && this.scrollAttr.direction) {

            this.configureElem(row, 5, 15, "fixed");

            if (row.nextElementSibling) {
              this.configureElem(row.nextElementSibling, 10, 20);
            }

            if (row.previousElementSibling) {
              this.configureElem(row.previousElementSibling, 10, 20);
            }

            if (quadrant.next) {
              this.configureElem(quadrant.next.firstElementChild, 10, 20);
            } else if (!row.nextElementSibling) {
              this.clearClasses(this.gridElements.panels, this.gridClasses);
            }

            if (quadrant.previous) {
              this.configureElem(quadrant.previous.lastElementChild, 10, 20);
            }
          }

          // Scroll Up
          if (rowPosition.previousBot < viewportHeight && rowPosition.currentBot >= viewportHeight && !this.scrollAttr.direction) {

            this.configureElem(row, 15, 5, "fixed");

            if (row.nextElementSibling) {
              this.configureElem(row.nextElementSibling, 20, 10);
            }

            if (row.previousElementSibling) {
              this.configureElem(row.previousElementSibling, 20, 10);
            }

            if (quadrant.previous) {
              this.configureElem(quadrant.previous.lastElementChild, 20, 10);
            } else if (!row.previousElementSibling) {
              this.clearClasses(this.gridElements.panels, this.gridClasses);
            }

            if (quadrant.next) {
              this.configureElem(quadrant.next.firstElementChild, 20, 10);
            }
          }

          // Set Previous Position
          row.setAttribute('data-pT', rowPosition.currentTop);
          row.setAttribute('data-pB', rowPosition.currentBot);
        }

        // Twin column (Desktop)
        else {

            var quadrantPosition = this.getPosition(quadrant.current);

            // Set Current Position
            quadrant.current.setAttribute('data-cT', quadrant.current.getBoundingClientRect().top);
            quadrant.current.setAttribute('data-cB', quadrant.current.getBoundingClientRect().bottom);

            // Scroll Down
            if (quadrantPosition.previousTop > 0 && quadrantPosition.currentTop <= 0 && this.scrollAttr.direction) {

              this.configureElem(quadrant.current, 5, 15, "fixed");

              if (quadrant.next) {
                this.configureElem(quadrant.next, 10, 20);
              } else {
                this.clearClasses(this.gridElements.rows);
              }

              if (quadrant.previous) {
                this.configureElem(quadrant.previous, 10, 20);
              }
            }

            // Scroll Up
            if (quadrantPosition.previousBot < viewportHeight && quadrantPosition.currentBot >= viewportHeight && !this.scrollAttr.direction) {

              this.configureElem(quadrant.current, 15, 5, "fixed");

              if (quadrant.next) {
                this.configureElem(quadrant.next, 20, 10);
              }

              if (quadrant.previous) {
                this.configureElem(quadrant.previous, 20, 10);
              } else {
                this.clearClasses(this.gridElements.rows);
              }
            }

            // Set Previous Position
            quadrant.current.setAttribute('data-pT', quadrantPosition.currentTop);
            quadrant.current.setAttribute('data-pB', quadrantPosition.currentBot);
          }
      }
    }
  }]);

  return ParallaxGrid;
}();

exports.default = ParallaxGrid;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhcmFsbGF4R3JpZC5qcyJdLCJuYW1lcyI6WyJQYXJhbGxheEdyaWQiLCJzY3JvbGxBdHRyIiwicHJldmlvdXMiLCJjdXJyZW50IiwiZGlyZWN0aW9uIiwidGlja2luZyIsImdyaWRDbGFzc2VzIiwicm93IiwidXBwZXIiLCJsb3dlciIsImdyaWRFbGVtZW50cyIsInF1YWRyYW50cyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsInJvd3MiLCJwYW5lbHMiLCJsaXN0ZW5lcnMiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwib25TY3JvbGwiLCJwYWdlWU9mZnNldCIsImRvY3VtZW50RWxlbWVudCIsInNjcm9sbFRvcCIsInNjcm9sbERpcmVjdGlvbiIsInJlcXVlc3RUaWNrIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidXBkYXRlIiwiZWxlbSIsInoxIiwiejIiLCJwb3NpdGlvbiIsImZpcnN0RWxlbWVudENoaWxkIiwiY2xhc3NMaXN0IiwiYWRkIiwic3R5bGUiLCJ6SW5kZXgiLCJsYXN0RWxlbWVudENoaWxkIiwicmVtb3ZlIiwiZSIsImxlbmd0aCIsInBhbmVsIiwiZ3JpZFN0eWxlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImdyaWRXaWR0aCIsInBhcnNlSW50Iiwid2lkdGgiLCJpbm5lcldpZHRoIiwiY3VycmVudFRvcCIsImdldEF0dHJpYnV0ZSIsImN1cnJlbnRCb3QiLCJwcmV2aW91c1RvcCIsInByZXZpb3VzQm90Iiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImlzTW9iaWxlIiwiaXNNb2JpbGVMYXlvdXQiLCJyIiwicXVhZHJhbnQiLCJwYXJlbnRFbGVtZW50IiwibmV4dCIsIm5leHRFbGVtZW50U2libGluZyIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJyb3dQb3NpdGlvbiIsImdldFBvc2l0aW9uIiwic2V0QXR0cmlidXRlIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwiYm90dG9tIiwiY29uZmln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QXNDLEVBQXRDLEVBQTBDLEVBQTFDO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLGdCQUFJb0UsaUJBQWlCbkIsV0FBakIsR0FBK0JDLGNBQS9CLElBQWlEa0IsaUJBQWlCckIsVUFBakIsSUFBK0JHLGNBQWhGLElBQWtHLENBQUMsS0FBS25ELFVBQUwsQ0FBZ0JHLFNBQXZILEVBQWtJOztBQUVoSSxtQkFBS2dFLGFBQUwsQ0FBbUJYLFNBQVN0RCxPQUE1QixFQUFxQyxFQUFyQyxFQUF5QyxDQUF6QyxFQUE0QyxPQUE1Qzs7QUFFQSxrQkFBSXNELFNBQVNFLElBQWIsRUFBbUI7QUFDakIscUJBQUtTLGFBQUwsQ0FBbUJYLFNBQVNFLElBQTVCLEVBQWtDLEVBQWxDLEVBQXNDLEVBQXRDO0FBQ0Q7O0FBRUQsa0JBQUlGLFNBQVN2RCxRQUFiLEVBQXVCO0FBQ3JCLHFCQUFLa0UsYUFBTCxDQUFtQlgsU0FBU3ZELFFBQTVCLEVBQXNDLEVBQXRDLEVBQTBDLEVBQTFDO0FBQ0QsZUFGRCxNQUVPO0FBQ0wscUJBQUttRSxZQUFMLENBQWtCLEtBQUszRCxZQUFMLENBQWtCSSxJQUFwQztBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTJDLHFCQUFTdEQsT0FBVCxDQUFpQjZELFlBQWpCLENBQThCLFNBQTlCLEVBQXlDTSxpQkFBaUJ2QixVQUExRDtBQUNBVSxxQkFBU3RELE9BQVQsQ0FBaUI2RCxZQUFqQixDQUE4QixTQUE5QixFQUF5Q00saUJBQWlCckIsVUFBMUQ7QUFDRDtBQUNGO0FBQ0Y7Ozs7OztrQkF6T2tCakQsWSIsImZpbGUiOiJQYXJhbGxheEdyaWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJhbGxheEdyaWQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2Nyb2xsQXR0ciA9IHtcbiAgICAgIHByZXZpb3VzOiAwLFxuICAgICAgY3VycmVudDogMCxcbiAgICAgIGRpcmVjdGlvbjogZmFsc2UsXG4gICAgICB0aWNraW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICB0aGlzLmdyaWRDbGFzc2VzID0geyBcbiAgICAgIHJvdzogICdjLWdyaWRfX3JvdycsXG4gICAgICB1cHBlcjogJ3UtcG9zaXRpb25pbmctLXVwcGVyJywgXG4gICAgICBsb3dlcjogJ3UtcG9zaXRpb25pbmctLWxvd2VyJyxcbiAgICB9O1xuXG4gICAgdGhpcy5ncmlkRWxlbWVudHMgPSB7XG4gICAgICBxdWFkcmFudHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jLWdyaWRfX3F1YWRyYW50JyksXG4gICAgICByb3dzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYy1ncmlkX19yb3cnKSxcbiAgICAgIHBhbmVsczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmMtZ3JpZF9fcGFuZWwnKVxuICAgIH07XG5cbiAgICB0aGlzLmxpc3RlbmVycygpO1xuICB9XG5cbiAgbGlzdGVuZXJzKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB0aGlzLm9uU2Nyb2xsKCksIGZhbHNlKTtcbiAgfVxuXG4gIG9uU2Nyb2xsKCkge1xuICAgIHRoaXMuc2Nyb2xsQXR0ci5jdXJyZW50ID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAvLyBEZXRlcm1pbmUgd2hpY2ggd2F5IHRoZSB1c2VyIGlzIHNjcm9sbGluZ1xuICAgIHRoaXMuc2Nyb2xsRGlyZWN0aW9uKCk7XG4gICAgXG4gICAgLy8gRGVib3VuY2UgJiBVcGRhdGVcbiAgICB0aGlzLnJlcXVlc3RUaWNrKCk7IFxuXG4gICAgdGhpcy5zY3JvbGxBdHRyLnByZXZpb3VzID0gdGhpcy5zY3JvbGxBdHRyLmN1cnJlbnQ7XG4gIH1cblxuICBzY3JvbGxEaXJlY3Rpb24oKSB7IFxuICAgIGlmICh0aGlzLnNjcm9sbEF0dHIuY3VycmVudCA+IHRoaXMuc2Nyb2xsQXR0ci5wcmV2aW91cykge1xuICAgICAgLy8gU2Nyb2xsIERvd25cbiAgICAgIHRoaXMuc2Nyb2xsQXR0ci5kaXJlY3Rpb24gPSB0cnVlOyAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTY3JvbGwgVXBcbiAgICAgIHRoaXMuc2Nyb2xsQXR0ci5kaXJlY3Rpb24gPSBmYWxzZTsgIFxuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3RUaWNrKCkge1xuICAgIGlmKCF0aGlzLnNjcm9sbEF0dHIudGlja2luZykge1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxBdHRyLnRpY2tpbmcgPSB0cnVlO1xuICB9XG5cbiAgY29uZmlndXJlRWxlbShlbGVtLCB6MSwgejIsIHBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiKSB7XG5cbiAgICBzd2l0Y2gocG9zaXRpb24pIHtcbiAgICAgIGNhc2UgXCJmaXhlZFwiOlxuICAgICAgICBlbGVtLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQodGhpcy5ncmlkQ2xhc3Nlcy51cHBlcik7XG4gICAgICAgIGVsZW0uZmlyc3RFbGVtZW50Q2hpbGQuc3R5bGUuekluZGV4ID0gejE7XG5cbiAgICAgICAgZWxlbS5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQodGhpcy5ncmlkQ2xhc3Nlcy5sb3dlcik7XG4gICAgICAgIGVsZW0ubGFzdEVsZW1lbnRDaGlsZC5zdHlsZS56SW5kZXggPSB6MjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJyZWxhdGl2ZVwiOlxuICAgICAgICBlbGVtLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5ncmlkQ2xhc3Nlcy51cHBlcik7XG4gICAgICAgIGVsZW0uZmlyc3RFbGVtZW50Q2hpbGQuc3R5bGUuekluZGV4ID0gejE7XG5cbiAgICAgICAgZWxlbS5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5ncmlkQ2xhc3Nlcy5sb3dlcik7XG4gICAgICAgIGVsZW0ubGFzdEVsZW1lbnRDaGlsZC5zdHlsZS56SW5kZXggPSB6MjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgY2xlYXJDbGFzc2VzKGVsZW0pIHtcbiAgICBmb3IgKGxldCBlID0gMDsgZSA8IGVsZW0ubGVuZ3RoOyBlKyspIHsgICBcbiAgICAgIGVsZW1bZV0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnVwcGVyKTtcbiAgICAgIGVsZW1bZV0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLmxvd2VyKTtcbiAgICB9XG4gIH1cblxuICBpc01vYmlsZUxheW91dChwYW5lbCkge1xuICAgIGNvbnN0IGdyaWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBhbmVsLCBudWxsKTtcbiAgICBjb25zdCBncmlkV2lkdGggPSBwYXJzZUludChncmlkU3R5bGUud2lkdGgpO1xuXG4gICAgaWYgKGdyaWRXaWR0aCA9PT0gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZmFsc2U7IFxuICB9XG5cbiAgZ2V0UG9zaXRpb24oZWxlbSkge1xuICAgIGNvbnN0IHBvc2l0aW9uID0ge1xuICAgICAgY3VycmVudFRvcDogZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY1QnKSxcbiAgICAgIGN1cnJlbnRCb3Q6IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWNCJyksXG4gICAgICBwcmV2aW91c1RvcDogZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcFQnKSxcbiAgICAgIHByZXZpb3VzQm90OiBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1wQicpXG4gICAgfTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxuXG4gIHVwZGF0ZSgpIHsgXG4gICAgdGhpcy5zY3JvbGxBdHRyLnRpY2tpbmcgPSBmYWxzZTtcblxuICAgIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIGNvbnN0IGlzTW9iaWxlID0gdGhpcy5pc01vYmlsZUxheW91dCh0aGlzLmdyaWRFbGVtZW50cy5wYW5lbHNbMF0pO1xuXG4gICAgZm9yIChsZXQgciA9IDA7IHIgPCB0aGlzLmdyaWRFbGVtZW50cy5yb3dzLmxlbmd0aDsgcisrKSB7XG4gICAgICBcbiAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl07XG4gICAgICBcbiAgICAgIGNvbnN0IHF1YWRyYW50ID0ge1xuICAgICAgICBjdXJyZW50OiByb3cucGFyZW50RWxlbWVudCxcbiAgICAgICAgbmV4dDogcm93LnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLFxuICAgICAgICBwcmV2aW91czogcm93LnBhcmVudEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgICAgfTtcblxuICAgICAgLy8gU2luZ2xlIENvbHVtbiAoTW9iaWxlKVxuICAgICAgaWYgKGlzTW9iaWxlID09PSB0cnVlKSB7XG5cbiAgICAgICAgY29uc3Qgcm93UG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKHJvdyk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgQ3VycmVudCBQb3NpdGlvblxuICAgICAgICByb3cuc2V0QXR0cmlidXRlKCdkYXRhLWNUJywgcm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCk7XG4gICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtY0InLCByb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tKTtcblxuICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICBpZiAocm93UG9zaXRpb24ucHJldmlvdXNUb3AgPiAwICYmIHJvd1Bvc2l0aW9uLmN1cnJlbnRUb3AgPD0gMCAmJiB0aGlzLnNjcm9sbEF0dHIuZGlyZWN0aW9uKSB7XG5cbiAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93LCA1LCAxNSwgXCJmaXhlZFwiKTtcblxuICAgICAgICAgIGlmIChyb3cubmV4dEVsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93Lm5leHRFbGVtZW50U2libGluZywgMTAsIDIwKTtcbiAgICAgICAgICB9IFxuXG4gICAgICAgICAgaWYgKHJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsIDEwLCAyMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHF1YWRyYW50Lm5leHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5uZXh0LmZpcnN0RWxlbWVudENoaWxkLCAxMCwgMjApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXJvdy5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDbGFzc2VzKHRoaXMuZ3JpZEVsZW1lbnRzLnBhbmVscywgdGhpcy5ncmlkQ2xhc3Nlcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHF1YWRyYW50LnByZXZpb3VzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocXVhZHJhbnQucHJldmlvdXMubGFzdEVsZW1lbnRDaGlsZCwgMTAsIDIwKTsgXG4gICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2Nyb2xsIFVwXG4gICAgICAgIGlmIChyb3dQb3NpdGlvbi5wcmV2aW91c0JvdCA8IHZpZXdwb3J0SGVpZ2h0ICYmIHJvd1Bvc2l0aW9uLmN1cnJlbnRCb3QgPj0gdmlld3BvcnRIZWlnaHQgJiYgIXRoaXMuc2Nyb2xsQXR0ci5kaXJlY3Rpb24pIHtcblxuICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShyb3csIDE1LCA1LCBcImZpeGVkXCIpO1xuXG4gICAgICAgICAgaWYgKHJvdy5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShyb3cubmV4dEVsZW1lbnRTaWJsaW5nLCAyMCwgMTApO1xuICAgICAgICAgIH0gXG5cbiAgICAgICAgICBpZiAocm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShyb3cucHJldmlvdXNFbGVtZW50U2libGluZywgMjAsIDEwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocXVhZHJhbnQucHJldmlvdXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5wcmV2aW91cy5sYXN0RWxlbWVudENoaWxkLCAyMCwgMTApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3Nlcyh0aGlzLmdyaWRFbGVtZW50cy5wYW5lbHMsIHRoaXMuZ3JpZENsYXNzZXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChxdWFkcmFudC5uZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocXVhZHJhbnQubmV4dC5maXJzdEVsZW1lbnRDaGlsZCwgMjAsIDEwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgUHJldmlvdXMgUG9zaXRpb25cbiAgICAgICAgcm93LnNldEF0dHJpYnV0ZSgnZGF0YS1wVCcsIHJvd1Bvc2l0aW9uLmN1cnJlbnRUb3ApO1xuICAgICAgICByb3cuc2V0QXR0cmlidXRlKCdkYXRhLXBCJywgcm93UG9zaXRpb24uY3VycmVudEJvdCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFR3aW4gY29sdW1uIChEZXNrdG9wKVxuICAgICAgZWxzZSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBxdWFkcmFudFBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbihxdWFkcmFudC5jdXJyZW50KTtcblxuICAgICAgICAvLyBTZXQgQ3VycmVudCBQb3NpdGlvblxuICAgICAgICBxdWFkcmFudC5jdXJyZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1jVCcsIHF1YWRyYW50LmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wKTtcbiAgICAgICAgcXVhZHJhbnQuY3VycmVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY0InLCBxdWFkcmFudC5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICBpZiAocXVhZHJhbnRQb3NpdGlvbi5wcmV2aW91c1RvcCA+IDAgJiYgcXVhZHJhbnRQb3NpdGlvbi5jdXJyZW50VG9wIDw9IDAgJiYgdGhpcy5zY3JvbGxBdHRyLmRpcmVjdGlvbikge1xuXG4gICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHF1YWRyYW50LmN1cnJlbnQsIDUsIDE1LCBcImZpeGVkXCIpO1xuXG4gICAgICAgICAgaWYgKHF1YWRyYW50Lm5leHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5uZXh0LCAxMCwgMjApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3Nlcyh0aGlzLmdyaWRFbGVtZW50cy5yb3dzKTsgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChxdWFkcmFudC5wcmV2aW91cykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHF1YWRyYW50LnByZXZpb3VzLCAxMCwgMjApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNjcm9sbCBVcFxuICAgICAgICBpZiAocXVhZHJhbnRQb3NpdGlvbi5wcmV2aW91c0JvdCA8IHZpZXdwb3J0SGVpZ2h0ICYmIHF1YWRyYW50UG9zaXRpb24uY3VycmVudEJvdCA+PSB2aWV3cG9ydEhlaWdodCAmJiAhdGhpcy5zY3JvbGxBdHRyLmRpcmVjdGlvbikge1xuXG4gICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHF1YWRyYW50LmN1cnJlbnQsIDE1LCA1LCBcImZpeGVkXCIpO1xuXG4gICAgICAgICAgaWYgKHF1YWRyYW50Lm5leHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5uZXh0LCAyMCwgMTApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChxdWFkcmFudC5wcmV2aW91cykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHF1YWRyYW50LnByZXZpb3VzLCAyMCwgMTApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3Nlcyh0aGlzLmdyaWRFbGVtZW50cy5yb3dzKTsgIFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBQcmV2aW91cyBQb3NpdGlvblxuICAgICAgICBxdWFkcmFudC5jdXJyZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1wVCcsIHF1YWRyYW50UG9zaXRpb24uY3VycmVudFRvcCk7XG4gICAgICAgIHF1YWRyYW50LmN1cnJlbnQuc2V0QXR0cmlidXRlKCdkYXRhLXBCJywgcXVhZHJhbnRQb3NpdGlvbi5jdXJyZW50Qm90KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/ParallaxGrid.js","/app")
},{"buffer":2,"rH1JPG":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var _ParallaxGrid = require('./app/ParallaxGrid');

var _ParallaxGrid2 = _interopRequireDefault(_ParallaxGrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parallaxGrid = new _ParallaxGrid2.default(); // App
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfNzU1ZmJiODguanMiXSwibmFtZXMiOlsicGFyYWxsYXhHcmlkIl0sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxlQUFlLDRCQUFyQixDLENBSEEiLCJmaWxlIjoiZmFrZV83NTVmYmI4OC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEFwcFxuaW1wb3J0IFBhcmFsbGF4R3JpZCBmcm9tICcuL2FwcC9QYXJhbGxheEdyaWQnO1xuXG5jb25zdCBwYXJhbGxheEdyaWQgPSBuZXcgUGFyYWxsYXhHcmlkKCk7XG4iXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_755fbb88.js","/")
},{"./app/ParallaxGrid":5,"buffer":2,"rH1JPG":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIilcbn0se1wiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXJcIilcbn0se1wiYmFzZTY0LWpzXCI6MSxcImJ1ZmZlclwiOjIsXCJpZWVlNzU0XCI6MyxcInJIMUpQR1wiOjR9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2llZWU3NTRcIilcbn0se1wiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKVxufSx7XCJidWZmZXJcIjoyLFwickgxSlBHXCI6NH1dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUGFyYWxsYXhHcmlkID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQYXJhbGxheEdyaWQoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcmFsbGF4R3JpZCk7XG5cbiAgICB0aGlzLnNjcm9sbEF0dHIgPSB7XG4gICAgICBwcmV2aW91czogMCxcbiAgICAgIGN1cnJlbnQ6IDAsXG4gICAgICBkaXJlY3Rpb246IGZhbHNlLFxuICAgICAgdGlja2luZzogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5ncmlkQ2xhc3NlcyA9IHtcbiAgICAgIHJvdzogJ2MtZ3JpZF9fcm93JyxcbiAgICAgIHVwcGVyOiAndS1wb3NpdGlvbmluZy0tdXBwZXInLFxuICAgICAgbG93ZXI6ICd1LXBvc2l0aW9uaW5nLS1sb3dlcidcbiAgICB9O1xuXG4gICAgdGhpcy5ncmlkRWxlbWVudHMgPSB7XG4gICAgICBxdWFkcmFudHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jLWdyaWRfX3F1YWRyYW50JyksXG4gICAgICByb3dzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYy1ncmlkX19yb3cnKSxcbiAgICAgIHBhbmVsczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmMtZ3JpZF9fcGFuZWwnKVxuICAgIH07XG5cbiAgICB0aGlzLmxpc3RlbmVycygpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFBhcmFsbGF4R3JpZCwgW3tcbiAgICBrZXk6ICdsaXN0ZW5lcnMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0ZW5lcnMoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMub25TY3JvbGwoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdvblNjcm9sbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICAgICAgdGhpcy5zY3JvbGxBdHRyLmN1cnJlbnQgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHdheSB0aGUgdXNlciBpcyBzY3JvbGxpbmdcbiAgICAgIHRoaXMuc2Nyb2xsRGlyZWN0aW9uKCk7XG5cbiAgICAgIC8vIERlYm91bmNlICYgVXBkYXRlXG4gICAgICB0aGlzLnJlcXVlc3RUaWNrKCk7XG5cbiAgICAgIHRoaXMuc2Nyb2xsQXR0ci5wcmV2aW91cyA9IHRoaXMuc2Nyb2xsQXR0ci5jdXJyZW50O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Njcm9sbERpcmVjdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNjcm9sbERpcmVjdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNjcm9sbEF0dHIuY3VycmVudCA+IHRoaXMuc2Nyb2xsQXR0ci5wcmV2aW91cykge1xuICAgICAgICAvLyBTY3JvbGwgRG93blxuICAgICAgICB0aGlzLnNjcm9sbEF0dHIuZGlyZWN0aW9uID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNjcm9sbCBVcFxuICAgICAgICB0aGlzLnNjcm9sbEF0dHIuZGlyZWN0aW9uID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVxdWVzdFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1ZXN0VGljaygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsQXR0ci50aWNraW5nKSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpczIudXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5zY3JvbGxBdHRyLnRpY2tpbmcgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbmZpZ3VyZUVsZW0nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25maWd1cmVFbGVtKGVsZW0sIHoxLCB6Mikge1xuICAgICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBcInJlbGF0aXZlXCI7XG5cblxuICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgICBjYXNlIFwiZml4ZWRcIjpcbiAgICAgICAgICBlbGVtLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQodGhpcy5ncmlkQ2xhc3Nlcy51cHBlcik7XG4gICAgICAgICAgZWxlbS5maXJzdEVsZW1lbnRDaGlsZC5zdHlsZS56SW5kZXggPSB6MTtcblxuICAgICAgICAgIGVsZW0ubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMuZ3JpZENsYXNzZXMubG93ZXIpO1xuICAgICAgICAgIGVsZW0ubGFzdEVsZW1lbnRDaGlsZC5zdHlsZS56SW5kZXggPSB6MjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwicmVsYXRpdmVcIjpcbiAgICAgICAgICBlbGVtLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5ncmlkQ2xhc3Nlcy51cHBlcik7XG4gICAgICAgICAgZWxlbS5maXJzdEVsZW1lbnRDaGlsZC5zdHlsZS56SW5kZXggPSB6MTtcblxuICAgICAgICAgIGVsZW0ubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZ3JpZENsYXNzZXMubG93ZXIpO1xuICAgICAgICAgIGVsZW0ubGFzdEVsZW1lbnRDaGlsZC5zdHlsZS56SW5kZXggPSB6MjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbGVhckNsYXNzZXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckNsYXNzZXMoZWxlbSkge1xuICAgICAgZm9yICh2YXIgZSA9IDA7IGUgPCBlbGVtLmxlbmd0aDsgZSsrKSB7XG4gICAgICAgIGVsZW1bZV0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnVwcGVyKTtcbiAgICAgICAgZWxlbVtlXS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZ3JpZENsYXNzZXMubG93ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2lzTW9iaWxlTGF5b3V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNNb2JpbGVMYXlvdXQocGFuZWwpIHtcbiAgICAgIHZhciBncmlkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShwYW5lbCwgbnVsbCk7XG4gICAgICB2YXIgZ3JpZFdpZHRoID0gcGFyc2VJbnQoZ3JpZFN0eWxlLndpZHRoKTtcblxuICAgICAgaWYgKGdyaWRXaWR0aCA9PT0gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQb3NpdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBvc2l0aW9uKGVsZW0pIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHtcbiAgICAgICAgY3VycmVudFRvcDogZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY1QnKSxcbiAgICAgICAgY3VycmVudEJvdDogZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY0InKSxcbiAgICAgICAgcHJldmlvdXNUb3A6IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXBUJyksXG4gICAgICAgIHByZXZpb3VzQm90OiBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1wQicpXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdGhpcy5zY3JvbGxBdHRyLnRpY2tpbmcgPSBmYWxzZTtcblxuICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdmFyIGlzTW9iaWxlID0gdGhpcy5pc01vYmlsZUxheW91dCh0aGlzLmdyaWRFbGVtZW50cy5wYW5lbHNbMF0pO1xuXG4gICAgICBmb3IgKHZhciByID0gMDsgciA8IHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3MubGVuZ3RoOyByKyspIHtcblxuICAgICAgICB2YXIgcm93ID0gdGhpcy5ncmlkRWxlbWVudHMucm93c1tyXTtcblxuICAgICAgICB2YXIgcXVhZHJhbnQgPSB7XG4gICAgICAgICAgY3VycmVudDogcm93LnBhcmVudEVsZW1lbnQsXG4gICAgICAgICAgbmV4dDogcm93LnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLFxuICAgICAgICAgIHByZXZpb3VzOiByb3cucGFyZW50RWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2luZ2xlIENvbHVtbiAoTW9iaWxlKVxuICAgICAgICBpZiAoaXNNb2JpbGUgPT09IHRydWUpIHtcblxuICAgICAgICAgIHZhciByb3dQb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24ocm93KTtcblxuICAgICAgICAgIC8vIFNldCBDdXJyZW50IFBvc2l0aW9uXG4gICAgICAgICAgcm93LnNldEF0dHJpYnV0ZSgnZGF0YS1jVCcsIHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApO1xuICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtY0InLCByb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tKTtcblxuICAgICAgICAgIC8vIFNjcm9sbCBEb3duXG4gICAgICAgICAgaWYgKHJvd1Bvc2l0aW9uLnByZXZpb3VzVG9wID4gMCAmJiByb3dQb3NpdGlvbi5jdXJyZW50VG9wIDw9IDAgJiYgdGhpcy5zY3JvbGxBdHRyLmRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93LCA1LCAxNSwgXCJmaXhlZFwiKTtcblxuICAgICAgICAgICAgaWYgKHJvdy5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHJvdy5uZXh0RWxlbWVudFNpYmxpbmcsIDEwLCAyMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyb3cucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsIDEwLCAyMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWFkcmFudC5uZXh0KSB7XG4gICAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5uZXh0LmZpcnN0RWxlbWVudENoaWxkLCAxMCwgMjApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghcm93Lm5leHRFbGVtZW50U2libGluZykge1xuICAgICAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3Nlcyh0aGlzLmdyaWRFbGVtZW50cy5wYW5lbHMsIHRoaXMuZ3JpZENsYXNzZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVhZHJhbnQucHJldmlvdXMpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHF1YWRyYW50LnByZXZpb3VzLmxhc3RFbGVtZW50Q2hpbGQsIDEwLCAyMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU2Nyb2xsIFVwXG4gICAgICAgICAgaWYgKHJvd1Bvc2l0aW9uLnByZXZpb3VzQm90IDwgdmlld3BvcnRIZWlnaHQgJiYgcm93UG9zaXRpb24uY3VycmVudEJvdCA+PSB2aWV3cG9ydEhlaWdodCAmJiAhdGhpcy5zY3JvbGxBdHRyLmRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93LCAxNSwgNSwgXCJmaXhlZFwiKTtcblxuICAgICAgICAgICAgaWYgKHJvdy5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHJvdy5uZXh0RWxlbWVudFNpYmxpbmcsIDIwLCAxMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyb3cucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsIDIwLCAxMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWFkcmFudC5wcmV2aW91cykge1xuICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocXVhZHJhbnQucHJldmlvdXMubGFzdEVsZW1lbnRDaGlsZCwgMjAsIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICAgIHRoaXMuY2xlYXJDbGFzc2VzKHRoaXMuZ3JpZEVsZW1lbnRzLnBhbmVscywgdGhpcy5ncmlkQ2xhc3Nlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWFkcmFudC5uZXh0KSB7XG4gICAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5uZXh0LmZpcnN0RWxlbWVudENoaWxkLCAyMCwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNldCBQcmV2aW91cyBQb3NpdGlvblxuICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtcFQnLCByb3dQb3NpdGlvbi5jdXJyZW50VG9wKTtcbiAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKCdkYXRhLXBCJywgcm93UG9zaXRpb24uY3VycmVudEJvdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUd2luIGNvbHVtbiAoRGVza3RvcClcbiAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgIHZhciBxdWFkcmFudFBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbihxdWFkcmFudC5jdXJyZW50KTtcblxuICAgICAgICAgICAgLy8gU2V0IEN1cnJlbnQgUG9zaXRpb25cbiAgICAgICAgICAgIHF1YWRyYW50LmN1cnJlbnQuc2V0QXR0cmlidXRlKCdkYXRhLWNUJywgcXVhZHJhbnQuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApO1xuICAgICAgICAgICAgcXVhZHJhbnQuY3VycmVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY0InLCBxdWFkcmFudC5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSk7XG5cbiAgICAgICAgICAgIC8vIFNjcm9sbCBEb3duXG4gICAgICAgICAgICBpZiAocXVhZHJhbnRQb3NpdGlvbi5wcmV2aW91c1RvcCA+IDAgJiYgcXVhZHJhbnRQb3NpdGlvbi5jdXJyZW50VG9wIDw9IDAgJiYgdGhpcy5zY3JvbGxBdHRyLmRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5jdXJyZW50LCA1LCAxNSwgXCJmaXhlZFwiKTtcblxuICAgICAgICAgICAgICBpZiAocXVhZHJhbnQubmV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5uZXh0LCAxMCwgMjApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJDbGFzc2VzKHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3MpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHF1YWRyYW50LnByZXZpb3VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbGVtKHF1YWRyYW50LnByZXZpb3VzLCAxMCwgMjApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNjcm9sbCBVcFxuICAgICAgICAgICAgaWYgKHF1YWRyYW50UG9zaXRpb24ucHJldmlvdXNCb3QgPCB2aWV3cG9ydEhlaWdodCAmJiBxdWFkcmFudFBvc2l0aW9uLmN1cnJlbnRCb3QgPj0gdmlld3BvcnRIZWlnaHQgJiYgIXRoaXMuc2Nyb2xsQXR0ci5kaXJlY3Rpb24pIHtcblxuICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocXVhZHJhbnQuY3VycmVudCwgMTUsIDUsIFwiZml4ZWRcIik7XG5cbiAgICAgICAgICAgICAgaWYgKHF1YWRyYW50Lm5leHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVsZW0ocXVhZHJhbnQubmV4dCwgMjAsIDEwKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChxdWFkcmFudC5wcmV2aW91cykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRWxlbShxdWFkcmFudC5wcmV2aW91cywgMjAsIDEwKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3Nlcyh0aGlzLmdyaWRFbGVtZW50cy5yb3dzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgUHJldmlvdXMgUG9zaXRpb25cbiAgICAgICAgICAgIHF1YWRyYW50LmN1cnJlbnQuc2V0QXR0cmlidXRlKCdkYXRhLXBUJywgcXVhZHJhbnRQb3NpdGlvbi5jdXJyZW50VG9wKTtcbiAgICAgICAgICAgIHF1YWRyYW50LmN1cnJlbnQuc2V0QXR0cmlidXRlKCdkYXRhLXBCJywgcXVhZHJhbnRQb3NpdGlvbi5jdXJyZW50Qm90KTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFBhcmFsbGF4R3JpZDtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gUGFyYWxsYXhHcmlkO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWxCaGNtRnNiR0Y0UjNKcFpDNXFjeUpkTENKdVlXMWxjeUk2V3lKUVlYSmhiR3hoZUVkeWFXUWlMQ0p6WTNKdmJHeEJkSFJ5SWl3aWNISmxkbWx2ZFhNaUxDSmpkWEp5Wlc1MElpd2laR2x5WldOMGFXOXVJaXdpZEdsamEybHVaeUlzSW1keWFXUkRiR0Z6YzJWeklpd2ljbTkzSWl3aWRYQndaWElpTENKc2IzZGxjaUlzSW1keWFXUkZiR1Z0Wlc1MGN5SXNJbkYxWVdSeVlXNTBjeUlzSW1SdlkzVnRaVzUwSWl3aWNYVmxjbmxUWld4bFkzUnZja0ZzYkNJc0luSnZkM01pTENKd1lXNWxiSE1pTENKc2FYTjBaVzVsY25NaUxDSjNhVzVrYjNjaUxDSmhaR1JGZG1WdWRFeHBjM1JsYm1WeUlpd2liMjVUWTNKdmJHd2lMQ0p3WVdkbFdVOW1abk5sZENJc0ltUnZZM1Z0Wlc1MFJXeGxiV1Z1ZENJc0luTmpjbTlzYkZSdmNDSXNJbk5qY205c2JFUnBjbVZqZEdsdmJpSXNJbkpsY1hWbGMzUlVhV05ySWl3aWNtVnhkV1Z6ZEVGdWFXMWhkR2x2YmtaeVlXMWxJaXdpZFhCa1lYUmxJaXdpWld4bGJTSXNJbm94SWl3aWVqSWlMQ0p3YjNOcGRHbHZiaUlzSW1acGNuTjBSV3hsYldWdWRFTm9hV3hrSWl3aVkyeGhjM05NYVhOMElpd2lZV1JrSWl3aWMzUjViR1VpTENKNlNXNWtaWGdpTENKc1lYTjBSV3hsYldWdWRFTm9hV3hrSWl3aWNtVnRiM1psSWl3aVpTSXNJbXhsYm1kMGFDSXNJbkJoYm1Wc0lpd2laM0pwWkZOMGVXeGxJaXdpWjJWMFEyOXRjSFYwWldSVGRIbHNaU0lzSW1keWFXUlhhV1IwYUNJc0luQmhjbk5sU1c1MElpd2lkMmxrZEdnaUxDSnBibTVsY2xkcFpIUm9JaXdpWTNWeWNtVnVkRlJ2Y0NJc0ltZGxkRUYwZEhKcFluVjBaU0lzSW1OMWNuSmxiblJDYjNRaUxDSndjbVYyYVc5MWMxUnZjQ0lzSW5CeVpYWnBiM1Z6UW05MElpd2lkbWxsZDNCdmNuUklaV2xuYUhRaUxDSnBibTVsY2tobGFXZG9kQ0lzSW1selRXOWlhV3hsSWl3aWFYTk5iMkpwYkdWTVlYbHZkWFFpTENKeUlpd2ljWFZoWkhKaGJuUWlMQ0p3WVhKbGJuUkZiR1Z0Wlc1MElpd2libVY0ZENJc0ltNWxlSFJGYkdWdFpXNTBVMmxpYkdsdVp5SXNJbkJ5WlhacGIzVnpSV3hsYldWdWRGTnBZbXhwYm1jaUxDSnliM2RRYjNOcGRHbHZiaUlzSW1kbGRGQnZjMmwwYVc5dUlpd2ljMlYwUVhSMGNtbGlkWFJsSWl3aVoyVjBRbTkxYm1ScGJtZERiR2xsYm5SU1pXTjBJaXdpZEc5d0lpd2lZbTkwZEc5dElpd2lZMjl1Wm1sbmRYSmxSV3hsYlNJc0ltTnNaV0Z5UTJ4aGMzTmxjeUlzSW5GMVlXUnlZVzUwVUc5emFYUnBiMjRpWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN096czdTVUZCY1VKQkxGazdRVUZGYmtJc01FSkJRV003UVVGQlFUczdRVUZEV2l4VFFVRkxReXhWUVVGTUxFZEJRV3RDTzBGQlEyaENReXhuUWtGQlZTeERRVVJOTzBGQlJXaENReXhsUVVGVExFTkJSazg3UVVGSGFFSkRMR2xDUVVGWExFdEJTRXM3UVVGSmFFSkRMR1ZCUVZNN1FVRktUeXhMUVVGc1FqczdRVUZQUVN4VFFVRkxReXhYUVVGTUxFZEJRVzFDTzBGQlEycENReXhYUVVGTkxHRkJSRmM3UVVGRmFrSkRMR0ZCUVU4c2MwSkJSbFU3UVVGSGFrSkRMR0ZCUVU4N1FVRklWU3hMUVVGdVFqczdRVUZOUVN4VFFVRkxReXhaUVVGTUxFZEJRVzlDTzBGQlEyeENReXhwUWtGQlYwTXNVMEZCVTBNc1owSkJRVlFzUTBGQk1FSXNiVUpCUVRGQ0xFTkJSRTg3UVVGRmJFSkRMRmxCUVUxR0xGTkJRVk5ETEdkQ1FVRlVMRU5CUVRCQ0xHTkJRVEZDTEVOQlJsazdRVUZIYkVKRkxHTkJRVkZJTEZOQlFWTkRMR2RDUVVGVUxFTkJRVEJDTEdkQ1FVRXhRanRCUVVoVkxFdEJRWEJDT3p0QlFVMUJMRk5CUVV0SExGTkJRVXc3UVVGRFJEczdPenRuUTBGRlZ6dEJRVUZCT3p0QlFVTldReXhoUVVGUFF5eG5Ra0ZCVUN4RFFVRjNRaXhSUVVGNFFpeEZRVUZyUXp0QlFVRkJMR1ZCUVUwc1RVRkJTME1zVVVGQlRDeEZRVUZPTzBGQlFVRXNUMEZCYkVNc1JVRkJlVVFzUzBGQmVrUTdRVUZEUkRzN095dENRVVZWTzBGQlExUXNWMEZCUzJ4Q0xGVkJRVXdzUTBGQlowSkZMRTlCUVdoQ0xFZEJRVEJDWXl4UFFVRlBSeXhYUVVGUUxFbEJRWE5DVWl4VFFVRlRVeXhsUVVGVUxFTkJRWGxDUXl4VFFVRjZSVHM3UVVGRlFUdEJRVU5CTEZkQlFVdERMR1ZCUVV3N08wRkJSVUU3UVVGRFFTeFhRVUZMUXl4WFFVRk1PenRCUVVWQkxGZEJRVXQyUWl4VlFVRk1MRU5CUVdkQ1F5eFJRVUZvUWl4SFFVRXlRaXhMUVVGTFJDeFZRVUZNTEVOQlFXZENSU3hQUVVFelF6dEJRVU5FT3pzN2MwTkJSV2xDTzBGQlEyaENMRlZCUVVrc1MwRkJTMFlzVlVGQlRDeERRVUZuUWtVc1QwRkJhRUlzUjBGQk1FSXNTMEZCUzBZc1ZVRkJUQ3hEUVVGblFrTXNVVUZCT1VNc1JVRkJkMFE3UVVGRGRFUTdRVUZEUVN4aFFVRkxSQ3hWUVVGTUxFTkJRV2RDUnl4VFFVRm9RaXhIUVVFMFFpeEpRVUUxUWp0QlFVTkVMRTlCU0VRc1RVRkhUenRCUVVOTU8wRkJRMEVzWVVGQlMwZ3NWVUZCVEN4RFFVRm5Ra2NzVTBGQmFFSXNSMEZCTkVJc1MwRkJOVUk3UVVGRFJEdEJRVU5HT3pzN2EwTkJSV0U3UVVGQlFUczdRVUZEV2l4VlFVRkhMRU5CUVVNc1MwRkJTMGdzVlVGQlRDeERRVUZuUWtrc1QwRkJjRUlzUlVGQk5rSTdRVUZETTBKWkxHVkJRVTlSTEhGQ1FVRlFMRU5CUVRaQ08wRkJRVUVzYVVKQlFVMHNUMEZCUzBNc1RVRkJUQ3hGUVVGT08wRkJRVUVzVTBGQk4wSTdRVUZEUkR0QlFVTkVMRmRCUVV0NlFpeFZRVUZNTEVOQlFXZENTU3hQUVVGb1FpeEhRVUV3UWl4SlFVRXhRanRCUVVORU96czdhME5CUldGelFpeEpMRVZCUVUxRExFVXNSVUZCU1VNc1JTeEZRVUV5UWp0QlFVRkJMRlZCUVhaQ1F5eFJRVUYxUWl4MVJVRkJXaXhWUVVGWk96czdRVUZGYWtRc1kwRkJUMEVzVVVGQlVEdEJRVU5GTEdGQlFVc3NUMEZCVER0QlFVTkZTQ3hsUVVGTFNTeHBRa0ZCVEN4RFFVRjFRa01zVTBGQmRrSXNRMEZCYVVORExFZEJRV3BETEVOQlFYRkRMRXRCUVVzelFpeFhRVUZNTEVOQlFXbENSU3hMUVVGMFJEdEJRVU5CYlVJc1pVRkJTMGtzYVVKQlFVd3NRMEZCZFVKSExFdEJRWFpDTEVOQlFUWkNReXhOUVVFM1FpeEhRVUZ6UTFBc1JVRkJkRU03TzBGQlJVRkVMR1ZCUVV0VExHZENRVUZNTEVOQlFYTkNTaXhUUVVGMFFpeERRVUZuUTBNc1IwRkJhRU1zUTBGQmIwTXNTMEZCU3pOQ0xGZEJRVXdzUTBGQmFVSkhMRXRCUVhKRU8wRkJRMEZyUWl4bFFVRkxVeXhuUWtGQlRDeERRVUZ6UWtZc1MwRkJkRUlzUTBGQk5FSkRMRTFCUVRWQ0xFZEJRWEZEVGl4RlFVRnlRenRCUVVOQk96dEJRVVZHTEdGQlFVc3NWVUZCVER0QlFVTkZSaXhsUVVGTFNTeHBRa0ZCVEN4RFFVRjFRa01zVTBGQmRrSXNRMEZCYVVOTExFMUJRV3BETEVOQlFYZERMRXRCUVVzdlFpeFhRVUZNTEVOQlFXbENSU3hMUVVGNlJEdEJRVU5CYlVJc1pVRkJTMGtzYVVKQlFVd3NRMEZCZFVKSExFdEJRWFpDTEVOQlFUWkNReXhOUVVFM1FpeEhRVUZ6UTFBc1JVRkJkRU03TzBGQlJVRkVMR1ZCUVV0VExHZENRVUZNTEVOQlFYTkNTaXhUUVVGMFFpeERRVUZuUTBzc1RVRkJhRU1zUTBGQmRVTXNTMEZCU3k5Q0xGZEJRVXdzUTBGQmFVSkhMRXRCUVhoRU8wRkJRMEZyUWl4bFFVRkxVeXhuUWtGQlRDeERRVUZ6UWtZc1MwRkJkRUlzUTBGQk5FSkRMRTFCUVRWQ0xFZEJRWEZEVGl4RlFVRnlRenRCUVVOQk8wRkJaa283UVVGcFFrUTdPenRwUTBGRldVWXNTU3hGUVVGTk8wRkJRMnBDTEZkQlFVc3NTVUZCU1Zjc1NVRkJTU3hEUVVGaUxFVkJRV2RDUVN4SlFVRkpXQ3hMUVVGTFdTeE5RVUY2UWl4RlFVRnBRMFFzUjBGQmFrTXNSVUZCYzBNN1FVRkRjRU5ZTEdGQlFVdFhMRU5CUVV3c1JVRkJVVTRzVTBGQlVpeERRVUZyUWtzc1RVRkJiRUlzUTBGQmVVSXNTMEZCU3k5Q0xGZEJRVXdzUTBGQmFVSkZMRXRCUVRGRE8wRkJRMEZ0UWl4aFFVRkxWeXhEUVVGTUxFVkJRVkZPTEZOQlFWSXNRMEZCYTBKTExFMUJRV3hDTEVOQlFYbENMRXRCUVVzdlFpeFhRVUZNTEVOQlFXbENSeXhMUVVFeFF6dEJRVU5FTzBGQlEwWTdPenR0UTBGRll5dENMRXNzUlVGQlR6dEJRVU53UWl4VlFVRk5ReXhaUVVGWmVFSXNUMEZCVDNsQ0xHZENRVUZRTEVOQlFYZENSaXhMUVVGNFFpeEZRVUVyUWl4SlFVRXZRaXhEUVVGc1FqdEJRVU5CTEZWQlFVMUhMRmxCUVZsRExGTkJRVk5JTEZWQlFWVkpMRXRCUVc1Q0xFTkJRV3hDT3p0QlFVVkJMRlZCUVVsR0xHTkJRV014UWl4UFFVRlBOa0lzVlVGQmVrSXNSVUZCY1VNN1FVRkRia01zWlVGQlR5eEpRVUZRTzBGQlEwUTdPMEZCUlVRc1lVRkJUeXhMUVVGUU8wRkJRMFE3T3p0blEwRkZWMjVDTEVrc1JVRkJUVHRCUVVOb1FpeFZRVUZOUnl4WFFVRlhPMEZCUTJacFFpeHZRa0ZCV1hCQ0xFdEJRVXR4UWl4WlFVRk1MRU5CUVd0Q0xGTkJRV3hDTEVOQlJFYzdRVUZGWmtNc2IwSkJRVmwwUWl4TFFVRkxjVUlzV1VGQlRDeERRVUZyUWl4VFFVRnNRaXhEUVVaSE8wRkJSMlpGTEhGQ1FVRmhka0lzUzBGQlMzRkNMRmxCUVV3c1EwRkJhMElzVTBGQmJFSXNRMEZJUlR0QlFVbG1SeXh4UWtGQllYaENMRXRCUVV0eFFpeFpRVUZNTEVOQlFXdENMRk5CUVd4Q08wRkJTa1VzVDBGQmFrSTdPMEZCVDBFc1lVRkJUMnhDTEZGQlFWQTdRVUZEUkRzN096WkNRVVZSTzBGQlExQXNWMEZCU3pkQ0xGVkJRVXdzUTBGQlowSkpMRTlCUVdoQ0xFZEJRVEJDTEV0QlFURkNPenRCUVVWQkxGVkJRVTByUXl4cFFrRkJhVUp1UXl4UFFVRlBiME1zVjBGQk9VSTdRVUZEUVN4VlFVRk5ReXhYUVVGWExFdEJRVXRETEdOQlFVd3NRMEZCYjBJc1MwRkJTemRETEZsQlFVd3NRMEZCYTBKTExFMUJRV3hDTEVOQlFYbENMRU5CUVhwQ0xFTkJRWEJDTEVOQlFXcENPenRCUVVWQkxGZEJRVXNzU1VGQlNYbERMRWxCUVVrc1EwRkJZaXhGUVVGblFrRXNTVUZCU1N4TFFVRkxPVU1zV1VGQlRDeERRVUZyUWtrc1NVRkJiRUlzUTBGQmRVSjVRaXhOUVVFelF5eEZRVUZ0UkdsQ0xFZEJRVzVFTEVWQlFYZEVPenRCUVVWMFJDeFpRVUZOYWtRc1RVRkJUU3hMUVVGTFJ5eFpRVUZNTEVOQlFXdENTU3hKUVVGc1FpeERRVUYxUWpCRExFTkJRWFpDTEVOQlFWbzdPMEZCUlVFc1dVRkJUVU1zVjBGQlZ6dEJRVU5tZEVRc2JVSkJRVk5KTEVsQlFVbHRSQ3hoUVVSRk8wRkJSV1pETEdkQ1FVRk5jRVFzU1VGQlNXMUVMR0ZCUVVvc1EwRkJhMEpGTEd0Q1FVWlVPMEZCUjJZeFJDeHZRa0ZCVlVzc1NVRkJTVzFFTEdGQlFVb3NRMEZCYTBKSE8wRkJTR0lzVTBGQmFrSTdPMEZCVFVFN1FVRkRRU3haUVVGSlVDeGhRVUZoTEVsQlFXcENMRVZCUVhWQ096dEJRVVZ5UWl4alFVRk5VU3hqUVVGakxFdEJRVXRETEZkQlFVd3NRMEZCYVVKNFJDeEhRVUZxUWl4RFFVRndRanM3UVVGRlFUdEJRVU5CUVN4alFVRkplVVFzV1VGQlNpeERRVUZwUWl4VFFVRnFRaXhGUVVFMFFucEVMRWxCUVVrd1JDeHhRa0ZCU2l4SFFVRTBRa01zUjBGQmVFUTdRVUZEUVRORUxHTkJRVWw1UkN4WlFVRktMRU5CUVdsQ0xGTkJRV3BDTEVWQlFUUkNla1FzU1VGQlNUQkVMSEZDUVVGS0xFZEJRVFJDUlN4TlFVRjRSRHM3UVVGRlFUdEJRVU5CTEdOQlFVbE1MRmxCUVZsYUxGZEJRVm9zUjBGQk1FSXNRMEZCTVVJc1NVRkJLMEpaTEZsQlFWbG1MRlZCUVZvc1NVRkJNRUlzUTBGQmVrUXNTVUZCT0VRc1MwRkJTemxETEZWQlFVd3NRMEZCWjBKSExGTkJRV3hHTEVWQlFUWkdPenRCUVVVelJpeHBRa0ZCUzJkRkxHRkJRVXdzUTBGQmJVSTNSQ3hIUVVGdVFpeEZRVUYzUWl4RFFVRjRRaXhGUVVFeVFpeEZRVUV6UWl4RlFVRXJRaXhQUVVFdlFqczdRVUZGUVN4blFrRkJTVUVzU1VGQlNYRkVMR3RDUVVGU0xFVkJRVFJDTzBGQlF6RkNMRzFDUVVGTFVTeGhRVUZNTEVOQlFXMUNOMFFzU1VGQlNYRkVMR3RDUVVGMlFpeEZRVUV5UXl4RlFVRXpReXhGUVVFclF5eEZRVUV2UXp0QlFVTkVPenRCUVVWRUxHZENRVUZKY2tRc1NVRkJTWE5FTEhOQ1FVRlNMRVZCUVdkRE8wRkJRemxDTEcxQ1FVRkxUeXhoUVVGTUxFTkJRVzFDTjBRc1NVRkJTWE5FTEhOQ1FVRjJRaXhGUVVFclF5eEZRVUV2UXl4RlFVRnRSQ3hGUVVGdVJEdEJRVU5FT3p0QlFVVkVMR2RDUVVGSlNpeFRRVUZUUlN4SlFVRmlMRVZCUVcxQ08wRkJRMnBDTEcxQ1FVRkxVeXhoUVVGTUxFTkJRVzFDV0N4VFFVRlRSU3hKUVVGVUxFTkJRV00xUWl4cFFrRkJha01zUlVGQmIwUXNSVUZCY0VRc1JVRkJkMFFzUlVGQmVFUTdRVUZEUkN4aFFVWkVMRTFCUlU4c1NVRkJTU3hEUVVGRGVFSXNTVUZCU1hGRUxHdENRVUZVTEVWQlFUWkNPMEZCUTJ4RExHMUNRVUZMVXl4WlFVRk1MRU5CUVd0Q0xFdEJRVXN6UkN4WlFVRk1MRU5CUVd0Q1N5eE5RVUZ3UXl4RlFVRTBReXhMUVVGTFZDeFhRVUZxUkR0QlFVTkVPenRCUVVWRUxHZENRVUZKYlVRc1UwRkJVM1pFTEZGQlFXSXNSVUZCZFVJN1FVRkRja0lzYlVKQlFVdHJSU3hoUVVGTUxFTkJRVzFDV0N4VFFVRlRka1FzVVVGQlZDeERRVUZyUW10RExHZENRVUZ5UXl4RlFVRjFSQ3hGUVVGMlJDeEZRVUV5UkN4RlFVRXpSRHRCUVVORU8wRkJSVVk3TzBGQlJVUTdRVUZEUVN4alFVRkpNRUlzV1VGQldWZ3NWMEZCV2l4SFFVRXdRa01zWTBGQk1VSXNTVUZCTkVOVkxGbEJRVmxpTEZWQlFWb3NTVUZCTUVKSExHTkJRWFJGTEVsQlFYZEdMRU5CUVVNc1MwRkJTMjVFTEZWQlFVd3NRMEZCWjBKSExGTkJRVGRITEVWQlFYZElPenRCUVVWMFNDeHBRa0ZCUzJkRkxHRkJRVXdzUTBGQmJVSTNSQ3hIUVVGdVFpeEZRVUYzUWl4RlFVRjRRaXhGUVVFMFFpeERRVUUxUWl4RlFVRXJRaXhQUVVFdlFqczdRVUZGUVN4blFrRkJTVUVzU1VGQlNYRkVMR3RDUVVGU0xFVkJRVFJDTzBGQlF6RkNMRzFDUVVGTFVTeGhRVUZNTEVOQlFXMUNOMFFzU1VGQlNYRkVMR3RDUVVGMlFpeEZRVUV5UXl4RlFVRXpReXhGUVVFclF5eEZRVUV2UXp0QlFVTkVPenRCUVVWRUxHZENRVUZKY2tRc1NVRkJTWE5FTEhOQ1FVRlNMRVZCUVdkRE8wRkJRemxDTEcxQ1FVRkxUeXhoUVVGTUxFTkJRVzFDTjBRc1NVRkJTWE5FTEhOQ1FVRjJRaXhGUVVFclF5eEZRVUV2UXl4RlFVRnRSQ3hGUVVGdVJEdEJRVU5FT3p0QlFVVkVMR2RDUVVGSlNpeFRRVUZUZGtRc1VVRkJZaXhGUVVGMVFqdEJRVU55UWl4dFFrRkJTMnRGTEdGQlFVd3NRMEZCYlVKWUxGTkJRVk4yUkN4UlFVRlVMRU5CUVd0Q2EwTXNaMEpCUVhKRExFVkJRWFZFTEVWQlFYWkVMRVZCUVRKRUxFVkJRVE5FTzBGQlEwUXNZVUZHUkN4TlFVVlBMRWxCUVVrc1EwRkJRemRDTEVsQlFVbHpSQ3h6UWtGQlZDeEZRVUZwUXp0QlFVTjBReXh0UWtGQlMxRXNXVUZCVEN4RFFVRnJRaXhMUVVGTE0wUXNXVUZCVEN4RFFVRnJRa3NzVFVGQmNFTXNSVUZCTkVNc1MwRkJTMVFzVjBGQmFrUTdRVUZEUkRzN1FVRkZSQ3huUWtGQlNXMUVMRk5CUVZORkxFbEJRV0lzUlVGQmJVSTdRVUZEYWtJc2JVSkJRVXRUTEdGQlFVd3NRMEZCYlVKWUxGTkJRVk5GTEVsQlFWUXNRMEZCWXpWQ0xHbENRVUZxUXl4RlFVRnZSQ3hGUVVGd1JDeEZRVUYzUkN4RlFVRjRSRHRCUVVORU8wRkJRMFk3TzBGQlJVUTdRVUZEUVhoQ0xHTkJRVWw1UkN4WlFVRktMRU5CUVdsQ0xGTkJRV3BDTEVWQlFUUkNSaXhaUVVGWlppeFZRVUY0UXp0QlFVTkJlRU1zWTBGQlNYbEVMRmxCUVVvc1EwRkJhVUlzVTBGQmFrSXNSVUZCTkVKR0xGbEJRVmxpTEZWQlFYaERPMEZCUTBRN08wRkJSVVE3UVVFNVJFRXNZVUVyUkVzN08wRkJSVWdzWjBKQlFVMXhRaXh0UWtGQmJVSXNTMEZCUzFBc1YwRkJUQ3hEUVVGcFFrNHNVMEZCVTNSRUxFOUJRVEZDTEVOQlFYcENPenRCUVVWQk8wRkJRMEZ6UkN4eFFrRkJVM1JFTEU5QlFWUXNRMEZCYVVJMlJDeFpRVUZxUWl4RFFVRTRRaXhUUVVFNVFpeEZRVUY1UTFBc1UwRkJVM1JFTEU5QlFWUXNRMEZCYVVJNFJDeHhRa0ZCYWtJc1IwRkJlVU5ETEVkQlFXeEdPMEZCUTBGVUxIRkNRVUZUZEVRc1QwRkJWQ3hEUVVGcFFqWkVMRmxCUVdwQ0xFTkJRVGhDTEZOQlFUbENMRVZCUVhsRFVDeFRRVUZUZEVRc1QwRkJWQ3hEUVVGcFFqaEVMSEZDUVVGcVFpeEhRVUY1UTBVc1RVRkJiRVk3TzBGQlJVRTdRVUZEUVN4blFrRkJTVWNzYVVKQlFXbENjRUlzVjBGQmFrSXNSMEZCSzBJc1EwRkJMMElzU1VGQmIwTnZRaXhwUWtGQmFVSjJRaXhWUVVGcVFpeEpRVUVyUWl4RFFVRnVSU3hKUVVGM1JTeExRVUZMT1VNc1ZVRkJUQ3hEUVVGblFrY3NVMEZCTlVZc1JVRkJkVWM3TzBGQlJYSkhMRzFDUVVGTFowVXNZVUZCVEN4RFFVRnRRbGdzVTBGQlUzUkVMRTlCUVRWQ0xFVkJRWEZETEVOQlFYSkRMRVZCUVhkRExFVkJRWGhETEVWQlFUUkRMRTlCUVRWRE96dEJRVVZCTEd0Q1FVRkpjMFFzVTBGQlUwVXNTVUZCWWl4RlFVRnRRanRCUVVOcVFpeHhRa0ZCUzFNc1lVRkJUQ3hEUVVGdFFsZ3NVMEZCVTBVc1NVRkJOVUlzUlVGQmEwTXNSVUZCYkVNc1JVRkJjME1zUlVGQmRFTTdRVUZEUkN4bFFVWkVMRTFCUlU4N1FVRkRUQ3h4UWtGQlMxVXNXVUZCVEN4RFFVRnJRaXhMUVVGTE0wUXNXVUZCVEN4RFFVRnJRa2tzU1VGQmNFTTdRVUZEUkRzN1FVRkZSQ3hyUWtGQlNUSkRMRk5CUVZOMlJDeFJRVUZpTEVWQlFYVkNPMEZCUTNKQ0xIRkNRVUZMYTBVc1lVRkJUQ3hEUVVGdFFsZ3NVMEZCVTNaRUxGRkJRVFZDTEVWQlFYTkRMRVZCUVhSRExFVkJRVEJETEVWQlFURkRPMEZCUTBRN1FVRkRSanM3UVVGRlJEdEJRVU5CTEdkQ1FVRkpiMFVzYVVKQlFXbENia0lzVjBGQmFrSXNSMEZCSzBKRExHTkJRUzlDTEVsQlFXbEVhMElzYVVKQlFXbENja0lzVlVGQmFrSXNTVUZCSzBKSExHTkJRV2hHTEVsQlFXdEhMRU5CUVVNc1MwRkJTMjVFTEZWQlFVd3NRMEZCWjBKSExGTkJRWFpJTEVWQlFXdEpPenRCUVVWb1NTeHRRa0ZCUzJkRkxHRkJRVXdzUTBGQmJVSllMRk5CUVZOMFJDeFBRVUUxUWl4RlFVRnhReXhGUVVGeVF5eEZRVUY1UXl4RFFVRjZReXhGUVVFMFF5eFBRVUUxUXpzN1FVRkZRU3hyUWtGQlNYTkVMRk5CUVZORkxFbEJRV0lzUlVGQmJVSTdRVUZEYWtJc2NVSkJRVXRUTEdGQlFVd3NRMEZCYlVKWUxGTkJRVk5GTEVsQlFUVkNMRVZCUVd0RExFVkJRV3hETEVWQlFYTkRMRVZCUVhSRE8wRkJRMFE3TzBGQlJVUXNhMEpCUVVsR0xGTkJRVk4yUkN4UlFVRmlMRVZCUVhWQ08wRkJRM0pDTEhGQ1FVRkxhMFVzWVVGQlRDeERRVUZ0UWxnc1UwRkJVM1pFTEZGQlFUVkNMRVZCUVhORExFVkJRWFJETEVWQlFUQkRMRVZCUVRGRE8wRkJRMFFzWlVGR1JDeE5RVVZQTzBGQlEwd3NjVUpCUVV0dFJTeFpRVUZNTEVOQlFXdENMRXRCUVVzelJDeFpRVUZNTEVOQlFXdENTU3hKUVVGd1F6dEJRVU5FTzBGQlEwWTdPMEZCUlVRN1FVRkRRVEpETEhGQ1FVRlRkRVFzVDBGQlZDeERRVUZwUWpaRUxGbEJRV3BDTEVOQlFUaENMRk5CUVRsQ0xFVkJRWGxEVFN4cFFrRkJhVUoyUWl4VlFVRXhSRHRCUVVOQlZTeHhRa0ZCVTNSRUxFOUJRVlFzUTBGQmFVSTJSQ3haUVVGcVFpeERRVUU0UWl4VFFVRTVRaXhGUVVGNVEwMHNhVUpCUVdsQ2NrSXNWVUZCTVVRN1FVRkRSRHRCUVVOR08wRkJRMFk3T3pzN096dHJRa0Y2VDJ0Q2FrUXNXU0lzSW1acGJHVWlPaUpRWVhKaGJHeGhlRWR5YVdRdWFuTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpsZUhCdmNuUWdaR1ZtWVhWc2RDQmpiR0Z6Y3lCUVlYSmhiR3hoZUVkeWFXUWdlMXh1WEc0Z0lHTnZibk4wY25WamRHOXlLQ2tnZTF4dUlDQWdJSFJvYVhNdWMyTnliMnhzUVhSMGNpQTlJSHRjYmlBZ0lDQWdJSEJ5WlhacGIzVnpPaUF3TEZ4dUlDQWdJQ0FnWTNWeWNtVnVkRG9nTUN4Y2JpQWdJQ0FnSUdScGNtVmpkR2x2YmpvZ1ptRnNjMlVzWEc0Z0lDQWdJQ0IwYVdOcmFXNW5PaUJtWVd4elpWeHVJQ0FnSUgwN1hHNWNiaUFnSUNCMGFHbHpMbWR5YVdSRGJHRnpjMlZ6SUQwZ2V5QmNiaUFnSUNBZ0lISnZkem9nSUNkakxXZHlhV1JmWDNKdmR5Y3NYRzRnSUNBZ0lDQjFjSEJsY2pvZ0ozVXRjRzl6YVhScGIyNXBibWN0TFhWd2NHVnlKeXdnWEc0Z0lDQWdJQ0JzYjNkbGNqb2dKM1V0Y0c5emFYUnBiMjVwYm1jdExXeHZkMlZ5Snl4Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnZEdocGN5NW5jbWxrUld4bGJXVnVkSE1nUFNCN1hHNGdJQ0FnSUNCeGRXRmtjbUZ1ZEhNNklHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0pCYkd3b0p5NWpMV2R5YVdSZlgzRjFZV1J5WVc1MEp5a3NYRzRnSUNBZ0lDQnliM2R6T2lCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlRV3hzS0NjdVl5MW5jbWxrWDE5eWIzY25LU3hjYmlBZ0lDQWdJSEJoYm1Wc2N6b2daRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2tGc2JDZ25MbU10WjNKcFpGOWZjR0Z1Wld3bktWeHVJQ0FnSUgwN1hHNWNiaUFnSUNCMGFHbHpMbXhwYzNSbGJtVnljeWdwTzF4dUlDQjlYRzVjYmlBZ2JHbHpkR1Z1WlhKektDa2dlMXh1SUNBZ0lIZHBibVJ2ZHk1aFpHUkZkbVZ1ZEV4cGMzUmxibVZ5S0NkelkzSnZiR3duTENBb0tTQTlQaUIwYUdsekxtOXVVMk55YjJ4c0tDa3NJR1poYkhObEtUdGNiaUFnZlZ4dVhHNGdJRzl1VTJOeWIyeHNLQ2tnZTF4dUlDQWdJSFJvYVhNdWMyTnliMnhzUVhSMGNpNWpkWEp5Wlc1MElEMGdkMmx1Wkc5M0xuQmhaMlZaVDJabWMyVjBJSHg4SUdSdlkzVnRaVzUwTG1SdlkzVnRaVzUwUld4bGJXVnVkQzV6WTNKdmJHeFViM0E3WEc1Y2JpQWdJQ0F2THlCRVpYUmxjbTFwYm1VZ2QyaHBZMmdnZDJGNUlIUm9aU0IxYzJWeUlHbHpJSE5qY205c2JHbHVaMXh1SUNBZ0lIUm9hWE11YzJOeWIyeHNSR2x5WldOMGFXOXVLQ2s3WEc0Z0lDQWdYRzRnSUNBZ0x5OGdSR1ZpYjNWdVkyVWdKaUJWY0dSaGRHVmNiaUFnSUNCMGFHbHpMbkpsY1hWbGMzUlVhV05yS0NrN0lGeHVYRzRnSUNBZ2RHaHBjeTV6WTNKdmJHeEJkSFJ5TG5CeVpYWnBiM1Z6SUQwZ2RHaHBjeTV6WTNKdmJHeEJkSFJ5TG1OMWNuSmxiblE3WEc0Z0lIMWNibHh1SUNCelkzSnZiR3hFYVhKbFkzUnBiMjRvS1NCN0lGeHVJQ0FnSUdsbUlDaDBhR2x6TG5OamNtOXNiRUYwZEhJdVkzVnljbVZ1ZENBK0lIUm9hWE11YzJOeWIyeHNRWFIwY2k1d2NtVjJhVzkxY3lrZ2UxeHVJQ0FnSUNBZ0x5OGdVMk55YjJ4c0lFUnZkMjVjYmlBZ0lDQWdJSFJvYVhNdWMyTnliMnhzUVhSMGNpNWthWEpsWTNScGIyNGdQU0IwY25WbE95QWdJRnh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBdkx5QlRZM0p2Ykd3Z1ZYQmNiaUFnSUNBZ0lIUm9hWE11YzJOeWIyeHNRWFIwY2k1a2FYSmxZM1JwYjI0Z1BTQm1ZV3h6WlRzZ0lGeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lISmxjWFZsYzNSVWFXTnJLQ2tnZTF4dUlDQWdJR2xtS0NGMGFHbHpMbk5qY205c2JFRjBkSEl1ZEdsamEybHVaeWtnZTF4dUlDQWdJQ0FnZDJsdVpHOTNMbkpsY1hWbGMzUkJibWx0WVhScGIyNUdjbUZ0WlNnb0tTQTlQaUIwYUdsekxuVndaR0YwWlNncEtUdGNiaUFnSUNCOVhHNGdJQ0FnZEdocGN5NXpZM0p2Ykd4QmRIUnlMblJwWTJ0cGJtY2dQU0IwY25WbE8xeHVJQ0I5WEc1Y2JpQWdZMjl1Wm1sbmRYSmxSV3hsYlNobGJHVnRMQ0I2TVN3Z2VqSXNJSEJ2YzJsMGFXOXVJRDBnWENKeVpXeGhkR2wyWlZ3aUtTQjdYRzVjYmlBZ0lDQnpkMmwwWTJnb2NHOXphWFJwYjI0cElIdGNiaUFnSUNBZ0lHTmhjMlVnWENKbWFYaGxaRndpT2x4dUlDQWdJQ0FnSUNCbGJHVnRMbVpwY25OMFJXeGxiV1Z1ZEVOb2FXeGtMbU5zWVhOelRHbHpkQzVoWkdRb2RHaHBjeTVuY21sa1EyeGhjM05sY3k1MWNIQmxjaWs3WEc0Z0lDQWdJQ0FnSUdWc1pXMHVabWx5YzNSRmJHVnRaVzUwUTJocGJHUXVjM1I1YkdVdWVrbHVaR1Y0SUQwZ2VqRTdYRzVjYmlBZ0lDQWdJQ0FnWld4bGJTNXNZWE4wUld4bGJXVnVkRU5vYVd4a0xtTnNZWE56VEdsemRDNWhaR1FvZEdocGN5NW5jbWxrUTJ4aGMzTmxjeTVzYjNkbGNpazdYRzRnSUNBZ0lDQWdJR1ZzWlcwdWJHRnpkRVZzWlcxbGJuUkRhR2xzWkM1emRIbHNaUzU2U1c1a1pYZ2dQU0I2TWp0Y2JpQWdJQ0FnSUNBZ1luSmxZV3M3WEc1Y2JpQWdJQ0FnSUdOaGMyVWdYQ0p5Wld4aGRHbDJaVndpT2x4dUlDQWdJQ0FnSUNCbGJHVnRMbVpwY25OMFJXeGxiV1Z1ZEVOb2FXeGtMbU5zWVhOelRHbHpkQzV5WlcxdmRtVW9kR2hwY3k1bmNtbGtRMnhoYzNObGN5NTFjSEJsY2lrN1hHNGdJQ0FnSUNBZ0lHVnNaVzB1Wm1seWMzUkZiR1Z0Wlc1MFEyaHBiR1F1YzNSNWJHVXVla2x1WkdWNElEMGdlakU3WEc1Y2JpQWdJQ0FnSUNBZ1pXeGxiUzVzWVhOMFJXeGxiV1Z1ZEVOb2FXeGtMbU5zWVhOelRHbHpkQzV5WlcxdmRtVW9kR2hwY3k1bmNtbGtRMnhoYzNObGN5NXNiM2RsY2lrN1hHNGdJQ0FnSUNBZ0lHVnNaVzB1YkdGemRFVnNaVzFsYm5SRGFHbHNaQzV6ZEhsc1pTNTZTVzVrWlhnZ1BTQjZNanRjYmlBZ0lDQWdJQ0FnWW5KbFlXczdYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdZMnhsWVhKRGJHRnpjMlZ6S0dWc1pXMHBJSHRjYmlBZ0lDQm1iM0lnS0d4bGRDQmxJRDBnTURzZ1pTQThJR1ZzWlcwdWJHVnVaM1JvT3lCbEt5c3BJSHNnSUNCY2JpQWdJQ0FnSUdWc1pXMWJaVjB1WTJ4aGMzTk1hWE4wTG5KbGJXOTJaU2gwYUdsekxtZHlhV1JEYkdGemMyVnpMblZ3Y0dWeUtUdGNiaUFnSUNBZ0lHVnNaVzFiWlYwdVkyeGhjM05NYVhOMExuSmxiVzkyWlNoMGFHbHpMbWR5YVdSRGJHRnpjMlZ6TG14dmQyVnlLVHRjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0JwYzAxdlltbHNaVXhoZVc5MWRDaHdZVzVsYkNrZ2UxeHVJQ0FnSUdOdmJuTjBJR2R5YVdSVGRIbHNaU0E5SUhkcGJtUnZkeTVuWlhSRGIyMXdkWFJsWkZOMGVXeGxLSEJoYm1Wc0xDQnVkV3hzS1R0Y2JpQWdJQ0JqYjI1emRDQm5jbWxrVjJsa2RHZ2dQU0J3WVhKelpVbHVkQ2huY21sa1UzUjViR1V1ZDJsa2RHZ3BPMXh1WEc0Z0lDQWdhV1lnS0dkeWFXUlhhV1IwYUNBOVBUMGdkMmx1Wkc5M0xtbHVibVZ5VjJsa2RHZ3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQjBjblZsTzF4dUlDQWdJSDFjYmlBZ0lDQmNiaUFnSUNCeVpYUjFjbTRnWm1Gc2MyVTdJRnh1SUNCOVhHNWNiaUFnWjJWMFVHOXphWFJwYjI0b1pXeGxiU2tnZTF4dUlDQWdJR052Ym5OMElIQnZjMmwwYVc5dUlEMGdlMXh1SUNBZ0lDQWdZM1Z5Y21WdWRGUnZjRG9nWld4bGJTNW5aWFJCZEhSeWFXSjFkR1VvSjJSaGRHRXRZMVFuS1N4Y2JpQWdJQ0FnSUdOMWNuSmxiblJDYjNRNklHVnNaVzB1WjJWMFFYUjBjbWxpZFhSbEtDZGtZWFJoTFdOQ0p5a3NYRzRnSUNBZ0lDQndjbVYyYVc5MWMxUnZjRG9nWld4bGJTNW5aWFJCZEhSeWFXSjFkR1VvSjJSaGRHRXRjRlFuS1N4Y2JpQWdJQ0FnSUhCeVpYWnBiM1Z6UW05ME9pQmxiR1Z0TG1kbGRFRjBkSEpwWW5WMFpTZ25aR0YwWVMxd1FpY3BYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lISmxkSFZ5YmlCd2IzTnBkR2x2Ymp0Y2JpQWdmVnh1WEc0Z0lIVndaR0YwWlNncElIc2dYRzRnSUNBZ2RHaHBjeTV6WTNKdmJHeEJkSFJ5TG5ScFkydHBibWNnUFNCbVlXeHpaVHRjYmx4dUlDQWdJR052Ym5OMElIWnBaWGR3YjNKMFNHVnBaMmgwSUQwZ2QybHVaRzkzTG1sdWJtVnlTR1ZwWjJoME8xeHVJQ0FnSUdOdmJuTjBJR2x6VFc5aWFXeGxJRDBnZEdocGN5NXBjMDF2WW1sc1pVeGhlVzkxZENoMGFHbHpMbWR5YVdSRmJHVnRaVzUwY3k1d1lXNWxiSE5iTUYwcE8xeHVYRzRnSUNBZ1ptOXlJQ2hzWlhRZ2NpQTlJREE3SUhJZ1BDQjBhR2x6TG1keWFXUkZiR1Z0Wlc1MGN5NXliM2R6TG14bGJtZDBhRHNnY2lzcktTQjdYRzRnSUNBZ0lDQmNiaUFnSUNBZ0lHTnZibk4wSUhKdmR5QTlJSFJvYVhNdVozSnBaRVZzWlcxbGJuUnpMbkp2ZDNOYmNsMDdYRzRnSUNBZ0lDQmNiaUFnSUNBZ0lHTnZibk4wSUhGMVlXUnlZVzUwSUQwZ2UxeHVJQ0FnSUNBZ0lDQmpkWEp5Wlc1ME9pQnliM2N1Y0dGeVpXNTBSV3hsYldWdWRDeGNiaUFnSUNBZ0lDQWdibVY0ZERvZ2NtOTNMbkJoY21WdWRFVnNaVzFsYm5RdWJtVjRkRVZzWlcxbGJuUlRhV0pzYVc1bkxGeHVJQ0FnSUNBZ0lDQndjbVYyYVc5MWN6b2djbTkzTG5CaGNtVnVkRVZzWlcxbGJuUXVjSEpsZG1sdmRYTkZiR1Z0Wlc1MFUybGliR2x1WjF4dUlDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0x5OGdVMmx1WjJ4bElFTnZiSFZ0YmlBb1RXOWlhV3hsS1Z4dUlDQWdJQ0FnYVdZZ0tHbHpUVzlpYVd4bElEMDlQU0IwY25WbEtTQjdYRzVjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdjbTkzVUc5emFYUnBiMjRnUFNCMGFHbHpMbWRsZEZCdmMybDBhVzl1S0hKdmR5azdYRzRnSUNBZ0lDQWdJRnh1SUNBZ0lDQWdJQ0F2THlCVFpYUWdRM1Z5Y21WdWRDQlFiM05wZEdsdmJseHVJQ0FnSUNBZ0lDQnliM2N1YzJWMFFYUjBjbWxpZFhSbEtDZGtZWFJoTFdOVUp5d2djbTkzTG1kbGRFSnZkVzVrYVc1blEyeHBaVzUwVW1WamRDZ3BMblJ2Y0NrN1hHNGdJQ0FnSUNBZ0lISnZkeTV6WlhSQmRIUnlhV0oxZEdVb0oyUmhkR0V0WTBJbkxDQnliM2N1WjJWMFFtOTFibVJwYm1kRGJHbGxiblJTWldOMEtDa3VZbTkwZEc5dEtUdGNibHh1SUNBZ0lDQWdJQ0F2THlCVFkzSnZiR3dnUkc5M2JseHVJQ0FnSUNBZ0lDQnBaaUFvY205M1VHOXphWFJwYjI0dWNISmxkbWx2ZFhOVWIzQWdQaUF3SUNZbUlISnZkMUJ2YzJsMGFXOXVMbU4xY25KbGJuUlViM0FnUEQwZ01DQW1KaUIwYUdsekxuTmpjbTlzYkVGMGRISXVaR2x5WldOMGFXOXVLU0I3WEc1Y2JpQWdJQ0FnSUNBZ0lDQjBhR2x6TG1OdmJtWnBaM1Z5WlVWc1pXMG9jbTkzTENBMUxDQXhOU3dnWENKbWFYaGxaRndpS1R0Y2JseHVJQ0FnSUNBZ0lDQWdJR2xtSUNoeWIzY3VibVY0ZEVWc1pXMWxiblJUYVdKc2FXNW5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1OdmJtWnBaM1Z5WlVWc1pXMG9jbTkzTG01bGVIUkZiR1Z0Wlc1MFUybGliR2x1Wnl3Z01UQXNJREl3S1R0Y2JpQWdJQ0FnSUNBZ0lDQjlJRnh1WEc0Z0lDQWdJQ0FnSUNBZ2FXWWdLSEp2ZHk1d2NtVjJhVzkxYzBWc1pXMWxiblJUYVdKc2FXNW5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1OdmJtWnBaM1Z5WlVWc1pXMG9jbTkzTG5CeVpYWnBiM1Z6Uld4bGJXVnVkRk5wWW14cGJtY3NJREV3TENBeU1DazdYRzRnSUNBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lDQWdhV1lnS0hGMVlXUnlZVzUwTG01bGVIUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WTI5dVptbG5kWEpsUld4bGJTaHhkV0ZrY21GdWRDNXVaWGgwTG1acGNuTjBSV3hsYldWdWRFTm9hV3hrTENBeE1Dd2dNakFwTzF4dUlDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCcFppQW9JWEp2ZHk1dVpYaDBSV3hsYldWdWRGTnBZbXhwYm1jcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVZMnhsWVhKRGJHRnpjMlZ6S0hSb2FYTXVaM0pwWkVWc1pXMWxiblJ6TG5CaGJtVnNjeXdnZEdocGN5NW5jbWxrUTJ4aGMzTmxjeWs3WEc0Z0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tIRjFZV1J5WVc1MExuQnlaWFpwYjNWektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU52Ym1acFozVnlaVVZzWlcwb2NYVmhaSEpoYm5RdWNISmxkbWx2ZFhNdWJHRnpkRVZzWlcxbGJuUkRhR2xzWkN3Z01UQXNJREl3S1RzZ1hHNGdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRnh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0x5OGdVMk55YjJ4c0lGVndYRzRnSUNBZ0lDQWdJR2xtSUNoeWIzZFFiM05wZEdsdmJpNXdjbVYyYVc5MWMwSnZkQ0E4SUhacFpYZHdiM0owU0dWcFoyaDBJQ1ltSUhKdmQxQnZjMmwwYVc5dUxtTjFjbkpsYm5SQ2IzUWdQajBnZG1sbGQzQnZjblJJWldsbmFIUWdKaVlnSVhSb2FYTXVjMk55YjJ4c1FYUjBjaTVrYVhKbFkzUnBiMjRwSUh0Y2JseHVJQ0FnSUNBZ0lDQWdJSFJvYVhNdVkyOXVabWxuZFhKbFJXeGxiU2h5YjNjc0lERTFMQ0ExTENCY0ltWnBlR1ZrWENJcE8xeHVYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tISnZkeTV1WlhoMFJXeGxiV1Z1ZEZOcFlteHBibWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVkyOXVabWxuZFhKbFJXeGxiU2h5YjNjdWJtVjRkRVZzWlcxbGJuUlRhV0pzYVc1bkxDQXlNQ3dnTVRBcE8xeHVJQ0FnSUNBZ0lDQWdJSDBnWEc1Y2JpQWdJQ0FnSUNBZ0lDQnBaaUFvY205M0xuQnlaWFpwYjNWelJXeGxiV1Z1ZEZOcFlteHBibWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVkyOXVabWxuZFhKbFJXeGxiU2h5YjNjdWNISmxkbWx2ZFhORmJHVnRaVzUwVTJsaWJHbHVaeXdnTWpBc0lERXdLVHRjYmlBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdJQ0JwWmlBb2NYVmhaSEpoYm5RdWNISmxkbWx2ZFhNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVZMjl1Wm1sbmRYSmxSV3hsYlNoeGRXRmtjbUZ1ZEM1d2NtVjJhVzkxY3k1c1lYTjBSV3hsYldWdWRFTm9hV3hrTENBeU1Dd2dNVEFwTzF4dUlDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCcFppQW9JWEp2ZHk1d2NtVjJhVzkxYzBWc1pXMWxiblJUYVdKc2FXNW5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1Oc1pXRnlRMnhoYzNObGN5aDBhR2x6TG1keWFXUkZiR1Z0Wlc1MGN5NXdZVzVsYkhNc0lIUm9hWE11WjNKcFpFTnNZWE56WlhNcE8xeHVJQ0FnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBZ0lHbG1JQ2h4ZFdGa2NtRnVkQzV1WlhoMEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU52Ym1acFozVnlaVVZzWlcwb2NYVmhaSEpoYm5RdWJtVjRkQzVtYVhKemRFVnNaVzFsYm5SRGFHbHNaQ3dnTWpBc0lERXdLVHRjYmlBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0F2THlCVFpYUWdVSEpsZG1sdmRYTWdVRzl6YVhScGIyNWNiaUFnSUNBZ0lDQWdjbTkzTG5ObGRFRjBkSEpwWW5WMFpTZ25aR0YwWVMxd1ZDY3NJSEp2ZDFCdmMybDBhVzl1TG1OMWNuSmxiblJVYjNBcE8xeHVJQ0FnSUNBZ0lDQnliM2N1YzJWMFFYUjBjbWxpZFhSbEtDZGtZWFJoTFhCQ0p5d2djbTkzVUc5emFYUnBiMjR1WTNWeWNtVnVkRUp2ZENrN1hHNGdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDOHZJRlIzYVc0Z1kyOXNkVzF1SUNoRVpYTnJkRzl3S1Z4dUlDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJRnh1SUNBZ0lDQWdJQ0JqYjI1emRDQnhkV0ZrY21GdWRGQnZjMmwwYVc5dUlEMGdkR2hwY3k1blpYUlFiM05wZEdsdmJpaHhkV0ZrY21GdWRDNWpkWEp5Wlc1MEtUdGNibHh1SUNBZ0lDQWdJQ0F2THlCVFpYUWdRM1Z5Y21WdWRDQlFiM05wZEdsdmJseHVJQ0FnSUNBZ0lDQnhkV0ZrY21GdWRDNWpkWEp5Wlc1MExuTmxkRUYwZEhKcFluVjBaU2duWkdGMFlTMWpWQ2NzSUhGMVlXUnlZVzUwTG1OMWNuSmxiblF1WjJWMFFtOTFibVJwYm1kRGJHbGxiblJTWldOMEtDa3VkRzl3S1R0Y2JpQWdJQ0FnSUNBZ2NYVmhaSEpoYm5RdVkzVnljbVZ1ZEM1elpYUkJkSFJ5YVdKMWRHVW9KMlJoZEdFdFkwSW5MQ0J4ZFdGa2NtRnVkQzVqZFhKeVpXNTBMbWRsZEVKdmRXNWthVzVuUTJ4cFpXNTBVbVZqZENncExtSnZkSFJ2YlNrN1hHNGdJQ0FnSUNBZ0lGeHVJQ0FnSUNBZ0lDQXZMeUJUWTNKdmJHd2dSRzkzYmx4dUlDQWdJQ0FnSUNCcFppQW9jWFZoWkhKaGJuUlFiM05wZEdsdmJpNXdjbVYyYVc5MWMxUnZjQ0ErSURBZ0ppWWdjWFZoWkhKaGJuUlFiM05wZEdsdmJpNWpkWEp5Wlc1MFZHOXdJRHc5SURBZ0ppWWdkR2hwY3k1elkzSnZiR3hCZEhSeUxtUnBjbVZqZEdsdmJpa2dlMXh1WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTVqYjI1bWFXZDFjbVZGYkdWdEtIRjFZV1J5WVc1MExtTjFjbkpsYm5Rc0lEVXNJREUxTENCY0ltWnBlR1ZrWENJcE8xeHVYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tIRjFZV1J5WVc1MExtNWxlSFFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVkyOXVabWxuZFhKbFJXeGxiU2h4ZFdGa2NtRnVkQzV1WlhoMExDQXhNQ3dnTWpBcE8xeHVJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU5zWldGeVEyeGhjM05sY3loMGFHbHpMbWR5YVdSRmJHVnRaVzUwY3k1eWIzZHpLVHNnSUZ4dUlDQWdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0FnSUdsbUlDaHhkV0ZrY21GdWRDNXdjbVYyYVc5MWN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVqYjI1bWFXZDFjbVZGYkdWdEtIRjFZV1J5WVc1MExuQnlaWFpwYjNWekxDQXhNQ3dnTWpBcE8xeHVJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lDOHZJRk5qY205c2JDQlZjRnh1SUNBZ0lDQWdJQ0JwWmlBb2NYVmhaSEpoYm5SUWIzTnBkR2x2Ymk1d2NtVjJhVzkxYzBKdmRDQThJSFpwWlhkd2IzSjBTR1ZwWjJoMElDWW1JSEYxWVdSeVlXNTBVRzl6YVhScGIyNHVZM1Z5Y21WdWRFSnZkQ0ErUFNCMmFXVjNjRzl5ZEVobGFXZG9kQ0FtSmlBaGRHaHBjeTV6WTNKdmJHeEJkSFJ5TG1ScGNtVmpkR2x2YmlrZ2UxeHVYRzRnSUNBZ0lDQWdJQ0FnZEdocGN5NWpiMjVtYVdkMWNtVkZiR1Z0S0hGMVlXUnlZVzUwTG1OMWNuSmxiblFzSURFMUxDQTFMQ0JjSW1acGVHVmtYQ0lwTzF4dVhHNGdJQ0FnSUNBZ0lDQWdhV1lnS0hGMVlXUnlZVzUwTG01bGVIUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WTI5dVptbG5kWEpsUld4bGJTaHhkV0ZrY21GdWRDNXVaWGgwTENBeU1Dd2dNVEFwTzF4dUlDQWdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0FnSUdsbUlDaHhkV0ZrY21GdWRDNXdjbVYyYVc5MWN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVqYjI1bWFXZDFjbVZGYkdWdEtIRjFZV1J5WVc1MExuQnlaWFpwYjNWekxDQXlNQ3dnTVRBcE8xeHVJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbU5zWldGeVEyeGhjM05sY3loMGFHbHpMbWR5YVdSRmJHVnRaVzUwY3k1eWIzZHpLVHNnSUZ4dUlDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUM4dklGTmxkQ0JRY21WMmFXOTFjeUJRYjNOcGRHbHZibHh1SUNBZ0lDQWdJQ0J4ZFdGa2NtRnVkQzVqZFhKeVpXNTBMbk5sZEVGMGRISnBZblYwWlNnblpHRjBZUzF3VkNjc0lIRjFZV1J5WVc1MFVHOXphWFJwYjI0dVkzVnljbVZ1ZEZSdmNDazdYRzRnSUNBZ0lDQWdJSEYxWVdSeVlXNTBMbU4xY25KbGJuUXVjMlYwUVhSMGNtbGlkWFJsS0Nka1lYUmhMWEJDSnl3Z2NYVmhaSEpoYm5SUWIzTnBkR2x2Ymk1amRYSnlaVzUwUW05MEtUdGNiaUFnSUNBZ0lIMWNiaUFnSUNCOVhHNGdJSDFjYm4xY2JpSmRmUT09XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2FwcC9QYXJhbGxheEdyaWQuanNcIixcIi9hcHBcIilcbn0se1wiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF9QYXJhbGxheEdyaWQgPSByZXF1aXJlKCcuL2FwcC9QYXJhbGxheEdyaWQnKTtcblxudmFyIF9QYXJhbGxheEdyaWQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUGFyYWxsYXhHcmlkKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHBhcmFsbGF4R3JpZCA9IG5ldyBfUGFyYWxsYXhHcmlkMi5kZWZhdWx0KCk7IC8vIEFwcFxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1aaGEyVmZOelUxWm1KaU9EZ3Vhbk1pWFN3aWJtRnRaWE1pT2xzaWNHRnlZV3hzWVhoSGNtbGtJbDBzSW0xaGNIQnBibWR6SWpvaU96dEJRVU5CT3pzN096czdRVUZGUVN4SlFVRk5RU3hsUVVGbExEUkNRVUZ5UWl4RExFTkJTRUVpTENKbWFXeGxJam9pWm1GclpWODNOVFZtWW1JNE9DNXFjeUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4dklFRndjRnh1YVcxd2IzSjBJRkJoY21Gc2JHRjRSM0pwWkNCbWNtOXRJQ2N1TDJGd2NDOVFZWEpoYkd4aGVFZHlhV1FuTzF4dVhHNWpiMjV6ZENCd1lYSmhiR3hoZUVkeWFXUWdQU0J1WlhjZ1VHRnlZV3hzWVhoSGNtbGtLQ2s3WEc0aVhYMD1cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV83NTVmYmI4OC5qc1wiLFwiL1wiKVxufSx7XCIuL2FwcC9QYXJhbGxheEdyaWRcIjo1LFwiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XX0se30sWzZdKSJdLCJmaWxlIjoiYXBwLmpzIn0=
