/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [1],
    {
      461: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0),
          fa = e(262);
        ia = e(457);
        e = e(395);
        var da = window,
          ba = (function (e) {
            function y(x, w) {
              var n = e.call(this, x, w) || this;
              n.url = x;
              n.range = w;
              n.request = new XMLHttpRequest();
              n.request.open('GET', n.url, !0);
              da.Uint8Array && (n.request.responseType = 'arraybuffer');
              n.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              n.status = fa.a.NOT_STARTED;
              return n;
            }
            Object(ea.c)(y, e);
            return y;
          })(ia.ByteRangeRequest);
        ia = (function (e) {
          function y(x, w, n, h) {
            x = e.call(this, x, w, n, h) || this;
            x.Uy = ba;
            return x;
          }
          Object(ea.c)(y, e);
          y.prototype.Qw = function (e, w) {
            return e + '/bytes=' + w.start + ',' + (w.stop ? w.stop : '');
          };
          return y;
        })(ia['default']);
        Object(e.a)(ia);
        Object(e.b)(ia);
        ca['default'] = ia;
      },
    },
  ]);
}).call(this || window);
