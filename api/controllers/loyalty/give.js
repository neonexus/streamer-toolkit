module.exports = {
    friendlyName: 'Give loyalty points',

    description: 'Allows the viewer to give loyalty points to another. Or, in the case of admins, just give loyalty points away.',

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
            description: 'Number of loyalty points to give',
            type: 'string' // so we can use a custom error message if it's not a number
        },

        recipient: {
            description: 'To whom we are sending loyalty points',
            type: 'string'
        }
    },

    exits: {
        success: {
            responseType: 'chatbotResponse'
        }
    },

    fn: async function(inputs, exits){
        const viewer = await sails.helpers.getViewer.with({req: this.req, userId: inputs.userId, user: inputs.user, platform: inputs.platform}),
            recipient = inputs.recipient.replace('@', '');

        let uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + inputs.user,
            points = inputs.points;

        if (viewer.platform !== 'twitch') {
            return exits.success('Sorry, this command currently only works on Twitch.');
        }

        let currentTokens = await sails.helpers.makeExternalRequest.with({requestId: this.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (currentTokens.body.err) {
            console.error(currentTokens.err);
        }

        let senderTokens = currentTokens.body.points;

        if (isNaN(points)) {
            return exits.success(await sails.helpers.getViewerMention(viewer) + ' it appears your syntax is incorrect. This is the correct format: !give @MENTION 10');
        }

        points = parseInt(points);

        if (!viewer.isMe && points > senderTokens) {
            return exits.success(
                await sails.helpers.getViewerMention(viewer) + ' you only have ' + senderTokens + ' ' + sails.config.streamLabs.loyaltyPointsLabel + ' left. '
                + 'You don\'t have enough to give @' + recipient + ' ' + points + ' ' + sails.config.streamLabs.loyaltyPointsLabel + '.'
            );
        }

        if (points < 1) {
            return exits.success(
                await sails.helpers.getViewerMention(viewer) + ' nice try, but you can\'t take ' + sails.config.streamLabs.loyaltyPointsLabel + ' from someone else (or use zero).'
            );
        }

        uri = sails.config.streamLabs.url + '/points?channel=' + sails.config.twitch.channel + '&username=' + recipient;

        currentTokens = await sails.helpers.makeExternalRequest.with({requestId: this.req.requestId, uri: uri, bearer: sails.config.streamLabs.token});

        if (currentTokens.body.error || !currentTokens.body.id) {
            return exits.success('I\'m sorry ' + await sails.helpers.getViewerMention(viewer) + ', but the username ' + recipient + ' does not seem to exist... Try again?');
        }

        if (!viewer.isMe) {
            senderTokens = senderTokens - points;

            uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + inputs.user;

            await sails.helpers.makeExternalRequest.with({
                requestId: this.req.requestId,
                uri: uri,
                bearer: sails.config.streamLabs.token,
                method: 'POST',
                body: {
                    points: senderTokens
                }
            });
        }

        const recipientTokens = currentTokens.body.points + points;

        uri = sails.config.streamLabs.url + '/points/user_point_edit?channel=' + sails.config.twitch.channel + '&username=' + recipient;

        await sails.helpers.makeExternalRequest.with({requestId: this.req.requestId, uri: uri, bearer: sails.config.streamLabs.token, method: 'POST', body: {points: recipientTokens}});

        return exits.success(
            'WOW ' + await sails.helpers.getViewerMention(viewer)
            + ', that was mighty nice of you, giving @' + recipient
            + ' ' + inputs.points
            + ' ' + sails.config.streamLabs.loyaltyPointsLabel
            + ' like that!'
        );
    }
};
