(window.webpackJsonp = window.webpackJsonp || []).push([
  [107],
  {
    1394: function (a, u, t) {
      a.exports = (function (a) {
        'use strict';
        var u = (function (a) {
            return a && 'object' == typeof a && 'default' in a ? a : { default: a };
          })(a),
          t = {
            name: 'rn',
            weekdays: 'Ku wa Mungu_Ku wa Mbere_Ku wa Kabiri_Ku wa Gatatu_Ku wa Kane_Ku wa Gatanu_Ku wa Gatandatu'.split('_'),
            weekdaysShort: 'Kngu_Kmbr_Kbri_Ktat_Kkan_Ktan_Kdat'.split('_'),
            weekdaysMin: 'K7_K1_K2_K3_K4_K5_K6'.split('_'),
            months: 'Nzero_Ruhuhuma_Ntwarante_Ndamukiza_Rusama_Ruhenshi_Mukakaro_Myandagaro_Nyakanga_Gitugutu_Munyonyo_Kigarama'.split('_'),
            monthsShort: 'Nzer_Ruhuh_Ntwar_Ndam_Rus_Ruhen_Muk_Myand_Nyak_Git_Muny_Kig'.split('_'),
            weekStart: 1,
            ordinal: function (a) {
              return a;
            },
            relativeTime: {
              future: 'mu %s',
              past: '%s',
              s: 'amasegonda',
              m: 'Umunota',
              mm: '%d iminota',
              h: 'isaha',
              hh: '%d amasaha',
              d: 'Umunsi',
              dd: '%d iminsi',
              M: 'ukwezi',
              MM: '%d amezi',
              y: 'umwaka',
              yy: '%d imyaka',
            },
            formats: {
              LT: 'HH:mm',
              LTS: 'HH:mm:ss',
              L: 'DD/MM/YYYY',
              LL: 'D MMMM YYYY',
              LLL: 'D MMMM YYYY HH:mm',
              LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
          };
        return u.default.locale(t, null, !0), t;
      })(t(32));
    },
  },
]);
//# sourceMappingURL=107.chunk.js.map
