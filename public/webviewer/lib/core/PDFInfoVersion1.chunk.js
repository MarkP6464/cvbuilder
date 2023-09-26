/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [10],
    {
      471: function (ia, ca, e) {
        function ea(e) {
          e.La();
          e.advance();
          var f = e.current.textContent;
          e.ib();
          return f;
        }
        function fa(e) {
          var f = [];
          for (e.La(); e.advance(); ) {
            var h = e.Ra();
            'field' === h ? f.push(String(e.ga('name'))) : Object(ha.j)('unrecognised field list element: ' + h);
          }
          e.ib();
          return f;
        }
        function da(e, f) {
          return f ? 'false' !== e : 'true' === e;
        }
        function ba(e, f) {
          var h = e.Ra();
          switch (h) {
            case 'javascript':
              return { name: 'JavaScript', javascript: e.current.textContent };
            case 'uri':
              return { name: 'URI', uri: e.ga('uri') };
            case 'goto':
              h = null;
              e.La();
              if (e.advance()) {
                var n = e.ga('fit');
                h = { page: e.ga('page'), fit: n };
                if ('0' === h.page) Object(ha.j)('null page encountered in dest');
                else
                  switch (((f = f(Number(h.page))), n)) {
                    case 'Fit':
                    case 'FitB':
                      break;
                    case 'FitH':
                    case 'FitBH':
                      h.top = f.va({ x: 0, y: e.ga('top') || 0 }).y;
                      break;
                    case 'FitV':
                    case 'FitBV':
                      h.left = f.va({ x: e.ga('left') || 0, y: 0 }).x;
                      break;
                    case 'FitR':
                      n = f.va({ x: e.ga('left') || 0, y: e.ga('top') || 0 });
                      f = f.va({
                        x: e.ga('right') || 0,
                        y: e.ga('bottom') || 0,
                      });
                      f = new na.d(n.x, n.y, f.x, f.y);
                      h.top = f.ka;
                      h.left = f.na;
                      h.bottom = f.la;
                      h.right = f.oa;
                      break;
                    case 'XYZ':
                      n = f.va({ x: e.ga('left') || 0, y: e.ga('top') || 0 });
                      h.top = n.y;
                      h.left = n.x;
                      h.zoom = e.ga('zoom') || 0;
                      break;
                    default:
                      Object(ha.j)('unknown dest fit: ' + n);
                  }
                h = { name: 'GoTo', dest: h };
              } else Object(ha.j)('missing dest in GoTo action');
              e.ib();
              return h;
            case 'submit-form':
              h = {
                name: 'SubmitForm',
                url: e.ga('url'),
                format: e.ga('format'),
                method: e.ga('method') || 'POST',
                exclude: da(e.ga('exclude'), !1),
              };
              f = e.ga('flags');
              h.flags = f ? f.split(' ') : [];
              for (e.La(); e.advance(); )
                switch (((f = e.Ra()), f)) {
                  case 'fields':
                    h.fields = fa(e);
                    break;
                  default:
                    Object(ha.j)('unrecognised submit-form child: ' + f);
                }
              e.ib();
              return h;
            case 'reset-form':
              h = { name: 'ResetForm', exclude: da(e.ga('exclude'), !1) };
              for (e.La(); e.advance(); )
                switch (((f = e.Ra()), f)) {
                  case 'fields':
                    h.fields = fa(e);
                    break;
                  default:
                    Object(ha.j)('unrecognised reset-form child: ' + f);
                }
              e.ib();
              return h;
            case 'hide':
              h = { name: 'Hide', hide: da(e.ga('hide'), !0) };
              for (e.La(); e.advance(); )
                switch (((f = e.Ra()), f)) {
                  case 'fields':
                    h.fields = fa(e);
                    break;
                  default:
                    Object(ha.j)('unrecognised hide child: ' + f);
                }
              e.ib();
              return h;
            case 'named':
              return { name: 'Named', action: e.ga('name') };
            default:
              Object(ha.j)('Encountered unexpected action type: ' + h);
          }
          return null;
        }
        function aa(e, f, h) {
          var n = {};
          for (e.La(); e.advance(); ) {
            var r = e.Ra();
            switch (r) {
              case 'action':
                r = e.ga('trigger');
                if (f ? -1 !== f.indexOf(r) : 1) {
                  n[r] = [];
                  for (e.La(); e.advance(); ) {
                    var w = ba(e, h);
                    Object(ka.isNull)(w) || n[r].push(w);
                  }
                  e.ib();
                } else Object(ha.j)('encountered unexpected trigger on field: ' + r);
                break;
              default:
                Object(ha.j)('encountered unknown action child: ' + r);
            }
          }
          e.ib();
          return n;
        }
        function y(e) {
          return new ra.a(e.ga('r') || 0, e.ga('g') || 0, e.ga('b') || 0, e.ga('a') || 1);
        }
        function x(e, f) {
          var h = e.ga('name'),
            n = e.ga('type') || 'Type1',
            r = e.ga('size'),
            w = f.va({ x: 0, y: 0 });
          r = f.va({ x: Number(r), y: 0 });
          f = w.x - r.x;
          w = w.y - r.y;
          h = {
            name: h,
            type: n,
            size: Math.sqrt(f * f + w * w) || 0,
            strokeColor: [0, 0, 0],
            fillColor: [0, 0, 0],
          };
          for (e.La(); e.advance(); )
            switch (((n = e.Ra()), n)) {
              case 'stroke-color':
                h.strokeColor = y(e);
                break;
              case 'fill-color':
                h.fillColor = y(e);
                break;
              default:
                Object(ha.j)('unrecognised font child: ' + n);
            }
          e.ib();
          return h;
        }
        function w(e) {
          return {
            value: e.ga('value'),
            displayValue: e.ga('display-value') || void 0,
          };
        }
        function n(e) {
          var f = [];
          for (e.La(); e.advance(); ) {
            var h = e.Ra();
            switch (h) {
              case 'option':
                f.push(w(e));
                break;
              default:
                Object(ha.j)('unrecognised options child: ' + h);
            }
          }
          e.ib();
          return f;
        }
        function h(e, f) {
          var h = e.ga('name'),
            r = {
              type: e.ga('type'),
              quadding: e.ga('quadding') || 'Left-justified',
              maxLen: e.ga('max-len') || -1,
            },
            w = e.ga('flags');
          Object(ka.isString)(w) && (r.flags = w.split(' '));
          for (e.La(); e.advance(); )
            switch (((w = e.Ra()), w)) {
              case 'actions':
                r.actions = aa(e, ['C', 'F', 'K', 'V'], function () {
                  return f;
                });
                break;
              case 'default-value':
                r.defaultValue = ea(e);
                break;
              case 'font':
                r.font = x(e, f);
                break;
              case 'options':
                r.options = n(e);
                break;
              default:
                Object(ha.j)('unknown field child: ' + w);
            }
          e.ib();
          return new window.Annotations.ha.ta(h, r);
        }
        function f(e, f) {
          switch (e.type) {
            case 'Tx':
              try {
                if (Object(pa.c)(e.actions)) return new ja.a.DatePickerWidgetAnnotation(e, f);
              } catch (la) {
                Object(ha.j)(la);
              }
              return new ja.a.TextWidgetAnnotation(e, f);
            case 'Ch':
              return e.flags.get(xa.WidgetFlags.COMBO) ? new ja.a.ChoiceWidgetAnnotation(e, f) : new ja.a.ListWidgetAnnotation(e, f);
            case 'Btn':
              return e.flags.get(xa.WidgetFlags.PUSH_BUTTON)
                ? new ja.a.PushButtonWidgetAnnotation(e, f)
                : e.flags.get(xa.WidgetFlags.RADIO)
                ? new ja.a.RadioButtonWidgetAnnotation(e, f)
                : new ja.a.CheckButtonWidgetAnnotation(e, f);
            case 'Sig':
              return new ja.a.SignatureWidgetAnnotation(e, f);
            default:
              Object(ha.j)('Unrecognised field type: ' + e.type);
          }
          return null;
        }
        function r(e, f) {
          var h = { number: e.ga('number') };
          for (e.La(); e.advance(); ) {
            var n = e.Ra();
            switch (n) {
              case 'actions':
                h.actions = aa(e, ['O', 'C'], f);
                break;
              default:
                Object(ha.j)('unrecognised page child: ' + n);
            }
          }
          e.ib();
          return h;
        }
        function z(e, n, w, z) {
          var ba = [],
            ca = {};
          e.La();
          var da = [],
            ea = {},
            ia = [];
          Object(ma.a)(
            function () {
              if (e.advance()) {
                var w = e.Ra();
                switch (w) {
                  case 'calculation-order':
                    da = 'calculation-order' === e.Ra() ? fa(e) : [];
                    break;
                  case 'document-actions':
                    ea = aa(e, ['Init', 'Open'], n);
                    break;
                  case 'pages':
                    w = [];
                    for (e.La(); e.advance(); ) {
                      var z = e.Ra();
                      switch (z) {
                        case 'page':
                          w.push(r(e, n));
                          break;
                        default:
                          Object(ha.j)('unrecognised page child: ' + z);
                      }
                    }
                    e.ib();
                    ia = w;
                    break;
                  case 'field':
                    z = h(e, n(1));
                    ca[z.name] = z;
                    break;
                  case 'widget':
                    w = {
                      border: { style: 'Solid', width: 1 },
                      backgroundColor: [],
                      fieldName: e.ga('field'),
                      page: e.ga('page'),
                      index: e.ga('index') || 0,
                      rotation: e.ga('rotation') || 0,
                      flags: [],
                      isImporting: !0,
                    };
                    (z = e.ga('appearance')) && (w.appearance = z);
                    (z = e.ga('flags')) && (w.flags = z.split(' '));
                    for (e.La(); e.advance(); )
                      switch (((z = e.Ra()), z)) {
                        case 'rect':
                          var ja = e,
                            ka = n(Number(w.page));
                          z = ka.va({
                            x: ja.ga('x1') || 0,
                            y: ja.ga('y1') || 0,
                          });
                          ja = ka.va({
                            x: ja.ga('x2') || 0,
                            y: ja.ga('y2') || 0,
                          });
                          z = new na.d(z.x, z.y, ja.x, ja.y);
                          z.normalize();
                          w.rect = { x1: z.x1, y1: z.y1, x2: z.x2, y2: z.y2 };
                          break;
                        case 'border':
                          z = e;
                          ja = {
                            style: z.ga('style') || 'Solid',
                            width: z.ga('width') || 1,
                            color: [0, 0, 0],
                          };
                          for (z.La(); z.advance(); )
                            switch (((ka = z.Ra()), ka)) {
                              case 'color':
                                ja.color = y(z);
                                break;
                              default:
                                Object(ha.j)('unrecognised border child: ' + ka);
                            }
                          z.ib();
                          w.border = ja;
                          break;
                        case 'background-color':
                          w.backgroundColor = y(e);
                          break;
                        case 'actions':
                          w.actions = aa(e, 'E X D U Fo Bl PO PC PV PI'.split(' '), n);
                          break;
                        case 'appearances':
                          z = e;
                          ja = Object(pa.b)(w, 'appearances');
                          for (z.La(); z.advance(); )
                            if (((ka = z.Ra()), 'appearance' === ka)) {
                              ka = z.ga('name');
                              var la = Object(pa.b)(ja, ka);
                              ka = z;
                              for (ka.La(); ka.advance(); ) {
                                var ma = ka.Ra();
                                switch (ma) {
                                  case 'Normal':
                                    Object(pa.b)(la, 'Normal').data = ka.current.textContent;
                                    break;
                                  default:
                                    Object(ha.j)('unexpected appearance state: ', ma);
                                }
                              }
                              ka.ib();
                            } else Object(ha.j)('unexpected appearances child: ' + ka);
                          z.ib();
                          break;
                        case 'extra':
                          z = e;
                          ja = n;
                          ka = {};
                          for (z.La(); z.advance(); )
                            switch (((la = z.Ra()), la)) {
                              case 'font':
                                ka.font = x(z, ja(1));
                                break;
                              default:
                                Object(ha.j)('unrecognised extra child: ' + la);
                            }
                          z.ib();
                          z = ka;
                          z.font && (w.font = z.font);
                          break;
                        case 'captions':
                          ja = e;
                          z = {};
                          (ka = ja.ga('Normal')) && (z.Normal = ka);
                          (ka = ja.ga('Rollover')) && (z.Rollover = ka);
                          (ja = ja.ga('Down')) && (z.Down = ja);
                          w.captions = z;
                          break;
                        default:
                          Object(ha.j)('unrecognised widget child: ' + z);
                      }
                    e.ib();
                    (z = ca[w.fieldName]) ? ((w = f(z, w)), ba.push(w)) : Object(ha.j)('ignoring widget with no corresponding field data: ' + w.fieldName);
                    break;
                  default:
                    Object(ha.j)('Unknown element encountered in PDFInfo: ' + w);
                }
                return !0;
              }
              return !1;
            },
            function () {
              e.ib();
              w({
                calculationOrder: da,
                widgets: ba,
                fields: ca,
                documentActions: ea,
                pages: ia,
                custom: [],
              });
            },
            z,
          );
        }
        e.r(ca);
        e.d(ca, 'parse', function () {
          return z;
        });
        var ha = e(2),
          ka = e(1);
        e.n(ka);
        var ja = e(123),
          na = e(4),
          ra = e(7),
          ma = e(20),
          pa = e(108),
          xa = e(17);
      },
    },
  ]);
}).call(this || window);
