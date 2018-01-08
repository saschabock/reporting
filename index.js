const fs = require('fs');
// const http = require('http');
const https = require('https');
const express = require('express');
const when = require('when');
const bodyParser = require('body-parser');
const _ = require('lodash');
const cors = require('cors');

const analytics = require('./src/analytics');
const db = require('./src/mongo');
const ex = require('./src/excel');
const loc = require('./config/locations.json');
const programs = require('./config/program_mapping.json');

const privateKey = fs.readFileSync(loc.ssl.key, 'utf8');
const certificate = fs.readFileSync(loc.ssl.cert, 'utf8');

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
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the reporting API');
});
app.post('/reporting', (req, res) => {
  const {
    program,
    run,
    startdate,
    enddate,
    secret,
  } = req.body;
  const list = _.keyBy(programs, 'id');
  if (secret === list[program].secret || secret === loc.master_secret) {
    getReport(program, run, startdate, enddate, (result) => {
      res.send(result);
    });
  } else {
    res.status(401).send({ error: 'The request has not been applied because it lacks valid authentication credentials for the target resource.' });
  }
});

// httpServer.listen(1234);
httpsServer.listen(1235, () => {
  console.log('Listening on https');
});
