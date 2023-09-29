/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [0],
    {
      457: function (ia, ca, e) {
        e.r(ca);
        e.d(ca, 'ByteRangeRequest', function () {
          return ka;
        });
        var ea = e(0),
          fa = e(1);
        e.n(fa);
        var da = e(2),
          ba = e(159);
        ia = e(100);
        var aa = e(263),
          y = e(80),
          x = e(76),
          w = e(262),
          n = e(178);
        e = e(395);
        var h = [],
          f = [],
          r = window,
          z = (function () {
            return function () {
              this.dn = 1;
            };
          })(),
          ha;
        (function (e) {
          e[(e.UNSENT = 0)] = 'UNSENT';
          e[(e.DONE = 4)] = 'DONE';
        })(ha || (ha = {}));
        var ka = (function () {
            function e(e, f, h, n) {
              var x = this;
              this.url = e;
              this.range = f;
              this.yf = h;
              this.withCredentials = n;
              this.l5 = ha;
              this.request = new XMLHttpRequest();
              this.request.open('GET', this.url, !0);
              r.Uint8Array && (this.request.responseType = 'arraybuffer');
              n && (this.request.withCredentials = n);
              ja.DISABLE_RANGE_HEADER ||
                (Object(fa.isUndefined)(f.stop)
                  ? this.request.setRequestHeader('Range', 'bytes=' + f.start)
                  : this.request.setRequestHeader('Range', ['bytes=', f.start, '-', f.stop - 1].join('')));
              h &&
                Object.keys(h).forEach(function (e) {
                  x.request.setRequestHeader(e, h[e]);
                });
              this.request.overrideMimeType
                ? this.request.overrideMimeType('text/plain; charset=x-user-defined')
                : this.request.setRequestHeader('Accept-Charset', 'x-user-defined');
              this.status = w.a.NOT_STARTED;
            }
            e.prototype.start = function (e) {
              var f = this,
                h = this.request;
              h.onreadystatechange = function () {
                if (f.aborted) return (f.status = w.a.ABORTED), e({ code: w.a.ABORTED });
                if (this.readyState === f.l5.DONE) {
                  f.AD();
                  var n = 0 === window.document.URL.indexOf('file:///');
                  200 === h.status || 206 === h.status || (n && 0 === h.status)
                    ? ((n = r.pW(this)), f.iv(n, e))
                    : ((f.status = w.a.ERROR), e({ code: f.status, status: f.status }));
                }
              };
              this.request.send(null);
              this.status = w.a.STARTED;
            };
            e.prototype.iv = function (e, f) {
              this.status = w.a.SUCCESS;
              if (f) return f(!1, e);
            };
            e.prototype.abort = function () {
              this.AD();
              this.aborted = !0;
              this.request.abort();
            };
            e.prototype.AD = function () {
              var r = Object(n.c)(this.url, this.range, f);
              -1 !== r && f.splice(r, 1);
              if (0 < h.length) {
                r = h.shift();
                var w = new e(r.url, r.range, this.yf, this.withCredentials);
                r.request = w;
                f.push(r);
                w.start(Object(n.d)(r));
              }
            };
            e.prototype.extend = function (e) {
              var f = Object.assign({}, this, e.prototype);
              f.constructor = e;
              return f;
            };
            return e;
          })(),
          ja = (function (e) {
            function r(f, h, n, r, w) {
              n = e.call(this, f, n, r) || this;
              n.Gj = {};
              n.aC = h;
              n.url = f;
              n.DISABLE_RANGE_HEADER = !1;
              n.Uy = ka;
              n.CP = 3;
              n.yf = w || {};
              return n;
            }
            Object(ea.c)(r, e);
            r.prototype.Qw = function (e, f, h) {
              var n = -1 === e.indexOf('?') ? '?' : '&';
              switch (h) {
                case !1:
                case x.a.NEVER_CACHE:
                  e = e + n + '_=' + Object(fa.uniqueId)();
                  break;
                case !0:
                case x.a.CACHE:
                  e = e + n + '_=' + f.start + ',' + (Object(fa.isUndefined)(f.stop) ? '' : f.stop);
              }
              return e;
            };
            r.prototype.aU = function (e, f, h, n) {
              void 0 === h && (h = {});
              return new this.Uy(e, f, h, n);
            };
            r.prototype.Hca = function (e, n, r, w, x) {
              for (var y = 0; y < h.length; y++)
                if (Object(fa.isEqual)(h[y].range, n) && Object(fa.isEqual)(h[y].url, e)) return h[y].ph.push(w), h[y].HE++, null;
              for (y = 0; y < f.length; y++) if (Object(fa.isEqual)(f[y].range, n) && Object(fa.isEqual)(f[y].url, e)) return f[y].ph.push(w), f[y].HE++, null;
              r = { url: e, range: n, aC: r, ph: [w], HE: 1 };
              if (0 === h.length && f.length < this.CP) return f.push(r), (r.request = this.aU(e, n, x, this.withCredentials)), r;
              h.push(r);
              return null;
            };
            r.prototype.So = function (e, r, w) {
              var x = this.Qw(e, r, this.aC);
              (e = this.Hca(x, r, this.aC, w, this.yf)) && e.request.start(Object(n.d)(e));
              return function () {
                var e = Object(n.c)(x, r, f);
                if (-1 !== e) {
                  var w = --f[e].HE;
                  0 === w && f[e].request && f[e].request.abort();
                } else (e = Object(n.c)(x, r, h)), -1 !== e && ((w = --h[e].HE), 0 === w && h.splice(e, 1));
              };
            };
            r.prototype.SV = function () {
              return { start: -ba.a };
            };
            r.prototype.vga = function () {
              var e = -(ba.a + ba.e);
              return { start: e - ba.d, end: e };
            };
            r.prototype.mu = function (e) {
              var f = this;
              this.gC = !0;
              var h = ba.a;
              this.So(this.url, this.SV(), function (n, r, w) {
                function x() {
                  var h = f.Jd.OV();
                  f.So(f.url, h, function (n, r) {
                    if (n) return Object(da.j)('Error loading central directory: ' + n), e(n);
                    r = Object(y.a)(r);
                    if (r.length !== h.stop - h.start)
                      return e('Invalid XOD file: Zip central directory data is wrong size! Should be ' + (h.stop - h.start) + ' but is ' + r.length);
                    f.Jd.OZ(r);
                    f.VI = !0;
                    f.gC = !1;
                    return e(!1);
                  });
                }
                if (n) return Object(da.j)('Error loading end header: ' + n), e(n, r, w);
                r = Object(y.a)(r);
                if (r.length !== h) return e('Invalid XOD file: Zip end header data is wrong size!');
                try {
                  f.Jd = new aa.a(r);
                } catch (ua) {
                  return e(ua);
                }
                f.Jd.jia
                  ? f.So(f.url, f.vga(), function (h, n) {
                      if (h) return Object(da.j)('Error loading zip64 header: ' + h), e(h);
                      n = Object(y.a)(n);
                      f.Jd.Cia(n);
                      x();
                    })
                  : x();
              });
            };
            r.prototype.mW = function (e) {
              e(Object.keys(this.Jd.qo));
            };
            r.prototype.dN = function (e, f) {
              var h = this;
              if (this.Jd.OT(e)) {
                var n = this.Jd.wx(e);
                if (n in this.Gj) {
                  var r = this.Eh[e];
                  r.Rs = this.Gj[n];
                  r.Rs.dn++;
                  r.cancel = r.Rs.cancel;
                } else {
                  var w = this.Jd.Eea(e),
                    x = this.So(this.url, w, function (r, x) {
                      r
                        ? (Object(da.j)('Error loading part "' + e + '": ' + r),
                          h.So(h.url, w, function (r, x) {
                            if (r) return f(r, e);
                            h.SZ(x, w, n, e, f);
                          }))
                        : h.SZ(x, w, n, e, f);
                    }),
                    y = this.Eh[e];
                  y &&
                    ((y.h1 = !0),
                    (y.cancel = function () {
                      y.Rs.dn--;
                      0 === y.Rs.dn && (x(), delete h.Gj[n]);
                    }),
                    (this.Gj[n] = new z(n)),
                    (y.Rs = this.Gj[n]),
                    (y.Rs.cancel = y.cancel));
                }
              } else delete this.Eh[e], f(Error('File not found: "' + e + '"'), e);
            };
            r.prototype.SZ = function (e, f, h, n, r) {
              if (e.length !== f.stop - f.start) r(Error('Part data is wrong size!'), n);
              else {
                do {
                  if (!this.Gj[h]) return;
                  n = this.Gj[h].dn;
                  for (var w = f.tr.length, x = 0; x < w; ++x) {
                    var y = f.tr[x];
                    r(!1, y.pr, e['string' === typeof e ? 'substring' : 'subarray'](y.start, y.stop), this.Jd.rX(y.pr));
                    y.pr in this.Eh && delete this.Eh[y.pr];
                  }
                } while (n !== this.Gj[h].dn);
                delete this.Gj[h];
              }
            };
            r.DISABLE_RANGE_HEADER = !1;
            r.CP = 3;
            return r;
          })(ia.a);
        (function (e) {
          function f(f, h, n) {
            var r = e.call(this) || this,
              w;
            for (w in f) r[w] = f[w];
            r.Lua = f;
            r.startOffset = h;
            r.endOffset = n;
            r.aU = function (e, h, n, w) {
              Object(fa.isUndefined)(h.stop) ? ((h.start += r.endOffset), (h.stop = r.endOffset)) : ((h.start += r.startOffset), (h.stop += r.startOffset));
              e = r.Qw(r.url, h, r.aC);
              return new f.Uy(e, h, n, w);
            };
            return r;
          }
          Object(ea.c)(f, e);
          return f;
        })(ja);
        Object(e.a)(ja);
        Object(e.b)(ja);
        ca['default'] = ja;
      },
    },
  ]);
}).call(this || window);
