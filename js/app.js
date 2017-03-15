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

var StoryTeam = function () {
  function StoryTeam() {
    _classCallCheck(this, StoryTeam);

    this.elements = {
      window: window,
      html: document.querySelectorAll('html')[0],
      body: document.querySelectorAll('body')[0]
    };

    this.team = {
      container: document.querySelectorAll('#story-team')[0],
      quadrants: document.querySelectorAll('.c-team__quadrant'),
      rows: document.querySelectorAll('.c-team__row'),
      row: 'c-team__row',
      upper: 'c-team__row--upper',
      lower: 'c-team__row--lower',
      relative: 'c-team__row--relative'
    };

    this.scroll = {
      previous: 0,
      current: 0,
      direction: false
    };

    this.init();
  }

  _createClass(StoryTeam, [{
    key: 'init',
    value: function init() {
      this.team.quadrants.forEach(function (quadrant, index) {

        quadrant.setAttribute('pTop', 0);
        quadrant.setAttribute('cTop', 0);

        quadrant.setAttribute('pBot', 0);
        quadrant.setAttribute('cBot', 0);
      });

      this.listeners();
    }

    // TODO: Add Debounce to scroll event

  }, {
    key: 'listeners',
    value: function listeners() {
      var _this = this;

      this.elements.window.addEventListener('scroll', function (e) {

        _this.scroll.current = _this.elements.window.pageYOffset;

        _this.scrollDirection(_this.scroll.previous, _this.scroll.current);

        _this.gridOverlap();

        _this.scroll.previous = _this.scroll.current;
      });
    }
  }, {
    key: 'scrollDirection',
    value: function scrollDirection(previous, current) {

      current > previous ? this.scroll.direction = true : this.scroll.direction = false;
    }
  }, {
    key: 'clearClasses',
    value: function clearClasses() {
      var _this2 = this;

      this.team.rows.forEach(function (row, index) {
        row.setAttribute('class', _this2.team.row + ' ' + _this2.team.row + '--' + (index + 1));
      });
    }
  }, {
    key: 'gridOverlap',
    value: function gridOverlap() {
      var _this3 = this;

      this.team.quadrants.forEach(function (quadrant, index) {

        quadrant.setAttribute('cTop', quadrant.getBoundingClientRect().top);
        quadrant.setAttribute('cBot', quadrant.getBoundingClientRect().bottom);

        var viewportHeight = window.innerHeight;

        var currentTop = quadrant.getAttribute('cTop');
        var previousTop = quadrant.getAttribute('pTop');
        var currentBot = quadrant.getAttribute('cBot');
        var previousBot = quadrant.getAttribute('pBot');

        // User is scrolling down and the quadrant crosses the top of the viewport
        if (previousTop > 0 && currentTop <= 0 && _this3.scroll.direction) {

          quadrant.firstChild.classList.add(_this3.team.upper);
          quadrant.lastChild.classList.add(_this3.team.lower);

          quadrant.firstChild.classList.remove(_this3.team.relative);
          quadrant.lastChild.classList.remove(_this3.team.relative);

          quadrant.firstChild.style.zIndex = 5;
          quadrant.lastChild.style.zIndex = 15;

          if (quadrant.previousSibling) {

            quadrant.previousSibling.firstChild.classList.remove(_this3.team.upper);
            quadrant.previousSibling.lastChild.classList.remove(_this3.team.lower);

            quadrant.previousSibling.firstChild.classList.add(_this3.team.relative);
            quadrant.previousSibling.lastChild.classList.add(_this3.team.relative);

            quadrant.previousSibling.firstChild.style.zIndex = 10;
            quadrant.previousSibling.lastChild.style.zIndex = 20;
          }

          if (quadrant.nextSibling) {

            quadrant.firstChild.classList.remove(_this3.team.relative);
            quadrant.lastChild.classList.remove(_this3.team.relative);

            quadrant.nextSibling.firstChild.classList.add(_this3.team.relative);
            quadrant.nextSibling.lastChild.classList.add(_this3.team.relative);

            quadrant.nextSibling.firstChild.style.zIndex = 10;
            quadrant.nextSibling.lastChild.style.zIndex = 20;
          } else {
            _this3.clearClasses();
          }
        }

        // User is scrolling up and the quadrant crosses the bottom of the viewport
        if (previousBot < viewportHeight && currentBot >= viewportHeight && !_this3.scroll.direction) {

          quadrant.firstChild.classList.add(_this3.team.upper);
          quadrant.lastChild.classList.add(_this3.team.lower);

          quadrant.firstChild.classList.remove(_this3.team.relative);
          quadrant.lastChild.classList.remove(_this3.team.relative);

          quadrant.firstChild.style.zIndex = 15;
          quadrant.lastChild.style.zIndex = 5;

          if (quadrant.nextSibling) {

            quadrant.nextSibling.firstChild.classList.remove(_this3.team.upper);
            quadrant.nextSibling.lastChild.classList.remove(_this3.team.lower);

            quadrant.nextSibling.firstChild.classList.add(_this3.team.relative);
            quadrant.nextSibling.lastChild.classList.add(_this3.team.relative);

            quadrant.nextSibling.firstChild.style.zIndex = 20;
            quadrant.nextSibling.lastChild.style.zIndex = 10;
          }

          if (quadrant.previousSibling) {

            quadrant.previousSibling.firstChild.classList.remove(_this3.team.upper);
            quadrant.previousSibling.lastChild.classList.remove(_this3.team.lower);

            quadrant.previousSibling.firstChild.classList.add(_this3.team.relative);
            quadrant.previousSibling.lastChild.classList.add(_this3.team.relative);

            quadrant.previousSibling.firstChild.style.zIndex = 20;
            quadrant.previousSibling.lastChild.style.zIndex = 10;
          } else {
            _this3.clearClasses();
          }
        }

        quadrant.setAttribute('pTop', currentTop);
        quadrant.setAttribute('pBot', currentBot);
      });
    }
  }]);

  return StoryTeam;
}();

exports.default = StoryTeam;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0b3J5VGVhbS5qcyJdLCJuYW1lcyI6WyJTdG9yeVRlYW0iLCJlbGVtZW50cyIsIndpbmRvdyIsImh0bWwiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJib2R5IiwidGVhbSIsImNvbnRhaW5lciIsInF1YWRyYW50cyIsInJvd3MiLCJyb3ciLCJ1cHBlciIsImxvd2VyIiwicmVsYXRpdmUiLCJzY3JvbGwiLCJwcmV2aW91cyIsImN1cnJlbnQiLCJkaXJlY3Rpb24iLCJpbml0IiwiZm9yRWFjaCIsInF1YWRyYW50IiwiaW5kZXgiLCJzZXRBdHRyaWJ1dGUiLCJsaXN0ZW5lcnMiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsRGlyZWN0aW9uIiwiZ3JpZE92ZXJsYXAiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ0b3AiLCJib3R0b20iLCJ2aWV3cG9ydEhlaWdodCIsImlubmVySGVpZ2h0IiwiY3VycmVudFRvcCIsImdldEF0dHJpYnV0ZSIsInByZXZpb3VzVG9wIiwiY3VycmVudEJvdCIsInByZXZpb3VzQm90IiwiZmlyc3RDaGlsZCIsImNsYXNzTGlzdCIsImFkZCIsImxhc3RDaGlsZCIsInJlbW92ZSIsInN0eWxlIiwiekluZGV4IiwicHJldmlvdXNTaWJsaW5nIiwibmV4dFNpYmxpbmciLCJjbGVhckNsYXNzZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBcUJBLFM7QUFFbkIsdUJBQWM7QUFBQTs7QUFDWixTQUFLQyxRQUFMLEdBQWdCO0FBQ2RDLGNBQVFBLE1BRE07QUFFZEMsWUFBTUMsU0FBU0MsZ0JBQVQsQ0FBMEIsTUFBMUIsRUFBa0MsQ0FBbEMsQ0FGUTtBQUdkQyxZQUFNRixTQUFTQyxnQkFBVCxDQUEwQixNQUExQixFQUFrQyxDQUFsQztBQUhRLEtBQWhCOztBQU1BLFNBQUtFLElBQUwsR0FBWTtBQUNWQyxpQkFBV0osU0FBU0MsZ0JBQVQsQ0FBMEIsYUFBMUIsRUFBeUMsQ0FBekMsQ0FE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QXlCUCxVQUF6QixDQUFvQ0MsU0FBcEMsQ0FBOENDLEdBQTlDLENBQWtELE9BQUtuQyxJQUFMLENBQVVPLFFBQTVEO0FBQ0FPLHFCQUFTMEIsZUFBVCxDQUF5QkosU0FBekIsQ0FBbUNGLFNBQW5DLENBQTZDQyxHQUE3QyxDQUFpRCxPQUFLbkMsSUFBTCxDQUFVTyxRQUEzRDs7QUFFQU8scUJBQVMwQixlQUFULENBQXlCUCxVQUF6QixDQUFvQ0ssS0FBcEMsQ0FBMENDLE1BQTFDLEdBQW1ELEVBQW5EO0FBQ0F6QixxQkFBUzBCLGVBQVQsQ0FBeUJKLFNBQXpCLENBQW1DRSxLQUFuQyxDQUF5Q0MsTUFBekMsR0FBa0QsRUFBbEQ7QUFDRCxXQVZELE1BVU87QUFDTCxtQkFBS0csWUFBTDtBQUNEO0FBQ0Y7O0FBRUQ1QixpQkFBU0UsWUFBVCxDQUFzQixNQUF0QixFQUE4QlksVUFBOUI7QUFDQWQsaUJBQVNFLFlBQVQsQ0FBc0IsTUFBdEIsRUFBOEJlLFVBQTlCO0FBRUQsT0E3RkQ7QUE4RkQ7Ozs7OztrQkE1S2tCdEMsUyIsImZpbGUiOiJTdG9yeVRlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yeVRlYW0ge1xuICBcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IHtcbiAgICAgIHdpbmRvdzogd2luZG93LFxuICAgICAgaHRtbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaHRtbCcpWzBdLFxuICAgICAgYm9keTogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYm9keScpWzBdXG4gICAgfVxuXG4gICAgdGhpcy50ZWFtID0ge1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc3RvcnktdGVhbScpWzBdLFxuICAgICAgcXVhZHJhbnRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYy10ZWFtX19xdWFkcmFudCcpLFxuICAgICAgcm93czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmMtdGVhbV9fcm93JyksXG4gICAgICByb3c6ICAnYy10ZWFtX19yb3cnLFxuICAgICAgdXBwZXI6ICdjLXRlYW1fX3Jvdy0tdXBwZXInLCBcbiAgICAgIGxvd2VyOiAnYy10ZWFtX19yb3ctLWxvd2VyJyxcbiAgICAgIHJlbGF0aXZlOiAnYy10ZWFtX19yb3ctLXJlbGF0aXZlJ1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsID0ge1xuICAgICAgcHJldmlvdXM6IDAsXG4gICAgICBjdXJyZW50OiAwLFxuICAgICAgZGlyZWN0aW9uOiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnRlYW0ucXVhZHJhbnRzLmZvckVhY2goIChxdWFkcmFudCwgaW5kZXgpID0+IHtcblxuICAgICAgcXVhZHJhbnQuc2V0QXR0cmlidXRlKCdwVG9wJywgMCk7XG4gICAgICBxdWFkcmFudC5zZXRBdHRyaWJ1dGUoJ2NUb3AnLCAwKTtcblxuICAgICAgcXVhZHJhbnQuc2V0QXR0cmlidXRlKCdwQm90JywgMCk7XG4gICAgICBxdWFkcmFudC5zZXRBdHRyaWJ1dGUoJ2NCb3QnLCAwKTtcbiAgICBcbiAgICB9KTtcblxuICAgIHRoaXMubGlzdGVuZXJzKCk7XG4gIH1cblxuXG4gIC8vIFRPRE86IEFkZCBEZWJvdW5jZSB0byBzY3JvbGwgZXZlbnRcbiAgbGlzdGVuZXJzKCkge1xuXG4gICAgdGhpcy5lbGVtZW50cy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKGUpID0+IHsgXG5cbiAgICAgIHRoaXMuc2Nyb2xsLmN1cnJlbnQgPSB0aGlzLmVsZW1lbnRzLndpbmRvdy5wYWdlWU9mZnNldDtcblxuICAgICAgdGhpcy5zY3JvbGxEaXJlY3Rpb24odGhpcy5zY3JvbGwucHJldmlvdXMsIHRoaXMuc2Nyb2xsLmN1cnJlbnQpO1xuXG4gICAgICB0aGlzLmdyaWRPdmVybGFwKCk7XG5cbiAgICAgIHRoaXMuc2Nyb2xsLnByZXZpb3VzID0gdGhpcy5zY3JvbGwuY3VycmVudDtcbiAgICB9KTtcblxuICB9XG5cbiAgXG4gIHNjcm9sbERpcmVjdGlvbihwcmV2aW91cywgY3VycmVudCkge1xuXG4gICAgKGN1cnJlbnQgPiBwcmV2aW91cykgXG4gICAgICA/IHRoaXMuc2Nyb2xsLmRpcmVjdGlvbiA9IHRydWVcbiAgICAgIDogdGhpcy5zY3JvbGwuZGlyZWN0aW9uID0gZmFsc2U7XG5cbiAgfVxuXG5cbiAgY2xlYXJDbGFzc2VzKCkge1xuICAgIHRoaXMudGVhbS5yb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7dGhpcy50ZWFtLnJvd30gJHt0aGlzLnRlYW0ucm93fS0tJHtpbmRleCArIDF9YCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIGdyaWRPdmVybGFwKCkgeyBcblxuICAgIHRoaXMudGVhbS5xdWFkcmFudHMuZm9yRWFjaCggKHF1YWRyYW50LCBpbmRleCkgPT4ge1xuXG4gICAgICBxdWFkcmFudC5zZXRBdHRyaWJ1dGUoJ2NUb3AnLCBxdWFkcmFudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApO1xuICAgICAgcXVhZHJhbnQuc2V0QXR0cmlidXRlKCdjQm90JywgcXVhZHJhbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tKTtcblxuICAgICAgbGV0IHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICBsZXQgY3VycmVudFRvcCA9IHF1YWRyYW50LmdldEF0dHJpYnV0ZSgnY1RvcCcpO1xuICAgICAgbGV0IHByZXZpb3VzVG9wID0gcXVhZHJhbnQuZ2V0QXR0cmlidXRlKCdwVG9wJyk7XG4gICAgICBsZXQgY3VycmVudEJvdCA9IHF1YWRyYW50LmdldEF0dHJpYnV0ZSgnY0JvdCcpO1xuICAgICAgbGV0IHByZXZpb3VzQm90ID0gcXVhZHJhbnQuZ2V0QXR0cmlidXRlKCdwQm90Jyk7XG5cbiAgICAgIC8vIFVzZXIgaXMgc2Nyb2xsaW5nIGRvd24gYW5kIHRoZSBxdWFkcmFudCBjcm9zc2VzIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0XG4gICAgICBpZiAocHJldmlvdXNUb3AgPiAwICYmIGN1cnJlbnRUb3AgPD0gMCAmJiB0aGlzLnNjcm9sbC5kaXJlY3Rpb24pIHtcblxuICAgICAgICBxdWFkcmFudC5maXJzdENoaWxkLmNsYXNzTGlzdC5hZGQodGhpcy50ZWFtLnVwcGVyKTtcbiAgICAgICAgcXVhZHJhbnQubGFzdENoaWxkLmNsYXNzTGlzdC5hZGQodGhpcy50ZWFtLmxvd2VyKTtcblxuICAgICAgICBxdWFkcmFudC5maXJzdENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy50ZWFtLnJlbGF0aXZlKTtcbiAgICAgICAgcXVhZHJhbnQubGFzdENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy50ZWFtLnJlbGF0aXZlKTtcblxuICAgICAgICBxdWFkcmFudC5maXJzdENoaWxkLnN0eWxlLnpJbmRleCA9IDU7XG4gICAgICAgIHF1YWRyYW50Lmxhc3RDaGlsZC5zdHlsZS56SW5kZXggPSAxNTtcblxuICAgICAgICBpZiAocXVhZHJhbnQucHJldmlvdXNTaWJsaW5nKSB7XG5cbiAgICAgICAgICBxdWFkcmFudC5wcmV2aW91c1NpYmxpbmcuZmlyc3RDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMudGVhbS51cHBlcik7XG4gICAgICAgICAgcXVhZHJhbnQucHJldmlvdXNTaWJsaW5nLmxhc3RDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMudGVhbS5sb3dlcik7XG5cbiAgICAgICAgICBxdWFkcmFudC5wcmV2aW91c1NpYmxpbmcuZmlyc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG4gICAgICAgICAgcXVhZHJhbnQucHJldmlvdXNTaWJsaW5nLmxhc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG5cbiAgICAgICAgICBxdWFkcmFudC5wcmV2aW91c1NpYmxpbmcuZmlyc3RDaGlsZC5zdHlsZS56SW5kZXggPSAxMDtcbiAgICAgICAgICBxdWFkcmFudC5wcmV2aW91c1NpYmxpbmcubGFzdENoaWxkLnN0eWxlLnpJbmRleCA9IDIwO1xuICAgICAgICB9IFxuICAgICAgICBcbiAgICAgICAgaWYgKHF1YWRyYW50Lm5leHRTaWJsaW5nKSB7XG4gICAgXG4gICAgICAgICAgcXVhZHJhbnQuZmlyc3RDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG4gICAgICAgICAgcXVhZHJhbnQubGFzdENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy50ZWFtLnJlbGF0aXZlKTtcblxuICAgICAgICAgIHF1YWRyYW50Lm5leHRTaWJsaW5nLmZpcnN0Q2hpbGQuY2xhc3NMaXN0LmFkZCh0aGlzLnRlYW0ucmVsYXRpdmUpO1xuICAgICAgICAgIHF1YWRyYW50Lm5leHRTaWJsaW5nLmxhc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG5cbiAgICAgICAgICBxdWFkcmFudC5uZXh0U2libGluZy5maXJzdENoaWxkLnN0eWxlLnpJbmRleCA9IDEwO1xuICAgICAgICAgIHF1YWRyYW50Lm5leHRTaWJsaW5nLmxhc3RDaGlsZC5zdHlsZS56SW5kZXggPSAyMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3NlcygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFVzZXIgaXMgc2Nyb2xsaW5nIHVwIGFuZCB0aGUgcXVhZHJhbnQgY3Jvc3NlcyB0aGUgYm90dG9tIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgaWYgKHByZXZpb3VzQm90IDwgdmlld3BvcnRIZWlnaHQgJiYgY3VycmVudEJvdCA+PSB2aWV3cG9ydEhlaWdodCAmJiAhdGhpcy5zY3JvbGwuZGlyZWN0aW9uKSB7XG5cbiAgICAgICAgcXVhZHJhbnQuZmlyc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMudGVhbS51cHBlcik7XG4gICAgICAgIHF1YWRyYW50Lmxhc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMudGVhbS5sb3dlcik7XG5cbiAgICAgICAgcXVhZHJhbnQuZmlyc3RDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG4gICAgICAgIHF1YWRyYW50Lmxhc3RDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG5cbiAgICAgICAgcXVhZHJhbnQuZmlyc3RDaGlsZC5zdHlsZS56SW5kZXggPSAxNTtcbiAgICAgICAgcXVhZHJhbnQubGFzdENoaWxkLnN0eWxlLnpJbmRleCA9IDU7XG5cbiAgICAgICAgaWYgKHF1YWRyYW50Lm5leHRTaWJsaW5nKSB7XG5cbiAgICAgICAgICBxdWFkcmFudC5uZXh0U2libGluZy5maXJzdENoaWxkLmNsYXNzTGlzdC5yZW1vdmUodGhpcy50ZWFtLnVwcGVyKTtcbiAgICAgICAgICBxdWFkcmFudC5uZXh0U2libGluZy5sYXN0Q2hpbGQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnRlYW0ubG93ZXIpO1xuXG4gICAgICAgICAgcXVhZHJhbnQubmV4dFNpYmxpbmcuZmlyc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHRoaXMudGVhbS5yZWxhdGl2ZSk7XG4gICAgICAgICAgcXVhZHJhbnQubmV4dFNpYmxpbmcubGFzdENoaWxkLmNsYXNzTGlzdC5hZGQodGhpcy50ZWFtLnJlbGF0aXZlKTtcblxuICAgICAgICAgIHF1YWRyYW50Lm5leHRTaWJsaW5nLmZpcnN0Q2hpbGQuc3R5bGUuekluZGV4ID0gMjA7XG4gICAgICAgICAgcXVhZHJhbnQubmV4dFNpYmxpbmcubGFzdENoaWxkLnN0eWxlLnpJbmRleCA9IDEwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHF1YWRyYW50LnByZXZpb3VzU2libGluZykge1xuXG4gICAgICAgICAgcXVhZHJhbnQucHJldmlvdXNTaWJsaW5nLmZpcnN0Q2hpbGQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnRlYW0udXBwZXIpO1xuICAgICAgICAgIHF1YWRyYW50LnByZXZpb3VzU2libGluZy5sYXN0Q2hpbGQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnRlYW0ubG93ZXIpO1xuXG4gICAgICAgICAgcXVhZHJhbnQucHJldmlvdXNTaWJsaW5nLmZpcnN0Q2hpbGQuY2xhc3NMaXN0LmFkZCh0aGlzLnRlYW0ucmVsYXRpdmUpO1xuICAgICAgICAgIHF1YWRyYW50LnByZXZpb3VzU2libGluZy5sYXN0Q2hpbGQuY2xhc3NMaXN0LmFkZCh0aGlzLnRlYW0ucmVsYXRpdmUpO1xuXG4gICAgICAgICAgcXVhZHJhbnQucHJldmlvdXNTaWJsaW5nLmZpcnN0Q2hpbGQuc3R5bGUuekluZGV4ID0gMjA7XG4gICAgICAgICAgcXVhZHJhbnQucHJldmlvdXNTaWJsaW5nLmxhc3RDaGlsZC5zdHlsZS56SW5kZXggPSAxMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNsZWFyQ2xhc3NlcygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHF1YWRyYW50LnNldEF0dHJpYnV0ZSgncFRvcCcsIGN1cnJlbnRUb3ApO1xuICAgICAgcXVhZHJhbnQuc2V0QXR0cmlidXRlKCdwQm90JywgY3VycmVudEJvdCk7XG5cbiAgICB9KTtcbiAgfVxufVxuXG4iXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/StoryTeam.js","/app")
},{"buffer":2,"rH1JPG":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var _StoryTeam = require('./app/StoryTeam');

var _StoryTeam2 = _interopRequireDefault(_StoryTeam);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storyTeam = new _StoryTeam2.default(); // App
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfMjU1ODFiN2IuanMiXSwibmFtZXMiOlsic3RvcnlUZWFtIl0sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxZQUFZLHlCQUFsQixDLENBSEEiLCJmaWxlIjoiZmFrZV8yNTU4MWI3Yi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEFwcFxuaW1wb3J0IFN0b3J5VGVhbSBmcm9tICcuL2FwcC9TdG9yeVRlYW0nO1xuXG5jb25zdCBzdG9yeVRlYW0gPSBuZXcgU3RvcnlUZWFtKCk7XG4iXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_25581b7b.js","/")
},{"./app/StoryTeam":5,"buffer":2,"rH1JPG":4}]},{},[6])