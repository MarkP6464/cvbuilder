/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [7],
    {
      465: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0),
          fa = e(262);
        ia = e(457);
        var da = e(23);
        e = e(395);
        var ba = {},
          aa = (function (e) {
            function x(w, n) {
              var h = e.call(this, w, n) || this;
              h.url = w;
              h.range = n;
              h.status = fa.a.NOT_STARTED;
              return h;
            }
            Object(ea.c)(x, e);
            x.prototype.start = function (e) {
              var n = this;
              ba[this.range.start] = {
                iv: function (f) {
                  var h = atob(f),
                    w,
                    x = h.length;
                  f = new Uint8Array(x);
                  for (w = 0; w < x; ++w) f[w] = h.charCodeAt(w);
                  h = f.length;
                  w = '';
                  var y = 0;
                  if (Object(da.r)()) for (; y < h; ) (x = f.subarray(y, y + 1024)), (y += 1024), (w += String.fromCharCode.apply(null, x));
                  else
                    for (x = Array(1024); y < h; ) {
                      for (var aa = 0, ba = Math.min(y + 1024, h); y < ba; aa++, y++) x[aa] = f[y];
                      w += String.fromCharCode.apply(null, 1024 > aa ? x.slice(0, aa) : x);
                    }
                  n.iv(w, e);
                },
                ZU: function () {
                  n.status = fa.a.ERROR;
                  e({ code: n.status });
                },
              };
              var h = document.createElement('IFRAME');
              h.setAttribute('src', this.url);
              document.documentElement.appendChild(h);
              h.parentNode.removeChild(h);
              h = null;
              this.status = fa.a.STARTED;
              n.AD();
            };
            return x;
          })(ia.ByteRangeRequest);
        ia = (function (e) {
          function x(w, n, h, f) {
            w = e.call(this, w, n, h, f) || this;
            w.Uy = aa;
            return w;
          }
          Object(ea.c)(x, e);
          x.prototype.Qw = function (e, n) {
            return e + '#' + n.start + '&' + (n.stop ? n.stop : '');
          };
          x.Qua = function (e, n) {
            var h = ba[n];
            delete ba[n];
            h.iv(e);
          };
          x.Pua = function (e, n) {
            e = ba[n];
            delete ba[n];
            e.ZU();
          };
          return x;
        })(ia['default']);
        Object(e.a)(ia);
        Object(e.b)(ia);
        ca['default'] = ia;
      },
    },
  ]);
}).call(this || window);
