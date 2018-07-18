module.exports = {
    friendlyName: 'Get token',

    description: 'A very special route, used by StreamLabs only, as the redirect URI, which will allow you to retrieve the OAuth token required for StreamLabs interactions.',

    inputs: {
        code: {
            description: 'The OAuth code required to get the token.',
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let uri = sails.config.streamLabs.url + '/token';

        let response = await sails.helpers.makeExternalRequest.with({
            uri: uri,
            method: 'POST',
            body: {
                grant_type: 'authorization_code',
                client_id: sails.config.streamLabs.clientId,
                client_secret: sails.config.streamLabs.clientSecret,
                redirect_uri: sails.config.streamLabs.redirectUri,
                code: inputs.code
            },
            requestId: env.req.requestId
        });

        if (!response.body || !response.body.access_token) {
            return await env.res.chatbotResponse('Sorry, something went wrong. Check the request logs.');
        }

        return await env.res.view('pages/accessCode', {accessCode: response.body.access_token});
    }
};
