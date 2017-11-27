var HttpsProxyAgent = require('https-proxy-agent')
const proxy = 'http://proxy.whu.edu:3128'
const agent = new HttpsProxyAgent(proxy)
const cleanData = require('./cleanData');
var google = require('googleapis');
var key = require('../auth/nodeAnalytics-b11967f9e384.json');
const VIEW_ID = 'ga:134328552';

exports.getAnalytics = function(cb) {
  google.options({ proxy, agent });
  var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
      ['https://www.googleapis.com/auth/analytics.readonly'], // an array of auth scopes
    null
  );

  function queryData(analytics, cb) {
    analytics.data.ga.get({
      'auth': jwtClient,
      'ids': VIEW_ID,
      'metrics': 'ga:pageviews',
      'dimensions': 'ga:pageTitle',
      'start-date': '7daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:pageviews',
      'max-results': 100
    }, function (err, response) {
      if (err) {
        console.log(err);
        return;
      }
      cleanData.clean(response, cb)
    });
  }
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }
    var analytics = google.analytics('v3');
    queryData(analytics, cb);
  });
}
