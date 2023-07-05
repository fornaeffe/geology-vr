/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/xml-utils/count-substring.js":
/*!***************************************************!*\
  !*** ./node_modules/xml-utils/count-substring.js ***!
  \***************************************************/
/***/ ((module) => {

function countSubstring(string, substring) {
  const pattern = new RegExp(substring, "g");
  const match = string.match(pattern);
  return match ? match.length : 0;
}

module.exports = countSubstring;
module.exports["default"] = countSubstring;


/***/ }),

/***/ "./node_modules/xml-utils/find-tag-by-name.js":
/*!****************************************************!*\
  !*** ./node_modules/xml-utils/find-tag-by-name.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const indexOfMatch = __webpack_require__(/*! ./index-of-match.js */ "./node_modules/xml-utils/index-of-match.js");
const indexOfMatchEnd = __webpack_require__(/*! ./index-of-match-end.js */ "./node_modules/xml-utils/index-of-match-end.js");
const countSubstring = __webpack_require__(/*! ./count-substring.js */ "./node_modules/xml-utils/count-substring.js");

function findTagByName(xml, tagName, options) {
  const debug = (options && options.debug) || false;
  const nested = !(options && typeof options.nested === false);

  const startIndex = (options && options.startIndex) || 0;

  if (debug) console.log("[xml-utils] starting findTagByName with", tagName, " and ", options);

  const start = indexOfMatch(xml, `\<${tagName}[ \n\>\/]`, startIndex);
  if (debug) console.log("[xml-utils] start:", start);
  if (start === -1) return undefined;

  const afterStart = xml.slice(start + tagName.length);

  let relativeEnd = indexOfMatchEnd(afterStart, "^[^<]*[ /]>", 0);

  const selfClosing = relativeEnd !== -1 && afterStart[relativeEnd - 1] === "/";
  if (debug) console.log("[xml-utils] selfClosing:", selfClosing);

  if (selfClosing === false) {
    // check if tag has subtags with the same name
    if (nested) {
      let startIndex = 0;
      let openings = 1;
      let closings = 0;
      while ((relativeEnd = indexOfMatchEnd(afterStart, "[ /]" + tagName + ">", startIndex)) !== -1) {
        const clip = afterStart.substring(startIndex, relativeEnd + 1);
        openings += countSubstring(clip, "<" + tagName + "[ \n\t>]");
        closings += countSubstring(clip, "</" + tagName + ">");
        // we can't have more openings than closings
        if (closings >= openings) break;
        startIndex = relativeEnd;
      }
    } else {
      relativeEnd = indexOfMatchEnd(afterStart, "[ /]" + tagName + ">", 0);
    }
  }

  const end = start + tagName.length + relativeEnd + 1;
  if (debug) console.log("[xml-utils] end:", end);
  if (end === -1) return undefined;

  const outer = xml.slice(start, end);
  // tag is like <gml:identifier codeSpace="OGP">urn:ogc:def:crs:EPSG::32617</gml:identifier>

  let inner;
  if (selfClosing) {
    inner = null;
  } else {
    inner = outer.slice(outer.indexOf(">") + 1, outer.lastIndexOf("<"));
  }

  return { inner, outer, start, end };
}

module.exports = findTagByName;
module.exports["default"] = findTagByName;


/***/ }),

/***/ "./node_modules/xml-utils/find-tags-by-name.js":
/*!*****************************************************!*\
  !*** ./node_modules/xml-utils/find-tags-by-name.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const findTagByName = __webpack_require__(/*! ./find-tag-by-name.js */ "./node_modules/xml-utils/find-tag-by-name.js");

function findTagsByName(xml, tagName, options) {
  const tags = [];
  const debug = (options && options.debug) || false;
  const nested = options && typeof options.nested === "boolean" ? options.nested : true;
  let startIndex = (options && options.startIndex) || 0;
  let tag;
  while ((tag = findTagByName(xml, tagName, { debug, startIndex }))) {
    if (nested) {
      startIndex = tag.start + 1 + tagName.length;
    } else {
      startIndex = tag.end;
    }
    tags.push(tag);
  }
  if (debug) console.log("findTagsByName found", tags.length, "tags");
  return tags;
}

module.exports = findTagsByName;
module.exports["default"] = findTagsByName;


/***/ }),

/***/ "./node_modules/xml-utils/get-attribute.js":
/*!*************************************************!*\
  !*** ./node_modules/xml-utils/get-attribute.js ***!
  \*************************************************/
/***/ ((module) => {

function getAttribute(tag, attributeName, options) {
  const debug = (options && options.debug) || false;
  if (debug) console.log("[xml-utils] getting " + attributeName + " in " + tag);

  const xml = typeof tag === "object" ? tag.outer : tag;

  // only search for attributes in the opening tag
  const opening = xml.slice(0, xml.indexOf(">") + 1);

  const quotechars = ['"', "'"];
  for (let i = 0; i < quotechars.length; i++) {
    const char = quotechars[i];
    const pattern = attributeName + "\\=" + char + "([^" + char + "]*)" + char;
    if (debug) console.log("[xml-utils] pattern:", pattern);

    const re = new RegExp(pattern);
    const match = re.exec(opening);
    if (debug) console.log("[xml-utils] match:", match);
    if (match) return match[1];
  }
}

module.exports = getAttribute;
module.exports["default"] = getAttribute;


/***/ }),

/***/ "./node_modules/xml-utils/index-of-match-end.js":
/*!******************************************************!*\
  !*** ./node_modules/xml-utils/index-of-match-end.js ***!
  \******************************************************/
/***/ ((module) => {

function indexOfMatchEnd(xml, pattern, startIndex) {
  const re = new RegExp(pattern);
  const match = re.exec(xml.slice(startIndex));
  if (match) return startIndex + match.index + match[0].length - 1;
  else return -1;
}

module.exports = indexOfMatchEnd;
module.exports["default"] = indexOfMatchEnd;


/***/ }),

/***/ "./node_modules/xml-utils/index-of-match.js":
/*!**************************************************!*\
  !*** ./node_modules/xml-utils/index-of-match.js ***!
  \**************************************************/
/***/ ((module) => {

function indexOfMatch(xml, pattern, startIndex) {
  const re = new RegExp(pattern);
  const match = re.exec(xml.slice(startIndex));
  if (match) return startIndex + match.index;
  else return -1;
}

module.exports = indexOfMatch;
module.exports["default"] = indexOfMatch;


/***/ }),

/***/ "?cdec":
/*!**********************!*\
  !*** http (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?753a":
/*!***********************!*\
  !*** https (ignored) ***!
  \***********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?4e4d":
/*!*********************!*\
  !*** url (ignored) ***!
  \*********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?662e":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/@petamoriken/float16/src/DataView.mjs":
/*!************************************************************!*\
  !*** ./node_modules/@petamoriken/float16/src/DataView.mjs ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getFloat16: () => (/* binding */ getFloat16),
/* harmony export */   setFloat16: () => (/* binding */ setFloat16)
/* harmony export */ });
/* harmony import */ var _util_arrayIterator_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_util/arrayIterator.mjs */ "./node_modules/@petamoriken/float16/src/_util/arrayIterator.mjs");
/* harmony import */ var _util_converter_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_util/converter.mjs */ "./node_modules/@petamoriken/float16/src/_util/converter.mjs");
/* harmony import */ var _util_primordials_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_util/primordials.mjs */ "./node_modules/@petamoriken/float16/src/_util/primordials.mjs");




/**
 * returns an unsigned 16-bit float at the specified byte offset from the start of the DataView
 *
 * @param {DataView} dataView
 * @param {number} byteOffset
 * @param {[boolean]} opts
 * @returns {number}
 */
function getFloat16(dataView, byteOffset, ...opts) {
  return (0,_util_converter_mjs__WEBPACK_IMPORTED_MODULE_0__.convertToNumber)(
    (0,_util_primordials_mjs__WEBPACK_IMPORTED_MODULE_1__.DataViewPrototypeGetUint16)(dataView, byteOffset, ...(0,_util_arrayIterator_mjs__WEBPACK_IMPORTED_MODULE_2__.safeIfNeeded)(opts))
  );
}

/**
 * stores an unsigned 16-bit float value at the specified byte offset from the start of the DataView
 *
 * @param {DataView} dataView
 * @param {number} byteOffset
 * @param {number} value
 * @param {[boolean]} opts
 */
function setFloat16(dataView, byteOffset, value, ...opts) {
  return (0,_util_primordials_mjs__WEBPACK_IMPORTED_MODULE_1__.DataViewPrototypeSetUint16)(
    dataView,
    byteOffset,
    (0,_util_converter_mjs__WEBPACK_IMPORTED_MODULE_0__.roundToFloat16Bits)(value),
    ...(0,_util_arrayIterator_mjs__WEBPACK_IMPORTED_MODULE_2__.safeIfNeeded)(opts)
  );
}


/***/ }),

/***/ "./node_modules/@petamoriken/float16/src/_util/arrayIterator.mjs":
/*!***********************************************************************!*\
  !*** ./node_modules/@petamoriken/float16/src/_util/arrayIterator.mjs ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   safeIfNeeded: () => (/* binding */ safeIfNeeded),
/* harmony export */   wrap: () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./primordials.mjs */ "./node_modules/@petamoriken/float16/src/_util/primordials.mjs");


/** @type {WeakMap<{}, IterableIterator<any>>} */
const arrayIterators = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeWeakMap();

const SafeIteratorPrototype = (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ObjectCreate)(null, {
  next: {
    value: function next() {
      const arrayIterator = (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.WeakMapPrototypeGet)(arrayIterators, this);
      return (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ArrayIteratorPrototypeNext)(arrayIterator);
    },
  },

  [_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.SymbolIterator]: {
    value: function values() {
      return this;
    },
  },
});

/**
 * Wrap the Array around the SafeIterator If Array.prototype [@@iterator] has been modified
 *
 * @type {<T>(array: T[]) => Iterable<T>}
 */
function safeIfNeeded(array) {
  if (
    array[_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.SymbolIterator] === _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeArrayPrototypeSymbolIterator &&
    _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ArrayIteratorPrototype.next === _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ArrayIteratorPrototypeNext
  ) {
    return array;
  }

  const safe = (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ObjectCreate)(SafeIteratorPrototype);
  (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.WeakMapPrototypeSet)(arrayIterators, safe, (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ArrayPrototypeSymbolIterator)(array));
  return safe;
}

/** @type {WeakMap<{}, Generator<any>>} */
const generators = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeWeakMap();

/** @see https://tc39.es/ecma262/#sec-%arrayiteratorprototype%-object */
const DummyArrayIteratorPrototype = (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ObjectCreate)(_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.IteratorPrototype, {
  next: {
    value: function next() {
      const generator = (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.WeakMapPrototypeGet)(generators, this);
      return (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.GeneratorPrototypeNext)(generator);
    },
    writable: true,
    configurable: true,
  },
});

for (const key of (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ReflectOwnKeys)(_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ArrayIteratorPrototype)) {
  // next method has already defined
  if (key === "next") {
    continue;
  }

  // Copy ArrayIteratorPrototype descriptors to DummyArrayIteratorPrototype
  (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ObjectDefineProperty)(DummyArrayIteratorPrototype, key, (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ReflectGetOwnPropertyDescriptor)(_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ArrayIteratorPrototype, key));
}

/**
 * Wrap the Generator around the dummy ArrayIterator
 *
 * @type {<T>(generator: Generator<T>) => IterableIterator<T>}
 */
function wrap(generator) {
  const dummy = (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.ObjectCreate)(DummyArrayIteratorPrototype);
  (0,_primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.WeakMapPrototypeSet)(generators, dummy, generator);
  return dummy;
}


/***/ }),

/***/ "./node_modules/@petamoriken/float16/src/_util/converter.mjs":
/*!*******************************************************************!*\
  !*** ./node_modules/@petamoriken/float16/src/_util/converter.mjs ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertToNumber: () => (/* binding */ convertToNumber),
/* harmony export */   roundToFloat16Bits: () => (/* binding */ roundToFloat16Bits)
/* harmony export */ });
/* harmony import */ var _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./primordials.mjs */ "./node_modules/@petamoriken/float16/src/_util/primordials.mjs");
// algorithm: http://fox-toolkit.org/ftp/fasthalffloatconversion.pdf



const buffer = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeArrayBuffer(4);
const floatView = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeFloat32Array(buffer);
const uint32View = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeUint32Array(buffer);

const baseTable = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeUint32Array(512);
const shiftTable = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeUint32Array(512);

for (let i = 0; i < 256; ++i) {
  const e = i - 127;

  // very small number (0, -0)
  if (e < -27) {
    baseTable[i]         = 0x0000;
    baseTable[i | 0x100] = 0x8000;
    shiftTable[i]         = 24;
    shiftTable[i | 0x100] = 24;

  // small number (denorm)
  } else if (e < -14) {
    baseTable[i]         =  0x0400 >> (-e - 14);
    baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
    shiftTable[i]         = -e - 1;
    shiftTable[i | 0x100] = -e - 1;

  // normal number
  } else if (e <= 15) {
    baseTable[i]         =  (e + 15) << 10;
    baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
    shiftTable[i]         = 13;
    shiftTable[i | 0x100] = 13;

  // large number (Infinity, -Infinity)
  } else if (e < 128) {
    baseTable[i]         = 0x7c00;
    baseTable[i | 0x100] = 0xfc00;
    shiftTable[i]         = 24;
    shiftTable[i | 0x100] = 24;

  // stay (NaN, Infinity, -Infinity)
  } else {
    baseTable[i]         = 0x7c00;
    baseTable[i | 0x100] = 0xfc00;
    shiftTable[i]         = 13;
    shiftTable[i | 0x100] = 13;
  }
}

/**
 * round a number to a half float number bits
 *
 * @param {unknown} num - double float
 * @returns {number} half float number bits
 */
function roundToFloat16Bits(num) {
  floatView[0] = /** @type {any} */ (num);
  const f = uint32View[0];
  const e = (f >> 23) & 0x1ff;
  return baseTable[e] + ((f & 0x007fffff) >> shiftTable[e]);
}

const mantissaTable = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeUint32Array(2048);
const exponentTable = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeUint32Array(64);
const offsetTable = new _primordials_mjs__WEBPACK_IMPORTED_MODULE_0__.NativeUint32Array(64);

for (let i = 1; i < 1024; ++i) {
  let m = i << 13;    // zero pad mantissa bits
  let e = 0;          // zero exponent

  // normalized
  while((m & 0x00800000) === 0) {
    m <<= 1;
    e -= 0x00800000;  // decrement exponent
  }

  m &= ~0x00800000;   // clear leading 1 bit
  e += 0x38800000;    // adjust bias

  mantissaTable[i] = m | e;
}
for (let i = 1024; i < 2048; ++i) {
  mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
}

for (let i = 1; i < 31; ++i) {
  exponentTable[i] = i << 23;
}
exponentTable[31] = 0x47800000;
exponentTable[32] = 0x80000000;
for (let i = 33; i < 63; ++i) {
  exponentTable[i] = 0x80000000 + ((i - 32) << 23);
}
exponentTable[63] = 0xc7800000;

for (let i = 1; i < 64; ++i) {
  if (i !== 32) {
    offsetTable[i] = 1024;
  }
}

/**
 * convert a half float number bits to a number
 *
 * @param {number} float16bits - half float number bits
 * @returns {number} double float
 */
function convertToNumber(float16bits) {
  const m = float16bits >> 10;
  uint32View[0] = mantissaTable[offsetTable[m] + (float16bits & 0x3ff)] + exponentTable[m];
  return floatView[0];
}


/***/ }),

/***/ "./node_modules/@petamoriken/float16/src/_util/messages.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/@petamoriken/float16/src/_util/messages.mjs ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ATTEMPTING_TO_ACCESS_DETACHED_ARRAYBUFFER: () => (/* binding */ ATTEMPTING_TO_ACCESS_DETACHED_ARRAYBUFFER),
/* harmony export */   CANNOT_CONVERT_UNDEFINED_OR_NULL_TO_OBJECT: () => (/* binding */ CANNOT_CONVERT_UNDEFINED_OR_NULL_TO_OBJECT),
/* harmony export */   CANNOT_MIX_BIGINT_AND_OTHER_TYPES: () => (/* binding */ CANNOT_MIX_BIGINT_AND_OTHER_TYPES),
/* harmony export */   DERIVED_CONSTRUCTOR_CREATED_TYPEDARRAY_OBJECT_WHICH_WAS_TOO_SMALL_LENGTH: () => (/* binding */ DERIVED_CONSTRUCTOR_CREATED_TYPEDARRAY_OBJECT_WHICH_WAS_TOO_SMALL_LENGTH),
/* harmony export */   ITERATOR_PROPERTY_IS_NOT_CALLABLE: () => (/* binding */ ITERATOR_PROPERTY_IS_NOT_CALLABLE),
/* harmony export */   OFFSET_IS_OUT_OF_BOUNDS: () => (/* binding */ OFFSET_IS_OUT_OF_BOUNDS),
/* harmony export */   REDUCE_OF_EMPTY_ARRAY_WITH_NO_INITIAL_VALUE: () => (/* binding */ REDUCE_OF_EMPTY_ARRAY_WITH_NO_INITIAL_VALUE),
/* harmony export */   SPECIES_CONSTRUCTOR_DIDNT_RETURN_TYPEDARRAY_OBJECT: () => (/* binding */ SPECIES_CONSTRUCTOR_DIDNT_RETURN_TYPEDARRAY_OBJECT),
/* harmony export */   THE_COMPARISON_FUNCTION_MUST_BE_EITHER_A_FUNCTION_OR_UNDEFINED: () => (/* binding */ THE_COMPARISON_FUNCTION_MUST_BE_EITHER_A_FUNCTION_OR_UNDEFINED),
/* harmony export */   THE_CONSTRUCTOR_PROPERTY_VALUE_IS_NOT_AN_OBJECT: () => (/* binding */ THE_CONSTRUCTOR_PROPERTY_VALUE_IS_NOT_AN_OBJECT),
/* harmony export */   THIS_CONSTRUCTOR_IS_NOT_A_SUBCLASS_OF_FLOAT16ARRAY: () => (/* binding */ THIS_CONSTRUCTOR_IS_NOT_A_SUBCLASS_OF_FLOAT16ARRAY),
/* harmony export */   THIS_IS_NOT_AN_OBJECT: () => (/* binding */ THIS_IS_NOT_AN_OBJECT),
/* harmony export */   THIS_IS_NOT_A_FLOAT16ARRAY_OBJECT: () => (/* binding */ THIS_IS_NOT_A_FLOAT16ARRAY_OBJECT)
/* harmony export */ });
const THIS_IS_NOT_AN_OBJECT = "This is not an object";
const THIS_IS_NOT_A_FLOAT16ARRAY_OBJECT = "This is not a Float16Array object";
const THIS_CONSTRUCTOR_IS_NOT_A_SUBCLASS_OF_FLOAT16ARRAY =
  "This constructor is not a subclass of Float16Array";
const THE_CONSTRUCTOR_PROPERTY_VALUE_IS_NOT_AN_OBJECT =
  "The constructor property value is not an object";
const SPECIES_CONSTRUCTOR_DIDNT_RETURN_TYPEDARRAY_OBJECT =
  "Species constructor didn't return TypedArray object";
const DERIVED_CONSTRUCTOR_CREATED_TYPEDARRAY_OBJECT_WHICH_WAS_TOO_SMALL_LENGTH =
  "Derived constructor created TypedArray object which was too small length";
const ATTEMPTING_TO_ACCESS_DETACHED_ARRAYBUFFER =
  "Attempting to access detached ArrayBuffer";
const CANNOT_CONVERT_UNDEFINED_OR_NULL_TO_OBJECT =
  "Cannot convert undefined or null to object";
const CANNOT_MIX_BIGINT_AND_OTHER_TYPES =
  "Cannot mix BigInt and other types, use explicit conversions";
const ITERATOR_PROPERTY_IS_NOT_CALLABLE = "@@iterator property is not callable";
const REDUCE_OF_EMPTY_ARRAY_WITH_NO_INITIAL_VALUE =
  "Reduce of empty array with no initial value";
const THE_COMPARISON_FUNCTION_MUST_BE_EITHER_A_FUNCTION_OR_UNDEFINED =
  "The comparison function must be either a function or undefined";
const OFFSET_IS_OUT_OF_BOUNDS = "Offset is out of bounds";


/***/ }),

/***/ "./node_modules/@petamoriken/float16/src/_util/primordials.mjs":
/*!*********************************************************************!*\
  !*** ./node_modules/@petamoriken/float16/src/_util/primordials.mjs ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArrayBufferIsView: () => (/* binding */ ArrayBufferIsView),
/* harmony export */   ArrayBufferPrototypeGetByteLength: () => (/* binding */ ArrayBufferPrototypeGetByteLength),
/* harmony export */   ArrayBufferPrototypeSlice: () => (/* binding */ ArrayBufferPrototypeSlice),
/* harmony export */   ArrayIsArray: () => (/* binding */ ArrayIsArray),
/* harmony export */   ArrayIteratorPrototype: () => (/* binding */ ArrayIteratorPrototype),
/* harmony export */   ArrayIteratorPrototypeNext: () => (/* binding */ ArrayIteratorPrototypeNext),
/* harmony export */   ArrayPrototypeJoin: () => (/* binding */ ArrayPrototypeJoin),
/* harmony export */   ArrayPrototypePush: () => (/* binding */ ArrayPrototypePush),
/* harmony export */   ArrayPrototypeSymbolIterator: () => (/* binding */ ArrayPrototypeSymbolIterator),
/* harmony export */   ArrayPrototypeToLocaleString: () => (/* binding */ ArrayPrototypeToLocaleString),
/* harmony export */   DataViewPrototypeGetUint16: () => (/* binding */ DataViewPrototypeGetUint16),
/* harmony export */   DataViewPrototypeSetUint16: () => (/* binding */ DataViewPrototypeSetUint16),
/* harmony export */   GeneratorPrototypeNext: () => (/* binding */ GeneratorPrototypeNext),
/* harmony export */   IteratorPrototype: () => (/* binding */ IteratorPrototype),
/* harmony export */   MAX_SAFE_INTEGER: () => (/* binding */ MAX_SAFE_INTEGER),
/* harmony export */   MathTrunc: () => (/* binding */ MathTrunc),
/* harmony export */   NativeArrayBuffer: () => (/* binding */ NativeArrayBuffer),
/* harmony export */   NativeArrayPrototypeSymbolIterator: () => (/* binding */ NativeArrayPrototypeSymbolIterator),
/* harmony export */   NativeFloat32Array: () => (/* binding */ NativeFloat32Array),
/* harmony export */   NativeObject: () => (/* binding */ NativeObject),
/* harmony export */   NativeProxy: () => (/* binding */ NativeProxy),
/* harmony export */   NativeRangeError: () => (/* binding */ NativeRangeError),
/* harmony export */   NativeSharedArrayBuffer: () => (/* binding */ NativeSharedArrayBuffer),
/* harmony export */   NativeTypeError: () => (/* binding */ NativeTypeError),
/* harmony export */   NativeTypedArrayPrototypeSymbolIterator: () => (/* binding */ NativeTypedArrayPrototypeSymbolIterator),
/* harmony export */   NativeUint16Array: () => (/* binding */ NativeUint16Array),
/* harmony export */   NativeUint32Array: () => (/* binding */ NativeUint32Array),
/* harmony export */   NativeWeakMap: () => (/* binding */ NativeWeakMap),
/* harmony export */   NativeWeakSet: () => (/* binding */ NativeWeakSet),
/* harmony export */   NumberIsFinite: () => (/* binding */ NumberIsFinite),
/* harmony export */   NumberIsNaN: () => (/* binding */ NumberIsNaN),
/* harmony export */   ObjectCreate: () => (/* binding */ ObjectCreate),
/* harmony export */   ObjectDefineProperty: () => (/* binding */ ObjectDefineProperty),
/* harmony export */   ObjectFreeze: () => (/* binding */ ObjectFreeze),
/* harmony export */   ObjectHasOwn: () => (/* binding */ ObjectHasOwn),
/* harmony export */   ObjectIs: () => (/* binding */ ObjectIs),
/* harmony export */   ObjectPrototype__lookupGetter__: () => (/* binding */ ObjectPrototype__lookupGetter__),
/* harmony export */   ReflectApply: () => (/* binding */ ReflectApply),
/* harmony export */   ReflectConstruct: () => (/* binding */ ReflectConstruct),
/* harmony export */   ReflectDefineProperty: () => (/* binding */ ReflectDefineProperty),
/* harmony export */   ReflectGet: () => (/* binding */ ReflectGet),
/* harmony export */   ReflectGetOwnPropertyDescriptor: () => (/* binding */ ReflectGetOwnPropertyDescriptor),
/* harmony export */   ReflectGetPrototypeOf: () => (/* binding */ ReflectGetPrototypeOf),
/* harmony export */   ReflectHas: () => (/* binding */ ReflectHas),
/* harmony export */   ReflectOwnKeys: () => (/* binding */ ReflectOwnKeys),
/* harmony export */   ReflectSet: () => (/* binding */ ReflectSet),
/* harmony export */   ReflectSetPrototypeOf: () => (/* binding */ ReflectSetPrototypeOf),
/* harmony export */   SharedArrayBufferPrototypeGetByteLength: () => (/* binding */ SharedArrayBufferPrototypeGetByteLength),
/* harmony export */   SymbolFor: () => (/* binding */ SymbolFor),
/* harmony export */   SymbolIterator: () => (/* binding */ SymbolIterator),
/* harmony export */   SymbolSpecies: () => (/* binding */ SymbolSpecies),
/* harmony export */   SymbolToStringTag: () => (/* binding */ SymbolToStringTag),
/* harmony export */   TypedArray: () => (/* binding */ TypedArray),
/* harmony export */   TypedArrayPrototype: () => (/* binding */ TypedArrayPrototype),
/* harmony export */   TypedArrayPrototypeCopyWithin: () => (/* binding */ TypedArrayPrototypeCopyWithin),
/* harmony export */   TypedArrayPrototypeEntries: () => (/* binding */ TypedArrayPrototypeEntries),
/* harmony export */   TypedArrayPrototypeFill: () => (/* binding */ TypedArrayPrototypeFill),
/* harmony export */   TypedArrayPrototypeGetBuffer: () => (/* binding */ TypedArrayPrototypeGetBuffer),
/* harmony export */   TypedArrayPrototypeGetByteOffset: () => (/* binding */ TypedArrayPrototypeGetByteOffset),
/* harmony export */   TypedArrayPrototypeGetLength: () => (/* binding */ TypedArrayPrototypeGetLength),
/* harmony export */   TypedArrayPrototypeGetSymbolToStringTag: () => (/* binding */ TypedArrayPrototypeGetSymbolToStringTag),
/* harmony export */   TypedArrayPrototypeKeys: () => (/* binding */ TypedArrayPrototypeKeys),
/* harmony export */   TypedArrayPrototypeReverse: () => (/* binding */ TypedArrayPrototypeReverse),
/* harmony export */   TypedArrayPrototypeSet: () => (/* binding */ TypedArrayPrototypeSet),
/* harmony export */   TypedArrayPrototypeSlice: () => (/* binding */ TypedArrayPrototypeSlice),
/* harmony export */   TypedArrayPrototypeSort: () => (/* binding */ TypedArrayPrototypeSort),
/* harmony export */   TypedArrayPrototypeSubarray: () => (/* binding */ TypedArrayPrototypeSubarray),
/* harmony export */   TypedArrayPrototypeValues: () => (/* binding */ TypedArrayPrototypeValues),
/* harmony export */   Uint16ArrayFrom: () => (/* binding */ Uint16ArrayFrom),
/* harmony export */   WeakMapPrototypeGet: () => (/* binding */ WeakMapPrototypeGet),
/* harmony export */   WeakMapPrototypeHas: () => (/* binding */ WeakMapPrototypeHas),
/* harmony export */   WeakMapPrototypeSet: () => (/* binding */ WeakMapPrototypeSet),
/* harmony export */   WeakSetPrototypeAdd: () => (/* binding */ WeakSetPrototypeAdd),
/* harmony export */   WeakSetPrototypeHas: () => (/* binding */ WeakSetPrototypeHas)
/* harmony export */ });
/* harmony import */ var _messages_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./messages.mjs */ "./node_modules/@petamoriken/float16/src/_util/messages.mjs");
/* eslint-disable no-restricted-globals, no-restricted-syntax */
/* global SharedArrayBuffer */



/** @type {<T extends (...args: any) => any>(target: T) => (thisArg: ThisType<T>, ...args: any[]) => any} */
function uncurryThis(target) {
  return (thisArg, ...args) => {
    return ReflectApply(target, thisArg, args);
  };
}

/** @type {(target: any, key: string | symbol) => (thisArg: any, ...args: any[]) => any} */
function uncurryThisGetter(target, key) {
  return uncurryThis(
    ReflectGetOwnPropertyDescriptor(
      target,
      key
    ).get
  );
}

// Reflect
const {
  apply: ReflectApply,
  construct: ReflectConstruct,
  defineProperty: ReflectDefineProperty,
  get: ReflectGet,
  getOwnPropertyDescriptor: ReflectGetOwnPropertyDescriptor,
  getPrototypeOf: ReflectGetPrototypeOf,
  has: ReflectHas,
  ownKeys: ReflectOwnKeys,
  set: ReflectSet,
  setPrototypeOf: ReflectSetPrototypeOf,
} = Reflect;

// Proxy
const NativeProxy = Proxy;

// Number
const {
  MAX_SAFE_INTEGER,
  isFinite: NumberIsFinite,
  isNaN: NumberIsNaN,
} = Number;

// Symbol
const {
  iterator: SymbolIterator,
  species: SymbolSpecies,
  toStringTag: SymbolToStringTag,
  for: SymbolFor,
} = Symbol;

// Object
const NativeObject = Object;
const {
  create: ObjectCreate,
  defineProperty: ObjectDefineProperty,
  freeze: ObjectFreeze,
  is: ObjectIs,
} = NativeObject;
const ObjectPrototype = NativeObject.prototype;
/** @type {(object: object, key: PropertyKey) => Function | undefined} */
const ObjectPrototype__lookupGetter__ = /** @type {any} */ (ObjectPrototype).__lookupGetter__
  ? uncurryThis(/** @type {any} */ (ObjectPrototype).__lookupGetter__)
  : (object, key) => {
    if (object == null) {
      throw NativeTypeError(
        _messages_mjs__WEBPACK_IMPORTED_MODULE_0__.CANNOT_CONVERT_UNDEFINED_OR_NULL_TO_OBJECT
      );
    }

    let target = NativeObject(object);
    do {
      const descriptor = ReflectGetOwnPropertyDescriptor(target, key);
      if (descriptor !== undefined) {
        if (ObjectHasOwn(descriptor, "get")) {
          return descriptor.get;
        }

        return;
      }
    } while ((target = ReflectGetPrototypeOf(target)) !== null);
  };
/** @type {(object: object, key: PropertyKey) => boolean} */
const ObjectHasOwn = /** @type {any} */ (NativeObject).hasOwn ||
  uncurryThis(ObjectPrototype.hasOwnProperty);

// Array
const NativeArray = Array;
const ArrayIsArray = NativeArray.isArray;
const ArrayPrototype = NativeArray.prototype;
/** @type {(array: ArrayLike<unknown>, separator?: string) => string} */
const ArrayPrototypeJoin = uncurryThis(ArrayPrototype.join);
/** @type {<T>(array: T[], ...items: T[]) => number} */
const ArrayPrototypePush = uncurryThis(ArrayPrototype.push);
/** @type {(array: ArrayLike<unknown>, ...opts: any[]) => string} */
const ArrayPrototypeToLocaleString = uncurryThis(
  ArrayPrototype.toLocaleString
);
const NativeArrayPrototypeSymbolIterator = ArrayPrototype[SymbolIterator];
/** @type {<T>(array: T[]) => IterableIterator<T>} */
const ArrayPrototypeSymbolIterator = uncurryThis(NativeArrayPrototypeSymbolIterator);

// Math
const MathTrunc = Math.trunc;

// ArrayBuffer
const NativeArrayBuffer = ArrayBuffer;
const ArrayBufferIsView = NativeArrayBuffer.isView;
const ArrayBufferPrototype = NativeArrayBuffer.prototype;
/** @type {(buffer: ArrayBuffer, begin?: number, end?: number) => number} */
const ArrayBufferPrototypeSlice = uncurryThis(ArrayBufferPrototype.slice);
/** @type {(buffer: ArrayBuffer) => ArrayBuffer} */
const ArrayBufferPrototypeGetByteLength = uncurryThisGetter(ArrayBufferPrototype, "byteLength");

// SharedArrayBuffer
const NativeSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : null;
/** @type {(buffer: SharedArrayBuffer) => SharedArrayBuffer} */
const SharedArrayBufferPrototypeGetByteLength = NativeSharedArrayBuffer
  && uncurryThisGetter(NativeSharedArrayBuffer.prototype, "byteLength");

// TypedArray
/** @typedef {Uint8Array|Uint8ClampedArray|Uint16Array|Uint32Array|Int8Array|Int16Array|Int32Array|Float32Array|Float64Array|BigUint64Array|BigInt64Array} TypedArray */
/** @type {any} */
const TypedArray = ReflectGetPrototypeOf(Uint8Array);
const TypedArrayFrom = TypedArray.from;
const TypedArrayPrototype = TypedArray.prototype;
const NativeTypedArrayPrototypeSymbolIterator = TypedArrayPrototype[SymbolIterator];
/** @type {(typedArray: TypedArray) => IterableIterator<number>} */
const TypedArrayPrototypeKeys = uncurryThis(TypedArrayPrototype.keys);
/** @type {(typedArray: TypedArray) => IterableIterator<number>} */
const TypedArrayPrototypeValues = uncurryThis(
  TypedArrayPrototype.values
);
/** @type {(typedArray: TypedArray) => IterableIterator<[number, number]>} */
const TypedArrayPrototypeEntries = uncurryThis(
  TypedArrayPrototype.entries
);
/** @type {(typedArray: TypedArray, array: ArrayLike<number>, offset?: number) => void} */
const TypedArrayPrototypeSet = uncurryThis(TypedArrayPrototype.set);
/** @type {<T extends TypedArray>(typedArray: T) => T} */
const TypedArrayPrototypeReverse = uncurryThis(
  TypedArrayPrototype.reverse
);
/** @type {<T extends TypedArray>(typedArray: T, value: number, start?: number, end?: number) => T} */
const TypedArrayPrototypeFill = uncurryThis(TypedArrayPrototype.fill);
/** @type {<T extends TypedArray>(typedArray: T, target: number, start: number, end?: number) => T} */
const TypedArrayPrototypeCopyWithin = uncurryThis(
  TypedArrayPrototype.copyWithin
);
/** @type {<T extends TypedArray>(typedArray: T, compareFn?: (a: number, b: number) => number) => T} */
const TypedArrayPrototypeSort = uncurryThis(TypedArrayPrototype.sort);
/** @type {<T extends TypedArray>(typedArray: T, start?: number, end?: number) => T} */
const TypedArrayPrototypeSlice = uncurryThis(TypedArrayPrototype.slice);
/** @type {<T extends TypedArray>(typedArray: T, start?: number, end?: number) => T} */
const TypedArrayPrototypeSubarray = uncurryThis(
  TypedArrayPrototype.subarray
);
/** @type {((typedArray: TypedArray) => ArrayBuffer)} */
const TypedArrayPrototypeGetBuffer = uncurryThisGetter(
  TypedArrayPrototype,
  "buffer"
);
/** @type {((typedArray: TypedArray) => number)} */
const TypedArrayPrototypeGetByteOffset = uncurryThisGetter(
  TypedArrayPrototype,
  "byteOffset"
);
/** @type {((typedArray: TypedArray) => number)} */
const TypedArrayPrototypeGetLength = uncurryThisGetter(
  TypedArrayPrototype,
  "length"
);
/** @type {(target: unknown) => string} */
const TypedArrayPrototypeGetSymbolToStringTag = uncurryThisGetter(
  TypedArrayPrototype,
  SymbolToStringTag
);

// Uint16Array
const NativeUint16Array = Uint16Array;
/** @type {Uint16ArrayConstructor["from"]} */
const Uint16ArrayFrom = (...args) => {
  return ReflectApply(TypedArrayFrom, NativeUint16Array, args);
};

// Uint32Array
const NativeUint32Array = Uint32Array;

// Float32Array
const NativeFloat32Array = Float32Array;

// ArrayIterator
/** @type {any} */
const ArrayIteratorPrototype = ReflectGetPrototypeOf([][SymbolIterator]());
/** @type {<T>(arrayIterator: IterableIterator<T>) => IteratorResult<T>} */
const ArrayIteratorPrototypeNext = uncurryThis(ArrayIteratorPrototype.next);

// Generator
/** @type {<T = unknown, TReturn = any, TNext = unknown>(generator: Generator<T, TReturn, TNext>, value?: TNext) => T} */
const GeneratorPrototypeNext = uncurryThis((function* () {})().next);

// Iterator
const IteratorPrototype = ReflectGetPrototypeOf(ArrayIteratorPrototype);

// DataView
const DataViewPrototype = DataView.prototype;
/** @type {(dataView: DataView, byteOffset: number, littleEndian?: boolean) => number} */
const DataViewPrototypeGetUint16 = uncurryThis(
  DataViewPrototype.getUint16
);
/** @type {(dataView: DataView, byteOffset: number, value: number, littleEndian?: boolean) => void} */
const DataViewPrototypeSetUint16 = uncurryThis(
  DataViewPrototype.setUint16
);

// Error
const NativeTypeError = TypeError;
const NativeRangeError = RangeError;

// WeakSet
/**
 * Do not construct with arguments to avoid calling the "add" method
 *
 * @type {{new <T extends {}>(): WeakSet<T>}}
 */
const NativeWeakSet = WeakSet;
const WeakSetPrototype = NativeWeakSet.prototype;
/** @type {<T extends {}>(set: WeakSet<T>, value: T) => Set<T>} */
const WeakSetPrototypeAdd = uncurryThis(WeakSetPrototype.add);
/** @type {<T extends {}>(set: WeakSet<T>, value: T) => boolean} */
const WeakSetPrototypeHas = uncurryThis(WeakSetPrototype.has);

// WeakMap
/**
 * Do not construct with arguments to avoid calling the "set" method
 *
 * @type {{new <K extends {}, V>(): WeakMap<K, V>}}
 */
const NativeWeakMap = WeakMap;
const WeakMapPrototype = NativeWeakMap.prototype;
/** @type {<K extends {}, V>(weakMap: WeakMap<K, V>, key: K) => V} */
const WeakMapPrototypeGet = uncurryThis(WeakMapPrototype.get);
/** @type {<K extends {}, V>(weakMap: WeakMap<K, V>, key: K) => boolean} */
const WeakMapPrototypeHas = uncurryThis(WeakMapPrototype.has);
/** @type {<K extends {}, V>(weakMap: WeakMap<K, V>, key: K, value: V) => WeakMap} */
const WeakMapPrototypeSet = uncurryThis(WeakMapPrototype.set);


/***/ }),

/***/ "./node_modules/geotiff/dist-module/compression/basedecoder.js":
/*!*********************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/compression/basedecoder.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BaseDecoder)
/* harmony export */ });
/* harmony import */ var _predictor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../predictor.js */ "./node_modules/geotiff/dist-module/predictor.js");


class BaseDecoder {
  async decode(fileDirectory, buffer) {
    const decoded = await this.decodeBlock(buffer);
    const predictor = fileDirectory.Predictor || 1;
    if (predictor !== 1) {
      const isTiled = !fileDirectory.StripOffsets;
      const tileWidth = isTiled ? fileDirectory.TileWidth : fileDirectory.ImageWidth;
      const tileHeight = isTiled ? fileDirectory.TileLength : (
        fileDirectory.RowsPerStrip || fileDirectory.ImageLength
      );
      return (0,_predictor_js__WEBPACK_IMPORTED_MODULE_0__.applyPredictor)(
        decoded, predictor, tileWidth, tileHeight, fileDirectory.BitsPerSample,
        fileDirectory.PlanarConfiguration,
      );
    }
    return decoded;
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/compression/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/compression/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addDecoder: () => (/* binding */ addDecoder),
/* harmony export */   getDecoder: () => (/* binding */ getDecoder)
/* harmony export */ });
const registry = new Map();

function addDecoder(cases, importFn) {
  if (!Array.isArray(cases)) {
    cases = [cases]; // eslint-disable-line no-param-reassign
  }
  cases.forEach((c) => registry.set(c, importFn));
}

async function getDecoder(fileDirectory) {
  const importFn = registry.get(fileDirectory.Compression);
  if (!importFn) {
    throw new Error(`Unknown compression method identifier: ${fileDirectory.Compression}`);
  }
  const Decoder = await importFn();
  return new Decoder(fileDirectory);
}

// Add default decoders to registry (end-user may override with other implementations)
addDecoder([undefined, 1], () => __webpack_require__.e(/*! import() */ "node_modules_geotiff_dist-module_compression_raw_js").then(__webpack_require__.bind(__webpack_require__, /*! ./raw.js */ "./node_modules/geotiff/dist-module/compression/raw.js")).then((m) => m.default));
addDecoder(5, () => __webpack_require__.e(/*! import() */ "node_modules_geotiff_dist-module_compression_lzw_js").then(__webpack_require__.bind(__webpack_require__, /*! ./lzw.js */ "./node_modules/geotiff/dist-module/compression/lzw.js")).then((m) => m.default));
addDecoder(6, () => {
  throw new Error('old style JPEG compression is not supported.');
});
addDecoder(7, () => __webpack_require__.e(/*! import() */ "vendors-node_modules_geotiff_dist-module_compression_jpeg_js").then(__webpack_require__.bind(__webpack_require__, /*! ./jpeg.js */ "./node_modules/geotiff/dist-module/compression/jpeg.js")).then((m) => m.default));
addDecoder([8, 32946], () => Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_pako_dist_pako_esm_mjs"), __webpack_require__.e("node_modules_geotiff_dist-module_compression_deflate_js")]).then(__webpack_require__.bind(__webpack_require__, /*! ./deflate.js */ "./node_modules/geotiff/dist-module/compression/deflate.js")).then((m) => m.default));
addDecoder(32773, () => __webpack_require__.e(/*! import() */ "node_modules_geotiff_dist-module_compression_packbits_js").then(__webpack_require__.bind(__webpack_require__, /*! ./packbits.js */ "./node_modules/geotiff/dist-module/compression/packbits.js")).then((m) => m.default));
addDecoder(34887, () => Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_pako_dist_pako_esm_mjs"), __webpack_require__.e("vendors-node_modules_geotiff_dist-module_compression_lerc_js")]).then(__webpack_require__.bind(__webpack_require__, /*! ./lerc.js */ "./node_modules/geotiff/dist-module/compression/lerc.js")).then((m) => m.default));
addDecoder(50001, () => __webpack_require__.e(/*! import() */ "node_modules_geotiff_dist-module_compression_webimage_js").then(__webpack_require__.bind(__webpack_require__, /*! ./webimage.js */ "./node_modules/geotiff/dist-module/compression/webimage.js")).then((m) => m.default));


/***/ }),

/***/ "./node_modules/geotiff/dist-module/dataslice.js":
/*!*******************************************************!*\
  !*** ./node_modules/geotiff/dist-module/dataslice.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DataSlice)
/* harmony export */ });
class DataSlice {
  constructor(arrayBuffer, sliceOffset, littleEndian, bigTiff) {
    this._dataView = new DataView(arrayBuffer);
    this._sliceOffset = sliceOffset;
    this._littleEndian = littleEndian;
    this._bigTiff = bigTiff;
  }

  get sliceOffset() {
    return this._sliceOffset;
  }

  get sliceTop() {
    return this._sliceOffset + this.buffer.byteLength;
  }

  get littleEndian() {
    return this._littleEndian;
  }

  get bigTiff() {
    return this._bigTiff;
  }

  get buffer() {
    return this._dataView.buffer;
  }

  covers(offset, length) {
    return this.sliceOffset <= offset && this.sliceTop >= offset + length;
  }

  readUint8(offset) {
    return this._dataView.getUint8(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readInt8(offset) {
    return this._dataView.getInt8(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readUint16(offset) {
    return this._dataView.getUint16(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readInt16(offset) {
    return this._dataView.getInt16(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readUint32(offset) {
    return this._dataView.getUint32(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readInt32(offset) {
    return this._dataView.getInt32(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readFloat32(offset) {
    return this._dataView.getFloat32(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readFloat64(offset) {
    return this._dataView.getFloat64(
      offset - this._sliceOffset, this._littleEndian,
    );
  }

  readUint64(offset) {
    const left = this.readUint32(offset);
    const right = this.readUint32(offset + 4);
    let combined;
    if (this._littleEndian) {
      combined = left + ((2 ** 32) * right);
      if (!Number.isSafeInteger(combined)) {
        throw new Error(
          `${combined} exceeds MAX_SAFE_INTEGER. `
          + 'Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues',
        );
      }
      return combined;
    }
    combined = ((2 ** 32) * left) + right;
    if (!Number.isSafeInteger(combined)) {
      throw new Error(
        `${combined} exceeds MAX_SAFE_INTEGER. `
        + 'Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues',
      );
    }

    return combined;
  }

  // adapted from https://stackoverflow.com/a/55338384/8060591
  readInt64(offset) {
    let value = 0;
    const isNegative = (this._dataView.getUint8(offset + (this._littleEndian ? 7 : 0)) & 0x80)
      > 0;
    let carrying = true;
    for (let i = 0; i < 8; i++) {
      let byte = this._dataView.getUint8(
        offset + (this._littleEndian ? i : 7 - i),
      );
      if (isNegative) {
        if (carrying) {
          if (byte !== 0x00) {
            byte = ~(byte - 1) & 0xff;
            carrying = false;
          }
        } else {
          byte = ~byte & 0xff;
        }
      }
      value += byte * (256 ** i);
    }
    if (isNegative) {
      value = -value;
    }
    return value;
  }

  readOffset(offset) {
    if (this._bigTiff) {
      return this.readUint64(offset);
    }
    return this.readUint32(offset);
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/dataview64.js":
/*!********************************************************!*\
  !*** ./node_modules/geotiff/dist-module/dataview64.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DataView64)
/* harmony export */ });
/* harmony import */ var _petamoriken_float16__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @petamoriken/float16 */ "./node_modules/@petamoriken/float16/src/DataView.mjs");


class DataView64 {
  constructor(arrayBuffer) {
    this._dataView = new DataView(arrayBuffer);
  }

  get buffer() {
    return this._dataView.buffer;
  }

  getUint64(offset, littleEndian) {
    const left = this.getUint32(offset, littleEndian);
    const right = this.getUint32(offset + 4, littleEndian);
    let combined;
    if (littleEndian) {
      combined = left + ((2 ** 32) * right);
      if (!Number.isSafeInteger(combined)) {
        throw new Error(
          `${combined} exceeds MAX_SAFE_INTEGER. `
          + 'Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues',
        );
      }
      return combined;
    }
    combined = ((2 ** 32) * left) + right;
    if (!Number.isSafeInteger(combined)) {
      throw new Error(
        `${combined} exceeds MAX_SAFE_INTEGER. `
        + 'Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues',
      );
    }

    return combined;
  }

  // adapted from https://stackoverflow.com/a/55338384/8060591
  getInt64(offset, littleEndian) {
    let value = 0;
    const isNegative = (this._dataView.getUint8(offset + (littleEndian ? 7 : 0)) & 0x80) > 0;
    let carrying = true;
    for (let i = 0; i < 8; i++) {
      let byte = this._dataView.getUint8(offset + (littleEndian ? i : 7 - i));
      if (isNegative) {
        if (carrying) {
          if (byte !== 0x00) {
            byte = ~(byte - 1) & 0xff;
            carrying = false;
          }
        } else {
          byte = ~byte & 0xff;
        }
      }
      value += byte * (256 ** i);
    }
    if (isNegative) {
      value = -value;
    }
    return value;
  }

  getUint8(offset, littleEndian) {
    return this._dataView.getUint8(offset, littleEndian);
  }

  getInt8(offset, littleEndian) {
    return this._dataView.getInt8(offset, littleEndian);
  }

  getUint16(offset, littleEndian) {
    return this._dataView.getUint16(offset, littleEndian);
  }

  getInt16(offset, littleEndian) {
    return this._dataView.getInt16(offset, littleEndian);
  }

  getUint32(offset, littleEndian) {
    return this._dataView.getUint32(offset, littleEndian);
  }

  getInt32(offset, littleEndian) {
    return this._dataView.getInt32(offset, littleEndian);
  }

  getFloat16(offset, littleEndian) {
    return (0,_petamoriken_float16__WEBPACK_IMPORTED_MODULE_0__.getFloat16)(this._dataView, offset, littleEndian);
  }

  getFloat32(offset, littleEndian) {
    return this._dataView.getFloat32(offset, littleEndian);
  }

  getFloat64(offset, littleEndian) {
    return this._dataView.getFloat64(offset, littleEndian);
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/geotiff.js":
/*!*****************************************************!*\
  !*** ./node_modules/geotiff/dist-module/geotiff.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseDecoder: () => (/* reexport safe */ _compression_basedecoder_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   GeoTIFF: () => (/* binding */ GeoTIFF),
/* harmony export */   GeoTIFFImage: () => (/* reexport safe */ _geotiffimage_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   MultiGeoTIFF: () => (/* binding */ MultiGeoTIFF),
/* harmony export */   Pool: () => (/* reexport safe */ _pool_js__WEBPACK_IMPORTED_MODULE_13__["default"]),
/* harmony export */   addDecoder: () => (/* reexport safe */ _compression_index_js__WEBPACK_IMPORTED_MODULE_3__.addDecoder),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   fromArrayBuffer: () => (/* binding */ fromArrayBuffer),
/* harmony export */   fromBlob: () => (/* binding */ fromBlob),
/* harmony export */   fromFile: () => (/* binding */ fromFile),
/* harmony export */   fromUrl: () => (/* binding */ fromUrl),
/* harmony export */   fromUrls: () => (/* binding */ fromUrls),
/* harmony export */   getDecoder: () => (/* reexport safe */ _compression_index_js__WEBPACK_IMPORTED_MODULE_3__.getDecoder),
/* harmony export */   globals: () => (/* reexport module object */ _globals_js__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   rgb: () => (/* reexport module object */ _rgb_js__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   setLogger: () => (/* reexport safe */ _logging_js__WEBPACK_IMPORTED_MODULE_4__.setLogger),
/* harmony export */   writeArrayBuffer: () => (/* binding */ writeArrayBuffer)
/* harmony export */ });
/* harmony import */ var _geotiffimage_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./geotiffimage.js */ "./node_modules/geotiff/dist-module/geotiffimage.js");
/* harmony import */ var _dataview64_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./dataview64.js */ "./node_modules/geotiff/dist-module/dataview64.js");
/* harmony import */ var _dataslice_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./dataslice.js */ "./node_modules/geotiff/dist-module/dataslice.js");
/* harmony import */ var _pool_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./pool.js */ "./node_modules/geotiff/dist-module/pool.js");
/* harmony import */ var _source_remote_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./source/remote.js */ "./node_modules/geotiff/dist-module/source/remote.js");
/* harmony import */ var _source_arraybuffer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./source/arraybuffer.js */ "./node_modules/geotiff/dist-module/source/arraybuffer.js");
/* harmony import */ var _source_filereader_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./source/filereader.js */ "./node_modules/geotiff/dist-module/source/filereader.js");
/* harmony import */ var _source_file_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./source/file.js */ "./node_modules/geotiff/dist-module/source/file.js");
/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals.js */ "./node_modules/geotiff/dist-module/globals.js");
/* harmony import */ var _geotiffwriter_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./geotiffwriter.js */ "./node_modules/geotiff/dist-module/geotiffwriter.js");
/* harmony import */ var _rgb_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rgb.js */ "./node_modules/geotiff/dist-module/rgb.js");
/* harmony import */ var _compression_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./compression/index.js */ "./node_modules/geotiff/dist-module/compression/index.js");
/* harmony import */ var _logging_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./logging.js */ "./node_modules/geotiff/dist-module/logging.js");
/* harmony import */ var _compression_basedecoder_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./compression/basedecoder.js */ "./node_modules/geotiff/dist-module/compression/basedecoder.js");
/** @module geotiff */























/**
 * @typedef {Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array}
 * TypedArray
 */

/**
 * @typedef {{ height:number, width: number }} Dimensions
 */

/**
 * The autogenerated docs are a little confusing here. The effective type is:
 *
 * `TypedArray & { height: number; width: number}`
 * @typedef {TypedArray & Dimensions} TypedArrayWithDimensions
 */

/**
 * The autogenerated docs are a little confusing here. The effective type is:
 *
 * `TypedArray[] & { height: number; width: number}`
 * @typedef {TypedArray[] & Dimensions} TypedArrayArrayWithDimensions
 */

/**
 *  The autogenerated docs are a little confusing here. The effective type is:
 *
 * `(TypedArray | TypedArray[]) & { height: number; width: number}`
 * @typedef {TypedArrayWithDimensions | TypedArrayArrayWithDimensions} ReadRasterResult
 */

function getFieldTypeLength(fieldType) {
  switch (fieldType) {
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.BYTE: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.ASCII: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SBYTE: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.UNDEFINED:
      return 1;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SHORT: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SSHORT:
      return 2;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.LONG: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SLONG: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.FLOAT: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.IFD:
      return 4;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.RATIONAL: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SRATIONAL: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.DOUBLE:
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.LONG8: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SLONG8: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.IFD8:
      return 8;
    default:
      throw new RangeError(`Invalid field type: ${fieldType}`);
  }
}

function parseGeoKeyDirectory(fileDirectory) {
  const rawGeoKeyDirectory = fileDirectory.GeoKeyDirectory;
  if (!rawGeoKeyDirectory) {
    return null;
  }

  const geoKeyDirectory = {};
  for (let i = 4; i <= rawGeoKeyDirectory[3] * 4; i += 4) {
    const key = _globals_js__WEBPACK_IMPORTED_MODULE_0__.geoKeyNames[rawGeoKeyDirectory[i]];
    const location = (rawGeoKeyDirectory[i + 1])
      ? (_globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTagNames[rawGeoKeyDirectory[i + 1]]) : null;
    const count = rawGeoKeyDirectory[i + 2];
    const offset = rawGeoKeyDirectory[i + 3];

    let value = null;
    if (!location) {
      value = offset;
    } else {
      value = fileDirectory[location];
      if (typeof value === 'undefined' || value === null) {
        throw new Error(`Could not get value of geoKey '${key}'.`);
      } else if (typeof value === 'string') {
        value = value.substring(offset, offset + count - 1);
      } else if (value.subarray) {
        value = value.subarray(offset, offset + count);
        if (count === 1) {
          value = value[0];
        }
      }
    }
    geoKeyDirectory[key] = value;
  }
  return geoKeyDirectory;
}

function getValues(dataSlice, fieldType, count, offset) {
  let values = null;
  let readMethod = null;
  const fieldTypeLength = getFieldTypeLength(fieldType);

  switch (fieldType) {
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.BYTE: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.ASCII: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.UNDEFINED:
      values = new Uint8Array(count); readMethod = dataSlice.readUint8;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SBYTE:
      values = new Int8Array(count); readMethod = dataSlice.readInt8;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SHORT:
      values = new Uint16Array(count); readMethod = dataSlice.readUint16;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SSHORT:
      values = new Int16Array(count); readMethod = dataSlice.readInt16;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.LONG: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.IFD:
      values = new Uint32Array(count); readMethod = dataSlice.readUint32;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SLONG:
      values = new Int32Array(count); readMethod = dataSlice.readInt32;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.LONG8: case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.IFD8:
      values = new Array(count); readMethod = dataSlice.readUint64;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SLONG8:
      values = new Array(count); readMethod = dataSlice.readInt64;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.RATIONAL:
      values = new Uint32Array(count * 2); readMethod = dataSlice.readUint32;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SRATIONAL:
      values = new Int32Array(count * 2); readMethod = dataSlice.readInt32;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.FLOAT:
      values = new Float32Array(count); readMethod = dataSlice.readFloat32;
      break;
    case _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.DOUBLE:
      values = new Float64Array(count); readMethod = dataSlice.readFloat64;
      break;
    default:
      throw new RangeError(`Invalid field type: ${fieldType}`);
  }

  // normal fields
  if (!(fieldType === _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.RATIONAL || fieldType === _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SRATIONAL)) {
    for (let i = 0; i < count; ++i) {
      values[i] = readMethod.call(
        dataSlice, offset + (i * fieldTypeLength),
      );
    }
  } else { // RATIONAL or SRATIONAL
    for (let i = 0; i < count; i += 2) {
      values[i] = readMethod.call(
        dataSlice, offset + (i * fieldTypeLength),
      );
      values[i + 1] = readMethod.call(
        dataSlice, offset + ((i * fieldTypeLength) + 4),
      );
    }
  }

  if (fieldType === _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.ASCII) {
    return new TextDecoder('utf-8').decode(values);
  }
  return values;
}

/**
 * Data class to store the parsed file directory, geo key directory and
 * offset to the next IFD
 */
class ImageFileDirectory {
  constructor(fileDirectory, geoKeyDirectory, nextIFDByteOffset) {
    this.fileDirectory = fileDirectory;
    this.geoKeyDirectory = geoKeyDirectory;
    this.nextIFDByteOffset = nextIFDByteOffset;
  }
}

/**
 * Error class for cases when an IFD index was requested, that does not exist
 * in the file.
 */
class GeoTIFFImageIndexError extends Error {
  constructor(index) {
    super(`No image at index ${index}`);
    this.index = index;
  }
}

class GeoTIFFBase {
  /**
   * (experimental) Reads raster data from the best fitting image. This function uses
   * the image with the lowest resolution that is still a higher resolution than the
   * requested resolution.
   * When specified, the `bbox` option is translated to the `window` option and the
   * `resX` and `resY` to `width` and `height` respectively.
   * Then, the [readRasters]{@link GeoTIFFImage#readRasters} method of the selected
   * image is called and the result returned.
   * @see GeoTIFFImage.readRasters
   * @param {import('./geotiffimage').ReadRasterOptions} [options={}] optional parameters
   * @returns {Promise<ReadRasterResult>} the decoded array(s), with `height` and `width`, as a promise
   */
  async readRasters(options = {}) {
    const { window: imageWindow, width, height } = options;
    let { resX, resY, bbox } = options;

    const firstImage = await this.getImage();
    let usedImage = firstImage;
    const imageCount = await this.getImageCount();
    const imgBBox = firstImage.getBoundingBox();

    if (imageWindow && bbox) {
      throw new Error('Both "bbox" and "window" passed.');
    }

    // if width/height is passed, transform it to resolution
    if (width || height) {
      // if we have an image window (pixel coordinates), transform it to a BBox
      // using the origin/resolution of the first image.
      if (imageWindow) {
        const [oX, oY] = firstImage.getOrigin();
        const [rX, rY] = firstImage.getResolution();

        bbox = [
          oX + (imageWindow[0] * rX),
          oY + (imageWindow[1] * rY),
          oX + (imageWindow[2] * rX),
          oY + (imageWindow[3] * rY),
        ];
      }

      // if we have a bbox (or calculated one)

      const usedBBox = bbox || imgBBox;

      if (width) {
        if (resX) {
          throw new Error('Both width and resX passed');
        }
        resX = (usedBBox[2] - usedBBox[0]) / width;
      }
      if (height) {
        if (resY) {
          throw new Error('Both width and resY passed');
        }
        resY = (usedBBox[3] - usedBBox[1]) / height;
      }
    }

    // if resolution is set or calculated, try to get the image with the worst acceptable resolution
    if (resX || resY) {
      const allImages = [];
      for (let i = 0; i < imageCount; ++i) {
        const image = await this.getImage(i);
        const { SubfileType: subfileType, NewSubfileType: newSubfileType } = image.fileDirectory;
        if (i === 0 || subfileType === 2 || newSubfileType & 1) {
          allImages.push(image);
        }
      }

      allImages.sort((a, b) => a.getWidth() - b.getWidth());
      for (let i = 0; i < allImages.length; ++i) {
        const image = allImages[i];
        const imgResX = (imgBBox[2] - imgBBox[0]) / image.getWidth();
        const imgResY = (imgBBox[3] - imgBBox[1]) / image.getHeight();

        usedImage = image;
        if ((resX && resX > imgResX) || (resY && resY > imgResY)) {
          break;
        }
      }
    }

    let wnd = imageWindow;
    if (bbox) {
      const [oX, oY] = firstImage.getOrigin();
      const [imageResX, imageResY] = usedImage.getResolution(firstImage);

      wnd = [
        Math.round((bbox[0] - oX) / imageResX),
        Math.round((bbox[1] - oY) / imageResY),
        Math.round((bbox[2] - oX) / imageResX),
        Math.round((bbox[3] - oY) / imageResY),
      ];
      wnd = [
        Math.min(wnd[0], wnd[2]),
        Math.min(wnd[1], wnd[3]),
        Math.max(wnd[0], wnd[2]),
        Math.max(wnd[1], wnd[3]),
      ];
    }

    return usedImage.readRasters({ ...options, window: wnd });
  }
}

/**
 * @typedef {Object} GeoTIFFOptions
 * @property {boolean} [cache=false] whether or not decoded tiles shall be cached.
 */

/**
 * The abstraction for a whole GeoTIFF file.
 * @augments GeoTIFFBase
 */
class GeoTIFF extends GeoTIFFBase {
  /**
   * @constructor
   * @param {*} source The datasource to read from.
   * @param {boolean} littleEndian Whether the image uses little endian.
   * @param {boolean} bigTiff Whether the image uses bigTIFF conventions.
   * @param {number} firstIFDOffset The numeric byte-offset from the start of the image
   *                                to the first IFD.
   * @param {GeoTIFFOptions} [options] further options.
   */
  constructor(source, littleEndian, bigTiff, firstIFDOffset, options = {}) {
    super();
    this.source = source;
    this.littleEndian = littleEndian;
    this.bigTiff = bigTiff;
    this.firstIFDOffset = firstIFDOffset;
    this.cache = options.cache || false;
    this.ifdRequests = [];
    this.ghostValues = null;
  }

  async getSlice(offset, size) {
    const fallbackSize = this.bigTiff ? 4048 : 1024;
    return new _dataslice_js__WEBPACK_IMPORTED_MODULE_5__["default"](
      (await this.source.fetch([{
        offset,
        length: typeof size !== 'undefined' ? size : fallbackSize,
      }]))[0],
      offset,
      this.littleEndian,
      this.bigTiff,
    );
  }

  /**
   * Instructs to parse an image file directory at the given file offset.
   * As there is no way to ensure that a location is indeed the start of an IFD,
   * this function must be called with caution (e.g only using the IFD offsets from
   * the headers or other IFDs).
   * @param {number} offset the offset to parse the IFD at
   * @returns {Promise<ImageFileDirectory>} the parsed IFD
   */
  async parseFileDirectoryAt(offset) {
    const entrySize = this.bigTiff ? 20 : 12;
    const offsetSize = this.bigTiff ? 8 : 2;

    let dataSlice = await this.getSlice(offset);
    const numDirEntries = this.bigTiff
      ? dataSlice.readUint64(offset)
      : dataSlice.readUint16(offset);

    // if the slice does not cover the whole IFD, request a bigger slice, where the
    // whole IFD fits: num of entries + n x tag length + offset to next IFD
    const byteSize = (numDirEntries * entrySize) + (this.bigTiff ? 16 : 6);
    if (!dataSlice.covers(offset, byteSize)) {
      dataSlice = await this.getSlice(offset, byteSize);
    }

    const fileDirectory = {};

    // loop over the IFD and create a file directory object
    let i = offset + (this.bigTiff ? 8 : 2);
    for (let entryCount = 0; entryCount < numDirEntries; i += entrySize, ++entryCount) {
      const fieldTag = dataSlice.readUint16(i);
      const fieldType = dataSlice.readUint16(i + 2);
      const typeCount = this.bigTiff
        ? dataSlice.readUint64(i + 4)
        : dataSlice.readUint32(i + 4);

      let fieldValues;
      let value;
      const fieldTypeLength = getFieldTypeLength(fieldType);
      const valueOffset = i + (this.bigTiff ? 12 : 8);

      // check whether the value is directly encoded in the tag or refers to a
      // different external byte range
      if (fieldTypeLength * typeCount <= (this.bigTiff ? 8 : 4)) {
        fieldValues = getValues(dataSlice, fieldType, typeCount, valueOffset);
      } else {
        // resolve the reference to the actual byte range
        const actualOffset = dataSlice.readOffset(valueOffset);
        const length = getFieldTypeLength(fieldType) * typeCount;

        // check, whether we actually cover the referenced byte range; if not,
        // request a new slice of bytes to read from it
        if (dataSlice.covers(actualOffset, length)) {
          fieldValues = getValues(dataSlice, fieldType, typeCount, actualOffset);
        } else {
          const fieldDataSlice = await this.getSlice(actualOffset, length);
          fieldValues = getValues(fieldDataSlice, fieldType, typeCount, actualOffset);
        }
      }

      // unpack single values from the array
      if (typeCount === 1 && _globals_js__WEBPACK_IMPORTED_MODULE_0__.arrayFields.indexOf(fieldTag) === -1
        && !(fieldType === _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.RATIONAL || fieldType === _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.SRATIONAL)) {
        value = fieldValues[0];
      } else {
        value = fieldValues;
      }

      // write the tags value to the file directly
      fileDirectory[_globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTagNames[fieldTag]] = value;
    }
    const geoKeyDirectory = parseGeoKeyDirectory(fileDirectory);
    const nextIFDByteOffset = dataSlice.readOffset(
      offset + offsetSize + (entrySize * numDirEntries),
    );

    return new ImageFileDirectory(
      fileDirectory,
      geoKeyDirectory,
      nextIFDByteOffset,
    );
  }

  async requestIFD(index) {
    // see if we already have that IFD index requested.
    if (this.ifdRequests[index]) {
      // attach to an already requested IFD
      return this.ifdRequests[index];
    } else if (index === 0) {
      // special case for index 0
      this.ifdRequests[index] = this.parseFileDirectoryAt(this.firstIFDOffset);
      return this.ifdRequests[index];
    } else if (!this.ifdRequests[index - 1]) {
      // if the previous IFD was not yet loaded, load that one first
      // this is the recursive call.
      try {
        this.ifdRequests[index - 1] = this.requestIFD(index - 1);
      } catch (e) {
        // if the previous one already was an index error, rethrow
        // with the current index
        if (e instanceof GeoTIFFImageIndexError) {
          throw new GeoTIFFImageIndexError(index);
        }
        // rethrow anything else
        throw e;
      }
    }
    // if the previous IFD was loaded, we can finally fetch the one we are interested in.
    // we need to wrap this in an IIFE, otherwise this.ifdRequests[index] would be delayed
    this.ifdRequests[index] = (async () => {
      const previousIfd = await this.ifdRequests[index - 1];
      if (previousIfd.nextIFDByteOffset === 0) {
        throw new GeoTIFFImageIndexError(index);
      }
      return this.parseFileDirectoryAt(previousIfd.nextIFDByteOffset);
    })();
    return this.ifdRequests[index];
  }

  /**
   * Get the n-th internal subfile of an image. By default, the first is returned.
   *
   * @param {number} [index=0] the index of the image to return.
   * @returns {Promise<GeoTIFFImage>} the image at the given index
   */
  async getImage(index = 0) {
    const ifd = await this.requestIFD(index);
    return new _geotiffimage_js__WEBPACK_IMPORTED_MODULE_6__["default"](
      ifd.fileDirectory, ifd.geoKeyDirectory,
      this.dataView, this.littleEndian, this.cache, this.source,
    );
  }

  /**
   * Returns the count of the internal subfiles.
   *
   * @returns {Promise<number>} the number of internal subfile images
   */
  async getImageCount() {
    let index = 0;
    // loop until we run out of IFDs
    let hasNext = true;
    while (hasNext) {
      try {
        await this.requestIFD(index);
        ++index;
      } catch (e) {
        if (e instanceof GeoTIFFImageIndexError) {
          hasNext = false;
        } else {
          throw e;
        }
      }
    }
    return index;
  }

  /**
   * Get the values of the COG ghost area as a parsed map.
   * See https://gdal.org/drivers/raster/cog.html#header-ghost-area for reference
   * @returns {Promise<Object>} the parsed ghost area or null, if no such area was found
   */
  async getGhostValues() {
    const offset = this.bigTiff ? 16 : 8;
    if (this.ghostValues) {
      return this.ghostValues;
    }
    const detectionString = 'GDAL_STRUCTURAL_METADATA_SIZE=';
    const heuristicAreaSize = detectionString.length + 100;
    let slice = await this.getSlice(offset, heuristicAreaSize);
    if (detectionString === getValues(slice, _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.ASCII, detectionString.length, offset)) {
      const valuesString = getValues(slice, _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.ASCII, heuristicAreaSize, offset);
      const firstLine = valuesString.split('\n')[0];
      const metadataSize = Number(firstLine.split('=')[1].split(' ')[0]) + firstLine.length;
      if (metadataSize > heuristicAreaSize) {
        slice = await this.getSlice(offset, metadataSize);
      }
      const fullString = getValues(slice, _globals_js__WEBPACK_IMPORTED_MODULE_0__.fieldTypes.ASCII, metadataSize, offset);
      this.ghostValues = {};
      fullString
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => line.split('='))
        .forEach(([key, value]) => {
          this.ghostValues[key] = value;
        });
    }
    return this.ghostValues;
  }

  /**
   * Parse a (Geo)TIFF file from the given source.
   *
   * @param {*} source The source of data to parse from.
   * @param {GeoTIFFOptions} [options] Additional options.
   * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
   *                               to be aborted
   */
  static async fromSource(source, options, signal) {
    const headerData = (await source.fetch([{ offset: 0, length: 1024 }], signal))[0];
    const dataView = new _dataview64_js__WEBPACK_IMPORTED_MODULE_7__["default"](headerData);

    const BOM = dataView.getUint16(0, 0);
    let littleEndian;
    if (BOM === 0x4949) {
      littleEndian = true;
    } else if (BOM === 0x4D4D) {
      littleEndian = false;
    } else {
      throw new TypeError('Invalid byte order value.');
    }

    const magicNumber = dataView.getUint16(2, littleEndian);
    let bigTiff;
    if (magicNumber === 42) {
      bigTiff = false;
    } else if (magicNumber === 43) {
      bigTiff = true;
      const offsetByteSize = dataView.getUint16(4, littleEndian);
      if (offsetByteSize !== 8) {
        throw new Error('Unsupported offset byte-size.');
      }
    } else {
      throw new TypeError('Invalid magic number.');
    }

    const firstIFDOffset = bigTiff
      ? dataView.getUint64(8, littleEndian)
      : dataView.getUint32(4, littleEndian);
    return new GeoTIFF(source, littleEndian, bigTiff, firstIFDOffset, options);
  }

  /**
   * Closes the underlying file buffer
   * N.B. After the GeoTIFF has been completely processed it needs
   * to be closed but only if it has been constructed from a file.
   */
  close() {
    if (typeof this.source.close === 'function') {
      return this.source.close();
    }
    return false;
  }
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GeoTIFF);

/**
 * Wrapper for GeoTIFF files that have external overviews.
 * @augments GeoTIFFBase
 */
class MultiGeoTIFF extends GeoTIFFBase {
  /**
   * Construct a new MultiGeoTIFF from a main and several overview files.
   * @param {GeoTIFF} mainFile The main GeoTIFF file.
   * @param {GeoTIFF[]} overviewFiles An array of overview files.
   */
  constructor(mainFile, overviewFiles) {
    super();
    this.mainFile = mainFile;
    this.overviewFiles = overviewFiles;
    this.imageFiles = [mainFile].concat(overviewFiles);

    this.fileDirectoriesPerFile = null;
    this.fileDirectoriesPerFileParsing = null;
    this.imageCount = null;
  }

  async parseFileDirectoriesPerFile() {
    const requests = [this.mainFile.parseFileDirectoryAt(this.mainFile.firstIFDOffset)]
      .concat(this.overviewFiles.map((file) => file.parseFileDirectoryAt(file.firstIFDOffset)));

    this.fileDirectoriesPerFile = await Promise.all(requests);
    return this.fileDirectoriesPerFile;
  }

  /**
   * Get the n-th internal subfile of an image. By default, the first is returned.
   *
   * @param {number} [index=0] the index of the image to return.
   * @returns {Promise<GeoTIFFImage>} the image at the given index
   */
  async getImage(index = 0) {
    await this.getImageCount();
    await this.parseFileDirectoriesPerFile();
    let visited = 0;
    let relativeIndex = 0;
    for (let i = 0; i < this.imageFiles.length; i++) {
      const imageFile = this.imageFiles[i];
      for (let ii = 0; ii < this.imageCounts[i]; ii++) {
        if (index === visited) {
          const ifd = await imageFile.requestIFD(relativeIndex);
          return new _geotiffimage_js__WEBPACK_IMPORTED_MODULE_6__["default"](
            ifd.fileDirectory, ifd.geoKeyDirectory,
            imageFile.dataView, imageFile.littleEndian, imageFile.cache, imageFile.source,
          );
        }
        visited++;
        relativeIndex++;
      }
      relativeIndex = 0;
    }

    throw new RangeError('Invalid image index');
  }

  /**
   * Returns the count of the internal subfiles.
   *
   * @returns {Promise<number>} the number of internal subfile images
   */
  async getImageCount() {
    if (this.imageCount !== null) {
      return this.imageCount;
    }
    const requests = [this.mainFile.getImageCount()]
      .concat(this.overviewFiles.map((file) => file.getImageCount()));
    this.imageCounts = await Promise.all(requests);
    this.imageCount = this.imageCounts.reduce((count, ifds) => count + ifds, 0);
    return this.imageCount;
  }
}



/**
 * Creates a new GeoTIFF from a remote URL.
 * @param {string} url The URL to access the image from
 * @param {object} [options] Additional options to pass to the source.
 *                           See {@link makeRemoteSource} for details.
 * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
 *                               to be aborted
 * @returns {Promise<GeoTIFF>} The resulting GeoTIFF file.
 */
async function fromUrl(url, options = {}, signal) {
  return GeoTIFF.fromSource((0,_source_remote_js__WEBPACK_IMPORTED_MODULE_8__.makeRemoteSource)(url, options), signal);
}

/**
 * Construct a new GeoTIFF from an
 * [ArrayBuffer]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer}.
 * @param {ArrayBuffer} arrayBuffer The data to read the file from.
 * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
 *                               to be aborted
 * @returns {Promise<GeoTIFF>} The resulting GeoTIFF file.
 */
async function fromArrayBuffer(arrayBuffer, signal) {
  return GeoTIFF.fromSource((0,_source_arraybuffer_js__WEBPACK_IMPORTED_MODULE_9__.makeBufferSource)(arrayBuffer), signal);
}

/**
 * Construct a GeoTIFF from a local file path. This uses the node
 * [filesystem API]{@link https://nodejs.org/api/fs.html} and is
 * not available on browsers.
 *
 * N.B. After the GeoTIFF has been completely processed it needs
 * to be closed but only if it has been constructed from a file.
 * @param {string} path The file path to read from.
 * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
 *                               to be aborted
 * @returns {Promise<GeoTIFF>} The resulting GeoTIFF file.
 */
async function fromFile(path, signal) {
  return GeoTIFF.fromSource((0,_source_file_js__WEBPACK_IMPORTED_MODULE_10__.makeFileSource)(path), signal);
}

/**
 * Construct a GeoTIFF from an HTML
 * [Blob]{@link https://developer.mozilla.org/en-US/docs/Web/API/Blob} or
 * [File]{@link https://developer.mozilla.org/en-US/docs/Web/API/File}
 * object.
 * @param {Blob|File} blob The Blob or File object to read from.
 * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
 *                               to be aborted
 * @returns {Promise<GeoTIFF>} The resulting GeoTIFF file.
 */
async function fromBlob(blob, signal) {
  return GeoTIFF.fromSource((0,_source_filereader_js__WEBPACK_IMPORTED_MODULE_11__.makeFileReaderSource)(blob), signal);
}

/**
 * Construct a MultiGeoTIFF from the given URLs.
 * @param {string} mainUrl The URL for the main file.
 * @param {string[]} overviewUrls An array of URLs for the overview images.
 * @param {Object} [options] Additional options to pass to the source.
 *                           See [makeRemoteSource]{@link module:source.makeRemoteSource}
 *                           for details.
 * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
 *                               to be aborted
 * @returns {Promise<MultiGeoTIFF>} The resulting MultiGeoTIFF file.
 */
async function fromUrls(mainUrl, overviewUrls = [], options = {}, signal) {
  const mainFile = await GeoTIFF.fromSource((0,_source_remote_js__WEBPACK_IMPORTED_MODULE_8__.makeRemoteSource)(mainUrl, options), signal);
  const overviewFiles = await Promise.all(
    overviewUrls.map((url) => GeoTIFF.fromSource((0,_source_remote_js__WEBPACK_IMPORTED_MODULE_8__.makeRemoteSource)(url, options))),
  );

  return new MultiGeoTIFF(mainFile, overviewFiles);
}

/**
 * Main creating function for GeoTIFF files.
 * @param {(Array)} array of pixel values
 * @returns {metadata} metadata
 */
function writeArrayBuffer(values, metadata) {
  return (0,_geotiffwriter_js__WEBPACK_IMPORTED_MODULE_12__.writeGeotiff)(values, metadata);
}





/***/ }),

/***/ "./node_modules/geotiff/dist-module/geotiffimage.js":
/*!**********************************************************!*\
  !*** ./node_modules/geotiff/dist-module/geotiffimage.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _petamoriken_float16__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @petamoriken/float16 */ "./node_modules/@petamoriken/float16/src/DataView.mjs");
/* harmony import */ var xml_utils_get_attribute_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! xml-utils/get-attribute.js */ "./node_modules/xml-utils/get-attribute.js");
/* harmony import */ var xml_utils_find_tags_by_name_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! xml-utils/find-tags-by-name.js */ "./node_modules/xml-utils/find-tags-by-name.js");
/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./globals.js */ "./node_modules/geotiff/dist-module/globals.js");
/* harmony import */ var _rgb_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./rgb.js */ "./node_modules/geotiff/dist-module/rgb.js");
/* harmony import */ var _compression_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./compression/index.js */ "./node_modules/geotiff/dist-module/compression/index.js");
/* harmony import */ var _resample_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./resample.js */ "./node_modules/geotiff/dist-module/resample.js");
/** @module geotiffimage */









/**
 * @typedef {Object} ReadRasterOptions
 * @property {Array<number>} [window=whole window] the subset to read data from in pixels.
 * @property {Array<number>} [bbox=whole image] the subset to read data from in
 *                                           geographical coordinates.
 * @property {Array<number>} [samples=all samples] the selection of samples to read from. Default is all samples.
 * @property {boolean} [interleave=false] whether the data shall be read
 *                                             in one single array or separate
 *                                             arrays.
 * @property {Pool} [pool=null] The optional decoder pool to use.
 * @property {number} [width] The desired width of the output. When the width is not the
 *                                 same as the images, resampling will be performed.
 * @property {number} [height] The desired height of the output. When the width is not the
 *                                  same as the images, resampling will be performed.
 * @property {string} [resampleMethod='nearest'] The desired resampling method.
 * @property {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
 *                                       to be aborted
 * @property {number|number[]} [fillValue] The value to use for parts of the image
 *                                              outside of the images extent. When multiple
 *                                              samples are requested, an array of fill values
 *                                              can be passed.
 */

/** @typedef {import("./geotiff.js").TypedArray} TypedArray */
/** @typedef {import("./geotiff.js").ReadRasterResult} ReadRasterResult */

function sum(array, start, end) {
  let s = 0;
  for (let i = start; i < end; ++i) {
    s += array[i];
  }
  return s;
}

function arrayForType(format, bitsPerSample, size) {
  switch (format) {
    case 1: // unsigned integer data
      if (bitsPerSample <= 8) {
        return new Uint8Array(size);
      } else if (bitsPerSample <= 16) {
        return new Uint16Array(size);
      } else if (bitsPerSample <= 32) {
        return new Uint32Array(size);
      }
      break;
    case 2: // twos complement signed integer data
      if (bitsPerSample === 8) {
        return new Int8Array(size);
      } else if (bitsPerSample === 16) {
        return new Int16Array(size);
      } else if (bitsPerSample === 32) {
        return new Int32Array(size);
      }
      break;
    case 3: // floating point data
      switch (bitsPerSample) {
        case 16:
        case 32:
          return new Float32Array(size);
        case 64:
          return new Float64Array(size);
        default:
          break;
      }
      break;
    default:
      break;
  }
  throw Error('Unsupported data format/bitsPerSample');
}

function needsNormalization(format, bitsPerSample) {
  if ((format === 1 || format === 2) && bitsPerSample <= 32 && bitsPerSample % 8 === 0) {
    return false;
  } else if (format === 3 && (bitsPerSample === 16 || bitsPerSample === 32 || bitsPerSample === 64)) {
    return false;
  }
  return true;
}

function normalizeArray(inBuffer, format, planarConfiguration, samplesPerPixel, bitsPerSample, tileWidth, tileHeight) {
  // const inByteArray = new Uint8Array(inBuffer);
  const view = new DataView(inBuffer);
  const outSize = planarConfiguration === 2
    ? tileHeight * tileWidth
    : tileHeight * tileWidth * samplesPerPixel;
  const samplesToTransfer = planarConfiguration === 2
    ? 1 : samplesPerPixel;
  const outArray = arrayForType(format, bitsPerSample, outSize);
  // let pixel = 0;

  const bitMask = parseInt('1'.repeat(bitsPerSample), 2);

  if (format === 1) { // unsigned integer
    // translation of https://github.com/OSGeo/gdal/blob/master/gdal/frmts/gtiff/geotiff.cpp#L7337
    let pixelBitSkip;
    // let sampleBitOffset = 0;
    if (planarConfiguration === 1) {
      pixelBitSkip = samplesPerPixel * bitsPerSample;
      // sampleBitOffset = (samplesPerPixel - 1) * bitsPerSample;
    } else {
      pixelBitSkip = bitsPerSample;
    }

    // Bits per line rounds up to next byte boundary.
    let bitsPerLine = tileWidth * pixelBitSkip;
    if ((bitsPerLine & 7) !== 0) {
      bitsPerLine = (bitsPerLine + 7) & (~7);
    }

    for (let y = 0; y < tileHeight; ++y) {
      const lineBitOffset = y * bitsPerLine;
      for (let x = 0; x < tileWidth; ++x) {
        const pixelBitOffset = lineBitOffset + (x * samplesToTransfer * bitsPerSample);
        for (let i = 0; i < samplesToTransfer; ++i) {
          const bitOffset = pixelBitOffset + (i * bitsPerSample);
          const outIndex = (((y * tileWidth) + x) * samplesToTransfer) + i;

          const byteOffset = Math.floor(bitOffset / 8);
          const innerBitOffset = bitOffset % 8;
          if (innerBitOffset + bitsPerSample <= 8) {
            outArray[outIndex] = (view.getUint8(byteOffset) >> (8 - bitsPerSample) - innerBitOffset) & bitMask;
          } else if (innerBitOffset + bitsPerSample <= 16) {
            outArray[outIndex] = (view.getUint16(byteOffset) >> (16 - bitsPerSample) - innerBitOffset) & bitMask;
          } else if (innerBitOffset + bitsPerSample <= 24) {
            const raw = (view.getUint16(byteOffset) << 8) | (view.getUint8(byteOffset + 2));
            outArray[outIndex] = (raw >> (24 - bitsPerSample) - innerBitOffset) & bitMask;
          } else {
            outArray[outIndex] = (view.getUint32(byteOffset) >> (32 - bitsPerSample) - innerBitOffset) & bitMask;
          }

          // let outWord = 0;
          // for (let bit = 0; bit < bitsPerSample; ++bit) {
          //   if (inByteArray[bitOffset >> 3]
          //     & (0x80 >> (bitOffset & 7))) {
          //     outWord |= (1 << (bitsPerSample - 1 - bit));
          //   }
          //   ++bitOffset;
          // }

          // outArray[outIndex] = outWord;
          // outArray[pixel] = outWord;
          // pixel += 1;
        }
        // bitOffset = bitOffset + pixelBitSkip - bitsPerSample;
      }
    }
  } else if (format === 3) { // floating point
    // Float16 is handled elsewhere
    // normalize 16/24 bit floats to 32 bit floats in the array
    // console.time();
    // if (bitsPerSample === 16) {
    //   for (let byte = 0, outIndex = 0; byte < inBuffer.byteLength; byte += 2, ++outIndex) {
    //     outArray[outIndex] = getFloat16(view, byte);
    //   }
    // }
    // console.timeEnd()
  }

  return outArray.buffer;
}

/**
 * GeoTIFF sub-file image.
 */
class GeoTIFFImage {
  /**
   * @constructor
   * @param {Object} fileDirectory The parsed file directory
   * @param {Object} geoKeys The parsed geo-keys
   * @param {DataView} dataView The DataView for the underlying file.
   * @param {Boolean} littleEndian Whether the file is encoded in little or big endian
   * @param {Boolean} cache Whether or not decoded tiles shall be cached
   * @param {import('./source/basesource').BaseSource} source The datasource to read from
   */
  constructor(fileDirectory, geoKeys, dataView, littleEndian, cache, source) {
    this.fileDirectory = fileDirectory;
    this.geoKeys = geoKeys;
    this.dataView = dataView;
    this.littleEndian = littleEndian;
    this.tiles = cache ? {} : null;
    this.isTiled = !fileDirectory.StripOffsets;
    const planarConfiguration = fileDirectory.PlanarConfiguration;
    this.planarConfiguration = (typeof planarConfiguration === 'undefined') ? 1 : planarConfiguration;
    if (this.planarConfiguration !== 1 && this.planarConfiguration !== 2) {
      throw new Error('Invalid planar configuration.');
    }

    this.source = source;
  }

  /**
   * Returns the associated parsed file directory.
   * @returns {Object} the parsed file directory
   */
  getFileDirectory() {
    return this.fileDirectory;
  }

  /**
   * Returns the associated parsed geo keys.
   * @returns {Object} the parsed geo keys
   */
  getGeoKeys() {
    return this.geoKeys;
  }

  /**
   * Returns the width of the image.
   * @returns {Number} the width of the image
   */
  getWidth() {
    return this.fileDirectory.ImageWidth;
  }

  /**
   * Returns the height of the image.
   * @returns {Number} the height of the image
   */
  getHeight() {
    return this.fileDirectory.ImageLength;
  }

  /**
   * Returns the number of samples per pixel.
   * @returns {Number} the number of samples per pixel
   */
  getSamplesPerPixel() {
    return typeof this.fileDirectory.SamplesPerPixel !== 'undefined'
      ? this.fileDirectory.SamplesPerPixel : 1;
  }

  /**
   * Returns the width of each tile.
   * @returns {Number} the width of each tile
   */
  getTileWidth() {
    return this.isTiled ? this.fileDirectory.TileWidth : this.getWidth();
  }

  /**
   * Returns the height of each tile.
   * @returns {Number} the height of each tile
   */
  getTileHeight() {
    if (this.isTiled) {
      return this.fileDirectory.TileLength;
    }
    if (typeof this.fileDirectory.RowsPerStrip !== 'undefined') {
      return Math.min(this.fileDirectory.RowsPerStrip, this.getHeight());
    }
    return this.getHeight();
  }

  getBlockWidth() {
    return this.getTileWidth();
  }

  getBlockHeight(y) {
    if (this.isTiled || (y + 1) * this.getTileHeight() <= this.getHeight()) {
      return this.getTileHeight();
    } else {
      return this.getHeight() - (y * this.getTileHeight());
    }
  }

  /**
   * Calculates the number of bytes for each pixel across all samples. Only full
   * bytes are supported, an exception is thrown when this is not the case.
   * @returns {Number} the bytes per pixel
   */
  getBytesPerPixel() {
    let bytes = 0;
    for (let i = 0; i < this.fileDirectory.BitsPerSample.length; ++i) {
      bytes += this.getSampleByteSize(i);
    }
    return bytes;
  }

  getSampleByteSize(i) {
    if (i >= this.fileDirectory.BitsPerSample.length) {
      throw new RangeError(`Sample index ${i} is out of range.`);
    }
    return Math.ceil(this.fileDirectory.BitsPerSample[i] / 8);
  }

  getReaderForSample(sampleIndex) {
    const format = this.fileDirectory.SampleFormat
      ? this.fileDirectory.SampleFormat[sampleIndex] : 1;
    const bitsPerSample = this.fileDirectory.BitsPerSample[sampleIndex];
    switch (format) {
      case 1: // unsigned integer data
        if (bitsPerSample <= 8) {
          return DataView.prototype.getUint8;
        } else if (bitsPerSample <= 16) {
          return DataView.prototype.getUint16;
        } else if (bitsPerSample <= 32) {
          return DataView.prototype.getUint32;
        }
        break;
      case 2: // twos complement signed integer data
        if (bitsPerSample <= 8) {
          return DataView.prototype.getInt8;
        } else if (bitsPerSample <= 16) {
          return DataView.prototype.getInt16;
        } else if (bitsPerSample <= 32) {
          return DataView.prototype.getInt32;
        }
        break;
      case 3:
        switch (bitsPerSample) {
          case 16:
            return function (offset, littleEndian) {
              return (0,_petamoriken_float16__WEBPACK_IMPORTED_MODULE_2__.getFloat16)(this, offset, littleEndian);
            };
          case 32:
            return DataView.prototype.getFloat32;
          case 64:
            return DataView.prototype.getFloat64;
          default:
            break;
        }
        break;
      default:
        break;
    }
    throw Error('Unsupported data format/bitsPerSample');
  }

  getSampleFormat(sampleIndex = 0) {
    return this.fileDirectory.SampleFormat
      ? this.fileDirectory.SampleFormat[sampleIndex] : 1;
  }

  getBitsPerSample(sampleIndex = 0) {
    return this.fileDirectory.BitsPerSample[sampleIndex];
  }

  getArrayForSample(sampleIndex, size) {
    const format = this.getSampleFormat(sampleIndex);
    const bitsPerSample = this.getBitsPerSample(sampleIndex);
    return arrayForType(format, bitsPerSample, size);
  }

  /**
   * Returns the decoded strip or tile.
   * @param {Number} x the strip or tile x-offset
   * @param {Number} y the tile y-offset (0 for stripped images)
   * @param {Number} sample the sample to get for separated samples
   * @param {import("./geotiff").Pool|import("./geotiff").BaseDecoder} poolOrDecoder the decoder or decoder pool
   * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
   *                               to be aborted
   * @returns {Promise.<ArrayBuffer>}
   */
  async getTileOrStrip(x, y, sample, poolOrDecoder, signal) {
    const numTilesPerRow = Math.ceil(this.getWidth() / this.getTileWidth());
    const numTilesPerCol = Math.ceil(this.getHeight() / this.getTileHeight());
    let index;
    const { tiles } = this;
    if (this.planarConfiguration === 1) {
      index = (y * numTilesPerRow) + x;
    } else if (this.planarConfiguration === 2) {
      index = (sample * numTilesPerRow * numTilesPerCol) + (y * numTilesPerRow) + x;
    }

    let offset;
    let byteCount;
    if (this.isTiled) {
      offset = this.fileDirectory.TileOffsets[index];
      byteCount = this.fileDirectory.TileByteCounts[index];
    } else {
      offset = this.fileDirectory.StripOffsets[index];
      byteCount = this.fileDirectory.StripByteCounts[index];
    }
    const slice = (await this.source.fetch([{ offset, length: byteCount }], signal))[0];

    let request;
    if (tiles === null || !tiles[index]) {
    // resolve each request by potentially applying array normalization
      request = (async () => {
        let data = await poolOrDecoder.decode(this.fileDirectory, slice);
        const sampleFormat = this.getSampleFormat();
        const bitsPerSample = this.getBitsPerSample();
        if (needsNormalization(sampleFormat, bitsPerSample)) {
          data = normalizeArray(
            data,
            sampleFormat,
            this.planarConfiguration,
            this.getSamplesPerPixel(),
            bitsPerSample,
            this.getTileWidth(),
            this.getBlockHeight(y),
          );
        }
        return data;
      })();

      // set the cache
      if (tiles !== null) {
        tiles[index] = request;
      }
    } else {
      // get from the cache
      request = tiles[index];
    }

    // cache the tile request
    return { x, y, sample, data: await request };
  }

  /**
   * Internal read function.
   * @private
   * @param {Array} imageWindow The image window in pixel coordinates
   * @param {Array} samples The selected samples (0-based indices)
   * @param {TypedArray|TypedArray[]} valueArrays The array(s) to write into
   * @param {Boolean} interleave Whether or not to write in an interleaved manner
   * @param {import("./geotiff").Pool|AbstractDecoder} poolOrDecoder the decoder or decoder pool
   * @param {number} width the width of window to be read into
   * @param {number} height the height of window to be read into
   * @param {number} resampleMethod the resampling method to be used when interpolating
   * @param {AbortSignal} [signal] An AbortSignal that may be signalled if the request is
   *                               to be aborted
   * @returns {Promise<ReadRasterResult>}
   */
  async _readRaster(imageWindow, samples, valueArrays, interleave, poolOrDecoder, width,
    height, resampleMethod, signal) {
    const tileWidth = this.getTileWidth();
    const tileHeight = this.getTileHeight();
    const imageWidth = this.getWidth();
    const imageHeight = this.getHeight();

    const minXTile = Math.max(Math.floor(imageWindow[0] / tileWidth), 0);
    const maxXTile = Math.min(
      Math.ceil(imageWindow[2] / tileWidth),
      Math.ceil(imageWidth / tileWidth),
    );
    const minYTile = Math.max(Math.floor(imageWindow[1] / tileHeight), 0);
    const maxYTile = Math.min(
      Math.ceil(imageWindow[3] / tileHeight),
      Math.ceil(imageHeight / tileHeight),
    );
    const windowWidth = imageWindow[2] - imageWindow[0];

    let bytesPerPixel = this.getBytesPerPixel();

    const srcSampleOffsets = [];
    const sampleReaders = [];
    for (let i = 0; i < samples.length; ++i) {
      if (this.planarConfiguration === 1) {
        srcSampleOffsets.push(sum(this.fileDirectory.BitsPerSample, 0, samples[i]) / 8);
      } else {
        srcSampleOffsets.push(0);
      }
      sampleReaders.push(this.getReaderForSample(samples[i]));
    }

    const promises = [];
    const { littleEndian } = this;

    for (let yTile = minYTile; yTile < maxYTile; ++yTile) {
      for (let xTile = minXTile; xTile < maxXTile; ++xTile) {
        for (let sampleIndex = 0; sampleIndex < samples.length; ++sampleIndex) {
          const si = sampleIndex;
          const sample = samples[sampleIndex];
          if (this.planarConfiguration === 2) {
            bytesPerPixel = this.getSampleByteSize(sampleIndex);
          }
          const promise = this.getTileOrStrip(xTile, yTile, sample, poolOrDecoder, signal).then((tile) => {
            const buffer = tile.data;
            const dataView = new DataView(buffer);
            const blockHeight = this.getBlockHeight(tile.y);
            const firstLine = tile.y * tileHeight;
            const firstCol = tile.x * tileWidth;
            const lastLine = firstLine + blockHeight;
            const lastCol = (tile.x + 1) * tileWidth;
            const reader = sampleReaders[si];

            const ymax = Math.min(blockHeight, blockHeight - (lastLine - imageWindow[3]), imageHeight - firstLine);
            const xmax = Math.min(tileWidth, tileWidth - (lastCol - imageWindow[2]), imageWidth - firstCol);

            for (let y = Math.max(0, imageWindow[1] - firstLine); y < ymax; ++y) {
              for (let x = Math.max(0, imageWindow[0] - firstCol); x < xmax; ++x) {
                const pixelOffset = ((y * tileWidth) + x) * bytesPerPixel;
                const value = reader.call(
                  dataView, pixelOffset + srcSampleOffsets[si], littleEndian,
                );
                let windowCoordinate;
                if (interleave) {
                  windowCoordinate = ((y + firstLine - imageWindow[1]) * windowWidth * samples.length)
                    + ((x + firstCol - imageWindow[0]) * samples.length)
                    + si;
                  valueArrays[windowCoordinate] = value;
                } else {
                  windowCoordinate = (
                    (y + firstLine - imageWindow[1]) * windowWidth
                  ) + x + firstCol - imageWindow[0];
                  valueArrays[si][windowCoordinate] = value;
                }
              }
            }
          });
          promises.push(promise);
        }
      }
    }
    await Promise.all(promises);

    if ((width && (imageWindow[2] - imageWindow[0]) !== width)
        || (height && (imageWindow[3] - imageWindow[1]) !== height)) {
      let resampled;
      if (interleave) {
        resampled = (0,_resample_js__WEBPACK_IMPORTED_MODULE_3__.resampleInterleaved)(
          valueArrays,
          imageWindow[2] - imageWindow[0],
          imageWindow[3] - imageWindow[1],
          width, height,
          samples.length,
          resampleMethod,
        );
      } else {
        resampled = (0,_resample_js__WEBPACK_IMPORTED_MODULE_3__.resample)(
          valueArrays,
          imageWindow[2] - imageWindow[0],
          imageWindow[3] - imageWindow[1],
          width, height,
          resampleMethod,
        );
      }
      resampled.width = width;
      resampled.height = height;
      return resampled;
    }

    valueArrays.width = width || imageWindow[2] - imageWindow[0];
    valueArrays.height = height || imageWindow[3] - imageWindow[1];

    return valueArrays;
  }

  /**
   * Reads raster data from the image. This function reads all selected samples
   * into separate arrays of the correct type for that sample or into a single
   * combined array when `interleave` is set. When provided, only a subset
   * of the raster is read for each sample.
   *
   * @param {ReadRasterOptions} [options={}] optional parameters
   * @returns {Promise<ReadRasterResult>} the decoded arrays as a promise
   */
  async readRasters({
    window: wnd, samples = [], interleave, pool = null,
    width, height, resampleMethod, fillValue, signal,
  } = {}) {
    const imageWindow = wnd || [0, 0, this.getWidth(), this.getHeight()];

    // check parameters
    if (imageWindow[0] > imageWindow[2] || imageWindow[1] > imageWindow[3]) {
      throw new Error('Invalid subsets');
    }

    const imageWindowWidth = imageWindow[2] - imageWindow[0];
    const imageWindowHeight = imageWindow[3] - imageWindow[1];
    const numPixels = imageWindowWidth * imageWindowHeight;
    const samplesPerPixel = this.getSamplesPerPixel();

    if (!samples || !samples.length) {
      for (let i = 0; i < samplesPerPixel; ++i) {
        samples.push(i);
      }
    } else {
      for (let i = 0; i < samples.length; ++i) {
        if (samples[i] >= samplesPerPixel) {
          return Promise.reject(new RangeError(`Invalid sample index '${samples[i]}'.`));
        }
      }
    }
    let valueArrays;
    if (interleave) {
      const format = this.fileDirectory.SampleFormat
        ? Math.max.apply(null, this.fileDirectory.SampleFormat) : 1;
      const bitsPerSample = Math.max.apply(null, this.fileDirectory.BitsPerSample);
      valueArrays = arrayForType(format, bitsPerSample, numPixels * samples.length);
      if (fillValue) {
        valueArrays.fill(fillValue);
      }
    } else {
      valueArrays = [];
      for (let i = 0; i < samples.length; ++i) {
        const valueArray = this.getArrayForSample(samples[i], numPixels);
        if (Array.isArray(fillValue) && i < fillValue.length) {
          valueArray.fill(fillValue[i]);
        } else if (fillValue && !Array.isArray(fillValue)) {
          valueArray.fill(fillValue);
        }
        valueArrays.push(valueArray);
      }
    }

    const poolOrDecoder = pool || await (0,_compression_index_js__WEBPACK_IMPORTED_MODULE_4__.getDecoder)(this.fileDirectory);

    const result = await this._readRaster(
      imageWindow, samples, valueArrays, interleave, poolOrDecoder, width, height, resampleMethod, signal,
    );
    return result;
  }

  /**
   * Reads raster data from the image as RGB. The result is always an
   * interleaved typed array.
   * Colorspaces other than RGB will be transformed to RGB, color maps expanded.
   * When no other method is applicable, the first sample is used to produce a
   * grayscale image.
   * When provided, only a subset of the raster is read for each sample.
   *
   * @param {Object} [options] optional parameters
   * @param {Array<number>} [options.window] the subset to read data from in pixels.
   * @param {boolean} [options.interleave=true] whether the data shall be read
   *                                             in one single array or separate
   *                                             arrays.
   * @param {import("./geotiff").Pool} [options.pool=null] The optional decoder pool to use.
   * @param {number} [options.width] The desired width of the output. When the width is no the
   *                                 same as the images, resampling will be performed.
   * @param {number} [options.height] The desired height of the output. When the width is no the
   *                                  same as the images, resampling will be performed.
   * @param {string} [options.resampleMethod='nearest'] The desired resampling method.
   * @param {boolean} [options.enableAlpha=false] Enable reading alpha channel if present.
   * @param {AbortSignal} [options.signal] An AbortSignal that may be signalled if the request is
   *                                       to be aborted
   * @returns {Promise<ReadRasterResult>} the RGB array as a Promise
   */
  async readRGB({ window, interleave = true, pool = null, width, height,
    resampleMethod, enableAlpha = false, signal } = {}) {
    const imageWindow = window || [0, 0, this.getWidth(), this.getHeight()];

    // check parameters
    if (imageWindow[0] > imageWindow[2] || imageWindow[1] > imageWindow[3]) {
      throw new Error('Invalid subsets');
    }

    const pi = this.fileDirectory.PhotometricInterpretation;

    if (pi === _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.RGB) {
      let s = [0, 1, 2];
      if ((!(this.fileDirectory.ExtraSamples === _globals_js__WEBPACK_IMPORTED_MODULE_5__.ExtraSamplesValues.Unspecified)) && enableAlpha) {
        s = [];
        for (let i = 0; i < this.fileDirectory.BitsPerSample.length; i += 1) {
          s.push(i);
        }
      }
      return this.readRasters({
        window,
        interleave,
        samples: s,
        pool,
        width,
        height,
        resampleMethod,
        signal,
      });
    }

    let samples;
    switch (pi) {
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.WhiteIsZero:
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.BlackIsZero:
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.Palette:
        samples = [0];
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.CMYK:
        samples = [0, 1, 2, 3];
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.YCbCr:
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.CIELab:
        samples = [0, 1, 2];
        break;
      default:
        throw new Error('Invalid or unsupported photometric interpretation.');
    }

    const subOptions = {
      window: imageWindow,
      interleave: true,
      samples,
      pool,
      width,
      height,
      resampleMethod,
      signal,
    };
    const { fileDirectory } = this;
    const raster = await this.readRasters(subOptions);

    const max = 2 ** this.fileDirectory.BitsPerSample[0];
    let data;
    switch (pi) {
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.WhiteIsZero:
        data = (0,_rgb_js__WEBPACK_IMPORTED_MODULE_6__.fromWhiteIsZero)(raster, max);
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.BlackIsZero:
        data = (0,_rgb_js__WEBPACK_IMPORTED_MODULE_6__.fromBlackIsZero)(raster, max);
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.Palette:
        data = (0,_rgb_js__WEBPACK_IMPORTED_MODULE_6__.fromPalette)(raster, fileDirectory.ColorMap);
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.CMYK:
        data = (0,_rgb_js__WEBPACK_IMPORTED_MODULE_6__.fromCMYK)(raster);
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.YCbCr:
        data = (0,_rgb_js__WEBPACK_IMPORTED_MODULE_6__.fromYCbCr)(raster);
        break;
      case _globals_js__WEBPACK_IMPORTED_MODULE_5__.photometricInterpretations.CIELab:
        data = (0,_rgb_js__WEBPACK_IMPORTED_MODULE_6__.fromCIELab)(raster);
        break;
      default:
        throw new Error('Unsupported photometric interpretation.');
    }

    // if non-interleaved data is requested, we must split the channels
    // into their respective arrays
    if (!interleave) {
      const red = new Uint8Array(data.length / 3);
      const green = new Uint8Array(data.length / 3);
      const blue = new Uint8Array(data.length / 3);
      for (let i = 0, j = 0; i < data.length; i += 3, ++j) {
        red[j] = data[i];
        green[j] = data[i + 1];
        blue[j] = data[i + 2];
      }
      data = [red, green, blue];
    }

    data.width = raster.width;
    data.height = raster.height;
    return data;
  }

  /**
   * Returns an array of tiepoints.
   * @returns {Object[]}
   */
  getTiePoints() {
    if (!this.fileDirectory.ModelTiepoint) {
      return [];
    }

    const tiePoints = [];
    for (let i = 0; i < this.fileDirectory.ModelTiepoint.length; i += 6) {
      tiePoints.push({
        i: this.fileDirectory.ModelTiepoint[i],
        j: this.fileDirectory.ModelTiepoint[i + 1],
        k: this.fileDirectory.ModelTiepoint[i + 2],
        x: this.fileDirectory.ModelTiepoint[i + 3],
        y: this.fileDirectory.ModelTiepoint[i + 4],
        z: this.fileDirectory.ModelTiepoint[i + 5],
      });
    }
    return tiePoints;
  }

  /**
   * Returns the parsed GDAL metadata items.
   *
   * If sample is passed to null, dataset-level metadata will be returned.
   * Otherwise only metadata specific to the provided sample will be returned.
   *
   * @param {number} [sample=null] The sample index.
   * @returns {Object}
   */
  getGDALMetadata(sample = null) {
    const metadata = {};
    if (!this.fileDirectory.GDAL_METADATA) {
      return null;
    }
    const string = this.fileDirectory.GDAL_METADATA;

    let items = xml_utils_find_tags_by_name_js__WEBPACK_IMPORTED_MODULE_1__(string, 'Item');

    if (sample === null) {
      items = items.filter((item) => xml_utils_get_attribute_js__WEBPACK_IMPORTED_MODULE_0__(item, 'sample') === undefined);
    } else {
      items = items.filter((item) => Number(xml_utils_get_attribute_js__WEBPACK_IMPORTED_MODULE_0__(item, 'sample')) === sample);
    }

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      metadata[xml_utils_get_attribute_js__WEBPACK_IMPORTED_MODULE_0__(item, 'name')] = item.inner;
    }
    return metadata;
  }

  /**
   * Returns the GDAL nodata value
   * @returns {number|null}
   */
  getGDALNoData() {
    if (!this.fileDirectory.GDAL_NODATA) {
      return null;
    }
    const string = this.fileDirectory.GDAL_NODATA;
    return Number(string.substring(0, string.length - 1));
  }

  /**
   * Returns the image origin as a XYZ-vector. When the image has no affine
   * transformation, then an exception is thrown.
   * @returns {Array<number>} The origin as a vector
   */
  getOrigin() {
    const tiePoints = this.fileDirectory.ModelTiepoint;
    const modelTransformation = this.fileDirectory.ModelTransformation;
    if (tiePoints && tiePoints.length === 6) {
      return [
        tiePoints[3],
        tiePoints[4],
        tiePoints[5],
      ];
    }
    if (modelTransformation) {
      return [
        modelTransformation[3],
        modelTransformation[7],
        modelTransformation[11],
      ];
    }
    throw new Error('The image does not have an affine transformation.');
  }

  /**
   * Returns the image resolution as a XYZ-vector. When the image has no affine
   * transformation, then an exception is thrown.
   * @param {GeoTIFFImage} [referenceImage=null] A reference image to calculate the resolution from
   *                                             in cases when the current image does not have the
   *                                             required tags on its own.
   * @returns {Array<number>} The resolution as a vector
   */
  getResolution(referenceImage = null) {
    const modelPixelScale = this.fileDirectory.ModelPixelScale;
    const modelTransformation = this.fileDirectory.ModelTransformation;

    if (modelPixelScale) {
      return [
        modelPixelScale[0],
        -modelPixelScale[1],
        modelPixelScale[2],
      ];
    }
    if (modelTransformation) {
      return [
        modelTransformation[0],
        modelTransformation[5],
        modelTransformation[10],
      ];
    }

    if (referenceImage) {
      const [refResX, refResY, refResZ] = referenceImage.getResolution();
      return [
        refResX * referenceImage.getWidth() / this.getWidth(),
        refResY * referenceImage.getHeight() / this.getHeight(),
        refResZ * referenceImage.getWidth() / this.getWidth(),
      ];
    }

    throw new Error('The image does not have an affine transformation.');
  }

  /**
   * Returns whether or not the pixels of the image depict an area (or point).
   * @returns {Boolean} Whether the pixels are a point
   */
  pixelIsArea() {
    return this.geoKeys.GTRasterTypeGeoKey === 1;
  }

  /**
   * Returns the image bounding box as an array of 4 values: min-x, min-y,
   * max-x and max-y. When the image has no affine transformation, then an
   * exception is thrown.
   * @returns {Array<number>} The bounding box
   */
  getBoundingBox() {
    const origin = this.getOrigin();
    const resolution = this.getResolution();

    const x1 = origin[0];
    const y1 = origin[1];

    const x2 = x1 + (resolution[0] * this.getWidth());
    const y2 = y1 + (resolution[1] * this.getHeight());

    return [
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.max(x1, x2),
      Math.max(y1, y2),
    ];
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GeoTIFFImage);


/***/ }),

/***/ "./node_modules/geotiff/dist-module/geotiffwriter.js":
/*!***********************************************************!*\
  !*** ./node_modules/geotiff/dist-module/geotiffwriter.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   writeGeotiff: () => (/* binding */ writeGeotiff)
/* harmony export */ });
/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globals.js */ "./node_modules/geotiff/dist-module/globals.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/geotiff/dist-module/utils.js");
/*
  Some parts of this file are based on UTIF.js,
  which was released under the MIT License.
  You can view that here:
  https://github.com/photopea/UTIF.js/blob/master/LICENSE
*/



const tagName2Code = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.invert)(_globals_js__WEBPACK_IMPORTED_MODULE_1__.fieldTagNames);
const geoKeyName2Code = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.invert)(_globals_js__WEBPACK_IMPORTED_MODULE_1__.geoKeyNames);
const name2code = {};
(0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.assign)(name2code, tagName2Code);
(0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.assign)(name2code, geoKeyName2Code);
const typeName2byte = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.invert)(_globals_js__WEBPACK_IMPORTED_MODULE_1__.fieldTypeNames);

// config variables
const numBytesInIfd = 1000;

const _binBE = {
  nextZero: (data, o) => {
    let oincr = o;
    while (data[oincr] !== 0) {
      oincr++;
    }
    return oincr;
  },
  readUshort: (buff, p) => {
    return (buff[p] << 8) | buff[p + 1];
  },
  readShort: (buff, p) => {
    const a = _binBE.ui8;
    a[0] = buff[p + 1];
    a[1] = buff[p + 0];
    return _binBE.i16[0];
  },
  readInt: (buff, p) => {
    const a = _binBE.ui8;
    a[0] = buff[p + 3];
    a[1] = buff[p + 2];
    a[2] = buff[p + 1];
    a[3] = buff[p + 0];
    return _binBE.i32[0];
  },
  readUint: (buff, p) => {
    const a = _binBE.ui8;
    a[0] = buff[p + 3];
    a[1] = buff[p + 2];
    a[2] = buff[p + 1];
    a[3] = buff[p + 0];
    return _binBE.ui32[0];
  },
  readASCII: (buff, p, l) => {
    return l.map((i) => String.fromCharCode(buff[p + i])).join('');
  },
  readFloat: (buff, p) => {
    const a = _binBE.ui8;
    (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(4, (i) => {
      a[i] = buff[p + 3 - i];
    });
    return _binBE.fl32[0];
  },
  readDouble: (buff, p) => {
    const a = _binBE.ui8;
    (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(8, (i) => {
      a[i] = buff[p + 7 - i];
    });
    return _binBE.fl64[0];
  },
  writeUshort: (buff, p, n) => {
    buff[p] = (n >> 8) & 255;
    buff[p + 1] = n & 255;
  },
  writeUint: (buff, p, n) => {
    buff[p] = (n >> 24) & 255;
    buff[p + 1] = (n >> 16) & 255;
    buff[p + 2] = (n >> 8) & 255;
    buff[p + 3] = (n >> 0) & 255;
  },
  writeASCII: (buff, p, s) => {
    (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(s.length, (i) => {
      buff[p + i] = s.charCodeAt(i);
    });
  },
  ui8: new Uint8Array(8),
};

_binBE.fl64 = new Float64Array(_binBE.ui8.buffer);

_binBE.writeDouble = (buff, p, n) => {
  _binBE.fl64[0] = n;
  (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(8, (i) => {
    buff[p + i] = _binBE.ui8[7 - i];
  });
};

const _writeIFD = (bin, data, _offset, ifd) => {
  let offset = _offset;

  const keys = Object.keys(ifd).filter((key) => {
    return key !== undefined && key !== null && key !== 'undefined';
  });

  bin.writeUshort(data, offset, keys.length);
  offset += 2;

  let eoff = offset + (12 * keys.length) + 4;

  for (const key of keys) {
    let tag = null;
    if (typeof key === 'number') {
      tag = key;
    } else if (typeof key === 'string') {
      tag = parseInt(key, 10);
    }

    const typeName = _globals_js__WEBPACK_IMPORTED_MODULE_1__.fieldTagTypes[tag];
    const typeNum = typeName2byte[typeName];

    if (typeName == null || typeName === undefined || typeof typeName === 'undefined') {
      throw new Error(`unknown type of tag: ${tag}`);
    }

    let val = ifd[key];

    if (val === undefined) {
      throw new Error(`failed to get value for key ${key}`);
    }

    // ASCIIZ format with trailing 0 character
    // http://www.fileformat.info/format/tiff/corion.htm
    // https://stackoverflow.com/questions/7783044/whats-the-difference-between-asciiz-vs-ascii
    if (typeName === 'ASCII' && typeof val === 'string' && (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.endsWith)(val, '\u0000') === false) {
      val += '\u0000';
    }

    const num = val.length;

    bin.writeUshort(data, offset, tag);
    offset += 2;

    bin.writeUshort(data, offset, typeNum);
    offset += 2;

    bin.writeUint(data, offset, num);
    offset += 4;

    let dlen = [-1, 1, 1, 2, 4, 8, 0, 0, 0, 0, 0, 0, 8][typeNum] * num;
    let toff = offset;

    if (dlen > 4) {
      bin.writeUint(data, offset, eoff);
      toff = eoff;
    }

    if (typeName === 'ASCII') {
      bin.writeASCII(data, toff, val);
    } else if (typeName === 'SHORT') {
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(num, (i) => {
        bin.writeUshort(data, toff + (2 * i), val[i]);
      });
    } else if (typeName === 'LONG') {
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(num, (i) => {
        bin.writeUint(data, toff + (4 * i), val[i]);
      });
    } else if (typeName === 'RATIONAL') {
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(num, (i) => {
        bin.writeUint(data, toff + (8 * i), Math.round(val[i] * 10000));
        bin.writeUint(data, toff + (8 * i) + 4, 10000);
      });
    } else if (typeName === 'DOUBLE') {
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(num, (i) => {
        bin.writeDouble(data, toff + (8 * i), val[i]);
      });
    }

    if (dlen > 4) {
      dlen += (dlen & 1);
      eoff += dlen;
    }

    offset += 4;
  }

  return [offset, eoff];
};

const encodeIfds = (ifds) => {
  const data = new Uint8Array(numBytesInIfd);
  let offset = 4;
  const bin = _binBE;

  // set big-endian byte-order
  // https://en.wikipedia.org/wiki/TIFF#Byte_order
  data[0] = 77;
  data[1] = 77;

  // set format-version number
  // https://en.wikipedia.org/wiki/TIFF#Byte_order
  data[3] = 42;

  let ifdo = 8;

  bin.writeUint(data, offset, ifdo);

  offset += 4;

  ifds.forEach((ifd, i) => {
    const noffs = _writeIFD(bin, data, ifdo, ifd);
    ifdo = noffs[1];
    if (i < ifds.length - 1) {
      bin.writeUint(data, noffs[0], ifdo);
    }
  });

  if (data.slice) {
    return data.slice(0, ifdo).buffer;
  }

  // node hasn't implemented slice on Uint8Array yet
  const result = new Uint8Array(ifdo);
  for (let i = 0; i < ifdo; i++) {
    result[i] = data[i];
  }
  return result.buffer;
};

const encodeImage = (values, width, height, metadata) => {
  if (height === undefined || height === null) {
    throw new Error(`you passed into encodeImage a width of type ${height}`);
  }

  if (width === undefined || width === null) {
    throw new Error(`you passed into encodeImage a width of type ${width}`);
  }

  const ifd = {
    256: [width], // ImageWidth
    257: [height], // ImageLength
    273: [numBytesInIfd], // strips offset
    278: [height], // RowsPerStrip
    305: 'geotiff.js', // no array for ASCII(Z)
  };

  if (metadata) {
    for (const i in metadata) {
      if (metadata.hasOwnProperty(i)) {
        ifd[i] = metadata[i];
      }
    }
  }

  const prfx = new Uint8Array(encodeIfds([ifd]));

  const img = new Uint8Array(values);

  const samplesPerPixel = ifd[277];

  const data = new Uint8Array(numBytesInIfd + (width * height * samplesPerPixel));
  (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(prfx.length, (i) => {
    data[i] = prfx[i];
  });
  (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.forEach)(img, (value, i) => {
    data[numBytesInIfd + i] = value;
  });

  return data.buffer;
};

const convertToTids = (input) => {
  const result = {};
  for (const key in input) {
    if (key !== 'StripOffsets') {
      if (!name2code[key]) {
        console.error(key, 'not in name2code:', Object.keys(name2code));
      }
      result[name2code[key]] = input[key];
    }
  }
  return result;
};

const toArray = (input) => {
  if (Array.isArray(input)) {
    return input;
  }
  return [input];
};

const metadataDefaults = [
  ['Compression', 1], // no compression
  ['PlanarConfiguration', 1],
  ['ExtraSamples', 0],
];

function writeGeotiff(data, metadata) {
  const isFlattened = typeof data[0] === 'number';

  let height;
  let numBands;
  let width;
  let flattenedValues;

  if (isFlattened) {
    height = metadata.height || metadata.ImageLength;
    width = metadata.width || metadata.ImageWidth;
    numBands = data.length / (height * width);
    flattenedValues = data;
  } else {
    numBands = data.length;
    height = data[0].length;
    width = data[0][0].length;
    flattenedValues = [];
    (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(height, (rowIndex) => {
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(width, (columnIndex) => {
        (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(numBands, (bandIndex) => {
          flattenedValues.push(data[bandIndex][rowIndex][columnIndex]);
        });
      });
    });
  }

  metadata.ImageLength = height;
  delete metadata.height;
  metadata.ImageWidth = width;
  delete metadata.width;

  // consult https://www.loc.gov/preservation/digital/formats/content/tiff_tags.shtml

  if (!metadata.BitsPerSample) {
    metadata.BitsPerSample = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(numBands, () => 8);
  }

  metadataDefaults.forEach((tag) => {
    const key = tag[0];
    if (!metadata[key]) {
      const value = tag[1];
      metadata[key] = value;
    }
  });

  // The color space of the image data.
  // 1=black is zero and 2=RGB.
  if (!metadata.PhotometricInterpretation) {
    metadata.PhotometricInterpretation = metadata.BitsPerSample.length === 3 ? 2 : 1;
  }

  // The number of components per pixel.
  if (!metadata.SamplesPerPixel) {
    metadata.SamplesPerPixel = [numBands];
  }

  if (!metadata.StripByteCounts) {
    // we are only writing one strip
    metadata.StripByteCounts = [numBands * height * width];
  }

  if (!metadata.ModelPixelScale) {
    // assumes raster takes up exactly the whole globe
    metadata.ModelPixelScale = [360 / width, 180 / height, 0];
  }

  if (!metadata.SampleFormat) {
    metadata.SampleFormat = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.times)(numBands, () => 1);
  }

  // if didn't pass in projection information, assume the popular 4326 "geographic projection"
  if (!metadata.hasOwnProperty('GeographicTypeGeoKey') && !metadata.hasOwnProperty('ProjectedCSTypeGeoKey')) {
    metadata.GeographicTypeGeoKey = 4326;
    metadata.ModelTiepoint = [0, 0, 0, -180, 90, 0]; // raster fits whole globe
    metadata.GeogCitationGeoKey = 'WGS 84';
    metadata.GTModelTypeGeoKey = 2;
  }

  const geoKeys = Object.keys(metadata)
    .filter((key) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.endsWith)(key, 'GeoKey'))
    .sort((a, b) => name2code[a] - name2code[b]);

  if (!metadata.GeoAsciiParams) {
    let geoAsciiParams = '';
    geoKeys.forEach((name) => {
      const code = Number(name2code[name]);
      const tagType = _globals_js__WEBPACK_IMPORTED_MODULE_1__.fieldTagTypes[code];
      if (tagType === 'ASCII') {
        geoAsciiParams += `${metadata[name].toString()}\u0000`;
      }
    });
    if (geoAsciiParams.length > 0) {
      metadata.GeoAsciiParams = geoAsciiParams;
    }
  }

  if (!metadata.GeoKeyDirectory) {
    const NumberOfKeys = geoKeys.length;

    const GeoKeyDirectory = [1, 1, 0, NumberOfKeys];
    geoKeys.forEach((geoKey) => {
      const KeyID = Number(name2code[geoKey]);
      GeoKeyDirectory.push(KeyID);

      let Count;
      let TIFFTagLocation;
      let valueOffset;
      if (_globals_js__WEBPACK_IMPORTED_MODULE_1__.fieldTagTypes[KeyID] === 'SHORT') {
        Count = 1;
        TIFFTagLocation = 0;
        valueOffset = metadata[geoKey];
      } else if (geoKey === 'GeogCitationGeoKey') {
        Count = metadata.GeoAsciiParams.length;
        TIFFTagLocation = Number(name2code.GeoAsciiParams);
        valueOffset = 0;
      } else {
        console.log(`[geotiff.js] couldn't get TIFFTagLocation for ${geoKey}`);
      }
      GeoKeyDirectory.push(TIFFTagLocation);
      GeoKeyDirectory.push(Count);
      GeoKeyDirectory.push(valueOffset);
    });
    metadata.GeoKeyDirectory = GeoKeyDirectory;
  }

  // delete GeoKeys from metadata, because stored in GeoKeyDirectory tag
  for (const geoKey in geoKeys) {
    if (geoKeys.hasOwnProperty(geoKey)) {
      delete metadata[geoKey];
    }
  }

  [
    'Compression',
    'ExtraSamples',
    'GeographicTypeGeoKey',
    'GTModelTypeGeoKey',
    'GTRasterTypeGeoKey',
    'ImageLength', // synonym of ImageHeight
    'ImageWidth',
    'Orientation',
    'PhotometricInterpretation',
    'ProjectedCSTypeGeoKey',
    'PlanarConfiguration',
    'ResolutionUnit',
    'SamplesPerPixel',
    'XPosition',
    'YPosition',
  ].forEach((name) => {
    if (metadata[name]) {
      metadata[name] = toArray(metadata[name]);
    }
  });

  const encodedMetadata = convertToTids(metadata);

  const outputImage = encodeImage(flattenedValues, width, height, encodedMetadata);

  return outputImage;
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/globals.js":
/*!*****************************************************!*\
  !*** ./node_modules/geotiff/dist-module/globals.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExtraSamplesValues: () => (/* binding */ ExtraSamplesValues),
/* harmony export */   LercAddCompression: () => (/* binding */ LercAddCompression),
/* harmony export */   LercParameters: () => (/* binding */ LercParameters),
/* harmony export */   arrayFields: () => (/* binding */ arrayFields),
/* harmony export */   fieldTagNames: () => (/* binding */ fieldTagNames),
/* harmony export */   fieldTagTypes: () => (/* binding */ fieldTagTypes),
/* harmony export */   fieldTags: () => (/* binding */ fieldTags),
/* harmony export */   fieldTypeNames: () => (/* binding */ fieldTypeNames),
/* harmony export */   fieldTypes: () => (/* binding */ fieldTypes),
/* harmony export */   geoKeyNames: () => (/* binding */ geoKeyNames),
/* harmony export */   geoKeys: () => (/* binding */ geoKeys),
/* harmony export */   photometricInterpretations: () => (/* binding */ photometricInterpretations)
/* harmony export */ });
const fieldTagNames = {
  // TIFF Baseline
  0x013B: 'Artist',
  0x0102: 'BitsPerSample',
  0x0109: 'CellLength',
  0x0108: 'CellWidth',
  0x0140: 'ColorMap',
  0x0103: 'Compression',
  0x8298: 'Copyright',
  0x0132: 'DateTime',
  0x0152: 'ExtraSamples',
  0x010A: 'FillOrder',
  0x0121: 'FreeByteCounts',
  0x0120: 'FreeOffsets',
  0x0123: 'GrayResponseCurve',
  0x0122: 'GrayResponseUnit',
  0x013C: 'HostComputer',
  0x010E: 'ImageDescription',
  0x0101: 'ImageLength',
  0x0100: 'ImageWidth',
  0x010F: 'Make',
  0x0119: 'MaxSampleValue',
  0x0118: 'MinSampleValue',
  0x0110: 'Model',
  0x00FE: 'NewSubfileType',
  0x0112: 'Orientation',
  0x0106: 'PhotometricInterpretation',
  0x011C: 'PlanarConfiguration',
  0x0128: 'ResolutionUnit',
  0x0116: 'RowsPerStrip',
  0x0115: 'SamplesPerPixel',
  0x0131: 'Software',
  0x0117: 'StripByteCounts',
  0x0111: 'StripOffsets',
  0x00FF: 'SubfileType',
  0x0107: 'Threshholding',
  0x011A: 'XResolution',
  0x011B: 'YResolution',

  // TIFF Extended
  0x0146: 'BadFaxLines',
  0x0147: 'CleanFaxData',
  0x0157: 'ClipPath',
  0x0148: 'ConsecutiveBadFaxLines',
  0x01B1: 'Decode',
  0x01B2: 'DefaultImageColor',
  0x010D: 'DocumentName',
  0x0150: 'DotRange',
  0x0141: 'HalftoneHints',
  0x015A: 'Indexed',
  0x015B: 'JPEGTables',
  0x011D: 'PageName',
  0x0129: 'PageNumber',
  0x013D: 'Predictor',
  0x013F: 'PrimaryChromaticities',
  0x0214: 'ReferenceBlackWhite',
  0x0153: 'SampleFormat',
  0x0154: 'SMinSampleValue',
  0x0155: 'SMaxSampleValue',
  0x022F: 'StripRowCounts',
  0x014A: 'SubIFDs',
  0x0124: 'T4Options',
  0x0125: 'T6Options',
  0x0145: 'TileByteCounts',
  0x0143: 'TileLength',
  0x0144: 'TileOffsets',
  0x0142: 'TileWidth',
  0x012D: 'TransferFunction',
  0x013E: 'WhitePoint',
  0x0158: 'XClipPathUnits',
  0x011E: 'XPosition',
  0x0211: 'YCbCrCoefficients',
  0x0213: 'YCbCrPositioning',
  0x0212: 'YCbCrSubSampling',
  0x0159: 'YClipPathUnits',
  0x011F: 'YPosition',

  // EXIF
  0x9202: 'ApertureValue',
  0xA001: 'ColorSpace',
  0x9004: 'DateTimeDigitized',
  0x9003: 'DateTimeOriginal',
  0x8769: 'Exif IFD',
  0x9000: 'ExifVersion',
  0x829A: 'ExposureTime',
  0xA300: 'FileSource',
  0x9209: 'Flash',
  0xA000: 'FlashpixVersion',
  0x829D: 'FNumber',
  0xA420: 'ImageUniqueID',
  0x9208: 'LightSource',
  0x927C: 'MakerNote',
  0x9201: 'ShutterSpeedValue',
  0x9286: 'UserComment',

  // IPTC
  0x83BB: 'IPTC',

  // ICC
  0x8773: 'ICC Profile',

  // XMP
  0x02BC: 'XMP',

  // GDAL
  0xA480: 'GDAL_METADATA',
  0xA481: 'GDAL_NODATA',

  // Photoshop
  0x8649: 'Photoshop',

  // GeoTiff
  0x830E: 'ModelPixelScale',
  0x8482: 'ModelTiepoint',
  0x85D8: 'ModelTransformation',
  0x87AF: 'GeoKeyDirectory',
  0x87B0: 'GeoDoubleParams',
  0x87B1: 'GeoAsciiParams',

  // LERC
  0xC5F2: 'LercParameters',
};

const fieldTags = {};
for (const key in fieldTagNames) {
  if (fieldTagNames.hasOwnProperty(key)) {
    fieldTags[fieldTagNames[key]] = parseInt(key, 10);
  }
}

const fieldTagTypes = {
  256: 'SHORT',
  257: 'SHORT',
  258: 'SHORT',
  259: 'SHORT',
  262: 'SHORT',
  273: 'LONG',
  274: 'SHORT',
  277: 'SHORT',
  278: 'LONG',
  279: 'LONG',
  282: 'RATIONAL',
  283: 'RATIONAL',
  284: 'SHORT',
  286: 'SHORT',
  287: 'RATIONAL',
  296: 'SHORT',
  297: 'SHORT',
  305: 'ASCII',
  306: 'ASCII',
  338: 'SHORT',
  339: 'SHORT',
  513: 'LONG',
  514: 'LONG',
  1024: 'SHORT',
  1025: 'SHORT',
  2048: 'SHORT',
  2049: 'ASCII',
  3072: 'SHORT',
  3073: 'ASCII',
  33550: 'DOUBLE',
  33922: 'DOUBLE',
  34665: 'LONG',
  34735: 'SHORT',
  34737: 'ASCII',
  42113: 'ASCII',
};

const arrayFields = [
  fieldTags.BitsPerSample,
  fieldTags.ExtraSamples,
  fieldTags.SampleFormat,
  fieldTags.StripByteCounts,
  fieldTags.StripOffsets,
  fieldTags.StripRowCounts,
  fieldTags.TileByteCounts,
  fieldTags.TileOffsets,
  fieldTags.SubIFDs,
];

const fieldTypeNames = {
  0x0001: 'BYTE',
  0x0002: 'ASCII',
  0x0003: 'SHORT',
  0x0004: 'LONG',
  0x0005: 'RATIONAL',
  0x0006: 'SBYTE',
  0x0007: 'UNDEFINED',
  0x0008: 'SSHORT',
  0x0009: 'SLONG',
  0x000A: 'SRATIONAL',
  0x000B: 'FLOAT',
  0x000C: 'DOUBLE',
  // IFD offset, suggested by https://owl.phy.queensu.ca/~phil/exiftool/standards.html
  0x000D: 'IFD',
  // introduced by BigTIFF
  0x0010: 'LONG8',
  0x0011: 'SLONG8',
  0x0012: 'IFD8',
};

const fieldTypes = {};
for (const key in fieldTypeNames) {
  if (fieldTypeNames.hasOwnProperty(key)) {
    fieldTypes[fieldTypeNames[key]] = parseInt(key, 10);
  }
}

const photometricInterpretations = {
  WhiteIsZero: 0,
  BlackIsZero: 1,
  RGB: 2,
  Palette: 3,
  TransparencyMask: 4,
  CMYK: 5,
  YCbCr: 6,

  CIELab: 8,
  ICCLab: 9,
};

const ExtraSamplesValues = {
  Unspecified: 0,
  Assocalpha: 1,
  Unassalpha: 2,
};

const LercParameters = {
  Version: 0,
  AddCompression: 1,
};

const LercAddCompression = {
  None: 0,
  Deflate: 1,
};

const geoKeyNames = {
  1024: 'GTModelTypeGeoKey',
  1025: 'GTRasterTypeGeoKey',
  1026: 'GTCitationGeoKey',
  2048: 'GeographicTypeGeoKey',
  2049: 'GeogCitationGeoKey',
  2050: 'GeogGeodeticDatumGeoKey',
  2051: 'GeogPrimeMeridianGeoKey',
  2052: 'GeogLinearUnitsGeoKey',
  2053: 'GeogLinearUnitSizeGeoKey',
  2054: 'GeogAngularUnitsGeoKey',
  2055: 'GeogAngularUnitSizeGeoKey',
  2056: 'GeogEllipsoidGeoKey',
  2057: 'GeogSemiMajorAxisGeoKey',
  2058: 'GeogSemiMinorAxisGeoKey',
  2059: 'GeogInvFlatteningGeoKey',
  2060: 'GeogAzimuthUnitsGeoKey',
  2061: 'GeogPrimeMeridianLongGeoKey',
  2062: 'GeogTOWGS84GeoKey',
  3072: 'ProjectedCSTypeGeoKey',
  3073: 'PCSCitationGeoKey',
  3074: 'ProjectionGeoKey',
  3075: 'ProjCoordTransGeoKey',
  3076: 'ProjLinearUnitsGeoKey',
  3077: 'ProjLinearUnitSizeGeoKey',
  3078: 'ProjStdParallel1GeoKey',
  3079: 'ProjStdParallel2GeoKey',
  3080: 'ProjNatOriginLongGeoKey',
  3081: 'ProjNatOriginLatGeoKey',
  3082: 'ProjFalseEastingGeoKey',
  3083: 'ProjFalseNorthingGeoKey',
  3084: 'ProjFalseOriginLongGeoKey',
  3085: 'ProjFalseOriginLatGeoKey',
  3086: 'ProjFalseOriginEastingGeoKey',
  3087: 'ProjFalseOriginNorthingGeoKey',
  3088: 'ProjCenterLongGeoKey',
  3089: 'ProjCenterLatGeoKey',
  3090: 'ProjCenterEastingGeoKey',
  3091: 'ProjCenterNorthingGeoKey',
  3092: 'ProjScaleAtNatOriginGeoKey',
  3093: 'ProjScaleAtCenterGeoKey',
  3094: 'ProjAzimuthAngleGeoKey',
  3095: 'ProjStraightVertPoleLongGeoKey',
  3096: 'ProjRectifiedGridAngleGeoKey',
  4096: 'VerticalCSTypeGeoKey',
  4097: 'VerticalCitationGeoKey',
  4098: 'VerticalDatumGeoKey',
  4099: 'VerticalUnitsGeoKey',
};

const geoKeys = {};
for (const key in geoKeyNames) {
  if (geoKeyNames.hasOwnProperty(key)) {
    geoKeys[geoKeyNames[key]] = parseInt(key, 10);
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/logging.js":
/*!*****************************************************!*\
  !*** ./node_modules/geotiff/dist-module/logging.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug),
/* harmony export */   error: () => (/* binding */ error),
/* harmony export */   info: () => (/* binding */ info),
/* harmony export */   log: () => (/* binding */ log),
/* harmony export */   setLogger: () => (/* binding */ setLogger),
/* harmony export */   time: () => (/* binding */ time),
/* harmony export */   timeEnd: () => (/* binding */ timeEnd),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
/**
 * A no-op logger
 */
class DummyLogger {
  log() {}

  debug() {}

  info() {}

  warn() {}

  error() {}

  time() {}

  timeEnd() {}
}

let LOGGER = new DummyLogger();

/**
 *
 * @param {object} logger the new logger. e.g `console`
 */
function setLogger(logger = new DummyLogger()) {
  LOGGER = logger;
}

function debug(...args) {
  return LOGGER.debug(...args);
}

function log(...args) {
  return LOGGER.log(...args);
}

function info(...args) {
  return LOGGER.info(...args);
}

function warn(...args) {
  return LOGGER.warn(...args);
}

function error(...args) {
  return LOGGER.error(...args);
}

function time(...args) {
  return LOGGER.time(...args);
}

function timeEnd(...args) {
  return LOGGER.timeEnd(...args);
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/pool.js":
/*!**************************************************!*\
  !*** ./node_modules/geotiff/dist-module/pool.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _compression_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compression/index.js */ "./node_modules/geotiff/dist-module/compression/index.js");


const defaultPoolSize = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 2) : 2;

/**
 * @module pool
 */

/**
 * Pool for workers to decode chunks of the images.
 */
class Pool {
  /**
   * @constructor
   * @param {Number} [size] The size of the pool. Defaults to the number of CPUs
   *                      available. When this parameter is `null` or 0, then the
   *                      decoding will be done in the main thread.
   * @param {function(): Worker} [createWorker] A function that creates the decoder worker.
   * Defaults to a worker with all decoders that ship with geotiff.js. The `createWorker()`
   * function is expected to return a `Worker` compatible with Web Workers. For code that
   * runs in Node, [web-worker](https://www.npmjs.com/package/web-worker) is a good choice.
   *
   * A worker that uses a custom lzw decoder would look like this `my-custom-worker.js` file:
   * ```js
   * import { addDecoder, getDecoder } from 'geotiff';
   * addDecoder(5, () => import ('./my-custom-lzw').then((m) => m.default));
   * self.addEventListener('message', async (e) => {
   *   const { id, fileDirectory, buffer } = e.data;
   *   const decoder = await getDecoder(fileDirectory);
   *   const decoded = await decoder.decode(fileDirectory, buffer);
   *   self.postMessage({ decoded, id }, [decoded]);
   * });
   * ```
   * The way the above code is built into a worker by the `createWorker()` function
   * depends on the used bundler. For most bundlers, something like this will work:
   * ```js
   * function createWorker() {
   *   return new Worker(new URL('./my-custom-worker.js', import.meta.url));
   * }
   * ```
   */
  constructor(size = defaultPoolSize, createWorker) {
    this.workers = null;
    this._awaitingDecoder = null;
    this.size = size;
    this.messageId = 0;
    if (size) {
      this._awaitingDecoder = createWorker ? Promise.resolve(createWorker) : new Promise((resolve) => {
        __webpack_require__.e(/*! import() */ "vendors-node_modules_geotiff_dist-module_worker_decoder_js").then(__webpack_require__.bind(__webpack_require__, /*! ./worker/decoder.js */ "./node_modules/geotiff/dist-module/worker/decoder.js")).then((module) => {
          resolve(module.create);
        });
      });
      this._awaitingDecoder.then((create) => {
        this._awaitingDecoder = null;
        this.workers = [];
        for (let i = 0; i < size; i++) {
          this.workers.push({ worker: create(), idle: true });
        }
      });
    }
  }

  /**
   * Decode the given block of bytes with the set compression method.
   * @param {ArrayBuffer} buffer the array buffer of bytes to decode.
   * @returns {Promise<ArrayBuffer>} the decoded result as a `Promise`
   */
  async decode(fileDirectory, buffer) {
    if (this._awaitingDecoder) {
      await this._awaitingDecoder;
    }
    return this.size === 0
      ? (0,_compression_index_js__WEBPACK_IMPORTED_MODULE_0__.getDecoder)(fileDirectory).then((decoder) => decoder.decode(fileDirectory, buffer))
      : new Promise((resolve) => {
        const worker = this.workers.find((candidate) => candidate.idle)
          || this.workers[Math.floor(Math.random() * this.size)];
        worker.idle = false;
        const id = this.messageId++;
        const onMessage = (e) => {
          if (e.data.id === id) {
            worker.idle = true;
            resolve(e.data.decoded);
            worker.worker.removeEventListener('message', onMessage);
          }
        };
        worker.worker.addEventListener('message', onMessage);
        worker.worker.postMessage({ fileDirectory, buffer, id }, [buffer]);
      });
  }

  destroy() {
    if (this.workers) {
      this.workers.forEach((worker) => {
        worker.worker.terminate();
      });
      this.workers = null;
    }
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Pool);


/***/ }),

/***/ "./node_modules/geotiff/dist-module/predictor.js":
/*!*******************************************************!*\
  !*** ./node_modules/geotiff/dist-module/predictor.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyPredictor: () => (/* binding */ applyPredictor)
/* harmony export */ });
function decodeRowAcc(row, stride) {
  let length = row.length - stride;
  let offset = 0;
  do {
    for (let i = stride; i > 0; i--) {
      row[offset + stride] += row[offset];
      offset++;
    }

    length -= stride;
  } while (length > 0);
}

function decodeRowFloatingPoint(row, stride, bytesPerSample) {
  let index = 0;
  let count = row.length;
  const wc = count / bytesPerSample;

  while (count > stride) {
    for (let i = stride; i > 0; --i) {
      row[index + stride] += row[index];
      ++index;
    }
    count -= stride;
  }

  const copy = row.slice();
  for (let i = 0; i < wc; ++i) {
    for (let b = 0; b < bytesPerSample; ++b) {
      row[(bytesPerSample * i) + b] = copy[((bytesPerSample - b - 1) * wc) + i];
    }
  }
}

function applyPredictor(block, predictor, width, height, bitsPerSample,
  planarConfiguration) {
  if (!predictor || predictor === 1) {
    return block;
  }

  for (let i = 0; i < bitsPerSample.length; ++i) {
    if (bitsPerSample[i] % 8 !== 0) {
      throw new Error('When decoding with predictor, only multiple of 8 bits are supported.');
    }
    if (bitsPerSample[i] !== bitsPerSample[0]) {
      throw new Error('When decoding with predictor, all samples must have the same size.');
    }
  }

  const bytesPerSample = bitsPerSample[0] / 8;
  const stride = planarConfiguration === 2 ? 1 : bitsPerSample.length;

  for (let i = 0; i < height; ++i) {
    // Last strip will be truncated if height % stripHeight != 0
    if (i * stride * width * bytesPerSample >= block.byteLength) {
      break;
    }
    let row;
    if (predictor === 2) { // horizontal prediction
      switch (bitsPerSample[0]) {
        case 8:
          row = new Uint8Array(
            block, i * stride * width * bytesPerSample, stride * width * bytesPerSample,
          );
          break;
        case 16:
          row = new Uint16Array(
            block, i * stride * width * bytesPerSample, stride * width * bytesPerSample / 2,
          );
          break;
        case 32:
          row = new Uint32Array(
            block, i * stride * width * bytesPerSample, stride * width * bytesPerSample / 4,
          );
          break;
        default:
          throw new Error(`Predictor 2 not allowed with ${bitsPerSample[0]} bits per sample.`);
      }
      decodeRowAcc(row, stride, bytesPerSample);
    } else if (predictor === 3) { // horizontal floating point
      row = new Uint8Array(
        block, i * stride * width * bytesPerSample, stride * width * bytesPerSample,
      );
      decodeRowFloatingPoint(row, stride, bytesPerSample);
    }
  }
  return block;
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/resample.js":
/*!******************************************************!*\
  !*** ./node_modules/geotiff/dist-module/resample.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resample: () => (/* binding */ resample),
/* harmony export */   resampleBilinear: () => (/* binding */ resampleBilinear),
/* harmony export */   resampleBilinearInterleaved: () => (/* binding */ resampleBilinearInterleaved),
/* harmony export */   resampleInterleaved: () => (/* binding */ resampleInterleaved),
/* harmony export */   resampleNearest: () => (/* binding */ resampleNearest),
/* harmony export */   resampleNearestInterleaved: () => (/* binding */ resampleNearestInterleaved)
/* harmony export */ });
/**
 * @module resample
 */

function copyNewSize(array, width, height, samplesPerPixel = 1) {
  return new (Object.getPrototypeOf(array).constructor)(width * height * samplesPerPixel);
}

/**
 * Resample the input arrays using nearest neighbor value selection.
 * @param {TypedArray[]} valueArrays The input arrays to resample
 * @param {number} inWidth The width of the input rasters
 * @param {number} inHeight The height of the input rasters
 * @param {number} outWidth The desired width of the output rasters
 * @param {number} outHeight The desired height of the output rasters
 * @returns {TypedArray[]} The resampled rasters
 */
function resampleNearest(valueArrays, inWidth, inHeight, outWidth, outHeight) {
  const relX = inWidth / outWidth;
  const relY = inHeight / outHeight;
  return valueArrays.map((array) => {
    const newArray = copyNewSize(array, outWidth, outHeight);
    for (let y = 0; y < outHeight; ++y) {
      const cy = Math.min(Math.round(relY * y), inHeight - 1);
      for (let x = 0; x < outWidth; ++x) {
        const cx = Math.min(Math.round(relX * x), inWidth - 1);
        const value = array[(cy * inWidth) + cx];
        newArray[(y * outWidth) + x] = value;
      }
    }
    return newArray;
  });
}

// simple linear interpolation, code from:
// https://en.wikipedia.org/wiki/Linear_interpolation#Programming_language_support
function lerp(v0, v1, t) {
  return ((1 - t) * v0) + (t * v1);
}

/**
 * Resample the input arrays using bilinear interpolation.
 * @param {TypedArray[]} valueArrays The input arrays to resample
 * @param {number} inWidth The width of the input rasters
 * @param {number} inHeight The height of the input rasters
 * @param {number} outWidth The desired width of the output rasters
 * @param {number} outHeight The desired height of the output rasters
 * @returns {TypedArray[]} The resampled rasters
 */
function resampleBilinear(valueArrays, inWidth, inHeight, outWidth, outHeight) {
  const relX = inWidth / outWidth;
  const relY = inHeight / outHeight;

  return valueArrays.map((array) => {
    const newArray = copyNewSize(array, outWidth, outHeight);
    for (let y = 0; y < outHeight; ++y) {
      const rawY = relY * y;

      const yl = Math.floor(rawY);
      const yh = Math.min(Math.ceil(rawY), (inHeight - 1));

      for (let x = 0; x < outWidth; ++x) {
        const rawX = relX * x;
        const tx = rawX % 1;

        const xl = Math.floor(rawX);
        const xh = Math.min(Math.ceil(rawX), (inWidth - 1));

        const ll = array[(yl * inWidth) + xl];
        const hl = array[(yl * inWidth) + xh];
        const lh = array[(yh * inWidth) + xl];
        const hh = array[(yh * inWidth) + xh];

        const value = lerp(
          lerp(ll, hl, tx),
          lerp(lh, hh, tx),
          rawY % 1,
        );
        newArray[(y * outWidth) + x] = value;
      }
    }
    return newArray;
  });
}

/**
 * Resample the input arrays using the selected resampling method.
 * @param {TypedArray[]} valueArrays The input arrays to resample
 * @param {number} inWidth The width of the input rasters
 * @param {number} inHeight The height of the input rasters
 * @param {number} outWidth The desired width of the output rasters
 * @param {number} outHeight The desired height of the output rasters
 * @param {string} [method = 'nearest'] The desired resampling method
 * @returns {TypedArray[]} The resampled rasters
 */
function resample(valueArrays, inWidth, inHeight, outWidth, outHeight, method = 'nearest') {
  switch (method.toLowerCase()) {
    case 'nearest':
      return resampleNearest(valueArrays, inWidth, inHeight, outWidth, outHeight);
    case 'bilinear':
    case 'linear':
      return resampleBilinear(valueArrays, inWidth, inHeight, outWidth, outHeight);
    default:
      throw new Error(`Unsupported resampling method: '${method}'`);
  }
}

/**
 * Resample the pixel interleaved input array using nearest neighbor value selection.
 * @param {TypedArray} valueArrays The input arrays to resample
 * @param {number} inWidth The width of the input rasters
 * @param {number} inHeight The height of the input rasters
 * @param {number} outWidth The desired width of the output rasters
 * @param {number} outHeight The desired height of the output rasters
 * @param {number} samples The number of samples per pixel for pixel
 *                         interleaved data
 * @returns {TypedArray} The resampled raster
 */
function resampleNearestInterleaved(
  valueArray, inWidth, inHeight, outWidth, outHeight, samples) {
  const relX = inWidth / outWidth;
  const relY = inHeight / outHeight;

  const newArray = copyNewSize(valueArray, outWidth, outHeight, samples);
  for (let y = 0; y < outHeight; ++y) {
    const cy = Math.min(Math.round(relY * y), inHeight - 1);
    for (let x = 0; x < outWidth; ++x) {
      const cx = Math.min(Math.round(relX * x), inWidth - 1);
      for (let i = 0; i < samples; ++i) {
        const value = valueArray[(cy * inWidth * samples) + (cx * samples) + i];
        newArray[(y * outWidth * samples) + (x * samples) + i] = value;
      }
    }
  }
  return newArray;
}

/**
 * Resample the pixel interleaved input array using bilinear interpolation.
 * @param {TypedArray} valueArrays The input arrays to resample
 * @param {number} inWidth The width of the input rasters
 * @param {number} inHeight The height of the input rasters
 * @param {number} outWidth The desired width of the output rasters
 * @param {number} outHeight The desired height of the output rasters
 * @param {number} samples The number of samples per pixel for pixel
 *                         interleaved data
 * @returns {TypedArray} The resampled raster
 */
function resampleBilinearInterleaved(
  valueArray, inWidth, inHeight, outWidth, outHeight, samples) {
  const relX = inWidth / outWidth;
  const relY = inHeight / outHeight;
  const newArray = copyNewSize(valueArray, outWidth, outHeight, samples);
  for (let y = 0; y < outHeight; ++y) {
    const rawY = relY * y;

    const yl = Math.floor(rawY);
    const yh = Math.min(Math.ceil(rawY), (inHeight - 1));

    for (let x = 0; x < outWidth; ++x) {
      const rawX = relX * x;
      const tx = rawX % 1;

      const xl = Math.floor(rawX);
      const xh = Math.min(Math.ceil(rawX), (inWidth - 1));

      for (let i = 0; i < samples; ++i) {
        const ll = valueArray[(yl * inWidth * samples) + (xl * samples) + i];
        const hl = valueArray[(yl * inWidth * samples) + (xh * samples) + i];
        const lh = valueArray[(yh * inWidth * samples) + (xl * samples) + i];
        const hh = valueArray[(yh * inWidth * samples) + (xh * samples) + i];

        const value = lerp(
          lerp(ll, hl, tx),
          lerp(lh, hh, tx),
          rawY % 1,
        );
        newArray[(y * outWidth * samples) + (x * samples) + i] = value;
      }
    }
  }
  return newArray;
}

/**
 * Resample the pixel interleaved input array using the selected resampling method.
 * @param {TypedArray} valueArray The input array to resample
 * @param {number} inWidth The width of the input rasters
 * @param {number} inHeight The height of the input rasters
 * @param {number} outWidth The desired width of the output rasters
 * @param {number} outHeight The desired height of the output rasters
 * @param {number} samples The number of samples per pixel for pixel
 *                                 interleaved data
 * @param {string} [method = 'nearest'] The desired resampling method
 * @returns {TypedArray} The resampled rasters
 */
function resampleInterleaved(valueArray, inWidth, inHeight, outWidth, outHeight, samples, method = 'nearest') {
  switch (method.toLowerCase()) {
    case 'nearest':
      return resampleNearestInterleaved(
        valueArray, inWidth, inHeight, outWidth, outHeight, samples,
      );
    case 'bilinear':
    case 'linear':
      return resampleBilinearInterleaved(
        valueArray, inWidth, inHeight, outWidth, outHeight, samples,
      );
    default:
      throw new Error(`Unsupported resampling method: '${method}'`);
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/rgb.js":
/*!*************************************************!*\
  !*** ./node_modules/geotiff/dist-module/rgb.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromBlackIsZero: () => (/* binding */ fromBlackIsZero),
/* harmony export */   fromCIELab: () => (/* binding */ fromCIELab),
/* harmony export */   fromCMYK: () => (/* binding */ fromCMYK),
/* harmony export */   fromPalette: () => (/* binding */ fromPalette),
/* harmony export */   fromWhiteIsZero: () => (/* binding */ fromWhiteIsZero),
/* harmony export */   fromYCbCr: () => (/* binding */ fromYCbCr)
/* harmony export */ });
function fromWhiteIsZero(raster, max) {
  const { width, height } = raster;
  const rgbRaster = new Uint8Array(width * height * 3);
  let value;
  for (let i = 0, j = 0; i < raster.length; ++i, j += 3) {
    value = 256 - (raster[i] / max * 256);
    rgbRaster[j] = value;
    rgbRaster[j + 1] = value;
    rgbRaster[j + 2] = value;
  }
  return rgbRaster;
}

function fromBlackIsZero(raster, max) {
  const { width, height } = raster;
  const rgbRaster = new Uint8Array(width * height * 3);
  let value;
  for (let i = 0, j = 0; i < raster.length; ++i, j += 3) {
    value = raster[i] / max * 256;
    rgbRaster[j] = value;
    rgbRaster[j + 1] = value;
    rgbRaster[j + 2] = value;
  }
  return rgbRaster;
}

function fromPalette(raster, colorMap) {
  const { width, height } = raster;
  const rgbRaster = new Uint8Array(width * height * 3);
  const greenOffset = colorMap.length / 3;
  const blueOffset = colorMap.length / 3 * 2;
  for (let i = 0, j = 0; i < raster.length; ++i, j += 3) {
    const mapIndex = raster[i];
    rgbRaster[j] = colorMap[mapIndex] / 65536 * 256;
    rgbRaster[j + 1] = colorMap[mapIndex + greenOffset] / 65536 * 256;
    rgbRaster[j + 2] = colorMap[mapIndex + blueOffset] / 65536 * 256;
  }
  return rgbRaster;
}

function fromCMYK(cmykRaster) {
  const { width, height } = cmykRaster;
  const rgbRaster = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < cmykRaster.length; i += 4, j += 3) {
    const c = cmykRaster[i];
    const m = cmykRaster[i + 1];
    const y = cmykRaster[i + 2];
    const k = cmykRaster[i + 3];

    rgbRaster[j] = 255 * ((255 - c) / 256) * ((255 - k) / 256);
    rgbRaster[j + 1] = 255 * ((255 - m) / 256) * ((255 - k) / 256);
    rgbRaster[j + 2] = 255 * ((255 - y) / 256) * ((255 - k) / 256);
  }
  return rgbRaster;
}

function fromYCbCr(yCbCrRaster) {
  const { width, height } = yCbCrRaster;
  const rgbRaster = new Uint8ClampedArray(width * height * 3);
  for (let i = 0, j = 0; i < yCbCrRaster.length; i += 3, j += 3) {
    const y = yCbCrRaster[i];
    const cb = yCbCrRaster[i + 1];
    const cr = yCbCrRaster[i + 2];

    rgbRaster[j] = (y + (1.40200 * (cr - 0x80)));
    rgbRaster[j + 1] = (y - (0.34414 * (cb - 0x80)) - (0.71414 * (cr - 0x80)));
    rgbRaster[j + 2] = (y + (1.77200 * (cb - 0x80)));
  }
  return rgbRaster;
}

const Xn = 0.95047;
const Yn = 1.00000;
const Zn = 1.08883;

// from https://github.com/antimatter15/rgb-lab/blob/master/color.js

function fromCIELab(cieLabRaster) {
  const { width, height } = cieLabRaster;
  const rgbRaster = new Uint8Array(width * height * 3);

  for (let i = 0, j = 0; i < cieLabRaster.length; i += 3, j += 3) {
    const L = cieLabRaster[i + 0];
    const a_ = cieLabRaster[i + 1] << 24 >> 24; // conversion from uint8 to int8
    const b_ = cieLabRaster[i + 2] << 24 >> 24; // same

    let y = (L + 16) / 116;
    let x = (a_ / 500) + y;
    let z = y - (b_ / 200);
    let r;
    let g;
    let b;

    x = Xn * ((x * x * x > 0.008856) ? x * x * x : (x - (16 / 116)) / 7.787);
    y = Yn * ((y * y * y > 0.008856) ? y * y * y : (y - (16 / 116)) / 7.787);
    z = Zn * ((z * z * z > 0.008856) ? z * z * z : (z - (16 / 116)) / 7.787);

    r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
    g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
    b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

    r = (r > 0.0031308) ? ((1.055 * (r ** (1 / 2.4))) - 0.055) : 12.92 * r;
    g = (g > 0.0031308) ? ((1.055 * (g ** (1 / 2.4))) - 0.055) : 12.92 * g;
    b = (b > 0.0031308) ? ((1.055 * (b ** (1 / 2.4))) - 0.055) : 12.92 * b;

    rgbRaster[j] = Math.max(0, Math.min(1, r)) * 255;
    rgbRaster[j + 1] = Math.max(0, Math.min(1, g)) * 255;
    rgbRaster[j + 2] = Math.max(0, Math.min(1, b)) * 255;
  }
  return rgbRaster;
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/arraybuffer.js":
/*!****************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/arraybuffer.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeBufferSource: () => (/* binding */ makeBufferSource)
/* harmony export */ });
/* harmony import */ var _basesource_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./basesource.js */ "./node_modules/geotiff/dist-module/source/basesource.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./node_modules/geotiff/dist-module/utils.js");



class ArrayBufferSource extends _basesource_js__WEBPACK_IMPORTED_MODULE_0__.BaseSource {
  constructor(arrayBuffer) {
    super();
    this.arrayBuffer = arrayBuffer;
  }

  fetchSlice(slice, signal) {
    if (signal && signal.aborted) {
      throw new _utils_js__WEBPACK_IMPORTED_MODULE_1__.AbortError('Request aborted');
    }
    return this.arrayBuffer.slice(slice.offset, slice.offset + slice.length);
  }
}

function makeBufferSource(arrayBuffer) {
  return new ArrayBufferSource(arrayBuffer);
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/basesource.js":
/*!***************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/basesource.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseSource: () => (/* binding */ BaseSource)
/* harmony export */ });
/**
 * @typedef Slice
 * @property {number} offset
 * @property {number} length
 */

class BaseSource {
  /**
   *
   * @param {Slice[]} slices
   * @returns {ArrayBuffer[]}
   */
  async fetch(slices, signal = undefined) {
    return Promise.all(
      slices.map((slice) => this.fetchSlice(slice, signal)),
    );
  }

  /**
   *
   * @param {Slice} slice
   * @returns {ArrayBuffer}
   */
  async fetchSlice(slice) {
    throw new Error(`fetching of slice ${slice} not possible, not implemented`);
  }

  /**
   * Returns the filesize if already determined and null otherwise
   */
  get fileSize() {
    return null;
  }

  async close() {
    // no-op by default
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/blockedsource.js":
/*!******************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/blockedsource.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockedSource: () => (/* binding */ BlockedSource)
/* harmony export */ });
/* harmony import */ var quick_lru__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quick-lru */ "./node_modules/quick-lru/index.js");
/* harmony import */ var _basesource_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./basesource.js */ "./node_modules/geotiff/dist-module/source/basesource.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./node_modules/geotiff/dist-module/utils.js");




class Block {
  /**
   *
   * @param {number} offset
   * @param {number} length
   * @param {ArrayBuffer} [data]
   */
  constructor(offset, length, data = null) {
    this.offset = offset;
    this.length = length;
    this.data = data;
  }

  /**
   * @returns {number} the top byte border
   */
  get top() {
    return this.offset + this.length;
  }
}

class BlockGroup {
  /**
   *
   * @param {number} offset
   * @param {number} length
   * @param {number[]} blockIds
   */
  constructor(offset, length, blockIds) {
    this.offset = offset;
    this.length = length;
    this.blockIds = blockIds;
  }
}

class BlockedSource extends _basesource_js__WEBPACK_IMPORTED_MODULE_1__.BaseSource {
  /**
   *
   * @param {BaseSource} source The underlying source that shall be blocked and cached
   * @param {object} options
   * @param {number} [options.blockSize]
   * @param {number} [options.cacheSize]
   */
  constructor(source, { blockSize = 65536, cacheSize = 100 } = {}) {
    super();
    this.source = source;
    this.blockSize = blockSize;

    this.blockCache = new quick_lru__WEBPACK_IMPORTED_MODULE_0__["default"]({
      maxSize: cacheSize,
      onEviction: (blockId, block) => {
        this.evictedBlocks.set(blockId, block);
      },
    });

    /** @type {Map<number, Block>} */
    this.evictedBlocks = new Map();

    // mapping blockId -> Block instance
    this.blockRequests = new Map();

    // set of blockIds missing for the current requests
    this.blockIdsToFetch = new Set();

    this.abortedBlockIds = new Set();
  }

  get fileSize() {
    return this.source.fileSize;
  }

  /**
   *
   * @param {import("./basesource").Slice[]} slices
   */
  async fetch(slices, signal) {
    const blockRequests = [];
    const missingBlockIds = [];
    const allBlockIds = [];
    this.evictedBlocks.clear();

    for (const { offset, length } of slices) {
      let top = offset + length;

      const { fileSize } = this;
      if (fileSize !== null) {
        top = Math.min(top, fileSize);
      }

      const firstBlockOffset = Math.floor(offset / this.blockSize) * this.blockSize;

      for (let current = firstBlockOffset; current < top; current += this.blockSize) {
        const blockId = Math.floor(current / this.blockSize);
        if (!this.blockCache.has(blockId) && !this.blockRequests.has(blockId)) {
          this.blockIdsToFetch.add(blockId);
          missingBlockIds.push(blockId);
        }
        if (this.blockRequests.has(blockId)) {
          blockRequests.push(this.blockRequests.get(blockId));
        }
        allBlockIds.push(blockId);
      }
    }

    // allow additional block requests to accumulate
    await (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.wait)();
    this.fetchBlocks(signal);

    // Gather all of the new requests that this fetch call is contributing to `fetch`.
    const missingRequests = [];
    for (const blockId of missingBlockIds) {
      // The requested missing block could already be in the cache
      // instead of having its request still be outstanding.
      if (this.blockRequests.has(blockId)) {
        missingRequests.push(this.blockRequests.get(blockId));
      }
    }

    // Actually await all pending requests that are needed for this `fetch`.
    await Promise.allSettled(blockRequests);
    await Promise.allSettled(missingRequests);

    // Perform retries if a block was interrupted by a previous signal
    const abortedBlockRequests = [];
    const abortedBlockIds = allBlockIds
      .filter((id) => this.abortedBlockIds.has(id) || !this.blockCache.has(id));
    abortedBlockIds.forEach((id) => this.blockIdsToFetch.add(id));
    // start the retry of some blocks if required
    if (abortedBlockIds.length > 0 && signal && !signal.aborted) {
      this.fetchBlocks(null);
      for (const blockId of abortedBlockIds) {
        const block = this.blockRequests.get(blockId);
        if (!block) {
          throw new Error(`Block ${blockId} is not in the block requests`);
        }
        abortedBlockRequests.push(block);
      }
      await Promise.allSettled(abortedBlockRequests);
    }

    // throw an  abort error
    if (signal && signal.aborted) {
      throw new _utils_js__WEBPACK_IMPORTED_MODULE_2__.AbortError('Request was aborted');
    }

    const blocks = allBlockIds.map((id) => this.blockCache.get(id) || this.evictedBlocks.get(id));
    const failedBlocks = blocks.filter((i) => !i);
    if (failedBlocks.length) {
      throw new _utils_js__WEBPACK_IMPORTED_MODULE_2__.AggregateError(failedBlocks, 'Request failed');
    }

    // create a final Map, with all required blocks for this request to satisfy
    const requiredBlocks = new Map((0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.zip)(allBlockIds, blocks));

    // TODO: satisfy each slice
    return this.readSliceData(slices, requiredBlocks);
  }

  /**
   *
   * @param {AbortSignal} signal
   */
  fetchBlocks(signal) {
    // check if we still need to
    if (this.blockIdsToFetch.size > 0) {
      const groups = this.groupBlocks(this.blockIdsToFetch);

      // start requesting slices of data
      const groupRequests = this.source.fetch(groups, signal);

      for (let groupIndex = 0; groupIndex < groups.length; ++groupIndex) {
        const group = groups[groupIndex];

        for (const blockId of group.blockIds) {
          // make an async IIFE for each block
          this.blockRequests.set(blockId, (async () => {
            try {
              const response = (await groupRequests)[groupIndex];
              const blockOffset = blockId * this.blockSize;
              const o = blockOffset - response.offset;
              const t = Math.min(o + this.blockSize, response.data.byteLength);
              const data = response.data.slice(o, t);
              const block = new Block(
                blockOffset,
                data.byteLength,
                data,
                blockId,
              );
              this.blockCache.set(blockId, block);
              this.abortedBlockIds.delete(blockId);
            } catch (err) {
              if (err.name === 'AbortError') {
                // store the signal here, we need it to determine later if an
                // error was caused by this signal
                err.signal = signal;
                this.blockCache.delete(blockId);
                this.abortedBlockIds.add(blockId);
              } else {
                throw err;
              }
            } finally {
              this.blockRequests.delete(blockId);
            }
          })());
        }
      }
      this.blockIdsToFetch.clear();
    }
  }

  /**
   *
   * @param {Set} blockIds
   * @returns {BlockGroup[]}
   */
  groupBlocks(blockIds) {
    const sortedBlockIds = Array.from(blockIds).sort((a, b) => a - b);
    if (sortedBlockIds.length === 0) {
      return [];
    }
    let current = [];
    let lastBlockId = null;
    const groups = [];

    for (const blockId of sortedBlockIds) {
      if (lastBlockId === null || lastBlockId + 1 === blockId) {
        current.push(blockId);
        lastBlockId = blockId;
      } else {
        groups.push(new BlockGroup(
          current[0] * this.blockSize,
          current.length * this.blockSize,
          current,
        ));
        current = [blockId];
        lastBlockId = blockId;
      }
    }

    groups.push(new BlockGroup(
      current[0] * this.blockSize,
      current.length * this.blockSize,
      current,
    ));

    return groups;
  }

  /**
   *
   * @param {import("./basesource").Slice[]} slices
   * @param {Map} blocks
   */
  readSliceData(slices, blocks) {
    return slices.map((slice) => {
      let top = slice.offset + slice.length;
      if (this.fileSize !== null) {
        top = Math.min(this.fileSize, top);
      }
      const blockIdLow = Math.floor(slice.offset / this.blockSize);
      const blockIdHigh = Math.floor(top / this.blockSize);
      const sliceData = new ArrayBuffer(slice.length);
      const sliceView = new Uint8Array(sliceData);

      for (let blockId = blockIdLow; blockId <= blockIdHigh; ++blockId) {
        const block = blocks.get(blockId);
        const delta = block.offset - slice.offset;
        const topDelta = block.top - top;
        let blockInnerOffset = 0;
        let rangeInnerOffset = 0;
        let usedBlockLength;

        if (delta < 0) {
          blockInnerOffset = -delta;
        } else if (delta > 0) {
          rangeInnerOffset = delta;
        }

        if (topDelta < 0) {
          usedBlockLength = block.length - blockInnerOffset;
        } else {
          usedBlockLength = top - block.offset - blockInnerOffset;
        }

        const blockView = new Uint8Array(block.data, blockInnerOffset, usedBlockLength);
        sliceView.set(blockView, rangeInnerOffset);
      }

      return sliceData;
    });
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/client/base.js":
/*!****************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/client/base.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseClient: () => (/* binding */ BaseClient),
/* harmony export */   BaseResponse: () => (/* binding */ BaseResponse)
/* harmony export */ });
class BaseResponse {
  /**
   * Returns whether the response has an ok'ish status code
   */
  get ok() {
    return this.status >= 200 && this.status <= 299;
  }

  /**
   * Returns the status code of the response
   */
  get status() {
    throw new Error('not implemented');
  }

  /**
   * Returns the value of the specified header
   * @param {string} headerName the header name
   * @returns {string} the header value
   */
  getHeader(headerName) { // eslint-disable-line no-unused-vars
    throw new Error('not implemented');
  }

  /**
   * @returns {ArrayBuffer} the response data of the request
   */
  async getData() {
    throw new Error('not implemented');
  }
}

class BaseClient {
  constructor(url) {
    this.url = url;
  }

  /**
   * Send a request with the options
   * @param {object} [options]
   */
  async request({ headers, credentials, signal } = {}) { // eslint-disable-line no-unused-vars
    throw new Error('request is not implemented');
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/client/fetch.js":
/*!*****************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/client/fetch.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FetchClient: () => (/* binding */ FetchClient)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/geotiff/dist-module/source/client/base.js");


class FetchResponse extends _base_js__WEBPACK_IMPORTED_MODULE_0__.BaseResponse {
  /**
   * BaseResponse facade for fetch API Response
   * @param {Response} response
   */
  constructor(response) {
    super();
    this.response = response;
  }

  get status() {
    return this.response.status;
  }

  getHeader(name) {
    return this.response.headers.get(name);
  }

  async getData() {
    const data = this.response.arrayBuffer
      ? await this.response.arrayBuffer()
      : (await this.response.buffer()).buffer;
    return data;
  }
}

class FetchClient extends _base_js__WEBPACK_IMPORTED_MODULE_0__.BaseClient {
  constructor(url, credentials) {
    super(url);
    this.credentials = credentials;
  }

  async request({ headers, credentials, signal } = {}) {
    const response = await fetch(this.url, {
      headers, credentials, signal,
    });
    return new FetchResponse(response);
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/client/http.js":
/*!****************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/client/http.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HttpClient: () => (/* binding */ HttpClient)
/* harmony export */ });
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! http */ "?cdec");
/* harmony import */ var https__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! https */ "?753a");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! url */ "?4e4d");
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./base.js */ "./node_modules/geotiff/dist-module/source/client/base.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils.js */ "./node_modules/geotiff/dist-module/utils.js");







class HttpResponse extends _base_js__WEBPACK_IMPORTED_MODULE_3__.BaseResponse {
  /**
   * BaseResponse facade for node HTTP/HTTPS API Response
   * @param {http.ServerResponse} response
   */
  constructor(response, dataPromise) {
    super();
    this.response = response;
    this.dataPromise = dataPromise;
  }

  get status() {
    return this.response.statusCode;
  }

  getHeader(name) {
    return this.response.headers[name];
  }

  async getData() {
    const data = await this.dataPromise;
    return data;
  }
}

class HttpClient extends _base_js__WEBPACK_IMPORTED_MODULE_3__.BaseClient {
  constructor(url) {
    super(url);
    this.parsedUrl = url__WEBPACK_IMPORTED_MODULE_2__.parse(this.url);
    this.httpApi = (this.parsedUrl.protocol === 'http:' ? http__WEBPACK_IMPORTED_MODULE_0__ : https__WEBPACK_IMPORTED_MODULE_1__);
  }

  constructRequest(headers, signal) {
    return new Promise((resolve, reject) => {
      const request = this.httpApi.get(
        {
          ...this.parsedUrl,
          headers,
        },
        (response) => {
          const dataPromise = new Promise((resolveData) => {
            const chunks = [];

            // collect chunks
            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            // concatenate all chunks and resolve the promise with the resulting buffer
            response.on('end', () => {
              const data = Buffer.concat(chunks).buffer;
              resolveData(data);
            });
            response.on('error', reject);
          });
          resolve(new HttpResponse(response, dataPromise));
        },
      );
      request.on('error', reject);

      if (signal) {
        if (signal.aborted) {
          request.destroy(new _utils_js__WEBPACK_IMPORTED_MODULE_4__.AbortError('Request aborted'));
        }
        signal.addEventListener('abort', () => request.destroy(new _utils_js__WEBPACK_IMPORTED_MODULE_4__.AbortError('Request aborted')));
      }
    });
  }

  async request({ headers, signal } = {}) {
    const response = await this.constructRequest(headers, signal);
    return response;
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/client/xhr.js":
/*!***************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/client/xhr.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   XHRClient: () => (/* binding */ XHRClient)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/geotiff/dist-module/source/client/base.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils.js */ "./node_modules/geotiff/dist-module/utils.js");



class XHRResponse extends _base_js__WEBPACK_IMPORTED_MODULE_0__.BaseResponse {
  /**
   * BaseResponse facade for XMLHttpRequest
   * @param {XMLHttpRequest} xhr
   * @param {ArrayBuffer} data
   */
  constructor(xhr, data) {
    super();
    this.xhr = xhr;
    this.data = data;
  }

  get status() {
    return this.xhr.status;
  }

  getHeader(name) {
    return this.xhr.getResponseHeader(name);
  }

  async getData() {
    return this.data;
  }
}

class XHRClient extends _base_js__WEBPACK_IMPORTED_MODULE_0__.BaseClient {
  constructRequest(headers, signal) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.url);
      xhr.responseType = 'arraybuffer';
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }

      // hook signals
      xhr.onload = () => {
        const data = xhr.response;
        resolve(new XHRResponse(xhr, data));
      };
      xhr.onerror = reject;
      xhr.onabort = () => reject(new _utils_js__WEBPACK_IMPORTED_MODULE_1__.AbortError('Request aborted'));
      xhr.send();

      if (signal) {
        if (signal.aborted) {
          xhr.abort();
        }
        signal.addEventListener('abort', () => xhr.abort());
      }
    });
  }

  async request({ headers, signal } = {}) {
    const response = await this.constructRequest(headers, signal);
    return response;
  }
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/file.js":
/*!*********************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/file.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeFileSource: () => (/* binding */ makeFileSource)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "?662e");
/* harmony import */ var _basesource_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./basesource.js */ "./node_modules/geotiff/dist-module/source/basesource.js");



function closeAsync(fd) {
  return new Promise((resolve, reject) => {
    fs__WEBPACK_IMPORTED_MODULE_0__.close(fd, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function openAsync(path, flags, mode = undefined) {
  return new Promise((resolve, reject) => {
    fs__WEBPACK_IMPORTED_MODULE_0__.open(path, flags, mode, (err, fd) => {
      if (err) {
        reject(err);
      } else {
        resolve(fd);
      }
    });
  });
}

function readAsync(...args) {
  return new Promise((resolve, reject) => {
    fs__WEBPACK_IMPORTED_MODULE_0__.read(...args, (err, bytesRead, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve({ bytesRead, buffer });
      }
    });
  });
}

class FileSource extends _basesource_js__WEBPACK_IMPORTED_MODULE_1__.BaseSource {
  constructor(path) {
    super();
    this.path = path;
    this.openRequest = openAsync(path, 'r');
  }

  async fetchSlice(slice) {
    // TODO: use `signal`
    const fd = await this.openRequest;
    const { buffer } = await readAsync(
      fd,
      Buffer.alloc(slice.length),
      0,
      slice.length,
      slice.offset,
    );
    return buffer.buffer;
  }

  async close() {
    const fd = await this.openRequest;
    await closeAsync(fd);
  }
}

function makeFileSource(path) {
  return new FileSource(path);
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/filereader.js":
/*!***************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/filereader.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeFileReaderSource: () => (/* binding */ makeFileReaderSource)
/* harmony export */ });
/* harmony import */ var _basesource_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./basesource.js */ "./node_modules/geotiff/dist-module/source/basesource.js");


class FileReaderSource extends _basesource_js__WEBPACK_IMPORTED_MODULE_0__.BaseSource {
  constructor(file) {
    super();
    this.file = file;
  }

  async fetchSlice(slice, signal) {
    return new Promise((resolve, reject) => {
      const blob = this.file.slice(slice.offset, slice.offset + slice.length);
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.onabort = reject;
      reader.readAsArrayBuffer(blob);

      if (signal) {
        signal.addEventListener('abort', () => reader.abort());
      }
    });
  }
}

/**
 * Create a new source from a given file/blob.
 * @param {Blob} file The file or blob to read from.
 * @returns The constructed source
 */
function makeFileReaderSource(file) {
  return new FileReaderSource(file);
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/httputils.js":
/*!**************************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/httputils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseByteRanges: () => (/* binding */ parseByteRanges),
/* harmony export */   parseContentRange: () => (/* binding */ parseContentRange),
/* harmony export */   parseContentType: () => (/* binding */ parseContentType)
/* harmony export */ });
const CRLFCRLF = '\r\n\r\n';

/*
 * Shim for 'Object.fromEntries'
 */
function itemsToObject(items) {
  if (typeof Object.fromEntries !== 'undefined') {
    return Object.fromEntries(items);
  }
  const obj = {};
  for (const [key, value] of items) {
    obj[key.toLowerCase()] = value;
  }
  return obj;
}

/**
 * Parse HTTP headers from a given string.
 * @param {String} text the text to parse the headers from
 * @returns {Object} the parsed headers with lowercase keys
 */
function parseHeaders(text) {
  const items = text
    .split('\r\n')
    .map((line) => {
      const kv = line.split(':').map((str) => str.trim());
      kv[0] = kv[0].toLowerCase();
      return kv;
    });

  return itemsToObject(items);
}

/**
 * Parse a 'Content-Type' header value to the content-type and parameters
 * @param {String} rawContentType the raw string to parse from
 * @returns {Object} the parsed content type with the fields: type and params
 */
function parseContentType(rawContentType) {
  const [type, ...rawParams] = rawContentType.split(';').map((s) => s.trim());
  const paramsItems = rawParams.map((param) => param.split('='));
  return { type, params: itemsToObject(paramsItems) };
}

/**
 * Parse a 'Content-Range' header value to its start, end, and total parts
 * @param {String} rawContentRange the raw string to parse from
 * @returns {Object} the parsed parts
 */
function parseContentRange(rawContentRange) {
  let start;
  let end;
  let total;

  if (rawContentRange) {
    [, start, end, total] = rawContentRange.match(/bytes (\d+)-(\d+)\/(\d+)/);
    start = parseInt(start, 10);
    end = parseInt(end, 10);
    total = parseInt(total, 10);
  }

  return { start, end, total };
}

/**
 * Parses a list of byteranges from the given 'multipart/byteranges' HTTP response.
 * Each item in the list has the following properties:
 * - headers: the HTTP headers
 * - data: the sliced ArrayBuffer for that specific part
 * - offset: the offset of the byterange within its originating file
 * - length: the length of the byterange
 * @param {ArrayBuffer} responseArrayBuffer the response to be parsed and split
 * @param {String} boundary the boundary string used to split the sections
 * @returns {Object[]} the parsed byteranges
 */
function parseByteRanges(responseArrayBuffer, boundary) {
  let offset = null;
  const decoder = new TextDecoder('ascii');
  const out = [];

  const startBoundary = `--${boundary}`;
  const endBoundary = `${startBoundary}--`;

  // search for the initial boundary, may be offset by some bytes
  // TODO: more efficient to check for `--` in bytes directly
  for (let i = 0; i < 10; ++i) {
    const text = decoder.decode(
      new Uint8Array(responseArrayBuffer, i, startBoundary.length),
    );
    if (text === startBoundary) {
      offset = i;
    }
  }

  if (offset === null) {
    throw new Error('Could not find initial boundary');
  }

  while (offset < responseArrayBuffer.byteLength) {
    const text = decoder.decode(
      new Uint8Array(responseArrayBuffer, offset,
        Math.min(startBoundary.length + 1024, responseArrayBuffer.byteLength - offset),
      ),
    );

    // break if we arrived at the end
    if (text.length === 0 || text.startsWith(endBoundary)) {
      break;
    }

    // assert that we are actually dealing with a byterange and are at the correct offset
    if (!text.startsWith(startBoundary)) {
      throw new Error('Part does not start with boundary');
    }

    // get a substring from where we read the headers
    const innerText = text.substr(startBoundary.length + 2);

    if (innerText.length === 0) {
      break;
    }

    // find the double linebreak that denotes the end of the headers
    const endOfHeaders = innerText.indexOf(CRLFCRLF);

    // parse the headers to get the content range size
    const headers = parseHeaders(innerText.substr(0, endOfHeaders));
    const { start, end, total } = parseContentRange(headers['content-range']);

    // calculate the length of the slice and the next offset
    const startOfData = offset + startBoundary.length + endOfHeaders + CRLFCRLF.length;
    const length = parseInt(end, 10) + 1 - parseInt(start, 10);
    out.push({
      headers,
      data: responseArrayBuffer.slice(startOfData, startOfData + length),
      offset: start,
      length,
      fileSize: total,
    });

    offset = startOfData + length + 4;
  }

  return out;
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/source/remote.js":
/*!***********************************************************!*\
  !*** ./node_modules/geotiff/dist-module/source/remote.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeFetchSource: () => (/* binding */ makeFetchSource),
/* harmony export */   makeHttpSource: () => (/* binding */ makeHttpSource),
/* harmony export */   makeRemoteSource: () => (/* binding */ makeRemoteSource),
/* harmony export */   makeXHRSource: () => (/* binding */ makeXHRSource)
/* harmony export */ });
/* harmony import */ var _httputils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./httputils.js */ "./node_modules/geotiff/dist-module/source/httputils.js");
/* harmony import */ var _basesource_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./basesource.js */ "./node_modules/geotiff/dist-module/source/basesource.js");
/* harmony import */ var _blockedsource_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./blockedsource.js */ "./node_modules/geotiff/dist-module/source/blockedsource.js");
/* harmony import */ var _client_fetch_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./client/fetch.js */ "./node_modules/geotiff/dist-module/source/client/fetch.js");
/* harmony import */ var _client_xhr_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./client/xhr.js */ "./node_modules/geotiff/dist-module/source/client/xhr.js");
/* harmony import */ var _client_http_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./client/http.js */ "./node_modules/geotiff/dist-module/source/client/http.js");








class RemoteSource extends _basesource_js__WEBPACK_IMPORTED_MODULE_0__.BaseSource {
  /**
   *
   * @param {BaseClient} client
   * @param {object} headers
   * @param {numbers} maxRanges
   * @param {boolean} allowFullFile
   */
  constructor(client, headers, maxRanges, allowFullFile) {
    super();
    this.client = client;
    this.headers = headers;
    this.maxRanges = maxRanges;
    this.allowFullFile = allowFullFile;
    this._fileSize = null;
  }

  /**
   *
   * @param {Slice[]} slices
   */
  async fetch(slices, signal) {
    // if we allow multi-ranges, split the incoming request into that many sub-requests
    // and join them afterwards
    if (this.maxRanges >= slices.length) {
      return this.fetchSlices(slices, signal);
    } else if (this.maxRanges > 0 && slices.length > 1) {
      // TODO: split into multiple multi-range requests

      // const subSlicesRequests = [];
      // for (let i = 0; i < slices.length; i += this.maxRanges) {
      //   subSlicesRequests.push(
      //     this.fetchSlices(slices.slice(i, i + this.maxRanges), signal),
      //   );
      // }
      // return (await Promise.all(subSlicesRequests)).flat();
    }

    // otherwise make a single request for each slice
    return Promise.all(
      slices.map((slice) => this.fetchSlice(slice, signal)),
    );
  }

  async fetchSlices(slices, signal) {
    const response = await this.client.request({
      headers: {
        ...this.headers,
        Range: `bytes=${slices
          .map(({ offset, length }) => `${offset}-${offset + length}`)
          .join(',')
        }`,
      },
      signal,
    });

    if (!response.ok) {
      throw new Error('Error fetching data.');
    } else if (response.status === 206) {
      const { type, params } = (0,_httputils_js__WEBPACK_IMPORTED_MODULE_1__.parseContentType)(response.getHeader('content-type'));
      if (type === 'multipart/byteranges') {
        const byteRanges = (0,_httputils_js__WEBPACK_IMPORTED_MODULE_1__.parseByteRanges)(await response.getData(), params.boundary);
        this._fileSize = byteRanges[0].fileSize || null;
        return byteRanges;
      }

      const data = await response.getData();

      const { start, end, total } = (0,_httputils_js__WEBPACK_IMPORTED_MODULE_1__.parseContentRange)(response.getHeader('content-range'));
      this._fileSize = total || null;
      const first = [{
        data,
        offset: start,
        length: end - start,
      }];

      if (slices.length > 1) {
        // we requested more than one slice, but got only the first
        // unfortunately, some HTTP Servers don't support multi-ranges
        // and return only the first

        // get the rest of the slices and fetch them iteratively
        const others = await Promise.all(slices.slice(1).map((slice) => this.fetchSlice(slice, signal)));
        return first.concat(others);
      }
      return first;
    } else {
      if (!this.allowFullFile) {
        throw new Error('Server responded with full file');
      }
      const data = await response.getData();
      this._fileSize = data.byteLength;
      return [{
        data,
        offset: 0,
        length: data.byteLength,
      }];
    }
  }

  async fetchSlice(slice, signal) {
    const { offset, length } = slice;
    const response = await this.client.request({
      headers: {
        ...this.headers,
        Range: `bytes=${offset}-${offset + length}`,
      },
      signal,
    });

    // check the response was okay and if the server actually understands range requests
    if (!response.ok) {
      throw new Error('Error fetching data.');
    } else if (response.status === 206) {
      const data = await response.getData();

      const { total } = (0,_httputils_js__WEBPACK_IMPORTED_MODULE_1__.parseContentRange)(response.getHeader('content-range'));
      this._fileSize = total || null;
      return {
        data,
        offset,
        length,
      };
    } else {
      if (!this.allowFullFile) {
        throw new Error('Server responded with full file');
      }

      const data = await response.getData();

      this._fileSize = data.byteLength;
      return {
        data,
        offset: 0,
        length: data.byteLength,
      };
    }
  }

  get fileSize() {
    return this._fileSize;
  }
}

function maybeWrapInBlockedSource(source, { blockSize, cacheSize }) {
  if (blockSize === null) {
    return source;
  }
  return new _blockedsource_js__WEBPACK_IMPORTED_MODULE_2__.BlockedSource(source, { blockSize, cacheSize });
}

function makeFetchSource(url, { headers = {}, credentials, maxRanges = 0, allowFullFile = false, ...blockOptions } = {}) {
  const client = new _client_fetch_js__WEBPACK_IMPORTED_MODULE_3__.FetchClient(url, credentials);
  const source = new RemoteSource(client, headers, maxRanges, allowFullFile);
  return maybeWrapInBlockedSource(source, blockOptions);
}

function makeXHRSource(url, { headers = {}, maxRanges = 0, allowFullFile = false, ...blockOptions } = {}) {
  const client = new _client_xhr_js__WEBPACK_IMPORTED_MODULE_4__.XHRClient(url);
  const source = new RemoteSource(client, headers, maxRanges, allowFullFile);
  return maybeWrapInBlockedSource(source, blockOptions);
}

function makeHttpSource(url, { headers = {}, maxRanges = 0, allowFullFile = false, ...blockOptions } = {}) {
  const client = new _client_http_js__WEBPACK_IMPORTED_MODULE_5__.HttpClient(url);
  const source = new RemoteSource(client, headers, maxRanges, allowFullFile);
  return maybeWrapInBlockedSource(source, blockOptions);
}

/**
 *
 * @param {string} url
 * @param {object} options
 */
function makeRemoteSource(url, { forceXHR = false, ...clientOptions } = {}) {
  if (typeof fetch === 'function' && !forceXHR) {
    return makeFetchSource(url, clientOptions);
  }
  if (typeof XMLHttpRequest !== 'undefined') {
    return makeXHRSource(url, clientOptions);
  }
  return makeHttpSource(url, clientOptions);
}


/***/ }),

/***/ "./node_modules/geotiff/dist-module/utils.js":
/*!***************************************************!*\
  !*** ./node_modules/geotiff/dist-module/utils.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbortError: () => (/* binding */ AbortError),
/* harmony export */   AggregateError: () => (/* binding */ AggregateError),
/* harmony export */   CustomAggregateError: () => (/* binding */ CustomAggregateError),
/* harmony export */   assign: () => (/* binding */ assign),
/* harmony export */   chunk: () => (/* binding */ chunk),
/* harmony export */   endsWith: () => (/* binding */ endsWith),
/* harmony export */   forEach: () => (/* binding */ forEach),
/* harmony export */   invert: () => (/* binding */ invert),
/* harmony export */   parseContentRange: () => (/* binding */ parseContentRange),
/* harmony export */   range: () => (/* binding */ range),
/* harmony export */   times: () => (/* binding */ times),
/* harmony export */   toArray: () => (/* binding */ toArray),
/* harmony export */   toArrayRecursively: () => (/* binding */ toArrayRecursively),
/* harmony export */   wait: () => (/* binding */ wait),
/* harmony export */   zip: () => (/* binding */ zip)
/* harmony export */ });
function assign(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

function chunk(iterable, length) {
  const results = [];
  const lengthOfIterable = iterable.length;
  for (let i = 0; i < lengthOfIterable; i += length) {
    const chunked = [];
    for (let ci = i; ci < i + length; ci++) {
      chunked.push(iterable[ci]);
    }
    results.push(chunked);
  }
  return results;
}

function endsWith(string, expectedEnding) {
  if (string.length < expectedEnding.length) {
    return false;
  }
  const actualEnding = string.substr(string.length - expectedEnding.length);
  return actualEnding === expectedEnding;
}

function forEach(iterable, func) {
  const { length } = iterable;
  for (let i = 0; i < length; i++) {
    func(iterable[i], i);
  }
}

function invert(oldObj) {
  const newObj = {};
  for (const key in oldObj) {
    if (oldObj.hasOwnProperty(key)) {
      const value = oldObj[key];
      newObj[value] = key;
    }
  }
  return newObj;
}

function range(n) {
  const results = [];
  for (let i = 0; i < n; i++) {
    results.push(i);
  }
  return results;
}

function times(numTimes, func) {
  const results = [];
  for (let i = 0; i < numTimes; i++) {
    results.push(func(i));
  }
  return results;
}

function toArray(iterable) {
  const results = [];
  const { length } = iterable;
  for (let i = 0; i < length; i++) {
    results.push(iterable[i]);
  }
  return results;
}

function toArrayRecursively(input) {
  if (input.length) {
    return toArray(input).map(toArrayRecursively);
  }
  return input;
}

// copied from https://github.com/academia-de-codigo/parse-content-range-header/blob/master/index.js
function parseContentRange(headerValue) {
  if (!headerValue) {
    return null;
  }

  if (typeof headerValue !== 'string') {
    throw new Error('invalid argument');
  }

  const parseInt = (number) => Number.parseInt(number, 10);

  // Check for presence of unit
  let matches = headerValue.match(/^(\w*) /);
  const unit = matches && matches[1];

  // check for start-end/size header format
  matches = headerValue.match(/(\d+)-(\d+)\/(\d+|\*)/);
  if (matches) {
    return {
      unit,
      first: parseInt(matches[1]),
      last: parseInt(matches[2]),
      length: matches[3] === '*' ? null : parseInt(matches[3]),
    };
  }

  // check for size header format
  matches = headerValue.match(/(\d+|\*)/);
  if (matches) {
    return {
      unit,
      first: null,
      last: null,
      length: matches[1] === '*' ? null : parseInt(matches[1]),
    };
  }

  return null;
}

/*
 * Promisified wrapper around 'setTimeout' to allow 'await'
 */
async function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function zip(a, b) {
  const A = Array.isArray(a) ? a : Array.from(a);
  const B = Array.isArray(b) ? b : Array.from(b);
  return A.map((k, i) => [k, B[i]]);
}

// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
class AbortError extends Error {
  constructor(params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AbortError);
    }

    this.name = 'AbortError';
  }
}

class CustomAggregateError extends Error {
  constructor(errors, message) {
    super(message);
    this.errors = errors;
    this.message = message;
    this.name = 'AggregateError';
  }
}

const AggregateError = CustomAggregateError;


/***/ }),

/***/ "./node_modules/quick-lru/index.js":
/*!*****************************************!*\
  !*** ./node_modules/quick-lru/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QuickLRU)
/* harmony export */ });
class QuickLRU extends Map {
	constructor(options = {}) {
		super();

		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		if (typeof options.maxAge === 'number' && options.maxAge === 0) {
			throw new TypeError('`maxAge` must be a number greater than 0');
		}

		// TODO: Use private class fields when ESLint supports them.
		this.maxSize = options.maxSize;
		this.maxAge = options.maxAge || Number.POSITIVE_INFINITY;
		this.onEviction = options.onEviction;
		this.cache = new Map();
		this.oldCache = new Map();
		this._size = 0;
	}

	// TODO: Use private class methods when targeting Node.js 16.
	_emitEvictions(cache) {
		if (typeof this.onEviction !== 'function') {
			return;
		}

		for (const [key, item] of cache) {
			this.onEviction(key, item.value);
		}
	}

	_deleteIfExpired(key, item) {
		if (typeof item.expiry === 'number' && item.expiry <= Date.now()) {
			if (typeof this.onEviction === 'function') {
				this.onEviction(key, item.value);
			}

			return this.delete(key);
		}

		return false;
	}

	_getOrDeleteIfExpired(key, item) {
		const deleted = this._deleteIfExpired(key, item);
		if (deleted === false) {
			return item.value;
		}
	}

	_getItemValue(key, item) {
		return item.expiry ? this._getOrDeleteIfExpired(key, item) : item.value;
	}

	_peek(key, cache) {
		const item = cache.get(key);

		return this._getItemValue(key, item);
	}

	_set(key, value) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;
			this._emitEvictions(this.oldCache);
			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}

	_moveToRecent(key, item) {
		this.oldCache.delete(key);
		this._set(key, item);
	}

	* _entriesAscending() {
		for (const item of this.oldCache) {
			const [key, value] = item;
			if (!this.cache.has(key)) {
				const deleted = this._deleteIfExpired(key, value);
				if (deleted === false) {
					yield item;
				}
			}
		}

		for (const item of this.cache) {
			const [key, value] = item;
			const deleted = this._deleteIfExpired(key, value);
			if (deleted === false) {
				yield item;
			}
		}
	}

	get(key) {
		if (this.cache.has(key)) {
			const item = this.cache.get(key);

			return this._getItemValue(key, item);
		}

		if (this.oldCache.has(key)) {
			const item = this.oldCache.get(key);
			if (this._deleteIfExpired(key, item) === false) {
				this._moveToRecent(key, item);
				return item.value;
			}
		}
	}

	set(key, value, {maxAge = this.maxAge} = {}) {
		const expiry =
			typeof maxAge === 'number' && maxAge !== Number.POSITIVE_INFINITY ?
				Date.now() + maxAge :
				undefined;
		if (this.cache.has(key)) {
			this.cache.set(key, {
				value,
				expiry
			});
		} else {
			this._set(key, {value, expiry});
		}
	}

	has(key) {
		if (this.cache.has(key)) {
			return !this._deleteIfExpired(key, this.cache.get(key));
		}

		if (this.oldCache.has(key)) {
			return !this._deleteIfExpired(key, this.oldCache.get(key));
		}

		return false;
	}

	peek(key) {
		if (this.cache.has(key)) {
			return this._peek(key, this.cache);
		}

		if (this.oldCache.has(key)) {
			return this._peek(key, this.oldCache);
		}
	}

	delete(key) {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this._size--;
		}

		return this.oldCache.delete(key) || deleted;
	}

	clear() {
		this.cache.clear();
		this.oldCache.clear();
		this._size = 0;
	}

	resize(newSize) {
		if (!(newSize && newSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		const items = [...this._entriesAscending()];
		const removeCount = items.length - newSize;
		if (removeCount < 0) {
			this.cache = new Map(items);
			this.oldCache = new Map();
			this._size = items.length;
		} else {
			if (removeCount > 0) {
				this._emitEvictions(items.slice(0, removeCount));
			}

			this.oldCache = new Map(items.slice(removeCount));
			this.cache = new Map();
			this._size = 0;
		}

		this.maxSize = newSize;
	}

	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	* values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	* [Symbol.iterator]() {
		for (const item of this.cache) {
			const [key, value] = item;
			const deleted = this._deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		for (const item of this.oldCache) {
			const [key, value] = item;
			if (!this.cache.has(key)) {
				const deleted = this._deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	* entriesDescending() {
		let items = [...this.cache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			const deleted = this._deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		items = [...this.oldCache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			if (!this.cache.has(key)) {
				const deleted = this._deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	* entriesAscending() {
		for (const [key, value] of this._entriesAscending()) {
			yield [key, value.value];
		}
	}

	get size() {
		if (!this._size) {
			return this.oldCache.size;
		}

		let oldCacheSize = 0;
		for (const key of this.oldCache.keys()) {
			if (!this.cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this._size + oldCacheSize, this.maxSize);
	}

	entries() {
		return this.entriesAscending();
	}

	forEach(callbackFunction, thisArgument = this) {
		for (const [key, value] of this.entriesAscending()) {
			callbackFunction.call(thisArgument, value, key, this);
		}
	}

	get [Symbol.toStringTag]() {
		return JSON.stringify([...this.entriesAscending()]);
	}
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "geology-vr:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkgeology_vr"] = self["webpackChunkgeology_vr"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var geotiff__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! geotiff */ "./node_modules/geotiff/dist-module/geotiff.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// import * as THREE from 'three';
// import {Text} from 'troika-three-text'
// import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

var CRS = 'EPSG:32632';
var x = 580239;
var y = 4917120;
var width = 120;
var height = 100;
var mPerPixel = 20;
// let myUrl = 'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/DTM_20M.map' + 
//     '&SERVICE=WMS' +
//     '&VERSION=1.3.0' + 
//     '&REQUEST=GetMap' +
//     '&BBOX=' + encodeURIComponent([(x - width / 2 * mPerPixel),(y - height / 2 * mPerPixel),(x + width / 2 * mPerPixel),(y + height / 2 * mPerPixel)].join(',')) +
//     '&CRS=' + encodeURIComponent(CRS) +
//     '&WIDTH=' + width +
//     '&HEIGHT=' + height +
//     '&LAYERS=EL.DTM.20M' +
//     '&STYLES=' +
//     '&FORMAT=image%2Fpng' +
//     '&DPI=96' +
//     '&MAP_RESOLUTION=96' +
//     '&FORMAT_OPTIONS=dpi%3A96' +
//     '&TRANSPARENT=TRUE'
var WCSurl = 'https://tinitaly.pi.ingv.it/TINItaly_1_1/wcs?' +
    'SERVICE=WCS' +
    '&VERSION=1.0.0' +
    '&REQUEST=GetCoverage' +
    '&FORMAT=GeoTIFF' +
    '&COVERAGE=TINItaly_1_1:tinitaly_dem' +
    '&BBOX=' + [(x - width / 2 * mPerPixel), (y - height / 2 * mPerPixel), (x + width / 2 * mPerPixel), (y + height / 2 * mPerPixel)].join(',') +
    '&CRS=' + CRS +
    '&RESPONSE_CRS=' + CRS +
    '&WIDTH=' + width +
    '&HEIGHT=' + height;
// let WCSurl = 'https://wms.pcn.minambiente.it/wcs/dtm_20m?' + 
// '&SERVICE=WCS' +
// '&VERSION=1.0.0' + 
// '&REQUEST=GetCoverage' +
// '&FORMAT=GEOTIFF' +
// '&COVERAGE=EL.DTM.20M' +
// '&BBOX=' + [(x - width / 2 * mPerPixel),(y - height / 2 * mPerPixel),(x + width / 2 * mPerPixel),(y + height / 2 * mPerPixel)].join(',') +
// '&CRS=' + CRS +
// '&RESPONSE_CRS=' + CRS +
// '&WIDTH=' + width +
// '&HEIGHT=' + height
function loadDEM() {
    return __awaiter(this, void 0, void 0, function () {
        var myGeoTIFF, myGeoTIFFImage, myRaster;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0,geotiff__WEBPACK_IMPORTED_MODULE_0__.fromUrl)(WCSurl, { allowFullFile: true })];
                case 1:
                    myGeoTIFF = _a.sent();
                    return [4 /*yield*/, myGeoTIFF.getImage()];
                case 2:
                    myGeoTIFFImage = _a.sent();
                    return [4 /*yield*/, myGeoTIFFImage.readRasters()];
                case 3:
                    myRaster = _a.sent();
                    console.log(myRaster);
                    return [2 /*return*/];
            }
        });
    });
}
var myA = document.createElement("a");
myA.href = WCSurl;
myA.innerText = "Vai";
document.body.appendChild(myA);
loadDEM();
// const myUrlA = document.createElement("a")
// myUrlA.href = WCSurl
// myUrlA.innerText = 'Vai'
// document.body.appendChild(myUrlA)
// // Create the scene
// const scene = new THREE.Scene();
// // Create the camera
// const camera = new THREE.PerspectiveCamera()
// scene.add(camera)
// // Create the renderer and enable XR
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
// renderer.xr.enabled = true;
// // Append the renderer and the VR button to the page
// document.body.appendChild( renderer.domElement );
// document.body.appendChild( VRButton.createButton( renderer ) );
// // Rendering loop
// function render() {
//   const myXRsession = renderer.xr.getSession();
//   if (myXRsession) {
//     myXRsession.inputSources.forEach((mySource, i) => {
//       if (mySource.gamepad) {
//         mySource.gamepad.axes.forEach((axisValue, j) => {
//         })
//         mySource.gamepad.buttons.forEach((myButton, k) => {
//         })
//       }
//     })
//   }
//   renderer.render( scene, camera );
// }
// renderer.setAnimationLoop(render)

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsVUFBVTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzSWtEOztBQUVuQztBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsVUFBVTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsT0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVcsZ0VBQVU7QUFDckI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaEdBO0FBQzZDO0FBQ0o7QUFDRjtBQUNWOztBQUV5QjtBQUNLO0FBQ0c7QUFDWjs7QUFFaUM7QUFDakM7QUFDVjtBQUNSO0FBQ2dDO0FBQ3ZCOztBQUV0QjtBQUNKO0FBQ3VEO0FBQ3BDO0FBQ2I7O0FBRXJCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLGdDQUFnQztBQUMvQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsZ0JBQWdCLGNBQWM7QUFDakQsYUFBYSx5QkFBeUI7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGdCQUFnQixjQUFjO0FBQ25ELGFBQWEsMkJBQTJCO0FBQ3hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxnQkFBZ0IsY0FBYztBQUNsRSxhQUFhLDBEQUEwRDtBQUN2RTs7QUFFQTtBQUNBO0FBQ0EsU0FBUyxtREFBVSxZQUFZLG1EQUFVLGFBQWEsbURBQVUsYUFBYSxtREFBVTtBQUN2RjtBQUNBLFNBQVMsbURBQVUsYUFBYSxtREFBVTtBQUMxQztBQUNBLFNBQVMsbURBQVUsWUFBWSxtREFBVSxhQUFhLG1EQUFVLGFBQWEsbURBQVU7QUFDdkY7QUFDQSxTQUFTLG1EQUFVLGdCQUFnQixtREFBVSxpQkFBaUIsbURBQVU7QUFDeEUsU0FBUyxtREFBVSxhQUFhLG1EQUFVLGNBQWMsbURBQVU7QUFDbEU7QUFDQTtBQUNBLGtEQUFrRCxVQUFVO0FBQzVEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQixnQ0FBZ0M7QUFDbEQsZ0JBQWdCLG9EQUFXO0FBQzNCO0FBQ0EsU0FBUyxzREFBYTtBQUN0QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsMERBQTBELElBQUk7QUFDOUQsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyxtREFBVSxZQUFZLG1EQUFVLGFBQWEsbURBQVU7QUFDaEUsc0NBQXNDO0FBQ3RDO0FBQ0EsU0FBUyxtREFBVTtBQUNuQixxQ0FBcUM7QUFDckM7QUFDQSxTQUFTLG1EQUFVO0FBQ25CLHVDQUF1QztBQUN2QztBQUNBLFNBQVMsbURBQVU7QUFDbkIsc0NBQXNDO0FBQ3RDO0FBQ0EsU0FBUyxtREFBVSxZQUFZLG1EQUFVO0FBQ3pDLHVDQUF1QztBQUN2QztBQUNBLFNBQVMsbURBQVU7QUFDbkIsc0NBQXNDO0FBQ3RDO0FBQ0EsU0FBUyxtREFBVSxhQUFhLG1EQUFVO0FBQzFDLGlDQUFpQztBQUNqQztBQUNBLFNBQVMsbURBQVU7QUFDbkIsaUNBQWlDO0FBQ2pDO0FBQ0EsU0FBUyxtREFBVTtBQUNuQiwyQ0FBMkM7QUFDM0M7QUFDQSxTQUFTLG1EQUFVO0FBQ25CLDBDQUEwQztBQUMxQztBQUNBLFNBQVMsbURBQVU7QUFDbkIsd0NBQXdDO0FBQ3hDO0FBQ0EsU0FBUyxtREFBVTtBQUNuQix3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBLGtEQUFrRCxVQUFVO0FBQzVEOztBQUVBO0FBQ0Esc0JBQXNCLG1EQUFVLDJCQUEyQixtREFBVTtBQUNyRSxvQkFBb0IsV0FBVztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksT0FBTztBQUNYLG9CQUFvQixXQUFXO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9CLG1EQUFVO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLE1BQU07QUFDckM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLGdDQUFnQztBQUM3RDtBQUNBO0FBQ0EsYUFBYSw0Q0FBNEMsV0FBVztBQUNwRSxlQUFlLDJCQUEyQjtBQUMxQztBQUNBLGdDQUFnQztBQUNoQyxZQUFZLHFDQUFxQztBQUNqRCxVQUFVLG1CQUFtQjs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixnQkFBZ0I7QUFDdEM7QUFDQSxnQkFBZ0IsMkRBQTJEO0FBQzNFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLHNCQUFzQjtBQUM1QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1DQUFtQyx5QkFBeUI7QUFDNUQ7QUFDQTs7QUFFQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFNBQVM7QUFDdkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLEdBQUc7QUFDaEIsYUFBYSxTQUFTO0FBQ3RCLGFBQWEsU0FBUztBQUN0QixhQUFhLFFBQVE7QUFDckI7QUFDQSxhQUFhLGdCQUFnQjtBQUM3QjtBQUNBLHlFQUF5RTtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUscURBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixlQUFlLDZCQUE2QjtBQUM1QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLDZCQUE2Qiw0QkFBNEI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUEsdUVBQXVFO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZCQUE2QixvREFBVztBQUN4QywyQkFBMkIsbURBQVUsMkJBQTJCLG1EQUFVO0FBQzFFO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0Isc0RBQWE7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixlQUFlLHVCQUF1QjtBQUN0QztBQUNBO0FBQ0E7QUFDQSxlQUFlLHdEQUFZO0FBQzNCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsaUJBQWlCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGlCQUFpQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsbURBQVU7QUFDdkQsNENBQTRDLG1EQUFVO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsbURBQVU7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsR0FBRztBQUNoQixhQUFhLGdCQUFnQjtBQUM3QixhQUFhLGFBQWE7QUFDMUI7QUFDQTtBQUNBO0FBQ0EsOENBQThDLHlCQUF5QjtBQUN2RSx5QkFBeUIsc0RBQVU7O0FBRW5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVtQjtBQUNuQixpRUFBZSxPQUFPLEVBQUM7O0FBRXZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxTQUFTO0FBQ3RCLGFBQWEsV0FBVztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckIsZUFBZSx1QkFBdUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLDRCQUE0QjtBQUNoRDtBQUNBLHVCQUF1QiwwQkFBMEI7QUFDakQ7QUFDQTtBQUNBLHFCQUFxQix3REFBWTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGlCQUFpQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXdCOztBQUV4QjtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixrQ0FBa0Msd0JBQXdCO0FBQzFELFdBQVcsYUFBYTtBQUN4QjtBQUNBLGFBQWEsa0JBQWtCO0FBQy9CO0FBQ08sd0NBQXdDO0FBQy9DLDRCQUE0QixtRUFBZ0I7QUFDNUM7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQixtR0FBbUc7QUFDcEgsV0FBVyxhQUFhO0FBQ3hCLFdBQVcsYUFBYTtBQUN4QjtBQUNBLGFBQWEsa0JBQWtCO0FBQy9CO0FBQ087QUFDUCw0QkFBNEIsd0VBQWdCO0FBQzVDOztBQUVBO0FBQ0E7QUFDQSxvQkFBb0Isc0NBQXNDO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsYUFBYTtBQUN4QjtBQUNBLGFBQWEsa0JBQWtCO0FBQy9CO0FBQ087QUFDUCw0QkFBNEIsZ0VBQWM7QUFDMUM7O0FBRUE7QUFDQTtBQUNBLFVBQVUsNkRBQTZEO0FBQ3ZFLFVBQVU7QUFDVjtBQUNBLFdBQVcsV0FBVztBQUN0QixXQUFXLGFBQWE7QUFDeEI7QUFDQSxhQUFhLGtCQUFrQjtBQUMvQjtBQUNPO0FBQ1AsNEJBQTRCLDRFQUFvQjtBQUNoRDs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsVUFBVTtBQUNyQixXQUFXLFFBQVE7QUFDbkIsb0RBQW9EO0FBQ3BEO0FBQ0EsV0FBVyxhQUFhO0FBQ3hCO0FBQ0EsYUFBYSx1QkFBdUI7QUFDcEM7QUFDTyxnRUFBZ0U7QUFDdkUsNENBQTRDLG1FQUFnQjtBQUM1RDtBQUNBLGlEQUFpRCxtRUFBZ0I7QUFDakU7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsVUFBVTtBQUN2QjtBQUNPO0FBQ1AsU0FBUyxnRUFBWTtBQUNyQjs7QUFFZ0I7QUFDUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0dkJ4QjtBQUNrRDtBQUNJO0FBQ007O0FBRWtCO0FBQzRCO0FBQ3REO0FBQ1U7O0FBRTlEO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGNBQWMsZUFBZTtBQUM3QixjQUFjLGVBQWU7QUFDN0I7QUFDQSxjQUFjLGVBQWU7QUFDN0IsY0FBYyxTQUFTO0FBQ3ZCO0FBQ0E7QUFDQSxjQUFjLE1BQU07QUFDcEIsY0FBYyxRQUFRO0FBQ3RCO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsYUFBYTtBQUMzQjtBQUNBLGNBQWMsaUJBQWlCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGNBQWMsbUNBQW1DO0FBQ2pELGNBQWMseUNBQXlDOztBQUV2RDtBQUNBO0FBQ0Esc0JBQXNCLFNBQVM7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG9CQUFvQixnQkFBZ0I7QUFDcEM7QUFDQSxzQkFBc0IsZUFBZTtBQUNyQztBQUNBLHdCQUF3Qix1QkFBdUI7QUFDL0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQSwrQkFBK0IscUJBQXFCO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkseUJBQXlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLDRCQUE0QjtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGFBQWEsUUFBUTtBQUNyQixhQUFhLFVBQVU7QUFDdkIsYUFBYSxTQUFTO0FBQ3RCLGFBQWEsU0FBUztBQUN0QixhQUFhLDBDQUEwQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsNkNBQTZDO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwyQ0FBMkMsR0FBRztBQUM5QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsZ0VBQVU7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGFBQWEsUUFBUTtBQUNyQixhQUFhLFFBQVE7QUFDckIsYUFBYSwwREFBMEQ7QUFDdkUsYUFBYSxhQUFhO0FBQzFCO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsOENBQThDLDJCQUEyQjs7QUFFekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsYUFBYSxPQUFPO0FBQ3BCLGFBQWEseUJBQXlCO0FBQ3RDLGFBQWEsU0FBUztBQUN0QixhQUFhLDBDQUEwQztBQUN2RCxhQUFhLFFBQVE7QUFDckIsYUFBYSxRQUFRO0FBQ3JCLGFBQWEsUUFBUTtBQUNyQixhQUFhLGFBQWE7QUFDMUI7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLG9CQUFvQjtBQUN4QztBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsWUFBWSxlQUFlOztBQUUzQiwrQkFBK0Isa0JBQWtCO0FBQ2pELGlDQUFpQyxrQkFBa0I7QUFDbkQsa0NBQWtDLDhCQUE4QjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsa0VBQWtFLFVBQVU7QUFDNUUsbUVBQW1FLFVBQVU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixpRUFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1Isb0JBQW9CLHNEQUFRO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsbUJBQW1CLFdBQVc7QUFDM0MsZUFBZSwyQkFBMkI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUk7QUFDUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixxQkFBcUI7QUFDM0M7QUFDQTtBQUNBLE1BQU07QUFDTixzQkFBc0Isb0JBQW9CO0FBQzFDO0FBQ0Esd0VBQXdFLFdBQVc7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0Esc0JBQXNCLG9CQUFvQjtBQUMxQztBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3Q0FBd0MsaUVBQVU7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixhQUFhLGVBQWU7QUFDNUIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQSxhQUFhLDBCQUEwQjtBQUN2QyxhQUFhLFFBQVE7QUFDckI7QUFDQSxhQUFhLFFBQVE7QUFDckI7QUFDQSxhQUFhLFFBQVE7QUFDckIsYUFBYSxTQUFTO0FBQ3RCLGFBQWEsYUFBYTtBQUMxQjtBQUNBLGVBQWUsMkJBQTJCO0FBQzFDO0FBQ0Esa0JBQWtCO0FBQ2xCLGtEQUFrRCxJQUFJO0FBQ3REOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGVBQWUsbUVBQTBCO0FBQ3pDO0FBQ0EsaURBQWlELDJEQUFrQjtBQUNuRTtBQUNBLHdCQUF3Qiw2Q0FBNkM7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQSxXQUFXLG1FQUEwQjtBQUNyQyxXQUFXLG1FQUEwQjtBQUNyQyxXQUFXLG1FQUEwQjtBQUNyQztBQUNBO0FBQ0EsV0FBVyxtRUFBMEI7QUFDckM7QUFDQTtBQUNBLFdBQVcsbUVBQTBCO0FBQ3JDLFdBQVcsbUVBQTBCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGdCQUFnQjtBQUM1Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLG1FQUEwQjtBQUNyQyxlQUFlLHdEQUFlO0FBQzlCO0FBQ0EsV0FBVyxtRUFBMEI7QUFDckMsZUFBZSx3REFBZTtBQUM5QjtBQUNBLFdBQVcsbUVBQTBCO0FBQ3JDLGVBQWUsb0RBQVc7QUFDMUI7QUFDQSxXQUFXLG1FQUEwQjtBQUNyQyxlQUFlLGlEQUFRO0FBQ3ZCO0FBQ0EsV0FBVyxtRUFBMEI7QUFDckMsZUFBZSxrREFBUztBQUN4QjtBQUNBLFdBQVcsbUVBQTBCO0FBQ3JDLGVBQWUsbURBQVU7QUFDekI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLGlCQUFpQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLDZDQUE2QztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0IsMkRBQWM7O0FBRTlCO0FBQ0EscUNBQXFDLHVEQUFZO0FBQ2pELE1BQU07QUFDTiw0Q0FBNEMsdURBQVk7QUFDeEQ7O0FBRUEsb0JBQW9CLGtCQUFrQjtBQUN0QztBQUNBLGVBQWUsdURBQVk7QUFDM0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGVBQWU7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLGNBQWM7QUFDM0I7QUFDQTtBQUNBLGVBQWUsZUFBZTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxTQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxlQUFlO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlFQUFlLFlBQVksRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNzRCNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3lGO0FBQ25COztBQUV0RSxxQkFBcUIsaURBQU0sQ0FBQyxzREFBYTtBQUN6Qyx3QkFBd0IsaURBQU0sQ0FBQyxvREFBVztBQUMxQztBQUNBLGlEQUFNO0FBQ04saURBQU07QUFDTixzQkFBc0IsaURBQU0sQ0FBQyx1REFBYzs7QUFFM0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBSSxnREFBSztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxJQUFJLGdEQUFLO0FBQ1Q7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxJQUFJLGdEQUFLO0FBQ1Q7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEVBQUUsZ0RBQUs7QUFDUDtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQSxxQkFBcUIsc0RBQWE7QUFDbEM7O0FBRUE7QUFDQSw4Q0FBOEMsSUFBSTtBQUNsRDs7QUFFQTs7QUFFQTtBQUNBLHFEQUFxRCxJQUFJO0FBQ3pEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRCxtREFBUTtBQUNuRTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTixNQUFNLGdEQUFLO0FBQ1g7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOLE1BQU0sZ0RBQUs7QUFDWDtBQUNBLE9BQU87QUFDUCxNQUFNO0FBQ04sTUFBTSxnREFBSztBQUNYO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOLE1BQU0sZ0RBQUs7QUFDWDtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQkFBa0IsVUFBVTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUVBQW1FLE9BQU87QUFDMUU7O0FBRUE7QUFDQSxtRUFBbUUsTUFBTTtBQUN6RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLEVBQUUsZ0RBQUs7QUFDUDtBQUNBLEdBQUc7QUFDSCxFQUFFLGtEQUFPO0FBQ1Q7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksZ0RBQUs7QUFDVCxNQUFNLGdEQUFLO0FBQ1gsUUFBUSxnREFBSztBQUNiO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSw2QkFBNkIsZ0RBQUs7QUFDbEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTRCLGdEQUFLO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsbURBQVE7QUFDN0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isc0RBQWE7QUFDbkM7QUFDQSw2QkFBNkIsMEJBQTBCO0FBQ3ZEO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVSxzREFBYTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSLHFFQUFxRSxPQUFPO0FBQzVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZjTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FB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OztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0Isc0JBQXNCLElBQUk7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixJQUFJO0FBQ0osbUJBQW1CLGNBQWM7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlDQUFpQyxRQUFRO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUNBQWlDLFFBQVE7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQ3hSQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOztVQUVBO1VBQ0E7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7Ozs7O1dDUkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NKQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHVCQUF1Qiw0QkFBNEI7V0FDbkQ7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLG9CQUFvQjtXQUNyQztXQUNBLG1HQUFtRyxZQUFZO1dBQy9HO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsbUVBQW1FLGlDQUFpQztXQUNwRztXQUNBO1dBQ0E7V0FDQTs7Ozs7V0N6Q0E7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ2xCQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDOztXQUVqQztXQUNBO1dBQ0E7V0FDQSxLQUFLO1dBQ0wsZUFBZTtXQUNmO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JGQSxrQ0FBa0M7QUFDbEMseUNBQXlDO0FBQ3pDLG1FQUFtRTtBQUNoQztBQUVuQyxJQUFNLEdBQUcsR0FBRyxZQUFZO0FBQ3hCLElBQU0sQ0FBQyxHQUFHLE1BQU07QUFDaEIsSUFBTSxDQUFDLEdBQUcsT0FBTztBQUNqQixJQUFNLEtBQUssR0FBRyxHQUFHO0FBQ2pCLElBQU0sTUFBTSxHQUFHLEdBQUc7QUFDbEIsSUFBTSxTQUFTLEdBQUcsRUFBRTtBQUVwQiw2RkFBNkY7QUFDN0YsdUJBQXVCO0FBQ3ZCLDBCQUEwQjtBQUMxQiwwQkFBMEI7QUFDMUIscUtBQXFLO0FBQ3JLLDBDQUEwQztBQUMxQywwQkFBMEI7QUFDMUIsNEJBQTRCO0FBQzVCLDZCQUE2QjtBQUM3QixtQkFBbUI7QUFDbkIsOEJBQThCO0FBQzlCLGtCQUFrQjtBQUNsQiw2QkFBNkI7QUFDN0IsbUNBQW1DO0FBQ25DLDBCQUEwQjtBQUUxQixJQUFJLE1BQU0sR0FBRywrQ0FBK0M7SUFDeEQsYUFBYTtJQUNiLGdCQUFnQjtJQUNoQixzQkFBc0I7SUFDdEIsaUJBQWlCO0lBQ2pCLHFDQUFxQztJQUNyQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUN4SSxPQUFPLEdBQUcsR0FBRztJQUNiLGdCQUFnQixHQUFHLEdBQUc7SUFDdEIsU0FBUyxHQUFFLEtBQUs7SUFDaEIsVUFBVSxHQUFHLE1BQU07QUFFdkIsZ0VBQWdFO0FBQ2hFLG1CQUFtQjtBQUNuQixzQkFBc0I7QUFDdEIsMkJBQTJCO0FBQzNCLHNCQUFzQjtBQUN0QiwyQkFBMkI7QUFDM0IsNklBQTZJO0FBQzdJLGtCQUFrQjtBQUNsQiwyQkFBMkI7QUFDM0Isc0JBQXNCO0FBQ3RCLHNCQUFzQjtBQUV0QixTQUFlLE9BQU87Ozs7O3dCQUNBLHFCQUFNLGdEQUFPLENBQUMsTUFBTSxFQUFFLEVBQUMsYUFBYSxFQUFFLElBQUksRUFBQyxDQUFDOztvQkFBeEQsU0FBUyxHQUFHLFNBQTRDO29CQUN2QyxxQkFBTSxTQUFTLENBQUMsUUFBUSxFQUFFOztvQkFBM0MsY0FBYyxHQUFHLFNBQTBCO29CQUNoQyxxQkFBTSxjQUFjLENBQUMsV0FBVyxFQUFFOztvQkFBN0MsUUFBUSxHQUFHLFNBQWtDO29CQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQzs7Ozs7Q0FDeEI7QUFFRCxJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztBQUN2QyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU07QUFDakIsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLO0FBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztBQUU5QixPQUFPLEVBQUU7QUFHVCw2Q0FBNkM7QUFDN0MsdUJBQXVCO0FBQ3ZCLDJCQUEyQjtBQUMzQixvQ0FBb0M7QUFFcEMsc0JBQXNCO0FBQ3RCLG1DQUFtQztBQUVuQyx1QkFBdUI7QUFDdkIsK0NBQStDO0FBQy9DLG9CQUFvQjtBQUVwQix1Q0FBdUM7QUFDdkMsOENBQThDO0FBQzlDLHVFQUF1RTtBQUN2RSw4QkFBOEI7QUFFOUIsdURBQXVEO0FBQ3ZELG9EQUFvRDtBQUNwRCxrRUFBa0U7QUFFbEUsb0JBQW9CO0FBQ3BCLHNCQUFzQjtBQUN0QixrREFBa0Q7QUFFbEQsdUJBQXVCO0FBRXZCLDBEQUEwRDtBQUUxRCxnQ0FBZ0M7QUFDaEMsNERBQTREO0FBQzVELGFBQWE7QUFDYiw4REFBOEQ7QUFDOUQsYUFBYTtBQUNiLFVBQVU7QUFDVixTQUFTO0FBSVQsTUFBTTtBQUVOLHNDQUFzQztBQUN0QyxJQUFJO0FBRUosb0NBQW9DIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy94bWwtdXRpbHMvY291bnQtc3Vic3RyaW5nLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMveG1sLXV0aWxzL2ZpbmQtdGFnLWJ5LW5hbWUuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy94bWwtdXRpbHMvZmluZC10YWdzLWJ5LW5hbWUuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy94bWwtdXRpbHMvZ2V0LWF0dHJpYnV0ZS5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL3htbC11dGlscy9pbmRleC1vZi1tYXRjaC1lbmQuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy94bWwtdXRpbHMvaW5kZXgtb2YtbWF0Y2guanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci9pZ25vcmVkfEM6XFxVc2Vyc1xcTHVjYVxcUmVwb3NcXGdlb2xvZ3ktdnJcXG5vZGVfbW9kdWxlc1xcZ2VvdGlmZlxcZGlzdC1tb2R1bGVcXHNvdXJjZVxcY2xpZW50fGh0dHAiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci9pZ25vcmVkfEM6XFxVc2Vyc1xcTHVjYVxcUmVwb3NcXGdlb2xvZ3ktdnJcXG5vZGVfbW9kdWxlc1xcZ2VvdGlmZlxcZGlzdC1tb2R1bGVcXHNvdXJjZVxcY2xpZW50fGh0dHBzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvaWdub3JlZHxDOlxcVXNlcnNcXEx1Y2FcXFJlcG9zXFxnZW9sb2d5LXZyXFxub2RlX21vZHVsZXNcXGdlb3RpZmZcXGRpc3QtbW9kdWxlXFxzb3VyY2VcXGNsaWVudHx1cmwiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci9pZ25vcmVkfEM6XFxVc2Vyc1xcTHVjYVxcUmVwb3NcXGdlb2xvZ3ktdnJcXG5vZGVfbW9kdWxlc1xcZ2VvdGlmZlxcZGlzdC1tb2R1bGVcXHNvdXJjZXxmcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL0BwZXRhbW9yaWtlbi9mbG9hdDE2L3NyYy9EYXRhVmlldy5tanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9AcGV0YW1vcmlrZW4vZmxvYXQxNi9zcmMvX3V0aWwvYXJyYXlJdGVyYXRvci5tanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9AcGV0YW1vcmlrZW4vZmxvYXQxNi9zcmMvX3V0aWwvY29udmVydGVyLm1qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL0BwZXRhbW9yaWtlbi9mbG9hdDE2L3NyYy9fdXRpbC9tZXNzYWdlcy5tanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9AcGV0YW1vcmlrZW4vZmxvYXQxNi9zcmMvX3V0aWwvcHJpbW9yZGlhbHMubWpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9jb21wcmVzc2lvbi9iYXNlZGVjb2Rlci5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvY29tcHJlc3Npb24vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL2RhdGFzbGljZS5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvZGF0YXZpZXc2NC5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvZ2VvdGlmZi5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvZ2VvdGlmZmltYWdlLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9nZW90aWZmd3JpdGVyLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9nbG9iYWxzLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9sb2dnaW5nLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9wb29sLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9wcmVkaWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL3Jlc2FtcGxlLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9yZ2IuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL3NvdXJjZS9hcnJheWJ1ZmZlci5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvc291cmNlL2Jhc2Vzb3VyY2UuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL3NvdXJjZS9ibG9ja2Vkc291cmNlLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9zb3VyY2UvY2xpZW50L2Jhc2UuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL3NvdXJjZS9jbGllbnQvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL3NvdXJjZS9jbGllbnQvaHR0cC5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvc291cmNlL2NsaWVudC94aHIuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9nZW90aWZmL2Rpc3QtbW9kdWxlL3NvdXJjZS9maWxlLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9ub2RlX21vZHVsZXMvZ2VvdGlmZi9kaXN0LW1vZHVsZS9zb3VyY2UvZmlsZXJlYWRlci5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvc291cmNlL2h0dHB1dGlscy5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvc291cmNlL3JlbW90ZS5qcyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vbm9kZV9tb2R1bGVzL2dlb3RpZmYvZGlzdC1tb2R1bGUvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL25vZGVfbW9kdWxlcy9xdWljay1scnUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9lbnN1cmUgY2h1bmsiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvZ2V0IGphdmFzY3JpcHQgY2h1bmsgZmlsZW5hbWUiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9sb2FkIHNjcmlwdCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY291bnRTdWJzdHJpbmcoc3RyaW5nLCBzdWJzdHJpbmcpIHtcbiAgY29uc3QgcGF0dGVybiA9IG5ldyBSZWdFeHAoc3Vic3RyaW5nLCBcImdcIik7XG4gIGNvbnN0IG1hdGNoID0gc3RyaW5nLm1hdGNoKHBhdHRlcm4pO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaC5sZW5ndGggOiAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdW50U3Vic3RyaW5nO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGNvdW50U3Vic3RyaW5nO1xuIiwiY29uc3QgaW5kZXhPZk1hdGNoID0gcmVxdWlyZShcIi4vaW5kZXgtb2YtbWF0Y2guanNcIik7XG5jb25zdCBpbmRleE9mTWF0Y2hFbmQgPSByZXF1aXJlKFwiLi9pbmRleC1vZi1tYXRjaC1lbmQuanNcIik7XG5jb25zdCBjb3VudFN1YnN0cmluZyA9IHJlcXVpcmUoXCIuL2NvdW50LXN1YnN0cmluZy5qc1wiKTtcblxuZnVuY3Rpb24gZmluZFRhZ0J5TmFtZSh4bWwsIHRhZ05hbWUsIG9wdGlvbnMpIHtcbiAgY29uc3QgZGVidWcgPSAob3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnKSB8fCBmYWxzZTtcbiAgY29uc3QgbmVzdGVkID0gIShvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm5lc3RlZCA9PT0gZmFsc2UpO1xuXG4gIGNvbnN0IHN0YXJ0SW5kZXggPSAob3B0aW9ucyAmJiBvcHRpb25zLnN0YXJ0SW5kZXgpIHx8IDA7XG5cbiAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIlt4bWwtdXRpbHNdIHN0YXJ0aW5nIGZpbmRUYWdCeU5hbWUgd2l0aFwiLCB0YWdOYW1lLCBcIiBhbmQgXCIsIG9wdGlvbnMpO1xuXG4gIGNvbnN0IHN0YXJ0ID0gaW5kZXhPZk1hdGNoKHhtbCwgYFxcPCR7dGFnTmFtZX1bIFxcblxcPlxcL11gLCBzdGFydEluZGV4KTtcbiAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIlt4bWwtdXRpbHNdIHN0YXJ0OlwiLCBzdGFydCk7XG4gIGlmIChzdGFydCA9PT0gLTEpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgYWZ0ZXJTdGFydCA9IHhtbC5zbGljZShzdGFydCArIHRhZ05hbWUubGVuZ3RoKTtcblxuICBsZXQgcmVsYXRpdmVFbmQgPSBpbmRleE9mTWF0Y2hFbmQoYWZ0ZXJTdGFydCwgXCJeW148XSpbIC9dPlwiLCAwKTtcblxuICBjb25zdCBzZWxmQ2xvc2luZyA9IHJlbGF0aXZlRW5kICE9PSAtMSAmJiBhZnRlclN0YXJ0W3JlbGF0aXZlRW5kIC0gMV0gPT09IFwiL1wiO1xuICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiW3htbC11dGlsc10gc2VsZkNsb3Npbmc6XCIsIHNlbGZDbG9zaW5nKTtcblxuICBpZiAoc2VsZkNsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgLy8gY2hlY2sgaWYgdGFnIGhhcyBzdWJ0YWdzIHdpdGggdGhlIHNhbWUgbmFtZVxuICAgIGlmIChuZXN0ZWQpIHtcbiAgICAgIGxldCBzdGFydEluZGV4ID0gMDtcbiAgICAgIGxldCBvcGVuaW5ncyA9IDE7XG4gICAgICBsZXQgY2xvc2luZ3MgPSAwO1xuICAgICAgd2hpbGUgKChyZWxhdGl2ZUVuZCA9IGluZGV4T2ZNYXRjaEVuZChhZnRlclN0YXJ0LCBcIlsgL11cIiArIHRhZ05hbWUgKyBcIj5cIiwgc3RhcnRJbmRleCkpICE9PSAtMSkge1xuICAgICAgICBjb25zdCBjbGlwID0gYWZ0ZXJTdGFydC5zdWJzdHJpbmcoc3RhcnRJbmRleCwgcmVsYXRpdmVFbmQgKyAxKTtcbiAgICAgICAgb3BlbmluZ3MgKz0gY291bnRTdWJzdHJpbmcoY2xpcCwgXCI8XCIgKyB0YWdOYW1lICsgXCJbIFxcblxcdD5dXCIpO1xuICAgICAgICBjbG9zaW5ncyArPSBjb3VudFN1YnN0cmluZyhjbGlwLCBcIjwvXCIgKyB0YWdOYW1lICsgXCI+XCIpO1xuICAgICAgICAvLyB3ZSBjYW4ndCBoYXZlIG1vcmUgb3BlbmluZ3MgdGhhbiBjbG9zaW5nc1xuICAgICAgICBpZiAoY2xvc2luZ3MgPj0gb3BlbmluZ3MpIGJyZWFrO1xuICAgICAgICBzdGFydEluZGV4ID0gcmVsYXRpdmVFbmQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbGF0aXZlRW5kID0gaW5kZXhPZk1hdGNoRW5kKGFmdGVyU3RhcnQsIFwiWyAvXVwiICsgdGFnTmFtZSArIFwiPlwiLCAwKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBlbmQgPSBzdGFydCArIHRhZ05hbWUubGVuZ3RoICsgcmVsYXRpdmVFbmQgKyAxO1xuICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiW3htbC11dGlsc10gZW5kOlwiLCBlbmQpO1xuICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBvdXRlciA9IHhtbC5zbGljZShzdGFydCwgZW5kKTtcbiAgLy8gdGFnIGlzIGxpa2UgPGdtbDppZGVudGlmaWVyIGNvZGVTcGFjZT1cIk9HUFwiPnVybjpvZ2M6ZGVmOmNyczpFUFNHOjozMjYxNzwvZ21sOmlkZW50aWZpZXI+XG5cbiAgbGV0IGlubmVyO1xuICBpZiAoc2VsZkNsb3NpbmcpIHtcbiAgICBpbm5lciA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgaW5uZXIgPSBvdXRlci5zbGljZShvdXRlci5pbmRleE9mKFwiPlwiKSArIDEsIG91dGVyLmxhc3RJbmRleE9mKFwiPFwiKSk7XG4gIH1cblxuICByZXR1cm4geyBpbm5lciwgb3V0ZXIsIHN0YXJ0LCBlbmQgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kVGFnQnlOYW1lO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGZpbmRUYWdCeU5hbWU7XG4iLCJjb25zdCBmaW5kVGFnQnlOYW1lID0gcmVxdWlyZShcIi4vZmluZC10YWctYnktbmFtZS5qc1wiKTtcblxuZnVuY3Rpb24gZmluZFRhZ3NCeU5hbWUoeG1sLCB0YWdOYW1lLCBvcHRpb25zKSB7XG4gIGNvbnN0IHRhZ3MgPSBbXTtcbiAgY29uc3QgZGVidWcgPSAob3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnKSB8fCBmYWxzZTtcbiAgY29uc3QgbmVzdGVkID0gb3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5uZXN0ZWQgPT09IFwiYm9vbGVhblwiID8gb3B0aW9ucy5uZXN0ZWQgOiB0cnVlO1xuICBsZXQgc3RhcnRJbmRleCA9IChvcHRpb25zICYmIG9wdGlvbnMuc3RhcnRJbmRleCkgfHwgMDtcbiAgbGV0IHRhZztcbiAgd2hpbGUgKCh0YWcgPSBmaW5kVGFnQnlOYW1lKHhtbCwgdGFnTmFtZSwgeyBkZWJ1Zywgc3RhcnRJbmRleCB9KSkpIHtcbiAgICBpZiAobmVzdGVkKSB7XG4gICAgICBzdGFydEluZGV4ID0gdGFnLnN0YXJ0ICsgMSArIHRhZ05hbWUubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydEluZGV4ID0gdGFnLmVuZDtcbiAgICB9XG4gICAgdGFncy5wdXNoKHRhZyk7XG4gIH1cbiAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcImZpbmRUYWdzQnlOYW1lIGZvdW5kXCIsIHRhZ3MubGVuZ3RoLCBcInRhZ3NcIik7XG4gIHJldHVybiB0YWdzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbmRUYWdzQnlOYW1lO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGZpbmRUYWdzQnlOYW1lO1xuIiwiZnVuY3Rpb24gZ2V0QXR0cmlidXRlKHRhZywgYXR0cmlidXRlTmFtZSwgb3B0aW9ucykge1xuICBjb25zdCBkZWJ1ZyA9IChvcHRpb25zICYmIG9wdGlvbnMuZGVidWcpIHx8IGZhbHNlO1xuICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiW3htbC11dGlsc10gZ2V0dGluZyBcIiArIGF0dHJpYnV0ZU5hbWUgKyBcIiBpbiBcIiArIHRhZyk7XG5cbiAgY29uc3QgeG1sID0gdHlwZW9mIHRhZyA9PT0gXCJvYmplY3RcIiA/IHRhZy5vdXRlciA6IHRhZztcblxuICAvLyBvbmx5IHNlYXJjaCBmb3IgYXR0cmlidXRlcyBpbiB0aGUgb3BlbmluZyB0YWdcbiAgY29uc3Qgb3BlbmluZyA9IHhtbC5zbGljZSgwLCB4bWwuaW5kZXhPZihcIj5cIikgKyAxKTtcblxuICBjb25zdCBxdW90ZWNoYXJzID0gWydcIicsIFwiJ1wiXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdW90ZWNoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IHF1b3RlY2hhcnNbaV07XG4gICAgY29uc3QgcGF0dGVybiA9IGF0dHJpYnV0ZU5hbWUgKyBcIlxcXFw9XCIgKyBjaGFyICsgXCIoW15cIiArIGNoYXIgKyBcIl0qKVwiICsgY2hhcjtcbiAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiW3htbC11dGlsc10gcGF0dGVybjpcIiwgcGF0dGVybik7XG5cbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgY29uc3QgbWF0Y2ggPSByZS5leGVjKG9wZW5pbmcpO1xuICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coXCJbeG1sLXV0aWxzXSBtYXRjaDpcIiwgbWF0Y2gpO1xuICAgIGlmIChtYXRjaCkgcmV0dXJuIG1hdGNoWzFdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QXR0cmlidXRlO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGdldEF0dHJpYnV0ZTtcbiIsImZ1bmN0aW9uIGluZGV4T2ZNYXRjaEVuZCh4bWwsIHBhdHRlcm4sIHN0YXJ0SW5kZXgpIHtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICBjb25zdCBtYXRjaCA9IHJlLmV4ZWMoeG1sLnNsaWNlKHN0YXJ0SW5kZXgpKTtcbiAgaWYgKG1hdGNoKSByZXR1cm4gc3RhcnRJbmRleCArIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoIC0gMTtcbiAgZWxzZSByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXhPZk1hdGNoRW5kO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGluZGV4T2ZNYXRjaEVuZDtcbiIsImZ1bmN0aW9uIGluZGV4T2ZNYXRjaCh4bWwsIHBhdHRlcm4sIHN0YXJ0SW5kZXgpIHtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICBjb25zdCBtYXRjaCA9IHJlLmV4ZWMoeG1sLnNsaWNlKHN0YXJ0SW5kZXgpKTtcbiAgaWYgKG1hdGNoKSByZXR1cm4gc3RhcnRJbmRleCArIG1hdGNoLmluZGV4O1xuICBlbHNlIHJldHVybiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbmRleE9mTWF0Y2g7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gaW5kZXhPZk1hdGNoO1xuIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsgc2FmZUlmTmVlZGVkIH0gZnJvbSBcIi4vX3V0aWwvYXJyYXlJdGVyYXRvci5tanNcIjtcbmltcG9ydCB7IGNvbnZlcnRUb051bWJlciwgcm91bmRUb0Zsb2F0MTZCaXRzIH0gZnJvbSBcIi4vX3V0aWwvY29udmVydGVyLm1qc1wiO1xuaW1wb3J0IHtcbiAgRGF0YVZpZXdQcm90b3R5cGVHZXRVaW50MTYsXG4gIERhdGFWaWV3UHJvdG90eXBlU2V0VWludDE2LFxufSBmcm9tIFwiLi9fdXRpbC9wcmltb3JkaWFscy5tanNcIjtcblxuLyoqXG4gKiByZXR1cm5zIGFuIHVuc2lnbmVkIDE2LWJpdCBmbG9hdCBhdCB0aGUgc3BlY2lmaWVkIGJ5dGUgb2Zmc2V0IGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBEYXRhVmlld1xuICpcbiAqIEBwYXJhbSB7RGF0YVZpZXd9IGRhdGFWaWV3XG4gKiBAcGFyYW0ge251bWJlcn0gYnl0ZU9mZnNldFxuICogQHBhcmFtIHtbYm9vbGVhbl19IG9wdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGbG9hdDE2KGRhdGFWaWV3LCBieXRlT2Zmc2V0LCAuLi5vcHRzKSB7XG4gIHJldHVybiBjb252ZXJ0VG9OdW1iZXIoXG4gICAgRGF0YVZpZXdQcm90b3R5cGVHZXRVaW50MTYoZGF0YVZpZXcsIGJ5dGVPZmZzZXQsIC4uLnNhZmVJZk5lZWRlZChvcHRzKSlcbiAgKTtcbn1cblxuLyoqXG4gKiBzdG9yZXMgYW4gdW5zaWduZWQgMTYtYml0IGZsb2F0IHZhbHVlIGF0IHRoZSBzcGVjaWZpZWQgYnl0ZSBvZmZzZXQgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIERhdGFWaWV3XG4gKlxuICogQHBhcmFtIHtEYXRhVmlld30gZGF0YVZpZXdcbiAqIEBwYXJhbSB7bnVtYmVyfSBieXRlT2Zmc2V0XG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAqIEBwYXJhbSB7W2Jvb2xlYW5dfSBvcHRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGbG9hdDE2KGRhdGFWaWV3LCBieXRlT2Zmc2V0LCB2YWx1ZSwgLi4ub3B0cykge1xuICByZXR1cm4gRGF0YVZpZXdQcm90b3R5cGVTZXRVaW50MTYoXG4gICAgZGF0YVZpZXcsXG4gICAgYnl0ZU9mZnNldCxcbiAgICByb3VuZFRvRmxvYXQxNkJpdHModmFsdWUpLFxuICAgIC4uLnNhZmVJZk5lZWRlZChvcHRzKVxuICApO1xufVxuIiwiaW1wb3J0IHtcbiAgQXJyYXlJdGVyYXRvclByb3RvdHlwZSxcbiAgQXJyYXlJdGVyYXRvclByb3RvdHlwZU5leHQsXG4gIEFycmF5UHJvdG90eXBlU3ltYm9sSXRlcmF0b3IsXG4gIEdlbmVyYXRvclByb3RvdHlwZU5leHQsXG4gIEl0ZXJhdG9yUHJvdG90eXBlLFxuICBOYXRpdmVBcnJheVByb3RvdHlwZVN5bWJvbEl0ZXJhdG9yLFxuICBOYXRpdmVXZWFrTWFwLFxuICBPYmplY3RDcmVhdGUsXG4gIE9iamVjdERlZmluZVByb3BlcnR5LFxuICBSZWZsZWN0R2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICBSZWZsZWN0T3duS2V5cyxcbiAgU3ltYm9sSXRlcmF0b3IsXG4gIFdlYWtNYXBQcm90b3R5cGVHZXQsXG4gIFdlYWtNYXBQcm90b3R5cGVTZXQsXG59IGZyb20gXCIuL3ByaW1vcmRpYWxzLm1qc1wiO1xuXG4vKiogQHR5cGUge1dlYWtNYXA8e30sIEl0ZXJhYmxlSXRlcmF0b3I8YW55Pj59ICovXG5jb25zdCBhcnJheUl0ZXJhdG9ycyA9IG5ldyBOYXRpdmVXZWFrTWFwKCk7XG5cbmNvbnN0IFNhZmVJdGVyYXRvclByb3RvdHlwZSA9IE9iamVjdENyZWF0ZShudWxsLCB7XG4gIG5leHQ6IHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIGNvbnN0IGFycmF5SXRlcmF0b3IgPSBXZWFrTWFwUHJvdG90eXBlR2V0KGFycmF5SXRlcmF0b3JzLCB0aGlzKTtcbiAgICAgIHJldHVybiBBcnJheUl0ZXJhdG9yUHJvdG90eXBlTmV4dChhcnJheUl0ZXJhdG9yKTtcbiAgICB9LFxuICB9LFxuXG4gIFtTeW1ib2xJdGVyYXRvcl06IHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWVzKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgfSxcbn0pO1xuXG4vKipcbiAqIFdyYXAgdGhlIEFycmF5IGFyb3VuZCB0aGUgU2FmZUl0ZXJhdG9yIElmIEFycmF5LnByb3RvdHlwZSBbQEBpdGVyYXRvcl0gaGFzIGJlZW4gbW9kaWZpZWRcbiAqXG4gKiBAdHlwZSB7PFQ+KGFycmF5OiBUW10pID0+IEl0ZXJhYmxlPFQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZUlmTmVlZGVkKGFycmF5KSB7XG4gIGlmIChcbiAgICBhcnJheVtTeW1ib2xJdGVyYXRvcl0gPT09IE5hdGl2ZUFycmF5UHJvdG90eXBlU3ltYm9sSXRlcmF0b3IgJiZcbiAgICBBcnJheUl0ZXJhdG9yUHJvdG90eXBlLm5leHQgPT09IEFycmF5SXRlcmF0b3JQcm90b3R5cGVOZXh0XG4gICkge1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIGNvbnN0IHNhZmUgPSBPYmplY3RDcmVhdGUoU2FmZUl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgV2Vha01hcFByb3RvdHlwZVNldChhcnJheUl0ZXJhdG9ycywgc2FmZSwgQXJyYXlQcm90b3R5cGVTeW1ib2xJdGVyYXRvcihhcnJheSkpO1xuICByZXR1cm4gc2FmZTtcbn1cblxuLyoqIEB0eXBlIHtXZWFrTWFwPHt9LCBHZW5lcmF0b3I8YW55Pj59ICovXG5jb25zdCBnZW5lcmF0b3JzID0gbmV3IE5hdGl2ZVdlYWtNYXAoKTtcblxuLyoqIEBzZWUgaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy0lYXJyYXlpdGVyYXRvcnByb3RvdHlwZSUtb2JqZWN0ICovXG5jb25zdCBEdW1teUFycmF5SXRlcmF0b3JQcm90b3R5cGUgPSBPYmplY3RDcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHtcbiAgbmV4dDoge1xuICAgIHZhbHVlOiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgY29uc3QgZ2VuZXJhdG9yID0gV2Vha01hcFByb3RvdHlwZUdldChnZW5lcmF0b3JzLCB0aGlzKTtcbiAgICAgIHJldHVybiBHZW5lcmF0b3JQcm90b3R5cGVOZXh0KGdlbmVyYXRvcik7XG4gICAgfSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gIH0sXG59KTtcblxuZm9yIChjb25zdCBrZXkgb2YgUmVmbGVjdE93bktleXMoQXJyYXlJdGVyYXRvclByb3RvdHlwZSkpIHtcbiAgLy8gbmV4dCBtZXRob2QgaGFzIGFscmVhZHkgZGVmaW5lZFxuICBpZiAoa2V5ID09PSBcIm5leHRcIikge1xuICAgIGNvbnRpbnVlO1xuICB9XG5cbiAgLy8gQ29weSBBcnJheUl0ZXJhdG9yUHJvdG90eXBlIGRlc2NyaXB0b3JzIHRvIER1bW15QXJyYXlJdGVyYXRvclByb3RvdHlwZVxuICBPYmplY3REZWZpbmVQcm9wZXJ0eShEdW1teUFycmF5SXRlcmF0b3JQcm90b3R5cGUsIGtleSwgUmVmbGVjdEdldE93blByb3BlcnR5RGVzY3JpcHRvcihBcnJheUl0ZXJhdG9yUHJvdG90eXBlLCBrZXkpKTtcbn1cblxuLyoqXG4gKiBXcmFwIHRoZSBHZW5lcmF0b3IgYXJvdW5kIHRoZSBkdW1teSBBcnJheUl0ZXJhdG9yXG4gKlxuICogQHR5cGUgezxUPihnZW5lcmF0b3I6IEdlbmVyYXRvcjxUPikgPT4gSXRlcmFibGVJdGVyYXRvcjxUPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXAoZ2VuZXJhdG9yKSB7XG4gIGNvbnN0IGR1bW15ID0gT2JqZWN0Q3JlYXRlKER1bW15QXJyYXlJdGVyYXRvclByb3RvdHlwZSk7XG4gIFdlYWtNYXBQcm90b3R5cGVTZXQoZ2VuZXJhdG9ycywgZHVtbXksIGdlbmVyYXRvcik7XG4gIHJldHVybiBkdW1teTtcbn1cbiIsIi8vIGFsZ29yaXRobTogaHR0cDovL2ZveC10b29sa2l0Lm9yZy9mdHAvZmFzdGhhbGZmbG9hdGNvbnZlcnNpb24ucGRmXG5cbmltcG9ydCB7XG4gIE5hdGl2ZUFycmF5QnVmZmVyLFxuICBOYXRpdmVGbG9hdDMyQXJyYXksXG4gIE5hdGl2ZVVpbnQzMkFycmF5LFxufSBmcm9tIFwiLi9wcmltb3JkaWFscy5tanNcIjtcblxuY29uc3QgYnVmZmVyID0gbmV3IE5hdGl2ZUFycmF5QnVmZmVyKDQpO1xuY29uc3QgZmxvYXRWaWV3ID0gbmV3IE5hdGl2ZUZsb2F0MzJBcnJheShidWZmZXIpO1xuY29uc3QgdWludDMyVmlldyA9IG5ldyBOYXRpdmVVaW50MzJBcnJheShidWZmZXIpO1xuXG5jb25zdCBiYXNlVGFibGUgPSBuZXcgTmF0aXZlVWludDMyQXJyYXkoNTEyKTtcbmNvbnN0IHNoaWZ0VGFibGUgPSBuZXcgTmF0aXZlVWludDMyQXJyYXkoNTEyKTtcblxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBjb25zdCBlID0gaSAtIDEyNztcblxuICAvLyB2ZXJ5IHNtYWxsIG51bWJlciAoMCwgLTApXG4gIGlmIChlIDwgLTI3KSB7XG4gICAgYmFzZVRhYmxlW2ldICAgICAgICAgPSAweDAwMDA7XG4gICAgYmFzZVRhYmxlW2kgfCAweDEwMF0gPSAweDgwMDA7XG4gICAgc2hpZnRUYWJsZVtpXSAgICAgICAgID0gMjQ7XG4gICAgc2hpZnRUYWJsZVtpIHwgMHgxMDBdID0gMjQ7XG5cbiAgLy8gc21hbGwgbnVtYmVyIChkZW5vcm0pXG4gIH0gZWxzZSBpZiAoZSA8IC0xNCkge1xuICAgIGJhc2VUYWJsZVtpXSAgICAgICAgID0gIDB4MDQwMCA+PiAoLWUgLSAxNCk7XG4gICAgYmFzZVRhYmxlW2kgfCAweDEwMF0gPSAoMHgwNDAwID4+ICgtZSAtIDE0KSkgfCAweDgwMDA7XG4gICAgc2hpZnRUYWJsZVtpXSAgICAgICAgID0gLWUgLSAxO1xuICAgIHNoaWZ0VGFibGVbaSB8IDB4MTAwXSA9IC1lIC0gMTtcblxuICAvLyBub3JtYWwgbnVtYmVyXG4gIH0gZWxzZSBpZiAoZSA8PSAxNSkge1xuICAgIGJhc2VUYWJsZVtpXSAgICAgICAgID0gIChlICsgMTUpIDw8IDEwO1xuICAgIGJhc2VUYWJsZVtpIHwgMHgxMDBdID0gKChlICsgMTUpIDw8IDEwKSB8IDB4ODAwMDtcbiAgICBzaGlmdFRhYmxlW2ldICAgICAgICAgPSAxMztcbiAgICBzaGlmdFRhYmxlW2kgfCAweDEwMF0gPSAxMztcblxuICAvLyBsYXJnZSBudW1iZXIgKEluZmluaXR5LCAtSW5maW5pdHkpXG4gIH0gZWxzZSBpZiAoZSA8IDEyOCkge1xuICAgIGJhc2VUYWJsZVtpXSAgICAgICAgID0gMHg3YzAwO1xuICAgIGJhc2VUYWJsZVtpIHwgMHgxMDBdID0gMHhmYzAwO1xuICAgIHNoaWZ0VGFibGVbaV0gICAgICAgICA9IDI0O1xuICAgIHNoaWZ0VGFibGVbaSB8IDB4MTAwXSA9IDI0O1xuXG4gIC8vIHN0YXkgKE5hTiwgSW5maW5pdHksIC1JbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBiYXNlVGFibGVbaV0gICAgICAgICA9IDB4N2MwMDtcbiAgICBiYXNlVGFibGVbaSB8IDB4MTAwXSA9IDB4ZmMwMDtcbiAgICBzaGlmdFRhYmxlW2ldICAgICAgICAgPSAxMztcbiAgICBzaGlmdFRhYmxlW2kgfCAweDEwMF0gPSAxMztcbiAgfVxufVxuXG4vKipcbiAqIHJvdW5kIGEgbnVtYmVyIHRvIGEgaGFsZiBmbG9hdCBudW1iZXIgYml0c1xuICpcbiAqIEBwYXJhbSB7dW5rbm93bn0gbnVtIC0gZG91YmxlIGZsb2F0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBoYWxmIGZsb2F0IG51bWJlciBiaXRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZFRvRmxvYXQxNkJpdHMobnVtKSB7XG4gIGZsb2F0Vmlld1swXSA9IC8qKiBAdHlwZSB7YW55fSAqLyAobnVtKTtcbiAgY29uc3QgZiA9IHVpbnQzMlZpZXdbMF07XG4gIGNvbnN0IGUgPSAoZiA+PiAyMykgJiAweDFmZjtcbiAgcmV0dXJuIGJhc2VUYWJsZVtlXSArICgoZiAmIDB4MDA3ZmZmZmYpID4+IHNoaWZ0VGFibGVbZV0pO1xufVxuXG5jb25zdCBtYW50aXNzYVRhYmxlID0gbmV3IE5hdGl2ZVVpbnQzMkFycmF5KDIwNDgpO1xuY29uc3QgZXhwb25lbnRUYWJsZSA9IG5ldyBOYXRpdmVVaW50MzJBcnJheSg2NCk7XG5jb25zdCBvZmZzZXRUYWJsZSA9IG5ldyBOYXRpdmVVaW50MzJBcnJheSg2NCk7XG5cbmZvciAobGV0IGkgPSAxOyBpIDwgMTAyNDsgKytpKSB7XG4gIGxldCBtID0gaSA8PCAxMzsgICAgLy8gemVybyBwYWQgbWFudGlzc2EgYml0c1xuICBsZXQgZSA9IDA7ICAgICAgICAgIC8vIHplcm8gZXhwb25lbnRcblxuICAvLyBub3JtYWxpemVkXG4gIHdoaWxlKChtICYgMHgwMDgwMDAwMCkgPT09IDApIHtcbiAgICBtIDw8PSAxO1xuICAgIGUgLT0gMHgwMDgwMDAwMDsgIC8vIGRlY3JlbWVudCBleHBvbmVudFxuICB9XG5cbiAgbSAmPSB+MHgwMDgwMDAwMDsgICAvLyBjbGVhciBsZWFkaW5nIDEgYml0XG4gIGUgKz0gMHgzODgwMDAwMDsgICAgLy8gYWRqdXN0IGJpYXNcblxuICBtYW50aXNzYVRhYmxlW2ldID0gbSB8IGU7XG59XG5mb3IgKGxldCBpID0gMTAyNDsgaSA8IDIwNDg7ICsraSkge1xuICBtYW50aXNzYVRhYmxlW2ldID0gMHgzODAwMDAwMCArICgoaSAtIDEwMjQpIDw8IDEzKTtcbn1cblxuZm9yIChsZXQgaSA9IDE7IGkgPCAzMTsgKytpKSB7XG4gIGV4cG9uZW50VGFibGVbaV0gPSBpIDw8IDIzO1xufVxuZXhwb25lbnRUYWJsZVszMV0gPSAweDQ3ODAwMDAwO1xuZXhwb25lbnRUYWJsZVszMl0gPSAweDgwMDAwMDAwO1xuZm9yIChsZXQgaSA9IDMzOyBpIDwgNjM7ICsraSkge1xuICBleHBvbmVudFRhYmxlW2ldID0gMHg4MDAwMDAwMCArICgoaSAtIDMyKSA8PCAyMyk7XG59XG5leHBvbmVudFRhYmxlWzYzXSA9IDB4Yzc4MDAwMDA7XG5cbmZvciAobGV0IGkgPSAxOyBpIDwgNjQ7ICsraSkge1xuICBpZiAoaSAhPT0gMzIpIHtcbiAgICBvZmZzZXRUYWJsZVtpXSA9IDEwMjQ7XG4gIH1cbn1cblxuLyoqXG4gKiBjb252ZXJ0IGEgaGFsZiBmbG9hdCBudW1iZXIgYml0cyB0byBhIG51bWJlclxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBmbG9hdDE2Yml0cyAtIGhhbGYgZmxvYXQgbnVtYmVyIGJpdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRvdWJsZSBmbG9hdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFRvTnVtYmVyKGZsb2F0MTZiaXRzKSB7XG4gIGNvbnN0IG0gPSBmbG9hdDE2Yml0cyA+PiAxMDtcbiAgdWludDMyVmlld1swXSA9IG1hbnRpc3NhVGFibGVbb2Zmc2V0VGFibGVbbV0gKyAoZmxvYXQxNmJpdHMgJiAweDNmZildICsgZXhwb25lbnRUYWJsZVttXTtcbiAgcmV0dXJuIGZsb2F0Vmlld1swXTtcbn1cbiIsImV4cG9ydCBjb25zdCBUSElTX0lTX05PVF9BTl9PQkpFQ1QgPSBcIlRoaXMgaXMgbm90IGFuIG9iamVjdFwiO1xuZXhwb3J0IGNvbnN0IFRISVNfSVNfTk9UX0FfRkxPQVQxNkFSUkFZX09CSkVDVCA9IFwiVGhpcyBpcyBub3QgYSBGbG9hdDE2QXJyYXkgb2JqZWN0XCI7XG5leHBvcnQgY29uc3QgVEhJU19DT05TVFJVQ1RPUl9JU19OT1RfQV9TVUJDTEFTU19PRl9GTE9BVDE2QVJSQVkgPVxuICBcIlRoaXMgY29uc3RydWN0b3IgaXMgbm90IGEgc3ViY2xhc3Mgb2YgRmxvYXQxNkFycmF5XCI7XG5leHBvcnQgY29uc3QgVEhFX0NPTlNUUlVDVE9SX1BST1BFUlRZX1ZBTFVFX0lTX05PVF9BTl9PQkpFQ1QgPVxuICBcIlRoZSBjb25zdHJ1Y3RvciBwcm9wZXJ0eSB2YWx1ZSBpcyBub3QgYW4gb2JqZWN0XCI7XG5leHBvcnQgY29uc3QgU1BFQ0lFU19DT05TVFJVQ1RPUl9ESUROVF9SRVRVUk5fVFlQRURBUlJBWV9PQkpFQ1QgPVxuICBcIlNwZWNpZXMgY29uc3RydWN0b3IgZGlkbid0IHJldHVybiBUeXBlZEFycmF5IG9iamVjdFwiO1xuZXhwb3J0IGNvbnN0IERFUklWRURfQ09OU1RSVUNUT1JfQ1JFQVRFRF9UWVBFREFSUkFZX09CSkVDVF9XSElDSF9XQVNfVE9PX1NNQUxMX0xFTkdUSCA9XG4gIFwiRGVyaXZlZCBjb25zdHJ1Y3RvciBjcmVhdGVkIFR5cGVkQXJyYXkgb2JqZWN0IHdoaWNoIHdhcyB0b28gc21hbGwgbGVuZ3RoXCI7XG5leHBvcnQgY29uc3QgQVRURU1QVElOR19UT19BQ0NFU1NfREVUQUNIRURfQVJSQVlCVUZGRVIgPVxuICBcIkF0dGVtcHRpbmcgdG8gYWNjZXNzIGRldGFjaGVkIEFycmF5QnVmZmVyXCI7XG5leHBvcnQgY29uc3QgQ0FOTk9UX0NPTlZFUlRfVU5ERUZJTkVEX09SX05VTExfVE9fT0JKRUNUID1cbiAgXCJDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3RcIjtcbmV4cG9ydCBjb25zdCBDQU5OT1RfTUlYX0JJR0lOVF9BTkRfT1RIRVJfVFlQRVMgPVxuICBcIkNhbm5vdCBtaXggQmlnSW50IGFuZCBvdGhlciB0eXBlcywgdXNlIGV4cGxpY2l0IGNvbnZlcnNpb25zXCI7XG5leHBvcnQgY29uc3QgSVRFUkFUT1JfUFJPUEVSVFlfSVNfTk9UX0NBTExBQkxFID0gXCJAQGl0ZXJhdG9yIHByb3BlcnR5IGlzIG5vdCBjYWxsYWJsZVwiO1xuZXhwb3J0IGNvbnN0IFJFRFVDRV9PRl9FTVBUWV9BUlJBWV9XSVRIX05PX0lOSVRJQUxfVkFMVUUgPVxuICBcIlJlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWVcIjtcbmV4cG9ydCBjb25zdCBUSEVfQ09NUEFSSVNPTl9GVU5DVElPTl9NVVNUX0JFX0VJVEhFUl9BX0ZVTkNUSU9OX09SX1VOREVGSU5FRCA9XG4gIFwiVGhlIGNvbXBhcmlzb24gZnVuY3Rpb24gbXVzdCBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciB1bmRlZmluZWRcIjtcbmV4cG9ydCBjb25zdCBPRkZTRVRfSVNfT1VUX09GX0JPVU5EUyA9IFwiT2Zmc2V0IGlzIG91dCBvZiBib3VuZHNcIjtcbiIsIi8qIGVzbGludC1kaXNhYmxlIG5vLXJlc3RyaWN0ZWQtZ2xvYmFscywgbm8tcmVzdHJpY3RlZC1zeW50YXggKi9cbi8qIGdsb2JhbCBTaGFyZWRBcnJheUJ1ZmZlciAqL1xuXG5pbXBvcnQgeyBDQU5OT1RfQ09OVkVSVF9VTkRFRklORURfT1JfTlVMTF9UT19PQkpFQ1QgfSBmcm9tIFwiLi9tZXNzYWdlcy5tanNcIjtcblxuLyoqIEB0eXBlIHs8VCBleHRlbmRzICguLi5hcmdzOiBhbnkpID0+IGFueT4odGFyZ2V0OiBUKSA9PiAodGhpc0FyZzogVGhpc1R5cGU8VD4sIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnl9ICovXG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyh0YXJnZXQpIHtcbiAgcmV0dXJuICh0aGlzQXJnLCAuLi5hcmdzKSA9PiB7XG4gICAgcmV0dXJuIFJlZmxlY3RBcHBseSh0YXJnZXQsIHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufVxuXG4vKiogQHR5cGUgeyh0YXJnZXQ6IGFueSwga2V5OiBzdHJpbmcgfCBzeW1ib2wpID0+ICh0aGlzQXJnOiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnl9ICovXG5mdW5jdGlvbiB1bmN1cnJ5VGhpc0dldHRlcih0YXJnZXQsIGtleSkge1xuICByZXR1cm4gdW5jdXJyeVRoaXMoXG4gICAgUmVmbGVjdEdldE93blByb3BlcnR5RGVzY3JpcHRvcihcbiAgICAgIHRhcmdldCxcbiAgICAgIGtleVxuICAgICkuZ2V0XG4gICk7XG59XG5cbi8vIFJlZmxlY3RcbmV4cG9ydCBjb25zdCB7XG4gIGFwcGx5OiBSZWZsZWN0QXBwbHksXG4gIGNvbnN0cnVjdDogUmVmbGVjdENvbnN0cnVjdCxcbiAgZGVmaW5lUHJvcGVydHk6IFJlZmxlY3REZWZpbmVQcm9wZXJ0eSxcbiAgZ2V0OiBSZWZsZWN0R2V0LFxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IFJlZmxlY3RHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIGdldFByb3RvdHlwZU9mOiBSZWZsZWN0R2V0UHJvdG90eXBlT2YsXG4gIGhhczogUmVmbGVjdEhhcyxcbiAgb3duS2V5czogUmVmbGVjdE93bktleXMsXG4gIHNldDogUmVmbGVjdFNldCxcbiAgc2V0UHJvdG90eXBlT2Y6IFJlZmxlY3RTZXRQcm90b3R5cGVPZixcbn0gPSBSZWZsZWN0O1xuXG4vLyBQcm94eVxuZXhwb3J0IGNvbnN0IE5hdGl2ZVByb3h5ID0gUHJveHk7XG5cbi8vIE51bWJlclxuZXhwb3J0IGNvbnN0IHtcbiAgTUFYX1NBRkVfSU5URUdFUixcbiAgaXNGaW5pdGU6IE51bWJlcklzRmluaXRlLFxuICBpc05hTjogTnVtYmVySXNOYU4sXG59ID0gTnVtYmVyO1xuXG4vLyBTeW1ib2xcbmV4cG9ydCBjb25zdCB7XG4gIGl0ZXJhdG9yOiBTeW1ib2xJdGVyYXRvcixcbiAgc3BlY2llczogU3ltYm9sU3BlY2llcyxcbiAgdG9TdHJpbmdUYWc6IFN5bWJvbFRvU3RyaW5nVGFnLFxuICBmb3I6IFN5bWJvbEZvcixcbn0gPSBTeW1ib2w7XG5cbi8vIE9iamVjdFxuZXhwb3J0IGNvbnN0IE5hdGl2ZU9iamVjdCA9IE9iamVjdDtcbmV4cG9ydCBjb25zdCB7XG4gIGNyZWF0ZTogT2JqZWN0Q3JlYXRlLFxuICBkZWZpbmVQcm9wZXJ0eTogT2JqZWN0RGVmaW5lUHJvcGVydHksXG4gIGZyZWV6ZTogT2JqZWN0RnJlZXplLFxuICBpczogT2JqZWN0SXMsXG59ID0gTmF0aXZlT2JqZWN0O1xuY29uc3QgT2JqZWN0UHJvdG90eXBlID0gTmF0aXZlT2JqZWN0LnByb3RvdHlwZTtcbi8qKiBAdHlwZSB7KG9iamVjdDogb2JqZWN0LCBrZXk6IFByb3BlcnR5S2V5KSA9PiBGdW5jdGlvbiB8IHVuZGVmaW5lZH0gKi9cbmV4cG9ydCBjb25zdCBPYmplY3RQcm90b3R5cGVfX2xvb2t1cEdldHRlcl9fID0gLyoqIEB0eXBlIHthbnl9ICovIChPYmplY3RQcm90b3R5cGUpLl9fbG9va3VwR2V0dGVyX19cbiAgPyB1bmN1cnJ5VGhpcygvKiogQHR5cGUge2FueX0gKi8gKE9iamVjdFByb3RvdHlwZSkuX19sb29rdXBHZXR0ZXJfXylcbiAgOiAob2JqZWN0LCBrZXkpID0+IHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgIHRocm93IE5hdGl2ZVR5cGVFcnJvcihcbiAgICAgICAgQ0FOTk9UX0NPTlZFUlRfVU5ERUZJTkVEX09SX05VTExfVE9fT0JKRUNUXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB0YXJnZXQgPSBOYXRpdmVPYmplY3Qob2JqZWN0KTtcbiAgICBkbyB7XG4gICAgICBjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdEdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSk7XG4gICAgICBpZiAoZGVzY3JpcHRvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChPYmplY3RIYXNPd24oZGVzY3JpcHRvciwgXCJnZXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvci5nZXQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSB3aGlsZSAoKHRhcmdldCA9IFJlZmxlY3RHZXRQcm90b3R5cGVPZih0YXJnZXQpKSAhPT0gbnVsbCk7XG4gIH07XG4vKiogQHR5cGUgeyhvYmplY3Q6IG9iamVjdCwga2V5OiBQcm9wZXJ0eUtleSkgPT4gYm9vbGVhbn0gKi9cbmV4cG9ydCBjb25zdCBPYmplY3RIYXNPd24gPSAvKiogQHR5cGUge2FueX0gKi8gKE5hdGl2ZU9iamVjdCkuaGFzT3duIHx8XG4gIHVuY3VycnlUaGlzKE9iamVjdFByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5cbi8vIEFycmF5XG5jb25zdCBOYXRpdmVBcnJheSA9IEFycmF5O1xuZXhwb3J0IGNvbnN0IEFycmF5SXNBcnJheSA9IE5hdGl2ZUFycmF5LmlzQXJyYXk7XG5jb25zdCBBcnJheVByb3RvdHlwZSA9IE5hdGl2ZUFycmF5LnByb3RvdHlwZTtcbi8qKiBAdHlwZSB7KGFycmF5OiBBcnJheUxpa2U8dW5rbm93bj4sIHNlcGFyYXRvcj86IHN0cmluZykgPT4gc3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IEFycmF5UHJvdG90eXBlSm9pbiA9IHVuY3VycnlUaGlzKEFycmF5UHJvdG90eXBlLmpvaW4pO1xuLyoqIEB0eXBlIHs8VD4oYXJyYXk6IFRbXSwgLi4uaXRlbXM6IFRbXSkgPT4gbnVtYmVyfSAqL1xuZXhwb3J0IGNvbnN0IEFycmF5UHJvdG90eXBlUHVzaCA9IHVuY3VycnlUaGlzKEFycmF5UHJvdG90eXBlLnB1c2gpO1xuLyoqIEB0eXBlIHsoYXJyYXk6IEFycmF5TGlrZTx1bmtub3duPiwgLi4ub3B0czogYW55W10pID0+IHN0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBBcnJheVByb3RvdHlwZVRvTG9jYWxlU3RyaW5nID0gdW5jdXJyeVRoaXMoXG4gIEFycmF5UHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nXG4pO1xuZXhwb3J0IGNvbnN0IE5hdGl2ZUFycmF5UHJvdG90eXBlU3ltYm9sSXRlcmF0b3IgPSBBcnJheVByb3RvdHlwZVtTeW1ib2xJdGVyYXRvcl07XG4vKiogQHR5cGUgezxUPihhcnJheTogVFtdKSA9PiBJdGVyYWJsZUl0ZXJhdG9yPFQ+fSAqL1xuZXhwb3J0IGNvbnN0IEFycmF5UHJvdG90eXBlU3ltYm9sSXRlcmF0b3IgPSB1bmN1cnJ5VGhpcyhOYXRpdmVBcnJheVByb3RvdHlwZVN5bWJvbEl0ZXJhdG9yKTtcblxuLy8gTWF0aFxuZXhwb3J0IGNvbnN0IE1hdGhUcnVuYyA9IE1hdGgudHJ1bmM7XG5cbi8vIEFycmF5QnVmZmVyXG5leHBvcnQgY29uc3QgTmF0aXZlQXJyYXlCdWZmZXIgPSBBcnJheUJ1ZmZlcjtcbmV4cG9ydCBjb25zdCBBcnJheUJ1ZmZlcklzVmlldyA9IE5hdGl2ZUFycmF5QnVmZmVyLmlzVmlldztcbmNvbnN0IEFycmF5QnVmZmVyUHJvdG90eXBlID0gTmF0aXZlQXJyYXlCdWZmZXIucHJvdG90eXBlO1xuLyoqIEB0eXBlIHsoYnVmZmVyOiBBcnJheUJ1ZmZlciwgYmVnaW4/OiBudW1iZXIsIGVuZD86IG51bWJlcikgPT4gbnVtYmVyfSAqL1xuZXhwb3J0IGNvbnN0IEFycmF5QnVmZmVyUHJvdG90eXBlU2xpY2UgPSB1bmN1cnJ5VGhpcyhBcnJheUJ1ZmZlclByb3RvdHlwZS5zbGljZSk7XG4vKiogQHR5cGUgeyhidWZmZXI6IEFycmF5QnVmZmVyKSA9PiBBcnJheUJ1ZmZlcn0gKi9cbmV4cG9ydCBjb25zdCBBcnJheUJ1ZmZlclByb3RvdHlwZUdldEJ5dGVMZW5ndGggPSB1bmN1cnJ5VGhpc0dldHRlcihBcnJheUJ1ZmZlclByb3RvdHlwZSwgXCJieXRlTGVuZ3RoXCIpO1xuXG4vLyBTaGFyZWRBcnJheUJ1ZmZlclxuZXhwb3J0IGNvbnN0IE5hdGl2ZVNoYXJlZEFycmF5QnVmZmVyID0gdHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSBcInVuZGVmaW5lZFwiID8gU2hhcmVkQXJyYXlCdWZmZXIgOiBudWxsO1xuLyoqIEB0eXBlIHsoYnVmZmVyOiBTaGFyZWRBcnJheUJ1ZmZlcikgPT4gU2hhcmVkQXJyYXlCdWZmZXJ9ICovXG5leHBvcnQgY29uc3QgU2hhcmVkQXJyYXlCdWZmZXJQcm90b3R5cGVHZXRCeXRlTGVuZ3RoID0gTmF0aXZlU2hhcmVkQXJyYXlCdWZmZXJcbiAgJiYgdW5jdXJyeVRoaXNHZXR0ZXIoTmF0aXZlU2hhcmVkQXJyYXlCdWZmZXIucHJvdG90eXBlLCBcImJ5dGVMZW5ndGhcIik7XG5cbi8vIFR5cGVkQXJyYXlcbi8qKiBAdHlwZWRlZiB7VWludDhBcnJheXxVaW50OENsYW1wZWRBcnJheXxVaW50MTZBcnJheXxVaW50MzJBcnJheXxJbnQ4QXJyYXl8SW50MTZBcnJheXxJbnQzMkFycmF5fEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl8QmlnVWludDY0QXJyYXl8QmlnSW50NjRBcnJheX0gVHlwZWRBcnJheSAqL1xuLyoqIEB0eXBlIHthbnl9ICovXG5leHBvcnQgY29uc3QgVHlwZWRBcnJheSA9IFJlZmxlY3RHZXRQcm90b3R5cGVPZihVaW50OEFycmF5KTtcbmNvbnN0IFR5cGVkQXJyYXlGcm9tID0gVHlwZWRBcnJheS5mcm9tO1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGUgPSBUeXBlZEFycmF5LnByb3RvdHlwZTtcbmV4cG9ydCBjb25zdCBOYXRpdmVUeXBlZEFycmF5UHJvdG90eXBlU3ltYm9sSXRlcmF0b3IgPSBUeXBlZEFycmF5UHJvdG90eXBlW1N5bWJvbEl0ZXJhdG9yXTtcbi8qKiBAdHlwZSB7KHR5cGVkQXJyYXk6IFR5cGVkQXJyYXkpID0+IEl0ZXJhYmxlSXRlcmF0b3I8bnVtYmVyPn0gKi9cbmV4cG9ydCBjb25zdCBUeXBlZEFycmF5UHJvdG90eXBlS2V5cyA9IHVuY3VycnlUaGlzKFR5cGVkQXJyYXlQcm90b3R5cGUua2V5cyk7XG4vKiogQHR5cGUgeyh0eXBlZEFycmF5OiBUeXBlZEFycmF5KSA9PiBJdGVyYWJsZUl0ZXJhdG9yPG51bWJlcj59ICovXG5leHBvcnQgY29uc3QgVHlwZWRBcnJheVByb3RvdHlwZVZhbHVlcyA9IHVuY3VycnlUaGlzKFxuICBUeXBlZEFycmF5UHJvdG90eXBlLnZhbHVlc1xuKTtcbi8qKiBAdHlwZSB7KHR5cGVkQXJyYXk6IFR5cGVkQXJyYXkpID0+IEl0ZXJhYmxlSXRlcmF0b3I8W251bWJlciwgbnVtYmVyXT59ICovXG5leHBvcnQgY29uc3QgVHlwZWRBcnJheVByb3RvdHlwZUVudHJpZXMgPSB1bmN1cnJ5VGhpcyhcbiAgVHlwZWRBcnJheVByb3RvdHlwZS5lbnRyaWVzXG4pO1xuLyoqIEB0eXBlIHsodHlwZWRBcnJheTogVHlwZWRBcnJheSwgYXJyYXk6IEFycmF5TGlrZTxudW1iZXI+LCBvZmZzZXQ/OiBudW1iZXIpID0+IHZvaWR9ICovXG5leHBvcnQgY29uc3QgVHlwZWRBcnJheVByb3RvdHlwZVNldCA9IHVuY3VycnlUaGlzKFR5cGVkQXJyYXlQcm90b3R5cGUuc2V0KTtcbi8qKiBAdHlwZSB7PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pih0eXBlZEFycmF5OiBUKSA9PiBUfSAqL1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGVSZXZlcnNlID0gdW5jdXJyeVRoaXMoXG4gIFR5cGVkQXJyYXlQcm90b3R5cGUucmV2ZXJzZVxuKTtcbi8qKiBAdHlwZSB7PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pih0eXBlZEFycmF5OiBULCB2YWx1ZTogbnVtYmVyLCBzdGFydD86IG51bWJlciwgZW5kPzogbnVtYmVyKSA9PiBUfSAqL1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGVGaWxsID0gdW5jdXJyeVRoaXMoVHlwZWRBcnJheVByb3RvdHlwZS5maWxsKTtcbi8qKiBAdHlwZSB7PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pih0eXBlZEFycmF5OiBULCB0YXJnZXQ6IG51bWJlciwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKSA9PiBUfSAqL1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGVDb3B5V2l0aGluID0gdW5jdXJyeVRoaXMoXG4gIFR5cGVkQXJyYXlQcm90b3R5cGUuY29weVdpdGhpblxuKTtcbi8qKiBAdHlwZSB7PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pih0eXBlZEFycmF5OiBULCBjb21wYXJlRm4/OiAoYTogbnVtYmVyLCBiOiBudW1iZXIpID0+IG51bWJlcikgPT4gVH0gKi9cbmV4cG9ydCBjb25zdCBUeXBlZEFycmF5UHJvdG90eXBlU29ydCA9IHVuY3VycnlUaGlzKFR5cGVkQXJyYXlQcm90b3R5cGUuc29ydCk7XG4vKiogQHR5cGUgezxUIGV4dGVuZHMgVHlwZWRBcnJheT4odHlwZWRBcnJheTogVCwgc3RhcnQ/OiBudW1iZXIsIGVuZD86IG51bWJlcikgPT4gVH0gKi9cbmV4cG9ydCBjb25zdCBUeXBlZEFycmF5UHJvdG90eXBlU2xpY2UgPSB1bmN1cnJ5VGhpcyhUeXBlZEFycmF5UHJvdG90eXBlLnNsaWNlKTtcbi8qKiBAdHlwZSB7PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pih0eXBlZEFycmF5OiBULCBzdGFydD86IG51bWJlciwgZW5kPzogbnVtYmVyKSA9PiBUfSAqL1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGVTdWJhcnJheSA9IHVuY3VycnlUaGlzKFxuICBUeXBlZEFycmF5UHJvdG90eXBlLnN1YmFycmF5XG4pO1xuLyoqIEB0eXBlIHsoKHR5cGVkQXJyYXk6IFR5cGVkQXJyYXkpID0+IEFycmF5QnVmZmVyKX0gKi9cbmV4cG9ydCBjb25zdCBUeXBlZEFycmF5UHJvdG90eXBlR2V0QnVmZmVyID0gdW5jdXJyeVRoaXNHZXR0ZXIoXG4gIFR5cGVkQXJyYXlQcm90b3R5cGUsXG4gIFwiYnVmZmVyXCJcbik7XG4vKiogQHR5cGUgeygodHlwZWRBcnJheTogVHlwZWRBcnJheSkgPT4gbnVtYmVyKX0gKi9cbmV4cG9ydCBjb25zdCBUeXBlZEFycmF5UHJvdG90eXBlR2V0Qnl0ZU9mZnNldCA9IHVuY3VycnlUaGlzR2V0dGVyKFxuICBUeXBlZEFycmF5UHJvdG90eXBlLFxuICBcImJ5dGVPZmZzZXRcIlxuKTtcbi8qKiBAdHlwZSB7KCh0eXBlZEFycmF5OiBUeXBlZEFycmF5KSA9PiBudW1iZXIpfSAqL1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGVHZXRMZW5ndGggPSB1bmN1cnJ5VGhpc0dldHRlcihcbiAgVHlwZWRBcnJheVByb3RvdHlwZSxcbiAgXCJsZW5ndGhcIlxuKTtcbi8qKiBAdHlwZSB7KHRhcmdldDogdW5rbm93bikgPT4gc3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGVHZXRTeW1ib2xUb1N0cmluZ1RhZyA9IHVuY3VycnlUaGlzR2V0dGVyKFxuICBUeXBlZEFycmF5UHJvdG90eXBlLFxuICBTeW1ib2xUb1N0cmluZ1RhZ1xuKTtcblxuLy8gVWludDE2QXJyYXlcbmV4cG9ydCBjb25zdCBOYXRpdmVVaW50MTZBcnJheSA9IFVpbnQxNkFycmF5O1xuLyoqIEB0eXBlIHtVaW50MTZBcnJheUNvbnN0cnVjdG9yW1wiZnJvbVwiXX0gKi9cbmV4cG9ydCBjb25zdCBVaW50MTZBcnJheUZyb20gPSAoLi4uYXJncykgPT4ge1xuICByZXR1cm4gUmVmbGVjdEFwcGx5KFR5cGVkQXJyYXlGcm9tLCBOYXRpdmVVaW50MTZBcnJheSwgYXJncyk7XG59O1xuXG4vLyBVaW50MzJBcnJheVxuZXhwb3J0IGNvbnN0IE5hdGl2ZVVpbnQzMkFycmF5ID0gVWludDMyQXJyYXk7XG5cbi8vIEZsb2F0MzJBcnJheVxuZXhwb3J0IGNvbnN0IE5hdGl2ZUZsb2F0MzJBcnJheSA9IEZsb2F0MzJBcnJheTtcblxuLy8gQXJyYXlJdGVyYXRvclxuLyoqIEB0eXBlIHthbnl9ICovXG5leHBvcnQgY29uc3QgQXJyYXlJdGVyYXRvclByb3RvdHlwZSA9IFJlZmxlY3RHZXRQcm90b3R5cGVPZihbXVtTeW1ib2xJdGVyYXRvcl0oKSk7XG4vKiogQHR5cGUgezxUPihhcnJheUl0ZXJhdG9yOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+KSA9PiBJdGVyYXRvclJlc3VsdDxUPn0gKi9cbmV4cG9ydCBjb25zdCBBcnJheUl0ZXJhdG9yUHJvdG90eXBlTmV4dCA9IHVuY3VycnlUaGlzKEFycmF5SXRlcmF0b3JQcm90b3R5cGUubmV4dCk7XG5cbi8vIEdlbmVyYXRvclxuLyoqIEB0eXBlIHs8VCA9IHVua25vd24sIFRSZXR1cm4gPSBhbnksIFROZXh0ID0gdW5rbm93bj4oZ2VuZXJhdG9yOiBHZW5lcmF0b3I8VCwgVFJldHVybiwgVE5leHQ+LCB2YWx1ZT86IFROZXh0KSA9PiBUfSAqL1xuZXhwb3J0IGNvbnN0IEdlbmVyYXRvclByb3RvdHlwZU5leHQgPSB1bmN1cnJ5VGhpcygoZnVuY3Rpb24qICgpIHt9KSgpLm5leHQpO1xuXG4vLyBJdGVyYXRvclxuZXhwb3J0IGNvbnN0IEl0ZXJhdG9yUHJvdG90eXBlID0gUmVmbGVjdEdldFByb3RvdHlwZU9mKEFycmF5SXRlcmF0b3JQcm90b3R5cGUpO1xuXG4vLyBEYXRhVmlld1xuY29uc3QgRGF0YVZpZXdQcm90b3R5cGUgPSBEYXRhVmlldy5wcm90b3R5cGU7XG4vKiogQHR5cGUgeyhkYXRhVmlldzogRGF0YVZpZXcsIGJ5dGVPZmZzZXQ6IG51bWJlciwgbGl0dGxlRW5kaWFuPzogYm9vbGVhbikgPT4gbnVtYmVyfSAqL1xuZXhwb3J0IGNvbnN0IERhdGFWaWV3UHJvdG90eXBlR2V0VWludDE2ID0gdW5jdXJyeVRoaXMoXG4gIERhdGFWaWV3UHJvdG90eXBlLmdldFVpbnQxNlxuKTtcbi8qKiBAdHlwZSB7KGRhdGFWaWV3OiBEYXRhVmlldywgYnl0ZU9mZnNldDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyLCBsaXR0bGVFbmRpYW4/OiBib29sZWFuKSA9PiB2b2lkfSAqL1xuZXhwb3J0IGNvbnN0IERhdGFWaWV3UHJvdG90eXBlU2V0VWludDE2ID0gdW5jdXJyeVRoaXMoXG4gIERhdGFWaWV3UHJvdG90eXBlLnNldFVpbnQxNlxuKTtcblxuLy8gRXJyb3JcbmV4cG9ydCBjb25zdCBOYXRpdmVUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG5leHBvcnQgY29uc3QgTmF0aXZlUmFuZ2VFcnJvciA9IFJhbmdlRXJyb3I7XG5cbi8vIFdlYWtTZXRcbi8qKlxuICogRG8gbm90IGNvbnN0cnVjdCB3aXRoIGFyZ3VtZW50cyB0byBhdm9pZCBjYWxsaW5nIHRoZSBcImFkZFwiIG1ldGhvZFxuICpcbiAqIEB0eXBlIHt7bmV3IDxUIGV4dGVuZHMge30+KCk6IFdlYWtTZXQ8VD59fVxuICovXG5leHBvcnQgY29uc3QgTmF0aXZlV2Vha1NldCA9IFdlYWtTZXQ7XG5jb25zdCBXZWFrU2V0UHJvdG90eXBlID0gTmF0aXZlV2Vha1NldC5wcm90b3R5cGU7XG4vKiogQHR5cGUgezxUIGV4dGVuZHMge30+KHNldDogV2Vha1NldDxUPiwgdmFsdWU6IFQpID0+IFNldDxUPn0gKi9cbmV4cG9ydCBjb25zdCBXZWFrU2V0UHJvdG90eXBlQWRkID0gdW5jdXJyeVRoaXMoV2Vha1NldFByb3RvdHlwZS5hZGQpO1xuLyoqIEB0eXBlIHs8VCBleHRlbmRzIHt9PihzZXQ6IFdlYWtTZXQ8VD4sIHZhbHVlOiBUKSA9PiBib29sZWFufSAqL1xuZXhwb3J0IGNvbnN0IFdlYWtTZXRQcm90b3R5cGVIYXMgPSB1bmN1cnJ5VGhpcyhXZWFrU2V0UHJvdG90eXBlLmhhcyk7XG5cbi8vIFdlYWtNYXBcbi8qKlxuICogRG8gbm90IGNvbnN0cnVjdCB3aXRoIGFyZ3VtZW50cyB0byBhdm9pZCBjYWxsaW5nIHRoZSBcInNldFwiIG1ldGhvZFxuICpcbiAqIEB0eXBlIHt7bmV3IDxLIGV4dGVuZHMge30sIFY+KCk6IFdlYWtNYXA8SywgVj59fVxuICovXG5leHBvcnQgY29uc3QgTmF0aXZlV2Vha01hcCA9IFdlYWtNYXA7XG5jb25zdCBXZWFrTWFwUHJvdG90eXBlID0gTmF0aXZlV2Vha01hcC5wcm90b3R5cGU7XG4vKiogQHR5cGUgezxLIGV4dGVuZHMge30sIFY+KHdlYWtNYXA6IFdlYWtNYXA8SywgVj4sIGtleTogSykgPT4gVn0gKi9cbmV4cG9ydCBjb25zdCBXZWFrTWFwUHJvdG90eXBlR2V0ID0gdW5jdXJyeVRoaXMoV2Vha01hcFByb3RvdHlwZS5nZXQpO1xuLyoqIEB0eXBlIHs8SyBleHRlbmRzIHt9LCBWPih3ZWFrTWFwOiBXZWFrTWFwPEssIFY+LCBrZXk6IEspID0+IGJvb2xlYW59ICovXG5leHBvcnQgY29uc3QgV2Vha01hcFByb3RvdHlwZUhhcyA9IHVuY3VycnlUaGlzKFdlYWtNYXBQcm90b3R5cGUuaGFzKTtcbi8qKiBAdHlwZSB7PEsgZXh0ZW5kcyB7fSwgVj4od2Vha01hcDogV2Vha01hcDxLLCBWPiwga2V5OiBLLCB2YWx1ZTogVikgPT4gV2Vha01hcH0gKi9cbmV4cG9ydCBjb25zdCBXZWFrTWFwUHJvdG90eXBlU2V0ID0gdW5jdXJyeVRoaXMoV2Vha01hcFByb3RvdHlwZS5zZXQpO1xuIiwiaW1wb3J0IHsgYXBwbHlQcmVkaWN0b3IgfSBmcm9tICcuLi9wcmVkaWN0b3IuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlRGVjb2RlciB7XG4gIGFzeW5jIGRlY29kZShmaWxlRGlyZWN0b3J5LCBidWZmZXIpIHtcbiAgICBjb25zdCBkZWNvZGVkID0gYXdhaXQgdGhpcy5kZWNvZGVCbG9jayhidWZmZXIpO1xuICAgIGNvbnN0IHByZWRpY3RvciA9IGZpbGVEaXJlY3RvcnkuUHJlZGljdG9yIHx8IDE7XG4gICAgaWYgKHByZWRpY3RvciAhPT0gMSkge1xuICAgICAgY29uc3QgaXNUaWxlZCA9ICFmaWxlRGlyZWN0b3J5LlN0cmlwT2Zmc2V0cztcbiAgICAgIGNvbnN0IHRpbGVXaWR0aCA9IGlzVGlsZWQgPyBmaWxlRGlyZWN0b3J5LlRpbGVXaWR0aCA6IGZpbGVEaXJlY3RvcnkuSW1hZ2VXaWR0aDtcbiAgICAgIGNvbnN0IHRpbGVIZWlnaHQgPSBpc1RpbGVkID8gZmlsZURpcmVjdG9yeS5UaWxlTGVuZ3RoIDogKFxuICAgICAgICBmaWxlRGlyZWN0b3J5LlJvd3NQZXJTdHJpcCB8fCBmaWxlRGlyZWN0b3J5LkltYWdlTGVuZ3RoXG4gICAgICApO1xuICAgICAgcmV0dXJuIGFwcGx5UHJlZGljdG9yKFxuICAgICAgICBkZWNvZGVkLCBwcmVkaWN0b3IsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgZmlsZURpcmVjdG9yeS5CaXRzUGVyU2FtcGxlLFxuICAgICAgICBmaWxlRGlyZWN0b3J5LlBsYW5hckNvbmZpZ3VyYXRpb24sXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZGVjb2RlZDtcbiAgfVxufVxuIiwiY29uc3QgcmVnaXN0cnkgPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWNvZGVyKGNhc2VzLCBpbXBvcnRGbikge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoY2FzZXMpKSB7XG4gICAgY2FzZXMgPSBbY2FzZXNdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIH1cbiAgY2FzZXMuZm9yRWFjaCgoYykgPT4gcmVnaXN0cnkuc2V0KGMsIGltcG9ydEZuKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWNvZGVyKGZpbGVEaXJlY3RvcnkpIHtcbiAgY29uc3QgaW1wb3J0Rm4gPSByZWdpc3RyeS5nZXQoZmlsZURpcmVjdG9yeS5Db21wcmVzc2lvbik7XG4gIGlmICghaW1wb3J0Rm4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gY29tcHJlc3Npb24gbWV0aG9kIGlkZW50aWZpZXI6ICR7ZmlsZURpcmVjdG9yeS5Db21wcmVzc2lvbn1gKTtcbiAgfVxuICBjb25zdCBEZWNvZGVyID0gYXdhaXQgaW1wb3J0Rm4oKTtcbiAgcmV0dXJuIG5ldyBEZWNvZGVyKGZpbGVEaXJlY3RvcnkpO1xufVxuXG4vLyBBZGQgZGVmYXVsdCBkZWNvZGVycyB0byByZWdpc3RyeSAoZW5kLXVzZXIgbWF5IG92ZXJyaWRlIHdpdGggb3RoZXIgaW1wbGVtZW50YXRpb25zKVxuYWRkRGVjb2RlcihbdW5kZWZpbmVkLCAxXSwgKCkgPT4gaW1wb3J0KCcuL3Jhdy5qcycpLnRoZW4oKG0pID0+IG0uZGVmYXVsdCkpO1xuYWRkRGVjb2Rlcig1LCAoKSA9PiBpbXBvcnQoJy4vbHp3LmpzJykudGhlbigobSkgPT4gbS5kZWZhdWx0KSk7XG5hZGREZWNvZGVyKDYsICgpID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKCdvbGQgc3R5bGUgSlBFRyBjb21wcmVzc2lvbiBpcyBub3Qgc3VwcG9ydGVkLicpO1xufSk7XG5hZGREZWNvZGVyKDcsICgpID0+IGltcG9ydCgnLi9qcGVnLmpzJykudGhlbigobSkgPT4gbS5kZWZhdWx0KSk7XG5hZGREZWNvZGVyKFs4LCAzMjk0Nl0sICgpID0+IGltcG9ydCgnLi9kZWZsYXRlLmpzJykudGhlbigobSkgPT4gbS5kZWZhdWx0KSk7XG5hZGREZWNvZGVyKDMyNzczLCAoKSA9PiBpbXBvcnQoJy4vcGFja2JpdHMuanMnKS50aGVuKChtKSA9PiBtLmRlZmF1bHQpKTtcbmFkZERlY29kZXIoMzQ4ODcsICgpID0+IGltcG9ydCgnLi9sZXJjLmpzJykudGhlbigobSkgPT4gbS5kZWZhdWx0KSk7XG5hZGREZWNvZGVyKDUwMDAxLCAoKSA9PiBpbXBvcnQoJy4vd2ViaW1hZ2UuanMnKS50aGVuKChtKSA9PiBtLmRlZmF1bHQpKTtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFTbGljZSB7XG4gIGNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLCBzbGljZU9mZnNldCwgbGl0dGxlRW5kaWFuLCBiaWdUaWZmKSB7XG4gICAgdGhpcy5fZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoYXJyYXlCdWZmZXIpO1xuICAgIHRoaXMuX3NsaWNlT2Zmc2V0ID0gc2xpY2VPZmZzZXQ7XG4gICAgdGhpcy5fbGl0dGxlRW5kaWFuID0gbGl0dGxlRW5kaWFuO1xuICAgIHRoaXMuX2JpZ1RpZmYgPSBiaWdUaWZmO1xuICB9XG5cbiAgZ2V0IHNsaWNlT2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9zbGljZU9mZnNldDtcbiAgfVxuXG4gIGdldCBzbGljZVRvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2xpY2VPZmZzZXQgKyB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoO1xuICB9XG5cbiAgZ2V0IGxpdHRsZUVuZGlhbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbGl0dGxlRW5kaWFuO1xuICB9XG5cbiAgZ2V0IGJpZ1RpZmYoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JpZ1RpZmY7XG4gIH1cblxuICBnZXQgYnVmZmVyKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5idWZmZXI7XG4gIH1cblxuICBjb3ZlcnMob2Zmc2V0LCBsZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZU9mZnNldCA8PSBvZmZzZXQgJiYgdGhpcy5zbGljZVRvcCA+PSBvZmZzZXQgKyBsZW5ndGg7XG4gIH1cblxuICByZWFkVWludDgob2Zmc2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldFVpbnQ4KFxuICAgICAgb2Zmc2V0IC0gdGhpcy5fc2xpY2VPZmZzZXQsIHRoaXMuX2xpdHRsZUVuZGlhbixcbiAgICApO1xuICB9XG5cbiAgcmVhZEludDgob2Zmc2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldEludDgoXG4gICAgICBvZmZzZXQgLSB0aGlzLl9zbGljZU9mZnNldCwgdGhpcy5fbGl0dGxlRW5kaWFuLFxuICAgICk7XG4gIH1cblxuICByZWFkVWludDE2KG9mZnNldCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5nZXRVaW50MTYoXG4gICAgICBvZmZzZXQgLSB0aGlzLl9zbGljZU9mZnNldCwgdGhpcy5fbGl0dGxlRW5kaWFuLFxuICAgICk7XG4gIH1cblxuICByZWFkSW50MTYob2Zmc2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldEludDE2KFxuICAgICAgb2Zmc2V0IC0gdGhpcy5fc2xpY2VPZmZzZXQsIHRoaXMuX2xpdHRsZUVuZGlhbixcbiAgICApO1xuICB9XG5cbiAgcmVhZFVpbnQzMihvZmZzZXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVZpZXcuZ2V0VWludDMyKFxuICAgICAgb2Zmc2V0IC0gdGhpcy5fc2xpY2VPZmZzZXQsIHRoaXMuX2xpdHRsZUVuZGlhbixcbiAgICApO1xuICB9XG5cbiAgcmVhZEludDMyKG9mZnNldCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5nZXRJbnQzMihcbiAgICAgIG9mZnNldCAtIHRoaXMuX3NsaWNlT2Zmc2V0LCB0aGlzLl9saXR0bGVFbmRpYW4sXG4gICAgKTtcbiAgfVxuXG4gIHJlYWRGbG9hdDMyKG9mZnNldCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5nZXRGbG9hdDMyKFxuICAgICAgb2Zmc2V0IC0gdGhpcy5fc2xpY2VPZmZzZXQsIHRoaXMuX2xpdHRsZUVuZGlhbixcbiAgICApO1xuICB9XG5cbiAgcmVhZEZsb2F0NjQob2Zmc2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldEZsb2F0NjQoXG4gICAgICBvZmZzZXQgLSB0aGlzLl9zbGljZU9mZnNldCwgdGhpcy5fbGl0dGxlRW5kaWFuLFxuICAgICk7XG4gIH1cblxuICByZWFkVWludDY0KG9mZnNldCkge1xuICAgIGNvbnN0IGxlZnQgPSB0aGlzLnJlYWRVaW50MzIob2Zmc2V0KTtcbiAgICBjb25zdCByaWdodCA9IHRoaXMucmVhZFVpbnQzMihvZmZzZXQgKyA0KTtcbiAgICBsZXQgY29tYmluZWQ7XG4gICAgaWYgKHRoaXMuX2xpdHRsZUVuZGlhbikge1xuICAgICAgY29tYmluZWQgPSBsZWZ0ICsgKCgyICoqIDMyKSAqIHJpZ2h0KTtcbiAgICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoY29tYmluZWQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgJHtjb21iaW5lZH0gZXhjZWVkcyBNQVhfU0FGRV9JTlRFR0VSLiBgXG4gICAgICAgICAgKyAnUHJlY2lzaW9uIG1heSBiZSBsb3N0LiBQbGVhc2UgcmVwb3J0IGlmIHlvdSBnZXQgdGhpcyBtZXNzYWdlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9nZW90aWZmanMvZ2VvdGlmZi5qcy9pc3N1ZXMnLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbWJpbmVkO1xuICAgIH1cbiAgICBjb21iaW5lZCA9ICgoMiAqKiAzMikgKiBsZWZ0KSArIHJpZ2h0O1xuICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoY29tYmluZWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGAke2NvbWJpbmVkfSBleGNlZWRzIE1BWF9TQUZFX0lOVEVHRVIuIGBcbiAgICAgICAgKyAnUHJlY2lzaW9uIG1heSBiZSBsb3N0LiBQbGVhc2UgcmVwb3J0IGlmIHlvdSBnZXQgdGhpcyBtZXNzYWdlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9nZW90aWZmanMvZ2VvdGlmZi5qcy9pc3N1ZXMnLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tYmluZWQ7XG4gIH1cblxuICAvLyBhZGFwdGVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU1MzM4Mzg0LzgwNjA1OTFcbiAgcmVhZEludDY0KG9mZnNldCkge1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgY29uc3QgaXNOZWdhdGl2ZSA9ICh0aGlzLl9kYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyAodGhpcy5fbGl0dGxlRW5kaWFuID8gNyA6IDApKSAmIDB4ODApXG4gICAgICA+IDA7XG4gICAgbGV0IGNhcnJ5aW5nID0gdHJ1ZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgbGV0IGJ5dGUgPSB0aGlzLl9kYXRhVmlldy5nZXRVaW50OChcbiAgICAgICAgb2Zmc2V0ICsgKHRoaXMuX2xpdHRsZUVuZGlhbiA/IGkgOiA3IC0gaSksXG4gICAgICApO1xuICAgICAgaWYgKGlzTmVnYXRpdmUpIHtcbiAgICAgICAgaWYgKGNhcnJ5aW5nKSB7XG4gICAgICAgICAgaWYgKGJ5dGUgIT09IDB4MDApIHtcbiAgICAgICAgICAgIGJ5dGUgPSB+KGJ5dGUgLSAxKSAmIDB4ZmY7XG4gICAgICAgICAgICBjYXJyeWluZyA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBieXRlID0gfmJ5dGUgJiAweGZmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YWx1ZSArPSBieXRlICogKDI1NiAqKiBpKTtcbiAgICB9XG4gICAgaWYgKGlzTmVnYXRpdmUpIHtcbiAgICAgIHZhbHVlID0gLXZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICByZWFkT2Zmc2V0KG9mZnNldCkge1xuICAgIGlmICh0aGlzLl9iaWdUaWZmKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWFkVWludDY0KG9mZnNldCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlYWRVaW50MzIob2Zmc2V0KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgZ2V0RmxvYXQxNiB9IGZyb20gJ0BwZXRhbW9yaWtlbi9mbG9hdDE2JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVZpZXc2NCB7XG4gIGNvbnN0cnVjdG9yKGFycmF5QnVmZmVyKSB7XG4gICAgdGhpcy5fZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoYXJyYXlCdWZmZXIpO1xuICB9XG5cbiAgZ2V0IGJ1ZmZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVZpZXcuYnVmZmVyO1xuICB9XG5cbiAgZ2V0VWludDY0KG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gICAgY29uc3QgbGVmdCA9IHRoaXMuZ2V0VWludDMyKG9mZnNldCwgbGl0dGxlRW5kaWFuKTtcbiAgICBjb25zdCByaWdodCA9IHRoaXMuZ2V0VWludDMyKG9mZnNldCArIDQsIGxpdHRsZUVuZGlhbik7XG4gICAgbGV0IGNvbWJpbmVkO1xuICAgIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICAgIGNvbWJpbmVkID0gbGVmdCArICgoMiAqKiAzMikgKiByaWdodCk7XG4gICAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGNvbWJpbmVkKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYCR7Y29tYmluZWR9IGV4Y2VlZHMgTUFYX1NBRkVfSU5URUdFUi4gYFxuICAgICAgICAgICsgJ1ByZWNpc2lvbiBtYXkgYmUgbG9zdC4gUGxlYXNlIHJlcG9ydCBpZiB5b3UgZ2V0IHRoaXMgbWVzc2FnZSB0byBodHRwczovL2dpdGh1Yi5jb20vZ2VvdGlmZmpzL2dlb3RpZmYuanMvaXNzdWVzJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb21iaW5lZDtcbiAgICB9XG4gICAgY29tYmluZWQgPSAoKDIgKiogMzIpICogbGVmdCkgKyByaWdodDtcbiAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGNvbWJpbmVkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgJHtjb21iaW5lZH0gZXhjZWVkcyBNQVhfU0FGRV9JTlRFR0VSLiBgXG4gICAgICAgICsgJ1ByZWNpc2lvbiBtYXkgYmUgbG9zdC4gUGxlYXNlIHJlcG9ydCBpZiB5b3UgZ2V0IHRoaXMgbWVzc2FnZSB0byBodHRwczovL2dpdGh1Yi5jb20vZ2VvdGlmZmpzL2dlb3RpZmYuanMvaXNzdWVzJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbWJpbmVkO1xuICB9XG5cbiAgLy8gYWRhcHRlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81NTMzODM4NC84MDYwNTkxXG4gIGdldEludDY0KG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gICAgbGV0IHZhbHVlID0gMDtcbiAgICBjb25zdCBpc05lZ2F0aXZlID0gKHRoaXMuX2RhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIChsaXR0bGVFbmRpYW4gPyA3IDogMCkpICYgMHg4MCkgPiAwO1xuICAgIGxldCBjYXJyeWluZyA9IHRydWU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgIGxldCBieXRlID0gdGhpcy5fZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgKGxpdHRsZUVuZGlhbiA/IGkgOiA3IC0gaSkpO1xuICAgICAgaWYgKGlzTmVnYXRpdmUpIHtcbiAgICAgICAgaWYgKGNhcnJ5aW5nKSB7XG4gICAgICAgICAgaWYgKGJ5dGUgIT09IDB4MDApIHtcbiAgICAgICAgICAgIGJ5dGUgPSB+KGJ5dGUgLSAxKSAmIDB4ZmY7XG4gICAgICAgICAgICBjYXJyeWluZyA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBieXRlID0gfmJ5dGUgJiAweGZmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YWx1ZSArPSBieXRlICogKDI1NiAqKiBpKTtcbiAgICB9XG4gICAgaWYgKGlzTmVnYXRpdmUpIHtcbiAgICAgIHZhbHVlID0gLXZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBnZXRVaW50OChvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5nZXRVaW50OChvZmZzZXQsIGxpdHRsZUVuZGlhbik7XG4gIH1cblxuICBnZXRJbnQ4KG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldEludDgob2Zmc2V0LCBsaXR0bGVFbmRpYW4pO1xuICB9XG5cbiAgZ2V0VWludDE2KG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQsIGxpdHRsZUVuZGlhbik7XG4gIH1cblxuICBnZXRJbnQxNihvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5nZXRJbnQxNihvZmZzZXQsIGxpdHRsZUVuZGlhbik7XG4gIH1cblxuICBnZXRVaW50MzIob2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVZpZXcuZ2V0VWludDMyKG9mZnNldCwgbGl0dGxlRW5kaWFuKTtcbiAgfVxuXG4gIGdldEludDMyKG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFWaWV3LmdldEludDMyKG9mZnNldCwgbGl0dGxlRW5kaWFuKTtcbiAgfVxuXG4gIGdldEZsb2F0MTYob2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgICByZXR1cm4gZ2V0RmxvYXQxNih0aGlzLl9kYXRhVmlldywgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pO1xuICB9XG5cbiAgZ2V0RmxvYXQzMihvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICAgIHJldHVybiB0aGlzLl9kYXRhVmlldy5nZXRGbG9hdDMyKG9mZnNldCwgbGl0dGxlRW5kaWFuKTtcbiAgfVxuXG4gIGdldEZsb2F0NjQob2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVZpZXcuZ2V0RmxvYXQ2NChvZmZzZXQsIGxpdHRsZUVuZGlhbik7XG4gIH1cbn1cbiIsIi8qKiBAbW9kdWxlIGdlb3RpZmYgKi9cbmltcG9ydCBHZW9USUZGSW1hZ2UgZnJvbSAnLi9nZW90aWZmaW1hZ2UuanMnO1xuaW1wb3J0IERhdGFWaWV3NjQgZnJvbSAnLi9kYXRhdmlldzY0LmpzJztcbmltcG9ydCBEYXRhU2xpY2UgZnJvbSAnLi9kYXRhc2xpY2UuanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi9wb29sLmpzJztcblxuaW1wb3J0IHsgbWFrZVJlbW90ZVNvdXJjZSB9IGZyb20gJy4vc291cmNlL3JlbW90ZS5qcyc7XG5pbXBvcnQgeyBtYWtlQnVmZmVyU291cmNlIH0gZnJvbSAnLi9zb3VyY2UvYXJyYXlidWZmZXIuanMnO1xuaW1wb3J0IHsgbWFrZUZpbGVSZWFkZXJTb3VyY2UgfSBmcm9tICcuL3NvdXJjZS9maWxlcmVhZGVyLmpzJztcbmltcG9ydCB7IG1ha2VGaWxlU291cmNlIH0gZnJvbSAnLi9zb3VyY2UvZmlsZS5qcyc7XG5cbmltcG9ydCB7IGZpZWxkVHlwZXMsIGZpZWxkVGFnTmFtZXMsIGFycmF5RmllbGRzLCBnZW9LZXlOYW1lcyB9IGZyb20gJy4vZ2xvYmFscy5qcyc7XG5pbXBvcnQgeyB3cml0ZUdlb3RpZmYgfSBmcm9tICcuL2dlb3RpZmZ3cml0ZXIuanMnO1xuaW1wb3J0ICogYXMgZ2xvYmFscyBmcm9tICcuL2dsb2JhbHMuanMnO1xuaW1wb3J0ICogYXMgcmdiIGZyb20gJy4vcmdiLmpzJztcbmltcG9ydCB7IGdldERlY29kZXIsIGFkZERlY29kZXIgfSBmcm9tICcuL2NvbXByZXNzaW9uL2luZGV4LmpzJztcbmltcG9ydCB7IHNldExvZ2dlciB9IGZyb20gJy4vbG9nZ2luZy5qcyc7XG5cbmV4cG9ydCB7IGdsb2JhbHMgfTtcbmV4cG9ydCB7IHJnYiB9O1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBCYXNlRGVjb2RlciB9IGZyb20gJy4vY29tcHJlc3Npb24vYmFzZWRlY29kZXIuanMnO1xuZXhwb3J0IHsgZ2V0RGVjb2RlciwgYWRkRGVjb2RlciB9O1xuZXhwb3J0IHsgc2V0TG9nZ2VyIH07XG5cbi8qKlxuICogQHR5cGVkZWYge1VpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXkgfCBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXl9XG4gKiBUeXBlZEFycmF5XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7eyBoZWlnaHQ6bnVtYmVyLCB3aWR0aDogbnVtYmVyIH19IERpbWVuc2lvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBhdXRvZ2VuZXJhdGVkIGRvY3MgYXJlIGEgbGl0dGxlIGNvbmZ1c2luZyBoZXJlLiBUaGUgZWZmZWN0aXZlIHR5cGUgaXM6XG4gKlxuICogYFR5cGVkQXJyYXkgJiB7IGhlaWdodDogbnVtYmVyOyB3aWR0aDogbnVtYmVyfWBcbiAqIEB0eXBlZGVmIHtUeXBlZEFycmF5ICYgRGltZW5zaW9uc30gVHlwZWRBcnJheVdpdGhEaW1lbnNpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgYXV0b2dlbmVyYXRlZCBkb2NzIGFyZSBhIGxpdHRsZSBjb25mdXNpbmcgaGVyZS4gVGhlIGVmZmVjdGl2ZSB0eXBlIGlzOlxuICpcbiAqIGBUeXBlZEFycmF5W10gJiB7IGhlaWdodDogbnVtYmVyOyB3aWR0aDogbnVtYmVyfWBcbiAqIEB0eXBlZGVmIHtUeXBlZEFycmF5W10gJiBEaW1lbnNpb25zfSBUeXBlZEFycmF5QXJyYXlXaXRoRGltZW5zaW9uc1xuICovXG5cbi8qKlxuICogIFRoZSBhdXRvZ2VuZXJhdGVkIGRvY3MgYXJlIGEgbGl0dGxlIGNvbmZ1c2luZyBoZXJlLiBUaGUgZWZmZWN0aXZlIHR5cGUgaXM6XG4gKlxuICogYChUeXBlZEFycmF5IHwgVHlwZWRBcnJheVtdKSAmIHsgaGVpZ2h0OiBudW1iZXI7IHdpZHRoOiBudW1iZXJ9YFxuICogQHR5cGVkZWYge1R5cGVkQXJyYXlXaXRoRGltZW5zaW9ucyB8IFR5cGVkQXJyYXlBcnJheVdpdGhEaW1lbnNpb25zfSBSZWFkUmFzdGVyUmVzdWx0XG4gKi9cblxuZnVuY3Rpb24gZ2V0RmllbGRUeXBlTGVuZ3RoKGZpZWxkVHlwZSkge1xuICBzd2l0Y2ggKGZpZWxkVHlwZSkge1xuICAgIGNhc2UgZmllbGRUeXBlcy5CWVRFOiBjYXNlIGZpZWxkVHlwZXMuQVNDSUk6IGNhc2UgZmllbGRUeXBlcy5TQllURTogY2FzZSBmaWVsZFR5cGVzLlVOREVGSU5FRDpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgZmllbGRUeXBlcy5TSE9SVDogY2FzZSBmaWVsZFR5cGVzLlNTSE9SVDpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgZmllbGRUeXBlcy5MT05HOiBjYXNlIGZpZWxkVHlwZXMuU0xPTkc6IGNhc2UgZmllbGRUeXBlcy5GTE9BVDogY2FzZSBmaWVsZFR5cGVzLklGRDpcbiAgICAgIHJldHVybiA0O1xuICAgIGNhc2UgZmllbGRUeXBlcy5SQVRJT05BTDogY2FzZSBmaWVsZFR5cGVzLlNSQVRJT05BTDogY2FzZSBmaWVsZFR5cGVzLkRPVUJMRTpcbiAgICBjYXNlIGZpZWxkVHlwZXMuTE9ORzg6IGNhc2UgZmllbGRUeXBlcy5TTE9ORzg6IGNhc2UgZmllbGRUeXBlcy5JRkQ4OlxuICAgICAgcmV0dXJuIDg7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbnZhbGlkIGZpZWxkIHR5cGU6ICR7ZmllbGRUeXBlfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR2VvS2V5RGlyZWN0b3J5KGZpbGVEaXJlY3RvcnkpIHtcbiAgY29uc3QgcmF3R2VvS2V5RGlyZWN0b3J5ID0gZmlsZURpcmVjdG9yeS5HZW9LZXlEaXJlY3Rvcnk7XG4gIGlmICghcmF3R2VvS2V5RGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBnZW9LZXlEaXJlY3RvcnkgPSB7fTtcbiAgZm9yIChsZXQgaSA9IDQ7IGkgPD0gcmF3R2VvS2V5RGlyZWN0b3J5WzNdICogNDsgaSArPSA0KSB7XG4gICAgY29uc3Qga2V5ID0gZ2VvS2V5TmFtZXNbcmF3R2VvS2V5RGlyZWN0b3J5W2ldXTtcbiAgICBjb25zdCBsb2NhdGlvbiA9IChyYXdHZW9LZXlEaXJlY3RvcnlbaSArIDFdKVxuICAgICAgPyAoZmllbGRUYWdOYW1lc1tyYXdHZW9LZXlEaXJlY3RvcnlbaSArIDFdXSkgOiBudWxsO1xuICAgIGNvbnN0IGNvdW50ID0gcmF3R2VvS2V5RGlyZWN0b3J5W2kgKyAyXTtcbiAgICBjb25zdCBvZmZzZXQgPSByYXdHZW9LZXlEaXJlY3RvcnlbaSArIDNdO1xuXG4gICAgbGV0IHZhbHVlID0gbnVsbDtcbiAgICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgICB2YWx1ZSA9IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBmaWxlRGlyZWN0b3J5W2xvY2F0aW9uXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGdldCB2YWx1ZSBvZiBnZW9LZXkgJyR7a2V5fScuYCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcob2Zmc2V0LCBvZmZzZXQgKyBjb3VudCAtIDEpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZS5zdWJhcnJheSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgY291bnQpO1xuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGdlb0tleURpcmVjdG9yeVtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGdlb0tleURpcmVjdG9yeTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVzKGRhdGFTbGljZSwgZmllbGRUeXBlLCBjb3VudCwgb2Zmc2V0KSB7XG4gIGxldCB2YWx1ZXMgPSBudWxsO1xuICBsZXQgcmVhZE1ldGhvZCA9IG51bGw7XG4gIGNvbnN0IGZpZWxkVHlwZUxlbmd0aCA9IGdldEZpZWxkVHlwZUxlbmd0aChmaWVsZFR5cGUpO1xuXG4gIHN3aXRjaCAoZmllbGRUeXBlKSB7XG4gICAgY2FzZSBmaWVsZFR5cGVzLkJZVEU6IGNhc2UgZmllbGRUeXBlcy5BU0NJSTogY2FzZSBmaWVsZFR5cGVzLlVOREVGSU5FRDpcbiAgICAgIHZhbHVlcyA9IG5ldyBVaW50OEFycmF5KGNvdW50KTsgcmVhZE1ldGhvZCA9IGRhdGFTbGljZS5yZWFkVWludDg7XG4gICAgICBicmVhaztcbiAgICBjYXNlIGZpZWxkVHlwZXMuU0JZVEU6XG4gICAgICB2YWx1ZXMgPSBuZXcgSW50OEFycmF5KGNvdW50KTsgcmVhZE1ldGhvZCA9IGRhdGFTbGljZS5yZWFkSW50ODtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZmllbGRUeXBlcy5TSE9SVDpcbiAgICAgIHZhbHVlcyA9IG5ldyBVaW50MTZBcnJheShjb3VudCk7IHJlYWRNZXRob2QgPSBkYXRhU2xpY2UucmVhZFVpbnQxNjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZmllbGRUeXBlcy5TU0hPUlQ6XG4gICAgICB2YWx1ZXMgPSBuZXcgSW50MTZBcnJheShjb3VudCk7IHJlYWRNZXRob2QgPSBkYXRhU2xpY2UucmVhZEludDE2O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBmaWVsZFR5cGVzLkxPTkc6IGNhc2UgZmllbGRUeXBlcy5JRkQ6XG4gICAgICB2YWx1ZXMgPSBuZXcgVWludDMyQXJyYXkoY291bnQpOyByZWFkTWV0aG9kID0gZGF0YVNsaWNlLnJlYWRVaW50MzI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIGZpZWxkVHlwZXMuU0xPTkc6XG4gICAgICB2YWx1ZXMgPSBuZXcgSW50MzJBcnJheShjb3VudCk7IHJlYWRNZXRob2QgPSBkYXRhU2xpY2UucmVhZEludDMyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBmaWVsZFR5cGVzLkxPTkc4OiBjYXNlIGZpZWxkVHlwZXMuSUZEODpcbiAgICAgIHZhbHVlcyA9IG5ldyBBcnJheShjb3VudCk7IHJlYWRNZXRob2QgPSBkYXRhU2xpY2UucmVhZFVpbnQ2NDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZmllbGRUeXBlcy5TTE9ORzg6XG4gICAgICB2YWx1ZXMgPSBuZXcgQXJyYXkoY291bnQpOyByZWFkTWV0aG9kID0gZGF0YVNsaWNlLnJlYWRJbnQ2NDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZmllbGRUeXBlcy5SQVRJT05BTDpcbiAgICAgIHZhbHVlcyA9IG5ldyBVaW50MzJBcnJheShjb3VudCAqIDIpOyByZWFkTWV0aG9kID0gZGF0YVNsaWNlLnJlYWRVaW50MzI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIGZpZWxkVHlwZXMuU1JBVElPTkFMOlxuICAgICAgdmFsdWVzID0gbmV3IEludDMyQXJyYXkoY291bnQgKiAyKTsgcmVhZE1ldGhvZCA9IGRhdGFTbGljZS5yZWFkSW50MzI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIGZpZWxkVHlwZXMuRkxPQVQ6XG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KGNvdW50KTsgcmVhZE1ldGhvZCA9IGRhdGFTbGljZS5yZWFkRmxvYXQzMjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZmllbGRUeXBlcy5ET1VCTEU6XG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQ2NEFycmF5KGNvdW50KTsgcmVhZE1ldGhvZCA9IGRhdGFTbGljZS5yZWFkRmxvYXQ2NDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW52YWxpZCBmaWVsZCB0eXBlOiAke2ZpZWxkVHlwZX1gKTtcbiAgfVxuXG4gIC8vIG5vcm1hbCBmaWVsZHNcbiAgaWYgKCEoZmllbGRUeXBlID09PSBmaWVsZFR5cGVzLlJBVElPTkFMIHx8IGZpZWxkVHlwZSA9PT0gZmllbGRUeXBlcy5TUkFUSU9OQUwpKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgKytpKSB7XG4gICAgICB2YWx1ZXNbaV0gPSByZWFkTWV0aG9kLmNhbGwoXG4gICAgICAgIGRhdGFTbGljZSwgb2Zmc2V0ICsgKGkgKiBmaWVsZFR5cGVMZW5ndGgpLFxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7IC8vIFJBVElPTkFMIG9yIFNSQVRJT05BTFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkgKz0gMikge1xuICAgICAgdmFsdWVzW2ldID0gcmVhZE1ldGhvZC5jYWxsKFxuICAgICAgICBkYXRhU2xpY2UsIG9mZnNldCArIChpICogZmllbGRUeXBlTGVuZ3RoKSxcbiAgICAgICk7XG4gICAgICB2YWx1ZXNbaSArIDFdID0gcmVhZE1ldGhvZC5jYWxsKFxuICAgICAgICBkYXRhU2xpY2UsIG9mZnNldCArICgoaSAqIGZpZWxkVHlwZUxlbmd0aCkgKyA0KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGZpZWxkVHlwZSA9PT0gZmllbGRUeXBlcy5BU0NJSSkge1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoJ3V0Zi04JykuZGVjb2RlKHZhbHVlcyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuLyoqXG4gKiBEYXRhIGNsYXNzIHRvIHN0b3JlIHRoZSBwYXJzZWQgZmlsZSBkaXJlY3RvcnksIGdlbyBrZXkgZGlyZWN0b3J5IGFuZFxuICogb2Zmc2V0IHRvIHRoZSBuZXh0IElGRFxuICovXG5jbGFzcyBJbWFnZUZpbGVEaXJlY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihmaWxlRGlyZWN0b3J5LCBnZW9LZXlEaXJlY3RvcnksIG5leHRJRkRCeXRlT2Zmc2V0KSB7XG4gICAgdGhpcy5maWxlRGlyZWN0b3J5ID0gZmlsZURpcmVjdG9yeTtcbiAgICB0aGlzLmdlb0tleURpcmVjdG9yeSA9IGdlb0tleURpcmVjdG9yeTtcbiAgICB0aGlzLm5leHRJRkRCeXRlT2Zmc2V0ID0gbmV4dElGREJ5dGVPZmZzZXQ7XG4gIH1cbn1cblxuLyoqXG4gKiBFcnJvciBjbGFzcyBmb3IgY2FzZXMgd2hlbiBhbiBJRkQgaW5kZXggd2FzIHJlcXVlc3RlZCwgdGhhdCBkb2VzIG5vdCBleGlzdFxuICogaW4gdGhlIGZpbGUuXG4gKi9cbmNsYXNzIEdlb1RJRkZJbWFnZUluZGV4RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGluZGV4KSB7XG4gICAgc3VwZXIoYE5vIGltYWdlIGF0IGluZGV4ICR7aW5kZXh9YCk7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG59XG5cbmNsYXNzIEdlb1RJRkZCYXNlIHtcbiAgLyoqXG4gICAqIChleHBlcmltZW50YWwpIFJlYWRzIHJhc3RlciBkYXRhIGZyb20gdGhlIGJlc3QgZml0dGluZyBpbWFnZS4gVGhpcyBmdW5jdGlvbiB1c2VzXG4gICAqIHRoZSBpbWFnZSB3aXRoIHRoZSBsb3dlc3QgcmVzb2x1dGlvbiB0aGF0IGlzIHN0aWxsIGEgaGlnaGVyIHJlc29sdXRpb24gdGhhbiB0aGVcbiAgICogcmVxdWVzdGVkIHJlc29sdXRpb24uXG4gICAqIFdoZW4gc3BlY2lmaWVkLCB0aGUgYGJib3hgIG9wdGlvbiBpcyB0cmFuc2xhdGVkIHRvIHRoZSBgd2luZG93YCBvcHRpb24gYW5kIHRoZVxuICAgKiBgcmVzWGAgYW5kIGByZXNZYCB0byBgd2lkdGhgIGFuZCBgaGVpZ2h0YCByZXNwZWN0aXZlbHkuXG4gICAqIFRoZW4sIHRoZSBbcmVhZFJhc3RlcnNde0BsaW5rIEdlb1RJRkZJbWFnZSNyZWFkUmFzdGVyc30gbWV0aG9kIG9mIHRoZSBzZWxlY3RlZFxuICAgKiBpbWFnZSBpcyBjYWxsZWQgYW5kIHRoZSByZXN1bHQgcmV0dXJuZWQuXG4gICAqIEBzZWUgR2VvVElGRkltYWdlLnJlYWRSYXN0ZXJzXG4gICAqIEBwYXJhbSB7aW1wb3J0KCcuL2dlb3RpZmZpbWFnZScpLlJlYWRSYXN0ZXJPcHRpb25zfSBbb3B0aW9ucz17fV0gb3B0aW9uYWwgcGFyYW1ldGVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxSZWFkUmFzdGVyUmVzdWx0Pn0gdGhlIGRlY29kZWQgYXJyYXkocyksIHdpdGggYGhlaWdodGAgYW5kIGB3aWR0aGAsIGFzIGEgcHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgcmVhZFJhc3RlcnMob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyB3aW5kb3c6IGltYWdlV2luZG93LCB3aWR0aCwgaGVpZ2h0IH0gPSBvcHRpb25zO1xuICAgIGxldCB7IHJlc1gsIHJlc1ksIGJib3ggfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCBmaXJzdEltYWdlID0gYXdhaXQgdGhpcy5nZXRJbWFnZSgpO1xuICAgIGxldCB1c2VkSW1hZ2UgPSBmaXJzdEltYWdlO1xuICAgIGNvbnN0IGltYWdlQ291bnQgPSBhd2FpdCB0aGlzLmdldEltYWdlQ291bnQoKTtcbiAgICBjb25zdCBpbWdCQm94ID0gZmlyc3RJbWFnZS5nZXRCb3VuZGluZ0JveCgpO1xuXG4gICAgaWYgKGltYWdlV2luZG93ICYmIGJib3gpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCBcImJib3hcIiBhbmQgXCJ3aW5kb3dcIiBwYXNzZWQuJyk7XG4gICAgfVxuXG4gICAgLy8gaWYgd2lkdGgvaGVpZ2h0IGlzIHBhc3NlZCwgdHJhbnNmb3JtIGl0IHRvIHJlc29sdXRpb25cbiAgICBpZiAod2lkdGggfHwgaGVpZ2h0KSB7XG4gICAgICAvLyBpZiB3ZSBoYXZlIGFuIGltYWdlIHdpbmRvdyAocGl4ZWwgY29vcmRpbmF0ZXMpLCB0cmFuc2Zvcm0gaXQgdG8gYSBCQm94XG4gICAgICAvLyB1c2luZyB0aGUgb3JpZ2luL3Jlc29sdXRpb24gb2YgdGhlIGZpcnN0IGltYWdlLlxuICAgICAgaWYgKGltYWdlV2luZG93KSB7XG4gICAgICAgIGNvbnN0IFtvWCwgb1ldID0gZmlyc3RJbWFnZS5nZXRPcmlnaW4oKTtcbiAgICAgICAgY29uc3QgW3JYLCByWV0gPSBmaXJzdEltYWdlLmdldFJlc29sdXRpb24oKTtcblxuICAgICAgICBiYm94ID0gW1xuICAgICAgICAgIG9YICsgKGltYWdlV2luZG93WzBdICogclgpLFxuICAgICAgICAgIG9ZICsgKGltYWdlV2luZG93WzFdICogclkpLFxuICAgICAgICAgIG9YICsgKGltYWdlV2luZG93WzJdICogclgpLFxuICAgICAgICAgIG9ZICsgKGltYWdlV2luZG93WzNdICogclkpLFxuICAgICAgICBdO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB3ZSBoYXZlIGEgYmJveCAob3IgY2FsY3VsYXRlZCBvbmUpXG5cbiAgICAgIGNvbnN0IHVzZWRCQm94ID0gYmJveCB8fCBpbWdCQm94O1xuXG4gICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgaWYgKHJlc1gpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JvdGggd2lkdGggYW5kIHJlc1ggcGFzc2VkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzWCA9ICh1c2VkQkJveFsyXSAtIHVzZWRCQm94WzBdKSAvIHdpZHRoO1xuICAgICAgfVxuICAgICAgaWYgKGhlaWdodCkge1xuICAgICAgICBpZiAocmVzWSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCB3aWR0aCBhbmQgcmVzWSBwYXNzZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXNZID0gKHVzZWRCQm94WzNdIC0gdXNlZEJCb3hbMV0pIC8gaGVpZ2h0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHJlc29sdXRpb24gaXMgc2V0IG9yIGNhbGN1bGF0ZWQsIHRyeSB0byBnZXQgdGhlIGltYWdlIHdpdGggdGhlIHdvcnN0IGFjY2VwdGFibGUgcmVzb2x1dGlvblxuICAgIGlmIChyZXNYIHx8IHJlc1kpIHtcbiAgICAgIGNvbnN0IGFsbEltYWdlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZUNvdW50OyArK2kpIHtcbiAgICAgICAgY29uc3QgaW1hZ2UgPSBhd2FpdCB0aGlzLmdldEltYWdlKGkpO1xuICAgICAgICBjb25zdCB7IFN1YmZpbGVUeXBlOiBzdWJmaWxlVHlwZSwgTmV3U3ViZmlsZVR5cGU6IG5ld1N1YmZpbGVUeXBlIH0gPSBpbWFnZS5maWxlRGlyZWN0b3J5O1xuICAgICAgICBpZiAoaSA9PT0gMCB8fCBzdWJmaWxlVHlwZSA9PT0gMiB8fCBuZXdTdWJmaWxlVHlwZSAmIDEpIHtcbiAgICAgICAgICBhbGxJbWFnZXMucHVzaChpbWFnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYWxsSW1hZ2VzLnNvcnQoKGEsIGIpID0+IGEuZ2V0V2lkdGgoKSAtIGIuZ2V0V2lkdGgoKSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbEltYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpbWFnZSA9IGFsbEltYWdlc1tpXTtcbiAgICAgICAgY29uc3QgaW1nUmVzWCA9IChpbWdCQm94WzJdIC0gaW1nQkJveFswXSkgLyBpbWFnZS5nZXRXaWR0aCgpO1xuICAgICAgICBjb25zdCBpbWdSZXNZID0gKGltZ0JCb3hbM10gLSBpbWdCQm94WzFdKSAvIGltYWdlLmdldEhlaWdodCgpO1xuXG4gICAgICAgIHVzZWRJbWFnZSA9IGltYWdlO1xuICAgICAgICBpZiAoKHJlc1ggJiYgcmVzWCA+IGltZ1Jlc1gpIHx8IChyZXNZICYmIHJlc1kgPiBpbWdSZXNZKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHduZCA9IGltYWdlV2luZG93O1xuICAgIGlmIChiYm94KSB7XG4gICAgICBjb25zdCBbb1gsIG9ZXSA9IGZpcnN0SW1hZ2UuZ2V0T3JpZ2luKCk7XG4gICAgICBjb25zdCBbaW1hZ2VSZXNYLCBpbWFnZVJlc1ldID0gdXNlZEltYWdlLmdldFJlc29sdXRpb24oZmlyc3RJbWFnZSk7XG5cbiAgICAgIHduZCA9IFtcbiAgICAgICAgTWF0aC5yb3VuZCgoYmJveFswXSAtIG9YKSAvIGltYWdlUmVzWCksXG4gICAgICAgIE1hdGgucm91bmQoKGJib3hbMV0gLSBvWSkgLyBpbWFnZVJlc1kpLFxuICAgICAgICBNYXRoLnJvdW5kKChiYm94WzJdIC0gb1gpIC8gaW1hZ2VSZXNYKSxcbiAgICAgICAgTWF0aC5yb3VuZCgoYmJveFszXSAtIG9ZKSAvIGltYWdlUmVzWSksXG4gICAgICBdO1xuICAgICAgd25kID0gW1xuICAgICAgICBNYXRoLm1pbih3bmRbMF0sIHduZFsyXSksXG4gICAgICAgIE1hdGgubWluKHduZFsxXSwgd25kWzNdKSxcbiAgICAgICAgTWF0aC5tYXgod25kWzBdLCB3bmRbMl0pLFxuICAgICAgICBNYXRoLm1heCh3bmRbMV0sIHduZFszXSksXG4gICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiB1c2VkSW1hZ2UucmVhZFJhc3RlcnMoeyAuLi5vcHRpb25zLCB3aW5kb3c6IHduZCB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEdlb1RJRkZPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtjYWNoZT1mYWxzZV0gd2hldGhlciBvciBub3QgZGVjb2RlZCB0aWxlcyBzaGFsbCBiZSBjYWNoZWQuXG4gKi9cblxuLyoqXG4gKiBUaGUgYWJzdHJhY3Rpb24gZm9yIGEgd2hvbGUgR2VvVElGRiBmaWxlLlxuICogQGF1Z21lbnRzIEdlb1RJRkZCYXNlXG4gKi9cbmNsYXNzIEdlb1RJRkYgZXh0ZW5kcyBHZW9USUZGQmFzZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHsqfSBzb3VyY2UgVGhlIGRhdGFzb3VyY2UgdG8gcmVhZCBmcm9tLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGxpdHRsZUVuZGlhbiBXaGV0aGVyIHRoZSBpbWFnZSB1c2VzIGxpdHRsZSBlbmRpYW4uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYmlnVGlmZiBXaGV0aGVyIHRoZSBpbWFnZSB1c2VzIGJpZ1RJRkYgY29udmVudGlvbnMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmaXJzdElGRE9mZnNldCBUaGUgbnVtZXJpYyBieXRlLW9mZnNldCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgaW1hZ2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSBmaXJzdCBJRkQuXG4gICAqIEBwYXJhbSB7R2VvVElGRk9wdGlvbnN9IFtvcHRpb25zXSBmdXJ0aGVyIG9wdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihzb3VyY2UsIGxpdHRsZUVuZGlhbiwgYmlnVGlmZiwgZmlyc3RJRkRPZmZzZXQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhpcy5saXR0bGVFbmRpYW4gPSBsaXR0bGVFbmRpYW47XG4gICAgdGhpcy5iaWdUaWZmID0gYmlnVGlmZjtcbiAgICB0aGlzLmZpcnN0SUZET2Zmc2V0ID0gZmlyc3RJRkRPZmZzZXQ7XG4gICAgdGhpcy5jYWNoZSA9IG9wdGlvbnMuY2FjaGUgfHwgZmFsc2U7XG4gICAgdGhpcy5pZmRSZXF1ZXN0cyA9IFtdO1xuICAgIHRoaXMuZ2hvc3RWYWx1ZXMgPSBudWxsO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2xpY2Uob2Zmc2V0LCBzaXplKSB7XG4gICAgY29uc3QgZmFsbGJhY2tTaXplID0gdGhpcy5iaWdUaWZmID8gNDA0OCA6IDEwMjQ7XG4gICAgcmV0dXJuIG5ldyBEYXRhU2xpY2UoXG4gICAgICAoYXdhaXQgdGhpcy5zb3VyY2UuZmV0Y2goW3tcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBsZW5ndGg6IHR5cGVvZiBzaXplICE9PSAndW5kZWZpbmVkJyA/IHNpemUgOiBmYWxsYmFja1NpemUsXG4gICAgICB9XSkpWzBdLFxuICAgICAgb2Zmc2V0LFxuICAgICAgdGhpcy5saXR0bGVFbmRpYW4sXG4gICAgICB0aGlzLmJpZ1RpZmYsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0cnVjdHMgdG8gcGFyc2UgYW4gaW1hZ2UgZmlsZSBkaXJlY3RvcnkgYXQgdGhlIGdpdmVuIGZpbGUgb2Zmc2V0LlxuICAgKiBBcyB0aGVyZSBpcyBubyB3YXkgdG8gZW5zdXJlIHRoYXQgYSBsb2NhdGlvbiBpcyBpbmRlZWQgdGhlIHN0YXJ0IG9mIGFuIElGRCxcbiAgICogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCB3aXRoIGNhdXRpb24gKGUuZyBvbmx5IHVzaW5nIHRoZSBJRkQgb2Zmc2V0cyBmcm9tXG4gICAqIHRoZSBoZWFkZXJzIG9yIG90aGVyIElGRHMpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gb2Zmc2V0IHRoZSBvZmZzZXQgdG8gcGFyc2UgdGhlIElGRCBhdFxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJbWFnZUZpbGVEaXJlY3Rvcnk+fSB0aGUgcGFyc2VkIElGRFxuICAgKi9cbiAgYXN5bmMgcGFyc2VGaWxlRGlyZWN0b3J5QXQob2Zmc2V0KSB7XG4gICAgY29uc3QgZW50cnlTaXplID0gdGhpcy5iaWdUaWZmID8gMjAgOiAxMjtcbiAgICBjb25zdCBvZmZzZXRTaXplID0gdGhpcy5iaWdUaWZmID8gOCA6IDI7XG5cbiAgICBsZXQgZGF0YVNsaWNlID0gYXdhaXQgdGhpcy5nZXRTbGljZShvZmZzZXQpO1xuICAgIGNvbnN0IG51bURpckVudHJpZXMgPSB0aGlzLmJpZ1RpZmZcbiAgICAgID8gZGF0YVNsaWNlLnJlYWRVaW50NjQob2Zmc2V0KVxuICAgICAgOiBkYXRhU2xpY2UucmVhZFVpbnQxNihvZmZzZXQpO1xuXG4gICAgLy8gaWYgdGhlIHNsaWNlIGRvZXMgbm90IGNvdmVyIHRoZSB3aG9sZSBJRkQsIHJlcXVlc3QgYSBiaWdnZXIgc2xpY2UsIHdoZXJlIHRoZVxuICAgIC8vIHdob2xlIElGRCBmaXRzOiBudW0gb2YgZW50cmllcyArIG4geCB0YWcgbGVuZ3RoICsgb2Zmc2V0IHRvIG5leHQgSUZEXG4gICAgY29uc3QgYnl0ZVNpemUgPSAobnVtRGlyRW50cmllcyAqIGVudHJ5U2l6ZSkgKyAodGhpcy5iaWdUaWZmID8gMTYgOiA2KTtcbiAgICBpZiAoIWRhdGFTbGljZS5jb3ZlcnMob2Zmc2V0LCBieXRlU2l6ZSkpIHtcbiAgICAgIGRhdGFTbGljZSA9IGF3YWl0IHRoaXMuZ2V0U2xpY2Uob2Zmc2V0LCBieXRlU2l6ZSk7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZURpcmVjdG9yeSA9IHt9O1xuXG4gICAgLy8gbG9vcCBvdmVyIHRoZSBJRkQgYW5kIGNyZWF0ZSBhIGZpbGUgZGlyZWN0b3J5IG9iamVjdFxuICAgIGxldCBpID0gb2Zmc2V0ICsgKHRoaXMuYmlnVGlmZiA/IDggOiAyKTtcbiAgICBmb3IgKGxldCBlbnRyeUNvdW50ID0gMDsgZW50cnlDb3VudCA8IG51bURpckVudHJpZXM7IGkgKz0gZW50cnlTaXplLCArK2VudHJ5Q291bnQpIHtcbiAgICAgIGNvbnN0IGZpZWxkVGFnID0gZGF0YVNsaWNlLnJlYWRVaW50MTYoaSk7XG4gICAgICBjb25zdCBmaWVsZFR5cGUgPSBkYXRhU2xpY2UucmVhZFVpbnQxNihpICsgMik7XG4gICAgICBjb25zdCB0eXBlQ291bnQgPSB0aGlzLmJpZ1RpZmZcbiAgICAgICAgPyBkYXRhU2xpY2UucmVhZFVpbnQ2NChpICsgNClcbiAgICAgICAgOiBkYXRhU2xpY2UucmVhZFVpbnQzMihpICsgNCk7XG5cbiAgICAgIGxldCBmaWVsZFZhbHVlcztcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGNvbnN0IGZpZWxkVHlwZUxlbmd0aCA9IGdldEZpZWxkVHlwZUxlbmd0aChmaWVsZFR5cGUpO1xuICAgICAgY29uc3QgdmFsdWVPZmZzZXQgPSBpICsgKHRoaXMuYmlnVGlmZiA/IDEyIDogOCk7XG5cbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIHZhbHVlIGlzIGRpcmVjdGx5IGVuY29kZWQgaW4gdGhlIHRhZyBvciByZWZlcnMgdG8gYVxuICAgICAgLy8gZGlmZmVyZW50IGV4dGVybmFsIGJ5dGUgcmFuZ2VcbiAgICAgIGlmIChmaWVsZFR5cGVMZW5ndGggKiB0eXBlQ291bnQgPD0gKHRoaXMuYmlnVGlmZiA/IDggOiA0KSkge1xuICAgICAgICBmaWVsZFZhbHVlcyA9IGdldFZhbHVlcyhkYXRhU2xpY2UsIGZpZWxkVHlwZSwgdHlwZUNvdW50LCB2YWx1ZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXNvbHZlIHRoZSByZWZlcmVuY2UgdG8gdGhlIGFjdHVhbCBieXRlIHJhbmdlXG4gICAgICAgIGNvbnN0IGFjdHVhbE9mZnNldCA9IGRhdGFTbGljZS5yZWFkT2Zmc2V0KHZhbHVlT2Zmc2V0KTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gZ2V0RmllbGRUeXBlTGVuZ3RoKGZpZWxkVHlwZSkgKiB0eXBlQ291bnQ7XG5cbiAgICAgICAgLy8gY2hlY2ssIHdoZXRoZXIgd2UgYWN0dWFsbHkgY292ZXIgdGhlIHJlZmVyZW5jZWQgYnl0ZSByYW5nZTsgaWYgbm90LFxuICAgICAgICAvLyByZXF1ZXN0IGEgbmV3IHNsaWNlIG9mIGJ5dGVzIHRvIHJlYWQgZnJvbSBpdFxuICAgICAgICBpZiAoZGF0YVNsaWNlLmNvdmVycyhhY3R1YWxPZmZzZXQsIGxlbmd0aCkpIHtcbiAgICAgICAgICBmaWVsZFZhbHVlcyA9IGdldFZhbHVlcyhkYXRhU2xpY2UsIGZpZWxkVHlwZSwgdHlwZUNvdW50LCBhY3R1YWxPZmZzZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGZpZWxkRGF0YVNsaWNlID0gYXdhaXQgdGhpcy5nZXRTbGljZShhY3R1YWxPZmZzZXQsIGxlbmd0aCk7XG4gICAgICAgICAgZmllbGRWYWx1ZXMgPSBnZXRWYWx1ZXMoZmllbGREYXRhU2xpY2UsIGZpZWxkVHlwZSwgdHlwZUNvdW50LCBhY3R1YWxPZmZzZXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHVucGFjayBzaW5nbGUgdmFsdWVzIGZyb20gdGhlIGFycmF5XG4gICAgICBpZiAodHlwZUNvdW50ID09PSAxICYmIGFycmF5RmllbGRzLmluZGV4T2YoZmllbGRUYWcpID09PSAtMVxuICAgICAgICAmJiAhKGZpZWxkVHlwZSA9PT0gZmllbGRUeXBlcy5SQVRJT05BTCB8fCBmaWVsZFR5cGUgPT09IGZpZWxkVHlwZXMuU1JBVElPTkFMKSkge1xuICAgICAgICB2YWx1ZSA9IGZpZWxkVmFsdWVzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBmaWVsZFZhbHVlcztcbiAgICAgIH1cblxuICAgICAgLy8gd3JpdGUgdGhlIHRhZ3MgdmFsdWUgdG8gdGhlIGZpbGUgZGlyZWN0bHlcbiAgICAgIGZpbGVEaXJlY3RvcnlbZmllbGRUYWdOYW1lc1tmaWVsZFRhZ11dID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IGdlb0tleURpcmVjdG9yeSA9IHBhcnNlR2VvS2V5RGlyZWN0b3J5KGZpbGVEaXJlY3RvcnkpO1xuICAgIGNvbnN0IG5leHRJRkRCeXRlT2Zmc2V0ID0gZGF0YVNsaWNlLnJlYWRPZmZzZXQoXG4gICAgICBvZmZzZXQgKyBvZmZzZXRTaXplICsgKGVudHJ5U2l6ZSAqIG51bURpckVudHJpZXMpLFxuICAgICk7XG5cbiAgICByZXR1cm4gbmV3IEltYWdlRmlsZURpcmVjdG9yeShcbiAgICAgIGZpbGVEaXJlY3RvcnksXG4gICAgICBnZW9LZXlEaXJlY3RvcnksXG4gICAgICBuZXh0SUZEQnl0ZU9mZnNldCxcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgcmVxdWVzdElGRChpbmRleCkge1xuICAgIC8vIHNlZSBpZiB3ZSBhbHJlYWR5IGhhdmUgdGhhdCBJRkQgaW5kZXggcmVxdWVzdGVkLlxuICAgIGlmICh0aGlzLmlmZFJlcXVlc3RzW2luZGV4XSkge1xuICAgICAgLy8gYXR0YWNoIHRvIGFuIGFscmVhZHkgcmVxdWVzdGVkIElGRFxuICAgICAgcmV0dXJuIHRoaXMuaWZkUmVxdWVzdHNbaW5kZXhdO1xuICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgaW5kZXggMFxuICAgICAgdGhpcy5pZmRSZXF1ZXN0c1tpbmRleF0gPSB0aGlzLnBhcnNlRmlsZURpcmVjdG9yeUF0KHRoaXMuZmlyc3RJRkRPZmZzZXQpO1xuICAgICAgcmV0dXJuIHRoaXMuaWZkUmVxdWVzdHNbaW5kZXhdO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuaWZkUmVxdWVzdHNbaW5kZXggLSAxXSkge1xuICAgICAgLy8gaWYgdGhlIHByZXZpb3VzIElGRCB3YXMgbm90IHlldCBsb2FkZWQsIGxvYWQgdGhhdCBvbmUgZmlyc3RcbiAgICAgIC8vIHRoaXMgaXMgdGhlIHJlY3Vyc2l2ZSBjYWxsLlxuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5pZmRSZXF1ZXN0c1tpbmRleCAtIDFdID0gdGhpcy5yZXF1ZXN0SUZEKGluZGV4IC0gMSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlmIHRoZSBwcmV2aW91cyBvbmUgYWxyZWFkeSB3YXMgYW4gaW5kZXggZXJyb3IsIHJldGhyb3dcbiAgICAgICAgLy8gd2l0aCB0aGUgY3VycmVudCBpbmRleFxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEdlb1RJRkZJbWFnZUluZGV4RXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgR2VvVElGRkltYWdlSW5kZXhFcnJvcihpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0aHJvdyBhbnl0aGluZyBlbHNlXG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGlmIHRoZSBwcmV2aW91cyBJRkQgd2FzIGxvYWRlZCwgd2UgY2FuIGZpbmFsbHkgZmV0Y2ggdGhlIG9uZSB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICAvLyB3ZSBuZWVkIHRvIHdyYXAgdGhpcyBpbiBhbiBJSUZFLCBvdGhlcndpc2UgdGhpcy5pZmRSZXF1ZXN0c1tpbmRleF0gd291bGQgYmUgZGVsYXllZFxuICAgIHRoaXMuaWZkUmVxdWVzdHNbaW5kZXhdID0gKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHByZXZpb3VzSWZkID0gYXdhaXQgdGhpcy5pZmRSZXF1ZXN0c1tpbmRleCAtIDFdO1xuICAgICAgaWYgKHByZXZpb3VzSWZkLm5leHRJRkRCeXRlT2Zmc2V0ID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBHZW9USUZGSW1hZ2VJbmRleEVycm9yKGluZGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRmlsZURpcmVjdG9yeUF0KHByZXZpb3VzSWZkLm5leHRJRkRCeXRlT2Zmc2V0KTtcbiAgICB9KSgpO1xuICAgIHJldHVybiB0aGlzLmlmZFJlcXVlc3RzW2luZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG4tdGggaW50ZXJuYWwgc3ViZmlsZSBvZiBhbiBpbWFnZS4gQnkgZGVmYXVsdCwgdGhlIGZpcnN0IGlzIHJldHVybmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2luZGV4PTBdIHRoZSBpbmRleCBvZiB0aGUgaW1hZ2UgdG8gcmV0dXJuLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxHZW9USUZGSW1hZ2U+fSB0aGUgaW1hZ2UgYXQgdGhlIGdpdmVuIGluZGV4XG4gICAqL1xuICBhc3luYyBnZXRJbWFnZShpbmRleCA9IDApIHtcbiAgICBjb25zdCBpZmQgPSBhd2FpdCB0aGlzLnJlcXVlc3RJRkQoaW5kZXgpO1xuICAgIHJldHVybiBuZXcgR2VvVElGRkltYWdlKFxuICAgICAgaWZkLmZpbGVEaXJlY3RvcnksIGlmZC5nZW9LZXlEaXJlY3RvcnksXG4gICAgICB0aGlzLmRhdGFWaWV3LCB0aGlzLmxpdHRsZUVuZGlhbiwgdGhpcy5jYWNoZSwgdGhpcy5zb3VyY2UsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb3VudCBvZiB0aGUgaW50ZXJuYWwgc3ViZmlsZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59IHRoZSBudW1iZXIgb2YgaW50ZXJuYWwgc3ViZmlsZSBpbWFnZXNcbiAgICovXG4gIGFzeW5jIGdldEltYWdlQ291bnQoKSB7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICAvLyBsb29wIHVudGlsIHdlIHJ1biBvdXQgb2YgSUZEc1xuICAgIGxldCBoYXNOZXh0ID0gdHJ1ZTtcbiAgICB3aGlsZSAoaGFzTmV4dCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5yZXF1ZXN0SUZEKGluZGV4KTtcbiAgICAgICAgKytpbmRleDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHZW9USUZGSW1hZ2VJbmRleEVycm9yKSB7XG4gICAgICAgICAgaGFzTmV4dCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsdWVzIG9mIHRoZSBDT0cgZ2hvc3QgYXJlYSBhcyBhIHBhcnNlZCBtYXAuXG4gICAqIFNlZSBodHRwczovL2dkYWwub3JnL2RyaXZlcnMvcmFzdGVyL2NvZy5odG1sI2hlYWRlci1naG9zdC1hcmVhIGZvciByZWZlcmVuY2VcbiAgICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gdGhlIHBhcnNlZCBnaG9zdCBhcmVhIG9yIG51bGwsIGlmIG5vIHN1Y2ggYXJlYSB3YXMgZm91bmRcbiAgICovXG4gIGFzeW5jIGdldEdob3N0VmFsdWVzKCkge1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuYmlnVGlmZiA/IDE2IDogODtcbiAgICBpZiAodGhpcy5naG9zdFZhbHVlcykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2hvc3RWYWx1ZXM7XG4gICAgfVxuICAgIGNvbnN0IGRldGVjdGlvblN0cmluZyA9ICdHREFMX1NUUlVDVFVSQUxfTUVUQURBVEFfU0laRT0nO1xuICAgIGNvbnN0IGhldXJpc3RpY0FyZWFTaXplID0gZGV0ZWN0aW9uU3RyaW5nLmxlbmd0aCArIDEwMDtcbiAgICBsZXQgc2xpY2UgPSBhd2FpdCB0aGlzLmdldFNsaWNlKG9mZnNldCwgaGV1cmlzdGljQXJlYVNpemUpO1xuICAgIGlmIChkZXRlY3Rpb25TdHJpbmcgPT09IGdldFZhbHVlcyhzbGljZSwgZmllbGRUeXBlcy5BU0NJSSwgZGV0ZWN0aW9uU3RyaW5nLmxlbmd0aCwgb2Zmc2V0KSkge1xuICAgICAgY29uc3QgdmFsdWVzU3RyaW5nID0gZ2V0VmFsdWVzKHNsaWNlLCBmaWVsZFR5cGVzLkFTQ0lJLCBoZXVyaXN0aWNBcmVhU2l6ZSwgb2Zmc2V0KTtcbiAgICAgIGNvbnN0IGZpcnN0TGluZSA9IHZhbHVlc1N0cmluZy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBjb25zdCBtZXRhZGF0YVNpemUgPSBOdW1iZXIoZmlyc3RMaW5lLnNwbGl0KCc9JylbMV0uc3BsaXQoJyAnKVswXSkgKyBmaXJzdExpbmUubGVuZ3RoO1xuICAgICAgaWYgKG1ldGFkYXRhU2l6ZSA+IGhldXJpc3RpY0FyZWFTaXplKSB7XG4gICAgICAgIHNsaWNlID0gYXdhaXQgdGhpcy5nZXRTbGljZShvZmZzZXQsIG1ldGFkYXRhU2l6ZSk7XG4gICAgICB9XG4gICAgICBjb25zdCBmdWxsU3RyaW5nID0gZ2V0VmFsdWVzKHNsaWNlLCBmaWVsZFR5cGVzLkFTQ0lJLCBtZXRhZGF0YVNpemUsIG9mZnNldCk7XG4gICAgICB0aGlzLmdob3N0VmFsdWVzID0ge307XG4gICAgICBmdWxsU3RyaW5nXG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLmZpbHRlcigobGluZSkgPT4gbGluZS5sZW5ndGggPiAwKVxuICAgICAgICAubWFwKChsaW5lKSA9PiBsaW5lLnNwbGl0KCc9JykpXG4gICAgICAgIC5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICB0aGlzLmdob3N0VmFsdWVzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdob3N0VmFsdWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgKEdlbylUSUZGIGZpbGUgZnJvbSB0aGUgZ2l2ZW4gc291cmNlLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHNvdXJjZSBUaGUgc291cmNlIG9mIGRhdGEgdG8gcGFyc2UgZnJvbS5cbiAgICogQHBhcmFtIHtHZW9USUZGT3B0aW9uc30gW29wdGlvbnNdIEFkZGl0aW9uYWwgb3B0aW9ucy5cbiAgICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGJlIGFib3J0ZWRcbiAgICovXG4gIHN0YXRpYyBhc3luYyBmcm9tU291cmNlKHNvdXJjZSwgb3B0aW9ucywgc2lnbmFsKSB7XG4gICAgY29uc3QgaGVhZGVyRGF0YSA9IChhd2FpdCBzb3VyY2UuZmV0Y2goW3sgb2Zmc2V0OiAwLCBsZW5ndGg6IDEwMjQgfV0sIHNpZ25hbCkpWzBdO1xuICAgIGNvbnN0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3NjQoaGVhZGVyRGF0YSk7XG5cbiAgICBjb25zdCBCT00gPSBkYXRhVmlldy5nZXRVaW50MTYoMCwgMCk7XG4gICAgbGV0IGxpdHRsZUVuZGlhbjtcbiAgICBpZiAoQk9NID09PSAweDQ5NDkpIHtcbiAgICAgIGxpdHRsZUVuZGlhbiA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChCT00gPT09IDB4NEQ0RCkge1xuICAgICAgbGl0dGxlRW5kaWFuID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYnl0ZSBvcmRlciB2YWx1ZS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBtYWdpY051bWJlciA9IGRhdGFWaWV3LmdldFVpbnQxNigyLCBsaXR0bGVFbmRpYW4pO1xuICAgIGxldCBiaWdUaWZmO1xuICAgIGlmIChtYWdpY051bWJlciA9PT0gNDIpIHtcbiAgICAgIGJpZ1RpZmYgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKG1hZ2ljTnVtYmVyID09PSA0Mykge1xuICAgICAgYmlnVGlmZiA9IHRydWU7XG4gICAgICBjb25zdCBvZmZzZXRCeXRlU2l6ZSA9IGRhdGFWaWV3LmdldFVpbnQxNig0LCBsaXR0bGVFbmRpYW4pO1xuICAgICAgaWYgKG9mZnNldEJ5dGVTaXplICE9PSA4KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgb2Zmc2V0IGJ5dGUtc2l6ZS4nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtYWdpYyBudW1iZXIuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3RJRkRPZmZzZXQgPSBiaWdUaWZmXG4gICAgICA/IGRhdGFWaWV3LmdldFVpbnQ2NCg4LCBsaXR0bGVFbmRpYW4pXG4gICAgICA6IGRhdGFWaWV3LmdldFVpbnQzMig0LCBsaXR0bGVFbmRpYW4pO1xuICAgIHJldHVybiBuZXcgR2VvVElGRihzb3VyY2UsIGxpdHRsZUVuZGlhbiwgYmlnVGlmZiwgZmlyc3RJRkRPZmZzZXQsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgdW5kZXJseWluZyBmaWxlIGJ1ZmZlclxuICAgKiBOLkIuIEFmdGVyIHRoZSBHZW9USUZGIGhhcyBiZWVuIGNvbXBsZXRlbHkgcHJvY2Vzc2VkIGl0IG5lZWRzXG4gICAqIHRvIGJlIGNsb3NlZCBidXQgb25seSBpZiBpdCBoYXMgYmVlbiBjb25zdHJ1Y3RlZCBmcm9tIGEgZmlsZS5cbiAgICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5zb3VyY2UuY2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnNvdXJjZS5jbG9zZSgpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IHsgR2VvVElGRiB9O1xuZXhwb3J0IGRlZmF1bHQgR2VvVElGRjtcblxuLyoqXG4gKiBXcmFwcGVyIGZvciBHZW9USUZGIGZpbGVzIHRoYXQgaGF2ZSBleHRlcm5hbCBvdmVydmlld3MuXG4gKiBAYXVnbWVudHMgR2VvVElGRkJhc2VcbiAqL1xuY2xhc3MgTXVsdGlHZW9USUZGIGV4dGVuZHMgR2VvVElGRkJhc2Uge1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IE11bHRpR2VvVElGRiBmcm9tIGEgbWFpbiBhbmQgc2V2ZXJhbCBvdmVydmlldyBmaWxlcy5cbiAgICogQHBhcmFtIHtHZW9USUZGfSBtYWluRmlsZSBUaGUgbWFpbiBHZW9USUZGIGZpbGUuXG4gICAqIEBwYXJhbSB7R2VvVElGRltdfSBvdmVydmlld0ZpbGVzIEFuIGFycmF5IG9mIG92ZXJ2aWV3IGZpbGVzLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWFpbkZpbGUsIG92ZXJ2aWV3RmlsZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWFpbkZpbGUgPSBtYWluRmlsZTtcbiAgICB0aGlzLm92ZXJ2aWV3RmlsZXMgPSBvdmVydmlld0ZpbGVzO1xuICAgIHRoaXMuaW1hZ2VGaWxlcyA9IFttYWluRmlsZV0uY29uY2F0KG92ZXJ2aWV3RmlsZXMpO1xuXG4gICAgdGhpcy5maWxlRGlyZWN0b3JpZXNQZXJGaWxlID0gbnVsbDtcbiAgICB0aGlzLmZpbGVEaXJlY3Rvcmllc1BlckZpbGVQYXJzaW5nID0gbnVsbDtcbiAgICB0aGlzLmltYWdlQ291bnQgPSBudWxsO1xuICB9XG5cbiAgYXN5bmMgcGFyc2VGaWxlRGlyZWN0b3JpZXNQZXJGaWxlKCkge1xuICAgIGNvbnN0IHJlcXVlc3RzID0gW3RoaXMubWFpbkZpbGUucGFyc2VGaWxlRGlyZWN0b3J5QXQodGhpcy5tYWluRmlsZS5maXJzdElGRE9mZnNldCldXG4gICAgICAuY29uY2F0KHRoaXMub3ZlcnZpZXdGaWxlcy5tYXAoKGZpbGUpID0+IGZpbGUucGFyc2VGaWxlRGlyZWN0b3J5QXQoZmlsZS5maXJzdElGRE9mZnNldCkpKTtcblxuICAgIHRoaXMuZmlsZURpcmVjdG9yaWVzUGVyRmlsZSA9IGF3YWl0IFByb21pc2UuYWxsKHJlcXVlc3RzKTtcbiAgICByZXR1cm4gdGhpcy5maWxlRGlyZWN0b3JpZXNQZXJGaWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbi10aCBpbnRlcm5hbCBzdWJmaWxlIG9mIGFuIGltYWdlLiBCeSBkZWZhdWx0LCB0aGUgZmlyc3QgaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbaW5kZXg9MF0gdGhlIGluZGV4IG9mIHRoZSBpbWFnZSB0byByZXR1cm4uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEdlb1RJRkZJbWFnZT59IHRoZSBpbWFnZSBhdCB0aGUgZ2l2ZW4gaW5kZXhcbiAgICovXG4gIGFzeW5jIGdldEltYWdlKGluZGV4ID0gMCkge1xuICAgIGF3YWl0IHRoaXMuZ2V0SW1hZ2VDb3VudCgpO1xuICAgIGF3YWl0IHRoaXMucGFyc2VGaWxlRGlyZWN0b3JpZXNQZXJGaWxlKCk7XG4gICAgbGV0IHZpc2l0ZWQgPSAwO1xuICAgIGxldCByZWxhdGl2ZUluZGV4ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1hZ2VGaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW1hZ2VGaWxlID0gdGhpcy5pbWFnZUZpbGVzW2ldO1xuICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IHRoaXMuaW1hZ2VDb3VudHNbaV07IGlpKyspIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSB2aXNpdGVkKSB7XG4gICAgICAgICAgY29uc3QgaWZkID0gYXdhaXQgaW1hZ2VGaWxlLnJlcXVlc3RJRkQocmVsYXRpdmVJbmRleCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBHZW9USUZGSW1hZ2UoXG4gICAgICAgICAgICBpZmQuZmlsZURpcmVjdG9yeSwgaWZkLmdlb0tleURpcmVjdG9yeSxcbiAgICAgICAgICAgIGltYWdlRmlsZS5kYXRhVmlldywgaW1hZ2VGaWxlLmxpdHRsZUVuZGlhbiwgaW1hZ2VGaWxlLmNhY2hlLCBpbWFnZUZpbGUuc291cmNlLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmlzaXRlZCsrO1xuICAgICAgICByZWxhdGl2ZUluZGV4Kys7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZUluZGV4ID0gMDtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBpbWFnZSBpbmRleCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvdW50IG9mIHRoZSBpbnRlcm5hbCBzdWJmaWxlcy5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPn0gdGhlIG51bWJlciBvZiBpbnRlcm5hbCBzdWJmaWxlIGltYWdlc1xuICAgKi9cbiAgYXN5bmMgZ2V0SW1hZ2VDb3VudCgpIHtcbiAgICBpZiAodGhpcy5pbWFnZUNvdW50ICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbWFnZUNvdW50O1xuICAgIH1cbiAgICBjb25zdCByZXF1ZXN0cyA9IFt0aGlzLm1haW5GaWxlLmdldEltYWdlQ291bnQoKV1cbiAgICAgIC5jb25jYXQodGhpcy5vdmVydmlld0ZpbGVzLm1hcCgoZmlsZSkgPT4gZmlsZS5nZXRJbWFnZUNvdW50KCkpKTtcbiAgICB0aGlzLmltYWdlQ291bnRzID0gYXdhaXQgUHJvbWlzZS5hbGwocmVxdWVzdHMpO1xuICAgIHRoaXMuaW1hZ2VDb3VudCA9IHRoaXMuaW1hZ2VDb3VudHMucmVkdWNlKChjb3VudCwgaWZkcykgPT4gY291bnQgKyBpZmRzLCAwKTtcbiAgICByZXR1cm4gdGhpcy5pbWFnZUNvdW50O1xuICB9XG59XG5cbmV4cG9ydCB7IE11bHRpR2VvVElGRiB9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgR2VvVElGRiBmcm9tIGEgcmVtb3RlIFVSTC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byBhY2Nlc3MgdGhlIGltYWdlIGZyb21cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gQWRkaXRpb25hbCBvcHRpb25zIHRvIHBhc3MgdG8gdGhlIHNvdXJjZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlIHtAbGluayBtYWtlUmVtb3RlU291cmNlfSBmb3IgZGV0YWlscy5cbiAqIEBwYXJhbSB7QWJvcnRTaWduYWx9IFtzaWduYWxdIEFuIEFib3J0U2lnbmFsIHRoYXQgbWF5IGJlIHNpZ25hbGxlZCBpZiB0aGUgcmVxdWVzdCBpc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYmUgYWJvcnRlZFxuICogQHJldHVybnMge1Byb21pc2U8R2VvVElGRj59IFRoZSByZXN1bHRpbmcgR2VvVElGRiBmaWxlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZnJvbVVybCh1cmwsIG9wdGlvbnMgPSB7fSwgc2lnbmFsKSB7XG4gIHJldHVybiBHZW9USUZGLmZyb21Tb3VyY2UobWFrZVJlbW90ZVNvdXJjZSh1cmwsIG9wdGlvbnMpLCBzaWduYWwpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIG5ldyBHZW9USUZGIGZyb20gYW5cbiAqIFtBcnJheUJ1ZmZlcl17QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXlCdWZmZXJ9LlxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGRhdGEgdG8gcmVhZCB0aGUgZmlsZSBmcm9tLlxuICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBhYm9ydGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxHZW9USUZGPn0gVGhlIHJlc3VsdGluZyBHZW9USUZGIGZpbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIoYXJyYXlCdWZmZXIsIHNpZ25hbCkge1xuICByZXR1cm4gR2VvVElGRi5mcm9tU291cmNlKG1ha2VCdWZmZXJTb3VyY2UoYXJyYXlCdWZmZXIpLCBzaWduYWwpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIEdlb1RJRkYgZnJvbSBhIGxvY2FsIGZpbGUgcGF0aC4gVGhpcyB1c2VzIHRoZSBub2RlXG4gKiBbZmlsZXN5c3RlbSBBUElde0BsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvZnMuaHRtbH0gYW5kIGlzXG4gKiBub3QgYXZhaWxhYmxlIG9uIGJyb3dzZXJzLlxuICpcbiAqIE4uQi4gQWZ0ZXIgdGhlIEdlb1RJRkYgaGFzIGJlZW4gY29tcGxldGVseSBwcm9jZXNzZWQgaXQgbmVlZHNcbiAqIHRvIGJlIGNsb3NlZCBidXQgb25seSBpZiBpdCBoYXMgYmVlbiBjb25zdHJ1Y3RlZCBmcm9tIGEgZmlsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBmaWxlIHBhdGggdG8gcmVhZCBmcm9tLlxuICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBhYm9ydGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxHZW9USUZGPn0gVGhlIHJlc3VsdGluZyBHZW9USUZGIGZpbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmcm9tRmlsZShwYXRoLCBzaWduYWwpIHtcbiAgcmV0dXJuIEdlb1RJRkYuZnJvbVNvdXJjZShtYWtlRmlsZVNvdXJjZShwYXRoKSwgc2lnbmFsKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBHZW9USUZGIGZyb20gYW4gSFRNTFxuICogW0Jsb2Jde0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9CbG9ifSBvclxuICogW0ZpbGVde0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GaWxlfVxuICogb2JqZWN0LlxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGJsb2IgVGhlIEJsb2Igb3IgRmlsZSBvYmplY3QgdG8gcmVhZCBmcm9tLlxuICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBhYm9ydGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxHZW9USUZGPn0gVGhlIHJlc3VsdGluZyBHZW9USUZGIGZpbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmcm9tQmxvYihibG9iLCBzaWduYWwpIHtcbiAgcmV0dXJuIEdlb1RJRkYuZnJvbVNvdXJjZShtYWtlRmlsZVJlYWRlclNvdXJjZShibG9iKSwgc2lnbmFsKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBNdWx0aUdlb1RJRkYgZnJvbSB0aGUgZ2l2ZW4gVVJMcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtYWluVXJsIFRoZSBVUkwgZm9yIHRoZSBtYWluIGZpbGUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBvdmVydmlld1VybHMgQW4gYXJyYXkgb2YgVVJMcyBmb3IgdGhlIG92ZXJ2aWV3IGltYWdlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQWRkaXRpb25hbCBvcHRpb25zIHRvIHBhc3MgdG8gdGhlIHNvdXJjZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlIFttYWtlUmVtb3RlU291cmNlXXtAbGluayBtb2R1bGU6c291cmNlLm1ha2VSZW1vdGVTb3VyY2V9XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBkZXRhaWxzLlxuICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBhYm9ydGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxNdWx0aUdlb1RJRkY+fSBUaGUgcmVzdWx0aW5nIE11bHRpR2VvVElGRiBmaWxlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZnJvbVVybHMobWFpblVybCwgb3ZlcnZpZXdVcmxzID0gW10sIG9wdGlvbnMgPSB7fSwgc2lnbmFsKSB7XG4gIGNvbnN0IG1haW5GaWxlID0gYXdhaXQgR2VvVElGRi5mcm9tU291cmNlKG1ha2VSZW1vdGVTb3VyY2UobWFpblVybCwgb3B0aW9ucyksIHNpZ25hbCk7XG4gIGNvbnN0IG92ZXJ2aWV3RmlsZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBvdmVydmlld1VybHMubWFwKCh1cmwpID0+IEdlb1RJRkYuZnJvbVNvdXJjZShtYWtlUmVtb3RlU291cmNlKHVybCwgb3B0aW9ucykpKSxcbiAgKTtcblxuICByZXR1cm4gbmV3IE11bHRpR2VvVElGRihtYWluRmlsZSwgb3ZlcnZpZXdGaWxlcyk7XG59XG5cbi8qKlxuICogTWFpbiBjcmVhdGluZyBmdW5jdGlvbiBmb3IgR2VvVElGRiBmaWxlcy5cbiAqIEBwYXJhbSB7KEFycmF5KX0gYXJyYXkgb2YgcGl4ZWwgdmFsdWVzXG4gKiBAcmV0dXJucyB7bWV0YWRhdGF9IG1ldGFkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUFycmF5QnVmZmVyKHZhbHVlcywgbWV0YWRhdGEpIHtcbiAgcmV0dXJuIHdyaXRlR2VvdGlmZih2YWx1ZXMsIG1ldGFkYXRhKTtcbn1cblxuZXhwb3J0IHsgUG9vbCB9O1xuZXhwb3J0IHsgR2VvVElGRkltYWdlIH07XG4iLCIvKiogQG1vZHVsZSBnZW90aWZmaW1hZ2UgKi9cbmltcG9ydCB7IGdldEZsb2F0MTYgfSBmcm9tICdAcGV0YW1vcmlrZW4vZmxvYXQxNic7XG5pbXBvcnQgZ2V0QXR0cmlidXRlIGZyb20gJ3htbC11dGlscy9nZXQtYXR0cmlidXRlLmpzJztcbmltcG9ydCBmaW5kVGFnc0J5TmFtZSBmcm9tICd4bWwtdXRpbHMvZmluZC10YWdzLWJ5LW5hbWUuanMnO1xuXG5pbXBvcnQgeyBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucywgRXh0cmFTYW1wbGVzVmFsdWVzIH0gZnJvbSAnLi9nbG9iYWxzLmpzJztcbmltcG9ydCB7IGZyb21XaGl0ZUlzWmVybywgZnJvbUJsYWNrSXNaZXJvLCBmcm9tUGFsZXR0ZSwgZnJvbUNNWUssIGZyb21ZQ2JDciwgZnJvbUNJRUxhYiB9IGZyb20gJy4vcmdiLmpzJztcbmltcG9ydCB7IGdldERlY29kZXIgfSBmcm9tICcuL2NvbXByZXNzaW9uL2luZGV4LmpzJztcbmltcG9ydCB7IHJlc2FtcGxlLCByZXNhbXBsZUludGVybGVhdmVkIH0gZnJvbSAnLi9yZXNhbXBsZS5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gUmVhZFJhc3Rlck9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7QXJyYXk8bnVtYmVyPn0gW3dpbmRvdz13aG9sZSB3aW5kb3ddIHRoZSBzdWJzZXQgdG8gcmVhZCBkYXRhIGZyb20gaW4gcGl4ZWxzLlxuICogQHByb3BlcnR5IHtBcnJheTxudW1iZXI+fSBbYmJveD13aG9sZSBpbWFnZV0gdGhlIHN1YnNldCB0byByZWFkIGRhdGEgZnJvbSBpblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvZ3JhcGhpY2FsIGNvb3JkaW5hdGVzLlxuICogQHByb3BlcnR5IHtBcnJheTxudW1iZXI+fSBbc2FtcGxlcz1hbGwgc2FtcGxlc10gdGhlIHNlbGVjdGlvbiBvZiBzYW1wbGVzIHRvIHJlYWQgZnJvbS4gRGVmYXVsdCBpcyBhbGwgc2FtcGxlcy5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2ludGVybGVhdmU9ZmFsc2VdIHdoZXRoZXIgdGhlIGRhdGEgc2hhbGwgYmUgcmVhZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBvbmUgc2luZ2xlIGFycmF5IG9yIHNlcGFyYXRlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5cy5cbiAqIEBwcm9wZXJ0eSB7UG9vbH0gW3Bvb2w9bnVsbF0gVGhlIG9wdGlvbmFsIGRlY29kZXIgcG9vbCB0byB1c2UuXG4gKiBAcHJvcGVydHkge251bWJlcn0gW3dpZHRoXSBUaGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgb3V0cHV0LiBXaGVuIHRoZSB3aWR0aCBpcyBub3QgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbWUgYXMgdGhlIGltYWdlcywgcmVzYW1wbGluZyB3aWxsIGJlIHBlcmZvcm1lZC5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbaGVpZ2h0XSBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIG91dHB1dC4gV2hlbiB0aGUgd2lkdGggaXMgbm90IHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FtZSBhcyB0aGUgaW1hZ2VzLCByZXNhbXBsaW5nIHdpbGwgYmUgcGVyZm9ybWVkLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtyZXNhbXBsZU1ldGhvZD0nbmVhcmVzdCddIFRoZSBkZXNpcmVkIHJlc2FtcGxpbmcgbWV0aG9kLlxuICogQHByb3BlcnR5IHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGJlIGFib3J0ZWRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfG51bWJlcltdfSBbZmlsbFZhbHVlXSBUaGUgdmFsdWUgdG8gdXNlIGZvciBwYXJ0cyBvZiB0aGUgaW1hZ2VcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHNpZGUgb2YgdGhlIGltYWdlcyBleHRlbnQuIFdoZW4gbXVsdGlwbGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXMgYXJlIHJlcXVlc3RlZCwgYW4gYXJyYXkgb2YgZmlsbCB2YWx1ZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbiBiZSBwYXNzZWQuXG4gKi9cblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoXCIuL2dlb3RpZmYuanNcIikuVHlwZWRBcnJheX0gVHlwZWRBcnJheSAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoXCIuL2dlb3RpZmYuanNcIikuUmVhZFJhc3RlclJlc3VsdH0gUmVhZFJhc3RlclJlc3VsdCAqL1xuXG5mdW5jdGlvbiBzdW0oYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IHMgPSAwO1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHMgKz0gYXJyYXlbaV07XG4gIH1cbiAgcmV0dXJuIHM7XG59XG5cbmZ1bmN0aW9uIGFycmF5Rm9yVHlwZShmb3JtYXQsIGJpdHNQZXJTYW1wbGUsIHNpemUpIHtcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlIDE6IC8vIHVuc2lnbmVkIGludGVnZXIgZGF0YVxuICAgICAgaWYgKGJpdHNQZXJTYW1wbGUgPD0gOCkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgICB9IGVsc2UgaWYgKGJpdHNQZXJTYW1wbGUgPD0gMTYpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50MTZBcnJheShzaXplKTtcbiAgICAgIH0gZWxzZSBpZiAoYml0c1BlclNhbXBsZSA8PSAzMikge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQzMkFycmF5KHNpemUpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOiAvLyB0d29zIGNvbXBsZW1lbnQgc2lnbmVkIGludGVnZXIgZGF0YVxuICAgICAgaWYgKGJpdHNQZXJTYW1wbGUgPT09IDgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnQ4QXJyYXkoc2l6ZSk7XG4gICAgICB9IGVsc2UgaWYgKGJpdHNQZXJTYW1wbGUgPT09IDE2KSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50MTZBcnJheShzaXplKTtcbiAgICAgIH0gZWxzZSBpZiAoYml0c1BlclNhbXBsZSA9PT0gMzIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnQzMkFycmF5KHNpemUpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOiAvLyBmbG9hdGluZyBwb2ludCBkYXRhXG4gICAgICBzd2l0Y2ggKGJpdHNQZXJTYW1wbGUpIHtcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcbiAgICAgICAgY2FzZSA2NDpcbiAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0NjRBcnJheShzaXplKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICB0aHJvdyBFcnJvcignVW5zdXBwb3J0ZWQgZGF0YSBmb3JtYXQvYml0c1BlclNhbXBsZScpO1xufVxuXG5mdW5jdGlvbiBuZWVkc05vcm1hbGl6YXRpb24oZm9ybWF0LCBiaXRzUGVyU2FtcGxlKSB7XG4gIGlmICgoZm9ybWF0ID09PSAxIHx8IGZvcm1hdCA9PT0gMikgJiYgYml0c1BlclNhbXBsZSA8PSAzMiAmJiBiaXRzUGVyU2FtcGxlICUgOCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChmb3JtYXQgPT09IDMgJiYgKGJpdHNQZXJTYW1wbGUgPT09IDE2IHx8IGJpdHNQZXJTYW1wbGUgPT09IDMyIHx8IGJpdHNQZXJTYW1wbGUgPT09IDY0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkoaW5CdWZmZXIsIGZvcm1hdCwgcGxhbmFyQ29uZmlndXJhdGlvbiwgc2FtcGxlc1BlclBpeGVsLCBiaXRzUGVyU2FtcGxlLCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQpIHtcbiAgLy8gY29uc3QgaW5CeXRlQXJyYXkgPSBuZXcgVWludDhBcnJheShpbkJ1ZmZlcik7XG4gIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoaW5CdWZmZXIpO1xuICBjb25zdCBvdXRTaXplID0gcGxhbmFyQ29uZmlndXJhdGlvbiA9PT0gMlxuICAgID8gdGlsZUhlaWdodCAqIHRpbGVXaWR0aFxuICAgIDogdGlsZUhlaWdodCAqIHRpbGVXaWR0aCAqIHNhbXBsZXNQZXJQaXhlbDtcbiAgY29uc3Qgc2FtcGxlc1RvVHJhbnNmZXIgPSBwbGFuYXJDb25maWd1cmF0aW9uID09PSAyXG4gICAgPyAxIDogc2FtcGxlc1BlclBpeGVsO1xuICBjb25zdCBvdXRBcnJheSA9IGFycmF5Rm9yVHlwZShmb3JtYXQsIGJpdHNQZXJTYW1wbGUsIG91dFNpemUpO1xuICAvLyBsZXQgcGl4ZWwgPSAwO1xuXG4gIGNvbnN0IGJpdE1hc2sgPSBwYXJzZUludCgnMScucmVwZWF0KGJpdHNQZXJTYW1wbGUpLCAyKTtcblxuICBpZiAoZm9ybWF0ID09PSAxKSB7IC8vIHVuc2lnbmVkIGludGVnZXJcbiAgICAvLyB0cmFuc2xhdGlvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vT1NHZW8vZ2RhbC9ibG9iL21hc3Rlci9nZGFsL2ZybXRzL2d0aWZmL2dlb3RpZmYuY3BwI0w3MzM3XG4gICAgbGV0IHBpeGVsQml0U2tpcDtcbiAgICAvLyBsZXQgc2FtcGxlQml0T2Zmc2V0ID0gMDtcbiAgICBpZiAocGxhbmFyQ29uZmlndXJhdGlvbiA9PT0gMSkge1xuICAgICAgcGl4ZWxCaXRTa2lwID0gc2FtcGxlc1BlclBpeGVsICogYml0c1BlclNhbXBsZTtcbiAgICAgIC8vIHNhbXBsZUJpdE9mZnNldCA9IChzYW1wbGVzUGVyUGl4ZWwgLSAxKSAqIGJpdHNQZXJTYW1wbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBpeGVsQml0U2tpcCA9IGJpdHNQZXJTYW1wbGU7XG4gICAgfVxuXG4gICAgLy8gQml0cyBwZXIgbGluZSByb3VuZHMgdXAgdG8gbmV4dCBieXRlIGJvdW5kYXJ5LlxuICAgIGxldCBiaXRzUGVyTGluZSA9IHRpbGVXaWR0aCAqIHBpeGVsQml0U2tpcDtcbiAgICBpZiAoKGJpdHNQZXJMaW5lICYgNykgIT09IDApIHtcbiAgICAgIGJpdHNQZXJMaW5lID0gKGJpdHNQZXJMaW5lICsgNykgJiAofjcpO1xuICAgIH1cblxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZUhlaWdodDsgKyt5KSB7XG4gICAgICBjb25zdCBsaW5lQml0T2Zmc2V0ID0geSAqIGJpdHNQZXJMaW5lO1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlV2lkdGg7ICsreCkge1xuICAgICAgICBjb25zdCBwaXhlbEJpdE9mZnNldCA9IGxpbmVCaXRPZmZzZXQgKyAoeCAqIHNhbXBsZXNUb1RyYW5zZmVyICogYml0c1BlclNhbXBsZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2FtcGxlc1RvVHJhbnNmZXI7ICsraSkge1xuICAgICAgICAgIGNvbnN0IGJpdE9mZnNldCA9IHBpeGVsQml0T2Zmc2V0ICsgKGkgKiBiaXRzUGVyU2FtcGxlKTtcbiAgICAgICAgICBjb25zdCBvdXRJbmRleCA9ICgoKHkgKiB0aWxlV2lkdGgpICsgeCkgKiBzYW1wbGVzVG9UcmFuc2ZlcikgKyBpO1xuXG4gICAgICAgICAgY29uc3QgYnl0ZU9mZnNldCA9IE1hdGguZmxvb3IoYml0T2Zmc2V0IC8gOCk7XG4gICAgICAgICAgY29uc3QgaW5uZXJCaXRPZmZzZXQgPSBiaXRPZmZzZXQgJSA4O1xuICAgICAgICAgIGlmIChpbm5lckJpdE9mZnNldCArIGJpdHNQZXJTYW1wbGUgPD0gOCkge1xuICAgICAgICAgICAgb3V0QXJyYXlbb3V0SW5kZXhdID0gKHZpZXcuZ2V0VWludDgoYnl0ZU9mZnNldCkgPj4gKDggLSBiaXRzUGVyU2FtcGxlKSAtIGlubmVyQml0T2Zmc2V0KSAmIGJpdE1hc2s7XG4gICAgICAgICAgfSBlbHNlIGlmIChpbm5lckJpdE9mZnNldCArIGJpdHNQZXJTYW1wbGUgPD0gMTYpIHtcbiAgICAgICAgICAgIG91dEFycmF5W291dEluZGV4XSA9ICh2aWV3LmdldFVpbnQxNihieXRlT2Zmc2V0KSA+PiAoMTYgLSBiaXRzUGVyU2FtcGxlKSAtIGlubmVyQml0T2Zmc2V0KSAmIGJpdE1hc2s7XG4gICAgICAgICAgfSBlbHNlIGlmIChpbm5lckJpdE9mZnNldCArIGJpdHNQZXJTYW1wbGUgPD0gMjQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhdyA9ICh2aWV3LmdldFVpbnQxNihieXRlT2Zmc2V0KSA8PCA4KSB8ICh2aWV3LmdldFVpbnQ4KGJ5dGVPZmZzZXQgKyAyKSk7XG4gICAgICAgICAgICBvdXRBcnJheVtvdXRJbmRleF0gPSAocmF3ID4+ICgyNCAtIGJpdHNQZXJTYW1wbGUpIC0gaW5uZXJCaXRPZmZzZXQpICYgYml0TWFzaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0QXJyYXlbb3V0SW5kZXhdID0gKHZpZXcuZ2V0VWludDMyKGJ5dGVPZmZzZXQpID4+ICgzMiAtIGJpdHNQZXJTYW1wbGUpIC0gaW5uZXJCaXRPZmZzZXQpICYgYml0TWFzaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBsZXQgb3V0V29yZCA9IDA7XG4gICAgICAgICAgLy8gZm9yIChsZXQgYml0ID0gMDsgYml0IDwgYml0c1BlclNhbXBsZTsgKytiaXQpIHtcbiAgICAgICAgICAvLyAgIGlmIChpbkJ5dGVBcnJheVtiaXRPZmZzZXQgPj4gM11cbiAgICAgICAgICAvLyAgICAgJiAoMHg4MCA+PiAoYml0T2Zmc2V0ICYgNykpKSB7XG4gICAgICAgICAgLy8gICAgIG91dFdvcmQgfD0gKDEgPDwgKGJpdHNQZXJTYW1wbGUgLSAxIC0gYml0KSk7XG4gICAgICAgICAgLy8gICB9XG4gICAgICAgICAgLy8gICArK2JpdE9mZnNldDtcbiAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAvLyBvdXRBcnJheVtvdXRJbmRleF0gPSBvdXRXb3JkO1xuICAgICAgICAgIC8vIG91dEFycmF5W3BpeGVsXSA9IG91dFdvcmQ7XG4gICAgICAgICAgLy8gcGl4ZWwgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBiaXRPZmZzZXQgPSBiaXRPZmZzZXQgKyBwaXhlbEJpdFNraXAgLSBiaXRzUGVyU2FtcGxlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChmb3JtYXQgPT09IDMpIHsgLy8gZmxvYXRpbmcgcG9pbnRcbiAgICAvLyBGbG9hdDE2IGlzIGhhbmRsZWQgZWxzZXdoZXJlXG4gICAgLy8gbm9ybWFsaXplIDE2LzI0IGJpdCBmbG9hdHMgdG8gMzIgYml0IGZsb2F0cyBpbiB0aGUgYXJyYXlcbiAgICAvLyBjb25zb2xlLnRpbWUoKTtcbiAgICAvLyBpZiAoYml0c1BlclNhbXBsZSA9PT0gMTYpIHtcbiAgICAvLyAgIGZvciAobGV0IGJ5dGUgPSAwLCBvdXRJbmRleCA9IDA7IGJ5dGUgPCBpbkJ1ZmZlci5ieXRlTGVuZ3RoOyBieXRlICs9IDIsICsrb3V0SW5kZXgpIHtcbiAgICAvLyAgICAgb3V0QXJyYXlbb3V0SW5kZXhdID0gZ2V0RmxvYXQxNih2aWV3LCBieXRlKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gICAgLy8gY29uc29sZS50aW1lRW5kKClcbiAgfVxuXG4gIHJldHVybiBvdXRBcnJheS5idWZmZXI7XG59XG5cbi8qKlxuICogR2VvVElGRiBzdWItZmlsZSBpbWFnZS5cbiAqL1xuY2xhc3MgR2VvVElGRkltYWdlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge09iamVjdH0gZmlsZURpcmVjdG9yeSBUaGUgcGFyc2VkIGZpbGUgZGlyZWN0b3J5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBnZW9LZXlzIFRoZSBwYXJzZWQgZ2VvLWtleXNcbiAgICogQHBhcmFtIHtEYXRhVmlld30gZGF0YVZpZXcgVGhlIERhdGFWaWV3IGZvciB0aGUgdW5kZXJseWluZyBmaWxlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxpdHRsZUVuZGlhbiBXaGV0aGVyIHRoZSBmaWxlIGlzIGVuY29kZWQgaW4gbGl0dGxlIG9yIGJpZyBlbmRpYW5cbiAgICogQHBhcmFtIHtCb29sZWFufSBjYWNoZSBXaGV0aGVyIG9yIG5vdCBkZWNvZGVkIHRpbGVzIHNoYWxsIGJlIGNhY2hlZFxuICAgKiBAcGFyYW0ge2ltcG9ydCgnLi9zb3VyY2UvYmFzZXNvdXJjZScpLkJhc2VTb3VyY2V9IHNvdXJjZSBUaGUgZGF0YXNvdXJjZSB0byByZWFkIGZyb21cbiAgICovXG4gIGNvbnN0cnVjdG9yKGZpbGVEaXJlY3RvcnksIGdlb0tleXMsIGRhdGFWaWV3LCBsaXR0bGVFbmRpYW4sIGNhY2hlLCBzb3VyY2UpIHtcbiAgICB0aGlzLmZpbGVEaXJlY3RvcnkgPSBmaWxlRGlyZWN0b3J5O1xuICAgIHRoaXMuZ2VvS2V5cyA9IGdlb0tleXM7XG4gICAgdGhpcy5kYXRhVmlldyA9IGRhdGFWaWV3O1xuICAgIHRoaXMubGl0dGxlRW5kaWFuID0gbGl0dGxlRW5kaWFuO1xuICAgIHRoaXMudGlsZXMgPSBjYWNoZSA/IHt9IDogbnVsbDtcbiAgICB0aGlzLmlzVGlsZWQgPSAhZmlsZURpcmVjdG9yeS5TdHJpcE9mZnNldHM7XG4gICAgY29uc3QgcGxhbmFyQ29uZmlndXJhdGlvbiA9IGZpbGVEaXJlY3RvcnkuUGxhbmFyQ29uZmlndXJhdGlvbjtcbiAgICB0aGlzLnBsYW5hckNvbmZpZ3VyYXRpb24gPSAodHlwZW9mIHBsYW5hckNvbmZpZ3VyYXRpb24gPT09ICd1bmRlZmluZWQnKSA/IDEgOiBwbGFuYXJDb25maWd1cmF0aW9uO1xuICAgIGlmICh0aGlzLnBsYW5hckNvbmZpZ3VyYXRpb24gIT09IDEgJiYgdGhpcy5wbGFuYXJDb25maWd1cmF0aW9uICE9PSAyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGxhbmFyIGNvbmZpZ3VyYXRpb24uJyk7XG4gICAgfVxuXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXNzb2NpYXRlZCBwYXJzZWQgZmlsZSBkaXJlY3RvcnkuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBwYXJzZWQgZmlsZSBkaXJlY3RvcnlcbiAgICovXG4gIGdldEZpbGVEaXJlY3RvcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZURpcmVjdG9yeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhc3NvY2lhdGVkIHBhcnNlZCBnZW8ga2V5cy5cbiAgICogQHJldHVybnMge09iamVjdH0gdGhlIHBhcnNlZCBnZW8ga2V5c1xuICAgKi9cbiAgZ2V0R2VvS2V5cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZW9LZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBpbWFnZS5cbiAgICogQHJldHVybnMge051bWJlcn0gdGhlIHdpZHRoIG9mIHRoZSBpbWFnZVxuICAgKi9cbiAgZ2V0V2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZURpcmVjdG9yeS5JbWFnZVdpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgaW1hZ2UuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhlIGltYWdlXG4gICAqL1xuICBnZXRIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZURpcmVjdG9yeS5JbWFnZUxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2FtcGxlcyBwZXIgcGl4ZWwuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2Ygc2FtcGxlcyBwZXIgcGl4ZWxcbiAgICovXG4gIGdldFNhbXBsZXNQZXJQaXhlbCgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMuZmlsZURpcmVjdG9yeS5TYW1wbGVzUGVyUGl4ZWwgIT09ICd1bmRlZmluZWQnXG4gICAgICA/IHRoaXMuZmlsZURpcmVjdG9yeS5TYW1wbGVzUGVyUGl4ZWwgOiAxO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIGVhY2ggdGlsZS5cbiAgICogQHJldHVybnMge051bWJlcn0gdGhlIHdpZHRoIG9mIGVhY2ggdGlsZVxuICAgKi9cbiAgZ2V0VGlsZVdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLmlzVGlsZWQgPyB0aGlzLmZpbGVEaXJlY3RvcnkuVGlsZVdpZHRoIDogdGhpcy5nZXRXaWR0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiBlYWNoIHRpbGUuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IHRoZSBoZWlnaHQgb2YgZWFjaCB0aWxlXG4gICAqL1xuICBnZXRUaWxlSGVpZ2h0KCkge1xuICAgIGlmICh0aGlzLmlzVGlsZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGVEaXJlY3RvcnkuVGlsZUxlbmd0aDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbGVEaXJlY3RvcnkuUm93c1BlclN0cmlwICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIE1hdGgubWluKHRoaXMuZmlsZURpcmVjdG9yeS5Sb3dzUGVyU3RyaXAsIHRoaXMuZ2V0SGVpZ2h0KCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRIZWlnaHQoKTtcbiAgfVxuXG4gIGdldEJsb2NrV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGlsZVdpZHRoKCk7XG4gIH1cblxuICBnZXRCbG9ja0hlaWdodCh5KSB7XG4gICAgaWYgKHRoaXMuaXNUaWxlZCB8fCAoeSArIDEpICogdGhpcy5nZXRUaWxlSGVpZ2h0KCkgPD0gdGhpcy5nZXRIZWlnaHQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGlsZUhlaWdodCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRIZWlnaHQoKSAtICh5ICogdGhpcy5nZXRUaWxlSGVpZ2h0KCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggcGl4ZWwgYWNyb3NzIGFsbCBzYW1wbGVzLiBPbmx5IGZ1bGxcbiAgICogYnl0ZXMgYXJlIHN1cHBvcnRlZCwgYW4gZXhjZXB0aW9uIGlzIHRocm93biB3aGVuIHRoaXMgaXMgbm90IHRoZSBjYXNlLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSB0aGUgYnl0ZXMgcGVyIHBpeGVsXG4gICAqL1xuICBnZXRCeXRlc1BlclBpeGVsKCkge1xuICAgIGxldCBieXRlcyA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmZpbGVEaXJlY3RvcnkuQml0c1BlclNhbXBsZS5sZW5ndGg7ICsraSkge1xuICAgICAgYnl0ZXMgKz0gdGhpcy5nZXRTYW1wbGVCeXRlU2l6ZShpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG5cbiAgZ2V0U2FtcGxlQnl0ZVNpemUoaSkge1xuICAgIGlmIChpID49IHRoaXMuZmlsZURpcmVjdG9yeS5CaXRzUGVyU2FtcGxlLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYFNhbXBsZSBpbmRleCAke2l9IGlzIG91dCBvZiByYW5nZS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmZpbGVEaXJlY3RvcnkuQml0c1BlclNhbXBsZVtpXSAvIDgpO1xuICB9XG5cbiAgZ2V0UmVhZGVyRm9yU2FtcGxlKHNhbXBsZUluZGV4KSB7XG4gICAgY29uc3QgZm9ybWF0ID0gdGhpcy5maWxlRGlyZWN0b3J5LlNhbXBsZUZvcm1hdFxuICAgICAgPyB0aGlzLmZpbGVEaXJlY3RvcnkuU2FtcGxlRm9ybWF0W3NhbXBsZUluZGV4XSA6IDE7XG4gICAgY29uc3QgYml0c1BlclNhbXBsZSA9IHRoaXMuZmlsZURpcmVjdG9yeS5CaXRzUGVyU2FtcGxlW3NhbXBsZUluZGV4XTtcbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgY2FzZSAxOiAvLyB1bnNpZ25lZCBpbnRlZ2VyIGRhdGFcbiAgICAgICAgaWYgKGJpdHNQZXJTYW1wbGUgPD0gOCkge1xuICAgICAgICAgIHJldHVybiBEYXRhVmlldy5wcm90b3R5cGUuZ2V0VWludDg7XG4gICAgICAgIH0gZWxzZSBpZiAoYml0c1BlclNhbXBsZSA8PSAxNikge1xuICAgICAgICAgIHJldHVybiBEYXRhVmlldy5wcm90b3R5cGUuZ2V0VWludDE2O1xuICAgICAgICB9IGVsc2UgaWYgKGJpdHNQZXJTYW1wbGUgPD0gMzIpIHtcbiAgICAgICAgICByZXR1cm4gRGF0YVZpZXcucHJvdG90eXBlLmdldFVpbnQzMjtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjogLy8gdHdvcyBjb21wbGVtZW50IHNpZ25lZCBpbnRlZ2VyIGRhdGFcbiAgICAgICAgaWYgKGJpdHNQZXJTYW1wbGUgPD0gOCkge1xuICAgICAgICAgIHJldHVybiBEYXRhVmlldy5wcm90b3R5cGUuZ2V0SW50ODtcbiAgICAgICAgfSBlbHNlIGlmIChiaXRzUGVyU2FtcGxlIDw9IDE2KSB7XG4gICAgICAgICAgcmV0dXJuIERhdGFWaWV3LnByb3RvdHlwZS5nZXRJbnQxNjtcbiAgICAgICAgfSBlbHNlIGlmIChiaXRzUGVyU2FtcGxlIDw9IDMyKSB7XG4gICAgICAgICAgcmV0dXJuIERhdGFWaWV3LnByb3RvdHlwZS5nZXRJbnQzMjtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgc3dpdGNoIChiaXRzUGVyU2FtcGxlKSB7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAob2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGdldEZsb2F0MTYodGhpcywgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgcmV0dXJuIERhdGFWaWV3LnByb3RvdHlwZS5nZXRGbG9hdDMyO1xuICAgICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgICByZXR1cm4gRGF0YVZpZXcucHJvdG90eXBlLmdldEZsb2F0NjQ7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRocm93IEVycm9yKCdVbnN1cHBvcnRlZCBkYXRhIGZvcm1hdC9iaXRzUGVyU2FtcGxlJyk7XG4gIH1cblxuICBnZXRTYW1wbGVGb3JtYXQoc2FtcGxlSW5kZXggPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZURpcmVjdG9yeS5TYW1wbGVGb3JtYXRcbiAgICAgID8gdGhpcy5maWxlRGlyZWN0b3J5LlNhbXBsZUZvcm1hdFtzYW1wbGVJbmRleF0gOiAxO1xuICB9XG5cbiAgZ2V0Qml0c1BlclNhbXBsZShzYW1wbGVJbmRleCA9IDApIHtcbiAgICByZXR1cm4gdGhpcy5maWxlRGlyZWN0b3J5LkJpdHNQZXJTYW1wbGVbc2FtcGxlSW5kZXhdO1xuICB9XG5cbiAgZ2V0QXJyYXlGb3JTYW1wbGUoc2FtcGxlSW5kZXgsIHNpemUpIHtcbiAgICBjb25zdCBmb3JtYXQgPSB0aGlzLmdldFNhbXBsZUZvcm1hdChzYW1wbGVJbmRleCk7XG4gICAgY29uc3QgYml0c1BlclNhbXBsZSA9IHRoaXMuZ2V0Qml0c1BlclNhbXBsZShzYW1wbGVJbmRleCk7XG4gICAgcmV0dXJuIGFycmF5Rm9yVHlwZShmb3JtYXQsIGJpdHNQZXJTYW1wbGUsIHNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlY29kZWQgc3RyaXAgb3IgdGlsZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggdGhlIHN0cmlwIG9yIHRpbGUgeC1vZmZzZXRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgdGhlIHRpbGUgeS1vZmZzZXQgKDAgZm9yIHN0cmlwcGVkIGltYWdlcylcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNhbXBsZSB0aGUgc2FtcGxlIHRvIGdldCBmb3Igc2VwYXJhdGVkIHNhbXBsZXNcbiAgICogQHBhcmFtIHtpbXBvcnQoXCIuL2dlb3RpZmZcIikuUG9vbHxpbXBvcnQoXCIuL2dlb3RpZmZcIikuQmFzZURlY29kZXJ9IHBvb2xPckRlY29kZXIgdGhlIGRlY29kZXIgb3IgZGVjb2RlciBwb29sXG4gICAqIEBwYXJhbSB7QWJvcnRTaWduYWx9IFtzaWduYWxdIEFuIEFib3J0U2lnbmFsIHRoYXQgbWF5IGJlIHNpZ25hbGxlZCBpZiB0aGUgcmVxdWVzdCBpc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBhYm9ydGVkXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjxBcnJheUJ1ZmZlcj59XG4gICAqL1xuICBhc3luYyBnZXRUaWxlT3JTdHJpcCh4LCB5LCBzYW1wbGUsIHBvb2xPckRlY29kZXIsIHNpZ25hbCkge1xuICAgIGNvbnN0IG51bVRpbGVzUGVyUm93ID0gTWF0aC5jZWlsKHRoaXMuZ2V0V2lkdGgoKSAvIHRoaXMuZ2V0VGlsZVdpZHRoKCkpO1xuICAgIGNvbnN0IG51bVRpbGVzUGVyQ29sID0gTWF0aC5jZWlsKHRoaXMuZ2V0SGVpZ2h0KCkgLyB0aGlzLmdldFRpbGVIZWlnaHQoKSk7XG4gICAgbGV0IGluZGV4O1xuICAgIGNvbnN0IHsgdGlsZXMgfSA9IHRoaXM7XG4gICAgaWYgKHRoaXMucGxhbmFyQ29uZmlndXJhdGlvbiA9PT0gMSkge1xuICAgICAgaW5kZXggPSAoeSAqIG51bVRpbGVzUGVyUm93KSArIHg7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBsYW5hckNvbmZpZ3VyYXRpb24gPT09IDIpIHtcbiAgICAgIGluZGV4ID0gKHNhbXBsZSAqIG51bVRpbGVzUGVyUm93ICogbnVtVGlsZXNQZXJDb2wpICsgKHkgKiBudW1UaWxlc1BlclJvdykgKyB4O1xuICAgIH1cblxuICAgIGxldCBvZmZzZXQ7XG4gICAgbGV0IGJ5dGVDb3VudDtcbiAgICBpZiAodGhpcy5pc1RpbGVkKSB7XG4gICAgICBvZmZzZXQgPSB0aGlzLmZpbGVEaXJlY3RvcnkuVGlsZU9mZnNldHNbaW5kZXhdO1xuICAgICAgYnl0ZUNvdW50ID0gdGhpcy5maWxlRGlyZWN0b3J5LlRpbGVCeXRlQ291bnRzW2luZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2Zmc2V0ID0gdGhpcy5maWxlRGlyZWN0b3J5LlN0cmlwT2Zmc2V0c1tpbmRleF07XG4gICAgICBieXRlQ291bnQgPSB0aGlzLmZpbGVEaXJlY3RvcnkuU3RyaXBCeXRlQ291bnRzW2luZGV4XTtcbiAgICB9XG4gICAgY29uc3Qgc2xpY2UgPSAoYXdhaXQgdGhpcy5zb3VyY2UuZmV0Y2goW3sgb2Zmc2V0LCBsZW5ndGg6IGJ5dGVDb3VudCB9XSwgc2lnbmFsKSlbMF07XG5cbiAgICBsZXQgcmVxdWVzdDtcbiAgICBpZiAodGlsZXMgPT09IG51bGwgfHwgIXRpbGVzW2luZGV4XSkge1xuICAgIC8vIHJlc29sdmUgZWFjaCByZXF1ZXN0IGJ5IHBvdGVudGlhbGx5IGFwcGx5aW5nIGFycmF5IG5vcm1hbGl6YXRpb25cbiAgICAgIHJlcXVlc3QgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IHBvb2xPckRlY29kZXIuZGVjb2RlKHRoaXMuZmlsZURpcmVjdG9yeSwgc2xpY2UpO1xuICAgICAgICBjb25zdCBzYW1wbGVGb3JtYXQgPSB0aGlzLmdldFNhbXBsZUZvcm1hdCgpO1xuICAgICAgICBjb25zdCBiaXRzUGVyU2FtcGxlID0gdGhpcy5nZXRCaXRzUGVyU2FtcGxlKCk7XG4gICAgICAgIGlmIChuZWVkc05vcm1hbGl6YXRpb24oc2FtcGxlRm9ybWF0LCBiaXRzUGVyU2FtcGxlKSkge1xuICAgICAgICAgIGRhdGEgPSBub3JtYWxpemVBcnJheShcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBzYW1wbGVGb3JtYXQsXG4gICAgICAgICAgICB0aGlzLnBsYW5hckNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICB0aGlzLmdldFNhbXBsZXNQZXJQaXhlbCgpLFxuICAgICAgICAgICAgYml0c1BlclNhbXBsZSxcbiAgICAgICAgICAgIHRoaXMuZ2V0VGlsZVdpZHRoKCksXG4gICAgICAgICAgICB0aGlzLmdldEJsb2NrSGVpZ2h0KHkpLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9KSgpO1xuXG4gICAgICAvLyBzZXQgdGhlIGNhY2hlXG4gICAgICBpZiAodGlsZXMgIT09IG51bGwpIHtcbiAgICAgICAgdGlsZXNbaW5kZXhdID0gcmVxdWVzdDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZ2V0IGZyb20gdGhlIGNhY2hlXG4gICAgICByZXF1ZXN0ID0gdGlsZXNbaW5kZXhdO1xuICAgIH1cblxuICAgIC8vIGNhY2hlIHRoZSB0aWxlIHJlcXVlc3RcbiAgICByZXR1cm4geyB4LCB5LCBzYW1wbGUsIGRhdGE6IGF3YWl0IHJlcXVlc3QgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCByZWFkIGZ1bmN0aW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0FycmF5fSBpbWFnZVdpbmRvdyBUaGUgaW1hZ2Ugd2luZG93IGluIHBpeGVsIGNvb3JkaW5hdGVzXG4gICAqIEBwYXJhbSB7QXJyYXl9IHNhbXBsZXMgVGhlIHNlbGVjdGVkIHNhbXBsZXMgKDAtYmFzZWQgaW5kaWNlcylcbiAgICogQHBhcmFtIHtUeXBlZEFycmF5fFR5cGVkQXJyYXlbXX0gdmFsdWVBcnJheXMgVGhlIGFycmF5KHMpIHRvIHdyaXRlIGludG9cbiAgICogQHBhcmFtIHtCb29sZWFufSBpbnRlcmxlYXZlIFdoZXRoZXIgb3Igbm90IHRvIHdyaXRlIGluIGFuIGludGVybGVhdmVkIG1hbm5lclxuICAgKiBAcGFyYW0ge2ltcG9ydChcIi4vZ2VvdGlmZlwiKS5Qb29sfEFic3RyYWN0RGVjb2Rlcn0gcG9vbE9yRGVjb2RlciB0aGUgZGVjb2RlciBvciBkZWNvZGVyIHBvb2xcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHRoZSB3aWR0aCBvZiB3aW5kb3cgdG8gYmUgcmVhZCBpbnRvXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgdGhlIGhlaWdodCBvZiB3aW5kb3cgdG8gYmUgcmVhZCBpbnRvXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZXNhbXBsZU1ldGhvZCB0aGUgcmVzYW1wbGluZyBtZXRob2QgdG8gYmUgdXNlZCB3aGVuIGludGVycG9sYXRpbmdcbiAgICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW3NpZ25hbF0gQW4gQWJvcnRTaWduYWwgdGhhdCBtYXkgYmUgc2lnbmFsbGVkIGlmIHRoZSByZXF1ZXN0IGlzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGJlIGFib3J0ZWRcbiAgICogQHJldHVybnMge1Byb21pc2U8UmVhZFJhc3RlclJlc3VsdD59XG4gICAqL1xuICBhc3luYyBfcmVhZFJhc3RlcihpbWFnZVdpbmRvdywgc2FtcGxlcywgdmFsdWVBcnJheXMsIGludGVybGVhdmUsIHBvb2xPckRlY29kZXIsIHdpZHRoLFxuICAgIGhlaWdodCwgcmVzYW1wbGVNZXRob2QsIHNpZ25hbCkge1xuICAgIGNvbnN0IHRpbGVXaWR0aCA9IHRoaXMuZ2V0VGlsZVdpZHRoKCk7XG4gICAgY29uc3QgdGlsZUhlaWdodCA9IHRoaXMuZ2V0VGlsZUhlaWdodCgpO1xuICAgIGNvbnN0IGltYWdlV2lkdGggPSB0aGlzLmdldFdpZHRoKCk7XG4gICAgY29uc3QgaW1hZ2VIZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpO1xuXG4gICAgY29uc3QgbWluWFRpbGUgPSBNYXRoLm1heChNYXRoLmZsb29yKGltYWdlV2luZG93WzBdIC8gdGlsZVdpZHRoKSwgMCk7XG4gICAgY29uc3QgbWF4WFRpbGUgPSBNYXRoLm1pbihcbiAgICAgIE1hdGguY2VpbChpbWFnZVdpbmRvd1syXSAvIHRpbGVXaWR0aCksXG4gICAgICBNYXRoLmNlaWwoaW1hZ2VXaWR0aCAvIHRpbGVXaWR0aCksXG4gICAgKTtcbiAgICBjb25zdCBtaW5ZVGlsZSA9IE1hdGgubWF4KE1hdGguZmxvb3IoaW1hZ2VXaW5kb3dbMV0gLyB0aWxlSGVpZ2h0KSwgMCk7XG4gICAgY29uc3QgbWF4WVRpbGUgPSBNYXRoLm1pbihcbiAgICAgIE1hdGguY2VpbChpbWFnZVdpbmRvd1szXSAvIHRpbGVIZWlnaHQpLFxuICAgICAgTWF0aC5jZWlsKGltYWdlSGVpZ2h0IC8gdGlsZUhlaWdodCksXG4gICAgKTtcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9IGltYWdlV2luZG93WzJdIC0gaW1hZ2VXaW5kb3dbMF07XG5cbiAgICBsZXQgYnl0ZXNQZXJQaXhlbCA9IHRoaXMuZ2V0Qnl0ZXNQZXJQaXhlbCgpO1xuXG4gICAgY29uc3Qgc3JjU2FtcGxlT2Zmc2V0cyA9IFtdO1xuICAgIGNvbnN0IHNhbXBsZVJlYWRlcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNhbXBsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh0aGlzLnBsYW5hckNvbmZpZ3VyYXRpb24gPT09IDEpIHtcbiAgICAgICAgc3JjU2FtcGxlT2Zmc2V0cy5wdXNoKHN1bSh0aGlzLmZpbGVEaXJlY3RvcnkuQml0c1BlclNhbXBsZSwgMCwgc2FtcGxlc1tpXSkgLyA4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNyY1NhbXBsZU9mZnNldHMucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIHNhbXBsZVJlYWRlcnMucHVzaCh0aGlzLmdldFJlYWRlckZvclNhbXBsZShzYW1wbGVzW2ldKSk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBjb25zdCB7IGxpdHRsZUVuZGlhbiB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IHlUaWxlID0gbWluWVRpbGU7IHlUaWxlIDwgbWF4WVRpbGU7ICsreVRpbGUpIHtcbiAgICAgIGZvciAobGV0IHhUaWxlID0gbWluWFRpbGU7IHhUaWxlIDwgbWF4WFRpbGU7ICsreFRpbGUpIHtcbiAgICAgICAgZm9yIChsZXQgc2FtcGxlSW5kZXggPSAwOyBzYW1wbGVJbmRleCA8IHNhbXBsZXMubGVuZ3RoOyArK3NhbXBsZUluZGV4KSB7XG4gICAgICAgICAgY29uc3Qgc2kgPSBzYW1wbGVJbmRleDtcbiAgICAgICAgICBjb25zdCBzYW1wbGUgPSBzYW1wbGVzW3NhbXBsZUluZGV4XTtcbiAgICAgICAgICBpZiAodGhpcy5wbGFuYXJDb25maWd1cmF0aW9uID09PSAyKSB7XG4gICAgICAgICAgICBieXRlc1BlclBpeGVsID0gdGhpcy5nZXRTYW1wbGVCeXRlU2l6ZShzYW1wbGVJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLmdldFRpbGVPclN0cmlwKHhUaWxlLCB5VGlsZSwgc2FtcGxlLCBwb29sT3JEZWNvZGVyLCBzaWduYWwpLnRoZW4oKHRpbGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRpbGUuZGF0YTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG4gICAgICAgICAgICBjb25zdCBibG9ja0hlaWdodCA9IHRoaXMuZ2V0QmxvY2tIZWlnaHQodGlsZS55KTtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0TGluZSA9IHRpbGUueSAqIHRpbGVIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBmaXJzdENvbCA9IHRpbGUueCAqIHRpbGVXaWR0aDtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RMaW5lID0gZmlyc3RMaW5lICsgYmxvY2tIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBsYXN0Q29sID0gKHRpbGUueCArIDEpICogdGlsZVdpZHRoO1xuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gc2FtcGxlUmVhZGVyc1tzaV07XG5cbiAgICAgICAgICAgIGNvbnN0IHltYXggPSBNYXRoLm1pbihibG9ja0hlaWdodCwgYmxvY2tIZWlnaHQgLSAobGFzdExpbmUgLSBpbWFnZVdpbmRvd1szXSksIGltYWdlSGVpZ2h0IC0gZmlyc3RMaW5lKTtcbiAgICAgICAgICAgIGNvbnN0IHhtYXggPSBNYXRoLm1pbih0aWxlV2lkdGgsIHRpbGVXaWR0aCAtIChsYXN0Q29sIC0gaW1hZ2VXaW5kb3dbMl0pLCBpbWFnZVdpZHRoIC0gZmlyc3RDb2wpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gTWF0aC5tYXgoMCwgaW1hZ2VXaW5kb3dbMV0gLSBmaXJzdExpbmUpOyB5IDwgeW1heDsgKyt5KSB7XG4gICAgICAgICAgICAgIGZvciAobGV0IHggPSBNYXRoLm1heCgwLCBpbWFnZVdpbmRvd1swXSAtIGZpcnN0Q29sKTsgeCA8IHhtYXg7ICsreCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBpeGVsT2Zmc2V0ID0gKCh5ICogdGlsZVdpZHRoKSArIHgpICogYnl0ZXNQZXJQaXhlbDtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlYWRlci5jYWxsKFxuICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHBpeGVsT2Zmc2V0ICsgc3JjU2FtcGxlT2Zmc2V0c1tzaV0sIGxpdHRsZUVuZGlhbixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGxldCB3aW5kb3dDb29yZGluYXRlO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcmxlYXZlKSB7XG4gICAgICAgICAgICAgICAgICB3aW5kb3dDb29yZGluYXRlID0gKCh5ICsgZmlyc3RMaW5lIC0gaW1hZ2VXaW5kb3dbMV0pICogd2luZG93V2lkdGggKiBzYW1wbGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgKyAoKHggKyBmaXJzdENvbCAtIGltYWdlV2luZG93WzBdKSAqIHNhbXBsZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICArIHNpO1xuICAgICAgICAgICAgICAgICAgdmFsdWVBcnJheXNbd2luZG93Q29vcmRpbmF0ZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgd2luZG93Q29vcmRpbmF0ZSA9IChcbiAgICAgICAgICAgICAgICAgICAgKHkgKyBmaXJzdExpbmUgLSBpbWFnZVdpbmRvd1sxXSkgKiB3aW5kb3dXaWR0aFxuICAgICAgICAgICAgICAgICAgKSArIHggKyBmaXJzdENvbCAtIGltYWdlV2luZG93WzBdO1xuICAgICAgICAgICAgICAgICAgdmFsdWVBcnJheXNbc2ldW3dpbmRvd0Nvb3JkaW5hdGVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cbiAgICBpZiAoKHdpZHRoICYmIChpbWFnZVdpbmRvd1syXSAtIGltYWdlV2luZG93WzBdKSAhPT0gd2lkdGgpXG4gICAgICAgIHx8IChoZWlnaHQgJiYgKGltYWdlV2luZG93WzNdIC0gaW1hZ2VXaW5kb3dbMV0pICE9PSBoZWlnaHQpKSB7XG4gICAgICBsZXQgcmVzYW1wbGVkO1xuICAgICAgaWYgKGludGVybGVhdmUpIHtcbiAgICAgICAgcmVzYW1wbGVkID0gcmVzYW1wbGVJbnRlcmxlYXZlZChcbiAgICAgICAgICB2YWx1ZUFycmF5cyxcbiAgICAgICAgICBpbWFnZVdpbmRvd1syXSAtIGltYWdlV2luZG93WzBdLFxuICAgICAgICAgIGltYWdlV2luZG93WzNdIC0gaW1hZ2VXaW5kb3dbMV0sXG4gICAgICAgICAgd2lkdGgsIGhlaWdodCxcbiAgICAgICAgICBzYW1wbGVzLmxlbmd0aCxcbiAgICAgICAgICByZXNhbXBsZU1ldGhvZCxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc2FtcGxlZCA9IHJlc2FtcGxlKFxuICAgICAgICAgIHZhbHVlQXJyYXlzLFxuICAgICAgICAgIGltYWdlV2luZG93WzJdIC0gaW1hZ2VXaW5kb3dbMF0sXG4gICAgICAgICAgaW1hZ2VXaW5kb3dbM10gLSBpbWFnZVdpbmRvd1sxXSxcbiAgICAgICAgICB3aWR0aCwgaGVpZ2h0LFxuICAgICAgICAgIHJlc2FtcGxlTWV0aG9kLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmVzYW1wbGVkLndpZHRoID0gd2lkdGg7XG4gICAgICByZXNhbXBsZWQuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgcmV0dXJuIHJlc2FtcGxlZDtcbiAgICB9XG5cbiAgICB2YWx1ZUFycmF5cy53aWR0aCA9IHdpZHRoIHx8IGltYWdlV2luZG93WzJdIC0gaW1hZ2VXaW5kb3dbMF07XG4gICAgdmFsdWVBcnJheXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IGltYWdlV2luZG93WzNdIC0gaW1hZ2VXaW5kb3dbMV07XG5cbiAgICByZXR1cm4gdmFsdWVBcnJheXM7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgcmFzdGVyIGRhdGEgZnJvbSB0aGUgaW1hZ2UuIFRoaXMgZnVuY3Rpb24gcmVhZHMgYWxsIHNlbGVjdGVkIHNhbXBsZXNcbiAgICogaW50byBzZXBhcmF0ZSBhcnJheXMgb2YgdGhlIGNvcnJlY3QgdHlwZSBmb3IgdGhhdCBzYW1wbGUgb3IgaW50byBhIHNpbmdsZVxuICAgKiBjb21iaW5lZCBhcnJheSB3aGVuIGBpbnRlcmxlYXZlYCBpcyBzZXQuIFdoZW4gcHJvdmlkZWQsIG9ubHkgYSBzdWJzZXRcbiAgICogb2YgdGhlIHJhc3RlciBpcyByZWFkIGZvciBlYWNoIHNhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtSZWFkUmFzdGVyT3B0aW9uc30gW29wdGlvbnM9e31dIG9wdGlvbmFsIHBhcmFtZXRlcnNcbiAgICogQHJldHVybnMge1Byb21pc2U8UmVhZFJhc3RlclJlc3VsdD59IHRoZSBkZWNvZGVkIGFycmF5cyBhcyBhIHByb21pc2VcbiAgICovXG4gIGFzeW5jIHJlYWRSYXN0ZXJzKHtcbiAgICB3aW5kb3c6IHduZCwgc2FtcGxlcyA9IFtdLCBpbnRlcmxlYXZlLCBwb29sID0gbnVsbCxcbiAgICB3aWR0aCwgaGVpZ2h0LCByZXNhbXBsZU1ldGhvZCwgZmlsbFZhbHVlLCBzaWduYWwsXG4gIH0gPSB7fSkge1xuICAgIGNvbnN0IGltYWdlV2luZG93ID0gd25kIHx8IFswLCAwLCB0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCldO1xuXG4gICAgLy8gY2hlY2sgcGFyYW1ldGVyc1xuICAgIGlmIChpbWFnZVdpbmRvd1swXSA+IGltYWdlV2luZG93WzJdIHx8IGltYWdlV2luZG93WzFdID4gaW1hZ2VXaW5kb3dbM10pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdWJzZXRzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgaW1hZ2VXaW5kb3dXaWR0aCA9IGltYWdlV2luZG93WzJdIC0gaW1hZ2VXaW5kb3dbMF07XG4gICAgY29uc3QgaW1hZ2VXaW5kb3dIZWlnaHQgPSBpbWFnZVdpbmRvd1szXSAtIGltYWdlV2luZG93WzFdO1xuICAgIGNvbnN0IG51bVBpeGVscyA9IGltYWdlV2luZG93V2lkdGggKiBpbWFnZVdpbmRvd0hlaWdodDtcbiAgICBjb25zdCBzYW1wbGVzUGVyUGl4ZWwgPSB0aGlzLmdldFNhbXBsZXNQZXJQaXhlbCgpO1xuXG4gICAgaWYgKCFzYW1wbGVzIHx8ICFzYW1wbGVzLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzYW1wbGVzUGVyUGl4ZWw7ICsraSkge1xuICAgICAgICBzYW1wbGVzLnB1c2goaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2FtcGxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoc2FtcGxlc1tpXSA+PSBzYW1wbGVzUGVyUGl4ZWwpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFJhbmdlRXJyb3IoYEludmFsaWQgc2FtcGxlIGluZGV4ICcke3NhbXBsZXNbaV19Jy5gKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHZhbHVlQXJyYXlzO1xuICAgIGlmIChpbnRlcmxlYXZlKSB7XG4gICAgICBjb25zdCBmb3JtYXQgPSB0aGlzLmZpbGVEaXJlY3RvcnkuU2FtcGxlRm9ybWF0XG4gICAgICAgID8gTWF0aC5tYXguYXBwbHkobnVsbCwgdGhpcy5maWxlRGlyZWN0b3J5LlNhbXBsZUZvcm1hdCkgOiAxO1xuICAgICAgY29uc3QgYml0c1BlclNhbXBsZSA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHRoaXMuZmlsZURpcmVjdG9yeS5CaXRzUGVyU2FtcGxlKTtcbiAgICAgIHZhbHVlQXJyYXlzID0gYXJyYXlGb3JUeXBlKGZvcm1hdCwgYml0c1BlclNhbXBsZSwgbnVtUGl4ZWxzICogc2FtcGxlcy5sZW5ndGgpO1xuICAgICAgaWYgKGZpbGxWYWx1ZSkge1xuICAgICAgICB2YWx1ZUFycmF5cy5maWxsKGZpbGxWYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlQXJyYXlzID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNhbXBsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgdmFsdWVBcnJheSA9IHRoaXMuZ2V0QXJyYXlGb3JTYW1wbGUoc2FtcGxlc1tpXSwgbnVtUGl4ZWxzKTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZmlsbFZhbHVlKSAmJiBpIDwgZmlsbFZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgIHZhbHVlQXJyYXkuZmlsbChmaWxsVmFsdWVbaV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGZpbGxWYWx1ZSAmJiAhQXJyYXkuaXNBcnJheShmaWxsVmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWVBcnJheS5maWxsKGZpbGxWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVBcnJheXMucHVzaCh2YWx1ZUFycmF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwb29sT3JEZWNvZGVyID0gcG9vbCB8fCBhd2FpdCBnZXREZWNvZGVyKHRoaXMuZmlsZURpcmVjdG9yeSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZWFkUmFzdGVyKFxuICAgICAgaW1hZ2VXaW5kb3csIHNhbXBsZXMsIHZhbHVlQXJyYXlzLCBpbnRlcmxlYXZlLCBwb29sT3JEZWNvZGVyLCB3aWR0aCwgaGVpZ2h0LCByZXNhbXBsZU1ldGhvZCwgc2lnbmFsLFxuICAgICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyByYXN0ZXIgZGF0YSBmcm9tIHRoZSBpbWFnZSBhcyBSR0IuIFRoZSByZXN1bHQgaXMgYWx3YXlzIGFuXG4gICAqIGludGVybGVhdmVkIHR5cGVkIGFycmF5LlxuICAgKiBDb2xvcnNwYWNlcyBvdGhlciB0aGFuIFJHQiB3aWxsIGJlIHRyYW5zZm9ybWVkIHRvIFJHQiwgY29sb3IgbWFwcyBleHBhbmRlZC5cbiAgICogV2hlbiBubyBvdGhlciBtZXRob2QgaXMgYXBwbGljYWJsZSwgdGhlIGZpcnN0IHNhbXBsZSBpcyB1c2VkIHRvIHByb2R1Y2UgYVxuICAgKiBncmF5c2NhbGUgaW1hZ2UuXG4gICAqIFdoZW4gcHJvdmlkZWQsIG9ubHkgYSBzdWJzZXQgb2YgdGhlIHJhc3RlciBpcyByZWFkIGZvciBlYWNoIHNhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBvcHRpb25hbCBwYXJhbWV0ZXJzXG4gICAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMud2luZG93XSB0aGUgc3Vic2V0IHRvIHJlYWQgZGF0YSBmcm9tIGluIHBpeGVscy5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcmxlYXZlPXRydWVdIHdoZXRoZXIgdGhlIGRhdGEgc2hhbGwgYmUgcmVhZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIG9uZSBzaW5nbGUgYXJyYXkgb3Igc2VwYXJhdGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheXMuXG4gICAqIEBwYXJhbSB7aW1wb3J0KFwiLi9nZW90aWZmXCIpLlBvb2x9IFtvcHRpb25zLnBvb2w9bnVsbF0gVGhlIG9wdGlvbmFsIGRlY29kZXIgcG9vbCB0byB1c2UuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIG91dHB1dC4gV2hlbiB0aGUgd2lkdGggaXMgbm8gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FtZSBhcyB0aGUgaW1hZ2VzLCByZXNhbXBsaW5nIHdpbGwgYmUgcGVyZm9ybWVkLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIG91dHB1dC4gV2hlbiB0aGUgd2lkdGggaXMgbm8gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbWUgYXMgdGhlIGltYWdlcywgcmVzYW1wbGluZyB3aWxsIGJlIHBlcmZvcm1lZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJlc2FtcGxlTWV0aG9kPSduZWFyZXN0J10gVGhlIGRlc2lyZWQgcmVzYW1wbGluZyBtZXRob2QuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZW5hYmxlQWxwaGE9ZmFsc2VdIEVuYWJsZSByZWFkaW5nIGFscGhhIGNoYW5uZWwgaWYgcHJlc2VudC5cbiAgICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gW29wdGlvbnMuc2lnbmFsXSBBbiBBYm9ydFNpZ25hbCB0aGF0IG1heSBiZSBzaWduYWxsZWQgaWYgdGhlIHJlcXVlc3QgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBhYm9ydGVkXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFJlYWRSYXN0ZXJSZXN1bHQ+fSB0aGUgUkdCIGFycmF5IGFzIGEgUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgcmVhZFJHQih7IHdpbmRvdywgaW50ZXJsZWF2ZSA9IHRydWUsIHBvb2wgPSBudWxsLCB3aWR0aCwgaGVpZ2h0LFxuICAgIHJlc2FtcGxlTWV0aG9kLCBlbmFibGVBbHBoYSA9IGZhbHNlLCBzaWduYWwgfSA9IHt9KSB7XG4gICAgY29uc3QgaW1hZ2VXaW5kb3cgPSB3aW5kb3cgfHwgWzAsIDAsIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKV07XG5cbiAgICAvLyBjaGVjayBwYXJhbWV0ZXJzXG4gICAgaWYgKGltYWdlV2luZG93WzBdID4gaW1hZ2VXaW5kb3dbMl0gfHwgaW1hZ2VXaW5kb3dbMV0gPiBpbWFnZVdpbmRvd1szXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN1YnNldHMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBwaSA9IHRoaXMuZmlsZURpcmVjdG9yeS5QaG90b21ldHJpY0ludGVycHJldGF0aW9uO1xuXG4gICAgaWYgKHBpID09PSBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucy5SR0IpIHtcbiAgICAgIGxldCBzID0gWzAsIDEsIDJdO1xuICAgICAgaWYgKCghKHRoaXMuZmlsZURpcmVjdG9yeS5FeHRyYVNhbXBsZXMgPT09IEV4dHJhU2FtcGxlc1ZhbHVlcy5VbnNwZWNpZmllZCkpICYmIGVuYWJsZUFscGhhKSB7XG4gICAgICAgIHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmZpbGVEaXJlY3RvcnkuQml0c1BlclNhbXBsZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIHMucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVhZFJhc3RlcnMoe1xuICAgICAgICB3aW5kb3csXG4gICAgICAgIGludGVybGVhdmUsXG4gICAgICAgIHNhbXBsZXM6IHMsXG4gICAgICAgIHBvb2wsXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIHJlc2FtcGxlTWV0aG9kLFxuICAgICAgICBzaWduYWwsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgc2FtcGxlcztcbiAgICBzd2l0Y2ggKHBpKSB7XG4gICAgICBjYXNlIHBob3RvbWV0cmljSW50ZXJwcmV0YXRpb25zLldoaXRlSXNaZXJvOlxuICAgICAgY2FzZSBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucy5CbGFja0lzWmVybzpcbiAgICAgIGNhc2UgcGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbnMuUGFsZXR0ZTpcbiAgICAgICAgc2FtcGxlcyA9IFswXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHBob3RvbWV0cmljSW50ZXJwcmV0YXRpb25zLkNNWUs6XG4gICAgICAgIHNhbXBsZXMgPSBbMCwgMSwgMiwgM107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucy5ZQ2JDcjpcbiAgICAgIGNhc2UgcGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbnMuQ0lFTGFiOlxuICAgICAgICBzYW1wbGVzID0gWzAsIDEsIDJdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBvciB1bnN1cHBvcnRlZCBwaG90b21ldHJpYyBpbnRlcnByZXRhdGlvbi4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdWJPcHRpb25zID0ge1xuICAgICAgd2luZG93OiBpbWFnZVdpbmRvdyxcbiAgICAgIGludGVybGVhdmU6IHRydWUsXG4gICAgICBzYW1wbGVzLFxuICAgICAgcG9vbCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcmVzYW1wbGVNZXRob2QsXG4gICAgICBzaWduYWwsXG4gICAgfTtcbiAgICBjb25zdCB7IGZpbGVEaXJlY3RvcnkgfSA9IHRoaXM7XG4gICAgY29uc3QgcmFzdGVyID0gYXdhaXQgdGhpcy5yZWFkUmFzdGVycyhzdWJPcHRpb25zKTtcblxuICAgIGNvbnN0IG1heCA9IDIgKiogdGhpcy5maWxlRGlyZWN0b3J5LkJpdHNQZXJTYW1wbGVbMF07XG4gICAgbGV0IGRhdGE7XG4gICAgc3dpdGNoIChwaSkge1xuICAgICAgY2FzZSBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucy5XaGl0ZUlzWmVybzpcbiAgICAgICAgZGF0YSA9IGZyb21XaGl0ZUlzWmVybyhyYXN0ZXIsIG1heCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucy5CbGFja0lzWmVybzpcbiAgICAgICAgZGF0YSA9IGZyb21CbGFja0lzWmVybyhyYXN0ZXIsIG1heCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucy5QYWxldHRlOlxuICAgICAgICBkYXRhID0gZnJvbVBhbGV0dGUocmFzdGVyLCBmaWxlRGlyZWN0b3J5LkNvbG9yTWFwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHBob3RvbWV0cmljSW50ZXJwcmV0YXRpb25zLkNNWUs6XG4gICAgICAgIGRhdGEgPSBmcm9tQ01ZSyhyYXN0ZXIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgcGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbnMuWUNiQ3I6XG4gICAgICAgIGRhdGEgPSBmcm9tWUNiQ3IocmFzdGVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHBob3RvbWV0cmljSW50ZXJwcmV0YXRpb25zLkNJRUxhYjpcbiAgICAgICAgZGF0YSA9IGZyb21DSUVMYWIocmFzdGVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHBob3RvbWV0cmljIGludGVycHJldGF0aW9uLicpO1xuICAgIH1cblxuICAgIC8vIGlmIG5vbi1pbnRlcmxlYXZlZCBkYXRhIGlzIHJlcXVlc3RlZCwgd2UgbXVzdCBzcGxpdCB0aGUgY2hhbm5lbHNcbiAgICAvLyBpbnRvIHRoZWlyIHJlc3BlY3RpdmUgYXJyYXlzXG4gICAgaWYgKCFpbnRlcmxlYXZlKSB7XG4gICAgICBjb25zdCByZWQgPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCAvIDMpO1xuICAgICAgY29uc3QgZ3JlZW4gPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCAvIDMpO1xuICAgICAgY29uc3QgYmx1ZSA9IG5ldyBVaW50OEFycmF5KGRhdGEubGVuZ3RoIC8gMyk7XG4gICAgICBmb3IgKGxldCBpID0gMCwgaiA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSAzLCArK2opIHtcbiAgICAgICAgcmVkW2pdID0gZGF0YVtpXTtcbiAgICAgICAgZ3JlZW5bal0gPSBkYXRhW2kgKyAxXTtcbiAgICAgICAgYmx1ZVtqXSA9IGRhdGFbaSArIDJdO1xuICAgICAgfVxuICAgICAgZGF0YSA9IFtyZWQsIGdyZWVuLCBibHVlXTtcbiAgICB9XG5cbiAgICBkYXRhLndpZHRoID0gcmFzdGVyLndpZHRoO1xuICAgIGRhdGEuaGVpZ2h0ID0gcmFzdGVyLmhlaWdodDtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRpZXBvaW50cy5cbiAgICogQHJldHVybnMge09iamVjdFtdfVxuICAgKi9cbiAgZ2V0VGllUG9pbnRzKCkge1xuICAgIGlmICghdGhpcy5maWxlRGlyZWN0b3J5Lk1vZGVsVGllcG9pbnQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCB0aWVQb2ludHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZmlsZURpcmVjdG9yeS5Nb2RlbFRpZXBvaW50Lmxlbmd0aDsgaSArPSA2KSB7XG4gICAgICB0aWVQb2ludHMucHVzaCh7XG4gICAgICAgIGk6IHRoaXMuZmlsZURpcmVjdG9yeS5Nb2RlbFRpZXBvaW50W2ldLFxuICAgICAgICBqOiB0aGlzLmZpbGVEaXJlY3RvcnkuTW9kZWxUaWVwb2ludFtpICsgMV0sXG4gICAgICAgIGs6IHRoaXMuZmlsZURpcmVjdG9yeS5Nb2RlbFRpZXBvaW50W2kgKyAyXSxcbiAgICAgICAgeDogdGhpcy5maWxlRGlyZWN0b3J5Lk1vZGVsVGllcG9pbnRbaSArIDNdLFxuICAgICAgICB5OiB0aGlzLmZpbGVEaXJlY3RvcnkuTW9kZWxUaWVwb2ludFtpICsgNF0sXG4gICAgICAgIHo6IHRoaXMuZmlsZURpcmVjdG9yeS5Nb2RlbFRpZXBvaW50W2kgKyA1XSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGllUG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBhcnNlZCBHREFMIG1ldGFkYXRhIGl0ZW1zLlxuICAgKlxuICAgKiBJZiBzYW1wbGUgaXMgcGFzc2VkIHRvIG51bGwsIGRhdGFzZXQtbGV2ZWwgbWV0YWRhdGEgd2lsbCBiZSByZXR1cm5lZC5cbiAgICogT3RoZXJ3aXNlIG9ubHkgbWV0YWRhdGEgc3BlY2lmaWMgdG8gdGhlIHByb3ZpZGVkIHNhbXBsZSB3aWxsIGJlIHJldHVybmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3NhbXBsZT1udWxsXSBUaGUgc2FtcGxlIGluZGV4LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgZ2V0R0RBTE1ldGFkYXRhKHNhbXBsZSA9IG51bGwpIHtcbiAgICBjb25zdCBtZXRhZGF0YSA9IHt9O1xuICAgIGlmICghdGhpcy5maWxlRGlyZWN0b3J5LkdEQUxfTUVUQURBVEEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzdHJpbmcgPSB0aGlzLmZpbGVEaXJlY3RvcnkuR0RBTF9NRVRBREFUQTtcblxuICAgIGxldCBpdGVtcyA9IGZpbmRUYWdzQnlOYW1lKHN0cmluZywgJ0l0ZW0nKTtcblxuICAgIGlmIChzYW1wbGUgPT09IG51bGwpIHtcbiAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiBnZXRBdHRyaWJ1dGUoaXRlbSwgJ3NhbXBsZScpID09PSB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gTnVtYmVyKGdldEF0dHJpYnV0ZShpdGVtLCAnc2FtcGxlJykpID09PSBzYW1wbGUpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgIG1ldGFkYXRhW2dldEF0dHJpYnV0ZShpdGVtLCAnbmFtZScpXSA9IGl0ZW0uaW5uZXI7XG4gICAgfVxuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBHREFMIG5vZGF0YSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfG51bGx9XG4gICAqL1xuICBnZXRHREFMTm9EYXRhKCkge1xuICAgIGlmICghdGhpcy5maWxlRGlyZWN0b3J5LkdEQUxfTk9EQVRBKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc3RyaW5nID0gdGhpcy5maWxlRGlyZWN0b3J5LkdEQUxfTk9EQVRBO1xuICAgIHJldHVybiBOdW1iZXIoc3RyaW5nLnN1YnN0cmluZygwLCBzdHJpbmcubGVuZ3RoIC0gMSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGltYWdlIG9yaWdpbiBhcyBhIFhZWi12ZWN0b3IuIFdoZW4gdGhlIGltYWdlIGhhcyBubyBhZmZpbmVcbiAgICogdHJhbnNmb3JtYXRpb24sIHRoZW4gYW4gZXhjZXB0aW9uIGlzIHRocm93bi5cbiAgICogQHJldHVybnMge0FycmF5PG51bWJlcj59IFRoZSBvcmlnaW4gYXMgYSB2ZWN0b3JcbiAgICovXG4gIGdldE9yaWdpbigpIHtcbiAgICBjb25zdCB0aWVQb2ludHMgPSB0aGlzLmZpbGVEaXJlY3RvcnkuTW9kZWxUaWVwb2ludDtcbiAgICBjb25zdCBtb2RlbFRyYW5zZm9ybWF0aW9uID0gdGhpcy5maWxlRGlyZWN0b3J5Lk1vZGVsVHJhbnNmb3JtYXRpb247XG4gICAgaWYgKHRpZVBvaW50cyAmJiB0aWVQb2ludHMubGVuZ3RoID09PSA2KSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aWVQb2ludHNbM10sXG4gICAgICAgIHRpZVBvaW50c1s0XSxcbiAgICAgICAgdGllUG9pbnRzWzVdLFxuICAgICAgXTtcbiAgICB9XG4gICAgaWYgKG1vZGVsVHJhbnNmb3JtYXRpb24pIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIG1vZGVsVHJhbnNmb3JtYXRpb25bM10sXG4gICAgICAgIG1vZGVsVHJhbnNmb3JtYXRpb25bN10sXG4gICAgICAgIG1vZGVsVHJhbnNmb3JtYXRpb25bMTFdLFxuICAgICAgXTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgaW1hZ2UgZG9lcyBub3QgaGF2ZSBhbiBhZmZpbmUgdHJhbnNmb3JtYXRpb24uJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW1hZ2UgcmVzb2x1dGlvbiBhcyBhIFhZWi12ZWN0b3IuIFdoZW4gdGhlIGltYWdlIGhhcyBubyBhZmZpbmVcbiAgICogdHJhbnNmb3JtYXRpb24sIHRoZW4gYW4gZXhjZXB0aW9uIGlzIHRocm93bi5cbiAgICogQHBhcmFtIHtHZW9USUZGSW1hZ2V9IFtyZWZlcmVuY2VJbWFnZT1udWxsXSBBIHJlZmVyZW5jZSBpbWFnZSB0byBjYWxjdWxhdGUgdGhlIHJlc29sdXRpb24gZnJvbVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIGNhc2VzIHdoZW4gdGhlIGN1cnJlbnQgaW1hZ2UgZG9lcyBub3QgaGF2ZSB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZCB0YWdzIG9uIGl0cyBvd24uXG4gICAqIEByZXR1cm5zIHtBcnJheTxudW1iZXI+fSBUaGUgcmVzb2x1dGlvbiBhcyBhIHZlY3RvclxuICAgKi9cbiAgZ2V0UmVzb2x1dGlvbihyZWZlcmVuY2VJbWFnZSA9IG51bGwpIHtcbiAgICBjb25zdCBtb2RlbFBpeGVsU2NhbGUgPSB0aGlzLmZpbGVEaXJlY3RvcnkuTW9kZWxQaXhlbFNjYWxlO1xuICAgIGNvbnN0IG1vZGVsVHJhbnNmb3JtYXRpb24gPSB0aGlzLmZpbGVEaXJlY3RvcnkuTW9kZWxUcmFuc2Zvcm1hdGlvbjtcblxuICAgIGlmIChtb2RlbFBpeGVsU2NhbGUpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIG1vZGVsUGl4ZWxTY2FsZVswXSxcbiAgICAgICAgLW1vZGVsUGl4ZWxTY2FsZVsxXSxcbiAgICAgICAgbW9kZWxQaXhlbFNjYWxlWzJdLFxuICAgICAgXTtcbiAgICB9XG4gICAgaWYgKG1vZGVsVHJhbnNmb3JtYXRpb24pIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIG1vZGVsVHJhbnNmb3JtYXRpb25bMF0sXG4gICAgICAgIG1vZGVsVHJhbnNmb3JtYXRpb25bNV0sXG4gICAgICAgIG1vZGVsVHJhbnNmb3JtYXRpb25bMTBdLFxuICAgICAgXTtcbiAgICB9XG5cbiAgICBpZiAocmVmZXJlbmNlSW1hZ2UpIHtcbiAgICAgIGNvbnN0IFtyZWZSZXNYLCByZWZSZXNZLCByZWZSZXNaXSA9IHJlZmVyZW5jZUltYWdlLmdldFJlc29sdXRpb24oKTtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHJlZlJlc1ggKiByZWZlcmVuY2VJbWFnZS5nZXRXaWR0aCgpIC8gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICByZWZSZXNZICogcmVmZXJlbmNlSW1hZ2UuZ2V0SGVpZ2h0KCkgLyB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICByZWZSZXNaICogcmVmZXJlbmNlSW1hZ2UuZ2V0V2lkdGgoKSAvIHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgIF07XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgaW1hZ2UgZG9lcyBub3QgaGF2ZSBhbiBhZmZpbmUgdHJhbnNmb3JtYXRpb24uJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcGl4ZWxzIG9mIHRoZSBpbWFnZSBkZXBpY3QgYW4gYXJlYSAob3IgcG9pbnQpLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gV2hldGhlciB0aGUgcGl4ZWxzIGFyZSBhIHBvaW50XG4gICAqL1xuICBwaXhlbElzQXJlYSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZW9LZXlzLkdUUmFzdGVyVHlwZUdlb0tleSA9PT0gMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbWFnZSBib3VuZGluZyBib3ggYXMgYW4gYXJyYXkgb2YgNCB2YWx1ZXM6IG1pbi14LCBtaW4teSxcbiAgICogbWF4LXggYW5kIG1heC15LiBXaGVuIHRoZSBpbWFnZSBoYXMgbm8gYWZmaW5lIHRyYW5zZm9ybWF0aW9uLCB0aGVuIGFuXG4gICAqIGV4Y2VwdGlvbiBpcyB0aHJvd24uXG4gICAqIEByZXR1cm5zIHtBcnJheTxudW1iZXI+fSBUaGUgYm91bmRpbmcgYm94XG4gICAqL1xuICBnZXRCb3VuZGluZ0JveCgpIHtcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLmdldE9yaWdpbigpO1xuICAgIGNvbnN0IHJlc29sdXRpb24gPSB0aGlzLmdldFJlc29sdXRpb24oKTtcblxuICAgIGNvbnN0IHgxID0gb3JpZ2luWzBdO1xuICAgIGNvbnN0IHkxID0gb3JpZ2luWzFdO1xuXG4gICAgY29uc3QgeDIgPSB4MSArIChyZXNvbHV0aW9uWzBdICogdGhpcy5nZXRXaWR0aCgpKTtcbiAgICBjb25zdCB5MiA9IHkxICsgKHJlc29sdXRpb25bMV0gKiB0aGlzLmdldEhlaWdodCgpKTtcblxuICAgIHJldHVybiBbXG4gICAgICBNYXRoLm1pbih4MSwgeDIpLFxuICAgICAgTWF0aC5taW4oeTEsIHkyKSxcbiAgICAgIE1hdGgubWF4KHgxLCB4MiksXG4gICAgICBNYXRoLm1heCh5MSwgeTIpLFxuICAgIF07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2VvVElGRkltYWdlO1xuIiwiLypcbiAgU29tZSBwYXJ0cyBvZiB0aGlzIGZpbGUgYXJlIGJhc2VkIG9uIFVUSUYuanMsXG4gIHdoaWNoIHdhcyByZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gIFlvdSBjYW4gdmlldyB0aGF0IGhlcmU6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9waG90b3BlYS9VVElGLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiovXG5pbXBvcnQgeyBmaWVsZFRhZ05hbWVzLCBmaWVsZFRhZ1R5cGVzLCBmaWVsZFR5cGVOYW1lcywgZ2VvS2V5TmFtZXMgfSBmcm9tICcuL2dsb2JhbHMuanMnO1xuaW1wb3J0IHsgYXNzaWduLCBlbmRzV2l0aCwgZm9yRWFjaCwgaW52ZXJ0LCB0aW1lcyB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5jb25zdCB0YWdOYW1lMkNvZGUgPSBpbnZlcnQoZmllbGRUYWdOYW1lcyk7XG5jb25zdCBnZW9LZXlOYW1lMkNvZGUgPSBpbnZlcnQoZ2VvS2V5TmFtZXMpO1xuY29uc3QgbmFtZTJjb2RlID0ge307XG5hc3NpZ24obmFtZTJjb2RlLCB0YWdOYW1lMkNvZGUpO1xuYXNzaWduKG5hbWUyY29kZSwgZ2VvS2V5TmFtZTJDb2RlKTtcbmNvbnN0IHR5cGVOYW1lMmJ5dGUgPSBpbnZlcnQoZmllbGRUeXBlTmFtZXMpO1xuXG4vLyBjb25maWcgdmFyaWFibGVzXG5jb25zdCBudW1CeXRlc0luSWZkID0gMTAwMDtcblxuY29uc3QgX2JpbkJFID0ge1xuICBuZXh0WmVybzogKGRhdGEsIG8pID0+IHtcbiAgICBsZXQgb2luY3IgPSBvO1xuICAgIHdoaWxlIChkYXRhW29pbmNyXSAhPT0gMCkge1xuICAgICAgb2luY3IrKztcbiAgICB9XG4gICAgcmV0dXJuIG9pbmNyO1xuICB9LFxuICByZWFkVXNob3J0OiAoYnVmZiwgcCkgPT4ge1xuICAgIHJldHVybiAoYnVmZltwXSA8PCA4KSB8IGJ1ZmZbcCArIDFdO1xuICB9LFxuICByZWFkU2hvcnQ6IChidWZmLCBwKSA9PiB7XG4gICAgY29uc3QgYSA9IF9iaW5CRS51aTg7XG4gICAgYVswXSA9IGJ1ZmZbcCArIDFdO1xuICAgIGFbMV0gPSBidWZmW3AgKyAwXTtcbiAgICByZXR1cm4gX2JpbkJFLmkxNlswXTtcbiAgfSxcbiAgcmVhZEludDogKGJ1ZmYsIHApID0+IHtcbiAgICBjb25zdCBhID0gX2JpbkJFLnVpODtcbiAgICBhWzBdID0gYnVmZltwICsgM107XG4gICAgYVsxXSA9IGJ1ZmZbcCArIDJdO1xuICAgIGFbMl0gPSBidWZmW3AgKyAxXTtcbiAgICBhWzNdID0gYnVmZltwICsgMF07XG4gICAgcmV0dXJuIF9iaW5CRS5pMzJbMF07XG4gIH0sXG4gIHJlYWRVaW50OiAoYnVmZiwgcCkgPT4ge1xuICAgIGNvbnN0IGEgPSBfYmluQkUudWk4O1xuICAgIGFbMF0gPSBidWZmW3AgKyAzXTtcbiAgICBhWzFdID0gYnVmZltwICsgMl07XG4gICAgYVsyXSA9IGJ1ZmZbcCArIDFdO1xuICAgIGFbM10gPSBidWZmW3AgKyAwXTtcbiAgICByZXR1cm4gX2JpbkJFLnVpMzJbMF07XG4gIH0sXG4gIHJlYWRBU0NJSTogKGJ1ZmYsIHAsIGwpID0+IHtcbiAgICByZXR1cm4gbC5tYXAoKGkpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZltwICsgaV0pKS5qb2luKCcnKTtcbiAgfSxcbiAgcmVhZEZsb2F0OiAoYnVmZiwgcCkgPT4ge1xuICAgIGNvbnN0IGEgPSBfYmluQkUudWk4O1xuICAgIHRpbWVzKDQsIChpKSA9PiB7XG4gICAgICBhW2ldID0gYnVmZltwICsgMyAtIGldO1xuICAgIH0pO1xuICAgIHJldHVybiBfYmluQkUuZmwzMlswXTtcbiAgfSxcbiAgcmVhZERvdWJsZTogKGJ1ZmYsIHApID0+IHtcbiAgICBjb25zdCBhID0gX2JpbkJFLnVpODtcbiAgICB0aW1lcyg4LCAoaSkgPT4ge1xuICAgICAgYVtpXSA9IGJ1ZmZbcCArIDcgLSBpXTtcbiAgICB9KTtcbiAgICByZXR1cm4gX2JpbkJFLmZsNjRbMF07XG4gIH0sXG4gIHdyaXRlVXNob3J0OiAoYnVmZiwgcCwgbikgPT4ge1xuICAgIGJ1ZmZbcF0gPSAobiA+PiA4KSAmIDI1NTtcbiAgICBidWZmW3AgKyAxXSA9IG4gJiAyNTU7XG4gIH0sXG4gIHdyaXRlVWludDogKGJ1ZmYsIHAsIG4pID0+IHtcbiAgICBidWZmW3BdID0gKG4gPj4gMjQpICYgMjU1O1xuICAgIGJ1ZmZbcCArIDFdID0gKG4gPj4gMTYpICYgMjU1O1xuICAgIGJ1ZmZbcCArIDJdID0gKG4gPj4gOCkgJiAyNTU7XG4gICAgYnVmZltwICsgM10gPSAobiA+PiAwKSAmIDI1NTtcbiAgfSxcbiAgd3JpdGVBU0NJSTogKGJ1ZmYsIHAsIHMpID0+IHtcbiAgICB0aW1lcyhzLmxlbmd0aCwgKGkpID0+IHtcbiAgICAgIGJ1ZmZbcCArIGldID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIH0pO1xuICB9LFxuICB1aTg6IG5ldyBVaW50OEFycmF5KDgpLFxufTtcblxuX2JpbkJFLmZsNjQgPSBuZXcgRmxvYXQ2NEFycmF5KF9iaW5CRS51aTguYnVmZmVyKTtcblxuX2JpbkJFLndyaXRlRG91YmxlID0gKGJ1ZmYsIHAsIG4pID0+IHtcbiAgX2JpbkJFLmZsNjRbMF0gPSBuO1xuICB0aW1lcyg4LCAoaSkgPT4ge1xuICAgIGJ1ZmZbcCArIGldID0gX2JpbkJFLnVpOFs3IC0gaV07XG4gIH0pO1xufTtcblxuY29uc3QgX3dyaXRlSUZEID0gKGJpbiwgZGF0YSwgX29mZnNldCwgaWZkKSA9PiB7XG4gIGxldCBvZmZzZXQgPSBfb2Zmc2V0O1xuXG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhpZmQpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgcmV0dXJuIGtleSAhPT0gdW5kZWZpbmVkICYmIGtleSAhPT0gbnVsbCAmJiBrZXkgIT09ICd1bmRlZmluZWQnO1xuICB9KTtcblxuICBiaW4ud3JpdGVVc2hvcnQoZGF0YSwgb2Zmc2V0LCBrZXlzLmxlbmd0aCk7XG4gIG9mZnNldCArPSAyO1xuXG4gIGxldCBlb2ZmID0gb2Zmc2V0ICsgKDEyICoga2V5cy5sZW5ndGgpICsgNDtcblxuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgbGV0IHRhZyA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdudW1iZXInKSB7XG4gICAgICB0YWcgPSBrZXk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgdGFnID0gcGFyc2VJbnQoa2V5LCAxMCk7XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZU5hbWUgPSBmaWVsZFRhZ1R5cGVzW3RhZ107XG4gICAgY29uc3QgdHlwZU51bSA9IHR5cGVOYW1lMmJ5dGVbdHlwZU5hbWVdO1xuXG4gICAgaWYgKHR5cGVOYW1lID09IG51bGwgfHwgdHlwZU5hbWUgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgdHlwZU5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gdHlwZSBvZiB0YWc6ICR7dGFnfWApO1xuICAgIH1cblxuICAgIGxldCB2YWwgPSBpZmRba2V5XTtcblxuICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gZ2V0IHZhbHVlIGZvciBrZXkgJHtrZXl9YCk7XG4gICAgfVxuXG4gICAgLy8gQVNDSUlaIGZvcm1hdCB3aXRoIHRyYWlsaW5nIDAgY2hhcmFjdGVyXG4gICAgLy8gaHR0cDovL3d3dy5maWxlZm9ybWF0LmluZm8vZm9ybWF0L3RpZmYvY29yaW9uLmh0bVxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc3ODMwNDQvd2hhdHMtdGhlLWRpZmZlcmVuY2UtYmV0d2Vlbi1hc2NpaXotdnMtYXNjaWlcbiAgICBpZiAodHlwZU5hbWUgPT09ICdBU0NJSScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgZW5kc1dpdGgodmFsLCAnXFx1MDAwMCcpID09PSBmYWxzZSkge1xuICAgICAgdmFsICs9ICdcXHUwMDAwJztcbiAgICB9XG5cbiAgICBjb25zdCBudW0gPSB2YWwubGVuZ3RoO1xuXG4gICAgYmluLndyaXRlVXNob3J0KGRhdGEsIG9mZnNldCwgdGFnKTtcbiAgICBvZmZzZXQgKz0gMjtcblxuICAgIGJpbi53cml0ZVVzaG9ydChkYXRhLCBvZmZzZXQsIHR5cGVOdW0pO1xuICAgIG9mZnNldCArPSAyO1xuXG4gICAgYmluLndyaXRlVWludChkYXRhLCBvZmZzZXQsIG51bSk7XG4gICAgb2Zmc2V0ICs9IDQ7XG5cbiAgICBsZXQgZGxlbiA9IFstMSwgMSwgMSwgMiwgNCwgOCwgMCwgMCwgMCwgMCwgMCwgMCwgOF1bdHlwZU51bV0gKiBudW07XG4gICAgbGV0IHRvZmYgPSBvZmZzZXQ7XG5cbiAgICBpZiAoZGxlbiA+IDQpIHtcbiAgICAgIGJpbi53cml0ZVVpbnQoZGF0YSwgb2Zmc2V0LCBlb2ZmKTtcbiAgICAgIHRvZmYgPSBlb2ZmO1xuICAgIH1cblxuICAgIGlmICh0eXBlTmFtZSA9PT0gJ0FTQ0lJJykge1xuICAgICAgYmluLndyaXRlQVNDSUkoZGF0YSwgdG9mZiwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVOYW1lID09PSAnU0hPUlQnKSB7XG4gICAgICB0aW1lcyhudW0sIChpKSA9PiB7XG4gICAgICAgIGJpbi53cml0ZVVzaG9ydChkYXRhLCB0b2ZmICsgKDIgKiBpKSwgdmFsW2ldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZU5hbWUgPT09ICdMT05HJykge1xuICAgICAgdGltZXMobnVtLCAoaSkgPT4ge1xuICAgICAgICBiaW4ud3JpdGVVaW50KGRhdGEsIHRvZmYgKyAoNCAqIGkpLCB2YWxbaV0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlTmFtZSA9PT0gJ1JBVElPTkFMJykge1xuICAgICAgdGltZXMobnVtLCAoaSkgPT4ge1xuICAgICAgICBiaW4ud3JpdGVVaW50KGRhdGEsIHRvZmYgKyAoOCAqIGkpLCBNYXRoLnJvdW5kKHZhbFtpXSAqIDEwMDAwKSk7XG4gICAgICAgIGJpbi53cml0ZVVpbnQoZGF0YSwgdG9mZiArICg4ICogaSkgKyA0LCAxMDAwMCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVOYW1lID09PSAnRE9VQkxFJykge1xuICAgICAgdGltZXMobnVtLCAoaSkgPT4ge1xuICAgICAgICBiaW4ud3JpdGVEb3VibGUoZGF0YSwgdG9mZiArICg4ICogaSksIHZhbFtpXSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZGxlbiA+IDQpIHtcbiAgICAgIGRsZW4gKz0gKGRsZW4gJiAxKTtcbiAgICAgIGVvZmYgKz0gZGxlbjtcbiAgICB9XG5cbiAgICBvZmZzZXQgKz0gNDtcbiAgfVxuXG4gIHJldHVybiBbb2Zmc2V0LCBlb2ZmXTtcbn07XG5cbmNvbnN0IGVuY29kZUlmZHMgPSAoaWZkcykgPT4ge1xuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkobnVtQnl0ZXNJbklmZCk7XG4gIGxldCBvZmZzZXQgPSA0O1xuICBjb25zdCBiaW4gPSBfYmluQkU7XG5cbiAgLy8gc2V0IGJpZy1lbmRpYW4gYnl0ZS1vcmRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9USUZGI0J5dGVfb3JkZXJcbiAgZGF0YVswXSA9IDc3O1xuICBkYXRhWzFdID0gNzc7XG5cbiAgLy8gc2V0IGZvcm1hdC12ZXJzaW9uIG51bWJlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9USUZGI0J5dGVfb3JkZXJcbiAgZGF0YVszXSA9IDQyO1xuXG4gIGxldCBpZmRvID0gODtcblxuICBiaW4ud3JpdGVVaW50KGRhdGEsIG9mZnNldCwgaWZkbyk7XG5cbiAgb2Zmc2V0ICs9IDQ7XG5cbiAgaWZkcy5mb3JFYWNoKChpZmQsIGkpID0+IHtcbiAgICBjb25zdCBub2ZmcyA9IF93cml0ZUlGRChiaW4sIGRhdGEsIGlmZG8sIGlmZCk7XG4gICAgaWZkbyA9IG5vZmZzWzFdO1xuICAgIGlmIChpIDwgaWZkcy5sZW5ndGggLSAxKSB7XG4gICAgICBiaW4ud3JpdGVVaW50KGRhdGEsIG5vZmZzWzBdLCBpZmRvKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChkYXRhLnNsaWNlKSB7XG4gICAgcmV0dXJuIGRhdGEuc2xpY2UoMCwgaWZkbykuYnVmZmVyO1xuICB9XG5cbiAgLy8gbm9kZSBoYXNuJ3QgaW1wbGVtZW50ZWQgc2xpY2Ugb24gVWludDhBcnJheSB5ZXRcbiAgY29uc3QgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoaWZkbyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaWZkbzsgaSsrKSB7XG4gICAgcmVzdWx0W2ldID0gZGF0YVtpXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LmJ1ZmZlcjtcbn07XG5cbmNvbnN0IGVuY29kZUltYWdlID0gKHZhbHVlcywgd2lkdGgsIGhlaWdodCwgbWV0YWRhdGEpID0+IHtcbiAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkIHx8IGhlaWdodCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgeW91IHBhc3NlZCBpbnRvIGVuY29kZUltYWdlIGEgd2lkdGggb2YgdHlwZSAke2hlaWdodH1gKTtcbiAgfVxuXG4gIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkIHx8IHdpZHRoID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGB5b3UgcGFzc2VkIGludG8gZW5jb2RlSW1hZ2UgYSB3aWR0aCBvZiB0eXBlICR7d2lkdGh9YCk7XG4gIH1cblxuICBjb25zdCBpZmQgPSB7XG4gICAgMjU2OiBbd2lkdGhdLCAvLyBJbWFnZVdpZHRoXG4gICAgMjU3OiBbaGVpZ2h0XSwgLy8gSW1hZ2VMZW5ndGhcbiAgICAyNzM6IFtudW1CeXRlc0luSWZkXSwgLy8gc3RyaXBzIG9mZnNldFxuICAgIDI3ODogW2hlaWdodF0sIC8vIFJvd3NQZXJTdHJpcFxuICAgIDMwNTogJ2dlb3RpZmYuanMnLCAvLyBubyBhcnJheSBmb3IgQVNDSUkoWilcbiAgfTtcblxuICBpZiAobWV0YWRhdGEpIHtcbiAgICBmb3IgKGNvbnN0IGkgaW4gbWV0YWRhdGEpIHtcbiAgICAgIGlmIChtZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICBpZmRbaV0gPSBtZXRhZGF0YVtpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBwcmZ4ID0gbmV3IFVpbnQ4QXJyYXkoZW5jb2RlSWZkcyhbaWZkXSkpO1xuXG4gIGNvbnN0IGltZyA9IG5ldyBVaW50OEFycmF5KHZhbHVlcyk7XG5cbiAgY29uc3Qgc2FtcGxlc1BlclBpeGVsID0gaWZkWzI3N107XG5cbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KG51bUJ5dGVzSW5JZmQgKyAod2lkdGggKiBoZWlnaHQgKiBzYW1wbGVzUGVyUGl4ZWwpKTtcbiAgdGltZXMocHJmeC5sZW5ndGgsIChpKSA9PiB7XG4gICAgZGF0YVtpXSA9IHByZnhbaV07XG4gIH0pO1xuICBmb3JFYWNoKGltZywgKHZhbHVlLCBpKSA9PiB7XG4gICAgZGF0YVtudW1CeXRlc0luSWZkICsgaV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGEuYnVmZmVyO1xufTtcblxuY29uc3QgY29udmVydFRvVGlkcyA9IChpbnB1dCkgPT4ge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcbiAgICBpZiAoa2V5ICE9PSAnU3RyaXBPZmZzZXRzJykge1xuICAgICAgaWYgKCFuYW1lMmNvZGVba2V5XSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGtleSwgJ25vdCBpbiBuYW1lMmNvZGU6JywgT2JqZWN0LmtleXMobmFtZTJjb2RlKSk7XG4gICAgICB9XG4gICAgICByZXN1bHRbbmFtZTJjb2RlW2tleV1dID0gaW5wdXRba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHRvQXJyYXkgPSAoaW5wdXQpID0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG4gIHJldHVybiBbaW5wdXRdO1xufTtcblxuY29uc3QgbWV0YWRhdGFEZWZhdWx0cyA9IFtcbiAgWydDb21wcmVzc2lvbicsIDFdLCAvLyBubyBjb21wcmVzc2lvblxuICBbJ1BsYW5hckNvbmZpZ3VyYXRpb24nLCAxXSxcbiAgWydFeHRyYVNhbXBsZXMnLCAwXSxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUdlb3RpZmYoZGF0YSwgbWV0YWRhdGEpIHtcbiAgY29uc3QgaXNGbGF0dGVuZWQgPSB0eXBlb2YgZGF0YVswXSA9PT0gJ251bWJlcic7XG5cbiAgbGV0IGhlaWdodDtcbiAgbGV0IG51bUJhbmRzO1xuICBsZXQgd2lkdGg7XG4gIGxldCBmbGF0dGVuZWRWYWx1ZXM7XG5cbiAgaWYgKGlzRmxhdHRlbmVkKSB7XG4gICAgaGVpZ2h0ID0gbWV0YWRhdGEuaGVpZ2h0IHx8IG1ldGFkYXRhLkltYWdlTGVuZ3RoO1xuICAgIHdpZHRoID0gbWV0YWRhdGEud2lkdGggfHwgbWV0YWRhdGEuSW1hZ2VXaWR0aDtcbiAgICBudW1CYW5kcyA9IGRhdGEubGVuZ3RoIC8gKGhlaWdodCAqIHdpZHRoKTtcbiAgICBmbGF0dGVuZWRWYWx1ZXMgPSBkYXRhO1xuICB9IGVsc2Uge1xuICAgIG51bUJhbmRzID0gZGF0YS5sZW5ndGg7XG4gICAgaGVpZ2h0ID0gZGF0YVswXS5sZW5ndGg7XG4gICAgd2lkdGggPSBkYXRhWzBdWzBdLmxlbmd0aDtcbiAgICBmbGF0dGVuZWRWYWx1ZXMgPSBbXTtcbiAgICB0aW1lcyhoZWlnaHQsIChyb3dJbmRleCkgPT4ge1xuICAgICAgdGltZXMod2lkdGgsIChjb2x1bW5JbmRleCkgPT4ge1xuICAgICAgICB0aW1lcyhudW1CYW5kcywgKGJhbmRJbmRleCkgPT4ge1xuICAgICAgICAgIGZsYXR0ZW5lZFZhbHVlcy5wdXNoKGRhdGFbYmFuZEluZGV4XVtyb3dJbmRleF1bY29sdW1uSW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIG1ldGFkYXRhLkltYWdlTGVuZ3RoID0gaGVpZ2h0O1xuICBkZWxldGUgbWV0YWRhdGEuaGVpZ2h0O1xuICBtZXRhZGF0YS5JbWFnZVdpZHRoID0gd2lkdGg7XG4gIGRlbGV0ZSBtZXRhZGF0YS53aWR0aDtcblxuICAvLyBjb25zdWx0IGh0dHBzOi8vd3d3LmxvYy5nb3YvcHJlc2VydmF0aW9uL2RpZ2l0YWwvZm9ybWF0cy9jb250ZW50L3RpZmZfdGFncy5zaHRtbFxuXG4gIGlmICghbWV0YWRhdGEuQml0c1BlclNhbXBsZSkge1xuICAgIG1ldGFkYXRhLkJpdHNQZXJTYW1wbGUgPSB0aW1lcyhudW1CYW5kcywgKCkgPT4gOCk7XG4gIH1cblxuICBtZXRhZGF0YURlZmF1bHRzLmZvckVhY2goKHRhZykgPT4ge1xuICAgIGNvbnN0IGtleSA9IHRhZ1swXTtcbiAgICBpZiAoIW1ldGFkYXRhW2tleV0pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFnWzFdO1xuICAgICAgbWV0YWRhdGFba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gVGhlIGNvbG9yIHNwYWNlIG9mIHRoZSBpbWFnZSBkYXRhLlxuICAvLyAxPWJsYWNrIGlzIHplcm8gYW5kIDI9UkdCLlxuICBpZiAoIW1ldGFkYXRhLlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24pIHtcbiAgICBtZXRhZGF0YS5QaG90b21ldHJpY0ludGVycHJldGF0aW9uID0gbWV0YWRhdGEuQml0c1BlclNhbXBsZS5sZW5ndGggPT09IDMgPyAyIDogMTtcbiAgfVxuXG4gIC8vIFRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBwZXIgcGl4ZWwuXG4gIGlmICghbWV0YWRhdGEuU2FtcGxlc1BlclBpeGVsKSB7XG4gICAgbWV0YWRhdGEuU2FtcGxlc1BlclBpeGVsID0gW251bUJhbmRzXTtcbiAgfVxuXG4gIGlmICghbWV0YWRhdGEuU3RyaXBCeXRlQ291bnRzKSB7XG4gICAgLy8gd2UgYXJlIG9ubHkgd3JpdGluZyBvbmUgc3RyaXBcbiAgICBtZXRhZGF0YS5TdHJpcEJ5dGVDb3VudHMgPSBbbnVtQmFuZHMgKiBoZWlnaHQgKiB3aWR0aF07XG4gIH1cblxuICBpZiAoIW1ldGFkYXRhLk1vZGVsUGl4ZWxTY2FsZSkge1xuICAgIC8vIGFzc3VtZXMgcmFzdGVyIHRha2VzIHVwIGV4YWN0bHkgdGhlIHdob2xlIGdsb2JlXG4gICAgbWV0YWRhdGEuTW9kZWxQaXhlbFNjYWxlID0gWzM2MCAvIHdpZHRoLCAxODAgLyBoZWlnaHQsIDBdO1xuICB9XG5cbiAgaWYgKCFtZXRhZGF0YS5TYW1wbGVGb3JtYXQpIHtcbiAgICBtZXRhZGF0YS5TYW1wbGVGb3JtYXQgPSB0aW1lcyhudW1CYW5kcywgKCkgPT4gMSk7XG4gIH1cblxuICAvLyBpZiBkaWRuJ3QgcGFzcyBpbiBwcm9qZWN0aW9uIGluZm9ybWF0aW9uLCBhc3N1bWUgdGhlIHBvcHVsYXIgNDMyNiBcImdlb2dyYXBoaWMgcHJvamVjdGlvblwiXG4gIGlmICghbWV0YWRhdGEuaGFzT3duUHJvcGVydHkoJ0dlb2dyYXBoaWNUeXBlR2VvS2V5JykgJiYgIW1ldGFkYXRhLmhhc093blByb3BlcnR5KCdQcm9qZWN0ZWRDU1R5cGVHZW9LZXknKSkge1xuICAgIG1ldGFkYXRhLkdlb2dyYXBoaWNUeXBlR2VvS2V5ID0gNDMyNjtcbiAgICBtZXRhZGF0YS5Nb2RlbFRpZXBvaW50ID0gWzAsIDAsIDAsIC0xODAsIDkwLCAwXTsgLy8gcmFzdGVyIGZpdHMgd2hvbGUgZ2xvYmVcbiAgICBtZXRhZGF0YS5HZW9nQ2l0YXRpb25HZW9LZXkgPSAnV0dTIDg0JztcbiAgICBtZXRhZGF0YS5HVE1vZGVsVHlwZUdlb0tleSA9IDI7XG4gIH1cblxuICBjb25zdCBnZW9LZXlzID0gT2JqZWN0LmtleXMobWV0YWRhdGEpXG4gICAgLmZpbHRlcigoa2V5KSA9PiBlbmRzV2l0aChrZXksICdHZW9LZXknKSlcbiAgICAuc29ydCgoYSwgYikgPT4gbmFtZTJjb2RlW2FdIC0gbmFtZTJjb2RlW2JdKTtcblxuICBpZiAoIW1ldGFkYXRhLkdlb0FzY2lpUGFyYW1zKSB7XG4gICAgbGV0IGdlb0FzY2lpUGFyYW1zID0gJyc7XG4gICAgZ2VvS2V5cy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gTnVtYmVyKG5hbWUyY29kZVtuYW1lXSk7XG4gICAgICBjb25zdCB0YWdUeXBlID0gZmllbGRUYWdUeXBlc1tjb2RlXTtcbiAgICAgIGlmICh0YWdUeXBlID09PSAnQVNDSUknKSB7XG4gICAgICAgIGdlb0FzY2lpUGFyYW1zICs9IGAke21ldGFkYXRhW25hbWVdLnRvU3RyaW5nKCl9XFx1MDAwMGA7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGdlb0FzY2lpUGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICAgIG1ldGFkYXRhLkdlb0FzY2lpUGFyYW1zID0gZ2VvQXNjaWlQYXJhbXM7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFtZXRhZGF0YS5HZW9LZXlEaXJlY3RvcnkpIHtcbiAgICBjb25zdCBOdW1iZXJPZktleXMgPSBnZW9LZXlzLmxlbmd0aDtcblxuICAgIGNvbnN0IEdlb0tleURpcmVjdG9yeSA9IFsxLCAxLCAwLCBOdW1iZXJPZktleXNdO1xuICAgIGdlb0tleXMuZm9yRWFjaCgoZ2VvS2V5KSA9PiB7XG4gICAgICBjb25zdCBLZXlJRCA9IE51bWJlcihuYW1lMmNvZGVbZ2VvS2V5XSk7XG4gICAgICBHZW9LZXlEaXJlY3RvcnkucHVzaChLZXlJRCk7XG5cbiAgICAgIGxldCBDb3VudDtcbiAgICAgIGxldCBUSUZGVGFnTG9jYXRpb247XG4gICAgICBsZXQgdmFsdWVPZmZzZXQ7XG4gICAgICBpZiAoZmllbGRUYWdUeXBlc1tLZXlJRF0gPT09ICdTSE9SVCcpIHtcbiAgICAgICAgQ291bnQgPSAxO1xuICAgICAgICBUSUZGVGFnTG9jYXRpb24gPSAwO1xuICAgICAgICB2YWx1ZU9mZnNldCA9IG1ldGFkYXRhW2dlb0tleV07XG4gICAgICB9IGVsc2UgaWYgKGdlb0tleSA9PT0gJ0dlb2dDaXRhdGlvbkdlb0tleScpIHtcbiAgICAgICAgQ291bnQgPSBtZXRhZGF0YS5HZW9Bc2NpaVBhcmFtcy5sZW5ndGg7XG4gICAgICAgIFRJRkZUYWdMb2NhdGlvbiA9IE51bWJlcihuYW1lMmNvZGUuR2VvQXNjaWlQYXJhbXMpO1xuICAgICAgICB2YWx1ZU9mZnNldCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgW2dlb3RpZmYuanNdIGNvdWxkbid0IGdldCBUSUZGVGFnTG9jYXRpb24gZm9yICR7Z2VvS2V5fWApO1xuICAgICAgfVxuICAgICAgR2VvS2V5RGlyZWN0b3J5LnB1c2goVElGRlRhZ0xvY2F0aW9uKTtcbiAgICAgIEdlb0tleURpcmVjdG9yeS5wdXNoKENvdW50KTtcbiAgICAgIEdlb0tleURpcmVjdG9yeS5wdXNoKHZhbHVlT2Zmc2V0KTtcbiAgICB9KTtcbiAgICBtZXRhZGF0YS5HZW9LZXlEaXJlY3RvcnkgPSBHZW9LZXlEaXJlY3Rvcnk7XG4gIH1cblxuICAvLyBkZWxldGUgR2VvS2V5cyBmcm9tIG1ldGFkYXRhLCBiZWNhdXNlIHN0b3JlZCBpbiBHZW9LZXlEaXJlY3RvcnkgdGFnXG4gIGZvciAoY29uc3QgZ2VvS2V5IGluIGdlb0tleXMpIHtcbiAgICBpZiAoZ2VvS2V5cy5oYXNPd25Qcm9wZXJ0eShnZW9LZXkpKSB7XG4gICAgICBkZWxldGUgbWV0YWRhdGFbZ2VvS2V5XTtcbiAgICB9XG4gIH1cblxuICBbXG4gICAgJ0NvbXByZXNzaW9uJyxcbiAgICAnRXh0cmFTYW1wbGVzJyxcbiAgICAnR2VvZ3JhcGhpY1R5cGVHZW9LZXknLFxuICAgICdHVE1vZGVsVHlwZUdlb0tleScsXG4gICAgJ0dUUmFzdGVyVHlwZUdlb0tleScsXG4gICAgJ0ltYWdlTGVuZ3RoJywgLy8gc3lub255bSBvZiBJbWFnZUhlaWdodFxuICAgICdJbWFnZVdpZHRoJyxcbiAgICAnT3JpZW50YXRpb24nLFxuICAgICdQaG90b21ldHJpY0ludGVycHJldGF0aW9uJyxcbiAgICAnUHJvamVjdGVkQ1NUeXBlR2VvS2V5JyxcbiAgICAnUGxhbmFyQ29uZmlndXJhdGlvbicsXG4gICAgJ1Jlc29sdXRpb25Vbml0JyxcbiAgICAnU2FtcGxlc1BlclBpeGVsJyxcbiAgICAnWFBvc2l0aW9uJyxcbiAgICAnWVBvc2l0aW9uJyxcbiAgXS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaWYgKG1ldGFkYXRhW25hbWVdKSB7XG4gICAgICBtZXRhZGF0YVtuYW1lXSA9IHRvQXJyYXkobWV0YWRhdGFbbmFtZV0pO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgZW5jb2RlZE1ldGFkYXRhID0gY29udmVydFRvVGlkcyhtZXRhZGF0YSk7XG5cbiAgY29uc3Qgb3V0cHV0SW1hZ2UgPSBlbmNvZGVJbWFnZShmbGF0dGVuZWRWYWx1ZXMsIHdpZHRoLCBoZWlnaHQsIGVuY29kZWRNZXRhZGF0YSk7XG5cbiAgcmV0dXJuIG91dHB1dEltYWdlO1xufVxuIiwiZXhwb3J0IGNvbnN0IGZpZWxkVGFnTmFtZXMgPSB7XG4gIC8vIFRJRkYgQmFzZWxpbmVcbiAgMHgwMTNCOiAnQXJ0aXN0JyxcbiAgMHgwMTAyOiAnQml0c1BlclNhbXBsZScsXG4gIDB4MDEwOTogJ0NlbGxMZW5ndGgnLFxuICAweDAxMDg6ICdDZWxsV2lkdGgnLFxuICAweDAxNDA6ICdDb2xvck1hcCcsXG4gIDB4MDEwMzogJ0NvbXByZXNzaW9uJyxcbiAgMHg4Mjk4OiAnQ29weXJpZ2h0JyxcbiAgMHgwMTMyOiAnRGF0ZVRpbWUnLFxuICAweDAxNTI6ICdFeHRyYVNhbXBsZXMnLFxuICAweDAxMEE6ICdGaWxsT3JkZXInLFxuICAweDAxMjE6ICdGcmVlQnl0ZUNvdW50cycsXG4gIDB4MDEyMDogJ0ZyZWVPZmZzZXRzJyxcbiAgMHgwMTIzOiAnR3JheVJlc3BvbnNlQ3VydmUnLFxuICAweDAxMjI6ICdHcmF5UmVzcG9uc2VVbml0JyxcbiAgMHgwMTNDOiAnSG9zdENvbXB1dGVyJyxcbiAgMHgwMTBFOiAnSW1hZ2VEZXNjcmlwdGlvbicsXG4gIDB4MDEwMTogJ0ltYWdlTGVuZ3RoJyxcbiAgMHgwMTAwOiAnSW1hZ2VXaWR0aCcsXG4gIDB4MDEwRjogJ01ha2UnLFxuICAweDAxMTk6ICdNYXhTYW1wbGVWYWx1ZScsXG4gIDB4MDExODogJ01pblNhbXBsZVZhbHVlJyxcbiAgMHgwMTEwOiAnTW9kZWwnLFxuICAweDAwRkU6ICdOZXdTdWJmaWxlVHlwZScsXG4gIDB4MDExMjogJ09yaWVudGF0aW9uJyxcbiAgMHgwMTA2OiAnUGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbicsXG4gIDB4MDExQzogJ1BsYW5hckNvbmZpZ3VyYXRpb24nLFxuICAweDAxMjg6ICdSZXNvbHV0aW9uVW5pdCcsXG4gIDB4MDExNjogJ1Jvd3NQZXJTdHJpcCcsXG4gIDB4MDExNTogJ1NhbXBsZXNQZXJQaXhlbCcsXG4gIDB4MDEzMTogJ1NvZnR3YXJlJyxcbiAgMHgwMTE3OiAnU3RyaXBCeXRlQ291bnRzJyxcbiAgMHgwMTExOiAnU3RyaXBPZmZzZXRzJyxcbiAgMHgwMEZGOiAnU3ViZmlsZVR5cGUnLFxuICAweDAxMDc6ICdUaHJlc2hob2xkaW5nJyxcbiAgMHgwMTFBOiAnWFJlc29sdXRpb24nLFxuICAweDAxMUI6ICdZUmVzb2x1dGlvbicsXG5cbiAgLy8gVElGRiBFeHRlbmRlZFxuICAweDAxNDY6ICdCYWRGYXhMaW5lcycsXG4gIDB4MDE0NzogJ0NsZWFuRmF4RGF0YScsXG4gIDB4MDE1NzogJ0NsaXBQYXRoJyxcbiAgMHgwMTQ4OiAnQ29uc2VjdXRpdmVCYWRGYXhMaW5lcycsXG4gIDB4MDFCMTogJ0RlY29kZScsXG4gIDB4MDFCMjogJ0RlZmF1bHRJbWFnZUNvbG9yJyxcbiAgMHgwMTBEOiAnRG9jdW1lbnROYW1lJyxcbiAgMHgwMTUwOiAnRG90UmFuZ2UnLFxuICAweDAxNDE6ICdIYWxmdG9uZUhpbnRzJyxcbiAgMHgwMTVBOiAnSW5kZXhlZCcsXG4gIDB4MDE1QjogJ0pQRUdUYWJsZXMnLFxuICAweDAxMUQ6ICdQYWdlTmFtZScsXG4gIDB4MDEyOTogJ1BhZ2VOdW1iZXInLFxuICAweDAxM0Q6ICdQcmVkaWN0b3InLFxuICAweDAxM0Y6ICdQcmltYXJ5Q2hyb21hdGljaXRpZXMnLFxuICAweDAyMTQ6ICdSZWZlcmVuY2VCbGFja1doaXRlJyxcbiAgMHgwMTUzOiAnU2FtcGxlRm9ybWF0JyxcbiAgMHgwMTU0OiAnU01pblNhbXBsZVZhbHVlJyxcbiAgMHgwMTU1OiAnU01heFNhbXBsZVZhbHVlJyxcbiAgMHgwMjJGOiAnU3RyaXBSb3dDb3VudHMnLFxuICAweDAxNEE6ICdTdWJJRkRzJyxcbiAgMHgwMTI0OiAnVDRPcHRpb25zJyxcbiAgMHgwMTI1OiAnVDZPcHRpb25zJyxcbiAgMHgwMTQ1OiAnVGlsZUJ5dGVDb3VudHMnLFxuICAweDAxNDM6ICdUaWxlTGVuZ3RoJyxcbiAgMHgwMTQ0OiAnVGlsZU9mZnNldHMnLFxuICAweDAxNDI6ICdUaWxlV2lkdGgnLFxuICAweDAxMkQ6ICdUcmFuc2ZlckZ1bmN0aW9uJyxcbiAgMHgwMTNFOiAnV2hpdGVQb2ludCcsXG4gIDB4MDE1ODogJ1hDbGlwUGF0aFVuaXRzJyxcbiAgMHgwMTFFOiAnWFBvc2l0aW9uJyxcbiAgMHgwMjExOiAnWUNiQ3JDb2VmZmljaWVudHMnLFxuICAweDAyMTM6ICdZQ2JDclBvc2l0aW9uaW5nJyxcbiAgMHgwMjEyOiAnWUNiQ3JTdWJTYW1wbGluZycsXG4gIDB4MDE1OTogJ1lDbGlwUGF0aFVuaXRzJyxcbiAgMHgwMTFGOiAnWVBvc2l0aW9uJyxcblxuICAvLyBFWElGXG4gIDB4OTIwMjogJ0FwZXJ0dXJlVmFsdWUnLFxuICAweEEwMDE6ICdDb2xvclNwYWNlJyxcbiAgMHg5MDA0OiAnRGF0ZVRpbWVEaWdpdGl6ZWQnLFxuICAweDkwMDM6ICdEYXRlVGltZU9yaWdpbmFsJyxcbiAgMHg4NzY5OiAnRXhpZiBJRkQnLFxuICAweDkwMDA6ICdFeGlmVmVyc2lvbicsXG4gIDB4ODI5QTogJ0V4cG9zdXJlVGltZScsXG4gIDB4QTMwMDogJ0ZpbGVTb3VyY2UnLFxuICAweDkyMDk6ICdGbGFzaCcsXG4gIDB4QTAwMDogJ0ZsYXNocGl4VmVyc2lvbicsXG4gIDB4ODI5RDogJ0ZOdW1iZXInLFxuICAweEE0MjA6ICdJbWFnZVVuaXF1ZUlEJyxcbiAgMHg5MjA4OiAnTGlnaHRTb3VyY2UnLFxuICAweDkyN0M6ICdNYWtlck5vdGUnLFxuICAweDkyMDE6ICdTaHV0dGVyU3BlZWRWYWx1ZScsXG4gIDB4OTI4NjogJ1VzZXJDb21tZW50JyxcblxuICAvLyBJUFRDXG4gIDB4ODNCQjogJ0lQVEMnLFxuXG4gIC8vIElDQ1xuICAweDg3NzM6ICdJQ0MgUHJvZmlsZScsXG5cbiAgLy8gWE1QXG4gIDB4MDJCQzogJ1hNUCcsXG5cbiAgLy8gR0RBTFxuICAweEE0ODA6ICdHREFMX01FVEFEQVRBJyxcbiAgMHhBNDgxOiAnR0RBTF9OT0RBVEEnLFxuXG4gIC8vIFBob3Rvc2hvcFxuICAweDg2NDk6ICdQaG90b3Nob3AnLFxuXG4gIC8vIEdlb1RpZmZcbiAgMHg4MzBFOiAnTW9kZWxQaXhlbFNjYWxlJyxcbiAgMHg4NDgyOiAnTW9kZWxUaWVwb2ludCcsXG4gIDB4ODVEODogJ01vZGVsVHJhbnNmb3JtYXRpb24nLFxuICAweDg3QUY6ICdHZW9LZXlEaXJlY3RvcnknLFxuICAweDg3QjA6ICdHZW9Eb3VibGVQYXJhbXMnLFxuICAweDg3QjE6ICdHZW9Bc2NpaVBhcmFtcycsXG5cbiAgLy8gTEVSQ1xuICAweEM1RjI6ICdMZXJjUGFyYW1ldGVycycsXG59O1xuXG5leHBvcnQgY29uc3QgZmllbGRUYWdzID0ge307XG5mb3IgKGNvbnN0IGtleSBpbiBmaWVsZFRhZ05hbWVzKSB7XG4gIGlmIChmaWVsZFRhZ05hbWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICBmaWVsZFRhZ3NbZmllbGRUYWdOYW1lc1trZXldXSA9IHBhcnNlSW50KGtleSwgMTApO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBmaWVsZFRhZ1R5cGVzID0ge1xuICAyNTY6ICdTSE9SVCcsXG4gIDI1NzogJ1NIT1JUJyxcbiAgMjU4OiAnU0hPUlQnLFxuICAyNTk6ICdTSE9SVCcsXG4gIDI2MjogJ1NIT1JUJyxcbiAgMjczOiAnTE9ORycsXG4gIDI3NDogJ1NIT1JUJyxcbiAgMjc3OiAnU0hPUlQnLFxuICAyNzg6ICdMT05HJyxcbiAgMjc5OiAnTE9ORycsXG4gIDI4MjogJ1JBVElPTkFMJyxcbiAgMjgzOiAnUkFUSU9OQUwnLFxuICAyODQ6ICdTSE9SVCcsXG4gIDI4NjogJ1NIT1JUJyxcbiAgMjg3OiAnUkFUSU9OQUwnLFxuICAyOTY6ICdTSE9SVCcsXG4gIDI5NzogJ1NIT1JUJyxcbiAgMzA1OiAnQVNDSUknLFxuICAzMDY6ICdBU0NJSScsXG4gIDMzODogJ1NIT1JUJyxcbiAgMzM5OiAnU0hPUlQnLFxuICA1MTM6ICdMT05HJyxcbiAgNTE0OiAnTE9ORycsXG4gIDEwMjQ6ICdTSE9SVCcsXG4gIDEwMjU6ICdTSE9SVCcsXG4gIDIwNDg6ICdTSE9SVCcsXG4gIDIwNDk6ICdBU0NJSScsXG4gIDMwNzI6ICdTSE9SVCcsXG4gIDMwNzM6ICdBU0NJSScsXG4gIDMzNTUwOiAnRE9VQkxFJyxcbiAgMzM5MjI6ICdET1VCTEUnLFxuICAzNDY2NTogJ0xPTkcnLFxuICAzNDczNTogJ1NIT1JUJyxcbiAgMzQ3Mzc6ICdBU0NJSScsXG4gIDQyMTEzOiAnQVNDSUknLFxufTtcblxuZXhwb3J0IGNvbnN0IGFycmF5RmllbGRzID0gW1xuICBmaWVsZFRhZ3MuQml0c1BlclNhbXBsZSxcbiAgZmllbGRUYWdzLkV4dHJhU2FtcGxlcyxcbiAgZmllbGRUYWdzLlNhbXBsZUZvcm1hdCxcbiAgZmllbGRUYWdzLlN0cmlwQnl0ZUNvdW50cyxcbiAgZmllbGRUYWdzLlN0cmlwT2Zmc2V0cyxcbiAgZmllbGRUYWdzLlN0cmlwUm93Q291bnRzLFxuICBmaWVsZFRhZ3MuVGlsZUJ5dGVDb3VudHMsXG4gIGZpZWxkVGFncy5UaWxlT2Zmc2V0cyxcbiAgZmllbGRUYWdzLlN1YklGRHMsXG5dO1xuXG5leHBvcnQgY29uc3QgZmllbGRUeXBlTmFtZXMgPSB7XG4gIDB4MDAwMTogJ0JZVEUnLFxuICAweDAwMDI6ICdBU0NJSScsXG4gIDB4MDAwMzogJ1NIT1JUJyxcbiAgMHgwMDA0OiAnTE9ORycsXG4gIDB4MDAwNTogJ1JBVElPTkFMJyxcbiAgMHgwMDA2OiAnU0JZVEUnLFxuICAweDAwMDc6ICdVTkRFRklORUQnLFxuICAweDAwMDg6ICdTU0hPUlQnLFxuICAweDAwMDk6ICdTTE9ORycsXG4gIDB4MDAwQTogJ1NSQVRJT05BTCcsXG4gIDB4MDAwQjogJ0ZMT0FUJyxcbiAgMHgwMDBDOiAnRE9VQkxFJyxcbiAgLy8gSUZEIG9mZnNldCwgc3VnZ2VzdGVkIGJ5IGh0dHBzOi8vb3dsLnBoeS5xdWVlbnN1LmNhL35waGlsL2V4aWZ0b29sL3N0YW5kYXJkcy5odG1sXG4gIDB4MDAwRDogJ0lGRCcsXG4gIC8vIGludHJvZHVjZWQgYnkgQmlnVElGRlxuICAweDAwMTA6ICdMT05HOCcsXG4gIDB4MDAxMTogJ1NMT05HOCcsXG4gIDB4MDAxMjogJ0lGRDgnLFxufTtcblxuZXhwb3J0IGNvbnN0IGZpZWxkVHlwZXMgPSB7fTtcbmZvciAoY29uc3Qga2V5IGluIGZpZWxkVHlwZU5hbWVzKSB7XG4gIGlmIChmaWVsZFR5cGVOYW1lcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgZmllbGRUeXBlc1tmaWVsZFR5cGVOYW1lc1trZXldXSA9IHBhcnNlSW50KGtleSwgMTApO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBwaG90b21ldHJpY0ludGVycHJldGF0aW9ucyA9IHtcbiAgV2hpdGVJc1plcm86IDAsXG4gIEJsYWNrSXNaZXJvOiAxLFxuICBSR0I6IDIsXG4gIFBhbGV0dGU6IDMsXG4gIFRyYW5zcGFyZW5jeU1hc2s6IDQsXG4gIENNWUs6IDUsXG4gIFlDYkNyOiA2LFxuXG4gIENJRUxhYjogOCxcbiAgSUNDTGFiOiA5LFxufTtcblxuZXhwb3J0IGNvbnN0IEV4dHJhU2FtcGxlc1ZhbHVlcyA9IHtcbiAgVW5zcGVjaWZpZWQ6IDAsXG4gIEFzc29jYWxwaGE6IDEsXG4gIFVuYXNzYWxwaGE6IDIsXG59O1xuXG5leHBvcnQgY29uc3QgTGVyY1BhcmFtZXRlcnMgPSB7XG4gIFZlcnNpb246IDAsXG4gIEFkZENvbXByZXNzaW9uOiAxLFxufTtcblxuZXhwb3J0IGNvbnN0IExlcmNBZGRDb21wcmVzc2lvbiA9IHtcbiAgTm9uZTogMCxcbiAgRGVmbGF0ZTogMSxcbn07XG5cbmV4cG9ydCBjb25zdCBnZW9LZXlOYW1lcyA9IHtcbiAgMTAyNDogJ0dUTW9kZWxUeXBlR2VvS2V5JyxcbiAgMTAyNTogJ0dUUmFzdGVyVHlwZUdlb0tleScsXG4gIDEwMjY6ICdHVENpdGF0aW9uR2VvS2V5JyxcbiAgMjA0ODogJ0dlb2dyYXBoaWNUeXBlR2VvS2V5JyxcbiAgMjA0OTogJ0dlb2dDaXRhdGlvbkdlb0tleScsXG4gIDIwNTA6ICdHZW9nR2VvZGV0aWNEYXR1bUdlb0tleScsXG4gIDIwNTE6ICdHZW9nUHJpbWVNZXJpZGlhbkdlb0tleScsXG4gIDIwNTI6ICdHZW9nTGluZWFyVW5pdHNHZW9LZXknLFxuICAyMDUzOiAnR2VvZ0xpbmVhclVuaXRTaXplR2VvS2V5JyxcbiAgMjA1NDogJ0dlb2dBbmd1bGFyVW5pdHNHZW9LZXknLFxuICAyMDU1OiAnR2VvZ0FuZ3VsYXJVbml0U2l6ZUdlb0tleScsXG4gIDIwNTY6ICdHZW9nRWxsaXBzb2lkR2VvS2V5JyxcbiAgMjA1NzogJ0dlb2dTZW1pTWFqb3JBeGlzR2VvS2V5JyxcbiAgMjA1ODogJ0dlb2dTZW1pTWlub3JBeGlzR2VvS2V5JyxcbiAgMjA1OTogJ0dlb2dJbnZGbGF0dGVuaW5nR2VvS2V5JyxcbiAgMjA2MDogJ0dlb2dBemltdXRoVW5pdHNHZW9LZXknLFxuICAyMDYxOiAnR2VvZ1ByaW1lTWVyaWRpYW5Mb25nR2VvS2V5JyxcbiAgMjA2MjogJ0dlb2dUT1dHUzg0R2VvS2V5JyxcbiAgMzA3MjogJ1Byb2plY3RlZENTVHlwZUdlb0tleScsXG4gIDMwNzM6ICdQQ1NDaXRhdGlvbkdlb0tleScsXG4gIDMwNzQ6ICdQcm9qZWN0aW9uR2VvS2V5JyxcbiAgMzA3NTogJ1Byb2pDb29yZFRyYW5zR2VvS2V5JyxcbiAgMzA3NjogJ1Byb2pMaW5lYXJVbml0c0dlb0tleScsXG4gIDMwNzc6ICdQcm9qTGluZWFyVW5pdFNpemVHZW9LZXknLFxuICAzMDc4OiAnUHJvalN0ZFBhcmFsbGVsMUdlb0tleScsXG4gIDMwNzk6ICdQcm9qU3RkUGFyYWxsZWwyR2VvS2V5JyxcbiAgMzA4MDogJ1Byb2pOYXRPcmlnaW5Mb25nR2VvS2V5JyxcbiAgMzA4MTogJ1Byb2pOYXRPcmlnaW5MYXRHZW9LZXknLFxuICAzMDgyOiAnUHJvakZhbHNlRWFzdGluZ0dlb0tleScsXG4gIDMwODM6ICdQcm9qRmFsc2VOb3J0aGluZ0dlb0tleScsXG4gIDMwODQ6ICdQcm9qRmFsc2VPcmlnaW5Mb25nR2VvS2V5JyxcbiAgMzA4NTogJ1Byb2pGYWxzZU9yaWdpbkxhdEdlb0tleScsXG4gIDMwODY6ICdQcm9qRmFsc2VPcmlnaW5FYXN0aW5nR2VvS2V5JyxcbiAgMzA4NzogJ1Byb2pGYWxzZU9yaWdpbk5vcnRoaW5nR2VvS2V5JyxcbiAgMzA4ODogJ1Byb2pDZW50ZXJMb25nR2VvS2V5JyxcbiAgMzA4OTogJ1Byb2pDZW50ZXJMYXRHZW9LZXknLFxuICAzMDkwOiAnUHJvakNlbnRlckVhc3RpbmdHZW9LZXknLFxuICAzMDkxOiAnUHJvakNlbnRlck5vcnRoaW5nR2VvS2V5JyxcbiAgMzA5MjogJ1Byb2pTY2FsZUF0TmF0T3JpZ2luR2VvS2V5JyxcbiAgMzA5MzogJ1Byb2pTY2FsZUF0Q2VudGVyR2VvS2V5JyxcbiAgMzA5NDogJ1Byb2pBemltdXRoQW5nbGVHZW9LZXknLFxuICAzMDk1OiAnUHJvalN0cmFpZ2h0VmVydFBvbGVMb25nR2VvS2V5JyxcbiAgMzA5NjogJ1Byb2pSZWN0aWZpZWRHcmlkQW5nbGVHZW9LZXknLFxuICA0MDk2OiAnVmVydGljYWxDU1R5cGVHZW9LZXknLFxuICA0MDk3OiAnVmVydGljYWxDaXRhdGlvbkdlb0tleScsXG4gIDQwOTg6ICdWZXJ0aWNhbERhdHVtR2VvS2V5JyxcbiAgNDA5OTogJ1ZlcnRpY2FsVW5pdHNHZW9LZXknLFxufTtcblxuZXhwb3J0IGNvbnN0IGdlb0tleXMgPSB7fTtcbmZvciAoY29uc3Qga2V5IGluIGdlb0tleU5hbWVzKSB7XG4gIGlmIChnZW9LZXlOYW1lcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgZ2VvS2V5c1tnZW9LZXlOYW1lc1trZXldXSA9IHBhcnNlSW50KGtleSwgMTApO1xuICB9XG59XG4iLCIvKipcbiAqIEEgbm8tb3AgbG9nZ2VyXG4gKi9cbmNsYXNzIER1bW15TG9nZ2VyIHtcbiAgbG9nKCkge31cblxuICBkZWJ1ZygpIHt9XG5cbiAgaW5mbygpIHt9XG5cbiAgd2FybigpIHt9XG5cbiAgZXJyb3IoKSB7fVxuXG4gIHRpbWUoKSB7fVxuXG4gIHRpbWVFbmQoKSB7fVxufVxuXG5sZXQgTE9HR0VSID0gbmV3IER1bW15TG9nZ2VyKCk7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBsb2dnZXIgdGhlIG5ldyBsb2dnZXIuIGUuZyBgY29uc29sZWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldExvZ2dlcihsb2dnZXIgPSBuZXcgRHVtbXlMb2dnZXIoKSkge1xuICBMT0dHRVIgPSBsb2dnZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1ZyguLi5hcmdzKSB7XG4gIHJldHVybiBMT0dHRVIuZGVidWcoLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4uYXJncykge1xuICByZXR1cm4gTE9HR0VSLmxvZyguLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZm8oLi4uYXJncykge1xuICByZXR1cm4gTE9HR0VSLmluZm8oLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIExPR0dFUi53YXJuKC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3IoLi4uYXJncykge1xuICByZXR1cm4gTE9HR0VSLmVycm9yKC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGltZSguLi5hcmdzKSB7XG4gIHJldHVybiBMT0dHRVIudGltZSguLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVFbmQoLi4uYXJncykge1xuICByZXR1cm4gTE9HR0VSLnRpbWVFbmQoLi4uYXJncyk7XG59XG4iLCJpbXBvcnQgeyBnZXREZWNvZGVyIH0gZnJvbSAnLi9jb21wcmVzc2lvbi9pbmRleC5qcyc7XG5cbmNvbnN0IGRlZmF1bHRQb29sU2l6ZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gKG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDIpIDogMjtcblxuLyoqXG4gKiBAbW9kdWxlIHBvb2xcbiAqL1xuXG4vKipcbiAqIFBvb2wgZm9yIHdvcmtlcnMgdG8gZGVjb2RlIGNodW5rcyBvZiB0aGUgaW1hZ2VzLlxuICovXG5jbGFzcyBQb29sIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3NpemVdIFRoZSBzaXplIG9mIHRoZSBwb29sLiBEZWZhdWx0cyB0byB0aGUgbnVtYmVyIG9mIENQVXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlLiBXaGVuIHRoaXMgcGFyYW1ldGVyIGlzIGBudWxsYCBvciAwLCB0aGVuIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICBkZWNvZGluZyB3aWxsIGJlIGRvbmUgaW4gdGhlIG1haW4gdGhyZWFkLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6IFdvcmtlcn0gW2NyZWF0ZVdvcmtlcl0gQSBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgdGhlIGRlY29kZXIgd29ya2VyLlxuICAgKiBEZWZhdWx0cyB0byBhIHdvcmtlciB3aXRoIGFsbCBkZWNvZGVycyB0aGF0IHNoaXAgd2l0aCBnZW90aWZmLmpzLiBUaGUgYGNyZWF0ZVdvcmtlcigpYFxuICAgKiBmdW5jdGlvbiBpcyBleHBlY3RlZCB0byByZXR1cm4gYSBgV29ya2VyYCBjb21wYXRpYmxlIHdpdGggV2ViIFdvcmtlcnMuIEZvciBjb2RlIHRoYXRcbiAgICogcnVucyBpbiBOb2RlLCBbd2ViLXdvcmtlcl0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvd2ViLXdvcmtlcikgaXMgYSBnb29kIGNob2ljZS5cbiAgICpcbiAgICogQSB3b3JrZXIgdGhhdCB1c2VzIGEgY3VzdG9tIGx6dyBkZWNvZGVyIHdvdWxkIGxvb2sgbGlrZSB0aGlzIGBteS1jdXN0b20td29ya2VyLmpzYCBmaWxlOlxuICAgKiBgYGBqc1xuICAgKiBpbXBvcnQgeyBhZGREZWNvZGVyLCBnZXREZWNvZGVyIH0gZnJvbSAnZ2VvdGlmZic7XG4gICAqIGFkZERlY29kZXIoNSwgKCkgPT4gaW1wb3J0ICgnLi9teS1jdXN0b20tbHp3JykudGhlbigobSkgPT4gbS5kZWZhdWx0KSk7XG4gICAqIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGFzeW5jIChlKSA9PiB7XG4gICAqICAgY29uc3QgeyBpZCwgZmlsZURpcmVjdG9yeSwgYnVmZmVyIH0gPSBlLmRhdGE7XG4gICAqICAgY29uc3QgZGVjb2RlciA9IGF3YWl0IGdldERlY29kZXIoZmlsZURpcmVjdG9yeSk7XG4gICAqICAgY29uc3QgZGVjb2RlZCA9IGF3YWl0IGRlY29kZXIuZGVjb2RlKGZpbGVEaXJlY3RvcnksIGJ1ZmZlcik7XG4gICAqICAgc2VsZi5wb3N0TWVzc2FnZSh7IGRlY29kZWQsIGlkIH0sIFtkZWNvZGVkXSk7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICogVGhlIHdheSB0aGUgYWJvdmUgY29kZSBpcyBidWlsdCBpbnRvIGEgd29ya2VyIGJ5IHRoZSBgY3JlYXRlV29ya2VyKClgIGZ1bmN0aW9uXG4gICAqIGRlcGVuZHMgb24gdGhlIHVzZWQgYnVuZGxlci4gRm9yIG1vc3QgYnVuZGxlcnMsIHNvbWV0aGluZyBsaWtlIHRoaXMgd2lsbCB3b3JrOlxuICAgKiBgYGBqc1xuICAgKiBmdW5jdGlvbiBjcmVhdGVXb3JrZXIoKSB7XG4gICAqICAgcmV0dXJuIG5ldyBXb3JrZXIobmV3IFVSTCgnLi9teS1jdXN0b20td29ya2VyLmpzJywgaW1wb3J0Lm1ldGEudXJsKSk7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzaXplID0gZGVmYXVsdFBvb2xTaXplLCBjcmVhdGVXb3JrZXIpIHtcbiAgICB0aGlzLndvcmtlcnMgPSBudWxsO1xuICAgIHRoaXMuX2F3YWl0aW5nRGVjb2RlciA9IG51bGw7XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICB0aGlzLm1lc3NhZ2VJZCA9IDA7XG4gICAgaWYgKHNpemUpIHtcbiAgICAgIHRoaXMuX2F3YWl0aW5nRGVjb2RlciA9IGNyZWF0ZVdvcmtlciA/IFByb21pc2UucmVzb2x2ZShjcmVhdGVXb3JrZXIpIDogbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgaW1wb3J0KCcuL3dvcmtlci9kZWNvZGVyLmpzJykudGhlbigobW9kdWxlKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShtb2R1bGUuY3JlYXRlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2F3YWl0aW5nRGVjb2Rlci50aGVuKChjcmVhdGUpID0+IHtcbiAgICAgICAgdGhpcy5fYXdhaXRpbmdEZWNvZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgdGhpcy53b3JrZXJzLnB1c2goeyB3b3JrZXI6IGNyZWF0ZSgpLCBpZGxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlIHRoZSBnaXZlbiBibG9jayBvZiBieXRlcyB3aXRoIHRoZSBzZXQgY29tcHJlc3Npb24gbWV0aG9kLlxuICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXIgdGhlIGFycmF5IGJ1ZmZlciBvZiBieXRlcyB0byBkZWNvZGUuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5QnVmZmVyPn0gdGhlIGRlY29kZWQgcmVzdWx0IGFzIGEgYFByb21pc2VgXG4gICAqL1xuICBhc3luYyBkZWNvZGUoZmlsZURpcmVjdG9yeSwgYnVmZmVyKSB7XG4gICAgaWYgKHRoaXMuX2F3YWl0aW5nRGVjb2Rlcikge1xuICAgICAgYXdhaXQgdGhpcy5fYXdhaXRpbmdEZWNvZGVyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zaXplID09PSAwXG4gICAgICA/IGdldERlY29kZXIoZmlsZURpcmVjdG9yeSkudGhlbigoZGVjb2RlcikgPT4gZGVjb2Rlci5kZWNvZGUoZmlsZURpcmVjdG9yeSwgYnVmZmVyKSlcbiAgICAgIDogbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmZpbmQoKGNhbmRpZGF0ZSkgPT4gY2FuZGlkYXRlLmlkbGUpXG4gICAgICAgICAgfHwgdGhpcy53b3JrZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuc2l6ZSldO1xuICAgICAgICB3b3JrZXIuaWRsZSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMubWVzc2FnZUlkKys7XG4gICAgICAgIGNvbnN0IG9uTWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgICAgaWYgKGUuZGF0YS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIHdvcmtlci5pZGxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlc29sdmUoZS5kYXRhLmRlY29kZWQpO1xuICAgICAgICAgICAgd29ya2VyLndvcmtlci5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgb25NZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHdvcmtlci53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uTWVzc2FnZSk7XG4gICAgICAgIHdvcmtlci53b3JrZXIucG9zdE1lc3NhZ2UoeyBmaWxlRGlyZWN0b3J5LCBidWZmZXIsIGlkIH0sIFtidWZmZXJdKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy53b3JrZXJzKSB7XG4gICAgICB0aGlzLndvcmtlcnMuZm9yRWFjaCgod29ya2VyKSA9PiB7XG4gICAgICAgIHdvcmtlci53b3JrZXIudGVybWluYXRlKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMud29ya2VycyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBvb2w7XG4iLCJmdW5jdGlvbiBkZWNvZGVSb3dBY2Mocm93LCBzdHJpZGUpIHtcbiAgbGV0IGxlbmd0aCA9IHJvdy5sZW5ndGggLSBzdHJpZGU7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBkbyB7XG4gICAgZm9yIChsZXQgaSA9IHN0cmlkZTsgaSA+IDA7IGktLSkge1xuICAgICAgcm93W29mZnNldCArIHN0cmlkZV0gKz0gcm93W29mZnNldF07XG4gICAgICBvZmZzZXQrKztcbiAgICB9XG5cbiAgICBsZW5ndGggLT0gc3RyaWRlO1xuICB9IHdoaWxlIChsZW5ndGggPiAwKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlUm93RmxvYXRpbmdQb2ludChyb3csIHN0cmlkZSwgYnl0ZXNQZXJTYW1wbGUpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGNvdW50ID0gcm93Lmxlbmd0aDtcbiAgY29uc3Qgd2MgPSBjb3VudCAvIGJ5dGVzUGVyU2FtcGxlO1xuXG4gIHdoaWxlIChjb3VudCA+IHN0cmlkZSkge1xuICAgIGZvciAobGV0IGkgPSBzdHJpZGU7IGkgPiAwOyAtLWkpIHtcbiAgICAgIHJvd1tpbmRleCArIHN0cmlkZV0gKz0gcm93W2luZGV4XTtcbiAgICAgICsraW5kZXg7XG4gICAgfVxuICAgIGNvdW50IC09IHN0cmlkZTtcbiAgfVxuXG4gIGNvbnN0IGNvcHkgPSByb3cuc2xpY2UoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB3YzsgKytpKSB7XG4gICAgZm9yIChsZXQgYiA9IDA7IGIgPCBieXRlc1BlclNhbXBsZTsgKytiKSB7XG4gICAgICByb3dbKGJ5dGVzUGVyU2FtcGxlICogaSkgKyBiXSA9IGNvcHlbKChieXRlc1BlclNhbXBsZSAtIGIgLSAxKSAqIHdjKSArIGldO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQcmVkaWN0b3IoYmxvY2ssIHByZWRpY3Rvciwgd2lkdGgsIGhlaWdodCwgYml0c1BlclNhbXBsZSxcbiAgcGxhbmFyQ29uZmlndXJhdGlvbikge1xuICBpZiAoIXByZWRpY3RvciB8fCBwcmVkaWN0b3IgPT09IDEpIHtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJpdHNQZXJTYW1wbGUubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoYml0c1BlclNhbXBsZVtpXSAlIDggIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignV2hlbiBkZWNvZGluZyB3aXRoIHByZWRpY3Rvciwgb25seSBtdWx0aXBsZSBvZiA4IGJpdHMgYXJlIHN1cHBvcnRlZC4nKTtcbiAgICB9XG4gICAgaWYgKGJpdHNQZXJTYW1wbGVbaV0gIT09IGJpdHNQZXJTYW1wbGVbMF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignV2hlbiBkZWNvZGluZyB3aXRoIHByZWRpY3RvciwgYWxsIHNhbXBsZXMgbXVzdCBoYXZlIHRoZSBzYW1lIHNpemUuJyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYnl0ZXNQZXJTYW1wbGUgPSBiaXRzUGVyU2FtcGxlWzBdIC8gODtcbiAgY29uc3Qgc3RyaWRlID0gcGxhbmFyQ29uZmlndXJhdGlvbiA9PT0gMiA/IDEgOiBiaXRzUGVyU2FtcGxlLmxlbmd0aDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGhlaWdodDsgKytpKSB7XG4gICAgLy8gTGFzdCBzdHJpcCB3aWxsIGJlIHRydW5jYXRlZCBpZiBoZWlnaHQgJSBzdHJpcEhlaWdodCAhPSAwXG4gICAgaWYgKGkgKiBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlID49IGJsb2NrLmJ5dGVMZW5ndGgpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgcm93O1xuICAgIGlmIChwcmVkaWN0b3IgPT09IDIpIHsgLy8gaG9yaXpvbnRhbCBwcmVkaWN0aW9uXG4gICAgICBzd2l0Y2ggKGJpdHNQZXJTYW1wbGVbMF0pIHtcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIHJvdyA9IG5ldyBVaW50OEFycmF5KFxuICAgICAgICAgICAgYmxvY2ssIGkgKiBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlLCBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgcm93ID0gbmV3IFVpbnQxNkFycmF5KFxuICAgICAgICAgICAgYmxvY2ssIGkgKiBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlLCBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlIC8gMixcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgIHJvdyA9IG5ldyBVaW50MzJBcnJheShcbiAgICAgICAgICAgIGJsb2NrLCBpICogc3RyaWRlICogd2lkdGggKiBieXRlc1BlclNhbXBsZSwgc3RyaWRlICogd2lkdGggKiBieXRlc1BlclNhbXBsZSAvIDQsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByZWRpY3RvciAyIG5vdCBhbGxvd2VkIHdpdGggJHtiaXRzUGVyU2FtcGxlWzBdfSBiaXRzIHBlciBzYW1wbGUuYCk7XG4gICAgICB9XG4gICAgICBkZWNvZGVSb3dBY2Mocm93LCBzdHJpZGUsIGJ5dGVzUGVyU2FtcGxlKTtcbiAgICB9IGVsc2UgaWYgKHByZWRpY3RvciA9PT0gMykgeyAvLyBob3Jpem9udGFsIGZsb2F0aW5nIHBvaW50XG4gICAgICByb3cgPSBuZXcgVWludDhBcnJheShcbiAgICAgICAgYmxvY2ssIGkgKiBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlLCBzdHJpZGUgKiB3aWR0aCAqIGJ5dGVzUGVyU2FtcGxlLFxuICAgICAgKTtcbiAgICAgIGRlY29kZVJvd0Zsb2F0aW5nUG9pbnQocm93LCBzdHJpZGUsIGJ5dGVzUGVyU2FtcGxlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJsb2NrO1xufVxuIiwiLyoqXG4gKiBAbW9kdWxlIHJlc2FtcGxlXG4gKi9cblxuZnVuY3Rpb24gY29weU5ld1NpemUoYXJyYXksIHdpZHRoLCBoZWlnaHQsIHNhbXBsZXNQZXJQaXhlbCA9IDEpIHtcbiAgcmV0dXJuIG5ldyAoT2JqZWN0LmdldFByb3RvdHlwZU9mKGFycmF5KS5jb25zdHJ1Y3Rvcikod2lkdGggKiBoZWlnaHQgKiBzYW1wbGVzUGVyUGl4ZWwpO1xufVxuXG4vKipcbiAqIFJlc2FtcGxlIHRoZSBpbnB1dCBhcnJheXMgdXNpbmcgbmVhcmVzdCBuZWlnaGJvciB2YWx1ZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge1R5cGVkQXJyYXlbXX0gdmFsdWVBcnJheXMgVGhlIGlucHV0IGFycmF5cyB0byByZXNhbXBsZVxuICogQHBhcmFtIHtudW1iZXJ9IGluV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBpbnB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gaW5IZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgaW5wdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IG91dFdpZHRoIFRoZSBkZXNpcmVkIHdpZHRoIG9mIHRoZSBvdXRwdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IG91dEhlaWdodCBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIG91dHB1dCByYXN0ZXJzXG4gKiBAcmV0dXJucyB7VHlwZWRBcnJheVtdfSBUaGUgcmVzYW1wbGVkIHJhc3RlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2FtcGxlTmVhcmVzdCh2YWx1ZUFycmF5cywgaW5XaWR0aCwgaW5IZWlnaHQsIG91dFdpZHRoLCBvdXRIZWlnaHQpIHtcbiAgY29uc3QgcmVsWCA9IGluV2lkdGggLyBvdXRXaWR0aDtcbiAgY29uc3QgcmVsWSA9IGluSGVpZ2h0IC8gb3V0SGVpZ2h0O1xuICByZXR1cm4gdmFsdWVBcnJheXMubWFwKChhcnJheSkgPT4ge1xuICAgIGNvbnN0IG5ld0FycmF5ID0gY29weU5ld1NpemUoYXJyYXksIG91dFdpZHRoLCBvdXRIZWlnaHQpO1xuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgb3V0SGVpZ2h0OyArK3kpIHtcbiAgICAgIGNvbnN0IGN5ID0gTWF0aC5taW4oTWF0aC5yb3VuZChyZWxZICogeSksIGluSGVpZ2h0IC0gMSk7XG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IG91dFdpZHRoOyArK3gpIHtcbiAgICAgICAgY29uc3QgY3ggPSBNYXRoLm1pbihNYXRoLnJvdW5kKHJlbFggKiB4KSwgaW5XaWR0aCAtIDEpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGFycmF5WyhjeSAqIGluV2lkdGgpICsgY3hdO1xuICAgICAgICBuZXdBcnJheVsoeSAqIG91dFdpZHRoKSArIHhdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnJheTtcbiAgfSk7XG59XG5cbi8vIHNpbXBsZSBsaW5lYXIgaW50ZXJwb2xhdGlvbiwgY29kZSBmcm9tOlxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZWFyX2ludGVycG9sYXRpb24jUHJvZ3JhbW1pbmdfbGFuZ3VhZ2Vfc3VwcG9ydFxuZnVuY3Rpb24gbGVycCh2MCwgdjEsIHQpIHtcbiAgcmV0dXJuICgoMSAtIHQpICogdjApICsgKHQgKiB2MSk7XG59XG5cbi8qKlxuICogUmVzYW1wbGUgdGhlIGlucHV0IGFycmF5cyB1c2luZyBiaWxpbmVhciBpbnRlcnBvbGF0aW9uLlxuICogQHBhcmFtIHtUeXBlZEFycmF5W119IHZhbHVlQXJyYXlzIFRoZSBpbnB1dCBhcnJheXMgdG8gcmVzYW1wbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgaW5wdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IGluSGVpZ2h0IFRoZSBoZWlnaHQgb2YgdGhlIGlucHV0IHJhc3RlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvdXRXaWR0aCBUaGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgb3V0cHV0IHJhc3RlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvdXRIZWlnaHQgVGhlIGRlc2lyZWQgaGVpZ2h0IG9mIHRoZSBvdXRwdXQgcmFzdGVyc1xuICogQHJldHVybnMge1R5cGVkQXJyYXlbXX0gVGhlIHJlc2FtcGxlZCByYXN0ZXJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNhbXBsZUJpbGluZWFyKHZhbHVlQXJyYXlzLCBpbldpZHRoLCBpbkhlaWdodCwgb3V0V2lkdGgsIG91dEhlaWdodCkge1xuICBjb25zdCByZWxYID0gaW5XaWR0aCAvIG91dFdpZHRoO1xuICBjb25zdCByZWxZID0gaW5IZWlnaHQgLyBvdXRIZWlnaHQ7XG5cbiAgcmV0dXJuIHZhbHVlQXJyYXlzLm1hcCgoYXJyYXkpID0+IHtcbiAgICBjb25zdCBuZXdBcnJheSA9IGNvcHlOZXdTaXplKGFycmF5LCBvdXRXaWR0aCwgb3V0SGVpZ2h0KTtcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG91dEhlaWdodDsgKyt5KSB7XG4gICAgICBjb25zdCByYXdZID0gcmVsWSAqIHk7XG5cbiAgICAgIGNvbnN0IHlsID0gTWF0aC5mbG9vcihyYXdZKTtcbiAgICAgIGNvbnN0IHloID0gTWF0aC5taW4oTWF0aC5jZWlsKHJhd1kpLCAoaW5IZWlnaHQgLSAxKSk7XG5cbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgb3V0V2lkdGg7ICsreCkge1xuICAgICAgICBjb25zdCByYXdYID0gcmVsWCAqIHg7XG4gICAgICAgIGNvbnN0IHR4ID0gcmF3WCAlIDE7XG5cbiAgICAgICAgY29uc3QgeGwgPSBNYXRoLmZsb29yKHJhd1gpO1xuICAgICAgICBjb25zdCB4aCA9IE1hdGgubWluKE1hdGguY2VpbChyYXdYKSwgKGluV2lkdGggLSAxKSk7XG5cbiAgICAgICAgY29uc3QgbGwgPSBhcnJheVsoeWwgKiBpbldpZHRoKSArIHhsXTtcbiAgICAgICAgY29uc3QgaGwgPSBhcnJheVsoeWwgKiBpbldpZHRoKSArIHhoXTtcbiAgICAgICAgY29uc3QgbGggPSBhcnJheVsoeWggKiBpbldpZHRoKSArIHhsXTtcbiAgICAgICAgY29uc3QgaGggPSBhcnJheVsoeWggKiBpbldpZHRoKSArIHhoXTtcblxuICAgICAgICBjb25zdCB2YWx1ZSA9IGxlcnAoXG4gICAgICAgICAgbGVycChsbCwgaGwsIHR4KSxcbiAgICAgICAgICBsZXJwKGxoLCBoaCwgdHgpLFxuICAgICAgICAgIHJhd1kgJSAxLFxuICAgICAgICApO1xuICAgICAgICBuZXdBcnJheVsoeSAqIG91dFdpZHRoKSArIHhdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnJheTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmVzYW1wbGUgdGhlIGlucHV0IGFycmF5cyB1c2luZyB0aGUgc2VsZWN0ZWQgcmVzYW1wbGluZyBtZXRob2QuXG4gKiBAcGFyYW0ge1R5cGVkQXJyYXlbXX0gdmFsdWVBcnJheXMgVGhlIGlucHV0IGFycmF5cyB0byByZXNhbXBsZVxuICogQHBhcmFtIHtudW1iZXJ9IGluV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBpbnB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gaW5IZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgaW5wdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IG91dFdpZHRoIFRoZSBkZXNpcmVkIHdpZHRoIG9mIHRoZSBvdXRwdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IG91dEhlaWdodCBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIG91dHB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge3N0cmluZ30gW21ldGhvZCA9ICduZWFyZXN0J10gVGhlIGRlc2lyZWQgcmVzYW1wbGluZyBtZXRob2RcbiAqIEByZXR1cm5zIHtUeXBlZEFycmF5W119IFRoZSByZXNhbXBsZWQgcmFzdGVyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzYW1wbGUodmFsdWVBcnJheXMsIGluV2lkdGgsIGluSGVpZ2h0LCBvdXRXaWR0aCwgb3V0SGVpZ2h0LCBtZXRob2QgPSAnbmVhcmVzdCcpIHtcbiAgc3dpdGNoIChtZXRob2QudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ25lYXJlc3QnOlxuICAgICAgcmV0dXJuIHJlc2FtcGxlTmVhcmVzdCh2YWx1ZUFycmF5cywgaW5XaWR0aCwgaW5IZWlnaHQsIG91dFdpZHRoLCBvdXRIZWlnaHQpO1xuICAgIGNhc2UgJ2JpbGluZWFyJzpcbiAgICBjYXNlICdsaW5lYXInOlxuICAgICAgcmV0dXJuIHJlc2FtcGxlQmlsaW5lYXIodmFsdWVBcnJheXMsIGluV2lkdGgsIGluSGVpZ2h0LCBvdXRXaWR0aCwgb3V0SGVpZ2h0KTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCByZXNhbXBsaW5nIG1ldGhvZDogJyR7bWV0aG9kfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc2FtcGxlIHRoZSBwaXhlbCBpbnRlcmxlYXZlZCBpbnB1dCBhcnJheSB1c2luZyBuZWFyZXN0IG5laWdoYm9yIHZhbHVlIHNlbGVjdGlvbi5cbiAqIEBwYXJhbSB7VHlwZWRBcnJheX0gdmFsdWVBcnJheXMgVGhlIGlucHV0IGFycmF5cyB0byByZXNhbXBsZVxuICogQHBhcmFtIHtudW1iZXJ9IGluV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBpbnB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gaW5IZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgaW5wdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IG91dFdpZHRoIFRoZSBkZXNpcmVkIHdpZHRoIG9mIHRoZSBvdXRwdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IG91dEhlaWdodCBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIG91dHB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gc2FtcGxlcyBUaGUgbnVtYmVyIG9mIHNhbXBsZXMgcGVyIHBpeGVsIGZvciBwaXhlbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJsZWF2ZWQgZGF0YVxuICogQHJldHVybnMge1R5cGVkQXJyYXl9IFRoZSByZXNhbXBsZWQgcmFzdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNhbXBsZU5lYXJlc3RJbnRlcmxlYXZlZChcbiAgdmFsdWVBcnJheSwgaW5XaWR0aCwgaW5IZWlnaHQsIG91dFdpZHRoLCBvdXRIZWlnaHQsIHNhbXBsZXMpIHtcbiAgY29uc3QgcmVsWCA9IGluV2lkdGggLyBvdXRXaWR0aDtcbiAgY29uc3QgcmVsWSA9IGluSGVpZ2h0IC8gb3V0SGVpZ2h0O1xuXG4gIGNvbnN0IG5ld0FycmF5ID0gY29weU5ld1NpemUodmFsdWVBcnJheSwgb3V0V2lkdGgsIG91dEhlaWdodCwgc2FtcGxlcyk7XG4gIGZvciAobGV0IHkgPSAwOyB5IDwgb3V0SGVpZ2h0OyArK3kpIHtcbiAgICBjb25zdCBjeSA9IE1hdGgubWluKE1hdGgucm91bmQocmVsWSAqIHkpLCBpbkhlaWdodCAtIDEpO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgb3V0V2lkdGg7ICsreCkge1xuICAgICAgY29uc3QgY3ggPSBNYXRoLm1pbihNYXRoLnJvdW5kKHJlbFggKiB4KSwgaW5XaWR0aCAtIDEpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzYW1wbGVzOyArK2kpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB2YWx1ZUFycmF5WyhjeSAqIGluV2lkdGggKiBzYW1wbGVzKSArIChjeCAqIHNhbXBsZXMpICsgaV07XG4gICAgICAgIG5ld0FycmF5Wyh5ICogb3V0V2lkdGggKiBzYW1wbGVzKSArICh4ICogc2FtcGxlcykgKyBpXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3QXJyYXk7XG59XG5cbi8qKlxuICogUmVzYW1wbGUgdGhlIHBpeGVsIGludGVybGVhdmVkIGlucHV0IGFycmF5IHVzaW5nIGJpbGluZWFyIGludGVycG9sYXRpb24uXG4gKiBAcGFyYW0ge1R5cGVkQXJyYXl9IHZhbHVlQXJyYXlzIFRoZSBpbnB1dCBhcnJheXMgdG8gcmVzYW1wbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgaW5wdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IGluSGVpZ2h0IFRoZSBoZWlnaHQgb2YgdGhlIGlucHV0IHJhc3RlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvdXRXaWR0aCBUaGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgb3V0cHV0IHJhc3RlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvdXRIZWlnaHQgVGhlIGRlc2lyZWQgaGVpZ2h0IG9mIHRoZSBvdXRwdXQgcmFzdGVyc1xuICogQHBhcmFtIHtudW1iZXJ9IHNhbXBsZXMgVGhlIG51bWJlciBvZiBzYW1wbGVzIHBlciBwaXhlbCBmb3IgcGl4ZWxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGludGVybGVhdmVkIGRhdGFcbiAqIEByZXR1cm5zIHtUeXBlZEFycmF5fSBUaGUgcmVzYW1wbGVkIHJhc3RlclxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzYW1wbGVCaWxpbmVhckludGVybGVhdmVkKFxuICB2YWx1ZUFycmF5LCBpbldpZHRoLCBpbkhlaWdodCwgb3V0V2lkdGgsIG91dEhlaWdodCwgc2FtcGxlcykge1xuICBjb25zdCByZWxYID0gaW5XaWR0aCAvIG91dFdpZHRoO1xuICBjb25zdCByZWxZID0gaW5IZWlnaHQgLyBvdXRIZWlnaHQ7XG4gIGNvbnN0IG5ld0FycmF5ID0gY29weU5ld1NpemUodmFsdWVBcnJheSwgb3V0V2lkdGgsIG91dEhlaWdodCwgc2FtcGxlcyk7XG4gIGZvciAobGV0IHkgPSAwOyB5IDwgb3V0SGVpZ2h0OyArK3kpIHtcbiAgICBjb25zdCByYXdZID0gcmVsWSAqIHk7XG5cbiAgICBjb25zdCB5bCA9IE1hdGguZmxvb3IocmF3WSk7XG4gICAgY29uc3QgeWggPSBNYXRoLm1pbihNYXRoLmNlaWwocmF3WSksIChpbkhlaWdodCAtIDEpKTtcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgb3V0V2lkdGg7ICsreCkge1xuICAgICAgY29uc3QgcmF3WCA9IHJlbFggKiB4O1xuICAgICAgY29uc3QgdHggPSByYXdYICUgMTtcblxuICAgICAgY29uc3QgeGwgPSBNYXRoLmZsb29yKHJhd1gpO1xuICAgICAgY29uc3QgeGggPSBNYXRoLm1pbihNYXRoLmNlaWwocmF3WCksIChpbldpZHRoIC0gMSkpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNhbXBsZXM7ICsraSkge1xuICAgICAgICBjb25zdCBsbCA9IHZhbHVlQXJyYXlbKHlsICogaW5XaWR0aCAqIHNhbXBsZXMpICsgKHhsICogc2FtcGxlcykgKyBpXTtcbiAgICAgICAgY29uc3QgaGwgPSB2YWx1ZUFycmF5Wyh5bCAqIGluV2lkdGggKiBzYW1wbGVzKSArICh4aCAqIHNhbXBsZXMpICsgaV07XG4gICAgICAgIGNvbnN0IGxoID0gdmFsdWVBcnJheVsoeWggKiBpbldpZHRoICogc2FtcGxlcykgKyAoeGwgKiBzYW1wbGVzKSArIGldO1xuICAgICAgICBjb25zdCBoaCA9IHZhbHVlQXJyYXlbKHloICogaW5XaWR0aCAqIHNhbXBsZXMpICsgKHhoICogc2FtcGxlcykgKyBpXTtcblxuICAgICAgICBjb25zdCB2YWx1ZSA9IGxlcnAoXG4gICAgICAgICAgbGVycChsbCwgaGwsIHR4KSxcbiAgICAgICAgICBsZXJwKGxoLCBoaCwgdHgpLFxuICAgICAgICAgIHJhd1kgJSAxLFxuICAgICAgICApO1xuICAgICAgICBuZXdBcnJheVsoeSAqIG91dFdpZHRoICogc2FtcGxlcykgKyAoeCAqIHNhbXBsZXMpICsgaV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ld0FycmF5O1xufVxuXG4vKipcbiAqIFJlc2FtcGxlIHRoZSBwaXhlbCBpbnRlcmxlYXZlZCBpbnB1dCBhcnJheSB1c2luZyB0aGUgc2VsZWN0ZWQgcmVzYW1wbGluZyBtZXRob2QuXG4gKiBAcGFyYW0ge1R5cGVkQXJyYXl9IHZhbHVlQXJyYXkgVGhlIGlucHV0IGFycmF5IHRvIHJlc2FtcGxlXG4gKiBAcGFyYW0ge251bWJlcn0gaW5XaWR0aCBUaGUgd2lkdGggb2YgdGhlIGlucHV0IHJhc3RlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbkhlaWdodCBUaGUgaGVpZ2h0IG9mIHRoZSBpbnB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gb3V0V2lkdGggVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIG91dHB1dCByYXN0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gb3V0SGVpZ2h0IFRoZSBkZXNpcmVkIGhlaWdodCBvZiB0aGUgb3V0cHV0IHJhc3RlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBzYW1wbGVzIFRoZSBudW1iZXIgb2Ygc2FtcGxlcyBwZXIgcGl4ZWwgZm9yIHBpeGVsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVybGVhdmVkIGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWV0aG9kID0gJ25lYXJlc3QnXSBUaGUgZGVzaXJlZCByZXNhbXBsaW5nIG1ldGhvZFxuICogQHJldHVybnMge1R5cGVkQXJyYXl9IFRoZSByZXNhbXBsZWQgcmFzdGVyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzYW1wbGVJbnRlcmxlYXZlZCh2YWx1ZUFycmF5LCBpbldpZHRoLCBpbkhlaWdodCwgb3V0V2lkdGgsIG91dEhlaWdodCwgc2FtcGxlcywgbWV0aG9kID0gJ25lYXJlc3QnKSB7XG4gIHN3aXRjaCAobWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICduZWFyZXN0JzpcbiAgICAgIHJldHVybiByZXNhbXBsZU5lYXJlc3RJbnRlcmxlYXZlZChcbiAgICAgICAgdmFsdWVBcnJheSwgaW5XaWR0aCwgaW5IZWlnaHQsIG91dFdpZHRoLCBvdXRIZWlnaHQsIHNhbXBsZXMsXG4gICAgICApO1xuICAgIGNhc2UgJ2JpbGluZWFyJzpcbiAgICBjYXNlICdsaW5lYXInOlxuICAgICAgcmV0dXJuIHJlc2FtcGxlQmlsaW5lYXJJbnRlcmxlYXZlZChcbiAgICAgICAgdmFsdWVBcnJheSwgaW5XaWR0aCwgaW5IZWlnaHQsIG91dFdpZHRoLCBvdXRIZWlnaHQsIHNhbXBsZXMsXG4gICAgICApO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHJlc2FtcGxpbmcgbWV0aG9kOiAnJHttZXRob2R9J2ApO1xuICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZnJvbVdoaXRlSXNaZXJvKHJhc3RlciwgbWF4KSB7XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gcmFzdGVyO1xuICBjb25zdCByZ2JSYXN0ZXIgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDMpO1xuICBsZXQgdmFsdWU7XG4gIGZvciAobGV0IGkgPSAwLCBqID0gMDsgaSA8IHJhc3Rlci5sZW5ndGg7ICsraSwgaiArPSAzKSB7XG4gICAgdmFsdWUgPSAyNTYgLSAocmFzdGVyW2ldIC8gbWF4ICogMjU2KTtcbiAgICByZ2JSYXN0ZXJbal0gPSB2YWx1ZTtcbiAgICByZ2JSYXN0ZXJbaiArIDFdID0gdmFsdWU7XG4gICAgcmdiUmFzdGVyW2ogKyAyXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiByZ2JSYXN0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQmxhY2tJc1plcm8ocmFzdGVyLCBtYXgpIHtcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSByYXN0ZXI7XG4gIGNvbnN0IHJnYlJhc3RlciA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogMyk7XG4gIGxldCB2YWx1ZTtcbiAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgcmFzdGVyLmxlbmd0aDsgKytpLCBqICs9IDMpIHtcbiAgICB2YWx1ZSA9IHJhc3RlcltpXSAvIG1heCAqIDI1NjtcbiAgICByZ2JSYXN0ZXJbal0gPSB2YWx1ZTtcbiAgICByZ2JSYXN0ZXJbaiArIDFdID0gdmFsdWU7XG4gICAgcmdiUmFzdGVyW2ogKyAyXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiByZ2JSYXN0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUGFsZXR0ZShyYXN0ZXIsIGNvbG9yTWFwKSB7XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gcmFzdGVyO1xuICBjb25zdCByZ2JSYXN0ZXIgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDMpO1xuICBjb25zdCBncmVlbk9mZnNldCA9IGNvbG9yTWFwLmxlbmd0aCAvIDM7XG4gIGNvbnN0IGJsdWVPZmZzZXQgPSBjb2xvck1hcC5sZW5ndGggLyAzICogMjtcbiAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgcmFzdGVyLmxlbmd0aDsgKytpLCBqICs9IDMpIHtcbiAgICBjb25zdCBtYXBJbmRleCA9IHJhc3RlcltpXTtcbiAgICByZ2JSYXN0ZXJbal0gPSBjb2xvck1hcFttYXBJbmRleF0gLyA2NTUzNiAqIDI1NjtcbiAgICByZ2JSYXN0ZXJbaiArIDFdID0gY29sb3JNYXBbbWFwSW5kZXggKyBncmVlbk9mZnNldF0gLyA2NTUzNiAqIDI1NjtcbiAgICByZ2JSYXN0ZXJbaiArIDJdID0gY29sb3JNYXBbbWFwSW5kZXggKyBibHVlT2Zmc2V0XSAvIDY1NTM2ICogMjU2O1xuICB9XG4gIHJldHVybiByZ2JSYXN0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQ01ZSyhjbXlrUmFzdGVyKSB7XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gY215a1Jhc3RlcjtcbiAgY29uc3QgcmdiUmFzdGVyID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiAzKTtcbiAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgY215a1Jhc3Rlci5sZW5ndGg7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgY29uc3QgYyA9IGNteWtSYXN0ZXJbaV07XG4gICAgY29uc3QgbSA9IGNteWtSYXN0ZXJbaSArIDFdO1xuICAgIGNvbnN0IHkgPSBjbXlrUmFzdGVyW2kgKyAyXTtcbiAgICBjb25zdCBrID0gY215a1Jhc3RlcltpICsgM107XG5cbiAgICByZ2JSYXN0ZXJbal0gPSAyNTUgKiAoKDI1NSAtIGMpIC8gMjU2KSAqICgoMjU1IC0gaykgLyAyNTYpO1xuICAgIHJnYlJhc3RlcltqICsgMV0gPSAyNTUgKiAoKDI1NSAtIG0pIC8gMjU2KSAqICgoMjU1IC0gaykgLyAyNTYpO1xuICAgIHJnYlJhc3RlcltqICsgMl0gPSAyNTUgKiAoKDI1NSAtIHkpIC8gMjU2KSAqICgoMjU1IC0gaykgLyAyNTYpO1xuICB9XG4gIHJldHVybiByZ2JSYXN0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWUNiQ3IoeUNiQ3JSYXN0ZXIpIHtcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB5Q2JDclJhc3RlcjtcbiAgY29uc3QgcmdiUmFzdGVyID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogMyk7XG4gIGZvciAobGV0IGkgPSAwLCBqID0gMDsgaSA8IHlDYkNyUmFzdGVyLmxlbmd0aDsgaSArPSAzLCBqICs9IDMpIHtcbiAgICBjb25zdCB5ID0geUNiQ3JSYXN0ZXJbaV07XG4gICAgY29uc3QgY2IgPSB5Q2JDclJhc3RlcltpICsgMV07XG4gICAgY29uc3QgY3IgPSB5Q2JDclJhc3RlcltpICsgMl07XG5cbiAgICByZ2JSYXN0ZXJbal0gPSAoeSArICgxLjQwMjAwICogKGNyIC0gMHg4MCkpKTtcbiAgICByZ2JSYXN0ZXJbaiArIDFdID0gKHkgLSAoMC4zNDQxNCAqIChjYiAtIDB4ODApKSAtICgwLjcxNDE0ICogKGNyIC0gMHg4MCkpKTtcbiAgICByZ2JSYXN0ZXJbaiArIDJdID0gKHkgKyAoMS43NzIwMCAqIChjYiAtIDB4ODApKSk7XG4gIH1cbiAgcmV0dXJuIHJnYlJhc3Rlcjtcbn1cblxuY29uc3QgWG4gPSAwLjk1MDQ3O1xuY29uc3QgWW4gPSAxLjAwMDAwO1xuY29uc3QgWm4gPSAxLjA4ODgzO1xuXG4vLyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRpbWF0dGVyMTUvcmdiLWxhYi9ibG9iL21hc3Rlci9jb2xvci5qc1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbUNJRUxhYihjaWVMYWJSYXN0ZXIpIHtcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBjaWVMYWJSYXN0ZXI7XG4gIGNvbnN0IHJnYlJhc3RlciA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogMyk7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgY2llTGFiUmFzdGVyLmxlbmd0aDsgaSArPSAzLCBqICs9IDMpIHtcbiAgICBjb25zdCBMID0gY2llTGFiUmFzdGVyW2kgKyAwXTtcbiAgICBjb25zdCBhXyA9IGNpZUxhYlJhc3RlcltpICsgMV0gPDwgMjQgPj4gMjQ7IC8vIGNvbnZlcnNpb24gZnJvbSB1aW50OCB0byBpbnQ4XG4gICAgY29uc3QgYl8gPSBjaWVMYWJSYXN0ZXJbaSArIDJdIDw8IDI0ID4+IDI0OyAvLyBzYW1lXG5cbiAgICBsZXQgeSA9IChMICsgMTYpIC8gMTE2O1xuICAgIGxldCB4ID0gKGFfIC8gNTAwKSArIHk7XG4gICAgbGV0IHogPSB5IC0gKGJfIC8gMjAwKTtcbiAgICBsZXQgcjtcbiAgICBsZXQgZztcbiAgICBsZXQgYjtcblxuICAgIHggPSBYbiAqICgoeCAqIHggKiB4ID4gMC4wMDg4NTYpID8geCAqIHggKiB4IDogKHggLSAoMTYgLyAxMTYpKSAvIDcuNzg3KTtcbiAgICB5ID0gWW4gKiAoKHkgKiB5ICogeSA+IDAuMDA4ODU2KSA/IHkgKiB5ICogeSA6ICh5IC0gKDE2IC8gMTE2KSkgLyA3Ljc4Nyk7XG4gICAgeiA9IFpuICogKCh6ICogeiAqIHogPiAwLjAwODg1NikgPyB6ICogeiAqIHogOiAoeiAtICgxNiAvIDExNikpIC8gNy43ODcpO1xuXG4gICAgciA9ICh4ICogMy4yNDA2KSArICh5ICogLTEuNTM3MikgKyAoeiAqIC0wLjQ5ODYpO1xuICAgIGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuICAgIGIgPSAoeCAqIDAuMDU1NykgKyAoeSAqIC0wLjIwNDApICsgKHogKiAxLjA1NzApO1xuXG4gICAgciA9IChyID4gMC4wMDMxMzA4KSA/ICgoMS4wNTUgKiAociAqKiAoMSAvIDIuNCkpKSAtIDAuMDU1KSA6IDEyLjkyICogcjtcbiAgICBnID0gKGcgPiAwLjAwMzEzMDgpID8gKCgxLjA1NSAqIChnICoqICgxIC8gMi40KSkpIC0gMC4wNTUpIDogMTIuOTIgKiBnO1xuICAgIGIgPSAoYiA+IDAuMDAzMTMwOCkgPyAoKDEuMDU1ICogKGIgKiogKDEgLyAyLjQpKSkgLSAwLjA1NSkgOiAxMi45MiAqIGI7XG5cbiAgICByZ2JSYXN0ZXJbal0gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCByKSkgKiAyNTU7XG4gICAgcmdiUmFzdGVyW2ogKyAxXSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIGcpKSAqIDI1NTtcbiAgICByZ2JSYXN0ZXJbaiArIDJdID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgYikpICogMjU1O1xuICB9XG4gIHJldHVybiByZ2JSYXN0ZXI7XG59XG4iLCJpbXBvcnQgeyBCYXNlU291cmNlIH0gZnJvbSAnLi9iYXNlc291cmNlLmpzJztcbmltcG9ydCB7IEFib3J0RXJyb3IgfSBmcm9tICcuLi91dGlscy5qcyc7XG5cbmNsYXNzIEFycmF5QnVmZmVyU291cmNlIGV4dGVuZHMgQmFzZVNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGFycmF5QnVmZmVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmFycmF5QnVmZmVyID0gYXJyYXlCdWZmZXI7XG4gIH1cblxuICBmZXRjaFNsaWNlKHNsaWNlLCBzaWduYWwpIHtcbiAgICBpZiAoc2lnbmFsICYmIHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICB0aHJvdyBuZXcgQWJvcnRFcnJvcignUmVxdWVzdCBhYm9ydGVkJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFycmF5QnVmZmVyLnNsaWNlKHNsaWNlLm9mZnNldCwgc2xpY2Uub2Zmc2V0ICsgc2xpY2UubGVuZ3RoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUJ1ZmZlclNvdXJjZShhcnJheUJ1ZmZlcikge1xuICByZXR1cm4gbmV3IEFycmF5QnVmZmVyU291cmNlKGFycmF5QnVmZmVyKTtcbn1cbiIsIi8qKlxuICogQHR5cGVkZWYgU2xpY2VcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBvZmZzZXRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsZW5ndGhcbiAqL1xuXG5leHBvcnQgY2xhc3MgQmFzZVNvdXJjZSB7XG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge1NsaWNlW119IHNsaWNlc1xuICAgKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJbXX1cbiAgICovXG4gIGFzeW5jIGZldGNoKHNsaWNlcywgc2lnbmFsID0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgc2xpY2VzLm1hcCgoc2xpY2UpID0+IHRoaXMuZmV0Y2hTbGljZShzbGljZSwgc2lnbmFsKSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge1NsaWNlfSBzbGljZVxuICAgKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJ9XG4gICAqL1xuICBhc3luYyBmZXRjaFNsaWNlKHNsaWNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBmZXRjaGluZyBvZiBzbGljZSAke3NsaWNlfSBub3QgcG9zc2libGUsIG5vdCBpbXBsZW1lbnRlZGApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpbGVzaXplIGlmIGFscmVhZHkgZGV0ZXJtaW5lZCBhbmQgbnVsbCBvdGhlcndpc2VcbiAgICovXG4gIGdldCBmaWxlU2l6ZSgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIGNsb3NlKCkge1xuICAgIC8vIG5vLW9wIGJ5IGRlZmF1bHRcbiAgfVxufVxuIiwiaW1wb3J0IFF1aWNrTFJVIGZyb20gJ3F1aWNrLWxydSc7XG5pbXBvcnQgeyBCYXNlU291cmNlIH0gZnJvbSAnLi9iYXNlc291cmNlLmpzJztcbmltcG9ydCB7IEFib3J0RXJyb3IsIEFnZ3JlZ2F0ZUVycm9yLCB3YWl0LCB6aXAgfSBmcm9tICcuLi91dGlscy5qcyc7XG5cbmNsYXNzIEJsb2NrIHtcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBbZGF0YV1cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9mZnNldCwgbGVuZ3RoLCBkYXRhID0gbnVsbCkge1xuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge251bWJlcn0gdGhlIHRvcCBieXRlIGJvcmRlclxuICAgKi9cbiAgZ2V0IHRvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQgKyB0aGlzLmxlbmd0aDtcbiAgfVxufVxuXG5jbGFzcyBCbG9ja0dyb3VwIHtcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICAgKiBAcGFyYW0ge251bWJlcltdfSBibG9ja0lkc1xuICAgKi9cbiAgY29uc3RydWN0b3Iob2Zmc2V0LCBsZW5ndGgsIGJsb2NrSWRzKSB7XG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgdGhpcy5ibG9ja0lkcyA9IGJsb2NrSWRzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCbG9ja2VkU291cmNlIGV4dGVuZHMgQmFzZVNvdXJjZSB7XG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge0Jhc2VTb3VyY2V9IHNvdXJjZSBUaGUgdW5kZXJseWluZyBzb3VyY2UgdGhhdCBzaGFsbCBiZSBibG9ja2VkIGFuZCBjYWNoZWRcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJsb2NrU2l6ZV1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmNhY2hlU2l6ZV1cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNvdXJjZSwgeyBibG9ja1NpemUgPSA2NTUzNiwgY2FjaGVTaXplID0gMTAwIH0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhpcy5ibG9ja1NpemUgPSBibG9ja1NpemU7XG5cbiAgICB0aGlzLmJsb2NrQ2FjaGUgPSBuZXcgUXVpY2tMUlUoe1xuICAgICAgbWF4U2l6ZTogY2FjaGVTaXplLFxuICAgICAgb25FdmljdGlvbjogKGJsb2NrSWQsIGJsb2NrKSA9PiB7XG4gICAgICAgIHRoaXMuZXZpY3RlZEJsb2Nrcy5zZXQoYmxvY2tJZCwgYmxvY2spO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8qKiBAdHlwZSB7TWFwPG51bWJlciwgQmxvY2s+fSAqL1xuICAgIHRoaXMuZXZpY3RlZEJsb2NrcyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIG1hcHBpbmcgYmxvY2tJZCAtPiBCbG9jayBpbnN0YW5jZVxuICAgIHRoaXMuYmxvY2tSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIHNldCBvZiBibG9ja0lkcyBtaXNzaW5nIGZvciB0aGUgY3VycmVudCByZXF1ZXN0c1xuICAgIHRoaXMuYmxvY2tJZHNUb0ZldGNoID0gbmV3IFNldCgpO1xuXG4gICAgdGhpcy5hYm9ydGVkQmxvY2tJZHMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBnZXQgZmlsZVNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLmZpbGVTaXplO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7aW1wb3J0KFwiLi9iYXNlc291cmNlXCIpLlNsaWNlW119IHNsaWNlc1xuICAgKi9cbiAgYXN5bmMgZmV0Y2goc2xpY2VzLCBzaWduYWwpIHtcbiAgICBjb25zdCBibG9ja1JlcXVlc3RzID0gW107XG4gICAgY29uc3QgbWlzc2luZ0Jsb2NrSWRzID0gW107XG4gICAgY29uc3QgYWxsQmxvY2tJZHMgPSBbXTtcbiAgICB0aGlzLmV2aWN0ZWRCbG9ja3MuY2xlYXIoKTtcblxuICAgIGZvciAoY29uc3QgeyBvZmZzZXQsIGxlbmd0aCB9IG9mIHNsaWNlcykge1xuICAgICAgbGV0IHRvcCA9IG9mZnNldCArIGxlbmd0aDtcblxuICAgICAgY29uc3QgeyBmaWxlU2l6ZSB9ID0gdGhpcztcbiAgICAgIGlmIChmaWxlU2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICB0b3AgPSBNYXRoLm1pbih0b3AsIGZpbGVTaXplKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlyc3RCbG9ja09mZnNldCA9IE1hdGguZmxvb3Iob2Zmc2V0IC8gdGhpcy5ibG9ja1NpemUpICogdGhpcy5ibG9ja1NpemU7XG5cbiAgICAgIGZvciAobGV0IGN1cnJlbnQgPSBmaXJzdEJsb2NrT2Zmc2V0OyBjdXJyZW50IDwgdG9wOyBjdXJyZW50ICs9IHRoaXMuYmxvY2tTaXplKSB7XG4gICAgICAgIGNvbnN0IGJsb2NrSWQgPSBNYXRoLmZsb29yKGN1cnJlbnQgLyB0aGlzLmJsb2NrU2l6ZSk7XG4gICAgICAgIGlmICghdGhpcy5ibG9ja0NhY2hlLmhhcyhibG9ja0lkKSAmJiAhdGhpcy5ibG9ja1JlcXVlc3RzLmhhcyhibG9ja0lkKSkge1xuICAgICAgICAgIHRoaXMuYmxvY2tJZHNUb0ZldGNoLmFkZChibG9ja0lkKTtcbiAgICAgICAgICBtaXNzaW5nQmxvY2tJZHMucHVzaChibG9ja0lkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ibG9ja1JlcXVlc3RzLmhhcyhibG9ja0lkKSkge1xuICAgICAgICAgIGJsb2NrUmVxdWVzdHMucHVzaCh0aGlzLmJsb2NrUmVxdWVzdHMuZ2V0KGJsb2NrSWQpKTtcbiAgICAgICAgfVxuICAgICAgICBhbGxCbG9ja0lkcy5wdXNoKGJsb2NrSWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFsbG93IGFkZGl0aW9uYWwgYmxvY2sgcmVxdWVzdHMgdG8gYWNjdW11bGF0ZVxuICAgIGF3YWl0IHdhaXQoKTtcbiAgICB0aGlzLmZldGNoQmxvY2tzKHNpZ25hbCk7XG5cbiAgICAvLyBHYXRoZXIgYWxsIG9mIHRoZSBuZXcgcmVxdWVzdHMgdGhhdCB0aGlzIGZldGNoIGNhbGwgaXMgY29udHJpYnV0aW5nIHRvIGBmZXRjaGAuXG4gICAgY29uc3QgbWlzc2luZ1JlcXVlc3RzID0gW107XG4gICAgZm9yIChjb25zdCBibG9ja0lkIG9mIG1pc3NpbmdCbG9ja0lkcykge1xuICAgICAgLy8gVGhlIHJlcXVlc3RlZCBtaXNzaW5nIGJsb2NrIGNvdWxkIGFscmVhZHkgYmUgaW4gdGhlIGNhY2hlXG4gICAgICAvLyBpbnN0ZWFkIG9mIGhhdmluZyBpdHMgcmVxdWVzdCBzdGlsbCBiZSBvdXRzdGFuZGluZy5cbiAgICAgIGlmICh0aGlzLmJsb2NrUmVxdWVzdHMuaGFzKGJsb2NrSWQpKSB7XG4gICAgICAgIG1pc3NpbmdSZXF1ZXN0cy5wdXNoKHRoaXMuYmxvY2tSZXF1ZXN0cy5nZXQoYmxvY2tJZCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFjdHVhbGx5IGF3YWl0IGFsbCBwZW5kaW5nIHJlcXVlc3RzIHRoYXQgYXJlIG5lZWRlZCBmb3IgdGhpcyBgZmV0Y2hgLlxuICAgIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChibG9ja1JlcXVlc3RzKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQobWlzc2luZ1JlcXVlc3RzKTtcblxuICAgIC8vIFBlcmZvcm0gcmV0cmllcyBpZiBhIGJsb2NrIHdhcyBpbnRlcnJ1cHRlZCBieSBhIHByZXZpb3VzIHNpZ25hbFxuICAgIGNvbnN0IGFib3J0ZWRCbG9ja1JlcXVlc3RzID0gW107XG4gICAgY29uc3QgYWJvcnRlZEJsb2NrSWRzID0gYWxsQmxvY2tJZHNcbiAgICAgIC5maWx0ZXIoKGlkKSA9PiB0aGlzLmFib3J0ZWRCbG9ja0lkcy5oYXMoaWQpIHx8ICF0aGlzLmJsb2NrQ2FjaGUuaGFzKGlkKSk7XG4gICAgYWJvcnRlZEJsb2NrSWRzLmZvckVhY2goKGlkKSA9PiB0aGlzLmJsb2NrSWRzVG9GZXRjaC5hZGQoaWQpKTtcbiAgICAvLyBzdGFydCB0aGUgcmV0cnkgb2Ygc29tZSBibG9ja3MgaWYgcmVxdWlyZWRcbiAgICBpZiAoYWJvcnRlZEJsb2NrSWRzLmxlbmd0aCA+IDAgJiYgc2lnbmFsICYmICFzaWduYWwuYWJvcnRlZCkge1xuICAgICAgdGhpcy5mZXRjaEJsb2NrcyhudWxsKTtcbiAgICAgIGZvciAoY29uc3QgYmxvY2tJZCBvZiBhYm9ydGVkQmxvY2tJZHMpIHtcbiAgICAgICAgY29uc3QgYmxvY2sgPSB0aGlzLmJsb2NrUmVxdWVzdHMuZ2V0KGJsb2NrSWQpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCbG9jayAke2Jsb2NrSWR9IGlzIG5vdCBpbiB0aGUgYmxvY2sgcmVxdWVzdHNgKTtcbiAgICAgICAgfVxuICAgICAgICBhYm9ydGVkQmxvY2tSZXF1ZXN0cy5wdXNoKGJsb2NrKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChhYm9ydGVkQmxvY2tSZXF1ZXN0cyk7XG4gICAgfVxuXG4gICAgLy8gdGhyb3cgYW4gIGFib3J0IGVycm9yXG4gICAgaWYgKHNpZ25hbCAmJiBzaWduYWwuYWJvcnRlZCkge1xuICAgICAgdGhyb3cgbmV3IEFib3J0RXJyb3IoJ1JlcXVlc3Qgd2FzIGFib3J0ZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBibG9ja3MgPSBhbGxCbG9ja0lkcy5tYXAoKGlkKSA9PiB0aGlzLmJsb2NrQ2FjaGUuZ2V0KGlkKSB8fCB0aGlzLmV2aWN0ZWRCbG9ja3MuZ2V0KGlkKSk7XG4gICAgY29uc3QgZmFpbGVkQmxvY2tzID0gYmxvY2tzLmZpbHRlcigoaSkgPT4gIWkpO1xuICAgIGlmIChmYWlsZWRCbG9ja3MubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgQWdncmVnYXRlRXJyb3IoZmFpbGVkQmxvY2tzLCAnUmVxdWVzdCBmYWlsZWQnKTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgYSBmaW5hbCBNYXAsIHdpdGggYWxsIHJlcXVpcmVkIGJsb2NrcyBmb3IgdGhpcyByZXF1ZXN0IHRvIHNhdGlzZnlcbiAgICBjb25zdCByZXF1aXJlZEJsb2NrcyA9IG5ldyBNYXAoemlwKGFsbEJsb2NrSWRzLCBibG9ja3MpKTtcblxuICAgIC8vIFRPRE86IHNhdGlzZnkgZWFjaCBzbGljZVxuICAgIHJldHVybiB0aGlzLnJlYWRTbGljZURhdGEoc2xpY2VzLCByZXF1aXJlZEJsb2Nrcyk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtBYm9ydFNpZ25hbH0gc2lnbmFsXG4gICAqL1xuICBmZXRjaEJsb2NrcyhzaWduYWwpIHtcbiAgICAvLyBjaGVjayBpZiB3ZSBzdGlsbCBuZWVkIHRvXG4gICAgaWYgKHRoaXMuYmxvY2tJZHNUb0ZldGNoLnNpemUgPiAwKSB7XG4gICAgICBjb25zdCBncm91cHMgPSB0aGlzLmdyb3VwQmxvY2tzKHRoaXMuYmxvY2tJZHNUb0ZldGNoKTtcblxuICAgICAgLy8gc3RhcnQgcmVxdWVzdGluZyBzbGljZXMgb2YgZGF0YVxuICAgICAgY29uc3QgZ3JvdXBSZXF1ZXN0cyA9IHRoaXMuc291cmNlLmZldGNoKGdyb3Vwcywgc2lnbmFsKTtcblxuICAgICAgZm9yIChsZXQgZ3JvdXBJbmRleCA9IDA7IGdyb3VwSW5kZXggPCBncm91cHMubGVuZ3RoOyArK2dyb3VwSW5kZXgpIHtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBncm91cHNbZ3JvdXBJbmRleF07XG5cbiAgICAgICAgZm9yIChjb25zdCBibG9ja0lkIG9mIGdyb3VwLmJsb2NrSWRzKSB7XG4gICAgICAgICAgLy8gbWFrZSBhbiBhc3luYyBJSUZFIGZvciBlYWNoIGJsb2NrXG4gICAgICAgICAgdGhpcy5ibG9ja1JlcXVlc3RzLnNldChibG9ja0lkLCAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSAoYXdhaXQgZ3JvdXBSZXF1ZXN0cylbZ3JvdXBJbmRleF07XG4gICAgICAgICAgICAgIGNvbnN0IGJsb2NrT2Zmc2V0ID0gYmxvY2tJZCAqIHRoaXMuYmxvY2tTaXplO1xuICAgICAgICAgICAgICBjb25zdCBvID0gYmxvY2tPZmZzZXQgLSByZXNwb25zZS5vZmZzZXQ7XG4gICAgICAgICAgICAgIGNvbnN0IHQgPSBNYXRoLm1pbihvICsgdGhpcy5ibG9ja1NpemUsIHJlc3BvbnNlLmRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhLnNsaWNlKG8sIHQpO1xuICAgICAgICAgICAgICBjb25zdCBibG9jayA9IG5ldyBCbG9jayhcbiAgICAgICAgICAgICAgICBibG9ja09mZnNldCxcbiAgICAgICAgICAgICAgICBkYXRhLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICBibG9ja0lkLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB0aGlzLmJsb2NrQ2FjaGUuc2V0KGJsb2NrSWQsIGJsb2NrKTtcbiAgICAgICAgICAgICAgdGhpcy5hYm9ydGVkQmxvY2tJZHMuZGVsZXRlKGJsb2NrSWQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHNpZ25hbCBoZXJlLCB3ZSBuZWVkIGl0IHRvIGRldGVybWluZSBsYXRlciBpZiBhblxuICAgICAgICAgICAgICAgIC8vIGVycm9yIHdhcyBjYXVzZWQgYnkgdGhpcyBzaWduYWxcbiAgICAgICAgICAgICAgICBlcnIuc2lnbmFsID0gc2lnbmFsO1xuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tDYWNoZS5kZWxldGUoYmxvY2tJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hYm9ydGVkQmxvY2tJZHMuYWRkKGJsb2NrSWQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgdGhpcy5ibG9ja1JlcXVlc3RzLmRlbGV0ZShibG9ja0lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5ibG9ja0lkc1RvRmV0Y2guY2xlYXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtTZXR9IGJsb2NrSWRzXG4gICAqIEByZXR1cm5zIHtCbG9ja0dyb3VwW119XG4gICAqL1xuICBncm91cEJsb2NrcyhibG9ja0lkcykge1xuICAgIGNvbnN0IHNvcnRlZEJsb2NrSWRzID0gQXJyYXkuZnJvbShibG9ja0lkcykuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgIGlmIChzb3J0ZWRCbG9ja0lkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnQgPSBbXTtcbiAgICBsZXQgbGFzdEJsb2NrSWQgPSBudWxsO1xuICAgIGNvbnN0IGdyb3VwcyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBibG9ja0lkIG9mIHNvcnRlZEJsb2NrSWRzKSB7XG4gICAgICBpZiAobGFzdEJsb2NrSWQgPT09IG51bGwgfHwgbGFzdEJsb2NrSWQgKyAxID09PSBibG9ja0lkKSB7XG4gICAgICAgIGN1cnJlbnQucHVzaChibG9ja0lkKTtcbiAgICAgICAgbGFzdEJsb2NrSWQgPSBibG9ja0lkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ3JvdXBzLnB1c2gobmV3IEJsb2NrR3JvdXAoXG4gICAgICAgICAgY3VycmVudFswXSAqIHRoaXMuYmxvY2tTaXplLFxuICAgICAgICAgIGN1cnJlbnQubGVuZ3RoICogdGhpcy5ibG9ja1NpemUsXG4gICAgICAgICAgY3VycmVudCxcbiAgICAgICAgKSk7XG4gICAgICAgIGN1cnJlbnQgPSBbYmxvY2tJZF07XG4gICAgICAgIGxhc3RCbG9ja0lkID0gYmxvY2tJZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBncm91cHMucHVzaChuZXcgQmxvY2tHcm91cChcbiAgICAgIGN1cnJlbnRbMF0gKiB0aGlzLmJsb2NrU2l6ZSxcbiAgICAgIGN1cnJlbnQubGVuZ3RoICogdGhpcy5ibG9ja1NpemUsXG4gICAgICBjdXJyZW50LFxuICAgICkpO1xuXG4gICAgcmV0dXJuIGdyb3VwcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge2ltcG9ydChcIi4vYmFzZXNvdXJjZVwiKS5TbGljZVtdfSBzbGljZXNcbiAgICogQHBhcmFtIHtNYXB9IGJsb2Nrc1xuICAgKi9cbiAgcmVhZFNsaWNlRGF0YShzbGljZXMsIGJsb2Nrcykge1xuICAgIHJldHVybiBzbGljZXMubWFwKChzbGljZSkgPT4ge1xuICAgICAgbGV0IHRvcCA9IHNsaWNlLm9mZnNldCArIHNsaWNlLmxlbmd0aDtcbiAgICAgIGlmICh0aGlzLmZpbGVTaXplICE9PSBudWxsKSB7XG4gICAgICAgIHRvcCA9IE1hdGgubWluKHRoaXMuZmlsZVNpemUsIHRvcCk7XG4gICAgICB9XG4gICAgICBjb25zdCBibG9ja0lkTG93ID0gTWF0aC5mbG9vcihzbGljZS5vZmZzZXQgLyB0aGlzLmJsb2NrU2l6ZSk7XG4gICAgICBjb25zdCBibG9ja0lkSGlnaCA9IE1hdGguZmxvb3IodG9wIC8gdGhpcy5ibG9ja1NpemUpO1xuICAgICAgY29uc3Qgc2xpY2VEYXRhID0gbmV3IEFycmF5QnVmZmVyKHNsaWNlLmxlbmd0aCk7XG4gICAgICBjb25zdCBzbGljZVZpZXcgPSBuZXcgVWludDhBcnJheShzbGljZURhdGEpO1xuXG4gICAgICBmb3IgKGxldCBibG9ja0lkID0gYmxvY2tJZExvdzsgYmxvY2tJZCA8PSBibG9ja0lkSGlnaDsgKytibG9ja0lkKSB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tzLmdldChibG9ja0lkKTtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBibG9jay5vZmZzZXQgLSBzbGljZS5vZmZzZXQ7XG4gICAgICAgIGNvbnN0IHRvcERlbHRhID0gYmxvY2sudG9wIC0gdG9wO1xuICAgICAgICBsZXQgYmxvY2tJbm5lck9mZnNldCA9IDA7XG4gICAgICAgIGxldCByYW5nZUlubmVyT2Zmc2V0ID0gMDtcbiAgICAgICAgbGV0IHVzZWRCbG9ja0xlbmd0aDtcblxuICAgICAgICBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgICAgYmxvY2tJbm5lck9mZnNldCA9IC1kZWx0YTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWx0YSA+IDApIHtcbiAgICAgICAgICByYW5nZUlubmVyT2Zmc2V0ID0gZGVsdGE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9wRGVsdGEgPCAwKSB7XG4gICAgICAgICAgdXNlZEJsb2NrTGVuZ3RoID0gYmxvY2subGVuZ3RoIC0gYmxvY2tJbm5lck9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1c2VkQmxvY2tMZW5ndGggPSB0b3AgLSBibG9jay5vZmZzZXQgLSBibG9ja0lubmVyT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmxvY2tWaWV3ID0gbmV3IFVpbnQ4QXJyYXkoYmxvY2suZGF0YSwgYmxvY2tJbm5lck9mZnNldCwgdXNlZEJsb2NrTGVuZ3RoKTtcbiAgICAgICAgc2xpY2VWaWV3LnNldChibG9ja1ZpZXcsIHJhbmdlSW5uZXJPZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2xpY2VEYXRhO1xuICAgIH0pO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgQmFzZVJlc3BvbnNlIHtcbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcmVzcG9uc2UgaGFzIGFuIG9rJ2lzaCBzdGF0dXMgY29kZVxuICAgKi9cbiAgZ2V0IG9rKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPD0gMjk5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0YXR1cyBjb2RlIG9mIHRoZSByZXNwb25zZVxuICAgKi9cbiAgZ2V0IHN0YXR1cygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgaGVhZGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXJOYW1lIHRoZSBoZWFkZXIgbmFtZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgaGVhZGVyIHZhbHVlXG4gICAqL1xuICBnZXRIZWFkZXIoaGVhZGVyTmFtZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJ9IHRoZSByZXNwb25zZSBkYXRhIG9mIHRoZSByZXF1ZXN0XG4gICAqL1xuICBhc3luYyBnZXREYXRhKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJhc2VDbGllbnQge1xuICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgcmVxdWVzdCB3aXRoIHRoZSBvcHRpb25zXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGFzeW5jIHJlcXVlc3QoeyBoZWFkZXJzLCBjcmVkZW50aWFscywgc2lnbmFsIH0gPSB7fSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXF1ZXN0IGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBCYXNlQ2xpZW50LCBCYXNlUmVzcG9uc2UgfSBmcm9tICcuL2Jhc2UuanMnO1xuXG5jbGFzcyBGZXRjaFJlc3BvbnNlIGV4dGVuZHMgQmFzZVJlc3BvbnNlIHtcbiAgLyoqXG4gICAqIEJhc2VSZXNwb25zZSBmYWNhZGUgZm9yIGZldGNoIEFQSSBSZXNwb25zZVxuICAgKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNwb25zZVxuICAgKi9cbiAgY29uc3RydWN0b3IocmVzcG9uc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgfVxuXG4gIGdldCBzdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzcG9uc2Uuc3RhdHVzO1xuICB9XG5cbiAgZ2V0SGVhZGVyKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNwb25zZS5oZWFkZXJzLmdldChuYW1lKTtcbiAgfVxuXG4gIGFzeW5jIGdldERhdGEoKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMucmVzcG9uc2UuYXJyYXlCdWZmZXJcbiAgICAgID8gYXdhaXQgdGhpcy5yZXNwb25zZS5hcnJheUJ1ZmZlcigpXG4gICAgICA6IChhd2FpdCB0aGlzLnJlc3BvbnNlLmJ1ZmZlcigpKS5idWZmZXI7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZldGNoQ2xpZW50IGV4dGVuZHMgQmFzZUNsaWVudCB7XG4gIGNvbnN0cnVjdG9yKHVybCwgY3JlZGVudGlhbHMpIHtcbiAgICBzdXBlcih1cmwpO1xuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3QoeyBoZWFkZXJzLCBjcmVkZW50aWFscywgc2lnbmFsIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy51cmwsIHtcbiAgICAgIGhlYWRlcnMsIGNyZWRlbnRpYWxzLCBzaWduYWwsXG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBGZXRjaFJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgfVxufVxuIiwiaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHVybE1vZCBmcm9tICd1cmwnO1xuXG5pbXBvcnQgeyBCYXNlQ2xpZW50LCBCYXNlUmVzcG9uc2UgfSBmcm9tICcuL2Jhc2UuanMnO1xuaW1wb3J0IHsgQWJvcnRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzLmpzJztcblxuY2xhc3MgSHR0cFJlc3BvbnNlIGV4dGVuZHMgQmFzZVJlc3BvbnNlIHtcbiAgLyoqXG4gICAqIEJhc2VSZXNwb25zZSBmYWNhZGUgZm9yIG5vZGUgSFRUUC9IVFRQUyBBUEkgUmVzcG9uc2VcbiAgICogQHBhcmFtIHtodHRwLlNlcnZlclJlc3BvbnNlfSByZXNwb25zZVxuICAgKi9cbiAgY29uc3RydWN0b3IocmVzcG9uc2UsIGRhdGFQcm9taXNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgdGhpcy5kYXRhUHJvbWlzZSA9IGRhdGFQcm9taXNlO1xuICB9XG5cbiAgZ2V0IHN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNwb25zZS5zdGF0dXNDb2RlO1xuICB9XG5cbiAgZ2V0SGVhZGVyKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNwb25zZS5oZWFkZXJzW25hbWVdO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF0YSgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kYXRhUHJvbWlzZTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudCBleHRlbmRzIEJhc2VDbGllbnQge1xuICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICBzdXBlcih1cmwpO1xuICAgIHRoaXMucGFyc2VkVXJsID0gdXJsTW9kLnBhcnNlKHRoaXMudXJsKTtcbiAgICB0aGlzLmh0dHBBcGkgPSAodGhpcy5wYXJzZWRVcmwucHJvdG9jb2wgPT09ICdodHRwOicgPyBodHRwIDogaHR0cHMpO1xuICB9XG5cbiAgY29uc3RydWN0UmVxdWVzdChoZWFkZXJzLCBzaWduYWwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuaHR0cEFwaS5nZXQoXG4gICAgICAgIHtcbiAgICAgICAgICAuLi50aGlzLnBhcnNlZFVybCxcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICB9LFxuICAgICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBjb25zdCBkYXRhUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gW107XG5cbiAgICAgICAgICAgIC8vIGNvbGxlY3QgY2h1bmtzXG4gICAgICAgICAgICByZXNwb25zZS5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gY29uY2F0ZW5hdGUgYWxsIGNodW5rcyBhbmQgcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIHRoZSByZXN1bHRpbmcgYnVmZmVyXG4gICAgICAgICAgICByZXNwb25zZS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBkYXRhID0gQnVmZmVyLmNvbmNhdChjaHVua3MpLmJ1ZmZlcjtcbiAgICAgICAgICAgICAgcmVzb2x2ZURhdGEoZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3BvbnNlLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVzb2x2ZShuZXcgSHR0cFJlc3BvbnNlKHJlc3BvbnNlLCBkYXRhUHJvbWlzZSkpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICAgIHJlcXVlc3Qub24oJ2Vycm9yJywgcmVqZWN0KTtcblxuICAgICAgaWYgKHNpZ25hbCkge1xuICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICByZXF1ZXN0LmRlc3Ryb3kobmV3IEFib3J0RXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcpKTtcbiAgICAgICAgfVxuICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCAoKSA9PiByZXF1ZXN0LmRlc3Ryb3kobmV3IEFib3J0RXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyByZXF1ZXN0KHsgaGVhZGVycywgc2lnbmFsIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5jb25zdHJ1Y3RSZXF1ZXN0KGhlYWRlcnMsIHNpZ25hbCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG59XG4iLCJpbXBvcnQgeyBCYXNlQ2xpZW50LCBCYXNlUmVzcG9uc2UgfSBmcm9tICcuL2Jhc2UuanMnO1xuaW1wb3J0IHsgQWJvcnRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzLmpzJztcblxuY2xhc3MgWEhSUmVzcG9uc2UgZXh0ZW5kcyBCYXNlUmVzcG9uc2Uge1xuICAvKipcbiAgICogQmFzZVJlc3BvbnNlIGZhY2FkZSBmb3IgWE1MSHR0cFJlcXVlc3RcbiAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdH0geGhyXG4gICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGRhdGFcbiAgICovXG4gIGNvbnN0cnVjdG9yKHhociwgZGF0YSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy54aHIgPSB4aHI7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGdldCBzdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMueGhyLnN0YXR1cztcbiAgfVxuXG4gIGdldEhlYWRlcihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKG5hbWUpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBYSFJDbGllbnQgZXh0ZW5kcyBCYXNlQ2xpZW50IHtcbiAgY29uc3RydWN0UmVxdWVzdChoZWFkZXJzLCBzaWduYWwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICB4aHIub3BlbignR0VUJywgdGhpcy51cmwpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhoZWFkZXJzKSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgLy8gaG9vayBzaWduYWxzXG4gICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0geGhyLnJlc3BvbnNlO1xuICAgICAgICByZXNvbHZlKG5ldyBYSFJSZXNwb25zZSh4aHIsIGRhdGEpKTtcbiAgICAgIH07XG4gICAgICB4aHIub25lcnJvciA9IHJlamVjdDtcbiAgICAgIHhoci5vbmFib3J0ID0gKCkgPT4gcmVqZWN0KG5ldyBBYm9ydEVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnKSk7XG4gICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICBpZiAoc2lnbmFsKSB7XG4gICAgICAgIGlmIChzaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsICgpID0+IHhoci5hYm9ydCgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3QoeyBoZWFkZXJzLCBzaWduYWwgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNvbnN0cnVjdFJlcXVlc3QoaGVhZGVycywgc2lnbmFsKTtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cbn1cbiIsImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBCYXNlU291cmNlIH0gZnJvbSAnLi9iYXNlc291cmNlLmpzJztcblxuZnVuY3Rpb24gY2xvc2VBc3luYyhmZCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGZzLmNsb3NlKGZkLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb3BlbkFzeW5jKHBhdGgsIGZsYWdzLCBtb2RlID0gdW5kZWZpbmVkKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMub3BlbihwYXRoLCBmbGFncywgbW9kZSwgKGVyciwgZmQpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKGZkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRBc3luYyguLi5hcmdzKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMucmVhZCguLi5hcmdzLCAoZXJyLCBieXRlc1JlYWQsIGJ1ZmZlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoeyBieXRlc1JlYWQsIGJ1ZmZlciB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmNsYXNzIEZpbGVTb3VyY2UgZXh0ZW5kcyBCYXNlU291cmNlIHtcbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLm9wZW5SZXF1ZXN0ID0gb3BlbkFzeW5jKHBhdGgsICdyJyk7XG4gIH1cblxuICBhc3luYyBmZXRjaFNsaWNlKHNsaWNlKSB7XG4gICAgLy8gVE9ETzogdXNlIGBzaWduYWxgXG4gICAgY29uc3QgZmQgPSBhd2FpdCB0aGlzLm9wZW5SZXF1ZXN0O1xuICAgIGNvbnN0IHsgYnVmZmVyIH0gPSBhd2FpdCByZWFkQXN5bmMoXG4gICAgICBmZCxcbiAgICAgIEJ1ZmZlci5hbGxvYyhzbGljZS5sZW5ndGgpLFxuICAgICAgMCxcbiAgICAgIHNsaWNlLmxlbmd0aCxcbiAgICAgIHNsaWNlLm9mZnNldCxcbiAgICApO1xuICAgIHJldHVybiBidWZmZXIuYnVmZmVyO1xuICB9XG5cbiAgYXN5bmMgY2xvc2UoKSB7XG4gICAgY29uc3QgZmQgPSBhd2FpdCB0aGlzLm9wZW5SZXF1ZXN0O1xuICAgIGF3YWl0IGNsb3NlQXN5bmMoZmQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRmlsZVNvdXJjZShwYXRoKSB7XG4gIHJldHVybiBuZXcgRmlsZVNvdXJjZShwYXRoKTtcbn1cbiIsImltcG9ydCB7IEJhc2VTb3VyY2UgfSBmcm9tICcuL2Jhc2Vzb3VyY2UuanMnO1xuXG5jbGFzcyBGaWxlUmVhZGVyU291cmNlIGV4dGVuZHMgQmFzZVNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGZpbGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gIH1cblxuICBhc3luYyBmZXRjaFNsaWNlKHNsaWNlLCBzaWduYWwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgYmxvYiA9IHRoaXMuZmlsZS5zbGljZShzbGljZS5vZmZzZXQsIHNsaWNlLm9mZnNldCArIHNsaWNlLmxlbmd0aCk7XG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IChldmVudCkgPT4gcmVzb2x2ZShldmVudC50YXJnZXQucmVzdWx0KTtcbiAgICAgIHJlYWRlci5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgcmVhZGVyLm9uYWJvcnQgPSByZWplY3Q7XG4gICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYik7XG5cbiAgICAgIGlmIChzaWduYWwpIHtcbiAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgKCkgPT4gcmVhZGVyLmFib3J0KCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHNvdXJjZSBmcm9tIGEgZ2l2ZW4gZmlsZS9ibG9iLlxuICogQHBhcmFtIHtCbG9ifSBmaWxlIFRoZSBmaWxlIG9yIGJsb2IgdG8gcmVhZCBmcm9tLlxuICogQHJldHVybnMgVGhlIGNvbnN0cnVjdGVkIHNvdXJjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUZpbGVSZWFkZXJTb3VyY2UoZmlsZSkge1xuICByZXR1cm4gbmV3IEZpbGVSZWFkZXJTb3VyY2UoZmlsZSk7XG59XG4iLCJjb25zdCBDUkxGQ1JMRiA9ICdcXHJcXG5cXHJcXG4nO1xuXG4vKlxuICogU2hpbSBmb3IgJ09iamVjdC5mcm9tRW50cmllcydcbiAqL1xuZnVuY3Rpb24gaXRlbXNUb09iamVjdChpdGVtcykge1xuICBpZiAodHlwZW9mIE9iamVjdC5mcm9tRW50cmllcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKGl0ZW1zKTtcbiAgfVxuICBjb25zdCBvYmogPSB7fTtcbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaXRlbXMpIHtcbiAgICBvYmpba2V5LnRvTG93ZXJDYXNlKCldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBQYXJzZSBIVFRQIGhlYWRlcnMgZnJvbSBhIGdpdmVuIHN0cmluZy5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IHRoZSB0ZXh0IHRvIHBhcnNlIHRoZSBoZWFkZXJzIGZyb21cbiAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBwYXJzZWQgaGVhZGVycyB3aXRoIGxvd2VyY2FzZSBrZXlzXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSGVhZGVycyh0ZXh0KSB7XG4gIGNvbnN0IGl0ZW1zID0gdGV4dFxuICAgIC5zcGxpdCgnXFxyXFxuJylcbiAgICAubWFwKChsaW5lKSA9PiB7XG4gICAgICBjb25zdCBrdiA9IGxpbmUuc3BsaXQoJzonKS5tYXAoKHN0cikgPT4gc3RyLnRyaW0oKSk7XG4gICAgICBrdlswXSA9IGt2WzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgICByZXR1cm4ga3Y7XG4gICAgfSk7XG5cbiAgcmV0dXJuIGl0ZW1zVG9PYmplY3QoaXRlbXMpO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgJ0NvbnRlbnQtVHlwZScgaGVhZGVyIHZhbHVlIHRvIHRoZSBjb250ZW50LXR5cGUgYW5kIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSByYXdDb250ZW50VHlwZSB0aGUgcmF3IHN0cmluZyB0byBwYXJzZSBmcm9tXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgcGFyc2VkIGNvbnRlbnQgdHlwZSB3aXRoIHRoZSBmaWVsZHM6IHR5cGUgYW5kIHBhcmFtc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb250ZW50VHlwZShyYXdDb250ZW50VHlwZSkge1xuICBjb25zdCBbdHlwZSwgLi4ucmF3UGFyYW1zXSA9IHJhd0NvbnRlbnRUeXBlLnNwbGl0KCc7JykubWFwKChzKSA9PiBzLnRyaW0oKSk7XG4gIGNvbnN0IHBhcmFtc0l0ZW1zID0gcmF3UGFyYW1zLm1hcCgocGFyYW0pID0+IHBhcmFtLnNwbGl0KCc9JykpO1xuICByZXR1cm4geyB0eXBlLCBwYXJhbXM6IGl0ZW1zVG9PYmplY3QocGFyYW1zSXRlbXMpIH07XG59XG5cbi8qKlxuICogUGFyc2UgYSAnQ29udGVudC1SYW5nZScgaGVhZGVyIHZhbHVlIHRvIGl0cyBzdGFydCwgZW5kLCBhbmQgdG90YWwgcGFydHNcbiAqIEBwYXJhbSB7U3RyaW5nfSByYXdDb250ZW50UmFuZ2UgdGhlIHJhdyBzdHJpbmcgdG8gcGFyc2UgZnJvbVxuICogQHJldHVybnMge09iamVjdH0gdGhlIHBhcnNlZCBwYXJ0c1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb250ZW50UmFuZ2UocmF3Q29udGVudFJhbmdlKSB7XG4gIGxldCBzdGFydDtcbiAgbGV0IGVuZDtcbiAgbGV0IHRvdGFsO1xuXG4gIGlmIChyYXdDb250ZW50UmFuZ2UpIHtcbiAgICBbLCBzdGFydCwgZW5kLCB0b3RhbF0gPSByYXdDb250ZW50UmFuZ2UubWF0Y2goL2J5dGVzIChcXGQrKS0oXFxkKylcXC8oXFxkKykvKTtcbiAgICBzdGFydCA9IHBhcnNlSW50KHN0YXJ0LCAxMCk7XG4gICAgZW5kID0gcGFyc2VJbnQoZW5kLCAxMCk7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICB9XG5cbiAgcmV0dXJuIHsgc3RhcnQsIGVuZCwgdG90YWwgfTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBsaXN0IG9mIGJ5dGVyYW5nZXMgZnJvbSB0aGUgZ2l2ZW4gJ211bHRpcGFydC9ieXRlcmFuZ2VzJyBIVFRQIHJlc3BvbnNlLlxuICogRWFjaCBpdGVtIGluIHRoZSBsaXN0IGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAtIGhlYWRlcnM6IHRoZSBIVFRQIGhlYWRlcnNcbiAqIC0gZGF0YTogdGhlIHNsaWNlZCBBcnJheUJ1ZmZlciBmb3IgdGhhdCBzcGVjaWZpYyBwYXJ0XG4gKiAtIG9mZnNldDogdGhlIG9mZnNldCBvZiB0aGUgYnl0ZXJhbmdlIHdpdGhpbiBpdHMgb3JpZ2luYXRpbmcgZmlsZVxuICogLSBsZW5ndGg6IHRoZSBsZW5ndGggb2YgdGhlIGJ5dGVyYW5nZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gcmVzcG9uc2VBcnJheUJ1ZmZlciB0aGUgcmVzcG9uc2UgdG8gYmUgcGFyc2VkIGFuZCBzcGxpdFxuICogQHBhcmFtIHtTdHJpbmd9IGJvdW5kYXJ5IHRoZSBib3VuZGFyeSBzdHJpbmcgdXNlZCB0byBzcGxpdCB0aGUgc2VjdGlvbnNcbiAqIEByZXR1cm5zIHtPYmplY3RbXX0gdGhlIHBhcnNlZCBieXRlcmFuZ2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ5dGVSYW5nZXMocmVzcG9uc2VBcnJheUJ1ZmZlciwgYm91bmRhcnkpIHtcbiAgbGV0IG9mZnNldCA9IG51bGw7XG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoJ2FzY2lpJyk7XG4gIGNvbnN0IG91dCA9IFtdO1xuXG4gIGNvbnN0IHN0YXJ0Qm91bmRhcnkgPSBgLS0ke2JvdW5kYXJ5fWA7XG4gIGNvbnN0IGVuZEJvdW5kYXJ5ID0gYCR7c3RhcnRCb3VuZGFyeX0tLWA7XG5cbiAgLy8gc2VhcmNoIGZvciB0aGUgaW5pdGlhbCBib3VuZGFyeSwgbWF5IGJlIG9mZnNldCBieSBzb21lIGJ5dGVzXG4gIC8vIFRPRE86IG1vcmUgZWZmaWNpZW50IHRvIGNoZWNrIGZvciBgLS1gIGluIGJ5dGVzIGRpcmVjdGx5XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7ICsraSkge1xuICAgIGNvbnN0IHRleHQgPSBkZWNvZGVyLmRlY29kZShcbiAgICAgIG5ldyBVaW50OEFycmF5KHJlc3BvbnNlQXJyYXlCdWZmZXIsIGksIHN0YXJ0Qm91bmRhcnkubGVuZ3RoKSxcbiAgICApO1xuICAgIGlmICh0ZXh0ID09PSBzdGFydEJvdW5kYXJ5KSB7XG4gICAgICBvZmZzZXQgPSBpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvZmZzZXQgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGluaXRpYWwgYm91bmRhcnknKTtcbiAgfVxuXG4gIHdoaWxlIChvZmZzZXQgPCByZXNwb25zZUFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUoXG4gICAgICBuZXcgVWludDhBcnJheShyZXNwb25zZUFycmF5QnVmZmVyLCBvZmZzZXQsXG4gICAgICAgIE1hdGgubWluKHN0YXJ0Qm91bmRhcnkubGVuZ3RoICsgMTAyNCwgcmVzcG9uc2VBcnJheUJ1ZmZlci5ieXRlTGVuZ3RoIC0gb2Zmc2V0KSxcbiAgICAgICksXG4gICAgKTtcblxuICAgIC8vIGJyZWFrIGlmIHdlIGFycml2ZWQgYXQgdGhlIGVuZFxuICAgIGlmICh0ZXh0Lmxlbmd0aCA9PT0gMCB8fCB0ZXh0LnN0YXJ0c1dpdGgoZW5kQm91bmRhcnkpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBhc3NlcnQgdGhhdCB3ZSBhcmUgYWN0dWFsbHkgZGVhbGluZyB3aXRoIGEgYnl0ZXJhbmdlIGFuZCBhcmUgYXQgdGhlIGNvcnJlY3Qgb2Zmc2V0XG4gICAgaWYgKCF0ZXh0LnN0YXJ0c1dpdGgoc3RhcnRCb3VuZGFyeSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGFydCBkb2VzIG5vdCBzdGFydCB3aXRoIGJvdW5kYXJ5Jyk7XG4gICAgfVxuXG4gICAgLy8gZ2V0IGEgc3Vic3RyaW5nIGZyb20gd2hlcmUgd2UgcmVhZCB0aGUgaGVhZGVyc1xuICAgIGNvbnN0IGlubmVyVGV4dCA9IHRleHQuc3Vic3RyKHN0YXJ0Qm91bmRhcnkubGVuZ3RoICsgMik7XG5cbiAgICBpZiAoaW5uZXJUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gZmluZCB0aGUgZG91YmxlIGxpbmVicmVhayB0aGF0IGRlbm90ZXMgdGhlIGVuZCBvZiB0aGUgaGVhZGVyc1xuICAgIGNvbnN0IGVuZE9mSGVhZGVycyA9IGlubmVyVGV4dC5pbmRleE9mKENSTEZDUkxGKTtcblxuICAgIC8vIHBhcnNlIHRoZSBoZWFkZXJzIHRvIGdldCB0aGUgY29udGVudCByYW5nZSBzaXplXG4gICAgY29uc3QgaGVhZGVycyA9IHBhcnNlSGVhZGVycyhpbm5lclRleHQuc3Vic3RyKDAsIGVuZE9mSGVhZGVycykpO1xuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCwgdG90YWwgfSA9IHBhcnNlQ29udGVudFJhbmdlKGhlYWRlcnNbJ2NvbnRlbnQtcmFuZ2UnXSk7XG5cbiAgICAvLyBjYWxjdWxhdGUgdGhlIGxlbmd0aCBvZiB0aGUgc2xpY2UgYW5kIHRoZSBuZXh0IG9mZnNldFxuICAgIGNvbnN0IHN0YXJ0T2ZEYXRhID0gb2Zmc2V0ICsgc3RhcnRCb3VuZGFyeS5sZW5ndGggKyBlbmRPZkhlYWRlcnMgKyBDUkxGQ1JMRi5sZW5ndGg7XG4gICAgY29uc3QgbGVuZ3RoID0gcGFyc2VJbnQoZW5kLCAxMCkgKyAxIC0gcGFyc2VJbnQoc3RhcnQsIDEwKTtcbiAgICBvdXQucHVzaCh7XG4gICAgICBoZWFkZXJzLFxuICAgICAgZGF0YTogcmVzcG9uc2VBcnJheUJ1ZmZlci5zbGljZShzdGFydE9mRGF0YSwgc3RhcnRPZkRhdGEgKyBsZW5ndGgpLFxuICAgICAgb2Zmc2V0OiBzdGFydCxcbiAgICAgIGxlbmd0aCxcbiAgICAgIGZpbGVTaXplOiB0b3RhbCxcbiAgICB9KTtcblxuICAgIG9mZnNldCA9IHN0YXJ0T2ZEYXRhICsgbGVuZ3RoICsgNDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4iLCJpbXBvcnQgeyBwYXJzZUJ5dGVSYW5nZXMsIHBhcnNlQ29udGVudFJhbmdlLCBwYXJzZUNvbnRlbnRUeXBlIH0gZnJvbSAnLi9odHRwdXRpbHMuanMnO1xuaW1wb3J0IHsgQmFzZVNvdXJjZSB9IGZyb20gJy4vYmFzZXNvdXJjZS5qcyc7XG5pbXBvcnQgeyBCbG9ja2VkU291cmNlIH0gZnJvbSAnLi9ibG9ja2Vkc291cmNlLmpzJztcblxuaW1wb3J0IHsgRmV0Y2hDbGllbnQgfSBmcm9tICcuL2NsaWVudC9mZXRjaC5qcyc7XG5pbXBvcnQgeyBYSFJDbGllbnQgfSBmcm9tICcuL2NsaWVudC94aHIuanMnO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJy4vY2xpZW50L2h0dHAuanMnO1xuXG5jbGFzcyBSZW1vdGVTb3VyY2UgZXh0ZW5kcyBCYXNlU291cmNlIHtcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7QmFzZUNsaWVudH0gY2xpZW50XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBoZWFkZXJzXG4gICAqIEBwYXJhbSB7bnVtYmVyc30gbWF4UmFuZ2VzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dGdWxsRmlsZVxuICAgKi9cbiAgY29uc3RydWN0b3IoY2xpZW50LCBoZWFkZXJzLCBtYXhSYW5nZXMsIGFsbG93RnVsbEZpbGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgIHRoaXMuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgdGhpcy5tYXhSYW5nZXMgPSBtYXhSYW5nZXM7XG4gICAgdGhpcy5hbGxvd0Z1bGxGaWxlID0gYWxsb3dGdWxsRmlsZTtcbiAgICB0aGlzLl9maWxlU2l6ZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtTbGljZVtdfSBzbGljZXNcbiAgICovXG4gIGFzeW5jIGZldGNoKHNsaWNlcywgc2lnbmFsKSB7XG4gICAgLy8gaWYgd2UgYWxsb3cgbXVsdGktcmFuZ2VzLCBzcGxpdCB0aGUgaW5jb21pbmcgcmVxdWVzdCBpbnRvIHRoYXQgbWFueSBzdWItcmVxdWVzdHNcbiAgICAvLyBhbmQgam9pbiB0aGVtIGFmdGVyd2FyZHNcbiAgICBpZiAodGhpcy5tYXhSYW5nZXMgPj0gc2xpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hTbGljZXMoc2xpY2VzLCBzaWduYWwpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5tYXhSYW5nZXMgPiAwICYmIHNsaWNlcy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBUT0RPOiBzcGxpdCBpbnRvIG11bHRpcGxlIG11bHRpLXJhbmdlIHJlcXVlc3RzXG5cbiAgICAgIC8vIGNvbnN0IHN1YlNsaWNlc1JlcXVlc3RzID0gW107XG4gICAgICAvLyBmb3IgKGxldCBpID0gMDsgaSA8IHNsaWNlcy5sZW5ndGg7IGkgKz0gdGhpcy5tYXhSYW5nZXMpIHtcbiAgICAgIC8vICAgc3ViU2xpY2VzUmVxdWVzdHMucHVzaChcbiAgICAgIC8vICAgICB0aGlzLmZldGNoU2xpY2VzKHNsaWNlcy5zbGljZShpLCBpICsgdGhpcy5tYXhSYW5nZXMpLCBzaWduYWwpLFxuICAgICAgLy8gICApO1xuICAgICAgLy8gfVxuICAgICAgLy8gcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChzdWJTbGljZXNSZXF1ZXN0cykpLmZsYXQoKTtcbiAgICB9XG5cbiAgICAvLyBvdGhlcndpc2UgbWFrZSBhIHNpbmdsZSByZXF1ZXN0IGZvciBlYWNoIHNsaWNlXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgc2xpY2VzLm1hcCgoc2xpY2UpID0+IHRoaXMuZmV0Y2hTbGljZShzbGljZSwgc2lnbmFsKSksXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGZldGNoU2xpY2VzKHNsaWNlcywgc2lnbmFsKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXF1ZXN0KHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgLi4udGhpcy5oZWFkZXJzLFxuICAgICAgICBSYW5nZTogYGJ5dGVzPSR7c2xpY2VzXG4gICAgICAgICAgLm1hcCgoeyBvZmZzZXQsIGxlbmd0aCB9KSA9PiBgJHtvZmZzZXR9LSR7b2Zmc2V0ICsgbGVuZ3RofWApXG4gICAgICAgICAgLmpvaW4oJywnKVxuICAgICAgICB9YCxcbiAgICAgIH0sXG4gICAgICBzaWduYWwsXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRhdGEuJyk7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwNikge1xuICAgICAgY29uc3QgeyB0eXBlLCBwYXJhbXMgfSA9IHBhcnNlQ29udGVudFR5cGUocmVzcG9uc2UuZ2V0SGVhZGVyKCdjb250ZW50LXR5cGUnKSk7XG4gICAgICBpZiAodHlwZSA9PT0gJ211bHRpcGFydC9ieXRlcmFuZ2VzJykge1xuICAgICAgICBjb25zdCBieXRlUmFuZ2VzID0gcGFyc2VCeXRlUmFuZ2VzKGF3YWl0IHJlc3BvbnNlLmdldERhdGEoKSwgcGFyYW1zLmJvdW5kYXJ5KTtcbiAgICAgICAgdGhpcy5fZmlsZVNpemUgPSBieXRlUmFuZ2VzWzBdLmZpbGVTaXplIHx8IG51bGw7XG4gICAgICAgIHJldHVybiBieXRlUmFuZ2VzO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuZ2V0RGF0YSgpO1xuXG4gICAgICBjb25zdCB7IHN0YXJ0LCBlbmQsIHRvdGFsIH0gPSBwYXJzZUNvbnRlbnRSYW5nZShyZXNwb25zZS5nZXRIZWFkZXIoJ2NvbnRlbnQtcmFuZ2UnKSk7XG4gICAgICB0aGlzLl9maWxlU2l6ZSA9IHRvdGFsIHx8IG51bGw7XG4gICAgICBjb25zdCBmaXJzdCA9IFt7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIG9mZnNldDogc3RhcnQsXG4gICAgICAgIGxlbmd0aDogZW5kIC0gc3RhcnQsXG4gICAgICB9XTtcblxuICAgICAgaWYgKHNsaWNlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIHdlIHJlcXVlc3RlZCBtb3JlIHRoYW4gb25lIHNsaWNlLCBidXQgZ290IG9ubHkgdGhlIGZpcnN0XG4gICAgICAgIC8vIHVuZm9ydHVuYXRlbHksIHNvbWUgSFRUUCBTZXJ2ZXJzIGRvbid0IHN1cHBvcnQgbXVsdGktcmFuZ2VzXG4gICAgICAgIC8vIGFuZCByZXR1cm4gb25seSB0aGUgZmlyc3RcblxuICAgICAgICAvLyBnZXQgdGhlIHJlc3Qgb2YgdGhlIHNsaWNlcyBhbmQgZmV0Y2ggdGhlbSBpdGVyYXRpdmVseVxuICAgICAgICBjb25zdCBvdGhlcnMgPSBhd2FpdCBQcm9taXNlLmFsbChzbGljZXMuc2xpY2UoMSkubWFwKChzbGljZSkgPT4gdGhpcy5mZXRjaFNsaWNlKHNsaWNlLCBzaWduYWwpKSk7XG4gICAgICAgIHJldHVybiBmaXJzdC5jb25jYXQob3RoZXJzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaXJzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmFsbG93RnVsbEZpbGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgcmVzcG9uZGVkIHdpdGggZnVsbCBmaWxlJyk7XG4gICAgICB9XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuZ2V0RGF0YSgpO1xuICAgICAgdGhpcy5fZmlsZVNpemUgPSBkYXRhLmJ5dGVMZW5ndGg7XG4gICAgICByZXR1cm4gW3tcbiAgICAgICAgZGF0YSxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICBsZW5ndGg6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgIH1dO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZldGNoU2xpY2Uoc2xpY2UsIHNpZ25hbCkge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCBsZW5ndGggfSA9IHNsaWNlO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5jbGllbnQucmVxdWVzdCh7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIC4uLnRoaXMuaGVhZGVycyxcbiAgICAgICAgUmFuZ2U6IGBieXRlcz0ke29mZnNldH0tJHtvZmZzZXQgKyBsZW5ndGh9YCxcbiAgICAgIH0sXG4gICAgICBzaWduYWwsXG4gICAgfSk7XG5cbiAgICAvLyBjaGVjayB0aGUgcmVzcG9uc2Ugd2FzIG9rYXkgYW5kIGlmIHRoZSBzZXJ2ZXIgYWN0dWFsbHkgdW5kZXJzdGFuZHMgcmFuZ2UgcmVxdWVzdHNcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRhdGEuJyk7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwNikge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmdldERhdGEoKTtcblxuICAgICAgY29uc3QgeyB0b3RhbCB9ID0gcGFyc2VDb250ZW50UmFuZ2UocmVzcG9uc2UuZ2V0SGVhZGVyKCdjb250ZW50LXJhbmdlJykpO1xuICAgICAgdGhpcy5fZmlsZVNpemUgPSB0b3RhbCB8fCBudWxsO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBsZW5ndGgsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuYWxsb3dGdWxsRmlsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciByZXNwb25kZWQgd2l0aCBmdWxsIGZpbGUnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmdldERhdGEoKTtcblxuICAgICAgdGhpcy5fZmlsZVNpemUgPSBkYXRhLmJ5dGVMZW5ndGg7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICAgIGxlbmd0aDogZGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBnZXQgZmlsZVNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGVTaXplO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlV3JhcEluQmxvY2tlZFNvdXJjZShzb3VyY2UsIHsgYmxvY2tTaXplLCBjYWNoZVNpemUgfSkge1xuICBpZiAoYmxvY2tTaXplID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuICByZXR1cm4gbmV3IEJsb2NrZWRTb3VyY2Uoc291cmNlLCB7IGJsb2NrU2l6ZSwgY2FjaGVTaXplIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUZldGNoU291cmNlKHVybCwgeyBoZWFkZXJzID0ge30sIGNyZWRlbnRpYWxzLCBtYXhSYW5nZXMgPSAwLCBhbGxvd0Z1bGxGaWxlID0gZmFsc2UsIC4uLmJsb2NrT3B0aW9ucyB9ID0ge30pIHtcbiAgY29uc3QgY2xpZW50ID0gbmV3IEZldGNoQ2xpZW50KHVybCwgY3JlZGVudGlhbHMpO1xuICBjb25zdCBzb3VyY2UgPSBuZXcgUmVtb3RlU291cmNlKGNsaWVudCwgaGVhZGVycywgbWF4UmFuZ2VzLCBhbGxvd0Z1bGxGaWxlKTtcbiAgcmV0dXJuIG1heWJlV3JhcEluQmxvY2tlZFNvdXJjZShzb3VyY2UsIGJsb2NrT3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlWEhSU291cmNlKHVybCwgeyBoZWFkZXJzID0ge30sIG1heFJhbmdlcyA9IDAsIGFsbG93RnVsbEZpbGUgPSBmYWxzZSwgLi4uYmxvY2tPcHRpb25zIH0gPSB7fSkge1xuICBjb25zdCBjbGllbnQgPSBuZXcgWEhSQ2xpZW50KHVybCk7XG4gIGNvbnN0IHNvdXJjZSA9IG5ldyBSZW1vdGVTb3VyY2UoY2xpZW50LCBoZWFkZXJzLCBtYXhSYW5nZXMsIGFsbG93RnVsbEZpbGUpO1xuICByZXR1cm4gbWF5YmVXcmFwSW5CbG9ja2VkU291cmNlKHNvdXJjZSwgYmxvY2tPcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VIdHRwU291cmNlKHVybCwgeyBoZWFkZXJzID0ge30sIG1heFJhbmdlcyA9IDAsIGFsbG93RnVsbEZpbGUgPSBmYWxzZSwgLi4uYmxvY2tPcHRpb25zIH0gPSB7fSkge1xuICBjb25zdCBjbGllbnQgPSBuZXcgSHR0cENsaWVudCh1cmwpO1xuICBjb25zdCBzb3VyY2UgPSBuZXcgUmVtb3RlU291cmNlKGNsaWVudCwgaGVhZGVycywgbWF4UmFuZ2VzLCBhbGxvd0Z1bGxGaWxlKTtcbiAgcmV0dXJuIG1heWJlV3JhcEluQmxvY2tlZFNvdXJjZShzb3VyY2UsIGJsb2NrT3B0aW9ucyk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmVtb3RlU291cmNlKHVybCwgeyBmb3JjZVhIUiA9IGZhbHNlLCAuLi5jbGllbnRPcHRpb25zIH0gPSB7fSkge1xuICBpZiAodHlwZW9mIGZldGNoID09PSAnZnVuY3Rpb24nICYmICFmb3JjZVhIUikge1xuICAgIHJldHVybiBtYWtlRmV0Y2hTb3VyY2UodXJsLCBjbGllbnRPcHRpb25zKTtcbiAgfVxuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBtYWtlWEhSU291cmNlKHVybCwgY2xpZW50T3B0aW9ucyk7XG4gIH1cbiAgcmV0dXJuIG1ha2VIdHRwU291cmNlKHVybCwgY2xpZW50T3B0aW9ucyk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKSB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNodW5rKGl0ZXJhYmxlLCBsZW5ndGgpIHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBjb25zdCBsZW5ndGhPZkl0ZXJhYmxlID0gaXRlcmFibGUubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aE9mSXRlcmFibGU7IGkgKz0gbGVuZ3RoKSB7XG4gICAgY29uc3QgY2h1bmtlZCA9IFtdO1xuICAgIGZvciAobGV0IGNpID0gaTsgY2kgPCBpICsgbGVuZ3RoOyBjaSsrKSB7XG4gICAgICBjaHVua2VkLnB1c2goaXRlcmFibGVbY2ldKTtcbiAgICB9XG4gICAgcmVzdWx0cy5wdXNoKGNodW5rZWQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kc1dpdGgoc3RyaW5nLCBleHBlY3RlZEVuZGluZykge1xuICBpZiAoc3RyaW5nLmxlbmd0aCA8IGV4cGVjdGVkRW5kaW5nLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBhY3R1YWxFbmRpbmcgPSBzdHJpbmcuc3Vic3RyKHN0cmluZy5sZW5ndGggLSBleHBlY3RlZEVuZGluZy5sZW5ndGgpO1xuICByZXR1cm4gYWN0dWFsRW5kaW5nID09PSBleHBlY3RlZEVuZGluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2goaXRlcmFibGUsIGZ1bmMpIHtcbiAgY29uc3QgeyBsZW5ndGggfSA9IGl0ZXJhYmxlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgZnVuYyhpdGVyYWJsZVtpXSwgaSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvbGRPYmopIHtcbiAgY29uc3QgbmV3T2JqID0ge307XG4gIGZvciAoY29uc3Qga2V5IGluIG9sZE9iaikge1xuICAgIGlmIChvbGRPYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBvbGRPYmpba2V5XTtcbiAgICAgIG5ld09ialt2YWx1ZV0gPSBrZXk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXdPYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYW5nZShuKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICByZXN1bHRzLnB1c2goaSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lcyhudW1UaW1lcywgZnVuYykge1xuICBjb25zdCByZXN1bHRzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVGltZXM7IGkrKykge1xuICAgIHJlc3VsdHMucHVzaChmdW5jKGkpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvQXJyYXkoaXRlcmFibGUpIHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBjb25zdCB7IGxlbmd0aCB9ID0gaXRlcmFibGU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHRzLnB1c2goaXRlcmFibGVbaV0pO1xuICB9XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9BcnJheVJlY3Vyc2l2ZWx5KGlucHV0KSB7XG4gIGlmIChpbnB1dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gdG9BcnJheShpbnB1dCkubWFwKHRvQXJyYXlSZWN1cnNpdmVseSk7XG4gIH1cbiAgcmV0dXJuIGlucHV0O1xufVxuXG4vLyBjb3BpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWNhZGVtaWEtZGUtY29kaWdvL3BhcnNlLWNvbnRlbnQtcmFuZ2UtaGVhZGVyL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb250ZW50UmFuZ2UoaGVhZGVyVmFsdWUpIHtcbiAgaWYgKCFoZWFkZXJWYWx1ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBoZWFkZXJWYWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXJndW1lbnQnKTtcbiAgfVxuXG4gIGNvbnN0IHBhcnNlSW50ID0gKG51bWJlcikgPT4gTnVtYmVyLnBhcnNlSW50KG51bWJlciwgMTApO1xuXG4gIC8vIENoZWNrIGZvciBwcmVzZW5jZSBvZiB1bml0XG4gIGxldCBtYXRjaGVzID0gaGVhZGVyVmFsdWUubWF0Y2goL14oXFx3KikgLyk7XG4gIGNvbnN0IHVuaXQgPSBtYXRjaGVzICYmIG1hdGNoZXNbMV07XG5cbiAgLy8gY2hlY2sgZm9yIHN0YXJ0LWVuZC9zaXplIGhlYWRlciBmb3JtYXRcbiAgbWF0Y2hlcyA9IGhlYWRlclZhbHVlLm1hdGNoKC8oXFxkKyktKFxcZCspXFwvKFxcZCt8XFwqKS8pO1xuICBpZiAobWF0Y2hlcykge1xuICAgIHJldHVybiB7XG4gICAgICB1bml0LFxuICAgICAgZmlyc3Q6IHBhcnNlSW50KG1hdGNoZXNbMV0pLFxuICAgICAgbGFzdDogcGFyc2VJbnQobWF0Y2hlc1syXSksXG4gICAgICBsZW5ndGg6IG1hdGNoZXNbM10gPT09ICcqJyA/IG51bGwgOiBwYXJzZUludChtYXRjaGVzWzNdKSxcbiAgICB9O1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIHNpemUgaGVhZGVyIGZvcm1hdFxuICBtYXRjaGVzID0gaGVhZGVyVmFsdWUubWF0Y2goLyhcXGQrfFxcKikvKTtcbiAgaWYgKG1hdGNoZXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdW5pdCxcbiAgICAgIGZpcnN0OiBudWxsLFxuICAgICAgbGFzdDogbnVsbCxcbiAgICAgIGxlbmd0aDogbWF0Y2hlc1sxXSA9PT0gJyonID8gbnVsbCA6IHBhcnNlSW50KG1hdGNoZXNbMV0pLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLypcbiAqIFByb21pc2lmaWVkIHdyYXBwZXIgYXJvdW5kICdzZXRUaW1lb3V0JyB0byBhbGxvdyAnYXdhaXQnXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YWl0KG1pbGxpc2Vjb25kcykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlzZWNvbmRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6aXAoYSwgYikge1xuICBjb25zdCBBID0gQXJyYXkuaXNBcnJheShhKSA/IGEgOiBBcnJheS5mcm9tKGEpO1xuICBjb25zdCBCID0gQXJyYXkuaXNBcnJheShiKSA/IGIgOiBBcnJheS5mcm9tKGIpO1xuICByZXR1cm4gQS5tYXAoKGssIGkpID0+IFtrLCBCW2ldXSk7XG59XG5cbi8vIEJhc2VkIG9uIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Vycm9yXG5leHBvcnQgY2xhc3MgQWJvcnRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgLy8gUGFzcyByZW1haW5pbmcgYXJndW1lbnRzIChpbmNsdWRpbmcgdmVuZG9yIHNwZWNpZmljIG9uZXMpIHRvIHBhcmVudCBjb25zdHJ1Y3RvclxuICAgIHN1cGVyKHBhcmFtcyk7XG5cbiAgICAvLyBNYWludGFpbnMgcHJvcGVyIHN0YWNrIHRyYWNlIGZvciB3aGVyZSBvdXIgZXJyb3Igd2FzIHRocm93biAob25seSBhdmFpbGFibGUgb24gVjgpXG4gICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBBYm9ydEVycm9yKTtcbiAgICB9XG5cbiAgICB0aGlzLm5hbWUgPSAnQWJvcnRFcnJvcic7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEN1c3RvbUFnZ3JlZ2F0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihlcnJvcnMsIG1lc3NhZ2UpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmVycm9ycyA9IGVycm9ycztcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMubmFtZSA9ICdBZ2dyZWdhdGVFcnJvcic7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEFnZ3JlZ2F0ZUVycm9yID0gQ3VzdG9tQWdncmVnYXRlRXJyb3I7XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBRdWlja0xSVSBleHRlbmRzIE1hcCB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHRpZiAoIShvcHRpb25zLm1heFNpemUgJiYgb3B0aW9ucy5tYXhTaXplID4gMCkpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2BtYXhTaXplYCBtdXN0IGJlIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwJyk7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm1heEFnZSA9PT0gJ251bWJlcicgJiYgb3B0aW9ucy5tYXhBZ2UgPT09IDApIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2BtYXhBZ2VgIG11c3QgYmUgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAnKTtcblx0XHR9XG5cblx0XHQvLyBUT0RPOiBVc2UgcHJpdmF0ZSBjbGFzcyBmaWVsZHMgd2hlbiBFU0xpbnQgc3VwcG9ydHMgdGhlbS5cblx0XHR0aGlzLm1heFNpemUgPSBvcHRpb25zLm1heFNpemU7XG5cdFx0dGhpcy5tYXhBZ2UgPSBvcHRpb25zLm1heEFnZSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cdFx0dGhpcy5vbkV2aWN0aW9uID0gb3B0aW9ucy5vbkV2aWN0aW9uO1xuXHRcdHRoaXMuY2FjaGUgPSBuZXcgTWFwKCk7XG5cdFx0dGhpcy5vbGRDYWNoZSA9IG5ldyBNYXAoKTtcblx0XHR0aGlzLl9zaXplID0gMDtcblx0fVxuXG5cdC8vIFRPRE86IFVzZSBwcml2YXRlIGNsYXNzIG1ldGhvZHMgd2hlbiB0YXJnZXRpbmcgTm9kZS5qcyAxNi5cblx0X2VtaXRFdmljdGlvbnMoY2FjaGUpIHtcblx0XHRpZiAodHlwZW9mIHRoaXMub25FdmljdGlvbiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgW2tleSwgaXRlbV0gb2YgY2FjaGUpIHtcblx0XHRcdHRoaXMub25FdmljdGlvbihrZXksIGl0ZW0udmFsdWUpO1xuXHRcdH1cblx0fVxuXG5cdF9kZWxldGVJZkV4cGlyZWQoa2V5LCBpdGVtKSB7XG5cdFx0aWYgKHR5cGVvZiBpdGVtLmV4cGlyeSA9PT0gJ251bWJlcicgJiYgaXRlbS5leHBpcnkgPD0gRGF0ZS5ub3coKSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLm9uRXZpY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGhpcy5vbkV2aWN0aW9uKGtleSwgaXRlbS52YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmRlbGV0ZShrZXkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF9nZXRPckRlbGV0ZUlmRXhwaXJlZChrZXksIGl0ZW0pIHtcblx0XHRjb25zdCBkZWxldGVkID0gdGhpcy5fZGVsZXRlSWZFeHBpcmVkKGtleSwgaXRlbSk7XG5cdFx0aWYgKGRlbGV0ZWQgPT09IGZhbHNlKSB7XG5cdFx0XHRyZXR1cm4gaXRlbS52YWx1ZTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0SXRlbVZhbHVlKGtleSwgaXRlbSkge1xuXHRcdHJldHVybiBpdGVtLmV4cGlyeSA/IHRoaXMuX2dldE9yRGVsZXRlSWZFeHBpcmVkKGtleSwgaXRlbSkgOiBpdGVtLnZhbHVlO1xuXHR9XG5cblx0X3BlZWsoa2V5LCBjYWNoZSkge1xuXHRcdGNvbnN0IGl0ZW0gPSBjYWNoZS5nZXQoa2V5KTtcblxuXHRcdHJldHVybiB0aGlzLl9nZXRJdGVtVmFsdWUoa2V5LCBpdGVtKTtcblx0fVxuXG5cdF9zZXQoa2V5LCB2YWx1ZSkge1xuXHRcdHRoaXMuY2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuXHRcdHRoaXMuX3NpemUrKztcblxuXHRcdGlmICh0aGlzLl9zaXplID49IHRoaXMubWF4U2l6ZSkge1xuXHRcdFx0dGhpcy5fc2l6ZSA9IDA7XG5cdFx0XHR0aGlzLl9lbWl0RXZpY3Rpb25zKHRoaXMub2xkQ2FjaGUpO1xuXHRcdFx0dGhpcy5vbGRDYWNoZSA9IHRoaXMuY2FjaGU7XG5cdFx0XHR0aGlzLmNhY2hlID0gbmV3IE1hcCgpO1xuXHRcdH1cblx0fVxuXG5cdF9tb3ZlVG9SZWNlbnQoa2V5LCBpdGVtKSB7XG5cdFx0dGhpcy5vbGRDYWNoZS5kZWxldGUoa2V5KTtcblx0XHR0aGlzLl9zZXQoa2V5LCBpdGVtKTtcblx0fVxuXG5cdCogX2VudHJpZXNBc2NlbmRpbmcoKSB7XG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIHRoaXMub2xkQ2FjaGUpIHtcblx0XHRcdGNvbnN0IFtrZXksIHZhbHVlXSA9IGl0ZW07XG5cdFx0XHRpZiAoIXRoaXMuY2FjaGUuaGFzKGtleSkpIHtcblx0XHRcdFx0Y29uc3QgZGVsZXRlZCA9IHRoaXMuX2RlbGV0ZUlmRXhwaXJlZChrZXksIHZhbHVlKTtcblx0XHRcdFx0aWYgKGRlbGV0ZWQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0eWllbGQgaXRlbTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLmNhY2hlKSB7XG5cdFx0XHRjb25zdCBba2V5LCB2YWx1ZV0gPSBpdGVtO1xuXHRcdFx0Y29uc3QgZGVsZXRlZCA9IHRoaXMuX2RlbGV0ZUlmRXhwaXJlZChrZXksIHZhbHVlKTtcblx0XHRcdGlmIChkZWxldGVkID09PSBmYWxzZSkge1xuXHRcdFx0XHR5aWVsZCBpdGVtO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldChrZXkpIHtcblx0XHRpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0Y29uc3QgaXRlbSA9IHRoaXMuY2FjaGUuZ2V0KGtleSk7XG5cblx0XHRcdHJldHVybiB0aGlzLl9nZXRJdGVtVmFsdWUoa2V5LCBpdGVtKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5vbGRDYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0Y29uc3QgaXRlbSA9IHRoaXMub2xkQ2FjaGUuZ2V0KGtleSk7XG5cdFx0XHRpZiAodGhpcy5fZGVsZXRlSWZFeHBpcmVkKGtleSwgaXRlbSkgPT09IGZhbHNlKSB7XG5cdFx0XHRcdHRoaXMuX21vdmVUb1JlY2VudChrZXksIGl0ZW0pO1xuXHRcdFx0XHRyZXR1cm4gaXRlbS52YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZXQoa2V5LCB2YWx1ZSwge21heEFnZSA9IHRoaXMubWF4QWdlfSA9IHt9KSB7XG5cdFx0Y29uc3QgZXhwaXJ5ID1cblx0XHRcdHR5cGVvZiBtYXhBZ2UgPT09ICdudW1iZXInICYmIG1heEFnZSAhPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZID9cblx0XHRcdFx0RGF0ZS5ub3coKSArIG1heEFnZSA6XG5cdFx0XHRcdHVuZGVmaW5lZDtcblx0XHRpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0dGhpcy5jYWNoZS5zZXQoa2V5LCB7XG5cdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRleHBpcnlcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9zZXQoa2V5LCB7dmFsdWUsIGV4cGlyeX0pO1xuXHRcdH1cblx0fVxuXG5cdGhhcyhrZXkpIHtcblx0XHRpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuICF0aGlzLl9kZWxldGVJZkV4cGlyZWQoa2V5LCB0aGlzLmNhY2hlLmdldChrZXkpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5vbGRDYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuICF0aGlzLl9kZWxldGVJZkV4cGlyZWQoa2V5LCB0aGlzLm9sZENhY2hlLmdldChrZXkpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwZWVrKGtleSkge1xuXHRcdGlmICh0aGlzLmNhY2hlLmhhcyhrZXkpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fcGVlayhrZXksIHRoaXMuY2FjaGUpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm9sZENhY2hlLmhhcyhrZXkpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fcGVlayhrZXksIHRoaXMub2xkQ2FjaGUpO1xuXHRcdH1cblx0fVxuXG5cdGRlbGV0ZShrZXkpIHtcblx0XHRjb25zdCBkZWxldGVkID0gdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcblx0XHRpZiAoZGVsZXRlZCkge1xuXHRcdFx0dGhpcy5fc2l6ZS0tO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm9sZENhY2hlLmRlbGV0ZShrZXkpIHx8IGRlbGV0ZWQ7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmNhY2hlLmNsZWFyKCk7XG5cdFx0dGhpcy5vbGRDYWNoZS5jbGVhcigpO1xuXHRcdHRoaXMuX3NpemUgPSAwO1xuXHR9XG5cblx0cmVzaXplKG5ld1NpemUpIHtcblx0XHRpZiAoIShuZXdTaXplICYmIG5ld1NpemUgPiAwKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignYG1heFNpemVgIG11c3QgYmUgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAnKTtcblx0XHR9XG5cblx0XHRjb25zdCBpdGVtcyA9IFsuLi50aGlzLl9lbnRyaWVzQXNjZW5kaW5nKCldO1xuXHRcdGNvbnN0IHJlbW92ZUNvdW50ID0gaXRlbXMubGVuZ3RoIC0gbmV3U2l6ZTtcblx0XHRpZiAocmVtb3ZlQ291bnQgPCAwKSB7XG5cdFx0XHR0aGlzLmNhY2hlID0gbmV3IE1hcChpdGVtcyk7XG5cdFx0XHR0aGlzLm9sZENhY2hlID0gbmV3IE1hcCgpO1xuXHRcdFx0dGhpcy5fc2l6ZSA9IGl0ZW1zLmxlbmd0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHJlbW92ZUNvdW50ID4gMCkge1xuXHRcdFx0XHR0aGlzLl9lbWl0RXZpY3Rpb25zKGl0ZW1zLnNsaWNlKDAsIHJlbW92ZUNvdW50KSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub2xkQ2FjaGUgPSBuZXcgTWFwKGl0ZW1zLnNsaWNlKHJlbW92ZUNvdW50KSk7XG5cdFx0XHR0aGlzLmNhY2hlID0gbmV3IE1hcCgpO1xuXHRcdFx0dGhpcy5fc2l6ZSA9IDA7XG5cdFx0fVxuXG5cdFx0dGhpcy5tYXhTaXplID0gbmV3U2l6ZTtcblx0fVxuXG5cdCoga2V5cygpIHtcblx0XHRmb3IgKGNvbnN0IFtrZXldIG9mIHRoaXMpIHtcblx0XHRcdHlpZWxkIGtleTtcblx0XHR9XG5cdH1cblxuXHQqIHZhbHVlcygpIHtcblx0XHRmb3IgKGNvbnN0IFssIHZhbHVlXSBvZiB0aGlzKSB7XG5cdFx0XHR5aWVsZCB2YWx1ZTtcblx0XHR9XG5cdH1cblxuXHQqIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuXHRcdGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLmNhY2hlKSB7XG5cdFx0XHRjb25zdCBba2V5LCB2YWx1ZV0gPSBpdGVtO1xuXHRcdFx0Y29uc3QgZGVsZXRlZCA9IHRoaXMuX2RlbGV0ZUlmRXhwaXJlZChrZXksIHZhbHVlKTtcblx0XHRcdGlmIChkZWxldGVkID09PSBmYWxzZSkge1xuXHRcdFx0XHR5aWVsZCBba2V5LCB2YWx1ZS52YWx1ZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIHRoaXMub2xkQ2FjaGUpIHtcblx0XHRcdGNvbnN0IFtrZXksIHZhbHVlXSA9IGl0ZW07XG5cdFx0XHRpZiAoIXRoaXMuY2FjaGUuaGFzKGtleSkpIHtcblx0XHRcdFx0Y29uc3QgZGVsZXRlZCA9IHRoaXMuX2RlbGV0ZUlmRXhwaXJlZChrZXksIHZhbHVlKTtcblx0XHRcdFx0aWYgKGRlbGV0ZWQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0eWllbGQgW2tleSwgdmFsdWUudmFsdWVdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0KiBlbnRyaWVzRGVzY2VuZGluZygpIHtcblx0XHRsZXQgaXRlbXMgPSBbLi4udGhpcy5jYWNoZV07XG5cdFx0Zm9yIChsZXQgaSA9IGl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG5cdFx0XHRjb25zdCBpdGVtID0gaXRlbXNbaV07XG5cdFx0XHRjb25zdCBba2V5LCB2YWx1ZV0gPSBpdGVtO1xuXHRcdFx0Y29uc3QgZGVsZXRlZCA9IHRoaXMuX2RlbGV0ZUlmRXhwaXJlZChrZXksIHZhbHVlKTtcblx0XHRcdGlmIChkZWxldGVkID09PSBmYWxzZSkge1xuXHRcdFx0XHR5aWVsZCBba2V5LCB2YWx1ZS52YWx1ZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aXRlbXMgPSBbLi4udGhpcy5vbGRDYWNoZV07XG5cdFx0Zm9yIChsZXQgaSA9IGl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG5cdFx0XHRjb25zdCBpdGVtID0gaXRlbXNbaV07XG5cdFx0XHRjb25zdCBba2V5LCB2YWx1ZV0gPSBpdGVtO1xuXHRcdFx0aWYgKCF0aGlzLmNhY2hlLmhhcyhrZXkpKSB7XG5cdFx0XHRcdGNvbnN0IGRlbGV0ZWQgPSB0aGlzLl9kZWxldGVJZkV4cGlyZWQoa2V5LCB2YWx1ZSk7XG5cdFx0XHRcdGlmIChkZWxldGVkID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdHlpZWxkIFtrZXksIHZhbHVlLnZhbHVlXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdCogZW50cmllc0FzY2VuZGluZygpIHtcblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLl9lbnRyaWVzQXNjZW5kaW5nKCkpIHtcblx0XHRcdHlpZWxkIFtrZXksIHZhbHVlLnZhbHVlXTtcblx0XHR9XG5cdH1cblxuXHRnZXQgc2l6ZSgpIHtcblx0XHRpZiAoIXRoaXMuX3NpemUpIHtcblx0XHRcdHJldHVybiB0aGlzLm9sZENhY2hlLnNpemU7XG5cdFx0fVxuXG5cdFx0bGV0IG9sZENhY2hlU2l6ZSA9IDA7XG5cdFx0Zm9yIChjb25zdCBrZXkgb2YgdGhpcy5vbGRDYWNoZS5rZXlzKCkpIHtcblx0XHRcdGlmICghdGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0XHRvbGRDYWNoZVNpemUrKztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gTWF0aC5taW4odGhpcy5fc2l6ZSArIG9sZENhY2hlU2l6ZSwgdGhpcy5tYXhTaXplKTtcblx0fVxuXG5cdGVudHJpZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZW50cmllc0FzY2VuZGluZygpO1xuXHR9XG5cblx0Zm9yRWFjaChjYWxsYmFja0Z1bmN0aW9uLCB0aGlzQXJndW1lbnQgPSB0aGlzKSB7XG5cdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzQXNjZW5kaW5nKCkpIHtcblx0XHRcdGNhbGxiYWNrRnVuY3Rpb24uY2FsbCh0aGlzQXJndW1lbnQsIHZhbHVlLCBrZXksIHRoaXMpO1xuXHRcdH1cblx0fVxuXG5cdGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoWy4uLnRoaXMuZW50cmllc0FzY2VuZGluZygpXSk7XG5cdH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5mID0ge307XG4vLyBUaGlzIGZpbGUgY29udGFpbnMgb25seSB0aGUgZW50cnkgY2h1bmsuXG4vLyBUaGUgY2h1bmsgbG9hZGluZyBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBjaHVua3Ncbl9fd2VicGFja19yZXF1aXJlX18uZSA9IChjaHVua0lkKSA9PiB7XG5cdHJldHVybiBQcm9taXNlLmFsbChPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLmYpLnJlZHVjZSgocHJvbWlzZXMsIGtleSkgPT4ge1xuXHRcdF9fd2VicGFja19yZXF1aXJlX18uZltrZXldKGNodW5rSWQsIHByb21pc2VzKTtcblx0XHRyZXR1cm4gcHJvbWlzZXM7XG5cdH0sIFtdKSk7XG59OyIsIi8vIFRoaXMgZnVuY3Rpb24gYWxsb3cgdG8gcmVmZXJlbmNlIGFzeW5jIGNodW5rc1xuX193ZWJwYWNrX3JlcXVpcmVfXy51ID0gKGNodW5rSWQpID0+IHtcblx0Ly8gcmV0dXJuIHVybCBmb3IgZmlsZW5hbWVzIGJhc2VkIG9uIHRlbXBsYXRlXG5cdHJldHVybiBcIlwiICsgY2h1bmtJZCArIFwiLmJ1bmRsZS5qc1wiO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCJ2YXIgaW5Qcm9ncmVzcyA9IHt9O1xudmFyIGRhdGFXZWJwYWNrUHJlZml4ID0gXCJnZW9sb2d5LXZyOlwiO1xuLy8gbG9hZFNjcmlwdCBmdW5jdGlvbiB0byBsb2FkIGEgc2NyaXB0IHZpYSBzY3JpcHQgdGFnXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmwgPSAodXJsLCBkb25lLCBrZXksIGNodW5rSWQpID0+IHtcblx0aWYoaW5Qcm9ncmVzc1t1cmxdKSB7IGluUHJvZ3Jlc3NbdXJsXS5wdXNoKGRvbmUpOyByZXR1cm47IH1cblx0dmFyIHNjcmlwdCwgbmVlZEF0dGFjaDtcblx0aWYoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcyA9IHNjcmlwdHNbaV07XG5cdFx0XHRpZihzLmdldEF0dHJpYnV0ZShcInNyY1wiKSA9PSB1cmwgfHwgcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIikgPT0gZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpIHsgc2NyaXB0ID0gczsgYnJlYWs7IH1cblx0XHR9XG5cdH1cblx0aWYoIXNjcmlwdCkge1xuXHRcdG5lZWRBdHRhY2ggPSB0cnVlO1xuXHRcdHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG5cdFx0c2NyaXB0LmNoYXJzZXQgPSAndXRmLTgnO1xuXHRcdHNjcmlwdC50aW1lb3V0ID0gMTIwO1xuXHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm5jKSB7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgX193ZWJwYWNrX3JlcXVpcmVfXy5uYyk7XG5cdFx0fVxuXHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIiwgZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpO1xuXG5cdFx0c2NyaXB0LnNyYyA9IHVybDtcblx0fVxuXHRpblByb2dyZXNzW3VybF0gPSBbZG9uZV07XG5cdHZhciBvblNjcmlwdENvbXBsZXRlID0gKHByZXYsIGV2ZW50KSA9PiB7XG5cdFx0Ly8gYXZvaWQgbWVtIGxlYWtzIGluIElFLlxuXHRcdHNjcmlwdC5vbmVycm9yID0gc2NyaXB0Lm9ubG9hZCA9IG51bGw7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdHZhciBkb25lRm5zID0gaW5Qcm9ncmVzc1t1cmxdO1xuXHRcdGRlbGV0ZSBpblByb2dyZXNzW3VybF07XG5cdFx0c2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcblx0XHRkb25lRm5zICYmIGRvbmVGbnMuZm9yRWFjaCgoZm4pID0+IChmbihldmVudCkpKTtcblx0XHRpZihwcmV2KSByZXR1cm4gcHJldihldmVudCk7XG5cdH1cblx0dmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCB1bmRlZmluZWQsIHsgdHlwZTogJ3RpbWVvdXQnLCB0YXJnZXQ6IHNjcmlwdCB9KSwgMTIwMDAwKTtcblx0c2NyaXB0Lm9uZXJyb3IgPSBvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgc2NyaXB0Lm9uZXJyb3IpO1xuXHRzY3JpcHQub25sb2FkID0gb25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHNjcmlwdC5vbmxvYWQpO1xuXHRuZWVkQXR0YWNoICYmIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn07IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjO1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHtcblx0XHRcdHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxO1xuXHRcdFx0d2hpbGUgKGkgPiAtMSAmJiAhc2NyaXB0VXJsKSBzY3JpcHRVcmwgPSBzY3JpcHRzW2ktLV0uc3JjO1xuXHRcdH1cblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmYuaiA9IChjaHVua0lkLCBwcm9taXNlcykgPT4ge1xuXHRcdC8vIEpTT05QIGNodW5rIGxvYWRpbmcgZm9yIGphdmFzY3JpcHRcblx0XHR2YXIgaW5zdGFsbGVkQ2h1bmtEYXRhID0gX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgPyBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gOiB1bmRlZmluZWQ7XG5cdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhICE9PSAwKSB7IC8vIDAgbWVhbnMgXCJhbHJlYWR5IGluc3RhbGxlZFwiLlxuXG5cdFx0XHQvLyBhIFByb21pc2UgbWVhbnMgXCJjdXJyZW50bHkgbG9hZGluZ1wiLlxuXHRcdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhKSB7XG5cdFx0XHRcdHByb21pc2VzLnB1c2goaW5zdGFsbGVkQ2h1bmtEYXRhWzJdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmKHRydWUpIHsgLy8gYWxsIGNodW5rcyBoYXZlIEpTXG5cdFx0XHRcdFx0Ly8gc2V0dXAgUHJvbWlzZSBpbiBjaHVuayBjYWNoZVxuXHRcdFx0XHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gKGluc3RhbGxlZENodW5rRGF0YSA9IGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IFtyZXNvbHZlLCByZWplY3RdKSk7XG5cdFx0XHRcdFx0cHJvbWlzZXMucHVzaChpbnN0YWxsZWRDaHVua0RhdGFbMl0gPSBwcm9taXNlKTtcblxuXHRcdFx0XHRcdC8vIHN0YXJ0IGNodW5rIGxvYWRpbmdcblx0XHRcdFx0XHR2YXIgdXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgX193ZWJwYWNrX3JlcXVpcmVfXy51KGNodW5rSWQpO1xuXHRcdFx0XHRcdC8vIGNyZWF0ZSBlcnJvciBiZWZvcmUgc3RhY2sgdW53b3VuZCB0byBnZXQgdXNlZnVsIHN0YWNrdHJhY2UgbGF0ZXJcblx0XHRcdFx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcblx0XHRcdFx0XHR2YXIgbG9hZGluZ0VuZGVkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSkge1xuXHRcdFx0XHRcdFx0XHRpbnN0YWxsZWRDaHVua0RhdGEgPSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF07XG5cdFx0XHRcdFx0XHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSAhPT0gMCkgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRpZihpbnN0YWxsZWRDaHVua0RhdGEpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3JUeXBlID0gZXZlbnQgJiYgKGV2ZW50LnR5cGUgPT09ICdsb2FkJyA/ICdtaXNzaW5nJyA6IGV2ZW50LnR5cGUpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciByZWFsU3JjID0gZXZlbnQgJiYgZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5zcmM7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IubWVzc2FnZSA9ICdMb2FkaW5nIGNodW5rICcgKyBjaHVua0lkICsgJyBmYWlsZWQuXFxuKCcgKyBlcnJvclR5cGUgKyAnOiAnICsgcmVhbFNyYyArICcpJztcblx0XHRcdFx0XHRcdFx0XHRlcnJvci5uYW1lID0gJ0NodW5rTG9hZEVycm9yJztcblx0XHRcdFx0XHRcdFx0XHRlcnJvci50eXBlID0gZXJyb3JUeXBlO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9yLnJlcXVlc3QgPSByZWFsU3JjO1xuXHRcdFx0XHRcdFx0XHRcdGluc3RhbGxlZENodW5rRGF0YVsxXShlcnJvcik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubCh1cmwsIGxvYWRpbmdFbmRlZCwgXCJjaHVuay1cIiArIGNodW5rSWQsIGNodW5rSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxufTtcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuLy8gbm8gb24gY2h1bmtzIGxvYWRlZFxuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblxufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua2dlb2xvZ3lfdnJcIl0gPSBzZWxmW1wid2VicGFja0NodW5rZ2VvbG9neV92clwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiLy8gaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xyXG4vLyBpbXBvcnQge1RleHR9IGZyb20gJ3Ryb2lrYS10aHJlZS10ZXh0J1xyXG4vLyBpbXBvcnQgeyBWUkJ1dHRvbiB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS93ZWJ4ci9WUkJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IGZyb21VcmwgIH0gZnJvbSBcImdlb3RpZmZcIjtcclxuXHJcbmNvbnN0IENSUyA9ICdFUFNHOjMyNjMyJ1xyXG5jb25zdCB4ID0gNTgwMjM5XHJcbmNvbnN0IHkgPSA0OTE3MTIwXHJcbmNvbnN0IHdpZHRoID0gMTIwXHJcbmNvbnN0IGhlaWdodCA9IDEwMFxyXG5jb25zdCBtUGVyUGl4ZWwgPSAyMFxyXG5cclxuLy8gbGV0IG15VXJsID0gJ2h0dHA6Ly93bXMucGNuLm1pbmFtYmllbnRlLml0L29nYz9tYXA9L21zX29nYy9XTVNfdjEuMy9yYXN0ZXIvRFRNXzIwTS5tYXAnICsgXHJcbi8vICAgICAnJlNFUlZJQ0U9V01TJyArXHJcbi8vICAgICAnJlZFUlNJT049MS4zLjAnICsgXHJcbi8vICAgICAnJlJFUVVFU1Q9R2V0TWFwJyArXHJcbi8vICAgICAnJkJCT1g9JyArIGVuY29kZVVSSUNvbXBvbmVudChbKHggLSB3aWR0aCAvIDIgKiBtUGVyUGl4ZWwpLCh5IC0gaGVpZ2h0IC8gMiAqIG1QZXJQaXhlbCksKHggKyB3aWR0aCAvIDIgKiBtUGVyUGl4ZWwpLCh5ICsgaGVpZ2h0IC8gMiAqIG1QZXJQaXhlbCldLmpvaW4oJywnKSkgK1xyXG4vLyAgICAgJyZDUlM9JyArIGVuY29kZVVSSUNvbXBvbmVudChDUlMpICtcclxuLy8gICAgICcmV0lEVEg9JyArIHdpZHRoICtcclxuLy8gICAgICcmSEVJR0hUPScgKyBoZWlnaHQgK1xyXG4vLyAgICAgJyZMQVlFUlM9RUwuRFRNLjIwTScgK1xyXG4vLyAgICAgJyZTVFlMRVM9JyArXHJcbi8vICAgICAnJkZPUk1BVD1pbWFnZSUyRnBuZycgK1xyXG4vLyAgICAgJyZEUEk9OTYnICtcclxuLy8gICAgICcmTUFQX1JFU09MVVRJT049OTYnICtcclxuLy8gICAgICcmRk9STUFUX09QVElPTlM9ZHBpJTNBOTYnICtcclxuLy8gICAgICcmVFJBTlNQQVJFTlQ9VFJVRSdcclxuXHJcbmxldCBXQ1N1cmwgPSAnaHR0cHM6Ly90aW5pdGFseS5waS5pbmd2Lml0L1RJTkl0YWx5XzFfMS93Y3M/JyArXHJcbiAgICAnU0VSVklDRT1XQ1MnICtcclxuICAgICcmVkVSU0lPTj0xLjAuMCcgK1xyXG4gICAgJyZSRVFVRVNUPUdldENvdmVyYWdlJyArXHJcbiAgICAnJkZPUk1BVD1HZW9USUZGJyArXHJcbiAgICAnJkNPVkVSQUdFPVRJTkl0YWx5XzFfMTp0aW5pdGFseV9kZW0nICtcclxuICAgICcmQkJPWD0nICsgWyh4IC0gd2lkdGggLyAyICogbVBlclBpeGVsKSwoeSAtIGhlaWdodCAvIDIgKiBtUGVyUGl4ZWwpLCh4ICsgd2lkdGggLyAyICogbVBlclBpeGVsKSwoeSArIGhlaWdodCAvIDIgKiBtUGVyUGl4ZWwpXS5qb2luKCcsJykgK1xyXG4gICAgJyZDUlM9JyArIENSUyArXHJcbiAgICAnJlJFU1BPTlNFX0NSUz0nICsgQ1JTICtcclxuICAgICcmV0lEVEg9Jysgd2lkdGggK1xyXG4gICAgJyZIRUlHSFQ9JyArIGhlaWdodFxyXG5cclxuLy8gbGV0IFdDU3VybCA9ICdodHRwczovL3dtcy5wY24ubWluYW1iaWVudGUuaXQvd2NzL2R0bV8yMG0/JyArIFxyXG4vLyAnJlNFUlZJQ0U9V0NTJyArXHJcbi8vICcmVkVSU0lPTj0xLjAuMCcgKyBcclxuLy8gJyZSRVFVRVNUPUdldENvdmVyYWdlJyArXHJcbi8vICcmRk9STUFUPUdFT1RJRkYnICtcclxuLy8gJyZDT1ZFUkFHRT1FTC5EVE0uMjBNJyArXHJcbi8vICcmQkJPWD0nICsgWyh4IC0gd2lkdGggLyAyICogbVBlclBpeGVsKSwoeSAtIGhlaWdodCAvIDIgKiBtUGVyUGl4ZWwpLCh4ICsgd2lkdGggLyAyICogbVBlclBpeGVsKSwoeSArIGhlaWdodCAvIDIgKiBtUGVyUGl4ZWwpXS5qb2luKCcsJykgK1xyXG4vLyAnJkNSUz0nICsgQ1JTICtcclxuLy8gJyZSRVNQT05TRV9DUlM9JyArIENSUyArXHJcbi8vICcmV0lEVEg9JyArIHdpZHRoICtcclxuLy8gJyZIRUlHSFQ9JyArIGhlaWdodFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZERFTSgpIHtcclxuICAgIGNvbnN0IG15R2VvVElGRiA9IGF3YWl0IGZyb21VcmwoV0NTdXJsLCB7YWxsb3dGdWxsRmlsZTogdHJ1ZX0pXHJcbiAgICBjb25zdCBteUdlb1RJRkZJbWFnZSA9IGF3YWl0IG15R2VvVElGRi5nZXRJbWFnZSgpXHJcbiAgICBjb25zdCBteVJhc3RlciA9IGF3YWl0IG15R2VvVElGRkltYWdlLnJlYWRSYXN0ZXJzKClcclxuICAgIGNvbnNvbGUubG9nKG15UmFzdGVyKVxyXG59XHJcblxyXG5jb25zdCBteUEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxyXG5teUEuaHJlZiA9IFdDU3VybFxyXG5teUEuaW5uZXJUZXh0ID0gXCJWYWlcIlxyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG15QSlcclxuXHJcbmxvYWRERU0oKVxyXG5cclxuXHJcbi8vIGNvbnN0IG15VXJsQSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXHJcbi8vIG15VXJsQS5ocmVmID0gV0NTdXJsXHJcbi8vIG15VXJsQS5pbm5lclRleHQgPSAnVmFpJ1xyXG4vLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG15VXJsQSlcclxuXHJcbi8vIC8vIENyZWF0ZSB0aGUgc2NlbmVcclxuLy8gY29uc3Qgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbi8vIC8vIENyZWF0ZSB0aGUgY2FtZXJhXHJcbi8vIGNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpXHJcbi8vIHNjZW5lLmFkZChjYW1lcmEpXHJcblxyXG4vLyAvLyBDcmVhdGUgdGhlIHJlbmRlcmVyIGFuZCBlbmFibGUgWFJcclxuLy8gY29uc3QgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xyXG4vLyByZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCowLjk5LCB3aW5kb3cuaW5uZXJIZWlnaHQqMC45OSApO1xyXG4vLyByZW5kZXJlci54ci5lbmFibGVkID0gdHJ1ZTtcclxuXHJcbi8vIC8vIEFwcGVuZCB0aGUgcmVuZGVyZXIgYW5kIHRoZSBWUiBidXR0b24gdG8gdGhlIHBhZ2VcclxuLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xyXG4vLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBWUkJ1dHRvbi5jcmVhdGVCdXR0b24oIHJlbmRlcmVyICkgKTtcclxuXHJcbi8vIC8vIFJlbmRlcmluZyBsb29wXHJcbi8vIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuLy8gICBjb25zdCBteVhSc2Vzc2lvbiA9IHJlbmRlcmVyLnhyLmdldFNlc3Npb24oKTtcclxuXHJcbi8vICAgaWYgKG15WFJzZXNzaW9uKSB7XHJcblxyXG4vLyAgICAgbXlYUnNlc3Npb24uaW5wdXRTb3VyY2VzLmZvckVhY2goKG15U291cmNlLCBpKSA9PiB7XHJcblxyXG4vLyAgICAgICBpZiAobXlTb3VyY2UuZ2FtZXBhZCkge1xyXG4vLyAgICAgICAgIG15U291cmNlLmdhbWVwYWQuYXhlcy5mb3JFYWNoKChheGlzVmFsdWUsIGopID0+IHtcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgICAgIG15U291cmNlLmdhbWVwYWQuYnV0dG9ucy5mb3JFYWNoKChteUJ1dHRvbiwgaykgPT4ge1xyXG4vLyAgICAgICAgIH0pXHJcbi8vICAgICAgIH1cclxuLy8gICAgIH0pXHJcblxyXG4gICAgXHJcblxyXG4vLyAgIH1cclxuXHJcbi8vICAgcmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgY2FtZXJhICk7XHJcbi8vIH1cclxuXHJcbi8vIHJlbmRlcmVyLnNldEFuaW1hdGlvbkxvb3AocmVuZGVyKSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==