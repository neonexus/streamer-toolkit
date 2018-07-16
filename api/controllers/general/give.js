module.exports = {
    friendlyName: 'Give tokens',

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
        let viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + inputs.user,
            recipient = inputs.recipient.replace('@', ''),
            tokens = inputs.tokens;

        if (viewer.platform !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        let currentTokens = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (currentTokens.body.err) {
            console.log(currentTokens.err);
        }

        let senderTokens = currentTokens.body.points;

        if (isNaN(tokens)) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' it appears your syntax is incorrect. This is the correct format: !give @MENTION 10');
        }

        tokens = tokens * 1;

        if (!viewer.isMe && tokens > senderTokens) {
            return await env.res.chatbotResponse(
                await sails.helpers.getViewerMention(viewer) + ' you only have ' + senderTokens + ' tokens left. '
                + 'You don\'t have enough to give to give @' + recipient + ' ' + tokens + ' tokens.'
            );
        }

        if (tokens < 1) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' nice try, but you can\'t take tokens from someone else (or use zero).');
        }

        uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + recipient;

        currentTokens = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (currentTokens.body.error || !currentTokens.body.id) {
            return await env.res.chatbotResponse('I\'m sorry ' + await sails.helpers.getViewerMention(viewer) + ', but the username ' + recipient + ' does not seem to exist... Try again?');
        }

        if (!viewer.isMe) {
            senderTokens = senderTokens - tokens;

            uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + inputs.user;

            await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: senderTokens}});
        }

        let recipientTokens = currentTokens.body.points + tokens;

        uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + recipient;

        await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: recipientTokens}});

        return await env.res.chatbotResponse('WOW ' + await sails.helpers.getViewerMention(viewer) + ', that was mighty nice of you, giving @' + recipient + ' ' + inputs.tokens + ' tokens like that!');
    }
};
