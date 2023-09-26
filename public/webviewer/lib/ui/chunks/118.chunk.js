(window.webpackJsonp = window.webpackJsonp || []).push([
  [118],
  {
    1405: function (e, a, t) {
      e.exports = (function (e) {
        'use strict';
        var a = (function (e) {
            return e && 'object' == typeof e && 'default' in e ? e : { default: e };
          })(e),
          t = {
            words: {
              m: ['jedan minut', 'jednog minuta'],
              mm: ['%d minut', '%d minuta', '%d minuta'],
              h: ['jedan sat', 'jednog sata'],
              hh: ['%d sat', '%d sata', '%d sati'],
              d: ['jedan dan', 'jednog dana'],
              dd: ['%d dan', '%d dana', '%d dana'],
              M: ['jedan mesec', 'jednog meseca'],
              MM: ['%d mesec', '%d meseca', '%d meseci'],
              y: ['jednu godinu', 'jedne godine'],
              yy: ['%d godinu', '%d godine', '%d godina'],
            },
            correctGrammarCase: function (e, a) {
              return e % 10 >= 1 && e % 10 <= 4 && (e % 100 < 10 || e % 100 >= 20) ? (e % 10 == 1 ? a[0] : a[1]) : a[2];
            },
            relativeTimeFormatter: function (e, a, r, n) {
              var d = t.words[r];
              if (1 === r.length) return 'y' === r && a ? 'jedna godina' : n || a ? d[0] : d[1];
              var i = t.correctGrammarCase(e, d);
              return 'yy' === r && a && '%d godinu' === i ? e + ' godina' : i.replace('%d', e);
            },
          },
          r = {
            name: 'sr',
            weekdays: 'Nedelja_Ponedeljak_Utorak_Sreda_Četvrtak_Petak_Subota'.split('_'),
            weekdaysShort: 'Ned._Pon._Uto._Sre._Čet._Pet._Sub.'.split('_'),
            weekdaysMin: 'ne_po_ut_sr_če_pe_su'.split('_'),
            months: 'Januar_Februar_Mart_April_Maj_Jun_Jul_Avgust_Septembar_Oktobar_Novembar_Decembar'.split('_'),
            monthsShort: 'Jan._Feb._Mar._Apr._Maj_Jun_Jul_Avg._Sep._Okt._Nov._Dec.'.split('_'),
            weekStart: 1,
            relativeTime: {
              future: 'za %s',
              past: 'pre %s',
              s: 'nekoliko sekundi',
              m: t.relativeTimeFormatter,
              mm: t.relativeTimeFormatter,
              h: t.relativeTimeFormatter,
              hh: t.relativeTimeFormatter,
              d: t.relativeTimeFormatter,
              dd: t.relativeTimeFormatter,
              M: t.relativeTimeFormatter,
              MM: t.relativeTimeFormatter,
              y: t.relativeTimeFormatter,
              yy: t.relativeTimeFormatter,
            },
            ordinal: function (e) {
              return e + '.';
            },
            formats: {
              LT: 'H:mm',
              LTS: 'H:mm:ss',
              L: 'D. M. YYYY.',
              LL: 'D. MMMM YYYY.',
              LLL: 'D. MMMM YYYY. H:mm',
              LLLL: 'dddd, D. MMMM YYYY. H:mm',
            },
          };
        return a.default.locale(r, null, !0), r;
      })(t(32));
    },
  },
]);
//# sourceMappingURL=118.chunk.js.map
