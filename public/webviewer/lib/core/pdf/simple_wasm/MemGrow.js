function GROWABLE_HEAP_I8() {
  if (wasmMemory.buffer != buffer) {
    updateGlobalBufferAndViews(wasmMemory.buffer);
  }
  return HEAP8;
}
function GROWABLE_HEAP_U8() {
  if (wasmMemory.buffer != buffer) {
    updateGlobalBufferAndViews(wasmMemory.buffer);
  }
  return HEAPU8;
}
function GROWABLE_HEAP_I32() {
  if (wasmMemory.buffer != buffer) {
    updateGlobalBufferAndViews(wasmMemory.buffer);
  }
  return HEAP32;
}
function GROWABLE_HEAP_U32() {
  if (wasmMemory.buffer != buffer) {
    updateGlobalBufferAndViews(wasmMemory.buffer);
  }
  return HEAPU32;
}
function GROWABLE_HEAP_F64() {
  if (wasmMemory.buffer != buffer) {
    updateGlobalBufferAndViews(wasmMemory.buffer);
  }
  return HEAPF64;
}
var Module = typeof Module !== 'undefined' ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function (status, toThrow) {
  throw toThrow;
};
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
var ENVIRONMENT_IS_PTHREAD = Module['ENVIRONMENT_IS_PTHREAD'] || false;
if (ENVIRONMENT_IS_PTHREAD) {
  buffer = Module['buffer'];
  DYNAMIC_BASE = Module['DYNAMIC_BASE'];
  DYNAMICTOP_PTR = Module['DYNAMICTOP_PTR'];
}
var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
if (ENVIRONMENT_IS_WORKER) {
  _scriptDir = self.location.href;
} else if (ENVIRONMENT_IS_NODE) {
  _scriptDir = __filename;
}
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}
var read_, readAsync, readBinary, setWindowTitle;
var nodeFS;
var nodePath;
if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }
  read_ = function shell_read(filename, binary) {
    if (!nodeFS) nodeFS = require('fs');
    if (!nodePath) nodePath = require('path');
    filename = nodePath['normalize'](filename);
    return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
  };
  readBinary = function readBinary(filename) {
    var ret = read_(filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
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
  process['on']('unhandledRejection', abort);
  quit_ = function (status) {
    process['exit'](status);
  };
  Module['inspect'] = function () {
    return '[Emscripten Module object]';
  };
  var nodeWorkerThreads;
  try {
    nodeWorkerThreads = require('worker_threads');
  } catch (e) {
    console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?');
    throw e;
  }
  Worker = nodeWorkerThreads.Worker;
} else if (ENVIRONMENT_IS_SHELL) {
  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      return read(f);
    };
  }
  readBinary = function readBinary(f) {
    var data;
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };
  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }
  if (typeof quit === 'function') {
    quit_ = function (status) {
      quit(status);
    };
  }
  if (typeof print !== 'undefined') {
    if (typeof console === 'undefined') console = {};
    console.log = print;
    console.warn = console.error = typeof printErr !== 'undefined' ? printErr : print;
  }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1);
  } else {
    scriptDirectory = '';
  }
  if (ENVIRONMENT_IS_NODE) {
    read_ = function shell_read(filename, binary) {
      if (!nodeFS) nodeFS = require('fs');
      if (!nodePath) nodePath = require('path');
      filename = nodePath['normalize'](filename);
      return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
    };
    readBinary = function readBinary(filename) {
      var ret = read_(filename, true);
      if (!ret.buffer) {
        ret = new Uint8Array(ret);
      }
      assert(ret.buffer);
      return ret;
    };
  } else {
    read_ = function shell_read(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    };
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = function readBinary(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      };
    }
    readAsync = function readAsync(url, onload, onerror) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function xhr_onload() {
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
  setWindowTitle = function (title) {
    document.title = title;
  };
} else {
}
if (ENVIRONMENT_IS_NODE) {
  if (typeof performance === 'undefined') {
    performance = require('perf_hooks').performance;
  }
}
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
key = undefined;
moduleOverrides = null;
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];
function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}
var asm2wasmImports = {
  'f64-rem': function (x, y) {
    return x % y;
  },
  debugger: function () {},
};
var functionPointers = new Array(0);
var tempRet0 = 0;
var setTempRet0 = function (value) {
  tempRet0 = value;
};
var getTempRet0 = function () {
  return tempRet0;
};
var GLOBAL_BASE = 1024;
var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime;
if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
if (typeof WebAssembly !== 'object') {
  err('no native wasm support detected');
}
var wasmMemory;
var wasmTable = new WebAssembly.Table({
  initial: 117,
  maximum: 117,
  element: 'anyfunc',
});
var wasmModule;
var threadInfoStruct = 0;
var selfThreadId = 0;
var ABORT = false;
var EXITSTATUS = 0;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var str = '';
  while (!(idx >= endIdx)) {
    var u0 = heap[idx++];
    if (!u0) return str;
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
  return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : '';
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
  return stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
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
var WASM_PAGE_SIZE = 65536;
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
var STACK_BASE = 11248,
  STACKTOP = STACK_BASE,
  STACK_MAX = 5254128,
  DYNAMIC_BASE = 5254128,
  DYNAMICTOP_PTR = 10272;
if (ENVIRONMENT_IS_PTHREAD) {
}
var INITIAL_INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 5308416;
if (ENVIRONMENT_IS_PTHREAD) {
  wasmMemory = Module['wasmMemory'];
  buffer = Module['buffer'];
} else {
  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else {
    wasmMemory = new WebAssembly.Memory({
      initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
      maximum: 2147483648 / WASM_PAGE_SIZE,
      shared: true,
    });
    if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
      err(
        'requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag',
      );
      if (ENVIRONMENT_IS_NODE) {
        console.log('(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)');
      }
      throw Error('bad memory');
    }
  }
}
if (wasmMemory) {
  buffer = wasmMemory.buffer;
}
INITIAL_INITIAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);
if (!ENVIRONMENT_IS_PTHREAD) {
  GROWABLE_HEAP_I32()[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
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
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
if (ENVIRONMENT_IS_PTHREAD) runtimeInitialized = true;
function preRun() {
  if (ENVIRONMENT_IS_PTHREAD) return;
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
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  if (ENVIRONMENT_IS_PTHREAD) return;
  callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
  if (ENVIRONMENT_IS_PTHREAD) return;
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
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function addRunDependency(id) {
  assert(!ENVIRONMENT_IS_PTHREAD, 'addRunDependency cannot be used in a pthread worker');
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
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }
  if (ENVIRONMENT_IS_PTHREAD) console.error('Pthread aborting at ' + new Error().stack);
  what += '';
  out(what);
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
  throw new WebAssembly.RuntimeError(what);
}
var memoryInitializer = null;
function hasPrefix(str, prefix) {
  return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0;
}
var dataURIPrefix = 'data:application/octet-stream;base64,';
function isDataURI(filename) {
  return hasPrefix(filename, dataURIPrefix);
}
var fileURIPrefix = 'file://';
function isFileURI(filename) {
  return hasPrefix(filename, fileURIPrefix);
}
var wasmBinaryFile = 'MemGrow.wasm';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}
function getBinary() {
  try {
    if (wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(wasmBinaryFile);
    } else {
      throw 'both async and sync fetching of the wasm failed';
    }
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function' && !isFileURI(wasmBinaryFile)) {
    return fetch(wasmBinaryFile, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      })
      .catch(function () {
        return getBinary();
      });
  }
  return new Promise(function (resolve, reject) {
    resolve(getBinary());
  });
}
function createWasm() {
  var info = {
    env: asmLibraryArg,
    wasi_snapshot_preview1: asmLibraryArg,
    global: { NaN: NaN, Infinity: Infinity },
    'global.Math': Math,
    asm2wasm: asm2wasmImports,
  };
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module['asm'] = exports;
    wasmModule = module;
    if (!ENVIRONMENT_IS_PTHREAD) {
      var numWorkersToLoad = PThread.unusedWorkers.length;
      PThread.unusedWorkers.forEach(function (w) {
        PThread.loadWasmModuleToWorker(w, function () {
          if (!--numWorkersToLoad) removeRunDependency('wasm-instantiate');
        });
      });
    }
  }
  if (!ENVIRONMENT_IS_PTHREAD) {
    addRunDependency('wasm-instantiate');
  }
  function receiveInstantiatedSource(output) {
    receiveInstance(output['instance'], output['module']);
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
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
      fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);
        return result.then(receiveInstantiatedSource, function (reason) {
          err('wasm streaming compile failed: ' + reason);
          err('falling back to ArrayBuffer instantiation');
          instantiateArrayBuffer(receiveInstantiatedSource);
        });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiatedSource);
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
Module['asm'] = createWasm;
var ASM_CONSTS = [
  function () {
    throw 'Canceled!';
  },
];
function _emscripten_asm_const_i(code) {
  return ASM_CONSTS[code]();
}
function _initPthreadsJS() {
  PThread.initRuntime();
}
if (!ENVIRONMENT_IS_PTHREAD)
  __ATINIT__.push({
    func: function () {
      ___emscripten_pthread_data_constructor();
    },
  });
if (!ENVIRONMENT_IS_PTHREAD) {
  memoryInitializer = 'MemGrow.js.mem';
}
var tempDoublePtr = ENVIRONMENT_IS_PTHREAD ? 0 : 11232;
var ERRNO_CODES = {
  EPERM: 63,
  ENOENT: 44,
  ESRCH: 71,
  EINTR: 27,
  EIO: 29,
  ENXIO: 60,
  E2BIG: 1,
  ENOEXEC: 45,
  EBADF: 8,
  ECHILD: 12,
  EAGAIN: 6,
  EWOULDBLOCK: 6,
  ENOMEM: 48,
  EACCES: 2,
  EFAULT: 21,
  ENOTBLK: 105,
  EBUSY: 10,
  EEXIST: 20,
  EXDEV: 75,
  ENODEV: 43,
  ENOTDIR: 54,
  EISDIR: 31,
  EINVAL: 28,
  ENFILE: 41,
  EMFILE: 33,
  ENOTTY: 59,
  ETXTBSY: 74,
  EFBIG: 22,
  ENOSPC: 51,
  ESPIPE: 70,
  EROFS: 69,
  EMLINK: 34,
  EPIPE: 64,
  EDOM: 18,
  ERANGE: 68,
  ENOMSG: 49,
  EIDRM: 24,
  ECHRNG: 106,
  EL2NSYNC: 156,
  EL3HLT: 107,
  EL3RST: 108,
  ELNRNG: 109,
  EUNATCH: 110,
  ENOCSI: 111,
  EL2HLT: 112,
  EDEADLK: 16,
  ENOLCK: 46,
  EBADE: 113,
  EBADR: 114,
  EXFULL: 115,
  ENOANO: 104,
  EBADRQC: 103,
  EBADSLT: 102,
  EDEADLOCK: 16,
  EBFONT: 101,
  ENOSTR: 100,
  ENODATA: 116,
  ETIME: 117,
  ENOSR: 118,
  ENONET: 119,
  ENOPKG: 120,
  EREMOTE: 121,
  ENOLINK: 47,
  EADV: 122,
  ESRMNT: 123,
  ECOMM: 124,
  EPROTO: 65,
  EMULTIHOP: 36,
  EDOTDOT: 125,
  EBADMSG: 9,
  ENOTUNIQ: 126,
  EBADFD: 127,
  EREMCHG: 128,
  ELIBACC: 129,
  ELIBBAD: 130,
  ELIBSCN: 131,
  ELIBMAX: 132,
  ELIBEXEC: 133,
  ENOSYS: 52,
  ENOTEMPTY: 55,
  ENAMETOOLONG: 37,
  ELOOP: 32,
  EOPNOTSUPP: 138,
  EPFNOSUPPORT: 139,
  ECONNRESET: 15,
  ENOBUFS: 42,
  EAFNOSUPPORT: 5,
  EPROTOTYPE: 67,
  ENOTSOCK: 57,
  ENOPROTOOPT: 50,
  ESHUTDOWN: 140,
  ECONNREFUSED: 14,
  EADDRINUSE: 3,
  ECONNABORTED: 13,
  ENETUNREACH: 40,
  ENETDOWN: 38,
  ETIMEDOUT: 73,
  EHOSTDOWN: 142,
  EHOSTUNREACH: 23,
  EINPROGRESS: 26,
  EALREADY: 7,
  EDESTADDRREQ: 17,
  EMSGSIZE: 35,
  EPROTONOSUPPORT: 66,
  ESOCKTNOSUPPORT: 137,
  EADDRNOTAVAIL: 4,
  ENETRESET: 39,
  EISCONN: 30,
  ENOTCONN: 53,
  ETOOMANYREFS: 141,
  EUSERS: 136,
  EDQUOT: 19,
  ESTALE: 72,
  ENOTSUP: 138,
  ENOMEDIUM: 148,
  EILSEQ: 25,
  EOVERFLOW: 61,
  ECANCELED: 11,
  ENOTRECOVERABLE: 56,
  EOWNERDEAD: 62,
  ESTRPIPE: 135,
};
var __main_thread_futex_wait_address = 11216;
function _emscripten_futex_wake(addr, count) {
  if (addr <= 0 || addr > GROWABLE_HEAP_I8().length || addr & (3 != 0) || count < 0) return -28;
  if (count == 0) return 0;
  if (count >= 2147483647) count = Infinity;
  var mainThreadWaitAddress = Atomics.load(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2);
  var mainThreadWoken = 0;
  if (mainThreadWaitAddress == addr) {
    var loadedAddr = Atomics.compareExchange(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2, mainThreadWaitAddress, 0);
    if (loadedAddr == mainThreadWaitAddress) {
      --count;
      mainThreadWoken = 1;
      if (count <= 0) return 1;
    }
  }
  var ret = Atomics.notify(GROWABLE_HEAP_I32(), addr >> 2, count);
  if (ret >= 0) return ret + mainThreadWoken;
  throw 'Atomics.notify returned an unexpected value ' + ret;
}
function __kill_thread(pthread_ptr) {
  if (ENVIRONMENT_IS_PTHREAD) throw 'Internal Error! _kill_thread() can only ever be called from main application thread!';
  if (!pthread_ptr) throw 'Internal Error! Null pthread_ptr in _kill_thread!';
  GROWABLE_HEAP_I32()[(pthread_ptr + 12) >> 2] = 0;
  var pthread = PThread.pthreads[pthread_ptr];
  pthread.worker.terminate();
  PThread.freeThreadData(pthread);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(pthread.worker), 1);
  pthread.worker.pthread = undefined;
}
function __cancel_thread(pthread_ptr) {
  if (ENVIRONMENT_IS_PTHREAD) throw 'Internal Error! _cancel_thread() can only ever be called from main application thread!';
  if (!pthread_ptr) throw 'Internal Error! Null pthread_ptr in _cancel_thread!';
  var pthread = PThread.pthreads[pthread_ptr];
  pthread.worker.postMessage({ cmd: 'cancel' });
}
function __cleanup_thread(pthread_ptr) {
  if (ENVIRONMENT_IS_PTHREAD) throw 'Internal Error! _cleanup_thread() can only ever be called from main application thread!';
  if (!pthread_ptr) throw 'Internal Error! Null pthread_ptr in _cleanup_thread!';
  GROWABLE_HEAP_I32()[(pthread_ptr + 12) >> 2] = 0;
  var pthread = PThread.pthreads[pthread_ptr];
  if (pthread) {
    var worker = pthread.worker;
    PThread.returnWorkerToPool(worker);
  }
}
var PThread = {
  MAIN_THREAD_ID: 1,
  mainThreadInfo: { schedPolicy: 0, schedPrio: 0 },
  unusedWorkers: [],
  runningWorkers: [],
  initRuntime: function () {
    __register_pthread_ptr(PThread.mainThreadBlock, !ENVIRONMENT_IS_WORKER, 1);
    _emscripten_register_main_browser_thread_id(PThread.mainThreadBlock);
  },
  initMainThreadBlock: function () {
    var pthreadPoolSize = 1;
    for (var i = 0; i < pthreadPoolSize; ++i) {
      PThread.allocateUnusedWorker();
    }
    PThread.mainThreadBlock = 10464;
    for (var i = 0; i < 232 / 4; ++i) GROWABLE_HEAP_U32()[PThread.mainThreadBlock / 4 + i] = 0;
    GROWABLE_HEAP_I32()[(PThread.mainThreadBlock + 12) >> 2] = PThread.mainThreadBlock;
    var headPtr = PThread.mainThreadBlock + 156;
    GROWABLE_HEAP_I32()[headPtr >> 2] = headPtr;
    var tlsMemory = 10704;
    for (var i = 0; i < 128; ++i) GROWABLE_HEAP_U32()[tlsMemory / 4 + i] = 0;
    Atomics.store(GROWABLE_HEAP_U32(), (PThread.mainThreadBlock + 104) >> 2, tlsMemory);
    Atomics.store(GROWABLE_HEAP_U32(), (PThread.mainThreadBlock + 40) >> 2, PThread.mainThreadBlock);
    Atomics.store(GROWABLE_HEAP_U32(), (PThread.mainThreadBlock + 44) >> 2, 42);
  },
  initWorker: function () {},
  pthreads: {},
  exitHandlers: null,
  setThreadStatus: function () {},
  runExitHandlers: function () {
    if (PThread.exitHandlers !== null) {
      while (PThread.exitHandlers.length > 0) {
        PThread.exitHandlers.pop()();
      }
      PThread.exitHandlers = null;
    }
    if (ENVIRONMENT_IS_PTHREAD && threadInfoStruct) ___pthread_tsd_run_dtors();
  },
  threadExit: function (exitCode) {
    var tb = _pthread_self();
    if (tb) {
      Atomics.store(GROWABLE_HEAP_U32(), (tb + 4) >> 2, exitCode);
      Atomics.store(GROWABLE_HEAP_U32(), (tb + 0) >> 2, 1);
      Atomics.store(GROWABLE_HEAP_U32(), (tb + 60) >> 2, 1);
      Atomics.store(GROWABLE_HEAP_U32(), (tb + 64) >> 2, 0);
      PThread.runExitHandlers();
      _emscripten_futex_wake(tb + 0, 2147483647);
      __register_pthread_ptr(0, 0, 0);
      threadInfoStruct = 0;
      if (ENVIRONMENT_IS_PTHREAD) {
        postMessage({ cmd: 'exit' });
      }
    }
  },
  threadCancel: function () {
    PThread.runExitHandlers();
    Atomics.store(GROWABLE_HEAP_U32(), (threadInfoStruct + 4) >> 2, -1);
    Atomics.store(GROWABLE_HEAP_U32(), (threadInfoStruct + 0) >> 2, 1);
    _emscripten_futex_wake(threadInfoStruct + 0, 2147483647);
    threadInfoStruct = selfThreadId = 0;
    __register_pthread_ptr(0, 0, 0);
    postMessage({ cmd: 'cancelDone' });
  },
  terminateAllThreads: function () {
    for (var t in PThread.pthreads) {
      var pthread = PThread.pthreads[t];
      if (pthread && pthread.worker) {
        PThread.returnWorkerToPool(pthread.worker);
      }
    }
    PThread.pthreads = {};
    for (var i = 0; i < PThread.unusedWorkers.length; ++i) {
      var worker = PThread.unusedWorkers[i];
      worker.terminate();
    }
    PThread.unusedWorkers = [];
    for (var i = 0; i < PThread.runningWorkers.length; ++i) {
      var worker = PThread.runningWorkers[i];
      var pthread = worker.pthread;
      PThread.freeThreadData(pthread);
      worker.terminate();
    }
    PThread.runningWorkers = [];
  },
  freeThreadData: function (pthread) {
    if (!pthread) return;
    if (pthread.threadInfoStruct) {
      var tlsMemory = GROWABLE_HEAP_I32()[(pthread.threadInfoStruct + 104) >> 2];
      GROWABLE_HEAP_I32()[(pthread.threadInfoStruct + 104) >> 2] = 0;
      _free(tlsMemory);
      _free(pthread.threadInfoStruct);
    }
    pthread.threadInfoStruct = 0;
    if (pthread.allocatedOwnStack && pthread.stackBase) _free(pthread.stackBase);
    pthread.stackBase = 0;
    if (pthread.worker) pthread.worker.pthread = null;
  },
  returnWorkerToPool: function (worker) {
    delete PThread.pthreads[worker.pthread.thread];
    PThread.unusedWorkers.push(worker);
    PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
    PThread.freeThreadData(worker.pthread);
    worker.pthread = undefined;
  },
  receiveObjectTransfer: function (data) {},
  loadWasmModuleToWorker: function (worker, onFinishedLoading) {
    worker.onmessage = function (e) {
      var d = e['data'];
      var cmd = d['cmd'];
      if (worker.pthread) PThread.currentProxiedOperationCallerThread = worker.pthread.threadInfoStruct;
      if (d['targetThread'] && d['targetThread'] != _pthread_self()) {
        var thread = PThread.pthreads[d.targetThread];
        if (thread) {
          thread.worker.postMessage(e.data, d['transferList']);
        } else {
          console.error('Internal error! Worker sent a message "' + cmd + '" to target pthread ' + d['targetThread'] + ', but that thread no longer exists!');
        }
        PThread.currentProxiedOperationCallerThread = undefined;
        return;
      }
      if (cmd === 'processQueuedMainThreadWork') {
        _emscripten_main_thread_process_queued_calls();
      } else if (cmd === 'spawnThread') {
        __spawn_thread(e.data);
      } else if (cmd === 'cleanupThread') {
        __cleanup_thread(d['thread']);
      } else if (cmd === 'killThread') {
        __kill_thread(d['thread']);
      } else if (cmd === 'cancelThread') {
        __cancel_thread(d['thread']);
      } else if (cmd === 'loaded') {
        worker.loaded = true;
        if (onFinishedLoading) onFinishedLoading(worker);
        if (worker.runPthread) {
          worker.runPthread();
          delete worker.runPthread;
        }
      } else if (cmd === 'print') {
        out('Thread ' + d['threadId'] + ': ' + d['text']);
      } else if (cmd === 'printErr') {
        err('Thread ' + d['threadId'] + ': ' + d['text']);
      } else if (cmd === 'alert') {
        alert('Thread ' + d['threadId'] + ': ' + d['text']);
      } else if (cmd === 'exit') {
        var detached = worker.pthread && Atomics.load(GROWABLE_HEAP_U32(), (worker.pthread.thread + 68) >> 2);
        if (detached) {
          PThread.returnWorkerToPool(worker);
        }
      } else if (cmd === 'cancelDone') {
        PThread.returnWorkerToPool(worker);
      } else if (cmd === 'objectTransfer') {
        PThread.receiveObjectTransfer(e.data);
      } else if (e.data.target === 'setimmediate') {
        worker.postMessage(e.data);
      } else {
        err('worker sent an unknown command ' + cmd);
      }
      PThread.currentProxiedOperationCallerThread = undefined;
    };
    worker.onerror = function (e) {
      err('pthread sent an error! ' + e.filename + ':' + e.lineno + ': ' + e.message);
    };
    if (ENVIRONMENT_IS_NODE) {
      worker.on('message', function (data) {
        worker.onmessage({ data: data });
      });
      worker.on('error', function (data) {
        worker.onerror(data);
      });
      worker.on('exit', function (data) {
        console.log('worker exited - TODO: update the worker queue?');
      });
    }
    worker.postMessage({
      cmd: 'load',
      urlOrBlob: Module['mainScriptUrlOrBlob'] || _scriptDir,
      wasmMemory: wasmMemory,
      wasmModule: wasmModule,
      DYNAMIC_BASE: DYNAMIC_BASE,
      DYNAMICTOP_PTR: DYNAMICTOP_PTR,
    });
  },
  allocateUnusedWorker: function () {
    var pthreadMainJs = locateFile('MemGrow.worker.js');
    PThread.unusedWorkers.push(new Worker(pthreadMainJs));
  },
  getNewWorker: function () {
    if (PThread.unusedWorkers.length == 0) {
      PThread.allocateUnusedWorker();
      PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
    }
    if (PThread.unusedWorkers.length > 0) return PThread.unusedWorkers.pop();
    else return null;
  },
  busySpinWait: function (msecs) {
    var t = performance.now() + msecs;
    while (performance.now() < t) {}
  },
};
function establishStackSpace(stackTop, stackMax) {
  STACK_BASE = STACKTOP = stackTop;
  STACK_MAX = stackMax;
  tempDoublePtr = STACK_BASE;
  STACK_BASE += 16;
  STACKTOP += 16;
  asmJsEstablishStackFrame(stackTop, stackMax);
}
Module['establishStackSpace'] = establishStackSpace;
function getNoExitRuntime() {
  return noExitRuntime;
}
Module['getNoExitRuntime'] = getNoExitRuntime;
function ___assert_fail(condition, filename, line, func) {
  abort(
    'Assertion failed: ' +
      UTF8ToString(condition) +
      ', at: ' +
      [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function'],
  );
}
var _emscripten_get_now;
if (ENVIRONMENT_IS_NODE) {
  _emscripten_get_now = function () {
    var t = process['hrtime']();
    return t[0] * 1e3 + t[1] / 1e6;
  };
} else if (ENVIRONMENT_IS_PTHREAD) {
  _emscripten_get_now = function () {
    return performance.now() - Module['__performance_now_clock_drift'];
  };
} else if (typeof dateNow !== 'undefined') {
  _emscripten_get_now = dateNow;
} else
  _emscripten_get_now = function () {
    return performance.now();
  };
function ___cxa_allocate_exception(size) {
  return _malloc(size);
}
var ___exception_infos = {};
var ___exception_caught = [];
function ___exception_addRef(ptr) {
  if (!ptr) return;
  var info = ___exception_infos[ptr];
  info.refcount++;
}
function ___exception_deAdjust(adjusted) {
  if (!adjusted || ___exception_infos[adjusted]) return adjusted;
  for (var key in ___exception_infos) {
    var ptr = +key;
    var adj = ___exception_infos[ptr].adjusted;
    var len = adj.length;
    for (var i = 0; i < len; i++) {
      if (adj[i] === adjusted) {
        return ptr;
      }
    }
  }
  return adjusted;
}
function ___cxa_begin_catch(ptr) {
  var info = ___exception_infos[ptr];
  if (info && !info.caught) {
    info.caught = true;
    __ZSt18uncaught_exceptionv.uncaught_exceptions--;
  }
  if (info) info.rethrown = false;
  ___exception_caught.push(ptr);
  ___exception_addRef(___exception_deAdjust(ptr));
  return ptr;
}
var ___exception_last = 0;
function ___cxa_free_exception(ptr) {
  try {
    return _free(ptr);
  } catch (e) {}
}
function ___exception_decRef(ptr) {
  if (!ptr) return;
  var info = ___exception_infos[ptr];
  info.refcount--;
  if (info.refcount === 0 && !info.rethrown) {
    if (info.destructor) {
      Module['dynCall_vi'](info.destructor, ptr);
    }
    delete ___exception_infos[ptr];
    ___cxa_free_exception(ptr);
  }
}
function ___cxa_end_catch() {
  _setThrew(0);
  var ptr = ___exception_caught.pop();
  if (ptr) {
    ___exception_decRef(___exception_deAdjust(ptr));
    ___exception_last = 0;
  }
}
function ___cxa_find_matching_catch_2() {
  var thrown = ___exception_last;
  if (!thrown) {
    return (setTempRet0(0), 0) | 0;
  }
  var info = ___exception_infos[thrown];
  var throwntype = info.type;
  if (!throwntype) {
    return (setTempRet0(0), thrown) | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  var pointer = ___cxa_is_pointer_type(throwntype);
  var buffer = 10448;
  GROWABLE_HEAP_I32()[buffer >> 2] = thrown;
  thrown = buffer;
  for (var i = 0; i < typeArray.length; i++) {
    if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
      thrown = GROWABLE_HEAP_I32()[thrown >> 2];
      info.adjusted.push(thrown);
      return (setTempRet0(typeArray[i]), thrown) | 0;
    }
  }
  thrown = GROWABLE_HEAP_I32()[thrown >> 2];
  return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_find_matching_catch_3() {
  var thrown = ___exception_last;
  if (!thrown) {
    return (setTempRet0(0), 0) | 0;
  }
  var info = ___exception_infos[thrown];
  var throwntype = info.type;
  if (!throwntype) {
    return (setTempRet0(0), thrown) | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  var pointer = ___cxa_is_pointer_type(throwntype);
  var buffer = 10448;
  GROWABLE_HEAP_I32()[buffer >> 2] = thrown;
  thrown = buffer;
  for (var i = 0; i < typeArray.length; i++) {
    if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
      thrown = GROWABLE_HEAP_I32()[thrown >> 2];
      info.adjusted.push(thrown);
      return (setTempRet0(typeArray[i]), thrown) | 0;
    }
  }
  thrown = GROWABLE_HEAP_I32()[thrown >> 2];
  return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_throw(ptr, type, destructor) {
  ___exception_infos[ptr] = {
    ptr: ptr,
    adjusted: [ptr],
    type: type,
    destructor: destructor,
    refcount: 0,
    caught: false,
    rethrown: false,
  };
  ___exception_last = ptr;
  if (!('uncaught_exception' in __ZSt18uncaught_exceptionv)) {
    __ZSt18uncaught_exceptionv.uncaught_exceptions = 1;
  } else {
    __ZSt18uncaught_exceptionv.uncaught_exceptions++;
  }
  throw ptr;
}
function ___cxa_uncaught_exceptions() {
  return __ZSt18uncaught_exceptionv.uncaught_exceptions;
}
function ___resumeException(ptr) {
  if (!___exception_last) {
    ___exception_last = ptr;
  }
  throw ptr;
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
var SYSCALLS = {
  mappings: {},
  buffers: [null, [], []],
  printChar: function (stream, curr) {
    var buffer = SYSCALLS.buffers[stream];
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
      buffer.length = 0;
    } else {
      buffer.push(curr);
    }
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4;
    var ret = GROWABLE_HEAP_I32()[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
  get64: function (low, high) {
    return low;
  },
};
function _fd_close(fd) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(1, 1, fd);
  return 0;
}
function ___wasi_fd_close(a0) {
  return _fd_close(a0);
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(2, 1, fd, offset_low, offset_high, whence, newOffset);
}
function ___wasi_fd_seek(a0, a1, a2, a3, a4) {
  return _fd_seek(a0, a1, a2, a3, a4);
}
function _fd_write(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(3, 1, fd, iov, iovcnt, pnum);
  var num = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = GROWABLE_HEAP_I32()[(iov + i * 8) >> 2];
    var len = GROWABLE_HEAP_I32()[(iov + (i * 8 + 4)) >> 2];
    for (var j = 0; j < len; j++) {
      SYSCALLS.printChar(fd, GROWABLE_HEAP_U8()[ptr + j]);
    }
    num += len;
  }
  GROWABLE_HEAP_I32()[pnum >> 2] = num;
  return 0;
}
function ___wasi_fd_write(a0, a1, a2, a3) {
  return _fd_write(a0, a1, a2, a3);
}
function __emscripten_notify_thread_queue(targetThreadId, mainThreadId) {
  if (targetThreadId == mainThreadId) {
    postMessage({ cmd: 'processQueuedMainThreadWork' });
  } else if (ENVIRONMENT_IS_PTHREAD) {
    postMessage({ targetThread: targetThreadId, cmd: 'processThreadQueue' });
  } else {
    var pthread = PThread.pthreads[targetThreadId];
    var worker = pthread && pthread.worker;
    if (!worker) {
      return;
    }
    worker.postMessage({ cmd: 'processThreadQueue' });
  }
  return 1;
}
function _abort() {
  abort();
}
function _emscripten_check_blocking_allowed() {
  if (ENVIRONMENT_IS_NODE) return;
  if (ENVIRONMENT_IS_PTHREAD) return;
  warnOnce('Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread');
}
function _emscripten_futex_wait(addr, val, timeout) {
  if (addr <= 0 || addr > GROWABLE_HEAP_I8().length || addr & (3 != 0)) return -28;
  if (ENVIRONMENT_IS_WORKER) {
    var ret = Atomics.wait(GROWABLE_HEAP_I32(), addr >> 2, val, timeout);
    if (ret === 'timed-out') return -73;
    if (ret === 'not-equal') return -6;
    if (ret === 'ok') return 0;
    throw 'Atomics.wait returned an unexpected value ' + ret;
  } else {
    var loadedVal = Atomics.load(GROWABLE_HEAP_I32(), addr >> 2);
    if (val != loadedVal) return -6;
    var tNow = performance.now();
    var tEnd = tNow + timeout;
    Atomics.store(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2, addr);
    var ourWaitAddress = addr;
    while (addr == ourWaitAddress) {
      tNow = performance.now();
      if (tNow > tEnd) {
        return -73;
      }
      _emscripten_main_thread_process_queued_calls();
      addr = Atomics.load(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2);
    }
    return 0;
  }
}
function _emscripten_get_heap_size() {
  return GROWABLE_HEAP_U8().length;
}
function _emscripten_proxy_to_main_thread_js(index, sync) {
  var numCallArgs = arguments.length - 2;
  var stack = stackSave();
  var args = stackAlloc(numCallArgs * 8);
  var b = args >> 3;
  for (var i = 0; i < numCallArgs; i++) {
    GROWABLE_HEAP_F64()[b + i] = arguments[2 + i];
  }
  var ret = _emscripten_run_in_main_runtime_thread_js(index, numCallArgs, args, sync);
  stackRestore(stack);
  return ret;
}
var _emscripten_receive_on_main_thread_js_callArgs = [];
function _emscripten_receive_on_main_thread_js(index, numCallArgs, args) {
  _emscripten_receive_on_main_thread_js_callArgs.length = numCallArgs;
  var b = args >> 3;
  for (var i = 0; i < numCallArgs; i++) {
    _emscripten_receive_on_main_thread_js_callArgs[i] = GROWABLE_HEAP_F64()[b + i];
  }
  var isEmAsmConst = index < 0;
  var func = !isEmAsmConst ? proxiedFunctionTable[index] : ASM_CONSTS[-index - 1];
  return func.apply(null, _emscripten_receive_on_main_thread_js_callArgs);
}
function emscripten_realloc_buffer(size) {
  try {
    wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
    updateGlobalBufferAndViews(wasmMemory.buffer);
    return 1;
  } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = _emscripten_get_heap_size();
  if (requestedSize <= oldSize) {
    return false;
  }
  var PAGE_MULTIPLE = 65536;
  var maxHeapSize = 2147483648;
  if (requestedSize > maxHeapSize) {
    return false;
  }
  var minHeapSize = 16777216;
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), PAGE_MULTIPLE));
    var replacement = emscripten_realloc_buffer(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
}
var JSEvents = {
  keyEvent: 0,
  mouseEvent: 0,
  wheelEvent: 0,
  uiEvent: 0,
  focusEvent: 0,
  deviceOrientationEvent: 0,
  deviceMotionEvent: 0,
  fullscreenChangeEvent: 0,
  pointerlockChangeEvent: 0,
  visibilityChangeEvent: 0,
  touchEvent: 0,
  previousFullscreenElement: null,
  previousScreenX: null,
  previousScreenY: null,
  removeEventListenersRegistered: false,
  removeAllEventListeners: function () {
    for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
      JSEvents._removeHandler(i);
    }
    JSEvents.eventHandlers = [];
    JSEvents.deferredCalls = [];
  },
  registerRemoveEventListeners: function () {
    if (!JSEvents.removeEventListenersRegistered) {
      __ATEXIT__.push(JSEvents.removeAllEventListeners);
      JSEvents.removeEventListenersRegistered = true;
    }
  },
  deferredCalls: [],
  deferCall: function (targetFunction, precedence, argsList) {
    function arraysHaveEqualContent(arrA, arrB) {
      if (arrA.length != arrB.length) return false;
      for (var i in arrA) {
        if (arrA[i] != arrB[i]) return false;
      }
      return true;
    }
    for (var i in JSEvents.deferredCalls) {
      var call = JSEvents.deferredCalls[i];
      if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
        return;
      }
    }
    JSEvents.deferredCalls.push({
      targetFunction: targetFunction,
      precedence: precedence,
      argsList: argsList,
    });
    JSEvents.deferredCalls.sort(function (x, y) {
      return x.precedence < y.precedence;
    });
  },
  removeDeferredCalls: function (targetFunction) {
    for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
      if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
        JSEvents.deferredCalls.splice(i, 1);
        --i;
      }
    }
  },
  canPerformEventHandlerRequests: function () {
    return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
  },
  runDeferredCalls: function () {
    if (!JSEvents.canPerformEventHandlerRequests()) {
      return;
    }
    for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
      var call = JSEvents.deferredCalls[i];
      JSEvents.deferredCalls.splice(i, 1);
      --i;
      call.targetFunction.apply(null, call.argsList);
    }
  },
  inEventHandler: 0,
  currentEventHandler: null,
  eventHandlers: [],
  removeAllHandlersOnTarget: function (target, eventTypeString) {
    for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
      if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
        JSEvents._removeHandler(i--);
      }
    }
  },
  _removeHandler: function (i) {
    var h = JSEvents.eventHandlers[i];
    h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
    JSEvents.eventHandlers.splice(i, 1);
  },
  registerOrRemoveHandler: function (eventHandler) {
    var jsEventHandler = function jsEventHandler(event) {
      ++JSEvents.inEventHandler;
      JSEvents.currentEventHandler = eventHandler;
      JSEvents.runDeferredCalls();
      eventHandler.handlerFunc(event);
      JSEvents.runDeferredCalls();
      --JSEvents.inEventHandler;
    };
    if (eventHandler.callbackfunc) {
      eventHandler.eventListenerFunc = jsEventHandler;
      eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
      JSEvents.eventHandlers.push(eventHandler);
      JSEvents.registerRemoveEventListeners();
    } else {
      for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
        if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
          JSEvents._removeHandler(i--);
        }
      }
    }
  },
  queueEventHandlerOnThread_iiii: function (targetThread, eventHandlerFunc, eventTypeId, eventData, userData) {
    var stackTop = stackSave();
    var varargs = stackAlloc(12);
    GROWABLE_HEAP_I32()[varargs >> 2] = eventTypeId;
    GROWABLE_HEAP_I32()[(varargs + 4) >> 2] = eventData;
    GROWABLE_HEAP_I32()[(varargs + 8) >> 2] = userData;
    _emscripten_async_queue_on_thread_(targetThread, 637534208, eventHandlerFunc, eventData, varargs);
    stackRestore(stackTop);
  },
  getTargetThreadForEventCallback: function (targetThread) {
    switch (targetThread) {
      case 1:
        return 0;
      case 2:
        return PThread.currentProxiedOperationCallerThread;
      default:
        return targetThread;
    }
  },
  getNodeNameForTarget: function (target) {
    if (!target) return '';
    if (target == window) return '#window';
    if (target == screen) return '#screen';
    return target && target.nodeName ? target.nodeName : '';
  },
  fullscreenEnabled: function () {
    return document.fullscreenEnabled || document.webkitFullscreenEnabled;
  },
};
function stringToNewUTF8(jsString) {
  var length = lengthBytesUTF8(jsString) + 1;
  var cString = _malloc(length);
  stringToUTF8(jsString, cString, length);
  return cString;
}
function _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height) {
  var stackTop = stackSave();
  var varargs = stackAlloc(12);
  var targetCanvasPtr = 0;
  if (targetCanvas) {
    targetCanvasPtr = stringToNewUTF8(targetCanvas);
  }
  GROWABLE_HEAP_I32()[varargs >> 2] = targetCanvasPtr;
  GROWABLE_HEAP_I32()[(varargs + 4) >> 2] = width;
  GROWABLE_HEAP_I32()[(varargs + 8) >> 2] = height;
  _emscripten_async_queue_on_thread_(targetThread, 657457152, 0, targetCanvasPtr, varargs);
  stackRestore(stackTop);
}
function _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, targetCanvas, width, height) {
  targetCanvas = targetCanvas ? UTF8ToString(targetCanvas) : '';
  _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height);
}
function __maybeCStringToJsString(cString) {
  return cString === cString + 0 ? UTF8ToString(cString) : cString;
}
var __specialEventTargets = [0, typeof document !== 'undefined' ? document : 0, typeof window !== 'undefined' ? window : 0];
function __findEventTarget(target) {
  var domElement = __specialEventTargets[target] || (typeof document !== 'undefined' ? document.querySelector(__maybeCStringToJsString(target)) : undefined);
  return domElement;
}
function __findCanvasEventTarget(target) {
  return __findEventTarget(target);
}
function _emscripten_set_canvas_element_size_calling_thread(target, width, height) {
  var canvas = __findCanvasEventTarget(target);
  if (!canvas) return -4;
  if (canvas.canvasSharedPtr) {
    GROWABLE_HEAP_I32()[canvas.canvasSharedPtr >> 2] = width;
    GROWABLE_HEAP_I32()[(canvas.canvasSharedPtr + 4) >> 2] = height;
  }
  if (canvas.offscreenCanvas || !canvas.controlTransferredOffscreen) {
    if (canvas.offscreenCanvas) canvas = canvas.offscreenCanvas;
    var autoResizeViewport = false;
    if (canvas.GLctxObject && canvas.GLctxObject.GLctx) {
      var prevViewport = canvas.GLctxObject.GLctx.getParameter(2978);
      autoResizeViewport = prevViewport[0] === 0 && prevViewport[1] === 0 && prevViewport[2] === canvas.width && prevViewport[3] === canvas.height;
    }
    canvas.width = width;
    canvas.height = height;
    if (autoResizeViewport) {
      canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
    }
  } else if (canvas.canvasSharedPtr) {
    var targetThread = GROWABLE_HEAP_I32()[(canvas.canvasSharedPtr + 8) >> 2];
    _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, target, width, height);
    return 1;
  } else {
    return -4;
  }
  return 0;
}
function _emscripten_set_canvas_element_size_main_thread(target, width, height) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(4, 1, target, width, height);
  return _emscripten_set_canvas_element_size_calling_thread(target, width, height);
}
function _emscripten_set_canvas_element_size(target, width, height) {
  var canvas = __findCanvasEventTarget(target);
  if (canvas) {
    return _emscripten_set_canvas_element_size_calling_thread(target, width, height);
  } else {
    return _emscripten_set_canvas_element_size_main_thread(target, width, height);
  }
}
function __webgl_acquireInstancedArraysExtension(ctx) {
  var ext = ctx.getExtension('ANGLE_instanced_arrays');
  if (ext) {
    ctx['vertexAttribDivisor'] = function (index, divisor) {
      ext['vertexAttribDivisorANGLE'](index, divisor);
    };
    ctx['drawArraysInstanced'] = function (mode, first, count, primcount) {
      ext['drawArraysInstancedANGLE'](mode, first, count, primcount);
    };
    ctx['drawElementsInstanced'] = function (mode, count, type, indices, primcount) {
      ext['drawElementsInstancedANGLE'](mode, count, type, indices, primcount);
    };
  }
}
function __webgl_acquireVertexArrayObjectExtension(ctx) {
  var ext = ctx.getExtension('OES_vertex_array_object');
  if (ext) {
    ctx['createVertexArray'] = function () {
      return ext['createVertexArrayOES']();
    };
    ctx['deleteVertexArray'] = function (vao) {
      ext['deleteVertexArrayOES'](vao);
    };
    ctx['bindVertexArray'] = function (vao) {
      ext['bindVertexArrayOES'](vao);
    };
    ctx['isVertexArray'] = function (vao) {
      return ext['isVertexArrayOES'](vao);
    };
  }
}
function __webgl_acquireDrawBuffersExtension(ctx) {
  var ext = ctx.getExtension('WEBGL_draw_buffers');
  if (ext) {
    ctx['drawBuffers'] = function (n, bufs) {
      ext['drawBuffersWEBGL'](n, bufs);
    };
  }
}
var GL = {
  counter: 1,
  lastError: 0,
  buffers: [],
  mappedBuffers: {},
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  uniforms: [],
  shaders: [],
  vaos: [],
  contexts: {},
  currentContext: null,
  offscreenCanvases: {},
  timerQueriesEXT: [],
  programInfos: {},
  stringCache: {},
  unpackAlignment: 4,
  init: function () {
    var miniTempFloatBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
    for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
      GL.miniTempBufferFloatViews[i] = miniTempFloatBuffer.subarray(0, i + 1);
    }
    var miniTempIntBuffer = new Int32Array(GL.MINI_TEMP_BUFFER_SIZE);
    for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
      GL.miniTempBufferIntViews[i] = miniTempIntBuffer.subarray(0, i + 1);
    }
  },
  recordError: function recordError(errorCode) {
    if (!GL.lastError) {
      GL.lastError = errorCode;
    }
  },
  getNewId: function (table) {
    var ret = GL.counter++;
    for (var i = table.length; i < ret; i++) {
      table[i] = null;
    }
    return ret;
  },
  MINI_TEMP_BUFFER_SIZE: 256,
  miniTempBufferFloatViews: [0],
  miniTempBufferIntViews: [0],
  getSource: function (shader, count, string, length) {
    var source = '';
    for (var i = 0; i < count; ++i) {
      var len = length ? GROWABLE_HEAP_I32()[(length + i * 4) >> 2] : -1;
      source += UTF8ToString(GROWABLE_HEAP_I32()[(string + i * 4) >> 2], len < 0 ? undefined : len);
    }
    return source;
  },
  createContext: function (canvas, webGLContextAttributes) {
    var ctx = canvas.getContext('webgl', webGLContextAttributes);
    if (!ctx) return 0;
    var handle = GL.registerContext(ctx, webGLContextAttributes);
    return handle;
  },
  registerContext: function (ctx, webGLContextAttributes) {
    var handle = _malloc(8);
    GROWABLE_HEAP_I32()[(handle + 4) >> 2] = _pthread_self();
    var context = {
      handle: handle,
      attributes: webGLContextAttributes,
      version: webGLContextAttributes.majorVersion,
      GLctx: ctx,
    };
    if (ctx.canvas) ctx.canvas.GLctxObject = context;
    GL.contexts[handle] = context;
    if (typeof webGLContextAttributes.enableExtensionsByDefault === 'undefined' || webGLContextAttributes.enableExtensionsByDefault) {
      GL.initExtensions(context);
    }
    return handle;
  },
  makeContextCurrent: function (contextHandle) {
    GL.currentContext = GL.contexts[contextHandle];
    Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
    return !(contextHandle && !GLctx);
  },
  getContext: function (contextHandle) {
    return GL.contexts[contextHandle];
  },
  deleteContext: function (contextHandle) {
    if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
    if (typeof JSEvents === 'object') JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
    if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
    _free(GL.contexts[contextHandle].handle);
    GL.contexts[contextHandle] = null;
  },
  initExtensions: function (context) {
    if (!context) context = GL.currentContext;
    if (context.initExtensionsDone) return;
    context.initExtensionsDone = true;
    var GLctx = context.GLctx;
    if (context.version < 2) {
      __webgl_acquireInstancedArraysExtension(GLctx);
      __webgl_acquireVertexArrayObjectExtension(GLctx);
      __webgl_acquireDrawBuffersExtension(GLctx);
    }
    GLctx.disjointTimerQueryExt = GLctx.getExtension('EXT_disjoint_timer_query');
    var automaticallyEnabledExtensions = [
      'OES_texture_float',
      'OES_texture_half_float',
      'OES_standard_derivatives',
      'OES_vertex_array_object',
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_depth_texture',
      'OES_element_index_uint',
      'EXT_texture_filter_anisotropic',
      'EXT_frag_depth',
      'WEBGL_draw_buffers',
      'ANGLE_instanced_arrays',
      'OES_texture_float_linear',
      'OES_texture_half_float_linear',
      'EXT_blend_minmax',
      'EXT_shader_texture_lod',
      'EXT_texture_norm16',
      'WEBGL_compressed_texture_pvrtc',
      'EXT_color_buffer_half_float',
      'WEBGL_color_buffer_float',
      'EXT_sRGB',
      'WEBGL_compressed_texture_etc1',
      'EXT_disjoint_timer_query',
      'WEBGL_compressed_texture_etc',
      'WEBGL_compressed_texture_astc',
      'EXT_color_buffer_float',
      'WEBGL_compressed_texture_s3tc_srgb',
      'EXT_disjoint_timer_query_webgl2',
      'WEBKIT_WEBGL_compressed_texture_pvrtc',
    ];
    var exts = GLctx.getSupportedExtensions() || [];
    exts.forEach(function (ext) {
      if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
        GLctx.getExtension(ext);
      }
    });
  },
  populateUniformTable: function (program) {
    var p = GL.programs[program];
    var ptable = (GL.programInfos[program] = {
      uniforms: {},
      maxUniformLength: 0,
      maxAttributeLength: -1,
      maxUniformBlockNameLength: -1,
    });
    var utable = ptable.uniforms;
    var numUniforms = GLctx.getProgramParameter(p, 35718);
    for (var i = 0; i < numUniforms; ++i) {
      var u = GLctx.getActiveUniform(p, i);
      var name = u.name;
      ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
      if (name.slice(-1) == ']') {
        name = name.slice(0, name.lastIndexOf('['));
      }
      var loc = GLctx.getUniformLocation(p, name);
      if (loc) {
        var id = GL.getNewId(GL.uniforms);
        utable[name] = [u.size, id];
        GL.uniforms[id] = loc;
        for (var j = 1; j < u.size; ++j) {
          var n = name + '[' + j + ']';
          loc = GLctx.getUniformLocation(p, n);
          id = GL.getNewId(GL.uniforms);
          GL.uniforms[id] = loc;
        }
      }
    }
  },
};
var __emscripten_webgl_power_preferences = ['default', 'low-power', 'high-performance'];
function _emscripten_webgl_do_create_context(target, attributes) {
  var contextAttributes = {};
  var a = attributes >> 2;
  contextAttributes['alpha'] = !!GROWABLE_HEAP_I32()[a + (0 >> 2)];
  contextAttributes['depth'] = !!GROWABLE_HEAP_I32()[a + (4 >> 2)];
  contextAttributes['stencil'] = !!GROWABLE_HEAP_I32()[a + (8 >> 2)];
  contextAttributes['antialias'] = !!GROWABLE_HEAP_I32()[a + (12 >> 2)];
  contextAttributes['premultipliedAlpha'] = !!GROWABLE_HEAP_I32()[a + (16 >> 2)];
  contextAttributes['preserveDrawingBuffer'] = !!GROWABLE_HEAP_I32()[a + (20 >> 2)];
  var powerPreference = GROWABLE_HEAP_I32()[a + (24 >> 2)];
  contextAttributes['powerPreference'] = __emscripten_webgl_power_preferences[powerPreference];
  contextAttributes['failIfMajorPerformanceCaveat'] = !!GROWABLE_HEAP_I32()[a + (28 >> 2)];
  contextAttributes.majorVersion = GROWABLE_HEAP_I32()[a + (32 >> 2)];
  contextAttributes.minorVersion = GROWABLE_HEAP_I32()[a + (36 >> 2)];
  contextAttributes.enableExtensionsByDefault = GROWABLE_HEAP_I32()[a + (40 >> 2)];
  contextAttributes.explicitSwapControl = GROWABLE_HEAP_I32()[a + (44 >> 2)];
  contextAttributes.proxyContextToMainThread = GROWABLE_HEAP_I32()[a + (48 >> 2)];
  contextAttributes.renderViaOffscreenBackBuffer = GROWABLE_HEAP_I32()[a + (52 >> 2)];
  var canvas = __findCanvasEventTarget(target);
  if (!canvas) {
    return 0;
  }
  if (contextAttributes.explicitSwapControl) {
    return 0;
  }
  var contextHandle = GL.createContext(canvas, contextAttributes);
  return contextHandle;
}
function _emscripten_webgl_create_context(a0, a1) {
  return _emscripten_webgl_do_create_context(a0, a1);
}
function _emscripten_memcpy_big(dest, src, num) {
  GROWABLE_HEAP_U8().copyWithin(dest, src, src + num);
}
function _pthread_cleanup_pop(execute) {
  var routine = PThread.exitHandlers.pop();
  if (execute) routine();
}
function _pthread_cleanup_push(routine, arg) {
  if (PThread.exitHandlers === null) {
    PThread.exitHandlers = [];
  }
  PThread.exitHandlers.push(function () {
    dynCall_vi(routine, arg);
  });
}
function __spawn_thread(threadParams) {
  if (ENVIRONMENT_IS_PTHREAD) throw 'Internal Error! _spawn_thread() can only ever be called from main application thread!';
  var worker = PThread.getNewWorker();
  if (worker.pthread !== undefined) throw 'Internal error!';
  if (!threadParams.pthread_ptr) throw 'Internal error, no pthread ptr!';
  PThread.runningWorkers.push(worker);
  var tlsMemory = _malloc(128 * 4);
  for (var i = 0; i < 128; ++i) {
    GROWABLE_HEAP_I32()[(tlsMemory + i * 4) >> 2] = 0;
  }
  var stackHigh = threadParams.stackBase + threadParams.stackSize;
  var pthread = (PThread.pthreads[threadParams.pthread_ptr] = {
    worker: worker,
    stackBase: threadParams.stackBase,
    stackSize: threadParams.stackSize,
    allocatedOwnStack: threadParams.allocatedOwnStack,
    thread: threadParams.pthread_ptr,
    threadInfoStruct: threadParams.pthread_ptr,
  });
  var tis = pthread.threadInfoStruct >> 2;
  Atomics.store(GROWABLE_HEAP_U32(), tis + (0 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (4 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (8 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (68 >> 2), threadParams.detached);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (104 >> 2), tlsMemory);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (48 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (40 >> 2), pthread.threadInfoStruct);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (44 >> 2), 42);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (108 >> 2), threadParams.stackSize);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (84 >> 2), threadParams.stackSize);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (80 >> 2), stackHigh);
  Atomics.store(GROWABLE_HEAP_U32(), tis + ((108 + 8) >> 2), stackHigh);
  Atomics.store(GROWABLE_HEAP_U32(), tis + ((108 + 12) >> 2), threadParams.detached);
  Atomics.store(GROWABLE_HEAP_U32(), tis + ((108 + 20) >> 2), threadParams.schedPolicy);
  Atomics.store(GROWABLE_HEAP_U32(), tis + ((108 + 24) >> 2), threadParams.schedPrio);
  var global_libc = _emscripten_get_global_libc();
  var global_locale = global_libc + 40;
  Atomics.store(GROWABLE_HEAP_U32(), tis + (176 >> 2), global_locale);
  worker.pthread = pthread;
  var msg = {
    cmd: 'run',
    start_routine: threadParams.startRoutine,
    arg: threadParams.arg,
    threadInfoStruct: threadParams.pthread_ptr,
    selfThreadId: threadParams.pthread_ptr,
    parentThreadId: threadParams.parent_pthread_ptr,
    stackBase: threadParams.stackBase,
    stackSize: threadParams.stackSize,
  };
  worker.runPthread = function () {
    msg.time = performance.now();
    worker.postMessage(msg, threadParams.transferList);
  };
  if (worker.loaded) {
    worker.runPthread();
    delete worker.runPthread;
  }
}
function _pthread_getschedparam(thread, policy, schedparam) {
  if (!policy && !schedparam) return ERRNO_CODES.EINVAL;
  if (!thread) {
    err('pthread_getschedparam called with a null thread pointer!');
    return ERRNO_CODES.ESRCH;
  }
  var self = GROWABLE_HEAP_I32()[(thread + 12) >> 2];
  if (self !== thread) {
    err('pthread_getschedparam attempted on thread ' + thread + ', which does not point to a valid thread, or does not exist anymore!');
    return ERRNO_CODES.ESRCH;
  }
  var schedPolicy = Atomics.load(GROWABLE_HEAP_U32(), (thread + 108 + 20) >> 2);
  var schedPrio = Atomics.load(GROWABLE_HEAP_U32(), (thread + 108 + 24) >> 2);
  if (policy) GROWABLE_HEAP_I32()[policy >> 2] = schedPolicy;
  if (schedparam) GROWABLE_HEAP_I32()[schedparam >> 2] = schedPrio;
  return 0;
}
function _pthread_create(pthread_ptr, attr, start_routine, arg) {
  if (typeof SharedArrayBuffer === 'undefined') {
    err('Current environment does not support SharedArrayBuffer, pthreads are not available!');
    return 6;
  }
  if (!pthread_ptr) {
    err('pthread_create called with a null thread pointer!');
    return 28;
  }
  var transferList = [];
  var error = 0;
  if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
    return _emscripten_sync_run_in_main_thread_4(687865856, pthread_ptr, attr, start_routine, arg);
  }
  if (error) return error;
  var stackSize = 0;
  var stackBase = 0;
  var detached = 0;
  var schedPolicy = 0;
  var schedPrio = 0;
  if (attr) {
    stackSize = GROWABLE_HEAP_I32()[attr >> 2];
    stackSize += 81920;
    stackBase = GROWABLE_HEAP_I32()[(attr + 8) >> 2];
    detached = GROWABLE_HEAP_I32()[(attr + 12) >> 2] !== 0;
    var inheritSched = GROWABLE_HEAP_I32()[(attr + 16) >> 2] === 0;
    if (inheritSched) {
      var prevSchedPolicy = GROWABLE_HEAP_I32()[(attr + 20) >> 2];
      var prevSchedPrio = GROWABLE_HEAP_I32()[(attr + 24) >> 2];
      var parentThreadPtr = PThread.currentProxiedOperationCallerThread ? PThread.currentProxiedOperationCallerThread : _pthread_self();
      _pthread_getschedparam(parentThreadPtr, attr + 20, attr + 24);
      schedPolicy = GROWABLE_HEAP_I32()[(attr + 20) >> 2];
      schedPrio = GROWABLE_HEAP_I32()[(attr + 24) >> 2];
      GROWABLE_HEAP_I32()[(attr + 20) >> 2] = prevSchedPolicy;
      GROWABLE_HEAP_I32()[(attr + 24) >> 2] = prevSchedPrio;
    } else {
      schedPolicy = GROWABLE_HEAP_I32()[(attr + 20) >> 2];
      schedPrio = GROWABLE_HEAP_I32()[(attr + 24) >> 2];
    }
  } else {
    stackSize = 2097152;
  }
  var allocatedOwnStack = stackBase == 0;
  if (allocatedOwnStack) {
    stackBase = _memalign(16, stackSize);
  } else {
    stackBase -= stackSize;
    assert(stackBase > 0);
  }
  var threadInfoStruct = _malloc(232);
  for (var i = 0; i < 232 >> 2; ++i) GROWABLE_HEAP_U32()[(threadInfoStruct >> 2) + i] = 0;
  GROWABLE_HEAP_I32()[pthread_ptr >> 2] = threadInfoStruct;
  GROWABLE_HEAP_I32()[(threadInfoStruct + 12) >> 2] = threadInfoStruct;
  var headPtr = threadInfoStruct + 156;
  GROWABLE_HEAP_I32()[headPtr >> 2] = headPtr;
  var threadParams = {
    stackBase: stackBase,
    stackSize: stackSize,
    allocatedOwnStack: allocatedOwnStack,
    schedPolicy: schedPolicy,
    schedPrio: schedPrio,
    detached: detached,
    startRoutine: start_routine,
    pthread_ptr: threadInfoStruct,
    parent_pthread_ptr: _pthread_self(),
    arg: arg,
    transferList: transferList,
  };
  if (ENVIRONMENT_IS_PTHREAD) {
    threadParams.cmd = 'spawnThread';
    postMessage(threadParams, transferList);
  } else {
    __spawn_thread(threadParams);
  }
  return 0;
}
function _pthread_detach(thread) {
  if (!thread) {
    err('pthread_detach attempted on a null thread pointer!');
    return ERRNO_CODES.ESRCH;
  }
  var self = GROWABLE_HEAP_I32()[(thread + 12) >> 2];
  if (self !== thread) {
    err('pthread_detach attempted on thread ' + thread + ', which does not point to a valid thread, or does not exist anymore!');
    return ERRNO_CODES.ESRCH;
  }
  var threadStatus = Atomics.load(GROWABLE_HEAP_U32(), (thread + 0) >> 2);
  var wasDetached = Atomics.compareExchange(GROWABLE_HEAP_U32(), (thread + 68) >> 2, 0, 2);
  return wasDetached ? ERRNO_CODES.EINVAL : 0;
}
if (!ENVIRONMENT_IS_PTHREAD) PThread.initMainThreadBlock();
else PThread.initWorker();
var GLctx;
GL.init();
var proxiedFunctionTable = [null, _fd_close, _fd_seek, _fd_write, _emscripten_set_canvas_element_size_main_thread];
function invoke_i(index) {
  var sp = stackSave();
  try {
    return dynCall_i(index);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_ii(index, a1) {
  var sp = stackSave();
  try {
    return dynCall_ii(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return dynCall_iiii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return dynCall_iiiii(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_v(index) {
  var sp = stackSave();
  try {
    dynCall_v(index);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vi(index, a1) {
  var sp = stackSave();
  try {
    dynCall_vi(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_vii(index, a1, a2) {
  var sp = stackSave();
  try {
    dynCall_vii(index, a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    dynCall_viii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
function invoke_viiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    dynCall_viiii(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== 'longjmp') throw e;
    _setThrew(1, 0);
  }
}
var asmGlobalArg = {};
var asmLibraryArg = {
  b: ___assert_fail,
  p: ___cxa_allocate_exception,
  o: ___cxa_begin_catch,
  u: ___cxa_end_catch,
  e: ___cxa_find_matching_catch_2,
  i: ___cxa_find_matching_catch_3,
  t: ___cxa_free_exception,
  n: ___cxa_throw,
  P: ___cxa_uncaught_exceptions,
  f: ___resumeException,
  O: ___wasi_fd_close,
  x: ___wasi_fd_seek,
  N: ___wasi_fd_write,
  M: __emscripten_notify_thread_queue,
  __memory_base: 1024,
  __table_base: 0,
  r: _abort,
  L: _emscripten_asm_const_i,
  K: _emscripten_check_blocking_allowed,
  h: _emscripten_futex_wait,
  d: _emscripten_futex_wake,
  J: _emscripten_get_heap_size,
  k: _emscripten_get_now,
  H: _emscripten_memcpy_big,
  G: _emscripten_receive_on_main_thread_js,
  F: _emscripten_resize_heap,
  E: _emscripten_set_canvas_element_size,
  D: _emscripten_webgl_create_context,
  C: _initPthreadsJS,
  B: _pthread_cleanup_pop,
  A: _pthread_cleanup_push,
  q: _pthread_create,
  y: _pthread_detach,
  a: abort,
  c: getTempRet0,
  s: invoke_i,
  I: invoke_ii,
  z: invoke_iiii,
  w: invoke_iiiii,
  m: invoke_v,
  l: invoke_vi,
  j: invoke_vii,
  v: invoke_viii,
  Q: invoke_viiii,
  memory: wasmMemory,
  g: setTempRet0,
  table: wasmTable,
};
var asm = Module['asm'](asmGlobalArg, asmLibraryArg, buffer);
Module['asm'] = asm;
var _GrowMemory = (Module['_GrowMemory'] = function () {
  return Module['asm']['R'].apply(null, arguments);
});
var __ZSt18uncaught_exceptionv = (Module['__ZSt18uncaught_exceptionv'] = function () {
  return Module['asm']['S'].apply(null, arguments);
});
var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
  return Module['asm']['T'].apply(null, arguments);
});
var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
  return Module['asm']['U'].apply(null, arguments);
});
var ___em_js__initPthreadsJS = (Module['___em_js__initPthreadsJS'] = function () {
  return Module['asm']['V'].apply(null, arguments);
});
var ___emscripten_pthread_data_constructor = (Module['___emscripten_pthread_data_constructor'] = function () {
  return Module['asm']['W'].apply(null, arguments);
});
var ___pthread_tsd_run_dtors = (Module['___pthread_tsd_run_dtors'] = function () {
  return Module['asm']['X'].apply(null, arguments);
});
var __emscripten_atomic_fetch_and_add_u64 = (Module['__emscripten_atomic_fetch_and_add_u64'] = function () {
  return Module['asm']['Y'].apply(null, arguments);
});
var __emscripten_atomic_fetch_and_and_u64 = (Module['__emscripten_atomic_fetch_and_and_u64'] = function () {
  return Module['asm']['Z'].apply(null, arguments);
});
var __emscripten_atomic_fetch_and_or_u64 = (Module['__emscripten_atomic_fetch_and_or_u64'] = function () {
  return Module['asm']['_'].apply(null, arguments);
});
var __emscripten_atomic_fetch_and_sub_u64 = (Module['__emscripten_atomic_fetch_and_sub_u64'] = function () {
  return Module['asm']['$'].apply(null, arguments);
});
var __emscripten_atomic_fetch_and_xor_u64 = (Module['__emscripten_atomic_fetch_and_xor_u64'] = function () {
  return Module['asm']['aa'].apply(null, arguments);
});
var __register_pthread_ptr = (Module['__register_pthread_ptr'] = function () {
  return Module['asm']['ba'].apply(null, arguments);
});
var _emscripten_async_queue_call_on_thread = (Module['_emscripten_async_queue_call_on_thread'] = function () {
  return Module['asm']['ca'].apply(null, arguments);
});
var _emscripten_async_queue_on_thread_ = (Module['_emscripten_async_queue_on_thread_'] = function () {
  return Module['asm']['da'].apply(null, arguments);
});
var _emscripten_async_run_in_main_thread = (Module['_emscripten_async_run_in_main_thread'] = function () {
  return Module['asm']['ea'].apply(null, arguments);
});
var _emscripten_atomic_add_u64 = (Module['_emscripten_atomic_add_u64'] = function () {
  return Module['asm']['fa'].apply(null, arguments);
});
var _emscripten_atomic_and_u64 = (Module['_emscripten_atomic_and_u64'] = function () {
  return Module['asm']['ga'].apply(null, arguments);
});
var _emscripten_atomic_cas_u64 = (Module['_emscripten_atomic_cas_u64'] = function () {
  return Module['asm']['ha'].apply(null, arguments);
});
var _emscripten_atomic_exchange_u64 = (Module['_emscripten_atomic_exchange_u64'] = function () {
  return Module['asm']['ia'].apply(null, arguments);
});
var _emscripten_atomic_load_f32 = (Module['_emscripten_atomic_load_f32'] = function () {
  return Module['asm']['ja'].apply(null, arguments);
});
var _emscripten_atomic_load_f64 = (Module['_emscripten_atomic_load_f64'] = function () {
  return Module['asm']['ka'].apply(null, arguments);
});
var _emscripten_atomic_load_u64 = (Module['_emscripten_atomic_load_u64'] = function () {
  return Module['asm']['la'].apply(null, arguments);
});
var _emscripten_atomic_or_u64 = (Module['_emscripten_atomic_or_u64'] = function () {
  return Module['asm']['ma'].apply(null, arguments);
});
var _emscripten_atomic_store_f32 = (Module['_emscripten_atomic_store_f32'] = function () {
  return Module['asm']['na'].apply(null, arguments);
});
var _emscripten_atomic_store_f64 = (Module['_emscripten_atomic_store_f64'] = function () {
  return Module['asm']['oa'].apply(null, arguments);
});
var _emscripten_atomic_store_u64 = (Module['_emscripten_atomic_store_u64'] = function () {
  return Module['asm']['pa'].apply(null, arguments);
});
var _emscripten_atomic_sub_u64 = (Module['_emscripten_atomic_sub_u64'] = function () {
  return Module['asm']['qa'].apply(null, arguments);
});
var _emscripten_atomic_xor_u64 = (Module['_emscripten_atomic_xor_u64'] = function () {
  return Module['asm']['ra'].apply(null, arguments);
});
var _emscripten_current_thread_process_queued_calls = (Module['_emscripten_current_thread_process_queued_calls'] = function () {
  return Module['asm']['sa'].apply(null, arguments);
});
var _emscripten_get_global_libc = (Module['_emscripten_get_global_libc'] = function () {
  return Module['asm']['ta'].apply(null, arguments);
});
var _emscripten_main_browser_thread_id = (Module['_emscripten_main_browser_thread_id'] = function () {
  return Module['asm']['ua'].apply(null, arguments);
});
var _emscripten_main_thread_process_queued_calls = (Module['_emscripten_main_thread_process_queued_calls'] = function () {
  return Module['asm']['va'].apply(null, arguments);
});
var _emscripten_register_main_browser_thread_id = (Module['_emscripten_register_main_browser_thread_id'] = function () {
  return Module['asm']['wa'].apply(null, arguments);
});
var _emscripten_run_in_main_runtime_thread_js = (Module['_emscripten_run_in_main_runtime_thread_js'] = function () {
  return Module['asm']['xa'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread = (Module['_emscripten_sync_run_in_main_thread'] = function () {
  return Module['asm']['ya'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_0 = (Module['_emscripten_sync_run_in_main_thread_0'] = function () {
  return Module['asm']['za'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_1 = (Module['_emscripten_sync_run_in_main_thread_1'] = function () {
  return Module['asm']['Aa'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_2 = (Module['_emscripten_sync_run_in_main_thread_2'] = function () {
  return Module['asm']['Ba'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_3 = (Module['_emscripten_sync_run_in_main_thread_3'] = function () {
  return Module['asm']['Ca'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_4 = (Module['_emscripten_sync_run_in_main_thread_4'] = function () {
  return Module['asm']['Da'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_5 = (Module['_emscripten_sync_run_in_main_thread_5'] = function () {
  return Module['asm']['Ea'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_6 = (Module['_emscripten_sync_run_in_main_thread_6'] = function () {
  return Module['asm']['Fa'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_7 = (Module['_emscripten_sync_run_in_main_thread_7'] = function () {
  return Module['asm']['Ga'].apply(null, arguments);
});
var _emscripten_sync_run_in_main_thread_xprintf_varargs = (Module['_emscripten_sync_run_in_main_thread_xprintf_varargs'] = function () {
  return Module['asm']['Ha'].apply(null, arguments);
});
var _free = (Module['_free'] = function () {
  return Module['asm']['Ia'].apply(null, arguments);
});
var _malloc = (Module['_malloc'] = function () {
  return Module['asm']['Ja'].apply(null, arguments);
});
var _memalign = (Module['_memalign'] = function () {
  return Module['asm']['Ka'].apply(null, arguments);
});
var _pthread_self = (Module['_pthread_self'] = function () {
  return Module['asm']['La'].apply(null, arguments);
});
var _setThrew = (Module['_setThrew'] = function () {
  return Module['asm']['Ma'].apply(null, arguments);
});
var asmJsEstablishStackFrame = (Module['asmJsEstablishStackFrame'] = function () {
  return Module['asm']['Na'].apply(null, arguments);
});
var stackAlloc = (Module['stackAlloc'] = function () {
  return Module['asm']['Xa'].apply(null, arguments);
});
var stackRestore = (Module['stackRestore'] = function () {
  return Module['asm']['Ya'].apply(null, arguments);
});
var stackSave = (Module['stackSave'] = function () {
  return Module['asm']['Za'].apply(null, arguments);
});
var dynCall_i = (Module['dynCall_i'] = function () {
  return Module['asm']['Oa'].apply(null, arguments);
});
var dynCall_ii = (Module['dynCall_ii'] = function () {
  return Module['asm']['Pa'].apply(null, arguments);
});
var dynCall_iiii = (Module['dynCall_iiii'] = function () {
  return Module['asm']['Qa'].apply(null, arguments);
});
var dynCall_iiiii = (Module['dynCall_iiiii'] = function () {
  return Module['asm']['Ra'].apply(null, arguments);
});
var dynCall_v = (Module['dynCall_v'] = function () {
  return Module['asm']['Sa'].apply(null, arguments);
});
var dynCall_vi = (Module['dynCall_vi'] = function () {
  return Module['asm']['Ta'].apply(null, arguments);
});
var dynCall_vii = (Module['dynCall_vii'] = function () {
  return Module['asm']['Ua'].apply(null, arguments);
});
var dynCall_viii = (Module['dynCall_viii'] = function () {
  return Module['asm']['Va'].apply(null, arguments);
});
var dynCall_viiii = (Module['dynCall_viiii'] = function () {
  return Module['asm']['Wa'].apply(null, arguments);
});
Module['asm'] = asm;
Module['PThread'] = PThread;
Module['PThread'] = PThread;
Module['_pthread_self'] = _pthread_self;
Module['wasmMemory'] = wasmMemory;
Module['ExitStatus'] = ExitStatus;
if (memoryInitializer && !ENVIRONMENT_IS_PTHREAD) {
  if (!isDataURI(memoryInitializer)) {
    memoryInitializer = locateFile(memoryInitializer);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = readBinary(memoryInitializer);
    GROWABLE_HEAP_U8().set(data, GLOBAL_BASE);
  } else {
    addRunDependency('memory initializer');
    var applyMemoryInitializer = function (data) {
      if (data.byteLength) data = new Uint8Array(data);
      GROWABLE_HEAP_U8().set(data, GLOBAL_BASE);
      if (Module['memoryInitializerRequest']) delete Module['memoryInitializerRequest'].response;
      removeRunDependency('memory initializer');
    };
    var doBrowserLoad = function () {
      readAsync(memoryInitializer, applyMemoryInitializer, function () {
        throw 'could not load memory initializer ' + memoryInitializer;
      });
    };
    if (Module['memoryInitializerRequest']) {
      var useRequest = function () {
        var request = Module['memoryInitializerRequest'];
        var response = request.response;
        if (request.status !== 200 && request.status !== 0) {
          console.warn('a problem seems to have happened with Module.memoryInitializerRequest, status: ' + request.status + ', retrying ' + memoryInitializer);
          doBrowserLoad();
          return;
        }
        applyMemoryInitializer(response);
      };
      if (Module['memoryInitializerRequest'].response) {
        setTimeout(useRequest, 0);
      } else {
        Module['memoryInitializerRequest'].addEventListener('load', useRequest);
      }
    } else {
      doBrowserLoad();
    }
  }
}
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
  if (runDependencies > 0) return;
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;
    if (ABORT) return;
    initRuntime();
    preMain();
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
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
if (!ENVIRONMENT_IS_PTHREAD) noExitRuntime = true;
if (!ENVIRONMENT_IS_PTHREAD) run();
