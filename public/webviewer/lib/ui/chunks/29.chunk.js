(window.webpackJsonp = window.webpackJsonp || []).push([
  [29],
  {
    1316: function (e, n, t) {
      e.exports = (function (e) {
        'use strict';
        var n = (function (e) {
            return e && 'object' == typeof e && 'default' in e ? e : { default: e };
          })(e),
          t = {
            s: 'ein paar Sekunden',
            m: ['eine Minute', 'einer Minute'],
            mm: '%d Minuten',
            h: ['eine Stunde', 'einer Stunde'],
            hh: '%d Stunden',
            d: ['ein Tag', 'einem Tag'],
            dd: ['%d Tage', '%d Tagen'],
            M: ['ein Monat', 'einem Monat'],
            MM: ['%d Monate', '%d Monaten'],
            y: ['ein Jahr', 'einem Jahr'],
            yy: ['%d Jahre', '%d Jahren'],
          };
        function a(e, n, a) {
          var i = t[a];
          return Array.isArray(i) && (i = i[n ? 0 : 1]), i.replace('%d', e);
        }
        var i = {
          name: 'de-at',
          weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
          weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
          weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
          months: 'Jänner_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
          monthsShort: 'Jän._Feb._März_Apr._Mai_Juni_Juli_Aug._Sep._Okt._Nov._Dez.'.split('_'),
          ordinal: function (e) {
            return e + '.';
          },
          weekStart: 1,
          formats: {
            LTS: 'HH:mm:ss',
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY HH:mm',
            LLLL: 'dddd, D. MMMM YYYY HH:mm',
          },
          relativeTime: {
            future: 'in %s',
            past: 'vor %s',
            s: a,
            m: a,
            mm: a,
            h: a,
            hh: a,
            d: a,
            dd: a,
            M: a,
            MM: a,
            y: a,
            yy: a,
          },
        };
        return n.default.locale(i, null, !0), i;
      })(t(32));
    },
  },
]);
//# sourceMappingURL=29.chunk.js.map
