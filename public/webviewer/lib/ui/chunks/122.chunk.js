(window.webpackJsonp = window.webpackJsonp || []).push([
  [122],
  {
    1409: function (a, _, e) {
      a.exports = (function (a) {
        'use strict';
        var _ = (function (a) {
            return a && 'object' == typeof a && 'default' in a ? a : { default: a };
          })(a),
          e = {
            name: 'sw',
            weekdays: 'Jumapili_Jumatatu_Jumanne_Jumatano_Alhamisi_Ijumaa_Jumamosi'.split('_'),
            weekdaysShort: 'Jpl_Jtat_Jnne_Jtan_Alh_Ijm_Jmos'.split('_'),
            weekdaysMin: 'J2_J3_J4_J5_Al_Ij_J1'.split('_'),
            months: 'Januari_Februari_Machi_Aprili_Mei_Juni_Julai_Agosti_Septemba_Oktoba_Novemba_Desemba'.split('_'),
            monthsShort: 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ago_Sep_Okt_Nov_Des'.split('_'),
            weekStart: 1,
            ordinal: function (a) {
              return a;
            },
            relativeTime: {
              future: '%s baadaye',
              past: 'tokea %s',
              s: 'hivi punde',
              m: 'dakika moja',
              mm: 'dakika %d',
              h: 'saa limoja',
              hh: 'masaa %d',
              d: 'siku moja',
              dd: 'masiku %d',
              M: 'mwezi mmoja',
              MM: 'miezi %d',
              y: 'mwaka mmoja',
              yy: 'miaka %d',
            },
            formats: {
              LT: 'HH:mm',
              LTS: 'HH:mm:ss',
              L: 'DD.MM.YYYY',
              LL: 'D MMMM YYYY',
              LLL: 'D MMMM YYYY HH:mm',
              LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
          };
        return _.default.locale(e, null, !0), e;
      })(e(32));
    },
  },
]);
//# sourceMappingURL=122.chunk.js.map
