/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [9],
    {
      460: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0);
        ia = e(48);
        var fa = e(395),
          da = e(223),
          ba = e(20),
          aa = window;
        e = (function () {
          function e(e) {
            var w = this;
            this.Fha = function (e) {
              return e && ('image' === e.type.split('/')[0].toLowerCase() || (e.name && !!e.name.match(/.(jpg|jpeg|png|gif)$/i)));
            };
            this.file = e;
            this.Tha = new Promise(function (n) {
              return Object(ea.b)(w, void 0, void 0, function () {
                var h;
                return Object(ea.d)(this, function (f) {
                  switch (f.label) {
                    case 0:
                      return this.Fha(this.file) ? [4, Object(da.b)(e)] : [3, 2];
                    case 1:
                      (h = f.ca()),
                        (this.file = ba.q ? new Blob([h], { type: e.type }) : new File([h], null === e || void 0 === e ? void 0 : e.name, { type: e.type })),
                        (f.label = 2);
                    case 2:
                      return n(!0), [2];
                  }
                });
              });
            });
          }
          e.prototype.getFileData = function (x) {
            var w = this,
              n = new FileReader();
            n.onload = function (h) {
              w.trigger(e.Events.DOCUMENT_LOADING_PROGRESS, [h.loaded, h.loaded]);
              x(new Uint8Array(h.target.result));
            };
            n.onprogress = function (h) {
              h.lengthComputable && w.trigger(e.Events.DOCUMENT_LOADING_PROGRESS, [h.loaded, 0 < h.total ? h.total : 0]);
            };
            n.readAsArrayBuffer(this.file);
          };
          e.prototype.getFile = function () {
            return Object(ea.b)(this, void 0, Promise, function () {
              return Object(ea.d)(this, function (e) {
                switch (e.label) {
                  case 0:
                    return [4, this.Tha];
                  case 1:
                    return e.ca(), aa.utils.isJSWorker ? [2, this.file.path] : [2, this.file];
                }
              });
            });
          };
          e.Events = { DOCUMENT_LOADING_PROGRESS: 'documentLoadingProgress' };
          return e;
        })();
        Object(ia.a)(e);
        Object(fa.a)(e);
        Object(fa.b)(e);
        ca['default'] = e;
      },
    },
  ]);
}).call(this || window);
