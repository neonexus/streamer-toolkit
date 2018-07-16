let CircularJSON = require('circular-json');

module.exports = function(sails){
    return {

        initialize: function(cb){
            // Assign this hook object to the `hook` var.
            // This allows us to add/modify values that users of the hook can retrieve.
            //hook = this;
            // Initialize a couple of values on the hook.
            //hook.numRequestsSeen = 0;
            //hook.numUnhandledRequestsSeen = 0;
            // Signal that initialization of this hook is complete
            // by calling the callback.
            return cb();
        },

        routes: {
            before: {
                '*': function(req, res, next){
                    if (req.method !== 'HEAD') {
                        let body = _.merge({}, req.body),
                            query = _.merge({}, req.query); // copy the object

                        if (!sails.config.logSensitiveData) {
                            // don't log plain-text passwords
                            if (body.password) {
                                body.password = '*******';
                            }

                            if (body.password2) {
                                body.password2 = '*******';
                            }

                            if (body.currentPassword) {
                                body.currentPassword = '*******';
                            }

                            if (body.newPassword) {
                                body.newPassword = '*******';
                            }

                            if (body.newPassword2) {
                                body.newPassword2 = '*******';
                            }

                            if (body.pass) {
                                body.pass = '*******';
                            }

                            if (query.securityToken) {
                                query.securityToken = '*******';
                            }
                        }

                        if (_.isObject(body)) {
                            body = CircularJSON.stringify(body);
                        }

                        RequestLog.create({
                            direction: 'inbound',
                            method: req.method,
                            path: req.path,
                            headers: CircularJSON.stringify(req.headers),
                            getParams: CircularJSON.stringify(query),
                            body: body
                        }).meta({fetch: true}).exec(function(err, newRequest){
                            if (err) {
                                //utils.createLog(req, err, 'Error creating request audit log');
                                console.log(err);

                                return next(); // don't stop the traffic if there is a problem
                            }

                            req.requestId = newRequest.id;
                            req._customStartTime = process.hrtime();

                            return next();
                        });
                    } else {
                        return next();
                    }
                }
            }
        }
    };
};
