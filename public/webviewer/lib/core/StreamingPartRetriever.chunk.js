/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [12],
    {
      466: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0),
          fa = e(1);
        e.n(fa);
        var da = e(2),
          ba = e(159);
        ia = e(48);
        var aa = e(100),
          y = e(263),
          x = e(76),
          w = e(262);
        e = e(395);
        var n = window,
          h = (function () {
            function e(e, f, h) {
              var n = -1 === e.indexOf('?') ? '?' : '&';
              switch (f) {
                case x.a.NEVER_CACHE:
                  this.url = e + n + '_=' + Object(fa.uniqueId)();
                  break;
                default:
                  this.url = e;
              }
              this.yf = h;
              this.request = new XMLHttpRequest();
              this.request.open('GET', this.url, !0);
              this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              this.request.overrideMimeType
                ? this.request.overrideMimeType('text/plain; charset=x-user-defined')
                : this.request.setRequestHeader('Accept-Charset', 'x-user-defined');
              this.status = w.a.NOT_STARTED;
            }
            e.prototype.start = function (f, h) {
              var n = this,
                r = this,
                x = this.request,
                y;
              r.jy = 0;
              f &&
                Object.keys(f).forEach(function (e) {
                  n.request.setRequestHeader(e, f[e]);
                });
              h && (this.request.withCredentials = h);
              this.jF = setInterval(function () {
                var f = 0 === window.document.URL.indexOf('file:///');
                f = 200 === x.status || (f && 0 === x.status);
                if (x.readyState !== w.b.DONE || f) {
                  try {
                    x.responseText;
                  } catch (xa) {
                    return;
                  }
                  r.jy < x.responseText.length && (y = r.Wka()) && r.trigger(e.Events.DATA, [y]);
                  0 === x.readyState && (clearInterval(r.jF), r.trigger(e.Events.DONE));
                } else clearInterval(r.jF), r.trigger(e.Events.DONE, ['Error received return status ' + x.status]);
              }, 1e3);
              this.request.send(null);
              this.status = w.a.STARTED;
            };
            e.prototype.Wka = function () {
              var f = this.request,
                h = f.responseText;
              if (0 !== h.length)
                if (this.jy === h.length) clearInterval(this.jF), this.trigger(e.Events.DONE);
                else return (h = Math.min(this.jy + 3e6, h.length)), (f = n.pW(f, this.jy, !0, h)), (this.jy = h), f;
            };
            e.prototype.abort = function () {
              clearInterval(this.jF);
              var f = this;
              this.request.onreadystatechange = function () {
                Object(da.j)('StreamingRequest aborted');
                f.status = w.a.ABORTED;
                return f.trigger(e.Events.ABORTED);
              };
              this.request.abort();
            };
            e.prototype.finish = function () {
              var f = this;
              this.request.onreadystatechange = function () {
                f.status = w.a.SUCCESS;
                return f.trigger(e.Events.DONE);
              };
              this.request.abort();
            };
            e.Events = { DONE: 'done', DATA: 'data', ABORTED: 'aborted' };
            return e;
          })();
        Object(ia.a)(h);
        var f;
        (function (e) {
          e[(e.LOCAL_HEADER = 0)] = 'LOCAL_HEADER';
          e[(e.FILE = 1)] = 'FILE';
          e[(e.CENTRAL_DIR = 2)] = 'CENTRAL_DIR';
        })(f || (f = {}));
        var r = (function (e) {
          function h() {
            var h = e.call(this) || this;
            h.buffer = '';
            h.state = f.LOCAL_HEADER;
            h.BO = 4;
            h.Qm = null;
            h.qu = ba.c;
            h.qo = {};
            return h;
          }
          Object(ea.c)(h, e);
          h.prototype.Pka = function (e) {
            var n;
            for (e = this.buffer + e; e.length >= this.qu; )
              switch (this.state) {
                case f.LOCAL_HEADER:
                  this.Qm = n = this.$ka(e.slice(0, this.qu));
                  if (n.av !== ba.g) throw Error('Wrong signature in local header: ' + n.av);
                  e = e.slice(this.qu);
                  this.state = f.FILE;
                  this.qu = n.II + n.gr + n.hx + this.BO;
                  this.trigger(h.Events.HEADER, [n]);
                  break;
                case f.FILE:
                  this.Qm.name = e.slice(0, this.Qm.gr);
                  this.qo[this.Qm.name] = this.Qm;
                  n = this.qu - this.BO;
                  var r = e.slice(this.Qm.gr + this.Qm.hx, n);
                  this.trigger(h.Events.FILE, [this.Qm.name, r, this.Qm.aJ]);
                  e = e.slice(n);
                  if (e.slice(0, this.BO) === ba.h) (this.state = f.LOCAL_HEADER), (this.qu = ba.c);
                  else return (this.state = f.CENTRAL_DIR), !0;
              }
            this.buffer = e;
            return !1;
          };
          h.Events = { HEADER: 'header', FILE: 'file' };
          return h;
        })(y.a);
        Object(ia.a)(r);
        ia = (function (e) {
          function f(f, n, w, x, y) {
            w = e.call(this, f, w, x) || this;
            w.url = f;
            w.stream = new h(f, n);
            w.Jd = new r();
            w.xZ = window.createPromiseCapability();
            w.YZ = {};
            w.yf = y;
            return w;
          }
          Object(ea.c)(f, e);
          f.prototype.az = function (e) {
            var f = this;
            this.request([this.Sj, this.vl, this.Rj]);
            this.stream.addEventListener(h.Events.DATA, function (h) {
              try {
                if (f.Jd.Pka(h)) return f.stream.finish();
              } catch (ra) {
                throw (f.stream.abort(), f.zq(ra), e(ra), ra);
              }
            });
            this.stream.addEventListener(h.Events.DONE, function (h) {
              f.rka = !0;
              f.xZ.resolve();
              h && (f.zq(h), e(h));
            });
            this.Jd.addEventListener(r.Events.HEADER, Object(fa.bind)(this.XZ, this));
            this.Jd.addEventListener(r.Events.FILE, Object(fa.bind)(this.pla, this));
            return this.stream.start(this.yf, this.withCredentials);
          };
          f.prototype.mW = function (e) {
            var f = this;
            this.xZ.promise.then(function () {
              e(Object.keys(f.Jd.qo));
            });
          };
          f.prototype.$o = function () {
            return !0;
          };
          f.prototype.request = function (e) {
            var f = this;
            this.rka &&
              e.forEach(function (e) {
                f.YZ[e] || f.yqa(e);
              });
          };
          f.prototype.XZ = function () {};
          f.prototype.abort = function () {
            this.stream && this.stream.abort();
          };
          f.prototype.yqa = function (e) {
            this.trigger(aa.a.Events.PART_READY, [{ lb: e, error: 'Requested part not found', $i: !1, yg: !1 }]);
          };
          f.prototype.pla = function (e, f, h) {
            this.YZ[e] = !0;
            this.trigger(aa.a.Events.PART_READY, [{ lb: e, data: f, $i: !1, yg: !1, error: null, nd: h }]);
          };
          return f;
        })(aa.a);
        Object(e.a)(ia);
        Object(e.b)(ia);
        ca['default'] = ia;
      },
    },
  ]);
}).call(this || window);
