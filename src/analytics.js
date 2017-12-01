const HttpsProxyAgent = require('https-proxy-agent');
const google = require('googleapis');
const key = require('../auth/nodeAnalytics-b11967f9e384.json');

const proxy = 'http://proxy.whu.edu:3128';
const agent = new HttpsProxyAgent(proxy);
const VIEW_ID = 'ga:134328552';

exports.getAnalytics = (metrics, dimensions, cb) => {
  google.options({ proxy, agent });
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'], // an array of auth scopes
    null,
  );

  const queryData = (analytics) => {
    analytics.data.ga.get({
      auth: jwtClient,
      ids: VIEW_ID,
      metrics: 'ga:pageviews',
      dimensions: 'ga:pageTitle',
      'start-date': '7daysAgo',
      'end-date': 'yesterday',
      sort: '-ga:pageviews',
      maxresults: 100,
    }, (err, response) => {
      if (err) {
        console.log(err);
        return;
      }
      cleanData.clean(response, cb)
    });
  };

  jwtClient.authorize((err) => {
    if (err) {
      console.log(err);
      return;
    }
    const analytics = google.analytics('v3');
    queryData(analytics, cb);
  });
};
