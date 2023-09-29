/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [20],
    {
      473: function (ia) {
        (function () {
          ia.exports = {
            CZ: function () {
              function ca(e, f) {
                this.scrollLeft = e;
                this.scrollTop = f;
              }
              function e(e) {
                if (null === e || 'object' !== typeof e || void 0 === e.behavior || 'auto' === e.behavior || 'instant' === e.behavior) return !0;
                if ('object' === typeof e && 'smooth' === e.behavior) return !1;
                throw new TypeError('behavior member of ScrollOptions ' + e.behavior + ' is not a valid value for enumeration ScrollBehavior.');
              }
              function ea(e, h) {
                if ('Y' === h) return e.clientHeight + f < e.scrollHeight;
                if ('X' === h) return e.clientWidth + f < e.scrollWidth;
              }
              function fa(e, f) {
                e = y.getComputedStyle(e, null)['overflow' + f];
                return 'auto' === e || 'scroll' === e;
              }
              function da(e) {
                var f = ea(e, 'Y') && fa(e, 'Y');
                e = ea(e, 'X') && fa(e, 'X');
                return f || e;
              }
              function ba(e) {
                var f = (h() - e.startTime) / 468;
                var n = 0.5 * (1 - Math.cos(Math.PI * (1 < f ? 1 : f)));
                f = e.zz + (e.x - e.zz) * n;
                n = e.Az + (e.y - e.Az) * n;
                e.method.call(e.EF, f, n);
                (f === e.x && n === e.y) || y.requestAnimationFrame(ba.bind(y, e));
              }
              function aa(e, f, w) {
                var r = h();
                if (e === x.body) {
                  var z = y;
                  var aa = y.scrollX || y.pageXOffset;
                  e = y.scrollY || y.pageYOffset;
                  var ea = n.scroll;
                } else (z = e), (aa = e.scrollLeft), (e = e.scrollTop), (ea = ca);
                ba({
                  EF: z,
                  method: ea,
                  startTime: r,
                  zz: aa,
                  Az: e,
                  x: f,
                  y: w,
                });
              }
              var y = window,
                x = document;
              if (!('scrollBehavior' in x.documentElement.style && !0 !== y.ysa)) {
                var w = y.HTMLElement || y.Element,
                  n = {
                    scroll: y.scroll || y.scrollTo,
                    scrollBy: y.scrollBy,
                    PU: w.prototype.scroll || ca,
                    scrollIntoView: w.prototype.scrollIntoView,
                  },
                  h = y.performance && y.performance.now ? y.performance.now.bind(y.performance) : Date.now,
                  f = /MSIE |Trident\/|Edge\//.test(y.navigator.userAgent) ? 1 : 0;
                y.scroll = y.scrollTo = function (f, h) {
                  void 0 !== f &&
                    (!0 === e(f)
                      ? n.scroll.call(
                          y,
                          void 0 !== f.left ? f.left : 'object' !== typeof f ? f : y.scrollX || y.pageXOffset,
                          void 0 !== f.top ? f.top : void 0 !== h ? h : y.scrollY || y.pageYOffset,
                        )
                      : aa.call(y, x.body, void 0 !== f.left ? ~~f.left : y.scrollX || y.pageXOffset, void 0 !== f.top ? ~~f.top : y.scrollY || y.pageYOffset));
                };
                y.scrollBy = function (f, h) {
                  void 0 !== f &&
                    (e(f)
                      ? n.scrollBy.call(y, void 0 !== f.left ? f.left : 'object' !== typeof f ? f : 0, void 0 !== f.top ? f.top : void 0 !== h ? h : 0)
                      : aa.call(y, x.body, ~~f.left + (y.scrollX || y.pageXOffset), ~~f.top + (y.scrollY || y.pageYOffset)));
                };
                w.prototype.scroll = w.prototype.scrollTo = function (f, h) {
                  if (void 0 !== f)
                    if (!0 === e(f)) {
                      if ('number' === typeof f && void 0 === h) throw new SyntaxError('Value could not be converted');
                      n.PU.call(
                        this,
                        void 0 !== f.left ? ~~f.left : 'object' !== typeof f ? ~~f : this.scrollLeft,
                        void 0 !== f.top ? ~~f.top : void 0 !== h ? ~~h : this.scrollTop,
                      );
                    } else
                      (h = f.left),
                        (f = f.top),
                        aa.call(this, this, 'undefined' === typeof h ? this.scrollLeft : ~~h, 'undefined' === typeof f ? this.scrollTop : ~~f);
                };
                w.prototype.scrollBy = function (f, h) {
                  void 0 !== f &&
                    (!0 === e(f)
                      ? n.PU.call(
                          this,
                          void 0 !== f.left ? ~~f.left + this.scrollLeft : ~~f + this.scrollLeft,
                          void 0 !== f.top ? ~~f.top + this.scrollTop : ~~h + this.scrollTop,
                        )
                      : this.scroll({
                          left: ~~f.left + this.scrollLeft,
                          top: ~~f.top + this.scrollTop,
                          behavior: f.behavior,
                        }));
                };
                w.prototype.scrollIntoView = function (f) {
                  if (!0 === e(f)) n.scrollIntoView.call(this, void 0 === f ? !0 : f);
                  else {
                    for (f = this; f !== x.body && !1 === da(f); ) f = f.parentNode || f.host;
                    var h = f.getBoundingClientRect(),
                      r = this.getBoundingClientRect();
                    f !== x.body
                      ? (aa.call(this, f, f.scrollLeft + r.left - h.left, f.scrollTop + r.top - h.top),
                        'fixed' !== y.getComputedStyle(f).position &&
                          y.scrollBy({
                            left: h.left,
                            top: h.top,
                            behavior: 'smooth',
                          }))
                      : y.scrollBy({
                          left: r.left,
                          top: r.top,
                          behavior: 'smooth',
                        });
                  }
                };
              }
            },
          };
        })();
      },
    },
  ]);
}).call(this || window);
