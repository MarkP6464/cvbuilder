/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [3],
    {
      463: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0),
          fa = e(159);
        ia = e(457);
        e = e(395);
        ia = (function (e) {
          function ba(aa, y, x, w) {
            return e.call(this, aa, y, x, w) || this;
          }
          Object(ea.c)(ba, e);
          ba.prototype.SV = function () {
            return { start: this.$U - fa.a, stop: this.$U };
          };
          ba.prototype.mu = function (aa) {
            var y = this;
            this.So(this.url, { start: 0, stop: 1 }, function (x, w, n) {
              if (x) return aa(x);
              x = n.request.getResponseHeader('Content-Range');
              y.$U = x.split('/')[1];
              e.prototype.mu.call(y, aa);
            });
          };
          return ba;
        })(ia['default']);
        Object(e.a)(ia);
        Object(e.b)(ia);
        ca['default'] = ia;
      },
    },
  ]);
}).call(this || window);
