const analytics = require('./src/analytics');
const db = require('./src/mongo');
const moment = require('moment');

db.getDBData('mck_dig', (result) => {
  console.log(result);
});
// analytics.getData('mck_dig', (result) => {
//   console.log(result);
// });
