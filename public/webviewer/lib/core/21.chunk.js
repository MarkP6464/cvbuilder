/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [21],
    {
      475: function (ia, ca, e) {
        e.r(ca);
        var ea = e(0),
          fa = e(8),
          da = e(2);
        ia = e(48);
        var ba = e(23),
          aa = e(11);
        e = (function () {
          function e() {
            this.init();
          }
          e.prototype.init = function () {
            this.K9 = !1;
            this.lf = this.Wl = this.connection = null;
            this.Ns = {};
            this.fa = this.rG = null;
          };
          e.prototype.Jqa = function (e) {
            for (var w = this, n = 0; n < e.length; ++n) {
              var h = e[n];
              switch (h.at) {
                case 'create':
                  this.Ns[h.author] || (this.Ns[h.author] = h.aName);
                  this.Tga(h);
                  break;
                case 'modify':
                  this.fa.Hm(h.xfdf).then(function (e) {
                    w.fa.nb(e[0]);
                  });
                  break;
                case 'delete':
                  this.fa.Hm('<delete><id>' + h.aId + '</id></delete>');
              }
            }
          };
          e.prototype.Tga = function (e) {
            var w = this;
            this.fa.Hm(e.xfdf).then(function (n) {
              n = n[0];
              n.authorId = e.author;
              w.fa.nb(n);
              w.fa.trigger(fa.c.UPDATE_ANNOTATION_PERMISSION, [n]);
            });
          };
          e.prototype.tga = function (e, w, n) {
            this.Wl && this.Wl(e, w, n);
          };
          e.prototype.preloadAnnotations = function (e) {
            this.addEventListener('webViewerServerAnnotationsEnabled', this.tga.bind(this, e, 'add', { imported: !1 }), { once: !0 });
          };
          e.prototype.initiateCollaboration = function (x, w, n) {
            var h = this;
            if (x) {
              h.lf = w;
              h.fa = n.qa();
              n.addEventListener(fa.f.DOCUMENT_UNLOADED, function () {
                h.disableCollaboration();
              });
              h.kra(x);
              var f = new XMLHttpRequest();
              f.addEventListener('load', function () {
                if (200 === f.status && 0 < f.responseText.length)
                  try {
                    var n = JSON.parse(f.responseText);
                    h.connection = exports.Za.$ra(Object(ba.k)(h.lf, 'blackbox/'), 'annot');
                    h.rG = n.id;
                    h.Ns[n.id] = n.user_name;
                    h.fa.SN(n.id);
                    h.connection.kva(
                      function (e) {
                        e.t && e.t.startsWith('a_') && e.data && h.Jqa(e.data);
                      },
                      function () {
                        h.connection.send({ t: 'a_retrieve', dId: x });
                        h.trigger(e.Events.WEBVIEWER_SERVER_ANNOTATIONS_ENABLED, [h.Ns[n.id], h.rG]);
                      },
                      function () {
                        h.disableCollaboration();
                      },
                    );
                  } catch (z) {
                    Object(da.g)(z.message);
                  }
              });
              f.open('GET', Object(ba.k)(this.lf, 'demo/SessionInfo.jsp'));
              f.withCredentials = !0;
              f.send();
              h.K9 = !0;
              h.fa.d0(function (e) {
                return h.Ns[e.Author] || e.Author;
              });
            } else Object(da.g)('Document ID required for collaboration');
          };
          e.prototype.disableCollaboration = function () {
            this.Wl && (this.fa.removeEventListener(aa.a.Events.ANNOTATION_CHANGED, this.Wl), (this.Wl = null));
            this.connection && this.connection.wq();
            this.fa && this.fa.SN('Guest');
            this.init();
            this.trigger(e.Events.WEBVIEWER_SERVER_ANNOTATIONS_DISABLED);
          };
          e.prototype.kra = function (e) {
            var w = this;
            this.Wl && this.fa.removeEventListener(aa.a.Events.ANNOTATION_CHANGED, this.Wl);
            this.Wl = function (n, h, f) {
              return Object(ea.b)(this, void 0, void 0, function () {
                var r, x, y, aa, ba, ca, da, fa, ia;
                return Object(ea.d)(this, function (z) {
                  switch (z.label) {
                    case 0:
                      if (f.imported) return [2];
                      r = { t: 'a_' + h, dId: e, annots: [] };
                      return [4, w.fa.NJ()];
                    case 1:
                      x = z.ca();
                      'delete' !== h && ((y = new DOMParser().parseFromString(x, 'text/xml')), (aa = new XMLSerializer()));
                      for (ba = 0; ba < n.length; ba++)
                        (ca = n[ba]),
                          (fa = da = void 0),
                          'add' === h
                            ? ((da = y.querySelector('[name="' + ca.Id + '"]')),
                              (fa = aa.serializeToString(da)),
                              (ia = null),
                              ca.InReplyTo && (ia = w.fa.Df(ca.InReplyTo).authorId || 'default'),
                              r.annots.push({
                                at: 'create',
                                aId: ca.Id,
                                author: w.rG,
                                aName: w.Ns[w.rG],
                                parent: ia,
                                xfdf: '<add>' + fa + '</add>',
                              }))
                            : 'modify' === h
                            ? ((da = y.querySelector('[name="' + ca.Id + '"]')),
                              (fa = aa.serializeToString(da)),
                              r.annots.push({
                                at: 'modify',
                                aId: ca.Id,
                                xfdf: '<modify>' + fa + '</modify>',
                              }))
                            : 'delete' === h && r.annots.push({ at: 'delete', aId: ca.Id });
                      0 < r.annots.length && w.connection.send(r);
                      return [2];
                  }
                });
              });
            }.bind(w);
            this.fa.addEventListener(aa.a.Events.ANNOTATION_CHANGED, this.Wl);
          };
          e.Events = {
            WEBVIEWER_SERVER_ANNOTATIONS_ENABLED: 'webViewerServerAnnotationsEnabled',
            WEBVIEWER_SERVER_ANNOTATIONS_DISABLED: 'webViewerServerAnnotationsDisabled',
          };
          return e;
        })();
        Object(ia.a)(e);
        ca['default'] = e;
      },
    },
  ]);
}).call(this || window);
