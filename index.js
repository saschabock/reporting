const analytics = require('./src/analytics');
const db = require('./src/mongo');
const ex = require('./src/excel');

db.getDBData('mck_dig', (result) => {
  console.log(result);
});
analytics.getData('mck_dig', (result) => {
  console.log(result);
});
ex.getParticipants('mck_dig', '1', (result) => {
  console.log(result);
});
