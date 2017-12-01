const { MongoClient } = require('mongodb');
const { format } = require('util');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const auth = require('../auth/mongo.json');

const url = format('mongodb://%s:%s@localhost:27017/leadDB?authMechanism=%s', ...auth);

exports.getDBData = (startdate, enddate, program) => {
  MongoClient.connect(url, (err, database) => {
    if (err) {
      return console.log(err);
    }
    const db = database;
    const collection = db.collection('leads');
    const query = {
      db_entered: {
        $gte: new Date(startdate),
        $lt: new Date(enddate),
      },
      'programs.program': program,
    };
    return collection.find(query).toArray((error, items) => {
      if (error) {
        return console.log(err);
      }
      console.log(items);
      return items;
    });
  });
};
