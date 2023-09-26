!function () {
  var n,
    i,
    a = {};
  function r(t) {
    var e;
    return (i[t] || ((e = i[t] = { i: t, l: !1, exports: {} }), n[t].call(e.exports, e, e.exports, r), (e.l = !0), e)).exports;
  }
  (a.scope = {}),
    (a.arrayIteratorImpl = function (t) {
      var e = 0;
      return function () {
        return e < t.length ? { done: !1, value: t[e++] } : { done: !0 };
      };
    }),
    (a.arrayIterator = function (t) {
      return { next: a.arrayIteratorImpl(t) };
    }),
    (a.makeIterator = function (t) {
      var e = 'undefined' != typeof Symbol && Symbol.iterator && t[Symbol.iterator];
      return e ? e.call(t) : a.arrayIterator(t);
    }),
    (a.getGlobal = function (t) {
      return ('undefined' == typeof window || window !== t) && 'undefined' != typeof global && null != global ? global : t;
    }),
    (a.global = a.getGlobal(this)),
    (a.ASSUME_ES5 = !1),
    (a.ASSUME_NO_NATIVE_MAP = !1),
    (a.ASSUME_NO_NATIVE_SET = !1),
    (a.SIMPLE_FROUND_POLYFILL = !1),
    (a.defineProperty =
      a.ASSUME_ES5 || 'function' == typeof Object.defineProperties
        ? Object.defineProperty
        : function (t, e, n) {
            t != Array.prototype && t != Object.prototype && (t[e] = n.value);
          }),
    (a.polyfill = function (t, e, n, i) {
      if (e) {
        for (n = a.global, t = t.split('.'), i = 0; i < t.length - 1; i++) {
          var r = t[i];
          r in n || (n[r] = {}), (n = n[r]);
        }
        (e = e((i = n[(t = t[t.length - 1])]))) != i && null != e && a.defineProperty(n, t, { configurable: !0, writable: !0, value: e });
      }
    }),
    (a.FORCE_POLYFILL_PROMISE = !1),
    a.polyfill(
      'Promise',
      function (t) {
        function e() {
          this.batch_ = null;
        }
        function s(n) {
          return n instanceof u
            ? n
            : new u(function (t, e) {
                t(n);
              });
        }
        if (t && !a.FORCE_POLYFILL_PROMISE) return t;
        (e.prototype.asyncExecute = function (t) {
          return null == this.batch_ && ((this.batch_ = []), this.asyncExecuteBatch_()), this.batch_.push(t), this;
        }),
          (e.prototype.asyncExecuteBatch_ = function () {
            var t = this;
            this.asyncExecuteFunction(function () {
              t.executeBatch_();
            });
          });
        function u(t) {
          (this.state_ = 0), (this.result_ = void 0), (this.onSettledCallbacks_ = []);
          var e = this.createResolveAndReject_();
          try {
            t(e.resolve, e.reject);
          } catch (t) {
            e.reject(t);
          }
        }
        var n = a.global.setTimeout,
          r =
            ((e.prototype.asyncExecuteFunction = function (t) {
              n(t, 0);
            }),
            (e.prototype.executeBatch_ = function () {
              for (; this.batch_ && this.batch_.length; ) {
                var t = this.batch_;
                this.batch_ = [];
                for (var e = 0; e < t.length; ++e) {
                  var n = t[e];
                  t[e] = null;
                  try {
                    n();
                  } catch (t) {
                    this.asyncThrow_(t);
                  }
                }
              }
              this.batch_ = null;
            }),
            (e.prototype.asyncThrow_ = function (t) {
              this.asyncExecuteFunction(function () {
                throw t;
              });
            }),
            (u.prototype.createResolveAndReject_ = function () {
              function t(e) {
                return function (t) {
                  i || ((i = !0), e.call(n, t));
                };
              }
              var n = this,
                i = !1;
              return { resolve: t(this.resolveTo_), reject: t(this.reject_) };
            }),
            (u.prototype.resolveTo_ = function (t) {
              if (t === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
              else if (t instanceof u) this.settleSameAsPromise_(t);
              else {
                switch (typeof t) {
                  case 'object':
                    var e = null != t;
                    break;
                  case 'function':
                    e = !0;
                    break;
                  default:
                    e = !1;
                }
                e ? this.resolveToNonPromiseObj_(t) : this.fulfill_(t);
              }
            }),
            (u.prototype.resolveToNonPromiseObj_ = function (t) {
              var e = void 0;
              try {
                e = t.then;
              } catch (t) {
                return void this.reject_(t);
              }
              'function' == typeof e ? this.settleSameAsThenable_(e, t) : this.fulfill_(t);
            }),
            (u.prototype.reject_ = function (t) {
              this.settle_(2, t);
            }),
            (u.prototype.fulfill_ = function (t) {
              this.settle_(1, t);
            }),
            (u.prototype.settle_ = function (t, e) {
              if (0 != this.state_) throw Error('Cannot settle(' + t + ', ' + e + '): Promise already settled in state' + this.state_);
              (this.state_ = t), (this.result_ = e), this.executeOnSettledCallbacks_();
            }),
            (u.prototype.executeOnSettledCallbacks_ = function () {
              if (null != this.onSettledCallbacks_) {
                for (var t = 0; t < this.onSettledCallbacks_.length; ++t) r.asyncExecute(this.onSettledCallbacks_[t]);
                this.onSettledCallbacks_ = null;
              }
            }),
            new e());
        return (
          (u.prototype.settleSameAsPromise_ = function (t) {
            var e = this.createResolveAndReject_();
            t.callWhenSettled_(e.resolve, e.reject);
          }),
          (u.prototype.settleSameAsThenable_ = function (t, e) {
            var n = this.createResolveAndReject_();
            try {
              t.call(e, n.resolve, n.reject);
            } catch (t) {
              n.reject(t);
            }
          }),
          (u.prototype.then = function (t, e) {
            function n(e, t) {
              return 'function' == typeof e
                ? function (t) {
                    try {
                      i(e(t));
                    } catch (t) {
                      r(t);
                    }
                  }
                : t;
            }
            var i,
              r,
              o = new u(function (t, e) {
                (i = t), (r = e);
              });
            return this.callWhenSettled_(n(t, i), n(e, r)), o;
          }),
          (u.prototype.catch = function (t) {
            return this.then(void 0, t);
          }),
          (u.prototype.callWhenSettled_ = function (t, e) {
            function n() {
              switch (i.state_) {
                case 1:
                  t(i.result_);
                  break;
                case 2:
                  e(i.result_);
                  break;
                default:
                  throw Error('Unexpected state: ' + i.state_);
              }
            }
            var i = this;
            null == this.onSettledCallbacks_ ? r.asyncExecute(n) : this.onSettledCallbacks_.push(n);
          }),
          (u.resolve = s),
          (u.reject = function (n) {
            return new u(function (t, e) {
              e(n);
            });
          }),
          (u.race = function (r) {
            return new u(function (t, e) {
              for (var n = a.makeIterator(r), i = n.next(); !i.done; i = n.next()) s(i.value).callWhenSettled_(t, e);
            });
          }),
          (u.all = function (t) {
            var e = a.makeIterator(t),
              o = e.next();
            return o.done
              ? s([])
              : new u(function (n, t) {
                  for (
                    var i = [], r = 0;
                    i.push(void 0),
                      r++,
                      s(o.value).callWhenSettled_(
                        (function t(e) {
                          return function (t) {
                            (i[e] = t), 0 == --r && n(i);
                          };
                        })(i.length - 1),
                        t,
                      ),
                      !(o = e.next()).done;

                  );
                });
          }),
          u
        );
      },
      'es6',
      'es3',
    ),
    (a.checkStringArgs = function (t, e, n) {
      if (null == t) throw new TypeError("The 'this' value for String.prototype." + n + ' must not be null or undefined');
      if (e instanceof RegExp) throw new TypeError('First argument to String.prototype.' + n + ' must not be a regular expression');
      return t + '';
    }),
    a.polyfill(
      'String.prototype.startsWith',
      function (t) {
        return (
          t ||
          function (t, e) {
            var n = a.checkStringArgs(this, t, 'startsWith'),
              i = n.length,
              r = (t += '').length;
            e = Math.max(0, Math.min(0 | e, n.length));
            for (var o = 0; o < r && e < i; ) if (n[e++] != t[o++]) return !1;
            return r <= o;
          }
        );
      },
      'es6',
      'es3',
    ),
    a.polyfill(
      'Array.from',
      function (t) {
        return (
          t ||
          function (t, e, n) {
            e =
              null != e
                ? e
                : function (t) {
                    return t;
                  };
            var i = [],
              r = 'undefined' != typeof Symbol && Symbol.iterator && t[Symbol.iterator];
            if ('function' == typeof r) {
              t = r.call(t);
              for (var o = 0; !(r = t.next()).done; ) i.push(e.call(n, r.value, o++));
            } else for (r = t.length, o = 0; o < r; o++) i.push(e.call(n, t[o], o));
            return i;
          }
        );
      },
      'es6',
      'es3',
    ),
    (n = [
      function (t, e, n) {
        t.exports = n(1);
      },
      function (t, e) {
        function d(t) {
          return (d =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function (t) {
                  return typeof t;
                }
              : function (t) {
                  return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : typeof t;
                })(t);
        }
        var c = [],
          o = [],
          s = 0,
          n = 0,
          u = [],
          a = [],
          h = 'undefined' == typeof window ? this : window;
        function i() {
          return {
            putBool: function (t, e, n) {
              if (!1 !== n && !0 !== n) throw new TypeError('An boolean value is expected for putBool');
              t[e] = n;
            },
            putNumber: function (t, e, n) {
              t[e] = 0 + n;
            },
            putString: function (t, e, n) {
              t[e] = '' + n;
            },
            jsColorToNumber: function (t) {
              return 4278190080 + 65536 * Math.floor(t.R) + 256 * Math.floor(t.G) + Math.floor(t.B);
            },
            jsColorFromNumber: function (t) {
              return {
                A: (5.960464477539063e-8 * t) & 255,
                R: (16711680 & (0 | t)) >>> 16,
                G: (65280 & (0 | t)) >>> 8,
                B: 255 & (0 | t),
              };
            },
          };
        }
        function r(i) {
          return Promise.resolve().then(function t(e) {
            var n = (e = i.next(e)).value;
            return e.done ? e.value : n.then(t);
          });
        }
        var l = h.Core.PDFNet || {};
        (l.Convert = h.Core.PDFNet && h.Core.PDFNet.Convert ? h.Core.PDFNet.Convert : {}),
          (l.Optimizer = {}),
          h.Core && h.Core.enableFullPDF(),
          (h.isArrayBuffer = function (t) {
            return t instanceof ArrayBuffer || (null != t && null != t.constructor && 'ArrayBuffer' === t.constructor.name && 'number' == typeof t.byteLength);
          }),
          (l.Destroyable = function () {
            if (this.constructor === l.Destroyable) throw Error("Can't instantiate abstract class!");
          }),
          (l.Destroyable.prototype.takeOwnership = function () {
            O(this.id);
          }),
          (l.Destroyable.prototype.destroy = function () {
            return (
              this.takeOwnership(),
              l.sendWithPromise(this.name + '.destroy', {
                auto_dealloc_obj: this.id,
              })
            );
          }),
          (l.Action = function (t) {
            (this.name = 'Action'), (this.id = t);
          }),
          (l.ActionParameter = function (t) {
            (this.name = 'ActionParameter'), (this.id = t);
          }),
          (l.ActionParameter.prototype = Object.create(l.Destroyable.prototype)),
          (l.Annot = function (t) {
            (this.name = 'Annot'), (this.id = t);
          }),
          (l.AnnotBorderStyle = function (t) {
            (this.name = 'AnnotBorderStyle'), (this.id = t);
          }),
          (l.AnnotBorderStyle.prototype = Object.create(l.Destroyable.prototype)),
          (l.AttrObj = function (t) {
            (this.name = 'AttrObj'), (this.id = t);
          }),
          (l.Bookmark = function (t) {
            (this.name = 'Bookmark'), (this.id = t);
          }),
          (l.ByteRange = function (t, e) {
            if (((this.name = 'ByteRange'), !t || void 0 !== e))
              return new l.ByteRange({
                m_offset: (t = void 0 === t ? 0 : t),
                m_size: (e = void 0 === e ? 0 : e),
              });
            W(t, this);
          }),
          (l.CaretAnnot = function (t) {
            (this.name = 'CaretAnnot'), (this.id = t);
          }),
          (l.CheckBoxWidget = function (t) {
            (this.name = 'CheckBoxWidget'), (this.id = t);
          }),
          (l.ChunkRenderer = function (t) {
            (this.name = 'ChunkRenderer'), (this.id = t);
          }),
          (l.CircleAnnot = function (t) {
            (this.name = 'CircleAnnot'), (this.id = t);
          }),
          (l.ClassMap = function (t) {
            (this.name = 'ClassMap'), (this.id = t);
          }),
          (l.ColorPt = function (t) {
            (this.name = 'ColorPt'), (this.id = t);
          }),
          (l.ColorPt.prototype = Object.create(l.Destroyable.prototype)),
          (l.ColorSpace = function (t) {
            (this.name = 'ColorSpace'), (this.id = t);
          }),
          (l.ColorSpace.prototype = Object.create(l.Destroyable.prototype)),
          (l.ComboBoxWidget = function (t) {
            (this.name = 'ComboBoxWidget'), (this.id = t);
          }),
          (l.ContentItem = function (t, e) {
            if (((this.name = 'ContentItem'), !t || void 0 !== e))
              return new l.ContentItem({
                o: (t = void 0 === t ? '0' : t),
                p: (e = void 0 === e ? '0' : e),
              });
            W(t, this);
          }),
          (l.ContentReplacer = function (t) {
            (this.name = 'ContentReplacer'), (this.id = t);
          }),
          (l.ContentReplacer.prototype = Object.create(l.Destroyable.prototype)),
          (l.ConversionMonitor = function (t) {
            (this.name = 'ConversionMonitor'), (this.id = t);
          }),
          (l.ConversionMonitor.prototype = Object.create(l.Destroyable.prototype)),
          (l.Date = function (t, e, n, i, r, o, s, u, a, c) {
            if (((this.name = 'Date'), !t || void 0 !== e))
              return new l.Date({
                year: (t = void 0 === t ? 0 : t),
                month: (e = void 0 === e ? 0 : e),
                day: (n = void 0 === n ? 0 : n),
                hour: (i = void 0 === i ? 0 : i),
                minute: (r = void 0 === r ? 0 : r),
                second: (o = void 0 === o ? 0 : o),
                UT: (s = void 0 === s ? 0 : s),
                UT_hour: (u = void 0 === u ? 0 : u),
                UT_minutes: (a = void 0 === a ? 0 : a),
                mp_obj: (c = void 0 === c ? '0' : c),
              });
            W(t, this);
          }),
          (l.Destination = function (t) {
            (this.name = 'Destination'), (this.id = t);
          }),
          (l.DictIterator = function (t) {
            (this.name = 'DictIterator'), (this.id = t);
          }),
          (l.DictIterator.prototype = Object.create(l.Destroyable.prototype)),
          (l.DigestAlgorithm = function (t) {
            (this.name = 'DigestAlgorithm'), (this.id = t);
          }),
          (l.DigitalSignatureField = function (t) {
            if (((this.name = 'DigitalSignatureField'), 'object' === d(t))) W(t, this);
            else if (void 0 !== t) return new l.DigitalSignatureField({ mp_field_dict_obj: t });
          }),
          (l.DisallowedChange = function (t) {
            (this.name = 'DisallowedChange'), (this.id = t);
          }),
          (l.DisallowedChange.prototype = Object.create(l.Destroyable.prototype)),
          (l.DocSnapshot = function (t) {
            (this.name = 'DocSnapshot'), (this.id = t);
          }),
          (l.DocSnapshot.prototype = Object.create(l.Destroyable.prototype)),
          (l.Element = function (t) {
            (this.name = 'Element'), (this.id = t);
          }),
          (l.ElementBuilder = function (t) {
            (this.name = 'ElementBuilder'), (this.id = t);
          }),
          (l.ElementBuilder.prototype = Object.create(l.Destroyable.prototype)),
          (l.ElementReader = function (t) {
            (this.name = 'ElementReader'), (this.id = t);
          }),
          (l.ElementReader.prototype = Object.create(l.Destroyable.prototype)),
          (l.ElementWriter = function (t) {
            (this.name = 'ElementWriter'), (this.id = t);
          }),
          (l.ElementWriter.prototype = Object.create(l.Destroyable.prototype)),
          (l.EmbeddedTimestampVerificationResult = function (t) {
            (this.name = 'EmbeddedTimestampVerificationResult'), (this.id = t);
          }),
          (l.EmbeddedTimestampVerificationResult.prototype = Object.create(l.Destroyable.prototype)),
          (l.FDFDoc = function (t) {
            (this.name = 'FDFDoc'), (this.id = t);
          }),
          (l.FDFDoc.prototype = Object.create(l.Destroyable.prototype)),
          (l.FDFField = function (t, e) {
            if (((this.name = 'FDFField'), !t || void 0 !== e))
              return new l.FDFField({
                mp_leaf_node: (t = void 0 === t ? '0' : t),
                mp_root_array: (e = void 0 === e ? '0' : e),
              });
            W(t, this);
          }),
          (l.Field = function (t, e) {
            if (((this.name = 'Field'), !t || void 0 !== e))
              return new l.Field({
                leaf_node: (t = void 0 === t ? '0' : t),
                builder: (e = void 0 === e ? '0' : e),
              });
            W(t, this);
          }),
          (l.FileAttachmentAnnot = function (t) {
            (this.name = 'FileAttachmentAnnot'), (this.id = t);
          }),
          (l.FileSpec = function (t) {
            (this.name = 'FileSpec'), (this.id = t);
          }),
          (l.Filter = function (t) {
            (this.name = 'Filter'), (this.id = t);
          }),
          (l.Filter.prototype = Object.create(l.Destroyable.prototype)),
          (l.FilterReader = function (t) {
            (this.name = 'FilterReader'), (this.id = t);
          }),
          (l.FilterReader.prototype = Object.create(l.Destroyable.prototype)),
          (l.FilterWriter = function (t) {
            (this.name = 'FilterWriter'), (this.id = t);
          }),
          (l.FilterWriter.prototype = Object.create(l.Destroyable.prototype)),
          (l.Flattener = function (t) {
            (this.name = 'Flattener'), (this.id = t);
          }),
          (l.Flattener.prototype = Object.create(l.Destroyable.prototype)),
          (l.Font = function (t) {
            (this.name = 'Font'), (this.id = t);
          }),
          (l.Font.prototype = Object.create(l.Destroyable.prototype)),
          (l.FreeTextAnnot = function (t) {
            (this.name = 'FreeTextAnnot'), (this.id = t);
          }),
          (l.Function = function (t) {
            (this.name = 'Function'), (this.id = t);
          }),
          (l.Function.prototype = Object.create(l.Destroyable.prototype)),
          (l.GState = function (t) {
            (this.name = 'GState'), (this.id = t);
          }),
          (l.GeometryCollection = function (t) {
            (this.name = 'GeometryCollection'), (this.id = t);
          }),
          (l.GeometryCollection.prototype = Object.create(l.Destroyable.prototype)),
          (l.HighlightAnnot = function (t) {
            (this.name = 'HighlightAnnot'), (this.id = t);
          }),
          (l.Highlights = function (t) {
            (this.name = 'Highlights'), (this.id = t);
          }),
          (l.Highlights.prototype = Object.create(l.Destroyable.prototype)),
          (l.Image = function (t) {
            (this.name = 'Image'), (this.id = t);
          }),
          (l.InkAnnot = function (t) {
            (this.name = 'InkAnnot'), (this.id = t);
          }),
          (l.Iterator = function (t, e) {
            (this.name = 'Iterator'), (this.id = t), (this.type = e);
          }),
          (l.Iterator.prototype = Object.create(l.Destroyable.prototype)),
          (l.KeyStrokeActionResult = function (t) {
            (this.name = 'KeyStrokeActionResult'), (this.id = t);
          }),
          (l.KeyStrokeActionResult.prototype = Object.create(l.Destroyable.prototype)),
          (l.KeyStrokeEventData = function (t) {
            (this.name = 'KeyStrokeEventData'), (this.id = t);
          }),
          (l.KeyStrokeEventData.prototype = Object.create(l.Destroyable.prototype)),
          (l.LineAnnot = function (t) {
            (this.name = 'LineAnnot'), (this.id = t);
          }),
          (l.LinkAnnot = function (t) {
            (this.name = 'LinkAnnot'), (this.id = t);
          }),
          (l.ListBoxWidget = function (t) {
            (this.name = 'ListBoxWidget'), (this.id = t);
          }),
          (l.MarkupAnnot = function (t) {
            (this.name = 'MarkupAnnot'), (this.id = t);
          }),
          (l.Matrix2D = function (t, e, n, i, r, o) {
            if (((this.name = 'Matrix2D'), !t || void 0 !== e))
              return new l.Matrix2D({
                m_a: (t = void 0 === t ? 0 : t),
                m_b: (e = void 0 === e ? 0 : e),
                m_c: (n = void 0 === n ? 0 : n),
                m_d: (i = void 0 === i ? 0 : i),
                m_h: (r = void 0 === r ? 0 : r),
                m_v: (o = void 0 === o ? 0 : o),
              });
            W(t, this);
          }),
          (l.MovieAnnot = function (t) {
            (this.name = 'MovieAnnot'), (this.id = t);
          }),
          (l.NameTree = function (t) {
            (this.name = 'NameTree'), (this.id = t);
          }),
          (l.NumberTree = function (t) {
            (this.name = 'NumberTree'), (this.id = t);
          }),
          (l.OCG = function (t) {
            (this.name = 'OCG'), (this.id = t);
          }),
          (l.OCGConfig = function (t) {
            (this.name = 'OCGConfig'), (this.id = t);
          }),
          (l.OCGContext = function (t) {
            (this.name = 'OCGContext'), (this.id = t);
          }),
          (l.OCGContext.prototype = Object.create(l.Destroyable.prototype)),
          (l.OCMD = function (t) {
            (this.name = 'OCMD'), (this.id = t);
          }),
          (l.OCRModule = function (t) {
            (this.name = 'OCRModule'), (this.id = t);
          }),
          (l.Obj = function (t) {
            (this.name = 'Obj'), (this.id = t);
          }),
          (l.ObjSet = function (t) {
            (this.name = 'ObjSet'), (this.id = t);
          }),
          (l.ObjSet.prototype = Object.create(l.Destroyable.prototype)),
          (l.ObjectIdentifier = function (t) {
            (this.name = 'ObjectIdentifier'), (this.id = t);
          }),
          (l.ObjectIdentifier.prototype = Object.create(l.Destroyable.prototype)),
          (l.OwnedBitmap = function (t) {
            (this.name = 'OwnedBitmap'), (this.id = t);
          }),
          (l.PDFACompliance = function (t) {
            (this.name = 'PDFACompliance'), (this.id = t);
          }),
          (l.PDFACompliance.prototype = Object.create(l.Destroyable.prototype)),
          (l.PDFDC = function (t) {
            (this.name = 'PDFDC'), (this.id = t);
          }),
          (l.PDFDCEX = function (t) {
            (this.name = 'PDFDCEX'), (this.id = t);
          }),
          (l.PDFDoc = function (t) {
            (this.name = 'PDFDoc'), (this.id = t);
          }),
          (l.PDFDoc.prototype = Object.create(l.Destroyable.prototype)),
          (l.PDFDocInfo = function (t) {
            (this.name = 'PDFDocInfo'), (this.id = t);
          }),
          (l.PDFDocViewPrefs = function (t) {
            (this.name = 'PDFDocViewPrefs'), (this.id = t);
          }),
          (l.PDFDraw = function (t) {
            (this.name = 'PDFDraw'), (this.id = t);
          }),
          (l.PDFDraw.prototype = Object.create(l.Destroyable.prototype)),
          (l.PDFRasterizer = function (t) {
            (this.name = 'PDFRasterizer'), (this.id = t);
          }),
          (l.PDFRasterizer.prototype = Object.create(l.Destroyable.prototype)),
          (l.PDFTronCustomSecurityHandler = function (t) {
            (this.name = 'PDFTronCustomSecurityHandler'), (this.id = t);
          }),
          (l.Page = function (t) {
            (this.name = 'Page'), (this.id = t);
          }),
          (l.PageLabel = function (t, e, n) {
            if (((this.name = 'PageLabel'), !t || void 0 !== e))
              return new l.PageLabel({
                mp_obj: (t = void 0 === t ? '0' : t),
                m_first_page: (e = void 0 === e ? 0 : e),
                m_last_page: (n = void 0 === n ? 0 : n),
              });
            W(t, this);
          }),
          (l.PageSet = function (t) {
            (this.name = 'PageSet'), (this.id = t);
          }),
          (l.PageSet.prototype = Object.create(l.Destroyable.prototype)),
          (l.PatternColor = function (t) {
            (this.name = 'PatternColor'), (this.id = t);
          }),
          (l.PatternColor.prototype = Object.create(l.Destroyable.prototype)),
          (l.PolyLineAnnot = function (t) {
            (this.name = 'PolyLineAnnot'), (this.id = t);
          }),
          (l.PolygonAnnot = function (t) {
            (this.name = 'PolygonAnnot'), (this.id = t);
          }),
          (l.PopupAnnot = function (t) {
            (this.name = 'PopupAnnot'), (this.id = t);
          }),
          (l.PrinterMode = function (t) {
            (this.name = 'PrinterMode'), (this.id = t);
          }),
          (l.PushButtonWidget = function (t) {
            (this.name = 'PushButtonWidget'), (this.id = t);
          }),
          (l.RadioButtonGroup = function (t) {
            (this.name = 'RadioButtonGroup'), (this.id = t);
          }),
          (l.RadioButtonGroup.prototype = Object.create(l.Destroyable.prototype)),
          (l.RadioButtonWidget = function (t) {
            (this.name = 'RadioButtonWidget'), (this.id = t);
          }),
          (l.Rect = function (t, e, n, i, r) {
            if (((this.name = 'Rect'), !t || void 0 !== e))
              return new l.Rect({
                x1: (t = void 0 === t ? 0 : t),
                y1: (e = void 0 === e ? 0 : e),
                x2: (n = void 0 === n ? 0 : n),
                y2: (i = void 0 === i ? 0 : i),
                mp_rect: (r = void 0 === r ? '0' : r),
              });
            W(t, this);
          }),
          (l.Redaction = function (t) {
            (this.name = 'Redaction'), (this.id = t);
          }),
          (l.RedactionAnnot = function (t) {
            (this.name = 'RedactionAnnot'), (this.id = t);
          }),
          (l.Redactor = function (t) {
            (this.name = 'Redactor'), (this.id = t);
          }),
          (l.Reflow = function (t) {
            (this.name = 'Reflow'), (this.id = t);
          }),
          (l.Reflow.prototype = Object.create(l.Destroyable.prototype)),
          (l.ResultSnapshot = function (t) {
            (this.name = 'ResultSnapshot'), (this.id = t);
          }),
          (l.ResultSnapshot.prototype = Object.create(l.Destroyable.prototype)),
          (l.RoleMap = function (t) {
            (this.name = 'RoleMap'), (this.id = t);
          }),
          (l.RubberStampAnnot = function (t) {
            (this.name = 'RubberStampAnnot'), (this.id = t);
          }),
          (l.SDFDoc = function (t) {
            (this.name = 'SDFDoc'), (this.id = t);
          }),
          (l.SElement = function (t, e) {
            if (((this.name = 'SElement'), !t || void 0 !== e))
              return new l.SElement({
                obj: (t = void 0 === t ? '0' : t),
                k: (e = void 0 === e ? '0' : e),
              });
            W(t, this);
          }),
          (l.STree = function (t) {
            (this.name = 'STree'), (this.id = t);
          }),
          (l.ScreenAnnot = function (t) {
            (this.name = 'ScreenAnnot'), (this.id = t);
          }),
          (l.SecurityHandler = function (t) {
            (this.name = 'SecurityHandler'), (this.id = t);
          }),
          (l.SecurityHandler.prototype = Object.create(l.Destroyable.prototype)),
          (l.Shading = function (t) {
            (this.name = 'Shading'), (this.id = t);
          }),
          (l.Shading.prototype = Object.create(l.Destroyable.prototype)),
          (l.ShapedText = function (t) {
            (this.name = 'ShapedText'), (this.id = t);
          }),
          (l.ShapedText.prototype = Object.create(l.Destroyable.prototype)),
          (l.SignatureHandler = function (t) {
            (this.name = 'SignatureHandler'), (this.id = t);
          }),
          (l.SignatureWidget = function (t) {
            (this.name = 'SignatureWidget'), (this.id = t);
          }),
          (l.SoundAnnot = function (t) {
            (this.name = 'SoundAnnot'), (this.id = t);
          }),
          (l.SquareAnnot = function (t) {
            (this.name = 'SquareAnnot'), (this.id = t);
          }),
          (l.SquigglyAnnot = function (t) {
            (this.name = 'SquigglyAnnot'), (this.id = t);
          }),
          (l.Stamper = function (t) {
            (this.name = 'Stamper'), (this.id = t);
          }),
          (l.Stamper.prototype = Object.create(l.Destroyable.prototype)),
          (l.StrikeOutAnnot = function (t) {
            (this.name = 'StrikeOutAnnot'), (this.id = t);
          }),
          (l.TextAnnot = function (t) {
            (this.name = 'TextAnnot'), (this.id = t);
          }),
          (l.TextExtractor = function (t) {
            (this.name = 'TextExtractor'), (this.id = t);
          }),
          (l.TextExtractor.prototype = Object.create(l.Destroyable.prototype)),
          (l.TextExtractorLine = function (t, e, n, i, r, o) {
            if (((this.name = 'TextExtractorLine'), !t || void 0 !== e))
              return new l.TextExtractorLine({
                line: (t = void 0 === t ? '0' : t),
                uni: (e = void 0 === e ? '0' : e),
                num: (n = void 0 === n ? 0 : n),
                cur_num: (i = void 0 === i ? 0 : i),
                m_direction: (r = void 0 === r ? 0 : r),
                mp_bld: (o = void 0 === o ? '0' : o),
              });
            W(t, this);
          }),
          (l.TextExtractorStyle = function (t) {
            if (((this.name = 'TextExtractorStyle'), 'object' === d(t))) W(t, this);
            else if (void 0 !== t) return new l.TextExtractorStyle({ mp_imp: t });
          }),
          (l.TextExtractorWord = function (t, e, n, i, r, o) {
            if (((this.name = 'TextExtractorWord'), !t || void 0 !== e))
              return new l.TextExtractorWord({
                line: (t = void 0 === t ? '0' : t),
                word: (e = void 0 === e ? '0' : e),
                uni: (n = void 0 === n ? '0' : n),
                num: (i = void 0 === i ? 0 : i),
                cur_num: (r = void 0 === r ? 0 : r),
                mp_bld: (o = void 0 === o ? '0' : o),
              });
            W(t, this);
          }),
          (l.TextMarkupAnnot = function (t) {
            (this.name = 'TextMarkupAnnot'), (this.id = t);
          }),
          (l.TextRange = function (t) {
            (this.name = 'TextRange'), (this.id = t);
          }),
          (l.TextSearch = function (t) {
            (this.name = 'TextSearch'), (this.id = t);
          }),
          (l.TextSearch.prototype = Object.create(l.Destroyable.prototype)),
          (l.TextWidget = function (t) {
            (this.name = 'TextWidget'), (this.id = t);
          }),
          (l.TimestampingConfiguration = function (t) {
            (this.name = 'TimestampingConfiguration'), (this.id = t);
          }),
          (l.TimestampingConfiguration.prototype = Object.create(l.Destroyable.prototype)),
          (l.TimestampingResult = function (t) {
            (this.name = 'TimestampingResult'), (this.id = t);
          }),
          (l.TimestampingResult.prototype = Object.create(l.Destroyable.prototype)),
          (l.TrustVerificationResult = function (t) {
            (this.name = 'TrustVerificationResult'), (this.id = t);
          }),
          (l.TrustVerificationResult.prototype = Object.create(l.Destroyable.prototype)),
          (l.UnderlineAnnot = function (t) {
            (this.name = 'UnderlineAnnot'), (this.id = t);
          }),
          (l.UndoManager = function (t) {
            (this.name = 'UndoManager'), (this.id = t);
          }),
          (l.UndoManager.prototype = Object.create(l.Destroyable.prototype)),
          (l.VerificationOptions = function (t) {
            (this.name = 'VerificationOptions'), (this.id = t);
          }),
          (l.VerificationOptions.prototype = Object.create(l.Destroyable.prototype)),
          (l.VerificationResult = function (t) {
            (this.name = 'VerificationResult'), (this.id = t);
          }),
          (l.VerificationResult.prototype = Object.create(l.Destroyable.prototype)),
          (l.ViewChangeCollection = function (t) {
            (this.name = 'ViewChangeCollection'), (this.id = t);
          }),
          (l.ViewChangeCollection.prototype = Object.create(l.Destroyable.prototype)),
          (l.WatermarkAnnot = function (t) {
            (this.name = 'WatermarkAnnot'), (this.id = t);
          }),
          (l.WebFontDownloader = function (t) {
            (this.name = 'WebFontDownloader'), (this.id = t);
          }),
          (l.WidgetAnnot = function (t) {
            (this.name = 'WidgetAnnot'), (this.id = t);
          }),
          (l.X501AttributeTypeAndValue = function (t) {
            (this.name = 'X501AttributeTypeAndValue'), (this.id = t);
          }),
          (l.X501AttributeTypeAndValue.prototype = Object.create(l.Destroyable.prototype)),
          (l.X501DistinguishedName = function (t) {
            (this.name = 'X501DistinguishedName'), (this.id = t);
          }),
          (l.X501DistinguishedName.prototype = Object.create(l.Destroyable.prototype)),
          (l.X509Certificate = function (t) {
            (this.name = 'X509Certificate'), (this.id = t);
          }),
          (l.X509Certificate.prototype = Object.create(l.Destroyable.prototype)),
          (l.X509Extension = function (t) {
            (this.name = 'X509Extension'), (this.id = t);
          }),
          (l.X509Extension.prototype = Object.create(l.Destroyable.prototype)),
          (l.PDFDoc.createRefreshOptions = function () {
            return Promise.resolve(new l.PDFDoc.RefreshOptions());
          }),
          (l.PDFDoc.RefreshOptions = function () {
            (this.mImpl = {}), (this.mHelpers = i());
          }),
          (l.PDFDoc.RefreshOptions.prototype.getDrawBackgroundOnly = function () {
            return !('DrawBackgroundOnly' in mImpl && !mImpl.DrawBackgroundOnly);
          }),
          (l.PDFDoc.RefreshOptions.prototype.setDrawBackgroundOnly = function (t) {
            return mHelpers.putBool(mImpl, 'DrawBackgroundOnly', t), this;
          }),
          (l.PDFDoc.RefreshOptions.prototype.getRefreshExisting = function () {
            return !('RefreshExisting' in mImpl && !mImpl.RefreshExisting);
          }),
          (l.PDFDoc.RefreshOptions.prototype.setRefreshExisting = function (t) {
            return mHelpers.putBool(mImpl, 'RefreshExisting', t), this;
          }),
          (l.PDFDoc.RefreshOptions.prototype.getUseNonStandardRotation = function () {
            return 'UseNonStandardRotation' in mImpl && !!mImpl.UseNonStandardRotation;
          }),
          (l.PDFDoc.RefreshOptions.prototype.setUseNonStandardRotation = function (t) {
            return mHelpers.putBool(mImpl, 'UseNonStandardRotation', t), this;
          }),
          (l.PDFDoc.RefreshOptions.prototype.getUseRoundedCorners = function () {
            return 'UseRoundedCorners' in mImpl && !!mImpl.UseRoundedCorners;
          }),
          (l.PDFDoc.RefreshOptions.prototype.setUseRoundedCorners = function (t) {
            return mHelpers.putBool(mImpl, 'UseRoundedCorners', t), this;
          }),
          (l.PDFDoc.RefreshOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.createRefreshOptions = l.PDFDoc.createRefreshOptions),
          (l.RefreshOptions = l.PDFDoc.RefreshOptions),
          (l.PDFDoc.createDiffOptions = function () {
            return Promise.resolve(new l.PDFDoc.DiffOptions());
          }),
          (l.PDFDoc.DiffOptions = function () {
            (this.mImpl = {}), (this.mHelpers = i());
          }),
          (l.PDFDoc.DiffOptions.prototype.getAddGroupAnnots = function () {
            return 'AddGroupAnnots' in this.mImpl && !!this.mImpl.AddGroupAnnots;
          }),
          (l.PDFDoc.DiffOptions.prototype.setAddGroupAnnots = function (t) {
            return this.mHelpers.putBool(this.mImpl, 'AddGroupAnnots', t), this;
          }),
          (l.PDFDoc.DiffOptions.prototype.getBlendMode = function () {
            return 'BlendMode' in this.mImpl ? this.mImpl.BlendMode : 5;
          }),
          (l.PDFDoc.DiffOptions.prototype.setBlendMode = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'BlendMode', t), this;
          }),
          (l.PDFDoc.DiffOptions.prototype.getColorA = function () {
            return 'ColorA' in this.mImpl ? this.mHelpers.jsColorFromNumber(this.mImpl.ColorA) : this.mHelpers.jsColorFromNumber(4291559424);
          }),
          (l.PDFDoc.DiffOptions.prototype.setColorA = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'ColorA', this.mHelpers.jsColorToNumber(t)), this;
          }),
          (l.PDFDoc.DiffOptions.prototype.getColorB = function () {
            return 'ColorB' in this.mImpl ? this.mHelpers.jsColorFromNumber(this.mImpl.ColorB) : this.mHelpers.jsColorFromNumber(4278242508);
          }),
          (l.PDFDoc.DiffOptions.prototype.setColorB = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'ColorB', this.mHelpers.jsColorToNumber(t)), this;
          }),
          (l.PDFDoc.DiffOptions.prototype.getLuminosityCompression = function () {
            return 'LuminosityCompression' in this.mImpl ? this.mImpl.LuminosityCompression : 10;
          }),
          (l.PDFDoc.DiffOptions.prototype.setLuminosityCompression = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'LuminosityCompression', t), this;
          }),
          (l.PDFDoc.DiffOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.createDiffOptions = l.PDFDoc.createDiffOptions),
          (l.DiffOptions = l.PDFDoc.DiffOptions),
          (l.PDFDoc.createTextDiffOptions = function () {
            return Promise.resolve(new l.PDFDoc.TextDiffOptions());
          }),
          (l.PDFDoc.TextDiffOptions = function () {
            (this.name = 'PDFNet.PDFDoc.TextDiffOptions'), (this.mImpl = {}), (this.mHelpers = i());
          }),
          (l.PDFDoc.TextDiffOptions.prototype.getColorA = function () {
            return 'ColorA' in this.mImpl ? this.mHelpers.jsColorFromNumber(this.mImpl.ColorA) : this.mHelpers.jsColorFromNumber(4293284423);
          }),
          (l.PDFDoc.TextDiffOptions.prototype.setColorA = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'ColorA', this.mHelpers.jsColorToNumber(t)), this;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.getOpacityA = function () {
            return 'OpacityA' in this.mImpl ? this.mImpl.OpacityA : 0.5;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.setOpacityA = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'OpacityA', t), this;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.getColorB = function () {
            return 'ColorB' in this.mImpl ? this.mHelpers.jsColorFromNumber(this.mImpl.ColorB) : this.mHelpers.jsColorFromNumber(4284278322);
          }),
          (l.PDFDoc.TextDiffOptions.prototype.setColorB = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'ColorB', this.mHelpers.jsColorToNumber(t)), this;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.getCompareUsingZOrder = function () {
            return 'CompareUsingZOrder' in this.mImpl && !!this.mImpl.CompareUsingZOrder;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.setCompareUsingZOrder = function (t) {
            return this.mHelpers.putBool(this.mImpl, 'CompareUsingZOrder', t), this;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.getOpacityB = function () {
            return 'OpacityB' in this.mImpl ? this.mImpl.OpacityB : 0.5;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.setOpacityB = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'OpacityB', t), this;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.addZonesForPage = function (t, e, n) {
            if ((void 0 === this.mImpl[t] && (this.mImpl[t] = []), this.mImpl[t].length < n))
              for (var i = this.mImpl[t].length; i < n; i++) this.mImpl[t].push([]);
            (e = e.map(function (t) {
              return [t.x1, t.y1, t.x2, t.y2];
            })),
              (this.mImpl[t][n - 1] = e);
          }),
          (l.PDFDoc.TextDiffOptions.prototype.addIgnoreZonesForPage = function (t, e) {
            return this.addZonesForPage('IgnoreZones', t, e), this;
          }),
          (l.PDFDoc.TextDiffOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.FDFDoc.createXFDFExportOptions = function () {
            return Promise.resolve(new l.FDFDoc.XFDFExportOptions());
          }),
          (l.FDFDoc.XFDFExportOptions = function () {
            (this.name = 'PDFNet.FDFDoc.XFDFExportOptions'), (this.mImpl = {}), (this.mHelpers = i());
          }),
          (l.FDFDoc.XFDFExportOptions.prototype.getWriteAnnotationAppearance = function () {
            return 'WriteAnnotationAppearance' in this.mImpl && !!this.mImpl.WriteAnnotationAppearance;
          }),
          (l.FDFDoc.XFDFExportOptions.prototype.setWriteAnnotationAppearance = function (t) {
            return this.mHelpers.putBool(this.mImpl, 'WriteAnnotationAppearance', t), this;
          }),
          (l.FDFDoc.XFDFExportOptions.prototype.getWriteImagedata = function () {
            return !('WriteImagedata' in this.mImpl && !this.mImpl.WriteImagedata);
          }),
          (l.FDFDoc.XFDFExportOptions.prototype.setWriteImagedata = function (t) {
            return this.mHelpers.putBool(this.mImpl, 'WriteImagedata', t), this;
          }),
          (l.FDFDoc.XFDFExportOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.PDFDoc.createSnapToOptions = function () {
            return Promise.resolve(new l.PDFDoc.SnapToOptions());
          }),
          (l.PDFDoc.SnapToOptions = function () {
            (this.name = 'PDFNet.PDFDoc.SnapToOptions'), (this.mImpl = {}), (this.mHelpers = i());
          }),
          (l.PDFDoc.SnapToOptions.prototype.setShapeLimit = function (t) {
            return this.mHelpers.putNumber(this.mImpl, 'ShapeLimit', t), this;
          }),
          (l.PDFDoc.SnapToOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.PDFDoc.createMergeXFDFOptions = function () {
            return Promise.resolve(new l.PDFDoc.MergeXFDFOptions());
          }),
          (l.PDFDoc.MergeXFDFOptions = function () {
            (this.name = 'PDFNet.PDFDoc.MergeXFDFOptions'), (this.mImpl = {}), (this.mHelpers = i());
          }),
          (l.PDFDoc.MergeXFDFOptions.prototype.getForce = function () {
            return 'Force' in this.mImpl && !!this.mImpl.Force;
          }),
          (l.PDFDoc.MergeXFDFOptions.prototype.setForce = function (t) {
            return this.mHelpers.putBool(this.mImpl, 'Force', t), this;
          }),
          (l.PDFDoc.MergeXFDFOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.QuadPoint = function (t, e, n, i, r, o, s, u) {
            if (((this.name = 'QuadPoint'), !t || void 0 !== e))
              return new l.QuadPoint({
                p1x: (t = void 0 === t ? 0 : t),
                p1y: (e = void 0 === e ? 0 : e),
                p2x: (n = void 0 === n ? 0 : n),
                p2y: (i = void 0 === i ? 0 : i),
                p3x: (r = void 0 === r ? 0 : r),
                p3y: (o = void 0 === o ? 0 : o),
                p4x: (s = void 0 === s ? 0 : s),
                p4y: (u = void 0 === u ? 0 : u),
              });
            W(t, this);
          }),
          (l.Point = function (t, e) {
            if (((this.name = 'Point'), !t || void 0 !== e))
              return new l.Point({
                x: (t = void 0 === t ? 0 : t),
                y: (e = void 0 === e ? 0 : e),
              });
            W(t, this);
          }),
          (l.CharData = function (t) {
            if (void 0 === t) throw new TypeError('CharData requires an object to construct with.');
            (this.name = 'CharData'), W(t, this);
          }),
          (l.Separation = function (t) {
            if (void 0 === t) throw new TypeError('Separation requires an object to construct with.');
            (this.name = 'Separation'), W(t, this);
          }),
          (l.Optimizer.createImageSettings = function () {
            return Promise.resolve(new l.Optimizer.ImageSettings());
          }),
          (l.Optimizer.ImageSettings = function () {
            (this.m_max_pixels = 4294967295),
              (this.m_max_dpi = 225),
              (this.m_resample_dpi = 150),
              (this.m_quality = 5),
              (this.m_compression_mode = l.Optimizer.ImageSettings.CompressionMode.e_retain),
              (this.m_downsample_mode = l.Optimizer.ImageSettings.DownsampleMode.e_default),
              (this.m_force_changes = this.m_force_recompression = !1);
          }),
          (l.Optimizer.ImageSettings.prototype.setImageDPI = function (t, e) {
            return (this.m_max_dpi = t), (this.m_resample_dpi = e), this;
          }),
          (l.Optimizer.ImageSettings.prototype.setCompressionMode = function (t) {
            return (this.m_compression_mode = t), this;
          }),
          (l.Optimizer.ImageSettings.prototype.setDownsampleMode = function (t) {
            return (this.m_downsample_mode = t), this;
          }),
          (l.Optimizer.ImageSettings.prototype.setQuality = function (t) {
            return (this.m_quality = t), this;
          }),
          (l.Optimizer.ImageSettings.prototype.forceRecompression = function (t) {
            return (this.m_force_recompression = t), this;
          }),
          (l.Optimizer.ImageSettings.prototype.forceChanges = function (t) {
            return (this.m_force_changes = t), this;
          }),
          (l.Optimizer.createMonoImageSettings = function () {
            return Promise.resolve(new l.Optimizer.MonoImageSettings());
          }),
          (l.Optimizer.MonoImageSettings = function () {
            (this.m_max_pixels = 4294967295),
              (this.m_max_dpi = 450),
              (this.m_resample_dpi = 300),
              (this.m_jbig2_threshold = 8.5),
              (this.m_compression_mode = l.Optimizer.ImageSettings.CompressionMode.e_retain),
              (this.m_downsample_mode = l.Optimizer.ImageSettings.DownsampleMode.e_default),
              (this.m_force_changes = this.m_force_recompression = !1);
          }),
          (l.Optimizer.MonoImageSettings.prototype.setImageDPI = function (t, e) {
            return (this.m_max_dpi = t), (this.m_resample_dpi = e), this;
          }),
          (l.Optimizer.MonoImageSettings.prototype.setCompressionMode = function (t) {
            return (this.m_compression_mode = t), this;
          }),
          (l.Optimizer.MonoImageSettings.prototype.setDownsampleMode = function (t) {
            return (this.m_downsample_mode = t), this;
          }),
          (l.Optimizer.MonoImageSettings.prototype.setJBIG2Threshold = function (t) {
            return (this.m_jbig2_threshold = quality), this;
          }),
          (l.Optimizer.MonoImageSettings.prototype.forceRecompression = function (t) {
            return (this.m_force_recompression = t), this;
          }),
          (l.Optimizer.MonoImageSettings.prototype.forceChanges = function (t) {
            return (this.m_force_changes = t), this;
          }),
          (l.Optimizer.createTextSettings = function () {
            return Promise.resolve(new l.Optimizer.TextSettings());
          }),
          (l.Optimizer.TextSettings = function () {
            this.m_embed_fonts = this.m_subset_fonts = !1;
          }),
          (l.Optimizer.TextSettings.prototype.subsetFonts = function (t) {
            return (this.m_subset_fonts = t), this;
          }),
          (l.Optimizer.TextSettings.prototype.embedFonts = function (t) {
            return (this.m_embed_fonts = t), this;
          }),
          (l.Optimizer.createOptimizerSettings = function () {
            return Promise.resolve(new l.Optimizer.OptimizerSettings());
          }),
          (l.Optimizer.OptimizerSettings = function () {
            (this.color_image_settings = new l.Optimizer.ImageSettings()),
              (this.grayscale_image_settings = new l.Optimizer.ImageSettings()),
              (this.mono_image_settings = new l.Optimizer.MonoImageSettings()),
              (this.text_settings = new l.Optimizer.TextSettings()),
              (this.remove_custom = !0);
          }),
          (l.Optimizer.OptimizerSettings.prototype.setColorImageSettings = function (t) {
            return (this.color_image_settings = t), this;
          }),
          (l.Optimizer.OptimizerSettings.prototype.setGrayscaleImageSettings = function (t) {
            return (this.grayscale_image_settings = t), this;
          }),
          (l.Optimizer.OptimizerSettings.prototype.setMonoImageSettings = function (t) {
            return (this.mono_image_settings = t), this;
          }),
          (l.Optimizer.OptimizerSettings.prototype.setTextSettings = function (t) {
            return (this.text_settings = t), this;
          }),
          (l.Optimizer.OptimizerSettings.prototype.removeCustomEntries = function (t) {
            return (this.remove_custom = t), this;
          }),
          (l.Optimizer.ImageSettings.CompressionMode = {
            e_retain: 0,
            e_flate: 1,
            e_jpeg: 2,
            e_jpeg2000: 3,
            e_none: 4,
          }),
          (l.Optimizer.ImageSettings.DownsampleMode = {
            e_off: 0,
            e_default: 1,
          }),
          (l.Optimizer.MonoImageSettings.CompressionMode = {
            e_jbig2: 0,
            e_flate: 1,
            e_none: 2,
          }),
          (l.Optimizer.MonoImageSettings.DownsampleMode = {
            e_off: 0,
            e_default: 1,
          }),
          (l.Convert.ConversionOptions = function (t) {
            (this.name = 'PDFNet.Convert.ConversionOptions'), t && W(JSON.parse(t), this);
          }),
          (l.Convert.createOfficeToPDFOptions = function (t) {
            return Promise.resolve(new l.Convert.OfficeToPDFOptions(t));
          }),
          (l.Convert.OfficeToPDFOptions = function (t) {
            l.Convert.ConversionOptions.call(this, t);
          }),
          (l.Convert.OfficeToPDFOptions.prototype.setApplyPageBreaksToSheet = function (t) {
            return (this.ApplyPageBreaksToSheet = t), this;
          }),
          (l.Convert.OfficeToPDFOptions.prototype.setDisplayChangeTracking = function (t) {
            return (this.DisplayChangeTracking = t), this;
          }),
          (l.Convert.OfficeToPDFOptions.prototype.setExcelDefaultCellBorderWidth = function (t) {
            return (this.ExcelDefaultCellBorderWidth = t), this;
          }),
          (l.Convert.OfficeToPDFOptions.prototype.setExcelMaxAllowedCellCount = function (t) {
            return (this.ExcelMaxAllowedCellCount = t), this;
          }),
          (l.Convert.OfficeToPDFOptions.prototype.setLocale = function (t) {
            return (this.Locale = t), this;
          }),
          (l.Convert.OfficeToPDFOptions.prototype.setTemplateParamsJson = function (t) {
            return (this.TemplateParamsJson = t), this;
          }),
          (l.Convert.OverprintPreviewMode = {
            e_op_off: 0,
            e_op_on: 1,
            e_op_pdfx_on: 2,
          }),
          (l.Convert.XPSOutputCommonOptions = function () {
            (this.name = 'PDFNet.Convert.XPSOutputCommonOptions'), (this.mImpl = {});
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.setPrintMode = function (t) {
            return (this.mImpl.PRINTMODE = t), this;
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.setDPI = function (t) {
            return (this.mImpl.DPI = t), this;
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.setRenderPages = function (t) {
            return (this.mImpl.RENDER = t), this;
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.setThickenLines = function (t) {
            return (this.mImpl.THICKENLINES = t), this;
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.generateURLLinks = function (t) {
            return (this.mImpl.URL_LINKS = t), this;
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.setOverprint = function (t) {
            switch (t) {
              case l.Convert.OverprintPreviewMode.e_op_off:
                this.mImpl.OVERPRINT_MODE = 'OFF';
                break;
              case l.Convert.OverprintPreviewMode.e_op_on:
                this.mImpl.OVERPRINT_MODE = 'ON';
                break;
              case l.Convert.OverprintPreviewMode.e_op_pdfx_on:
                this.mImpl.OVERPRINT_MODE = 'PDFX';
            }
            return this;
          }),
          (l.Convert.XPSOutputCommonOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.Convert.createXPSOutputOptions = function () {
            return Promise.resolve(new l.Convert.XPSOutputOptions());
          }),
          (l.Convert.XPSOutputOptions = function () {
            l.Convert.XPSOutputCommonOptions.call(this), (this.name = 'PDFNet.Convert.XPSOutputOptions');
          }),
          (l.Convert.XPSOutputOptions.prototype = Object.create(l.Convert.XPSOutputCommonOptions.prototype)),
          (l.Convert.XPSOutputOptions.prototype.setOpenXps = function (t) {
            return (this.mImpl.OPENXPS = t), this;
          }),
          (l.Convert.FlattenFlag = {
            e_off: 0,
            e_simple: 1,
            e_fast: 2,
            e_high_quality: 3,
          }),
          (l.Convert.FlattenThresholdFlag = {
            e_very_strict: 0,
            e_strict: 1,
            e_default: 2,
            e_keep_most: 3,
            e_keep_all: 4,
          }),
          (l.Convert.AnnotationOutputFlag = {
            e_internal_xfdf: 0,
            e_external_xfdf: 1,
            e_flatten: 2,
          }),
          (l.Convert.createXODOutputOptions = function () {
            return Promise.resolve(new l.Convert.XODOutputOptions());
          }),
          (l.Convert.XODOutputOptions = function () {
            l.Convert.XPSOutputCommonOptions.call(this), (this.name = 'PDFNet.Convert.XODOutputOptions');
          }),
          (l.Convert.XODOutputOptions.prototype = Object.create(l.Convert.XPSOutputCommonOptions.prototype)),
          (l.Convert.XODOutputOptions.prototype.setExtractUsingZorder = function (t) {
            return (this.mImpl.USEZORDER = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setOutputThumbnails = function (t) {
            return (this.mImpl.NOTHUMBS = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setThumbnailSize = function (t, e) {
            return (this.mImpl.THUMB_SIZE = t), (this.mImpl.LARGE_THUMB_SIZE = e || t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setElementLimit = function (t) {
            return (this.mImpl.ELEMENTLIMIT = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setOpacityMaskWorkaround = function (t) {
            return (this.mImpl.MASKRENDER = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setMaximumImagePixels = function (t) {
            return (this.mImpl.MAX_IMAGE_PIXELS = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setFlattenContent = function (t) {
            switch (t) {
              case l.Convert.FlattenFlag.e_off:
                this.mImpl.FLATTEN_CONTENT = 'OFF';
                break;
              case l.Convert.FlattenFlag.e_simple:
                this.mImpl.FLATTEN_CONTENT = 'SIMPLE';
                break;
              case l.Convert.FlattenFlag.e_fast:
                this.mImpl.FLATTEN_CONTENT = 'FAST';
                break;
              case l.Convert.FlattenFlag.e_high_quality:
                this.mImpl.FLATTEN_CONTENT = 'HIGH_QUALITY';
            }
            return this;
          }),
          (l.Convert.XODOutputOptions.prototype.setFlattenThreshold = function (t) {
            switch (t) {
              case l.Convert.FlattenThresholdFlag.e_very_strict:
                this.mImpl.FLATTEN_THRESHOLD = 'VERY_STRICT';
                break;
              case l.Convert.FlattenThresholdFlag.e_strict:
                this.mImpl.FLATTEN_THRESHOLD = 'STRICT';
                break;
              case l.Convert.FlattenThresholdFlag.e_default:
                this.mImpl.FLATTEN_THRESHOLD = 'DEFAULT';
                break;
              case l.Convert.FlattenThresholdFlag.e_keep_most:
                this.mImpl.FLATTEN_THRESHOLD = 'KEEP_MOST';
                break;
              case l.Convert.FlattenThresholdFlag.e_keep_all:
                this.mImpl.FLATTEN_THRESHOLD = 'KEEP_ALL';
            }
            return this;
          }),
          (l.Convert.XODOutputOptions.prototype.setPreferJPG = function (t) {
            return (this.mImpl.PREFER_JPEG = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setJPGQuality = function (t) {
            return (this.mImpl.JPEG_QUALITY = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setSilverlightTextWorkaround = function (t) {
            return (this.mImpl.REMOVE_ROTATED_TEXT = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setAnnotationOutput = function (t) {
            switch (t) {
              case l.Convert.AnnotationOutputFlag.e_internal_xfdf:
                this.mImpl.ANNOTATION_OUTPUT = 'INTERNAL';
                break;
              case l.Convert.AnnotationOutputFlag.e_external_xfdf:
                this.mImpl.ANNOTATION_OUTPUT = 'EXTERNAL';
                break;
              case l.Convert.AnnotationOutputFlag.e_flatten:
                this.mImpl.ANNOTATION_OUTPUT = 'FLATTEN';
            }
            return this;
          }),
          (l.Convert.XODOutputOptions.prototype.setExternalParts = function (t) {
            return (this.mImpl.EXTERNAL_PARTS = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.setEncryptPassword = function (t) {
            return (this.mImpl.ENCRYPT_PASSWORD = t), this;
          }),
          (l.Convert.XODOutputOptions.prototype.useSilverlightFlashCompatible = function (t) {
            return (this.mImpl.COMPATIBLE_XOD = t), this;
          }),
          (l.Convert.createTiffOutputOptions = function () {
            return Promise.resolve(new l.Convert.TiffOutputOptions());
          }),
          (l.Convert.TiffOutputOptions = function () {
            (this.name = 'PDFNet.Convert.TiffOutputOptions'), (this.mImpl = {});
          }),
          (l.Convert.TiffOutputOptions.prototype.setBox = function (t) {
            switch (t) {
              case l.Page.Box.e_media:
                this.mImpl.BOX = 'media';
                break;
              case l.Page.Box.e_crop:
                this.mImpl.BOX = 'crop';
                break;
              case l.Page.Box.e_bleed:
                this.mImpl.BOX = 'bleed';
                break;
              case l.Page.Box.e_trim:
                this.mImpl.BOX = 'trim';
                break;
              case l.Page.Box.e_art:
                this.mImpl.BOX = 'art';
            }
            return this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setRotate = function (t) {
            switch (t) {
              case l.Page.Box.e_0:
                this.mImpl.ROTATE = '0';
                break;
              case l.Page.Box.e_90:
                this.mImpl.ROTATE = '90';
                break;
              case l.Page.Box.e_180:
                this.mImpl.ROTATE = '180';
                break;
              case l.Page.Box.e_270:
                this.mImpl.ROTATE = '270';
            }
            return this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setClip = function (t, e, n, i) {
            return (this.mImpl.CLIP_X1 = t), (this.mImpl.CLIP_Y1 = e), (this.mImpl.CLIP_X2 = n), (this.mImpl.CLIP_Y2 = i), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setPages = function (t) {
            return (this.mImpl.PAGES = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setOverprint = function (t) {
            switch (t) {
              case l.PDFRasterizer.OverprintPreviewMode.e_op_off:
                this.mImpl.OVERPRINT_MODE = 'OFF';
                break;
              case l.PDFRasterizer.OverprintPreviewMode.e_op_on:
                this.mImpl.OVERPRINT_MODE = 'ON';
                break;
              case l.PDFRasterizer.OverprintPreviewMode.e_op_pdfx_on:
                this.mImpl.OVERPRINT_MODE = 'PDFX';
            }
            return this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setCMYK = function (t) {
            return (this.mImpl.CMYK = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setDither = function (t) {
            return (this.mImpl.DITHER = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setGray = function (t) {
            return (this.mImpl.GRAY = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setMono = function (t) {
            return (this.mImpl.MONO = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setAnnots = function (t) {
            return (this.mImpl.ANNOTS = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setSmooth = function (t) {
            return (this.mImpl.SMOOTH = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setPrintmode = function (t) {
            return (this.mImpl.PRINTMODE = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setTransparentPage = function (t) {
            return (this.mImpl.TRANSPARENT_PAGE = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setPalettized = function (t) {
            return (this.mImpl.PALETTIZED = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setDPI = function (t) {
            return (this.mImpl.DPI = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setGamma = function (t) {
            return (this.mImpl.GAMMA = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setHRes = function (t) {
            return (this.mImpl.HRES = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.setVRes = function (t) {
            return (this.mImpl.VRES = t), this;
          }),
          (l.Convert.TiffOutputOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.Convert.createHTMLOutputOptions = function () {
            return Promise.resolve(new l.Convert.HTMLOutputOptions());
          }),
          (l.Convert.HTMLOutputOptions = function () {
            (this.name = 'PDFNet.Convert.HTMLOutputOptions'), (this.mImpl = {});
          }),
          (l.Convert.HTMLOutputOptions.prototype.setPreferJPG = function (t) {
            return (this.mImpl.PREFER_JPEG = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setJPGQuality = function (t) {
            return (this.mImpl.JPEG_QUALITY = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setDPI = function (t) {
            return (this.mImpl.DPI = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setMaximumImagePixels = function (t) {
            return (this.mImpl.MAX_IMAGE_PIXELS = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setScale = function (t) {
            return (this.mImpl.SCALE = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setExternalLinks = function (t) {
            return (this.mImpl.EXTERNAL_LINKS = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setInternalLinks = function (t) {
            return (this.mImpl.INTERNAL_LINKS = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.setSimplifyText = function (t) {
            return (this.mImpl.SIMPLIFY_TEXT = t), this;
          }),
          (l.Convert.HTMLOutputOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.Convert.createEPUBOutputOptions = function () {
            return Promise.resolve(new l.Convert.EPUBOutputOptions());
          }),
          (l.Convert.EPUBOutputOptions = function () {
            (this.name = 'PDFNet.Convert.EPUBOutputOptions'), (this.mImpl = {});
          }),
          (l.Convert.EPUBOutputOptions.prototype.setExpanded = function (t) {
            return (this.mImpl.EPUB_EXPANDED = t), this;
          }),
          (l.Convert.EPUBOutputOptions.prototype.setReuseCover = function (t) {
            return (this.mImpl.EPUB_REUSE_COVER = t), this;
          }),
          (l.Convert.createSVGOutputOptions = function () {
            return Promise.resolve(new l.Convert.SVGOutputOptions());
          }),
          (l.Convert.SVGOutputOptions = function () {
            (this.name = 'PDFNet.Convert.SVGOutputOptions'), (this.mImpl = {});
          }),
          (l.Convert.SVGOutputOptions.prototype.setEmbedImages = function (t) {
            return (this.mImpl.EMBEDIMAGES = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setNoFonts = function (t) {
            return (this.mImpl.NOFONTS = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setSvgFonts = function (t) {
            return (this.mImpl.SVGFONTS = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setEmbedFonts = function (t) {
            return (this.mImpl.EMBEDFONTS = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setNoUnicode = function (t) {
            return (this.mImpl.NOUNICODE = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setIndividualCharPlacement = function (t) {
            return (this.mImpl.INDIVIDUALCHARPLACEMENT = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setRemoveCharPlacement = function (t) {
            return (this.mImpl.REMOVECHARPLACEMENT = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setFlattenContent = function (t) {
            switch (t) {
              case l.Convert.FlattenFlag.e_off:
                this.mImpl.FLATTEN_CONTENT = 'OFF';
                break;
              case l.Convert.FlattenFlag.e_simple:
                this.mImpl.FLATTEN_CONTENT = 'SIMPLE';
                break;
              case l.Convert.FlattenFlag.e_fast:
                this.mImpl.FLATTEN_CONTENT = 'FAST';
                break;
              case l.Convert.FlattenFlag.e_high_quality:
                this.mImpl.FLATTEN_CONTENT = 'HIGH_QUALITY';
            }
            return this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setFlattenThreshold = function (t) {
            switch (t) {
              case l.Convert.FlattenThresholdFlag.e_very_strict:
                this.mImpl.FLATTEN_THRESHOLD = 'VERY_STRICT';
                break;
              case l.Convert.FlattenThresholdFlag.e_strict:
                this.mImpl.FLATTEN_THRESHOLD = 'STRICT';
                break;
              case l.Convert.FlattenThresholdFlag.e_default:
                this.mImpl.FLATTEN_THRESHOLD = 'DEFAULT';
                break;
              case l.Convert.FlattenThresholdFlag.e_keep_most:
                this.mImpl.FLATTEN_THRESHOLD = 'KEEP_MOST';
                break;
              case l.Convert.FlattenThresholdFlag.e_keep_all:
                this.mImpl.FLATTEN_THRESHOLD = 'KEEP_ALL';
            }
            return this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setFlattenDPI = function (t) {
            return (this.mImpl.DPI = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setFlattenMaximumImagePixels = function (t) {
            return (this.mImpl.MAX_IMAGE_PIXELS = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setCompress = function (t) {
            return (this.mImpl.SVGZ = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setOutputThumbnails = function (t) {
            return (this.mImpl.NOTHUMBS = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setThumbnailSize = function (t) {
            return (this.mImpl.THUMB_SIZE = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setCreateXmlWrapper = function (t) {
            return (this.mImpl.NOXMLDOC = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setDtd = function (t) {
            return (this.mImpl.OMITDTD = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setAnnots = function (t) {
            return (this.mImpl.NOANNOTS = t), this;
          }),
          (l.Convert.SVGOutputOptions.prototype.setOverprint = function (t) {
            switch (t) {
              case l.PDFRasterizer.OverprintPreviewMode.e_op_off:
                this.mImpl.OVERPRINT_MODE = 'OFF';
                break;
              case l.PDFRasterizer.OverprintPreviewMode.e_op_on:
                this.mImpl.OVERPRINT_MODE = 'ON';
                break;
              case l.PDFRasterizer.OverprintPreviewMode.e_op_pdfx_on:
                this.mImpl.OVERPRINT_MODE = 'PDFX';
            }
            return this;
          }),
          (l.Convert.SVGOutputOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.PDFDoc.createViewerOptimizedOptions = function () {
            return Promise.resolve(new l.PDFDoc.ViewerOptimizedOptions());
          }),
          (l.PDFDoc.ViewerOptimizedOptions = function () {
            (this.name = 'PDFNet.PDFDoc.ViewerOptimizedOptions'), (this.mImpl = {});
          }),
          (l.PDFDoc.ViewerOptimizedOptions.prototype.setThumbnailRenderingThreshold = function (t) {
            return (this.mImpl.COMPLEXITY_THRESHOLD = t), this;
          }),
          (l.PDFDoc.ViewerOptimizedOptions.prototype.setMinimumInitialThumbnails = function (t) {
            return (this.mImpl.MINIMUM_INITIAL_THUMBNAILS = t), this;
          }),
          (l.PDFDoc.ViewerOptimizedOptions.prototype.setThumbnailSize = function (t) {
            return (this.mImpl.THUMB_SIZE = t), this;
          }),
          (l.PDFDoc.ViewerOptimizedOptions.prototype.setOverprint = function (t) {
            switch (t) {
              case l.PDFRasterizer.OverprintPreviewMode.e_op_off:
                this.mImpl.OVERPRINT_MODE = 'OFF';
                break;
              case l.PDFRasterizer.OverprintPreviewMode.e_op_on:
                this.mImpl.OVERPRINT_MODE = 'ON';
                break;
              case l.PDFRasterizer.OverprintPreviewMode.e_op_pdfx_on:
                this.mImpl.OVERPRINT_MODE = 'PDFX';
            }
            return this;
          }),
          (l.PDFDoc.ViewerOptimizedOptions.prototype.getJsonString = function () {
            return JSON.stringify(this.mImpl);
          }),
          (l.MarkupAnnot.prototype = new l.Annot()),
          (l.TextMarkupAnnot.prototype = new l.MarkupAnnot()),
          (l.CaretAnnot.prototype = new l.MarkupAnnot()),
          (l.LineAnnot.prototype = new l.MarkupAnnot()),
          (l.CircleAnnot.prototype = new l.MarkupAnnot()),
          (l.FileAttachmentAnnot.prototype = new l.MarkupAnnot()),
          (l.FreeTextAnnot.prototype = new l.MarkupAnnot()),
          (l.HighlightAnnot.prototype = new l.TextMarkupAnnot()),
          (l.InkAnnot.prototype = new l.MarkupAnnot()),
          (l.LinkAnnot.prototype = new l.Annot()),
          (l.MovieAnnot.prototype = new l.Annot()),
          (l.PolyLineAnnot.prototype = new l.LineAnnot()),
          (l.PolygonAnnot.prototype = new l.PolyLineAnnot()),
          (l.PopupAnnot.prototype = new l.Annot()),
          (l.RedactionAnnot.prototype = new l.MarkupAnnot()),
          (l.RubberStampAnnot.prototype = new l.MarkupAnnot()),
          (l.ScreenAnnot.prototype = new l.Annot()),
          (l.SoundAnnot.prototype = new l.MarkupAnnot()),
          (l.SquareAnnot.prototype = new l.MarkupAnnot()),
          (l.SquigglyAnnot.prototype = new l.TextMarkupAnnot()),
          (l.StrikeOutAnnot.prototype = new l.TextMarkupAnnot()),
          (l.TextAnnot.prototype = new l.MarkupAnnot()),
          (l.UnderlineAnnot.prototype = new l.TextMarkupAnnot()),
          (l.WatermarkAnnot.prototype = new l.Annot()),
          (l.WidgetAnnot.prototype = new l.Annot()),
          (l.SignatureWidget.prototype = new l.WidgetAnnot()),
          (l.ComboBoxWidget.prototype = new l.WidgetAnnot()),
          (l.ListBoxWidget.prototype = new l.WidgetAnnot()),
          (l.TextWidget.prototype = new l.WidgetAnnot()),
          (l.CheckBoxWidget.prototype = new l.WidgetAnnot()),
          (l.RadioButtonWidget.prototype = new l.WidgetAnnot()),
          (l.PushButtonWidget.prototype = new l.WidgetAnnot()),
          (l.PrinterMode.PaperSize = {
            e_custom: 0,
            e_letter: 1,
            e_letter_small: 2,
            e_tabloid: 3,
            e_ledger: 4,
            e_legal: 5,
            e_statement: 6,
            e_executive: 7,
            e_a3: 8,
            e_a4: 9,
            e_a4_mall: 10,
            e_a5: 11,
            e_b4_jis: 12,
            e_b5_jis: 13,
            e_folio: 14,
            e_quarto: 15,
            e_10x14: 16,
            e_11x17: 17,
            e_note: 18,
            e_envelope_9: 19,
            e_envelope_10: 20,
            e_envelope_11: 21,
            e_envelope_12: 22,
            e_envelope_14: 23,
            e_c_size_sheet: 24,
            e_d_size_sheet: 25,
            e_e_size_sheet: 26,
            e_envelope_dl: 27,
            e_envelope_c5: 28,
            e_envelope_c3: 29,
            e_envelope_c4: 30,
            e_envelope_c6: 31,
            e_envelope_c65: 32,
            e_envelope_b4: 33,
            e_envelope_b5: 34,
            e_envelope_b6: 35,
            e_envelope_italy: 36,
            e_envelope_monarch: 37,
            e_6_3_quarters_envelope: 38,
            e_us_std_fanfold: 39,
            e_german_std_fanfold: 40,
            e_german_legal_fanfold: 41,
            e_b4_iso: 42,
            e_japanese_postcard: 43,
            e_9x11: 44,
            e_10x11: 45,
            e_15x11: 46,
            e_envelope_invite: 47,
            e_reserved_48: 48,
            e_reserved_49: 49,
            e_letter_extra: 50,
            e_legal_extra: 51,
            e_tabloid_extra: 52,
            e_a4_extra: 53,
            e_letter_transverse: 54,
            e_a4_transverse: 55,
            e_letter_extra_transverse: 56,
            e_supera_supera_a4: 57,
            e_Superb_Superb_a3: 58,
            e_letter_plus: 59,
            e_a4_plus: 60,
            e_a5_transverse: 61,
            e_b5_jis_transverse: 62,
            e_a3_extra: 63,
            e_a5_extra: 64,
            e_b5_iso_extra: 65,
            e_a2: 66,
            e_a3_transverse: 67,
            e_a3_extra_transverse: 68,
            e_japanese_double_postcard: 69,
            e_a6: 70,
            e_japanese_envelope_kaku_2: 71,
            e_japanese_envelope_kaku_3: 72,
            e_japanese_envelope_chou_3: 73,
            e_japanese_envelope_chou_4: 74,
            e_letter_rotated: 75,
            e_a3_rotated: 76,
            e_a4_rotated: 77,
            e_a5_rotated: 78,
            e_b4_jis_rotated: 79,
            e_b5_jis_rotated: 80,
            e_japanese_postcard_rotated: 81,
            e_double_japanese_postcard_rotated: 82,
            e_a6_rotated: 83,
            e_japanese_envelope_kaku_2_rotated: 84,
            e_japanese_envelope_kaku_3_rotated: 85,
            e_japanese_envelope_chou_3_rotated: 86,
            e_japanese_envelope_chou_4_rotated: 87,
            e_b6_jis: 88,
            e_b6_jis_rotated: 89,
            e_12x11: 90,
            e_japanese_envelope_you_4: 91,
            e_japanese_envelope_you_4_rotated: 92,
            e_PrinterMode_prc_16k: 93,
            e_prc_32k: 94,
            e_prc_32k_big: 95,
            e_prc_envelop_1: 96,
            e_prc_envelop_2: 97,
            e_prc_envelop_3: 98,
            e_prc_envelop_4: 99,
            e_prc_envelop_5: 100,
            e_prc_envelop_6: 101,
            e_prc_envelop_7: 102,
            e_prc_envelop_8: 103,
            e_prc_envelop_9: 104,
            e_prc_envelop_10: 105,
            e_prc_16k_rotated: 106,
            e_prc_32k_rotated: 107,
            e_prc_32k_big__rotated: 108,
            e_prc_envelop_1_rotated: 109,
            e_prc_envelop_2_rotated: 110,
            e_prc_envelop_3_rotated: 111,
            e_prc_envelop_4_rotated: 112,
            e_prc_envelop_5_rotated: 113,
            e_prc_envelop_6_rotated: 114,
            e_prc_envelop_7_rotated: 115,
            e_prc_envelop_8_rotated: 116,
            e_prc_envelop_9_rotated: 117,
            e_prc_envelop_10_rotated: 118,
          }),
          (l.Field.EventType = {
            e_action_trigger_keystroke: 13,
            e_action_trigger_format: 14,
            e_action_trigger_validate: 15,
            e_action_trigger_calculate: 16,
          }),
          (l.Field.Type = {
            e_button: 0,
            e_check: 1,
            e_radio: 2,
            e_text: 3,
            e_choice: 4,
            e_signature: 5,
            e_null: 6,
          }),
          (l.Field.Flag = {
            e_read_only: 0,
            e_required: 1,
            e_no_export: 2,
            e_pushbutton_flag: 3,
            e_radio_flag: 4,
            e_toggle_to_off: 5,
            e_radios_in_unison: 6,
            e_multiline: 7,
            e_password: 8,
            e_file_select: 9,
            e_no_spellcheck: 10,
            e_no_scroll: 11,
            e_comb: 12,
            e_rich_text: 13,
            e_combo: 14,
            e_edit: 15,
            e_sort: 16,
            e_multiselect: 17,
            e_commit_on_sel_change: 18,
          }),
          (l.Field.TextJustification = {
            e_left_justified: 0,
            e_centered: 1,
            e_right_justified: 2,
          }),
          (l.Filter.StdFileOpenMode = {
            e_read_mode: 0,
            e_write_mode: 1,
            e_append_mode: 2,
          }),
          (l.Filter.ReferencePos = { e_begin: 0, e_end: 2, e_cur: 1 }),
          (l.OCGContext.OCDrawMode = { e_VisibleOC: 0, e_AllOC: 1, e_NoOC: 2 }),
          (l.OCMD.VisibilityPolicyType = {
            e_AllOn: 0,
            e_AnyOn: 1,
            e_AnyOff: 2,
            e_AllOff: 3,
          }),
          (l.PDFACompliance.Conformance = {
            e_Level1A: 1,
            e_Level1B: 2,
            e_Level2A: 3,
            e_Level2B: 4,
            e_Level2U: 5,
            e_Level3A: 6,
            e_Level3B: 7,
            e_Level3U: 8,
          }),
          (l.PDFACompliance.ErrorCode = {
            e_PDFA0_1_0: 10,
            e_PDFA0_1_1: 11,
            e_PDFA0_1_2: 12,
            e_PDFA0_1_3: 13,
            e_PDFA0_1_4: 14,
            e_PDFA0_1_5: 15,
            e_PDFA1_2_1: 121,
            e_PDFA1_2_2: 122,
            e_PDFA1_3_1: 131,
            e_PDFA1_3_2: 132,
            e_PDFA1_3_3: 133,
            e_PDFA1_3_4: 134,
            e_PDFA1_4_1: 141,
            e_PDFA1_4_2: 142,
            e_PDFA1_6_1: 161,
            e_PDFA1_7_1: 171,
            e_PDFA1_7_2: 172,
            e_PDFA1_7_3: 173,
            e_PDFA1_7_4: 174,
            e_PDFA1_8_1: 181,
            e_PDFA1_8_2: 182,
            e_PDFA1_8_3: 183,
            e_PDFA1_8_4: 184,
            e_PDFA1_8_5: 185,
            e_PDFA1_8_6: 186,
            e_PDFA1_10_1: 1101,
            e_PDFA1_11_1: 1111,
            e_PDFA1_11_2: 1112,
            e_PDFA1_12_1: 1121,
            e_PDFA1_12_2: 1122,
            e_PDFA1_12_3: 1123,
            e_PDFA1_12_4: 1124,
            e_PDFA1_12_5: 1125,
            e_PDFA1_12_6: 1126,
            e_PDFA1_13_1: 1131,
            e_PDFA2_2_1: 221,
            e_PDFA2_3_2: 232,
            e_PDFA2_3_3: 233,
            e_PDFA2_3_3_1: 2331,
            e_PDFA2_3_3_2: 2332,
            e_PDFA2_3_4_1: 2341,
            e_PDFA2_4_1: 241,
            e_PDFA2_4_2: 242,
            e_PDFA2_4_3: 243,
            e_PDFA2_4_4: 244,
            e_PDFA2_5_1: 251,
            e_PDFA2_5_2: 252,
            e_PDFA2_6_1: 261,
            e_PDFA2_7_1: 271,
            e_PDFA2_8_1: 281,
            e_PDFA2_9_1: 291,
            e_PDFA2_10_1: 2101,
            e_PDFA3_2_1: 321,
            e_PDFA3_3_1: 331,
            e_PDFA3_3_2: 332,
            e_PDFA3_3_3_1: 3331,
            e_PDFA3_3_3_2: 3332,
            e_PDFA3_4_1: 341,
            e_PDFA3_5_1: 351,
            e_PDFA3_5_2: 352,
            e_PDFA3_5_3: 353,
            e_PDFA3_5_4: 354,
            e_PDFA3_5_5: 355,
            e_PDFA3_5_6: 356,
            e_PDFA3_6_1: 361,
            e_PDFA3_7_1: 371,
            e_PDFA3_7_2: 372,
            e_PDFA3_7_3: 373,
            e_PDFA4_1: 41,
            e_PDFA4_2: 42,
            e_PDFA4_3: 43,
            e_PDFA4_4: 44,
            e_PDFA4_5: 45,
            e_PDFA4_6: 46,
            e_PDFA5_2_1: 521,
            e_PDFA5_2_2: 522,
            e_PDFA5_2_3: 523,
            e_PDFA5_2_4: 524,
            e_PDFA5_2_5: 525,
            e_PDFA5_2_6: 526,
            e_PDFA5_2_7: 527,
            e_PDFA5_2_8: 528,
            e_PDFA5_2_9: 529,
            e_PDFA5_2_10: 5210,
            e_PDFA5_2_11: 5211,
            e_PDFA5_3_1: 531,
            e_PDFA5_3_2_1: 5321,
            e_PDFA5_3_2_2: 5322,
            e_PDFA5_3_2_3: 5323,
            e_PDFA5_3_2_4: 5324,
            e_PDFA5_3_2_5: 5325,
            e_PDFA5_3_3_1: 5331,
            e_PDFA5_3_3_2: 5332,
            e_PDFA5_3_3_3: 5333,
            e_PDFA5_3_3_4: 5334,
            e_PDFA5_3_4_0: 5340,
            e_PDFA5_3_4_1: 5341,
            e_PDFA5_3_4_2: 5342,
            e_PDFA5_3_4_3: 5343,
            e_PDFA6_1_1: 611,
            e_PDFA6_1_2: 612,
            e_PDFA6_2_1: 621,
            e_PDFA6_2_2: 622,
            e_PDFA6_2_3: 623,
            e_PDFA7_2_1: 721,
            e_PDFA7_2_2: 722,
            e_PDFA7_2_3: 723,
            e_PDFA7_2_4: 724,
            e_PDFA7_2_5: 725,
            e_PDFA7_3_1: 731,
            e_PDFA7_3_2: 732,
            e_PDFA7_3_3: 733,
            e_PDFA7_3_4: 734,
            e_PDFA7_3_5: 735,
            e_PDFA7_3_6: 736,
            e_PDFA7_3_7: 737,
            e_PDFA7_3_8: 738,
            e_PDFA7_3_9: 739,
            e_PDFA7_5_1: 751,
            e_PDFA7_8_1: 781,
            e_PDFA7_8_2: 782,
            e_PDFA7_8_3: 783,
            e_PDFA7_8_4: 784,
            e_PDFA7_8_5: 785,
            e_PDFA7_8_6: 786,
            e_PDFA7_8_7: 787,
            e_PDFA7_8_8: 788,
            e_PDFA7_8_9: 789,
            e_PDFA7_8_10: 7810,
            e_PDFA7_8_11: 7811,
            e_PDFA7_8_12: 7812,
            e_PDFA7_8_13: 7813,
            e_PDFA7_8_14: 7814,
            e_PDFA7_8_15: 7815,
            e_PDFA7_8_16: 7816,
            e_PDFA7_8_17: 7817,
            e_PDFA7_8_18: 7818,
            e_PDFA7_8_19: 7819,
            e_PDFA7_8_20: 7820,
            e_PDFA7_8_21: 7821,
            e_PDFA7_8_22: 7822,
            e_PDFA7_8_23: 7823,
            e_PDFA7_8_24: 7824,
            e_PDFA7_8_25: 7825,
            e_PDFA7_8_26: 7826,
            e_PDFA7_8_27: 7827,
            e_PDFA7_8_28: 7828,
            e_PDFA7_8_29: 7829,
            e_PDFA7_8_30: 7830,
            e_PDFA7_8_31: 7831,
            e_PDFA7_11_1: 7111,
            e_PDFA7_11_2: 7112,
            e_PDFA7_11_3: 7113,
            e_PDFA7_11_4: 7114,
            e_PDFA7_11_5: 7115,
            e_PDFA9_1: 91,
            e_PDFA9_2: 92,
            e_PDFA9_3: 93,
            e_PDFA9_4: 94,
            e_PDFA3_8_1: 381,
            e_PDFA8_2_2: 822,
            e_PDFA8_3_3_1: 8331,
            e_PDFA8_3_3_2: 8332,
            e_PDFA8_3_4_1: 8341,
            e_PDFA1_2_3: 123,
            e_PDFA1_10_2: 1102,
            e_PDFA1_10_3: 1103,
            e_PDFA1_12_10: 11210,
            e_PDFA1_13_5: 1135,
            e_PDFA2_3_10: 2310,
            e_PDFA2_4_2_10: 24220,
            e_PDFA2_4_2_11: 24221,
            e_PDFA2_4_2_12: 24222,
            e_PDFA2_4_2_13: 24223,
            e_PDFA2_5_10: 2510,
            e_PDFA2_5_11: 2511,
            e_PDFA2_5_12: 2512,
            e_PDFA2_8_3_1: 2831,
            e_PDFA2_8_3_2: 2832,
            e_PDFA2_8_3_3: 2833,
            e_PDFA2_8_3_4: 2834,
            e_PDFA2_8_3_5: 2835,
            e_PDFA2_10_20: 21020,
            e_PDFA2_10_21: 21021,
            e_PDFA11_0_0: 11e3,
            e_PDFA6_2_11_8: 62118,
            e_PDFA8_1: 81,
            e_PDFA_3E1: 1,
            e_PDFA_3E2: 2,
            e_PDFA_3E3: 3,
            e_PDFA_LAST: 4,
          }),
          (l.ContentItem.Type = {
            e_MCR: 0,
            e_MCID: 1,
            e_OBJR: 2,
            e_Unknown: 3,
          }),
          (l.Action.Type = {
            e_GoTo: 0,
            e_GoToR: 1,
            e_GoToE: 2,
            e_Launch: 3,
            e_Thread: 4,
            e_URI: 5,
            e_Sound: 6,
            e_Movie: 7,
            e_Hide: 8,
            e_Named: 9,
            e_SubmitForm: 10,
            e_ResetForm: 11,
            e_ImportData: 12,
            e_JavaScript: 13,
            e_SetOCGState: 14,
            e_Rendition: 15,
            e_Trans: 16,
            e_GoTo3DView: 17,
            e_RichMediaExecute: 18,
            e_Unknown: 19,
          }),
          (l.Action.FormActionFlag = {
            e_exclude: 0,
            e_include_no_value_fields: 1,
            e_export_format: 2,
            e_get_method: 3,
            e_submit_coordinates: 4,
            e_xfdf: 5,
            e_include_append_saves: 6,
            e_include_annotations: 7,
            e_submit_pdf: 8,
            e_canonical_format: 9,
            e_excl_non_user_annots: 10,
            e_excl_F_key: 11,
            e_embed_form: 13,
          }),
          (l.Page.EventType = {
            e_action_trigger_page_open: 11,
            e_action_trigger_page_close: 12,
          }),
          (l.Page.Box = {
            e_media: 0,
            e_crop: 1,
            e_bleed: 2,
            e_trim: 3,
            e_art: 4,
            e_user_crop: 5,
          }),
          (l.Page.Rotate = { e_0: 0, e_90: 1, e_180: 2, e_270: 3 }),
          (l.Annot.EventType = {
            e_action_trigger_activate: 0,
            e_action_trigger_annot_enter: 1,
            e_action_trigger_annot_exit: 2,
            e_action_trigger_annot_down: 3,
            e_action_trigger_annot_up: 4,
            e_action_trigger_annot_focus: 5,
            e_action_trigger_annot_blur: 6,
            e_action_trigger_annot_page_open: 7,
            e_action_trigger_annot_page_close: 8,
            e_action_trigger_annot_page_visible: 9,
            e_action_trigger_annot_page_invisible: 10,
          }),
          (l.Annot.Type = {
            e_Text: 0,
            e_Link: 1,
            e_FreeText: 2,
            e_Line: 3,
            e_Square: 4,
            e_Circle: 5,
            e_Polygon: 6,
            e_Polyline: 7,
            e_Highlight: 8,
            e_Underline: 9,
            e_Squiggly: 10,
            e_StrikeOut: 11,
            e_Stamp: 12,
            e_Caret: 13,
            e_Ink: 14,
            e_Popup: 15,
            e_FileAttachment: 16,
            e_Sound: 17,
            e_Movie: 18,
            e_Widget: 19,
            e_Screen: 20,
            e_PrinterMark: 21,
            e_TrapNet: 22,
            e_Watermark: 23,
            e_3D: 24,
            e_Redact: 25,
            e_Projection: 26,
            e_RichMedia: 27,
            e_Unknown: 28,
          }),
          (l.Annot.Flag = {
            e_invisible: 0,
            e_hidden: 1,
            e_print: 2,
            e_no_zoom: 3,
            e_no_rotate: 4,
            e_no_view: 5,
            e_annot_read_only: 6,
            e_locked: 7,
            e_toggle_no_view: 8,
            e_locked_contents: 9,
          }),
          (l.AnnotBorderStyle.Style = {
            e_solid: 0,
            e_dashed: 1,
            e_beveled: 2,
            e_inset: 3,
            e_underline: 4,
          }),
          (l.Annot.State = { e_normal: 0, e_rollover: 1, e_down: 2 }),
          (l.LineAnnot.EndingStyle = {
            e_Square: 0,
            e_Circle: 1,
            e_Diamond: 2,
            e_OpenArrow: 3,
            e_ClosedArrow: 4,
            e_Butt: 5,
            e_ROpenArrow: 6,
            e_RClosedArrow: 7,
            e_Slash: 8,
            e_None: 9,
            e_Unknown: 10,
          }),
          (l.LineAnnot.IntentType = {
            e_LineArrow: 0,
            e_LineDimension: 1,
            e_null: 2,
          }),
          (l.LineAnnot.CapPos = { e_Inline: 0, e_Top: 1 }),
          (l.FileAttachmentAnnot.Icon = {
            e_Graph: 0,
            e_PushPin: 1,
            e_Paperclip: 2,
            e_Tag: 3,
            e_Unknown: 4,
          }),
          (l.FreeTextAnnot.IntentName = {
            e_FreeText: 0,
            e_FreeTextCallout: 1,
            e_FreeTextTypeWriter: 2,
            e_Unknown: 3,
          }),
          (l.LinkAnnot.HighlightingMode = {
            e_none: 0,
            e_invert: 1,
            e_outline: 2,
            e_push: 3,
          }),
          (l.MarkupAnnot.BorderEffect = { e_None: 0, e_Cloudy: 1 }),
          (l.PolyLineAnnot.IntentType = {
            e_PolygonCloud: 0,
            e_PolyLineDimension: 1,
            e_PolygonDimension: 2,
            e_Unknown: 3,
          }),
          (l.RedactionAnnot.QuadForm = {
            e_LeftJustified: 0,
            e_Centered: 1,
            e_RightJustified: 2,
            e_None: 3,
          }),
          (l.RubberStampAnnot.Icon = {
            e_Approved: 0,
            e_Experimental: 1,
            e_NotApproved: 2,
            e_AsIs: 3,
            e_Expired: 4,
            e_NotForPublicRelease: 5,
            e_Confidential: 6,
            e_Final: 7,
            e_Sold: 8,
            e_Departmental: 9,
            e_ForComment: 10,
            e_TopSecret: 11,
            e_ForPublicRelease: 12,
            e_Draft: 13,
            e_Unknown: 14,
          }),
          (l.ScreenAnnot.ScaleType = { e_Anamorphic: 0, e_Proportional: 1 }),
          (l.ScreenAnnot.ScaleCondition = {
            e_Always: 0,
            e_WhenBigger: 1,
            e_WhenSmaller: 2,
            e_Never: 3,
          }),
          (l.ScreenAnnot.IconCaptionRelation = {
            e_NoIcon: 0,
            e_NoCaption: 1,
            e_CBelowI: 2,
            e_CAboveI: 3,
            e_CRightILeft: 4,
            e_CLeftIRight: 5,
            e_COverlayI: 6,
          }),
          (l.SoundAnnot.Icon = { e_Speaker: 0, e_Mic: 1, e_Unknown: 2 }),
          (l.TextAnnot.Icon = {
            e_Comment: 0,
            e_Key: 1,
            e_Help: 2,
            e_NewParagraph: 3,
            e_Paragraph: 4,
            e_Insert: 5,
            e_Note: 6,
            e_Unknown: 7,
          }),
          (l.WidgetAnnot.HighlightingMode = {
            e_none: 0,
            e_invert: 1,
            e_outline: 2,
            e_push: 3,
            e_toggle: 4,
          }),
          (l.WidgetAnnot.ScaleType = { e_Anamorphic: 0, e_Proportional: 1 }),
          (l.WidgetAnnot.IconCaptionRelation = {
            e_NoIcon: 0,
            e_NoCaption: 1,
            e_CBelowI: 2,
            e_CAboveI: 3,
            e_CRightILeft: 4,
            e_CLeftIRight: 5,
            e_COverlayI: 6,
          }),
          (l.WidgetAnnot.ScaleCondition = {
            e_Always: 0,
            e_WhenBigger: 1,
            e_WhenSmaller: 2,
            e_Never: 3,
          }),
          (l.ColorSpace.Type = {
            e_device_gray: 0,
            e_device_rgb: 1,
            e_device_cmyk: 2,
            e_cal_gray: 3,
            e_cal_rgb: 4,
            e_lab: 5,
            e_icc: 6,
            e_indexed: 7,
            e_pattern: 8,
            e_separation: 9,
            e_device_n: 10,
            e_null: 11,
          }),
          (l.Convert.PrinterMode = {
            e_auto: 0,
            e_interop_only: 1,
            e_printer_only: 2,
            e_prefer_builtin_converter: 3,
          }),
          (l.Destination.FitType = {
            e_XYZ: 0,
            e_Fit: 1,
            e_FitH: 2,
            e_FitV: 3,
            e_FitR: 4,
            e_FitB: 5,
            e_FitBH: 6,
            e_FitBV: 7,
          }),
          (l.GState.Attribute = {
            e_transform: 0,
            e_rendering_intent: 1,
            e_stroke_cs: 2,
            e_stroke_color: 3,
            e_fill_cs: 4,
            e_fill_color: 5,
            e_line_width: 6,
            e_line_cap: 7,
            e_line_join: 8,
            e_flatness: 9,
            e_miter_limit: 10,
            e_dash_pattern: 11,
            e_char_spacing: 12,
            e_word_spacing: 13,
            e_horizontal_scale: 14,
            e_leading: 15,
            e_font: 16,
            e_font_size: 17,
            e_text_render_mode: 18,
            e_text_rise: 19,
            e_text_knockout: 20,
            e_text_pos_offset: 21,
            e_blend_mode: 22,
            e_opacity_fill: 23,
            e_opacity_stroke: 24,
            e_alpha_is_shape: 25,
            e_soft_mask: 26,
            e_smoothnes: 27,
            e_auto_stoke_adjust: 28,
            e_stroke_overprint: 29,
            e_fill_overprint: 30,
            e_overprint_mode: 31,
            e_transfer_funct: 32,
            e_BG_funct: 33,
            e_UCR_funct: 34,
            e_halftone: 35,
            e_null: 36,
          }),
          (l.GState.LineCap = {
            e_butt_cap: 0,
            e_round_cap: 1,
            e_square_cap: 2,
          }),
          (l.GState.LineJoin = {
            e_miter_join: 0,
            e_round_join: 1,
            e_bevel_join: 2,
          }),
          (l.GState.TextRenderingMode = {
            e_fill_text: 0,
            e_stroke_text: 1,
            e_fill_stroke_text: 2,
            e_invisible_text: 3,
            e_fill_clip_text: 4,
            e_stroke_clip_text: 5,
            e_fill_stroke_clip_text: 6,
            e_clip_text: 7,
          }),
          (l.GState.RenderingIntent = {
            e_absolute_colorimetric: 0,
            e_relative_colorimetric: 1,
            e_saturation: 2,
            e_perceptual: 3,
          }),
          (l.GState.BlendMode = {
            e_bl_compatible: 0,
            e_bl_normal: 1,
            e_bl_multiply: 2,
            e_bl_screen: 3,
            e_bl_difference: 4,
            e_bl_darken: 5,
            e_bl_lighten: 6,
            e_bl_color_dodge: 7,
            e_bl_color_burn: 8,
            e_bl_exclusion: 9,
            e_bl_hard_light: 10,
            e_bl_overlay: 11,
            e_bl_soft_light: 12,
            e_bl_luminosity: 13,
            e_bl_hue: 14,
            e_bl_saturation: 15,
            e_bl_color: 16,
          }),
          (l.Element.Type = {
            e_null: 0,
            e_path: 1,
            e_text_begin: 2,
            e_text: 3,
            e_text_new_line: 4,
            e_text_end: 5,
            e_image: 6,
            e_inline_image: 7,
            e_shading: 8,
            e_form: 9,
            e_group_begin: 10,
            e_group_end: 11,
            e_marked_content_begin: 12,
            e_marked_content_end: 13,
            e_marked_content_point: 14,
          }),
          (l.Element.PathSegmentType = {
            e_moveto: 1,
            e_lineto: 2,
            e_cubicto: 3,
            e_conicto: 4,
            e_rect: 5,
            e_closepath: 6,
          }),
          (l.ShapedText.ShapingStatus = {
            e_FullShaping: 0,
            e_PartialShaping: 1,
            e_NoShaping: 2,
          }),
          (l.ShapedText.FailureReason = {
            e_NoFailure: 0,
            e_UnsupportedFontType: 1,
            e_NotIndexEncoded: 2,
            e_FontDataNotFound: 3,
          }),
          (l.ElementWriter.WriteMode = {
            e_underlay: 0,
            e_overlay: 1,
            e_replacement: 2,
          }),
          (l.Flattener.Threshold = {
            e_very_strict: 0,
            e_strict: 1,
            e_default: 2,
            e_keep_most: 3,
            e_keep_all: 4,
          }),
          (l.Flattener.Mode = { e_simple: 0, e_fast: 1 }),
          (l.Font.StandardType1Font = {
            e_times_roman: 0,
            e_times_bold: 1,
            e_times_italic: 2,
            e_times_bold_italic: 3,
            e_helvetica: 4,
            e_helvetica_bold: 5,
            e_helvetica_oblique: 6,
            e_helvetica_bold_oblique: 7,
            e_courier: 8,
            e_courier_bold: 9,
            e_courier_oblique: 10,
            e_courier_bold_oblique: 11,
            e_symbol: 12,
            e_zapf_dingbats: 13,
            e_null: 14,
          }),
          (l.Font.Encoding = { e_IdentityH: 0, e_Indices: 1 }),
          (l.Font.Type = {
            e_Type1: 0,
            e_TrueType: 1,
            e_MMType1: 2,
            e_Type3: 3,
            e_Type0: 4,
            e_CIDType0: 5,
            e_CIDType2: 6,
          }),
          (l.Function.Type = {
            e_sampled: 0,
            e_exponential: 2,
            e_stitching: 3,
            e_postscript: 4,
          }),
          (l.Image.InputFilter = {
            e_none: 0,
            e_jpeg: 1,
            e_jp2: 2,
            e_flate: 3,
            e_g3: 4,
            e_g4: 5,
            e_ascii_hex: 6,
          }),
          (l.PageLabel.Style = {
            e_decimal: 0,
            e_roman_uppercase: 1,
            e_roman_lowercase: 2,
            e_alphabetic_uppercase: 3,
            e_alphabetic_lowercase: 4,
            e_none: 5,
          }),
          (l.PageSet.Filter = { e_all: 0, e_even: 1, e_odd: 2 }),
          (l.PatternColor.Type = {
            e_uncolored_tiling_pattern: 0,
            e_colored_tiling_pattern: 1,
            e_shading: 2,
            e_null: 3,
          }),
          (l.PatternColor.TilingType = {
            e_constant_spacing: 0,
            e_no_distortion: 1,
            e_constant_spacing_fast_fill: 2,
          }),
          (l.GeometryCollection.SnappingMode = {
            e_DefaultSnapMode: 14,
            e_PointOnLine: 1,
            e_LineMidpoint: 2,
            e_LineIntersection: 4,
            e_PathEndpoint: 8,
          }),
          (l.DigestAlgorithm.Type = {
            e_SHA1: 0,
            e_SHA256: 1,
            e_SHA384: 2,
            e_SHA512: 3,
            e_RIPEMD160: 4,
            e_unknown_digest_algorithm: 5,
          }),
          (l.ObjectIdentifier.Predefined = {
            e_commonName: 0,
            e_surname: 1,
            e_countryName: 2,
            e_localityName: 3,
            e_stateOrProvinceName: 4,
            e_streetAddress: 5,
            e_organizationName: 6,
            e_organizationalUnitName: 7,
            e_SHA1: 8,
            e_SHA256: 9,
            e_SHA384: 10,
            e_SHA512: 11,
            e_RIPEMD160: 12,
            e_RSA_encryption_PKCS1: 13,
          }),
          (l.DigitalSignatureField.SubFilterType = {
            e_adbe_x509_rsa_sha1: 0,
            e_adbe_pkcs7_detached: 1,
            e_adbe_pkcs7_sha1: 2,
            e_ETSI_CAdES_detached: 3,
            e_ETSI_RFC3161: 4,
            e_unknown: 5,
            e_absent: 6,
          }),
          (l.DigitalSignatureField.DocumentPermissions = {
            e_no_changes_allowed: 1,
            e_formfilling_signing_allowed: 2,
            e_annotating_formfilling_signing_allowed: 3,
            e_unrestricted: 4,
          }),
          (l.DigitalSignatureField.FieldPermissions = {
            e_lock_all: 0,
            e_include: 1,
            e_exclude: 2,
          }),
          (l.PDFDoc.EventType = {
            e_action_trigger_doc_will_close: 17,
            e_action_trigger_doc_will_save: 18,
            e_action_trigger_doc_did_save: 19,
            e_action_trigger_doc_will_print: 20,
            e_action_trigger_doc_did_print: 21,
          }),
          (l.PDFDoc.InsertFlag = { e_none: 0, e_insert_bookmark: 1 }),
          (l.PDFDoc.ExtractFlag = {
            e_forms_only: 0,
            e_annots_only: 1,
            e_both: 2,
          }),
          (l.PDFDoc.SignaturesVerificationStatus = {
            e_unsigned: 0,
            e_failure: 1,
            e_untrusted: 2,
            e_unsupported: 3,
            e_verified: 4,
          }),
          (l.PDFDocViewPrefs.PageMode = {
            e_UseNone: 0,
            e_UseThumbs: 1,
            e_UseBookmarks: 2,
            e_FullScreen: 3,
            e_UseOC: 4,
            e_UseAttachments: 5,
          }),
          (l.PDFDocViewPrefs.PageLayout = {
            e_Default: 0,
            e_SinglePage: 1,
            e_OneColumn: 2,
            e_TwoColumnLeft: 3,
            e_TwoColumnRight: 4,
            e_TwoPageLeft: 5,
            e_TwoPageRight: 6,
          }),
          (l.PDFDocViewPrefs.ViewerPref = {
            e_HideToolbar: 0,
            e_HideMenubar: 1,
            e_HideWindowUI: 2,
            e_FitWindow: 3,
            e_CenterWindow: 4,
            e_DisplayDocTitle: 5,
          }),
          (l.PDFRasterizer.Type = { e_BuiltIn: 0, e_GDIPlus: 1 }),
          (l.PDFRasterizer.OverprintPreviewMode = {
            e_op_off: 0,
            e_op_on: 1,
            e_op_pdfx_on: 2,
          }),
          (l.PDFRasterizer.ColorPostProcessMode = {
            e_postprocess_none: 0,
            e_postprocess_invert: 1,
            e_postprocess_gradient_map: 2,
            e_postprocess_night_mode: 3,
          }),
          (l.PDFDraw.PixelFormat = {
            e_rgba: 0,
            e_bgra: 1,
            e_rgb: 2,
            e_bgr: 3,
            e_gray: 4,
            e_gray_alpha: 5,
            e_cmyk: 6,
          }),
          (l.CMSType = { e_lcms: 0, e_icm: 1, e_no_cms: 2 }),
          (l.CharacterOrdering = {
            e_Identity: 0,
            e_Japan1: 1,
            e_Japan2: 2,
            e_GB1: 3,
            e_CNS1: 4,
            e_Korea1: 5,
          }),
          (l.LogLevel = {
            e_LogLevel_Off: -1,
            e_LogLevel_Fatal: 5,
            e_LogLevel_Error: 4,
            e_LogLevel_Warning: 3,
            e_LogLevel_Info: 2,
            e_LogLevel_Trace: 1,
            e_LogLevel_Debug: 0,
          }),
          (l.ConnectionErrorHandlingMode = {
            e_continue: 0,
            e_continue_unless_switching_to_demo: 1,
            e_stop: 2,
          }),
          (l.Shading.Type = {
            e_function_shading: 0,
            e_axial_shading: 1,
            e_radial_shading: 2,
            e_free_gouraud_shading: 3,
            e_lattice_gouraud_shading: 4,
            e_coons_shading: 5,
            e_tensor_shading: 6,
            e_null: 7,
          }),
          (l.Stamper.SizeType = {
            e_relative_scale: 1,
            e_absolute_size: 2,
            e_font_size: 3,
          }),
          (l.Stamper.TextAlignment = {
            e_align_left: -1,
            e_align_center: 0,
            e_align_right: 1,
          }),
          (l.Stamper.HorizontalAlignment = {
            e_horizontal_left: -1,
            e_horizontal_center: 0,
            e_horizontal_right: 1,
          }),
          (l.Stamper.VerticalAlignment = {
            e_vertical_bottom: -1,
            e_vertical_center: 0,
            e_vertical_top: 1,
          }),
          (l.TextExtractor.ProcessingFlags = {
            e_no_ligature_exp: 1,
            e_no_dup_remove: 2,
            e_punct_break: 4,
            e_remove_hidden_text: 8,
            e_no_invisible_text: 16,
            e_no_watermarks: 128,
            e_extract_using_zorder: 256,
          }),
          (l.TextExtractor.XMLOutputFlags = {
            e_words_as_elements: 1,
            e_output_bbox: 2,
            e_output_style_info: 4,
          }),
          (l.TextSearch.ResultCode = { e_done: 0, e_page: 1, e_found: 2 }),
          (l.TextSearch.Mode = {
            e_reg_expression: 1,
            e_case_sensitive: 2,
            e_whole_word: 4,
            e_search_up: 8,
            e_page_stop: 16,
            e_highlight: 32,
            e_ambient_string: 64,
          }),
          (l.Obj.Type = {
            e_null: 0,
            e_bool: 1,
            e_number: 2,
            e_name: 3,
            e_string: 4,
            e_dict: 5,
            e_array: 6,
            e_stream: 7,
          }),
          (l.SDFDoc.SaveOptions = {
            e_incremental: 1,
            e_remove_unused: 2,
            e_hex_strings: 4,
            e_omit_xref: 8,
            e_linearized: 16,
            e_compatibility: 32,
          }),
          (l.SecurityHandler.Permission = {
            e_owner: 1,
            e_doc_open: 2,
            e_doc_modify: 3,
            e_print: 4,
            e_print_high: 5,
            e_extract_content: 6,
            e_mod_annot: 7,
            e_fill_forms: 8,
            e_access_support: 9,
            e_assemble_doc: 10,
          }),
          (l.SecurityHandler.AlgorithmType = {
            e_RC4_40: 1,
            e_RC4_128: 2,
            e_AES: 3,
            e_AES_256: 4,
          }),
          (l.VerificationOptions.SecurityLevel = {
            e_compatibility_and_archiving: 0,
            e_maximum: 1,
          }),
          (l.VerificationOptions.TimeMode = {
            e_signing: 0,
            e_timestamp: 1,
            e_current: 2,
          }),
          (l.VerificationOptions.CertificateTrustFlag = {
            e_signing_trust: 1,
            e_certification_trust: 2,
            e_dynamic_content: 4,
            e_javascript: 16,
            e_identity: 32,
            e_trust_anchor: 64,
            e_default_trust: 97,
            e_complete_trust: 119,
          }),
          (l.VerificationResult.DocumentStatus = {
            e_no_error: 0,
            e_corrupt_file: 1,
            e_unsigned: 2,
            e_bad_byteranges: 3,
            e_corrupt_cryptographic_contents: 4,
          }),
          (l.VerificationResult.DigestStatus = {
            e_digest_invalid: 0,
            e_digest_verified: 1,
            e_digest_verification_disabled: 2,
            e_weak_digest_algorithm_but_digest_verifiable: 3,
            e_no_digest_status: 4,
            e_unsupported_encoding: 5,
          }),
          (l.VerificationResult.TrustStatus = {
            e_trust_verified: 0,
            e_untrusted: 1,
            e_trust_verification_disabled: 2,
            e_no_trust_status: 3,
          }),
          (l.VerificationResult.ModificationPermissionsStatus = {
            e_invalidated_by_disallowed_changes: 0,
            e_has_allowed_changes: 1,
            e_unmodified: 2,
            e_permissions_verification_disabled: 3,
            e_no_permissions_status: 4,
          }),
          (l.DisallowedChange.Type = {
            e_form_filled: 0,
            e_digital_signature_signed: 1,
            e_page_template_instantiated: 2,
            e_annotation_created_or_updated_or_deleted: 3,
            e_other: 4,
            e_unknown: 5,
          }),
          (l.Iterator.prototype.hasNext = function () {
            return l.sendWithPromise('Iterator.hasNext', { itr: this.id });
          }),
          (l.Iterator.prototype.next = function () {
            return l.sendWithPromise('Iterator.next', { itr: this.id });
          }),
          (l.DictIterator.prototype.hasNext = function () {
            return l.sendWithPromise('DictIterator.hasNext', { itr: this.id });
          }),
          (l.DictIterator.prototype.key = function () {
            return l.sendWithPromise('DictIterator.key', { itr: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.DictIterator.prototype.value = function () {
            return l.sendWithPromise('DictIterator.value', { itr: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.DictIterator.prototype.next = function () {
            return l.sendWithPromise('DictIterator.next', { itr: this.id });
          }),
          (l.Matrix2D.prototype.copy = function () {
            return (
              P('copy', this.yieldFunction),
              l.sendWithPromise('Matrix2D.copy', { m: this }).then(function (t) {
                return new l.Matrix2D(t);
              })
            );
          }),
          (l.Matrix2D.prototype.set = function (t, e, n, i, r, o) {
            f(arguments.length, 6, 'set', '(number, number, number, number, number, number)', [
              [t, 'number'],
              [e, 'number'],
              [n, 'number'],
              [i, 'number'],
              [r, 'number'],
              [o, 'number'],
            ]),
              P('set', this.yieldFunction);
            var s = this;
            return (
              (this.yieldFunction = 'Matrix2D.set'),
              l
                .sendWithPromise('Matrix2D.set', {
                  matrix: this,
                  a: t,
                  b: e,
                  c: n,
                  d: i,
                  h: r,
                  v: o,
                })
                .then(function (t) {
                  (s.yieldFunction = void 0), W(t, s);
                })
            );
          }),
          (l.Matrix2D.prototype.concat = function (t, e, n, i, r, o) {
            f(arguments.length, 6, 'concat', '(number, number, number, number, number, number)', [
              [t, 'number'],
              [e, 'number'],
              [n, 'number'],
              [i, 'number'],
              [r, 'number'],
              [o, 'number'],
            ]),
              P('concat', this.yieldFunction);
            var s = this;
            return (
              (this.yieldFunction = 'Matrix2D.concat'),
              l
                .sendWithPromise('Matrix2D.concat', {
                  matrix: this,
                  a: t,
                  b: e,
                  c: n,
                  d: i,
                  h: r,
                  v: o,
                })
                .then(function (t) {
                  (s.yieldFunction = void 0), W(t, s);
                })
            );
          }),
          (l.Matrix2D.prototype.equals = function (t) {
            return (
              f(arguments.length, 1, 'equals', '(PDFNet.Matrix2D)', [[t, 'Structure', l.Matrix2D, 'Matrix2D']]),
              P('equals', this.yieldFunction),
              F('equals', [[t, 0]]),
              l.sendWithPromise('Matrix2D.equals', { m1: this, m2: t })
            );
          }),
          (l.Matrix2D.prototype.inverse = function () {
            return (
              P('inverse', this.yieldFunction),
              l.sendWithPromise('Matrix2D.inverse', { matrix: this }).then(function (t) {
                return new l.Matrix2D(t);
              })
            );
          }),
          (l.Matrix2D.prototype.translate = function (t, e) {
            f(arguments.length, 2, 'translate', '(number, number)', [
              [t, 'number'],
              [e, 'number'],
            ]),
              P('translate', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'Matrix2D.translate'),
              l
                .sendWithPromise('Matrix2D.translate', {
                  matrix: this,
                  h: t,
                  v: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.Matrix2D.prototype.preTranslate = function (t, e) {
            f(arguments.length, 2, 'preTranslate', '(number, number)', [
              [t, 'number'],
              [e, 'number'],
            ]),
              P('preTranslate', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'Matrix2D.preTranslate'),
              l
                .sendWithPromise('Matrix2D.preTranslate', {
                  matrix: this,
                  h: t,
                  v: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.Matrix2D.prototype.postTranslate = function (t, e) {
            f(arguments.length, 2, 'postTranslate', '(number, number)', [
              [t, 'number'],
              [e, 'number'],
            ]),
              P('postTranslate', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'Matrix2D.postTranslate'),
              l
                .sendWithPromise('Matrix2D.postTranslate', {
                  matrix: this,
                  h: t,
                  v: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.Matrix2D.prototype.scale = function (t, e) {
            f(arguments.length, 2, 'scale', '(number, number)', [
              [t, 'number'],
              [e, 'number'],
            ]),
              P('scale', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'Matrix2D.scale'),
              l.sendWithPromise('Matrix2D.scale', { matrix: this, h: t, v: e }).then(function (t) {
                (n.yieldFunction = void 0), W(t, n);
              })
            );
          }),
          (l.Matrix2D.createZeroMatrix = function () {
            return l.sendWithPromise('matrix2DCreateZeroMatrix', {}).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.Matrix2D.createIdentityMatrix = function () {
            return l.sendWithPromise('matrix2DCreateIdentityMatrix', {}).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.Matrix2D.createRotationMatrix = function (t) {
            return (
              f(arguments.length, 1, 'createRotationMatrix', '(number)', [[t, 'number']]),
              l.sendWithPromise('matrix2DCreateRotationMatrix', { angle: t }).then(function (t) {
                return new l.Matrix2D(t);
              })
            );
          }),
          (l.Matrix2D.prototype.multiply = function (t) {
            f(arguments.length, 1, 'multiply', '(PDFNet.Matrix2D)', [[t, 'Structure', l.Matrix2D, 'Matrix2D']]),
              P('multiply', this.yieldFunction),
              F('multiply', [[t, 0]]);
            var e = this;
            return (
              (this.yieldFunction = 'Matrix2D.multiply'),
              l.sendWithPromise('Matrix2D.multiply', { matrix: this, m: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Field.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('fieldCreate', { field_dict: t.id }).then(function (t) {
                return new l.Field(t);
              })
            );
          }),
          (l.Field.prototype.isValid = function () {
            return P('isValid', this.yieldFunction), l.sendWithPromise('Field.isValid', { field: this });
          }),
          (l.Field.prototype.getType = function () {
            return P('getType', this.yieldFunction), l.sendWithPromise('Field.getType', { field: this });
          }),
          (l.Field.prototype.getValue = function () {
            return (
              P('getValue', this.yieldFunction),
              l.sendWithPromise('Field.getValue', { field: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Field.prototype.getValueAsString = function () {
            return P('getValueAsString', this.yieldFunction), l.sendWithPromise('Field.getValueAsString', { field: this });
          }),
          (l.Field.prototype.getDefaultValueAsString = function () {
            return (
              P('getDefaultValueAsString', this.yieldFunction),
              l.sendWithPromise('Field.getDefaultValueAsString', {
                field: this,
              })
            );
          }),
          (l.Field.prototype.setValueAsString = function (t) {
            f(arguments.length, 1, 'setValueAsString', '(string)', [[t, 'string']]), P('setValueAsString', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.setValueAsString'),
              l
                .sendWithPromise('Field.setValueAsString', {
                  field: this,
                  value: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = D(l.ViewChangeCollection, t.result)), W(t.field, e), t.result;
                })
            );
          }),
          (l.Field.prototype.setValue = function (t) {
            f(arguments.length, 1, 'setValue', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]), P('setValue', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.setValue'),
              l.sendWithPromise('Field.setValue', { field: this, value: t.id }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = D(l.ViewChangeCollection, t.result)), W(t.field, e), t.result;
              })
            );
          }),
          (l.Field.prototype.setValueAsBool = function (t) {
            f(arguments.length, 1, 'setValueAsBool', '(boolean)', [[t, 'boolean']]), P('setValueAsBool', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.setValueAsBool'),
              l
                .sendWithPromise('Field.setValueAsBool', {
                  field: this,
                  value: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = D(l.ViewChangeCollection, t.result)), W(t.field, e), t.result;
                })
            );
          }),
          (l.Field.prototype.getTriggerAction = function (t) {
            return (
              f(arguments.length, 1, 'getTriggerAction', '(number)', [[t, 'number']]),
              P('getTriggerAction', this.yieldFunction),
              l
                .sendWithPromise('Field.getTriggerAction', {
                  field: this,
                  trigger: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Field.prototype.getValueAsBool = function () {
            return P('getValueAsBool', this.yieldFunction), l.sendWithPromise('Field.getValueAsBool', { field: this });
          }),
          (l.Field.prototype.refreshAppearance = function () {
            P('refreshAppearance', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.refreshAppearance'),
              l.sendWithPromise('Field.refreshAppearance', { field: this }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Field.prototype.eraseAppearance = function () {
            P('eraseAppearance', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.eraseAppearance'),
              l.sendWithPromise('Field.eraseAppearance', { field: this }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Field.prototype.getDefaultValue = function () {
            return (
              P('getDefaultValue', this.yieldFunction),
              l.sendWithPromise('Field.getDefaultValue', { field: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Field.prototype.getName = function () {
            return P('getName', this.yieldFunction), l.sendWithPromise('Field.getName', { field: this });
          }),
          (l.Field.prototype.getPartialName = function () {
            return P('getPartialName', this.yieldFunction), l.sendWithPromise('Field.getPartialName', { field: this });
          }),
          (l.Field.prototype.rename = function (t) {
            f(arguments.length, 1, 'rename', '(string)', [[t, 'string']]), P('rename', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.rename'),
              l.sendWithPromise('Field.rename', { field: this, field_name: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Field.prototype.isAnnot = function () {
            return P('isAnnot', this.yieldFunction), l.sendWithPromise('Field.isAnnot', { field: this });
          }),
          (l.Field.prototype.useSignatureHandler = function (t) {
            f(arguments.length, 1, 'useSignatureHandler', '(number)', [[t, 'number']]), P('useSignatureHandler', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.useSignatureHandler'),
              l
                .sendWithPromise('Field.useSignatureHandler', {
                  field: this,
                  signature_handler_id: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = _(l.Obj, t.result)), W(t.field, e), t.result;
                })
            );
          }),
          (l.Field.prototype.getFlag = function (t) {
            return (
              f(arguments.length, 1, 'getFlag', '(number)', [[t, 'number']]),
              P('getFlag', this.yieldFunction),
              l.sendWithPromise('Field.getFlag', { field: this, flag: t })
            );
          }),
          (l.Field.prototype.setFlag = function (t, e) {
            f(arguments.length, 2, 'setFlag', '(number, boolean)', [
              [t, 'number'],
              [e, 'boolean'],
            ]),
              P('setFlag', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'Field.setFlag'),
              l
                .sendWithPromise('Field.setFlag', {
                  field: this,
                  flag: t,
                  value: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.Field.prototype.getJustification = function () {
            P('getJustification', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.getJustification'),
              l.sendWithPromise('Field.getJustification', { field: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.field, e), t.result;
              })
            );
          }),
          (l.Field.prototype.setJustification = function (t) {
            f(arguments.length, 1, 'setJustification', '(number)', [[t, 'number']]), P('setJustification', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.setJustification'),
              l
                .sendWithPromise('Field.setJustification', {
                  field: this,
                  j: t,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.Field.prototype.setMaxLen = function (t) {
            f(arguments.length, 1, 'setMaxLen', '(number)', [[t, 'number']]), P('setMaxLen', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.setMaxLen'),
              l.sendWithPromise('Field.setMaxLen', { field: this, max_len: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Field.prototype.getMaxLen = function () {
            return P('getMaxLen', this.yieldFunction), l.sendWithPromise('Field.getMaxLen', { field: this });
          }),
          (l.Field.prototype.getDefaultAppearance = function () {
            P('getDefaultAppearance', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.getDefaultAppearance'),
              l.sendWithPromise('Field.getDefaultAppearance', { field: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = _(l.GState, t.result)), W(t.field, e), t.result;
              })
            );
          }),
          (l.Field.prototype.getUpdateRect = function () {
            return (
              P('getUpdateRect', this.yieldFunction),
              l.sendWithPromise('Field.getUpdateRect', { field: this }).then(function (t) {
                return new l.Rect(t);
              })
            );
          }),
          (l.Field.prototype.flatten = function (t) {
            f(arguments.length, 1, 'flatten', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]), P('flatten', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Field.flatten'),
              l.sendWithPromise('Field.flatten', { field: this, page: t.id }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Field.prototype.findInheritedAttribute = function (t) {
            return (
              f(arguments.length, 1, 'findInheritedAttribute', '(string)', [[t, 'string']]),
              P('findInheritedAttribute', this.yieldFunction),
              l
                .sendWithPromise('Field.findInheritedAttribute', {
                  field: this,
                  attrib: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Field.prototype.getSDFObj = function () {
            return (
              P('getSDFObj', this.yieldFunction),
              l.sendWithPromise('Field.getSDFObj', { field: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Field.prototype.getOptCount = function () {
            return P('getOptCount', this.yieldFunction), l.sendWithPromise('Field.getOptCount', { field: this });
          }),
          (l.Field.prototype.getOpt = function (t) {
            return (
              f(arguments.length, 1, 'getOpt', '(number)', [[t, 'number']]),
              P('getOpt', this.yieldFunction),
              l.sendWithPromise('Field.getOpt', { field: this, index: t })
            );
          }),
          (l.Field.prototype.isLockedByDigitalSignature = function () {
            return (
              P('isLockedByDigitalSignature', this.yieldFunction),
              l.sendWithPromise('Field.isLockedByDigitalSignature', {
                field: this,
              })
            );
          }),
          (l.FDFDoc.create = function () {
            return l.sendWithPromise('fdfDocCreate', {}).then(function (t) {
              return D(l.FDFDoc, t);
            });
          }),
          (l.FDFDoc.createFromStream = function (t) {
            return (
              f(arguments.length, 1, 'createFromStream', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              0 != t.id && O(t.id),
              l
                .sendWithPromise('fdfDocCreateFromStream', {
                  no_own_stream: t.id,
                })
                .then(function (t) {
                  return D(l.FDFDoc, t);
                })
            );
          }),
          (l.FDFDoc.createFromMemoryBuffer = function (t) {
            f(arguments.length, 1, 'createFromMemoryBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('fdfDocCreateFromMemoryBuffer', { buf: e }).then(function (t) {
              return D(l.FDFDoc, t);
            });
          }),
          (l.FDFDoc.prototype.isModified = function () {
            return l.sendWithPromise('FDFDoc.isModified', { doc: this.id });
          }),
          (l.FDFDoc.prototype.saveMemoryBuffer = function () {
            return l.sendWithPromise('FDFDoc.saveMemoryBuffer', { doc: this.id }).then(function (t) {
              return new Uint8Array(t);
            });
          }),
          (l.FDFDoc.prototype.getTrailer = function () {
            return l.sendWithPromise('FDFDoc.getTrailer', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.FDFDoc.prototype.getRoot = function () {
            return l.sendWithPromise('FDFDoc.getRoot', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.FDFDoc.prototype.getFDF = function () {
            return l.sendWithPromise('FDFDoc.getFDF', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.FDFDoc.prototype.getPDFFileName = function () {
            return l.sendWithPromise('FDFDoc.getPDFFileName', { doc: this.id });
          }),
          (l.FDFDoc.prototype.setPDFFileName = function (t) {
            return (
              f(arguments.length, 1, 'setPDFFileName', '(string)', [[t, 'string']]),
              l.sendWithPromise('FDFDoc.setPDFFileName', {
                doc: this.id,
                filepath: t,
              })
            );
          }),
          (l.FDFDoc.prototype.getID = function () {
            return l.sendWithPromise('FDFDoc.getID', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.FDFDoc.prototype.setID = function (t) {
            return (
              f(arguments.length, 1, 'setID', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]), l.sendWithPromise('FDFDoc.setID', { doc: this.id, id: t.id })
            );
          }),
          (l.FDFDoc.prototype.getFieldIteratorBegin = function () {
            return l.sendWithPromise('FDFDoc.getFieldIteratorBegin', { doc: this.id }).then(function (t) {
              return D(l.Iterator, t, 'FDFField');
            });
          }),
          (l.FDFDoc.prototype.getFieldIterator = function (t) {
            return (
              f(arguments.length, 1, 'getFieldIterator', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('FDFDoc.getFieldIterator', {
                  doc: this.id,
                  field_name: t,
                })
                .then(function (t) {
                  return D(l.Iterator, t, 'FDFField');
                })
            );
          }),
          (l.FDFDoc.prototype.getField = function (t) {
            return (
              f(arguments.length, 1, 'getField', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('FDFDoc.getField', {
                  doc: this.id,
                  field_name: t,
                })
                .then(function (t) {
                  return new l.FDFField(t);
                })
            );
          }),
          (l.FDFDoc.prototype.fieldCreate = function (t, e, n) {
            return (
              void 0 === n && (n = new l.Obj('0')),
              f(arguments.length, 2, 'fieldCreate', '(string, number, PDFNet.Obj)', [
                [t, 'string'],
                [e, 'number'],
                [n, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('FDFDoc.fieldCreate', {
                  doc: this.id,
                  field_name: t,
                  type: e,
                  field_value: n.id,
                })
                .then(function (t) {
                  return new l.FDFField(t);
                })
            );
          }),
          (l.FDFDoc.prototype.fieldCreateFromString = function (t, e, n) {
            return (
              f(arguments.length, 3, 'fieldCreateFromString', '(string, number, string)', [
                [t, 'string'],
                [e, 'number'],
                [n, 'string'],
              ]),
              l
                .sendWithPromise('FDFDoc.fieldCreateFromString', {
                  doc: this.id,
                  field_name: t,
                  type: e,
                  field_value: n,
                })
                .then(function (t) {
                  return new l.FDFField(t);
                })
            );
          }),
          (l.FDFDoc.prototype.getSDFDoc = function () {
            return l.sendWithPromise('FDFDoc.getSDFDoc', { doc: this.id }).then(function (t) {
              return _(l.SDFDoc, t);
            });
          }),
          (l.FDFDoc.createFromXFDF = function (t) {
            return (
              f(arguments.length, 1, 'createFromXFDF', '(string)', [[t, 'string']]),
              l.sendWithPromise('fdfDocCreateFromXFDF', { file_name: t }).then(function (t) {
                return D(l.FDFDoc, t);
              })
            );
          }),
          (l.FDFDoc.prototype.saveAsXFDFWithOptions = function (t, e) {
            return (
              void 0 === e && (e = null),
              f(arguments.length, 1, 'saveAsXFDFWithOptions', '(string, PDFNet.OptionBase)', [
                [t, 'string'],
                [e, 'OptionBase'],
              ]),
              F('saveAsXFDFWithOptions', [[e, 1]]),
              (e = e ? e.getJsonString() : '{}'),
              l.sendWithPromise('FDFDoc.saveAsXFDFWithOptions', {
                doc: this.id,
                filepath: t,
                opts: e,
              })
            );
          }),
          (l.FDFDoc.prototype.saveAsXFDFAsString = function () {
            return l.sendWithPromise('FDFDoc.saveAsXFDFAsString', {
              doc: this.id,
            });
          }),
          (l.FDFDoc.prototype.saveAsXFDFAsStringWithOptions = function (t) {
            return (
              void 0 === t && (t = null),
              f(arguments.length, 0, 'saveAsXFDFAsStringWithOptions', '(PDFNet.OptionBase)', [[t, 'OptionBase']]),
              F('saveAsXFDFAsStringWithOptions', [[t, 0]]),
              (t = t ? t.getJsonString() : '{}'),
              l.sendWithPromise('FDFDoc.saveAsXFDFAsStringWithOptions', {
                doc: this.id,
                opts: t,
              })
            );
          }),
          (l.FDFDoc.prototype.mergeAnnots = function (t, e) {
            return (
              void 0 === e && (e = ''),
              f(arguments.length, 1, 'mergeAnnots', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('FDFDoc.mergeAnnots', {
                doc: this.id,
                command_file: t,
                permitted_user: e,
              })
            );
          }),
          (l.FDFField.create = function (t, e) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              void 0 === e && (e = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj, PDFNet.Obj)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('fdfFieldCreate', {
                  field_dict: t.id,
                  fdf_dict: e.id,
                })
                .then(function (t) {
                  return new l.FDFField(t);
                })
            );
          }),
          (l.FDFField.prototype.getValue = function () {
            P('getValue', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'FDFField.getValue'),
              l.sendWithPromise('FDFField.getValue', { field: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = _(l.Obj, t.result)), W(t.field, e), t.result;
              })
            );
          }),
          (l.FDFField.prototype.setValue = function (t) {
            f(arguments.length, 1, 'setValue', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]), P('setValue', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'FDFField.setValue'),
              l
                .sendWithPromise('FDFField.setValue', {
                  field: this,
                  value: t.id,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.FDFField.prototype.getName = function () {
            P('getName', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'FDFField.getName'),
              l.sendWithPromise('FDFField.getName', { field: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.field, e), t.result;
              })
            );
          }),
          (l.FDFField.prototype.getPartialName = function () {
            P('getPartialName', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'FDFField.getPartialName'),
              l.sendWithPromise('FDFField.getPartialName', { field: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.field, e), t.result;
              })
            );
          }),
          (l.FDFField.prototype.getSDFObj = function () {
            return (
              P('getSDFObj', this.yieldFunction),
              l.sendWithPromise('FDFField.getSDFObj', { field: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.FDFField.prototype.findAttribute = function (t) {
            return (
              f(arguments.length, 1, 'findAttribute', '(string)', [[t, 'string']]),
              P('findAttribute', this.yieldFunction),
              l
                .sendWithPromise('FDFField.findAttribute', {
                  field: this,
                  attrib: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Filter.prototype.createASCII85Encode = function (t, e) {
            return (
              f(arguments.length, 2, 'createASCII85Encode', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('Filter.createASCII85Encode', {
                  no_own_input_filter: this.id,
                  line_width: t,
                  buf_sz: e,
                })
                .then(function (t) {
                  return D(l.Filter, t);
                })
            );
          }),
          (l.Filter.createMemoryFilter = function (t, e) {
            return (
              f(arguments.length, 2, 'createMemoryFilter', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('filterCreateMemoryFilter', {
                  buf_sz: t,
                  is_input: e,
                })
                .then(function (t) {
                  return D(l.Filter, t);
                })
            );
          }),
          (l.Filter.createImage2RGBFromElement = function (t) {
            return (
              f(arguments.length, 1, 'createImage2RGBFromElement', '(PDFNet.Element)', [[t, 'Object', l.Element, 'Element']]),
              l
                .sendWithPromise('filterCreateImage2RGBFromElement', {
                  elem: t.id,
                })
                .then(function (t) {
                  return D(l.Filter, t);
                })
            );
          }),
          (l.Filter.createImage2RGBFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createImage2RGBFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('filterCreateImage2RGBFromObj', { obj: t.id }).then(function (t) {
                return D(l.Filter, t);
              })
            );
          }),
          (l.Filter.createImage2RGB = function (t) {
            return (
              f(arguments.length, 1, 'createImage2RGB', '(PDFNet.Image)', [[t, 'Object', l.Image, 'Image']]),
              l.sendWithPromise('filterCreateImage2RGB', { img: t.id }).then(function (t) {
                return D(l.Filter, t);
              })
            );
          }),
          (l.Filter.createImage2RGBAFromElement = function (t, e) {
            return (
              f(arguments.length, 2, 'createImage2RGBAFromElement', '(PDFNet.Element, boolean)', [
                [t, 'Object', l.Element, 'Element'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('filterCreateImage2RGBAFromElement', {
                  elem: t.id,
                  premultiply: e,
                })
                .then(function (t) {
                  return D(l.Filter, t);
                })
            );
          }),
          (l.Filter.createImage2RGBAFromObj = function (t, e) {
            return (
              f(arguments.length, 2, 'createImage2RGBAFromObj', '(PDFNet.Obj, boolean)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('filterCreateImage2RGBAFromObj', {
                  obj: t.id,
                  premultiply: e,
                })
                .then(function (t) {
                  return D(l.Filter, t);
                })
            );
          }),
          (l.Filter.createImage2RGBA = function (t, e) {
            return (
              f(arguments.length, 2, 'createImage2RGBA', '(PDFNet.Image, boolean)', [
                [t, 'Object', l.Image, 'Image'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('filterCreateImage2RGBA', {
                  img: t.id,
                  premultiply: e,
                })
                .then(function (t) {
                  return D(l.Filter, t);
                })
            );
          }),
          (l.Filter.prototype.attachFilter = function (t) {
            return (
              f(arguments.length, 1, 'attachFilter', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              0 != t.id && O(t.id),
              l.sendWithPromise('Filter.attachFilter', {
                filter: this.id,
                no_own_attach_filter: t.id,
              })
            );
          }),
          (l.Filter.prototype.releaseAttachedFilter = function () {
            return l
              .sendWithPromise('Filter.releaseAttachedFilter', {
                filter: this.id,
              })
              .then(function (t) {
                return D(l.Filter, t);
              });
          }),
          (l.Filter.prototype.getAttachedFilter = function () {
            return l.sendWithPromise('Filter.getAttachedFilter', { filter: this.id }).then(function (t) {
              return _(l.Filter, t);
            });
          }),
          (l.Filter.prototype.getSourceFilter = function () {
            return l.sendWithPromise('Filter.getSourceFilter', { filter: this.id }).then(function (t) {
              return _(l.Filter, t);
            });
          }),
          (l.Filter.prototype.getName = function () {
            return l.sendWithPromise('Filter.getName', { filter: this.id });
          }),
          (l.Filter.prototype.getDecodeName = function () {
            return l.sendWithPromise('Filter.getDecodeName', {
              filter: this.id,
            });
          }),
          (l.Filter.prototype.begin = function () {
            return l.sendWithPromise('Filter.begin', { filter: this.id });
          }),
          (l.Filter.prototype.size = function () {
            return l.sendWithPromise('Filter.size', { filter: this.id });
          }),
          (l.Filter.prototype.consume = function (t) {
            return (
              f(arguments.length, 1, 'consume', '(number)', [[t, 'number']]),
              l.sendWithPromise('Filter.consume', {
                filter: this.id,
                num_bytes: t,
              })
            );
          }),
          (l.Filter.prototype.count = function () {
            return l.sendWithPromise('Filter.count', { filter: this.id });
          }),
          (l.Filter.prototype.setCount = function (t) {
            return (
              f(arguments.length, 1, 'setCount', '(number)', [[t, 'number']]),
              l.sendWithPromise('Filter.setCount', {
                filter: this.id,
                new_count: t,
              })
            );
          }),
          (l.Filter.prototype.setStreamLength = function (t) {
            return (
              f(arguments.length, 1, 'setStreamLength', '(number)', [[t, 'number']]),
              l.sendWithPromise('Filter.setStreamLength', {
                filter: this.id,
                bytes: t,
              })
            );
          }),
          (l.Filter.prototype.flush = function () {
            return l.sendWithPromise('Filter.flush', { filter: this.id });
          }),
          (l.Filter.prototype.flushAll = function () {
            return l.sendWithPromise('Filter.flushAll', { filter: this.id });
          }),
          (l.Filter.prototype.isInputFilter = function () {
            return l.sendWithPromise('Filter.isInputFilter', {
              filter: this.id,
            });
          }),
          (l.Filter.prototype.canSeek = function () {
            return l.sendWithPromise('Filter.canSeek', { filter: this.id });
          }),
          (l.Filter.prototype.seek = function (t, e) {
            return (
              f(arguments.length, 2, 'seek', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Filter.seek', {
                filter: this.id,
                offset: t,
                origin: e,
              })
            );
          }),
          (l.Filter.prototype.tell = function () {
            return l.sendWithPromise('Filter.tell', { filter: this.id });
          }),
          (l.Filter.prototype.truncate = function (t) {
            return (
              f(arguments.length, 1, 'truncate', '(number)', [[t, 'number']]),
              l.sendWithPromise('Filter.truncate', {
                filter: this.id,
                new_size: t,
              })
            );
          }),
          (l.Filter.prototype.createInputIterator = function () {
            return l
              .sendWithPromise('Filter.createInputIterator', {
                filter: this.id,
              })
              .then(function (t) {
                return D(l.Filter, t);
              });
          }),
          (l.Filter.prototype.getFilePath = function () {
            return l.sendWithPromise('Filter.getFilePath', { filter: this.id });
          }),
          (l.Filter.prototype.memoryFilterGetBuffer = function () {
            return l.sendWithPromise('Filter.memoryFilterGetBuffer', {
              filter: this.id,
            });
          }),
          (l.Filter.prototype.memoryFilterSetAsInputFilter = function () {
            return l.sendWithPromise('Filter.memoryFilterSetAsInputFilter', {
              filter: this.id,
            });
          }),
          (l.Filter.prototype.memoryFilterReset = function () {
            return l.sendWithPromise('Filter.memoryFilterReset', {
              filter: this.id,
            });
          }),
          (l.FilterReader.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              l.sendWithPromise('filterReaderCreate', { filter: t.id }).then(function (t) {
                return D(l.FilterReader, t);
              })
            );
          }),
          (l.FilterReader.prototype.attachFilter = function (t) {
            return (
              f(arguments.length, 1, 'attachFilter', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              l.sendWithPromise('FilterReader.attachFilter', {
                reader: this.id,
                filter: t.id,
              })
            );
          }),
          (l.FilterReader.prototype.getAttachedFilter = function () {
            return l
              .sendWithPromise('FilterReader.getAttachedFilter', {
                reader: this.id,
              })
              .then(function (t) {
                return _(l.Filter, t);
              });
          }),
          (l.FilterReader.prototype.seek = function (t, e) {
            return (
              f(arguments.length, 2, 'seek', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('FilterReader.seek', {
                reader: this.id,
                offset: t,
                origin: e,
              })
            );
          }),
          (l.FilterReader.prototype.tell = function () {
            return l.sendWithPromise('FilterReader.tell', { reader: this.id });
          }),
          (l.FilterReader.prototype.count = function () {
            return l.sendWithPromise('FilterReader.count', { reader: this.id });
          }),
          (l.FilterReader.prototype.flush = function () {
            return l.sendWithPromise('FilterReader.flush', { reader: this.id });
          }),
          (l.FilterReader.prototype.flushAll = function () {
            return l.sendWithPromise('FilterReader.flushAll', {
              reader: this.id,
            });
          }),
          (l.FilterReader.prototype.get = function () {
            return l.sendWithPromise('FilterReader.get', { reader: this.id });
          }),
          (l.FilterReader.prototype.peek = function () {
            return l.sendWithPromise('FilterReader.peek', { reader: this.id });
          }),
          (l.FilterWriter.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              l.sendWithPromise('filterWriterCreate', { filter: t.id }).then(function (t) {
                return D(l.FilterWriter, t);
              })
            );
          }),
          (l.FilterWriter.prototype.attachFilter = function (t) {
            return (
              f(arguments.length, 1, 'attachFilter', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              l.sendWithPromise('FilterWriter.attachFilter', {
                writer: this.id,
                filter: t.id,
              })
            );
          }),
          (l.FilterWriter.prototype.getAttachedFilter = function () {
            return l
              .sendWithPromise('FilterWriter.getAttachedFilter', {
                writer: this.id,
              })
              .then(function (t) {
                return _(l.Filter, t);
              });
          }),
          (l.FilterWriter.prototype.seek = function (t, e) {
            return (
              f(arguments.length, 2, 'seek', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('FilterWriter.seek', {
                writer: this.id,
                offset: t,
                origin: e,
              })
            );
          }),
          (l.FilterWriter.prototype.tell = function () {
            return l.sendWithPromise('FilterWriter.tell', { writer: this.id });
          }),
          (l.FilterWriter.prototype.count = function () {
            return l.sendWithPromise('FilterWriter.count', { writer: this.id });
          }),
          (l.FilterWriter.prototype.flush = function () {
            return l.sendWithPromise('FilterWriter.flush', { writer: this.id });
          }),
          (l.FilterWriter.prototype.flushAll = function () {
            return l.sendWithPromise('FilterWriter.flushAll', {
              writer: this.id,
            });
          }),
          (l.FilterWriter.prototype.writeUChar = function (t) {
            return (
              f(arguments.length, 1, 'writeUChar', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeUChar', {
                writer: this.id,
                ch: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeInt16 = function (t) {
            return (
              f(arguments.length, 1, 'writeInt16', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeInt16', {
                writer: this.id,
                num: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeUInt16 = function (t) {
            return (
              f(arguments.length, 1, 'writeUInt16', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeUInt16', {
                writer: this.id,
                num: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeInt32 = function (t) {
            return (
              f(arguments.length, 1, 'writeInt32', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeInt32', {
                writer: this.id,
                num: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeUInt32 = function (t) {
            return (
              f(arguments.length, 1, 'writeUInt32', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeUInt32', {
                writer: this.id,
                num: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeInt64 = function (t) {
            return (
              f(arguments.length, 1, 'writeInt64', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeInt64', {
                writer: this.id,
                num: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeUInt64 = function (t) {
            return (
              f(arguments.length, 1, 'writeUInt64', '(number)', [[t, 'number']]),
              l.sendWithPromise('FilterWriter.writeUInt64', {
                writer: this.id,
                num: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeString = function (t) {
            return (
              f(arguments.length, 1, 'writeString', '(string)', [[t, 'string']]),
              l.sendWithPromise('FilterWriter.writeString', {
                writer: this.id,
                str: t,
              })
            );
          }),
          (l.FilterWriter.prototype.writeFilter = function (t) {
            return (
              f(arguments.length, 1, 'writeFilter', '(PDFNet.FilterReader)', [[t, 'Object', l.FilterReader, 'FilterReader']]),
              l.sendWithPromise('FilterWriter.writeFilter', {
                writer: this.id,
                reader: t.id,
              })
            );
          }),
          (l.FilterWriter.prototype.writeLine = function (t, e) {
            return (
              void 0 === e && (e = 13),
              f(arguments.length, 1, 'writeLine', '(string, number)', [
                [t, 'const char* = 0'],
                [e, 'number'],
              ]),
              l.sendWithPromise('FilterWriter.writeLine', {
                writer: this.id,
                line: t,
                eol: e,
              })
            );
          }),
          (l.FilterWriter.prototype.writeBuffer = function (t) {
            f(arguments.length, 1, 'writeBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('FilterWriter.writeBuffer', {
              writer: this.id,
              buf: e,
            });
          }),
          (l.OCG.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, string)', [
                [t, 'PDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('ocgCreate', { pdfdoc: t.id, name: e }).then(function (t) {
                return _(l.OCG, t);
              })
            );
          }),
          (l.OCG.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ocgCreateFromObj', { ocg_dict: t.id }).then(function (t) {
                return _(l.OCG, t);
              })
            );
          }),
          (l.OCG.prototype.copy = function () {
            return l.sendWithPromise('OCG.copy', { ocg: this.id }).then(function (t) {
              return _(l.OCG, t);
            });
          }),
          (l.OCG.prototype.getSDFObj = function () {
            return l.sendWithPromise('OCG.getSDFObj', { ocg: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCG.prototype.isValid = function () {
            return l.sendWithPromise('OCG.isValid', { ocg: this.id });
          }),
          (l.OCG.prototype.getName = function () {
            return l.sendWithPromise('OCG.getName', { c: this.id });
          }),
          (l.OCG.prototype.setName = function (t) {
            return f(arguments.length, 1, 'setName', '(string)', [[t, 'string']]), l.sendWithPromise('OCG.setName', { c: this.id, value: t });
          }),
          (l.OCG.prototype.getIntent = function () {
            return l.sendWithPromise('OCG.getIntent', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCG.prototype.setIntent = function (t) {
            return (
              f(arguments.length, 1, 'setIntent', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('OCG.setIntent', { c: this.id, value: t.id })
            );
          }),
          (l.OCG.prototype.hasUsage = function () {
            return l.sendWithPromise('OCG.hasUsage', { c: this.id });
          }),
          (l.OCG.prototype.getUsage = function (t) {
            return (
              f(arguments.length, 1, 'getUsage', '(string)', [[t, 'string']]),
              l.sendWithPromise('OCG.getUsage', { c: this.id, key: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.OCG.prototype.getCurrentState = function (t) {
            return (
              f(arguments.length, 1, 'getCurrentState', '(PDFNet.OCGContext)', [[t, 'Object', l.OCGContext, 'OCGContext']]),
              l.sendWithPromise('OCG.getCurrentState', {
                c: this.id,
                ctx: t.id,
              })
            );
          }),
          (l.OCG.prototype.setCurrentState = function (t, e) {
            return (
              f(arguments.length, 2, 'setCurrentState', '(PDFNet.OCGContext, boolean)', [
                [t, 'Object', l.OCGContext, 'OCGContext'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('OCG.setCurrentState', {
                c: this.id,
                ctx: t.id,
                state: e,
              })
            );
          }),
          (l.OCG.prototype.getInitialState = function (t) {
            return (
              f(arguments.length, 1, 'getInitialState', '(PDFNet.OCGConfig)', [[t, 'Object', l.OCGConfig, 'OCGConfig']]),
              l.sendWithPromise('OCG.getInitialState', {
                c: this.id,
                cfg: t.id,
              })
            );
          }),
          (l.OCG.prototype.setInitialState = function (t, e) {
            return (
              f(arguments.length, 2, 'setInitialState', '(PDFNet.OCGConfig, boolean)', [
                [t, 'Object', l.OCGConfig, 'OCGConfig'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('OCG.setInitialState', {
                c: this.id,
                cfg: t.id,
                state: e,
              })
            );
          }),
          (l.OCG.prototype.isLocked = function (t) {
            return (
              f(arguments.length, 1, 'isLocked', '(PDFNet.OCGConfig)', [[t, 'Object', l.OCGConfig, 'OCGConfig']]),
              l.sendWithPromise('OCG.isLocked', { c: this.id, cfg: t.id })
            );
          }),
          (l.OCG.prototype.setLocked = function (t, e) {
            return (
              f(arguments.length, 2, 'setLocked', '(PDFNet.OCGConfig, boolean)', [
                [t, 'Object', l.OCGConfig, 'OCGConfig'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('OCG.setLocked', {
                c: this.id,
                cfg: t.id,
                state: e,
              })
            );
          }),
          (l.OCGConfig.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ocgConfigCreateFromObj', { dict: t.id }).then(function (t) {
                return _(l.OCGConfig, t);
              })
            );
          }),
          (l.OCGConfig.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, boolean)', [
                [t, 'PDFDoc'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('ocgConfigCreate', {
                  pdfdoc: t.id,
                  default_config: e,
                })
                .then(function (t) {
                  return _(l.OCGConfig, t);
                })
            );
          }),
          (l.OCGConfig.prototype.copy = function () {
            return l.sendWithPromise('OCGConfig.copy', { c: this.id }).then(function (t) {
              return _(l.OCGConfig, t);
            });
          }),
          (l.OCGConfig.prototype.getSDFObj = function () {
            return l.sendWithPromise('OCGConfig.getSDFObj', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCGConfig.prototype.getOrder = function () {
            return l.sendWithPromise('OCGConfig.getOrder', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCGConfig.prototype.setOrder = function (t) {
            return (
              f(arguments.length, 1, 'setOrder', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('OCGConfig.setOrder', {
                c: this.id,
                value: t.id,
              })
            );
          }),
          (l.OCGConfig.prototype.getName = function () {
            return l.sendWithPromise('OCGConfig.getName', { c: this.id });
          }),
          (l.OCGConfig.prototype.setName = function (t) {
            return f(arguments.length, 1, 'setName', '(string)', [[t, 'string']]), l.sendWithPromise('OCGConfig.setName', { c: this.id, value: t });
          }),
          (l.OCGConfig.prototype.getCreator = function () {
            return l.sendWithPromise('OCGConfig.getCreator', { c: this.id });
          }),
          (l.OCGConfig.prototype.setCreator = function (t) {
            return (
              f(arguments.length, 1, 'setCreator', '(string)', [[t, 'string']]),
              l.sendWithPromise('OCGConfig.setCreator', {
                c: this.id,
                value: t,
              })
            );
          }),
          (l.OCGConfig.prototype.getInitBaseState = function () {
            return l.sendWithPromise('OCGConfig.getInitBaseState', {
              c: this.id,
            });
          }),
          (l.OCGConfig.prototype.setInitBaseState = function (t) {
            return (
              void 0 === t && (t = 'ON'),
              f(arguments.length, 0, 'setInitBaseState', '(string)', [[t, 'const char* = 0']]),
              l.sendWithPromise('OCGConfig.setInitBaseState', {
                c: this.id,
                value: t,
              })
            );
          }),
          (l.OCGConfig.prototype.getInitOnStates = function () {
            return l.sendWithPromise('OCGConfig.getInitOnStates', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCGConfig.prototype.setInitOnStates = function (t) {
            return (
              f(arguments.length, 1, 'setInitOnStates', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('OCGConfig.setInitOnStates', {
                c: this.id,
                value: t.id,
              })
            );
          }),
          (l.OCGConfig.prototype.getInitOffStates = function () {
            return l.sendWithPromise('OCGConfig.getInitOffStates', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCGConfig.prototype.setInitOffStates = function (t) {
            return (
              f(arguments.length, 1, 'setInitOffStates', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('OCGConfig.setInitOffStates', {
                c: this.id,
                value: t.id,
              })
            );
          }),
          (l.OCGConfig.prototype.getIntent = function () {
            return l.sendWithPromise('OCGConfig.getIntent', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCGConfig.prototype.setIntent = function (t) {
            return (
              f(arguments.length, 1, 'setIntent', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('OCGConfig.setIntent', {
                c: this.id,
                value: t.id,
              })
            );
          }),
          (l.OCGConfig.prototype.getLockedOCGs = function () {
            return l.sendWithPromise('OCGConfig.getLockedOCGs', { c: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCGConfig.prototype.setLockedOCGs = function (t) {
            return (
              f(arguments.length, 1, 'setLockedOCGs', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('OCGConfig.setLockedOCGs', {
                c: this.id,
                value: t.id,
              })
            );
          }),
          (l.OCGContext.createFromConfig = function (t) {
            return (
              f(arguments.length, 1, 'createFromConfig', '(PDFNet.OCGConfig)', [[t, 'Object', l.OCGConfig, 'OCGConfig']]),
              l.sendWithPromise('ocgContextCreateFromConfig', { cfg: t.id }).then(function (t) {
                return D(l.OCGContext, t);
              })
            );
          }),
          (l.OCGContext.prototype.copy = function () {
            return l.sendWithPromise('OCGContext.copy', { c: this.id }).then(function (t) {
              return D(l.OCGContext, t);
            });
          }),
          (l.OCGContext.prototype.getState = function (t) {
            return (
              f(arguments.length, 1, 'getState', '(PDFNet.OCG)', [[t, 'Object', l.OCG, 'OCG']]),
              l.sendWithPromise('OCGContext.getState', {
                c: this.id,
                grp: t.id,
              })
            );
          }),
          (l.OCGContext.prototype.setState = function (t, e) {
            return (
              f(arguments.length, 2, 'setState', '(PDFNet.OCG, boolean)', [
                [t, 'Object', l.OCG, 'OCG'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('OCGContext.setState', {
                c: this.id,
                grp: t.id,
                state: e,
              })
            );
          }),
          (l.OCGContext.prototype.resetStates = function (t) {
            return (
              f(arguments.length, 1, 'resetStates', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('OCGContext.resetStates', {
                c: this.id,
                all_on: t,
              })
            );
          }),
          (l.OCGContext.prototype.setNonOCDrawing = function (t) {
            return (
              f(arguments.length, 1, 'setNonOCDrawing', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('OCGContext.setNonOCDrawing', {
                c: this.id,
                draw_non_OC: t,
              })
            );
          }),
          (l.OCGContext.prototype.getNonOCDrawing = function () {
            return l.sendWithPromise('OCGContext.getNonOCDrawing', {
              c: this.id,
            });
          }),
          (l.OCGContext.prototype.setOCDrawMode = function (t) {
            return (
              f(arguments.length, 1, 'setOCDrawMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('OCGContext.setOCDrawMode', {
                c: this.id,
                oc_draw_mode: t,
              })
            );
          }),
          (l.OCGContext.prototype.getOCMode = function () {
            return l.sendWithPromise('OCGContext.getOCMode', { c: this.id });
          }),
          (l.OCMD.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ocmdCreateFromObj', { ocmd_dict: t.id }).then(function (t) {
                return _(l.OCMD, t);
              })
            );
          }),
          (l.OCMD.create = function (t, e, n) {
            return (
              f(arguments.length, 3, 'create', '(PDFNet.PDFDoc, PDFNet.Obj, number)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.Obj, 'Obj'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('ocmdCreate', {
                  pdfdoc: t.id,
                  ocgs: e.id,
                  vis_policy: n,
                })
                .then(function (t) {
                  return _(l.OCMD, t);
                })
            );
          }),
          (l.OCMD.prototype.copy = function () {
            return l.sendWithPromise('OCMD.copy', { ocmd: this.id }).then(function (t) {
              return _(l.OCMD, t);
            });
          }),
          (l.OCMD.prototype.getSDFObj = function () {
            return l.sendWithPromise('OCMD.getSDFObj', { ocmd: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCMD.prototype.getOCGs = function () {
            return l.sendWithPromise('OCMD.getOCGs', { ocmd: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.OCMD.prototype.getVisibilityExpression = function () {
            return l
              .sendWithPromise('OCMD.getVisibilityExpression', {
                ocmd: this.id,
              })
              .then(function (t) {
                return _(l.Obj, t);
              });
          }),
          (l.OCMD.prototype.isValid = function () {
            return l.sendWithPromise('OCMD.isValid', { ocmd: this.id });
          }),
          (l.OCMD.prototype.isCurrentlyVisible = function (t) {
            return (
              f(arguments.length, 1, 'isCurrentlyVisible', '(PDFNet.OCGContext)', [[t, 'Object', l.OCGContext, 'OCGContext']]),
              l.sendWithPromise('OCMD.isCurrentlyVisible', {
                ocmd: this.id,
                ctx: t.id,
              })
            );
          }),
          (l.OCMD.prototype.getVisibilityPolicy = function () {
            return l.sendWithPromise('OCMD.getVisibilityPolicy', {
              ocmd: this.id,
            });
          }),
          (l.OCMD.prototype.setVisibilityPolicy = function (t) {
            return (
              f(arguments.length, 1, 'setVisibilityPolicy', '(number)', [[t, 'number']]),
              l.sendWithPromise('OCMD.setVisibilityPolicy', {
                ocmd: this.id,
                vis_policy: t,
              })
            );
          }),
          (l.PDFACompliance.prototype.getErrorCount = function () {
            return l.sendWithPromise('PDFACompliance.getErrorCount', {
              pdfac: this.id,
            });
          }),
          (l.PDFACompliance.prototype.getError = function (t) {
            return (
              f(arguments.length, 1, 'getError', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFACompliance.getError', {
                pdfac: this.id,
                idx: t,
              })
            );
          }),
          (l.PDFACompliance.prototype.getRefObjCount = function (t) {
            return (
              f(arguments.length, 1, 'getRefObjCount', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFACompliance.getRefObjCount', {
                pdfac: this.id,
                id: t,
              })
            );
          }),
          (l.PDFACompliance.prototype.getRefObj = function (t, e) {
            return (
              f(arguments.length, 2, 'getRefObj', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('PDFACompliance.getRefObj', {
                pdfac: this.id,
                id: t,
                err_idx: e,
              })
            );
          }),
          (l.PDFACompliance.getPDFAErrorMessage = function (t) {
            return (
              f(arguments.length, 1, 'getPDFAErrorMessage', '(number)', [[t, 'number']]), l.sendWithPromise('pdfaComplianceGetPDFAErrorMessage', { id: t })
            );
          }),
          (l.PDFACompliance.getDeclaredConformance = function (t) {
            return (
              f(arguments.length, 1, 'getDeclaredConformance', '(PDFNet.PDFDoc)', [[t, 'PDFDoc']]),
              l.sendWithPromise('pdfaComplianceGetDeclaredConformance', {
                doc: t.id,
              })
            );
          }),
          (l.PDFACompliance.prototype.saveAsFromBuffer = function (t) {
            return (
              void 0 === t && (t = !1),
              f(arguments.length, 0, 'saveAsFromBuffer', '(boolean)', [[t, 'boolean']]),
              l
                .sendWithPromise('PDFACompliance.saveAsFromBuffer', {
                  pdfac: this.id,
                  linearized: t,
                })
                .then(function (t) {
                  return new Uint8Array(t);
                })
            );
          }),
          (l.AttrObj.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('attrObjCreate', { dict: t.id }).then(function (t) {
                return _(l.AttrObj, t);
              })
            );
          }),
          (l.AttrObj.prototype.copy = function () {
            return l.sendWithPromise('AttrObj.copy', { a: this.id }).then(function (t) {
              return _(l.AttrObj, t);
            });
          }),
          (l.AttrObj.prototype.getOwner = function () {
            return l.sendWithPromise('AttrObj.getOwner', { obj: this.id });
          }),
          (l.AttrObj.prototype.getSDFObj = function () {
            return l.sendWithPromise('AttrObj.getSDFObj', { obj: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ClassMap.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('classMapCreate', { dict: t.id }).then(function (t) {
                return _(l.ClassMap, t);
              })
            );
          }),
          (l.ClassMap.prototype.copy = function () {
            return l.sendWithPromise('ClassMap.copy', { p: this.id }).then(function (t) {
              return _(l.ClassMap, t);
            });
          }),
          (l.ClassMap.prototype.isValid = function () {
            return l.sendWithPromise('ClassMap.isValid', { map: this.id });
          }),
          (l.ClassMap.prototype.getSDFObj = function () {
            return l.sendWithPromise('ClassMap.getSDFObj', { map: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ContentItem.prototype.copy = function () {
            return (
              P('copy', this.yieldFunction),
              l.sendWithPromise('ContentItem.copy', { c: this }).then(function (t) {
                return new l.ContentItem(t);
              })
            );
          }),
          (l.ContentItem.prototype.getType = function () {
            return P('getType', this.yieldFunction), l.sendWithPromise('ContentItem.getType', { item: this });
          }),
          (l.ContentItem.prototype.getParent = function () {
            P('getParent', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'ContentItem.getParent'),
              l.sendWithPromise('ContentItem.getParent', { item: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = new l.SElement(t.result)), W(t.item, e), t.result;
              })
            );
          }),
          (l.ContentItem.prototype.getPage = function () {
            P('getPage', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'ContentItem.getPage'),
              l.sendWithPromise('ContentItem.getPage', { item: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = _(l.Page, t.result)), W(t.item, e), t.result;
              })
            );
          }),
          (l.ContentItem.prototype.getSDFObj = function () {
            return (
              P('getSDFObj', this.yieldFunction),
              l.sendWithPromise('ContentItem.getSDFObj', { item: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.ContentItem.prototype.getMCID = function () {
            return P('getMCID', this.yieldFunction), l.sendWithPromise('ContentItem.getMCID', { item: this });
          }),
          (l.ContentItem.prototype.getContainingStm = function () {
            return (
              P('getContainingStm', this.yieldFunction),
              l.sendWithPromise('ContentItem.getContainingStm', { item: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.ContentItem.prototype.getStmOwner = function () {
            return (
              P('getStmOwner', this.yieldFunction),
              l.sendWithPromise('ContentItem.getStmOwner', { item: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.ContentItem.prototype.getRefObj = function () {
            return (
              P('getRefObj', this.yieldFunction),
              l.sendWithPromise('ContentItem.getRefObj', { item: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.RoleMap.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('roleMapCreate', { dict: t.id }).then(function (t) {
                return _(l.RoleMap, t);
              })
            );
          }),
          (l.RoleMap.prototype.copy = function () {
            return l.sendWithPromise('RoleMap.copy', { p: this.id }).then(function (t) {
              return _(l.RoleMap, t);
            });
          }),
          (l.RoleMap.prototype.isValid = function () {
            return l.sendWithPromise('RoleMap.isValid', { map: this.id });
          }),
          (l.RoleMap.prototype.getDirectMap = function (t) {
            return (
              f(arguments.length, 1, 'getDirectMap', '(string)', [[t, 'string']]),
              l.sendWithPromise('RoleMap.getDirectMap', {
                map: this.id,
                type: t,
              })
            );
          }),
          (l.RoleMap.prototype.getSDFObj = function () {
            return l.sendWithPromise('RoleMap.getSDFObj', { map: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SElement.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('sElementCreate', { dict: t.id }).then(function (t) {
                return new l.SElement(t);
              })
            );
          }),
          (l.SElement.createFromPDFDoc = function (t, e) {
            return (
              f(arguments.length, 2, 'createFromPDFDoc', '(PDFNet.PDFDoc, string)', [
                [t, 'PDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('sElementCreateFromPDFDoc', {
                  doc: t.id,
                  struct_type: e,
                })
                .then(function (t) {
                  return new l.SElement(t);
                })
            );
          }),
          (l.SElement.prototype.insert = function (e, t) {
            f(arguments.length, 2, 'insert', '(PDFNet.SElement, number)', [
              [e, 'Structure', l.SElement, 'SElement'],
              [t, 'number'],
            ]),
              P('insert', this.yieldFunction),
              F('insert', [[e, 0]]);
            var n = this;
            return (
              (this.yieldFunction = 'SElement.insert'),
              (e.yieldFunction = 'SElement.insert'),
              l
                .sendWithPromise('SElement.insert', {
                  e: this,
                  kid: e,
                  insert_before: t,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), (e.yieldFunction = void 0), W(t.e, n), W(t.kid, e);
                })
            );
          }),
          (l.SElement.prototype.createContentItem = function (t, e, n) {
            void 0 === n && (n = -1),
              f(arguments.length, 2, 'createContentItem', '(PDFNet.PDFDoc, PDFNet.Page, number)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.Page, 'Page'],
                [n, 'number'],
              ]),
              P('createContentItem', this.yieldFunction);
            var i = this;
            return (
              (this.yieldFunction = 'SElement.createContentItem'),
              l
                .sendWithPromise('SElement.createContentItem', {
                  e: this,
                  doc: t.id,
                  page: e.id,
                  insert_before: n,
                })
                .then(function (t) {
                  return (i.yieldFunction = void 0), W(t.e, i), t.result;
                })
            );
          }),
          (l.SElement.prototype.isValid = function () {
            return P('isValid', this.yieldFunction), l.sendWithPromise('SElement.isValid', { e: this });
          }),
          (l.SElement.prototype.getType = function () {
            return P('getType', this.yieldFunction), l.sendWithPromise('SElement.getType', { e: this });
          }),
          (l.SElement.prototype.getNumKids = function () {
            return P('getNumKids', this.yieldFunction), l.sendWithPromise('SElement.getNumKids', { e: this });
          }),
          (l.SElement.prototype.isContentItem = function (t) {
            return (
              f(arguments.length, 1, 'isContentItem', '(number)', [[t, 'number']]),
              P('isContentItem', this.yieldFunction),
              l.sendWithPromise('SElement.isContentItem', { e: this, index: t })
            );
          }),
          (l.SElement.prototype.getAsContentItem = function (t) {
            return (
              f(arguments.length, 1, 'getAsContentItem', '(number)', [[t, 'number']]),
              P('getAsContentItem', this.yieldFunction),
              l
                .sendWithPromise('SElement.getAsContentItem', {
                  e: this,
                  index: t,
                })
                .then(function (t) {
                  return new l.ContentItem(t);
                })
            );
          }),
          (l.SElement.prototype.getAsStructElem = function (t) {
            return (
              f(arguments.length, 1, 'getAsStructElem', '(number)', [[t, 'number']]),
              P('getAsStructElem', this.yieldFunction),
              l
                .sendWithPromise('SElement.getAsStructElem', {
                  e: this,
                  index: t,
                })
                .then(function (t) {
                  return new l.SElement(t);
                })
            );
          }),
          (l.SElement.prototype.getParent = function () {
            return (
              P('getParent', this.yieldFunction),
              l.sendWithPromise('SElement.getParent', { e: this }).then(function (t) {
                return new l.SElement(t);
              })
            );
          }),
          (l.SElement.prototype.getStructTreeRoot = function () {
            return (
              P('getStructTreeRoot', this.yieldFunction),
              l.sendWithPromise('SElement.getStructTreeRoot', { e: this }).then(function (t) {
                return _(l.STree, t);
              })
            );
          }),
          (l.SElement.prototype.hasTitle = function () {
            return P('hasTitle', this.yieldFunction), l.sendWithPromise('SElement.hasTitle', { e: this });
          }),
          (l.SElement.prototype.getTitle = function () {
            return P('getTitle', this.yieldFunction), l.sendWithPromise('SElement.getTitle', { e: this });
          }),
          (l.SElement.prototype.getID = function () {
            return (
              P('getID', this.yieldFunction),
              l.sendWithPromise('SElement.getID', { e: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.SElement.prototype.hasActualText = function () {
            return P('hasActualText', this.yieldFunction), l.sendWithPromise('SElement.hasActualText', { e: this });
          }),
          (l.SElement.prototype.getActualText = function () {
            return P('getActualText', this.yieldFunction), l.sendWithPromise('SElement.getActualText', { e: this });
          }),
          (l.SElement.prototype.hasAlt = function () {
            return P('hasAlt', this.yieldFunction), l.sendWithPromise('SElement.hasAlt', { e: this });
          }),
          (l.SElement.prototype.getAlt = function () {
            return P('getAlt', this.yieldFunction), l.sendWithPromise('SElement.getAlt', { e: this });
          }),
          (l.SElement.prototype.getSDFObj = function () {
            return (
              P('getSDFObj', this.yieldFunction),
              l.sendWithPromise('SElement.getSDFObj', { e: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.STree.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('sTreeCreate', { struct_dict: t.id }).then(function (t) {
                return _(l.STree, t);
              })
            );
          }),
          (l.STree.createFromPDFDoc = function (t) {
            return (
              f(arguments.length, 1, 'createFromPDFDoc', '(PDFNet.PDFDoc)', [[t, 'PDFDoc']]),
              l.sendWithPromise('sTreeCreateFromPDFDoc', { doc: t.id }).then(function (t) {
                return _(l.STree, t);
              })
            );
          }),
          (l.STree.prototype.insert = function (e, t) {
            return (
              f(arguments.length, 2, 'insert', '(PDFNet.SElement, number)', [
                [e, 'Structure', l.SElement, 'SElement'],
                [t, 'number'],
              ]),
              F('insert', [[e, 0]]),
              (e.yieldFunction = 'STree.insert'),
              l
                .sendWithPromise('STree.insert', {
                  tree: this.id,
                  kid: e,
                  insert_before: t,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.STree.prototype.copy = function () {
            return l.sendWithPromise('STree.copy', { c: this.id }).then(function (t) {
              return _(l.STree, t);
            });
          }),
          (l.STree.prototype.isValid = function () {
            return l.sendWithPromise('STree.isValid', { tree: this.id });
          }),
          (l.STree.prototype.getNumKids = function () {
            return l.sendWithPromise('STree.getNumKids', { tree: this.id });
          }),
          (l.STree.prototype.getKid = function (t) {
            return (
              f(arguments.length, 1, 'getKid', '(number)', [[t, 'number']]),
              l.sendWithPromise('STree.getKid', { tree: this.id, index: t }).then(function (t) {
                return new l.SElement(t);
              })
            );
          }),
          (l.STree.prototype.getRoleMap = function () {
            return l.sendWithPromise('STree.getRoleMap', { tree: this.id }).then(function (t) {
              return _(l.RoleMap, t);
            });
          }),
          (l.STree.prototype.getClassMap = function () {
            return l.sendWithPromise('STree.getClassMap', { tree: this.id }).then(function (t) {
              return _(l.ClassMap, t);
            });
          }),
          (l.STree.prototype.getSDFObj = function () {
            return l.sendWithPromise('STree.getSDFObj', { tree: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Action.createGoto = function (t) {
            return (
              f(arguments.length, 1, 'createGoto', '(PDFNet.Destination)', [[t, 'Object', l.Destination, 'Destination']]),
              l.sendWithPromise('actionCreateGoto', { dest: t.id }).then(function (t) {
                return _(l.Action, t);
              })
            );
          }),
          (l.Action.createGotoWithKey = function (t, e) {
            return (
              f(arguments.length, 2, 'createGotoWithKey', '(string, PDFNet.Destination)', [
                [t, 'string'],
                [e, 'Object', l.Destination, 'Destination'],
              ]),
              l
                .sendWithPromise('actionCreateGotoWithKey', {
                  key: t,
                  dest: e.id,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.createGotoRemote = function (t, e) {
            return (
              f(arguments.length, 2, 'createGotoRemote', '(PDFNet.FileSpec, number)', [
                [t, 'Object', l.FileSpec, 'FileSpec'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('actionCreateGotoRemote', {
                  file: t.id,
                  page_num: e,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.createGotoRemoteSetNewWindow = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createGotoRemoteSetNewWindow', '(PDFNet.FileSpec, number, boolean)', [
                [t, 'Object', l.FileSpec, 'FileSpec'],
                [e, 'number'],
                [n, 'boolean'],
              ]),
              l
                .sendWithPromise('actionCreateGotoRemoteSetNewWindow', {
                  file: t.id,
                  page_num: e,
                  new_window: n,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.createURI = function (t, e) {
            return (
              f(arguments.length, 2, 'createURI', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('actionCreateURI', { sdfdoc: t.id, uri: e }).then(function (t) {
                return _(l.Action, t);
              })
            );
          }),
          (l.Action.createURIWithUString = function (t, e) {
            return (
              f(arguments.length, 2, 'createURIWithUString', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('actionCreateURIWithUString', {
                  sdfdoc: t.id,
                  uri: e,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          });
        (l.Action.createSubmitForm = function (t) {
          return (
            f(arguments.length, 1, 'createSubmitForm', '(PDFNet.FileSpec)', [[t, 'Object', l.FileSpec, 'FileSpec']]),
            l.sendWithPromise('actionCreateSubmitForm', { url: t.id }).then(function (t) {
              return _(l.Action, t);
            })
          );
        }),
          (l.Action.createLaunch = function (t, e) {
            return (
              f(arguments.length, 2, 'createLaunch', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('actionCreateLaunch', {
                  sdfdoc: t.id,
                  path: e,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.createHideField = function (t, e) {
            return (
              f(arguments.length, 2, 'createHideField', '(PDFNet.SDFDoc, Array<string>)', [
                [t, 'SDFDoc'],
                [e, 'Array'],
              ]),
              l
                .sendWithPromise('actionCreateHideField', {
                  sdfdoc: t.id,
                  field_names_list: e,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.createImportData = function (t, e) {
            return (
              f(arguments.length, 2, 'createImportData', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('actionCreateImportData', {
                  sdfdoc: t.id,
                  path: e,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.createResetForm = function (t) {
            return (
              f(arguments.length, 1, 'createResetForm', '(PDFNet.SDFDoc)', [[t, 'SDFDoc']]),
              l.sendWithPromise('actionCreateResetForm', { sdfdoc: t.id }).then(function (t) {
                return _(l.Action, t);
              })
            );
          }),
          (l.Action.createJavaScript = function (t, e) {
            return (
              f(arguments.length, 2, 'createJavaScript', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('actionCreateJavaScript', {
                  sdfdoc: t.id,
                  script: e,
                })
                .then(function (t) {
                  return _(l.Action, t);
                })
            );
          }),
          (l.Action.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('actionCreate', { in_obj: t.id }).then(function (t) {
                return _(l.Action, t);
              })
            );
          }),
          (l.Action.prototype.copy = function () {
            return l.sendWithPromise('Action.copy', { in_action: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.Action.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('Action.compare', {
                action: this.id,
                in_action: t.id,
              })
            );
          }),
          (l.Action.prototype.isValid = function () {
            return l.sendWithPromise('Action.isValid', { action: this.id });
          }),
          (l.Action.prototype.getXFDF = function () {
            return l.sendWithPromise('Action.getXFDF', { action: this.id });
          }),
          (l.Action.prototype.getType = function () {
            return l.sendWithPromise('Action.getType', { action: this.id });
          }),
          (l.Action.prototype.getDest = function () {
            return l.sendWithPromise('Action.getDest', { action: this.id }).then(function (t) {
              return _(l.Destination, t);
            });
          }),
          (l.Action.prototype.getNext = function () {
            return l.sendWithPromise('Action.getNext', { action: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Action.prototype.getSDFObj = function () {
            return l.sendWithPromise('Action.getSDFObj', { action: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Action.prototype.getFormActionFlag = function (t) {
            return (
              f(arguments.length, 1, 'getFormActionFlag', '(number)', [[t, 'number']]),
              l.sendWithPromise('Action.getFormActionFlag', {
                action: this.id,
                flag: t,
              })
            );
          }),
          (l.Action.prototype.setFormActionFlag = function (t, e) {
            return (
              f(arguments.length, 2, 'setFormActionFlag', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('Action.setFormActionFlag', {
                action: this.id,
                flag: t,
                value: e,
              })
            );
          }),
          (l.Action.prototype.needsWriteLock = function () {
            return l.sendWithPromise('Action.needsWriteLock', {
              action: this.id,
            });
          }),
          (l.Action.prototype.execute = function () {
            return l.sendWithPromise('Action.execute', { action: this.id });
          }),
          (l.Action.prototype.executeKeyStrokeAction = function (t) {
            return (
              f(arguments.length, 1, 'executeKeyStrokeAction', '(PDFNet.KeyStrokeEventData)', [[t, 'Object', l.KeyStrokeEventData, 'KeyStrokeEventData']]),
              l
                .sendWithPromise('Action.executeKeyStrokeAction', {
                  action: this.id,
                  data: t.id,
                })
                .then(function (t) {
                  return D(l.KeyStrokeActionResult, t);
                })
            );
          }),
          (l.KeyStrokeActionResult.prototype.isValid = function () {
            return l.sendWithPromise('KeyStrokeActionResult.isValid', {
              action_ret: this.id,
            });
          }),
          (l.KeyStrokeActionResult.prototype.getText = function () {
            return l.sendWithPromise('KeyStrokeActionResult.getText', {
              action_ret: this.id,
            });
          }),
          (l.KeyStrokeActionResult.prototype.copy = function () {
            return l
              .sendWithPromise('KeyStrokeActionResult.copy', {
                action_ret: this.id,
              })
              .then(function (t) {
                return D(l.KeyStrokeActionResult, t);
              });
          }),
          (l.KeyStrokeEventData.create = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'create', '(string, string, string, number, number)', [
                [t, 'string'],
                [e, 'string'],
                [n, 'string'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l
                .sendWithPromise('keyStrokeEventDataCreate', {
                  field_name: t,
                  current: e,
                  change: n,
                  selection_start: i,
                  selection_end: r,
                })
                .then(function (t) {
                  return D(l.KeyStrokeEventData, t);
                })
            );
          }),
          (l.KeyStrokeEventData.prototype.copy = function () {
            return l.sendWithPromise('KeyStrokeEventData.copy', { data: this.id }).then(function (t) {
              return D(l.KeyStrokeEventData, t);
            });
          }),
          (l.Page.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('pageCreate', { page_dict: t.id }).then(function (t) {
                return _(l.Page, t);
              })
            );
          }),
          (l.Page.prototype.copy = function () {
            return l.sendWithPromise('Page.copy', { p: this.id }).then(function (t) {
              return _(l.Page, t);
            });
          }),
          (l.Page.prototype.isValid = function () {
            return l.sendWithPromise('Page.isValid', { page: this.id });
          }),
          (l.Page.prototype.getIndex = function () {
            return l.sendWithPromise('Page.getIndex', { page: this.id });
          }),
          (l.Page.prototype.getTriggerAction = function (t) {
            return (
              f(arguments.length, 1, 'getTriggerAction', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('Page.getTriggerAction', {
                  page: this.id,
                  trigger: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Page.prototype.getBox = function (t) {
            return (
              f(arguments.length, 1, 'getBox', '(number)', [[t, 'number']]),
              l.sendWithPromise('Page.getBox', { page: this.id, type: t }).then(function (t) {
                return new l.Rect(t);
              })
            );
          }),
          (l.Page.prototype.setBox = function (t, e) {
            return (
              f(arguments.length, 2, 'setBox', '(number, PDFNet.Rect)', [
                [t, 'number'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('setBox', [[e, 1]]),
              l.sendWithPromise('Page.setBox', {
                page: this.id,
                type: t,
                box: e,
              })
            );
          }),
          (l.Page.prototype.getCropBox = function () {
            return l.sendWithPromise('Page.getCropBox', { page: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Page.prototype.setCropBox = function (t) {
            return (
              f(arguments.length, 1, 'setCropBox', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setCropBox', [[t, 0]]),
              l.sendWithPromise('Page.setCropBox', { page: this.id, box: t })
            );
          }),
          (l.Page.prototype.getMediaBox = function () {
            return l.sendWithPromise('Page.getMediaBox', { page: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Page.prototype.setMediaBox = function (t) {
            return (
              f(arguments.length, 1, 'setMediaBox', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setMediaBox', [[t, 0]]),
              l.sendWithPromise('Page.setMediaBox', { page: this.id, box: t })
            );
          }),
          (l.Page.prototype.getVisibleContentBox = function () {
            return l.sendWithPromise('Page.getVisibleContentBox', { page: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Page.prototype.getRotation = function () {
            return l.sendWithPromise('Page.getRotation', { page: this.id });
          }),
          (l.Page.prototype.setRotation = function (t) {
            return f(arguments.length, 1, 'setRotation', '(number)', [[t, 'number']]), l.sendWithPromise('Page.setRotation', { page: this.id, angle: t });
          }),
          (l.Page.addRotations = function (t, e) {
            return (
              f(arguments.length, 2, 'addRotations', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('pageAddRotations', { r0: t, r1: e })
            );
          }),
          (l.Page.subtractRotations = function (t, e) {
            return (
              f(arguments.length, 2, 'subtractRotations', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('pageSubtractRotations', { r0: t, r1: e })
            );
          }),
          (l.Page.rotationToDegree = function (t) {
            return f(arguments.length, 1, 'rotationToDegree', '(number)', [[t, 'number']]), l.sendWithPromise('pageRotationToDegree', { r: t });
          }),
          (l.Page.degreeToRotation = function (t) {
            return f(arguments.length, 1, 'degreeToRotation', '(number)', [[t, 'number']]), l.sendWithPromise('pageDegreeToRotation', { r: t });
          }),
          (l.Page.prototype.getPageWidth = function (t) {
            return (
              void 0 === t && (t = l.Page.Box.e_crop),
              f(arguments.length, 0, 'getPageWidth', '(number)', [[t, 'number']]),
              l.sendWithPromise('Page.getPageWidth', {
                page: this.id,
                box_type: t,
              })
            );
          }),
          (l.Page.prototype.getPageHeight = function (t) {
            return (
              void 0 === t && (t = l.Page.Box.e_crop),
              f(arguments.length, 0, 'getPageHeight', '(number)', [[t, 'number']]),
              l.sendWithPromise('Page.getPageHeight', {
                page: this.id,
                box_type: t,
              })
            );
          }),
          (l.Page.prototype.getDefaultMatrix = function (t, e, n) {
            return (
              void 0 === t && (t = !1),
              void 0 === e && (e = l.Page.Box.e_crop),
              void 0 === n && (n = l.Page.Rotate.e_0),
              f(arguments.length, 0, 'getDefaultMatrix', '(boolean, number, number)', [
                [t, 'boolean'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('Page.getDefaultMatrix', {
                  page: this.id,
                  flip_y: t,
                  box_type: e,
                  angle: n,
                })
                .then(function (t) {
                  return new l.Matrix2D(t);
                })
            );
          }),
          (l.Page.prototype.getAnnots = function () {
            return l.sendWithPromise('Page.getAnnots', { page: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Page.prototype.getNumAnnots = function () {
            return l.sendWithPromise('Page.getNumAnnots', { page: this.id });
          }),
          (l.Page.prototype.getAnnot = function (t) {
            return (
              f(arguments.length, 1, 'getAnnot', '(number)', [[t, 'number']]),
              l.sendWithPromise('Page.getAnnot', { page: this.id, index: t }).then(function (t) {
                return _(l.Annot, t);
              })
            );
          }),
          (l.Page.prototype.annotInsert = function (t, e) {
            return (
              f(arguments.length, 2, 'annotInsert', '(number, PDFNet.Annot)', [
                [t, 'number'],
                [e, 'Object', l.Annot, 'Annot'],
              ]),
              l.sendWithPromise('Page.annotInsert', {
                page: this.id,
                pos: t,
                annot: e.id,
              })
            );
          }),
          (l.Page.prototype.annotPushBack = function (t) {
            return (
              f(arguments.length, 1, 'annotPushBack', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('Page.annotPushBack', {
                page: this.id,
                annot: t.id,
              })
            );
          }),
          (l.Page.prototype.annotPushFront = function (t) {
            return (
              f(arguments.length, 1, 'annotPushFront', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('Page.annotPushFront', {
                page: this.id,
                annot: t.id,
              })
            );
          }),
          (l.Page.prototype.annotRemove = function (t) {
            return (
              f(arguments.length, 1, 'annotRemove', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('Page.annotRemove', {
                page: this.id,
                annot: t.id,
              })
            );
          }),
          (l.Page.prototype.annotRemoveByIndex = function (t) {
            return (
              f(arguments.length, 1, 'annotRemoveByIndex', '(number)', [[t, 'number']]),
              l.sendWithPromise('Page.annotRemoveByIndex', {
                page: this.id,
                index: t,
              })
            );
          }),
          (l.Page.prototype.scale = function (t) {
            return f(arguments.length, 1, 'scale', '(number)', [[t, 'number']]), l.sendWithPromise('Page.scale', { page: this.id, scale: t });
          }),
          (l.Page.prototype.flattenField = function (e) {
            return (
              f(arguments.length, 1, 'flattenField', '(PDFNet.Field)', [[e, 'Structure', l.Field, 'Field']]),
              F('flattenField', [[e, 0]]),
              (e.yieldFunction = 'Page.flattenField'),
              l
                .sendWithPromise('Page.flattenField', {
                  page: this.id,
                  field_to_flatten: e,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.Page.prototype.hasTransition = function () {
            return l.sendWithPromise('Page.hasTransition', { page: this.id });
          }),
          (l.Page.prototype.getUserUnitSize = function () {
            return l.sendWithPromise('Page.getUserUnitSize', { page: this.id });
          }),
          (l.Page.prototype.setUserUnitSize = function (t) {
            return (
              f(arguments.length, 1, 'setUserUnitSize', '(number)', [[t, 'number']]),
              l.sendWithPromise('Page.setUserUnitSize', {
                page: this.id,
                unit_size: t,
              })
            );
          }),
          (l.Page.prototype.getResourceDict = function () {
            return l.sendWithPromise('Page.getResourceDict', { page: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Page.prototype.getContents = function () {
            return l.sendWithPromise('Page.getContents', { page: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Page.prototype.getThumb = function () {
            return l.sendWithPromise('Page.getThumb', { page: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Page.prototype.getSDFObj = function () {
            return l.sendWithPromise('Page.getSDFObj', { page: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Page.prototype.findInheritedAttribute = function (t) {
            return (
              f(arguments.length, 1, 'findInheritedAttribute', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('Page.findInheritedAttribute', {
                  page: this.id,
                  attrib: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Annot.create = function (t, e, n) {
            return (
              f(arguments.length, 3, 'create', '(PDFNet.SDFDoc, number, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'number'],
                [n, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[n, 2]]),
              l.sendWithPromise('annotCreate', { doc: t.id, type: e, pos: n }).then(function (t) {
                return _(l.Annot, t);
              })
            );
          }),
          (l.Annot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('annotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.Annot, t);
              })
            );
          }),
          (l.Annot.prototype.copy = function () {
            return l.sendWithPromise('Annot.copy', { d: this.id }).then(function (t) {
              return _(l.Annot, t);
            });
          }),
          (l.Annot.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('Annot.compare', { annot: this.id, d: t.id })
            );
          }),
          (l.Annot.prototype.isValid = function () {
            return l.sendWithPromise('Annot.isValid', { annot: this.id });
          }),
          (l.Annot.prototype.getSDFObj = function () {
            return l.sendWithPromise('Annot.getSDFObj', { annot: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Annot.prototype.getType = function () {
            return l.sendWithPromise('Annot.getType', { annot: this.id });
          }),
          (l.Annot.prototype.isMarkup = function () {
            return l.sendWithPromise('Annot.isMarkup', { annot: this.id });
          }),
          (l.Annot.prototype.getRect = function () {
            return l.sendWithPromise('Annot.getRect', { annot: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Annot.prototype.getVisibleContentBox = function () {
            return l.sendWithPromise('Annot.getVisibleContentBox', { annot: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Annot.prototype.setRect = function (t) {
            return (
              f(arguments.length, 1, 'setRect', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setRect', [[t, 0]]),
              l.sendWithPromise('Annot.setRect', { annot: this.id, pos: t })
            );
          }),
          (l.Annot.prototype.resize = function (t) {
            return (
              f(arguments.length, 1, 'resize', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('resize', [[t, 0]]),
              l.sendWithPromise('Annot.resize', { annot: this.id, newrect: t })
            );
          }),
          (l.Annot.prototype.setContents = function (t) {
            return (
              f(arguments.length, 1, 'setContents', '(string)', [[t, 'string']]),
              l.sendWithPromise('Annot.setContents', {
                annot: this.id,
                contents: t,
              })
            );
          }),
          (l.Annot.prototype.getContents = function () {
            return l.sendWithPromise('Annot.getContents', { annot: this.id });
          }),
          (l.Annot.prototype.getTriggerAction = function (t) {
            return (
              f(arguments.length, 1, 'getTriggerAction', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('Annot.getTriggerAction', {
                  annot: this.id,
                  trigger: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Annot.prototype.getCustomData = function (t) {
            return (
              f(arguments.length, 1, 'getCustomData', '(string)', [[t, 'string']]),
              l.sendWithPromise('Annot.getCustomData', {
                annot: this.id,
                key: t,
              })
            );
          }),
          (l.Annot.prototype.setCustomData = function (t, e) {
            return (
              f(arguments.length, 2, 'setCustomData', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('Annot.setCustomData', {
                annot: this.id,
                key: t,
                value: e,
              })
            );
          }),
          (l.Annot.prototype.deleteCustomData = function (t) {
            return (
              f(arguments.length, 1, 'deleteCustomData', '(string)', [[t, 'string']]),
              l.sendWithPromise('Annot.deleteCustomData', {
                annot: this.id,
                key: t,
              })
            );
          }),
          (l.Annot.prototype.getPage = function () {
            return l.sendWithPromise('Annot.getPage', { annot: this.id }).then(function (t) {
              return _(l.Page, t);
            });
          }),
          (l.Annot.prototype.setPage = function (t) {
            return (
              f(arguments.length, 1, 'setPage', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('Annot.setPage', { annot: this.id, page: t.id })
            );
          }),
          (l.Annot.prototype.getUniqueID = function () {
            return l.sendWithPromise('Annot.getUniqueID', { annot: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Annot.prototype.setUniqueID = function (t) {
            f(arguments.length, 1, 'setUniqueID', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('Annot.setUniqueID', {
              annot: this.id,
              id_buf: e,
            });
          }),
          (l.Annot.prototype.getDate = function () {
            return l.sendWithPromise('Annot.getDate', { annot: this.id }).then(function (t) {
              return new l.Date(t);
            });
          }),
          (l.Annot.prototype.setDate = function (t) {
            return (
              f(arguments.length, 1, 'setDate', '(PDFNet.Date)', [[t, 'Structure', l.Date, 'Date']]),
              F('setDate', [[t, 0]]),
              l.sendWithPromise('Annot.setDate', { annot: this.id, date: t })
            );
          }),
          (l.Annot.prototype.getFlag = function (t) {
            return f(arguments.length, 1, 'getFlag', '(number)', [[t, 'number']]), l.sendWithPromise('Annot.getFlag', { annot: this.id, flag: t });
          }),
          (l.Annot.prototype.setFlag = function (t, e) {
            return (
              f(arguments.length, 2, 'setFlag', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('Annot.setFlag', {
                annot: this.id,
                flag: t,
                value: e,
              })
            );
          }),
          (l.AnnotBorderStyle.create = function (t, e, n, i) {
            return (
              void 0 === n && (n = 0),
              void 0 === i && (i = 0),
              f(arguments.length, 2, 'create', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l
                .sendWithPromise('annotBorderStyleCreate', {
                  s: t,
                  b_width: e,
                  b_hr: n,
                  b_vr: i,
                })
                .then(function (t) {
                  return D(l.AnnotBorderStyle, t);
                })
            );
          }),
          (l.AnnotBorderStyle.createWithDashPattern = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'createWithDashPattern', '(number, number, number, number, Array<number>)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'Array'],
              ]),
              l
                .sendWithPromise('annotBorderStyleCreateWithDashPattern', {
                  s: t,
                  b_width: e,
                  b_hr: n,
                  b_vr: i,
                  b_dash_list: r,
                })
                .then(function (t) {
                  return D(l.AnnotBorderStyle, t);
                })
            );
          }),
          (l.AnnotBorderStyle.prototype.copy = function () {
            return l.sendWithPromise('AnnotBorderStyle.copy', { bs: this.id }).then(function (t) {
              return D(l.AnnotBorderStyle, t);
            });
          }),
          (l.AnnotBorderStyle.prototype.getStyle = function () {
            return l.sendWithPromise('AnnotBorderStyle.getStyle', {
              bs: this.id,
            });
          }),
          (l.AnnotBorderStyle.prototype.setStyle = function (t) {
            return (
              f(arguments.length, 1, 'setStyle', '(number)', [[t, 'number']]),
              l.sendWithPromise('AnnotBorderStyle.setStyle', {
                bs: this.id,
                style: t,
              })
            );
          }),
          (l.Annot.prototype.getAppearance = function (t, e) {
            return (
              void 0 === t && (t = l.Annot.State.e_normal),
              void 0 === e && (e = null),
              f(arguments.length, 0, 'getAppearance', '(number, string)', [
                [t, 'number'],
                [e, 'const char* = 0'],
              ]),
              l
                .sendWithPromise('Annot.getAppearance', {
                  annot: this.id,
                  annot_state: t,
                  app_state: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Annot.prototype.setAppearance = function (t, e, n) {
            return (
              void 0 === e && (e = l.Annot.State.e_normal),
              void 0 === n && (n = null),
              f(arguments.length, 1, 'setAppearance', '(PDFNet.Obj, number, string)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'number'],
                [n, 'const char* = 0'],
              ]),
              l.sendWithPromise('Annot.setAppearance', {
                annot: this.id,
                app_stream: t.id,
                annot_state: e,
                app_state: n,
              })
            );
          }),
          (l.Annot.prototype.removeAppearance = function (t, e) {
            return (
              void 0 === t && (t = l.Annot.State.e_normal),
              void 0 === e && (e = null),
              f(arguments.length, 0, 'removeAppearance', '(number, string)', [
                [t, 'number'],
                [e, 'const char* = 0'],
              ]),
              l.sendWithPromise('Annot.removeAppearance', {
                annot: this.id,
                annot_state: t,
                app_state: e,
              })
            );
          }),
          (l.Annot.prototype.flatten = function (t) {
            return (
              f(arguments.length, 1, 'flatten', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('Annot.flatten', { annot: this.id, page: t.id })
            );
          }),
          (l.Annot.prototype.getActiveAppearanceState = function () {
            return l.sendWithPromise('Annot.getActiveAppearanceState', {
              annot: this.id,
            });
          }),
          (l.Annot.prototype.setActiveAppearanceState = function (t) {
            return (
              f(arguments.length, 1, 'setActiveAppearanceState', '(string)', [[t, 'string']]),
              l.sendWithPromise('Annot.setActiveAppearanceState', {
                annot: this.id,
                astate: t,
              })
            );
          }),
          (l.Annot.prototype.getColor = function () {
            return l.sendWithPromise('Annot.getColor', { annot: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.Annot.prototype.getColorAsRGB = function () {
            return l.sendWithPromise('Annot.getColorAsRGB', { annot: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.Annot.prototype.getColorAsCMYK = function () {
            return l.sendWithPromise('Annot.getColorAsCMYK', { annot: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.Annot.prototype.getColorAsGray = function () {
            return l.sendWithPromise('Annot.getColorAsGray', { annot: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.Annot.prototype.getColorCompNum = function () {
            return l.sendWithPromise('Annot.getColorCompNum', {
              annot: this.id,
            });
          }),
          (l.Annot.prototype.setColorDefault = function (t) {
            return (
              f(arguments.length, 1, 'setColorDefault', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('Annot.setColorDefault', {
                annot: this.id,
                col: t.id,
              })
            );
          }),
          (l.Annot.prototype.setColor = function (t, e) {
            return (
              void 0 === e && (e = 3),
              f(arguments.length, 1, 'setColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Annot.setColor', {
                annot: this.id,
                col: t.id,
                numcomp: e,
              })
            );
          }),
          (l.Annot.prototype.getStructParent = function () {
            return l.sendWithPromise('Annot.getStructParent', {
              annot: this.id,
            });
          }),
          (l.Annot.prototype.setStructParent = function (t) {
            return (
              f(arguments.length, 1, 'setStructParent', '(number)', [[t, 'number']]),
              l.sendWithPromise('Annot.setStructParent', {
                annot: this.id,
                parkeyval: t,
              })
            );
          }),
          (l.Annot.prototype.getOptionalContent = function () {
            return l.sendWithPromise('Annot.getOptionalContent', { annot: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Annot.prototype.setOptionalContent = function (t) {
            return (
              f(arguments.length, 1, 'setOptionalContent', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('Annot.setOptionalContent', {
                annot: this.id,
                content: t.id,
              })
            );
          }),
          (l.Annot.prototype.refreshAppearance = function () {
            return l.sendWithPromise('Annot.refreshAppearance', {
              annot: this.id,
            });
          }),
          (l.Annot.prototype.refreshAppearanceRefreshOptions = function (t) {
            return (
              void 0 === t && (t = null),
              f(arguments.length, 0, 'refreshAppearanceRefreshOptions', '(PDFNet.OptionBase)', [[t, 'OptionBase']]),
              F('refreshAppearanceRefreshOptions', [[t, 0]]),
              (t = t ? t.getJsonString() : '{}'),
              l.sendWithPromise('Annot.refreshAppearanceRefreshOptions', {
                annot: this.id,
                options: t,
              })
            );
          }),
          (l.Annot.prototype.getRotation = function () {
            return l.sendWithPromise('Annot.getRotation', { annot: this.id });
          }),
          (l.Annot.prototype.setRotation = function (t) {
            return (
              f(arguments.length, 1, 'setRotation', '(number)', [[t, 'number']]),
              l.sendWithPromise('Annot.setRotation', {
                annot: this.id,
                angle: t,
              })
            );
          }),
          (l.AnnotBorderStyle.prototype.getWidth = function () {
            return l.sendWithPromise('AnnotBorderStyle.getWidth', {
              bs: this.id,
            });
          }),
          (l.AnnotBorderStyle.prototype.setWidth = function (t) {
            return (
              f(arguments.length, 1, 'setWidth', '(number)', [[t, 'number']]),
              l.sendWithPromise('AnnotBorderStyle.setWidth', {
                bs: this.id,
                width: t,
              })
            );
          }),
          (l.AnnotBorderStyle.prototype.getHR = function () {
            return l.sendWithPromise('AnnotBorderStyle.getHR', { bs: this.id });
          }),
          (l.AnnotBorderStyle.prototype.setHR = function (t) {
            return (
              f(arguments.length, 1, 'setHR', '(number)', [[t, 'number']]),
              l.sendWithPromise('AnnotBorderStyle.setHR', {
                bs: this.id,
                horizontal_radius: t,
              })
            );
          }),
          (l.AnnotBorderStyle.prototype.getVR = function () {
            return l.sendWithPromise('AnnotBorderStyle.getVR', { bs: this.id });
          }),
          (l.AnnotBorderStyle.prototype.setVR = function (t) {
            return (
              f(arguments.length, 1, 'setVR', '(number)', [[t, 'number']]),
              l.sendWithPromise('AnnotBorderStyle.setVR', {
                bs: this.id,
                vertical_radius: t,
              })
            );
          }),
          (l.AnnotBorderStyle.prototype.getDashPattern = function () {
            return l
              .sendWithPromise('AnnotBorderStyle.getDashPattern', {
                bs: this.id,
              })
              .then(function (t) {
                return new Float64Array(t);
              });
          }),
          (l.Annot.prototype.getBorderStyle = function () {
            return l.sendWithPromise('Annot.getBorderStyle', { annot: this.id }).then(function (t) {
              return D(l.AnnotBorderStyle, t);
            });
          }),
          (l.Annot.prototype.setBorderStyle = function (t, e) {
            return (
              void 0 === e && (e = !1),
              f(arguments.length, 1, 'setBorderStyle', '(PDFNet.AnnotBorderStyle, boolean)', [
                [t, 'Object', l.AnnotBorderStyle, 'AnnotBorderStyle'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('Annot.setBorderStyle', {
                annot: this.id,
                bs: t.id,
                oldStyleOnly: e,
              })
            );
          }),
          (l.Annot.getBorderStyleStyle = function (t) {
            return (
              f(arguments.length, 1, 'getBorderStyleStyle', '(PDFNet.AnnotBorderStyle)', [[t, 'Object', l.AnnotBorderStyle, 'AnnotBorderStyle']]),
              l.sendWithPromise('annotGetBorderStyleStyle', { bs: t.id })
            );
          }),
          (l.Annot.setBorderStyleStyle = function (t, e) {
            return (
              f(arguments.length, 2, 'setBorderStyleStyle', '(PDFNet.AnnotBorderStyle, number)', [
                [t, 'Object', l.AnnotBorderStyle, 'AnnotBorderStyle'],
                [e, 'number'],
              ]),
              l.sendWithPromise('annotSetBorderStyleStyle', {
                bs: t.id,
                bst: e,
              })
            );
          }),
          (l.AnnotBorderStyle.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.AnnotBorderStyle)', [[t, 'Object', l.AnnotBorderStyle, 'AnnotBorderStyle']]),
              l.sendWithPromise('AnnotBorderStyle.compare', {
                a: this.id,
                b: t.id,
              })
            );
          }),
          (l.CaretAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('caretAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.CaretAnnot, t);
              })
            );
          }),
          (l.CaretAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('caretAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.CaretAnnot, t);
              })
            );
          }),
          (l.CaretAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('caretAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.CaretAnnot, t);
              })
            );
          }),
          (l.CaretAnnot.prototype.getSymbol = function () {
            return l.sendWithPromise('CaretAnnot.getSymbol', {
              caret: this.id,
            });
          }),
          (l.CaretAnnot.prototype.setSymbol = function (t) {
            return (
              f(arguments.length, 1, 'setSymbol', '(string)', [[t, 'string']]),
              l.sendWithPromise('CaretAnnot.setSymbol', {
                caret: this.id,
                symbol: t,
              })
            );
          }),
          (l.LineAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('lineAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.LineAnnot, t);
              })
            );
          }),
          (l.LineAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('lineAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.LineAnnot, t);
              })
            );
          }),
          (l.LineAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('lineAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.LineAnnot, t);
              })
            );
          }),
          (l.LineAnnot.prototype.getStartPoint = function () {
            return l.sendWithPromise('LineAnnot.getStartPoint', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setStartPoint = function (t) {
            return (
              f(arguments.length, 1, 'setStartPoint', '(PDFNet.Point)', [[t, 'Structure', l.Point, 'Point']]),
              F('setStartPoint', [[t, 0]]),
              l.sendWithPromise('LineAnnot.setStartPoint', {
                line: this.id,
                sp: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getEndPoint = function () {
            return l.sendWithPromise('LineAnnot.getEndPoint', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setEndPoint = function (t) {
            return (
              f(arguments.length, 1, 'setEndPoint', '(PDFNet.Point)', [[t, 'Structure', l.Point, 'Point']]),
              F('setEndPoint', [[t, 0]]),
              l.sendWithPromise('LineAnnot.setEndPoint', {
                line: this.id,
                ep: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getStartStyle = function () {
            return l.sendWithPromise('LineAnnot.getStartStyle', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setStartStyle = function (t) {
            return (
              f(arguments.length, 1, 'setStartStyle', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setStartStyle', {
                line: this.id,
                ss: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getEndStyle = function () {
            return l.sendWithPromise('LineAnnot.getEndStyle', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setEndStyle = function (t) {
            return (
              f(arguments.length, 1, 'setEndStyle', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setEndStyle', {
                line: this.id,
                es: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getLeaderLineLength = function () {
            return l.sendWithPromise('LineAnnot.getLeaderLineLength', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setLeaderLineLength = function (t) {
            return (
              f(arguments.length, 1, 'setLeaderLineLength', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setLeaderLineLength', {
                line: this.id,
                length: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getLeaderLineExtensionLength = function () {
            return l.sendWithPromise('LineAnnot.getLeaderLineExtensionLength', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setLeaderLineExtensionLength = function (t) {
            return (
              f(arguments.length, 1, 'setLeaderLineExtensionLength', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setLeaderLineExtensionLength', {
                line: this.id,
                length: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getShowCaption = function () {
            return l.sendWithPromise('LineAnnot.getShowCaption', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setShowCaption = function (t) {
            return (
              f(arguments.length, 1, 'setShowCaption', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('LineAnnot.setShowCaption', {
                line: this.id,
                showCaption: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getIntentType = function () {
            return l.sendWithPromise('LineAnnot.getIntentType', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setIntentType = function (t) {
            return (
              f(arguments.length, 1, 'setIntentType', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setIntentType', {
                line: this.id,
                it: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getCapPos = function () {
            return l.sendWithPromise('LineAnnot.getCapPos', { line: this.id });
          }),
          (l.LineAnnot.prototype.setCapPos = function (t) {
            return f(arguments.length, 1, 'setCapPos', '(number)', [[t, 'number']]), l.sendWithPromise('LineAnnot.setCapPos', { line: this.id, it: t });
          }),
          (l.LineAnnot.prototype.getLeaderLineOffset = function () {
            return l.sendWithPromise('LineAnnot.getLeaderLineOffset', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setLeaderLineOffset = function (t) {
            return (
              f(arguments.length, 1, 'setLeaderLineOffset', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setLeaderLineOffset', {
                line: this.id,
                length: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getTextHOffset = function () {
            return l.sendWithPromise('LineAnnot.getTextHOffset', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setTextHOffset = function (t) {
            return (
              f(arguments.length, 1, 'setTextHOffset', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setTextHOffset', {
                line: this.id,
                offset: t,
              })
            );
          }),
          (l.LineAnnot.prototype.getTextVOffset = function () {
            return l.sendWithPromise('LineAnnot.getTextVOffset', {
              line: this.id,
            });
          }),
          (l.LineAnnot.prototype.setTextVOffset = function (t) {
            return (
              f(arguments.length, 1, 'setTextVOffset', '(number)', [[t, 'number']]),
              l.sendWithPromise('LineAnnot.setTextVOffset', {
                line: this.id,
                offset: t,
              })
            );
          }),
          (l.CircleAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('circleAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.CircleAnnot, t);
              })
            );
          }),
          (l.CircleAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('circleAnnotCreateFromAnnot', { circle: t.id }).then(function (t) {
                return _(l.CircleAnnot, t);
              })
            );
          }),
          (l.CircleAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('circleAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.CircleAnnot, t);
              })
            );
          }),
          (l.CircleAnnot.prototype.getInteriorColor = function () {
            return l
              .sendWithPromise('CircleAnnot.getInteriorColor', {
                circle: this.id,
              })
              .then(function (t) {
                return D(l.ColorPt, t);
              });
          }),
          (l.CircleAnnot.prototype.getInteriorColorCompNum = function () {
            return l.sendWithPromise('CircleAnnot.getInteriorColorCompNum', {
              circle: this.id,
            });
          }),
          (l.CircleAnnot.prototype.setInteriorColorDefault = function (t) {
            return (
              f(arguments.length, 1, 'setInteriorColorDefault', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('CircleAnnot.setInteriorColorDefault', {
                circle: this.id,
                col: t.id,
              })
            );
          }),
          (l.CircleAnnot.prototype.setInteriorColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setInteriorColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('CircleAnnot.setInteriorColor', {
                circle: this.id,
                col: t.id,
                numcomp: e,
              })
            );
          }),
          (l.CircleAnnot.prototype.getContentRect = function () {
            return l
              .sendWithPromise('CircleAnnot.getContentRect', {
                circle: this.id,
              })
              .then(function (t) {
                return new l.Rect(t);
              });
          }),
          (l.CircleAnnot.prototype.setContentRect = function (t) {
            return (
              f(arguments.length, 1, 'setContentRect', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setContentRect', [[t, 0]]),
              l.sendWithPromise('CircleAnnot.setContentRect', {
                circle: this.id,
                cr: t,
              })
            );
          }),
          (l.CircleAnnot.prototype.getPadding = function () {
            return l.sendWithPromise('CircleAnnot.getPadding', { circle: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.CircleAnnot.prototype.setPadding = function (t) {
            return (
              f(arguments.length, 1, 'setPadding', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setPadding', [[t, 0]]),
              l.sendWithPromise('CircleAnnot.setPadding', {
                circle: this.id,
                cr: t,
              })
            );
          }),
          (l.FileAttachmentAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l
                .sendWithPromise('fileAttachmentAnnotCreateFromObj', {
                  d: t.id,
                })
                .then(function (t) {
                  return _(l.FileAttachmentAnnot, t);
                })
            );
          }),
          (l.FileAttachmentAnnot.prototype.export = function (t) {
            return (
              void 0 === t && (t = ''),
              f(arguments.length, 0, 'export', '(string)', [[t, 'string']]),
              l.sendWithPromise('FileAttachmentAnnot.export', {
                fileatt: this.id,
                save_as: t,
              })
            );
          }),
          (l.FileAttachmentAnnot.prototype.createFromAnnot = function () {
            return l
              .sendWithPromise('FileAttachmentAnnot.createFromAnnot', {
                fileatt: this.id,
              })
              .then(function (t) {
                return _(l.Annot, t);
              });
          }),
          (l.FileAttachmentAnnot.createWithFileSpec = function (t, e, n, i) {
            return (
              void 0 === i && (i = l.FileAttachmentAnnot.Icon.e_PushPin),
              f(arguments.length, 3, 'createWithFileSpec', '(PDFNet.SDFDoc, PDFNet.Rect, PDFNet.FileSpec, number)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Object', l.FileSpec, 'FileSpec'],
                [i, 'number'],
              ]),
              F('createWithFileSpec', [[e, 1]]),
              l
                .sendWithPromise('fileAttachmentAnnotCreateWithFileSpec', {
                  doc: t.id,
                  pos: e,
                  fs: n.id,
                  icon_name: i,
                })
                .then(function (t) {
                  return _(l.FileAttachmentAnnot, t);
                })
            );
          }),
          (l.FileAttachmentAnnot.createDefault = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createDefault', '(PDFNet.SDFDoc, PDFNet.Rect, string)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('createDefault', [[e, 1]]),
              l
                .sendWithPromise('fileAttachmentAnnotCreateDefault', {
                  doc: t.id,
                  pos: e,
                  path: n,
                })
                .then(function (t) {
                  return _(l.FileAttachmentAnnot, t);
                })
            );
          }),
          (l.FileAttachmentAnnot.prototype.getFileSpec = function () {
            return l
              .sendWithPromise('FileAttachmentAnnot.getFileSpec', {
                fileatt: this.id,
              })
              .then(function (t) {
                return _(l.FileSpec, t);
              });
          }),
          (l.FileAttachmentAnnot.prototype.setFileSpec = function (t) {
            return (
              f(arguments.length, 1, 'setFileSpec', '(PDFNet.FileSpec)', [[t, 'Object', l.FileSpec, 'FileSpec']]),
              l.sendWithPromise('FileAttachmentAnnot.setFileSpec', {
                fileatt: this.id,
                file: t.id,
              })
            );
          }),
          (l.FileAttachmentAnnot.prototype.getIcon = function () {
            return l.sendWithPromise('FileAttachmentAnnot.getIcon', {
              fileatt: this.id,
            });
          }),
          (l.FileAttachmentAnnot.prototype.setIcon = function (t) {
            return (
              void 0 === t && (t = l.FileAttachmentAnnot.Icon.e_PushPin),
              f(arguments.length, 0, 'setIcon', '(number)', [[t, 'number']]),
              l.sendWithPromise('FileAttachmentAnnot.setIcon', {
                fileatt: this.id,
                type: t,
              })
            );
          }),
          (l.FileAttachmentAnnot.prototype.getIconName = function () {
            return l.sendWithPromise('FileAttachmentAnnot.getIconName', {
              fileatt: this.id,
            });
          }),
          (l.FileAttachmentAnnot.prototype.setIconName = function (t) {
            return (
              f(arguments.length, 1, 'setIconName', '(string)', [[t, 'string']]),
              l.sendWithPromise('FileAttachmentAnnot.setIconName', {
                fileatt: this.id,
                iname: t,
              })
            );
          }),
          (l.FreeTextAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('freeTextAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.FreeTextAnnot, t);
              })
            );
          }),
          (l.FreeTextAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('freeTextAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.FreeTextAnnot, t);
              })
            );
          }),
          (l.FreeTextAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('freeTextAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.FreeTextAnnot, t);
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getDefaultAppearance = function () {
            return l.sendWithPromise('FreeTextAnnot.getDefaultAppearance', {
              ft: this.id,
            });
          }),
          (l.FreeTextAnnot.prototype.setDefaultAppearance = function (t) {
            return (
              f(arguments.length, 1, 'setDefaultAppearance', '(string)', [[t, 'string']]),
              l.sendWithPromise('FreeTextAnnot.setDefaultAppearance', {
                ft: this.id,
                app_str: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getQuaddingFormat = function () {
            return l.sendWithPromise('FreeTextAnnot.getQuaddingFormat', {
              ft: this.id,
            });
          }),
          (l.FreeTextAnnot.prototype.setQuaddingFormat = function (t) {
            return (
              f(arguments.length, 1, 'setQuaddingFormat', '(number)', [[t, 'number']]),
              l.sendWithPromise('FreeTextAnnot.setQuaddingFormat', {
                ft: this.id,
                format: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getCalloutLinePoints = function () {
            return l.sendWithPromise('FreeTextAnnot.getCalloutLinePoints', {
              ft: this.id,
            });
          }),
          (l.FreeTextAnnot.prototype.setCalloutLinePoints = function (t, e, n) {
            return (
              f(arguments.length, 3, 'setCalloutLinePoints', '(PDFNet.Point, PDFNet.Point, PDFNet.Point)', [
                [t, 'Structure', l.Point, 'Point'],
                [e, 'Structure', l.Point, 'Point'],
                [n, 'Structure', l.Point, 'Point'],
              ]),
              F('setCalloutLinePoints', [
                [t, 0],
                [e, 1],
                [n, 2],
              ]),
              l.sendWithPromise('FreeTextAnnot.setCalloutLinePoints', {
                ft: this.id,
                p1: t,
                p2: e,
                p3: n,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.setCalloutLinePointsTwo = function (t, e) {
            return (
              f(arguments.length, 2, 'setCalloutLinePointsTwo', '(PDFNet.Point, PDFNet.Point)', [
                [t, 'Structure', l.Point, 'Point'],
                [e, 'Structure', l.Point, 'Point'],
              ]),
              F('setCalloutLinePointsTwo', [
                [t, 0],
                [e, 1],
              ]),
              l.sendWithPromise('FreeTextAnnot.setCalloutLinePointsTwo', {
                ft: this.id,
                p1: t,
                p2: e,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getIntentName = function () {
            return l.sendWithPromise('FreeTextAnnot.getIntentName', {
              ft: this.id,
            });
          }),
          (l.FreeTextAnnot.prototype.setIntentName = function (t) {
            return (
              void 0 === t && (t = l.FreeTextAnnot.IntentName.e_FreeText),
              f(arguments.length, 0, 'setIntentName', '(number)', [[t, 'number']]),
              l.sendWithPromise('FreeTextAnnot.setIntentName', {
                ft: this.id,
                mode: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.setIntentNameDefault = function () {
            return l.sendWithPromise('FreeTextAnnot.setIntentNameDefault', {
              ft: this.id,
            });
          }),
          (l.FreeTextAnnot.prototype.getEndingStyle = function () {
            return l.sendWithPromise('FreeTextAnnot.getEndingStyle', {
              ft: this.id,
            });
          }),
          (l.FreeTextAnnot.prototype.setEndingStyle = function (t) {
            return (
              f(arguments.length, 1, 'setEndingStyle', '(number)', [[t, 'number']]),
              l.sendWithPromise('FreeTextAnnot.setEndingStyle', {
                ft: this.id,
                style: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.setEndingStyleName = function (t) {
            return (
              f(arguments.length, 1, 'setEndingStyleName', '(string)', [[t, 'string']]),
              l.sendWithPromise('FreeTextAnnot.setEndingStyleName', {
                ft: this.id,
                est: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.setTextColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setTextColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('FreeTextAnnot.setTextColor', {
                ft: this.id,
                color: t.id,
                col_comp: e,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getTextColor = function () {
            return l.sendWithPromise('FreeTextAnnot.getTextColor', { ft: this.id }).then(function (t) {
              return (t.color = D(l.ColorPt, t.color)), t;
            });
          }),
          (l.FreeTextAnnot.prototype.setLineColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setLineColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('FreeTextAnnot.setLineColor', {
                ft: this.id,
                color: t.id,
                col_comp: e,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getLineColor = function () {
            return l.sendWithPromise('FreeTextAnnot.getLineColor', { ft: this.id }).then(function (t) {
              return (t.color = D(l.ColorPt, t.color)), t;
            });
          }),
          (l.FreeTextAnnot.prototype.setFontName = function (t) {
            return (
              f(arguments.length, 1, 'setFontName', '(string)', [[t, 'string']]),
              l.sendWithPromise('FreeTextAnnot.setFontName', {
                ft: this.id,
                fontName: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.setFontSize = function (t) {
            return (
              f(arguments.length, 1, 'setFontSize', '(number)', [[t, 'number']]),
              l.sendWithPromise('FreeTextAnnot.setFontSize', {
                ft: this.id,
                font_size: t,
              })
            );
          }),
          (l.FreeTextAnnot.prototype.getFontSize = function () {
            return l.sendWithPromise('FreeTextAnnot.getFontSize', {
              ft: this.id,
            });
          }),
          (l.HighlightAnnot.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('highlightAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.HighlightAnnot, t);
              })
            );
          }),
          (l.HighlightAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('highlightAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.HighlightAnnot, t);
              })
            );
          }),
          (l.HighlightAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('highlightAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.HighlightAnnot, t);
              })
            );
          }),
          (l.InkAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('inkAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.InkAnnot, t);
              })
            );
          }),
          (l.InkAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('inkAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.InkAnnot, t);
              })
            );
          }),
          (l.InkAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('inkAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.InkAnnot, t);
              })
            );
          }),
          (l.InkAnnot.prototype.getPathCount = function () {
            return l.sendWithPromise('InkAnnot.getPathCount', { ink: this.id });
          }),
          (l.InkAnnot.prototype.getPointCount = function (t) {
            return (
              f(arguments.length, 1, 'getPointCount', '(number)', [[t, 'number']]),
              l.sendWithPromise('InkAnnot.getPointCount', {
                ink: this.id,
                pathindex: t,
              })
            );
          }),
          (l.InkAnnot.prototype.getPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'getPoint', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('InkAnnot.getPoint', {
                ink: this.id,
                pathindex: t,
                pointindex: e,
              })
            );
          }),
          (l.InkAnnot.prototype.setPoint = function (t, e, n) {
            return (
              f(arguments.length, 3, 'setPoint', '(number, number, PDFNet.Point)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'Structure', l.Point, 'Point'],
              ]),
              F('setPoint', [[n, 2]]),
              l.sendWithPromise('InkAnnot.setPoint', {
                ink: this.id,
                pathindex: t,
                pointindex: e,
                pt: n,
              })
            );
          }),
          (l.InkAnnot.prototype.erase = function (t, e, n) {
            return (
              f(arguments.length, 3, 'erase', '(PDFNet.Point, PDFNet.Point, number)', [
                [t, 'Structure', l.Point, 'Point'],
                [e, 'Structure', l.Point, 'Point'],
                [n, 'number'],
              ]),
              F('erase', [
                [t, 0],
                [e, 1],
              ]),
              l.sendWithPromise('InkAnnot.erase', {
                ink: this.id,
                pt1: t,
                pt2: e,
                width: n,
              })
            );
          }),
          (l.InkAnnot.prototype.getHighlightIntent = function () {
            return l.sendWithPromise('InkAnnot.getHighlightIntent', {
              ink: this.id,
            });
          }),
          (l.InkAnnot.prototype.setHighlightIntent = function (t) {
            return (
              f(arguments.length, 1, 'setHighlightIntent', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('InkAnnot.setHighlightIntent', {
                ink: this.id,
                highlight: t,
              })
            );
          }),
          (l.LinkAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('linkAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.LinkAnnot, t);
              })
            );
          }),
          (l.LinkAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('linkAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.LinkAnnot, t);
              })
            );
          }),
          (l.LinkAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('linkAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.LinkAnnot, t);
              })
            );
          }),
          (l.LinkAnnot.prototype.removeAction = function () {
            return l.sendWithPromise('LinkAnnot.removeAction', {
              link: this.id,
            });
          }),
          (l.LinkAnnot.prototype.getAction = function () {
            return l.sendWithPromise('LinkAnnot.getAction', { link: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.LinkAnnot.prototype.setAction = function (t) {
            return (
              f(arguments.length, 1, 'setAction', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('LinkAnnot.setAction', {
                link: this.id,
                action: t.id,
              })
            );
          }),
          (l.LinkAnnot.prototype.getHighlightingMode = function () {
            return l.sendWithPromise('LinkAnnot.getHighlightingMode', {
              link: this.id,
            });
          }),
          (l.LinkAnnot.prototype.setHighlightingMode = function (t) {
            return (
              f(arguments.length, 1, 'setHighlightingMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('LinkAnnot.setHighlightingMode', {
                link: this.id,
                value: t,
              })
            );
          }),
          (l.LinkAnnot.prototype.getQuadPointCount = function () {
            return l.sendWithPromise('LinkAnnot.getQuadPointCount', {
              link: this.id,
            });
          }),
          (l.LinkAnnot.prototype.getQuadPoint = function (t) {
            return (
              f(arguments.length, 1, 'getQuadPoint', '(number)', [[t, 'number']]),
              l.sendWithPromise('LinkAnnot.getQuadPoint', {
                link: this.id,
                idx: t,
              })
            );
          }),
          (l.LinkAnnot.prototype.setQuadPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'setQuadPoint', '(number, PDFNet.QuadPoint)', [
                [t, 'number'],
                [e, 'Structure', l.QuadPoint, 'QuadPoint'],
              ]),
              F('setQuadPoint', [[e, 1]]),
              l.sendWithPromise('LinkAnnot.setQuadPoint', {
                link: this.id,
                idx: t,
                qp: e,
              })
            );
          }),
          (l.getNormalizedUrl = function (t) {
            return f(arguments.length, 1, 'getNormalizedUrl', '(string)', [[t, 'string']]), l.sendWithPromise('getNormalizedUrl', { url: t });
          }),
          (l.MarkupAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('markupAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.MarkupAnnot, t);
              })
            );
          }),
          (l.MarkupAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('markupAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.MarkupAnnot, t);
              })
            );
          }),
          (l.MarkupAnnot.prototype.getTitle = function () {
            return l.sendWithPromise('MarkupAnnot.getTitle', {
              markup: this.id,
            });
          }),
          (l.MarkupAnnot.prototype.setTitle = function (t) {
            return (
              f(arguments.length, 1, 'setTitle', '(string)', [[t, 'string']]),
              l.sendWithPromise('MarkupAnnot.setTitle', {
                markup: this.id,
                title: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.setTitleUString = function (t) {
            return (
              f(arguments.length, 1, 'setTitleUString', '(string)', [[t, 'string']]),
              l.sendWithPromise('MarkupAnnot.setTitleUString', {
                markup: this.id,
                title: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getPopup = function () {
            return l.sendWithPromise('MarkupAnnot.getPopup', { markup: this.id }).then(function (t) {
              return _(l.Annot, t);
            });
          }),
          (l.MarkupAnnot.prototype.setPopup = function (t) {
            return (
              f(arguments.length, 1, 'setPopup', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('MarkupAnnot.setPopup', {
                markup: this.id,
                ppup: t.id,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getOpacity = function () {
            return l.sendWithPromise('MarkupAnnot.getOpacity', {
              markup: this.id,
            });
          }),
          (l.MarkupAnnot.prototype.setOpacity = function (t) {
            return (
              f(arguments.length, 1, 'setOpacity', '(number)', [[t, 'number']]),
              l.sendWithPromise('MarkupAnnot.setOpacity', {
                markup: this.id,
                op: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getSubject = function () {
            return l.sendWithPromise('MarkupAnnot.getSubject', {
              markup: this.id,
            });
          }),
          (l.MarkupAnnot.prototype.setSubject = function (t) {
            return (
              f(arguments.length, 1, 'setSubject', '(string)', [[t, 'string']]),
              l.sendWithPromise('MarkupAnnot.setSubject', {
                markup: this.id,
                contents: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getCreationDates = function () {
            return l
              .sendWithPromise('MarkupAnnot.getCreationDates', {
                markup: this.id,
              })
              .then(function (t) {
                return new l.Date(t);
              });
          }),
          (l.MarkupAnnot.prototype.getBorderEffect = function () {
            return l.sendWithPromise('MarkupAnnot.getBorderEffect', {
              markup: this.id,
            });
          }),
          (l.MarkupAnnot.prototype.setBorderEffect = function (t) {
            return (
              void 0 === t && (t = l.MarkupAnnot.BorderEffect.e_None),
              f(arguments.length, 0, 'setBorderEffect', '(number)', [[t, 'number']]),
              l.sendWithPromise('MarkupAnnot.setBorderEffect', {
                markup: this.id,
                effect: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getBorderEffectIntensity = function () {
            return l.sendWithPromise('MarkupAnnot.getBorderEffectIntensity', {
              markup: this.id,
            });
          }),
          (l.MarkupAnnot.prototype.setBorderEffectIntensity = function (t) {
            return (
              void 0 === t && (t = 0),
              f(arguments.length, 0, 'setBorderEffectIntensity', '(number)', [[t, 'number']]),
              l.sendWithPromise('MarkupAnnot.setBorderEffectIntensity', {
                markup: this.id,
                intensity: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.setCreationDates = function (t) {
            return (
              f(arguments.length, 1, 'setCreationDates', '(PDFNet.Date)', [[t, 'Structure', l.Date, 'Date']]),
              F('setCreationDates', [[t, 0]]),
              l.sendWithPromise('MarkupAnnot.setCreationDates', {
                markup: this.id,
                dt: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getInteriorColor = function () {
            return l
              .sendWithPromise('MarkupAnnot.getInteriorColor', {
                markup: this.id,
              })
              .then(function (t) {
                return D(l.ColorPt, t);
              });
          }),
          (l.MarkupAnnot.prototype.getInteriorColorCompNum = function () {
            return l.sendWithPromise('MarkupAnnot.getInteriorColorCompNum', {
              markup: this.id,
            });
          }),
          (l.MarkupAnnot.prototype.setInteriorColorRGB = function (t) {
            return (
              f(arguments.length, 1, 'setInteriorColorRGB', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('MarkupAnnot.setInteriorColorRGB', {
                markup: this.id,
                col: t.id,
              })
            );
          }),
          (l.MarkupAnnot.prototype.setInteriorColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setInteriorColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('MarkupAnnot.setInteriorColor', {
                markup: this.id,
                c: t.id,
                CompNum: e,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getContentRect = function () {
            return l
              .sendWithPromise('MarkupAnnot.getContentRect', {
                markup: this.id,
              })
              .then(function (t) {
                return new l.Rect(t);
              });
          }),
          (l.MarkupAnnot.prototype.setContentRect = function (t) {
            return (
              f(arguments.length, 1, 'setContentRect', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setContentRect', [[t, 0]]),
              l.sendWithPromise('MarkupAnnot.setContentRect', {
                markup: this.id,
                cr: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.getPadding = function () {
            return l.sendWithPromise('MarkupAnnot.getPadding', { markup: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.MarkupAnnot.prototype.setPadding = function (t) {
            return (
              f(arguments.length, 1, 'setPadding', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setPadding', [[t, 0]]),
              l.sendWithPromise('MarkupAnnot.setPadding', {
                markup: this.id,
                rd: t,
              })
            );
          }),
          (l.MarkupAnnot.prototype.rotateAppearance = function (t) {
            return (
              f(arguments.length, 1, 'rotateAppearance', '(number)', [[t, 'number']]),
              l.sendWithPromise('MarkupAnnot.rotateAppearance', {
                markup: this.id,
                angle: t,
              })
            );
          }),
          (l.MovieAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('movieAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.MovieAnnot, t);
              })
            );
          }),
          (l.MovieAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('movieAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.MovieAnnot, t);
              })
            );
          }),
          (l.MovieAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('movieAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.MovieAnnot, t);
              })
            );
          }),
          (l.MovieAnnot.prototype.getTitle = function () {
            return l.sendWithPromise('MovieAnnot.getTitle', { movie: this.id });
          }),
          (l.MovieAnnot.prototype.setTitle = function (t) {
            return (
              f(arguments.length, 1, 'setTitle', '(string)', [[t, 'string']]),
              l.sendWithPromise('MovieAnnot.setTitle', {
                movie: this.id,
                title: t,
              })
            );
          }),
          (l.MovieAnnot.prototype.isToBePlayed = function () {
            return l.sendWithPromise('MovieAnnot.isToBePlayed', {
              movie: this.id,
            });
          }),
          (l.MovieAnnot.prototype.setToBePlayed = function (t) {
            return (
              void 0 === t && (t = !0),
              f(arguments.length, 0, 'setToBePlayed', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('MovieAnnot.setToBePlayed', {
                movie: this.id,
                isplay: t,
              })
            );
          }),
          (l.PolyLineAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('polyLineAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.PolyLineAnnot, t);
              })
            );
          }),
          (l.PolyLineAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('polyLineAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.PolyLineAnnot, t);
              })
            );
          }),
          (l.PolyLineAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('polyLineAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.PolyLineAnnot, t);
              })
            );
          }),
          (l.PolyLineAnnot.prototype.getVertexCount = function () {
            return l.sendWithPromise('PolyLineAnnot.getVertexCount', {
              polyline: this.id,
            });
          }),
          (l.PolyLineAnnot.prototype.getVertex = function (t) {
            return (
              f(arguments.length, 1, 'getVertex', '(number)', [[t, 'number']]),
              l.sendWithPromise('PolyLineAnnot.getVertex', {
                polyline: this.id,
                idx: t,
              })
            );
          }),
          (l.PolyLineAnnot.prototype.setVertex = function (t, e) {
            return (
              f(arguments.length, 2, 'setVertex', '(number, PDFNet.Point)', [
                [t, 'number'],
                [e, 'Structure', l.Point, 'Point'],
              ]),
              F('setVertex', [[e, 1]]),
              l.sendWithPromise('PolyLineAnnot.setVertex', {
                polyline: this.id,
                idx: t,
                pt: e,
              })
            );
          }),
          (l.PolyLineAnnot.prototype.getStartStyle = function () {
            return l.sendWithPromise('PolyLineAnnot.getStartStyle', {
              polyline: this.id,
            });
          }),
          (l.PolyLineAnnot.prototype.setStartStyle = function (t) {
            return (
              f(arguments.length, 1, 'setStartStyle', '(number)', [[t, 'number']]),
              l.sendWithPromise('PolyLineAnnot.setStartStyle', {
                polyline: this.id,
                style: t,
              })
            );
          }),
          (l.PolyLineAnnot.prototype.getEndStyle = function () {
            return l.sendWithPromise('PolyLineAnnot.getEndStyle', {
              polyline: this.id,
            });
          }),
          (l.PolyLineAnnot.prototype.setEndStyle = function (t) {
            return (
              f(arguments.length, 1, 'setEndStyle', '(number)', [[t, 'number']]),
              l.sendWithPromise('PolyLineAnnot.setEndStyle', {
                polyline: this.id,
                style: t,
              })
            );
          }),
          (l.PolyLineAnnot.prototype.getIntentName = function () {
            return l.sendWithPromise('PolyLineAnnot.getIntentName', {
              polyline: this.id,
            });
          }),
          (l.PolyLineAnnot.prototype.setIntentName = function (t) {
            return (
              f(arguments.length, 1, 'setIntentName', '(number)', [[t, 'number']]),
              l.sendWithPromise('PolyLineAnnot.setIntentName', {
                polyline: this.id,
                mode: t,
              })
            );
          }),
          (l.PolygonAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('polygonAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.PolygonAnnot, t);
              })
            );
          }),
          (l.PolygonAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('polygonAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.PolygonAnnot, t);
              })
            );
          }),
          (l.PolygonAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('polygonAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.PolygonAnnot, t);
              })
            );
          }),
          (l.PopupAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('popupAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.PopupAnnot, t);
              })
            );
          }),
          (l.PopupAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('popupAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.PopupAnnot, t);
              })
            );
          }),
          (l.PopupAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('popupAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.PopupAnnot, t);
              })
            );
          }),
          (l.PopupAnnot.prototype.getParent = function () {
            return l.sendWithPromise('PopupAnnot.getParent', { popup: this.id }).then(function (t) {
              return _(l.Annot, t);
            });
          }),
          (l.PopupAnnot.prototype.setParent = function (t) {
            return (
              f(arguments.length, 1, 'setParent', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('PopupAnnot.setParent', {
                popup: this.id,
                parent: t.id,
              })
            );
          }),
          (l.PopupAnnot.prototype.isOpen = function () {
            return l.sendWithPromise('PopupAnnot.isOpen', { popup: this.id });
          }),
          (l.PopupAnnot.prototype.setOpen = function (t) {
            return (
              f(arguments.length, 1, 'setOpen', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PopupAnnot.setOpen', {
                popup: this.id,
                isopen: t,
              })
            );
          }),
          (l.RedactionAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('redactionAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.RedactionAnnot, t);
              })
            );
          }),
          (l.RedactionAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('redactionAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.RedactionAnnot, t);
              })
            );
          }),
          (l.RedactionAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('redactionAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.RedactionAnnot, t);
              })
            );
          }),
          (l.RedactionAnnot.prototype.getQuadPointCount = function () {
            return l.sendWithPromise('RedactionAnnot.getQuadPointCount', {
              redaction: this.id,
            });
          }),
          (l.RedactionAnnot.prototype.getQuadPoint = function (t) {
            return (
              f(arguments.length, 1, 'getQuadPoint', '(number)', [[t, 'number']]),
              l.sendWithPromise('RedactionAnnot.getQuadPoint', {
                redaction: this.id,
                idx: t,
              })
            );
          }),
          (l.RedactionAnnot.prototype.setQuadPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'setQuadPoint', '(number, PDFNet.QuadPoint)', [
                [t, 'number'],
                [e, 'Structure', l.QuadPoint, 'QuadPoint'],
              ]),
              F('setQuadPoint', [[e, 1]]),
              l.sendWithPromise('RedactionAnnot.setQuadPoint', {
                redaction: this.id,
                idx: t,
                qp: e,
              })
            );
          }),
          (l.RedactionAnnot.prototype.setAppFormXO = function (t) {
            return (
              f(arguments.length, 1, 'setAppFormXO', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('RedactionAnnot.setAppFormXO', {
                redaction: this.id,
                formxo: t.id,
              })
            );
          }),
          (l.RedactionAnnot.prototype.getOverlayText = function () {
            return l.sendWithPromise('RedactionAnnot.getOverlayText', {
              redaction: this.id,
            });
          }),
          (l.RedactionAnnot.prototype.setOverlayText = function (t) {
            return (
              f(arguments.length, 1, 'setOverlayText', '(string)', [[t, 'string']]),
              l.sendWithPromise('RedactionAnnot.setOverlayText', {
                redaction: this.id,
                title: t,
              })
            );
          }),
          (l.RedactionAnnot.prototype.getUseRepeat = function () {
            return l.sendWithPromise('RedactionAnnot.getUseRepeat', {
              redaction: this.id,
            });
          }),
          (l.RedactionAnnot.prototype.setUseRepeat = function (t) {
            return (
              void 0 === t && (t = !1),
              f(arguments.length, 0, 'setUseRepeat', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('RedactionAnnot.setUseRepeat', {
                redaction: this.id,
                userepeat: t,
              })
            );
          }),
          (l.RedactionAnnot.prototype.getOverlayTextAppearance = function () {
            return l.sendWithPromise('RedactionAnnot.getOverlayTextAppearance', { redaction: this.id });
          }),
          (l.RedactionAnnot.prototype.setOverlayTextAppearance = function (t) {
            return (
              f(arguments.length, 1, 'setOverlayTextAppearance', '(string)', [[t, 'string']]),
              l.sendWithPromise('RedactionAnnot.setOverlayTextAppearance', {
                redaction: this.id,
                app: t,
              })
            );
          }),
          (l.RedactionAnnot.prototype.getQuadForm = function () {
            return l.sendWithPromise('RedactionAnnot.getQuadForm', {
              redaction: this.id,
            });
          }),
          (l.RedactionAnnot.prototype.setQuadForm = function (t) {
            return (
              void 0 === t && (t = l.RedactionAnnot.QuadForm.e_LeftJustified),
              f(arguments.length, 0, 'setQuadForm', '(number)', [[t, 'number']]),
              l.sendWithPromise('RedactionAnnot.setQuadForm', {
                redaction: this.id,
                form: t,
              })
            );
          }),
          (l.RedactionAnnot.prototype.getAppFormXO = function () {
            return l
              .sendWithPromise('RedactionAnnot.getAppFormXO', {
                redaction: this.id,
              })
              .then(function (t) {
                return _(l.Obj, t);
              });
          }),
          (l.RubberStampAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('rubberStampAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.RubberStampAnnot, t);
              })
            );
          }),
          (l.RubberStampAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('rubberStampAnnotCreateFromAnnot', {
                  ann: t.id,
                })
                .then(function (t) {
                  return _(l.RubberStampAnnot, t);
                })
            );
          }),
          (l.RubberStampAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('rubberStampAnnotCreate', {
                  doc: t.id,
                  pos: e,
                })
                .then(function (t) {
                  return _(l.RubberStampAnnot, t);
                })
            );
          }),
          (l.RubberStampAnnot.createCustom = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createCustom', '(PDFNet.SDFDoc, PDFNet.Rect, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Object', l.Obj, 'Obj'],
              ]),
              F('createCustom', [[e, 1]]),
              l
                .sendWithPromise('rubberStampAnnotCreateCustom', {
                  doc: t.id,
                  pos: e,
                  form_xobject: n.id,
                })
                .then(function (t) {
                  return _(l.RubberStampAnnot, t);
                })
            );
          }),
          (l.RubberStampAnnot.prototype.getIcon = function () {
            return l.sendWithPromise('RubberStampAnnot.getIcon', {
              stamp: this.id,
            });
          }),
          (l.RubberStampAnnot.prototype.setIcon = function (t) {
            return (
              void 0 === t && (t = l.RubberStampAnnot.Icon.e_Draft),
              f(arguments.length, 0, 'setIcon', '(number)', [[t, 'number']]),
              l.sendWithPromise('RubberStampAnnot.setIcon', {
                stamp: this.id,
                type: t,
              })
            );
          }),
          (l.RubberStampAnnot.prototype.setIconDefault = function () {
            return l.sendWithPromise('RubberStampAnnot.setIconDefault', {
              stamp: this.id,
            });
          }),
          (l.RubberStampAnnot.prototype.getIconName = function () {
            return l.sendWithPromise('RubberStampAnnot.getIconName', {
              stamp: this.id,
            });
          }),
          (l.RubberStampAnnot.prototype.setIconName = function (t) {
            return (
              f(arguments.length, 1, 'setIconName', '(string)', [[t, 'string']]),
              l.sendWithPromise('RubberStampAnnot.setIconName', {
                stamp: this.id,
                iconstring: t,
              })
            );
          }),
          (l.rubberStampAnnotSetOpacity = function (t, e) {
            return (
              f(arguments.length, 2, 'rubberStampAnnotSetOpacity', '(PDFNet.Annot, number)', [
                [t, 'Object', l.Annot, 'Annot'],
                [e, 'number'],
              ]),
              l.sendWithPromise('rubberStampAnnotSetOpacity', {
                stamp: t.id,
                opacity: e,
              })
            );
          }),
          (l.ScreenAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('screenAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.ScreenAnnot, t);
              })
            );
          }),
          (l.ScreenAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('screenAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.ScreenAnnot, t);
              })
            );
          }),
          (l.ScreenAnnot.prototype.getTitle = function () {
            return l.sendWithPromise('ScreenAnnot.getTitle', { s: this.id });
          }),
          (l.ScreenAnnot.prototype.setTitle = function (t) {
            return (
              f(arguments.length, 1, 'setTitle', '(string)', [[t, 'string']]),
              l.sendWithPromise('ScreenAnnot.setTitle', {
                s: this.id,
                title: t,
              })
            );
          }),
          (l.ScreenAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('screenAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.ScreenAnnot, t);
              })
            );
          }),
          (l.ScreenAnnot.prototype.getAction = function () {
            return l.sendWithPromise('ScreenAnnot.getAction', { s: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.ScreenAnnot.prototype.setAction = function (t) {
            return (
              f(arguments.length, 1, 'setAction', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('ScreenAnnot.setAction', {
                s: this.id,
                action: t.id,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getBorderColor = function () {
            return l.sendWithPromise('ScreenAnnot.getBorderColor', { s: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.ScreenAnnot.prototype.setBorderColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setBorderColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('ScreenAnnot.setBorderColor', {
                s: this.id,
                col: t.id,
                numcomp: e,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getBorderColorCompNum = function () {
            return l.sendWithPromise('ScreenAnnot.getBorderColorCompNum', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.getBackgroundColorCompNum = function () {
            return l.sendWithPromise('ScreenAnnot.getBackgroundColorCompNum', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.getBackgroundColor = function () {
            return l.sendWithPromise('ScreenAnnot.getBackgroundColor', { s: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.ScreenAnnot.prototype.setBackgroundColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setBackgroundColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('ScreenAnnot.setBackgroundColor', {
                s: this.id,
                col: t.id,
                numcomp: e,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getStaticCaptionText = function () {
            return l.sendWithPromise('ScreenAnnot.getStaticCaptionText', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setStaticCaptionText = function (t) {
            return (
              f(arguments.length, 1, 'setStaticCaptionText', '(string)', [[t, 'string']]),
              l.sendWithPromise('ScreenAnnot.setStaticCaptionText', {
                s: this.id,
                contents: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getRolloverCaptionText = function () {
            return l.sendWithPromise('ScreenAnnot.getRolloverCaptionText', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setRolloverCaptionText = function (t) {
            return (
              f(arguments.length, 1, 'setRolloverCaptionText', '(string)', [[t, 'string']]),
              l.sendWithPromise('ScreenAnnot.setRolloverCaptionText', {
                s: this.id,
                contents: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getMouseDownCaptionText = function () {
            return l.sendWithPromise('ScreenAnnot.getMouseDownCaptionText', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setMouseDownCaptionText = function (t) {
            return (
              f(arguments.length, 1, 'setMouseDownCaptionText', '(string)', [[t, 'string']]),
              l.sendWithPromise('ScreenAnnot.setMouseDownCaptionText', {
                s: this.id,
                contents: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getStaticIcon = function () {
            return l.sendWithPromise('ScreenAnnot.getStaticIcon', { s: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ScreenAnnot.prototype.setStaticIcon = function (t) {
            return (
              f(arguments.length, 1, 'setStaticIcon', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ScreenAnnot.setStaticIcon', {
                s: this.id,
                icon: t.id,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getRolloverIcon = function () {
            return l.sendWithPromise('ScreenAnnot.getRolloverIcon', { s: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ScreenAnnot.prototype.setRolloverIcon = function (t) {
            return (
              f(arguments.length, 1, 'setRolloverIcon', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ScreenAnnot.setRolloverIcon', {
                s: this.id,
                icon: t.id,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getMouseDownIcon = function () {
            return l.sendWithPromise('ScreenAnnot.getMouseDownIcon', { s: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ScreenAnnot.prototype.setMouseDownIcon = function (t) {
            return (
              f(arguments.length, 1, 'setMouseDownIcon', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ScreenAnnot.setMouseDownIcon', {
                s: this.id,
                icon: t.id,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getScaleType = function () {
            return l.sendWithPromise('ScreenAnnot.getScaleType', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setScaleType = function (t) {
            return (
              f(arguments.length, 1, 'setScaleType', '(number)', [[t, 'number']]),
              l.sendWithPromise('ScreenAnnot.setScaleType', {
                s: this.id,
                st: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getIconCaptionRelation = function () {
            return l.sendWithPromise('ScreenAnnot.getIconCaptionRelation', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setIconCaptionRelation = function (t) {
            return (
              f(arguments.length, 1, 'setIconCaptionRelation', '(number)', [[t, 'number']]),
              l.sendWithPromise('ScreenAnnot.setIconCaptionRelation', {
                s: this.id,
                icr: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getScaleCondition = function () {
            return l.sendWithPromise('ScreenAnnot.getScaleCondition', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setScaleCondition = function (t) {
            return (
              f(arguments.length, 1, 'setScaleCondition', '(number)', [[t, 'number']]),
              l.sendWithPromise('ScreenAnnot.setScaleCondition', {
                s: this.id,
                sc: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getFitFull = function () {
            return l.sendWithPromise('ScreenAnnot.getFitFull', { s: this.id });
          }),
          (l.ScreenAnnot.prototype.setFitFull = function (t) {
            return f(arguments.length, 1, 'setFitFull', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('ScreenAnnot.setFitFull', { s: this.id, ff: t });
          }),
          (l.ScreenAnnot.prototype.getHIconLeftOver = function () {
            return l.sendWithPromise('ScreenAnnot.getHIconLeftOver', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setHIconLeftOver = function (t) {
            return (
              f(arguments.length, 1, 'setHIconLeftOver', '(number)', [[t, 'number']]),
              l.sendWithPromise('ScreenAnnot.setHIconLeftOver', {
                s: this.id,
                hl: t,
              })
            );
          }),
          (l.ScreenAnnot.prototype.getVIconLeftOver = function () {
            return l.sendWithPromise('ScreenAnnot.getVIconLeftOver', {
              s: this.id,
            });
          }),
          (l.ScreenAnnot.prototype.setVIconLeftOver = function (t) {
            return (
              f(arguments.length, 1, 'setVIconLeftOver', '(number)', [[t, 'number']]),
              l.sendWithPromise('ScreenAnnot.setVIconLeftOver', {
                s: this.id,
                vl: t,
              })
            );
          }),
          (l.SoundAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('soundAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.SoundAnnot, t);
              })
            );
          }),
          (l.SoundAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('soundAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.SoundAnnot, t);
              })
            );
          }),
          (l.SoundAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('soundAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.SoundAnnot, t);
              })
            );
          }),
          (l.SoundAnnot.createWithData = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'createWithData', '(PDFNet.SDFDoc, PDFNet.Rect, PDFNet.Filter, number, number, number)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Object', l.Filter, 'Filter'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              F('createWithData', [[e, 1]]),
              0 != n.id && O(n.id),
              l
                .sendWithPromise('soundAnnotCreateWithData', {
                  doc: t.id,
                  pos: e,
                  no_own_stream: n.id,
                  sample_bits: i,
                  sample_freq: r,
                  num_channels: o,
                })
                .then(function (t) {
                  return _(l.SoundAnnot, t);
                })
            );
          }),
          (l.SoundAnnot.createAtPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'createAtPoint', '(PDFNet.SDFDoc, PDFNet.Point)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Point, 'Point'],
              ]),
              F('createAtPoint', [[e, 1]]),
              l
                .sendWithPromise('soundAnnotCreateAtPoint', {
                  doc: t.id,
                  pos: e,
                })
                .then(function (t) {
                  return _(l.SoundAnnot, t);
                })
            );
          }),
          (l.SoundAnnot.prototype.getSoundStream = function () {
            return l.sendWithPromise('SoundAnnot.getSoundStream', { sound: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SoundAnnot.prototype.setSoundStream = function (t) {
            return (
              f(arguments.length, 1, 'setSoundStream', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('SoundAnnot.setSoundStream', {
                sound: this.id,
                icon: t.id,
              })
            );
          }),
          (l.SoundAnnot.prototype.getIcon = function () {
            return l.sendWithPromise('SoundAnnot.getIcon', { sound: this.id });
          }),
          (l.SoundAnnot.prototype.setIcon = function (t) {
            return (
              void 0 === t && (t = l.SoundAnnot.Icon.e_Speaker),
              f(arguments.length, 0, 'setIcon', '(number)', [[t, 'number']]),
              l.sendWithPromise('SoundAnnot.setIcon', {
                sound: this.id,
                type: t,
              })
            );
          }),
          (l.SoundAnnot.prototype.getIconName = function () {
            return l.sendWithPromise('SoundAnnot.getIconName', {
              sound: this.id,
            });
          }),
          (l.SoundAnnot.prototype.setIconName = function (t) {
            return (
              f(arguments.length, 1, 'setIconName', '(string)', [[t, 'string']]),
              l.sendWithPromise('SoundAnnot.setIconName', {
                sound: this.id,
                type: t,
              })
            );
          }),
          (l.SquareAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('squareAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.SquareAnnot, t);
              })
            );
          }),
          (l.SquareAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('squareAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.SquareAnnot, t);
              })
            );
          }),
          (l.SquareAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('squareAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.SquareAnnot, t);
              })
            );
          }),
          (l.SquareAnnot.prototype.getInteriorColor = function () {
            return l
              .sendWithPromise('SquareAnnot.getInteriorColor', {
                square: this.id,
              })
              .then(function (t) {
                return D(l.ColorPt, t);
              });
          }),
          (l.SquareAnnot.prototype.getInteriorColorCompNum = function () {
            return l.sendWithPromise('SquareAnnot.getInteriorColorCompNum', {
              square: this.id,
            });
          }),
          (l.SquareAnnot.prototype.setInteriorColorDefault = function (t) {
            return (
              f(arguments.length, 1, 'setInteriorColorDefault', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('SquareAnnot.setInteriorColorDefault', {
                square: this.id,
                col: t.id,
              })
            );
          }),
          (l.SquareAnnot.prototype.setInteriorColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setInteriorColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('SquareAnnot.setInteriorColor', {
                square: this.id,
                col: t.id,
                numcomp: e,
              })
            );
          }),
          (l.SquareAnnot.prototype.getContentRect = function () {
            return l
              .sendWithPromise('SquareAnnot.getContentRect', {
                square: this.id,
              })
              .then(function (t) {
                return new l.Rect(t);
              });
          }),
          (l.SquareAnnot.prototype.setContentRect = function (t) {
            return (
              f(arguments.length, 1, 'setContentRect', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setContentRect', [[t, 0]]),
              l.sendWithPromise('SquareAnnot.setContentRect', {
                square: this.id,
                cr: t,
              })
            );
          }),
          (l.SquareAnnot.prototype.getPadding = function () {
            return l.sendWithPromise('SquareAnnot.getPadding', { square: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.SquareAnnot.prototype.setPadding = function (t) {
            return (
              f(arguments.length, 1, 'setPadding', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setPadding', [[t, 0]]),
              l.sendWithPromise('SquareAnnot.setPadding', {
                square: this.id,
                cr: t,
              })
            );
          }),
          (l.SquigglyAnnot.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('squigglyAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.SquigglyAnnot, t);
              })
            );
          }),
          (l.SquigglyAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('squigglyAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.SquigglyAnnot, t);
              })
            );
          }),
          (l.SquigglyAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('squigglyAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.SquigglyAnnot, t);
              })
            );
          }),
          (l.StrikeOutAnnot.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('strikeOutAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.StrikeOutAnnot, t);
              })
            );
          }),
          (l.StrikeOutAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('strikeOutAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.StrikeOutAnnot, t);
              })
            );
          }),
          (l.StrikeOutAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('strikeOutAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.StrikeOutAnnot, t);
              })
            );
          }),
          (l.TextAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('textAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.TextAnnot, t);
              })
            );
          }),
          (l.TextAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('textAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.TextAnnot, t);
              })
            );
          }),
          (l.TextAnnot.createAtPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'createAtPoint', '(PDFNet.SDFDoc, PDFNet.Point)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Point, 'Point'],
              ]),
              F('createAtPoint', [[e, 1]]),
              l
                .sendWithPromise('textAnnotCreateAtPoint', {
                  doc: t.id,
                  pos: e,
                })
                .then(function (t) {
                  return _(l.TextAnnot, t);
                })
            );
          }),
          (l.TextAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('textAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.TextAnnot, t);
              })
            );
          }),
          (l.TextAnnot.prototype.isOpen = function () {
            return l.sendWithPromise('TextAnnot.isOpen', { text: this.id });
          }),
          (l.TextAnnot.prototype.setOpen = function (t) {
            return (
              f(arguments.length, 1, 'setOpen', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('TextAnnot.setOpen', {
                text: this.id,
                isopen: t,
              })
            );
          }),
          (l.TextAnnot.prototype.getIcon = function () {
            return l.sendWithPromise('TextAnnot.getIcon', { text: this.id });
          }),
          (l.TextAnnot.prototype.setIcon = function (t) {
            return (
              void 0 === t && (t = l.TextAnnot.Icon.e_Note),
              f(arguments.length, 0, 'setIcon', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextAnnot.setIcon', { text: this.id, icon: t })
            );
          }),
          (l.TextAnnot.prototype.setIconDefault = function () {
            return l.sendWithPromise('TextAnnot.setIconDefault', {
              text: this.id,
            });
          }),
          (l.TextAnnot.prototype.getIconName = function () {
            return l.sendWithPromise('TextAnnot.getIconName', {
              text: this.id,
            });
          }),
          (l.TextAnnot.prototype.setIconName = function (t) {
            return (
              f(arguments.length, 1, 'setIconName', '(string)', [[t, 'string']]),
              l.sendWithPromise('TextAnnot.setIconName', {
                text: this.id,
                icon: t,
              })
            );
          }),
          (l.TextAnnot.prototype.getState = function () {
            return l.sendWithPromise('TextAnnot.getState', { text: this.id });
          }),
          (l.TextAnnot.prototype.setState = function (t) {
            return (
              void 0 === t && (t = ''),
              f(arguments.length, 0, 'setState', '(string)', [[t, 'string']]),
              l.sendWithPromise('TextAnnot.setState', {
                text: this.id,
                state: t,
              })
            );
          }),
          (l.TextAnnot.prototype.getStateModel = function () {
            return l.sendWithPromise('TextAnnot.getStateModel', {
              text: this.id,
            });
          }),
          (l.TextAnnot.prototype.setStateModel = function (t) {
            return (
              f(arguments.length, 1, 'setStateModel', '(string)', [[t, 'string']]),
              l.sendWithPromise('TextAnnot.setStateModel', {
                text: this.id,
                sm: t,
              })
            );
          }),
          (l.TextAnnot.prototype.getAnchorPosition = function (e) {
            return (
              f(arguments.length, 1, 'getAnchorPosition', '(PDFNet.Point)', [[e, 'Structure', l.Point, 'Point']]),
              F('getAnchorPosition', [[e, 0]]),
              (e.yieldFunction = 'TextAnnot.getAnchorPosition'),
              l
                .sendWithPromise('TextAnnot.getAnchorPosition', {
                  text: this.id,
                  anchor: e,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.TextAnnot.prototype.setAnchorPosition = function (t) {
            return (
              f(arguments.length, 1, 'setAnchorPosition', '(PDFNet.Point)', [[t, 'Structure', l.Point, 'Point']]),
              F('setAnchorPosition', [[t, 0]]),
              l.sendWithPromise('TextAnnot.setAnchorPosition', {
                text: this.id,
                anchor: t,
              })
            );
          }),
          (l.UnderlineAnnot.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('underlineAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.UnderlineAnnot, t);
              })
            );
          }),
          (l.UnderlineAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('underlineAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.UnderlineAnnot, t);
              })
            );
          }),
          (l.UnderlineAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('underlineAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.UnderlineAnnot, t);
              })
            );
          }),
          (l.WatermarkAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('watermarkAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.WatermarkAnnot, t);
              })
            );
          }),
          (l.WatermarkAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('watermarkAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.WatermarkAnnot, t);
              })
            );
          }),
          (l.WatermarkAnnot.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, PDFNet.Rect)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
              ]),
              F('create', [[e, 1]]),
              l.sendWithPromise('watermarkAnnotCreate', { doc: t.id, pos: e }).then(function (t) {
                return _(l.WatermarkAnnot, t);
              })
            );
          }),
          (l.TextMarkupAnnot.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('textMarkupAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.TextMarkupAnnot, t);
              })
            );
          }),
          (l.TextMarkupAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('textMarkupAnnotCreateFromAnnot', {
                  ann: t.id,
                })
                .then(function (t) {
                  return _(l.TextMarkupAnnot, t);
                })
            );
          }),
          (l.TextMarkupAnnot.prototype.getQuadPointCount = function () {
            return l.sendWithPromise('TextMarkupAnnot.getQuadPointCount', {
              textmarkup: this.id,
            });
          }),
          (l.TextMarkupAnnot.prototype.getQuadPoint = function (t) {
            return (
              f(arguments.length, 1, 'getQuadPoint', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextMarkupAnnot.getQuadPoint', {
                textmarkup: this.id,
                idx: t,
              })
            );
          }),
          (l.TextMarkupAnnot.prototype.setQuadPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'setQuadPoint', '(number, PDFNet.QuadPoint)', [
                [t, 'number'],
                [e, 'Structure', l.QuadPoint, 'QuadPoint'],
              ]),
              F('setQuadPoint', [[e, 1]]),
              l.sendWithPromise('TextMarkupAnnot.setQuadPoint', {
                textmarkup: this.id,
                idx: t,
                qp: e,
              })
            );
          }),
          (l.WidgetAnnot.create = function (t, e, n) {
            return (
              f(arguments.length, 3, 'create', '(PDFNet.SDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'SDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('create', [
                [e, 1],
                [n, 2],
              ]),
              (n.yieldFunction = 'WidgetAnnot.create'),
              l
                .sendWithPromise('widgetAnnotCreate', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return (n.yieldFunction = void 0), (t.result = _(l.WidgetAnnot, t.result)), W(t.field, n), t.result;
                })
            );
          }),
          (l.WidgetAnnot.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('widgetAnnotCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.WidgetAnnot, t);
              })
            );
          }),
          (l.WidgetAnnot.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('widgetAnnotCreateFromAnnot', { ann: t.id }).then(function (t) {
                return _(l.WidgetAnnot, t);
              })
            );
          }),
          (l.WidgetAnnot.prototype.getField = function () {
            return l.sendWithPromise('WidgetAnnot.getField', { widget: this.id }).then(function (t) {
              return new l.Field(t);
            });
          }),
          (l.WidgetAnnot.prototype.getHighlightingMode = function () {
            return l.sendWithPromise('WidgetAnnot.getHighlightingMode', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setHighlightingMode = function (t) {
            return (
              void 0 === t && (t = l.WidgetAnnot.HighlightingMode.e_invert),
              f(arguments.length, 0, 'setHighlightingMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setHighlightingMode', {
                widget: this.id,
                value: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getAction = function () {
            return l.sendWithPromise('WidgetAnnot.getAction', { widget: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.WidgetAnnot.prototype.setAction = function (t) {
            return (
              f(arguments.length, 1, 'setAction', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('WidgetAnnot.setAction', {
                widget: this.id,
                action: t.id,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getBorderColor = function () {
            return l
              .sendWithPromise('WidgetAnnot.getBorderColor', {
                widget: this.id,
              })
              .then(function (t) {
                return D(l.ColorPt, t);
              });
          }),
          (l.WidgetAnnot.prototype.setBorderColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setBorderColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('WidgetAnnot.setBorderColor', {
                widget: this.id,
                col: t.id,
                compnum: e,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getBorderColorCompNum = function () {
            return l.sendWithPromise('WidgetAnnot.getBorderColorCompNum', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.getBackgroundColorCompNum = function () {
            return l.sendWithPromise('WidgetAnnot.getBackgroundColorCompNum', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.getBackgroundColor = function () {
            return l
              .sendWithPromise('WidgetAnnot.getBackgroundColor', {
                widget: this.id,
              })
              .then(function (t) {
                return D(l.ColorPt, t);
              });
          }),
          (l.WidgetAnnot.prototype.setBackgroundColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setBackgroundColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('WidgetAnnot.setBackgroundColor', {
                widget: this.id,
                col: t.id,
                compnum: e,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getStaticCaptionText = function () {
            return l.sendWithPromise('WidgetAnnot.getStaticCaptionText', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setStaticCaptionText = function (t) {
            return (
              f(arguments.length, 1, 'setStaticCaptionText', '(string)', [[t, 'string']]),
              l.sendWithPromise('WidgetAnnot.setStaticCaptionText', {
                widget: this.id,
                contents: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getRolloverCaptionText = function () {
            return l.sendWithPromise('WidgetAnnot.getRolloverCaptionText', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setRolloverCaptionText = function (t) {
            return (
              f(arguments.length, 1, 'setRolloverCaptionText', '(string)', [[t, 'string']]),
              l.sendWithPromise('WidgetAnnot.setRolloverCaptionText', {
                widget: this.id,
                contents: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getMouseDownCaptionText = function () {
            return l.sendWithPromise('WidgetAnnot.getMouseDownCaptionText', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setMouseDownCaptionText = function (t) {
            return (
              f(arguments.length, 1, 'setMouseDownCaptionText', '(string)', [[t, 'string']]),
              l.sendWithPromise('WidgetAnnot.setMouseDownCaptionText', {
                widget: this.id,
                contents: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getStaticIcon = function () {
            return l.sendWithPromise('WidgetAnnot.getStaticIcon', { widget: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.WidgetAnnot.prototype.setStaticIcon = function (t) {
            return (
              f(arguments.length, 1, 'setStaticIcon', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('WidgetAnnot.setStaticIcon', {
                widget: this.id,
                icon: t.id,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getRolloverIcon = function () {
            return l
              .sendWithPromise('WidgetAnnot.getRolloverIcon', {
                widget: this.id,
              })
              .then(function (t) {
                return _(l.Obj, t);
              });
          }),
          (l.WidgetAnnot.prototype.setRolloverIcon = function (t) {
            return (
              f(arguments.length, 1, 'setRolloverIcon', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('WidgetAnnot.setRolloverIcon', {
                widget: this.id,
                icon: t.id,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getMouseDownIcon = function () {
            return l
              .sendWithPromise('WidgetAnnot.getMouseDownIcon', {
                widget: this.id,
              })
              .then(function (t) {
                return _(l.Obj, t);
              });
          }),
          (l.WidgetAnnot.prototype.setMouseDownIcon = function (t) {
            return (
              f(arguments.length, 1, 'setMouseDownIcon', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('WidgetAnnot.setMouseDownIcon', {
                widget: this.id,
                icon: t.id,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getScaleType = function () {
            return l.sendWithPromise('WidgetAnnot.getScaleType', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setScaleType = function (t) {
            return (
              f(arguments.length, 1, 'setScaleType', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setScaleType', {
                widget: this.id,
                st: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getIconCaptionRelation = function () {
            return l.sendWithPromise('WidgetAnnot.getIconCaptionRelation', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setIconCaptionRelation = function (t) {
            return (
              f(arguments.length, 1, 'setIconCaptionRelation', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setIconCaptionRelation', {
                widget: this.id,
                icr: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getScaleCondition = function () {
            return l.sendWithPromise('WidgetAnnot.getScaleCondition', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setScaleCondition = function (t) {
            return (
              f(arguments.length, 1, 'setScaleCondition', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setScaleCondition', {
                widget: this.id,
                sd: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getFitFull = function () {
            return l.sendWithPromise('WidgetAnnot.getFitFull', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setFitFull = function (t) {
            return (
              f(arguments.length, 1, 'setFitFull', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('WidgetAnnot.setFitFull', {
                widget: this.id,
                ff: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getHIconLeftOver = function () {
            return l.sendWithPromise('WidgetAnnot.getHIconLeftOver', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setHIconLeftOver = function (t) {
            return (
              f(arguments.length, 1, 'setHIconLeftOver', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setHIconLeftOver', {
                widget: this.id,
                hl: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getVIconLeftOver = function () {
            return l.sendWithPromise('WidgetAnnot.getVIconLeftOver', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.setVIconLeftOver = function (t) {
            return (
              f(arguments.length, 1, 'setVIconLeftOver', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setVIconLeftOver', {
                widget: this.id,
                vl: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.setFontSize = function (t) {
            return (
              f(arguments.length, 1, 'setFontSize', '(number)', [[t, 'number']]),
              l.sendWithPromise('WidgetAnnot.setFontSize', {
                widget: this.id,
                font_size: t,
              })
            );
          }),
          (l.WidgetAnnot.prototype.setTextColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setTextColor', '(PDFNet.ColorPt, number)', [
                [t, 'Object', l.ColorPt, 'ColorPt'],
                [e, 'number'],
              ]),
              l.sendWithPromise('WidgetAnnot.setTextColor', {
                widget: this.id,
                color: t.id,
                col_comp: e,
              })
            );
          }),
          (l.WidgetAnnot.prototype.setFont = function (t) {
            return (
              f(arguments.length, 1, 'setFont', '(PDFNet.Font)', [[t, 'Object', l.Font, 'Font']]),
              l.sendWithPromise('WidgetAnnot.setFont', {
                widget: this.id,
                font: t.id,
              })
            );
          }),
          (l.WidgetAnnot.prototype.getFontSize = function () {
            return l.sendWithPromise('WidgetAnnot.getFontSize', {
              widget: this.id,
            });
          }),
          (l.WidgetAnnot.prototype.getTextColor = function () {
            return l.sendWithPromise('WidgetAnnot.getTextColor', { widget: this.id }).then(function (t) {
              return (t.col = D(l.ColorPt, t.col)), t;
            });
          }),
          (l.WidgetAnnot.prototype.getFont = function () {
            return l.sendWithPromise('WidgetAnnot.getFont', { widget: this.id }).then(function (t) {
              return D(l.Font, t);
            });
          }),
          (l.SignatureWidget.create = function (t, e, n) {
            return (
              void 0 === n && (n = ''),
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, PDFNet.Rect, string)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('signatureWidgetCreate', {
                  doc: t.id,
                  pos: e,
                  field_name: n,
                })
                .then(function (t) {
                  return _(l.SignatureWidget, t);
                })
            );
          }),
          (l.SignatureWidget.createWithField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('createWithField', [
                [e, 1],
                [n, 2],
              ]),
              l
                .sendWithPromise('signatureWidgetCreateWithField', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return _(l.SignatureWidget, t);
                })
            );
          }),
          (l.SignatureWidget.createWithDigitalSignatureField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithDigitalSignatureField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.DigitalSignatureField)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.DigitalSignatureField, 'DigitalSignatureField'],
              ]),
              F('createWithDigitalSignatureField', [
                [e, 1],
                [n, 2],
              ]),
              l.sendWithPromise('signatureWidgetCreateWithDigitalSignatureField', { doc: t.id, pos: e, field: n }).then(function (t) {
                return _(l.SignatureWidget, t);
              })
            );
          }),
          (l.SignatureWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('signatureWidgetCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.SignatureWidget, t);
              })
            );
          }),
          (l.SignatureWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('signatureWidgetCreateFromAnnot', {
                  annot: t.id,
                })
                .then(function (t) {
                  return _(l.SignatureWidget, t);
                })
            );
          }),
          (l.SignatureWidget.prototype.createSignatureAppearance = function (t) {
            return (
              f(arguments.length, 1, 'createSignatureAppearance', '(PDFNet.Image)', [[t, 'Object', l.Image, 'Image']]),
              l.sendWithPromise('SignatureWidget.createSignatureAppearance', {
                self: this.id,
                img: t.id,
              })
            );
          }),
          (l.SignatureWidget.prototype.getDigitalSignatureField = function () {
            return l
              .sendWithPromise('SignatureWidget.getDigitalSignatureField', {
                self: this.id,
              })
              .then(function (t) {
                return new l.DigitalSignatureField(t);
              });
          }),
          (l.ComboBoxWidget.create = function (t, e, n) {
            return (
              void 0 === n && (n = ''),
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, PDFNet.Rect, string)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('comboBoxWidgetCreate', {
                  doc: t.id,
                  pos: e,
                  field_name: n,
                })
                .then(function (t) {
                  return _(l.ComboBoxWidget, t);
                })
            );
          }),
          (l.ComboBoxWidget.createWithField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('createWithField', [
                [e, 1],
                [n, 2],
              ]),
              l
                .sendWithPromise('comboBoxWidgetCreateWithField', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return _(l.ComboBoxWidget, t);
                })
            );
          }),
          (l.ComboBoxWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('comboBoxWidgetCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.ComboBoxWidget, t);
              })
            );
          }),
          (l.ComboBoxWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('comboBoxWidgetCreateFromAnnot', {
                  annot: t.id,
                })
                .then(function (t) {
                  return _(l.ComboBoxWidget, t);
                })
            );
          }),
          (l.ComboBoxWidget.prototype.addOption = function (t) {
            return (
              f(arguments.length, 1, 'addOption', '(string)', [[t, 'string']]),
              l.sendWithPromise('ComboBoxWidget.addOption', {
                combobox: this.id,
                value: t,
              })
            );
          }),
          (l.ComboBoxWidget.prototype.addOptions = function (t) {
            return (
              f(arguments.length, 1, 'addOptions', '(Array<string>)', [[t, 'Array']]),
              l.sendWithPromise('ComboBoxWidget.addOptions', {
                combobox: this.id,
                opts_list: t,
              })
            );
          }),
          (l.ComboBoxWidget.prototype.setSelectedOption = function (t) {
            return (
              f(arguments.length, 1, 'setSelectedOption', '(string)', [[t, 'string']]),
              l.sendWithPromise('ComboBoxWidget.setSelectedOption', {
                combobox: this.id,
                value: t,
              })
            );
          }),
          (l.ComboBoxWidget.prototype.getSelectedOption = function () {
            return l.sendWithPromise('ComboBoxWidget.getSelectedOption', {
              combobox: this.id,
            });
          }),
          (l.ComboBoxWidget.prototype.replaceOptions = function (t) {
            return (
              f(arguments.length, 1, 'replaceOptions', '(Array<string>)', [[t, 'Array']]),
              l.sendWithPromise('ComboBoxWidget.replaceOptions', {
                combobox: this.id,
                new_opts_list: t,
              })
            );
          }),
          (l.ComboBoxWidget.prototype.removeOption = function (t) {
            return (
              f(arguments.length, 1, 'removeOption', '(string)', [[t, 'string']]),
              l.sendWithPromise('ComboBoxWidget.removeOption', {
                combobox: this.id,
                value: t,
              })
            );
          }),
          (l.ListBoxWidget.create = function (t, e, n) {
            return (
              void 0 === n && (n = ''),
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, PDFNet.Rect, string)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('listBoxWidgetCreate', {
                  doc: t.id,
                  pos: e,
                  field_name: n,
                })
                .then(function (t) {
                  return _(l.ListBoxWidget, t);
                })
            );
          }),
          (l.ListBoxWidget.createWithField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('createWithField', [
                [e, 1],
                [n, 2],
              ]),
              l
                .sendWithPromise('listBoxWidgetCreateWithField', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return _(l.ListBoxWidget, t);
                })
            );
          }),
          (l.ListBoxWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('listBoxWidgetCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.ListBoxWidget, t);
              })
            );
          }),
          (l.ListBoxWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('listBoxWidgetCreateFromAnnot', {
                  annot: t.id,
                })
                .then(function (t) {
                  return _(l.ListBoxWidget, t);
                })
            );
          }),
          (l.ListBoxWidget.prototype.addOption = function (t) {
            return (
              f(arguments.length, 1, 'addOption', '(string)', [[t, 'string']]),
              l.sendWithPromise('ListBoxWidget.addOption', {
                listbox: this.id,
                value: t,
              })
            );
          }),
          (l.ListBoxWidget.prototype.addOptions = function (t) {
            return (
              f(arguments.length, 1, 'addOptions', '(Array<string>)', [[t, 'Array']]),
              l.sendWithPromise('ListBoxWidget.addOptions', {
                listbox: this.id,
                opts_list: t,
              })
            );
          }),
          (l.ListBoxWidget.prototype.setSelectedOptions = function (t) {
            return (
              f(arguments.length, 1, 'setSelectedOptions', '(Array<string>)', [[t, 'Array']]),
              l.sendWithPromise('ListBoxWidget.setSelectedOptions', {
                listbox: this.id,
                selected_opts_list: t,
              })
            );
          }),
          (l.ListBoxWidget.prototype.replaceOptions = function (t) {
            return (
              f(arguments.length, 1, 'replaceOptions', '(Array<string>)', [[t, 'Array']]),
              l.sendWithPromise('ListBoxWidget.replaceOptions', {
                listbox: this.id,
                new_opts_list: t,
              })
            );
          }),
          (l.ListBoxWidget.prototype.removeOption = function (t) {
            return (
              f(arguments.length, 1, 'removeOption', '(string)', [[t, 'string']]),
              l.sendWithPromise('ListBoxWidget.removeOption', {
                listbox: this.id,
                value: t,
              })
            );
          }),
          (l.TextWidget.create = function (t, e, n) {
            return (
              void 0 === n && (n = ''),
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, PDFNet.Rect, string)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('textWidgetCreate', {
                  doc: t.id,
                  pos: e,
                  field_name: n,
                })
                .then(function (t) {
                  return _(l.TextWidget, t);
                })
            );
          }),
          (l.TextWidget.createWithField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('createWithField', [
                [e, 1],
                [n, 2],
              ]),
              l
                .sendWithPromise('textWidgetCreateWithField', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return _(l.TextWidget, t);
                })
            );
          }),
          (l.TextWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('textWidgetCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.TextWidget, t);
              })
            );
          }),
          (l.TextWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('textWidgetCreateFromAnnot', { annot: t.id }).then(function (t) {
                return _(l.TextWidget, t);
              })
            );
          }),
          (l.TextWidget.prototype.setText = function (t) {
            return (
              f(arguments.length, 1, 'setText', '(string)', [[t, 'string']]),
              l.sendWithPromise('TextWidget.setText', {
                widget: this.id,
                text: t,
              })
            );
          }),
          (l.TextWidget.prototype.getText = function () {
            return l.sendWithPromise('TextWidget.getText', { widget: this.id });
          }),
          (l.CheckBoxWidget.create = function (t, e, n) {
            return (
              void 0 === n && (n = ''),
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, PDFNet.Rect, string)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('checkBoxWidgetCreate', {
                  doc: t.id,
                  pos: e,
                  field_name: n,
                })
                .then(function (t) {
                  return _(l.CheckBoxWidget, t);
                })
            );
          }),
          (l.CheckBoxWidget.createWithField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('createWithField', [
                [e, 1],
                [n, 2],
              ]),
              l
                .sendWithPromise('checkBoxWidgetCreateWithField', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return _(l.CheckBoxWidget, t);
                })
            );
          }),
          (l.CheckBoxWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('checkBoxWidgetCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.CheckBoxWidget, t);
              })
            );
          }),
          (l.CheckBoxWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('checkBoxWidgetCreateFromAnnot', {
                  annot: t.id,
                })
                .then(function (t) {
                  return _(l.CheckBoxWidget, t);
                })
            );
          }),
          (l.CheckBoxWidget.prototype.isChecked = function () {
            return l.sendWithPromise('CheckBoxWidget.isChecked', {
              button: this.id,
            });
          }),
          (l.CheckBoxWidget.prototype.setChecked = function (t) {
            return (
              f(arguments.length, 1, 'setChecked', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('CheckBoxWidget.setChecked', {
                button: this.id,
                checked: t,
              })
            );
          }),
          (l.RadioButtonWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('radioButtonWidgetCreateFromObj', { d: t.id }).then(function (t) {
                return _(l.RadioButtonWidget, t);
              })
            );
          }),
          (l.RadioButtonWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('radioButtonWidgetCreateFromAnnot', {
                  annot: t.id,
                })
                .then(function (t) {
                  return _(l.RadioButtonWidget, t);
                })
            );
          }),
          (l.RadioButtonWidget.prototype.isEnabled = function () {
            return l.sendWithPromise('RadioButtonWidget.isEnabled', {
              button: this.id,
            });
          }),
          (l.RadioButtonWidget.prototype.enableButton = function () {
            return l.sendWithPromise('RadioButtonWidget.enableButton', {
              button: this.id,
            });
          }),
          (l.RadioButtonWidget.prototype.getGroup = function () {
            return l
              .sendWithPromise('RadioButtonWidget.getGroup', {
                button: this.id,
              })
              .then(function (t) {
                return D(l.RadioButtonGroup, t);
              });
          }),
          (l.PushButtonWidget.create = function (t, e, n) {
            return (
              void 0 === n && (n = ''),
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, PDFNet.Rect, string)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'string'],
              ]),
              F('create', [[e, 1]]),
              l
                .sendWithPromise('pushButtonWidgetCreate', {
                  doc: t.id,
                  pos: e,
                  field_name: n,
                })
                .then(function (t) {
                  return _(l.PushButtonWidget, t);
                })
            );
          }),
          (l.PushButtonWidget.createWithField = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createWithField', '(PDFNet.PDFDoc, PDFNet.Rect, PDFNet.Field)', [
                [t, 'PDFDoc'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'Structure', l.Field, 'Field'],
              ]),
              F('createWithField', [
                [e, 1],
                [n, 2],
              ]),
              l
                .sendWithPromise('pushButtonWidgetCreateWithField', {
                  doc: t.id,
                  pos: e,
                  field: n,
                })
                .then(function (t) {
                  return _(l.PushButtonWidget, t);
                })
            );
          }),
          (l.PushButtonWidget.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('pushButtonWidgetCreateFromObj', { obj: t.id }).then(function (t) {
                return _(l.PushButtonWidget, t);
              })
            );
          }),
          (l.PushButtonWidget.createFromAnnot = function (t) {
            return (
              f(arguments.length, 1, 'createFromAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('pushButtonWidgetCreateFromAnnot', {
                  annot: t.id,
                })
                .then(function (t) {
                  return _(l.PushButtonWidget, t);
                })
            );
          }),
          (l.Bookmark.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.PDFDoc, string)', [
                [t, 'PDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('bookmarkCreate', {
                  in_doc: t.id,
                  in_title: e,
                })
                .then(function (t) {
                  return _(l.Bookmark, t);
                })
            );
          }),
          (l.Bookmark.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l
                .sendWithPromise('bookmarkCreateFromObj', {
                  in_bookmark_dict: t.id,
                })
                .then(function (t) {
                  return _(l.Bookmark, t);
                })
            );
          }),
          (l.Bookmark.prototype.copy = function () {
            return l.sendWithPromise('Bookmark.copy', { in_bookmark: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.Bookmark.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.Bookmark)', [[t, 'Object', l.Bookmark, 'Bookmark']]),
              l.sendWithPromise('Bookmark.compare', {
                bm: this.id,
                in_bookmark: t.id,
              })
            );
          }),
          (l.Bookmark.prototype.isValid = function () {
            return l.sendWithPromise('Bookmark.isValid', { bm: this.id });
          }),
          (l.Bookmark.prototype.hasChildren = function () {
            return l.sendWithPromise('Bookmark.hasChildren', { bm: this.id });
          }),
          (l.Bookmark.prototype.getNext = function () {
            return l.sendWithPromise('Bookmark.getNext', { bm: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.Bookmark.prototype.getPrev = function () {
            return l.sendWithPromise('Bookmark.getPrev', { bm: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.Bookmark.prototype.getFirstChild = function () {
            return l.sendWithPromise('Bookmark.getFirstChild', { bm: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.Bookmark.prototype.getLastChild = function () {
            return l.sendWithPromise('Bookmark.getLastChild', { bm: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.Bookmark.prototype.getParent = function () {
            return l.sendWithPromise('Bookmark.getParent', { bm: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.Bookmark.prototype.find = function (t) {
            return (
              f(arguments.length, 1, 'find', '(string)', [[t, 'string']]),
              l.sendWithPromise('Bookmark.find', { bm: this.id, in_title: t }).then(function (t) {
                return _(l.Bookmark, t);
              })
            );
          }),
          (l.Bookmark.prototype.addNewChild = function (t) {
            return (
              f(arguments.length, 1, 'addNewChild', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('Bookmark.addNewChild', {
                  bm: this.id,
                  in_title: t,
                })
                .then(function (t) {
                  return _(l.Bookmark, t);
                })
            );
          }),
          (l.Bookmark.prototype.addChild = function (t) {
            return (
              f(arguments.length, 1, 'addChild', '(PDFNet.Bookmark)', [[t, 'Object', l.Bookmark, 'Bookmark']]),
              l.sendWithPromise('Bookmark.addChild', {
                bm: this.id,
                in_bookmark: t.id,
              })
            );
          }),
          (l.Bookmark.prototype.addNewNext = function (t) {
            return (
              f(arguments.length, 1, 'addNewNext', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('Bookmark.addNewNext', {
                  bm: this.id,
                  in_title: t,
                })
                .then(function (t) {
                  return _(l.Bookmark, t);
                })
            );
          }),
          (l.Bookmark.prototype.addNext = function (t) {
            return (
              f(arguments.length, 1, 'addNext', '(PDFNet.Bookmark)', [[t, 'Object', l.Bookmark, 'Bookmark']]),
              l.sendWithPromise('Bookmark.addNext', {
                bm: this.id,
                in_bookmark: t.id,
              })
            );
          }),
          (l.Bookmark.prototype.addNewPrev = function (t) {
            return (
              f(arguments.length, 1, 'addNewPrev', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('Bookmark.addNewPrev', {
                  bm: this.id,
                  in_title: t,
                })
                .then(function (t) {
                  return _(l.Bookmark, t);
                })
            );
          }),
          (l.Bookmark.prototype.addPrev = function (t) {
            return (
              f(arguments.length, 1, 'addPrev', '(PDFNet.Bookmark)', [[t, 'Object', l.Bookmark, 'Bookmark']]),
              l.sendWithPromise('Bookmark.addPrev', {
                bm: this.id,
                in_bookmark: t.id,
              })
            );
          }),
          (l.Bookmark.prototype.delete = function () {
            return l.sendWithPromise('Bookmark.delete', { bm: this.id });
          }),
          (l.Bookmark.prototype.unlink = function () {
            return l.sendWithPromise('Bookmark.unlink', { bm: this.id });
          }),
          (l.Bookmark.prototype.getIndent = function () {
            return l.sendWithPromise('Bookmark.getIndent', { bm: this.id });
          }),
          (l.Bookmark.prototype.isOpen = function () {
            return l.sendWithPromise('Bookmark.isOpen', { bm: this.id });
          }),
          (l.Bookmark.prototype.setOpen = function (t) {
            return f(arguments.length, 1, 'setOpen', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('Bookmark.setOpen', { bm: this.id, in_open: t });
          }),
          (l.Bookmark.prototype.getOpenCount = function () {
            return l.sendWithPromise('Bookmark.getOpenCount', { bm: this.id });
          }),
          (l.Bookmark.prototype.getTitle = function () {
            return l.sendWithPromise('Bookmark.getTitle', { bm: this.id });
          }),
          (l.Bookmark.prototype.getTitleObj = function () {
            return l.sendWithPromise('Bookmark.getTitleObj', { bm: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Bookmark.prototype.setTitle = function (t) {
            return f(arguments.length, 1, 'setTitle', '(string)', [[t, 'string']]), l.sendWithPromise('Bookmark.setTitle', { bm: this.id, title: t });
          }),
          (l.Bookmark.prototype.getAction = function () {
            return l.sendWithPromise('Bookmark.getAction', { bm: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.Bookmark.prototype.setAction = function (t) {
            return (
              f(arguments.length, 1, 'setAction', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('Bookmark.setAction', {
                bm: this.id,
                in_action: t.id,
              })
            );
          }),
          (l.Bookmark.prototype.removeAction = function () {
            return l.sendWithPromise('Bookmark.removeAction', { bm: this.id });
          }),
          (l.Bookmark.prototype.getFlags = function () {
            return l.sendWithPromise('Bookmark.getFlags', { bm: this.id });
          }),
          (l.Bookmark.prototype.setFlags = function (t) {
            return (
              f(arguments.length, 1, 'setFlags', '(number)', [[t, 'number']]),
              l.sendWithPromise('Bookmark.setFlags', {
                bm: this.id,
                in_flags: t,
              })
            );
          }),
          (l.Bookmark.prototype.getColor = function () {
            return l.sendWithPromise('Bookmark.getColor', { bm: this.id });
          }),
          (l.Bookmark.prototype.setColor = function (t, e, n) {
            return (
              void 0 === t && (t = 0),
              void 0 === e && (e = 0),
              void 0 === n && (n = 0),
              f(arguments.length, 0, 'setColor', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l.sendWithPromise('Bookmark.setColor', {
                bm: this.id,
                in_r: t,
                in_g: e,
                in_b: n,
              })
            );
          }),
          (l.Bookmark.prototype.getSDFObj = function () {
            return l.sendWithPromise('Bookmark.getSDFObj', { bm: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ColorPt.init = function (t, e, n, i) {
            return (
              void 0 === t && (t = 0),
              void 0 === e && (e = 0),
              void 0 === n && (n = 0),
              void 0 === i && (i = 0),
              f(arguments.length, 0, 'init', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l.sendWithPromise('colorPtInit', { x: t, y: e, z: n, w: i }).then(function (t) {
                return D(l.ColorPt, t);
              })
            );
          }),
          (l.ColorPt.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('ColorPt.compare', {
                left: this.id,
                right: t.id,
              })
            );
          }),
          (l.ColorPt.prototype.set = function (t, e, n, i) {
            return (
              void 0 === t && (t = 0),
              void 0 === e && (e = 0),
              void 0 === n && (n = 0),
              void 0 === i && (i = 0),
              f(arguments.length, 0, 'set', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l.sendWithPromise('ColorPt.set', {
                cp: this.id,
                x: t,
                y: e,
                z: n,
                w: i,
              })
            );
          }),
          (l.ColorPt.prototype.setByIndex = function (t, e) {
            return (
              f(arguments.length, 2, 'setByIndex', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('ColorPt.setByIndex', {
                cp: this.id,
                colorant_index: t,
                colorant_value: e,
              })
            );
          }),
          (l.ColorPt.prototype.get = function (t) {
            return (
              f(arguments.length, 1, 'get', '(number)', [[t, 'number']]),
              l.sendWithPromise('ColorPt.get', {
                cp: this.id,
                colorant_index: t,
              })
            );
          }),
          (l.ColorPt.prototype.setColorantNum = function (t) {
            return (
              f(arguments.length, 1, 'setColorantNum', '(number)', [[t, 'number']]),
              l.sendWithPromise('ColorPt.setColorantNum', {
                cp: this.id,
                num: t,
              })
            );
          }),
          (l.ColorSpace.createDeviceGray = function () {
            return l.sendWithPromise('colorSpaceCreateDeviceGray', {}).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.ColorSpace.createDeviceRGB = function () {
            return l.sendWithPromise('colorSpaceCreateDeviceRGB', {}).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.ColorSpace.createDeviceCMYK = function () {
            return l.sendWithPromise('colorSpaceCreateDeviceCMYK', {}).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.ColorSpace.createPattern = function () {
            return l.sendWithPromise('colorSpaceCreatePattern', {}).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.ColorSpace.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('colorSpaceCreate', { color_space: t.id }).then(function (t) {
                return D(l.ColorSpace, t);
              })
            );
          }),
          (l.ColorSpace.createICCFromFilter = function (t, e) {
            return (
              f(arguments.length, 2, 'createICCFromFilter', '(PDFNet.SDFDoc, PDFNet.Filter)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.Filter, 'Filter'],
              ]),
              0 != e.id && O(e.id),
              l
                .sendWithPromise('colorSpaceCreateICCFromFilter', {
                  doc: t.id,
                  no_own_filter: e.id,
                })
                .then(function (t) {
                  return D(l.ColorSpace, t);
                })
            );
          }),
          (l.ColorSpace.createICCFromBuffer = function (t, e) {
            f(arguments.length, 2, 'createICCFromBuffer', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray)', [
              [t, 'SDFDoc'],
              [e, 'ArrayBuffer'],
            ]);
            var n = b(e, !1);
            return l
              .sendWithPromise('colorSpaceCreateICCFromBuffer', {
                doc: t.id,
                buf: n,
              })
              .then(function (t) {
                return D(l.ColorSpace, t);
              });
          }),
          (l.ColorSpace.getComponentNumFromObj = function (t, e) {
            return (
              f(arguments.length, 2, 'getComponentNumFromObj', '(number, PDFNet.Obj)', [
                [t, 'number'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l.sendWithPromise('colorSpaceGetComponentNumFromObj', {
                cs_type: t,
                cs_obj: e.id,
              })
            );
          }),
          (l.ColorSpace.getTypeFromObj = function (t) {
            return (
              f(arguments.length, 1, 'getTypeFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('colorSpaceGetTypeFromObj', { cs_obj: t.id })
            );
          }),
          (l.ColorSpace.prototype.getType = function () {
            return l.sendWithPromise('ColorSpace.getType', { cs: this.id });
          }),
          (l.ColorSpace.prototype.getSDFObj = function () {
            return l.sendWithPromise('ColorSpace.getSDFObj', { cs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ColorSpace.prototype.getComponentNum = function () {
            return l.sendWithPromise('ColorSpace.getComponentNum', {
              cs: this.id,
            });
          }),
          (l.ColorSpace.prototype.initColor = function () {
            return l.sendWithPromise('ColorSpace.initColor', { cs: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.ColorSpace.prototype.initComponentRanges = function (t) {
            return (
              f(arguments.length, 1, 'initComponentRanges', '(number)', [[t, 'number']]),
              l.sendWithPromise('ColorSpace.initComponentRanges', {
                cs: this.id,
                num_comps: t,
              })
            );
          }),
          (l.ColorSpace.prototype.convert2Gray = function (t) {
            return (
              f(arguments.length, 1, 'convert2Gray', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l
                .sendWithPromise('ColorSpace.convert2Gray', {
                  cs: this.id,
                  in_color: t.id,
                })
                .then(function (t) {
                  return D(l.ColorPt, t);
                })
            );
          }),
          (l.ColorSpace.prototype.convert2RGB = function (t) {
            return (
              f(arguments.length, 1, 'convert2RGB', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l
                .sendWithPromise('ColorSpace.convert2RGB', {
                  cs: this.id,
                  in_color: t.id,
                })
                .then(function (t) {
                  return D(l.ColorPt, t);
                })
            );
          }),
          (l.ColorSpace.prototype.convert2CMYK = function (t) {
            return (
              f(arguments.length, 1, 'convert2CMYK', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l
                .sendWithPromise('ColorSpace.convert2CMYK', {
                  cs: this.id,
                  in_color: t.id,
                })
                .then(function (t) {
                  return D(l.ColorPt, t);
                })
            );
          }),
          (l.ColorSpace.prototype.getAlternateColorSpace = function () {
            return l
              .sendWithPromise('ColorSpace.getAlternateColorSpace', {
                cs: this.id,
              })
              .then(function (t) {
                return D(l.ColorSpace, t);
              });
          }),
          (l.ColorSpace.prototype.getBaseColorSpace = function () {
            return l.sendWithPromise('ColorSpace.getBaseColorSpace', { cs: this.id }).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.ColorSpace.prototype.getHighVal = function () {
            return l.sendWithPromise('ColorSpace.getHighVal', { cs: this.id });
          }),
          (l.ColorSpace.prototype.getLookupTable = function () {
            return l.sendWithPromise('ColorSpace.getLookupTable', {
              cs: this.id,
            });
          }),
          (l.ColorSpace.prototype.getBaseColor = function (t) {
            return (
              f(arguments.length, 1, 'getBaseColor', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('ColorSpace.getBaseColor', {
                  cs: this.id,
                  color_idx: t,
                })
                .then(function (t) {
                  return D(l.ColorPt, t);
                })
            );
          }),
          (l.ColorSpace.prototype.getTintFunction = function () {
            return l.sendWithPromise('ColorSpace.getTintFunction', { cs: this.id }).then(function (t) {
              return D(l.Function, t);
            });
          }),
          (l.ColorSpace.prototype.isAll = function () {
            return l.sendWithPromise('ColorSpace.isAll', { cs: this.id });
          }),
          (l.ColorSpace.prototype.isNone = function () {
            return l.sendWithPromise('ColorSpace.isNone', { cs: this.id });
          }),
          (l.ContentReplacer.create = function () {
            return l.sendWithPromise('contentReplacerCreate', {}).then(function (t) {
              return D(l.ContentReplacer, t);
            });
          }),
          (l.ContentReplacer.prototype.addImage = function (t, e) {
            return (
              f(arguments.length, 2, 'addImage', '(PDFNet.Rect, PDFNet.Obj)', [
                [t, 'Structure', l.Rect, 'Rect'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              F('addImage', [[t, 0]]),
              l.sendWithPromise('ContentReplacer.addImage', {
                cr: this.id,
                target_region: t,
                replacement_image: e.id,
              })
            );
          }),
          (l.ContentReplacer.prototype.addText = function (t, e) {
            return (
              f(arguments.length, 2, 'addText', '(PDFNet.Rect, string)', [
                [t, 'Structure', l.Rect, 'Rect'],
                [e, 'string'],
              ]),
              F('addText', [[t, 0]]),
              l.sendWithPromise('ContentReplacer.addText', {
                cr: this.id,
                target_region: t,
                replacement_text: e,
              })
            );
          }),
          (l.ContentReplacer.prototype.addString = function (t, e) {
            return (
              f(arguments.length, 2, 'addString', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('ContentReplacer.addString', {
                cr: this.id,
                template_text: t,
                replacement_text: e,
              })
            );
          }),
          (l.ContentReplacer.prototype.setMatchStrings = function (t, e) {
            return (
              f(arguments.length, 2, 'setMatchStrings', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('ContentReplacer.setMatchStrings', {
                cr: this.id,
                start_str: t,
                end_str: e,
              })
            );
          }),
          (l.ContentReplacer.prototype.process = function (t) {
            return (
              f(arguments.length, 1, 'process', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('ContentReplacer.process', {
                cr: this.id,
                page: t.id,
              })
            );
          }),
          (l.Reflow.prototype.getHtml = function () {
            return l.sendWithPromise('Reflow.getHtml', { self: this.id });
          }),
          (l.Reflow.prototype.getAnnot = function (t) {
            return f(arguments.length, 1, 'getAnnot', '(string)', [[t, 'string']]), l.sendWithPromise('Reflow.getAnnot', { self: this.id, in_id: t });
          }),
          (l.Reflow.prototype.setAnnot = function (t) {
            return (
              f(arguments.length, 1, 'setAnnot', '(string)', [[t, 'string']]),
              l.sendWithPromise('Reflow.setAnnot', {
                self: this.id,
                in_json: t,
              })
            );
          }),
          (l.Reflow.prototype.setIncludeImages = function (t) {
            return (
              f(arguments.length, 1, 'setIncludeImages', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setIncludeImages', {
                self: this.id,
                include: t,
              })
            );
          }),
          (l.Reflow.prototype.setHTMLOutputTextMarkup = function (t) {
            return (
              f(arguments.length, 1, 'setHTMLOutputTextMarkup', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setHTMLOutputTextMarkup', {
                self: this.id,
                include: t,
              })
            );
          }),
          (l.Reflow.prototype.setMessageWhenNoReflowContent = function (t) {
            return (
              f(arguments.length, 1, 'setMessageWhenNoReflowContent', '(string)', [[t, 'string']]),
              l.sendWithPromise('Reflow.setMessageWhenNoReflowContent', {
                self: this.id,
                content: t,
              })
            );
          }),
          (l.Reflow.prototype.setMessageWhenReflowFailed = function (t) {
            return (
              f(arguments.length, 1, 'setMessageWhenReflowFailed', '(string)', [[t, 'string']]),
              l.sendWithPromise('Reflow.setMessageWhenReflowFailed', {
                self: this.id,
                content: t,
              })
            );
          }),
          (l.Reflow.prototype.setHideBackgroundImages = function (t) {
            return (
              f(arguments.length, 1, 'setHideBackgroundImages', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setHideBackgroundImages', {
                self: this.id,
                hide_background_images: t,
              })
            );
          }),
          (l.Reflow.prototype.setHideImagesUnderText = function (t) {
            return (
              f(arguments.length, 1, 'setHideImagesUnderText', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setHideImagesUnderText', {
                self: this.id,
                hide_images_under_text: t,
              })
            );
          }),
          (l.Reflow.prototype.setHideImagesUnderInvisibleText = function (t) {
            return (
              f(arguments.length, 1, 'setHideImagesUnderInvisibleText', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setHideImagesUnderInvisibleText', {
                self: this.id,
                hide_images_under_invisible_text: t,
              })
            );
          }),
          (l.Reflow.prototype.setDoNotReflowTextOverImages = function (t) {
            return (
              f(arguments.length, 1, 'setDoNotReflowTextOverImages', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setDoNotReflowTextOverImages', {
                self: this.id,
                do_not_reflow_text_over_images: t,
              })
            );
          }),
          (l.Reflow.prototype.setFontOverrideName = function (t) {
            return (
              f(arguments.length, 1, 'setFontOverrideName', '(string)', [[t, 'string']]),
              l.sendWithPromise('Reflow.setFontOverrideName', {
                self: this.id,
                font_family: t,
              })
            );
          }),
          (l.Reflow.prototype.setCustomStyles = function (t) {
            return (
              f(arguments.length, 1, 'setCustomStyles', '(string)', [[t, 'string']]),
              l.sendWithPromise('Reflow.setCustomStyles', {
                self: this.id,
                styles: t,
              })
            );
          }),
          (l.Reflow.prototype.setIncludeBBoxForRecognizedZones = function (t) {
            return (
              f(arguments.length, 1, 'setIncludeBBoxForRecognizedZones', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Reflow.setIncludeBBoxForRecognizedZones', {
                self: this.id,
                include: t,
              })
            );
          }),
          (l.Convert.fromXpsMem = function (t, e) {
            f(arguments.length, 2, 'fromXpsMem', '(PDFNet.PDFDoc, ArrayBuffer|TypedArray)', [
              [t, 'PDFDoc'],
              [e, 'ArrayBuffer'],
            ]);
            var n = b(e, !1);
            return l.sendWithPromise('convertFromXpsMem', {
              in_pdfdoc: t.id,
              buf: n,
            });
          }),
          (l.Convert.createReflow = function (t, e) {
            return (
              f(arguments.length, 2, 'createReflow', '(PDFNet.Page, string)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('convertCreateReflow', {
                  in_page: t.id,
                  json_zones: e,
                })
                .then(function (t) {
                  return D(l.Reflow, t);
                })
            );
          }),
          (l.Convert.fromTextWithBuffer = function (t, e, n) {
            return (
              void 0 === n && (n = new l.Obj('0')),
              f(arguments.length, 2, 'fromTextWithBuffer', '(PDFNet.PDFDoc, ArrayBuffer|TypedArray, PDFNet.Obj)', [
                [t, 'PDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'Object', l.Obj, 'Obj'],
              ]),
              (e = b(e, !1)),
              l.sendWithPromise('convertFromTextWithBuffer', {
                in_pdfdoc: t.id,
                in_filename: e,
                options: n.id,
              })
            );
          }),
          (l.Convert.toXpsBuffer = function (e, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 1, 'toXpsBuffer', '(PDFNet.PDFDoc, PDFNet.Obj)', [
                [e, 'PDFDoc'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.XPSOutputOptions'],
              ]),
              (t = y(t, 'PDFNet.Convert.XPSOutputOptions')).then(function (t) {
                return l
                  .sendWithPromise('convertToXpsBuffer', {
                    in_pdfdoc: e.id,
                    options: t.id,
                  })
                  .then(function (t) {
                    return new Uint8Array(t);
                  });
              })
            );
          }),
          (l.Convert.fileToXpsWithBuffer = function (e, n, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 2, 'fileToXpsWithBuffer', '(ArrayBuffer|TypedArray, string, PDFNet.Obj)', [
                [e, 'ArrayBuffer'],
                [n, 'string'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.XPSOutputOptions'],
              ]),
              n.startsWith('.') || (n = '.' + n),
              (e = b(e, !1)),
              (t = y(t, 'PDFNet.Convert.XPSOutputOptions')).then(function (t) {
                return l
                  .sendWithPromise('convertFileToXpsWithBuffer', {
                    in_inputFilename: e,
                    in_inputFilename_extension: n,
                    options: t.id,
                  })
                  .then(function (t) {
                    return new Uint8Array(t);
                  });
              })
            );
          }),
          (l.Convert.fileToXodWithBuffer = function (e, n, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 2, 'fileToXodWithBuffer', '(ArrayBuffer|TypedArray, string, PDFNet.Obj)', [
                [e, 'ArrayBuffer'],
                [n, 'string'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.XODOutputOptions'],
              ]),
              n.startsWith('.') || (n = '.' + n),
              (e = b(e, !1)),
              (t = y(t, 'PDFNet.Convert.XODOutputOptions')).then(function (t) {
                return l
                  .sendWithPromise('convertFileToXodWithBuffer', {
                    in_filename: e,
                    in_filename_extension: n,
                    options: t.id,
                  })
                  .then(function (t) {
                    return new Uint8Array(t);
                  });
              })
            );
          }),
          (l.Convert.toXodBuffer = function (e, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 1, 'toXodBuffer', '(PDFNet.PDFDoc, PDFNet.Obj)', [
                [e, 'PDFDoc'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.XODOutputOptions'],
              ]),
              (t = y(t, 'PDFNet.Convert.XODOutputOptions')).then(function (t) {
                return l
                  .sendWithPromise('convertToXodBuffer', {
                    in_pdfdoc: e.id,
                    options: t.id,
                  })
                  .then(function (t) {
                    return new Uint8Array(t);
                  });
              })
            );
          }),
          (l.ConversionMonitor.prototype.next = function () {
            return l.sendWithPromise('ConversionMonitor.next', {
              conversionMonitor: this.id,
            });
          }),
          (l.ConversionMonitor.prototype.ready = function () {
            return l.sendWithPromise('ConversionMonitor.ready', {
              conversionMonitor: this.id,
            });
          }),
          (l.ConversionMonitor.prototype.progress = function () {
            return l.sendWithPromise('ConversionMonitor.progress', {
              conversionMonitor: this.id,
            });
          }),
          (l.ConversionMonitor.prototype.filter = function () {
            return l
              .sendWithPromise('ConversionMonitor.filter', {
                conversionMonitor: this.id,
              })
              .then(function (t) {
                return D(l.Filter, t);
              });
          }),
          (l.Convert.officeToPdfWithFilter = function (e, n, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 2, 'officeToPdfWithFilter', '(PDFNet.PDFDoc, PDFNet.Filter, PDFNet.Obj)', [
                [e, 'PDFDoc'],
                [n, 'Object', l.Filter, 'Filter'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.ConversionOptions'],
              ]),
              0 != n.id && O(n.id),
              (t = y(t, 'PDFNet.Convert.ConversionOptions')).then(function (t) {
                return l.sendWithPromise('convertOfficeToPdfWithFilter', {
                  in_pdfdoc: e.id,
                  no_own_in_stream: n.id,
                  options: t.id,
                });
              })
            );
          }),
          (l.Convert.toPdfWithBuffer = function (t, e, n) {
            return (
              f(arguments.length, 3, 'toPdfWithBuffer', '(PDFNet.PDFDoc, ArrayBuffer|TypedArray, string)', [
                [t, 'PDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'string'],
              ]),
              n.startsWith('.') || (n = '.' + n),
              (e = b(e, !1)),
              l.sendWithPromise('convertToPdfWithBuffer', {
                in_pdfdoc: t.id,
                in_filename: e,
                in_filename_extension: n,
              })
            );
          }),
          (l.Convert.fromTiff = function (t, e) {
            return (
              f(arguments.length, 2, 'fromTiff', '(PDFNet.PDFDoc, PDFNet.Filter)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.Filter, 'Filter'],
              ]),
              l.sendWithPromise('convertFromTiff', {
                in_pdfdoc: t.id,
                in_data: e.id,
              })
            );
          }),
          (l.Convert.pageToHtml = function (t) {
            return (
              f(arguments.length, 1, 'pageToHtml', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]), l.sendWithPromise('convertPageToHtml', { page: t.id })
            );
          }),
          (l.Convert.pageToHtmlZoned = function (t, e) {
            return (
              f(arguments.length, 2, 'pageToHtmlZoned', '(PDFNet.Page, string)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'string'],
              ]),
              l.sendWithPromise('convertPageToHtmlZoned', {
                page: t.id,
                json_zones: e,
              })
            );
          }),
          (l.Convert.fileToTiffWithBuffer = function (e, n, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 2, 'fileToTiffWithBuffer', '(ArrayBuffer|TypedArray, string, PDFNet.Obj)', [
                [e, 'ArrayBuffer'],
                [n, 'string'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.TiffOutputOptions'],
              ]),
              n.startsWith('.') || (n = '.' + n),
              (e = b(e, !1)),
              (t = y(t, 'PDFNet.Convert.TiffOutputOptions')).then(function (t) {
                return l
                  .sendWithPromise('convertFileToTiffWithBuffer', {
                    in_filename: e,
                    in_filename_extension: n,
                    options: t.id,
                  })
                  .then(function (t) {
                    return new Uint8Array(t);
                  });
              })
            );
          }),
          (l.Convert.toTiffBuffer = function (e, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 1, 'toTiffBuffer', '(PDFNet.PDFDoc, PDFNet.Obj)', [
                [e, 'PDFDoc'],
                [t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.TiffOutputOptions'],
              ]),
              (t = y(t, 'PDFNet.Convert.TiffOutputOptions')).then(function (t) {
                return l
                  .sendWithPromise('convertToTiffBuffer', {
                    in_pdfdoc: e.id,
                    options: t.id,
                  })
                  .then(function (t) {
                    return new Uint8Array(t);
                  });
              })
            );
          }),
          (l.Date.init = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'init', '(number, number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              l
                .sendWithPromise('dateInit', {
                  year: t,
                  month: e,
                  day: n,
                  hour: i,
                  minute: r,
                  second: o,
                })
                .then(function (t) {
                  return new l.Date(t);
                })
            );
          }),
          (l.Date.prototype.isValid = function () {
            return P('isValid', this.yieldFunction), l.sendWithPromise('Date.isValid', { date: this });
          }),
          (l.Date.prototype.attach = function (t) {
            f(arguments.length, 1, 'attach', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]), P('attach', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Date.attach'),
              l.sendWithPromise('Date.attach', { date: this, d: t.id }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Date.prototype.update = function (t) {
            void 0 === t && (t = new l.Obj('__null')),
              f(arguments.length, 0, 'update', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              P('update', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Date.update'),
              l.sendWithPromise('Date.update', { date: this, d: t.id }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.date, e), t.result;
              })
            );
          }),
          (l.Date.prototype.setCurrentTime = function () {
            P('setCurrentTime', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Date.setCurrentTime'),
              l.sendWithPromise('Date.setCurrentTime', { date: this }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Destination.createXYZ = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'createXYZ', '(PDFNet.Page, number, number, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l
                .sendWithPromise('destinationCreateXYZ', {
                  page: t.id,
                  left: e,
                  top: n,
                  zoom: i,
                })
                .then(function (t) {
                  return _(l.Destination, t);
                })
            );
          }),
          (l.Destination.createFit = function (t) {
            return (
              f(arguments.length, 1, 'createFit', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('destinationCreateFit', { page: t.id }).then(function (t) {
                return _(l.Destination, t);
              })
            );
          }),
          (l.Destination.createFitH = function (t, e) {
            return (
              f(arguments.length, 2, 'createFitH', '(PDFNet.Page, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('destinationCreateFitH', {
                  page: t.id,
                  top: e,
                })
                .then(function (t) {
                  return _(l.Destination, t);
                })
            );
          }),
          (l.Destination.createFitV = function (t, e) {
            return (
              f(arguments.length, 2, 'createFitV', '(PDFNet.Page, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('destinationCreateFitV', {
                  page: t.id,
                  left: e,
                })
                .then(function (t) {
                  return _(l.Destination, t);
                })
            );
          }),
          (l.Destination.createFitR = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'createFitR', '(PDFNet.Page, number, number, number, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l
                .sendWithPromise('destinationCreateFitR', {
                  page: t.id,
                  left: e,
                  bottom: n,
                  right: i,
                  top: r,
                })
                .then(function (t) {
                  return _(l.Destination, t);
                })
            );
          }),
          (l.Destination.createFitB = function (t) {
            return (
              f(arguments.length, 1, 'createFitB', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('destinationCreateFitB', { page: t.id }).then(function (t) {
                return _(l.Destination, t);
              })
            );
          }),
          (l.Destination.createFitBH = function (t, e) {
            return (
              f(arguments.length, 2, 'createFitBH', '(PDFNet.Page, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('destinationCreateFitBH', {
                  page: t.id,
                  top: e,
                })
                .then(function (t) {
                  return _(l.Destination, t);
                })
            );
          }),
          (l.Destination.createFitBV = function (t, e) {
            return (
              f(arguments.length, 2, 'createFitBV', '(PDFNet.Page, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('destinationCreateFitBV', {
                  page: t.id,
                  left: e,
                })
                .then(function (t) {
                  return _(l.Destination, t);
                })
            );
          }),
          (l.Destination.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('destinationCreate', { dest: t.id }).then(function (t) {
                return _(l.Destination, t);
              })
            );
          }),
          (l.Destination.prototype.copy = function () {
            return l.sendWithPromise('Destination.copy', { d: this.id }).then(function (t) {
              return _(l.Destination, t);
            });
          }),
          (l.Destination.prototype.isValid = function () {
            return l.sendWithPromise('Destination.isValid', { dest: this.id });
          }),
          (l.Destination.prototype.getFitType = function () {
            return l.sendWithPromise('Destination.getFitType', {
              dest: this.id,
            });
          }),
          (l.Destination.prototype.getPage = function () {
            return l.sendWithPromise('Destination.getPage', { dest: this.id }).then(function (t) {
              return _(l.Page, t);
            });
          }),
          (l.Destination.prototype.setPage = function (t) {
            return (
              f(arguments.length, 1, 'setPage', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('Destination.setPage', {
                dest: this.id,
                page: t.id,
              })
            );
          }),
          (l.Destination.prototype.getSDFObj = function () {
            return l.sendWithPromise('Destination.getSDFObj', { dest: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Destination.prototype.getExplicitDestObj = function () {
            return l
              .sendWithPromise('Destination.getExplicitDestObj', {
                dest: this.id,
              })
              .then(function (t) {
                return _(l.Obj, t);
              });
          }),
          (l.GState.prototype.getTransform = function () {
            return l.sendWithPromise('GState.getTransform', { gs: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.GState.prototype.getStrokeColorSpace = function () {
            return l.sendWithPromise('GState.getStrokeColorSpace', { gs: this.id }).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.GState.prototype.getFillColorSpace = function () {
            return l.sendWithPromise('GState.getFillColorSpace', { gs: this.id }).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.GState.prototype.getStrokeColor = function () {
            return l.sendWithPromise('GState.getStrokeColor', { gs: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.GState.prototype.getStrokePattern = function () {
            return l.sendWithPromise('GState.getStrokePattern', { gs: this.id }).then(function (t) {
              return D(l.PatternColor, t);
            });
          }),
          (l.GState.prototype.getFillColor = function () {
            return l.sendWithPromise('GState.getFillColor', { gs: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.GState.prototype.getFillPattern = function () {
            return l.sendWithPromise('GState.getFillPattern', { gs: this.id }).then(function (t) {
              return D(l.PatternColor, t);
            });
          }),
          (l.GState.prototype.getFlatness = function () {
            return l.sendWithPromise('GState.getFlatness', { gs: this.id });
          }),
          (l.GState.prototype.getLineCap = function () {
            return l.sendWithPromise('GState.getLineCap', { gs: this.id });
          }),
          (l.GState.prototype.getLineJoin = function () {
            return l.sendWithPromise('GState.getLineJoin', { gs: this.id });
          }),
          (l.GState.prototype.getLineWidth = function () {
            return l.sendWithPromise('GState.getLineWidth', { gs: this.id });
          }),
          (l.GState.prototype.getMiterLimit = function () {
            return l.sendWithPromise('GState.getMiterLimit', { gs: this.id });
          }),
          (l.GState.prototype.getPhase = function () {
            return l.sendWithPromise('GState.getPhase', { gs: this.id });
          }),
          (l.GState.prototype.getCharSpacing = function () {
            return l.sendWithPromise('GState.getCharSpacing', { gs: this.id });
          }),
          (l.GState.prototype.getWordSpacing = function () {
            return l.sendWithPromise('GState.getWordSpacing', { gs: this.id });
          }),
          (l.GState.prototype.getHorizontalScale = function () {
            return l.sendWithPromise('GState.getHorizontalScale', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getLeading = function () {
            return l.sendWithPromise('GState.getLeading', { gs: this.id });
          }),
          (l.GState.prototype.getFont = function () {
            return l.sendWithPromise('GState.getFont', { gs: this.id }).then(function (t) {
              return D(l.Font, t);
            });
          }),
          (l.GState.prototype.getFontSize = function () {
            return l.sendWithPromise('GState.getFontSize', { gs: this.id });
          }),
          (l.GState.prototype.getTextRenderMode = function () {
            return l.sendWithPromise('GState.getTextRenderMode', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getTextRise = function () {
            return l.sendWithPromise('GState.getTextRise', { gs: this.id });
          }),
          (l.GState.prototype.isTextKnockout = function () {
            return l.sendWithPromise('GState.isTextKnockout', { gs: this.id });
          }),
          (l.GState.prototype.getRenderingIntent = function () {
            return l.sendWithPromise('GState.getRenderingIntent', {
              gs: this.id,
            });
          }),
          (l.GState.getRenderingIntentType = function (t) {
            return (
              f(arguments.length, 1, 'getRenderingIntentType', '(string)', [[t, 'string']]), l.sendWithPromise('gStateGetRenderingIntentType', { name: t })
            );
          }),
          (l.GState.prototype.getBlendMode = function () {
            return l.sendWithPromise('GState.getBlendMode', { gs: this.id });
          }),
          (l.GState.prototype.getFillOpacity = function () {
            return l.sendWithPromise('GState.getFillOpacity', { gs: this.id });
          }),
          (l.GState.prototype.getStrokeOpacity = function () {
            return l.sendWithPromise('GState.getStrokeOpacity', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getAISFlag = function () {
            return l.sendWithPromise('GState.getAISFlag', { gs: this.id });
          }),
          (l.GState.prototype.getSoftMask = function () {
            return l.sendWithPromise('GState.getSoftMask', { gs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.GState.prototype.getSoftMaskTransform = function () {
            return l.sendWithPromise('GState.getSoftMaskTransform', { gs: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.GState.prototype.getStrokeOverprint = function () {
            return l.sendWithPromise('GState.getStrokeOverprint', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getFillOverprint = function () {
            return l.sendWithPromise('GState.getFillOverprint', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getOverprintMode = function () {
            return l.sendWithPromise('GState.getOverprintMode', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getAutoStrokeAdjust = function () {
            return l.sendWithPromise('GState.getAutoStrokeAdjust', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getSmoothnessTolerance = function () {
            return l.sendWithPromise('GState.getSmoothnessTolerance', {
              gs: this.id,
            });
          }),
          (l.GState.prototype.getTransferFunct = function () {
            return l.sendWithPromise('GState.getTransferFunct', { gs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.GState.prototype.getBlackGenFunct = function () {
            return l.sendWithPromise('GState.getBlackGenFunct', { gs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.GState.prototype.getUCRFunct = function () {
            return l.sendWithPromise('GState.getUCRFunct', { gs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.GState.prototype.getHalftone = function () {
            return l.sendWithPromise('GState.getHalftone', { gs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.GState.prototype.setTransformMatrix = function (t) {
            return (
              f(arguments.length, 1, 'setTransformMatrix', '(PDFNet.Matrix2D)', [[t, 'Structure', l.Matrix2D, 'Matrix2D']]),
              F('setTransformMatrix', [[t, 0]]),
              l.sendWithPromise('GState.setTransformMatrix', {
                gs: this.id,
                mtx: t,
              })
            );
          }),
          (l.GState.prototype.setTransform = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'setTransform', '(number, number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              l.sendWithPromise('GState.setTransform', {
                gs: this.id,
                a: t,
                b: e,
                c: n,
                d: i,
                h: r,
                v: o,
              })
            );
          }),
          (l.GState.prototype.concatMatrix = function (t) {
            return (
              f(arguments.length, 1, 'concatMatrix', '(PDFNet.Matrix2D)', [[t, 'Structure', l.Matrix2D, 'Matrix2D']]),
              F('concatMatrix', [[t, 0]]),
              l.sendWithPromise('GState.concatMatrix', { gs: this.id, mtx: t })
            );
          }),
          (l.GState.prototype.concat = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'concat', '(number, number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              l.sendWithPromise('GState.concat', {
                gs: this.id,
                a: t,
                b: e,
                c: n,
                d: i,
                h: r,
                v: o,
              })
            );
          }),
          (l.GState.prototype.setStrokeColorSpace = function (t) {
            return (
              f(arguments.length, 1, 'setStrokeColorSpace', '(PDFNet.ColorSpace)', [[t, 'Object', l.ColorSpace, 'ColorSpace']]),
              l.sendWithPromise('GState.setStrokeColorSpace', {
                gs: this.id,
                cs: t.id,
              })
            );
          }),
          (l.GState.prototype.setFillColorSpace = function (t) {
            return (
              f(arguments.length, 1, 'setFillColorSpace', '(PDFNet.ColorSpace)', [[t, 'Object', l.ColorSpace, 'ColorSpace']]),
              l.sendWithPromise('GState.setFillColorSpace', {
                gs: this.id,
                cs: t.id,
              })
            );
          }),
          (l.GState.prototype.setStrokeColorWithColorPt = function (t) {
            return (
              f(arguments.length, 1, 'setStrokeColorWithColorPt', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('GState.setStrokeColorWithColorPt', {
                gs: this.id,
                c: t.id,
              })
            );
          }),
          (l.GState.prototype.setStrokeColorWithPattern = function (t) {
            return (
              f(arguments.length, 1, 'setStrokeColorWithPattern', '(PDFNet.PatternColor)', [[t, 'Object', l.PatternColor, 'PatternColor']]),
              l.sendWithPromise('GState.setStrokeColorWithPattern', {
                gs: this.id,
                pattern: t.id,
              })
            );
          }),
          (l.GState.prototype.setStrokeColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setStrokeColor', '(PDFNet.PatternColor, PDFNet.ColorPt)', [
                [t, 'Object', l.PatternColor, 'PatternColor'],
                [e, 'Object', l.ColorPt, 'ColorPt'],
              ]),
              l.sendWithPromise('GState.setStrokeColor', {
                gs: this.id,
                pattern: t.id,
                c: e.id,
              })
            );
          }),
          (l.GState.prototype.setFillColorWithColorPt = function (t) {
            return (
              f(arguments.length, 1, 'setFillColorWithColorPt', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('GState.setFillColorWithColorPt', {
                gs: this.id,
                c: t.id,
              })
            );
          }),
          (l.GState.prototype.setFillColorWithPattern = function (t) {
            return (
              f(arguments.length, 1, 'setFillColorWithPattern', '(PDFNet.PatternColor)', [[t, 'Object', l.PatternColor, 'PatternColor']]),
              l.sendWithPromise('GState.setFillColorWithPattern', {
                gs: this.id,
                pattern: t.id,
              })
            );
          }),
          (l.GState.prototype.setFillColor = function (t, e) {
            return (
              f(arguments.length, 2, 'setFillColor', '(PDFNet.PatternColor, PDFNet.ColorPt)', [
                [t, 'Object', l.PatternColor, 'PatternColor'],
                [e, 'Object', l.ColorPt, 'ColorPt'],
              ]),
              l.sendWithPromise('GState.setFillColor', {
                gs: this.id,
                pattern: t.id,
                c: e.id,
              })
            );
          }),
          (l.GState.prototype.setFlatness = function (t) {
            return (
              f(arguments.length, 1, 'setFlatness', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setFlatness', {
                gs: this.id,
                flatness: t,
              })
            );
          }),
          (l.GState.prototype.setLineCap = function (t) {
            return f(arguments.length, 1, 'setLineCap', '(number)', [[t, 'number']]), l.sendWithPromise('GState.setLineCap', { gs: this.id, cap: t });
          }),
          (l.GState.prototype.setLineJoin = function (t) {
            return f(arguments.length, 1, 'setLineJoin', '(number)', [[t, 'number']]), l.sendWithPromise('GState.setLineJoin', { gs: this.id, join: t });
          }),
          (l.GState.prototype.setLineWidth = function (t) {
            return (
              f(arguments.length, 1, 'setLineWidth', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setLineWidth', {
                gs: this.id,
                width: t,
              })
            );
          }),
          (l.GState.prototype.setMiterLimit = function (t) {
            return (
              f(arguments.length, 1, 'setMiterLimit', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setMiterLimit', {
                gs: this.id,
                miter_limit: t,
              })
            );
          }),
          (l.GState.prototype.setDashPattern = function (t, e) {
            return (
              f(arguments.length, 2, 'setDashPattern', '(Array<number>, number)', [
                [t, 'Array'],
                [e, 'number'],
              ]),
              l.sendWithPromise('GState.setDashPattern', {
                gs: this.id,
                dash_array: t,
                phase: e,
              })
            );
          }),
          (l.GState.prototype.setCharSpacing = function (t) {
            return (
              f(arguments.length, 1, 'setCharSpacing', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setCharSpacing', {
                gs: this.id,
                char_spacing: t,
              })
            );
          }),
          (l.GState.prototype.setWordSpacing = function (t) {
            return (
              f(arguments.length, 1, 'setWordSpacing', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setWordSpacing', {
                gs: this.id,
                word_spacing: t,
              })
            );
          }),
          (l.GState.prototype.setHorizontalScale = function (t) {
            return (
              f(arguments.length, 1, 'setHorizontalScale', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setHorizontalScale', {
                gs: this.id,
                hscale: t,
              })
            );
          }),
          (l.GState.prototype.setLeading = function (t) {
            return (
              f(arguments.length, 1, 'setLeading', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setLeading', {
                gs: this.id,
                leading: t,
              })
            );
          }),
          (l.GState.prototype.setFont = function (t, e) {
            return (
              f(arguments.length, 2, 'setFont', '(PDFNet.Font, number)', [
                [t, 'Object', l.Font, 'Font'],
                [e, 'number'],
              ]),
              l.sendWithPromise('GState.setFont', {
                gs: this.id,
                font: t.id,
                font_sz: e,
              })
            );
          }),
          (l.GState.prototype.setTextRenderMode = function (t) {
            return (
              f(arguments.length, 1, 'setTextRenderMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setTextRenderMode', {
                gs: this.id,
                rmode: t,
              })
            );
          }),
          (l.GState.prototype.setTextRise = function (t) {
            return f(arguments.length, 1, 'setTextRise', '(number)', [[t, 'number']]), l.sendWithPromise('GState.setTextRise', { gs: this.id, rise: t });
          }),
          (l.GState.prototype.setTextKnockout = function (t) {
            return (
              f(arguments.length, 1, 'setTextKnockout', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('GState.setTextKnockout', {
                gs: this.id,
                knockout: t,
              })
            );
          }),
          (l.GState.prototype.setRenderingIntent = function (t) {
            return (
              f(arguments.length, 1, 'setRenderingIntent', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setRenderingIntent', {
                gs: this.id,
                intent: t,
              })
            );
          }),
          (l.GState.prototype.setBlendMode = function (t) {
            return f(arguments.length, 1, 'setBlendMode', '(number)', [[t, 'number']]), l.sendWithPromise('GState.setBlendMode', { gs: this.id, BM: t });
          }),
          (l.GState.prototype.setFillOpacity = function (t) {
            return f(arguments.length, 1, 'setFillOpacity', '(number)', [[t, 'number']]), l.sendWithPromise('GState.setFillOpacity', { gs: this.id, ca: t });
          }),
          (l.GState.prototype.setStrokeOpacity = function (t) {
            return (
              f(arguments.length, 1, 'setStrokeOpacity', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setStrokeOpacity', {
                gs: this.id,
                ca: t,
              })
            );
          }),
          (l.GState.prototype.setAISFlag = function (t) {
            return f(arguments.length, 1, 'setAISFlag', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('GState.setAISFlag', { gs: this.id, AIS: t });
          }),
          (l.GState.prototype.setSoftMask = function (t) {
            return (
              f(arguments.length, 1, 'setSoftMask', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('GState.setSoftMask', { gs: this.id, SM: t.id })
            );
          }),
          (l.GState.prototype.setStrokeOverprint = function (t) {
            return (
              f(arguments.length, 1, 'setStrokeOverprint', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('GState.setStrokeOverprint', {
                gs: this.id,
                OP: t,
              })
            );
          }),
          (l.GState.prototype.setFillOverprint = function (t) {
            return (
              f(arguments.length, 1, 'setFillOverprint', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('GState.setFillOverprint', {
                gs: this.id,
                op: t,
              })
            );
          }),
          (l.GState.prototype.setOverprintMode = function (t) {
            return (
              f(arguments.length, 1, 'setOverprintMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setOverprintMode', {
                gs: this.id,
                OPM: t,
              })
            );
          }),
          (l.GState.prototype.setAutoStrokeAdjust = function (t) {
            return (
              f(arguments.length, 1, 'setAutoStrokeAdjust', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('GState.setAutoStrokeAdjust', {
                gs: this.id,
                SA: t,
              })
            );
          }),
          (l.GState.prototype.setSmoothnessTolerance = function (t) {
            return (
              f(arguments.length, 1, 'setSmoothnessTolerance', '(number)', [[t, 'number']]),
              l.sendWithPromise('GState.setSmoothnessTolerance', {
                gs: this.id,
                SM: t,
              })
            );
          }),
          (l.GState.prototype.setBlackGenFunct = function (t) {
            return (
              f(arguments.length, 1, 'setBlackGenFunct', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('GState.setBlackGenFunct', {
                gs: this.id,
                BG: t.id,
              })
            );
          }),
          (l.GState.prototype.setUCRFunct = function (t) {
            return (
              f(arguments.length, 1, 'setUCRFunct', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('GState.setUCRFunct', {
                gs: this.id,
                UCR: t.id,
              })
            );
          }),
          (l.GState.prototype.setTransferFunct = function (t) {
            return (
              f(arguments.length, 1, 'setTransferFunct', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('GState.setTransferFunct', {
                gs: this.id,
                TR: t.id,
              })
            );
          }),
          (l.GState.prototype.setHalftone = function (t) {
            return (
              f(arguments.length, 1, 'setHalftone', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('GState.setHalftone', { gs: this.id, HT: t.id })
            );
          }),
          (l.Element.prototype.getType = function () {
            return l.sendWithPromise('Element.getType', { e: this.id });
          }),
          (l.Element.prototype.getGState = function () {
            return l.sendWithPromise('Element.getGState', { e: this.id }).then(function (t) {
              return _(l.GState, t);
            });
          }),
          (l.Element.prototype.getCTM = function () {
            return l.sendWithPromise('Element.getCTM', { e: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.Element.prototype.getParentStructElement = function () {
            return l.sendWithPromise('Element.getParentStructElement', { e: this.id }).then(function (t) {
              return new l.SElement(t);
            });
          }),
          (l.Element.prototype.getStructMCID = function () {
            return l.sendWithPromise('Element.getStructMCID', { e: this.id });
          }),
          (l.Element.prototype.isOCVisible = function () {
            return l.sendWithPromise('Element.isOCVisible', { e: this.id });
          }),
          (l.Element.prototype.isClippingPath = function () {
            return l.sendWithPromise('Element.isClippingPath', { e: this.id });
          }),
          (l.Element.prototype.isStroked = function () {
            return l.sendWithPromise('Element.isStroked', { e: this.id });
          }),
          (l.Element.prototype.isFilled = function () {
            return l.sendWithPromise('Element.isFilled', { e: this.id });
          }),
          (l.Element.prototype.isWindingFill = function () {
            return l.sendWithPromise('Element.isWindingFill', { e: this.id });
          }),
          (l.Element.prototype.isClipWindingFill = function () {
            return l.sendWithPromise('Element.isClipWindingFill', {
              e: this.id,
            });
          }),
          (l.Element.prototype.setPathClip = function (t) {
            return f(arguments.length, 1, 'setPathClip', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('Element.setPathClip', { e: this.id, clip: t });
          }),
          (l.Element.prototype.setPathStroke = function (t) {
            return (
              f(arguments.length, 1, 'setPathStroke', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Element.setPathStroke', {
                e: this.id,
                stroke: t,
              })
            );
          }),
          (l.Element.prototype.setPathFill = function (t) {
            return f(arguments.length, 1, 'setPathFill', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('Element.setPathFill', { e: this.id, fill: t });
          }),
          (l.Element.prototype.setWindingFill = function (t) {
            return (
              f(arguments.length, 1, 'setWindingFill', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Element.setWindingFill', {
                e: this.id,
                winding_rule: t,
              })
            );
          }),
          (l.Element.prototype.setClipWindingFill = function (t) {
            return (
              f(arguments.length, 1, 'setClipWindingFill', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Element.setClipWindingFill', {
                e: this.id,
                winding_rule: t,
              })
            );
          }),
          (l.Element.prototype.setPathTypes = function (t, e) {
            return (
              f(arguments.length, 2, 'setPathTypes', '(string, number)', [
                [t, 'string'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Element.setPathTypes', {
                e: this.id,
                in_seg_types: t,
                count: e,
              })
            );
          }),
          (l.Element.prototype.getXObject = function () {
            return l.sendWithPromise('Element.getXObject', { e: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Element.prototype.getImageData = function () {
            return l.sendWithPromise('Element.getImageData', { e: this.id }).then(function (t) {
              return _(l.Filter, t);
            });
          }),
          (l.Element.prototype.getImageDataSize = function () {
            return l.sendWithPromise('Element.getImageDataSize', {
              e: this.id,
            });
          }),
          (l.Element.prototype.getImageColorSpace = function () {
            return l.sendWithPromise('Element.getImageColorSpace', { e: this.id }).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.Element.prototype.getImageWidth = function () {
            return l.sendWithPromise('Element.getImageWidth', { e: this.id });
          }),
          (l.Element.prototype.getImageHeight = function () {
            return l.sendWithPromise('Element.getImageHeight', { e: this.id });
          }),
          (l.Element.prototype.getDecodeArray = function () {
            return l.sendWithPromise('Element.getDecodeArray', { e: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Element.prototype.getBitsPerComponent = function () {
            return l.sendWithPromise('Element.getBitsPerComponent', {
              e: this.id,
            });
          }),
          (l.Element.prototype.getComponentNum = function () {
            return l.sendWithPromise('Element.getComponentNum', { e: this.id });
          }),
          (l.Element.prototype.isImageMask = function () {
            return l.sendWithPromise('Element.isImageMask', { e: this.id });
          }),
          (l.Element.prototype.isImageInterpolate = function () {
            return l.sendWithPromise('Element.isImageInterpolate', {
              e: this.id,
            });
          }),
          (l.Element.prototype.getMask = function () {
            return l.sendWithPromise('Element.getMask', { e: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Element.prototype.getImageRenderingIntent = function () {
            return l.sendWithPromise('Element.getImageRenderingIntent', {
              e: this.id,
            });
          }),
          (l.Element.prototype.getTextString = function () {
            return l.sendWithPromise('Element.getTextString', { e: this.id });
          }),
          (l.Element.prototype.getTextMatrix = function () {
            return l.sendWithPromise('Element.getTextMatrix', { e: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.Element.prototype.getCharIterator = function () {
            return l.sendWithPromise('Element.getCharIterator', { e: this.id }).then(function (t) {
              return D(l.Iterator, t, 'CharData');
            });
          }),
          (l.Element.prototype.getTextLength = function () {
            return l.sendWithPromise('Element.getTextLength', { e: this.id });
          }),
          (l.Element.prototype.getPosAdjustment = function () {
            return l.sendWithPromise('Element.getPosAdjustment', {
              e: this.id,
            });
          }),
          (l.Element.prototype.getNewTextLineOffset = function () {
            return l.sendWithPromise('Element.getNewTextLineOffset', {
              e: this.id,
            });
          }),
          (l.Element.prototype.hasTextMatrix = function () {
            return l.sendWithPromise('Element.hasTextMatrix', { e: this.id });
          }),
          (l.Element.prototype.setTextData = function (t) {
            f(arguments.length, 1, 'setTextData', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('Element.setTextData', {
              e: this.id,
              buf_text_data: e,
            });
          }),
          (l.Element.prototype.setTextMatrix = function (t) {
            return (
              f(arguments.length, 1, 'setTextMatrix', '(PDFNet.Matrix2D)', [[t, 'Structure', l.Matrix2D, 'Matrix2D']]),
              F('setTextMatrix', [[t, 0]]),
              l.sendWithPromise('Element.setTextMatrix', { e: this.id, mtx: t })
            );
          }),
          (l.Element.prototype.setTextMatrixEntries = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'setTextMatrixEntries', '(number, number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              l.sendWithPromise('Element.setTextMatrixEntries', {
                e: this.id,
                a: t,
                b: e,
                c: n,
                d: i,
                h: r,
                v: o,
              })
            );
          }),
          (l.Element.prototype.setPosAdjustment = function (t) {
            return (
              f(arguments.length, 1, 'setPosAdjustment', '(number)', [[t, 'number']]),
              l.sendWithPromise('Element.setPosAdjustment', {
                e: this.id,
                adjust: t,
              })
            );
          }),
          (l.Element.prototype.updateTextMetrics = function () {
            return l.sendWithPromise('Element.updateTextMetrics', {
              e: this.id,
            });
          }),
          (l.Element.prototype.setNewTextLineOffset = function (t, e) {
            return (
              f(arguments.length, 2, 'setNewTextLineOffset', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Element.setNewTextLineOffset', {
                e: this.id,
                dx: t,
                dy: e,
              })
            );
          }),
          (l.Element.prototype.getShading = function () {
            return l.sendWithPromise('Element.getShading', { e: this.id }).then(function (t) {
              return D(l.Shading, t);
            });
          }),
          (l.Element.prototype.getMCPropertyDict = function () {
            return l.sendWithPromise('Element.getMCPropertyDict', { e: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Element.prototype.getMCTag = function () {
            return l.sendWithPromise('Element.getMCTag', { e: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ShapedText.prototype.getScale = function () {
            return l.sendWithPromise('ShapedText.getScale', { self: this.id });
          }),
          (l.ShapedText.prototype.getShapingStatus = function () {
            return l.sendWithPromise('ShapedText.getShapingStatus', {
              self: this.id,
            });
          }),
          (l.ShapedText.prototype.getFailureReason = function () {
            return l.sendWithPromise('ShapedText.getFailureReason', {
              self: this.id,
            });
          }),
          (l.ShapedText.prototype.getText = function () {
            return l.sendWithPromise('ShapedText.getText', { self: this.id });
          }),
          (l.ShapedText.prototype.getNumGlyphs = function () {
            return l.sendWithPromise('ShapedText.getNumGlyphs', {
              self: this.id,
            });
          }),
          (l.ShapedText.prototype.getGlyph = function (t) {
            return (
              f(arguments.length, 1, 'getGlyph', '(number)', [[t, 'number']]),
              l.sendWithPromise('ShapedText.getGlyph', {
                self: this.id,
                index: t,
              })
            );
          }),
          (l.ShapedText.prototype.getGlyphXPos = function (t) {
            return (
              f(arguments.length, 1, 'getGlyphXPos', '(number)', [[t, 'number']]),
              l.sendWithPromise('ShapedText.getGlyphXPos', {
                self: this.id,
                index: t,
              })
            );
          }),
          (l.ShapedText.prototype.getGlyphYPos = function (t) {
            return (
              f(arguments.length, 1, 'getGlyphYPos', '(number)', [[t, 'number']]),
              l.sendWithPromise('ShapedText.getGlyphYPos', {
                self: this.id,
                index: t,
              })
            );
          }),
          (l.ElementBuilder.create = function () {
            return l.sendWithPromise('elementBuilderCreate', {}).then(function (t) {
              return D(l.ElementBuilder, t);
            });
          }),
          (l.ElementBuilder.prototype.reset = function (t) {
            return (
              void 0 === t && (t = new l.GState('0')),
              f(arguments.length, 0, 'reset', '(PDFNet.GState)', [[t, 'Object', l.GState, 'GState']]),
              l.sendWithPromise('ElementBuilder.reset', {
                b: this.id,
                gs: t.id,
              })
            );
          }),
          (l.ElementBuilder.prototype.createImage = function (t) {
            return (
              f(arguments.length, 1, 'createImage', '(PDFNet.Image)', [[t, 'Object', l.Image, 'Image']]),
              l
                .sendWithPromise('ElementBuilder.createImage', {
                  b: this.id,
                  img: t.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createImageFromMatrix = function (t, e) {
            return (
              f(arguments.length, 2, 'createImageFromMatrix', '(PDFNet.Image, PDFNet.Matrix2D)', [
                [t, 'Object', l.Image, 'Image'],
                [e, 'Structure', l.Matrix2D, 'Matrix2D'],
              ]),
              F('createImageFromMatrix', [[e, 1]]),
              l
                .sendWithPromise('ElementBuilder.createImageFromMatrix', {
                  b: this.id,
                  img: t.id,
                  mtx: e,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createImageScaled = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'createImageScaled', '(PDFNet.Image, number, number, number, number)', [
                [t, 'Object', l.Image, 'Image'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createImageScaled', {
                  b: this.id,
                  img: t.id,
                  x: e,
                  y: n,
                  hscale: i,
                  vscale: r,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createGroupBegin = function () {
            return l
              .sendWithPromise('ElementBuilder.createGroupBegin', {
                b: this.id,
              })
              .then(function (t) {
                return _(l.Element, t);
              });
          }),
          (l.ElementBuilder.prototype.createGroupEnd = function () {
            return l.sendWithPromise('ElementBuilder.createGroupEnd', { b: this.id }).then(function (t) {
              return _(l.Element, t);
            });
          }),
          (l.ElementBuilder.prototype.createShading = function (t) {
            return (
              f(arguments.length, 1, 'createShading', '(PDFNet.Shading)', [[t, 'Object', l.Shading, 'Shading']]),
              l
                .sendWithPromise('ElementBuilder.createShading', {
                  b: this.id,
                  sh: t.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createFormFromStream = function (t) {
            return (
              f(arguments.length, 1, 'createFormFromStream', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l
                .sendWithPromise('ElementBuilder.createFormFromStream', {
                  b: this.id,
                  form: t.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createFormFromPage = function (t) {
            return (
              f(arguments.length, 1, 'createFormFromPage', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l
                .sendWithPromise('ElementBuilder.createFormFromPage', {
                  b: this.id,
                  page: t.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createFormFromDoc = function (t, e) {
            return (
              f(arguments.length, 2, 'createFormFromDoc', '(PDFNet.Page, PDFNet.PDFDoc)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'PDFDoc'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createFormFromDoc', {
                  b: this.id,
                  page: t.id,
                  doc: e.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createTextBeginWithFont = function (t, e) {
            return (
              f(arguments.length, 2, 'createTextBeginWithFont', '(PDFNet.Font, number)', [
                [t, 'Object', l.Font, 'Font'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createTextBeginWithFont', {
                  b: this.id,
                  font: t.id,
                  font_sz: e,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createTextBegin = function () {
            return l.sendWithPromise('ElementBuilder.createTextBegin', { b: this.id }).then(function (t) {
              return _(l.Element, t);
            });
          }),
          (l.ElementBuilder.prototype.createTextEnd = function () {
            return l.sendWithPromise('ElementBuilder.createTextEnd', { b: this.id }).then(function (t) {
              return _(l.Element, t);
            });
          }),
          (l.ElementBuilder.prototype.createTextRun = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createTextRun', '(string, PDFNet.Font, number)', [
                [t, 'string'],
                [e, 'Object', l.Font, 'Font'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createTextRun', {
                  b: this.id,
                  text_data: t,
                  font: e.id,
                  font_sz: n,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createTextRunUnsigned = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createTextRunUnsigned', '(string, PDFNet.Font, number)', [
                [t, 'string'],
                [e, 'Object', l.Font, 'Font'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createTextRunUnsigned', {
                  b: this.id,
                  text_data: t,
                  font: e.id,
                  font_sz: n,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createNewTextRun = function (t) {
            return (
              f(arguments.length, 1, 'createNewTextRun', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementBuilder.createNewTextRun', {
                  b: this.id,
                  text_data: t,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createNewTextRunUnsigned = function (t) {
            return (
              f(arguments.length, 1, 'createNewTextRunUnsigned', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementBuilder.createNewTextRunUnsigned', {
                  b: this.id,
                  text_data: t,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createShapedTextRun = function (t) {
            return (
              f(arguments.length, 1, 'createShapedTextRun', '(PDFNet.ShapedText)', [[t, 'Object', l.ShapedText, 'ShapedText']]),
              l
                .sendWithPromise('ElementBuilder.createShapedTextRun', {
                  b: this.id,
                  text_data: t.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createTextNewLineWithOffset = function (t, e) {
            return (
              f(arguments.length, 2, 'createTextNewLineWithOffset', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createTextNewLineWithOffset', {
                  b: this.id,
                  dx: t,
                  dy: e,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createTextNewLine = function () {
            return l
              .sendWithPromise('ElementBuilder.createTextNewLine', {
                b: this.id,
              })
              .then(function (t) {
                return _(l.Element, t);
              });
          }),
          (l.ElementBuilder.prototype.createPath = function (t, e) {
            f(arguments.length, 2, 'createPath', '(Array<number>, ArrayBuffer|TypedArray)', [
              [t, 'Array'],
              [e, 'ArrayBuffer'],
            ]);
            var n = b(e, !1);
            return l
              .sendWithPromise('ElementBuilder.createPath', {
                b: this.id,
                points_list: t,
                buf_seg_types: n,
              })
              .then(function (t) {
                return _(l.Element, t);
              });
          }),
          (l.ElementBuilder.prototype.createRect = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'createRect', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createRect', {
                  b: this.id,
                  x: t,
                  y: e,
                  width: n,
                  height: i,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createEllipse = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'createEllipse', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createEllipse', {
                  b: this.id,
                  x: t,
                  y: e,
                  width: n,
                  height: i,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.pathBegin = function () {
            return l.sendWithPromise('ElementBuilder.pathBegin', {
              b: this.id,
            });
          }),
          (l.ElementBuilder.prototype.pathEnd = function () {
            return l.sendWithPromise('ElementBuilder.pathEnd', { b: this.id }).then(function (t) {
              return _(l.Element, t);
            });
          }),
          (l.ElementBuilder.prototype.rect = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'rect', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.rect', {
                b: this.id,
                x: t,
                y: e,
                width: n,
                height: i,
              })
            );
          }),
          (l.ElementBuilder.prototype.ellipse = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'ellipse', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.ellipse', {
                b: this.id,
                x: t,
                y: e,
                width: n,
                height: i,
              })
            );
          }),
          (l.ElementBuilder.prototype.moveTo = function (t, e) {
            return (
              f(arguments.length, 2, 'moveTo', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.moveTo', {
                b: this.id,
                x: t,
                y: e,
              })
            );
          }),
          (l.ElementBuilder.prototype.lineTo = function (t, e) {
            return (
              f(arguments.length, 2, 'lineTo', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.lineTo', {
                b: this.id,
                x: t,
                y: e,
              })
            );
          }),
          (l.ElementBuilder.prototype.curveTo = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'curveTo', '(number, number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.curveTo', {
                b: this.id,
                cx1: t,
                cy1: e,
                cx2: n,
                cy2: i,
                x2: r,
                y2: o,
              })
            );
          }),
          (l.ElementBuilder.prototype.arcTo = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'arcTo', '(number, number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.arcTo', {
                b: this.id,
                x: t,
                y: e,
                width: n,
                height: i,
                start: r,
                extent: o,
              })
            );
          }),
          (l.ElementBuilder.prototype.arcTo2 = function (t, e, n, i, r, o, s) {
            return (
              f(arguments.length, 7, 'arcTo2', '(number, number, number, boolean, boolean, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'boolean'],
                [r, 'boolean'],
                [o, 'number'],
                [s, 'number'],
              ]),
              l.sendWithPromise('ElementBuilder.arcTo2', {
                b: this.id,
                xr: t,
                yr: e,
                rx: n,
                isLargeArc: i,
                sweep: r,
                endX: o,
                endY: s,
              })
            );
          }),
          (l.ElementBuilder.prototype.closePath = function () {
            return l.sendWithPromise('ElementBuilder.closePath', {
              b: this.id,
            });
          }),
          (l.ElementBuilder.prototype.createMarkedContentBeginInlineProperties = function (t) {
            return (
              f(arguments.length, 1, 'createMarkedContentBeginInlineProperties', '(string)', [[t, 'string']]),
              l.sendWithPromise('ElementBuilder.createMarkedContentBeginInlineProperties', { b: this.id, tag: t }).then(function (t) {
                return _(l.Element, t);
              })
            );
          }),
          (l.ElementBuilder.prototype.createMarkedContentBegin = function (t, e) {
            return (
              f(arguments.length, 2, 'createMarkedContentBegin', '(string, PDFNet.Obj)', [
                [t, 'string'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createMarkedContentBegin', {
                  b: this.id,
                  tag: t,
                  property_dict: e.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementBuilder.prototype.createMarkedContentEnd = function () {
            return l
              .sendWithPromise('ElementBuilder.createMarkedContentEnd', {
                b: this.id,
              })
              .then(function (t) {
                return _(l.Element, t);
              });
          }),
          (l.ElementBuilder.prototype.createMarkedContentPointInlineProperties = function (t) {
            return (
              f(arguments.length, 1, 'createMarkedContentPointInlineProperties', '(string)', [[t, 'string']]),
              l.sendWithPromise('ElementBuilder.createMarkedContentPointInlineProperties', { b: this.id, tag: t }).then(function (t) {
                return _(l.Element, t);
              })
            );
          }),
          (l.ElementBuilder.prototype.createMarkedContentPoint = function (t, e) {
            return (
              f(arguments.length, 2, 'createMarkedContentPoint', '(string, PDFNet.Obj)', [
                [t, 'string'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('ElementBuilder.createMarkedContentPoint', {
                  b: this.id,
                  tag: t,
                  property_dict: e.id,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.ElementReader.create = function () {
            return l.sendWithPromise('elementReaderCreate', {}).then(function (t) {
              return D(l.ElementReader, t);
            });
          }),
          (l.ElementReader.prototype.beginOnPage = function (t, e) {
            return (
              void 0 === e && (e = new l.OCGContext('0')),
              f(arguments.length, 1, 'beginOnPage', '(PDFNet.Page, PDFNet.OCGContext)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'Object', l.OCGContext, 'OCGContext'],
              ]),
              l.sendWithPromise('ElementReader.beginOnPage', {
                r: this.id,
                page: t.id,
                ctx: e.id,
              })
            );
          }),
          (l.ElementReader.prototype.begin = function (t, e, n) {
            return (
              void 0 === e && (e = new l.Obj('0')),
              void 0 === n && (n = new l.OCGContext('0')),
              f(arguments.length, 1, 'begin', '(PDFNet.Obj, PDFNet.Obj, PDFNet.OCGContext)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'Object', l.Obj, 'Obj'],
                [n, 'Object', l.OCGContext, 'OCGContext'],
              ]),
              l.sendWithPromise('ElementReader.begin', {
                r: this.id,
                content_stream: t.id,
                resource_dict: e.id,
                ctx: n.id,
              })
            );
          }),
          (l.ElementReader.prototype.appendResource = function (t) {
            return (
              f(arguments.length, 1, 'appendResource', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('ElementReader.appendResource', {
                r: this.id,
                res: t.id,
              })
            );
          }),
          (l.ElementReader.prototype.next = function () {
            return l.sendWithPromise('ElementReader.next', { r: this.id }).then(function (t) {
              return _(l.Element, t);
            });
          }),
          (l.ElementReader.prototype.current = function () {
            return l.sendWithPromise('ElementReader.current', { r: this.id }).then(function (t) {
              return _(l.Element, t);
            });
          }),
          (l.ElementReader.prototype.formBegin = function () {
            return l.sendWithPromise('ElementReader.formBegin', { r: this.id });
          });
        function p(r, o) {
          o = o || {};
          var s = new XMLHttpRequest();
          return new Promise(
            function (e, n) {
              s.open('GET', r, !0),
                (s.responseType = 'arraybuffer'),
                o.withCredentials && (s.withCredentials = o.withCredentials),
                (s.onerror = function () {
                  n(Error('Network error occurred'));
                }),
                (s.onload = function (t) {
                  200 == this.status ? ((t = new Uint8Array(s.response)), e(t)) : n(Error('Download Failed'));
                });
              var t = o.customHeaders;
              if (t) for (var i in t) s.setRequestHeader(i, t[i]);
              s.send();
            },
            function () {
              s.abort();
            },
          );
        }
        function m(t) {
          return 0 === t ? '1st' : 1 === t ? '2nd' : 2 === t ? '3rd' : t + 1 + 'th';
        }
        (l.ElementReader.prototype.patternBegin = function (t, e) {
          return (
            void 0 === e && (e = !1),
            f(arguments.length, 1, 'patternBegin', '(boolean, boolean)', [
              [t, 'boolean'],
              [e, 'boolean'],
            ]),
            l.sendWithPromise('ElementReader.patternBegin', {
              r: this.id,
              fill_pattern: t,
              reset_ctm_tfm: e,
            })
          );
        }),
          (l.ElementReader.prototype.type3FontBegin = function (e, t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 1, 'type3FontBegin', '(PDFNet.CharData, PDFNet.Obj)', [
                [e, 'Structure', l.CharData, 'CharData'],
                [t, 'Object', l.Obj, 'Obj'],
              ]),
              F('type3FontBegin', [[e, 0]]),
              (e.yieldFunction = 'ElementReader.type3FontBegin'),
              l
                .sendWithPromise('ElementReader.type3FontBegin', {
                  r: this.id,
                  char_data: e,
                  resource_dict: t.id,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.ElementReader.prototype.end = function () {
            return l.sendWithPromise('ElementReader.end', { r: this.id });
          }),
          (l.ElementReader.prototype.getChangesIterator = function () {
            return l
              .sendWithPromise('ElementReader.getChangesIterator', {
                r: this.id,
              })
              .then(function (t) {
                return D(l.Iterator, t, 'Int');
              });
          }),
          (l.ElementReader.prototype.isChanged = function (t) {
            return (
              f(arguments.length, 1, 'isChanged', '(number)', [[t, 'number']]),
              l.sendWithPromise('ElementReader.isChanged', {
                r: this.id,
                attrib: t,
              })
            );
          }),
          (l.ElementReader.prototype.clearChangeList = function () {
            return l.sendWithPromise('ElementReader.clearChangeList', {
              r: this.id,
            });
          }),
          (l.ElementReader.prototype.getFont = function (t) {
            return (
              f(arguments.length, 1, 'getFont', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementReader.getFont', {
                  r: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ElementReader.prototype.getXObject = function (t) {
            return (
              f(arguments.length, 1, 'getXObject', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementReader.getXObject', {
                  r: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ElementReader.prototype.getShading = function (t) {
            return (
              f(arguments.length, 1, 'getShading', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementReader.getShading', {
                  r: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ElementReader.prototype.getColorSpace = function (t) {
            return (
              f(arguments.length, 1, 'getColorSpace', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementReader.getColorSpace', {
                  r: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ElementReader.prototype.getPattern = function (t) {
            return (
              f(arguments.length, 1, 'getPattern', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementReader.getPattern', {
                  r: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ElementReader.prototype.getExtGState = function (t) {
            return (
              f(arguments.length, 1, 'getExtGState', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementReader.getExtGState', {
                  r: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ElementWriter.create = function () {
            return l.sendWithPromise('elementWriterCreate', {}).then(function (t) {
              return D(l.ElementWriter, t);
            });
          }),
          (l.ElementWriter.prototype.beginOnPage = function (t, e, n, i, r) {
            return (
              void 0 === e && (e = l.ElementWriter.WriteMode.e_overlay),
              void 0 === n && (n = !0),
              void 0 === i && (i = !0),
              void 0 === r && (r = new l.Obj('0')),
              f(arguments.length, 1, 'beginOnPage', '(PDFNet.Page, number, boolean, boolean, PDFNet.Obj)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
                [n, 'boolean'],
                [i, 'boolean'],
                [r, 'Object', l.Obj, 'Obj'],
              ]),
              l.sendWithPromise('ElementWriter.beginOnPage', {
                w: this.id,
                page: t.id,
                placement: e,
                page_coord_sys: n,
                compress: i,
                resources: r.id,
              })
            );
          }),
          (l.ElementWriter.prototype.begin = function (t, e) {
            return (
              void 0 === e && (e = !0),
              f(arguments.length, 1, 'begin', '(PDFNet.SDFDoc, boolean)', [
                [t, 'SDFDoc'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('ElementWriter.begin', {
                w: this.id,
                doc: t.id,
                compress: e,
              })
            );
          }),
          (l.ElementWriter.prototype.beginOnObj = function (t, e, n) {
            return (
              void 0 === e && (e = !0),
              void 0 === n && (n = new l.Obj('0')),
              f(arguments.length, 1, 'beginOnObj', '(PDFNet.Obj, boolean, PDFNet.Obj)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'boolean'],
                [n, 'Object', l.Obj, 'Obj'],
              ]),
              l.sendWithPromise('ElementWriter.beginOnObj', {
                w: this.id,
                stream_obj_to_update: t.id,
                compress: e,
                resources: n.id,
              })
            );
          }),
          (l.ElementWriter.prototype.end = function () {
            return l.sendWithPromise('ElementWriter.end', { w: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ElementWriter.prototype.writeElement = function (t) {
            return (
              f(arguments.length, 1, 'writeElement', '(PDFNet.Element)', [[t, 'Object', l.Element, 'Element']]),
              l.sendWithPromise('ElementWriter.writeElement', {
                w: this.id,
                element: t.id,
              })
            );
          }),
          (l.ElementWriter.prototype.writePlacedElement = function (t) {
            return (
              f(arguments.length, 1, 'writePlacedElement', '(PDFNet.Element)', [[t, 'Object', l.Element, 'Element']]),
              l.sendWithPromise('ElementWriter.writePlacedElement', {
                w: this.id,
                element: t.id,
              })
            );
          }),
          (l.ElementWriter.prototype.flush = function () {
            return l.sendWithPromise('ElementWriter.flush', { w: this.id });
          }),
          (l.ElementWriter.prototype.writeBuffer = function (t) {
            f(arguments.length, 1, 'writeBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('ElementWriter.writeBuffer', {
              w: this.id,
              data_buf: e,
            });
          }),
          (l.ElementWriter.prototype.writeString = function (t) {
            return (
              f(arguments.length, 1, 'writeString', '(string)', [[t, 'string']]),
              l.sendWithPromise('ElementWriter.writeString', {
                w: this.id,
                str: t,
              })
            );
          }),
          (l.ElementWriter.prototype.setDefaultGState = function (t) {
            return (
              f(arguments.length, 1, 'setDefaultGState', '(PDFNet.ElementReader)', [[t, 'Object', l.ElementReader, 'ElementReader']]),
              l.sendWithPromise('ElementWriter.setDefaultGState', {
                w: this.id,
                reader: t.id,
              })
            );
          }),
          (l.ElementWriter.prototype.writeGStateChanges = function (t) {
            return (
              f(arguments.length, 1, 'writeGStateChanges', '(PDFNet.Element)', [[t, 'Object', l.Element, 'Element']]),
              l.sendWithPromise('ElementWriter.writeGStateChanges', {
                w: this.id,
                element: t.id,
              })
            );
          }),
          (l.FileSpec.create = function (t, e, n) {
            return (
              void 0 === n && (n = !0),
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, string, boolean)', [
                [t, 'SDFDoc'],
                [e, 'string'],
                [n, 'boolean'],
              ]),
              l
                .sendWithPromise('fileSpecCreate', {
                  doc: t.id,
                  path: e,
                  embed: n,
                })
                .then(function (t) {
                  return _(l.FileSpec, t);
                })
            );
          }),
          (l.FileSpec.createURL = function (t, e) {
            return (
              f(arguments.length, 2, 'createURL', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('fileSpecCreateURL', { doc: t.id, url: e }).then(function (t) {
                return _(l.FileSpec, t);
              })
            );
          }),
          (l.FileSpec.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('fileSpecCreateFromObj', { f: t.id }).then(function (t) {
                return _(l.FileSpec, t);
              })
            );
          }),
          (l.FileSpec.prototype.copy = function () {
            return l.sendWithPromise('FileSpec.copy', { d: this.id }).then(function (t) {
              return _(l.FileSpec, t);
            });
          }),
          (l.FileSpec.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.FileSpec)', [[t, 'Object', l.FileSpec, 'FileSpec']]),
              l.sendWithPromise('FileSpec.compare', { fs: this.id, d: t.id })
            );
          }),
          (l.FileSpec.prototype.isValid = function () {
            return l.sendWithPromise('FileSpec.isValid', { fs: this.id });
          }),
          (l.FileSpec.prototype.export = function (t) {
            return (
              void 0 === t && (t = ''),
              f(arguments.length, 0, 'export', '(string)', [[t, 'string']]),
              l.sendWithPromise('FileSpec.export', { fs: this.id, save_as: t })
            );
          }),
          (l.FileSpec.prototype.getFileData = function () {
            return l.sendWithPromise('FileSpec.getFileData', { fs: this.id }).then(function (t) {
              return _(l.Filter, t);
            });
          }),
          (l.FileSpec.prototype.getFilePath = function () {
            return l.sendWithPromise('FileSpec.getFilePath', { fs: this.id });
          }),
          (l.FileSpec.prototype.setDesc = function (t) {
            return f(arguments.length, 1, 'setDesc', '(string)', [[t, 'string']]), l.sendWithPromise('FileSpec.setDesc', { fs: this.id, desc: t });
          }),
          (l.FileSpec.prototype.getSDFObj = function () {
            return l.sendWithPromise('FileSpec.getSDFObj', { fs: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Flattener.create = function () {
            return l.sendWithPromise('flattenerCreate', {}).then(function (t) {
              return D(l.Flattener, t);
            });
          }),
          (l.Flattener.prototype.setDPI = function (t) {
            return (
              f(arguments.length, 1, 'setDPI', '(number)', [[t, 'number']]),
              l.sendWithPromise('Flattener.setDPI', {
                flattener: this.id,
                dpi: t,
              })
            );
          }),
          (l.Flattener.prototype.setThreshold = function (t) {
            return (
              f(arguments.length, 1, 'setThreshold', '(number)', [[t, 'number']]),
              l.sendWithPromise('Flattener.setThreshold', {
                flattener: this.id,
                threshold: t,
              })
            );
          }),
          (l.Flattener.prototype.setMaximumImagePixels = function (t) {
            return (
              f(arguments.length, 1, 'setMaximumImagePixels', '(number)', [[t, 'number']]),
              l.sendWithPromise('Flattener.setMaximumImagePixels', {
                flattener: this.id,
                max_pixels: t,
              })
            );
          }),
          (l.Flattener.prototype.setPreferJPG = function (t) {
            return (
              f(arguments.length, 1, 'setPreferJPG', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Flattener.setPreferJPG', {
                flattener: this.id,
                jpg: t,
              })
            );
          }),
          (l.Flattener.prototype.setJPGQuality = function (t) {
            return (
              f(arguments.length, 1, 'setJPGQuality', '(number)', [[t, 'number']]),
              l.sendWithPromise('Flattener.setJPGQuality', {
                flattener: this.id,
                quality: t,
              })
            );
          }),
          (l.Flattener.prototype.setPathHinting = function (t) {
            return (
              f(arguments.length, 1, 'setPathHinting', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Flattener.setPathHinting', {
                flattener: this.id,
                hinting: t,
              })
            );
          }),
          (l.Flattener.prototype.process = function (t, e) {
            return (
              f(arguments.length, 2, 'process', '(PDFNet.PDFDoc, number)', [
                [t, 'PDFDoc'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Flattener.process', {
                flattener: this.id,
                doc: t.id,
                mode: e,
              })
            );
          }),
          (l.Flattener.prototype.processPage = function (t, e) {
            return (
              f(arguments.length, 2, 'processPage', '(PDFNet.Page, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Flattener.processPage', {
                flattener: this.id,
                page: t.id,
                mode: e,
              })
            );
          }),
          (l.Font.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('fontCreateFromObj', { font_dict: t.id }).then(function (t) {
                return D(l.Font, t);
              })
            );
          }),
          (l.Font.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, number)', [
                [t, 'SDFDoc'],
                [e, 'number'],
              ]),
              l.sendWithPromise('fontCreate', { doc: t.id, type: e }).then(function (t) {
                return D(l.Font, t);
              })
            );
          }),
          (l.Font.createFromFontDescriptor = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createFromFontDescriptor', '(PDFNet.SDFDoc, PDFNet.Font, string)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.Font, 'Font'],
                [n, 'string'],
              ]),
              l
                .sendWithPromise('fontCreateFromFontDescriptor', {
                  doc: t.id,
                  from: e.id,
                  char_set: n,
                })
                .then(function (t) {
                  return D(l.Font, t);
                })
            );
          }),
          (l.Font.createFromName = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createFromName', '(PDFNet.SDFDoc, string, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
                [n, 'string'],
              ]),
              l
                .sendWithPromise('fontCreateFromName', {
                  doc: t.id,
                  name: e,
                  char_set: n,
                })
                .then(function (t) {
                  return D(l.Font, t);
                })
            );
          }),
          (l.Font.createAndEmbed = function (t, e) {
            return (
              f(arguments.length, 2, 'createAndEmbed', '(PDFNet.SDFDoc, number)', [
                [t, 'SDFDoc'],
                [e, 'number'],
              ]),
              l.sendWithPromise('fontCreateAndEmbed', { doc: t.id, type: e }).then(function (t) {
                return D(l.Font, t);
              })
            );
          }),
          (l.Font.createTrueTypeFontWithBuffer = function (t, e, n, i) {
            return (
              void 0 === n && (n = !0),
              void 0 === i && (i = !0),
              f(arguments.length, 2, 'createTrueTypeFontWithBuffer', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, boolean, boolean)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'boolean'],
                [i, 'boolean'],
              ]),
              (e = b(e, !1)),
              l
                .sendWithPromise('fontCreateTrueTypeFontWithBuffer', {
                  doc: t.id,
                  font_path: e,
                  embed: n,
                  subset: i,
                })
                .then(function (t) {
                  return D(l.Font, t);
                })
            );
          }),
          (l.Font.createCIDTrueTypeFontWithBuffer = function (t, e, n, i, r, o) {
            return (
              void 0 === n && (n = !0),
              void 0 === i && (i = !0),
              void 0 === r && (r = l.Font.Encoding.e_IdentityH),
              void 0 === o && (o = 0),
              f(arguments.length, 2, 'createCIDTrueTypeFontWithBuffer', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, boolean, boolean, number, number)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'boolean'],
                [i, 'boolean'],
                [r, 'number'],
                [o, 'number'],
              ]),
              (e = b(e, !1)),
              l
                .sendWithPromise('fontCreateCIDTrueTypeFontWithBuffer', {
                  doc: t.id,
                  font_path: e,
                  embed: n,
                  subset: i,
                  encoding: r,
                  ttc_font_index: o,
                })
                .then(function (t) {
                  return D(l.Font, t);
                })
            );
          }),
          (l.Font.createType1FontWithBuffer = function (t, e, n) {
            return (
              void 0 === n && (n = !0),
              f(arguments.length, 2, 'createType1FontWithBuffer', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, boolean)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'boolean'],
              ]),
              (e = b(e, !1)),
              l
                .sendWithPromise('fontCreateType1FontWithBuffer', {
                  doc: t.id,
                  font_path: e,
                  embed: n,
                })
                .then(function (t) {
                  return D(l.Font, t);
                })
            );
          }),
          (l.Font.prototype.getType = function () {
            return l.sendWithPromise('Font.getType', { font: this.id });
          }),
          (l.Font.prototype.isSimple = function () {
            return l.sendWithPromise('Font.isSimple', { font: this.id });
          }),
          (l.Font.getTypeFromObj = function (t) {
            return (
              f(arguments.length, 1, 'getTypeFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('fontGetTypeFromObj', { font_dict: t.id })
            );
          }),
          (l.Font.prototype.getSDFObj = function () {
            return l.sendWithPromise('Font.getSDFObj', { font: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Font.prototype.getDescriptor = function () {
            return l.sendWithPromise('Font.getDescriptor', { font: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Font.prototype.getName = function () {
            return l.sendWithPromise('Font.getName', { font: this.id });
          }),
          (l.Font.prototype.getFamilyName = function () {
            return l.sendWithPromise('Font.getFamilyName', { font: this.id });
          }),
          (l.Font.prototype.isFixedWidth = function () {
            return l.sendWithPromise('Font.isFixedWidth', { font: this.id });
          }),
          (l.Font.prototype.isSerif = function () {
            return l.sendWithPromise('Font.isSerif', { font: this.id });
          }),
          (l.Font.prototype.isSymbolic = function () {
            return l.sendWithPromise('Font.isSymbolic', { font: this.id });
          }),
          (l.Font.prototype.isItalic = function () {
            return l.sendWithPromise('Font.isItalic', { font: this.id });
          }),
          (l.Font.prototype.isAllCap = function () {
            return l.sendWithPromise('Font.isAllCap', { font: this.id });
          }),
          (l.Font.prototype.isForceBold = function () {
            return l.sendWithPromise('Font.isForceBold', { font: this.id });
          }),
          (l.Font.prototype.isHorizontalMode = function () {
            return l.sendWithPromise('Font.isHorizontalMode', {
              font: this.id,
            });
          }),
          (l.Font.prototype.getWidth = function (t) {
            return (
              f(arguments.length, 1, 'getWidth', '(number)', [[t, 'number']]),
              l.sendWithPromise('Font.getWidth', {
                font: this.id,
                char_code: t,
              })
            );
          }),
          (l.Font.prototype.getMaxWidth = function () {
            return l.sendWithPromise('Font.getMaxWidth', { font: this.id });
          }),
          (l.Font.prototype.getMissingWidth = function () {
            return l.sendWithPromise('Font.getMissingWidth', { font: this.id });
          }),
          (l.Font.prototype.getCharCodeIterator = function () {
            return l.sendWithPromise('Font.getCharCodeIterator', { font: this.id }).then(function (t) {
              return D(l.Iterator, t, 'Int');
            });
          }),
          (l.Font.prototype.getShapedText = function (t) {
            return (
              f(arguments.length, 1, 'getShapedText', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('Font.getShapedText', {
                  font: this.id,
                  text_to_shape: t,
                })
                .then(function (t) {
                  return D(l.ShapedText, t);
                })
            );
          }),
          (l.Font.prototype.getEncoding = function () {
            return l.sendWithPromise('Font.getEncoding', { font: this.id });
          }),
          (l.Font.prototype.isEmbedded = function () {
            return l.sendWithPromise('Font.isEmbedded', { font: this.id });
          }),
          (l.Font.prototype.getEmbeddedFontName = function () {
            return l.sendWithPromise('Font.getEmbeddedFontName', {
              font: this.id,
            });
          }),
          (l.Font.prototype.getEmbeddedFont = function () {
            return l.sendWithPromise('Font.getEmbeddedFont', { font: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Font.prototype.getEmbeddedFontBufSize = function () {
            return l.sendWithPromise('Font.getEmbeddedFontBufSize', {
              font: this.id,
            });
          }),
          (l.Font.prototype.getUnitsPerEm = function () {
            return l.sendWithPromise('Font.getUnitsPerEm', { font: this.id });
          }),
          (l.Font.prototype.getBBox = function () {
            return l.sendWithPromise('Font.getBBox', { font: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Font.prototype.getAscent = function () {
            return l.sendWithPromise('Font.getAscent', { font: this.id });
          }),
          (l.Font.prototype.getDescent = function () {
            return l.sendWithPromise('Font.getDescent', { font: this.id });
          }),
          (l.Font.prototype.getStandardType1FontType = function () {
            return l.sendWithPromise('Font.getStandardType1FontType', {
              font: this.id,
            });
          }),
          (l.Font.prototype.isCFF = function () {
            return l.sendWithPromise('Font.isCFF', { font: this.id });
          }),
          (l.Font.prototype.getType3FontMatrix = function () {
            return l.sendWithPromise('Font.getType3FontMatrix', { font: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.Font.prototype.getType3GlyphStream = function (t) {
            return (
              f(arguments.length, 1, 'getType3GlyphStream', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('Font.getType3GlyphStream', {
                  font: this.id,
                  char_code: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Font.prototype.getVerticalAdvance = function (t) {
            return (
              f(arguments.length, 1, 'getVerticalAdvance', '(number)', [[t, 'number']]),
              l.sendWithPromise('Font.getVerticalAdvance', {
                font: this.id,
                char_code: t,
              })
            );
          }),
          (l.Font.prototype.getDescendant = function () {
            return l.sendWithPromise('Font.getDescendant', { font: this.id }).then(function (t) {
              return D(l.Font, t);
            });
          }),
          (l.Font.prototype.mapToCID = function (t) {
            return (
              f(arguments.length, 1, 'mapToCID', '(number)', [[t, 'number']]),
              l.sendWithPromise('Font.mapToCID', {
                font: this.id,
                char_code: t,
              })
            );
          }),
          (l.Function.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('functionCreate', { funct_dict: t.id }).then(function (t) {
                return D(l.Function, t);
              })
            );
          }),
          (l.Function.prototype.getType = function () {
            return l.sendWithPromise('Function.getType', { f: this.id });
          }),
          (l.Function.prototype.getInputCardinality = function () {
            return l.sendWithPromise('Function.getInputCardinality', {
              f: this.id,
            });
          }),
          (l.Function.prototype.getOutputCardinality = function () {
            return l.sendWithPromise('Function.getOutputCardinality', {
              f: this.id,
            });
          }),
          (l.Function.prototype.eval = function (t, e) {
            return (
              f(arguments.length, 2, 'eval', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Function.eval', {
                f: this.id,
                inval: t,
                outval: e,
              })
            );
          }),
          (l.Function.prototype.getSDFObj = function () {
            return l.sendWithPromise('Function.getSDFObj', { f: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Highlights.create = function () {
            return l.sendWithPromise('highlightsCreate', {}).then(function (t) {
              return D(l.Highlights, t);
            });
          }),
          (l.Highlights.prototype.copyCtor = function () {
            return l.sendWithPromise('Highlights.copyCtor', { hlts: this.id }).then(function (t) {
              return D(l.Highlights, t);
            });
          }),
          (l.Highlights.prototype.add = function (t) {
            return (
              f(arguments.length, 1, 'add', '(PDFNet.Highlights)', [[t, 'Object', l.Highlights, 'Highlights']]),
              l.sendWithPromise('Highlights.add', {
                hlts2: this.id,
                hlts: t.id,
              })
            );
          }),
          (l.Highlights.prototype.saveToString = function () {
            return l.sendWithPromise('Highlights.saveToString', {
              hlts: this.id,
            });
          }),
          (l.Highlights.prototype.clear = function () {
            return l.sendWithPromise('Highlights.clear', { hlts: this.id });
          }),
          (l.Highlights.prototype.begin = function (t) {
            return (
              f(arguments.length, 1, 'begin', '(PDFNet.PDFDoc)', [[t, 'PDFDoc']]),
              l.sendWithPromise('Highlights.begin', {
                hlts: this.id,
                doc: t.id,
              })
            );
          }),
          (l.Highlights.prototype.hasNext = function () {
            return l.sendWithPromise('Highlights.hasNext', { hlts: this.id });
          }),
          (l.Highlights.prototype.next = function () {
            return l.sendWithPromise('Highlights.next', { hlts: this.id });
          }),
          (l.Highlights.prototype.getCurrentPageNumber = function () {
            return l.sendWithPromise('Highlights.getCurrentPageNumber', {
              hlts: this.id,
            });
          }),
          (l.Highlights.prototype.getCurrentTextRange = function () {
            return l
              .sendWithPromise('Highlights.getCurrentTextRange', {
                hlts: this.id,
              })
              .then(function (t) {
                return _(l.TextRange, t);
              });
          }),
          (l.Image.createFromMemory = function (t, e, n, i, r, o, s) {
            void 0 === s && (s = new l.Obj('0')),
              f(arguments.length, 6, 'createFromMemory', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, number, number, number, PDFNet.ColorSpace, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'Object', l.ColorSpace, 'ColorSpace'],
                [s, 'Object', l.Obj, 'Obj'],
              ]);
            var u = b(e, !1);
            return l
              .sendWithPromise('imageCreateFromMemory', {
                doc: t.id,
                buf: u,
                width: n,
                height: i,
                bpc: r,
                color_space: o.id,
                encoder_hints: s.id,
              })
              .then(function (t) {
                return _(l.Image, t);
              });
          }),
          (l.Image.createFromMemory2 = function (t, e, n) {
            void 0 === n && (n = new l.Obj('0')),
              f(arguments.length, 2, 'createFromMemory2', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'Object', l.Obj, 'Obj'],
              ]);
            var i = b(e, !1);
            return l
              .sendWithPromise('imageCreateFromMemory2', {
                doc: t.id,
                buf: i,
                encoder_hints: n.id,
              })
              .then(function (t) {
                return _(l.Image, t);
              });
          }),
          (l.Image.createFromStream = function (t, e, n, i, r, o, s) {
            return (
              void 0 === s && (s = new l.Obj('0')),
              f(arguments.length, 6, 'createFromStream', '(PDFNet.SDFDoc, PDFNet.FilterReader, number, number, number, PDFNet.ColorSpace, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.FilterReader, 'FilterReader'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'Object', l.ColorSpace, 'ColorSpace'],
                [s, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('imageCreateFromStream', {
                  doc: t.id,
                  image_data: e.id,
                  width: n,
                  height: i,
                  bpc: r,
                  color_space: o.id,
                  encoder_hints: s.id,
                })
                .then(function (t) {
                  return _(l.Image, t);
                })
            );
          }),
          (l.Image.createFromStream2 = function (t, e, n) {
            return (
              void 0 === n && (n = new l.Obj('0')),
              f(arguments.length, 2, 'createFromStream2', '(PDFNet.SDFDoc, PDFNet.Filter, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.Filter, 'Filter'],
                [n, 'Object', l.Obj, 'Obj'],
              ]),
              0 != e.id && O(e.id),
              l
                .sendWithPromise('imageCreateFromStream2', {
                  doc: t.id,
                  no_own_image_data: e.id,
                  encoder_hints: n.id,
                })
                .then(function (t) {
                  return _(l.Image, t);
                })
            );
          }),
          (l.Image.createImageMask = function (t, e, n, i, r) {
            void 0 === r && (r = new l.Obj('0')),
              f(arguments.length, 4, 'createImageMask', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, number, number, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'number'],
                [i, 'number'],
                [r, 'Object', l.Obj, 'Obj'],
              ]);
            var o = b(e, !1);
            return l
              .sendWithPromise('imageCreateImageMask', {
                doc: t.id,
                buf: o,
                width: n,
                height: i,
                encoder_hints: r.id,
              })
              .then(function (t) {
                return _(l.Image, t);
              });
          }),
          (l.Image.createImageMaskFromStream = function (t, e, n, i, r) {
            return (
              void 0 === r && (r = new l.Obj('0')),
              f(arguments.length, 4, 'createImageMaskFromStream', '(PDFNet.SDFDoc, PDFNet.FilterReader, number, number, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.FilterReader, 'FilterReader'],
                [n, 'number'],
                [i, 'number'],
                [r, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('imageCreateImageMaskFromStream', {
                  doc: t.id,
                  image_data: e.id,
                  width: n,
                  height: i,
                  encoder_hints: r.id,
                })
                .then(function (t) {
                  return _(l.Image, t);
                })
            );
          }),
          (l.Image.createSoftMask = function (t, e, n, i, r, o) {
            void 0 === o && (o = new l.Obj('0')),
              f(arguments.length, 5, 'createSoftMask', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, number, number, number, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'ArrayBuffer'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'Object', l.Obj, 'Obj'],
              ]);
            var s = b(e, !1);
            return l
              .sendWithPromise('imageCreateSoftMask', {
                doc: t.id,
                buf: s,
                width: n,
                height: i,
                bpc: r,
                encoder_hints: o.id,
              })
              .then(function (t) {
                return _(l.Image, t);
              });
          }),
          (l.Image.createSoftMaskFromStream = function (t, e, n, i, r, o) {
            return (
              void 0 === o && (o = new l.Obj('0')),
              f(arguments.length, 5, 'createSoftMaskFromStream', '(PDFNet.SDFDoc, PDFNet.FilterReader, number, number, number, PDFNet.Obj)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.FilterReader, 'FilterReader'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('imageCreateSoftMaskFromStream', {
                  doc: t.id,
                  image_data: e.id,
                  width: n,
                  height: i,
                  bpc: r,
                  encoder_hints: o.id,
                })
                .then(function (t) {
                  return _(l.Image, t);
                })
            );
          }),
          (l.Image.createDirectFromMemory = function (t, e, n, i, r, o, s) {
            f(arguments.length, 7, 'createDirectFromMemory', '(PDFNet.SDFDoc, ArrayBuffer|TypedArray, number, number, number, PDFNet.ColorSpace, number)', [
              [t, 'SDFDoc'],
              [e, 'ArrayBuffer'],
              [n, 'number'],
              [i, 'number'],
              [r, 'number'],
              [o, 'Object', l.ColorSpace, 'ColorSpace'],
              [s, 'number'],
            ]);
            var u = b(e, !1);
            return l
              .sendWithPromise('imageCreateDirectFromMemory', {
                doc: t.id,
                buf: u,
                width: n,
                height: i,
                bpc: r,
                color_space: o.id,
                input_format: s,
              })
              .then(function (t) {
                return _(l.Image, t);
              });
          }),
          (l.Image.createDirectFromStream = function (t, e, n, i, r, o, s) {
            return (
              f(arguments.length, 7, 'createDirectFromStream', '(PDFNet.SDFDoc, PDFNet.FilterReader, number, number, number, PDFNet.ColorSpace, number)', [
                [t, 'SDFDoc'],
                [e, 'Object', l.FilterReader, 'FilterReader'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'Object', l.ColorSpace, 'ColorSpace'],
                [s, 'number'],
              ]),
              l
                .sendWithPromise('imageCreateDirectFromStream', {
                  doc: t.id,
                  image_data: e.id,
                  width: n,
                  height: i,
                  bpc: r,
                  color_space: o.id,
                  input_format: s,
                })
                .then(function (t) {
                  return _(l.Image, t);
                })
            );
          }),
          (l.Image.createFromObj = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('imageCreateFromObj', { image_xobject: t.id }).then(function (t) {
                return _(l.Image, t);
              })
            );
          }),
          (l.Image.prototype.copy = function () {
            return l.sendWithPromise('Image.copy', { c: this.id }).then(function (t) {
              return _(l.Image, t);
            });
          }),
          (l.Image.prototype.getSDFObj = function () {
            return l.sendWithPromise('Image.getSDFObj', { img: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Image.prototype.isValid = function () {
            return l.sendWithPromise('Image.isValid', { img: this.id });
          }),
          (l.Image.prototype.getImageData = function () {
            return l.sendWithPromise('Image.getImageData', { img: this.id }).then(function (t) {
              return _(l.Filter, t);
            });
          }),
          (l.Image.prototype.getImageDataSize = function () {
            return l.sendWithPromise('Image.getImageDataSize', {
              img: this.id,
            });
          }),
          (l.Image.prototype.getImageColorSpace = function () {
            return l.sendWithPromise('Image.getImageColorSpace', { img: this.id }).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.Image.prototype.getImageWidth = function () {
            return l.sendWithPromise('Image.getImageWidth', { img: this.id });
          }),
          (l.Image.prototype.getImageHeight = function () {
            return l.sendWithPromise('Image.getImageHeight', { img: this.id });
          }),
          (l.Image.prototype.getDecodeArray = function () {
            return l.sendWithPromise('Image.getDecodeArray', { img: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Image.prototype.getBitsPerComponent = function () {
            return l.sendWithPromise('Image.getBitsPerComponent', {
              img: this.id,
            });
          }),
          (l.Image.prototype.getComponentNum = function () {
            return l.sendWithPromise('Image.getComponentNum', { img: this.id });
          }),
          (l.Image.prototype.isImageMask = function () {
            return l.sendWithPromise('Image.isImageMask', { img: this.id });
          }),
          (l.Image.prototype.isImageInterpolate = function () {
            return l.sendWithPromise('Image.isImageInterpolate', {
              img: this.id,
            });
          }),
          (l.Image.prototype.getMask = function () {
            return l.sendWithPromise('Image.getMask', { img: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Image.prototype.setMask = function (t) {
            return (
              f(arguments.length, 1, 'setMask', '(PDFNet.Image)', [[t, 'Object', l.Image, 'Image']]),
              l.sendWithPromise('Image.setMask', {
                img: this.id,
                image_mask: t.id,
              })
            );
          }),
          (l.Image.prototype.setMaskWithObj = function (t) {
            return (
              f(arguments.length, 1, 'setMaskWithObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('Image.setMaskWithObj', {
                img: this.id,
                mask: t.id,
              })
            );
          }),
          (l.Image.prototype.getSoftMask = function () {
            return l.sendWithPromise('Image.getSoftMask', { img: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Image.prototype.setSoftMask = function (t) {
            return (
              f(arguments.length, 1, 'setSoftMask', '(PDFNet.Image)', [[t, 'Object', l.Image, 'Image']]),
              l.sendWithPromise('Image.setSoftMask', {
                img: this.id,
                soft_mask: t.id,
              })
            );
          }),
          (l.Image.prototype.getImageRenderingIntent = function () {
            return l.sendWithPromise('Image.getImageRenderingIntent', {
              img: this.id,
            });
          }),
          (l.Image.prototype.exportFromStream = function (t) {
            return (
              f(arguments.length, 1, 'exportFromStream', '(PDFNet.FilterWriter)', [[t, 'Object', l.FilterWriter, 'FilterWriter']]),
              l.sendWithPromise('Image.exportFromStream', {
                img: this.id,
                writer: t.id,
              })
            );
          }),
          (l.Image.prototype.exportAsTiffFromStream = function (t) {
            return (
              f(arguments.length, 1, 'exportAsTiffFromStream', '(PDFNet.FilterWriter)', [[t, 'Object', l.FilterWriter, 'FilterWriter']]),
              l.sendWithPromise('Image.exportAsTiffFromStream', {
                img: this.id,
                writer: t.id,
              })
            );
          }),
          (l.Image.prototype.exportAsPngFromStream = function (t) {
            return (
              f(arguments.length, 1, 'exportAsPngFromStream', '(PDFNet.FilterWriter)', [[t, 'Object', l.FilterWriter, 'FilterWriter']]),
              l.sendWithPromise('Image.exportAsPngFromStream', {
                img: this.id,
                writer: t.id,
              })
            );
          }),
          (l.PageLabel.create = function (t, e, n, i) {
            return (
              void 0 === n && (n = ''),
              void 0 === i && (i = 1),
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, number, string, number)', [
                [t, 'SDFDoc'],
                [e, 'number'],
                [n, 'string'],
                [i, 'number'],
              ]),
              l
                .sendWithPromise('pageLabelCreate', {
                  doc: t.id,
                  style: e,
                  prefix: n,
                  start_at: i,
                })
                .then(function (t) {
                  return new l.PageLabel(t);
                })
            );
          }),
          (l.PageLabel.createFromObj = function (t, e, n) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              void 0 === e && (e = -1),
              void 0 === n && (n = -1),
              f(arguments.length, 0, 'createFromObj', '(PDFNet.Obj, number, number)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('pageLabelCreateFromObj', {
                  l: t.id,
                  first_page: e,
                  last_page: n,
                })
                .then(function (t) {
                  return new l.PageLabel(t);
                })
            );
          }),
          (l.PageLabel.prototype.compare = function (t) {
            f(arguments.length, 1, 'compare', '(PDFNet.PageLabel)', [[t, 'Structure', l.PageLabel, 'PageLabel']]),
              P('compare', this.yieldFunction),
              F('compare', [[t, 0]]);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.compare'),
              l.sendWithPromise('PageLabel.compare', { l: this, d: t }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.l, e), t.result;
              })
            );
          }),
          (l.PageLabel.prototype.isValid = function () {
            return P('isValid', this.yieldFunction), l.sendWithPromise('PageLabel.isValid', { l: this });
          }),
          (l.PageLabel.prototype.getLabelTitle = function (t) {
            f(arguments.length, 1, 'getLabelTitle', '(number)', [[t, 'number']]), P('getLabelTitle', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.getLabelTitle'),
              l
                .sendWithPromise('PageLabel.getLabelTitle', {
                  l: this,
                  page_num: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.l, e), t.result;
                })
            );
          }),
          (l.PageLabel.prototype.setStyle = function (t) {
            f(arguments.length, 1, 'setStyle', '(number)', [[t, 'number']]), P('setStyle', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.setStyle'),
              l.sendWithPromise('PageLabel.setStyle', { l: this, style: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.PageLabel.prototype.getStyle = function () {
            return P('getStyle', this.yieldFunction), l.sendWithPromise('PageLabel.getStyle', { l: this });
          }),
          (l.PageLabel.prototype.getPrefix = function () {
            return P('getPrefix', this.yieldFunction), l.sendWithPromise('PageLabel.getPrefix', { l: this });
          }),
          (l.PageLabel.prototype.setPrefix = function (t) {
            f(arguments.length, 1, 'setPrefix', '(string)', [[t, 'string']]), P('setPrefix', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.setPrefix'),
              l.sendWithPromise('PageLabel.setPrefix', { l: this, prefix: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.PageLabel.prototype.getStart = function () {
            return P('getStart', this.yieldFunction), l.sendWithPromise('PageLabel.getStart', { l: this });
          }),
          (l.PageLabel.prototype.setStart = function (t) {
            f(arguments.length, 1, 'setStart', '(number)', [[t, 'number']]), P('setStart', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.setStart'),
              l.sendWithPromise('PageLabel.setStart', { l: this, start_at: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.PageLabel.prototype.getFirstPageNum = function () {
            P('getFirstPageNum', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.getFirstPageNum'),
              l.sendWithPromise('PageLabel.getFirstPageNum', { l: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.l, e), t.result;
              })
            );
          }),
          (l.PageLabel.prototype.getLastPageNum = function () {
            P('getLastPageNum', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'PageLabel.getLastPageNum'),
              l.sendWithPromise('PageLabel.getLastPageNum', { l: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.l, e), t.result;
              })
            );
          }),
          (l.PageLabel.prototype.getSDFObj = function () {
            return (
              P('getSDFObj', this.yieldFunction),
              l.sendWithPromise('PageLabel.getSDFObj', { l: this }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.PageSet.create = function () {
            return l.sendWithPromise('pageSetCreate', {}).then(function (t) {
              return D(l.PageSet, t);
            });
          }),
          (l.PageSet.createSinglePage = function (t) {
            return (
              f(arguments.length, 1, 'createSinglePage', '(number)', [[t, 'number']]),
              l.sendWithPromise('pageSetCreateSinglePage', { one_page: t }).then(function (t) {
                return D(l.PageSet, t);
              })
            );
          }),
          (l.PageSet.createRange = function (t, e) {
            return (
              f(arguments.length, 2, 'createRange', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('pageSetCreateRange', {
                  range_start: t,
                  range_end: e,
                })
                .then(function (t) {
                  return D(l.PageSet, t);
                })
            );
          }),
          (l.PageSet.createFilteredRange = function (t, e, n) {
            return (
              void 0 === n && (n = l.PageSet.Filter.e_all),
              f(arguments.length, 2, 'createFilteredRange', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('pageSetCreateFilteredRange', {
                  range_start: t,
                  range_end: e,
                  filter: n,
                })
                .then(function (t) {
                  return D(l.PageSet, t);
                })
            );
          }),
          (l.PageSet.prototype.addPage = function (t) {
            return (
              f(arguments.length, 1, 'addPage', '(number)', [[t, 'number']]),
              l.sendWithPromise('PageSet.addPage', {
                page_set: this.id,
                one_page: t,
              })
            );
          }),
          (l.PageSet.prototype.addRange = function (t, e, n) {
            return (
              void 0 === n && (n = l.PageSet.Filter.e_all),
              f(arguments.length, 2, 'addRange', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l.sendWithPromise('PageSet.addRange', {
                page_set: this.id,
                range_start: t,
                range_end: e,
                filter: n,
              })
            );
          }),
          (l.PatternColor.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('patternColorCreate', { pattern: t.id }).then(function (t) {
                return D(l.PatternColor, t);
              })
            );
          }),
          (l.PatternColor.getTypeFromObj = function (t) {
            return (
              f(arguments.length, 1, 'getTypeFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('patternColorGetTypeFromObj', { pattern: t.id })
            );
          }),
          (l.PatternColor.prototype.getType = function () {
            return l.sendWithPromise('PatternColor.getType', { pc: this.id });
          }),
          (l.PatternColor.prototype.getSDFObj = function () {
            return l.sendWithPromise('PatternColor.getSDFObj', { pc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PatternColor.prototype.getMatrix = function () {
            return l.sendWithPromise('PatternColor.getMatrix', { pc: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.PatternColor.prototype.getShading = function () {
            return l.sendWithPromise('PatternColor.getShading', { pc: this.id }).then(function (t) {
              return D(l.Shading, t);
            });
          }),
          (l.PatternColor.prototype.getTilingType = function () {
            return l.sendWithPromise('PatternColor.getTilingType', {
              pc: this.id,
            });
          }),
          (l.PatternColor.prototype.getBBox = function () {
            return l.sendWithPromise('PatternColor.getBBox', { pc: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.PatternColor.prototype.getXStep = function () {
            return l.sendWithPromise('PatternColor.getXStep', { pc: this.id });
          }),
          (l.PatternColor.prototype.getYStep = function () {
            return l.sendWithPromise('PatternColor.getYStep', { pc: this.id });
          }),
          (l.GeometryCollection.prototype.snapToNearest = function (t, e, n) {
            return (
              f(arguments.length, 3, 'snapToNearest', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l.sendWithPromise('GeometryCollection.snapToNearest', {
                self: this.id,
                x: t,
                y: e,
                mode: n,
              })
            );
          }),
          (l.GeometryCollection.prototype.snapToNearestPixel = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'snapToNearestPixel', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l.sendWithPromise('GeometryCollection.snapToNearestPixel', {
                self: this.id,
                x: t,
                y: e,
                dpi: n,
                mode: i,
              })
            );
          }),
          (l.DigestAlgorithm.calculateDigest = function (t, e) {
            f(arguments.length, 2, 'calculateDigest', '(number, ArrayBuffer|TypedArray)', [
              [t, 'number'],
              [e, 'ArrayBuffer'],
            ]);
            var n = b(e, !1);
            return l
              .sendWithPromise('digestAlgorithmCalculateDigest', {
                in_algorithm: t,
                in_buffer: n,
              })
              .then(function (t) {
                return new Uint8Array(t);
              });
          }),
          (l.ObjectIdentifier.createFromPredefined = function (t) {
            return (
              f(arguments.length, 1, 'createFromPredefined', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('objectIdentifierCreateFromPredefined', {
                  in_oid_enum: t,
                })
                .then(function (t) {
                  return D(l.ObjectIdentifier, t);
                })
            );
          }),
          (l.ObjectIdentifier.createFromIntArray = function (t) {
            return (
              f(arguments.length, 1, 'createFromIntArray', '(Array<number>)', [[t, 'Array']]),
              l
                .sendWithPromise('objectIdentifierCreateFromIntArray', {
                  in_list: t,
                })
                .then(function (t) {
                  return D(l.ObjectIdentifier, t);
                })
            );
          }),
          (l.ObjectIdentifier.createFromDigestAlgorithm = function (t) {
            return (
              f(arguments.length, 1, 'createFromDigestAlgorithm', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('objectIdentifierCreateFromDigestAlgorithm', {
                  in_algorithm: t,
                })
                .then(function (t) {
                  return D(l.ObjectIdentifier, t);
                })
            );
          }),
          (l.ObjectIdentifier.prototype.getRawValue = function () {
            return l.sendWithPromise('ObjectIdentifier.getRawValue', {
              self: this.id,
            });
          }),
          (l.X501DistinguishedName.prototype.hasAttribute = function (t) {
            return (
              f(arguments.length, 1, 'hasAttribute', '(PDFNet.ObjectIdentifier)', [[t, 'Object', l.ObjectIdentifier, 'ObjectIdentifier']]),
              l.sendWithPromise('X501DistinguishedName.hasAttribute', {
                self: this.id,
                in_oid: t.id,
              })
            );
          }),
          (l.X501DistinguishedName.prototype.getStringValuesForAttribute = function (t) {
            return (
              f(arguments.length, 1, 'getStringValuesForAttribute', '(PDFNet.ObjectIdentifier)', [[t, 'Object', l.ObjectIdentifier, 'ObjectIdentifier']]),
              l.sendWithPromise('X501DistinguishedName.getStringValuesForAttribute', { self: this.id, in_oid: t.id })
            );
          }),
          (l.X501DistinguishedName.prototype.getAllAttributesAndValues = function () {
            return l.sendWithPromise('X501DistinguishedName.getAllAttributesAndValues', { self: this.id }).then(function (t) {
              for (var e = [], n = 0; n < t.length; ++n) {
                var i = t[n];
                if ('0' === i) return null;
                (i = new l.X501AttributeTypeAndValue(i)), e.push(i), c.push({ name: i.name, id: i.id });
              }
              return e;
            });
          }),
          (l.X509Certificate.createFromBuffer = function (t) {
            f(arguments.length, 1, 'createFromBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l
              .sendWithPromise('x509CertificateCreateFromBuffer', {
                in_cert_buf: e,
              })
              .then(function (t) {
                return D(l.X509Certificate, t);
              });
          }),
          (l.X509Certificate.prototype.getIssuerField = function () {
            return l
              .sendWithPromise('X509Certificate.getIssuerField', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.X501DistinguishedName, t);
              });
          }),
          (l.X509Certificate.prototype.getSubjectField = function () {
            return l
              .sendWithPromise('X509Certificate.getSubjectField', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.X501DistinguishedName, t);
              });
          }),
          (l.X509Certificate.prototype.getNotBeforeEpochTime = function () {
            return l.sendWithPromise('X509Certificate.getNotBeforeEpochTime', {
              self: this.id,
            });
          }),
          (l.X509Certificate.prototype.getNotAfterEpochTime = function () {
            return l.sendWithPromise('X509Certificate.getNotAfterEpochTime', {
              self: this.id,
            });
          }),
          (l.X509Certificate.prototype.getRawX509VersionNumber = function () {
            return l.sendWithPromise('X509Certificate.getRawX509VersionNumber', { self: this.id });
          }),
          (l.X509Certificate.prototype.toString = function () {
            return l.sendWithPromise('X509Certificate.toString', {
              self: this.id,
            });
          }),
          (l.X509Certificate.prototype.getFingerprint = function (t) {
            return (
              void 0 === t && (t = l.DigestAlgorithm.Type.e_SHA256),
              f(arguments.length, 0, 'getFingerprint', '(number)', [[t, 'number']]),
              l.sendWithPromise('X509Certificate.getFingerprint', {
                self: this.id,
                in_digest_algorithm: t,
              })
            );
          }),
          (l.X509Certificate.prototype.getSerialNumber = function () {
            return l
              .sendWithPromise('X509Certificate.getSerialNumber', {
                self: this.id,
              })
              .then(function (t) {
                return new Uint8Array(t);
              });
          }),
          (l.X509Certificate.prototype.getExtensions = function () {
            return l
              .sendWithPromise('X509Certificate.getExtensions', {
                self: this.id,
              })
              .then(function (t) {
                for (var e = [], n = 0; n < t.length; ++n) {
                  var i = t[n];
                  if ('0' === i) return null;
                  (i = new l.X509Extension(i)), e.push(i), c.push({ name: i.name, id: i.id });
                }
                return e;
              });
          }),
          (l.X509Certificate.prototype.getData = function () {
            return l.sendWithPromise('X509Certificate.getData', { self: this.id }).then(function (t) {
              return new Uint8Array(t);
            });
          }),
          (l.TimestampingConfiguration.createFromURL = function (t) {
            return (
              f(arguments.length, 1, 'createFromURL', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('timestampingConfigurationCreateFromURL', {
                  in_url: t,
                })
                .then(function (t) {
                  return D(l.TimestampingConfiguration, t);
                })
            );
          }),
          (l.TimestampingConfiguration.prototype.setTimestampAuthorityServerURL = function (t) {
            return (
              f(arguments.length, 1, 'setTimestampAuthorityServerURL', '(string)', [[t, 'string']]),
              l.sendWithPromise('TimestampingConfiguration.setTimestampAuthorityServerURL', { self: this.id, in_url: t })
            );
          }),
          (l.TimestampingConfiguration.prototype.setTimestampAuthorityServerUsername = function (t) {
            return (
              f(arguments.length, 1, 'setTimestampAuthorityServerUsername', '(string)', [[t, 'string']]),
              l.sendWithPromise('TimestampingConfiguration.setTimestampAuthorityServerUsername', { self: this.id, in_username: t })
            );
          }),
          (l.TimestampingConfiguration.prototype.setTimestampAuthorityServerPassword = function (t) {
            return (
              f(arguments.length, 1, 'setTimestampAuthorityServerPassword', '(string)', [[t, 'string']]),
              l.sendWithPromise('TimestampingConfiguration.setTimestampAuthorityServerPassword', { self: this.id, in_password: t })
            );
          }),
          (l.TimestampingConfiguration.prototype.setUseNonce = function (t) {
            return (
              f(arguments.length, 1, 'setUseNonce', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('TimestampingConfiguration.setUseNonce', {
                self: this.id,
                in_use_nonce: t,
              })
            );
          }),
          (l.TimestampingConfiguration.prototype.testConfiguration = function (t) {
            return (
              f(arguments.length, 1, 'testConfiguration', '(PDFNet.VerificationOptions)', [[t, 'Object', l.VerificationOptions, 'VerificationOptions']]),
              l.sendWithPromise('TimestampingConfiguration.testConfiguration', { self: this.id, in_opts: t.id }).then(function (t) {
                return D(l.TimestampingResult, t);
              })
            );
          }),
          (l.DigitalSignatureField.prototype.hasCryptographicSignature = function () {
            return P('hasCryptographicSignature', this.yieldFunction), l.sendWithPromise('DigitalSignatureField.hasCryptographicSignature', { self: this });
          }),
          (l.DigitalSignatureField.prototype.getSubFilter = function () {
            return (
              P('getSubFilter', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getSubFilter', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getSignatureName = function () {
            return (
              P('getSignatureName', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getSignatureName', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getLocation = function () {
            return (
              P('getLocation', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getLocation', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getReason = function () {
            return (
              P('getReason', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getReason', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getContactInfo = function () {
            return (
              P('getContactInfo', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getContactInfo', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getCertCount = function () {
            return (
              P('getCertCount', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getCertCount', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.hasVisibleAppearance = function () {
            return P('hasVisibleAppearance', this.yieldFunction), l.sendWithPromise('DigitalSignatureField.hasVisibleAppearance', { self: this });
          }),
          (l.DigitalSignatureField.prototype.setContactInfo = function (t) {
            f(arguments.length, 1, 'setContactInfo', '(string)', [[t, 'string']]), P('setContactInfo', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setContactInfo'),
              l
                .sendWithPromise('DigitalSignatureField.setContactInfo', {
                  self: this,
                  in_contact_info: t,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.setLocation = function (t) {
            f(arguments.length, 1, 'setLocation', '(string)', [[t, 'string']]), P('setLocation', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setLocation'),
              l
                .sendWithPromise('DigitalSignatureField.setLocation', {
                  self: this,
                  in_location: t,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.setReason = function (t) {
            f(arguments.length, 1, 'setReason', '(string)', [[t, 'string']]), P('setReason', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setReason'),
              l
                .sendWithPromise('DigitalSignatureField.setReason', {
                  self: this,
                  in_reason: t,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.setDocumentPermissions = function (t) {
            f(arguments.length, 1, 'setDocumentPermissions', '(number)', [[t, 'number']]), P('setDocumentPermissions', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setDocumentPermissions'),
              l.sendWithPromise('DigitalSignatureField.setDocumentPermissions', { self: this, in_perms: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.DigitalSignatureField.prototype.signOnNextSave = function (t, e) {
            f(arguments.length, 2, 'signOnNextSave', '(string, string)', [
              [t, 'string'],
              [e, 'string'],
            ]),
              P('signOnNextSave', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.signOnNextSave'),
              l
                .sendWithPromise('DigitalSignatureField.signOnNextSave', {
                  self: this,
                  in_pkcs12_keyfile_path: t,
                  in_password: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.certifyOnNextSave = function (t, e) {
            f(arguments.length, 2, 'certifyOnNextSave', '(string, string)', [
              [t, 'string'],
              [e, 'string'],
            ]),
              P('certifyOnNextSave', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.certifyOnNextSave'),
              l
                .sendWithPromise('DigitalSignatureField.certifyOnNextSave', {
                  self: this,
                  in_pkcs12_keyfile_path: t,
                  in_password: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.isLockedByDigitalSignature = function () {
            return P('isLockedByDigitalSignature', this.yieldFunction), l.sendWithPromise('DigitalSignatureField.isLockedByDigitalSignature', { self: this });
          }),
          (l.DigitalSignatureField.prototype.getDocumentPermissions = function () {
            return P('getDocumentPermissions', this.yieldFunction), l.sendWithPromise('DigitalSignatureField.getDocumentPermissions', { self: this });
          }),
          (l.DigitalSignatureField.prototype.clearSignature = function () {
            P('clearSignature', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.clearSignature'),
              l
                .sendWithPromise('DigitalSignatureField.clearSignature', {
                  self: this,
                })
                .then(function (t) {
                  (e.yieldFunction = void 0), W(t, e);
                })
            );
          }),
          (l.DigitalSignatureField.createFromField = function (t) {
            return (
              f(arguments.length, 1, 'createFromField', '(PDFNet.Field)', [[t, 'Structure', l.Field, 'Field']]),
              F('createFromField', [[t, 0]]),
              l
                .sendWithPromise('digitalSignatureFieldCreateFromField', {
                  in_field: t,
                })
                .then(function (t) {
                  return new l.DigitalSignatureField(t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.getSigningTime = function () {
            return (
              P('getSigningTime', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.getSigningTime', {
                  self: this,
                })
                .then(function (t) {
                  return new l.Date(t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.getCert = function (t) {
            return (
              f(arguments.length, 1, 'getCert', '(number)', [[t, 'number']]),
              P('getCert', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.getCert', {
                  self: this,
                  in_index: t,
                })
                .then(function (t) {
                  return new Uint8Array(t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.setFieldPermissions = function (t, e) {
            void 0 === e && (e = []),
              f(arguments.length, 1, 'setFieldPermissions', '(number, Array<string>)', [
                [t, 'number'],
                [e, 'Array'],
              ]),
              P('setFieldPermissions', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setFieldPermissions'),
              l
                .sendWithPromise('DigitalSignatureField.setFieldPermissions', {
                  self: this,
                  in_action: t,
                  in_field_names_list: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.signOnNextSaveFromBuffer = function (t, e) {
            f(arguments.length, 2, 'signOnNextSaveFromBuffer', '(ArrayBuffer|TypedArray, string)', [
              [t, 'ArrayBuffer'],
              [e, 'string'],
            ]),
              P('signOnNextSaveFromBuffer', this.yieldFunction);
            var n = this,
              i = ((this.yieldFunction = 'DigitalSignatureField.signOnNextSaveFromBuffer'), b(t, !1));
            return l.sendWithPromise('DigitalSignatureField.signOnNextSaveFromBuffer', { self: this, in_pkcs12_buffer: i, in_password: e }).then(function (t) {
              (n.yieldFunction = void 0), W(t, n);
            });
          }),
          (l.DigitalSignatureField.prototype.signOnNextSaveWithCustomHandler = function (t) {
            f(arguments.length, 1, 'signOnNextSaveWithCustomHandler', '(number)', [[t, 'number']]), P('signOnNextSaveWithCustomHandler', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.signOnNextSaveWithCustomHandler'),
              l.sendWithPromise('DigitalSignatureField.signOnNextSaveWithCustomHandler', { self: this, in_signature_handler_id: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.DigitalSignatureField.prototype.certifyOnNextSaveFromBuffer = function (t, e) {
            f(arguments.length, 2, 'certifyOnNextSaveFromBuffer', '(ArrayBuffer|TypedArray, string)', [
              [t, 'ArrayBuffer'],
              [e, 'string'],
            ]),
              P('certifyOnNextSaveFromBuffer', this.yieldFunction);
            var n = this,
              i = ((this.yieldFunction = 'DigitalSignatureField.certifyOnNextSaveFromBuffer'), b(t, !1));
            return l
              .sendWithPromise('DigitalSignatureField.certifyOnNextSaveFromBuffer', { self: this, in_pkcs12_buffer: i, in_password: e })
              .then(function (t) {
                (n.yieldFunction = void 0), W(t, n);
              });
          }),
          (l.DigitalSignatureField.prototype.certifyOnNextSaveWithCustomHandler = function (t) {
            f(arguments.length, 1, 'certifyOnNextSaveWithCustomHandler', '(number)', [[t, 'number']]),
              P('certifyOnNextSaveWithCustomHandler', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.certifyOnNextSaveWithCustomHandler'),
              l.sendWithPromise('DigitalSignatureField.certifyOnNextSaveWithCustomHandler', { self: this, in_signature_handler_id: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getSDFObj = function () {
            return (
              P('getSDFObj', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.getSDFObj', {
                  self: this,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.getLockedFields = function () {
            return (
              P('getLockedFields', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getLockedFields', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.verify = function (t) {
            return (
              f(arguments.length, 1, 'verify', '(PDFNet.VerificationOptions)', [[t, 'Object', l.VerificationOptions, 'VerificationOptions']]),
              P('verify', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.verify', {
                  self: this,
                  in_opts: t.id,
                })
                .then(function (t) {
                  return D(l.VerificationResult, t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.isCertification = function () {
            return (
              P('isCertification', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.isCertification', {
                self: this,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getSignerCertFromCMS = function () {
            return (
              P('getSignerCertFromCMS', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.getSignerCertFromCMS', { self: this }).then(function (t) {
                return D(l.X509Certificate, t);
              })
            );
          }),
          (l.DigitalSignatureField.prototype.getByteRanges = function () {
            return (
              P('getByteRanges', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.getByteRanges', {
                  self: this,
                })
                .then(function (t) {
                  for (var e = [], n = 0; n < t.length; ++n) {
                    var i = t[n];
                    if ('0' === i) return null;
                    (i = new l.ByteRange(i)), e.push(i);
                  }
                  return e;
                })
            );
          }),
          (l.DigitalSignatureField.prototype.enableLTVOfflineVerification = function (t) {
            return (
              f(arguments.length, 1, 'enableLTVOfflineVerification', '(PDFNet.VerificationResult)', [
                [t, 'Object', l.VerificationResult, 'VerificationResult'],
              ]),
              P('enableLTVOfflineVerification', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.enableLTVOfflineVerification', { self: this, in_verification_result: t.id })
            );
          }),
          (l.DigitalSignatureField.prototype.timestampOnNextSave = function (t, e) {
            return (
              f(arguments.length, 2, 'timestampOnNextSave', '(PDFNet.TimestampingConfiguration, PDFNet.VerificationOptions)', [
                [t, 'Object', l.TimestampingConfiguration, 'TimestampingConfiguration'],
                [e, 'Object', l.VerificationOptions, 'VerificationOptions'],
              ]),
              P('timestampOnNextSave', this.yieldFunction),
              l.sendWithPromise('DigitalSignatureField.timestampOnNextSave', {
                self: this,
                in_timestamping_config: t.id,
                in_timestamp_response_verification_options: e.id,
              })
            );
          }),
          (l.DigitalSignatureField.prototype.generateContentsWithEmbeddedTimestamp = function (t, e) {
            return (
              f(arguments.length, 2, 'generateContentsWithEmbeddedTimestamp', '(PDFNet.TimestampingConfiguration, PDFNet.VerificationOptions)', [
                [t, 'Object', l.TimestampingConfiguration, 'TimestampingConfiguration'],
                [e, 'Object', l.VerificationOptions, 'VerificationOptions'],
              ]),
              P('generateContentsWithEmbeddedTimestamp', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.generateContentsWithEmbeddedTimestamp', {
                  self: this,
                  in_timestamping_config: t.id,
                  in_timestamp_response_verification_options: e.id,
                })
                .then(function (t) {
                  return D(l.TimestampingResult, t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.useSubFilter = function (t, e) {
            void 0 === e && (e = !0),
              f(arguments.length, 1, 'useSubFilter', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              P('useSubFilter', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.useSubFilter'),
              l
                .sendWithPromise('DigitalSignatureField.useSubFilter', {
                  self: this,
                  in_subfilter_type: t,
                  in_make_mandatory: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.calculateDigest = function (t) {
            void 0 === t && (t = l.DigestAlgorithm.Type.e_SHA256),
              f(arguments.length, 0, 'calculateDigest', '(number)', [[t, 'number']]),
              P('calculateDigest', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.calculateDigest'),
              l
                .sendWithPromise('DigitalSignatureField.calculateDigest', {
                  self: this,
                  in_digest_algorithm_type: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = new Uint8Array(t.result)), W(t.self, e), t.result;
                })
            );
          }),
          (l.DigitalSignatureField.prototype.setPreferredDigestAlgorithm = function (t, e) {
            void 0 === e && (e = !0),
              f(arguments.length, 1, 'setPreferredDigestAlgorithm', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              P('setPreferredDigestAlgorithm', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setPreferredDigestAlgorithm'),
              l
                .sendWithPromise('DigitalSignatureField.setPreferredDigestAlgorithm', {
                  self: this,
                  in_digest_algorithm_type: t,
                  in_make_mandatory: e,
                })
                .then(function (t) {
                  (n.yieldFunction = void 0), W(t, n);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.createSigDictForCustomCertification = function (t, e, n) {
            f(arguments.length, 3, 'createSigDictForCustomCertification', '(string, number, number)', [
              [t, 'string'],
              [e, 'number'],
              [n, 'number'],
            ]),
              P('createSigDictForCustomCertification', this.yieldFunction);
            var i = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.createSigDictForCustomCertification'),
              l
                .sendWithPromise('DigitalSignatureField.createSigDictForCustomCertification', {
                  self: this,
                  in_filter_name: t,
                  in_subfilter_type: e,
                  in_contents_size_to_reserve: n,
                })
                .then(function (t) {
                  (i.yieldFunction = void 0), W(t, i);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.createSigDictForCustomSigning = function (t, e, n) {
            f(arguments.length, 3, 'createSigDictForCustomSigning', '(string, number, number)', [
              [t, 'string'],
              [e, 'number'],
              [n, 'number'],
            ]),
              P('createSigDictForCustomSigning', this.yieldFunction);
            var i = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.createSigDictForCustomSigning'),
              l
                .sendWithPromise('DigitalSignatureField.createSigDictForCustomSigning', {
                  self: this,
                  in_filter_name: t,
                  in_subfilter_type: e,
                  in_contents_size_to_reserve: n,
                })
                .then(function (t) {
                  (i.yieldFunction = void 0), W(t, i);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.setSigDictTimeOfSigning = function (t) {
            f(arguments.length, 1, 'setSigDictTimeOfSigning', '(PDFNet.Date)', [[t, 'Structure', l.Date, 'Date']]),
              P('setSigDictTimeOfSigning', this.yieldFunction),
              F('setSigDictTimeOfSigning', [[t, 0]]);
            var e = this;
            return (
              (this.yieldFunction = 'DigitalSignatureField.setSigDictTimeOfSigning'),
              l.sendWithPromise('DigitalSignatureField.setSigDictTimeOfSigning', { self: this, in_date: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.DigitalSignatureField.signDigestBuffer = function (t, e, n, i, r) {
            f(arguments.length, 5, 'signDigestBuffer', '(ArrayBuffer|TypedArray, ArrayBuffer|TypedArray, string, boolean, number)', [
              [t, 'ArrayBuffer'],
              [e, 'ArrayBuffer'],
              [n, 'string'],
              [i, 'boolean'],
              [r, 'number'],
            ]);
            var o = b(t, !1),
              s = b(e, !1);
            return l
              .sendWithPromise('digitalSignatureFieldSignDigestBuffer', {
                in_digest_buf: o,
                in_pkcs12_buffer: s,
                in_keyfile_password: n,
                in_pades_mode: i,
                in_digest_algorithm_type: r,
              })
              .then(function (t) {
                return new Uint8Array(t);
              });
          }),
          (l.DigitalSignatureField.generateESSSigningCertPAdESAttribute = function (t, e) {
            return (
              f(arguments.length, 2, 'generateESSSigningCertPAdESAttribute', '(PDFNet.X509Certificate, number)', [
                [t, 'Object', l.X509Certificate, 'X509Certificate'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('digitalSignatureFieldGenerateESSSigningCertPAdESAttribute', { in_signer_cert: t.id, in_digest_algorithm_type: e })
                .then(function (t) {
                  return new Uint8Array(t);
                })
            );
          }),
          (l.DigitalSignatureField.generateCMSSignedAttributes = function (t, e) {
            void 0 === e && (e = new ArrayBuffer(0)),
              f(arguments.length, 1, 'generateCMSSignedAttributes', '(ArrayBuffer|TypedArray, ArrayBuffer|TypedArray)', [
                [t, 'ArrayBuffer'],
                [e, 'ArrayBuffer'],
              ]);
            var n = b(t, !1),
              i = b(e, !1);
            return l
              .sendWithPromise('digitalSignatureFieldGenerateCMSSignedAttributes', { in_digest_buf: n, in_custom_signedattributes_buf: i })
              .then(function (t) {
                return new Uint8Array(t);
              });
          }),
          (l.DigitalSignatureField.generateCMSSignature = function (t, e, n, i, r, o) {
            f(
              arguments.length,
              6,
              'generateCMSSignature',
              '(PDFNet.X509Certificate, Array<Core.PDFNet.X509Certificate>, PDFNet.ObjectIdentifier, PDFNet.ObjectIdentifier, ArrayBuffer|TypedArray, ArrayBuffer|TypedArray)',
              [
                [t, 'Object', l.X509Certificate, 'X509Certificate'],
                [e, 'Array'],
                [n, 'Object', l.ObjectIdentifier, 'ObjectIdentifier'],
                [i, 'Object', l.ObjectIdentifier, 'ObjectIdentifier'],
                [r, 'ArrayBuffer'],
                [o, 'ArrayBuffer'],
              ],
            );
            var s = b(r, !1),
              u = b(o, !1);
            return (
              (e = Array.from(e, function (t) {
                return t.id;
              })),
              l
                .sendWithPromise('digitalSignatureFieldGenerateCMSSignature', {
                  in_signer_cert: t.id,
                  in_chain_certs_list: e,
                  in_digest_algorithm_oid: n.id,
                  in_signature_algorithm_oid: i.id,
                  in_signature_value_buf: s,
                  in_signedattributes_buf: u,
                })
                .then(function (t) {
                  return new Uint8Array(t);
                })
            );
          }),
          (l.PDFDoc.prototype.getTriggerAction = function (t) {
            return (
              f(arguments.length, 1, 'getTriggerAction', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.getTriggerAction', {
                  doc: this.id,
                  trigger: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.isXFA = function () {
            return l.sendWithPromise('PDFDoc.isXFA', { doc: this.id });
          }),
          (l.PDFDoc.create = function () {
            return l.sendWithPromise('pdfDocCreate', {}).then(function (t) {
              return D(l.PDFDoc, t);
            });
          }),
          (l.PDFDoc.createFromFilter = function (t) {
            return (
              f(arguments.length, 1, 'createFromFilter', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              0 != t.id && O(t.id),
              l
                .sendWithPromise('pdfDocCreateFromFilter', {
                  no_own_stream: t.id,
                })
                .then(function (t) {
                  return D(l.PDFDoc, t);
                })
            );
          }),
          (l.PDFDoc.createFromBuffer = function (t) {
            f(arguments.length, 1, 'createFromBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('pdfDocCreateFromBuffer', { buf: e }).then(function (t) {
              return D(l.PDFDoc, t);
            });
          }),
          (l.PDFDoc.createFromLayoutEls = function (t) {
            f(arguments.length, 1, 'createFromLayoutEls', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('pdfDocCreateFromLayoutEls', { buf: e }).then(function (t) {
              return D(l.PDFDoc, t);
            });
          }),
          (l.PDFDoc.prototype.createShallowCopy = function () {
            return l.sendWithPromise('PDFDoc.createShallowCopy', { source: this.id }).then(function (t) {
              return D(l.PDFDoc, t);
            });
          }),
          (l.PDFDoc.prototype.isEncrypted = function () {
            return l.sendWithPromise('PDFDoc.isEncrypted', { doc: this.id });
          }),
          (l.PDFDoc.prototype.initStdSecurityHandlerUString = function (t) {
            return (
              f(arguments.length, 1, 'initStdSecurityHandlerUString', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDoc.initStdSecurityHandlerUString', {
                doc: this.id,
                password: t,
              })
            );
          }),
          (l.PDFDoc.prototype.initStdSecurityHandlerBuffer = function (t) {
            f(arguments.length, 1, 'initStdSecurityHandlerBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('PDFDoc.initStdSecurityHandlerBuffer', {
              doc: this.id,
              password_buf: e,
            });
          }),
          (l.PDFDoc.prototype.getSecurityHandler = function () {
            return l.sendWithPromise('PDFDoc.getSecurityHandler', { doc: this.id }).then(function (t) {
              return _(l.SecurityHandler, t);
            });
          }),
          (l.PDFDoc.prototype.setSecurityHandler = function (t) {
            return (
              f(arguments.length, 1, 'setSecurityHandler', '(PDFNet.SecurityHandler)', [[t, 'Object', l.SecurityHandler, 'SecurityHandler']]),
              0 != t.id && O(t.id),
              l.sendWithPromise('PDFDoc.setSecurityHandler', {
                doc: this.id,
                no_own_handler: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.removeSecurity = function () {
            return l.sendWithPromise('PDFDoc.removeSecurity', { doc: this.id });
          }),
          (l.PDFDoc.prototype.getDocInfo = function () {
            return l.sendWithPromise('PDFDoc.getDocInfo', { doc: this.id }).then(function (t) {
              return _(l.PDFDocInfo, t);
            });
          }),
          (l.PDFDoc.prototype.getViewPrefs = function () {
            return l.sendWithPromise('PDFDoc.getViewPrefs', { doc: this.id }).then(function (t) {
              return _(l.PDFDocViewPrefs, t);
            });
          }),
          (l.PDFDoc.prototype.isModified = function () {
            return l.sendWithPromise('PDFDoc.isModified', { doc: this.id });
          }),
          (l.PDFDoc.prototype.hasRepairedXRef = function () {
            return l.sendWithPromise('PDFDoc.hasRepairedXRef', {
              doc: this.id,
            });
          }),
          (l.PDFDoc.prototype.isLinearized = function () {
            return l.sendWithPromise('PDFDoc.isLinearized', { doc: this.id });
          }),
          (l.PDFDoc.prototype.saveMemoryBuffer = function (t) {
            return (
              f(arguments.length, 1, 'saveMemoryBuffer', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.saveMemoryBuffer', {
                  doc: this.id,
                  flags: t,
                })
                .then(function (t) {
                  return new Uint8Array(t);
                })
            );
          }),
          (l.PDFDoc.prototype.saveStream = function (t, e) {
            return (
              f(arguments.length, 2, 'saveStream', '(PDFNet.Filter, number)', [
                [t, 'Object', l.Filter, 'Filter'],
                [e, 'number'],
              ]),
              l.sendWithPromise('PDFDoc.saveStream', {
                doc: this.id,
                stream: t.id,
                flags: e,
              })
            );
          }),
          (l.PDFDoc.prototype.saveCustomSignatureBuffer = function (t, e) {
            f(arguments.length, 2, 'saveCustomSignatureBuffer', '(ArrayBuffer|TypedArray, PDFNet.DigitalSignatureField)', [
              [t, 'ArrayBuffer'],
              [e, 'Structure', l.DigitalSignatureField, 'DigitalSignatureField'],
            ]),
              F('saveCustomSignatureBuffer', [[e, 1]]);
            var n = b(t, !1);
            return l
              .sendWithPromise('PDFDoc.saveCustomSignatureBuffer', {
                doc: this.id,
                in_signature_buf: n,
                in_field: e,
              })
              .then(function (t) {
                return new Uint8Array(t);
              });
          }),
          (l.PDFDoc.prototype.saveCustomSignatureStream = function (t, e) {
            f(arguments.length, 2, 'saveCustomSignatureStream', '(ArrayBuffer|TypedArray, PDFNet.DigitalSignatureField)', [
              [t, 'ArrayBuffer'],
              [e, 'Structure', l.DigitalSignatureField, 'DigitalSignatureField'],
            ]),
              F('saveCustomSignatureStream', [[e, 1]]);
            var n = b(t, !1);
            return l
              .sendWithPromise('PDFDoc.saveCustomSignatureStream', {
                doc: this.id,
                in_signature_buf: n,
                in_field: e,
              })
              .then(function (t) {
                return D(l.Filter, t);
              });
          }),
          (l.PDFDoc.prototype.getPageIterator = function (t) {
            return (
              void 0 === t && (t = 1),
              f(arguments.length, 0, 'getPageIterator', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.getPageIterator', {
                  doc: this.id,
                  page_number: t,
                })
                .then(function (t) {
                  return D(l.Iterator, t, 'Page');
                })
            );
          }),
          (l.PDFDoc.prototype.getPage = function (t) {
            return (
              f(arguments.length, 1, 'getPage', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.getPage', {
                  doc: this.id,
                  page_number: t,
                })
                .then(function (t) {
                  return _(l.Page, t);
                })
            );
          }),
          (l.PDFDoc.prototype.pageRemove = function (t) {
            return (
              f(arguments.length, 1, 'pageRemove', '(PDFNet.Iterator)', [[t, 'Object', l.Iterator, 'Iterator']]),
              l.sendWithPromise('PDFDoc.pageRemove', {
                doc: this.id,
                page_itr: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.pageInsert = function (t, e) {
            return (
              f(arguments.length, 2, 'pageInsert', '(PDFNet.Iterator, PDFNet.Page)', [
                [t, 'Object', l.Iterator, 'Iterator'],
                [e, 'Object', l.Page, 'Page'],
              ]),
              l.sendWithPromise('PDFDoc.pageInsert', {
                doc: this.id,
                where: t.id,
                page: e.id,
              })
            );
          }),
          (l.PDFDoc.prototype.insertPages = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'insertPages', '(number, PDFNet.PDFDoc, number, number, number)', [
                [t, 'number'],
                [e, 'PDFDoc'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l.sendWithPromise('PDFDoc.insertPages', {
                dest_doc: this.id,
                insert_before_page_number: t,
                src_doc: e.id,
                start_page: n,
                end_page: i,
                flag: r,
              })
            );
          }),
          (l.PDFDoc.prototype.insertPageSet = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'insertPageSet', '(number, PDFNet.PDFDoc, PDFNet.PageSet, number)', [
                [t, 'number'],
                [e, 'PDFDoc'],
                [n, 'Object', l.PageSet, 'PageSet'],
                [i, 'number'],
              ]),
              l.sendWithPromise('PDFDoc.insertPageSet', {
                dest_doc: this.id,
                insert_before_page_number: t,
                src_doc: e.id,
                source_page_set: n.id,
                flag: i,
              })
            );
          }),
          (l.PDFDoc.prototype.movePages = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'movePages', '(number, PDFNet.PDFDoc, number, number, number)', [
                [t, 'number'],
                [e, 'PDFDoc'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l.sendWithPromise('PDFDoc.movePages', {
                dest_doc: this.id,
                move_before_page_number: t,
                src_doc: e.id,
                start_page: n,
                end_page: i,
                flag: r,
              })
            );
          }),
          (l.PDFDoc.prototype.movePageSet = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'movePageSet', '(number, PDFNet.PDFDoc, PDFNet.PageSet, number)', [
                [t, 'number'],
                [e, 'PDFDoc'],
                [n, 'Object', l.PageSet, 'PageSet'],
                [i, 'number'],
              ]),
              l.sendWithPromise('PDFDoc.movePageSet', {
                dest_doc: this.id,
                move_before_page_number: t,
                src_doc: e.id,
                source_page_set: n.id,
                flag: i,
              })
            );
          }),
          (l.PDFDoc.prototype.pagePushFront = function (t) {
            return (
              f(arguments.length, 1, 'pagePushFront', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('PDFDoc.pagePushFront', {
                doc: this.id,
                page: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.pagePushBack = function (t) {
            return (
              f(arguments.length, 1, 'pagePushBack', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('PDFDoc.pagePushBack', {
                doc: this.id,
                page: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.pageCreate = function (t) {
            return (
              void 0 === t && (t = new l.Rect(0, 0, 612, 792)),
              f(arguments.length, 0, 'pageCreate', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('pageCreate', [[t, 0]]),
              l
                .sendWithPromise('PDFDoc.pageCreate', {
                  doc: this.id,
                  media_box: t,
                })
                .then(function (t) {
                  return _(l.Page, t);
                })
            );
          }),
          (l.PDFDoc.prototype.appendTextDiffPage = function (t, e) {
            return (
              f(arguments.length, 2, 'appendTextDiffPage', '(PDFNet.Page, PDFNet.Page)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'Object', l.Page, 'Page'],
              ]),
              l.sendWithPromise('PDFDoc.appendTextDiffPage', {
                doc: this.id,
                page1: t.id,
                page2: e.id,
              })
            );
          }),
          (l.PDFDoc.prototype.appendTextDiffDoc = function (t, e, n) {
            return (
              void 0 === n && (n = null),
              f(arguments.length, 2, 'appendTextDiffDoc', '(PDFNet.PDFDoc, PDFNet.PDFDoc, PDFNet.OptionBase)', [
                [t, 'PDFDoc'],
                [e, 'PDFDoc'],
                [n, 'OptionBase'],
              ]),
              F('appendTextDiffDoc', [[n, 2]]),
              (n = n ? n.getJsonString() : '{}'),
              l.sendWithPromise('PDFDoc.appendTextDiffDoc', {
                doc: this.id,
                doc1: t.id,
                doc2: e.id,
                options: n,
              })
            );
          }),
          (l.PDFDoc.highlightTextDiff = function (t, e, n) {
            return (
              void 0 === n && (n = null),
              f(arguments.length, 2, 'highlightTextDiff', '(PDFNet.PDFDoc, PDFNet.PDFDoc, PDFNet.OptionBase)', [
                [t, 'PDFDoc'],
                [e, 'PDFDoc'],
                [n, 'OptionBase'],
              ]),
              F('highlightTextDiff', [[n, 2]]),
              (n = n ? n.getJsonString() : '{}'),
              l.sendWithPromise('pdfDocHighlightTextDiff', {
                doc1: t.id,
                doc2: e.id,
                options: n,
              })
            );
          }),
          (l.PDFDoc.prototype.getFirstBookmark = function () {
            return l.sendWithPromise('PDFDoc.getFirstBookmark', { doc: this.id }).then(function (t) {
              return _(l.Bookmark, t);
            });
          }),
          (l.PDFDoc.prototype.addRootBookmark = function (t) {
            return (
              f(arguments.length, 1, 'addRootBookmark', '(PDFNet.Bookmark)', [[t, 'Object', l.Bookmark, 'Bookmark']]),
              l.sendWithPromise('PDFDoc.addRootBookmark', {
                doc: this.id,
                root_bookmark: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.getTrailer = function () {
            return l.sendWithPromise('PDFDoc.getTrailer', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.getRoot = function () {
            return l.sendWithPromise('PDFDoc.getRoot', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.jsContextInitialize = function () {
            return l.sendWithPromise('PDFDoc.jsContextInitialize', {
              doc: this.id,
            });
          }),
          (l.PDFDoc.prototype.getPages = function () {
            return l.sendWithPromise('PDFDoc.getPages', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.getPageCount = function () {
            return l.sendWithPromise('PDFDoc.getPageCount', { doc: this.id });
          }),
          (l.PDFDoc.prototype.getDownloadedByteCount = function () {
            return l.sendWithPromise('PDFDoc.getDownloadedByteCount', {
              doc: this.id,
            });
          }),
          (l.PDFDoc.prototype.getTotalRemoteByteCount = function () {
            return l.sendWithPromise('PDFDoc.getTotalRemoteByteCount', {
              doc: this.id,
            });
          }),
          (l.PDFDoc.prototype.getFieldIteratorBegin = function () {
            return l.sendWithPromise('PDFDoc.getFieldIteratorBegin', { doc: this.id }).then(function (t) {
              return D(l.Iterator, t, 'Field');
            });
          }),
          (l.PDFDoc.prototype.getFieldIterator = function (t) {
            return (
              f(arguments.length, 1, 'getFieldIterator', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('PDFDoc.getFieldIterator', {
                  doc: this.id,
                  field_name: t,
                })
                .then(function (t) {
                  return D(l.Iterator, t, 'Field');
                })
            );
          }),
          (l.PDFDoc.prototype.getField = function (t) {
            return (
              f(arguments.length, 1, 'getField', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('PDFDoc.getField', {
                  doc: this.id,
                  field_name: t,
                })
                .then(function (t) {
                  return new l.Field(t);
                })
            );
          }),
          (l.PDFDoc.prototype.fieldCreate = function (t, e, n, i) {
            return (
              void 0 === n && (n = new l.Obj('0')),
              void 0 === i && (i = new l.Obj('0')),
              f(arguments.length, 2, 'fieldCreate', '(string, number, PDFNet.Obj, PDFNet.Obj)', [
                [t, 'string'],
                [e, 'number'],
                [n, 'Object', l.Obj, 'Obj'],
                [i, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('PDFDoc.fieldCreate', {
                  doc: this.id,
                  field_name: t,
                  type: e,
                  field_value: n.id,
                  def_field_value: i.id,
                })
                .then(function (t) {
                  return new l.Field(t);
                })
            );
          }),
          (l.PDFDoc.prototype.fieldCreateFromStrings = function (t, e, n, i) {
            return (
              void 0 === i && (i = ''),
              f(arguments.length, 3, 'fieldCreateFromStrings', '(string, number, string, string)', [
                [t, 'string'],
                [e, 'number'],
                [n, 'string'],
                [i, 'string'],
              ]),
              l
                .sendWithPromise('PDFDoc.fieldCreateFromStrings', {
                  doc: this.id,
                  field_name: t,
                  type: e,
                  field_value: n,
                  def_field_value: i,
                })
                .then(function (t) {
                  return new l.Field(t);
                })
            );
          }),
          (l.PDFDoc.prototype.refreshFieldAppearances = function () {
            return l.sendWithPromise('PDFDoc.refreshFieldAppearances', {
              doc: this.id,
            });
          }),
          (l.PDFDoc.prototype.refreshAnnotAppearances = function (t) {
            return (
              void 0 === t && (t = null),
              f(arguments.length, 0, 'refreshAnnotAppearances', '(PDFNet.OptionBase)', [[t, 'OptionBase']]),
              F('refreshAnnotAppearances', [[t, 0]]),
              (t = t ? t.getJsonString() : '{}'),
              l.sendWithPromise('PDFDoc.refreshAnnotAppearances', {
                doc: this.id,
                options: t,
              })
            );
          }),
          (l.PDFDoc.prototype.flattenAnnotations = function (t) {
            return (
              void 0 === t && (t = !1),
              f(arguments.length, 0, 'flattenAnnotations', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDoc.flattenAnnotations', {
                doc: this.id,
                forms_only: t,
              })
            );
          }),
          (l.PDFDoc.prototype.getAcroForm = function () {
            return l.sendWithPromise('PDFDoc.getAcroForm', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.fdfExtract = function (t) {
            return (
              void 0 === t && (t = l.PDFDoc.ExtractFlag.e_forms_only),
              f(arguments.length, 0, 'fdfExtract', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDoc.fdfExtract', { doc: this.id, flag: t }).then(function (t) {
                return D(l.FDFDoc, t);
              })
            );
          }),
          (l.PDFDoc.prototype.fdfExtractPageSet = function (t, e) {
            return (
              void 0 === e && (e = l.PDFDoc.ExtractFlag.e_forms_only),
              f(arguments.length, 1, 'fdfExtractPageSet', '(PDFNet.PageSet, number)', [
                [t, 'Object', l.PageSet, 'PageSet'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('PDFDoc.fdfExtractPageSet', {
                  doc: this.id,
                  pages_to_extract: t.id,
                  flag: e,
                })
                .then(function (t) {
                  return D(l.FDFDoc, t);
                })
            );
          }),
          (l.PDFDoc.prototype.fdfMerge = function (t) {
            return (
              f(arguments.length, 1, 'fdfMerge', '(PDFNet.FDFDoc)', [[t, 'FDFDoc']]),
              l.sendWithPromise('PDFDoc.fdfMerge', {
                doc: this.id,
                fdf_doc: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.fdfUpdate = function (t) {
            return (
              f(arguments.length, 1, 'fdfUpdate', '(PDFNet.FDFDoc)', [[t, 'FDFDoc']]),
              l.sendWithPromise('PDFDoc.fdfUpdate', {
                doc: this.id,
                fdf_doc: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.getOpenAction = function () {
            return l.sendWithPromise('PDFDoc.getOpenAction', { doc: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.PDFDoc.prototype.setOpenAction = function (t) {
            return (
              f(arguments.length, 1, 'setOpenAction', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('PDFDoc.setOpenAction', {
                doc: this.id,
                action: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.addFileAttachment = function (t, e) {
            return (
              f(arguments.length, 2, 'addFileAttachment', '(string, PDFNet.FileSpec)', [
                [t, 'string'],
                [e, 'Object', l.FileSpec, 'FileSpec'],
              ]),
              l.sendWithPromise('PDFDoc.addFileAttachment', {
                doc: this.id,
                file_key: t,
                embedded_file: e.id,
              })
            );
          }),
          (l.PDFDoc.prototype.getPageLabel = function (t) {
            return (
              f(arguments.length, 1, 'getPageLabel', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.getPageLabel', {
                  doc: this.id,
                  page_num: t,
                })
                .then(function (t) {
                  return new l.PageLabel(t);
                })
            );
          }),
          (l.PDFDoc.prototype.setPageLabel = function (t, e) {
            return (
              f(arguments.length, 2, 'setPageLabel', '(number, PDFNet.PageLabel)', [
                [t, 'number'],
                [e, 'Structure', l.PageLabel, 'PageLabel'],
              ]),
              F('setPageLabel', [[e, 1]]),
              l.sendWithPromise('PDFDoc.setPageLabel', {
                doc: this.id,
                page_num: t,
                label: e,
              })
            );
          }),
          (l.PDFDoc.prototype.removePageLabel = function (t) {
            return (
              f(arguments.length, 1, 'removePageLabel', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDoc.removePageLabel', {
                doc: this.id,
                page_num: t,
              })
            );
          }),
          (l.PDFDoc.prototype.getStructTree = function () {
            return l.sendWithPromise('PDFDoc.getStructTree', { doc: this.id }).then(function (t) {
              return _(l.STree, t);
            });
          }),
          (l.PDFDoc.prototype.hasOC = function () {
            return l.sendWithPromise('PDFDoc.hasOC', { doc: this.id });
          }),
          (l.PDFDoc.prototype.getOCGs = function () {
            return l.sendWithPromise('PDFDoc.getOCGs', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.getOCGConfig = function () {
            return l.sendWithPromise('PDFDoc.getOCGConfig', { doc: this.id }).then(function (t) {
              return _(l.OCGConfig, t);
            });
          }),
          (l.PDFDoc.prototype.createIndirectName = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectName', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('PDFDoc.createIndirectName', {
                  doc: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.createIndirectArray = function () {
            return l.sendWithPromise('PDFDoc.createIndirectArray', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.createIndirectBool = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectBool', '(boolean)', [[t, 'boolean']]),
              l
                .sendWithPromise('PDFDoc.createIndirectBool', {
                  doc: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.createIndirectDict = function () {
            return l.sendWithPromise('PDFDoc.createIndirectDict', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.createIndirectNull = function () {
            return l.sendWithPromise('PDFDoc.createIndirectNull', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDoc.prototype.createIndirectNumber = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectNumber', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.createIndirectNumber', {
                  doc: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.createIndirectString = function (t, e) {
            return (
              f(arguments.length, 2, 'createIndirectString', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('PDFDoc.createIndirectString', {
                  doc: this.id,
                  value: t,
                  buf_size: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.createIndirectStringFromUString = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectStringFromUString', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('PDFDoc.createIndirectStringFromUString', {
                  doc: this.id,
                  str: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.createIndirectStreamFromFilter = function (t, e) {
            return (
              void 0 === e && (e = new l.Filter('0')),
              f(arguments.length, 1, 'createIndirectStreamFromFilter', '(PDFNet.FilterReader, PDFNet.Filter)', [
                [t, 'Object', l.FilterReader, 'FilterReader'],
                [e, 'Object', l.Filter, 'Filter'],
              ]),
              0 != e.id && O(e.id),
              l
                .sendWithPromise('PDFDoc.createIndirectStreamFromFilter', {
                  doc: this.id,
                  data: t.id,
                  no_own_filter_chain: e.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.createIndirectStream = function (t, e) {
            f(arguments.length, 2, 'createIndirectStream', '(ArrayBuffer|TypedArray, PDFNet.Filter)', [
              [t, 'ArrayBuffer'],
              [e, 'Object', l.Filter, 'Filter'],
            ]);
            var n = b(t, !1);
            return (
              0 != e.id && O(e.id),
              l
                .sendWithPromise('PDFDoc.createIndirectStream', {
                  doc: this.id,
                  data_buf: n,
                  no_own_filter_chain: e.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.PDFDoc.prototype.getSDFDoc = function () {
            return l.sendWithPromise('PDFDoc.getSDFDoc', { doc: this.id }).then(function (t) {
              return _(l.SDFDoc, t);
            });
          }),
          (l.PDFDoc.prototype.unlock = function () {
            var t = this;
            return l.sendWithPromise('PDFDoc.unlock', { doc: this.id }).then(function () {
              S(t);
            });
          }),
          (l.PDFDoc.prototype.unlockRead = function () {
            var t = this;
            return l.sendWithPromise('PDFDoc.unlockRead', { doc: this.id }).then(function () {
              S(t);
            });
          }),
          (l.PDFDoc.prototype.addHighlights = function (t) {
            return (
              f(arguments.length, 1, 'addHighlights', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDoc.addHighlights', {
                doc: this.id,
                hilite: t,
              })
            );
          }),
          (l.PDFDoc.prototype.isTagged = function () {
            return l.sendWithPromise('PDFDoc.isTagged', { doc: this.id });
          }),
          (l.PDFDoc.prototype.hasSignatures = function () {
            return l.sendWithPromise('PDFDoc.hasSignatures', { doc: this.id });
          }),
          (l.PDFDoc.prototype.addSignatureHandler = function (t) {
            return (
              f(arguments.length, 1, 'addSignatureHandler', '(PDFNet.SignatureHandler)', [[t, 'Object', l.SignatureHandler, 'SignatureHandler']]),
              l.sendWithPromise('PDFDoc.addSignatureHandler', {
                doc: this.id,
                signature_handler: t.id,
              })
            );
          }),
          (l.PDFDoc.prototype.addStdSignatureHandlerFromBuffer = function (t, e) {
            f(arguments.length, 2, 'addStdSignatureHandlerFromBuffer', '(ArrayBuffer|TypedArray, string)', [
              [t, 'ArrayBuffer'],
              [e, 'string'],
            ]);
            var n = b(t, !1);
            return l.sendWithPromise('PDFDoc.addStdSignatureHandlerFromBuffer', { doc: this.id, pkcs12_buffer: n, pkcs12_pass: e });
          }),
          (l.PDFDoc.prototype.removeSignatureHandler = function (t) {
            return (
              f(arguments.length, 1, 'removeSignatureHandler', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDoc.removeSignatureHandler', {
                doc: this.id,
                signature_handler_id: t,
              })
            );
          }),
          (l.PDFDoc.prototype.getSignatureHandler = function (t) {
            return (
              f(arguments.length, 1, 'getSignatureHandler', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.getSignatureHandler', {
                  doc: this.id,
                  signature_handler_id: t,
                })
                .then(function (t) {
                  return _(l.SignatureHandler, t);
                })
            );
          }),
          (l.PDFDoc.prototype.generateThumbnails = function (t) {
            return (
              f(arguments.length, 1, 'generateThumbnails', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDoc.generateThumbnails', {
                doc: this.id,
                size: t,
              })
            );
          }),
          (l.PDFDoc.prototype.appendVisualDiff = function (t, e, n) {
            return (
              void 0 === n && (n = null),
              f(arguments.length, 2, 'appendVisualDiff', '(PDFNet.Page, PDFNet.Page, PDFNet.OptionBase)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'Object', l.Page, 'Page'],
                [n, 'OptionBase'],
              ]),
              F('appendVisualDiff', [[n, 2]]),
              (n = n ? n.getJsonString() : '{}'),
              l.sendWithPromise('PDFDoc.appendVisualDiff', {
                doc: this.id,
                p1: t.id,
                p2: e.id,
                opts: n,
              })
            );
          }),
          (l.PDFDoc.prototype.getGeometryCollectionForPage = function (t) {
            return (
              f(arguments.length, 1, 'getGeometryCollectionForPage', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('PDFDoc.getGeometryCollectionForPage', {
                  in_pdfdoc: this.id,
                  page_num: t,
                })
                .then(function (t) {
                  return D(l.GeometryCollection, t);
                })
            );
          }),
          (l.PDFDoc.prototype.getGeometryCollectionForPageWithOptions = function (t, e) {
            return (
              void 0 === e && (e = null),
              f(arguments.length, 1, 'getGeometryCollectionForPageWithOptions', '(number, PDFNet.OptionBase)', [
                [t, 'number'],
                [e, 'OptionBase'],
              ]),
              F('getGeometryCollectionForPageWithOptions', [[e, 1]]),
              (e = e ? e.getJsonString() : '{}'),
              l.sendWithPromise('PDFDoc.getGeometryCollectionForPageWithOptions', { in_pdfdoc: this.id, page_num: t, options: e }).then(function (t) {
                return D(l.GeometryCollection, t);
              })
            );
          }),
          (l.PDFDoc.prototype.getUndoManager = function () {
            return l.sendWithPromise('PDFDoc.getUndoManager', { doc: this.id }).then(function (t) {
              return D(l.UndoManager, t);
            });
          }),
          (l.PDFDoc.prototype.createDigitalSignatureField = function (t) {
            return (
              void 0 === t && (t = ''),
              f(arguments.length, 0, 'createDigitalSignatureField', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('PDFDoc.createDigitalSignatureField', {
                  doc: this.id,
                  in_sig_field_name: t,
                })
                .then(function (t) {
                  return new l.DigitalSignatureField(t);
                })
            );
          }),
          (l.PDFDoc.prototype.getDigitalSignatureFieldIteratorBegin = function () {
            return l.sendWithPromise('PDFDoc.getDigitalSignatureFieldIteratorBegin', { doc: this.id }).then(function (t) {
              return D(l.Iterator, t, 'DigitalSignatureField');
            });
          }),
          (l.PDFDoc.prototype.getDigitalSignaturePermissions = function () {
            return l.sendWithPromise('PDFDoc.getDigitalSignaturePermissions', {
              doc: this.id,
            });
          }),
          (l.PDFDoc.prototype.saveViewerOptimizedBuffer = function (t) {
            f(arguments.length, 1, 'saveViewerOptimizedBuffer', '(PDFNet.Obj)', [[t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.PDFDoc.ViewerOptimizedOptions']]),
              (t = y(t, 'PDFNet.PDFDoc.ViewerOptimizedOptions'));
            var e = this;
            return t.then(function (t) {
              return l
                .sendWithPromise('PDFDoc.saveViewerOptimizedBuffer', {
                  doc: e.id,
                  opts: t.id,
                })
                .then(function (t) {
                  return new Uint8Array(t);
                });
            });
          }),
          (l.PDFDoc.prototype.verifySignedDigitalSignatures = function (t) {
            return (
              f(arguments.length, 1, 'verifySignedDigitalSignatures', '(PDFNet.VerificationOptions)', [
                [t, 'Object', l.VerificationOptions, 'VerificationOptions'],
              ]),
              l.sendWithPromise('PDFDoc.verifySignedDigitalSignatures', {
                doc: this.id,
                opts: t.id,
              })
            );
          }),
          (l.convertPageToAnnotAppearance = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'convertPageToAnnotAppearance', '(PDFNet.PDFDoc, number, number, string)', [
                [t, 'PDFDoc'],
                [e, 'number'],
                [n, 'number'],
                [i, 'string'],
              ]),
              l.sendWithPromise('convertPageToAnnotAppearance', {
                docWithAppearance: t.id,
                objNum: e,
                annot_state: n,
                appearance_state: i,
              })
            );
          }),
          (l.PDFDoc.prototype.mergeXFDF = function (t, e) {
            return (
              void 0 === e && (e = null),
              f(arguments.length, 1, 'mergeXFDF', '(PDFNet.Filter, PDFNet.OptionBase)', [
                [t, 'Object', l.Filter, 'Filter'],
                [e, 'OptionBase'],
              ]),
              F('mergeXFDF', [[e, 1]]),
              (e = e ? e.getJsonString() : '{}'),
              l.sendWithPromise('PDFDoc.mergeXFDF', {
                doc: this.id,
                stream: t.id,
                options: e,
              })
            );
          }),
          (l.PDFDoc.prototype.mergeXFDFString = function (t, e) {
            return (
              void 0 === e && (e = null),
              f(arguments.length, 1, 'mergeXFDFString', '(string, PDFNet.OptionBase)', [
                [t, 'string'],
                [e, 'OptionBase'],
              ]),
              F('mergeXFDFString', [[e, 1]]),
              (e = e ? e.getJsonString() : '{}'),
              l.sendWithPromise('PDFDoc.mergeXFDFString', {
                doc: this.id,
                xfdf: t,
                options: e,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getTitle = function () {
            return l.sendWithPromise('PDFDocInfo.getTitle', { info: this.id });
          }),
          (l.PDFDocInfo.prototype.getTitleObj = function () {
            return l.sendWithPromise('PDFDocInfo.getTitleObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.prototype.setTitle = function (t) {
            return (
              f(arguments.length, 1, 'setTitle', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDocInfo.setTitle', {
                info: this.id,
                title: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getAuthor = function () {
            return l.sendWithPromise('PDFDocInfo.getAuthor', { info: this.id });
          }),
          (l.PDFDocInfo.prototype.getAuthorObj = function () {
            return l.sendWithPromise('PDFDocInfo.getAuthorObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.prototype.setAuthor = function (t) {
            return (
              f(arguments.length, 1, 'setAuthor', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDocInfo.setAuthor', {
                info: this.id,
                author: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getSubject = function () {
            return l.sendWithPromise('PDFDocInfo.getSubject', {
              info: this.id,
            });
          }),
          (l.PDFDocInfo.prototype.getSubjectObj = function () {
            return l.sendWithPromise('PDFDocInfo.getSubjectObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.prototype.setSubject = function (t) {
            return (
              f(arguments.length, 1, 'setSubject', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDocInfo.setSubject', {
                info: this.id,
                subject: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getKeywords = function () {
            return l.sendWithPromise('PDFDocInfo.getKeywords', {
              info: this.id,
            });
          }),
          (l.PDFDocInfo.prototype.getKeywordsObj = function () {
            return l.sendWithPromise('PDFDocInfo.getKeywordsObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.prototype.setKeywords = function (t) {
            return (
              f(arguments.length, 1, 'setKeywords', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDocInfo.setKeywords', {
                info: this.id,
                keywords: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getCreator = function () {
            return l.sendWithPromise('PDFDocInfo.getCreator', {
              info: this.id,
            });
          }),
          (l.PDFDocInfo.prototype.getCreatorObj = function () {
            return l.sendWithPromise('PDFDocInfo.getCreatorObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.prototype.setCreator = function (t) {
            return (
              f(arguments.length, 1, 'setCreator', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDocInfo.setCreator', {
                info: this.id,
                creator: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getProducer = function () {
            return l.sendWithPromise('PDFDocInfo.getProducer', {
              info: this.id,
            });
          }),
          (l.PDFDocInfo.prototype.getProducerObj = function () {
            return l.sendWithPromise('PDFDocInfo.getProducerObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.prototype.setProducer = function (t) {
            return (
              f(arguments.length, 1, 'setProducer', '(string)', [[t, 'string']]),
              l.sendWithPromise('PDFDocInfo.setProducer', {
                info: this.id,
                producer: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getCreationDate = function () {
            return l.sendWithPromise('PDFDocInfo.getCreationDate', { info: this.id }).then(function (t) {
              return new l.Date(t);
            });
          }),
          (l.PDFDocInfo.prototype.setCreationDate = function (t) {
            return (
              f(arguments.length, 1, 'setCreationDate', '(PDFNet.Date)', [[t, 'Structure', l.Date, 'Date']]),
              F('setCreationDate', [[t, 0]]),
              l.sendWithPromise('PDFDocInfo.setCreationDate', {
                info: this.id,
                creation_date: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getModDate = function () {
            return l.sendWithPromise('PDFDocInfo.getModDate', { info: this.id }).then(function (t) {
              return new l.Date(t);
            });
          }),
          (l.PDFDocInfo.prototype.setModDate = function (t) {
            return (
              f(arguments.length, 1, 'setModDate', '(PDFNet.Date)', [[t, 'Structure', l.Date, 'Date']]),
              F('setModDate', [[t, 0]]),
              l.sendWithPromise('PDFDocInfo.setModDate', {
                info: this.id,
                mod_date: t,
              })
            );
          }),
          (l.PDFDocInfo.prototype.getSDFObj = function () {
            return l.sendWithPromise('PDFDocInfo.getSDFObj', { info: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocInfo.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('pdfDocInfoCreate', { tr: t.id }).then(function (t) {
                return _(l.PDFDocInfo, t);
              })
            );
          }),
          (l.PDFDocInfo.prototype.copy = function () {
            return l.sendWithPromise('PDFDocInfo.copy', { info: this.id }).then(function (t) {
              return _(l.PDFDocInfo, t);
            });
          }),
          (l.PDFDocViewPrefs.prototype.setInitialPage = function (t) {
            return (
              f(arguments.length, 1, 'setInitialPage', '(PDFNet.Destination)', [[t, 'Object', l.Destination, 'Destination']]),
              l.sendWithPromise('PDFDocViewPrefs.setInitialPage', {
                p: this.id,
                dest: t.id,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.setPageMode = function (t) {
            return (
              f(arguments.length, 1, 'setPageMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setPageMode', {
                p: this.id,
                mode: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getPageMode = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getPageMode', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.setLayoutMode = function (t) {
            return (
              f(arguments.length, 1, 'setLayoutMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setLayoutMode', {
                p: this.id,
                mode: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getLayoutMode = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getLayoutMode', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.setPref = function (t, e) {
            return (
              f(arguments.length, 2, 'setPref', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('PDFDocViewPrefs.setPref', {
                p: this.id,
                pref: t,
                value: e,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getPref = function (t) {
            return (
              f(arguments.length, 1, 'getPref', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.getPref', {
                p: this.id,
                pref: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.setNonFullScreenPageMode = function (t) {
            return (
              f(arguments.length, 1, 'setNonFullScreenPageMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setNonFullScreenPageMode', {
                p: this.id,
                mode: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getNonFullScreenPageMode = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getNonFullScreenPageMode', { p: this.id });
          }),
          (l.PDFDocViewPrefs.prototype.setDirection = function (t) {
            return (
              f(arguments.length, 1, 'setDirection', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDocViewPrefs.setDirection', {
                p: this.id,
                left_to_right: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getDirection = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getDirection', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.setViewArea = function (t) {
            return (
              f(arguments.length, 1, 'setViewArea', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setViewArea', {
                p: this.id,
                box: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getViewArea = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getViewArea', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.setViewClip = function (t) {
            return (
              f(arguments.length, 1, 'setViewClip', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setViewClip', {
                p: this.id,
                box: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getViewClip = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getViewClip', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.setPrintArea = function (t) {
            return (
              f(arguments.length, 1, 'setPrintArea', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setPrintArea', {
                p: this.id,
                box: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getPrintArea = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getPrintArea', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.setPrintClip = function (t) {
            return (
              f(arguments.length, 1, 'setPrintClip', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDocViewPrefs.setPrintClip', {
                p: this.id,
                box: t,
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.getPrintClip = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getPrintClip', {
              p: this.id,
            });
          }),
          (l.PDFDocViewPrefs.prototype.getSDFObj = function () {
            return l.sendWithPromise('PDFDocViewPrefs.getSDFObj', { p: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.PDFDocViewPrefs.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('pdfDocViewPrefsCreate', { tr: t.id }).then(function (t) {
                return _(l.PDFDocViewPrefs, t);
              })
            );
          }),
          (l.PDFDocViewPrefs.prototype.copy = function () {
            return l.sendWithPromise('PDFDocViewPrefs.copy', { prefs: this.id }).then(function (t) {
              return _(l.PDFDocViewPrefs, t);
            });
          }),
          (l.PDFRasterizer.create = function (t) {
            return (
              void 0 === t && (t = l.PDFRasterizer.Type.e_BuiltIn),
              f(arguments.length, 0, 'create', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfRasterizerCreate', { type: t }).then(function (t) {
                return D(l.PDFRasterizer, t);
              })
            );
          }),
          (l.PDFRasterizer.prototype.setDrawAnnotations = function (t) {
            return (
              f(arguments.length, 1, 'setDrawAnnotations', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.setDrawAnnotations', {
                r: this.id,
                render_annots: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setHighlightFields = function (t) {
            return (
              f(arguments.length, 1, 'setHighlightFields', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.setHighlightFields', {
                r: this.id,
                highlight: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setAntiAliasing = function (t) {
            return (
              f(arguments.length, 1, 'setAntiAliasing', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.setAntiAliasing', {
                r: this.id,
                enable_aa: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setPathHinting = function (t) {
            return (
              f(arguments.length, 1, 'setPathHinting', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.setPathHinting', {
                r: this.id,
                enable_hinting: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setThinLineAdjustment = function (t, e) {
            return (
              f(arguments.length, 2, 'setThinLineAdjustment', '(boolean, boolean)', [
                [t, 'boolean'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('PDFRasterizer.setThinLineAdjustment', {
                r: this.id,
                grid_fit: t,
                stroke_adjust: e,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setGamma = function (t) {
            return (
              f(arguments.length, 1, 'setGamma', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFRasterizer.setGamma', {
                r: this.id,
                expgamma: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setOCGContext = function (t) {
            return (
              f(arguments.length, 1, 'setOCGContext', '(PDFNet.OCGContext)', [[t, 'Object', l.OCGContext, 'OCGContext']]),
              l.sendWithPromise('PDFRasterizer.setOCGContext', {
                r: this.id,
                ctx: t.id,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setPrintMode = function (t) {
            return (
              f(arguments.length, 1, 'setPrintMode', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.setPrintMode', {
                r: this.id,
                is_printing: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setImageSmoothing = function (t, e) {
            return (
              void 0 === t && (t = !0),
              void 0 === e && (e = !1),
              f(arguments.length, 0, 'setImageSmoothing', '(boolean, boolean)', [
                [t, 'boolean'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('PDFRasterizer.setImageSmoothing', {
                r: this.id,
                smoothing_enabled: t,
                hq_image_resampling: e,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setOverprint = function (t) {
            return (
              f(arguments.length, 1, 'setOverprint', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFRasterizer.setOverprint', {
                r: this.id,
                op: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setCaching = function (t) {
            return (
              void 0 === t && (t = !0),
              f(arguments.length, 0, 'setCaching', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.setCaching', {
                r: this.id,
                enabled: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setOCGContext = function (t) {
            return (
              f(arguments.length, 1, 'setOCGContext', '(PDFNet.OCGContext)', [[t, 'Object', l.OCGContext, 'OCGContext']]),
              l.sendWithPromise('PDFDraw.setOCGContext', {
                r: this.id,
                ctx: t.id,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setAnnotationState = function (t, e) {
            return (
              f(arguments.length, 2, 'setAnnotationState', '(PDFNet.Annot, number)', [
                [t, 'Object', l.Annot, 'Annot'],
                [e, 'number'],
              ]),
              l.sendWithPromise('PDFRasterizer.setAnnotationState', {
                r: this.id,
                annot: t.id,
                new_view_state: e,
              })
            );
          }),
          (l.PDFRasterizer.prototype.setRasterizerType = function (t) {
            return (
              f(arguments.length, 1, 'setRasterizerType', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFRasterizer.setRasterizerType', {
                r: this.id,
                type: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.getRasterizerType = function () {
            return l.sendWithPromise('PDFRasterizer.getRasterizerType', {
              r: this.id,
            });
          }),
          (l.PDFRasterizer.prototype.setColorPostProcessMode = function (t) {
            return (
              f(arguments.length, 1, 'setColorPostProcessMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFRasterizer.setColorPostProcessMode', {
                r: this.id,
                mode: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.getColorPostProcessMode = function () {
            return l.sendWithPromise('PDFRasterizer.getColorPostProcessMode', {
              r: this.id,
            });
          }),
          (l.PDFRasterizer.prototype.enableDisplayListCaching = function (t) {
            return (
              f(arguments.length, 1, 'enableDisplayListCaching', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFRasterizer.enableDisplayListCaching', {
                r: this.id,
                enabled: t,
              })
            );
          }),
          (l.PDFRasterizer.prototype.updateBuffer = function () {
            return l.sendWithPromise('PDFRasterizer.updateBuffer', {
              r: this.id,
            });
          }),
          (l.PDFRasterizer.prototype.rasterizeAnnot = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'rasterizeAnnot', '(PDFNet.Annot, PDFNet.Page, PDFNet.Matrix2D, boolean, boolean)', [
                [t, 'Object', l.Annot, 'Annot'],
                [e, 'Object', l.Page, 'Page'],
                [n, 'Structure', l.Matrix2D, 'Matrix2D'],
                [i, 'boolean'],
                [r, 'boolean'],
              ]),
              F('rasterizeAnnot', [[n, 2]]),
              l
                .sendWithPromise('PDFRasterizer.rasterizeAnnot', {
                  r: this.id,
                  annot: t.id,
                  page: e.id,
                  device_mtx: n,
                  demult: i,
                  cancel: r,
                })
                .then(function (t) {
                  return _(l.OwnedBitmap, t);
                })
            );
          }),
          (l.PDFRasterizer.prototype.rasterizeSeparations = function (t, e, n, i, r, o) {
            return (
              f(arguments.length, 6, 'rasterizeSeparations', '(PDFNet.Page, number, number, PDFNet.Matrix2D, PDFNet.Rect, boolean)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
                [n, 'number'],
                [i, 'Structure', l.Matrix2D, 'Matrix2D'],
                [r, 'Structure', l.Rect, 'Rect'],
                [o, 'boolean'],
              ]),
              F('rasterizeSeparations', [
                [i, 3],
                [r, 4],
              ]),
              l
                .sendWithPromise('PDFRasterizer.rasterizeSeparations', {
                  r: this.id,
                  page: t.id,
                  width: e,
                  height: n,
                  mtx: i,
                  clip: r,
                  cancel: o,
                })
                .then(function (t) {
                  for (var e = [], n = 0; n < t.length; ++n) {
                    var i = t[n];
                    if ('0' === i) return null;
                    (i = new l.Separation(i)), e.push(i);
                  }
                  return e;
                })
            );
          }),
          (l.PDFDraw.create = function (t) {
            return (
              void 0 === t && (t = 92),
              f(arguments.length, 0, 'create', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfDrawCreate', { dpi: t }).then(function (t) {
                return D(l.PDFDraw, t);
              })
            );
          }),
          (l.PDFDraw.prototype.setRasterizerType = function (t) {
            return (
              f(arguments.length, 1, 'setRasterizerType', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDraw.setRasterizerType', {
                d: this.id,
                type: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setDPI = function (t) {
            return f(arguments.length, 1, 'setDPI', '(number)', [[t, 'number']]), l.sendWithPromise('PDFDraw.setDPI', { d: this.id, dpi: t });
          }),
          (l.PDFDraw.prototype.setImageSize = function (t, e, n) {
            return (
              void 0 === n && (n = !0),
              f(arguments.length, 2, 'setImageSize', '(number, number, boolean)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'boolean'],
              ]),
              l.sendWithPromise('PDFDraw.setImageSize', {
                d: this.id,
                width: t,
                height: e,
                preserve_aspect_ratio: n,
              })
            );
          }),
          (l.PDFDraw.prototype.setPageBox = function (t) {
            return f(arguments.length, 1, 'setPageBox', '(number)', [[t, 'number']]), l.sendWithPromise('PDFDraw.setPageBox', { d: this.id, region: t });
          }),
          (l.PDFDraw.prototype.setClipRect = function (t) {
            return (
              f(arguments.length, 1, 'setClipRect', '(PDFNet.Rect)', [[t, 'Structure', l.Rect, 'Rect']]),
              F('setClipRect', [[t, 0]]),
              l.sendWithPromise('PDFDraw.setClipRect', { d: this.id, rect: t })
            );
          }),
          (l.PDFDraw.prototype.setFlipYAxis = function (t) {
            return (
              f(arguments.length, 1, 'setFlipYAxis', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setFlipYAxis', {
                d: this.id,
                flip_y: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setRotate = function (t) {
            return f(arguments.length, 1, 'setRotate', '(number)', [[t, 'number']]), l.sendWithPromise('PDFDraw.setRotate', { d: this.id, r: t });
          }),
          (l.PDFDraw.prototype.setDrawAnnotations = function (t) {
            return (
              f(arguments.length, 1, 'setDrawAnnotations', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setDrawAnnotations', {
                d: this.id,
                render_annots: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setHighlightFields = function (t) {
            return (
              f(arguments.length, 1, 'setHighlightFields', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setHighlightFields', {
                d: this.id,
                highlight: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setAntiAliasing = function (t) {
            return (
              f(arguments.length, 1, 'setAntiAliasing', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setAntiAliasing', {
                d: this.id,
                enable_aa: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setPathHinting = function (t) {
            return (
              f(arguments.length, 1, 'setPathHinting', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setPathHinting', {
                d: this.id,
                enable_hinting: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setThinLineAdjustment = function (t, e) {
            return (
              f(arguments.length, 2, 'setThinLineAdjustment', '(boolean, boolean)', [
                [t, 'boolean'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('PDFDraw.setThinLineAdjustment', {
                d: this.id,
                grid_fit: t,
                stroke_adjust: e,
              })
            );
          }),
          (l.PDFDraw.prototype.setGamma = function (t) {
            return f(arguments.length, 1, 'setGamma', '(number)', [[t, 'number']]), l.sendWithPromise('PDFDraw.setGamma', { d: this.id, exp: t });
          }),
          (l.PDFDraw.prototype.setPrintMode = function (t) {
            return (
              f(arguments.length, 1, 'setPrintMode', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setPrintMode', {
                d: this.id,
                is_printing: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setPageTransparent = function (t) {
            return (
              f(arguments.length, 1, 'setPageTransparent', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setPageTransparent', {
                d: this.id,
                is_transparent: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setDefaultPageColor = function (t, e, n) {
            return (
              f(arguments.length, 3, 'setDefaultPageColor', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l.sendWithPromise('PDFDraw.setDefaultPageColor', {
                d: this.id,
                r: t,
                g: e,
                b: n,
              })
            );
          }),
          (l.PDFDraw.prototype.setOverprint = function (t) {
            return f(arguments.length, 1, 'setOverprint', '(number)', [[t, 'number']]), l.sendWithPromise('PDFDraw.setOverprint', { d: this.id, op: t });
          }),
          (l.PDFDraw.prototype.setImageSmoothing = function (t, e) {
            return (
              void 0 === t && (t = !0),
              void 0 === e && (e = !1),
              f(arguments.length, 0, 'setImageSmoothing', '(boolean, boolean)', [
                [t, 'boolean'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('PDFDraw.setImageSmoothing', {
                d: this.id,
                smoothing_enabled: t,
                hq_image_resampling: e,
              })
            );
          }),
          (l.PDFDraw.prototype.setCaching = function (t) {
            return (
              void 0 === t && (t = !0),
              f(arguments.length, 0, 'setCaching', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('PDFDraw.setCaching', {
                d: this.id,
                enabled: t,
              })
            );
          }),
          (l.PDFDraw.prototype.setColorPostProcessMode = function (t) {
            return (
              f(arguments.length, 1, 'setColorPostProcessMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('PDFDraw.setColorPostProcessMode', {
                d: this.id,
                mode: t,
              })
            );
          }),
          (l.PDFDraw.prototype.getSeparationBitmaps = function (t) {
            return (
              f(arguments.length, 1, 'getSeparationBitmaps', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l
                .sendWithPromise('PDFDraw.getSeparationBitmaps', {
                  d: this.id,
                  page: t.id,
                })
                .then(function (t) {
                  for (var e = [], n = 0; n < t.length; ++n) {
                    var i = t[n];
                    if ('0' === i) return null;
                    (i = new l.Separation(i)), e.push(i);
                  }
                  return e;
                })
            );
          }),
          (l.enableJavaScript = function (t) {
            return f(arguments.length, 1, 'enableJavaScript', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('pdfNetEnableJavaScript', { enable: t });
          }),
          (l.isJavaScriptEnabled = function () {
            return l.sendWithPromise('pdfNetIsJavaScriptEnabled', {});
          }),
          (l.terminateEx = function (t) {
            return f(arguments.length, 1, 'terminateEx', '(number)', [[t, 'number']]), l.sendWithPromise('pdfNetTerminateEx', { termination_level: t });
          }),
          (l.setColorManagement = function (t) {
            return (
              void 0 === t && (t = l.CMSType.e_lcms),
              f(arguments.length, 0, 'setColorManagement', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfNetSetColorManagement', { t: t })
            );
          }),
          (l.setDefaultDeviceCMYKProfileFromFilter = function (t) {
            return (
              f(arguments.length, 1, 'setDefaultDeviceCMYKProfileFromFilter', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              l.sendWithPromise('pdfNetSetDefaultDeviceCMYKProfileFromFilter', {
                stream: t.id,
              })
            );
          }),
          (l.setDefaultDeviceRGBProfileFromFilter = function (t) {
            return (
              f(arguments.length, 1, 'setDefaultDeviceRGBProfileFromFilter', '(PDFNet.Filter)', [[t, 'Object', l.Filter, 'Filter']]),
              l.sendWithPromise('pdfNetSetDefaultDeviceRGBProfileFromFilter', {
                stream: t.id,
              })
            );
          }),
          (l.setDefaultFlateCompressionLevel = function (t) {
            return (
              f(arguments.length, 1, 'setDefaultFlateCompressionLevel', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfNetSetDefaultFlateCompressionLevel', {
                level: t,
              })
            );
          }),
          (l.setViewerCache = function (t, e) {
            return (
              f(arguments.length, 2, 'setViewerCache', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('pdfNetSetViewerCache', {
                max_cache_size: t,
                on_disk: e,
              })
            );
          }),
          (l.getVersion = function () {
            return l.sendWithPromise('pdfNetGetVersion', {});
          }),
          (l.setLogLevel = function (t) {
            return (
              void 0 === t && (t = l.LogLevel.e_LogLevel_Fatal),
              f(arguments.length, 0, 'setLogLevel', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfNetSetLogLevel', { level: t })
            );
          }),
          (l.getSystemFontList = function () {
            return l.sendWithPromise('pdfNetGetSystemFontList', {});
          }),
          (l.addPDFTronCustomHandler = function (t) {
            return (
              f(arguments.length, 1, 'addPDFTronCustomHandler', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfNetAddPDFTronCustomHandler', {
                custom_id: t,
              })
            );
          }),
          (l.getVersionString = function () {
            return l.sendWithPromise('pdfNetGetVersionString', {});
          }),
          (l.setConnectionErrorHandlingMode = function (t) {
            return (
              f(arguments.length, 1, 'setConnectionErrorHandlingMode', '(number)', [[t, 'number']]),
              l.sendWithPromise('pdfNetSetConnectionErrorHandlingMode', {
                mode: t,
              })
            );
          }),
          (l.Rect.init = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'init', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l.sendWithPromise('rectInit', { x1: t, y1: e, x2: n, y2: i }).then(function (t) {
                return new l.Rect(t);
              })
            );
          }),
          (l.Rect.prototype.attach = function (t) {
            f(arguments.length, 1, 'attach', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]), P('attach', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Rect.attach'),
              l.sendWithPromise('Rect.attach', { rect: this, obj: t.id }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Rect.prototype.update = function (t) {
            void 0 === t && (t = new l.Obj('__null')),
              f(arguments.length, 0, 'update', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              P('update', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Rect.update'),
              l.sendWithPromise('Rect.update', { rect: this, obj: t.id }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.rect, e), t.result;
              })
            );
          }),
          (l.Rect.prototype.get = function () {
            return P('get', this.yieldFunction), l.sendWithPromise('Rect.get', { rect: this });
          }),
          (l.Rect.prototype.set = function (t, e, n, i) {
            f(arguments.length, 4, 'set', '(number, number, number, number)', [
              [t, 'number'],
              [e, 'number'],
              [n, 'number'],
              [i, 'number'],
            ]),
              P('set', this.yieldFunction);
            var r = this;
            return (
              (this.yieldFunction = 'Rect.set'),
              l
                .sendWithPromise('Rect.set', {
                  rect: this,
                  x1: t,
                  y1: e,
                  x2: n,
                  y2: i,
                })
                .then(function (t) {
                  (r.yieldFunction = void 0), W(t, r);
                })
            );
          }),
          (l.Rect.prototype.width = function () {
            return P('width', this.yieldFunction), l.sendWithPromise('Rect.width', { rect: this });
          }),
          (l.Rect.prototype.height = function () {
            return P('height', this.yieldFunction), l.sendWithPromise('Rect.height', { rect: this });
          }),
          (l.Rect.prototype.contains = function (t, e) {
            return (
              f(arguments.length, 2, 'contains', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              P('contains', this.yieldFunction),
              l.sendWithPromise('Rect.contains', { rect: this, x: t, y: e })
            );
          }),
          (l.Rect.prototype.intersectRect = function (t, e) {
            f(arguments.length, 2, 'intersectRect', '(PDFNet.Rect, PDFNet.Rect)', [
              [t, 'Structure', l.Rect, 'Rect'],
              [e, 'Structure', l.Rect, 'Rect'],
            ]),
              P('intersectRect', this.yieldFunction),
              F('intersectRect', [
                [t, 0],
                [e, 1],
              ]);
            var n = this;
            return (
              (this.yieldFunction = 'Rect.intersectRect'),
              l
                .sendWithPromise('Rect.intersectRect', {
                  rect: this,
                  rect1: t,
                  rect2: e,
                })
                .then(function (t) {
                  return (n.yieldFunction = void 0), W(t.rect, n), t.result;
                })
            );
          }),
          (l.Rect.prototype.normalize = function () {
            P('normalize', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Rect.normalize'),
              l.sendWithPromise('Rect.normalize', { rect: this }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Rect.prototype.inflate1 = function (t) {
            f(arguments.length, 1, 'inflate1', '(number)', [[t, 'number']]), P('inflate1', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'Rect.inflate1'),
              l.sendWithPromise('Rect.inflate1', { rect: this, amount: t }).then(function (t) {
                (e.yieldFunction = void 0), W(t, e);
              })
            );
          }),
          (l.Rect.prototype.inflate2 = function (t, e) {
            f(arguments.length, 2, 'inflate2', '(number, number)', [
              [t, 'number'],
              [e, 'number'],
            ]),
              P('inflate2', this.yieldFunction);
            var n = this;
            return (
              (this.yieldFunction = 'Rect.inflate2'),
              l.sendWithPromise('Rect.inflate2', { rect: this, x: t, y: e }).then(function (t) {
                (n.yieldFunction = void 0), W(t, n);
              })
            );
          }),
          (l.Redactor.redactionCreate = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'redactionCreate', '(number, PDFNet.Rect, boolean, string)', [
                [t, 'number'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'boolean'],
                [i, 'string'],
              ]),
              F('redactionCreate', [[e, 1]]),
              l
                .sendWithPromise('Redactor.redactionCreate', {
                  page_num: t,
                  bbox: e,
                  negative: n,
                  text: i,
                })
                .then(function (t) {
                  return _(l.Redaction, t);
                })
            );
          }),
          (l.Redactor.redactionDestroy = function (t) {
            return (
              f(arguments.length, 1, 'redactionDestroy', '(PDFNet.Redaction)', [[t, 'Object', l.Redaction, 'Redaction']]),
              l.sendWithPromise('Redactor.redactionDestroy', {
                redaction: t.id,
              })
            );
          }),
          (l.Redactor.redactionCopy = function (t) {
            return (
              f(arguments.length, 1, 'redactionCopy', '(PDFNet.Redaction)', [[t, 'Object', l.Redaction, 'Redaction']]),
              l.sendWithPromise('Redactor.redactionCopy', { other: t.id }).then(function (t) {
                return _(l.Redaction, t);
              })
            );
          }),
          (l.Shading.create = function (t) {
            return (
              void 0 === t && (t = new l.Obj('0')),
              f(arguments.length, 0, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('shadingCreate', { shading_dict: t.id }).then(function (t) {
                return D(l.Shading, t);
              })
            );
          }),
          (l.Shading.getTypeFromObj = function (t) {
            return (
              f(arguments.length, 1, 'getTypeFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('shadingGetTypeFromObj', { shading_dict: t.id })
            );
          }),
          (l.Shading.prototype.getType = function () {
            return l.sendWithPromise('Shading.getType', { s: this.id });
          }),
          (l.Shading.prototype.getSDFObj = function () {
            return l.sendWithPromise('Shading.getSDFObj', { s: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Shading.prototype.getBaseColorSpace = function () {
            return l.sendWithPromise('Shading.getBaseColorSpace', { s: this.id }).then(function (t) {
              return D(l.ColorSpace, t);
            });
          }),
          (l.Shading.prototype.hasBBox = function () {
            return l.sendWithPromise('Shading.hasBBox', { s: this.id });
          }),
          (l.Shading.prototype.getBBox = function () {
            return l.sendWithPromise('Shading.getBBox', { s: this.id }).then(function (t) {
              return new l.Rect(t);
            });
          }),
          (l.Shading.prototype.hasBackground = function () {
            return l.sendWithPromise('Shading.hasBackground', { s: this.id });
          }),
          (l.Shading.prototype.getBackground = function () {
            return l.sendWithPromise('Shading.getBackground', { s: this.id }).then(function (t) {
              return D(l.ColorPt, t);
            });
          }),
          (l.Shading.prototype.getAntialias = function () {
            return l.sendWithPromise('Shading.getAntialias', { s: this.id });
          }),
          (l.Shading.prototype.getParamStart = function () {
            return l.sendWithPromise('Shading.getParamStart', { s: this.id });
          }),
          (l.Shading.prototype.getParamEnd = function () {
            return l.sendWithPromise('Shading.getParamEnd', { s: this.id });
          }),
          (l.Shading.prototype.isExtendStart = function () {
            return l.sendWithPromise('Shading.isExtendStart', { s: this.id });
          }),
          (l.Shading.prototype.isExtendEnd = function () {
            return l.sendWithPromise('Shading.isExtendEnd', { s: this.id });
          }),
          (l.Shading.prototype.getColor = function (t) {
            return (
              f(arguments.length, 1, 'getColor', '(number)', [[t, 'number']]),
              l.sendWithPromise('Shading.getColor', { s: this.id, t: t }).then(function (t) {
                return D(l.ColorPt, t);
              })
            );
          }),
          (l.Shading.prototype.getCoords = function () {
            return l.sendWithPromise('Shading.getCoords', { s: this.id });
          }),
          (l.Shading.prototype.getCoordsRadial = function () {
            return l.sendWithPromise('Shading.getCoordsRadial', { s: this.id });
          }),
          (l.Shading.prototype.getDomain = function () {
            return l.sendWithPromise('Shading.getDomain', { s: this.id });
          }),
          (l.Shading.prototype.getMatrix = function () {
            return l.sendWithPromise('Shading.getMatrix', { s: this.id }).then(function (t) {
              return new l.Matrix2D(t);
            });
          }),
          (l.Shading.prototype.getColorForFunction = function (t, e) {
            return (
              f(arguments.length, 2, 'getColorForFunction', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('Shading.getColorForFunction', {
                  s: this.id,
                  t1: t,
                  t2: e,
                })
                .then(function (t) {
                  return D(l.ColorPt, t);
                })
            );
          }),
          (l.Stamper.create = function (t, e, n) {
            return (
              f(arguments.length, 3, 'create', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l.sendWithPromise('stamperCreate', { size_type: t, a: e, b: n }).then(function (t) {
                return D(l.Stamper, t);
              })
            );
          }),
          (l.Stamper.prototype.stampImage = function (t, e, n) {
            return (
              f(arguments.length, 3, 'stampImage', '(PDFNet.PDFDoc, PDFNet.Image, PDFNet.PageSet)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.Image, 'Image'],
                [n, 'Object', l.PageSet, 'PageSet'],
              ]),
              l.sendWithPromise('Stamper.stampImage', {
                stamp: this.id,
                dest_doc: t.id,
                img: e.id,
                dest_pages: n.id,
              })
            );
          }),
          (l.Stamper.prototype.stampPage = function (t, e, n) {
            return (
              f(arguments.length, 3, 'stampPage', '(PDFNet.PDFDoc, PDFNet.Page, PDFNet.PageSet)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.Page, 'Page'],
                [n, 'Object', l.PageSet, 'PageSet'],
              ]),
              l.sendWithPromise('Stamper.stampPage', {
                stamp: this.id,
                dest_doc: t.id,
                page: e.id,
                dest_pages: n.id,
              })
            );
          }),
          (l.Stamper.prototype.stampText = function (t, e, n) {
            return (
              f(arguments.length, 3, 'stampText', '(PDFNet.PDFDoc, string, PDFNet.PageSet)', [
                [t, 'PDFDoc'],
                [e, 'string'],
                [n, 'Object', l.PageSet, 'PageSet'],
              ]),
              l.sendWithPromise('Stamper.stampText', {
                stamp: this.id,
                dest_doc: t.id,
                txt: e,
                dest_pages: n.id,
              })
            );
          }),
          (l.Stamper.prototype.setFont = function (t) {
            return (
              f(arguments.length, 1, 'setFont', '(PDFNet.Font)', [[t, 'Object', l.Font, 'Font']]),
              l.sendWithPromise('Stamper.setFont', {
                stamp: this.id,
                font: t.id,
              })
            );
          }),
          (l.Stamper.prototype.setFontColor = function (t) {
            return (
              f(arguments.length, 1, 'setFontColor', '(PDFNet.ColorPt)', [[t, 'Object', l.ColorPt, 'ColorPt']]),
              l.sendWithPromise('Stamper.setFontColor', {
                stamp: this.id,
                font_color: t.id,
              })
            );
          }),
          (l.Stamper.prototype.setTextAlignment = function (t) {
            return (
              f(arguments.length, 1, 'setTextAlignment', '(number)', [[t, 'number']]),
              l.sendWithPromise('Stamper.setTextAlignment', {
                stamp: this.id,
                text_alignment: t,
              })
            );
          }),
          (l.Stamper.prototype.setOpacity = function (t) {
            return (
              f(arguments.length, 1, 'setOpacity', '(number)', [[t, 'number']]),
              l.sendWithPromise('Stamper.setOpacity', {
                stamp: this.id,
                opacity: t,
              })
            );
          }),
          (l.Stamper.prototype.setRotation = function (t) {
            return (
              f(arguments.length, 1, 'setRotation', '(number)', [[t, 'number']]),
              l.sendWithPromise('Stamper.setRotation', {
                stamp: this.id,
                rotation: t,
              })
            );
          }),
          (l.Stamper.prototype.setAsBackground = function (t) {
            return (
              f(arguments.length, 1, 'setAsBackground', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Stamper.setAsBackground', {
                stamp: this.id,
                background: t,
              })
            );
          }),
          (l.Stamper.prototype.setAsAnnotation = function (t) {
            return (
              f(arguments.length, 1, 'setAsAnnotation', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Stamper.setAsAnnotation', {
                stamp: this.id,
                annotation: t,
              })
            );
          }),
          (l.Stamper.prototype.showsOnScreen = function (t) {
            return (
              f(arguments.length, 1, 'showsOnScreen', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Stamper.showsOnScreen', {
                stamp: this.id,
                on_screen: t,
              })
            );
          }),
          (l.Stamper.prototype.showsOnPrint = function (t) {
            return (
              f(arguments.length, 1, 'showsOnPrint', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Stamper.showsOnPrint', {
                stamp: this.id,
                on_print: t,
              })
            );
          }),
          (l.Stamper.prototype.setAlignment = function (t, e) {
            return (
              f(arguments.length, 2, 'setAlignment', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('Stamper.setAlignment', {
                stamp: this.id,
                horizontal_alignment: t,
                vertical_alignment: e,
              })
            );
          }),
          (l.Stamper.prototype.setPosition = function (t, e, n) {
            return (
              void 0 === n && (n = !1),
              f(arguments.length, 2, 'setPosition', '(number, number, boolean)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'boolean'],
              ]),
              l.sendWithPromise('Stamper.setPosition', {
                stamp: this.id,
                horizontal_distance: t,
                vertical_distance: e,
                use_percentage: n,
              })
            );
          }),
          (l.Stamper.prototype.setSize = function (t, e, n) {
            return (
              f(arguments.length, 3, 'setSize', '(number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l.sendWithPromise('Stamper.setSize', {
                stamp: this.id,
                size_type: t,
                a: e,
                b: n,
              })
            );
          }),
          (l.Stamper.deleteStamps = function (t, e) {
            return (
              f(arguments.length, 2, 'deleteStamps', '(PDFNet.PDFDoc, PDFNet.PageSet)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.PageSet, 'PageSet'],
              ]),
              l.sendWithPromise('stamperDeleteStamps', {
                doc: t.id,
                page_set: e.id,
              })
            );
          }),
          (l.Stamper.hasStamps = function (t, e) {
            return (
              f(arguments.length, 2, 'hasStamps', '(PDFNet.PDFDoc, PDFNet.PageSet)', [
                [t, 'PDFDoc'],
                [e, 'Object', l.PageSet, 'PageSet'],
              ]),
              l.sendWithPromise('stamperHasStamps', {
                doc: t.id,
                page_set: e.id,
              })
            );
          }),
          (l.TextExtractor.create = function () {
            return l.sendWithPromise('textExtractorCreate', {}).then(function (t) {
              return D(l.TextExtractor, t);
            });
          }),
          (l.TextExtractor.prototype.setOCGContext = function (t) {
            return (
              f(arguments.length, 1, 'setOCGContext', '(PDFNet.OCGContext)', [[t, 'Object', l.OCGContext, 'OCGContext']]),
              l.sendWithPromise('TextExtractor.setOCGContext', {
                te: this.id,
                ctx: t.id,
              })
            );
          }),
          (l.TextExtractor.prototype.begin = function (t, e, n) {
            return (
              void 0 === e && (e = null),
              void 0 === n && (n = 0),
              f(arguments.length, 1, 'begin', '(PDFNet.Page, PDFNet.Rect, number)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'Structure', l.Rect, 'Rect'],
                [n, 'number'],
              ]),
              F('begin', [[e, 1]]),
              l.sendWithPromise('TextExtractor.begin', {
                te: this.id,
                page: t.id,
                clip_ptr: e,
                flags: n,
              })
            );
          }),
          (l.TextExtractor.prototype.getWordCount = function () {
            return l.sendWithPromise('TextExtractor.getWordCount', {
              te: this.id,
            });
          }),
          (l.TextExtractor.prototype.setRightToLeftLanguage = function (t) {
            return (
              f(arguments.length, 1, 'setRightToLeftLanguage', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('TextExtractor.setRightToLeftLanguage', {
                te: this.id,
                rtl: t,
              })
            );
          }),
          (l.TextExtractor.prototype.getRightToLeftLanguage = function () {
            return l.sendWithPromise('TextExtractor.getRightToLeftLanguage', {
              te: this.id,
            });
          }),
          (l.TextExtractor.prototype.getAsText = function (t) {
            return (
              void 0 === t && (t = !0),
              f(arguments.length, 0, 'getAsText', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('TextExtractor.getAsText', {
                te: this.id,
                dehyphen: t,
              })
            );
          }),
          (l.TextExtractor.prototype.getTextUnderAnnot = function (t) {
            return (
              f(arguments.length, 1, 'getTextUnderAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l.sendWithPromise('TextExtractor.getTextUnderAnnot', {
                te: this.id,
                annot: t.id,
              })
            );
          }),
          (l.TextExtractor.prototype.getAsXML = function (t) {
            return (
              void 0 === t && (t = 0),
              f(arguments.length, 0, 'getAsXML', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextExtractor.getAsXML', {
                te: this.id,
                xml_output_flags: t,
              })
            );
          }),
          (l.TextExtractorStyle.prototype.getFont = function () {
            P('getFont', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.getFont'),
              l.sendWithPromise('TextExtractorStyle.getFont', { tes: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = _(l.Obj, t.result)), W(t.tes, e), t.result;
              })
            );
          }),
          (l.TextExtractorStyle.prototype.getFontName = function () {
            P('getFontName', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.getFontName'),
              l
                .sendWithPromise('TextExtractorStyle.getFontName', {
                  tes: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.tes, e), t.result;
                })
            );
          }),
          (l.TextExtractorStyle.prototype.getFontSize = function () {
            P('getFontSize', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.getFontSize'),
              l
                .sendWithPromise('TextExtractorStyle.getFontSize', {
                  tes: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.tes, e), t.result;
                })
            );
          }),
          (l.TextExtractorStyle.prototype.getWeight = function () {
            P('getWeight', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.getWeight'),
              l.sendWithPromise('TextExtractorStyle.getWeight', { tes: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.tes, e), t.result;
              })
            );
          }),
          (l.TextExtractorStyle.prototype.isItalic = function () {
            P('isItalic', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.isItalic'),
              l.sendWithPromise('TextExtractorStyle.isItalic', { tes: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.tes, e), t.result;
              })
            );
          }),
          (l.TextExtractorStyle.prototype.isSerif = function () {
            P('isSerif', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.isSerif'),
              l.sendWithPromise('TextExtractorStyle.isSerif', { tes: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.tes, e), t.result;
              })
            );
          }),
          (l.TextExtractorStyle.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.TextExtractorStyle)', [[t, 'Structure', l.TextExtractorStyle, 'TextExtractorStyle']]),
              P('compare', this.yieldFunction),
              F('compare', [[t, 0]]),
              l.sendWithPromise('TextExtractorStyle.compare', {
                tes: this,
                s: t,
              })
            );
          }),
          (l.TextExtractorStyle.create = function () {
            return l.sendWithPromise('textExtractorStyleCreate', {}).then(function (t) {
              return new l.TextExtractorStyle(t);
            });
          }),
          (l.TextExtractorStyle.prototype.copy = function () {
            P('copy', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorStyle.copy'),
              l.sendWithPromise('TextExtractorStyle.copy', { s: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = new l.TextExtractorStyle(t.result)), W(t.s, e), t.result;
              })
            );
          }),
          (l.TextExtractorWord.prototype.getNumGlyphs = function () {
            P('getNumGlyphs', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.getNumGlyphs'),
              l
                .sendWithPromise('TextExtractorWord.getNumGlyphs', {
                  tew: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.tew, e), t.result;
                })
            );
          }),
          (l.TextExtractorWord.prototype.getCharStyle = function (t) {
            f(arguments.length, 1, 'getCharStyle', '(number)', [[t, 'number']]), P('getCharStyle', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.getCharStyle'),
              l
                .sendWithPromise('TextExtractorWord.getCharStyle', {
                  tew: this,
                  char_idx: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = new l.TextExtractorStyle(t.result)), W(t.tew, e), t.result;
                })
            );
          }),
          (l.TextExtractorWord.prototype.getStyle = function () {
            P('getStyle', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.getStyle'),
              l.sendWithPromise('TextExtractorWord.getStyle', { tew: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = new l.TextExtractorStyle(t.result)), W(t.tew, e), t.result;
              })
            );
          }),
          (l.TextExtractorWord.prototype.getStringLen = function () {
            P('getStringLen', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.getStringLen'),
              l
                .sendWithPromise('TextExtractorWord.getStringLen', {
                  tew: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.tew, e), t.result;
                })
            );
          }),
          (l.TextExtractorWord.prototype.getNextWord = function () {
            P('getNextWord', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.getNextWord'),
              l.sendWithPromise('TextExtractorWord.getNextWord', { tew: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = new l.TextExtractorWord(t.result)), W(t.tew, e), t.result;
              })
            );
          }),
          (l.TextExtractorWord.prototype.getCurrentNum = function () {
            P('getCurrentNum', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.getCurrentNum'),
              l
                .sendWithPromise('TextExtractorWord.getCurrentNum', {
                  tew: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.tew, e), t.result;
                })
            );
          }),
          (l.TextExtractorWord.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.TextExtractorWord)', [[t, 'Structure', l.TextExtractorWord, 'TextExtractorWord']]),
              P('compare', this.yieldFunction),
              F('compare', [[t, 0]]),
              l.sendWithPromise('TextExtractorWord.compare', {
                tew: this,
                word: t,
              })
            );
          }),
          (l.TextExtractorWord.create = function () {
            return l.sendWithPromise('textExtractorWordCreate', {}).then(function (t) {
              return new l.TextExtractorWord(t);
            });
          }),
          (l.TextExtractorWord.prototype.isValid = function () {
            P('isValid', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorWord.isValid'),
              l.sendWithPromise('TextExtractorWord.isValid', { tew: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.tew, e), t.result;
              })
            );
          }),
          (l.TextExtractorLine.prototype.getNumWords = function () {
            P('getNumWords', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getNumWords'),
              l
                .sendWithPromise('TextExtractorLine.getNumWords', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.isSimpleLine = function () {
            P('isSimpleLine', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.isSimpleLine'),
              l
                .sendWithPromise('TextExtractorLine.isSimpleLine', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.getFirstWord = function () {
            P('getFirstWord', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getFirstWord'),
              l
                .sendWithPromise('TextExtractorLine.getFirstWord', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = new l.TextExtractorWord(t.result)), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.getWord = function (t) {
            f(arguments.length, 1, 'getWord', '(number)', [[t, 'number']]), P('getWord', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getWord'),
              l
                .sendWithPromise('TextExtractorLine.getWord', {
                  line: this,
                  word_idx: t,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = new l.TextExtractorWord(t.result)), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.getNextLine = function () {
            P('getNextLine', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getNextLine'),
              l
                .sendWithPromise('TextExtractorLine.getNextLine', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), (t.result = new l.TextExtractorLine(t.result)), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.getCurrentNum = function () {
            P('getCurrentNum', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getCurrentNum'),
              l
                .sendWithPromise('TextExtractorLine.getCurrentNum', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.getStyle = function () {
            P('getStyle', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getStyle'),
              l.sendWithPromise('TextExtractorLine.getStyle', { line: this }).then(function (t) {
                return (e.yieldFunction = void 0), (t.result = new l.TextExtractorStyle(t.result)), W(t.line, e), t.result;
              })
            );
          }),
          (l.TextExtractorLine.prototype.getParagraphID = function () {
            P('getParagraphID', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getParagraphID'),
              l
                .sendWithPromise('TextExtractorLine.getParagraphID', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.getFlowID = function () {
            P('getFlowID', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.getFlowID'),
              l.sendWithPromise('TextExtractorLine.getFlowID', { line: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.line, e), t.result;
              })
            );
          }),
          (l.TextExtractorLine.prototype.endsWithHyphen = function () {
            P('endsWithHyphen', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.endsWithHyphen'),
              l
                .sendWithPromise('TextExtractorLine.endsWithHyphen', {
                  line: this,
                })
                .then(function (t) {
                  return (e.yieldFunction = void 0), W(t.line, e), t.result;
                })
            );
          }),
          (l.TextExtractorLine.prototype.compare = function (t) {
            return (
              f(arguments.length, 1, 'compare', '(PDFNet.TextExtractorLine)', [[t, 'Structure', l.TextExtractorLine, 'TextExtractorLine']]),
              P('compare', this.yieldFunction),
              F('compare', [[t, 0]]),
              l.sendWithPromise('TextExtractorLine.compare', {
                line: this,
                line2: t,
              })
            );
          }),
          (l.TextExtractorLine.create = function () {
            return l.sendWithPromise('textExtractorLineCreate', {}).then(function (t) {
              return new l.TextExtractorLine(t);
            });
          }),
          (l.TextExtractorLine.prototype.isValid = function () {
            P('isValid', this.yieldFunction);
            var e = this;
            return (
              (this.yieldFunction = 'TextExtractorLine.isValid'),
              l.sendWithPromise('TextExtractorLine.isValid', { line: this }).then(function (t) {
                return (e.yieldFunction = void 0), W(t.line, e), t.result;
              })
            );
          }),
          (l.TextExtractor.prototype.getNumLines = function () {
            return l.sendWithPromise('TextExtractor.getNumLines', {
              te: this.id,
            });
          }),
          (l.TextExtractor.prototype.getFirstLine = function () {
            return l.sendWithPromise('TextExtractor.getFirstLine', { te: this.id }).then(function (t) {
              return new l.TextExtractorLine(t);
            });
          }),
          (l.TextExtractor.prototype.getQuads = function (t, e, n) {
            return (
              f(arguments.length, 3, 'getQuads', '(PDFNet.Matrix2D, number, number)', [
                [t, 'Structure', l.Matrix2D, 'Matrix2D'],
                [e, 'number'],
                [n, 'number'],
              ]),
              F('getQuads', [[t, 0]]),
              l.sendWithPromise('TextExtractor.getQuads', {
                te: this.id,
                mtx: t,
                quads: e,
                quads_size: n,
              })
            );
          }),
          (l.TextSearch.create = function () {
            return l.sendWithPromise('textSearchCreate', {}).then(function (t) {
              return D(l.TextSearch, t);
            });
          }),
          (l.TextSearch.prototype.begin = function (t, e, n, i, r) {
            return (
              void 0 === i && (i = -1),
              void 0 === r && (r = -1),
              f(arguments.length, 3, 'begin', '(PDFNet.PDFDoc, string, number, number, number)', [
                [t, 'PDFDoc'],
                [e, 'string'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l.sendWithPromise('TextSearch.begin', {
                ts: this.id,
                doc: t.id,
                pattern: e,
                mode: n,
                start_page: i,
                end_page: r,
              })
            );
          }),
          (l.TextSearch.prototype.setPattern = function (t) {
            return (
              f(arguments.length, 1, 'setPattern', '(string)', [[t, 'string']]),
              l.sendWithPromise('TextSearch.setPattern', {
                ts: this.id,
                pattern: t,
              })
            );
          }),
          (l.TextSearch.prototype.getMode = function () {
            return l.sendWithPromise('TextSearch.getMode', { ts: this.id });
          }),
          (l.TextSearch.prototype.setMode = function (t) {
            return f(arguments.length, 1, 'setMode', '(number)', [[t, 'number']]), l.sendWithPromise('TextSearch.setMode', { ts: this.id, mode: t });
          }),
          (l.TextSearch.prototype.setRightToLeftLanguage = function (t) {
            return (
              f(arguments.length, 1, 'setRightToLeftLanguage', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('TextSearch.setRightToLeftLanguage', {
                ts: this.id,
                flag: t,
              })
            );
          }),
          (l.TextSearch.prototype.getCurrentPage = function () {
            return l.sendWithPromise('TextSearch.getCurrentPage', {
              ts: this.id,
            });
          }),
          (l.TextSearch.prototype.setOCGContext = function (t) {
            return (
              f(arguments.length, 1, 'setOCGContext', '(PDFNet.OCGContext)', [[t, 'Object', l.OCGContext, 'OCGContext']]),
              l.sendWithPromise('TextSearch.setOCGContext', {
                te: this.id,
                ctx: t.id,
              })
            );
          }),
          (l.TextSearch.prototype.setAmbientLettersBefore = function (t) {
            return (
              f(arguments.length, 1, 'setAmbientLettersBefore', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextSearch.setAmbientLettersBefore', {
                self: this.id,
                ambient_letters_before: t,
              })
            );
          }),
          (l.TextSearch.prototype.setAmbientLettersAfter = function (t) {
            return (
              f(arguments.length, 1, 'setAmbientLettersAfter', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextSearch.setAmbientLettersAfter', {
                self: this.id,
                ambient_letters_after: t,
              })
            );
          }),
          (l.TextSearch.prototype.setAmbientWordsBefore = function (t) {
            return (
              f(arguments.length, 1, 'setAmbientWordsBefore', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextSearch.setAmbientWordsBefore', {
                self: this.id,
                ambient_words_before: t,
              })
            );
          }),
          (l.TextSearch.prototype.setAmbientWordsAfter = function (t) {
            return (
              f(arguments.length, 1, 'setAmbientWordsAfter', '(number)', [[t, 'number']]),
              l.sendWithPromise('TextSearch.setAmbientWordsAfter', {
                self: this.id,
                ambient_words_after: t,
              })
            );
          }),
          (l.NameTree.create = function (t, e) {
            return (
              f(arguments.length, 2, 'create', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('nameTreeCreate', { doc: t.id, name: e }).then(function (t) {
                return _(l.NameTree, t);
              })
            );
          }),
          (l.NameTree.find = function (t, e) {
            return (
              f(arguments.length, 2, 'find', '(PDFNet.SDFDoc, string)', [
                [t, 'SDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('nameTreeFind', { doc: t.id, name: e }).then(function (t) {
                return _(l.NameTree, t);
              })
            );
          }),
          (l.NameTree.createFromObj = function (t) {
            return (
              f(arguments.length, 1, 'createFromObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('nameTreeCreateFromObj', { name_tree: t.id }).then(function (t) {
                return _(l.NameTree, t);
              })
            );
          }),
          (l.NameTree.prototype.copy = function () {
            return l.sendWithPromise('NameTree.copy', { d: this.id }).then(function (t) {
              return _(l.NameTree, t);
            });
          }),
          (l.NameTree.prototype.isValid = function () {
            return l.sendWithPromise('NameTree.isValid', { tree: this.id });
          }),
          (l.NameTree.prototype.getIterator = function (t) {
            return (
              f(arguments.length, 1, 'getIterator', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('NameTree.getIterator', {
                  tree: this.id,
                  key: t,
                })
                .then(function (t) {
                  return D(l.DictIterator, t);
                })
            );
          }),
          (l.NameTree.prototype.getValue = function (t) {
            return (
              f(arguments.length, 1, 'getValue', '(string)', [[t, 'string']]),
              l.sendWithPromise('NameTree.getValue', { tree: this.id, key: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.NameTree.prototype.getIteratorBegin = function () {
            return l.sendWithPromise('NameTree.getIteratorBegin', { tree: this.id }).then(function (t) {
              return D(l.DictIterator, t);
            });
          }),
          (l.NameTree.prototype.put = function (t, e) {
            return (
              f(arguments.length, 2, 'put', '(string, PDFNet.Obj)', [
                [t, 'string'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l.sendWithPromise('NameTree.put', {
                tree: this.id,
                key: t,
                value: e.id,
              })
            );
          }),
          (l.NameTree.prototype.eraseKey = function (t) {
            return f(arguments.length, 1, 'eraseKey', '(string)', [[t, 'string']]), l.sendWithPromise('NameTree.eraseKey', { tree: this.id, key: t });
          }),
          (l.NameTree.prototype.erase = function (t) {
            return (
              f(arguments.length, 1, 'erase', '(PDFNet.DictIterator)', [[t, 'Object', l.DictIterator, 'DictIterator']]),
              l.sendWithPromise('NameTree.erase', { tree: this.id, pos: t.id })
            );
          }),
          (l.NameTree.prototype.getSDFObj = function () {
            return l.sendWithPromise('NameTree.getSDFObj', { tree: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.NumberTree.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('numberTreeCreate', { number_tree: t.id }).then(function (t) {
                return _(l.NumberTree, t);
              })
            );
          }),
          (l.NumberTree.prototype.copy = function () {
            return l.sendWithPromise('NumberTree.copy', { tree: this.id }).then(function (t) {
              return _(l.NumberTree, t);
            });
          }),
          (l.NumberTree.prototype.isValid = function () {
            return l.sendWithPromise('NumberTree.isValid', { tree: this.id });
          }),
          (l.NumberTree.prototype.getIterator = function (t) {
            return (
              f(arguments.length, 1, 'getIterator', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('NumberTree.getIterator', {
                  tree: this.id,
                  key: t,
                })
                .then(function (t) {
                  return D(l.DictIterator, t);
                })
            );
          }),
          (l.NumberTree.prototype.getValue = function (t) {
            return (
              f(arguments.length, 1, 'getValue', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('NumberTree.getValue', {
                  tree: this.id,
                  key: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.NumberTree.prototype.getIteratorBegin = function () {
            return l.sendWithPromise('NumberTree.getIteratorBegin', { tree: this.id }).then(function (t) {
              return D(l.DictIterator, t);
            });
          }),
          (l.NumberTree.prototype.put = function (t, e) {
            return (
              f(arguments.length, 2, 'put', '(number, PDFNet.Obj)', [
                [t, 'number'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l.sendWithPromise('NumberTree.put', {
                tree: this.id,
                key: t,
                value: e.id,
              })
            );
          }),
          (l.NumberTree.prototype.eraseKey = function (t) {
            return (
              f(arguments.length, 1, 'eraseKey', '(number)', [[t, 'number']]),
              l.sendWithPromise('NumberTree.eraseKey', {
                tree: this.id,
                key: t,
              })
            );
          }),
          (l.NumberTree.prototype.erase = function (t) {
            return (
              f(arguments.length, 1, 'erase', '(PDFNet.DictIterator)', [[t, 'Object', l.DictIterator, 'DictIterator']]),
              l.sendWithPromise('NumberTree.erase', {
                tree: this.id,
                pos: t.id,
              })
            );
          }),
          (l.NumberTree.prototype.getSDFObj = function () {
            return l.sendWithPromise('NumberTree.getSDFObj', { tree: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Obj.prototype.getType = function () {
            return l.sendWithPromise('Obj.getType', { o: this.id });
          }),
          (l.Obj.prototype.getDoc = function () {
            return l.sendWithPromise('Obj.getDoc', { o: this.id }).then(function (t) {
              return _(l.SDFDoc, t);
            });
          }),
          (l.Obj.prototype.write = function (t) {
            return (
              f(arguments.length, 1, 'write', '(PDFNet.FilterWriter)', [[t, 'Object', l.FilterWriter, 'FilterWriter']]),
              l.sendWithPromise('Obj.write', { o: this.id, stream: t.id })
            );
          }),
          (l.Obj.prototype.isEqual = function (t) {
            return f(arguments.length, 1, 'isEqual', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]), l.sendWithPromise('Obj.isEqual', { o: this.id, to: t.id });
          }),
          (l.Obj.prototype.isBool = function () {
            return l.sendWithPromise('Obj.isBool', { o: this.id });
          }),
          (l.Obj.prototype.getBool = function () {
            return l.sendWithPromise('Obj.getBool', { o: this.id });
          }),
          (l.Obj.prototype.setBool = function (t) {
            return f(arguments.length, 1, 'setBool', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('Obj.setBool', { o: this.id, b: t });
          }),
          (l.Obj.prototype.isNumber = function () {
            return l.sendWithPromise('Obj.isNumber', { o: this.id });
          }),
          (l.Obj.prototype.getNumber = function () {
            return l.sendWithPromise('Obj.getNumber', { o: this.id });
          }),
          (l.Obj.prototype.setNumber = function (t) {
            return f(arguments.length, 1, 'setNumber', '(number)', [[t, 'number']]), l.sendWithPromise('Obj.setNumber', { o: this.id, n: t });
          }),
          (l.Obj.prototype.isNull = function () {
            return l.sendWithPromise('Obj.isNull', { o: this.id });
          }),
          (l.Obj.prototype.isString = function () {
            return l.sendWithPromise('Obj.isString', { o: this.id });
          }),
          (l.Obj.prototype.getBuffer = function () {
            return l.sendWithPromise('Obj.getBuffer', { o: this.id });
          }),
          (l.Obj.prototype.setString = function (t) {
            return f(arguments.length, 1, 'setString', '(string)', [[t, 'string']]), l.sendWithPromise('Obj.setString', { o: this.id, value: t });
          }),
          (l.Obj.prototype.setUString = function (t) {
            return f(arguments.length, 1, 'setUString', '(string)', [[t, 'string']]), l.sendWithPromise('Obj.setUString', { o: this.id, value: t });
          }),
          (l.Obj.prototype.isName = function () {
            return l.sendWithPromise('Obj.isName', { o: this.id });
          }),
          (l.Obj.prototype.getName = function () {
            return l.sendWithPromise('Obj.getName', { o: this.id });
          }),
          (l.Obj.prototype.setName = function (t) {
            return f(arguments.length, 1, 'setName', '(string)', [[t, 'string']]), l.sendWithPromise('Obj.setName', { o: this.id, name: t });
          }),
          (l.Obj.prototype.isIndirect = function () {
            return l.sendWithPromise('Obj.isIndirect', { o: this.id });
          }),
          (l.Obj.prototype.getObjNum = function () {
            return l.sendWithPromise('Obj.getObjNum', { o: this.id });
          }),
          (l.Obj.prototype.getGenNum = function () {
            return l.sendWithPromise('Obj.getGenNum', { o: this.id });
          }),
          (l.Obj.prototype.getOffset = function () {
            return l.sendWithPromise('Obj.getOffset', { o: this.id });
          }),
          (l.Obj.prototype.isFree = function () {
            return l.sendWithPromise('Obj.isFree', { o: this.id });
          }),
          (l.Obj.prototype.setMark = function (t) {
            return f(arguments.length, 1, 'setMark', '(boolean)', [[t, 'boolean']]), l.sendWithPromise('Obj.setMark', { o: this.id, mark: t });
          }),
          (l.Obj.prototype.isMarked = function () {
            return l.sendWithPromise('Obj.isMarked', { o: this.id });
          }),
          (l.Obj.prototype.isLoaded = function () {
            return l.sendWithPromise('Obj.isLoaded', { o: this.id });
          }),
          (l.Obj.prototype.isContainer = function () {
            return l.sendWithPromise('Obj.isContainer', { o: this.id });
          }),
          (l.Obj.prototype.size = function () {
            return l.sendWithPromise('Obj.size', { o: this.id });
          }),
          (l.Obj.prototype.getDictIterator = function () {
            return l.sendWithPromise('Obj.getDictIterator', { o: this.id }).then(function (t) {
              return D(l.DictIterator, t);
            });
          }),
          (l.Obj.prototype.isDict = function () {
            return l.sendWithPromise('Obj.isDict', { o: this.id });
          }),
          (l.Obj.prototype.find = function (t) {
            return (
              f(arguments.length, 1, 'find', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.find', { o: this.id, key: t }).then(function (t) {
                return D(l.DictIterator, t);
              })
            );
          }),
          (l.Obj.prototype.findObj = function (t) {
            return (
              f(arguments.length, 1, 'findObj', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.findObj', { o: this.id, key: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.get = function (t) {
            return (
              f(arguments.length, 1, 'get', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.get', { o: this.id, key: t }).then(function (t) {
                return D(l.DictIterator, t);
              })
            );
          }),
          (l.Obj.prototype.putName = function (t, e) {
            return (
              f(arguments.length, 2, 'putName', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('Obj.putName', { o: this.id, key: t, name: e }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.putArray = function (t) {
            return (
              f(arguments.length, 1, 'putArray', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.putArray', { o: this.id, key: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.putBool = function (t, e) {
            return (
              f(arguments.length, 2, 'putBool', '(string, boolean)', [
                [t, 'string'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('Obj.putBool', {
                  o: this.id,
                  key: t,
                  value: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.putDict = function (t) {
            return (
              f(arguments.length, 1, 'putDict', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.putDict', { o: this.id, key: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.putNumber = function (t, e) {
            return (
              f(arguments.length, 2, 'putNumber', '(string, number)', [
                [t, 'string'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('Obj.putNumber', {
                  o: this.id,
                  key: t,
                  value: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.putString = function (t, e) {
            return (
              f(arguments.length, 2, 'putString', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('Obj.putString', {
                  o: this.id,
                  key: t,
                  value: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.putText = function (t, e) {
            return (
              f(arguments.length, 2, 'putText', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('Obj.putText', { o: this.id, key: t, t: e }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.putNull = function (t) {
            return f(arguments.length, 1, 'putNull', '(string)', [[t, 'string']]), l.sendWithPromise('Obj.putNull', { o: this.id, key: t });
          }),
          (l.Obj.prototype.put = function (t, e) {
            return (
              f(arguments.length, 2, 'put', '(string, PDFNet.Obj)', [
                [t, 'string'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('Obj.put', {
                  o: this.id,
                  key: t,
                  input_obj: e.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.putRect = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'putRect', '(string, number, number, number, number)', [
                [t, 'string'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l
                .sendWithPromise('Obj.putRect', {
                  o: this.id,
                  key: t,
                  x1: e,
                  y1: n,
                  x2: i,
                  y2: r,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.putMatrix = function (t, e) {
            return (
              f(arguments.length, 2, 'putMatrix', '(string, PDFNet.Matrix2D)', [
                [t, 'string'],
                [e, 'Structure', l.Matrix2D, 'Matrix2D'],
              ]),
              F('putMatrix', [[e, 1]]),
              l
                .sendWithPromise('Obj.putMatrix', {
                  o: this.id,
                  key: t,
                  mtx: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.eraseFromKey = function (t) {
            return f(arguments.length, 1, 'eraseFromKey', '(string)', [[t, 'string']]), l.sendWithPromise('Obj.eraseFromKey', { o: this.id, key: t });
          }),
          (l.Obj.prototype.erase = function (t) {
            return (
              f(arguments.length, 1, 'erase', '(PDFNet.DictIterator)', [[t, 'Object', l.DictIterator, 'DictIterator']]),
              l.sendWithPromise('Obj.erase', { o: this.id, pos: t.id })
            );
          }),
          (l.Obj.prototype.rename = function (t, e) {
            return (
              f(arguments.length, 2, 'rename', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]),
              l.sendWithPromise('Obj.rename', {
                o: this.id,
                old_key: t,
                new_key: e,
              })
            );
          }),
          (l.Obj.prototype.isArray = function () {
            return l.sendWithPromise('Obj.isArray', { o: this.id });
          }),
          (l.Obj.prototype.getAt = function (t) {
            return (
              f(arguments.length, 1, 'getAt', '(number)', [[t, 'number']]),
              l.sendWithPromise('Obj.getAt', { o: this.id, index: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.insertName = function (t, e) {
            return (
              f(arguments.length, 2, 'insertName', '(number, string)', [
                [t, 'number'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('Obj.insertName', {
                  o: this.id,
                  pos: t,
                  name: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.insertArray = function (t) {
            return (
              f(arguments.length, 1, 'insertArray', '(number)', [[t, 'number']]),
              l.sendWithPromise('Obj.insertArray', { o: this.id, pos: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.insertBool = function (t, e) {
            return (
              f(arguments.length, 2, 'insertBool', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('Obj.insertBool', {
                  o: this.id,
                  pos: t,
                  value: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.insertDict = function (t) {
            return (
              f(arguments.length, 1, 'insertDict', '(number)', [[t, 'number']]),
              l.sendWithPromise('Obj.insertDict', { o: this.id, pos: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.insertNumber = function (t, e) {
            return (
              f(arguments.length, 2, 'insertNumber', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l
                .sendWithPromise('Obj.insertNumber', {
                  o: this.id,
                  pos: t,
                  value: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.insertString = function (t, e) {
            return (
              f(arguments.length, 2, 'insertString', '(number, string)', [
                [t, 'number'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('Obj.insertString', {
                  o: this.id,
                  pos: t,
                  value: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.insertText = function (t, e) {
            return (
              f(arguments.length, 2, 'insertText', '(number, string)', [
                [t, 'number'],
                [e, 'string'],
              ]),
              l.sendWithPromise('Obj.insertText', { o: this.id, pos: t, t: e }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.insertNull = function (t) {
            return (
              f(arguments.length, 1, 'insertNull', '(number)', [[t, 'number']]),
              l.sendWithPromise('Obj.insertNull', { o: this.id, pos: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.insert = function (t, e) {
            return (
              f(arguments.length, 2, 'insert', '(number, PDFNet.Obj)', [
                [t, 'number'],
                [e, 'Object', l.Obj, 'Obj'],
              ]),
              l
                .sendWithPromise('Obj.insert', {
                  o: this.id,
                  pos: t,
                  input_obj: e.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.insertRect = function (t, e, n, i, r) {
            return (
              f(arguments.length, 5, 'insertRect', '(number, number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
              ]),
              l
                .sendWithPromise('Obj.insertRect', {
                  o: this.id,
                  pos: t,
                  x1: e,
                  y1: n,
                  x2: i,
                  y2: r,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.insertMatrix = function (t, e) {
            return (
              f(arguments.length, 2, 'insertMatrix', '(number, PDFNet.Matrix2D)', [
                [t, 'number'],
                [e, 'Structure', l.Matrix2D, 'Matrix2D'],
              ]),
              F('insertMatrix', [[e, 1]]),
              l
                .sendWithPromise('Obj.insertMatrix', {
                  o: this.id,
                  pos: t,
                  mtx: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.pushBackName = function (t) {
            return (
              f(arguments.length, 1, 'pushBackName', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.pushBackName', { o: this.id, name: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.pushBackArray = function () {
            return l.sendWithPromise('Obj.pushBackArray', { o: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Obj.prototype.pushBackBool = function (t) {
            return (
              f(arguments.length, 1, 'pushBackBool', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Obj.pushBackBool', { o: this.id, value: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.pushBackDict = function () {
            return l.sendWithPromise('Obj.pushBackDict', { o: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Obj.prototype.pushBackNumber = function (t) {
            return (
              f(arguments.length, 1, 'pushBackNumber', '(number)', [[t, 'number']]),
              l.sendWithPromise('Obj.pushBackNumber', { o: this.id, value: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.pushBackString = function (t) {
            return (
              f(arguments.length, 1, 'pushBackString', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.pushBackString', { o: this.id, value: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.pushBackText = function (t) {
            return (
              f(arguments.length, 1, 'pushBackText', '(string)', [[t, 'string']]),
              l.sendWithPromise('Obj.pushBackText', { o: this.id, t: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.pushBackNull = function () {
            return l.sendWithPromise('Obj.pushBackNull', { o: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.Obj.prototype.pushBack = function (t) {
            return (
              f(arguments.length, 1, 'pushBack', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l
                .sendWithPromise('Obj.pushBack', {
                  o: this.id,
                  input_obj: t.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.pushBackRect = function (t, e, n, i) {
            return (
              f(arguments.length, 4, 'pushBackRect', '(number, number, number, number)', [
                [t, 'number'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
              ]),
              l
                .sendWithPromise('Obj.pushBackRect', {
                  o: this.id,
                  x1: t,
                  y1: e,
                  x2: n,
                  y2: i,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.Obj.prototype.pushBackMatrix = function (t) {
            return (
              f(arguments.length, 1, 'pushBackMatrix', '(PDFNet.Matrix2D)', [[t, 'Structure', l.Matrix2D, 'Matrix2D']]),
              F('pushBackMatrix', [[t, 0]]),
              l.sendWithPromise('Obj.pushBackMatrix', { o: this.id, mtx: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.Obj.prototype.eraseAt = function (t) {
            return f(arguments.length, 1, 'eraseAt', '(number)', [[t, 'number']]), l.sendWithPromise('Obj.eraseAt', { o: this.id, pos: t });
          }),
          (l.Obj.prototype.isStream = function () {
            return l.sendWithPromise('Obj.isStream', { o: this.id });
          }),
          (l.Obj.prototype.getRawStreamLength = function () {
            return l.sendWithPromise('Obj.getRawStreamLength', { o: this.id });
          }),
          (l.Obj.prototype.setStreamData = function (t) {
            f(arguments.length, 1, 'setStreamData', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('Obj.setStreamData', {
              obj: this.id,
              data_buf: e,
            });
          }),
          (l.Obj.prototype.setStreamDataWithFilter = function (t, e) {
            f(arguments.length, 2, 'setStreamDataWithFilter', '(ArrayBuffer|TypedArray, PDFNet.Filter)', [
              [t, 'ArrayBuffer'],
              [e, 'Object', l.Filter, 'Filter'],
            ]);
            var n = b(t, !1);
            return (
              0 != e.id && O(e.id),
              l.sendWithPromise('Obj.setStreamDataWithFilter', {
                obj: this.id,
                data_buf: n,
                no_own_filter_chain: e.id,
              })
            );
          }),
          (l.Obj.prototype.getRawStream = function (t) {
            return (
              f(arguments.length, 1, 'getRawStream', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('Obj.getRawStream', { o: this.id, decrypt: t }).then(function (t) {
                return _(l.Filter, t);
              })
            );
          }),
          (l.Obj.prototype.getDecodedStream = function () {
            return l.sendWithPromise('Obj.getDecodedStream', { o: this.id }).then(function (t) {
              return _(l.Filter, t);
            });
          }),
          (l.ObjSet.create = function () {
            return l.sendWithPromise('objSetCreate', {}).then(function (t) {
              return D(l.ObjSet, t);
            });
          }),
          (l.ObjSet.prototype.createName = function (t) {
            return (
              f(arguments.length, 1, 'createName', '(string)', [[t, 'string']]),
              l.sendWithPromise('ObjSet.createName', { set: this.id, name: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.ObjSet.prototype.createArray = function () {
            return l.sendWithPromise('ObjSet.createArray', { set: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ObjSet.prototype.createBool = function (t) {
            return (
              f(arguments.length, 1, 'createBool', '(boolean)', [[t, 'boolean']]),
              l
                .sendWithPromise('ObjSet.createBool', {
                  set: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ObjSet.prototype.createDict = function () {
            return l.sendWithPromise('ObjSet.createDict', { set: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ObjSet.prototype.createNull = function () {
            return l.sendWithPromise('ObjSet.createNull', { set: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.ObjSet.prototype.createNumber = function (t) {
            return (
              f(arguments.length, 1, 'createNumber', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('ObjSet.createNumber', {
                  set: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ObjSet.prototype.createString = function (t) {
            return (
              f(arguments.length, 1, 'createString', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ObjSet.createString', {
                  set: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.ObjSet.prototype.createFromJson = function (t) {
            return (
              f(arguments.length, 1, 'createFromJson', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ObjSet.createFromJson', {
                  set: this.id,
                  json: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.createShallowCopy = function () {
            return l.sendWithPromise('SDFDoc.createShallowCopy', { source: this.id }).then(function (t) {
              return _(l.SDFDoc, t);
            });
          }),
          (l.SDFDoc.prototype.releaseFileHandles = function () {
            return l.sendWithPromise('SDFDoc.releaseFileHandles', {
              doc: this.id,
            });
          }),
          (l.SDFDoc.prototype.isEncrypted = function () {
            return l.sendWithPromise('SDFDoc.isEncrypted', { doc: this.id });
          }),
          (l.SDFDoc.prototype.initStdSecurityHandlerUString = function (t) {
            return (
              f(arguments.length, 1, 'initStdSecurityHandlerUString', '(string)', [[t, 'string']]),
              l.sendWithPromise('SDFDoc.initStdSecurityHandlerUString', {
                doc: this.id,
                password: t,
              })
            );
          }),
          (l.SDFDoc.prototype.isModified = function () {
            return l.sendWithPromise('SDFDoc.isModified', { doc: this.id });
          }),
          (l.SDFDoc.prototype.hasRepairedXRef = function () {
            return l.sendWithPromise('SDFDoc.hasRepairedXRef', {
              doc: this.id,
            });
          }),
          (l.SDFDoc.prototype.isFullSaveRequired = function () {
            return l.sendWithPromise('SDFDoc.isFullSaveRequired', {
              doc: this.id,
            });
          }),
          (l.SDFDoc.prototype.getTrailer = function () {
            return l.sendWithPromise('SDFDoc.getTrailer', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SDFDoc.prototype.getObj = function (t) {
            return (
              f(arguments.length, 1, 'getObj', '(number)', [[t, 'number']]),
              l.sendWithPromise('SDFDoc.getObj', { doc: this.id, obj_num: t }).then(function (t) {
                return _(l.Obj, t);
              })
            );
          }),
          (l.SDFDoc.prototype.importObj = function (t, e) {
            return (
              f(arguments.length, 2, 'importObj', '(PDFNet.Obj, boolean)', [
                [t, 'Object', l.Obj, 'Obj'],
                [e, 'boolean'],
              ]),
              l
                .sendWithPromise('SDFDoc.importObj', {
                  doc: this.id,
                  obj: t.id,
                  deep_copy: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.importObjsWithExcludeList = function (t, e) {
            return (
              f(arguments.length, 2, 'importObjsWithExcludeList', '(Array<Core.PDFNet.Obj>, Array<Core.PDFNet.Obj>)', [
                [t, 'Array'],
                [e, 'Array'],
              ]),
              (t = Array.from(t, function (t) {
                return t.id;
              })),
              (e = Array.from(e, function (t) {
                return t.id;
              })),
              l
                .sendWithPromise('SDFDoc.importObjsWithExcludeList', {
                  doc: this.id,
                  obj_list: t,
                  exclude_list: e,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.xRefSize = function () {
            return l.sendWithPromise('SDFDoc.xRefSize', { doc: this.id });
          }),
          (l.SDFDoc.prototype.clearMarks = function () {
            return l.sendWithPromise('SDFDoc.clearMarks', { doc: this.id });
          }),
          (l.SDFDoc.prototype.saveMemory = function (t, e) {
            return (
              f(arguments.length, 2, 'saveMemory', '(number, string)', [
                [t, 'number'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('SDFDoc.saveMemory', {
                  doc: this.id,
                  flags: t,
                  header: e,
                })
                .then(function (t) {
                  return new Uint8Array(t);
                })
            );
          }),
          (l.SDFDoc.prototype.saveStream = function (t, e, n) {
            return (
              f(arguments.length, 3, 'saveStream', '(PDFNet.Filter, number, string)', [
                [t, 'Object', l.Filter, 'Filter'],
                [e, 'number'],
                [n, 'string'],
              ]),
              l.sendWithPromise('SDFDoc.saveStream', {
                doc: this.id,
                stream: t.id,
                flags: e,
                header: n,
              })
            );
          }),
          (l.SDFDoc.prototype.getHeader = function () {
            return l.sendWithPromise('SDFDoc.getHeader', { doc: this.id });
          }),
          (l.SDFDoc.prototype.getSecurityHandler = function () {
            return l.sendWithPromise('SDFDoc.getSecurityHandler', { doc: this.id }).then(function (t) {
              return _(l.SecurityHandler, t);
            });
          }),
          (l.SDFDoc.prototype.setSecurityHandler = function (t) {
            return (
              f(arguments.length, 1, 'setSecurityHandler', '(PDFNet.SecurityHandler)', [[t, 'Object', l.SecurityHandler, 'SecurityHandler']]),
              0 != t.id && O(t.id),
              l.sendWithPromise('SDFDoc.setSecurityHandler', {
                doc: this.id,
                no_own_handler: t.id,
              })
            );
          }),
          (l.SDFDoc.prototype.removeSecurity = function () {
            return l.sendWithPromise('SDFDoc.removeSecurity', { doc: this.id });
          }),
          (l.SDFDoc.prototype.swap = function (t, e) {
            return (
              f(arguments.length, 2, 'swap', '(number, number)', [
                [t, 'number'],
                [e, 'number'],
              ]),
              l.sendWithPromise('SDFDoc.swap', {
                doc: this.id,
                obj_num1: t,
                obj_num2: e,
              })
            );
          }),
          (l.SDFDoc.prototype.isLinearized = function () {
            return l.sendWithPromise('SDFDoc.isLinearized', { doc: this.id });
          }),
          (l.SDFDoc.prototype.getLinearizationDict = function () {
            return l.sendWithPromise('SDFDoc.getLinearizationDict', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SDFDoc.prototype.getHintStream = function () {
            return l.sendWithPromise('SDFDoc.getHintStream', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SDFDoc.prototype.enableDiskCaching = function (t) {
            return (
              f(arguments.length, 1, 'enableDiskCaching', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('SDFDoc.enableDiskCaching', {
                doc: this.id,
                use_cache_flag: t,
              })
            );
          }),
          (l.SDFDoc.prototype.lock = function () {
            var t = this;
            return l.sendWithPromise('SDFDoc.lock', { doc: this.id }).then(function () {
              o.push({ name: 'SDFDoc', id: t.id, unlocktype: 'unlock' });
            });
          }),
          (l.SDFDoc.prototype.unlock = function () {
            var t = this;
            return l.sendWithPromise('SDFDoc.unlock', { doc: this.id }).then(function () {
              S(t);
            });
          }),
          (l.SDFDoc.prototype.lockRead = function () {
            var t = this;
            return l.sendWithPromise('SDFDoc.lockRead', { doc: this.id }).then(function () {
              o.push({ name: 'SDFDoc', id: t.id, unlocktype: 'unlockRead' });
            });
          }),
          (l.SDFDoc.prototype.unlockRead = function () {
            var t = this;
            return l.sendWithPromise('SDFDoc.unlockRead', { doc: this.id }).then(function () {
              S(t);
            });
          }),
          (l.SDFDoc.prototype.tryLock = function () {
            var e = this;
            return l.sendWithPromise('SDFDoc.tryLock', { doc: this.id }).then(function (t) {
              t && o.push({ name: 'SDFDoc', id: e.id, unlocktype: 'unlock' });
            });
          }),
          (l.SDFDoc.prototype.tryLockRead = function () {
            var e = this;
            return l.sendWithPromise('SDFDoc.tryLockRead', { doc: this.id }).then(function (t) {
              t &&
                o.push({
                  name: 'SDFDoc',
                  id: e.id,
                  unlocktype: 'unlockRead',
                });
            });
          }),
          (l.SDFDoc.prototype.getFileName = function () {
            return l.sendWithPromise('SDFDoc.getFileName', { doc: this.id });
          }),
          (l.SDFDoc.prototype.createIndirectName = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectName', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('SDFDoc.createIndirectName', {
                  doc: this.id,
                  name: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.createIndirectArray = function () {
            return l.sendWithPromise('SDFDoc.createIndirectArray', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SDFDoc.prototype.createIndirectBool = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectBool', '(boolean)', [[t, 'boolean']]),
              l
                .sendWithPromise('SDFDoc.createIndirectBool', {
                  doc: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.createIndirectDict = function () {
            return l.sendWithPromise('SDFDoc.createIndirectDict', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SDFDoc.prototype.createIndirectNull = function () {
            return l.sendWithPromise('SDFDoc.createIndirectNull', { doc: this.id }).then(function (t) {
              return _(l.Obj, t);
            });
          }),
          (l.SDFDoc.prototype.createIndirectNumber = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectNumber', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('SDFDoc.createIndirectNumber', {
                  doc: this.id,
                  value: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.createIndirectString = function (t) {
            f(arguments.length, 1, 'createIndirectString', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l
              .sendWithPromise('SDFDoc.createIndirectString', {
                doc: this.id,
                buf_value: e,
              })
              .then(function (t) {
                return _(l.Obj, t);
              });
          }),
          (l.SDFDoc.prototype.createIndirectStringFromUString = function (t) {
            return (
              f(arguments.length, 1, 'createIndirectStringFromUString', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('SDFDoc.createIndirectStringFromUString', {
                  doc: this.id,
                  str: t,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.createIndirectStreamFromFilter = function (t, e) {
            return (
              void 0 === e && (e = new l.Filter('0')),
              f(arguments.length, 1, 'createIndirectStreamFromFilter', '(PDFNet.FilterReader, PDFNet.Filter)', [
                [t, 'Object', l.FilterReader, 'FilterReader'],
                [e, 'Object', l.Filter, 'Filter'],
              ]),
              0 != e.id && O(e.id),
              l
                .sendWithPromise('SDFDoc.createIndirectStreamFromFilter', {
                  doc: this.id,
                  data: t.id,
                  no_own_filter_chain: e.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SDFDoc.prototype.createIndirectStream = function (t, e) {
            f(arguments.length, 2, 'createIndirectStream', '(ArrayBuffer|TypedArray, PDFNet.Filter)', [
              [t, 'ArrayBuffer'],
              [e, 'Object', l.Filter, 'Filter'],
            ]);
            var n = b(t, !1);
            return (
              0 != e.id && O(e.id),
              l
                .sendWithPromise('SDFDoc.createIndirectStream', {
                  doc: this.id,
                  data_buf: n,
                  no_own_filter_chain: e.id,
                })
                .then(function (t) {
                  return _(l.Obj, t);
                })
            );
          }),
          (l.SecurityHandler.prototype.getPermission = function (t) {
            return (
              f(arguments.length, 1, 'getPermission', '(number)', [[t, 'number']]),
              l.sendWithPromise('SecurityHandler.getPermission', {
                sh: this.id,
                p: t,
              })
            );
          }),
          (l.SecurityHandler.prototype.getKeyLength = function () {
            return l.sendWithPromise('SecurityHandler.getKeyLength', {
              sh: this.id,
            });
          }),
          (l.SecurityHandler.prototype.getEncryptionAlgorithmID = function () {
            return l.sendWithPromise('SecurityHandler.getEncryptionAlgorithmID', { sh: this.id });
          }),
          (l.SecurityHandler.prototype.getHandlerDocName = function () {
            return l.sendWithPromise('SecurityHandler.getHandlerDocName', {
              sh: this.id,
            });
          }),
          (l.SecurityHandler.prototype.isModified = function () {
            return l.sendWithPromise('SecurityHandler.isModified', {
              sh: this.id,
            });
          }),
          (l.SecurityHandler.prototype.setModified = function (t) {
            return (
              void 0 === t && (t = !0),
              f(arguments.length, 0, 'setModified', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('SecurityHandler.setModified', {
                sh: this.id,
                is_modified: t,
              })
            );
          }),
          (l.SecurityHandler.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(number)', [[t, 'number']]),
              l.sendWithPromise('securityHandlerCreate', { crypt_type: t }).then(function (t) {
                return D(l.SecurityHandler, t);
              })
            );
          }),
          (l.SecurityHandler.createFromEncCode = function (t, e, n) {
            return (
              f(arguments.length, 3, 'createFromEncCode', '(string, number, number)', [
                [t, 'string'],
                [e, 'number'],
                [n, 'number'],
              ]),
              l
                .sendWithPromise('securityHandlerCreateFromEncCode', {
                  name: t,
                  key_len: e,
                  enc_code: n,
                })
                .then(function (t) {
                  return D(l.SecurityHandler, t);
                })
            );
          }),
          (l.SecurityHandler.createDefault = function () {
            return l.sendWithPromise('securityHandlerCreateDefault', {}).then(function (t) {
              return D(l.SecurityHandler, t);
            });
          }),
          (l.SecurityHandler.prototype.setPermission = function (t, e) {
            return (
              f(arguments.length, 2, 'setPermission', '(number, boolean)', [
                [t, 'number'],
                [e, 'boolean'],
              ]),
              l.sendWithPromise('SecurityHandler.setPermission', {
                sh: this.id,
                perm: t,
                value: e,
              })
            );
          }),
          (l.SecurityHandler.prototype.changeRevisionNumber = function (t) {
            return (
              f(arguments.length, 1, 'changeRevisionNumber', '(number)', [[t, 'number']]),
              l.sendWithPromise('SecurityHandler.changeRevisionNumber', {
                sh: this.id,
                rev_num: t,
              })
            );
          }),
          (l.SecurityHandler.prototype.setEncryptMetadata = function (t) {
            return (
              f(arguments.length, 1, 'setEncryptMetadata', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('SecurityHandler.setEncryptMetadata', {
                sh: this.id,
                encrypt_metadata: t,
              })
            );
          }),
          (l.SecurityHandler.prototype.getRevisionNumber = function () {
            return l.sendWithPromise('SecurityHandler.getRevisionNumber', {
              sh: this.id,
            });
          }),
          (l.SecurityHandler.prototype.isUserPasswordRequired = function () {
            return l.sendWithPromise('SecurityHandler.isUserPasswordRequired', {
              sh: this.id,
            });
          }),
          (l.SecurityHandler.prototype.isMasterPasswordRequired = function () {
            return l.sendWithPromise('SecurityHandler.isMasterPasswordRequired', { sh: this.id });
          }),
          (l.SecurityHandler.prototype.isAES = function () {
            return l.sendWithPromise('SecurityHandler.isAES', { sh: this.id });
          }),
          (l.SecurityHandler.prototype.isAESObj = function (t) {
            return (
              f(arguments.length, 1, 'isAESObj', '(PDFNet.Obj)', [[t, 'Object', l.Obj, 'Obj']]),
              l.sendWithPromise('SecurityHandler.isAESObj', {
                sh: this.id,
                stream: t.id,
              })
            );
          }),
          (l.SecurityHandler.prototype.isRC4 = function () {
            return l.sendWithPromise('SecurityHandler.isRC4', { sh: this.id });
          }),
          (l.SecurityHandler.prototype.changeUserPasswordUString = function (t) {
            return (
              f(arguments.length, 1, 'changeUserPasswordUString', '(string)', [[t, 'string']]),
              l.sendWithPromise('SecurityHandler.changeUserPasswordUString', {
                sh: this.id,
                password: t,
              })
            );
          }),
          (l.SecurityHandler.prototype.changeUserPasswordBuffer = function (t) {
            f(arguments.length, 1, 'changeUserPasswordBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('SecurityHandler.changeUserPasswordBuffer', { sh: this.id, password_buf: e });
          }),
          (l.SecurityHandler.prototype.changeMasterPasswordUString = function (t) {
            return (
              f(arguments.length, 1, 'changeMasterPasswordUString', '(string)', [[t, 'string']]),
              l.sendWithPromise('SecurityHandler.changeMasterPasswordUString', {
                sh: this.id,
                password: t,
              })
            );
          }),
          (l.SecurityHandler.prototype.changeMasterPasswordBuffer = function (t) {
            f(arguments.length, 1, 'changeMasterPasswordBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('SecurityHandler.changeMasterPasswordBuffer', { sh: this.id, password_buf: e });
          }),
          (l.SecurityHandler.prototype.initPasswordUString = function (t) {
            return (
              f(arguments.length, 1, 'initPasswordUString', '(string)', [[t, 'string']]),
              l.sendWithPromise('SecurityHandler.initPasswordUString', {
                sh: this.id,
                password: t,
              })
            );
          }),
          (l.SecurityHandler.prototype.initPasswordBuffer = function (t) {
            f(arguments.length, 1, 'initPasswordBuffer', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('SecurityHandler.initPasswordBuffer', {
              sh: this.id,
              password_buf: e,
            });
          }),
          (l.SignatureHandler.prototype.getName = function () {
            return l.sendWithPromise('SignatureHandler.getName', {
              signature_handler: this.id,
            });
          }),
          (l.SignatureHandler.prototype.reset = function () {
            return l.sendWithPromise('SignatureHandler.reset', {
              signature_handler: this.id,
            });
          }),
          (l.SignatureHandler.prototype.destructor = function () {
            return l.sendWithPromise('SignatureHandler.destructor', {
              signature_handler: this.id,
            });
          }),
          (l.UndoManager.prototype.discardAllSnapshots = function () {
            return l
              .sendWithPromise('UndoManager.discardAllSnapshots', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.DocSnapshot, t);
              });
          }),
          (l.UndoManager.prototype.undo = function () {
            return l.sendWithPromise('UndoManager.undo', { self: this.id }).then(function (t) {
              return D(l.ResultSnapshot, t);
            });
          }),
          (l.UndoManager.prototype.canUndo = function () {
            return l.sendWithPromise('UndoManager.canUndo', { self: this.id });
          }),
          (l.UndoManager.prototype.getNextUndoSnapshot = function () {
            return l
              .sendWithPromise('UndoManager.getNextUndoSnapshot', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.DocSnapshot, t);
              });
          }),
          (l.UndoManager.prototype.redo = function () {
            return l.sendWithPromise('UndoManager.redo', { self: this.id }).then(function (t) {
              return D(l.ResultSnapshot, t);
            });
          }),
          (l.UndoManager.prototype.canRedo = function () {
            return l.sendWithPromise('UndoManager.canRedo', { self: this.id });
          }),
          (l.UndoManager.prototype.getNextRedoSnapshot = function () {
            return l
              .sendWithPromise('UndoManager.getNextRedoSnapshot', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.DocSnapshot, t);
              });
          }),
          (l.UndoManager.prototype.takeSnapshot = function () {
            return l.sendWithPromise('UndoManager.takeSnapshot', { self: this.id }).then(function (t) {
              return D(l.ResultSnapshot, t);
            });
          }),
          (l.ResultSnapshot.prototype.currentState = function () {
            return l.sendWithPromise('ResultSnapshot.currentState', { self: this.id }).then(function (t) {
              return D(l.DocSnapshot, t);
            });
          }),
          (l.ResultSnapshot.prototype.previousState = function () {
            return l
              .sendWithPromise('ResultSnapshot.previousState', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.DocSnapshot, t);
              });
          }),
          (l.ResultSnapshot.prototype.isOk = function () {
            return l.sendWithPromise('ResultSnapshot.isOk', { self: this.id });
          }),
          (l.ResultSnapshot.prototype.isNullTransition = function () {
            return l.sendWithPromise('ResultSnapshot.isNullTransition', {
              self: this.id,
            });
          }),
          (l.DocSnapshot.prototype.getHash = function () {
            return l.sendWithPromise('DocSnapshot.getHash', { self: this.id });
          }),
          (l.DocSnapshot.prototype.isValid = function () {
            return l.sendWithPromise('DocSnapshot.isValid', { self: this.id });
          }),
          (l.DocSnapshot.prototype.equals = function (t) {
            return (
              f(arguments.length, 1, 'equals', '(PDFNet.DocSnapshot)', [[t, 'Object', l.DocSnapshot, 'DocSnapshot']]),
              l.sendWithPromise('DocSnapshot.equals', {
                self: this.id,
                snapshot: t.id,
              })
            );
          }),
          (l.OCRModule.applyOCRJsonToPDF = function (t, e) {
            return (
              f(arguments.length, 2, 'applyOCRJsonToPDF', '(PDFNet.PDFDoc, string)', [
                [t, 'PDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('ocrModuleApplyOCRJsonToPDF', {
                dst: t.id,
                json: e,
              })
            );
          }),
          (l.OCRModule.applyOCRXmlToPDF = function (t, e) {
            return (
              f(arguments.length, 2, 'applyOCRXmlToPDF', '(PDFNet.PDFDoc, string)', [
                [t, 'PDFDoc'],
                [e, 'string'],
              ]),
              l.sendWithPromise('ocrModuleApplyOCRXmlToPDF', {
                dst: t.id,
                xml: e,
              })
            );
          }),
          (l.VerificationOptions.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(number)', [[t, 'number']]),
              l.sendWithPromise('verificationOptionsCreate', { in_level: t }).then(function (t) {
                return D(l.VerificationOptions, t);
              })
            );
          }),
          (l.VerificationOptions.prototype.addTrustedCertificate = function (t, e) {
            void 0 === e && (e = l.VerificationOptions.CertificateTrustFlag.e_default_trust),
              f(arguments.length, 1, 'addTrustedCertificate', '(ArrayBuffer|TypedArray, number)', [
                [t, 'ArrayBuffer'],
                [e, 'number'],
              ]);
            var n = b(t, !1);
            return l.sendWithPromise('VerificationOptions.addTrustedCertificate', { self: this.id, in_certificate_buf: n, in_trust_flags: e });
          }),
          (l.VerificationOptions.prototype.addTrustedCertificates = function (t) {
            f(arguments.length, 1, 'addTrustedCertificates', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
            var e = b(t, !1);
            return l.sendWithPromise('VerificationOptions.addTrustedCertificates', {
              self: this.id,
              in_P7C_binary_DER_certificates_file_data_buf: e,
            });
          }),
          (l.VerificationOptions.prototype.loadTrustList = function (t) {
            return (
              f(arguments.length, 1, 'loadTrustList', '(PDFNet.FDFDoc)', [[t, 'FDFDoc']]),
              l.sendWithPromise('VerificationOptions.loadTrustList', {
                self: this.id,
                in_fdf_cert_exchange_data: t.id,
              })
            );
          }),
          (l.VerificationOptions.prototype.enableModificationVerification = function (t) {
            return (
              f(arguments.length, 1, 'enableModificationVerification', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('VerificationOptions.enableModificationVerification', { self: this.id, in_on_or_off: t })
            );
          }),
          (l.VerificationOptions.prototype.enableDigestVerification = function (t) {
            return (
              f(arguments.length, 1, 'enableDigestVerification', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('VerificationOptions.enableDigestVerification', { self: this.id, in_on_or_off: t })
            );
          }),
          (l.VerificationOptions.prototype.enableTrustVerification = function (t) {
            return (
              f(arguments.length, 1, 'enableTrustVerification', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('VerificationOptions.enableTrustVerification', {
                self: this.id,
                in_on_or_off: t,
              })
            );
          }),
          (l.VerificationOptions.prototype.setRevocationProxyPrefix = function (t) {
            return (
              f(arguments.length, 1, 'setRevocationProxyPrefix', '(string)', [[t, 'string']]),
              l.sendWithPromise('VerificationOptions.setRevocationProxyPrefix', { self: this.id, in_str: t })
            );
          }),
          (l.VerificationOptions.prototype.setRevocationTimeout = function (t) {
            return (
              f(arguments.length, 1, 'setRevocationTimeout', '(number)', [[t, 'number']]),
              l.sendWithPromise('VerificationOptions.setRevocationTimeout', {
                self: this.id,
                in_revocation_timeout_milliseconds: t,
              })
            );
          }),
          (l.VerificationOptions.prototype.enableOnlineCRLRevocationChecking = function (t) {
            return (
              f(arguments.length, 1, 'enableOnlineCRLRevocationChecking', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('VerificationOptions.enableOnlineCRLRevocationChecking', { self: this.id, in_on_or_off: t })
            );
          }),
          (l.VerificationOptions.prototype.enableOnlineOCSPRevocationChecking = function (t) {
            return (
              f(arguments.length, 1, 'enableOnlineOCSPRevocationChecking', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('VerificationOptions.enableOnlineOCSPRevocationChecking', { self: this.id, in_on_or_off: t })
            );
          }),
          (l.VerificationOptions.prototype.enableOnlineRevocationChecking = function (t) {
            return (
              f(arguments.length, 1, 'enableOnlineRevocationChecking', '(boolean)', [[t, 'boolean']]),
              l.sendWithPromise('VerificationOptions.enableOnlineRevocationChecking', { self: this.id, in_on_or_off: t })
            );
          }),
          (l.VerificationResult.prototype.getDigitalSignatureField = function () {
            return l.sendWithPromise('VerificationResult.getDigitalSignatureField', { self: this.id }).then(function (t) {
              return new l.DigitalSignatureField(t);
            });
          }),
          (l.VerificationResult.prototype.getVerificationStatus = function () {
            return l.sendWithPromise('VerificationResult.getVerificationStatus', { self: this.id });
          }),
          (l.VerificationResult.prototype.getDocumentStatus = function () {
            return l.sendWithPromise('VerificationResult.getDocumentStatus', {
              self: this.id,
            });
          }),
          (l.VerificationResult.prototype.getDigestStatus = function () {
            return l.sendWithPromise('VerificationResult.getDigestStatus', {
              self: this.id,
            });
          }),
          (l.VerificationResult.prototype.getTrustStatus = function () {
            return l.sendWithPromise('VerificationResult.getTrustStatus', {
              self: this.id,
            });
          }),
          (l.VerificationResult.prototype.getPermissionsStatus = function () {
            return l.sendWithPromise('VerificationResult.getPermissionsStatus', { self: this.id });
          }),
          (l.VerificationResult.prototype.getTrustVerificationResult = function () {
            return l.sendWithPromise('VerificationResult.getTrustVerificationResult', { self: this.id }).then(function (t) {
              return D(l.TrustVerificationResult, t);
            });
          }),
          (l.VerificationResult.prototype.hasTrustVerificationResult = function () {
            return l.sendWithPromise('VerificationResult.hasTrustVerificationResult', { self: this.id });
          }),
          (l.VerificationResult.prototype.getDisallowedChanges = function () {
            return l
              .sendWithPromise('VerificationResult.getDisallowedChanges', {
                self: this.id,
              })
              .then(function (t) {
                for (var e = [], n = 0; n < t.length; ++n) {
                  var i = t[n];
                  if ('0' === i) return null;
                  (i = new l.DisallowedChange(i)), e.push(i), c.push({ name: i.name, id: i.id });
                }
                return e;
              });
          }),
          (l.VerificationResult.prototype.getDigestAlgorithm = function () {
            return l.sendWithPromise('VerificationResult.getDigestAlgorithm', {
              self: this.id,
            });
          }),
          (l.VerificationResult.prototype.getDocumentStatusAsString = function () {
            return l.sendWithPromise('VerificationResult.getDocumentStatusAsString', { self: this.id });
          }),
          (l.VerificationResult.prototype.getDigestStatusAsString = function () {
            return l.sendWithPromise('VerificationResult.getDigestStatusAsString', { self: this.id });
          }),
          (l.VerificationResult.prototype.getTrustStatusAsString = function () {
            return l.sendWithPromise('VerificationResult.getTrustStatusAsString', { self: this.id });
          }),
          (l.VerificationResult.prototype.getPermissionsStatusAsString = function () {
            return l.sendWithPromise('VerificationResult.getPermissionsStatusAsString', { self: this.id });
          }),
          (l.VerificationResult.prototype.getUnsupportedFeatures = function () {
            return l.sendWithPromise('VerificationResult.getUnsupportedFeatures', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getVerificationStatus = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getVerificationStatus', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getCMSDigestStatus = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getCMSDigestStatus', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getMessageImprintDigestStatus = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getMessageImprintDigestStatus', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getTrustStatus = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getTrustStatus', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getCMSDigestStatusAsString = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getCMSDigestStatusAsString', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getMessageImprintDigestStatusAsString = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getMessageImprintDigestStatusAsString', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getTrustStatusAsString = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getTrustStatusAsString', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.hasTrustVerificationResult = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.hasTrustVerificationResult', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getTrustVerificationResult = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getTrustVerificationResult', { self: this.id }).then(function (t) {
              return D(l.TrustVerificationResult, t);
            });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getCMSSignatureDigestAlgorithm = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getCMSSignatureDigestAlgorithm', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getMessageImprintDigestAlgorithm = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getMessageImprintDigestAlgorithm', { self: this.id });
          }),
          (l.EmbeddedTimestampVerificationResult.prototype.getUnsupportedFeatures = function () {
            return l.sendWithPromise('EmbeddedTimestampVerificationResult.getUnsupportedFeatures', { self: this.id });
          }),
          (l.TrustVerificationResult.prototype.wasSuccessful = function () {
            return l.sendWithPromise('TrustVerificationResult.wasSuccessful', {
              self: this.id,
            });
          }),
          (l.TrustVerificationResult.prototype.getResultString = function () {
            return l.sendWithPromise('TrustVerificationResult.getResultString', { self: this.id });
          }),
          (l.TrustVerificationResult.prototype.getTimeOfTrustVerification = function () {
            return l.sendWithPromise('TrustVerificationResult.getTimeOfTrustVerification', { self: this.id });
          }),
          (l.TrustVerificationResult.prototype.getTimeOfTrustVerificationEnum = function () {
            return l.sendWithPromise('TrustVerificationResult.getTimeOfTrustVerificationEnum', { self: this.id });
          }),
          (l.TrustVerificationResult.prototype.hasEmbeddedTimestampVerificationResult = function () {
            return l.sendWithPromise('TrustVerificationResult.hasEmbeddedTimestampVerificationResult', { self: this.id });
          }),
          (l.TrustVerificationResult.prototype.getEmbeddedTimestampVerificationResult = function () {
            return l.sendWithPromise('TrustVerificationResult.getEmbeddedTimestampVerificationResult', { self: this.id }).then(function (t) {
              return D(l.EmbeddedTimestampVerificationResult, t);
            });
          }),
          (l.TrustVerificationResult.prototype.getCertPath = function () {
            return l
              .sendWithPromise('TrustVerificationResult.getCertPath', {
                self: this.id,
              })
              .then(function (t) {
                for (var e = [], n = 0; n < t.length; ++n) {
                  var i = t[n];
                  if ('0' === i) return null;
                  (i = new l.X509Certificate(i)), e.push(i), c.push({ name: i.name, id: i.id });
                }
                return e;
              });
          }),
          (l.DisallowedChange.prototype.getObjNum = function () {
            return l.sendWithPromise('DisallowedChange.getObjNum', {
              self: this.id,
            });
          }),
          (l.DisallowedChange.prototype.getType = function () {
            return l.sendWithPromise('DisallowedChange.getType', {
              self: this.id,
            });
          }),
          (l.DisallowedChange.prototype.getTypeAsString = function () {
            return l.sendWithPromise('DisallowedChange.getTypeAsString', {
              self: this.id,
            });
          }),
          (l.X509Extension.prototype.isCritical = function () {
            return l.sendWithPromise('X509Extension.isCritical', {
              self: this.id,
            });
          }),
          (l.X509Extension.prototype.getObjectIdentifier = function () {
            return l
              .sendWithPromise('X509Extension.getObjectIdentifier', {
                self: this.id,
              })
              .then(function (t) {
                return D(l.ObjectIdentifier, t);
              });
          }),
          (l.X509Extension.prototype.toString = function () {
            return l.sendWithPromise('X509Extension.toString', {
              self: this.id,
            });
          }),
          (l.X509Extension.prototype.getData = function () {
            return l.sendWithPromise('X509Extension.getData', { self: this.id }).then(function (t) {
              return new Uint8Array(t);
            });
          }),
          (l.X501AttributeTypeAndValue.prototype.getAttributeTypeOID = function () {
            return l.sendWithPromise('X501AttributeTypeAndValue.getAttributeTypeOID', { self: this.id }).then(function (t) {
              return D(l.ObjectIdentifier, t);
            });
          }),
          (l.X501AttributeTypeAndValue.prototype.getStringValue = function () {
            return l.sendWithPromise('X501AttributeTypeAndValue.getStringValue', { self: this.id });
          });
        (l.ByteRange.prototype.getStartOffset = function () {
          return P('getStartOffset', this.yieldFunction), l.sendWithPromise('ByteRange.getStartOffset', { self: this });
        }),
          (l.ByteRange.prototype.getEndOffset = function () {
            return P('getEndOffset', this.yieldFunction), l.sendWithPromise('ByteRange.getEndOffset', { self: this });
          }),
          (l.ByteRange.prototype.getSize = function () {
            return P('getSize', this.yieldFunction), l.sendWithPromise('ByteRange.getSize', { self: this });
          }),
          (l.TimestampingResult.prototype.getStatus = function () {
            return l.sendWithPromise('TimestampingResult.getStatus', {
              self: this.id,
            });
          }),
          (l.TimestampingResult.prototype.getString = function () {
            return l.sendWithPromise('TimestampingResult.getString', {
              self: this.id,
            });
          }),
          (l.TimestampingResult.prototype.hasResponseVerificationResult = function () {
            return l.sendWithPromise('TimestampingResult.hasResponseVerificationResult', { self: this.id });
          }),
          (l.TimestampingResult.prototype.getResponseVerificationResult = function () {
            return l.sendWithPromise('TimestampingResult.getResponseVerificationResult', { self: this.id }).then(function (t) {
              return D(l.EmbeddedTimestampVerificationResult, t);
            });
          }),
          (l.TimestampingResult.prototype.getData = function () {
            return l.sendWithPromise('TimestampingResult.getData', { self: this.id }).then(function (t) {
              return new Uint8Array(t);
            });
          }),
          (l.ActionParameter.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(PDFNet.Action)', [[t, 'Object', l.Action, 'Action']]),
              l.sendWithPromise('actionParameterCreate', { action: t.id }).then(function (t) {
                return D(l.ActionParameter, t);
              })
            );
          }),
          (l.Action.prototype.parameterCreateWithField = function (t) {
            return (
              f(arguments.length, 1, 'parameterCreateWithField', '(PDFNet.Field)', [[t, 'Structure', l.Field, 'Field']]),
              F('parameterCreateWithField', [[t, 0]]),
              l
                .sendWithPromise('Action.parameterCreateWithField', {
                  action: this.id,
                  field: t,
                })
                .then(function (t) {
                  return D(l.ActionParameter, t);
                })
            );
          }),
          (l.Action.prototype.parameterCreateWithAnnot = function (t) {
            return (
              f(arguments.length, 1, 'parameterCreateWithAnnot', '(PDFNet.Annot)', [[t, 'Object', l.Annot, 'Annot']]),
              l
                .sendWithPromise('Action.parameterCreateWithAnnot', {
                  action: this.id,
                  annot: t.id,
                })
                .then(function (t) {
                  return D(l.ActionParameter, t);
                })
            );
          }),
          (l.Action.prototype.parameterCreateWithPage = function (t) {
            return (
              f(arguments.length, 1, 'parameterCreateWithPage', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l
                .sendWithPromise('Action.parameterCreateWithPage', {
                  action: this.id,
                  page: t.id,
                })
                .then(function (t) {
                  return D(l.ActionParameter, t);
                })
            );
          }),
          (l.ActionParameter.prototype.getAction = function () {
            return l.sendWithPromise('ActionParameter.getAction', { ap: this.id }).then(function (t) {
              return _(l.Action, t);
            });
          }),
          (l.ViewChangeCollection.create = function () {
            return l.sendWithPromise('viewChangeCollectionCreate', {}).then(function (t) {
              return D(l.ViewChangeCollection, t);
            });
          }),
          (l.RadioButtonGroup.createFromField = function (t) {
            return (
              f(arguments.length, 1, 'createFromField', '(PDFNet.Field)', [[t, 'Structure', l.Field, 'Field']]),
              F('createFromField', [[t, 0]]),
              l
                .sendWithPromise('radioButtonGroupCreateFromField', {
                  field: t,
                })
                .then(function (t) {
                  return D(l.RadioButtonGroup, t);
                })
            );
          }),
          (l.RadioButtonGroup.create = function (t, e) {
            return (
              void 0 === e && (e = ''),
              f(arguments.length, 1, 'create', '(PDFNet.PDFDoc, string)', [
                [t, 'PDFDoc'],
                [e, 'string'],
              ]),
              l
                .sendWithPromise('radioButtonGroupCreate', {
                  doc: t.id,
                  field_name: e,
                })
                .then(function (t) {
                  return D(l.RadioButtonGroup, t);
                })
            );
          }),
          (l.RadioButtonGroup.prototype.copy = function () {
            return l.sendWithPromise('RadioButtonGroup.copy', { group: this.id }).then(function (t) {
              return D(l.RadioButtonGroup, t);
            });
          }),
          (l.RadioButtonGroup.prototype.add = function (t, e) {
            return (
              void 0 === e && (e = ''),
              f(arguments.length, 1, 'add', '(PDFNet.Rect, string)', [
                [t, 'Structure', l.Rect, 'Rect'],
                [e, 'const char* = 0'],
              ]),
              F('add', [[t, 0]]),
              l
                .sendWithPromise('RadioButtonGroup.add', {
                  group: this.id,
                  pos: t,
                  onstate: e,
                })
                .then(function (t) {
                  return _(l.RadioButtonWidget, t);
                })
            );
          }),
          (l.RadioButtonGroup.prototype.getNumButtons = function () {
            return l.sendWithPromise('RadioButtonGroup.getNumButtons', {
              group: this.id,
            });
          }),
          (l.RadioButtonGroup.prototype.getButton = function (t) {
            return (
              f(arguments.length, 1, 'getButton', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('RadioButtonGroup.getButton', {
                  group: this.id,
                  index: t,
                })
                .then(function (t) {
                  return _(l.RadioButtonWidget, t);
                })
            );
          }),
          (l.RadioButtonGroup.prototype.getField = function () {
            return l.sendWithPromise('RadioButtonGroup.getField', { group: this.id }).then(function (t) {
              return new l.Field(t);
            });
          }),
          (l.RadioButtonGroup.prototype.addGroupButtonsToPage = function (t) {
            return (
              f(arguments.length, 1, 'addGroupButtonsToPage', '(PDFNet.Page)', [[t, 'Object', l.Page, 'Page']]),
              l.sendWithPromise('RadioButtonGroup.addGroupButtonsToPage', {
                group: this.id,
                page: t.id,
              })
            );
          }),
          (l.PDFTronCustomSecurityHandler.create = function (t) {
            return (
              f(arguments.length, 1, 'create', '(number)', [[t, 'number']]),
              l
                .sendWithPromise('pdfTronCustomSecurityHandlerCreate', {
                  custom_id: t,
                })
                .then(function (t) {
                  return D(l.SecurityHandler, t);
                })
            );
          }),
          (l.WebFontDownloader.isAvailable = function () {
            return l.sendWithPromise('webFontDownloaderIsAvailable', {});
          }),
          (l.WebFontDownloader.enableDownloads = function () {
            return l.sendWithPromise('webFontDownloaderEnableDownloads', {});
          }),
          (l.WebFontDownloader.disableDownloads = function () {
            return l.sendWithPromise('webFontDownloaderDisableDownloads', {});
          }),
          (l.WebFontDownloader.preCacheAsync = function () {
            return l.sendWithPromise('webFontDownloaderPreCacheAsync', {});
          }),
          (l.WebFontDownloader.clearCache = function () {
            return l.sendWithPromise('webFontDownloaderClearCache', {});
          }),
          (l.WebFontDownloader.setCustomWebFontURL = function (t) {
            return (
              f(arguments.length, 1, 'setCustomWebFontURL', '(string)', [[t, 'string']]),
              l.sendWithPromise('webFontDownloaderSetCustomWebFontURL', {
                url: t,
              })
            );
          });
        var g,
          f = function (t, e, i, r, n) {
            var o = n.length;
            if (e === o) {
              if (t !== e) throw new RangeError(t + " arguments passed into function '" + i + "'. Expected " + e + ' argument. Function Signature: ' + i + r);
            } else if (e <= 0) {
              if (o < t)
                throw new RangeError(t + " arguments passed into function '" + i + "'. Expected at most " + o + ' arguments. Function Signature: ' + i + r);
            } else if (t < e || o < t)
              throw new RangeError(t + " arguments passed into function '" + i + "'. Expected " + e + ' to ' + o + ' arguments. Function Signature: ' + i + r);
            function s(t, e, n) {
              throw new TypeError(
                m(t) + " input argument in function '" + i + "' is of type '" + e + "'. Expected type '" + n + "'. Function Signature: " + i + r,
              );
            }
            for (
              t = function (t, e, n) {
                'object' === d(t) && t.name ? s(e, t.name, n) : s(e, d(t), n);
              },
                e = 0;
              e < o;
              e++
            ) {
              var u = n[e],
                a = u[0],
                c = u[1];
              if (a instanceof Promise)
                throw new TypeError(
                  m(e) + " input argument in function '" + i + "' is a Promise object. Promises require a 'yield' statement before being accessed.",
                );
              if ('OptionBase' === c) {
                if (a)
                  if ('object' === d(a)) {
                    if ('function' != typeof a.getJsonString)
                      throw new TypeError(
                        m(e) + " input argument in function '" + i + "' is an 'oject' which is expected to have the 'getJsonString' function",
                      );
                  } else s(e, a.name, 'object');
              } else
                'Array' === c
                  ? Array.isArray(a) || t(a, e, 'Array')
                  : 'ArrayBuffer' === c
                  ? h.isArrayBuffer(a) || h.isArrayBuffer(a.buffer) || t(a, e, 'ArrayBuffer|TypedArray')
                  : 'ArrayAsBuffer' === c
                  ? Array.isArray(a) || h.isArrayBuffer(a) || h.isArrayBuffer(a.buffer) || t(a, e, 'ArrayBuffer|TypedArray')
                  : 'PDFDoc' === c || 'SDFDoc' === c || 'FDFDoc' === c
                  ? a instanceof l.PDFDoc || a instanceof l.SDFDoc || a instanceof l.FDFDoc || t(a, e, 'PDFDoc|SDFDoc|FDFDoc')
                  : 'Structure' === c
                  ? a instanceof u[2] || !a || a.name === u[3] || t(a, e, u[3])
                  : 'OptionObject' === c
                  ? a instanceof u[2] || ('object' === d(a) && a.name ? a.name !== u[4] && s(e, a.name, u[3]) : s(e, d(a), u[3]))
                  : 'Object' === c
                  ? a instanceof u[2] || t(a, e, u[3])
                  : 'const char* = 0' === c
                  ? 'string' != typeof a && null !== a && s(e, d(a), 'string')
                  : d(a) !== c && s(e, d(a), c);
            }
          },
          P = function (t, e) {
            if (void 0 !== e)
              throw Error(
                'Function ' +
                  e +
                  " recently altered a struct object without yielding. That object is now being accessed by function '" +
                  t +
                  "'. Perhaps a yield statement is required for " +
                  e +
                  '?',
              );
          },
          F = function (t, e) {
            for (var n = 0; n < e.length; n++) {
              var i = e[n],
                r = i[0];
              if (r && void 0 !== r.yieldFunction)
                throw Error(
                  "Function '" +
                    r.yieldFunction +
                    "' recently altered a struct object without yielding. That object is now being accessed by the " +
                    m(i[1]) +
                    " input argument in function '" +
                    t +
                    "'. Perhaps a yield statement is required for '" +
                    r.yieldFunction +
                    "'?",
                );
            }
          },
          b = function (t, e) {
            var n = t;
            return (
              e && t.constructor === Array && (n = new Float64Array(t)),
              h.isArrayBuffer(n) || ((n = n.buffer), t.byteLength < n.byteLength && (n = n.slice(t.byteOffset, t.byteOffset + t.byteLength))),
              n
            );
          },
          y = function (n, t) {
            return n.name === t
              ? l.ObjSet.create().then(function (t) {
                  var e = 'function' == typeof n.getJsonString ? n.getJsonString() : JSON.stringify(n);
                  return t.createFromJson(e);
                })
              : Promise.resolve(n);
          },
          D =
            ((c = []),
            (o = []),
            (s = n = 0),
            (u = []),
            (a = []),
            h.PDFTron && PDFTron.WebViewer && PDFTron.WebViewer.prototype && PDFTron.WebViewer.prototype.version && PDFTron.skipPDFNetWebViewerWarning,
            function (t, e, n) {
              return '0' === e ? null : ((t = new t(e, n)), c.push({ name: t.name, id: t.id }), t);
            }),
          _ = function (t, e, n) {
            return '0' === e ? null : new t(e, n);
          },
          S = function (t) {
            for (var e = -1, n = o.length - 1; 0 <= n; n--)
              if (o[n].id == t.id) {
                e = n;
                break;
              }
            if (-1 != e) for (o.splice(e, 1), n = a.length - 1; 0 <= n && e < a[n]; n--) --a[n];
          },
          O = function (t) {
            for (var e = -1, n = c.length - 1; 0 <= n; n--)
              if (c[n].id == t) {
                e = n;
                break;
              }
            if (-1 != e) for (c.splice(e, 1), n = u.length - 1; 0 <= n && e < u[n]; n--) --u[n];
          },
          W =
            ((l.messageHandler = {
              sendWithPromiseReturnId: function () {
                throw Error('PDFNet.initialize must be called and finish resolving before any other PDFNetJS function calls.');
              },
            }),
            (l.userPriority = 2),
            (l.sendWithPromise = function (t, e) {
              var n = this.messageHandler,
                i = n.sendWithPromiseReturnId(t, e, this.userPriority);
              return (
                (n.pdfnetCommandChain =
                  0 == n.pdfnetActiveCommands.size
                    ? i.promise
                    : n.pdfnetCommandChain.then(function () {
                        return i.promise;
                      })),
                n.pdfnetActiveCommands.add(i.callbackId),
                n.pdfnetCommandChain
              );
            }),
            function (t, e) {
              for (var n in t) e[n] = t[n];
            }),
          A =
            ((l.runGeneratorWithoutCleanup = function (t, e) {
              return (
                void 0 === e && (e = ''),
                f(arguments.length, 1, 'runGeneratorWithoutCleanup', '(object, string)', [
                  [t, 'object'],
                  [e, 'string'],
                ]),
                l.runWithoutCleanup(function () {
                  return r(t);
                }, e)
              );
            }),
            (l.runGeneratorWithCleanup = function (t, e) {
              return (
                void 0 === e && (e = ''),
                f(arguments.length, 1, 'runGeneratorWithCleanup', '(object, string)', [
                  [t, 'object'],
                  [e, 'string'],
                ]),
                l.runWithCleanup(function () {
                  return r(t);
                }, e)
              );
            }),
            Promise.resolve()),
          C =
            ((l.displayAllocatedObjects = function () {
              if (0 != c.length) for (var t = 0; t < c.length; t++);
              return c.length;
            }),
            (l.getAllocatedObjectsCount = function () {
              return c.length;
            }),
            (l.startDeallocateStack = function () {
              return (s += 1), u.push(c.length), a.push(o.length), Promise.resolve();
            }),
            (l.endDeallocateStack = function () {
              if (0 === s) return Promise.resolve();
              var t = u.pop(),
                e = a.pop(),
                n = [],
                i = [];
              if (void 0 !== e && 0 !== o.length && o.length !== e)
                for (; o.length > e; ) {
                  var r = o.pop();
                  (r = (r = l.sendWithPromise(r.name + '.' + r.unlocktype, {
                    doc: r.id,
                  })).catch(function (t) {})),
                    n.push(r);
                }
              if (void 0 !== t && 0 !== c.length && c.length !== t)
                for (; c.length > t; )
                  (e = c.pop()),
                    (e = (e = l.sendWithPromise(e.name + '.destroy', {
                      auto_dealloc_obj: e.id,
                    })).catch(function (t) {})),
                    i.push(e);
              return (
                --s,
                Promise.all(n).then(function () {
                  return Promise.all(i);
                })
              );
            }),
            (l.getStackCount = function () {
              return Promise.resolve(s);
            }),
            (l.deallocateAllObjects = function () {
              var t;
              if (0 == c.length) return (t = createPromiseCapability()).resolve(), t.promise;
              for (t = [], u = []; o.length; )
                (objToUnlock = o.pop()),
                  (unlockPromise = (unlockPromise = l.sendWithPromise(objToUnlock.name + '.' + objToUnlock.unlocktype, { doc: objToUnlock.id })).catch(
                    function (t) {},
                  )),
                  t.push(unlockPromise);
              for (; c.length; ) {
                var e = c.pop();
                (e = (e = l.sendWithPromise(e.name + '.destroy', {
                  auto_dealloc_obj: e.id,
                })).catch(function (t) {})),
                  t.push(e);
              }
              return Promise.all(t);
            }),
            (l.Redactor.redact = function (t, e, n, i, r) {
              return (
                void 0 === (n = void 0 === n ? {} : n).redaction_overlay && (n.redaction_overlay = !0),
                void 0 === n.positive_overlay_color
                  ? (n.positive_overlay_color = void 0)
                  : void 0 !== n.positive_overlay_color.id && (n.positive_overlay_color = n.positive_overlay_color.id),
                void 0 === n.negative_overlay_color
                  ? (n.negative_overlay_color = void 0)
                  : void 0 !== n.negative_overlay_color.id && (n.negative_overlay_color = n.negative_overlay_color.id),
                void 0 === n.border && (n.border = !0),
                void 0 === n.use_overlay_text && (n.use_overlay_text = !0),
                void 0 === n.font ? (n.font = void 0) : void 0 !== n.font.id && (n.font = n.font.id),
                void 0 === n.min_font_size && (n.min_font_size = 2),
                void 0 === n.max_font_size && (n.max_font_size = 24),
                void 0 === n.text_color ? (n.text_color = void 0) : void 0 !== n.text_color.id && (n.text_color = n.text_color.id),
                void 0 === n.horiz_text_alignment && (n.horiz_text_alignment = -1),
                void 0 === n.vert_text_alignment && (n.vert_text_alignment = 1),
                void 0 === n.show_redacted_content_regions && (n.show_redacted_content_regions = !1),
                void 0 === n.redacted_content_color
                  ? (n.redacted_content_color = void 0)
                  : void 0 !== n.redacted_content_color.id && (n.redacted_content_color = n.redacted_content_color.id),
                void 0 === i && (i = !0),
                void 0 === r && (r = !0),
                f(arguments.length, 2, 'redact', '(PDFNet.PDFDoc, Array<Core.PDFNet.Redaction>, object, boolean, boolean)', [
                  [t, 'PDFDoc'],
                  [e, 'Array'],
                  [n, 'object'],
                  [i, 'boolean'],
                  [r, 'boolean'],
                ]),
                l.sendWithPromise('redactorRedact', {
                  doc: t.id,
                  red_arr: e,
                  appearance: n,
                  ext_neg_mode: i,
                  page_coord_sys: r,
                })
              );
            }),
            (l.Highlights.prototype.getCurrentQuads = function () {
              return l
                .sendWithPromise('Highlights.getCurrentQuads', {
                  hlts: this.id,
                })
                .then(function (t) {
                  t = new Float64Array(t);
                  for (var e, n = [], i = 0; i < t.length; i += 8)
                    (e = l.QuadPoint(t[i + 0], t[i + 1], t[i + 2], t[i + 3], t[i + 4], t[i + 5], t[i + 6], t[i + 7])), n.push(e);
                  return n;
                });
            }),
            (l.TextSearch.prototype.run = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'run'. Expected 0 arguments. Function Signature: run()");
              return l.sendWithPromise('TextSearch.run', { ts: this.id }).then(function (t) {
                return (t.highlights = new l.Highlights(t.highlights)), '0' != t.highlights.id && c.push({ name: t.highlights.name, id: t.highlights.id }), t;
              });
            }),
            (l.Iterator.prototype.current = function () {
              if (0 != arguments.length) throw new RangeError(arguments.length + " arguments passed into function 'fillEncryptDict'. Expected 0 argument.");
              var e = this,
                t =
                  ((this.yieldFunction = 'Iterator.current'),
                  l.sendWithPromise('Iterator.current', {
                    itr: this.id,
                    type: this.type,
                  }));
              return (
                (e.yieldFunction = void 0),
                (t =
                  'Int' != this.type
                    ? t.then(function (t) {
                        return new l[e.type](t);
                      })
                    : t)
              );
            }),
            (l.PDFDoc.prototype.getFileData = function (t) {
              t({ type: 'id', id: this.id });
            }),
            (l.PDFDoc.prototype.getFile = function (t) {
              return null;
            }),
            (l.PDFDoc.createFromURL = function (t, e) {
              return (
                void 0 === e && (e = {}),
                f(arguments.length, 1, 'createFromURL', '(string, object)', [
                  [t, 'string'],
                  [e, 'object'],
                ]),
                p(t, e).then(function (t) {
                  return l.PDFDoc.createFromBuffer(t);
                })
              );
            }),
            (l.PDFDraw.prototype.exportBuffer = function (t, e, n) {
              return (
                void 0 === e && (e = 'PNG'),
                void 0 === n && (n = new l.Obj('0')),
                f(arguments.length, 1, 'exportBuffer', '(PDFNet.Page, string, PDFNet.Obj)', [
                  [t, 'Object', l.Page, 'Page'],
                  [e, 'string'],
                  [n, 'Object', l.Obj, 'Obj'],
                ]),
                l
                  .sendWithPromise('PDFDraw.exportBuffer', {
                    d: this.id,
                    page: t.id,
                    format: e,
                    encoder_params: n.id,
                  })
                  .then(function (t) {
                    return '0' == t ? null : new Uint8Array(t);
                  })
              );
            }),
            (l.PDFDraw.prototype.exportStream = l.PDFDraw.prototype.exportBuffer),
            (l.Element.prototype.getTextData = function () {
              if (0 != arguments.length)
                throw new RangeError(
                  arguments.length + " arguments passed into function 'getTextData'. Expected 0 arguments. Function Signature: getTextData()",
                );
              return l.sendWithPromise('Element.getTextData', { e: this.id });
            }),
            (l.Element.prototype.getPathData = function () {
              if (0 != arguments.length)
                throw new RangeError(
                  arguments.length + " arguments passed into function 'getPathData'. Expected 0 arguments. Function Signature: getPathData()",
                );
              return l.sendWithPromise('Element.getPathData', { e: this.id }).then(function (t) {
                return (t.operators = new Uint8Array(t.operators)), (t.points = new Float64Array(t.points)), t;
              });
            }),
            (l.PDFDoc.prototype.convertToXod = function (t) {
              return (
                void 0 === t && (t = new l.Obj('0')),
                f(arguments.length, 0, 'convertToXod', '(PDFNet.Obj)', [[t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.XODOutputOptions']]),
                l
                  .sendWithPromise('PDFDoc.convertToXod', {
                    doc: this.id,
                    optionsObject: t,
                  })
                  .then(function (t) {
                    return '0' == t ? null : new Uint8Array(t);
                  })
              );
            }),
            (l.PDFDoc.prototype.convertToXodStream = function (t) {
              return (
                void 0 === t && (t = new l.Obj('0')),
                f(arguments.length, 0, 'convertToXod', '(PDFNet.Obj)', [[t, 'OptionObject', l.Obj, 'Obj', 'PDFNet.Convert.XODOutputOptions']]),
                l
                  .sendWithPromise('PDFDoc.convertToXodStream', {
                    doc: this.id,
                    optionsObject: t,
                  })
                  .then(function (t) {
                    return '0' == t ? null : new l.Filter(t);
                  })
              );
            }),
            (l.FilterReader.prototype.read = function (t) {
              return (
                f(arguments.length, 1, 'read', '(number)', [[t, 'number']]),
                l
                  .sendWithPromise('FilterReader.read', {
                    reader: this.id,
                    buf_size: t,
                  })
                  .then(function (t) {
                    return '0' == t ? null : new Uint8Array(t);
                  })
              );
            }),
            (l.FilterReader.prototype.readAllIntoBuffer = function () {
              if (0 != arguments.length)
                throw new RangeError(
                  arguments.length + " arguments passed into function 'readAllIntoBuffer'. Expected 0 arguments. Function Signature: readAllIntoBuffer()",
                );
              return l
                .sendWithPromise('FilterReader.readAllIntoBuffer', {
                  reader: this.id,
                })
                .then(function (t) {
                  return '0' == t ? null : new Uint8Array(t);
                });
            }),
            (l.bitmapInfo = function (t) {
              W(t, this);
            }),
            (l.PDFDraw.prototype.getBitmap = function (t, e, n) {
              return (
                f(arguments.length, 3, 'getBitmap', '(PDFNet.Page, number, boolean)', [
                  [t, 'Object', l.Page, 'Page'],
                  [e, 'number'],
                  [n, 'boolean'],
                ]),
                l
                  .sendWithPromise('PDFDraw.getBitmap', {
                    d: this.id,
                    page: t.id,
                    pix_fmt: e,
                    demult: n,
                  })
                  .then(function (t) {
                    return '0' == t ? null : new l.bitmapInfo(t);
                  })
              );
            }),
            (l.Matrix2D.create = function (t, e, n, i, r, o) {
              null == t && (t = 0),
                null == e && (e = 0),
                null == n && (n = 0),
                null == i && (i = 0),
                null == r && (r = 0),
                null == o && (o = 0),
                f(arguments.length, 0, 'create', '(number, number, number, number, number, number)', [
                  [t, 'number'],
                  [e, 'number'],
                  [n, 'number'],
                  [i, 'number'],
                  [r, 'number'],
                  [o, 'number'],
                ]);
              var s = createPromiseCapability(),
                u = new l.Matrix2D({
                  m_a: t,
                  m_b: e,
                  m_c: n,
                  m_d: i,
                  m_h: r,
                  m_v: o,
                });
              return s.resolve(u), s.promise;
            }),
            (l.PDFDoc.prototype.getPDFDoc = function () {
              return l.sendWithPromise('GetPDFDoc', { doc: this.id }).then(function (t) {
                return '0' == t ? null : new l.PDFDoc(t);
              });
            }),
            (l.TextExtractorLine.prototype.getBBox = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getBBox'. Expected 0 arguments. Function Signature: getBBox()");
              P('getBBox', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorLine.getBBox'),
                l.sendWithPromise('TextExtractorLine.getBBox', { line: this }).then(function (t) {
                  return (e.yieldFunction = void 0), new l.Rect(t.result.x1, t.result.y1, t.result.x2, t.result.y2, t.result.mp_rect);
                })
              );
            }),
            (l.TextExtractorLine.prototype.getQuad = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getQuad'. Expected 0 arguments. Function Signature: getQuad()");
              P('getQuad', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorLine.getQuad'),
                l.sendWithPromise('TextExtractorLine.getQuad', { line: this }).then(function (t) {
                  return (
                    (e.yieldFunction = void 0),
                    new l.QuadPoint(t.result.p1x, t.result.p1y, t.result.p2x, t.result.p2y, t.result.p3x, t.result.p3y, t.result.p4x, t.result.p4y)
                  );
                })
              );
            }),
            (l.TextExtractorWord.prototype.getBBox = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getBBox'. Expected 0 arguments. Function Signature: getBBox()");
              P('getBBox', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorWord.getBBox'),
                l.sendWithPromise('TextExtractorWord.getBBox', { tew: this }).then(function (t) {
                  return (e.yieldFunction = void 0), new l.Rect(t.result.x1, t.result.y1, t.result.x2, t.result.y2, t.result.mp_rect);
                })
              );
            }),
            (l.TextExtractorWord.prototype.getQuad = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getQuad'. Expected 0 arguments. Function Signature: getQuad()");
              P('getQuad', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorWord.getQuad'),
                l.sendWithPromise('TextExtractorWord.getQuad', { tew: this }).then(function (t) {
                  return (
                    (e.yieldFunction = void 0),
                    new l.QuadPoint(t.result.p1x, t.result.p1y, t.result.p2x, t.result.p2y, t.result.p3x, t.result.p3y, t.result.p4x, t.result.p4y)
                  );
                })
              );
            }),
            (l.TextExtractorWord.prototype.getGlyphQuad = function (t) {
              f(arguments.length, 1, 'getGlyphQuad', '(number)', [[t, 'number']]), P('getGlyphQuad', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorWord.getGlyphQuad'),
                l
                  .sendWithPromise('TextExtractorWord.getGlyphQuad', {
                    tew: this,
                    glyph_idx: t,
                  })
                  .then(function (t) {
                    return (
                      (e.yieldFunction = void 0),
                      new l.QuadPoint(t.result.p1x, t.result.p1y, t.result.p2x, t.result.p2y, t.result.p3x, t.result.p3y, t.result.p4x, t.result.p4y)
                    );
                  })
              );
            }),
            (l.TextExtractorStyle.prototype.getColor = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getColor'. Expected 0 arguments. Function Signature: getColor()");
              P('getColor', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorStyle.getColor'),
                l.sendWithPromise('TextExtractorStyle.getColor', { tes: this }).then(function (t) {
                  return (e.yieldFunction = void 0), '0' == t ? null : new l.ColorPt(t);
                })
              );
            }),
            (l.TextExtractorWord.prototype.getString = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getString'. Expected 0 arguments. Function Signature: getString()");
              P('getString', this.yieldFunction);
              var e = this;
              return (
                (this.yieldFunction = 'TextExtractorWord.getString'),
                l.sendWithPromise('TextExtractorWord.getString', { tew: this }).then(function (t) {
                  return (e.yieldFunction = void 0), t;
                })
              );
            }),
            (l.TextExtractor.prototype.getHighlights = function (t) {
              return (
                f(arguments.length, 1, 'getHighlights', '(Array<object>)', [[t, 'Array']]),
                l
                  .sendWithPromise('TextExtractor.getHighlights', {
                    te: this.id,
                    char_ranges: t,
                  })
                  .then(function (t) {
                    return '0' == t ? null : new l.Highlights(t);
                  })
              );
            }),
            (l.SecurityHandler.prototype.changeUserPasswordNonAscii = function (t) {
              return (
                f(arguments.length, 1, 'changeUserPasswordNonAscii', '(string)', [[t, 'string']]),
                l.sendWithPromise('SecurityHandler.changeUserPasswordNonAscii', { sh: this.id, password: t, pwd_length: t.length })
              );
            }),
            (l.SecurityHandler.prototype.changeMasterPasswordNonAscii = function (t) {
              return (
                f(arguments.length, 1, 'changeMasterPasswordNonAscii', '(string)', [[t, 'string']]),
                l.sendWithPromise('SecurityHandler.changeMasterPasswordNonAscii', { sh: this.id, password: t, pwd_length: t.length })
              );
            }),
            (l.SecurityHandler.prototype.initPassword = function (t) {
              return (
                f(arguments.length, 1, 'initPassword', '(string)', [[t, 'string']]),
                l.sendWithPromise('SecurityHandler.initPassword', {
                  sh: this.id,
                  password: t,
                })
              );
            }),
            (l.SecurityHandler.prototype.initPasswordNonAscii = function (t) {
              return (
                f(arguments.length, 1, 'initPasswordNonAscii', '(string)', [[t, 'string']]),
                l.sendWithPromise('SecurityHandler.initPasswordNonAscii', {
                  sh: this.id,
                  password: t,
                  pwd_length: t.length,
                })
              );
            }),
            (l.Element.prototype.getBBox = function () {
              if (0 != arguments.length)
                throw new RangeError(arguments.length + " arguments passed into function 'getBBox'. Expected 0 arguments. Function Signature: getBBox()");
              var e = this;
              return (
                (this.yieldFunction = 'Element.getBBox'),
                l.sendWithPromise('Element.getBBox', { e: this.id }).then(function (t) {
                  return (e.yieldFunction = void 0), new l.Rect(t);
                })
              );
            }),
            (l.Matrix2D.prototype.mult = function (t, e) {
              return (
                f(arguments.length, 2, 'create', '(number, number)', [
                  [t, 'number'],
                  [e, 'number'],
                ]),
                P('mult', this.yieldFunction),
                l.sendWithPromise('Matrix2D.mult', { matrix: this, x: t, y: e })
              );
            }),
            (l.Obj.prototype.getAsPDFText = function () {
              if (0 != arguments.length)
                throw new RangeError(
                  arguments.length + " arguments passed into function 'getAsPDFText'. Expected 0 arguments. Function Signature: getAsPDFText()",
                );
              return l.sendWithPromise('Obj.getAsPDFText', { o: this.id });
            }),
            (l.PDFDoc.prototype.initSecurityHandler = function (t) {
              if ((void 0 === t && (t = 0), 1 < arguments.length))
                throw new RangeError(
                  arguments.length +
                    " arguments passed into function 'initSecurityHandler'. Expected at most 1 arguments. Function Signature: initSecurityHandler(void*)",
                );
              return l.sendWithPromise('PDFDoc.initSecurityHandler', {
                doc: this.id,
                custom_data: t,
              });
            }),
            (l.PDFDoc.prototype.initStdSecurityHandler = l.PDFDoc.prototype.initStdSecurityHandlerUString),
            (l.SDFDoc.prototype.initSecurityHandler = function (t) {
              if ((void 0 === t && (t = 0), 1 < arguments.length))
                throw new RangeError(
                  arguments.length +
                    " arguments passed into function 'initSecurityHandler'. Expected at most 1 arguments. Function Signature: initSecurityHandler(void*)",
                );
              return l.sendWithPromise('SDFDoc.initSecurityHandler', {
                doc: this.id,
                custom_data: t,
              });
            }),
            (l.SDFDoc.prototype.initStdSecurityHandler = l.SDFDoc.prototype.initStdSecurityHandlerUString),
            (l.Image.createFromURL = function (e, t, n, i) {
              return (
                void 0 === n && (n = new l.Obj('0')),
                void 0 === i && (i = {}),
                f(arguments.length, 2, 'createFromURL', '(PDFNet.PDFDoc, string, PDFNet.Obj, object)', [
                  [e, 'PDFDoc'],
                  [t, 'string'],
                  [n, 'Object', l.Obj, 'Obj'],
                  [i, 'object'],
                ]),
                p(t, i).then(function (t) {
                  return l.Image.createFromMemory2(e, t, n);
                })
              );
            }),
            (l.PDFDoc.prototype.addStdSignatureHandlerFromURL = function (t, e) {
              f(arguments.length, 2, 'addStdSignatureHandlerFromURL', '(string, string)', [
                [t, 'string'],
                [e, 'string'],
              ]);
              var n = this;
              return p(t).then(function (t) {
                return n.addStdSignatureHandlerFromBufferWithDoc(t, e, n);
              });
            }),
            (l.PDFDoc.prototype.addStdSignatureHandlerFromBufferWithDoc = function (t, e, n) {
              return (
                f(arguments.length, 3, 'addStdSignatureHandlerFromBufferWithDoc', '(ArrayBuffer|TypedArray, string, PDFNet.PDFDoc)', [
                  [t, 'ArrayBuffer'],
                  [e, 'string'],
                  [n, 'PDFDoc'],
                ]),
                l.sendWithPromise('PDFDoc.addStdSignatureHandlerFromBuffer', {
                  doc: n.id,
                  pkcs12_buffer: t.buffer,
                  pkcs12_pass: e,
                })
              );
            }),
            (l.Filter.createFromMemory = function (t) {
              f(arguments.length, 1, 'createFromMemory', '(ArrayBuffer|TypedArray)', [[t, 'ArrayBuffer']]);
              var e = b(t, !1);
              return l.sendWithPromise('filterCreateFromMemory', { buf: e }).then(function (t) {
                return '0' == t ? null : ((t = new l.Filter(t)), c.push({ name: t.name, id: t.id }), t);
              });
            }),
            (l.Filter.createURLFilter = function (t, e) {
              return (
                void 0 === e && (e = {}),
                f(arguments.length, 1, 'createURLFilter', '(string, object)', [
                  [t, 'string'],
                  [e, 'object'],
                ]),
                p(t, e).then(function (t) {
                  return l.Filter.createFromMemory(t);
                })
              );
            }),
            (l.Filter.createFlateEncode = function (t, e, n) {
              return (
                void 0 === t && (t = new l.Filter('0')),
                void 0 === e && (e = -1),
                void 0 === n && (n = 256),
                f(arguments.length, 0, 'createFlateEncode', '(PDFNet.Filter, number, number)', [
                  [t, 'Object', l.Filter, 'Filter'],
                  [e, 'number'],
                  [n, 'number'],
                ]),
                l
                  .sendWithPromise('Filter.createFlateEncode', {
                    input_filter: t.id,
                    compression_level: e,
                    buf_sz: n,
                  })
                  .then(function (t) {
                    return '0' == t ? null : ((t = new l.Filter(t)), c.push({ name: t.name, id: t.id }), t);
                  })
              );
            }),
            (l.PDFDoc.prototype.importPages = function (t, e) {
              return (
                void 0 === e && (e = !1),
                f(arguments.length, 1, 'importPages', '(Array<Core.PDFNet.Page>, boolean)', [
                  [t, 'Array'],
                  [e, 'boolean'],
                ]),
                (t = t.map(function (t) {
                  return t.id;
                })),
                l
                  .sendWithPromise('PDFDoc.importPages', {
                    doc: this.id,
                    page_arr: t,
                    import_bookmarks: e,
                  })
                  .then(function (t) {
                    return t
                      ? t.map(function (t) {
                          return new l.Page(t);
                        })
                      : null;
                  })
              );
            }),
            (l.SDFDoc.prototype.applyCustomQuery = function (t) {
              return (
                f(arguments.length, 1, 'applyCustomQuery', '(object)', [[t, 'object']]),
                l
                  .sendWithPromise('SDFDoc.applyCustomQuery', {
                    doc: this.id,
                    query: JSON.stringify(t),
                  })
                  .then(function (t) {
                    return JSON.parse(t);
                  })
              );
            }),
            l.PDFDoc.prototype.saveMemoryBuffer),
          j = l.PDFDoc.prototype.saveStream;
        (l.PDFDoc.prototype.saveMemoryBuffer = function (t) {
          var e = this;
          return Promise.resolve(e.documentCompletePromise).then(function () {
            return C.call(e, t);
          });
        }),
          (l.PDFDoc.prototype.saveStream = function (t) {
            var e = this;
            return Promise.resolve(e.documentCompletePromise).then(function () {
              return j.call(e, t);
            });
          }),
          (l.PDFACompliance.createFromUrl = function (e, t, n, i, r, o, s) {
            return (
              void 0 === n && (n = ''),
              void 0 === i && (i = l.PDFACompliance.Conformance.e_Level1B),
              void 0 === r && (r = new Int32Array(0)),
              void 0 === o && (o = 10),
              void 0 === s && (s = !1),
              f(arguments.length, 2, 'createFromUrl', '(boolean, string, string, number, ArrayBuffer|TypedArray, number, boolean)', [
                [e, 'boolean'],
                [t, 'string'],
                [n, 'string'],
                [i, 'number'],
                [r, 'ArrayBuffer'],
                [o, 'number'],
                [s, 'boolean'],
              ]),
              p(t).then(function (t) {
                return l.PDFACompliance.createFromBuffer(e, t, n, i, r, o, s);
              })
            );
          }),
          (l.PDFACompliance.createFromBuffer = function (t, e, n, i, r, o, s) {
            void 0 === n && (n = ''),
              void 0 === i && (i = l.PDFACompliance.Conformance.e_Level1B),
              void 0 === r && (r = new Int32Array(0)),
              void 0 === o && (o = 10),
              void 0 === s && (s = !1),
              f(arguments.length, 2, 'createFromBuffer', '(boolean, ArrayBuffer|TypedArray, string, number, ArrayBuffer|TypedArray, number, boolean)', [
                [t, 'boolean'],
                [e, 'ArrayBuffer'],
                [n, 'string'],
                [i, 'number'],
                [r, 'ArrayBuffer'],
                [o, 'number'],
                [s, 'boolean'],
              ]);
            var u = b(e, !1),
              a = b(r, !1);
            return l
              .sendWithPromise('pdfaComplianceCreateFromBuffer', {
                convert: t,
                buf: u,
                password: n,
                conform: i,
                excep: a,
                max_ref_objs: o,
                first_stop: s,
              })
              .then(function (t) {
                return (t = new l.PDFACompliance(t)), c.push({ name: t.name, id: t.id }), t;
              });
          }),
          (l.PDFDoc.prototype.lock = function () {
            if (0 != arguments.length)
              throw new RangeError(arguments.length + " arguments passed into function 'lock'. Expected 0 arguments. Function Signature: lock()");
            return o.push({ name: 'PDFDoc', id: this.id, unlocktype: 'unlock' }), l.sendWithPromise('PDFDoc.lock', { doc: this.id });
          }),
          (l.PDFDoc.prototype.lockRead = function () {
            if (0 != arguments.length)
              throw new RangeError(arguments.length + " arguments passed into function 'lockRead'. Expected 0 arguments. Function Signature: lockRead()");
            return o.push({ name: 'PDFDoc', id: this.id, unlocktype: 'unlockRead' }), l.sendWithPromise('PDFDoc.lockRead', { doc: this.id });
          }),
          (l.PDFDoc.prototype.tryLock = function () {
            if (0 != arguments.length)
              throw new RangeError(arguments.length + " arguments passed into function 'tryLock'. Expected 0 arguments. Function Signature: tryLock()");
            var e = o.length;
            return (
              o.push({ name: 'PDFDoc', id: this.id, unlocktype: 'unlock' }),
              l.sendWithPromise('PDFDoc.tryLock', { doc: this.id }).then(function (t) {
                t || o.splice(e, 1);
              })
            );
          }),
          (l.PDFDoc.prototype.timedLock = function (t) {
            f(arguments.length, 1, 'timedLock', '(number)', [[t, 'number']]);
            var e = o.length;
            return (
              o.push({ name: 'PDFDoc', id: this.id, unlocktype: 'unlock' }),
              l
                .sendWithPromise('PDFDoc.timedLock', {
                  doc: this.id,
                  milliseconds: t,
                })
                .then(function (t) {
                  t || o.splice(e, 1);
                })
            );
          }),
          (l.PDFDoc.prototype.tryLockRead = function () {
            if (0 != arguments.length)
              throw new RangeError(arguments.length + " arguments passed into function 'tryLockRead'. Expected 0 arguments. Function Signature: tryLockRead()");
            var e = o.length;
            return (
              o.push({ name: 'PDFDoc', id: this.id, unlocktype: 'unlockRead' }),
              l.sendWithPromise('PDFDoc.tryLockRead', { doc: this.id }).then(function (t) {
                t || o.splice(e, 1);
              })
            );
          }),
          (l.PDFDoc.prototype.timedLockRead = function (t) {
            f(arguments.length, 1, 'timedLockRead', '(number)', [[t, 'number']]);
            var e = o.length;
            return (
              o.push({ name: 'PDFDoc', id: this.id, unlocktype: 'unlockRead' }),
              l
                .sendWithPromise('PDFDoc.timedLockRead', {
                  doc: this.id,
                  milliseconds: t,
                })
                .then(function (t) {
                  t || o.splice(e, 1);
                })
            );
          }),
          (l.hasFullApi = !0),
          (l.Optimizer.optimize = function (t, e) {
            return (
              void 0 === e && (e = new l.Optimizer.OptimizerSettings()),
              f(arguments.length, 1, 'optimize', '(PDFNet.PDFDoc, object)', [
                [t, 'PDFDoc'],
                [e, 'object'],
              ]),
              l.sendWithPromise('optimizerOptimize', {
                doc: t.id,
                color_image_settings: e.color_image_settings,
                grayscale_image_settings: e.grayscale_image_settings,
                mono_image_settings: e.mono_image_settings,
                text_settings: e.text_settings,
                remove_custom: e.remove_custom,
              })
            );
          }),
          (l.VerificationOptions.prototype.addTrustedCertificateFromURL = function (t, e, n) {
            void 0 === e && (e = {}),
              void 0 === n && (n = l.VerificationOptions.CertificateTrustFlag.e_default_trust),
              f(arguments.length, 1, 'addTrustedCertificateFromURL', '(string, object, number)', [
                [t, 'string'],
                [e, 'object'],
                [n, 'number'],
              ]);
            var i = this;
            return p(t, e).then(function (t) {
              return i.addTrustedCertificate(t, n);
            });
          }),
          (l.DigitalSignatureField.prototype.certifyOnNextSaveFromURL = function (t, e, n) {
            void 0 === n && (n = {}),
              f(arguments.length, 2, 'certifyOnNextSaveFromURL', '(string, string, object)', [
                [t, 'string'],
                [e, 'string'],
                [n, 'object'],
              ]);
            var i = this;
            return p(t, n).then(function (t) {
              return i.certifyOnNextSaveFromBuffer(t, e);
            });
          }),
          (l.DigitalSignatureField.prototype.signOnNextSaveFromURL = function (t, e, n) {
            void 0 === n && (n = {}),
              f(arguments.length, 2, 'signOnNextSaveFromURL', '(string, string, object)', [
                [t, 'string'],
                [e, 'string'],
                [n, 'object'],
              ]);
            var i = this;
            return p(t, n).then(function (t) {
              return i.signOnNextSaveFromBuffer(t, e);
            });
          }),
          (l.PDFRasterizer.prototype.rasterize = function (t, e, n, i, r, o, s, u, a) {
            return (
              void 0 === u && (u = null),
              void 0 === a && (a = null),
              f(arguments.length, 7, 'rasterize', '(PDFNet.Page, number, number, number, number, boolean, PDFNet.Matrix2D, PDFNet.Rect, PDFNet.Rect)', [
                [t, 'Object', l.Page, 'Page'],
                [e, 'number'],
                [n, 'number'],
                [i, 'number'],
                [r, 'number'],
                [o, 'boolean'],
                [s, 'Structure', l.Matrix2D, 'Matrix2D'],
                [u, 'Structure', l.Rect, 'Rect'],
                [a, 'Structure', l.Rect, 'Rect'],
              ]),
              F('rasterize', [
                [s, 6],
                [u, 7],
                [a, 8],
              ]),
              l.sendWithPromise('PDFRasterizer.rasterize', {
                r: this.id,
                page: t.id,
                width: e,
                height: n,
                stride: i,
                num_comps: r,
                demult: o,
                device_mtx: s,
                clip: u,
                scrl_clp_regions: a,
              })
            );
          }),
          (l.ElementBuilder.prototype.createUnicodeTextRun = function (t) {
            return (
              f(arguments.length, 1, 'createUnicodeTextRun', '(string)', [[t, 'string']]),
              l
                .sendWithPromise('ElementBuilder.createUnicodeTextRun', {
                  b: this.id,
                  text_data: t,
                })
                .then(function (t) {
                  return _(l.Element, t);
                })
            );
          }),
          (l.DigitalSignatureField.prototype.getCertPathsFromCMS = function () {
            return (
              P('getCertPathsFromCMS', this.yieldFunction),
              l
                .sendWithPromise('DigitalSignatureField.getCertPathsFromCMS', {
                  self: this,
                })
                .then(function (t) {
                  for (var e = [], n = 0; n < t.length; ++n) {
                    for (var i = t[n], r = [], o = 0; o < i.length; ++o) {
                      var s = i[o];
                      if ('0' === s) return null;
                      (s = new l.X509Certificate(s)), r.push(s), c.push({ name: s.name, id: s.id });
                    }
                    e.push(r);
                  }
                  return e;
                })
            );
          }),
          (l.Convert.office2PDF = function (t, e) {
            return l.Convert.office2PDFBuffer(t, e).then(function (t) {
              l.PDFDoc.createFromBuffer(t).then(function (t) {
                return t.initSecurityHandler(), t;
              });
            });
          }),
          (l.PDFDoc.prototype.requirePage = function (t) {
            if ((f(arguments.length, 1, 'requirePage', '(number)', [[t, 'number']]), t <= 0))
              throw Error(
                "1st input argument '" + t + "' in function 'requirePage' is invalid. Expected number between 1 and number of pages in the document.",
              );
            return l.sendWithPromise('PDFDoc.RequirePage', {
              docId: this.id,
              pageNum: t,
            });
          }),
          (l.beginOperation = function (t) {
            if ((void 0 === t ? (t = { allowMultipleInstances: !1 }) : t.allowMultipleInstances, 0 < n && !t.allowMultipleInstances))
              throw Error(
                "a previous instance of PDFNet.beginOperation() has been called without being terminated by PDFNet.finishOperation(). If this is intentional, pass in an options object with its parameter 'allowMultipleInstances' set to 'true' (ex. optObj={}; optObj.allowMultipleInstances=true; PDFNet.beginOperation(optObj));",
              );
            if (((n += 1), 1 < arguments.length))
              throw new RangeError(
                arguments.length +
                  " arguments passed into function 'beginOperation'. Expected 0 to 1 arguments. Function Signature: beginOperation(optObj = {})",
              );
            return l.sendWithPromise('BeginOperation', {});
          }),
          (l.finishOperation = function () {
            if (0 < n) {
              if ((--n, 0 != arguments.length))
                throw new RangeError(
                  arguments.length + " arguments passed into function 'finishOperation'. Expected 0 arguments. Function Signature: finishOperation()",
                );
              return l.sendWithPromise('FinishOperation', {});
            }
          }),
          (l.runWithCleanup = function (t, e) {
            void 0 === e && (e = ''),
              f(arguments.length, 1, 'runWithCleanup', '(function, string)', [
                [t, 'function'],
                [e, 'string'],
              ]);
            var n,
              i = !1,
              r = !1;
            return (A = A.then(
              function () {},
              function () {},
            )
              .then(function () {
                return l.initialize(e);
              })
              .then(function () {
                return (i = !0), l.beginOperation();
              })
              .then(function () {
                return (r = !0), l.startDeallocateStack(), t();
              })
              .then(function (t) {
                return (n = t), (r = !1), l.endDeallocateStack();
              })
              .then(function () {
                if (((i = !1), l.finishOperation(), 0 < s))
                  throw Error(
                    'Detected not yet deallocated stack. You may have called "PDFNet.startDeallocateStack()" somewhere without calling "PDFNet.endDeallocateStack()" afterwards.',
                  );
                return n;
              })
              .catch(function (t) {
                throw (r && l.endDeallocateStack(), i && l.finishOperation(), t);
              }));
          }),
          (l.runWithoutCleanup = function (t, e) {
            void 0 === e && (e = ''),
              f(arguments.length, 1, 'runWithCleanup', '(function, string)', [
                [t, 'function'],
                [e, 'string'],
              ]);
            var n = !1;
            return (A = A.then(
              function () {},
              function () {},
            )
              .then(function () {
                return l.initialize(e);
              })
              .then(function () {
                return (n = !0), l.beginOperation();
              })
              .then(function () {
                return t();
              })
              .then(function (t) {
                return (n = !1), l.finishOperation(), t;
              })
              .catch(function (t) {
                throw (n && l.finishOperation(), t);
              }));
          }),
          (l.initialize = function (e, t) {
            var n, i;
            return (
              void 0 === e && (e = ''),
              void 0 === t && (t = ''),
              f(arguments.length, 0, 'initialize', '(string, string)', [
                [e, 'string'],
                [t, 'string'],
              ]),
              g ||
                ((n = { emsWorkerError: function (t, e) {} }),
                (g = createPromiseCapability()),
                (i = function (t) {
                  h.Core.preloadPDFWorker(t, n),
                    h.Core.initPDFWorkerTransports(t, n, e).then(
                      function (t) {
                        (l.messageHandler = t.messageHandler), g.resolve();
                      },
                      function (t) {
                        g.reject(t);
                      },
                    );
                }),
                t && 'auto' !== t
                  ? i(t)
                  : h.Core.getDefaultBackendType().then(i, function (t) {
                      g.reject(t);
                    })),
              g.promise
            );
          }),
          (h.Core.PDFNet = l);
      },
    ]),
    (i = {}),
    (r.m = n),
    (r.c = i),
    (r.d = function (t, e, n) {
      r.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: n });
    }),
    (r.r = function (t) {
      'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    }),
    (r.t = function (e, t) {
      if ((1 & t && (e = r(e)), 8 & t || (4 & t && 'object' == typeof e && e && e.__esModule))) return e;
      var n = Object.create(null);
      if ((r.r(n), Object.defineProperty(n, 'default', { enumerable: !0, value: e }), 2 & t && 'string' != typeof e))
        for (var i in e)
          r.d(
            n,
            i,
            function (t) {
              return e[t];
            }.bind(null, i),
          );
      return n;
    }),
    (r.n = function (t) {
      var e =
        t && t.__esModule
          ? function () {
              return t.default;
            }
          : function () {
              return t;
            };
      return r.d(e, 'a', e), e;
    }),
    (r.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }),
    (r.p = '/core/pdf/'),
    r((r.s = 0));
}.call(this || window);
