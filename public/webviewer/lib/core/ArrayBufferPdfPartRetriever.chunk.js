/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [2],
    {
      462: function (ia, ca, e) {
        e.r(ca);
        ia = e(48);
        e = e(395);
        var ea = (function () {
          function e(e) {
            this.buffer = e;
            this.fileSize = null === e || void 0 === e ? void 0 : e.byteLength;
          }
          e.prototype.getFileData = function (e) {
            e(new Uint8Array(this.buffer));
          };
          e.prototype.getFile = function () {
            return Promise.resolve(null);
          };
          return e;
        })();
        Object(ia.a)(ea);
        Object(e.a)(ea);
        Object(e.b)(ea);
        ca['default'] = ea;
      },
    },
  ]);
}).call(this || window);
