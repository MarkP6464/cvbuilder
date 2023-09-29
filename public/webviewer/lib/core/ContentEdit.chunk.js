/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [4],
    {
      496: function (ia, ca, e) {
        var ea = e(0);
        ia = e(88);
        var fa = e(50);
        e = (function (e) {
          function ba() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          Object(ea.c)(ba, e);
          ba.prototype.testSelection = function (e, y, x) {
            return fa.a.Ul(e, y, x);
          };
          return ba;
        })(ia.a);
        ca.a = e;
      },
      87: function (ia, ca, e) {
        function ea(e) {
          return Object(Ga.b)(void 0, void 0, void 0, function () {
            var f, h, n, r, w, x, z, aa, ba, ca, ea, da, fa, ha, ia;
            return Object(Ga.d)(this, function (la) {
              switch (la.label) {
                case 0:
                  return (
                    (f = e.Ab),
                    (h = e.fF),
                    (n = e.gF),
                    (r = e.sL),
                    (w = e.Xha),
                    (x = e.Iha),
                    (z = Ua.getDocument()),
                    (aa = [1]),
                    [4, Object(Fa.c)(h, { extension: 'pdf' })]
                  );
                case 1:
                  return (ba = la.ca()), (ca = Ua.qa()), (fa = (da = La.a).Hka), [4, ba.WC()];
                case 2:
                  return (ea = fa.apply(da, [la.ca().xfdfString, f])), (ha = !0), [4, z.$f(ba, aa, f, ha)];
                case 3:
                  return la.ca(), [4, z.Pg([f + 1], ha)];
                case 4:
                  return (
                    la.ca(),
                    (ia = ca.ub().filter(function (e) {
                      return e.PL() && e.PageNumber === f;
                    })),
                    ca.zf(ia, { force: !0, source: 'contentEditTool' }),
                    [4, ca.uL(ea)]
                  );
                case 5:
                  return la.ca(), Xa || (Ua.getDocument().kN(), Ua.jN(f), Ua.ye()), y(f), x || w || ya(f, n, r, w), [2];
              }
            });
          });
        }
        function fa(e) {
          if (e) return da(e.contents);
          Object(Aa.g)('Unable to extract document content');
        }
        function da(e) {
          e = new DOMParser().parseFromString(e, 'text/html').documentElement.querySelector('body');
          e.querySelectorAll('p').forEach(function (e) {
            e.querySelectorAll('span').forEach(function (e) {
              var f = e.getAttribute('style');
              f = ba(f, e.innerHTML);
              e.innerHTML = f;
            });
            var f = e.getAttribute('style'),
              h = e.innerHTML.Fj('<br>', '');
            e.innerHTML = ba(f, h);
          });
          return e.innerHTML.trim();
        }
        function ba(e, f) {
          if (null === e || void 0 === e ? 0 : e.includes('bold')) f = '<strong>' + f + '</strong>';
          if (null === e || void 0 === e ? 0 : e.includes('italic')) f = '<em>' + f + '</em>';
          if ((null === e || void 0 === e ? 0 : e.includes('underline:1;')) || (null === e || void 0 === e ? 0 : e.includes('text-decoration: underline')))
            f = '<u>' + f + '</u>';
          return f;
        }
        function aa(e) {
          if (['STRONG', 'EM', 'U'].includes(e.tagName) && null !== e.getAttribute('style')) {
            var f = document.createElement('span'),
              h = e.style.color;
            h = ma(h);
            f.setAttribute('style', 'color:' + h);
            e.removeAttribute('style');
            f.innerHTML = e.innerHTML;
            e.innerHTML = '';
            e.appendChild(f);
          } else
            'SPAN' === e.tagName && null !== e.getAttribute('style')
              ? ((h = e.style.color), (h = ma(h)), e.setAttribute('style', 'color:' + h))
              : 'A' === e.tagName && e.removeAttribute('style');
        }
        function y(e) {
          var f = Ua.qa(),
            h = f.ub().filter(function (f) {
              return f.af() && f.PageNumber === e;
            });
          f.zf(h, { force: !0, source: 'contentEditTool' });
        }
        function x(e, f) {
          f.forEach(function (f) {
            Va[e] || (Va[e] = []);
            Va[e].find(function (e) {
              return e.id === f.id;
            }) || Va[e].push(f);
          });
        }
        function w(e, f) {
          f.forEach(function (f) {
            ib[e] || (ib[e] = []);
            ib[e].find(function (e) {
              return e.id === f.id;
            }) || ib[e].push(f);
          });
        }
        function n(e, f, n, r) {
          return Object(Ga.b)(void 0, void 0, void 0, function () {
            var w, x, y, z, aa, ba, ca, ea, fa, ha, ia, la, ja, ka, ma, ua, na, xa;
            return Object(Ga.d)(this, function (ya) {
              switch (ya.label) {
                case 0:
                  if (!e) return [2];
                  w = f.Fj('<p><br></p>', '');
                  x = h(w);
                  x = x.replace(/<span style="color: var\(--text-color\);">(.*?)<\/span>/g, '$1');
                  x = x.replace(/<span class="ql-cursor">(.*?)<\/span>/g, '');
                  y = e.rf.id;
                  z = e.PageNumber;
                  aa = cb[z];
                  ba = aa.galleys.find(function (e) {
                    return e.id === y;
                  });
                  ca = da(ba.contents);
                  ea = ra(z, aa, ca, x, y);
                  if ('' === ea) return [3, 2];
                  fa = new TextEncoder();
                  ha = fa.encode(ea);
                  ia = ha.buffer;
                  la = Object(za.c)() || 'https://www.pdftron.com/webfonts/v2/';
                  ja = Ua.getDocument();
                  return [4, ja.he([z], void 0, !0)];
                case 1:
                  return (
                    (ka = ya.ca()),
                    (fa = new TextEncoder()),
                    (ma = fa.encode('')),
                    (ua = ma.buffer),
                    Pa.postMessage(
                      {
                        cmd: 'importText',
                        pdfFile: ka,
                        pageNumber: z,
                        webFontURL: la,
                        galleyId: y,
                        importData: ia,
                        tableData: ua,
                        isSearchReplace: n,
                        callbackMapId: r,
                      },
                      [ia, ua],
                    ),
                    (na = {}),
                    ba &&
                      ((xa = ba.galleyBox),
                      (na = {
                        top: xa.top,
                        left: xa.left,
                        bottom: xa.bottom,
                        right: xa.right,
                      })),
                    Object(Ja.w)(ca, x, na),
                    [3, 3]
                  );
                case 2:
                  Object(Aa.g)('Unable to generate import XML'), (ya.label = 3);
                case 3:
                  return [2];
              }
            });
          });
        }
        function h(e) {
          var f = new DOMParser(),
            h = f.parseFromString(e, 'text/xml');
          h.querySelector('parsererror') && (h = f.parseFromString('<Root>' + e + '</Root>', 'text/xml'));
          h.querySelectorAll('a').forEach(function (e) {
            var f = e.childNodes[0];
            Array.from(e.querySelectorAll('*')).find(function (e) {
              return 'u' === e.tagName.toLowerCase();
            }) || ((e = document.createElement('u')), f.after(e), e.appendChild(f));
          });
          return new XMLSerializer().serializeToString(h);
        }
        function f(e, f, h) {
          return Object(Ga.b)(void 0, void 0, void 0, function () {
            var n, r, w, x;
            return Object(Ga.d)(this, function (z) {
              switch (z.label) {
                case 0:
                  return y(f), (ib[f] = []), (Va[f] = []), [4, e.he([f], void 0, !0)];
                case 1:
                  return (
                    (n = z.ca()),
                    (r = new TextEncoder()),
                    (w = r.encode('')),
                    (x = w.buffer),
                    Pa.postMessage(
                      {
                        cmd: 'exportFile',
                        pageNumber: f,
                        performExport: h,
                        pdfFile: n,
                        tableData: x,
                      },
                      [n, x],
                    ),
                    [2]
                  );
              }
            });
          });
        }
        function r(e) {
          return Object(Ga.b)(void 0, void 0, void 0, function () {
            return Object(Ga.d)(this, function () {
              Qa ||
                ((Ua = e),
                (Qa = new Promise(function (e, f) {
                  var h = window.Core.ContentEdit.getWorkerPath(),
                    n = window.Core.ContentEdit.getResourcePath();
                  Pa = new Worker(h + 'InfixServerModule.js');
                  Pa.onmessage = function (h) {
                    xa(h, e, f);
                  };
                  Pa.postMessage({ cmd: 'isReady', resourcePath: n });
                })));
              return [2, Qa];
            });
          });
        }
        function z(e, f, h, n) {
          this.top = e;
          this.left = f;
          this.bottom = h;
          this.right = n;
          this.topVal = function () {
            return Math.round(this.top);
          };
          this.bottomVal = function () {
            return Math.round(this.bottom);
          };
          this.leftVal = function () {
            return Math.round(this.left);
          };
          this.rightVal = function () {
            return Math.round(this.right);
          };
          this.height = function () {
            return Math.round(Math.abs(this.top - this.bottom));
          };
          this.width = function () {
            return Math.round(this.right - this.left);
          };
          this.dT = function (e) {
            return this.topVal() !== e.topVal() || this.leftVal() !== e.leftVal() || this.bottomVal() !== e.bottomVal() || this.rightVal() !== e.rightVal();
          };
        }
        function ha(e, f, h, n, r) {
          this.id = e;
          this.pagenum = f;
          this.galleysContents = h;
          this.contents = n;
          this.galleyBox = r;
          Object(Ja.v)(ib);
        }
        function ka(e, f, h, n) {
          this.id = f;
          this.type = e;
          this.bbox = h;
          this.pagenum = n;
        }
        function ja(e, f, h, n, r) {
          this.id = e;
          this.pagecount = f;
          this.pageBBox = h;
          this.galleys = n;
          this.objects = r;
        }
        function na(e, f) {
          this.family = e;
          this.variations = f;
        }
        function ra(e, f, h, n, r) {
          var w = [],
            x = [];
          new DOMParser()
            .parseFromString(n, 'text/html')
            .documentElement.querySelectorAll('p')
            .forEach(function (e, f) {
              w[f] = e.innerHTML;
              x[f] = {
                fontSize: e.style.fontSize,
                fontFamily: e.style.fontFamily,
                color: ma(e.style.color),
              };
            });
          h = new DOMParser().parseFromString(h, 'text/html');
          var y = null;
          h.documentElement.querySelectorAll('p').forEach(function (e, f) {
            if (f < w.length) {
              var h = new DOMParser().parseFromString(w[f], 'text/html').documentElement.querySelector('body');
              h.childNodes.forEach(function (e) {
                aa(e);
              });
              e.innerHTML = h.innerHTML;
              y = e.getAttribute('style');
              h = x[f].fontSize ? x[f].fontSize : e.style.fontSize;
              var n = x[f].fontFamily ? x[f].fontFamily.replace(/\s+/g, '').replace(/['"]+/g, '') : e.style.fontFamily;
              f = x[f].color ? x[f].color : null;
              y = y.replace(/(font:.*?;)/i, 'font:normal normal ' + h + ' ' + n + ';');
              y = y.replace('Italic', '');
              y = y.replace('underline:1;', 'underline:0;');
              y = y.replace('text-decoration: underline;', 'text-decoration: none;');
              f && (y = y.replace(/(color:.*?;)/i, 'color:' + f + ';'));
              e.setAttribute('style', y);
            } else e.remove();
          });
          for (n = h.documentElement.querySelectorAll('p').length; n < w.length; n++) {
            var z = document.createElement('p');
            z.setAttribute('id', '0');
            var ba = new DOMParser().parseFromString(w[n], 'text/html').documentElement.querySelector('body');
            ba.childNodes.forEach(function (e) {
              aa(e);
            });
            z.innerHTML = ba.innerHTML;
            null != y && z.setAttribute('style', y);
            h.documentElement.querySelector('body').appendChild(z);
          }
          h = h.documentElement.querySelector('body').innerHTML;
          var ca = '';
          ib[e].forEach(function (e) {
            e.id === r && (ca = e);
          });
          if ('' === ca) return '';
          f = "<DOC id='" + f.id + "' pagecount='" + f.pagecount + "'>";
          f = f + ("<STORY galley_ids='" + r + "' pagenum='" + e + "'>") + ('<galleys>' + ca.galleysContents + '</galleys>');
          ca.contents = h;
          f = f + h + '\n</STORY>';
          return (f += '</DOC>');
        }
        function ma(e) {
          return e.startsWith('rgb(')
            ? '#' +
                e
                  .replace(/^[^\d]+/, '')
                  .replace(/[^\d]+$/, '')
                  .split(',')
                  .map(function (e) {
                    return ('00' + parseInt(e, 10).toString(16)).slice(-2);
                  })
                  .join('')
            : e;
        }
        function pa(e, f, h, n) {
          var r = [],
            w = Ua.getDocument(),
            x = null;
          f.forEach(function (f) {
            if (f instanceof ka) {
              var y = w.Go(e, f.bbox.leftVal(), f.bbox.topVal());
              var z = y.x;
              var aa = y.y;
              var ba = w.Go(e, f.bbox.rightVal(), f.bbox.bottomVal());
              y = ba.x;
              ba = ba.y;
            } else if (f instanceof ha)
              (y = w.Go(e, f.galleyBox.leftVal(), f.galleyBox.topVal())),
                (z = y.x),
                (aa = y.y),
                (ba = w.Go(e, f.galleyBox.rightVal(), f.galleyBox.bottomVal())),
                (y = ba.x),
                (ba = ba.y);
            else return;
            var ca = new window.Core.Annotations.RectangleAnnotation(),
              ea = ta.a.OBJECT;
            f instanceof ha && (ea = ta.a.TEXT);
            ca.wna(f, ea);
            ca.PageNumber = f.pagenum;
            ca.X = z;
            ca.Y = aa;
            ca.Width = y - z;
            ca.Height = ba - aa;
            ca.StrokeColor = new Ka.a('#3183C8');
            ca.FillColor = new Ka.a(255, 255, 255, 0.01);
            ca.Style = 'dash';
            ca.Dashes = '4,3';
            if (Ta || n) (ca.NoView = !0), (ca.Listable = !1);
            ca.$w();
            ca.selectionModel = Ia.a;
            r.push(ca);
            'undefined' !== typeof h && h === f.id && (x = ca);
          });
          f = Ua.qa();
          f.lh(r);
          !x || Ta || n || f.hg(x);
          f.se(r);
        }
        function xa(e, f, h) {
          return Object(Ga.b)(this, void 0, void 0, function () {
            var n, r, w, x, y, z, aa, ba, ca, da;
            return Object(Ga.d)(this, function (fa) {
              switch (fa.label) {
                case 0:
                  n = e.data;
                  w = n.cmd;
                  switch (w) {
                    case 'isReady':
                      return [3, 1];
                    case 'initialiseInfixServer':
                      return [3, 3];
                    case 'loadAvailableFonts':
                      return [3, 4];
                    case 'exportFile':
                      return [3, 5];
                    case 'insertNewTextBox':
                      return [3, 6];
                    case 'importText':
                      return [3, 7];
                    case 'transformObject':
                      return [3, 7];
                    case 'alignParagraph':
                      return [3, 7];
                    case 'deleteObject':
                      return [3, 8];
                    case 'insertImage':
                      return [3, 9];
                  }
                  return [3, 10];
                case 1:
                  return [4, Object(Ha.b)()];
                case 2:
                  return (x = fa.ca()), Pa.postMessage({ cmd: 'initialiseInfixServer', l: x }), [3, 10];
                case 3:
                  return (
                    (y = oa(n.resultsXML))
                      ? (f(),
                        (z = Object(za.c)() || 'https://www.pdftron.com/webfonts/v2/'),
                        Pa.postMessage({
                          cmd: 'loadAvailableFonts',
                          webFontURL: z,
                        }))
                      : h('License key does not have content edit permission'),
                    [3, 10]
                  );
                case 4:
                  return Ca(n.resultsXML), [3, 10];
                case 5:
                  return (
                    n.exportPerformed ? ua(n.pageNumber, n.exportXML, n.objectXML, n.resultsXML) : ((r = cb[n.pageNumber]), la(n.pageNumber, r)),
                    hb.resolve(),
                    jb && jb[n.pageNumber] && jb[n.pageNumber].resolve(),
                    [3, 10]
                  );
                case 6:
                  return (
                    Ea(n.pageNumber, n.exportXML, n.contentHTML), (r = cb[n.pageNumber]), ea({ Ab: n.pageNumber, fF: n.pdfBuffer, gF: r, sL: n.id }), [3, 10]
                  );
                case 7:
                  r = cb[n.pageNumber];
                  Da(n.pageNumber, n.resultsXML);
                  ea({
                    Ab: n.pageNumber,
                    fF: n.pdfBuffer,
                    gF: r,
                    sL: n.id,
                    Xha: n.isSearchReplace,
                  });
                  aa = n.isSearchReplace;
                  ba = n.callbackMapId;
                  if (aa && ba && Fb[ba]) Fb[ba]();
                  return [3, 10];
                case 8:
                  return (
                    (r = cb[n.pageNumber]),
                    Da(n.pageNumber, n.resultsXML),
                    (r.galleys = r.galleys.filter(function (e) {
                      return e.id !== n.id;
                    })),
                    (r.objects = r.objects.filter(function (e) {
                      return e.id !== n.id;
                    })),
                    (ca = { Ab: n.pageNumber, fF: n.pdfBuffer, gF: r }),
                    ea(ca),
                    [3, 10]
                  );
                case 9:
                  return (
                    (r = cb[n.pageNumber]),
                    Da(n.pageNumber, n.resultsXML),
                    (da = {
                      Ab: n.pageNumber,
                      fF: n.pdfBuffer,
                      gF: r,
                      sL: n.isText,
                      Iha: !0,
                    }),
                    ea(da),
                    [3, 10]
                  );
                case 10:
                  return [2];
              }
            });
          });
        }
        function oa(e) {
          e = new Uint8Array(e);
          var f = new TextDecoder('utf-8').decode(e);
          e = !1;
          f = new DOMParser().parseFromString(f, 'text/xml').getElementsByTagName('LicenseCheck');
          null !== f && 0 < f.length && ((f = f[0].getElementsByTagName('Status')[0].innerHTML), 'error' !== f && 'ok' === f && (e = !0));
          return e;
        }
        function Ea(e, f) {
          f = new TextDecoder('utf-8').decode(f);
          f = new DOMParser().parseFromString(f, 'text/xml').getElementsByTagName('STORY');
          var h = Array.prototype.slice.call(f)[0];
          f = h.getAttribute('galley_ids');
          var n = Array.prototype.slice.call(h.getElementsByTagName('g'))[0],
            r = n.getAttribute('bbox').split(' ');
          r = new z(parseFloat(r[0]), parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3]));
          n = n.innerHTML;
          var w = Array.prototype.slice.call(h.getElementsByTagName('galleys'))[0];
          w.parentNode.removeChild(w);
          h = wa(h.innerHTML).trim();
          f = new ha(f, e, n, h, r);
          h = cb[e];
          r = h.galleys;
          r.push(f);
          h.galleys = r;
          cb[e] = h;
          la(e, h);
        }
        function la(e, f) {
          w(e, f.galleys);
          x(e, f.objects);
          y(e);
          ya(e, f);
        }
        function ya(e, f, h, n) {
          pa(e, f.objects, h, n);
          pa(e, f.galleys, h, n);
        }
        function ua(e, f, h, n) {
          var r = new Uint8Array(f),
            w = new TextDecoder('utf-8');
          f = w.decode(r);
          r = new Uint8Array(h);
          h = w.decode(r);
          r = new Uint8Array(n);
          n = w.decode(r);
          cb[e] = qa(e, f, h, n);
          la(e, cb[e]);
        }
        function sa(e, f) {
          e = parseFloat(e);
          return isNaN(f) || f < e ? e : f;
        }
        function qa(e, f, h, n) {
          var r;
          var w = new DOMParser();
          n = w.parseFromString(n, 'text/xml');
          Array.prototype.slice.call(n.getElementsByTagName('BBox')).forEach(function (e) {
            if ('CropBox' === e.getAttribute('Name')) {
              var f = parseFloat(e.getElementsByTagName('Top').item(0).innerHTML),
                h = parseFloat(e.getElementsByTagName('Bottom').item(0).innerHTML),
                n = parseFloat(e.getElementsByTagName('Left').item(0).innerHTML);
              e = parseFloat(e.getElementsByTagName('Right').item(0).innerHTML);
              r = new z(f, n, h, e);
            }
          });
          w = new DOMParser();
          n = w.parseFromString(f, 'text/xml');
          var x = [];
          Array.prototype.slice.call(n.getElementsByTagName('STORY')).forEach(function (f) {
            var h = f.getAttribute('galley_ids'),
              n = Array.prototype.slice.call(f.getElementsByTagName('g'))[0],
              r = n.getAttribute('bbox').split(' ');
            r = new z(parseFloat(r[0]), parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3]));
            n = n.innerHTML;
            var w = Array.prototype.slice.call(f.getElementsByTagName('galleys'))[0];
            w.parentNode.removeChild(w);
            f = wa(f.innerHTML).trim();
            h = new ha(h, e, n, f, r);
            x.push(h);
          });
          w = new DOMParser();
          var y = [];
          f = w.parseFromString(h, 'text/xml').getElementsByTagName('Object');
          Array.prototype.slice.call(f).forEach(function (f) {
            var h = f.getAttribute('Type'),
              n = f.getAttribute('OID');
            f = Array.prototype.slice.call(f.getElementsByTagName('Point'));
            var r = Number.NaN,
              w = Number.NaN,
              x = Number.NaN,
              aa = Number.NaN;
            f.forEach(function (e) {
              var f = e.getAttribute('Name');
              'TL' === f
                ? ((r = sa(e.getAttribute('Y'), r)), (x = sa(e.getAttribute('X'), x)))
                : 'TR' === f
                ? ((r = sa(e.getAttribute('Y'), r)), (aa = sa(e.getAttribute('X'), aa)))
                : 'BR' === f
                ? ((w = sa(e.getAttribute('Y'), w)), (aa = sa(e.getAttribute('X'), aa)))
                : 'BL' === f && ((w = sa(e.getAttribute('Y'), w)), (x = sa(e.getAttribute('X'), x)));
            });
            y.push(new ka(h, n, new z(r, x, w, aa), e));
          });
          f = Array.prototype.slice.call(n.getElementsByTagName('DOC'))[0].getAttribute('id');
          return new ja(f, 1, r, x, y);
        }
        function wa(e) {
          return new DOMParser().parseFromString(e, 'text/html').documentElement.querySelector('body').innerHTML;
        }
        function Da(e, f) {
          var h;
          f = new TextDecoder('utf-8').decode(f);
          var n = new DOMParser().parseFromString(f, 'text/xml');
          f = n.getElementsByTagName('Galley').item(0);
          if (null != f) {
            var r = f.getAttribute('id');
            f = n.getElementsByTagName('BBox');
            f = Array.prototype.slice.call(f);
            f.forEach(function (e) {
              var f = e.getElementsByTagName('Top'),
                n = parseFloat(f.item(0).innerHTML);
              f = e.getElementsByTagName('Left');
              var r = parseFloat(f.item(0).innerHTML);
              f = e.getElementsByTagName('Bottom');
              var w = parseFloat(f.item(0).innerHTML);
              f = e.getElementsByTagName('Right');
              e = parseFloat(f.item(0).innerHTML);
              h = new z(n, r, w, e);
            });
            ib[e].forEach(function (e) {
              e.id === r && !0 === h.dT(e.galleyBox) && (e.galleyBox = h);
            });
          }
          f = n.getElementsByTagName('Object').item(0);
          if (null != f) {
            var w = f.getAttribute('OID');
            f = n.getElementsByTagName('BBox');
            f = Array.prototype.slice.call(f);
            f.forEach(function (e) {
              var f = e.getElementsByTagName('Top'),
                n = parseFloat(f.item(0).innerHTML);
              f = e.getElementsByTagName('Left');
              var r = parseFloat(f.item(0).innerHTML);
              f = e.getElementsByTagName('Bottom');
              var w = parseFloat(f.item(0).innerHTML);
              f = e.getElementsByTagName('Right');
              e = parseFloat(f.item(0).innerHTML);
              h = new z(n, r, w, e);
            });
            Va[e].forEach(function (e) {
              e.id === w && !0 === h.dT(e.bbox) && (e.bbox = h);
            });
          }
          f = n.getElementsByTagName('NewParas').item(0);
          if (null != f) {
            var x = f.getAttribute('id');
            ib[e].forEach(function (e) {
              if (e.id === x) {
                var f = '<Contents>' + e.contents;
                f += '</Contents>';
                var h = Array.prototype.slice.call(n.getElementsByTagName('NewPara'));
                f = new DOMParser().parseFromString(f, 'text/xml');
                var r = Array.prototype.slice.call(f.getElementsByTagName('p'));
                h.forEach(function (e) {
                  var f = parseFloat(e.innerHTML),
                    h = !1;
                  r.forEach(function (e) {
                    var n = e.getAttribute('id');
                    !1 === h && '0' === n && (e.setAttribute('id', f), (h = !0));
                  });
                });
                e.contents = f.getElementsByTagName('Contents').item(0).innerHTML;
              }
            });
          }
        }
        function Ba(e) {
          return {
            regex: 0 !== (e & Oa.f.Kv),
            wildcard: 0 !== (e & Oa.f.$r),
            wholeWord: 0 !== (e & Oa.f.Nv),
            caseSensitive: 0 !== (e & Oa.f.Or),
          };
        }
        function Ca(e) {
          e = new Uint8Array(e);
          e = new TextDecoder('utf-8').decode(e);
          e = new DOMParser().parseFromString(e, 'text/xml').getElementsByTagName('Font');
          var f = {};
          Array.prototype.slice.call(e).forEach(function (e) {
            var h = e.getAttribute('Family');
            h in f || (f[h] = {});
            var n = [];
            Array.prototype.slice.call(e.getElementsByTagName('Variation')).forEach(function (e) {
              e = e.innerHTML;
              n.push(e);
              if (e.includes('Regular') || e === h.replace(/\s+/g, '')) f[h].hasRegular = !0;
              e.includes('Bold') && (f[h].hasBold = !0);
              e.includes('Italic') && (f[h].hasItalic = !0);
            });
            db.push(new na(h, n));
          });
          Rb = Object.keys(f).filter(function (e) {
            return f[e].hasRegular && f[e].hasBold && f[e].hasItalic;
          });
        }
        e.r(ca);
        var Ga = e(0),
          Fa = e(52),
          Ka = e(7),
          Ia = e(496),
          za = e(39),
          Ha = e(77),
          Aa = e(2),
          ta = e(173),
          Ja = e(55),
          La = e(6),
          Ra = e(142),
          Oa = e(25),
          va = e(8),
          Ma = e(23),
          Pa = null,
          Qa = null,
          Ta = !1,
          Xa = !1,
          ib = {},
          Va = {},
          cb = {},
          Ua,
          hb = window.createPromiseCapability(),
          jb = [],
          db = [],
          Rb = [],
          Fb = {};
        ca['default'] = {
          Dka: r,
          Fka: f,
          V$: function (e) {
            return Object(Ga.b)(void 0, void 0, void 0, function () {
              var f, h, n, r, w, x, y, z;
              return Object(Ga.d)(this, function (aa) {
                switch (aa.label) {
                  case 0:
                    return (f = e.id), (h = e.isText), (n = e.pageNumber), (r = Ua.getDocument()), [4, r.he([n], void 0, !0)];
                  case 1:
                    return (
                      (w = aa.ca()),
                      (x = new TextEncoder()),
                      (y = x.encode('')),
                      (z = y.buffer),
                      Pa.postMessage(
                        {
                          cmd: 'deleteObject',
                          pdfFile: w,
                          pageNumber: n,
                          objectID: f,
                          isText: h,
                          tableData: z,
                        },
                        [z],
                      ),
                      [2]
                    );
                }
              });
            });
          },
          wqa: function (e) {
            return Object(Ga.b)(void 0, void 0, void 0, function () {
              var f, h, n, r, w, x, y, z, aa, ba, ca, ea, da;
              return Object(Ga.d)(this, function (fa) {
                switch (fa.label) {
                  case 0:
                    return (
                      (f = e.id),
                      (h = e.position),
                      (n = h.top),
                      (r = h.left),
                      (w = h.bottom),
                      (x = h.right),
                      (y = e.isText),
                      (z = e.pageNumber),
                      (aa = Ua.getDocument()),
                      [4, aa.he([z], void 0, !0)]
                    );
                  case 1:
                    return (
                      (ba = fa.ca()),
                      (ca = new TextEncoder()),
                      (ea = ca.encode('')),
                      (da = ea.buffer),
                      Pa.postMessage(
                        {
                          cmd: 'transformObject',
                          pdfFile: ba,
                          pageNumber: z,
                          objectID: f,
                          isText: y,
                          topVal: n,
                          leftVal: r,
                          bottomVal: w,
                          rightVal: x,
                          tableData: da,
                        },
                        [da],
                      ),
                      [2]
                    );
                }
              });
            });
          },
          G7: function (e, f) {
            return Object(Ga.b)(void 0, void 0, void 0, function () {
              var h, n, r, w, x, y, z, ba, ca, ea, da, fa, ha, ia, la;
              return Object(Ga.d)(this, function (ja) {
                switch (ja.label) {
                  case 0:
                    return (
                      (h = '<DOC><STORY><galleys></galleys>'),
                      (n = []),
                      (r = new DOMParser().parseFromString(f, 'text/html')),
                      r.documentElement.querySelectorAll('p').forEach(function (e, f) {
                        n[f] = e.innerHTML;
                      }),
                      n.forEach(function (e, f) {
                        e = new DOMParser().parseFromString(n[f], 'text/html').documentElement.querySelector('body');
                        e.childNodes.forEach(function (e) {
                          aa(e);
                        });
                        h += '<p>' + e.innerHTML + '</p>';
                      }),
                      (h += '</STORY></DOC>'),
                      (w = e.pageNumber),
                      (x = Ua.getDocument()),
                      (y = e.position),
                      (z = y.top),
                      (ba = y.left),
                      (ca = y.bottom),
                      (ea = y.right),
                      (da = e.defaultText),
                      (fa = e.font),
                      (ha = e.fontSize),
                      (ia = e.textColor),
                      [4, x.he([w], void 0, !0)]
                    );
                  case 1:
                    return (
                      (la = ja.ca()),
                      Pa.postMessage({
                        cmd: 'insertNewTextBox',
                        pdfFile: la,
                        pageNumber: w,
                        topVal: z,
                        leftVal: ba,
                        bottomVal: ca,
                        rightVal: ea,
                        defaultText: da,
                        font: fa,
                        fontSize: ha,
                        textColor: ia,
                        importData: h,
                        content: f,
                      }),
                      [2]
                    );
                }
              });
            });
          },
          Pqa: n,
          sea: fa,
          Pma: function (e) {
            return Object(Ga.b)(this, void 0, void 0, function () {
              var h,
                w,
                x,
                y,
                z,
                aa,
                ba,
                ca,
                ea,
                da,
                ha,
                ia,
                la,
                ja,
                ka,
                ma,
                ua,
                na,
                xa,
                ya,
                sa,
                oa,
                pa = this;
              return Object(Ga.d)(this, function (qa) {
                switch (qa.label) {
                  case 0:
                    h = e.replaceWith;
                    w = e.documentViewer;
                    x = e.search;
                    y = e.searchResults;
                    if (w) {
                      if (!y && !x) throw Error('The "searchResults" parameter is missing in the options');
                      if (void 0 === h) throw Error('The "replaceWith" parameter should not be undefined');
                    } else throw Error('The "documentViewer" parameter is missing in the options');
                    z = 1 === y.length;
                    x ? ((aa = x.i9), (ba = x.nra)) : ((ca = Ba(w.nK())), (aa = ca.i9), (ba = ca.nra));
                    ea = null;
                    da = [];
                    if (z) (ea = y[0]), (da = [ea.pageNum]);
                    else
                      try {
                        da = Object.keys(
                          y.reduce(function (e, f) {
                            e[f.pageNum] = f.pageNum;
                            return e;
                          }, {}),
                        ).map(function (e) {
                          return Number(e);
                        });
                      } catch (gd) {
                        Object(Aa.i)(gd);
                      }
                    ha = 0;
                    if (ea)
                      for (
                        ia = w.Gk(), la = -1, ja = 0, ka = ia.length;
                        ja < ka && ((ma = ia[ja]), ma.pageNum === la ? ha++ : ((la = ma.pageNum), (ha = 0)), !Object(Ra.a)(ma, ea));
                        ja++
                      );
                    ua = y[0].resultStr;
                    na = aa ? 'mg' : 'mgi';
                    xa = ba ? '\\b(' + ua + ')\\b' : '(' + ua + ')';
                    ya = new RegExp('(?<!</?[^>]*|&[^;]*)' + xa, na);
                    hb = window.createPromiseCapability();
                    return Qa ? [3, 2] : [4, r(w)];
                  case 1:
                    qa.ca(), (qa.label = 2);
                  case 2:
                    return (
                      (Ta = !0),
                      Ja.a.trigger(va.e.SEARCH_AND_REPLACE_STARTED),
                      (sa = 0),
                      (oa = da.map(function (e) {
                        return Object(Ga.b)(pa, void 0, void 0, function () {
                          var r,
                            x = this;
                          return Object(Ga.d)(this, function () {
                            r = new Promise(function (r, aa) {
                              return Object(Ga.b)(x, void 0, void 0, function () {
                                var x = this;
                                return Object(Ga.d)(this, function (ba) {
                                  switch (ba.label) {
                                    case 0:
                                      return (jb[e] = window.createPromiseCapability()), [4, f(w.getDocument(), e, !0)];
                                    case 1:
                                      return (
                                        ba.ca(),
                                        jb[e].promise
                                          .then(function () {
                                            return Object(Ga.b)(x, void 0, void 0, function () {
                                              function f(e, f) {
                                                return Object(Ga.b)(this, void 0, void 0, function () {
                                                  var h, w;
                                                  return Object(Ga.d)(this, function (x) {
                                                    switch (x.label) {
                                                      case 0:
                                                        (h = Object(Ma.f)()),
                                                          (Fb[h] = function () {
                                                            delete Fb[h];
                                                            r(!0);
                                                            Ja.a.trigger(va.e.SEARCH_AND_REPLACE_TEXT_REPLACED);
                                                          }),
                                                          (x.label = 1);
                                                      case 1:
                                                        return x.og.push([1, 3, , 4]), [4, n(e, f, !0, h)];
                                                      case 2:
                                                        return x.ca(), [3, 4];
                                                      case 3:
                                                        return (w = x.ca()), Object(Aa.i)(w), aa(w), [3, 4];
                                                      case 4:
                                                        return [2];
                                                    }
                                                  });
                                                });
                                              }
                                              var w, x, ba, ca, da, ia, la, ja, ka, ma, na, xa, oa, pa, qa, ra, Fa;
                                              return Object(Ga.d)(this, function () {
                                                w = Ua.qa();
                                                x = w
                                                  .ub()
                                                  .filter(function (f) {
                                                    return f.PageNumber === e;
                                                  })
                                                  .filter(function (e) {
                                                    return e.af();
                                                  })
                                                  .concat();
                                                ba = [];
                                                da = ca = 0;
                                                for (ia = x.length; da < ia; da++) {
                                                  la = x[da];
                                                  ja = la.rf;
                                                  ka = fa(ja);
                                                  ma = [];
                                                  try {
                                                    for (na = void 0; null !== (na = ya.exec(ka)); ) ma.push(na), ba.push(y[sa]), sa++;
                                                  } catch (wd) {
                                                    Object(Aa.i)(wd);
                                                  }
                                                  if (ma.length)
                                                    if (((ca += ma.length), z && ca > ha)) {
                                                      xa = Math.abs(ca - ma.length - ha);
                                                      oa = ma[xa].index;
                                                      pa = ka.substr(0, oa);
                                                      qa = h;
                                                      ra = ka.substr(oa + ua.length, ka.length);
                                                      Fa = '' + pa + qa + ra;
                                                      Ja.a.trigger(va.e.SEARCH_AND_REPLACE_TEXT_FOUND, [[ea]]);
                                                      f(la, Fa);
                                                      break;
                                                    } else
                                                      z ||
                                                        ((Xa = !0),
                                                        (Fa = ka.replace(ya, h)),
                                                        Ja.a.trigger(va.e.SEARCH_AND_REPLACE_TEXT_FOUND, [ba]),
                                                        f(la, Fa));
                                                }
                                                return [2];
                                              });
                                            });
                                          })
                                          .catch(aa),
                                        [2]
                                      );
                                  }
                                });
                              });
                            });
                            return [2, r];
                          });
                        });
                      })),
                      [
                        2,
                        Promise.all(oa).then(function () {
                          z && ea
                            ? setTimeout(function () {
                                var e = [];
                                w.Jz(y[0].resultStr, w.nK(), {
                                  startPage: da[0],
                                  endPage: da[0],
                                  fullSearch: !0,
                                  onDocumentEnd: function () {
                                    Xa = Ta = !1;
                                    Ja.a.trigger(va.e.SEARCH_AND_REPLACE_ENDED);
                                    w.VO(da[0] - 1, e);
                                  },
                                  onResult: function (f) {
                                    f.resultCode === Oa.e.Cn && e.push(f);
                                  },
                                });
                              }, 200)
                            : (w.DT(), w.cn(), w.ye(), (Xa = Ta = !1), Ja.a.trigger(va.e.SEARCH_AND_REPLACE_ENDED));
                          var e = Ua.qa(),
                            f = e.ub().filter(function (e) {
                              return e.af();
                            });
                          e.zf(f, { force: !0, source: 'contentEditTool' });
                        }),
                      ]
                    );
                }
              });
            });
          },
          xna: function (e, f) {
            var h = da(e.rf.contents);
            h = new DOMParser().parseFromString(h, 'text/html').documentElement.querySelector('body');
            var r = h.querySelectorAll('p'),
              w = new XMLSerializer();
            r.forEach(function (e) {
              e.style.fontFamily = f;
            });
            h = w.serializeToString(h);
            n(e, h);
          },
          yna: function (e, f) {
            var h = da(e.rf.contents);
            h = new DOMParser().parseFromString(h, 'text/html').documentElement.querySelector('body');
            var r = h.querySelectorAll('p'),
              w = new XMLSerializer();
            r.forEach(function (e) {
              e.style.fontSize = f;
            });
            h = w.serializeToString(h);
            n(e, h);
          },
          S7: function (e, f) {
            return Object(Ga.b)(void 0, void 0, void 0, function () {
              var h, n, r, w, x, y, z;
              return Object(Ga.d)(this, function (aa) {
                switch (aa.label) {
                  case 0:
                    return (h = e.rf.id), (n = e.PageNumber), (r = Ua.getDocument()), [4, r.he([n], void 0, !0)];
                  case 1:
                    return (
                      (w = aa.ca()),
                      (x = new TextEncoder()),
                      (y = x.encode('')),
                      (z = y.buffer),
                      Pa.postMessage(
                        {
                          cmd: 'AlignParaText',
                          pdfFile: w,
                          pageNumber: n,
                          galleyID: h,
                          alignment: f,
                          topVal1: '',
                          leftVal1: '',
                          bottomVal1: '',
                          rightVal1: '',
                          topVal2: '',
                          leftVal2: '',
                          bottomVal2: '',
                          rightVal2: '',
                          tableData: z,
                        },
                        [z],
                      ),
                      [2]
                    );
                }
              });
            });
          },
          J8: function (e) {
            var f = da(e.rf.contents);
            f = new DOMParser().parseFromString(f, 'text/html').documentElement.querySelector('body');
            var h = f.querySelectorAll('p'),
              r = new XMLSerializer(),
              w = 'bold' === h[0].style.fontWeight,
              x = r.serializeToString(h[0]).includes('<strong>');
            h.forEach(function (e) {
              if (w || x) {
                e.style.fontWeight = 'normal';
                var f = r.serializeToString(e).replace(/<strong>/g, '');
                f = f.replace(/<\/strong>/g, '');
                f = new DOMParser().parseFromString(f, 'text/html').documentElement.querySelector('p');
                e.parentElement.replaceChild(f, e);
              } else (e.style.fontWeight = 'bold'), (e.innerHTML = '<strong>' + e.innerHTML.trim() + '</strong>');
            });
            f = r.serializeToString(f);
            n(e, f);
          },
          kia: function (e) {
            var f = da(e.rf.contents);
            f = new DOMParser().parseFromString(f, 'text/html').documentElement.querySelector('body');
            var h = f.querySelectorAll('p'),
              r = new XMLSerializer(),
              w = 'italic' === h[0].style.fontStyle,
              x = r.serializeToString(h[0]).includes('<em>');
            h.forEach(function (e) {
              if (w || x) {
                e.style.fontStyle = 'normal';
                e.style.font.includes('Italic') && (e.style.font = e.style.font.replace('Italic', ''));
                var f = r.serializeToString(e).replace(/<em>/g, '');
                f = f.replace(/<\/em>/g, '');
                f = new DOMParser().parseFromString(f, 'text/html').documentElement.querySelector('p');
                e.parentElement.replaceChild(f, e);
              } else (e.style.fontStyle = 'italic'), (e.innerHTML = '<em>' + e.innerHTML.trim() + '</em>');
            });
            f = r.serializeToString(f);
            n(e, f);
          },
          Cqa: function (e) {
            var f = da(e.rf.contents);
            f = new DOMParser().parseFromString(f, 'text/html').documentElement.querySelector('body');
            var h = f.querySelectorAll('p'),
              r = new XMLSerializer(),
              w = h[0].style.textDecoration.includes('underline') || h[0].style.textDecoration.includes('word'),
              x = r.serializeToString(h[0]).includes('<u>');
            h.forEach(function (e) {
              if (w || x) {
                e.style.textDecoration = e.style.textDecoration.replace('underline', '');
                var f = r.serializeToString(e).replace(/<u>/g, '');
                f = f.replace(/<\/u>/g, '');
                f = new DOMParser().parseFromString(f, 'text/html').documentElement.querySelector('p');
                e.parentElement.replaceChild(f, e);
              } else
                e.style.textDecoration.includes('none')
                  ? (e.style.textDecoration = e.style.textDecoration.replace('none', 'underline'))
                  : (e.style.textDecoration += ' underline'),
                  (e.innerHTML = '<u>' + e.innerHTML.trim() + '</u>');
            });
            f = r.serializeToString(f);
            n(e, f);
          },
          opa: function (e, f) {
            var h = da(e.rf.contents);
            h = new DOMParser().parseFromString(h, 'text/html').documentElement.querySelector('body');
            var r = h.querySelectorAll('p'),
              w = new XMLSerializer();
            r.forEach(function (e) {
              e.style.color = f;
            });
            h.querySelectorAll('span').forEach(function (e) {
              e.setAttribute('style', 'color:' + f);
            });
            h = w.serializeToString(h);
            n(e, h);
          },
          eea: function () {
            return Rb;
          },
          E7: function (e) {
            return Object(Ga.b)(void 0, void 0, void 0, function () {
              var f, h, n, r, w, x, y, z, aa, ba;
              return Object(Ga.d)(this, function (ca) {
                switch (ca.label) {
                  case 0:
                    return (
                      (f = e.pageNumber),
                      (h = e.newImage),
                      (n = e.scaleType),
                      (r = e.position),
                      (w = r.top),
                      (x = r.left),
                      (y = r.bottom),
                      (z = r.right),
                      (aa = Ua.getDocument()),
                      [4, aa.he([f], void 0, !0)]
                    );
                  case 1:
                    return (
                      (ba = ca.ca()),
                      Pa.postMessage(
                        {
                          cmd: 'insertImage',
                          pdfFile: ba,
                          pageNumber: f,
                          newImage: h,
                          scaleType: n,
                          topVal: w,
                          leftVal: x,
                          bottomVal: y,
                          rightVal: z,
                        },
                        [],
                      ),
                      [2]
                    );
                }
              });
            });
          },
        };
      },
    },
  ]);
}).call(this || window);
