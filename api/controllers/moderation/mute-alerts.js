module.exports = {
    friendlyName: 'Mute Alerts',

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

        platform: {
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/alerts/mute_volume';

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' sorry, but this is a moderator only command.');
        }

        let response = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST'});

        if (response.body.error) {
            return await env.res.chatbotResponse('Not sure what happened, but something went wrong. Check the request logs.');
        }

        return await env.res.chatbotResponse('I\'ve silenced your alerts. Don\'t forget they are muted!');
    }
};
