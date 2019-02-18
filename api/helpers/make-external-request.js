const request = require('request'),
    qs = require('querystring').parse,
    stringify = require('json-stringify-safe');

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
        const start = process.hrtime(),
            bleep = '******';

        let options = {
                json: inputs.json,
                gzip: true,
                method: inputs.method,
                uri: inputs.uri
            };

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
                    requestHeaders.authorization = bleep;
                }

                if (requestHeaders['Client-ID']) {
                    requestHeaders['Client-ID'] = bleep;
                }

                if (responseBody.access_token) {
                    responseBody.access_token = bleep;
                }

                if (responseBody.refresh_token) {
                    responseBody.refresh_token = bleep;
                }

                if (inputs.json) {
                    if (inputBody.client_id) {
                        inputBody.client_id = bleep;
                    }

                    if (inputBody.client_secret) {
                        inputBody.client_secret = bleep;
                    }
                }
            }

            let getParams = qs(resp.request.uri.query);

            if (!sails.config.allowExplicit && getParams.text && getParams.fill_text && getParams.add) {
                getParams.add = bleep;
            }

            await RequestLog.create({
                direction: 'outbound',
                parent: parent,
                method: resp.request.method,
                path: resp.request.uri.protocol + '//' + resp.request.uri.hostname + resp.request.uri.pathname,
                headers: stringify(requestHeaders),
                getParams: stringify(getParams),
                body: stringify(inputBody),
                responseCode: resp.statusCode,
                responseBody: stringify(responseBody),
                responseHeaders: stringify(resp.headers),
                responseTime: totalTime
            });

            return exits.success({err: err, resp: resp, body: body});
        });
    }
};
