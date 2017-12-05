const { MongoClient } = require('mongodb');
const { format } = require('util');
const moment = require('moment');
const auth = require('../config/mongo.json');

const url = format(auth.url, auth.user, auth.password, auth.authMechanism);

exports.getDBData = (program, cb) => {
  const today = moment().startOf('day');
  const lastWeek = moment(today).subtract(7, 'days');

  MongoClient.connect(url, (err, database) => {
    if (err) {
      return err;
    }
    const db = database;
    const collection = db.collection('leads');
    const query = {
      db_entered: {
        $gte: lastWeek.toDate(),
        $lt: today.toDate(),
      },
      'programs.program': program,
    };
    return collection.find({ query }).toArray((error, items) => {
      if (error) {
        return error;
      }
      return cb(items);
    });
  });
};
