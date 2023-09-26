var Module = typeof Module !== 'undefined' ? Module : {};
var objAssign = Object.assign;
var moduleOverrides = objAssign({}, Module);
var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}
var read_, readAsync, readBinary, setWindowTitle;
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  err('exiting due to exception: ' + toLog);
}
var fs;
var nodePath;
var requireNodeFS;
if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }
  requireNodeFS = () => {
    if (!nodePath) {
      fs = require('fs');
      nodePath = require('path');
    }
  };
  read_ = function shell_read(filename, binary) {
    requireNodeFS();
    filename = nodePath['normalize'](filename);
    return fs.readFileSync(filename, binary ? null : 'utf8');
  };
  readBinary = filename => {
    var ret = read_(filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    return ret;
  };
  readAsync = (filename, onload, onerror) => {
    requireNodeFS();
    filename = nodePath['normalize'](filename);
    fs.readFile(filename, function (err, data) {
      if (err) onerror(err);
      else onload(data.buffer);
    });
  };
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }
  arguments_ = process['argv'].slice(2);
  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }
  process['on']('uncaughtException', function (ex) {
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  process['on']('unhandledRejection', function (reason) {
    throw reason;
  });
  quit_ = (status, toThrow) => {
    if (keepRuntimeAlive()) {
      process['exitCode'] = status;
      throw toThrow;
    }
    logExceptionOnExit(toThrow);
    process['exit'](status);
  };
  Module['inspect'] = function () {
    return '[Emscripten Module object]';
  };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
  } else {
    scriptDirectory = '';
  }
  {
    read_ = url => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    };
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = url => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      };
    }
    readAsync = (url, onload, onerror) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          onload(xhr.response);
          return;
        }
        onerror();
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };
  }
  setWindowTitle = title => (document.title = title);
} else {
}
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);
objAssign(Module, moduleOverrides);
moduleOverrides = null;
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];
function convertJsFunctionToWasm(func, sig) {
  if (typeof WebAssembly.Function === 'function') {
    var typeNames = { i: 'i32', j: 'i64', f: 'f32', d: 'f64' };
    var type = {
      parameters: [],
      results: sig[0] == 'v' ? [] : [typeNames[sig[0]]],
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }
  var typeSection = [1, 0, 1, 96];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = { i: 127, j: 126, f: 125, d: 124 };
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }
  if (sigRet == 'v') {
    typeSection.push(0);
  } else {
    typeSection = typeSection.concat([1, typeCodes[sigRet]]);
  }
  typeSection[1] = typeSection.length - 2;
  var bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0].concat(typeSection, [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]));
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, { e: { f: func } });
  var wrappedFunc = instance.exports['f'];
  return wrappedFunc;
}
var freeTableIndexes = [];
var functionsInTableMap;
function getEmptyTableSlot() {
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}
function updateTableMap(offset, count) {
  for (var i = offset; i < offset + count; i++) {
    var item = getWasmTableEntry(i);
    if (item) {
      functionsInTableMap.set(item, i);
    }
  }
}
function addFunction(func, sig) {
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    updateTableMap(0, wasmTable.length);
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }
  var ret = getEmptyTableSlot();
  try {
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }
  functionsInTableMap.set(func, ret);
  return ret;
}
var tempRet0 = 0;
var setTempRet0 = value => {
  tempRet0 = value;
};
var getTempRet0 = () => tempRet0;
var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;
if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}
function setValue(ptr, value, type = 'i8', noSafe) {
  if (type.charAt(type.length - 1) === '*') type = 'i32';
  switch (type) {
    case 'i1':
      HEAP8[ptr >> 0] = value;
      break;
    case 'i8':
      HEAP8[ptr >> 0] = value;
      break;
    case 'i16':
      HEAP16[ptr >> 1] = value;
      break;
    case 'i32':
      HEAP32[ptr >> 2] = value;
      break;
    case 'i64':
      (tempI64 = [
        value >>> 0,
        ((tempDouble = value),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case 'float':
      HEAPF32[ptr >> 2] = value;
      break;
    case 'double':
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort('invalid type for setValue: ' + type);
  }
}
function getValue(ptr, type = 'i8', noSafe) {
  if (type.charAt(type.length - 1) === '*') type = 'i32';
  switch (type) {
    case 'i1':
      return HEAP8[ptr >> 0];
    case 'i8':
      return HEAP8[ptr >> 0];
    case 'i16':
      return HEAP16[ptr >> 1];
    case 'i32':
      return HEAP32[ptr >> 2];
    case 'i64':
      return HEAP32[ptr >> 2];
    case 'float':
      return HEAPF32[ptr >> 2];
    case 'double':
      return Number(HEAPF64[ptr >> 3]);
    default:
      abort('invalid type for getValue: ' + type);
  }
  return null;
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;
function assert(condition, text) {
  if (!condition) {
    abort(text);
  }
}
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
function allocate(slab, dummyType, allocator) {
  var ret;
  if (typeof dummyType === 'number') {
    allocator = dummyType;
  }
  if (allocator == ALLOC_STACK) {
    if (typeof slab === 'number') {
      ret = stackAlloc(slab);
      return ret;
    }
    ret = stackAlloc(slab.length);
  } else {
    if (typeof slab === 'number') {
      ret = _malloc(slab);
      return ret;
    }
    ret = _malloc(slab.length);
  }
  if (slab.subarray || slab.slice) {
    HEAPU8.set(slab, ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}
var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    while (idx < endPtr) {
      var u0 = heap[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heap[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = heap[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
  }
  return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    }
  }
  heap[outIdx] = 0;
  return outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
    if (u <= 127) ++len;
    else if (u <= 2047) len += 2;
    else if (u <= 65535) len += 3;
    else len += 4;
  }
  return len;
}
var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;
  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(ptr + i * 2) >> 1];
      if (codeUnit == 0) break;
      str += String.fromCharCode(codeUnit);
    }
    return str;
  }
}
function stringToUTF16(str, outPtr, maxBytesToWrite) {
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 2147483647;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2;
  var startPtr = outPtr;
  var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    var codeUnit = str.charCodeAt(i);
    HEAP16[outPtr >> 1] = codeUnit;
    outPtr += 2;
  }
  HEAP16[outPtr >> 1] = 0;
  return outPtr - startPtr;
}
function lengthBytesUTF16(str) {
  return str.length * 2;
}
function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;
  var str = '';
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(ptr + i * 4) >> 2];
    if (utf32 == 0) break;
    ++i;
    if (utf32 >= 65536) {
      var ch = utf32 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}
function stringToUTF32(str, outPtr, maxBytesToWrite) {
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 2147483647;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 55296 && codeUnit <= 57343) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
    }
    HEAP32[outPtr >> 2] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  HEAP32[outPtr >> 2] = 0;
  return outPtr - startPtr;
}
function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
    len += 4;
  }
  return len;
}
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}
var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 50331648;
var wasmTable;
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
var runtimeKeepaliveCounter = 0;
function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
}
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = true;
  if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
  FS.ignorePermissions = false;
  TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}
function exitRuntime() {
  runtimeExited = true;
}
function postRun() {
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
  return id;
}
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
Module['preloadedImages'] = {};
Module['preloadedAudios'] = {};
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }
  what = 'Aborted(' + what + ')';
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  what += '. Build with -s ASSERTIONS=1 for more info.';
  var e = new WebAssembly.RuntimeError(what);
  throw e;
}
var dataURIPrefix = 'data:application/octet-stream;base64,';
function isDataURI(filename) {
  return filename.startsWith(dataURIPrefix);
}
function isFileURI(filename) {
  return filename.startsWith('file://');
}
var wasmBinaryFile;
wasmBinaryFile = 'PDFNetCWasm.wasm';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}
function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw 'both async and sync fetching of the wasm failed';
    }
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function' && !isFileURI(wasmBinaryFile)) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response['ok']) {
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
          }
          return response['arrayBuffer']();
        })
        .catch(function () {
          return getBinary(wasmBinaryFile);
        });
    } else {
      if (readAsync) {
        return new Promise(function (resolve, reject) {
          readAsync(
            wasmBinaryFile,
            function (response) {
              resolve(new Uint8Array(response));
            },
            reject,
          );
        });
      }
    }
  }
  return Promise.resolve().then(function () {
    return getBinary(wasmBinaryFile);
  });
}
function createWasm() {
  var info = { a: asmLibraryArg };
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module['asm'] = exports;
    wasmMemory = Module['asm']['Ad'];
    updateGlobalBufferAndViews(wasmMemory.buffer);
    wasmTable = Module['asm']['vX'];
    addOnInit(Module['asm']['Bd']);
    removeRunDependency('wasm-instantiate');
  }
  addRunDependency('wasm-instantiate');
  function receiveInstantiationResult(result) {
    receiveInstance(result['instance']);
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(function (instance) {
        return instance;
      })
      .then(receiver, function (reason) {
        err('failed to asynchronously prepare wasm: ' + reason);
        abort(reason);
      });
  }
  function instantiateAsync() {
    if (
      !wasmBinary &&
      typeof WebAssembly.instantiateStreaming === 'function' &&
      !isDataURI(wasmBinaryFile) &&
      !isFileURI(wasmBinaryFile) &&
      typeof fetch === 'function'
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);
        return result.then(receiveInstantiationResult, function (reason) {
          err('wasm streaming compile failed: ' + reason);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(receiveInstantiationResult);
        });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch (e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }
  instantiateAsync();
  return {};
}
var tempDouble;
var tempI64;
var ASM_CONSTS = {
  4365824: function () {
    var length = Module._IB_.length;
    Module._IB_[length] = new Uint8Array();
    return length;
  },
  4365916: function ($0) {
    delete Module._IB_[$0];
  },
  4365944: function ($0, $1, $2, $3) {
    Module.HEAP8.set(Module._IB_[$0].subarray($1, $1 + $3), $2);
  },
  4366009: function ($0, $1, $2, $3) {
    Module._IB_[$0].set(Module.HEAP8.subarray($2, $2 + $3), $1);
  },
  4366074: function ($0, $1) {
    var old = Module._IB_[$0];
    (Module._IB_[$0] = new Uint8Array($1)).set(old.length < $1 ? old : old.subarray(0, $1));
  },
  4366194: function ($0) {
    return Module._IB_[$0].length;
  },
  4366229: function ($0) {
    var host_name = self.location.hostname;
    var lic_domain = Module.UTF8ToString($0);
    if (host_name.toLowerCase() === lic_domain.toLowerCase()) {
      return 1;
    } else {
      return 0;
    }
  },
  4366406: function ($0, $1, $2, $3, $4, $5, $6) {
    var xhr = new XMLHttpRequest();
    var method = Module.UTF8ToString($0);
    var url = Module.UTF8ToString($1);
    var customHeaders;
    var skip_web_proxy = $6;
    if (skip_web_proxy) {
      xhr.open(method, url, false);
      xhr.responseType = 'arraybuffer';
      if ($2) {
        var headersStr = Module.UTF8ToString($2);
        customHeaders = JSON.parse(headersStr);
        if (customHeaders['Content-Type']) {
          xhr.setRequestHeader('Content-Type', customHeaders['Content-Type']);
        }
      }
    } else {
      url = 'https://proxy.pdftron.com?url=' + encodeURIComponent(Module.UTF8ToString($1));
      if ($2) {
        var headersStr = Module.UTF8ToString($2);
        customHeaders = JSON.parse(headersStr);
        if (customHeaders['Content-Type']) {
          url += '&contentType=' + customHeaders['Content-Type'];
        }
      }
      xhr.open(method, url, false);
      xhr.responseType = 'arraybuffer';
      var proxy_code_str = Module.UTF8ToString($5);
      xhr.setRequestHeader('PDFTron-Proxy-Code', proxy_code_str);
    }
    if (customHeaders) {
      for (var header in customHeaders) {
        if (skip_web_proxy) {
          if (header != 'Content-Type') {
            xhr.setRequestHeader(header, customHeaders[header]);
          }
        } else {
          if (header != 'Cache-Control') {
            xhr.setRequestHeader(header, customHeaders[header]);
          }
        }
      }
    }
    try {
      if ($3) {
        var body = new Uint8Array(Module.HEAPU8.buffer, $3, $4);
        xhr.send(new Uint8Array(body));
      } else {
        xhr.send();
      }
    } catch (err) {
      return xhr.status;
    }
    if (xhr.status == 200 || xhr.status == 206) {
      Module['__NETLIB_REQUEST_STATUSTEXT__'] = xhr.statusText;
      var responseArray = new Uint8Array(xhr.response);
      Module['__NETLIB_REQUESTED_DATA__'] = responseArray;
      Module['__NETLIB_REQUESTED_DATASIZE__'] = Module['__NETLIB_REQUESTED_DATA__'].length;
    }
    return xhr.status;
  },
  4368051: function () {
    var size = 0;
    if (Module['__NETLIB_REQUESTED_DATASIZE__']) {
      size = Module['__NETLIB_REQUESTED_DATASIZE__'];
      delete Module['__NETLIB_REQUESTED_DATASIZE__'];
    }
    return size;
  },
  4368227: function ($0) {
    if (Module['__NETLIB_REQUESTED_DATA__']) {
      var data = Module['__NETLIB_REQUESTED_DATA__'];
      Module.HEAPU8.set(data, $0);
      delete Module['__NETLIB_REQUESTED_DATA__'];
    }
  },
  4368396: function ($0, $1, $2, $3) {
    var xhr = new XMLHttpRequest();
    var url = Module.UTF8ToString($0);
    xhr.open('GET', url, false);
    xhr.responseType = 'arraybuffer';
    if ($1 >= 0) {
      xhr.setRequestHeader('Range', ['bytes=', $1, '-', $2].join(''));
    }
    if ($3 >= 0) {
      var customHeaders = Module['customHeadersMap'][$3];
      if (customHeaders) {
        for (var header in customHeaders) {
          xhr.setRequestHeader(header, customHeaders[header]);
        }
      }
      var withCredentials = Module['withCredentials'][$3];
      if (withCredentials) {
        xhr.withCredentials = withCredentials;
      }
    }
    try {
      xhr.send();
    } catch (err) {
      return 0;
    }
    if (xhr.status == 200 || xhr.status == 206) {
      var responseArray = new Uint8Array(xhr.response);
      Module['__LAST_REQUESTED_DATA__'] = responseArray;
      return Module['__LAST_REQUESTED_DATA__'].length;
    }
    return 0;
  },
  4369164: function ($0) {
    if (Module['__LAST_REQUESTED_DATA__']) {
      var data = Module['__LAST_REQUESTED_DATA__'];
      Module.HEAPU8.set(data, $0);
      delete Module['__LAST_REQUESTED_DATA__'];
      return 1;
    }
    return 0;
  },
  4369348: function ($0, $1, $2, $3) {
    var xhr = new XMLHttpRequest();
    var url = Module.UTF8ToString($0);
    xhr.open('GET', url, false);
    xhr.responseType = 'arraybuffer';
    if ($1 >= 0) {
      xhr.setRequestHeader('Range', ['bytes=', $1, '-', $2].join(''));
    }
    if ($3 >= 0) {
      var customHeaders = Module['customHeadersMap'][$3];
      if (customHeaders) {
        for (var header in customHeaders) {
          xhr.setRequestHeader(header, customHeaders[header]);
        }
      }
      var withCredentials = Module['withCredentials'][$3];
      if (withCredentials) {
        xhr.withCredentials = withCredentials;
      }
    }
    try {
      xhr.send();
    } catch (err) {
      return 0;
    }
    if (xhr.status == 200 || xhr.status == 206) {
      var responseArray = new Uint8Array(xhr.response);
      Module['__LAST_REQUESTED_DATA__'] = responseArray;
      return Module['__LAST_REQUESTED_DATA__'].length;
    }
    return 0;
  },
  4370116: function ($0) {
    if (Module['__LAST_REQUESTED_DATA__']) {
      var data = Module['__LAST_REQUESTED_DATA__'];
      Module.HEAPU8.set(data, $0);
      delete Module['__LAST_REQUESTED_DATA__'];
      return 1;
    }
    return 0;
  },
  4370300: function ($0, $1, $2, $3, $4, $5) {
    var xhr = new XMLHttpRequest();
    var url = Module.UTF8ToString($0);
    var query_uri_portn = Module.UTF8ToString($5);
    if (query_uri_portn.length > 0) {
      url = url + encodeURIComponent(query_uri_portn);
    }
    xhr.open('POST', url, false);
    xhr.contentType = 'application/ocsp-request';
    xhr.responseType = 'arraybuffer';
    xhr.timeout = $2;
    var message_data = new Uint8Array(Module.HEAPU8.buffer, $1, $3);
    var proxy_code_str = Module.UTF8ToString($4);
    if (proxy_code_str.length > 0) {
      xhr.setRequestHeader('PDFTron-Proxy-Code', proxy_code_str);
    }
    if (url.indexOf('https://proxy.pdftron.com') !== 0) {
      xhr.setRequestHeader('Cache-Control', 'no-store');
    }
    try {
      xhr.send(new Uint8Array(message_data));
    } catch (err) {
      return 0;
    }
    Module['__LAST_OCSP_HTTP_STATUS__'] = xhr.status;
    if (xhr.status == 200) {
      var responseArray = new Uint8Array(xhr.response);
      Module['__LAST_OCSP_DATA__'] = responseArray;
      return Module['__LAST_OCSP_DATA__'].length;
    }
    return 0;
  },
  4371247: function () {
    if (Module['__LAST_OCSP_HTTP_STATUS__']) {
      var status_code = Module['__LAST_OCSP_HTTP_STATUS__'];
      delete Module['__LAST_OCSP_HTTP_STATUS__'];
      return status_code;
    }
    return 0;
  },
  4371426: function ($0) {
    if (Module['__LAST_OCSP_DATA__']) {
      var data = Module['__LAST_OCSP_DATA__'];
      Module.HEAPU8.set(data, $0);
      delete Module['__LAST_OCSP_DATA__'];
      return 1;
    }
    return 0;
  },
  4371597: function ($0, $1, $2, $3) {
    var xhr = new XMLHttpRequest();
    var url = Module.UTF8ToString($0);
    var query_uri_portn = Module.UTF8ToString($3);
    if (query_uri_portn.length > 0) {
      url = url + encodeURIComponent(query_uri_portn);
    }
    xhr.open('GET', url, false);
    xhr.responseType = 'arraybuffer';
    xhr.timeout = $1;
    var proxy_code_str = Module.UTF8ToString($2);
    if (proxy_code_str.length > 0) {
      xhr.setRequestHeader('PDFTron-Proxy-Code', proxy_code_str);
    }
    if (url.indexOf('https://proxy.pdftron.com') !== 0) {
      xhr.setRequestHeader('Cache-Control', 'no-store');
    }
    try {
      xhr.send();
    } catch (err) {
      return 0;
    }
    Module['__LAST_CRL_HTTP_STATUS__'] = xhr.status;
    if (xhr.status == 200) {
      var responseArray = new Uint8Array(xhr.response);
      Module['__LAST_CRL_DATA__'] = responseArray;
      return Module['__LAST_CRL_DATA__'].length;
    }
    return 0;
  },
  4372401: function () {
    if (Module['__LAST_CRL_HTTP_STATUS__']) {
      var status_code = Module['__LAST_CRL_HTTP_STATUS__'];
      delete Module['__LAST_CRL_HTTP_STATUS__'];
      return status_code;
    }
    return 0;
  },
  4372577: function ($0) {
    if (Module['__LAST_CRL_DATA__']) {
      var data = Module['__LAST_CRL_DATA__'];
      Module.HEAPU8.set(data, $0);
      delete Module['__LAST_CRL_DATA__'];
      return 1;
    }
    return 0;
  },
};
function get_unicode_str(str_name) {
  var strName = UTF8ToString(str_name);
  var jsString = Module[strName];
  var lengthBytes = lengthBytesUTF8(jsString) + 1;
  var stringOnWasmHeap = _malloc(lengthBytes);
  stringToUTF8(jsString, stringOnWasmHeap, lengthBytes);
  delete Module[strName];
  return stringOnWasmHeap;
}
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback(Module);
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        getWasmTableEntry(func)();
      } else {
        getWasmTableEntry(func)(callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  return func;
}
function setWasmTableEntry(idx, func) {
  wasmTable.set(idx, func);
  wasmTableMirror[idx] = func;
}
var _emscripten_get_now;
if (ENVIRONMENT_IS_NODE) {
  _emscripten_get_now = () => {
    var t = process['hrtime']();
    return t[0] * 1e3 + t[1] / 1e6;
  };
} else _emscripten_get_now = () => performance.now();
var _emscripten_get_now_is_monotonic = true;
function setErrNo(value) {
  HEAP32[___errno_location() >> 2] = value;
  return value;
}
function _clock_gettime(clk_id, tp) {
  var now;
  if (clk_id === 0) {
    now = Date.now();
  } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
    now = _emscripten_get_now();
  } else {
    setErrNo(28);
    return -1;
  }
  HEAP32[tp >> 2] = (now / 1e3) | 0;
  HEAP32[(tp + 4) >> 2] = ((now % 1e3) * 1e3 * 1e3) | 0;
  return 0;
}
function ___clock_gettime(a0, a1) {
  return _clock_gettime(a0, a1);
}
function ___cxa_allocate_exception(size) {
  return _malloc(size + 16) + 16;
}
function ExceptionInfo(excPtr) {
  this.excPtr = excPtr;
  this.ptr = excPtr - 16;
  this.set_type = function (type) {
    HEAP32[(this.ptr + 4) >> 2] = type;
  };
  this.get_type = function () {
    return HEAP32[(this.ptr + 4) >> 2];
  };
  this.set_destructor = function (destructor) {
    HEAP32[(this.ptr + 8) >> 2] = destructor;
  };
  this.get_destructor = function () {
    return HEAP32[(this.ptr + 8) >> 2];
  };
  this.set_refcount = function (refcount) {
    HEAP32[this.ptr >> 2] = refcount;
  };
  this.set_caught = function (caught) {
    caught = caught ? 1 : 0;
    HEAP8[(this.ptr + 12) >> 0] = caught;
  };
  this.get_caught = function () {
    return HEAP8[(this.ptr + 12) >> 0] != 0;
  };
  this.set_rethrown = function (rethrown) {
    rethrown = rethrown ? 1 : 0;
    HEAP8[(this.ptr + 13) >> 0] = rethrown;
  };
  this.get_rethrown = function () {
    return HEAP8[(this.ptr + 13) >> 0] != 0;
  };
  this.init = function (type, destructor) {
    this.set_type(type);
    this.set_destructor(destructor);
    this.set_refcount(0);
    this.set_caught(false);
    this.set_rethrown(false);
  };
  this.add_ref = function () {
    var value = HEAP32[this.ptr >> 2];
    HEAP32[this.ptr >> 2] = value + 1;
  };
  this.release_ref = function () {
    var prev = HEAP32[this.ptr >> 2];
    HEAP32[this.ptr >> 2] = prev - 1;
    return prev === 1;
  };
}
function CatchInfo(ptr) {
  this.free = function () {
    _free(this.ptr);
    this.ptr = 0;
  };
  this.set_base_ptr = function (basePtr) {
    HEAP32[this.ptr >> 2] = basePtr;
  };
  this.get_base_ptr = function () {
    return HEAP32[this.ptr >> 2];
  };
  this.set_adjusted_ptr = function (adjustedPtr) {
    HEAP32[(this.ptr + 4) >> 2] = adjustedPtr;
  };
  this.get_adjusted_ptr_addr = function () {
    return this.ptr + 4;
  };
  this.get_adjusted_ptr = function () {
    return HEAP32[(this.ptr + 4) >> 2];
  };
  this.get_exception_ptr = function () {
    var isPointer = ___cxa_is_pointer_type(this.get_exception_info().get_type());
    if (isPointer) {
      return HEAP32[this.get_base_ptr() >> 2];
    }
    var adjusted = this.get_adjusted_ptr();
    if (adjusted !== 0) return adjusted;
    return this.get_base_ptr();
  };
  this.get_exception_info = function () {
    return new ExceptionInfo(this.get_base_ptr());
  };
  if (ptr === undefined) {
    this.ptr = _malloc(8);
    this.set_adjusted_ptr(0);
  } else {
    this.ptr = ptr;
  }
}
var exceptionCaught = [];
function exception_addRef(info) {
  info.add_ref();
}
var uncaughtExceptionCount = 0;
function ___cxa_begin_catch(ptr) {
  var catchInfo = new CatchInfo(ptr);
  var info = catchInfo.get_exception_info();
  if (!info.get_caught()) {
    info.set_caught(true);
    uncaughtExceptionCount--;
  }
  info.set_rethrown(false);
  exceptionCaught.push(catchInfo);
  exception_addRef(info);
  return catchInfo.get_exception_ptr();
}
function ___cxa_call_unexpected(exception) {
  err('Unexpected exception thrown, this is not properly supported - aborting');
  ABORT = true;
  throw exception;
}
var exceptionLast = 0;
function ___cxa_free_exception(ptr) {
  return _free(new ExceptionInfo(ptr).ptr);
}
function exception_decRef(info) {
  if (info.release_ref() && !info.get_rethrown()) {
    var destructor = info.get_destructor();
    if (destructor) {
      getWasmTableEntry(destructor)(info.excPtr);
    }
    ___cxa_free_exception(info.excPtr);
  }
}
function ___cxa_end_catch() {
  _setThrew(0);
  var catchInfo = exceptionCaught.pop();
  exception_decRef(catchInfo.get_exception_info());
  catchInfo.free();
  exceptionLast = 0;
}
function ___resumeException(catchInfoPtr) {
  var catchInfo = new CatchInfo(catchInfoPtr);
  var ptr = catchInfo.get_base_ptr();
  if (!exceptionLast) {
    exceptionLast = ptr;
  }
  catchInfo.free();
  throw ptr;
}
function ___cxa_find_matching_catch_2() {
  var thrown = exceptionLast;
  if (!thrown) {
    setTempRet0(0);
    return 0 | 0;
  }
  var info = new ExceptionInfo(thrown);
  var thrownType = info.get_type();
  var catchInfo = new CatchInfo();
  catchInfo.set_base_ptr(thrown);
  catchInfo.set_adjusted_ptr(thrown);
  if (!thrownType) {
    setTempRet0(0);
    return catchInfo.ptr | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i];
    if (caughtType === 0 || caughtType === thrownType) {
      break;
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType);
      return catchInfo.ptr | 0;
    }
  }
  setTempRet0(thrownType);
  return catchInfo.ptr | 0;
}
function ___cxa_find_matching_catch_3() {
  var thrown = exceptionLast;
  if (!thrown) {
    setTempRet0(0);
    return 0 | 0;
  }
  var info = new ExceptionInfo(thrown);
  var thrownType = info.get_type();
  var catchInfo = new CatchInfo();
  catchInfo.set_base_ptr(thrown);
  catchInfo.set_adjusted_ptr(thrown);
  if (!thrownType) {
    setTempRet0(0);
    return catchInfo.ptr | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i];
    if (caughtType === 0 || caughtType === thrownType) {
      break;
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType);
      return catchInfo.ptr | 0;
    }
  }
  setTempRet0(thrownType);
  return catchInfo.ptr | 0;
}
function ___cxa_find_matching_catch_4() {
  var thrown = exceptionLast;
  if (!thrown) {
    setTempRet0(0);
    return 0 | 0;
  }
  var info = new ExceptionInfo(thrown);
  var thrownType = info.get_type();
  var catchInfo = new CatchInfo();
  catchInfo.set_base_ptr(thrown);
  catchInfo.set_adjusted_ptr(thrown);
  if (!thrownType) {
    setTempRet0(0);
    return catchInfo.ptr | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i];
    if (caughtType === 0 || caughtType === thrownType) {
      break;
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType);
      return catchInfo.ptr | 0;
    }
  }
  setTempRet0(thrownType);
  return catchInfo.ptr | 0;
}
function ___cxa_find_matching_catch_5() {
  var thrown = exceptionLast;
  if (!thrown) {
    setTempRet0(0);
    return 0 | 0;
  }
  var info = new ExceptionInfo(thrown);
  var thrownType = info.get_type();
  var catchInfo = new CatchInfo();
  catchInfo.set_base_ptr(thrown);
  catchInfo.set_adjusted_ptr(thrown);
  if (!thrownType) {
    setTempRet0(0);
    return catchInfo.ptr | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i];
    if (caughtType === 0 || caughtType === thrownType) {
      break;
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType);
      return catchInfo.ptr | 0;
    }
  }
  setTempRet0(thrownType);
  return catchInfo.ptr | 0;
}
function ___cxa_find_matching_catch_6() {
  var thrown = exceptionLast;
  if (!thrown) {
    setTempRet0(0);
    return 0 | 0;
  }
  var info = new ExceptionInfo(thrown);
  var thrownType = info.get_type();
  var catchInfo = new CatchInfo();
  catchInfo.set_base_ptr(thrown);
  catchInfo.set_adjusted_ptr(thrown);
  if (!thrownType) {
    setTempRet0(0);
    return catchInfo.ptr | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i];
    if (caughtType === 0 || caughtType === thrownType) {
      break;
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType);
      return catchInfo.ptr | 0;
    }
  }
  setTempRet0(thrownType);
  return catchInfo.ptr | 0;
}
function ___cxa_get_exception_ptr(ptr) {
  return new CatchInfo(ptr).get_exception_ptr();
}
function ___cxa_rethrow() {
  var catchInfo = exceptionCaught.pop();
  if (!catchInfo) {
    abort('no exception to throw');
  }
  var info = catchInfo.get_exception_info();
  var ptr = catchInfo.get_base_ptr();
  if (!info.get_rethrown()) {
    exceptionCaught.push(catchInfo);
    info.set_rethrown(true);
    info.set_caught(false);
    uncaughtExceptionCount++;
  } else {
    catchInfo.free();
  }
  exceptionLast = ptr;
  throw ptr;
}
function ___cxa_throw(ptr, type, destructor) {
  var info = new ExceptionInfo(ptr);
  info.init(type, destructor);
  exceptionLast = ptr;
  uncaughtExceptionCount++;
  throw ptr;
}
function ___cxa_uncaught_exceptions() {
  return uncaughtExceptionCount;
}
var PATH = {
  splitPath: function (filename) {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: function (parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift('..');
      }
    }
    return parts;
  },
  normalize: function (path) {
    var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.substr(-1) === '/';
    path = PATH.normalizeArray(
      path.split('/').filter(function (p) {
        return !!p;
      }),
      !isAbsolute,
    ).join('/');
    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (isAbsolute ? '/' : '') + path;
  },
  dirname: function (path) {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: function (path) {
    if (path === '/') return '/';
    path = PATH.normalize(path);
    path = path.replace(/\/$/, '');
    var lastSlash = path.lastIndexOf('/');
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  extname: function (path) {
    return PATH.splitPath(path)[3];
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join('/'));
  },
  join2: function (l, r) {
    return PATH.normalize(l + '/' + r);
  },
};
function getRandomDevice() {
  if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
    var randomBuffer = new Uint8Array(1);
    return function () {
      crypto.getRandomValues(randomBuffer);
      return randomBuffer[0];
    };
  } else if (ENVIRONMENT_IS_NODE) {
    try {
      var crypto_module = require('crypto');
      return function () {
        return crypto_module['randomBytes'](1)[0];
      };
    } catch (e) {}
  }
  return function () {
    abort('randomDevice');
  };
}
var PATH_FS = {
  resolve: function () {
    var resolvedPath = '',
      resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd();
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        return '';
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split('/').filter(function (p) {
        return !!p;
      }),
      !resolvedAbsolute,
    ).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },
  relative: function (from, to) {
    from = PATH_FS.resolve(from).substr(1);
    to = PATH_FS.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  },
};
var TTY = {
  ttys: [],
  init: function () {},
  shutdown: function () {},
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    read: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    },
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;
          try {
            bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, null);
          } catch (e) {
            if (e.toString().includes('EOF')) bytesRead = 0;
            else throw e;
          }
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString('utf-8');
          } else {
            result = null;
          }
        } else if (typeof window != 'undefined' && typeof window.prompt == 'function') {
          result = window.prompt('Input: ');
          if (result !== null) {
            result += '\n';
          }
        } else if (typeof readline == 'function') {
          result = readline();
          if (result !== null) {
            result += '\n';
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
};
function zeroMemory(address, size) {
  HEAPU8.fill(0, address, address + size);
}
function alignMemory(size, alignment) {
  return Math.ceil(size / alignment) * alignment;
}
function mmapAlloc(size) {
  size = alignMemory(size, 65536);
  var ptr = _memalign(65536, size);
  if (!ptr) return 0;
  zeroMemory(ptr, size);
  return ptr;
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, '/', 16384 | 511, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      throw new FS.ErrnoError(63);
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: { llseek: MEMFS.stream_ops.llseek },
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink,
          },
          stream: {},
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: FS.chrdev_stream_ops,
        },
      };
    }
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0;
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.timestamp = Date.now();
    if (parent) {
      parent.contents[name] = node;
      parent.timestamp = node.timestamp;
    }
    return node;
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array(0);
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
    return new Uint8Array(node.contents);
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return;
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity);
    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null;
      node.usedBytes = 0;
    } else {
      var oldContents = node.contents;
      node.contents = new Uint8Array(newSize);
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
      }
      node.usedBytes = newSize;
    }
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    },
    unlink: function (parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    },
    readdir: function (node) {
      var entries = ['.', '..'];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap: function (stream, address, length, position, prot, flags) {
      if (address !== 0) {
        throw new FS.ErrnoError(28);
      }
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    },
  },
};
function asyncLoad(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
  readAsync(
    url,
    function (arrayBuffer) {
      assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
      onload(new Uint8Array(arrayBuffer));
      if (dep) removeRunDependency(dep);
    },
    function (event) {
      if (onerror) {
        onerror();
      } else {
        throw 'Loading data file "' + url + '" failed.';
      }
    },
  );
  if (dep) addRunDependency(dep);
}
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: '/',
  initialized: false,
  ignorePermissions: true,
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  lookupPath: (path, opts = {}) => {
    path = PATH_FS.resolve(FS.cwd(), path);
    if (!path) return { path: '', node: null };
    var defaults = { follow_mount: true, recurse_count: 0 };
    for (var key in defaults) {
      if (opts[key] === undefined) {
        opts[key] = defaults[key];
      }
    }
    if (opts.recurse_count > 8) {
      throw new FS.ErrnoError(32);
    }
    var parts = PATH.normalizeArray(
      path.split('/').filter(p => !!p),
      false,
    );
    var current = FS.root;
    var current_path = '/';
    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1;
      if (islast && opts.parent) {
        break;
      }
      current = FS.lookupNode(current, parts[i]);
      current_path = PATH.join2(current_path, parts[i]);
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root;
        }
      }
      if (!islast || opts.follow) {
        var count = 0;
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path);
          current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
          var lookup = FS.lookupPath(current_path, {
            recurse_count: opts.recurse_count,
          });
          current = lookup.node;
          if (count++ > 40) {
            throw new FS.ErrnoError(32);
          }
        }
      }
    }
    return { path: current_path, node: current };
  },
  getPath: node => {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
      }
      path = path ? node.name + '/' + path : node.name;
      node = node.parent;
    }
  },
  hashName: (parentid, name) => {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode: node => {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode: node => {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode: (parent, name) => {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode, parent);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    return FS.lookup(parent, name);
  },
  createNode: (parent, name, mode, rdev) => {
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode: node => {
    FS.hashRemoveNode(node);
  },
  isRoot: node => {
    return node === node.parent;
  },
  isMountpoint: node => {
    return !!node.mounted;
  },
  isFile: mode => {
    return (mode & 61440) === 32768;
  },
  isDir: mode => {
    return (mode & 61440) === 16384;
  },
  isLink: mode => {
    return (mode & 61440) === 40960;
  },
  isChrdev: mode => {
    return (mode & 61440) === 8192;
  },
  isBlkdev: mode => {
    return (mode & 61440) === 24576;
  },
  isFIFO: mode => {
    return (mode & 61440) === 4096;
  },
  isSocket: mode => {
    return (mode & 49152) === 49152;
  },
  flagModes: { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
  modeStringToFlags: str => {
    var flags = FS.flagModes[str];
    if (typeof flags === 'undefined') {
      throw new Error('Unknown file open mode: ' + str);
    }
    return flags;
  },
  flagsToPermissionString: flag => {
    var perms = ['r', 'w', 'rw'][flag & 3];
    if (flag & 512) {
      perms += 'w';
    }
    return perms;
  },
  nodePermissions: (node, perms) => {
    if (FS.ignorePermissions) {
      return 0;
    }
    if (perms.includes('r') && !(node.mode & 292)) {
      return 2;
    } else if (perms.includes('w') && !(node.mode & 146)) {
      return 2;
    } else if (perms.includes('x') && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup: dir => {
    var errCode = FS.nodePermissions(dir, 'x');
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate: (dir, name) => {
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, 'wx');
  },
  mayDelete: (dir, name, isdir) => {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, 'wx');
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31;
      }
    }
    return 0;
  },
  mayOpen: (node, flags) => {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
        return 31;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStream: fd => FS.streams[fd],
  createStream: (stream, fd_start, fd_end) => {
    if (!FS.FSStream) {
      FS.FSStream = function () {};
      FS.FSStream.prototype = {
        object: {
          get: function () {
            return this.node;
          },
          set: function (val) {
            this.node = val;
          },
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1;
          },
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0;
          },
        },
        isAppend: {
          get: function () {
            return this.flags & 1024;
          },
        },
      };
    }
    var newStream = new FS.FSStream();
    for (var p in stream) {
      newStream[p] = stream[p];
    }
    stream = newStream;
    var fd = FS.nextfd(fd_start, fd_end);
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream: fd => {
    FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
    open: stream => {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    },
    llseek: () => {
      throw new FS.ErrnoError(70);
    },
  },
  major: dev => dev >> 8,
  minor: dev => dev & 255,
  makedev: (ma, mi) => (ma << 8) | mi,
  registerDevice: (dev, ops) => {
    FS.devices[dev] = { stream_ops: ops };
  },
  getDevice: dev => FS.devices[dev],
  getMounts: mount => {
    var mounts = [];
    var check = [mount];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push.apply(check, m.mounts);
    }
    return mounts;
  },
  syncfs: (populate, callback) => {
    if (typeof populate === 'function') {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(errCode) {
      FS.syncFSRequests--;
      return callback(errCode);
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    mounts.forEach(mount => {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount: (type, opts, mountpoint) => {
    var root = mountpoint === '/';
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      mountpoint = lookup.path;
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }
    var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      node.mounted = mount;
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount: mountpoint => {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    Object.keys(FS.nameTable).forEach(hash => {
      var current = FS.nameTable[hash];
      while (current) {
        var next = current.name_next;
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }
        current = next;
      }
    });
    node.mounted = null;
    var idx = node.mount.mounts.indexOf(mount);
    node.mount.mounts.splice(idx, 1);
  },
  lookup: (parent, name) => {
    return parent.node_ops.lookup(parent, name);
  },
  mknod: (path, mode, dev) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === '.' || name === '..') {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: (path, mode) => {
    mode = mode !== undefined ? mode : 438;
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir: (path, mode) => {
    mode = mode !== undefined ? mode : 511;
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree: (path, mode) => {
    var dirs = path.split('/');
    var d = '';
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += '/' + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev: (path, mode, dev) => {
    if (typeof dev === 'undefined') {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink: (oldpath, newpath) => {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: (old_path, new_path) => {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    var lookup, old_dir, new_dir;
    lookup = FS.lookupPath(old_path, { parent: true });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, { parent: true });
    new_dir = lookup.node;
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    var old_node = FS.lookupNode(old_dir, old_name);
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(28);
    }
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(55);
    }
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (old_node === new_node) {
      return;
    }
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, 'w');
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    FS.hashRemoveNode(old_node);
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
    } catch (e) {
      throw e;
    } finally {
      FS.hashAddNode(old_node);
    }
  },
  rmdir: path => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir: path => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54);
    }
    return node.node_ops.readdir(node);
  },
  unlink: path => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink: path => {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
  },
  stat: (path, dontFollow) => {
    var lookup = FS.lookupPath(path, { follow: !dontFollow });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63);
    }
    return node.node_ops.getattr(node);
  },
  lstat: path => {
    return FS.stat(path, true);
  },
  chmod: (path, mode, dontFollow) => {
    var node;
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      timestamp: Date.now(),
    });
  },
  lchmod: (path, mode) => {
    FS.chmod(path, mode, true);
  },
  fchmod: (fd, mode) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chmod(stream.node, mode);
  },
  chown: (path, uid, gid, dontFollow) => {
    var node;
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, { timestamp: Date.now() });
  },
  lchown: (path, uid, gid) => {
    FS.chown(path, uid, gid, true);
  },
  fchown: (fd, uid, gid) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chown(stream.node, uid, gid);
  },
  truncate: (path, len) => {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: true });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, 'w');
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
  },
  ftruncate: (fd, len) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.truncate(stream.node, len);
  },
  utime: (path, atime, mtime) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
  },
  open: (path, flags, mode, fd_start, fd_end) => {
    if (path === '') {
      throw new FS.ErrnoError(44);
    }
    flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
    mode = typeof mode === 'undefined' ? 438 : mode;
    if (flags & 64) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path === 'object') {
      node = path;
    } else {
      path = PATH.normalize(path);
      try {
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
        node = lookup.node;
      } catch (e) {}
    }
    var created = false;
    if (flags & 64) {
      if (node) {
        if (flags & 128) {
          throw new FS.ErrnoError(20);
        }
      } else {
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    if (flags & 512) {
      FS.truncate(node, 0);
    }
    flags &= ~(128 | 512 | 131072);
    var stream = FS.createStream(
      {
        node: node,
        path: FS.getPath(node),
        flags: flags,
        seekable: true,
        position: 0,
        stream_ops: node.stream_ops,
        ungotten: [],
        error: false,
      },
      fd_start,
      fd_end,
    );
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module['logReadFiles'] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {};
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
      }
    }
    return stream;
  },
  close: stream => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null;
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed: stream => {
    return stream.fd === null;
  },
  llseek: (stream, offset, whence) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read: (stream, buffer, offset, length, position) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position !== 'undefined';
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write: (stream, buffer, offset, length, position, canOwn) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position !== 'undefined';
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  allocate: (stream, offset, length) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: (stream, address, length, position, prot, flags) => {
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
  },
  msync: (stream, buffer, offset, length, mmapFlags) => {
    if (!stream || !stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: stream => 0,
  ioctl: (stream, cmd, arg) => {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: (path, opts = {}) => {
    opts.flags = opts.flags || 0;
    opts.encoding = opts.encoding || 'binary';
    if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === 'utf8') {
      ret = UTF8ArrayToString(buf, 0);
    } else if (opts.encoding === 'binary') {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile: (path, data, opts = {}) => {
    opts.flags = opts.flags || 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data === 'string') {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error('Unsupported data type');
    }
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir: path => {
    var lookup = FS.lookupPath(path, { follow: true });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, 'x');
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories: () => {
    FS.mkdir('/tmp');
    FS.mkdir('/home');
    FS.mkdir('/home/web_user');
  },
  createDefaultDevices: () => {
    FS.mkdir('/dev');
    FS.registerDevice(FS.makedev(1, 3), {
      read: () => 0,
      write: (stream, buffer, offset, length, pos) => length,
    });
    FS.mkdev('/dev/null', FS.makedev(1, 3));
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev('/dev/tty', FS.makedev(5, 0));
    FS.mkdev('/dev/tty1', FS.makedev(6, 0));
    var random_device = getRandomDevice();
    FS.createDevice('/dev', 'random', random_device);
    FS.createDevice('/dev', 'urandom', random_device);
    FS.mkdir('/dev/shm');
    FS.mkdir('/dev/shm/tmp');
  },
  createSpecialDirectories: () => {
    FS.mkdir('/proc');
    var proc_self = FS.mkdir('/proc/self');
    FS.mkdir('/proc/self/fd');
    FS.mount(
      {
        mount: () => {
          var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
          node.node_ops = {
            lookup: (parent, name) => {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(8);
              var ret = {
                parent: null,
                mount: { mountpoint: 'fake' },
                node_ops: { readlink: () => stream.path },
              };
              ret.parent = ret;
              return ret;
            },
          };
          return node;
        },
      },
      {},
      '/proc/self/fd',
    );
  },
  createStandardStreams: () => {
    if (Module['stdin']) {
      FS.createDevice('/dev', 'stdin', Module['stdin']);
    } else {
      FS.symlink('/dev/tty', '/dev/stdin');
    }
    if (Module['stdout']) {
      FS.createDevice('/dev', 'stdout', null, Module['stdout']);
    } else {
      FS.symlink('/dev/tty', '/dev/stdout');
    }
    if (Module['stderr']) {
      FS.createDevice('/dev', 'stderr', null, Module['stderr']);
    } else {
      FS.symlink('/dev/tty1', '/dev/stderr');
    }
    var stdin = FS.open('/dev/stdin', 0);
    var stdout = FS.open('/dev/stdout', 1);
    var stderr = FS.open('/dev/stderr', 1);
  },
  ensureErrnoError: () => {
    if (FS.ErrnoError) return;
    FS.ErrnoError = function ErrnoError(errno, node) {
      this.node = node;
      this.setErrno = function (errno) {
        this.errno = errno;
      };
      this.setErrno(errno);
      this.message = 'FS error';
    };
    FS.ErrnoError.prototype = new Error();
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    [44].forEach(code => {
      FS.genericErrors[code] = new FS.ErrnoError(code);
      FS.genericErrors[code].stack = '<generic error, no stack>';
    });
  },
  staticInit: () => {
    FS.ensureErrnoError();
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, '/');
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = { MEMFS: MEMFS };
  },
  init: (input, output, error) => {
    FS.init.initialized = true;
    FS.ensureErrnoError();
    Module['stdin'] = input || Module['stdin'];
    Module['stdout'] = output || Module['stdout'];
    Module['stderr'] = error || Module['stderr'];
    FS.createStandardStreams();
  },
  quit: () => {
    FS.init.initialized = false;
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  getMode: (canRead, canWrite) => {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  },
  findObject: (path, dontResolveLastLink) => {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      return null;
    }
  },
  analyzePath: (path, dontResolveLastLink) => {
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
    };
    try {
      var lookup = FS.lookupPath(path, { parent: true });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === '/';
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath: (parent, path, canRead, canWrite) => {
    parent = typeof parent === 'string' ? parent : FS.getPath(parent);
    var parts = path.split('/').reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {}
      parent = current;
    }
    return current;
  },
  createFile: (parent, name, properties, canRead, canWrite) => {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
    var path = name;
    if (parent) {
      parent = typeof parent === 'string' ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS.getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data === 'string') {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
        data = arr;
      }
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
    return node;
  },
  createDevice: (parent, name, input, output) => {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(!!input, !!output);
    if (!FS.createDevice.major) FS.createDevice.major = 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    FS.registerDevice(dev, {
      open: stream => {
        stream.seekable = false;
      },
      close: stream => {
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      },
      read: (stream, buffer, offset, length, pos) => {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      },
      write: (stream, buffer, offset, length, pos) => {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      },
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile: obj => {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (typeof XMLHttpRequest !== 'undefined') {
      throw new Error(
        'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.',
      );
    } else if (read_) {
      try {
        obj.contents = intArrayFromString(read_(obj.url), true);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    } else {
      throw new Error('Cannot load without read() or XMLHttpRequest.');
    }
  },
  createLazyFile: (parent, name, url, canRead, canWrite) => {
    function LazyUint8Array() {
      this.lengthKnown = false;
      this.chunks = [];
    }
    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined;
      }
      var chunkOffset = idx % this.chunkSize;
      var chunkNum = (idx / this.chunkSize) | 0;
      return this.getter(chunkNum)[chunkOffset];
    };
    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
      this.getter = getter;
    };
    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, false);
      xhr.send(null);
      if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)) throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
      var datalength = Number(xhr.getResponseHeader('Content-length'));
      var header;
      var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
      var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
      var chunkSize = 1024 * 1024;
      if (!hasByteServing) chunkSize = datalength;
      var doXHR = (from, to) => {
        if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
        if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
        if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)) throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
        if (xhr.response !== undefined) {
          return new Uint8Array(xhr.response || []);
        } else {
          return intArrayFromString(xhr.responseText || '', true);
        }
      };
      var lazyArray = this;
      lazyArray.setDataGetter(chunkNum => {
        var start = chunkNum * chunkSize;
        var end = (chunkNum + 1) * chunkSize - 1;
        end = Math.min(end, datalength - 1);
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
          lazyArray.chunks[chunkNum] = doXHR(start, end);
        }
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') throw new Error('doXHR failed!');
        return lazyArray.chunks[chunkNum];
      });
      if (usesGzip || !datalength) {
        chunkSize = datalength = 1;
        datalength = this.getter(0).length;
        chunkSize = datalength;
        out('LazyFiles on gzip forces download of the whole file when length is accessed');
      }
      this._length = datalength;
      this._chunkSize = chunkSize;
      this.lengthKnown = true;
    };
    if (typeof XMLHttpRequest !== 'undefined') {
      if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
      var lazyArray = new LazyUint8Array();
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          },
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          },
        },
      });
      var properties = { isDevice: false, contents: lazyArray };
    } else {
      var properties = { isDevice: false, url: url };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length;
        },
      },
    });
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach(key => {
      var fn = node.stream_ops[key];
      stream_ops[key] = function forceLoadLazyFile() {
        FS.forceLoadFile(node);
        return fn.apply(null, arguments);
      };
    });
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      if (contents.slice) {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    };
    node.stream_ops = stream_ops;
    return node;
  },
  createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency('cp ' + fullname);
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish();
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        if (onload) onload();
        removeRunDependency(dep);
      }
      if (
        Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })
      ) {
        return;
      }
      finish(byteArray);
    }
    addRunDependency(dep);
    if (typeof url == 'string') {
      asyncLoad(url, byteArray => processData(byteArray), onerror);
    } else {
      processData(url);
    }
  },
  indexedDB: () => {
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  },
  DB_NAME: () => {
    return 'EM_FS_' + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: 'FILE_DATA',
  saveFilesToDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = () => {
      out('creating db');
      var db = openRequest.result;
      db.createObjectStore(FS.DB_STORE_NAME);
    };
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach(path => {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path);
        putRequest.onsuccess = () => {
          ok++;
          if (ok + fail == total) finish();
        };
        putRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
  loadFilesFromDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = onerror;
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
      } catch (e) {
        onerror(e);
        return;
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach(path => {
        var getRequest = files.get(path);
        getRequest.onsuccess = () => {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path);
          }
          FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
          ok++;
          if (ok + fail == total) finish();
        };
        getRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
};
var SYSCALLS = {
  mappings: {},
  DEFAULT_POLLMASK: 5,
  calculateAt: function (dirfd, path, allowEmpty) {
    if (path[0] === '/') {
      return path;
    }
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = FS.getStream(dirfd);
      if (!dirstream) throw new FS.ErrnoError(8);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return PATH.join2(dir, path);
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path);
    } catch (e) {
      if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
        return -54;
      }
      throw e;
    }
    HEAP32[buf >> 2] = stat.dev;
    HEAP32[(buf + 4) >> 2] = 0;
    HEAP32[(buf + 8) >> 2] = stat.ino;
    HEAP32[(buf + 12) >> 2] = stat.mode;
    HEAP32[(buf + 16) >> 2] = stat.nlink;
    HEAP32[(buf + 20) >> 2] = stat.uid;
    HEAP32[(buf + 24) >> 2] = stat.gid;
    HEAP32[(buf + 28) >> 2] = stat.rdev;
    HEAP32[(buf + 32) >> 2] = 0;
    (tempI64 = [
      stat.size >>> 0,
      ((tempDouble = stat.size),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0),
    ]),
      (HEAP32[(buf + 40) >> 2] = tempI64[0]),
      (HEAP32[(buf + 44) >> 2] = tempI64[1]);
    HEAP32[(buf + 48) >> 2] = 4096;
    HEAP32[(buf + 52) >> 2] = stat.blocks;
    HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
    HEAP32[(buf + 60) >> 2] = 0;
    HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
    HEAP32[(buf + 68) >> 2] = 0;
    HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
    HEAP32[(buf + 76) >> 2] = 0;
    (tempI64 = [
      stat.ino >>> 0,
      ((tempDouble = stat.ino),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0),
    ]),
      (HEAP32[(buf + 80) >> 2] = tempI64[0]),
      (HEAP32[(buf + 84) >> 2] = tempI64[1]);
    return 0;
  },
  doMsync: function (addr, stream, len, flags, offset) {
    var buffer = HEAPU8.slice(addr, addr + len);
    FS.msync(stream, buffer, offset, len, flags);
  },
  doMkdir: function (path, mode) {
    path = PATH.normalize(path);
    if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1);
    FS.mkdir(path, mode, 0);
    return 0;
  },
  doMknod: function (path, mode, dev) {
    switch (mode & 61440) {
      case 32768:
      case 8192:
      case 24576:
      case 4096:
      case 49152:
        break;
      default:
        return -28;
    }
    FS.mknod(path, mode, dev);
    return 0;
  },
  doReadlink: function (path, buf, bufsize) {
    if (bufsize <= 0) return -28;
    var ret = FS.readlink(path);
    var len = Math.min(bufsize, lengthBytesUTF8(ret));
    var endChar = HEAP8[buf + len];
    stringToUTF8(ret, buf, bufsize + 1);
    HEAP8[buf + len] = endChar;
    return len;
  },
  doAccess: function (path, amode) {
    if (amode & ~7) {
      return -28;
    }
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node) {
      return -44;
    }
    var perms = '';
    if (amode & 4) perms += 'r';
    if (amode & 2) perms += 'w';
    if (amode & 1) perms += 'x';
    if (perms && FS.nodePermissions(node, perms)) {
      return -2;
    }
    return 0;
  },
  doDup: function (path, flags, suggestFD) {
    var suggest = FS.getStream(suggestFD);
    if (suggest) FS.close(suggest);
    return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
  },
  doReadv: function (stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      var curr = FS.read(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
      if (curr < len) break;
    }
    return ret;
  },
  doWritev: function (stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      var curr = FS.write(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
    }
    return ret;
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
  getStreamFromFD: function (fd) {
    var stream = FS.getStream(fd);
    if (!stream) throw new FS.ErrnoError(8);
    return stream;
  },
  get64: function (low, high) {
    return low;
  },
};
function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get();
        if (arg < 0) {
          return -28;
        }
        var newStream;
        newStream = FS.open(stream.path, stream.flags, 0, arg);
        return newStream.fd;
      }
      case 1:
      case 2:
        return 0;
      case 3:
        return stream.flags;
      case 4: {
        var arg = SYSCALLS.get();
        stream.flags |= arg;
        return 0;
      }
      case 5: {
        var arg = SYSCALLS.get();
        var offset = 0;
        HEAP16[(arg + offset) >> 1] = 2;
        return 0;
      }
      case 6:
      case 7:
        return 0;
      case 16:
      case 8:
        return -28;
      case 9:
        setErrNo(28);
        return -1;
      default: {
        return -28;
      }
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_fstat64(fd, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return SYSCALLS.doStat(FS.stat, stream.path, buf);
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_fstatat64(dirfd, path, buf, flags) {
  try {
    path = SYSCALLS.getStr(path);
    var nofollow = flags & 256;
    var allowEmpty = flags & 4096;
    flags = flags & ~4352;
    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
    return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_ftruncate64(fd, low, high) {
  try {
    var length = SYSCALLS.get64(low, high);
    FS.ftruncate(fd, length);
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_getcwd(buf, size) {
  try {
    if (size === 0) return -28;
    var cwd = FS.cwd();
    var cwdLengthInBytes = lengthBytesUTF8(cwd);
    if (size < cwdLengthInBytes + 1) return -68;
    stringToUTF8(cwd, buf, size);
    return buf;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_getdents64(fd, dirp, count) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    if (!stream.getdents) {
      stream.getdents = FS.readdir(stream.path);
    }
    var struct_size = 280;
    var pos = 0;
    var off = FS.llseek(stream, 0, 1);
    var idx = Math.floor(off / struct_size);
    while (idx < stream.getdents.length && pos + struct_size <= count) {
      var id;
      var type;
      var name = stream.getdents[idx];
      if (name === '.') {
        id = stream.node.id;
        type = 4;
      } else if (name === '..') {
        var lookup = FS.lookupPath(stream.path, { parent: true });
        id = lookup.node.id;
        type = 4;
      } else {
        var child = FS.lookupNode(stream.node, name);
        id = child.id;
        type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
      }
      (tempI64 = [
        id >>> 0,
        ((tempDouble = id),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]);
      (tempI64 = [
        ((idx + 1) * struct_size) >>> 0,
        ((tempDouble = (idx + 1) * struct_size),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]);
      HEAP16[(dirp + pos + 16) >> 1] = 280;
      HEAP8[(dirp + pos + 18) >> 0] = type;
      stringToUTF8(name, dirp + pos + 19, 256);
      pos += struct_size;
      idx += 1;
    }
    FS.llseek(stream, idx * struct_size, 0);
    return pos;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_getegid32() {
  return 0;
}
function ___syscall_geteuid32() {
  return ___syscall_getegid32();
}
function ___syscall_getgid32() {
  return ___syscall_getegid32();
}
function ___syscall_getuid32() {
  return ___syscall_getegid32();
}
function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21519: {
        if (!stream.tty) return -59;
        var argp = SYSCALLS.get();
        HEAP32[argp >> 2] = 0;
        return 0;
      }
      case 21520: {
        if (!stream.tty) return -59;
        return -28;
      }
      case 21531: {
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      }
      case 21523: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21524: {
        if (!stream.tty) return -59;
        return 0;
      }
      default:
        abort('bad ioctl syscall ' + op);
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_lstat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.lstat, path, buf);
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_mkdir(path, mode) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doMkdir(path, mode);
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_open(path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var pathname = SYSCALLS.getStr(path);
    var mode = varargs ? SYSCALLS.get() : 0;
    var stream = FS.open(pathname, flags, mode);
    return stream.fd;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_rename(old_path, new_path) {
  try {
    old_path = SYSCALLS.getStr(old_path);
    new_path = SYSCALLS.getStr(new_path);
    FS.rename(old_path, new_path);
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_rmdir(path) {
  try {
    path = SYSCALLS.getStr(path);
    FS.rmdir(path);
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_stat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_unlink(path) {
  try {
    path = SYSCALLS.getStr(path);
    FS.unlink(path);
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}
function getShiftFromSize(size) {
  switch (size) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError('Unknown type size: ' + size);
  }
}
function embind_init_charCodes() {
  var codes = new Array(256);
  for (var i = 0; i < 256; ++i) {
    codes[i] = String.fromCharCode(i);
  }
  embind_charCodes = codes;
}
var embind_charCodes = undefined;
function readLatin1String(ptr) {
  var ret = '';
  var c = ptr;
  while (HEAPU8[c]) {
    ret += embind_charCodes[HEAPU8[c++]];
  }
  return ret;
}
var awaitingDependencies = {};
var registeredTypes = {};
var typeDependencies = {};
var char_0 = 48;
var char_9 = 57;
function makeLegalFunctionName(name) {
  if (undefined === name) {
    return '_unknown';
  }
  name = name.replace(/[^a-zA-Z0-9_]/g, '$');
  var f = name.charCodeAt(0);
  if (f >= char_0 && f <= char_9) {
    return '_' + name;
  } else {
    return name;
  }
}
function createNamedFunction(name, body) {
  name = makeLegalFunctionName(name);
  return function () {
    null;
    return body.apply(this, arguments);
  };
}
function extendError(baseErrorType, errorName) {
  var errorClass = createNamedFunction(errorName, function (message) {
    this.name = errorName;
    this.message = message;
    var stack = new Error(message).stack;
    if (stack !== undefined) {
      this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
    }
  });
  errorClass.prototype = Object.create(baseErrorType.prototype);
  errorClass.prototype.constructor = errorClass;
  errorClass.prototype.toString = function () {
    if (this.message === undefined) {
      return this.name;
    } else {
      return this.name + ': ' + this.message;
    }
  };
  return errorClass;
}
var BindingError = undefined;
function throwBindingError(message) {
  throw new BindingError(message);
}
var InternalError = undefined;
function throwInternalError(message) {
  throw new InternalError(message);
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
  myTypes.forEach(function (type) {
    typeDependencies[type] = dependentTypes;
  });
  function onComplete(typeConverters) {
    var myTypeConverters = getTypeConverters(typeConverters);
    if (myTypeConverters.length !== myTypes.length) {
      throwInternalError('Mismatched type converter count');
    }
    for (var i = 0; i < myTypes.length; ++i) {
      registerType(myTypes[i], myTypeConverters[i]);
    }
  }
  var typeConverters = new Array(dependentTypes.length);
  var unregisteredTypes = [];
  var registered = 0;
  dependentTypes.forEach(function (dt, i) {
    if (registeredTypes.hasOwnProperty(dt)) {
      typeConverters[i] = registeredTypes[dt];
    } else {
      unregisteredTypes.push(dt);
      if (!awaitingDependencies.hasOwnProperty(dt)) {
        awaitingDependencies[dt] = [];
      }
      awaitingDependencies[dt].push(function () {
        typeConverters[i] = registeredTypes[dt];
        ++registered;
        if (registered === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      });
    }
  });
  if (0 === unregisteredTypes.length) {
    onComplete(typeConverters);
  }
}
function registerType(rawType, registeredInstance, options = {}) {
  if (!('argPackAdvance' in registeredInstance)) {
    throw new TypeError('registerType registeredInstance requires argPackAdvance');
  }
  var name = registeredInstance.name;
  if (!rawType) {
    throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
  }
  if (registeredTypes.hasOwnProperty(rawType)) {
    if (options.ignoreDuplicateRegistrations) {
      return;
    } else {
      throwBindingError("Cannot register type '" + name + "' twice");
    }
  }
  registeredTypes[rawType] = registeredInstance;
  delete typeDependencies[rawType];
  if (awaitingDependencies.hasOwnProperty(rawType)) {
    var callbacks = awaitingDependencies[rawType];
    delete awaitingDependencies[rawType];
    callbacks.forEach(function (cb) {
      cb();
    });
  }
}
function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
  var shift = getShiftFromSize(size);
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (wt) {
      return !!wt;
    },
    toWireType: function (destructors, o) {
      return o ? trueValue : falseValue;
    },
    argPackAdvance: 8,
    readValueFromPointer: function (pointer) {
      var heap;
      if (size === 1) {
        heap = HEAP8;
      } else if (size === 2) {
        heap = HEAP16;
      } else if (size === 4) {
        heap = HEAP32;
      } else {
        throw new TypeError('Unknown boolean type size: ' + name);
      }
      return this['fromWireType'](heap[pointer >> shift]);
    },
    destructorFunction: null,
  });
}
var emval_free_list = [];
var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
function __emval_decref(handle) {
  if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
    emval_handle_array[handle] = undefined;
    emval_free_list.push(handle);
  }
}
function count_emval_handles() {
  var count = 0;
  for (var i = 5; i < emval_handle_array.length; ++i) {
    if (emval_handle_array[i] !== undefined) {
      ++count;
    }
  }
  return count;
}
function get_first_emval() {
  for (var i = 5; i < emval_handle_array.length; ++i) {
    if (emval_handle_array[i] !== undefined) {
      return emval_handle_array[i];
    }
  }
  return null;
}
function init_emval() {
  Module['count_emval_handles'] = count_emval_handles;
  Module['get_first_emval'] = get_first_emval;
}
var Emval = {
  toValue: function (handle) {
    if (!handle) {
      throwBindingError('Cannot use deleted val. handle = ' + handle);
    }
    return emval_handle_array[handle].value;
  },
  toHandle: function (value) {
    switch (value) {
      case undefined: {
        return 1;
      }
      case null: {
        return 2;
      }
      case true: {
        return 3;
      }
      case false: {
        return 4;
      }
      default: {
        var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
        emval_handle_array[handle] = { refcount: 1, value: value };
        return handle;
      }
    }
  },
};
function simpleReadValueFromPointer(pointer) {
  return this['fromWireType'](HEAPU32[pointer >> 2]);
}
function __embind_register_emval(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (handle) {
      var rv = Emval.toValue(handle);
      __emval_decref(handle);
      return rv;
    },
    toWireType: function (destructors, value) {
      return Emval.toHandle(value);
    },
    argPackAdvance: 8,
    readValueFromPointer: simpleReadValueFromPointer,
    destructorFunction: null,
  });
}
function floatReadValueFromPointer(name, shift) {
  switch (shift) {
    case 2:
      return function (pointer) {
        return this['fromWireType'](HEAPF32[pointer >> 2]);
      };
    case 3:
      return function (pointer) {
        return this['fromWireType'](HEAPF64[pointer >> 3]);
      };
    default:
      throw new TypeError('Unknown float type: ' + name);
  }
}
function __embind_register_float(rawType, name, size) {
  var shift = getShiftFromSize(size);
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (value) {
      return value;
    },
    toWireType: function (destructors, value) {
      return value;
    },
    argPackAdvance: 8,
    readValueFromPointer: floatReadValueFromPointer(name, shift),
    destructorFunction: null,
  });
}
function runDestructors(destructors) {
  while (destructors.length) {
    var ptr = destructors.pop();
    var del = destructors.pop();
    del(ptr);
  }
}
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
  var argCount = argTypes.length;
  if (argCount < 2) {
    throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  var isClassMethodFunc = argTypes[1] !== null && classType !== null;
  var needsDestructorStack = false;
  for (var i = 1; i < argTypes.length; ++i) {
    if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
      needsDestructorStack = true;
      break;
    }
  }
  var returns = argTypes[0].name !== 'void';
  var expectedArgCount = argCount - 2;
  var argsWired = new Array(expectedArgCount);
  var invokerFuncArgs = [];
  var destructors = [];
  return function () {
    if (arguments.length !== expectedArgCount) {
      throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ' + expectedArgCount + ' args!');
    }
    destructors.length = 0;
    var thisWired;
    invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
    invokerFuncArgs[0] = cppTargetFunc;
    if (isClassMethodFunc) {
      thisWired = argTypes[1]['toWireType'](destructors, this);
      invokerFuncArgs[1] = thisWired;
    }
    for (var i = 0; i < expectedArgCount; ++i) {
      argsWired[i] = argTypes[i + 2]['toWireType'](destructors, arguments[i]);
      invokerFuncArgs.push(argsWired[i]);
    }
    var rv = cppInvokerFunc.apply(null, invokerFuncArgs);
    function onDone(rv) {
      if (needsDestructorStack) {
        runDestructors(destructors);
      } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; i++) {
          var param = i === 1 ? thisWired : argsWired[i - 2];
          if (argTypes[i].destructorFunction !== null) {
            argTypes[i].destructorFunction(param);
          }
        }
      }
      if (returns) {
        return argTypes[0]['fromWireType'](rv);
      }
    }
    return onDone(rv);
  };
}
function ensureOverloadTable(proto, methodName, humanName) {
  if (undefined === proto[methodName].overloadTable) {
    var prevFunc = proto[methodName];
    proto[methodName] = function () {
      if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
        throwBindingError(
          "Function '" +
            humanName +
            "' called with an invalid number of arguments (" +
            arguments.length +
            ') - expects one of (' +
            proto[methodName].overloadTable +
            ')!',
        );
      }
      return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
    };
    proto[methodName].overloadTable = [];
    proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
  }
}
function exposePublicSymbol(name, value, numArguments) {
  if (Module.hasOwnProperty(name)) {
    if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
      throwBindingError("Cannot register public name '" + name + "' twice");
    }
    ensureOverloadTable(Module, name, name);
    if (Module.hasOwnProperty(numArguments)) {
      throwBindingError('Cannot register multiple overloads of a function with the same number of arguments (' + numArguments + ')!');
    }
    Module[name].overloadTable[numArguments] = value;
  } else {
    Module[name] = value;
    if (undefined !== numArguments) {
      Module[name].numArguments = numArguments;
    }
  }
}
function heap32VectorToArray(count, firstElement) {
  var array = [];
  for (var i = 0; i < count; i++) {
    array.push(HEAP32[(firstElement >> 2) + i]);
  }
  return array;
}
function replacePublicSymbol(name, value, numArguments) {
  if (!Module.hasOwnProperty(name)) {
    throwInternalError('Replacing nonexistant public symbol');
  }
  if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
    Module[name].overloadTable[numArguments] = value;
  } else {
    Module[name] = value;
    Module[name].argCount = numArguments;
  }
}
function dynCallLegacy(sig, ptr, args) {
  var f = Module['dynCall_' + sig];
  return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
}
function dynCall(sig, ptr, args) {
  if (sig.includes('j')) {
    return dynCallLegacy(sig, ptr, args);
  }
  return getWasmTableEntry(ptr).apply(null, args);
}
function getDynCaller(sig, ptr) {
  var argCache = [];
  return function () {
    argCache.length = arguments.length;
    for (var i = 0; i < arguments.length; i++) {
      argCache[i] = arguments[i];
    }
    return dynCall(sig, ptr, argCache);
  };
}
function embind__requireFunction(signature, rawFunction) {
  signature = readLatin1String(signature);
  function makeDynCaller() {
    if (signature.includes('j')) {
      return getDynCaller(signature, rawFunction);
    }
    return getWasmTableEntry(rawFunction);
  }
  var fp = makeDynCaller();
  if (typeof fp !== 'function') {
    throwBindingError('unknown function pointer with signature ' + signature + ': ' + rawFunction);
  }
  return fp;
}
var UnboundTypeError = undefined;
function getTypeName(type) {
  var ptr = ___getTypeName(type);
  var rv = readLatin1String(ptr);
  _free(ptr);
  return rv;
}
function throwUnboundTypeError(message, types) {
  var unboundTypes = [];
  var seen = {};
  function visit(type) {
    if (seen[type]) {
      return;
    }
    if (registeredTypes[type]) {
      return;
    }
    if (typeDependencies[type]) {
      typeDependencies[type].forEach(visit);
      return;
    }
    unboundTypes.push(type);
    seen[type] = true;
  }
  types.forEach(visit);
  throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
}
function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
  var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
  name = readLatin1String(name);
  rawInvoker = embind__requireFunction(signature, rawInvoker);
  exposePublicSymbol(
    name,
    function () {
      throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes);
    },
    argCount - 1,
  );
  whenDependentTypesAreResolved([], argTypes, function (argTypes) {
    var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
    replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
    return [];
  });
}
function integerReadValueFromPointer(name, shift, signed) {
  switch (shift) {
    case 0:
      return signed
        ? function readS8FromPointer(pointer) {
            return HEAP8[pointer];
          }
        : function readU8FromPointer(pointer) {
            return HEAPU8[pointer];
          };
    case 1:
      return signed
        ? function readS16FromPointer(pointer) {
            return HEAP16[pointer >> 1];
          }
        : function readU16FromPointer(pointer) {
            return HEAPU16[pointer >> 1];
          };
    case 2:
      return signed
        ? function readS32FromPointer(pointer) {
            return HEAP32[pointer >> 2];
          }
        : function readU32FromPointer(pointer) {
            return HEAPU32[pointer >> 2];
          };
    default:
      throw new TypeError('Unknown integer type: ' + name);
  }
}
function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
  name = readLatin1String(name);
  if (maxRange === -1) {
    maxRange = 4294967295;
  }
  var shift = getShiftFromSize(size);
  var fromWireType = value => value;
  if (minRange === 0) {
    var bitshift = 32 - 8 * size;
    fromWireType = value => (value << bitshift) >>> bitshift;
  }
  var isUnsignedType = name.includes('unsigned');
  var checkAssertions = (value, toTypeName) => {};
  var toWireType;
  if (isUnsignedType) {
    toWireType = function (destructors, value) {
      checkAssertions(value, this.name);
      return value >>> 0;
    };
  } else {
    toWireType = function (destructors, value) {
      checkAssertions(value, this.name);
      return value;
    };
  }
  registerType(primitiveType, {
    name: name,
    fromWireType: fromWireType,
    toWireType: toWireType,
    argPackAdvance: 8,
    readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0),
    destructorFunction: null,
  });
}
function __embind_register_memory_view(rawType, dataTypeIndex, name) {
  var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
  var TA = typeMapping[dataTypeIndex];
  function decodeMemoryView(handle) {
    handle = handle >> 2;
    var heap = HEAPU32;
    var size = heap[handle];
    var data = heap[handle + 1];
    return new TA(buffer, data, size);
  }
  name = readLatin1String(name);
  registerType(
    rawType,
    {
      name: name,
      fromWireType: decodeMemoryView,
      argPackAdvance: 8,
      readValueFromPointer: decodeMemoryView,
    },
    { ignoreDuplicateRegistrations: true },
  );
}
function __embind_register_std_string(rawType, name) {
  name = readLatin1String(name);
  var stdStringIsUTF8 = name === 'std::string';
  registerType(rawType, {
    name: name,
    fromWireType: function (value) {
      var length = HEAPU32[value >> 2];
      var str;
      if (stdStringIsUTF8) {
        var decodeStartPtr = value + 4;
        for (var i = 0; i <= length; ++i) {
          var currentBytePtr = value + 4 + i;
          if (i == length || HEAPU8[currentBytePtr] == 0) {
            var maxRead = currentBytePtr - decodeStartPtr;
            var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
            if (str === undefined) {
              str = stringSegment;
            } else {
              str += String.fromCharCode(0);
              str += stringSegment;
            }
            decodeStartPtr = currentBytePtr + 1;
          }
        }
      } else {
        var a = new Array(length);
        for (var i = 0; i < length; ++i) {
          a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
        }
        str = a.join('');
      }
      _free(value);
      return str;
    },
    toWireType: function (destructors, value) {
      if (value instanceof ArrayBuffer) {
        value = new Uint8Array(value);
      }
      var getLength;
      var valueIsOfTypeString = typeof value === 'string';
      if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
        throwBindingError('Cannot pass non-string to std::string');
      }
      if (stdStringIsUTF8 && valueIsOfTypeString) {
        getLength = () => lengthBytesUTF8(value);
      } else {
        getLength = () => value.length;
      }
      var length = getLength();
      var ptr = _malloc(4 + length + 1);
      HEAPU32[ptr >> 2] = length;
      if (stdStringIsUTF8 && valueIsOfTypeString) {
        stringToUTF8(value, ptr + 4, length + 1);
      } else {
        if (valueIsOfTypeString) {
          for (var i = 0; i < length; ++i) {
            var charCode = value.charCodeAt(i);
            if (charCode > 255) {
              _free(ptr);
              throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
            }
            HEAPU8[ptr + 4 + i] = charCode;
          }
        } else {
          for (var i = 0; i < length; ++i) {
            HEAPU8[ptr + 4 + i] = value[i];
          }
        }
      }
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    argPackAdvance: 8,
    readValueFromPointer: simpleReadValueFromPointer,
    destructorFunction: function (ptr) {
      _free(ptr);
    },
  });
}
function __embind_register_std_wstring(rawType, charSize, name) {
  name = readLatin1String(name);
  var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
  if (charSize === 2) {
    decodeString = UTF16ToString;
    encodeString = stringToUTF16;
    lengthBytesUTF = lengthBytesUTF16;
    getHeap = () => HEAPU16;
    shift = 1;
  } else if (charSize === 4) {
    decodeString = UTF32ToString;
    encodeString = stringToUTF32;
    lengthBytesUTF = lengthBytesUTF32;
    getHeap = () => HEAPU32;
    shift = 2;
  }
  registerType(rawType, {
    name: name,
    fromWireType: function (value) {
      var length = HEAPU32[value >> 2];
      var HEAP = getHeap();
      var str;
      var decodeStartPtr = value + 4;
      for (var i = 0; i <= length; ++i) {
        var currentBytePtr = value + 4 + i * charSize;
        if (i == length || HEAP[currentBytePtr >> shift] == 0) {
          var maxReadBytes = currentBytePtr - decodeStartPtr;
          var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
          if (str === undefined) {
            str = stringSegment;
          } else {
            str += String.fromCharCode(0);
            str += stringSegment;
          }
          decodeStartPtr = currentBytePtr + charSize;
        }
      }
      _free(value);
      return str;
    },
    toWireType: function (destructors, value) {
      if (!(typeof value === 'string')) {
        throwBindingError('Cannot pass non-string to C++ string type ' + name);
      }
      var length = lengthBytesUTF(value);
      var ptr = _malloc(4 + length + charSize);
      HEAPU32[ptr >> 2] = length >> shift;
      encodeString(value, ptr + 4, length + charSize);
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    argPackAdvance: 8,
    readValueFromPointer: simpleReadValueFromPointer,
    destructorFunction: function (ptr) {
      _free(ptr);
    },
  });
}
function __embind_register_void(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    isVoid: true,
    name: name,
    argPackAdvance: 0,
    fromWireType: function () {
      return undefined;
    },
    toWireType: function (destructors, o) {
      return undefined;
    },
  });
}
function __emscripten_throw_longjmp() {
  throw 'longjmp';
}
function requireRegisteredType(rawType, humanName) {
  var impl = registeredTypes[rawType];
  if (undefined === impl) {
    throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType));
  }
  return impl;
}
function __emval_as(handle, returnType, destructorsRef) {
  handle = Emval.toValue(handle);
  returnType = requireRegisteredType(returnType, 'emval::as');
  var destructors = [];
  var rd = Emval.toHandle(destructors);
  HEAP32[destructorsRef >> 2] = rd;
  return returnType['toWireType'](destructors, handle);
}
function __emval_allocateDestructors(destructorsRef) {
  var destructors = [];
  HEAP32[destructorsRef >> 2] = Emval.toHandle(destructors);
  return destructors;
}
var emval_symbols = {};
function getStringOrSymbol(address) {
  var symbol = emval_symbols[address];
  if (symbol === undefined) {
    return UTF8ToString(address);
  } else {
    return symbol;
  }
}
var emval_methodCallers = [];
function __emval_call_method(caller, handle, methodName, destructorsRef, args) {
  caller = emval_methodCallers[caller];
  handle = Emval.toValue(handle);
  methodName = getStringOrSymbol(methodName);
  return caller(handle, methodName, __emval_allocateDestructors(destructorsRef), args);
}
function emval_get_global() {
  if (typeof globalThis === 'object') {
    return globalThis;
  }
  function testGlobal(obj) {
    obj['$$$embind_global$$$'] = obj;
    var success = typeof $$$embind_global$$$ === 'object' && obj['$$$embind_global$$$'] === obj;
    if (!success) {
      delete obj['$$$embind_global$$$'];
    }
    return success;
  }
  if (typeof $$$embind_global$$$ === 'object') {
    return $$$embind_global$$$;
  }
  if (typeof global === 'object' && testGlobal(global)) {
    $$$embind_global$$$ = global;
  } else if (typeof self === 'object' && testGlobal(self)) {
    $$$embind_global$$$ = self;
  }
  if (typeof $$$embind_global$$$ === 'object') {
    return $$$embind_global$$$;
  }
  throw Error('unable to get global object.');
}
function __emval_get_global(name) {
  if (name === 0) {
    return Emval.toHandle(emval_get_global());
  } else {
    name = getStringOrSymbol(name);
    return Emval.toHandle(emval_get_global()[name]);
  }
}
function __emval_addMethodCaller(caller) {
  var id = emval_methodCallers.length;
  emval_methodCallers.push(caller);
  return id;
}
function __emval_lookupTypes(argCount, argTypes) {
  var a = new Array(argCount);
  for (var i = 0; i < argCount; ++i) {
    a[i] = requireRegisteredType(HEAP32[(argTypes >> 2) + i], 'parameter ' + i);
  }
  return a;
}
var emval_registeredMethods = [];
function __emval_get_method_caller(argCount, argTypes) {
  var types = __emval_lookupTypes(argCount, argTypes);
  var retType = types[0];
  var signatureName =
    retType.name +
    '_$' +
    types
      .slice(1)
      .map(function (t) {
        return t.name;
      })
      .join('_') +
    '$';
  var returnId = emval_registeredMethods[signatureName];
  if (returnId !== undefined) {
    return returnId;
  }
  var argN = new Array(argCount - 1);
  var invokerFunction = (handle, name, destructors, args) => {
    var offset = 0;
    for (var i = 0; i < argCount - 1; ++i) {
      argN[i] = types[i + 1]['readValueFromPointer'](args + offset);
      offset += types[i + 1]['argPackAdvance'];
    }
    var rv = handle[name].apply(handle, argN);
    for (var i = 0; i < argCount - 1; ++i) {
      if (types[i + 1].deleteObject) {
        types[i + 1].deleteObject(argN[i]);
      }
    }
    if (!retType.isVoid) {
      return retType['toWireType'](destructors, rv);
    }
  };
  returnId = __emval_addMethodCaller(invokerFunction);
  emval_registeredMethods[signatureName] = returnId;
  return returnId;
}
function __emval_get_property(handle, key) {
  handle = Emval.toValue(handle);
  key = Emval.toValue(key);
  return Emval.toHandle(handle[key]);
}
function __emval_incref(handle) {
  if (handle > 4) {
    emval_handle_array[handle].refcount += 1;
  }
}
function __emval_new_array() {
  return Emval.toHandle([]);
}
function __emval_new_cstring(v) {
  return Emval.toHandle(getStringOrSymbol(v));
}
function __emval_new_object() {
  return Emval.toHandle({});
}
function __emval_run_destructors(handle) {
  var destructors = Emval.toValue(handle);
  runDestructors(destructors);
  __emval_decref(handle);
}
function __emval_set_property(handle, key, value) {
  handle = Emval.toValue(handle);
  key = Emval.toValue(key);
  value = Emval.toValue(value);
  handle[key] = value;
}
function __emval_take_value(type, argv) {
  type = requireRegisteredType(type, '_emval_take_value');
  var v = type['readValueFromPointer'](argv);
  return Emval.toHandle(v);
}
function __emval_typeof(handle) {
  handle = Emval.toValue(handle);
  return Emval.toHandle(typeof handle);
}
function __gmtime_js(time, tmPtr) {
  var date = new Date(HEAP32[time >> 2] * 1e3);
  HEAP32[tmPtr >> 2] = date.getUTCSeconds();
  HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
  HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
  HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
  HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
  HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
  HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;
}
function __localtime_js(time, tmPtr) {
  var date = new Date(HEAP32[time >> 2] * 1e3);
  HEAP32[tmPtr >> 2] = date.getSeconds();
  HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
  HEAP32[(tmPtr + 8) >> 2] = date.getHours();
  HEAP32[(tmPtr + 12) >> 2] = date.getDate();
  HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
  HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
  HEAP32[(tmPtr + 24) >> 2] = date.getDay();
  var start = new Date(date.getFullYear(), 0, 1);
  var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;
  HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  HEAP32[(tmPtr + 32) >> 2] = dst;
}
function _tzset_impl(timezone, daylight, tzname) {
  var currentYear = new Date().getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  HEAP32[timezone >> 2] = stdTimezoneOffset * 60;
  HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
  function extractZone(date) {
    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
    return match ? match[1] : 'GMT';
  }
  var winterName = extractZone(winter);
  var summerName = extractZone(summer);
  var winterNamePtr = allocateUTF8(winterName);
  var summerNamePtr = allocateUTF8(summerName);
  if (summerOffset < winterOffset) {
    HEAP32[tzname >> 2] = winterNamePtr;
    HEAP32[(tzname + 4) >> 2] = summerNamePtr;
  } else {
    HEAP32[tzname >> 2] = summerNamePtr;
    HEAP32[(tzname + 4) >> 2] = winterNamePtr;
  }
}
function __tzset_js(timezone, daylight, tzname) {
  if (__tzset_js.called) return;
  __tzset_js.called = true;
  _tzset_impl(timezone, daylight, tzname);
}
function _abort() {
  abort('');
}
function _clock() {
  if (_clock.start === undefined) _clock.start = Date.now();
  return ((Date.now() - _clock.start) * (1e6 / 1e3)) | 0;
}
var readAsmConstArgsArray = [];
function readAsmConstArgs(sigPtr, buf) {
  readAsmConstArgsArray.length = 0;
  var ch;
  buf >>= 2;
  while ((ch = HEAPU8[sigPtr++])) {
    var readAsmConstArgsDouble = ch < 105;
    if (readAsmConstArgsDouble && buf & 1) buf++;
    readAsmConstArgsArray.push(readAsmConstArgsDouble ? HEAPF64[buf++ >> 1] : HEAP32[buf]);
    ++buf;
  }
  return readAsmConstArgsArray;
}
function _emscripten_asm_const_int(code, sigPtr, argbuf) {
  var args = readAsmConstArgs(sigPtr, argbuf);
  return ASM_CONSTS[code].apply(null, args);
}
function _emscripten_get_heap_max() {
  return 2147483648;
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num);
}
function emscripten_realloc_buffer(size) {
  try {
    wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
    updateGlobalBufferAndViews(wasmMemory.buffer);
    return 1;
  } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length;
  requestedSize = requestedSize >>> 0;
  var maxHeapSize = 2147483648;
  if (requestedSize > maxHeapSize) {
    return false;
  }
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = emscripten_realloc_buffer(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
}
var ENV = {};
function getExecutableName() {
  return thisProgram || './this.program';
}
function getEnvStrings() {
  if (!getEnvStrings.strings) {
    var lang = ((typeof navigator === 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
    var env = {
      USER: 'web_user',
      LOGNAME: 'web_user',
      PATH: '/',
      PWD: '/',
      HOME: '/home/web_user',
      LANG: lang,
      _: getExecutableName(),
    };
    for (var x in ENV) {
      if (ENV[x] === undefined) delete env[x];
      else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(x + '=' + env[x]);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
}
function _environ_get(__environ, environ_buf) {
  var bufSize = 0;
  getEnvStrings().forEach(function (string, i) {
    var ptr = environ_buf + bufSize;
    HEAP32[(__environ + i * 4) >> 2] = ptr;
    writeAsciiToMemory(string, ptr);
    bufSize += string.length + 1;
  });
  return 0;
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings();
  HEAP32[penviron_count >> 2] = strings.length;
  var bufSize = 0;
  strings.forEach(function (string) {
    bufSize += string.length + 1;
  });
  HEAP32[penviron_buf_size >> 2] = bufSize;
  return 0;
}
function _exit(status) {
  exit(status);
}
function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = SYSCALLS.doReadv(stream, iov, iovcnt);
    HEAP32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var HIGH_OFFSET = 4294967296;
    var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
    var DOUBLE_LIMIT = 9007199254740992;
    if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
      return -61;
    }
    FS.llseek(stream, offset, whence);
    (tempI64 = [
      stream.position >>> 0,
      ((tempDouble = stream.position),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0),
    ]),
      (HEAP32[newOffset >> 2] = tempI64[0]),
      (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = SYSCALLS.doWritev(stream, iov, iovcnt);
    HEAP32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function _getTempRet0() {
  return getTempRet0();
}
function _gettimeofday(ptr) {
  var now = Date.now();
  HEAP32[ptr >> 2] = (now / 1e3) | 0;
  HEAP32[(ptr + 4) >> 2] = ((now % 1e3) * 1e3) | 0;
  return 0;
}
function _llvm_eh_typeid_for(type) {
  return type;
}
function _setTempRet0(val) {
  setTempRet0(val);
}
function __isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function __arraySum(array, index) {
  var sum = 0;
  for (var i = 0; i <= index; sum += array[i++]) {}
  return sum;
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
  var newDate = new Date(date.getTime());
  while (days > 0) {
    var leap = __isLeapYear(newDate.getFullYear());
    var currentMonth = newDate.getMonth();
    var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
    if (days > daysInCurrentMonth - newDate.getDate()) {
      days -= daysInCurrentMonth - newDate.getDate() + 1;
      newDate.setDate(1);
      if (currentMonth < 11) {
        newDate.setMonth(currentMonth + 1);
      } else {
        newDate.setMonth(0);
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    } else {
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    }
  }
  return newDate;
}
function _strftime(s, maxsize, format, tm) {
  var tm_zone = HEAP32[(tm + 40) >> 2];
  var date = {
    tm_sec: HEAP32[tm >> 2],
    tm_min: HEAP32[(tm + 4) >> 2],
    tm_hour: HEAP32[(tm + 8) >> 2],
    tm_mday: HEAP32[(tm + 12) >> 2],
    tm_mon: HEAP32[(tm + 16) >> 2],
    tm_year: HEAP32[(tm + 20) >> 2],
    tm_wday: HEAP32[(tm + 24) >> 2],
    tm_yday: HEAP32[(tm + 28) >> 2],
    tm_isdst: HEAP32[(tm + 32) >> 2],
    tm_gmtoff: HEAP32[(tm + 36) >> 2],
    tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
  };
  var pattern = UTF8ToString(format);
  var EXPANSION_RULES_1 = {
    '%c': '%a %b %d %H:%M:%S %Y',
    '%D': '%m/%d/%y',
    '%F': '%Y-%m-%d',
    '%h': '%b',
    '%r': '%I:%M:%S %p',
    '%R': '%H:%M',
    '%T': '%H:%M:%S',
    '%x': '%m/%d/%y',
    '%X': '%H:%M:%S',
    '%Ec': '%c',
    '%EC': '%C',
    '%Ex': '%m/%d/%y',
    '%EX': '%H:%M:%S',
    '%Ey': '%y',
    '%EY': '%Y',
    '%Od': '%d',
    '%Oe': '%e',
    '%OH': '%H',
    '%OI': '%I',
    '%Om': '%m',
    '%OM': '%M',
    '%OS': '%S',
    '%Ou': '%u',
    '%OU': '%U',
    '%OV': '%V',
    '%Ow': '%w',
    '%OW': '%W',
    '%Oy': '%y',
  };
  for (var rule in EXPANSION_RULES_1) {
    pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
  }
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function leadingSomething(value, digits, character) {
    var str = typeof value === 'number' ? value.toString() : value || '';
    while (str.length < digits) {
      str = character[0] + str;
    }
    return str;
  }
  function leadingNulls(value, digits) {
    return leadingSomething(value, digits, '0');
  }
  function compareByDay(date1, date2) {
    function sgn(value) {
      return value < 0 ? -1 : value > 0 ? 1 : 0;
    }
    var compare;
    if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
      if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
        compare = sgn(date1.getDate() - date2.getDate());
      }
    }
    return compare;
  }
  function getFirstWeekStartDate(janFourth) {
    switch (janFourth.getDay()) {
      case 0:
        return new Date(janFourth.getFullYear() - 1, 11, 29);
      case 1:
        return janFourth;
      case 2:
        return new Date(janFourth.getFullYear(), 0, 3);
      case 3:
        return new Date(janFourth.getFullYear(), 0, 2);
      case 4:
        return new Date(janFourth.getFullYear(), 0, 1);
      case 5:
        return new Date(janFourth.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(janFourth.getFullYear() - 1, 11, 30);
    }
  }
  function getWeekBasedYear(date) {
    var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
    var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
    var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
    if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
      if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
        return thisDate.getFullYear() + 1;
      } else {
        return thisDate.getFullYear();
      }
    } else {
      return thisDate.getFullYear() - 1;
    }
  }
  var EXPANSION_RULES_2 = {
    '%a': function (date) {
      return WEEKDAYS[date.tm_wday].substring(0, 3);
    },
    '%A': function (date) {
      return WEEKDAYS[date.tm_wday];
    },
    '%b': function (date) {
      return MONTHS[date.tm_mon].substring(0, 3);
    },
    '%B': function (date) {
      return MONTHS[date.tm_mon];
    },
    '%C': function (date) {
      var year = date.tm_year + 1900;
      return leadingNulls((year / 100) | 0, 2);
    },
    '%d': function (date) {
      return leadingNulls(date.tm_mday, 2);
    },
    '%e': function (date) {
      return leadingSomething(date.tm_mday, 2, ' ');
    },
    '%g': function (date) {
      return getWeekBasedYear(date).toString().substring(2);
    },
    '%G': function (date) {
      return getWeekBasedYear(date);
    },
    '%H': function (date) {
      return leadingNulls(date.tm_hour, 2);
    },
    '%I': function (date) {
      var twelveHour = date.tm_hour;
      if (twelveHour == 0) twelveHour = 12;
      else if (twelveHour > 12) twelveHour -= 12;
      return leadingNulls(twelveHour, 2);
    },
    '%j': function (date) {
      return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
    },
    '%m': function (date) {
      return leadingNulls(date.tm_mon + 1, 2);
    },
    '%M': function (date) {
      return leadingNulls(date.tm_min, 2);
    },
    '%n': function () {
      return '\n';
    },
    '%p': function (date) {
      if (date.tm_hour >= 0 && date.tm_hour < 12) {
        return 'AM';
      } else {
        return 'PM';
      }
    },
    '%S': function (date) {
      return leadingNulls(date.tm_sec, 2);
    },
    '%t': function () {
      return '\t';
    },
    '%u': function (date) {
      return date.tm_wday || 7;
    },
    '%U': function (date) {
      var janFirst = new Date(date.tm_year + 1900, 0, 1);
      var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
      var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
      if (compareByDay(firstSunday, endDate) < 0) {
        var februaryFirstUntilEndMonth =
          __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
        var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
        var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
        return leadingNulls(Math.ceil(days / 7), 2);
      }
      return compareByDay(firstSunday, janFirst) === 0 ? '01' : '00';
    },
    '%V': function (date) {
      var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
      var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
      var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
      var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
      var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
      if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
        return '53';
      }
      if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
        return '01';
      }
      var daysDifference;
      if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
        daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
      } else {
        daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
      }
      return leadingNulls(Math.ceil(daysDifference / 7), 2);
    },
    '%w': function (date) {
      return date.tm_wday;
    },
    '%W': function (date) {
      var janFirst = new Date(date.tm_year, 0, 1);
      var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
      var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
      if (compareByDay(firstMonday, endDate) < 0) {
        var februaryFirstUntilEndMonth =
          __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
        var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
        var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
        return leadingNulls(Math.ceil(days / 7), 2);
      }
      return compareByDay(firstMonday, janFirst) === 0 ? '01' : '00';
    },
    '%y': function (date) {
      return (date.tm_year + 1900).toString().substring(2);
    },
    '%Y': function (date) {
      return date.tm_year + 1900;
    },
    '%z': function (date) {
      var off = date.tm_gmtoff;
      var ahead = off >= 0;
      off = Math.abs(off) / 60;
      off = (off / 60) * 100 + (off % 60);
      return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
    },
    '%Z': function (date) {
      return date.tm_zone;
    },
    '%%': function () {
      return '%';
    },
  };
  for (var rule in EXPANSION_RULES_2) {
    if (pattern.includes(rule)) {
      pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
    }
  }
  var bytes = intArrayFromString(pattern, false);
  if (bytes.length > maxsize) {
    return 0;
  }
  writeArrayToMemory(bytes, s);
  return bytes.length - 1;
}
function _strftime_l(s, maxsize, format, tm) {
  return _strftime(s, maxsize, format, tm);
}
function _time(ptr) {
  var ret = (Date.now() / 1e3) | 0;
  if (ptr) {
    HEAP32[ptr >> 2] = ret;
  }
  return ret;
}
var FSNode = function (parent, name, mode, rdev) {
  if (!parent) {
    parent = this;
  }
  this.parent = parent;
  this.mount = parent.mount;
  this.mounted = null;
  this.id = FS.nextInode++;
  this.name = name;
  this.mode = mode;
  this.node_ops = {};
  this.stream_ops = {};
  this.rdev = rdev;
};
var readMode = 292 | 73;
var writeMode = 146;
Object.defineProperties(FSNode.prototype, {
  read: {
    get: function () {
      return (this.mode & readMode) === readMode;
    },
    set: function (val) {
      val ? (this.mode |= readMode) : (this.mode &= ~readMode);
    },
  },
  write: {
    get: function () {
      return (this.mode & writeMode) === writeMode;
    },
    set: function (val) {
      val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
    },
  },
  isFolder: {
    get: function () {
      return FS.isDir(this.mode);
    },
  },
  isDevice: {
    get: function () {
      return FS.isChrdev(this.mode);
    },
  },
});
FS.FSNode = FSNode;
FS.staticInit();
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
init_emval();
UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
var asmLibraryArg = {
  ic: ___clock_gettime,
  l: ___cxa_allocate_exception,
  o: ___cxa_begin_catch,
  pa: ___cxa_call_unexpected,
  n: ___cxa_end_catch,
  b: ___cxa_find_matching_catch_2,
  j: ___cxa_find_matching_catch_3,
  z: ___cxa_find_matching_catch_4,
  m: ___cxa_find_matching_catch_5,
  ia: ___cxa_find_matching_catch_6,
  q: ___cxa_free_exception,
  ea: ___cxa_get_exception_ptr,
  Ab: ___cxa_rethrow,
  t: ___cxa_throw,
  ec: ___cxa_uncaught_exceptions,
  h: ___resumeException,
  zb: ___syscall_fcntl64,
  qc: ___syscall_fstat64,
  oc: ___syscall_fstatat64,
  nc: ___syscall_ftruncate64,
  mc: ___syscall_getcwd,
  hc: ___syscall_getdents64,
  Ra: ___syscall_getegid32,
  Qa: ___syscall_geteuid32,
  Pa: ___syscall_getgid32,
  Oa: ___syscall_getuid32,
  xb: ___syscall_ioctl,
  ub: ___syscall_lstat64,
  jc: ___syscall_mkdir,
  yb: ___syscall_open,
  gc: ___syscall_rename,
  sb: ___syscall_rmdir,
  pc: ___syscall_stat64,
  tb: ___syscall_unlink,
  fd: __embind_register_bigint,
  wc: __embind_register_bool,
  vc: __embind_register_emval,
  Bb: __embind_register_float,
  Ya: __embind_register_function,
  ta: __embind_register_integer,
  ca: __embind_register_memory_view,
  Cb: __embind_register_std_string,
  gb: __embind_register_std_wstring,
  xc: __embind_register_void,
  cc: __emscripten_throw_longjmp,
  Kb: __emval_as,
  ud: __emval_call_method,
  Zb: __emval_decref,
  xd: __emval_get_global,
  rd: __emval_get_method_caller,
  wd: __emval_get_property,
  ba: __emval_incref,
  ld: __emval_new_array,
  eb: __emval_new_cstring,
  Sb: __emval_new_object,
  qd: __emval_run_destructors,
  id: __emval_set_property,
  D: __emval_take_value,
  bc: __emval_typeof,
  sc: __gmtime_js,
  tc: __localtime_js,
  uc: __tzset_js,
  T: _abort,
  Db: _clock,
  _: _clock_gettime,
  U: _emscripten_asm_const_int,
  fc: _emscripten_get_heap_max,
  rc: _emscripten_memcpy_big,
  fb: _emscripten_resize_heap,
  kc: _environ_get,
  lc: _environ_sizes_get,
  qa: _exit,
  Xa: _fd_close,
  wb: _fd_read,
  ed: _fd_seek,
  vb: _fd_write,
  a: _getTempRet0,
  yc: get_unicode_str,
  na: _gettimeofday,
  x: invoke_di,
  M: invoke_dii,
  Aa: invoke_diid,
  ob: invoke_diifii,
  w: invoke_diii,
  ga: invoke_diiii,
  $b: invoke_diiiii,
  kb: invoke_diiiiiddi,
  Ca: invoke_fi,
  Qb: invoke_fiiii,
  u: invoke_i,
  kd: invoke_idi,
  N: invoke_idii,
  c: invoke_ii,
  G: invoke_iid,
  za: invoke_iidd,
  vd: invoke_iiddd,
  sa: invoke_iidddd,
  ka: invoke_iiddddi,
  _b: invoke_iidddiii,
  Yb: invoke_iiddi,
  gd: invoke_iidii,
  f: invoke_iii,
  O: invoke_iiid,
  ya: invoke_iiidddd,
  zd: invoke_iiiddddi,
  Tb: invoke_iiidddi,
  yd: invoke_iiiddi,
  ja: invoke_iiidi,
  mb: invoke_iiidiidiii,
  k: invoke_iiii,
  oa: invoke_iiiid,
  Vb: invoke_iiiidd,
  db: invoke_iiiidi,
  cb: invoke_iiiidiiiiii,
  v: invoke_iiiii,
  Ba: invoke_iiiiid,
  C: invoke_iiiiii,
  Mb: invoke_iiiiiidi,
  Ob: invoke_iiiiiifii,
  A: invoke_iiiiiii,
  ac: invoke_iiiiiiiddiiiiii,
  B: invoke_iiiiiiii,
  K: invoke_iiiiiiiii,
  X: invoke_iiiiiiiiii,
  ma: invoke_iiiiiiiiiii,
  ua: invoke_iiiiiiiiiiii,
  Na: invoke_iiiiiiiiiiiii,
  Ka: invoke_iiiiiiiiiiiiii,
  Va: invoke_iiiiiiiiiiiiiiii,
  hb: invoke_iiiiiiiiiiiiiiiiii,
  md: invoke_iiiiiiiiiiiiiiiiiidi,
  Pb: invoke_iiiiiiiiiiiiiiiiiiiiiiii,
  zc: invoke_iiiiij,
  Kc: invoke_iiiiiji,
  Zc: invoke_iiiijiii,
  Sc: invoke_iiij,
  Yc: invoke_iiiji,
  Ec: invoke_iiijji,
  Qc: invoke_iij,
  Cc: invoke_iiji,
  Oc: invoke_iijiiiiii,
  Jc: invoke_ijiiijiiiiiiiiiii,
  Bc: invoke_j,
  cd: invoke_ji,
  _c: invoke_jii,
  Rc: invoke_jiii,
  Lc: invoke_jiiiii,
  $c: invoke_jij,
  i: invoke_v,
  pb: invoke_vddddddi,
  Jb: invoke_vddii,
  od: invoke_vddiidddiidd,
  Da: invoke_vdi,
  e: invoke_vi,
  F: invoke_vid,
  H: invoke_vidd,
  Wa: invoke_viddd,
  S: invoke_vidddd,
  Q: invoke_vidddddd,
  Ha: invoke_vidddddddd,
  Fa: invoke_vidddddiiiiiiii,
  bb: invoke_vidddiidd,
  ab: invoke_viddi,
  V: invoke_vidi,
  aa: invoke_vidii,
  Rb: invoke_vidiiii,
  hd: invoke_vif,
  d: invoke_vii,
  J: invoke_viid,
  L: invoke_viidd,
  nd: invoke_viiddd,
  W: invoke_viidddd,
  Ib: invoke_viiddddii,
  sd: invoke_viidddi,
  td: invoke_viiddi,
  jd: invoke_viiddii,
  ha: invoke_viiddiii,
  jb: invoke_viidi,
  $a: invoke_viidii,
  la: invoke_viidiii,
  g: invoke_viii,
  wa: invoke_viiid,
  lb: invoke_viiiddddii,
  Gb: invoke_viiiddi,
  Ub: invoke_viiiddiid,
  Ua: invoke_viiidi,
  _a: invoke_viiidiii,
  r: invoke_viiii,
  ra: invoke_viiiid,
  da: invoke_viiiidd,
  Hb: invoke_viiiidddd,
  Za: invoke_viiiiddii,
  xa: invoke_viiiidi,
  rb: invoke_viiiidii,
  pd: invoke_viiiidiiiii,
  y: invoke_viiiii,
  Ja: invoke_viiiiid,
  Fb: invoke_viiiiidd,
  Eb: invoke_viiiiidddd,
  qb: invoke_viiiiidi,
  Ia: invoke_viiiiidiiii,
  E: invoke_viiiiii,
  nb: invoke_viiiiiid,
  Nb: invoke_viiiiiiddi,
  Lb: invoke_viiiiiidii,
  s: invoke_viiiiiii,
  fa: invoke_viiiiiiidi,
  R: invoke_viiiiiiii,
  va: invoke_viiiiiiiidd,
  Z: invoke_viiiiiiiidii,
  P: invoke_viiiiiiiii,
  Y: invoke_viiiiiiiiii,
  ib: invoke_viiiiiiiiiii,
  Ma: invoke_viiiiiiiiiiii,
  Ta: invoke_viiiiiiiiiiiii,
  Sa: invoke_viiiiiiiiiiiiii,
  Ea: invoke_viiiiiiiiiiiiiii,
  Ga: invoke_viiiiiiiiiiiiiiii,
  La: invoke_viiiiiiiiiiiiiiiii,
  Xb: invoke_viiiiiiiiiiiiiiiiiiiii,
  Wb: invoke_viiiiiiiiiiiiiiiiiiiiiiiiii,
  Pc: invoke_viiiiiiiijji,
  Tc: invoke_viiiiiiij,
  Nc: invoke_viiiiij,
  Wc: invoke_viiiiijijji,
  Mc: invoke_viiij,
  Fc: invoke_viiijiiij,
  Dc: invoke_viiijjj,
  ad: invoke_viij,
  Ac: invoke_viiji,
  Gc: invoke_viijijii,
  Xc: invoke_viijj,
  Uc: invoke_viijjii,
  Ic: invoke_viijjiiiii,
  dd: invoke_vij,
  bd: invoke_viji,
  Vc: invoke_vijii,
  Hc: invoke_vijiiiiii,
  p: _llvm_eh_typeid_for,
  I: _setTempRet0,
  dc: _strftime_l,
  $: _time,
};
var asm = createWasm();
var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
  return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['Bd']).apply(null, arguments);
});
var _TRN_TextExtractorGetQuads = (Module['_TRN_TextExtractorGetQuads'] = function () {
  return (_TRN_TextExtractorGetQuads = Module['_TRN_TextExtractorGetQuads'] = Module['asm']['Cd']).apply(null, arguments);
});
var _TRN_TextExtractorCmptSemanticInfo = (Module['_TRN_TextExtractorCmptSemanticInfo'] = function () {
  return (_TRN_TextExtractorCmptSemanticInfo = Module['_TRN_TextExtractorCmptSemanticInfo'] = Module['asm']['Dd']).apply(null, arguments);
});
var _TRN_TextExtractorGetAsTextWithOffsets = (Module['_TRN_TextExtractorGetAsTextWithOffsets'] = function () {
  return (_TRN_TextExtractorGetAsTextWithOffsets = Module['_TRN_TextExtractorGetAsTextWithOffsets'] = Module['asm']['Ed']).apply(null, arguments);
});
var _TRN_PDFDocIsXFA = (Module['_TRN_PDFDocIsXFA'] = function () {
  return (_TRN_PDFDocIsXFA = Module['_TRN_PDFDocIsXFA'] = Module['asm']['Fd']).apply(null, arguments);
});
var _TRN_TextExtractorCreate = (Module['_TRN_TextExtractorCreate'] = function () {
  return (_TRN_TextExtractorCreate = Module['_TRN_TextExtractorCreate'] = Module['asm']['Gd']).apply(null, arguments);
});
var _TRN_TextExtractorSetOCGContext = (Module['_TRN_TextExtractorSetOCGContext'] = function () {
  return (_TRN_TextExtractorSetOCGContext = Module['_TRN_TextExtractorSetOCGContext'] = Module['asm']['Hd']).apply(null, arguments);
});
var _TRN_TextExtractorBegin = (Module['_TRN_TextExtractorBegin'] = function () {
  return (_TRN_TextExtractorBegin = Module['_TRN_TextExtractorBegin'] = Module['asm']['Id']).apply(null, arguments);
});
var _TRN_TextExtractorDestroy = (Module['_TRN_TextExtractorDestroy'] = function () {
  return (_TRN_TextExtractorDestroy = Module['_TRN_TextExtractorDestroy'] = Module['asm']['Jd']).apply(null, arguments);
});
var _TRN_GetFullMessage = (Module['_TRN_GetFullMessage'] = function () {
  return (_TRN_GetFullMessage = Module['_TRN_GetFullMessage'] = Module['asm']['Kd']).apply(null, arguments);
});
var _TRN_UStringCreate = (Module['_TRN_UStringCreate'] = function () {
  return (_TRN_UStringCreate = Module['_TRN_UStringCreate'] = Module['asm']['Ld']).apply(null, arguments);
});
var _TRN_UStringConvertToUtf8 = (Module['_TRN_UStringConvertToUtf8'] = function () {
  return (_TRN_UStringConvertToUtf8 = Module['_TRN_UStringConvertToUtf8'] = Module['asm']['Md']).apply(null, arguments);
});
var _TRN_UStringDestroy = (Module['_TRN_UStringDestroy'] = function () {
  return (_TRN_UStringDestroy = Module['_TRN_UStringDestroy'] = Module['asm']['Nd']).apply(null, arguments);
});
var _TRN_PageIsValid = (Module['_TRN_PageIsValid'] = function () {
  return (_TRN_PageIsValid = Module['_TRN_PageIsValid'] = Module['asm']['Od']).apply(null, arguments);
});
var _TRN_CreateExceptionEx = (Module['_TRN_CreateExceptionEx'] = function () {
  return (_TRN_CreateExceptionEx = Module['_TRN_CreateExceptionEx'] = Module['asm']['Pd']).apply(null, arguments);
});
var _TRN_Matrix2DSet = (Module['_TRN_Matrix2DSet'] = function () {
  return (_TRN_Matrix2DSet = Module['_TRN_Matrix2DSet'] = Module['asm']['Qd']).apply(null, arguments);
});
var _TRN_PageGetDefaultMatrix = (Module['_TRN_PageGetDefaultMatrix'] = function () {
  return (_TRN_PageGetDefaultMatrix = Module['_TRN_PageGetDefaultMatrix'] = Module['asm']['Rd']).apply(null, arguments);
});
var _TRN_Matrix2DCopy = (Module['_TRN_Matrix2DCopy'] = function () {
  return (_TRN_Matrix2DCopy = Module['_TRN_Matrix2DCopy'] = Module['asm']['Sd']).apply(null, arguments);
});
var _TRN_Matrix2DConcat = (Module['_TRN_Matrix2DConcat'] = function () {
  return (_TRN_Matrix2DConcat = Module['_TRN_Matrix2DConcat'] = Module['asm']['Td']).apply(null, arguments);
});
var _TRN_OCGContextDestroy = (Module['_TRN_OCGContextDestroy'] = function () {
  return (_TRN_OCGContextDestroy = Module['_TRN_OCGContextDestroy'] = Module['asm']['Ud']).apply(null, arguments);
});
var _TRN_PDFDocHasOC = (Module['_TRN_PDFDocHasOC'] = function () {
  return (_TRN_PDFDocHasOC = Module['_TRN_PDFDocHasOC'] = Module['asm']['Vd']).apply(null, arguments);
});
var _TRN_PDFDocGetOCGConfig = (Module['_TRN_PDFDocGetOCGConfig'] = function () {
  return (_TRN_PDFDocGetOCGConfig = Module['_TRN_PDFDocGetOCGConfig'] = Module['asm']['Wd']).apply(null, arguments);
});
var _TRN_OCGConfigGetOrder = (Module['_TRN_OCGConfigGetOrder'] = function () {
  return (_TRN_OCGConfigGetOrder = Module['_TRN_OCGConfigGetOrder'] = Module['asm']['Xd']).apply(null, arguments);
});
var _TRN_ObjIsArray = (Module['_TRN_ObjIsArray'] = function () {
  return (_TRN_ObjIsArray = Module['_TRN_ObjIsArray'] = Module['asm']['Yd']).apply(null, arguments);
});
var _TRN_ObjSize = (Module['_TRN_ObjSize'] = function () {
  return (_TRN_ObjSize = Module['_TRN_ObjSize'] = Module['asm']['Zd']).apply(null, arguments);
});
var _TRN_ObjGetAt = (Module['_TRN_ObjGetAt'] = function () {
  return (_TRN_ObjGetAt = Module['_TRN_ObjGetAt'] = Module['asm']['_d']).apply(null, arguments);
});
var _TRN_ObjIsString = (Module['_TRN_ObjIsString'] = function () {
  return (_TRN_ObjIsString = Module['_TRN_ObjIsString'] = Module['asm']['$d']).apply(null, arguments);
});
var _TRN_ObjGetAsPDFText = (Module['_TRN_ObjGetAsPDFText'] = function () {
  return (_TRN_ObjGetAsPDFText = Module['_TRN_ObjGetAsPDFText'] = Module['asm']['ae']).apply(null, arguments);
});
var _TRN_OCGIsValid = (Module['_TRN_OCGIsValid'] = function () {
  return (_TRN_OCGIsValid = Module['_TRN_OCGIsValid'] = Module['asm']['be']).apply(null, arguments);
});
var _TRN_OCGGetName = (Module['_TRN_OCGGetName'] = function () {
  return (_TRN_OCGGetName = Module['_TRN_OCGGetName'] = Module['asm']['ce']).apply(null, arguments);
});
var _TRN_OCGGetInitialState = (Module['_TRN_OCGGetInitialState'] = function () {
  return (_TRN_OCGGetInitialState = Module['_TRN_OCGGetInitialState'] = Module['asm']['de']).apply(null, arguments);
});
var _TRN_OCGIsLocked = (Module['_TRN_OCGIsLocked'] = function () {
  return (_TRN_OCGIsLocked = Module['_TRN_OCGIsLocked'] = Module['asm']['ee']).apply(null, arguments);
});
var _TRN_OCGContextSetState = (Module['_TRN_OCGContextSetState'] = function () {
  return (_TRN_OCGContextSetState = Module['_TRN_OCGContextSetState'] = Module['asm']['fe']).apply(null, arguments);
});
var _TRN_OCGCreateFromObj = (Module['_TRN_OCGCreateFromObj'] = function () {
  return (_TRN_OCGCreateFromObj = Module['_TRN_OCGCreateFromObj'] = Module['asm']['ge']).apply(null, arguments);
});
var _TRN_OCGContextCreateFromConfig = (Module['_TRN_OCGContextCreateFromConfig'] = function () {
  return (_TRN_OCGContextCreateFromConfig = Module['_TRN_OCGContextCreateFromConfig'] = Module['asm']['he']).apply(null, arguments);
});
var _TRN_ObjPutName = (Module['_TRN_ObjPutName'] = function () {
  return (_TRN_ObjPutName = Module['_TRN_ObjPutName'] = Module['asm']['ie']).apply(null, arguments);
});
var _TRN_ObjSetCreate = (Module['_TRN_ObjSetCreate'] = function () {
  return (_TRN_ObjSetCreate = Module['_TRN_ObjSetCreate'] = Module['asm']['je']).apply(null, arguments);
});
var _TRN_ObjSetCreateDict = (Module['_TRN_ObjSetCreateDict'] = function () {
  return (_TRN_ObjSetCreateDict = Module['_TRN_ObjSetCreateDict'] = Module['asm']['ke']).apply(null, arguments);
});
var _TRN_ObjSetDestroy = (Module['_TRN_ObjSetDestroy'] = function () {
  return (_TRN_ObjSetDestroy = Module['_TRN_ObjSetDestroy'] = Module['asm']['le']).apply(null, arguments);
});
var _TRN_ObjSetCreateFromJson = (Module['_TRN_ObjSetCreateFromJson'] = function () {
  return (_TRN_ObjSetCreateFromJson = Module['_TRN_ObjSetCreateFromJson'] = Module['asm']['me']).apply(null, arguments);
});
var _TRN_ObjFindObj = (Module['_TRN_ObjFindObj'] = function () {
  return (_TRN_ObjFindObj = Module['_TRN_ObjFindObj'] = Module['asm']['ne']).apply(null, arguments);
});
var _TRN_ObjIsNull = (Module['_TRN_ObjIsNull'] = function () {
  return (_TRN_ObjIsNull = Module['_TRN_ObjIsNull'] = Module['asm']['oe']).apply(null, arguments);
});
var _TRN_UStringCreateFromCharString = (Module['_TRN_UStringCreateFromCharString'] = function () {
  return (_TRN_UStringCreateFromCharString = Module['_TRN_UStringCreateFromCharString'] = Module['asm']['pe']).apply(null, arguments);
});
var _TRN_ObjPutText = (Module['_TRN_ObjPutText'] = function () {
  return (_TRN_ObjPutText = Module['_TRN_ObjPutText'] = Module['asm']['qe']).apply(null, arguments);
});
var _TRN_ObjPutBool = (Module['_TRN_ObjPutBool'] = function () {
  return (_TRN_ObjPutBool = Module['_TRN_ObjPutBool'] = Module['asm']['re']).apply(null, arguments);
});
var _TRN_ObjPutNumber = (Module['_TRN_ObjPutNumber'] = function () {
  return (_TRN_ObjPutNumber = Module['_TRN_ObjPutNumber'] = Module['asm']['se']).apply(null, arguments);
});
var _TRN_FilterReaderRead = (Module['_TRN_FilterReaderRead'] = function () {
  return (_TRN_FilterReaderRead = Module['_TRN_FilterReaderRead'] = Module['asm']['te']).apply(null, arguments);
});
var _TRN_FilterWriterWriteFilter = (Module['_TRN_FilterWriterWriteFilter'] = function () {
  return (_TRN_FilterWriterWriteFilter = Module['_TRN_FilterWriterWriteFilter'] = Module['asm']['ue']).apply(null, arguments);
});
var _TRN_FilterCreateMemoryFilter = (Module['_TRN_FilterCreateMemoryFilter'] = function () {
  return (_TRN_FilterCreateMemoryFilter = Module['_TRN_FilterCreateMemoryFilter'] = Module['asm']['ve']).apply(null, arguments);
});
var _TRN_FilterDestroy = (Module['_TRN_FilterDestroy'] = function () {
  return (_TRN_FilterDestroy = Module['_TRN_FilterDestroy'] = Module['asm']['we']).apply(null, arguments);
});
var _TRN_FilterWriterCreate = (Module['_TRN_FilterWriterCreate'] = function () {
  return (_TRN_FilterWriterCreate = Module['_TRN_FilterWriterCreate'] = Module['asm']['xe']).apply(null, arguments);
});
var _TRN_FilterWriterFlushAll = (Module['_TRN_FilterWriterFlushAll'] = function () {
  return (_TRN_FilterWriterFlushAll = Module['_TRN_FilterWriterFlushAll'] = Module['asm']['ye']).apply(null, arguments);
});
var _TRN_FilterMemoryFilterGetBuffer = (Module['_TRN_FilterMemoryFilterGetBuffer'] = function () {
  return (_TRN_FilterMemoryFilterGetBuffer = Module['_TRN_FilterMemoryFilterGetBuffer'] = Module['asm']['ze']).apply(null, arguments);
});
var _TRN_FilterCount = (Module['_TRN_FilterCount'] = function () {
  return (_TRN_FilterCount = Module['_TRN_FilterCount'] = Module['asm']['Ae']).apply(null, arguments);
});
var _TRN_FilterWriterDestroy = (Module['_TRN_FilterWriterDestroy'] = function () {
  return (_TRN_FilterWriterDestroy = Module['_TRN_FilterWriterDestroy'] = Module['asm']['Be']).apply(null, arguments);
});
var _TRN_IteratorCurrent = (Module['_TRN_IteratorCurrent'] = function () {
  return (_TRN_IteratorCurrent = Module['_TRN_IteratorCurrent'] = Module['asm']['Ce']).apply(null, arguments);
});
var _TRN_ElementGetPathTypes = (Module['_TRN_ElementGetPathTypes'] = function () {
  return (_TRN_ElementGetPathTypes = Module['_TRN_ElementGetPathTypes'] = Module['asm']['De']).apply(null, arguments);
});
var _TRN_ElementGetPathTypesCount = (Module['_TRN_ElementGetPathTypesCount'] = function () {
  return (_TRN_ElementGetPathTypesCount = Module['_TRN_ElementGetPathTypesCount'] = Module['asm']['Ee']).apply(null, arguments);
});
var _TRN_ElementGetPathPoints = (Module['_TRN_ElementGetPathPoints'] = function () {
  return (_TRN_ElementGetPathPoints = Module['_TRN_ElementGetPathPoints'] = Module['asm']['Fe']).apply(null, arguments);
});
var _TRN_ElementGetPathPointCount = (Module['_TRN_ElementGetPathPointCount'] = function () {
  return (_TRN_ElementGetPathPointCount = Module['_TRN_ElementGetPathPointCount'] = Module['asm']['Ge']).apply(null, arguments);
});
var _TRN_ElementGetTextDataSize = (Module['_TRN_ElementGetTextDataSize'] = function () {
  return (_TRN_ElementGetTextDataSize = Module['_TRN_ElementGetTextDataSize'] = Module['asm']['He']).apply(null, arguments);
});
var _TRN_ElementGetTextData = (Module['_TRN_ElementGetTextData'] = function () {
  return (_TRN_ElementGetTextData = Module['_TRN_ElementGetTextData'] = Module['asm']['Ie']).apply(null, arguments);
});
var _TRN_PDFDrawGetBitmap = (Module['_TRN_PDFDrawGetBitmap'] = function () {
  return (_TRN_PDFDrawGetBitmap = Module['_TRN_PDFDrawGetBitmap'] = Module['asm']['Je']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetBBox = (Module['_TRN_TextExtractorLineGetBBox'] = function () {
  return (_TRN_TextExtractorLineGetBBox = Module['_TRN_TextExtractorLineGetBBox'] = Module['asm']['Ke']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetBBox = (Module['_TRN_TextExtractorWordGetBBox'] = function () {
  return (_TRN_TextExtractorWordGetBBox = Module['_TRN_TextExtractorWordGetBBox'] = Module['asm']['Le']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetQuad = (Module['_TRN_TextExtractorWordGetQuad'] = function () {
  return (_TRN_TextExtractorWordGetQuad = Module['_TRN_TextExtractorWordGetQuad'] = Module['asm']['Me']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetQuad = (Module['_TRN_TextExtractorLineGetQuad'] = function () {
  return (_TRN_TextExtractorLineGetQuad = Module['_TRN_TextExtractorLineGetQuad'] = Module['asm']['Ne']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetGlyphQuad = (Module['_TRN_TextExtractorWordGetGlyphQuad'] = function () {
  return (_TRN_TextExtractorWordGetGlyphQuad = Module['_TRN_TextExtractorWordGetGlyphQuad'] = Module['asm']['Oe']).apply(null, arguments);
});
var _TRN_TextExtractorStyleGetColor = (Module['_TRN_TextExtractorStyleGetColor'] = function () {
  return (_TRN_TextExtractorStyleGetColor = Module['_TRN_TextExtractorStyleGetColor'] = Module['asm']['Pe']).apply(null, arguments);
});
var _TRN_ColorPtInit = (Module['_TRN_ColorPtInit'] = function () {
  return (_TRN_ColorPtInit = Module['_TRN_ColorPtInit'] = Module['asm']['Qe']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetStringLen = (Module['_TRN_TextExtractorWordGetStringLen'] = function () {
  return (_TRN_TextExtractorWordGetStringLen = Module['_TRN_TextExtractorWordGetStringLen'] = Module['asm']['Re']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetString = (Module['_TRN_TextExtractorWordGetString'] = function () {
  return (_TRN_TextExtractorWordGetString = Module['_TRN_TextExtractorWordGetString'] = Module['asm']['Se']).apply(null, arguments);
});
var _TRN_UStringCreateFromSubstring = (Module['_TRN_UStringCreateFromSubstring'] = function () {
  return (_TRN_UStringCreateFromSubstring = Module['_TRN_UStringCreateFromSubstring'] = Module['asm']['Te']).apply(null, arguments);
});
var _TRN_HighlightsCreate = (Module['_TRN_HighlightsCreate'] = function () {
  return (_TRN_HighlightsCreate = Module['_TRN_HighlightsCreate'] = Module['asm']['Ue']).apply(null, arguments);
});
var _TRN_TextExtractorGetHighlights = (Module['_TRN_TextExtractorGetHighlights'] = function () {
  return (_TRN_TextExtractorGetHighlights = Module['_TRN_TextExtractorGetHighlights'] = Module['asm']['Ve']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetUserPasswordSize = (Module['_TRN_SecurityHandlerGetUserPasswordSize'] = function () {
  return (_TRN_SecurityHandlerGetUserPasswordSize = Module['_TRN_SecurityHandlerGetUserPasswordSize'] = Module['asm']['We']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetUserPassword = (Module['_TRN_SecurityHandlerGetUserPassword'] = function () {
  return (_TRN_SecurityHandlerGetUserPassword = Module['_TRN_SecurityHandlerGetUserPassword'] = Module['asm']['Xe']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetMasterPasswordSize = (Module['_TRN_SecurityHandlerGetMasterPasswordSize'] = function () {
  return (_TRN_SecurityHandlerGetMasterPasswordSize = Module['_TRN_SecurityHandlerGetMasterPasswordSize'] = Module['asm']['Ye']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetMasterPassword = (Module['_TRN_SecurityHandlerGetMasterPassword'] = function () {
  return (_TRN_SecurityHandlerGetMasterPassword = Module['_TRN_SecurityHandlerGetMasterPassword'] = Module['asm']['Ze']).apply(null, arguments);
});
var _TRN_PDFDrawExportStream = (Module['_TRN_PDFDrawExportStream'] = function () {
  return (_TRN_PDFDrawExportStream = Module['_TRN_PDFDrawExportStream'] = Module['asm']['_e']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeUserPasswordNonAscii = (Module['_TRN_SecurityHandlerChangeUserPasswordNonAscii'] = function () {
  return (_TRN_SecurityHandlerChangeUserPasswordNonAscii = Module['_TRN_SecurityHandlerChangeUserPasswordNonAscii'] = Module['asm']['$e']).apply(
    null,
    arguments,
  );
});
var _TRN_SecurityHandlerChangeMasterPasswordNonAscii = (Module['_TRN_SecurityHandlerChangeMasterPasswordNonAscii'] = function () {
  return (_TRN_SecurityHandlerChangeMasterPasswordNonAscii = Module['_TRN_SecurityHandlerChangeMasterPasswordNonAscii'] = Module['asm']['af']).apply(
    null,
    arguments,
  );
});
var _TRN_SecurityHandlerInitPassword = (Module['_TRN_SecurityHandlerInitPassword'] = function () {
  return (_TRN_SecurityHandlerInitPassword = Module['_TRN_SecurityHandlerInitPassword'] = Module['asm']['bf']).apply(null, arguments);
});
var _TRN_SecurityHandlerInitPasswordNonAscii = (Module['_TRN_SecurityHandlerInitPasswordNonAscii'] = function () {
  return (_TRN_SecurityHandlerInitPasswordNonAscii = Module['_TRN_SecurityHandlerInitPasswordNonAscii'] = Module['asm']['cf']).apply(null, arguments);
});
var _TRN_ConvertToXodStream = (Module['_TRN_ConvertToXodStream'] = function () {
  return (_TRN_ConvertToXodStream = Module['_TRN_ConvertToXodStream'] = Module['asm']['df']).apply(null, arguments);
});
var _TRN_FilterReaderCreate = (Module['_TRN_FilterReaderCreate'] = function () {
  return (_TRN_FilterReaderCreate = Module['_TRN_FilterReaderCreate'] = Module['asm']['ef']).apply(null, arguments);
});
var _TRN_FilterReaderDestroy = (Module['_TRN_FilterReaderDestroy'] = function () {
  return (_TRN_FilterReaderDestroy = Module['_TRN_FilterReaderDestroy'] = Module['asm']['ff']).apply(null, arguments);
});
var _TRN_HighlightsGetCurrentQuads = (Module['_TRN_HighlightsGetCurrentQuads'] = function () {
  return (_TRN_HighlightsGetCurrentQuads = Module['_TRN_HighlightsGetCurrentQuads'] = Module['asm']['gf']).apply(null, arguments);
});
var _TRN_FontCreateFromObj = (Module['_TRN_FontCreateFromObj'] = function () {
  return (_TRN_FontCreateFromObj = Module['_TRN_FontCreateFromObj'] = Module['asm']['hf']).apply(null, arguments);
});
var _TRN_RedactionAppearanceCreate = (Module['_TRN_RedactionAppearanceCreate'] = function () {
  return (_TRN_RedactionAppearanceCreate = Module['_TRN_RedactionAppearanceCreate'] = Module['asm']['jf']).apply(null, arguments);
});
var _TRN_RedactorRedact = (Module['_TRN_RedactorRedact'] = function () {
  return (_TRN_RedactorRedact = Module['_TRN_RedactorRedact'] = Module['asm']['kf']).apply(null, arguments);
});
var _TRN_ElementGetBBox = (Module['_TRN_ElementGetBBox'] = function () {
  return (_TRN_ElementGetBBox = Module['_TRN_ElementGetBBox'] = Module['asm']['lf']).apply(null, arguments);
});
var _TRN_Matrix2DMult = (Module['_TRN_Matrix2DMult'] = function () {
  return (_TRN_Matrix2DMult = Module['_TRN_Matrix2DMult'] = Module['asm']['mf']).apply(null, arguments);
});
var _TRN_PDFDocInitSecurityHandler = (Module['_TRN_PDFDocInitSecurityHandler'] = function () {
  return (_TRN_PDFDocInitSecurityHandler = Module['_TRN_PDFDocInitSecurityHandler'] = Module['asm']['nf']).apply(null, arguments);
});
var _TRN_SDFDocInitSecurityHandler = (Module['_TRN_SDFDocInitSecurityHandler'] = function () {
  return (_TRN_SDFDocInitSecurityHandler = Module['_TRN_SDFDocInitSecurityHandler'] = Module['asm']['of']).apply(null, arguments);
});
var _TRN_FilterWriterWriteBuffer = (Module['_TRN_FilterWriterWriteBuffer'] = function () {
  return (_TRN_FilterWriterWriteBuffer = Module['_TRN_FilterWriterWriteBuffer'] = Module['asm']['pf']).apply(null, arguments);
});
var _TRN_FilterMemoryFilterSetAsInputFilter = (Module['_TRN_FilterMemoryFilterSetAsInputFilter'] = function () {
  return (_TRN_FilterMemoryFilterSetAsInputFilter = Module['_TRN_FilterMemoryFilterSetAsInputFilter'] = Module['asm']['qf']).apply(null, arguments);
});
var _TRN_FilterCreateFlateEncode = (Module['_TRN_FilterCreateFlateEncode'] = function () {
  return (_TRN_FilterCreateFlateEncode = Module['_TRN_FilterCreateFlateEncode'] = Module['asm']['rf']).apply(null, arguments);
});
var _TRN_TextSearchRun = (Module['_TRN_TextSearchRun'] = function () {
  return (_TRN_TextSearchRun = Module['_TRN_TextSearchRun'] = Module['asm']['sf']).apply(null, arguments);
});
var _TRN_PDFDocImportPages = (Module['_TRN_PDFDocImportPages'] = function () {
  return (_TRN_PDFDocImportPages = Module['_TRN_PDFDocImportPages'] = Module['asm']['tf']).apply(null, arguments);
});
var _TRN_SDFDocCustomQuery = (Module['_TRN_SDFDocCustomQuery'] = function () {
  return (_TRN_SDFDocCustomQuery = Module['_TRN_SDFDocCustomQuery'] = Module['asm']['uf']).apply(null, arguments);
});
var _TRN_ElementSetPathPoints = (Module['_TRN_ElementSetPathPoints'] = function () {
  return (_TRN_ElementSetPathPoints = Module['_TRN_ElementSetPathPoints'] = Module['asm']['vf']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateUnicodeTextRun = (Module['_TRN_ElementBuilderCreateUnicodeTextRun'] = function () {
  return (_TRN_ElementBuilderCreateUnicodeTextRun = Module['_TRN_ElementBuilderCreateUnicodeTextRun'] = Module['asm']['wf']).apply(null, arguments);
});
var _TRN_UStringCStr = (Module['_TRN_UStringCStr'] = function () {
  return (_TRN_UStringCStr = Module['_TRN_UStringCStr'] = Module['asm']['xf']).apply(null, arguments);
});
var _TRN_UStringGetLength = (Module['_TRN_UStringGetLength'] = function () {
  return (_TRN_UStringGetLength = Module['_TRN_UStringGetLength'] = Module['asm']['yf']).apply(null, arguments);
});
var _TRN_PDFAComplianceCreateFromBuffer = (Module['_TRN_PDFAComplianceCreateFromBuffer'] = function () {
  return (_TRN_PDFAComplianceCreateFromBuffer = Module['_TRN_PDFAComplianceCreateFromBuffer'] = Module['asm']['zf']).apply(null, arguments);
});
var _TRN_OptimizerOptimize = (Module['_TRN_OptimizerOptimize'] = function () {
  return (_TRN_OptimizerOptimize = Module['_TRN_OptimizerOptimize'] = Module['asm']['Af']).apply(null, arguments);
});
var _TRN_PDFRasterizerRasterizeToMemory = (Module['_TRN_PDFRasterizerRasterizeToMemory'] = function () {
  return (_TRN_PDFRasterizerRasterizeToMemory = Module['_TRN_PDFRasterizerRasterizeToMemory'] = Module['asm']['Bf']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetCertPathsFromCMS_GetOutterVecSize = (Module['_TRN_DigitalSignatureFieldGetCertPathsFromCMS_GetOutterVecSize'] = function () {
  return (_TRN_DigitalSignatureFieldGetCertPathsFromCMS_GetOutterVecSize = Module['_TRN_DigitalSignatureFieldGetCertPathsFromCMS_GetOutterVecSize'] =
    Module['asm']['Cf']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetCertPathsFromCMS = (Module['_TRN_DigitalSignatureFieldGetCertPathsFromCMS'] = function () {
  return (_TRN_DigitalSignatureFieldGetCertPathsFromCMS = Module['_TRN_DigitalSignatureFieldGetCertPathsFromCMS'] = Module['asm']['Df']).apply(null, arguments);
});
var _TRN_VectorGetSize = (Module['_TRN_VectorGetSize'] = function () {
  return (_TRN_VectorGetSize = Module['_TRN_VectorGetSize'] = Module['asm']['Ef']).apply(null, arguments);
});
var _TRN_VectorGetAt = (Module['_TRN_VectorGetAt'] = function () {
  return (_TRN_VectorGetAt = Module['_TRN_VectorGetAt'] = Module['asm']['Ff']).apply(null, arguments);
});
var _TRN_VectorDestroyKeepContents = (Module['_TRN_VectorDestroyKeepContents'] = function () {
  return (_TRN_VectorDestroyKeepContents = Module['_TRN_VectorDestroyKeepContents'] = Module['asm']['Gf']).apply(null, arguments);
});
var _TRN_UStringConvertToUtf32 = (Module['_TRN_UStringConvertToUtf32'] = function () {
  return (_TRN_UStringConvertToUtf32 = Module['_TRN_UStringConvertToUtf32'] = Module['asm']['Hf']).apply(null, arguments);
});
var _TRN_UStringCreateFromUtf32String = (Module['_TRN_UStringCreateFromUtf32String'] = function () {
  return (_TRN_UStringCreateFromUtf32String = Module['_TRN_UStringCreateFromUtf32String'] = Module['asm']['If']).apply(null, arguments);
});
var _malloc = (Module['_malloc'] = function () {
  return (_malloc = Module['_malloc'] = Module['asm']['Jf']).apply(null, arguments);
});
var _TRN_EMSCreateSharedWorkerInstance = (Module['_TRN_EMSCreateSharedWorkerInstance'] = function () {
  return (_TRN_EMSCreateSharedWorkerInstance = Module['_TRN_EMSCreateSharedWorkerInstance'] = Module['asm']['Kf']).apply(null, arguments);
});
var _TRN_EMSWorkerInstanceGetFunctionIterator = (Module['_TRN_EMSWorkerInstanceGetFunctionIterator'] = function () {
  return (_TRN_EMSWorkerInstanceGetFunctionIterator = Module['_TRN_EMSWorkerInstanceGetFunctionIterator'] = Module['asm']['Lf']).apply(null, arguments);
});
var _TRN_EMSFunctionIteratorGetNextCommandName = (Module['_TRN_EMSFunctionIteratorGetNextCommandName'] = function () {
  return (_TRN_EMSFunctionIteratorGetNextCommandName = Module['_TRN_EMSFunctionIteratorGetNextCommandName'] = Module['asm']['Mf']).apply(null, arguments);
});
var _TRN_EMSFunctionIteratorDestroy = (Module['_TRN_EMSFunctionIteratorDestroy'] = function () {
  return (_TRN_EMSFunctionIteratorDestroy = Module['_TRN_EMSFunctionIteratorDestroy'] = Module['asm']['Nf']).apply(null, arguments);
});
var __Z29EMSCreateUpdatedLayersContextmN10emscripten3valE = (Module['__Z29EMSCreateUpdatedLayersContextmN10emscripten3valE'] = function () {
  return (__Z29EMSCreateUpdatedLayersContextmN10emscripten3valE = Module['__Z29EMSCreateUpdatedLayersContextmN10emscripten3valE'] = Module['asm']['Of']).apply(
    null,
    arguments,
  );
});
var _TRN_EMSCreatePDFNetWorkerInstance = (Module['_TRN_EMSCreatePDFNetWorkerInstance'] = function () {
  return (_TRN_EMSCreatePDFNetWorkerInstance = Module['_TRN_EMSCreatePDFNetWorkerInstance'] = Module['asm']['Pf']).apply(null, arguments);
});
var _TRN_IteratorHasNext = (Module['_TRN_IteratorHasNext'] = function () {
  return (_TRN_IteratorHasNext = Module['_TRN_IteratorHasNext'] = Module['asm']['Qf']).apply(null, arguments);
});
var _TRN_IteratorNext = (Module['_TRN_IteratorNext'] = function () {
  return (_TRN_IteratorNext = Module['_TRN_IteratorNext'] = Module['asm']['Rf']).apply(null, arguments);
});
var _TRN_IteratorDestroy = (Module['_TRN_IteratorDestroy'] = function () {
  return (_TRN_IteratorDestroy = Module['_TRN_IteratorDestroy'] = Module['asm']['Sf']).apply(null, arguments);
});
var _TRN_DictIteratorHasNext = (Module['_TRN_DictIteratorHasNext'] = function () {
  return (_TRN_DictIteratorHasNext = Module['_TRN_DictIteratorHasNext'] = Module['asm']['Tf']).apply(null, arguments);
});
var _TRN_DictIteratorKey = (Module['_TRN_DictIteratorKey'] = function () {
  return (_TRN_DictIteratorKey = Module['_TRN_DictIteratorKey'] = Module['asm']['Uf']).apply(null, arguments);
});
var _TRN_DictIteratorValue = (Module['_TRN_DictIteratorValue'] = function () {
  return (_TRN_DictIteratorValue = Module['_TRN_DictIteratorValue'] = Module['asm']['Vf']).apply(null, arguments);
});
var _TRN_DictIteratorNext = (Module['_TRN_DictIteratorNext'] = function () {
  return (_TRN_DictIteratorNext = Module['_TRN_DictIteratorNext'] = Module['asm']['Wf']).apply(null, arguments);
});
var _TRN_DictIteratorDestroy = (Module['_TRN_DictIteratorDestroy'] = function () {
  return (_TRN_DictIteratorDestroy = Module['_TRN_DictIteratorDestroy'] = Module['asm']['Xf']).apply(null, arguments);
});
var _TRN_Matrix2DEquals = (Module['_TRN_Matrix2DEquals'] = function () {
  return (_TRN_Matrix2DEquals = Module['_TRN_Matrix2DEquals'] = Module['asm']['Yf']).apply(null, arguments);
});
var _TRN_Matrix2DInverse = (Module['_TRN_Matrix2DInverse'] = function () {
  return (_TRN_Matrix2DInverse = Module['_TRN_Matrix2DInverse'] = Module['asm']['Zf']).apply(null, arguments);
});
var _TRN_Matrix2DTranslate = (Module['_TRN_Matrix2DTranslate'] = function () {
  return (_TRN_Matrix2DTranslate = Module['_TRN_Matrix2DTranslate'] = Module['asm']['_f']).apply(null, arguments);
});
var _TRN_Matrix2DPreTranslate = (Module['_TRN_Matrix2DPreTranslate'] = function () {
  return (_TRN_Matrix2DPreTranslate = Module['_TRN_Matrix2DPreTranslate'] = Module['asm']['$f']).apply(null, arguments);
});
var _TRN_Matrix2DPostTranslate = (Module['_TRN_Matrix2DPostTranslate'] = function () {
  return (_TRN_Matrix2DPostTranslate = Module['_TRN_Matrix2DPostTranslate'] = Module['asm']['ag']).apply(null, arguments);
});
var _TRN_Matrix2DScale = (Module['_TRN_Matrix2DScale'] = function () {
  return (_TRN_Matrix2DScale = Module['_TRN_Matrix2DScale'] = Module['asm']['bg']).apply(null, arguments);
});
var _TRN_Matrix2DCreateZeroMatrix = (Module['_TRN_Matrix2DCreateZeroMatrix'] = function () {
  return (_TRN_Matrix2DCreateZeroMatrix = Module['_TRN_Matrix2DCreateZeroMatrix'] = Module['asm']['cg']).apply(null, arguments);
});
var _TRN_Matrix2DCreateIdentityMatrix = (Module['_TRN_Matrix2DCreateIdentityMatrix'] = function () {
  return (_TRN_Matrix2DCreateIdentityMatrix = Module['_TRN_Matrix2DCreateIdentityMatrix'] = Module['asm']['dg']).apply(null, arguments);
});
var _TRN_Matrix2DCreateRotationMatrix = (Module['_TRN_Matrix2DCreateRotationMatrix'] = function () {
  return (_TRN_Matrix2DCreateRotationMatrix = Module['_TRN_Matrix2DCreateRotationMatrix'] = Module['asm']['eg']).apply(null, arguments);
});
var _TRN_Matrix2DMultiply = (Module['_TRN_Matrix2DMultiply'] = function () {
  return (_TRN_Matrix2DMultiply = Module['_TRN_Matrix2DMultiply'] = Module['asm']['fg']).apply(null, arguments);
});
var _TRN_FieldCreate = (Module['_TRN_FieldCreate'] = function () {
  return (_TRN_FieldCreate = Module['_TRN_FieldCreate'] = Module['asm']['gg']).apply(null, arguments);
});
var _TRN_FieldIsValid = (Module['_TRN_FieldIsValid'] = function () {
  return (_TRN_FieldIsValid = Module['_TRN_FieldIsValid'] = Module['asm']['hg']).apply(null, arguments);
});
var _TRN_FieldGetType = (Module['_TRN_FieldGetType'] = function () {
  return (_TRN_FieldGetType = Module['_TRN_FieldGetType'] = Module['asm']['ig']).apply(null, arguments);
});
var _TRN_FieldGetValue = (Module['_TRN_FieldGetValue'] = function () {
  return (_TRN_FieldGetValue = Module['_TRN_FieldGetValue'] = Module['asm']['jg']).apply(null, arguments);
});
var _TRN_FieldGetValueAsString = (Module['_TRN_FieldGetValueAsString'] = function () {
  return (_TRN_FieldGetValueAsString = Module['_TRN_FieldGetValueAsString'] = Module['asm']['kg']).apply(null, arguments);
});
var _TRN_FieldGetDefaultValueAsString = (Module['_TRN_FieldGetDefaultValueAsString'] = function () {
  return (_TRN_FieldGetDefaultValueAsString = Module['_TRN_FieldGetDefaultValueAsString'] = Module['asm']['lg']).apply(null, arguments);
});
var _TRN_FieldSetValueAsString = (Module['_TRN_FieldSetValueAsString'] = function () {
  return (_TRN_FieldSetValueAsString = Module['_TRN_FieldSetValueAsString'] = Module['asm']['mg']).apply(null, arguments);
});
var _TRN_FieldSetValue = (Module['_TRN_FieldSetValue'] = function () {
  return (_TRN_FieldSetValue = Module['_TRN_FieldSetValue'] = Module['asm']['ng']).apply(null, arguments);
});
var _TRN_FieldSetValueAsBool = (Module['_TRN_FieldSetValueAsBool'] = function () {
  return (_TRN_FieldSetValueAsBool = Module['_TRN_FieldSetValueAsBool'] = Module['asm']['og']).apply(null, arguments);
});
var _TRN_FieldGetTriggerAction = (Module['_TRN_FieldGetTriggerAction'] = function () {
  return (_TRN_FieldGetTriggerAction = Module['_TRN_FieldGetTriggerAction'] = Module['asm']['pg']).apply(null, arguments);
});
var _TRN_FieldGetValueAsBool = (Module['_TRN_FieldGetValueAsBool'] = function () {
  return (_TRN_FieldGetValueAsBool = Module['_TRN_FieldGetValueAsBool'] = Module['asm']['qg']).apply(null, arguments);
});
var _TRN_FieldRefreshAppearance = (Module['_TRN_FieldRefreshAppearance'] = function () {
  return (_TRN_FieldRefreshAppearance = Module['_TRN_FieldRefreshAppearance'] = Module['asm']['rg']).apply(null, arguments);
});
var _TRN_FieldEraseAppearance = (Module['_TRN_FieldEraseAppearance'] = function () {
  return (_TRN_FieldEraseAppearance = Module['_TRN_FieldEraseAppearance'] = Module['asm']['sg']).apply(null, arguments);
});
var _TRN_FieldGetDefaultValue = (Module['_TRN_FieldGetDefaultValue'] = function () {
  return (_TRN_FieldGetDefaultValue = Module['_TRN_FieldGetDefaultValue'] = Module['asm']['tg']).apply(null, arguments);
});
var _TRN_FieldGetName = (Module['_TRN_FieldGetName'] = function () {
  return (_TRN_FieldGetName = Module['_TRN_FieldGetName'] = Module['asm']['ug']).apply(null, arguments);
});
var _TRN_FieldGetPartialName = (Module['_TRN_FieldGetPartialName'] = function () {
  return (_TRN_FieldGetPartialName = Module['_TRN_FieldGetPartialName'] = Module['asm']['vg']).apply(null, arguments);
});
var _TRN_FieldRename = (Module['_TRN_FieldRename'] = function () {
  return (_TRN_FieldRename = Module['_TRN_FieldRename'] = Module['asm']['wg']).apply(null, arguments);
});
var _TRN_FieldIsAnnot = (Module['_TRN_FieldIsAnnot'] = function () {
  return (_TRN_FieldIsAnnot = Module['_TRN_FieldIsAnnot'] = Module['asm']['xg']).apply(null, arguments);
});
var _TRN_FieldUseSignatureHandler = (Module['_TRN_FieldUseSignatureHandler'] = function () {
  return (_TRN_FieldUseSignatureHandler = Module['_TRN_FieldUseSignatureHandler'] = Module['asm']['yg']).apply(null, arguments);
});
var _TRN_FieldGetFlag = (Module['_TRN_FieldGetFlag'] = function () {
  return (_TRN_FieldGetFlag = Module['_TRN_FieldGetFlag'] = Module['asm']['zg']).apply(null, arguments);
});
var _TRN_FieldSetFlag = (Module['_TRN_FieldSetFlag'] = function () {
  return (_TRN_FieldSetFlag = Module['_TRN_FieldSetFlag'] = Module['asm']['Ag']).apply(null, arguments);
});
var _TRN_FieldGetJustification = (Module['_TRN_FieldGetJustification'] = function () {
  return (_TRN_FieldGetJustification = Module['_TRN_FieldGetJustification'] = Module['asm']['Bg']).apply(null, arguments);
});
var _TRN_FieldSetJustification = (Module['_TRN_FieldSetJustification'] = function () {
  return (_TRN_FieldSetJustification = Module['_TRN_FieldSetJustification'] = Module['asm']['Cg']).apply(null, arguments);
});
var _TRN_FieldSetMaxLen = (Module['_TRN_FieldSetMaxLen'] = function () {
  return (_TRN_FieldSetMaxLen = Module['_TRN_FieldSetMaxLen'] = Module['asm']['Dg']).apply(null, arguments);
});
var _TRN_FieldGetMaxLen = (Module['_TRN_FieldGetMaxLen'] = function () {
  return (_TRN_FieldGetMaxLen = Module['_TRN_FieldGetMaxLen'] = Module['asm']['Eg']).apply(null, arguments);
});
var _TRN_FieldGetDefaultAppearance = (Module['_TRN_FieldGetDefaultAppearance'] = function () {
  return (_TRN_FieldGetDefaultAppearance = Module['_TRN_FieldGetDefaultAppearance'] = Module['asm']['Fg']).apply(null, arguments);
});
var _TRN_FieldGetUpdateRect = (Module['_TRN_FieldGetUpdateRect'] = function () {
  return (_TRN_FieldGetUpdateRect = Module['_TRN_FieldGetUpdateRect'] = Module['asm']['Gg']).apply(null, arguments);
});
var _TRN_FieldFlatten = (Module['_TRN_FieldFlatten'] = function () {
  return (_TRN_FieldFlatten = Module['_TRN_FieldFlatten'] = Module['asm']['Hg']).apply(null, arguments);
});
var _TRN_FieldFindInheritedAttribute = (Module['_TRN_FieldFindInheritedAttribute'] = function () {
  return (_TRN_FieldFindInheritedAttribute = Module['_TRN_FieldFindInheritedAttribute'] = Module['asm']['Ig']).apply(null, arguments);
});
var _TRN_FieldGetSDFObj = (Module['_TRN_FieldGetSDFObj'] = function () {
  return (_TRN_FieldGetSDFObj = Module['_TRN_FieldGetSDFObj'] = Module['asm']['Jg']).apply(null, arguments);
});
var _TRN_FieldGetOptCount = (Module['_TRN_FieldGetOptCount'] = function () {
  return (_TRN_FieldGetOptCount = Module['_TRN_FieldGetOptCount'] = Module['asm']['Kg']).apply(null, arguments);
});
var _TRN_FieldGetOpt = (Module['_TRN_FieldGetOpt'] = function () {
  return (_TRN_FieldGetOpt = Module['_TRN_FieldGetOpt'] = Module['asm']['Lg']).apply(null, arguments);
});
var _TRN_FieldIsLockedByDigitalSignature = (Module['_TRN_FieldIsLockedByDigitalSignature'] = function () {
  return (_TRN_FieldIsLockedByDigitalSignature = Module['_TRN_FieldIsLockedByDigitalSignature'] = Module['asm']['Mg']).apply(null, arguments);
});
var _TRN_FDFDocCreate = (Module['_TRN_FDFDocCreate'] = function () {
  return (_TRN_FDFDocCreate = Module['_TRN_FDFDocCreate'] = Module['asm']['Ng']).apply(null, arguments);
});
var _TRN_FDFDocCreateFromStream = (Module['_TRN_FDFDocCreateFromStream'] = function () {
  return (_TRN_FDFDocCreateFromStream = Module['_TRN_FDFDocCreateFromStream'] = Module['asm']['Og']).apply(null, arguments);
});
var _TRN_FDFDocCreateFromMemoryBuffer = (Module['_TRN_FDFDocCreateFromMemoryBuffer'] = function () {
  return (_TRN_FDFDocCreateFromMemoryBuffer = Module['_TRN_FDFDocCreateFromMemoryBuffer'] = Module['asm']['Pg']).apply(null, arguments);
});
var _TRN_FDFDocDestroy = (Module['_TRN_FDFDocDestroy'] = function () {
  return (_TRN_FDFDocDestroy = Module['_TRN_FDFDocDestroy'] = Module['asm']['Qg']).apply(null, arguments);
});
var _TRN_FDFDocIsModified = (Module['_TRN_FDFDocIsModified'] = function () {
  return (_TRN_FDFDocIsModified = Module['_TRN_FDFDocIsModified'] = Module['asm']['Rg']).apply(null, arguments);
});
var _TRN_FDFDocSaveMemoryBuffer = (Module['_TRN_FDFDocSaveMemoryBuffer'] = function () {
  return (_TRN_FDFDocSaveMemoryBuffer = Module['_TRN_FDFDocSaveMemoryBuffer'] = Module['asm']['Sg']).apply(null, arguments);
});
var _TRN_FDFDocGetTrailer = (Module['_TRN_FDFDocGetTrailer'] = function () {
  return (_TRN_FDFDocGetTrailer = Module['_TRN_FDFDocGetTrailer'] = Module['asm']['Tg']).apply(null, arguments);
});
var _TRN_FDFDocGetRoot = (Module['_TRN_FDFDocGetRoot'] = function () {
  return (_TRN_FDFDocGetRoot = Module['_TRN_FDFDocGetRoot'] = Module['asm']['Ug']).apply(null, arguments);
});
var _TRN_FDFDocGetFDF = (Module['_TRN_FDFDocGetFDF'] = function () {
  return (_TRN_FDFDocGetFDF = Module['_TRN_FDFDocGetFDF'] = Module['asm']['Vg']).apply(null, arguments);
});
var _TRN_FDFDocGetPDFFileName = (Module['_TRN_FDFDocGetPDFFileName'] = function () {
  return (_TRN_FDFDocGetPDFFileName = Module['_TRN_FDFDocGetPDFFileName'] = Module['asm']['Wg']).apply(null, arguments);
});
var _TRN_FDFDocSetPDFFileName = (Module['_TRN_FDFDocSetPDFFileName'] = function () {
  return (_TRN_FDFDocSetPDFFileName = Module['_TRN_FDFDocSetPDFFileName'] = Module['asm']['Xg']).apply(null, arguments);
});
var _TRN_FDFDocGetID = (Module['_TRN_FDFDocGetID'] = function () {
  return (_TRN_FDFDocGetID = Module['_TRN_FDFDocGetID'] = Module['asm']['Yg']).apply(null, arguments);
});
var _TRN_FDFDocSetID = (Module['_TRN_FDFDocSetID'] = function () {
  return (_TRN_FDFDocSetID = Module['_TRN_FDFDocSetID'] = Module['asm']['Zg']).apply(null, arguments);
});
var _TRN_FDFDocGetFieldIteratorBegin = (Module['_TRN_FDFDocGetFieldIteratorBegin'] = function () {
  return (_TRN_FDFDocGetFieldIteratorBegin = Module['_TRN_FDFDocGetFieldIteratorBegin'] = Module['asm']['_g']).apply(null, arguments);
});
var _TRN_FDFDocGetFieldIterator = (Module['_TRN_FDFDocGetFieldIterator'] = function () {
  return (_TRN_FDFDocGetFieldIterator = Module['_TRN_FDFDocGetFieldIterator'] = Module['asm']['$g']).apply(null, arguments);
});
var _TRN_FDFDocGetField = (Module['_TRN_FDFDocGetField'] = function () {
  return (_TRN_FDFDocGetField = Module['_TRN_FDFDocGetField'] = Module['asm']['ah']).apply(null, arguments);
});
var _TRN_FDFDocFieldCreate = (Module['_TRN_FDFDocFieldCreate'] = function () {
  return (_TRN_FDFDocFieldCreate = Module['_TRN_FDFDocFieldCreate'] = Module['asm']['bh']).apply(null, arguments);
});
var _TRN_FDFDocFieldCreateFromString = (Module['_TRN_FDFDocFieldCreateFromString'] = function () {
  return (_TRN_FDFDocFieldCreateFromString = Module['_TRN_FDFDocFieldCreateFromString'] = Module['asm']['ch']).apply(null, arguments);
});
var _TRN_FDFDocGetSDFDoc = (Module['_TRN_FDFDocGetSDFDoc'] = function () {
  return (_TRN_FDFDocGetSDFDoc = Module['_TRN_FDFDocGetSDFDoc'] = Module['asm']['dh']).apply(null, arguments);
});
var _TRN_FDFDocCreateFromXFDF = (Module['_TRN_FDFDocCreateFromXFDF'] = function () {
  return (_TRN_FDFDocCreateFromXFDF = Module['_TRN_FDFDocCreateFromXFDF'] = Module['asm']['eh']).apply(null, arguments);
});
var _TRN_FDFDocSaveAsXFDFWithOptions = (Module['_TRN_FDFDocSaveAsXFDFWithOptions'] = function () {
  return (_TRN_FDFDocSaveAsXFDFWithOptions = Module['_TRN_FDFDocSaveAsXFDFWithOptions'] = Module['asm']['fh']).apply(null, arguments);
});
var _TRN_FDFDocSaveAsXFDFAsString = (Module['_TRN_FDFDocSaveAsXFDFAsString'] = function () {
  return (_TRN_FDFDocSaveAsXFDFAsString = Module['_TRN_FDFDocSaveAsXFDFAsString'] = Module['asm']['gh']).apply(null, arguments);
});
var _TRN_FDFDocSaveAsXFDFAsStringWithOptions = (Module['_TRN_FDFDocSaveAsXFDFAsStringWithOptions'] = function () {
  return (_TRN_FDFDocSaveAsXFDFAsStringWithOptions = Module['_TRN_FDFDocSaveAsXFDFAsStringWithOptions'] = Module['asm']['hh']).apply(null, arguments);
});
var _TRN_FDFDocMergeAnnots = (Module['_TRN_FDFDocMergeAnnots'] = function () {
  return (_TRN_FDFDocMergeAnnots = Module['_TRN_FDFDocMergeAnnots'] = Module['asm']['ih']).apply(null, arguments);
});
var _TRN_FDFFieldCreate = (Module['_TRN_FDFFieldCreate'] = function () {
  return (_TRN_FDFFieldCreate = Module['_TRN_FDFFieldCreate'] = Module['asm']['jh']).apply(null, arguments);
});
var _TRN_FDFFieldGetValue = (Module['_TRN_FDFFieldGetValue'] = function () {
  return (_TRN_FDFFieldGetValue = Module['_TRN_FDFFieldGetValue'] = Module['asm']['kh']).apply(null, arguments);
});
var _TRN_FDFFieldSetValue = (Module['_TRN_FDFFieldSetValue'] = function () {
  return (_TRN_FDFFieldSetValue = Module['_TRN_FDFFieldSetValue'] = Module['asm']['lh']).apply(null, arguments);
});
var _TRN_FDFFieldGetName = (Module['_TRN_FDFFieldGetName'] = function () {
  return (_TRN_FDFFieldGetName = Module['_TRN_FDFFieldGetName'] = Module['asm']['mh']).apply(null, arguments);
});
var _TRN_FDFFieldGetPartialName = (Module['_TRN_FDFFieldGetPartialName'] = function () {
  return (_TRN_FDFFieldGetPartialName = Module['_TRN_FDFFieldGetPartialName'] = Module['asm']['nh']).apply(null, arguments);
});
var _TRN_FDFFieldGetSDFObj = (Module['_TRN_FDFFieldGetSDFObj'] = function () {
  return (_TRN_FDFFieldGetSDFObj = Module['_TRN_FDFFieldGetSDFObj'] = Module['asm']['oh']).apply(null, arguments);
});
var _TRN_FDFFieldFindAttribute = (Module['_TRN_FDFFieldFindAttribute'] = function () {
  return (_TRN_FDFFieldFindAttribute = Module['_TRN_FDFFieldFindAttribute'] = Module['asm']['ph']).apply(null, arguments);
});
var _TRN_FilterCreateASCII85Encode = (Module['_TRN_FilterCreateASCII85Encode'] = function () {
  return (_TRN_FilterCreateASCII85Encode = Module['_TRN_FilterCreateASCII85Encode'] = Module['asm']['qh']).apply(null, arguments);
});
var _TRN_FilterCreateImage2RGBFromElement = (Module['_TRN_FilterCreateImage2RGBFromElement'] = function () {
  return (_TRN_FilterCreateImage2RGBFromElement = Module['_TRN_FilterCreateImage2RGBFromElement'] = Module['asm']['rh']).apply(null, arguments);
});
var _TRN_FilterCreateImage2RGBFromObj = (Module['_TRN_FilterCreateImage2RGBFromObj'] = function () {
  return (_TRN_FilterCreateImage2RGBFromObj = Module['_TRN_FilterCreateImage2RGBFromObj'] = Module['asm']['sh']).apply(null, arguments);
});
var _TRN_FilterCreateImage2RGB = (Module['_TRN_FilterCreateImage2RGB'] = function () {
  return (_TRN_FilterCreateImage2RGB = Module['_TRN_FilterCreateImage2RGB'] = Module['asm']['th']).apply(null, arguments);
});
var _TRN_FilterCreateImage2RGBAFromElement = (Module['_TRN_FilterCreateImage2RGBAFromElement'] = function () {
  return (_TRN_FilterCreateImage2RGBAFromElement = Module['_TRN_FilterCreateImage2RGBAFromElement'] = Module['asm']['uh']).apply(null, arguments);
});
var _TRN_FilterCreateImage2RGBAFromObj = (Module['_TRN_FilterCreateImage2RGBAFromObj'] = function () {
  return (_TRN_FilterCreateImage2RGBAFromObj = Module['_TRN_FilterCreateImage2RGBAFromObj'] = Module['asm']['vh']).apply(null, arguments);
});
var _TRN_FilterCreateImage2RGBA = (Module['_TRN_FilterCreateImage2RGBA'] = function () {
  return (_TRN_FilterCreateImage2RGBA = Module['_TRN_FilterCreateImage2RGBA'] = Module['asm']['wh']).apply(null, arguments);
});
var _TRN_FilterAttachFilter = (Module['_TRN_FilterAttachFilter'] = function () {
  return (_TRN_FilterAttachFilter = Module['_TRN_FilterAttachFilter'] = Module['asm']['xh']).apply(null, arguments);
});
var _TRN_FilterReleaseAttachedFilter = (Module['_TRN_FilterReleaseAttachedFilter'] = function () {
  return (_TRN_FilterReleaseAttachedFilter = Module['_TRN_FilterReleaseAttachedFilter'] = Module['asm']['yh']).apply(null, arguments);
});
var _TRN_FilterGetAttachedFilter = (Module['_TRN_FilterGetAttachedFilter'] = function () {
  return (_TRN_FilterGetAttachedFilter = Module['_TRN_FilterGetAttachedFilter'] = Module['asm']['zh']).apply(null, arguments);
});
var _TRN_FilterGetSourceFilter = (Module['_TRN_FilterGetSourceFilter'] = function () {
  return (_TRN_FilterGetSourceFilter = Module['_TRN_FilterGetSourceFilter'] = Module['asm']['Ah']).apply(null, arguments);
});
var _TRN_FilterGetName = (Module['_TRN_FilterGetName'] = function () {
  return (_TRN_FilterGetName = Module['_TRN_FilterGetName'] = Module['asm']['Bh']).apply(null, arguments);
});
var _TRN_FilterGetDecodeName = (Module['_TRN_FilterGetDecodeName'] = function () {
  return (_TRN_FilterGetDecodeName = Module['_TRN_FilterGetDecodeName'] = Module['asm']['Ch']).apply(null, arguments);
});
var _TRN_FilterSize = (Module['_TRN_FilterSize'] = function () {
  return (_TRN_FilterSize = Module['_TRN_FilterSize'] = Module['asm']['Dh']).apply(null, arguments);
});
var _TRN_FilterConsume = (Module['_TRN_FilterConsume'] = function () {
  return (_TRN_FilterConsume = Module['_TRN_FilterConsume'] = Module['asm']['Eh']).apply(null, arguments);
});
var _TRN_FilterSetCount = (Module['_TRN_FilterSetCount'] = function () {
  return (_TRN_FilterSetCount = Module['_TRN_FilterSetCount'] = Module['asm']['Fh']).apply(null, arguments);
});
var _TRN_FilterSetStreamLength = (Module['_TRN_FilterSetStreamLength'] = function () {
  return (_TRN_FilterSetStreamLength = Module['_TRN_FilterSetStreamLength'] = Module['asm']['Gh']).apply(null, arguments);
});
var _TRN_FilterFlush = (Module['_TRN_FilterFlush'] = function () {
  return (_TRN_FilterFlush = Module['_TRN_FilterFlush'] = Module['asm']['Hh']).apply(null, arguments);
});
var _TRN_FilterFlushAll = (Module['_TRN_FilterFlushAll'] = function () {
  return (_TRN_FilterFlushAll = Module['_TRN_FilterFlushAll'] = Module['asm']['Ih']).apply(null, arguments);
});
var _TRN_FilterIsInputFilter = (Module['_TRN_FilterIsInputFilter'] = function () {
  return (_TRN_FilterIsInputFilter = Module['_TRN_FilterIsInputFilter'] = Module['asm']['Jh']).apply(null, arguments);
});
var _TRN_FilterCanSeek = (Module['_TRN_FilterCanSeek'] = function () {
  return (_TRN_FilterCanSeek = Module['_TRN_FilterCanSeek'] = Module['asm']['Kh']).apply(null, arguments);
});
var _TRN_FilterSeek = (Module['_TRN_FilterSeek'] = function () {
  return (_TRN_FilterSeek = Module['_TRN_FilterSeek'] = Module['asm']['Lh']).apply(null, arguments);
});
var _TRN_FilterTell = (Module['_TRN_FilterTell'] = function () {
  return (_TRN_FilterTell = Module['_TRN_FilterTell'] = Module['asm']['Mh']).apply(null, arguments);
});
var _TRN_FilterTruncate = (Module['_TRN_FilterTruncate'] = function () {
  return (_TRN_FilterTruncate = Module['_TRN_FilterTruncate'] = Module['asm']['Nh']).apply(null, arguments);
});
var _TRN_FilterCreateInputIterator = (Module['_TRN_FilterCreateInputIterator'] = function () {
  return (_TRN_FilterCreateInputIterator = Module['_TRN_FilterCreateInputIterator'] = Module['asm']['Oh']).apply(null, arguments);
});
var _TRN_FilterGetFilePath = (Module['_TRN_FilterGetFilePath'] = function () {
  return (_TRN_FilterGetFilePath = Module['_TRN_FilterGetFilePath'] = Module['asm']['Ph']).apply(null, arguments);
});
var _TRN_FilterMemoryFilterReset = (Module['_TRN_FilterMemoryFilterReset'] = function () {
  return (_TRN_FilterMemoryFilterReset = Module['_TRN_FilterMemoryFilterReset'] = Module['asm']['Qh']).apply(null, arguments);
});
var _TRN_FilterReaderAttachFilter = (Module['_TRN_FilterReaderAttachFilter'] = function () {
  return (_TRN_FilterReaderAttachFilter = Module['_TRN_FilterReaderAttachFilter'] = Module['asm']['Rh']).apply(null, arguments);
});
var _TRN_FilterReaderGetAttachedFilter = (Module['_TRN_FilterReaderGetAttachedFilter'] = function () {
  return (_TRN_FilterReaderGetAttachedFilter = Module['_TRN_FilterReaderGetAttachedFilter'] = Module['asm']['Sh']).apply(null, arguments);
});
var _TRN_FilterReaderSeek = (Module['_TRN_FilterReaderSeek'] = function () {
  return (_TRN_FilterReaderSeek = Module['_TRN_FilterReaderSeek'] = Module['asm']['Th']).apply(null, arguments);
});
var _TRN_FilterReaderTell = (Module['_TRN_FilterReaderTell'] = function () {
  return (_TRN_FilterReaderTell = Module['_TRN_FilterReaderTell'] = Module['asm']['Uh']).apply(null, arguments);
});
var _TRN_FilterReaderCount = (Module['_TRN_FilterReaderCount'] = function () {
  return (_TRN_FilterReaderCount = Module['_TRN_FilterReaderCount'] = Module['asm']['Vh']).apply(null, arguments);
});
var _TRN_FilterReaderFlush = (Module['_TRN_FilterReaderFlush'] = function () {
  return (_TRN_FilterReaderFlush = Module['_TRN_FilterReaderFlush'] = Module['asm']['Wh']).apply(null, arguments);
});
var _TRN_FilterReaderFlushAll = (Module['_TRN_FilterReaderFlushAll'] = function () {
  return (_TRN_FilterReaderFlushAll = Module['_TRN_FilterReaderFlushAll'] = Module['asm']['Xh']).apply(null, arguments);
});
var _TRN_FilterReaderGet = (Module['_TRN_FilterReaderGet'] = function () {
  return (_TRN_FilterReaderGet = Module['_TRN_FilterReaderGet'] = Module['asm']['Yh']).apply(null, arguments);
});
var _TRN_FilterReaderPeek = (Module['_TRN_FilterReaderPeek'] = function () {
  return (_TRN_FilterReaderPeek = Module['_TRN_FilterReaderPeek'] = Module['asm']['Zh']).apply(null, arguments);
});
var _TRN_FilterWriterAttachFilter = (Module['_TRN_FilterWriterAttachFilter'] = function () {
  return (_TRN_FilterWriterAttachFilter = Module['_TRN_FilterWriterAttachFilter'] = Module['asm']['_h']).apply(null, arguments);
});
var _TRN_FilterWriterGetAttachedFilter = (Module['_TRN_FilterWriterGetAttachedFilter'] = function () {
  return (_TRN_FilterWriterGetAttachedFilter = Module['_TRN_FilterWriterGetAttachedFilter'] = Module['asm']['$h']).apply(null, arguments);
});
var _TRN_FilterWriterSeek = (Module['_TRN_FilterWriterSeek'] = function () {
  return (_TRN_FilterWriterSeek = Module['_TRN_FilterWriterSeek'] = Module['asm']['ai']).apply(null, arguments);
});
var _TRN_FilterWriterTell = (Module['_TRN_FilterWriterTell'] = function () {
  return (_TRN_FilterWriterTell = Module['_TRN_FilterWriterTell'] = Module['asm']['bi']).apply(null, arguments);
});
var _TRN_FilterWriterCount = (Module['_TRN_FilterWriterCount'] = function () {
  return (_TRN_FilterWriterCount = Module['_TRN_FilterWriterCount'] = Module['asm']['ci']).apply(null, arguments);
});
var _TRN_FilterWriterFlush = (Module['_TRN_FilterWriterFlush'] = function () {
  return (_TRN_FilterWriterFlush = Module['_TRN_FilterWriterFlush'] = Module['asm']['di']).apply(null, arguments);
});
var _TRN_FilterWriterWriteUChar = (Module['_TRN_FilterWriterWriteUChar'] = function () {
  return (_TRN_FilterWriterWriteUChar = Module['_TRN_FilterWriterWriteUChar'] = Module['asm']['ei']).apply(null, arguments);
});
var _TRN_FilterWriterWriteInt16 = (Module['_TRN_FilterWriterWriteInt16'] = function () {
  return (_TRN_FilterWriterWriteInt16 = Module['_TRN_FilterWriterWriteInt16'] = Module['asm']['fi']).apply(null, arguments);
});
var _TRN_FilterWriterWriteUInt16 = (Module['_TRN_FilterWriterWriteUInt16'] = function () {
  return (_TRN_FilterWriterWriteUInt16 = Module['_TRN_FilterWriterWriteUInt16'] = Module['asm']['gi']).apply(null, arguments);
});
var _TRN_FilterWriterWriteInt32 = (Module['_TRN_FilterWriterWriteInt32'] = function () {
  return (_TRN_FilterWriterWriteInt32 = Module['_TRN_FilterWriterWriteInt32'] = Module['asm']['hi']).apply(null, arguments);
});
var _TRN_FilterWriterWriteUInt32 = (Module['_TRN_FilterWriterWriteUInt32'] = function () {
  return (_TRN_FilterWriterWriteUInt32 = Module['_TRN_FilterWriterWriteUInt32'] = Module['asm']['ii']).apply(null, arguments);
});
var _TRN_FilterWriterWriteInt64 = (Module['_TRN_FilterWriterWriteInt64'] = function () {
  return (_TRN_FilterWriterWriteInt64 = Module['_TRN_FilterWriterWriteInt64'] = Module['asm']['ji']).apply(null, arguments);
});
var _TRN_FilterWriterWriteUInt64 = (Module['_TRN_FilterWriterWriteUInt64'] = function () {
  return (_TRN_FilterWriterWriteUInt64 = Module['_TRN_FilterWriterWriteUInt64'] = Module['asm']['ki']).apply(null, arguments);
});
var _TRN_FilterWriterWriteString = (Module['_TRN_FilterWriterWriteString'] = function () {
  return (_TRN_FilterWriterWriteString = Module['_TRN_FilterWriterWriteString'] = Module['asm']['li']).apply(null, arguments);
});
var _TRN_FilterWriterWriteLine = (Module['_TRN_FilterWriterWriteLine'] = function () {
  return (_TRN_FilterWriterWriteLine = Module['_TRN_FilterWriterWriteLine'] = Module['asm']['mi']).apply(null, arguments);
});
var _TRN_OCGCreate = (Module['_TRN_OCGCreate'] = function () {
  return (_TRN_OCGCreate = Module['_TRN_OCGCreate'] = Module['asm']['ni']).apply(null, arguments);
});
var _TRN_OCGCopy = (Module['_TRN_OCGCopy'] = function () {
  return (_TRN_OCGCopy = Module['_TRN_OCGCopy'] = Module['asm']['oi']).apply(null, arguments);
});
var _TRN_OCGGetSDFObj = (Module['_TRN_OCGGetSDFObj'] = function () {
  return (_TRN_OCGGetSDFObj = Module['_TRN_OCGGetSDFObj'] = Module['asm']['pi']).apply(null, arguments);
});
var _TRN_OCGSetName = (Module['_TRN_OCGSetName'] = function () {
  return (_TRN_OCGSetName = Module['_TRN_OCGSetName'] = Module['asm']['qi']).apply(null, arguments);
});
var _TRN_OCGGetIntent = (Module['_TRN_OCGGetIntent'] = function () {
  return (_TRN_OCGGetIntent = Module['_TRN_OCGGetIntent'] = Module['asm']['ri']).apply(null, arguments);
});
var _TRN_OCGSetIntent = (Module['_TRN_OCGSetIntent'] = function () {
  return (_TRN_OCGSetIntent = Module['_TRN_OCGSetIntent'] = Module['asm']['si']).apply(null, arguments);
});
var _TRN_OCGHasUsage = (Module['_TRN_OCGHasUsage'] = function () {
  return (_TRN_OCGHasUsage = Module['_TRN_OCGHasUsage'] = Module['asm']['ti']).apply(null, arguments);
});
var _TRN_OCGGetUsage = (Module['_TRN_OCGGetUsage'] = function () {
  return (_TRN_OCGGetUsage = Module['_TRN_OCGGetUsage'] = Module['asm']['ui']).apply(null, arguments);
});
var _TRN_OCGGetCurrentState = (Module['_TRN_OCGGetCurrentState'] = function () {
  return (_TRN_OCGGetCurrentState = Module['_TRN_OCGGetCurrentState'] = Module['asm']['vi']).apply(null, arguments);
});
var _TRN_OCGSetCurrentState = (Module['_TRN_OCGSetCurrentState'] = function () {
  return (_TRN_OCGSetCurrentState = Module['_TRN_OCGSetCurrentState'] = Module['asm']['wi']).apply(null, arguments);
});
var _TRN_OCGSetInitialState = (Module['_TRN_OCGSetInitialState'] = function () {
  return (_TRN_OCGSetInitialState = Module['_TRN_OCGSetInitialState'] = Module['asm']['xi']).apply(null, arguments);
});
var _TRN_OCGSetLocked = (Module['_TRN_OCGSetLocked'] = function () {
  return (_TRN_OCGSetLocked = Module['_TRN_OCGSetLocked'] = Module['asm']['yi']).apply(null, arguments);
});
var _TRN_OCGConfigCreateFromObj = (Module['_TRN_OCGConfigCreateFromObj'] = function () {
  return (_TRN_OCGConfigCreateFromObj = Module['_TRN_OCGConfigCreateFromObj'] = Module['asm']['zi']).apply(null, arguments);
});
var _TRN_OCGConfigCreate = (Module['_TRN_OCGConfigCreate'] = function () {
  return (_TRN_OCGConfigCreate = Module['_TRN_OCGConfigCreate'] = Module['asm']['Ai']).apply(null, arguments);
});
var _TRN_OCGConfigCopy = (Module['_TRN_OCGConfigCopy'] = function () {
  return (_TRN_OCGConfigCopy = Module['_TRN_OCGConfigCopy'] = Module['asm']['Bi']).apply(null, arguments);
});
var _TRN_OCGConfigGetSDFObj = (Module['_TRN_OCGConfigGetSDFObj'] = function () {
  return (_TRN_OCGConfigGetSDFObj = Module['_TRN_OCGConfigGetSDFObj'] = Module['asm']['Ci']).apply(null, arguments);
});
var _TRN_OCGConfigSetOrder = (Module['_TRN_OCGConfigSetOrder'] = function () {
  return (_TRN_OCGConfigSetOrder = Module['_TRN_OCGConfigSetOrder'] = Module['asm']['Di']).apply(null, arguments);
});
var _TRN_OCGConfigGetName = (Module['_TRN_OCGConfigGetName'] = function () {
  return (_TRN_OCGConfigGetName = Module['_TRN_OCGConfigGetName'] = Module['asm']['Ei']).apply(null, arguments);
});
var _TRN_OCGConfigSetName = (Module['_TRN_OCGConfigSetName'] = function () {
  return (_TRN_OCGConfigSetName = Module['_TRN_OCGConfigSetName'] = Module['asm']['Fi']).apply(null, arguments);
});
var _TRN_OCGConfigGetCreator = (Module['_TRN_OCGConfigGetCreator'] = function () {
  return (_TRN_OCGConfigGetCreator = Module['_TRN_OCGConfigGetCreator'] = Module['asm']['Gi']).apply(null, arguments);
});
var _TRN_OCGConfigSetCreator = (Module['_TRN_OCGConfigSetCreator'] = function () {
  return (_TRN_OCGConfigSetCreator = Module['_TRN_OCGConfigSetCreator'] = Module['asm']['Hi']).apply(null, arguments);
});
var _TRN_OCGConfigGetInitBaseState = (Module['_TRN_OCGConfigGetInitBaseState'] = function () {
  return (_TRN_OCGConfigGetInitBaseState = Module['_TRN_OCGConfigGetInitBaseState'] = Module['asm']['Ii']).apply(null, arguments);
});
var _TRN_OCGConfigSetInitBaseState = (Module['_TRN_OCGConfigSetInitBaseState'] = function () {
  return (_TRN_OCGConfigSetInitBaseState = Module['_TRN_OCGConfigSetInitBaseState'] = Module['asm']['Ji']).apply(null, arguments);
});
var _TRN_OCGConfigGetInitOnStates = (Module['_TRN_OCGConfigGetInitOnStates'] = function () {
  return (_TRN_OCGConfigGetInitOnStates = Module['_TRN_OCGConfigGetInitOnStates'] = Module['asm']['Ki']).apply(null, arguments);
});
var _TRN_OCGConfigSetInitOnStates = (Module['_TRN_OCGConfigSetInitOnStates'] = function () {
  return (_TRN_OCGConfigSetInitOnStates = Module['_TRN_OCGConfigSetInitOnStates'] = Module['asm']['Li']).apply(null, arguments);
});
var _TRN_OCGConfigGetInitOffStates = (Module['_TRN_OCGConfigGetInitOffStates'] = function () {
  return (_TRN_OCGConfigGetInitOffStates = Module['_TRN_OCGConfigGetInitOffStates'] = Module['asm']['Mi']).apply(null, arguments);
});
var _TRN_OCGConfigSetInitOffStates = (Module['_TRN_OCGConfigSetInitOffStates'] = function () {
  return (_TRN_OCGConfigSetInitOffStates = Module['_TRN_OCGConfigSetInitOffStates'] = Module['asm']['Ni']).apply(null, arguments);
});
var _TRN_OCGConfigGetIntent = (Module['_TRN_OCGConfigGetIntent'] = function () {
  return (_TRN_OCGConfigGetIntent = Module['_TRN_OCGConfigGetIntent'] = Module['asm']['Oi']).apply(null, arguments);
});
var _TRN_OCGConfigSetIntent = (Module['_TRN_OCGConfigSetIntent'] = function () {
  return (_TRN_OCGConfigSetIntent = Module['_TRN_OCGConfigSetIntent'] = Module['asm']['Pi']).apply(null, arguments);
});
var _TRN_OCGConfigGetLockedOCGs = (Module['_TRN_OCGConfigGetLockedOCGs'] = function () {
  return (_TRN_OCGConfigGetLockedOCGs = Module['_TRN_OCGConfigGetLockedOCGs'] = Module['asm']['Qi']).apply(null, arguments);
});
var _TRN_OCGConfigSetLockedOCGs = (Module['_TRN_OCGConfigSetLockedOCGs'] = function () {
  return (_TRN_OCGConfigSetLockedOCGs = Module['_TRN_OCGConfigSetLockedOCGs'] = Module['asm']['Ri']).apply(null, arguments);
});
var _TRN_OCGContextCopy = (Module['_TRN_OCGContextCopy'] = function () {
  return (_TRN_OCGContextCopy = Module['_TRN_OCGContextCopy'] = Module['asm']['Si']).apply(null, arguments);
});
var _TRN_OCGContextGetState = (Module['_TRN_OCGContextGetState'] = function () {
  return (_TRN_OCGContextGetState = Module['_TRN_OCGContextGetState'] = Module['asm']['Ti']).apply(null, arguments);
});
var _TRN_OCGContextResetStates = (Module['_TRN_OCGContextResetStates'] = function () {
  return (_TRN_OCGContextResetStates = Module['_TRN_OCGContextResetStates'] = Module['asm']['Ui']).apply(null, arguments);
});
var _TRN_OCGContextSetNonOCDrawing = (Module['_TRN_OCGContextSetNonOCDrawing'] = function () {
  return (_TRN_OCGContextSetNonOCDrawing = Module['_TRN_OCGContextSetNonOCDrawing'] = Module['asm']['Vi']).apply(null, arguments);
});
var _TRN_OCGContextGetNonOCDrawing = (Module['_TRN_OCGContextGetNonOCDrawing'] = function () {
  return (_TRN_OCGContextGetNonOCDrawing = Module['_TRN_OCGContextGetNonOCDrawing'] = Module['asm']['Wi']).apply(null, arguments);
});
var _TRN_OCGContextSetOCDrawMode = (Module['_TRN_OCGContextSetOCDrawMode'] = function () {
  return (_TRN_OCGContextSetOCDrawMode = Module['_TRN_OCGContextSetOCDrawMode'] = Module['asm']['Xi']).apply(null, arguments);
});
var _TRN_OCGContextGetOCMode = (Module['_TRN_OCGContextGetOCMode'] = function () {
  return (_TRN_OCGContextGetOCMode = Module['_TRN_OCGContextGetOCMode'] = Module['asm']['Yi']).apply(null, arguments);
});
var _TRN_OCMDCreateFromObj = (Module['_TRN_OCMDCreateFromObj'] = function () {
  return (_TRN_OCMDCreateFromObj = Module['_TRN_OCMDCreateFromObj'] = Module['asm']['Zi']).apply(null, arguments);
});
var _TRN_OCMDCreate = (Module['_TRN_OCMDCreate'] = function () {
  return (_TRN_OCMDCreate = Module['_TRN_OCMDCreate'] = Module['asm']['_i']).apply(null, arguments);
});
var _TRN_OCMDCopy = (Module['_TRN_OCMDCopy'] = function () {
  return (_TRN_OCMDCopy = Module['_TRN_OCMDCopy'] = Module['asm']['$i']).apply(null, arguments);
});
var _TRN_OCMDGetSDFObj = (Module['_TRN_OCMDGetSDFObj'] = function () {
  return (_TRN_OCMDGetSDFObj = Module['_TRN_OCMDGetSDFObj'] = Module['asm']['aj']).apply(null, arguments);
});
var _TRN_OCMDGetOCGs = (Module['_TRN_OCMDGetOCGs'] = function () {
  return (_TRN_OCMDGetOCGs = Module['_TRN_OCMDGetOCGs'] = Module['asm']['bj']).apply(null, arguments);
});
var _TRN_OCMDGetVisibilityExpression = (Module['_TRN_OCMDGetVisibilityExpression'] = function () {
  return (_TRN_OCMDGetVisibilityExpression = Module['_TRN_OCMDGetVisibilityExpression'] = Module['asm']['cj']).apply(null, arguments);
});
var _TRN_OCMDIsValid = (Module['_TRN_OCMDIsValid'] = function () {
  return (_TRN_OCMDIsValid = Module['_TRN_OCMDIsValid'] = Module['asm']['dj']).apply(null, arguments);
});
var _TRN_OCMDIsCurrentlyVisible = (Module['_TRN_OCMDIsCurrentlyVisible'] = function () {
  return (_TRN_OCMDIsCurrentlyVisible = Module['_TRN_OCMDIsCurrentlyVisible'] = Module['asm']['ej']).apply(null, arguments);
});
var _TRN_OCMDGetVisibilityPolicy = (Module['_TRN_OCMDGetVisibilityPolicy'] = function () {
  return (_TRN_OCMDGetVisibilityPolicy = Module['_TRN_OCMDGetVisibilityPolicy'] = Module['asm']['fj']).apply(null, arguments);
});
var _TRN_OCMDSetVisibilityPolicy = (Module['_TRN_OCMDSetVisibilityPolicy'] = function () {
  return (_TRN_OCMDSetVisibilityPolicy = Module['_TRN_OCMDSetVisibilityPolicy'] = Module['asm']['gj']).apply(null, arguments);
});
var _TRN_PDFAComplianceDestroy = (Module['_TRN_PDFAComplianceDestroy'] = function () {
  return (_TRN_PDFAComplianceDestroy = Module['_TRN_PDFAComplianceDestroy'] = Module['asm']['hj']).apply(null, arguments);
});
var _TRN_PDFAComplianceGetErrorCount = (Module['_TRN_PDFAComplianceGetErrorCount'] = function () {
  return (_TRN_PDFAComplianceGetErrorCount = Module['_TRN_PDFAComplianceGetErrorCount'] = Module['asm']['ij']).apply(null, arguments);
});
var _TRN_PDFAComplianceGetError = (Module['_TRN_PDFAComplianceGetError'] = function () {
  return (_TRN_PDFAComplianceGetError = Module['_TRN_PDFAComplianceGetError'] = Module['asm']['jj']).apply(null, arguments);
});
var _TRN_PDFAComplianceGetRefObjCount = (Module['_TRN_PDFAComplianceGetRefObjCount'] = function () {
  return (_TRN_PDFAComplianceGetRefObjCount = Module['_TRN_PDFAComplianceGetRefObjCount'] = Module['asm']['kj']).apply(null, arguments);
});
var _TRN_PDFAComplianceGetRefObj = (Module['_TRN_PDFAComplianceGetRefObj'] = function () {
  return (_TRN_PDFAComplianceGetRefObj = Module['_TRN_PDFAComplianceGetRefObj'] = Module['asm']['lj']).apply(null, arguments);
});
var _TRN_PDFAComplianceGetPDFAErrorMessage = (Module['_TRN_PDFAComplianceGetPDFAErrorMessage'] = function () {
  return (_TRN_PDFAComplianceGetPDFAErrorMessage = Module['_TRN_PDFAComplianceGetPDFAErrorMessage'] = Module['asm']['mj']).apply(null, arguments);
});
var _TRN_PDFAComplianceGetDeclaredConformance = (Module['_TRN_PDFAComplianceGetDeclaredConformance'] = function () {
  return (_TRN_PDFAComplianceGetDeclaredConformance = Module['_TRN_PDFAComplianceGetDeclaredConformance'] = Module['asm']['nj']).apply(null, arguments);
});
var _TRN_PDFAComplianceSaveAsFromBuffer = (Module['_TRN_PDFAComplianceSaveAsFromBuffer'] = function () {
  return (_TRN_PDFAComplianceSaveAsFromBuffer = Module['_TRN_PDFAComplianceSaveAsFromBuffer'] = Module['asm']['oj']).apply(null, arguments);
});
var _TRN_AttrObjCreate = (Module['_TRN_AttrObjCreate'] = function () {
  return (_TRN_AttrObjCreate = Module['_TRN_AttrObjCreate'] = Module['asm']['pj']).apply(null, arguments);
});
var _TRN_AttrObjCopy = (Module['_TRN_AttrObjCopy'] = function () {
  return (_TRN_AttrObjCopy = Module['_TRN_AttrObjCopy'] = Module['asm']['qj']).apply(null, arguments);
});
var _TRN_AttrObjGetOwner = (Module['_TRN_AttrObjGetOwner'] = function () {
  return (_TRN_AttrObjGetOwner = Module['_TRN_AttrObjGetOwner'] = Module['asm']['rj']).apply(null, arguments);
});
var _TRN_AttrObjGetSDFObj = (Module['_TRN_AttrObjGetSDFObj'] = function () {
  return (_TRN_AttrObjGetSDFObj = Module['_TRN_AttrObjGetSDFObj'] = Module['asm']['sj']).apply(null, arguments);
});
var _TRN_ClassMapCreate = (Module['_TRN_ClassMapCreate'] = function () {
  return (_TRN_ClassMapCreate = Module['_TRN_ClassMapCreate'] = Module['asm']['tj']).apply(null, arguments);
});
var _TRN_ClassMapCopy = (Module['_TRN_ClassMapCopy'] = function () {
  return (_TRN_ClassMapCopy = Module['_TRN_ClassMapCopy'] = Module['asm']['uj']).apply(null, arguments);
});
var _TRN_ClassMapIsValid = (Module['_TRN_ClassMapIsValid'] = function () {
  return (_TRN_ClassMapIsValid = Module['_TRN_ClassMapIsValid'] = Module['asm']['vj']).apply(null, arguments);
});
var _TRN_ClassMapGetSDFObj = (Module['_TRN_ClassMapGetSDFObj'] = function () {
  return (_TRN_ClassMapGetSDFObj = Module['_TRN_ClassMapGetSDFObj'] = Module['asm']['wj']).apply(null, arguments);
});
var _TRN_ContentItemCopy = (Module['_TRN_ContentItemCopy'] = function () {
  return (_TRN_ContentItemCopy = Module['_TRN_ContentItemCopy'] = Module['asm']['xj']).apply(null, arguments);
});
var _TRN_ContentItemGetType = (Module['_TRN_ContentItemGetType'] = function () {
  return (_TRN_ContentItemGetType = Module['_TRN_ContentItemGetType'] = Module['asm']['yj']).apply(null, arguments);
});
var _TRN_ContentItemGetParent = (Module['_TRN_ContentItemGetParent'] = function () {
  return (_TRN_ContentItemGetParent = Module['_TRN_ContentItemGetParent'] = Module['asm']['zj']).apply(null, arguments);
});
var _TRN_ContentItemGetPage = (Module['_TRN_ContentItemGetPage'] = function () {
  return (_TRN_ContentItemGetPage = Module['_TRN_ContentItemGetPage'] = Module['asm']['Aj']).apply(null, arguments);
});
var _TRN_ContentItemGetSDFObj = (Module['_TRN_ContentItemGetSDFObj'] = function () {
  return (_TRN_ContentItemGetSDFObj = Module['_TRN_ContentItemGetSDFObj'] = Module['asm']['Bj']).apply(null, arguments);
});
var _TRN_ContentItemGetMCID = (Module['_TRN_ContentItemGetMCID'] = function () {
  return (_TRN_ContentItemGetMCID = Module['_TRN_ContentItemGetMCID'] = Module['asm']['Cj']).apply(null, arguments);
});
var _TRN_ContentItemGetContainingStm = (Module['_TRN_ContentItemGetContainingStm'] = function () {
  return (_TRN_ContentItemGetContainingStm = Module['_TRN_ContentItemGetContainingStm'] = Module['asm']['Dj']).apply(null, arguments);
});
var _TRN_ContentItemGetStmOwner = (Module['_TRN_ContentItemGetStmOwner'] = function () {
  return (_TRN_ContentItemGetStmOwner = Module['_TRN_ContentItemGetStmOwner'] = Module['asm']['Ej']).apply(null, arguments);
});
var _TRN_ContentItemGetRefObj = (Module['_TRN_ContentItemGetRefObj'] = function () {
  return (_TRN_ContentItemGetRefObj = Module['_TRN_ContentItemGetRefObj'] = Module['asm']['Fj']).apply(null, arguments);
});
var _TRN_RoleMapCreate = (Module['_TRN_RoleMapCreate'] = function () {
  return (_TRN_RoleMapCreate = Module['_TRN_RoleMapCreate'] = Module['asm']['Gj']).apply(null, arguments);
});
var _TRN_RoleMapCopy = (Module['_TRN_RoleMapCopy'] = function () {
  return (_TRN_RoleMapCopy = Module['_TRN_RoleMapCopy'] = Module['asm']['Hj']).apply(null, arguments);
});
var _TRN_RoleMapIsValid = (Module['_TRN_RoleMapIsValid'] = function () {
  return (_TRN_RoleMapIsValid = Module['_TRN_RoleMapIsValid'] = Module['asm']['Ij']).apply(null, arguments);
});
var _TRN_RoleMapGetDirectMap = (Module['_TRN_RoleMapGetDirectMap'] = function () {
  return (_TRN_RoleMapGetDirectMap = Module['_TRN_RoleMapGetDirectMap'] = Module['asm']['Jj']).apply(null, arguments);
});
var _TRN_RoleMapGetSDFObj = (Module['_TRN_RoleMapGetSDFObj'] = function () {
  return (_TRN_RoleMapGetSDFObj = Module['_TRN_RoleMapGetSDFObj'] = Module['asm']['Kj']).apply(null, arguments);
});
var _TRN_SElementCreate = (Module['_TRN_SElementCreate'] = function () {
  return (_TRN_SElementCreate = Module['_TRN_SElementCreate'] = Module['asm']['Lj']).apply(null, arguments);
});
var _TRN_SElementCreateFromPDFDoc = (Module['_TRN_SElementCreateFromPDFDoc'] = function () {
  return (_TRN_SElementCreateFromPDFDoc = Module['_TRN_SElementCreateFromPDFDoc'] = Module['asm']['Mj']).apply(null, arguments);
});
var _TRN_SElementInsert = (Module['_TRN_SElementInsert'] = function () {
  return (_TRN_SElementInsert = Module['_TRN_SElementInsert'] = Module['asm']['Nj']).apply(null, arguments);
});
var _TRN_SElementCreateContentItem = (Module['_TRN_SElementCreateContentItem'] = function () {
  return (_TRN_SElementCreateContentItem = Module['_TRN_SElementCreateContentItem'] = Module['asm']['Oj']).apply(null, arguments);
});
var _TRN_SElementIsValid = (Module['_TRN_SElementIsValid'] = function () {
  return (_TRN_SElementIsValid = Module['_TRN_SElementIsValid'] = Module['asm']['Pj']).apply(null, arguments);
});
var _TRN_SElementGetType = (Module['_TRN_SElementGetType'] = function () {
  return (_TRN_SElementGetType = Module['_TRN_SElementGetType'] = Module['asm']['Qj']).apply(null, arguments);
});
var _TRN_SElementGetNumKids = (Module['_TRN_SElementGetNumKids'] = function () {
  return (_TRN_SElementGetNumKids = Module['_TRN_SElementGetNumKids'] = Module['asm']['Rj']).apply(null, arguments);
});
var _TRN_SElementIsContentItem = (Module['_TRN_SElementIsContentItem'] = function () {
  return (_TRN_SElementIsContentItem = Module['_TRN_SElementIsContentItem'] = Module['asm']['Sj']).apply(null, arguments);
});
var _TRN_SElementGetAsContentItem = (Module['_TRN_SElementGetAsContentItem'] = function () {
  return (_TRN_SElementGetAsContentItem = Module['_TRN_SElementGetAsContentItem'] = Module['asm']['Tj']).apply(null, arguments);
});
var _TRN_SElementGetAsStructElem = (Module['_TRN_SElementGetAsStructElem'] = function () {
  return (_TRN_SElementGetAsStructElem = Module['_TRN_SElementGetAsStructElem'] = Module['asm']['Uj']).apply(null, arguments);
});
var _TRN_SElementGetParent = (Module['_TRN_SElementGetParent'] = function () {
  return (_TRN_SElementGetParent = Module['_TRN_SElementGetParent'] = Module['asm']['Vj']).apply(null, arguments);
});
var _TRN_SElementGetStructTreeRoot = (Module['_TRN_SElementGetStructTreeRoot'] = function () {
  return (_TRN_SElementGetStructTreeRoot = Module['_TRN_SElementGetStructTreeRoot'] = Module['asm']['Wj']).apply(null, arguments);
});
var _TRN_SElementHasTitle = (Module['_TRN_SElementHasTitle'] = function () {
  return (_TRN_SElementHasTitle = Module['_TRN_SElementHasTitle'] = Module['asm']['Xj']).apply(null, arguments);
});
var _TRN_SElementGetTitle = (Module['_TRN_SElementGetTitle'] = function () {
  return (_TRN_SElementGetTitle = Module['_TRN_SElementGetTitle'] = Module['asm']['Yj']).apply(null, arguments);
});
var _TRN_SElementGetID = (Module['_TRN_SElementGetID'] = function () {
  return (_TRN_SElementGetID = Module['_TRN_SElementGetID'] = Module['asm']['Zj']).apply(null, arguments);
});
var _TRN_SElementHasActualText = (Module['_TRN_SElementHasActualText'] = function () {
  return (_TRN_SElementHasActualText = Module['_TRN_SElementHasActualText'] = Module['asm']['_j']).apply(null, arguments);
});
var _TRN_SElementGetActualText = (Module['_TRN_SElementGetActualText'] = function () {
  return (_TRN_SElementGetActualText = Module['_TRN_SElementGetActualText'] = Module['asm']['$j']).apply(null, arguments);
});
var _TRN_SElementHasAlt = (Module['_TRN_SElementHasAlt'] = function () {
  return (_TRN_SElementHasAlt = Module['_TRN_SElementHasAlt'] = Module['asm']['ak']).apply(null, arguments);
});
var _TRN_SElementGetAlt = (Module['_TRN_SElementGetAlt'] = function () {
  return (_TRN_SElementGetAlt = Module['_TRN_SElementGetAlt'] = Module['asm']['bk']).apply(null, arguments);
});
var _TRN_SElementGetSDFObj = (Module['_TRN_SElementGetSDFObj'] = function () {
  return (_TRN_SElementGetSDFObj = Module['_TRN_SElementGetSDFObj'] = Module['asm']['ck']).apply(null, arguments);
});
var _TRN_STreeCreate = (Module['_TRN_STreeCreate'] = function () {
  return (_TRN_STreeCreate = Module['_TRN_STreeCreate'] = Module['asm']['dk']).apply(null, arguments);
});
var _TRN_STreeCreateFromPDFDoc = (Module['_TRN_STreeCreateFromPDFDoc'] = function () {
  return (_TRN_STreeCreateFromPDFDoc = Module['_TRN_STreeCreateFromPDFDoc'] = Module['asm']['ek']).apply(null, arguments);
});
var _TRN_STreeInsert = (Module['_TRN_STreeInsert'] = function () {
  return (_TRN_STreeInsert = Module['_TRN_STreeInsert'] = Module['asm']['fk']).apply(null, arguments);
});
var _TRN_STreeCopy = (Module['_TRN_STreeCopy'] = function () {
  return (_TRN_STreeCopy = Module['_TRN_STreeCopy'] = Module['asm']['gk']).apply(null, arguments);
});
var _TRN_STreeIsValid = (Module['_TRN_STreeIsValid'] = function () {
  return (_TRN_STreeIsValid = Module['_TRN_STreeIsValid'] = Module['asm']['hk']).apply(null, arguments);
});
var _TRN_STreeGetNumKids = (Module['_TRN_STreeGetNumKids'] = function () {
  return (_TRN_STreeGetNumKids = Module['_TRN_STreeGetNumKids'] = Module['asm']['ik']).apply(null, arguments);
});
var _TRN_STreeGetKid = (Module['_TRN_STreeGetKid'] = function () {
  return (_TRN_STreeGetKid = Module['_TRN_STreeGetKid'] = Module['asm']['jk']).apply(null, arguments);
});
var _TRN_STreeGetRoleMap = (Module['_TRN_STreeGetRoleMap'] = function () {
  return (_TRN_STreeGetRoleMap = Module['_TRN_STreeGetRoleMap'] = Module['asm']['kk']).apply(null, arguments);
});
var _TRN_STreeGetClassMap = (Module['_TRN_STreeGetClassMap'] = function () {
  return (_TRN_STreeGetClassMap = Module['_TRN_STreeGetClassMap'] = Module['asm']['lk']).apply(null, arguments);
});
var _TRN_STreeGetSDFObj = (Module['_TRN_STreeGetSDFObj'] = function () {
  return (_TRN_STreeGetSDFObj = Module['_TRN_STreeGetSDFObj'] = Module['asm']['mk']).apply(null, arguments);
});
var _TRN_ActionCreateGoto = (Module['_TRN_ActionCreateGoto'] = function () {
  return (_TRN_ActionCreateGoto = Module['_TRN_ActionCreateGoto'] = Module['asm']['nk']).apply(null, arguments);
});
var _TRN_ActionCreateGotoWithKey = (Module['_TRN_ActionCreateGotoWithKey'] = function () {
  return (_TRN_ActionCreateGotoWithKey = Module['_TRN_ActionCreateGotoWithKey'] = Module['asm']['ok']).apply(null, arguments);
});
var _TRN_ActionCreateGotoRemote = (Module['_TRN_ActionCreateGotoRemote'] = function () {
  return (_TRN_ActionCreateGotoRemote = Module['_TRN_ActionCreateGotoRemote'] = Module['asm']['pk']).apply(null, arguments);
});
var _TRN_ActionCreateGotoRemoteSetNewWindow = (Module['_TRN_ActionCreateGotoRemoteSetNewWindow'] = function () {
  return (_TRN_ActionCreateGotoRemoteSetNewWindow = Module['_TRN_ActionCreateGotoRemoteSetNewWindow'] = Module['asm']['qk']).apply(null, arguments);
});
var _TRN_ActionCreateURI = (Module['_TRN_ActionCreateURI'] = function () {
  return (_TRN_ActionCreateURI = Module['_TRN_ActionCreateURI'] = Module['asm']['rk']).apply(null, arguments);
});
var _TRN_ActionCreateURIWithUString = (Module['_TRN_ActionCreateURIWithUString'] = function () {
  return (_TRN_ActionCreateURIWithUString = Module['_TRN_ActionCreateURIWithUString'] = Module['asm']['sk']).apply(null, arguments);
});
var _TRN_ActionCreateSubmitForm = (Module['_TRN_ActionCreateSubmitForm'] = function () {
  return (_TRN_ActionCreateSubmitForm = Module['_TRN_ActionCreateSubmitForm'] = Module['asm']['tk']).apply(null, arguments);
});
var _TRN_ActionCreateLaunch = (Module['_TRN_ActionCreateLaunch'] = function () {
  return (_TRN_ActionCreateLaunch = Module['_TRN_ActionCreateLaunch'] = Module['asm']['uk']).apply(null, arguments);
});
var _TRN_ActionCreateHideField = (Module['_TRN_ActionCreateHideField'] = function () {
  return (_TRN_ActionCreateHideField = Module['_TRN_ActionCreateHideField'] = Module['asm']['vk']).apply(null, arguments);
});
var _TRN_ActionCreateImportData = (Module['_TRN_ActionCreateImportData'] = function () {
  return (_TRN_ActionCreateImportData = Module['_TRN_ActionCreateImportData'] = Module['asm']['wk']).apply(null, arguments);
});
var _TRN_ActionCreateResetForm = (Module['_TRN_ActionCreateResetForm'] = function () {
  return (_TRN_ActionCreateResetForm = Module['_TRN_ActionCreateResetForm'] = Module['asm']['xk']).apply(null, arguments);
});
var _TRN_ActionCreateJavaScript = (Module['_TRN_ActionCreateJavaScript'] = function () {
  return (_TRN_ActionCreateJavaScript = Module['_TRN_ActionCreateJavaScript'] = Module['asm']['yk']).apply(null, arguments);
});
var _TRN_ActionCreate = (Module['_TRN_ActionCreate'] = function () {
  return (_TRN_ActionCreate = Module['_TRN_ActionCreate'] = Module['asm']['zk']).apply(null, arguments);
});
var _TRN_ActionCopy = (Module['_TRN_ActionCopy'] = function () {
  return (_TRN_ActionCopy = Module['_TRN_ActionCopy'] = Module['asm']['Ak']).apply(null, arguments);
});
var _TRN_ActionCompare = (Module['_TRN_ActionCompare'] = function () {
  return (_TRN_ActionCompare = Module['_TRN_ActionCompare'] = Module['asm']['Bk']).apply(null, arguments);
});
var _TRN_ActionIsValid = (Module['_TRN_ActionIsValid'] = function () {
  return (_TRN_ActionIsValid = Module['_TRN_ActionIsValid'] = Module['asm']['Ck']).apply(null, arguments);
});
var _TRN_ActionGetXFDF = (Module['_TRN_ActionGetXFDF'] = function () {
  return (_TRN_ActionGetXFDF = Module['_TRN_ActionGetXFDF'] = Module['asm']['Dk']).apply(null, arguments);
});
var _TRN_ActionGetType = (Module['_TRN_ActionGetType'] = function () {
  return (_TRN_ActionGetType = Module['_TRN_ActionGetType'] = Module['asm']['Ek']).apply(null, arguments);
});
var _TRN_ActionGetDest = (Module['_TRN_ActionGetDest'] = function () {
  return (_TRN_ActionGetDest = Module['_TRN_ActionGetDest'] = Module['asm']['Fk']).apply(null, arguments);
});
var _TRN_ActionGetNext = (Module['_TRN_ActionGetNext'] = function () {
  return (_TRN_ActionGetNext = Module['_TRN_ActionGetNext'] = Module['asm']['Gk']).apply(null, arguments);
});
var _TRN_ActionGetSDFObj = (Module['_TRN_ActionGetSDFObj'] = function () {
  return (_TRN_ActionGetSDFObj = Module['_TRN_ActionGetSDFObj'] = Module['asm']['Hk']).apply(null, arguments);
});
var _TRN_Action_GetFormActionFlag = (Module['_TRN_Action_GetFormActionFlag'] = function () {
  return (_TRN_Action_GetFormActionFlag = Module['_TRN_Action_GetFormActionFlag'] = Module['asm']['Ik']).apply(null, arguments);
});
var _TRN_Action_SetFormActionFlag = (Module['_TRN_Action_SetFormActionFlag'] = function () {
  return (_TRN_Action_SetFormActionFlag = Module['_TRN_Action_SetFormActionFlag'] = Module['asm']['Jk']).apply(null, arguments);
});
var _TRN_ActionNeedsWriteLock = (Module['_TRN_ActionNeedsWriteLock'] = function () {
  return (_TRN_ActionNeedsWriteLock = Module['_TRN_ActionNeedsWriteLock'] = Module['asm']['Kk']).apply(null, arguments);
});
var _TRN_Action_Execute = (Module['_TRN_Action_Execute'] = function () {
  return (_TRN_Action_Execute = Module['_TRN_Action_Execute'] = Module['asm']['Lk']).apply(null, arguments);
});
var _TRN_ActionExecuteKeyStrokeAction = (Module['_TRN_ActionExecuteKeyStrokeAction'] = function () {
  return (_TRN_ActionExecuteKeyStrokeAction = Module['_TRN_ActionExecuteKeyStrokeAction'] = Module['asm']['Mk']).apply(null, arguments);
});
var _TRN_KeyStrokeActionResultIsValid = (Module['_TRN_KeyStrokeActionResultIsValid'] = function () {
  return (_TRN_KeyStrokeActionResultIsValid = Module['_TRN_KeyStrokeActionResultIsValid'] = Module['asm']['Nk']).apply(null, arguments);
});
var _TRN_KeyStrokeActionResultGetText = (Module['_TRN_KeyStrokeActionResultGetText'] = function () {
  return (_TRN_KeyStrokeActionResultGetText = Module['_TRN_KeyStrokeActionResultGetText'] = Module['asm']['Ok']).apply(null, arguments);
});
var _TRN_KeyStrokeActionResultDestroy = (Module['_TRN_KeyStrokeActionResultDestroy'] = function () {
  return (_TRN_KeyStrokeActionResultDestroy = Module['_TRN_KeyStrokeActionResultDestroy'] = Module['asm']['Pk']).apply(null, arguments);
});
var _TRN_KeyStrokeActionResultCopy = (Module['_TRN_KeyStrokeActionResultCopy'] = function () {
  return (_TRN_KeyStrokeActionResultCopy = Module['_TRN_KeyStrokeActionResultCopy'] = Module['asm']['Qk']).apply(null, arguments);
});
var _TRN_KeyStrokeEventDataCreate = (Module['_TRN_KeyStrokeEventDataCreate'] = function () {
  return (_TRN_KeyStrokeEventDataCreate = Module['_TRN_KeyStrokeEventDataCreate'] = Module['asm']['Rk']).apply(null, arguments);
});
var _TRN_KeyStrokeEventDataDestroy = (Module['_TRN_KeyStrokeEventDataDestroy'] = function () {
  return (_TRN_KeyStrokeEventDataDestroy = Module['_TRN_KeyStrokeEventDataDestroy'] = Module['asm']['Sk']).apply(null, arguments);
});
var _TRN_KeyStrokeEventDataCopy = (Module['_TRN_KeyStrokeEventDataCopy'] = function () {
  return (_TRN_KeyStrokeEventDataCopy = Module['_TRN_KeyStrokeEventDataCopy'] = Module['asm']['Tk']).apply(null, arguments);
});
var _TRN_PageCreate = (Module['_TRN_PageCreate'] = function () {
  return (_TRN_PageCreate = Module['_TRN_PageCreate'] = Module['asm']['Uk']).apply(null, arguments);
});
var _TRN_PageCopy = (Module['_TRN_PageCopy'] = function () {
  return (_TRN_PageCopy = Module['_TRN_PageCopy'] = Module['asm']['Vk']).apply(null, arguments);
});
var _TRN_PageGetIndex = (Module['_TRN_PageGetIndex'] = function () {
  return (_TRN_PageGetIndex = Module['_TRN_PageGetIndex'] = Module['asm']['Wk']).apply(null, arguments);
});
var _TRN_PageGetTriggerAction = (Module['_TRN_PageGetTriggerAction'] = function () {
  return (_TRN_PageGetTriggerAction = Module['_TRN_PageGetTriggerAction'] = Module['asm']['Xk']).apply(null, arguments);
});
var _TRN_PageGetBox = (Module['_TRN_PageGetBox'] = function () {
  return (_TRN_PageGetBox = Module['_TRN_PageGetBox'] = Module['asm']['Yk']).apply(null, arguments);
});
var _TRN_PageSetBox = (Module['_TRN_PageSetBox'] = function () {
  return (_TRN_PageSetBox = Module['_TRN_PageSetBox'] = Module['asm']['Zk']).apply(null, arguments);
});
var _TRN_PageGetCropBox = (Module['_TRN_PageGetCropBox'] = function () {
  return (_TRN_PageGetCropBox = Module['_TRN_PageGetCropBox'] = Module['asm']['_k']).apply(null, arguments);
});
var _TRN_PageSetCropBox = (Module['_TRN_PageSetCropBox'] = function () {
  return (_TRN_PageSetCropBox = Module['_TRN_PageSetCropBox'] = Module['asm']['$k']).apply(null, arguments);
});
var _TRN_PageGetMediaBox = (Module['_TRN_PageGetMediaBox'] = function () {
  return (_TRN_PageGetMediaBox = Module['_TRN_PageGetMediaBox'] = Module['asm']['al']).apply(null, arguments);
});
var _TRN_PageSetMediaBox = (Module['_TRN_PageSetMediaBox'] = function () {
  return (_TRN_PageSetMediaBox = Module['_TRN_PageSetMediaBox'] = Module['asm']['bl']).apply(null, arguments);
});
var _TRN_PageGetVisibleContentBox = (Module['_TRN_PageGetVisibleContentBox'] = function () {
  return (_TRN_PageGetVisibleContentBox = Module['_TRN_PageGetVisibleContentBox'] = Module['asm']['cl']).apply(null, arguments);
});
var _TRN_PageGetRotation = (Module['_TRN_PageGetRotation'] = function () {
  return (_TRN_PageGetRotation = Module['_TRN_PageGetRotation'] = Module['asm']['dl']).apply(null, arguments);
});
var _TRN_PageSetRotation = (Module['_TRN_PageSetRotation'] = function () {
  return (_TRN_PageSetRotation = Module['_TRN_PageSetRotation'] = Module['asm']['el']).apply(null, arguments);
});
var _TRN_PageAddRotations = (Module['_TRN_PageAddRotations'] = function () {
  return (_TRN_PageAddRotations = Module['_TRN_PageAddRotations'] = Module['asm']['fl']).apply(null, arguments);
});
var _TRN_PageSubtractRotations = (Module['_TRN_PageSubtractRotations'] = function () {
  return (_TRN_PageSubtractRotations = Module['_TRN_PageSubtractRotations'] = Module['asm']['gl']).apply(null, arguments);
});
var _TRN_PageRotationToDegree = (Module['_TRN_PageRotationToDegree'] = function () {
  return (_TRN_PageRotationToDegree = Module['_TRN_PageRotationToDegree'] = Module['asm']['hl']).apply(null, arguments);
});
var _TRN_PageDegreeToRotation = (Module['_TRN_PageDegreeToRotation'] = function () {
  return (_TRN_PageDegreeToRotation = Module['_TRN_PageDegreeToRotation'] = Module['asm']['il']).apply(null, arguments);
});
var _TRN_PageGetPageWidth = (Module['_TRN_PageGetPageWidth'] = function () {
  return (_TRN_PageGetPageWidth = Module['_TRN_PageGetPageWidth'] = Module['asm']['jl']).apply(null, arguments);
});
var _TRN_PageGetPageHeight = (Module['_TRN_PageGetPageHeight'] = function () {
  return (_TRN_PageGetPageHeight = Module['_TRN_PageGetPageHeight'] = Module['asm']['kl']).apply(null, arguments);
});
var _TRN_PageGetAnnots = (Module['_TRN_PageGetAnnots'] = function () {
  return (_TRN_PageGetAnnots = Module['_TRN_PageGetAnnots'] = Module['asm']['ll']).apply(null, arguments);
});
var _TRN_PageGetNumAnnots = (Module['_TRN_PageGetNumAnnots'] = function () {
  return (_TRN_PageGetNumAnnots = Module['_TRN_PageGetNumAnnots'] = Module['asm']['ml']).apply(null, arguments);
});
var _TRN_PageGetAnnot = (Module['_TRN_PageGetAnnot'] = function () {
  return (_TRN_PageGetAnnot = Module['_TRN_PageGetAnnot'] = Module['asm']['nl']).apply(null, arguments);
});
var _TRN_PageAnnotInsert = (Module['_TRN_PageAnnotInsert'] = function () {
  return (_TRN_PageAnnotInsert = Module['_TRN_PageAnnotInsert'] = Module['asm']['ol']).apply(null, arguments);
});
var _TRN_PageAnnotPushBack = (Module['_TRN_PageAnnotPushBack'] = function () {
  return (_TRN_PageAnnotPushBack = Module['_TRN_PageAnnotPushBack'] = Module['asm']['pl']).apply(null, arguments);
});
var _TRN_PageAnnotPushFront = (Module['_TRN_PageAnnotPushFront'] = function () {
  return (_TRN_PageAnnotPushFront = Module['_TRN_PageAnnotPushFront'] = Module['asm']['ql']).apply(null, arguments);
});
var _TRN_PageAnnotRemove = (Module['_TRN_PageAnnotRemove'] = function () {
  return (_TRN_PageAnnotRemove = Module['_TRN_PageAnnotRemove'] = Module['asm']['rl']).apply(null, arguments);
});
var _TRN_PageAnnotRemoveByIndex = (Module['_TRN_PageAnnotRemoveByIndex'] = function () {
  return (_TRN_PageAnnotRemoveByIndex = Module['_TRN_PageAnnotRemoveByIndex'] = Module['asm']['sl']).apply(null, arguments);
});
var _TRN_PageScale = (Module['_TRN_PageScale'] = function () {
  return (_TRN_PageScale = Module['_TRN_PageScale'] = Module['asm']['tl']).apply(null, arguments);
});
var _TRN_PageFlattenField = (Module['_TRN_PageFlattenField'] = function () {
  return (_TRN_PageFlattenField = Module['_TRN_PageFlattenField'] = Module['asm']['ul']).apply(null, arguments);
});
var _TRN_PageHasTransition = (Module['_TRN_PageHasTransition'] = function () {
  return (_TRN_PageHasTransition = Module['_TRN_PageHasTransition'] = Module['asm']['vl']).apply(null, arguments);
});
var _TRN_PageGetUserUnitSize = (Module['_TRN_PageGetUserUnitSize'] = function () {
  return (_TRN_PageGetUserUnitSize = Module['_TRN_PageGetUserUnitSize'] = Module['asm']['wl']).apply(null, arguments);
});
var _TRN_PageSetUserUnitSize = (Module['_TRN_PageSetUserUnitSize'] = function () {
  return (_TRN_PageSetUserUnitSize = Module['_TRN_PageSetUserUnitSize'] = Module['asm']['xl']).apply(null, arguments);
});
var _TRN_PageGetResourceDict = (Module['_TRN_PageGetResourceDict'] = function () {
  return (_TRN_PageGetResourceDict = Module['_TRN_PageGetResourceDict'] = Module['asm']['yl']).apply(null, arguments);
});
var _TRN_PageGetContents = (Module['_TRN_PageGetContents'] = function () {
  return (_TRN_PageGetContents = Module['_TRN_PageGetContents'] = Module['asm']['zl']).apply(null, arguments);
});
var _TRN_PageGetThumb = (Module['_TRN_PageGetThumb'] = function () {
  return (_TRN_PageGetThumb = Module['_TRN_PageGetThumb'] = Module['asm']['Al']).apply(null, arguments);
});
var _TRN_PageGetSDFObj = (Module['_TRN_PageGetSDFObj'] = function () {
  return (_TRN_PageGetSDFObj = Module['_TRN_PageGetSDFObj'] = Module['asm']['Bl']).apply(null, arguments);
});
var _TRN_PageFindInheritedAttribute = (Module['_TRN_PageFindInheritedAttribute'] = function () {
  return (_TRN_PageFindInheritedAttribute = Module['_TRN_PageFindInheritedAttribute'] = Module['asm']['Cl']).apply(null, arguments);
});
var _TRN_AnnotCreate = (Module['_TRN_AnnotCreate'] = function () {
  return (_TRN_AnnotCreate = Module['_TRN_AnnotCreate'] = Module['asm']['Dl']).apply(null, arguments);
});
var _TRN_AnnotCreateFromObj = (Module['_TRN_AnnotCreateFromObj'] = function () {
  return (_TRN_AnnotCreateFromObj = Module['_TRN_AnnotCreateFromObj'] = Module['asm']['El']).apply(null, arguments);
});
var _TRN_AnnotCopy = (Module['_TRN_AnnotCopy'] = function () {
  return (_TRN_AnnotCopy = Module['_TRN_AnnotCopy'] = Module['asm']['Fl']).apply(null, arguments);
});
var _TRN_AnnotCompare = (Module['_TRN_AnnotCompare'] = function () {
  return (_TRN_AnnotCompare = Module['_TRN_AnnotCompare'] = Module['asm']['Gl']).apply(null, arguments);
});
var _TRN_AnnotIsValid = (Module['_TRN_AnnotIsValid'] = function () {
  return (_TRN_AnnotIsValid = Module['_TRN_AnnotIsValid'] = Module['asm']['Hl']).apply(null, arguments);
});
var _TRN_AnnotGetSDFObj = (Module['_TRN_AnnotGetSDFObj'] = function () {
  return (_TRN_AnnotGetSDFObj = Module['_TRN_AnnotGetSDFObj'] = Module['asm']['Il']).apply(null, arguments);
});
var _TRN_AnnotGetType = (Module['_TRN_AnnotGetType'] = function () {
  return (_TRN_AnnotGetType = Module['_TRN_AnnotGetType'] = Module['asm']['Jl']).apply(null, arguments);
});
var _TRN_AnnotIsMarkup = (Module['_TRN_AnnotIsMarkup'] = function () {
  return (_TRN_AnnotIsMarkup = Module['_TRN_AnnotIsMarkup'] = Module['asm']['Kl']).apply(null, arguments);
});
var _TRN_AnnotGetRect = (Module['_TRN_AnnotGetRect'] = function () {
  return (_TRN_AnnotGetRect = Module['_TRN_AnnotGetRect'] = Module['asm']['Ll']).apply(null, arguments);
});
var _TRN_AnnotGetVisibleContentBox = (Module['_TRN_AnnotGetVisibleContentBox'] = function () {
  return (_TRN_AnnotGetVisibleContentBox = Module['_TRN_AnnotGetVisibleContentBox'] = Module['asm']['Ml']).apply(null, arguments);
});
var _TRN_AnnotSetRect = (Module['_TRN_AnnotSetRect'] = function () {
  return (_TRN_AnnotSetRect = Module['_TRN_AnnotSetRect'] = Module['asm']['Nl']).apply(null, arguments);
});
var _TRN_AnnotResize = (Module['_TRN_AnnotResize'] = function () {
  return (_TRN_AnnotResize = Module['_TRN_AnnotResize'] = Module['asm']['Ol']).apply(null, arguments);
});
var _TRN_AnnotSetContents = (Module['_TRN_AnnotSetContents'] = function () {
  return (_TRN_AnnotSetContents = Module['_TRN_AnnotSetContents'] = Module['asm']['Pl']).apply(null, arguments);
});
var _TRN_AnnotGetContents = (Module['_TRN_AnnotGetContents'] = function () {
  return (_TRN_AnnotGetContents = Module['_TRN_AnnotGetContents'] = Module['asm']['Ql']).apply(null, arguments);
});
var _TRN_AnnotGetTriggerAction = (Module['_TRN_AnnotGetTriggerAction'] = function () {
  return (_TRN_AnnotGetTriggerAction = Module['_TRN_AnnotGetTriggerAction'] = Module['asm']['Rl']).apply(null, arguments);
});
var _TRN_AnnotGetCustomData = (Module['_TRN_AnnotGetCustomData'] = function () {
  return (_TRN_AnnotGetCustomData = Module['_TRN_AnnotGetCustomData'] = Module['asm']['Sl']).apply(null, arguments);
});
var _TRN_AnnotSetCustomData = (Module['_TRN_AnnotSetCustomData'] = function () {
  return (_TRN_AnnotSetCustomData = Module['_TRN_AnnotSetCustomData'] = Module['asm']['Tl']).apply(null, arguments);
});
var _TRN_AnnotDeleteCustomData = (Module['_TRN_AnnotDeleteCustomData'] = function () {
  return (_TRN_AnnotDeleteCustomData = Module['_TRN_AnnotDeleteCustomData'] = Module['asm']['Ul']).apply(null, arguments);
});
var _TRN_AnnotGetPage = (Module['_TRN_AnnotGetPage'] = function () {
  return (_TRN_AnnotGetPage = Module['_TRN_AnnotGetPage'] = Module['asm']['Vl']).apply(null, arguments);
});
var _TRN_AnnotSetPage = (Module['_TRN_AnnotSetPage'] = function () {
  return (_TRN_AnnotSetPage = Module['_TRN_AnnotSetPage'] = Module['asm']['Wl']).apply(null, arguments);
});
var _TRN_AnnotGetUniqueID = (Module['_TRN_AnnotGetUniqueID'] = function () {
  return (_TRN_AnnotGetUniqueID = Module['_TRN_AnnotGetUniqueID'] = Module['asm']['Xl']).apply(null, arguments);
});
var _TRN_AnnotSetUniqueID = (Module['_TRN_AnnotSetUniqueID'] = function () {
  return (_TRN_AnnotSetUniqueID = Module['_TRN_AnnotSetUniqueID'] = Module['asm']['Yl']).apply(null, arguments);
});
var _TRN_AnnotGetDate = (Module['_TRN_AnnotGetDate'] = function () {
  return (_TRN_AnnotGetDate = Module['_TRN_AnnotGetDate'] = Module['asm']['Zl']).apply(null, arguments);
});
var _TRN_AnnotSetDate = (Module['_TRN_AnnotSetDate'] = function () {
  return (_TRN_AnnotSetDate = Module['_TRN_AnnotSetDate'] = Module['asm']['_l']).apply(null, arguments);
});
var _TRN_AnnotGetFlag = (Module['_TRN_AnnotGetFlag'] = function () {
  return (_TRN_AnnotGetFlag = Module['_TRN_AnnotGetFlag'] = Module['asm']['$l']).apply(null, arguments);
});
var _TRN_AnnotSetFlag = (Module['_TRN_AnnotSetFlag'] = function () {
  return (_TRN_AnnotSetFlag = Module['_TRN_AnnotSetFlag'] = Module['asm']['am']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleCreate = (Module['_TRN_AnnotBorderStyleCreate'] = function () {
  return (_TRN_AnnotBorderStyleCreate = Module['_TRN_AnnotBorderStyleCreate'] = Module['asm']['bm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleCreateWithDashPattern = (Module['_TRN_AnnotBorderStyleCreateWithDashPattern'] = function () {
  return (_TRN_AnnotBorderStyleCreateWithDashPattern = Module['_TRN_AnnotBorderStyleCreateWithDashPattern'] = Module['asm']['cm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleCopy = (Module['_TRN_AnnotBorderStyleCopy'] = function () {
  return (_TRN_AnnotBorderStyleCopy = Module['_TRN_AnnotBorderStyleCopy'] = Module['asm']['dm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleGetStyle = (Module['_TRN_AnnotBorderStyleGetStyle'] = function () {
  return (_TRN_AnnotBorderStyleGetStyle = Module['_TRN_AnnotBorderStyleGetStyle'] = Module['asm']['em']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleSetStyle = (Module['_TRN_AnnotBorderStyleSetStyle'] = function () {
  return (_TRN_AnnotBorderStyleSetStyle = Module['_TRN_AnnotBorderStyleSetStyle'] = Module['asm']['fm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleDestroy = (Module['_TRN_AnnotBorderStyleDestroy'] = function () {
  return (_TRN_AnnotBorderStyleDestroy = Module['_TRN_AnnotBorderStyleDestroy'] = Module['asm']['gm']).apply(null, arguments);
});
var _TRN_AnnotGetAppearance = (Module['_TRN_AnnotGetAppearance'] = function () {
  return (_TRN_AnnotGetAppearance = Module['_TRN_AnnotGetAppearance'] = Module['asm']['hm']).apply(null, arguments);
});
var _TRN_AnnotSetAppearance = (Module['_TRN_AnnotSetAppearance'] = function () {
  return (_TRN_AnnotSetAppearance = Module['_TRN_AnnotSetAppearance'] = Module['asm']['im']).apply(null, arguments);
});
var _TRN_AnnotRemoveAppearance = (Module['_TRN_AnnotRemoveAppearance'] = function () {
  return (_TRN_AnnotRemoveAppearance = Module['_TRN_AnnotRemoveAppearance'] = Module['asm']['jm']).apply(null, arguments);
});
var _TRN_AnnotFlatten = (Module['_TRN_AnnotFlatten'] = function () {
  return (_TRN_AnnotFlatten = Module['_TRN_AnnotFlatten'] = Module['asm']['km']).apply(null, arguments);
});
var _TRN_AnnotGetActiveAppearanceState = (Module['_TRN_AnnotGetActiveAppearanceState'] = function () {
  return (_TRN_AnnotGetActiveAppearanceState = Module['_TRN_AnnotGetActiveAppearanceState'] = Module['asm']['lm']).apply(null, arguments);
});
var _TRN_AnnotSetActiveAppearanceState = (Module['_TRN_AnnotSetActiveAppearanceState'] = function () {
  return (_TRN_AnnotSetActiveAppearanceState = Module['_TRN_AnnotSetActiveAppearanceState'] = Module['asm']['mm']).apply(null, arguments);
});
var _TRN_AnnotGetColor = (Module['_TRN_AnnotGetColor'] = function () {
  return (_TRN_AnnotGetColor = Module['_TRN_AnnotGetColor'] = Module['asm']['nm']).apply(null, arguments);
});
var _TRN_AnnotGetColorAsRGB = (Module['_TRN_AnnotGetColorAsRGB'] = function () {
  return (_TRN_AnnotGetColorAsRGB = Module['_TRN_AnnotGetColorAsRGB'] = Module['asm']['om']).apply(null, arguments);
});
var _TRN_AnnotGetColorAsCMYK = (Module['_TRN_AnnotGetColorAsCMYK'] = function () {
  return (_TRN_AnnotGetColorAsCMYK = Module['_TRN_AnnotGetColorAsCMYK'] = Module['asm']['pm']).apply(null, arguments);
});
var _TRN_AnnotGetColorAsGray = (Module['_TRN_AnnotGetColorAsGray'] = function () {
  return (_TRN_AnnotGetColorAsGray = Module['_TRN_AnnotGetColorAsGray'] = Module['asm']['qm']).apply(null, arguments);
});
var _TRN_AnnotGetColorCompNum = (Module['_TRN_AnnotGetColorCompNum'] = function () {
  return (_TRN_AnnotGetColorCompNum = Module['_TRN_AnnotGetColorCompNum'] = Module['asm']['rm']).apply(null, arguments);
});
var _TRN_AnnotSetColorDefault = (Module['_TRN_AnnotSetColorDefault'] = function () {
  return (_TRN_AnnotSetColorDefault = Module['_TRN_AnnotSetColorDefault'] = Module['asm']['sm']).apply(null, arguments);
});
var _TRN_AnnotSetColor = (Module['_TRN_AnnotSetColor'] = function () {
  return (_TRN_AnnotSetColor = Module['_TRN_AnnotSetColor'] = Module['asm']['tm']).apply(null, arguments);
});
var _TRN_AnnotGetStructParent = (Module['_TRN_AnnotGetStructParent'] = function () {
  return (_TRN_AnnotGetStructParent = Module['_TRN_AnnotGetStructParent'] = Module['asm']['um']).apply(null, arguments);
});
var _TRN_AnnotSetStructParent = (Module['_TRN_AnnotSetStructParent'] = function () {
  return (_TRN_AnnotSetStructParent = Module['_TRN_AnnotSetStructParent'] = Module['asm']['vm']).apply(null, arguments);
});
var _TRN_AnnotGetOptionalContent = (Module['_TRN_AnnotGetOptionalContent'] = function () {
  return (_TRN_AnnotGetOptionalContent = Module['_TRN_AnnotGetOptionalContent'] = Module['asm']['wm']).apply(null, arguments);
});
var _TRN_AnnotSetOptionalContent = (Module['_TRN_AnnotSetOptionalContent'] = function () {
  return (_TRN_AnnotSetOptionalContent = Module['_TRN_AnnotSetOptionalContent'] = Module['asm']['xm']).apply(null, arguments);
});
var _TRN_AnnotRefreshAppearance = (Module['_TRN_AnnotRefreshAppearance'] = function () {
  return (_TRN_AnnotRefreshAppearance = Module['_TRN_AnnotRefreshAppearance'] = Module['asm']['ym']).apply(null, arguments);
});
var _TRN_AnnotRefreshAppearanceRefreshOptions = (Module['_TRN_AnnotRefreshAppearanceRefreshOptions'] = function () {
  return (_TRN_AnnotRefreshAppearanceRefreshOptions = Module['_TRN_AnnotRefreshAppearanceRefreshOptions'] = Module['asm']['zm']).apply(null, arguments);
});
var _TRN_AnnotGetRotation = (Module['_TRN_AnnotGetRotation'] = function () {
  return (_TRN_AnnotGetRotation = Module['_TRN_AnnotGetRotation'] = Module['asm']['Am']).apply(null, arguments);
});
var _TRN_AnnotSetRotation = (Module['_TRN_AnnotSetRotation'] = function () {
  return (_TRN_AnnotSetRotation = Module['_TRN_AnnotSetRotation'] = Module['asm']['Bm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleGetWidth = (Module['_TRN_AnnotBorderStyleGetWidth'] = function () {
  return (_TRN_AnnotBorderStyleGetWidth = Module['_TRN_AnnotBorderStyleGetWidth'] = Module['asm']['Cm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleSetWidth = (Module['_TRN_AnnotBorderStyleSetWidth'] = function () {
  return (_TRN_AnnotBorderStyleSetWidth = Module['_TRN_AnnotBorderStyleSetWidth'] = Module['asm']['Dm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleGetHR = (Module['_TRN_AnnotBorderStyleGetHR'] = function () {
  return (_TRN_AnnotBorderStyleGetHR = Module['_TRN_AnnotBorderStyleGetHR'] = Module['asm']['Em']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleSetHR = (Module['_TRN_AnnotBorderStyleSetHR'] = function () {
  return (_TRN_AnnotBorderStyleSetHR = Module['_TRN_AnnotBorderStyleSetHR'] = Module['asm']['Fm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleGetVR = (Module['_TRN_AnnotBorderStyleGetVR'] = function () {
  return (_TRN_AnnotBorderStyleGetVR = Module['_TRN_AnnotBorderStyleGetVR'] = Module['asm']['Gm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleSetVR = (Module['_TRN_AnnotBorderStyleSetVR'] = function () {
  return (_TRN_AnnotBorderStyleSetVR = Module['_TRN_AnnotBorderStyleSetVR'] = Module['asm']['Hm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleGetDashPattern = (Module['_TRN_AnnotBorderStyleGetDashPattern'] = function () {
  return (_TRN_AnnotBorderStyleGetDashPattern = Module['_TRN_AnnotBorderStyleGetDashPattern'] = Module['asm']['Im']).apply(null, arguments);
});
var _TRN_AnnotGetBorderStyle = (Module['_TRN_AnnotGetBorderStyle'] = function () {
  return (_TRN_AnnotGetBorderStyle = Module['_TRN_AnnotGetBorderStyle'] = Module['asm']['Jm']).apply(null, arguments);
});
var _TRN_AnnotSetBorderStyle = (Module['_TRN_AnnotSetBorderStyle'] = function () {
  return (_TRN_AnnotSetBorderStyle = Module['_TRN_AnnotSetBorderStyle'] = Module['asm']['Km']).apply(null, arguments);
});
var _TRN_AnnotGetBorderStyleStyle = (Module['_TRN_AnnotGetBorderStyleStyle'] = function () {
  return (_TRN_AnnotGetBorderStyleStyle = Module['_TRN_AnnotGetBorderStyleStyle'] = Module['asm']['Lm']).apply(null, arguments);
});
var _TRN_AnnotSetBorderStyleStyle = (Module['_TRN_AnnotSetBorderStyleStyle'] = function () {
  return (_TRN_AnnotSetBorderStyleStyle = Module['_TRN_AnnotSetBorderStyleStyle'] = Module['asm']['Mm']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleCompare = (Module['_TRN_AnnotBorderStyleCompare'] = function () {
  return (_TRN_AnnotBorderStyleCompare = Module['_TRN_AnnotBorderStyleCompare'] = Module['asm']['Nm']).apply(null, arguments);
});
var _TRN_CaretAnnotCreateFromObj = (Module['_TRN_CaretAnnotCreateFromObj'] = function () {
  return (_TRN_CaretAnnotCreateFromObj = Module['_TRN_CaretAnnotCreateFromObj'] = Module['asm']['Om']).apply(null, arguments);
});
var _TRN_CaretAnnotCreateFromAnnot = (Module['_TRN_CaretAnnotCreateFromAnnot'] = function () {
  return (_TRN_CaretAnnotCreateFromAnnot = Module['_TRN_CaretAnnotCreateFromAnnot'] = Module['asm']['Pm']).apply(null, arguments);
});
var _TRN_CaretAnnotCreate = (Module['_TRN_CaretAnnotCreate'] = function () {
  return (_TRN_CaretAnnotCreate = Module['_TRN_CaretAnnotCreate'] = Module['asm']['Qm']).apply(null, arguments);
});
var _TRN_CaretAnnotGetSymbol = (Module['_TRN_CaretAnnotGetSymbol'] = function () {
  return (_TRN_CaretAnnotGetSymbol = Module['_TRN_CaretAnnotGetSymbol'] = Module['asm']['Rm']).apply(null, arguments);
});
var _TRN_CaretAnnotSetSymbol = (Module['_TRN_CaretAnnotSetSymbol'] = function () {
  return (_TRN_CaretAnnotSetSymbol = Module['_TRN_CaretAnnotSetSymbol'] = Module['asm']['Sm']).apply(null, arguments);
});
var _TRN_LineAnnotCreateFromObj = (Module['_TRN_LineAnnotCreateFromObj'] = function () {
  return (_TRN_LineAnnotCreateFromObj = Module['_TRN_LineAnnotCreateFromObj'] = Module['asm']['Tm']).apply(null, arguments);
});
var _TRN_LineAnnotCreateFromAnnot = (Module['_TRN_LineAnnotCreateFromAnnot'] = function () {
  return (_TRN_LineAnnotCreateFromAnnot = Module['_TRN_LineAnnotCreateFromAnnot'] = Module['asm']['Um']).apply(null, arguments);
});
var _TRN_LineAnnotCreate = (Module['_TRN_LineAnnotCreate'] = function () {
  return (_TRN_LineAnnotCreate = Module['_TRN_LineAnnotCreate'] = Module['asm']['Vm']).apply(null, arguments);
});
var _TRN_LineAnnotGetStartPoint = (Module['_TRN_LineAnnotGetStartPoint'] = function () {
  return (_TRN_LineAnnotGetStartPoint = Module['_TRN_LineAnnotGetStartPoint'] = Module['asm']['Wm']).apply(null, arguments);
});
var _TRN_LineAnnotSetStartPoint = (Module['_TRN_LineAnnotSetStartPoint'] = function () {
  return (_TRN_LineAnnotSetStartPoint = Module['_TRN_LineAnnotSetStartPoint'] = Module['asm']['Xm']).apply(null, arguments);
});
var _TRN_LineAnnotGetEndPoint = (Module['_TRN_LineAnnotGetEndPoint'] = function () {
  return (_TRN_LineAnnotGetEndPoint = Module['_TRN_LineAnnotGetEndPoint'] = Module['asm']['Ym']).apply(null, arguments);
});
var _TRN_LineAnnotSetEndPoint = (Module['_TRN_LineAnnotSetEndPoint'] = function () {
  return (_TRN_LineAnnotSetEndPoint = Module['_TRN_LineAnnotSetEndPoint'] = Module['asm']['Zm']).apply(null, arguments);
});
var _TRN_LineAnnotGetStartStyle = (Module['_TRN_LineAnnotGetStartStyle'] = function () {
  return (_TRN_LineAnnotGetStartStyle = Module['_TRN_LineAnnotGetStartStyle'] = Module['asm']['_m']).apply(null, arguments);
});
var _TRN_LineAnnotSetStartStyle = (Module['_TRN_LineAnnotSetStartStyle'] = function () {
  return (_TRN_LineAnnotSetStartStyle = Module['_TRN_LineAnnotSetStartStyle'] = Module['asm']['$m']).apply(null, arguments);
});
var _TRN_LineAnnotGetEndStyle = (Module['_TRN_LineAnnotGetEndStyle'] = function () {
  return (_TRN_LineAnnotGetEndStyle = Module['_TRN_LineAnnotGetEndStyle'] = Module['asm']['an']).apply(null, arguments);
});
var _TRN_LineAnnotSetEndStyle = (Module['_TRN_LineAnnotSetEndStyle'] = function () {
  return (_TRN_LineAnnotSetEndStyle = Module['_TRN_LineAnnotSetEndStyle'] = Module['asm']['bn']).apply(null, arguments);
});
var _TRN_LineAnnotGetLeaderLineLength = (Module['_TRN_LineAnnotGetLeaderLineLength'] = function () {
  return (_TRN_LineAnnotGetLeaderLineLength = Module['_TRN_LineAnnotGetLeaderLineLength'] = Module['asm']['cn']).apply(null, arguments);
});
var _TRN_LineAnnotSetLeaderLineLength = (Module['_TRN_LineAnnotSetLeaderLineLength'] = function () {
  return (_TRN_LineAnnotSetLeaderLineLength = Module['_TRN_LineAnnotSetLeaderLineLength'] = Module['asm']['dn']).apply(null, arguments);
});
var _TRN_LineAnnotGetLeaderLineExtensionLength = (Module['_TRN_LineAnnotGetLeaderLineExtensionLength'] = function () {
  return (_TRN_LineAnnotGetLeaderLineExtensionLength = Module['_TRN_LineAnnotGetLeaderLineExtensionLength'] = Module['asm']['en']).apply(null, arguments);
});
var _TRN_LineAnnotSetLeaderLineExtensionLength = (Module['_TRN_LineAnnotSetLeaderLineExtensionLength'] = function () {
  return (_TRN_LineAnnotSetLeaderLineExtensionLength = Module['_TRN_LineAnnotSetLeaderLineExtensionLength'] = Module['asm']['fn']).apply(null, arguments);
});
var _TRN_LineAnnotGetShowCaption = (Module['_TRN_LineAnnotGetShowCaption'] = function () {
  return (_TRN_LineAnnotGetShowCaption = Module['_TRN_LineAnnotGetShowCaption'] = Module['asm']['gn']).apply(null, arguments);
});
var _TRN_LineAnnotSetShowCaption = (Module['_TRN_LineAnnotSetShowCaption'] = function () {
  return (_TRN_LineAnnotSetShowCaption = Module['_TRN_LineAnnotSetShowCaption'] = Module['asm']['hn']).apply(null, arguments);
});
var _TRN_LineAnnotGetIntentType = (Module['_TRN_LineAnnotGetIntentType'] = function () {
  return (_TRN_LineAnnotGetIntentType = Module['_TRN_LineAnnotGetIntentType'] = Module['asm']['jn']).apply(null, arguments);
});
var _TRN_LineAnnotSetIntentType = (Module['_TRN_LineAnnotSetIntentType'] = function () {
  return (_TRN_LineAnnotSetIntentType = Module['_TRN_LineAnnotSetIntentType'] = Module['asm']['kn']).apply(null, arguments);
});
var _TRN_LineAnnotGetCapPos = (Module['_TRN_LineAnnotGetCapPos'] = function () {
  return (_TRN_LineAnnotGetCapPos = Module['_TRN_LineAnnotGetCapPos'] = Module['asm']['ln']).apply(null, arguments);
});
var _TRN_LineAnnotSetCapPos = (Module['_TRN_LineAnnotSetCapPos'] = function () {
  return (_TRN_LineAnnotSetCapPos = Module['_TRN_LineAnnotSetCapPos'] = Module['asm']['mn']).apply(null, arguments);
});
var _TRN_LineAnnotGetLeaderLineOffset = (Module['_TRN_LineAnnotGetLeaderLineOffset'] = function () {
  return (_TRN_LineAnnotGetLeaderLineOffset = Module['_TRN_LineAnnotGetLeaderLineOffset'] = Module['asm']['nn']).apply(null, arguments);
});
var _TRN_LineAnnotSetLeaderLineOffset = (Module['_TRN_LineAnnotSetLeaderLineOffset'] = function () {
  return (_TRN_LineAnnotSetLeaderLineOffset = Module['_TRN_LineAnnotSetLeaderLineOffset'] = Module['asm']['on']).apply(null, arguments);
});
var _TRN_LineAnnotGetTextHOffset = (Module['_TRN_LineAnnotGetTextHOffset'] = function () {
  return (_TRN_LineAnnotGetTextHOffset = Module['_TRN_LineAnnotGetTextHOffset'] = Module['asm']['pn']).apply(null, arguments);
});
var _TRN_LineAnnotSetTextHOffset = (Module['_TRN_LineAnnotSetTextHOffset'] = function () {
  return (_TRN_LineAnnotSetTextHOffset = Module['_TRN_LineAnnotSetTextHOffset'] = Module['asm']['qn']).apply(null, arguments);
});
var _TRN_LineAnnotGetTextVOffset = (Module['_TRN_LineAnnotGetTextVOffset'] = function () {
  return (_TRN_LineAnnotGetTextVOffset = Module['_TRN_LineAnnotGetTextVOffset'] = Module['asm']['rn']).apply(null, arguments);
});
var _TRN_LineAnnotSetTextVOffset = (Module['_TRN_LineAnnotSetTextVOffset'] = function () {
  return (_TRN_LineAnnotSetTextVOffset = Module['_TRN_LineAnnotSetTextVOffset'] = Module['asm']['sn']).apply(null, arguments);
});
var _TRN_CircleAnnotCreateFromObj = (Module['_TRN_CircleAnnotCreateFromObj'] = function () {
  return (_TRN_CircleAnnotCreateFromObj = Module['_TRN_CircleAnnotCreateFromObj'] = Module['asm']['tn']).apply(null, arguments);
});
var _TRN_CircleAnnotCreateFromAnnot = (Module['_TRN_CircleAnnotCreateFromAnnot'] = function () {
  return (_TRN_CircleAnnotCreateFromAnnot = Module['_TRN_CircleAnnotCreateFromAnnot'] = Module['asm']['un']).apply(null, arguments);
});
var _TRN_CircleAnnotCreate = (Module['_TRN_CircleAnnotCreate'] = function () {
  return (_TRN_CircleAnnotCreate = Module['_TRN_CircleAnnotCreate'] = Module['asm']['vn']).apply(null, arguments);
});
var _TRN_CircleAnnotGetInteriorColor = (Module['_TRN_CircleAnnotGetInteriorColor'] = function () {
  return (_TRN_CircleAnnotGetInteriorColor = Module['_TRN_CircleAnnotGetInteriorColor'] = Module['asm']['wn']).apply(null, arguments);
});
var _TRN_CircleAnnotGetInteriorColorCompNum = (Module['_TRN_CircleAnnotGetInteriorColorCompNum'] = function () {
  return (_TRN_CircleAnnotGetInteriorColorCompNum = Module['_TRN_CircleAnnotGetInteriorColorCompNum'] = Module['asm']['xn']).apply(null, arguments);
});
var _TRN_CircleAnnotSetInteriorColorDefault = (Module['_TRN_CircleAnnotSetInteriorColorDefault'] = function () {
  return (_TRN_CircleAnnotSetInteriorColorDefault = Module['_TRN_CircleAnnotSetInteriorColorDefault'] = Module['asm']['yn']).apply(null, arguments);
});
var _TRN_CircleAnnotSetInteriorColor = (Module['_TRN_CircleAnnotSetInteriorColor'] = function () {
  return (_TRN_CircleAnnotSetInteriorColor = Module['_TRN_CircleAnnotSetInteriorColor'] = Module['asm']['zn']).apply(null, arguments);
});
var _TRN_CircleAnnotGetContentRect = (Module['_TRN_CircleAnnotGetContentRect'] = function () {
  return (_TRN_CircleAnnotGetContentRect = Module['_TRN_CircleAnnotGetContentRect'] = Module['asm']['An']).apply(null, arguments);
});
var _TRN_CircleAnnotSetContentRect = (Module['_TRN_CircleAnnotSetContentRect'] = function () {
  return (_TRN_CircleAnnotSetContentRect = Module['_TRN_CircleAnnotSetContentRect'] = Module['asm']['Bn']).apply(null, arguments);
});
var _TRN_CircleAnnotGetPadding = (Module['_TRN_CircleAnnotGetPadding'] = function () {
  return (_TRN_CircleAnnotGetPadding = Module['_TRN_CircleAnnotGetPadding'] = Module['asm']['Cn']).apply(null, arguments);
});
var _TRN_CircleAnnotSetPadding = (Module['_TRN_CircleAnnotSetPadding'] = function () {
  return (_TRN_CircleAnnotSetPadding = Module['_TRN_CircleAnnotSetPadding'] = Module['asm']['Dn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotCreateFromObj = (Module['_TRN_FileAttachmentAnnotCreateFromObj'] = function () {
  return (_TRN_FileAttachmentAnnotCreateFromObj = Module['_TRN_FileAttachmentAnnotCreateFromObj'] = Module['asm']['En']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotExport = (Module['_TRN_FileAttachmentAnnotExport'] = function () {
  return (_TRN_FileAttachmentAnnotExport = Module['_TRN_FileAttachmentAnnotExport'] = Module['asm']['Fn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotCreateFromAnnot = (Module['_TRN_FileAttachmentAnnotCreateFromAnnot'] = function () {
  return (_TRN_FileAttachmentAnnotCreateFromAnnot = Module['_TRN_FileAttachmentAnnotCreateFromAnnot'] = Module['asm']['Gn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotCreateWithFileSpec = (Module['_TRN_FileAttachmentAnnotCreateWithFileSpec'] = function () {
  return (_TRN_FileAttachmentAnnotCreateWithFileSpec = Module['_TRN_FileAttachmentAnnotCreateWithFileSpec'] = Module['asm']['Hn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotCreateDefault = (Module['_TRN_FileAttachmentAnnotCreateDefault'] = function () {
  return (_TRN_FileAttachmentAnnotCreateDefault = Module['_TRN_FileAttachmentAnnotCreateDefault'] = Module['asm']['In']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotGetFileSpec = (Module['_TRN_FileAttachmentAnnotGetFileSpec'] = function () {
  return (_TRN_FileAttachmentAnnotGetFileSpec = Module['_TRN_FileAttachmentAnnotGetFileSpec'] = Module['asm']['Jn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotSetFileSpec = (Module['_TRN_FileAttachmentAnnotSetFileSpec'] = function () {
  return (_TRN_FileAttachmentAnnotSetFileSpec = Module['_TRN_FileAttachmentAnnotSetFileSpec'] = Module['asm']['Kn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotGetIcon = (Module['_TRN_FileAttachmentAnnotGetIcon'] = function () {
  return (_TRN_FileAttachmentAnnotGetIcon = Module['_TRN_FileAttachmentAnnotGetIcon'] = Module['asm']['Ln']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotSetIcon = (Module['_TRN_FileAttachmentAnnotSetIcon'] = function () {
  return (_TRN_FileAttachmentAnnotSetIcon = Module['_TRN_FileAttachmentAnnotSetIcon'] = Module['asm']['Mn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotGetIconName = (Module['_TRN_FileAttachmentAnnotGetIconName'] = function () {
  return (_TRN_FileAttachmentAnnotGetIconName = Module['_TRN_FileAttachmentAnnotGetIconName'] = Module['asm']['Nn']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotSetIconName = (Module['_TRN_FileAttachmentAnnotSetIconName'] = function () {
  return (_TRN_FileAttachmentAnnotSetIconName = Module['_TRN_FileAttachmentAnnotSetIconName'] = Module['asm']['On']).apply(null, arguments);
});
var _TRN_FreeTextAnnotCreateFromObj = (Module['_TRN_FreeTextAnnotCreateFromObj'] = function () {
  return (_TRN_FreeTextAnnotCreateFromObj = Module['_TRN_FreeTextAnnotCreateFromObj'] = Module['asm']['Pn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotCreateFromAnnot = (Module['_TRN_FreeTextAnnotCreateFromAnnot'] = function () {
  return (_TRN_FreeTextAnnotCreateFromAnnot = Module['_TRN_FreeTextAnnotCreateFromAnnot'] = Module['asm']['Qn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotCreate = (Module['_TRN_FreeTextAnnotCreate'] = function () {
  return (_TRN_FreeTextAnnotCreate = Module['_TRN_FreeTextAnnotCreate'] = Module['asm']['Rn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetDefaultAppearance = (Module['_TRN_FreeTextAnnotGetDefaultAppearance'] = function () {
  return (_TRN_FreeTextAnnotGetDefaultAppearance = Module['_TRN_FreeTextAnnotGetDefaultAppearance'] = Module['asm']['Sn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetDefaultAppearance = (Module['_TRN_FreeTextAnnotSetDefaultAppearance'] = function () {
  return (_TRN_FreeTextAnnotSetDefaultAppearance = Module['_TRN_FreeTextAnnotSetDefaultAppearance'] = Module['asm']['Tn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetQuaddingFormat = (Module['_TRN_FreeTextAnnotGetQuaddingFormat'] = function () {
  return (_TRN_FreeTextAnnotGetQuaddingFormat = Module['_TRN_FreeTextAnnotGetQuaddingFormat'] = Module['asm']['Un']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetQuaddingFormat = (Module['_TRN_FreeTextAnnotSetQuaddingFormat'] = function () {
  return (_TRN_FreeTextAnnotSetQuaddingFormat = Module['_TRN_FreeTextAnnotSetQuaddingFormat'] = Module['asm']['Vn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetCalloutLinePoints = (Module['_TRN_FreeTextAnnotGetCalloutLinePoints'] = function () {
  return (_TRN_FreeTextAnnotGetCalloutLinePoints = Module['_TRN_FreeTextAnnotGetCalloutLinePoints'] = Module['asm']['Wn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetCalloutLinePoints = (Module['_TRN_FreeTextAnnotSetCalloutLinePoints'] = function () {
  return (_TRN_FreeTextAnnotSetCalloutLinePoints = Module['_TRN_FreeTextAnnotSetCalloutLinePoints'] = Module['asm']['Xn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetCalloutLinePointsTwo = (Module['_TRN_FreeTextAnnotSetCalloutLinePointsTwo'] = function () {
  return (_TRN_FreeTextAnnotSetCalloutLinePointsTwo = Module['_TRN_FreeTextAnnotSetCalloutLinePointsTwo'] = Module['asm']['Yn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetIntentName = (Module['_TRN_FreeTextAnnotGetIntentName'] = function () {
  return (_TRN_FreeTextAnnotGetIntentName = Module['_TRN_FreeTextAnnotGetIntentName'] = Module['asm']['Zn']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetIntentName = (Module['_TRN_FreeTextAnnotSetIntentName'] = function () {
  return (_TRN_FreeTextAnnotSetIntentName = Module['_TRN_FreeTextAnnotSetIntentName'] = Module['asm']['_n']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetIntentNameDefault = (Module['_TRN_FreeTextAnnotSetIntentNameDefault'] = function () {
  return (_TRN_FreeTextAnnotSetIntentNameDefault = Module['_TRN_FreeTextAnnotSetIntentNameDefault'] = Module['asm']['$n']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetEndingStyle = (Module['_TRN_FreeTextAnnotGetEndingStyle'] = function () {
  return (_TRN_FreeTextAnnotGetEndingStyle = Module['_TRN_FreeTextAnnotGetEndingStyle'] = Module['asm']['ao']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetEndingStyle = (Module['_TRN_FreeTextAnnotSetEndingStyle'] = function () {
  return (_TRN_FreeTextAnnotSetEndingStyle = Module['_TRN_FreeTextAnnotSetEndingStyle'] = Module['asm']['bo']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetEndingStyleName = (Module['_TRN_FreeTextAnnotSetEndingStyleName'] = function () {
  return (_TRN_FreeTextAnnotSetEndingStyleName = Module['_TRN_FreeTextAnnotSetEndingStyleName'] = Module['asm']['co']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetTextColor = (Module['_TRN_FreeTextAnnotSetTextColor'] = function () {
  return (_TRN_FreeTextAnnotSetTextColor = Module['_TRN_FreeTextAnnotSetTextColor'] = Module['asm']['eo']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetTextColor = (Module['_TRN_FreeTextAnnotGetTextColor'] = function () {
  return (_TRN_FreeTextAnnotGetTextColor = Module['_TRN_FreeTextAnnotGetTextColor'] = Module['asm']['fo']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetLineColor = (Module['_TRN_FreeTextAnnotSetLineColor'] = function () {
  return (_TRN_FreeTextAnnotSetLineColor = Module['_TRN_FreeTextAnnotSetLineColor'] = Module['asm']['go']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetLineColor = (Module['_TRN_FreeTextAnnotGetLineColor'] = function () {
  return (_TRN_FreeTextAnnotGetLineColor = Module['_TRN_FreeTextAnnotGetLineColor'] = Module['asm']['ho']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetFontName = (Module['_TRN_FreeTextAnnotSetFontName'] = function () {
  return (_TRN_FreeTextAnnotSetFontName = Module['_TRN_FreeTextAnnotSetFontName'] = Module['asm']['io']).apply(null, arguments);
});
var _TRN_FreeTextAnnotSetFontSize = (Module['_TRN_FreeTextAnnotSetFontSize'] = function () {
  return (_TRN_FreeTextAnnotSetFontSize = Module['_TRN_FreeTextAnnotSetFontSize'] = Module['asm']['jo']).apply(null, arguments);
});
var _TRN_FreeTextAnnotGetFontSize = (Module['_TRN_FreeTextAnnotGetFontSize'] = function () {
  return (_TRN_FreeTextAnnotGetFontSize = Module['_TRN_FreeTextAnnotGetFontSize'] = Module['asm']['ko']).apply(null, arguments);
});
var _TRN_HighlightAnnotCreateFromObj = (Module['_TRN_HighlightAnnotCreateFromObj'] = function () {
  return (_TRN_HighlightAnnotCreateFromObj = Module['_TRN_HighlightAnnotCreateFromObj'] = Module['asm']['lo']).apply(null, arguments);
});
var _TRN_HighlightAnnotCreateFromAnnot = (Module['_TRN_HighlightAnnotCreateFromAnnot'] = function () {
  return (_TRN_HighlightAnnotCreateFromAnnot = Module['_TRN_HighlightAnnotCreateFromAnnot'] = Module['asm']['mo']).apply(null, arguments);
});
var _TRN_HighlightAnnotCreate = (Module['_TRN_HighlightAnnotCreate'] = function () {
  return (_TRN_HighlightAnnotCreate = Module['_TRN_HighlightAnnotCreate'] = Module['asm']['no']).apply(null, arguments);
});
var _TRN_InkAnnotCreateFromObj = (Module['_TRN_InkAnnotCreateFromObj'] = function () {
  return (_TRN_InkAnnotCreateFromObj = Module['_TRN_InkAnnotCreateFromObj'] = Module['asm']['oo']).apply(null, arguments);
});
var _TRN_InkAnnotCreateFromAnnot = (Module['_TRN_InkAnnotCreateFromAnnot'] = function () {
  return (_TRN_InkAnnotCreateFromAnnot = Module['_TRN_InkAnnotCreateFromAnnot'] = Module['asm']['po']).apply(null, arguments);
});
var _TRN_InkAnnotCreate = (Module['_TRN_InkAnnotCreate'] = function () {
  return (_TRN_InkAnnotCreate = Module['_TRN_InkAnnotCreate'] = Module['asm']['qo']).apply(null, arguments);
});
var _TRN_InkAnnotGetPathCount = (Module['_TRN_InkAnnotGetPathCount'] = function () {
  return (_TRN_InkAnnotGetPathCount = Module['_TRN_InkAnnotGetPathCount'] = Module['asm']['ro']).apply(null, arguments);
});
var _TRN_InkAnnotGetPointCount = (Module['_TRN_InkAnnotGetPointCount'] = function () {
  return (_TRN_InkAnnotGetPointCount = Module['_TRN_InkAnnotGetPointCount'] = Module['asm']['so']).apply(null, arguments);
});
var _TRN_InkAnnotGetPoint = (Module['_TRN_InkAnnotGetPoint'] = function () {
  return (_TRN_InkAnnotGetPoint = Module['_TRN_InkAnnotGetPoint'] = Module['asm']['to']).apply(null, arguments);
});
var _TRN_InkAnnotSetPoint = (Module['_TRN_InkAnnotSetPoint'] = function () {
  return (_TRN_InkAnnotSetPoint = Module['_TRN_InkAnnotSetPoint'] = Module['asm']['uo']).apply(null, arguments);
});
var _TRN_InkAnnotErase = (Module['_TRN_InkAnnotErase'] = function () {
  return (_TRN_InkAnnotErase = Module['_TRN_InkAnnotErase'] = Module['asm']['vo']).apply(null, arguments);
});
var _TRN_InkAnnotGetHighlightIntent = (Module['_TRN_InkAnnotGetHighlightIntent'] = function () {
  return (_TRN_InkAnnotGetHighlightIntent = Module['_TRN_InkAnnotGetHighlightIntent'] = Module['asm']['wo']).apply(null, arguments);
});
var _TRN_InkAnnotSetHighlightIntent = (Module['_TRN_InkAnnotSetHighlightIntent'] = function () {
  return (_TRN_InkAnnotSetHighlightIntent = Module['_TRN_InkAnnotSetHighlightIntent'] = Module['asm']['xo']).apply(null, arguments);
});
var _TRN_LinkAnnotCreateFromObj = (Module['_TRN_LinkAnnotCreateFromObj'] = function () {
  return (_TRN_LinkAnnotCreateFromObj = Module['_TRN_LinkAnnotCreateFromObj'] = Module['asm']['yo']).apply(null, arguments);
});
var _TRN_LinkAnnotCreateFromAnnot = (Module['_TRN_LinkAnnotCreateFromAnnot'] = function () {
  return (_TRN_LinkAnnotCreateFromAnnot = Module['_TRN_LinkAnnotCreateFromAnnot'] = Module['asm']['zo']).apply(null, arguments);
});
var _TRN_LinkAnnotCreate = (Module['_TRN_LinkAnnotCreate'] = function () {
  return (_TRN_LinkAnnotCreate = Module['_TRN_LinkAnnotCreate'] = Module['asm']['Ao']).apply(null, arguments);
});
var _TRN_LinkAnnotRemoveAction = (Module['_TRN_LinkAnnotRemoveAction'] = function () {
  return (_TRN_LinkAnnotRemoveAction = Module['_TRN_LinkAnnotRemoveAction'] = Module['asm']['Bo']).apply(null, arguments);
});
var _TRN_LinkAnnotGetAction = (Module['_TRN_LinkAnnotGetAction'] = function () {
  return (_TRN_LinkAnnotGetAction = Module['_TRN_LinkAnnotGetAction'] = Module['asm']['Co']).apply(null, arguments);
});
var _TRN_LinkAnnotSetAction = (Module['_TRN_LinkAnnotSetAction'] = function () {
  return (_TRN_LinkAnnotSetAction = Module['_TRN_LinkAnnotSetAction'] = Module['asm']['Do']).apply(null, arguments);
});
var _TRN_LinkAnnotGetHighlightingMode = (Module['_TRN_LinkAnnotGetHighlightingMode'] = function () {
  return (_TRN_LinkAnnotGetHighlightingMode = Module['_TRN_LinkAnnotGetHighlightingMode'] = Module['asm']['Eo']).apply(null, arguments);
});
var _TRN_LinkAnnotSetHighlightingMode = (Module['_TRN_LinkAnnotSetHighlightingMode'] = function () {
  return (_TRN_LinkAnnotSetHighlightingMode = Module['_TRN_LinkAnnotSetHighlightingMode'] = Module['asm']['Fo']).apply(null, arguments);
});
var _TRN_LinkAnnotGetQuadPointCount = (Module['_TRN_LinkAnnotGetQuadPointCount'] = function () {
  return (_TRN_LinkAnnotGetQuadPointCount = Module['_TRN_LinkAnnotGetQuadPointCount'] = Module['asm']['Go']).apply(null, arguments);
});
var _TRN_LinkAnnotGetQuadPoint = (Module['_TRN_LinkAnnotGetQuadPoint'] = function () {
  return (_TRN_LinkAnnotGetQuadPoint = Module['_TRN_LinkAnnotGetQuadPoint'] = Module['asm']['Ho']).apply(null, arguments);
});
var _TRN_LinkAnnotSetQuadPoint = (Module['_TRN_LinkAnnotSetQuadPoint'] = function () {
  return (_TRN_LinkAnnotSetQuadPoint = Module['_TRN_LinkAnnotSetQuadPoint'] = Module['asm']['Io']).apply(null, arguments);
});
var _TRN_GetNormalizedUrl = (Module['_TRN_GetNormalizedUrl'] = function () {
  return (_TRN_GetNormalizedUrl = Module['_TRN_GetNormalizedUrl'] = Module['asm']['Jo']).apply(null, arguments);
});
var _TRN_MarkupAnnotCreateFromObj = (Module['_TRN_MarkupAnnotCreateFromObj'] = function () {
  return (_TRN_MarkupAnnotCreateFromObj = Module['_TRN_MarkupAnnotCreateFromObj'] = Module['asm']['Ko']).apply(null, arguments);
});
var _TRN_MarkupAnnotCreateFromAnnot = (Module['_TRN_MarkupAnnotCreateFromAnnot'] = function () {
  return (_TRN_MarkupAnnotCreateFromAnnot = Module['_TRN_MarkupAnnotCreateFromAnnot'] = Module['asm']['Lo']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetTitle = (Module['_TRN_MarkupAnnotGetTitle'] = function () {
  return (_TRN_MarkupAnnotGetTitle = Module['_TRN_MarkupAnnotGetTitle'] = Module['asm']['Mo']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetTitle = (Module['_TRN_MarkupAnnotSetTitle'] = function () {
  return (_TRN_MarkupAnnotSetTitle = Module['_TRN_MarkupAnnotSetTitle'] = Module['asm']['No']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetTitleUString = (Module['_TRN_MarkupAnnotSetTitleUString'] = function () {
  return (_TRN_MarkupAnnotSetTitleUString = Module['_TRN_MarkupAnnotSetTitleUString'] = Module['asm']['Oo']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetPopup = (Module['_TRN_MarkupAnnotGetPopup'] = function () {
  return (_TRN_MarkupAnnotGetPopup = Module['_TRN_MarkupAnnotGetPopup'] = Module['asm']['Po']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetPopup = (Module['_TRN_MarkupAnnotSetPopup'] = function () {
  return (_TRN_MarkupAnnotSetPopup = Module['_TRN_MarkupAnnotSetPopup'] = Module['asm']['Qo']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetOpacity = (Module['_TRN_MarkupAnnotGetOpacity'] = function () {
  return (_TRN_MarkupAnnotGetOpacity = Module['_TRN_MarkupAnnotGetOpacity'] = Module['asm']['Ro']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetOpacity = (Module['_TRN_MarkupAnnotSetOpacity'] = function () {
  return (_TRN_MarkupAnnotSetOpacity = Module['_TRN_MarkupAnnotSetOpacity'] = Module['asm']['So']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetSubject = (Module['_TRN_MarkupAnnotGetSubject'] = function () {
  return (_TRN_MarkupAnnotGetSubject = Module['_TRN_MarkupAnnotGetSubject'] = Module['asm']['To']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetSubject = (Module['_TRN_MarkupAnnotSetSubject'] = function () {
  return (_TRN_MarkupAnnotSetSubject = Module['_TRN_MarkupAnnotSetSubject'] = Module['asm']['Uo']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetCreationDates = (Module['_TRN_MarkupAnnotGetCreationDates'] = function () {
  return (_TRN_MarkupAnnotGetCreationDates = Module['_TRN_MarkupAnnotGetCreationDates'] = Module['asm']['Vo']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetBorderEffect = (Module['_TRN_MarkupAnnotGetBorderEffect'] = function () {
  return (_TRN_MarkupAnnotGetBorderEffect = Module['_TRN_MarkupAnnotGetBorderEffect'] = Module['asm']['Wo']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetBorderEffect = (Module['_TRN_MarkupAnnotSetBorderEffect'] = function () {
  return (_TRN_MarkupAnnotSetBorderEffect = Module['_TRN_MarkupAnnotSetBorderEffect'] = Module['asm']['Xo']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetBorderEffectIntensity = (Module['_TRN_MarkupAnnotGetBorderEffectIntensity'] = function () {
  return (_TRN_MarkupAnnotGetBorderEffectIntensity = Module['_TRN_MarkupAnnotGetBorderEffectIntensity'] = Module['asm']['Yo']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetBorderEffectIntensity = (Module['_TRN_MarkupAnnotSetBorderEffectIntensity'] = function () {
  return (_TRN_MarkupAnnotSetBorderEffectIntensity = Module['_TRN_MarkupAnnotSetBorderEffectIntensity'] = Module['asm']['Zo']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetCreationDates = (Module['_TRN_MarkupAnnotSetCreationDates'] = function () {
  return (_TRN_MarkupAnnotSetCreationDates = Module['_TRN_MarkupAnnotSetCreationDates'] = Module['asm']['_o']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetInteriorColor = (Module['_TRN_MarkupAnnotGetInteriorColor'] = function () {
  return (_TRN_MarkupAnnotGetInteriorColor = Module['_TRN_MarkupAnnotGetInteriorColor'] = Module['asm']['$o']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetInteriorColorCompNum = (Module['_TRN_MarkupAnnotGetInteriorColorCompNum'] = function () {
  return (_TRN_MarkupAnnotGetInteriorColorCompNum = Module['_TRN_MarkupAnnotGetInteriorColorCompNum'] = Module['asm']['ap']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetInteriorColorRGB = (Module['_TRN_MarkupAnnotSetInteriorColorRGB'] = function () {
  return (_TRN_MarkupAnnotSetInteriorColorRGB = Module['_TRN_MarkupAnnotSetInteriorColorRGB'] = Module['asm']['bp']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetInteriorColor = (Module['_TRN_MarkupAnnotSetInteriorColor'] = function () {
  return (_TRN_MarkupAnnotSetInteriorColor = Module['_TRN_MarkupAnnotSetInteriorColor'] = Module['asm']['cp']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetContentRect = (Module['_TRN_MarkupAnnotGetContentRect'] = function () {
  return (_TRN_MarkupAnnotGetContentRect = Module['_TRN_MarkupAnnotGetContentRect'] = Module['asm']['dp']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetContentRect = (Module['_TRN_MarkupAnnotSetContentRect'] = function () {
  return (_TRN_MarkupAnnotSetContentRect = Module['_TRN_MarkupAnnotSetContentRect'] = Module['asm']['ep']).apply(null, arguments);
});
var _TRN_MarkupAnnotGetPadding = (Module['_TRN_MarkupAnnotGetPadding'] = function () {
  return (_TRN_MarkupAnnotGetPadding = Module['_TRN_MarkupAnnotGetPadding'] = Module['asm']['fp']).apply(null, arguments);
});
var _TRN_MarkupAnnotSetPadding = (Module['_TRN_MarkupAnnotSetPadding'] = function () {
  return (_TRN_MarkupAnnotSetPadding = Module['_TRN_MarkupAnnotSetPadding'] = Module['asm']['gp']).apply(null, arguments);
});
var _TRN_MarkupAnnotRotateAppearance = (Module['_TRN_MarkupAnnotRotateAppearance'] = function () {
  return (_TRN_MarkupAnnotRotateAppearance = Module['_TRN_MarkupAnnotRotateAppearance'] = Module['asm']['hp']).apply(null, arguments);
});
var _TRN_MovieAnnotCreateFromObj = (Module['_TRN_MovieAnnotCreateFromObj'] = function () {
  return (_TRN_MovieAnnotCreateFromObj = Module['_TRN_MovieAnnotCreateFromObj'] = Module['asm']['ip']).apply(null, arguments);
});
var _TRN_MovieAnnotCreateFromAnnot = (Module['_TRN_MovieAnnotCreateFromAnnot'] = function () {
  return (_TRN_MovieAnnotCreateFromAnnot = Module['_TRN_MovieAnnotCreateFromAnnot'] = Module['asm']['jp']).apply(null, arguments);
});
var _TRN_MovieAnnotCreate = (Module['_TRN_MovieAnnotCreate'] = function () {
  return (_TRN_MovieAnnotCreate = Module['_TRN_MovieAnnotCreate'] = Module['asm']['kp']).apply(null, arguments);
});
var _TRN_MovieAnnotGetTitle = (Module['_TRN_MovieAnnotGetTitle'] = function () {
  return (_TRN_MovieAnnotGetTitle = Module['_TRN_MovieAnnotGetTitle'] = Module['asm']['lp']).apply(null, arguments);
});
var _TRN_MovieAnnotSetTitle = (Module['_TRN_MovieAnnotSetTitle'] = function () {
  return (_TRN_MovieAnnotSetTitle = Module['_TRN_MovieAnnotSetTitle'] = Module['asm']['mp']).apply(null, arguments);
});
var _TRN_MovieAnnotIsToBePlayed = (Module['_TRN_MovieAnnotIsToBePlayed'] = function () {
  return (_TRN_MovieAnnotIsToBePlayed = Module['_TRN_MovieAnnotIsToBePlayed'] = Module['asm']['np']).apply(null, arguments);
});
var _TRN_MovieAnnotSetToBePlayed = (Module['_TRN_MovieAnnotSetToBePlayed'] = function () {
  return (_TRN_MovieAnnotSetToBePlayed = Module['_TRN_MovieAnnotSetToBePlayed'] = Module['asm']['op']).apply(null, arguments);
});
var _TRN_PolyLineAnnotCreateFromObj = (Module['_TRN_PolyLineAnnotCreateFromObj'] = function () {
  return (_TRN_PolyLineAnnotCreateFromObj = Module['_TRN_PolyLineAnnotCreateFromObj'] = Module['asm']['pp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotCreateFromAnnot = (Module['_TRN_PolyLineAnnotCreateFromAnnot'] = function () {
  return (_TRN_PolyLineAnnotCreateFromAnnot = Module['_TRN_PolyLineAnnotCreateFromAnnot'] = Module['asm']['qp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotCreate = (Module['_TRN_PolyLineAnnotCreate'] = function () {
  return (_TRN_PolyLineAnnotCreate = Module['_TRN_PolyLineAnnotCreate'] = Module['asm']['rp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotGetVertexCount = (Module['_TRN_PolyLineAnnotGetVertexCount'] = function () {
  return (_TRN_PolyLineAnnotGetVertexCount = Module['_TRN_PolyLineAnnotGetVertexCount'] = Module['asm']['sp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotGetVertex = (Module['_TRN_PolyLineAnnotGetVertex'] = function () {
  return (_TRN_PolyLineAnnotGetVertex = Module['_TRN_PolyLineAnnotGetVertex'] = Module['asm']['tp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotSetVertex = (Module['_TRN_PolyLineAnnotSetVertex'] = function () {
  return (_TRN_PolyLineAnnotSetVertex = Module['_TRN_PolyLineAnnotSetVertex'] = Module['asm']['up']).apply(null, arguments);
});
var _TRN_PolyLineAnnotGetStartStyle = (Module['_TRN_PolyLineAnnotGetStartStyle'] = function () {
  return (_TRN_PolyLineAnnotGetStartStyle = Module['_TRN_PolyLineAnnotGetStartStyle'] = Module['asm']['vp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotSetStartStyle = (Module['_TRN_PolyLineAnnotSetStartStyle'] = function () {
  return (_TRN_PolyLineAnnotSetStartStyle = Module['_TRN_PolyLineAnnotSetStartStyle'] = Module['asm']['wp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotGetEndStyle = (Module['_TRN_PolyLineAnnotGetEndStyle'] = function () {
  return (_TRN_PolyLineAnnotGetEndStyle = Module['_TRN_PolyLineAnnotGetEndStyle'] = Module['asm']['xp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotSetEndStyle = (Module['_TRN_PolyLineAnnotSetEndStyle'] = function () {
  return (_TRN_PolyLineAnnotSetEndStyle = Module['_TRN_PolyLineAnnotSetEndStyle'] = Module['asm']['yp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotGetIntentName = (Module['_TRN_PolyLineAnnotGetIntentName'] = function () {
  return (_TRN_PolyLineAnnotGetIntentName = Module['_TRN_PolyLineAnnotGetIntentName'] = Module['asm']['zp']).apply(null, arguments);
});
var _TRN_PolyLineAnnotSetIntentName = (Module['_TRN_PolyLineAnnotSetIntentName'] = function () {
  return (_TRN_PolyLineAnnotSetIntentName = Module['_TRN_PolyLineAnnotSetIntentName'] = Module['asm']['Ap']).apply(null, arguments);
});
var _TRN_PolygonAnnotCreateFromObj = (Module['_TRN_PolygonAnnotCreateFromObj'] = function () {
  return (_TRN_PolygonAnnotCreateFromObj = Module['_TRN_PolygonAnnotCreateFromObj'] = Module['asm']['Bp']).apply(null, arguments);
});
var _TRN_PolygonAnnotCreateFromAnnot = (Module['_TRN_PolygonAnnotCreateFromAnnot'] = function () {
  return (_TRN_PolygonAnnotCreateFromAnnot = Module['_TRN_PolygonAnnotCreateFromAnnot'] = Module['asm']['Cp']).apply(null, arguments);
});
var _TRN_PolygonAnnotCreate = (Module['_TRN_PolygonAnnotCreate'] = function () {
  return (_TRN_PolygonAnnotCreate = Module['_TRN_PolygonAnnotCreate'] = Module['asm']['Dp']).apply(null, arguments);
});
var _TRN_PopupAnnotCreateFromObj = (Module['_TRN_PopupAnnotCreateFromObj'] = function () {
  return (_TRN_PopupAnnotCreateFromObj = Module['_TRN_PopupAnnotCreateFromObj'] = Module['asm']['Ep']).apply(null, arguments);
});
var _TRN_PopupAnnotCreateFromAnnot = (Module['_TRN_PopupAnnotCreateFromAnnot'] = function () {
  return (_TRN_PopupAnnotCreateFromAnnot = Module['_TRN_PopupAnnotCreateFromAnnot'] = Module['asm']['Fp']).apply(null, arguments);
});
var _TRN_PopupAnnotCreate = (Module['_TRN_PopupAnnotCreate'] = function () {
  return (_TRN_PopupAnnotCreate = Module['_TRN_PopupAnnotCreate'] = Module['asm']['Gp']).apply(null, arguments);
});
var _TRN_PopupAnnotGetParent = (Module['_TRN_PopupAnnotGetParent'] = function () {
  return (_TRN_PopupAnnotGetParent = Module['_TRN_PopupAnnotGetParent'] = Module['asm']['Hp']).apply(null, arguments);
});
var _TRN_PopupAnnotSetParent = (Module['_TRN_PopupAnnotSetParent'] = function () {
  return (_TRN_PopupAnnotSetParent = Module['_TRN_PopupAnnotSetParent'] = Module['asm']['Ip']).apply(null, arguments);
});
var _TRN_PopupAnnotIsOpen = (Module['_TRN_PopupAnnotIsOpen'] = function () {
  return (_TRN_PopupAnnotIsOpen = Module['_TRN_PopupAnnotIsOpen'] = Module['asm']['Jp']).apply(null, arguments);
});
var _TRN_PopupAnnotSetOpen = (Module['_TRN_PopupAnnotSetOpen'] = function () {
  return (_TRN_PopupAnnotSetOpen = Module['_TRN_PopupAnnotSetOpen'] = Module['asm']['Kp']).apply(null, arguments);
});
var _TRN_RedactionAnnotCreateFromObj = (Module['_TRN_RedactionAnnotCreateFromObj'] = function () {
  return (_TRN_RedactionAnnotCreateFromObj = Module['_TRN_RedactionAnnotCreateFromObj'] = Module['asm']['Lp']).apply(null, arguments);
});
var _TRN_RedactionAnnotCreateFromAnnot = (Module['_TRN_RedactionAnnotCreateFromAnnot'] = function () {
  return (_TRN_RedactionAnnotCreateFromAnnot = Module['_TRN_RedactionAnnotCreateFromAnnot'] = Module['asm']['Mp']).apply(null, arguments);
});
var _TRN_RedactionAnnotCreate = (Module['_TRN_RedactionAnnotCreate'] = function () {
  return (_TRN_RedactionAnnotCreate = Module['_TRN_RedactionAnnotCreate'] = Module['asm']['Np']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetQuadPointCount = (Module['_TRN_RedactionAnnotGetQuadPointCount'] = function () {
  return (_TRN_RedactionAnnotGetQuadPointCount = Module['_TRN_RedactionAnnotGetQuadPointCount'] = Module['asm']['Op']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetQuadPoint = (Module['_TRN_RedactionAnnotGetQuadPoint'] = function () {
  return (_TRN_RedactionAnnotGetQuadPoint = Module['_TRN_RedactionAnnotGetQuadPoint'] = Module['asm']['Pp']).apply(null, arguments);
});
var _TRN_RedactionAnnotSetQuadPoint = (Module['_TRN_RedactionAnnotSetQuadPoint'] = function () {
  return (_TRN_RedactionAnnotSetQuadPoint = Module['_TRN_RedactionAnnotSetQuadPoint'] = Module['asm']['Qp']).apply(null, arguments);
});
var _TRN_RedactionAnnotSetAppFormXO = (Module['_TRN_RedactionAnnotSetAppFormXO'] = function () {
  return (_TRN_RedactionAnnotSetAppFormXO = Module['_TRN_RedactionAnnotSetAppFormXO'] = Module['asm']['Rp']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetOverlayText = (Module['_TRN_RedactionAnnotGetOverlayText'] = function () {
  return (_TRN_RedactionAnnotGetOverlayText = Module['_TRN_RedactionAnnotGetOverlayText'] = Module['asm']['Sp']).apply(null, arguments);
});
var _TRN_RedactionAnnotSetOverlayText = (Module['_TRN_RedactionAnnotSetOverlayText'] = function () {
  return (_TRN_RedactionAnnotSetOverlayText = Module['_TRN_RedactionAnnotSetOverlayText'] = Module['asm']['Tp']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetUseRepeat = (Module['_TRN_RedactionAnnotGetUseRepeat'] = function () {
  return (_TRN_RedactionAnnotGetUseRepeat = Module['_TRN_RedactionAnnotGetUseRepeat'] = Module['asm']['Up']).apply(null, arguments);
});
var _TRN_RedactionAnnotSetUseRepeat = (Module['_TRN_RedactionAnnotSetUseRepeat'] = function () {
  return (_TRN_RedactionAnnotSetUseRepeat = Module['_TRN_RedactionAnnotSetUseRepeat'] = Module['asm']['Vp']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetOverlayTextAppearance = (Module['_TRN_RedactionAnnotGetOverlayTextAppearance'] = function () {
  return (_TRN_RedactionAnnotGetOverlayTextAppearance = Module['_TRN_RedactionAnnotGetOverlayTextAppearance'] = Module['asm']['Wp']).apply(null, arguments);
});
var _TRN_RedactionAnnotSetOverlayTextAppearance = (Module['_TRN_RedactionAnnotSetOverlayTextAppearance'] = function () {
  return (_TRN_RedactionAnnotSetOverlayTextAppearance = Module['_TRN_RedactionAnnotSetOverlayTextAppearance'] = Module['asm']['Xp']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetQuadForm = (Module['_TRN_RedactionAnnotGetQuadForm'] = function () {
  return (_TRN_RedactionAnnotGetQuadForm = Module['_TRN_RedactionAnnotGetQuadForm'] = Module['asm']['Yp']).apply(null, arguments);
});
var _TRN_RedactionAnnotSetQuadForm = (Module['_TRN_RedactionAnnotSetQuadForm'] = function () {
  return (_TRN_RedactionAnnotSetQuadForm = Module['_TRN_RedactionAnnotSetQuadForm'] = Module['asm']['Zp']).apply(null, arguments);
});
var _TRN_RedactionAnnotGetAppFormXO = (Module['_TRN_RedactionAnnotGetAppFormXO'] = function () {
  return (_TRN_RedactionAnnotGetAppFormXO = Module['_TRN_RedactionAnnotGetAppFormXO'] = Module['asm']['_p']).apply(null, arguments);
});
var _TRN_RubberStampAnnotCreateFromObj = (Module['_TRN_RubberStampAnnotCreateFromObj'] = function () {
  return (_TRN_RubberStampAnnotCreateFromObj = Module['_TRN_RubberStampAnnotCreateFromObj'] = Module['asm']['$p']).apply(null, arguments);
});
var _TRN_RubberStampAnnotCreateFromAnnot = (Module['_TRN_RubberStampAnnotCreateFromAnnot'] = function () {
  return (_TRN_RubberStampAnnotCreateFromAnnot = Module['_TRN_RubberStampAnnotCreateFromAnnot'] = Module['asm']['aq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotCreate = (Module['_TRN_RubberStampAnnotCreate'] = function () {
  return (_TRN_RubberStampAnnotCreate = Module['_TRN_RubberStampAnnotCreate'] = Module['asm']['bq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotCreateCustom = (Module['_TRN_RubberStampAnnotCreateCustom'] = function () {
  return (_TRN_RubberStampAnnotCreateCustom = Module['_TRN_RubberStampAnnotCreateCustom'] = Module['asm']['cq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotGetIcon = (Module['_TRN_RubberStampAnnotGetIcon'] = function () {
  return (_TRN_RubberStampAnnotGetIcon = Module['_TRN_RubberStampAnnotGetIcon'] = Module['asm']['dq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotSetIcon = (Module['_TRN_RubberStampAnnotSetIcon'] = function () {
  return (_TRN_RubberStampAnnotSetIcon = Module['_TRN_RubberStampAnnotSetIcon'] = Module['asm']['eq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotSetIconDefault = (Module['_TRN_RubberStampAnnotSetIconDefault'] = function () {
  return (_TRN_RubberStampAnnotSetIconDefault = Module['_TRN_RubberStampAnnotSetIconDefault'] = Module['asm']['fq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotGetIconName = (Module['_TRN_RubberStampAnnotGetIconName'] = function () {
  return (_TRN_RubberStampAnnotGetIconName = Module['_TRN_RubberStampAnnotGetIconName'] = Module['asm']['gq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotSetIconName = (Module['_TRN_RubberStampAnnotSetIconName'] = function () {
  return (_TRN_RubberStampAnnotSetIconName = Module['_TRN_RubberStampAnnotSetIconName'] = Module['asm']['hq']).apply(null, arguments);
});
var _TRN_RubberStampAnnotSetOpacity = (Module['_TRN_RubberStampAnnotSetOpacity'] = function () {
  return (_TRN_RubberStampAnnotSetOpacity = Module['_TRN_RubberStampAnnotSetOpacity'] = Module['asm']['iq']).apply(null, arguments);
});
var _TRN_ScreenAnnotCreateFromObj = (Module['_TRN_ScreenAnnotCreateFromObj'] = function () {
  return (_TRN_ScreenAnnotCreateFromObj = Module['_TRN_ScreenAnnotCreateFromObj'] = Module['asm']['jq']).apply(null, arguments);
});
var _TRN_ScreenAnnotCreateFromAnnot = (Module['_TRN_ScreenAnnotCreateFromAnnot'] = function () {
  return (_TRN_ScreenAnnotCreateFromAnnot = Module['_TRN_ScreenAnnotCreateFromAnnot'] = Module['asm']['kq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetTitle = (Module['_TRN_ScreenAnnotGetTitle'] = function () {
  return (_TRN_ScreenAnnotGetTitle = Module['_TRN_ScreenAnnotGetTitle'] = Module['asm']['lq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetTitle = (Module['_TRN_ScreenAnnotSetTitle'] = function () {
  return (_TRN_ScreenAnnotSetTitle = Module['_TRN_ScreenAnnotSetTitle'] = Module['asm']['mq']).apply(null, arguments);
});
var _TRN_ScreenAnnotCreate = (Module['_TRN_ScreenAnnotCreate'] = function () {
  return (_TRN_ScreenAnnotCreate = Module['_TRN_ScreenAnnotCreate'] = Module['asm']['nq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetAction = (Module['_TRN_ScreenAnnotGetAction'] = function () {
  return (_TRN_ScreenAnnotGetAction = Module['_TRN_ScreenAnnotGetAction'] = Module['asm']['oq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetAction = (Module['_TRN_ScreenAnnotSetAction'] = function () {
  return (_TRN_ScreenAnnotSetAction = Module['_TRN_ScreenAnnotSetAction'] = Module['asm']['pq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetBorderColor = (Module['_TRN_ScreenAnnotGetBorderColor'] = function () {
  return (_TRN_ScreenAnnotGetBorderColor = Module['_TRN_ScreenAnnotGetBorderColor'] = Module['asm']['qq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetBorderColor = (Module['_TRN_ScreenAnnotSetBorderColor'] = function () {
  return (_TRN_ScreenAnnotSetBorderColor = Module['_TRN_ScreenAnnotSetBorderColor'] = Module['asm']['rq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetBorderColorCompNum = (Module['_TRN_ScreenAnnotGetBorderColorCompNum'] = function () {
  return (_TRN_ScreenAnnotGetBorderColorCompNum = Module['_TRN_ScreenAnnotGetBorderColorCompNum'] = Module['asm']['sq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetBackgroundColorCompNum = (Module['_TRN_ScreenAnnotGetBackgroundColorCompNum'] = function () {
  return (_TRN_ScreenAnnotGetBackgroundColorCompNum = Module['_TRN_ScreenAnnotGetBackgroundColorCompNum'] = Module['asm']['tq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetBackgroundColor = (Module['_TRN_ScreenAnnotGetBackgroundColor'] = function () {
  return (_TRN_ScreenAnnotGetBackgroundColor = Module['_TRN_ScreenAnnotGetBackgroundColor'] = Module['asm']['uq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetBackgroundColor = (Module['_TRN_ScreenAnnotSetBackgroundColor'] = function () {
  return (_TRN_ScreenAnnotSetBackgroundColor = Module['_TRN_ScreenAnnotSetBackgroundColor'] = Module['asm']['vq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetStaticCaptionText = (Module['_TRN_ScreenAnnotGetStaticCaptionText'] = function () {
  return (_TRN_ScreenAnnotGetStaticCaptionText = Module['_TRN_ScreenAnnotGetStaticCaptionText'] = Module['asm']['wq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetStaticCaptionText = (Module['_TRN_ScreenAnnotSetStaticCaptionText'] = function () {
  return (_TRN_ScreenAnnotSetStaticCaptionText = Module['_TRN_ScreenAnnotSetStaticCaptionText'] = Module['asm']['xq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetRolloverCaptionText = (Module['_TRN_ScreenAnnotGetRolloverCaptionText'] = function () {
  return (_TRN_ScreenAnnotGetRolloverCaptionText = Module['_TRN_ScreenAnnotGetRolloverCaptionText'] = Module['asm']['yq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetRolloverCaptionText = (Module['_TRN_ScreenAnnotSetRolloverCaptionText'] = function () {
  return (_TRN_ScreenAnnotSetRolloverCaptionText = Module['_TRN_ScreenAnnotSetRolloverCaptionText'] = Module['asm']['zq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetMouseDownCaptionText = (Module['_TRN_ScreenAnnotGetMouseDownCaptionText'] = function () {
  return (_TRN_ScreenAnnotGetMouseDownCaptionText = Module['_TRN_ScreenAnnotGetMouseDownCaptionText'] = Module['asm']['Aq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetMouseDownCaptionText = (Module['_TRN_ScreenAnnotSetMouseDownCaptionText'] = function () {
  return (_TRN_ScreenAnnotSetMouseDownCaptionText = Module['_TRN_ScreenAnnotSetMouseDownCaptionText'] = Module['asm']['Bq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetStaticIcon = (Module['_TRN_ScreenAnnotGetStaticIcon'] = function () {
  return (_TRN_ScreenAnnotGetStaticIcon = Module['_TRN_ScreenAnnotGetStaticIcon'] = Module['asm']['Cq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetStaticIcon = (Module['_TRN_ScreenAnnotSetStaticIcon'] = function () {
  return (_TRN_ScreenAnnotSetStaticIcon = Module['_TRN_ScreenAnnotSetStaticIcon'] = Module['asm']['Dq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetRolloverIcon = (Module['_TRN_ScreenAnnotGetRolloverIcon'] = function () {
  return (_TRN_ScreenAnnotGetRolloverIcon = Module['_TRN_ScreenAnnotGetRolloverIcon'] = Module['asm']['Eq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetRolloverIcon = (Module['_TRN_ScreenAnnotSetRolloverIcon'] = function () {
  return (_TRN_ScreenAnnotSetRolloverIcon = Module['_TRN_ScreenAnnotSetRolloverIcon'] = Module['asm']['Fq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetMouseDownIcon = (Module['_TRN_ScreenAnnotGetMouseDownIcon'] = function () {
  return (_TRN_ScreenAnnotGetMouseDownIcon = Module['_TRN_ScreenAnnotGetMouseDownIcon'] = Module['asm']['Gq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetMouseDownIcon = (Module['_TRN_ScreenAnnotSetMouseDownIcon'] = function () {
  return (_TRN_ScreenAnnotSetMouseDownIcon = Module['_TRN_ScreenAnnotSetMouseDownIcon'] = Module['asm']['Hq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetScaleType = (Module['_TRN_ScreenAnnotGetScaleType'] = function () {
  return (_TRN_ScreenAnnotGetScaleType = Module['_TRN_ScreenAnnotGetScaleType'] = Module['asm']['Iq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetScaleType = (Module['_TRN_ScreenAnnotSetScaleType'] = function () {
  return (_TRN_ScreenAnnotSetScaleType = Module['_TRN_ScreenAnnotSetScaleType'] = Module['asm']['Jq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetIconCaptionRelation = (Module['_TRN_ScreenAnnotGetIconCaptionRelation'] = function () {
  return (_TRN_ScreenAnnotGetIconCaptionRelation = Module['_TRN_ScreenAnnotGetIconCaptionRelation'] = Module['asm']['Kq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetIconCaptionRelation = (Module['_TRN_ScreenAnnotSetIconCaptionRelation'] = function () {
  return (_TRN_ScreenAnnotSetIconCaptionRelation = Module['_TRN_ScreenAnnotSetIconCaptionRelation'] = Module['asm']['Lq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetScaleCondition = (Module['_TRN_ScreenAnnotGetScaleCondition'] = function () {
  return (_TRN_ScreenAnnotGetScaleCondition = Module['_TRN_ScreenAnnotGetScaleCondition'] = Module['asm']['Mq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetScaleCondition = (Module['_TRN_ScreenAnnotSetScaleCondition'] = function () {
  return (_TRN_ScreenAnnotSetScaleCondition = Module['_TRN_ScreenAnnotSetScaleCondition'] = Module['asm']['Nq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetFitFull = (Module['_TRN_ScreenAnnotGetFitFull'] = function () {
  return (_TRN_ScreenAnnotGetFitFull = Module['_TRN_ScreenAnnotGetFitFull'] = Module['asm']['Oq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetFitFull = (Module['_TRN_ScreenAnnotSetFitFull'] = function () {
  return (_TRN_ScreenAnnotSetFitFull = Module['_TRN_ScreenAnnotSetFitFull'] = Module['asm']['Pq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetHIconLeftOver = (Module['_TRN_ScreenAnnotGetHIconLeftOver'] = function () {
  return (_TRN_ScreenAnnotGetHIconLeftOver = Module['_TRN_ScreenAnnotGetHIconLeftOver'] = Module['asm']['Qq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetHIconLeftOver = (Module['_TRN_ScreenAnnotSetHIconLeftOver'] = function () {
  return (_TRN_ScreenAnnotSetHIconLeftOver = Module['_TRN_ScreenAnnotSetHIconLeftOver'] = Module['asm']['Rq']).apply(null, arguments);
});
var _TRN_ScreenAnnotGetVIconLeftOver = (Module['_TRN_ScreenAnnotGetVIconLeftOver'] = function () {
  return (_TRN_ScreenAnnotGetVIconLeftOver = Module['_TRN_ScreenAnnotGetVIconLeftOver'] = Module['asm']['Sq']).apply(null, arguments);
});
var _TRN_ScreenAnnotSetVIconLeftOver = (Module['_TRN_ScreenAnnotSetVIconLeftOver'] = function () {
  return (_TRN_ScreenAnnotSetVIconLeftOver = Module['_TRN_ScreenAnnotSetVIconLeftOver'] = Module['asm']['Tq']).apply(null, arguments);
});
var _TRN_SoundAnnotCreateFromObj = (Module['_TRN_SoundAnnotCreateFromObj'] = function () {
  return (_TRN_SoundAnnotCreateFromObj = Module['_TRN_SoundAnnotCreateFromObj'] = Module['asm']['Uq']).apply(null, arguments);
});
var _TRN_SoundAnnotCreateFromAnnot = (Module['_TRN_SoundAnnotCreateFromAnnot'] = function () {
  return (_TRN_SoundAnnotCreateFromAnnot = Module['_TRN_SoundAnnotCreateFromAnnot'] = Module['asm']['Vq']).apply(null, arguments);
});
var _TRN_SoundAnnotCreate = (Module['_TRN_SoundAnnotCreate'] = function () {
  return (_TRN_SoundAnnotCreate = Module['_TRN_SoundAnnotCreate'] = Module['asm']['Wq']).apply(null, arguments);
});
var _TRN_SoundAnnotCreateWithData = (Module['_TRN_SoundAnnotCreateWithData'] = function () {
  return (_TRN_SoundAnnotCreateWithData = Module['_TRN_SoundAnnotCreateWithData'] = Module['asm']['Xq']).apply(null, arguments);
});
var _TRN_SoundAnnotCreateAtPoint = (Module['_TRN_SoundAnnotCreateAtPoint'] = function () {
  return (_TRN_SoundAnnotCreateAtPoint = Module['_TRN_SoundAnnotCreateAtPoint'] = Module['asm']['Yq']).apply(null, arguments);
});
var _TRN_SoundAnnotGetSoundStream = (Module['_TRN_SoundAnnotGetSoundStream'] = function () {
  return (_TRN_SoundAnnotGetSoundStream = Module['_TRN_SoundAnnotGetSoundStream'] = Module['asm']['Zq']).apply(null, arguments);
});
var _TRN_SoundAnnotSetSoundStream = (Module['_TRN_SoundAnnotSetSoundStream'] = function () {
  return (_TRN_SoundAnnotSetSoundStream = Module['_TRN_SoundAnnotSetSoundStream'] = Module['asm']['_q']).apply(null, arguments);
});
var _TRN_SoundAnnotGetIcon = (Module['_TRN_SoundAnnotGetIcon'] = function () {
  return (_TRN_SoundAnnotGetIcon = Module['_TRN_SoundAnnotGetIcon'] = Module['asm']['$q']).apply(null, arguments);
});
var _TRN_SoundAnnotSetIcon = (Module['_TRN_SoundAnnotSetIcon'] = function () {
  return (_TRN_SoundAnnotSetIcon = Module['_TRN_SoundAnnotSetIcon'] = Module['asm']['ar']).apply(null, arguments);
});
var _TRN_SoundAnnotGetIconName = (Module['_TRN_SoundAnnotGetIconName'] = function () {
  return (_TRN_SoundAnnotGetIconName = Module['_TRN_SoundAnnotGetIconName'] = Module['asm']['br']).apply(null, arguments);
});
var _TRN_SoundAnnotSetIconName = (Module['_TRN_SoundAnnotSetIconName'] = function () {
  return (_TRN_SoundAnnotSetIconName = Module['_TRN_SoundAnnotSetIconName'] = Module['asm']['cr']).apply(null, arguments);
});
var _TRN_SquareAnnotCreateFromObj = (Module['_TRN_SquareAnnotCreateFromObj'] = function () {
  return (_TRN_SquareAnnotCreateFromObj = Module['_TRN_SquareAnnotCreateFromObj'] = Module['asm']['dr']).apply(null, arguments);
});
var _TRN_SquareAnnotCreateFromAnnot = (Module['_TRN_SquareAnnotCreateFromAnnot'] = function () {
  return (_TRN_SquareAnnotCreateFromAnnot = Module['_TRN_SquareAnnotCreateFromAnnot'] = Module['asm']['er']).apply(null, arguments);
});
var _TRN_SquareAnnotCreate = (Module['_TRN_SquareAnnotCreate'] = function () {
  return (_TRN_SquareAnnotCreate = Module['_TRN_SquareAnnotCreate'] = Module['asm']['fr']).apply(null, arguments);
});
var _TRN_SquareAnnotGetInteriorColor = (Module['_TRN_SquareAnnotGetInteriorColor'] = function () {
  return (_TRN_SquareAnnotGetInteriorColor = Module['_TRN_SquareAnnotGetInteriorColor'] = Module['asm']['gr']).apply(null, arguments);
});
var _TRN_SquareAnnotGetInteriorColorCompNum = (Module['_TRN_SquareAnnotGetInteriorColorCompNum'] = function () {
  return (_TRN_SquareAnnotGetInteriorColorCompNum = Module['_TRN_SquareAnnotGetInteriorColorCompNum'] = Module['asm']['hr']).apply(null, arguments);
});
var _TRN_SquareAnnotSetInteriorColorDefault = (Module['_TRN_SquareAnnotSetInteriorColorDefault'] = function () {
  return (_TRN_SquareAnnotSetInteriorColorDefault = Module['_TRN_SquareAnnotSetInteriorColorDefault'] = Module['asm']['ir']).apply(null, arguments);
});
var _TRN_SquareAnnotSetInteriorColor = (Module['_TRN_SquareAnnotSetInteriorColor'] = function () {
  return (_TRN_SquareAnnotSetInteriorColor = Module['_TRN_SquareAnnotSetInteriorColor'] = Module['asm']['jr']).apply(null, arguments);
});
var _TRN_SquareAnnotGetContentRect = (Module['_TRN_SquareAnnotGetContentRect'] = function () {
  return (_TRN_SquareAnnotGetContentRect = Module['_TRN_SquareAnnotGetContentRect'] = Module['asm']['kr']).apply(null, arguments);
});
var _TRN_SquareAnnotSetContentRect = (Module['_TRN_SquareAnnotSetContentRect'] = function () {
  return (_TRN_SquareAnnotSetContentRect = Module['_TRN_SquareAnnotSetContentRect'] = Module['asm']['lr']).apply(null, arguments);
});
var _TRN_SquareAnnotGetPadding = (Module['_TRN_SquareAnnotGetPadding'] = function () {
  return (_TRN_SquareAnnotGetPadding = Module['_TRN_SquareAnnotGetPadding'] = Module['asm']['mr']).apply(null, arguments);
});
var _TRN_SquareAnnotSetPadding = (Module['_TRN_SquareAnnotSetPadding'] = function () {
  return (_TRN_SquareAnnotSetPadding = Module['_TRN_SquareAnnotSetPadding'] = Module['asm']['nr']).apply(null, arguments);
});
var _TRN_SquigglyAnnotCreateFromObj = (Module['_TRN_SquigglyAnnotCreateFromObj'] = function () {
  return (_TRN_SquigglyAnnotCreateFromObj = Module['_TRN_SquigglyAnnotCreateFromObj'] = Module['asm']['or']).apply(null, arguments);
});
var _TRN_SquigglyAnnotCreateFromAnnot = (Module['_TRN_SquigglyAnnotCreateFromAnnot'] = function () {
  return (_TRN_SquigglyAnnotCreateFromAnnot = Module['_TRN_SquigglyAnnotCreateFromAnnot'] = Module['asm']['pr']).apply(null, arguments);
});
var _TRN_SquigglyAnnotCreate = (Module['_TRN_SquigglyAnnotCreate'] = function () {
  return (_TRN_SquigglyAnnotCreate = Module['_TRN_SquigglyAnnotCreate'] = Module['asm']['qr']).apply(null, arguments);
});
var _TRN_StrikeOutAnnotCreateFromObj = (Module['_TRN_StrikeOutAnnotCreateFromObj'] = function () {
  return (_TRN_StrikeOutAnnotCreateFromObj = Module['_TRN_StrikeOutAnnotCreateFromObj'] = Module['asm']['rr']).apply(null, arguments);
});
var _TRN_StrikeOutAnnotCreateFromAnnot = (Module['_TRN_StrikeOutAnnotCreateFromAnnot'] = function () {
  return (_TRN_StrikeOutAnnotCreateFromAnnot = Module['_TRN_StrikeOutAnnotCreateFromAnnot'] = Module['asm']['sr']).apply(null, arguments);
});
var _TRN_StrikeOutAnnotCreate = (Module['_TRN_StrikeOutAnnotCreate'] = function () {
  return (_TRN_StrikeOutAnnotCreate = Module['_TRN_StrikeOutAnnotCreate'] = Module['asm']['tr']).apply(null, arguments);
});
var _TRN_TextAnnotCreateFromObj = (Module['_TRN_TextAnnotCreateFromObj'] = function () {
  return (_TRN_TextAnnotCreateFromObj = Module['_TRN_TextAnnotCreateFromObj'] = Module['asm']['ur']).apply(null, arguments);
});
var _TRN_TextAnnotCreateFromAnnot = (Module['_TRN_TextAnnotCreateFromAnnot'] = function () {
  return (_TRN_TextAnnotCreateFromAnnot = Module['_TRN_TextAnnotCreateFromAnnot'] = Module['asm']['vr']).apply(null, arguments);
});
var _TRN_TextAnnotCreateAtPoint = (Module['_TRN_TextAnnotCreateAtPoint'] = function () {
  return (_TRN_TextAnnotCreateAtPoint = Module['_TRN_TextAnnotCreateAtPoint'] = Module['asm']['wr']).apply(null, arguments);
});
var _TRN_TextAnnotCreate = (Module['_TRN_TextAnnotCreate'] = function () {
  return (_TRN_TextAnnotCreate = Module['_TRN_TextAnnotCreate'] = Module['asm']['xr']).apply(null, arguments);
});
var _TRN_TextAnnotIsOpen = (Module['_TRN_TextAnnotIsOpen'] = function () {
  return (_TRN_TextAnnotIsOpen = Module['_TRN_TextAnnotIsOpen'] = Module['asm']['yr']).apply(null, arguments);
});
var _TRN_TextAnnotSetOpen = (Module['_TRN_TextAnnotSetOpen'] = function () {
  return (_TRN_TextAnnotSetOpen = Module['_TRN_TextAnnotSetOpen'] = Module['asm']['zr']).apply(null, arguments);
});
var _TRN_TextAnnotGetIcon = (Module['_TRN_TextAnnotGetIcon'] = function () {
  return (_TRN_TextAnnotGetIcon = Module['_TRN_TextAnnotGetIcon'] = Module['asm']['Ar']).apply(null, arguments);
});
var _TRN_TextAnnotSetIcon = (Module['_TRN_TextAnnotSetIcon'] = function () {
  return (_TRN_TextAnnotSetIcon = Module['_TRN_TextAnnotSetIcon'] = Module['asm']['Br']).apply(null, arguments);
});
var _TRN_TextAnnotSetIconDefault = (Module['_TRN_TextAnnotSetIconDefault'] = function () {
  return (_TRN_TextAnnotSetIconDefault = Module['_TRN_TextAnnotSetIconDefault'] = Module['asm']['Cr']).apply(null, arguments);
});
var _TRN_TextAnnotGetIconName = (Module['_TRN_TextAnnotGetIconName'] = function () {
  return (_TRN_TextAnnotGetIconName = Module['_TRN_TextAnnotGetIconName'] = Module['asm']['Dr']).apply(null, arguments);
});
var _TRN_TextAnnotSetIconName = (Module['_TRN_TextAnnotSetIconName'] = function () {
  return (_TRN_TextAnnotSetIconName = Module['_TRN_TextAnnotSetIconName'] = Module['asm']['Er']).apply(null, arguments);
});
var _TRN_TextAnnotGetState = (Module['_TRN_TextAnnotGetState'] = function () {
  return (_TRN_TextAnnotGetState = Module['_TRN_TextAnnotGetState'] = Module['asm']['Fr']).apply(null, arguments);
});
var _TRN_TextAnnotSetState = (Module['_TRN_TextAnnotSetState'] = function () {
  return (_TRN_TextAnnotSetState = Module['_TRN_TextAnnotSetState'] = Module['asm']['Gr']).apply(null, arguments);
});
var _TRN_TextAnnotGetStateModel = (Module['_TRN_TextAnnotGetStateModel'] = function () {
  return (_TRN_TextAnnotGetStateModel = Module['_TRN_TextAnnotGetStateModel'] = Module['asm']['Hr']).apply(null, arguments);
});
var _TRN_TextAnnotSetStateModel = (Module['_TRN_TextAnnotSetStateModel'] = function () {
  return (_TRN_TextAnnotSetStateModel = Module['_TRN_TextAnnotSetStateModel'] = Module['asm']['Ir']).apply(null, arguments);
});
var _TRN_TextAnnotGetAnchorPosition = (Module['_TRN_TextAnnotGetAnchorPosition'] = function () {
  return (_TRN_TextAnnotGetAnchorPosition = Module['_TRN_TextAnnotGetAnchorPosition'] = Module['asm']['Jr']).apply(null, arguments);
});
var _TRN_TextAnnotSetAnchorPosition = (Module['_TRN_TextAnnotSetAnchorPosition'] = function () {
  return (_TRN_TextAnnotSetAnchorPosition = Module['_TRN_TextAnnotSetAnchorPosition'] = Module['asm']['Kr']).apply(null, arguments);
});
var _TRN_UnderlineAnnotCreateFromObj = (Module['_TRN_UnderlineAnnotCreateFromObj'] = function () {
  return (_TRN_UnderlineAnnotCreateFromObj = Module['_TRN_UnderlineAnnotCreateFromObj'] = Module['asm']['Lr']).apply(null, arguments);
});
var _TRN_UnderlineAnnotCreateFromAnnot = (Module['_TRN_UnderlineAnnotCreateFromAnnot'] = function () {
  return (_TRN_UnderlineAnnotCreateFromAnnot = Module['_TRN_UnderlineAnnotCreateFromAnnot'] = Module['asm']['Mr']).apply(null, arguments);
});
var _TRN_UnderlineAnnotCreate = (Module['_TRN_UnderlineAnnotCreate'] = function () {
  return (_TRN_UnderlineAnnotCreate = Module['_TRN_UnderlineAnnotCreate'] = Module['asm']['Nr']).apply(null, arguments);
});
var _TRN_WatermarkAnnotCreateFromObj = (Module['_TRN_WatermarkAnnotCreateFromObj'] = function () {
  return (_TRN_WatermarkAnnotCreateFromObj = Module['_TRN_WatermarkAnnotCreateFromObj'] = Module['asm']['Or']).apply(null, arguments);
});
var _TRN_WatermarkAnnotCreateFromAnnot = (Module['_TRN_WatermarkAnnotCreateFromAnnot'] = function () {
  return (_TRN_WatermarkAnnotCreateFromAnnot = Module['_TRN_WatermarkAnnotCreateFromAnnot'] = Module['asm']['Pr']).apply(null, arguments);
});
var _TRN_WatermarkAnnotCreate = (Module['_TRN_WatermarkAnnotCreate'] = function () {
  return (_TRN_WatermarkAnnotCreate = Module['_TRN_WatermarkAnnotCreate'] = Module['asm']['Qr']).apply(null, arguments);
});
var _TRN_TextMarkupAnnotCreateFromObj = (Module['_TRN_TextMarkupAnnotCreateFromObj'] = function () {
  return (_TRN_TextMarkupAnnotCreateFromObj = Module['_TRN_TextMarkupAnnotCreateFromObj'] = Module['asm']['Rr']).apply(null, arguments);
});
var _TRN_TextMarkupAnnotCreateFromAnnot = (Module['_TRN_TextMarkupAnnotCreateFromAnnot'] = function () {
  return (_TRN_TextMarkupAnnotCreateFromAnnot = Module['_TRN_TextMarkupAnnotCreateFromAnnot'] = Module['asm']['Sr']).apply(null, arguments);
});
var _TRN_TextMarkupAnnotGetQuadPointCount = (Module['_TRN_TextMarkupAnnotGetQuadPointCount'] = function () {
  return (_TRN_TextMarkupAnnotGetQuadPointCount = Module['_TRN_TextMarkupAnnotGetQuadPointCount'] = Module['asm']['Tr']).apply(null, arguments);
});
var _TRN_TextMarkupAnnotGetQuadPoint = (Module['_TRN_TextMarkupAnnotGetQuadPoint'] = function () {
  return (_TRN_TextMarkupAnnotGetQuadPoint = Module['_TRN_TextMarkupAnnotGetQuadPoint'] = Module['asm']['Ur']).apply(null, arguments);
});
var _TRN_TextMarkupAnnotSetQuadPoint = (Module['_TRN_TextMarkupAnnotSetQuadPoint'] = function () {
  return (_TRN_TextMarkupAnnotSetQuadPoint = Module['_TRN_TextMarkupAnnotSetQuadPoint'] = Module['asm']['Vr']).apply(null, arguments);
});
var _TRN_WidgetAnnotCreate = (Module['_TRN_WidgetAnnotCreate'] = function () {
  return (_TRN_WidgetAnnotCreate = Module['_TRN_WidgetAnnotCreate'] = Module['asm']['Wr']).apply(null, arguments);
});
var _TRN_WidgetAnnotCreateFromObj = (Module['_TRN_WidgetAnnotCreateFromObj'] = function () {
  return (_TRN_WidgetAnnotCreateFromObj = Module['_TRN_WidgetAnnotCreateFromObj'] = Module['asm']['Xr']).apply(null, arguments);
});
var _TRN_WidgetAnnotCreateFromAnnot = (Module['_TRN_WidgetAnnotCreateFromAnnot'] = function () {
  return (_TRN_WidgetAnnotCreateFromAnnot = Module['_TRN_WidgetAnnotCreateFromAnnot'] = Module['asm']['Yr']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetField = (Module['_TRN_WidgetAnnotGetField'] = function () {
  return (_TRN_WidgetAnnotGetField = Module['_TRN_WidgetAnnotGetField'] = Module['asm']['Zr']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetHighlightingMode = (Module['_TRN_WidgetAnnotGetHighlightingMode'] = function () {
  return (_TRN_WidgetAnnotGetHighlightingMode = Module['_TRN_WidgetAnnotGetHighlightingMode'] = Module['asm']['_r']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetHighlightingMode = (Module['_TRN_WidgetAnnotSetHighlightingMode'] = function () {
  return (_TRN_WidgetAnnotSetHighlightingMode = Module['_TRN_WidgetAnnotSetHighlightingMode'] = Module['asm']['$r']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetAction = (Module['_TRN_WidgetAnnotGetAction'] = function () {
  return (_TRN_WidgetAnnotGetAction = Module['_TRN_WidgetAnnotGetAction'] = Module['asm']['as']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetAction = (Module['_TRN_WidgetAnnotSetAction'] = function () {
  return (_TRN_WidgetAnnotSetAction = Module['_TRN_WidgetAnnotSetAction'] = Module['asm']['bs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetBorderColor = (Module['_TRN_WidgetAnnotGetBorderColor'] = function () {
  return (_TRN_WidgetAnnotGetBorderColor = Module['_TRN_WidgetAnnotGetBorderColor'] = Module['asm']['cs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetBorderColor = (Module['_TRN_WidgetAnnotSetBorderColor'] = function () {
  return (_TRN_WidgetAnnotSetBorderColor = Module['_TRN_WidgetAnnotSetBorderColor'] = Module['asm']['ds']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetBorderColorCompNum = (Module['_TRN_WidgetAnnotGetBorderColorCompNum'] = function () {
  return (_TRN_WidgetAnnotGetBorderColorCompNum = Module['_TRN_WidgetAnnotGetBorderColorCompNum'] = Module['asm']['es']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetBackgroundColorCompNum = (Module['_TRN_WidgetAnnotGetBackgroundColorCompNum'] = function () {
  return (_TRN_WidgetAnnotGetBackgroundColorCompNum = Module['_TRN_WidgetAnnotGetBackgroundColorCompNum'] = Module['asm']['fs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetBackgroundColor = (Module['_TRN_WidgetAnnotGetBackgroundColor'] = function () {
  return (_TRN_WidgetAnnotGetBackgroundColor = Module['_TRN_WidgetAnnotGetBackgroundColor'] = Module['asm']['gs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetBackgroundColor = (Module['_TRN_WidgetAnnotSetBackgroundColor'] = function () {
  return (_TRN_WidgetAnnotSetBackgroundColor = Module['_TRN_WidgetAnnotSetBackgroundColor'] = Module['asm']['hs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetStaticCaptionText = (Module['_TRN_WidgetAnnotGetStaticCaptionText'] = function () {
  return (_TRN_WidgetAnnotGetStaticCaptionText = Module['_TRN_WidgetAnnotGetStaticCaptionText'] = Module['asm']['is']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetStaticCaptionText = (Module['_TRN_WidgetAnnotSetStaticCaptionText'] = function () {
  return (_TRN_WidgetAnnotSetStaticCaptionText = Module['_TRN_WidgetAnnotSetStaticCaptionText'] = Module['asm']['js']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetRolloverCaptionText = (Module['_TRN_WidgetAnnotGetRolloverCaptionText'] = function () {
  return (_TRN_WidgetAnnotGetRolloverCaptionText = Module['_TRN_WidgetAnnotGetRolloverCaptionText'] = Module['asm']['ks']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetRolloverCaptionText = (Module['_TRN_WidgetAnnotSetRolloverCaptionText'] = function () {
  return (_TRN_WidgetAnnotSetRolloverCaptionText = Module['_TRN_WidgetAnnotSetRolloverCaptionText'] = Module['asm']['ls']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetMouseDownCaptionText = (Module['_TRN_WidgetAnnotGetMouseDownCaptionText'] = function () {
  return (_TRN_WidgetAnnotGetMouseDownCaptionText = Module['_TRN_WidgetAnnotGetMouseDownCaptionText'] = Module['asm']['ms']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetMouseDownCaptionText = (Module['_TRN_WidgetAnnotSetMouseDownCaptionText'] = function () {
  return (_TRN_WidgetAnnotSetMouseDownCaptionText = Module['_TRN_WidgetAnnotSetMouseDownCaptionText'] = Module['asm']['ns']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetStaticIcon = (Module['_TRN_WidgetAnnotGetStaticIcon'] = function () {
  return (_TRN_WidgetAnnotGetStaticIcon = Module['_TRN_WidgetAnnotGetStaticIcon'] = Module['asm']['os']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetStaticIcon = (Module['_TRN_WidgetAnnotSetStaticIcon'] = function () {
  return (_TRN_WidgetAnnotSetStaticIcon = Module['_TRN_WidgetAnnotSetStaticIcon'] = Module['asm']['ps']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetRolloverIcon = (Module['_TRN_WidgetAnnotGetRolloverIcon'] = function () {
  return (_TRN_WidgetAnnotGetRolloverIcon = Module['_TRN_WidgetAnnotGetRolloverIcon'] = Module['asm']['qs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetRolloverIcon = (Module['_TRN_WidgetAnnotSetRolloverIcon'] = function () {
  return (_TRN_WidgetAnnotSetRolloverIcon = Module['_TRN_WidgetAnnotSetRolloverIcon'] = Module['asm']['rs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetMouseDownIcon = (Module['_TRN_WidgetAnnotGetMouseDownIcon'] = function () {
  return (_TRN_WidgetAnnotGetMouseDownIcon = Module['_TRN_WidgetAnnotGetMouseDownIcon'] = Module['asm']['ss']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetMouseDownIcon = (Module['_TRN_WidgetAnnotSetMouseDownIcon'] = function () {
  return (_TRN_WidgetAnnotSetMouseDownIcon = Module['_TRN_WidgetAnnotSetMouseDownIcon'] = Module['asm']['ts']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetScaleType = (Module['_TRN_WidgetAnnotGetScaleType'] = function () {
  return (_TRN_WidgetAnnotGetScaleType = Module['_TRN_WidgetAnnotGetScaleType'] = Module['asm']['us']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetScaleType = (Module['_TRN_WidgetAnnotSetScaleType'] = function () {
  return (_TRN_WidgetAnnotSetScaleType = Module['_TRN_WidgetAnnotSetScaleType'] = Module['asm']['vs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetIconCaptionRelation = (Module['_TRN_WidgetAnnotGetIconCaptionRelation'] = function () {
  return (_TRN_WidgetAnnotGetIconCaptionRelation = Module['_TRN_WidgetAnnotGetIconCaptionRelation'] = Module['asm']['ws']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetIconCaptionRelation = (Module['_TRN_WidgetAnnotSetIconCaptionRelation'] = function () {
  return (_TRN_WidgetAnnotSetIconCaptionRelation = Module['_TRN_WidgetAnnotSetIconCaptionRelation'] = Module['asm']['xs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetScaleCondition = (Module['_TRN_WidgetAnnotGetScaleCondition'] = function () {
  return (_TRN_WidgetAnnotGetScaleCondition = Module['_TRN_WidgetAnnotGetScaleCondition'] = Module['asm']['ys']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetScaleCondition = (Module['_TRN_WidgetAnnotSetScaleCondition'] = function () {
  return (_TRN_WidgetAnnotSetScaleCondition = Module['_TRN_WidgetAnnotSetScaleCondition'] = Module['asm']['zs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetFitFull = (Module['_TRN_WidgetAnnotGetFitFull'] = function () {
  return (_TRN_WidgetAnnotGetFitFull = Module['_TRN_WidgetAnnotGetFitFull'] = Module['asm']['As']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetFitFull = (Module['_TRN_WidgetAnnotSetFitFull'] = function () {
  return (_TRN_WidgetAnnotSetFitFull = Module['_TRN_WidgetAnnotSetFitFull'] = Module['asm']['Bs']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetHIconLeftOver = (Module['_TRN_WidgetAnnotGetHIconLeftOver'] = function () {
  return (_TRN_WidgetAnnotGetHIconLeftOver = Module['_TRN_WidgetAnnotGetHIconLeftOver'] = Module['asm']['Cs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetHIconLeftOver = (Module['_TRN_WidgetAnnotSetHIconLeftOver'] = function () {
  return (_TRN_WidgetAnnotSetHIconLeftOver = Module['_TRN_WidgetAnnotSetHIconLeftOver'] = Module['asm']['Ds']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetVIconLeftOver = (Module['_TRN_WidgetAnnotGetVIconLeftOver'] = function () {
  return (_TRN_WidgetAnnotGetVIconLeftOver = Module['_TRN_WidgetAnnotGetVIconLeftOver'] = Module['asm']['Es']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetVIconLeftOver = (Module['_TRN_WidgetAnnotSetVIconLeftOver'] = function () {
  return (_TRN_WidgetAnnotSetVIconLeftOver = Module['_TRN_WidgetAnnotSetVIconLeftOver'] = Module['asm']['Fs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetFontSize = (Module['_TRN_WidgetAnnotSetFontSize'] = function () {
  return (_TRN_WidgetAnnotSetFontSize = Module['_TRN_WidgetAnnotSetFontSize'] = Module['asm']['Gs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetTextColor = (Module['_TRN_WidgetAnnotSetTextColor'] = function () {
  return (_TRN_WidgetAnnotSetTextColor = Module['_TRN_WidgetAnnotSetTextColor'] = Module['asm']['Hs']).apply(null, arguments);
});
var _TRN_WidgetAnnotSetFont = (Module['_TRN_WidgetAnnotSetFont'] = function () {
  return (_TRN_WidgetAnnotSetFont = Module['_TRN_WidgetAnnotSetFont'] = Module['asm']['Is']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetFontSize = (Module['_TRN_WidgetAnnotGetFontSize'] = function () {
  return (_TRN_WidgetAnnotGetFontSize = Module['_TRN_WidgetAnnotGetFontSize'] = Module['asm']['Js']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetTextColor = (Module['_TRN_WidgetAnnotGetTextColor'] = function () {
  return (_TRN_WidgetAnnotGetTextColor = Module['_TRN_WidgetAnnotGetTextColor'] = Module['asm']['Ks']).apply(null, arguments);
});
var _TRN_WidgetAnnotGetFont = (Module['_TRN_WidgetAnnotGetFont'] = function () {
  return (_TRN_WidgetAnnotGetFont = Module['_TRN_WidgetAnnotGetFont'] = Module['asm']['Ls']).apply(null, arguments);
});
var _TRN_SignatureWidgetCreate = (Module['_TRN_SignatureWidgetCreate'] = function () {
  return (_TRN_SignatureWidgetCreate = Module['_TRN_SignatureWidgetCreate'] = Module['asm']['Ms']).apply(null, arguments);
});
var _TRN_SignatureWidgetCreateWithField = (Module['_TRN_SignatureWidgetCreateWithField'] = function () {
  return (_TRN_SignatureWidgetCreateWithField = Module['_TRN_SignatureWidgetCreateWithField'] = Module['asm']['Ns']).apply(null, arguments);
});
var _TRN_SignatureWidgetCreateWithDigitalSignatureField = (Module['_TRN_SignatureWidgetCreateWithDigitalSignatureField'] = function () {
  return (_TRN_SignatureWidgetCreateWithDigitalSignatureField = Module['_TRN_SignatureWidgetCreateWithDigitalSignatureField'] = Module['asm']['Os']).apply(
    null,
    arguments,
  );
});
var _TRN_SignatureWidgetCreateFromObj = (Module['_TRN_SignatureWidgetCreateFromObj'] = function () {
  return (_TRN_SignatureWidgetCreateFromObj = Module['_TRN_SignatureWidgetCreateFromObj'] = Module['asm']['Ps']).apply(null, arguments);
});
var _TRN_SignatureWidgetCreateFromAnnot = (Module['_TRN_SignatureWidgetCreateFromAnnot'] = function () {
  return (_TRN_SignatureWidgetCreateFromAnnot = Module['_TRN_SignatureWidgetCreateFromAnnot'] = Module['asm']['Qs']).apply(null, arguments);
});
var _TRN_SignatureWidgetCreateSignatureAppearance = (Module['_TRN_SignatureWidgetCreateSignatureAppearance'] = function () {
  return (_TRN_SignatureWidgetCreateSignatureAppearance = Module['_TRN_SignatureWidgetCreateSignatureAppearance'] = Module['asm']['Rs']).apply(null, arguments);
});
var _TRN_SignatureWidgetGetDigitalSignatureField = (Module['_TRN_SignatureWidgetGetDigitalSignatureField'] = function () {
  return (_TRN_SignatureWidgetGetDigitalSignatureField = Module['_TRN_SignatureWidgetGetDigitalSignatureField'] = Module['asm']['Ss']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetCreate = (Module['_TRN_ComboBoxWidgetCreate'] = function () {
  return (_TRN_ComboBoxWidgetCreate = Module['_TRN_ComboBoxWidgetCreate'] = Module['asm']['Ts']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetCreateWithField = (Module['_TRN_ComboBoxWidgetCreateWithField'] = function () {
  return (_TRN_ComboBoxWidgetCreateWithField = Module['_TRN_ComboBoxWidgetCreateWithField'] = Module['asm']['Us']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetCreateFromObj = (Module['_TRN_ComboBoxWidgetCreateFromObj'] = function () {
  return (_TRN_ComboBoxWidgetCreateFromObj = Module['_TRN_ComboBoxWidgetCreateFromObj'] = Module['asm']['Vs']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetCreateFromAnnot = (Module['_TRN_ComboBoxWidgetCreateFromAnnot'] = function () {
  return (_TRN_ComboBoxWidgetCreateFromAnnot = Module['_TRN_ComboBoxWidgetCreateFromAnnot'] = Module['asm']['Ws']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetAddOption = (Module['_TRN_ComboBoxWidgetAddOption'] = function () {
  return (_TRN_ComboBoxWidgetAddOption = Module['_TRN_ComboBoxWidgetAddOption'] = Module['asm']['Xs']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetAddOptions = (Module['_TRN_ComboBoxWidgetAddOptions'] = function () {
  return (_TRN_ComboBoxWidgetAddOptions = Module['_TRN_ComboBoxWidgetAddOptions'] = Module['asm']['Ys']).apply(null, arguments);
});
var _TRN_UStringAssignUString = (Module['_TRN_UStringAssignUString'] = function () {
  return (_TRN_UStringAssignUString = Module['_TRN_UStringAssignUString'] = Module['asm']['Zs']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetSetSelectedOption = (Module['_TRN_ComboBoxWidgetSetSelectedOption'] = function () {
  return (_TRN_ComboBoxWidgetSetSelectedOption = Module['_TRN_ComboBoxWidgetSetSelectedOption'] = Module['asm']['_s']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetGetSelectedOption = (Module['_TRN_ComboBoxWidgetGetSelectedOption'] = function () {
  return (_TRN_ComboBoxWidgetGetSelectedOption = Module['_TRN_ComboBoxWidgetGetSelectedOption'] = Module['asm']['$s']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetReplaceOptions = (Module['_TRN_ComboBoxWidgetReplaceOptions'] = function () {
  return (_TRN_ComboBoxWidgetReplaceOptions = Module['_TRN_ComboBoxWidgetReplaceOptions'] = Module['asm']['at']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetRemoveOption = (Module['_TRN_ComboBoxWidgetRemoveOption'] = function () {
  return (_TRN_ComboBoxWidgetRemoveOption = Module['_TRN_ComboBoxWidgetRemoveOption'] = Module['asm']['bt']).apply(null, arguments);
});
var _TRN_ListBoxWidgetCreate = (Module['_TRN_ListBoxWidgetCreate'] = function () {
  return (_TRN_ListBoxWidgetCreate = Module['_TRN_ListBoxWidgetCreate'] = Module['asm']['ct']).apply(null, arguments);
});
var _TRN_ListBoxWidgetCreateWithField = (Module['_TRN_ListBoxWidgetCreateWithField'] = function () {
  return (_TRN_ListBoxWidgetCreateWithField = Module['_TRN_ListBoxWidgetCreateWithField'] = Module['asm']['dt']).apply(null, arguments);
});
var _TRN_ListBoxWidgetCreateFromObj = (Module['_TRN_ListBoxWidgetCreateFromObj'] = function () {
  return (_TRN_ListBoxWidgetCreateFromObj = Module['_TRN_ListBoxWidgetCreateFromObj'] = Module['asm']['et']).apply(null, arguments);
});
var _TRN_ListBoxWidgetCreateFromAnnot = (Module['_TRN_ListBoxWidgetCreateFromAnnot'] = function () {
  return (_TRN_ListBoxWidgetCreateFromAnnot = Module['_TRN_ListBoxWidgetCreateFromAnnot'] = Module['asm']['ft']).apply(null, arguments);
});
var _TRN_ListBoxWidgetAddOption = (Module['_TRN_ListBoxWidgetAddOption'] = function () {
  return (_TRN_ListBoxWidgetAddOption = Module['_TRN_ListBoxWidgetAddOption'] = Module['asm']['gt']).apply(null, arguments);
});
var _TRN_ListBoxWidgetAddOptions = (Module['_TRN_ListBoxWidgetAddOptions'] = function () {
  return (_TRN_ListBoxWidgetAddOptions = Module['_TRN_ListBoxWidgetAddOptions'] = Module['asm']['ht']).apply(null, arguments);
});
var _TRN_ListBoxWidgetSetSelectedOptions = (Module['_TRN_ListBoxWidgetSetSelectedOptions'] = function () {
  return (_TRN_ListBoxWidgetSetSelectedOptions = Module['_TRN_ListBoxWidgetSetSelectedOptions'] = Module['asm']['it']).apply(null, arguments);
});
var _TRN_ListBoxWidgetReplaceOptions = (Module['_TRN_ListBoxWidgetReplaceOptions'] = function () {
  return (_TRN_ListBoxWidgetReplaceOptions = Module['_TRN_ListBoxWidgetReplaceOptions'] = Module['asm']['jt']).apply(null, arguments);
});
var _TRN_ListBoxWidgetRemoveOption = (Module['_TRN_ListBoxWidgetRemoveOption'] = function () {
  return (_TRN_ListBoxWidgetRemoveOption = Module['_TRN_ListBoxWidgetRemoveOption'] = Module['asm']['kt']).apply(null, arguments);
});
var _TRN_TextWidgetCreate = (Module['_TRN_TextWidgetCreate'] = function () {
  return (_TRN_TextWidgetCreate = Module['_TRN_TextWidgetCreate'] = Module['asm']['lt']).apply(null, arguments);
});
var _TRN_TextWidgetCreateWithField = (Module['_TRN_TextWidgetCreateWithField'] = function () {
  return (_TRN_TextWidgetCreateWithField = Module['_TRN_TextWidgetCreateWithField'] = Module['asm']['mt']).apply(null, arguments);
});
var _TRN_TextWidgetCreateFromObj = (Module['_TRN_TextWidgetCreateFromObj'] = function () {
  return (_TRN_TextWidgetCreateFromObj = Module['_TRN_TextWidgetCreateFromObj'] = Module['asm']['nt']).apply(null, arguments);
});
var _TRN_TextWidgetCreateFromAnnot = (Module['_TRN_TextWidgetCreateFromAnnot'] = function () {
  return (_TRN_TextWidgetCreateFromAnnot = Module['_TRN_TextWidgetCreateFromAnnot'] = Module['asm']['ot']).apply(null, arguments);
});
var _TRN_TextWidgetSetText = (Module['_TRN_TextWidgetSetText'] = function () {
  return (_TRN_TextWidgetSetText = Module['_TRN_TextWidgetSetText'] = Module['asm']['pt']).apply(null, arguments);
});
var _TRN_TextWidgetGetText = (Module['_TRN_TextWidgetGetText'] = function () {
  return (_TRN_TextWidgetGetText = Module['_TRN_TextWidgetGetText'] = Module['asm']['qt']).apply(null, arguments);
});
var _TRN_CheckBoxWidgetCreate = (Module['_TRN_CheckBoxWidgetCreate'] = function () {
  return (_TRN_CheckBoxWidgetCreate = Module['_TRN_CheckBoxWidgetCreate'] = Module['asm']['rt']).apply(null, arguments);
});
var _TRN_CheckBoxWidgetCreateWithField = (Module['_TRN_CheckBoxWidgetCreateWithField'] = function () {
  return (_TRN_CheckBoxWidgetCreateWithField = Module['_TRN_CheckBoxWidgetCreateWithField'] = Module['asm']['st']).apply(null, arguments);
});
var _TRN_CheckBoxWidgetCreateFromObj = (Module['_TRN_CheckBoxWidgetCreateFromObj'] = function () {
  return (_TRN_CheckBoxWidgetCreateFromObj = Module['_TRN_CheckBoxWidgetCreateFromObj'] = Module['asm']['tt']).apply(null, arguments);
});
var _TRN_CheckBoxWidgetCreateFromAnnot = (Module['_TRN_CheckBoxWidgetCreateFromAnnot'] = function () {
  return (_TRN_CheckBoxWidgetCreateFromAnnot = Module['_TRN_CheckBoxWidgetCreateFromAnnot'] = Module['asm']['ut']).apply(null, arguments);
});
var _TRN_CheckBoxWidgetIsChecked = (Module['_TRN_CheckBoxWidgetIsChecked'] = function () {
  return (_TRN_CheckBoxWidgetIsChecked = Module['_TRN_CheckBoxWidgetIsChecked'] = Module['asm']['vt']).apply(null, arguments);
});
var _TRN_CheckBoxWidgetSetChecked = (Module['_TRN_CheckBoxWidgetSetChecked'] = function () {
  return (_TRN_CheckBoxWidgetSetChecked = Module['_TRN_CheckBoxWidgetSetChecked'] = Module['asm']['wt']).apply(null, arguments);
});
var _TRN_RadioButtonWidgetCreateFromObj = (Module['_TRN_RadioButtonWidgetCreateFromObj'] = function () {
  return (_TRN_RadioButtonWidgetCreateFromObj = Module['_TRN_RadioButtonWidgetCreateFromObj'] = Module['asm']['xt']).apply(null, arguments);
});
var _TRN_RadioButtonWidgetCreateFromAnnot = (Module['_TRN_RadioButtonWidgetCreateFromAnnot'] = function () {
  return (_TRN_RadioButtonWidgetCreateFromAnnot = Module['_TRN_RadioButtonWidgetCreateFromAnnot'] = Module['asm']['yt']).apply(null, arguments);
});
var _TRN_RadioButtonWidgetIsEnabled = (Module['_TRN_RadioButtonWidgetIsEnabled'] = function () {
  return (_TRN_RadioButtonWidgetIsEnabled = Module['_TRN_RadioButtonWidgetIsEnabled'] = Module['asm']['zt']).apply(null, arguments);
});
var _TRN_RadioButtonWidgetEnableButton = (Module['_TRN_RadioButtonWidgetEnableButton'] = function () {
  return (_TRN_RadioButtonWidgetEnableButton = Module['_TRN_RadioButtonWidgetEnableButton'] = Module['asm']['At']).apply(null, arguments);
});
var _TRN_RadioButtonWidgetGetGroup = (Module['_TRN_RadioButtonWidgetGetGroup'] = function () {
  return (_TRN_RadioButtonWidgetGetGroup = Module['_TRN_RadioButtonWidgetGetGroup'] = Module['asm']['Bt']).apply(null, arguments);
});
var _TRN_PushButtonWidgetCreate = (Module['_TRN_PushButtonWidgetCreate'] = function () {
  return (_TRN_PushButtonWidgetCreate = Module['_TRN_PushButtonWidgetCreate'] = Module['asm']['Ct']).apply(null, arguments);
});
var _TRN_PushButtonWidgetCreateWithField = (Module['_TRN_PushButtonWidgetCreateWithField'] = function () {
  return (_TRN_PushButtonWidgetCreateWithField = Module['_TRN_PushButtonWidgetCreateWithField'] = Module['asm']['Dt']).apply(null, arguments);
});
var _TRN_PushButtonWidgetCreateFromObj = (Module['_TRN_PushButtonWidgetCreateFromObj'] = function () {
  return (_TRN_PushButtonWidgetCreateFromObj = Module['_TRN_PushButtonWidgetCreateFromObj'] = Module['asm']['Et']).apply(null, arguments);
});
var _TRN_PushButtonWidgetCreateFromAnnot = (Module['_TRN_PushButtonWidgetCreateFromAnnot'] = function () {
  return (_TRN_PushButtonWidgetCreateFromAnnot = Module['_TRN_PushButtonWidgetCreateFromAnnot'] = Module['asm']['Ft']).apply(null, arguments);
});
var _TRN_BookmarkCreate = (Module['_TRN_BookmarkCreate'] = function () {
  return (_TRN_BookmarkCreate = Module['_TRN_BookmarkCreate'] = Module['asm']['Gt']).apply(null, arguments);
});
var _TRN_BookmarkCreateFromObj = (Module['_TRN_BookmarkCreateFromObj'] = function () {
  return (_TRN_BookmarkCreateFromObj = Module['_TRN_BookmarkCreateFromObj'] = Module['asm']['Ht']).apply(null, arguments);
});
var _TRN_BookmarkCopy = (Module['_TRN_BookmarkCopy'] = function () {
  return (_TRN_BookmarkCopy = Module['_TRN_BookmarkCopy'] = Module['asm']['It']).apply(null, arguments);
});
var _TRN_BookmarkCompare = (Module['_TRN_BookmarkCompare'] = function () {
  return (_TRN_BookmarkCompare = Module['_TRN_BookmarkCompare'] = Module['asm']['Jt']).apply(null, arguments);
});
var _TRN_BookmarkIsValid = (Module['_TRN_BookmarkIsValid'] = function () {
  return (_TRN_BookmarkIsValid = Module['_TRN_BookmarkIsValid'] = Module['asm']['Kt']).apply(null, arguments);
});
var _TRN_BookmarkHasChildren = (Module['_TRN_BookmarkHasChildren'] = function () {
  return (_TRN_BookmarkHasChildren = Module['_TRN_BookmarkHasChildren'] = Module['asm']['Lt']).apply(null, arguments);
});
var _TRN_BookmarkGetNext = (Module['_TRN_BookmarkGetNext'] = function () {
  return (_TRN_BookmarkGetNext = Module['_TRN_BookmarkGetNext'] = Module['asm']['Mt']).apply(null, arguments);
});
var _TRN_BookmarkGetPrev = (Module['_TRN_BookmarkGetPrev'] = function () {
  return (_TRN_BookmarkGetPrev = Module['_TRN_BookmarkGetPrev'] = Module['asm']['Nt']).apply(null, arguments);
});
var _TRN_BookmarkGetFirstChild = (Module['_TRN_BookmarkGetFirstChild'] = function () {
  return (_TRN_BookmarkGetFirstChild = Module['_TRN_BookmarkGetFirstChild'] = Module['asm']['Ot']).apply(null, arguments);
});
var _TRN_BookmarkGetLastChild = (Module['_TRN_BookmarkGetLastChild'] = function () {
  return (_TRN_BookmarkGetLastChild = Module['_TRN_BookmarkGetLastChild'] = Module['asm']['Pt']).apply(null, arguments);
});
var _TRN_BookmarkGetParent = (Module['_TRN_BookmarkGetParent'] = function () {
  return (_TRN_BookmarkGetParent = Module['_TRN_BookmarkGetParent'] = Module['asm']['Qt']).apply(null, arguments);
});
var _TRN_BookmarkFind = (Module['_TRN_BookmarkFind'] = function () {
  return (_TRN_BookmarkFind = Module['_TRN_BookmarkFind'] = Module['asm']['Rt']).apply(null, arguments);
});
var _TRN_BookmarkAddNewChild = (Module['_TRN_BookmarkAddNewChild'] = function () {
  return (_TRN_BookmarkAddNewChild = Module['_TRN_BookmarkAddNewChild'] = Module['asm']['St']).apply(null, arguments);
});
var _TRN_BookmarkAddChild = (Module['_TRN_BookmarkAddChild'] = function () {
  return (_TRN_BookmarkAddChild = Module['_TRN_BookmarkAddChild'] = Module['asm']['Tt']).apply(null, arguments);
});
var _TRN_BookmarkAddNewNext = (Module['_TRN_BookmarkAddNewNext'] = function () {
  return (_TRN_BookmarkAddNewNext = Module['_TRN_BookmarkAddNewNext'] = Module['asm']['Ut']).apply(null, arguments);
});
var _TRN_BookmarkAddNext = (Module['_TRN_BookmarkAddNext'] = function () {
  return (_TRN_BookmarkAddNext = Module['_TRN_BookmarkAddNext'] = Module['asm']['Vt']).apply(null, arguments);
});
var _TRN_BookmarkAddNewPrev = (Module['_TRN_BookmarkAddNewPrev'] = function () {
  return (_TRN_BookmarkAddNewPrev = Module['_TRN_BookmarkAddNewPrev'] = Module['asm']['Wt']).apply(null, arguments);
});
var _TRN_BookmarkAddPrev = (Module['_TRN_BookmarkAddPrev'] = function () {
  return (_TRN_BookmarkAddPrev = Module['_TRN_BookmarkAddPrev'] = Module['asm']['Xt']).apply(null, arguments);
});
var _TRN_BookmarkDelete = (Module['_TRN_BookmarkDelete'] = function () {
  return (_TRN_BookmarkDelete = Module['_TRN_BookmarkDelete'] = Module['asm']['Yt']).apply(null, arguments);
});
var _TRN_BookmarkUnlink = (Module['_TRN_BookmarkUnlink'] = function () {
  return (_TRN_BookmarkUnlink = Module['_TRN_BookmarkUnlink'] = Module['asm']['Zt']).apply(null, arguments);
});
var _TRN_BookmarkGetIndent = (Module['_TRN_BookmarkGetIndent'] = function () {
  return (_TRN_BookmarkGetIndent = Module['_TRN_BookmarkGetIndent'] = Module['asm']['_t']).apply(null, arguments);
});
var _TRN_BookmarkIsOpen = (Module['_TRN_BookmarkIsOpen'] = function () {
  return (_TRN_BookmarkIsOpen = Module['_TRN_BookmarkIsOpen'] = Module['asm']['$t']).apply(null, arguments);
});
var _TRN_BookmarkSetOpen = (Module['_TRN_BookmarkSetOpen'] = function () {
  return (_TRN_BookmarkSetOpen = Module['_TRN_BookmarkSetOpen'] = Module['asm']['au']).apply(null, arguments);
});
var _TRN_BookmarkGetOpenCount = (Module['_TRN_BookmarkGetOpenCount'] = function () {
  return (_TRN_BookmarkGetOpenCount = Module['_TRN_BookmarkGetOpenCount'] = Module['asm']['bu']).apply(null, arguments);
});
var _TRN_BookmarkGetTitle = (Module['_TRN_BookmarkGetTitle'] = function () {
  return (_TRN_BookmarkGetTitle = Module['_TRN_BookmarkGetTitle'] = Module['asm']['cu']).apply(null, arguments);
});
var _TRN_BookmarkGetTitleObj = (Module['_TRN_BookmarkGetTitleObj'] = function () {
  return (_TRN_BookmarkGetTitleObj = Module['_TRN_BookmarkGetTitleObj'] = Module['asm']['du']).apply(null, arguments);
});
var _TRN_BookmarkSetTitle = (Module['_TRN_BookmarkSetTitle'] = function () {
  return (_TRN_BookmarkSetTitle = Module['_TRN_BookmarkSetTitle'] = Module['asm']['eu']).apply(null, arguments);
});
var _TRN_BookmarkGetAction = (Module['_TRN_BookmarkGetAction'] = function () {
  return (_TRN_BookmarkGetAction = Module['_TRN_BookmarkGetAction'] = Module['asm']['fu']).apply(null, arguments);
});
var _TRN_BookmarkSetAction = (Module['_TRN_BookmarkSetAction'] = function () {
  return (_TRN_BookmarkSetAction = Module['_TRN_BookmarkSetAction'] = Module['asm']['gu']).apply(null, arguments);
});
var _TRN_BookmarkRemoveAction = (Module['_TRN_BookmarkRemoveAction'] = function () {
  return (_TRN_BookmarkRemoveAction = Module['_TRN_BookmarkRemoveAction'] = Module['asm']['hu']).apply(null, arguments);
});
var _TRN_BookmarkGetFlags = (Module['_TRN_BookmarkGetFlags'] = function () {
  return (_TRN_BookmarkGetFlags = Module['_TRN_BookmarkGetFlags'] = Module['asm']['iu']).apply(null, arguments);
});
var _TRN_BookmarkSetFlags = (Module['_TRN_BookmarkSetFlags'] = function () {
  return (_TRN_BookmarkSetFlags = Module['_TRN_BookmarkSetFlags'] = Module['asm']['ju']).apply(null, arguments);
});
var _TRN_BookmarkGetColor = (Module['_TRN_BookmarkGetColor'] = function () {
  return (_TRN_BookmarkGetColor = Module['_TRN_BookmarkGetColor'] = Module['asm']['ku']).apply(null, arguments);
});
var _TRN_BookmarkSetColor = (Module['_TRN_BookmarkSetColor'] = function () {
  return (_TRN_BookmarkSetColor = Module['_TRN_BookmarkSetColor'] = Module['asm']['lu']).apply(null, arguments);
});
var _TRN_BookmarkGetSDFObj = (Module['_TRN_BookmarkGetSDFObj'] = function () {
  return (_TRN_BookmarkGetSDFObj = Module['_TRN_BookmarkGetSDFObj'] = Module['asm']['mu']).apply(null, arguments);
});
var _TRN_ColorPtCompare = (Module['_TRN_ColorPtCompare'] = function () {
  return (_TRN_ColorPtCompare = Module['_TRN_ColorPtCompare'] = Module['asm']['nu']).apply(null, arguments);
});
var _TRN_ColorPtDestroy = (Module['_TRN_ColorPtDestroy'] = function () {
  return (_TRN_ColorPtDestroy = Module['_TRN_ColorPtDestroy'] = Module['asm']['ou']).apply(null, arguments);
});
var _TRN_ColorPtSet = (Module['_TRN_ColorPtSet'] = function () {
  return (_TRN_ColorPtSet = Module['_TRN_ColorPtSet'] = Module['asm']['pu']).apply(null, arguments);
});
var _TRN_ColorPtSetByIndex = (Module['_TRN_ColorPtSetByIndex'] = function () {
  return (_TRN_ColorPtSetByIndex = Module['_TRN_ColorPtSetByIndex'] = Module['asm']['qu']).apply(null, arguments);
});
var _TRN_ColorPtGet = (Module['_TRN_ColorPtGet'] = function () {
  return (_TRN_ColorPtGet = Module['_TRN_ColorPtGet'] = Module['asm']['ru']).apply(null, arguments);
});
var _TRN_ColorPtSetColorantNum = (Module['_TRN_ColorPtSetColorantNum'] = function () {
  return (_TRN_ColorPtSetColorantNum = Module['_TRN_ColorPtSetColorantNum'] = Module['asm']['su']).apply(null, arguments);
});
var _TRN_ColorSpaceCreateDeviceGray = (Module['_TRN_ColorSpaceCreateDeviceGray'] = function () {
  return (_TRN_ColorSpaceCreateDeviceGray = Module['_TRN_ColorSpaceCreateDeviceGray'] = Module['asm']['tu']).apply(null, arguments);
});
var _TRN_ColorSpaceCreateDeviceRGB = (Module['_TRN_ColorSpaceCreateDeviceRGB'] = function () {
  return (_TRN_ColorSpaceCreateDeviceRGB = Module['_TRN_ColorSpaceCreateDeviceRGB'] = Module['asm']['uu']).apply(null, arguments);
});
var _TRN_ColorSpaceCreateDeviceCMYK = (Module['_TRN_ColorSpaceCreateDeviceCMYK'] = function () {
  return (_TRN_ColorSpaceCreateDeviceCMYK = Module['_TRN_ColorSpaceCreateDeviceCMYK'] = Module['asm']['vu']).apply(null, arguments);
});
var _TRN_ColorSpaceCreatePattern = (Module['_TRN_ColorSpaceCreatePattern'] = function () {
  return (_TRN_ColorSpaceCreatePattern = Module['_TRN_ColorSpaceCreatePattern'] = Module['asm']['wu']).apply(null, arguments);
});
var _TRN_ColorSpaceCreate = (Module['_TRN_ColorSpaceCreate'] = function () {
  return (_TRN_ColorSpaceCreate = Module['_TRN_ColorSpaceCreate'] = Module['asm']['xu']).apply(null, arguments);
});
var _TRN_ColorSpaceCreateICCFromFilter = (Module['_TRN_ColorSpaceCreateICCFromFilter'] = function () {
  return (_TRN_ColorSpaceCreateICCFromFilter = Module['_TRN_ColorSpaceCreateICCFromFilter'] = Module['asm']['yu']).apply(null, arguments);
});
var _TRN_ColorSpaceCreateICCFromBuffer = (Module['_TRN_ColorSpaceCreateICCFromBuffer'] = function () {
  return (_TRN_ColorSpaceCreateICCFromBuffer = Module['_TRN_ColorSpaceCreateICCFromBuffer'] = Module['asm']['zu']).apply(null, arguments);
});
var _TRN_ColorSpaceDestroy = (Module['_TRN_ColorSpaceDestroy'] = function () {
  return (_TRN_ColorSpaceDestroy = Module['_TRN_ColorSpaceDestroy'] = Module['asm']['Au']).apply(null, arguments);
});
var _TRN_ColorSpaceGetComponentNumFromObj = (Module['_TRN_ColorSpaceGetComponentNumFromObj'] = function () {
  return (_TRN_ColorSpaceGetComponentNumFromObj = Module['_TRN_ColorSpaceGetComponentNumFromObj'] = Module['asm']['Bu']).apply(null, arguments);
});
var _TRN_ColorSpaceGetTypeFromObj = (Module['_TRN_ColorSpaceGetTypeFromObj'] = function () {
  return (_TRN_ColorSpaceGetTypeFromObj = Module['_TRN_ColorSpaceGetTypeFromObj'] = Module['asm']['Cu']).apply(null, arguments);
});
var _TRN_ColorSpaceGetType = (Module['_TRN_ColorSpaceGetType'] = function () {
  return (_TRN_ColorSpaceGetType = Module['_TRN_ColorSpaceGetType'] = Module['asm']['Du']).apply(null, arguments);
});
var _TRN_ColorSpaceGetSDFObj = (Module['_TRN_ColorSpaceGetSDFObj'] = function () {
  return (_TRN_ColorSpaceGetSDFObj = Module['_TRN_ColorSpaceGetSDFObj'] = Module['asm']['Eu']).apply(null, arguments);
});
var _TRN_ColorSpaceGetComponentNum = (Module['_TRN_ColorSpaceGetComponentNum'] = function () {
  return (_TRN_ColorSpaceGetComponentNum = Module['_TRN_ColorSpaceGetComponentNum'] = Module['asm']['Fu']).apply(null, arguments);
});
var _TRN_ColorSpaceInitColor = (Module['_TRN_ColorSpaceInitColor'] = function () {
  return (_TRN_ColorSpaceInitColor = Module['_TRN_ColorSpaceInitColor'] = Module['asm']['Gu']).apply(null, arguments);
});
var _TRN_ColorSpaceInitComponentRanges = (Module['_TRN_ColorSpaceInitComponentRanges'] = function () {
  return (_TRN_ColorSpaceInitComponentRanges = Module['_TRN_ColorSpaceInitComponentRanges'] = Module['asm']['Hu']).apply(null, arguments);
});
var _TRN_ColorSpaceConvert2Gray = (Module['_TRN_ColorSpaceConvert2Gray'] = function () {
  return (_TRN_ColorSpaceConvert2Gray = Module['_TRN_ColorSpaceConvert2Gray'] = Module['asm']['Iu']).apply(null, arguments);
});
var _TRN_ColorSpaceConvert2RGB = (Module['_TRN_ColorSpaceConvert2RGB'] = function () {
  return (_TRN_ColorSpaceConvert2RGB = Module['_TRN_ColorSpaceConvert2RGB'] = Module['asm']['Ju']).apply(null, arguments);
});
var _TRN_ColorSpaceConvert2CMYK = (Module['_TRN_ColorSpaceConvert2CMYK'] = function () {
  return (_TRN_ColorSpaceConvert2CMYK = Module['_TRN_ColorSpaceConvert2CMYK'] = Module['asm']['Ku']).apply(null, arguments);
});
var _TRN_ColorSpaceGetAlternateColorSpace = (Module['_TRN_ColorSpaceGetAlternateColorSpace'] = function () {
  return (_TRN_ColorSpaceGetAlternateColorSpace = Module['_TRN_ColorSpaceGetAlternateColorSpace'] = Module['asm']['Lu']).apply(null, arguments);
});
var _TRN_ColorSpaceGetBaseColorSpace = (Module['_TRN_ColorSpaceGetBaseColorSpace'] = function () {
  return (_TRN_ColorSpaceGetBaseColorSpace = Module['_TRN_ColorSpaceGetBaseColorSpace'] = Module['asm']['Mu']).apply(null, arguments);
});
var _TRN_ColorSpaceGetHighVal = (Module['_TRN_ColorSpaceGetHighVal'] = function () {
  return (_TRN_ColorSpaceGetHighVal = Module['_TRN_ColorSpaceGetHighVal'] = Module['asm']['Nu']).apply(null, arguments);
});
var _TRN_ColorSpaceGetBaseColor = (Module['_TRN_ColorSpaceGetBaseColor'] = function () {
  return (_TRN_ColorSpaceGetBaseColor = Module['_TRN_ColorSpaceGetBaseColor'] = Module['asm']['Ou']).apply(null, arguments);
});
var _TRN_ColorSpaceGetTintFunction = (Module['_TRN_ColorSpaceGetTintFunction'] = function () {
  return (_TRN_ColorSpaceGetTintFunction = Module['_TRN_ColorSpaceGetTintFunction'] = Module['asm']['Pu']).apply(null, arguments);
});
var _TRN_ColorSpaceIsAll = (Module['_TRN_ColorSpaceIsAll'] = function () {
  return (_TRN_ColorSpaceIsAll = Module['_TRN_ColorSpaceIsAll'] = Module['asm']['Qu']).apply(null, arguments);
});
var _TRN_ColorSpaceIsNone = (Module['_TRN_ColorSpaceIsNone'] = function () {
  return (_TRN_ColorSpaceIsNone = Module['_TRN_ColorSpaceIsNone'] = Module['asm']['Ru']).apply(null, arguments);
});
var _TRN_ContentReplacerCreate = (Module['_TRN_ContentReplacerCreate'] = function () {
  return (_TRN_ContentReplacerCreate = Module['_TRN_ContentReplacerCreate'] = Module['asm']['Su']).apply(null, arguments);
});
var _TRN_ContentReplacerDestroy = (Module['_TRN_ContentReplacerDestroy'] = function () {
  return (_TRN_ContentReplacerDestroy = Module['_TRN_ContentReplacerDestroy'] = Module['asm']['Tu']).apply(null, arguments);
});
var _TRN_ContentReplacer_AddImage = (Module['_TRN_ContentReplacer_AddImage'] = function () {
  return (_TRN_ContentReplacer_AddImage = Module['_TRN_ContentReplacer_AddImage'] = Module['asm']['Uu']).apply(null, arguments);
});
var _TRN_ContentReplacer_AddText = (Module['_TRN_ContentReplacer_AddText'] = function () {
  return (_TRN_ContentReplacer_AddText = Module['_TRN_ContentReplacer_AddText'] = Module['asm']['Vu']).apply(null, arguments);
});
var _TRN_ContentReplacer_AddString = (Module['_TRN_ContentReplacer_AddString'] = function () {
  return (_TRN_ContentReplacer_AddString = Module['_TRN_ContentReplacer_AddString'] = Module['asm']['Wu']).apply(null, arguments);
});
var _TRN_ContentReplacer_SetMatchStrings = (Module['_TRN_ContentReplacer_SetMatchStrings'] = function () {
  return (_TRN_ContentReplacer_SetMatchStrings = Module['_TRN_ContentReplacer_SetMatchStrings'] = Module['asm']['Xu']).apply(null, arguments);
});
var _TRN_ContentReplacer_Process = (Module['_TRN_ContentReplacer_Process'] = function () {
  return (_TRN_ContentReplacer_Process = Module['_TRN_ContentReplacer_Process'] = Module['asm']['Yu']).apply(null, arguments);
});
var _TRN_ReflowGetHtml = (Module['_TRN_ReflowGetHtml'] = function () {
  return (_TRN_ReflowGetHtml = Module['_TRN_ReflowGetHtml'] = Module['asm']['Zu']).apply(null, arguments);
});
var _TRN_ReflowGetAnnot = (Module['_TRN_ReflowGetAnnot'] = function () {
  return (_TRN_ReflowGetAnnot = Module['_TRN_ReflowGetAnnot'] = Module['asm']['_u']).apply(null, arguments);
});
var _TRN_ReflowSetAnnot = (Module['_TRN_ReflowSetAnnot'] = function () {
  return (_TRN_ReflowSetAnnot = Module['_TRN_ReflowSetAnnot'] = Module['asm']['$u']).apply(null, arguments);
});
var _TRN_ReflowSetIncludeImages = (Module['_TRN_ReflowSetIncludeImages'] = function () {
  return (_TRN_ReflowSetIncludeImages = Module['_TRN_ReflowSetIncludeImages'] = Module['asm']['av']).apply(null, arguments);
});
var _TRN_ReflowSetHTMLOutputTextMarkup = (Module['_TRN_ReflowSetHTMLOutputTextMarkup'] = function () {
  return (_TRN_ReflowSetHTMLOutputTextMarkup = Module['_TRN_ReflowSetHTMLOutputTextMarkup'] = Module['asm']['bv']).apply(null, arguments);
});
var _TRN_ReflowSetMessageWhenNoReflowContent = (Module['_TRN_ReflowSetMessageWhenNoReflowContent'] = function () {
  return (_TRN_ReflowSetMessageWhenNoReflowContent = Module['_TRN_ReflowSetMessageWhenNoReflowContent'] = Module['asm']['cv']).apply(null, arguments);
});
var _TRN_ReflowSetMessageWhenReflowFailed = (Module['_TRN_ReflowSetMessageWhenReflowFailed'] = function () {
  return (_TRN_ReflowSetMessageWhenReflowFailed = Module['_TRN_ReflowSetMessageWhenReflowFailed'] = Module['asm']['dv']).apply(null, arguments);
});
var _TRN_ReflowSetHideBackgroundImages = (Module['_TRN_ReflowSetHideBackgroundImages'] = function () {
  return (_TRN_ReflowSetHideBackgroundImages = Module['_TRN_ReflowSetHideBackgroundImages'] = Module['asm']['ev']).apply(null, arguments);
});
var _TRN_ReflowSetHideImagesUnderText = (Module['_TRN_ReflowSetHideImagesUnderText'] = function () {
  return (_TRN_ReflowSetHideImagesUnderText = Module['_TRN_ReflowSetHideImagesUnderText'] = Module['asm']['fv']).apply(null, arguments);
});
var _TRN_ReflowSetHideImagesUnderInvisibleText = (Module['_TRN_ReflowSetHideImagesUnderInvisibleText'] = function () {
  return (_TRN_ReflowSetHideImagesUnderInvisibleText = Module['_TRN_ReflowSetHideImagesUnderInvisibleText'] = Module['asm']['gv']).apply(null, arguments);
});
var _TRN_ReflowSetDoNotReflowTextOverImages = (Module['_TRN_ReflowSetDoNotReflowTextOverImages'] = function () {
  return (_TRN_ReflowSetDoNotReflowTextOverImages = Module['_TRN_ReflowSetDoNotReflowTextOverImages'] = Module['asm']['hv']).apply(null, arguments);
});
var _TRN_ReflowSetFontOverrideName = (Module['_TRN_ReflowSetFontOverrideName'] = function () {
  return (_TRN_ReflowSetFontOverrideName = Module['_TRN_ReflowSetFontOverrideName'] = Module['asm']['iv']).apply(null, arguments);
});
var _TRN_ReflowSetCustomStyles = (Module['_TRN_ReflowSetCustomStyles'] = function () {
  return (_TRN_ReflowSetCustomStyles = Module['_TRN_ReflowSetCustomStyles'] = Module['asm']['jv']).apply(null, arguments);
});
var _TRN_ReflowSetIncludeBBoxForRecognizedZones = (Module['_TRN_ReflowSetIncludeBBoxForRecognizedZones'] = function () {
  return (_TRN_ReflowSetIncludeBBoxForRecognizedZones = Module['_TRN_ReflowSetIncludeBBoxForRecognizedZones'] = Module['asm']['kv']).apply(null, arguments);
});
var _TRN_ReflowDestroy = (Module['_TRN_ReflowDestroy'] = function () {
  return (_TRN_ReflowDestroy = Module['_TRN_ReflowDestroy'] = Module['asm']['lv']).apply(null, arguments);
});
var _TRN_ConvertFromXpsMem = (Module['_TRN_ConvertFromXpsMem'] = function () {
  return (_TRN_ConvertFromXpsMem = Module['_TRN_ConvertFromXpsMem'] = Module['asm']['mv']).apply(null, arguments);
});
var _TRN_ConvertCreateReflow = (Module['_TRN_ConvertCreateReflow'] = function () {
  return (_TRN_ConvertCreateReflow = Module['_TRN_ConvertCreateReflow'] = Module['asm']['nv']).apply(null, arguments);
});
var _TRN_ConvertFromText = (Module['_TRN_ConvertFromText'] = function () {
  return (_TRN_ConvertFromText = Module['_TRN_ConvertFromText'] = Module['asm']['ov']).apply(null, arguments);
});
var _TRN_ConvertToXps = (Module['_TRN_ConvertToXps'] = function () {
  return (_TRN_ConvertToXps = Module['_TRN_ConvertToXps'] = Module['asm']['pv']).apply(null, arguments);
});
var _TRN_ConvertFileToXps = (Module['_TRN_ConvertFileToXps'] = function () {
  return (_TRN_ConvertFileToXps = Module['_TRN_ConvertFileToXps'] = Module['asm']['qv']).apply(null, arguments);
});
var _TRN_ConvertFileToXod = (Module['_TRN_ConvertFileToXod'] = function () {
  return (_TRN_ConvertFileToXod = Module['_TRN_ConvertFileToXod'] = Module['asm']['rv']).apply(null, arguments);
});
var _TRN_ConvertToXod = (Module['_TRN_ConvertToXod'] = function () {
  return (_TRN_ConvertToXod = Module['_TRN_ConvertToXod'] = Module['asm']['sv']).apply(null, arguments);
});
var _TRN_ConversionMonitorNext = (Module['_TRN_ConversionMonitorNext'] = function () {
  return (_TRN_ConversionMonitorNext = Module['_TRN_ConversionMonitorNext'] = Module['asm']['tv']).apply(null, arguments);
});
var _TRN_ConversionMonitorReady = (Module['_TRN_ConversionMonitorReady'] = function () {
  return (_TRN_ConversionMonitorReady = Module['_TRN_ConversionMonitorReady'] = Module['asm']['uv']).apply(null, arguments);
});
var _TRN_ConversionMonitorProgress = (Module['_TRN_ConversionMonitorProgress'] = function () {
  return (_TRN_ConversionMonitorProgress = Module['_TRN_ConversionMonitorProgress'] = Module['asm']['vv']).apply(null, arguments);
});
var _TRN_ConversionMonitorFilter = (Module['_TRN_ConversionMonitorFilter'] = function () {
  return (_TRN_ConversionMonitorFilter = Module['_TRN_ConversionMonitorFilter'] = Module['asm']['wv']).apply(null, arguments);
});
var _TRN_ConversionMonitorDestroy = (Module['_TRN_ConversionMonitorDestroy'] = function () {
  return (_TRN_ConversionMonitorDestroy = Module['_TRN_ConversionMonitorDestroy'] = Module['asm']['xv']).apply(null, arguments);
});
var _TRN_ConvertOfficeToPdfWithFilter = (Module['_TRN_ConvertOfficeToPdfWithFilter'] = function () {
  return (_TRN_ConvertOfficeToPdfWithFilter = Module['_TRN_ConvertOfficeToPdfWithFilter'] = Module['asm']['yv']).apply(null, arguments);
});
var _TRN_ConvertToPdf = (Module['_TRN_ConvertToPdf'] = function () {
  return (_TRN_ConvertToPdf = Module['_TRN_ConvertToPdf'] = Module['asm']['zv']).apply(null, arguments);
});
var _TRN_ConvertFromTiff = (Module['_TRN_ConvertFromTiff'] = function () {
  return (_TRN_ConvertFromTiff = Module['_TRN_ConvertFromTiff'] = Module['asm']['Av']).apply(null, arguments);
});
var _TRN_ConvertPageToHtml = (Module['_TRN_ConvertPageToHtml'] = function () {
  return (_TRN_ConvertPageToHtml = Module['_TRN_ConvertPageToHtml'] = Module['asm']['Bv']).apply(null, arguments);
});
var _TRN_ConvertPageToHtmlZoned = (Module['_TRN_ConvertPageToHtmlZoned'] = function () {
  return (_TRN_ConvertPageToHtmlZoned = Module['_TRN_ConvertPageToHtmlZoned'] = Module['asm']['Cv']).apply(null, arguments);
});
var _TRN_ConvertFileToTiff = (Module['_TRN_ConvertFileToTiff'] = function () {
  return (_TRN_ConvertFileToTiff = Module['_TRN_ConvertFileToTiff'] = Module['asm']['Dv']).apply(null, arguments);
});
var _TRN_ConvertToTiff = (Module['_TRN_ConvertToTiff'] = function () {
  return (_TRN_ConvertToTiff = Module['_TRN_ConvertToTiff'] = Module['asm']['Ev']).apply(null, arguments);
});
var _TRN_DateInit = (Module['_TRN_DateInit'] = function () {
  return (_TRN_DateInit = Module['_TRN_DateInit'] = Module['asm']['Fv']).apply(null, arguments);
});
var _TRN_DateIsValid = (Module['_TRN_DateIsValid'] = function () {
  return (_TRN_DateIsValid = Module['_TRN_DateIsValid'] = Module['asm']['Gv']).apply(null, arguments);
});
var _TRN_DateAttach = (Module['_TRN_DateAttach'] = function () {
  return (_TRN_DateAttach = Module['_TRN_DateAttach'] = Module['asm']['Hv']).apply(null, arguments);
});
var _TRN_DateUpdate = (Module['_TRN_DateUpdate'] = function () {
  return (_TRN_DateUpdate = Module['_TRN_DateUpdate'] = Module['asm']['Iv']).apply(null, arguments);
});
var _TRN_DateSetCurrentTime = (Module['_TRN_DateSetCurrentTime'] = function () {
  return (_TRN_DateSetCurrentTime = Module['_TRN_DateSetCurrentTime'] = Module['asm']['Jv']).apply(null, arguments);
});
var _TRN_DestinationCreateXYZ = (Module['_TRN_DestinationCreateXYZ'] = function () {
  return (_TRN_DestinationCreateXYZ = Module['_TRN_DestinationCreateXYZ'] = Module['asm']['Kv']).apply(null, arguments);
});
var _TRN_DestinationCreateFit = (Module['_TRN_DestinationCreateFit'] = function () {
  return (_TRN_DestinationCreateFit = Module['_TRN_DestinationCreateFit'] = Module['asm']['Lv']).apply(null, arguments);
});
var _TRN_DestinationCreateFitH = (Module['_TRN_DestinationCreateFitH'] = function () {
  return (_TRN_DestinationCreateFitH = Module['_TRN_DestinationCreateFitH'] = Module['asm']['Mv']).apply(null, arguments);
});
var _TRN_DestinationCreateFitV = (Module['_TRN_DestinationCreateFitV'] = function () {
  return (_TRN_DestinationCreateFitV = Module['_TRN_DestinationCreateFitV'] = Module['asm']['Nv']).apply(null, arguments);
});
var _TRN_DestinationCreateFitR = (Module['_TRN_DestinationCreateFitR'] = function () {
  return (_TRN_DestinationCreateFitR = Module['_TRN_DestinationCreateFitR'] = Module['asm']['Ov']).apply(null, arguments);
});
var _TRN_DestinationCreateFitB = (Module['_TRN_DestinationCreateFitB'] = function () {
  return (_TRN_DestinationCreateFitB = Module['_TRN_DestinationCreateFitB'] = Module['asm']['Pv']).apply(null, arguments);
});
var _TRN_DestinationCreateFitBH = (Module['_TRN_DestinationCreateFitBH'] = function () {
  return (_TRN_DestinationCreateFitBH = Module['_TRN_DestinationCreateFitBH'] = Module['asm']['Qv']).apply(null, arguments);
});
var _TRN_DestinationCreateFitBV = (Module['_TRN_DestinationCreateFitBV'] = function () {
  return (_TRN_DestinationCreateFitBV = Module['_TRN_DestinationCreateFitBV'] = Module['asm']['Rv']).apply(null, arguments);
});
var _TRN_DestinationCreate = (Module['_TRN_DestinationCreate'] = function () {
  return (_TRN_DestinationCreate = Module['_TRN_DestinationCreate'] = Module['asm']['Sv']).apply(null, arguments);
});
var _TRN_DestinationCopy = (Module['_TRN_DestinationCopy'] = function () {
  return (_TRN_DestinationCopy = Module['_TRN_DestinationCopy'] = Module['asm']['Tv']).apply(null, arguments);
});
var _TRN_DestinationIsValid = (Module['_TRN_DestinationIsValid'] = function () {
  return (_TRN_DestinationIsValid = Module['_TRN_DestinationIsValid'] = Module['asm']['Uv']).apply(null, arguments);
});
var _TRN_DestinationGetFitType = (Module['_TRN_DestinationGetFitType'] = function () {
  return (_TRN_DestinationGetFitType = Module['_TRN_DestinationGetFitType'] = Module['asm']['Vv']).apply(null, arguments);
});
var _TRN_DestinationGetPage = (Module['_TRN_DestinationGetPage'] = function () {
  return (_TRN_DestinationGetPage = Module['_TRN_DestinationGetPage'] = Module['asm']['Wv']).apply(null, arguments);
});
var _TRN_DestinationSetPage = (Module['_TRN_DestinationSetPage'] = function () {
  return (_TRN_DestinationSetPage = Module['_TRN_DestinationSetPage'] = Module['asm']['Xv']).apply(null, arguments);
});
var _TRN_DestinationGetSDFObj = (Module['_TRN_DestinationGetSDFObj'] = function () {
  return (_TRN_DestinationGetSDFObj = Module['_TRN_DestinationGetSDFObj'] = Module['asm']['Yv']).apply(null, arguments);
});
var _TRN_DestinationGetExplicitDestObj = (Module['_TRN_DestinationGetExplicitDestObj'] = function () {
  return (_TRN_DestinationGetExplicitDestObj = Module['_TRN_DestinationGetExplicitDestObj'] = Module['asm']['Zv']).apply(null, arguments);
});
var _TRN_GStateGetTransform = (Module['_TRN_GStateGetTransform'] = function () {
  return (_TRN_GStateGetTransform = Module['_TRN_GStateGetTransform'] = Module['asm']['_v']).apply(null, arguments);
});
var _TRN_GStateGetStrokeColorSpace = (Module['_TRN_GStateGetStrokeColorSpace'] = function () {
  return (_TRN_GStateGetStrokeColorSpace = Module['_TRN_GStateGetStrokeColorSpace'] = Module['asm']['$v']).apply(null, arguments);
});
var _TRN_GStateGetFillColorSpace = (Module['_TRN_GStateGetFillColorSpace'] = function () {
  return (_TRN_GStateGetFillColorSpace = Module['_TRN_GStateGetFillColorSpace'] = Module['asm']['aw']).apply(null, arguments);
});
var _TRN_GStateGetStrokeColor = (Module['_TRN_GStateGetStrokeColor'] = function () {
  return (_TRN_GStateGetStrokeColor = Module['_TRN_GStateGetStrokeColor'] = Module['asm']['bw']).apply(null, arguments);
});
var _TRN_GStateGetStrokePattern = (Module['_TRN_GStateGetStrokePattern'] = function () {
  return (_TRN_GStateGetStrokePattern = Module['_TRN_GStateGetStrokePattern'] = Module['asm']['cw']).apply(null, arguments);
});
var _TRN_GStateGetFillColor = (Module['_TRN_GStateGetFillColor'] = function () {
  return (_TRN_GStateGetFillColor = Module['_TRN_GStateGetFillColor'] = Module['asm']['dw']).apply(null, arguments);
});
var _TRN_GStateGetFillPattern = (Module['_TRN_GStateGetFillPattern'] = function () {
  return (_TRN_GStateGetFillPattern = Module['_TRN_GStateGetFillPattern'] = Module['asm']['ew']).apply(null, arguments);
});
var _TRN_GStateGetFlatness = (Module['_TRN_GStateGetFlatness'] = function () {
  return (_TRN_GStateGetFlatness = Module['_TRN_GStateGetFlatness'] = Module['asm']['fw']).apply(null, arguments);
});
var _TRN_GStateGetLineCap = (Module['_TRN_GStateGetLineCap'] = function () {
  return (_TRN_GStateGetLineCap = Module['_TRN_GStateGetLineCap'] = Module['asm']['gw']).apply(null, arguments);
});
var _TRN_GStateGetLineJoin = (Module['_TRN_GStateGetLineJoin'] = function () {
  return (_TRN_GStateGetLineJoin = Module['_TRN_GStateGetLineJoin'] = Module['asm']['hw']).apply(null, arguments);
});
var _TRN_GStateGetLineWidth = (Module['_TRN_GStateGetLineWidth'] = function () {
  return (_TRN_GStateGetLineWidth = Module['_TRN_GStateGetLineWidth'] = Module['asm']['iw']).apply(null, arguments);
});
var _TRN_GStateGetMiterLimit = (Module['_TRN_GStateGetMiterLimit'] = function () {
  return (_TRN_GStateGetMiterLimit = Module['_TRN_GStateGetMiterLimit'] = Module['asm']['jw']).apply(null, arguments);
});
var _TRN_GStateGetPhase = (Module['_TRN_GStateGetPhase'] = function () {
  return (_TRN_GStateGetPhase = Module['_TRN_GStateGetPhase'] = Module['asm']['kw']).apply(null, arguments);
});
var _TRN_GStateGetCharSpacing = (Module['_TRN_GStateGetCharSpacing'] = function () {
  return (_TRN_GStateGetCharSpacing = Module['_TRN_GStateGetCharSpacing'] = Module['asm']['lw']).apply(null, arguments);
});
var _TRN_GStateGetWordSpacing = (Module['_TRN_GStateGetWordSpacing'] = function () {
  return (_TRN_GStateGetWordSpacing = Module['_TRN_GStateGetWordSpacing'] = Module['asm']['mw']).apply(null, arguments);
});
var _TRN_GStateGetHorizontalScale = (Module['_TRN_GStateGetHorizontalScale'] = function () {
  return (_TRN_GStateGetHorizontalScale = Module['_TRN_GStateGetHorizontalScale'] = Module['asm']['nw']).apply(null, arguments);
});
var _TRN_GStateGetLeading = (Module['_TRN_GStateGetLeading'] = function () {
  return (_TRN_GStateGetLeading = Module['_TRN_GStateGetLeading'] = Module['asm']['ow']).apply(null, arguments);
});
var _TRN_GStateGetFont = (Module['_TRN_GStateGetFont'] = function () {
  return (_TRN_GStateGetFont = Module['_TRN_GStateGetFont'] = Module['asm']['pw']).apply(null, arguments);
});
var _TRN_GStateGetFontSize = (Module['_TRN_GStateGetFontSize'] = function () {
  return (_TRN_GStateGetFontSize = Module['_TRN_GStateGetFontSize'] = Module['asm']['qw']).apply(null, arguments);
});
var _TRN_GStateGetTextRenderMode = (Module['_TRN_GStateGetTextRenderMode'] = function () {
  return (_TRN_GStateGetTextRenderMode = Module['_TRN_GStateGetTextRenderMode'] = Module['asm']['rw']).apply(null, arguments);
});
var _TRN_GStateGetTextRise = (Module['_TRN_GStateGetTextRise'] = function () {
  return (_TRN_GStateGetTextRise = Module['_TRN_GStateGetTextRise'] = Module['asm']['sw']).apply(null, arguments);
});
var _TRN_GStateIsTextKnockout = (Module['_TRN_GStateIsTextKnockout'] = function () {
  return (_TRN_GStateIsTextKnockout = Module['_TRN_GStateIsTextKnockout'] = Module['asm']['tw']).apply(null, arguments);
});
var _TRN_GStateGetRenderingIntent = (Module['_TRN_GStateGetRenderingIntent'] = function () {
  return (_TRN_GStateGetRenderingIntent = Module['_TRN_GStateGetRenderingIntent'] = Module['asm']['uw']).apply(null, arguments);
});
var _TRN_GStateGetRenderingIntentType = (Module['_TRN_GStateGetRenderingIntentType'] = function () {
  return (_TRN_GStateGetRenderingIntentType = Module['_TRN_GStateGetRenderingIntentType'] = Module['asm']['vw']).apply(null, arguments);
});
var _TRN_GStateGetBlendMode = (Module['_TRN_GStateGetBlendMode'] = function () {
  return (_TRN_GStateGetBlendMode = Module['_TRN_GStateGetBlendMode'] = Module['asm']['ww']).apply(null, arguments);
});
var _TRN_GStateGetFillOpacity = (Module['_TRN_GStateGetFillOpacity'] = function () {
  return (_TRN_GStateGetFillOpacity = Module['_TRN_GStateGetFillOpacity'] = Module['asm']['xw']).apply(null, arguments);
});
var _TRN_GStateGetStrokeOpacity = (Module['_TRN_GStateGetStrokeOpacity'] = function () {
  return (_TRN_GStateGetStrokeOpacity = Module['_TRN_GStateGetStrokeOpacity'] = Module['asm']['yw']).apply(null, arguments);
});
var _TRN_GStateGetAISFlag = (Module['_TRN_GStateGetAISFlag'] = function () {
  return (_TRN_GStateGetAISFlag = Module['_TRN_GStateGetAISFlag'] = Module['asm']['zw']).apply(null, arguments);
});
var _TRN_GStateGetSoftMask = (Module['_TRN_GStateGetSoftMask'] = function () {
  return (_TRN_GStateGetSoftMask = Module['_TRN_GStateGetSoftMask'] = Module['asm']['Aw']).apply(null, arguments);
});
var _TRN_GStateGetSoftMaskTransform = (Module['_TRN_GStateGetSoftMaskTransform'] = function () {
  return (_TRN_GStateGetSoftMaskTransform = Module['_TRN_GStateGetSoftMaskTransform'] = Module['asm']['Bw']).apply(null, arguments);
});
var _TRN_GStateGetStrokeOverprint = (Module['_TRN_GStateGetStrokeOverprint'] = function () {
  return (_TRN_GStateGetStrokeOverprint = Module['_TRN_GStateGetStrokeOverprint'] = Module['asm']['Cw']).apply(null, arguments);
});
var _TRN_GStateGetFillOverprint = (Module['_TRN_GStateGetFillOverprint'] = function () {
  return (_TRN_GStateGetFillOverprint = Module['_TRN_GStateGetFillOverprint'] = Module['asm']['Dw']).apply(null, arguments);
});
var _TRN_GStateGetOverprintMode = (Module['_TRN_GStateGetOverprintMode'] = function () {
  return (_TRN_GStateGetOverprintMode = Module['_TRN_GStateGetOverprintMode'] = Module['asm']['Ew']).apply(null, arguments);
});
var _TRN_GStateGetAutoStrokeAdjust = (Module['_TRN_GStateGetAutoStrokeAdjust'] = function () {
  return (_TRN_GStateGetAutoStrokeAdjust = Module['_TRN_GStateGetAutoStrokeAdjust'] = Module['asm']['Fw']).apply(null, arguments);
});
var _TRN_GStateGetSmoothnessTolerance = (Module['_TRN_GStateGetSmoothnessTolerance'] = function () {
  return (_TRN_GStateGetSmoothnessTolerance = Module['_TRN_GStateGetSmoothnessTolerance'] = Module['asm']['Gw']).apply(null, arguments);
});
var _TRN_GStateGetTransferFunct = (Module['_TRN_GStateGetTransferFunct'] = function () {
  return (_TRN_GStateGetTransferFunct = Module['_TRN_GStateGetTransferFunct'] = Module['asm']['Hw']).apply(null, arguments);
});
var _TRN_GStateGetBlackGenFunct = (Module['_TRN_GStateGetBlackGenFunct'] = function () {
  return (_TRN_GStateGetBlackGenFunct = Module['_TRN_GStateGetBlackGenFunct'] = Module['asm']['Iw']).apply(null, arguments);
});
var _TRN_GStateGetUCRFunct = (Module['_TRN_GStateGetUCRFunct'] = function () {
  return (_TRN_GStateGetUCRFunct = Module['_TRN_GStateGetUCRFunct'] = Module['asm']['Jw']).apply(null, arguments);
});
var _TRN_GStateGetHalftone = (Module['_TRN_GStateGetHalftone'] = function () {
  return (_TRN_GStateGetHalftone = Module['_TRN_GStateGetHalftone'] = Module['asm']['Kw']).apply(null, arguments);
});
var _TRN_GStateSetTransformMatrix = (Module['_TRN_GStateSetTransformMatrix'] = function () {
  return (_TRN_GStateSetTransformMatrix = Module['_TRN_GStateSetTransformMatrix'] = Module['asm']['Lw']).apply(null, arguments);
});
var _TRN_GStateSetTransform = (Module['_TRN_GStateSetTransform'] = function () {
  return (_TRN_GStateSetTransform = Module['_TRN_GStateSetTransform'] = Module['asm']['Mw']).apply(null, arguments);
});
var _TRN_GStateConcatMatrix = (Module['_TRN_GStateConcatMatrix'] = function () {
  return (_TRN_GStateConcatMatrix = Module['_TRN_GStateConcatMatrix'] = Module['asm']['Nw']).apply(null, arguments);
});
var _TRN_GStateConcat = (Module['_TRN_GStateConcat'] = function () {
  return (_TRN_GStateConcat = Module['_TRN_GStateConcat'] = Module['asm']['Ow']).apply(null, arguments);
});
var _TRN_GStateSetStrokeColorSpace = (Module['_TRN_GStateSetStrokeColorSpace'] = function () {
  return (_TRN_GStateSetStrokeColorSpace = Module['_TRN_GStateSetStrokeColorSpace'] = Module['asm']['Pw']).apply(null, arguments);
});
var _TRN_GStateSetFillColorSpace = (Module['_TRN_GStateSetFillColorSpace'] = function () {
  return (_TRN_GStateSetFillColorSpace = Module['_TRN_GStateSetFillColorSpace'] = Module['asm']['Qw']).apply(null, arguments);
});
var _TRN_GStateSetStrokeColorWithColorPt = (Module['_TRN_GStateSetStrokeColorWithColorPt'] = function () {
  return (_TRN_GStateSetStrokeColorWithColorPt = Module['_TRN_GStateSetStrokeColorWithColorPt'] = Module['asm']['Rw']).apply(null, arguments);
});
var _TRN_GStateSetStrokeColorWithPattern = (Module['_TRN_GStateSetStrokeColorWithPattern'] = function () {
  return (_TRN_GStateSetStrokeColorWithPattern = Module['_TRN_GStateSetStrokeColorWithPattern'] = Module['asm']['Sw']).apply(null, arguments);
});
var _TRN_GStateSetStrokeColor = (Module['_TRN_GStateSetStrokeColor'] = function () {
  return (_TRN_GStateSetStrokeColor = Module['_TRN_GStateSetStrokeColor'] = Module['asm']['Tw']).apply(null, arguments);
});
var _TRN_GStateSetFillColorWithColorPt = (Module['_TRN_GStateSetFillColorWithColorPt'] = function () {
  return (_TRN_GStateSetFillColorWithColorPt = Module['_TRN_GStateSetFillColorWithColorPt'] = Module['asm']['Uw']).apply(null, arguments);
});
var _TRN_GStateSetFillColorWithPattern = (Module['_TRN_GStateSetFillColorWithPattern'] = function () {
  return (_TRN_GStateSetFillColorWithPattern = Module['_TRN_GStateSetFillColorWithPattern'] = Module['asm']['Vw']).apply(null, arguments);
});
var _TRN_GStateSetFillColor = (Module['_TRN_GStateSetFillColor'] = function () {
  return (_TRN_GStateSetFillColor = Module['_TRN_GStateSetFillColor'] = Module['asm']['Ww']).apply(null, arguments);
});
var _TRN_GStateSetFlatness = (Module['_TRN_GStateSetFlatness'] = function () {
  return (_TRN_GStateSetFlatness = Module['_TRN_GStateSetFlatness'] = Module['asm']['Xw']).apply(null, arguments);
});
var _TRN_GStateSetLineCap = (Module['_TRN_GStateSetLineCap'] = function () {
  return (_TRN_GStateSetLineCap = Module['_TRN_GStateSetLineCap'] = Module['asm']['Yw']).apply(null, arguments);
});
var _TRN_GStateSetLineJoin = (Module['_TRN_GStateSetLineJoin'] = function () {
  return (_TRN_GStateSetLineJoin = Module['_TRN_GStateSetLineJoin'] = Module['asm']['Zw']).apply(null, arguments);
});
var _TRN_GStateSetLineWidth = (Module['_TRN_GStateSetLineWidth'] = function () {
  return (_TRN_GStateSetLineWidth = Module['_TRN_GStateSetLineWidth'] = Module['asm']['_w']).apply(null, arguments);
});
var _TRN_GStateSetMiterLimit = (Module['_TRN_GStateSetMiterLimit'] = function () {
  return (_TRN_GStateSetMiterLimit = Module['_TRN_GStateSetMiterLimit'] = Module['asm']['$w']).apply(null, arguments);
});
var _TRN_GStateSetDashPattern = (Module['_TRN_GStateSetDashPattern'] = function () {
  return (_TRN_GStateSetDashPattern = Module['_TRN_GStateSetDashPattern'] = Module['asm']['ax']).apply(null, arguments);
});
var _TRN_GStateSetCharSpacing = (Module['_TRN_GStateSetCharSpacing'] = function () {
  return (_TRN_GStateSetCharSpacing = Module['_TRN_GStateSetCharSpacing'] = Module['asm']['bx']).apply(null, arguments);
});
var _TRN_GStateSetWordSpacing = (Module['_TRN_GStateSetWordSpacing'] = function () {
  return (_TRN_GStateSetWordSpacing = Module['_TRN_GStateSetWordSpacing'] = Module['asm']['cx']).apply(null, arguments);
});
var _TRN_GStateSetHorizontalScale = (Module['_TRN_GStateSetHorizontalScale'] = function () {
  return (_TRN_GStateSetHorizontalScale = Module['_TRN_GStateSetHorizontalScale'] = Module['asm']['dx']).apply(null, arguments);
});
var _TRN_GStateSetLeading = (Module['_TRN_GStateSetLeading'] = function () {
  return (_TRN_GStateSetLeading = Module['_TRN_GStateSetLeading'] = Module['asm']['ex']).apply(null, arguments);
});
var _TRN_GStateSetFont = (Module['_TRN_GStateSetFont'] = function () {
  return (_TRN_GStateSetFont = Module['_TRN_GStateSetFont'] = Module['asm']['fx']).apply(null, arguments);
});
var _TRN_GStateSetTextRenderMode = (Module['_TRN_GStateSetTextRenderMode'] = function () {
  return (_TRN_GStateSetTextRenderMode = Module['_TRN_GStateSetTextRenderMode'] = Module['asm']['gx']).apply(null, arguments);
});
var _TRN_GStateSetTextRise = (Module['_TRN_GStateSetTextRise'] = function () {
  return (_TRN_GStateSetTextRise = Module['_TRN_GStateSetTextRise'] = Module['asm']['hx']).apply(null, arguments);
});
var _TRN_GStateSetTextKnockout = (Module['_TRN_GStateSetTextKnockout'] = function () {
  return (_TRN_GStateSetTextKnockout = Module['_TRN_GStateSetTextKnockout'] = Module['asm']['ix']).apply(null, arguments);
});
var _TRN_GStateSetRenderingIntent = (Module['_TRN_GStateSetRenderingIntent'] = function () {
  return (_TRN_GStateSetRenderingIntent = Module['_TRN_GStateSetRenderingIntent'] = Module['asm']['jx']).apply(null, arguments);
});
var _TRN_GStateSetBlendMode = (Module['_TRN_GStateSetBlendMode'] = function () {
  return (_TRN_GStateSetBlendMode = Module['_TRN_GStateSetBlendMode'] = Module['asm']['kx']).apply(null, arguments);
});
var _TRN_GStateSetFillOpacity = (Module['_TRN_GStateSetFillOpacity'] = function () {
  return (_TRN_GStateSetFillOpacity = Module['_TRN_GStateSetFillOpacity'] = Module['asm']['lx']).apply(null, arguments);
});
var _TRN_GStateSetStrokeOpacity = (Module['_TRN_GStateSetStrokeOpacity'] = function () {
  return (_TRN_GStateSetStrokeOpacity = Module['_TRN_GStateSetStrokeOpacity'] = Module['asm']['mx']).apply(null, arguments);
});
var _TRN_GStateSetAISFlag = (Module['_TRN_GStateSetAISFlag'] = function () {
  return (_TRN_GStateSetAISFlag = Module['_TRN_GStateSetAISFlag'] = Module['asm']['nx']).apply(null, arguments);
});
var _TRN_GStateSetSoftMask = (Module['_TRN_GStateSetSoftMask'] = function () {
  return (_TRN_GStateSetSoftMask = Module['_TRN_GStateSetSoftMask'] = Module['asm']['ox']).apply(null, arguments);
});
var _TRN_GStateSetStrokeOverprint = (Module['_TRN_GStateSetStrokeOverprint'] = function () {
  return (_TRN_GStateSetStrokeOverprint = Module['_TRN_GStateSetStrokeOverprint'] = Module['asm']['px']).apply(null, arguments);
});
var _TRN_GStateSetFillOverprint = (Module['_TRN_GStateSetFillOverprint'] = function () {
  return (_TRN_GStateSetFillOverprint = Module['_TRN_GStateSetFillOverprint'] = Module['asm']['qx']).apply(null, arguments);
});
var _TRN_GStateSetOverprintMode = (Module['_TRN_GStateSetOverprintMode'] = function () {
  return (_TRN_GStateSetOverprintMode = Module['_TRN_GStateSetOverprintMode'] = Module['asm']['rx']).apply(null, arguments);
});
var _TRN_GStateSetAutoStrokeAdjust = (Module['_TRN_GStateSetAutoStrokeAdjust'] = function () {
  return (_TRN_GStateSetAutoStrokeAdjust = Module['_TRN_GStateSetAutoStrokeAdjust'] = Module['asm']['sx']).apply(null, arguments);
});
var _TRN_GStateSetSmoothnessTolerance = (Module['_TRN_GStateSetSmoothnessTolerance'] = function () {
  return (_TRN_GStateSetSmoothnessTolerance = Module['_TRN_GStateSetSmoothnessTolerance'] = Module['asm']['tx']).apply(null, arguments);
});
var _TRN_GStateSetBlackGenFunct = (Module['_TRN_GStateSetBlackGenFunct'] = function () {
  return (_TRN_GStateSetBlackGenFunct = Module['_TRN_GStateSetBlackGenFunct'] = Module['asm']['ux']).apply(null, arguments);
});
var _TRN_GStateSetUCRFunct = (Module['_TRN_GStateSetUCRFunct'] = function () {
  return (_TRN_GStateSetUCRFunct = Module['_TRN_GStateSetUCRFunct'] = Module['asm']['vx']).apply(null, arguments);
});
var _TRN_GStateSetTransferFunct = (Module['_TRN_GStateSetTransferFunct'] = function () {
  return (_TRN_GStateSetTransferFunct = Module['_TRN_GStateSetTransferFunct'] = Module['asm']['wx']).apply(null, arguments);
});
var _TRN_GStateSetHalftone = (Module['_TRN_GStateSetHalftone'] = function () {
  return (_TRN_GStateSetHalftone = Module['_TRN_GStateSetHalftone'] = Module['asm']['xx']).apply(null, arguments);
});
var _TRN_ElementGetType = (Module['_TRN_ElementGetType'] = function () {
  return (_TRN_ElementGetType = Module['_TRN_ElementGetType'] = Module['asm']['yx']).apply(null, arguments);
});
var _TRN_ElementGetGState = (Module['_TRN_ElementGetGState'] = function () {
  return (_TRN_ElementGetGState = Module['_TRN_ElementGetGState'] = Module['asm']['zx']).apply(null, arguments);
});
var _TRN_ElementGetCTM = (Module['_TRN_ElementGetCTM'] = function () {
  return (_TRN_ElementGetCTM = Module['_TRN_ElementGetCTM'] = Module['asm']['Ax']).apply(null, arguments);
});
var _TRN_ElementGetParentStructElement = (Module['_TRN_ElementGetParentStructElement'] = function () {
  return (_TRN_ElementGetParentStructElement = Module['_TRN_ElementGetParentStructElement'] = Module['asm']['Bx']).apply(null, arguments);
});
var _TRN_ElementGetStructMCID = (Module['_TRN_ElementGetStructMCID'] = function () {
  return (_TRN_ElementGetStructMCID = Module['_TRN_ElementGetStructMCID'] = Module['asm']['Cx']).apply(null, arguments);
});
var _TRN_ElementIsOCVisible = (Module['_TRN_ElementIsOCVisible'] = function () {
  return (_TRN_ElementIsOCVisible = Module['_TRN_ElementIsOCVisible'] = Module['asm']['Dx']).apply(null, arguments);
});
var _TRN_ElementIsClippingPath = (Module['_TRN_ElementIsClippingPath'] = function () {
  return (_TRN_ElementIsClippingPath = Module['_TRN_ElementIsClippingPath'] = Module['asm']['Ex']).apply(null, arguments);
});
var _TRN_ElementIsStroked = (Module['_TRN_ElementIsStroked'] = function () {
  return (_TRN_ElementIsStroked = Module['_TRN_ElementIsStroked'] = Module['asm']['Fx']).apply(null, arguments);
});
var _TRN_ElementIsFilled = (Module['_TRN_ElementIsFilled'] = function () {
  return (_TRN_ElementIsFilled = Module['_TRN_ElementIsFilled'] = Module['asm']['Gx']).apply(null, arguments);
});
var _TRN_ElementIsWindingFill = (Module['_TRN_ElementIsWindingFill'] = function () {
  return (_TRN_ElementIsWindingFill = Module['_TRN_ElementIsWindingFill'] = Module['asm']['Hx']).apply(null, arguments);
});
var _TRN_ElementIsClipWindingFill = (Module['_TRN_ElementIsClipWindingFill'] = function () {
  return (_TRN_ElementIsClipWindingFill = Module['_TRN_ElementIsClipWindingFill'] = Module['asm']['Ix']).apply(null, arguments);
});
var _TRN_ElementSetPathClip = (Module['_TRN_ElementSetPathClip'] = function () {
  return (_TRN_ElementSetPathClip = Module['_TRN_ElementSetPathClip'] = Module['asm']['Jx']).apply(null, arguments);
});
var _TRN_ElementSetPathStroke = (Module['_TRN_ElementSetPathStroke'] = function () {
  return (_TRN_ElementSetPathStroke = Module['_TRN_ElementSetPathStroke'] = Module['asm']['Kx']).apply(null, arguments);
});
var _TRN_ElementSetPathFill = (Module['_TRN_ElementSetPathFill'] = function () {
  return (_TRN_ElementSetPathFill = Module['_TRN_ElementSetPathFill'] = Module['asm']['Lx']).apply(null, arguments);
});
var _TRN_ElementSetWindingFill = (Module['_TRN_ElementSetWindingFill'] = function () {
  return (_TRN_ElementSetWindingFill = Module['_TRN_ElementSetWindingFill'] = Module['asm']['Mx']).apply(null, arguments);
});
var _TRN_ElementSetClipWindingFill = (Module['_TRN_ElementSetClipWindingFill'] = function () {
  return (_TRN_ElementSetClipWindingFill = Module['_TRN_ElementSetClipWindingFill'] = Module['asm']['Nx']).apply(null, arguments);
});
var _TRN_ElementSetPathTypes = (Module['_TRN_ElementSetPathTypes'] = function () {
  return (_TRN_ElementSetPathTypes = Module['_TRN_ElementSetPathTypes'] = Module['asm']['Ox']).apply(null, arguments);
});
var _TRN_ElementGetXObject = (Module['_TRN_ElementGetXObject'] = function () {
  return (_TRN_ElementGetXObject = Module['_TRN_ElementGetXObject'] = Module['asm']['Px']).apply(null, arguments);
});
var _TRN_ElementGetImageData = (Module['_TRN_ElementGetImageData'] = function () {
  return (_TRN_ElementGetImageData = Module['_TRN_ElementGetImageData'] = Module['asm']['Qx']).apply(null, arguments);
});
var _TRN_ElementGetImageDataSize = (Module['_TRN_ElementGetImageDataSize'] = function () {
  return (_TRN_ElementGetImageDataSize = Module['_TRN_ElementGetImageDataSize'] = Module['asm']['Rx']).apply(null, arguments);
});
var _TRN_ElementGetImageColorSpace = (Module['_TRN_ElementGetImageColorSpace'] = function () {
  return (_TRN_ElementGetImageColorSpace = Module['_TRN_ElementGetImageColorSpace'] = Module['asm']['Sx']).apply(null, arguments);
});
var _TRN_ElementGetImageWidth = (Module['_TRN_ElementGetImageWidth'] = function () {
  return (_TRN_ElementGetImageWidth = Module['_TRN_ElementGetImageWidth'] = Module['asm']['Tx']).apply(null, arguments);
});
var _TRN_ElementGetImageHeight = (Module['_TRN_ElementGetImageHeight'] = function () {
  return (_TRN_ElementGetImageHeight = Module['_TRN_ElementGetImageHeight'] = Module['asm']['Ux']).apply(null, arguments);
});
var _TRN_ElementGetDecodeArray = (Module['_TRN_ElementGetDecodeArray'] = function () {
  return (_TRN_ElementGetDecodeArray = Module['_TRN_ElementGetDecodeArray'] = Module['asm']['Vx']).apply(null, arguments);
});
var _TRN_ElementGetBitsPerComponent = (Module['_TRN_ElementGetBitsPerComponent'] = function () {
  return (_TRN_ElementGetBitsPerComponent = Module['_TRN_ElementGetBitsPerComponent'] = Module['asm']['Wx']).apply(null, arguments);
});
var _TRN_ElementGetComponentNum = (Module['_TRN_ElementGetComponentNum'] = function () {
  return (_TRN_ElementGetComponentNum = Module['_TRN_ElementGetComponentNum'] = Module['asm']['Xx']).apply(null, arguments);
});
var _TRN_ElementIsImageMask = (Module['_TRN_ElementIsImageMask'] = function () {
  return (_TRN_ElementIsImageMask = Module['_TRN_ElementIsImageMask'] = Module['asm']['Yx']).apply(null, arguments);
});
var _TRN_ElementIsImageInterpolate = (Module['_TRN_ElementIsImageInterpolate'] = function () {
  return (_TRN_ElementIsImageInterpolate = Module['_TRN_ElementIsImageInterpolate'] = Module['asm']['Zx']).apply(null, arguments);
});
var _TRN_ElementGetMask = (Module['_TRN_ElementGetMask'] = function () {
  return (_TRN_ElementGetMask = Module['_TRN_ElementGetMask'] = Module['asm']['_x']).apply(null, arguments);
});
var _TRN_ElementGetImageRenderingIntent = (Module['_TRN_ElementGetImageRenderingIntent'] = function () {
  return (_TRN_ElementGetImageRenderingIntent = Module['_TRN_ElementGetImageRenderingIntent'] = Module['asm']['$x']).apply(null, arguments);
});
var _TRN_ElementGetTextString = (Module['_TRN_ElementGetTextString'] = function () {
  return (_TRN_ElementGetTextString = Module['_TRN_ElementGetTextString'] = Module['asm']['ay']).apply(null, arguments);
});
var _TRN_ElementGetTextMatrix = (Module['_TRN_ElementGetTextMatrix'] = function () {
  return (_TRN_ElementGetTextMatrix = Module['_TRN_ElementGetTextMatrix'] = Module['asm']['by']).apply(null, arguments);
});
var _TRN_ElementGetCharIterator = (Module['_TRN_ElementGetCharIterator'] = function () {
  return (_TRN_ElementGetCharIterator = Module['_TRN_ElementGetCharIterator'] = Module['asm']['cy']).apply(null, arguments);
});
var _TRN_ElementGetTextLength = (Module['_TRN_ElementGetTextLength'] = function () {
  return (_TRN_ElementGetTextLength = Module['_TRN_ElementGetTextLength'] = Module['asm']['dy']).apply(null, arguments);
});
var _TRN_ElementGetPosAdjustment = (Module['_TRN_ElementGetPosAdjustment'] = function () {
  return (_TRN_ElementGetPosAdjustment = Module['_TRN_ElementGetPosAdjustment'] = Module['asm']['ey']).apply(null, arguments);
});
var _TRN_ElementGetNewTextLineOffset = (Module['_TRN_ElementGetNewTextLineOffset'] = function () {
  return (_TRN_ElementGetNewTextLineOffset = Module['_TRN_ElementGetNewTextLineOffset'] = Module['asm']['fy']).apply(null, arguments);
});
var _TRN_ElementHasTextMatrix = (Module['_TRN_ElementHasTextMatrix'] = function () {
  return (_TRN_ElementHasTextMatrix = Module['_TRN_ElementHasTextMatrix'] = Module['asm']['gy']).apply(null, arguments);
});
var _TRN_ElementSetTextData = (Module['_TRN_ElementSetTextData'] = function () {
  return (_TRN_ElementSetTextData = Module['_TRN_ElementSetTextData'] = Module['asm']['hy']).apply(null, arguments);
});
var _TRN_ElementSetTextMatrix = (Module['_TRN_ElementSetTextMatrix'] = function () {
  return (_TRN_ElementSetTextMatrix = Module['_TRN_ElementSetTextMatrix'] = Module['asm']['iy']).apply(null, arguments);
});
var _TRN_ElementSetTextMatrixEntries = (Module['_TRN_ElementSetTextMatrixEntries'] = function () {
  return (_TRN_ElementSetTextMatrixEntries = Module['_TRN_ElementSetTextMatrixEntries'] = Module['asm']['jy']).apply(null, arguments);
});
var _TRN_ElementSetPosAdjustment = (Module['_TRN_ElementSetPosAdjustment'] = function () {
  return (_TRN_ElementSetPosAdjustment = Module['_TRN_ElementSetPosAdjustment'] = Module['asm']['ky']).apply(null, arguments);
});
var _TRN_ElementUpdateTextMetrics = (Module['_TRN_ElementUpdateTextMetrics'] = function () {
  return (_TRN_ElementUpdateTextMetrics = Module['_TRN_ElementUpdateTextMetrics'] = Module['asm']['ly']).apply(null, arguments);
});
var _TRN_ElementSetNewTextLineOffset = (Module['_TRN_ElementSetNewTextLineOffset'] = function () {
  return (_TRN_ElementSetNewTextLineOffset = Module['_TRN_ElementSetNewTextLineOffset'] = Module['asm']['my']).apply(null, arguments);
});
var _TRN_ElementGetShading = (Module['_TRN_ElementGetShading'] = function () {
  return (_TRN_ElementGetShading = Module['_TRN_ElementGetShading'] = Module['asm']['ny']).apply(null, arguments);
});
var _TRN_ElementGetMCPropertyDict = (Module['_TRN_ElementGetMCPropertyDict'] = function () {
  return (_TRN_ElementGetMCPropertyDict = Module['_TRN_ElementGetMCPropertyDict'] = Module['asm']['oy']).apply(null, arguments);
});
var _TRN_ElementGetMCTag = (Module['_TRN_ElementGetMCTag'] = function () {
  return (_TRN_ElementGetMCTag = Module['_TRN_ElementGetMCTag'] = Module['asm']['py']).apply(null, arguments);
});
var _TRN_ShapedTextGetScale = (Module['_TRN_ShapedTextGetScale'] = function () {
  return (_TRN_ShapedTextGetScale = Module['_TRN_ShapedTextGetScale'] = Module['asm']['qy']).apply(null, arguments);
});
var _TRN_ShapedTextGetShapingStatus = (Module['_TRN_ShapedTextGetShapingStatus'] = function () {
  return (_TRN_ShapedTextGetShapingStatus = Module['_TRN_ShapedTextGetShapingStatus'] = Module['asm']['ry']).apply(null, arguments);
});
var _TRN_ShapedTextGetFailureReason = (Module['_TRN_ShapedTextGetFailureReason'] = function () {
  return (_TRN_ShapedTextGetFailureReason = Module['_TRN_ShapedTextGetFailureReason'] = Module['asm']['sy']).apply(null, arguments);
});
var _TRN_ShapedTextGetText = (Module['_TRN_ShapedTextGetText'] = function () {
  return (_TRN_ShapedTextGetText = Module['_TRN_ShapedTextGetText'] = Module['asm']['ty']).apply(null, arguments);
});
var _TRN_ShapedTextGetNumGlyphs = (Module['_TRN_ShapedTextGetNumGlyphs'] = function () {
  return (_TRN_ShapedTextGetNumGlyphs = Module['_TRN_ShapedTextGetNumGlyphs'] = Module['asm']['uy']).apply(null, arguments);
});
var _TRN_ShapedTextGetGlyph = (Module['_TRN_ShapedTextGetGlyph'] = function () {
  return (_TRN_ShapedTextGetGlyph = Module['_TRN_ShapedTextGetGlyph'] = Module['asm']['vy']).apply(null, arguments);
});
var _TRN_ShapedTextGetGlyphXPos = (Module['_TRN_ShapedTextGetGlyphXPos'] = function () {
  return (_TRN_ShapedTextGetGlyphXPos = Module['_TRN_ShapedTextGetGlyphXPos'] = Module['asm']['wy']).apply(null, arguments);
});
var _TRN_ShapedTextGetGlyphYPos = (Module['_TRN_ShapedTextGetGlyphYPos'] = function () {
  return (_TRN_ShapedTextGetGlyphYPos = Module['_TRN_ShapedTextGetGlyphYPos'] = Module['asm']['xy']).apply(null, arguments);
});
var _TRN_ShapedTextDestroy = (Module['_TRN_ShapedTextDestroy'] = function () {
  return (_TRN_ShapedTextDestroy = Module['_TRN_ShapedTextDestroy'] = Module['asm']['yy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreate = (Module['_TRN_ElementBuilderCreate'] = function () {
  return (_TRN_ElementBuilderCreate = Module['_TRN_ElementBuilderCreate'] = Module['asm']['zy']).apply(null, arguments);
});
var _TRN_ElementBuilderDestroy = (Module['_TRN_ElementBuilderDestroy'] = function () {
  return (_TRN_ElementBuilderDestroy = Module['_TRN_ElementBuilderDestroy'] = Module['asm']['Ay']).apply(null, arguments);
});
var _TRN_ElementBuilderReset = (Module['_TRN_ElementBuilderReset'] = function () {
  return (_TRN_ElementBuilderReset = Module['_TRN_ElementBuilderReset'] = Module['asm']['By']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateImage = (Module['_TRN_ElementBuilderCreateImage'] = function () {
  return (_TRN_ElementBuilderCreateImage = Module['_TRN_ElementBuilderCreateImage'] = Module['asm']['Cy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateImageFromMatrix = (Module['_TRN_ElementBuilderCreateImageFromMatrix'] = function () {
  return (_TRN_ElementBuilderCreateImageFromMatrix = Module['_TRN_ElementBuilderCreateImageFromMatrix'] = Module['asm']['Dy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateImageScaled = (Module['_TRN_ElementBuilderCreateImageScaled'] = function () {
  return (_TRN_ElementBuilderCreateImageScaled = Module['_TRN_ElementBuilderCreateImageScaled'] = Module['asm']['Ey']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateGroupBegin = (Module['_TRN_ElementBuilderCreateGroupBegin'] = function () {
  return (_TRN_ElementBuilderCreateGroupBegin = Module['_TRN_ElementBuilderCreateGroupBegin'] = Module['asm']['Fy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateGroupEnd = (Module['_TRN_ElementBuilderCreateGroupEnd'] = function () {
  return (_TRN_ElementBuilderCreateGroupEnd = Module['_TRN_ElementBuilderCreateGroupEnd'] = Module['asm']['Gy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateShading = (Module['_TRN_ElementBuilderCreateShading'] = function () {
  return (_TRN_ElementBuilderCreateShading = Module['_TRN_ElementBuilderCreateShading'] = Module['asm']['Hy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateFormFromStream = (Module['_TRN_ElementBuilderCreateFormFromStream'] = function () {
  return (_TRN_ElementBuilderCreateFormFromStream = Module['_TRN_ElementBuilderCreateFormFromStream'] = Module['asm']['Iy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateFormFromPage = (Module['_TRN_ElementBuilderCreateFormFromPage'] = function () {
  return (_TRN_ElementBuilderCreateFormFromPage = Module['_TRN_ElementBuilderCreateFormFromPage'] = Module['asm']['Jy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateFormFromDoc = (Module['_TRN_ElementBuilderCreateFormFromDoc'] = function () {
  return (_TRN_ElementBuilderCreateFormFromDoc = Module['_TRN_ElementBuilderCreateFormFromDoc'] = Module['asm']['Ky']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextBeginWithFont = (Module['_TRN_ElementBuilderCreateTextBeginWithFont'] = function () {
  return (_TRN_ElementBuilderCreateTextBeginWithFont = Module['_TRN_ElementBuilderCreateTextBeginWithFont'] = Module['asm']['Ly']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextBegin = (Module['_TRN_ElementBuilderCreateTextBegin'] = function () {
  return (_TRN_ElementBuilderCreateTextBegin = Module['_TRN_ElementBuilderCreateTextBegin'] = Module['asm']['My']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextEnd = (Module['_TRN_ElementBuilderCreateTextEnd'] = function () {
  return (_TRN_ElementBuilderCreateTextEnd = Module['_TRN_ElementBuilderCreateTextEnd'] = Module['asm']['Ny']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextRun = (Module['_TRN_ElementBuilderCreateTextRun'] = function () {
  return (_TRN_ElementBuilderCreateTextRun = Module['_TRN_ElementBuilderCreateTextRun'] = Module['asm']['Oy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextRunUnsigned = (Module['_TRN_ElementBuilderCreateTextRunUnsigned'] = function () {
  return (_TRN_ElementBuilderCreateTextRunUnsigned = Module['_TRN_ElementBuilderCreateTextRunUnsigned'] = Module['asm']['Py']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateNewTextRun = (Module['_TRN_ElementBuilderCreateNewTextRun'] = function () {
  return (_TRN_ElementBuilderCreateNewTextRun = Module['_TRN_ElementBuilderCreateNewTextRun'] = Module['asm']['Qy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateNewTextRunUnsigned = (Module['_TRN_ElementBuilderCreateNewTextRunUnsigned'] = function () {
  return (_TRN_ElementBuilderCreateNewTextRunUnsigned = Module['_TRN_ElementBuilderCreateNewTextRunUnsigned'] = Module['asm']['Ry']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateShapedTextRun = (Module['_TRN_ElementBuilderCreateShapedTextRun'] = function () {
  return (_TRN_ElementBuilderCreateShapedTextRun = Module['_TRN_ElementBuilderCreateShapedTextRun'] = Module['asm']['Sy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextNewLineWithOffset = (Module['_TRN_ElementBuilderCreateTextNewLineWithOffset'] = function () {
  return (_TRN_ElementBuilderCreateTextNewLineWithOffset = Module['_TRN_ElementBuilderCreateTextNewLineWithOffset'] = Module['asm']['Ty']).apply(
    null,
    arguments,
  );
});
var _TRN_ElementBuilderCreateTextNewLine = (Module['_TRN_ElementBuilderCreateTextNewLine'] = function () {
  return (_TRN_ElementBuilderCreateTextNewLine = Module['_TRN_ElementBuilderCreateTextNewLine'] = Module['asm']['Uy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreatePath = (Module['_TRN_ElementBuilderCreatePath'] = function () {
  return (_TRN_ElementBuilderCreatePath = Module['_TRN_ElementBuilderCreatePath'] = Module['asm']['Vy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateRect = (Module['_TRN_ElementBuilderCreateRect'] = function () {
  return (_TRN_ElementBuilderCreateRect = Module['_TRN_ElementBuilderCreateRect'] = Module['asm']['Wy']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateEllipse = (Module['_TRN_ElementBuilderCreateEllipse'] = function () {
  return (_TRN_ElementBuilderCreateEllipse = Module['_TRN_ElementBuilderCreateEllipse'] = Module['asm']['Xy']).apply(null, arguments);
});
var _TRN_ElementBuilderPathBegin = (Module['_TRN_ElementBuilderPathBegin'] = function () {
  return (_TRN_ElementBuilderPathBegin = Module['_TRN_ElementBuilderPathBegin'] = Module['asm']['Yy']).apply(null, arguments);
});
var _TRN_ElementBuilderPathEnd = (Module['_TRN_ElementBuilderPathEnd'] = function () {
  return (_TRN_ElementBuilderPathEnd = Module['_TRN_ElementBuilderPathEnd'] = Module['asm']['Zy']).apply(null, arguments);
});
var _TRN_ElementBuilderRect = (Module['_TRN_ElementBuilderRect'] = function () {
  return (_TRN_ElementBuilderRect = Module['_TRN_ElementBuilderRect'] = Module['asm']['_y']).apply(null, arguments);
});
var _TRN_ElementBuilderEllipse = (Module['_TRN_ElementBuilderEllipse'] = function () {
  return (_TRN_ElementBuilderEllipse = Module['_TRN_ElementBuilderEllipse'] = Module['asm']['$y']).apply(null, arguments);
});
var _TRN_ElementBuilderMoveTo = (Module['_TRN_ElementBuilderMoveTo'] = function () {
  return (_TRN_ElementBuilderMoveTo = Module['_TRN_ElementBuilderMoveTo'] = Module['asm']['az']).apply(null, arguments);
});
var _TRN_ElementBuilderLineTo = (Module['_TRN_ElementBuilderLineTo'] = function () {
  return (_TRN_ElementBuilderLineTo = Module['_TRN_ElementBuilderLineTo'] = Module['asm']['bz']).apply(null, arguments);
});
var _TRN_ElementBuilderCurveTo = (Module['_TRN_ElementBuilderCurveTo'] = function () {
  return (_TRN_ElementBuilderCurveTo = Module['_TRN_ElementBuilderCurveTo'] = Module['asm']['cz']).apply(null, arguments);
});
var _TRN_ElementBuilderArcTo = (Module['_TRN_ElementBuilderArcTo'] = function () {
  return (_TRN_ElementBuilderArcTo = Module['_TRN_ElementBuilderArcTo'] = Module['asm']['dz']).apply(null, arguments);
});
var _TRN_ElementBuilderArcTo2 = (Module['_TRN_ElementBuilderArcTo2'] = function () {
  return (_TRN_ElementBuilderArcTo2 = Module['_TRN_ElementBuilderArcTo2'] = Module['asm']['ez']).apply(null, arguments);
});
var _TRN_ElementBuilderClosePath = (Module['_TRN_ElementBuilderClosePath'] = function () {
  return (_TRN_ElementBuilderClosePath = Module['_TRN_ElementBuilderClosePath'] = Module['asm']['fz']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateMarkedContentBeginInlineProperties = (Module['_TRN_ElementBuilderCreateMarkedContentBeginInlineProperties'] = function () {
  return (_TRN_ElementBuilderCreateMarkedContentBeginInlineProperties = Module['_TRN_ElementBuilderCreateMarkedContentBeginInlineProperties'] =
    Module['asm']['gz']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateMarkedContentBegin = (Module['_TRN_ElementBuilderCreateMarkedContentBegin'] = function () {
  return (_TRN_ElementBuilderCreateMarkedContentBegin = Module['_TRN_ElementBuilderCreateMarkedContentBegin'] = Module['asm']['hz']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateMarkedContentEnd = (Module['_TRN_ElementBuilderCreateMarkedContentEnd'] = function () {
  return (_TRN_ElementBuilderCreateMarkedContentEnd = Module['_TRN_ElementBuilderCreateMarkedContentEnd'] = Module['asm']['iz']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateMarkedContentPointInlineProperties = (Module['_TRN_ElementBuilderCreateMarkedContentPointInlineProperties'] = function () {
  return (_TRN_ElementBuilderCreateMarkedContentPointInlineProperties = Module['_TRN_ElementBuilderCreateMarkedContentPointInlineProperties'] =
    Module['asm']['jz']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateMarkedContentPoint = (Module['_TRN_ElementBuilderCreateMarkedContentPoint'] = function () {
  return (_TRN_ElementBuilderCreateMarkedContentPoint = Module['_TRN_ElementBuilderCreateMarkedContentPoint'] = Module['asm']['kz']).apply(null, arguments);
});
var _TRN_ElementReaderCreate = (Module['_TRN_ElementReaderCreate'] = function () {
  return (_TRN_ElementReaderCreate = Module['_TRN_ElementReaderCreate'] = Module['asm']['lz']).apply(null, arguments);
});
var _TRN_ElementReaderDestroy = (Module['_TRN_ElementReaderDestroy'] = function () {
  return (_TRN_ElementReaderDestroy = Module['_TRN_ElementReaderDestroy'] = Module['asm']['mz']).apply(null, arguments);
});
var _TRN_ElementReaderBeginOnPage = (Module['_TRN_ElementReaderBeginOnPage'] = function () {
  return (_TRN_ElementReaderBeginOnPage = Module['_TRN_ElementReaderBeginOnPage'] = Module['asm']['nz']).apply(null, arguments);
});
var _TRN_ElementReaderBegin = (Module['_TRN_ElementReaderBegin'] = function () {
  return (_TRN_ElementReaderBegin = Module['_TRN_ElementReaderBegin'] = Module['asm']['oz']).apply(null, arguments);
});
var _TRN_ElementReaderAppendResource = (Module['_TRN_ElementReaderAppendResource'] = function () {
  return (_TRN_ElementReaderAppendResource = Module['_TRN_ElementReaderAppendResource'] = Module['asm']['pz']).apply(null, arguments);
});
var _TRN_ElementReaderNext = (Module['_TRN_ElementReaderNext'] = function () {
  return (_TRN_ElementReaderNext = Module['_TRN_ElementReaderNext'] = Module['asm']['qz']).apply(null, arguments);
});
var _TRN_ElementReaderCurrent = (Module['_TRN_ElementReaderCurrent'] = function () {
  return (_TRN_ElementReaderCurrent = Module['_TRN_ElementReaderCurrent'] = Module['asm']['rz']).apply(null, arguments);
});
var _TRN_ElementReaderFormBegin = (Module['_TRN_ElementReaderFormBegin'] = function () {
  return (_TRN_ElementReaderFormBegin = Module['_TRN_ElementReaderFormBegin'] = Module['asm']['sz']).apply(null, arguments);
});
var _TRN_ElementReaderPatternBegin = (Module['_TRN_ElementReaderPatternBegin'] = function () {
  return (_TRN_ElementReaderPatternBegin = Module['_TRN_ElementReaderPatternBegin'] = Module['asm']['tz']).apply(null, arguments);
});
var _TRN_ElementReaderType3FontBegin = (Module['_TRN_ElementReaderType3FontBegin'] = function () {
  return (_TRN_ElementReaderType3FontBegin = Module['_TRN_ElementReaderType3FontBegin'] = Module['asm']['uz']).apply(null, arguments);
});
var _TRN_ElementReaderEnd = (Module['_TRN_ElementReaderEnd'] = function () {
  return (_TRN_ElementReaderEnd = Module['_TRN_ElementReaderEnd'] = Module['asm']['vz']).apply(null, arguments);
});
var _TRN_ElementReaderGetChangesIterator = (Module['_TRN_ElementReaderGetChangesIterator'] = function () {
  return (_TRN_ElementReaderGetChangesIterator = Module['_TRN_ElementReaderGetChangesIterator'] = Module['asm']['wz']).apply(null, arguments);
});
var _TRN_ElementReaderIsChanged = (Module['_TRN_ElementReaderIsChanged'] = function () {
  return (_TRN_ElementReaderIsChanged = Module['_TRN_ElementReaderIsChanged'] = Module['asm']['xz']).apply(null, arguments);
});
var _TRN_ElementReaderClearChangeList = (Module['_TRN_ElementReaderClearChangeList'] = function () {
  return (_TRN_ElementReaderClearChangeList = Module['_TRN_ElementReaderClearChangeList'] = Module['asm']['yz']).apply(null, arguments);
});
var _TRN_ElementReaderGetFont = (Module['_TRN_ElementReaderGetFont'] = function () {
  return (_TRN_ElementReaderGetFont = Module['_TRN_ElementReaderGetFont'] = Module['asm']['zz']).apply(null, arguments);
});
var _TRN_ElementReaderGetXObject = (Module['_TRN_ElementReaderGetXObject'] = function () {
  return (_TRN_ElementReaderGetXObject = Module['_TRN_ElementReaderGetXObject'] = Module['asm']['Az']).apply(null, arguments);
});
var _TRN_ElementReaderGetShading = (Module['_TRN_ElementReaderGetShading'] = function () {
  return (_TRN_ElementReaderGetShading = Module['_TRN_ElementReaderGetShading'] = Module['asm']['Bz']).apply(null, arguments);
});
var _TRN_ElementReaderGetColorSpace = (Module['_TRN_ElementReaderGetColorSpace'] = function () {
  return (_TRN_ElementReaderGetColorSpace = Module['_TRN_ElementReaderGetColorSpace'] = Module['asm']['Cz']).apply(null, arguments);
});
var _TRN_ElementReaderGetPattern = (Module['_TRN_ElementReaderGetPattern'] = function () {
  return (_TRN_ElementReaderGetPattern = Module['_TRN_ElementReaderGetPattern'] = Module['asm']['Dz']).apply(null, arguments);
});
var _TRN_ElementReaderGetExtGState = (Module['_TRN_ElementReaderGetExtGState'] = function () {
  return (_TRN_ElementReaderGetExtGState = Module['_TRN_ElementReaderGetExtGState'] = Module['asm']['Ez']).apply(null, arguments);
});
var _TRN_ElementWriterCreate = (Module['_TRN_ElementWriterCreate'] = function () {
  return (_TRN_ElementWriterCreate = Module['_TRN_ElementWriterCreate'] = Module['asm']['Fz']).apply(null, arguments);
});
var _TRN_ElementWriterDestroy = (Module['_TRN_ElementWriterDestroy'] = function () {
  return (_TRN_ElementWriterDestroy = Module['_TRN_ElementWriterDestroy'] = Module['asm']['Gz']).apply(null, arguments);
});
var _TRN_ElementWriterBeginOnPage = (Module['_TRN_ElementWriterBeginOnPage'] = function () {
  return (_TRN_ElementWriterBeginOnPage = Module['_TRN_ElementWriterBeginOnPage'] = Module['asm']['Hz']).apply(null, arguments);
});
var _TRN_ElementWriterBegin = (Module['_TRN_ElementWriterBegin'] = function () {
  return (_TRN_ElementWriterBegin = Module['_TRN_ElementWriterBegin'] = Module['asm']['Iz']).apply(null, arguments);
});
var _TRN_ElementWriterBeginOnObj = (Module['_TRN_ElementWriterBeginOnObj'] = function () {
  return (_TRN_ElementWriterBeginOnObj = Module['_TRN_ElementWriterBeginOnObj'] = Module['asm']['Jz']).apply(null, arguments);
});
var _TRN_ElementWriterEnd = (Module['_TRN_ElementWriterEnd'] = function () {
  return (_TRN_ElementWriterEnd = Module['_TRN_ElementWriterEnd'] = Module['asm']['Kz']).apply(null, arguments);
});
var _TRN_ElementWriterWriteElement = (Module['_TRN_ElementWriterWriteElement'] = function () {
  return (_TRN_ElementWriterWriteElement = Module['_TRN_ElementWriterWriteElement'] = Module['asm']['Lz']).apply(null, arguments);
});
var _TRN_ElementWriterWritePlacedElement = (Module['_TRN_ElementWriterWritePlacedElement'] = function () {
  return (_TRN_ElementWriterWritePlacedElement = Module['_TRN_ElementWriterWritePlacedElement'] = Module['asm']['Mz']).apply(null, arguments);
});
var _TRN_ElementWriterFlush = (Module['_TRN_ElementWriterFlush'] = function () {
  return (_TRN_ElementWriterFlush = Module['_TRN_ElementWriterFlush'] = Module['asm']['Nz']).apply(null, arguments);
});
var _TRN_ElementWriterWriteBuffer = (Module['_TRN_ElementWriterWriteBuffer'] = function () {
  return (_TRN_ElementWriterWriteBuffer = Module['_TRN_ElementWriterWriteBuffer'] = Module['asm']['Oz']).apply(null, arguments);
});
var _TRN_ElementWriterWriteString = (Module['_TRN_ElementWriterWriteString'] = function () {
  return (_TRN_ElementWriterWriteString = Module['_TRN_ElementWriterWriteString'] = Module['asm']['Pz']).apply(null, arguments);
});
var _TRN_ElementWriterSetDefaultGState = (Module['_TRN_ElementWriterSetDefaultGState'] = function () {
  return (_TRN_ElementWriterSetDefaultGState = Module['_TRN_ElementWriterSetDefaultGState'] = Module['asm']['Qz']).apply(null, arguments);
});
var _TRN_ElementWriterWriteGStateChanges = (Module['_TRN_ElementWriterWriteGStateChanges'] = function () {
  return (_TRN_ElementWriterWriteGStateChanges = Module['_TRN_ElementWriterWriteGStateChanges'] = Module['asm']['Rz']).apply(null, arguments);
});
var _TRN_FileSpecCreate = (Module['_TRN_FileSpecCreate'] = function () {
  return (_TRN_FileSpecCreate = Module['_TRN_FileSpecCreate'] = Module['asm']['Sz']).apply(null, arguments);
});
var _TRN_FileSpecCreateURL = (Module['_TRN_FileSpecCreateURL'] = function () {
  return (_TRN_FileSpecCreateURL = Module['_TRN_FileSpecCreateURL'] = Module['asm']['Tz']).apply(null, arguments);
});
var _TRN_FileSpecCreateFromObj = (Module['_TRN_FileSpecCreateFromObj'] = function () {
  return (_TRN_FileSpecCreateFromObj = Module['_TRN_FileSpecCreateFromObj'] = Module['asm']['Uz']).apply(null, arguments);
});
var _TRN_FileSpecCopy = (Module['_TRN_FileSpecCopy'] = function () {
  return (_TRN_FileSpecCopy = Module['_TRN_FileSpecCopy'] = Module['asm']['Vz']).apply(null, arguments);
});
var _TRN_FileSpecCompare = (Module['_TRN_FileSpecCompare'] = function () {
  return (_TRN_FileSpecCompare = Module['_TRN_FileSpecCompare'] = Module['asm']['Wz']).apply(null, arguments);
});
var _TRN_FileSpecIsValid = (Module['_TRN_FileSpecIsValid'] = function () {
  return (_TRN_FileSpecIsValid = Module['_TRN_FileSpecIsValid'] = Module['asm']['Xz']).apply(null, arguments);
});
var _TRN_FileSpecExport = (Module['_TRN_FileSpecExport'] = function () {
  return (_TRN_FileSpecExport = Module['_TRN_FileSpecExport'] = Module['asm']['Yz']).apply(null, arguments);
});
var _TRN_FileSpecGetFileData = (Module['_TRN_FileSpecGetFileData'] = function () {
  return (_TRN_FileSpecGetFileData = Module['_TRN_FileSpecGetFileData'] = Module['asm']['Zz']).apply(null, arguments);
});
var _TRN_FileSpecGetFilePath = (Module['_TRN_FileSpecGetFilePath'] = function () {
  return (_TRN_FileSpecGetFilePath = Module['_TRN_FileSpecGetFilePath'] = Module['asm']['_z']).apply(null, arguments);
});
var _TRN_FileSpecSetDesc = (Module['_TRN_FileSpecSetDesc'] = function () {
  return (_TRN_FileSpecSetDesc = Module['_TRN_FileSpecSetDesc'] = Module['asm']['$z']).apply(null, arguments);
});
var _TRN_FileSpecGetSDFObj = (Module['_TRN_FileSpecGetSDFObj'] = function () {
  return (_TRN_FileSpecGetSDFObj = Module['_TRN_FileSpecGetSDFObj'] = Module['asm']['aA']).apply(null, arguments);
});
var _TRN_FlattenerCreate = (Module['_TRN_FlattenerCreate'] = function () {
  return (_TRN_FlattenerCreate = Module['_TRN_FlattenerCreate'] = Module['asm']['bA']).apply(null, arguments);
});
var _TRN_FlattenerDestroy = (Module['_TRN_FlattenerDestroy'] = function () {
  return (_TRN_FlattenerDestroy = Module['_TRN_FlattenerDestroy'] = Module['asm']['cA']).apply(null, arguments);
});
var _TRN_FlattenerSetDPI = (Module['_TRN_FlattenerSetDPI'] = function () {
  return (_TRN_FlattenerSetDPI = Module['_TRN_FlattenerSetDPI'] = Module['asm']['dA']).apply(null, arguments);
});
var _TRN_FlattenerSetThreshold = (Module['_TRN_FlattenerSetThreshold'] = function () {
  return (_TRN_FlattenerSetThreshold = Module['_TRN_FlattenerSetThreshold'] = Module['asm']['eA']).apply(null, arguments);
});
var _TRN_FlattenerSetMaximumImagePixels = (Module['_TRN_FlattenerSetMaximumImagePixels'] = function () {
  return (_TRN_FlattenerSetMaximumImagePixels = Module['_TRN_FlattenerSetMaximumImagePixels'] = Module['asm']['fA']).apply(null, arguments);
});
var _TRN_FlattenerSetPreferJPG = (Module['_TRN_FlattenerSetPreferJPG'] = function () {
  return (_TRN_FlattenerSetPreferJPG = Module['_TRN_FlattenerSetPreferJPG'] = Module['asm']['gA']).apply(null, arguments);
});
var _TRN_FlattenerSetJPGQuality = (Module['_TRN_FlattenerSetJPGQuality'] = function () {
  return (_TRN_FlattenerSetJPGQuality = Module['_TRN_FlattenerSetJPGQuality'] = Module['asm']['hA']).apply(null, arguments);
});
var _TRN_FlattenerSetPathHinting = (Module['_TRN_FlattenerSetPathHinting'] = function () {
  return (_TRN_FlattenerSetPathHinting = Module['_TRN_FlattenerSetPathHinting'] = Module['asm']['iA']).apply(null, arguments);
});
var _TRN_FlattenerProcess = (Module['_TRN_FlattenerProcess'] = function () {
  return (_TRN_FlattenerProcess = Module['_TRN_FlattenerProcess'] = Module['asm']['jA']).apply(null, arguments);
});
var _TRN_FlattenerProcessPage = (Module['_TRN_FlattenerProcessPage'] = function () {
  return (_TRN_FlattenerProcessPage = Module['_TRN_FlattenerProcessPage'] = Module['asm']['kA']).apply(null, arguments);
});
var _TRN_FontCreate = (Module['_TRN_FontCreate'] = function () {
  return (_TRN_FontCreate = Module['_TRN_FontCreate'] = Module['asm']['lA']).apply(null, arguments);
});
var _TRN_FontCreateFromFontDescriptor = (Module['_TRN_FontCreateFromFontDescriptor'] = function () {
  return (_TRN_FontCreateFromFontDescriptor = Module['_TRN_FontCreateFromFontDescriptor'] = Module['asm']['mA']).apply(null, arguments);
});
var _TRN_FontCreateFromName = (Module['_TRN_FontCreateFromName'] = function () {
  return (_TRN_FontCreateFromName = Module['_TRN_FontCreateFromName'] = Module['asm']['nA']).apply(null, arguments);
});
var _TRN_FontCreateAndEmbed = (Module['_TRN_FontCreateAndEmbed'] = function () {
  return (_TRN_FontCreateAndEmbed = Module['_TRN_FontCreateAndEmbed'] = Module['asm']['oA']).apply(null, arguments);
});
var _TRN_FontCreateTrueTypeFont = (Module['_TRN_FontCreateTrueTypeFont'] = function () {
  return (_TRN_FontCreateTrueTypeFont = Module['_TRN_FontCreateTrueTypeFont'] = Module['asm']['pA']).apply(null, arguments);
});
var _TRN_FontCreateCIDTrueTypeFont = (Module['_TRN_FontCreateCIDTrueTypeFont'] = function () {
  return (_TRN_FontCreateCIDTrueTypeFont = Module['_TRN_FontCreateCIDTrueTypeFont'] = Module['asm']['qA']).apply(null, arguments);
});
var _TRN_FontCreateType1Font = (Module['_TRN_FontCreateType1Font'] = function () {
  return (_TRN_FontCreateType1Font = Module['_TRN_FontCreateType1Font'] = Module['asm']['rA']).apply(null, arguments);
});
var _TRN_FontDestroy = (Module['_TRN_FontDestroy'] = function () {
  return (_TRN_FontDestroy = Module['_TRN_FontDestroy'] = Module['asm']['sA']).apply(null, arguments);
});
var _TRN_FontGetType = (Module['_TRN_FontGetType'] = function () {
  return (_TRN_FontGetType = Module['_TRN_FontGetType'] = Module['asm']['tA']).apply(null, arguments);
});
var _TRN_FontIsSimple = (Module['_TRN_FontIsSimple'] = function () {
  return (_TRN_FontIsSimple = Module['_TRN_FontIsSimple'] = Module['asm']['uA']).apply(null, arguments);
});
var _TRN_FontGetTypeFromObj = (Module['_TRN_FontGetTypeFromObj'] = function () {
  return (_TRN_FontGetTypeFromObj = Module['_TRN_FontGetTypeFromObj'] = Module['asm']['vA']).apply(null, arguments);
});
var _TRN_FontGetSDFObj = (Module['_TRN_FontGetSDFObj'] = function () {
  return (_TRN_FontGetSDFObj = Module['_TRN_FontGetSDFObj'] = Module['asm']['wA']).apply(null, arguments);
});
var _TRN_FontGetDescriptor = (Module['_TRN_FontGetDescriptor'] = function () {
  return (_TRN_FontGetDescriptor = Module['_TRN_FontGetDescriptor'] = Module['asm']['xA']).apply(null, arguments);
});
var _TRN_FontGetName = (Module['_TRN_FontGetName'] = function () {
  return (_TRN_FontGetName = Module['_TRN_FontGetName'] = Module['asm']['yA']).apply(null, arguments);
});
var _TRN_FontGetFamilyName = (Module['_TRN_FontGetFamilyName'] = function () {
  return (_TRN_FontGetFamilyName = Module['_TRN_FontGetFamilyName'] = Module['asm']['zA']).apply(null, arguments);
});
var _TRN_FontIsFixedWidth = (Module['_TRN_FontIsFixedWidth'] = function () {
  return (_TRN_FontIsFixedWidth = Module['_TRN_FontIsFixedWidth'] = Module['asm']['AA']).apply(null, arguments);
});
var _TRN_FontIsSerif = (Module['_TRN_FontIsSerif'] = function () {
  return (_TRN_FontIsSerif = Module['_TRN_FontIsSerif'] = Module['asm']['BA']).apply(null, arguments);
});
var _TRN_FontIsSymbolic = (Module['_TRN_FontIsSymbolic'] = function () {
  return (_TRN_FontIsSymbolic = Module['_TRN_FontIsSymbolic'] = Module['asm']['CA']).apply(null, arguments);
});
var _TRN_FontIsItalic = (Module['_TRN_FontIsItalic'] = function () {
  return (_TRN_FontIsItalic = Module['_TRN_FontIsItalic'] = Module['asm']['DA']).apply(null, arguments);
});
var _TRN_FontIsAllCap = (Module['_TRN_FontIsAllCap'] = function () {
  return (_TRN_FontIsAllCap = Module['_TRN_FontIsAllCap'] = Module['asm']['EA']).apply(null, arguments);
});
var _TRN_FontIsForceBold = (Module['_TRN_FontIsForceBold'] = function () {
  return (_TRN_FontIsForceBold = Module['_TRN_FontIsForceBold'] = Module['asm']['FA']).apply(null, arguments);
});
var _TRN_FontIsHorizontalMode = (Module['_TRN_FontIsHorizontalMode'] = function () {
  return (_TRN_FontIsHorizontalMode = Module['_TRN_FontIsHorizontalMode'] = Module['asm']['GA']).apply(null, arguments);
});
var _TRN_FontGetWidth = (Module['_TRN_FontGetWidth'] = function () {
  return (_TRN_FontGetWidth = Module['_TRN_FontGetWidth'] = Module['asm']['HA']).apply(null, arguments);
});
var _TRN_FontGetMaxWidth = (Module['_TRN_FontGetMaxWidth'] = function () {
  return (_TRN_FontGetMaxWidth = Module['_TRN_FontGetMaxWidth'] = Module['asm']['IA']).apply(null, arguments);
});
var _TRN_FontGetMissingWidth = (Module['_TRN_FontGetMissingWidth'] = function () {
  return (_TRN_FontGetMissingWidth = Module['_TRN_FontGetMissingWidth'] = Module['asm']['JA']).apply(null, arguments);
});
var _TRN_FontGetCharCodeIterator = (Module['_TRN_FontGetCharCodeIterator'] = function () {
  return (_TRN_FontGetCharCodeIterator = Module['_TRN_FontGetCharCodeIterator'] = Module['asm']['KA']).apply(null, arguments);
});
var _TRN_FontGetShapedText = (Module['_TRN_FontGetShapedText'] = function () {
  return (_TRN_FontGetShapedText = Module['_TRN_FontGetShapedText'] = Module['asm']['LA']).apply(null, arguments);
});
var _TRN_FontIsEmbedded = (Module['_TRN_FontIsEmbedded'] = function () {
  return (_TRN_FontIsEmbedded = Module['_TRN_FontIsEmbedded'] = Module['asm']['MA']).apply(null, arguments);
});
var _TRN_FontGetEmbeddedFontName = (Module['_TRN_FontGetEmbeddedFontName'] = function () {
  return (_TRN_FontGetEmbeddedFontName = Module['_TRN_FontGetEmbeddedFontName'] = Module['asm']['NA']).apply(null, arguments);
});
var _TRN_FontGetEmbeddedFont = (Module['_TRN_FontGetEmbeddedFont'] = function () {
  return (_TRN_FontGetEmbeddedFont = Module['_TRN_FontGetEmbeddedFont'] = Module['asm']['OA']).apply(null, arguments);
});
var _TRN_FontGetEmbeddedFontBufSize = (Module['_TRN_FontGetEmbeddedFontBufSize'] = function () {
  return (_TRN_FontGetEmbeddedFontBufSize = Module['_TRN_FontGetEmbeddedFontBufSize'] = Module['asm']['PA']).apply(null, arguments);
});
var _TRN_FontGetUnitsPerEm = (Module['_TRN_FontGetUnitsPerEm'] = function () {
  return (_TRN_FontGetUnitsPerEm = Module['_TRN_FontGetUnitsPerEm'] = Module['asm']['QA']).apply(null, arguments);
});
var _TRN_FontGetBBox = (Module['_TRN_FontGetBBox'] = function () {
  return (_TRN_FontGetBBox = Module['_TRN_FontGetBBox'] = Module['asm']['RA']).apply(null, arguments);
});
var _TRN_FontGetAscent = (Module['_TRN_FontGetAscent'] = function () {
  return (_TRN_FontGetAscent = Module['_TRN_FontGetAscent'] = Module['asm']['SA']).apply(null, arguments);
});
var _TRN_FontGetDescent = (Module['_TRN_FontGetDescent'] = function () {
  return (_TRN_FontGetDescent = Module['_TRN_FontGetDescent'] = Module['asm']['TA']).apply(null, arguments);
});
var _TRN_FontGetStandardType1FontType = (Module['_TRN_FontGetStandardType1FontType'] = function () {
  return (_TRN_FontGetStandardType1FontType = Module['_TRN_FontGetStandardType1FontType'] = Module['asm']['UA']).apply(null, arguments);
});
var _TRN_FontIsCFF = (Module['_TRN_FontIsCFF'] = function () {
  return (_TRN_FontIsCFF = Module['_TRN_FontIsCFF'] = Module['asm']['VA']).apply(null, arguments);
});
var _TRN_FontGetType3FontMatrix = (Module['_TRN_FontGetType3FontMatrix'] = function () {
  return (_TRN_FontGetType3FontMatrix = Module['_TRN_FontGetType3FontMatrix'] = Module['asm']['WA']).apply(null, arguments);
});
var _TRN_FontGetType3GlyphStream = (Module['_TRN_FontGetType3GlyphStream'] = function () {
  return (_TRN_FontGetType3GlyphStream = Module['_TRN_FontGetType3GlyphStream'] = Module['asm']['XA']).apply(null, arguments);
});
var _TRN_FontGetVerticalAdvance = (Module['_TRN_FontGetVerticalAdvance'] = function () {
  return (_TRN_FontGetVerticalAdvance = Module['_TRN_FontGetVerticalAdvance'] = Module['asm']['YA']).apply(null, arguments);
});
var _TRN_FontGetDescendant = (Module['_TRN_FontGetDescendant'] = function () {
  return (_TRN_FontGetDescendant = Module['_TRN_FontGetDescendant'] = Module['asm']['ZA']).apply(null, arguments);
});
var _TRN_FontMapToCID = (Module['_TRN_FontMapToCID'] = function () {
  return (_TRN_FontMapToCID = Module['_TRN_FontMapToCID'] = Module['asm']['_A']).apply(null, arguments);
});
var _TRN_FunctionCreate = (Module['_TRN_FunctionCreate'] = function () {
  return (_TRN_FunctionCreate = Module['_TRN_FunctionCreate'] = Module['asm']['$A']).apply(null, arguments);
});
var _TRN_FunctionDestroy = (Module['_TRN_FunctionDestroy'] = function () {
  return (_TRN_FunctionDestroy = Module['_TRN_FunctionDestroy'] = Module['asm']['aB']).apply(null, arguments);
});
var _TRN_FunctionGetType = (Module['_TRN_FunctionGetType'] = function () {
  return (_TRN_FunctionGetType = Module['_TRN_FunctionGetType'] = Module['asm']['bB']).apply(null, arguments);
});
var _TRN_FunctionGetInputCardinality = (Module['_TRN_FunctionGetInputCardinality'] = function () {
  return (_TRN_FunctionGetInputCardinality = Module['_TRN_FunctionGetInputCardinality'] = Module['asm']['cB']).apply(null, arguments);
});
var _TRN_FunctionGetOutputCardinality = (Module['_TRN_FunctionGetOutputCardinality'] = function () {
  return (_TRN_FunctionGetOutputCardinality = Module['_TRN_FunctionGetOutputCardinality'] = Module['asm']['dB']).apply(null, arguments);
});
var _TRN_FunctionGetSDFObj = (Module['_TRN_FunctionGetSDFObj'] = function () {
  return (_TRN_FunctionGetSDFObj = Module['_TRN_FunctionGetSDFObj'] = Module['asm']['eB']).apply(null, arguments);
});
var _TRN_HighlightsDestroy = (Module['_TRN_HighlightsDestroy'] = function () {
  return (_TRN_HighlightsDestroy = Module['_TRN_HighlightsDestroy'] = Module['asm']['fB']).apply(null, arguments);
});
var _TRN_HighlightsCopyCtor = (Module['_TRN_HighlightsCopyCtor'] = function () {
  return (_TRN_HighlightsCopyCtor = Module['_TRN_HighlightsCopyCtor'] = Module['asm']['gB']).apply(null, arguments);
});
var _TRN_HighlightsAdd = (Module['_TRN_HighlightsAdd'] = function () {
  return (_TRN_HighlightsAdd = Module['_TRN_HighlightsAdd'] = Module['asm']['hB']).apply(null, arguments);
});
var _TRN_HighlightsSaveToString = (Module['_TRN_HighlightsSaveToString'] = function () {
  return (_TRN_HighlightsSaveToString = Module['_TRN_HighlightsSaveToString'] = Module['asm']['iB']).apply(null, arguments);
});
var _TRN_HighlightsClear = (Module['_TRN_HighlightsClear'] = function () {
  return (_TRN_HighlightsClear = Module['_TRN_HighlightsClear'] = Module['asm']['jB']).apply(null, arguments);
});
var _TRN_HighlightsBegin = (Module['_TRN_HighlightsBegin'] = function () {
  return (_TRN_HighlightsBegin = Module['_TRN_HighlightsBegin'] = Module['asm']['kB']).apply(null, arguments);
});
var _TRN_HighlightsHasNext = (Module['_TRN_HighlightsHasNext'] = function () {
  return (_TRN_HighlightsHasNext = Module['_TRN_HighlightsHasNext'] = Module['asm']['lB']).apply(null, arguments);
});
var _TRN_HighlightsNext = (Module['_TRN_HighlightsNext'] = function () {
  return (_TRN_HighlightsNext = Module['_TRN_HighlightsNext'] = Module['asm']['mB']).apply(null, arguments);
});
var _TRN_HighlightsGetCurrentPageNumber = (Module['_TRN_HighlightsGetCurrentPageNumber'] = function () {
  return (_TRN_HighlightsGetCurrentPageNumber = Module['_TRN_HighlightsGetCurrentPageNumber'] = Module['asm']['nB']).apply(null, arguments);
});
var _TRN_HighlightsGetCurrentTextRange = (Module['_TRN_HighlightsGetCurrentTextRange'] = function () {
  return (_TRN_HighlightsGetCurrentTextRange = Module['_TRN_HighlightsGetCurrentTextRange'] = Module['asm']['oB']).apply(null, arguments);
});
var _TRN_ImageCreateFromMemory = (Module['_TRN_ImageCreateFromMemory'] = function () {
  return (_TRN_ImageCreateFromMemory = Module['_TRN_ImageCreateFromMemory'] = Module['asm']['pB']).apply(null, arguments);
});
var _TRN_ImageCreateFromMemory2 = (Module['_TRN_ImageCreateFromMemory2'] = function () {
  return (_TRN_ImageCreateFromMemory2 = Module['_TRN_ImageCreateFromMemory2'] = Module['asm']['qB']).apply(null, arguments);
});
var _TRN_ImageCreateFromStream = (Module['_TRN_ImageCreateFromStream'] = function () {
  return (_TRN_ImageCreateFromStream = Module['_TRN_ImageCreateFromStream'] = Module['asm']['rB']).apply(null, arguments);
});
var _TRN_ImageCreateFromStream2 = (Module['_TRN_ImageCreateFromStream2'] = function () {
  return (_TRN_ImageCreateFromStream2 = Module['_TRN_ImageCreateFromStream2'] = Module['asm']['sB']).apply(null, arguments);
});
var _TRN_ImageCreateImageMask = (Module['_TRN_ImageCreateImageMask'] = function () {
  return (_TRN_ImageCreateImageMask = Module['_TRN_ImageCreateImageMask'] = Module['asm']['tB']).apply(null, arguments);
});
var _TRN_ImageCreateImageMaskFromStream = (Module['_TRN_ImageCreateImageMaskFromStream'] = function () {
  return (_TRN_ImageCreateImageMaskFromStream = Module['_TRN_ImageCreateImageMaskFromStream'] = Module['asm']['uB']).apply(null, arguments);
});
var _TRN_ImageCreateSoftMask = (Module['_TRN_ImageCreateSoftMask'] = function () {
  return (_TRN_ImageCreateSoftMask = Module['_TRN_ImageCreateSoftMask'] = Module['asm']['vB']).apply(null, arguments);
});
var _TRN_ImageCreateSoftMaskFromStream = (Module['_TRN_ImageCreateSoftMaskFromStream'] = function () {
  return (_TRN_ImageCreateSoftMaskFromStream = Module['_TRN_ImageCreateSoftMaskFromStream'] = Module['asm']['wB']).apply(null, arguments);
});
var _TRN_ImageCreateDirectFromMemory = (Module['_TRN_ImageCreateDirectFromMemory'] = function () {
  return (_TRN_ImageCreateDirectFromMemory = Module['_TRN_ImageCreateDirectFromMemory'] = Module['asm']['xB']).apply(null, arguments);
});
var _TRN_ImageCreateDirectFromStream = (Module['_TRN_ImageCreateDirectFromStream'] = function () {
  return (_TRN_ImageCreateDirectFromStream = Module['_TRN_ImageCreateDirectFromStream'] = Module['asm']['yB']).apply(null, arguments);
});
var _TRN_ImageCreateFromObj = (Module['_TRN_ImageCreateFromObj'] = function () {
  return (_TRN_ImageCreateFromObj = Module['_TRN_ImageCreateFromObj'] = Module['asm']['zB']).apply(null, arguments);
});
var _TRN_ImageCopy = (Module['_TRN_ImageCopy'] = function () {
  return (_TRN_ImageCopy = Module['_TRN_ImageCopy'] = Module['asm']['AB']).apply(null, arguments);
});
var _TRN_ImageGetSDFObj = (Module['_TRN_ImageGetSDFObj'] = function () {
  return (_TRN_ImageGetSDFObj = Module['_TRN_ImageGetSDFObj'] = Module['asm']['BB']).apply(null, arguments);
});
var _TRN_ImageIsValid = (Module['_TRN_ImageIsValid'] = function () {
  return (_TRN_ImageIsValid = Module['_TRN_ImageIsValid'] = Module['asm']['CB']).apply(null, arguments);
});
var _TRN_ImageGetImageData = (Module['_TRN_ImageGetImageData'] = function () {
  return (_TRN_ImageGetImageData = Module['_TRN_ImageGetImageData'] = Module['asm']['DB']).apply(null, arguments);
});
var _TRN_ImageGetImageDataSize = (Module['_TRN_ImageGetImageDataSize'] = function () {
  return (_TRN_ImageGetImageDataSize = Module['_TRN_ImageGetImageDataSize'] = Module['asm']['EB']).apply(null, arguments);
});
var _TRN_ImageGetImageColorSpace = (Module['_TRN_ImageGetImageColorSpace'] = function () {
  return (_TRN_ImageGetImageColorSpace = Module['_TRN_ImageGetImageColorSpace'] = Module['asm']['FB']).apply(null, arguments);
});
var _TRN_ImageGetImageWidth = (Module['_TRN_ImageGetImageWidth'] = function () {
  return (_TRN_ImageGetImageWidth = Module['_TRN_ImageGetImageWidth'] = Module['asm']['GB']).apply(null, arguments);
});
var _TRN_ImageGetImageHeight = (Module['_TRN_ImageGetImageHeight'] = function () {
  return (_TRN_ImageGetImageHeight = Module['_TRN_ImageGetImageHeight'] = Module['asm']['HB']).apply(null, arguments);
});
var _TRN_ImageGetDecodeArray = (Module['_TRN_ImageGetDecodeArray'] = function () {
  return (_TRN_ImageGetDecodeArray = Module['_TRN_ImageGetDecodeArray'] = Module['asm']['IB']).apply(null, arguments);
});
var _TRN_ImageGetBitsPerComponent = (Module['_TRN_ImageGetBitsPerComponent'] = function () {
  return (_TRN_ImageGetBitsPerComponent = Module['_TRN_ImageGetBitsPerComponent'] = Module['asm']['JB']).apply(null, arguments);
});
var _TRN_ImageGetComponentNum = (Module['_TRN_ImageGetComponentNum'] = function () {
  return (_TRN_ImageGetComponentNum = Module['_TRN_ImageGetComponentNum'] = Module['asm']['KB']).apply(null, arguments);
});
var _TRN_ImageIsImageMask = (Module['_TRN_ImageIsImageMask'] = function () {
  return (_TRN_ImageIsImageMask = Module['_TRN_ImageIsImageMask'] = Module['asm']['LB']).apply(null, arguments);
});
var _TRN_ImageIsImageInterpolate = (Module['_TRN_ImageIsImageInterpolate'] = function () {
  return (_TRN_ImageIsImageInterpolate = Module['_TRN_ImageIsImageInterpolate'] = Module['asm']['MB']).apply(null, arguments);
});
var _TRN_ImageGetMask = (Module['_TRN_ImageGetMask'] = function () {
  return (_TRN_ImageGetMask = Module['_TRN_ImageGetMask'] = Module['asm']['NB']).apply(null, arguments);
});
var _TRN_ImageSetMask = (Module['_TRN_ImageSetMask'] = function () {
  return (_TRN_ImageSetMask = Module['_TRN_ImageSetMask'] = Module['asm']['OB']).apply(null, arguments);
});
var _TRN_ImageSetMaskWithObj = (Module['_TRN_ImageSetMaskWithObj'] = function () {
  return (_TRN_ImageSetMaskWithObj = Module['_TRN_ImageSetMaskWithObj'] = Module['asm']['PB']).apply(null, arguments);
});
var _TRN_ImageGetSoftMask = (Module['_TRN_ImageGetSoftMask'] = function () {
  return (_TRN_ImageGetSoftMask = Module['_TRN_ImageGetSoftMask'] = Module['asm']['QB']).apply(null, arguments);
});
var _TRN_ImageSetSoftMask = (Module['_TRN_ImageSetSoftMask'] = function () {
  return (_TRN_ImageSetSoftMask = Module['_TRN_ImageSetSoftMask'] = Module['asm']['RB']).apply(null, arguments);
});
var _TRN_ImageGetImageRenderingIntent = (Module['_TRN_ImageGetImageRenderingIntent'] = function () {
  return (_TRN_ImageGetImageRenderingIntent = Module['_TRN_ImageGetImageRenderingIntent'] = Module['asm']['SB']).apply(null, arguments);
});
var _TRN_ImageExportFromStream = (Module['_TRN_ImageExportFromStream'] = function () {
  return (_TRN_ImageExportFromStream = Module['_TRN_ImageExportFromStream'] = Module['asm']['TB']).apply(null, arguments);
});
var _TRN_ImageExportAsTiffFromStream = (Module['_TRN_ImageExportAsTiffFromStream'] = function () {
  return (_TRN_ImageExportAsTiffFromStream = Module['_TRN_ImageExportAsTiffFromStream'] = Module['asm']['UB']).apply(null, arguments);
});
var _TRN_ImageExportAsPngFromStream = (Module['_TRN_ImageExportAsPngFromStream'] = function () {
  return (_TRN_ImageExportAsPngFromStream = Module['_TRN_ImageExportAsPngFromStream'] = Module['asm']['VB']).apply(null, arguments);
});
var _TRN_PageLabelCreate = (Module['_TRN_PageLabelCreate'] = function () {
  return (_TRN_PageLabelCreate = Module['_TRN_PageLabelCreate'] = Module['asm']['WB']).apply(null, arguments);
});
var _TRN_PageLabelCreateFromObj = (Module['_TRN_PageLabelCreateFromObj'] = function () {
  return (_TRN_PageLabelCreateFromObj = Module['_TRN_PageLabelCreateFromObj'] = Module['asm']['XB']).apply(null, arguments);
});
var _TRN_PageLabelCompare = (Module['_TRN_PageLabelCompare'] = function () {
  return (_TRN_PageLabelCompare = Module['_TRN_PageLabelCompare'] = Module['asm']['YB']).apply(null, arguments);
});
var _TRN_PageLabelIsValid = (Module['_TRN_PageLabelIsValid'] = function () {
  return (_TRN_PageLabelIsValid = Module['_TRN_PageLabelIsValid'] = Module['asm']['ZB']).apply(null, arguments);
});
var _TRN_PageLabelGetLabelTitle = (Module['_TRN_PageLabelGetLabelTitle'] = function () {
  return (_TRN_PageLabelGetLabelTitle = Module['_TRN_PageLabelGetLabelTitle'] = Module['asm']['_B']).apply(null, arguments);
});
var _TRN_PageLabelSetStyle = (Module['_TRN_PageLabelSetStyle'] = function () {
  return (_TRN_PageLabelSetStyle = Module['_TRN_PageLabelSetStyle'] = Module['asm']['$B']).apply(null, arguments);
});
var _TRN_PageLabelGetStyle = (Module['_TRN_PageLabelGetStyle'] = function () {
  return (_TRN_PageLabelGetStyle = Module['_TRN_PageLabelGetStyle'] = Module['asm']['aC']).apply(null, arguments);
});
var _TRN_PageLabelGetPrefix = (Module['_TRN_PageLabelGetPrefix'] = function () {
  return (_TRN_PageLabelGetPrefix = Module['_TRN_PageLabelGetPrefix'] = Module['asm']['bC']).apply(null, arguments);
});
var _TRN_PageLabelSetPrefix = (Module['_TRN_PageLabelSetPrefix'] = function () {
  return (_TRN_PageLabelSetPrefix = Module['_TRN_PageLabelSetPrefix'] = Module['asm']['cC']).apply(null, arguments);
});
var _TRN_PageLabelGetStart = (Module['_TRN_PageLabelGetStart'] = function () {
  return (_TRN_PageLabelGetStart = Module['_TRN_PageLabelGetStart'] = Module['asm']['dC']).apply(null, arguments);
});
var _TRN_PageLabelSetStart = (Module['_TRN_PageLabelSetStart'] = function () {
  return (_TRN_PageLabelSetStart = Module['_TRN_PageLabelSetStart'] = Module['asm']['eC']).apply(null, arguments);
});
var _TRN_PageLabelGetFirstPageNum = (Module['_TRN_PageLabelGetFirstPageNum'] = function () {
  return (_TRN_PageLabelGetFirstPageNum = Module['_TRN_PageLabelGetFirstPageNum'] = Module['asm']['fC']).apply(null, arguments);
});
var _TRN_PageLabelGetLastPageNum = (Module['_TRN_PageLabelGetLastPageNum'] = function () {
  return (_TRN_PageLabelGetLastPageNum = Module['_TRN_PageLabelGetLastPageNum'] = Module['asm']['gC']).apply(null, arguments);
});
var _TRN_PageLabelGetSDFObj = (Module['_TRN_PageLabelGetSDFObj'] = function () {
  return (_TRN_PageLabelGetSDFObj = Module['_TRN_PageLabelGetSDFObj'] = Module['asm']['hC']).apply(null, arguments);
});
var _TRN_PageSetCreate = (Module['_TRN_PageSetCreate'] = function () {
  return (_TRN_PageSetCreate = Module['_TRN_PageSetCreate'] = Module['asm']['iC']).apply(null, arguments);
});
var _TRN_PageSetCreateSinglePage = (Module['_TRN_PageSetCreateSinglePage'] = function () {
  return (_TRN_PageSetCreateSinglePage = Module['_TRN_PageSetCreateSinglePage'] = Module['asm']['jC']).apply(null, arguments);
});
var _TRN_PageSetCreateRange = (Module['_TRN_PageSetCreateRange'] = function () {
  return (_TRN_PageSetCreateRange = Module['_TRN_PageSetCreateRange'] = Module['asm']['kC']).apply(null, arguments);
});
var _TRN_PageSetCreateFilteredRange = (Module['_TRN_PageSetCreateFilteredRange'] = function () {
  return (_TRN_PageSetCreateFilteredRange = Module['_TRN_PageSetCreateFilteredRange'] = Module['asm']['lC']).apply(null, arguments);
});
var _TRN_PageSetDestroy = (Module['_TRN_PageSetDestroy'] = function () {
  return (_TRN_PageSetDestroy = Module['_TRN_PageSetDestroy'] = Module['asm']['mC']).apply(null, arguments);
});
var _TRN_PageSetAddPage = (Module['_TRN_PageSetAddPage'] = function () {
  return (_TRN_PageSetAddPage = Module['_TRN_PageSetAddPage'] = Module['asm']['nC']).apply(null, arguments);
});
var _TRN_PageSetAddRange = (Module['_TRN_PageSetAddRange'] = function () {
  return (_TRN_PageSetAddRange = Module['_TRN_PageSetAddRange'] = Module['asm']['oC']).apply(null, arguments);
});
var _TRN_PatternColorCreate = (Module['_TRN_PatternColorCreate'] = function () {
  return (_TRN_PatternColorCreate = Module['_TRN_PatternColorCreate'] = Module['asm']['pC']).apply(null, arguments);
});
var _TRN_PatternColorDestroy = (Module['_TRN_PatternColorDestroy'] = function () {
  return (_TRN_PatternColorDestroy = Module['_TRN_PatternColorDestroy'] = Module['asm']['qC']).apply(null, arguments);
});
var _TRN_PatternColorGetTypeFromObj = (Module['_TRN_PatternColorGetTypeFromObj'] = function () {
  return (_TRN_PatternColorGetTypeFromObj = Module['_TRN_PatternColorGetTypeFromObj'] = Module['asm']['rC']).apply(null, arguments);
});
var _TRN_PatternColorGetType = (Module['_TRN_PatternColorGetType'] = function () {
  return (_TRN_PatternColorGetType = Module['_TRN_PatternColorGetType'] = Module['asm']['sC']).apply(null, arguments);
});
var _TRN_PatternColorGetSDFObj = (Module['_TRN_PatternColorGetSDFObj'] = function () {
  return (_TRN_PatternColorGetSDFObj = Module['_TRN_PatternColorGetSDFObj'] = Module['asm']['tC']).apply(null, arguments);
});
var _TRN_PatternColorGetMatrix = (Module['_TRN_PatternColorGetMatrix'] = function () {
  return (_TRN_PatternColorGetMatrix = Module['_TRN_PatternColorGetMatrix'] = Module['asm']['uC']).apply(null, arguments);
});
var _TRN_PatternColorGetShading = (Module['_TRN_PatternColorGetShading'] = function () {
  return (_TRN_PatternColorGetShading = Module['_TRN_PatternColorGetShading'] = Module['asm']['vC']).apply(null, arguments);
});
var _TRN_PatternColorGetTilingType = (Module['_TRN_PatternColorGetTilingType'] = function () {
  return (_TRN_PatternColorGetTilingType = Module['_TRN_PatternColorGetTilingType'] = Module['asm']['wC']).apply(null, arguments);
});
var _TRN_PatternColorGetBBox = (Module['_TRN_PatternColorGetBBox'] = function () {
  return (_TRN_PatternColorGetBBox = Module['_TRN_PatternColorGetBBox'] = Module['asm']['xC']).apply(null, arguments);
});
var _TRN_PatternColorGetXStep = (Module['_TRN_PatternColorGetXStep'] = function () {
  return (_TRN_PatternColorGetXStep = Module['_TRN_PatternColorGetXStep'] = Module['asm']['yC']).apply(null, arguments);
});
var _TRN_PatternColorGetYStep = (Module['_TRN_PatternColorGetYStep'] = function () {
  return (_TRN_PatternColorGetYStep = Module['_TRN_PatternColorGetYStep'] = Module['asm']['zC']).apply(null, arguments);
});
var _TRN_GeometryCollectionSnapToNearest = (Module['_TRN_GeometryCollectionSnapToNearest'] = function () {
  return (_TRN_GeometryCollectionSnapToNearest = Module['_TRN_GeometryCollectionSnapToNearest'] = Module['asm']['AC']).apply(null, arguments);
});
var _TRN_GeometryCollectionSnapToNearestPixel = (Module['_TRN_GeometryCollectionSnapToNearestPixel'] = function () {
  return (_TRN_GeometryCollectionSnapToNearestPixel = Module['_TRN_GeometryCollectionSnapToNearestPixel'] = Module['asm']['BC']).apply(null, arguments);
});
var _TRN_GeometryCollectionDestroy = (Module['_TRN_GeometryCollectionDestroy'] = function () {
  return (_TRN_GeometryCollectionDestroy = Module['_TRN_GeometryCollectionDestroy'] = Module['asm']['CC']).apply(null, arguments);
});
var _TRN_DigestAlgorithmCalculateDigest = (Module['_TRN_DigestAlgorithmCalculateDigest'] = function () {
  return (_TRN_DigestAlgorithmCalculateDigest = Module['_TRN_DigestAlgorithmCalculateDigest'] = Module['asm']['DC']).apply(null, arguments);
});
var _TRN_VectorGetData = (Module['_TRN_VectorGetData'] = function () {
  return (_TRN_VectorGetData = Module['_TRN_VectorGetData'] = Module['asm']['EC']).apply(null, arguments);
});
var _TRN_VectorDestroy = (Module['_TRN_VectorDestroy'] = function () {
  return (_TRN_VectorDestroy = Module['_TRN_VectorDestroy'] = Module['asm']['FC']).apply(null, arguments);
});
var _TRN_ObjectIdentifierCreateFromIntArray = (Module['_TRN_ObjectIdentifierCreateFromIntArray'] = function () {
  return (_TRN_ObjectIdentifierCreateFromIntArray = Module['_TRN_ObjectIdentifierCreateFromIntArray'] = Module['asm']['GC']).apply(null, arguments);
});
var _TRN_ObjectIdentifierCreateFromDigestAlgorithm = (Module['_TRN_ObjectIdentifierCreateFromDigestAlgorithm'] = function () {
  return (_TRN_ObjectIdentifierCreateFromDigestAlgorithm = Module['_TRN_ObjectIdentifierCreateFromDigestAlgorithm'] = Module['asm']['HC']).apply(
    null,
    arguments,
  );
});
var _TRN_ObjectIdentifierDestroy = (Module['_TRN_ObjectIdentifierDestroy'] = function () {
  return (_TRN_ObjectIdentifierDestroy = Module['_TRN_ObjectIdentifierDestroy'] = Module['asm']['IC']).apply(null, arguments);
});
var _TRN_ObjectIdentifierGetRawValue = (Module['_TRN_ObjectIdentifierGetRawValue'] = function () {
  return (_TRN_ObjectIdentifierGetRawValue = Module['_TRN_ObjectIdentifierGetRawValue'] = Module['asm']['JC']).apply(null, arguments);
});
var _TRN_X501DistinguishedNameHasAttribute = (Module['_TRN_X501DistinguishedNameHasAttribute'] = function () {
  return (_TRN_X501DistinguishedNameHasAttribute = Module['_TRN_X501DistinguishedNameHasAttribute'] = Module['asm']['KC']).apply(null, arguments);
});
var _TRN_X501DistinguishedNameGetStringValuesForAttribute = (Module['_TRN_X501DistinguishedNameGetStringValuesForAttribute'] = function () {
  return (_TRN_X501DistinguishedNameGetStringValuesForAttribute = Module['_TRN_X501DistinguishedNameGetStringValuesForAttribute'] = Module['asm']['LC']).apply(
    null,
    arguments,
  );
});
var _TRN_X501DistinguishedNameGetAllAttributesAndValues = (Module['_TRN_X501DistinguishedNameGetAllAttributesAndValues'] = function () {
  return (_TRN_X501DistinguishedNameGetAllAttributesAndValues = Module['_TRN_X501DistinguishedNameGetAllAttributesAndValues'] = Module['asm']['MC']).apply(
    null,
    arguments,
  );
});
var _TRN_X501DistinguishedNameDestroy = (Module['_TRN_X501DistinguishedNameDestroy'] = function () {
  return (_TRN_X501DistinguishedNameDestroy = Module['_TRN_X501DistinguishedNameDestroy'] = Module['asm']['NC']).apply(null, arguments);
});
var _TRN_X509CertificateCreateFromBuffer = (Module['_TRN_X509CertificateCreateFromBuffer'] = function () {
  return (_TRN_X509CertificateCreateFromBuffer = Module['_TRN_X509CertificateCreateFromBuffer'] = Module['asm']['OC']).apply(null, arguments);
});
var _TRN_X509CertificateGetIssuerField = (Module['_TRN_X509CertificateGetIssuerField'] = function () {
  return (_TRN_X509CertificateGetIssuerField = Module['_TRN_X509CertificateGetIssuerField'] = Module['asm']['PC']).apply(null, arguments);
});
var _TRN_X509CertificateGetSubjectField = (Module['_TRN_X509CertificateGetSubjectField'] = function () {
  return (_TRN_X509CertificateGetSubjectField = Module['_TRN_X509CertificateGetSubjectField'] = Module['asm']['QC']).apply(null, arguments);
});
var _TRN_X509CertificateGetNotBeforeEpochTime = (Module['_TRN_X509CertificateGetNotBeforeEpochTime'] = function () {
  return (_TRN_X509CertificateGetNotBeforeEpochTime = Module['_TRN_X509CertificateGetNotBeforeEpochTime'] = Module['asm']['RC']).apply(null, arguments);
});
var _TRN_X509CertificateGetNotAfterEpochTime = (Module['_TRN_X509CertificateGetNotAfterEpochTime'] = function () {
  return (_TRN_X509CertificateGetNotAfterEpochTime = Module['_TRN_X509CertificateGetNotAfterEpochTime'] = Module['asm']['SC']).apply(null, arguments);
});
var _TRN_X509CertificateGetRawX509VersionNumber = (Module['_TRN_X509CertificateGetRawX509VersionNumber'] = function () {
  return (_TRN_X509CertificateGetRawX509VersionNumber = Module['_TRN_X509CertificateGetRawX509VersionNumber'] = Module['asm']['TC']).apply(null, arguments);
});
var _TRN_X509CertificateToString = (Module['_TRN_X509CertificateToString'] = function () {
  return (_TRN_X509CertificateToString = Module['_TRN_X509CertificateToString'] = Module['asm']['UC']).apply(null, arguments);
});
var _TRN_X509CertificateGetFingerprint = (Module['_TRN_X509CertificateGetFingerprint'] = function () {
  return (_TRN_X509CertificateGetFingerprint = Module['_TRN_X509CertificateGetFingerprint'] = Module['asm']['VC']).apply(null, arguments);
});
var _TRN_X509CertificateGetSerialNumber = (Module['_TRN_X509CertificateGetSerialNumber'] = function () {
  return (_TRN_X509CertificateGetSerialNumber = Module['_TRN_X509CertificateGetSerialNumber'] = Module['asm']['WC']).apply(null, arguments);
});
var _TRN_X509CertificateGetExtensions = (Module['_TRN_X509CertificateGetExtensions'] = function () {
  return (_TRN_X509CertificateGetExtensions = Module['_TRN_X509CertificateGetExtensions'] = Module['asm']['XC']).apply(null, arguments);
});
var _TRN_X509CertificateGetData = (Module['_TRN_X509CertificateGetData'] = function () {
  return (_TRN_X509CertificateGetData = Module['_TRN_X509CertificateGetData'] = Module['asm']['YC']).apply(null, arguments);
});
var _TRN_X509CertificateDestroy = (Module['_TRN_X509CertificateDestroy'] = function () {
  return (_TRN_X509CertificateDestroy = Module['_TRN_X509CertificateDestroy'] = Module['asm']['ZC']).apply(null, arguments);
});
var _TRN_TimestampingConfigurationCreateFromURL = (Module['_TRN_TimestampingConfigurationCreateFromURL'] = function () {
  return (_TRN_TimestampingConfigurationCreateFromURL = Module['_TRN_TimestampingConfigurationCreateFromURL'] = Module['asm']['_C']).apply(null, arguments);
});
var _TRN_TimestampingConfigurationSetTimestampAuthorityServerURL = (Module['_TRN_TimestampingConfigurationSetTimestampAuthorityServerURL'] = function () {
  return (_TRN_TimestampingConfigurationSetTimestampAuthorityServerURL = Module['_TRN_TimestampingConfigurationSetTimestampAuthorityServerURL'] =
    Module['asm']['$C']).apply(null, arguments);
});
var _TRN_TimestampingConfigurationSetTimestampAuthorityServerUsername = (Module['_TRN_TimestampingConfigurationSetTimestampAuthorityServerUsername'] =
  function () {
    return (_TRN_TimestampingConfigurationSetTimestampAuthorityServerUsername = Module['_TRN_TimestampingConfigurationSetTimestampAuthorityServerUsername'] =
      Module['asm']['aD']).apply(null, arguments);
  });
var _TRN_TimestampingConfigurationSetTimestampAuthorityServerPassword = (Module['_TRN_TimestampingConfigurationSetTimestampAuthorityServerPassword'] =
  function () {
    return (_TRN_TimestampingConfigurationSetTimestampAuthorityServerPassword = Module['_TRN_TimestampingConfigurationSetTimestampAuthorityServerPassword'] =
      Module['asm']['bD']).apply(null, arguments);
  });
var _TRN_TimestampingConfigurationSetUseNonce = (Module['_TRN_TimestampingConfigurationSetUseNonce'] = function () {
  return (_TRN_TimestampingConfigurationSetUseNonce = Module['_TRN_TimestampingConfigurationSetUseNonce'] = Module['asm']['cD']).apply(null, arguments);
});
var _TRN_TimestampingConfigurationTestConfiguration = (Module['_TRN_TimestampingConfigurationTestConfiguration'] = function () {
  return (_TRN_TimestampingConfigurationTestConfiguration = Module['_TRN_TimestampingConfigurationTestConfiguration'] = Module['asm']['dD']).apply(
    null,
    arguments,
  );
});
var _TRN_TimestampingConfigurationDestroy = (Module['_TRN_TimestampingConfigurationDestroy'] = function () {
  return (_TRN_TimestampingConfigurationDestroy = Module['_TRN_TimestampingConfigurationDestroy'] = Module['asm']['eD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldHasCryptographicSignature = (Module['_TRN_DigitalSignatureFieldHasCryptographicSignature'] = function () {
  return (_TRN_DigitalSignatureFieldHasCryptographicSignature = Module['_TRN_DigitalSignatureFieldHasCryptographicSignature'] = Module['asm']['fD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldGetSubFilter = (Module['_TRN_DigitalSignatureFieldGetSubFilter'] = function () {
  return (_TRN_DigitalSignatureFieldGetSubFilter = Module['_TRN_DigitalSignatureFieldGetSubFilter'] = Module['asm']['gD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetSignatureName = (Module['_TRN_DigitalSignatureFieldGetSignatureName'] = function () {
  return (_TRN_DigitalSignatureFieldGetSignatureName = Module['_TRN_DigitalSignatureFieldGetSignatureName'] = Module['asm']['hD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetLocation = (Module['_TRN_DigitalSignatureFieldGetLocation'] = function () {
  return (_TRN_DigitalSignatureFieldGetLocation = Module['_TRN_DigitalSignatureFieldGetLocation'] = Module['asm']['iD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetReason = (Module['_TRN_DigitalSignatureFieldGetReason'] = function () {
  return (_TRN_DigitalSignatureFieldGetReason = Module['_TRN_DigitalSignatureFieldGetReason'] = Module['asm']['jD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetContactInfo = (Module['_TRN_DigitalSignatureFieldGetContactInfo'] = function () {
  return (_TRN_DigitalSignatureFieldGetContactInfo = Module['_TRN_DigitalSignatureFieldGetContactInfo'] = Module['asm']['kD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetCertCount = (Module['_TRN_DigitalSignatureFieldGetCertCount'] = function () {
  return (_TRN_DigitalSignatureFieldGetCertCount = Module['_TRN_DigitalSignatureFieldGetCertCount'] = Module['asm']['lD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldHasVisibleAppearance = (Module['_TRN_DigitalSignatureFieldHasVisibleAppearance'] = function () {
  return (_TRN_DigitalSignatureFieldHasVisibleAppearance = Module['_TRN_DigitalSignatureFieldHasVisibleAppearance'] = Module['asm']['mD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldSetContactInfo = (Module['_TRN_DigitalSignatureFieldSetContactInfo'] = function () {
  return (_TRN_DigitalSignatureFieldSetContactInfo = Module['_TRN_DigitalSignatureFieldSetContactInfo'] = Module['asm']['nD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSetLocation = (Module['_TRN_DigitalSignatureFieldSetLocation'] = function () {
  return (_TRN_DigitalSignatureFieldSetLocation = Module['_TRN_DigitalSignatureFieldSetLocation'] = Module['asm']['oD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSetReason = (Module['_TRN_DigitalSignatureFieldSetReason'] = function () {
  return (_TRN_DigitalSignatureFieldSetReason = Module['_TRN_DigitalSignatureFieldSetReason'] = Module['asm']['pD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSetDocumentPermissions = (Module['_TRN_DigitalSignatureFieldSetDocumentPermissions'] = function () {
  return (_TRN_DigitalSignatureFieldSetDocumentPermissions = Module['_TRN_DigitalSignatureFieldSetDocumentPermissions'] = Module['asm']['qD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldSignOnNextSave = (Module['_TRN_DigitalSignatureFieldSignOnNextSave'] = function () {
  return (_TRN_DigitalSignatureFieldSignOnNextSave = Module['_TRN_DigitalSignatureFieldSignOnNextSave'] = Module['asm']['rD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldCertifyOnNextSave = (Module['_TRN_DigitalSignatureFieldCertifyOnNextSave'] = function () {
  return (_TRN_DigitalSignatureFieldCertifyOnNextSave = Module['_TRN_DigitalSignatureFieldCertifyOnNextSave'] = Module['asm']['sD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldIsLockedByDigitalSignature = (Module['_TRN_DigitalSignatureFieldIsLockedByDigitalSignature'] = function () {
  return (_TRN_DigitalSignatureFieldIsLockedByDigitalSignature = Module['_TRN_DigitalSignatureFieldIsLockedByDigitalSignature'] = Module['asm']['tD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldGetDocumentPermissions = (Module['_TRN_DigitalSignatureFieldGetDocumentPermissions'] = function () {
  return (_TRN_DigitalSignatureFieldGetDocumentPermissions = Module['_TRN_DigitalSignatureFieldGetDocumentPermissions'] = Module['asm']['uD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldClearSignature = (Module['_TRN_DigitalSignatureFieldClearSignature'] = function () {
  return (_TRN_DigitalSignatureFieldClearSignature = Module['_TRN_DigitalSignatureFieldClearSignature'] = Module['asm']['vD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldCreateFromField = (Module['_TRN_DigitalSignatureFieldCreateFromField'] = function () {
  return (_TRN_DigitalSignatureFieldCreateFromField = Module['_TRN_DigitalSignatureFieldCreateFromField'] = Module['asm']['wD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetSigningTime = (Module['_TRN_DigitalSignatureFieldGetSigningTime'] = function () {
  return (_TRN_DigitalSignatureFieldGetSigningTime = Module['_TRN_DigitalSignatureFieldGetSigningTime'] = Module['asm']['xD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetCert = (Module['_TRN_DigitalSignatureFieldGetCert'] = function () {
  return (_TRN_DigitalSignatureFieldGetCert = Module['_TRN_DigitalSignatureFieldGetCert'] = Module['asm']['yD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSetFieldPermissions = (Module['_TRN_DigitalSignatureFieldSetFieldPermissions'] = function () {
  return (_TRN_DigitalSignatureFieldSetFieldPermissions = Module['_TRN_DigitalSignatureFieldSetFieldPermissions'] = Module['asm']['zD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSignOnNextSaveFromBuffer = (Module['_TRN_DigitalSignatureFieldSignOnNextSaveFromBuffer'] = function () {
  return (_TRN_DigitalSignatureFieldSignOnNextSaveFromBuffer = Module['_TRN_DigitalSignatureFieldSignOnNextSaveFromBuffer'] = Module['asm']['AD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldSignOnNextSaveWithCustomHandler = (Module['_TRN_DigitalSignatureFieldSignOnNextSaveWithCustomHandler'] = function () {
  return (_TRN_DigitalSignatureFieldSignOnNextSaveWithCustomHandler = Module['_TRN_DigitalSignatureFieldSignOnNextSaveWithCustomHandler'] =
    Module['asm']['BD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldCertifyOnNextSaveFromBuffer = (Module['_TRN_DigitalSignatureFieldCertifyOnNextSaveFromBuffer'] = function () {
  return (_TRN_DigitalSignatureFieldCertifyOnNextSaveFromBuffer = Module['_TRN_DigitalSignatureFieldCertifyOnNextSaveFromBuffer'] = Module['asm']['CD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldCertifyOnNextSaveWithCustomHandler = (Module['_TRN_DigitalSignatureFieldCertifyOnNextSaveWithCustomHandler'] = function () {
  return (_TRN_DigitalSignatureFieldCertifyOnNextSaveWithCustomHandler = Module['_TRN_DigitalSignatureFieldCertifyOnNextSaveWithCustomHandler'] =
    Module['asm']['DD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetSDFObj = (Module['_TRN_DigitalSignatureFieldGetSDFObj'] = function () {
  return (_TRN_DigitalSignatureFieldGetSDFObj = Module['_TRN_DigitalSignatureFieldGetSDFObj'] = Module['asm']['ED']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetLockedFields = (Module['_TRN_DigitalSignatureFieldGetLockedFields'] = function () {
  return (_TRN_DigitalSignatureFieldGetLockedFields = Module['_TRN_DigitalSignatureFieldGetLockedFields'] = Module['asm']['FD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldVerify = (Module['_TRN_DigitalSignatureFieldVerify'] = function () {
  return (_TRN_DigitalSignatureFieldVerify = Module['_TRN_DigitalSignatureFieldVerify'] = Module['asm']['GD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldIsCertification = (Module['_TRN_DigitalSignatureFieldIsCertification'] = function () {
  return (_TRN_DigitalSignatureFieldIsCertification = Module['_TRN_DigitalSignatureFieldIsCertification'] = Module['asm']['HD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGetSignerCertFromCMS = (Module['_TRN_DigitalSignatureFieldGetSignerCertFromCMS'] = function () {
  return (_TRN_DigitalSignatureFieldGetSignerCertFromCMS = Module['_TRN_DigitalSignatureFieldGetSignerCertFromCMS'] = Module['asm']['ID']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldGetByteRanges = (Module['_TRN_DigitalSignatureFieldGetByteRanges'] = function () {
  return (_TRN_DigitalSignatureFieldGetByteRanges = Module['_TRN_DigitalSignatureFieldGetByteRanges'] = Module['asm']['JD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldEnableLTVOfflineVerification = (Module['_TRN_DigitalSignatureFieldEnableLTVOfflineVerification'] = function () {
  return (_TRN_DigitalSignatureFieldEnableLTVOfflineVerification = Module['_TRN_DigitalSignatureFieldEnableLTVOfflineVerification'] =
    Module['asm']['KD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldTimestampOnNextSave = (Module['_TRN_DigitalSignatureFieldTimestampOnNextSave'] = function () {
  return (_TRN_DigitalSignatureFieldTimestampOnNextSave = Module['_TRN_DigitalSignatureFieldTimestampOnNextSave'] = Module['asm']['LD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGenerateContentsWithEmbeddedTimestamp = (Module['_TRN_DigitalSignatureFieldGenerateContentsWithEmbeddedTimestamp'] = function () {
  return (_TRN_DigitalSignatureFieldGenerateContentsWithEmbeddedTimestamp = Module['_TRN_DigitalSignatureFieldGenerateContentsWithEmbeddedTimestamp'] =
    Module['asm']['MD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldUseSubFilter = (Module['_TRN_DigitalSignatureFieldUseSubFilter'] = function () {
  return (_TRN_DigitalSignatureFieldUseSubFilter = Module['_TRN_DigitalSignatureFieldUseSubFilter'] = Module['asm']['ND']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldCalculateDigest = (Module['_TRN_DigitalSignatureFieldCalculateDigest'] = function () {
  return (_TRN_DigitalSignatureFieldCalculateDigest = Module['_TRN_DigitalSignatureFieldCalculateDigest'] = Module['asm']['OD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSetPreferredDigestAlgorithm = (Module['_TRN_DigitalSignatureFieldSetPreferredDigestAlgorithm'] = function () {
  return (_TRN_DigitalSignatureFieldSetPreferredDigestAlgorithm = Module['_TRN_DigitalSignatureFieldSetPreferredDigestAlgorithm'] = Module['asm']['PD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldCreateSigDictForCustomCertification = (Module['_TRN_DigitalSignatureFieldCreateSigDictForCustomCertification'] = function () {
  return (_TRN_DigitalSignatureFieldCreateSigDictForCustomCertification = Module['_TRN_DigitalSignatureFieldCreateSigDictForCustomCertification'] =
    Module['asm']['QD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldCreateSigDictForCustomSigning = (Module['_TRN_DigitalSignatureFieldCreateSigDictForCustomSigning'] = function () {
  return (_TRN_DigitalSignatureFieldCreateSigDictForCustomSigning = Module['_TRN_DigitalSignatureFieldCreateSigDictForCustomSigning'] =
    Module['asm']['RD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSetSigDictTimeOfSigning = (Module['_TRN_DigitalSignatureFieldSetSigDictTimeOfSigning'] = function () {
  return (_TRN_DigitalSignatureFieldSetSigDictTimeOfSigning = Module['_TRN_DigitalSignatureFieldSetSigDictTimeOfSigning'] = Module['asm']['SD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldSignDigestBuffer = (Module['_TRN_DigitalSignatureFieldSignDigestBuffer'] = function () {
  return (_TRN_DigitalSignatureFieldSignDigestBuffer = Module['_TRN_DigitalSignatureFieldSignDigestBuffer'] = Module['asm']['TD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGenerateESSSigningCertPAdESAttribute = (Module['_TRN_DigitalSignatureFieldGenerateESSSigningCertPAdESAttribute'] = function () {
  return (_TRN_DigitalSignatureFieldGenerateESSSigningCertPAdESAttribute = Module['_TRN_DigitalSignatureFieldGenerateESSSigningCertPAdESAttribute'] =
    Module['asm']['UD']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldGenerateCMSSignedAttributes = (Module['_TRN_DigitalSignatureFieldGenerateCMSSignedAttributes'] = function () {
  return (_TRN_DigitalSignatureFieldGenerateCMSSignedAttributes = Module['_TRN_DigitalSignatureFieldGenerateCMSSignedAttributes'] = Module['asm']['VD']).apply(
    null,
    arguments,
  );
});
var _TRN_DigitalSignatureFieldGenerateCMSSignature = (Module['_TRN_DigitalSignatureFieldGenerateCMSSignature'] = function () {
  return (_TRN_DigitalSignatureFieldGenerateCMSSignature = Module['_TRN_DigitalSignatureFieldGenerateCMSSignature'] = Module['asm']['WD']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFDocGetTriggerAction = (Module['_TRN_PDFDocGetTriggerAction'] = function () {
  return (_TRN_PDFDocGetTriggerAction = Module['_TRN_PDFDocGetTriggerAction'] = Module['asm']['XD']).apply(null, arguments);
});
var _TRN_PDFDocCreate = (Module['_TRN_PDFDocCreate'] = function () {
  return (_TRN_PDFDocCreate = Module['_TRN_PDFDocCreate'] = Module['asm']['YD']).apply(null, arguments);
});
var _TRN_PDFDocCreateFromFilter = (Module['_TRN_PDFDocCreateFromFilter'] = function () {
  return (_TRN_PDFDocCreateFromFilter = Module['_TRN_PDFDocCreateFromFilter'] = Module['asm']['ZD']).apply(null, arguments);
});
var _TRN_PDFDocCreateFromBuffer = (Module['_TRN_PDFDocCreateFromBuffer'] = function () {
  return (_TRN_PDFDocCreateFromBuffer = Module['_TRN_PDFDocCreateFromBuffer'] = Module['asm']['_D']).apply(null, arguments);
});
var _TRN_PDFDocCreateFromLayoutEls = (Module['_TRN_PDFDocCreateFromLayoutEls'] = function () {
  return (_TRN_PDFDocCreateFromLayoutEls = Module['_TRN_PDFDocCreateFromLayoutEls'] = Module['asm']['$D']).apply(null, arguments);
});
var _TRN_PDFDocCreateShallowCopy = (Module['_TRN_PDFDocCreateShallowCopy'] = function () {
  return (_TRN_PDFDocCreateShallowCopy = Module['_TRN_PDFDocCreateShallowCopy'] = Module['asm']['aE']).apply(null, arguments);
});
var _TRN_PDFDocDestroy = (Module['_TRN_PDFDocDestroy'] = function () {
  return (_TRN_PDFDocDestroy = Module['_TRN_PDFDocDestroy'] = Module['asm']['bE']).apply(null, arguments);
});
var _TRN_PDFDocIsEncrypted = (Module['_TRN_PDFDocIsEncrypted'] = function () {
  return (_TRN_PDFDocIsEncrypted = Module['_TRN_PDFDocIsEncrypted'] = Module['asm']['cE']).apply(null, arguments);
});
var _TRN_PDFDocInitStdSecurityHandlerUString = (Module['_TRN_PDFDocInitStdSecurityHandlerUString'] = function () {
  return (_TRN_PDFDocInitStdSecurityHandlerUString = Module['_TRN_PDFDocInitStdSecurityHandlerUString'] = Module['asm']['dE']).apply(null, arguments);
});
var _TRN_PDFDocInitStdSecurityHandlerBuffer = (Module['_TRN_PDFDocInitStdSecurityHandlerBuffer'] = function () {
  return (_TRN_PDFDocInitStdSecurityHandlerBuffer = Module['_TRN_PDFDocInitStdSecurityHandlerBuffer'] = Module['asm']['eE']).apply(null, arguments);
});
var _TRN_PDFDocGetSecurityHandler = (Module['_TRN_PDFDocGetSecurityHandler'] = function () {
  return (_TRN_PDFDocGetSecurityHandler = Module['_TRN_PDFDocGetSecurityHandler'] = Module['asm']['fE']).apply(null, arguments);
});
var _TRN_PDFDocSetSecurityHandler = (Module['_TRN_PDFDocSetSecurityHandler'] = function () {
  return (_TRN_PDFDocSetSecurityHandler = Module['_TRN_PDFDocSetSecurityHandler'] = Module['asm']['gE']).apply(null, arguments);
});
var _TRN_PDFDocRemoveSecurity = (Module['_TRN_PDFDocRemoveSecurity'] = function () {
  return (_TRN_PDFDocRemoveSecurity = Module['_TRN_PDFDocRemoveSecurity'] = Module['asm']['hE']).apply(null, arguments);
});
var _TRN_PDFDocGetDocInfo = (Module['_TRN_PDFDocGetDocInfo'] = function () {
  return (_TRN_PDFDocGetDocInfo = Module['_TRN_PDFDocGetDocInfo'] = Module['asm']['iE']).apply(null, arguments);
});
var _TRN_PDFDocGetViewPrefs = (Module['_TRN_PDFDocGetViewPrefs'] = function () {
  return (_TRN_PDFDocGetViewPrefs = Module['_TRN_PDFDocGetViewPrefs'] = Module['asm']['jE']).apply(null, arguments);
});
var _TRN_PDFDocIsModified = (Module['_TRN_PDFDocIsModified'] = function () {
  return (_TRN_PDFDocIsModified = Module['_TRN_PDFDocIsModified'] = Module['asm']['kE']).apply(null, arguments);
});
var _TRN_PDFDocHasRepairedXRef = (Module['_TRN_PDFDocHasRepairedXRef'] = function () {
  return (_TRN_PDFDocHasRepairedXRef = Module['_TRN_PDFDocHasRepairedXRef'] = Module['asm']['lE']).apply(null, arguments);
});
var _TRN_PDFDocIsLinearized = (Module['_TRN_PDFDocIsLinearized'] = function () {
  return (_TRN_PDFDocIsLinearized = Module['_TRN_PDFDocIsLinearized'] = Module['asm']['mE']).apply(null, arguments);
});
var _TRN_PDFDocSaveMemoryBuffer = (Module['_TRN_PDFDocSaveMemoryBuffer'] = function () {
  return (_TRN_PDFDocSaveMemoryBuffer = Module['_TRN_PDFDocSaveMemoryBuffer'] = Module['asm']['nE']).apply(null, arguments);
});
var _TRN_PDFDocSaveStream = (Module['_TRN_PDFDocSaveStream'] = function () {
  return (_TRN_PDFDocSaveStream = Module['_TRN_PDFDocSaveStream'] = Module['asm']['oE']).apply(null, arguments);
});
var _TRN_PDFDocSaveCustomSignatureBuffer = (Module['_TRN_PDFDocSaveCustomSignatureBuffer'] = function () {
  return (_TRN_PDFDocSaveCustomSignatureBuffer = Module['_TRN_PDFDocSaveCustomSignatureBuffer'] = Module['asm']['pE']).apply(null, arguments);
});
var _TRN_PDFDocGetPageIterator = (Module['_TRN_PDFDocGetPageIterator'] = function () {
  return (_TRN_PDFDocGetPageIterator = Module['_TRN_PDFDocGetPageIterator'] = Module['asm']['qE']).apply(null, arguments);
});
var _TRN_PDFDocGetPage = (Module['_TRN_PDFDocGetPage'] = function () {
  return (_TRN_PDFDocGetPage = Module['_TRN_PDFDocGetPage'] = Module['asm']['rE']).apply(null, arguments);
});
var _TRN_PDFDocPageRemove = (Module['_TRN_PDFDocPageRemove'] = function () {
  return (_TRN_PDFDocPageRemove = Module['_TRN_PDFDocPageRemove'] = Module['asm']['sE']).apply(null, arguments);
});
var _TRN_PDFDocPageInsert = (Module['_TRN_PDFDocPageInsert'] = function () {
  return (_TRN_PDFDocPageInsert = Module['_TRN_PDFDocPageInsert'] = Module['asm']['tE']).apply(null, arguments);
});
var _TRN_PDFDocInsertPages = (Module['_TRN_PDFDocInsertPages'] = function () {
  return (_TRN_PDFDocInsertPages = Module['_TRN_PDFDocInsertPages'] = Module['asm']['uE']).apply(null, arguments);
});
var _TRN_PDFDocInsertPageSet = (Module['_TRN_PDFDocInsertPageSet'] = function () {
  return (_TRN_PDFDocInsertPageSet = Module['_TRN_PDFDocInsertPageSet'] = Module['asm']['vE']).apply(null, arguments);
});
var _TRN_PDFDocMovePages = (Module['_TRN_PDFDocMovePages'] = function () {
  return (_TRN_PDFDocMovePages = Module['_TRN_PDFDocMovePages'] = Module['asm']['wE']).apply(null, arguments);
});
var _TRN_PDFDocMovePageSet = (Module['_TRN_PDFDocMovePageSet'] = function () {
  return (_TRN_PDFDocMovePageSet = Module['_TRN_PDFDocMovePageSet'] = Module['asm']['xE']).apply(null, arguments);
});
var _TRN_PDFDocPagePushFront = (Module['_TRN_PDFDocPagePushFront'] = function () {
  return (_TRN_PDFDocPagePushFront = Module['_TRN_PDFDocPagePushFront'] = Module['asm']['yE']).apply(null, arguments);
});
var _TRN_PDFDocPagePushBack = (Module['_TRN_PDFDocPagePushBack'] = function () {
  return (_TRN_PDFDocPagePushBack = Module['_TRN_PDFDocPagePushBack'] = Module['asm']['zE']).apply(null, arguments);
});
var _TRN_PDFDocPageCreate = (Module['_TRN_PDFDocPageCreate'] = function () {
  return (_TRN_PDFDocPageCreate = Module['_TRN_PDFDocPageCreate'] = Module['asm']['AE']).apply(null, arguments);
});
var _TRN_PDFDocAppendTextDiffPage = (Module['_TRN_PDFDocAppendTextDiffPage'] = function () {
  return (_TRN_PDFDocAppendTextDiffPage = Module['_TRN_PDFDocAppendTextDiffPage'] = Module['asm']['BE']).apply(null, arguments);
});
var _TRN_PDFDocAppendTextDiffDoc = (Module['_TRN_PDFDocAppendTextDiffDoc'] = function () {
  return (_TRN_PDFDocAppendTextDiffDoc = Module['_TRN_PDFDocAppendTextDiffDoc'] = Module['asm']['CE']).apply(null, arguments);
});
var _TRN_PDFDocHighlightTextDiff = (Module['_TRN_PDFDocHighlightTextDiff'] = function () {
  return (_TRN_PDFDocHighlightTextDiff = Module['_TRN_PDFDocHighlightTextDiff'] = Module['asm']['DE']).apply(null, arguments);
});
var _TRN_PDFDocGetFirstBookmark = (Module['_TRN_PDFDocGetFirstBookmark'] = function () {
  return (_TRN_PDFDocGetFirstBookmark = Module['_TRN_PDFDocGetFirstBookmark'] = Module['asm']['EE']).apply(null, arguments);
});
var _TRN_PDFDocAddRootBookmark = (Module['_TRN_PDFDocAddRootBookmark'] = function () {
  return (_TRN_PDFDocAddRootBookmark = Module['_TRN_PDFDocAddRootBookmark'] = Module['asm']['FE']).apply(null, arguments);
});
var _TRN_PDFDocGetTrailer = (Module['_TRN_PDFDocGetTrailer'] = function () {
  return (_TRN_PDFDocGetTrailer = Module['_TRN_PDFDocGetTrailer'] = Module['asm']['GE']).apply(null, arguments);
});
var _TRN_PDFDocGetRoot = (Module['_TRN_PDFDocGetRoot'] = function () {
  return (_TRN_PDFDocGetRoot = Module['_TRN_PDFDocGetRoot'] = Module['asm']['HE']).apply(null, arguments);
});
var _TRN_PDFDocJSContextInitialize = (Module['_TRN_PDFDocJSContextInitialize'] = function () {
  return (_TRN_PDFDocJSContextInitialize = Module['_TRN_PDFDocJSContextInitialize'] = Module['asm']['IE']).apply(null, arguments);
});
var _TRN_PDFDocGetPages = (Module['_TRN_PDFDocGetPages'] = function () {
  return (_TRN_PDFDocGetPages = Module['_TRN_PDFDocGetPages'] = Module['asm']['JE']).apply(null, arguments);
});
var _TRN_PDFDocGetPageCount = (Module['_TRN_PDFDocGetPageCount'] = function () {
  return (_TRN_PDFDocGetPageCount = Module['_TRN_PDFDocGetPageCount'] = Module['asm']['KE']).apply(null, arguments);
});
var _TRN_PDFDocGetDownloadedByteCount = (Module['_TRN_PDFDocGetDownloadedByteCount'] = function () {
  return (_TRN_PDFDocGetDownloadedByteCount = Module['_TRN_PDFDocGetDownloadedByteCount'] = Module['asm']['LE']).apply(null, arguments);
});
var _TRN_PDFDocGetTotalRemoteByteCount = (Module['_TRN_PDFDocGetTotalRemoteByteCount'] = function () {
  return (_TRN_PDFDocGetTotalRemoteByteCount = Module['_TRN_PDFDocGetTotalRemoteByteCount'] = Module['asm']['ME']).apply(null, arguments);
});
var _TRN_PDFDocGetFieldIteratorBegin = (Module['_TRN_PDFDocGetFieldIteratorBegin'] = function () {
  return (_TRN_PDFDocGetFieldIteratorBegin = Module['_TRN_PDFDocGetFieldIteratorBegin'] = Module['asm']['NE']).apply(null, arguments);
});
var _TRN_PDFDocGetFieldIterator = (Module['_TRN_PDFDocGetFieldIterator'] = function () {
  return (_TRN_PDFDocGetFieldIterator = Module['_TRN_PDFDocGetFieldIterator'] = Module['asm']['OE']).apply(null, arguments);
});
var _TRN_PDFDocGetField = (Module['_TRN_PDFDocGetField'] = function () {
  return (_TRN_PDFDocGetField = Module['_TRN_PDFDocGetField'] = Module['asm']['PE']).apply(null, arguments);
});
var _TRN_PDFDocFieldCreate = (Module['_TRN_PDFDocFieldCreate'] = function () {
  return (_TRN_PDFDocFieldCreate = Module['_TRN_PDFDocFieldCreate'] = Module['asm']['QE']).apply(null, arguments);
});
var _TRN_PDFDocFieldCreateFromStrings = (Module['_TRN_PDFDocFieldCreateFromStrings'] = function () {
  return (_TRN_PDFDocFieldCreateFromStrings = Module['_TRN_PDFDocFieldCreateFromStrings'] = Module['asm']['RE']).apply(null, arguments);
});
var _TRN_PDFDocRefreshFieldAppearances = (Module['_TRN_PDFDocRefreshFieldAppearances'] = function () {
  return (_TRN_PDFDocRefreshFieldAppearances = Module['_TRN_PDFDocRefreshFieldAppearances'] = Module['asm']['SE']).apply(null, arguments);
});
var _TRN_PDFDocRefreshAnnotAppearances = (Module['_TRN_PDFDocRefreshAnnotAppearances'] = function () {
  return (_TRN_PDFDocRefreshAnnotAppearances = Module['_TRN_PDFDocRefreshAnnotAppearances'] = Module['asm']['TE']).apply(null, arguments);
});
var _TRN_PDFDocFlattenAnnotations = (Module['_TRN_PDFDocFlattenAnnotations'] = function () {
  return (_TRN_PDFDocFlattenAnnotations = Module['_TRN_PDFDocFlattenAnnotations'] = Module['asm']['UE']).apply(null, arguments);
});
var _TRN_PDFDocGetAcroForm = (Module['_TRN_PDFDocGetAcroForm'] = function () {
  return (_TRN_PDFDocGetAcroForm = Module['_TRN_PDFDocGetAcroForm'] = Module['asm']['VE']).apply(null, arguments);
});
var _TRN_PDFDocFDFExtract = (Module['_TRN_PDFDocFDFExtract'] = function () {
  return (_TRN_PDFDocFDFExtract = Module['_TRN_PDFDocFDFExtract'] = Module['asm']['WE']).apply(null, arguments);
});
var _TRN_PDFDocFDFExtractPageSet = (Module['_TRN_PDFDocFDFExtractPageSet'] = function () {
  return (_TRN_PDFDocFDFExtractPageSet = Module['_TRN_PDFDocFDFExtractPageSet'] = Module['asm']['XE']).apply(null, arguments);
});
var _TRN_PDFDocFDFMerge = (Module['_TRN_PDFDocFDFMerge'] = function () {
  return (_TRN_PDFDocFDFMerge = Module['_TRN_PDFDocFDFMerge'] = Module['asm']['YE']).apply(null, arguments);
});
var _TRN_PDFDocFDFUpdate = (Module['_TRN_PDFDocFDFUpdate'] = function () {
  return (_TRN_PDFDocFDFUpdate = Module['_TRN_PDFDocFDFUpdate'] = Module['asm']['ZE']).apply(null, arguments);
});
var _TRN_PDFDocGetOpenAction = (Module['_TRN_PDFDocGetOpenAction'] = function () {
  return (_TRN_PDFDocGetOpenAction = Module['_TRN_PDFDocGetOpenAction'] = Module['asm']['_E']).apply(null, arguments);
});
var _TRN_PDFDocSetOpenAction = (Module['_TRN_PDFDocSetOpenAction'] = function () {
  return (_TRN_PDFDocSetOpenAction = Module['_TRN_PDFDocSetOpenAction'] = Module['asm']['$E']).apply(null, arguments);
});
var _TRN_PDFDocAddFileAttachment = (Module['_TRN_PDFDocAddFileAttachment'] = function () {
  return (_TRN_PDFDocAddFileAttachment = Module['_TRN_PDFDocAddFileAttachment'] = Module['asm']['aF']).apply(null, arguments);
});
var _TRN_PDFDocGetPageLabel = (Module['_TRN_PDFDocGetPageLabel'] = function () {
  return (_TRN_PDFDocGetPageLabel = Module['_TRN_PDFDocGetPageLabel'] = Module['asm']['bF']).apply(null, arguments);
});
var _TRN_PDFDocSetPageLabel = (Module['_TRN_PDFDocSetPageLabel'] = function () {
  return (_TRN_PDFDocSetPageLabel = Module['_TRN_PDFDocSetPageLabel'] = Module['asm']['cF']).apply(null, arguments);
});
var _TRN_PDFDocRemovePageLabel = (Module['_TRN_PDFDocRemovePageLabel'] = function () {
  return (_TRN_PDFDocRemovePageLabel = Module['_TRN_PDFDocRemovePageLabel'] = Module['asm']['dF']).apply(null, arguments);
});
var _TRN_PDFDocGetStructTree = (Module['_TRN_PDFDocGetStructTree'] = function () {
  return (_TRN_PDFDocGetStructTree = Module['_TRN_PDFDocGetStructTree'] = Module['asm']['eF']).apply(null, arguments);
});
var _TRN_PDFDocGetOCGs = (Module['_TRN_PDFDocGetOCGs'] = function () {
  return (_TRN_PDFDocGetOCGs = Module['_TRN_PDFDocGetOCGs'] = Module['asm']['fF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectName = (Module['_TRN_PDFDocCreateIndirectName'] = function () {
  return (_TRN_PDFDocCreateIndirectName = Module['_TRN_PDFDocCreateIndirectName'] = Module['asm']['gF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectArray = (Module['_TRN_PDFDocCreateIndirectArray'] = function () {
  return (_TRN_PDFDocCreateIndirectArray = Module['_TRN_PDFDocCreateIndirectArray'] = Module['asm']['hF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectBool = (Module['_TRN_PDFDocCreateIndirectBool'] = function () {
  return (_TRN_PDFDocCreateIndirectBool = Module['_TRN_PDFDocCreateIndirectBool'] = Module['asm']['iF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectDict = (Module['_TRN_PDFDocCreateIndirectDict'] = function () {
  return (_TRN_PDFDocCreateIndirectDict = Module['_TRN_PDFDocCreateIndirectDict'] = Module['asm']['jF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectNull = (Module['_TRN_PDFDocCreateIndirectNull'] = function () {
  return (_TRN_PDFDocCreateIndirectNull = Module['_TRN_PDFDocCreateIndirectNull'] = Module['asm']['kF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectNumber = (Module['_TRN_PDFDocCreateIndirectNumber'] = function () {
  return (_TRN_PDFDocCreateIndirectNumber = Module['_TRN_PDFDocCreateIndirectNumber'] = Module['asm']['lF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectStringFromUString = (Module['_TRN_PDFDocCreateIndirectStringFromUString'] = function () {
  return (_TRN_PDFDocCreateIndirectStringFromUString = Module['_TRN_PDFDocCreateIndirectStringFromUString'] = Module['asm']['mF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectStreamFromFilter = (Module['_TRN_PDFDocCreateIndirectStreamFromFilter'] = function () {
  return (_TRN_PDFDocCreateIndirectStreamFromFilter = Module['_TRN_PDFDocCreateIndirectStreamFromFilter'] = Module['asm']['nF']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectStream = (Module['_TRN_PDFDocCreateIndirectStream'] = function () {
  return (_TRN_PDFDocCreateIndirectStream = Module['_TRN_PDFDocCreateIndirectStream'] = Module['asm']['oF']).apply(null, arguments);
});
var _TRN_PDFDocGetSDFDoc = (Module['_TRN_PDFDocGetSDFDoc'] = function () {
  return (_TRN_PDFDocGetSDFDoc = Module['_TRN_PDFDocGetSDFDoc'] = Module['asm']['pF']).apply(null, arguments);
});
var _TRN_PDFDocLock = (Module['_TRN_PDFDocLock'] = function () {
  return (_TRN_PDFDocLock = Module['_TRN_PDFDocLock'] = Module['asm']['qF']).apply(null, arguments);
});
var _TRN_PDFDocUnlock = (Module['_TRN_PDFDocUnlock'] = function () {
  return (_TRN_PDFDocUnlock = Module['_TRN_PDFDocUnlock'] = Module['asm']['rF']).apply(null, arguments);
});
var _TRN_PDFDocLockRead = (Module['_TRN_PDFDocLockRead'] = function () {
  return (_TRN_PDFDocLockRead = Module['_TRN_PDFDocLockRead'] = Module['asm']['sF']).apply(null, arguments);
});
var _TRN_PDFDocUnlockRead = (Module['_TRN_PDFDocUnlockRead'] = function () {
  return (_TRN_PDFDocUnlockRead = Module['_TRN_PDFDocUnlockRead'] = Module['asm']['tF']).apply(null, arguments);
});
var _TRN_PDFDocTryLock = (Module['_TRN_PDFDocTryLock'] = function () {
  return (_TRN_PDFDocTryLock = Module['_TRN_PDFDocTryLock'] = Module['asm']['uF']).apply(null, arguments);
});
var _TRN_PDFDocTimedLock = (Module['_TRN_PDFDocTimedLock'] = function () {
  return (_TRN_PDFDocTimedLock = Module['_TRN_PDFDocTimedLock'] = Module['asm']['vF']).apply(null, arguments);
});
var _TRN_PDFDocTryLockRead = (Module['_TRN_PDFDocTryLockRead'] = function () {
  return (_TRN_PDFDocTryLockRead = Module['_TRN_PDFDocTryLockRead'] = Module['asm']['wF']).apply(null, arguments);
});
var _TRN_PDFDocTimedLockRead = (Module['_TRN_PDFDocTimedLockRead'] = function () {
  return (_TRN_PDFDocTimedLockRead = Module['_TRN_PDFDocTimedLockRead'] = Module['asm']['xF']).apply(null, arguments);
});
var _TRN_PDFDocAddHighlights = (Module['_TRN_PDFDocAddHighlights'] = function () {
  return (_TRN_PDFDocAddHighlights = Module['_TRN_PDFDocAddHighlights'] = Module['asm']['yF']).apply(null, arguments);
});
var _TRN_PDFDocIsTagged = (Module['_TRN_PDFDocIsTagged'] = function () {
  return (_TRN_PDFDocIsTagged = Module['_TRN_PDFDocIsTagged'] = Module['asm']['zF']).apply(null, arguments);
});
var _TRN_PDFDocHasSignatures = (Module['_TRN_PDFDocHasSignatures'] = function () {
  return (_TRN_PDFDocHasSignatures = Module['_TRN_PDFDocHasSignatures'] = Module['asm']['AF']).apply(null, arguments);
});
var _TRN_PDFDocAddSignatureHandler = (Module['_TRN_PDFDocAddSignatureHandler'] = function () {
  return (_TRN_PDFDocAddSignatureHandler = Module['_TRN_PDFDocAddSignatureHandler'] = Module['asm']['BF']).apply(null, arguments);
});
var _TRN_PDFDocAddStdSignatureHandlerFromBuffer = (Module['_TRN_PDFDocAddStdSignatureHandlerFromBuffer'] = function () {
  return (_TRN_PDFDocAddStdSignatureHandlerFromBuffer = Module['_TRN_PDFDocAddStdSignatureHandlerFromBuffer'] = Module['asm']['CF']).apply(null, arguments);
});
var _TRN_PDFDocRemoveSignatureHandler = (Module['_TRN_PDFDocRemoveSignatureHandler'] = function () {
  return (_TRN_PDFDocRemoveSignatureHandler = Module['_TRN_PDFDocRemoveSignatureHandler'] = Module['asm']['DF']).apply(null, arguments);
});
var _TRN_PDFDocGetSignatureHandler = (Module['_TRN_PDFDocGetSignatureHandler'] = function () {
  return (_TRN_PDFDocGetSignatureHandler = Module['_TRN_PDFDocGetSignatureHandler'] = Module['asm']['EF']).apply(null, arguments);
});
var _TRN_PDFDocGenerateThumbnails = (Module['_TRN_PDFDocGenerateThumbnails'] = function () {
  return (_TRN_PDFDocGenerateThumbnails = Module['_TRN_PDFDocGenerateThumbnails'] = Module['asm']['FF']).apply(null, arguments);
});
var _TRN_PDFDocAppendVisualDiff = (Module['_TRN_PDFDocAppendVisualDiff'] = function () {
  return (_TRN_PDFDocAppendVisualDiff = Module['_TRN_PDFDocAppendVisualDiff'] = Module['asm']['GF']).apply(null, arguments);
});
var _TRN_PDFDocGetGeometryCollectionForPage = (Module['_TRN_PDFDocGetGeometryCollectionForPage'] = function () {
  return (_TRN_PDFDocGetGeometryCollectionForPage = Module['_TRN_PDFDocGetGeometryCollectionForPage'] = Module['asm']['HF']).apply(null, arguments);
});
var _TRN_PDFDocGetGeometryCollectionForPageWithOptions = (Module['_TRN_PDFDocGetGeometryCollectionForPageWithOptions'] = function () {
  return (_TRN_PDFDocGetGeometryCollectionForPageWithOptions = Module['_TRN_PDFDocGetGeometryCollectionForPageWithOptions'] = Module['asm']['IF']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFDocGetUndoManager = (Module['_TRN_PDFDocGetUndoManager'] = function () {
  return (_TRN_PDFDocGetUndoManager = Module['_TRN_PDFDocGetUndoManager'] = Module['asm']['JF']).apply(null, arguments);
});
var _TRN_PDFDocCreateDigitalSignatureField = (Module['_TRN_PDFDocCreateDigitalSignatureField'] = function () {
  return (_TRN_PDFDocCreateDigitalSignatureField = Module['_TRN_PDFDocCreateDigitalSignatureField'] = Module['asm']['KF']).apply(null, arguments);
});
var _TRN_PDFDocGetDigitalSignatureFieldIteratorBegin = (Module['_TRN_PDFDocGetDigitalSignatureFieldIteratorBegin'] = function () {
  return (_TRN_PDFDocGetDigitalSignatureFieldIteratorBegin = Module['_TRN_PDFDocGetDigitalSignatureFieldIteratorBegin'] = Module['asm']['LF']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFDocGetDigitalSignaturePermissions = (Module['_TRN_PDFDocGetDigitalSignaturePermissions'] = function () {
  return (_TRN_PDFDocGetDigitalSignaturePermissions = Module['_TRN_PDFDocGetDigitalSignaturePermissions'] = Module['asm']['MF']).apply(null, arguments);
});
var _TRN_PDFDocSaveViewerOptimizedBuffer = (Module['_TRN_PDFDocSaveViewerOptimizedBuffer'] = function () {
  return (_TRN_PDFDocSaveViewerOptimizedBuffer = Module['_TRN_PDFDocSaveViewerOptimizedBuffer'] = Module['asm']['NF']).apply(null, arguments);
});
var _TRN_PDFDocVerifySignedDigitalSignatures = (Module['_TRN_PDFDocVerifySignedDigitalSignatures'] = function () {
  return (_TRN_PDFDocVerifySignedDigitalSignatures = Module['_TRN_PDFDocVerifySignedDigitalSignatures'] = Module['asm']['OF']).apply(null, arguments);
});
var _TRN_PDFDocMergeXFDF = (Module['_TRN_PDFDocMergeXFDF'] = function () {
  return (_TRN_PDFDocMergeXFDF = Module['_TRN_PDFDocMergeXFDF'] = Module['asm']['PF']).apply(null, arguments);
});
var _TRN_PDFDocMergeXFDFString = (Module['_TRN_PDFDocMergeXFDFString'] = function () {
  return (_TRN_PDFDocMergeXFDFString = Module['_TRN_PDFDocMergeXFDFString'] = Module['asm']['QF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetTitle = (Module['_TRN_PDFDocInfoGetTitle'] = function () {
  return (_TRN_PDFDocInfoGetTitle = Module['_TRN_PDFDocInfoGetTitle'] = Module['asm']['RF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetTitleObj = (Module['_TRN_PDFDocInfoGetTitleObj'] = function () {
  return (_TRN_PDFDocInfoGetTitleObj = Module['_TRN_PDFDocInfoGetTitleObj'] = Module['asm']['SF']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetTitle = (Module['_TRN_PDFDocInfoSetTitle'] = function () {
  return (_TRN_PDFDocInfoSetTitle = Module['_TRN_PDFDocInfoSetTitle'] = Module['asm']['TF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetAuthor = (Module['_TRN_PDFDocInfoGetAuthor'] = function () {
  return (_TRN_PDFDocInfoGetAuthor = Module['_TRN_PDFDocInfoGetAuthor'] = Module['asm']['UF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetAuthorObj = (Module['_TRN_PDFDocInfoGetAuthorObj'] = function () {
  return (_TRN_PDFDocInfoGetAuthorObj = Module['_TRN_PDFDocInfoGetAuthorObj'] = Module['asm']['VF']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetAuthor = (Module['_TRN_PDFDocInfoSetAuthor'] = function () {
  return (_TRN_PDFDocInfoSetAuthor = Module['_TRN_PDFDocInfoSetAuthor'] = Module['asm']['WF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetSubject = (Module['_TRN_PDFDocInfoGetSubject'] = function () {
  return (_TRN_PDFDocInfoGetSubject = Module['_TRN_PDFDocInfoGetSubject'] = Module['asm']['XF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetSubjectObj = (Module['_TRN_PDFDocInfoGetSubjectObj'] = function () {
  return (_TRN_PDFDocInfoGetSubjectObj = Module['_TRN_PDFDocInfoGetSubjectObj'] = Module['asm']['YF']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetSubject = (Module['_TRN_PDFDocInfoSetSubject'] = function () {
  return (_TRN_PDFDocInfoSetSubject = Module['_TRN_PDFDocInfoSetSubject'] = Module['asm']['ZF']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetKeywords = (Module['_TRN_PDFDocInfoGetKeywords'] = function () {
  return (_TRN_PDFDocInfoGetKeywords = Module['_TRN_PDFDocInfoGetKeywords'] = Module['asm']['_F']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetKeywordsObj = (Module['_TRN_PDFDocInfoGetKeywordsObj'] = function () {
  return (_TRN_PDFDocInfoGetKeywordsObj = Module['_TRN_PDFDocInfoGetKeywordsObj'] = Module['asm']['$F']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetKeywords = (Module['_TRN_PDFDocInfoSetKeywords'] = function () {
  return (_TRN_PDFDocInfoSetKeywords = Module['_TRN_PDFDocInfoSetKeywords'] = Module['asm']['aG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetCreator = (Module['_TRN_PDFDocInfoGetCreator'] = function () {
  return (_TRN_PDFDocInfoGetCreator = Module['_TRN_PDFDocInfoGetCreator'] = Module['asm']['bG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetCreatorObj = (Module['_TRN_PDFDocInfoGetCreatorObj'] = function () {
  return (_TRN_PDFDocInfoGetCreatorObj = Module['_TRN_PDFDocInfoGetCreatorObj'] = Module['asm']['cG']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetCreator = (Module['_TRN_PDFDocInfoSetCreator'] = function () {
  return (_TRN_PDFDocInfoSetCreator = Module['_TRN_PDFDocInfoSetCreator'] = Module['asm']['dG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetProducer = (Module['_TRN_PDFDocInfoGetProducer'] = function () {
  return (_TRN_PDFDocInfoGetProducer = Module['_TRN_PDFDocInfoGetProducer'] = Module['asm']['eG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetProducerObj = (Module['_TRN_PDFDocInfoGetProducerObj'] = function () {
  return (_TRN_PDFDocInfoGetProducerObj = Module['_TRN_PDFDocInfoGetProducerObj'] = Module['asm']['fG']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetProducer = (Module['_TRN_PDFDocInfoSetProducer'] = function () {
  return (_TRN_PDFDocInfoSetProducer = Module['_TRN_PDFDocInfoSetProducer'] = Module['asm']['gG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetCreationDate = (Module['_TRN_PDFDocInfoGetCreationDate'] = function () {
  return (_TRN_PDFDocInfoGetCreationDate = Module['_TRN_PDFDocInfoGetCreationDate'] = Module['asm']['hG']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetCreationDate = (Module['_TRN_PDFDocInfoSetCreationDate'] = function () {
  return (_TRN_PDFDocInfoSetCreationDate = Module['_TRN_PDFDocInfoSetCreationDate'] = Module['asm']['iG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetModDate = (Module['_TRN_PDFDocInfoGetModDate'] = function () {
  return (_TRN_PDFDocInfoGetModDate = Module['_TRN_PDFDocInfoGetModDate'] = Module['asm']['jG']).apply(null, arguments);
});
var _TRN_PDFDocInfoSetModDate = (Module['_TRN_PDFDocInfoSetModDate'] = function () {
  return (_TRN_PDFDocInfoSetModDate = Module['_TRN_PDFDocInfoSetModDate'] = Module['asm']['kG']).apply(null, arguments);
});
var _TRN_PDFDocInfoGetSDFObj = (Module['_TRN_PDFDocInfoGetSDFObj'] = function () {
  return (_TRN_PDFDocInfoGetSDFObj = Module['_TRN_PDFDocInfoGetSDFObj'] = Module['asm']['lG']).apply(null, arguments);
});
var _TRN_PDFDocInfoCreate = (Module['_TRN_PDFDocInfoCreate'] = function () {
  return (_TRN_PDFDocInfoCreate = Module['_TRN_PDFDocInfoCreate'] = Module['asm']['mG']).apply(null, arguments);
});
var _TRN_PDFDocInfoCopy = (Module['_TRN_PDFDocInfoCopy'] = function () {
  return (_TRN_PDFDocInfoCopy = Module['_TRN_PDFDocInfoCopy'] = Module['asm']['nG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetInitialPage = (Module['_TRN_PDFDocViewPrefsSetInitialPage'] = function () {
  return (_TRN_PDFDocViewPrefsSetInitialPage = Module['_TRN_PDFDocViewPrefsSetInitialPage'] = Module['asm']['oG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetPageMode = (Module['_TRN_PDFDocViewPrefsSetPageMode'] = function () {
  return (_TRN_PDFDocViewPrefsSetPageMode = Module['_TRN_PDFDocViewPrefsSetPageMode'] = Module['asm']['pG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetPageMode = (Module['_TRN_PDFDocViewPrefsGetPageMode'] = function () {
  return (_TRN_PDFDocViewPrefsGetPageMode = Module['_TRN_PDFDocViewPrefsGetPageMode'] = Module['asm']['qG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetLayoutMode = (Module['_TRN_PDFDocViewPrefsSetLayoutMode'] = function () {
  return (_TRN_PDFDocViewPrefsSetLayoutMode = Module['_TRN_PDFDocViewPrefsSetLayoutMode'] = Module['asm']['rG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetLayoutMode = (Module['_TRN_PDFDocViewPrefsGetLayoutMode'] = function () {
  return (_TRN_PDFDocViewPrefsGetLayoutMode = Module['_TRN_PDFDocViewPrefsGetLayoutMode'] = Module['asm']['sG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetPref = (Module['_TRN_PDFDocViewPrefsSetPref'] = function () {
  return (_TRN_PDFDocViewPrefsSetPref = Module['_TRN_PDFDocViewPrefsSetPref'] = Module['asm']['tG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetPref = (Module['_TRN_PDFDocViewPrefsGetPref'] = function () {
  return (_TRN_PDFDocViewPrefsGetPref = Module['_TRN_PDFDocViewPrefsGetPref'] = Module['asm']['uG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetNonFullScreenPageMode = (Module['_TRN_PDFDocViewPrefsSetNonFullScreenPageMode'] = function () {
  return (_TRN_PDFDocViewPrefsSetNonFullScreenPageMode = Module['_TRN_PDFDocViewPrefsSetNonFullScreenPageMode'] = Module['asm']['vG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetNonFullScreenPageMode = (Module['_TRN_PDFDocViewPrefsGetNonFullScreenPageMode'] = function () {
  return (_TRN_PDFDocViewPrefsGetNonFullScreenPageMode = Module['_TRN_PDFDocViewPrefsGetNonFullScreenPageMode'] = Module['asm']['wG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetDirection = (Module['_TRN_PDFDocViewPrefsSetDirection'] = function () {
  return (_TRN_PDFDocViewPrefsSetDirection = Module['_TRN_PDFDocViewPrefsSetDirection'] = Module['asm']['xG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetDirection = (Module['_TRN_PDFDocViewPrefsGetDirection'] = function () {
  return (_TRN_PDFDocViewPrefsGetDirection = Module['_TRN_PDFDocViewPrefsGetDirection'] = Module['asm']['yG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetViewArea = (Module['_TRN_PDFDocViewPrefsSetViewArea'] = function () {
  return (_TRN_PDFDocViewPrefsSetViewArea = Module['_TRN_PDFDocViewPrefsSetViewArea'] = Module['asm']['zG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetViewArea = (Module['_TRN_PDFDocViewPrefsGetViewArea'] = function () {
  return (_TRN_PDFDocViewPrefsGetViewArea = Module['_TRN_PDFDocViewPrefsGetViewArea'] = Module['asm']['AG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetViewClip = (Module['_TRN_PDFDocViewPrefsSetViewClip'] = function () {
  return (_TRN_PDFDocViewPrefsSetViewClip = Module['_TRN_PDFDocViewPrefsSetViewClip'] = Module['asm']['BG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetViewClip = (Module['_TRN_PDFDocViewPrefsGetViewClip'] = function () {
  return (_TRN_PDFDocViewPrefsGetViewClip = Module['_TRN_PDFDocViewPrefsGetViewClip'] = Module['asm']['CG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetPrintArea = (Module['_TRN_PDFDocViewPrefsSetPrintArea'] = function () {
  return (_TRN_PDFDocViewPrefsSetPrintArea = Module['_TRN_PDFDocViewPrefsSetPrintArea'] = Module['asm']['DG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetPrintArea = (Module['_TRN_PDFDocViewPrefsGetPrintArea'] = function () {
  return (_TRN_PDFDocViewPrefsGetPrintArea = Module['_TRN_PDFDocViewPrefsGetPrintArea'] = Module['asm']['EG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsSetPrintClip = (Module['_TRN_PDFDocViewPrefsSetPrintClip'] = function () {
  return (_TRN_PDFDocViewPrefsSetPrintClip = Module['_TRN_PDFDocViewPrefsSetPrintClip'] = Module['asm']['FG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetPrintClip = (Module['_TRN_PDFDocViewPrefsGetPrintClip'] = function () {
  return (_TRN_PDFDocViewPrefsGetPrintClip = Module['_TRN_PDFDocViewPrefsGetPrintClip'] = Module['asm']['GG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsGetSDFObj = (Module['_TRN_PDFDocViewPrefsGetSDFObj'] = function () {
  return (_TRN_PDFDocViewPrefsGetSDFObj = Module['_TRN_PDFDocViewPrefsGetSDFObj'] = Module['asm']['HG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsCreate = (Module['_TRN_PDFDocViewPrefsCreate'] = function () {
  return (_TRN_PDFDocViewPrefsCreate = Module['_TRN_PDFDocViewPrefsCreate'] = Module['asm']['IG']).apply(null, arguments);
});
var _TRN_PDFDocViewPrefsCopy = (Module['_TRN_PDFDocViewPrefsCopy'] = function () {
  return (_TRN_PDFDocViewPrefsCopy = Module['_TRN_PDFDocViewPrefsCopy'] = Module['asm']['JG']).apply(null, arguments);
});
var _TRN_PDFRasterizerCreate = (Module['_TRN_PDFRasterizerCreate'] = function () {
  return (_TRN_PDFRasterizerCreate = Module['_TRN_PDFRasterizerCreate'] = Module['asm']['KG']).apply(null, arguments);
});
var _TRN_PDFRasterizerDestroy = (Module['_TRN_PDFRasterizerDestroy'] = function () {
  return (_TRN_PDFRasterizerDestroy = Module['_TRN_PDFRasterizerDestroy'] = Module['asm']['LG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetDrawAnnotations = (Module['_TRN_PDFRasterizerSetDrawAnnotations'] = function () {
  return (_TRN_PDFRasterizerSetDrawAnnotations = Module['_TRN_PDFRasterizerSetDrawAnnotations'] = Module['asm']['MG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetHighlightFields = (Module['_TRN_PDFRasterizerSetHighlightFields'] = function () {
  return (_TRN_PDFRasterizerSetHighlightFields = Module['_TRN_PDFRasterizerSetHighlightFields'] = Module['asm']['NG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetAntiAliasing = (Module['_TRN_PDFRasterizerSetAntiAliasing'] = function () {
  return (_TRN_PDFRasterizerSetAntiAliasing = Module['_TRN_PDFRasterizerSetAntiAliasing'] = Module['asm']['OG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetPathHinting = (Module['_TRN_PDFRasterizerSetPathHinting'] = function () {
  return (_TRN_PDFRasterizerSetPathHinting = Module['_TRN_PDFRasterizerSetPathHinting'] = Module['asm']['PG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetThinLineAdjustment = (Module['_TRN_PDFRasterizerSetThinLineAdjustment'] = function () {
  return (_TRN_PDFRasterizerSetThinLineAdjustment = Module['_TRN_PDFRasterizerSetThinLineAdjustment'] = Module['asm']['QG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetGamma = (Module['_TRN_PDFRasterizerSetGamma'] = function () {
  return (_TRN_PDFRasterizerSetGamma = Module['_TRN_PDFRasterizerSetGamma'] = Module['asm']['RG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetOCGContext = (Module['_TRN_PDFRasterizerSetOCGContext'] = function () {
  return (_TRN_PDFRasterizerSetOCGContext = Module['_TRN_PDFRasterizerSetOCGContext'] = Module['asm']['SG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetPrintMode = (Module['_TRN_PDFRasterizerSetPrintMode'] = function () {
  return (_TRN_PDFRasterizerSetPrintMode = Module['_TRN_PDFRasterizerSetPrintMode'] = Module['asm']['TG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetImageSmoothing = (Module['_TRN_PDFRasterizerSetImageSmoothing'] = function () {
  return (_TRN_PDFRasterizerSetImageSmoothing = Module['_TRN_PDFRasterizerSetImageSmoothing'] = Module['asm']['UG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetOverprint = (Module['_TRN_PDFRasterizerSetOverprint'] = function () {
  return (_TRN_PDFRasterizerSetOverprint = Module['_TRN_PDFRasterizerSetOverprint'] = Module['asm']['VG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetCaching = (Module['_TRN_PDFRasterizerSetCaching'] = function () {
  return (_TRN_PDFRasterizerSetCaching = Module['_TRN_PDFRasterizerSetCaching'] = Module['asm']['WG']).apply(null, arguments);
});
var _TRN_PDFDrawSetOCGContext = (Module['_TRN_PDFDrawSetOCGContext'] = function () {
  return (_TRN_PDFDrawSetOCGContext = Module['_TRN_PDFDrawSetOCGContext'] = Module['asm']['XG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetAnnotationState = (Module['_TRN_PDFRasterizerSetAnnotationState'] = function () {
  return (_TRN_PDFRasterizerSetAnnotationState = Module['_TRN_PDFRasterizerSetAnnotationState'] = Module['asm']['YG']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetRasterizerType = (Module['_TRN_PDFRasterizerSetRasterizerType'] = function () {
  return (_TRN_PDFRasterizerSetRasterizerType = Module['_TRN_PDFRasterizerSetRasterizerType'] = Module['asm']['ZG']).apply(null, arguments);
});
var _TRN_PDFRasterizerGetRasterizerType = (Module['_TRN_PDFRasterizerGetRasterizerType'] = function () {
  return (_TRN_PDFRasterizerGetRasterizerType = Module['_TRN_PDFRasterizerGetRasterizerType'] = Module['asm']['_G']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetColorPostProcessMode = (Module['_TRN_PDFRasterizerSetColorPostProcessMode'] = function () {
  return (_TRN_PDFRasterizerSetColorPostProcessMode = Module['_TRN_PDFRasterizerSetColorPostProcessMode'] = Module['asm']['$G']).apply(null, arguments);
});
var _TRN_PDFRasterizerGetColorPostProcessMode = (Module['_TRN_PDFRasterizerGetColorPostProcessMode'] = function () {
  return (_TRN_PDFRasterizerGetColorPostProcessMode = Module['_TRN_PDFRasterizerGetColorPostProcessMode'] = Module['asm']['aH']).apply(null, arguments);
});
var _TRN_PDFRasterizerEnableDisplayListCaching = (Module['_TRN_PDFRasterizerEnableDisplayListCaching'] = function () {
  return (_TRN_PDFRasterizerEnableDisplayListCaching = Module['_TRN_PDFRasterizerEnableDisplayListCaching'] = Module['asm']['bH']).apply(null, arguments);
});
var _TRN_PDFRasterizerUpdateBuffer = (Module['_TRN_PDFRasterizerUpdateBuffer'] = function () {
  return (_TRN_PDFRasterizerUpdateBuffer = Module['_TRN_PDFRasterizerUpdateBuffer'] = Module['asm']['cH']).apply(null, arguments);
});
var _TRN_PDFRasterizerRasterizeAnnot = (Module['_TRN_PDFRasterizerRasterizeAnnot'] = function () {
  return (_TRN_PDFRasterizerRasterizeAnnot = Module['_TRN_PDFRasterizerRasterizeAnnot'] = Module['asm']['dH']).apply(null, arguments);
});
var _TRN_PDFRasterizerRasterizeSeparations = (Module['_TRN_PDFRasterizerRasterizeSeparations'] = function () {
  return (_TRN_PDFRasterizerRasterizeSeparations = Module['_TRN_PDFRasterizerRasterizeSeparations'] = Module['asm']['eH']).apply(null, arguments);
});
var _TRN_PDFDrawCreate = (Module['_TRN_PDFDrawCreate'] = function () {
  return (_TRN_PDFDrawCreate = Module['_TRN_PDFDrawCreate'] = Module['asm']['fH']).apply(null, arguments);
});
var _TRN_PDFDrawDestroy = (Module['_TRN_PDFDrawDestroy'] = function () {
  return (_TRN_PDFDrawDestroy = Module['_TRN_PDFDrawDestroy'] = Module['asm']['gH']).apply(null, arguments);
});
var _TRN_PDFDrawSetRasterizerType = (Module['_TRN_PDFDrawSetRasterizerType'] = function () {
  return (_TRN_PDFDrawSetRasterizerType = Module['_TRN_PDFDrawSetRasterizerType'] = Module['asm']['hH']).apply(null, arguments);
});
var _TRN_PDFDrawSetDPI = (Module['_TRN_PDFDrawSetDPI'] = function () {
  return (_TRN_PDFDrawSetDPI = Module['_TRN_PDFDrawSetDPI'] = Module['asm']['iH']).apply(null, arguments);
});
var _TRN_PDFDrawSetImageSize = (Module['_TRN_PDFDrawSetImageSize'] = function () {
  return (_TRN_PDFDrawSetImageSize = Module['_TRN_PDFDrawSetImageSize'] = Module['asm']['jH']).apply(null, arguments);
});
var _TRN_PDFDrawSetPageBox = (Module['_TRN_PDFDrawSetPageBox'] = function () {
  return (_TRN_PDFDrawSetPageBox = Module['_TRN_PDFDrawSetPageBox'] = Module['asm']['kH']).apply(null, arguments);
});
var _TRN_PDFDrawSetClipRect = (Module['_TRN_PDFDrawSetClipRect'] = function () {
  return (_TRN_PDFDrawSetClipRect = Module['_TRN_PDFDrawSetClipRect'] = Module['asm']['lH']).apply(null, arguments);
});
var _TRN_PDFDrawSetFlipYAxis = (Module['_TRN_PDFDrawSetFlipYAxis'] = function () {
  return (_TRN_PDFDrawSetFlipYAxis = Module['_TRN_PDFDrawSetFlipYAxis'] = Module['asm']['mH']).apply(null, arguments);
});
var _TRN_PDFDrawSetRotate = (Module['_TRN_PDFDrawSetRotate'] = function () {
  return (_TRN_PDFDrawSetRotate = Module['_TRN_PDFDrawSetRotate'] = Module['asm']['nH']).apply(null, arguments);
});
var _TRN_PDFDrawSetDrawAnnotations = (Module['_TRN_PDFDrawSetDrawAnnotations'] = function () {
  return (_TRN_PDFDrawSetDrawAnnotations = Module['_TRN_PDFDrawSetDrawAnnotations'] = Module['asm']['oH']).apply(null, arguments);
});
var _TRN_PDFDrawSetHighlightFields = (Module['_TRN_PDFDrawSetHighlightFields'] = function () {
  return (_TRN_PDFDrawSetHighlightFields = Module['_TRN_PDFDrawSetHighlightFields'] = Module['asm']['pH']).apply(null, arguments);
});
var _TRN_PDFDrawSetAntiAliasing = (Module['_TRN_PDFDrawSetAntiAliasing'] = function () {
  return (_TRN_PDFDrawSetAntiAliasing = Module['_TRN_PDFDrawSetAntiAliasing'] = Module['asm']['qH']).apply(null, arguments);
});
var _TRN_PDFDrawSetPathHinting = (Module['_TRN_PDFDrawSetPathHinting'] = function () {
  return (_TRN_PDFDrawSetPathHinting = Module['_TRN_PDFDrawSetPathHinting'] = Module['asm']['rH']).apply(null, arguments);
});
var _TRN_PDFDrawSetThinLineAdjustment = (Module['_TRN_PDFDrawSetThinLineAdjustment'] = function () {
  return (_TRN_PDFDrawSetThinLineAdjustment = Module['_TRN_PDFDrawSetThinLineAdjustment'] = Module['asm']['sH']).apply(null, arguments);
});
var _TRN_PDFDrawSetGamma = (Module['_TRN_PDFDrawSetGamma'] = function () {
  return (_TRN_PDFDrawSetGamma = Module['_TRN_PDFDrawSetGamma'] = Module['asm']['tH']).apply(null, arguments);
});
var _TRN_PDFDrawSetPrintMode = (Module['_TRN_PDFDrawSetPrintMode'] = function () {
  return (_TRN_PDFDrawSetPrintMode = Module['_TRN_PDFDrawSetPrintMode'] = Module['asm']['uH']).apply(null, arguments);
});
var _TRN_PDFDrawSetPageTransparent = (Module['_TRN_PDFDrawSetPageTransparent'] = function () {
  return (_TRN_PDFDrawSetPageTransparent = Module['_TRN_PDFDrawSetPageTransparent'] = Module['asm']['vH']).apply(null, arguments);
});
var _TRN_PDFDrawSetDefaultPageColor = (Module['_TRN_PDFDrawSetDefaultPageColor'] = function () {
  return (_TRN_PDFDrawSetDefaultPageColor = Module['_TRN_PDFDrawSetDefaultPageColor'] = Module['asm']['wH']).apply(null, arguments);
});
var _TRN_PDFDrawSetOverprint = (Module['_TRN_PDFDrawSetOverprint'] = function () {
  return (_TRN_PDFDrawSetOverprint = Module['_TRN_PDFDrawSetOverprint'] = Module['asm']['xH']).apply(null, arguments);
});
var _TRN_PDFDrawSetImageSmoothing = (Module['_TRN_PDFDrawSetImageSmoothing'] = function () {
  return (_TRN_PDFDrawSetImageSmoothing = Module['_TRN_PDFDrawSetImageSmoothing'] = Module['asm']['yH']).apply(null, arguments);
});
var _TRN_PDFDrawSetCaching = (Module['_TRN_PDFDrawSetCaching'] = function () {
  return (_TRN_PDFDrawSetCaching = Module['_TRN_PDFDrawSetCaching'] = Module['asm']['zH']).apply(null, arguments);
});
var _TRN_PDFDrawSetColorPostProcessMode = (Module['_TRN_PDFDrawSetColorPostProcessMode'] = function () {
  return (_TRN_PDFDrawSetColorPostProcessMode = Module['_TRN_PDFDrawSetColorPostProcessMode'] = Module['asm']['AH']).apply(null, arguments);
});
var _TRN_PDFDrawGetSeparationBitmaps = (Module['_TRN_PDFDrawGetSeparationBitmaps'] = function () {
  return (_TRN_PDFDrawGetSeparationBitmaps = Module['_TRN_PDFDrawGetSeparationBitmaps'] = Module['asm']['BH']).apply(null, arguments);
});
var _TRN_PDFNetEnableJavaScript = (Module['_TRN_PDFNetEnableJavaScript'] = function () {
  return (_TRN_PDFNetEnableJavaScript = Module['_TRN_PDFNetEnableJavaScript'] = Module['asm']['CH']).apply(null, arguments);
});
var _TRN_PDFNetIsJavaScriptEnabled = (Module['_TRN_PDFNetIsJavaScriptEnabled'] = function () {
  return (_TRN_PDFNetIsJavaScriptEnabled = Module['_TRN_PDFNetIsJavaScriptEnabled'] = Module['asm']['DH']).apply(null, arguments);
});
var _TRN_PDFNetTerminateEx = (Module['_TRN_PDFNetTerminateEx'] = function () {
  return (_TRN_PDFNetTerminateEx = Module['_TRN_PDFNetTerminateEx'] = Module['asm']['EH']).apply(null, arguments);
});
var _TRN_PDFNetSetColorManagement = (Module['_TRN_PDFNetSetColorManagement'] = function () {
  return (_TRN_PDFNetSetColorManagement = Module['_TRN_PDFNetSetColorManagement'] = Module['asm']['FH']).apply(null, arguments);
});
var _TRN_PDFNetSetDefaultDeviceCMYKProfileFromFilter = (Module['_TRN_PDFNetSetDefaultDeviceCMYKProfileFromFilter'] = function () {
  return (_TRN_PDFNetSetDefaultDeviceCMYKProfileFromFilter = Module['_TRN_PDFNetSetDefaultDeviceCMYKProfileFromFilter'] = Module['asm']['GH']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFNetSetDefaultDeviceRGBProfileFromFilter = (Module['_TRN_PDFNetSetDefaultDeviceRGBProfileFromFilter'] = function () {
  return (_TRN_PDFNetSetDefaultDeviceRGBProfileFromFilter = Module['_TRN_PDFNetSetDefaultDeviceRGBProfileFromFilter'] = Module['asm']['HH']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFNetSetDefaultFlateCompressionLevel = (Module['_TRN_PDFNetSetDefaultFlateCompressionLevel'] = function () {
  return (_TRN_PDFNetSetDefaultFlateCompressionLevel = Module['_TRN_PDFNetSetDefaultFlateCompressionLevel'] = Module['asm']['IH']).apply(null, arguments);
});
var _TRN_PDFNetSetViewerCache = (Module['_TRN_PDFNetSetViewerCache'] = function () {
  return (_TRN_PDFNetSetViewerCache = Module['_TRN_PDFNetSetViewerCache'] = Module['asm']['JH']).apply(null, arguments);
});
var _TRN_PDFNetGetVersion = (Module['_TRN_PDFNetGetVersion'] = function () {
  return (_TRN_PDFNetGetVersion = Module['_TRN_PDFNetGetVersion'] = Module['asm']['KH']).apply(null, arguments);
});
var _TRN_PDFNetSetLogLevel = (Module['_TRN_PDFNetSetLogLevel'] = function () {
  return (_TRN_PDFNetSetLogLevel = Module['_TRN_PDFNetSetLogLevel'] = Module['asm']['LH']).apply(null, arguments);
});
var _TRN_PDFNetGetSystemFontList = (Module['_TRN_PDFNetGetSystemFontList'] = function () {
  return (_TRN_PDFNetGetSystemFontList = Module['_TRN_PDFNetGetSystemFontList'] = Module['asm']['MH']).apply(null, arguments);
});
var _TRN_PDFNetAddPDFTronCustomHandler = (Module['_TRN_PDFNetAddPDFTronCustomHandler'] = function () {
  return (_TRN_PDFNetAddPDFTronCustomHandler = Module['_TRN_PDFNetAddPDFTronCustomHandler'] = Module['asm']['NH']).apply(null, arguments);
});
var _TRN_PDFNetGetVersionString = (Module['_TRN_PDFNetGetVersionString'] = function () {
  return (_TRN_PDFNetGetVersionString = Module['_TRN_PDFNetGetVersionString'] = Module['asm']['OH']).apply(null, arguments);
});
var _TRN_PDFNetSetConnectionErrorHandlingMode = (Module['_TRN_PDFNetSetConnectionErrorHandlingMode'] = function () {
  return (_TRN_PDFNetSetConnectionErrorHandlingMode = Module['_TRN_PDFNetSetConnectionErrorHandlingMode'] = Module['asm']['PH']).apply(null, arguments);
});
var _TRN_RectInit = (Module['_TRN_RectInit'] = function () {
  return (_TRN_RectInit = Module['_TRN_RectInit'] = Module['asm']['QH']).apply(null, arguments);
});
var _TRN_RectAttach = (Module['_TRN_RectAttach'] = function () {
  return (_TRN_RectAttach = Module['_TRN_RectAttach'] = Module['asm']['RH']).apply(null, arguments);
});
var _TRN_RectUpdate = (Module['_TRN_RectUpdate'] = function () {
  return (_TRN_RectUpdate = Module['_TRN_RectUpdate'] = Module['asm']['SH']).apply(null, arguments);
});
var _TRN_RectGet = (Module['_TRN_RectGet'] = function () {
  return (_TRN_RectGet = Module['_TRN_RectGet'] = Module['asm']['TH']).apply(null, arguments);
});
var _TRN_RectSet = (Module['_TRN_RectSet'] = function () {
  return (_TRN_RectSet = Module['_TRN_RectSet'] = Module['asm']['UH']).apply(null, arguments);
});
var _TRN_RectWidth = (Module['_TRN_RectWidth'] = function () {
  return (_TRN_RectWidth = Module['_TRN_RectWidth'] = Module['asm']['VH']).apply(null, arguments);
});
var _TRN_RectHeight = (Module['_TRN_RectHeight'] = function () {
  return (_TRN_RectHeight = Module['_TRN_RectHeight'] = Module['asm']['WH']).apply(null, arguments);
});
var _TRN_RectContains = (Module['_TRN_RectContains'] = function () {
  return (_TRN_RectContains = Module['_TRN_RectContains'] = Module['asm']['XH']).apply(null, arguments);
});
var _TRN_RectIntersectRect = (Module['_TRN_RectIntersectRect'] = function () {
  return (_TRN_RectIntersectRect = Module['_TRN_RectIntersectRect'] = Module['asm']['YH']).apply(null, arguments);
});
var _TRN_RectNormalize = (Module['_TRN_RectNormalize'] = function () {
  return (_TRN_RectNormalize = Module['_TRN_RectNormalize'] = Module['asm']['ZH']).apply(null, arguments);
});
var _TRN_RectInflate1 = (Module['_TRN_RectInflate1'] = function () {
  return (_TRN_RectInflate1 = Module['_TRN_RectInflate1'] = Module['asm']['_H']).apply(null, arguments);
});
var _TRN_RectInflate2 = (Module['_TRN_RectInflate2'] = function () {
  return (_TRN_RectInflate2 = Module['_TRN_RectInflate2'] = Module['asm']['$H']).apply(null, arguments);
});
var _TRN_Redactor_RedactionCreate = (Module['_TRN_Redactor_RedactionCreate'] = function () {
  return (_TRN_Redactor_RedactionCreate = Module['_TRN_Redactor_RedactionCreate'] = Module['asm']['aI']).apply(null, arguments);
});
var _TRN_Redactor_RedactionDestroy = (Module['_TRN_Redactor_RedactionDestroy'] = function () {
  return (_TRN_Redactor_RedactionDestroy = Module['_TRN_Redactor_RedactionDestroy'] = Module['asm']['bI']).apply(null, arguments);
});
var _TRN_Redactor_RedactionCopy = (Module['_TRN_Redactor_RedactionCopy'] = function () {
  return (_TRN_Redactor_RedactionCopy = Module['_TRN_Redactor_RedactionCopy'] = Module['asm']['cI']).apply(null, arguments);
});
var _TRN_ShadingCreate = (Module['_TRN_ShadingCreate'] = function () {
  return (_TRN_ShadingCreate = Module['_TRN_ShadingCreate'] = Module['asm']['dI']).apply(null, arguments);
});
var _TRN_ShadingDestroy = (Module['_TRN_ShadingDestroy'] = function () {
  return (_TRN_ShadingDestroy = Module['_TRN_ShadingDestroy'] = Module['asm']['eI']).apply(null, arguments);
});
var _TRN_ShadingGetTypeFromObj = (Module['_TRN_ShadingGetTypeFromObj'] = function () {
  return (_TRN_ShadingGetTypeFromObj = Module['_TRN_ShadingGetTypeFromObj'] = Module['asm']['fI']).apply(null, arguments);
});
var _TRN_ShadingGetType = (Module['_TRN_ShadingGetType'] = function () {
  return (_TRN_ShadingGetType = Module['_TRN_ShadingGetType'] = Module['asm']['gI']).apply(null, arguments);
});
var _TRN_ShadingGetSDFObj = (Module['_TRN_ShadingGetSDFObj'] = function () {
  return (_TRN_ShadingGetSDFObj = Module['_TRN_ShadingGetSDFObj'] = Module['asm']['hI']).apply(null, arguments);
});
var _TRN_ShadingGetBaseColorSpace = (Module['_TRN_ShadingGetBaseColorSpace'] = function () {
  return (_TRN_ShadingGetBaseColorSpace = Module['_TRN_ShadingGetBaseColorSpace'] = Module['asm']['iI']).apply(null, arguments);
});
var _TRN_ShadingHasBBox = (Module['_TRN_ShadingHasBBox'] = function () {
  return (_TRN_ShadingHasBBox = Module['_TRN_ShadingHasBBox'] = Module['asm']['jI']).apply(null, arguments);
});
var _TRN_ShadingGetBBox = (Module['_TRN_ShadingGetBBox'] = function () {
  return (_TRN_ShadingGetBBox = Module['_TRN_ShadingGetBBox'] = Module['asm']['kI']).apply(null, arguments);
});
var _TRN_ShadingHasBackground = (Module['_TRN_ShadingHasBackground'] = function () {
  return (_TRN_ShadingHasBackground = Module['_TRN_ShadingHasBackground'] = Module['asm']['lI']).apply(null, arguments);
});
var _TRN_ShadingGetBackground = (Module['_TRN_ShadingGetBackground'] = function () {
  return (_TRN_ShadingGetBackground = Module['_TRN_ShadingGetBackground'] = Module['asm']['mI']).apply(null, arguments);
});
var _TRN_ShadingGetAntialias = (Module['_TRN_ShadingGetAntialias'] = function () {
  return (_TRN_ShadingGetAntialias = Module['_TRN_ShadingGetAntialias'] = Module['asm']['nI']).apply(null, arguments);
});
var _TRN_ShadingGetParamStart = (Module['_TRN_ShadingGetParamStart'] = function () {
  return (_TRN_ShadingGetParamStart = Module['_TRN_ShadingGetParamStart'] = Module['asm']['oI']).apply(null, arguments);
});
var _TRN_ShadingGetParamEnd = (Module['_TRN_ShadingGetParamEnd'] = function () {
  return (_TRN_ShadingGetParamEnd = Module['_TRN_ShadingGetParamEnd'] = Module['asm']['pI']).apply(null, arguments);
});
var _TRN_ShadingIsExtendStart = (Module['_TRN_ShadingIsExtendStart'] = function () {
  return (_TRN_ShadingIsExtendStart = Module['_TRN_ShadingIsExtendStart'] = Module['asm']['qI']).apply(null, arguments);
});
var _TRN_ShadingIsExtendEnd = (Module['_TRN_ShadingIsExtendEnd'] = function () {
  return (_TRN_ShadingIsExtendEnd = Module['_TRN_ShadingIsExtendEnd'] = Module['asm']['rI']).apply(null, arguments);
});
var _TRN_ShadingGetColor = (Module['_TRN_ShadingGetColor'] = function () {
  return (_TRN_ShadingGetColor = Module['_TRN_ShadingGetColor'] = Module['asm']['sI']).apply(null, arguments);
});
var _TRN_ShadingGetCoords = (Module['_TRN_ShadingGetCoords'] = function () {
  return (_TRN_ShadingGetCoords = Module['_TRN_ShadingGetCoords'] = Module['asm']['tI']).apply(null, arguments);
});
var _TRN_ShadingGetCoordsRadial = (Module['_TRN_ShadingGetCoordsRadial'] = function () {
  return (_TRN_ShadingGetCoordsRadial = Module['_TRN_ShadingGetCoordsRadial'] = Module['asm']['uI']).apply(null, arguments);
});
var _TRN_ShadingGetDomain = (Module['_TRN_ShadingGetDomain'] = function () {
  return (_TRN_ShadingGetDomain = Module['_TRN_ShadingGetDomain'] = Module['asm']['vI']).apply(null, arguments);
});
var _TRN_ShadingGetMatrix = (Module['_TRN_ShadingGetMatrix'] = function () {
  return (_TRN_ShadingGetMatrix = Module['_TRN_ShadingGetMatrix'] = Module['asm']['wI']).apply(null, arguments);
});
var _TRN_ShadingGetColorForFunction = (Module['_TRN_ShadingGetColorForFunction'] = function () {
  return (_TRN_ShadingGetColorForFunction = Module['_TRN_ShadingGetColorForFunction'] = Module['asm']['xI']).apply(null, arguments);
});
var _TRN_StamperCreate = (Module['_TRN_StamperCreate'] = function () {
  return (_TRN_StamperCreate = Module['_TRN_StamperCreate'] = Module['asm']['yI']).apply(null, arguments);
});
var _TRN_StamperDestroy = (Module['_TRN_StamperDestroy'] = function () {
  return (_TRN_StamperDestroy = Module['_TRN_StamperDestroy'] = Module['asm']['zI']).apply(null, arguments);
});
var _TRN_StamperStampImage = (Module['_TRN_StamperStampImage'] = function () {
  return (_TRN_StamperStampImage = Module['_TRN_StamperStampImage'] = Module['asm']['AI']).apply(null, arguments);
});
var _TRN_StamperStampPage = (Module['_TRN_StamperStampPage'] = function () {
  return (_TRN_StamperStampPage = Module['_TRN_StamperStampPage'] = Module['asm']['BI']).apply(null, arguments);
});
var _TRN_StamperStampText = (Module['_TRN_StamperStampText'] = function () {
  return (_TRN_StamperStampText = Module['_TRN_StamperStampText'] = Module['asm']['CI']).apply(null, arguments);
});
var _TRN_StamperSetFont = (Module['_TRN_StamperSetFont'] = function () {
  return (_TRN_StamperSetFont = Module['_TRN_StamperSetFont'] = Module['asm']['DI']).apply(null, arguments);
});
var _TRN_StamperSetFontColor = (Module['_TRN_StamperSetFontColor'] = function () {
  return (_TRN_StamperSetFontColor = Module['_TRN_StamperSetFontColor'] = Module['asm']['EI']).apply(null, arguments);
});
var _TRN_StamperSetTextAlignment = (Module['_TRN_StamperSetTextAlignment'] = function () {
  return (_TRN_StamperSetTextAlignment = Module['_TRN_StamperSetTextAlignment'] = Module['asm']['FI']).apply(null, arguments);
});
var _TRN_StamperSetOpacity = (Module['_TRN_StamperSetOpacity'] = function () {
  return (_TRN_StamperSetOpacity = Module['_TRN_StamperSetOpacity'] = Module['asm']['GI']).apply(null, arguments);
});
var _TRN_StamperSetRotation = (Module['_TRN_StamperSetRotation'] = function () {
  return (_TRN_StamperSetRotation = Module['_TRN_StamperSetRotation'] = Module['asm']['HI']).apply(null, arguments);
});
var _TRN_StamperSetAsBackground = (Module['_TRN_StamperSetAsBackground'] = function () {
  return (_TRN_StamperSetAsBackground = Module['_TRN_StamperSetAsBackground'] = Module['asm']['II']).apply(null, arguments);
});
var _TRN_StamperSetAsAnnotation = (Module['_TRN_StamperSetAsAnnotation'] = function () {
  return (_TRN_StamperSetAsAnnotation = Module['_TRN_StamperSetAsAnnotation'] = Module['asm']['JI']).apply(null, arguments);
});
var _TRN_StamperShowsOnScreen = (Module['_TRN_StamperShowsOnScreen'] = function () {
  return (_TRN_StamperShowsOnScreen = Module['_TRN_StamperShowsOnScreen'] = Module['asm']['KI']).apply(null, arguments);
});
var _TRN_StamperShowsOnPrint = (Module['_TRN_StamperShowsOnPrint'] = function () {
  return (_TRN_StamperShowsOnPrint = Module['_TRN_StamperShowsOnPrint'] = Module['asm']['LI']).apply(null, arguments);
});
var _TRN_StamperSetAlignment = (Module['_TRN_StamperSetAlignment'] = function () {
  return (_TRN_StamperSetAlignment = Module['_TRN_StamperSetAlignment'] = Module['asm']['MI']).apply(null, arguments);
});
var _TRN_StamperSetPosition = (Module['_TRN_StamperSetPosition'] = function () {
  return (_TRN_StamperSetPosition = Module['_TRN_StamperSetPosition'] = Module['asm']['NI']).apply(null, arguments);
});
var _TRN_StamperSetSize = (Module['_TRN_StamperSetSize'] = function () {
  return (_TRN_StamperSetSize = Module['_TRN_StamperSetSize'] = Module['asm']['OI']).apply(null, arguments);
});
var _TRN_StamperDeleteStamps = (Module['_TRN_StamperDeleteStamps'] = function () {
  return (_TRN_StamperDeleteStamps = Module['_TRN_StamperDeleteStamps'] = Module['asm']['PI']).apply(null, arguments);
});
var _TRN_StamperHasStamps = (Module['_TRN_StamperHasStamps'] = function () {
  return (_TRN_StamperHasStamps = Module['_TRN_StamperHasStamps'] = Module['asm']['QI']).apply(null, arguments);
});
var _TRN_TextExtractorGetWordCount = (Module['_TRN_TextExtractorGetWordCount'] = function () {
  return (_TRN_TextExtractorGetWordCount = Module['_TRN_TextExtractorGetWordCount'] = Module['asm']['RI']).apply(null, arguments);
});
var _TRN_TextExtractorSetRightToLeftLanguage = (Module['_TRN_TextExtractorSetRightToLeftLanguage'] = function () {
  return (_TRN_TextExtractorSetRightToLeftLanguage = Module['_TRN_TextExtractorSetRightToLeftLanguage'] = Module['asm']['SI']).apply(null, arguments);
});
var _TRN_TextExtractorGetRightToLeftLanguage = (Module['_TRN_TextExtractorGetRightToLeftLanguage'] = function () {
  return (_TRN_TextExtractorGetRightToLeftLanguage = Module['_TRN_TextExtractorGetRightToLeftLanguage'] = Module['asm']['TI']).apply(null, arguments);
});
var _TRN_TextExtractorGetAsText = (Module['_TRN_TextExtractorGetAsText'] = function () {
  return (_TRN_TextExtractorGetAsText = Module['_TRN_TextExtractorGetAsText'] = Module['asm']['UI']).apply(null, arguments);
});
var _TRN_TextExtractorGetTextUnderAnnot = (Module['_TRN_TextExtractorGetTextUnderAnnot'] = function () {
  return (_TRN_TextExtractorGetTextUnderAnnot = Module['_TRN_TextExtractorGetTextUnderAnnot'] = Module['asm']['VI']).apply(null, arguments);
});
var _TRN_TextExtractorGetAsXML = (Module['_TRN_TextExtractorGetAsXML'] = function () {
  return (_TRN_TextExtractorGetAsXML = Module['_TRN_TextExtractorGetAsXML'] = Module['asm']['WI']).apply(null, arguments);
});
var _TRN_TextExtractorStyleGetFont = (Module['_TRN_TextExtractorStyleGetFont'] = function () {
  return (_TRN_TextExtractorStyleGetFont = Module['_TRN_TextExtractorStyleGetFont'] = Module['asm']['XI']).apply(null, arguments);
});
var _TRN_TextExtractorStyleGetFontName = (Module['_TRN_TextExtractorStyleGetFontName'] = function () {
  return (_TRN_TextExtractorStyleGetFontName = Module['_TRN_TextExtractorStyleGetFontName'] = Module['asm']['YI']).apply(null, arguments);
});
var _TRN_TextExtractorStyleGetFontSize = (Module['_TRN_TextExtractorStyleGetFontSize'] = function () {
  return (_TRN_TextExtractorStyleGetFontSize = Module['_TRN_TextExtractorStyleGetFontSize'] = Module['asm']['ZI']).apply(null, arguments);
});
var _TRN_TextExtractorStyleGetWeight = (Module['_TRN_TextExtractorStyleGetWeight'] = function () {
  return (_TRN_TextExtractorStyleGetWeight = Module['_TRN_TextExtractorStyleGetWeight'] = Module['asm']['_I']).apply(null, arguments);
});
var _TRN_TextExtractorStyleIsItalic = (Module['_TRN_TextExtractorStyleIsItalic'] = function () {
  return (_TRN_TextExtractorStyleIsItalic = Module['_TRN_TextExtractorStyleIsItalic'] = Module['asm']['$I']).apply(null, arguments);
});
var _TRN_TextExtractorStyleIsSerif = (Module['_TRN_TextExtractorStyleIsSerif'] = function () {
  return (_TRN_TextExtractorStyleIsSerif = Module['_TRN_TextExtractorStyleIsSerif'] = Module['asm']['aJ']).apply(null, arguments);
});
var _TRN_TextExtractorStyleCompare = (Module['_TRN_TextExtractorStyleCompare'] = function () {
  return (_TRN_TextExtractorStyleCompare = Module['_TRN_TextExtractorStyleCompare'] = Module['asm']['bJ']).apply(null, arguments);
});
var _TRN_TextExtractorStyleCreate = (Module['_TRN_TextExtractorStyleCreate'] = function () {
  return (_TRN_TextExtractorStyleCreate = Module['_TRN_TextExtractorStyleCreate'] = Module['asm']['cJ']).apply(null, arguments);
});
var _TRN_TextExtractorStyleCopy = (Module['_TRN_TextExtractorStyleCopy'] = function () {
  return (_TRN_TextExtractorStyleCopy = Module['_TRN_TextExtractorStyleCopy'] = Module['asm']['dJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetNumGlyphs = (Module['_TRN_TextExtractorWordGetNumGlyphs'] = function () {
  return (_TRN_TextExtractorWordGetNumGlyphs = Module['_TRN_TextExtractorWordGetNumGlyphs'] = Module['asm']['eJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetCharStyle = (Module['_TRN_TextExtractorWordGetCharStyle'] = function () {
  return (_TRN_TextExtractorWordGetCharStyle = Module['_TRN_TextExtractorWordGetCharStyle'] = Module['asm']['fJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetStyle = (Module['_TRN_TextExtractorWordGetStyle'] = function () {
  return (_TRN_TextExtractorWordGetStyle = Module['_TRN_TextExtractorWordGetStyle'] = Module['asm']['gJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetNextWord = (Module['_TRN_TextExtractorWordGetNextWord'] = function () {
  return (_TRN_TextExtractorWordGetNextWord = Module['_TRN_TextExtractorWordGetNextWord'] = Module['asm']['hJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordGetCurrentNum = (Module['_TRN_TextExtractorWordGetCurrentNum'] = function () {
  return (_TRN_TextExtractorWordGetCurrentNum = Module['_TRN_TextExtractorWordGetCurrentNum'] = Module['asm']['iJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordCompare = (Module['_TRN_TextExtractorWordCompare'] = function () {
  return (_TRN_TextExtractorWordCompare = Module['_TRN_TextExtractorWordCompare'] = Module['asm']['jJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordCreate = (Module['_TRN_TextExtractorWordCreate'] = function () {
  return (_TRN_TextExtractorWordCreate = Module['_TRN_TextExtractorWordCreate'] = Module['asm']['kJ']).apply(null, arguments);
});
var _TRN_TextExtractorWordIsValid = (Module['_TRN_TextExtractorWordIsValid'] = function () {
  return (_TRN_TextExtractorWordIsValid = Module['_TRN_TextExtractorWordIsValid'] = Module['asm']['lJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetNumWords = (Module['_TRN_TextExtractorLineGetNumWords'] = function () {
  return (_TRN_TextExtractorLineGetNumWords = Module['_TRN_TextExtractorLineGetNumWords'] = Module['asm']['mJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineIsSimpleLine = (Module['_TRN_TextExtractorLineIsSimpleLine'] = function () {
  return (_TRN_TextExtractorLineIsSimpleLine = Module['_TRN_TextExtractorLineIsSimpleLine'] = Module['asm']['nJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetFirstWord = (Module['_TRN_TextExtractorLineGetFirstWord'] = function () {
  return (_TRN_TextExtractorLineGetFirstWord = Module['_TRN_TextExtractorLineGetFirstWord'] = Module['asm']['oJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetWord = (Module['_TRN_TextExtractorLineGetWord'] = function () {
  return (_TRN_TextExtractorLineGetWord = Module['_TRN_TextExtractorLineGetWord'] = Module['asm']['pJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetNextLine = (Module['_TRN_TextExtractorLineGetNextLine'] = function () {
  return (_TRN_TextExtractorLineGetNextLine = Module['_TRN_TextExtractorLineGetNextLine'] = Module['asm']['qJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetCurrentNum = (Module['_TRN_TextExtractorLineGetCurrentNum'] = function () {
  return (_TRN_TextExtractorLineGetCurrentNum = Module['_TRN_TextExtractorLineGetCurrentNum'] = Module['asm']['rJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetStyle = (Module['_TRN_TextExtractorLineGetStyle'] = function () {
  return (_TRN_TextExtractorLineGetStyle = Module['_TRN_TextExtractorLineGetStyle'] = Module['asm']['sJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetParagraphID = (Module['_TRN_TextExtractorLineGetParagraphID'] = function () {
  return (_TRN_TextExtractorLineGetParagraphID = Module['_TRN_TextExtractorLineGetParagraphID'] = Module['asm']['tJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineGetFlowID = (Module['_TRN_TextExtractorLineGetFlowID'] = function () {
  return (_TRN_TextExtractorLineGetFlowID = Module['_TRN_TextExtractorLineGetFlowID'] = Module['asm']['uJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineEndsWithHyphen = (Module['_TRN_TextExtractorLineEndsWithHyphen'] = function () {
  return (_TRN_TextExtractorLineEndsWithHyphen = Module['_TRN_TextExtractorLineEndsWithHyphen'] = Module['asm']['vJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineCompare = (Module['_TRN_TextExtractorLineCompare'] = function () {
  return (_TRN_TextExtractorLineCompare = Module['_TRN_TextExtractorLineCompare'] = Module['asm']['wJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineCreate = (Module['_TRN_TextExtractorLineCreate'] = function () {
  return (_TRN_TextExtractorLineCreate = Module['_TRN_TextExtractorLineCreate'] = Module['asm']['xJ']).apply(null, arguments);
});
var _TRN_TextExtractorLineIsValid = (Module['_TRN_TextExtractorLineIsValid'] = function () {
  return (_TRN_TextExtractorLineIsValid = Module['_TRN_TextExtractorLineIsValid'] = Module['asm']['yJ']).apply(null, arguments);
});
var _TRN_TextExtractorGetNumLines = (Module['_TRN_TextExtractorGetNumLines'] = function () {
  return (_TRN_TextExtractorGetNumLines = Module['_TRN_TextExtractorGetNumLines'] = Module['asm']['zJ']).apply(null, arguments);
});
var _TRN_TextExtractorGetFirstLine = (Module['_TRN_TextExtractorGetFirstLine'] = function () {
  return (_TRN_TextExtractorGetFirstLine = Module['_TRN_TextExtractorGetFirstLine'] = Module['asm']['AJ']).apply(null, arguments);
});
var _TRN_TextSearchCreate = (Module['_TRN_TextSearchCreate'] = function () {
  return (_TRN_TextSearchCreate = Module['_TRN_TextSearchCreate'] = Module['asm']['BJ']).apply(null, arguments);
});
var _TRN_TextSearchDestroy = (Module['_TRN_TextSearchDestroy'] = function () {
  return (_TRN_TextSearchDestroy = Module['_TRN_TextSearchDestroy'] = Module['asm']['CJ']).apply(null, arguments);
});
var _TRN_TextSearchBegin = (Module['_TRN_TextSearchBegin'] = function () {
  return (_TRN_TextSearchBegin = Module['_TRN_TextSearchBegin'] = Module['asm']['DJ']).apply(null, arguments);
});
var _TRN_TextSearchSetPattern = (Module['_TRN_TextSearchSetPattern'] = function () {
  return (_TRN_TextSearchSetPattern = Module['_TRN_TextSearchSetPattern'] = Module['asm']['EJ']).apply(null, arguments);
});
var _TRN_TextSearchGetMode = (Module['_TRN_TextSearchGetMode'] = function () {
  return (_TRN_TextSearchGetMode = Module['_TRN_TextSearchGetMode'] = Module['asm']['FJ']).apply(null, arguments);
});
var _TRN_TextSearchSetMode = (Module['_TRN_TextSearchSetMode'] = function () {
  return (_TRN_TextSearchSetMode = Module['_TRN_TextSearchSetMode'] = Module['asm']['GJ']).apply(null, arguments);
});
var _TRN_TextSearchSetRightToLeftLanguage = (Module['_TRN_TextSearchSetRightToLeftLanguage'] = function () {
  return (_TRN_TextSearchSetRightToLeftLanguage = Module['_TRN_TextSearchSetRightToLeftLanguage'] = Module['asm']['HJ']).apply(null, arguments);
});
var _TRN_TextSearchGetCurrentPage = (Module['_TRN_TextSearchGetCurrentPage'] = function () {
  return (_TRN_TextSearchGetCurrentPage = Module['_TRN_TextSearchGetCurrentPage'] = Module['asm']['IJ']).apply(null, arguments);
});
var _TRN_TextSearchSetOCGContext = (Module['_TRN_TextSearchSetOCGContext'] = function () {
  return (_TRN_TextSearchSetOCGContext = Module['_TRN_TextSearchSetOCGContext'] = Module['asm']['JJ']).apply(null, arguments);
});
var _TRN_TextSearchSetAmbientLettersBefore = (Module['_TRN_TextSearchSetAmbientLettersBefore'] = function () {
  return (_TRN_TextSearchSetAmbientLettersBefore = Module['_TRN_TextSearchSetAmbientLettersBefore'] = Module['asm']['KJ']).apply(null, arguments);
});
var _TRN_TextSearchSetAmbientLettersAfter = (Module['_TRN_TextSearchSetAmbientLettersAfter'] = function () {
  return (_TRN_TextSearchSetAmbientLettersAfter = Module['_TRN_TextSearchSetAmbientLettersAfter'] = Module['asm']['LJ']).apply(null, arguments);
});
var _TRN_TextSearchSetAmbientWordsBefore = (Module['_TRN_TextSearchSetAmbientWordsBefore'] = function () {
  return (_TRN_TextSearchSetAmbientWordsBefore = Module['_TRN_TextSearchSetAmbientWordsBefore'] = Module['asm']['MJ']).apply(null, arguments);
});
var _TRN_TextSearchSetAmbientWordsAfter = (Module['_TRN_TextSearchSetAmbientWordsAfter'] = function () {
  return (_TRN_TextSearchSetAmbientWordsAfter = Module['_TRN_TextSearchSetAmbientWordsAfter'] = Module['asm']['NJ']).apply(null, arguments);
});
var _TRN_NameTreeCreate = (Module['_TRN_NameTreeCreate'] = function () {
  return (_TRN_NameTreeCreate = Module['_TRN_NameTreeCreate'] = Module['asm']['OJ']).apply(null, arguments);
});
var _TRN_NameTreeFind = (Module['_TRN_NameTreeFind'] = function () {
  return (_TRN_NameTreeFind = Module['_TRN_NameTreeFind'] = Module['asm']['PJ']).apply(null, arguments);
});
var _TRN_NameTreeCreateFromObj = (Module['_TRN_NameTreeCreateFromObj'] = function () {
  return (_TRN_NameTreeCreateFromObj = Module['_TRN_NameTreeCreateFromObj'] = Module['asm']['QJ']).apply(null, arguments);
});
var _TRN_NameTreeCopy = (Module['_TRN_NameTreeCopy'] = function () {
  return (_TRN_NameTreeCopy = Module['_TRN_NameTreeCopy'] = Module['asm']['RJ']).apply(null, arguments);
});
var _TRN_NameTreeIsValid = (Module['_TRN_NameTreeIsValid'] = function () {
  return (_TRN_NameTreeIsValid = Module['_TRN_NameTreeIsValid'] = Module['asm']['SJ']).apply(null, arguments);
});
var _TRN_NameTreeGetIterator = (Module['_TRN_NameTreeGetIterator'] = function () {
  return (_TRN_NameTreeGetIterator = Module['_TRN_NameTreeGetIterator'] = Module['asm']['TJ']).apply(null, arguments);
});
var _TRN_NameTreeGetValue = (Module['_TRN_NameTreeGetValue'] = function () {
  return (_TRN_NameTreeGetValue = Module['_TRN_NameTreeGetValue'] = Module['asm']['UJ']).apply(null, arguments);
});
var _TRN_NameTreeGetIteratorBegin = (Module['_TRN_NameTreeGetIteratorBegin'] = function () {
  return (_TRN_NameTreeGetIteratorBegin = Module['_TRN_NameTreeGetIteratorBegin'] = Module['asm']['VJ']).apply(null, arguments);
});
var _TRN_NameTreePut = (Module['_TRN_NameTreePut'] = function () {
  return (_TRN_NameTreePut = Module['_TRN_NameTreePut'] = Module['asm']['WJ']).apply(null, arguments);
});
var _TRN_NameTreeEraseKey = (Module['_TRN_NameTreeEraseKey'] = function () {
  return (_TRN_NameTreeEraseKey = Module['_TRN_NameTreeEraseKey'] = Module['asm']['XJ']).apply(null, arguments);
});
var _TRN_NameTreeErase = (Module['_TRN_NameTreeErase'] = function () {
  return (_TRN_NameTreeErase = Module['_TRN_NameTreeErase'] = Module['asm']['YJ']).apply(null, arguments);
});
var _TRN_NameTreeGetSDFObj = (Module['_TRN_NameTreeGetSDFObj'] = function () {
  return (_TRN_NameTreeGetSDFObj = Module['_TRN_NameTreeGetSDFObj'] = Module['asm']['ZJ']).apply(null, arguments);
});
var _TRN_NumberTreeCreate = (Module['_TRN_NumberTreeCreate'] = function () {
  return (_TRN_NumberTreeCreate = Module['_TRN_NumberTreeCreate'] = Module['asm']['_J']).apply(null, arguments);
});
var _TRN_NumberTreeCopy = (Module['_TRN_NumberTreeCopy'] = function () {
  return (_TRN_NumberTreeCopy = Module['_TRN_NumberTreeCopy'] = Module['asm']['$J']).apply(null, arguments);
});
var _TRN_NumberTreeIsValid = (Module['_TRN_NumberTreeIsValid'] = function () {
  return (_TRN_NumberTreeIsValid = Module['_TRN_NumberTreeIsValid'] = Module['asm']['aK']).apply(null, arguments);
});
var _TRN_NumberTreeGetIterator = (Module['_TRN_NumberTreeGetIterator'] = function () {
  return (_TRN_NumberTreeGetIterator = Module['_TRN_NumberTreeGetIterator'] = Module['asm']['bK']).apply(null, arguments);
});
var _TRN_NumberTreeGetValue = (Module['_TRN_NumberTreeGetValue'] = function () {
  return (_TRN_NumberTreeGetValue = Module['_TRN_NumberTreeGetValue'] = Module['asm']['cK']).apply(null, arguments);
});
var _TRN_NumberTreeGetIteratorBegin = (Module['_TRN_NumberTreeGetIteratorBegin'] = function () {
  return (_TRN_NumberTreeGetIteratorBegin = Module['_TRN_NumberTreeGetIteratorBegin'] = Module['asm']['dK']).apply(null, arguments);
});
var _TRN_NumberTreePut = (Module['_TRN_NumberTreePut'] = function () {
  return (_TRN_NumberTreePut = Module['_TRN_NumberTreePut'] = Module['asm']['eK']).apply(null, arguments);
});
var _TRN_NumberTreeEraseKey = (Module['_TRN_NumberTreeEraseKey'] = function () {
  return (_TRN_NumberTreeEraseKey = Module['_TRN_NumberTreeEraseKey'] = Module['asm']['fK']).apply(null, arguments);
});
var _TRN_NumberTreeErase = (Module['_TRN_NumberTreeErase'] = function () {
  return (_TRN_NumberTreeErase = Module['_TRN_NumberTreeErase'] = Module['asm']['gK']).apply(null, arguments);
});
var _TRN_NumberTreeGetSDFObj = (Module['_TRN_NumberTreeGetSDFObj'] = function () {
  return (_TRN_NumberTreeGetSDFObj = Module['_TRN_NumberTreeGetSDFObj'] = Module['asm']['hK']).apply(null, arguments);
});
var _TRN_ObjGetType = (Module['_TRN_ObjGetType'] = function () {
  return (_TRN_ObjGetType = Module['_TRN_ObjGetType'] = Module['asm']['iK']).apply(null, arguments);
});
var _TRN_ObjGetDoc = (Module['_TRN_ObjGetDoc'] = function () {
  return (_TRN_ObjGetDoc = Module['_TRN_ObjGetDoc'] = Module['asm']['jK']).apply(null, arguments);
});
var _TRN_ObjWrite = (Module['_TRN_ObjWrite'] = function () {
  return (_TRN_ObjWrite = Module['_TRN_ObjWrite'] = Module['asm']['kK']).apply(null, arguments);
});
var _TRN_ObjIsEqual = (Module['_TRN_ObjIsEqual'] = function () {
  return (_TRN_ObjIsEqual = Module['_TRN_ObjIsEqual'] = Module['asm']['lK']).apply(null, arguments);
});
var _TRN_ObjIsBool = (Module['_TRN_ObjIsBool'] = function () {
  return (_TRN_ObjIsBool = Module['_TRN_ObjIsBool'] = Module['asm']['mK']).apply(null, arguments);
});
var _TRN_ObjGetBool = (Module['_TRN_ObjGetBool'] = function () {
  return (_TRN_ObjGetBool = Module['_TRN_ObjGetBool'] = Module['asm']['nK']).apply(null, arguments);
});
var _TRN_ObjSetBool = (Module['_TRN_ObjSetBool'] = function () {
  return (_TRN_ObjSetBool = Module['_TRN_ObjSetBool'] = Module['asm']['oK']).apply(null, arguments);
});
var _TRN_ObjIsNumber = (Module['_TRN_ObjIsNumber'] = function () {
  return (_TRN_ObjIsNumber = Module['_TRN_ObjIsNumber'] = Module['asm']['pK']).apply(null, arguments);
});
var _TRN_ObjGetNumber = (Module['_TRN_ObjGetNumber'] = function () {
  return (_TRN_ObjGetNumber = Module['_TRN_ObjGetNumber'] = Module['asm']['qK']).apply(null, arguments);
});
var _TRN_ObjSetNumber = (Module['_TRN_ObjSetNumber'] = function () {
  return (_TRN_ObjSetNumber = Module['_TRN_ObjSetNumber'] = Module['asm']['rK']).apply(null, arguments);
});
var _TRN_ObjSetString = (Module['_TRN_ObjSetString'] = function () {
  return (_TRN_ObjSetString = Module['_TRN_ObjSetString'] = Module['asm']['sK']).apply(null, arguments);
});
var _TRN_ObjSetUString = (Module['_TRN_ObjSetUString'] = function () {
  return (_TRN_ObjSetUString = Module['_TRN_ObjSetUString'] = Module['asm']['tK']).apply(null, arguments);
});
var _TRN_ObjIsName = (Module['_TRN_ObjIsName'] = function () {
  return (_TRN_ObjIsName = Module['_TRN_ObjIsName'] = Module['asm']['uK']).apply(null, arguments);
});
var _TRN_ObjGetName = (Module['_TRN_ObjGetName'] = function () {
  return (_TRN_ObjGetName = Module['_TRN_ObjGetName'] = Module['asm']['vK']).apply(null, arguments);
});
var _TRN_ObjSetName = (Module['_TRN_ObjSetName'] = function () {
  return (_TRN_ObjSetName = Module['_TRN_ObjSetName'] = Module['asm']['wK']).apply(null, arguments);
});
var _TRN_ObjIsIndirect = (Module['_TRN_ObjIsIndirect'] = function () {
  return (_TRN_ObjIsIndirect = Module['_TRN_ObjIsIndirect'] = Module['asm']['xK']).apply(null, arguments);
});
var _TRN_ObjGetObjNum = (Module['_TRN_ObjGetObjNum'] = function () {
  return (_TRN_ObjGetObjNum = Module['_TRN_ObjGetObjNum'] = Module['asm']['yK']).apply(null, arguments);
});
var _TRN_ObjGetGenNum = (Module['_TRN_ObjGetGenNum'] = function () {
  return (_TRN_ObjGetGenNum = Module['_TRN_ObjGetGenNum'] = Module['asm']['zK']).apply(null, arguments);
});
var _TRN_ObjGetOffset = (Module['_TRN_ObjGetOffset'] = function () {
  return (_TRN_ObjGetOffset = Module['_TRN_ObjGetOffset'] = Module['asm']['AK']).apply(null, arguments);
});
var _TRN_ObjIsFree = (Module['_TRN_ObjIsFree'] = function () {
  return (_TRN_ObjIsFree = Module['_TRN_ObjIsFree'] = Module['asm']['BK']).apply(null, arguments);
});
var _TRN_ObjSetMark = (Module['_TRN_ObjSetMark'] = function () {
  return (_TRN_ObjSetMark = Module['_TRN_ObjSetMark'] = Module['asm']['CK']).apply(null, arguments);
});
var _TRN_ObjIsMarked = (Module['_TRN_ObjIsMarked'] = function () {
  return (_TRN_ObjIsMarked = Module['_TRN_ObjIsMarked'] = Module['asm']['DK']).apply(null, arguments);
});
var _TRN_ObjIsLoaded = (Module['_TRN_ObjIsLoaded'] = function () {
  return (_TRN_ObjIsLoaded = Module['_TRN_ObjIsLoaded'] = Module['asm']['EK']).apply(null, arguments);
});
var _TRN_ObjIsContainer = (Module['_TRN_ObjIsContainer'] = function () {
  return (_TRN_ObjIsContainer = Module['_TRN_ObjIsContainer'] = Module['asm']['FK']).apply(null, arguments);
});
var _TRN_ObjGetDictIterator = (Module['_TRN_ObjGetDictIterator'] = function () {
  return (_TRN_ObjGetDictIterator = Module['_TRN_ObjGetDictIterator'] = Module['asm']['GK']).apply(null, arguments);
});
var _TRN_ObjIsDict = (Module['_TRN_ObjIsDict'] = function () {
  return (_TRN_ObjIsDict = Module['_TRN_ObjIsDict'] = Module['asm']['HK']).apply(null, arguments);
});
var _TRN_ObjFind = (Module['_TRN_ObjFind'] = function () {
  return (_TRN_ObjFind = Module['_TRN_ObjFind'] = Module['asm']['IK']).apply(null, arguments);
});
var _TRN_ObjGet = (Module['_TRN_ObjGet'] = function () {
  return (_TRN_ObjGet = Module['_TRN_ObjGet'] = Module['asm']['JK']).apply(null, arguments);
});
var _TRN_ObjPutArray = (Module['_TRN_ObjPutArray'] = function () {
  return (_TRN_ObjPutArray = Module['_TRN_ObjPutArray'] = Module['asm']['KK']).apply(null, arguments);
});
var _TRN_ObjPutDict = (Module['_TRN_ObjPutDict'] = function () {
  return (_TRN_ObjPutDict = Module['_TRN_ObjPutDict'] = Module['asm']['LK']).apply(null, arguments);
});
var _TRN_ObjPutString = (Module['_TRN_ObjPutString'] = function () {
  return (_TRN_ObjPutString = Module['_TRN_ObjPutString'] = Module['asm']['MK']).apply(null, arguments);
});
var _TRN_ObjPutNull = (Module['_TRN_ObjPutNull'] = function () {
  return (_TRN_ObjPutNull = Module['_TRN_ObjPutNull'] = Module['asm']['NK']).apply(null, arguments);
});
var _TRN_ObjPut = (Module['_TRN_ObjPut'] = function () {
  return (_TRN_ObjPut = Module['_TRN_ObjPut'] = Module['asm']['OK']).apply(null, arguments);
});
var _TRN_ObjPutRect = (Module['_TRN_ObjPutRect'] = function () {
  return (_TRN_ObjPutRect = Module['_TRN_ObjPutRect'] = Module['asm']['PK']).apply(null, arguments);
});
var _TRN_ObjPutMatrix = (Module['_TRN_ObjPutMatrix'] = function () {
  return (_TRN_ObjPutMatrix = Module['_TRN_ObjPutMatrix'] = Module['asm']['QK']).apply(null, arguments);
});
var _TRN_ObjEraseFromKey = (Module['_TRN_ObjEraseFromKey'] = function () {
  return (_TRN_ObjEraseFromKey = Module['_TRN_ObjEraseFromKey'] = Module['asm']['RK']).apply(null, arguments);
});
var _TRN_ObjErase = (Module['_TRN_ObjErase'] = function () {
  return (_TRN_ObjErase = Module['_TRN_ObjErase'] = Module['asm']['SK']).apply(null, arguments);
});
var _TRN_ObjRename = (Module['_TRN_ObjRename'] = function () {
  return (_TRN_ObjRename = Module['_TRN_ObjRename'] = Module['asm']['TK']).apply(null, arguments);
});
var _TRN_ObjInsertName = (Module['_TRN_ObjInsertName'] = function () {
  return (_TRN_ObjInsertName = Module['_TRN_ObjInsertName'] = Module['asm']['UK']).apply(null, arguments);
});
var _TRN_ObjInsertArray = (Module['_TRN_ObjInsertArray'] = function () {
  return (_TRN_ObjInsertArray = Module['_TRN_ObjInsertArray'] = Module['asm']['VK']).apply(null, arguments);
});
var _TRN_ObjInsertBool = (Module['_TRN_ObjInsertBool'] = function () {
  return (_TRN_ObjInsertBool = Module['_TRN_ObjInsertBool'] = Module['asm']['WK']).apply(null, arguments);
});
var _TRN_ObjInsertDict = (Module['_TRN_ObjInsertDict'] = function () {
  return (_TRN_ObjInsertDict = Module['_TRN_ObjInsertDict'] = Module['asm']['XK']).apply(null, arguments);
});
var _TRN_ObjInsertNumber = (Module['_TRN_ObjInsertNumber'] = function () {
  return (_TRN_ObjInsertNumber = Module['_TRN_ObjInsertNumber'] = Module['asm']['YK']).apply(null, arguments);
});
var _TRN_ObjInsertString = (Module['_TRN_ObjInsertString'] = function () {
  return (_TRN_ObjInsertString = Module['_TRN_ObjInsertString'] = Module['asm']['ZK']).apply(null, arguments);
});
var _TRN_ObjInsertText = (Module['_TRN_ObjInsertText'] = function () {
  return (_TRN_ObjInsertText = Module['_TRN_ObjInsertText'] = Module['asm']['_K']).apply(null, arguments);
});
var _TRN_ObjInsertNull = (Module['_TRN_ObjInsertNull'] = function () {
  return (_TRN_ObjInsertNull = Module['_TRN_ObjInsertNull'] = Module['asm']['$K']).apply(null, arguments);
});
var _TRN_ObjInsert = (Module['_TRN_ObjInsert'] = function () {
  return (_TRN_ObjInsert = Module['_TRN_ObjInsert'] = Module['asm']['aL']).apply(null, arguments);
});
var _TRN_ObjInsertRect = (Module['_TRN_ObjInsertRect'] = function () {
  return (_TRN_ObjInsertRect = Module['_TRN_ObjInsertRect'] = Module['asm']['bL']).apply(null, arguments);
});
var _TRN_ObjInsertMatrix = (Module['_TRN_ObjInsertMatrix'] = function () {
  return (_TRN_ObjInsertMatrix = Module['_TRN_ObjInsertMatrix'] = Module['asm']['cL']).apply(null, arguments);
});
var _TRN_ObjPushBackName = (Module['_TRN_ObjPushBackName'] = function () {
  return (_TRN_ObjPushBackName = Module['_TRN_ObjPushBackName'] = Module['asm']['dL']).apply(null, arguments);
});
var _TRN_ObjPushBackArray = (Module['_TRN_ObjPushBackArray'] = function () {
  return (_TRN_ObjPushBackArray = Module['_TRN_ObjPushBackArray'] = Module['asm']['eL']).apply(null, arguments);
});
var _TRN_ObjPushBackBool = (Module['_TRN_ObjPushBackBool'] = function () {
  return (_TRN_ObjPushBackBool = Module['_TRN_ObjPushBackBool'] = Module['asm']['fL']).apply(null, arguments);
});
var _TRN_ObjPushBackDict = (Module['_TRN_ObjPushBackDict'] = function () {
  return (_TRN_ObjPushBackDict = Module['_TRN_ObjPushBackDict'] = Module['asm']['gL']).apply(null, arguments);
});
var _TRN_ObjPushBackNumber = (Module['_TRN_ObjPushBackNumber'] = function () {
  return (_TRN_ObjPushBackNumber = Module['_TRN_ObjPushBackNumber'] = Module['asm']['hL']).apply(null, arguments);
});
var _TRN_ObjPushBackString = (Module['_TRN_ObjPushBackString'] = function () {
  return (_TRN_ObjPushBackString = Module['_TRN_ObjPushBackString'] = Module['asm']['iL']).apply(null, arguments);
});
var _TRN_ObjPushBackText = (Module['_TRN_ObjPushBackText'] = function () {
  return (_TRN_ObjPushBackText = Module['_TRN_ObjPushBackText'] = Module['asm']['jL']).apply(null, arguments);
});
var _TRN_ObjPushBackNull = (Module['_TRN_ObjPushBackNull'] = function () {
  return (_TRN_ObjPushBackNull = Module['_TRN_ObjPushBackNull'] = Module['asm']['kL']).apply(null, arguments);
});
var _TRN_ObjPushBack = (Module['_TRN_ObjPushBack'] = function () {
  return (_TRN_ObjPushBack = Module['_TRN_ObjPushBack'] = Module['asm']['lL']).apply(null, arguments);
});
var _TRN_ObjPushBackRect = (Module['_TRN_ObjPushBackRect'] = function () {
  return (_TRN_ObjPushBackRect = Module['_TRN_ObjPushBackRect'] = Module['asm']['mL']).apply(null, arguments);
});
var _TRN_ObjPushBackMatrix = (Module['_TRN_ObjPushBackMatrix'] = function () {
  return (_TRN_ObjPushBackMatrix = Module['_TRN_ObjPushBackMatrix'] = Module['asm']['nL']).apply(null, arguments);
});
var _TRN_ObjEraseAt = (Module['_TRN_ObjEraseAt'] = function () {
  return (_TRN_ObjEraseAt = Module['_TRN_ObjEraseAt'] = Module['asm']['oL']).apply(null, arguments);
});
var _TRN_ObjIsStream = (Module['_TRN_ObjIsStream'] = function () {
  return (_TRN_ObjIsStream = Module['_TRN_ObjIsStream'] = Module['asm']['pL']).apply(null, arguments);
});
var _TRN_ObjGetRawStreamLength = (Module['_TRN_ObjGetRawStreamLength'] = function () {
  return (_TRN_ObjGetRawStreamLength = Module['_TRN_ObjGetRawStreamLength'] = Module['asm']['qL']).apply(null, arguments);
});
var _TRN_ObjSetStreamData = (Module['_TRN_ObjSetStreamData'] = function () {
  return (_TRN_ObjSetStreamData = Module['_TRN_ObjSetStreamData'] = Module['asm']['rL']).apply(null, arguments);
});
var _TRN_ObjSetStreamDataWithFilter = (Module['_TRN_ObjSetStreamDataWithFilter'] = function () {
  return (_TRN_ObjSetStreamDataWithFilter = Module['_TRN_ObjSetStreamDataWithFilter'] = Module['asm']['sL']).apply(null, arguments);
});
var _TRN_ObjGetRawStream = (Module['_TRN_ObjGetRawStream'] = function () {
  return (_TRN_ObjGetRawStream = Module['_TRN_ObjGetRawStream'] = Module['asm']['tL']).apply(null, arguments);
});
var _TRN_ObjGetDecodedStream = (Module['_TRN_ObjGetDecodedStream'] = function () {
  return (_TRN_ObjGetDecodedStream = Module['_TRN_ObjGetDecodedStream'] = Module['asm']['uL']).apply(null, arguments);
});
var _TRN_ObjSetCreateName = (Module['_TRN_ObjSetCreateName'] = function () {
  return (_TRN_ObjSetCreateName = Module['_TRN_ObjSetCreateName'] = Module['asm']['vL']).apply(null, arguments);
});
var _TRN_ObjSetCreateArray = (Module['_TRN_ObjSetCreateArray'] = function () {
  return (_TRN_ObjSetCreateArray = Module['_TRN_ObjSetCreateArray'] = Module['asm']['wL']).apply(null, arguments);
});
var _TRN_ObjSetCreateBool = (Module['_TRN_ObjSetCreateBool'] = function () {
  return (_TRN_ObjSetCreateBool = Module['_TRN_ObjSetCreateBool'] = Module['asm']['xL']).apply(null, arguments);
});
var _TRN_ObjSetCreateNull = (Module['_TRN_ObjSetCreateNull'] = function () {
  return (_TRN_ObjSetCreateNull = Module['_TRN_ObjSetCreateNull'] = Module['asm']['yL']).apply(null, arguments);
});
var _TRN_ObjSetCreateNumber = (Module['_TRN_ObjSetCreateNumber'] = function () {
  return (_TRN_ObjSetCreateNumber = Module['_TRN_ObjSetCreateNumber'] = Module['asm']['zL']).apply(null, arguments);
});
var _TRN_ObjSetCreateString = (Module['_TRN_ObjSetCreateString'] = function () {
  return (_TRN_ObjSetCreateString = Module['_TRN_ObjSetCreateString'] = Module['asm']['AL']).apply(null, arguments);
});
var _TRN_SDFDocCreateShallowCopy = (Module['_TRN_SDFDocCreateShallowCopy'] = function () {
  return (_TRN_SDFDocCreateShallowCopy = Module['_TRN_SDFDocCreateShallowCopy'] = Module['asm']['BL']).apply(null, arguments);
});
var _TRN_SDFDocReleaseFileHandles = (Module['_TRN_SDFDocReleaseFileHandles'] = function () {
  return (_TRN_SDFDocReleaseFileHandles = Module['_TRN_SDFDocReleaseFileHandles'] = Module['asm']['CL']).apply(null, arguments);
});
var _TRN_SDFDocIsEncrypted = (Module['_TRN_SDFDocIsEncrypted'] = function () {
  return (_TRN_SDFDocIsEncrypted = Module['_TRN_SDFDocIsEncrypted'] = Module['asm']['DL']).apply(null, arguments);
});
var _TRN_SDFDocInitStdSecurityHandlerUString = (Module['_TRN_SDFDocInitStdSecurityHandlerUString'] = function () {
  return (_TRN_SDFDocInitStdSecurityHandlerUString = Module['_TRN_SDFDocInitStdSecurityHandlerUString'] = Module['asm']['EL']).apply(null, arguments);
});
var _TRN_SDFDocIsModified = (Module['_TRN_SDFDocIsModified'] = function () {
  return (_TRN_SDFDocIsModified = Module['_TRN_SDFDocIsModified'] = Module['asm']['FL']).apply(null, arguments);
});
var _TRN_SDFDocHasRepairedXRef = (Module['_TRN_SDFDocHasRepairedXRef'] = function () {
  return (_TRN_SDFDocHasRepairedXRef = Module['_TRN_SDFDocHasRepairedXRef'] = Module['asm']['GL']).apply(null, arguments);
});
var _TRN_SDFDocIsFullSaveRequired = (Module['_TRN_SDFDocIsFullSaveRequired'] = function () {
  return (_TRN_SDFDocIsFullSaveRequired = Module['_TRN_SDFDocIsFullSaveRequired'] = Module['asm']['HL']).apply(null, arguments);
});
var _TRN_SDFDocGetTrailer = (Module['_TRN_SDFDocGetTrailer'] = function () {
  return (_TRN_SDFDocGetTrailer = Module['_TRN_SDFDocGetTrailer'] = Module['asm']['IL']).apply(null, arguments);
});
var _TRN_SDFDocGetObj = (Module['_TRN_SDFDocGetObj'] = function () {
  return (_TRN_SDFDocGetObj = Module['_TRN_SDFDocGetObj'] = Module['asm']['JL']).apply(null, arguments);
});
var _TRN_SDFDocImportObj = (Module['_TRN_SDFDocImportObj'] = function () {
  return (_TRN_SDFDocImportObj = Module['_TRN_SDFDocImportObj'] = Module['asm']['KL']).apply(null, arguments);
});
var _TRN_SDFDocImportObjsWithExcludeList = (Module['_TRN_SDFDocImportObjsWithExcludeList'] = function () {
  return (_TRN_SDFDocImportObjsWithExcludeList = Module['_TRN_SDFDocImportObjsWithExcludeList'] = Module['asm']['LL']).apply(null, arguments);
});
var _TRN_SDFDocXRefSize = (Module['_TRN_SDFDocXRefSize'] = function () {
  return (_TRN_SDFDocXRefSize = Module['_TRN_SDFDocXRefSize'] = Module['asm']['ML']).apply(null, arguments);
});
var _TRN_SDFDocClearMarks = (Module['_TRN_SDFDocClearMarks'] = function () {
  return (_TRN_SDFDocClearMarks = Module['_TRN_SDFDocClearMarks'] = Module['asm']['NL']).apply(null, arguments);
});
var _TRN_SDFDocSaveMemory = (Module['_TRN_SDFDocSaveMemory'] = function () {
  return (_TRN_SDFDocSaveMemory = Module['_TRN_SDFDocSaveMemory'] = Module['asm']['OL']).apply(null, arguments);
});
var _TRN_SDFDocSaveStream = (Module['_TRN_SDFDocSaveStream'] = function () {
  return (_TRN_SDFDocSaveStream = Module['_TRN_SDFDocSaveStream'] = Module['asm']['PL']).apply(null, arguments);
});
var _TRN_SDFDocGetHeader = (Module['_TRN_SDFDocGetHeader'] = function () {
  return (_TRN_SDFDocGetHeader = Module['_TRN_SDFDocGetHeader'] = Module['asm']['QL']).apply(null, arguments);
});
var _TRN_SDFDocGetSecurityHandler = (Module['_TRN_SDFDocGetSecurityHandler'] = function () {
  return (_TRN_SDFDocGetSecurityHandler = Module['_TRN_SDFDocGetSecurityHandler'] = Module['asm']['RL']).apply(null, arguments);
});
var _TRN_SDFDocSetSecurityHandler = (Module['_TRN_SDFDocSetSecurityHandler'] = function () {
  return (_TRN_SDFDocSetSecurityHandler = Module['_TRN_SDFDocSetSecurityHandler'] = Module['asm']['SL']).apply(null, arguments);
});
var _TRN_SDFDocRemoveSecurity = (Module['_TRN_SDFDocRemoveSecurity'] = function () {
  return (_TRN_SDFDocRemoveSecurity = Module['_TRN_SDFDocRemoveSecurity'] = Module['asm']['TL']).apply(null, arguments);
});
var _TRN_SDFDocSwap = (Module['_TRN_SDFDocSwap'] = function () {
  return (_TRN_SDFDocSwap = Module['_TRN_SDFDocSwap'] = Module['asm']['UL']).apply(null, arguments);
});
var _TRN_SDFDocIsLinearized = (Module['_TRN_SDFDocIsLinearized'] = function () {
  return (_TRN_SDFDocIsLinearized = Module['_TRN_SDFDocIsLinearized'] = Module['asm']['VL']).apply(null, arguments);
});
var _TRN_SDFDocGetLinearizationDict = (Module['_TRN_SDFDocGetLinearizationDict'] = function () {
  return (_TRN_SDFDocGetLinearizationDict = Module['_TRN_SDFDocGetLinearizationDict'] = Module['asm']['WL']).apply(null, arguments);
});
var _TRN_SDFDocGetHintStream = (Module['_TRN_SDFDocGetHintStream'] = function () {
  return (_TRN_SDFDocGetHintStream = Module['_TRN_SDFDocGetHintStream'] = Module['asm']['XL']).apply(null, arguments);
});
var _TRN_SDFDocEnableDiskCaching = (Module['_TRN_SDFDocEnableDiskCaching'] = function () {
  return (_TRN_SDFDocEnableDiskCaching = Module['_TRN_SDFDocEnableDiskCaching'] = Module['asm']['YL']).apply(null, arguments);
});
var _TRN_SDFDocLock = (Module['_TRN_SDFDocLock'] = function () {
  return (_TRN_SDFDocLock = Module['_TRN_SDFDocLock'] = Module['asm']['ZL']).apply(null, arguments);
});
var _TRN_SDFDocUnlock = (Module['_TRN_SDFDocUnlock'] = function () {
  return (_TRN_SDFDocUnlock = Module['_TRN_SDFDocUnlock'] = Module['asm']['_L']).apply(null, arguments);
});
var _TRN_SDFDocLockRead = (Module['_TRN_SDFDocLockRead'] = function () {
  return (_TRN_SDFDocLockRead = Module['_TRN_SDFDocLockRead'] = Module['asm']['$L']).apply(null, arguments);
});
var _TRN_SDFDocUnlockRead = (Module['_TRN_SDFDocUnlockRead'] = function () {
  return (_TRN_SDFDocUnlockRead = Module['_TRN_SDFDocUnlockRead'] = Module['asm']['aM']).apply(null, arguments);
});
var _TRN_SDFDocTryLock = (Module['_TRN_SDFDocTryLock'] = function () {
  return (_TRN_SDFDocTryLock = Module['_TRN_SDFDocTryLock'] = Module['asm']['bM']).apply(null, arguments);
});
var _TRN_SDFDocTryLockRead = (Module['_TRN_SDFDocTryLockRead'] = function () {
  return (_TRN_SDFDocTryLockRead = Module['_TRN_SDFDocTryLockRead'] = Module['asm']['cM']).apply(null, arguments);
});
var _TRN_SDFDocGetFileName = (Module['_TRN_SDFDocGetFileName'] = function () {
  return (_TRN_SDFDocGetFileName = Module['_TRN_SDFDocGetFileName'] = Module['asm']['dM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectName = (Module['_TRN_SDFDocCreateIndirectName'] = function () {
  return (_TRN_SDFDocCreateIndirectName = Module['_TRN_SDFDocCreateIndirectName'] = Module['asm']['eM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectArray = (Module['_TRN_SDFDocCreateIndirectArray'] = function () {
  return (_TRN_SDFDocCreateIndirectArray = Module['_TRN_SDFDocCreateIndirectArray'] = Module['asm']['fM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectBool = (Module['_TRN_SDFDocCreateIndirectBool'] = function () {
  return (_TRN_SDFDocCreateIndirectBool = Module['_TRN_SDFDocCreateIndirectBool'] = Module['asm']['gM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectDict = (Module['_TRN_SDFDocCreateIndirectDict'] = function () {
  return (_TRN_SDFDocCreateIndirectDict = Module['_TRN_SDFDocCreateIndirectDict'] = Module['asm']['hM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectNull = (Module['_TRN_SDFDocCreateIndirectNull'] = function () {
  return (_TRN_SDFDocCreateIndirectNull = Module['_TRN_SDFDocCreateIndirectNull'] = Module['asm']['iM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectNumber = (Module['_TRN_SDFDocCreateIndirectNumber'] = function () {
  return (_TRN_SDFDocCreateIndirectNumber = Module['_TRN_SDFDocCreateIndirectNumber'] = Module['asm']['jM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectString = (Module['_TRN_SDFDocCreateIndirectString'] = function () {
  return (_TRN_SDFDocCreateIndirectString = Module['_TRN_SDFDocCreateIndirectString'] = Module['asm']['kM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectStringFromUString = (Module['_TRN_SDFDocCreateIndirectStringFromUString'] = function () {
  return (_TRN_SDFDocCreateIndirectStringFromUString = Module['_TRN_SDFDocCreateIndirectStringFromUString'] = Module['asm']['lM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectStreamFromFilter = (Module['_TRN_SDFDocCreateIndirectStreamFromFilter'] = function () {
  return (_TRN_SDFDocCreateIndirectStreamFromFilter = Module['_TRN_SDFDocCreateIndirectStreamFromFilter'] = Module['asm']['mM']).apply(null, arguments);
});
var _TRN_SDFDocCreateIndirectStream = (Module['_TRN_SDFDocCreateIndirectStream'] = function () {
  return (_TRN_SDFDocCreateIndirectStream = Module['_TRN_SDFDocCreateIndirectStream'] = Module['asm']['nM']).apply(null, arguments);
});
var _TRN_SecurityHandlerDestroy = (Module['_TRN_SecurityHandlerDestroy'] = function () {
  return (_TRN_SecurityHandlerDestroy = Module['_TRN_SecurityHandlerDestroy'] = Module['asm']['oM']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetPermission = (Module['_TRN_SecurityHandlerGetPermission'] = function () {
  return (_TRN_SecurityHandlerGetPermission = Module['_TRN_SecurityHandlerGetPermission'] = Module['asm']['pM']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetKeyLength = (Module['_TRN_SecurityHandlerGetKeyLength'] = function () {
  return (_TRN_SecurityHandlerGetKeyLength = Module['_TRN_SecurityHandlerGetKeyLength'] = Module['asm']['qM']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetEncryptionAlgorithmID = (Module['_TRN_SecurityHandlerGetEncryptionAlgorithmID'] = function () {
  return (_TRN_SecurityHandlerGetEncryptionAlgorithmID = Module['_TRN_SecurityHandlerGetEncryptionAlgorithmID'] = Module['asm']['rM']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetHandlerDocName = (Module['_TRN_SecurityHandlerGetHandlerDocName'] = function () {
  return (_TRN_SecurityHandlerGetHandlerDocName = Module['_TRN_SecurityHandlerGetHandlerDocName'] = Module['asm']['sM']).apply(null, arguments);
});
var _TRN_SecurityHandlerIsModified = (Module['_TRN_SecurityHandlerIsModified'] = function () {
  return (_TRN_SecurityHandlerIsModified = Module['_TRN_SecurityHandlerIsModified'] = Module['asm']['tM']).apply(null, arguments);
});
var _TRN_SecurityHandlerSetModified = (Module['_TRN_SecurityHandlerSetModified'] = function () {
  return (_TRN_SecurityHandlerSetModified = Module['_TRN_SecurityHandlerSetModified'] = Module['asm']['uM']).apply(null, arguments);
});
var _TRN_SecurityHandlerCreate = (Module['_TRN_SecurityHandlerCreate'] = function () {
  return (_TRN_SecurityHandlerCreate = Module['_TRN_SecurityHandlerCreate'] = Module['asm']['vM']).apply(null, arguments);
});
var _TRN_SecurityHandlerCreateFromEncCode = (Module['_TRN_SecurityHandlerCreateFromEncCode'] = function () {
  return (_TRN_SecurityHandlerCreateFromEncCode = Module['_TRN_SecurityHandlerCreateFromEncCode'] = Module['asm']['wM']).apply(null, arguments);
});
var _TRN_SecurityHandlerCreateDefault = (Module['_TRN_SecurityHandlerCreateDefault'] = function () {
  return (_TRN_SecurityHandlerCreateDefault = Module['_TRN_SecurityHandlerCreateDefault'] = Module['asm']['xM']).apply(null, arguments);
});
var _TRN_SecurityHandlerSetPermission = (Module['_TRN_SecurityHandlerSetPermission'] = function () {
  return (_TRN_SecurityHandlerSetPermission = Module['_TRN_SecurityHandlerSetPermission'] = Module['asm']['yM']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeRevisionNumber = (Module['_TRN_SecurityHandlerChangeRevisionNumber'] = function () {
  return (_TRN_SecurityHandlerChangeRevisionNumber = Module['_TRN_SecurityHandlerChangeRevisionNumber'] = Module['asm']['zM']).apply(null, arguments);
});
var _TRN_SecurityHandlerSetEncryptMetadata = (Module['_TRN_SecurityHandlerSetEncryptMetadata'] = function () {
  return (_TRN_SecurityHandlerSetEncryptMetadata = Module['_TRN_SecurityHandlerSetEncryptMetadata'] = Module['asm']['AM']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetRevisionNumber = (Module['_TRN_SecurityHandlerGetRevisionNumber'] = function () {
  return (_TRN_SecurityHandlerGetRevisionNumber = Module['_TRN_SecurityHandlerGetRevisionNumber'] = Module['asm']['BM']).apply(null, arguments);
});
var _TRN_SecurityHandlerIsUserPasswordRequired = (Module['_TRN_SecurityHandlerIsUserPasswordRequired'] = function () {
  return (_TRN_SecurityHandlerIsUserPasswordRequired = Module['_TRN_SecurityHandlerIsUserPasswordRequired'] = Module['asm']['CM']).apply(null, arguments);
});
var _TRN_SecurityHandlerIsMasterPasswordRequired = (Module['_TRN_SecurityHandlerIsMasterPasswordRequired'] = function () {
  return (_TRN_SecurityHandlerIsMasterPasswordRequired = Module['_TRN_SecurityHandlerIsMasterPasswordRequired'] = Module['asm']['DM']).apply(null, arguments);
});
var _TRN_SecurityHandlerIsAES = (Module['_TRN_SecurityHandlerIsAES'] = function () {
  return (_TRN_SecurityHandlerIsAES = Module['_TRN_SecurityHandlerIsAES'] = Module['asm']['EM']).apply(null, arguments);
});
var _TRN_SecurityHandlerIsAESObj = (Module['_TRN_SecurityHandlerIsAESObj'] = function () {
  return (_TRN_SecurityHandlerIsAESObj = Module['_TRN_SecurityHandlerIsAESObj'] = Module['asm']['FM']).apply(null, arguments);
});
var _TRN_SecurityHandlerIsRC4 = (Module['_TRN_SecurityHandlerIsRC4'] = function () {
  return (_TRN_SecurityHandlerIsRC4 = Module['_TRN_SecurityHandlerIsRC4'] = Module['asm']['GM']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeUserPasswordUString = (Module['_TRN_SecurityHandlerChangeUserPasswordUString'] = function () {
  return (_TRN_SecurityHandlerChangeUserPasswordUString = Module['_TRN_SecurityHandlerChangeUserPasswordUString'] = Module['asm']['HM']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeUserPasswordBuffer = (Module['_TRN_SecurityHandlerChangeUserPasswordBuffer'] = function () {
  return (_TRN_SecurityHandlerChangeUserPasswordBuffer = Module['_TRN_SecurityHandlerChangeUserPasswordBuffer'] = Module['asm']['IM']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeMasterPasswordUString = (Module['_TRN_SecurityHandlerChangeMasterPasswordUString'] = function () {
  return (_TRN_SecurityHandlerChangeMasterPasswordUString = Module['_TRN_SecurityHandlerChangeMasterPasswordUString'] = Module['asm']['JM']).apply(
    null,
    arguments,
  );
});
var _TRN_SecurityHandlerChangeMasterPasswordBuffer = (Module['_TRN_SecurityHandlerChangeMasterPasswordBuffer'] = function () {
  return (_TRN_SecurityHandlerChangeMasterPasswordBuffer = Module['_TRN_SecurityHandlerChangeMasterPasswordBuffer'] = Module['asm']['KM']).apply(
    null,
    arguments,
  );
});
var _TRN_SecurityHandlerInitPasswordUString = (Module['_TRN_SecurityHandlerInitPasswordUString'] = function () {
  return (_TRN_SecurityHandlerInitPasswordUString = Module['_TRN_SecurityHandlerInitPasswordUString'] = Module['asm']['LM']).apply(null, arguments);
});
var _TRN_SecurityHandlerInitPasswordBuffer = (Module['_TRN_SecurityHandlerInitPasswordBuffer'] = function () {
  return (_TRN_SecurityHandlerInitPasswordBuffer = Module['_TRN_SecurityHandlerInitPasswordBuffer'] = Module['asm']['MM']).apply(null, arguments);
});
var _TRN_SignatureHandlerGetName = (Module['_TRN_SignatureHandlerGetName'] = function () {
  return (_TRN_SignatureHandlerGetName = Module['_TRN_SignatureHandlerGetName'] = Module['asm']['NM']).apply(null, arguments);
});
var _TRN_SignatureHandlerReset = (Module['_TRN_SignatureHandlerReset'] = function () {
  return (_TRN_SignatureHandlerReset = Module['_TRN_SignatureHandlerReset'] = Module['asm']['OM']).apply(null, arguments);
});
var _TRN_SignatureHandlerDestructor = (Module['_TRN_SignatureHandlerDestructor'] = function () {
  return (_TRN_SignatureHandlerDestructor = Module['_TRN_SignatureHandlerDestructor'] = Module['asm']['PM']).apply(null, arguments);
});
var _TRN_UndoManagerDiscardAllSnapshots = (Module['_TRN_UndoManagerDiscardAllSnapshots'] = function () {
  return (_TRN_UndoManagerDiscardAllSnapshots = Module['_TRN_UndoManagerDiscardAllSnapshots'] = Module['asm']['QM']).apply(null, arguments);
});
var _TRN_UndoManagerUndo = (Module['_TRN_UndoManagerUndo'] = function () {
  return (_TRN_UndoManagerUndo = Module['_TRN_UndoManagerUndo'] = Module['asm']['RM']).apply(null, arguments);
});
var _TRN_UndoManagerCanUndo = (Module['_TRN_UndoManagerCanUndo'] = function () {
  return (_TRN_UndoManagerCanUndo = Module['_TRN_UndoManagerCanUndo'] = Module['asm']['SM']).apply(null, arguments);
});
var _TRN_UndoManagerGetNextUndoSnapshot = (Module['_TRN_UndoManagerGetNextUndoSnapshot'] = function () {
  return (_TRN_UndoManagerGetNextUndoSnapshot = Module['_TRN_UndoManagerGetNextUndoSnapshot'] = Module['asm']['TM']).apply(null, arguments);
});
var _TRN_UndoManagerRedo = (Module['_TRN_UndoManagerRedo'] = function () {
  return (_TRN_UndoManagerRedo = Module['_TRN_UndoManagerRedo'] = Module['asm']['UM']).apply(null, arguments);
});
var _TRN_UndoManagerCanRedo = (Module['_TRN_UndoManagerCanRedo'] = function () {
  return (_TRN_UndoManagerCanRedo = Module['_TRN_UndoManagerCanRedo'] = Module['asm']['VM']).apply(null, arguments);
});
var _TRN_UndoManagerGetNextRedoSnapshot = (Module['_TRN_UndoManagerGetNextRedoSnapshot'] = function () {
  return (_TRN_UndoManagerGetNextRedoSnapshot = Module['_TRN_UndoManagerGetNextRedoSnapshot'] = Module['asm']['WM']).apply(null, arguments);
});
var _TRN_UndoManagerTakeSnapshot = (Module['_TRN_UndoManagerTakeSnapshot'] = function () {
  return (_TRN_UndoManagerTakeSnapshot = Module['_TRN_UndoManagerTakeSnapshot'] = Module['asm']['XM']).apply(null, arguments);
});
var _TRN_UndoManagerDestroy = (Module['_TRN_UndoManagerDestroy'] = function () {
  return (_TRN_UndoManagerDestroy = Module['_TRN_UndoManagerDestroy'] = Module['asm']['YM']).apply(null, arguments);
});
var _TRN_ResultSnapshotCurrentState = (Module['_TRN_ResultSnapshotCurrentState'] = function () {
  return (_TRN_ResultSnapshotCurrentState = Module['_TRN_ResultSnapshotCurrentState'] = Module['asm']['ZM']).apply(null, arguments);
});
var _TRN_ResultSnapshotPreviousState = (Module['_TRN_ResultSnapshotPreviousState'] = function () {
  return (_TRN_ResultSnapshotPreviousState = Module['_TRN_ResultSnapshotPreviousState'] = Module['asm']['_M']).apply(null, arguments);
});
var _TRN_ResultSnapshotIsOk = (Module['_TRN_ResultSnapshotIsOk'] = function () {
  return (_TRN_ResultSnapshotIsOk = Module['_TRN_ResultSnapshotIsOk'] = Module['asm']['$M']).apply(null, arguments);
});
var _TRN_ResultSnapshotIsNullTransition = (Module['_TRN_ResultSnapshotIsNullTransition'] = function () {
  return (_TRN_ResultSnapshotIsNullTransition = Module['_TRN_ResultSnapshotIsNullTransition'] = Module['asm']['aN']).apply(null, arguments);
});
var _TRN_ResultSnapshotDestroy = (Module['_TRN_ResultSnapshotDestroy'] = function () {
  return (_TRN_ResultSnapshotDestroy = Module['_TRN_ResultSnapshotDestroy'] = Module['asm']['bN']).apply(null, arguments);
});
var _TRN_DocSnapshotGetHash = (Module['_TRN_DocSnapshotGetHash'] = function () {
  return (_TRN_DocSnapshotGetHash = Module['_TRN_DocSnapshotGetHash'] = Module['asm']['cN']).apply(null, arguments);
});
var _TRN_DocSnapshotIsValid = (Module['_TRN_DocSnapshotIsValid'] = function () {
  return (_TRN_DocSnapshotIsValid = Module['_TRN_DocSnapshotIsValid'] = Module['asm']['dN']).apply(null, arguments);
});
var _TRN_DocSnapshotEquals = (Module['_TRN_DocSnapshotEquals'] = function () {
  return (_TRN_DocSnapshotEquals = Module['_TRN_DocSnapshotEquals'] = Module['asm']['eN']).apply(null, arguments);
});
var _TRN_DocSnapshotDestroy = (Module['_TRN_DocSnapshotDestroy'] = function () {
  return (_TRN_DocSnapshotDestroy = Module['_TRN_DocSnapshotDestroy'] = Module['asm']['fN']).apply(null, arguments);
});
var _TRN_OCRModuleApplyOCRJsonToPDF = (Module['_TRN_OCRModuleApplyOCRJsonToPDF'] = function () {
  return (_TRN_OCRModuleApplyOCRJsonToPDF = Module['_TRN_OCRModuleApplyOCRJsonToPDF'] = Module['asm']['gN']).apply(null, arguments);
});
var _TRN_OCRModuleApplyOCRXmlToPDF = (Module['_TRN_OCRModuleApplyOCRXmlToPDF'] = function () {
  return (_TRN_OCRModuleApplyOCRXmlToPDF = Module['_TRN_OCRModuleApplyOCRXmlToPDF'] = Module['asm']['hN']).apply(null, arguments);
});
var _TRN_VerificationOptionsCreate = (Module['_TRN_VerificationOptionsCreate'] = function () {
  return (_TRN_VerificationOptionsCreate = Module['_TRN_VerificationOptionsCreate'] = Module['asm']['iN']).apply(null, arguments);
});
var _TRN_VerificationOptionsAddTrustedCertificate = (Module['_TRN_VerificationOptionsAddTrustedCertificate'] = function () {
  return (_TRN_VerificationOptionsAddTrustedCertificate = Module['_TRN_VerificationOptionsAddTrustedCertificate'] = Module['asm']['jN']).apply(null, arguments);
});
var _TRN_VerificationOptionsAddTrustedCertificates = (Module['_TRN_VerificationOptionsAddTrustedCertificates'] = function () {
  return (_TRN_VerificationOptionsAddTrustedCertificates = Module['_TRN_VerificationOptionsAddTrustedCertificates'] = Module['asm']['kN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationOptionsLoadTrustList = (Module['_TRN_VerificationOptionsLoadTrustList'] = function () {
  return (_TRN_VerificationOptionsLoadTrustList = Module['_TRN_VerificationOptionsLoadTrustList'] = Module['asm']['lN']).apply(null, arguments);
});
var _TRN_VerificationOptionsEnableModificationVerification = (Module['_TRN_VerificationOptionsEnableModificationVerification'] = function () {
  return (_TRN_VerificationOptionsEnableModificationVerification = Module['_TRN_VerificationOptionsEnableModificationVerification'] =
    Module['asm']['mN']).apply(null, arguments);
});
var _TRN_VerificationOptionsEnableDigestVerification = (Module['_TRN_VerificationOptionsEnableDigestVerification'] = function () {
  return (_TRN_VerificationOptionsEnableDigestVerification = Module['_TRN_VerificationOptionsEnableDigestVerification'] = Module['asm']['nN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationOptionsEnableTrustVerification = (Module['_TRN_VerificationOptionsEnableTrustVerification'] = function () {
  return (_TRN_VerificationOptionsEnableTrustVerification = Module['_TRN_VerificationOptionsEnableTrustVerification'] = Module['asm']['oN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationOptionsSetRevocationProxyPrefix = (Module['_TRN_VerificationOptionsSetRevocationProxyPrefix'] = function () {
  return (_TRN_VerificationOptionsSetRevocationProxyPrefix = Module['_TRN_VerificationOptionsSetRevocationProxyPrefix'] = Module['asm']['pN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationOptionsEnableOnlineCRLRevocationChecking = (Module['_TRN_VerificationOptionsEnableOnlineCRLRevocationChecking'] = function () {
  return (_TRN_VerificationOptionsEnableOnlineCRLRevocationChecking = Module['_TRN_VerificationOptionsEnableOnlineCRLRevocationChecking'] =
    Module['asm']['qN']).apply(null, arguments);
});
var _TRN_VerificationOptionsEnableOnlineOCSPRevocationChecking = (Module['_TRN_VerificationOptionsEnableOnlineOCSPRevocationChecking'] = function () {
  return (_TRN_VerificationOptionsEnableOnlineOCSPRevocationChecking = Module['_TRN_VerificationOptionsEnableOnlineOCSPRevocationChecking'] =
    Module['asm']['rN']).apply(null, arguments);
});
var _TRN_VerificationOptionsEnableOnlineRevocationChecking = (Module['_TRN_VerificationOptionsEnableOnlineRevocationChecking'] = function () {
  return (_TRN_VerificationOptionsEnableOnlineRevocationChecking = Module['_TRN_VerificationOptionsEnableOnlineRevocationChecking'] =
    Module['asm']['sN']).apply(null, arguments);
});
var _TRN_VerificationOptionsDestroy = (Module['_TRN_VerificationOptionsDestroy'] = function () {
  return (_TRN_VerificationOptionsDestroy = Module['_TRN_VerificationOptionsDestroy'] = Module['asm']['tN']).apply(null, arguments);
});
var _TRN_VerificationResultGetDigitalSignatureField = (Module['_TRN_VerificationResultGetDigitalSignatureField'] = function () {
  return (_TRN_VerificationResultGetDigitalSignatureField = Module['_TRN_VerificationResultGetDigitalSignatureField'] = Module['asm']['uN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationResultGetVerificationStatus = (Module['_TRN_VerificationResultGetVerificationStatus'] = function () {
  return (_TRN_VerificationResultGetVerificationStatus = Module['_TRN_VerificationResultGetVerificationStatus'] = Module['asm']['vN']).apply(null, arguments);
});
var _TRN_VerificationResultGetDocumentStatus = (Module['_TRN_VerificationResultGetDocumentStatus'] = function () {
  return (_TRN_VerificationResultGetDocumentStatus = Module['_TRN_VerificationResultGetDocumentStatus'] = Module['asm']['wN']).apply(null, arguments);
});
var _TRN_VerificationResultGetDigestStatus = (Module['_TRN_VerificationResultGetDigestStatus'] = function () {
  return (_TRN_VerificationResultGetDigestStatus = Module['_TRN_VerificationResultGetDigestStatus'] = Module['asm']['xN']).apply(null, arguments);
});
var _TRN_VerificationResultGetTrustStatus = (Module['_TRN_VerificationResultGetTrustStatus'] = function () {
  return (_TRN_VerificationResultGetTrustStatus = Module['_TRN_VerificationResultGetTrustStatus'] = Module['asm']['yN']).apply(null, arguments);
});
var _TRN_VerificationResultGetPermissionsStatus = (Module['_TRN_VerificationResultGetPermissionsStatus'] = function () {
  return (_TRN_VerificationResultGetPermissionsStatus = Module['_TRN_VerificationResultGetPermissionsStatus'] = Module['asm']['zN']).apply(null, arguments);
});
var _TRN_VerificationResultGetTrustVerificationResult = (Module['_TRN_VerificationResultGetTrustVerificationResult'] = function () {
  return (_TRN_VerificationResultGetTrustVerificationResult = Module['_TRN_VerificationResultGetTrustVerificationResult'] = Module['asm']['AN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationResultHasTrustVerificationResult = (Module['_TRN_VerificationResultHasTrustVerificationResult'] = function () {
  return (_TRN_VerificationResultHasTrustVerificationResult = Module['_TRN_VerificationResultHasTrustVerificationResult'] = Module['asm']['BN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationResultGetDisallowedChanges = (Module['_TRN_VerificationResultGetDisallowedChanges'] = function () {
  return (_TRN_VerificationResultGetDisallowedChanges = Module['_TRN_VerificationResultGetDisallowedChanges'] = Module['asm']['CN']).apply(null, arguments);
});
var _TRN_VerificationResultGetDigestAlgorithm = (Module['_TRN_VerificationResultGetDigestAlgorithm'] = function () {
  return (_TRN_VerificationResultGetDigestAlgorithm = Module['_TRN_VerificationResultGetDigestAlgorithm'] = Module['asm']['DN']).apply(null, arguments);
});
var _TRN_VerificationResultGetDocumentStatusAsString = (Module['_TRN_VerificationResultGetDocumentStatusAsString'] = function () {
  return (_TRN_VerificationResultGetDocumentStatusAsString = Module['_TRN_VerificationResultGetDocumentStatusAsString'] = Module['asm']['EN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationResultGetDigestStatusAsString = (Module['_TRN_VerificationResultGetDigestStatusAsString'] = function () {
  return (_TRN_VerificationResultGetDigestStatusAsString = Module['_TRN_VerificationResultGetDigestStatusAsString'] = Module['asm']['FN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationResultGetTrustStatusAsString = (Module['_TRN_VerificationResultGetTrustStatusAsString'] = function () {
  return (_TRN_VerificationResultGetTrustStatusAsString = Module['_TRN_VerificationResultGetTrustStatusAsString'] = Module['asm']['GN']).apply(null, arguments);
});
var _TRN_VerificationResultGetPermissionsStatusAsString = (Module['_TRN_VerificationResultGetPermissionsStatusAsString'] = function () {
  return (_TRN_VerificationResultGetPermissionsStatusAsString = Module['_TRN_VerificationResultGetPermissionsStatusAsString'] = Module['asm']['HN']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationResultGetUnsupportedFeatures = (Module['_TRN_VerificationResultGetUnsupportedFeatures'] = function () {
  return (_TRN_VerificationResultGetUnsupportedFeatures = Module['_TRN_VerificationResultGetUnsupportedFeatures'] = Module['asm']['IN']).apply(null, arguments);
});
var _TRN_VerificationResultDestroy = (Module['_TRN_VerificationResultDestroy'] = function () {
  return (_TRN_VerificationResultDestroy = Module['_TRN_VerificationResultDestroy'] = Module['asm']['JN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultGetVerificationStatus = (Module['_TRN_EmbeddedTimestampVerificationResultGetVerificationStatus'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetVerificationStatus = Module['_TRN_EmbeddedTimestampVerificationResultGetVerificationStatus'] =
    Module['asm']['KN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatus = (Module['_TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatus'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatus = Module['_TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatus'] =
    Module['asm']['LN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatus = (Module['_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatus'] =
  function () {
    return (_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatus = Module[
      '_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatus'
    ] =
      Module['asm']['MN']).apply(null, arguments);
  });
var _TRN_EmbeddedTimestampVerificationResultGetTrustStatus = (Module['_TRN_EmbeddedTimestampVerificationResultGetTrustStatus'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetTrustStatus = Module['_TRN_EmbeddedTimestampVerificationResultGetTrustStatus'] =
    Module['asm']['NN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatusAsString = (Module['_TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatusAsString'] =
  function () {
    return (_TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatusAsString = Module['_TRN_EmbeddedTimestampVerificationResultGetCMSDigestStatusAsString'] =
      Module['asm']['ON']).apply(null, arguments);
  });
var _TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatusAsString = (Module[
  '_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatusAsString'
] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatusAsString = Module[
    '_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestStatusAsString'
  ] =
    Module['asm']['PN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultGetTrustStatusAsString = (Module['_TRN_EmbeddedTimestampVerificationResultGetTrustStatusAsString'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetTrustStatusAsString = Module['_TRN_EmbeddedTimestampVerificationResultGetTrustStatusAsString'] =
    Module['asm']['QN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultHasTrustVerificationResult = (Module['_TRN_EmbeddedTimestampVerificationResultHasTrustVerificationResult'] =
  function () {
    return (_TRN_EmbeddedTimestampVerificationResultHasTrustVerificationResult = Module['_TRN_EmbeddedTimestampVerificationResultHasTrustVerificationResult'] =
      Module['asm']['RN']).apply(null, arguments);
  });
var _TRN_EmbeddedTimestampVerificationResultGetTrustVerificationResult = (Module['_TRN_EmbeddedTimestampVerificationResultGetTrustVerificationResult'] =
  function () {
    return (_TRN_EmbeddedTimestampVerificationResultGetTrustVerificationResult = Module['_TRN_EmbeddedTimestampVerificationResultGetTrustVerificationResult'] =
      Module['asm']['SN']).apply(null, arguments);
  });
var _TRN_EmbeddedTimestampVerificationResultGetCMSSignatureDigestAlgorithm = (Module['_TRN_EmbeddedTimestampVerificationResultGetCMSSignatureDigestAlgorithm'] =
  function () {
    return (_TRN_EmbeddedTimestampVerificationResultGetCMSSignatureDigestAlgorithm = Module[
      '_TRN_EmbeddedTimestampVerificationResultGetCMSSignatureDigestAlgorithm'
    ] =
      Module['asm']['TN']).apply(null, arguments);
  });
var _TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestAlgorithm = (Module[
  '_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestAlgorithm'
] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestAlgorithm = Module[
    '_TRN_EmbeddedTimestampVerificationResultGetMessageImprintDigestAlgorithm'
  ] =
    Module['asm']['UN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultGetUnsupportedFeatures = (Module['_TRN_EmbeddedTimestampVerificationResultGetUnsupportedFeatures'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultGetUnsupportedFeatures = Module['_TRN_EmbeddedTimestampVerificationResultGetUnsupportedFeatures'] =
    Module['asm']['VN']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultDestroy = (Module['_TRN_EmbeddedTimestampVerificationResultDestroy'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultDestroy = Module['_TRN_EmbeddedTimestampVerificationResultDestroy'] = Module['asm']['WN']).apply(
    null,
    arguments,
  );
});
var _TRN_TrustVerificationResultWasSuccessful = (Module['_TRN_TrustVerificationResultWasSuccessful'] = function () {
  return (_TRN_TrustVerificationResultWasSuccessful = Module['_TRN_TrustVerificationResultWasSuccessful'] = Module['asm']['XN']).apply(null, arguments);
});
var _TRN_TrustVerificationResultGetResultString = (Module['_TRN_TrustVerificationResultGetResultString'] = function () {
  return (_TRN_TrustVerificationResultGetResultString = Module['_TRN_TrustVerificationResultGetResultString'] = Module['asm']['YN']).apply(null, arguments);
});
var _TRN_TrustVerificationResultGetTimeOfTrustVerification = (Module['_TRN_TrustVerificationResultGetTimeOfTrustVerification'] = function () {
  return (_TRN_TrustVerificationResultGetTimeOfTrustVerification = Module['_TRN_TrustVerificationResultGetTimeOfTrustVerification'] =
    Module['asm']['ZN']).apply(null, arguments);
});
var _TRN_TrustVerificationResultGetTimeOfTrustVerificationEnum = (Module['_TRN_TrustVerificationResultGetTimeOfTrustVerificationEnum'] = function () {
  return (_TRN_TrustVerificationResultGetTimeOfTrustVerificationEnum = Module['_TRN_TrustVerificationResultGetTimeOfTrustVerificationEnum'] =
    Module['asm']['_N']).apply(null, arguments);
});
var _TRN_TrustVerificationResultHasEmbeddedTimestampVerificationResult = (Module['_TRN_TrustVerificationResultHasEmbeddedTimestampVerificationResult'] =
  function () {
    return (_TRN_TrustVerificationResultHasEmbeddedTimestampVerificationResult = Module['_TRN_TrustVerificationResultHasEmbeddedTimestampVerificationResult'] =
      Module['asm']['$N']).apply(null, arguments);
  });
var _TRN_TrustVerificationResultDestroy = (Module['_TRN_TrustVerificationResultDestroy'] = function () {
  return (_TRN_TrustVerificationResultDestroy = Module['_TRN_TrustVerificationResultDestroy'] = Module['asm']['aO']).apply(null, arguments);
});
var _TRN_TrustVerificationResultGetEmbeddedTimestampVerificationResult = (Module['_TRN_TrustVerificationResultGetEmbeddedTimestampVerificationResult'] =
  function () {
    return (_TRN_TrustVerificationResultGetEmbeddedTimestampVerificationResult = Module['_TRN_TrustVerificationResultGetEmbeddedTimestampVerificationResult'] =
      Module['asm']['bO']).apply(null, arguments);
  });
var _TRN_TrustVerificationResultGetCertPath = (Module['_TRN_TrustVerificationResultGetCertPath'] = function () {
  return (_TRN_TrustVerificationResultGetCertPath = Module['_TRN_TrustVerificationResultGetCertPath'] = Module['asm']['cO']).apply(null, arguments);
});
var _TRN_DisallowedChangeGetObjNum = (Module['_TRN_DisallowedChangeGetObjNum'] = function () {
  return (_TRN_DisallowedChangeGetObjNum = Module['_TRN_DisallowedChangeGetObjNum'] = Module['asm']['dO']).apply(null, arguments);
});
var _TRN_DisallowedChangeGetType = (Module['_TRN_DisallowedChangeGetType'] = function () {
  return (_TRN_DisallowedChangeGetType = Module['_TRN_DisallowedChangeGetType'] = Module['asm']['eO']).apply(null, arguments);
});
var _TRN_DisallowedChangeGetTypeAsString = (Module['_TRN_DisallowedChangeGetTypeAsString'] = function () {
  return (_TRN_DisallowedChangeGetTypeAsString = Module['_TRN_DisallowedChangeGetTypeAsString'] = Module['asm']['fO']).apply(null, arguments);
});
var _TRN_DisallowedChangeDestroy = (Module['_TRN_DisallowedChangeDestroy'] = function () {
  return (_TRN_DisallowedChangeDestroy = Module['_TRN_DisallowedChangeDestroy'] = Module['asm']['gO']).apply(null, arguments);
});
var _TRN_X509ExtensionIsCritical = (Module['_TRN_X509ExtensionIsCritical'] = function () {
  return (_TRN_X509ExtensionIsCritical = Module['_TRN_X509ExtensionIsCritical'] = Module['asm']['hO']).apply(null, arguments);
});
var _TRN_X509ExtensionGetObjectIdentifier = (Module['_TRN_X509ExtensionGetObjectIdentifier'] = function () {
  return (_TRN_X509ExtensionGetObjectIdentifier = Module['_TRN_X509ExtensionGetObjectIdentifier'] = Module['asm']['iO']).apply(null, arguments);
});
var _TRN_X509ExtensionToString = (Module['_TRN_X509ExtensionToString'] = function () {
  return (_TRN_X509ExtensionToString = Module['_TRN_X509ExtensionToString'] = Module['asm']['jO']).apply(null, arguments);
});
var _TRN_X509ExtensionGetData = (Module['_TRN_X509ExtensionGetData'] = function () {
  return (_TRN_X509ExtensionGetData = Module['_TRN_X509ExtensionGetData'] = Module['asm']['kO']).apply(null, arguments);
});
var _TRN_X509ExtensionDestroy = (Module['_TRN_X509ExtensionDestroy'] = function () {
  return (_TRN_X509ExtensionDestroy = Module['_TRN_X509ExtensionDestroy'] = Module['asm']['lO']).apply(null, arguments);
});
var _TRN_X501AttributeTypeAndValueGetAttributeTypeOID = (Module['_TRN_X501AttributeTypeAndValueGetAttributeTypeOID'] = function () {
  return (_TRN_X501AttributeTypeAndValueGetAttributeTypeOID = Module['_TRN_X501AttributeTypeAndValueGetAttributeTypeOID'] = Module['asm']['mO']).apply(
    null,
    arguments,
  );
});
var _TRN_X501AttributeTypeAndValueGetStringValue = (Module['_TRN_X501AttributeTypeAndValueGetStringValue'] = function () {
  return (_TRN_X501AttributeTypeAndValueGetStringValue = Module['_TRN_X501AttributeTypeAndValueGetStringValue'] = Module['asm']['nO']).apply(null, arguments);
});
var _TRN_X501AttributeTypeAndValueDestroy = (Module['_TRN_X501AttributeTypeAndValueDestroy'] = function () {
  return (_TRN_X501AttributeTypeAndValueDestroy = Module['_TRN_X501AttributeTypeAndValueDestroy'] = Module['asm']['oO']).apply(null, arguments);
});
var _TRN_ByteRangeGetStartOffset = (Module['_TRN_ByteRangeGetStartOffset'] = function () {
  return (_TRN_ByteRangeGetStartOffset = Module['_TRN_ByteRangeGetStartOffset'] = Module['asm']['pO']).apply(null, arguments);
});
var _TRN_ByteRangeGetEndOffset = (Module['_TRN_ByteRangeGetEndOffset'] = function () {
  return (_TRN_ByteRangeGetEndOffset = Module['_TRN_ByteRangeGetEndOffset'] = Module['asm']['qO']).apply(null, arguments);
});
var _TRN_ByteRangeGetSize = (Module['_TRN_ByteRangeGetSize'] = function () {
  return (_TRN_ByteRangeGetSize = Module['_TRN_ByteRangeGetSize'] = Module['asm']['rO']).apply(null, arguments);
});
var _TRN_TimestampingResultGetStatus = (Module['_TRN_TimestampingResultGetStatus'] = function () {
  return (_TRN_TimestampingResultGetStatus = Module['_TRN_TimestampingResultGetStatus'] = Module['asm']['sO']).apply(null, arguments);
});
var _TRN_TimestampingResultGetString = (Module['_TRN_TimestampingResultGetString'] = function () {
  return (_TRN_TimestampingResultGetString = Module['_TRN_TimestampingResultGetString'] = Module['asm']['tO']).apply(null, arguments);
});
var _TRN_TimestampingResultHasResponseVerificationResult = (Module['_TRN_TimestampingResultHasResponseVerificationResult'] = function () {
  return (_TRN_TimestampingResultHasResponseVerificationResult = Module['_TRN_TimestampingResultHasResponseVerificationResult'] = Module['asm']['uO']).apply(
    null,
    arguments,
  );
});
var _TRN_TimestampingResultGetResponseVerificationResult = (Module['_TRN_TimestampingResultGetResponseVerificationResult'] = function () {
  return (_TRN_TimestampingResultGetResponseVerificationResult = Module['_TRN_TimestampingResultGetResponseVerificationResult'] = Module['asm']['vO']).apply(
    null,
    arguments,
  );
});
var _TRN_TimestampingResultGetData = (Module['_TRN_TimestampingResultGetData'] = function () {
  return (_TRN_TimestampingResultGetData = Module['_TRN_TimestampingResultGetData'] = Module['asm']['wO']).apply(null, arguments);
});
var _TRN_TimestampingResultDestroy = (Module['_TRN_TimestampingResultDestroy'] = function () {
  return (_TRN_TimestampingResultDestroy = Module['_TRN_TimestampingResultDestroy'] = Module['asm']['xO']).apply(null, arguments);
});
var _TRN_ActionParameterCreate = (Module['_TRN_ActionParameterCreate'] = function () {
  return (_TRN_ActionParameterCreate = Module['_TRN_ActionParameterCreate'] = Module['asm']['yO']).apply(null, arguments);
});
var _TRN_ActionParameterCreateWithField = (Module['_TRN_ActionParameterCreateWithField'] = function () {
  return (_TRN_ActionParameterCreateWithField = Module['_TRN_ActionParameterCreateWithField'] = Module['asm']['zO']).apply(null, arguments);
});
var _TRN_ActionParameterCreateWithAnnot = (Module['_TRN_ActionParameterCreateWithAnnot'] = function () {
  return (_TRN_ActionParameterCreateWithAnnot = Module['_TRN_ActionParameterCreateWithAnnot'] = Module['asm']['AO']).apply(null, arguments);
});
var _TRN_ActionParameterCreateWithPage = (Module['_TRN_ActionParameterCreateWithPage'] = function () {
  return (_TRN_ActionParameterCreateWithPage = Module['_TRN_ActionParameterCreateWithPage'] = Module['asm']['BO']).apply(null, arguments);
});
var _TRN_ActionParameterDestroy = (Module['_TRN_ActionParameterDestroy'] = function () {
  return (_TRN_ActionParameterDestroy = Module['_TRN_ActionParameterDestroy'] = Module['asm']['CO']).apply(null, arguments);
});
var _TRN_ActionParameterGetAction = (Module['_TRN_ActionParameterGetAction'] = function () {
  return (_TRN_ActionParameterGetAction = Module['_TRN_ActionParameterGetAction'] = Module['asm']['DO']).apply(null, arguments);
});
var _TRN_ViewChangeCollectionCreate = (Module['_TRN_ViewChangeCollectionCreate'] = function () {
  return (_TRN_ViewChangeCollectionCreate = Module['_TRN_ViewChangeCollectionCreate'] = Module['asm']['EO']).apply(null, arguments);
});
var _TRN_ViewChangeCollectionDestroy = (Module['_TRN_ViewChangeCollectionDestroy'] = function () {
  return (_TRN_ViewChangeCollectionDestroy = Module['_TRN_ViewChangeCollectionDestroy'] = Module['asm']['FO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupCreateFromField = (Module['_TRN_RadioButtonGroupCreateFromField'] = function () {
  return (_TRN_RadioButtonGroupCreateFromField = Module['_TRN_RadioButtonGroupCreateFromField'] = Module['asm']['GO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupCreate = (Module['_TRN_RadioButtonGroupCreate'] = function () {
  return (_TRN_RadioButtonGroupCreate = Module['_TRN_RadioButtonGroupCreate'] = Module['asm']['HO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupCopy = (Module['_TRN_RadioButtonGroupCopy'] = function () {
  return (_TRN_RadioButtonGroupCopy = Module['_TRN_RadioButtonGroupCopy'] = Module['asm']['IO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupDestroy = (Module['_TRN_RadioButtonGroupDestroy'] = function () {
  return (_TRN_RadioButtonGroupDestroy = Module['_TRN_RadioButtonGroupDestroy'] = Module['asm']['JO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupAdd = (Module['_TRN_RadioButtonGroupAdd'] = function () {
  return (_TRN_RadioButtonGroupAdd = Module['_TRN_RadioButtonGroupAdd'] = Module['asm']['KO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupGetNumButtons = (Module['_TRN_RadioButtonGroupGetNumButtons'] = function () {
  return (_TRN_RadioButtonGroupGetNumButtons = Module['_TRN_RadioButtonGroupGetNumButtons'] = Module['asm']['LO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupGetButton = (Module['_TRN_RadioButtonGroupGetButton'] = function () {
  return (_TRN_RadioButtonGroupGetButton = Module['_TRN_RadioButtonGroupGetButton'] = Module['asm']['MO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupGetField = (Module['_TRN_RadioButtonGroupGetField'] = function () {
  return (_TRN_RadioButtonGroupGetField = Module['_TRN_RadioButtonGroupGetField'] = Module['asm']['NO']).apply(null, arguments);
});
var _TRN_RadioButtonGroupAddGroupButtonsToPage = (Module['_TRN_RadioButtonGroupAddGroupButtonsToPage'] = function () {
  return (_TRN_RadioButtonGroupAddGroupButtonsToPage = Module['_TRN_RadioButtonGroupAddGroupButtonsToPage'] = Module['asm']['OO']).apply(null, arguments);
});
var _TRN_PDFTronCustomSecurityHandlerCreate = (Module['_TRN_PDFTronCustomSecurityHandlerCreate'] = function () {
  return (_TRN_PDFTronCustomSecurityHandlerCreate = Module['_TRN_PDFTronCustomSecurityHandlerCreate'] = Module['asm']['PO']).apply(null, arguments);
});
var _TRN_WebFontDownloaderIsAvailable = (Module['_TRN_WebFontDownloaderIsAvailable'] = function () {
  return (_TRN_WebFontDownloaderIsAvailable = Module['_TRN_WebFontDownloaderIsAvailable'] = Module['asm']['QO']).apply(null, arguments);
});
var _TRN_WebFontDownloaderEnableDownloads = (Module['_TRN_WebFontDownloaderEnableDownloads'] = function () {
  return (_TRN_WebFontDownloaderEnableDownloads = Module['_TRN_WebFontDownloaderEnableDownloads'] = Module['asm']['RO']).apply(null, arguments);
});
var _TRN_WebFontDownloaderDisableDownloads = (Module['_TRN_WebFontDownloaderDisableDownloads'] = function () {
  return (_TRN_WebFontDownloaderDisableDownloads = Module['_TRN_WebFontDownloaderDisableDownloads'] = Module['asm']['SO']).apply(null, arguments);
});
var _TRN_WebFontDownloaderPreCacheAsync = (Module['_TRN_WebFontDownloaderPreCacheAsync'] = function () {
  return (_TRN_WebFontDownloaderPreCacheAsync = Module['_TRN_WebFontDownloaderPreCacheAsync'] = Module['asm']['TO']).apply(null, arguments);
});
var _TRN_WebFontDownloaderClearCache = (Module['_TRN_WebFontDownloaderClearCache'] = function () {
  return (_TRN_WebFontDownloaderClearCache = Module['_TRN_WebFontDownloaderClearCache'] = Module['asm']['UO']).apply(null, arguments);
});
var _TRN_WebFontDownloaderSetCustomWebFontURL = (Module['_TRN_WebFontDownloaderSetCustomWebFontURL'] = function () {
  return (_TRN_WebFontDownloaderSetCustomWebFontURL = Module['_TRN_WebFontDownloaderSetCustomWebFontURL'] = Module['asm']['VO']).apply(null, arguments);
});
var _TRN_AppearanceReferenceListCreate = (Module['_TRN_AppearanceReferenceListCreate'] = function () {
  return (_TRN_AppearanceReferenceListCreate = Module['_TRN_AppearanceReferenceListCreate'] = Module['asm']['WO']).apply(null, arguments);
});
var _TRN_AppearanceStringListCreate = (Module['_TRN_AppearanceStringListCreate'] = function () {
  return (_TRN_AppearanceStringListCreate = Module['_TRN_AppearanceStringListCreate'] = Module['asm']['XO']).apply(null, arguments);
});
var _TRN_AppearanceReferenceListAddReference = (Module['_TRN_AppearanceReferenceListAddReference'] = function () {
  return (_TRN_AppearanceReferenceListAddReference = Module['_TRN_AppearanceReferenceListAddReference'] = Module['asm']['YO']).apply(null, arguments);
});
var _TRN_AppearanceStringListAddString = (Module['_TRN_AppearanceStringListAddString'] = function () {
  return (_TRN_AppearanceStringListAddString = Module['_TRN_AppearanceStringListAddString'] = Module['asm']['ZO']).apply(null, arguments);
});
var _TRN_PDFDocAppearancesToXodBuffer = (Module['_TRN_PDFDocAppearancesToXodBuffer'] = function () {
  return (_TRN_PDFDocAppearancesToXodBuffer = Module['_TRN_PDFDocAppearancesToXodBuffer'] = Module['asm']['_O']).apply(null, arguments);
});
var _TRN_AppearanceReferenceListDestroy = (Module['_TRN_AppearanceReferenceListDestroy'] = function () {
  return (_TRN_AppearanceReferenceListDestroy = Module['_TRN_AppearanceReferenceListDestroy'] = Module['asm']['$O']).apply(null, arguments);
});
var _TRN_AppearanceStringListDestroy = (Module['_TRN_AppearanceStringListDestroy'] = function () {
  return (_TRN_AppearanceStringListDestroy = Module['_TRN_AppearanceStringListDestroy'] = Module['asm']['aP']).apply(null, arguments);
});
var _TRN_ConvertPageToAnnotAppearance = (Module['_TRN_ConvertPageToAnnotAppearance'] = function () {
  return (_TRN_ConvertPageToAnnotAppearance = Module['_TRN_ConvertPageToAnnotAppearance'] = Module['asm']['bP']).apply(null, arguments);
});
var _TRN_TextSearchRunWithOffsetsWithinAmbientText = (Module['_TRN_TextSearchRunWithOffsetsWithinAmbientText'] = function () {
  return (_TRN_TextSearchRunWithOffsetsWithinAmbientText = Module['_TRN_TextSearchRunWithOffsetsWithinAmbientText'] = Module['asm']['cP']).apply(
    null,
    arguments,
  );
});
var _TRN_CreateException = (Module['_TRN_CreateException'] = function () {
  return (_TRN_CreateException = Module['_TRN_CreateException'] = Module['asm']['dP']).apply(null, arguments);
});
var _TRN_GetLineNum = (Module['_TRN_GetLineNum'] = function () {
  return (_TRN_GetLineNum = Module['_TRN_GetLineNum'] = Module['asm']['eP']).apply(null, arguments);
});
var _TRN_GetCondExpr = (Module['_TRN_GetCondExpr'] = function () {
  return (_TRN_GetCondExpr = Module['_TRN_GetCondExpr'] = Module['asm']['fP']).apply(null, arguments);
});
var _TRN_GetFileName = (Module['_TRN_GetFileName'] = function () {
  return (_TRN_GetFileName = Module['_TRN_GetFileName'] = Module['asm']['gP']).apply(null, arguments);
});
var _TRN_GetFunction = (Module['_TRN_GetFunction'] = function () {
  return (_TRN_GetFunction = Module['_TRN_GetFunction'] = Module['asm']['hP']).apply(null, arguments);
});
var _TRN_GetMessage = (Module['_TRN_GetMessage'] = function () {
  return (_TRN_GetMessage = Module['_TRN_GetMessage'] = Module['asm']['iP']).apply(null, arguments);
});
var _TRN_GetErrorCode = (Module['_TRN_GetErrorCode'] = function () {
  return (_TRN_GetErrorCode = Module['_TRN_GetErrorCode'] = Module['asm']['jP']).apply(null, arguments);
});
var _TRN_IteratorAssign = (Module['_TRN_IteratorAssign'] = function () {
  return (_TRN_IteratorAssign = Module['_TRN_IteratorAssign'] = Module['asm']['kP']).apply(null, arguments);
});
var _TRN_DictIteratorAssign = (Module['_TRN_DictIteratorAssign'] = function () {
  return (_TRN_DictIteratorAssign = Module['_TRN_DictIteratorAssign'] = Module['asm']['lP']).apply(null, arguments);
});
var _TRN_OwnedBitmapGetWidth = (Module['_TRN_OwnedBitmapGetWidth'] = function () {
  return (_TRN_OwnedBitmapGetWidth = Module['_TRN_OwnedBitmapGetWidth'] = Module['asm']['mP']).apply(null, arguments);
});
var _TRN_OwnedBitmapGetHeight = (Module['_TRN_OwnedBitmapGetHeight'] = function () {
  return (_TRN_OwnedBitmapGetHeight = Module['_TRN_OwnedBitmapGetHeight'] = Module['asm']['nP']).apply(null, arguments);
});
var _TRN_OwnedBitmapGetTotalSize = (Module['_TRN_OwnedBitmapGetTotalSize'] = function () {
  return (_TRN_OwnedBitmapGetTotalSize = Module['_TRN_OwnedBitmapGetTotalSize'] = Module['asm']['oP']).apply(null, arguments);
});
var _TRN_OwnedBitmapGetData = (Module['_TRN_OwnedBitmapGetData'] = function () {
  return (_TRN_OwnedBitmapGetData = Module['_TRN_OwnedBitmapGetData'] = Module['asm']['pP']).apply(null, arguments);
});
var _TRN_OwnedBitmapGetBlendMode = (Module['_TRN_OwnedBitmapGetBlendMode'] = function () {
  return (_TRN_OwnedBitmapGetBlendMode = Module['_TRN_OwnedBitmapGetBlendMode'] = Module['asm']['qP']).apply(null, arguments);
});
var _TRN_OwnedBitmapDestroy = (Module['_TRN_OwnedBitmapDestroy'] = function () {
  return (_TRN_OwnedBitmapDestroy = Module['_TRN_OwnedBitmapDestroy'] = Module['asm']['rP']).apply(null, arguments);
});
var _TRN_UStringCopy = (Module['_TRN_UStringCopy'] = function () {
  return (_TRN_UStringCopy = Module['_TRN_UStringCopy'] = Module['asm']['sP']).apply(null, arguments);
});
var _TRN_UStringCreateFromCharacter = (Module['_TRN_UStringCreateFromCharacter'] = function () {
  return (_TRN_UStringCreateFromCharacter = Module['_TRN_UStringCreateFromCharacter'] = Module['asm']['tP']).apply(null, arguments);
});
var _TRN_UStringCreateFromString = (Module['_TRN_UStringCreateFromString'] = function () {
  return (_TRN_UStringCreateFromString = Module['_TRN_UStringCreateFromString'] = Module['asm']['uP']).apply(null, arguments);
});
var _TRN_UStringAssignString = (Module['_TRN_UStringAssignString'] = function () {
  return (_TRN_UStringAssignString = Module['_TRN_UStringAssignString'] = Module['asm']['vP']).apply(null, arguments);
});
var _TRN_UStringAssignAscii = (Module['_TRN_UStringAssignAscii'] = function () {
  return (_TRN_UStringAssignAscii = Module['_TRN_UStringAssignAscii'] = Module['asm']['wP']).apply(null, arguments);
});
var _TRN_UStringAssignConcat = (Module['_TRN_UStringAssignConcat'] = function () {
  return (_TRN_UStringAssignConcat = Module['_TRN_UStringAssignConcat'] = Module['asm']['xP']).apply(null, arguments);
});
var _TRN_UStringConcat = (Module['_TRN_UStringConcat'] = function () {
  return (_TRN_UStringConcat = Module['_TRN_UStringConcat'] = Module['asm']['yP']).apply(null, arguments);
});
var _TRN_UStringIsEmpty = (Module['_TRN_UStringIsEmpty'] = function () {
  return (_TRN_UStringIsEmpty = Module['_TRN_UStringIsEmpty'] = Module['asm']['zP']).apply(null, arguments);
});
var _TRN_UStringGetBuffer = (Module['_TRN_UStringGetBuffer'] = function () {
  return (_TRN_UStringGetBuffer = Module['_TRN_UStringGetBuffer'] = Module['asm']['AP']).apply(null, arguments);
});
var _TRN_UStringCompare = (Module['_TRN_UStringCompare'] = function () {
  return (_TRN_UStringCompare = Module['_TRN_UStringCompare'] = Module['asm']['BP']).apply(null, arguments);
});
var _TRN_UStringSubStr = (Module['_TRN_UStringSubStr'] = function () {
  return (_TRN_UStringSubStr = Module['_TRN_UStringSubStr'] = Module['asm']['CP']).apply(null, arguments);
});
var _TRN_UStringGetAt = (Module['_TRN_UStringGetAt'] = function () {
  return (_TRN_UStringGetAt = Module['_TRN_UStringGetAt'] = Module['asm']['DP']).apply(null, arguments);
});
var _TRN_UStringPushBack = (Module['_TRN_UStringPushBack'] = function () {
  return (_TRN_UStringPushBack = Module['_TRN_UStringPushBack'] = Module['asm']['EP']).apply(null, arguments);
});
var _TRN_UStringResize = (Module['_TRN_UStringResize'] = function () {
  return (_TRN_UStringResize = Module['_TRN_UStringResize'] = Module['asm']['FP']).apply(null, arguments);
});
var _TRN_UStringToLower = (Module['_TRN_UStringToLower'] = function () {
  return (_TRN_UStringToLower = Module['_TRN_UStringToLower'] = Module['asm']['GP']).apply(null, arguments);
});
var _TRN_UStringToUpper = (Module['_TRN_UStringToUpper'] = function () {
  return (_TRN_UStringToUpper = Module['_TRN_UStringToUpper'] = Module['asm']['HP']).apply(null, arguments);
});
var _TRN_UStringReserve = (Module['_TRN_UStringReserve'] = function () {
  return (_TRN_UStringReserve = Module['_TRN_UStringReserve'] = Module['asm']['IP']).apply(null, arguments);
});
var _TRN_UStringIsInAscii = (Module['_TRN_UStringIsInAscii'] = function () {
  return (_TRN_UStringIsInAscii = Module['_TRN_UStringIsInAscii'] = Module['asm']['JP']).apply(null, arguments);
});
var _TRN_UStringConvertToAscii = (Module['_TRN_UStringConvertToAscii'] = function () {
  return (_TRN_UStringConvertToAscii = Module['_TRN_UStringConvertToAscii'] = Module['asm']['KP']).apply(null, arguments);
});
var _TRN_UStringConvertToPDFText = (Module['_TRN_UStringConvertToPDFText'] = function () {
  return (_TRN_UStringConvertToPDFText = Module['_TRN_UStringConvertToPDFText'] = Module['asm']['LP']).apply(null, arguments);
});
var _TRN_ObjectIdentifierCreateFromPredefined = (Module['_TRN_ObjectIdentifierCreateFromPredefined'] = function () {
  return (_TRN_ObjectIdentifierCreateFromPredefined = Module['_TRN_ObjectIdentifierCreateFromPredefined'] = Module['asm']['MP']).apply(null, arguments);
});
var _TRN_X509CertificateCreateFromFile = (Module['_TRN_X509CertificateCreateFromFile'] = function () {
  return (_TRN_X509CertificateCreateFromFile = Module['_TRN_X509CertificateCreateFromFile'] = Module['asm']['NP']).apply(null, arguments);
});
var _TRN_FDFDocCreateFromSDFDoc = (Module['_TRN_FDFDocCreateFromSDFDoc'] = function () {
  return (_TRN_FDFDocCreateFromSDFDoc = Module['_TRN_FDFDocCreateFromSDFDoc'] = Module['asm']['OP']).apply(null, arguments);
});
var _TRN_FDFDocCreateFromFilePath = (Module['_TRN_FDFDocCreateFromFilePath'] = function () {
  return (_TRN_FDFDocCreateFromFilePath = Module['_TRN_FDFDocCreateFromFilePath'] = Module['asm']['PP']).apply(null, arguments);
});
var _TRN_FDFDocCreateFromUFilePath = (Module['_TRN_FDFDocCreateFromUFilePath'] = function () {
  return (_TRN_FDFDocCreateFromUFilePath = Module['_TRN_FDFDocCreateFromUFilePath'] = Module['asm']['QP']).apply(null, arguments);
});
var _TRN_FDFDocSave = (Module['_TRN_FDFDocSave'] = function () {
  return (_TRN_FDFDocSave = Module['_TRN_FDFDocSave'] = Module['asm']['RP']).apply(null, arguments);
});
var _TRN_FDFDocSaveAsXFDF = (Module['_TRN_FDFDocSaveAsXFDF'] = function () {
  return (_TRN_FDFDocSaveAsXFDF = Module['_TRN_FDFDocSaveAsXFDF'] = Module['asm']['SP']).apply(null, arguments);
});
var _TRN_FDFFieldAssign = (Module['_TRN_FDFFieldAssign'] = function () {
  return (_TRN_FDFFieldAssign = Module['_TRN_FDFFieldAssign'] = Module['asm']['TP']).apply(null, arguments);
});
var _TRN_FilterBegin = (Module['_TRN_FilterBegin'] = function () {
  return (_TRN_FilterBegin = Module['_TRN_FilterBegin'] = Module['asm']['UP']).apply(null, arguments);
});
var _TRN_FilterWriteToFile = (Module['_TRN_FilterWriteToFile'] = function () {
  return (_TRN_FilterWriteToFile = Module['_TRN_FilterWriteToFile'] = Module['asm']['VP']).apply(null, arguments);
});
var _TRN_PathCompare = (Module['_TRN_PathCompare'] = function () {
  return (_TRN_PathCompare = Module['_TRN_PathCompare'] = Module['asm']['WP']).apply(null, arguments);
});
var _TRN_FilterCreateCustom = (Module['_TRN_FilterCreateCustom'] = function () {
  return (_TRN_FilterCreateCustom = Module['_TRN_FilterCreateCustom'] = Module['asm']['XP']).apply(null, arguments);
});
var _TRN_FilterCreateCustomWithStruct = (Module['_TRN_FilterCreateCustomWithStruct'] = function () {
  return (_TRN_FilterCreateCustomWithStruct = Module['_TRN_FilterCreateCustomWithStruct'] = Module['asm']['YP']).apply(null, arguments);
});
var _TRN_PDFAComplianceCreateFromFile = (Module['_TRN_PDFAComplianceCreateFromFile'] = function () {
  return (_TRN_PDFAComplianceCreateFromFile = Module['_TRN_PDFAComplianceCreateFromFile'] = Module['asm']['ZP']).apply(null, arguments);
});
var _TRN_PDFAComplianceSaveAsFromFileName = (Module['_TRN_PDFAComplianceSaveAsFromFileName'] = function () {
  return (_TRN_PDFAComplianceSaveAsFromFileName = Module['_TRN_PDFAComplianceSaveAsFromFileName'] = Module['asm']['_P']).apply(null, arguments);
});
var _TRN_SElementAssign = (Module['_TRN_SElementAssign'] = function () {
  return (_TRN_SElementAssign = Module['_TRN_SElementAssign'] = Module['asm']['$P']).apply(null, arguments);
});
var _TRN_STreeGetElement = (Module['_TRN_STreeGetElement'] = function () {
  return (_TRN_STreeGetElement = Module['_TRN_STreeGetElement'] = Module['asm']['aQ']).apply(null, arguments);
});
var _TRN_KeyStrokeActionResultAssign = (Module['_TRN_KeyStrokeActionResultAssign'] = function () {
  return (_TRN_KeyStrokeActionResultAssign = Module['_TRN_KeyStrokeActionResultAssign'] = Module['asm']['bQ']).apply(null, arguments);
});
var _TRN_KeyStrokeEventDataAssign = (Module['_TRN_KeyStrokeEventDataAssign'] = function () {
  return (_TRN_KeyStrokeEventDataAssign = Module['_TRN_KeyStrokeEventDataAssign'] = Module['asm']['cQ']).apply(null, arguments);
});
var _TRN_ActionParameterAssign = (Module['_TRN_ActionParameterAssign'] = function () {
  return (_TRN_ActionParameterAssign = Module['_TRN_ActionParameterAssign'] = Module['asm']['dQ']).apply(null, arguments);
});
var _TRN_AdvancedImagingModuleIsModuleAvailable = (Module['_TRN_AdvancedImagingModuleIsModuleAvailable'] = function () {
  return (_TRN_AdvancedImagingModuleIsModuleAvailable = Module['_TRN_AdvancedImagingModuleIsModuleAvailable'] = Module['asm']['eQ']).apply(null, arguments);
});
var _TRN_ColorPtAssign = (Module['_TRN_ColorPtAssign'] = function () {
  return (_TRN_ColorPtAssign = Module['_TRN_ColorPtAssign'] = Module['asm']['fQ']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleSetDashPattern = (Module['_TRN_AnnotBorderStyleSetDashPattern'] = function () {
  return (_TRN_AnnotBorderStyleSetDashPattern = Module['_TRN_AnnotBorderStyleSetDashPattern'] = Module['asm']['gQ']).apply(null, arguments);
});
var _TRN_AnnotBorderStyleAssign = (Module['_TRN_AnnotBorderStyleAssign'] = function () {
  return (_TRN_AnnotBorderStyleAssign = Module['_TRN_AnnotBorderStyleAssign'] = Module['asm']['hQ']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotCreateWithIcon = (Module['_TRN_FileAttachmentAnnotCreateWithIcon'] = function () {
  return (_TRN_FileAttachmentAnnotCreateWithIcon = Module['_TRN_FileAttachmentAnnotCreateWithIcon'] = Module['asm']['iQ']).apply(null, arguments);
});
var _TRN_FileAttachmentAnnotCreate = (Module['_TRN_FileAttachmentAnnotCreate'] = function () {
  return (_TRN_FileAttachmentAnnotCreate = Module['_TRN_FileAttachmentAnnotCreate'] = Module['asm']['jQ']).apply(null, arguments);
});
var _TRN_ComboBoxWidgetGetOptions = (Module['_TRN_ComboBoxWidgetGetOptions'] = function () {
  return (_TRN_ComboBoxWidgetGetOptions = Module['_TRN_ComboBoxWidgetGetOptions'] = Module['asm']['kQ']).apply(null, arguments);
});
var _TRN_ListBoxWidgetGetSelectedOptions = (Module['_TRN_ListBoxWidgetGetSelectedOptions'] = function () {
  return (_TRN_ListBoxWidgetGetSelectedOptions = Module['_TRN_ListBoxWidgetGetSelectedOptions'] = Module['asm']['lQ']).apply(null, arguments);
});
var _TRN_ListBoxWidgetGetOptions = (Module['_TRN_ListBoxWidgetGetOptions'] = function () {
  return (_TRN_ListBoxWidgetGetOptions = Module['_TRN_ListBoxWidgetGetOptions'] = Module['asm']['mQ']).apply(null, arguments);
});
var _TRN_BlackBoxContextDoOperation = (Module['_TRN_BlackBoxContextDoOperation'] = function () {
  return (_TRN_BlackBoxContextDoOperation = Module['_TRN_BlackBoxContextDoOperation'] = Module['asm']['nQ']).apply(null, arguments);
});
var _TRN_BlackBoxContextGetDoc = (Module['_TRN_BlackBoxContextGetDoc'] = function () {
  return (_TRN_BlackBoxContextGetDoc = Module['_TRN_BlackBoxContextGetDoc'] = Module['asm']['oQ']).apply(null, arguments);
});
var _TRN_BlackBoxContextDestroy = (Module['_TRN_BlackBoxContextDestroy'] = function () {
  return (_TRN_BlackBoxContextDestroy = Module['_TRN_BlackBoxContextDestroy'] = Module['asm']['pQ']).apply(null, arguments);
});
var _TRN_CADModuleIsModuleAvailable = (Module['_TRN_CADModuleIsModuleAvailable'] = function () {
  return (_TRN_CADModuleIsModuleAvailable = Module['_TRN_CADModuleIsModuleAvailable'] = Module['asm']['qQ']).apply(null, arguments);
});
var _TRN_CertificateStatusToString = (Module['_TRN_CertificateStatusToString'] = function () {
  return (_TRN_CertificateStatusToString = Module['_TRN_CertificateStatusToString'] = Module['asm']['rQ']).apply(null, arguments);
});
var _TRN_CertificateStatusDestroy = (Module['_TRN_CertificateStatusDestroy'] = function () {
  return (_TRN_CertificateStatusDestroy = Module['_TRN_CertificateStatusDestroy'] = Module['asm']['sQ']).apply(null, arguments);
});
var _TRN_ColorPtCreate = (Module['_TRN_ColorPtCreate'] = function () {
  return (_TRN_ColorPtCreate = Module['_TRN_ColorPtCreate'] = Module['asm']['tQ']).apply(null, arguments);
});
var _TRN_ColorPtDestroy2 = (Module['_TRN_ColorPtDestroy2'] = function () {
  return (_TRN_ColorPtDestroy2 = Module['_TRN_ColorPtDestroy2'] = Module['asm']['uQ']).apply(null, arguments);
});
var _TRN_ColorSpaceCreateICCFromFile = (Module['_TRN_ColorSpaceCreateICCFromFile'] = function () {
  return (_TRN_ColorSpaceCreateICCFromFile = Module['_TRN_ColorSpaceCreateICCFromFile'] = Module['asm']['vQ']).apply(null, arguments);
});
var _TRN_ColorSpaceAssign = (Module['_TRN_ColorSpaceAssign'] = function () {
  return (_TRN_ColorSpaceAssign = Module['_TRN_ColorSpaceAssign'] = Module['asm']['wQ']).apply(null, arguments);
});
var _TRN_ColorSpaceGetLookupTable = (Module['_TRN_ColorSpaceGetLookupTable'] = function () {
  return (_TRN_ColorSpaceGetLookupTable = Module['_TRN_ColorSpaceGetLookupTable'] = Module['asm']['xQ']).apply(null, arguments);
});
var _TRN_ConvertCreateBlackBoxContext = (Module['_TRN_ConvertCreateBlackBoxContext'] = function () {
  return (_TRN_ConvertCreateBlackBoxContext = Module['_TRN_ConvertCreateBlackBoxContext'] = Module['asm']['yQ']).apply(null, arguments);
});
var _TRN_ConvertFromXps = (Module['_TRN_ConvertFromXps'] = function () {
  return (_TRN_ConvertFromXps = Module['_TRN_ConvertFromXps'] = Module['asm']['zQ']).apply(null, arguments);
});
var _TRN_ConvertFromEmf = (Module['_TRN_ConvertFromEmf'] = function () {
  return (_TRN_ConvertFromEmf = Module['_TRN_ConvertFromEmf'] = Module['asm']['AQ']).apply(null, arguments);
});
var _TRN_ConvertPageToEmf = (Module['_TRN_ConvertPageToEmf'] = function () {
  return (_TRN_ConvertPageToEmf = Module['_TRN_ConvertPageToEmf'] = Module['asm']['BQ']).apply(null, arguments);
});
var _TRN_ConvertDocToEmf = (Module['_TRN_ConvertDocToEmf'] = function () {
  return (_TRN_ConvertDocToEmf = Module['_TRN_ConvertDocToEmf'] = Module['asm']['CQ']).apply(null, arguments);
});
var _TRN_ConvertPageToSvg = (Module['_TRN_ConvertPageToSvg'] = function () {
  return (_TRN_ConvertPageToSvg = Module['_TRN_ConvertPageToSvg'] = Module['asm']['DQ']).apply(null, arguments);
});
var _TRN_ConvertPageToSvgWithOptions = (Module['_TRN_ConvertPageToSvgWithOptions'] = function () {
  return (_TRN_ConvertPageToSvgWithOptions = Module['_TRN_ConvertPageToSvgWithOptions'] = Module['asm']['EQ']).apply(null, arguments);
});
var _TRN_ConvertDocToSvg = (Module['_TRN_ConvertDocToSvg'] = function () {
  return (_TRN_ConvertDocToSvg = Module['_TRN_ConvertDocToSvg'] = Module['asm']['FQ']).apply(null, arguments);
});
var _TRN_ConvertDocToSvgWithOptions = (Module['_TRN_ConvertDocToSvgWithOptions'] = function () {
  return (_TRN_ConvertDocToSvgWithOptions = Module['_TRN_ConvertDocToSvgWithOptions'] = Module['asm']['GQ']).apply(null, arguments);
});
var _TRN_ConvertFileToXodStream = (Module['_TRN_ConvertFileToXodStream'] = function () {
  return (_TRN_ConvertFileToXodStream = Module['_TRN_ConvertFileToXodStream'] = Module['asm']['HQ']).apply(null, arguments);
});
var _TRN_ConvertToXodWithMonitor = (Module['_TRN_ConvertToXodWithMonitor'] = function () {
  return (_TRN_ConvertToXodWithMonitor = Module['_TRN_ConvertToXodWithMonitor'] = Module['asm']['IQ']).apply(null, arguments);
});
var _TRN_ConvertWordToPdf = (Module['_TRN_ConvertWordToPdf'] = function () {
  return (_TRN_ConvertWordToPdf = Module['_TRN_ConvertWordToPdf'] = Module['asm']['JQ']).apply(null, arguments);
});
var _TRN_ConvertWordToPdfConversion = (Module['_TRN_ConvertWordToPdfConversion'] = function () {
  return (_TRN_ConvertWordToPdfConversion = Module['_TRN_ConvertWordToPdfConversion'] = Module['asm']['KQ']).apply(null, arguments);
});
var _TRN_ConvertWordToPdfWithFilter = (Module['_TRN_ConvertWordToPdfWithFilter'] = function () {
  return (_TRN_ConvertWordToPdfWithFilter = Module['_TRN_ConvertWordToPdfWithFilter'] = Module['asm']['LQ']).apply(null, arguments);
});
var _TRN_ConvertWordToPdfConversionWithFilter = (Module['_TRN_ConvertWordToPdfConversionWithFilter'] = function () {
  return (_TRN_ConvertWordToPdfConversionWithFilter = Module['_TRN_ConvertWordToPdfConversionWithFilter'] = Module['asm']['MQ']).apply(null, arguments);
});
var _TRN_ConvertOfficeToPdfWithPath = (Module['_TRN_ConvertOfficeToPdfWithPath'] = function () {
  return (_TRN_ConvertOfficeToPdfWithPath = Module['_TRN_ConvertOfficeToPdfWithPath'] = Module['asm']['NQ']).apply(null, arguments);
});
var _TRN_ConvertStreamingPdfConversionWithPdfAndPath = (Module['_TRN_ConvertStreamingPdfConversionWithPdfAndPath'] = function () {
  return (_TRN_ConvertStreamingPdfConversionWithPdfAndPath = Module['_TRN_ConvertStreamingPdfConversionWithPdfAndPath'] = Module['asm']['OQ']).apply(
    null,
    arguments,
  );
});
var _TRN_ConvertStreamingPdfConversionWithPdfAndFilter = (Module['_TRN_ConvertStreamingPdfConversionWithPdfAndFilter'] = function () {
  return (_TRN_ConvertStreamingPdfConversionWithPdfAndFilter = Module['_TRN_ConvertStreamingPdfConversionWithPdfAndFilter'] = Module['asm']['PQ']).apply(
    null,
    arguments,
  );
});
var _TRN_ConvertStreamingPdfConversionWithPath = (Module['_TRN_ConvertStreamingPdfConversionWithPath'] = function () {
  return (_TRN_ConvertStreamingPdfConversionWithPath = Module['_TRN_ConvertStreamingPdfConversionWithPath'] = Module['asm']['QQ']).apply(null, arguments);
});
var _TRN_ConvertStreamingPdfConversionWithFilter = (Module['_TRN_ConvertStreamingPdfConversionWithFilter'] = function () {
  return (_TRN_ConvertStreamingPdfConversionWithFilter = Module['_TRN_ConvertStreamingPdfConversionWithFilter'] = Module['asm']['RQ']).apply(null, arguments);
});
var _TRN_ConvertCreateOfficeTemplateWithPath = (Module['_TRN_ConvertCreateOfficeTemplateWithPath'] = function () {
  return (_TRN_ConvertCreateOfficeTemplateWithPath = Module['_TRN_ConvertCreateOfficeTemplateWithPath'] = Module['asm']['SQ']).apply(null, arguments);
});
var _TRN_ConvertCreateOfficeTemplateWithFilter = (Module['_TRN_ConvertCreateOfficeTemplateWithFilter'] = function () {
  return (_TRN_ConvertCreateOfficeTemplateWithFilter = Module['_TRN_ConvertCreateOfficeTemplateWithFilter'] = Module['asm']['TQ']).apply(null, arguments);
});
var _TRN_ConvertFromCAD = (Module['_TRN_ConvertFromCAD'] = function () {
  return (_TRN_ConvertFromCAD = Module['_TRN_ConvertFromCAD'] = Module['asm']['UQ']).apply(null, arguments);
});
var _TRN_ConvertFromDICOM = (Module['_TRN_ConvertFromDICOM'] = function () {
  return (_TRN_ConvertFromDICOM = Module['_TRN_ConvertFromDICOM'] = Module['asm']['VQ']).apply(null, arguments);
});
var _TRN_ConvertFromSVG = (Module['_TRN_ConvertFromSVG'] = function () {
  return (_TRN_ConvertFromSVG = Module['_TRN_ConvertFromSVG'] = Module['asm']['WQ']).apply(null, arguments);
});
var _TRN_ConvertRequiresPrinter = (Module['_TRN_ConvertRequiresPrinter'] = function () {
  return (_TRN_ConvertRequiresPrinter = Module['_TRN_ConvertRequiresPrinter'] = Module['asm']['XQ']).apply(null, arguments);
});
var _TRN_ConvertPrinterInstall = (Module['_TRN_ConvertPrinterInstall'] = function () {
  return (_TRN_ConvertPrinterInstall = Module['_TRN_ConvertPrinterInstall'] = Module['asm']['YQ']).apply(null, arguments);
});
var _TRN_ConvertPrinterUninstall = (Module['_TRN_ConvertPrinterUninstall'] = function () {
  return (_TRN_ConvertPrinterUninstall = Module['_TRN_ConvertPrinterUninstall'] = Module['asm']['ZQ']).apply(null, arguments);
});
var _TRN_ConvertPrinterGetPrinterName = (Module['_TRN_ConvertPrinterGetPrinterName'] = function () {
  return (_TRN_ConvertPrinterGetPrinterName = Module['_TRN_ConvertPrinterGetPrinterName'] = Module['asm']['_Q']).apply(null, arguments);
});
var _TRN_ConvertPrinterIsInstalled = (Module['_TRN_ConvertPrinterIsInstalled'] = function () {
  return (_TRN_ConvertPrinterIsInstalled = Module['_TRN_ConvertPrinterIsInstalled'] = Module['asm']['$Q']).apply(null, arguments);
});
var _TRN_ConvertPrinterSetPrinterName = (Module['_TRN_ConvertPrinterSetPrinterName'] = function () {
  return (_TRN_ConvertPrinterSetPrinterName = Module['_TRN_ConvertPrinterSetPrinterName'] = Module['asm']['aR']).apply(null, arguments);
});
var _TRN_ConvertPrinterSetMode = (Module['_TRN_ConvertPrinterSetMode'] = function () {
  return (_TRN_ConvertPrinterSetMode = Module['_TRN_ConvertPrinterSetMode'] = Module['asm']['bR']).apply(null, arguments);
});
var _TRN_ConvertPrinterGetMode = (Module['_TRN_ConvertPrinterGetMode'] = function () {
  return (_TRN_ConvertPrinterGetMode = Module['_TRN_ConvertPrinterGetMode'] = Module['asm']['cR']).apply(null, arguments);
});
var _TRN_ConvertFileToHtml = (Module['_TRN_ConvertFileToHtml'] = function () {
  return (_TRN_ConvertFileToHtml = Module['_TRN_ConvertFileToHtml'] = Module['asm']['dR']).apply(null, arguments);
});
var _TRN_ConvertToHtml = (Module['_TRN_ConvertToHtml'] = function () {
  return (_TRN_ConvertToHtml = Module['_TRN_ConvertToHtml'] = Module['asm']['eR']).apply(null, arguments);
});
var _TRN_ConvertFileToWord = (Module['_TRN_ConvertFileToWord'] = function () {
  return (_TRN_ConvertFileToWord = Module['_TRN_ConvertFileToWord'] = Module['asm']['fR']).apply(null, arguments);
});
var _TRN_ConvertToWord = (Module['_TRN_ConvertToWord'] = function () {
  return (_TRN_ConvertToWord = Module['_TRN_ConvertToWord'] = Module['asm']['gR']).apply(null, arguments);
});
var _TRN_ConvertFileToExcel = (Module['_TRN_ConvertFileToExcel'] = function () {
  return (_TRN_ConvertFileToExcel = Module['_TRN_ConvertFileToExcel'] = Module['asm']['hR']).apply(null, arguments);
});
var _TRN_ConvertToExcel = (Module['_TRN_ConvertToExcel'] = function () {
  return (_TRN_ConvertToExcel = Module['_TRN_ConvertToExcel'] = Module['asm']['iR']).apply(null, arguments);
});
var _TRN_ConvertFileToPowerPoint = (Module['_TRN_ConvertFileToPowerPoint'] = function () {
  return (_TRN_ConvertFileToPowerPoint = Module['_TRN_ConvertFileToPowerPoint'] = Module['asm']['jR']).apply(null, arguments);
});
var _TRN_ConvertToPowerPoint = (Module['_TRN_ConvertToPowerPoint'] = function () {
  return (_TRN_ConvertToPowerPoint = Module['_TRN_ConvertToPowerPoint'] = Module['asm']['kR']).apply(null, arguments);
});
var _TRN_ConvertFileToEpub = (Module['_TRN_ConvertFileToEpub'] = function () {
  return (_TRN_ConvertFileToEpub = Module['_TRN_ConvertFileToEpub'] = Module['asm']['lR']).apply(null, arguments);
});
var _TRN_ConvertToEpub = (Module['_TRN_ConvertToEpub'] = function () {
  return (_TRN_ConvertToEpub = Module['_TRN_ConvertToEpub'] = Module['asm']['mR']).apply(null, arguments);
});
var _TRN_CubicCurveBuilderNumSourcePoints = (Module['_TRN_CubicCurveBuilderNumSourcePoints'] = function () {
  return (_TRN_CubicCurveBuilderNumSourcePoints = Module['_TRN_CubicCurveBuilderNumSourcePoints'] = Module['asm']['nR']).apply(null, arguments);
});
var _TRN_CubicCurveBuilderAddSourcePoint = (Module['_TRN_CubicCurveBuilderAddSourcePoint'] = function () {
  return (_TRN_CubicCurveBuilderAddSourcePoint = Module['_TRN_CubicCurveBuilderAddSourcePoint'] = Module['asm']['oR']).apply(null, arguments);
});
var _TRN_CubicCurveBuilderNumCubicPoints = (Module['_TRN_CubicCurveBuilderNumCubicPoints'] = function () {
  return (_TRN_CubicCurveBuilderNumCubicPoints = Module['_TRN_CubicCurveBuilderNumCubicPoints'] = Module['asm']['pR']).apply(null, arguments);
});
var _TRN_CubicCurveBuilderGetCubicXCoord = (Module['_TRN_CubicCurveBuilderGetCubicXCoord'] = function () {
  return (_TRN_CubicCurveBuilderGetCubicXCoord = Module['_TRN_CubicCurveBuilderGetCubicXCoord'] = Module['asm']['qR']).apply(null, arguments);
});
var _TRN_CubicCurveBuilderGetCubicYCoord = (Module['_TRN_CubicCurveBuilderGetCubicYCoord'] = function () {
  return (_TRN_CubicCurveBuilderGetCubicYCoord = Module['_TRN_CubicCurveBuilderGetCubicYCoord'] = Module['asm']['rR']).apply(null, arguments);
});
var _TRN_CubicCurveBuilderDestroy = (Module['_TRN_CubicCurveBuilderDestroy'] = function () {
  return (_TRN_CubicCurveBuilderDestroy = Module['_TRN_CubicCurveBuilderDestroy'] = Module['asm']['sR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleIsModuleAvailable = (Module['_TRN_DataExtractionModuleIsModuleAvailable'] = function () {
  return (_TRN_DataExtractionModuleIsModuleAvailable = Module['_TRN_DataExtractionModuleIsModuleAvailable'] = Module['asm']['tR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleExtractDataAsStringWithOptsObj = (Module['_TRN_DataExtractionModuleExtractDataAsStringWithOptsObj'] = function () {
  return (_TRN_DataExtractionModuleExtractDataAsStringWithOptsObj = Module['_TRN_DataExtractionModuleExtractDataAsStringWithOptsObj'] =
    Module['asm']['uR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleExtractDataAsString = (Module['_TRN_DataExtractionModuleExtractDataAsString'] = function () {
  return (_TRN_DataExtractionModuleExtractDataAsString = Module['_TRN_DataExtractionModuleExtractDataAsString'] = Module['asm']['vR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleExtractDataWithOptsObj = (Module['_TRN_DataExtractionModuleExtractDataWithOptsObj'] = function () {
  return (_TRN_DataExtractionModuleExtractDataWithOptsObj = Module['_TRN_DataExtractionModuleExtractDataWithOptsObj'] = Module['asm']['wR']).apply(
    null,
    arguments,
  );
});
var _TRN_DataExtractionModuleExtractData = (Module['_TRN_DataExtractionModuleExtractData'] = function () {
  return (_TRN_DataExtractionModuleExtractData = Module['_TRN_DataExtractionModuleExtractData'] = Module['asm']['xR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleExtractToXLSXWithOptsObj = (Module['_TRN_DataExtractionModuleExtractToXLSXWithOptsObj'] = function () {
  return (_TRN_DataExtractionModuleExtractToXLSXWithOptsObj = Module['_TRN_DataExtractionModuleExtractToXLSXWithOptsObj'] = Module['asm']['yR']).apply(
    null,
    arguments,
  );
});
var _TRN_DataExtractionModuleExtractToXLSX = (Module['_TRN_DataExtractionModuleExtractToXLSX'] = function () {
  return (_TRN_DataExtractionModuleExtractToXLSX = Module['_TRN_DataExtractionModuleExtractToXLSX'] = Module['asm']['zR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleExtractToXLSXWithFilterAndOptsObj = (Module['_TRN_DataExtractionModuleExtractToXLSXWithFilterAndOptsObj'] = function () {
  return (_TRN_DataExtractionModuleExtractToXLSXWithFilterAndOptsObj = Module['_TRN_DataExtractionModuleExtractToXLSXWithFilterAndOptsObj'] =
    Module['asm']['AR']).apply(null, arguments);
});
var _TRN_DataExtractionModuleExtractToXLSXWithFilter = (Module['_TRN_DataExtractionModuleExtractToXLSXWithFilter'] = function () {
  return (_TRN_DataExtractionModuleExtractToXLSXWithFilter = Module['_TRN_DataExtractionModuleExtractToXLSXWithFilter'] = Module['asm']['BR']).apply(
    null,
    arguments,
  );
});
var _TRN_DateAssign = (Module['_TRN_DateAssign'] = function () {
  return (_TRN_DateAssign = Module['_TRN_DateAssign'] = Module['asm']['CR']).apply(null, arguments);
});
var _TRN_DateGetYear = (Module['_TRN_DateGetYear'] = function () {
  return (_TRN_DateGetYear = Module['_TRN_DateGetYear'] = Module['asm']['DR']).apply(null, arguments);
});
var _TRN_DateGetMonth = (Module['_TRN_DateGetMonth'] = function () {
  return (_TRN_DateGetMonth = Module['_TRN_DateGetMonth'] = Module['asm']['ER']).apply(null, arguments);
});
var _TRN_DateGetDay = (Module['_TRN_DateGetDay'] = function () {
  return (_TRN_DateGetDay = Module['_TRN_DateGetDay'] = Module['asm']['FR']).apply(null, arguments);
});
var _TRN_DateGetHour = (Module['_TRN_DateGetHour'] = function () {
  return (_TRN_DateGetHour = Module['_TRN_DateGetHour'] = Module['asm']['GR']).apply(null, arguments);
});
var _TRN_DateGetMinute = (Module['_TRN_DateGetMinute'] = function () {
  return (_TRN_DateGetMinute = Module['_TRN_DateGetMinute'] = Module['asm']['HR']).apply(null, arguments);
});
var _TRN_DateGetSecond = (Module['_TRN_DateGetSecond'] = function () {
  return (_TRN_DateGetSecond = Module['_TRN_DateGetSecond'] = Module['asm']['IR']).apply(null, arguments);
});
var _TRN_DateGetUT = (Module['_TRN_DateGetUT'] = function () {
  return (_TRN_DateGetUT = Module['_TRN_DateGetUT'] = Module['asm']['JR']).apply(null, arguments);
});
var _TRN_DateGetUTHour = (Module['_TRN_DateGetUTHour'] = function () {
  return (_TRN_DateGetUTHour = Module['_TRN_DateGetUTHour'] = Module['asm']['KR']).apply(null, arguments);
});
var _TRN_DateGetUTMin = (Module['_TRN_DateGetUTMin'] = function () {
  return (_TRN_DateGetUTMin = Module['_TRN_DateGetUTMin'] = Module['asm']['LR']).apply(null, arguments);
});
var _TRN_DigitalSignatureFieldSignDigestPath = (Module['_TRN_DigitalSignatureFieldSignDigestPath'] = function () {
  return (_TRN_DigitalSignatureFieldSignDigestPath = Module['_TRN_DigitalSignatureFieldSignDigestPath'] = Module['asm']['MR']).apply(null, arguments);
});
var _TRN_DocumentConversionTryConvert = (Module['_TRN_DocumentConversionTryConvert'] = function () {
  return (_TRN_DocumentConversionTryConvert = Module['_TRN_DocumentConversionTryConvert'] = Module['asm']['NR']).apply(null, arguments);
});
var _TRN_DocumentConversionConvert = (Module['_TRN_DocumentConversionConvert'] = function () {
  return (_TRN_DocumentConversionConvert = Module['_TRN_DocumentConversionConvert'] = Module['asm']['OR']).apply(null, arguments);
});
var _TRN_DocumentConversionConvertNextPage = (Module['_TRN_DocumentConversionConvertNextPage'] = function () {
  return (_TRN_DocumentConversionConvertNextPage = Module['_TRN_DocumentConversionConvertNextPage'] = Module['asm']['PR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetDoc = (Module['_TRN_DocumentConversionGetDoc'] = function () {
  return (_TRN_DocumentConversionGetDoc = Module['_TRN_DocumentConversionGetDoc'] = Module['asm']['QR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetConversionStatus = (Module['_TRN_DocumentConversionGetConversionStatus'] = function () {
  return (_TRN_DocumentConversionGetConversionStatus = Module['_TRN_DocumentConversionGetConversionStatus'] = Module['asm']['RR']).apply(null, arguments);
});
var _TRN_DocumentConversionCancelConversion = (Module['_TRN_DocumentConversionCancelConversion'] = function () {
  return (_TRN_DocumentConversionCancelConversion = Module['_TRN_DocumentConversionCancelConversion'] = Module['asm']['SR']).apply(null, arguments);
});
var _TRN_DocumentConversionIsCancelled = (Module['_TRN_DocumentConversionIsCancelled'] = function () {
  return (_TRN_DocumentConversionIsCancelled = Module['_TRN_DocumentConversionIsCancelled'] = Module['asm']['TR']).apply(null, arguments);
});
var _TRN_DocumentConversionHasProgressTracking = (Module['_TRN_DocumentConversionHasProgressTracking'] = function () {
  return (_TRN_DocumentConversionHasProgressTracking = Module['_TRN_DocumentConversionHasProgressTracking'] = Module['asm']['UR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetProgress = (Module['_TRN_DocumentConversionGetProgress'] = function () {
  return (_TRN_DocumentConversionGetProgress = Module['_TRN_DocumentConversionGetProgress'] = Module['asm']['VR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetProgressLabel = (Module['_TRN_DocumentConversionGetProgressLabel'] = function () {
  return (_TRN_DocumentConversionGetProgressLabel = Module['_TRN_DocumentConversionGetProgressLabel'] = Module['asm']['WR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetNumConvertedPages = (Module['_TRN_DocumentConversionGetNumConvertedPages'] = function () {
  return (_TRN_DocumentConversionGetNumConvertedPages = Module['_TRN_DocumentConversionGetNumConvertedPages'] = Module['asm']['XR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetErrorString = (Module['_TRN_DocumentConversionGetErrorString'] = function () {
  return (_TRN_DocumentConversionGetErrorString = Module['_TRN_DocumentConversionGetErrorString'] = Module['asm']['YR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetNumWarnings = (Module['_TRN_DocumentConversionGetNumWarnings'] = function () {
  return (_TRN_DocumentConversionGetNumWarnings = Module['_TRN_DocumentConversionGetNumWarnings'] = Module['asm']['ZR']).apply(null, arguments);
});
var _TRN_DocumentConversionGetWarningString = (Module['_TRN_DocumentConversionGetWarningString'] = function () {
  return (_TRN_DocumentConversionGetWarningString = Module['_TRN_DocumentConversionGetWarningString'] = Module['asm']['_R']).apply(null, arguments);
});
var _TRN_DocumentConversionDestroy = (Module['_TRN_DocumentConversionDestroy'] = function () {
  return (_TRN_DocumentConversionDestroy = Module['_TRN_DocumentConversionDestroy'] = Module['asm']['$R']).apply(null, arguments);
});
var _TRN_DocumentConversionCopyCtor = (Module['_TRN_DocumentConversionCopyCtor'] = function () {
  return (_TRN_DocumentConversionCopyCtor = Module['_TRN_DocumentConversionCopyCtor'] = Module['asm']['aS']).apply(null, arguments);
});
var _TRN_DocumentConversionAssign = (Module['_TRN_DocumentConversionAssign'] = function () {
  return (_TRN_DocumentConversionAssign = Module['_TRN_DocumentConversionAssign'] = Module['asm']['bS']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateTextRunWithSize = (Module['_TRN_ElementBuilderCreateTextRunWithSize'] = function () {
  return (_TRN_ElementBuilderCreateTextRunWithSize = Module['_TRN_ElementBuilderCreateTextRunWithSize'] = Module['asm']['cS']).apply(null, arguments);
});
var _TRN_ElementBuilderCreateNewTextRunWithSize = (Module['_TRN_ElementBuilderCreateNewTextRunWithSize'] = function () {
  return (_TRN_ElementBuilderCreateNewTextRunWithSize = Module['_TRN_ElementBuilderCreateNewTextRunWithSize'] = Module['asm']['dS']).apply(null, arguments);
});
var _TRN_EmbeddedTimestampVerificationResultCopyCtor = (Module['_TRN_EmbeddedTimestampVerificationResultCopyCtor'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultCopyCtor = Module['_TRN_EmbeddedTimestampVerificationResultCopyCtor'] = Module['asm']['eS']).apply(
    null,
    arguments,
  );
});
var _TRN_EmbeddedTimestampVerificationResultAssign = (Module['_TRN_EmbeddedTimestampVerificationResultAssign'] = function () {
  return (_TRN_EmbeddedTimestampVerificationResultAssign = Module['_TRN_EmbeddedTimestampVerificationResultAssign'] = Module['asm']['fS']).apply(
    null,
    arguments,
  );
});
var _TRN_ExternalAnnotManagerMergeXFDF = (Module['_TRN_ExternalAnnotManagerMergeXFDF'] = function () {
  return (_TRN_ExternalAnnotManagerMergeXFDF = Module['_TRN_ExternalAnnotManagerMergeXFDF'] = Module['asm']['gS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerUndo = (Module['_TRN_ExternalAnnotManagerUndo'] = function () {
  return (_TRN_ExternalAnnotManagerUndo = Module['_TRN_ExternalAnnotManagerUndo'] = Module['asm']['hS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerGetLastXFDF = (Module['_TRN_ExternalAnnotManagerGetLastXFDF'] = function () {
  return (_TRN_ExternalAnnotManagerGetLastXFDF = Module['_TRN_ExternalAnnotManagerGetLastXFDF'] = Module['asm']['iS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerGetLastJSON = (Module['_TRN_ExternalAnnotManagerGetLastJSON'] = function () {
  return (_TRN_ExternalAnnotManagerGetLastJSON = Module['_TRN_ExternalAnnotManagerGetLastJSON'] = Module['asm']['jS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerRedo = (Module['_TRN_ExternalAnnotManagerRedo'] = function () {
  return (_TRN_ExternalAnnotManagerRedo = Module['_TRN_ExternalAnnotManagerRedo'] = Module['asm']['kS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerGetNextRedoInfo = (Module['_TRN_ExternalAnnotManagerGetNextRedoInfo'] = function () {
  return (_TRN_ExternalAnnotManagerGetNextRedoInfo = Module['_TRN_ExternalAnnotManagerGetNextRedoInfo'] = Module['asm']['lS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerGetNextUndoInfo = (Module['_TRN_ExternalAnnotManagerGetNextUndoInfo'] = function () {
  return (_TRN_ExternalAnnotManagerGetNextUndoInfo = Module['_TRN_ExternalAnnotManagerGetNextUndoInfo'] = Module['asm']['mS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerTakeSnapshot = (Module['_TRN_ExternalAnnotManagerTakeSnapshot'] = function () {
  return (_TRN_ExternalAnnotManagerTakeSnapshot = Module['_TRN_ExternalAnnotManagerTakeSnapshot'] = Module['asm']['nS']).apply(null, arguments);
});
var _TRN_ExternalAnnotManagerDestroy = (Module['_TRN_ExternalAnnotManagerDestroy'] = function () {
  return (_TRN_ExternalAnnotManagerDestroy = Module['_TRN_ExternalAnnotManagerDestroy'] = Module['asm']['oS']).apply(null, arguments);
});
var _TRN_FieldAssign = (Module['_TRN_FieldAssign'] = function () {
  return (_TRN_FieldAssign = Module['_TRN_FieldAssign'] = Module['asm']['pS']).apply(null, arguments);
});
var _TRN_FieldDestroy = (Module['_TRN_FieldDestroy'] = function () {
  return (_TRN_FieldDestroy = Module['_TRN_FieldDestroy'] = Module['asm']['qS']).apply(null, arguments);
});
var _TRN_FontAssign = (Module['_TRN_FontAssign'] = function () {
  return (_TRN_FontAssign = Module['_TRN_FontAssign'] = Module['asm']['rS']).apply(null, arguments);
});
var _TRN_FontGetGlyphPath = (Module['_TRN_FontGetGlyphPath'] = function () {
  return (_TRN_FontGetGlyphPath = Module['_TRN_FontGetGlyphPath'] = Module['asm']['sS']).apply(null, arguments);
});
var _TRN_FontMapToUnicode = (Module['_TRN_FontMapToUnicode'] = function () {
  return (_TRN_FontMapToUnicode = Module['_TRN_FontMapToUnicode'] = Module['asm']['tS']).apply(null, arguments);
});
var _TRN_FontGetEncoding = (Module['_TRN_FontGetEncoding'] = function () {
  return (_TRN_FontGetEncoding = Module['_TRN_FontGetEncoding'] = Module['asm']['uS']).apply(null, arguments);
});
var _TRN_FontMapToCID2 = (Module['_TRN_FontMapToCID2'] = function () {
  return (_TRN_FontMapToCID2 = Module['_TRN_FontMapToCID2'] = Module['asm']['vS']).apply(null, arguments);
});
var _TRN_FunctionAssign = (Module['_TRN_FunctionAssign'] = function () {
  return (_TRN_FunctionAssign = Module['_TRN_FunctionAssign'] = Module['asm']['wS']).apply(null, arguments);
});
var _TRN_FunctionEval = (Module['_TRN_FunctionEval'] = function () {
  return (_TRN_FunctionEval = Module['_TRN_FunctionEval'] = Module['asm']['xS']).apply(null, arguments);
});
var _TRN_GStateGetDashes = (Module['_TRN_GStateGetDashes'] = function () {
  return (_TRN_GStateGetDashes = Module['_TRN_GStateGetDashes'] = Module['asm']['yS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsCreate = (Module['_TRN_HTML2PDF_WebPageSettingsCreate'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsCreate = Module['_TRN_HTML2PDF_WebPageSettingsCreate'] = Module['asm']['zS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsDestroy = (Module['_TRN_HTML2PDF_WebPageSettingsDestroy'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsDestroy = Module['_TRN_HTML2PDF_WebPageSettingsDestroy'] = Module['asm']['AS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetPrintBackground = (Module['_TRN_HTML2PDF_WebPageSettingsSetPrintBackground'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetPrintBackground = Module['_TRN_HTML2PDF_WebPageSettingsSetPrintBackground'] = Module['asm']['BS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetLoadImages = (Module['_TRN_HTML2PDF_WebPageSettingsSetLoadImages'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetLoadImages = Module['_TRN_HTML2PDF_WebPageSettingsSetLoadImages'] = Module['asm']['CS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetAllowJavaScript = (Module['_TRN_HTML2PDF_WebPageSettingsSetAllowJavaScript'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetAllowJavaScript = Module['_TRN_HTML2PDF_WebPageSettingsSetAllowJavaScript'] = Module['asm']['DS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetSmartShrinking = (Module['_TRN_HTML2PDF_WebPageSettingsSetSmartShrinking'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetSmartShrinking = Module['_TRN_HTML2PDF_WebPageSettingsSetSmartShrinking'] = Module['asm']['ES']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetMinimumFontSize = (Module['_TRN_HTML2PDF_WebPageSettingsSetMinimumFontSize'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetMinimumFontSize = Module['_TRN_HTML2PDF_WebPageSettingsSetMinimumFontSize'] = Module['asm']['FS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetDefaultEncoding = (Module['_TRN_HTML2PDF_WebPageSettingsSetDefaultEncoding'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetDefaultEncoding = Module['_TRN_HTML2PDF_WebPageSettingsSetDefaultEncoding'] = Module['asm']['GS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetUserStyleSheet = (Module['_TRN_HTML2PDF_WebPageSettingsSetUserStyleSheet'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetUserStyleSheet = Module['_TRN_HTML2PDF_WebPageSettingsSetUserStyleSheet'] = Module['asm']['HS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetAllowPlugins = (Module['_TRN_HTML2PDF_WebPageSettingsSetAllowPlugins'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetAllowPlugins = Module['_TRN_HTML2PDF_WebPageSettingsSetAllowPlugins'] = Module['asm']['IS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetPrintMediaType = (Module['_TRN_HTML2PDF_WebPageSettingsSetPrintMediaType'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetPrintMediaType = Module['_TRN_HTML2PDF_WebPageSettingsSetPrintMediaType'] = Module['asm']['JS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetIncludeInOutline = (Module['_TRN_HTML2PDF_WebPageSettingsSetIncludeInOutline'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetIncludeInOutline = Module['_TRN_HTML2PDF_WebPageSettingsSetIncludeInOutline'] = Module['asm']['KS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetUsername = (Module['_TRN_HTML2PDF_WebPageSettingsSetUsername'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetUsername = Module['_TRN_HTML2PDF_WebPageSettingsSetUsername'] = Module['asm']['LS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetPassword = (Module['_TRN_HTML2PDF_WebPageSettingsSetPassword'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetPassword = Module['_TRN_HTML2PDF_WebPageSettingsSetPassword'] = Module['asm']['MS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetJavaScriptDelay = (Module['_TRN_HTML2PDF_WebPageSettingsSetJavaScriptDelay'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetJavaScriptDelay = Module['_TRN_HTML2PDF_WebPageSettingsSetJavaScriptDelay'] = Module['asm']['NS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetTimeout = (Module['_TRN_HTML2PDF_WebPageSettingsSetTimeout'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetTimeout = Module['_TRN_HTML2PDF_WebPageSettingsSetTimeout'] = Module['asm']['OS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetZoom = (Module['_TRN_HTML2PDF_WebPageSettingsSetZoom'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetZoom = Module['_TRN_HTML2PDF_WebPageSettingsSetZoom'] = Module['asm']['PS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetBlockLocalFileAccess = (Module['_TRN_HTML2PDF_WebPageSettingsSetBlockLocalFileAccess'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetBlockLocalFileAccess = Module['_TRN_HTML2PDF_WebPageSettingsSetBlockLocalFileAccess'] = Module['asm']['QS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetStopSlowScripts = (Module['_TRN_HTML2PDF_WebPageSettingsSetStopSlowScripts'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetStopSlowScripts = Module['_TRN_HTML2PDF_WebPageSettingsSetStopSlowScripts'] = Module['asm']['RS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetDebugJavaScriptOutput = (Module['_TRN_HTML2PDF_WebPageSettingsSetDebugJavaScriptOutput'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetDebugJavaScriptOutput = Module['_TRN_HTML2PDF_WebPageSettingsSetDebugJavaScriptOutput'] = Module['asm']['SS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetLoadErrorHandling = (Module['_TRN_HTML2PDF_WebPageSettingsSetLoadErrorHandling'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetLoadErrorHandling = Module['_TRN_HTML2PDF_WebPageSettingsSetLoadErrorHandling'] = Module['asm']['TS']).apply(
    null,
    arguments,
  );
});
var _TRN_HTML2PDF_WebPageSettingsSetExternalLinks = (Module['_TRN_HTML2PDF_WebPageSettingsSetExternalLinks'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetExternalLinks = Module['_TRN_HTML2PDF_WebPageSettingsSetExternalLinks'] = Module['asm']['US']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetInternalLinks = (Module['_TRN_HTML2PDF_WebPageSettingsSetInternalLinks'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetInternalLinks = Module['_TRN_HTML2PDF_WebPageSettingsSetInternalLinks'] = Module['asm']['VS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetProduceForms = (Module['_TRN_HTML2PDF_WebPageSettingsSetProduceForms'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetProduceForms = Module['_TRN_HTML2PDF_WebPageSettingsSetProduceForms'] = Module['asm']['WS']).apply(null, arguments);
});
var _TRN_HTML2PDF_WebPageSettingsSetProxy = (Module['_TRN_HTML2PDF_WebPageSettingsSetProxy'] = function () {
  return (_TRN_HTML2PDF_WebPageSettingsSetProxy = Module['_TRN_HTML2PDF_WebPageSettingsSetProxy'] = Module['asm']['XS']).apply(null, arguments);
});
var _TRN_HTML2PDFStaticConvert = (Module['_TRN_HTML2PDFStaticConvert'] = function () {
  return (_TRN_HTML2PDFStaticConvert = Module['_TRN_HTML2PDFStaticConvert'] = Module['asm']['YS']).apply(null, arguments);
});
var _TRN_HTML2PDFStaticConvert2 = (Module['_TRN_HTML2PDFStaticConvert2'] = function () {
  return (_TRN_HTML2PDFStaticConvert2 = Module['_TRN_HTML2PDFStaticConvert2'] = Module['asm']['ZS']).apply(null, arguments);
});
var _TRN_HTML2PDFInsertFromUrl = (Module['_TRN_HTML2PDFInsertFromUrl'] = function () {
  return (_TRN_HTML2PDFInsertFromUrl = Module['_TRN_HTML2PDFInsertFromUrl'] = Module['asm']['_S']).apply(null, arguments);
});
var _TRN_HTML2PDFInsertFromUrl2 = (Module['_TRN_HTML2PDFInsertFromUrl2'] = function () {
  return (_TRN_HTML2PDFInsertFromUrl2 = Module['_TRN_HTML2PDFInsertFromUrl2'] = Module['asm']['$S']).apply(null, arguments);
});
var _TRN_HTML2PDFInsertFromHtmlString = (Module['_TRN_HTML2PDFInsertFromHtmlString'] = function () {
  return (_TRN_HTML2PDFInsertFromHtmlString = Module['_TRN_HTML2PDFInsertFromHtmlString'] = Module['asm']['aT']).apply(null, arguments);
});
var _TRN_HTML2PDFInsertFromHtmlString2 = (Module['_TRN_HTML2PDFInsertFromHtmlString2'] = function () {
  return (_TRN_HTML2PDFInsertFromHtmlString2 = Module['_TRN_HTML2PDFInsertFromHtmlString2'] = Module['asm']['bT']).apply(null, arguments);
});
var _TRN_HTML2PDFInsertTOC = (Module['_TRN_HTML2PDFInsertTOC'] = function () {
  return (_TRN_HTML2PDFInsertTOC = Module['_TRN_HTML2PDFInsertTOC'] = Module['asm']['cT']).apply(null, arguments);
});
var _TRN_HTML2PDFInsertTOC2 = (Module['_TRN_HTML2PDFInsertTOC2'] = function () {
  return (_TRN_HTML2PDFInsertTOC2 = Module['_TRN_HTML2PDFInsertTOC2'] = Module['asm']['dT']).apply(null, arguments);
});
var _TRN_HTML2PDFConvert = (Module['_TRN_HTML2PDFConvert'] = function () {
  return (_TRN_HTML2PDFConvert = Module['_TRN_HTML2PDFConvert'] = Module['asm']['eT']).apply(null, arguments);
});
var _TRN_HTML2PDFGetHttpErrorCode = (Module['_TRN_HTML2PDFGetHttpErrorCode'] = function () {
  return (_TRN_HTML2PDFGetHttpErrorCode = Module['_TRN_HTML2PDFGetHttpErrorCode'] = Module['asm']['fT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetPaperSize = (Module['_TRN_HTML2PDFSetPaperSize'] = function () {
  return (_TRN_HTML2PDFSetPaperSize = Module['_TRN_HTML2PDFSetPaperSize'] = Module['asm']['gT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetPaperSize2 = (Module['_TRN_HTML2PDFSetPaperSize2'] = function () {
  return (_TRN_HTML2PDFSetPaperSize2 = Module['_TRN_HTML2PDFSetPaperSize2'] = Module['asm']['hT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetLandscape = (Module['_TRN_HTML2PDFSetLandscape'] = function () {
  return (_TRN_HTML2PDFSetLandscape = Module['_TRN_HTML2PDFSetLandscape'] = Module['asm']['iT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetDPI = (Module['_TRN_HTML2PDFSetDPI'] = function () {
  return (_TRN_HTML2PDFSetDPI = Module['_TRN_HTML2PDFSetDPI'] = Module['asm']['jT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetOutline = (Module['_TRN_HTML2PDFSetOutline'] = function () {
  return (_TRN_HTML2PDFSetOutline = Module['_TRN_HTML2PDFSetOutline'] = Module['asm']['kT']).apply(null, arguments);
});
var _TRN_HTML2PDFDumpOutline = (Module['_TRN_HTML2PDFDumpOutline'] = function () {
  return (_TRN_HTML2PDFDumpOutline = Module['_TRN_HTML2PDFDumpOutline'] = Module['asm']['lT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetPDFCompression = (Module['_TRN_HTML2PDFSetPDFCompression'] = function () {
  return (_TRN_HTML2PDFSetPDFCompression = Module['_TRN_HTML2PDFSetPDFCompression'] = Module['asm']['mT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetMargins = (Module['_TRN_HTML2PDFSetMargins'] = function () {
  return (_TRN_HTML2PDFSetMargins = Module['_TRN_HTML2PDFSetMargins'] = Module['asm']['nT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetHeader = (Module['_TRN_HTML2PDFSetHeader'] = function () {
  return (_TRN_HTML2PDFSetHeader = Module['_TRN_HTML2PDFSetHeader'] = Module['asm']['oT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetFooter = (Module['_TRN_HTML2PDFSetFooter'] = function () {
  return (_TRN_HTML2PDFSetFooter = Module['_TRN_HTML2PDFSetFooter'] = Module['asm']['pT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetImageDPI = (Module['_TRN_HTML2PDFSetImageDPI'] = function () {
  return (_TRN_HTML2PDFSetImageDPI = Module['_TRN_HTML2PDFSetImageDPI'] = Module['asm']['qT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetImageQuality = (Module['_TRN_HTML2PDFSetImageQuality'] = function () {
  return (_TRN_HTML2PDFSetImageQuality = Module['_TRN_HTML2PDFSetImageQuality'] = Module['asm']['rT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetCookieJar = (Module['_TRN_HTML2PDFSetCookieJar'] = function () {
  return (_TRN_HTML2PDFSetCookieJar = Module['_TRN_HTML2PDFSetCookieJar'] = Module['asm']['sT']).apply(null, arguments);
});
var _TRN_HTML2PDFAddCookie = (Module['_TRN_HTML2PDFAddCookie'] = function () {
  return (_TRN_HTML2PDFAddCookie = Module['_TRN_HTML2PDFAddCookie'] = Module['asm']['tT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetModulePath = (Module['_TRN_HTML2PDFSetModulePath'] = function () {
  return (_TRN_HTML2PDFSetModulePath = Module['_TRN_HTML2PDFSetModulePath'] = Module['asm']['uT']).apply(null, arguments);
});
var _TRN_HTML2PDFIsModuleAvailable = (Module['_TRN_HTML2PDFIsModuleAvailable'] = function () {
  return (_TRN_HTML2PDFIsModuleAvailable = Module['_TRN_HTML2PDFIsModuleAvailable'] = Module['asm']['vT']).apply(null, arguments);
});
var _TRN_HTML2PDFSetQuiet = (Module['_TRN_HTML2PDFSetQuiet'] = function () {
  return (_TRN_HTML2PDFSetQuiet = Module['_TRN_HTML2PDFSetQuiet'] = Module['asm']['wT']).apply(null, arguments);
});
var _TRN_HTML2PDFGetLog = (Module['_TRN_HTML2PDFGetLog'] = function () {
  return (_TRN_HTML2PDFGetLog = Module['_TRN_HTML2PDFGetLog'] = Module['asm']['xT']).apply(null, arguments);
});
var _TRN_HTML2PDFCreate = (Module['_TRN_HTML2PDFCreate'] = function () {
  return (_TRN_HTML2PDFCreate = Module['_TRN_HTML2PDFCreate'] = Module['asm']['yT']).apply(null, arguments);
});
var _TRN_HTML2PDFDestroy = (Module['_TRN_HTML2PDFDestroy'] = function () {
  return (_TRN_HTML2PDFDestroy = Module['_TRN_HTML2PDFDestroy'] = Module['asm']['zT']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxyCreate = (Module['_TRN_HTML2PDF_ProxyCreate'] = function () {
  return (_TRN_HTML2PDF_ProxyCreate = Module['_TRN_HTML2PDF_ProxyCreate'] = Module['asm']['AT']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxyDestroy = (Module['_TRN_HTML2PDF_ProxyDestroy'] = function () {
  return (_TRN_HTML2PDF_ProxyDestroy = Module['_TRN_HTML2PDF_ProxyDestroy'] = Module['asm']['BT']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxySetType = (Module['_TRN_HTML2PDF_ProxySetType'] = function () {
  return (_TRN_HTML2PDF_ProxySetType = Module['_TRN_HTML2PDF_ProxySetType'] = Module['asm']['CT']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxySetPort = (Module['_TRN_HTML2PDF_ProxySetPort'] = function () {
  return (_TRN_HTML2PDF_ProxySetPort = Module['_TRN_HTML2PDF_ProxySetPort'] = Module['asm']['DT']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxySetHost = (Module['_TRN_HTML2PDF_ProxySetHost'] = function () {
  return (_TRN_HTML2PDF_ProxySetHost = Module['_TRN_HTML2PDF_ProxySetHost'] = Module['asm']['ET']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxySetUsername = (Module['_TRN_HTML2PDF_ProxySetUsername'] = function () {
  return (_TRN_HTML2PDF_ProxySetUsername = Module['_TRN_HTML2PDF_ProxySetUsername'] = Module['asm']['FT']).apply(null, arguments);
});
var _TRN_HTML2PDF_ProxySetPassword = (Module['_TRN_HTML2PDF_ProxySetPassword'] = function () {
  return (_TRN_HTML2PDF_ProxySetPassword = Module['_TRN_HTML2PDF_ProxySetPassword'] = Module['asm']['GT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsCreate = (Module['_TRN_HTML2PDF_TOCSettingsCreate'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsCreate = Module['_TRN_HTML2PDF_TOCSettingsCreate'] = Module['asm']['HT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsDestroy = (Module['_TRN_HTML2PDF_TOCSettingsDestroy'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsDestroy = Module['_TRN_HTML2PDF_TOCSettingsDestroy'] = Module['asm']['IT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsSetDottedLines = (Module['_TRN_HTML2PDF_TOCSettingsSetDottedLines'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsSetDottedLines = Module['_TRN_HTML2PDF_TOCSettingsSetDottedLines'] = Module['asm']['JT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsSetLinks = (Module['_TRN_HTML2PDF_TOCSettingsSetLinks'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsSetLinks = Module['_TRN_HTML2PDF_TOCSettingsSetLinks'] = Module['asm']['KT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsSetCaptionText = (Module['_TRN_HTML2PDF_TOCSettingsSetCaptionText'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsSetCaptionText = Module['_TRN_HTML2PDF_TOCSettingsSetCaptionText'] = Module['asm']['LT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsSetLevelIndentation = (Module['_TRN_HTML2PDF_TOCSettingsSetLevelIndentation'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsSetLevelIndentation = Module['_TRN_HTML2PDF_TOCSettingsSetLevelIndentation'] = Module['asm']['MT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsSetTextSizeShrink = (Module['_TRN_HTML2PDF_TOCSettingsSetTextSizeShrink'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsSetTextSizeShrink = Module['_TRN_HTML2PDF_TOCSettingsSetTextSizeShrink'] = Module['asm']['NT']).apply(null, arguments);
});
var _TRN_HTML2PDF_TOCSettingsSetXsl = (Module['_TRN_HTML2PDF_TOCSettingsSetXsl'] = function () {
  return (_TRN_HTML2PDF_TOCSettingsSetXsl = Module['_TRN_HTML2PDF_TOCSettingsSetXsl'] = Module['asm']['OT']).apply(null, arguments);
});
var _TRN_HighlightsAssign = (Module['_TRN_HighlightsAssign'] = function () {
  return (_TRN_HighlightsAssign = Module['_TRN_HighlightsAssign'] = Module['asm']['PT']).apply(null, arguments);
});
var _TRN_HighlightsLoad = (Module['_TRN_HighlightsLoad'] = function () {
  return (_TRN_HighlightsLoad = Module['_TRN_HighlightsLoad'] = Module['asm']['QT']).apply(null, arguments);
});
var _TRN_HighlightsSave = (Module['_TRN_HighlightsSave'] = function () {
  return (_TRN_HighlightsSave = Module['_TRN_HighlightsSave'] = Module['asm']['RT']).apply(null, arguments);
});
var _TRN_TextRangeCreate = (Module['_TRN_TextRangeCreate'] = function () {
  return (_TRN_TextRangeCreate = Module['_TRN_TextRangeCreate'] = Module['asm']['ST']).apply(null, arguments);
});
var _TRN_ImageCreateFromFile = (Module['_TRN_ImageCreateFromFile'] = function () {
  return (_TRN_ImageCreateFromFile = Module['_TRN_ImageCreateFromFile'] = Module['asm']['TT']).apply(null, arguments);
});
var _TRN_ImageExport = (Module['_TRN_ImageExport'] = function () {
  return (_TRN_ImageExport = Module['_TRN_ImageExport'] = Module['asm']['UT']).apply(null, arguments);
});
var _TRN_ImageExportAsTiff = (Module['_TRN_ImageExportAsTiff'] = function () {
  return (_TRN_ImageExportAsTiff = Module['_TRN_ImageExportAsTiff'] = Module['asm']['VT']).apply(null, arguments);
});
var _TRN_ImageExportAsPng = (Module['_TRN_ImageExportAsPng'] = function () {
  return (_TRN_ImageExportAsPng = Module['_TRN_ImageExportAsPng'] = Module['asm']['WT']).apply(null, arguments);
});
var _TRN_OCRModuleIsModuleAvailable = (Module['_TRN_OCRModuleIsModuleAvailable'] = function () {
  return (_TRN_OCRModuleIsModuleAvailable = Module['_TRN_OCRModuleIsModuleAvailable'] = Module['asm']['XT']).apply(null, arguments);
});
var _TRN_OCRModuleIsIRISModuleAvailable = (Module['_TRN_OCRModuleIsIRISModuleAvailable'] = function () {
  return (_TRN_OCRModuleIsIRISModuleAvailable = Module['_TRN_OCRModuleIsIRISModuleAvailable'] = Module['asm']['YT']).apply(null, arguments);
});
var _TRN_OCRModuleImageToPDF = (Module['_TRN_OCRModuleImageToPDF'] = function () {
  return (_TRN_OCRModuleImageToPDF = Module['_TRN_OCRModuleImageToPDF'] = Module['asm']['ZT']).apply(null, arguments);
});
var _TRN_OCRModuleProcessPDF = (Module['_TRN_OCRModuleProcessPDF'] = function () {
  return (_TRN_OCRModuleProcessPDF = Module['_TRN_OCRModuleProcessPDF'] = Module['asm']['_T']).apply(null, arguments);
});
var _TRN_OCRModuleGetOCRJsonFromImage = (Module['_TRN_OCRModuleGetOCRJsonFromImage'] = function () {
  return (_TRN_OCRModuleGetOCRJsonFromImage = Module['_TRN_OCRModuleGetOCRJsonFromImage'] = Module['asm']['$T']).apply(null, arguments);
});
var _TRN_OCRModuleGetOCRJsonFromPDF = (Module['_TRN_OCRModuleGetOCRJsonFromPDF'] = function () {
  return (_TRN_OCRModuleGetOCRJsonFromPDF = Module['_TRN_OCRModuleGetOCRJsonFromPDF'] = Module['asm']['aU']).apply(null, arguments);
});
var _TRN_OCRModuleGetOCRXmlFromImage = (Module['_TRN_OCRModuleGetOCRXmlFromImage'] = function () {
  return (_TRN_OCRModuleGetOCRXmlFromImage = Module['_TRN_OCRModuleGetOCRXmlFromImage'] = Module['asm']['bU']).apply(null, arguments);
});
var _TRN_OCRModuleGetOCRXmlFromPDF = (Module['_TRN_OCRModuleGetOCRXmlFromPDF'] = function () {
  return (_TRN_OCRModuleGetOCRXmlFromPDF = Module['_TRN_OCRModuleGetOCRXmlFromPDF'] = Module['asm']['cU']).apply(null, arguments);
});
var _TRN_OptimizerImageSettingsInit = (Module['_TRN_OptimizerImageSettingsInit'] = function () {
  return (_TRN_OptimizerImageSettingsInit = Module['_TRN_OptimizerImageSettingsInit'] = Module['asm']['dU']).apply(null, arguments);
});
var _TRN_OptimizerMonoImageSettingsInit = (Module['_TRN_OptimizerMonoImageSettingsInit'] = function () {
  return (_TRN_OptimizerMonoImageSettingsInit = Module['_TRN_OptimizerMonoImageSettingsInit'] = Module['asm']['eU']).apply(null, arguments);
});
var _TRN_OptimizerTextSettingsInit = (Module['_TRN_OptimizerTextSettingsInit'] = function () {
  return (_TRN_OptimizerTextSettingsInit = Module['_TRN_OptimizerTextSettingsInit'] = Module['asm']['fU']).apply(null, arguments);
});
var _TRN_PDF2HtmlReflowParagraphsModuleIsModuleAvailable = (Module['_TRN_PDF2HtmlReflowParagraphsModuleIsModuleAvailable'] = function () {
  return (_TRN_PDF2HtmlReflowParagraphsModuleIsModuleAvailable = Module['_TRN_PDF2HtmlReflowParagraphsModuleIsModuleAvailable'] = Module['asm']['gU']).apply(
    null,
    arguments,
  );
});
var _TRN_PDF2WordModuleIsModuleAvailable = (Module['_TRN_PDF2WordModuleIsModuleAvailable'] = function () {
  return (_TRN_PDF2WordModuleIsModuleAvailable = Module['_TRN_PDF2WordModuleIsModuleAvailable'] = Module['asm']['hU']).apply(null, arguments);
});
var _TRN_PDFDocCreateFromSDFDoc = (Module['_TRN_PDFDocCreateFromSDFDoc'] = function () {
  return (_TRN_PDFDocCreateFromSDFDoc = Module['_TRN_PDFDocCreateFromSDFDoc'] = Module['asm']['iU']).apply(null, arguments);
});
var _TRN_PDFDocCreateFromUFilePath = (Module['_TRN_PDFDocCreateFromUFilePath'] = function () {
  return (_TRN_PDFDocCreateFromUFilePath = Module['_TRN_PDFDocCreateFromUFilePath'] = Module['asm']['jU']).apply(null, arguments);
});
var _TRN_PDFDocCreateFromFilePath = (Module['_TRN_PDFDocCreateFromFilePath'] = function () {
  return (_TRN_PDFDocCreateFromFilePath = Module['_TRN_PDFDocCreateFromFilePath'] = Module['asm']['kU']).apply(null, arguments);
});
var _TRN_PDFDocInitStdSecurityHandler = (Module['_TRN_PDFDocInitStdSecurityHandler'] = function () {
  return (_TRN_PDFDocInitStdSecurityHandler = Module['_TRN_PDFDocInitStdSecurityHandler'] = Module['asm']['lU']).apply(null, arguments);
});
var _TRN_PDFDocSave = (Module['_TRN_PDFDocSave'] = function () {
  return (_TRN_PDFDocSave = Module['_TRN_PDFDocSave'] = Module['asm']['mU']).apply(null, arguments);
});
var _TRN_PDFDocSaveCustomSignature = (Module['_TRN_PDFDocSaveCustomSignature'] = function () {
  return (_TRN_PDFDocSaveCustomSignature = Module['_TRN_PDFDocSaveCustomSignature'] = Module['asm']['nU']).apply(null, arguments);
});
var _TRN_PDFDocSaveCustomSignatureStream = (Module['_TRN_PDFDocSaveCustomSignatureStream'] = function () {
  return (_TRN_PDFDocSaveCustomSignatureStream = Module['_TRN_PDFDocSaveCustomSignatureStream'] = Module['asm']['oU']).apply(null, arguments);
});
var _TRN_PDFDocPageRemove2 = (Module['_TRN_PDFDocPageRemove2'] = function () {
  return (_TRN_PDFDocPageRemove2 = Module['_TRN_PDFDocPageRemove2'] = Module['asm']['pU']).apply(null, arguments);
});
var _TRN_PDFDocInsertPageSet2 = (Module['_TRN_PDFDocInsertPageSet2'] = function () {
  return (_TRN_PDFDocInsertPageSet2 = Module['_TRN_PDFDocInsertPageSet2'] = Module['asm']['qU']).apply(null, arguments);
});
var _TRN_PDFDocAppendTextDiffDocWithOptsObj = (Module['_TRN_PDFDocAppendTextDiffDocWithOptsObj'] = function () {
  return (_TRN_PDFDocAppendTextDiffDocWithOptsObj = Module['_TRN_PDFDocAppendTextDiffDocWithOptsObj'] = Module['asm']['rU']).apply(null, arguments);
});
var _TRN_PDFDocHighlightTextDiffWithOptsObj = (Module['_TRN_PDFDocHighlightTextDiffWithOptsObj'] = function () {
  return (_TRN_PDFDocHighlightTextDiffWithOptsObj = Module['_TRN_PDFDocHighlightTextDiffWithOptsObj'] = Module['asm']['sU']).apply(null, arguments);
});
var _TRN_PDFDocFlattenAnnotationsAdvanced = (Module['_TRN_PDFDocFlattenAnnotationsAdvanced'] = function () {
  return (_TRN_PDFDocFlattenAnnotationsAdvanced = Module['_TRN_PDFDocFlattenAnnotationsAdvanced'] = Module['asm']['tU']).apply(null, arguments);
});
var _TRN_PDFDocFDFExtractAnnots = (Module['_TRN_PDFDocFDFExtractAnnots'] = function () {
  return (_TRN_PDFDocFDFExtractAnnots = Module['_TRN_PDFDocFDFExtractAnnots'] = Module['asm']['uU']).apply(null, arguments);
});
var _TRN_PDFDocFDFExtractCommand = (Module['_TRN_PDFDocFDFExtractCommand'] = function () {
  return (_TRN_PDFDocFDFExtractCommand = Module['_TRN_PDFDocFDFExtractCommand'] = Module['asm']['vU']).apply(null, arguments);
});
var _TRN_PDFDocFDFUpdateAppearanceDocs = (Module['_TRN_PDFDocFDFUpdateAppearanceDocs'] = function () {
  return (_TRN_PDFDocFDFUpdateAppearanceDocs = Module['_TRN_PDFDocFDFUpdateAppearanceDocs'] = Module['asm']['wU']).apply(null, arguments);
});
var _TRN_PDFDocCreateIndirectString = (Module['_TRN_PDFDocCreateIndirectString'] = function () {
  return (_TRN_PDFDocCreateIndirectString = Module['_TRN_PDFDocCreateIndirectString'] = Module['asm']['xU']).apply(null, arguments);
});
var _TRN_PDFDocHasDownloader = (Module['_TRN_PDFDocHasDownloader'] = function () {
  return (_TRN_PDFDocHasDownloader = Module['_TRN_PDFDocHasDownloader'] = Module['asm']['yU']).apply(null, arguments);
});
var _TRN_PDFDocAddStdSignatureHandlerFromFile = (Module['_TRN_PDFDocAddStdSignatureHandlerFromFile'] = function () {
  return (_TRN_PDFDocAddStdSignatureHandlerFromFile = Module['_TRN_PDFDocAddStdSignatureHandlerFromFile'] = Module['asm']['zU']).apply(null, arguments);
});
var _TRN_PDFDocAppendVisualDiffWithOptsObj = (Module['_TRN_PDFDocAppendVisualDiffWithOptsObj'] = function () {
  return (_TRN_PDFDocAppendVisualDiffWithOptsObj = Module['_TRN_PDFDocAppendVisualDiffWithOptsObj'] = Module['asm']['AU']).apply(null, arguments);
});
var _TRN_PDFDocSaveViewerOptimized = (Module['_TRN_PDFDocSaveViewerOptimized'] = function () {
  return (_TRN_PDFDocSaveViewerOptimized = Module['_TRN_PDFDocSaveViewerOptimized'] = Module['asm']['BU']).apply(null, arguments);
});
var _TRN_DownloaderCreate = (Module['_TRN_DownloaderCreate'] = function () {
  return (_TRN_DownloaderCreate = Module['_TRN_DownloaderCreate'] = Module['asm']['CU']).apply(null, arguments);
});
var _TRN_DownloaderStop = (Module['_TRN_DownloaderStop'] = function () {
  return (_TRN_DownloaderStop = Module['_TRN_DownloaderStop'] = Module['asm']['DU']).apply(null, arguments);
});
var _TRN_DownloaderIsLinearizationValid = (Module['_TRN_DownloaderIsLinearizationValid'] = function () {
  return (_TRN_DownloaderIsLinearizationValid = Module['_TRN_DownloaderIsLinearizationValid'] = Module['asm']['EU']).apply(null, arguments);
});
var _TRN_PDFDocDownloaderInitialize = (Module['_TRN_PDFDocDownloaderInitialize'] = function () {
  return (_TRN_PDFDocDownloaderInitialize = Module['_TRN_PDFDocDownloaderInitialize'] = Module['asm']['FU']).apply(null, arguments);
});
var _TRN_PDFDocDownloaderTriggerFullDownload = (Module['_TRN_PDFDocDownloaderTriggerFullDownload'] = function () {
  return (_TRN_PDFDocDownloaderTriggerFullDownload = Module['_TRN_PDFDocDownloaderTriggerFullDownload'] = Module['asm']['GU']).apply(null, arguments);
});
var _TRN_PDFDocDownloadPages = (Module['_TRN_PDFDocDownloadPages'] = function () {
  return (_TRN_PDFDocDownloadPages = Module['_TRN_PDFDocDownloadPages'] = Module['asm']['HU']).apply(null, arguments);
});
var _TRN_PDFDocDownloadThumb = (Module['_TRN_PDFDocDownloadThumb'] = function () {
  return (_TRN_PDFDocDownloadThumb = Module['_TRN_PDFDocDownloadThumb'] = Module['asm']['IU']).apply(null, arguments);
});
var _TRN_DownloadComplete = (Module['_TRN_DownloadComplete'] = function () {
  return (_TRN_DownloadComplete = Module['_TRN_DownloadComplete'] = Module['asm']['JU']).apply(null, arguments);
});
var _TRN_DownloaderGetRequiredChunks = (Module['_TRN_DownloaderGetRequiredChunks'] = function () {
  return (_TRN_DownloaderGetRequiredChunks = Module['_TRN_DownloaderGetRequiredChunks'] = Module['asm']['KU']).apply(null, arguments);
});
var _TRN_DownloaderGetRequiredChunksSize = (Module['_TRN_DownloaderGetRequiredChunksSize'] = function () {
  return (_TRN_DownloaderGetRequiredChunksSize = Module['_TRN_DownloaderGetRequiredChunksSize'] = Module['asm']['LU']).apply(null, arguments);
});
var _TRN_GetDownloadChunkSize = (Module['_TRN_GetDownloadChunkSize'] = function () {
  return (_TRN_GetDownloadChunkSize = Module['_TRN_GetDownloadChunkSize'] = Module['asm']['MU']).apply(null, arguments);
});
var _TRN_PDFDocGetFinalObjRef = (Module['_TRN_PDFDocGetFinalObjRef'] = function () {
  return (_TRN_PDFDocGetFinalObjRef = Module['_TRN_PDFDocGetFinalObjRef'] = Module['asm']['NU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateBlankPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateBlankPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateBlankPaperDoc = Module['_TRN_PDFDocGeneratorGenerateBlankPaperDoc'] = Module['asm']['OU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateGridPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateGridPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateGridPaperDoc = Module['_TRN_PDFDocGeneratorGenerateGridPaperDoc'] = Module['asm']['PU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateLinedPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateLinedPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateLinedPaperDoc = Module['_TRN_PDFDocGeneratorGenerateLinedPaperDoc'] = Module['asm']['QU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateGraphPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateGraphPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateGraphPaperDoc = Module['_TRN_PDFDocGeneratorGenerateGraphPaperDoc'] = Module['asm']['RU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateMusicPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateMusicPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateMusicPaperDoc = Module['_TRN_PDFDocGeneratorGenerateMusicPaperDoc'] = Module['asm']['SU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateDottedPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateDottedPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateDottedPaperDoc = Module['_TRN_PDFDocGeneratorGenerateDottedPaperDoc'] = Module['asm']['TU']).apply(null, arguments);
});
var _TRN_PDFDocGeneratorGenerateIsometricDottedPaperDoc = (Module['_TRN_PDFDocGeneratorGenerateIsometricDottedPaperDoc'] = function () {
  return (_TRN_PDFDocGeneratorGenerateIsometricDottedPaperDoc = Module['_TRN_PDFDocGeneratorGenerateIsometricDottedPaperDoc'] = Module['asm']['UU']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFDrawExport = (Module['_TRN_PDFDrawExport'] = function () {
  return (_TRN_PDFDrawExport = Module['_TRN_PDFDrawExport'] = Module['asm']['VU']).apply(null, arguments);
});
var _TRN_PDFDrawSetErrorReportProc = (Module['_TRN_PDFDrawSetErrorReportProc'] = function () {
  return (_TRN_PDFDrawSetErrorReportProc = Module['_TRN_PDFDrawSetErrorReportProc'] = Module['asm']['WU']).apply(null, arguments);
});
var _TRN_Collect23 = (Module['_TRN_Collect23'] = function () {
  return (_TRN_Collect23 = Module['_TRN_Collect23'] = Module['asm']['XU']).apply(null, arguments);
});
var _TRN_RequestAsyncCallback = (Module['_TRN_RequestAsyncCallback'] = function () {
  return (_TRN_RequestAsyncCallback = Module['_TRN_RequestAsyncCallback'] = Module['asm']['YU']).apply(null, arguments);
});
var _TRN_PDFNetInitializeEx = (Module['_TRN_PDFNetInitializeEx'] = function () {
  return (_TRN_PDFNetInitializeEx = Module['_TRN_PDFNetInitializeEx'] = Module['asm']['ZU']).apply(null, arguments);
});
var _TRN_PDFNetInitialize = (Module['_TRN_PDFNetInitialize'] = function () {
  return (_TRN_PDFNetInitialize = Module['_TRN_PDFNetInitialize'] = Module['asm']['_U']).apply(null, arguments);
});
var _TRN_PDFNetTerminate = (Module['_TRN_PDFNetTerminate'] = function () {
  return (_TRN_PDFNetTerminate = Module['_TRN_PDFNetTerminate'] = Module['asm']['$U']).apply(null, arguments);
});
var _TRN_PDFNetSetResourcesPath = (Module['_TRN_PDFNetSetResourcesPath'] = function () {
  return (_TRN_PDFNetSetResourcesPath = Module['_TRN_PDFNetSetResourcesPath'] = Module['asm']['aV']).apply(null, arguments);
});
var _TRN_PDFNetGetResourcesPath = (Module['_TRN_PDFNetGetResourcesPath'] = function () {
  return (_TRN_PDFNetGetResourcesPath = Module['_TRN_PDFNetGetResourcesPath'] = Module['asm']['bV']).apply(null, arguments);
});
var _TRN_PDFNetAddResourceSearchPath = (Module['_TRN_PDFNetAddResourceSearchPath'] = function () {
  return (_TRN_PDFNetAddResourceSearchPath = Module['_TRN_PDFNetAddResourceSearchPath'] = Module['asm']['cV']).apply(null, arguments);
});
var _TRN_PDFNetSetResourceData = (Module['_TRN_PDFNetSetResourceData'] = function () {
  return (_TRN_PDFNetSetResourceData = Module['_TRN_PDFNetSetResourceData'] = Module['asm']['dV']).apply(null, arguments);
});
var _TRN_PDFNetSetDefaultDeviceCMYKProfile = (Module['_TRN_PDFNetSetDefaultDeviceCMYKProfile'] = function () {
  return (_TRN_PDFNetSetDefaultDeviceCMYKProfile = Module['_TRN_PDFNetSetDefaultDeviceCMYKProfile'] = Module['asm']['eV']).apply(null, arguments);
});
var _TRN_PDFNetSetDefaultDeviceRGBProfile = (Module['_TRN_PDFNetSetDefaultDeviceRGBProfile'] = function () {
  return (_TRN_PDFNetSetDefaultDeviceRGBProfile = Module['_TRN_PDFNetSetDefaultDeviceRGBProfile'] = Module['asm']['fV']).apply(null, arguments);
});
var _TRN_PDFNetSetDefaultDiskCachingEnabled = (Module['_TRN_PDFNetSetDefaultDiskCachingEnabled'] = function () {
  return (_TRN_PDFNetSetDefaultDiskCachingEnabled = Module['_TRN_PDFNetSetDefaultDiskCachingEnabled'] = Module['asm']['gV']).apply(null, arguments);
});
var _TRN_PDFNetAddFontSubstFromName = (Module['_TRN_PDFNetAddFontSubstFromName'] = function () {
  return (_TRN_PDFNetAddFontSubstFromName = Module['_TRN_PDFNetAddFontSubstFromName'] = Module['asm']['hV']).apply(null, arguments);
});
var _TRN_PDFNetAddFontSubst = (Module['_TRN_PDFNetAddFontSubst'] = function () {
  return (_TRN_PDFNetAddFontSubst = Module['_TRN_PDFNetAddFontSubst'] = Module['asm']['iV']).apply(null, arguments);
});
var _TRN_PDFNetSetTempPath = (Module['_TRN_PDFNetSetTempPath'] = function () {
  return (_TRN_PDFNetSetTempPath = Module['_TRN_PDFNetSetTempPath'] = Module['asm']['jV']).apply(null, arguments);
});
var _TRN_PDFNetSetPersistentCachePath = (Module['_TRN_PDFNetSetPersistentCachePath'] = function () {
  return (_TRN_PDFNetSetPersistentCachePath = Module['_TRN_PDFNetSetPersistentCachePath'] = Module['asm']['kV']).apply(null, arguments);
});
var _TRN_PDFNetRegisterSecurityHandler = (Module['_TRN_PDFNetRegisterSecurityHandler'] = function () {
  return (_TRN_PDFNetRegisterSecurityHandler = Module['_TRN_PDFNetRegisterSecurityHandler'] = Module['asm']['lV']).apply(null, arguments);
});
var _TRN_PDFNetGetSecHdlrInfoIterator = (Module['_TRN_PDFNetGetSecHdlrInfoIterator'] = function () {
  return (_TRN_PDFNetGetSecHdlrInfoIterator = Module['_TRN_PDFNetGetSecHdlrInfoIterator'] = Module['asm']['mV']).apply(null, arguments);
});
var _TRN_PDFNetSetNumberWriteProc = (Module['_TRN_PDFNetSetNumberWriteProc'] = function () {
  return (_TRN_PDFNetSetNumberWriteProc = Module['_TRN_PDFNetSetNumberWriteProc'] = Module['asm']['nV']).apply(null, arguments);
});
var _TRN_PDFNetSetNumberReadProc = (Module['_TRN_PDFNetSetNumberReadProc'] = function () {
  return (_TRN_PDFNetSetNumberReadProc = Module['_TRN_PDFNetSetNumberReadProc'] = Module['asm']['oV']).apply(null, arguments);
});
var _TRN_PDFNetSetWriteAPIUsageLocally = (Module['_TRN_PDFNetSetWriteAPIUsageLocally'] = function () {
  return (_TRN_PDFNetSetWriteAPIUsageLocally = Module['_TRN_PDFNetSetWriteAPIUsageLocally'] = Module['asm']['pV']).apply(null, arguments);
});
var _TRN_PDFNetSetConnectionErrorProc = (Module['_TRN_PDFNetSetConnectionErrorProc'] = function () {
  return (_TRN_PDFNetSetConnectionErrorProc = Module['_TRN_PDFNetSetConnectionErrorProc'] = Module['asm']['qV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsIsLogSystemAvailable = (Module['_TRN_PDFNetInternalToolsIsLogSystemAvailable'] = function () {
  return (_TRN_PDFNetInternalToolsIsLogSystemAvailable = Module['_TRN_PDFNetInternalToolsIsLogSystemAvailable'] = Module['asm']['rV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsConfigureLogFromJsonString = (Module['_TRN_PDFNetInternalToolsConfigureLogFromJsonString'] = function () {
  return (_TRN_PDFNetInternalToolsConfigureLogFromJsonString = Module['_TRN_PDFNetInternalToolsConfigureLogFromJsonString'] = Module['asm']['sV']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFNetInternalToolsGetDefaultConfigFile = (Module['_TRN_PDFNetInternalToolsGetDefaultConfigFile'] = function () {
  return (_TRN_PDFNetInternalToolsGetDefaultConfigFile = Module['_TRN_PDFNetInternalToolsGetDefaultConfigFile'] = Module['asm']['tV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsRunUniversalConversionTests = (Module['_TRN_PDFNetInternalToolsRunUniversalConversionTests'] = function () {
  return (_TRN_PDFNetInternalToolsRunUniversalConversionTests = Module['_TRN_PDFNetInternalToolsRunUniversalConversionTests'] = Module['asm']['uV']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFNetInternalToolsLogMessage = (Module['_TRN_PDFNetInternalToolsLogMessage'] = function () {
  return (_TRN_PDFNetInternalToolsLogMessage = Module['_TRN_PDFNetInternalToolsLogMessage'] = Module['asm']['vV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsLogStreamMessage = (Module['_TRN_PDFNetInternalToolsLogStreamMessage'] = function () {
  return (_TRN_PDFNetInternalToolsLogStreamMessage = Module['_TRN_PDFNetInternalToolsLogStreamMessage'] = Module['asm']['wV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsSetLogLocation = (Module['_TRN_PDFNetInternalToolsSetLogLocation'] = function () {
  return (_TRN_PDFNetInternalToolsSetLogLocation = Module['_TRN_PDFNetInternalToolsSetLogLocation'] = Module['asm']['xV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsSetLogFileName = (Module['_TRN_PDFNetInternalToolsSetLogFileName'] = function () {
  return (_TRN_PDFNetInternalToolsSetLogFileName = Module['_TRN_PDFNetInternalToolsSetLogFileName'] = Module['asm']['yV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsSetThresholdForLogStream = (Module['_TRN_PDFNetInternalToolsSetThresholdForLogStream'] = function () {
  return (_TRN_PDFNetInternalToolsSetThresholdForLogStream = Module['_TRN_PDFNetInternalToolsSetThresholdForLogStream'] = Module['asm']['zV']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFNetInternalToolsSetDefaultLogThreshold = (Module['_TRN_PDFNetInternalToolsSetDefaultLogThreshold'] = function () {
  return (_TRN_PDFNetInternalToolsSetDefaultLogThreshold = Module['_TRN_PDFNetInternalToolsSetDefaultLogThreshold'] = Module['asm']['AV']).apply(
    null,
    arguments,
  );
});
var _TRN_PDFNetInternalToolsSetCutoffLogThreshold = (Module['_TRN_PDFNetInternalToolsSetCutoffLogThreshold'] = function () {
  return (_TRN_PDFNetInternalToolsSetCutoffLogThreshold = Module['_TRN_PDFNetInternalToolsSetCutoffLogThreshold'] = Module['asm']['BV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsEnableLogBackend = (Module['_TRN_PDFNetInternalToolsEnableLogBackend'] = function () {
  return (_TRN_PDFNetInternalToolsEnableLogBackend = Module['_TRN_PDFNetInternalToolsEnableLogBackend'] = Module['asm']['CV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsDisableLogBackend = (Module['_TRN_PDFNetInternalToolsDisableLogBackend'] = function () {
  return (_TRN_PDFNetInternalToolsDisableLogBackend = Module['_TRN_PDFNetInternalToolsDisableLogBackend'] = Module['asm']['DV']).apply(null, arguments);
});
var _TRN_PDFNetInternalToolsGetPDFViewTileSummary = (Module['_TRN_PDFNetInternalToolsGetPDFViewTileSummary'] = function () {
  return (_TRN_PDFNetInternalToolsGetPDFViewTileSummary = Module['_TRN_PDFNetInternalToolsGetPDFViewTileSummary'] = Module['asm']['EV']).apply(null, arguments);
});
var _TRN_PDFRasterizerSetErrorReportProc = (Module['_TRN_PDFRasterizerSetErrorReportProc'] = function () {
  return (_TRN_PDFRasterizerSetErrorReportProc = Module['_TRN_PDFRasterizerSetErrorReportProc'] = Module['asm']['FV']).apply(null, arguments);
});
var _TRN_PDFRasterizerGetChunkRenderer = (Module['_TRN_PDFRasterizerGetChunkRenderer'] = function () {
  return (_TRN_PDFRasterizerGetChunkRenderer = Module['_TRN_PDFRasterizerGetChunkRenderer'] = Module['asm']['GV']).apply(null, arguments);
});
var _TRN_PDFRasterizerGetChunkRendererPath = (Module['_TRN_PDFRasterizerGetChunkRendererPath'] = function () {
  return (_TRN_PDFRasterizerGetChunkRendererPath = Module['_TRN_PDFRasterizerGetChunkRendererPath'] = Module['asm']['HV']).apply(null, arguments);
});
var _TRN_ChunkRendererRenderNext = (Module['_TRN_ChunkRendererRenderNext'] = function () {
  return (_TRN_ChunkRendererRenderNext = Module['_TRN_ChunkRendererRenderNext'] = Module['asm']['IV']).apply(null, arguments);
});
var _TRN_ChunkRendererRenderForTimePeriod = (Module['_TRN_ChunkRendererRenderForTimePeriod'] = function () {
  return (_TRN_ChunkRendererRenderForTimePeriod = Module['_TRN_ChunkRendererRenderForTimePeriod'] = Module['asm']['JV']).apply(null, arguments);
});
var _TRN_ChunkRendererDestroy = (Module['_TRN_ChunkRendererDestroy'] = function () {
  return (_TRN_ChunkRendererDestroy = Module['_TRN_ChunkRendererDestroy'] = Module['asm']['KV']).apply(null, arguments);
});
var _TRN_SeparationDestroy = (Module['_TRN_SeparationDestroy'] = function () {
  return (_TRN_SeparationDestroy = Module['_TRN_SeparationDestroy'] = Module['asm']['LV']).apply(null, arguments);
});
var _TRN_PageGetPageInfo = (Module['_TRN_PageGetPageInfo'] = function () {
  return (_TRN_PageGetPageInfo = Module['_TRN_PageGetPageInfo'] = Module['asm']['MV']).apply(null, arguments);
});
var _TRN_PageLabelAssign = (Module['_TRN_PageLabelAssign'] = function () {
  return (_TRN_PageLabelAssign = Module['_TRN_PageLabelAssign'] = Module['asm']['NV']).apply(null, arguments);
});
var _TRN_PatternColorAssign = (Module['_TRN_PatternColorAssign'] = function () {
  return (_TRN_PatternColorAssign = Module['_TRN_PatternColorAssign'] = Module['asm']['OV']).apply(null, arguments);
});
var _TRN_PrintStartPrintJob = (Module['_TRN_PrintStartPrintJob'] = function () {
  return (_TRN_PrintStartPrintJob = Module['_TRN_PrintStartPrintJob'] = Module['asm']['PV']).apply(null, arguments);
});
var _TRN_RadioButtonGroupAssign = (Module['_TRN_RadioButtonGroupAssign'] = function () {
  return (_TRN_RadioButtonGroupAssign = Module['_TRN_RadioButtonGroupAssign'] = Module['asm']['QV']).apply(null, arguments);
});
var _TRN_RectAssign = (Module['_TRN_RectAssign'] = function () {
  return (_TRN_RectAssign = Module['_TRN_RectAssign'] = Module['asm']['RV']).apply(null, arguments);
});
var _TRN_RectGetX1 = (Module['_TRN_RectGetX1'] = function () {
  return (_TRN_RectGetX1 = Module['_TRN_RectGetX1'] = Module['asm']['SV']).apply(null, arguments);
});
var _TRN_RectGetY1 = (Module['_TRN_RectGetY1'] = function () {
  return (_TRN_RectGetY1 = Module['_TRN_RectGetY1'] = Module['asm']['TV']).apply(null, arguments);
});
var _TRN_RectGetX2 = (Module['_TRN_RectGetX2'] = function () {
  return (_TRN_RectGetX2 = Module['_TRN_RectGetX2'] = Module['asm']['UV']).apply(null, arguments);
});
var _TRN_RectGetY2 = (Module['_TRN_RectGetY2'] = function () {
  return (_TRN_RectGetY2 = Module['_TRN_RectGetY2'] = Module['asm']['VV']).apply(null, arguments);
});
var _TRN_RectSetX1 = (Module['_TRN_RectSetX1'] = function () {
  return (_TRN_RectSetX1 = Module['_TRN_RectSetX1'] = Module['asm']['WV']).apply(null, arguments);
});
var _TRN_RectSetY1 = (Module['_TRN_RectSetY1'] = function () {
  return (_TRN_RectSetY1 = Module['_TRN_RectSetY1'] = Module['asm']['XV']).apply(null, arguments);
});
var _TRN_RectSetX2 = (Module['_TRN_RectSetX2'] = function () {
  return (_TRN_RectSetX2 = Module['_TRN_RectSetX2'] = Module['asm']['YV']).apply(null, arguments);
});
var _TRN_RectSetY2 = (Module['_TRN_RectSetY2'] = function () {
  return (_TRN_RectSetY2 = Module['_TRN_RectSetY2'] = Module['asm']['ZV']).apply(null, arguments);
});
var _TRN_RedactionAppearanceDestroy = (Module['_TRN_RedactionAppearanceDestroy'] = function () {
  return (_TRN_RedactionAppearanceDestroy = Module['_TRN_RedactionAppearanceDestroy'] = Module['asm']['_V']).apply(null, arguments);
});
var _TRN_ReflowProcessorInitialize = (Module['_TRN_ReflowProcessorInitialize'] = function () {
  return (_TRN_ReflowProcessorInitialize = Module['_TRN_ReflowProcessorInitialize'] = Module['asm']['$V']).apply(null, arguments);
});
var _TRN_ReflowProcessorIsInitialized = (Module['_TRN_ReflowProcessorIsInitialized'] = function () {
  return (_TRN_ReflowProcessorIsInitialized = Module['_TRN_ReflowProcessorIsInitialized'] = Module['asm']['aW']).apply(null, arguments);
});
var _TRN_ReflowProcessorGetReflow = (Module['_TRN_ReflowProcessorGetReflow'] = function () {
  return (_TRN_ReflowProcessorGetReflow = Module['_TRN_ReflowProcessorGetReflow'] = Module['asm']['bW']).apply(null, arguments);
});
var _TRN_ReflowProcessorCancelAllRequests = (Module['_TRN_ReflowProcessorCancelAllRequests'] = function () {
  return (_TRN_ReflowProcessorCancelAllRequests = Module['_TRN_ReflowProcessorCancelAllRequests'] = Module['asm']['cW']).apply(null, arguments);
});
var _TRN_ReflowProcessorCancelRequest = (Module['_TRN_ReflowProcessorCancelRequest'] = function () {
  return (_TRN_ReflowProcessorCancelRequest = Module['_TRN_ReflowProcessorCancelRequest'] = Module['asm']['dW']).apply(null, arguments);
});
var _TRN_ReflowProcessorClearCache = (Module['_TRN_ReflowProcessorClearCache'] = function () {
  return (_TRN_ReflowProcessorClearCache = Module['_TRN_ReflowProcessorClearCache'] = Module['asm']['eW']).apply(null, arguments);
});
var _TRN_SetNoReflowContent = (Module['_TRN_SetNoReflowContent'] = function () {
  return (_TRN_SetNoReflowContent = Module['_TRN_SetNoReflowContent'] = Module['asm']['fW']).apply(null, arguments);
});
var _TRN_SetReflowFailedContent = (Module['_TRN_SetReflowFailedContent'] = function () {
  return (_TRN_SetReflowFailedContent = Module['_TRN_SetReflowFailedContent'] = Module['asm']['gW']).apply(null, arguments);
});
var _TRN_ShadingAssign = (Module['_TRN_ShadingAssign'] = function () {
  return (_TRN_ShadingAssign = Module['_TRN_ShadingAssign'] = Module['asm']['hW']).apply(null, arguments);
});
var _TRN_StructuredOutputModuleIsModuleAvailable = (Module['_TRN_StructuredOutputModuleIsModuleAvailable'] = function () {
  return (_TRN_StructuredOutputModuleIsModuleAvailable = Module['_TRN_StructuredOutputModuleIsModuleAvailable'] = Module['asm']['iW']).apply(null, arguments);
});
var _TRN_TemplateDocumentFillTemplateJson = (Module['_TRN_TemplateDocumentFillTemplateJson'] = function () {
  return (_TRN_TemplateDocumentFillTemplateJson = Module['_TRN_TemplateDocumentFillTemplateJson'] = Module['asm']['jW']).apply(null, arguments);
});
var _TRN_TemplateDocumentGetTemplateKeysJson = (Module['_TRN_TemplateDocumentGetTemplateKeysJson'] = function () {
  return (_TRN_TemplateDocumentGetTemplateKeysJson = Module['_TRN_TemplateDocumentGetTemplateKeysJson'] = Module['asm']['kW']).apply(null, arguments);
});
var _TRN_TemplateDocumentGetErrorString = (Module['_TRN_TemplateDocumentGetErrorString'] = function () {
  return (_TRN_TemplateDocumentGetErrorString = Module['_TRN_TemplateDocumentGetErrorString'] = Module['asm']['lW']).apply(null, arguments);
});
var _TRN_TemplateDocumentGetConversionStatus = (Module['_TRN_TemplateDocumentGetConversionStatus'] = function () {
  return (_TRN_TemplateDocumentGetConversionStatus = Module['_TRN_TemplateDocumentGetConversionStatus'] = Module['asm']['mW']).apply(null, arguments);
});
var _TRN_TemplateDocumentCancelConversion = (Module['_TRN_TemplateDocumentCancelConversion'] = function () {
  return (_TRN_TemplateDocumentCancelConversion = Module['_TRN_TemplateDocumentCancelConversion'] = Module['asm']['nW']).apply(null, arguments);
});
var _TRN_TemplateDocumentIsCancelled = (Module['_TRN_TemplateDocumentIsCancelled'] = function () {
  return (_TRN_TemplateDocumentIsCancelled = Module['_TRN_TemplateDocumentIsCancelled'] = Module['asm']['oW']).apply(null, arguments);
});
var _TRN_TemplateDocumentGetNumWarnings = (Module['_TRN_TemplateDocumentGetNumWarnings'] = function () {
  return (_TRN_TemplateDocumentGetNumWarnings = Module['_TRN_TemplateDocumentGetNumWarnings'] = Module['asm']['pW']).apply(null, arguments);
});
var _TRN_TemplateDocumentGetWarningString = (Module['_TRN_TemplateDocumentGetWarningString'] = function () {
  return (_TRN_TemplateDocumentGetWarningString = Module['_TRN_TemplateDocumentGetWarningString'] = Module['asm']['qW']).apply(null, arguments);
});
var _TRN_TemplateDocumentDestroy = (Module['_TRN_TemplateDocumentDestroy'] = function () {
  return (_TRN_TemplateDocumentDestroy = Module['_TRN_TemplateDocumentDestroy'] = Module['asm']['rW']).apply(null, arguments);
});
var _TRN_TemplateDocumentCopyCtor = (Module['_TRN_TemplateDocumentCopyCtor'] = function () {
  return (_TRN_TemplateDocumentCopyCtor = Module['_TRN_TemplateDocumentCopyCtor'] = Module['asm']['sW']).apply(null, arguments);
});
var _TRN_TemplateDocumentAssign = (Module['_TRN_TemplateDocumentAssign'] = function () {
  return (_TRN_TemplateDocumentAssign = Module['_TRN_TemplateDocumentAssign'] = Module['asm']['tW']).apply(null, arguments);
});
var _TRN_TextRangeDestroy = (Module['_TRN_TextRangeDestroy'] = function () {
  return (_TRN_TextRangeDestroy = Module['_TRN_TextRangeDestroy'] = Module['asm']['uW']).apply(null, arguments);
});
var _TRN_TextRangeCopyCtor = (Module['_TRN_TextRangeCopyCtor'] = function () {
  return (_TRN_TextRangeCopyCtor = Module['_TRN_TextRangeCopyCtor'] = Module['asm']['vW']).apply(null, arguments);
});
var _TRN_TextRangeAssign = (Module['_TRN_TextRangeAssign'] = function () {
  return (_TRN_TextRangeAssign = Module['_TRN_TextRangeAssign'] = Module['asm']['wW']).apply(null, arguments);
});
var _TRN_TextRangeGetPageNumber = (Module['_TRN_TextRangeGetPageNumber'] = function () {
  return (_TRN_TextRangeGetPageNumber = Module['_TRN_TextRangeGetPageNumber'] = Module['asm']['xW']).apply(null, arguments);
});
var _TRN_TextRangeGetQuads = (Module['_TRN_TextRangeGetQuads'] = function () {
  return (_TRN_TextRangeGetQuads = Module['_TRN_TextRangeGetQuads'] = Module['asm']['yW']).apply(null, arguments);
});
var _TRN_TextRangeGetText = (Module['_TRN_TextRangeGetText'] = function () {
  return (_TRN_TextRangeGetText = Module['_TRN_TextRangeGetText'] = Module['asm']['zW']).apply(null, arguments);
});
var _TRN_TextRangeGetTextBefore = (Module['_TRN_TextRangeGetTextBefore'] = function () {
  return (_TRN_TextRangeGetTextBefore = Module['_TRN_TextRangeGetTextBefore'] = Module['asm']['AW']).apply(null, arguments);
});
var _TRN_TextRangeGetTextAfter = (Module['_TRN_TextRangeGetTextAfter'] = function () {
  return (_TRN_TextRangeGetTextAfter = Module['_TRN_TextRangeGetTextAfter'] = Module['asm']['BW']).apply(null, arguments);
});
var _TRN_TimestampingConfigurationCopyCtor = (Module['_TRN_TimestampingConfigurationCopyCtor'] = function () {
  return (_TRN_TimestampingConfigurationCopyCtor = Module['_TRN_TimestampingConfigurationCopyCtor'] = Module['asm']['CW']).apply(null, arguments);
});
var _TRN_TimestampingConfigurationAssign = (Module['_TRN_TimestampingConfigurationAssign'] = function () {
  return (_TRN_TimestampingConfigurationAssign = Module['_TRN_TimestampingConfigurationAssign'] = Module['asm']['DW']).apply(null, arguments);
});
var _TRN_TimestampingResultCopyCtor = (Module['_TRN_TimestampingResultCopyCtor'] = function () {
  return (_TRN_TimestampingResultCopyCtor = Module['_TRN_TimestampingResultCopyCtor'] = Module['asm']['EW']).apply(null, arguments);
});
var _TRN_TimestampingResultAssign = (Module['_TRN_TimestampingResultAssign'] = function () {
  return (_TRN_TimestampingResultAssign = Module['_TRN_TimestampingResultAssign'] = Module['asm']['FW']).apply(null, arguments);
});
var _TRN_VerificationOptionsAddTrustedCertificateUString = (Module['_TRN_VerificationOptionsAddTrustedCertificateUString'] = function () {
  return (_TRN_VerificationOptionsAddTrustedCertificateUString = Module['_TRN_VerificationOptionsAddTrustedCertificateUString'] = Module['asm']['GW']).apply(
    null,
    arguments,
  );
});
var _TRN_VerificationOptionsSetRevocationTimeout = (Module['_TRN_VerificationOptionsSetRevocationTimeout'] = function () {
  return (_TRN_VerificationOptionsSetRevocationTimeout = Module['_TRN_VerificationOptionsSetRevocationTimeout'] = Module['asm']['HW']).apply(null, arguments);
});
var _TRN_ViewChangeCollectionAssign = (Module['_TRN_ViewChangeCollectionAssign'] = function () {
  return (_TRN_ViewChangeCollectionAssign = Module['_TRN_ViewChangeCollectionAssign'] = Module['asm']['IW']).apply(null, arguments);
});
var _TRN_ObjGetRawBuffer = (Module['_TRN_ObjGetRawBuffer'] = function () {
  return (_TRN_ObjGetRawBuffer = Module['_TRN_ObjGetRawBuffer'] = Module['asm']['JW']).apply(null, arguments);
});
var _TRN_ObjGetBuffer = (Module['_TRN_ObjGetBuffer'] = function () {
  return (_TRN_ObjGetBuffer = Module['_TRN_ObjGetBuffer'] = Module['asm']['KW']).apply(null, arguments);
});
var _TRN_ObjPutStringWithSize = (Module['_TRN_ObjPutStringWithSize'] = function () {
  return (_TRN_ObjPutStringWithSize = Module['_TRN_ObjPutStringWithSize'] = Module['asm']['LW']).apply(null, arguments);
});
var _TRN_ObjInsertStringWithSize = (Module['_TRN_ObjInsertStringWithSize'] = function () {
  return (_TRN_ObjInsertStringWithSize = Module['_TRN_ObjInsertStringWithSize'] = Module['asm']['MW']).apply(null, arguments);
});
var _TRN_ObjPushBackStringWithSize = (Module['_TRN_ObjPushBackStringWithSize'] = function () {
  return (_TRN_ObjPushBackStringWithSize = Module['_TRN_ObjPushBackStringWithSize'] = Module['asm']['NW']).apply(null, arguments);
});
var _TRN_ObjSetCopyCtor = (Module['_TRN_ObjSetCopyCtor'] = function () {
  return (_TRN_ObjSetCopyCtor = Module['_TRN_ObjSetCopyCtor'] = Module['asm']['OW']).apply(null, arguments);
});
var _TRN_ObjSetAssign = (Module['_TRN_ObjSetAssign'] = function () {
  return (_TRN_ObjSetAssign = Module['_TRN_ObjSetAssign'] = Module['asm']['PW']).apply(null, arguments);
});
var _TRN_SDFDocCreate = (Module['_TRN_SDFDocCreate'] = function () {
  return (_TRN_SDFDocCreate = Module['_TRN_SDFDocCreate'] = Module['asm']['QW']).apply(null, arguments);
});
var _TRN_SDFDocCreateFromFileUString = (Module['_TRN_SDFDocCreateFromFileUString'] = function () {
  return (_TRN_SDFDocCreateFromFileUString = Module['_TRN_SDFDocCreateFromFileUString'] = Module['asm']['RW']).apply(null, arguments);
});
var _TRN_SDFDocCreateFromFileString = (Module['_TRN_SDFDocCreateFromFileString'] = function () {
  return (_TRN_SDFDocCreateFromFileString = Module['_TRN_SDFDocCreateFromFileString'] = Module['asm']['SW']).apply(null, arguments);
});
var _TRN_SDFDocCreateFromFilter = (Module['_TRN_SDFDocCreateFromFilter'] = function () {
  return (_TRN_SDFDocCreateFromFilter = Module['_TRN_SDFDocCreateFromFilter'] = Module['asm']['TW']).apply(null, arguments);
});
var _TRN_SDFDocCreateFromMemoryBuffer = (Module['_TRN_SDFDocCreateFromMemoryBuffer'] = function () {
  return (_TRN_SDFDocCreateFromMemoryBuffer = Module['_TRN_SDFDocCreateFromMemoryBuffer'] = Module['asm']['UW']).apply(null, arguments);
});
var _TRN_SDFDocDestroy = (Module['_TRN_SDFDocDestroy'] = function () {
  return (_TRN_SDFDocDestroy = Module['_TRN_SDFDocDestroy'] = Module['asm']['VW']).apply(null, arguments);
});
var _TRN_SDFDocInitStdSecurityHandler = (Module['_TRN_SDFDocInitStdSecurityHandler'] = function () {
  return (_TRN_SDFDocInitStdSecurityHandler = Module['_TRN_SDFDocInitStdSecurityHandler'] = Module['asm']['WW']).apply(null, arguments);
});
var _TRN_SDFDocInitStdSecurityHandlerBuffer = (Module['_TRN_SDFDocInitStdSecurityHandlerBuffer'] = function () {
  return (_TRN_SDFDocInitStdSecurityHandlerBuffer = Module['_TRN_SDFDocInitStdSecurityHandlerBuffer'] = Module['asm']['XW']).apply(null, arguments);
});
var _TRN_SDFDocImportObjs = (Module['_TRN_SDFDocImportObjs'] = function () {
  return (_TRN_SDFDocImportObjs = Module['_TRN_SDFDocImportObjs'] = Module['asm']['YW']).apply(null, arguments);
});
var _TRN_SDFDocSave = (Module['_TRN_SDFDocSave'] = function () {
  return (_TRN_SDFDocSave = Module['_TRN_SDFDocSave'] = Module['asm']['ZW']).apply(null, arguments);
});
var _TRN_SDFDocTimedLock = (Module['_TRN_SDFDocTimedLock'] = function () {
  return (_TRN_SDFDocTimedLock = Module['_TRN_SDFDocTimedLock'] = Module['asm']['_W']).apply(null, arguments);
});
var _TRN_SDFDocTimedLockRead = (Module['_TRN_SDFDocTimedLockRead'] = function () {
  return (_TRN_SDFDocTimedLockRead = Module['_TRN_SDFDocTimedLockRead'] = Module['asm']['$W']).apply(null, arguments);
});
var _TRN_SecurityHandlerClone = (Module['_TRN_SecurityHandlerClone'] = function () {
  return (_TRN_SecurityHandlerClone = Module['_TRN_SecurityHandlerClone'] = Module['asm']['aX']).apply(null, arguments);
});
var _TRN_SecurityHandlerInitialize = (Module['_TRN_SecurityHandlerInitialize'] = function () {
  return (_TRN_SecurityHandlerInitialize = Module['_TRN_SecurityHandlerInitialize'] = Module['asm']['bX']).apply(null, arguments);
});
var _TRN_SecurityHandlerAuthorize = (Module['_TRN_SecurityHandlerAuthorize'] = function () {
  return (_TRN_SecurityHandlerAuthorize = Module['_TRN_SecurityHandlerAuthorize'] = Module['asm']['cX']).apply(null, arguments);
});
var _TRN_SecurityHandlerAuthorizeFailed = (Module['_TRN_SecurityHandlerAuthorizeFailed'] = function () {
  return (_TRN_SecurityHandlerAuthorizeFailed = Module['_TRN_SecurityHandlerAuthorizeFailed'] = Module['asm']['dX']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetAuthorizationData = (Module['_TRN_SecurityHandlerGetAuthorizationData'] = function () {
  return (_TRN_SecurityHandlerGetAuthorizationData = Module['_TRN_SecurityHandlerGetAuthorizationData'] = Module['asm']['eX']).apply(null, arguments);
});
var _TRN_SecurityHandlerEditSecurityData = (Module['_TRN_SecurityHandlerEditSecurityData'] = function () {
  return (_TRN_SecurityHandlerEditSecurityData = Module['_TRN_SecurityHandlerEditSecurityData'] = Module['asm']['fX']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeUserPassword = (Module['_TRN_SecurityHandlerChangeUserPassword'] = function () {
  return (_TRN_SecurityHandlerChangeUserPassword = Module['_TRN_SecurityHandlerChangeUserPassword'] = Module['asm']['gX']).apply(null, arguments);
});
var _TRN_SecurityHandlerChangeMasterPassword = (Module['_TRN_SecurityHandlerChangeMasterPassword'] = function () {
  return (_TRN_SecurityHandlerChangeMasterPassword = Module['_TRN_SecurityHandlerChangeMasterPassword'] = Module['asm']['hX']).apply(null, arguments);
});
var _TRN_SecurityHandlerFillEncryptDict = (Module['_TRN_SecurityHandlerFillEncryptDict'] = function () {
  return (_TRN_SecurityHandlerFillEncryptDict = Module['_TRN_SecurityHandlerFillEncryptDict'] = Module['asm']['iX']).apply(null, arguments);
});
var _TRN_SecurityHandlerSetDerived = (Module['_TRN_SecurityHandlerSetDerived'] = function () {
  return (_TRN_SecurityHandlerSetDerived = Module['_TRN_SecurityHandlerSetDerived'] = Module['asm']['jX']).apply(null, arguments);
});
var _TRN_SecurityHandlerGetDerived = (Module['_TRN_SecurityHandlerGetDerived'] = function () {
  return (_TRN_SecurityHandlerGetDerived = Module['_TRN_SecurityHandlerGetDerived'] = Module['asm']['kX']).apply(null, arguments);
});
var _TRN_SignatureHandlerCreate = (Module['_TRN_SignatureHandlerCreate'] = function () {
  return (_TRN_SignatureHandlerCreate = Module['_TRN_SignatureHandlerCreate'] = Module['asm']['lX']).apply(null, arguments);
});
var _TRN_SignatureHandlerDestroy = (Module['_TRN_SignatureHandlerDestroy'] = function () {
  return (_TRN_SignatureHandlerDestroy = Module['_TRN_SignatureHandlerDestroy'] = Module['asm']['mX']).apply(null, arguments);
});
var _TRN_SignatureHandlerAppendData = (Module['_TRN_SignatureHandlerAppendData'] = function () {
  return (_TRN_SignatureHandlerAppendData = Module['_TRN_SignatureHandlerAppendData'] = Module['asm']['nX']).apply(null, arguments);
});
var _TRN_SignatureHandlerCreateSignature = (Module['_TRN_SignatureHandlerCreateSignature'] = function () {
  return (_TRN_SignatureHandlerCreateSignature = Module['_TRN_SignatureHandlerCreateSignature'] = Module['asm']['oX']).apply(null, arguments);
});
var _TRN_SignatureHandlerGetUserImpl = (Module['_TRN_SignatureHandlerGetUserImpl'] = function () {
  return (_TRN_SignatureHandlerGetUserImpl = Module['_TRN_SignatureHandlerGetUserImpl'] = Module['asm']['pX']).apply(null, arguments);
});
var _free = (Module['_free'] = function () {
  return (_free = Module['_free'] = Module['asm']['qX']).apply(null, arguments);
});
var ___errno_location = (Module['___errno_location'] = function () {
  return (___errno_location = Module['___errno_location'] = Module['asm']['rX']).apply(null, arguments);
});
var _memset = (Module['_memset'] = function () {
  return (_memset = Module['_memset'] = Module['asm']['sX']).apply(null, arguments);
});
var ___getTypeName = (Module['___getTypeName'] = function () {
  return (___getTypeName = Module['___getTypeName'] = Module['asm']['tX']).apply(null, arguments);
});
var ___embind_register_native_and_builtin_types = (Module['___embind_register_native_and_builtin_types'] = function () {
  return (___embind_register_native_and_builtin_types = Module['___embind_register_native_and_builtin_types'] = Module['asm']['uX']).apply(null, arguments);
});
var _memalign = (Module['_memalign'] = function () {
  return (_memalign = Module['_memalign'] = Module['asm']['wX']).apply(null, arguments);
});
var _setThrew = (Module['_setThrew'] = function () {
  return (_setThrew = Module['_setThrew'] = Module['asm']['xX']).apply(null, arguments);
});
var stackSave = (Module['stackSave'] = function () {
  return (stackSave = Module['stackSave'] = Module['asm']['yX']).apply(null, arguments);
});
var stackRestore = (Module['stackRestore'] = function () {
  return (stackRestore = Module['stackRestore'] = Module['asm']['zX']).apply(null, arguments);
});
var stackAlloc = (Module['stackAlloc'] = function () {
  return (stackAlloc = Module['stackAlloc'] = Module['asm']['AX']).apply(null, arguments);
});
var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
  return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['BX']).apply(null, arguments);
});
var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
  return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['CX']).apply(null, arguments);
});
var dynCall_jii = (Module['dynCall_jii'] = function () {
  return (dynCall_jii = Module['dynCall_jii'] = Module['asm']['DX']).apply(null, arguments);
});
var dynCall_jiji = (Module['dynCall_jiji'] = function () {
  return (dynCall_jiji = Module['dynCall_jiji'] = Module['asm']['EX']).apply(null, arguments);
});
var dynCall_ji = (Module['dynCall_ji'] = function () {
  return (dynCall_ji = Module['dynCall_ji'] = Module['asm']['FX']).apply(null, arguments);
});
var dynCall_viij = (Module['dynCall_viij'] = function () {
  return (dynCall_viij = Module['dynCall_viij'] = Module['asm']['GX']).apply(null, arguments);
});
var dynCall_j = (Module['dynCall_j'] = function () {
  return (dynCall_j = Module['dynCall_j'] = Module['asm']['HX']).apply(null, arguments);
});
var dynCall_iij = (Module['dynCall_iij'] = function () {
  return (dynCall_iij = Module['dynCall_iij'] = Module['asm']['IX']).apply(null, arguments);
});
var dynCall_viji = (Module['dynCall_viji'] = function () {
  return (dynCall_viji = Module['dynCall_viji'] = Module['asm']['JX']).apply(null, arguments);
});
var dynCall_vij = (Module['dynCall_vij'] = function () {
  return (dynCall_vij = Module['dynCall_vij'] = Module['asm']['KX']).apply(null, arguments);
});
var dynCall_jij = (Module['dynCall_jij'] = function () {
  return (dynCall_jij = Module['dynCall_jij'] = Module['asm']['LX']).apply(null, arguments);
});
var dynCall_iiiijiii = (Module['dynCall_iiiijiii'] = function () {
  return (dynCall_iiiijiii = Module['dynCall_iiiijiii'] = Module['asm']['MX']).apply(null, arguments);
});
var dynCall_iiiji = (Module['dynCall_iiiji'] = function () {
  return (dynCall_iiiji = Module['dynCall_iiiji'] = Module['asm']['NX']).apply(null, arguments);
});
var dynCall_viijj = (Module['dynCall_viijj'] = function () {
  return (dynCall_viijj = Module['dynCall_viijj'] = Module['asm']['OX']).apply(null, arguments);
});
var dynCall_viiiiijijji = (Module['dynCall_viiiiijijji'] = function () {
  return (dynCall_viiiiijijji = Module['dynCall_viiiiijijji'] = Module['asm']['PX']).apply(null, arguments);
});
var dynCall_vijii = (Module['dynCall_vijii'] = function () {
  return (dynCall_vijii = Module['dynCall_vijii'] = Module['asm']['QX']).apply(null, arguments);
});
var dynCall_jiiiii = (Module['dynCall_jiiiii'] = function () {
  return (dynCall_jiiiii = Module['dynCall_jiiiii'] = Module['asm']['RX']).apply(null, arguments);
});
var dynCall_viijjii = (Module['dynCall_viijjii'] = function () {
  return (dynCall_viijjii = Module['dynCall_viijjii'] = Module['asm']['SX']).apply(null, arguments);
});
var dynCall_viiiiiiij = (Module['dynCall_viiiiiiij'] = function () {
  return (dynCall_viiiiiiij = Module['dynCall_viiiiiiij'] = Module['asm']['TX']).apply(null, arguments);
});
var dynCall_jiii = (Module['dynCall_jiii'] = function () {
  return (dynCall_jiii = Module['dynCall_jiii'] = Module['asm']['UX']).apply(null, arguments);
});
var dynCall_viiiiiiiijji = (Module['dynCall_viiiiiiiijji'] = function () {
  return (dynCall_viiiiiiiijji = Module['dynCall_viiiiiiiijji'] = Module['asm']['VX']).apply(null, arguments);
});
var dynCall_vijiiiiii = (Module['dynCall_vijiiiiii'] = function () {
  return (dynCall_vijiiiiii = Module['dynCall_vijiiiiii'] = Module['asm']['WX']).apply(null, arguments);
});
var dynCall_viijijii = (Module['dynCall_viijijii'] = function () {
  return (dynCall_viijijii = Module['dynCall_viijijii'] = Module['asm']['XX']).apply(null, arguments);
});
var dynCall_viiijiiij = (Module['dynCall_viiijiiij'] = function () {
  return (dynCall_viiijiiij = Module['dynCall_viiijiiij'] = Module['asm']['YX']).apply(null, arguments);
});
var dynCall_iijiiiiii = (Module['dynCall_iijiiiiii'] = function () {
  return (dynCall_iijiiiiii = Module['dynCall_iijiiiiii'] = Module['asm']['ZX']).apply(null, arguments);
});
var dynCall_viiiiij = (Module['dynCall_viiiiij'] = function () {
  return (dynCall_viiiiij = Module['dynCall_viiiiij'] = Module['asm']['_X']).apply(null, arguments);
});
var dynCall_iiij = (Module['dynCall_iiij'] = function () {
  return (dynCall_iiij = Module['dynCall_iiij'] = Module['asm']['$X']).apply(null, arguments);
});
var dynCall_viiij = (Module['dynCall_viiij'] = function () {
  return (dynCall_viiij = Module['dynCall_viiij'] = Module['asm']['aY']).apply(null, arguments);
});
var dynCall_viiijjj = (Module['dynCall_viiijjj'] = function () {
  return (dynCall_viiijjj = Module['dynCall_viiijjj'] = Module['asm']['bY']).apply(null, arguments);
});
var dynCall_iiji = (Module['dynCall_iiji'] = function () {
  return (dynCall_iiji = Module['dynCall_iiji'] = Module['asm']['cY']).apply(null, arguments);
});
var dynCall_iiiiiji = (Module['dynCall_iiiiiji'] = function () {
  return (dynCall_iiiiiji = Module['dynCall_iiiiiji'] = Module['asm']['dY']).apply(null, arguments);
});
var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
  return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['eY']).apply(null, arguments);
});
var dynCall_viiji = (Module['dynCall_viiji'] = function () {
  return (dynCall_viiji = Module['dynCall_viiji'] = Module['asm']['fY']).apply(null, arguments);
});
var dynCall_ijiiijiiiiiiiiiii = (Module['dynCall_ijiiijiiiiiiiiiii'] = function () {
  return (dynCall_ijiiijiiiiiiiiiii = Module['dynCall_ijiiijiiiiiiiiiii'] = Module['asm']['gY']).apply(null, arguments);
});
var dynCall_viijjiiiii = (Module['dynCall_viijjiiiii'] = function () {
  return (dynCall_viijjiiiii = Module['dynCall_viijjiiiii'] = Module['asm']['hY']).apply(null, arguments);
});
var dynCall_viijii = (Module['dynCall_viijii'] = function () {
  return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['iY']).apply(null, arguments);
});
var dynCall_iiiij = (Module['dynCall_iiiij'] = function () {
  return (dynCall_iiiij = Module['dynCall_iiiij'] = Module['asm']['jY']).apply(null, arguments);
});
var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = function () {
  return (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = Module['asm']['kY']).apply(null, arguments);
});
var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = function () {
  return (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = Module['asm']['lY']).apply(null, arguments);
});
var dynCall_iiijji = (Module['dynCall_iiijji'] = function () {
  return (dynCall_iiijji = Module['dynCall_iiijji'] = Module['asm']['mY']).apply(null, arguments);
});
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vii(index, a1, a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_ii(index, a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iii(index, a1, a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vi(index, a1) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_diii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiidi(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_v(index) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)();
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiddiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_diiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_i(index) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)();
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iidddiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiidi(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiid(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iidddd(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiddi(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iid(index, a1, a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iidd(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiddddi(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiddi(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_di(index, a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vid(index, a1, a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viddd(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viidddd(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viid(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiidiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidd(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_dii(index, a1, a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiddd(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidddddd(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidddiidd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidddd(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_diiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiddi(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viidddi(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viidiii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidi(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiid(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiidddd(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiidii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_idii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viddi(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viidd(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiiiiiiiiiiiiiiii(
  index,
  a1,
  a2,
  a3,
  a4,
  a5,
  a6,
  a7,
  a8,
  a9,
  a10,
  a11,
  a12,
  a13,
  a14,
  a15,
  a16,
  a17,
  a18,
  a19,
  a20,
  a21,
  a22,
  a23,
  a24,
  a25,
  a26,
) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viidii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiidi(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiidi(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiidi(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiid(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiddddi(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiidd(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiddiid(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiidddi(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiid(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiidd(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidiiii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiddiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiidiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vddiidddiidd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vddddddi(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiddd(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiiiiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidddddddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_diifii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_fiiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiid(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiidiidiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vidddddiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_idi(index, a1, a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiddddii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiddii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vdi(index, a1, a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiidi(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_diiiiiddi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiid(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vddii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiddddii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiidddd(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viidi(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_diid(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiddi(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vif(index, a1, a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_fi(index, a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiddii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiidd(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iidii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiidddd(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vij(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    dynCall_vij(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_ji(index, a1) {
  var sp = stackSave();
  try {
    return dynCall_ji(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viji(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    dynCall_viji(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viij(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    dynCall_viij(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_jij(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return dynCall_jij(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_jii(index, a1, a2) {
  var sp = stackSave();
  try {
    return dynCall_jii(index, a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiijiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    return dynCall_iiiijiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiji(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return dynCall_iiiji(index, a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viijj(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    dynCall_viijj(index, a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiijijji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
  var sp = stackSave();
  try {
    dynCall_viiiiijijji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vijii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    dynCall_vijii(index, a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viijjii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  var sp = stackSave();
  try {
    dynCall_viijjii(index, a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiij(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    dynCall_viiiiiiij(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiij(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return dynCall_iiij(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_jiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return dynCall_jiii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iij(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return dynCall_iij(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiiiiijji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
  var sp = stackSave();
  try {
    dynCall_viiiiiiiijji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    return dynCall_iijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiiiij(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    dynCall_viiiiij(index, a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiij(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    dynCall_viiij(index, a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_jiiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return dynCall_jiiiii(index, a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiiji(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    return dynCall_iiiiiji(index, a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_ijiiijiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
  var sp = stackSave();
  try {
    return dynCall_ijiiijiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viijjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
  var sp = stackSave();
  try {
    dynCall_viijjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    dynCall_vijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viijijii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    dynCall_viijijii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiijiiij(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave();
  try {
    dynCall_viiijiiij(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiijji(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    return dynCall_iiijji(index, a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    dynCall_viiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiji(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return dynCall_iiji(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_j(index) {
  var sp = stackSave();
  try {
    return dynCall_j(index);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiji(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    dynCall_viiji(index, a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave();
  try {
    return dynCall_iiiiij(index, a1, a2, a3, a4, a5, a6);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
Module['intArrayFromString'] = intArrayFromString;
Module['setValue'] = setValue;
Module['getValue'] = getValue;
Module['allocate'] = allocate;
Module['UTF8ToString'] = UTF8ToString;
Module['addFunction'] = addFunction;
Module['stackSave'] = stackSave;
Module['stackRestore'] = stackRestore;
Module['UTF16ToString'] = UTF16ToString;
Module['stringToUTF16'] = stringToUTF16;
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
var calledRun;
function ExitStatus(status) {
  this.name = 'ExitStatus';
  this.message = 'Program terminated with exit(' + status + ')';
  this.status = status;
}
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};
function run(args) {
  args = args || arguments_;
  if (runDependencies > 0) {
    return;
  }
  preRun();
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;
    if (ABORT) return;
    initRuntime();
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function () {
      setTimeout(function () {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = run;
function exit(status, implicit) {
  EXITSTATUS = status;
  if (keepRuntimeAlive()) {
  } else {
    exitRuntime();
  }
  procExit(status);
}
function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module['onExit']) Module['onExit'](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
run();
