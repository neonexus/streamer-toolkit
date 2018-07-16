module.exports = {
    friendlyName: 'Give tokens to all viewers',

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
        },

        tokens: {
            type: 'number'
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform});

        if (viewer.platform !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' this is a moderator only command.');
        }

        if (!viewer.isMe && tokens < 1) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' nice try, but you can\'t take tokens from someone else (or use zero).');
        }

        await sails.helpers.makeExternalRequest.with({
            requestId: env.req.requestId,
            uri: sails.config.streamLabs.url + '/points/add_to_all',
            bearer: sails.config.streamLabs.token,
            body: {
                channel: sails.config.twitch.channel,
                value: inputs.tokens
            },
            method: 'POST'
        });

        return await env.res.chatbotResponse('LOOKOUT! Everyone currently watching just scored ' + inputs.tokens + ' tokens!');
    }
};
