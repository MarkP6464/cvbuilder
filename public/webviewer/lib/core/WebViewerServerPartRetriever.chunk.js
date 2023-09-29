/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function () {
  (window.wpCoreControlsBundle = window.wpCoreControlsBundle || []).push([
    [14],
    {
      468: function (ia, ca, e) {
        function ea() {
          return !1;
        }
        function fa(e, f, h) {
          if (!(f in ka)) return !0;
          f = ka[f];
          for (var n = 0; n < f.length; n++) {
            var r = e;
            var w = f[n];
            var x = h;
            if (w.name in r) {
              var y = '',
                z = !1;
              r = r[w.name];
              switch (w.type) {
                case 's':
                  y = 'String';
                  z = Object(aa.isString)(r);
                  break;
                case 'a':
                  y = 'Array';
                  z = Object(aa.isArray)(r);
                  break;
                case 'n':
                  y = 'Number';
                  z = Object(aa.isNumber)(r) && Object(aa.isFinite)(r);
                  break;
                case 'o':
                  (y = 'Object'), (z = Object(aa.isObject)(r) && !Object(aa.isArray)(r));
              }
              z || x.reject('Expected response field "' + w.name + '" to have type ' + y);
              w = z;
            } else x.reject('Response missing field "' + w.name + '"'), (w = !1);
            if (!w) return !1;
          }
          return !0;
        }
        function da(e) {
          for (
            var f = 0, h = ['locale', 'excelMaxAllowedCellCount', 'applyPageBreaksToSheet', 'excelDefaultCellBorderWidth', 'displayChangeTracking'];
            f < h.length;
            f++
          ) {
            var n = h[f],
              r = n;
            n = n.charAt(0).toUpperCase() + n.slice(1);
            e[r] && (Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(e, r)), delete e[r]);
          }
          return e;
        }
        e.r(ca);
        var ba = e(0),
          aa = e(1);
        e.n(aa);
        var y = e(2);
        ia = e(48);
        var x = e(23),
          w = e(485),
          n = e(100),
          h = e(395),
          f = e(43),
          r = e(178),
          z = (function () {
            function e() {
              this.request = this.result = null;
              this.state = 0;
              var e = this;
              e.promise = new Promise(function (f, h) {
                e.resolve = function () {
                  if (0 === e.state || 4 === e.state) (e.state = 1), (e.result = arguments[0]), f.apply(null, arguments);
                };
                e.reject = function () {
                  if (0 === e.state || 4 === e.state) (e.state = 2), h.apply(null, arguments);
                };
              });
            }
            e.prototype.fu = function () {
              return 1 === (this.state & 1);
            };
            e.prototype.Uha = function () {
              return 2 === (this.state & 2);
            };
            e.prototype.nj = function () {
              return !this.Uha() && !this.fu();
            };
            e.prototype.uha = function () {
              return 4 === (this.state & 4);
            };
            e.prototype.WN = function () {
              this.state |= 4;
            };
            return e;
          })(),
          ha = (function () {
            function e() {
              this.Nt = {};
              this.Ub = [];
            }
            e.prototype.pop = function () {
              var e = this.Ub.pop();
              this.Nt[e.key] = void 0;
              return e;
            };
            e.prototype.push = function (e, f) {
              f = { key: e, data: f };
              this.Ub.push(f);
              this.Nt[e] = f.data;
            };
            e.prototype.contains = function (e) {
              return !!this.Nt[e];
            };
            e.prototype.get = function (e) {
              return this.Nt[e];
            };
            e.prototype.set = function (e, f) {
              var h = this;
              this.Nt[e] = f;
              this.Ub.forEach(function (f, n) {
                f.key === e && (h.Ub[n] = f);
              });
            };
            e.prototype.remove = function (e) {
              var f = this;
              this.Nt[e] = void 0;
              this.Ub.forEach(function (h, n) {
                h.key === e && f.Ub.splice(n, 1);
              });
            };
            e.prototype.length = function () {
              return this.Ub.length;
            };
            return e;
          })(),
          ka = {
            pages: [{ name: 'pages', type: 'a' }],
            pdf: [{ name: 'url', type: 's' }],
            docmod: [
              { name: 'url', type: 's' },
              { name: 'rID', type: 's' },
            ],
            health: [],
            tiles: [
              { name: 'z', type: 'n' },
              { name: 'rID', type: 'n' },
              { name: 'tiles', type: 'a' },
              { name: 'size', type: 'n' },
            ],
            cAnnots: [{ name: 'annots', type: 'a' }],
            annots: [
              { name: 'url', type: 's' },
              { name: 'name', type: 's' },
            ],
            image: [
              { name: 'url', type: 's' },
              { name: 'name', type: 's' },
              { name: 'p', type: 'n' },
            ],
            text: [
              { name: 'url', type: 's' },
              { name: 'name', type: 's' },
              { name: 'p', type: 'n' },
            ],
            ApString2Xod: [
              { name: 'url', type: 's' },
              { name: 'rID', type: 's' },
            ],
          };
        e = (function () {
          function e(e, h, n) {
            var r = this;
            this.CO = this.zU = !1;
            this.Dh = this.wG = this.uv = this.Jf = this.uu = this.KI = this.wn = null;
            this.Ym = new z();
            this.jq = new z();
            this.qC = !1;
            this.Rf = this.Pe = this.Qe = this.If = null;
            this.ng = [];
            this.cD = [];
            this.cache = {};
            this.timeStamp = 0;
            this.yh = [];
            this.xj = [];
            this.SJ = null;
            this.nU = !1;
            this.a0 = this.id = null;
            this.dM = this.XW = ea;
            this.xi = 0;
            this.dL = !1;
            this.EY = 1;
            this.tj = {};
            this.Fs = 0;
            this.Iu = new ha();
            h.endsWith('/') || (h += '/');
            n = n || {};
            this.zU = n.disableWebsockets || !1;
            this.CO = n.singleServerMode || !1;
            null != n.customQueryParameters && Object(f.b)('wvsQueryParameters', n.customQueryParameters);
            h.endsWith('blackbox/') || (h += 'blackbox/');
            this.wn = n.uploadData || null;
            this.uv = n.uriData || null;
            this.KI = n.cacheKey || null;
            if ((this.uu = n.officeOptions || null)) this.uu = da(this.uu);
            this.Jf = n.rasterizerOptions || null;
            this.lf = h;
            this.vJ = e;
            this.fp(!0);
            this.Vs = new w.a(h, null, this.ii()).yda(
              !this.zU,
              function (e) {
                r.pja(e);
              },
              function () {
                return null;
              },
              function () {
                r.qC = !1;
              },
              function () {
                r.yma();
              },
            );
          }
          e.prototype.aaa = function () {
            var e = this;
            return new Promise(function (f, h) {
              var n = new XMLHttpRequest();
              n.open('GET', e.lf + 'ck');
              n.withCredentials = e.ii();
              n.onreadystatechange = function () {
                n.readyState === XMLHttpRequest.DONE && (200 === n.status ? f() : h());
              };
              n.send();
            });
          };
          e.prototype.roa = function (e) {
            this.XW = e || ea;
            this.dM = ea;
          };
          e.prototype.J9 = function () {
            this.E_();
            return this.Vs.wq(!0);
          };
          e.prototype.E_ = function () {
            Object(ba.b)(this, void 0, void 0, function () {
              return Object(ba.d)(this, function (e) {
                switch (e.label) {
                  case 0:
                    return (this.jq = new z()), (this.Ym = new z()), (this.qC = !1), (this.id = null), (this.nU = !1), [4, this.aaa()];
                  case 1:
                    return e.ca(), [2];
                }
              });
            });
          };
          e.prototype.yma = function () {
            this.XW();
            this.E_();
            this.If && (this.If.nj() ? this.Jh(this.If.request) : this.If.fu() && this.dM(this.If.result.url, 'pdf') && ((this.If = null), this.D_()));
            this.Rf && this.Rf.nj() && this.Jh(this.Rf.request);
            this.Qe && this.Qe.nj() ? this.Jh(this.Qe.request) : this.Pe && this.Pe.nj() && this.KW();
            var e;
            for (e = 0; e < this.yh.length; e++)
              this.yh[e] &&
                (this.yh[e].nj()
                  ? this.Jh(this.yh[e].request)
                  : this.yh[e].fu() && this.dM(this.yh[e].result.url, 'image') && ((this.yh[e] = null), this.wF(Object(aa.uniqueId)(), e)));
            for (e = 0; e < this.xj.length; e++) this.xj[e] && this.xj[e].nj() && !this.xj[e].uha() && this.Jh(this.xj[e].request);
            for (e = 0; e < this.ng.length; e++) this.ng[e] && this.ng[e].nj() && this.Jh(this.ng[e].request);
          };
          e.prototype.aha = function () {
            return this.qC ? Promise.resolve() : ((this.qC = !0), (this.timeStamp = Date.now()), this.Vs.bE());
          };
          e.prototype.Vqa = function () {
            var e = this,
              f,
              h,
              n,
              w,
              y;
            return new Promise(function (aa, z) {
              if (e.wn)
                (f = new FormData()), f.append('file', e.wn.fileHandle, e.wn.fileHandle.name), (h = e.wn.loadCallback), (w = 'upload'), (n = e.wn.extension);
              else if (e.uv)
                (f = { uri: e.uv.uri, gva: e.uv.shareId }),
                  (f = Object.keys(f)
                    .map(function (e) {
                      return e + '=' + (f[e] ? encodeURIComponent(f[e]) : '');
                    })
                    .join('&')),
                  (y = 'application/x-www-form-urlencoded; charset=UTF-8'),
                  (h = e.uv.loadCallback),
                  (w = 'url'),
                  (n = e.uv.extension);
              else {
                aa();
                return;
              }
              var ba = new XMLHttpRequest(),
                ca = Object(x.k)(e.lf, 'AuxUpload');
              ca = Object(r.a)(ca, { type: w, ext: n });
              ba.open('POST', ca);
              ba.withCredentials = e.ii();
              y && ba.setRequestHeader('Content-Type', y);
              ba.addEventListener('load', function () {
                if (ba.readyState === ba.DONE && 200 === ba.status) {
                  var f = JSON.parse(ba.response);
                  e.vJ = f.uri;
                  h(f);
                  aa(f);
                }
              });
              ba.addEventListener('error', function () {
                z(ba.statusText + ' ' + JSON.stringify(ba));
              });
              e.wn &&
                null != e.wn.onProgress &&
                (ba.upload.onprogress = function (f) {
                  e.wn.onProgress(f);
                });
              ba.send(f);
            });
          };
          e.prototype.pma = function (e) {
            this.password = e || null;
            this.Ym.fu() || ((this.Ym = new z()), this.Jh({ t: 'pages' }));
            return this.Ym.promise;
          };
          e.prototype.az = function (e) {
            this.SJ = e || null;
            this.Ym.fu() || this.Jh({ t: 'pages' });
            return this.Ym.promise;
          };
          e.prototype.Ow = function (e) {
            e = Object.assign(e, { uri: encodeURIComponent(this.vJ) });
            this.SJ && (e.ext = this.SJ);
            this.Dh && (e.c = this.Dh);
            this.password && (e.pswd = this.password);
            this.KI && (e.cacheKey = this.KI);
            this.uu && (e.officeOptions = this.uu);
            this.Jf && (e.rastOptions = this.Jf);
            return e;
          };
          e.prototype.Xma = function () {
            0 < this.Iu.length() && 10 >= this.Fs && this.Yma(this.Iu.pop().data);
          };
          e.prototype.g9 = function (e) {
            0 < this.Iu.length() && this.Iu.contains(e) && this.Iu.remove(e);
          };
          e.prototype.Jh = function (e) {
            e = this.Ow(e);
            this.Vs.send(e);
          };
          e.prototype.W_ = function (e, f) {
            10 < this.Fs ? this.Iu.push(e, f) : (this.Fs++, (e = this.Ow(f)), this.Vs.send(e));
          };
          e.prototype.Yma = function (e) {
            this.Fs++;
            e = this.Ow(e);
            this.Vs.send(e);
          };
          e.prototype.am = function (e) {
            return e;
          };
          e.prototype.WW = function (e) {
            this.CO && e
              ? Object(y.j)('Server failed health check. Single server mode ignoring check.')
              : !this.zta && e && 3 >= this.xi
              ? ((this.dL = !0), this.Vs.wq())
              : 3 < this.xi && (this.CO = !0);
          };
          e.prototype.pja = function (e) {
            var h = this,
              w = e.data,
              x = e.err,
              ba = e.t;
            switch (ba) {
              case 'upload':
                x ? this.Wqa.reject(x) : this.Wqa.resolve('Success');
                break;
              case 'pages':
                x ? this.Ym.reject(x) : fa(w, ba, this.Ym) && this.Ym.resolve(w);
                break;
              case 'config':
                if (x) this.jq.reject(x);
                else if (fa(w, ba, this.jq)) {
                  this.WW(w.unhealthy);
                  w.id && (this.id = w.id);
                  if (w.auth) {
                    var ca = Object(f.a)('wvsQueryParameters');
                    ca.auth = w.auth;
                    Object(f.b)('wvsQueryParameters', ca);
                  }
                  w.serverVersion && ((this.wG = w.serverVersion), Object(y.h)('[WebViewer Server] server version: ' + this.wG));
                  w.serverID ? ((this.xi = w.serverID === this.a0 && this.dL ? this.xi + 1 : 0), (this.a0 = w.serverID)) : (this.xi = 0);
                  this.dL = !1;
                  this.jq.resolve(w);
                }
                break;
              case 'health':
                x ? this.jq.reject(x) : fa(w, ba, this.jq) && this.WW(w.unhealthy);
                break;
              case 'pdf':
                w.url = Object(r.a)(this.lf + '../' + encodeURI(w.url));
                x ? this.If.reject(x) : fa(w, ba, this.If) && this.If.resolve(w);
                break;
              case 'ApString2Xod':
                w.url = Object(r.a)(this.lf + '../data/' + encodeURI(w.url));
                x ? this.tj[w.rID].reject(x) : fa(w, ba, this.tj[w.rID]) && this.tj[w.rID].resolve(w);
                break;
              case 'docmod':
                w.url = Object(r.a)(this.lf + '../' + encodeURI(w.url));
                x ? this.tj[w.rID].reject(x) : fa(w, ba, this.If) && this.tj[w.rID].resolve(w);
                break;
              case 'xod':
                if (x) this.Qe && this.Qe.nj() && this.Qe.reject(x), this.Pe && this.Pe.nj() && this.Pe.reject(x);
                else if (w.notFound) w.noCreate || (this.Qe && this.Qe.nj() && this.Qe.resolve(w)), this.Pe && this.Pe.nj() && this.Pe.resolve(w);
                else {
                  w.url && (w.url = Object(r.a)(this.lf + '../' + encodeURI(w.url)));
                  if (!this.Pe || this.Pe.fu()) (this.Pe = new z()), (this.Pe.request = { t: 'xod', noCreate: !0 });
                  this.Qe || ((this.Qe = new z()), (this.Qe.request = { t: 'xod' }));
                  this.Pe.resolve(w);
                  this.Qe.resolve(w);
                }
                break;
              case 'cAnnots':
                ca = this.Rf;
                if (x) ca.reject(x);
                else if (fa(w, ba, ca)) {
                  ca.WN();
                  var da = [],
                    ea = w.annots;
                  w = function (e) {
                    var f = ea[e].s,
                      n = ea[e].e,
                      w = ha.lf + '../' + encodeURI(ea[e].xfdf),
                      x = 'true' === ea[e].hasAppearance ? Object(r.a)(w + '.xodapp') : null,
                      y = Object(aa.range)(f, n + 1);
                    da[e] = {
                      range: y,
                      promise: new Promise(function (e, f) {
                        var n = new XMLHttpRequest();
                        n.open('GET', Object(r.a)(w));
                        n.responseType = 'text';
                        n.withCredentials = h.ii();
                        n.addEventListener('load', function () {
                          n.readyState === n.DONE && 200 === n.status && e({ Nr: n.response, Ql: x, range: y });
                        });
                        n.addEventListener('error', function () {
                          f(n.statusText + ' ' + JSON.stringify(n));
                        });
                        n.send();
                      }),
                    };
                  };
                  var ha = this;
                  for (x = 0; x < ea.length; x++) w(x);
                  ca.resolve(da);
                }
                break;
              case 'annots':
                if (x) this.Rf.reject(x);
                else if (fa(w, ba, this.Rf)) {
                  this.Rf.WN();
                  var ia = new XMLHttpRequest();
                  ca = this.lf + '../' + encodeURI(w.url);
                  var ja = w.hasAppearance ? Object(r.a)(ca + '.xodapp') : null;
                  ia.open('GET', Object(r.a)(ca));
                  ia.responseType = 'text';
                  ia.withCredentials = this.ii();
                  ia.addEventListener('load', function () {
                    ia.readyState === ia.DONE && 200 === ia.status && h.Rf.resolve({ Nr: ia.response, Ql: ja });
                  });
                  ia.addEventListener('error', function () {
                    h.Rf.reject(ia.statusText + ' ' + JSON.stringify(ia));
                  });
                  ia.send();
                }
                break;
              case 'image':
                this.Fs--;
                var ka = this.yh[w.p];
                x
                  ? ka.promise.reject(x)
                  : fa(w, ba, ka) && ((ka.result = w), (ka.result.url = Object(r.a)(this.lf + '../' + encodeURI(ka.result.url))), ka.resolve(ka.result));
                break;
              case 'tiles':
                this.Fs--;
                ka = w.rID;
                ca = this.ng[ka];
                this.ng[ka] = null;
                this.cD.push(ka);
                if (x) ca.reject(x);
                else if (fa(w, ba, ca)) {
                  for (x = 0; x < w.tiles.length; x++) w.tiles[x] = Object(r.a)(this.lf + '../' + encodeURI(w.tiles[x]));
                  ca.resolve(w);
                }
                break;
              case 'text':
                ka = this.xj[w.p];
                if (x) ka.reject(x);
                else if (fa(w, ba, ka)) {
                  ka.WN();
                  var na = new XMLHttpRequest();
                  w = Object(r.a)(this.lf + '../' + encodeURI(w.url));
                  na.open('GET', w);
                  na.withCredentials = this.ii();
                  na.addEventListener('load', function () {
                    na.readyState === na.DONE && 200 === na.status && ((ka.result = JSON.parse(na.response)), ka.resolve(ka.result));
                  });
                  na.addEventListener('error', function (e) {
                    ka.reject(na.statusText + ' ' + JSON.stringify(e));
                  });
                  na.send();
                }
                break;
              case 'progress':
                'loading' === w.t && this.trigger(n.a.Events.DOCUMENT_LOADING_PROGRESS, [w.bytes, w.total]);
            }
            this.Xma();
            !ba &&
              e.echo &&
              e &&
              'apstring2xod' === e.echo.t &&
              (e = e.echo.reqID) &&
              (2 <= parseInt(this.wG, 10) ? this.tj[e].reject('Message unhandled by server') : this.tj[e].reject());
          };
          e.prototype.dea = function () {
            return Object(ba.b)(this, void 0, void 0, function () {
              return Object(ba.d)(this, function (e) {
                switch (e.label) {
                  case 0:
                    return [4, this.aha()];
                  case 1:
                    return e.ca(), [2, this.jq.promise];
                }
              });
            });
          };
          e.prototype.Kda = function (e) {
            for (
              var f = this, h = new XMLHttpRequest(), n = Object(r.a)(this.lf + 'aul', { id: this.id }), w = new FormData(), x = {}, y = 0;
              y < e.body.length;
              y++
            ) {
              var aa = e.body[y];
              x[aa.id] = aa.xI.w + ';' + aa.xI.h;
              w.append(aa.id, aa.xI.dataString);
            }
            e = { t: 'apstring2xod', reqID: this.EY++, parts: x };
            var ba = this.Ow(e);
            w.append('msg', JSON.stringify(ba));
            this.tj[ba.reqID] = new z();
            h.open('POST', n);
            h.withCredentials = this.ii;
            n = new Promise(function (e, f) {
              h.onreadystatechange = function () {
                4 === h.readyState && (200 === h.status ? e() : f('An error occurred while sending down appearance strings to the server'));
              };
            });
            h.send(w);
            return n.then(function () {
              return f.tj[ba.reqID].promise;
            });
          };
          e.prototype.L9 = function () {
            var e = this.wG.split('-')[0].split('.'),
              f = ['1', '5', '9'];
            if (3 !== e.length) throw Error('Invalid WVS version length.');
            if (3 !== f.length) throw Error('Invalid version length.');
            for (var h = 0; h < e.length; ++h) {
              if (f.length === h || e[h] > f[h]) return -1;
              if (e[h] !== f[h]) return 1;
            }
            return 0;
          };
          e.prototype.fq = function () {
            return 0 >= this.L9();
          };
          e.prototype.bK = function () {
            this.Rf || ((this.Rf = new z()), this.fq() ? (this.Rf.request = { t: 'cAnnots' }) : (this.Rf.request = { t: 'annots' }), this.Jh(this.Rf.request));
            return this.Rf.promise;
          };
          e.prototype.wF = function (e, f) {
            this.yh[f] || ((this.yh[f] = new z()), (this.yh[f].request = { t: 'image', p: f }), this.W_(e, this.yh[f].request));
            return this.yh[f].promise;
          };
          e.prototype.qma = function (e) {
            this.xj[e] || ((this.xj[e] = new z()), (this.xj[e].request = { t: 'text', p: e }), this.Jh(this.xj[e].request));
            return this.xj[e].promise;
          };
          e.prototype.rma = function (e, f, h, n, r) {
            var w = this.ng.length;
            this.cD.length && (w = this.cD.pop());
            this.ng[w] = new z();
            this.ng[w].request = {
              t: 'tiles',
              p: f,
              z: h,
              r: n,
              size: r,
              rID: w,
            };
            this.W_(e, this.ng[w].request);
            return this.ng[w].promise;
          };
          e.prototype.D_ = function () {
            this.If || ((this.If = new z()), (this.If.request = { t: 'pdf' }), this.nU ? this.If.resolve({ url: this.vJ }) : this.Jh(this.If.request));
            return this.If.promise;
          };
          e.prototype.dW = function (e) {
            var f = this,
              h = new XMLHttpRequest(),
              n = Object(r.a)(this.lf + 'aul', { id: this.id }),
              w = new FormData(),
              x = {};
            e.annots && (x.annots = 'xfdf');
            e.watermark && (x.watermark = 'png');
            e.redactions && (x.redactions = 'redact');
            x = { t: 'docmod', reqID: this.EY++, parts: x };
            e.print && (x.print = !0);
            var y = this.Ow(x);
            w.append('msg', JSON.stringify(y));
            return Promise.all(
              [e.annots, e.watermark, e.redactions].map(function (e) {
                return Promise.resolve(e);
              }),
            ).then(function (e) {
              var r = e[0],
                x = e[1];
              e = e[2];
              r && w.append('annots', r);
              x && w.append('watermark', x);
              e && w.append('redactions', e);
              f.tj[y.reqID] = new z();
              h.open('POST', n);
              h.withCredentials = f.ii;
              r = new Promise(function (e, f) {
                h.onreadystatechange = function () {
                  4 === h.readyState && (200 === h.status ? e() : f('An error occurred while sending down annotation data to the server'));
                };
              });
              h.send(w);
              return r.then(function () {
                return f.tj[y.reqID].promise;
              });
            });
          };
          e.prototype.KW = function () {
            this.Pe || ((this.Pe = new z()), (this.Pe.request = { t: 'xod', noCreate: !0 }), this.Jh(this.Pe.request));
            return this.Pe.promise;
          };
          e.prototype.sma = function () {
            this.Qe || ((this.Qe = new z()), (this.Qe.request = { t: 'xod' }), this.Jh(this.Qe.request));
            return this.Qe.promise;
          };
          e.prototype.$o = function () {
            return !0;
          };
          e.prototype.request = function () {};
          e.prototype.XZ = function () {};
          e.prototype.abort = function () {
            for (var e = 0; e < this.ng.length; e++) this.ng[e] && (this.ng[e].resolve(null), (this.ng[e] = null), this.cD.push(e));
            this.close();
          };
          e.prototype.JF = function (e) {
            this.Dh = this.Dh || {};
            this.Dh.headers = e;
          };
          e.prototype.fp = function (e) {
            this.Dh = this.Dh || {};
            this.Dh.internal = this.Dh.internal || {};
            this.Dh.internal.withCredentials = e;
          };
          e.prototype.ii = function () {
            return this.Dh && this.Dh.internal ? this.Dh.internal.withCredentials : null;
          };
          e.prototype.getFileData = function () {
            return Promise.reject();
          };
          return e;
        })();
        Object(ia.a)(e);
        Object(h.a)(e);
        Object(h.b)(e);
        ca['default'] = e;
      },
      485: function (ia, ca, e) {
        var ea = e(0),
          fa = e(2),
          da = e(23),
          ba = e(43),
          aa = e(178),
          y = e(79),
          x = (function () {
            function e(e, f, n, w, x, y) {
              void 0 === n && (n = null);
              void 0 === w && (w = null);
              void 0 === x && (x = null);
              void 0 === y && (y = null);
              this.nY = !1;
              this.xi = 0;
              this.cT = this.sra(e);
              this.url = f ? this.cT + '/' + f : this.cT + '/ws';
              this.mJ = n;
              this.Cy = w;
              this.Mw = x;
              this.wN = y;
            }
            e.prototype.sra = function (e) {
              var f = e.indexOf('://'),
                h = 'ws://';
              0 > f ? (f = 0) : (5 === f && (h = 'wss://'), (f += 3));
              var n = e.lastIndexOf('/');
              0 > n && (n = e.length);
              return h + e.slice(f, n);
            };
            e.prototype.send = function (e) {
              this.sp.readyState === WebSocket.CLOSED || this.nY || this.sp.send(JSON.stringify(e));
            };
            e.prototype.bE = function () {
              return Object(ea.b)(this, void 0, void 0, function () {
                var e,
                  f = this;
                return Object(ea.d)(this, function () {
                  e = Object(ba.a)('wvsQueryParameters');
                  e.bcid = Object(da.l)(8);
                  Object(ba.b)('wvsQueryParameters', e);
                  return [
                    2,
                    new Promise(function (e, h) {
                      var n = Object(aa.a)(f.url);
                      f.sp = new WebSocket(n);
                      f.sp.onopen = function () {
                        f.Cy && f.Cy();
                        e();
                      };
                      f.sp.onerror = function (e) {
                        f.nY = !0;
                        h(e);
                      };
                      f.sp.onclose = function (e) {
                        var n = e.code;
                        return Object(ea.b)(f, void 0, void 0, function () {
                          var e = this;
                          return Object(ea.d)(this, function (f) {
                            switch (f.label) {
                              case 0:
                                return (
                                  this.Mw && this.Mw(),
                                  3e3 === n
                                    ? [3, 3]
                                    : 8 > this.xi++
                                    ? [
                                        4,
                                        new Promise(function (f) {
                                          return setTimeout(function () {
                                            return Object(ea.b)(e, void 0, void 0, function () {
                                              return Object(ea.d)(this, function (e) {
                                                switch (e.label) {
                                                  case 0:
                                                    return this.wN(), [4, this.bE()];
                                                  case 1:
                                                    return e.ca(), f(), [2];
                                                }
                                              });
                                            });
                                          }, 3e3);
                                        }),
                                      ]
                                    : [3, 2]
                                );
                              case 1:
                                return f.ca(), [3, 3];
                              case 2:
                                h(y.a), (f.label = 3);
                              case 3:
                                return [2];
                            }
                          });
                        });
                      };
                      f.sp.onmessage = function (e) {
                        e && e.data && ((e = JSON.parse(e.data)), e.hb ? f.send({ hb: !0 }) : e.end ? close() : f.mJ(e));
                      };
                    }),
                  ];
                });
              });
            };
            e.prototype.wq = function (e) {
              void 0 === e && (e = !1);
              this.xi = 0;
              e ? this.sp.close(3e3) : this.sp.close();
              return Promise.resolve();
            };
            return e;
          })(),
          w = (function () {
            function e(e, f, n, w, x, y, aa) {
              void 0 === w && (w = null);
              void 0 === x && (x = null);
              void 0 === y && (y = null);
              void 0 === aa && (aa = null);
              this.xi = this.vF = this.id = 0;
              this.Tx = !1;
              this.request = null;
              e = this.Oka(e);
              this.url = f ? e + '/' + f + 'pf' : e + '/pf';
              this.pG = n;
              this.mJ = w;
              this.Cy = x;
              this.Mw = y;
              this.wN = aa;
            }
            e.prototype.Oka = function (e) {
              var f = e.lastIndexOf('/');
              0 > f && (f = e.length);
              return e.slice(0, f);
            };
            e.prototype.K$ = function (e) {
              e = e.split('\n');
              for (e[e.length - 1] && e.pop(); 0 < e.length && 3 > e[e.length - 1].length; ) ']' === e.pop() && (this.id = 0);
              0 < e.length && 3 > e[0].length && e.shift();
              for (var f = 0; f < e.length; ++f) e[f].endsWith(',') && (e[f] = e[f].substr(0, e[f].length - 1));
              return e;
            };
            e.prototype.M_ = function () {
              return Object(ea.b)(this, void 0, void 0, function () {
                var e = this;
                return Object(ea.d)(this, function (f) {
                  switch (f.label) {
                    case 0:
                      return 8 > this.xi++
                        ? [
                            4,
                            new Promise(function (f) {
                              return setTimeout(function () {
                                e.wN();
                                e.bE();
                                f();
                              }, 3e3);
                            }),
                          ]
                        : [3, 2];
                    case 1:
                      f.ca(), (f.label = 2);
                    case 2:
                      return [2];
                  }
                });
              });
            };
            e.prototype.Qka = function (e) {
              Object(ea.b)(this, void 0, void 0, function () {
                var f, h;
                return Object(ea.d)(this, function (n) {
                  switch (n.label) {
                    case 0:
                      (f = null), (h = 0), (n.label = 1);
                    case 1:
                      if (!(h < e.length)) return [3, 6];
                      f = JSON.parse(e[h]);
                      if (!f) return [3, 5];
                      if (!f.end) return [3, 2];
                      close();
                      return [3, 5];
                    case 2:
                      if (!f.id || Number(f.id) === this.id) return [3, 4];
                      Object(fa.j)('Reconnecting, new server detected');
                      this.wq();
                      return [4, this.M_()];
                    case 3:
                      return n.ca(), [3, 5];
                    case 4:
                      f.hb && Number(f.id) === this.id ? this.send({ hb: !0 }) : this.Tx || this.mJ(f), (n.label = 5);
                    case 5:
                      return ++h, [3, 1];
                    case 6:
                      return [2];
                  }
                });
              });
            };
            e.prototype.mja = function (e) {
              Object(ea.b)(this, void 0, void 0, function () {
                var f, h, n;
                return Object(ea.d)(this, function (r) {
                  switch (r.label) {
                    case 0:
                      if (!(3 <= e.readyState)) return [3, 2];
                      try {
                        f = e.responseText.length;
                      } catch (ka) {
                        return Object(fa.h)('caught exception'), [2];
                      }
                      if (0 < f)
                        try {
                          (h = this.K$(e.responseText)),
                            0 === this.id && 0 < h.length && ((n = JSON.parse(h.shift())), (this.id = n.id), (this.xi = 0)),
                            this.Qka(h);
                        } catch (ka) {}
                      return this.Tx ? [3, 2] : [4, this.fV()];
                    case 1:
                      r.ca(), (r.label = 2);
                    case 2:
                      return [2];
                  }
                });
              });
            };
            e.prototype.fV = function () {
              return Object(ea.b)(this, void 0, void 0, function () {
                var e = this;
                return Object(ea.d)(this, function () {
                  return [
                    2,
                    new Promise(function (f, h) {
                      function n() {
                        return Object(ea.b)(e, void 0, void 0, function () {
                          return Object(ea.d)(this, function (e) {
                            switch (e.label) {
                              case 0:
                                h(), this.wq(), (e.label = 1);
                              case 1:
                                return this.Tx && 8 > this.xi ? [4, this.M_()] : [3, 3];
                              case 2:
                                return e.ca(), [3, 1];
                              case 3:
                                return [2];
                            }
                          });
                        });
                      }
                      e.request = new XMLHttpRequest();
                      e.request.withCredentials = e.pG;
                      var r = Object(aa.a)(e.url, 0 !== e.id ? { id: String(e.id), uc: String(e.vF) } : { uc: String(e.vF) });
                      e.vF++;
                      e.request.open('GET', r, !0);
                      e.request.setRequestHeader('Cache-Control', 'no-cache');
                      e.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                      e.request.onreadystatechange = function () {
                        e.mja(e.request);
                      };
                      e.request.addEventListener('error', n);
                      e.request.addEventListener('timeout', n);
                      e.request.addEventListener('load', function () {
                        e.Cy && e.Cy();
                        f();
                      });
                      e.request.send();
                    }),
                  ];
                });
              });
            };
            e.prototype.bE = function () {
              var e = Object(ba.a)('wvsQueryParameters');
              e.bcid = Object(da.l)(8);
              Object(ba.b)('wvsQueryParameters', e);
              this.vF = this.id = 0;
              this.Tx = !1;
              return this.fV();
            };
            e.prototype.send = function (e) {
              var f = this,
                h = new XMLHttpRequest();
              h.withCredentials = this.pG;
              var n = Object(aa.a)(this.url, { id: String(this.id) }),
                w = new FormData();
              w.append('data', JSON.stringify(e));
              h.addEventListener('error', function () {
                f.wq();
              });
              h.open('POST', n);
              h.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              h.send(w);
            };
            e.prototype.wq = function () {
              this.id = 0;
              this.Tx = !0;
              this.Mw && this.Mw();
              this.request.abort();
              return Promise.resolve();
            };
            return e;
          })();
        ia = (function () {
          function e(e, f, n) {
            this.KT = e;
            this.target = f;
            this.pG = n;
          }
          e.prototype.yda = function (e, f, n, y, aa) {
            void 0 === e && (e = !0);
            void 0 === f && (f = null);
            void 0 === n && (n = null);
            void 0 === y && (y = null);
            void 0 === aa && (aa = null);
            return e ? new x(this.KT, this.target, f, n, y, aa) : new w(this.KT, this.target, this.pG, f, n, y, aa);
          };
          return e;
        })();
        ca.a = ia;
      },
    },
  ]);
}).call(this || window);
