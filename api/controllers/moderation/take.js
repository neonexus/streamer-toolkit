module.exports = {
    friendlyName: 'Take tokens away',

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
        },

        tokens: {
            type: 'string' // so we can use a custom error message if it's not a number
        },

        recipient: {
            type: 'string'
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, type: inputs.type}),
            recipient = inputs.recipient.replace('@', ''),
            uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + recipient,
            tokens = inputs.tokens;

        if (viewer.type !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' this is a moderator only command.');
        }

        let currentTokens = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (currentTokens.body.err || !currentTokens.body.id) {
            return await env.res.chatbotResponse('I\'m sorry ' + await sails.helpers.getMentionName(viewer) + ', but the username ' + recipient + ' does not seem to exist... Try again?');
        }

        let loserTokens = currentTokens.body.points;

        if (isNaN(tokens)) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' it appears your syntax is incorrect. This is the correct format: !take @MENTION 10');
        }

        tokens = tokens * 1;

        if (tokens < 1) {
            return await env.res.chatbotResponse(await sails.helpers.getMentionName(viewer) + ' the number must be positive (it will be subtracted from the user\'s total).');
        }

        if (tokens > loserTokens) {
            loserTokens = 0;
        } else {
            loserTokens = loserTokens - tokens;
        }

        uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + recipient;

        await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: loserTokens}});

        return await env.res.chatbotResponse('OUCH! Sorry @' + recipient + ', but you just lost ' + tokens + ' tokens, bringing your total to ' + loserTokens + '. No soup for you!');
    }
};
