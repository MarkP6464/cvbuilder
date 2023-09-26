/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [5],
    {
      472: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0),
          fa = e(494),
          da = e(495),
          ba;
        (function (e) {
          e[(e.EXTERNAL_XFDF_NOT_REQUESTED = 0)] = 'EXTERNAL_XFDF_NOT_REQUESTED';
          e[(e.EXTERNAL_XFDF_NOT_AVAILABLE = 1)] = 'EXTERNAL_XFDF_NOT_AVAILABLE';
          e[(e.EXTERNAL_XFDF_AVAILABLE = 2)] = 'EXTERNAL_XFDF_AVAILABLE';
        })(ba || (ba = {}));
        ia = (function () {
          function e(e) {
            this.aa = e;
            this.state = ba.EXTERNAL_XFDF_NOT_REQUESTED;
          }
          e.prototype.oga = function () {
            var e = this;
            return function (x, w, n) {
              return Object(ea.b)(e, void 0, void 0, function () {
                var e,
                  f,
                  r,
                  y,
                  aa,
                  ca,
                  da,
                  fa = this,
                  ia;
                return Object(ea.d)(this, function (h) {
                  switch (h.label) {
                    case 0:
                      if (this.state !== ba.EXTERNAL_XFDF_NOT_REQUESTED) return [3, 2];
                      e = this.aa.getDocument().yt();
                      return [4, this.xea(e)];
                    case 1:
                      (f = h.ca()),
                        (r = this.p$(f)),
                        (this.OJ = null !== (ia = null === r || void 0 === r ? void 0 : r.parse()) && void 0 !== ia ? ia : null),
                        (this.state = null === this.OJ ? ba.EXTERNAL_XFDF_NOT_AVAILABLE : ba.EXTERNAL_XFDF_AVAILABLE),
                        (h.label = 2);
                    case 2:
                      if (this.state === ba.EXTERNAL_XFDF_NOT_AVAILABLE) return n(x), [2];
                      y = new DOMParser();
                      aa = y.parseFromString(x, 'text/xml');
                      w.forEach(function (e) {
                        fa.merge(aa, fa.OJ, e - 1);
                      });
                      ca = new XMLSerializer();
                      da = ca.serializeToString(aa);
                      n(da);
                      return [2];
                  }
                });
              });
            };
          };
          e.prototype.VN = function (e) {
            this.xea = e;
          };
          e.prototype.Fe = function () {
            this.OJ = void 0;
            this.state = ba.EXTERNAL_XFDF_NOT_REQUESTED;
          };
          e.prototype.p$ = function (e) {
            return e
              ? Array.isArray(e)
                ? new fa.a(e)
                : 'string' !== typeof e
                ? null
                : new DOMParser().parseFromString(e, 'text/xml').querySelector('xfdf > add')
                ? new fa.a(e)
                : new da.a(e)
              : null;
          };
          e.prototype.merge = function (e, x, w) {
            var n = this;
            0 === w && (this.Pia(e, x.$p), this.Ria(e, x.wJ));
            var h = x.da[w];
            h && (this.Sia(e, h.ao), this.Uia(e, h.f2, x.ix), this.Tia(e, h.page, w), this.Qia(e, h.qU));
            h = this.aa.Yb();
            if (w === h - 1) {
              var f = x.ix;
              Object.keys(f).forEach(function (h) {
                f[h].gL || n.uY(e, h, f[h]);
              });
            }
          };
          e.prototype.Pia = function (e, x) {
            null !== x && ((e = this.uw(e)), this.sr(e, 'calculation-order', x));
          };
          e.prototype.Ria = function (e, x) {
            null !== x && ((e = this.uw(e)), this.sr(e, 'document-actions', x));
          };
          e.prototype.Sia = function (e, x) {
            var w = this,
              n = this.tw(e.querySelector('xfdf'), 'annots');
            Object.keys(x).forEach(function (e) {
              w.sr(n, '[name="' + e + '"]', x[e]);
            });
          };
          e.prototype.Uia = function (e, x, w) {
            var n = this;
            if (0 !== x.length) {
              var h = this.uw(e);
              x.forEach(function (f) {
                var r = f.getAttribute('field'),
                  x = w[r];
                x && (n.uY(e, r, x), n.sr(h, 'null', f));
              });
            }
          };
          e.prototype.uY = function (e, x, w) {
            var n = this.uw(e),
              h = n.querySelector('ffield[name="' + x + '"]');
            null !== w.XC && null === h && this.sr(n, 'ffield[name="' + x + '"]', w.XC);
            e = this.tw(e.querySelector('xfdf'), 'fields');
            x = x.split('.');
            this.aN(e, x, 0, w.value);
            w.gL = !0;
          };
          e.prototype.Tia = function (e, x, w) {
            null !== x && ((e = this.uw(e)), (e = this.tw(e, 'pages')), this.sr(e, '[number="' + (w + 1) + '"]', x));
          };
          e.prototype.Qia = function (e, x) {
            Object.keys(x).forEach(function (w) {
              (w = e.querySelector('annots [name="' + w + '"]')) && w.parentElement.removeChild(w);
            });
          };
          e.prototype.aN = function (e, x, w, n) {
            if (w === x.length) (x = document.createElementNS('', 'value')), (x.textContent = n), this.sr(e, 'value', x);
            else {
              var h = x[w];
              this.tw(e, '[name="' + h + '"]', 'field').setAttribute('name', h);
              e = e.querySelectorAll('[name="' + h + '"]');
              1 === e.length ? this.aN(e[0], x, w + 1, n) : ((h = this.hda(e)), this.aN(w === x.length - 1 ? h : this.pqa(e, h), x, w + 1, n));
            }
          };
          e.prototype.hda = function (e) {
            for (var x = null, w = 0; w < e.length; w++) {
              var n = e[w];
              if (0 === n.childElementCount || (1 === n.childElementCount && 'value' === n.children[0].tagName)) {
                x = n;
                break;
              }
            }
            return x;
          };
          e.prototype.pqa = function (e, x) {
            for (var w = 0; w < e.length; w++) if (e[w] !== x) return e[w];
            return null;
          };
          e.prototype.sr = function (e, x, w) {
            x = e.querySelector(x);
            null !== x && e.removeChild(x);
            e.appendChild(w);
          };
          e.prototype.uw = function (e) {
            var x = e.querySelector('pdf-info');
            if (null !== x) return x;
            x = this.tw(e.querySelector('xfdf'), 'pdf-info');
            x.setAttribute('xmlns', 'http://www.pdftron.com/pdfinfo');
            x.setAttribute('version', '2');
            x.setAttribute('import-version', '4');
            return x;
          };
          e.prototype.tw = function (e, x, w) {
            var n = e.querySelector(x);
            if (null !== n) return n;
            n = document.createElementNS('', w || x);
            e.appendChild(n);
            return n;
          };
          return e;
        })();
        ca['default'] = ia;
      },
      483: function (ia, ca) {
        ia = (function () {
          function e() {}
          e.prototype.BB = function (e) {
            var ea = { $p: null, wJ: null, ix: {}, da: {} };
            e = new DOMParser().parseFromString(e, 'text/xml');
            ea.$p = e.querySelector('pdf-info calculation-order');
            ea.wJ = e.querySelector('pdf-info document-actions');
            ea.ix = this.Nja(e);
            ea.da = this.$ja(e);
            return ea;
          };
          e.prototype.Nja = function (e) {
            var ea = e.querySelector('fields');
            e = e.querySelectorAll('pdf-info > ffield');
            if (null === ea && null === e) return {};
            var ca = {};
            this.A7(ca, ea);
            this.y7(ca, e);
            return ca;
          };
          e.prototype.A7 = function (e, ca) {
            if (null !== ca && ca.children) {
              for (var ea = [], ba = 0; ba < ca.children.length; ba++) {
                var aa = ca.children[ba];
                ea.push({ name: aa.getAttribute('name'), element: aa });
              }
              for (; 0 !== ea.length; )
                for (ca = ea.shift(), ba = 0; ba < ca.element.children.length; ba++)
                  (aa = ca.element.children[ba]),
                    'value' === aa.tagName
                      ? (e[ca.name] = {
                          value: aa.textContent,
                          XC: null,
                          gL: !1,
                        })
                      : aa.children &&
                        ea.push({
                          name: ca.name + '.' + aa.getAttribute('name'),
                          element: aa,
                        });
            }
          };
          e.prototype.y7 = function (e, ca) {
            ca.forEach(function (ea) {
              var ba = ea.getAttribute('name');
              e[ba] ? (e[ba].XC = ea) : (e[ba] = { value: null, XC: ea, gL: !1 });
            });
          };
          e.prototype.$ja = function (e) {
            var ea = this,
              ca = {};
            e.querySelectorAll('pdf-info widget').forEach(function (e) {
              var aa = parseInt(e.getAttribute('page'), 10) - 1;
              ea.aE(ca, aa);
              ca[aa].f2.push(e);
            });
            e.querySelectorAll('pdf-info page').forEach(function (e) {
              var aa = parseInt(e.getAttribute('number'), 10) - 1;
              ea.aE(ca, aa);
              ca[aa].page = e;
            });
            this.bW(e).forEach(function (e) {
              var aa = parseInt(e.getAttribute('page'), 10),
                y = e.getAttribute('name');
              ea.aE(ca, aa);
              ca[aa].ao[y] = e;
            });
            this.NV(e).forEach(function (e) {
              var aa = parseInt(e.getAttribute('page'), 10);
              e = e.textContent;
              ea.aE(ca, aa);
              ca[aa].qU[e] = !0;
            });
            return ca;
          };
          e.prototype.aE = function (e, ca) {
            e[ca] || (e[ca] = { ao: {}, qU: {}, f2: [], page: null });
          };
          return e;
        })();
        ca.a = ia;
      },
      494: function (ia, ca, e) {
        var ea = e(0),
          fa = e(1);
        e.n(fa);
        ia = (function (e) {
          function ba(aa) {
            var y = e.call(this) || this;
            y.Sca = Array.isArray(aa) ? aa : [aa];
            return y;
          }
          Object(ea.c)(ba, e);
          ba.prototype.parse = function () {
            var e = this,
              y = { $p: null, wJ: null, ix: {}, da: {} };
            this.Sca.forEach(function (x) {
              y = Object(fa.merge)(y, e.BB(x));
            });
            return y;
          };
          ba.prototype.bW = function (e) {
            var y = [];
            e.querySelectorAll('add > *').forEach(function (e) {
              y.push(e);
            });
            e.querySelectorAll('modify > *').forEach(function (e) {
              y.push(e);
            });
            return y;
          };
          ba.prototype.NV = function (e) {
            return e.querySelectorAll('delete > *');
          };
          return ba;
        })(e(483).a);
        ca.a = ia;
      },
      495: function (ia, ca, e) {
        var ea = e(0);
        ia = (function (e) {
          function ca(ba) {
            var aa = e.call(this) || this;
            aa.Tca = ba;
            return aa;
          }
          Object(ea.c)(ca, e);
          ca.prototype.parse = function () {
            return this.BB(this.Tca);
          };
          ca.prototype.bW = function (e) {
            return e.querySelectorAll('annots > *');
          };
          ca.prototype.NV = function () {
            return [];
          };
          return ca;
        })(e(483).a);
        ca.a = ia;
      },
    },
  ]);
}).call(this || window);
