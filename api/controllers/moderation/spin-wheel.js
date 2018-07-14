module.exports = {
    friendlyName: 'Spin Wheel',

    description: '',

    inputs: {
        user: {
            description: '',
            type: 'string',
            required: true
        },

        userId: {
            type: 'string',
            required: true
        },

        type: {
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, type: inputs.type}),
            uri = sails.config.streamLabs.url + '/wheel/spin';

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' sorry, but this is a moderator only command.');
        }

        let response = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST'});

        if (response.body.error) {
            return await env.res.chatbotResponse('Not sure what happened, but something went wrong. Check the request logs.');
        }

        return await env.res.chatbotResponse('Round and round it goes, where it stops, nobody knows!');
    }
};
