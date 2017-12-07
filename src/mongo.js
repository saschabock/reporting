const { MongoClient } = require('mongodb');
const { format } = require('util');
const moment = require('moment');
const auth = require('../config/mongo.json');

const url = format(auth.url, auth.user, auth.password, auth.authMechanism);

exports.getDBData = (program, startdate, enddate, cb) => {
  const sdate = moment(startdate, 'YYYY-MM-DD').startOf('day');
  const edate = moment(enddate, 'YYYY-MM-DD').startOf('day');

  MongoClient.connect(url, (err, database) => {
    if (err) {
      return err;
    }
    const db = database;
    const collection = db.collection('leads');
    const query = {
      db_entered: {
        $gte: sdate.toDate(),
        $lt: edate.toDate(),
      },
      'programs.program': program,
    };
    return collection.find({ query }).toArray((error, items) => {
      if (error) {
        return error;
      }
      const result = items.map(item => ({
        name: item.personal_info.name,
        first_name: item.personal_info.first_name,
        email: item.personal_info.email,
      }));
      return cb(result);
    });
  });
};
