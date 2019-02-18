module.exports = {
    friendlyName: 'Take loyalty points away',

    description: 'Moderator only command to remove loyalty points from a particular viewer.',

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

        points: {
            description: 'The number of loyalty points to remove from the viewer.',
            type: 'string' // so we can use a custom error message if it's not a number
        },

        recipient: {
            description: 'The viewer to remove loyalty points from.',
            type: 'string'
        }
    },

    exits: {
        success: {}
    },

    fn: async function (inputs, exits, env) {
        const viewer = await sails.helpers.getViewer.with({req: env.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            recipient = inputs.recipient.replace('@', '');
        let uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + recipient,
            points = inputs.points;

        if (viewer.platform !== 'twitch') {
            return await env.res.chatbotResponse('Sorry, this command currently only works on Twitch.');
        }

        if (!viewer.isMe && !viewer.isMod) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' this is a moderator only command.');
        }

        let currentTokens = await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (currentTokens.body.err || !currentTokens.body.id) {
            return await env.res.chatbotResponse('I\'m sorry ' + await sails.helpers.getViewerMention(viewer) + ', but the username ' + recipient + ' does not seem to exist... Try again?');
        }

        let loserTokens = currentTokens.body.points;

        if (isNaN(points)) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' it appears your syntax is incorrect. This is the correct format: !take @MENTION 10');
        }

        points = parseInt(points);

        if (points < 1) {
            return await env.res.chatbotResponse(await sails.helpers.getViewerMention(viewer) + ' the number must be positive (it will be subtracted from the user\'s total).');
        }

        if (points > loserTokens) {
            loserTokens = 0;
        } else {
            loserTokens = loserTokens - points;
        }

        uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + recipient;

        await sails.helpers.makeExternalRequest.with({requestId: env.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: loserTokens}});

        return await env.res.chatbotResponse(
            'OUCH! Sorry @' + recipient + ', but you just lost ' + points + ' ' + sails.config.streamLabs.loyaltyPointsLabel + ', bringing your total to ' + loserTokens + '. No soup for you!'
        );
    }
};
