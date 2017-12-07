const fs = require('fs');
// const http = require('http');
const https = require('https');
const express = require('express');
const when = require('when');
const bodyParser = require('body-parser');

const analytics = require('./src/analytics');
const db = require('./src/mongo');
const ex = require('./src/excel');

const privateKey = fs.readFileSync('sslcert/whu_wildcard2017.key', 'utf8');
const certificate = fs.readFileSync('sslcert/whu_wildcard2017.cer', 'utf8');

const credentials = { key: privateKey, cert: certificate };
const app = express();

// const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const getReport = (program, run, startdate, enddate, cb) => {
  const response = {};
  const leads = when.promise((resolve) => {
    db.getDBData(program, startdate, enddate, (result) => {
      console.log(`Fetched leads: ${result}`);
      resolve(result);
    });
  })
    .then((val) => {
      response.leads = val;
    });
  const website = when.promise((resolve) => {
    analytics.getData(program, startdate, enddate, (result) => {
      console.log(`Fetched website: ${result}`);
      resolve(result);
    });
  })
    .then((val) => {
      response.website = val;
    });
  const applications = when.promise((resolve) => {
    ex.getParticipants(program, run, (result) => {
      console.log(`Fetched applications: ${result}`);
      resolve(result);
    });
  })
    .then((val) => {
      response.applications = val;
    });

  when.all([leads, website, applications])
    .then(() => {
      cb(response);
    });
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the reporting API');
});
app.post('/reporting', (req, res) => {
  console.log(req.body);
  const {
    program,
    run,
    startdate,
    enddate,
  } = req.body;
  getReport(program, run, startdate, enddate, (result) => {
    res.send(result);
  });
});

// httpServer.listen(1234);
httpsServer.listen(1234, () => {
  console.log('Listening on https');
});
