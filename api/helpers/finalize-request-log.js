let CircularJSON = require('circular-json');

module.exports = {

    friendlyName: 'Finalize request log',

    description: '',

    inputs: {
        req: {
            type: 'ref',
            description: 'The current incoming request (req).',
            required: true
        },

        res: {
            type: 'ref',
            description: 'The current outgoing response (res).',
            required: true
        },

        body: {
            type: 'ref',
            description: '',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function(inputs, exits){
        if (inputs.req.requestId) {
            let out = _.merge({}, inputs.body),
                headers = _.merge({}, inputs.res._headers); // copy the object

            if (!sails.config.logSensitiveData) {
                if (out._csrf) {
                    out._csrf = '*******';
                }

                if (out.token) {
                    out.token = '*******';
                }

                if (out.access_token) {
                    out.access_token = '*******';
                }

                if (out.refresh_token) {
                    out.refresh_token = '*******';
                }
            }

            if (_.isObject(out)) {
                out = CircularJSON.stringify(out);
            }

            let diff = process.hrtime(inputs.req._customStartTime),
                time = diff[0] * 1e3 + diff[1] * 1e-6,
                totalTime = time.toFixed(4) + 'ms',
                log = {
                    responseCode: inputs.res.statusCode,
                    responseBody: out,
                    responseHeaders: CircularJSON.stringify(headers),
                    responseTime: totalTime
                };

            if (inputs.req.viewer) {
                log.viewer = inputs.req.viewer.id;
            }

            RequestLog.update(inputs.req.requestId, log, function(err){
                if (err) {
                    //utils.createLog(req, err, 'Error updating request audit log');
                    console.log(err);
                }
            });
        }

        // All done.
        return exits.success();
    }
};

