(window.webpackJsonp = window.webpackJsonp || []).push([
  [64],
  {
    1351: function (Y, M, _) {
      Y.exports = (function (Y) {
        'use strict';
        var M = (function (Y) {
            return Y && 'object' == typeof Y && 'default' in Y ? Y : { default: Y };
          })(Y),
          _ = {
            s: 'מספר שניות',
            ss: '%d שניות',
            m: 'דקה',
            mm: '%d דקות',
            h: 'שעה',
            hh: '%d שעות',
            hh2: 'שעתיים',
            d: 'יום',
            dd: '%d ימים',
            dd2: 'יומיים',
            M: 'חודש',
            MM: '%d חודשים',
            MM2: 'חודשיים',
            y: 'שנה',
            yy: '%d שנים',
            yy2: 'שנתיים',
          };
        function d(Y, M, d) {
          return (_[d + (2 === Y ? '2' : '')] || _[d]).replace('%d', Y);
        }
        var m = {
          name: 'he',
          weekdays: 'ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת'.split('_'),
          weekdaysShort: 'א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳'.split('_'),
          weekdaysMin: 'א׳_ב׳_ג׳_ד׳_ה׳_ו_ש׳'.split('_'),
          months: 'ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר'.split('_'),
          monthsShort: 'ינו_פבר_מרץ_אפר_מאי_יונ_יול_אוג_ספט_אוק_נוב_דצמ'.split('_'),
          relativeTime: {
            future: 'בעוד %s',
            past: 'לפני %s',
            s: d,
            m: d,
            mm: d,
            h: d,
            hh: d,
            d: d,
            dd: d,
            M: d,
            MM: d,
            y: d,
            yy: d,
          },
          ordinal: function (Y) {
            return Y;
          },
          format: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D [ב]MMMM YYYY',
            LLL: 'D [ב]MMMM YYYY HH:mm',
            LLLL: 'dddd, D [ב]MMMM YYYY HH:mm',
            l: 'D/M/YYYY',
            ll: 'D MMM YYYY',
            lll: 'D MMM YYYY HH:mm',
            llll: 'ddd, D MMM YYYY HH:mm',
          },
          formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D [ב]MMMM YYYY',
            LLL: 'D [ב]MMMM YYYY HH:mm',
            LLLL: 'dddd, D [ב]MMMM YYYY HH:mm',
            l: 'D/M/YYYY',
            ll: 'D MMM YYYY',
            lll: 'D MMM YYYY HH:mm',
            llll: 'ddd, D MMM YYYY HH:mm',
          },
        };
        return M.default.locale(m, null, !0), m;
      })(_(32));
    },
  },
]);
//# sourceMappingURL=64.chunk.js.map
