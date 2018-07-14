/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

    /****************************************************************************
     *                                                                           *
     * Sails/Express middleware to run for every HTTP request.                   *
     * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
     *                                                                           *
     * https://sailsjs.com/documentation/concepts/middleware                     *
     *                                                                           *
     ****************************************************************************/

    middleware: {

        /***************************************************************************
         *                                                                          *
         * The order in which middleware should be run for HTTP requests.           *
         * (This Sails app's routes are handled by the "router" middleware below.)  *
         *                                                                          *
         ***************************************************************************/

        order: [
            // 'cookieParser',
            // 'session',
            // 'bodyParser',
            // 'compress',
            // 'poweredBy',
            // 'router',
            // 'www',
            // 'favicon',

            'customFavicon',
            'cookieParser',
            'session',
            'bodyParser',
            'compress',
            'customPoweredBy',
            'disableBrowserCache',
            'router',
            'www'
        ],

        customPoweredBy: function(req, res, next){
            sails.hooks.http.app.disable('x-powered-by');
            res.set('X-Powered-By', 'Magic');
            res.set('X-Brought-To-You-By', 'The number 42');

            return next();
        },

        disableBrowserCache: function(req, res, next){
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');

            return next();
        },

        customFavicon: function(req, res, next){
            let toServeFavicon = require('serve-favicon'),
                pathToDefaultFavicon = require('path').resolve(__dirname, '../assets/android-chrome-256x256.png');

            return toServeFavicon(pathToDefaultFavicon)(req, res, next);
        }


        /***************************************************************************
         *                                                                          *
         * The body parser that will handle incoming multipart HTTP requests.       *
         *                                                                          *
         * https://sailsjs.com/config/http#?customizing-the-body-parser             *
         *                                                                          *
         ***************************************************************************/

        // bodyParser: (function _configureBodyParser(){
        //   var skipper = require('skipper');
        //   var middlewareFn = skipper({ strict: true });
        //   return middlewareFn;
        // })(),

    },

};
