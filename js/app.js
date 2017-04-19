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
  function ParallaxGrid(gridId) {
    _classCallCheck(this, ParallaxGrid);

    this.grid = document.getElementById(gridId);

    this.gridClasses = {
      upper: 'u-positioning--upper',
      lower: 'u-positioning--lower',
      relative: 'u-positioning--relative'
    };

    this.gridElements = {
      quadrants: this.grid.querySelectorAll('.c-grid__quadrant'),
      rows: this.grid.querySelectorAll('.c-grid__row')
    };

    this.lastQuadrant = this.gridElements.quadrants[this.gridElements.quadrants.length - 1];
    this.scrollTick = false;
    this.rowHeight = 0;
    this.gridTop = 0;

    this.setRowZindex();
    this.listeners();
  }

  _createClass(ParallaxGrid, [{
    key: 'resize',
    value: function resize() {
      this.rowHeight = window.innerHeight / 2;
      this.gridTop = this.grid.getBoundingClientRect().top;

      this.setRow();
      this.setQuadrant();
      this.setGrid();
    }
  }, {
    key: 'setRowZindex',
    value: function setRowZindex() {
      for (var row = 0; row < this.gridElements.rows.length; row++) {
        this.gridElements.rows[row].style.zIndex = '' + (row % 2 === 0 ? row * 5 : row * 5 + 10);
      }
    }
  }, {
    key: 'setRow',
    value: function setRow() {
      for (var row = 0; row < this.gridElements.rows.length; row++) {
        this.gridElements.rows[row].style.height = this.rowHeight + 'px;';
      }
    }
  }, {
    key: 'setQuadrant',
    value: function setQuadrant() {
      for (var quadrant = 0; quadrant < this.gridElements.quadrants.length; quadrant++) {
        this.gridElements.quadrants[quadrant].style.height = 2 * this.rowHeight + 'px';
        this.gridElements.quadrants[quadrant].style.top = quadrant * -this.rowHeight + 'px';
      }
    }
  }, {
    key: 'setGrid',
    value: function setGrid() {
      var gridHeight = this.rowHeight * (this.gridElements.quadrants.length + 1);
      this.grid.style.height = gridHeight + 'px';
    }
  }, {
    key: 'scrollToTop',
    value: function scrollToTop() {
      window.scrollTo(0, 0);
    }
  }, {
    key: 'pageReload',
    value: function pageReload() {
      this.scrollToTop();
      window.location.reload();
    }
  }, {
    key: 'requestTick',
    value: function requestTick() {
      var _this = this;

      if (this.scrollTick) {
        window.requestAnimationFrame(function () {
          return _this.evaluate();
        });
      }

      this.scrollTick = true;
    }
  }, {
    key: 'evaluate',
    value: function evaluate() {
      this.resize();

      if (this.gridTop >= 0 || this.lastQuadrant.getBoundingClientRect().top <= 0) {
        this.clearClasses();
      } else {
        this.update();
      }

      this.scrollTick = false;
    }
  }, {
    key: 'clearClasses',
    value: function clearClasses() {
      for (var r = 0; r < this.gridElements.rows.length; r++) {

        if (this.lastQuadrant.getBoundingClientRect().top <= 0) {
          this.gridElements.rows[r].classList.remove(this.gridClasses.relative);
        } else {
          this.gridElements.rows[r].classList.add(this.gridClasses.relative);
        }

        this.gridElements.rows[r].classList.remove(this.gridClasses.upper);
        this.gridElements.rows[r].classList.remove(this.gridClasses.lower);
      }
    }
  }, {
    key: 'update',
    value: function update() {

      for (var i = 0; i < this.gridElements.quadrants.length; i++) {

        if (this.gridTop <= i * -this.rowHeight && this.gridTop >= (i + 1) * -this.rowHeight) {

          // Rows determines how many rows are affected at each stage of the grid.   
          var rows = i * 2 + 4;

          for (var row = 0; row < rows; row++) {

            // Add/maintain fixed postioning to all other affected rows.
            if (row < rows - 2) {
              this.gridElements.rows[row].classList.remove(this.gridClasses.relative);

              if (row % 2 === 0) {
                this.gridElements.rows[row].classList.add(this.gridClasses.upper);
              } else {
                this.gridElements.rows[row].classList.add(this.gridClasses.lower);
              }
            }

            // Remove fixed positioning from the last two affected rows (reverting them to relative)
            else {
                this.gridElements.rows[row].classList.add(this.gridClasses.relative);

                if (row % 2 === 0) {
                  this.gridElements.rows[row].classList.remove(this.gridClasses.upper);
                } else {
                  this.gridElements.rows[row].classList.remove(this.gridClasses.lower);
                }
              }
          }
        }
      }
    }
  }, {
    key: 'listeners',
    value: function listeners() {
      var _this2 = this;

      window.addEventListener('scroll', function () {
        return _this2.requestTick();
      }, false);
      window.addEventListener('orientationchange', function () {
        return _this2.pageReload();
      }, false);
      window.addEventListener('beforeunload', function () {
        return _this2.scrollToTop();
      }, false);
      window.addEventListener('resize', function () {
        return _this2.resize();
      }, false);
    }
  }]);

  return ParallaxGrid;
}();

exports.default = ParallaxGrid;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhcmFsbGF4R3JpZC5qcyJdLCJuYW1lcyI6WyJQYXJhbGxheEdyaWQiLCJncmlkSWQiLCJncmlkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImdyaWRDbGFzc2VzIiwidXBwZXIiLCJsb3dlciIsInJlbGF0aXZlIiwiZ3JpZEVsZW1lbnRzIiwicXVhZHJhbnRzIiwicXVlcnlTZWxlY3RvckFsbCIsInJvd3MiLCJsYXN0UXVhZHJhbnQiLCJsZW5ndGgiLCJzY3JvbGxUaWNrIiwicm93SGVpZ2h0IiwiZ3JpZFRvcCIsInNldFJvd1ppbmRleCIsImxpc3RlbmVycyIsIndpbmRvdyIsImlubmVySGVpZ2h0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwic2V0Um93Iiwic2V0UXVhZHJhbnQiLCJzZXRHcmlkIiwicm93Iiwic3R5bGUiLCJ6SW5kZXgiLCJoZWlnaHQiLCJxdWFkcmFudCIsImdyaWRIZWlnaHQiLCJzY3JvbGxUbyIsInNjcm9sbFRvVG9wIiwibG9jYXRpb24iLCJyZWxvYWQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJldmFsdWF0ZSIsInJlc2l6ZSIsImNsZWFyQ2xhc3NlcyIsInVwZGF0ZSIsInIiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJhZGQiLCJpIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlcXVlc3RUaWNrIiwicGFnZVJlbG9hZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUFxQkEsWTtBQUVuQix3QkFBWUMsTUFBWixFQUFvQjtBQUFBOztBQUVsQixTQUFLQyxJQUFMLEdBQVlDLFNBQVNDLGNBQVQsQ0FBd0JILE1BQXhCLENBQVo7O0FBRUEsU0FBS0ksV0FBTCxHQUFtQjtBQUNqQkMsYUFBTyxzQkFEVTtBQUVqQkMsYUFBTyxzQkFGVTtBQUdqQkMsZ0JBQVU7QUFITyxLQUFuQjs7QUFNQSxTQUFLQyxZQUFMLEdBQW9CO0FBQ2xCQyxpQkFBVyxLQUFLUixJQUFMLENBQVVTLGdCQUFWLENBQTJCLG1CQUEzQixDQURPO0FBRWxCQyxZQUFNLEtBQUtWLElBQUwsQ0FBVVMsZ0JBQVYsQ0FBMkIsY0FBM0I7QUFGWSxLQUFwQjs7QUFLQSxTQUFLRSxZQUFMLEdBQW9CLEtBQUtKLFlBQUwsQ0FBa0JDLFNBQWxCLENBQTRCLEtBQUtELFlBQUwsQ0FBa0JDLFNBQWxCLENBQTRCSSxNQUE1QixHQUFxQyxDQUFqRSxDQUFwQjtBQUNBLFNBQUtDLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLENBQWpCO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLENBQWY7O0FBRUEsU0FBS0MsWUFBTDtBQUNBLFNBQUtDLFNBQUw7QUFDRDs7Ozs2QkFFUTtBQUNQLFdBQUtILFNBQUwsR0FBaUJJLE9BQU9DLFdBQVAsR0FBcUIsQ0FBdEM7QUFDQSxXQUFLSixPQUFMLEdBQWUsS0FBS2YsSUFBTCxDQUFVb0IscUJBQVYsR0FBa0NDLEdBQWpEOztBQUVBLFdBQUtDLE1BQUw7QUFDQSxXQUFLQyxXQUFMO0FBQ0EsV0FBS0MsT0FBTDtBQUNEOzs7bUNBRWM7QUFDYixXQUFJLElBQUlDLE1BQU0sQ0FBZCxFQUFpQkEsTUFBTSxLQUFLbEIsWUFBTCxDQUFrQkcsSUFBbEIsQ0FBdUJFLE1BQTlDLEVBQXNEYSxLQUF0RCxFQUE2RDtBQUMzRCxhQUFLbEIsWUFBTCxDQUFrQkcsSUFBbEIsQ0FBdUJlLEdBQXZCLEVBQTRCQyxLQUE1QixDQUFrQ0MsTUFBbEMsU0FBK0NGLE1BQU0sQ0FBTixLQUFZLENBQWIsR0FBa0JBLE1BQU0sQ0FBeEIsR0FBNkJBLE1BQU0sQ0FBUCxHQUFZLEVBQXRGO0FBQ0Q7QUFDRjs7OzZCQUVRO0FBQ1AsV0FBSSxJQUFJQSxNQUFNLENBQWQsRUFBaUJBLE1BQU0sS0FBS2xCLFlBQUwsQ0FBa0JHLElBQWxCLENBQXVCRSxNQUE5QyxFQUFzRGEsS0FBdEQsRUFBNkQ7QUFDM0QsYUFBS2xCLFlBQUwsQ0FBa0JHLElBQWxCLENBQXVCZSxHQUF2QixFQUE0QkMsS0FBNUIsQ0FBa0NFLE1BQWxDLEdBQThDLEtBQUtkLFNBQW5EO0FBQ0Q7QUFDRjs7O2tDQUVhO0FBQ1osV0FBSSxJQUFJZSxXQUFXLENBQW5CLEVBQXNCQSxXQUFXLEtBQUt0QixZQUFMLENBQWtCQyxTQUFsQixDQUE0QkksTUFBN0QsRUFBcUVpQixVQUFyRSxFQUFpRjtBQUMvRSxhQUFLdEIsWUFBTCxDQUFrQkMsU0FBbEIsQ0FBNEJxQixRQUE1QixFQUFzQ0gsS0FBdEMsQ0FBNENFLE1BQTVDLEdBQXdELElBQUksS0FBS2QsU0FBakU7QUFDQSxhQUFLUCxZQUFMLENBQWtCQyxTQUFsQixDQUE0QnFCLFFBQTVCLEVBQXNDSCxLQUF0QyxDQUE0Q0wsR0FBNUMsR0FBcURRLFdBQVcsQ0FBQyxLQUFLZixTQUF0RTtBQUNEO0FBQ0Y7Ozs4QkFFUztBQUNSLFVBQU1nQixhQUFjLEtBQUtoQixTQUFMLElBQWtCLEtBQUtQLFlBQUwsQ0FBa0JDLFNBQWxCLENBQTRCSSxNQUE1QixHQUFxQyxDQUF2RCxDQUFwQjtBQUNBLFdBQUtaLElBQUwsQ0FBVTBCLEtBQVYsQ0FBZ0JFLE1BQWhCLEdBQTRCRSxVQUE1QjtBQUNEOzs7a0NBRWE7QUFDWlosYUFBT2EsUUFBUCxDQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUNEOzs7aUNBRVk7QUFDWCxXQUFLQyxXQUFMO0FBQ0FkLGFBQU9lLFFBQVAsQ0FBZ0JDLE1BQWhCO0FBQ0Q7OztrQ0FFYTtBQUFBOztBQUNaLFVBQUcsS0FBS3JCLFVBQVIsRUFBb0I7QUFDWkssZUFBT2lCLHFCQUFQLENBQTZCO0FBQUEsaUJBQU0sTUFBS0MsUUFBTCxFQUFOO0FBQUEsU0FBN0I7QUFDSDs7QUFFRCxXQUFLdkIsVUFBTCxHQUFrQixJQUFsQjtBQUNIOzs7K0JBRVE7QUFDVCxXQUFLd0IsTUFBTDs7QUFFQSxVQUFJLEtBQUt0QixPQUFMLElBQWdCLENBQWhCLElBQXFCLEtBQUtKLFlBQUwsQ0FBa0JTLHFCQUFsQixHQUEwQ0MsR0FBMUMsSUFBaUQsQ0FBMUUsRUFBNkU7QUFDM0UsYUFBS2lCLFlBQUw7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLQyxNQUFMO0FBQ0Q7O0FBRUQsV0FBSzFCLFVBQUwsR0FBa0IsS0FBbEI7QUFDRDs7O21DQUVjO0FBQ2IsV0FBSyxJQUFJMkIsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUtqQyxZQUFMLENBQWtCRyxJQUFsQixDQUF1QkUsTUFBM0MsRUFBbUQ0QixHQUFuRCxFQUF3RDs7QUFFdEQsWUFBSSxLQUFLN0IsWUFBTCxDQUFrQlMscUJBQWxCLEdBQTBDQyxHQUExQyxJQUFpRCxDQUFyRCxFQUF3RDtBQUN0RCxlQUFLZCxZQUFMLENBQWtCRyxJQUFsQixDQUF1QjhCLENBQXZCLEVBQTBCQyxTQUExQixDQUFvQ0MsTUFBcEMsQ0FBMkMsS0FBS3ZDLFdBQUwsQ0FBaUJHLFFBQTVEO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsZUFBS0MsWUFBTCxDQUFrQkcsSUFBbEIsQ0FBdUI4QixDQUF2QixFQUEwQkMsU0FBMUIsQ0FBb0NFLEdBQXBDLENBQXdDLEtBQUt4QyxXQUFMLENBQWlCRyxRQUF6RDtBQUNEOztBQUVELGFBQUtDLFlBQUwsQ0FBa0JHLElBQWxCLENBQXVCOEIsQ0FBdkIsRUFBMEJDLFNBQTFCLENBQW9DQyxNQUFwQyxDQUEyQyxLQUFLdkMsV0FBTCxDQUFpQkMsS0FBNUQ7QUFDQSxhQUFLRyxZQUFMLENBQWtCRyxJQUFsQixDQUF1QjhCLENBQXZCLEVBQTBCQyxTQUExQixDQUFvQ0MsTUFBcEMsQ0FBMkMsS0FBS3ZDLFdBQUwsQ0FBaUJFLEtBQTVEO0FBQ0Q7QUFDRjs7OzZCQUVROztBQUVQLFdBQUssSUFBSXVDLElBQUksQ0FBYixFQUFnQkEsSUFBSSxLQUFLckMsWUFBTCxDQUFrQkMsU0FBbEIsQ0FBNEJJLE1BQWhELEVBQXdEZ0MsR0FBeEQsRUFBNkQ7O0FBRTNELFlBQUksS0FBSzdCLE9BQUwsSUFBZ0I2QixJQUFJLENBQUMsS0FBSzlCLFNBQTFCLElBQXVDLEtBQUtDLE9BQUwsSUFBZ0IsQ0FBQzZCLElBQUksQ0FBTCxJQUFVLENBQUMsS0FBSzlCLFNBQTNFLEVBQXNGOztBQUVwRjtBQUNBLGNBQU1KLE9BQVNrQyxJQUFJLENBQUwsR0FBVSxDQUF4Qjs7QUFFQSxlQUFLLElBQUluQixNQUFNLENBQWYsRUFBa0JBLE1BQU1mLElBQXhCLEVBQThCZSxLQUE5QixFQUFxQzs7QUFFbkM7QUFDQSxnQkFBSUEsTUFBTWYsT0FBTyxDQUFqQixFQUFvQjtBQUNsQixtQkFBS0gsWUFBTCxDQUFrQkcsSUFBbEIsQ0FBdUJlLEdBQXZCLEVBQTRCZ0IsU0FBNUIsQ0FBc0NDLE1BQXRDLENBQTZDLEtBQUt2QyxXQUFMLENBQWlCRyxRQUE5RDs7QUFFQSxrQkFBSW1CLE1BQU0sQ0FBTixLQUFZLENBQWhCLEVBQW1CO0FBQ2pCLHFCQUFLbEIsWUFBTCxDQUFrQkcsSUFBbEIsQ0FBdUJlLEdBQXZCLEVBQTRCZ0IsU0FBNUIsQ0FBc0NFLEdBQXRDLENBQTBDLEtBQUt4QyxXQUFMLENBQWlCQyxLQUEzRDtBQUNELGVBRkQsTUFFTztBQUNMLHFCQUFLRyxZQUFMLENBQWtCRyxJQUFsQixDQUF1QmUsR0FBdkIsRUFBNEJnQixTQUE1QixDQUFzQ0UsR0FBdEMsQ0FBMEMsS0FBS3hDLFdBQUwsQ0FBaUJFLEtBQTNEO0FBQ0Q7QUFDRjs7QUFFRDtBQVZBLGlCQVdLO0FBQ0gscUJBQUtFLFlBQUwsQ0FBa0JHLElBQWxCLENBQXVCZSxHQUF2QixFQUE0QmdCLFNBQTVCLENBQXNDRSxHQUF0QyxDQUEwQyxLQUFLeEMsV0FBTCxDQUFpQkcsUUFBM0Q7O0FBRUEsb0JBQUltQixNQUFNLENBQU4sS0FBWSxDQUFoQixFQUFtQjtBQUNqQix1QkFBS2xCLFlBQUwsQ0FBa0JHLElBQWxCLENBQXVCZSxHQUF2QixFQUE0QmdCLFNBQTVCLENBQXNDQyxNQUF0QyxDQUE2QyxLQUFLdkMsV0FBTCxDQUFpQkMsS0FBOUQ7QUFDRCxpQkFGRCxNQUVPO0FBQ0wsdUJBQUtHLFlBQUwsQ0FBa0JHLElBQWxCLENBQXVCZSxHQUF2QixFQUE0QmdCLFNBQTVCLENBQXNDQyxNQUF0QyxDQUE2QyxLQUFLdkMsV0FBTCxDQUFpQkUsS0FBOUQ7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGO0FBQ0Y7OztnQ0FFVztBQUFBOztBQUNWYSxhQUFPMkIsZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0M7QUFBQSxlQUFNLE9BQUtDLFdBQUwsRUFBTjtBQUFBLE9BQWxDLEVBQTRELEtBQTVEO0FBQ0E1QixhQUFPMkIsZ0JBQVAsQ0FBd0IsbUJBQXhCLEVBQTZDO0FBQUEsZUFBTSxPQUFLRSxVQUFMLEVBQU47QUFBQSxPQUE3QyxFQUFzRSxLQUF0RTtBQUNBN0IsYUFBTzJCLGdCQUFQLENBQXdCLGNBQXhCLEVBQXdDO0FBQUEsZUFBTSxPQUFLYixXQUFMLEVBQU47QUFBQSxPQUF4QyxFQUFrRSxLQUFsRTtBQUNBZCxhQUFPMkIsZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0M7QUFBQSxlQUFNLE9BQUtSLE1BQUwsRUFBTjtBQUFBLE9BQWxDLEVBQXVELEtBQXZEO0FBQ0Q7Ozs7OztrQkFoSmtCdkMsWSIsImZpbGUiOiJQYXJhbGxheEdyaWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJhbGxheEdyaWQge1xuICBcbiAgY29uc3RydWN0b3IoZ3JpZElkKSB7XG4gICAgXG4gICAgdGhpcy5ncmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZ3JpZElkKTtcblxuICAgIHRoaXMuZ3JpZENsYXNzZXMgPSB7XG4gICAgICB1cHBlcjogJ3UtcG9zaXRpb25pbmctLXVwcGVyJywgXG4gICAgICBsb3dlcjogJ3UtcG9zaXRpb25pbmctLWxvd2VyJyxcbiAgICAgIHJlbGF0aXZlOiAndS1wb3NpdGlvbmluZy0tcmVsYXRpdmUnXG4gICAgfTtcblxuICAgIHRoaXMuZ3JpZEVsZW1lbnRzID0ge1xuICAgICAgcXVhZHJhbnRzOiB0aGlzLmdyaWQucXVlcnlTZWxlY3RvckFsbCgnLmMtZ3JpZF9fcXVhZHJhbnQnKSxcbiAgICAgIHJvd3M6IHRoaXMuZ3JpZC5xdWVyeVNlbGVjdG9yQWxsKCcuYy1ncmlkX19yb3cnKVxuICAgIH07XG5cbiAgICB0aGlzLmxhc3RRdWFkcmFudCA9IHRoaXMuZ3JpZEVsZW1lbnRzLnF1YWRyYW50c1t0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHMubGVuZ3RoIC0gMV07XG4gICAgdGhpcy5zY3JvbGxUaWNrID0gZmFsc2U7XG4gICAgdGhpcy5yb3dIZWlnaHQgPSAwO1xuICAgIHRoaXMuZ3JpZFRvcCA9IDA7XG5cbiAgICB0aGlzLnNldFJvd1ppbmRleCgpO1xuICAgIHRoaXMubGlzdGVuZXJzKCk7XG4gIH1cblxuICByZXNpemUoKSB7XG4gICAgdGhpcy5yb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuZ3JpZFRvcCA9IHRoaXMuZ3JpZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG4gICAgXG4gICAgdGhpcy5zZXRSb3coKTtcbiAgICB0aGlzLnNldFF1YWRyYW50KCk7XG4gICAgdGhpcy5zZXRHcmlkKCk7XG4gIH1cblxuICBzZXRSb3daaW5kZXgoKSB7XG4gICAgZm9yKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLmdyaWRFbGVtZW50cy5yb3dzLmxlbmd0aDsgcm93KyspIHtcbiAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcm93XS5zdHlsZS56SW5kZXggPSBgJHsocm93ICUgMiA9PT0gMCkgPyByb3cgKiA1IDogKHJvdyAqIDUpICsgMTB9YDtcbiAgICB9XG4gIH1cblxuICBzZXRSb3coKSB7XG4gICAgZm9yKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLmdyaWRFbGVtZW50cy5yb3dzLmxlbmd0aDsgcm93KyspIHtcbiAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcm93XS5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLnJvd0hlaWdodH1weDtgO1xuICAgIH0gXG4gIH1cblxuICBzZXRRdWFkcmFudCgpIHtcbiAgICBmb3IobGV0IHF1YWRyYW50ID0gMDsgcXVhZHJhbnQgPCB0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHMubGVuZ3RoOyBxdWFkcmFudCsrKSB7XG4gICAgICB0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHNbcXVhZHJhbnRdLnN0eWxlLmhlaWdodCA9IGAkezIgKiB0aGlzLnJvd0hlaWdodH1weGA7IFxuICAgICAgdGhpcy5ncmlkRWxlbWVudHMucXVhZHJhbnRzW3F1YWRyYW50XS5zdHlsZS50b3AgPSBgJHtxdWFkcmFudCAqIC10aGlzLnJvd0hlaWdodH1weGA7XG4gICAgfVxuICB9XG5cbiAgc2V0R3JpZCgpIHtcbiAgICBjb25zdCBncmlkSGVpZ2h0ID0gKHRoaXMucm93SGVpZ2h0ICogKHRoaXMuZ3JpZEVsZW1lbnRzLnF1YWRyYW50cy5sZW5ndGggKyAxKSk7IFxuICAgIHRoaXMuZ3JpZC5zdHlsZS5oZWlnaHQgPSBgJHtncmlkSGVpZ2h0fXB4YDtcbiAgfVxuXG4gIHNjcm9sbFRvVG9wKCkge1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgfVxuXG4gIHBhZ2VSZWxvYWQoKSB7XG4gICAgdGhpcy5zY3JvbGxUb1RvcCgpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfVxuXG4gIHJlcXVlc3RUaWNrKCkge1xuICAgIGlmKHRoaXMuc2Nyb2xsVGljaykge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmV2YWx1YXRlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zY3JvbGxUaWNrID0gdHJ1ZTtcbiAgICB9XG5cbiAgZXZhbHVhdGUoKSB7XG4gICAgdGhpcy5yZXNpemUoKTtcblxuICAgIGlmICh0aGlzLmdyaWRUb3AgPj0gMCB8fCB0aGlzLmxhc3RRdWFkcmFudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPD0gMCkge1xuICAgICAgdGhpcy5jbGVhckNsYXNzZXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNjcm9sbFRpY2sgPSBmYWxzZTtcbiAgfVxuXG4gIGNsZWFyQ2xhc3NlcygpIHtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3MubGVuZ3RoOyByKyspIHtcbiAgICAgIFxuICAgICAgaWYgKHRoaXMubGFzdFF1YWRyYW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCA8PSAwKSB7XG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnJlbGF0aXZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl0uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLnJlbGF0aXZlKTsgXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnVwcGVyKTtcbiAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLmxvd2VyKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZEVsZW1lbnRzLnF1YWRyYW50cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICBpZiAodGhpcy5ncmlkVG9wIDw9IGkgKiAtdGhpcy5yb3dIZWlnaHQgJiYgdGhpcy5ncmlkVG9wID49IChpICsgMSkgKiAtdGhpcy5yb3dIZWlnaHQpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIFJvd3MgZGV0ZXJtaW5lcyBob3cgbWFueSByb3dzIGFyZSBhZmZlY3RlZCBhdCBlYWNoIHN0YWdlIG9mIHRoZSBncmlkLiAgIFxuICAgICAgICBjb25zdCByb3dzID0gKChpICogMikgKyA0KTtcblxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCByb3dzOyByb3crKykge1xuXG4gICAgICAgICAgLy8gQWRkL21haW50YWluIGZpeGVkIHBvc3Rpb25pbmcgdG8gYWxsIG90aGVyIGFmZmVjdGVkIHJvd3MuXG4gICAgICAgICAgaWYgKHJvdyA8IHJvd3MgLSAyKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnJlbGF0aXZlKTtcblxuICAgICAgICAgICAgaWYgKHJvdyAlIDIgPT09IDApIHtcbiAgICAgICAgICAgICAgdGhpcy5ncmlkRWxlbWVudHMucm93c1tyb3ddLmNsYXNzTGlzdC5hZGQodGhpcy5ncmlkQ2xhc3Nlcy51cHBlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLmxvd2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZW1vdmUgZml4ZWQgcG9zaXRpb25pbmcgZnJvbSB0aGUgbGFzdCB0d28gYWZmZWN0ZWQgcm93cyAocmV2ZXJ0aW5nIHRoZW0gdG8gcmVsYXRpdmUpXG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLnJlbGF0aXZlKTtcblxuICAgICAgICAgICAgaWYgKHJvdyAlIDIgPT09IDApIHtcbiAgICAgICAgICAgICAgdGhpcy5ncmlkRWxlbWVudHMucm93c1tyb3ddLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5ncmlkQ2xhc3Nlcy51cHBlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLmxvd2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgfVxuICB9XG5cbiAgbGlzdGVuZXJzKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB0aGlzLnJlcXVlc3RUaWNrKCksIGZhbHNlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCAoKSA9PiB0aGlzLnBhZ2VSZWxvYWQoKSwgZmFsc2UpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoKSA9PiB0aGlzLnNjcm9sbFRvVG9wKCksIGZhbHNlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4gdGhpcy5yZXNpemUoKSwgZmFsc2UpO1xuICB9XG59XG4iXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/ParallaxGrid.js","/app")
},{"buffer":2,"rH1JPG":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var _ParallaxGrid = require('./app/ParallaxGrid');

var _ParallaxGrid2 = _interopRequireDefault(_ParallaxGrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parallaxGrid = new _ParallaxGrid2.default('story-people'); // App
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfMzc0OGQzZmEuanMiXSwibmFtZXMiOlsicGFyYWxsYXhHcmlkIl0sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxlQUFlLDJCQUFpQixjQUFqQixDQUFyQixDLENBSEEiLCJmaWxlIjoiZmFrZV8zNzQ4ZDNmYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEFwcFxuaW1wb3J0IFBhcmFsbGF4R3JpZCBmcm9tICcuL2FwcC9QYXJhbGxheEdyaWQnO1xuXG5jb25zdCBwYXJhbGxheEdyaWQgPSBuZXcgUGFyYWxsYXhHcmlkKCdzdG9yeS1wZW9wbGUnKTtcbiJdfQ==
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_3748d3fa.js","/")
},{"./app/ParallaxGrid":5,"buffer":2,"rH1JPG":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIilcbn0se1wiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXJcIilcbn0se1wiYmFzZTY0LWpzXCI6MSxcImJ1ZmZlclwiOjIsXCJpZWVlNzU0XCI6MyxcInJIMUpQR1wiOjR9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2llZWU3NTRcIilcbn0se1wiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKVxufSx7XCJidWZmZXJcIjoyLFwickgxSlBHXCI6NH1dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUGFyYWxsYXhHcmlkID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQYXJhbGxheEdyaWQoZ3JpZElkKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcmFsbGF4R3JpZCk7XG5cbiAgICB0aGlzLmdyaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChncmlkSWQpO1xuXG4gICAgdGhpcy5ncmlkQ2xhc3NlcyA9IHtcbiAgICAgIHVwcGVyOiAndS1wb3NpdGlvbmluZy0tdXBwZXInLFxuICAgICAgbG93ZXI6ICd1LXBvc2l0aW9uaW5nLS1sb3dlcicsXG4gICAgICByZWxhdGl2ZTogJ3UtcG9zaXRpb25pbmctLXJlbGF0aXZlJ1xuICAgIH07XG5cbiAgICB0aGlzLmdyaWRFbGVtZW50cyA9IHtcbiAgICAgIHF1YWRyYW50czogdGhpcy5ncmlkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jLWdyaWRfX3F1YWRyYW50JyksXG4gICAgICByb3dzOiB0aGlzLmdyaWQucXVlcnlTZWxlY3RvckFsbCgnLmMtZ3JpZF9fcm93JylcbiAgICB9O1xuXG4gICAgdGhpcy5sYXN0UXVhZHJhbnQgPSB0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHNbdGhpcy5ncmlkRWxlbWVudHMucXVhZHJhbnRzLmxlbmd0aCAtIDFdO1xuICAgIHRoaXMuc2Nyb2xsVGljayA9IGZhbHNlO1xuICAgIHRoaXMucm93SGVpZ2h0ID0gMDtcbiAgICB0aGlzLmdyaWRUb3AgPSAwO1xuXG4gICAgdGhpcy5zZXRSb3daaW5kZXgoKTtcbiAgICB0aGlzLmxpc3RlbmVycygpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFBhcmFsbGF4R3JpZCwgW3tcbiAgICBrZXk6ICdyZXNpemUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgICB0aGlzLnJvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XG4gICAgICB0aGlzLmdyaWRUb3AgPSB0aGlzLmdyaWQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xuXG4gICAgICB0aGlzLnNldFJvdygpO1xuICAgICAgdGhpcy5zZXRRdWFkcmFudCgpO1xuICAgICAgdGhpcy5zZXRHcmlkKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Um93WmluZGV4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Um93WmluZGV4KCkge1xuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5ncmlkRWxlbWVudHMucm93cy5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcm93XS5zdHlsZS56SW5kZXggPSAnJyArIChyb3cgJSAyID09PSAwID8gcm93ICogNSA6IHJvdyAqIDUgKyAxMCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Um93JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Um93KCkge1xuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5ncmlkRWxlbWVudHMucm93cy5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcm93XS5zdHlsZS5oZWlnaHQgPSB0aGlzLnJvd0hlaWdodCArICdweDsnO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFF1YWRyYW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UXVhZHJhbnQoKSB7XG4gICAgICBmb3IgKHZhciBxdWFkcmFudCA9IDA7IHF1YWRyYW50IDwgdGhpcy5ncmlkRWxlbWVudHMucXVhZHJhbnRzLmxlbmd0aDsgcXVhZHJhbnQrKykge1xuICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHNbcXVhZHJhbnRdLnN0eWxlLmhlaWdodCA9IDIgKiB0aGlzLnJvd0hlaWdodCArICdweCc7XG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnF1YWRyYW50c1txdWFkcmFudF0uc3R5bGUudG9wID0gcXVhZHJhbnQgKiAtdGhpcy5yb3dIZWlnaHQgKyAncHgnO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEdyaWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRHcmlkKCkge1xuICAgICAgdmFyIGdyaWRIZWlnaHQgPSB0aGlzLnJvd0hlaWdodCAqICh0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHMubGVuZ3RoICsgMSk7XG4gICAgICB0aGlzLmdyaWQuc3R5bGUuaGVpZ2h0ID0gZ3JpZEhlaWdodCArICdweCc7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2Nyb2xsVG9Ub3AnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzY3JvbGxUb1RvcCgpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwYWdlUmVsb2FkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFnZVJlbG9hZCgpIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG9Ub3AoKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZXF1ZXN0VGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlcXVlc3RUaWNrKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuc2Nyb2xsVGljaykge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuZXZhbHVhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2Nyb2xsVGljayA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZXZhbHVhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBldmFsdWF0ZSgpIHtcbiAgICAgIHRoaXMucmVzaXplKCk7XG5cbiAgICAgIGlmICh0aGlzLmdyaWRUb3AgPj0gMCB8fCB0aGlzLmxhc3RRdWFkcmFudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPD0gMCkge1xuICAgICAgICB0aGlzLmNsZWFyQ2xhc3NlcygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zY3JvbGxUaWNrID0gZmFsc2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2xlYXJDbGFzc2VzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJDbGFzc2VzKCkge1xuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCB0aGlzLmdyaWRFbGVtZW50cy5yb3dzLmxlbmd0aDsgcisrKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFF1YWRyYW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCA8PSAwKSB7XG4gICAgICAgICAgdGhpcy5ncmlkRWxlbWVudHMucm93c1tyXS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZ3JpZENsYXNzZXMucmVsYXRpdmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl0uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLnJlbGF0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnRzLnJvd3Nbcl0uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnVwcGVyKTtcbiAgICAgICAgdGhpcy5ncmlkRWxlbWVudHMucm93c1tyXS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZ3JpZENsYXNzZXMubG93ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdyaWRFbGVtZW50cy5xdWFkcmFudHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBpZiAodGhpcy5ncmlkVG9wIDw9IGkgKiAtdGhpcy5yb3dIZWlnaHQgJiYgdGhpcy5ncmlkVG9wID49IChpICsgMSkgKiAtdGhpcy5yb3dIZWlnaHQpIHtcblxuICAgICAgICAgIC8vIFJvd3MgZGV0ZXJtaW5lcyBob3cgbWFueSByb3dzIGFyZSBhZmZlY3RlZCBhdCBlYWNoIHN0YWdlIG9mIHRoZSBncmlkLiAgIFxuICAgICAgICAgIHZhciByb3dzID0gaSAqIDIgKyA0O1xuXG4gICAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgcm93czsgcm93KyspIHtcblxuICAgICAgICAgICAgLy8gQWRkL21haW50YWluIGZpeGVkIHBvc3Rpb25pbmcgdG8gYWxsIG90aGVyIGFmZmVjdGVkIHJvd3MuXG4gICAgICAgICAgICBpZiAocm93IDwgcm93cyAtIDIpIHtcbiAgICAgICAgICAgICAgdGhpcy5ncmlkRWxlbWVudHMucm93c1tyb3ddLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5ncmlkQ2xhc3Nlcy5yZWxhdGl2ZSk7XG5cbiAgICAgICAgICAgICAgaWYgKHJvdyAlIDIgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLnVwcGVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLmxvd2VyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZW1vdmUgZml4ZWQgcG9zaXRpb25pbmcgZnJvbSB0aGUgbGFzdCB0d28gYWZmZWN0ZWQgcm93cyAocmV2ZXJ0aW5nIHRoZW0gdG8gcmVsYXRpdmUpXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LmFkZCh0aGlzLmdyaWRDbGFzc2VzLnJlbGF0aXZlKTtcblxuICAgICAgICAgICAgICAgIGlmIChyb3cgJSAyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmdyaWRFbGVtZW50cy5yb3dzW3Jvd10uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmdyaWRDbGFzc2VzLnVwcGVyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkRWxlbWVudHMucm93c1tyb3ddLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5ncmlkQ2xhc3Nlcy5sb3dlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbGlzdGVuZXJzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGlzdGVuZXJzKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIucmVxdWVzdFRpY2soKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMi5wYWdlUmVsb2FkKCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMyLnNjcm9sbFRvVG9wKCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMyLnJlc2l6ZSgpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBQYXJhbGxheEdyaWQ7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFBhcmFsbGF4R3JpZDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklsQmhjbUZzYkdGNFIzSnBaQzVxY3lKZExDSnVZVzFsY3lJNld5SlFZWEpoYkd4aGVFZHlhV1FpTENKbmNtbGtTV1FpTENKbmNtbGtJaXdpWkc5amRXMWxiblFpTENKblpYUkZiR1Z0Wlc1MFFubEpaQ0lzSW1keWFXUkRiR0Z6YzJWeklpd2lkWEJ3WlhJaUxDSnNiM2RsY2lJc0luSmxiR0YwYVhabElpd2laM0pwWkVWc1pXMWxiblJ6SWl3aWNYVmhaSEpoYm5Seklpd2ljWFZsY25sVFpXeGxZM1J2Y2tGc2JDSXNJbkp2ZDNNaUxDSnNZWE4wVVhWaFpISmhiblFpTENKc1pXNW5kR2dpTENKelkzSnZiR3hVYVdOcklpd2ljbTkzU0dWcFoyaDBJaXdpWjNKcFpGUnZjQ0lzSW5ObGRGSnZkMXBwYm1SbGVDSXNJbXhwYzNSbGJtVnljeUlzSW5kcGJtUnZkeUlzSW1sdWJtVnlTR1ZwWjJoMElpd2laMlYwUW05MWJtUnBibWREYkdsbGJuUlNaV04wSWl3aWRHOXdJaXdpYzJWMFVtOTNJaXdpYzJWMFVYVmhaSEpoYm5RaUxDSnpaWFJIY21sa0lpd2ljbTkzSWl3aWMzUjViR1VpTENKNlNXNWtaWGdpTENKb1pXbG5hSFFpTENKeGRXRmtjbUZ1ZENJc0ltZHlhV1JJWldsbmFIUWlMQ0p6WTNKdmJHeFVieUlzSW5OamNtOXNiRlJ2Vkc5d0lpd2liRzlqWVhScGIyNGlMQ0p5Wld4dllXUWlMQ0p5WlhGMVpYTjBRVzVwYldGMGFXOXVSbkpoYldVaUxDSmxkbUZzZFdGMFpTSXNJbkpsYzJsNlpTSXNJbU5zWldGeVEyeGhjM05sY3lJc0luVndaR0YwWlNJc0luSWlMQ0pqYkdGemMweHBjM1FpTENKeVpXMXZkbVVpTENKaFpHUWlMQ0pwSWl3aVlXUmtSWFpsYm5STWFYTjBaVzVsY2lJc0luSmxjWFZsYzNSVWFXTnJJaXdpY0dGblpWSmxiRzloWkNKZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPenRKUVVGeFFrRXNXVHRCUVVWdVFpeDNRa0ZCV1VNc1RVRkJXaXhGUVVGdlFqdEJRVUZCT3p0QlFVVnNRaXhUUVVGTFF5eEpRVUZNTEVkQlFWbERMRk5CUVZORExHTkJRVlFzUTBGQmQwSklMRTFCUVhoQ0xFTkJRVm83TzBGQlJVRXNVMEZCUzBrc1YwRkJUQ3hIUVVGdFFqdEJRVU5xUWtNc1lVRkJUeXh6UWtGRVZUdEJRVVZxUWtNc1lVRkJUeXh6UWtGR1ZUdEJRVWRxUWtNc1owSkJRVlU3UVVGSVR5eExRVUZ1UWpzN1FVRk5RU3hUUVVGTFF5eFpRVUZNTEVkQlFXOUNPMEZCUTJ4Q1F5eHBRa0ZCVnl4TFFVRkxVaXhKUVVGTUxFTkJRVlZUTEdkQ1FVRldMRU5CUVRKQ0xHMUNRVUV6UWl4RFFVUlBPMEZCUld4Q1F5eFpRVUZOTEV0QlFVdFdMRWxCUVV3c1EwRkJWVk1zWjBKQlFWWXNRMEZCTWtJc1kwRkJNMEk3UVVGR1dTeExRVUZ3UWpzN1FVRkxRU3hUUVVGTFJTeFpRVUZNTEVkQlFXOUNMRXRCUVV0S0xGbEJRVXdzUTBGQmEwSkRMRk5CUVd4Q0xFTkJRVFJDTEV0QlFVdEVMRmxCUVV3c1EwRkJhMEpETEZOQlFXeENMRU5CUVRSQ1NTeE5RVUUxUWl4SFFVRnhReXhEUVVGcVJTeERRVUZ3UWp0QlFVTkJMRk5CUVV0RExGVkJRVXdzUjBGQmEwSXNTMEZCYkVJN1FVRkRRU3hUUVVGTFF5eFRRVUZNTEVkQlFXbENMRU5CUVdwQ08wRkJRMEVzVTBGQlMwTXNUMEZCVEN4SFFVRmxMRU5CUVdZN08wRkJSVUVzVTBGQlMwTXNXVUZCVER0QlFVTkJMRk5CUVV0RExGTkJRVXc3UVVGRFJEczdPenMyUWtGRlVUdEJRVU5RTEZkQlFVdElMRk5CUVV3c1IwRkJhVUpKTEU5QlFVOURMRmRCUVZBc1IwRkJjVUlzUTBGQmRFTTdRVUZEUVN4WFFVRkxTaXhQUVVGTUxFZEJRV1VzUzBGQlMyWXNTVUZCVEN4RFFVRlZiMElzY1VKQlFWWXNSMEZCYTBORExFZEJRV3BFT3p0QlFVVkJMRmRCUVV0RExFMUJRVXc3UVVGRFFTeFhRVUZMUXl4WFFVRk1PMEZCUTBFc1YwRkJTME1zVDBGQlREdEJRVU5FT3pzN2JVTkJSV003UVVGRFlpeFhRVUZKTEVsQlFVbERMRTFCUVUwc1EwRkJaQ3hGUVVGcFFrRXNUVUZCVFN4TFFVRkxiRUlzV1VGQlRDeERRVUZyUWtjc1NVRkJiRUlzUTBGQmRVSkZMRTFCUVRsRExFVkJRWE5FWVN4TFFVRjBSQ3hGUVVFMlJEdEJRVU16UkN4aFFVRkxiRUlzV1VGQlRDeERRVUZyUWtjc1NVRkJiRUlzUTBGQmRVSmxMRWRCUVhaQ0xFVkJRVFJDUXl4TFFVRTFRaXhEUVVGclEwTXNUVUZCYkVNc1UwRkJLME5HTEUxQlFVMHNRMEZCVGl4TFFVRlpMRU5CUVdJc1IwRkJhMEpCTEUxQlFVMHNRMEZCZUVJc1IwRkJOa0pCTEUxQlFVMHNRMEZCVUN4SFFVRlpMRVZCUVhSR08wRkJRMFE3UVVGRFJqczdPelpDUVVWUk8wRkJRMUFzVjBGQlNTeEpRVUZKUVN4TlFVRk5MRU5CUVdRc1JVRkJhVUpCTEUxQlFVMHNTMEZCUzJ4Q0xGbEJRVXdzUTBGQmEwSkhMRWxCUVd4Q0xFTkJRWFZDUlN4TlFVRTVReXhGUVVGelJHRXNTMEZCZEVRc1JVRkJOa1E3UVVGRE0wUXNZVUZCUzJ4Q0xGbEJRVXdzUTBGQmEwSkhMRWxCUVd4Q0xFTkJRWFZDWlN4SFFVRjJRaXhGUVVFMFFrTXNTMEZCTlVJc1EwRkJhME5GTEUxQlFXeERMRWRCUVRoRExFdEJRVXRrTEZOQlFXNUVPMEZCUTBRN1FVRkRSanM3TzJ0RFFVVmhPMEZCUTFvc1YwRkJTU3hKUVVGSlpTeFhRVUZYTEVOQlFXNUNMRVZCUVhOQ1FTeFhRVUZYTEV0QlFVdDBRaXhaUVVGTUxFTkJRV3RDUXl4VFFVRnNRaXhEUVVFMFFra3NUVUZCTjBRc1JVRkJjVVZwUWl4VlFVRnlSU3hGUVVGcFJqdEJRVU12UlN4aFFVRkxkRUlzV1VGQlRDeERRVUZyUWtNc1UwRkJiRUlzUTBGQk5FSnhRaXhSUVVFMVFpeEZRVUZ6UTBnc1MwRkJkRU1zUTBGQk5FTkZMRTFCUVRWRExFZEJRWGRFTEVsQlFVa3NTMEZCUzJRc1UwRkJha1U3UVVGRFFTeGhRVUZMVUN4WlFVRk1MRU5CUVd0Q1F5eFRRVUZzUWl4RFFVRTBRbkZDTEZGQlFUVkNMRVZCUVhORFNDeExRVUYwUXl4RFFVRTBRMHdzUjBGQk5VTXNSMEZCY1VSUkxGZEJRVmNzUTBGQlF5eExRVUZMWml4VFFVRjBSVHRCUVVORU8wRkJRMFk3T3pzNFFrRkZVenRCUVVOU0xGVkJRVTFuUWl4aFFVRmpMRXRCUVV0b1FpeFRRVUZNTEVsQlFXdENMRXRCUVV0UUxGbEJRVXdzUTBGQmEwSkRMRk5CUVd4Q0xFTkJRVFJDU1N4TlFVRTFRaXhIUVVGeFF5eERRVUYyUkN4RFFVRndRanRCUVVOQkxGZEJRVXRhTEVsQlFVd3NRMEZCVlRCQ0xFdEJRVllzUTBGQlowSkZMRTFCUVdoQ0xFZEJRVFJDUlN4VlFVRTFRanRCUVVORU96czdhME5CUldFN1FVRkRXbG9zWVVGQlQyRXNVVUZCVUN4RFFVRm5RaXhEUVVGb1FpeEZRVUZ0UWl4RFFVRnVRanRCUVVORU96czdhVU5CUlZrN1FVRkRXQ3hYUVVGTFF5eFhRVUZNTzBGQlEwRmtMR0ZCUVU5bExGRkJRVkFzUTBGQlowSkRMRTFCUVdoQ08wRkJRMFE3T3p0clEwRkZZVHRCUVVGQk96dEJRVU5hTEZWQlFVY3NTMEZCUzNKQ0xGVkJRVklzUlVGQmIwSTdRVUZEV2tzc1pVRkJUMmxDTEhGQ1FVRlFMRU5CUVRaQ08wRkJRVUVzYVVKQlFVMHNUVUZCUzBNc1VVRkJUQ3hGUVVGT08wRkJRVUVzVTBGQk4wSTdRVUZEU0RzN1FVRkZSQ3hYUVVGTGRrSXNWVUZCVEN4SFFVRnJRaXhKUVVGc1FqdEJRVU5JT3pzN0swSkJSVkU3UVVGRFZDeFhRVUZMZDBJc1RVRkJURHM3UVVGRlFTeFZRVUZKTEV0QlFVdDBRaXhQUVVGTUxFbEJRV2RDTEVOQlFXaENMRWxCUVhGQ0xFdEJRVXRLTEZsQlFVd3NRMEZCYTBKVExIRkNRVUZzUWl4SFFVRXdRME1zUjBGQk1VTXNTVUZCYVVRc1EwRkJNVVVzUlVGQk5rVTdRVUZETTBVc1lVRkJTMmxDTEZsQlFVdzdRVUZEUkN4UFFVWkVMRTFCUlU4N1FVRkRUQ3hoUVVGTFF5eE5RVUZNTzBGQlEwUTdPMEZCUlVRc1YwRkJTekZDTEZWQlFVd3NSMEZCYTBJc1MwRkJiRUk3UVVGRFJEczdPMjFEUVVWak8wRkJRMklzVjBGQlN5eEpRVUZKTWtJc1NVRkJTU3hEUVVGaUxFVkJRV2RDUVN4SlFVRkpMRXRCUVV0cVF5eFpRVUZNTEVOQlFXdENSeXhKUVVGc1FpeERRVUYxUWtVc1RVRkJNME1zUlVGQmJVUTBRaXhIUVVGdVJDeEZRVUYzUkRzN1FVRkZkRVFzV1VGQlNTeExRVUZMTjBJc1dVRkJUQ3hEUVVGclFsTXNjVUpCUVd4Q0xFZEJRVEJEUXl4SFFVRXhReXhKUVVGcFJDeERRVUZ5UkN4RlFVRjNSRHRCUVVOMFJDeGxRVUZMWkN4WlFVRk1MRU5CUVd0Q1J5eEpRVUZzUWl4RFFVRjFRamhDTEVOQlFYWkNMRVZCUVRCQ1F5eFRRVUV4UWl4RFFVRnZRME1zVFVGQmNFTXNRMEZCTWtNc1MwRkJTM1pETEZkQlFVd3NRMEZCYVVKSExGRkJRVFZFTzBGQlEwUXNVMEZHUkN4TlFVVlBPMEZCUTB3c1pVRkJTME1zV1VGQlRDeERRVUZyUWtjc1NVRkJiRUlzUTBGQmRVSTRRaXhEUVVGMlFpeEZRVUV3UWtNc1UwRkJNVUlzUTBGQmIwTkZMRWRCUVhCRExFTkJRWGRETEV0QlFVdDRReXhYUVVGTUxFTkJRV2xDUnl4UlFVRjZSRHRCUVVORU96dEJRVVZFTEdGQlFVdERMRmxCUVV3c1EwRkJhMEpITEVsQlFXeENMRU5CUVhWQ09FSXNRMEZCZGtJc1JVRkJNRUpETEZOQlFURkNMRU5CUVc5RFF5eE5RVUZ3UXl4RFFVRXlReXhMUVVGTGRrTXNWMEZCVEN4RFFVRnBRa01zUzBGQk5VUTdRVUZEUVN4aFFVRkxSeXhaUVVGTUxFTkJRV3RDUnl4SlFVRnNRaXhEUVVGMVFqaENMRU5CUVhaQ0xFVkJRVEJDUXl4VFFVRXhRaXhEUVVGdlEwTXNUVUZCY0VNc1EwRkJNa01zUzBGQlMzWkRMRmRCUVV3c1EwRkJhVUpGTEV0QlFUVkVPMEZCUTBRN1FVRkRSanM3T3paQ1FVVlJPenRCUVVWUUxGZEJRVXNzU1VGQlNYVkRMRWxCUVVrc1EwRkJZaXhGUVVGblFrRXNTVUZCU1N4TFFVRkxja01zV1VGQlRDeERRVUZyUWtNc1UwRkJiRUlzUTBGQk5FSkpMRTFCUVdoRUxFVkJRWGRFWjBNc1IwRkJlRVFzUlVGQk5rUTdPMEZCUlRORUxGbEJRVWtzUzBGQlN6ZENMRTlCUVV3c1NVRkJaMEkyUWl4SlFVRkpMRU5CUVVNc1MwRkJTemxDTEZOQlFURkNMRWxCUVhWRExFdEJRVXRETEU5QlFVd3NTVUZCWjBJc1EwRkJRelpDTEVsQlFVa3NRMEZCVEN4SlFVRlZMRU5CUVVNc1MwRkJTemxDTEZOQlFUTkZMRVZCUVhOR096dEJRVVZ3Ump0QlFVTkJMR05CUVUxS0xFOUJRVk5yUXl4SlFVRkpMRU5CUVV3c1IwRkJWU3hEUVVGNFFqczdRVUZGUVN4bFFVRkxMRWxCUVVsdVFpeE5RVUZOTEVOQlFXWXNSVUZCYTBKQkxFMUJRVTFtTEVsQlFYaENMRVZCUVRoQ1pTeExRVUU1UWl4RlFVRnhRenM3UVVGRmJrTTdRVUZEUVN4blFrRkJTVUVzVFVGQlRXWXNUMEZCVHl4RFFVRnFRaXhGUVVGdlFqdEJRVU5zUWl4dFFrRkJTMGdzV1VGQlRDeERRVUZyUWtjc1NVRkJiRUlzUTBGQmRVSmxMRWRCUVhaQ0xFVkJRVFJDWjBJc1UwRkJOVUlzUTBGQmMwTkRMRTFCUVhSRExFTkJRVFpETEV0QlFVdDJReXhYUVVGTUxFTkJRV2xDUnl4UlFVRTVSRHM3UVVGRlFTeHJRa0ZCU1cxQ0xFMUJRVTBzUTBGQlRpeExRVUZaTEVOQlFXaENMRVZCUVcxQ08wRkJRMnBDTEhGQ1FVRkxiRUlzV1VGQlRDeERRVUZyUWtjc1NVRkJiRUlzUTBGQmRVSmxMRWRCUVhaQ0xFVkJRVFJDWjBJc1UwRkJOVUlzUTBGQmMwTkZMRWRCUVhSRExFTkJRVEJETEV0QlFVdDRReXhYUVVGTUxFTkJRV2xDUXl4TFFVRXpSRHRCUVVORUxHVkJSa1FzVFVGRlR6dEJRVU5NTEhGQ1FVRkxSeXhaUVVGTUxFTkJRV3RDUnl4SlFVRnNRaXhEUVVGMVFtVXNSMEZCZGtJc1JVRkJORUpuUWl4VFFVRTFRaXhEUVVGelEwVXNSMEZCZEVNc1EwRkJNRU1zUzBGQlMzaERMRmRCUVV3c1EwRkJhVUpGTEV0QlFUTkVPMEZCUTBRN1FVRkRSanM3UVVGRlJEdEJRVlpCTEdsQ1FWZExPMEZCUTBnc2NVSkJRVXRGTEZsQlFVd3NRMEZCYTBKSExFbEJRV3hDTEVOQlFYVkNaU3hIUVVGMlFpeEZRVUUwUW1kQ0xGTkJRVFZDTEVOQlFYTkRSU3hIUVVGMFF5eERRVUV3UXl4TFFVRkxlRU1zVjBGQlRDeERRVUZwUWtjc1VVRkJNMFE3TzBGQlJVRXNiMEpCUVVsdFFpeE5RVUZOTEVOQlFVNHNTMEZCV1N4RFFVRm9RaXhGUVVGdFFqdEJRVU5xUWl4MVFrRkJTMnhDTEZsQlFVd3NRMEZCYTBKSExFbEJRV3hDTEVOQlFYVkNaU3hIUVVGMlFpeEZRVUUwUW1kQ0xGTkJRVFZDTEVOQlFYTkRReXhOUVVGMFF5eERRVUUyUXl4TFFVRkxka01zVjBGQlRDeERRVUZwUWtNc1MwRkJPVVE3UVVGRFJDeHBRa0ZHUkN4TlFVVlBPMEZCUTB3c2RVSkJRVXRITEZsQlFVd3NRMEZCYTBKSExFbEJRV3hDTEVOQlFYVkNaU3hIUVVGMlFpeEZRVUUwUW1kQ0xGTkJRVFZDTEVOQlFYTkRReXhOUVVGMFF5eERRVUUyUXl4TFFVRkxka01zVjBGQlRDeERRVUZwUWtVc1MwRkJPVVE3UVVGRFJEdEJRVU5HTzBGQlEwWTdRVUZEUmp0QlFVTkdPMEZCUTBZN096dG5RMEZGVnp0QlFVRkJPenRCUVVOV1lTeGhRVUZQTWtJc1owSkJRVkFzUTBGQmQwSXNVVUZCZUVJc1JVRkJhME03UVVGQlFTeGxRVUZOTEU5QlFVdERMRmRCUVV3c1JVRkJUanRCUVVGQkxFOUJRV3hETEVWQlFUUkVMRXRCUVRWRU8wRkJRMEUxUWl4aFFVRlBNa0lzWjBKQlFWQXNRMEZCZDBJc2JVSkJRWGhDTEVWQlFUWkRPMEZCUVVFc1pVRkJUU3hQUVVGTFJTeFZRVUZNTEVWQlFVNDdRVUZCUVN4UFFVRTNReXhGUVVGelJTeExRVUYwUlR0QlFVTkJOMElzWVVGQlR6SkNMR2RDUVVGUUxFTkJRWGRDTEdOQlFYaENMRVZCUVhkRE8wRkJRVUVzWlVGQlRTeFBRVUZMWWl4WFFVRk1MRVZCUVU0N1FVRkJRU3hQUVVGNFF5eEZRVUZyUlN4TFFVRnNSVHRCUVVOQlpDeGhRVUZQTWtJc1owSkJRVkFzUTBGQmQwSXNVVUZCZUVJc1JVRkJhME03UVVGQlFTeGxRVUZOTEU5QlFVdFNMRTFCUVV3c1JVRkJUanRCUVVGQkxFOUJRV3hETEVWQlFYVkVMRXRCUVhaRU8wRkJRMFE3T3pzN096dHJRa0ZvU210Q2RrTXNXU0lzSW1acGJHVWlPaUpRWVhKaGJHeGhlRWR5YVdRdWFuTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpsZUhCdmNuUWdaR1ZtWVhWc2RDQmpiR0Z6Y3lCUVlYSmhiR3hoZUVkeWFXUWdlMXh1SUNCY2JpQWdZMjl1YzNSeWRXTjBiM0lvWjNKcFpFbGtLU0I3WEc0Z0lDQWdYRzRnSUNBZ2RHaHBjeTVuY21sa0lEMGdaRzlqZFcxbGJuUXVaMlYwUld4bGJXVnVkRUo1U1dRb1ozSnBaRWxrS1R0Y2JseHVJQ0FnSUhSb2FYTXVaM0pwWkVOc1lYTnpaWE1nUFNCN1hHNGdJQ0FnSUNCMWNIQmxjam9nSjNVdGNHOXphWFJwYjI1cGJtY3RMWFZ3Y0dWeUp5d2dYRzRnSUNBZ0lDQnNiM2RsY2pvZ0ozVXRjRzl6YVhScGIyNXBibWN0TFd4dmQyVnlKeXhjYmlBZ0lDQWdJSEpsYkdGMGFYWmxPaUFuZFMxd2IzTnBkR2x2Ym1sdVp5MHRjbVZzWVhScGRtVW5YRzRnSUNBZ2ZUdGNibHh1SUNBZ0lIUm9hWE11WjNKcFpFVnNaVzFsYm5SeklEMGdlMXh1SUNBZ0lDQWdjWFZoWkhKaGJuUnpPaUIwYUdsekxtZHlhV1F1Y1hWbGNubFRaV3hsWTNSdmNrRnNiQ2duTG1NdFozSnBaRjlmY1hWaFpISmhiblFuS1N4Y2JpQWdJQ0FnSUhKdmQzTTZJSFJvYVhNdVozSnBaQzV4ZFdWeWVWTmxiR1ZqZEc5eVFXeHNLQ2N1WXkxbmNtbGtYMTl5YjNjbktWeHVJQ0FnSUgwN1hHNWNiaUFnSUNCMGFHbHpMbXhoYzNSUmRXRmtjbUZ1ZENBOUlIUm9hWE11WjNKcFpFVnNaVzFsYm5SekxuRjFZV1J5WVc1MGMxdDBhR2x6TG1keWFXUkZiR1Z0Wlc1MGN5NXhkV0ZrY21GdWRITXViR1Z1WjNSb0lDMGdNVjA3WEc0Z0lDQWdkR2hwY3k1elkzSnZiR3hVYVdOcklEMGdabUZzYzJVN1hHNGdJQ0FnZEdocGN5NXliM2RJWldsbmFIUWdQU0F3TzF4dUlDQWdJSFJvYVhNdVozSnBaRlJ2Y0NBOUlEQTdYRzVjYmlBZ0lDQjBhR2x6TG5ObGRGSnZkMXBwYm1SbGVDZ3BPMXh1SUNBZ0lIUm9hWE11YkdsemRHVnVaWEp6S0NrN1hHNGdJSDFjYmx4dUlDQnlaWE5wZW1Vb0tTQjdYRzRnSUNBZ2RHaHBjeTV5YjNkSVpXbG5hSFFnUFNCM2FXNWtiM2N1YVc1dVpYSklaV2xuYUhRZ0x5QXlPMXh1SUNBZ0lIUm9hWE11WjNKcFpGUnZjQ0E5SUhSb2FYTXVaM0pwWkM1blpYUkNiM1Z1WkdsdVowTnNhV1Z1ZEZKbFkzUW9LUzUwYjNBN1hHNGdJQ0FnWEc0Z0lDQWdkR2hwY3k1elpYUlNiM2NvS1R0Y2JpQWdJQ0IwYUdsekxuTmxkRkYxWVdSeVlXNTBLQ2s3WEc0Z0lDQWdkR2hwY3k1elpYUkhjbWxrS0NrN1hHNGdJSDFjYmx4dUlDQnpaWFJTYjNkYWFXNWtaWGdvS1NCN1hHNGdJQ0FnWm05eUtHeGxkQ0J5YjNjZ1BTQXdPeUJ5YjNjZ1BDQjBhR2x6TG1keWFXUkZiR1Z0Wlc1MGN5NXliM2R6TG14bGJtZDBhRHNnY205M0t5c3BJSHRjYmlBZ0lDQWdJSFJvYVhNdVozSnBaRVZzWlcxbGJuUnpMbkp2ZDNOYmNtOTNYUzV6ZEhsc1pTNTZTVzVrWlhnZ1BTQmdKSHNvY205M0lDVWdNaUE5UFQwZ01Da2dQeUJ5YjNjZ0tpQTFJRG9nS0hKdmR5QXFJRFVwSUNzZ01UQjlZRHRjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0J6WlhSU2IzY29LU0I3WEc0Z0lDQWdabTl5S0d4bGRDQnliM2NnUFNBd095QnliM2NnUENCMGFHbHpMbWR5YVdSRmJHVnRaVzUwY3k1eWIzZHpMbXhsYm1kMGFEc2djbTkzS3lzcElIdGNiaUFnSUNBZ0lIUm9hWE11WjNKcFpFVnNaVzFsYm5SekxuSnZkM05iY205M1hTNXpkSGxzWlM1b1pXbG5hSFFnUFNCZ0pIdDBhR2x6TG5KdmQwaGxhV2RvZEgxd2VEdGdPMXh1SUNBZ0lIMGdYRzRnSUgxY2JseHVJQ0J6WlhSUmRXRmtjbUZ1ZENncElIdGNiaUFnSUNCbWIzSW9iR1YwSUhGMVlXUnlZVzUwSUQwZ01Ec2djWFZoWkhKaGJuUWdQQ0IwYUdsekxtZHlhV1JGYkdWdFpXNTBjeTV4ZFdGa2NtRnVkSE11YkdWdVozUm9PeUJ4ZFdGa2NtRnVkQ3NyS1NCN1hHNGdJQ0FnSUNCMGFHbHpMbWR5YVdSRmJHVnRaVzUwY3k1eGRXRmtjbUZ1ZEhOYmNYVmhaSEpoYm5SZExuTjBlV3hsTG1obGFXZG9kQ0E5SUdBa2V6SWdLaUIwYUdsekxuSnZkMGhsYVdkb2RIMXdlR0E3SUZ4dUlDQWdJQ0FnZEdocGN5NW5jbWxrUld4bGJXVnVkSE11Y1hWaFpISmhiblJ6VzNGMVlXUnlZVzUwWFM1emRIbHNaUzUwYjNBZ1BTQmdKSHR4ZFdGa2NtRnVkQ0FxSUMxMGFHbHpMbkp2ZDBobGFXZG9kSDF3ZUdBN1hHNGdJQ0FnZlZ4dUlDQjlYRzVjYmlBZ2MyVjBSM0pwWkNncElIdGNiaUFnSUNCamIyNXpkQ0JuY21sa1NHVnBaMmgwSUQwZ0tIUm9hWE11Y205M1NHVnBaMmgwSUNvZ0tIUm9hWE11WjNKcFpFVnNaVzFsYm5SekxuRjFZV1J5WVc1MGN5NXNaVzVuZEdnZ0t5QXhLU2s3SUZ4dUlDQWdJSFJvYVhNdVozSnBaQzV6ZEhsc1pTNW9aV2xuYUhRZ1BTQmdKSHRuY21sa1NHVnBaMmgwZlhCNFlEdGNiaUFnZlZ4dVhHNGdJSE5qY205c2JGUnZWRzl3S0NrZ2UxeHVJQ0FnSUhkcGJtUnZkeTV6WTNKdmJHeFVieWd3TENBd0tUdGNiaUFnZlZ4dVhHNGdJSEJoWjJWU1pXeHZZV1FvS1NCN1hHNGdJQ0FnZEdocGN5NXpZM0p2Ykd4VWIxUnZjQ2dwTzF4dUlDQWdJSGRwYm1SdmR5NXNiMk5oZEdsdmJpNXlaV3h2WVdRb0tUdGNiaUFnZlZ4dVhHNGdJSEpsY1hWbGMzUlVhV05yS0NrZ2UxeHVJQ0FnSUdsbUtIUm9hWE11YzJOeWIyeHNWR2xqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZDJsdVpHOTNMbkpsY1hWbGMzUkJibWx0WVhScGIyNUdjbUZ0WlNnb0tTQTlQaUIwYUdsekxtVjJZV3gxWVhSbEtDa3BPMXh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV6WTNKdmJHeFVhV05ySUQwZ2RISjFaVHRjYmlBZ0lDQjlYRzVjYmlBZ1pYWmhiSFZoZEdVb0tTQjdYRzRnSUNBZ2RHaHBjeTV5WlhOcGVtVW9LVHRjYmx4dUlDQWdJR2xtSUNoMGFHbHpMbWR5YVdSVWIzQWdQajBnTUNCOGZDQjBhR2x6TG14aGMzUlJkV0ZrY21GdWRDNW5aWFJDYjNWdVpHbHVaME5zYVdWdWRGSmxZM1FvS1M1MGIzQWdQRDBnTUNrZ2UxeHVJQ0FnSUNBZ2RHaHBjeTVqYkdWaGNrTnNZWE56WlhNb0tUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnZEdocGN5NTFjR1JoZEdVb0tUdGNiaUFnSUNCOVhHNWNiaUFnSUNCMGFHbHpMbk5qY205c2JGUnBZMnNnUFNCbVlXeHpaVHRjYmlBZ2ZWeHVYRzRnSUdOc1pXRnlRMnhoYzNObGN5Z3BJSHRjYmlBZ0lDQm1iM0lnS0d4bGRDQnlJRDBnTURzZ2NpQThJSFJvYVhNdVozSnBaRVZzWlcxbGJuUnpMbkp2ZDNNdWJHVnVaM1JvT3lCeUt5c3BJSHRjYmlBZ0lDQWdJRnh1SUNBZ0lDQWdhV1lnS0hSb2FYTXViR0Z6ZEZGMVlXUnlZVzUwTG1kbGRFSnZkVzVrYVc1blEyeHBaVzUwVW1WamRDZ3BMblJ2Y0NBOFBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVaM0pwWkVWc1pXMWxiblJ6TG5KdmQzTmJjbDB1WTJ4aGMzTk1hWE4wTG5KbGJXOTJaU2gwYUdsekxtZHlhV1JEYkdGemMyVnpMbkpsYkdGMGFYWmxLVHRjYmlBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdVozSnBaRVZzWlcxbGJuUnpMbkp2ZDNOYmNsMHVZMnhoYzNOTWFYTjBMbUZrWkNoMGFHbHpMbWR5YVdSRGJHRnpjMlZ6TG5KbGJHRjBhWFpsS1RzZ1hHNGdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lIUm9hWE11WjNKcFpFVnNaVzFsYm5SekxuSnZkM05iY2wwdVkyeGhjM05NYVhOMExuSmxiVzkyWlNoMGFHbHpMbWR5YVdSRGJHRnpjMlZ6TG5Wd2NHVnlLVHRjYmlBZ0lDQWdJSFJvYVhNdVozSnBaRVZzWlcxbGJuUnpMbkp2ZDNOYmNsMHVZMnhoYzNOTWFYTjBMbkpsYlc5MlpTaDBhR2x6TG1keWFXUkRiR0Z6YzJWekxteHZkMlZ5S1R0Y2JpQWdJQ0I5WEc0Z0lIMWNibHh1SUNCMWNHUmhkR1VvS1NCN1hHNWNiaUFnSUNCbWIzSWdLR3hsZENCcElEMGdNRHNnYVNBOElIUm9hWE11WjNKcFpFVnNaVzFsYm5SekxuRjFZV1J5WVc1MGN5NXNaVzVuZEdnN0lHa3JLeWtnZTF4dVhHNGdJQ0FnSUNCcFppQW9kR2hwY3k1bmNtbGtWRzl3SUR3OUlHa2dLaUF0ZEdocGN5NXliM2RJWldsbmFIUWdKaVlnZEdocGN5NW5jbWxrVkc5d0lENDlJQ2hwSUNzZ01Ta2dLaUF0ZEdocGN5NXliM2RJWldsbmFIUXBJSHRjYmlBZ0lDQWdJQ0FnWEc0Z0lDQWdJQ0FnSUM4dklGSnZkM01nWkdWMFpYSnRhVzVsY3lCb2IzY2diV0Z1ZVNCeWIzZHpJR0Z5WlNCaFptWmxZM1JsWkNCaGRDQmxZV05vSUhOMFlXZGxJRzltSUhSb1pTQm5jbWxrTGlBZ0lGeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCeWIzZHpJRDBnS0NocElDb2dNaWtnS3lBMEtUdGNibHh1SUNBZ0lDQWdJQ0JtYjNJZ0tHeGxkQ0J5YjNjZ1BTQXdPeUJ5YjNjZ1BDQnliM2R6T3lCeWIzY3JLeWtnZTF4dVhHNGdJQ0FnSUNBZ0lDQWdMeThnUVdSa0wyMWhhVzUwWVdsdUlHWnBlR1ZrSUhCdmMzUnBiMjVwYm1jZ2RHOGdZV3hzSUc5MGFHVnlJR0ZtWm1WamRHVmtJSEp2ZDNNdVhHNGdJQ0FnSUNBZ0lDQWdhV1lnS0hKdmR5QThJSEp2ZDNNZ0xTQXlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1keWFXUkZiR1Z0Wlc1MGN5NXliM2R6VzNKdmQxMHVZMnhoYzNOTWFYTjBMbkpsYlc5MlpTaDBhR2x6TG1keWFXUkRiR0Z6YzJWekxuSmxiR0YwYVhabEtUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEp2ZHlBbElESWdQVDA5SURBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVuY21sa1JXeGxiV1Z1ZEhNdWNtOTNjMXR5YjNkZExtTnNZWE56VEdsemRDNWhaR1FvZEdocGN5NW5jbWxrUTJ4aGMzTmxjeTUxY0hCbGNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxtZHlhV1JGYkdWdFpXNTBjeTV5YjNkelczSnZkMTB1WTJ4aGMzTk1hWE4wTG1Ga1pDaDBhR2x6TG1keWFXUkRiR0Z6YzJWekxteHZkMlZ5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdJQ0F2THlCU1pXMXZkbVVnWm1sNFpXUWdjRzl6YVhScGIyNXBibWNnWm5KdmJTQjBhR1VnYkdGemRDQjBkMjhnWVdabVpXTjBaV1FnY205M2N5QW9jbVYyWlhKMGFXNW5JSFJvWlcwZ2RHOGdjbVZzWVhScGRtVXBYRzRnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbWR5YVdSRmJHVnRaVzUwY3k1eWIzZHpXM0p2ZDEwdVkyeGhjM05NYVhOMExtRmtaQ2gwYUdsekxtZHlhV1JEYkdGemMyVnpMbkpsYkdGMGFYWmxLVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hKdmR5QWxJRElnUFQwOUlEQXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1bmNtbGtSV3hsYldWdWRITXVjbTkzYzF0eWIzZGRMbU5zWVhOelRHbHpkQzV5WlcxdmRtVW9kR2hwY3k1bmNtbGtRMnhoYzNObGN5NTFjSEJsY2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1keWFXUkZiR1Z0Wlc1MGN5NXliM2R6VzNKdmQxMHVZMnhoYzNOTWFYTjBMbkpsYlc5MlpTaDBhR2x6TG1keWFXUkRiR0Z6YzJWekxteHZkMlZ5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lIMGdYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdiR2x6ZEdWdVpYSnpLQ2tnZTF4dUlDQWdJSGRwYm1SdmR5NWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZHpZM0p2Ykd3bkxDQW9LU0E5UGlCMGFHbHpMbkpsY1hWbGMzUlVhV05yS0Nrc0lHWmhiSE5sS1R0Y2JpQWdJQ0IzYVc1a2IzY3VZV1JrUlhabGJuUk1hWE4wWlc1bGNpZ25iM0pwWlc1MFlYUnBiMjVqYUdGdVoyVW5MQ0FvS1NBOVBpQjBhR2x6TG5CaFoyVlNaV3h2WVdRb0tTd2dabUZzYzJVcE8xeHVJQ0FnSUhkcGJtUnZkeTVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLQ2RpWldadmNtVjFibXh2WVdRbkxDQW9LU0E5UGlCMGFHbHpMbk5qY205c2JGUnZWRzl3S0Nrc0lHWmhiSE5sS1R0Y2JpQWdJQ0IzYVc1a2IzY3VZV1JrUlhabGJuUk1hWE4wWlc1bGNpZ25jbVZ6YVhwbEp5d2dLQ2tnUFQ0Z2RHaHBjeTV5WlhOcGVtVW9LU3dnWm1Gc2MyVXBPMXh1SUNCOVhHNTlYRzRpWFgwPVxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9hcHAvUGFyYWxsYXhHcmlkLmpzXCIsXCIvYXBwXCIpXG59LHtcImJ1ZmZlclwiOjIsXCJySDFKUEdcIjo0fV0sNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfUGFyYWxsYXhHcmlkID0gcmVxdWlyZSgnLi9hcHAvUGFyYWxsYXhHcmlkJyk7XG5cbnZhciBfUGFyYWxsYXhHcmlkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BhcmFsbGF4R3JpZCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBwYXJhbGxheEdyaWQgPSBuZXcgX1BhcmFsbGF4R3JpZDIuZGVmYXVsdCgnc3RvcnktcGVvcGxlJyk7IC8vIEFwcFxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1aaGEyVmZNemMwT0dRelptRXVhbk1pWFN3aWJtRnRaWE1pT2xzaWNHRnlZV3hzWVhoSGNtbGtJbDBzSW0xaGNIQnBibWR6SWpvaU96dEJRVU5CT3pzN096czdRVUZGUVN4SlFVRk5RU3hsUVVGbExESkNRVUZwUWl4alFVRnFRaXhEUVVGeVFpeERMRU5CU0VFaUxDSm1hV3hsSWpvaVptRnJaVjh6TnpRNFpETm1ZUzVxY3lJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHZJRUZ3Y0Z4dWFXMXdiM0owSUZCaGNtRnNiR0Y0UjNKcFpDQm1jbTl0SUNjdUwyRndjQzlRWVhKaGJHeGhlRWR5YVdRbk8xeHVYRzVqYjI1emRDQndZWEpoYkd4aGVFZHlhV1FnUFNCdVpYY2dVR0Z5WVd4c1lYaEhjbWxrS0NkemRHOXllUzF3Wlc5d2JHVW5LVHRjYmlKZGZRPT1cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV8zNzQ4ZDNmYS5qc1wiLFwiL1wiKVxufSx7XCIuL2FwcC9QYXJhbGxheEdyaWRcIjo1LFwiYnVmZmVyXCI6MixcInJIMUpQR1wiOjR9XX0se30sWzZdKSJdLCJmaWxlIjoiYXBwLmpzIn0=
