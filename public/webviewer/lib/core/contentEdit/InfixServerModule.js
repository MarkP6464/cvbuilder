(function () {
  /*
 *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
**************************************************************************** The buffer module from node.js, for the browser.

 @author   Feross Aboukhadijeh <http://feross.org>
 @license  MIT
*/
  var $jscomp = $jscomp || {};
  $jscomp.scope = {};
  $jscomp.arrayIteratorImpl = function (d) {
    var h = 0;
    return function () {
      return h < d.length ? { done: !1, value: d[h++] } : { done: !0 };
    };
  };
  $jscomp.arrayIterator = function (d) {
    return { next: $jscomp.arrayIteratorImpl(d) };
  };
  $jscomp.makeIterator = function (d) {
    var h = 'undefined' != typeof Symbol && Symbol.iterator && d[Symbol.iterator];
    return h ? h.call(d) : $jscomp.arrayIterator(d);
  };
  $jscomp.getGlobal = function (d) {
    return 'undefined' != typeof window && window === d ? d : 'undefined' != typeof global && null != global ? global : d;
  };
  $jscomp.global = $jscomp.getGlobal(this);
  $jscomp.ASSUME_ES5 = !1;
  $jscomp.ASSUME_NO_NATIVE_MAP = !1;
  $jscomp.ASSUME_NO_NATIVE_SET = !1;
  $jscomp.SIMPLE_FROUND_POLYFILL = !1;
  $jscomp.defineProperty =
    $jscomp.ASSUME_ES5 || 'function' == typeof Object.defineProperties
      ? Object.defineProperty
      : function (d, h, g) {
          d != Array.prototype && d != Object.prototype && (d[h] = g.value);
        };
  $jscomp.polyfill = function (d, h, g, a) {
    if (h) {
      g = $jscomp.global;
      d = d.split('.');
      for (a = 0; a < d.length - 1; a++) {
        var e = d[a];
        e in g || (g[e] = {});
        g = g[e];
      }
      d = d[d.length - 1];
      a = g[d];
      h = h(a);
      h != a &&
        null != h &&
        $jscomp.defineProperty(g, d, {
          configurable: !0,
          writable: !0,
          value: h,
        });
    }
  };
  $jscomp.FORCE_POLYFILL_PROMISE = !1;
  $jscomp.polyfill(
    'Promise',
    function (d) {
      function h() {
        this.batch_ = null;
      }
      function g(b) {
        return b instanceof e
          ? b
          : new e(function (a, c) {
              a(b);
            });
      }
      if (d && !$jscomp.FORCE_POLYFILL_PROMISE) return d;
      h.prototype.asyncExecute = function (b) {
        null == this.batch_ && ((this.batch_ = []), this.asyncExecuteBatch_());
        this.batch_.push(b);
        return this;
      };
      h.prototype.asyncExecuteBatch_ = function () {
        var b = this;
        this.asyncExecuteFunction(function () {
          b.executeBatch_();
        });
      };
      var a = $jscomp.global.setTimeout;
      h.prototype.asyncExecuteFunction = function (b) {
        a(b, 0);
      };
      h.prototype.executeBatch_ = function () {
        for (; this.batch_ && this.batch_.length; ) {
          var b = this.batch_;
          this.batch_ = [];
          for (var a = 0; a < b.length; ++a) {
            var c = b[a];
            b[a] = null;
            try {
              c();
            } catch (n) {
              this.asyncThrow_(n);
            }
          }
        }
        this.batch_ = null;
      };
      h.prototype.asyncThrow_ = function (b) {
        this.asyncExecuteFunction(function () {
          throw b;
        });
      };
      var e = function (b) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        var a = this.createResolveAndReject_();
        try {
          b(a.resolve, a.reject);
        } catch (c) {
          a.reject(c);
        }
      };
      e.prototype.createResolveAndReject_ = function () {
        function b(b) {
          return function (n) {
            c || ((c = !0), b.call(a, n));
          };
        }
        var a = this,
          c = !1;
        return { resolve: b(this.resolveTo_), reject: b(this.reject_) };
      };
      e.prototype.resolveTo_ = function (b) {
        if (b === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
        else if (b instanceof e) this.settleSameAsPromise_(b);
        else {
          a: switch (typeof b) {
            case 'object':
              var a = null != b;
              break a;
            case 'function':
              a = !0;
              break a;
            default:
              a = !1;
          }
          a ? this.resolveToNonPromiseObj_(b) : this.fulfill_(b);
        }
      };
      e.prototype.resolveToNonPromiseObj_ = function (b) {
        var a = void 0;
        try {
          a = b.then;
        } catch (c) {
          this.reject_(c);
          return;
        }
        'function' == typeof a ? this.settleSameAsThenable_(a, b) : this.fulfill_(b);
      };
      e.prototype.reject_ = function (b) {
        this.settle_(2, b);
      };
      e.prototype.fulfill_ = function (b) {
        this.settle_(1, b);
      };
      e.prototype.settle_ = function (b, a) {
        if (0 != this.state_) throw Error('Cannot settle(' + b + ', ' + a + '): Promise already settled in state' + this.state_);
        this.state_ = b;
        this.result_ = a;
        this.executeOnSettledCallbacks_();
      };
      e.prototype.executeOnSettledCallbacks_ = function () {
        if (null != this.onSettledCallbacks_) {
          for (var b = 0; b < this.onSettledCallbacks_.length; ++b) m.asyncExecute(this.onSettledCallbacks_[b]);
          this.onSettledCallbacks_ = null;
        }
      };
      var m = new h();
      e.prototype.settleSameAsPromise_ = function (b) {
        var a = this.createResolveAndReject_();
        b.callWhenSettled_(a.resolve, a.reject);
      };
      e.prototype.settleSameAsThenable_ = function (b, a) {
        var c = this.createResolveAndReject_();
        try {
          b.call(a, c.resolve, c.reject);
        } catch (n) {
          c.reject(n);
        }
      };
      e.prototype.then = function (b, a) {
        function c(b, c) {
          return 'function' == typeof b
            ? function (c) {
                try {
                  n(b(c));
                } catch (z) {
                  p(z);
                }
              }
            : c;
        }
        var n,
          p,
          d = new e(function (b, c) {
            n = b;
            p = c;
          });
        this.callWhenSettled_(c(b, n), c(a, p));
        return d;
      };
      e.prototype.catch = function (b) {
        return this.then(void 0, b);
      };
      e.prototype.callWhenSettled_ = function (b, a) {
        function c() {
          switch (n.state_) {
            case 1:
              b(n.result_);
              break;
            case 2:
              a(n.result_);
              break;
            default:
              throw Error('Unexpected state: ' + n.state_);
          }
        }
        var n = this;
        null == this.onSettledCallbacks_ ? m.asyncExecute(c) : this.onSettledCallbacks_.push(c);
      };
      e.resolve = g;
      e.reject = function (b) {
        return new e(function (a, c) {
          c(b);
        });
      };
      e.race = function (b) {
        return new e(function (a, c) {
          for (var n = $jscomp.makeIterator(b), p = n.next(); !p.done; p = n.next()) g(p.value).callWhenSettled_(a, c);
        });
      };
      e.all = function (b) {
        var a = $jscomp.makeIterator(b),
          c = a.next();
        return c.done
          ? g([])
          : new e(function (b, p) {
              function n(c) {
                return function (k) {
                  e[c] = k;
                  d--;
                  0 == d && b(e);
                };
              }
              var e = [],
                d = 0;
              do e.push(void 0), d++, g(c.value).callWhenSettled_(n(e.length - 1), p), (c = a.next());
              while (!c.done);
            });
      };
      return e;
    },
    'es6',
    'es3',
  );
  $jscomp.checkStringArgs = function (d, h, g) {
    if (null == d) throw new TypeError("The 'this' value for String.prototype." + g + ' must not be null or undefined');
    if (h instanceof RegExp) throw new TypeError('First argument to String.prototype.' + g + ' must not be a regular expression');
    return d + '';
  };
  $jscomp.polyfill(
    'String.prototype.endsWith',
    function (d) {
      return d
        ? d
        : function (d, g) {
            var a = $jscomp.checkStringArgs(this, d, 'endsWith');
            d += '';
            void 0 === g && (g = a.length);
            g = Math.max(0, Math.min(g | 0, a.length));
            for (var e = d.length; 0 < e && 0 < g; ) if (a[--g] != d[--e]) return !1;
            return 0 >= e;
          };
    },
    'es6',
    'es3',
  );
  $jscomp.checkEs6ConformanceViaProxy = function () {
    try {
      var d = {},
        h = Object.create(
          new $jscomp.global.Proxy(d, {
            get: function (g, a, e) {
              return g == d && 'q' == a && e == h;
            },
          }),
        );
      return !0 === h.q;
    } catch (g) {
      return !1;
    }
  };
  $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = !1;
  $jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
  $jscomp.SYMBOL_PREFIX = 'jscomp_symbol_';
  $jscomp.initSymbol = function () {
    $jscomp.initSymbol = function () {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
  };
  $jscomp.Symbol = (function () {
    var d = 0;
    return function (h) {
      return $jscomp.SYMBOL_PREFIX + (h || '') + d++;
    };
  })();
  $jscomp.initSymbolIterator = function () {
    $jscomp.initSymbol();
    var d = $jscomp.global.Symbol.iterator;
    d || (d = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol('iterator'));
    'function' != typeof Array.prototype[d] &&
      $jscomp.defineProperty(Array.prototype, d, {
        configurable: !0,
        writable: !0,
        value: function () {
          return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
        },
      });
    $jscomp.initSymbolIterator = function () {};
  };
  $jscomp.initSymbolAsyncIterator = function () {
    $jscomp.initSymbol();
    var d = $jscomp.global.Symbol.asyncIterator;
    d || (d = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol('asyncIterator'));
    $jscomp.initSymbolAsyncIterator = function () {};
  };
  $jscomp.iteratorPrototype = function (d) {
    $jscomp.initSymbolIterator();
    d = { next: d };
    d[$jscomp.global.Symbol.iterator] = function () {
      return this;
    };
    return d;
  };
  $jscomp.owns = function (d, h) {
    return Object.prototype.hasOwnProperty.call(d, h);
  };
  $jscomp.polyfill(
    'WeakMap',
    function (d) {
      function h() {
        if (!d || !Object.seal) return !1;
        try {
          var b = Object.seal({}),
            a = Object.seal({}),
            p = new d([
              [b, 2],
              [a, 3],
            ]);
          if (2 != p.get(b) || 3 != p.get(a)) return !1;
          p.delete(b);
          p.set(a, 4);
          return !p.has(b) && 4 == p.get(a);
        } catch (w) {
          return !1;
        }
      }
      function g() {}
      function a(b) {
        if (!$jscomp.owns(b, m)) {
          var c = new g();
          $jscomp.defineProperty(b, m, { value: c });
        }
      }
      function e(b) {
        var c = Object[b];
        c &&
          (Object[b] = function (b) {
            if (b instanceof g) return b;
            a(b);
            return c(b);
          });
      }
      if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
        if (d && $jscomp.ES6_CONFORMANCE) return d;
      } else if (h()) return d;
      var m = '$jscomp_hidden_' + Math.random();
      e('freeze');
      e('preventExtensions');
      e('seal');
      var b = 0,
        q = function (c) {
          this.id_ = (b += Math.random() + 1).toString();
          if (c) {
            c = $jscomp.makeIterator(c);
            for (var a; !(a = c.next()).done; ) (a = a.value), this.set(a[0], a[1]);
          }
        };
      q.prototype.set = function (b, n) {
        a(b);
        if (!$jscomp.owns(b, m)) throw Error('WeakMap key fail: ' + b);
        b[m][this.id_] = n;
        return this;
      };
      q.prototype.get = function (b) {
        return $jscomp.owns(b, m) ? b[m][this.id_] : void 0;
      };
      q.prototype.has = function (b) {
        return $jscomp.owns(b, m) && $jscomp.owns(b[m], this.id_);
      };
      q.prototype.delete = function (b) {
        return $jscomp.owns(b, m) && $jscomp.owns(b[m], this.id_) ? delete b[m][this.id_] : !1;
      };
      return q;
    },
    'es6',
    'es3',
  );
  $jscomp.MapEntry = function () {};
  $jscomp.polyfill(
    'Map',
    function (d) {
      function h() {
        if ($jscomp.ASSUME_NO_NATIVE_MAP || !d || 'function' != typeof d || !d.prototype.entries || 'function' != typeof Object.seal) return !1;
        try {
          var b = Object.seal({ x: 4 }),
            a = new d($jscomp.makeIterator([[b, 's']]));
          if ('s' != a.get(b) || 1 != a.size || a.get({ x: 4 }) || a.set({ x: 4 }, 't') != a || 2 != a.size) return !1;
          var e = a.entries(),
            g = e.next();
          if (g.done || g.value[0] != b || 's' != g.value[1]) return !1;
          g = e.next();
          return g.done || 4 != g.value[0].x || 't' != g.value[1] || !e.next().done ? !1 : !0;
        } catch (t) {
          return !1;
        }
      }
      if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
        if (d && $jscomp.ES6_CONFORMANCE) return d;
      } else if (h()) return d;
      $jscomp.initSymbolIterator();
      var g = new WeakMap(),
        a = function (a) {
          this.data_ = {};
          this.head_ = b();
          this.size = 0;
          if (a) {
            a = $jscomp.makeIterator(a);
            for (var c; !(c = a.next()).done; ) (c = c.value), this.set(c[0], c[1]);
          }
        };
      a.prototype.set = function (b, a) {
        b = 0 === b ? 0 : b;
        var c = e(this, b);
        c.list || (c.list = this.data_[c.id] = []);
        c.entry
          ? (c.entry.value = a)
          : ((c.entry = {
              next: this.head_,
              previous: this.head_.previous,
              head: this.head_,
              key: b,
              value: a,
            }),
            c.list.push(c.entry),
            (this.head_.previous.next = c.entry),
            (this.head_.previous = c.entry),
            this.size++);
        return this;
      };
      a.prototype.delete = function (b) {
        b = e(this, b);
        return b.entry && b.list
          ? (b.list.splice(b.index, 1),
            b.list.length || delete this.data_[b.id],
            (b.entry.previous.next = b.entry.next),
            (b.entry.next.previous = b.entry.previous),
            (b.entry.head = null),
            this.size--,
            !0)
          : !1;
      };
      a.prototype.clear = function () {
        this.data_ = {};
        this.head_ = this.head_.previous = b();
        this.size = 0;
      };
      a.prototype.has = function (b) {
        return !!e(this, b).entry;
      };
      a.prototype.get = function (b) {
        return (b = e(this, b).entry) && b.value;
      };
      a.prototype.entries = function () {
        return m(this, function (b) {
          return [b.key, b.value];
        });
      };
      a.prototype.keys = function () {
        return m(this, function (b) {
          return b.key;
        });
      };
      a.prototype.values = function () {
        return m(this, function (b) {
          return b.value;
        });
      };
      a.prototype.forEach = function (b, a) {
        for (var c = this.entries(), e; !(e = c.next()).done; ) (e = e.value), b.call(a, e[1], e[0], this);
      };
      a.prototype[Symbol.iterator] = a.prototype.entries;
      var e = function (b, a) {
          var c = a && typeof a;
          'object' == c || 'function' == c ? (g.has(a) ? (c = g.get(a)) : ((c = '' + ++q), g.set(a, c))) : (c = 'p_' + a);
          var e = b.data_[c];
          if (e && $jscomp.owns(b.data_, c))
            for (b = 0; b < e.length; b++) {
              var d = e[b];
              if ((a !== a && d.key !== d.key) || a === d.key) return { id: c, list: e, index: b, entry: d };
            }
          return { id: c, list: e, index: -1, entry: void 0 };
        },
        m = function (b, a) {
          var c = b.head_;
          return $jscomp.iteratorPrototype(function () {
            if (c) {
              for (; c.head != b.head_; ) c = c.previous;
              for (; c.next != c.head; ) return (c = c.next), { done: !1, value: a(c) };
              c = null;
            }
            return { done: !0, value: void 0 };
          });
        },
        b = function () {
          var b = {};
          return (b.previous = b.next = b.head = b);
        },
        q = 0;
      return a;
    },
    'es6',
    'es3',
  );
  $jscomp.underscoreProtoCanBeSet = function () {
    var d = { a: !0 },
      h = {};
    try {
      return (h.__proto__ = d), h.a;
    } catch (g) {}
    return !1;
  };
  $jscomp.setPrototypeOf =
    'function' == typeof Object.setPrototypeOf
      ? Object.setPrototypeOf
      : $jscomp.underscoreProtoCanBeSet()
      ? function (d, h) {
          d.__proto__ = h;
          if (d.__proto__ !== h) throw new TypeError(d + ' is not extensible');
          return d;
        }
      : null;
  $jscomp.polyfill(
    'Object.setPrototypeOf',
    function (d) {
      return d || $jscomp.setPrototypeOf;
    },
    'es6',
    'es5',
  );
  $jscomp.assign =
    'function' == typeof Object.assign
      ? Object.assign
      : function (d, h) {
          for (var g = 1; g < arguments.length; g++) {
            var a = arguments[g];
            if (a) for (var e in a) $jscomp.owns(a, e) && (d[e] = a[e]);
          }
          return d;
        };
  $jscomp.polyfill(
    'Object.assign',
    function (d) {
      return d || $jscomp.assign;
    },
    'es6',
    'es3',
  );
  $jscomp.polyfill(
    'Array.prototype.fill',
    function (d) {
      return d
        ? d
        : function (d, g, a) {
            var e = this.length || 0;
            0 > g && (g = Math.max(0, e + g));
            if (null == a || a > e) a = e;
            a = Number(a);
            0 > a && (a = Math.max(0, e + a));
            for (g = Number(g || 0); g < a; g++) this[g] = d;
            return this;
          };
    },
    'es6',
    'es3',
  );
  (function (d) {
    function h(a) {
      if (g[a]) return g[a].exports;
      var e = (g[a] = { i: a, l: !1, exports: {} });
      d[a].call(e.exports, e, e.exports, h);
      e.l = !0;
      return e.exports;
    }
    var g = {};
    h.m = d;
    h.c = g;
    h.d = function (a, e, d) {
      h.o(a, e) || Object.defineProperty(a, e, { enumerable: !0, get: d });
    };
    h.r = function (a) {
      'undefined' !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(a, Symbol.toStringTag, { value: 'Module' });
      Object.defineProperty(a, '__esModule', { value: !0 });
    };
    h.t = function (a, e) {
      e & 1 && (a = h(a));
      if (e & 8 || (e & 4 && 'object' === typeof a && a && a.__esModule)) return a;
      var d = Object.create(null);
      h.r(d);
      Object.defineProperty(d, 'default', { enumerable: !0, value: a });
      if (e & 2 && 'string' != typeof a)
        for (var b in a)
          h.d(
            d,
            b,
            function (b) {
              return a[b];
            }.bind(null, b),
          );
      return d;
    };
    h.n = function (a) {
      var e =
        a && a.__esModule
          ? function () {
              return a['default'];
            }
          : function () {
              return a;
            };
      h.d(e, 'a', e);
      return e;
    };
    h.o = function (a, e) {
      return Object.prototype.hasOwnProperty.call(a, e);
    };
    h.p = '/core/contentEdit';
    return h((h.s = 9));
  })([
    function (d, h, g) {
      g.d(h, 'c', function () {
        return e;
      });
      g.d(h, 'a', function () {
        return b;
      });
      g.d(h, 'b', function () {
        return m;
      });
      var a = g(2),
        e = function (b, c) {
          Object(a.a)('disableLogs') || (c ? console.warn(b + ': ' + c) : console.warn(b));
        },
        m = function (b, a, d, g) {
          void 0 === g && (g = !1);
          var c = d.pop();
          d = d.length ? d.join(', ') + ' and ' + c : c;
          g
            ? e("'" + a + "' will be deprecated in version " + b + '. Please use ' + d + ' instead.')
            : e("'" + a + "' is deprecated since version " + b + '. Please use ' + d + ' instead.');
        },
        b = function (b, a) {};
    },
    function (d, h, g) {
      g.d(h, 'a', function () {
        return C;
      });
      g.d(h, 'b', function () {
        return x;
      });
      g.d(h, 'c', function () {
        return r;
      });
      var a = g(6),
        e = g(0),
        m = g(4),
        b = g(3),
        q = 'undefined' === typeof window ? self : window,
        c = q.importScripts,
        n = !1,
        p = function (a, k) {
          n || (c(q.basePath + 'decode.min.js'), (n = !0));
          a = self.BrotliDecode(Object(b.b)(a));
          return k ? a : Object(b.a)(a);
        },
        w = function (k, c) {
          return Object(a.a)(void 0, void 0, Promise, function () {
            var e;
            return Object(a.b)(this, function (a) {
              switch (a.label) {
                case 0:
                  return n ? [3, 2] : [4, Object(m.a)(self.Core.getWorkerPath() + 'external/decode.min.js', 'Failed to download decode.min.js', window)];
                case 1:
                  a.sent(), (n = !0), (a.label = 2);
                case 2:
                  return (e = self.BrotliDecode(Object(b.b)(k))), [2, c ? e : Object(b.a)(e)];
              }
            });
          });
        };
      (function () {
        function b() {
          this.remainingDataArrays = [];
        }
        b.prototype.processRaw = function (b) {
          return b;
        };
        b.prototype.processBrotli = function (b) {
          this.remainingDataArrays.push(b);
          return null;
        };
        b.prototype.GetNextChunk = function (b) {
          this.decodeFunction || (this.decodeFunction = 0 === b[0] && 97 === b[1] && 115 === b[2] && 109 === b[3] ? this.processRaw : this.processBrotli);
          return this.decodeFunction(b);
        };
        b.prototype.End = function () {
          if (this.remainingDataArrays.length) {
            for (var b = this.arrays, a = 0, k = 0; k < b.length; ++k) a += b[k].length;
            a = new Uint8Array(a);
            var c = 0;
            for (k = 0; k < b.length; ++k) {
              var e = b[k];
              a.set(e, c);
              c += e.length;
            }
            return p(a, !0);
          }
          return null;
        };
        return b;
      })();
      var t = !1,
        u = function (a) {
          t || (c(q.basePath + 'pako_inflate.min.js'), (t = !0));
          var k = 10;
          if ('string' === typeof a) {
            if (a.charCodeAt(3) & 8) {
              for (; 0 !== a.charCodeAt(k); ++k);
              ++k;
            }
          } else if (a[3] & 8) {
            for (; 0 !== a[k]; ++k);
            ++k;
          }
          a = Object(b.b)(a);
          a = a.subarray(k, a.length - 8);
          return q.pako.inflate(a, { windowBits: -15 });
        },
        k = function (a, k) {
          return k ? a : Object(b.a)(a);
        },
        z = function (a) {
          var k = !a.shouldOutputArray,
            d = new XMLHttpRequest();
          d.open('GET', a.url, a.isAsync);
          var g = k && d.overrideMimeType;
          d.responseType = g ? 'text' : 'arraybuffer';
          g && d.overrideMimeType('text/plain; charset=x-user-defined');
          d.send();
          var n = function () {
            var n = Date.now();
            var h = g ? d.responseText : new Uint8Array(d.response);
            Object(e.a)('worker', 'Result length is ' + h.length);
            h.length < a.compressedMaximum
              ? ((h = a.decompressFunction(h, a.shouldOutputArray)),
                Object(e.c)(
                  'There may be some degradation of performance. Your server has not been configured to serve .gz. and .br. files with the expected Content-Encoding. See http://www.pdftron.com/kb_content_encoding for instructions on how to resolve this.',
                ),
                c && Object(e.a)('worker', 'Decompressed length is ' + h.length))
              : k && (h = Object(b.a)(h));
            c && Object(e.a)('worker', a.url + ' Decompression took ' + (Date.now() - n));
            return h;
          };
          if (a.isAsync)
            var h = new Promise(function (b, k) {
              d.onload = function () {
                200 === this.status || 0 === this.status ? b(n()) : k('Download Failed ' + a.url);
              };
              d.onerror = function () {
                k('Network error occurred ' + a.url);
              };
            });
          else {
            if (200 === d.status || 0 === d.status) return n();
            throw Error('Failed to load ' + a.url);
          }
          return h;
        },
        C = function (b) {
          var a = b.lastIndexOf('/');
          -1 === a && (a = 0);
          var k = b.slice(a).replace('.', '.br.');
          c || (k.endsWith('.js.mem') ? (k = k.replace('.js.mem', '.mem')) : k.endsWith('.js') && (k = k.concat('.mem')));
          return b.slice(0, a) + k;
        },
        I = function (b, a) {
          var k = b.lastIndexOf('/');
          -1 === k && (k = 0);
          var c = b.slice(k).replace('.', '.gz.');
          a.url = b.slice(0, k) + c;
          a.decompressFunction = u;
          return z(a);
        },
        J = function (b, a) {
          a.url = C(b);
          a.decompressFunction = c ? p : w;
          return z(a);
        },
        v = function (b, a) {
          b.endsWith('.js.mem') ? (b = b.slice(0, -4)) : b.endsWith('.mem') && (b = b.slice(0, -4) + '.js.mem');
          a.url = b;
          a.decompressFunction = k;
          return z(a);
        },
        y = function (b, a, k, c) {
          return b.catch(function (b) {
            Object(e.c)(b);
            return c(a, k);
          });
        },
        E = function (b, a, k) {
          var c;
          if (k.isAsync) {
            var d = a[0](b, k);
            for (c = 1; c < a.length; ++c) d = y(d, b, k, a[c]);
            return d;
          }
          for (c = 0; c < a.length; ++c)
            try {
              return a[c](b, k);
            } catch (D) {
              Object(e.c)(D.message);
            }
          throw Error('');
        },
        r = function (b, a, k, c) {
          return E(b, [I, J, v], {
            compressedMaximum: a,
            isAsync: k,
            shouldOutputArray: c,
          });
        },
        x = function (b, a, k, c) {
          return E(b, [J, I, v], {
            compressedMaximum: a,
            isAsync: k,
            shouldOutputArray: c,
          });
        };
    },
    function (d, h, g) {
      g.d(h, 'a', function () {
        return m;
      });
      g.d(h, 'b', function () {
        return b;
      });
      var a = {},
        e = {
          flattenedResources: !1,
          CANVAS_CACHE_SIZE: void 0,
          maxPagesBefore: void 0,
          maxPagesAhead: void 0,
          disableLogs: !1,
          wvsQueryParameters: {},
          _trnDebugMode: !1,
          _logFiltersEnabled: null,
        },
        m = function (b) {
          return e[b];
        },
        b = function (b, c) {
          var d;
          e[b] = c;
          null === (d = a[b]) || void 0 === d
            ? void 0
            : d.forEach(function (b) {
                b(c);
              });
        };
    },
    function (d, h, g) {
      g.d(h, 'b', function () {
        return a;
      });
      g.d(h, 'a', function () {
        return e;
      });
      var a = function (a) {
          if ('string' === typeof a) {
            for (var b = new Uint8Array(a.length), d = a.length, c = 0; c < d; c++) b[c] = a.charCodeAt(c);
            return b;
          }
          return a;
        },
        e = function (a) {
          if ('string' !== typeof a) {
            for (var b = '', d = 0, c = a.length, e; d < c; ) (e = a.subarray(d, d + 1024)), (d += 1024), (b += String.fromCharCode.apply(null, e));
            return b;
          }
          return a;
        };
    },
    function (d, h, g) {
      function a(a, b, d) {
        return new Promise(function (c) {
          if (!a) return c();
          var g = d.document.createElement('script');
          g.type = 'text/javascript';
          g.onload = function () {
            c();
          };
          g.onerror = function () {
            b && Object(e.c)(b);
            c();
          };
          g.src = a;
          d.document.getElementsByTagName('head')[0].appendChild(g);
        });
      }
      g.d(h, 'a', function () {
        return a;
      });
      var e = g(0);
    },
    function (d, h, g) {
      function a(b, a, d) {
        function c(n) {
          h = h || Date.now();
          return n
            ? (Object(e.a)('load', 'Try instantiateStreaming'),
              fetch(Object(m.a)(b))
                .then(function (b) {
                  return WebAssembly.instantiateStreaming(b, a);
                })
                .catch(function (a) {
                  Object(e.a)('load', 'instantiateStreaming Failed ' + b + ' message ' + a.message);
                  return c(!1);
                }))
            : Object(m.b)(b, d, !0, !0).then(function (b) {
                g = Date.now();
                Object(e.a)('load', 'Request took ' + (g - h) + ' ms');
                return WebAssembly.instantiate(b, a);
              });
        }
        var g, h;
        return c(!!WebAssembly.instantiateStreaming).then(function (b) {
          Object(e.a)('load', 'WASM compilation took ' + (Date.now() - (g || h)) + ' ms');
          return b;
        });
      }
      g.d(h, 'a', function () {
        return a;
      });
      var e = g(0),
        m = g(1),
        b = g(4);
      g.d(h, 'b', function () {
        return b.a;
      });
    },
    function (d, h, g) {
      function a(a, b, d, c) {
        function e(b) {
          return b instanceof d
            ? b
            : new d(function (a) {
                a(b);
              });
        }
        return new (d || (d = Promise))(function (d, g) {
          function h(b) {
            try {
              k(c.next(b));
            } catch (C) {
              g(C);
            }
          }
          function n(b) {
            try {
              k(c['throw'](b));
            } catch (C) {
              g(C);
            }
          }
          function k(b) {
            b.done ? d(b.value) : e(b.value).then(h, n);
          }
          k((c = c.apply(a, b || [])).next());
        });
      }
      function e(a, b) {
        function d(b) {
          return function (a) {
            return c([b, a]);
          };
        }
        function c(k) {
          if (g) throw new TypeError('Generator is already executing.');
          for (; e; )
            try {
              if (
                ((g = 1), h && (m = k[0] & 2 ? h['return'] : k[0] ? h['throw'] || ((m = h['return']) && m.call(h), 0) : h.next) && !(m = m.call(h, k[1])).done)
              )
                return m;
              if (((h = 0), m)) k = [k[0] & 2, m.value];
              switch (k[0]) {
                case 0:
                case 1:
                  m = k;
                  break;
                case 4:
                  return e.label++, { value: k[1], done: !1 };
                case 5:
                  e.label++;
                  h = k[1];
                  k = [0];
                  continue;
                case 7:
                  k = e.ops.pop();
                  e.trys.pop();
                  continue;
                default:
                  if (!((m = e.trys), (m = 0 < m.length && m[m.length - 1])) && (6 === k[0] || 2 === k[0])) {
                    e = 0;
                    continue;
                  }
                  if (3 === k[0] && (!m || (k[1] > m[0] && k[1] < m[3]))) e.label = k[1];
                  else if (6 === k[0] && e.label < m[1]) (e.label = m[1]), (m = k);
                  else if (m && e.label < m[2]) (e.label = m[2]), e.ops.push(k);
                  else {
                    m[2] && e.ops.pop();
                    e.trys.pop();
                    continue;
                  }
              }
              k = b.call(a, e);
            } catch (z) {
              (k = [6, z]), (h = 0);
            } finally {
              g = m = 0;
            }
          if (k[0] & 5) throw k[1];
          return { value: k[0] ? k[1] : void 0, done: !0 };
        }
        var e = {
            label: 0,
            sent: function () {
              if (m[0] & 1) throw m[1];
              return m[1];
            },
            trys: [],
            ops: [],
          },
          g,
          h,
          m,
          u;
        return (
          (u = { next: d(0), throw: d(1), return: d(2) }),
          'function' === typeof Symbol &&
            (u[Symbol.iterator] = function () {
              return this;
            }),
          u
        );
      }
      g.d(h, 'a', function () {
        return a;
      });
      g.d(h, 'b', function () {
        return e;
      });
    },
    function (d, h, g) {
      g.d(h, 'a', function () {
        return q;
      });
      var a = g(1),
        e = g(5),
        m = g(8),
        b = (function () {
          function b(b) {
            var a = this;
            this.promise = b.then(function (b) {
              a.response = b;
              a.status = 200;
            });
          }
          b.prototype.addEventListener = function (b, a) {
            this.promise.then(a);
          };
          return b;
        })(),
        q = function (c, d, g) {
          if (Object(m.a)() && !g) {
            self.Module.instantiateWasm = function (b, a) {
              return Object(e.a)(c + 'Wasm.wasm', b, d['Wasm.wasm']).then(function (b) {
                a(b.instance);
              });
            };
            if (d.disableObjectURLBlobs) {
              importScripts(c + 'Wasm.js');
              return;
            }
            g = Object(a.b)(c + 'Wasm.js.mem', d['Wasm.js.mem'], !1, !1);
          } else {
            if (d.disableObjectURLBlobs) {
              importScripts((self.Module.asmjsPrefix ? self.Module.asmjsPrefix : '') + c + '.js');
              return;
            }
            g = Object(a.b)((self.Module.asmjsPrefix ? self.Module.asmjsPrefix : '') + c + '.js.mem', d['.js.mem'], !1);
            var h = Object(a.c)((self.Module.memoryInitializerPrefixURL ? self.Module.memoryInitializerPrefixURL : '') + c + '.mem', d['.mem'], !0, !0);
            self.Module.memoryInitializerRequest = new b(h);
          }
          g = new Blob([g], { type: 'application/javascript' });
          importScripts(URL.createObjectURL(g));
        };
    },
    function (d, h, g) {
      g.d(h, 'a', function () {
        return u;
      });
      g(0);
      var a = 'undefined' === typeof window ? self : window;
      d = (function () {
        var b = navigator.userAgent.toLowerCase();
        return (b = /(msie) ([\w.]+)/.exec(b) || /(trident)(?:.*? rv:([\w.]+)|)/.exec(b)) ? parseInt(b[2], 10) : b;
      })();
      var e = (function () {
        var b = a.navigator.userAgent.match(/OPR/),
          c = a.navigator.userAgent.match(/Maxthon/),
          d = a.navigator.userAgent.match(/Edge/);
        return a.navigator.userAgent.match(/Chrome\/(.*?) /) && !b && !c && !d;
      })();
      (function () {
        if (!e) return null;
        var b = a.navigator.userAgent.match(/Chrome\/([0-9]+)\./);
        return b ? parseInt(b[1], 10) : b;
      })();
      var m = !!navigator.userAgent.match(/Edge/i) || (navigator.userAgent.match(/Edg\/(.*?)/) && a.navigator.userAgent.match(/Chrome\/(.*?) /));
      (function () {
        if (!m) return null;
        var b = a.navigator.userAgent.match(/Edg\/([0-9]+)\./);
        return b ? parseInt(b[1], 10) : b;
      })();
      h =
        /iPad|iPhone|iPod/.test(a.navigator.platform) ||
        ('MacIntel' === navigator.platform && 1 < navigator.maxTouchPoints) ||
        /iPad|iPhone|iPod/.test(a.navigator.userAgent);
      var b = (function () {
          var b = a.navigator.userAgent.match(/.*\/([0-9\.]+)\s(Safari|Mobile).*/i);
          return b ? parseFloat(b[1]) : b;
        })(),
        q = /^((?!chrome|android).)*safari/i.test(a.navigator.userAgent) || (/^((?!chrome|android).)*$/.test(a.navigator.userAgent) && h),
        c = a.navigator.userAgent.match(/Firefox/);
      (function () {
        if (!c) return null;
        var b = a.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
        return b ? parseInt(b[1], 10) : b;
      })();
      d || /Android|webOS|Touch|IEMobile|Silk/i.test(navigator.userAgent);
      navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
      a.navigator.userAgent.indexOf('Android');
      var n = /Mac OS X 10_13_6.*\(KHTML, like Gecko\)$/.test(a.navigator.userAgent),
        p = a.navigator.userAgent.match(/(iPad|iPhone).+\sOS\s((\d+)(_\d)*)/i)
          ? 14 <= parseInt(a.navigator.userAgent.match(/(iPad|iPhone).+\sOS\s((\d+)(_\d)*)/i)[3], 10)
          : !1,
        w = !(!self.WebAssembly || !self.WebAssembly.validate),
        t = -1 < a.navigator.userAgent.indexOf('Edge/16') || -1 < a.navigator.userAgent.indexOf('MSAppHost'),
        u = function () {
          return w && !t && !(!p && ((q && 14 > b) || n));
        };
    },
    function (d, h, g) {
      d.exports = g(10);
    },
    function (d, h, g) {
      g.r(h);
      (function (a) {
        function d(b, a, c) {
          c = 'importCommand' + c + '.xml';
          FS.writeFile(c, '<InfixServer>' + b + '</InfixServer>');
          u.ccall('wasmRunXML', 'number', ['string', 'string'], [c, a]);
          FS.unlink(c);
        }
        function h() {
          1 == p ? postMessage({ cmd: 'isReady' }) : setTimeout(h, 300);
        }
        function b(b, a, c, e, g) {
          if (a) {
            a = new Uint8Array(c);
            var k = 'inputFile' + b + '.pdf';
            FS.writeFile(k, a);
            e = new Uint8Array(e);
            var h = new TextDecoder('utf-8').decode(e);
            e = 'exported' + b + '.xml';
            a = 'objects' + b + '.xml';
            c = 'results' + b + '.xml';
            var m =
              '<Commands><Command Name="LoadPDF">' +
              ('<File>' + k + '</File></Command>') +
              '<Command Name="Page BBox"><StartPage>1</StartPage><EndPage>1</EndPage></Command>';
            '' != h && (m += '<Command Name="AddTableBoxes">' + h + '</Command>');
            m =
              m +
              '<Command Name="Translate Export">' +
              ('<File>' + e + '</File><TransXML>coreTransXML.cfg</TransXML>') +
              '<StartPage>1</StartPage><EndPage>1</EndPage></Command>';
            m += '<Command Name="Edit Page">';
            m += '<Output>' + a + '</Output><ImagesOnly/></Command></Commands>';
            d(m, c, 1);
            t = b;
            g &&
              ((g = FS.readFile(k).buffer),
              (k = FS.readFile(e).buffer),
              (h = FS.readFile(a).buffer),
              (m = FS.readFile(c).buffer),
              FS.unlink(c),
              FS.unlink(e),
              FS.unlink(a),
              postMessage(
                {
                  cmd: 'exportFile',
                  pageNumber: b,
                  exportPerformed: !0,
                  pdfBuffer: g,
                  exportXML: k,
                  objectXML: h,
                  resultsXML: m,
                },
                [g, k, m],
              ));
          } else
            postMessage({
              cmd: 'exportFile',
              pageNumber: b,
              exportPerformed: !1,
            });
        }
        var q = g(7),
          c = g(1),
          n = 'undefined' === typeof window ? self : window;
        n.Core = n.Core || {};
        var p = !1,
          w = null,
          t = -1,
          u = {
            noInitialRun: !0,
            onRuntimeInitialized: function () {
              p = !0;
            },
            fetchSelf: function () {
              Object(q.a)(
                'InfixServer',
                {
                  'Wasm.wasm': 1e8,
                  'Wasm.js.mem': 1e5,
                  '.js.mem': 5e6,
                  '.mem': 3e6,
                },
                !!navigator.userAgent.match(/Edge/i),
              );
            },
            locateFile: function (b) {
              return b;
            },
            getPreloadedPackage: function (b, a) {
              'InfixServerWasm.br.mem' == b && (b = 'InfixServerWasm.mem');
              return Object(c.b)(''.concat(w).concat(b), a, !1, !0).buffer;
            },
          };
        self.Module = u;
        self.basePath = '../external/';
        onmessage = function (c) {
          c = c.data;
          switch (c.cmd) {
            case 'isReady':
              w = c.resourcePath;
              u.fetchSelf();
              h();
              break;
            case 'initialiseInfixServer':
              c = c.l;
              u.callMain(['']);
              u.ccall('wasmInitInfixServer', 'number', ['string', 'string', 'string'], ['infixcore.cfg', c, 'results']);
              c = FS.readFile('results').buffer;
              postMessage({ cmd: 'initialiseInfixServer', resultsXML: c }, [c]);
              break;
            case 'loadAvailableFonts':
              d('<Commands><Command Name="Dump Core Fonts">' + ('<WebFontURL>' + c.webFontURL + '</WebFontURL>') + '</Command></Commands>', 'results0.xml', 0);
              c = FS.readFile('results0.xml').buffer;
              FS.unlink('results0.xml');
              postMessage({ cmd: 'loadAvailableFonts', resultsXML: c }, [c]);
              break;
            case 'exportFile':
              b(c.pageNumber, c.performExport, c.pdfFile, c.tableData, !0);
              break;
            case 'importText':
              var e = c.pdfFile,
                g = c.pageNumber,
                m = c.webFontURL,
                k = c.galleyId,
                n = c.tableData,
                p = c.isSearchReplace,
                q = c.callbackMapId;
              c = new Uint8Array(c.importData);
              var r = new TextDecoder('utf-8').decode(c);
              g != t && b(g, !0, e, n, !1);
              c = 'editText' + g + '.xml';
              e = r.replace(/(\r\n|\n|\r)/gm, '');
              e = e.replace(/\t/g, '');
              FS.writeFile(c, e);
              e = 'outputFile' + g + '.pdf';
              n = 'results' + g + '.xml';
              r =
                '<Commands><Command Name="Translate Import">' +
                ('<File>' + c + '</File><StartPage>1</StartPage><EndPage>LastPage</EndPage>') +
                '<AutoSubstitute/><AutoDeleteParas/><Fitting><Shrink><FontSize Min="0.65">true</FontSize><Leading>False</Leading></Shrink><Stretch><FontSize>False</FontSize>';
              r += '<Leading>False</Leading></Stretch></Fitting>';
              r += '<ResetLetterSpacing/><IgnoreFlightCheck/>';
              r += '<MissingFont>Noto Sans Regular</MissingFont><SubstituteAllChars/>';
              r += '<WebFontURL>' + m + '</WebFontURL>';
              r += '<TargetLang>en</TargetLang></Command>';
              r += '<Command Name="SavePDF"><File>' + e + '</File></Command>';
              r += '<Command Name="DumpObjectBBox"><GID>' + k + '</GID></Command></Commands>';
              d(r, n, g);
              m = FS.readFile(e).buffer;
              r = FS.readFile(n).buffer;
              FS.unlink(e);
              FS.unlink(n);
              FS.unlink(c);
              postMessage(
                {
                  cmd: 'importText',
                  pageNumber: g,
                  pdfBuffer: m,
                  resultsXML: r,
                  id: k,
                  isSearchReplace: p,
                  callbackMapId: q,
                },
                [m, r],
              );
              break;
            case 'transformObject':
              g = c.pageNumber;
              k = c.objectID;
              var x = c.isText;
              q = c.topVal;
              m = c.leftVal;
              e = c.bottomVal;
              n = c.rightVal;
              r = '<Commands><Command Name="TransformToRect">';
              g != t && b(g, !0, c.pdfFile, c.tableData, !1);
              c = 'outputFile' + g + '.pdf';
              p = 'results' + g + '.xml';
              x = !0 === x ? '<GID>' + k + '</GID>' : '<OID>' + k + '</OID>';
              r = r + x + ('<Rect><Top>' + q + '</Top><Left>' + m + '</Left>') + ('<Bottom>' + e + '</Bottom><Right>' + n + '</Right></Rect></Command>');
              r += '<Command Name="SavePDF"><File>' + c + '</File></Command>';
              d(r + ('<Command Name="DumpObjectBBox">' + x + '</Command></Commands>'), p, g);
              q = FS.readFile(c).buffer;
              m = FS.readFile(p).buffer;
              FS.unlink(c);
              FS.unlink(p);
              postMessage(
                {
                  cmd: 'transformObject',
                  pageNumber: g,
                  pdfBuffer: q,
                  resultsXML: m,
                  id: k,
                },
                [q, m],
              );
              break;
            case 'deleteObject':
              g = c.pageNumber;
              k = c.objectID;
              q = c.isText;
              g != t && b(g, !0, c.pdfFile, c.tableData, !1);
              c = 'outputFile' + g + '.pdf';
              p = 'results' + g + '.xml';
              m = '<Commands><Command Name="DeleteObject">';
              m =
                (!0 === q ? m + ('<GID>' + k + '</GID></Command>') : m + ('<OID>' + k + '</OID></Command>')) +
                ('<Command Name="SavePDF"><File>' + c + '</File>') +
                '</Command></Commands>';
              d(m, p, g);
              q = FS.readFile(c).buffer;
              m = FS.readFile(p).buffer;
              FS.unlink(c);
              FS.unlink(p);
              postMessage(
                {
                  cmd: 'deleteObject',
                  pageNumber: g,
                  pdfBuffer: q,
                  resultsXML: m,
                  id: k,
                },
                [q, m],
              );
              break;
            case 'insertNewTextBox':
              p = c.pdfFile;
              g = c.pageNumber;
              e = c.topVal;
              n = c.leftVal;
              r = c.bottomVal;
              x = c.rightVal;
              var F = c.font,
                G = c.fontSize;
              k = c.importData;
              c = c.content;
              q = new TextEncoder().encode('').buffer;
              g != t && b(g, !0, p, q, !1);
              p = 'results' + g + '.xml';
              q = 'exported' + g + '.xml';
              m = 'outputFile' + g + '.pdf';
              e =
                '<Commands><Command Name="Insert Text Box">' +
                ('<Rect><Top>' + e + '</Top><Left>' + n + '</Left>') +
                ('<Bottom>' + r + '</Bottom><Right>' + x + '</Right></Rect>') +
                ('<Size>' + G + '</Size><FontName>' + F + '</FontName>');
              n = 'editText' + g + '.xml';
              FS.writeFile(n, k);
              e += '<File>' + n + '</File><TransXML>coreTransXML.cfg</TransXML>';
              e += '<ExportFile>' + q + '</ExportFile><TransXML>coreTransXML.cfg</TransXML>';
              e += '<StartPage>1</StartPage><EndPage>LastPage</EndPage>';
              e += '<AutoSubstitute/><AutoDeleteParas/><Fitting><Shrink><FontSize Min="0.65">true</FontSize>';
              e += '<Leading>False</Leading></Shrink><Stretch><FontSize>False</FontSize>';
              e += '<Leading>False</Leading></Stretch></Fitting>';
              e += '<ResetLetterSpacing/><IgnoreFlightCheck/>';
              e += '<MissingFont>Noto Sans Regular</MissingFont><SubstituteAllChars/>';
              e += '<TargetLang>en</TargetLang></Command>';
              e += '<Command Name="SavePDF"><File>' + m + '</File></Command></Commands>';
              d(e, p, g);
              k = FS.readFile(m).buffer;
              e = FS.readFile(p).buffer;
              n = FS.readFile(q).buffer;
              FS.unlink(m);
              FS.unlink(p);
              FS.unlink(q);
              postMessage(
                {
                  cmd: 'insertNewTextBox',
                  pageNumber: g,
                  pdfBuffer: k,
                  exportXML: n,
                  resultsXML: e,
                  contentHTML: c,
                },
                [k, n, e],
              );
              break;
            case 'AlignParaText':
              g = c.pageNumber;
              k = c.galleyID;
              q = c.alignment;
              m = c.topVal1;
              e = c.leftVal1;
              n = c.bottomVal1;
              r = c.rightVal1;
              x = c.topVal2;
              F = c.leftVal2;
              G = c.bottomVal2;
              var K = c.rightVal2;
              g != t && b(g, !0, c.pdfFile, c.tableData, !1);
              c = 'outputFile' + g + '.pdf';
              p = 'results' + g + '.xml';
              var B = '<Commands><Command Name="AlignParaText">' + ('<GID>' + k + '</GID>');
              '' !== m &&
                ((B =
                  B +
                  ('<StartRect><Top>' + m + '</Top><Left>' + e + '</Left>') +
                  ('<Bottom>' + n + '</Bottom><Right>' + r + '</Right></StartRect>') +
                  ('<EndRect><Top>' + x + '</Top><Left>' + F + '</Left>')),
                (B += '<Bottom>' + G + '</Bottom><Right>' + K + '</Right></EndRect>'));
              B += '<Align>' + q + '</Align></Command>';
              B += '<Command Name="SavePDF"><File>' + c + '</File>';
              B += '</Command></Commands>';
              d(B, p, g);
              q = FS.readFile(c).buffer;
              m = FS.readFile(p).buffer;
              FS.unlink(c);
              FS.unlink(p);
              postMessage(
                {
                  cmd: 'alignParagraph',
                  pageNumber: g,
                  pdfBuffer: q,
                  resultsXML: m,
                  id: k,
                },
                [q, m],
              );
              break;
            case 'insertImage':
              (n = c.pdfFile),
                (g = c.pageNumber),
                (p = c.newImage),
                (q = c.scaleType),
                (m = c.topVal),
                (e = c.leftVal),
                (k = c.bottomVal),
                (c = c.rightVal),
                (r = new TextEncoder().encode('').buffer),
                g != t && b(g, !0, n, r, !1),
                (n = 'outputFile' + g + '.pdf'),
                (r = 'results' + g + '.xml'),
                (x = 'imageFile' + g + '.jpg'),
                FS.writeFile(x, a.from(p)),
                (p =
                  '<Commands><Command Name="Place Image">' +
                  ('<File>' + x + '</File>') +
                  ('<Scale>' + q + '</Scale>') +
                  ('<Rect><Top>' + m + '</Top><Left>' + e + '</Left>')),
                (p += '<Bottom>' + k + '</Bottom><Right>' + c + '</Right></Rect></Command>'),
                (p += '<Command Name="SavePDF"><File>' + n + '</File>'),
                (p += '</Command></Commands>'),
                d(p, r, g),
                (c = FS.readFile(n).buffer),
                (k = FS.readFile(r).buffer),
                FS.unlink(n),
                FS.unlink(r),
                FS.unlink(x),
                postMessage(
                  {
                    cmd: 'insertImage',
                    pageNumber: g,
                    pdfBuffer: c,
                    resultsXML: k,
                  },
                  [c, k],
                );
          }
        };
      }).call(this, g(11).Buffer);
    },
    function (d, h, g) {
      (function (a) {
        function e() {
          try {
            var f = new Uint8Array(1);
            f.__proto__ = {
              __proto__: Uint8Array.prototype,
              foo: function () {
                return 42;
              },
            };
            return 42 === f.foo() && 'function' === typeof f.subarray && 0 === f.subarray(1, 1).byteLength;
          } catch (l) {
            return !1;
          }
        }
        function d(f, l) {
          if ((b.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823) < l) throw new RangeError('Invalid typed array length');
          b.TYPED_ARRAY_SUPPORT ? ((f = new Uint8Array(l)), (f.__proto__ = b.prototype)) : (null === f && (f = new b(l)), (f.length = l));
          return f;
        }
        function b(f, l, a) {
          if (!(b.TYPED_ARRAY_SUPPORT || this instanceof b)) return new b(f, l, a);
          if ('number' === typeof f) {
            if ('string' === typeof l) throw Error('If encoding is specified then the first argument must be a string');
            return n(this, f);
          }
          return q(this, f, l, a);
        }
        function q(f, l, a, c) {
          if ('number' === typeof l) throw new TypeError('"value" argument must not be a number');
          if ('undefined' !== typeof ArrayBuffer && l instanceof ArrayBuffer) {
            l.byteLength;
            if (0 > a || l.byteLength < a) throw new RangeError("'offset' is out of bounds");
            if (l.byteLength < a + (c || 0)) throw new RangeError("'length' is out of bounds");
            l = void 0 === a && void 0 === c ? new Uint8Array(l) : void 0 === c ? new Uint8Array(l, a) : new Uint8Array(l, a, c);
            b.TYPED_ARRAY_SUPPORT ? ((f = l), (f.__proto__ = b.prototype)) : (f = p(f, l));
            return f;
          }
          if ('string' === typeof l) {
            c = f;
            f = a;
            if ('string' !== typeof f || '' === f) f = 'utf8';
            if (!b.isEncoding(f)) throw new TypeError('"encoding" must be a valid string encoding');
            a = u(l, f) | 0;
            c = d(c, a);
            l = c.write(l, f);
            l !== a && (c = c.slice(0, l));
            return c;
          }
          return w(f, l);
        }
        function c(f) {
          if ('number' !== typeof f) throw new TypeError('"size" argument must be a number');
          if (0 > f) throw new RangeError('"size" argument must not be negative');
        }
        function n(f, l) {
          c(l);
          f = d(f, 0 > l ? 0 : t(l) | 0);
          if (!b.TYPED_ARRAY_SUPPORT) for (var a = 0; a < l; ++a) f[a] = 0;
          return f;
        }
        function p(f, b) {
          var l = 0 > b.length ? 0 : t(b.length) | 0;
          f = d(f, l);
          for (var a = 0; a < l; a += 1) f[a] = b[a] & 255;
          return f;
        }
        function w(f, l) {
          if (b.isBuffer(l)) {
            var a = t(l.length) | 0;
            f = d(f, a);
            if (0 === f.length) return f;
            l.copy(f, 0, 0, a);
            return f;
          }
          if (l) {
            if (('undefined' !== typeof ArrayBuffer && l.buffer instanceof ArrayBuffer) || 'length' in l)
              return (a = 'number' !== typeof l.length) || ((a = l.length), (a = a !== a)), a ? d(f, 0) : p(f, l);
            if ('Buffer' === l.type && N(l.data)) return p(f, l.data);
          }
          throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
        }
        function t(f) {
          if (f >= (b.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823))
            throw new RangeError(
              'Attempt to allocate Buffer larger than maximum size: 0x' + (b.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823).toString(16) + ' bytes',
            );
          return f | 0;
        }
        function u(f, l) {
          if (b.isBuffer(f)) return f.length;
          if ('undefined' !== typeof ArrayBuffer && 'function' === typeof ArrayBuffer.isView && (ArrayBuffer.isView(f) || f instanceof ArrayBuffer))
            return f.byteLength;
          'string' !== typeof f && (f = '' + f);
          var a = f.length;
          if (0 === a) return 0;
          for (var c = !1; ; )
            switch (l) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return a;
              case 'utf8':
              case 'utf-8':
              case void 0:
                return B(f).length;
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return 2 * a;
              case 'hex':
                return a >>> 1;
              case 'base64':
                return L.toByteArray(K(f)).length;
              default:
                if (c) return B(f).length;
                l = ('' + l).toLowerCase();
                c = !0;
            }
        }
        function k(f, b, a) {
          var l = !1;
          if (void 0 === b || 0 > b) b = 0;
          if (b > this.length) return '';
          if (void 0 === a || a > this.length) a = this.length;
          if (0 >= a) return '';
          a >>>= 0;
          b >>>= 0;
          if (a <= b) return '';
          for (f || (f = 'utf8'); ; )
            switch (f) {
              case 'hex':
                f = b;
                b = a;
                a = this.length;
                if (!f || 0 > f) f = 0;
                if (!b || 0 > b || b > a) b = a;
                l = '';
                for (a = f; a < b; ++a) (f = l), (l = this[a]), (l = 16 > l ? '0' + l.toString(16) : l.toString(16)), (l = f + l);
                return l;
              case 'utf8':
              case 'utf-8':
                return J(this, b, a);
              case 'ascii':
                f = '';
                for (a = Math.min(this.length, a); b < a; ++b) f += String.fromCharCode(this[b] & 127);
                return f;
              case 'latin1':
              case 'binary':
                f = '';
                for (a = Math.min(this.length, a); b < a; ++b) f += String.fromCharCode(this[b]);
                return f;
              case 'base64':
                return (b = 0 === b && a === this.length ? L.fromByteArray(this) : L.fromByteArray(this.slice(b, a))), b;
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                b = this.slice(b, a);
                a = '';
                for (f = 0; f < b.length; f += 2) a += String.fromCharCode(b[f] + 256 * b[f + 1]);
                return a;
              default:
                if (l) throw new TypeError('Unknown encoding: ' + f);
                f = (f + '').toLowerCase();
                l = !0;
            }
        }
        function z(b, l, a) {
          var f = b[l];
          b[l] = b[a];
          b[a] = f;
        }
        function C(f, l, a, c, d) {
          if (0 === f.length) return -1;
          'string' === typeof a ? ((c = a), (a = 0)) : 2147483647 < a ? (a = 2147483647) : -2147483648 > a && (a = -2147483648);
          a = +a;
          isNaN(a) && (a = d ? 0 : f.length - 1);
          0 > a && (a = f.length + a);
          if (a >= f.length) {
            if (d) return -1;
            a = f.length - 1;
          } else if (0 > a)
            if (d) a = 0;
            else return -1;
          'string' === typeof l && (l = b.from(l, c));
          if (b.isBuffer(l)) return 0 === l.length ? -1 : I(f, l, a, c, d);
          if ('number' === typeof l)
            return (
              (l &= 255),
              b.TYPED_ARRAY_SUPPORT && 'function' === typeof Uint8Array.prototype.indexOf
                ? d
                  ? Uint8Array.prototype.indexOf.call(f, l, a)
                  : Uint8Array.prototype.lastIndexOf.call(f, l, a)
                : I(f, [l], a, c, d)
            );
          throw new TypeError('val must be string, number or Buffer');
        }
        function I(b, a, c, d, e) {
          function f(b, f) {
            return 1 === l ? b[f] : b.readUInt16BE(f * l);
          }
          var l = 1,
            A = b.length,
            g = a.length;
          if (void 0 !== d && ((d = String(d).toLowerCase()), 'ucs2' === d || 'ucs-2' === d || 'utf16le' === d || 'utf-16le' === d)) {
            if (2 > b.length || 2 > a.length) return -1;
            l = 2;
            A /= 2;
            g /= 2;
            c /= 2;
          }
          if (e)
            for (d = -1; c < A; c++)
              if (f(b, c) === f(a, -1 === d ? 0 : c - d)) {
                if ((-1 === d && (d = c), c - d + 1 === g)) return d * l;
              } else -1 !== d && (c -= c - d), (d = -1);
          else
            for (c + g > A && (c = A - g); 0 <= c; c--) {
              A = !0;
              for (d = 0; d < g; d++)
                if (f(b, c + d) !== f(a, d)) {
                  A = !1;
                  break;
                }
              if (A) return c;
            }
          return -1;
        }
        function J(b, a, c) {
          c = Math.min(b.length, c);
          for (var f = []; a < c; ) {
            var l = b[a],
              d = null,
              A = 239 < l ? 4 : 223 < l ? 3 : 191 < l ? 2 : 1;
            if (a + A <= c)
              switch (A) {
                case 1:
                  128 > l && (d = l);
                  break;
                case 2:
                  var e = b[a + 1];
                  128 === (e & 192) && ((l = ((l & 31) << 6) | (e & 63)), 127 < l && (d = l));
                  break;
                case 3:
                  e = b[a + 1];
                  var g = b[a + 2];
                  128 === (e & 192) &&
                    128 === (g & 192) &&
                    ((l = ((l & 15) << 12) | ((e & 63) << 6) | (g & 63)), 2047 < l && (55296 > l || 57343 < l) && (d = l));
                  break;
                case 4:
                  e = b[a + 1];
                  g = b[a + 2];
                  var h = b[a + 3];
                  128 === (e & 192) &&
                    128 === (g & 192) &&
                    128 === (h & 192) &&
                    ((l = ((l & 15) << 18) | ((e & 63) << 12) | ((g & 63) << 6) | (h & 63)), 65535 < l && 1114112 > l && (d = l));
              }
            null === d ? ((d = 65533), (A = 1)) : 65535 < d && ((d -= 65536), f.push(((d >>> 10) & 1023) | 55296), (d = 56320 | (d & 1023)));
            f.push(d);
            a += A;
          }
          b = f.length;
          if (b <= O) f = String.fromCharCode.apply(String, f);
          else {
            c = '';
            for (a = 0; a < b; ) c += String.fromCharCode.apply(String, f.slice(a, (a += O)));
            f = c;
          }
          return f;
        }
        function v(b, a, c) {
          if (0 !== b % 1 || 0 > b) throw new RangeError('offset is not uint');
          if (b + a > c) throw new RangeError('Trying to access beyond buffer length');
        }
        function y(f, a, c, d, e, g) {
          if (!b.isBuffer(f)) throw new TypeError('"buffer" argument must be a Buffer instance');
          if (a > e || a < g) throw new RangeError('"value" argument is out of bounds');
          if (c + d > f.length) throw new RangeError('Index out of range');
        }
        function E(b, a, c, d) {
          0 > a && (a = 65535 + a + 1);
          for (var f = 0, l = Math.min(b.length - c, 2); f < l; ++f) b[c + f] = (a & (255 << (8 * (d ? f : 1 - f)))) >>> (8 * (d ? f : 1 - f));
        }
        function r(b, a, c, d) {
          0 > a && (a = 4294967295 + a + 1);
          for (var f = 0, l = Math.min(b.length - c, 4); f < l; ++f) b[c + f] = (a >>> (8 * (d ? f : 3 - f))) & 255;
        }
        function x(b, a, c, d, e, g) {
          if (c + d > b.length) throw new RangeError('Index out of range');
          if (0 > c) throw new RangeError('Index out of range');
        }
        function F(b, a, c, d, e) {
          e || x(b, a, c, 4, 3.4028234663852886e38, -3.4028234663852886e38);
          H.write(b, a, c, d, 23, 4);
          return c + 4;
        }
        function G(b, a, c, d, e) {
          e || x(b, a, c, 8, 1.7976931348623157e308, -1.7976931348623157e308);
          H.write(b, a, c, d, 52, 8);
          return c + 8;
        }
        function K(b) {
          b = b.trim ? b.trim() : b.replace(/^\s+|\s+$/g, '');
          b = b.replace(P, '');
          if (2 > b.length) return '';
          for (; 0 !== b.length % 4; ) b += '=';
          return b;
        }
        function B(b, a) {
          a = a || Infinity;
          for (var f, l = b.length, c = null, d = [], e = 0; e < l; ++e) {
            f = b.charCodeAt(e);
            if (55295 < f && 57344 > f) {
              if (!c) {
                if (56319 < f) {
                  -1 < (a -= 3) && d.push(239, 191, 189);
                  continue;
                } else if (e + 1 === l) {
                  -1 < (a -= 3) && d.push(239, 191, 189);
                  continue;
                }
                c = f;
                continue;
              }
              if (56320 > f) {
                -1 < (a -= 3) && d.push(239, 191, 189);
                c = f;
                continue;
              }
              f = (((c - 55296) << 10) | (f - 56320)) + 65536;
            } else c && -1 < (a -= 3) && d.push(239, 191, 189);
            c = null;
            if (128 > f) {
              if (0 > --a) break;
              d.push(f);
            } else if (2048 > f) {
              if (0 > (a -= 2)) break;
              d.push((f >> 6) | 192, (f & 63) | 128);
            } else if (65536 > f) {
              if (0 > (a -= 3)) break;
              d.push((f >> 12) | 224, ((f >> 6) & 63) | 128, (f & 63) | 128);
            } else if (1114112 > f) {
              if (0 > (a -= 4)) break;
              d.push((f >> 18) | 240, ((f >> 12) & 63) | 128, ((f >> 6) & 63) | 128, (f & 63) | 128);
            } else throw Error('Invalid code point');
          }
          return d;
        }
        function M(b) {
          for (var f = [], a = 0; a < b.length; ++a) f.push(b.charCodeAt(a) & 255);
          return f;
        }
        function D(b, a, c, d) {
          for (var f = 0; f < d && !(f + c >= a.length || f >= b.length); ++f) a[f + c] = b[f];
          return f;
        }
        var L = g(13),
          H = g(14),
          N = g(15);
        h.Buffer = b;
        h.SlowBuffer = function (f) {
          +f != f && (f = 0);
          return b.alloc(+f);
        };
        h.INSPECT_MAX_BYTES = 50;
        b.TYPED_ARRAY_SUPPORT = void 0 !== a.TYPED_ARRAY_SUPPORT ? a.TYPED_ARRAY_SUPPORT : e();
        h.kMaxLength = b.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
        b.poolSize = 8192;
        b._augment = function (f) {
          f.__proto__ = b.prototype;
          return f;
        };
        b.from = function (b, a, c) {
          return q(null, b, a, c);
        };
        b.TYPED_ARRAY_SUPPORT &&
          ((b.prototype.__proto__ = Uint8Array.prototype),
          (b.__proto__ = Uint8Array),
          'undefined' !== typeof Symbol &&
            Symbol.species &&
            b[Symbol.species] === b &&
            Object.defineProperty(b, Symbol.species, {
              value: null,
              configurable: !0,
            }));
        b.alloc = function (b, a, e) {
          c(b);
          b = 0 >= b ? d(null, b) : void 0 !== a ? ('string' === typeof e ? d(null, b).fill(a, e) : d(null, b).fill(a)) : d(null, b);
          return b;
        };
        b.allocUnsafe = function (b) {
          return n(null, b);
        };
        b.allocUnsafeSlow = function (b) {
          return n(null, b);
        };
        b.isBuffer = function (b) {
          return !(null == b || !b._isBuffer);
        };
        b.compare = function (a, c) {
          if (!b.isBuffer(a) || !b.isBuffer(c)) throw new TypeError('Arguments must be Buffers');
          if (a === c) return 0;
          for (var f = a.length, l = c.length, d = 0, e = Math.min(f, l); d < e; ++d)
            if (a[d] !== c[d]) {
              f = a[d];
              l = c[d];
              break;
            }
          return f < l ? -1 : l < f ? 1 : 0;
        };
        b.isEncoding = function (b) {
          switch (String(b).toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'latin1':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return !0;
            default:
              return !1;
          }
        };
        b.concat = function (a, c) {
          if (!N(a)) throw new TypeError('"list" argument must be an Array of Buffers');
          if (0 === a.length) return b.alloc(0);
          var f;
          if (void 0 === c) for (f = c = 0; f < a.length; ++f) c += a[f].length;
          c = b.allocUnsafe(c);
          var l = 0;
          for (f = 0; f < a.length; ++f) {
            var d = a[f];
            if (!b.isBuffer(d)) throw new TypeError('"list" argument must be an Array of Buffers');
            d.copy(c, l);
            l += d.length;
          }
          return c;
        };
        b.byteLength = u;
        b.prototype._isBuffer = !0;
        b.prototype.swap16 = function () {
          var b = this.length;
          if (0 !== b % 2) throw new RangeError('Buffer size must be a multiple of 16-bits');
          for (var a = 0; a < b; a += 2) z(this, a, a + 1);
          return this;
        };
        b.prototype.swap32 = function () {
          var b = this.length;
          if (0 !== b % 4) throw new RangeError('Buffer size must be a multiple of 32-bits');
          for (var a = 0; a < b; a += 4) z(this, a, a + 3), z(this, a + 1, a + 2);
          return this;
        };
        b.prototype.swap64 = function () {
          var b = this.length;
          if (0 !== b % 8) throw new RangeError('Buffer size must be a multiple of 64-bits');
          for (var a = 0; a < b; a += 8) z(this, a, a + 7), z(this, a + 1, a + 6), z(this, a + 2, a + 5), z(this, a + 3, a + 4);
          return this;
        };
        b.prototype.toString = function () {
          var b = this.length | 0;
          return 0 === b ? '' : 0 === arguments.length ? J(this, 0, b) : k.apply(this, arguments);
        };
        b.prototype.equals = function (a) {
          if (!b.isBuffer(a)) throw new TypeError('Argument must be a Buffer');
          return this === a ? !0 : 0 === b.compare(this, a);
        };
        b.prototype.inspect = function () {
          var b = '',
            a = h.INSPECT_MAX_BYTES;
          0 < this.length && ((b = this.toString('hex', 0, a).match(/.{2}/g).join(' ')), this.length > a && (b += ' ... '));
          return '<Buffer ' + b + '>';
        };
        b.prototype.compare = function (a, c, d, e, g) {
          if (!b.isBuffer(a)) throw new TypeError('Argument must be a Buffer');
          void 0 === c && (c = 0);
          void 0 === d && (d = a ? a.length : 0);
          void 0 === e && (e = 0);
          void 0 === g && (g = this.length);
          if (0 > c || d > a.length || 0 > e || g > this.length) throw new RangeError('out of range index');
          if (e >= g && c >= d) return 0;
          if (e >= g) return -1;
          if (c >= d) return 1;
          c >>>= 0;
          d >>>= 0;
          e >>>= 0;
          g >>>= 0;
          if (this === a) return 0;
          var f = g - e,
            l = d - c,
            A = Math.min(f, l);
          e = this.slice(e, g);
          a = a.slice(c, d);
          for (c = 0; c < A; ++c)
            if (e[c] !== a[c]) {
              f = e[c];
              l = a[c];
              break;
            }
          return f < l ? -1 : l < f ? 1 : 0;
        };
        b.prototype.includes = function (b, a, c) {
          return -1 !== this.indexOf(b, a, c);
        };
        b.prototype.indexOf = function (b, a, c) {
          return C(this, b, a, c, !0);
        };
        b.prototype.lastIndexOf = function (b, a, c) {
          return C(this, b, a, c, !1);
        };
        b.prototype.write = function (b, a, c, d) {
          if (void 0 === a) (d = 'utf8'), (c = this.length), (a = 0);
          else if (void 0 === c && 'string' === typeof a) (d = a), (c = this.length), (a = 0);
          else if (isFinite(a)) (a |= 0), isFinite(c) ? ((c |= 0), void 0 === d && (d = 'utf8')) : ((d = c), (c = void 0));
          else throw Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
          var f = this.length - a;
          if (void 0 === c || c > f) c = f;
          if ((0 < b.length && (0 > c || 0 > a)) || a > this.length) throw new RangeError('Attempt to write outside buffer bounds');
          d || (d = 'utf8');
          for (f = !1; ; )
            switch (d) {
              case 'hex':
                a: {
                  a = Number(a) || 0;
                  d = this.length - a;
                  c ? ((c = Number(c)), c > d && (c = d)) : (c = d);
                  d = b.length;
                  if (0 !== d % 2) throw new TypeError('Invalid hex string');
                  c > d / 2 && (c = d / 2);
                  for (d = 0; d < c; ++d) {
                    f = parseInt(b.substr(2 * d, 2), 16);
                    if (isNaN(f)) {
                      b = d;
                      break a;
                    }
                    this[a + d] = f;
                  }
                  b = d;
                }
                return b;
              case 'utf8':
              case 'utf-8':
                return D(B(b, this.length - a), this, a, c);
              case 'ascii':
                return D(M(b), this, a, c);
              case 'latin1':
              case 'binary':
                return D(M(b), this, a, c);
              case 'base64':
                return D(L.toByteArray(K(b)), this, a, c);
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                d = b;
                f = this.length - a;
                for (var l = [], e = 0; e < d.length && !(0 > (f -= 2)); ++e) {
                  var g = d.charCodeAt(e);
                  b = g >> 8;
                  g %= 256;
                  l.push(g);
                  l.push(b);
                }
                return D(l, this, a, c);
              default:
                if (f) throw new TypeError('Unknown encoding: ' + d);
                d = ('' + d).toLowerCase();
                f = !0;
            }
        };
        b.prototype.toJSON = function () {
          return {
            type: 'Buffer',
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        };
        var O = 4096;
        b.prototype.slice = function (a, c) {
          var f = this.length;
          a = ~~a;
          c = void 0 === c ? f : ~~c;
          0 > a ? ((a += f), 0 > a && (a = 0)) : a > f && (a = f);
          0 > c ? ((c += f), 0 > c && (c = 0)) : c > f && (c = f);
          c < a && (c = a);
          if (b.TYPED_ARRAY_SUPPORT) (c = this.subarray(a, c)), (c.__proto__ = b.prototype);
          else {
            f = c - a;
            c = new b(f, void 0);
            for (var d = 0; d < f; ++d) c[d] = this[d + a];
          }
          return c;
        };
        b.prototype.readUIntLE = function (b, a, c) {
          b |= 0;
          a |= 0;
          c || v(b, a, this.length);
          c = this[b];
          for (var f = 1, d = 0; ++d < a && (f *= 256); ) c += this[b + d] * f;
          return c;
        };
        b.prototype.readUIntBE = function (b, a, c) {
          b |= 0;
          a |= 0;
          c || v(b, a, this.length);
          c = this[b + --a];
          for (var f = 1; 0 < a && (f *= 256); ) c += this[b + --a] * f;
          return c;
        };
        b.prototype.readUInt8 = function (b, a) {
          a || v(b, 1, this.length);
          return this[b];
        };
        b.prototype.readUInt16LE = function (b, a) {
          a || v(b, 2, this.length);
          return this[b] | (this[b + 1] << 8);
        };
        b.prototype.readUInt16BE = function (b, a) {
          a || v(b, 2, this.length);
          return (this[b] << 8) | this[b + 1];
        };
        b.prototype.readUInt32LE = function (b, a) {
          a || v(b, 4, this.length);
          return (this[b] | (this[b + 1] << 8) | (this[b + 2] << 16)) + 16777216 * this[b + 3];
        };
        b.prototype.readUInt32BE = function (b, a) {
          a || v(b, 4, this.length);
          return 16777216 * this[b] + ((this[b + 1] << 16) | (this[b + 2] << 8) | this[b + 3]);
        };
        b.prototype.readIntLE = function (b, a, c) {
          b |= 0;
          a |= 0;
          c || v(b, a, this.length);
          c = this[b];
          for (var f = 1, d = 0; ++d < a && (f *= 256); ) c += this[b + d] * f;
          c >= 128 * f && (c -= Math.pow(2, 8 * a));
          return c;
        };
        b.prototype.readIntBE = function (b, a, c) {
          b |= 0;
          a |= 0;
          c || v(b, a, this.length);
          c = a;
          for (var f = 1, d = this[b + --c]; 0 < c && (f *= 256); ) d += this[b + --c] * f;
          d >= 128 * f && (d -= Math.pow(2, 8 * a));
          return d;
        };
        b.prototype.readInt8 = function (b, a) {
          a || v(b, 1, this.length);
          return this[b] & 128 ? -1 * (255 - this[b] + 1) : this[b];
        };
        b.prototype.readInt16LE = function (b, a) {
          a || v(b, 2, this.length);
          b = this[b] | (this[b + 1] << 8);
          return b & 32768 ? b | 4294901760 : b;
        };
        b.prototype.readInt16BE = function (b, a) {
          a || v(b, 2, this.length);
          b = this[b + 1] | (this[b] << 8);
          return b & 32768 ? b | 4294901760 : b;
        };
        b.prototype.readInt32LE = function (b, a) {
          a || v(b, 4, this.length);
          return this[b] | (this[b + 1] << 8) | (this[b + 2] << 16) | (this[b + 3] << 24);
        };
        b.prototype.readInt32BE = function (b, a) {
          a || v(b, 4, this.length);
          return (this[b] << 24) | (this[b + 1] << 16) | (this[b + 2] << 8) | this[b + 3];
        };
        b.prototype.readFloatLE = function (b, a) {
          a || v(b, 4, this.length);
          return H.read(this, b, !0, 23, 4);
        };
        b.prototype.readFloatBE = function (b, a) {
          a || v(b, 4, this.length);
          return H.read(this, b, !1, 23, 4);
        };
        b.prototype.readDoubleLE = function (b, a) {
          a || v(b, 8, this.length);
          return H.read(this, b, !0, 52, 8);
        };
        b.prototype.readDoubleBE = function (b, a) {
          a || v(b, 8, this.length);
          return H.read(this, b, !1, 52, 8);
        };
        b.prototype.writeUIntLE = function (b, a, c, d) {
          b = +b;
          a |= 0;
          c |= 0;
          d || y(this, b, a, c, Math.pow(2, 8 * c) - 1, 0);
          d = 1;
          var f = 0;
          for (this[a] = b & 255; ++f < c && (d *= 256); ) this[a + f] = (b / d) & 255;
          return a + c;
        };
        b.prototype.writeUIntBE = function (b, a, c, d) {
          b = +b;
          a |= 0;
          c |= 0;
          d || y(this, b, a, c, Math.pow(2, 8 * c) - 1, 0);
          d = c - 1;
          var f = 1;
          for (this[a + d] = b & 255; 0 <= --d && (f *= 256); ) this[a + d] = (b / f) & 255;
          return a + c;
        };
        b.prototype.writeUInt8 = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 1, 255, 0);
          b.TYPED_ARRAY_SUPPORT || (a = Math.floor(a));
          this[c] = a & 255;
          return c + 1;
        };
        b.prototype.writeUInt16LE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 2, 65535, 0);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a & 255), (this[c + 1] = a >>> 8)) : E(this, a, c, !0);
          return c + 2;
        };
        b.prototype.writeUInt16BE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 2, 65535, 0);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a >>> 8), (this[c + 1] = a & 255)) : E(this, a, c, !1);
          return c + 2;
        };
        b.prototype.writeUInt32LE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 4, 4294967295, 0);
          b.TYPED_ARRAY_SUPPORT ? ((this[c + 3] = a >>> 24), (this[c + 2] = a >>> 16), (this[c + 1] = a >>> 8), (this[c] = a & 255)) : r(this, a, c, !0);
          return c + 4;
        };
        b.prototype.writeUInt32BE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 4, 4294967295, 0);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a >>> 24), (this[c + 1] = a >>> 16), (this[c + 2] = a >>> 8), (this[c + 3] = a & 255)) : r(this, a, c, !1);
          return c + 4;
        };
        b.prototype.writeIntLE = function (b, a, c, d) {
          b = +b;
          a |= 0;
          d || ((d = Math.pow(2, 8 * c - 1)), y(this, b, a, c, d - 1, -d));
          d = 0;
          var f = 1,
            e = 0;
          for (this[a] = b & 255; ++d < c && (f *= 256); ) 0 > b && 0 === e && 0 !== this[a + d - 1] && (e = 1), (this[a + d] = (((b / f) >> 0) - e) & 255);
          return a + c;
        };
        b.prototype.writeIntBE = function (b, a, c, d) {
          b = +b;
          a |= 0;
          d || ((d = Math.pow(2, 8 * c - 1)), y(this, b, a, c, d - 1, -d));
          d = c - 1;
          var f = 1,
            e = 0;
          for (this[a + d] = b & 255; 0 <= --d && (f *= 256); )
            0 > b && 0 === e && 0 !== this[a + d + 1] && (e = 1), (this[a + d] = (((b / f) >> 0) - e) & 255);
          return a + c;
        };
        b.prototype.writeInt8 = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 1, 127, -128);
          b.TYPED_ARRAY_SUPPORT || (a = Math.floor(a));
          0 > a && (a = 255 + a + 1);
          this[c] = a & 255;
          return c + 1;
        };
        b.prototype.writeInt16LE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 2, 32767, -32768);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a & 255), (this[c + 1] = a >>> 8)) : E(this, a, c, !0);
          return c + 2;
        };
        b.prototype.writeInt16BE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 2, 32767, -32768);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a >>> 8), (this[c + 1] = a & 255)) : E(this, a, c, !1);
          return c + 2;
        };
        b.prototype.writeInt32LE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 4, 2147483647, -2147483648);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a & 255), (this[c + 1] = a >>> 8), (this[c + 2] = a >>> 16), (this[c + 3] = a >>> 24)) : r(this, a, c, !0);
          return c + 4;
        };
        b.prototype.writeInt32BE = function (a, c, d) {
          a = +a;
          c |= 0;
          d || y(this, a, c, 4, 2147483647, -2147483648);
          0 > a && (a = 4294967295 + a + 1);
          b.TYPED_ARRAY_SUPPORT ? ((this[c] = a >>> 24), (this[c + 1] = a >>> 16), (this[c + 2] = a >>> 8), (this[c + 3] = a & 255)) : r(this, a, c, !1);
          return c + 4;
        };
        b.prototype.writeFloatLE = function (a, b, c) {
          return F(this, a, b, !0, c);
        };
        b.prototype.writeFloatBE = function (a, b, c) {
          return F(this, a, b, !1, c);
        };
        b.prototype.writeDoubleLE = function (a, b, c) {
          return G(this, a, b, !0, c);
        };
        b.prototype.writeDoubleBE = function (a, b, c) {
          return G(this, a, b, !1, c);
        };
        b.prototype.copy = function (a, c, d, e) {
          d || (d = 0);
          e || 0 === e || (e = this.length);
          c >= a.length && (c = a.length);
          c || (c = 0);
          0 < e && e < d && (e = d);
          if (e === d || 0 === a.length || 0 === this.length) return 0;
          if (0 > c) throw new RangeError('targetStart out of bounds');
          if (0 > d || d >= this.length) throw new RangeError('sourceStart out of bounds');
          if (0 > e) throw new RangeError('sourceEnd out of bounds');
          e > this.length && (e = this.length);
          a.length - c < e - d && (e = a.length - c + d);
          var f = e - d;
          if (this === a && d < c && c < e) for (e = f - 1; 0 <= e; --e) a[e + c] = this[e + d];
          else if (1e3 > f || !b.TYPED_ARRAY_SUPPORT) for (e = 0; e < f; ++e) a[e + c] = this[e + d];
          else Uint8Array.prototype.set.call(a, this.subarray(d, d + f), c);
          return f;
        };
        b.prototype.fill = function (a, c, d, e) {
          if ('string' === typeof a) {
            'string' === typeof c ? ((e = c), (c = 0), (d = this.length)) : 'string' === typeof d && ((e = d), (d = this.length));
            if (1 === a.length) {
              var f = a.charCodeAt(0);
              256 > f && (a = f);
            }
            if (void 0 !== e && 'string' !== typeof e) throw new TypeError('encoding must be a string');
            if ('string' === typeof e && !b.isEncoding(e)) throw new TypeError('Unknown encoding: ' + e);
          } else 'number' === typeof a && (a &= 255);
          if (0 > c || this.length < c || this.length < d) throw new RangeError('Out of range index');
          if (d <= c) return this;
          c >>>= 0;
          d = void 0 === d ? this.length : d >>> 0;
          a || (a = 0);
          if ('number' === typeof a) for (e = c; e < d; ++e) this[e] = a;
          else for (a = b.isBuffer(a) ? a : B(new b(a, e).toString()), f = a.length, e = 0; e < d - c; ++e) this[e + c] = a[e % f];
          return this;
        };
        var P = /[^+\/0-9A-Za-z-_]/g;
      }).call(this, g(12));
    },
    function (d, h) {
      h = (function () {
        return this;
      })();
      try {
        h = h || new Function('return this')();
      } catch (g) {
        'object' === typeof window && (h = window);
      }
      d.exports = h;
    },
    function (d, h, g) {
      function a(a) {
        var b = a.length;
        if (0 < b % 4) throw Error('Invalid string. Length must be a multiple of 4');
        a = a.indexOf('=');
        -1 === a && (a = b);
        return [a, a === b ? 0 : 4 - (a % 4)];
      }
      function e(a, b, d) {
        for (var c = [], e = b; e < d; e += 3)
          (b = ((a[e] << 16) & 16711680) + ((a[e + 1] << 8) & 65280) + (a[e + 2] & 255)),
            c.push(m[(b >> 18) & 63] + m[(b >> 12) & 63] + m[(b >> 6) & 63] + m[b & 63]);
        return c.join('');
      }
      h.byteLength = function (b) {
        b = a(b);
        var c = b[1];
        return (3 * (b[0] + c)) / 4 - c;
      };
      h.toByteArray = function (c) {
        var d = a(c);
        var e = d[0];
        d = d[1];
        var g = new q((3 * (e + d)) / 4 - d),
          h = 0,
          m = 0 < d ? e - 4 : e,
          k;
        for (k = 0; k < m; k += 4)
          (e = (b[c.charCodeAt(k)] << 18) | (b[c.charCodeAt(k + 1)] << 12) | (b[c.charCodeAt(k + 2)] << 6) | b[c.charCodeAt(k + 3)]),
            (g[h++] = (e >> 16) & 255),
            (g[h++] = (e >> 8) & 255),
            (g[h++] = e & 255);
        2 === d && ((e = (b[c.charCodeAt(k)] << 2) | (b[c.charCodeAt(k + 1)] >> 4)), (g[h++] = e & 255));
        1 === d &&
          ((e = (b[c.charCodeAt(k)] << 10) | (b[c.charCodeAt(k + 1)] << 4) | (b[c.charCodeAt(k + 2)] >> 2)), (g[h++] = (e >> 8) & 255), (g[h++] = e & 255));
        return g;
      };
      h.fromByteArray = function (a) {
        for (var b = a.length, c = b % 3, d = [], g = 0, h = b - c; g < h; g += 16383) d.push(e(a, g, g + 16383 > h ? h : g + 16383));
        1 === c
          ? ((a = a[b - 1]), d.push(m[a >> 2] + m[(a << 4) & 63] + '=='))
          : 2 === c && ((a = (a[b - 2] << 8) + a[b - 1]), d.push(m[a >> 10] + m[(a >> 4) & 63] + m[(a << 2) & 63] + '='));
        return d.join('');
      };
      var m = [],
        b = [],
        q = 'undefined' !== typeof Uint8Array ? Uint8Array : Array;
      for (d = 0; 64 > d; ++d)
        (m[d] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[d]),
          (b['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charCodeAt(d)] = d);
      b[45] = 62;
      b[95] = 63;
    },
    function (d, h) {
      h.read = function (d, a, e, h, b) {
        var g = 8 * b - h - 1;
        var c = (1 << g) - 1,
          m = c >> 1,
          p = -7;
        b = e ? b - 1 : 0;
        var w = e ? -1 : 1,
          t = d[a + b];
        b += w;
        e = t & ((1 << -p) - 1);
        t >>= -p;
        for (p += g; 0 < p; e = 256 * e + d[a + b], b += w, p -= 8);
        g = e & ((1 << -p) - 1);
        e >>= -p;
        for (p += h; 0 < p; g = 256 * g + d[a + b], b += w, p -= 8);
        if (0 === e) e = 1 - m;
        else {
          if (e === c) return g ? NaN : Infinity * (t ? -1 : 1);
          g += Math.pow(2, h);
          e -= m;
        }
        return (t ? -1 : 1) * g * Math.pow(2, e - h);
      };
      h.write = function (d, a, e, h, b, q) {
        var c,
          g = 8 * q - b - 1,
          m = (1 << g) - 1,
          w = m >> 1,
          t = 23 === b ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        q = h ? 0 : q - 1;
        var u = h ? 1 : -1,
          k = 0 > a || (0 === a && 0 > 1 / a) ? 1 : 0;
        a = Math.abs(a);
        isNaN(a) || Infinity === a
          ? ((a = isNaN(a) ? 1 : 0), (h = m))
          : ((h = Math.floor(Math.log(a) / Math.LN2)),
            1 > a * (c = Math.pow(2, -h)) && (h--, (c *= 2)),
            (a = 1 <= h + w ? a + t / c : a + t * Math.pow(2, 1 - w)),
            2 <= a * c && (h++, (c /= 2)),
            h + w >= m
              ? ((a = 0), (h = m))
              : 1 <= h + w
              ? ((a = (a * c - 1) * Math.pow(2, b)), (h += w))
              : ((a = a * Math.pow(2, w - 1) * Math.pow(2, b)), (h = 0)));
        for (; 8 <= b; d[e + q] = a & 255, q += u, a /= 256, b -= 8);
        h = (h << b) | a;
        for (g += b; 0 < g; d[e + q] = h & 255, q += u, h /= 256, g -= 8);
        d[e + q - u] |= 128 * k;
      };
    },
    function (d, h) {
      var g = {}.toString;
      d.exports =
        Array.isArray ||
        function (a) {
          return '[object Array]' == g.call(a);
        };
    },
  ]);
}).call(this || window);
