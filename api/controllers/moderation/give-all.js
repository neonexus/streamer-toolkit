module.exports = {
    friendlyName: 'Give tokens to all viewers',

    description: 'Allows the streamer or mods to give all current viewers tokens. Cheers!',

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
        },

        tokens: {
            description: 'The number of tokens to give everyone.',
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
