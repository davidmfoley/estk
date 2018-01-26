const microtime = require('microtime');

module.exports = {
  now: function() {
    var microNow = microtime.now();
    var now = new Date(microNow / 1000);
    return now.toISOString().replace('Z', ('' + microNow).slice(-3) + 'Z');
  },

  // turns a postgres date string into a JS date
  parse: function(s) {
    if (! s) return '';
    var dateAndTimeToSecond;

    var pieces;
    var fraction;
    var tz;
    var tzIndicator;

    if (s.indexOf('.') === -1) {
      dateAndTimeToSecond = s.slice(0,19);
      tz = s.slice(20);
      tzIndicator = s[19] || 'Z';
      fraction = '000';
    }
    else {
      pieces = s.split('.');
      dateAndTimeToSecond = pieces[0];
      var right = pieces[1].split(/[\+Z\-]/);
      fraction = right[0];
      tz = right[1] || '';
      tzIndicator = pieces[1][fraction.length] || 'Z';


      // strip to milliseconds
      if (fraction.length > 3) {
        fraction = fraction.slice(0, 3);
      }
    }

    if (tzIndicator !== 'Z' && tz.indexOf(':') === -1) {
      tz += ':00';
    }
    // replace space with ISO T separator
    dateAndTimeToSecond = dateAndTimeToSecond.replace(' ', 'T');

    var dateString = dateAndTimeToSecond + '.' + fraction + tzIndicator + tz;
    return new Date(dateString);
  },
};
