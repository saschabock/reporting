const analytics = require('./src/analytics');

analytics.getData('mck_dig', (result) => {
  console.log(result);
});
