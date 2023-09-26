/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [6],
    {
      464: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0);
        ia = e(48);
        var fa = e(178),
          da = e(395),
          ba = e(223),
          aa = window;
        e = (function () {
          function e(e, w) {
            this.CX = function (e) {
              e = e.split('.');
              return e[e.length - 1].match(/(jpg|jpeg|png|gif)$/i);
            };
            w = w || {};
            this.url = e;
            this.filename = w.filename || e;
            this.yf = w.customHeaders;
            this.Yqa = !!w.useDownloader;
            this.withCredentials = !!w.withCredentials;
          }
          e.prototype.JF = function (e) {
            this.yf = e;
          };
          e.prototype.getCustomHeaders = function () {
            return this.yf;
          };
          e.prototype.getFileData = function (x) {
            var w = this,
              n = this,
              h = new XMLHttpRequest(),
              f = 0 === this.url.indexOf('blob:') ? 'blob' : 'arraybuffer';
            h.open('GET', this.url, !0);
            h.withCredentials = this.withCredentials;
            h.responseType = f;
            this.yf &&
              Object.keys(this.yf).forEach(function (e) {
                h.setRequestHeader(e, w.yf[e]);
              });
            var r = /^https?:/i.test(this.url);
            h.addEventListener(
              'load',
              function (f) {
                return Object(ea.b)(this, void 0, void 0, function () {
                  var h, w, y, z, aa, ca;
                  return Object(ea.d)(this, function (ea) {
                    switch (ea.label) {
                      case 0:
                        if (200 !== this.status && (r || 0 !== this.status)) return [3, 10];
                        n.trigger(e.Events.DOCUMENT_LOADING_PROGRESS, [f.loaded, f.loaded]);
                        if ('blob' !== this.responseType) return [3, 4];
                        h = this.response;
                        return n.CX(n.filename) ? [4, Object(ba.b)(h)] : [3, 2];
                      case 1:
                        return (w = ea.ca()), (n.fileSize = w.byteLength), x(new Uint8Array(w)), [3, 3];
                      case 2:
                        (y = new FileReader()),
                          (y.onload = function (e) {
                            e = new Uint8Array(e.target.result);
                            n.fileSize = e.length;
                            x(e);
                          }),
                          y.readAsArrayBuffer(h),
                          (ea.label = 3);
                      case 3:
                        return [3, 9];
                      case 4:
                        ea.og.push([4, 8, , 9]);
                        z = new Uint8Array(this.response);
                        if (!n.CX(n.filename)) return [3, 6];
                        h = new Blob([z.buffer]);
                        return [4, Object(ba.b)(h)];
                      case 5:
                        return (w = ea.ca()), (n.fileSize = w.byteLength), x(new Uint8Array(w)), [3, 7];
                      case 6:
                        (n.fileSize = z.length), x(z), (ea.label = 7);
                      case 7:
                        return [3, 9];
                      case 8:
                        return ea.ca(), n.trigger(e.Events.ERROR, ['pdfLoad', 'Out of memory']), [3, 9];
                      case 9:
                        return [3, 11];
                      case 10:
                        (aa = f.currentTarget),
                          (ca = Object(fa.b)(aa)),
                          n.trigger(e.Events.ERROR, ['pdfLoad', this.status + ' ' + aa.statusText, ca]),
                          (ea.label = 11);
                      case 11:
                        return (n.$z = null), [2];
                    }
                  });
                });
              },
              !1,
            );
            h.onprogress = function (f) {
              n.trigger(e.Events.DOCUMENT_LOADING_PROGRESS, [f.loaded, 0 < f.total ? f.total : 0]);
            };
            h.addEventListener(
              'error',
              function () {
                n.trigger(e.Events.ERROR, ['pdfLoad', 'Network failure']);
                n.$z = null;
              },
              !1,
            );
            h.send();
            this.$z = h;
          };
          e.prototype.getFile = function () {
            var e = this;
            return new Promise(function (w) {
              aa.utils.isJSWorker && w(e.url);
              if (e.Yqa) {
                var n = Object(ea.a)({ url: e.url }, e.yf ? { customHeaders: e.yf } : {});
                w(n);
              }
              w(null);
            });
          };
          e.prototype.abort = function () {
            this.$z && (this.$z.abort(), (this.$z = null));
          };
          e.Events = {
            DOCUMENT_LOADING_PROGRESS: 'documentLoadingProgress',
            ERROR: 'error',
          };
          return e;
        })();
        Object(ia.a)(e);
        Object(da.a)(e);
        Object(da.b)(e);
        ca['default'] = e;
      },
    },
  ]);
}).call(this || window);
