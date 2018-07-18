let request = require('request'),
    qs = require('querystring').parse,
    CircularJSON = require('circular-json');

module.exports = {
    friendlyName: 'Make external request',

    description: 'A wrapper tool, to allow for easy logging of external requests.',

    inputs: {
        method: {
            type: 'string',
            defaultsTo: 'GET'
        },

        uri: {
            type: 'string',
            required: true
        },

        bearer: {
            type: 'string'
        },

        clientId: {
            type: 'string'
        },

        json: {
            type: 'boolean',
            defaultsTo: true
        },

        body: {
            type: 'ref'
        },

        requestId: { // the parent request triggering the call
            type: 'number'
        }
    },

    exits: {
        success: {}
    },

    fn: async function(inputs, exits){
        let options = {
                json: inputs.json,
                gzip: true,
                method: inputs.method,
                uri: inputs.uri
            },
            start = process.hrtime();

        if (inputs.bearer) {
            options.auth = {bearer: inputs.bearer};
        }

        if (inputs.clientId) {
            options.headers = {
                'Client-ID': inputs.clientId
            }
        }

        if (inputs.body) {
            options.body = inputs.body;
        }

        request(options, async function(err, resp, body){
            if (err) {
                console.log(err);
            }

            let requestHeaders = resp.request.headers,
                inputBody = _.merge({}, inputs.body || {}),
                responseBody = _.merge({}, (!inputs.json) ? {plainString: body} : body),
                diff = process.hrtime(start),
                time = diff[0] * 1e3 + diff[1] * 1e-6,
                totalTime = time.toFixed(4) + 'ms',
                parent = inputs.requestId || null;

            if (!sails.config.logSensitiveData) {
                if (requestHeaders.authorization) {
                    requestHeaders.authorization = '******';
                }

                if (requestHeaders['Client-ID']) {
                    requestHeaders['Client-ID'] = '*******'
                }

                if (responseBody.access_token) {
                    responseBody.access_token = '*******';
                }

                if (responseBody.refresh_token) {
                    responseBody.refresh_token = '*******';
                }

                if (inputs.json) {
                    if (inputBody.client_id) {
                        inputBody.client_id = '*******';
                    }

                    if (inputBody.client_secret) {
                        inputBody.client_secret = '*******';
                    }
                }
            }

            await RequestLog.create({
                direction: 'outbound',
                parent: parent,
                method: resp.request.method,
                path: resp.request.uri.protocol + '//' + resp.request.uri.hostname + resp.request.uri.pathname,
                headers: CircularJSON.stringify(requestHeaders),
                getParams: CircularJSON.stringify(qs(resp.request.uri.query)),
                body: CircularJSON.stringify(inputBody),
                responseCode: resp.statusCode,
                responseBody: CircularJSON.stringify(responseBody),
                responseHeaders: CircularJSON.stringify(resp.headers),
                responseTime: totalTime
            });

            return exits.success({err: err, resp: resp, body: body});
        });
    }
};
