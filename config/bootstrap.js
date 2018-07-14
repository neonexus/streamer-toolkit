/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also do this by creating a hook.
 *
 * For more information on bootstrapping your app, check out:
 * https://sailsjs.com/config/bootstrap
 */

let moment = require('moment-timezone');

module.exports.bootstrap = async function(done){
    let CronJob = require('cron').CronJob,
        job = new CronJob({
            cronTime: '30 58 * * * *',
            onTick: async function(){
                await RequestLog.destroy({createdAt: {'<': moment.tz(sails.config.tz).subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss')}});
            },
            start: false,
            timeZone: sails.config.tz
        });
    job.start();


    // Don't forget to trigger `done()` when this bootstrap function's logic is finished.
    // (otherwise your server will never lift, since it's waiting on the bootstrap)
    return done();

};
