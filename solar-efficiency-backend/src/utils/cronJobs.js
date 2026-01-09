const cron = require('node-cron');

const initCronJobs = () => {
  // schedule tasks
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily maintenance check');
  });
};

module.exports = initCronJobs;
