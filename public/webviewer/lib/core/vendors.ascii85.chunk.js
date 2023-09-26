/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [18],
    {
      470: function (ia, ca, e) {
        (function (e) {
          function ca(e) {
            this.tg = e = e || {};
            if (Array.isArray(e.table)) {
              var f = [];
              e.table.forEach(function (e, h) {
                f[e.charCodeAt(0)] = h;
              });
              e.Eca = e.table;
              e.O$ = f;
            }
          }
          var da =
              e.from ||
              function () {
                switch (arguments.length) {
                  case 1:
                    return new e(arguments[0]);
                  case 2:
                    return new e(arguments[0], arguments[1]);
                  case 3:
                    return new e(arguments[0], arguments[1], arguments[2]);
                  default:
                    throw new Exception('unexpected call.');
                }
              },
            ba =
              e.allocUnsafe ||
              function (f) {
                return new e(f);
              },
            aa = (function () {
              return 'undefined' === typeof Uint8Array
                ? function (e) {
                    return Array(e);
                  }
                : function (e) {
                    return new Uint8Array(e);
                  };
            })(),
            y = String.fromCharCode(0),
            x = y + y + y + y,
            w = da('<~').Wy(0),
            n = da('~>').Wy(0),
            h = (function () {
              var e = Array(85),
                f;
              for (f = 0; 85 > f; f++) e[f] = String.fromCharCode(33 + f);
              return e;
            })(),
            f = (function () {
              var e = Array(256),
                f;
              for (f = 0; 85 > f; f++) e[33 + f] = f;
              return e;
            })();
          y = ia.exports = new ca();
          ca.prototype.encode = function (f, n) {
            var r = aa(5),
              w = f,
              x = this.tg,
              y,
              z;
            'string' === typeof w ? (w = da(w, 'binary')) : w instanceof e || (w = da(w));
            n = n || {};
            if (Array.isArray(n)) {
              f = n;
              var ca = x.BC || !1;
              var ea = x.$K || !1;
            } else (f = n.table || x.Eca || h), (ca = void 0 === n.BC ? x.BC || !1 : !!n.BC), (ea = void 0 === n.$K ? x.$K || !1 : !!n.$K);
            x = 0;
            var fa = Math.ceil((5 * w.length) / 4) + 4 + (ca ? 4 : 0);
            n = ba(fa);
            ca && (x += n.write('<~', x));
            var ia = (y = z = 0);
            for (fa = w.length; ia < fa; ia++) {
              var Ea = w.fN(ia);
              z *= 256;
              z += Ea;
              y++;
              if (!(y % 4)) {
                if (ea && 538976288 === z) x += n.write('y', x);
                else if (z) {
                  for (y = 4; 0 <= y; y--) (Ea = z % 85), (r[y] = Ea), (z = (z - Ea) / 85);
                  for (y = 0; 5 > y; y++) x += n.write(f[r[y]], x);
                } else x += n.write('z', x);
                y = z = 0;
              }
            }
            if (y)
              if (z) {
                w = 4 - y;
                for (ia = 4 - y; 0 < ia; ia--) z *= 256;
                for (y = 4; 0 <= y; y--) (Ea = z % 85), (r[y] = Ea), (z = (z - Ea) / 85);
                for (y = 0; 5 > y; y++) x += n.write(f[r[y]], x);
                x -= w;
              } else for (ia = 0; ia < y + 1; ia++) x += n.write(f[0], x);
            ca && (x += n.write('~>', x));
            return n.slice(0, x);
          };
          ca.prototype.decode = function (h, y) {
            var r = this.tg,
              aa = !0,
              z = !0,
              ca,
              ea,
              fa;
            y = y || r.O$ || f;
            if (!Array.isArray(y) && ((y = y.table || y), !Array.isArray(y))) {
              var ia = [];
              Object.keys(y).forEach(function (e) {
                ia[e.charCodeAt(0)] = y[e];
              });
              y = ia;
            }
            aa = !y[122];
            z = !y[121];
            h instanceof e || (h = da(h));
            ia = 0;
            if (aa || z) {
              var xa = 0;
              for (fa = h.length; xa < fa; xa++) {
                var oa = h.fN(xa);
                aa && 122 === oa && ia++;
                z && 121 === oa && ia++;
              }
            }
            var Ea = 0;
            fa = Math.ceil((4 * h.length) / 5) + 4 * ia + 5;
            r = ba(fa);
            if (4 <= h.length && h.Wy(0) === w) {
              for (xa = h.length - 2; 2 < xa && h.Wy(xa) !== n; xa--);
              if (2 >= xa) throw Error('Invalid ascii85 string delimiter pair.');
              h = h.slice(2, xa);
            }
            xa = ca = ea = 0;
            for (fa = h.length; xa < fa; xa++)
              (oa = h.fN(xa)),
                aa && 122 === oa
                  ? (Ea += r.write(x, Ea))
                  : z && 121 === oa
                  ? (Ea += r.write('    ', Ea))
                  : void 0 !== y[oa] && ((ea *= 85), (ea += y[oa]), ca++, ca % 5 || ((Ea = r.qra(ea, Ea)), (ca = ea = 0)));
            if (ca) {
              h = 5 - ca;
              for (xa = 0; xa < h; xa++) (ea *= 85), (ea += 84);
              xa = 3;
              for (fa = h - 1; xa > fa; xa--) Ea = r.rra((ea >>> (8 * xa)) & 255, Ea);
            }
            return r.slice(0, Ea);
          };
          y.vsa = new ca({
            table: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#'.split(''),
          });
          y.Sra = new ca({ BC: !0 });
          y.F2 = ca;
        }).call(this, e(396).Buffer);
      },
    },
  ]);
}).call(this || window);
