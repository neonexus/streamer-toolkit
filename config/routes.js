/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


    //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': {
        view: 'pages/homepage'
    },

    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/


    //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
    //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
    //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

    'GET /streaming/dupeMe': {action: 'dupes/dupe-me', skipAssets: true},
    'GET /streaming/undupeMe': {action: 'dupes/undupe-me', skipAssets: true},
    'GET /streaming/nextDupe': {action: 'dupes/next-dupe', skipAssets: true},
    'GET /streaming/startDupes': {action: 'dupes/start-dupes', skipAssets: true},
    'GET /streaming/stopDupes': {action: 'dupes/stop-dupes', skipAssets: true},

    'GET /streaming/tokens': {action: 'general/tokens', skipAssets: true},
    'GET /streaming/joke': {action: 'general/joke', skipAssets: true},
    'GET /streaming/dice': {action: 'general/dice', skipAssets: true},
    'GET /streaming/give': {action: 'general/give', skipAssets: true},
    'GET /streaming/take': {action: 'moderation/take', skipAssets: true},
    'GET /streaming/giveAll': {action: 'moderation/give-all', skipAssets: true},

    'GET /streaming/credits': {action: 'moderation/credits', skipAssets: true},
    'GET /streaming/emptyJar': {action: 'moderation/empty-jar', skipAssets: true},
    'GET /streaming/spinWheel': {action: 'moderation/spin-wheel', skipAssets: true},

    'GET /streaming/muteAlerts': {action: 'moderation/mute-alerts', skipAssets: true},
    'GET /streaming/unmuteAlerts': {action: 'moderation/unmute-alerts', skipAssets: true},
    'GET /streaming/testAlert': {action: 'moderation/test-alert', skipAssets: true},

    'GET /streaming/authUrl': {action: 'special/get-auth-url', skipAssets: true},


    //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
    //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
    //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝

    'GET /streaming/streamlabsCode': {action: 'special/get-streamlabs-token', skipAssets: true}


    //  ╔╦╗╦╔═╗╔═╗
    //  ║║║║╚═╗║
    //  ╩ ╩╩╚═╝╚═╝


};
