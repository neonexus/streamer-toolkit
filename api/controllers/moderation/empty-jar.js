module.exports = {
    friendlyName: 'Empty jar',

    description: 'Tell StreamLabs to empty the tip jar.',

    inputs: {
        user: {
            description: 'The plain username of the viewer running the command.',
            type: 'string',
            required: true
        },

        userId: {
            description: 'The platform-dependent user ID of the viewer running the command.',
            type: 'string',
            required: true
        },

        platform: {
            description: 'The platform that the command was issued from.',
            type: 'string',
            required: true
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/jar/empty';

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' sorry, but this is a moderator only command.');
        }

        let response = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST'});

        if (response.body.error) {
            return await env.res.chatbotResponse('Not sure what happened, but something went wrong. Check the request logs.');
        }

        return await env.res.chatbotResponse('The jar is now empty!');
    }
};
